/* The corner's lines against the real sim, AI and bots, in the game's real frame loop, plus forced states and random states.
   Run from anywhere: /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m site/gfx/dev/coachtest.js
   Prints failures, how often each tag fired, then every line once to read as a player would. */
const SITE = String(import.meta.url).replace(/^file:\/\//, '').replace(/dev\/[^\/]*$/, 'arena/'); // JavaScriptCore has no URL
const { createMatch, setReach, STEP, HEAD } = await import(SITE + 'sim.js');
const { createAI, createBot, BOTS, LEVELS } = await import(SITE + 'ai.js');
const { createCoach, COACH_LINES } = await import(SITE + 'coach.js');
setReach(JSON.parse(readFile(SITE + 'reach.json')));
const GAME_RING = { ringHalf: 2.9, corners: { blue: [-2.5, -2.5], red: [2.5, 2.5] } };
const FRAME = 1 / 60;
const SEEDS = typeof arguments !== 'undefined' && arguments[0] ? +arguments[0] : 20;
const SAFETY = new Set(['self-bad', 'self-down-warn', 'self-warn', 'self-down']), RIVAL = new Set(['rival-bad', 'rival-warn', 'rival-down']);

const NUMWORD = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third|fourth|half|once|twice|dozen|percent|couple)\b/i;
const FORBID = /\b(concussion|concussed|concuss\w*|brain|injury|injured|loads?|meter|gauge|levels?|points?|score|percent|quantity|fight through|keep going|keep fighting|tough it out|shake it off|walk it off|push through|you'?re fine|you are fine|you have a|you've got a|diagnos\w*|he has a)\b/i;
const words = (s) => s.trim().split(/\s+/).length;

const fail = [];
const tagCount = {}, byBot = {}, roundsSeen = { break: 0, over: 0 };
let matches = 0, calls = 0, stopOffers = 0, offerAtBreak = 0;
const allSaid = new Set();
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

