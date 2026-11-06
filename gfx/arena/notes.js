/* The notes panel: the game's medical knowledge and the credits, reached from the pause and end panels. All DOM, all under .arena-x.

   createNotesPanel(rootEl, { onClose }) -> { open(section), close(), isOpen, destroy(), el, ready }
     open()          the top. open('credits') the credits. open('conc'), or any Codex key, opens that entry.
     Esc or Close    closes, calls onClose, and focus goes back where it was.

   Strictly read-only towards the game. The Codex text is read live from the page's own `const CX`, which a module can see as a bare global
   lexical name (it is not on window). It is never copied here, so it cannot drift, and every entry shows, none locked. The panel calls no
   game function and never writes save data.

   Keys are heard on the window in the capture phase while the panel is open. index.js also listens there and got in first, so its handler
   has to step aside while the panel is open: see the hook in gfx/dev/notes/features.md. */
import { applySettings, ensureCss, esc, rawFallback, scopeOf } from './extras-ui.js';

const CREDITS_URL = new URL('../../CREDITS.md', import.meta.url);

/* The wording of the About panel in game.js. A test checks these sentences are still there. */
export const DISCLAIMER = [
  'This is a fictional educational game, not a medical device, examination, diagnosis, treatment, or clearance tool.',
  'Have any suspected injury assessed by qualified clinicians.',
  'Emergency in South Korea: call 119.',
];
/* The entries closest to this fight come first, the rest in the game's own order. */
const FIRST = ['conc', 'sdh', 'sic', 'cum', 'fr'];

/* The page's Codex, or null: the dev page has none, and a future page might not either. Read only. */
function readCodex() {
  let cx = null;
  try { if (typeof CX === 'object' && CX) cx = CX; } catch (e) { cx = null; } // eslint-disable-line no-undef
  if (!cx) return null;
  const good = (k) => Array.isArray(cx[k]) && typeof cx[k][0] === 'string' && typeof cx[k][1] === 'string';
  const keys = Object.keys(cx).filter(good);
  if (!keys.length) return null;
  const first = FIRST.filter((k) => keys.includes(k));
  return { cx, first, rest: keys.filter((k) => !first.includes(k)) };
}

const entryHtml = (cx, k) => `<details class="ax-x-entry" data-key="${esc(k)}"><summary>${esc(cx[k][0])}</summary><div class="ax-x-entry-body">${esc(cx[k][1])}</div></details>`;

/* ---------- a tiny Markdown renderer: headings, bullets, tables, links, code fences, bold, code. Every piece of text goes through esc. ---------- */
const safeUrl = (u) => /^(https?:|mailto:)/i.test(u.trim());
const linkHtml = (text, url) => (safeUrl(url) ? `<a href="${esc(url.trim())}" target="_blank" rel="noopener">${text}</a>` : text);

