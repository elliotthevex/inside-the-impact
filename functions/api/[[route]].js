/* Inside the Impact: Corner Pass accounts API.
 *
 * A Cloudflare Pages Function. Pages runs it for every request under /api/;
 * everything else on the site stays static. It needs a D1 database bound to
 * the Pages project under the name DB (see tools/accounts/SETUP.md). Without
 * that binding every route answers { accounts: false } and the game offers
 * guest play only, so the site never shows a sign-in that cannot work.
 *
 *   GET  /api/me                 { accounts, corner: { name, rev } | null }
 *   GET  /api/name?n=NAME        { ok, free, why }      is a corner name usable?
 *   POST /api/signup  { name, password, keep, profile }  -> { corner, rev }
 *   POST /api/signin  { name, password, keep }           -> { corner, rev, profile }
 *   POST /api/signout {}
 *   GET  /api/profile            { rev, profile }
 *   PUT  /api/profile { profile, base, name, dev } -> { rev }
 *        409 with the stored { rev, profile } when another computer saved
 *        since `base`, so a stale tab can never overwrite newer progress
 *   POST /api/delete  { password }  removes the corner and its sessions
 *
 * What it stores: the corner name, a salted PBKDF2 hash of the password,
 * the game's saved progress (the same JSON the game keeps in localStorage
 * under iti.profile.v2) and session tokens, hashed. No email, no real name.
 * Failed sign-ins are counted per name and per network (the IP is hashed
 * before it is stored) and slow guessing down with a growing pause.
 */

const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;
const RESERVED = new Set(["admin", "administrator", "moderator", "mod", "owner", "staff", "support",
  "system", "root", "guest", "null", "undefined", "api", "corner", "referee_official"]);
const PW_MIN = 8, PW_MAX = 200;
/* Workers' WebCrypto refuses PBKDF2 above 100000 iterations. The count is
   written into every hash, so it can be lowered later (env PW_ITER) without
   locking anyone out. */
const PW_ITER = 100000;
const KEEP_SECS = 30 * 86400, SHORT_SECS = 12 * 3600;
const PROFILE_MAX = 65536, BODY_MAX = PROFILE_MAX + 4096;
const COOKIE = "iti_corner";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS corners (
     id INTEGER PRIMARY KEY,
     name TEXT NOT NULL,
     name_key TEXT NOT NULL UNIQUE,
     pw TEXT NOT NULL,
     profile TEXT,
     rev INTEGER NOT NULL DEFAULT 0,
     dev TEXT,
     created INTEGER NOT NULL,
     updated INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token TEXT PRIMARY KEY,
     corner_id INTEGER NOT NULL,
     expires INTEGER NOT NULL,
     created INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_corner ON sessions (corner_id)`,
  `CREATE TABLE IF NOT EXISTS tries (
     k TEXT PRIMARY KEY,
     n INTEGER NOT NULL,
     first INTEGER NOT NULL,
     until INTEGER NOT NULL DEFAULT 0,
     locks INTEGER NOT NULL DEFAULT 0)`,
];

/* Limits: [max tries, window seconds, first pause seconds, longest pause].
   Each pause doubles the last one up to the longest, and the doubling is
   forgotten after a quiet day. A whole school can share one address, so
   the per-network limits are high and their pauses short: they only stop
   a script spraying guesses, and cannot shut a school out for long. The
   per-name limit is the one a guesser runs into. Every try is counted
   before the password is checked, so parallel requests can't slip past. */
const LIMIT = {
  nameNet: [5, 900, 60, 3600],    /* one corner name from one network: "4 tries left", then 60 s */
  name:    [50, 3600, 900, 3600], /* one corner name from anywhere */
  net:     [600, 900, 60, 300],   /* one network, any names */
  signup:  [200, 3600, 300, 900], /* new corners from one network */
  check:   [600, 600, 60, 120],   /* name availability checks from one network */
};

let ready = null;
function setup(db) {
  if (!ready) ready = db.batch(SCHEMA.map((s) => db.prepare(s))).catch((e) => { ready = null; throw e; });
  return ready;
}

const enc = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (u8) => b64(u8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

function respond(status, data, extra) {
  const headers = [["Content-Type", "application/json; charset=utf-8"], ["Cache-Control", "no-store"]];
  if (extra) headers.push(...extra);
  return new Response(JSON.stringify(data), { status, headers });
}
const ok = (data, extra) => respond(200, data, extra);
const fail = (status, error, more) => respond(status, Object.assign({ error }, more || {}));

async function pbkdf2(pw, salt, iter) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw.normalize("NFC")), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256));
}
async function hashPw(pw, env) {
  const iter = Math.min(PW_ITER, Math.max(10000, Number(env.PW_ITER) || PW_ITER));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${iter}$${b64(salt)}$${b64(await pbkdf2(pw, salt, iter))}`;
}
/* A stored hash that matches nothing, so a missing corner costs the same
   time as a wrong password and the timing does not say which it was. */
