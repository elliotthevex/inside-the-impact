/* The corner's lines against the real sim, AI and bots, in the game's real frame loop, plus forced states and random states.
   Run from anywhere: /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m site/gfx/dev/coachtest.js [-- seeds]
   Prints failures, how often each tag fires at the game's real round length, what one player hears over five rematches, then every line once to read as a player would.
   Rounds here are the game's own 60 seconds unless a line says otherwise. The short rounds further down exist only in this test, to run the coaching and praise lines on real events. */
const SITE = String(import.meta.url).replace(/^file:\/\//, '').replace(/dev\/[^\/]*$/, 'arena/'); // JavaScriptCore has no URL
const { createMatch, setReach, STEP, HEAD } = await import(SITE + 'sim.js');
const { createAI, createBot, BOTS } = await import(SITE + 'ai.js');
const { createCoach, COACH_LINES, BAR_FINE, BAR_LEFT, SIGNS_SHOW } = await import(SITE + 'coach.js');
setReach(JSON.parse(readFile(SITE + 'reach.json')));
const GAME_RING = { ringHalf: 2.9, corners: { blue: [-2.5, -2.5], red: [2.5, 2.5] } };
const FRAME = 1 / 60;
const SEEDS = typeof arguments !== 'undefined' && arguments[0] ? +arguments[0] : 12;
const SAFETY = new Set(['self-bad', 'self-down-warn', 'self-warn', 'self-down']), RIVAL = new Set(['rival-bad', 'rival-warn', 'rival-down']);

const NUMWORD = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third|fourth|half|once|twice|dozen|percent|couple|quarter|double|triple)\b/i;
const FORBID = /\b(concussion|concussed|concuss\w*|brain|injury|injured|loads?|meter|gauge|levels?|points?|score|percent|quantity|fight through|keep going|keep fighting|tough it out|shake it off|walk it off|push through|you'?re fine|you are fine|you have a|you've got a|diagnos\w*|he has a)\b/i;
const words = (s) => s.trim().split(/\s+/).length;

/* Lists a line belongs to, from the module itself, so a new line is covered without touching this test. */
const FINE = new Set(), LEAN = new Set();
for (const pool of Object.values(COACH_LINES)) { for (const t of pool.fine || []) { FINE.add(t); LEAN.add(t); } for (const t of pool.bar || []) LEAN.add(t); }
/* Signs the rig only plays past HEAD.bad + SIGNS_SHOW. */
const LATE_SIGN = /sway|blink|hands low|low hands|hands are dropping|hands dropping|hands are sinking|stay up|balance/i;
const whose = (tag, m) => (tag.startsWith('rival') ? m.o : m.p);

const fail = [];
const tagCount = {}, byBot = {}, roundsSeen = { break: 0, over: 0 };
let matches = 0, calls = 0, stopOffers = 0, offerAtBreak = 0, leanedBreaks = 0, lastLeaned = false;
const allSaid = new Set(), saidCount = {};
const howEnded = {};

function expectTag(m, kdP) {
  const { p, o } = m;
  if (p.head >= HEAD.bad) return 'self-bad';
  if (p.head >= HEAD.warn) return kdP ? 'self-down-warn' : 'self-warn';
  if (kdP) return 'self-down';
  if (o.head >= HEAD.bad) return 'rival-bad';
  if (o.head >= HEAD.warn) return 'rival-warn';
  if (o.kd > 0) return 'rival-down';
  return null;
}
function checkText(t, ctx) {
  if (!t || !t.text || !t.text.trim()) fail.push('empty ' + ctx);
  if (/\d/.test(t.text)) fail.push('digit: ' + t.text);
  if (NUMWORD.test(t.text)) fail.push('number word: ' + t.text);
  if (FORBID.test(t.text)) fail.push('forbidden: ' + t.text);
  if (words(t.text) > 14) fail.push('long: ' + t.text);
}

