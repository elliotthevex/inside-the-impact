/* The fight menu: pick how good the rival is, over the live ring. All DOM, all under .arena-x.

   createFightMenu(rootEl, { initial, touch, onPick(level), onExit }) -> { show(), hide(), destroy(), el, ready, level, isOpen }
     Levels are 'easy', 'normal', 'hard', the values createAI takes. `level` is the one picked or remembered.
     A pick is stored under 'iti-arena-level', hides the menu and calls onPick. Esc and the Exit button call onExit.

   Keys are heard on the window in the capture phase while the menu is open, so they work wherever focus is and the page behind never
   sees them. index.js also listens there and got in first, so its handler has to step aside while the menu is open: see the hook in
   gfx/dev/notes/features.md.

   Each line says only what is true of that level in ai.js, and says nothing numeric because those numbers are still being tuned.
   The check for these sentences against LEVELS, and against what each level really does in play, is in the same notes. */
import { applySettings, coarsePointer, ensureCss, esc, scopeOf } from './extras-ui.js';

export const STORE_KEY = 'iti-arena-level';
export const LEVELS = ['easy', 'normal', 'hard'];
export const LEVEL_LINES = {
  easy: "Slow to read you, rarely slips, and eases off when he's ahead.",
  normal: 'Reads you in time, slips some, and comes for you when you look hurt.',
  hard: 'Reads you fast, rarely wastes a punch, and pounces the moment you look hurt.',
};
const NAMES = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
const WATCH = 'Watch how he stands, not just his bar.';
const HOW_KEYS = `<span class="ax-kv"><span class="ax-key">Shift</span><span>Guard</span></span><span class="ax-kv"><span class="ax-key">Space</span><span>Slip</span></span><span class="ax-x-watch">${esc(WATCH)}</span>`;
const HOW_TOUCH = `<span class="ax-x-watch">Hold Guard to cover. Tap Slip to dodge. ${esc(WATCH)}</span>`;

function remembered() {
  try { const v = localStorage.getItem(STORE_KEY); return LEVELS.includes(v) ? v : null; } catch (e) { return null; }
}
function remember(level) {
  try { localStorage.setItem(STORE_KEY, level); } catch (e) { /* private window: it just will not be remembered */ }
}

export function createFightMenu(rootEl, opts = {}) {
  const scope = scopeOf(rootEl);
  const touch = opts.touch == null ? coarsePointer() : !!opts.touch;
  let level = LEVELS.includes(opts.initial) ? opts.initial : remembered() || 'normal';
  let open = false, destroyed = false;

  const el = document.createElement('div');
  el.className = 'ax-x-menu';
  el.dataset.touch = touch ? '1' : '0';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Pick your rival');
  el.tabIndex = -1;
  el.style.display = 'none'; // until the stylesheets are in: no raw markup flashes
  el.innerHTML = `
<div class="ax-card ax-x-menu-card">
  <div class="ax-title ax-x-menu-title">Pick your rival</div>
  <div class="ax-x-plates" role="group" aria-label="Rival level">
    ${LEVELS.map((id, i) => `<button class="ax-x-plate" type="button" data-level="${id}">
      <span class="ax-x-plate-top"><span class="ax-x-plate-name">${NAMES[id]}</span><span class="ax-x-plate-pips" aria-hidden="true">${LEVELS.map((_, k) => `<span class="ax-pip${k <= i ? ' is-on' : ''}"></span>`).join('')}</span></span>
      <span class="ax-x-plate-line">${esc(LEVEL_LINES[id])}</span>
    </button>`).join('')}
  </div>
  <div class="ax-x-menu-foot">
    <div class="ax-x-how">${touch ? HOW_TOUCH : HOW_KEYS}</div>
    <button class="ax-btn" type="button" data-act="exit"><span>Exit</span></button>
  </div>
</div>`;
  rootEl.appendChild(el);
  const plates = [...el.querySelectorAll('.ax-x-plate')], exitBtn = el.querySelector('[data-act="exit"]');
  const plateOf = (id) => plates.find((p) => p.dataset.level === id);

  function mark(id) {
    for (const p of plates) {
      const on = p.dataset.level === id;
      p.classList.toggle('is-sel', on);
      if (on) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    }
  }
  function focusLevel(id) {
    level = id;
    mark(id);
    const p = plateOf(id);
    p.focus({ preventScroll: false });
  }
  function move(step) {
    const i = LEVELS.indexOf(level);
    focusLevel(LEVELS[(i + step + LEVELS.length) % LEVELS.length]);
  }
  function pick(id) {
    if (!open) return;
    level = id;
    mark(id);
    remember(id);
    hide();
    if (opts.onPick) opts.onPick(id);
  }
  function exit() {
    if (open && opts.onExit) opts.onExit();
  }

  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.stopPropagation();
    switch (e.key) {
      case 'Escape': e.preventDefault(); if (!e.repeat) exit(); break;
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); move(-1); break;
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); move(1); break;
      case 'Enter': case ' ': case 'Spacebar':
        e.preventDefault();
        if (e.repeat) break;   // a key still held from the screen before must not pick
        if (document.activeElement === exitBtn) exit(); else pick(level);
        break;
      case 'Tab': {
        e.preventDefault();
        const all = [...plates, exitBtn], i = all.indexOf(document.activeElement), to = all[(i + (e.shiftKey ? -1 : 1) + all.length) % all.length];
        if (to === exitBtn) exitBtn.focus(); else focusLevel(to.dataset.level);
        break;
      }
      default: break;
    }
  };
  const onKeyUp = (e) => e.stopPropagation();
  const onClick = (e) => {
    const p = e.target.closest && e.target.closest('.ax-x-plate');
    if (p) { pick(p.dataset.level); return; }
    if (e.target.closest && e.target.closest('[data-act="exit"]')) exit();
  };
  /* a focus that lands on a plate some other way, a mouse press for one, moves the mark with it */
  const onFocusIn = (e) => {
    const p = e.target.closest && e.target.closest('.ax-x-plate');
    if (p && p.dataset.level !== level) { level = p.dataset.level; mark(level); }
  };
  el.addEventListener('click', onClick);
  el.addEventListener('focusin', onFocusIn);

  let cssIn = false;
  const ready = ensureCss().then(() => { cssIn = true; if (!destroyed) { el.style.display = ''; if (open) enter(); } });

  function enter() {
    el.classList.add('is-on');
    focusLevel(level);
  }
  function show() {
    if (destroyed || open) return;
    open = true;
    applySettings(scope);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    if (cssIn) enter();
  }
  function hide() {
    if (!open) return;
    open = false;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    el.classList.remove('is-on');
    if (el.contains(document.activeElement)) document.activeElement.blur(); // so a later Space, the slip key, cannot press a hidden button
  }
  function destroy() {
    if (destroyed) return;
    hide();
    destroyed = true;
    el.removeEventListener('click', onClick);
    el.removeEventListener('focusin', onFocusIn);
    el.remove();
  }

  return {
    show, hide, destroy, el, ready,
    get level() { return level; },
    get isOpen() { return open; },
  };
}
