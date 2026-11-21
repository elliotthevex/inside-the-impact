/* Story Mode — dev/headless.js: the headless runner (ARCHITECTURE.md §11).

   Usage (macOS, no node needed):
     osascript -l JavaScript story/dev/headless.js <repoRoot> [command] [options]

   Commands (each prints one JSON report on stdout; the exit status is 0 when report.ok, else 1):
     load                         evaluate every manifest file, check every chapter registered and every
                                  location / scene / dialog / quest / evidence / memory / person id that
                                  chapter data and scripts reference (static cross-reference check)
     chapter N [--real]           start chapter N from a fresh state seeded with the canon of earlier
                                  chapters and play it with the autoplay policy until its end
       options: --policy first|restraint|ruthless (default first)  --limit <sim s> (2400)
                --stuck <sim s> (120)  --seed <n>  --flags '{"k":v}'  --render (draw frames into a stub
                canvas every 0.5 s to catch render errors)  --log (include the event log tail)
     campaign <policy> [--real]   New Game to the credits in one run; policy restraint | ruthless | both.
                                  restraint must reach the ending own_name, ruthless the ending champion.
       options: --limit <sim s> (36000)  --seed <n>  --render
     sandbox                      the sandbox chapter's engine integration self-test (c99_sandbox.js)
     locations [--render]         enter every location of every chapter once (its enter scenes run under the
                                  'first' policy for 1 s), report errors; --render draws one frame of each
     exec <file.js>               dev helper: boot headless, then run the file's code as a function body with
                                  (S, T, stubs) in scope; its return value is printed as report.result

   How it loads: story/dev/stubs.js first (window = the global object, document, localStorage, …),
   then window.STORY = { headless: true } so core.js starts headless, then story/manifest.js, then every
   path in STORY_FILES in order with indirect eval (top-level code runs like a classic script). A file
   that is missing or throws is recorded and loading goes on. JavaScriptCore here never settles
   promises, which is why nothing in the simulation may use them. */
ObjC.import('Foundation');
ObjC.import('stdlib');

/* ── host helpers ─────────────────────────────────────────────────────── */
function readText(path) {
  const s = $.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null);
  if (!s || (typeof s.isNil === 'function' && s.isNil())) return null;
  return s.js;
}
function writeOut(text) {
  const d = $.NSString.alloc.initWithUTF8String(text + '\n').dataUsingEncoding($.NSUTF8StringEncoding);
  $.NSFileHandle.fileHandleWithStandardOutput.writeData(d);
}
const now = () => Date.now();
const G0 = (0, eval)('this');   // the global object
const geval = (0, eval);        // indirect eval: code runs in the global scope like a <script>

function errInfo(e) {
  if (!e) return { message: String(e) };
  const o = { message: String(e.message !== undefined ? e.message : e) };
  if (e.line !== undefined) o.line = e.line;
  if (e.column !== undefined) o.column = e.column;
  // JXA stacks carry function names but no file positions for eval'd code: keep the first frames.
  const st = String(e.stack || '').split('\n').map((x) => x.trim()).filter((x) => x && x !== '@' && !/^(eval code@|eval@\[native code\]|run@|loadFile@)/.test(x)).slice(0, 6);
  if (st.length) o.stack = st;
  return o;
}

