/* Story Mode — main.js
   STORY.open / STORY.close, the title flow, the fixed-step main loop, display scaling,
   the error overlay and the S.test harness (with a test autopilot).
   Contract: ARCHITECTURE.md §1, §11, §12. Notes: story/dev/notes/core-director-main.md.

   Every sim step (S.DT = 1/120 s; a rendered frame runs at most 0.25 s of steps):
     pre-step hooks (test autopilot, virtual input for this step)
     -> S.input.update() -> S.director.update(dt)
     -> S.world.update(dt)   (world freezes actors itself while S.hitstop > 0 or S.paused)
     -> S.activities.update(dt) (idempotent per step) -> S.time and G.playtime advance unless paused.
   Every rendered frame (browser only):
     S.world.render(ctx) on the 640x360 logical canvas (the title backdrop when no location is live)
     -> S.fx.fade overlay -> nearest-neighbour blit to the display canvas
     -> S.ui.update(dt) -> S.audio.update(dt).

   S.main (beyond the contract; see notes):
     mode 'closed' | 'title' | 'play', setMode(m), toTitle(opts), root, canvas (display), logical,
     ctx (logical 2D context), view {x, y, w, h, scale} (canvas rect in CSS px inside #story-root),
     toScreen(lx, ly) logical px -> CSS px, onStep(fn, post) hooks, saveOnLeave(). */
