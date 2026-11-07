/* The fight HUD: bars, clock, pips, banners, combos, panels, loading screen, touch buttons. All DOM, all under .arena-x.

   createHud(rootEl, opts) -> { update(match, dt), onEvent(ev), showLoading(p, label), destroy(),
                                setPaused(bool), paused, reset(), stick, el, ready }
   opts: touch (default: coarse pointer), onPause(), onResume(), onRematch(), onExit(), onInput(code, down), onEndPanel(on)

   The HUD reads the sim and nothing else, and it never reads the hidden head load: that number is the point of the game and
   the player has to find it by watching the fighters. No code in this file touches `fighter.head`.

   Timers run on the dt passed to update(), so they behave under hit-stop and pause. Nothing relies on animationend,
   because the site's reduced-motion rules remove CSS animations with !important. Those rules are why every resting style
   in arena.css is already the finished look. */

const CSS_HREF = new URL('./arena.css', import.meta.url).href;
const CARRY_KEY = 'arena.carry.shown';
const CSS_WAIT = 15;       // seconds on screen for one try at the stylesheet
const FONT_WAIT = 1500;    // ms the load screen waits for its fonts before going up anyway
let carryShown = false; // falls back to this when sessionStorage is blocked

const CHUNK_HOLD = 0.42;   // seconds the damage chunk waits before draining
const COMBO_GAP = 1.3;     // seconds between hits that still count as one combo
const END_DELAY = { ko: 3.6, tko: 3.6, stopped: 4.2, decision: 2.9 };
const TOUCH_PUNCHES = [
  ['Jab', 'KeyJ', 'j', ''], ['Cross', 'KeyK', 'k', ''], ['Hook', 'KeyL', 'l', ''],
  ['Upper', 'KeyU', 'u', ''], ['Body L', 'KeyI', 'i', ' ax-tb-body'], ['Body R', 'KeyO', 'o', ' ax-tb-body'],
];
const TIPS = [
  'Health is not the whole story. Watch how he stands.',
  'Slow hands and a late guard mean something. Keep your eyes on him.',
  'A referee can stop a fight long before the bar runs out.',
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const other = (who) => (who === 'p' ? 'o' : 'p');
const power01 = (p) => clamp01(p || 0);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function coarsePointer() {
  try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; }
}
/* Same three signals the site's settings write: the body class, the data attribute, the OS preference. */
function reducedMotion() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem('iti.settings.v1') || 'null'); } catch (e) { st = null; }
  const b = document.body;
  let os = false;
  try { os = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { os = false; }
  return os || (b && (b.classList.contains('reduce-motion') || b.dataset.reduceMotion === '1')) || !!(st && st.motion);
}
function textSize() {
  const d = document.documentElement.dataset.textSize;
  if (d) return d;
  try {
    const st = JSON.parse(localStorage.getItem('iti.settings.v1') || 'null');
    return (st && st.textsize) || 'normal';
  } catch (e) { return 'normal'; }
}
/* Without the stylesheet the fight would run unseen under the lobby, so this rejects and the load fails: one retry, for a sheet that failed or hung. Seconds behind another app do not count. */
function ensureCss() {
  const old = [...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => /arena\.css(\?|$)/.test(l.href));
  if (old.some((l) => l.sheet)) return Promise.resolve();
  old.forEach((l) => l.remove());
  const one = (href) => new Promise((ok, no) => {
    const link = document.createElement('link');
    let seen = 0, tick = 0;
    const done = (err) => { clearInterval(tick); if (err) { link.remove(); no(err); } else ok(); };
    tick = setInterval(() => { if (!document.hidden && ++seen >= CSS_WAIT) done(Object.assign(new Error('arena.css timed out'), { hung: true })); }, 1000);
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => done());
    link.addEventListener('error', () => done(new Error('arena.css failed')));
    document.head.appendChild(link);
  });
  return one(CSS_HREF).catch(() => one(CSS_HREF + '?again=1')).catch((e) => { throw Object.assign(e, { kind: 'net' }); });
}
function loadFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const faces = ['500 16px ArenaBarlow', '600 16px ArenaBarlow', '700 16px ArenaBarlow', 'italic 700 16px ArenaBarlow', 'italic 800 16px ArenaBarlow', 'italic 900 16px ArenaBarlow'];
  return Promise.all(faces.map((f) => document.fonts.load(f, 'FIGHT 0123456789').catch(() => null)));
}

const sideHtml = (id) => `
<div class="ax-side ax-side-${id}">
  <div class="ax-bars">
    <div class="ax-hp"><span class="ax-hp-chunk"></span><span class="ax-hp-fill"></span><span class="ax-hp-flash"></span><span class="ax-hp-gloss"></span></div>
    <div class="ax-sta"><span class="ax-sta-fill"></span></div>
  </div>
  <div class="ax-plate"><span class="ax-corner"></span><span class="ax-name"></span><span class="ax-tired">Tired</span><span class="ax-pips"></span></div>
</div>`;

const kv = (keys, label) => `<span class="ax-kv">${keys.map((k) => `<span class="ax-key">${k}</span>`).join('')}<span>${label}</span></span>`;
const keysHtml = () => `<div class="ax-keys">${kv(['W', 'A', 'S', 'D'], 'Move')}${kv(['J'], 'Jab')}${kv(['K'], 'Cross')}${kv(['L'], 'Hook')}${kv(['U'], 'Uppercut')}${kv(['I'], 'Body left')}${kv(['O'], 'Body right')}${kv(['Shift'], 'Guard')}${kv(['Space'], 'Slip')}${kv(['Esc'], 'Pause')}</div>`;
const touchNote = '<div class="ax-touchnote">Left thumb moves you. Right thumb punches, guards and slips.</div>';

