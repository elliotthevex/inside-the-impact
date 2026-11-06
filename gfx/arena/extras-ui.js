/* What the fight menu and the notes panel share: the stylesheets, and the same settings signals the HUD reads.
   Nothing here writes anything except the class and data attribute the HUD itself keeps on the overlay root. */
const SHEETS = [['arena.css', new URL('./arena.css', import.meta.url).href], ['extras.css', new URL('./extras.css', import.meta.url).href]];

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); // same five as escapeUI in index.html

export function coarsePointer() {
  try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; }
}

function readSettings() {
  try { return JSON.parse(localStorage.getItem('iti.settings.v1') || 'null'); } catch (e) { return null; }
}
/* Same three signals as hud.js: the body class, the data attribute, the OS preference. */
export function reducedMotion() {
  const b = document.body, st = readSettings();
  let os = false;
  try { os = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { os = false; }
  return os || !!(b && (b.classList.contains('reduce-motion') || b.dataset.reduceMotion === '1')) || !!(st && st.motion);
}
function textSize() {
  const d = document.documentElement.dataset.textSize;
  if (d) return d;
  const st = readSettings();
  return (st && st.textsize) || 'normal';
}

/* The overlay root, marked the way the HUD marks it. Call again on each show: both settings can change live. */
export function scopeOf(rootEl) {
  return rootEl.closest('.arena-x') || (rootEl.classList.add('arena-x'), rootEl);
}
export function applySettings(scope) {
  scope.dataset.axText = textSize();
  scope.classList.toggle('ax-rm', reducedMotion());
}

/* Loaded the way hud.js loads arena.css: find the link or add it, then wait for it, and never hang on a failed load. */
export function ensureCss() {
  return Promise.all(SHEETS.map(([name, href]) => {
    let link = null;
    for (const l of document.querySelectorAll('link[rel="stylesheet"]')) if (l.href.split('?')[0].endsWith('/' + name)) link = l;
    if (link && link.sheet) return Promise.resolve();
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    return new Promise((res) => {
      link.addEventListener('load', res, { once: true });
      link.addEventListener('error', res, { once: true });
      setTimeout(res, 2500);
    });
  })).then(() => undefined);
}
