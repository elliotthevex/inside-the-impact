/* Street Fight 3D: the whole game behind one call.

     const { openArena, closeArena } = await import('./gfx/arena/index.js');
     await openArena({ onFail });     // resolves when the first round can start; rejects if anything fails to load
     closeArena();                    // frees the GPU memory and removes the overlay

   Only the HUD is imported up front, so the load screen is on screen straight after the click and everything else counts as real progress.
   openArena options, all optional: quality 'auto'|'low'|'medium'|'high', adaptive, difficulty 'easy'|'normal'|'hard', names {p, o}, seed, touch,
   manual (no loop, tests call step), bot (a name from BOTS plays the player's side, for the dev page), onFail (called if the arena dies after it opened).
   window.__arenaOpts, when a test has set it, is merged in underneath, so the real launch path can be tested at a fixed quality.

   Frame order: input, sim (fixed step inside, under hit-stop and slow motion), rig, events to everything, HUD, audio, effects, camera, stage, render.
   Sim time and rig time stop during hit-stop and slow down in slow motion. HUD, effects, camera and audio run on real time. */
import { createHud } from './hud.js';

const BASE = new URL('.', import.meta.url);
const asset = (p) => new URL(p, BASE).href;
const PUNCH_KEYS = { KeyJ: 'jab', KeyK: 'cross', KeyL: 'hook', KeyU: 'upper', KeyI: 'bodyL', KeyO: 'bodyR' };
const HAND = { jab: 'L', cross: 'R', hook: 'L', upper: 'R', bodyL: 'L', bodyR: 'R' };
const GAME_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'Space', ...Object.keys(PUNCH_KEYS)]);
const KEY_TO_CODE = { w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD', j: 'KeyJ', k: 'KeyK', l: 'KeyL', u: 'KeyU', i: 'KeyI', o: 'KeyO', ' ': 'Space', shift: 'ShiftLeft', escape: 'Escape', tab: 'Tab' };
const STALL_MS = 30000;   // this long with no asset arriving counts as a failed load
const HOLD = 0.45;        // seconds after the load screen starts to fade before the sim starts
const STEP = 1 / 120;     // the sim's fixed step

let session = null;

/* What the player's settings say. ST and uiPrefs are the page's globals; the dev page has neither, so stored values are the fallback. */
function readSettings() {
  let st = null, ui = null;
  try { if (typeof ST !== 'undefined' && ST) st = ST; } catch (e) { st = null; } // eslint-disable-line no-undef
  try { if (typeof uiPrefs !== 'undefined' && uiPrefs) ui = uiPrefs; } catch (e) { ui = null; } // eslint-disable-line no-undef
  if (!st) { try { st = JSON.parse(localStorage.getItem('iti.settings.v1') || 'null'); } catch (e) { st = null; } }
  if (!ui) { try { ui = JSON.parse(localStorage.getItem('impact-ui-preferences-v1') || 'null'); } catch (e) { ui = null; } }
  let os = false; try { os = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { os = false; }
  const reduced = os || !!(st && st.motion) || !!(ui && ui.motion) || document.body.classList.contains('reduce-motion');
  const shake = !reduced && (st ? st.camerashake !== false : true) && (ui ? ui.shake !== false : true);
  const volume = st && st.fxvol != null && Number.isFinite(Number(st.fxvol)) ? Math.max(0, Math.min(1, Number(st.fxvol) / 100)) : 0.7;
  const sound = (ui ? ui.sound !== false : true) && volume > 0;
  return { st, ui, reduced, shake, volume, sound };
}

const nextPaint = () => new Promise((ok) => { let done = false; const go = () => { if (!done) { done = true; ok(); } }; requestAnimationFrame(() => setTimeout(go, 0)); setTimeout(go, 120); });

function makeProgress(S) {
  /* each phase is a real thing that finishes; the bar never goes backward because the HUD holds its maximum */
  const W = { code: 0.12, assets: 0.62, build: 0.1, compile: 0.14, frame: 0.02 }; const done = { code: 0, assets: 0, build: 0, compile: 0, frame: 0 };
  return {
    last: performance.now(), label: 'Loading',
    set(part, v, label) {
      if (label) this.label = label;
      if (v > done[part]) { done[part] = Math.min(1, v); this.last = performance.now(); if (v >= 1) S.loadMarks[part] = Math.round(this.last - S.t0); }
      let p = 0; for (const k in W) p += W[k] * done[k];
      if (S.hud && !S.closed) S.hud.showLoading(Math.min(0.995, Math.max(0.01, p)), this.label);
    },
  };
}

function newMatch(S) {
  const c = S.stage.corners, n = S.matchNo++;
  const seed = S.opts.seed != null ? S.opts.seed + n * 1009 : Math.floor(Math.random() * 1e9);
  S.seed = seed;
  S.match = S.mods.sim.createMatch({ seed, names: S.opts.names || { p: 'YOU', o: 'RIVAL' }, ringHalf: S.stage.ringHalf, corners: { blue: [c.blue.x, c.blue.z], red: [c.red.x, c.red.z] } });
  S.ai = S.mods.ai.createAI({ difficulty: S.opts.difficulty || 'normal', seed: seed + 1 });
  if (S.botName) S.bot = S.mods.ai.createBot(S.botName, { seed: seed + 2, kind: S.botKind });
  S.hitStop = 0; S.slow = null; S.hold = HOLD; S.bank = 0;
  clearInput(S);
  S.cam.snap();
  if (S.fx.clear) S.fx.clear();
  if (S.audio.newMatch) S.audio.newMatch();
}

function clearInput(S) { S.keys.clear(); S.q.punch = null; S.q.slip = false; S.q.ups = 0; S.q.lastUp = false; }

function playerInput(S, m, dt) {
  if (S.bot) return S.bot.decide(m, m.p, m.o, dt);
  const I = S.input, K = S.keys, st = S.hud.stick;
  let ax, ay;
  if (st && st.active) { ax = st.x; ay = st.y; } else {
    ax = (K.has('KeyD') ? 1 : 0) - (K.has('KeyA') ? 1 : 0); ay = (K.has('KeyW') ? 1 : 0) - (K.has('KeyS') ? 1 : 0);
  }
  const l = Math.hypot(ax, ay); if (l > 1) { ax /= l; ay /= l; }
  const b = S.cam.basis();
  I.mx = b.rx * ax + b.fx * ay; I.mz = b.rz * ax + b.fz * ay;
  I.guard = K.has('ShiftLeft') || K.has('ShiftRight');
  I.slip = K.has('Space') || S.q.slip; S.q.slip = false;   // a tap shorter than a frame still counts
  I.punch = null; I.getUp = false;
  if (m.p.down) {
    /* a press while down is one mash. Pulses need a gap for the sim to see the rising edge, so a fast burst queues. */
    if (S.q.ups > 0 && !S.q.lastUp) { I.getUp = true; S.q.ups--; }
    S.q.lastUp = I.getUp;
  } else {
    S.q.ups = 0; S.q.lastUp = false;
    if (S.q.punch && m.state === 'fight') I.punch = S.q.punch;
  }
  S.q.punch = null;
  return I;
}

function dispatch(S, ev, m) {
  S.hud.onEvent(ev);
  S.audio.onEvent(ev);
  if (S.fx.onEvent) S.fx.onEvent(ev, m);
  switch (ev.type) {
    case 'hit': case 'block': {
      const a = ev.who === 'p' ? S.rigP : S.rigO, stop = S.fx.impact(a.knuckleWorld(HAND[ev.kind] || 'L'), ev.dir, ev.power, !!ev.blocked, ev);
      if (stop > S.hitStop) S.hitStop = stop;
      S.cam.kick(ev.blocked ? ev.power * 0.45 : ev.power, ev.dir);
      if (!ev.blocked && ev.power > 0.7 && !S.settings.reduced) S.stage.kickLamp(0.5);
      break;
    }
    case 'knockdown':
      if (!S.settings.reduced) S.stage.kickLamp(3);
      S.cam.kick(1, ev.dir);
      if (!S.settings.reduced) S.slow = { t: 0, hold: ev.cause === 'hp' ? 0.8 : 0.5, out: 0.45, scale: 0.26 };
      break;
    case 'tko': case 'stopped':
      if (!S.settings.reduced) S.slow = { t: 0, hold: 1.5, out: 0.7, scale: 0.2 };
      break;
    case 'ko':
      S.cam.kick(0.4);
      break;
    default: break;
  }
}

function frame(S, dt) {
  const t0 = performance.now(), m = S.match;
  let scale = 1;
  if (S.hold > 0) { S.hold -= dt; scale = 0; }
  else if (S.hitStop > 0) { S.hitStop -= dt; scale = 0; }
  else if (S.slow) {
    const sl = S.slow; sl.t += dt;
    if (sl.t < sl.hold) scale = sl.scale;
    else if (sl.t < sl.hold + sl.out) { const u = (sl.t - sl.hold) / sl.out; scale = sl.scale + (1 - sl.scale) * u * u; }
    else S.slow = null;
  }
  /* the rig runs on scaled real time, so slow motion stays smooth between sim ticks, except that a contact stops it exactly on the tick */
  let dts = dt * scale, advanced = 0;
  if (dts > 0) {
    const inP = playerInput(S, m, dts), inO = S.ai.decide(m, m.o, m.p, dts);
    /* Presses go in once, then the sim goes tick by tick. A punch connecting ends the ticks for this frame, so the frame drawn, and held by hit-stop, is the contact itself. */
    m.step(0, inP, inO); inP.punch = null; inO.punch = null;
    S.bank += dts;
    while (S.bank >= STEP) {
      S.bank -= STEP;
      const from = m.events.length;
      m.step(STEP, inP, inO);
      advanced += STEP;
      let contact = false;
      for (let i = from; i < m.events.length; i++) { const k = m.events[i].type; if (k === 'hit' || k === 'block') contact = true; }
      if (contact) { S.bank = 0; dts = advanced; break; }
    }
  }
  S.mods.rig.FighterRig.updateBoth(S.rigP, S.rigO, m, dts);
  if (S.tap) S.tap(m, m.events, dt, dts);
  for (let i = 0; i < m.events.length; i++) dispatch(S, m.events[i], m);
  m.events.length = 0;
  S.hud.update(m, dt);
  S.audio.update(m, dt);
  S.fx.update(dt);
  S.cam.update(m, S.rigP, S.rigO, dt);
  const post = S.engine.post;
  if (post) { post.focus = S.cam.getFocus(); post.aperture = S.engine.q.film ? S.cam.getAperture() : 0; }
  S.stage.update(dt, S.engine.camera);
  S.frames++;
  const ms = performance.now() - t0; S.jsMs += (ms - S.jsMs) * 0.05; if (ms > S.jsPeak) S.jsPeak = ms;
}

/* ---------- input ---------- */
const codeOf = (e) => e.code || KEY_TO_CODE[String(e.key || '').toLowerCase()] || '';
const panelOn = (S) => (S.hud ? S.hud.el.querySelector('.ax-panel.is-on') : null);

function press(S, code, repeat) {
  S.keys.add(code);
  if (repeat) return;
  if (code === 'Space') S.q.slip = true;
  const kind = PUNCH_KEYS[code];
  if (kind && S.match) { if (S.match.p.down) S.q.ups = Math.min(4, S.q.ups + 1); else S.q.punch = kind; }
}

function wireInput(S) {
  S.onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const code = codeOf(e);
    if (code === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (e.repeat) return;
      if (!S.ready) { closeArena(); return; }
      if (S.hud.paused) { resume(S); return; }
      if (S.hud.el.querySelector('.ax-end.is-on')) { closeArena(); return; }
      pause(S); return;
    }
    const panel = panelOn(S);
    if (panel) {
      /* buttons keep their ordinary keys; the page behind must not see them and focus must not wander out of the panel */
      if (code === 'Tab') { e.preventDefault(); const b = [...panel.querySelectorAll('.ax-btn')], i = b.indexOf(document.activeElement); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus(); }
      if (!(e.target && panel.contains(e.target))) e.stopPropagation();
      return;
    }
    e.stopPropagation();
    if (code === 'Tab') e.preventDefault();
    if (!S.ready || !GAME_KEYS.has(code)) return;
    e.preventDefault();
    press(S, code, e.repeat);
  };
  S.onKeyUp = (e) => {
    const code = codeOf(e);
    S.keys.delete(code);
    const panel = panelOn(S);
    if (!(panel && e.target && panel.contains(e.target))) e.stopPropagation();
  };
  /* inside the overlay the key has been handled by the time it bubbles here: stop it reaching the page's listeners */
  S.onRootKey = (e) => e.stopPropagation();
  S.onBlur = () => clearInput(S);
  S.onVisibility = () => { if (document.hidden && S.ready && !S.paused && !panelOn(S)) pause(S); };
  S.onResize = () => { if (S.ready && S.engine && !S.engine.running) { S.engine.resize(); S.cam.update(S.match, S.rigP, S.rigO, 0); S.engine.render(1e-4); } };
  window.addEventListener('keydown', S.onKeyDown, true);
  window.addEventListener('keyup', S.onKeyUp, true);
  S.root.addEventListener('keydown', S.onRootKey);
  S.root.addEventListener('keyup', S.onRootKey);
  window.addEventListener('blur', S.onBlur);
  window.addEventListener('resize', S.onResize);
  document.addEventListener('visibilitychange', S.onVisibility);
}

function unwireInput(S) {
  if (!S.onKeyDown) return;
  window.removeEventListener('keydown', S.onKeyDown, true);
  window.removeEventListener('keyup', S.onKeyUp, true);
  S.root.removeEventListener('keydown', S.onRootKey);
  S.root.removeEventListener('keyup', S.onRootKey);
  window.removeEventListener('blur', S.onBlur);
  window.removeEventListener('resize', S.onResize);
  document.removeEventListener('visibilitychange', S.onVisibility);
}

/* ---------- pause, rematch ---------- */
function pause(S, fromHud) {
  if (S.paused || !S.ready) return;
  S.paused = true;
  if (!fromHud) S.hud.setPaused(true);
  clearInput(S);
  S.engine.stop();
  S.audio.setPaused(true);
}
function resume(S, fromHud) {
  if (!S.paused) return;
  S.paused = false;
  if (!fromHud) S.hud.setPaused(false);
  S.audio.setPaused(false);
  if (!S.opts.manual && !S.frozen) S.engine.start();
}
function rematch(S) {
  S.hud.reset();
  newMatch(S);
  if (S.paused) { S.paused = false; S.audio.setPaused(false); }
  if (!S.opts.manual && !S.frozen) S.engine.start();
}

/* ---------- open ---------- */
export async function openArena(options = {}) {
  if (session) return session.handle;
  const opts = { ...(typeof window !== 'undefined' && window.__arenaOpts ? window.__arenaOpts : {}), ...options };
  const root = document.createElement('div');
  root.className = 'arena-x';
  root.setAttribute('role', 'application');
  root.setAttribute('aria-label', 'Street Fight');
  const canvas = document.createElement('canvas');
  canvas.className = 'ax-canvas'; canvas.style.width = '100%'; canvas.style.height = '100%';
  root.appendChild(canvas);
  document.body.appendChild(root);
  const S = session = {
    t0: performance.now(), loadMarks: {}, opts, root, canvas, closed: false, ready: false, paused: false, frozen: false, keys: new Set(), q: { punch: null, slip: false, ups: 0, lastUp: false },
    input: { mx: 0, mz: 0, guard: false, punch: null, slip: false, getUp: false }, matchNo: 0, frames: 0, jsMs: 0, jsPeak: 0, hitStop: 0, slow: null, hold: 0, bank: 0, botName: opts.bot || null, botKind: opts.botKind || 'jab', bot: null, tap: null,
  };
  S.handle = makeHandle(S);
  wireInput(S);
  try {
    await load(S);
  } catch (err) {
    teardown(S);
    throw err;
  }
  return S.closed ? null : S.handle;
}

const check = (S) => { if (S.closed) throw Object.assign(new Error('closed'), { closed: true }); };

async function load(S) {
  const { opts } = S;
  const prog = makeProgress(S);
  S.hud = createHud(S.root, {
    touch: opts.touch,
    onPause: () => pause(S, true), onResume: () => resume(S, true),
    onRematch: () => rematch(S), onExit: () => closeArena(),
    onInput: (code, down) => {
      if (down) { if (S.ready && !panelOn(S)) press(S, code, false); } else S.keys.delete(code);
    },
  });
  S.hud.showLoading(0.01, 'Loading');
  await S.hud.ready; check(S);

  /* a network that stops answering must not leave the player on a load screen for ever */
  let phaseNet = true;
  const stall = new Promise((_, no) => { S.stallTimer = setInterval(() => { if (phaseNet && performance.now() - prog.last > STALL_MS) no(new Error('arena load stalled')); }, 2000); });
  stall.catch(() => {});
  const work = (async () => {
    const list = [['THREE', 'three'], ['engine', '../core/engine.js'], ['stage', './stage.js'], ['fighter', '../people/fighter.js'], ['anim', '../people/anim.js'], ['rig', '../people/rig.js'], ['sim', './sim.js'], ['ai', './ai.js'], ['cam', './fightcam.js'], ['fx', './fx.js'], ['audio', './audio.js']];
    let nDone = 0; const mods = {};
    await Promise.all(list.map(([k, spec]) => import(spec).then((m) => { mods[k] = m; nDone++; prog.set('code', nDone / list.length); })));
    check(S); S.mods = mods;
    const { THREE } = mods;

    const settings = S.settings = readSettings();
    const engine = S.engine = new mods.engine.Engine(S.canvas, { quality: opts.quality || 'auto', adaptive: opts.adaptive, reducedMotion: settings.reduced, st: settings.st });
    let shaderFailed = null;
    engine.renderer.debug.onShaderError = (gl, program, vs, fs) => { shaderFailed = gl.getShaderInfoLog(vs) || gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(program) || 'shader error'; console.error('[arena] shader failed:', String(shaderFailed).slice(0, 800)); };
    if (settings.st && settings.st.shadows === false) engine.renderer.shadowMap.enabled = false;
    S.onLost = () => {
      /* the GPU took the context away: nothing here survives that, so hand back to the page, which can fall back */
      if (S.closed) return;
      console.warn('[arena] WebGL context lost');
      const onFail = opts.onFail; closeArena(); if (onFail) onFail(new Error('webgl context lost'));
    };
    S.canvas.addEventListener('webglcontextlost', S.onLost);

    const mgr = new THREE.LoadingManager();
    mgr.onProgress = (url, loaded, total) => prog.set('assets', loaded / Math.max(1, total), 'Loading the venue');
    let netErr = null; mgr.onError = (url) => { netErr = url; };
    const counted = (url, fn) => { mgr.itemStart(url); return fn().finally(() => mgr.itemEnd(url)); };
    const [reach, clips] = await Promise.all([
      counted('reach', () => fetch(asset('./reach.json')).then((r) => { if (!r.ok) throw new Error('reach.json ' + r.status); return r.json(); })),
      counted('clips', () => mods.anim.loadClips(asset('../../assets/anim/clips.json'))),
      mods.fighter.preloadFighter(engine.q, mgr),
      createStageInto(S, mods, engine, mgr),
    ]);
    check(S);
    if (netErr) console.warn('[arena] an asset failed to load:', netErr);
    phaseNet = false;
    prog.set('assets', 1, 'Getting the fighters ready');
    await nextPaint(); check(S);

    mods.sim.setReach(reach);
    const stage = S.stage;
    const fp = S.fp = new mods.fighter.Fighter({ corner: 'blue', build: 0.6 });
    const fo = S.fo = new mods.fighter.Fighter({ corner: 'red', build: 0.55, variant: 'b' });
    stage.scene.add(fp.root, fo.root);
    const R = mods.rig.FighterRig, up = mods.sim.TUNE.getUpTime;
    S.rigP = new R(fp, clips, { who: 'p', floorY: stage.canvasY, ringHalf: stage.ringHalf, getUpTime: up });
    S.rigO = new R(fo, clips, { who: 'o', floorY: stage.canvasY, ringHalf: stage.ringHalf, getUpTime: up });
    R.pair(S.rigP, S.rigO);
    engine.scene = stage.scene;
    S.cam = mods.cam.createFightCam(engine.camera, { reducedMotion: settings.reduced, shake: settings.shake, canvasY: stage.canvasY, stage });
    S.fx = mods.fx.createFx(stage.scene, engine.q, { stage, reducedMotion: settings.reduced, onLand: () => S.audio.land() });
    S.fx.track(S.rigP, S.rigO);
    S.onQuality = (q) => { if (S.fx.applyQuality) S.fx.applyQuality(q); };
    engine.listeners.add(S.onQuality);
    S.audio = mods.audio.createAudio({ enabled: settings.sound, volume: settings.volume, lite: engine.q.name === 'low' });
    newMatch(S);
    S.hold = 0;
    frame(S, 0);           // real bones and a real camera, so the shaders and the first frame see what the fight sees
    prog.set('build', 1, 'Warming up');
    await nextPaint(); check(S);

    await engine.precompile(); check(S);
    if (shaderFailed) throw new Error('shader failed: ' + String(shaderFailed).slice(0, 300));
    prog.set('compile', 1);
    engine.render(1 / 60);   // first draw uploads textures: better behind the load screen than in the first exchange
    if (shaderFailed) throw new Error('shader failed: ' + String(shaderFailed).slice(0, 300));
    const glErr = engine.renderer.getContext().getError();
    if (glErr) console.warn('[arena] GL error after first frame:', glErr);
    prog.set('frame', 1);
    S.hold = HOLD;
  })();
  try {
    await Promise.race([work, stall]);
  } catch (e) {
    if (S.closed || (e && e.closed)) return; /* closed by the player while loading: not a failure, nothing to fall back to */
    throw e;
  } finally {
    clearInterval(S.stallTimer);
  }
  if (S.closed) return;
  S.ready = true;
  S.engine.update = (dt) => frame(S, dt);
  S.hud.showLoading(1);
  if (S.audio.unlock) S.audio.unlock();
  if (!opts.manual) S.engine.start();
}

async function createStageInto(S, mods, engine, mgr) {
  const stage = await mods.stage.createStage(engine, mgr);
  if (S.closed) { try { stage.dispose(); } catch (e) { /* closing anyway */ } return; }
  S.stage = stage;
}

/* ---------- close ---------- */
function teardown(S) {
  if (S.torn) return;
  S.torn = true; S.closed = true; S.ready = false;
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[arena] while closing:', e); } };
  clearInterval(S.stallTimer);
  unwireInput(S);
  if (S.onLost) S.canvas.removeEventListener('webglcontextlost', S.onLost);
  if (S.engine) { S.engine.stop(); if (S.onQuality) S.engine.listeners.delete(S.onQuality); }
  if (S.audio) safe(() => S.audio.destroy());
  if (S.fx && S.fx.dispose) safe(() => S.fx.dispose());
  if (S.hud) safe(() => S.hud.destroy());
  if (S.fp) safe(() => S.fp.dispose());
  if (S.fo) safe(() => S.fo.dispose());
  if (S.stage) safe(() => S.stage.dispose());
  if (S.mods && S.mods.fighter && S.mods.fighter.releaseFighterGPU) safe(() => S.mods.fighter.releaseFighterGPU());
  if (S.engine) {
    const r = S.engine.renderer;
    safe(() => S.engine.dispose());
    safe(() => r.forceContextLoss());
  }
  S.canvas.width = S.canvas.height = 1;
  S.root.remove();
  if (session === S) session = null;
}

export function closeArena() { if (session) teardown(session); }
export function arenaSession() { return session ? session.handle : null; }

/* What tests and the dev page can reach. Nothing in the game uses this. */
function makeHandle(S) {
  return {
    get match() { return S.match; }, get engine() { return S.engine; }, get stage() { return S.stage; }, get rigP() { return S.rigP; }, get rigO() { return S.rigO; },
    get cam() { return S.cam; }, get fx() { return S.fx; }, get audio() { return S.audio; }, get hud() { return S.hud; }, get mods() { return S.mods; }, get root() { return S.root; }, get ai() { return S.ai; },
    get loadMarks() { return S.loadMarks; }, get ready() { return S.ready; }, get paused() { return S.paused; }, get frames() { return S.frames; }, get jsMs() { return S.jsMs; }, get jsPeak() { return S.jsPeak; }, get seed() { return S.seed; }, get hitStop() { return S.hitStop; }, get slow() { return S.slow; }, get settings() { return S.settings; },
    resetPeak() { S.jsPeak = 0; },
    set tap(fn) { S.tap = fn; }, get tap() { return S.tap; },
    step(n = 1, dt = 1 / 60, o) { return S.engine.step(n, dt, o); },
    pause: () => pause(S), resume: () => resume(S), rematch: () => rematch(S), close: () => closeArena(),
    /* stops the loop right after the frame being built, so a screenshot sees exactly that frame */
    freeze() { S.frozen = true; S.engine.stop(); },
    unfreeze() { S.frozen = false; if (!S.paused && !S.opts.manual) S.engine.start(); },
    setPlayerBot(name, o = {}) { S.botName = name || null; S.botKind = o.kind || 'jab'; S.bot = name ? S.mods.ai.createBot(name, { seed: (o.seed ?? S.seed) + 2, kind: S.botKind }) : null; },
  };
}