const TEMPLATE = (touch) => `
<div class="ax-sr" aria-live="polite"></div>
<div class="ax-vig"></div><div class="ax-white"></div>
<div class="ax-lb ax-lb-t"></div><div class="ax-lb ax-lb-b"></div>
<div class="ax-top">
  ${sideHtml('p')}
  <div class="ax-clockbox">
    <svg class="ax-clockplate" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="ax-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0b0d"/><stop offset=".7" stop-color="#191b20"/><stop offset="1" stop-color="#25272d"/></linearGradient></defs>
      <path d="M0 0H100L83 100H17Z" fill="url(#ax-plate)"/>
      <path d="M0 0L17 100H83L100 0" fill="none" stroke="#e6b450" stroke-opacity=".85" stroke-width="1.25" vector-effect="non-scaling-stroke"/>
    </svg>
    <div class="ax-clock"></div>
    <div class="ax-rlabel"></div>
    <button class="ax-pausebtn" type="button" data-act="pause" aria-label="Pause" tabindex="-1"></button>
  </div>
  ${sideHtml('o')}
</div>
<div class="ax-call ax-call-p"></div><div class="ax-call ax-call-o"></div>
<div class="ax-combo ax-combo-p"><div class="ax-combo-line"><span class="ax-combo-n"></span><span class="ax-combo-w">Hits</span></div><div class="ax-combo-d"></div></div>
<div class="ax-combo ax-combo-o"><div class="ax-combo-line"><span class="ax-combo-n"></span><span class="ax-combo-w">Hits</span></div><div class="ax-combo-d"></div></div>
<div class="ax-bn" aria-hidden="true">
  <div class="ax-bn-burst"></div><div class="ax-bn-glow"></div>
  <div class="ax-bn-in">
    <div class="ax-bn-band"></div>
    <div class="ax-bn-word"><div class="ax-bn-back"></div><div class="ax-bn-main"></div><div class="ax-bn-ghost"></div></div>
    <div class="ax-bn-num"><span class="ax-bn-numb"></span><span class="ax-bn-numf"></span></div><div class="ax-bn-sub"></div><div class="ax-bn-tag"></div><div class="ax-bn-up"><span class="ax-bn-upf"></span></div>
  </div>
</div>
<div class="ax-cap" aria-hidden="true"></div>
${touch ? '' : `<div class="ax-hint is-off" aria-hidden="true"><div class="ax-hint-in">${keysHtml()}</div></div>`}
${touch ? `<div class="ax-touch">
  <div class="ax-stickzone" aria-label="Move"><div class="ax-stick"><div class="ax-knob"></div></div></div>
  <div class="ax-tbtns">
    ${TOUCH_PUNCHES.map(([l, c, k, x]) => `<button class="ax-tb${x}" type="button" data-code="${c}" data-key="${k}">${l}</button>`).join('')}
    <button class="ax-tb ax-tb-guard" type="button" data-code="ShiftLeft" data-key="Shift">Guard</button>
    <button class="ax-tb ax-tb-slip" type="button" data-code="Space" data-key=" ">Slip</button>
  </div>
</div>` : ''}
<div class="ax-panel ax-pause" role="dialog" aria-modal="true" aria-label="Paused">
  <div class="ax-card">
    <div class="ax-title">Paused</div>
    <div class="ax-pause-note" role="status"></div>
    <div class="ax-pause-keys">${touch ? touchNote : keysHtml()}</div>
    <div class="ax-btnrow">
      <button class="ax-btn ax-btn-go" type="button" data-act="resume"><span>Resume</span></button>
      <button class="ax-btn" type="button" data-act="rematch"><span>Restart</span></button>
      <button class="ax-btn" type="button" data-act="exit"><span>Exit</span></button>
    </div>
  </div>
</div>
<div class="ax-panel ax-end" role="dialog" aria-modal="true" aria-label="Fight result">
  <div class="ax-card">
    <div class="ax-title"></div>
    <div class="ax-how"></div>
    <div class="ax-score"></div>
    <div class="ax-stats"></div>
    <div class="ax-report"></div>
    <div class="ax-carry"></div>
    <div class="ax-btnrow">
      <button class="ax-btn ax-btn-go" type="button" data-act="rematch"><span>Rematch</span></button>
      <button class="ax-btn" type="button" data-act="exit"><span>Exit</span></button>
    </div>
  </div>
</div>
<div class="ax-load" role="status" aria-label="Loading">
  <button class="ax-load-exit" type="button" data-act="exit">Exit</button>
  <div class="ax-load-in">
    <div class="ax-load-kick">Inside the Impact</div>
    <div class="ax-load-title">Street Fight</div>
    <div class="ax-load-bar"><span class="ax-load-fill"></span></div>
    <div class="ax-load-row"><span class="ax-load-label">Loading</span><span class="ax-load-pct">0%</span></div>
    <div class="ax-load-note"></div>
    <div class="ax-load-keys">${touch ? touchNote : keysHtml()}</div>
    <div class="ax-load-tip"></div>
  </div>
</div>`;