function inline(src) {
  let out = '', rest = src;
  /* code, [text](url), <url>, **bold**, *em*: the earliest match wins, what sits between them is plain text */
  const RE = /`([^`]+)`|\[([^\]]+)\]\(([^()\s]+)\)|<((?:https?:\/\/|mailto:)[^<>\s]+)>|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/;
  for (;;) {
    const m = RE.exec(rest);
    if (!m) { out += esc(rest); return out; }
    out += esc(rest.slice(0, m.index));
    if (m[1] != null) out += `<code>${esc(m[1])}</code>`;
    else if (m[2] != null) out += linkHtml(inline(m[2]), m[3]);
    else if (m[4] != null) out += linkHtml(esc(m[4]), m[4]);
    else if (m[5] != null) out += `<strong>${inline(m[5])}</strong>`;
    else out += `<em>${inline(m[6])}</em>`;
    rest = rest.slice(m.index + m[0].length);
  }
}
const cells = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const isRule = (row) => /^\s*\|?(\s*:?-+:?\s*\|)*\s*:?-+:?\s*\|?\s*$/.test(row) && row.includes('-');

export function renderMarkdown(md) {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = /^\s*(```+|~~~+)/.exec(line);
    if (fence) {
      const close = fence[1], body = [];
      for (i++; i < lines.length && !lines[i].trim().startsWith(close); i++) body.push(lines[i]);
      i++;
      html += `<pre><code>${esc(body.join('\n'))}</code></pre>`;
      continue;
    }
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) {
      const n = Math.min(6, h[1].length + 3); // the panel's own section titles are h3
      html += `<h${n}>${inline(h[2])}</h${n}>`;
      i++;
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      html += '<ul>';
      for (; i < lines.length && /^\s*[-*+]\s+/.test(lines[i]); i++) html += `<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`;
      html += '</ul>';
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && isRule(lines[i + 1])) {
      const head = cells(line);
      html += `<div class="ax-x-table"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>`;
      for (i += 2; i < lines.length && lines[i].includes('|') && lines[i].trim(); i++) html += `<tr>${cells(lines[i]).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`;
      html += '</tbody></table></div>';
      continue;
    }
    const para = [line.trim()];
    for (i++; i < lines.length && lines[i].trim() && !/^\s*(#{1,6}\s|[-*+]\s|```|~~~)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isRule(lines[i + 1])); i++) para.push(lines[i].trim());
    html += `<p>${inline(para.join(' '))}</p>`;
  }
  return html;
}

