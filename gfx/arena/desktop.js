/* What a fight needs on a computer and not on a phone: the cursor out of the way, a pause when the window loses focus, fullscreen, and the graphics and sound choices
   in the pause panel. index.js hands over its session. On a touch device every call here does nothing, so the touch game is what it was.

     const desk = wireDesktop(S, { pause });   S.hud must exist
     desk.startQuality()      the quality to open the engine with: the page's Low Detail setting comes before the player's choice
     desk.applyChoices()      once the engine and the sound exist: both choices take effect and the panel shows them
     desk.start()             the fight can start: the cursor's clock begins
     desk.sync()              a pause, a panel, a new match: the cursor follows
     desk.key(code, e)        true when it has taken the key
     desk.fullscreen(), desk.pickGraphics(choice), desk.toggleSound()
     desk.destroy()           leaves fullscreen, listeners off

   Both choices live in localStorage. A browser that blocks it still keeps them for this visit. */
const QUALITY_KEY = 'iti-arena-quality', SOUND_KEY = 'iti-arena-sound';
const CHOICES = ['auto', 'high', 'medium', 'low'];
const UP = '.ax-panel.is-on,.ax-x-menu.is-on,.ax-x-notes.is-on'; /* anything waiting on the player: the cursor stays and a lost focus changes nothing */
const CURSOR_MS = 1500;
const FS_SETTLE = 800;   // a fullscreen change can take the focus away for a moment, so a blur this soon after one is looked at again when it has settled
const ESC_GAP = 400;     // a browser may also send the Esc that took it out of fullscreen. That Esc must not close the pause panel that leaving has just opened
const CLICK_GAP = 400;   // the click that brings the window back is not a press on whatever panel button happens to be under it

const visit = {};
const readPref = (k) => { try { const v = localStorage.getItem(k); if (v != null) return v; } catch (e) { /* blocked */ } return visit[k] ?? null; };
const savePref = (k, v) => { visit[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* a private window: it lasts this visit */ } };
const graphicsChoice = () => { const v = readPref(QUALITY_KEY); return CHOICES.includes(v) ? v : 'auto'; };

const fsNow = () => document.fullscreenElement || document.webkitFullscreenElement || null;
const quiet = (p) => { if (p && p.catch) p.catch(() => {}); };

const NONE = { startQuality: () => 'auto', applyChoices() {}, start() {}, sync() {}, key: () => false, fullscreen() {}, pickGraphics() {}, toggleSound() {}, destroy() {} };