/* ── argument parsing ─────────────────────────────────────────────────── */
function parseArgs(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = String(argv[i]);
    if (a.slice(0, 2) === '--') {
      const eq = a.indexOf('=');
      if (eq > 0) { opt[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const k = a.slice(2), nx = argv[i + 1];
      if (nx !== undefined && String(nx).slice(0, 2) !== '--' && /^(policy|limit|stuck|seed|flags|out)$/.test(k)) { opt[k] = String(nx); i++; }
      else opt[k] = true;
    } else pos.push(a);
  }
  return { pos, opt };
}

/* ── loading ──────────────────────────────────────────────────────────── */
function boot(root) {
  const rep = { files: [], failed: [], missing: [], missingRequired: [], loadMs: 0 };
  const t0 = now();
  G0.window = G0;
  const stubSrc = readText(root + '/story/dev/stubs.js');
  if (stubSrc === null) throw new Error('cannot read story/dev/stubs.js under ' + root);
  geval(stubSrc);
  // core.js reads S.headless before anything else runs.
  G0.window.STORY = { headless: true };
  const manSrc = readText(root + '/story/manifest.js');
  if (manSrc === null) throw new Error('cannot read story/manifest.js under ' + root);
  geval(manSrc);
  const files = G0.window.STORY_FILES || [];
  const optional = G0.window.STORY_OPTIONAL || [];
  for (const f of files) {
    const t = now();
    const src = readText(root + '/' + f);
    if (src === null) {
      rep.files.push({ file: f, status: 'missing' });
      rep.missing.push(f);
      if (optional.indexOf(f) < 0) rep.missingRequired.push(f);
      continue;
    }
    try {
      geval(src);
      rep.files.push({ file: f, status: 'ok', ms: now() - t });
    } catch (e) {
      // A syntax error throws before any of the file runs; a runtime error may leave it half applied.
      let kind = 'runtime';
      try { new Function(src); } catch (se) { kind = 'syntax'; }
      const info = Object.assign({ file: f, status: 'error', kind }, errInfo(e));
      rep.files.push(info);
      rep.failed.push(info);
    }
  }
  rep.loadMs = now() - t0;
  const S = G0.window.STORY;
  rep.S = S;
  rep.loadErrors = (S && S.errors ? S.errors : []).map((e) => (e.source ? e.source + ': ' : '') + e.message);
  return rep;
}

function consoleSummary() {
  const c = G0.window.__stubs && G0.window.__stubs.console;
  if (!c) return null;
  const warn = c.lines.filter((l) => l.level === 'warn' || l.level === 'error').map((l) => l.level + ': ' + l.text);
  const uniq = Array.from(new Set(warn));
  return { counts: c.counts, warnings: uniq.slice(0, 60), more: Math.max(0, uniq.length - 60) };
}

/* ── static cross-reference check (command `load`) ────────────────────── */
const KNOWN = {
  sounds: ['jab', 'cross', 'hook', 'upper', 'heavy', 'whiff', 'block', 'dash', 'slip', 'slipOk', 'counter', 'hurt', 'down', 'step', 'land', 'jump', 'bell', 'bell3', 'door',
    'stairs', 'pickup', 'paper', 'evidence', 'quest', 'checkpoint', 'ui', 'uiBack', 'uiMove', 'type', 'heartbeat', 'crowdRoar', 'crowdGasp', 'carHorn', 'vanDoor', 'glass',
    'phoneRing', 'dial', 'radio', 'tvStatic', 'buzz'],
  loops: ['city', 'rain', 'hum', 'crowd', 'arena', 'wind', 'traffic', 'fire', 'room', 'courtyard', 'office', 'tinnitus'],
  fx: ['muffle', 'blur', 'double', 'desat', 'vignette', 'heartbeat', 'sepia', 'slowmo', 'flash'],
  endings: ['champion', 'own_name'],
  questKinds: ['main', 'side', 'missable'],
  evidenceKinds: ['document', 'photo', 'object', 'recording', 'letter', 'record'],
  doorKinds: ['door', 'edge', 'stairs', 'ladder'],
  drills: ['balance', 'footwork', 'reaction', 'conditioning', 'bag', 'mitts'],
  activities: ['train_balance', 'train_footwork', 'train_reaction', 'train_conditioning', 'train_bag', 'train_mitts', 'carry', 'repair', 'work_shift', 'timeline', 'present'],
  // Flags the engine itself writes or reads; never reported as unset.
  engineFlags: /^(used:|seen:|trig:|entered:|shift\.|_|ending$|ch10_choice$)/,
};

function crossCheck(S, loadRep) {
  const story = S.story || {};
  const problems = [], warnings = [];
  const P = (where, msg) => problems.push(where + ': ' + msg);
  const Wn = (where, msg) => warnings.push(where + ': ' + msg);
  const ids = typeof story.ids === 'function' ? story.ids() : [];
  const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
  const fresh = typeof S.newState === 'function' ? S.newState() : { skills: {}, gear: {} };
  const skillNames = Object.keys(fresh.skills || {});
  const gearNames = Object.keys(fresh.gear || {});
  const looksOn = !!(S.looks && Object.keys(S.looks).length);
  const poses = S.art && Array.isArray(S.art.poses) ? S.art.poses : null;
  const sounds = (S.audio && Array.isArray(S.audio.names) && S.audio.names) || KNOWN.sounds;
  const loops = (S.audio && Array.isArray(S.audio.loopNames) && S.audio.loopNames) || KNOWN.loops;
  const actNames = (S.activities && Array.isArray(S.activities.names) && S.activities.names.length) ? S.activities.names : KNOWN.activities;
  const archetypes = S.combat && S.combat.archetypes ? Object.keys(S.combat.archetypes) : null;
  const flagSet = new Map(), flagRead = new Map(), setCalls = new Map(), sources = [];
  const note = (m, k, where) => { if (!m.has(k)) m.set(k, where); };

  // Registered chapters vs chapter files that loaded.
  const chapterFiles = [];
  for (const f of loadRep.files) {
    const m = /story\/chapters\/c(\d+)(?:_\w+)?\.js$/.exec(f.file);
    if (!m) continue;
    const n = +m[1];
    chapterFiles.push(n);
    if (f.status === 'ok' && !(typeof story.has === 'function' && story.has(n))) P('chapter ' + n, f.file + ' loaded but did not register chapter ' + n + ' (S.defineChapter)');
  }
  for (const n of ids) if (chapterFiles.indexOf(n) < 0) Wn('chapter ' + n, 'registered by a file that is not a chapter file');

  function withChapter(n, fn) {
    const keep = S.G;
    try {
      S.G = typeof story.seedState === 'function' ? story.seedState(n) : S.newState();
      S.G.chapter = n;
      return fn();
    } finally { S.G = keep; }
  }
  const hasLoc = (id) => {
    try { if (typeof story.location === 'function' && story.location(id)) return true; } catch (_) { /* reported elsewhere */ }
    return !!(S.world && S.world.locations && own(S.world.locations, id));
  };
  const hasScene = (id) => typeof story.scene === 'function' && !!story.scene(id);
  const hasQuest = (id) => typeof story.questDef === 'function' && !!story.questDef(id);
  const hasEvidence = (id) => typeof story.evidenceDef === 'function' && !!story.evidenceDef(id);
  const hasMemory = (id) => typeof story.memoryDef === 'function' && !!story.memoryDef(id);
  const person = (id) => (typeof story.person === 'function' ? story.person(id) : null);
  const lookOk = (look) => !looksOn || typeof look !== 'string' || own(S.looks, look);
  const poseOk = (p) => !poses || !p || poses.indexOf(p) >= 0;

  // Scripts: read the function source for A.<verb>('id', …) calls.
  const scanned = new Set();
  function scanFn(fn, where) {
    if (typeof fn !== 'function' || scanned.has(fn)) return;
    scanned.add(fn);
    let src;
    try { src = Function.prototype.toString.call(fn); } catch (_) { return; }
    sources.push(src);
    const pm = /^[^(]*\(\s*([A-Za-z_$][\w$]*)/.exec(src);
    const a = pm ? pm[1] : 'A';
    const esc = a.replace(/\$/g, '\\$');
    const re = new RegExp('(?:^|[^\\w$.])' + esc + '\\.(goto|sub|evidence|memory|quest|meet|doc|activity|skill|ending|queue|parallel|gear|flag|get|has|sound|ambience|fx)\\(\\s*([\'"`])([^\'"`$]+)\\2(\\s*,\\s*([\'"`])([^\'"`$]+)\\5)?', 'g');
    let m;
    while ((m = re.exec(src))) {
      const verb = m[1], id = m[3], arg2 = m[6];
      const w = where + ' ' + a + '.' + verb + "('" + id + "')";
      switch (verb) {
        case 'goto': if (!hasLoc(id)) P(w, 'unknown location'); break;
        case 'sub': case 'queue': case 'parallel': if (!hasScene(id)) P(w, 'unknown scene'); break;
        case 'evidence': if (!hasEvidence(id)) P(w, 'unknown evidence'); break;
        case 'doc': if (!hasEvidence(id)) P(w, 'unknown evidence for the document viewer'); break;
        case 'memory': if (!hasMemory(id)) P(w, 'unknown memory'); break;
        case 'quest': if (!hasQuest(id)) P(w, 'unknown quest'); else if (arg2 && ['start', 'step', 'done', 'fail'].indexOf(arg2) < 0) Wn(w, "unknown quest action '" + arg2 + "'"); break;
        case 'meet': {
          const p = person(id);
          if (!p) P(w, 'unknown person');
          else if (arg2 && !(p.notes || []).some((n) => n && n.id === arg2)) Wn(w, "person has no note '" + arg2 + "'");
          break;
        }
        case 'activity': if (actNames.indexOf(id) < 0) P(w, 'unknown activity'); break;
        case 'skill': if (skillNames.length && skillNames.indexOf(id) < 0) Wn(w, 'unknown skill'); break;
        case 'gear': if (gearNames.length && gearNames.indexOf(id) < 0) Wn(w, 'unknown gear'); break;
        case 'ending': if (KNOWN.endings.indexOf(id) < 0) P(w, 'unknown ending'); break;
        case 'flag': note(flagSet, id, where); setCalls.set(id, (setCalls.get(id) || 0) + 1); break;
        case 'get': case 'has': note(flagRead, id, where); break;
        case 'sound': if (sounds.indexOf(id) < 0) Wn(w, 'unknown sound'); break;
        case 'ambience': if (loops.indexOf(id) < 0) Wn(w, 'unknown ambience loop'); break;
        case 'fx': if (KNOWN.fx.indexOf(id) < 0) Wn(w, 'unknown screen effect'); break;
      }
    }
    // Flags read straight from G.
    const fr = /\bflags\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*(['"])([^'"]+)\2\s*\])/g;
    while ((m = fr.exec(src))) note(flagRead, m[1] || m[3], where);
    // Poses and looks named in scripts.
    const pr = new RegExp(esc + '\\.pose\\(\\s*[^,]+,\\s*([\'"])(\\w+)\\1', 'g');
    while ((m = pr.exec(src))) if (!poseOk(m[2])) Wn(where, "unknown pose '" + m[2] + "'");
    if (archetypes && /\.(fight|bout)\(|spawnEnemy/.test(src)) {
      const tr = /\btype\s*:\s*(['"])([a-z_]+)\1/g;
      while ((m = tr.exec(src))) if (archetypes.indexOf(m[2]) < 0) Wn(where, "unknown enemy type '" + m[2] + "'");
    }
  }

  function checkTarget(where, ref, kind) {
    if (ref === undefined || ref === null || ref === '') return;
    if (typeof ref === 'function') { scanFn(ref, where); return; }
    if (typeof ref !== 'string') { P(where, kind + ' must be a scene id or a generator function'); return; }
    if (!hasScene(ref)) P(where, 'unknown scene "' + ref + '"');
  }

  function checkLocation(id, raw, where) {
    let L = raw;
    if (typeof raw === 'function') {
      scanFn(raw, where + ' builder');
      try { L = raw(S.G, S); } catch (e) { P(where, 'location builder threw: ' + errInfo(e).message); return; }
    }
    if (!L || typeof L !== 'object') { P(where, 'location is not an object'); return; }
    if (!(+L.w > 0)) Wn(where, 'no width (w)');
    for (const k of ['firstEnter', 'enter']) checkTarget(where + ' ' + k, L[k], k);
    const layers = L.layers || {};
    for (const ln in layers) {
      if (!Array.isArray(layers[ln])) { P(where, 'layers.' + ln + ' is not a list'); continue; }
      for (const p of layers[ln]) {
        if (!p || typeof p !== 'object') { P(where, 'a piece in layers.' + ln + ' is not an object'); continue; }
        if (S.pieces && typeof S.pieces.has === 'function' && !S.pieces.has(p.t)) P(where, "unknown piece type '" + p.t + "' in layers." + ln);
      }
    }
    const seen = new Set();
    for (const d of L.doors || []) {
      if (!d) continue;
      const w = where + ' door ' + (d.id || d.to || '?');
      if (d.to !== undefined && d.to !== null) { if (!hasLoc(d.to)) P(w, 'leads to unknown location "' + d.to + '"'); }
      else if (!d.run) P(w, 'has neither `to` nor `run`');
      if (d.run) checkTarget(w + ' run', d.run, 'run');
      if (d.kind && KNOWN.doorKinds.indexOf(d.kind) < 0) Wn(w, "unknown kind '" + d.kind + "'");
      if (typeof d.locked === 'function') scanFn(d.locked, w + ' locked');
    }
    for (const n of L.npcs || []) {
      if (!n) continue;
      const w = where + ' npc ' + (n.id || '?');
      if (!n.id) P(w, 'npc without an id');
      else if (seen.has(n.id)) P(w, 'duplicate actor id');
      seen.add(n.id);
      if (n.talk) checkTarget(w + ' talk', n.talk, 'talk');
      if (!lookOk(n.look)) Wn(w, "unknown look '" + n.look + "'");
      if (!poseOk(n.pose)) Wn(w, "unknown pose '" + n.pose + "'");
      for (const k of ['marker', 'when', 'barks']) if (typeof n[k] === 'function') scanFn(n[k], w + ' ' + k);
    }
    for (const o of L.objects || []) {
      if (!o) continue;
      const w = where + ' object ' + (o.id || '?');
      if (o.id && seen.has(o.id)) Wn(w, 'id also used by an npc or another object');
      if (o.id) seen.add(o.id);
      if (o.run) checkTarget(w + ' run', o.run, 'run');
      if (o.evidence && !hasEvidence(o.evidence)) P(w, 'unknown evidence "' + o.evidence + '"');
      if (o.memory && !hasMemory(o.memory)) P(w, 'unknown memory "' + o.memory + '"');
      if (typeof o.doc === 'string' && !hasEvidence(o.doc)) P(w, 'unknown evidence for doc "' + o.doc + '"');
      if (o.doc === true && !o.evidence) P(w, 'doc: true needs an evidence id');
      if (!o.run && o.text == null && !o.evidence && !o.memory && !o.doc && !/^sit$/i.test(o.verb || '')) Wn(w, 'does nothing when used');
      if (typeof o.when === 'function') scanFn(o.when, w + ' when');
      if (typeof o.text === 'function') scanFn(o.text, w + ' text');
    }
    for (const t of L.triggers || []) {
      if (!t) continue;
      const w = where + ' trigger ' + (t.id || '?');
      if (!t.run) P(w, 'trigger without `run`'); else checkTarget(w + ' run', t.run, 'run');
      if (!(t.x0 <= t.x1)) Wn(w, 'x0..x1 is empty or missing');
      if (typeof t.when === 'function') scanFn(t.when, w + ' when');
    }
    for (const s of L.solids || []) if (!(s && s.w > 0 && (s.oneway || s.h > 0))) Wn(where, 'a solid has no size');
    for (const l of L.ladders || []) if (!(l && isFinite(l.x) && isFinite(l.y0) && isFinite(l.y1))) Wn(where, 'a ladder needs x, y0, y1');
    if (L.training && !Array.isArray(L.training)) for (const k in L.training) if (KNOWN.drills.indexOf(k) < 0) Wn(where, "unknown drill '" + k + "' in training");
  }

  const checkedLocs = new Set();
  for (const n of ids) {
    const def = story.chapters[n];
    if (!def) continue;
    const C = 'c' + n;
    withChapter(n, () => {
      if (!def.title) Wn(C, 'no title');
      const st = def.start || {};
      if (!st.loc) P(C, 'start.loc is missing');
      else if (!hasLoc(st.loc)) P(C, 'start.loc "' + st.loc + '" is not a location');
      if (st.scene) checkTarget(C + ' start.scene', st.scene, 'scene');
      if (def.body && def.body.look && !lookOk(def.body.look)) Wn(C, "body.look '" + def.body.look + "' is not a registered look");
      for (const k in def.skills || {}) if (skillNames.length && skillNames.indexOf(k) < 0) Wn(C, "unknown skill '" + k + "'");
      for (const id in def.quests) {
        const q = def.quests[id], w = C + ' quest ' + id;
        if (!q || typeof q !== 'object') { P(w, 'not an object'); continue; }
        if (q.kind && KNOWN.questKinds.indexOf(q.kind) < 0) Wn(w, "unknown kind '" + q.kind + "'");
        if (!Array.isArray(q.steps) || !q.steps.length) Wn(w, 'no steps');
        (q.steps || []).forEach((s, i) => {
          if (s && s.target && s.target.loc && !hasLoc(s.target.loc)) P(w + ' step ' + i, 'target loc "' + s.target.loc + '" is not a location');
          if (s && s.autoplay && s.autoplay.loc && !hasLoc(s.autoplay.loc)) P(w + ' step ' + i, 'autoplay loc "' + s.autoplay.loc + '" is not a location');
        });
        if (q.giver && !person(q.giver)) Wn(w, 'giver "' + q.giver + '" is not in the People archive');
      }
      for (const id in def.evidence) {
        const e = def.evidence[id], w = C + ' evidence ' + id;
        if (!e || typeof e !== 'object') { P(w, 'not an object'); continue; }
        if (e.kind && KNOWN.evidenceKinds.indexOf(e.kind) < 0) Wn(w, "unknown kind '" + e.kind + "'");
        if (!e.title) Wn(w, 'no title');
        if (!e.text && !(Array.isArray(e.pages) && e.pages.length)) Wn(w, 'no text or pages');
      }
      for (const id in def.memories) { const m = def.memories[id]; if (!m || !m.title) Wn(C + ' memory ' + id, 'no title'); }
      for (const id in def.people) {
        const p = def.people[id], w = C + ' person ' + id;
        if (!p || typeof p !== 'object') { P(w, 'not an object'); continue; }
        if (p.look && !lookOk(p.look)) Wn(w, "unknown look '" + p.look + "'");
        for (const nt of p.notes || []) if (nt && typeof nt.when === 'function') scanFn(nt.when, w + ' note ' + nt.id);
      }
      for (const node of def.mapNodes || []) for (const l of (node && node.locs) || []) if (!hasLoc(l)) P(C + ' map node ' + node.id, 'unknown location "' + l + '"');
      const canon = def.canon || def.seed;
      if (canon) {
        for (const k in canon.flags || {}) note(flagSet, k, C + ' canon');
        const list = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v) : []);
        for (const id of list(canon.evidence)) if (!hasEvidence(id)) Wn(C + ' canon', 'unknown evidence "' + id + '"');
        for (const id of list(canon.memories)) if (!hasMemory(id)) Wn(C + ' canon', 'unknown memory "' + id + '"');
        for (const id of list(canon.people)) if (!person(id)) Wn(C + ' canon', 'unknown person "' + id + '"');
        for (const id of list(canon.quests)) if (!hasQuest(id)) Wn(C + ' canon', 'unknown quest "' + id + '"');
      }
      for (const id in def.locations) { checkedLocs.add(id); checkLocation(id, def.locations[id], C + ' loc ' + id); }
      for (const id in def.scenes) { if (typeof def.scenes[id] !== 'function') P(C + ' scene ' + id, 'not a function'); else scanFn(def.scenes[id], C + ' scene ' + id); }
      for (const id in def.dialogs) { if (typeof def.dialogs[id] !== 'function') P(C + ' dialog ' + id, 'not a function'); else scanFn(def.dialogs[id], C + ' dialog ' + id); }
      if (typeof def.summary === 'function') scanFn(def.summary, C + ' summary');
      if (n === 10 && !def.endings) Wn(C, 'no endings (champion / own_name card text)');
    });
  }
  // Shared content (cast.js / places.js), checked in the context of the first chapter.
  const first = ids.length ? ids[0] : 0;
  withChapter(first, () => {
    for (const id in story.locations || {}) if (!checkedLocs.has(id)) { checkedLocs.add(id); checkLocation(id, story.locations[id], 'shared loc ' + id); }
    if (S.world && S.world.locations) for (const id in S.world.locations) if (!checkedLocs.has(id)) checkLocation(id, S.world.locations[id], 'world loc ' + id);
    for (const id in story.scenes || {}) scanFn(story.scenes[id], 'shared scene ' + id);
    for (const id in story.dialogs || {}) scanFn(story.dialogs[id], 'shared dialog ' + id);
    for (const id in story.people || {}) { const p = story.people[id]; if (p && p.look && !lookOk(p.look)) Wn('cast ' + id, "unknown look '" + p.look + "'"); }
  });

  // Flags that scripts read but nothing ever sets (computed names cannot be seen: warnings only).
  const unset = [];
  flagRead.forEach((where, k) => { if (!flagSet.has(k) && !KNOWN.engineFlags.test(k)) unset.push(k + ' (read in ' + where + ')'); });
  // A flag counts as read when its name appears as a string anywhere besides the A.flag() calls that set it
  // (helpers like flag(G, 'x') and when/locked/marker functions included).
  const unread = [];
  const all = sources.join('\n');
  flagSet.forEach((where, k) => {
    if (flagRead.has(k) || KNOWN.engineFlags.test(k)) return;
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const n = (all.match(new RegExp('([\'"`])' + esc + '\\1', 'g')) || []).length;
    if (n <= (setCalls.get(k) || 0)) unread.push(k);
  });

  const count = (kind) => {
    let n = 0;
    for (const id of ids) { const d = story.chapters[id]; if (d && d[kind]) n += Object.keys(d[kind]).length; }
    return n + (story[kind] ? Object.keys(story[kind]).length : 0);
  };
  return {
    chapters: ids,
    counts: { locations: count('locations'), scenes: count('scenes'), dialogs: count('dialogs'), quests: count('quests'), evidence: count('evidence'),
      memories: count('memories'), people: count('people'), scriptsScanned: scanned.size, flagsSet: flagSet.size, flagsRead: flagRead.size },
    problems, warnings,
    flags: { readNeverSet: unset.slice(0, 80), setNeverRead: unread.slice(0, 80) },
  };
}

/* ── render smoke test: draw a frame into a stub canvas every 0.5 sim s ── */
function renderHook(S, rep) {
  const stubs = G0.window.__stubs;
  const ctx = stubs.canvasCtx(640, 360);
  rep.render = { frames: 0, errors: [] };
  let acc = 0;
  return S.main.onStep(function (dt) {
    acc += dt;
    if (acc < 0.5) return;
    acc = 0;
    if (!S.world || !S.world.loc || S.main.mode !== 'play') return;
    const keep = S.headless;
    S.headless = false;
    try { S.world.render(ctx); rep.render.frames++; }
    catch (e) { if (rep.render.errors.length < 20) rep.render.errors.push((S.world.locId || '?') + ': ' + errInfo(e).message); }
    finally { S.headless = keep; }
  }, true);
}

/* ── commands ─────────────────────────────────────────────────────────── */
function needTest(S) {
  if (!S || !S.test || typeof S.test.boot !== 'function') throw new Error('S.test is missing (main.js did not load)');
}

function cmdChapter(S, args, rep) {
  needTest(S);
  const n = +args.pos[1];
  if (!Number.isFinite(n)) throw new Error('usage: chapter N [--real] [--policy p] [--limit s]');
  const T = S.test;
  T.boot({ headless: true, seed: args.opt.seed !== undefined ? +args.opt.seed : 19940820 });
  let off = null;
  if (args.opt.render) off = renderHook(S, rep);
  let flags = null;
  if (args.opt.flags) flags = JSON.parse(String(args.opt.flags));
  const t0 = now(), steps0 = S.main.steps;
  const r = T.runChapter(n, { policy: args.opt.policy || 'first', real: !!args.opt.real, flags,
    limit: args.opt.limit ? +args.opt.limit : undefined, stuckAfter: args.opt.stuck ? +args.opt.stuck : undefined });
  if (off) off();
  rep.wallMs = now() - t0;
  rep.steps = S.main.steps - steps0;
  rep.result = r;
  if (args.opt.log) rep.logTail = T.log.slice(-60);
  rep.ok = !!(r && r.reachedEnd && !r.stuck && !(r.errors && r.errors.length) && !r.error && !(rep.render && rep.render.errors.length));
}

const EXPECT = { restraint: 'own_name', ruthless: 'champion' };
function cmdCampaign(S, args, rep) {
  needTest(S);
  const which = args.pos[1] || 'restraint';
  const list = which === 'both' ? ['restraint', 'ruthless'] : [which];
  const T = S.test;
  let off = null;
  rep.runs = [];
  for (const policy of list) {
    T.boot({ headless: true, seed: args.opt.seed !== undefined ? +args.opt.seed : 19940820 });
    if (args.opt.render && !off) off = renderHook(S, rep);
    const t0 = now(), steps0 = S.main.steps;
    const r = T.runCampaign(policy, { real: !!args.opt.real, limit: args.opt.limit ? +args.opt.limit : undefined, stuckAfter: args.opt.stuck ? +args.opt.stuck : undefined });
    const expected = EXPECT[policy] || null;
    rep.runs.push(Object.assign({ wallMs: now() - t0, steps: S.main.steps - steps0, expectedEnding: expected,
      endingOk: expected ? r.ending === expected : null }, r));
  }
  if (off) off();
  rep.ok = rep.runs.every((r) => r.finished && !r.stuck && !(r.errors && r.errors.length) && r.endingOk !== false) && !(rep.render && rep.render.errors.length);
}

function cmdSandbox(S, args, rep) {
  needTest(S);
  if (!S.sandbox || typeof S.sandbox.selfTest !== 'function') throw new Error('S.sandbox.selfTest is missing (story/chapters/c99_sandbox.js did not load)');
  S.test.boot({ headless: true, seed: args.opt.seed !== undefined ? +args.opt.seed : 1994 });
  let off = null;
  if (args.opt.render) off = renderHook(S, rep);
  const t0 = now();
  const r = S.sandbox.selfTest({ verbose: !!args.opt.verbose });
  if (off) off();
  rep.wallMs = now() - t0;
  rep.result = r;
  rep.ok = !!(r && r.ok) && !(rep.render && rep.render.errors.length);
}

function cmdLocations(S, args, rep) {
  needTest(S);
  const T = S.test, story = S.story;
  T.boot({ headless: true, seed: 7 });
  const stubs = G0.window.__stubs;
  const ctx = args.opt.render ? stubs.canvasCtx(640, 360) : null;
  rep.locations = [];
  for (const n of story.ids()) {
    const def = story.chapters[n];
    for (const id of Object.keys(def.locations || {})) {
      const err0 = S.errors.length;
      const row = { chapter: n, id, ok: false };
      try {
        S.director.reset();
        S.G = story.seedState(n);
        S.G.chapter = n;
        S.main.setMode('play');
        // Not silent: the location's firstEnter/enter scenes run (under the 'first' policy) for a second.
        S.director.setPolicy('first');
        const ok = S.director.enterWorld(id, null, {});
        row.ok = !!ok && S.world.locId === id;
        T.step(1);
        if (S.world.locId !== id) row.endedIn = S.world.locId;
        row.w = S.world.loc ? S.world.loc.w : null;
        row.actors = S.world.actors.length;
        if (ctx) {
          const keep = S.headless; S.headless = false;
          try { S.world.render(ctx); row.rendered = true; } catch (e) { row.renderError = errInfo(e).message; row.ok = false; } finally { S.headless = keep; }
        }
      } catch (e) { row.error = errInfo(e).message; }
      const errs = S.errors.slice(err0).map((e) => (e.source ? e.source + ': ' : '') + e.message);
      if (errs.length) { row.errors = errs.slice(0, 8); row.ok = false; }
      rep.locations.push(row);
    }
  }
  S.director.reset();
  rep.ok = rep.locations.every((r) => r.ok);
  rep.failed = rep.locations.filter((r) => !r.ok).length;
}

function cmdExec(S, args, rep, root) {
  needTest(S);
  const f = args.pos[1];
  if (!f) throw new Error('usage: exec <file.js>');
  const src = readText(f.charAt(0) === '/' ? f : root + '/' + f);
  if (src === null) throw new Error('cannot read ' + f);
  S.test.boot({ headless: true, seed: args.opt.seed !== undefined ? +args.opt.seed : 1 });
  const t0 = now();
  rep.result = new Function('S', 'T', 'stubs', 'args', src)(S, S.test, G0.window.__stubs, args);
  rep.wallMs = now() - t0;
  rep.errors = S.errors.map((e) => (e.source ? e.source + ': ' : '') + e.message);
  rep.ok = !rep.errors.length;
}

/* ── entry point ──────────────────────────────────────────────────────── */
function run(argv) {
  const args = parseArgs(argv || []);
  // The root may be left out when running from the repository root: `headless.js load`.
  const COMMANDS = ['load', 'chapter', 'campaign', 'sandbox', 'locations', 'exec'];
  if (args.pos.length && COMMANDS.indexOf(args.pos[0]) >= 0 && readText(args.pos[0] + '/story/manifest.js') === null) args.pos.unshift('.');
  const root = (args.pos[0] || '.').replace(/\/+$/, '') || '/';
  args.pos.shift();
  const cmd = args.pos[0] || 'load';
  const rep = { command: [cmd].concat(args.pos.slice(1)).join(' '), ok: false };
  let code = 1;
  try {
    const L = boot(root);
    const S = L.S;
    rep.load = { ms: L.loadMs, files: L.files.length, ok: L.files.filter((f) => f.status === 'ok').length,
      missing: L.missing, failed: L.failed, errors: L.loadErrors };
    if (!S || !S.util) throw new Error('core.js did not create window.STORY');
    if (cmd === 'load') {
      Object.assign(rep, crossCheck(S, L));
      rep.files = L.files.map((f) => f.file.replace(/^story\//, '') + ' ' + f.status + (f.ms !== undefined ? ' ' + f.ms + 'ms' : '') + (f.message ? ': ' + f.message : ''));
      rep.ok = !L.missing.length && !L.failed.length && !L.loadErrors.length && !rep.problems.length;
      rep.okEngine = !L.missingRequired.length && !L.failed.some((f) => (G0.window.STORY_OPTIONAL || []).indexOf(f.file) < 0);
    } else if (cmd === 'chapter') cmdChapter(S, args, rep);
    else if (cmd === 'campaign') cmdCampaign(S, args, rep);
    else if (cmd === 'sandbox') cmdSandbox(S, args, rep);
    else if (cmd === 'locations') cmdLocations(S, args, rep);
    else if (cmd === 'exec') cmdExec(S, args, rep, root);
    else throw new Error('unknown command "' + cmd + '" (load | chapter N | campaign <policy> | sandbox | locations | exec <file>)');
    rep.console = consoleSummary();
    code = rep.ok ? 0 : 1;
  } catch (e) {
    rep.ok = false;
    rep.fatal = errInfo(e);
    rep.console = consoleSummary();
    code = 2;
  }
  writeOut(JSON.stringify(rep, null, 1));
  $.exit(code);
}