export function createHud(rootEl, opts = {}) {
  const scope = rootEl.closest('.arena-x') || (rootEl.classList.add('arena-x'), rootEl);
  const touch = opts.touch == null ? coarsePointer() : !!opts.touch;
  const hud = document.createElement('div');
  hud.className = 'ax-hud';
  hud.dataset.touch = touch ? '1' : '0';
  hud.style.display = 'none'; // until the stylesheet is in: no raw markup flashes and no transition runs on arrival
  hud.innerHTML = TEMPLATE(touch);
  rootEl.appendChild(hud);
  const q = (s) => hud.querySelector(s);
  const qa = (s) => [...hud.querySelectorAll(s)];

  scope.dataset.axText = textSize();
  let reduced = reducedMotion();
  scope.classList.toggle('ax-rm', reduced);

  let destroyed = false;
  /* fonts come after the stylesheet, which is what names them, and a slow font does not hold the fight back */
  const ready = ensureCss().then(() => { if (!destroyed) { hud.style.display = ''; fitLoadTitle(); } return Promise.race([loadFonts(), new Promise((ok) => setTimeout(ok, FONT_WAIT))]); }).then(() => { fitLoadTitle(); });

  /* ── element refs ─────────────────────────────────────────────────── */
  const sr = q('.ax-sr'), vig = q('.ax-vig'), white = q('.ax-white');
  const clockBox = q('.ax-clockbox'), clockEl = q('.ax-clock'), rlabel = q('.ax-rlabel');
  const bn = q('.ax-bn'), bnMain = q('.ax-bn-main'), bnBack = q('.ax-bn-back'), bnGhost = q('.ax-bn-ghost'), bnNum = q('.ax-bn-num'), bnNumF = q('.ax-bn-numf'), bnNumB = q('.ax-bn-numb'), bnSub = q('.ax-bn-sub'), bnTag = q('.ax-bn-tag'), bnUp = q('.ax-bn-up'), bnUpF = q('.ax-bn-upf'), cap = q('.ax-cap');
  const hint = q('.ax-hint');
  const pausePanel = q('.ax-pause'), endPanel = q('.ax-end');
  const endTitle = endPanel.querySelector('.ax-title'), endHow = q('.ax-how'), endScore = q('.ax-score'), endStats = q('.ax-stats'), endReport = q('.ax-report'), endCarry = q('.ax-carry');
  const load = q('.ax-load'), loadFill = q('.ax-load-fill'), loadPct = q('.ax-load-pct'), loadLabel = q('.ax-load-label'), loadTip = q('.ax-load-tip'), loadNote = q('.ax-load-note'), loadTitle = q('.ax-load-title');
  const resumeBtn = pausePanel.querySelector('[data-act="resume"]'), pauseNote = q('.ax-pause-note');
  /* the title is one unbroken word pair: until the condensed font arrives a wider one must still fit the screen */
  function fitLoadTitle() {
    if (destroyed) return;
    loadTitle.style.fontSize = '';
    const room = loadTitle.parentElement.clientWidth, w = loadTitle.scrollWidth;
    if (room > 0 && w > room) loadTitle.style.fontSize = (parseFloat(getComputedStyle(loadTitle).fontSize) * room / w * 0.98).toFixed(1) + 'px';
  }
  loadTip.textContent = TIPS[Math.floor(Math.random() * TIPS.length) % TIPS.length];

  const makeSide = (id) => {
    const r = q('.ax-side-' + id);
    return {
      id, r,
      fill: r.querySelector('.ax-hp-fill'), chunkEl: r.querySelector('.ax-hp-chunk'), flash: r.querySelector('.ax-hp-flash'),
      staEl: r.querySelector('.ax-sta-fill'), nameEl: r.querySelector('.ax-name'), cornerEl: r.querySelector('.ax-corner'), pipsEl: r.querySelector('.ax-pips'),
      pips: [],
      v: 1, shown: 1, chunk: 1, hold: 0, sta: 1, wFill: -1, wChunk: -1, wSta: -1, low: false, tired: false, name: null,
      comboEl: q('.ax-combo-' + id), comboN: q('.ax-combo-' + id + ' .ax-combo-n'), comboW: q('.ax-combo-' + id + ' .ax-combo-w'), comboD: q('.ax-combo-' + id + ' .ax-combo-d'), comboLine: q('.ax-combo-' + id + ' .ax-combo-line'),
      n: 0, comboT: 0, dmg: 0, wDmg: -1, callEl: q('.ax-call-' + id), callT: 0, thrown: 0,
    };
  };
  const S = { p: makeSide('p'), o: makeSide('o') };

  /* ── match bookkeeping ────────────────────────────────────────────── */
  let match = null, lastState = null, shownRound = 0, foughtRound = 0, overShown = false, overT = 0, endShown = false, endHow_ = null;
  let wCalm = false, bKind = null, bT = 0, bOut = 0, downWho = null, wCount = -1, wUp = -1, lastSec = -1, wRound = null, hintT = 0, hintGone = false, paused = false, wPips = '', loadTimer = 0, loadP = 0, endEv = null;
  const queue = [];
  const roundLog = [];

  const say = (t) => { sr.textContent = t; };
  const pop = (el, keyframes, ms, easing = 'ease-out') => { if (!reduced && el.animate) el.animate(keyframes, { duration: ms, easing }); };
  const SLAM = [{ transform: 'scale(1.55)' }, { transform: 'scale(.97)', offset: .6 }, { transform: 'none' }];
  const POP = [{ transform: 'scale(1.4)' }, { transform: 'none' }];

  /* ── banners ──────────────────────────────────────────────────────── */
  function banner(kind, word, sub = '', dur = 2, tag = '') {
    bKind = kind; bT = dur; bOut = 0;
    bnMain.textContent = word; bnBack.textContent = word; bnGhost.textContent = word; bnSub.textContent = sub; bnTag.textContent = tag;
    bnNumF.textContent = ''; bnNumB.textContent = '';
    /* only a banner replacing a visible one needs the forced layout to restart its animation; from hidden it restarts by itself */
    if (bn.classList.contains('is-on')) { bn.className = 'ax-bn'; void bn.offsetWidth; }
    bn.className = 'ax-bn is-on k-' + kind;
  }
  function endBanner() {
    if (!bKind || bOut > 0) return;
    bOut = bKind === 'fight' ? 0.18 : 0.24;
    bn.classList.add('is-out');
  }
  function clearBanner() {
    bKind = null; bT = 0; bOut = 0; downWho = null; wCount = -1;
    bn.className = 'ax-bn';
  }
  function showRound(m) {
    if (shownRound === m.round) return;
    shownRound = m.round;
    const last = m.rounds > 1 && m.round === m.rounds;
    banner('round', last ? 'Final round' : 'Round ' + m.round, '', 3);
    say(last ? 'Final round' : 'Round ' + m.round);
  }
  function showFight(m) {
    if (foughtRound === m.round) return;
    foughtRound = m.round;
    banner('fight', 'Fight', '', .42);
    say('Fight');
    if (!hintGone) hintOn();
  }
  function showDown(m, ev) {
    const who = m.p.down ? 'p' : m.o.down ? 'o' : (ev && ev.who) || null;
    if (!who || (bKind === 'down' && downWho === who)) return;
    const f = m[who];
    const n = (f.down && f.down.n) || 1;
    const sub = who === 'p' ? (touch ? 'Tap any punch to get up' : 'Mash J, K or L to get up') : (f.name || 'He') + ' is down';
    banner('down', 'Down', sub, 60, 'Knockdown ' + n + ' of 3');
    downWho = who; wCount = -1;
    say(who === 'p' ? 'You are down. ' + sub : sub);
    endCombo(S.p); endCombo(S.o); clearCalls(); hintOff();
    flash(white, .32, 170);
  }
  function showCount(m) {
    if (!downWho) return;
    const d = m[downWho] && m[downWho].down;
    const c = d ? d.count | 0 : 0;
    if (c === wCount) return;
    wCount = c;
    bnNumF.textContent = bnNumB.textContent = c > 0 ? String(c) : '';
    if (c > 0) { pop(bnNum, SLAM, 240); say(String(c)); }
  }
  function showBackUp() {
    if (bKind !== 'down') return;
    downWho = null; wCount = -1;
    banner('fight', 'Fight', '', .42);
  }
  function showTime(m) {
    if (bKind === 'time') return;
    const i = m.round - 1, sc = readScores(m)[i];
    banner('time', 'Time', sc ? 'Round ' + m.round + ': ' + nameOf(m.p) + ' ' + sc.p + ' - ' + sc.o + ' ' + nameOf(m.o) : 'End of round ' + m.round, 3.4);
    say('End of round ' + m.round);
    endCombo(S.p); endCombo(S.o);
  }
  function showOver(m) {
    if (overShown) return;
    overShown = true; overT = 0;
    hud.classList.add('is-over');
    const r = readResult(m);
    hintOff(); clearCalls();
    endCombo(S.p); endCombo(S.o);
    /* The word lands with the final blow in the lower third, so the men and the slow motion stay in view. A caption stays in the letterbox. */
    cap.dataset.k = r.how; /* a tall screen sets the caption under the word, which has a different size for each ending */
    if (r.how === 'ko') { banner('ko', 'KO', '', 2.6); cap.textContent = 'Knockout'; }
    else if (r.how === 'tko') { banner('tko', 'TKO', '', 2.6); cap.textContent = 'Three knockdowns in one round'; }
    else if (r.how === 'stopped') { banner('stopped', 'Stopped', '', 3); cap.textContent = 'The referee stops the fight'; }
    else banner('decision', 'Decision', 'The judges have their scores', 30);
    say(r.how === 'decision' ? 'Decision' : r.how === 'stopped' ? 'The referee stops the fight' : r.how === 'tko' ? 'Technical knockout' : 'Knockout');
    if (r.how !== 'decision') {
      hud.classList.add('is-cine');
      flash(white, r.how === 'stopped' ? .2 : .5, r.how === 'stopped' ? 240 : 300);
    }
  }
  function flash(el, a, ms) { pop(el, [{ opacity: a }, { opacity: 0 }], ms); }

  /* ── what the sim knows about rounds and results ──────────────────── */
  const nameOf = (f) => (f && f.name) || '';
  function readScores(m) {
    const s = m.scores; // the sim keeps [p, o] per finished round
    if (Array.isArray(s)) return s.map((x) => (Array.isArray(x) ? { p: x[0], o: x[1] } : x));
    return roundLog;
  }
  function readResult(m) {
    const r = m.result || {};
    let how = r.how || r.type || r.method || (endEv && endEv.type) || 'decision';
    if (how === 'stoppage' || how === 'stop') how = 'stopped';
    let winner = r.winner;
    if (winner === undefined) winner = r.draw ? null : (how !== 'decision' && endEv ? other(endEv.who) : null);
    return { how, winner, round: r.round || m.round };
  }

  /* ── events ───────────────────────────────────────────────────────── */
  function onEvent(ev) { if (ev) queue.push(ev); }
  function handle(ev, m) {
    switch (ev.type) {
      case 'round_start': showRound(m); break;
      case 'fight': showFight(m); break;
      case 'throw': S[ev.who].thrown++; break;
      case 'hit': {
        const a = S[ev.who], t = S[other(ev.who)], p = power01(ev.power);
        barFlash(t, .55 + p * .45);
        if (ev.who === 'o') flash(vig, .28 + p * .62, 240 + p * 160);
        comboHit(a);
        if (ev.counter) call(a, 'Counter');
        break;
      }
      case 'block': barFlash(S[other(ev.who)], .22); break;
      case 'slipped': call(S[other(ev.who)], 'Slipped'); break; // who is the puncher here
      case 'stagger': call(S[other(ev.who)], 'Staggered'); break;
      case 'knockdown': showDown(m, ev); break;
      case 'getup': {
        /* he has started to rise: the fight resumes when the sim says so, which is when the small Fight banner shows */
        if (bKind === 'down') { const line = ev.who === 'p' ? 'You are up' : nameOf(m[ev.who]) + ' is up'; bnSub.textContent = line; say(line); }
        break;
      }
      case 'round_end':
        if (ev.scores || ev.p != null) roundLog[m.round - 1] = ev.scores || { p: ev.p, o: ev.o };
        break;
      case 'ko': case 'tko': case 'stopped': case 'decision': endEv = ev; showOver(m); break;
      default: break;
    }
  }
  function barFlash(s, a) { pop(s.flash, [{ opacity: a }, { opacity: 0 }], 190); }
  function comboHit(a) {
    const foe = S[other(a.id)];
    if (foe.n) endCombo(foe);
    if (a.comboT <= 0) { a.n = 0; a.dmg = 0; a.wDmg = -1; }
    a.n++; a.comboT = COMBO_GAP;
    if (a.n >= 2) {
      a.comboN.textContent = String(a.n);
      a.comboEl.classList.add('is-on');
      pop(a.comboLine, POP, 150);
    }
  }
  function endCombo(a) {
    a.n = 0; a.comboT = 0; a.dmg = 0; a.wDmg = -1;
    a.comboEl.classList.remove('is-on');
  }
  /* one call at a time. Each man's tag used to stay .85 s, so two counters a few tenths apart showed on both sides at once and read as a contradiction. */
  function clearCalls() { for (const id of ['p', 'o']) { S[id].callT = 0; S[id].callEl.classList.remove('is-on'); } }
  function call(a, text) {
    const foe = S[other(a.id)]; foe.callT = 0; foe.callEl.classList.remove('is-on');
    a.callEl.textContent = text;
    a.callEl.classList.add('is-on');
    a.callT = .85;
  }

  /* ── each frame ───────────────────────────────────────────────────── */
  function setX(el, f) { el.style.transform = 'translate3d(' + ((1 - f) * 100).toFixed(2) + '%,0,0)'; }
  function updateSide(s, f, d) {
    const v = clamp01(f.hp / (f.maxHp || 100));
    const lost = (s.v - v) * (f.maxHp || 100);
    if (lost > 1e-3) {
      s.hold = CHUNK_HOLD;
      const a = S[other(s.id)];
      if (a.comboT > 0) a.dmg += lost;
    }
    s.v = v;
    if (v < s.shown) s.shown = v;
    else if (v > s.shown) s.shown = reduced ? v : Math.min(v, s.shown + d * .44);
    if (s.chunk < s.shown) s.chunk = s.shown;
    else if (s.chunk > s.shown) {
      if (s.hold > 0) s.hold -= d;
      else s.chunk = Math.max(s.shown, s.chunk - d * (.1 + (s.chunk - s.shown) * 1.8));
    }
    if (Math.abs(s.shown - s.wFill) > 5e-4) { s.wFill = s.shown; setX(s.fill, s.shown); }
    if (Math.abs(s.chunk - s.wChunk) > 5e-4) { s.wChunk = s.chunk; setX(s.chunkEl, s.chunk); }
    const sta = clamp01(f.sta / (f.maxSta || 100));
    if (Math.abs(sta - s.wSta) > 2e-3) { s.wSta = sta; setX(s.staEl, sta); }
    const low = s.shown < .3, tired = f.sta < 25;
    if (low !== s.low) { s.low = low; s.r.classList.toggle('is-low', low); }
    if (tired !== s.tired) { s.tired = tired; s.r.classList.toggle('is-tired', tired); }
    if (s.comboT > 0) {
      s.comboT -= d;
      if (s.comboT <= 0) endCombo(s);
      else if (s.n >= 2) {
        const dm = Math.round(s.dmg);
        if (dm !== s.wDmg) { s.wDmg = dm; s.comboD.textContent = dm + ' damage'; }
      }
    }
    if (s.callT > 0) {
      s.callT -= d;
      if (s.callT <= 0) s.callEl.classList.remove('is-on');
    }
  }
  function writePips(m) {
    const scores = readScores(m);
    const key = m.rounds + '|' + scores.map((x) => (x ? x.p + '-' + x.o : '')).join(',');
    if (key === wPips) return;
    wPips = key;
    for (const id of ['p', 'o']) {
      const s = S[id];
      while (s.pips.length < m.rounds) {
        const i = document.createElement('span');
        i.className = 'ax-pip';
        s.pipsEl.appendChild(i);
        s.pips.push(i);
      }
      s.pips.forEach((el, i) => {
        const sc = scores[i];
        el.classList.toggle('is-on', !!sc && sc[id] > sc[other(id)]);
      });
    }
  }
  function update(m, dt) {
    if (!m || destroyed) return;
    if (m !== match) attach(m);
    const d = dt > 0 ? Math.min(dt, .25) : 0;
    for (let i = 0; i < queue.length; i++) handle(queue[i], m);
    queue.length = 0;
    if (m.state !== lastState) enterState(m.state, lastState, m);
    lastState = m.state;
    /* nothing to press while the men walk to their corners and back: the buttons step aside so a man behind them can be seen */
    const calmNow = m.state === 'break' || (m.state === 'intro' && m.stateT < 1.2);
    if (calmNow !== wCalm) { wCalm = calmNow; hud.classList.toggle('is-calm', calmNow); }
    updateSide(S.p, m.p, d);
    updateSide(S.o, m.o, d);
    writePips(m);

    const sec = Math.max(0, Math.ceil((m.clock || 0) - 1e-3));
    if (sec !== lastSec) {
      lastSec = sec;
      clockEl.textContent = String(sec);
      const low = sec <= 10 && m.state === 'fight';
      clockBox.classList.toggle('is-low', low);
      if (low) pop(clockEl, POP, 220);
    }
    if (wRound !== m.round) {
      wRound = m.round;
      rlabel.textContent = 'Round ' + m.round;
    }
    if (bKind === 'down') {
      showCount(m);
      const dn = downWho === 'p' && m.p.down && m.p.down.rising == null ? m.p.down : null;
      const up = dn ? Math.round(clamp01(dn.up || 0) * 100) : -1;
      if (up !== wUp) { wUp = up; bnUp.classList.toggle('is-on', up >= 0); if (up >= 0) bnUpF.style.transform = 'scaleX(' + (up / 100).toFixed(2) + ')'; }
    } else if (wUp !== -1) { wUp = -1; bnUp.classList.remove('is-on'); }
    if (bOut > 0) {
      bOut -= d;
      if (bOut <= 0) clearBanner();
    } else if (bKind) {
      bT -= d;
      if (bT <= 0) endBanner();
    }
    if (hint && !hintGone && m.state === 'fight') {
      hintT += d;
      if (hintT > 9) hintOff();
    }
    if (m.state === 'over' && !endShown) {
      overT += d;
      const r = readResult(m);
      if (overT >= (END_DELAY[r.how] || 3)) showEnd(m, r);
    }
  }
  function enterState(st, prev, m) {
    if (st === 'intro') { showRound(m); if (!hintGone) hintOn(); }
    else if (st === 'fight') {
      if (prev === 'down') showBackUp();
      else showFight(m);
    } else if (st === 'down') showDown(m);
    else if (st === 'break') showTime(m);
    else if (st === 'over') showOver(m);
  }
  function hintOn() { if (hint) { hint.classList.remove('is-off'); hud.classList.add('has-hint'); } }
  function hintOff() { hintGone = true; if (hint) { hint.classList.add('is-off'); hud.classList.remove('has-hint'); } }
  function attach(m) {
    reset();
    match = m;
    for (const id of ['p', 'o']) {
      const s = S[id], f = m[id];
      s.name = f.name || (id === 'p' ? 'You' : 'Him');
      s.nameEl.textContent = s.name;
      s.cornerEl.dataset.corner = f.corner || (id === 'p' ? 'blue' : 'red');
      const v = clamp01(f.hp / (f.maxHp || 100));
      s.v = s.shown = s.chunk = v;
    }
    reduced = reducedMotion();
    scope.classList.toggle('ax-rm', reduced);
    scope.dataset.axText = textSize();
  }
  function reset() {
    match = null;
    queue.length = 0; roundLog.length = 0;
    lastState = null; shownRound = 0; foughtRound = 0; overShown = false; overT = 0; endShown = false; endEv = null;
    hintT = 0; hintGone = false; wPips = ''; lastSec = -1; wRound = null;
    clearBanner();
    hud.classList.remove('is-cine', 'is-over', 'has-hint', 'is-calm'); wCalm = false;
    clockBox.classList.remove('is-low');
    if (hint) hint.classList.add('is-off');
    for (const id of ['p', 'o']) {
      const s = S[id];
      endCombo(s);
      s.callT = 0; s.callEl.classList.remove('is-on'); s.thrown = 0; s.hold = 0;
      s.wFill = s.wChunk = s.wSta = -1;
      s.pips.forEach((el) => el.classList.remove('is-on'));
    }
    showPanel(endPanel, false);
    setPaused(false);
    if (opts.onEndPanel) opts.onEndPanel(false);
  }

  /* ── panels ───────────────────────────────────────────────────────── */
  let panelFocus = 0;
  function showPanel(panel, on) {
    panel.classList.toggle('is-on', on);
    if (panel === endPanel) clearTimeout(panelFocus);
    if (on) {
      const first = panel.querySelector('.ax-btn:not([disabled])');
      const focus = () => { if (first && panel.classList.contains('is-on')) first.focus({ preventScroll: true }); };
      /* Space is the slip key. A player still fighting when the end panel opens would press Rematch and never read the report, so focus waits for the hands to stop. */
      if (panel === endPanel) panelFocus = setTimeout(focus, 900); else focus();
    } else if (panel.contains(document.activeElement)) {
      document.activeElement.blur(); // so a later Space, the slip key, cannot press a hidden button
    }
  }
  function setPaused(on) {
    paused = !!on;
    if (paused && endShown) paused = false; // the end panel already has the exit and rematch buttons
    showPanel(pausePanel, paused);
  }
  /* The GPU went away. 'wait': Resume cannot work yet. 'gone': it did not come back in time, so only Restart and Exit are left. null: all is well again. */
  function setPicture(state) {
    pauseNote.textContent = state === 'wait' ? 'The picture stopped. Getting it back.' : state === 'gone' ? 'The picture did not come back.' : '';
    resumeBtn.disabled = !!state;
    resumeBtn.hidden = state === 'gone';
    if (paused && (!state || !pausePanel.contains(document.activeElement) || document.activeElement.disabled)) { const first = pausePanel.querySelector('.ax-btn:not([disabled])'); if (first) first.focus({ preventScroll: true }); }
  }
  /* The picture went away during the end graphic: the result does not wait for frames that are not coming. */
  function finish(m) {
    if (destroyed || !m || m.state !== 'over' || endShown) return;
    update(m, 0);
    showEnd(m, readResult(m));
  }
  function showEnd(m, r) {
    endShown = true;
    const won = r.winner === 'p', lost = r.winner === 'o';
    endPanel.dataset.out = won ? 'win' : lost ? 'lose' : 'draw';
    endTitle.textContent = won ? 'You win' : lost ? 'You lose' : 'Draw';
    let how = 'Decision after ' + m.rounds + ' rounds';
    if (r.how === 'ko') how = 'Knockout in round ' + r.round;
    else if (r.how === 'tko') how = 'Three knockdowns in round ' + r.round;
    else if (r.how === 'stopped') {
      const hp = Math.max(0, Math.round((m.result && m.result.loserHp) ?? m[r.winner === 'p' ? 'o' : 'p'].hp));
      how = 'The referee stopped it in round ' + r.round + ' with ' + hp + ' health left';
    }
    endHow.textContent = how;
    // Score table
    const scores = readScores(m);
    if (scores.some(Boolean)) {
      const cols = m.rounds;
      endScore.style.gridTemplateColumns = 'minmax(0,1.7fr) repeat(' + cols + ',minmax(0,1fr)) minmax(0,1.1fr)';
      const total = { p: 0, o: 0 };
      const row = (id, f) => {
        let html = '<span class="ax-score-c ax-score-n">' + esc(f.name || id) + '</span>';
        for (let i = 0; i < cols; i++) {
          const sc = scores[i];
          if (sc) total[id] += sc[id] || 0;
          html += '<span class="ax-score-c">' + (sc ? (sc[id] || 0) : '-') + '</span>';
        }
        return html + '<span class="ax-score-c ax-score-t">' + total[id] + '</span>';
      };
      let head = '<span class="ax-score-h"></span>';
      for (let i = 0; i < cols; i++) head += '<span class="ax-score-h">R' + (i + 1) + '</span>';
      endScore.innerHTML = head + '<span class="ax-score-h">Total</span>' + row('p', m.p) + row('o', m.o);
      endScore.style.display = '';
    } else endScore.style.display = 'none';
    // Stats
    endStats.innerHTML =
      statRow(m.p.thrown ?? S.p.thrown, 'Punches thrown', m.o.thrown ?? S.o.thrown) +
      statRow(m.p.landed || 0, 'Punches landed', m.o.landed || 0);
    // The one honest report line.
    endReport.textContent = 'you took ' + (m.p.clean || 0) + ' clean to the head · he took ' + (m.o.clean || 0);
    let carry = '';
    if (r.how === 'stopped' && !carrySeen()) {
      carry = r.winner === 'o' ? 'you were carrying it before you saw it' : 'he was carrying it before you saw it';
      markCarry();
    }
    endCarry.textContent = carry;
    endCarry.style.display = carry ? '' : 'none';
    clearBanner();
    hud.classList.remove('is-cine');
    setPaused(false);
    showPanel(endPanel, true);
    if (opts.onEndPanel) opts.onEndPanel(true);
    say(endTitle.textContent + '. ' + how + '. ' + endReport.textContent);
  }
  const statRow = (a, l, b) => '<span class="ax-stat-a">' + a + '</span><span class="ax-stat-l">' + l + '</span><span class="ax-stat-b">' + b + '</span>';
  function carrySeen() {
    if (carryShown) return true;
    try { return sessionStorage.getItem(CARRY_KEY) === '1'; } catch (e) { return false; }
  }
  function markCarry() {
    carryShown = true;
    try { sessionStorage.setItem(CARRY_KEY, '1'); } catch (e) { /* the module flag still holds it for this page */ }
  }

  /* ── buttons ──────────────────────────────────────────────────────── */
  function emit(name) {
    const cb = opts['on' + name[0].toUpperCase() + name.slice(1)];
    if (cb) cb();
    scope.dispatchEvent(new CustomEvent('arena:' + name, { bubbles: true }));
  }
  function act(a) {
    if (a === 'pause') { setPaused(true); emit('pause'); }
    else if (a === 'resume') { setPaused(false); emit('resume'); }
    else if (a === 'rematch') { reset(); emit('rematch'); }
    else if (a === 'exit') { setPaused(false); emit('exit'); }
  }
  const onClick = (e) => {
    const b = e.target.closest && e.target.closest('[data-act]');
    if (b && hud.contains(b)) act(b.dataset.act);
  };
  const onPanelKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const panel = e.target.closest && e.target.closest('.ax-panel');
    if (!panel) return;
    const btns = [...panel.querySelectorAll('.ax-btn:not([disabled])')];
    const i = btns.indexOf(document.activeElement);
    const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    btns[(i + step + btns.length) % btns.length].focus();
    e.preventDefault();
  };
  // Clicking the pause icon must not leave focus on it, or Space (slip) would press it.
  const noFocus = (e) => { if (e.target.closest && e.target.closest('.ax-pausebtn')) e.preventDefault(); };
  hud.addEventListener('click', onClick);
  hud.addEventListener('keydown', onPanelKey);
  hud.addEventListener('mousedown', noFocus);

  /* ── touch ────────────────────────────────────────────────────────── */
  const stick = { x: 0, y: 0, active: false };
  let cleanupTouch = null;
  if (touch) cleanupTouch = wireTouch();
  function send(code, key, down) {
    if (opts.onInput) opts.onInput(code, down);
    else (document.body || document).dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key, bubbles: true, cancelable: true }));
  }
  function wireTouch() {
    const zone = q('.ax-stickzone'), base = q('.ax-stick'), knob = q('.ax-knob');
    const held = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
    const keyOf = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd' };
    let id = null, ox = 0, oy = 0, rect = null;
    const R = () => base.offsetWidth * .34;
    const setDir = (code, on) => { if (held[code] !== on) { held[code] = on; send(code, keyOf[code], on); } };
    const rest = () => {
      const z = zone.getBoundingClientRect(), w = base.offsetWidth;
      const pad = Math.max(12, w * .14);
      moveBase(pad + w * .5, z.height - pad - w * .5);
      knob.style.transform = 'none';
    };
    const moveBase = (x, y) => { base.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; };
    const down = (e) => {
      if (id !== null) return;
      id = e.pointerId;
      zone.setPointerCapture && zone.setPointerCapture(id);
      rect = zone.getBoundingClientRect();
      const w = base.offsetWidth * .5;
      ox = Math.min(rect.width - w, Math.max(w, e.clientX - rect.left));
      oy = Math.min(rect.height - w, Math.max(w, e.clientY - rect.top));
      moveBase(ox, oy);
      knob.style.transform = 'none';
      stick.active = true;
      move(e);
      e.preventDefault();
    };
    const move = (e) => {
      if (e.pointerId !== id) return;
      const r = R();
      let dx = e.clientX - rect.left - ox, dy = e.clientY - rect.top - oy;
      const l = Math.hypot(dx, dy);
      if (l > r) { dx *= r / l; dy *= r / l; }
      knob.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      stick.x = dx / r; stick.y = -dy / r;
      setDir('KeyD', stick.x > .38); setDir('KeyA', stick.x < -.38);
      setDir('KeyW', stick.y > .38); setDir('KeyS', stick.y < -.38);
    };
    const up = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      stick.x = stick.y = 0; stick.active = false;
      setDir('KeyD', false); setDir('KeyA', false); setDir('KeyW', false); setDir('KeyS', false);
      rest();
    };
    zone.addEventListener('pointerdown', down);
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', up);
    const btnDown = (e) => {
      const b = e.currentTarget;
      b.setPointerCapture && b.setPointerCapture(e.pointerId);
      b.classList.add('is-down');
      send(b.dataset.code, b.dataset.key, true);
      e.preventDefault();
    };
    const btnUp = (e) => {
      const b = e.currentTarget;
      if (!b.classList.contains('is-down')) return;
      b.classList.remove('is-down');
      send(b.dataset.code, b.dataset.key, false);
    };
    const btns = qa('.ax-tb');
    for (const b of btns) {
      b.addEventListener('pointerdown', btnDown);
      b.addEventListener('pointerup', btnUp);
      b.addEventListener('pointercancel', btnUp);
    }
    const noMenu = (e) => e.preventDefault();
    q('.ax-touch').addEventListener('contextmenu', noMenu);
    addEventListener('resize', rest);
    ready.then(rest, () => {});
    return () => {
      removeEventListener('resize', rest);
      Object.keys(held).forEach((c) => setDir(c, false));
      for (const b of btns) if (b.classList.contains('is-down')) send(b.dataset.code, b.dataset.key, false);
    };
  }

  /* ── loading ──────────────────────────────────────────────────────── */
  function showLoading(p, label) {
    if (destroyed) return;
    clearTimeout(loadTimer);
    if (p === false || p == null || p >= 1) {
      if (!load.classList.contains('is-on')) return;
      loadFill.style.transform = 'scaleX(1)';
      loadPct.textContent = '100%';
      load.classList.add('is-done');
      loadTimer = setTimeout(() => { load.classList.remove('is-on', 'is-done'); loadP = 0; }, 400);
      return;
    }
    const v = Math.max(loadP, clamp01(p));
    loadP = v;
    load.classList.remove('is-done');
    load.classList.add('is-on');
    loadFill.style.transform = 'scaleX(' + v.toFixed(4) + ')';
    loadPct.textContent = Math.round(v * 100) + '%';
    if (label) loadLabel.textContent = label;
  }

  /* a short line under the bar, for a load that has gone quiet */
  function setLoadNote(text) { if (!destroyed && loadNote.textContent !== (text || '')) loadNote.textContent = text || ''; }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    clearTimeout(loadTimer);
    if (cleanupTouch) cleanupTouch();
    hud.removeEventListener('click', onClick);
    hud.removeEventListener('keydown', onPanelKey);
    hud.removeEventListener('mousedown', noFocus);
    hud.remove();
    scope.classList.remove('ax-rm');
    delete scope.dataset.axText;
  }

  return {
    update, onEvent, showLoading, setLoadNote, destroy, setPaused, setPicture, finish, reset, stick, el: hud, ready,
    get paused() { return paused; },
  };
}