const DUMMY = `pbkdf2-sha256$${PW_ITER}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;
async function checkPw(pw, stored) {
  const [kind, iter, salt, want] = String(stored).split("$");
  if (kind !== "pbkdf2-sha256") return false;
  const got = await pbkdf2(pw, unb64(salt), Number(iter)), w = unb64(want);
  let d = got.length ^ w.length;
  for (let i = 0; i < got.length; i++) d |= got[i] ^ (w[i] || 0);
  return d === 0;
}

function nameProblem(name) {
  if (typeof name !== "string" || !name) return "Pick a corner name.";
  if (name.length < 3) return "Use at least 3 characters.";
  if (name.length > 16) return "Use 16 characters or fewer.";
  if (!NAME_RE.test(name)) return "Use letters, numbers or _ only.";
  if (RESERVED.has(name.toLowerCase())) return "That name is kept for the site. Pick another.";
  return "";
}
function pwProblem(pw, name) {
  if (typeof pw !== "string" || pw.length < PW_MIN) return `Use at least ${PW_MIN} characters.`;
  if (pw.length > PW_MAX) return `Use ${PW_MAX} characters or fewer.`;
  if (name && pw.toLowerCase() === String(name).toLowerCase()) return "Don't use your corner name as the password.";
  return "";
}

function readCookie(request, name) {
  const all = request.headers.get("Cookie") || "";
  for (const part of all.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}
function sessionCookie(token, keep, url) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/api/; HttpOnly; SameSite=Lax${secure}${keep ? "; Max-Age=" + KEEP_SECS : ""}`;
}
function clearCookie(url) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=; Path=/api/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}

async function readJson(request) {
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > BODY_MAX) return { tooBig: true };
  const text = await request.text();
  if (text.length > BODY_MAX) return { tooBig: true };
  try {
    const v = JSON.parse(text || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? { v } : { bad: true };
  } catch (e) { return { bad: true }; }
}
/* A save is game numbers: counts, levels, timestamps, flags, nested a few
   levels deep. Anything else (markup in a string, odd keys) is refused, so
   a hand-made save can't carry script into the next person's screen. */