export function createNotesPanel(rootEl, opts = {}) {
  const scope = scopeOf(rootEl);
  let isOpen = false, destroyed = false, cssIn = false, back = null, shown = null, wanted = null;
  let creditsState = 'none'; // none, loading, done, failed

  const el = document.createElement('div');
  el.className = 'ax-x-notes';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'ax-x-notes-title');
  el.setAttribute('aria-describedby', 'ax-x-notes-legal');
  el.tabIndex = -1;
  el.style.display = 'none'; // closed. Held here, not left to the stylesheet, so a closed panel stays hidden even if extras.css never loads
  el.innerHTML = `
<div class="ax-x-notes-box">
  <div class="ax-x-notes-head">
    <div class="ax-x-notes-bar">
      <div class="ax-title ax-x-notes-title" id="ax-x-notes-title">Notes</div>
      <button class="ax-btn ax-x-notes-btn" type="button" data-act="credits"><span>Credits</span></button>
      <button class="ax-btn ax-x-notes-btn" type="button" data-act="close"><span>Close</span></button>
    </div>
    <p class="ax-x-legal" id="ax-x-notes-legal">${DISCLAIMER.map(esc).join(' ')}</p>
  </div>
  <div class="ax-x-notes-scroll" tabindex="0" role="region" aria-label="Medical notes and credits">
    <div class="ax-x-codex"></div>
    <section class="ax-x-credits" aria-labelledby="ax-x-credits-title">
      <h3 class="ax-x-h" id="ax-x-credits-title">Credits</h3>
      <div class="ax-x-md"></div>
    </section>
  </div>
</div>`;
  rootEl.appendChild(el);
  const scroller = el.querySelector('.ax-x-notes-scroll'), codexEl = el.querySelector('.ax-x-codex'), creditsEl = el.querySelector('.ax-x-credits'), mdEl = el.querySelector('.ax-x-md');

  function renderCodex() {
    if (shown) return; // once it has been read it cannot have changed: it is a const
    const c = readCodex();
    if (!c) {
      codexEl.innerHTML = '<h3 class="ax-x-h">Medical notes</h3><p class="ax-x-sorry">The Medical Codex cannot be read on this page, so its entries are not shown here.</p>';
      return;
    }
    shown = c;
    codexEl.innerHTML = `<h3 class="ax-x-h">Closest to this fight</h3>${c.first.map((k) => entryHtml(c.cx, k)).join('')}` +
      `<h3 class="ax-x-h">The rest of the Codex</h3>${c.rest.map((k) => entryHtml(c.cx, k)).join('')}`;
  }

  function loadCredits() {
    if (creditsState === 'loading' || creditsState === 'done') return;
    creditsState = 'loading';
    mdEl.innerHTML = '<p class="ax-x-sorry">Loading the credits.</p>';
    /* the panel's own title already says Credits, so the file's first heading is dropped */
    fetch(CREDITS_URL).then((r) => { if (!r.ok) throw new Error('status ' + r.status); return r.text(); }).then((text) => {
      if (destroyed) return;
      mdEl.innerHTML = renderMarkdown(text.replace(/^\s*#\s+Credits[ \t]*\n/, ''));
      creditsState = 'done';
    }).catch(() => {
      if (destroyed) return;
      mdEl.innerHTML = '<p class="ax-x-sorry">The credits could not be loaded. The medical notes above still work. Credits are in the file CREDITS.md that comes with the game.</p>';
      creditsState = 'failed';
    });
  }

  /* Offsets are worked out against the scroller, not the page. */
  function scrollToEl(target) {
    const a = target.getBoundingClientRect(), b = scroller.getBoundingClientRect();
    scroller.scrollTop += a.top - b.top - 8;
  }

  const focusable = () => [...el.querySelectorAll('button, a[href], summary, [tabindex="0"]')].filter((n) => n.getClientRects().length && !(n.closest('details:not([open])') && n.tagName !== 'SUMMARY'));

  const onKey = (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); if (!e.repeat) close(); return; }
    if (e.key === 'Tab') {
      const all = focusable(), at = all.indexOf(document.activeElement);
      if (!all.length) { e.preventDefault(); return; }
      if (at < 0 || (e.shiftKey && at === 0) || (!e.shiftKey && at === all.length - 1)) {
        e.preventDefault();
        all[e.shiftKey ? all.length - 1 : 0].focus();
      }
    }
  };
  const onKeyUp = (e) => e.stopPropagation();
  /* a focus that gets out some other way comes straight back */
  const onFocusIn = (e) => { if (isOpen && !el.contains(e.target)) scroller.focus({ preventScroll: true }); };
  const onClick = (e) => {
    const b = e.target.closest && e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'close') close();
    else if (b.dataset.act === 'credits') { scrollToEl(creditsEl); scroller.focus({ preventScroll: true }); }
  };
  el.addEventListener('click', onClick);

  const ready = ensureCss().then(() => { cssIn = true; if (!destroyed && isOpen) enter(); });

  function enter() {
    el.style.display = '';
    el.classList.add('is-on');
    rawFallback(el);
    renderCodex();
    loadCredits();
    scroller.scrollTop = 0;
    const d = wanted && wanted !== 'credits' ? codexEl.querySelector(`details[data-key="${CSS.escape(wanted)}"]`) : null;
    if (d) { d.open = true; scrollToEl(d); d.querySelector('summary').focus({ preventScroll: true }); return; }
    if (wanted === 'credits') scrollToEl(creditsEl);
    scroller.focus({ preventScroll: true });
  }
  function open(section) {
    if (destroyed || isOpen) return;
    isOpen = true;
    wanted = typeof section === 'string' && section !== 'codex' ? section : null;
    back = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
    applySettings(scope);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    document.addEventListener('focusin', onFocusIn);
    if (cssIn) enter();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('focusin', onFocusIn);
    el.classList.remove('is-on');
    el.style.display = 'none';
    const to = back; back = null;
    if (to && to.isConnected) to.focus({ preventScroll: true });
    else if (el.contains(document.activeElement)) document.activeElement.blur();
    if (opts.onClose) opts.onClose();
  }
  function destroy() {
    if (destroyed) return;
    if (isOpen) { isOpen = false; window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKeyUp, true); document.removeEventListener('focusin', onFocusIn); }
    destroyed = true;
    el.removeEventListener('click', onClick);
    el.remove();
  }

  return {
    open, close, destroy, el, ready,
    get isOpen() { return isOpen; },
  };
}