/* Sentences about the round, against this test's own count of what happened in it. */
const TRUTH = [
  ['Hardly anything to the body', (x) => x.body / x.thrown < .05], ["You're head-hunting", (x) => x.body / x.thrown < .05], ['Work the body too', (x) => x.body / x.thrown < .05], ['Almost all head', (x) => x.head > 0 && x.body / x.thrown < .05],
  ['You barely got touched up top', (x) => x.takenClean <= 2], ['He hardly touched your head', (x) => x.takenClean <= 2], ['took almost nothing clean', (x) => x.takenClean <= 2 && x.hit >= 8],
  ['You barely threw anything', (x) => x.thrown < 4], ["You can't win a round without punching", (x) => x.thrown < 4], ["You've got hands", (x) => x.thrown < 4],
  ['Your guard hardly came up', (x) => x.guardT / Math.max(.1, x.fightT) < .5], ['You hardly blocked that round', (x) => x.block <= 4], ['Too many got through clean', (x) => x.takenClean >= 6],
  ['He hit a lot of glove', (x) => x.block >= 8], ['Good hands', (x) => x.block >= 8 && x.block >= x.takenClean], ['Nice guard', (x) => x.block >= 8 && x.block >= x.takenClean],
  ['Nice slips', (x) => x.slip >= 2], ['You made him miss', (x) => x.slip >= 1], ["He's hitting air", (x) => x.slip >= 1], ['Good head movement', (x) => x.slip >= 1], ["You're not slipping anything", (x) => x.slip === 0], ['Try slipping', (x) => x.slip === 0],
  ['Good round. You out-landed him', (x) => x.hit > x.oLanded], ["You're winning the exchanges", (x) => x.hit > x.oLanded], ['Sharp round', (x) => x.hit > x.oLanded],
  ['Good work to the body', (x) => x.bodyHit >= 3], ['Nice body shots', (x) => x.bodyHit >= 3], ['You kept finding his body', (x) => x.bodyHit >= 3],
  ["You're swinging at air", (x) => x.whiff / x.thrown >= .4], ['Too many misses', (x) => x.whiff / x.thrown >= .4], ["He's out of reach when you throw", (x) => x.whiff / x.thrown >= .4],
  ["You're out of gas", (x) => x.sta < 25.5], ['Your arms are gone', (x) => x.sta < 25.5],
];
const truthSeen = {};