const KEY_RE = /^[A-Za-z0-9_]{1,40}$/, STR_RE = /^[A-Za-z0-9 _.:+-]{0,40}$/;
function plainSave(v, depth) {
  if (v === null || typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") return STR_RE.test(v);
  if (typeof v !== "object" || depth > 4) return false;
  if (Array.isArray(v)) return v.length <= 200 && v.every((x) => plainSave(x, depth + 1));
  const keys = Object.keys(v);
  return keys.length <= 200 && keys.every((k) => KEY_RE.test(k) && plainSave(v[k], depth + 1));
}
function cleanProfile(p) {
  if (p === undefined || p === null) return { text: null };
  if (typeof p !== "object" || Array.isArray(p) || !plainSave(p, 0)) return { bad: true };
  const text = JSON.stringify(p);
  if (text.length > PROFILE_MAX) return { tooBig: true };
  return { text };
}

/* ── slowing guessers down ──
   charge() counts a try in one statement (SQLite runs writes one at a
   time), so a burst of parallel requests is counted in full. A key that is
   paused is not counted again. A finished pause or window starts afresh. */
const CHARGE = `INSERT INTO tries (k, n, first, until, locks) VALUES (?1, 1, ?2, 0, 0)
  ON CONFLICT (k) DO UPDATE SET
    locks = CASE WHEN ?2 - MAX(first, until) > 86400 THEN 0 ELSE locks END,
    n     = CASE WHEN until > ?2 THEN n  WHEN until > 0 OR ?2 - first >= ?3 THEN 1  ELSE n + 1 END,
    first = CASE WHEN until > ?2 THEN first WHEN until > 0 OR ?2 - first >= ?3 THEN ?2 ELSE first END,
    until = CASE WHEN until > ?2 THEN until ELSE 0 END
  RETURNING n, until, locks`;
async function charge(db, k, lim, t) {
  const r = await db.prepare(CHARGE).bind(k, t, lim[1]).first();
  if (r.until > t) return { wait: r.until - t };
  if (r.n > lim[0]) return { wait: await pause(db, k, lim, r.locks, t) };
  return { n: r.n, left: lim[0] - r.n, full: r.n >= lim[0], locks: r.locks };
}
async function pause(db, k, lim, locks, t) {
  const secs = Math.min(lim[2] * 2 ** locks, lim[3]);
  await db.prepare("UPDATE tries SET n = 0, first = ?, until = ?, locks = locks + 1 WHERE k = ?").bind(t, t + secs, k).run();
  return secs;
}
async function refund(db, keys) {
  for (const k of keys) await db.prepare("UPDATE tries SET n = MAX(n - 1, 0) WHERE k = ? AND until = 0").bind(k).run();
}
/* Count one try against each [key, limit]. Stops at the first paused key
   and gives back the tries already counted, so a refused try costs nothing. */
async function chargeAll(db, list, t) {
  const done = [];
  for (const [k, lim] of list) {
    const c = await charge(db, k, lim, t);
    if (c.wait) { await refund(db, done.map((d) => d.k)); return { wait: c.wait }; }
    done.push({ k, lim, c });
  }
  return { done };
}
/* After a miss: pause any key that has used its last try. */
async function missed(db, done, t) {
  let wait = 0;
  for (const d of done) if (d.c.full) wait = Math.max(wait, await pause(db, d.k, d.lim, d.c.locks, t));
  return wait;
}

async function who(db, request, t) {
  const tok = readCookie(request, COOKIE);
  if (!tok || tok.length > 100) return null;
  return db.prepare(`SELECT c.id, c.name, c.rev, s.token FROM sessions s JOIN corners c ON c.id = s.corner_id
      WHERE s.token = ? AND s.expires > ?`).bind(await sha256(tok), t).first();
}
async function startSession(db, cornerId, keep, url, t) {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  await db.prepare("INSERT INTO sessions (token, corner_id, expires, created) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), cornerId, t + (keep ? KEEP_SECS : SHORT_SECS), t).run();
  return ["Set-Cookie", sessionCookie(token, keep, url)];
}
async function tidy(db, t) {
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires < ?").bind(t),
    db.prepare("DELETE FROM tries WHERE until < ? AND first < ?").bind(t, t - 86400),
  ]);
}

/* ── routes ── */
async function me(db, request, t) {
  const c = await who(db, request, t);
  return ok({ accounts: true, corner: c ? { name: c.name, rev: c.rev } : null });
}

async function nameCheck(db, url, net, t) {
  const c = await charge(db, "check:" + net, LIMIT.check, t);
  if (c.wait) return fail(429, "Slow down a little.", { wait: c.wait });
  const name = (url.searchParams.get("n") || "").trim();
  const why = nameProblem(name);
  if (why) return ok({ ok: false, free: false, why });
  const r = await db.prepare("SELECT 1 AS x FROM corners WHERE name_key = ?").bind(name.toLowerCase()).first();
  return ok({ ok: true, free: !r, why: r ? "That corner name is taken." : "" });
}

