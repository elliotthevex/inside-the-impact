/* Story Mode — core.js
   Namespace, utilities, seeded RNG, events, input, synthesized audio, storage,
   settings, persistent game state and save/load. Contract: ARCHITECTURE.md §2, §9.
   Every other story file runs after this one and reads window.STORY. */
(function (S) {
  'use strict';

  /* ── Namespace and clocks ─────────────────────────────────────────── */
  S.VERSION = 'story-1';
  S.W = 640; S.H = 360; S.DT = 1 / 120;
  S.time = 0;            // sim seconds; advances only while the sim steps
  S.realTime = 0;        // wall-clock seconds since open (UI animation only)
  S.headless = S.headless === true;
  S.paused = false;
  S.timeScale = 1;
  S.hitstop = 0;
  S.isOpen = false;      // true between STORY.open() and STORY.close()
  S.errors = S.errors || [];

  /* A plain S.fail so modules that load before main.js can report errors.
     main.js replaces it with the overlay version and keeps this record. */
  S.fail = S.fail || function (err, ctx) {
    const e = err instanceof Error ? err : new Error(String(err));
    S.errors.push({ message: e.message, stack: String(e.stack || ''), ctx: ctx || null, time: S.time });
    try { console.error('[story]', e.message, ctx || '', e.stack || ''); } catch (_) { /* no console */ }
  };

  /* ── util ─────────────────────────────────────────────────────────── */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const invLerp = (a, b, v) => (a === b ? 0 : (v - a) / (b - a));
  const approach = (v, target, delta) => (v < target ? Math.min(v + delta, target) : Math.max(v - delta, target));
  const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  const ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    linear: (t) => t,
  };
  // Deterministic 0..1 from a number (or string). Stable across runs; used by art for wear patterns.
  function hash(n) {
    let h;
    if (typeof n === 'string') { h = 2166136261; for (let i = 0; i < n.length; i++) h = Math.imul(h ^ n.charCodeAt(i), 16777619); }
    else h = Math.floor((+n || 0) * 1000) | 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const pick = (arr, r) => (arr && arr.length ? arr[Math.min(arr.length - 1, Math.floor((r === undefined ? S.rand() : r) * arr.length))] : undefined);
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  function fmtMoney(n) {
    const v = Math.round(+n || 0), s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (v < 0 ? '-$' : '$') + s;
  }
  // JSON deep copy; drops functions and undefined. Used for saves and snapshots.
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(+sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
  }
  S.util = { clamp, lerp, invLerp, approach, sign, ease, hash, pick, dist, fmtMoney, clone, fmtTime };

  /* ── Seeded RNG (mulberry32) ───────────────────────────────────────── */
  let rngState = 0x7c4a1994 >>> 0;
  S.rand = function () {
    rngState = (rngState + 0x6d2b79f5) >>> 0;
    let t = rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  S.seed = function (n) { rngState = (Math.floor(+n || 0) >>> 0); };
  S.rngState = function (v) { if (v !== undefined) rngState = v >>> 0; return rngState; };
  S.randRange = (a, b) => a + (b - a) * S.rand();
  S.randInt = (a, b) => Math.floor(a + (b - a + 1) * S.rand());

  /* ── Events ───────────────────────────────────────────────────────── */
  const handlers = Object.create(null);
  S.events = {
    on(name, fn) { (handlers[name] || (handlers[name] = [])).push(fn); return fn; },
    off(name, fn) { const l = handlers[name]; if (!l) return; const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); },
    once(name, fn) { const w = (d) => { S.events.off(name, w); fn(d); }; return S.events.on(name, w); },
    // '*' listeners receive (name, data) for every event (the test log uses this).
    emit(name, data) {
      const l = handlers[name], all = handlers['*'];
      if (l) for (const fn of l.slice()) {
        try { fn(data); } catch (err) { S.fail(err, { source: 'event ' + name }); }
      }
      if (all) for (const fn of all.slice()) {
        try { fn(name, data); } catch (err) { S.fail(err, { source: 'event * ' + name }); }
      }
    },
  };

  /* ── Storage ──────────────────────────────────────────────────────── */
  const PREFIX = 'iti.story.';
  const memStore = Object.create(null);
  function ls() { try { return (typeof window !== 'undefined' && window.localStorage) || null; } catch (_) { return null; } }
  S.store = {
    get(key, def) {
      try {
        const st = ls(), raw = st ? st.getItem(PREFIX + key) : null;
        if (raw !== null && raw !== undefined) return JSON.parse(raw);
      } catch (_) { /* blocked or corrupt: fall through to memory */ }
      return key in memStore ? clone(memStore[key]) : def;
    },
    set(key, value) {
      memStore[key] = clone(value);
      try { const st = ls(); if (st) { st.setItem(PREFIX + key, JSON.stringify(value)); return true; } } catch (_) { /* quota or blocked */ }
      return false;
    },
    del(key) {
      delete memStore[key];
      try { const st = ls(); if (st) st.removeItem(PREFIX + key); } catch (_) { /* ignore */ }
    },
  };

  /* ── Settings ─────────────────────────────────────────────────────── */
  const SETTINGS_DEFAULT = {
    difficulty: 'normal', textSpeed: 1, shake: 1, flash: 1, sfx: 0.8, ambience: 0.6,
    minimap: 'partial', bindings: null, preset: 'A', showTips: true,
  };
  function loadSettings() {
    const s = Object.assign({}, SETTINGS_DEFAULT, S.store.get('settings', {}) || {});
    if (!['story', 'normal', 'veteran'].includes(s.difficulty)) s.difficulty = 'normal';
    s.textSpeed = s.textSpeed === 3 ? 3 : clamp(+s.textSpeed || 1, 0.5, 2);
    s.shake = clamp(+s.shake, 0, 1); s.flash = clamp(+s.flash, 0, 1);
    s.sfx = clamp(+s.sfx, 0, 1); s.ambience = clamp(+s.ambience, 0, 1);
    if (!['full', 'partial', 'hidden'].includes(s.minimap)) s.minimap = 'partial';
    if (s.preset !== 'A' && s.preset !== 'B') s.preset = 'A';
    s.showTips = s.showTips !== false;
    return s;
  }
  S.settings = loadSettings();
  S.saveSettings = function () {
    S.store.set('settings', S.settings);
    if (S.audio && S.audio.applySettings) S.audio.applySettings();
    S.events.emit('settings', S.settings);
  };

  /* ── Input ────────────────────────────────────────────────────────── */
  const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'punch', 'dash', 'slip', 'flurry', 'interact', 'journal', 'map', 'minimap', 'pause', 'run'];
  const PRESETS = {
    // A: WASD + JKL hands. Arrow keys mirror movement as a second slot.
    A: { left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'],
      jump: ['Space'], punch: ['KeyJ'], dash: ['KeyK'], slip: ['KeyL'], flurry: ['KeyU'], interact: ['KeyE', 'Enter'],
      journal: ['Tab'], map: ['KeyM'], minimap: ['KeyN'], pause: ['Escape'], run: ['ShiftLeft', 'ShiftRight'] },
    // B: arrows move, Alt jumps, X C V F hands, Space interacts.
    B: { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
      jump: ['AltLeft', 'AltRight'], punch: ['KeyX'], dash: ['KeyC'], slip: ['KeyV'], flurry: ['KeyF'], interact: ['Space', 'Enter'],
      journal: ['KeyI'], map: ['KeyM'], minimap: ['KeyN'], pause: ['Escape'], run: ['ShiftLeft', 'ShiftRight'] },
  };
  const raw = Object.create(null);          // code -> held
  let hitCodes = Object.create(null);       // codes that went down since the last update (taps between steps count)
  let anyHit = false;
  const st = Object.create(null);           // action -> {down, pressed, released, pressAt, consumed, virtual, vhit, v*}
  const frameHits = Object.create(null);    // edges accumulated for per-frame readers (UI); cleared by clearFrame()
  let captureFn = null;
  for (const a of ACTIONS) st[a] = { down: false, pressed: false, released: false, pressAt: -1e9, consumed: true, virtual: false, vhit: false,
    vDown: false, vPressed: false, vReleased: false, vPressAt: -1e9 };
  /* Lock: while the director holds control (cutscene, dialogue), movement and combat actions read
     only virtual input (the director drives Jin with it). Presses of up/down stay live for menus,
     held up/down are locked. Meta actions (interact, pause, journal, map, minimap) are never locked. */
  const LOCK_HELD = { left: 1, right: 1, up: 1, down: 1, jump: 1, punch: 1, dash: 1, slip: 1, flurry: 1, run: 1 };
  const LOCK_PRESS = { left: 1, right: 1, jump: 1, punch: 1, dash: 1, slip: 1, flurry: 1, run: 1 };

  function validBindings(b) {
    const base = PRESETS[S.settings.preset] || PRESETS.A, out = {};
    for (const a of ACTIONS) {
      const v = b && Array.isArray(b[a]) ? b[a].filter((c) => typeof c === 'string' && c) : null;
      out[a] = v && v.length ? v.slice(0, 3) : base[a].slice();
    }
    return out;
  }

  const KEY_LABELS = { Space: 'Space', Escape: 'Esc', Enter: 'Enter', Tab: 'Tab', ShiftLeft: 'Shift', ShiftRight: 'Shift',
    AltLeft: 'Alt', AltRight: 'Alt', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', MetaLeft: 'Cmd', MetaRight: 'Cmd',
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: 'Backspace', CapsLock: 'Caps',
    Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    Minus: '-', Equal: '=', Backquote: '`', Delete: 'Del', Insert: 'Ins', Home: 'Home', End: 'End', PageUp: 'PgUp', PageDown: 'PgDn' };
  function codeLabel(code) {
    if (!code) return '—';
    if (KEY_LABELS[code]) return KEY_LABELS[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);
    if (/^Numpad/.test(code)) return 'Num ' + code.slice(6);
    return code;
  }

  const input = S.input = {
    actions: ACTIONS.slice(),
    presets: PRESETS,
    bindings: validBindings(S.settings.bindings),
    locked: false,
    down(a) { const s = st[a]; if (!s) return false; return input.locked && LOCK_HELD[a] ? s.vDown : s.down; },
    pressed(a) {
      const s = st[a]; if (!s || s.consumed) return false;
      return input.locked && LOCK_PRESS[a] ? s.vPressed : s.pressed;
    },
    released(a) { const s = st[a]; if (!s) return false; return input.locked && LOCK_HELD[a] ? s.vReleased : s.released; },
    // True if `a` was pressed within the last `seconds` of sim time and not yet consumed; consumes it.
    buffer(a, seconds) {
      const s = st[a]; if (!s || s.consumed) return false;
      const win = seconds === undefined ? ((S.tune && S.tune.inputBuffer) || 0.10) : seconds;
      const at = input.locked && LOCK_PRESS[a] ? s.vPressAt : s.pressAt;
      if (S.time - at <= win + 1e-9) { s.consumed = true; return true; }
      return false;
    },
    // Unlocked readers for UI code that runs per step (menus, dialogue choices).
    rawPressed: (a) => !!(st[a] && st[a].pressed && !st[a].consumed),
    rawHeld: (a) => !!(st[a] && st[a].down),
    lock(on) {
      on = !!on;
      if (on === input.locked) return;
      input.locked = on;
      // Presses made on the other side of the switch never leak through (no buffered punch after a cutscene).
      for (const a in LOCK_PRESS) st[a].consumed = true;
    },
    consume(a) { const s = st[a]; if (s) { s.consumed = true; } },
    any: () => !!input._any,     // any key or virtual button went down this step ("press any key")
    _any: false,
    virtualDown(a, on) {
      const s = st[a]; if (!s) return;
      if (on && !s.virtual) s.vhit = true;
      s.virtual = !!on;
    },
    rebind(a, slot, code) {
      if (!st[a]) return false;
      const b = input.bindings;
      // A key belongs to one action only: remove it elsewhere first.
      if (code) for (const k of ACTIONS) if (k !== a) b[k] = b[k].filter((c) => c !== code);
      const list = b[a].slice(); slot = clamp(slot | 0, 0, 2);
      if (code) list[slot] = code; else list.splice(slot, 1);
      b[a] = list.filter(Boolean);
      S.settings.bindings = clone(b); S.saveSettings();
      return true;
    },
    resetBindings(preset) {
      const p = PRESETS[preset] ? preset : 'A';
      S.settings.preset = p; S.settings.bindings = null;
      input.bindings = validBindings(null); S.saveSettings();
    },
    labelFor(a) { const b = input.bindings[a]; return codeLabel(b && b[0]); },
    labelsFor(a) { return (input.bindings[a] || []).map(codeLabel); },
    codeLabel,
    actionFor(code) { for (const a of ACTIONS) if (input.bindings[a].includes(code)) return a; return null; },
    // Per-frame edge for UI code that runs once per rendered frame (it can miss per-step edges).
    framePressed: (a) => !!frameHits[a],
    clearFrame() { for (const k in frameHits) delete frameHits[k]; },
    // Next keydown goes to fn(code) instead of the game (rebinding UI). Esc cancels with fn(null).
    captureNext(fn) { captureFn = fn; },
    rawDown: (code) => !!raw[code],
    reset() {
      for (const k in raw) delete raw[k];
      hitCodes = Object.create(null); anyHit = false; input.locked = false;
      for (const a of ACTIONS) Object.assign(st[a], { down: false, pressed: false, released: false, consumed: true, virtual: false, vhit: false,
        vDown: false, vPressed: false, vReleased: false });
    },
    // Once per sim step (main loop): compute edges from raw key state and virtual buttons.
    update() {
      const b = input.bindings;
      for (const a of ACTIONS) {
        const s = st[a], codes = b[a];
        let held = s.virtual, hit = s.vhit;
        for (let i = 0; i < codes.length; i++) { if (raw[codes[i]]) held = true; if (hitCodes[codes[i]]) hit = true; }
        const was = s.down, now = held || hit;   // a tap that began and ended between steps is down for one step
        s.pressed = hit || (now && !was);
        s.released = was && !now;
        s.down = now;
        // Virtual-only view, read while locked.
        const vWas = s.vDown, vNow = s.virtual || s.vhit;
        s.vPressed = s.vhit || (vNow && !vWas);
        s.vReleased = vWas && !vNow;
        s.vDown = vNow;
        if (s.vPressed) { s.vPressAt = S.time; if (input.locked) s.consumed = false; }
        if (s.pressed) { s.pressAt = S.time; s.consumed = false; frameHits[a] = true; if (s.vhit) anyHit = true; }
        s.vhit = false;
      }
      hitCodes = Object.create(null);
      input._any = anyHit; anyHit = false;
    },
  };

  function isTyping(t) {
    if (!t || !t.tagName) return false;
    const tag = t.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  }
  if (!S.headless && typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('keydown', (e) => {
      if (!S.isOpen) return;
      if (captureFn) {
        const fn = captureFn; captureFn = null;
        e.preventDefault(); e.stopPropagation();
        try { fn(e.code === 'Escape' ? null : e.code); } catch (err) { S.fail(err, { source: 'input capture' }); }
        return;
      }
      if (isTyping(e.target)) return;
      const bound = !!input.actionFor(e.code);
      if (bound || e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      if (S.audio && S.audio.resume) S.audio.resume();
      if (e.repeat) return;
      raw[e.code] = true; hitCodes[e.code] = true; anyHit = true;
    }, true);
    window.addEventListener('keyup', (e) => {
      if (!S.isOpen) return;
      raw[e.code] = false;
      if (input.actionFor(e.code)) e.preventDefault();
    }, true);
    // Releasing focus would otherwise leave keys stuck down.
    window.addEventListener('blur', () => { for (const k in raw) raw[k] = false; });
  }

  /* ── Audio (WebAudio synthesis only) ──────────────────────────────── */
  S.audio = (function () {
    let ac = null, master = null, muffleF = null, sfxBus = null, ambBus = null, comp = null;
    let noiseBuf = null, brownBuf = null, masterVol = 1, muffleAmt = 0;
    const loops = Object.create(null);
    const lastAt = Object.create(null);
    // Audio variation uses its own generator so it never perturbs the seeded sim RNG.
    let ars = 0x2468ace;
    const ar = () => { ars = (Math.imul(ars, 1664525) + 1013904223) >>> 0; return ars / 4294967296; };
    const live = () => !S.headless && !!ac && !A.muted;

    // Test pages stay silent: the local test server (port 8795), ?mute=1, window.STORY_MUTE or the
    // stored flag 'iti.story.mute' = '1' all mute Story Mode. ?sound=1 turns sound back on for a listen.
    // The user asked for no sound while agents test (2026-11-22).
    const startMuted = (function () {
      try {
        if (typeof window === 'undefined' || !window.location) return false;
        const q = window.location.search || '';
        if (/[?&]sound=1\b/.test(q)) return false;
        if (window.STORY_MUTE || /[?&]mute=1\b/.test(q) || window.location.port === '8795') return true;
        return !!(window.localStorage && window.localStorage.getItem('iti.story.mute') === '1');
      } catch (_) { return false; }
    })();

    const A = {
      muted: startMuted,
      get ctx() { return ac; },
      init() {
        if (S.headless || ac || A.muted) return !!ac;
        const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        if (!AC) return false;
        try { ac = new AC(); } catch (_) { ac = null; return false; }
        comp = ac.createDynamicsCompressor();
        comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4;
        master = ac.createGain(); muffleF = ac.createBiquadFilter();
        muffleF.type = 'lowpass'; muffleF.frequency.value = 20000; muffleF.Q.value = 0.7;
        sfxBus = ac.createGain(); ambBus = ac.createGain();
        sfxBus.connect(muffleF); ambBus.connect(muffleF); muffleF.connect(master); master.connect(comp); comp.connect(ac.destination);
        const n = ac.sampleRate * 2;
        noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
        brownBuf = ac.createBuffer(1, n * 2, ac.sampleRate);
        const w = noiseBuf.getChannelData(0), b = brownBuf.getChannelData(0);
        for (let i = 0; i < n; i++) w[i] = ar() * 2 - 1;
        let last = 0;
        for (let i = 0; i < n * 2; i++) { last = (last + 0.02 * (ar() * 2 - 1)) / 1.02; b[i] = last * 3.5; }
        A.applySettings();
        return true;
      },
      resume() { if (ac && ac.state === 'suspended') { try { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); } catch (_) { /* ignore */ } } },
      applySettings() {
        if (!ac) return;
        const t = ac.currentTime;
        sfxBus.gain.setTargetAtTime(S.settings.sfx, t, 0.05);
        ambBus.gain.setTargetAtTime(S.settings.ambience, t, 0.2);
        master.gain.setTargetAtTime(masterVol * (1 - 0.45 * muffleAmt), t, 0.05);
      },
      master(vol) { masterVol = clamp(+vol, 0, 1); A.applySettings(); },
      // Lowpass + volume dip (sabotage, underwater, concussion).
      muffle(amount, seconds) {
        muffleAmt = clamp(+amount || 0, 0, 1);
        if (!ac) return;
        const t = ac.currentTime, tc = Math.max(0.01, (seconds === undefined ? 0.4 : seconds) / 3);
        muffleF.frequency.setTargetAtTime(lerp(20000, 450, Math.pow(muffleAmt, 0.6)), t, tc);
        master.gain.setTargetAtTime(masterVol * (1 - 0.45 * muffleAmt), t, tc);
      },
      play(name, opts) {
        if (!live()) return;
        opts = opts || {};
        const now = ac.currentTime;
        // The same sound twice within 20 ms (multi-hits) plays once.
        if (!opts.force && lastAt[name] !== undefined && now - lastAt[name] < 0.02) return;
        lastAt[name] = now;
        const rec = SFX[name];
        if (!rec) { warnOnce('sound ' + name, 'unknown sound "' + name + '"'); return; }
        try {
          const out = ac.createGain();
          out.gain.value = opts.vol === undefined ? 1 : clamp(+opts.vol, 0, 2);
          let node = out;
          if (opts.pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = clamp(opts.pan, -1, 1); out.connect(p); node = p; }
          node.connect(sfxBus);
          rec(now + (opts.delay || 0), out, opts.rate || 1);
          setTimeout(() => { try { out.disconnect(); } catch (_) { /* ignore */ } }, 4000);
        } catch (err) { warnOnce('sound err ' + name, err && err.message); }
      },
      // Ambience loops; several may run together (rain + city). vol 0 fades the loop out.
      loop(name, vol, fade) {
        if (S.headless || !ac) return;
        vol = vol === undefined ? 0.6 : clamp(+vol, 0, 1.5);
        fade = fade === undefined ? 1 : Math.max(0.01, fade);
        const t = ac.currentTime;
        let L = loops[name];
        if (L && vol <= 0) { L.stop(fade); delete loops[name]; return; }
        if (vol <= 0) return;
        if (!L) {
          const builder = LOOPS[name];
          if (!builder) { warnOnce('loop ' + name, 'unknown loop "' + name + '"'); return; }
          const g = ac.createGain(); g.gain.value = 0.0001; g.connect(ambBus);
          L = loops[name] = { name, gain: g, nodes: [], events: [], vol };
          try { builder(L); } catch (err) { warnOnce('loop err ' + name, err && err.message); }
          L.stop = (f) => {
            const tt = ac.currentTime;
            g.gain.cancelScheduledValues(tt); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), tt);
            g.gain.linearRampToValueAtTime(0.0001, tt + f);
            L.dead = true;
            setTimeout(() => { for (const n of L.nodes) { try { n.stop && n.stop(); } catch (_) { /* ignore */ } try { n.disconnect(); } catch (_) { /* ignore */ } } try { g.disconnect(); } catch (_) { /* ignore */ } }, (f + 0.2) * 1000);
          };
        }
        L.vol = vol;
        L.gain.gain.cancelScheduledValues(t);
        L.gain.gain.setValueAtTime(Math.max(0.0001, L.gain.gain.value), t);
        L.gain.gain.linearRampToValueAtTime(vol, t + fade);
      },
      stopLoops(fade) {
        const f = fade === undefined ? 1 : Math.max(0.01, fade);
        for (const k in loops) { loops[k].stop(f); delete loops[k]; }
      },
      playing: () => Object.keys(loops),
      // Called once per rendered frame by main.js: random one-shots inside loops (drips, birds, cars).
      update(dt) {
        if (!ac || S.headless) return;
        for (const k in loops) {
          const L = loops[k];
          for (const ev of L.events) {
            ev.t -= dt;
            if (ev.t <= 0) { ev.t = ev.min + ar() * (ev.max - ev.min); try { ev.fn(ac.currentTime + 0.02, L); } catch (_) { /* ignore */ } }
          }
        }
      },
      stopAll() { A.stopLoops(0.2); },
    };

    const warned = Object.create(null);
    function warnOnce(key, msg) { if (warned[key]) return; warned[key] = true; try { console.warn('[story audio]', msg); } catch (_) { /* ignore */ } }

    /* Primitives. t0 = start time, out = destination node. */
    function osc(type, f0, f1, t0, dur, vol, out, attack) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t0);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
      const a = attack || 0.003;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
      return o;
    }
    function noise(t0, dur, vol, out, o) {
      o = o || {};
      const src = ac.createBufferSource(); src.buffer = o.brown ? brownBuf : noiseBuf;
      const f = ac.createBiquadFilter(); f.type = o.type || 'bandpass';
      f.frequency.setValueAtTime(o.f0 || 1000, t0);
      if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t0 + dur);
      f.Q.value = o.q === undefined ? 1 : o.q;
      const g = ac.createGain(), a = o.attack || 0.002;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(out);
      src.start(t0, ar() * 1.5); src.stop(t0 + dur + 0.05);
    }
    function partials(t0, base, ratios, decays, vols, out) {
      ratios.forEach((r, i) => osc('sine', base * r, 0, t0, decays[i], vols[i], out, 0.002));
    }
    function bell(t0, out, r) {
      noise(t0, 0.03, 0.25, out, { type: 'highpass', f0: 4000 });
      partials(t0, 760 * r, [1, 2.76, 5.4, 8.93], [1.7, 1.1, 0.6, 0.3], [0.32, 0.16, 0.09, 0.04], out);
    }
    function step(t0, out, v) {
      noise(t0, 0.035, 0.12 * v, out, { type: 'lowpass', f0: 700 + ar() * 500 });
      osc('sine', 130, 80, t0, 0.04, 0.08 * v, out);
    }

    /* Punch impacts are low body thumps with a mid crack; the whiff is airy, no low end.
       slipOk is a bright two-note chime nothing else uses. */
    const SFX = {
      jab(t, o, r) { noise(t, 0.06, 0.55, o, { f0: 1900 * r, f1: 900, q: 0.8 }); osc('sine', 230 * r, 90, t, 0.07, 0.5, o); osc('square', 1400, 0, t, 0.012, 0.08, o); },
      cross(t, o, r) { noise(t, 0.085, 0.6, o, { f0: 1500 * r, f1: 650, q: 0.8 }); osc('sine', 185 * r, 70, t, 0.1, 0.65, o); },
      hook(t, o, r) { noise(t, 0.11, 0.55, o, { type: 'lowpass', f0: 1300 * r, f1: 500 }); osc('sine', 150 * r, 55, t, 0.14, 0.75, o); osc('triangle', 95, 50, t, 0.12, 0.25, o); },
      upper(t, o, r) { osc('sine', 150 * r, 60, t, 0.12, 0.7, o); noise(t, 0.09, 0.45, o, { f0: 1500 * r, f1: 2600, q: 1 }); },
      heavy(t, o, r) { osc('sine', 115 * r, 38, t, 0.24, 0.95, o); noise(t, 0.2, 0.7, o, { type: 'lowpass', f0: 900, f1: 260 }); noise(t, 0.035, 0.3, o, { f0: 3200, q: 1.5 }); },
      whiff(t, o, r) { noise(t, 0.14, 0.32, o, { f0: 2800 * r, f1: 700, q: 2.4, attack: 0.035 }); },
      block(t, o, r) { noise(t, 0.07, 0.45, o, { type: 'lowpass', f0: 650 * r }); osc('sine', 320 * r, 200, t, 0.05, 0.28, o); },
      dash(t, o, r) { noise(t, 0.13, 0.32, o, { type: 'highpass', f0: 500 * r, f1: 2800, attack: 0.01 }); osc('sine', 2000, 2600, t, 0.04, 0.05, o); },
      slip(t, o, r) { noise(t, 0.1, 0.22, o, { f0: 1500 * r, f1: 3200, q: 1.5, attack: 0.01 }); },
      slipOk(t, o, r) { osc('triangle', 1046 * r, 0, t, 0.2, 0.34, o); osc('triangle', 1568 * r, 0, t + 0.055, 0.3, 0.3, o); noise(t, 0.09, 0.16, o, { f0: 2400, f1: 4200, q: 1.2 }); },
      counter(t, o, r) { osc('sine', 210 * r, 58, t, 0.13, 0.85, o); noise(t, 0.075, 0.6, o, { f0: 2300, f1: 800, q: 0.9 }); osc('triangle', 784, 1175, t, 0.12, 0.18, o); },
      hurt(t, o, r) { osc('sawtooth', 150 * r, 80, t, 0.12, 0.12, o); noise(t, 0.09, 0.45, o, { type: 'lowpass', f0: 700 }); osc('sine', 120, 60, t, 0.1, 0.4, o); },
      down(t, o, r) { osc('sine', 92 * r, 34, t, 0.38, 0.9, o); noise(t, 0.4, 0.55, o, { type: 'lowpass', f0: 520, f1: 120 }); step(t + 0.16, o, 1.6); },
      step(t, o, r) { step(t, o, r); },
      land(t, o, r) { noise(t, 0.07, 0.3, o, { type: 'lowpass', f0: 700 * r }); osc('sine', 120, 58, t, 0.07, 0.25, o); },
      jump(t, o, r) { noise(t, 0.08, 0.14, o, { f0: 900 * r, f1: 1800, q: 1.2 }); },
      bell(t, o, r) { bell(t, o, r); },
      bell3(t, o, r) { bell(t, o, r); bell(t + 0.28, o, r); bell(t + 0.56, o, r); },
      door(t, o, r) { osc('sawtooth', 78 * r, 104, t, 0.3, 0.05, o, 0.05); noise(t + 0.28, 0.14, 0.45, o, { type: 'lowpass', f0: 420 }); osc('sine', 100, 50, t + 0.28, 0.15, 0.45, o); },
      stairs(t, o, r) { for (let i = 0; i < 4; i++) { noise(t + i * 0.17, 0.05, 0.28, o, { type: 'lowpass', f0: 1000 * r }); osc('sine', 140, 90, t + i * 0.17, 0.05, 0.18, o); } },
      pickup(t, o, r) { osc('square', 660 * r, 0, t, 0.06, 0.07, o); osc('square', 990 * r, 0, t + 0.06, 0.09, 0.07, o); },
      paper(t, o, r) { for (let i = 0; i < 3; i++) noise(t + i * 0.07 + ar() * 0.03, 0.09, 0.18, o, { f0: 2600 * r + ar() * 1500, q: 0.7, attack: 0.01 }); },
      evidence(t, o, r) { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => osc('sine', f * r, 0, t + i * 0.06, 1.3, 0.1, o, 0.01)); osc('sine', 130.8 * r, 0, t, 0.9, 0.09, o, 0.02); },
      quest(t, o, r) { osc('triangle', 587 * r, 0, t, 0.16, 0.18, o); osc('triangle', 880 * r, 0, t + 0.12, 0.4, 0.18, o); },
      checkpoint(t, o, r) { osc('sine', 880 * r, 0, t, 0.9, 0.1, o, 0.01); osc('sine', 1320 * r, 0, t + 0.03, 0.7, 0.06, o, 0.01); },
      ui(t, o, r) { osc('sine', 1200 * r, 0, t, 0.035, 0.09, o); },
      uiBack(t, o, r) { osc('sine', 700 * r, 0, t, 0.045, 0.09, o); },
      uiMove(t, o, r) { osc('sine', 1500 * r, 0, t, 0.016, 0.045, o); },
      type(t, o, r) { noise(t, 0.012, 0.05, o, { type: 'highpass', f0: 3000 * r }); },
      heartbeat(t, o, r) { osc('sine', 62 * r, 44, t, 0.13, 0.7, o, 0.008); osc('sine', 56 * r, 40, t + 0.2, 0.11, 0.5, o, 0.008); },
      crowdRoar(t, o, r) { noise(t, 1.8, 0.42, o, { f0: 900 * r, q: 0.6, attack: 0.4 }); noise(t, 1.6, 0.18, o, { f0: 2200 * r, q: 0.8, attack: 0.5 }); },
      crowdGasp(t, o, r) { noise(t, 0.7, 0.34, o, { f0: 1400 * r, f1: 800, q: 0.8, attack: 0.08 }); },
      carHorn(t, o, r) {
        const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800; f.connect(o);
        osc('square', 415 * r, 0, t, 0.45, 0.07, f, 0.01); osc('square', 494 * r, 0, t, 0.45, 0.07, f, 0.01);
      },
      vanDoor(t, o, r) { noise(t, 0.26, 0.6, o, { type: 'lowpass', f0: 1500 * r, f1: 300 }); osc('sine', 85, 45, t, 0.2, 0.6, o); partials(t, 420 * r, [1, 2.69, 4.45], [0.5, 0.35, 0.25], [0.05, 0.035, 0.02], o); },
      glass(t, o, r) { noise(t, 0.22, 0.3, o, { type: 'highpass', f0: 5000 }); for (let i = 0; i < 6; i++) osc('sine', (2500 + ar() * 3500) * r, 0, t + ar() * 0.12, 0.3, 0.05, o); },
      phoneRing(t, o, r) {
        for (let k = 0; k < 2; k++) {
          const t0 = t + k * 1.5, g = ac.createGain();
          g.gain.setValueAtTime(0.0001, t0);
          for (let i = 0; i < 40; i++) g.gain.setValueAtTime(i % 2 ? 0.0001 : 0.11, t0 + i * 0.025);
          g.gain.setValueAtTime(0.0001, t0 + 1.0); g.connect(o);
          [440, 480].forEach((f) => { const os = ac.createOscillator(); os.frequency.value = f * r; os.connect(g); os.start(t0); os.stop(t0 + 1.02); });
        }
      },
      dial(t, o, r) { osc('sine', 350 * r, 0, t, 1.5, 0.07, o, 0.02); osc('sine', 440 * r, 0, t, 1.5, 0.07, o, 0.02); },
      radio(t, o, r) { noise(t, 0.8, 0.12, o, { f0: 1800 * r, q: 2, attack: 0.05 }); osc('sine', 600 * r, 640, t, 0.7, 0.03, o, 0.05); },
      tvStatic(t, o, r) { noise(t, 0.8, 0.16, o, { type: 'highpass', f0: 2000 * r, attack: 0.02 }); },
      buzz(t, o, r) {
        const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; f.connect(o);
        osc('sawtooth', 120 * r, 0, t, 0.6, 0.06, f, 0.01); osc('square', 240 * r, 0, t, 0.6, 0.025, f, 0.01);
      },
    };

    /* Loop builders. L.gain is the loop's output; nodes go in L.nodes so stop() can end them. */
    function loopNoise(L, o) {
      const src = ac.createBufferSource(); src.buffer = o.brown ? brownBuf : noiseBuf; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = o.type || 'lowpass'; f.frequency.value = o.f || 800; f.Q.value = o.q === undefined ? 0.7 : o.q;
      const g = ac.createGain(); g.gain.value = o.vol;
      src.connect(f); f.connect(g); g.connect(L.gain); src.start(0, ar() * 1.5);
      L.nodes.push(src, f, g);
      return { src, f, g };
    }
    function lfo(L, param, rate, depth) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(param); o.start();
      L.nodes.push(o, g);
    }
    function loopTone(L, type, f, vol, through) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = vol; o.connect(g); g.connect(through || L.gain); o.start();
      L.nodes.push(o, g);
      return o;
    }
    const ev = (L, min, max, fn) => L.events.push({ t: min + ar() * (max - min), min, max, fn });
    const carPass = (t, L) => noise(t, 2.6 + ar() * 2, 0.16, L.gain, { f0: 380 + ar() * 400, q: 0.8, attack: 1.1 });
    const LOOPS = {
      city(L) { loopNoise(L, { brown: true, f: 380, vol: 0.5 }); const n = loopNoise(L, { type: 'bandpass', f: 1200, q: 0.5, vol: 0.035 }); lfo(L, n.g.gain, 0.05, 0.015); ev(L, 7, 18, carPass); ev(L, 20, 45, (t) => SFX.carHorn(t, L.gain, 0.85 + ar() * 0.2)); },
      rain(L) { loopNoise(L, { type: 'highpass', f: 900, vol: 0.2 }); loopNoise(L, { brown: true, f: 300, vol: 0.18 }); ev(L, 0.08, 0.3, (t) => osc('sine', 1800 + ar() * 2400, 900, t, 0.03, 0.02, L.gain)); },
      hum(L) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.connect(L.gain); L.nodes.push(f); loopTone(L, 'sawtooth', 120, 0.03, f); loopTone(L, 'sine', 240, 0.012); },
      crowd(L) { const n = loopNoise(L, { type: 'bandpass', f: 700, q: 0.7, vol: 0.18 }); loopNoise(L, { type: 'bandpass', f: 1600, q: 0.8, vol: 0.05 }); lfo(L, n.g.gain, 0.2, 0.05); ev(L, 3, 8, (t) => noise(t, 1.2, 0.12, L.gain, { f0: 900, q: 0.7, attack: 0.4 })); },
      arena(L) { const n = loopNoise(L, { type: 'bandpass', f: 750, q: 0.6, vol: 0.24 }); loopNoise(L, { brown: true, f: 200, vol: 0.3 }); lfo(L, n.g.gain, 0.13, 0.07); ev(L, 4, 10, (t) => noise(t, 1.6, 0.2, L.gain, { f0: 1000, q: 0.6, attack: 0.5 })); },
      wind(L) { const n = loopNoise(L, { type: 'bandpass', f: 500, q: 3, vol: 0.2 }); lfo(L, n.f.frequency, 0.07, 280); lfo(L, n.g.gain, 0.11, 0.08); },
      traffic(L) { loopNoise(L, { brown: true, f: 300, vol: 0.4 }); ev(L, 2.5, 7, carPass); },
      fire(L) { loopNoise(L, { brown: true, f: 600, vol: 0.3 }); ev(L, 0.04, 0.22, (t) => noise(t, 0.012 + ar() * 0.02, 0.08 + ar() * 0.2, L.gain, { type: 'highpass', f0: 2000 })); },
      room(L) { loopNoise(L, { brown: true, f: 250, vol: 0.12 }); },
      courtyard(L) { loopNoise(L, { type: 'bandpass', f: 3000, q: 0.5, vol: 0.02 }); const n = loopNoise(L, { type: 'bandpass', f: 450, q: 2, vol: 0.06 }); lfo(L, n.g.gain, 0.09, 0.03); ev(L, 5, 15, (t) => { const k = 2 + Math.floor(ar() * 2); for (let i = 0; i < k; i++) osc('sine', 3000 + ar() * 600, 4400, t + i * 0.11, 0.07, 0.02, L.gain); }); },
      office(L) { loopNoise(L, { type: 'lowpass', f: 1200, vol: 0.03 }); loopTone(L, 'sine', 120, 0.008); },
      tinnitus(L) { loopTone(L, 'sine', 6400, 0.03); loopTone(L, 'sine', 6411, 0.02); },
    };
    A.sounds = Object.keys(SFX);
    A.loops = Object.keys(LOOPS);
    return A;
  })();

  /* ── Persistent game state (§9) ───────────────────────────────────── */
  const SKILLS_DEFAULT = { jab: true, cross: true, guard: true, slip: true, dash: true, backdash: true, airdash: true,
    hook: false, uppercut: false, counter: false, dashStraight: false, flurry: false };
  S.newState = function () {
    return {
      v: 1, chapter: 0, loc: null, x: 0, y: null, face: 1, checkpoint: null,
      flags: {}, rel: {}, money: 0,
      quests: {}, evidence: {}, memories: {}, people: {},
      skills: Object.assign({}, SKILLS_DEFAULT),
      gear: { knuckles: false },
      train: { balance: 0, footwork: 0, reaction: 0, conditioning: 0, bag: 0, mitts: 0 },
      visited: {}, choices: [], stats: {}, completed: {}, snapshots: {}, ending: null, playtime: 0,
      // Extensions (see notes/core.md): Jin's body this chapter, standing combat restrictions.
      body: null, restrict: null,
    };
  };
  // Fill any keys an older save is missing so code can rely on the full shape.
  S.migrateState = function (g) {
    const base = S.newState();
    if (!g || typeof g !== 'object') return base;
    for (const k in base) if (g[k] === undefined) g[k] = base[k];
    g.skills = Object.assign({}, SKILLS_DEFAULT, g.skills || {});
    g.gear = Object.assign({ knuckles: false }, g.gear || {});
    g.train = Object.assign({}, base.train, g.train || {});
    if (!Array.isArray(g.choices)) g.choices = [];
    g.v = 1;
    return g;
  };
  S.G = S.newState();

  /* ── Save / load ──────────────────────────────────────────────────── */
  const SLOTS = ['auto', 1, 2, 3];
  const SANDBOX = 99;
  const slotKey = (slot) => 'save.' + slot;
  S.saveSlots = SLOTS.slice();
  // A copy of G without the chapter snapshots (they would nest) — used for snapshots themselves.
  S.stateCopy = function (g) {
    const snaps = g.snapshots; g.snapshots = {};
    try { return clone(g); } finally { g.snapshots = snaps; }
  };

  /* save(slot, label[, opts]) — opts.keepPos keeps G.loc/x as set by the caller;
     opts.resume describes how to resume a scene (director.captureResume() when omitted);
     opts.backup copies the previous autosave to 'save.autoBackup' before overwriting it. */
  S.save = function (slot, label, opts) {
    try {
      opts = opts || {};
      const G = S.G;
      if (!G || !SLOTS.includes(slot)) return false;
      const W = S.world;
      if (!opts.keepPos && W && W.jin && W.locId) {
        G.loc = W.locId; G.x = Math.round(W.jin.x); G.y = Math.round(W.jin.y); G.face = W.jin.face || 1;
      }
      let resume = opts.resume;
      if (resume === undefined) resume = S.director && S.director.captureResume ? S.director.captureResume() : null;
      const def = S.story && S.story.chapters ? S.story.chapters[G.chapter] : null;
      let locName = null;
      try { const L = S.story && S.story.location ? S.story.location(G.loc) : null; locName = L ? L.name : null; } catch (_) { /* ignore */ }
      const meta = {
        slot, label: label || (def ? 'Chapter ' + G.chapter + ' — ' + def.title : 'Chapter ' + G.chapter),
        chapter: G.chapter, chapterTitle: def ? def.title : null, loc: G.loc, locName,
        playtime: Math.round(G.playtime), when: Date.now(), version: S.VERSION,
      };
      if (slot === 'auto' && opts.backup && G.chapter !== SANDBOX) {
        const prev = S.store.get(slotKey('auto'), null);
        if (prev && prev.G) S.store.set('save.autoBackup', prev);
      }
      // The movement sandbox (chapter 99) autosaves to its own unlisted key so it never replaces the campaign's.
      const key = slot === 'auto' && G.chapter === SANDBOX ? 'save.sandbox' : slotKey(slot);
      S.store.set(key, { meta, G: clone(G), resume: resume ? clone(resume) : null });
      S.events.emit('saved', { slot, label: meta.label });
      return true;
    } catch (err) { S.fail(err, { source: 'save' }); return false; }
  };

  S.load = function (slot) {
    try {
      const data = S.store.get(slotKey(slot), null);
      if (!data || !data.G) return false;
      S.G = S.migrateState(data.G);
      S.pendingResume = { slot, resume: data.resume || null, token: (S.pendingResume ? S.pendingResume.token : 0) + 1, used: false };
      S.events.emit('loaded', { slot });
      return true;
    } catch (err) { S.fail(err, { source: 'load' }); return false; }
  };
  S.listSaves = function () {
    const out = [];
    for (const slot of SLOTS) {
      const d = S.store.get(slotKey(slot), null);
      if (d && d.G && d.meta) out.push({ slot, label: d.meta.label, chapter: d.meta.chapter, chapterTitle: d.meta.chapterTitle,
        loc: d.meta.locName || d.meta.loc, playtime: d.meta.playtime, when: d.meta.when });
    }
    return out;
  };
  S.hasSave = (slot) => { const d = S.store.get(slotKey(slot), null); return !!(d && d.G); };
  S.deleteSave = (slot) => { if (SLOTS.includes(slot)) S.store.del(slotKey(slot)); };
  // Read a slot's state without making it current (the title's Chapters list reads the autosave this way).
  S.peekSave = (slot) => { const d = S.store.get(slotKey(slot), null); return d && d.G ? S.migrateState(d.G) : null; };
})(window.STORY = window.STORY || {});