/* one coach for the whole run, reset between matches, as the game does: the rotation through the lists is part of what is tested */
const shared = createCoach({ HEAD });
function play(bot, level, seed, kind, extra = {}) {
  const m = createMatch({ seed, ...GAME_RING, ...extra });
  const b = createBot(bot, { seed: seed * 7 + 1, kind }), ai = createAI({ difficulty: level, seed: seed * 13 + 5 });
  const c = shared; c.reset();
  const said = new Set();
  let guard = 0, bank = 0, contact = false, roundEnds = 0;
  const onRoundEnd = () => {
    roundEnds++;
    calls++;
    const r = c.line(m);
    roundsSeen[m.state] = (roundsSeen[m.state] || 0) + 1;
    checkText(r, bot + '/' + level + '/' + seed);
    if (said.has(r.text)) fail.push('repeat: ' + r.text + ' in ' + bot + '/' + level + '/' + seed);
    said.add(r.text); allSaid.add(r.text);
    if (c.line(m).text !== r.text) fail.push('second ask changed the line');
    tagCount[r.tag] = (tagCount[r.tag] || 0) + 1;
    const key = bot + (kind && bot === 'spam' ? ':' + kind : '');
    (byBot[key] = byBot[key] || {})[r.tag] = (byBot[key][r.tag] || 0) + 1;
    /* safety tags fire when and only when their state holds */
    const want = expectTag(m, m.p.kd > 0);
    if (want) { if (r.tag !== want) fail.push('state says ' + want + ' got ' + r.tag + ' head ' + m.p.head.toFixed(1) + ' kd ' + m.p.kd + ' ohead ' + m.o.head.toFixed(1) + ' okd ' + m.o.kd); }
    else if (SAFETY.has(r.tag) || RIVAL.has(r.tag)) fail.push('no state but tag ' + r.tag);
    /* bar lines only when the bar really is fine */
    if (/\b(bar looks fine|never mind the bar|ignore his bar|don't trust the bar)\b/i.test(r.text)) {
      const f = r.tag.startsWith('self') ? m.p : m.o;
      if (f.hp / f.maxHp < .5) fail.push('bar line with a low bar: ' + r.text + ' hp ' + f.hp);
    }
    /* offerStop */
    const offer = c.offerStop(m);
    const wantOffer = m.state === 'break' && (m.p.head >= HEAD.bad || (m.p.kd > 0 && m.p.head >= HEAD.warn));
    if (offer !== wantOffer) fail.push('offerStop ' + offer + ' want ' + wantOffer);
    if (offer) stopOffers++;
    if (m.state === 'break') offerAtBreak++;
  };
  while (m.state !== 'over' && guard++ < 900 / FRAME) {
    const ip = b.decide(m, m.p, m.o, FRAME), io = ai.decide(m, m.o, m.p, FRAME);
    m.step(0, ip, io); ip.punch = null; io.punch = null;
    bank += FRAME; contact = false;
    while (bank >= STEP && m.state !== 'over') {
      bank -= STEP;
      const from = m.events.length;
      m.step(STEP, ip, io);
      for (let i = from; i < m.events.length; i++) { const k = m.events[i].type; if (k === 'hit' || k === 'block') contact = true; }
      if (contact) { bank = 0; break; }
    }
    /* same order as index.js: events are dispatched after the frame's ticks */
    for (const e of m.events) { c.onEvent(e); if (e.type === 'round_end') onRoundEnd(); }
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
for (const bot of BOTS) {
  const kinds = bot === 'spam' ? ['jab', 'cross', 'hook', 'upper', 'bodyL', 'bodyR'] : [undefined];
  for (const kind of kinds) for (const level of levels) {
    const n = bot === 'spam' ? Math.max(4, Math.ceil(SEEDS / 3)) : SEEDS;
    for (let i = 0; i < n; i++) play(bot, level, 1000 + i * 17, kind);
  }
}

const fullCalls = calls, fullTags = { ...tagCount };
/* Short rounds keep the head load low, so the coaching and praise tiers run on real events too. Same checks. */
for (const k of Object.keys(tagCount)) delete tagCount[k];
for (const bot of ['learner', 'mixed', 'skilled', 'runner', 'turtle', 'guardjab', 'idle']) for (const level of levels) for (let i = 0; i < 12; i++) play(bot, level, 2000 + i * 31, undefined, { roundTime: 12 });
print('short rounds, tags', JSON.stringify(Object.entries(tagCount).sort((a, b) => b[1] - a[1])));
print('matches', matches, 'line calls', calls, 'at break', roundsSeen.break, 'at final bell', roundsSeen.over, 'ended', JSON.stringify(howEnded));
print('stop offers', stopOffers, 'of', offerAtBreak, 'breaks');
print('failures', fail.length); for (const f of [...new Set(fail)].slice(0, 40)) print('  ' + f);
print('full rounds, tags', JSON.stringify(Object.entries(fullTags).sort((a, b) => b[1] - a[1])));
for (const k of Object.keys(byBot)) print(' ', k, JSON.stringify(Object.entries(byBot[k]).sort((a, b) => b[1] - a[1])));

/* every line, static checks */
let total = 0, staticFail = 0;
const seen = new Set();
for (const [tag, pool] of Object.entries(COACH_LINES)) {
  const n = pool.any.length + pool.bar.length;
  if (pool.any.length < 3) { print('short pool', tag, pool.any.length); staticFail++; }
  for (const t of [...pool.bar, ...pool.any]) {
    total++;
    if (seen.has(t)) { print('duplicate', t); staticFail++; } seen.add(t);
    const before = fail.length; checkText({ text: t }, tag); if (fail.length > before) { print('BAD', fail[fail.length - 1]); staticFail++; }
  }
}
print('lines', total, 'static failures', staticFail, 'said at least once in play', allSaid.size);


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
for (const [tag, st] of Object.entries(STATES)) for (const lowBar of [false, true]) {
  const c = createCoach({ HEAD });
  for (let match = 0; match < 12; match++) {
    c.reset();
    const said = new Set();
    for (let r = 1; r <= 3; r++) {
      const m = fake(r, r < 3 ? 'break' : 'over', { p: { ...st.p, ...(lowBar ? { hp: 20 } : {}) }, o: { ...st.o, ...(lowBar ? { hp: 20 } : {}) } });
      const got = c.line(m);
      if (got.tag !== tag) note('tag ' + got.tag + ' want ' + tag);
      if (said.has(got.text)) note('repeat ' + got.text);
      said.add(got.text);
      if (lowBar && /\b(bar looks fine|never mind the bar|ignore his bar|don't trust the bar)\b/i.test(got.text)) note('bar line on a low bar: ' + got.text);
      c.onEvent({ type: 'round_start', round: r + 1, who: null });
    }
  }
}
/* random states and random events: every call answers, no repeats, the tag agrees with the state */
const rnd = (() => { let a = 12345; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
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
}
/* no DOM in the module */
const src = readFile(SITE + 'coach.js');
print('module mentions document/window/import:', /\b(document|window|localStorage|import\s)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
print('\n---- every line ----');
for (const [tag, pool] of Object.entries(COACH_LINES)) { print('[' + tag + ']'); for (const t of pool.bar) print('  (bar) ' + t + '  {' + words(t) + '}'); for (const t of pool.any) print('  ' + t + '  {' + words(t) + '}'); }