export function wireDesktop(S, { pause }) {
  if (S.hud.el.dataset.touch !== '0') return NONE;
  const root = S.root;
  const playing = () => S.ready && !S.closed && !S.paused && !root.querySelector(UP);

  /* ---------- cursor ---------- */
  let lastMove = 0, mx = null, my = null, cursorTimer = 0;
  function sync() {
    clearTimeout(cursorTimer);
    if (!playing() || S.lost) { root.classList.remove('ax-nocursor'); return; }
    const left = lastMove + CURSOR_MS - performance.now();
    if (left <= 0) root.classList.add('ax-nocursor');
    else { root.classList.remove('ax-nocursor'); cursorTimer = setTimeout(sync, left + 20); }
  }
  const onMouse = (e) => {
    if (e.type === 'mousemove' && e.screenX === mx && e.screenY === my) return; /* Chrome also sends this when the page changes under a still mouse */
    mx = e.screenX; my = e.screenY;
    lastMove = performance.now();
    sync();
  };

  /* ---------- focus ---------- */
  let fsAt = -1e9, leftAt = -1e9, backAt = -1e9, blurTimer = 0, away = false;
  const onBlur = () => {
    if (S.opts.manual || S.botName) return; /* a test or the dev page's bot: nobody is at the keys */
    away = true;
    clearTimeout(blurTimer);
    blurTimer = setTimeout(() => { if (!document.hasFocus() && playing()) pause(); }, Math.max(0, fsAt + FS_SETTLE - performance.now()));
  };
  const onFocus = () => { backAt = performance.now(); away = false; };
  const onClick = (e) => { if (performance.now() - backAt < CLICK_GAP) { e.stopPropagation(); e.preventDefault(); } };

  /* ---------- fullscreen ---------- */
  const leave = () => {
    const go = document.exitFullscreen || document.webkitExitFullscreen;
    if (!go) return;
    fsAt = performance.now();
    try { quiet(go.call(document)); } catch (e) { /* refused */ }
  };
  function fullscreen() {
    if (fsNow()) { leave(); return; }
    fsAt = performance.now();
    try { quiet(root.requestFullscreen ? root.requestFullscreen({ navigationUI: 'hide' }) : root.webkitRequestFullscreen ? root.webkitRequestFullscreen() : null); } catch (e) { /* refused: the fight goes on in the window */ }
  }
  /* With Escape locked Esc comes to the page first and pauses, and holding it leaves fullscreen. Without the lock the browser takes it, and leaving is what pauses. */
  const lockEsc = (on) => { try { const k = navigator.keyboard; if (!k) return; if (on) quiet(k.lock(['Escape'])); else k.unlock(); } catch (e) { /* nothing depends on it */ } };
  const onFs = () => {
    const on = fsNow() === root;
    fsAt = performance.now();
    root.classList.toggle('ax-fs', on);
    lockEsc(on);
    if (!on) { leftAt = fsAt; if (playing()) pause(); }
  };

  /* ---------- graphics ---------- */
  let choice = 'auto', applyTimer = 0;
  const lowDetail = () => !S.opts.quality && !!(S.settings && S.settings.st && S.settings.st.lowdetail);
  function applyGraphics() {
    applyTimer = 0;
    const e = S.engine;
    if (S.closed || S.lost || S.rebuilding || !e) return;
    e.adaptive = choice === 'auto';
    e.setQuality(choice === 'auto' ? S.mods.engine.detectQuality({ st: S.settings.st }) : choice);
    if (e.running || !S.cam) return;
    /* paused: nothing else will draw the new look */
    const post = e.post; post.focus = S.cam.getFocus(); post.sharp = S.cam.getSharp(); post.aperture = e.q.film ? S.cam.getAperture() : 0;
    e.render(1e-4);
  }
  function pickGraphics(v) {
    if (!CHOICES.includes(v) || v === choice || !S.engine || S.lost || S.rebuilding || lowDetail()) return;
    choice = v;
    savePref(QUALITY_KEY, v);
    S.hud.setGraphics(v, false);
    /* a level's first use compiles its shaders, so the pressed button paints first. The last one picked is the one applied. */
    if (!applyTimer) applyTimer = setTimeout(applyGraphics, 40);
  }

  /* ---------- sound: on top of the page's Effects volume and sound setting, which stay as they are ---------- */
  let soundOn = readPref(SOUND_KEY) !== 'off';
  const pageSound = () => !S.settings || S.settings.sound;
  function toggleSound() {
    const panel = root.querySelector(UP); /* a panel shows it in its own control */
    if (!pageSound()) { if (!panel) S.hud.note('Sound is off in settings'); return; }
    soundOn = !soundOn;
    savePref(SOUND_KEY, soundOn ? 'on' : 'off');
    if (S.audio) S.audio.setMuted(!soundOn);
    S.hud.setSound(soundOn, false);
    S.hud.note(panel ? '' : soundOn ? 'Sound on' : 'Sound off');
  }

  window.addEventListener('mousemove', onMouse, { capture: true, passive: true });
  window.addEventListener('mousedown', onMouse, { capture: true, passive: true });
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  root.addEventListener('click', onClick, true);
  document.addEventListener('fullscreenchange', onFs);
  document.addEventListener('webkitfullscreenchange', onFs);

  return {
    startQuality: () => (lowDetail() ? 'auto' : graphicsChoice()),
    applyChoices() {
      choice = S.opts.quality || graphicsChoice();
      S.hud.setGraphics(lowDetail() ? 'low' : choice, lowDetail());
      if (S.audio) S.audio.setMuted(!soundOn);
      S.hud.setSound(soundOn && pageSound(), !pageSound());
    },
    /* the cursor's clock starts here, so it outlasts the load screen's fade. A player who went to another app while it loaded comes back to a paused fight. */
    start() { lastMove = performance.now(); sync(); if (away && !document.hasFocus()) pause(); },
    sync, fullscreen, pickGraphics, toggleSound,
    key(code, e) {
      if (code === 'Escape' && performance.now() - leftAt < ESC_GAP) { e.preventDefault(); e.stopPropagation(); return true; }
      if (code !== 'KeyF' && code !== 'KeyM') return false;
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) { if (code === 'KeyF') fullscreen(); else toggleSound(); }
      return true;
    },
    destroy() {
      clearTimeout(cursorTimer); clearTimeout(blurTimer); clearTimeout(applyTimer);
      window.removeEventListener('mousemove', onMouse, true);
      window.removeEventListener('mousedown', onMouse, true);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      root.removeEventListener('click', onClick, true);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
      lockEsc(false);
      if (fsNow() === root) leave();
      root.classList.remove('ax-nocursor', 'ax-fs');
    },
  };
}