/* Bots of this test's own, for patterns the ai.js bots never show. */
function rng(s) { let a = s | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function customBot(name, seed) {
  const r = rng(seed), o = { mx: 0, mz: 0, guard: false, punch: null, slip: false, getUp: false }; let next = 0, ph = 0;
  const up = (dt) => { ph += dt * 6; return (ph % 1) < .5; };
  const toward = (me, foe, f) => { const dx = foe.x - me.x, dz = foe.z - me.z, d = Math.hypot(dx, dz) || 1; o.mx = dx / d * f; o.mz = dz / d * f; return d; };
  const stop = () => { o.mx = o.mz = 0; };
  const clear = () => { stop(); o.guard = false; o.punch = null; o.slip = false; o.getUp = false; };
  const open = (m, me, dt) => { clear(); if (me.down) { o.getUp = up(dt); return false; } return m.state === 'fight'; };
  const BOTLOGIC = {
    noguard(m, me, foe) { const d = toward(me, foe, 1); if (d < .85) stop(); if (m.time >= next && d < 1.2) { const K = ['jab', 'cross', 'hook', 'jab', 'cross', 'bodyL', 'bodyR', 'upper']; o.punch = K[Math.floor(r() * K.length)]; next = m.time + .35 + r() * .6; } },
    whiffer(m, me, foe) { const d = toward(me, foe, 0); if (d < 1.9) toward(me, foe, -1); else if (d > 2.4) toward(me, foe, 1); if (m.time >= next) { o.punch = r() < .5 ? 'jab' : 'cross'; next = m.time + .55 + r() * .4; } },
    slipper(m, me, foe) { const d = toward(me, foe, 1); if (d < .95) stop(); const fp = foe.punch; if (fp && fp.phase === 'startup' && fp.contact - fp.t < .2 && d < 1.3) o.slip = true; else if (m.time >= next && d < 1.15 && !me.slip) { o.punch = r() < .6 ? 'jab' : 'bodyL'; next = m.time + .9 + r() * .7; } },
    bodyman(m, me, foe) { const d = toward(me, foe, 1); if (d < .85) stop(); o.guard = !!(foe.punch && foe.punch.phase === 'startup'); if (m.time >= next && d < 1.1) { o.punch = r() < .5 ? 'bodyL' : 'bodyR'; next = m.time + .7 + r() * .6; o.guard = false; } },
    hitrun(m, me, foe) { const d = toward(me, foe, 0); if (m.time >= next && d < 1.1) { o.punch = r() < .7 ? 'jab' : 'cross'; next = m.time + 1.3 + r(); } else if (me.punch || m.time < next - .5) toward(me, foe, -1); else toward(me, foe, 1); },
    gasser(m, me, foe) { const d = toward(me, foe, 1); if (d < .85) stop(); o.punch = ['hook', 'upper', 'cross', 'hook'][Math.floor(r() * 4)]; },
    boxer(m, me, foe) { const d = toward(me, foe, 1); if (d < .95) stop(); o.guard = !!(foe.punch && foe.punch.phase !== 'recovery') && !me.punch; if (!o.guard && m.time >= next && d < 1.1) { o.punch = ['jab', 'jab', 'cross', 'bodyL', 'bodyR'][Math.floor(r() * 5)]; next = m.time + .7 + r() * .5; } },
  };
  return { decide(m, me, foe, dt) { if (open(m, me, dt)) BOTLOGIC[name](m, me, foe); return o; } };
}
const CUSTOM = ['noguard', 'whiffer', 'slipper', 'bodyman', 'hitrun', 'gasser', 'boxer'];

const blankRound = () => ({ thrown: 0, head: 0, body: 0, whiff: 0, hit: 0, bodyHit: 0, block: 0, slip: 0, takenClean: 0, oLanded: 0, kdP: 0, kdO: 0, guardT: 0, fightT: 0, sta: 100 });

/* one coach for the whole run, reset between matches, as the game does: the walk through the lists is part of what is tested */
const shared = createCoach({ HEAD });
function play(bot, level, seed, kind, extra = {}) {
  const m = createMatch({ seed, ...GAME_RING, ...extra });
  const b = CUSTOM.includes(bot) ? customBot(bot, seed * 3 + 11) : createBot(bot, { seed: seed * 7 + 1, kind }), ai = createAI({ difficulty: level, seed: seed * 13 + 5 });
  const c = shared; c.reset();
  const said = new Set();
  let guard = 0, bank = 0, contact = false, roundEnds = 0, r = blankRound(), leanedThisMatch = 0;
  const onRoundEnd = () => {
    roundEnds++; calls++;
    const out = c.line(m);
    roundsSeen[m.state] = (roundsSeen[m.state] || 0) + 1;
    checkText(out, bot + '/' + level + '/' + seed);
    if (said.has(out.text)) fail.push('repeat: ' + out.text + ' in ' + bot + '/' + level + '/' + seed);
    said.add(out.text); allSaid.add(out.text);
    saidCount[out.text] = (saidCount[out.text] || 0) + 1;
    if (c.line(m).text !== out.text) fail.push('second ask changed the line');
    tagCount[out.tag] = (tagCount[out.tag] || 0) + 1;
    const key = bot + (kind && bot === 'spam' ? ':' + kind : '');
    (byBot[key] = byBot[key] || {})[out.tag] = (byBot[key][out.tag] || 0) + 1;
    /* safety tags fire when and only when their state holds, against this test's own knockdown count */
    const want = expectTag(m, r.kdP > 0);
    if (want) { if (out.tag !== want) fail.push('state says ' + want + ' got ' + out.tag + ' head ' + m.p.head.toFixed(1) + ' kd ' + r.kdP + ' ohead ' + m.o.head.toFixed(1) + ' okd ' + r.kdO); }
    else if (SAFETY.has(out.tag) || RIVAL.has(out.tag)) fail.push('no state but tag ' + out.tag);
    if (r.kdO > 0 !== m.o.kd > 0) fail.push('sim kd and own kd differ');
    /* a line about the bar has to be true of the bar on the screen */
    const f = whose(out.tag, m), share = f.hp / f.maxHp;
    if (FINE.has(out.text) && share < BAR_FINE) fail.push('says the bar looks fine at hp ' + f.hp.toFixed(0) + ': ' + out.text);
    if (LEAN.has(out.text) && share < BAR_LEFT) fail.push('leans on the bar at hp ' + f.hp.toFixed(0) + ': ' + out.text);
    /* and not every time: never two in a row, so at most one in the two breaks a player hears in a match. This test also asks at the final bell, which the game does not. */
    {
      const leaning = LEAN.has(out.text);
      if (leaning && lastLeaned) fail.push('two bar lines in a row: ' + out.text);
      if (leaning && m.state === 'break') { leanedBreaks++; leanedThisMatch++; if (leanedThisMatch > 1) fail.push('two bar lines at the breaks of one match'); }
      if (SAFETY.has(out.tag) || RIVAL.has(out.tag)) lastLeaned = leaning;
    }
    /* a sign the rig only plays past HEAD.bad + SIGNS_SHOW is not named before that */
    if ((out.tag === 'self-bad' || out.tag === 'rival-bad') && LATE_SIGN.test(out.text) && f.head < HEAD.bad + SIGNS_SHOW) fail.push('names a late sign at head ' + f.head.toFixed(1) + ': ' + out.text);
    /* sentences about the round */
    r.sta = m.p.sta;
    for (const [frag, test] of TRUTH) if (out.text.includes(frag)) { truthSeen[frag] = (truthSeen[frag] || 0) + 1; if (!test(r)) fail.push('false: ' + out.text + ' ' + JSON.stringify(r)); }
    /* offerStop */
    const offer = c.offerStop(m);
    const wantOffer = m.state === 'break' && (m.p.head >= HEAD.bad || (r.kdP > 0 && m.p.head >= HEAD.warn));
    if (offer !== wantOffer) fail.push('offerStop ' + offer + ' want ' + wantOffer);
    if (offer) stopOffers++;
    if (m.state === 'break') offerAtBreak++;
  };
  while (m.state !== 'over' && guard++ < 900 / FRAME) {
    const ip = b.decide(m, m.p, m.o, FRAME), io = ai.decide(m, m.o, m.p, FRAME);
    m.step(0, ip, io); ip.punch = null; io.punch = null;
    if (m.state === 'fight') { r.fightT += FRAME; if (m.p.guarding) r.guardT += FRAME; }
    bank += FRAME; contact = false;
    while (bank >= STEP && m.state !== 'over') {
      bank -= STEP;
      const from = m.events.length;
      m.step(STEP, ip, io);
      for (let i = from; i < m.events.length; i++) { const k = m.events[i].type; if (k === 'hit' || k === 'block') contact = true; }
      if (contact) { bank = 0; break; }
    }
    /* same order as index.js: events are dispatched after the frame's ticks */
    for (const e of m.events) {
      c.onEvent(e);
      if (e.type === 'round_start') r = blankRound();
      if (e.type === 'throw' && e.who === 'p') { r.thrown++; if (e.tgt === 'body') r.body++; else r.head++; }
      if (e.type === 'whiff' && e.who === 'p') r.whiff++;
      if (e.type === 'hit' && e.who === 'p') { r.hit++; if (e.tgt === 'body') r.bodyHit++; }
      if (e.type === 'hit' && e.who === 'o') { r.oLanded++; if (e.clean) r.takenClean++; }
      if (e.type === 'block' && e.who === 'o') r.block++;
      if (e.type === 'slipped' && e.who === 'o') r.slip++;
      if (e.type === 'knockdown') { if (e.who === 'p') r.kdP++; else r.kdO++; }
      if (e.type === 'round_end') onRoundEnd();
    }
    m.events.length = 0;
  }
  if (m.state !== 'over') fail.push('never ended ' + bot);
  matches++;
  howEnded[m.result.how] = (howEnded[m.result.how] || 0) + 1;
  /* the coach's own counts against the sim's */
  const s = c.stats().match;
  for (const [id, f] of [['p', m.p], ['o', m.o]]) {
    if (s[id].thrown !== f.thrown) fail.push('thrown ' + s[id].thrown + ' sim ' + f.thrown);
    if (s[id].landed !== f.landed) fail.push('landed ' + s[id].landed + ' sim ' + f.landed);
    if (s[id].taken !== f.taken) fail.push('taken ' + s[id].taken + ' sim ' + f.taken);
    if (s[id].cleanTaken !== f.clean) fail.push('clean ' + s[id].cleanTaken + ' sim ' + f.clean);
    if (s[id].kd !== f.kdTotal) fail.push('kd ' + s[id].kd + ' sim ' + f.kdTotal);
  }
  return roundEnds;
}

const levels = ['easy', 'normal', 'hard'];
for (const bot of [...BOTS, ...CUSTOM]) {
  const kinds = bot === 'spam' ? ['jab', 'cross', 'hook', 'upper', 'bodyL', 'bodyR'] : [undefined];
  for (const kind of kinds) for (const level of levels) {
    const n = bot === 'spam' ? Math.max(4, Math.ceil(SEEDS / 3)) : SEEDS;
    for (let i = 0; i < n; i++) play(bot, level, 71000 + i * 17, kind);
  }
}
const pct = (n, of) => (of ? (n / of * 100).toFixed(0) : '0') + '%';
const fullCalls = calls, fullMatches = matches, fullTags = { ...tagCount }, fullSaid = new Set(allSaid), fullHow = { ...howEnded };
const tierOf = (t) => (t.startsWith('self') ? 'self' : t.startsWith('rival') ? 'rival' : t.startsWith('praise') ? 'praise' : t === 'watch' ? 'watch' : 'coaching');
const tiers = {}; for (const [t, n] of Object.entries(fullTags)) tiers[tierOf(t)] = (tiers[tierOf(t)] || 0) + n;

/* Rounds of 14 seconds, which the game does not have, keep the head load low, so the coaching and praise tiers run on real events too. Same checks. */
for (const k of Object.keys(tagCount)) delete tagCount[k];
for (const bot of ['learner', 'mixed', 'skilled', 'runner', 'turtle', 'guardjab', 'idle', ...CUSTOM]) for (const level of levels) for (let i = 0; i < SEEDS; i++) play(bot, level, 72000 + i * 31, undefined, { roundTime: 14 });
const shortTags = { ...tagCount };

print('REAL ROUNDS (60 s): matches', fullMatches, 'line calls', fullCalls, 'ended', JSON.stringify(fullHow));
print('  tags', JSON.stringify(Object.entries(fullTags).sort((a, b) => b[1] - a[1])));
print('  tiers', Object.entries(tiers).sort((a, b) => b[1] - a[1]).map(([t, n]) => t + ' ' + pct(n, fullCalls)).join(', '));
print('  different lines said', fullSaid.size);
print('SHORT ROUNDS (14 s, test only): tags', JSON.stringify(Object.entries(shortTags).sort((a, b) => b[1] - a[1])));
print('all: matches', matches, 'line calls', calls, 'at break', roundsSeen.break, 'at final bell', roundsSeen.over);
print('stop offers', stopOffers, 'of', offerAtBreak, 'breaks;', 'bar lines at breaks', leanedBreaks);
print('sentences checked against the round', JSON.stringify(truthSeen));
print('failures', fail.length); for (const f of [...new Set(fail)].slice(0, 40)) print('  ' + f);
for (const k of Object.keys(byBot)) print(' ', k, JSON.stringify(Object.entries(byBot[k]).sort((a, b) => b[1] - a[1])));

/* ---------- what one player hears over five rematches, at the game's real round length: the corner must not sound like the same two sentences ---------- */
function session(bot, level, seed, nMatches) {
  const coach = createCoach({ HEAD }), heard = [];
  for (let n = 0; n < nMatches; n++) {
    const s = seed + n * 1009, m = createMatch({ seed: s, ...GAME_RING }), b = createBot(bot, { seed: s + 2 }), ai = createAI({ difficulty: level, seed: s + 1 });
    coach.reset(); let bank = 0, g = 0;
    while (m.state !== 'over' && g++ < 54000) {
      const ip = b.decide(m, m.p, m.o, FRAME), io = ai.decide(m, m.o, m.p, FRAME);
      m.step(0, ip, io); ip.punch = null; io.punch = null; bank += FRAME;
      while (bank >= STEP) { bank -= STEP; const from = m.events.length; m.step(STEP, ip, io); let hit = false; for (let i = from; i < m.events.length; i++) { const k = m.events[i].type; if (k === 'hit' || k === 'block') hit = true; } if (hit) { bank = 0; break; } }
      for (const e of m.events) { coach.onEvent(e); if (e.type === 'round_end' && m.state === 'break') { const r = coach.line(m); heard.push({ n, round: e.round, tag: r.tag, text: r.text, head: m.p.head, hp: m.p.hp }); } }
      m.events.length = 0;
    }
  }
  return heard;
}
{
  const agg = { breaks: 0, distinct: 0, top2: 0, sessions: 0, self: 0, rival: 0, coaching: 0, praise: 0, watch: 0 };
  for (const bot of ['learner', 'skilled', 'mixed', 'guardjab']) for (const level of levels) for (let i = 0; i < 6; i++) {
    const h = session(bot, level, 71000 + i * 101, 5), c = {};
    for (const x of h) { c[x.text] = (c[x.text] || 0) + 1; agg[tierOf(x.tag)]++; }
    const counts = Object.values(c).sort((a, b) => b - a);
    agg.breaks += h.length; agg.distinct += counts.length; agg.top2 += (counts[0] || 0) + (counts[1] || 0); agg.sessions++;
  }
  const meanB = agg.breaks / agg.sessions, meanD = agg.distinct / agg.sessions, top2 = agg.top2 / agg.breaks;
  print('five rematches,', agg.sessions, 'players:', meanB.toFixed(1), 'breaks,', meanD.toFixed(1), 'different lines, two most said lines', pct(agg.top2, agg.breaks), 'of breaks;', JSON.stringify(agg));
  if (meanD < meanB - 1 || top2 > .35) { print('FAIL the corner repeats itself'); fail.push('repeats'); }
  print('one player, skilled on hard, what he hears:');
  for (const h of session('skilled', 'hard', 71000, 5)) print('  m' + (h.n + 1) + ' r' + h.round + ' ' + h.tag.padEnd(10) + ' ' + h.text);
}

/* ---------- every line, static checks ---------- */
let total = 0, staticFail = 0;
const seen = new Set();
const allLines = (pool) => [...(pool.fine || []), ...(pool.bar || []), ...(pool.any || [])];
for (const [tag, pool] of Object.entries(COACH_LINES)) {
  if (pool.any.length < 3) { print('short pool', tag, pool.any.length); staticFail++; }
  for (const t of allLines(pool)) {
    total++;
    if (seen.has(t)) { print('duplicate', t); staticFail++; } seen.add(t);
    const before = fail.length; checkText({ text: t }, tag); if (fail.length > before) { print('BAD', fail[fail.length - 1]); staticFail++; }
  }
}
/* the two lists that speak just past HEAD.bad name no late sign, and what the rig plays still fits what the lists assume */
for (const key of ['self-bad', 'rival-bad']) for (const t of allLines(COACH_LINES[key])) if (LATE_SIGN.test(t)) { print('late sign in the early list', t); staticFail++; }
const rig = readFile(SITE + '../people/rig.js');
for (const needle of ['bad = sstep(13, 15, headLoad)', 'bad > 0.5 ? 0.42', 'bad = sstep(12.5, 17.5, me.head ?? 0)']) if (!rig.includes(needle)) { print('rig.js changed, re-check SIGNS_SHOW in coach.js:', needle); staticFail++; }
print('lines', total, 'static failures', staticFail, 'said at least once in play', allSaid.size);
const never = [...seen].filter((t) => !allSaid.has(t));
print('never said in these matches, only in the forced states below:', never.length);

/* ---------- adversarial: forced states with fake matches, so every list is used hard ---------- */
const STATES = {
  'self-bad': { p: { head: 14 } },
  'self-down-warn': { p: { head: 8, kd: 1 } },
  'self-warn': { p: { head: 8 } },
  'self-down': { p: { head: 2, kd: 1 } },
  'rival-bad': { o: { head: 14 } },
  'rival-warn': { o: { head: 8 } },
  'rival-down': { o: { head: 2, kd: 1 } },
};
function fake(round, state, over = {}) {
  const f = (o = {}) => ({ head: 0, hp: 100, maxHp: 100, sta: 100, maxSta: 100, kd: 0, ...o });
  return { round, state, p: f(over.p), o: f(over.o) };
}
let advFail = 0;
const note = (m) => { advFail++; if (advFail < 20) print('ADV', m); };
for (const [tag, st] of Object.entries(STATES)) for (const hp of [100, BAR_FINE * 100, 60, BAR_LEFT * 100, 20]) {
  const c = createCoach({ HEAD });
  for (let match = 0; match < 12; match++) {
    c.reset();
    const said = new Set();
    for (let r = 1; r <= 3; r++) {
      const m = fake(r, r < 3 ? 'break' : 'over', { p: { ...st.p, hp }, o: { ...st.o, hp } });
      const got = c.line(m);
      if (got.tag !== tag) note('tag ' + got.tag + ' want ' + tag);
      if (said.has(got.text)) note('repeat ' + got.text);
      said.add(got.text);
      if (FINE.has(got.text) && hp < BAR_FINE * 100) note('bar looks fine at hp ' + hp + ': ' + got.text);
      if (LEAN.has(got.text) && hp < BAR_LEFT * 100) note('leans on the bar at hp ' + hp + ': ' + got.text);
      c.onEvent({ type: 'round_start', round: r + 1, who: null });
    }
  }
}
/* random states and random events: every call answers, no repeats, the tag agrees with the state, the bar and the signs stay true */
const rnd = rng(12345);
const fuzzTags = {};
for (let i = 0; i < 40000; i++) {
  const c = createCoach({ HEAD });
  const said = new Set();
  for (let r = 1; r <= 3; r++) {
    c.onEvent({ type: 'round_start', round: r, who: null });
    const n = Math.floor(rnd() * 80);
    for (let k = 0; k < n; k++) {
      const who = rnd() < .5 ? 'p' : 'o', def = who === 'p' ? 'o' : 'p', x = rnd(), tgt = rnd() < .75 ? 'head' : 'body';
      const type = x < .4 ? 'throw' : x < .6 ? 'whiff' : x < .8 ? 'hit' : x < .93 ? 'block' : 'slipped';
      c.onEvent({ type, who, def, tgt, clean: type === 'hit' && tgt === 'head', blocked: type === 'block' });
    }
    const mk = () => ({ head: rnd() < .5 ? rnd() * 25 : 0, hp: rnd() * 100, maxHp: 100, sta: rnd() * 100, maxSta: 100, kd: rnd() < .1 ? 1 : 0 });
    const m = { round: r, state: r < 3 ? 'break' : 'over', p: mk(), o: mk() };
    if (m.p.kd) c.onEvent({ type: 'knockdown', who: 'p' }); if (m.o.kd) c.onEvent({ type: 'knockdown', who: 'o' });
    const got = c.line(m);
    fuzzTags[got.tag] = (fuzzTags[got.tag] || 0) + 1;
    if (!got.text) note('empty');
    if (said.has(got.text)) note('fuzz repeat ' + got.text);
    said.add(got.text);
    const want = expectTag(m, m.p.kd > 0);
    if (want ? got.tag !== want : (SAFETY.has(got.tag) || RIVAL.has(got.tag))) note('fuzz tag ' + got.tag + ' want ' + want);
    const f = whose(got.tag, m), share = f.hp / f.maxHp;
    if (FINE.has(got.text) && share < BAR_FINE) note('fuzz fine ' + f.hp.toFixed(0) + ' ' + got.text);
    if (LEAN.has(got.text) && share < BAR_LEFT) note('fuzz lean ' + f.hp.toFixed(0) + ' ' + got.text);
    if ((got.tag === 'self-bad' || got.tag === 'rival-bad') && LATE_SIGN.test(got.text) && f.head < HEAD.bad + SIGNS_SHOW) note('fuzz sign ' + f.head.toFixed(1) + ' ' + got.text);
    const wantOffer = m.state === 'break' && (m.p.head >= HEAD.bad || (m.p.kd > 0 && m.p.head >= HEAD.warn));
    if (c.offerStop(m) !== wantOffer) note('fuzz offer');
  }
}
print('adversarial failures', advFail, 'fuzz tags', JSON.stringify(Object.entries(fuzzTags).sort((a, b) => b[1] - a[1])));
/* a rematch sounds different: the same state twice in a row gives a different first line */
{
  const c = createCoach({ HEAD }), a = c.line(fake(1, 'break', STATES['self-warn'])); c.reset();
  const b = c.line(fake(1, 'break', STATES['self-warn']));
  print('rematch first lines differ', a.text !== b.text);
  if (a.text === b.text) staticFail++;
}
/* no DOM in the module */
const src = readFile(SITE + 'coach.js');
const hasDom = /\b(document|window|localStorage|import\s)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''));
print('module mentions document/window/import:', hasDom);
print('RESULT', fail.length + advFail + staticFail + (hasDom ? 1 : 0) === 0 ? 'pass' : 'FAIL', 'failures', fail.length, 'adversarial', advFail, 'static', staticFail);
print('\n---- every line ----');
for (const [tag, pool] of Object.entries(COACH_LINES)) {
  print('[' + tag + (pool.tag ? ', says tag ' + pool.tag : '') + ']');
  for (const t of pool.fine || []) print('  (fine) ' + t + '  {' + words(t) + (allSaid.has(t) ? '' : ', never in play') + '}');
  for (const t of pool.bar || []) print('  (bar) ' + t + '  {' + words(t) + (allSaid.has(t) ? '' : ', never in play') + '}');
  for (const t of pool.any) print('  ' + t + '  {' + words(t) + (allSaid.has(t) ? '' : ', never in play') + '}');
}