(function (S) {
  'use strict';

  const U = S.util;
  const DT = S.DT || 1 / 120;
  const MAX_FRAME = 0.25;
  const MAX_STEPS = Math.ceil(MAX_FRAME / DT) + 1;
  const LW = S.W || 640, LH = S.H || 360;
  const SANDBOX = 99;
  const story = S.story || (S.story = {});
  const errs = S.errors || (S.errors = []);
  const has = (o, fn) => !!o && typeof o[fn] === 'function';

  function guard(source, fn) {
    try { return fn(); } catch (err) { S.fail(err, { source }); return undefined; }
  }

  /* ── 1. Main state ────────────────────────────────────────────────── */
  const M = S.main = {
    mode: 'closed',
    root: null, canvas: null, logical: null, ctx: null, dctx: null,
    view: { x: 0, y: 0, w: LW, h: LH, scale: 1, k: 1 },
    onExit: null, running: false, raf: 0, lastTs: null, acc: 0,
    frames: 0, steps: 0, pendingLoad: null, escPending: false,
    errorShown: false,
  };
  const preStep = [], postStep = [];
  // onStep(fn, post): fn(dt) runs every sim step, before input.update (or after the step when post).
  M.onStep = function (fn, post) {
    const list = post ? postStep : preStep;
    list.push(fn);
    return () => { const i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); };
  };
  M.toScreen = (lx, ly) => ({ x: M.view.x + lx * M.view.scale, y: M.view.y + ly * M.view.scale });
  // The display canvas rect inside #story-root (CSS px). world.js prefers this over measuring a canvas, so
  // S.world.screenPos (barks, prompts, markers) lands on the scaled display, not the off-screen logical canvas.
  M.viewRect = () => ({ x: M.view.x, y: M.view.y, w: M.view.w, h: M.view.h });

  /* ── 2. Errors: S.fail with the overlay ───────────────────────────── */
  const errCount = new Map();
  let failing = false;
  // Replaces core's plain S.fail (same record shape). Repeats of one error are recorded three times only.
  S.fail = function (err, ctx) {
    const e = err instanceof Error ? err : new Error(String(err && err.message !== undefined ? err.message : err));
    const source = (ctx && ctx.source) || '';
    const key = source + '|' + e.message;
    const n = (errCount.get(key) || 0) + 1;
    errCount.set(key, n);
    if (n <= 3) {
      errs.push({ message: e.message, stack: String(e.stack || ''), ctx: ctx || null, source, time: S.time, n });
      if (errs.length > 300) errs.splice(0, errs.length - 300);
      try { console.error('[story]', source ? source + ':' : '', e.message, e.stack || ''); } catch (_) { /* no console */ }
    } else if (n === 4) {
      try { console.warn('[story] this error keeps repeating; further copies are not logged:', key); } catch (_) { /* no console */ }
    }
    if (failing || S.headless || !S.isOpen) return;
    failing = true;
    try { showError(e, source, n); } catch (_) { /* the overlay itself failed: nothing more to do */ }
    failing = false;
  };

  let errEl = null, errMore = 0;
  function showError(e, source, n) {
    // One overlay at a time: later errors only raise its count.
    if (M.errorShown) { errMore++; updateErrorMore(); return; }
    if (n > 1) return;
    // ui.js owns the overlay when it is healthy; errors from the UI itself use main's.
    if (S.ui && has(S.ui, 'error') && !/^ui\b/.test(source)) {
      try { S.ui.error(e, { source }); return; } catch (_) { /* fall through to main's overlay */ }
    }
    if (!M.root) return;
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'sm-err';
      errEl.setAttribute('role', 'alertdialog');
      errEl.innerHTML = '<div class="sm-err-box"><div class="sm-kicker">Story Mode</div><h2>Something went wrong</h2>' +
        '<p class="sm-err-msg"></p><p class="sm-err-src"></p><p class="sm-err-more"></p>' +
        '<div class="sm-err-btns"><button type="button" data-a="keep">Keep playing</button>' +
        '<button type="button" data-a="title">Back to the title</button><button type="button" data-a="lobby">Back to the lobby</button></div></div>';
      errEl.addEventListener('click', (ev) => {
        const b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
        if (!b) return;
        const a = b.getAttribute('data-a');
        hideError();
        if (a === 'title') M.toTitle();
        else if (a === 'lobby') S.close();
      });
    }
    errEl.querySelector('.sm-err-msg').textContent = e.message || String(e);
    errEl.querySelector('.sm-err-src').textContent = source ? 'Where: ' + source : '';
    errEl.querySelector('[data-a="title"]').style.display = M.mode === 'play' ? '' : 'none';
    errMore = 0; updateErrorMore();
    if (!errEl.parentNode) M.root.appendChild(errEl);
    M.errorShown = true;
    try { errEl.querySelector('[data-a="keep"]').focus({ preventScroll: true }); } catch (_) { /* old browser */ }
  }
  function updateErrorMore() {
    if (!errEl) return;
    errEl.querySelector('.sm-err-more').textContent = errMore ? errMore + ' more error' + (errMore > 1 ? 's' : '') + ' since (see the console).' : '';
  }
  function hideError() {
    if (errEl && errEl.parentNode) errEl.parentNode.removeChild(errEl);
    M.errorShown = false;
    if (M.root) try { M.root.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
  }
  M.hideError = hideError;

  /* ── 3. DOM: root, canvases, scaling ──────────────────────────────── */
  const CSS = [
    '#story-root{position:fixed;inset:0;z-index:1000;background:#000;overflow:hidden;outline:none;user-select:none;-webkit-user-select:none;color:#efe6d2;font-family:"Iowan Old Style",Georgia,serif}',
    '#story-root #story-canvas{display:block;position:absolute;left:0;top:0;margin:0;border:0;border-radius:0;max-width:none;image-rendering:pixelated;image-rendering:crisp-edges;background:#000}',
    '#story-root .sm-kicker{font:700 11px/1.2 "Courier New",monospace;letter-spacing:.22em;text-transform:uppercase;color:#e8c272;font-variant:small-caps}',
    '#story-root .sm-err{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:60}',
    '#story-root .sm-err-box{max-width:min(560px,90vw);padding:22px 26px;background:rgba(14,16,22,.94);border:1px solid #d8402f;box-shadow:0 10px 40px rgba(0,0,0,.6)}',
    '#story-root .sm-err h2{margin:6px 0 10px;font-size:22px;font-weight:600;color:#f3ead6}',
    '#story-root .sm-err-msg{margin:0 0 6px;font:14px/1.45 "Courier New",monospace;color:#f0b0a4;word-break:break-word}',
    '#story-root .sm-err-src,#story-root .sm-err-more{margin:0 0 4px;font:12px/1.4 "Courier New",monospace;color:#9aa3b2}',
    '#story-root .sm-err-btns,#story-root .sm-fb-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}',
    '#story-root .sm-err button,#story-root .sm-fb button{font:600 13px/1 "Courier New",monospace;letter-spacing:.08em;text-transform:uppercase;padding:9px 14px;color:#e8c272;background:rgba(232,194,114,.08);border:1px solid rgba(232,194,114,.55);cursor:pointer}',
    '#story-root .sm-err button:hover,#story-root .sm-fb button:hover,#story-root .sm-fb button.sel{background:rgba(232,194,114,.22);color:#fff3cf}',
    '#story-root .sm-fb button[disabled]{opacity:.45;cursor:not-allowed}',
    '#story-root .sm-fb{position:absolute;inset:0;pointer-events:none;z-index:40}',
    '#story-root .sm-fb>*{pointer-events:auto}',
    '#story-root .sm-fb-title{position:absolute;left:8%;top:50%;transform:translateY(-50%);max-width:420px;padding:24px 28px;background:rgba(10,12,18,.78);border-left:2px solid #e8c272}',
    '#story-root .sm-fb-title h1{margin:6px 0 2px;font-size:34px;font-weight:600;color:#f3ead6}',
    '#story-root .sm-fb-title .sm-why{margin:8px 0 0;font:12px/1.4 "Courier New",monospace;color:#9aa3b2;min-height:1.4em}',
    '#story-root .sm-fb-title .sm-fb-btns{flex-direction:column;align-items:stretch}',
    '#story-root .sm-fb-line{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);width:min(760px,90%);padding:14px 18px;background:rgba(10,12,18,.86);border:1px solid rgba(232,194,114,.35);cursor:pointer}',
    '#story-root .sm-fb-line .sm-name{font:700 12px/1 "Courier New",monospace;letter-spacing:.14em;text-transform:uppercase;color:#e8c272;margin-bottom:6px}',
    '#story-root .sm-fb-line .sm-text{font-size:17px;line-height:1.45}',
    '#story-root .sm-fb-line .sm-text.th{font-style:italic;color:#cfd6e2}',
    '#story-root .sm-fb-line .sm-ch{display:block;width:100%;text-align:left;margin-top:6px;text-transform:none;letter-spacing:0;font-family:"Iowan Old Style",Georgia,serif;font-size:15px}',
    '#story-root .sm-fb-screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(0,0,0,.82);cursor:pointer;padding:0 8%}',
    '#story-root .sm-fb-screen h2{margin:8px 0;font-size:34px;font-weight:600;color:#f3ead6}',
    '#story-root .sm-fb-screen p{margin:4px 0;font-size:16px;color:#cfd6e2}',
    '#story-root .sm-fb-obj{position:absolute;left:16px;top:16px;font:13px/1.3 "Courier New",monospace;color:#e8c272;text-shadow:0 1px 2px #000}',
  ].join('\n');

  function injectCss() {
    if (document.getElementById('story-main-css')) return;
    const st = document.createElement('style');
    st.id = 'story-main-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  let bodyOverflow = null;
  /* The root is built once and re-attached on every open (close only detaches it), so DOM that ui.js
     built inside it, and any references it keeps, stay valid across visits from the lobby. */
  function buildDom() {
    injectCss();
    const stale = document.getElementById('story-root');
    if (stale && stale !== M.root && stale.parentNode) stale.parentNode.removeChild(stale);
    if (!M.root) {
      const root = document.createElement('div');
      root.id = 'story-root';
      root.className = 'story-root';
      root.setAttribute('tabindex', '-1');
      root.setAttribute('role', 'application');
      root.setAttribute('aria-label', 'Inside the Impact — Story Mode');
      const cv = document.createElement('canvas');
      cv.id = 'story-canvas';
      cv.width = LW; cv.height = LH;
      cv.setAttribute('aria-hidden', 'true');
      root.appendChild(cv);
      const lg = document.createElement('canvas');
      lg.width = LW; lg.height = LH;
      M.root = root; M.canvas = cv; M.logical = lg;
      M.ctx = lg.getContext('2d');
      M.dctx = cv.getContext('2d');
      if (M.ctx) M.ctx.imageSmoothingEnabled = false;
      root.addEventListener('pointerdown', onPointer);
    }
    document.body.appendChild(M.root);
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    layout();
    try { M.root.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
  }
  function onPointer() {
    if (S.audio) { if (!S.audio.ctx && has(S.audio, 'init')) S.audio.init(); if (has(S.audio, 'resume')) S.audio.resume(); }
    const a = document.activeElement;
    if (!a || a === document.body || !M.root.contains(a)) try { M.root.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
  }

  /* Scale: an integer number of device pixels per logical pixel when that fills at least 80% of the
     window, else the exact fit. The display canvas keeps an integer multiple of 640x360 as its
     backing store (nearest-neighbour blit), so a fractional CSS fit stays even instead of shimmering. */
  function layout() {
    if (!M.root) return;
    const cw = M.root.clientWidth || window.innerWidth || LW, ch = M.root.clientHeight || window.innerHeight || LH;
    const dpr = Math.max(1, Math.min(4, window.devicePixelRatio || 1));
    const fit = Math.min((cw * dpr) / LW, (ch * dpr) / LH);
    let phys = fit;
    const whole = Math.floor(fit);
    if (whole >= 1 && whole / fit >= 0.8) phys = whole;
    const s = Math.max(0.1, phys / dpr);
    const k = U.clamp(Math.ceil(phys - 1e-6), 1, 6);
    const cv = M.canvas;
    if (cv.width !== LW * k) { cv.width = LW * k; cv.height = LH * k; if (M.dctx) M.dctx.imageSmoothingEnabled = false; }
    const w = Math.round(LW * s), h = Math.round(LH * s);
    const x = Math.round((cw - w) / 2), y = Math.round((ch - h) / 2);
    Object.assign(cv.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    M.view = { x, y, w, h, scale: s, k };
    const rs = M.root.style;
    rs.setProperty('--story-scale', String(s));
    rs.setProperty('--story-view-x', x + 'px'); rs.setProperty('--story-view-y', y + 'px');
    rs.setProperty('--story-view-w', w + 'px'); rs.setProperty('--story-view-h', h + 'px');
    S.events.emit('resize', M.view);
  }
  M.layout = layout;

  /* ── 4. The loop ──────────────────────────────────────────────────── */
  function stepSim() {
    M.steps++;
    if (M.pendingLoad) resumeAfterLoad();
    for (let i = 0; i < preStep.length; i++) guard('step hook', () => preStep[i](DT));
    if (S.input) guard('input', () => S.input.update());
    if (S.director && has(S.director, 'update')) guard('director', () => S.director.update(DT));
    if (S.world && has(S.world, 'update')) guard('world', () => S.world.update(DT));
    else if (S.hitstop > 0) S.hitstop = Math.max(0, S.hitstop - DT);   // nobody else counts it down
    if (S.activities && has(S.activities, 'update')) guard('activities', () => S.activities.update(DT));
    if (!S.paused) {
      S.time += DT;
      if (M.mode === 'play' && S.G) S.G.playtime = (+S.G.playtime || 0) + DT;
    }
    for (let i = 0; i < postStep.length; i++) guard('step hook', () => postStep[i](DT));
  }
  M.step = stepSim;

  function frame(ts) {
    if (!M.running) return;
    M.raf = window.requestAnimationFrame(frame);
    const now = (typeof ts === 'number' ? ts : performance.now()) / 1000;
    let dt = M.lastTs === null ? DT : now - M.lastTs;
    M.lastTs = now;
    if (!(dt >= 0)) dt = 0;
    if (dt > MAX_FRAME) dt = MAX_FRAME;
    tick(dt);
  }
  function tick(dt) {
    M.frames++;
    S.realTime += dt;
    M.acc += dt;
    let n = 0;
    while (M.acc >= DT - 1e-9 && n < MAX_STEPS && S.isOpen) { stepSim(); M.acc -= DT; n++; }
    if (n >= MAX_STEPS) M.acc = 0;
    if (!S.isOpen) return;
    renderFrame(dt);
    // The UI may close a window on this Esc; remember what was open before it ran.
    const uiWasOpen = uiWindowOpen();
    const fullUi = !!(S.ui && has(S.ui, 'update'));
    if (fullUi) guard('ui.update', () => S.ui.update(dt));
    // The fallback renders everything without ui.js, and only its title menu when ui.js has no title().
    if (!fullUi || (FB.title && FB.title.parentNode)) fbUpdate(!fullUi);
    if (M.escPending) {
      M.escPending = false;
      if (S.isOpen && M.mode === 'title' && !uiWasOpen && !uiWindowOpen() && !M.errorShown && !(S.ui && S.ui.handlesTitleEsc)) S.close();
    }
    if (M.errorShown && S.input && has(S.input, 'framePressed') && S.input.framePressed('pause')) hideError();
    if (S.audio && has(S.audio, 'update')) guard('audio', () => S.audio.update(dt));
    if (S.input && has(S.input, 'clearFrame')) S.input.clearFrame();
  }

  function renderFrame(dt) {
    const ctx = M.ctx;
    if (!ctx) return;
    const W = S.world;
    let drew = false;
    if (M.mode === 'play' && W && W.loc && has(W, 'render')) {
      try { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; W.render(ctx); drew = true; }
      catch (err) { S.fail(err, { source: 'world.render' }); }
    }
    if (!drew) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      if (M.mode === 'play') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, LW, LH); }
      else guard('title backdrop', () => drawTitleBackdrop(ctx, dt));
    }
    // Director fade (A.fade, chapter flows). world.js sets rendersFade if it draws S.fx.fade itself.
    const f = S.fx;
    if (M.mode === 'play' && f && f.fade > 0.001 && !(W && W.rendersFade)) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = U.clamp(+f.fade, 0, 1);
      ctx.fillStyle = f.fadeColor || '#000';
      ctx.fillRect(0, 0, LW, LH);
      ctx.globalAlpha = 1;
    }
    const d = M.dctx;
    if (d) {
      d.setTransform(1, 0, 0, 1, 0, 0);
      d.imageSmoothingEnabled = false;
      d.drawImage(M.logical, 0, 0, M.canvas.width, M.canvas.height);
    }
  }

  /* ── 5. Title backdrop: Eastgate at dusk in the rain (drawn here so the title works on its own) ── */
  const TB = { t: 0, figure: true, far: null, near: null };
  const TPAL = { sky0: '#17151f', sky1: '#2c2c3d', sky2: '#4a4352', haze: '#6a5559', far: '#262a37', far2: '#2f3443',
    brick: '#4a332d', brick2: '#3a2925', mortar: '#2a1e1b', street: '#262b35', walk: '#363c48', curb: '#4a5160',
    pole: '#1c2027', amber: '#e8b35a', amberDim: '#a87b3d', rain: 'rgba(170,190,215,0.32)' };
  function layerCanvas(w, h, paint) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    if (g) paint(g);
    return c;
  }
  // The two building rows never change: paint them once, then scroll them (seamless loops of 960 / 1280 px).
  function titleLayers() {
    const hash = U.hash;
    TB.far = layerCanvas(960, 260, (g) => {
      for (let i = 0; i < 26; i++) {
        const bx = i * 37, bw = 22 + Math.floor(hash(i + 0.5) * 26), bh = 50 + Math.floor(hash(i + 7.3) * 90);
        for (const ox of [0, -960]) {
          g.fillStyle = i % 3 ? TPAL.far : TPAL.far2; g.fillRect(bx + ox, 250 - bh, bw, bh + 10);
          for (let wy = 250 - bh + 6; wy < 244; wy += 7) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) {
            if (hash(wx * 13.1 + wy * 7.7) > 0.86) { g.fillStyle = hash(wx + wy) > 0.5 ? TPAL.amber : TPAL.amberDim; g.globalAlpha = 0.5; g.fillRect(wx + ox, wy, 2, 2); g.globalAlpha = 1; }
          }
        }
      }
      for (const sx of [120, 600]) { g.fillStyle = TPAL.far2; g.fillRect(sx, 120, 9, 140); g.fillRect(sx - 2, 118, 13, 3); }
    });
    TB.near = layerCanvas(1280, 160, (g) => {
      for (let i = 0; i < 10; i++) {
        const bx = i * 128, bw = 112, top = 150 + Math.floor(hash(i + 3.1) * 40) - 140;
        g.fillStyle = i % 2 ? TPAL.brick : TPAL.brick2; g.fillRect(bx, top, bw, 160 - top);
        g.fillStyle = TPAL.mortar;
        for (let y = top + 3; y < 160; y += 4) g.fillRect(bx, y, bw, 1);
        g.fillStyle = '#2a2024'; g.fillRect(bx, top - 3, bw, 3);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
          const wx = bx + 10 + c * 26, wy = top + 12 + r * 34;
          if (wy > 122) continue;
          const lit = hash(i * 31 + r * 7 + c) > 0.62;
          g.fillStyle = lit ? TPAL.amber : '#1d2029'; g.globalAlpha = lit ? 0.85 : 1; g.fillRect(wx, wy, 12, 16); g.globalAlpha = 1;
          g.fillStyle = '#5a4238'; g.fillRect(wx - 1, wy + 16, 14, 2);
        }
      }
    });
  }
  function drawTitleBackdrop(ctx, dt) {
    TB.t += dt;
    const t = TB.t, hash = U.hash;
    if (!TB.far) titleLayers();
    const g = ctx.createLinearGradient(0, 0, 0, 260);
    g.addColorStop(0, TPAL.sky0); g.addColorStop(0.55, TPAL.sky1); g.addColorStop(0.85, TPAL.sky2); g.addColorStop(1, TPAL.haze);
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
    // Far skyline and smokestacks (slow parallax), smoke drifting off the stacks.
    const off1 = Math.floor((t * 3) % 960);
    ctx.drawImage(TB.far, -off1, 0); ctx.drawImage(TB.far, 960 - off1, 0);
    ctx.globalAlpha = 0.16; ctx.fillStyle = '#9aa0ad';
    for (const sx of [120, 600]) {
      const x = ((sx - off1) % 960 + 960) % 960;
      for (let k = 0; k < 6; k++) { const p = (t * 0.15 + k / 6) % 1; ctx.beginPath(); ctx.arc(x + 4 + p * 40, 114 - p * 60, 5 + p * 14, 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    // Near brick row houses.
    const off2 = Math.floor((t * 9) % 1280);
    ctx.drawImage(TB.near, -off2, 140); ctx.drawImage(TB.near, 1280 - off2, 140);
    // Street, curb and a streetlight pool.
    ctx.fillStyle = TPAL.walk; ctx.fillRect(0, 300, LW, 16);
    ctx.fillStyle = TPAL.curb; ctx.fillRect(0, 316, LW, 2);
    ctx.fillStyle = TPAL.street; ctx.fillRect(0, 318, LW, LH - 318);
    const lx = 470;
    const cone = ctx.createRadialGradient(lx, 205, 4, lx, 300, 150);
    cone.addColorStop(0, 'rgba(232,179,90,0.42)'); cone.addColorStop(1, 'rgba(232,179,90,0)');
    ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(lx - 6, 205); ctx.lineTo(lx - 95, 318); ctx.lineTo(lx + 95, 318); ctx.lineTo(lx + 6, 205); ctx.closePath(); ctx.fill();
    ctx.fillStyle = TPAL.pole; ctx.fillRect(lx + 18, 196, 3, 104); ctx.fillRect(lx - 2, 196, 22, 3); ctx.fillRect(lx - 6, 199, 12, 4);
    ctx.fillStyle = '#ffe2a8'; ctx.fillRect(lx - 5, 203, 10, 2);
    // Puddle reflections: broken horizontal amber strokes.
    ctx.fillStyle = 'rgba(232,179,90,0.35)';
    for (let k = 0; k < 7; k++) ctx.fillRect(lx - 40 + k * 11 + Math.round(Math.sin(t * 2 + k) * 2), 330 + (k % 3) * 4, 6 + (k % 2) * 4, 1);
    // Jin under the light, if the figure renderer is loaded.
    if (TB.figure && S.art && has(S.art, 'drawFigure')) {
      try {
        const pose = Array.isArray(S.art.poses) && S.art.poses.indexOf('pocket') >= 0 ? 'pocket' : 'idle';
        S.art.drawFigure(ctx, lx - 22, 300, 1, pose, t, (S.looks && S.looks.jin_street) ? 'jin_street' : 'jin', { shadow: true });
      } catch (_) { TB.figure = false; }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    }
    // Rain.
    ctx.fillStyle = TPAL.rain;
    for (let i = 0; i < 140; i++) {
      const sp = 300 + hash(i + 0.17) * 160;
      const x = Math.floor((hash(i + 0.91) * 720 - t * 70) % 720 + 720) % 720 - 40;
      const y = Math.floor((hash(i + 0.37) * 420 + t * sp) % 420) - 30;
      ctx.fillRect(x, y, 1, 4); ctx.fillRect(x - 1, y + 4, 1, 3);
    }
    // Vignette.
    const v = ctx.createRadialGradient(LW / 2, LH / 2, 120, LW / 2, LH / 2, 420);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, LW, LH);
  }

  /* ── 6. Modes and the title flow ──────────────────────────────────── */
  M.setMode = function (m) {
    if (m === M.mode) return;
    const prev = M.mode;
    M.mode = m;
    if (m !== 'title') fbHideTitle();
    if (m === 'play' && prev === 'title') closeUiWindows();
    S.events.emit('mode', { mode: m, prev });
  };

  function uiWindowOpen() {
    if (!S.ui || !has(S.ui, 'isOpen')) return false;
    try { return !!S.ui.isOpen(); } catch (_) { return false; }
  }
  function closeUiWindows() {
    if (!S.ui) return;
    for (let i = 0; i < 4 && uiWindowOpen(); i++) {
      if (!has(S.ui, 'closeWindow')) break;
      guard('ui.closeWindow', () => S.ui.closeWindow());
    }
    if (!uiWindowOpen()) S.paused = false;
  }

  function unloadWorld() {
    const W = S.world;
    if (!W) return;
    for (const fn of ['unload', 'clear']) if (has(W, fn)) { guard('world.' + fn, () => W[fn]()); return; }
    W.loc = null; W.locId = null; W.focus = null;
    if (Array.isArray(W.actors)) W.actors.length = W.jin ? 1 : 0;
    if (S.cam && has(S.cam, 'follow')) guard('cam.follow', () => S.cam.follow());
  }
  // Stop everything that belongs to a running game (director, fights, activities, the location).
  function stopGameplay() {
    AP.stop();
    if (S.director && has(S.director, 'reset')) guard('director.reset', () => S.director.reset());
    unloadWorld();
    if (S.audio && has(S.audio, 'stopLoops')) S.audio.stopLoops(0.6);
    S.timeScale = 1; S.hitstop = 0; S.paused = false;
    if (S.input && has(S.input, 'reset')) S.input.reset();
  }

  // Autosave when leaving play, but only while the player has control (a cutscene keeps its checkpoint).
  M.saveOnLeave = function () {
    const Dr = S.director, G = S.G, W = S.world;
    if (M.mode !== 'play' || !G || !story.has || !story.has(G.chapter) || G.chapter === SANDBOX) return false;
    if (!W || !W.locId || !W.jin) return false;
    if (Dr && (Dr.busy || Dr.endReq || Dr.screen)) return false;
    const cs = S.combat && S.combat.state;
    if (cs && ((cs.fight && !cs.fight.done) || (cs.bout && !cs.bout.done))) return false;
    if (S.activities && S.activities.running) return false;
    return !!guard('save on leave', () => S.save('auto', null));
  };

  M.toTitle = function (opts) {
    opts = opts || {};
    if (opts.save !== false) M.saveOnLeave();
    stopGameplay();
    closeUiWindows();
    hideError();
    M.setMode('title');
    showTitle();
    S.events.emit('title', {});
  };
  function showTitle() {
    if (S.headless) return;
    if (S.ui && has(S.ui, 'title')) {
      try { S.ui.title(); fbHideTitle(); return; } catch (err) { S.fail(err, { source: 'ui.title' }); }
    }
    fbShowTitle();
  }

  /* S.load() from anywhere (the UI's Load window, tests) resumes the save on the next step unless
     the caller already started or resumed a chapter itself (story.startSeq moved). */
  S.events.on('loaded', () => { M.pendingLoad = { seq: story.startSeq | 0 }; });
  function resumeAfterLoad() {
    const p = M.pendingLoad;
    M.pendingLoad = null;
    if (!S.isOpen || (story.startSeq | 0) !== p.seq || !has(story, 'resume')) return;
    closeUiWindows();
    hideError();
    guard('resume', () => story.resume());
  }

  /* ── 7. Fallback UI (only when ui.js is missing): title menu, dialogue text, screens ── */
  const FB = { el: null, title: null, items: [], sel: 0, view: 'main', why: '', playEl: null, lastKey: '' };
  function fbRoot() {
    if (!M.root) return null;
    if (!FB.el) { FB.el = document.createElement('div'); FB.el.className = 'sm-fb'; }
    if (!FB.el.parentNode) M.root.appendChild(FB.el);
    return FB.el;
  }
  function titleItems() {
    const list = has(story, 'chapterList') ? guard('chapterList', () => story.chapterList()) || [] : [];
    const playable = list.filter((c) => !c.sandbox);
    if (FB.view === 'chapters') {
      const items = playable.map((c) => ({ text: 'Chapter ' + c.n + ' — ' + c.title, enabled: c.available, why: c.reason, act: () => story.chapterSelect(c.n) }));
      if (!items.length) items.push({ text: 'No chapters yet', enabled: false, why: 'No chapters are available in this build.' });
      items.push({ text: 'Back', enabled: true, act: () => { FB.view = 'main'; FB.sel = 0; fbShowTitle(); } });
      return items;
    }
    const hasAuto = S.hasSave && S.hasSave('auto');
    const first = has(story, 'firstChapter') ? story.firstChapter() : null;
    return [
      { text: 'Continue', enabled: !!hasAuto, why: hasAuto ? '' : 'No saved game yet.', act: () => story.continueGame() },
      { text: 'New Game', enabled: first !== null, why: first !== null ? '' : 'No chapters are available in this build.', act: () => story.newGame() },
      { text: 'Chapters', enabled: true, act: () => { FB.view = 'chapters'; FB.sel = 0; fbShowTitle(); } },
      { text: 'Back to the lobby', enabled: true, act: () => S.close() },
    ];
  }
  function fbShowTitle() {
    if (S.headless || !fbRoot()) return;
    if (!FB.title) {
      FB.title = document.createElement('div');
      FB.title.className = 'sm-fb-title';
      FB.title.addEventListener('click', (ev) => {
        const b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
        if (!b || b.disabled) return;
        fbActivate(+b.getAttribute('data-i'));
      });
      FB.title.addEventListener('mouseover', (ev) => {
        const b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
        if (b) { FB.sel = +b.getAttribute('data-i'); fbMark(); }
      });
    }
    FB.items = titleItems();
    FB.sel = U.clamp(FB.sel, 0, FB.items.length - 1);
    if (!FB.items[FB.sel].enabled) { const i = FB.items.findIndex((x) => x.enabled); FB.sel = i < 0 ? 0 : i; }
    FB.title.innerHTML = '<div class="sm-kicker">Inside the Impact</div><h1>' + (FB.view === 'chapters' ? 'Chapters' : 'Story Mode') + '</h1><div class="sm-fb-btns"></div><p class="sm-why"></p>';
    const box = FB.title.querySelector('.sm-fb-btns');
    FB.items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = it.text; b.setAttribute('data-i', String(i));
      if (!it.enabled) { b.disabled = true; b.title = it.why || ''; }
      box.appendChild(b);
    });
    if (!FB.title.parentNode) FB.el.appendChild(FB.title);
    fbMark();
  }
  function fbMark() {
    if (!FB.title) return;
    const bs = FB.title.querySelectorAll('button');
    bs.forEach((b, i) => b.classList.toggle('sel', i === FB.sel));
    const it = FB.items[FB.sel], why = FB.title.querySelector('.sm-why');
    if (why) why.textContent = it && !it.enabled ? it.why || '' : '';
  }
  function fbActivate(i) {
    const it = FB.items[i];
    if (!it || !it.enabled || !it.act) return;
    if (S.audio) S.audio.play('ui');
    guard('title action', it.act);
  }
  function fbHideTitle() { if (FB.title && FB.title.parentNode) FB.title.parentNode.removeChild(FB.title); FB.view = 'main'; }
  const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function fbUpdate(full) {
    if (S.headless || !M.root) return;
    const I = S.input;
    if (M.mode === 'title' && FB.title && FB.title.parentNode && I) {
      const n = FB.items.length;
      const move = (d) => { for (let k = 1; k <= n; k++) { const j = ((FB.sel + d * k) % n + n) % n; if (FB.items[j].enabled || FB.view === 'chapters') { FB.sel = j; break; } } fbMark(); if (S.audio) S.audio.play('uiMove'); };
      if (I.framePressed('up')) move(-1);
      if (I.framePressed('down')) move(1);
      if (I.framePressed('interact')) fbActivate(FB.sel);
      if (I.framePressed('pause') && FB.view === 'chapters') { FB.view = 'main'; FB.sel = 0; fbShowTitle(); M.escPending = false; }
    }
    if (!full) return;
    // Without ui.js there is no pause menu: Esc in play goes back to the title (autosaving when it can).
    if (M.mode === 'play' && I && I.framePressed('pause') && !M.errorShown) { M.toTitle(); return; }
    // Play: plain renderings of the director's dialogue, screens and title cards.
    const Dr = S.director;
    let html = '', key = '';
    if (M.mode === 'play' && Dr) {
      const l = Dr.dialog, sc = Dr.screen, cd = Dr.card, dc = Dr.doc;
      if (sc) {
        key = 'S' + sc.kind + (sc.n === undefined ? '' : sc.n);
        const lines = sc.kind === 'completion' && sc.data
          ? ['Evidence found: ' + sc.data.evidence.found + ' / ' + sc.data.evidence.total, 'Optional quests: ' + sc.data.sides.done + ' / ' + sc.data.sides.total, 'Time: ' + sc.data.timeText].concat(sc.data.choices || [], sc.data.summary || [])
          : [].concat(sc.date ? [sc.date + (sc.place ? ' — ' + sc.place : '')] : [], sc.lines || sc.cards || []);
        const kick = sc.kind === 'chapter' ? 'Chapter ' + sc.n : sc.kind === 'completion' ? 'Chapter ' + sc.n + ' complete' : sc.kind === 'credits' ? 'Credits' : '';
        html = '<div class="sm-fb-screen" data-a="dismiss"><div class="sm-kicker">' + esc(kick) + '</div><h2>' + esc(sc.title) + '</h2>' +
          lines.map((x) => '<p>' + esc(typeof x === 'string' ? x : (x && (x.text || x.title)) || '') + '</p>').join('') + '</div>';
      } else if (cd) {
        key = 'C' + cd.title + cd.sub;
        html = '<div class="sm-fb-screen" data-a="dismiss" style="background:transparent"><h2>' + esc(cd.title) + '</h2><p>' + esc(cd.sub) + '</p></div>';
      } else if (dc) {
        const pg = dc.doc.pages[U.clamp(dc.page | 0, 0, dc.doc.pages.length - 1)];
        key = 'D' + (dc.id || dc.doc.title) + dc.page;
        html = '<div class="sm-fb-screen" data-a="doc"><div class="sm-kicker">Document</div><h2>' + esc(dc.doc.title) + '</h2><p style="white-space:pre-wrap;text-align:left;max-width:640px">' + esc(pg) + '</p></div>';
      } else if (l) {
        const shown = l.text.slice(0, l.shown);
        key = 'L' + l.id + ':' + l.shown + ':' + (l.choices ? l.sel : '');
        html = '<div class="sm-fb-line" data-a="advance">' + (l.name && !l.thought ? '<div class="sm-name">' + esc(l.name) + '</div>' : '') +
          '<div class="sm-text' + (l.thought ? ' th' : '') + '">' + esc(shown) + '</div>' +
          (l.choices && l.shown >= l.text.length ? l.choices.map((c, i) => '<button type="button" class="sm-ch' + (i === l.sel ? ' sel' : '') + '" data-c="' + i + '"' + (c.enabled ? '' : ' disabled title="' + esc(c.hint || '') + '"') + '>' + esc(c.text) + '</button>').join('') : '') + '</div>';
      } else {
        const o = has(Dr, 'objective') ? guard('objective', () => Dr.objective()) : null;
        if (o && o.text) { key = 'O' + o.text; html = '<div class="sm-fb-obj">◆ ' + esc(o.text) + '</div>'; }
      }
    }
    if (key === FB.lastKey) return;
    FB.lastKey = key;
    if (!FB.playEl) {
      FB.playEl = document.createElement('div');
      FB.playEl.addEventListener('click', (ev) => {
        const t = ev.target, Dd = S.director;
        if (!Dd || !t || !t.closest) return;
        const c = t.closest('[data-c]');
        if (c) { Dd.choose(+c.getAttribute('data-c')); return; }
        const a = t.closest('[data-a]');
        if (!a) return;
        const act = a.getAttribute('data-a');
        if (act === 'advance') Dd.advance();
        else if (act === 'dismiss') Dd.dismiss();
        else if (act === 'doc') Dd.closeDoc();
      });
    }
    if (fbRoot() && !FB.playEl.parentNode) FB.el.appendChild(FB.playEl);
    FB.playEl.innerHTML = html;
  }

  /* ── 8. STORY.open / STORY.close ──────────────────────────────────── */
  function onResize() { layout(); }
  function onVisibility() { M.lastTs = null; }
  function onKeyCapture(e) {
    // Esc on the title screen goes back to the lobby (decided after the UI had its turn this frame).
    if (e.code === 'Escape' && !e.repeat && M.mode === 'title' && !uiWindowOpen()) M.escPending = true;
  }
  function onWinError(ev) {
    if (!S.isOpen || !ev) return;
    const f = String(ev.filename || '');
    if (f && !/story\//.test(f)) return;
    S.fail(ev.error || new Error(String(ev.message || 'Script error')), { source: 'window' });
  }

  /* open(opts): { onExit, chapter (start that chapter directly, seeded with earlier canon), headless, dev, policy } */
  S.open = function (opts) {
    opts = opts || {};
    if (typeof opts.onExit === 'function') M.onExit = opts.onExit;
    if (opts.dev) S.dev = true;
    if (S.isOpen) return S;
    if (opts.headless) S.headless = true;
    S.isOpen = true;
    S.paused = false;
    M.acc = 0; M.lastTs = null; M.escPending = false;
    if (S.input && has(S.input, 'reset')) S.input.reset();
    if (!S.headless) {
      try { buildDom(); } catch (err) { S.isOpen = false; S.fail(err, { source: 'open' }); throw err; }
      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', onKeyCapture, true);
      window.addEventListener('error', onWinError);
      document.addEventListener('visibilitychange', onVisibility);
      if (S.audio && has(S.audio, 'init')) guard('audio.init', () => { S.audio.init(); S.audio.resume(); });
      if (S.ui) for (const fn of ['init', 'mount']) if (has(S.ui, fn)) { guard('ui.' + fn, () => S.ui[fn](M.root)); break; }
    }
    if (opts.policy && S.director && has(S.director, 'setPolicy')) S.director.setPolicy(opts.policy);
    S.events.emit('open', {});
    M.mode = 'closed';
    if (opts.chapter !== undefined && opts.chapter !== null && story.has && story.has(+opts.chapter)) T.startChapter(+opts.chapter, opts.flags);
    else M.toTitle({ save: false });
    if (!S.headless) {
      M.running = true;
      M.raf = window.requestAnimationFrame(frame);
    }
    return S;
  };

  S.close = function () {
    if (!S.isOpen) return;
    guard('save on close', () => M.saveOnLeave());
    stopGameplay();
    M.running = false;
    if (!S.headless) {
      try { window.cancelAnimationFrame(M.raf); } catch (_) { /* ignore */ }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyCapture, true);
      window.removeEventListener('error', onWinError);
      document.removeEventListener('visibilitychange', onVisibility);
      if (S.ui) for (const fn of ['destroy', 'unmount']) if (has(S.ui, fn)) { guard('ui.' + fn, () => S.ui[fn]()); break; }
      hideError();
      fbHideTitle();
      if (FB.playEl) FB.playEl.innerHTML = '';
      FB.lastKey = '';
      // Detach (hotkeysBlocked() in game.js looks for #story-root); the element is reused on the next open.
      if (M.root && M.root.parentNode) M.root.parentNode.removeChild(M.root);
      if (bodyOverflow !== null) { document.body.style.overflow = bodyOverflow; bodyOverflow = null; }
    }
    M.mode = 'closed';
    S.isOpen = false;
    S.paused = false;
    S.events.emit('close', {});
    const cb = M.onExit;
    M.onExit = null;
    if (cb) { try { cb(); } catch (err) { try { console.error('[story] onExit', err); } catch (_) { /* ignore */ } } }
  };
  S.toTitle = (o) => M.toTitle(o);

  /* ── 9. S.test: harness API for headless runs and browser tests (§11) ── */
  const T = S.test = {
    log: [],        // every event: { t, e, d } (d = a small JSON-safe summary)
    errors: errs,   // the same array as S.errors
  };
  const LOG_MAX = 6000;
  const LOG_KEYS = ['id', 'n', 'name', 'label', 'kind', 'state', 'step', 'text', 'title', 'value', 'won', 'loc', 'from', 'slot', 'who',
    'delta', 'total', 'dmg', 'ok', 'phase', 'error', 'tries', 'player', 'mode', 'first', 'source'];
  function summarize(d) {
    if (d === null || d === undefined) return null;
    if (typeof d !== 'object') return d;
    const out = {};
    for (const k of LOG_KEYS) {
      const v = d[k];
      if (v === undefined) continue;
      if (v === null || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
      else if (typeof v === 'string') out[k] = v.length > 160 ? v.slice(0, 160) + '…' : v;
    }
    for (const k of ['enemy', 'target', 'attacker', 'actor']) if (d[k] && typeof d[k] === 'object' && d[k].id !== undefined) out[k] = d[k].id;
    return out;
  }
  S.events.on('*', (name, data) => {
    if (name === 'resize') return;
    T.log.push({ t: Math.round(S.time * 1000) / 1000, e: name, d: summarize(data) });
    if (T.log.length > LOG_MAX) T.log.splice(0, T.log.length - LOG_MAX);
  });

  function stepN(n) { for (let i = 0; i < n && S.isOpen; i++) { S.realTime += DT; stepSim(); } }

  // boot({ headless, policy, seed, autoAdvance, dev }) — open Story Mode for a test run.
  T.boot = function (opts) {
    opts = opts || {};
    if (opts.headless) S.headless = true;
    if (opts.seed !== undefined) S.seed(opts.seed);
    if (S.director) {
      if (opts.policy !== undefined && has(S.director, 'setPolicy')) S.director.setPolicy(opts.policy);
      // Headless without a policy: plain lines and screens close by themselves so nothing waits for a key.
      S.director.autoHeadless = S.headless && opts.autoAdvance !== false;
    }
    if (!S.isOpen) S.open({ headless: S.headless, dev: opts.dev, onExit: opts.onExit });
    return T;
  };
  T.step = function (seconds) {
    const n = seconds === undefined ? 1 : Math.max(1, Math.round(+seconds / DT));
    stepN(n);
    return T.state();
  };
  // frames(seconds, fps = 60): run whole frames (sim steps + render + ui.update + clearFrame) without
  // requestAnimationFrame. For browser checks in a hidden/background tab, where rAF is throttled to ~1 Hz;
  // headless it is the same as step() (render and ui are no-ops there).
  T.frames = function (seconds, fps) {
    const dt = 1 / (+fps || 60);
    const n = Math.max(1, Math.round((seconds === undefined ? dt : +seconds) / dt));
    for (let i = 0; i < n && S.isOpen; i++) tick(dt);
    return T.state();
  };
  T.press = function (a) { if (S.input) S.input.virtualDown(a, true); return T; };
  T.release = function (a) { if (S.input) S.input.virtualDown(a, false); return T; };
  // tap(action, seconds = one step): press, step, release, step.
  T.tap = function (a, seconds) {
    T.press(a);
    stepN(Math.max(1, Math.round((+seconds || DT) / DT)));
    T.release(a);
    stepN(1);
    return T.state();
  };
  T.advance = () => !!(S.director && S.director.advance());
  T.choose = (i) => !!(S.director && S.director.choose(i));
  T.setPolicy = (p, extra) => (S.director ? S.director.setPolicy(p, extra) : null);

  // A JSON copy of everything that defines the game right now; restore() puts it back.
  T.snapshot = function () {
    const W = S.world, j = W && W.jin;
    return {
      time: S.time, mode: M.mode, rng: has(S, 'rngState') ? S.rngState() : null,
      G: S.G ? U.clone(S.G) : null,
      loc: (W && W.locId) || null, jin: j ? { x: j.x, y: j.y, face: j.face } : null,
      scene: S.director && has(S.director, 'label') ? S.director.label() : null,
    };
  };
  T.restore = function (snap) {
    if (!snap || !snap.G) return false;
    stopGameplay();
    S.G = S.migrateState(U.clone(snap.G));
    if (snap.rng !== null && snap.rng !== undefined && has(S, 'rngState')) S.rngState(snap.rng);
    M.setMode('play');
    if (S.director && has(S.director, 'applyBody')) guard('applyBody', () => S.director.applyBody());
    if (snap.loc) return T.goto(snap.loc, snap.jin ? snap.jin.x : undefined, snap.jin ? { face: snap.jin.face, y: snap.jin.y } : null);
    return true;
  };

  // goto(locId, x): enter a location directly (no fade, its scenes still run).
  T.goto = function (locId, x, o) {
    o = o || {};
    if (!S.isOpen) T.boot({ headless: S.headless });
    if (M.mode !== 'play') M.setMode('play');
    const Dr = S.director;
    let ok = false;
    if (Dr && has(Dr, 'enterWorld')) ok = !!Dr.enterWorld(locId, x === undefined ? null : x, { face: o.face, y: o.y, silent: !!o.silent });
    else if (S.world && has(S.world, 'enter')) ok = !!guard('world.enter', () => { S.world.enter(locId, x, { fade: false, face: o.face, y: o.y }); return true; });
    stepN(1);
    return ok && !!S.world && S.world.locId === locId;
  };

  // startChapter(n, flags): fresh state seeded with the canonical outcome of earlier chapters, then start.
  T.startChapter = function (n, flags) {
    n = +n;
    if (!S.isOpen) T.boot({ headless: S.headless });
    if (!story.has || !story.has(n)) { S.fail(new Error('Chapter ' + n + ' is not registered'), { source: 'test.startChapter' }); return false; }
    stopGameplay();
    S.G = has(story, 'seedState') ? story.seedState(n, flags || null) : S.newState();
    if (flags && !has(story, 'seedState')) Object.assign(S.G.flags, flags);
    return !!guard('story.start', () => story.start(n));
  };

  /* ── 9a. Driver: holds virtual keys for Jin, one goal at a time (pre-step hook) ── */
  const drive = {
    goal: null,
    keys: new Set(),
    taps: [],
    hold(a, on) {
      if (!S.input) return;
      S.input.virtualDown(a, !!on);
      if (on) this.keys.add(a); else this.keys.delete(a);
    },
    releaseAll() { for (const a of Array.from(this.keys)) this.hold(a, false); this.taps.length = 0; },
    tap(a, dur) { this.hold(a, true); this.taps.push({ a, until: S.time + Math.max(DT * 0.5, +dur || DT * 0.5) }); },
    // walk(x, { tol, run, through (keep going while a scene holds control), timeout, jump: false })
    walk(x, o) {
      o = o || {};
      const W = S.world, j = W && W.jin;
      this.goal = { x: +x, tol: o.tol || 6, run: !!o.run, through: !!o.through, jump: o.jump !== false,
        t: 0, still: 0, lastX: null, jumps: 0, jumpUntil: -1, dir0: j ? U.sign(+x - j.x) : 0,
        timeout: o.timeout || (j ? Math.abs(+x - j.x) / 30 + 4 : 4), status: 'running', loc0: W ? W.locId : null };
      return this.goal;
    },
    stop(status) {
      const g = this.goal;
      if (g && g.status === 'running') g.status = status || 'stopped';
      for (const a of ['left', 'right', 'run', 'jump']) if (this.keys.has(a)) this.hold(a, false);
    },
    update(dt) {
      for (let i = this.taps.length - 1; i >= 0; i--) if (S.time >= this.taps[i].until) { this.hold(this.taps[i].a, false); this.taps.splice(i, 1); }
      const g = this.goal;
      if (!g || g.status !== 'running') return;
      const W = S.world, j = W && W.jin;
      if (!j) { this.stop('failed'); return; }
      if (W.locId !== g.loc0) { this.stop('left'); return; }
      if (!g.through && S.director && S.director.busy) { this.stop('interrupted'); return; }
      const d = g.x - j.x;
      if (Math.abs(d) <= g.tol || (g.dir0 && U.sign(d) !== g.dir0)) { this.stop('reached'); return; }
      g.t += dt;
      if (g.t > g.timeout) { this.stop('timeout'); return; }
      const want = d > 0 ? 'right' : 'left', other = d > 0 ? 'left' : 'right';
      if (this.keys.has(other)) this.hold(other, false);
      if (!this.keys.has(want)) this.hold(want, true);
      if (g.run && !this.keys.has('run')) this.hold('run', true);
      if (g.jumpUntil >= 0 && g.t >= g.jumpUntil) { this.hold('jump', false); g.jumpUntil = -1; }
      if (g.lastX !== null && Math.abs(j.x - g.lastX) < 0.01) g.still += dt; else g.still = 0;
      g.lastX = j.x;
      if (g.still > 0.35) {
        // Blocked: hop once or twice (crates, steps), then give up.
        if (g.jump && g.jumps < 2) { g.jumps++; g.still = 0; this.hold('jump', true); g.jumpUntil = g.t + 0.28; }
        else this.stop('blocked');
      }
    },
  };
  M.onStep((dt) => drive.update(dt));
  T.drive = drive;

  function runUntil(pred, maxSeconds) {
    const n = Math.max(1, Math.round(maxSeconds / DT));
    for (let i = 0; i < n && S.isOpen; i++) { if (pred()) return true; stepN(1); }
    return !!pred();
  }

  // walkJinTo(x, opts) — drives input until Jin reaches x or is blocked. -> { reached, result, x, loc }
  T.walkJinTo = function (x, opts) {
    const W = S.world;
    if (!W || !W.jin) return { reached: false, result: 'no jin', x: null, loc: W ? W.locId : null };
    const g = drive.walk(x, opts);
    runUntil(() => g.status !== 'running', g.timeout + 1);
    if (g.status === 'running') drive.stop('timeout');
    stepN(1);
    const j = W.jin;
    return { reached: g.status === 'reached', result: g.status, x: j ? Math.round(j.x * 10) / 10 : null, loc: W.locId };
  };

  /* Interactables in the current location: { kind: 'npc'|'object'|'door', id, x, ref, label, marker?, to?, auto?, locked? }.
     world.js may provide S.world.interactables(); otherwise they are read from the actors and the LocationDef. */
  function whenOk(o) {
    if (!o || typeof o.when !== 'function') return true;
    try { return !!o.when(S.G, S); } catch (_) { return false; }
  }
  function lockedWhy(d) {
    if (!d || d.locked === undefined || d.locked === null || d.locked === false) return null;
    if (typeof d.locked === 'function') { try { const v = d.locked(S.G, S); return v ? (typeof v === 'string' ? v : 'locked') : null; } catch (_) { return 'locked'; } }
    return d.locked ? (typeof d.locked === 'string' ? d.locked : 'locked') : null;
  }
  const shown = (a) => !!a && a.present !== false && !a.hidden && a.visible !== false && !a.removed;
  function interactables() {
    const W = S.world, L = W && W.loc;
    if (!L) return [];
    if (has(W, 'interactables')) { const v = guard('world.interactables', () => W.interactables()); if (Array.isArray(v)) return v; }
    const out = [];
    for (const a of W.actors || []) {
      if (a === W.jin || !shown(a) || a.kind === 'enemy' || a.enemy || a.down) continue;
      const p = a.placement || {};
      if (!p.talk && !a.talk) continue;
      out.push({ kind: 'npc', id: a.id, x: a.x, ref: a, label: a.name || p.name || a.id, marker: a.marker || null });
    }
    for (const o of L.objects || []) {
      if (!o || !whenOk(o) || o._gone || o.gone || o.taken || o.used) continue;
      out.push({ kind: 'object', id: o.id, x: +o.x || 0, ref: o, label: o.label || o.id, evidence: o.evidence || null, memory: o.memory || null, hidden: !!o.hidden });
    }
    for (const d of L.doors || []) {
      if (!d || !whenOk(d)) continue;
      out.push({ kind: 'door', id: d.id || ('door:' + d.to), x: +d.x || 0, ref: d, label: d.label || d.to, to: d.to,
        auto: !!d.auto || d.kind === 'edge', locked: lockedWhy(d), doorKind: d.kind || 'door' });
    }
    return out;
  }
  T.interactables = interactables;
  function focusIs(c) {
    const f = S.world && S.world.focus;
    if (!f || !c) return false;
    const r = f.ref;
    return r === c.ref || (r && c.id !== undefined && r.id === c.id) || (f.id !== undefined && f.id === c.id);
  }
  function findCand(spec, list) {
    list = list || interactables();
    if (spec === undefined || spec === null || spec === '') return null;
    if (typeof spec === 'object') return list.find((c) => c.ref === spec || c.id === spec.id) || null;
    const byId = list.filter((c) => c.id === spec || c.to === spec);
    const pool = byId.length ? byId : list.filter((c) => c.kind === spec);
    if (!pool.length) return null;
    const j = S.world.jin, jx = j ? j.x : 0;
    pool.sort((a, b) => Math.abs(a.x - jx) - Math.abs(b.x - jx));
    return pool[0];
  }

  // interactNearest(kindOrId) — walk to the nearest matching interactable and press interact. -> { ok, id, kind, label }
  T.interactNearest = function (kindOrId, opts) {
    opts = opts || {};
    const W = S.world, j = W && W.jin;
    if (!j || !W.loc) return { ok: false, reason: 'no location' };
    const list = interactables();
    let c = kindOrId === undefined || kindOrId === null ? null : findCand(kindOrId, list);
    if (!c && (kindOrId === undefined || kindOrId === null)) {
      if (W.focus) c = { kind: W.focus.kind, id: W.focus.ref && W.focus.ref.id, ref: W.focus.ref, x: j.x, label: W.focus.label };
      else { list.sort((a, b) => Math.abs(a.x - j.x) - Math.abs(b.x - j.x)); c = list.find((x) => !x.locked) || null; }
    }
    if (!c) return { ok: false, reason: 'nothing matches ' + kindOrId };
    if (!focusIs(c)) {
      const side = U.sign(c.x - j.x) || j.face || 1;
      if (Math.abs(c.x - j.x) > 14) T.walkJinTo(c.x - side * 12, { tol: 4 });
      if (!focusIs(c) && W.jin && U.sign(c.x - W.jin.x) && U.sign(c.x - W.jin.x) !== W.jin.face) T.tap(U.sign(c.x - W.jin.x) > 0 ? 'right' : 'left');
      runUntil(() => focusIs(c), opts.focusWait || 0.6);
    }
    const focused = focusIs(c);
    if (!focused && !opts.force) return { ok: false, reason: 'no focus', id: c.id, kind: c.kind, focus: W.focus ? W.focus.label : null };
    T.tap('interact');
    return { ok: true, id: c.id, kind: c.kind, label: c.label, focused };
  };

  T.state = function () {
    const Dr = S.director || {}, W = S.world || {}, j = W.jin, G = S.G || {};
    const l = Dr.dialog, cs = S.combat && S.combat.state, cj = S.combat && S.combat.jin;
    const obj = has(Dr, 'objective') ? guard('objective', () => Dr.objective()) : null;
    const act = S.activities && S.activities.current;
    const r1 = (v) => (typeof v === 'number' ? Math.round(v * 10) / 10 : v);
    return {
      mode: M.mode, open: !!S.isOpen, time: Math.round(S.time * 1000) / 1000, paused: !!S.paused,
      chapter: G.chapter, loc: W.locId || null,
      jin: j ? { x: r1(j.x), y: r1(j.y), face: j.face, pose: j.pose || null, hp: cj ? r1(cj.hp) : null, state: cj ? cj.state || null : null } : null,
      busy: !!Dr.busy, running: !!Dr.running, scene: has(Dr, 'label') ? Dr.label() : null,
      dialog: l ? { name: l.name, text: l.text, thought: !!l.thought, choices: l.choices ? l.choices.map((c) => c.text) : null } : null,
      screen: Dr.screen ? Dr.screen.kind : null, card: Dr.card ? Dr.card.title : null,
      doc: Dr.doc ? (Dr.doc.id || (Dr.doc.doc && Dr.doc.doc.title) || 'doc') : null,
      objective: obj ? obj.text : null,
      focus: W.focus ? { kind: W.focus.kind, id: W.focus.ref && W.focus.ref.id !== undefined ? W.focus.ref.id : null, label: W.focus.label || null } : null,
      fight: cs && cs.fight && !cs.fight.done ? (cs.fight.id || (cs.fight.def && cs.fight.def.id) || 'fight') : null,
      bout: cs && cs.bout && !cs.bout.done ? (cs.bout.id || (cs.bout.def && cs.bout.def.id) || 'bout') : null,
      activity: act && !act.done ? act.name || 'activity' : null,
      progress: Dr.progress | 0, money: G.money | 0, ending: G.ending || null,
      errors: errs.length, autopilot: AP.on,
    };
  };

  /* ── 9b. Autopilot: plays a chapter with nothing but walking and pressing interact ──
     Follows, in order: the waiting scene's autoplay hint ({ walkTo, interact, loc }), the current quest
     step's autoplay hint, the quest step's target { loc, x }; with nothing to follow it explores
     (NPCs with markers, evidence objects, unvisited doors, the map edges). Dialogue, screens, fights
     ('auto') and activities are finished by the director policy, which must be set. */
  const AP = { on: false, plan: null, tries: Object.create(null), key: '', idleT: 0, fightT: 0, log: [] };
  T.autopilot = AP;
  function storyKey() {
    const G = S.G;
    if (!G) return '';
    let k = G.chapter + '|' + Object.keys(G.evidence).length + '|' + Object.keys(G.memories).length + '|' + Object.keys(G.people).length +
      '|' + Object.keys(G.flags).length + '|' + Object.keys(G.visited).length + '|' + (G.completed ? Object.keys(G.completed).length : 0);
    for (const id in G.quests) { const q = G.quests[id]; k += '|' + id + ':' + q.state + ':' + q.step; }
    return k;
  }
  T.storyKey = storyKey;
  const tries = (k) => AP.tries[k] | 0;
  const bump = (k) => { AP.tries[k] = (AP.tries[k] | 0) + 1; };
  AP.start = function () { AP.on = true; AP.plan = null; AP.tries = Object.create(null); AP.key = storyKey(); AP.idleT = 0; };
  AP.stop = function () { if (!AP.on && !AP.plan) return; AP.on = false; AP.plan = null; drive.goal = null; drive.releaseAll(); };
  T.autoplay = function (on, policy) {
    if (on === false) { AP.stop(); return false; }
    if (policy && S.director) S.director.setPolicy(policy);
    AP.start();
    return true;
  };

  // Location graph for routing: the first door (in the current location) on the shortest path to `to`.
  function doorsOf(id) {
    if (S.world && id === S.world.locId && S.world.loc) return S.world.loc.doors || [];
    const L = has(story, 'location') ? guard('route location', () => story.location(id)) : null;
    return (L && L.doors) || [];
  }
  function route(from, to) {
    if (!from || !to || from === to) return null;
    const prev = Object.create(null);
    prev[from] = { door: null, via: null };
    const q = [from];
    for (let qi = 0; qi < q.length && qi < 200; qi++) {
      const id = q[qi];
      for (const d of doorsOf(id)) {
        if (!d || !d.to || prev[d.to] || !whenOk(d) || lockedWhy(d)) continue;
        prev[d.to] = { door: d, via: id };
        if (d.to === to) {
          let cur = to;
          while (prev[cur].via !== from) cur = prev[cur].via;
          return prev[cur].door;
        }
        q.push(d.to);
      }
    }
    return null;
  }
  T.route = route;
  function doorCand(d) {
    return { kind: 'door', id: d.id || ('door:' + d.to), x: +d.x || 0, ref: d, label: d.label || d.to, to: d.to, auto: !!d.auto || d.kind === 'edge', locked: null, doorKind: d.kind || 'door' };
  }

  function apPlan() {
    const Dr = S.director, W = S.world, j = W.jin, here = W.locId, G = S.G;
    const list = interactables();
    const targets = [];
    const hint = has(Dr, 'waitHint') ? guard('waitHint', () => Dr.waitHint()) : null;
    if (hint) targets.push(Object.assign({ src: 'hint' }, hint));
    const obj = has(Dr, 'objective') ? guard('objective', () => Dr.objective()) : null;
    if (obj && obj.autoplay) targets.push(Object.assign({ src: 'step' }, obj.autoplay));
    if (obj && obj.target) targets.push({ src: 'target', loc: obj.target.loc, walkTo: obj.target.x, near: true });
    for (const tg of targets) {
      const key = tg.src + ':' + (tg.loc || here) + ':' + (tg.interact || '') + ':' + (tg.walkTo === undefined ? '' : tg.walkTo);
      if (tries(key) >= 3) continue;
      if (tg.loc && tg.loc !== here) {
        const d = route(here, tg.loc);
        bump(key);
        if (d) return { kind: 'door', cand: doorCand(d), key };
        continue;
      }
      if (tg.interact) {
        const c = findCand(tg.interact, list);
        bump(key);
        if (c) return { kind: 'interact', cand: c, key };
      }
      if (tg.walkTo !== undefined && tg.walkTo !== null && isFinite(+tg.walkTo)) {
        if (Math.abs(j.x - tg.walkTo) > 10) { bump(key); return { kind: 'walk', x: +tg.walkTo, key }; }
        if (tg.near) {
          const near = list.filter((c) => Math.abs(c.x - tg.walkTo) <= 90 && !c.locked && tries('i:' + here + ':' + c.id) < 2 && !(c.kind === 'door' && c.to && G.visited[c.to] && !c.auto));
          near.sort((a, b) => Math.abs(a.x - tg.walkTo) - Math.abs(b.x - tg.walkTo));
          if (near.length) return { kind: near[0].kind === 'door' ? 'door' : 'interact', cand: near[0], key: 'i:' + here + ':' + near[0].id };
        }
        bump(key);
      }
    }
    return apExplore(list, here, j, G);
  }
  function apExplore(list, here, j, G) {
    let best = null, bestS = -1e9;
    for (const c of list) {
      if (c.locked) continue;
      const key = 'i:' + here + ':' + c.id;
      const n = tries(key);
      let s;
      if (c.kind === 'npc') { if (n >= 2) continue; s = c.marker === '!' ? 100 : c.marker === '?' ? 95 : c.marker ? 70 : 30; }
      else if (c.kind === 'object') {
        if (n >= 1) continue;
        s = (c.evidence && !G.evidence[c.evidence]) || (c.memory && !G.memories[c.memory]) ? 80 : 40;
      } else {
        if (n >= 1 || !c.to) continue;
        s = G.visited[c.to] ? 12 : 55;
      }
      s -= Math.abs(c.x - j.x) / 60;
      if (s > bestS) { bestS = s; best = c; }
    }
    if (best) return { kind: best.kind === 'door' ? 'door' : 'interact', cand: best, key: 'i:' + here + ':' + best.id };
    // Walk the map's ends: triggers often sit along the way.
    const L = S.world.loc, ends = [24, (+L.w || LW) - 24].sort((a, b) => Math.abs(b - j.x) - Math.abs(a - j.x));
    for (const x of ends) { const key = 'edge:' + here + ':' + Math.round(x); if (tries(key) < 1) { bump(key); return { kind: 'walk', x, key }; } }
    return null;
  }

  function apExec(p, dt) {
    const W = S.world, j = W.jin;
    p.t = (p.t || 0) + dt;
    if (p.t > 25) { drive.stop('timeout'); return true; }
    if (p.kind === 'walk') {
      if (!p.goal) p.goal = drive.walk(p.x, { tol: 6 });
      return p.goal.status !== 'running';
    }
    const c = p.cand;
    if (!p.phase) {
      bump(p.key);
      p.loc0 = W.locId;
      const side = U.sign(c.x - j.x) || j.face || 1;
      // Edge doors fire when walked into: aim past them. Others: stand just before the point, facing it.
      const ax = p.kind === 'door' && c.auto ? (c.x < (+W.loc.w || LW) / 2 ? c.x - 40 : c.x + 40) : c.x - side * 12;
      p.goal = Math.abs(ax - j.x) > 5 ? drive.walk(ax, { tol: p.kind === 'door' && c.auto ? 2 : 4, timeout: Math.abs(ax - j.x) / 30 + 6 }) : null;
      p.phase = 'approach';
    }
    if (p.kind === 'door' && W.locId !== p.loc0) { drive.stop('left'); return true; }
    if (p.phase === 'approach') {
      if (p.goal && p.goal.status === 'running') return false;
      p.phase = 'focus'; p.ft = 0;
      if (U.sign(c.x - j.x) && U.sign(c.x - j.x) !== j.face && !(p.kind === 'door' && c.auto)) drive.tap(U.sign(c.x - j.x) > 0 ? 'right' : 'left', DT);
    }
    if (p.phase === 'focus') {
      p.ft += dt;
      if (focusIs(c)) { drive.tap('interact', DT); p.phase = 'after'; p.at = 0; return false; }
      if (p.kind === 'door' && (c.doorKind === 'ladder' || c.doorKind === 'stairs') && p.ft > 0.3 && p.ft < 0.9) drive.hold('up', true);
      if (p.ft > 1.0) { drive.hold('up', false); return true; }
      return false;
    }
    if (p.phase === 'after') {
      if (drive.keys.has('up')) drive.hold('up', false);
      p.at += dt;
      return p.at > 0.3;
    }
    return true;
  }

  // Real fights (policy.fights === 'real'): close in, jab-cross, back off when hurt.
  function apFight(dt) {
    const W = S.world, j = W.jin, C = S.combat;
    const en = has(C, 'enemies') ? (guard('combat.enemies', () => C.enemies()) || []) : [];
    if (!en.length) { drive.stop('idle'); return; }
    let e = en[0];
    for (const x of en) if (Math.abs(x.x - j.x) < Math.abs(e.x - j.x)) e = x;
    const d = e.x - j.x, cj = C.jin || {};
    AP.fightT += dt;
    if (cj.hp !== undefined && cj.hpMax && cj.hp < cj.hpMax * 0.25 && AP.fightT > 0.6) { AP.fightT = 0; drive.tap('dash', DT); drive.hold(d > 0 ? 'left' : 'right', true); return; }
    if (Math.abs(d) > 24) { drive.goal = null; drive.hold(d > 0 ? 'left' : 'right', false); drive.hold(d > 0 ? 'right' : 'left', true); return; }
    drive.hold('left', false); drive.hold('right', false);
    if (U.sign(d) !== j.face) { drive.tap(d > 0 ? 'right' : 'left', DT); return; }
    if (AP.fightT > 0.17) { AP.fightT = 0; drive.tap('punch', DT); }
  }

  M.onStep(function apUpdate(dt) {
    if (!AP.on || M.mode !== 'play') return;
    const Dr = S.director, W = S.world;
    if (!Dr || !W || !W.loc || !W.jin) return;
    const k = storyKey();
    if (k !== AP.key) { AP.key = k; AP.tries = Object.create(null); AP.idleT = 0; }
    const cs = S.combat && S.combat.state;
    const fighting = cs && ((cs.fight && !cs.fight.done) || (cs.bout && !cs.bout.done));
    if (fighting) {
      AP.plan = null;
      if (Dr.policy && Dr.policy.fights === 'real' && !Dr.dialog) apFight(dt); else drive.releaseAll();
      return;
    }
    // Scenes, dialogue, screens and activities belong to the director and its policy.
    if (Dr.busy || W.transitioning || (S.activities && S.activities.running)) {
      if (AP.plan || drive.keys.size) { AP.plan = null; drive.goal = null; drive.releaseAll(); }
      return;
    }
    if (!AP.plan) {
      AP.plan = apPlan();
      if (!AP.plan) {
        AP.idleT += dt;
        if (AP.idleT > 8) { AP.idleT = 0; AP.tries = Object.create(null); }   // try everything again
        return;
      }
      AP.log.push({ t: Math.round(S.time * 10) / 10, loc: W.locId, kind: AP.plan.kind, id: AP.plan.cand ? AP.plan.cand.id : AP.plan.x, key: AP.plan.key });
      if (AP.log.length > 400) AP.log.splice(0, AP.log.length - 400);
    }
    if (apExec(AP.plan, dt)) { AP.plan = null; drive.goal = null; drive.releaseAll(); }
  });

  /* runChapter(n, { policy, real, flags, limit, stuckAfter }) — headless chapter run (§11 `chapter N`).
     -> { chapter, reachedEnd, time, stuck, stuckAt, scenes, errors, visited, unvisited, choices, endState } */
  function chapterReport(n, ctx) {
    const G = S.G || {}, def = story.chapters ? story.chapters[n] : null;
    const enters = T.log.slice(ctx.log0).filter((x) => x.e === 'enterLoc' && x.d && x.d.id).map((x) => x.d.id);
    const visited = Array.from(new Set(enters));
    const own = def && def.locations ? Object.keys(def.locations) : [];
    const required = def && Array.isArray(def.required) ? def.required : own;
    return {
      chapter: n, title: def ? def.title : null, policy: ctx.policy, reachedEnd: ctx.ended, time: Math.round(ctx.t),
      stuck: ctx.stuck, stuckAt: ctx.stuck ? T.state() : null,
      scenes: T.log.slice(ctx.log0).filter((x) => x.e === 'sceneStart').map((x) => (x.d && (x.d.id || x.d.label)) || '?'),
      errors: errs.slice(ctx.err0).map((e) => (e.source ? e.source + ': ' : '') + e.message),
      visited, unvisited: required.filter((id) => visited.indexOf(id) < 0),
      choices: (G.choices || []).filter((c) => c.chapter === n).map((c) => c.text),
      quests: Object.keys(G.quests || {}).map((id) => id + ':' + G.quests[id].state),
      ending: G.ending || null,
      autopilot: AP.log.slice(-12),
    };
  }
  function runLoop(ctx, done) {
    const limit = ctx.limit, stuckAfter = ctx.stuckAfter;
    let key = storyKey(), keyAt = 0, check = 0;
    while (ctx.t < limit && S.isOpen && !done()) {
      S.realTime += DT; stepSim(); ctx.t += DT;
      check += DT;
      if (check >= 0.5) {
        check = 0;
        const k = storyKey() + '|' + (S.world ? S.world.locId : '');
        if (k !== key) { key = k; keyAt = ctx.t; }
        else if (ctx.t - keyAt > stuckAfter) { ctx.stuck = true; break; }
      }
    }
  }
  T.runChapter = function (n, opts) {
    opts = opts || {};
    n = +n;
    if (!S.isOpen) T.boot({ headless: S.headless });
    const policy = opts.policy || 'first';
    if (S.director) S.director.setPolicy(policy, { fights: opts.real ? 'real' : 'auto', activities: opts.realActivities ? 'real' : undefined });
    const ctx = { policy, t: 0, ended: false, stuck: false, log0: T.log.length, err0: errs.length, limit: opts.limit || 2400, stuckAfter: opts.stuckAfter || 120 };
    const off = S.events.on('chapterEnd', (d) => { if (d && +d.n === n) ctx.ended = true; });
    if (!T.startChapter(n, opts.flags)) { S.events.off('chapterEnd', off); return Object.assign(chapterReport(n, ctx), { error: 'chapter ' + n + ' is not registered' }); }
    AP.start();
    runLoop(ctx, () => ctx.ended);
    S.events.off('chapterEnd', off);
    const rep = chapterReport(n, ctx);
    AP.stop();
    return rep;
  };
  /* runCampaign(policy, { real, limit }) — New Game to the credits in one run (§11 `campaign`).
     -> { policy, finished, ending, chapters: [{ n, reachedEnd, time }], stuck, stuckAt, errors, choices } */
  T.runCampaign = function (policy, opts) {
    opts = opts || {};
    if (!S.isOpen) T.boot({ headless: S.headless });
    policy = policy || 'restraint';
    if (S.director) S.director.setPolicy(policy, { fights: opts.real ? 'real' : 'auto' });
    const ctx = { policy, t: 0, ended: false, stuck: false, log0: T.log.length, err0: errs.length, limit: opts.limit || 36000, stuckAfter: opts.stuckAfter || 120 };
    const chapters = [];
    let startAt = 0;
    const offS = S.events.on('chapterStart', (d) => { startAt = ctx.t; chapters.push({ n: d.n, reachedEnd: false, time: 0 }); });
    const offE = S.events.on('chapterEnd', (d) => { const c = chapters[chapters.length - 1]; if (c && c.n === d.n) { c.reachedEnd = true; c.time = Math.round(ctx.t - startAt); } });
    const offC = S.events.on('credits', () => { ctx.ended = true; });
    stopGameplay();
    if (!guard('newGame', () => story.newGame())) { S.events.off('chapterStart', offS); S.events.off('chapterEnd', offE); S.events.off('credits', offC); return { policy, finished: false, error: 'New Game failed' }; }
    AP.start();
    runLoop(ctx, () => ctx.ended);
    // Let the credits play out and return to the title (the policy confirms the screen).
    if (ctx.ended) runUntil(() => M.mode === 'title', 60);
    S.events.off('chapterStart', offS); S.events.off('chapterEnd', offE); S.events.off('credits', offC);
    const G = S.G || {};
    const rep = {
      policy, finished: ctx.ended, ending: G.ending || (has(story, 'endingId') ? story.endingId() : null), time: Math.round(ctx.t),
      chapters, stuck: ctx.stuck, stuckAt: ctx.stuck ? T.state() : null,
      errors: errs.slice(ctx.err0).map((e) => (e.source ? e.source + ': ' : '') + e.message),
      choices: (G.choices || []).filter((c) => !c.minor).map((c) => 'Ch' + c.chapter + ': ' + c.text),
      autopilot: ctx.stuck ? AP.log.slice(-12) : undefined,
    };
    AP.stop();
    return rep;
  };
})(window.STORY);