async function signup(db, env, request, url, net, t) {
  const body = await readJson(request);
  if (body.tooBig) return fail(413, "That save is too large to keep online.");
  if (body.bad) return fail(400, "That request didn't make sense. Reload the page and try again.");
  const { name, password, keep, profile } = body.v;
  const nameWhy = nameProblem(name);
  if (nameWhy) return fail(400, nameWhy, { field: "name" });
  const pwWhy = pwProblem(password, name);
  if (pwWhy) return fail(400, pwWhy, { field: "password" });
  const prof = cleanProfile(profile);
  if (prof.bad) return fail(400, "That save didn't look like game progress.");
  if (prof.tooBig) return fail(413, "That save is too large to keep online.");
  const kUp = "signup:" + net;
  const c = await charge(db, kUp, LIMIT.signup, t);
  if (c.wait) return fail(429, "Too many new corners from this network. Try again later.", { wait: c.wait });
  const pw = await hashPw(password, env);
  const dev = cleanDev(body.v.dev);
  let id;
  try {
    const r = await db.prepare(`INSERT INTO corners (name, name_key, pw, profile, rev, dev, created, updated)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?) RETURNING id`).bind(name, name.toLowerCase(), pw, prof.text, dev, t, t).first();
    id = r.id;
  } catch (e) {
    await refund(db, [kUp]);
    if (/UNIQUE/i.test(String(e && e.message))) return fail(409, "That corner name is taken.", { field: "name" });
    throw e;
  }
  const cookie = await startSession(db, id, !!keep, url, t);
  return ok({ corner: { name, rev: 1 }, rev: 1 }, [cookie]);
}

async function signin(db, request, url, net, t) {
  const body = await readJson(request);
  if (body.tooBig || body.bad) return fail(400, "That request didn't make sense. Reload the page and try again.");
  const { name, password, keep } = body.v;
  if (typeof name !== "string" || typeof password !== "string" || !name || !password || name.length > 40 || password.length > PW_MAX)
    return fail(400, "Enter your corner name and password.");
  const key = name.trim().toLowerCase();
  const kNameNet = `in:${key}:${net}`, kName = `in:${key}`, kNet = "innet:" + net;
  const g = await chargeAll(db, [[kNameNet, LIMIT.nameNet], [kName, LIMIT.name], [kNet, LIMIT.net]], t);
  if (g.wait) return fail(429, "Too many tries. Take a breath and try again when the timer runs out.", { wait: g.wait });
  const c = await db.prepare("SELECT id, name, pw, profile, rev FROM corners WHERE name_key = ?").bind(key).first();
  const good = await checkPw(password, c ? c.pw : DUMMY);
  if (!c || !good) {
    const w = await missed(db, g.done, t);
    if (w) return fail(429, "Too many tries. Take a breath and try again when the timer runs out.", { wait: w });
    return fail(401, "That name and password don't match. Check Caps Lock, or try again.", { left: g.done[0].c.left });
  }
  await db.prepare("DELETE FROM tries WHERE k = ?").bind(kNameNet).run();
  await refund(db, [kName, kNet]);
  const cookie = await startSession(db, c.id, !!keep, url, t);
  await tidy(db, t);
  let profile = null;
  try { profile = c.profile ? JSON.parse(c.profile) : null; } catch (e) { profile = null; }
  return ok({ corner: { name: c.name, rev: c.rev }, rev: c.rev, profile }, [cookie]);
}

async function signout(db, request, url) {
  const tok = readCookie(request, COOKIE);
  if (tok && tok.length <= 100) await db.prepare("DELETE FROM sessions WHERE token = ?").bind(await sha256(tok)).run();
  return ok({ corner: null }, [["Set-Cookie", clearCookie(url)]]);
}

async function getProfile(db, request, t) {
  const c = await who(db, request, t);
  if (!c) return fail(401, "You're signed out. Sign in again to save to your corner.", { signedOut: true });
  const r = await db.prepare("SELECT profile, rev FROM corners WHERE id = ?").bind(c.id).first();
  let profile = null;
  try { profile = r.profile ? JSON.parse(r.profile) : null; } catch (e) { profile = null; }
  return ok({ rev: r.rev, profile });
}

async function putProfile(db, request, t) {
  const c = await who(db, request, t);
  if (!c) return fail(401, "You're signed out. Sign in again to save to your corner.", { signedOut: true });
  const body = await readJson(request);
  if (body.tooBig) return fail(413, "That save is too large to keep online.");
  if (body.bad) return fail(400, "That save didn't look like game progress.");
  /* the save names the corner it belongs to: a tab left open from an
     earlier sign-in can't write into whoever is signed in now */
  if (typeof body.v.name === "string" && body.v.name.toLowerCase() !== c.name.toLowerCase())
    return fail(409, "That save belongs to a different corner.", { wrongCorner: true });
  const prof = cleanProfile(body.v.profile);
  if (prof.bad || prof.text === null) return fail(400, "That save didn't look like game progress.");
  if (prof.tooBig) return fail(413, "That save is too large to keep online.");
  /* Only on top of the revision it started from, or of this computer's own
     later saves. Otherwise another computer saved since: hand its newer
     progress back instead of overwriting it. */
  const base = Number(body.v.base), dev = cleanDev(body.v.dev);
  const r = await db.prepare(`UPDATE corners SET profile = ?, rev = rev + 1, dev = ?, updated = ?
      WHERE id = ? AND (rev = ? OR (dev IS NOT NULL AND dev = ?)) RETURNING rev`)
    .bind(prof.text, dev, t, c.id, Number.isFinite(base) ? base : -1, dev).first();
  if (r) return ok({ rev: r.rev });
  const cur = await db.prepare("SELECT profile, rev FROM corners WHERE id = ?").bind(c.id).first();
  let profile = null;
  try { profile = cur.profile ? JSON.parse(cur.profile) : null; } catch (e) { profile = null; }
  return fail(409, "This corner was saved on another computer since.", { newer: true, rev: cur.rev, profile });
}
const cleanDev = (d) => (typeof d === "string" && /^[A-Za-z0-9_-]{8,40}$/.test(d) ? d : null);

async function del(db, request, url, net, t) {
  const c = await who(db, request, t);
  if (!c) return fail(401, "You're signed out. Sign in again first.", { signedOut: true });
  const body = await readJson(request);
  if (body.tooBig || body.bad) return fail(400, "That request didn't make sense. Reload the page and try again.");
  const kNameNet = `in:${c.name.toLowerCase()}:${net}`;
  const g = await chargeAll(db, [[kNameNet, LIMIT.nameNet]], t);
  if (g.wait) return fail(429, "Too many tries. Take a breath and try again when the timer runs out.", { wait: g.wait });
  const row = await db.prepare("SELECT pw FROM corners WHERE id = ?").bind(c.id).first();
  if (typeof body.v.password !== "string" || body.v.password.length > PW_MAX || !(await checkPw(body.v.password, row.pw))) {
    const w = await missed(db, g.done, t);
    if (w) return fail(429, "Too many tries. Take a breath and try again when the timer runs out.", { wait: w });
    return fail(401, "That password doesn't match this corner.", { left: g.done[0].c.left });
  }
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE corner_id = ?").bind(c.id),
    db.prepare("DELETE FROM corners WHERE id = ?").bind(c.id),
  ]);
  return ok({ corner: null, deleted: true }, [["Set-Cookie", clearCookie(url)]]);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = url.pathname.replace(/^.*?\/api\//, "").replace(/\/+$/, "");
  const method = request.method.toUpperCase();
  try {
    if (!env || !env.DB) {
      return route === "me" ? ok({ accounts: false, corner: null })
        : fail(503, "Accounts aren't switched on for this copy of the game.", { accounts: false });
    }
    if (method !== "GET" && method !== "HEAD") {
      /* Only the game's own page may change anything. A browser always
         sends Origin with these requests; the JSON type also forces a
         CORS preflight that this API never answers for another site. */
      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin) return fail(403, "Requests from other sites aren't allowed.");
      if (!/^application\/json\b/i.test(request.headers.get("Content-Type") || "")) return fail(415, "Send JSON.");
    }
    const db = env.DB, t = now();
    await setup(db);
    const net = (await sha256((request.headers.get("CF-Connecting-IP") || "local") + "|" + (env.IP_SALT || "iti-corner-pass"))).slice(0, 32);
    switch (method + " " + route) {
      case "GET me": return await me(db, request, t);
      case "GET name": return await nameCheck(db, url, net, t);
      case "POST signup": return await signup(db, env, request, url, net, t);
      case "POST signin": return await signin(db, request, url, net, t);
      case "POST signout": return await signout(db, request, url);
      case "GET profile": return await getProfile(db, request, t);
      case "PUT profile": return await putProfile(db, request, t);
      case "POST delete": return await del(db, request, url, net, t);
    }
    return fail(404, "There's nothing at that address.");
  } catch (e) {
    console.error("corner api", route, e && e.stack || e);
    return fail(500, "The corner server hit a problem. Try again in a minute.");
  }
}
