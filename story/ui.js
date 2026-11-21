/* Story Mode — ui.js
   Every piece of Story Mode's interface except the canvas (ARCHITECTURE.md §10): the fixed HUD edges,
   world labels (focus prompt, barks, NPC markers), the dialogue box, title cards, the director's screens
   (chapter card, completion, ending, credits), summonable windows (journal with Quests / Evidence /
   Memories / People / Map / Training, document viewer, timeline board, evidence picker, pause menu,
   save and load slots, settings, controls, confirm), the title screen, toasts and the error overlay.
   DOM only, inside #story-root. Nothing here runs headless: every entry point returns early when
   S.headless is true, and the simulation never waits on the UI (scripts wait on the director).

   Public API (S.ui) — notes in story/dev/notes/ui.md:
     init(root) / destroy()            main.js mounts and unmounts the UI with Story Mode
     update(dt)                        once per rendered frame: keys, director state, HUD, labels, toasts
     openWindow(name, data) -> bool    'journal' {tab}, 'map', 'quests'|'evidence'|'memories'|'people'|'training'
                                       (journal tabs), 'pause', 'save', 'load', 'settings', 'controls',
                                       'doc' {doc|id}, 'timeline'|'present' (activity state), 'confirm' {title,text,yes,no,onYes}
     closeWindow(name?) -> bool        closes that window (else the top one)
     isOpen(name?) -> bool             any window, or that one ('map' = journal on its Map tab)
     toast(text, kind)                 progress kinds top right; hint / tip / locked / error / info bottom centre
     title()                           the Story Mode title screen
     chapterCard(def, opts)            chapter intro card (the director's D.screen uses the same renderer)
     chapterComplete(data, opts)       chapter completion screen
     error(err, ctx)                   error overlay (message + Back to the lobby)
     handlesTitleEsc = true            Esc on the title is handled here (back, or to the lobby)

   Keyboard: the UI reads its own keydown queue (so it never depends on sim steps or key repeat rules) and
   maps codes through S.input.actionFor, so rebinding applies to menus too. While Story Mode is open every
   key event stops propagating at the window, so nothing reaches the lobby. Windows pause the sim. */
(function (S) {
  'use strict';

  const U = S.util;
  const clamp = U.clamp;
  const UI = S.ui = S.ui || {};
  const story = S.story = S.story || {};
  const has = (o, fn) => !!o && typeof o[fn] === 'function';
  const DIR = () => S.director || null;
  const WLD = () => S.world || null;
  const CMB = () => S.combat || null;
  const SANDBOX = 99;

  /* ── 0. Helpers ───────────────────────────────────────────────────── */
  const warned = Object.create(null);
  function warnOnce(key, msg) {
    if (warned[key]) return; warned[key] = true;
    try { console.warn('[story ui]', msg); } catch (_) { /* no console */ }
  }
  // Sources start with 'ui' so main.js shows UI failures in its own overlay (never recursing into ours).
  function report(err, where) { try { S.fail(err, { source: 'ui ' + where }); } catch (_) { /* nothing left to do */ } }
  function safe(fn, where, def) { try { return fn(); } catch (err) { report(err, where); return def; } }
  const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => +S.realTime || 0;
  function sound(name, opts) { if (S.headless || !S.audio) return; try { S.audio.play(name, opts); } catch (_) { /* audio never breaks the UI */ } }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function label(a) { try { return S.input.labelFor(a); } catch (_) { return a; } }
  const keyCap = (text) => '<span class="su-key">' + esc(text) + '</span>';
  const keyHtml = (a) => keyCap(label(a));
  // Escaped text with {action} or [action] -> that action's current key, and [K] -> a key cap
  // (prompts, tips, hints; never dialogue).
  const isAction = (a) => !!(S.input && S.input.actions && S.input.actions.indexOf(a) >= 0);
  function richText(t) {
    let s = esc(t);
    s = s.replace(/\{(\w+)\}/g, (m, a) => (isAction(a) ? keyHtml(a) : m));
    s = s.replace(/\[([^\]\s][^\]]{0,11})\]/g, (m, k) => (isAction(k) ? keyHtml(k) : keyCap(k)));
    return s;
  }
  function setText(e, t) { t = String(t === undefined || t === null ? '' : t); if (e && e.textContent !== t) e.textContent = t; }
  function setHtml(e, h) { if (e && e._h !== h) { e._h = h; e.innerHTML = h; } }
  function toggle(e, cls, on) { if (e && e.classList.contains(cls) !== !!on) e.classList.toggle(cls, !!on); }
  function focusEl(e) { if (e && e.focus) { try { e.focus({ preventScroll: true }); } catch (_) { /* old browser */ } } }
  function viewScale() { const v = S.main && S.main.view; return v && v.scale > 0 ? v.scale : 2; }
  function fmtTime(sec) { return U.fmtTime ? U.fmtTime(sec) : String(Math.round(sec)) + 's'; }
  function fmtDate(ms) {
    if (!ms) return '';
    try {
      const d = new Date(ms);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (_) { return ''; }
  }
  // Scroll `item` into view inside its nearest scrolling box (never the page or #story-root).
  function ensureVisible(item) {
    if (!item) return;
    let box = item.parentElement;
    while (box && box !== st.ui) {
      const cs = window.getComputedStyle(box);
      if (/(auto|scroll)/.test(cs.overflowY) && box.scrollHeight > box.clientHeight) break;
      box = box.parentElement;
    }
    if (!box || box === st.ui) return;
    const a = item.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (a.top < b.top) box.scrollTop -= b.top - a.top + 4;
    else if (a.bottom > b.bottom) box.scrollTop += a.bottom - b.bottom + 4;
  }

  const KIND_ICON = { main: '◆', side: '○', missable: '★', collectable: '▣' };
  const KIND_NAME = { main: 'Main', side: 'Optional', missable: 'Missable', collectable: 'Collectable' };
  const kindOf = (k) => (KIND_ICON[k] ? k : k === 'optional' ? 'side' : 'main');
  const EV_TAG = { document: 'DOC', photo: 'PHOTO', object: 'ITEM', recording: 'TAPE', letter: 'LETTER', record: 'RECORD' };
  const ACTION_LABEL = { left: 'Move left', right: 'Move right', up: 'Up · climb · enter', down: 'Down · guard · drop', jump: 'Jump',
    punch: 'Punch', dash: 'Dash', slip: 'Slip', flurry: 'Flurry', interact: 'Interact · talk · confirm', journal: 'Journal',
    map: 'Map', minimap: 'Minimap', pause: 'Pause · back', run: 'Walk / run toggle' };

  function G() { return S.G || {}; }
  function chapterDef(n) { return story.chapters ? story.chapters[n === undefined ? G().chapter : n] || null : null; }
  function chapterName(n) {
    const d = chapterDef(n);
    if (+n === SANDBOX) return 'Movement sandbox';
    return 'Chapter ' + n + (d && d.title ? ' — ' + d.title : '');
  }
  function locName(id) {
    if (!id) return '';
    const L = safe(() => (has(story, 'location') ? story.location(id) : null), 'location ' + id, null);
    return (L && L.name) || String(id);
  }
  function personName(id) {
    if (!id) return '';
    if (id === 'jin') return 'Jin';
    const p = safe(() => (has(story, 'person') ? story.person(id) : null), 'person', null);
    return (p && p.name) || String(id).replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // A chapter-pinned lookup first ('c3:id'), so archives show the definition from the chapter it came from.
  function defOf(kind, id, at) {
    if (!has(story, 'lookup')) return null;
    let d = null;
    if (at !== undefined && at !== null && at !== '') d = safe(() => story.lookup(kind, 'c' + at + ':' + id), 'lookup', null);
    return d || safe(() => story.lookup(kind, id), 'lookup', null);
  }
  function fightOn() {
    const cs = CMB() && CMB().state;
    return !!(cs && ((cs.fight && !cs.fight.done) || (cs.bout && !cs.bout.done)));
  }
  function playMode() { return !!(S.main && S.main.mode === 'play'); }

  /* ── 1. State ─────────────────────────────────────────────────────── */
  const st = {
    mounted: false, root: null, ui: null, labels: null, L: {},
    keys: [], skipKey: false, capturing: false,
    windows: [], uiPaused: false, lastTab: 'quests',
    title: { view: 'main', sel: 0, items: [] }, titleOn: false,
    screen: null, dying: [], card: { src: null },
    say: null, hud: null, place: null, mm: null, lab: null,
    toasts: [], notices: [], err: null,
    vitT: -9, lastSel: -1,
  };

  /* ── 2. Mount / unmount ───────────────────────────────────────────── */
  function ensureCss() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (let i = 0; i < links.length; i++) if (/story\.css(\?|#|$)/.test(links[i].getAttribute('href') || '')) return;
    if (document.getElementById('story-ui-css')) return;
    const l = document.createElement('link');
    l.id = 'story-ui-css'; l.rel = 'stylesheet';
    l.href = (typeof window !== 'undefined' && window.STORY_CSS) || 'story/story.css';
    (document.head || document.documentElement).appendChild(l);
  }

  UI.handlesTitleEsc = true;

  UI.init = function (root) {
    if (S.headless || typeof document === 'undefined') return;
    if (st.mounted) UI.destroy();
    root = root || document.getElementById('story-root');
    if (!root) return;
    ensureCss();
    st.root = root;
    const labels = st.labels = el('div', 'su-labels');
    labels.setAttribute('aria-hidden', 'true');
    const ui = st.ui = el('div', 'su-ui');
    const L = st.L = {};
    for (const [k, cls] of [['hud', 'su-hud off'], ['say', 'su-say-layer'], ['card', 'su-card-layer'], ['toasts', 'su-toasts'],
      ['notices', 'su-notices'], ['screen', 'su-screen-layer'], ['title', 'su-title-layer'], ['win', 'su-win-layer'], ['err', 'su-err-layer']]) {
      L[k] = el('div', cls);
      ui.appendChild(L[k]);
    }
    L.toasts.setAttribute('aria-live', 'polite');
    L.notices.setAttribute('aria-live', 'polite');
    root.appendChild(labels);
    root.appendChild(ui);
    buildHud();
    buildLabels();
    buildSay();
    buildCard();
    // Clicking the dimmed backdrop closes the top window (not confirms or boards).
    L.win.addEventListener('click', (ev) => {
      if (ev.target !== L.win) return;
      const w = topWin();
      if (w && w.backdropClose) closeWin(w);
    });
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    st.windows.length = 0; st.keys.length = 0; st.toasts.length = 0; st.notices.length = 0;
    st.screen = null; st.err = null; st.titleOn = false; st.uiPaused = false;
    st.mounted = true;
  };

  UI.destroy = function () {
    if (!st.mounted) return;
    st.mounted = false;
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);
    if (st.capturing && S.input && has(S.input, 'captureNext')) S.input.captureNext(null);
    st.capturing = false;
    for (const e of [st.ui, st.labels]) if (e && e.parentNode) e.parentNode.removeChild(e);
    st.windows.length = 0; st.keys.length = 0; st.toasts.length = 0; st.notices.length = 0; st.dying.length = 0;
    st.screen = null; st.err = null; st.titleOn = false; st.card = { src: null };
    if (st.uiPaused) { st.uiPaused = false; S.paused = false; }
    st.ui = st.labels = st.root = null; st.L = {};
  };

  /* ── 3. Keys ──────────────────────────────────────────────────────── */
  const REPEATABLE = { up: 1, down: 1, left: 1, right: 1 };
  function onKeyDown(e) {
    if (!S.isOpen || !st.mounted) return;
    // Story Mode owns the keyboard while it is open: no key event reaches the lobby.
    e.stopPropagation();
    if (st.skipKey) { st.skipKey = false; return; }     // this key was taken by a rebinding capture
    if (st.capturing) return;
    const action = S.input && has(S.input, 'actionFor') ? S.input.actionFor(e.code) : null;
    if (e.repeat && !(REPEATABLE[action] || /^Arrow/.test(e.code))) return;
    if (/^(Enter|NumpadEnter|Escape|Backspace|Delete|PageUp|PageDown|Home|End|Arrow\w+)$/.test(e.code)) e.preventDefault();
    if (st.keys.length < 32) st.keys.push({ code: e.code, action, repeat: !!e.repeat, shift: !!e.shiftKey, at: now() });
  }
  function onKeyUp(e) { if (S.isOpen && st.mounted) e.stopPropagation(); }

  const isUp = (k) => k.action === 'up' || k.code === 'ArrowUp';
  const isDown = (k) => k.action === 'down' || k.code === 'ArrowDown';
  const isLeft = (k) => k.action === 'left' || k.code === 'ArrowLeft';
  const isRight = (k) => k.action === 'right' || k.code === 'ArrowRight';
  const isOk = (k) => k.action === 'interact' || k.code === 'Enter' || k.code === 'NumpadEnter' || k.code === 'Space';
  const isConfirm = (k) => k.action === 'interact' || k.code === 'Enter' || k.code === 'NumpadEnter';   // dialogue: no Space (jump in preset A)
  const isBack = (k) => k.action === 'pause' || k.code === 'Escape' || k.code === 'Backspace';
  function digitOf(k) { const m = /^(?:Digit|Numpad)([1-9])$/.exec(k.code); return m ? +m[1] : 0; }
  const navKeys = () => keyCap('↑↓') + ' choose  ' + keyHtml('interact') + ' select  ' + keyHtml('pause') + ' back';

  /* ── 4. Window framework ──────────────────────────────────────────── */
  const WIN = {};   // name -> factory(data) -> window object
  const ALIAS = { map: 'map', quests: 'quests', evidence: 'evidence', memories: 'memories', people: 'people', training: 'training' };
  const topWin = () => st.windows[st.windows.length - 1] || null;

  UI.openWindow = function (name, data) {
    if (S.headless || !st.mounted) return false;
    return !!safe(() => openWin(name, data), 'openWindow ' + name, false);
  };
  function openWin(name, data) {
    if (ALIAS[name]) { data = Object.assign({}, data || {}, { tab: ALIAS[name] }); name = 'journal'; }
    const make = WIN[name];
    if (!make) { warnOnce('win ' + name, 'unknown window "' + name + '"'); return false; }
    const open = st.windows.find((w) => w.name === name);
    if (open) {
      if (name === 'journal') { if (data && data.tab) open.setTab(data.tab); return true; }
      if (open.data === data) return true;
      closeWin(open, 'replaced');
    }
    const w = make(data || {});
    if (!w) return false;
    w.name = name; w.data = data || {}; w.openedAt = now();
    const box = w.el = el('div', 'su-win ' + (w.cls || ''));
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('tabindex', '-1');
    box.setAttribute('aria-label', w.label || name);
    box.addEventListener('click', (ev) => winClick(w, ev));
    box.addEventListener('mouseover', (ev) => winHover(w, ev));
    st.L.win.appendChild(box);
    st.windows.push(w);
    if (w.init) safe(() => w.init(), 'init ' + name);
    renderWin(w);
    afterStackChange();
    if (!w.quiet) sound('ui');
    return true;
  }
  function closeWin(w, reason) {
    const i = st.windows.indexOf(w);
    if (i < 0) return false;
    st.windows.splice(i, 1);
    if (w.el && w.el.parentNode) w.el.parentNode.removeChild(w.el);
    // Removed from the stack first, so isOpen(name) is already false inside onClose.
    if (w.onClose) safe(() => w.onClose(reason || 'closed'), 'close ' + w.name);
    afterStackChange();
    if (reason !== 'replaced' && reason !== 'silent' && reason !== 'api') sound('uiBack');
    return true;
  }
  function closeAll(reason) { for (let i = 0; i < 12 && st.windows.length; i++) closeWin(topWin(), reason || 'silent'); }
  UI.closeWindow = function (name) {
    if (!st.mounted) return false;
    let w = null;
    if (name) {
      for (let i = st.windows.length - 1; i >= 0 && !w; i--) {
        const x = st.windows[i];
        if (x.name === name || (ALIAS[name] && x.name === 'journal')) w = x;
      }
    } else w = topWin();
    return w ? closeWin(w, 'api') : false;
  };
  UI.isOpen = function (name) {
    if (!st.mounted) return false;
    if (!name) return st.windows.length > 0;
    if (ALIAS[name]) return st.windows.some((w) => w.name === 'journal' && w.tab === ALIAS[name]);
    return st.windows.some((w) => w.name === name);
  };
  function afterStackChange() {
    const n = st.windows.length;
    st.windows.forEach((w, i) => toggle(w.el, 'under', i < n - 1));
    toggle(st.L.win, 'on', n > 0);
    const t = topWin();
    focusEl(t ? t.el : st.root);
    if (!n) releaseInput();
    syncPause();
  }
  // After the last window closes nothing pressed in a menu may reach Jin (sim time stood still, so a
  // press would still look fresh to the input buffer).
  function releaseInput() {
    const I = S.input;
    if (!I || !has(I, 'consume')) return;
    for (const a of I.actions || []) I.consume(a);
  }
  // Windows and the error overlay pause the simulation.
  function syncPause() {
    const want = st.windows.length > 0 || !!st.err;
    if (want === st.uiPaused) return;
    st.uiPaused = want;
    S.paused = want;
  }
  function renderWin(w) {
    if (!w || !w.el) return;
    const keep = Array.prototype.map.call(w.el.querySelectorAll('[data-keep-scroll]'), (b) => [b.getAttribute('data-keep-scroll'), b.scrollTop]);
    safe(() => w.render(), 'render ' + w.name);
    for (const [id, top] of keep) { const b = w.el.querySelector('[data-keep-scroll="' + id + '"]'); if (b) b.scrollTop = top; }
    if (w.after) safe(() => w.after(), 'after ' + w.name);
    ensureVisible(w.el.querySelector('[data-i].sel'));
  }
  function winClick(w, ev) {
    const t = ev.target && ev.target.closest ? ev.target.closest('[data-a]') : null;
    if (!t || !w.el.contains(t)) return;
    ev.stopPropagation();
    if (t.classList.contains('dis') && t.getAttribute('data-a') !== 'item' && t.getAttribute('data-a') !== 'tab') {
      sound('uiBack'); flashWhy(w, t.getAttribute('data-why') || t.getAttribute('title') || ''); return;
    }
    if (w.act) safe(() => w.act(t.getAttribute('data-a'), t, ev), 'act ' + w.name);
  }
  function winHover(w, ev) {
    const t = ev.target && ev.target.closest ? ev.target.closest('[data-i],[data-why]') : null;
    if (!t || !w.el.contains(t)) return;
    if (t.hasAttribute('data-i') && w.hover) safe(() => w.hover(t), 'hover ' + w.name);
    else if (t.hasAttribute('data-why')) flashWhy(w, t.getAttribute('data-why'), true);
  }
  // Show why the selected control is disabled (or clear it).
  function flashWhy(w, text, quiet) {
    const e = w && w.el && w.el.querySelector('.su-why');
    if (!e) return;
    setText(e, text || '');
    if (!quiet && text) { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = 'su-objflash 0.8s ease-out'; }
  }
  function winHead(title, meta) {
    return '<div class="su-win-head"><h2>' + esc(title) + '</h2><div class="meta">' + (meta || '') + '</div>' +
      '<button type="button" class="su-x" data-a="close" aria-label="Close">' + esc(label('pause')) + '</button></div>';
  }
  function winFoot(why, keys) {
    return '<div class="su-win-foot"><div class="su-why">' + esc(why || '') + '</div><div class="su-keys">' + (keys || navKeys()) + '</div></div>';
  }
  function btn(text, a, o) {
    o = o || {};
    const dis = o.enabled === false;
    return '<button type="button" class="su-btn' + (o.cls ? ' ' + o.cls : '') + (dis ? ' dis' : '') + (o.sel ? ' sel' : '') + '" data-a="' + a + '"' +
      (o.i !== undefined ? ' data-i="' + o.i + '"' : '') + (dis ? ' aria-disabled="true" data-why="' + esc(o.why || '') + '" title="' + esc(o.why || '') + '"' : '') + '>' + (o.html || esc(text)) + '</button>';
  }

  // A vertical menu window. items: [{ text, sub, enabled, why, act(w), cls, html, btnCls }]
  function menuHtml(items, sel) {
    return '<div class="su-menu" role="menu">' + items.map((it, i) => {
      const dis = it.enabled === false;
      return '<button type="button" role="menuitem" class="' + (it.btnCls || 'su-btn') + (it.cls ? ' ' + it.cls : '') + (i === sel ? ' sel' : '') + (dis ? ' dis' : '') +
        '" data-a="item" data-i="' + i + '"' + (dis ? ' aria-disabled="true" title="' + esc(it.why || '') + '"' : '') + '>' +
        (it.html || esc(it.text) + (it.sub ? '<span class="sub">' + esc(it.sub) + '</span>' : '')) + '</button>';
    }).join('') + '</div>';
  }
  function refreshSel(w) {
    const list = w.el.querySelectorAll('[data-a="item"][data-i]');
    for (let i = 0; i < list.length; i++) toggle(list[i], 'sel', +list[i].getAttribute('data-i') === w.sel);
    if (w.whyText) flashWhy(w, w.whyText(), true);
    ensureVisible(w.el.querySelector('[data-a="item"].sel'));
  }
  function menuWindow(o) {
    const w = {
      cls: o.cls || 'narrow', label: o.title, sel: o.sel || 0, items: [], backdropClose: o.backdropClose !== false, quiet: o.quiet,
      render() {
        this.items = o.items(this) || [];
        if (this.sel >= this.items.length) this.sel = Math.max(0, this.items.length - 1);
        const meta = typeof o.meta === 'function' ? o.meta(this) : o.meta || '';
        const intro = typeof o.intro === 'function' ? o.intro(this) : o.intro || '';
        this.el.innerHTML = winHead(typeof o.title === 'function' ? o.title(this) : o.title, meta) +
          '<div class="su-win-body" data-keep-scroll="b">' + intro + menuHtml(this.items, this.sel) + '</div>' + winFoot(this.whyText(), o.keys);
      },
      whyText() { const it = this.items[this.sel]; return it && it.enabled === false ? it.why || '' : (it && it.note) || ''; },
      move(d) {
        const n = this.items.length;
        if (!n) return;
        this.sel = (this.sel + d + n) % n;
        sound('uiMove');
        refreshSel(this);
      },
      activate(i) {
        const it = this.items[i];
        if (!it) return;
        if (it.enabled === false) { sound('uiBack'); flashWhy(this, it.why || ''); return; }
        if (!it.silent) sound('ui');
        safe(() => it.act(this), 'menu ' + it.text);
      },
      key(k) {
        if (isUp(k)) { this.move(-1); return true; }
        if (isDown(k)) { this.move(1); return true; }
        if (isOk(k)) { this.activate(this.sel); return true; }
        const d = digitOf(k);
        if (d && d <= this.items.length) { this.sel = d - 1; refreshSel(this); this.activate(this.sel); return true; }
        if (isBack(k) || (o.closeOn && k.action === o.closeOn)) { if (o.onBack) o.onBack(this); else closeWin(this); return true; }
        return true;   // a modal menu swallows every other key
      },
      act(a, t) {
        if (a === 'item') { this.sel = +t.getAttribute('data-i'); refreshSel(this); this.activate(this.sel); }
        else if (a === 'close') { if (o.onBack) o.onBack(this); else closeWin(this); }
      },
      hover(t) {
        if (t.getAttribute('data-a') !== 'item') return;
        const i = +t.getAttribute('data-i');
        if (i !== this.sel) { this.sel = i; refreshSel(this); }
      },
      onClose: o.onClose,
    };
    return w;
  }

  // confirm({ title, text: string | [paragraphs], yes, no, danger, defaultYes, onYes, onNo })
  WIN.confirm = function (o) {
    const paras = Array.isArray(o.text) ? o.text : [o.text || ''];
    const w = menuWindow({
      title: o.title || 'Are you sure?', cls: 'narrow', backdropClose: false,
      intro: '<div class="su-confirm">' + paras.map((p) => '<p>' + esc(p) + '</p>').join('') + '</div>',
      items: () => [
        { text: o.no || 'Cancel', act: (x) => { closeWin(x); if (o.onNo) o.onNo(); } },
        { text: o.yes || 'OK', cls: o.danger ? 'danger' : '', silent: true, act: (x) => { closeWin(x, 'silent'); sound('ui'); if (o.onYes) o.onYes(); } },
      ],
    });
    w.sel = o.defaultYes ? 1 : 0;
    return w;
  };
  function confirm(o) { return openWin('confirm', o); }

  /* ── 5. Toasts and notices ────────────────────────────────────────── */
  const TOAST_KINDS = { quest: 1, evidence: 1, memory: 1, people: 1, skill: 1, gear: 1, money: 1, checkpoint: 1, saved: 1, fail: 1, progress: 1 };
  const TOAST_HEAD = { evidence: 'New evidence', memory: 'Memory', people: 'People', skill: 'New technique', gear: 'Gear',
    money: 'Money', checkpoint: 'Checkpoint', saved: 'Saved', fail: 'Missed', quest: 'Quest' };
  const TOAST_ICON = { evidence: '▤', memory: '❖', people: '◐', skill: '✦', gear: '⚙', money: '$', checkpoint: '✓', saved: '✓', fail: '✕', quest: '◆' };

  /* toast(text, kind, o) — o: { head, icon, iconCls, life }. Progress kinds stack top right; everything else
     (hint, tip, locked, error, info) is a short notice at the bottom centre, nearer to where the player looks. */
  UI.toast = function (text, kind, o) {
    if (S.headless || !st.mounted || !text) return;
    o = o || {};
    kind = kind || 'info';
    text = String(text);
    const t = now();
    if (TOAST_KINDS[kind]) {
      let head = o.head, body = text;
      if (!head) {
        // 'New technique: Hook' -> head + body
        const m = /^([^:]{2,24}):\s+(.+)$/.exec(text);
        if (m && (kind === 'skill' || kind === 'gear')) { head = m[1]; body = m[2]; } else head = TOAST_HEAD[kind] || '';
      }
      const dup = st.toasts.find((x) => x.text === body && x.kind === kind && t - x.born < 3);
      if (dup) { dup.born = t; dup.shownAt = dup.shownAt === null ? null : t; return; }
      st.toasts.push({ text: body, head, kind, icon: o.icon || TOAST_ICON[kind] || '•', iconCls: o.iconCls || '', born: t, shownAt: null,
        life: o.life || (kind === 'skill' ? 5.5 : kind === 'checkpoint' || kind === 'saved' || kind === 'money' ? 2.8 : 4.4), el: null });
      while (st.toasts.length > 6) dropToast(st.toasts[0]);
    } else {
      // o.key: a notice that replaces its own earlier copy (the minimap cycling through its modes).
      if (o.key) for (const x of st.notices.slice()) if (x.key === o.key) dropNotice(x);
      const dup = st.notices.find((x) => x.text === text && t - x.born < 2.5);
      if (dup) { dup.born = t; dup.until = t + dup.life; return; }
      const life = o.life || (kind === 'tip' ? 6.5 : kind === 'error' ? 5 : 3.4);
      st.notices.push({ text, kind, key: o.key || null, born: t, life, until: t + life, el: null });
      while (st.notices.length > 3) dropNotice(st.notices[0]);
    }
  };
  function dropToast(x) {
    const i = st.toasts.indexOf(x); if (i >= 0) st.toasts.splice(i, 1);
    if (x.el && x.el.parentNode) x.el.parentNode.removeChild(x.el);
  }
  function dropNotice(x) {
    const i = st.notices.indexOf(x); if (i >= 0) st.notices.splice(i, 1);
    if (x.el && x.el.parentNode) x.el.parentNode.removeChild(x.el);
  }
  function updateToasts() {
    const t = now();
    // Progress toasts wait while a full-screen card or the title is up (they would be missed).
    const hold = st.titleOn || !!(st.screen) || !playMode();
    let shown = 0;
    for (const x of st.toasts.slice()) {
      if (x.shownAt === null) {
        if (hold || shown >= 4) continue;
        x.shownAt = t;
        x.el = el('div', 'su-toast ' + x.kind, '<span class="su-ico ' + esc(x.iconCls) + '">' + esc(x.icon) + '</span><span class="tx">' +
          (x.head ? '<b>' + esc(x.head) + '</b>' : '') + richText(x.text) + '</span>');
        st.L.toasts.appendChild(x.el);
      }
      shown++;
      const age = t - x.shownAt;
      if (age > x.life) toggle(x.el, 'out', true);
      if (age > x.life + 0.55) dropToast(x);
    }
    toggle(st.L.notices, 'low', !(DIR() && DIR().dialog));
    for (const x of st.notices.slice()) {
      if (!x.el) { x.el = el('div', 'su-notice ' + x.kind, richText(x.text)); st.L.notices.appendChild(x.el); }
      if (t > x.until) toggle(x.el, 'out', true);
      if (t > x.until + 0.5) dropNotice(x);
    }
  }

  /* ── 6. HUD: place name, minimap, objective, Journal/Map, vitals, bout ── */
  function buildHud() {
    const h = st.hud = { root: st.L.hud };
    h.root.innerHTML =
      '<div class="su-tl">' +
        '<div class="su-place su-ctx gone"><div class="su-kicker"></div><div class="su-place-name"></div><div class="su-place-sub"></div></div>' +
        '<div class="su-mm partial" role="button" aria-label="Minimap" title="Minimap"><div class="su-mm-head"><span></span><span></span></div>' +
          '<div class="su-mm-field"><div class="su-mm-in"><div class="geo"></div><div class="dyn"></div></div></div></div>' +
        '<div class="su-obj su-ctx hidden"><span class="su-ico"></span><span class="su-obj-b"><span class="su-obj-q"></span><span class="su-obj-t"></span></span></div>' +
      '</div>' +
      '<div class="su-tr">' +
        '<button type="button" class="su-hbtn" data-a="journal" aria-label="Journal">Journal <span class="su-key"></span><span class="su-badge hidden">+</span></button>' +
        '<button type="button" class="su-hbtn" data-a="map" aria-label="Map">Map <span class="su-key"></span></button>' +
      '</div>' +
      '<div class="su-vitals">' +
        '<div class="su-vrow"><span class="su-vlab">Condition</span><span class="su-bar hp"><s></s><b></b></span></div>' +
        '<div class="su-vrow br hidden"><span class="su-vlab">Breath</span><span class="su-bar br"><b></b></span></div>' +
        '<div class="su-vrow"><span class="su-vlab">Dash</span><span class="su-pips"></span></div>' +
      '</div>' +
      '<div class="su-bout hidden"><span class="su-bout-r"></span><span class="su-bout-c"></span><span class="su-bout-o"><span></span><b><i></i></b></span></div>' +
      '<div class="su-count"></div>';
    const q = (s) => h.root.querySelector(s);
    st.place = { el: q('.su-place'), kick: q('.su-place .su-kicker'), name: q('.su-place-name'), sub: q('.su-place-sub'), loc: null, t: 99 };
    st.mm = { el: q('.su-mm'), head: q('.su-mm-head'), field: q('.su-mm-field'), inner: q('.su-mm-in'), geo: q('.su-mm-in .geo'), dyn: q('.su-mm-in .dyn'),
      mode: null, geoKey: '', pool: [] };
    st.mm.inner.style.position = 'absolute'; st.mm.inner.style.left = '0'; st.mm.inner.style.top = '0';
    h.obj = q('.su-obj'); h.objIco = q('.su-obj .su-ico'); h.objQ = q('.su-obj-q'); h.objT = q('.su-obj-t'); h.objKey = '';
    h.tl = q('.su-tl'); h.tr = q('.su-tr');
    h.jBtn = q('[data-a="journal"]'); h.jKey = q('[data-a="journal"] .su-key'); h.badge = q('.su-badge');
    h.mBtn = q('[data-a="map"]'); h.mKey = q('[data-a="map"] .su-key');
    h.vit = q('.su-vitals'); h.hpBar = q('.su-bar.hp'); h.hpB = q('.su-bar.hp b'); h.hpS = q('.su-bar.hp s');
    h.brRow = q('.su-vrow.br'); h.brBar = q('.su-bar.br'); h.brB = q('.su-bar.br b'); h.pips = q('.su-pips'); h.pipN = -1;
    h.bout = q('.su-bout'); h.boutR = q('.su-bout-r'); h.boutC = q('.su-bout-c'); h.boutO = q('.su-bout-o span'); h.boutHp = q('.su-bout-o i');
    h.count = q('.su-count'); h.countKey = '';
    // Focus goes back to the root first (a focused button must never keep keys), then the window takes it.
    h.jBtn.addEventListener('click', () => { focusEl(st.root); if (canSummon() && !st.windows.length) openWin('journal'); });
    h.mBtn.addEventListener('click', () => { focusEl(st.root); if (canSummon() && !st.windows.length) openWin('journal', { tab: 'map' }); });
    st.mm.el.addEventListener('click', () => { focusEl(st.root); cycleMinimap(); });
  }
  // The journal, map and pause menu can be summoned whenever a game is live and no full-screen card is up.
  function canSummon() {
    const Dr = DIR();
    return playMode() && !st.titleOn && !st.err && !!(WLD() && WLD().loc) && !(Dr && Dr.screen);
  }
  function cycleMinimap() {
    const order = ['full', 'partial', 'hidden'];
    const cur = order.indexOf(S.settings.minimap);
    S.settings.minimap = order[(cur + 1) % order.length];
    safe(() => S.saveSettings(), 'saveSettings');
    UI.toast('Minimap: ' + { full: 'full', partial: 'nearby', hidden: 'hidden' }[S.settings.minimap] + '  [' + label('minimap') + ']', 'info', { life: 1.6, key: 'minimap' });
    sound('uiMove');
  }

  function updateHud(dt) {
    const h = st.hud, Dr = DIR(), w = WLD();
    const off = !playMode() || st.titleOn || !(w && w.loc) || !!(Dr && Dr.screen);
    toggle(h.root, 'off', off);
    if (off) { toggle(h.vit, 'show', false); toggle(h.bout, 'hidden', true); toggle(h.count, 'show', false); return; }
    const fx = S.fx || {};
    const cine = (+fx.letterbox || 0) > 0.08 || (+fx.fade || 0) > 0.55 || !!(Dr && Dr.card);
    const fight = fightOn();
    toggle(h.root, 'cine', cine);
    toggle(h.root, 'combat', fight && !cine);
    toggle(h.root, 'talk', !!(Dr && Dr.dialog) && !fight);
    updatePlace(dt, cine);
    updateMinimap();
    updateObjective();
    updateButtons();
    updateVitals(fight, cine);
    updateBout();
  }

  function updatePlace(dt, cine) {
    const p = st.place, w = WLD();
    if (w.locId !== p.loc) {
      p.loc = w.locId;
      const L = w.loc || {};
      setText(p.kick, L.area || (chapterDef() && chapterDef().place) || '');
      setText(p.name, L.name || locName(w.locId));
      setText(p.sub, L.subtitle || L.sub || '');
      p.t = 0;
      toggle(p.el, 'gone', false);
    }
    // The 4 s only count while the place name can be seen (a location entered under a fade waits).
    if (!cine && !st.windows.length) p.t += dt;
    toggle(p.el, 'show', p.t < 4.4);
    toggle(p.el, 'gone', p.t > 5.3);
  }

  function updateMinimap() {
    const mm = st.mm, mode = S.settings.minimap || 'partial';
    if (mode !== mm.mode) { mm.mode = mode; mm.el.className = 'su-mm ' + mode; mm.geoKey = ''; }
    if (mode === 'hidden') return;
    const data = safe(() => (has(WLD(), 'minimap') ? WLD().minimap() : null), 'minimap', null);
    if (!data || !(data.w > 0)) { toggle(mm.el, 'hidden', true); return; }
    toggle(mm.el, 'hidden', false);
    const k = viewScale(), full = mode === 'full';
    const H = data.h || 360;
    const span = full ? data.w : Math.min(data.w, 900);
    const fw = Math.max(60, Math.round(k * (full ? 100 : 62)));
    const sx = fw / span;
    const fh = Math.round(clamp(H * sx, k * 13, k * 46));
    const sy = fh / H;
    const jin = data.jin;
    const x0 = full ? 0 : clamp((jin ? jin.x : 0) - span / 2, 0, Math.max(0, data.w - span));
    const X = (x) => Math.round(x * sx * 10) / 10, Y = (y) => Math.round(clamp(y, 0, H) * sy * 10) / 10;
    // Static geometry: floors, platforms, ladders, doors (rebuilt only when it changes).
    const doorSig = (data.doors || []).map((d) => d.x + (d.locked ? 'L' : '')).join(',');
    const key = data.id + '|' + mode + '|' + fw + 'x' + fh + '|' + doorSig;
    if (key !== mm.geoKey) {
      mm.geoKey = key;
      mm.field.style.width = fw + 'px'; mm.field.style.height = fh + 'px';
      mm.inner.style.width = Math.ceil(data.w * sx) + 'px'; mm.inner.style.height = fh + 'px';
      let g = '';
      for (const f of data.floors || []) g += '<i class="f" style="left:' + X(f.x0) + 'px;top:' + Y(f.y) + 'px;width:' + Math.max(1, X(f.x1 - f.x0)) + 'px"></i>';
      for (const p of data.platforms || []) g += '<i class="p" style="left:' + X(p.x0) + 'px;top:' + Y(p.y) + 'px;width:' + Math.max(1, X(p.x1 - p.x0)) + 'px"></i>';
      for (const l of data.ladders || []) g += '<i class="l" style="left:' + X(l.x) + 'px;top:' + Y(l.y0) + 'px;height:' + Math.max(1, Y(l.y1) - Y(l.y0)) + 'px"></i>';
      for (const d of data.doors || []) g += '<i class="d' + (d.locked ? ' lk' : '') + '" style="left:' + X(d.x) + 'px;top:' + Y(d.y || data.ground || H - 60) + 'px" title="' + esc(d.label || '') + '"></i>';
      mm.geo.innerHTML = g;
      const hd = mm.head.children;
      setText(hd[0], data.name || '');
      setText(hd[1], label('minimap'));
    }
    mm.inner.style.transform = 'translateX(' + (-Math.round(x0 * sx)) + 'px)';
    // Moving things: NPCs, quest targets (off-strip ones pinned to the edge), the camera view, Jin.
    const items = [];
    for (const n of data.npcs || []) items.push(['n' + (n.enemy ? ' e' : '') + (n.marker && !n.enemy ? ' m' : ''), X(n.x), Y(n.y)]);
    for (const t of data.targets || []) {
      let tx = t.x;
      let edge = '';
      if (!full) { const lo = x0 + 4 / sx, hi = x0 + span - 4 / sx; if (tx < lo) { tx = lo; edge = ' edge'; } else if (tx > hi) { tx = hi; edge = ' edge'; } }
      items.push(['t ' + kindOf(t.kind) + edge, X(tx), Y(t.y !== null && t.y !== undefined ? t.y : (data.ground || H - 60))]);
    }
    if (full && data.view) items.push(['v', X(data.view.x), Y(data.view.y), X(data.view.w), Y(data.view.y + data.view.h) - Y(data.view.y)]);
    if (jin) items.push(['j', X(jin.x), Y(jin.y)]);
    const pool = mm.pool;
    while (pool.length < items.length) { const e = el('i'); mm.dyn.appendChild(e); pool.push(e); }
    for (let i = 0; i < pool.length; i++) {
      const e = pool[i], it = items[i];
      if (!it) { if (e.style.display !== 'none') e.style.display = 'none'; continue; }
      if (e.style.display === 'none') e.style.display = '';
      if (e.className !== it[0]) e.className = it[0];
      const css = 'left:' + it[1] + 'px;top:' + it[2] + 'px' + (it[3] !== undefined ? ';width:' + it[3] + 'px;height:' + it[4] + 'px' : '');
      if (e._css !== css) { e._css = css; e.style.cssText = css; }
    }
  }

  function updateObjective() {
    const h = st.hud, Dr = DIR();
    const o = Dr && has(Dr, 'objective') ? safe(() => Dr.objective(), 'objective', null) : null;
    const text = o && o.text ? String(o.text) : '';
    const kind = kindOf(o && o.kind);
    const q = o && o.title && o.title !== text ? o.title : '';
    const key = text + '|' + kind + '|' + q;
    if (key === h.objKey) return;
    const had = !!h.objKey && h.objKey.charAt(0) !== '|';
    h.objKey = key;
    toggle(h.obj, 'hidden', !text);
    if (!text) return;
    h.obj.className = 'su-obj su-ctx ' + kind;
    setText(h.objIco, KIND_ICON[kind]);
    h.objIco.className = 'su-ico k-' + kind;
    setText(h.objQ, q);
    h.objQ.style.display = q ? 'block' : 'none';
    setText(h.objT, text);
    if (had) { h.obj.classList.remove('flash'); void h.obj.offsetWidth; h.obj.classList.add('flash'); }
  }

  function updateButtons() {
    const h = st.hud, Dr = DIR();
    setText(h.jKey, label('journal'));
    setText(h.mKey, label('map'));
    const unread = !!(Dr && has(Dr, 'unread') && safe(() => Dr.unread(), 'unread', false));
    toggle(h.badge, 'hidden', !unread);
    h.jBtn.setAttribute('aria-label', unread ? 'Journal (something new)' : 'Journal');
  }

  function updateVitals(fight, cine) {
    const h = st.hud, c = CMB(), j = c && c.jin, w = WLD();
    if (!j || !(w && w.jin)) { toggle(h.vit, 'show', false); return; }
    const hpMax = j.hpMax || 100, hp = clamp(+j.hp || 0, 0, hpMax);
    const breathOn = !!(c.body && c.body.breath);
    const bMax = j.breathMax || 100, br = clamp(+j.breath || 0, 0, bMax);
    const cMax = Math.max(0, j.chargeMax | 0), ch = clamp(j.charges | 0, 0, cMax);
    const notFull = hp < hpMax - 0.5 || (breathOn && br < bMax - 0.5) || ch < cMax;
    if (fight || j.inCombat || notFull) st.vitT = now();
    // Shown in combat and while anything is short of full; it fades out 1.6 s after calm returns.
    toggle(h.vit, 'show', !cine && now() - st.vitT < 1.6);
    const hk = hp / hpMax;
    h.hpB.style.transform = 'scaleX(' + hk.toFixed(3) + ')';
    h.hpS.style.transform = 'scaleX(' + hk.toFixed(3) + ')';
    toggle(h.hpBar, 'low', hk < 0.3);
    toggle(h.brRow, 'hidden', !breathOn);
    if (breathOn) { h.brB.style.transform = 'scaleX(' + (br / bMax).toFixed(3) + ')'; toggle(h.brBar, 'ex', !!j.exhausted); }
    if (h.pipN !== cMax) {
      h.pipN = cMax;
      h.pips.innerHTML = '';
      for (let i = 0; i < cMax; i++) h.pips.appendChild(el('span', 'su-pip', '<b></b>'));
    }
    const pips = h.pips.children, rk = clamp(+j.rechargeT || 0, 0, 1);
    for (let i = 0; i < pips.length; i++) {
      const full = i < ch, charging = i === ch && ch < cMax;
      toggle(pips[i], 'full', full);
      toggle(pips[i], 'charging', charging);
      pips[i].firstChild.style.transform = 'scaleX(' + (full ? 1 : charging ? rk.toFixed(3) : 0) + ')';
    }
  }

  function updateBout() {
    const h = st.hud, cs = CMB() && CMB().state, b = cs && cs.bout;
    const on = !!(b && !b.done);
    toggle(h.bout, 'hidden', !on);
    if (!on) { toggle(h.count, 'show', false); return; }
    setText(h.boutR, 'Round ' + (b.round | 0) + ' of ' + (b.rounds | 0));
    const tm = Math.max(0, +b.time || 0);
    setText(h.boutC, Math.floor(tm / 60) + ':' + String(Math.floor(tm % 60)).padStart(2, '0'));
    toggle(h.boutC, 'warn', b.phase === 'fight' && tm < 10);
    const o = b.opponent;
    setText(h.boutO, (o && (o.name || (o.enemy && o.enemy.name))) || 'Opponent');
    const ohp = o && o.hpMax ? clamp(o.hp / o.hpMax, 0, 1) : 1;
    h.boutHp.style.transform = 'scaleX(' + ohp.toFixed(3) + ')';
    // Big centre text: the round as it starts, the count on a knockdown, the corner between rounds.
    let big = '', small = '';
    if (b.phase === 'intro') { big = 'Round ' + (b.round | 0); small = b.round >= b.rounds ? 'Final round' : ''; }
    else if (b.phase === 'knockdown' && b.count !== null && b.count !== undefined) {
      big = String(b.count || '');
      small = b.countFor === 'jin' ? 'Get up — tap ' + label('punch') : 'He is down';
    } else if (b.phase === 'corner') { big = ''; small = 'Corner'; }
    else if (b.phase === 'koWait') { big = b.koWho === 'opp' ? 'Knockout' : 'Down'; }
    const key = big + '|' + small;
    if (key !== h.countKey) {
      h.countKey = key;
      h.count.innerHTML = esc(big) + (small ? '<small>' + esc(small) + '</small>' : '');
    }
    toggle(h.count, 'show', !!(big || small));
  }

  /* ── 7. World labels: focus prompt, barks, NPC markers ────────────── */
  function buildLabels() {
    const L = st.labels;
    st.lab = { prompt: el('div', 'su-prompt'), bark: el('div', 'su-bark'), markers: new Map(), promptKey: '', barkKey: '' };
    L.appendChild(st.lab.prompt);
    L.appendChild(st.lab.bark);
  }
  /* World positions come from S.world (CSS px relative to #story-root). They are re-based onto the canvas rect
     main.js laid out (S.main.view), so labels stay on target even if world measured the canvas differently
     (for example the off-screen logical canvas, which has no layout box). */
  let vrNow = null;
  function rebase(p) {
    const mv = S.main && S.main.view;
    if (!p || !mv || !vrNow || !(vrNow.sx > 0)) return p;
    const lx = (p.x - vrNow.x) / vrNow.sx, ly = (p.y - vrNow.y) / (vrNow.sy > 0 ? vrNow.sy : vrNow.sx);
    return { x: mv.x + lx * mv.scale, y: mv.y + ly * mv.scale };
  }
  function place(e, x, y, dy) {
    const css = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y - (dy || 0)) + 'px,0) translate(-50%,-100%)';
    if (e._tf !== css) { e._tf = css; e.style.transform = css; }
  }
  function updateLabels() {
    const lab = st.lab, w = WLD(), Dr = DIR();
    const live = playMode() && !st.titleOn && w && w.loc && !(Dr && Dr.screen);
    const fx = S.fx || {};
    const cine = (+fx.letterbox || 0) > 0.08 || (+fx.fade || 0) > 0.55;
    vrNow = live && has(w, 'viewRect') ? safe(() => w.viewRect(), 'viewRect', null) : null;
    // Focus prompt: "[E] Talk — Mrs. Okafor", with the lock reason under a locked door.
    const pr = live && !cine && has(w, 'prompt') ? safe(() => w.prompt(), 'prompt', null) : null;
    if (pr) {
      const key = (pr.key || label('interact')) + '|' + pr.verb + '|' + pr.label + '|' + (pr.locked || '');
      if (key !== lab.promptKey) {
        lab.promptKey = key;
        lab.prompt.innerHTML = keyCap(pr.key || label('interact')) + ' <span class="verb">' + esc(pr.verb || 'Use') + '</span>' +
          (pr.label ? ' — ' + esc(pr.label) : '') + (pr.locked ? '<span class="lock">' + esc(pr.locked) + '</span>' : '');
      }
      const pp = rebase(pr);
      place(lab.prompt, pp.x, pp.y, 6);
    }
    toggle(lab.prompt, 'show', !!pr);
    // NPC markers (! new quest, ? turn in, … something new to say).
    const marks = live && !cine && has(w, 'markers') ? safe(() => w.markers(), 'markers', []) || [] : [];
    const seen = new Set();
    for (const m of marks) {
      const id = String(m.id);
      seen.add(id);
      let e = lab.markers.get(id);
      if (!e) { e = el('div', 'su-marker'); st.labels.appendChild(e); lab.markers.set(id, e); }
      const glyph = m.marker === '...' ? '…' : String(m.marker);
      if (e.textContent !== glyph) { e.textContent = glyph; e.className = 'su-marker' + (glyph === '?' ? ' q' : glyph === '…' ? ' d' : ''); }
      const mp = rebase(m);
      place(e, mp.x, mp.y, 4);
    }
    for (const [id, e] of lab.markers) if (!seen.has(id)) { if (e.parentNode) e.parentNode.removeChild(e); lab.markers.delete(id); }
    // One bark bubble at a time (barks also play during cutscenes).
    const barks = live && has(w, 'barks') ? safe(() => w.barks(), 'barks', []) || [] : [];
    const b = barks[0];
    if (b) {
      const key = b.id + '|' + b.text;
      if (key !== lab.barkKey) { lab.barkKey = key; lab.bark.textContent = b.text; lab.bark.className = 'su-bark' + (b.jin ? ' jin' : ''); }
      const lift = lab.markers.has(String(b.id)) ? 22 : 8;
      const bp = rebase(b);
      place(lab.bark, bp.x, bp.y, lift);
      toggle(lab.bark, 'show', !(b.t !== undefined && b.t < 0.15));
    } else toggle(lab.bark, 'show', false);
  }

  /* ── 8. Dialogue box ──────────────────────────────────────────────── */
  function buildSay() {
    const box = el('div', 'su-say hidden');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="su-say-name"></div><div class="su-say-text"><span class="shown"></span><span class="rest"></span></div>' +
      '<div class="su-choices"></div><div class="su-choice-help su-hint"></div><div class="su-say-more">▼</div>';
    st.L.say.appendChild(box);
    const q = (s) => box.querySelector(s);
    st.say = { box, name: q('.su-say-name'), shownEl: q('.shown'), restEl: q('.rest'), choices: q('.su-choices'), help: q('.su-choice-help'),
      more: q('.su-say-more'), id: null, shown: -1, choicesOn: false, readyAt: 0, sel: -1, offAt: 0, typeAt: 0 };
    box.addEventListener('click', (ev) => {
      const Dr = DIR();
      if (!Dr || !Dr.dialog) return;
      const c = ev.target && ev.target.closest ? ev.target.closest('[data-c]') : null;
      if (c) { pickChoice(+c.getAttribute('data-c')); return; }
      if (Dr.dialog.choices && Dr.dialog.shown >= Dr.dialog.text.length) return;
      safe(() => Dr.advance(), 'advance');
    });
    box.addEventListener('mouseover', (ev) => {
      const Dr = DIR(), l = Dr && Dr.dialog;
      const c = ev.target && ev.target.closest ? ev.target.closest('[data-c]') : null;
      if (!c || !l || !l.choices) return;
      const i = +c.getAttribute('data-c');
      if (l.choices[i] && l.sel !== i) { l.sel = i; sound('uiMove'); }
    });
  }
  function pickChoice(i) {
    const Dr = DIR(), l = Dr && Dr.dialog;
    if (!l || !l.choices) return;
    if (l.shown < l.text.length) { safe(() => Dr.advance(), 'advance'); return; }
    const c = l.choices[i];
    if (!c) return;
    if (!c.enabled) { sound('uiBack'); l.sel = i; return; }
    safe(() => Dr.choose(i), 'choose');
  }
  function updateSay() {
    const s = st.say, Dr = DIR(), l = Dr && Dr.dialog;
    const show = !!l && !l.done && playMode() && !st.titleOn && !Dr.screen;
    if (!show) {
      if (s.id !== null) { s.id = null; toggle(s.box, 'show', false); s.offAt = now(); }
      else if (!s.box.classList.contains('hidden') && now() - s.offAt > 0.25) toggle(s.box, 'hidden', true);
      return;
    }
    const text = String(l.text || '');
    if (l.id !== s.id) {
      s.id = l.id; s.shown = -1; s.choicesOn = false; s.sel = -1;
      const thought = !!l.thought, narration = !!l.narration || (!l.name && !thought);
      s.box.className = 'su-say show' + (thought ? ' thought' : '') + (narration ? ' narration' : '');
      const plate = !thought && !narration && l.name;
      s.name.style.display = plate ? '' : 'none';
      setText(s.name, plate ? l.name : '');
      toggle(s.name, 'jin', l.speaker === 'jin' || l.name === 'Jin');
      s.choices.innerHTML = '';
      toggle(s.choices, 'two', false);
      setHtml(s.help, '');
    }
    const len = text.length, shown = clamp(l.shown | 0, 0, len);
    if (shown !== s.shown) {
      // Typewriter: the unrevealed rest keeps its space, so the box never reflows while typing.
      if (shown > s.shown && s.shown >= 0 && !l.thought && !l.narration && now() - s.typeAt > 0.055 && /\S/.test(text.charAt(shown - 1))) { s.typeAt = now(); sound('type', { vol: 0.35 }); }
      s.shown = shown;
      s.shownEl.textContent = text.slice(0, shown);
      s.restEl.textContent = text.slice(shown);
    }
    const ready = shown >= len;
    toggle(s.more, 'on', ready && !l.choices);
    if (l.choices && ready && !s.choicesOn) {
      s.choicesOn = true;
      s.readyAt = now();
      s.choices.innerHTML = l.choices.map((c, i) => '<button type="button" class="su-choice' + (c.enabled ? '' : ' dis') + '" data-c="' + i + '"' +
        (c.enabled ? '' : ' aria-disabled="true"') + '><span class="n">' + (i + 1) + '</span><span>' + esc(c.text) +
        (!c.enabled && c.hint ? '<span class="why">' + esc(c.hint) + '</span>' : '') + '</span></button>').join('');
      setHtml(s.help, keyCap('↑↓') + ' choose  ' + keyHtml('interact') + ' answer');
      // Three or more short answers sit in two columns (column-major, so ↑↓ still walks them in order):
      // a tall single list covered the speakers standing above the box.
      const n = l.choices.length;
      const two = n >= 3 && l.choices.every((c) => String(c.text || '').length <= 44 && (c.enabled || !c.hint));
      toggle(s.choices, 'two', two);
      s.choices.style.gridTemplateRows = two ? 'repeat(' + Math.ceil(n / 2) + ', auto)' : '';
      toggle(s.box, 'asks', true);
      s.sel = -1;
    }
    if (l.choices && s.choicesOn && l.sel !== s.sel) {
      s.sel = l.sel;
      const bs = s.choices.children;
      for (let i = 0; i < bs.length; i++) toggle(bs[i], 'sel', i === l.sel);
    }
  }
  // Choices are driven here (the director leaves them to the UI when S.ui exists); plain lines advance in the director.
  function sayKey(k) {
    const Dr = DIR(), l = Dr && Dr.dialog;
    if (!l || !l.choices || l.done) return false;
    // A key pressed to close the previous line must not also answer the question that replaced it.
    if ((+l.t || 0) < 0.08) return true;
    const ready = l.shown >= l.text.length;
    if (isUp(k)) { if (ready && has(Dr, 'moveSel')) Dr.moveSel(-1); return true; }
    if (isDown(k)) { if (ready && has(Dr, 'moveSel')) Dr.moveSel(1); return true; }
    // An answer counts only once the options have been on screen for a moment (mashing through lines must not pick one).
    const settled = ready && st.say.choicesOn && st.say.id === l.id && now() - st.say.readyAt >= 0.3;
    const d = digitOf(k);
    if (d) { if (settled) pickChoice(d - 1); return true; }
    if (isConfirm(k)) {
      if (!ready) safe(() => Dr.advance(), 'advance');
      else if (settled) pickChoice(l.sel);
      return true;
    }
    return false;
  }

  /* ── 9. Title cards (A.card) ──────────────────────────────────────── */
  function buildCard() {
    const e = el('div', 'su-card', '<h2></h2><div class="rule"></div><p></p>');
    st.L.card.appendChild(e);
    st.card = { el: e, h: e.querySelector('h2'), p: e.querySelector('p'), src: null };
  }
  function updateCard() {
    const c = st.card, Dr = DIR();
    const cur = playMode() && Dr && Dr.card && !Dr.screen ? Dr.card : null;
    if (cur !== c.src) {
      c.src = cur;
      if (cur) { setText(c.h, cur.title); setText(c.p, cur.sub); c.p.style.display = cur.sub ? '' : 'none'; }
    }
    // Fade in at once; fade out over the card's last half second.
    const on = !!cur && !(cur.seconds && cur.t > cur.seconds - 0.5 && !cur.skip);
    toggle(c.el, 'show', on);
  }

  /* ── 10. Director screens: chapter card, completion, ending, credits ── */
  function linesOf(arr) {
    return (Array.isArray(arr) ? arr : arr ? [arr] : []).map((x) => (typeof x === 'string' ? x : (x && (x.text || x.title)) || '')).filter(Boolean);
  }
  function showScreen(src, manual, onDone) {
    if (st.screen) hideScreen();
    const kind = src.kind || 'chapter';
    const e = el('div', 'su-screen ' + kind);
    e.setAttribute('role', 'dialog');
    e.setAttribute('aria-label', src.title || kind);
    const scr = st.screen = { src, kind, el: e, manual: !!manual, onDone: onDone || null, t0: now(), reveal: 1, cards: [], lastReveal: now(), roll: null };
    e.innerHTML = safe(() => screenHtml(scr), 'screen ' + kind, '<h1>' + esc(src.title || '') + '</h1>');
    e.addEventListener('click', () => screenAdvance(true));
    st.L.screen.appendChild(e);
    void e.offsetWidth;
    e.classList.add('show');
    if (kind === 'credits') scr.roll = e.querySelector('.su-roll');
    if (kind === 'ending') scr.paras = e.querySelectorAll('.card-text p');
    sound(kind === 'completion' ? 'quest' : 'ui', { vol: 0.6 });
    return scr;
  }
  function hideScreen() {
    const scr = st.screen;
    if (!scr) return;
    st.screen = null;
    scr.el.classList.remove('show');
    scr.el.style.pointerEvents = 'none';
    st.dying.push({ el: scr.el, at: now() + 0.7 });
  }
  function screenHtml(scr) {
    const s = scr.src, cont = '<div class="cont"></div>';
    if (scr.kind === 'chapter') {
      const when = [s.date, s.place].filter(Boolean).join('  ·  ');
      return '<div class="su-kicker">' + esc(+s.n === SANDBOX ? 'Sandbox' : 'Chapter ' + s.n) + '</div><h1>' + esc(s.title || '') + '</h1>' +
        (when ? '<div class="when">' + esc(when) + '</div>' : '') + '<div class="rule"></div><div class="lines">' +
        linesOf(s.lines || s.card).map((t, i) => '<p style="animation-delay:' + (0.5 + i * 0.6).toFixed(1) + 's">' + esc(t) + '</p>').join('') + '</div>' + cont;
    }
    if (scr.kind === 'completion') return completionHtml(s.data || s, s) + cont;
    if (scr.kind === 'ending') {
      scr.cards = linesOf(s.cards || s.lines);
      return '<div class="su-kicker">Ending</div><h1>' + esc(s.title || 'The End') + '</h1><div class="rule"></div><div class="card-text">' +
        scr.cards.map((t) => '<p>' + esc(t) + '</p>').join('') + '</div><div class="count"></div>' + cont;
    }
    if (scr.kind === 'credits') return creditsHtml(s) + cont;
    // 'continued' and anything else: a title with lines.
    return (s.n !== undefined ? '<div class="su-kicker">' + esc(chapterName(s.n)) + '</div>' : '') + '<h1>' + esc(s.title || '') + '</h1><div class="rule"></div><div class="lines">' +
      linesOf(s.lines).map((t) => '<p>' + esc(t) + '</p>').join('') + '</div>' + cont;
  }
  function completionHtml(d, s) {
    d = d || {};
    const n = d.n !== undefined ? d.n : s.n;
    const ev = d.evidence || { found: 0, total: 0 }, sd = d.sides || { done: 0, total: 0, list: [] };
    const nx = has(story, 'nextChapter') ? safe(() => story.nextChapter(+n), 'nextChapter', null) : null;
    const next = +n === SANDBOX ? 'Back to the title' : nx !== null && nx !== undefined ? 'Next: ' + chapterName(nx) : +n >= 10 ? 'Next: the ending' : '';
    const sideList = (sd.list || []).map((q) => '<li class="' + (q.state === 'done' ? '' : 'miss') + '">' + (q.state === 'done' ? '✓ ' : q.state === 'failed' ? '✕ ' : '— ') +
      esc(q.title) + (q.state === 'done' ? '' : q.state === 'failed' ? ' (missed)' : q.state === 'active' ? ' (unfinished)' : ' (not found)') + '</li>').join('');
    const choices = (d.choices || []).map((c) => '<li>• ' + esc(typeof c === 'string' ? c : c.text) + '</li>').join('');
    return '<div class="su-kicker">' + esc((+n === SANDBOX ? 'Sandbox' : 'Chapter ' + n) + ' complete') + '</div><h1>' + esc(d.title || s.title || '') + '</h1>' +
      ((d.date || d.place) ? '<div class="when">' + esc([d.date, d.place].filter(Boolean).join('  ·  ')) + '</div>' : '') +
      '<div class="su-stats">' +
        '<div class="su-stat"><b>' + (ev.found | 0) + ' / ' + (ev.total | 0) + '</b><span>Evidence found</span></div>' +
        '<div class="su-stat"><b>' + (sd.done | 0) + ' / ' + (sd.total | 0) + '</b><span>Optional quests</span></div>' +
        '<div class="su-stat"><b>' + esc(d.timeText || fmtTime(d.time || 0)) + '</b><span>Time</span></div>' +
      '</div>' +
      '<div class="su-done-cols"><div><h3>Choices you made</h3><ul>' + (choices || '<li class="miss">No decisions this chapter.</li>') + '</ul></div>' +
        '<div><h3>Optional quests</h3><ul>' + (sideList || '<li class="miss">None in this chapter.</li>') + '</ul></div></div>' +
      (d.summary && d.summary.length ? '<div class="su-done-sum">' + linesOf(d.summary).map((t) => '<p>' + esc(t) + '</p>').join('') + '</div>' : '') +
      (next ? '<div class="su-done-next">' + esc(next) + '</div>' : '');
  }
  const ENDING_NAMES = { champion: 'The Champion', own_name: 'His Own Name' };
  function creditsHtml(s) {
    const by = 'Story Mode by Joohyun Lee and Elliot Jeong';
    const extra = linesOf(s.lines).filter((t) => !/^inside the impact$/i.test(t) && !/^story mode$/i.test(t) && t.indexOf('Joohyun Lee and Elliot Jeong') < 0);
    const ending = s.ending && ENDING_NAMES[s.ending] ? ENDING_NAMES[s.ending] : '';
    return '<div class="su-roll">' +
      '<div class="big">Inside the Impact</div><div class="mid">Story Mode</div><div class="gap"></div>' +
      '<div class="by">' + esc(by) + '</div><div class="gap"></div>' +
      extra.map((t) => '<div class="by">' + esc(t) + '</div>').join('') +
      (ending ? '<div class="sm">Your ending</div><div class="mid">' + esc(ending) + '</div><div class="gap"></div>' : '') +
      '<div class="sm">Calder, 1994 – 1997</div><div class="gap"></div><div class="by">Thank you for playing.</div></div>';
  }
  function screenMin(scr) { const s = scr.src; return s.minTime !== undefined ? +s.minTime : 1; }
  function screenT(scr) { return scr.manual ? now() - scr.t0 : +scr.src.t || 0; }
  // Click or key on a screen. Ending cards reveal one by one first; then the director (or a manual screen) closes it.
  function screenAdvance(fromClick) {
    const scr = st.screen;
    if (!scr) return false;
    if (scr.kind === 'ending' && scr.reveal < scr.cards.length) { revealNext(scr); return true; }
    if (scr.manual) {
      if (now() - scr.t0 < screenMin(scr)) return true;
      const cb = scr.onDone;
      hideScreen();
      sound('ui');
      if (cb) safe(cb, 'screen done');
      return true;
    }
    if (fromClick) { const Dr = DIR(); if (Dr && has(Dr, 'dismiss')) safe(() => Dr.dismiss(), 'dismiss'); }
    return true;
  }
  function revealNext(scr) { scr.reveal = Math.min(scr.cards.length, scr.reveal + 1); scr.lastReveal = now(); sound('paper', { vol: 0.4 }); }
  function updateScreens() {
    const Dr = DIR();
    const src = playMode() && Dr && Dr.screen ? Dr.screen : null;
    const cur = st.screen;
    if (src && (!cur || cur.src !== src)) showScreen(src, false);
    else if (!src && cur && !cur.manual) hideScreen();
    for (let i = st.dying.length - 1; i >= 0; i--) {
      const d = st.dying[i];
      if (now() >= d.at) { if (d.el.parentNode) d.el.parentNode.removeChild(d.el); st.dying.splice(i, 1); }
    }
    const scr = st.screen;
    if (!scr) return;
    const t = screenT(scr), ready = t >= screenMin(scr);
    const contEl = scr.el.querySelector('.cont');
    if (scr.kind === 'ending') {
      // Keep the director from closing the ending while cards are still hidden (it closes on interact after minTime).
      if (scr.reveal < scr.cards.length) {
        if (!scr.manual) scr.src.minTime = Math.max(+scr.src.minTime || 0, t + 0.6);
        if (now() - scr.lastReveal > 6.5) revealNext(scr);
      }
      const ps = scr.paras || [];
      for (let i = 0; i < ps.length; i++) { toggle(ps[i], 'on', i < scr.reveal); toggle(ps[i], 'old', i < scr.reveal - 1); }
      setText(scr.el.querySelector('.count'), scr.cards.length > 1 ? scr.reveal + ' / ' + scr.cards.length : '');
    }
    if (scr.roll) {
      // Credits roll from below the screen to above it over ~34 s.
      const H = scr.el.clientHeight || 360, rh = scr.roll.offsetHeight || 400;
      const y = -((now() - scr.t0) / 34) * (H + rh);
      scr.roll.style.transform = 'translateY(' + Math.round(Math.max(y, -(H + rh))) + 'px)';
    }
    if (contEl) {
      const more = scr.kind === 'ending' && scr.reveal < scr.cards.length;
      const anyKey = scr.kind === 'chapter' || scr.kind === 'credits' || scr.kind === 'continued' || !!scr.src.anyKey;
      setText(contEl, more ? label('interact') + '  ·  Next' : anyKey ? 'Press any key' : label('interact') + '  ·  Continue');
      toggle(contEl, 'on', ready || more);
    }
  }
  function screenKey(k) {
    const scr = st.screen;
    if (!scr) return false;
    if (scr.kind === 'ending' && scr.reveal < scr.cards.length) { if (isOk(k)) revealNext(scr); return true; }
    if (scr.manual) { if (isOk(k) || isBack(k) || scr.kind === 'chapter') screenAdvance(false); return true; }
    return true;   // the director reads its own keys for screens
  }
  UI.chapterCard = function (def, opts) {
    if (S.headless || !st.mounted || !def) return null;
    opts = opts || {};
    const src = { kind: 'chapter', n: def.id !== undefined ? def.id : def.n, title: def.title, date: def.date || '', place: def.place || '',
      lines: def.card || def.lines || [], minTime: opts.minTime === undefined ? 1.2 : opts.minTime, anyKey: true };
    return safe(() => showScreen(src, true, opts.onDone), 'chapterCard', null) ? { close: () => { if (st.screen && st.screen.src === src) hideScreen(); } } : null;
  };
  UI.chapterComplete = function (data, opts) {
    if (S.headless || !st.mounted || !data) return null;
    opts = opts || {};
    const src = { kind: 'completion', n: data.n, title: data.title, data, minTime: opts.minTime === undefined ? 1.5 : opts.minTime };
    return safe(() => showScreen(src, true, opts.onDone), 'chapterComplete', null) ? { close: () => { if (st.screen && st.screen.src === src) hideScreen(); } } : null;
  };

  /* ── 11. Journal: Quests | Evidence | Memories | People | Map | Training ── */
  const TABS = [['quests', 'Quests'], ['evidence', 'Evidence'], ['memories', 'Memories'], ['people', 'People'], ['map', 'Map'], ['training', 'Training']];
  const TAB_KIND = { quests: 'quests', evidence: 'evidence', memories: 'memories', people: 'people' };
  const EMPTY = { quests: 'No quests yet.', evidence: 'Nothing found yet. Examine what looks out of place: papers, photographs, things people left behind.',
    memories: 'No memories yet.', people: 'No one yet.', training: 'No drills to show.', map: 'No places on the map yet.' };
  function tabUnread(tab) {
    const k = TAB_KIND[tab], m = k && G()[k];
    if (!m) return false;
    for (const id in m) if (m[id] && m[id].seen === false) return true;
    return false;
  }
  function chapterOrder(items) {
    items.sort((a, b) => (b.at - a.at) || (a.order - b.order));
    for (const it of items) it.group = chapterName(it.at);
    return items;
  }

  function questItems() {
    const Dr = DIR();
    const list = Dr && has(Dr, 'quests') ? safe(() => Dr.quests(), 'quests', []) || [] : [];
    const qs = G().quests || {};
    const at = (id) => (qs[id] && +qs[id].at) || 0;
    const groups = [
      ['Main', (x) => x.state === 'active' && kindOf(x.kind) === 'main'],
      ['Optional', (x) => x.state === 'active' && kindOf(x.kind) !== 'main'],
      ['Completed', (x) => x.state === 'done'],
      ['Closed', (x) => x.state === 'failed'],
    ];
    const out = [];
    for (const [g, f] of groups) {
      for (const x of list.filter(f).sort((a, b) => at(b.id) - at(a.id))) {
        const kind = kindOf(x.kind);
        out.push({ id: x.id, group: g, text: x.title || x.id, kind, icon: KIND_ICON[kind], unread: x.seen === false, done: x.state !== 'active', q: x });
      }
    }
    return out;
  }
  function questDetail(it) {
    const x = it.q, kind = it.kind, steps = x.steps || [];
    const stateWord = x.state === 'done' ? 'Completed' : x.state === 'failed' ? (kind === 'missable' ? 'Missed' : 'Closed') : 'In progress';
    const upto = x.state === 'done' ? steps.length - 1 : x.step | 0;
    let lis = '';
    steps.forEach((s, i) => {
      if (i > upto) return;   // later steps stay hidden: they would spoil what happens next
      const cls = x.state === 'done' || i < (x.step | 0) ? 'done' : x.state === 'active' && i === (x.step | 0) ? 'cur' : '';
      lis += '<li class="' + cls + '"><span class="m">' + (cls === 'cur' ? '▸' : cls === 'done' ? '✓' : '·') + '</span>' + esc(s.text) + '</li>';
    });
    const def = has(story, 'questDef') ? safe(() => story.questDef(x.id), 'questDef', null) : null;
    const reward = def && typeof def.reward === 'string' ? def.reward : '';
    return '<h3><span class="su-ico k-' + kind + '">' + KIND_ICON[kind] + '</span> ' + esc(x.title || x.id) + '</h3>' +
      '<div class="sub">' + esc(KIND_NAME[kind]) + ' · ' + esc(stateWord) + (x.giver ? ' · ' + esc(personName(x.giver)) : '') + '</div>' +
      (x.summary ? '<p>' + esc(x.summary) + '</p>' : '') +
      (lis ? '<ul class="q-steps">' + lis + '</ul>' : '') +
      (x.state === 'failed' ? '<p class="su-hint">That moment has passed.</p>' : '') +
      (reward && x.state === 'done' ? '<p class="proves">' + esc(reward) + '</p>' : '');
  }

  function evidenceItems() {
    const ev = G().evidence || {}, cur = G().chapter | 0;
    return chapterOrder(Object.keys(ev).map((id, i) => {
      const e = ev[id] || {}, at = e.at === undefined || e.at === null ? cur : +e.at;
      const def = defOf('evidence', id, at) || {};
      return { id, at, order: i, text: def.title || id, tag: EV_TAG[def.kind] || 'ITEM', unread: e.seen === false, def };
    }));
  }
  function docPages(def) {
    if (!def) return [];
    if (Array.isArray(def.pages) && def.pages.length) return def.pages.map(String);
    return def.text ? [String(def.text)] : [];
  }
  function evidenceDetail(it, prim) {
    const d = it.def || {}, cd = chapterDef(it.at);
    const total = cd && cd.evidence ? Object.keys(cd.evidence).length : 0;
    const found = cd && cd.evidence ? Object.keys(cd.evidence).filter((id) => G().evidence && G().evidence[id]).length : 0;
    const pages = docPages(d);
    const preview = pages.length ? pages[0] : '';
    const short = preview.length > 420 ? preview.slice(0, 400).replace(/\s+\S*$/, '') + ' …' : preview;
    return '<h3>' + esc(d.title || it.id) + '</h3>' +
      '<div class="sub">' + esc([EV_TAG[d.kind] ? d.kind : 'item', d.date].filter(Boolean).join(' · ')) + '</div>' +
      (short ? '<p style="white-space:pre-wrap">' + esc(short) + '</p>' : '') +
      (d.proves ? '<div class="proves">' + esc(d.proves) + '</div>' : '') +
      (prim ? '<div class="act">' + btn(prim.text, 'primary', prim) + (pages.length > 1 ? '<span class="su-hint">' + pages.length + ' pages</span>' : '') + '</div>' +
        (prim.enabled === false ? '<p class="su-hint">' + esc(prim.why) + '</p>' : '') : '') +
      (total ? '<p class="su-hint" style="margin-top:1em">' + esc(chapterName(it.at)) + ': ' + found + ' of ' + total + ' found.</p>' : '');
  }

  function memoryItems() {
    const ms = G().memories || {}, cur = G().chapter | 0;
    return chapterOrder(Object.keys(ms).map((id, i) => {
      const m = ms[id] || {}, at = m.at === undefined || m.at === null ? cur : +m.at;
      const def = defOf('memories', id, at) || {};
      return { id, at, order: i, text: def.title || id, unread: m.seen === false, def };
    }));
  }
  function memoryDetail(it) {
    const d = it.def || {};
    const paras = String(d.text || '').split(/\n\s*\n/).filter((p) => p.trim());
    return '<h3>' + esc(d.title || it.id) + '</h3>' + (d.when ? '<div class="sub">' + esc(d.when) + '</div>' : '') +
      '<div class="su-memory">' + (paras.length ? paras.map((p) => '<p>' + esc(p) + '</p>').join('') : '<p>…</p>') + '</div>';
  }

  function peopleItems() {
    const ps = G().people || {};
    return Object.keys(ps).filter((id) => ps[id] && ps[id].met !== false).map((id, i) => {
      const def = has(story, 'person') ? safe(() => story.person(id), 'person', null) : null;
      return { id, order: i, text: (def && def.name) || personName(id), unread: ps[id].seen === false, def: def || { name: personName(id) } };
    });
  }
  // A note shows once it is learned: its id was recorded by A.meet, or its when(G) holds; notes with neither always show.
  function learnedNotes(id, def) {
    const rec = (G().people && G().people[id]) || { notes: [] };
    const got = rec.notes || [];
    const out = [];
    for (const n of (def && def.notes) || []) {
      if (!n) continue;
      if (typeof n === 'string') { out.push({ text: n }); continue; }
      let ok;
      if (n.id !== undefined && got.indexOf(n.id) >= 0) ok = true;
      else if (typeof n.when === 'function') ok = !!safe(() => n.when(G(), S), 'note when', false);
      else ok = n.id === undefined;
      if (ok && n.text) out.push({ id: n.id, text: typeof n.text === 'function' ? safe(() => n.text(G()), 'note text', '') : n.text, latest: n.id !== undefined && got[got.length - 1] === n.id });
    }
    return out;
  }
  function peopleDetail(it) {
    const d = it.def || {};
    const notes = learnedNotes(it.id, d);
    return '<div class="su-person"><canvas class="su-portrait" width="44" height="58" aria-hidden="true"></canvas><div><h3>' + esc(d.name || it.text) + '</h3>' +
      (d.role ? '<div class="sub">' + esc(d.role) + '</div>' : '') + '</div></div>' +
      (notes.length ? notes.map((n) => '<div class="note' + (n.latest && it.fresh ? ' new' : '') + '">' + esc(n.text) + '</div>').join('') : '<p class="su-hint">Nothing more known yet.</p>');
  }
  function drawPortrait(w) {
    const cv = w.el.querySelector('canvas.su-portrait');
    if (!cv) return;
    const it = w.items[w.sel[w.tab] | 0];
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx || !it) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!S.art || !has(S.art, 'drawFigure')) { cv.style.display = 'none'; return; }
    try { S.art.drawFigure(ctx, cv.width / 2, cv.height - 3, 1, 'idle', 0.6, (it.def && it.def.look) || 'man', { shadow: true }); }
    catch (err) { cv.style.display = 'none'; warnOnce('portrait', 'portrait failed: ' + (err && err.message)); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  /* World map: nodes of the current chapter (ChapterDef.mapNodes) over a folded map of Calder.
     Node coordinates may be fractions (0..1) or map units (fitted to a 640x360 sheet). */
  let MAP_SVG = null;
  function mapSvg() {
    if (MAP_SVG) return MAP_SVG;
    let grid = '';
    for (let x = 40; x < 640; x += 40) grid += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="360"/>';
    for (let y = 40; y < 360; y += 40) grid += '<line x1="0" y1="' + y + '" x2="640" y2="' + y + '"/>';
    const river = 'M0 296 C 80 280, 160 304, 250 292 S 420 270, 510 288 S 600 298, 640 290';
    MAP_SVG = '<svg viewBox="0 0 640 360" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect width="640" height="360" fill="#d3c9aa"/>' +
      '<g stroke="#b8ab86" stroke-width="1" opacity=".5">' + grid + '</g>' +
      '<g stroke="#a99a70" stroke-width="3" fill="none" opacity=".7"><path d="M0 120 L640 150"/><path d="M0 214 L640 226"/><path d="M180 0 L210 296"/><path d="M430 0 L410 300"/><path d="M560 20 L600 290"/></g>' +
      '<path d="' + river + ' L640 360 L0 360 Z" fill="#8ea2a6"/>' +
      '<path d="' + river + '" fill="none" stroke="#5c7176" stroke-width="2"/>' +
      '<g stroke="#5c5440" stroke-width="3"><path d="M300 288 L300 360"/><path d="M308 288 L308 360"/></g>' +
      '<g stroke="#000" stroke-opacity=".08" stroke-width="2"><line x1="213" y1="0" x2="213" y2="360"/><line x1="426" y1="0" x2="426" y2="360"/><line x1="0" y1="180" x2="640" y2="180"/></g>' +
      '<g fill="#3d3524" opacity=".45"><path d="M600 26 L606 40 L600 36 L594 40 Z"/></g>' +
      '</svg>';
    return MAP_SVG;
  }
  function nodeFit(nodes) {
    const xs = nodes.map((n) => +n.x || 0), ys = nodes.map((n) => +n.y || 0);
    const mx = Math.max(0, ...xs), my = Math.max(0, ...ys);
    if (mx <= 1 && my <= 1) return (n) => ({ x: clamp((+n.x || 0) * 100, 5, 95), y: clamp((+n.y || 0) * 100, 7, 90) });
    const mw = Math.max(640, mx + 30), mh = Math.max(360, my + 30);
    return (n) => ({ x: clamp((+n.x || 0) / mw * 100, 5, 95), y: clamp((+n.y || 0) / mh * 100, 7, 90) });
  }
  function objectiveLocs() {
    const set = new Set(), Dr = DIR(), g = G();
    const o = Dr && has(Dr, 'objective') ? safe(() => Dr.objective(), 'objective', null) : null;
    if (o && o.target && o.target.loc) set.add(o.target.loc);
    for (const id in g.quests || {}) {
      const q = g.quests[id];
      if (!q || q.state !== 'active') continue;
      const def = has(story, 'questDef') ? safe(() => story.questDef(id), 'questDef', null) : null;
      const steps = def && Array.isArray(def.steps) ? def.steps : null;
      const s = steps && steps.length ? steps[clamp(q.step | 0, 0, steps.length - 1)] : null;
      if (s && s.target && s.target.loc) set.add(s.target.loc);
    }
    return set;
  }
  function mapItems() {
    const nodes = has(story, 'mapNodes') ? safe(() => story.mapNodes(), 'mapNodes', []) || [] : [];
    const g = G(), w = WLD(), here = w && w.locId, objs = objectiveLocs();
    return nodes.filter((n) => n && (typeof n.when !== 'function' || safe(() => !!n.when(g, S), 'node when', false))).map((n) => {
      const locs = Array.isArray(n.locs) ? n.locs.slice() : n.loc ? [n.loc] : [];
      return { id: n.id, text: n.name || n.id, node: n, locs, visited: locs.some((id) => g.visited && g.visited[id]),
        here: locs.indexOf(here) >= 0, obj: locs.some((id) => objs.has(id)) };
    }).sort((a, b) => ((+a.node.x || 0) - (+b.node.x || 0)) || ((+a.node.y || 0) - (+b.node.y || 0)));
  }
  function gate(v, def) {
    if (typeof v === 'function') v = safe(() => v(G(), S), 'travel gate', false);
    if (v === undefined) return def;
    if (v === true) return true;
    if (typeof v === 'string' && v) return v;
    return false;
  }
  function travelDest(it) {
    const a = it.node.arrive;
    if (a && a.loc) return a;
    return { loc: it.locs[0], x: a && a.x !== undefined ? a.x : undefined, face: a && a.face };
  }
  // true, or why Jin cannot travel to this node right now.
  function travelWhy(it) {
    const Dr = DIR(), w = WLD();
    if (it.here) return 'Jin is already here.';
    if (!it.locs.length) return 'There is nowhere to go there.';
    const ch = chapterDef();
    const chGate = gate(ch && ch.travel, true);
    if (chGate !== true) return typeof chGate === 'string' ? chGate : 'Not now. There is somewhere Jin needs to be.';
    if (it.node.locked !== undefined) {
      const lk = typeof it.node.locked === 'function' ? safe(() => it.node.locked(G(), S), 'node locked', false) : it.node.locked;
      if (lk) return typeof lk === 'string' ? lk : 'Jin cannot get there right now.';
    }
    const t = gate(it.node.travel, false);
    if (t !== true) return typeof t === 'string' ? t : (it.visited ? 'Jin has no way to get there from here right now.' : 'Jin has not found his way there yet.');
    if (fightOn()) return 'Not in the middle of a fight.';
    if (S.activities && S.activities.running) return 'Finish what Jin is doing first.';
    if (Dr && (Dr.dialog || Dr.screen || Dr.card || Dr.doc || Dr.endReq || (Dr.running && Dr.busy))) return 'Not while something is happening.';
    if (w && w.transitioning) return 'Wait until Jin arrives.';
    const dest = travelDest(it);
    if (!dest.loc || !(has(story, 'location') && safe(() => story.location(dest.loc), 'location', null))) return 'That place is not in this build yet.';
    return true;
  }
  function doTravel(it) {
    const dest = travelDest(it), w = WLD(), Dr = DIR();
    closeAll('silent');
    const L = safe(() => story.location(dest.loc), 'location', null);
    const pt = L && L.points ? L.points.arrive || L.points.start || null : null;
    const x = dest.x !== undefined ? dest.x : pt && pt.x !== undefined ? pt.x : undefined;
    S.events.emit('travel', { id: it.id, loc: dest.loc });
    if (has(w, 'travel')) safe(() => w.travel(dest.loc, x, { face: dest.face }), 'travel');
    else if (Dr && has(Dr, 'enterWorld')) safe(() => Dr.enterWorld(dest.loc, x === undefined ? null : x, { face: dest.face }), 'enterWorld');
  }
  function mapDetail(it, prim) {
    const n = it.node, g = G();
    const status = it.here ? 'You are here' : it.visited ? 'Visited' : 'Not visited yet';
    const seenPlaces = it.locs.filter((id) => g.visited && g.visited[id]);
    const more = it.locs.length - seenPlaces.length;
    return '<h3>' + esc(it.text) + '</h3><div class="sub">' + esc([n.district || n.area || '', status].filter(Boolean).join(' · ')) + '</div>' +
      (n.text || n.desc ? '<p>' + esc(n.text || n.desc) + '</p>' : '') +
      (it.obj ? '<p class="proves">◆ Something you are looking for is here.</p>' : '') +
      (seenPlaces.length ? '<ul class="q-steps">' + seenPlaces.map((id) => '<li><span class="m">•</span>' + esc(locName(id)) + '</li>').join('') + '</ul>' : '') +
      (more > 0 && it.visited ? '<p class="su-hint">' + more + ' more place' + (more > 1 ? 's' : '') + ' Jin has not been inside.</p>' : '') +
      (prim ? '<div class="act">' + btn(prim.text, 'primary', prim) + '</div>' + (prim.enabled === false ? '<p class="su-hint">' + esc(prim.why) + '</p>' : '') : '');
  }
  function mapBody(items, sel, cur, prim) {
    const fit = nodeFit(items.map((i) => i.node));
    let nodes = '';
    items.forEach((it, i) => {
      const p = fit(it.node);
      nodes += '<button type="button" class="su-node' + (it.visited || it.here ? '' : ' unvisited') + (it.here ? ' here' : '') + (it.obj ? ' obj' : '') + (i === sel ? ' sel' : '') +
        '" data-a="item" data-i="' + i + '" style="left:' + p.x.toFixed(2) + '%;top:' + p.y.toFixed(2) + '%" aria-label="' + esc(it.text) + '"><span class="pin"></span><span class="lab">' + esc(it.text) + '</span></button>';
    });
    return '<div class="su-mapwrap"><div class="su-map">' + mapSvg() + nodes +
      '<div class="su-map-legend"><span style="color:#d8402f">●</span> you · ◇ objective · ○ not visited</div></div>' +
      '<div class="su-detail" data-keep-scroll="m' + esc(cur ? cur.id : '') + '">' + (cur ? mapDetail(cur, prim) : '<div class="su-empty">' + esc(EMPTY.map) + '</div>') + '</div></div>';
  }

  function pipsHtml(n, max) {
    let h = '<span class="su-pipsl">';
    for (let i = 0; i < (max || 3); i++) h += '<i class="' + (i < n ? 'on' : '') + '"></i>';
    return h + '</span>';
  }
  function trainingItems() {
    const A = S.activities;
    const list = A && has(A, 'drillList') ? safe(() => A.drillList(), 'drillList', []) || [] : [];
    const out = list.filter(Boolean).map((d) => ({ id: d.key, text: d.name, group: 'Drills', tagHtml: pipsHtml(d.level | 0, d.max || 3), info: d }));
    out.push({ id: '_tech', text: 'Techniques Jin knows', group: 'Jin', tech: true });
    return out;
  }
  const TECH = [
    ['jab', 'Jab · cross · hook', (s) => (s.hook ? 'Press {punch} again and again: jab, cross, then hook. Stop after any of them and move.' : 'Press {punch} twice: jab, then cross. Stop after either and move.')],
    ['dash', 'Dash', () => '{dash} bursts the way Jin is moving. Two charges; they come back one at a time.'],
    ['backdash', 'Backdash', () => 'Hold away and press {dash} while guarding or punching. A cross can follow straight away.'],
    ['airdash', 'Air dash', () => '{dash} in the air, once per jump.'],
    ['guard', 'Guard', () => 'Hold {down} while standing still.'],
    ['slip', 'Slip', () => '{slip} just before a strike lands. Too early or too late leaves Jin open.'],
    ['counter', 'Counter-cross', () => 'After a clean slip, press {punch} at once.'],
    ['uppercut', 'Uppercut', () => 'Hold {down} and press {punch}. Lifts lighter men off their feet.'],
    ['dashStraight', 'Dash straight', () => 'Press {punch} during a forward dash.'],
    ['flurry', 'Flurry', () => '{flurry}: half a second of fast punches and a finish.'],
  ];
  function techniquesHtml() {
    const s = G().skills || {};
    const rows = TECH.filter((t) => s[t[0]]).map((t) => '<li><b>' + esc(t[1]) + '</b> — ' + richText(t[2](s)) + '</li>').join('');
    return '<h3>Techniques</h3><div class="sub">What Jin can do with his hands and feet</div>' +
      (rows ? '<div class="su-tech"><ul>' + rows + '</ul></div>' : '<p class="su-hint">Nothing yet.</p>') +
      '<p class="su-hint" style="margin-top:1em">Keys follow your controls. Change them in Settings → Controls.</p>';
  }
  function trainingDetail(it, prim) {
    if (it.tech) return techniquesHtml();
    const d = it.info;
    return '<h3>' + esc(d.name) + '</h3><div class="sub">Level ' + (d.level | 0) + ' of ' + (d.max || 3) + ' ' + pipsHtml(d.level | 0, d.max || 3) + '</div>' +
      '<p>' + esc(d.what || '') + '</p>' +
      '<p>Now: ' + esc(d.effect || 'Untrained') + '<br>' + (d.next ? 'Next level: ' + esc(d.next) : 'Fully trained.') + '</p>' +
      (prim ? '<div class="act">' + btn(prim.text, 'primary', prim) + '</div>' : '') +
      (!d.available && d.why ? '<p class="su-hint">' + esc(d.why) + '</p>' : '') +
      '<p class="su-hint">Training sharpens control of the body Jin has. It never heals his injuries.</p>';
  }
  function startDrill(key) {
    closeAll('silent');
    const A = S.activities;
    if (A && has(A, 'train')) safe(() => A.train(key), 'train');
  }

  const ITEMS = { quests: questItems, evidence: evidenceItems, memories: memoryItems, people: peopleItems, map: mapItems, training: trainingItems };
  // The selected item's main action (Read / Travel / Start drill), or null.
  function primaryOf(tab, it) {
    if (tab === 'evidence') {
      const pages = docPages(it.def);
      return { text: 'Read', enabled: pages.length > 0, why: 'There is nothing written on it.', act: () => openWin('doc', { id: it.id, at: it.at, doc: it.def }) };
    }
    if (tab === 'map') {
      const why = travelWhy(it);
      return { text: 'Travel here', enabled: why === true, why: why === true ? '' : why, act: () => doTravel(it) };
    }
    if (tab === 'training' && !it.tech) {
      const d = it.info;
      return { text: 'Start drill', enabled: !!d.available, why: d.why || 'Jin cannot train this here.', act: () => startDrill(d.key) };
    }
    return null;
  }
  function detailHtml(tab, it, prim) {
    if (tab === 'quests') return questDetail(it);
    if (tab === 'evidence') return evidenceDetail(it, prim);
    if (tab === 'memories') return memoryDetail(it);
    if (tab === 'people') return peopleDetail(it);
    if (tab === 'training') return trainingDetail(it, prim);
    return '';
  }
  function listHtml(items, sel, tab, fresh) {
    if (!items.length) return '<div class="su-empty">' + esc(EMPTY[tab] || '') + '</div>';
    let h = '', g = null;
    items.forEach((it, i) => {
      if (it.group && it.group !== g) { g = it.group; h += '<div class="su-group">' + esc(g) + '</div>'; }
      const isNew = it.unread || fresh.has(tab + ':' + it.id);
      h += '<button type="button" class="su-item' + (i === sel ? ' sel' : '') + (it.done ? ' done' : '') + '" data-a="item" data-i="' + i + '">' +
        (it.icon ? '<span class="su-ico k-' + it.kind + '">' + it.icon + '</span>' : '') +
        (it.tag ? '<span class="tag">' + esc(it.tag) + '</span>' : '') + '<span>' + esc(it.text) + '</span>' +
        (it.tagHtml ? '<span class="new" style="color:inherit">' + it.tagHtml + '</span>' : isNew ? '<span class="new">NEW</span>' : '') + '</button>';
    });
    return h;
  }

  WIN.journal = function (data) {
    const w = {
      cls: 'wide journal', label: 'Journal', tab: data.tab || st.lastTab || 'quests', sel: Object.create(null), items: [], prim: null,
      backdropClose: true, fresh: new Set(),
      init() { this.pickDefault(); },
      pickDefault() {
        // The Map tab opens on where Jin is; the others on the first unread entry.
        if (this.sel[this.tab] !== undefined) return;
        const items = safe(() => ITEMS[this.tab](), 'items', []) || [];
        let i = this.tab === 'map' ? items.findIndex((x) => x.here) : items.findIndex((x) => x.unread);
        this.sel[this.tab] = Math.max(0, i);
      },
      setTab(t) {
        if (!TABS.some((x) => x[0] === t) || t === this.tab) { renderWin(this); return; }
        this.tab = t; st.lastTab = t;
        this.pickDefault();
        sound('uiMove');
        renderWin(this);
      },
      cycleTab(d) {
        const i = TABS.findIndex((x) => x[0] === this.tab);
        this.setTab(TABS[(i + d + TABS.length) % TABS.length][0]);
      },
      move(d) {
        const n = this.items.length;
        if (!n) return;
        const i = clamp((this.sel[this.tab] | 0) + d, 0, n - 1);
        if (i === (this.sel[this.tab] | 0)) return;
        this.sel[this.tab] = i;
        sound('uiMove');
        renderWin(this);
      },
      render() {
        const tab = this.tab, Dr = DIR();
        const items = this.items = safe(() => ITEMS[tab](), 'journal ' + tab, []) || [];
        const i = this.sel[tab] = clamp(this.sel[tab] | 0, 0, Math.max(0, items.length - 1));
        const cur = items[i] || null;
        // Reading an entry marks it seen (the journal badge clears); it keeps its NEW tag until the journal closes.
        if (cur && cur.unread && TAB_KIND[tab]) {
          if (Dr && has(Dr, 'markSeen')) safe(() => Dr.markSeen(TAB_KIND[tab], cur.id), 'markSeen');
          else if (G()[TAB_KIND[tab]] && G()[TAB_KIND[tab]][cur.id]) G()[TAB_KIND[tab]][cur.id].seen = true;
          this.fresh.add(tab + ':' + cur.id);
        }
        if (cur) cur.fresh = this.fresh.has(tab + ':' + cur.id);
        const g = G();
        const meta = esc(chapterName(g.chapter)) + '<br>' + esc(U.fmtMoney ? U.fmtMoney(g.money || 0) : '$' + (g.money | 0)) + ' · ' + esc(fmtTime(g.playtime || 0));
        const tabs = '<div class="su-tabs" role="tablist">' + TABS.map(([id, name]) => '<button type="button" role="tab" class="su-tab' + (id === tab ? ' on' : '') +
          '" data-a="tab" data-t="' + id + '" aria-selected="' + (id === tab) + '">' + esc(name) + (id !== tab && tabUnread(id) ? '<span class="dot"></span>' : '') + '</button>').join('') + '</div>';
        const prim = this.prim = cur ? primaryOf(tab, cur) : null;
        let body;
        if (tab === 'map') body = mapBody(items, i, cur, prim);
        else body = '<div class="su-split"><div class="su-list" data-keep-scroll="l' + tab + '">' + listHtml(items, i, tab, this.fresh) + '</div>' +
          '<div class="su-detail" data-keep-scroll="d' + tab + esc(cur ? cur.id : '') + '">' + (cur ? detailHtml(tab, cur, prim) : '<div class="su-empty">' + esc(EMPTY[tab] || '') + '</div>') + '</div></div>';
        const keys = keyCap('←→') + ' tabs  ' + keyCap('↑↓') + ' select  ' + (prim ? keyHtml('interact') + ' ' + esc(prim.text.toLowerCase()) + '  ' : '') + keyHtml('journal') + ' close';
        // A disabled action's reason sits under its button in the detail pane; the footer repeats it only on a press.
        this.el.innerHTML = winHead('Journal', meta) + tabs + '<div class="su-win-body" style="overflow:hidden">' + body + '</div>' + winFoot('', keys);
      },
      after() { if (this.tab === 'people') drawPortrait(this); },
      primary() {
        const p = this.prim;
        if (!p) return;
        if (p.enabled === false) { sound('uiBack'); flashWhy(this, p.why); return; }
        sound('ui');
        safe(p.act, 'journal action');
      },
      key(k) {
        if (k.action === 'journal' || isBack(k)) { closeWin(this); return true; }
        if (k.action === 'map') { if (this.tab === 'map') closeWin(this); else this.setTab('map'); return true; }
        if (isLeft(k) || k.code === 'PageUp' || k.code === 'BracketLeft') { this.cycleTab(-1); return true; }
        if (isRight(k) || k.code === 'PageDown' || k.code === 'BracketRight') { this.cycleTab(1); return true; }
        if (isUp(k)) { this.move(-1); return true; }
        if (isDown(k)) { this.move(1); return true; }
        if (k.code === 'Home') { this.move(-999); return true; }
        if (k.code === 'End') { this.move(999); return true; }
        if (isOk(k)) { this.primary(); return true; }
        const d = digitOf(k);
        if (d && d <= TABS.length) { this.setTab(TABS[d - 1][0]); return true; }
        return true;
      },
      act(a, t) {
        if (a === 'close') closeWin(this);
        else if (a === 'tab') this.setTab(t.getAttribute('data-t'));
        else if (a === 'item') {
          const i = +t.getAttribute('data-i');
          if (i === (this.sel[this.tab] | 0)) { if (this.tab === 'map') flashWhy(this, this.prim && this.prim.enabled === false ? this.prim.why : '', true); return; }
          this.sel[this.tab] = i;
          sound('uiMove');
          renderWin(this);
        } else if (a === 'primary') this.primary();
      },
    };
    return w;
  };

  /* ── 12. Document / photo viewer ──────────────────────────────────── */
  // data: { src (the director's D.doc request, closed through closeDoc), doc: EvidenceDef-like, id, at }
  WIN.doc = function (data) {
    let doc = data.doc || (data.src && data.src.doc) || null;
    const id = data.id || (data.src && data.src.id) || (doc && doc.id) || null;
    if (!doc && id) doc = defOf('evidence', id, data.at);
    doc = Object.assign({ title: '', kind: 'document', text: '' }, doc || {});
    const pages = docPages(doc);
    if (!pages.length) pages.push('');
    if (id && G().evidence && G().evidence[id]) G().evidence[id].seen = true;
    sound('paper');
    const w = {
      cls: 'doc', label: doc.title || 'Document', page: clamp((data.src && data.src.page) | 0, 0, pages.length - 1), backdropClose: true, quiet: true,
      render() {
        const p = this.page = clamp(this.page, 0, pages.length - 1);
        if (data.src) data.src.page = p;
        const kind = String(doc.kind || 'document');
        const sub = [EV_TAG[kind] ? kind : '', doc.date].filter(Boolean).join(' · ');
        const paper = kind === 'photo'
          ? '<div class="su-paper photo"><div class="su-print"><div class="img">' + esc(pages[p]) + '</div><div class="cap">' + esc(doc.caption || doc.title || '') + '</div></div></div>'
          : '<div class="su-paper ' + esc(kind) + '" data-keep-scroll="p' + p + '">' + esc(pages[p]) + '</div>';
        const last = p >= pages.length - 1;
        const bar = pages.length > 1
          ? btn('◀', 'prev', { enabled: p > 0, why: 'This is the first page.' }) + '<span class="pg">Page ' + (p + 1) + ' / ' + pages.length + '</span>' + btn('▶', 'next', { enabled: !last, why: 'This is the last page.' })
          : '';
        this.el.innerHTML = winHead(doc.title || 'Document', esc(sub)) + '<div class="su-win-body" style="overflow:hidden">' + paper + '</div>' +
          '<div class="su-win-foot"><div class="su-docbar">' + bar + '</div><div class="su-why"></div><div class="su-keys">' +
          (pages.length > 1 ? keyCap('←→') + ' turn  ' : '') + keyHtml('interact') + (last ? ' close' : ' next page') + '  ' + keyHtml('pause') + ' close</div></div>';
      },
      turn(d) {
        const p = clamp(this.page + d, 0, pages.length - 1);
        if (p === this.page) { sound('uiBack'); return; }
        this.page = p; sound('paper'); renderWin(this);
      },
      key(k) {
        if (isLeft(k) || k.code === 'PageUp') { this.turn(-1); return true; }
        if (isRight(k) || k.code === 'PageDown') { this.turn(1); return true; }
        if (isUp(k) || isDown(k)) {
          const b = this.el.querySelector('.su-paper');
          if (b) b.scrollTop += (isUp(k) ? -1 : 1) * Math.max(24, b.clientHeight * 0.3);
          return true;
        }
        if (isOk(k)) { if (this.page < pages.length - 1) this.turn(1); else closeWin(this); return true; }
        if (isBack(k) || k.action === 'journal') { closeWin(this); return true; }
        return true;
      },
      act(a) {
        if (a === 'prev') this.turn(-1);
        else if (a === 'next') this.turn(1);
        else if (a === 'close') closeWin(this);
      },
      onClose() {
        const Dr = DIR();
        if (data.src && Dr && Dr.doc === data.src && has(Dr, 'closeDoc')) safe(() => Dr.closeDoc(), 'closeDoc');
      },
    };
    return w;
  };
  function syncDirectorDoc() {
    const Dr = DIR();
    const dd = playMode() && Dr ? Dr.doc : null;
    for (const w of st.windows.slice()) if (w.name === 'doc' && w.data.src && w.data.src !== dd) closeWin(w, 'silent');   // the director closed it
    if (dd && !dd.closed && !st.err && !st.windows.some((w) => w.name === 'doc' && w.data.src === dd)) openWin('doc', { src: dd, doc: dd.doc, id: dd.id });
  }

  /* ── 13. Timeline board and evidence picker (activities.js states) ── */
  function boardMsg(state, fallback) {
    const l = state.line, h = state.hint;
    if (h) return '<div class="su-boardmsg bad">' + esc(h) + '</div>';
    if (l && l.text) return '<div class="su-boardmsg good"><span class="who">' + esc(l.name || personName(l.speaker) || '') + '</span>' + esc(l.text) + '</div>';
    return '<div class="su-boardmsg">' + (fallback || '') + '</div>';
  }
  WIN.timeline = function (state) {
    const w = {
      cls: 'wide board', label: state.title || 'Timeline', focus: 'tray', ti: 0, si: 0, held: null, backdropClose: false, sig: '',
      card(id) { return (state.cards || []).find((c) => c.id === id) || null; },
      firstEmpty() { const s = state.slots || []; const i = s.indexOf(null); return i < 0 ? 0 : i; },
      signature() { return (state.slots || []).join(',') + '|' + (state.hint || '') + '|' + (state.line ? state.line.text : '') + '|' + !!state.complete; },
      render() {
        this.sig = this.signature();
        const tray = has(state, 'tray') ? state.tray() : [];
        const slots = state.slots || [];
        if (!tray.length) { this.focus = 'line'; this.held = null; }
        this.ti = clamp(this.ti, 0, Math.max(0, tray.length - 1));
        this.si = clamp(this.si, 0, Math.max(0, slots.length - 1));
        const line = slots.map((cid, i) => {
          const c = cid ? this.card(cid) : null;
          const n = slots.length > 1 && i === 0 ? 'Earliest' : slots.length > 1 && i === slots.length - 1 ? 'Latest' : String(i + 1);
          return '<button type="button" class="su-slot' + (c ? ' filled' : '') + (this.focus === 'line' && i === this.si ? ' sel' : '') + '" data-a="slot" data-s="' + i + '">' +
            '<span class="n">' + esc(n) + '</span>' + (c ? esc(c.title) + (c.date ? '<span class="d">' + esc(c.date) + '</span>' : '') : (this.held ? 'Place it here' : '—')) + '</button>';
        }).join('');
        const cards = tray.map((c, i) => '<button type="button" class="su-tcard' + (this.focus === 'tray' && i === this.ti ? ' sel' : '') + (this.held === c.id ? ' held' : '') +
          '" data-a="card" data-c="' + esc(c.id) + '" data-t="' + i + '">' + esc(c.title) + (c.date ? '<span class="d">' + esc(c.date) + '</span>' : '') + '</button>').join('');
        const look = this.focus === 'tray' ? tray[this.ti] : slots[this.si] ? this.card(slots[this.si]) : this.held ? this.card(this.held) : null;
        const fallback = look && look.text ? '<b>' + esc(look.title) + '.</b> ' + esc(look.text) : esc(state.prompt || '');
        const done = !!state.complete;
        this.el.innerHTML = winHead(state.title || 'Put it in order', esc(state.mistakes ? state.mistakes + ' misplaced' : '')) +
          '<div class="su-win-body"><div class="su-board">' +
            '<p class="su-hint" style="margin:0">' + esc(state.prompt || '') + '</p>' +
            '<div class="su-line">' + line + '</div>' +
            (tray.length ? '<div class="su-group" style="margin-left:0">Cards</div><div class="su-tray">' + cards + '</div>' : '') +
            boardMsg(done ? Object.assign({}, state, { hint: null }) : state, fallback) +
          '</div></div>' +
          '<div class="su-win-foot"><div class="su-docbar">' + btn('Done', 'done', { enabled: done, why: 'Every card has to be on the line first.', cls: done ? 'sel' : '' }) +
            btn('Step away', 'away', { enabled: !done, why: 'It is settled. Press Done.' }) + '</div><div class="su-why"></div><div class="su-keys">' +
            (done ? keyHtml('interact') + ' done' : keyCap('←→↑↓') + ' choose  ' + keyHtml('interact') + (this.held ? ' place' : ' pick up') + '  ' + keyHtml('pause') + (this.held ? ' put down' : ' step away')) + '</div></div>';
      },
      place(slot) {
        if (!this.held) return;
        const r = safe(() => state.place(this.held, slot), 'timeline place', null);
        if (r && r.correct) { this.held = null; this.focus = has(state, 'tray') && state.tray().length ? 'tray' : 'line'; this.ti = 0; }
        renderWin(this);
      },
      pick(i) {
        const tray = state.tray();
        const c = tray[i];
        if (!c) return;
        this.ti = i;
        if (this.held === c.id) { this.held = null; }
        else { this.held = c.id; this.focus = 'line'; this.si = this.firstEmpty(); sound('paper', { vol: 0.5 }); }
        renderWin(this);
      },
      key(k) {
        if (state.done) return true;
        if (state.complete) { if (isOk(k) || isBack(k)) safe(() => state.finish(), 'timeline finish'); return true; }
        const tray = state.tray(), n = (state.slots || []).length;
        if (isBack(k)) { if (this.held) { this.held = null; renderWin(this); } else closeWin(this); return true; }
        if (isUp(k)) { this.focus = 'line'; renderWin(this); return true; }
        if (isDown(k)) { if (tray.length) { this.focus = 'tray'; renderWin(this); } return true; }
        if (isLeft(k) || isRight(k)) {
          const d = isLeft(k) ? -1 : 1;
          if (this.focus === 'tray') this.ti = clamp(this.ti + d, 0, Math.max(0, tray.length - 1));
          else this.si = clamp(this.si + d, 0, Math.max(0, n - 1));
          sound('uiMove'); renderWin(this); return true;
        }
        if (isOk(k)) {
          if (this.focus === 'tray') this.pick(this.ti);
          else if (this.held) this.place(this.si);
          else if (tray.length) { this.focus = 'tray'; renderWin(this); }
          return true;
        }
        return true;
      },
      act(a, t) {
        if (a === 'done') safe(() => state.finish(), 'timeline finish');
        else if (a === 'away' || a === 'close') { if (state.complete) safe(() => state.finish(), 'timeline finish'); else closeWin(this); }
        else if (a === 'card') this.pick(+t.getAttribute('data-t'));
        else if (a === 'slot') {
          this.si = +t.getAttribute('data-s');
          if (this.held) this.place(this.si); else { this.focus = 'line'; renderWin(this); }
        }
      },
      tick() {
        if (state.done) { closeWin(this, 'api'); return; }
        if (this.signature() !== this.sig) renderWin(this);   // autoplay or another hand moved a card
      },
      // Closing early leaves the board waiting ([interact] reopens it); once complete the activity ends itself.
      onClose() { if (!state.done && !state.complete && has(state, 'close')) safe(() => state.close(), 'timeline close'); },
    };
    return w;
  };

  WIN.present = function (state) {
    const w = {
      cls: 'wide board', label: state.title || 'Present evidence', sel: 0, backdropClose: false, sig: '',
      signature() { return (state.picks | 0) + '|' + (state.wrong | 0) + '|' + !!state.complete + '|' + (state.line ? state.line.text : ''); },
      render() {
        this.sig = this.signature();
        const opts = state.options || [];
        this.sel = clamp(this.sel, 0, Math.max(0, opts.length - 1));
        const cur = opts[this.sel] || null, done = !!state.complete;
        const list = opts.length ? opts.map((o, i) => '<button type="button" class="su-item' + (i === this.sel ? ' sel' : '') + '" data-a="item" data-i="' + i + '"><span class="tag">' +
          esc(EV_TAG[o.kind] || 'ITEM') + '</span><span>' + esc(o.title || o.id) + '</span></button>').join('') : '<div class="su-empty">' + esc(EMPTY.evidence) + '</div>';
        const detail = cur ? '<h3>' + esc(cur.title || cur.id) + '</h3><div class="sub">' + esc([cur.kind, cur.date].filter(Boolean).join(' · ')) + '</div>' +
          (cur.text ? '<p style="white-space:pre-wrap">' + esc(String(cur.text).slice(0, 500)) + '</p>' : '') +
          '<div class="act">' + btn('Present this', 'present', { enabled: !done, why: 'That is settled.' }) + '</div>' : '';
        const lineState = { line: state.line, hint: null };
        const msg = state.line && state.line.text
          ? '<div class="su-boardmsg ' + (done ? 'good' : 'bad') + '"><span class="who">' + esc(state.line.name || personName(state.line.speaker) || '') + '</span>' + esc(state.line.text) + '</div>'
          : done ? '<div class="su-boardmsg good">That answers it.</div>' : boardMsg(lineState, 'Choose the evidence that answers this.');
        this.el.innerHTML = winHead(state.title || 'Show them', esc(state.wrong ? state.wrong + ' wrong' : '')) +
          '<div class="su-win-body" style="display:flex;flex-direction:column;gap:6px;overflow:hidden">' +
            '<div class="su-claim"><span class="who">' + esc(state.speakerName || personName(state.speaker) || '') + '</span>“' + esc(state.claim || '') + '”</div>' +
            '<div class="su-split" style="flex:1;min-height:0"><div class="su-list" data-keep-scroll="pl">' + list + '</div><div class="su-detail" data-keep-scroll="pd' + esc(cur ? cur.id : '') + '">' + detail + '</div></div>' +
            msg +
          '</div>' +
          '<div class="su-win-foot"><div class="su-docbar">' + btn('Continue', 'done', { enabled: done, why: 'Answer the claim first.', cls: done ? 'sel' : '' }) +
            btn('Step away', 'away', { enabled: !done, why: 'It is settled. Press Continue.' }) + '</div><div class="su-why"></div><div class="su-keys">' +
            (done ? keyHtml('interact') + ' continue' : keyCap('↑↓') + ' choose  ' + keyHtml('interact') + ' present  ' + keyHtml('pause') + ' step away') + '</div></div>';
      },
      present() {
        const o = (state.options || [])[this.sel];
        if (!o || state.complete) return;
        safe(() => state.pick(o.id), 'present pick');
        renderWin(this);
      },
      key(k) {
        if (state.done) return true;
        if (state.complete) { if (isOk(k) || isBack(k)) safe(() => state.finish(), 'present finish'); return true; }
        const n = (state.options || []).length;
        if (isUp(k) || isDown(k)) { this.sel = clamp(this.sel + (isUp(k) ? -1 : 1), 0, Math.max(0, n - 1)); sound('uiMove'); renderWin(this); return true; }
        if (isOk(k)) { this.present(); return true; }
        if (isBack(k)) { closeWin(this); return true; }
        return true;
      },
      act(a, t) {
        if (a === 'item') { this.sel = +t.getAttribute('data-i'); sound('uiMove'); renderWin(this); }
        else if (a === 'present') this.present();
        else if (a === 'done') safe(() => state.finish(), 'present finish');
        else if (a === 'away' || a === 'close') { if (state.complete) safe(() => state.finish(), 'present finish'); else closeWin(this); }
      },
      tick() {
        if (state.done) { closeWin(this, 'api'); return; }
        if (this.signature() !== this.sig) renderWin(this);
      },
      onClose() { if (!state.done && !state.complete && has(state, 'close')) safe(() => state.close(), 'present close'); },
    };
    return w;
  };

  /* ── 14. Pause menu, save and load ────────────────────────────────── */
  // true, or why a manual save is not possible right now.
  function canSave() {
    const M = S.main, g = S.G, Dr = DIR(), w = WLD();
    if (!M || M.mode !== 'play' || !g) return 'There is no game to save.';
    if (+g.chapter === SANDBOX) return 'The movement sandbox is not saved.';
    if (!has(story, 'has') || !story.has(g.chapter)) return 'This chapter is not in this build.';
    if (!w || !w.locId || !w.jin) return 'You can save once Jin is somewhere.';
    if (fightOn()) return 'Not in the middle of a fight.';
    if (S.activities && S.activities.running) return 'Finish what Jin is doing first.';
    if (Dr && (Dr.busy || Dr.endReq || Dr.screen)) return 'You can save once the scene ends and Jin is free to move.';
    if (w.transitioning) return 'Wait until Jin arrives.';
    return true;
  }
  function saves() { return safe(() => (has(S, 'listSaves') ? S.listSaves() : []), 'listSaves', []) || []; }
  const hasAnySave = () => saves().length > 0;
  function quitToTitle() {
    const ok = canSave() === true, cp = G().checkpoint;
    confirm({
      title: 'Quit to title?',
      text: ok ? 'Your progress is saved first.' : 'You will continue from the last checkpoint' + (cp && cp.label ? ': ' + cp.label : '') + '.',
      yes: 'Quit to title', danger: true,
      onYes: () => {
        closeAll('silent');
        if (S.main && has(S.main, 'toTitle')) S.main.toTitle(); else if (has(S, 'toTitle')) S.toTitle();
      },
    });
  }
  WIN.pause = function () {
    return menuWindow({
      title: 'Paused', cls: 'narrow', closeOn: 'pause',
      intro: () => {
        const g = G(), w = WLD(), cp = g.checkpoint;
        return '<p class="su-hint" style="margin:0 0 .9em">' + esc(chapterName(g.chapter)) + '<br>' + esc([w && w.loc ? w.loc.name : '', fmtTime(g.playtime || 0)].filter(Boolean).join(' · ')) +
          (cp && cp.label ? '<br>Last checkpoint: ' + esc(cp.label) : '') + '</p>';
      },
      items: () => {
        const sv = canSave();
        return [
          { text: 'Resume', act: (x) => closeWin(x) },
          { text: 'Journal', sub: label('journal'), act: () => openWin('journal') },
          { text: 'Save', enabled: sv === true, why: sv === true ? '' : sv, act: () => openWin('save') },
          { text: 'Load', enabled: hasAnySave(), why: 'There are no saves yet.', act: () => openWin('load') },
          { text: 'Settings', act: () => openWin('settings') },
          { text: 'Controls', act: () => openWin('controls') },
          { text: 'Quit to title', cls: 'danger', act: () => quitToTitle() },
        ];
      },
    });
  };
  function slotRows(mode) {
    const by = Object.create(null);
    for (const s of saves()) by[String(s.slot)] = s;
    return (mode === 'save' ? [1, 2, 3] : ['auto', 1, 2, 3]).map((slot) => {
      const s = by[String(slot)] || null;
      const name = slot === 'auto' ? 'Auto' : 'Slot ' + slot;
      const html = '<span class="no">' + esc(name) + '</span><span class="lb">' + (s ? esc(s.label || chapterName(s.chapter)) +
        '<small>' + esc([s.loc, fmtTime(s.playtime || 0)].filter(Boolean).join(' · ')) + '</small>' : 'Empty') + '</span><span class="tm">' + esc(s ? fmtDate(s.when) : '') + '</span>';
      return { slot, s, text: name, html, btnCls: 'su-slotbtn' + (s ? '' : ' empty') };
    });
  }
  function saveTo(r, w) {
    const go = () => {
      const ok = !!safe(() => S.save(r.slot, null), 'save', false);
      if (ok) UI.toast('Slot ' + r.slot + ' — ' + chapterName(G().chapter), 'saved', { head: 'Saved' });
      else UI.toast('Could not save. The browser may be blocking storage.', 'error');
      renderWin(w);
    };
    if (r.s) confirm({ title: 'Overwrite slot ' + r.slot + '?', text: 'It holds ' + (r.s.label || chapterName(r.s.chapter)) + '.', yes: 'Overwrite', danger: true, onYes: go });
    else go();
  }
  WIN.save = function () {
    return menuWindow({
      title: 'Save', cls: '',
      intro: () => { const why = canSave(); return '<p class="su-hint" style="margin:0 0 .8em">' + esc(why === true ? 'Choose a slot. The autosave also keeps your place at every checkpoint.' : why) + '</p>'; },
      items: () => { const why = canSave(); return slotRows('save').map((r) => Object.assign(r, { enabled: why === true, why: why === true ? '' : why, act: (w) => saveTo(r, w) })); },
    });
  };
  function loadFrom(r) {
    const go = () => {
      closeAll('silent');
      const ok = has(story, 'loadGame') ? !!safe(() => story.loadGame(r.slot), 'loadGame', false) : !!safe(() => S.load(r.slot), 'load', false);
      if (!ok) UI.toast('That save could not be loaded.', 'error');
    };
    if (playMode()) confirm({ title: 'Load ' + (r.slot === 'auto' ? 'the autosave' : 'slot ' + r.slot) + '?', text: 'Anything since your last save is lost.', yes: 'Load', danger: true, onYes: go });
    else go();
  }
  WIN.load = function () {
    return menuWindow({
      title: 'Load', cls: '',
      intro: '<p class="su-hint" style="margin:0 0 .8em">Auto is the latest checkpoint. Slots 1–3 are your own saves.</p>',
      items: () => slotRows('load').map((r) => Object.assign(r, { enabled: !!r.s, why: 'This slot is empty.', act: () => loadFrom(r) })),
    });
  };

  /* ── 15. Settings and controls ────────────────────────────────────── */
  const DIFF_DESC = {
    story: 'Jin never drops below 1 condition and recovers fully 2 s after avoiding damage.',
    normal: 'Jin recovers fully 3 s after avoiding damage, between exchanges.',
    veteran: 'Jin recovers only up to half his condition.',
  };
  const SET_ROWS = [
    { key: 'difficulty', label: 'Difficulty', type: 'seg', opts: [['story', 'Story'], ['normal', 'Normal'], ['veteran', 'Veteran']],
      desc: (v) => (DIFF_DESC[v] || '') + ' Damage itself never changes.' },
    { key: 'textSpeed', label: 'Text speed', type: 'seg', opts: [[0.5, 'Slow'], [1, 'Normal'], [1.5, 'Fast'], [2, 'Faster'], [3, 'Instant']] },
    { key: 'shake', label: 'Screen shake', type: 'slider' },
    { key: 'flash', label: 'Flashes', type: 'slider' },
    { key: 'sfx', label: 'Sound effects', type: 'slider' },
    { key: 'ambience', label: 'Ambience', type: 'slider' },
    { key: 'minimap', label: 'Minimap', type: 'seg', opts: [['full', 'Full'], ['partial', 'Nearby'], ['hidden', 'Hidden']], desc: () => label('minimap') + ' also cycles it during play.' },
    { key: 'showTips', label: 'Tips', type: 'seg', opts: [[true, 'On'], [false, 'Off']], desc: () => 'Short hints during fights and drills.' },
    { key: '_controls', label: 'Controls', type: 'button', text: 'Rebind keys' },
  ];
  function setSetting(key, v) {
    if (S.settings[key] === v) return false;
    S.settings[key] = v;
    safe(() => S.saveSettings(), 'saveSettings');
    return true;
  }
  function segIndex(r) { const cur = S.settings[r.key]; const i = r.opts.findIndex((o) => String(o[0]) === String(cur)); return i < 0 ? 0 : i; }
  function sliderSet(e, v) {
    const pct = Math.round(clamp(v, 0, 1) * 100);
    const b = e.querySelector('.trk b'), i = e.querySelector('.trk i'), val = e.querySelector('.val');
    if (b) b.style.width = pct + '%';
    if (i) i.style.left = pct + '%';
    if (val) val.textContent = pct ? pct + '%' : 'Off';
  }
  WIN.settings = function () {
    const w = {
      cls: '', label: 'Settings', sel: 0, backdropClose: true, drag: null,
      render() {
        const rows = SET_ROWS.map((r, i) => {
          let ctl = '';
          if (r.type === 'seg') {
            const si = segIndex(r);
            ctl = '<div class="su-seg">' + r.opts.map((o, j) => '<button type="button" class="' + (j === si ? 'on' : '') + '" data-a="seg" data-r="' + i + '" data-o="' + j + '">' + esc(o[1]) + '</button>').join('') + '</div>';
          } else if (r.type === 'slider') {
            const v = clamp(+S.settings[r.key] || 0, 0, 1), pct = Math.round(v * 100);
            ctl = '<div class="su-slider" data-a="slider" data-r="' + i + '" role="slider" aria-label="' + esc(r.label) + '" aria-valuenow="' + pct + '"><span class="trk"><b style="width:' + pct + '%"></b><i style="left:' + pct + '%"></i></span><span class="val">' + (pct ? pct + '%' : 'Off') + '</span></div>';
          } else ctl = '<div>' + btn(r.text, 'controls') + '</div>';
          const desc = r.desc ? r.desc(S.settings[r.key]) : '';
          return '<div class="su-row' + (i === this.sel ? ' sel' : '') + '" data-a="row" data-i="' + i + '"><span class="lab">' + esc(r.label) + '</span>' + ctl + (desc ? '<span class="desc">' + esc(desc) + '</span>' : '') + '</div>';
        }).join('');
        this.el.innerHTML = winHead('Settings', '') + '<div class="su-win-body" data-keep-scroll="s"><div class="su-rows">' + rows + '</div></div>' +
          winFoot('', keyCap('↑↓') + ' choose  ' + keyCap('←→') + ' change  ' + keyHtml('pause') + ' back');
      },
      after() {
        // Sliders follow the pointer and update in place (a re-render mid-drag would drop the pointer capture).
        const list = this.el.querySelectorAll('.su-slider');
        for (let n = 0; n < list.length; n++) {
          const e = list[n], r = SET_ROWS[+e.getAttribute('data-r')];
          const at = (ev) => { const t = e.querySelector('.trk').getBoundingClientRect(); return t.width > 0 ? clamp((ev.clientX - t.left) / t.width, 0, 1) : 0; };
          const apply = (ev) => { const v = Math.round(at(ev) * 20) / 20; sliderSet(e, v); if (setSetting(r.key, v) && r.key === 'sfx') sound('uiMove'); };
          e.addEventListener('pointerdown', (ev) => { ev.preventDefault(); this.sel = +e.getAttribute('data-r'); this.markSel(); try { e.setPointerCapture(ev.pointerId); } catch (_) { /* old browser */ } this.drag = e; apply(ev); });
          e.addEventListener('pointermove', (ev) => { if (this.drag === e) apply(ev); });
          const end = () => { if (this.drag === e) { this.drag = null; renderWin(this); } };
          e.addEventListener('pointerup', end);
          e.addEventListener('pointercancel', end);
        }
      },
      markSel() { const rs = this.el.querySelectorAll('.su-row'); for (let i = 0; i < rs.length; i++) toggle(rs[i], 'sel', i === this.sel); },
      change(d, wrap) {
        const r = SET_ROWS[this.sel];
        if (r.type === 'seg') {
          let i = segIndex(r) + d;
          i = wrap ? (i + r.opts.length) % r.opts.length : clamp(i, 0, r.opts.length - 1);
          if (setSetting(r.key, r.opts[i][0])) sound('uiMove');
        } else if (r.type === 'slider') {
          const v = Math.round(clamp((+S.settings[r.key] || 0) + d * 0.1, 0, 1) * 10) / 10;
          if (setSetting(r.key, v)) sound('uiMove');
        } else if (r.type === 'button' && d > 0 && wrap) openWin('controls');
        renderWin(this);
      },
      key(k) {
        if (isUp(k)) { this.sel = (this.sel - 1 + SET_ROWS.length) % SET_ROWS.length; sound('uiMove'); renderWin(this); return true; }
        if (isDown(k)) { this.sel = (this.sel + 1) % SET_ROWS.length; sound('uiMove'); renderWin(this); return true; }
        if (isLeft(k)) { this.change(-1, false); return true; }
        if (isRight(k)) { this.change(1, false); return true; }
        if (isOk(k)) { this.change(1, true); return true; }
        if (isBack(k)) { closeWin(this); return true; }
        return true;
      },
      act(a, t) {
        if (a === 'close') closeWin(this);
        else if (a === 'seg') {
          const r = SET_ROWS[+t.getAttribute('data-r')];
          this.sel = +t.getAttribute('data-r');
          if (setSetting(r.key, r.opts[+t.getAttribute('data-o')][0])) sound('uiMove');
          renderWin(this);
        } else if (a === 'controls') openWin('controls');
        else if (a === 'row') { const i = +t.getAttribute('data-i'); if (i !== this.sel) { this.sel = i; this.markSel(); } }
      },
    };
    return w;
  };

  const PRESET_DESC = {
    A: 'A/D move · Space jump · J punch · K dash · L slip · E interact · Tab journal',
    B: 'Arrows move · Alt jump · X punch · C dash · V slip · Space interact · I journal',
  };
  WIN.controls = function () {
    const I = S.input;
    const acts = (I && I.actions ? I.actions : []).slice();
    const w = {
      cls: 'wide', label: 'Controls', row: 0, col: 0, waiting: null, msg: '', msgBad: false, backdropClose: true,
      nSlots() { let n = 2; for (const a of acts) n = Math.max(n, (I.bindings[a] || []).length); return Math.min(3, n); },
      render() {
        const ns = this.nSlots(), last = acts.length;
        this.row = clamp(this.row, 0, last);
        this.col = clamp(this.col, 0, this.row === last ? 2 : ns - 1);
        const rows = acts.map((a, r) => {
          const b = I.bindings[a] || [];
          let slots = '';
          for (let c = 0; c < ns; c++) {
            const code = b[c];
            const wait = this.waiting && this.waiting.a === a && this.waiting.slot === c;
            slots += '<button type="button" class="slot' + (code ? '' : ' empty') + (this.row === r && this.col === c ? ' sel' : '') + (wait ? ' wait' : '') +
              '" data-a="slot" data-r="' + r + '" data-c="' + c + '">' + esc(wait ? 'Press a key…' : code ? I.codeLabel(code) : '—') + '</button>';
          }
          return '<div class="su-ctl' + (this.row === r ? ' sel' : '') + '" data-i="' + r + '"><span class="lab">' + esc(ACTION_LABEL[a] || a) + '</span><span class="slots">' + slots + '</span></div>';
        }).join('');
        const pr = S.settings.preset || 'A', custom = !!S.settings.bindings;
        const pb = (p, c, text) => '<button type="button" class="su-btn' + (this.row === last && this.col === c ? ' sel' : '') + '" data-a="preset" data-p="' + p + '" data-c="' + c + '">' + esc(text) + '</button>';
        this.el.innerHTML = winHead('Controls', esc('Preset ' + pr + (custom ? ' · changed' : ''))) +
          '<div class="su-win-body" data-keep-scroll="c"><div class="su-rows">' + rows + '</div>' +
            '<div class="su-presets">' + pb('A', 0, 'Preset A') + pb('B', 1, 'Preset B') + pb('reset', 2, 'Reset to preset ' + pr) + '</div>' +
            '<p class="su-hint" style="padding:0 .6em">A: ' + esc(PRESET_DESC.A) + '<br>B: ' + esc(PRESET_DESC.B) + '</p></div>' +
          '<div class="su-win-foot"><div class="su-why" style="color:' + (this.msgBad ? '' : 'var(--su-text2)') + '">' + esc(this.msg) + '</div><div class="su-keys">' +
            keyCap('↑↓←→') + ' choose  ' + keyHtml('interact') + ' change  ' + keyCap('Del') + ' clear  ' + keyCap('Esc') + ' back</div></div>';
        const selEl = this.el.querySelector('.slot.sel,.su-presets .su-btn.sel');
        if (selEl) ensureVisible(selEl);
      },
      say(text, bad) { this.msg = text || ''; this.msgBad = !!bad; },
      capture(r, c) {
        if (!I || !has(I, 'captureNext')) { this.say('Rebinding is not available in this build.', true); renderWin(this); return; }
        const a = acts[r];
        this.waiting = { a, slot: c };
        st.capturing = true;
        this.say('Press a key for ' + (ACTION_LABEL[a] || a) + '. Esc cancels.');
        I.captureNext((code) => {
          // Runs inside core's keydown listener; the same event then reaches ours, which must skip it.
          st.capturing = false; st.skipKey = true;
          const wt = this.waiting;
          this.waiting = null;
          if (!wt) return;
          if (!code) this.say('Unchanged.');
          else this.bind(wt.a, wt.slot, code);
          if (st.windows.indexOf(this) >= 0) renderWin(this);
        });
        renderWin(this);
      },
      bind(a, slot, code) {
        const b = I.bindings, other = I.actionFor(code), name = I.codeLabel(code);
        if (other === a) { this.say(name + ' is already on ' + (ACTION_LABEL[a] || a) + '.'); return; }
        if (other && (b[other] || []).length <= 1) {
          this.say(name + ' is the only key for ' + (ACTION_LABEL[other] || other) + '. Give that another key first.', true);
          sound('uiBack');
          return;
        }
        I.rebind(a, slot, code);
        this.say(name + ' → ' + (ACTION_LABEL[a] || a) + (other ? ' (taken from ' + (ACTION_LABEL[other] || other) + ')' : '') + '.');
        sound('ui');
      },
      clear(r, c) {
        const a = acts[r], b = I.bindings[a] || [];
        if (!b[c]) return;
        if (b.length <= 1) { this.say('Every action needs at least one key.', true); sound('uiBack'); renderWin(this); return; }
        I.rebind(a, c, null);
        this.say((ACTION_LABEL[a] || a) + ': key removed.');
        renderWin(this);
      },
      preset(p) {
        if (p === 'reset') p = S.settings.preset || 'A';
        I.resetBindings(p);
        this.say('Preset ' + p + ' applied.');
        sound('ui');
        renderWin(this);
      },
      key(k) {
        if (this.waiting) return true;
        const last = acts.length;
        if (isBack(k) && k.code !== 'Backspace') { closeWin(this); return true; }
        if ((k.code === 'Delete' || k.code === 'Backspace') && this.row < last) { this.clear(this.row, this.col); return true; }
        if (k.code === 'Backspace') { closeWin(this); return true; }
        if (isUp(k)) { this.row = (this.row - 1 + last + 1) % (last + 1); sound('uiMove'); renderWin(this); return true; }
        if (isDown(k)) { this.row = (this.row + 1) % (last + 1); sound('uiMove'); renderWin(this); return true; }
        if (isLeft(k) || isRight(k)) {
          const max = this.row === last ? 2 : this.nSlots() - 1;
          this.col = clamp(this.col + (isLeft(k) ? -1 : 1), 0, max);
          sound('uiMove'); renderWin(this); return true;
        }
        if (isOk(k)) {
          if (this.row === last) this.preset(['A', 'B', 'reset'][this.col]);
          else this.capture(this.row, this.col);
          return true;
        }
        return true;
      },
      act(a, t) {
        if (this.waiting) return;
        if (a === 'close') closeWin(this);
        else if (a === 'slot') { this.row = +t.getAttribute('data-r'); this.col = +t.getAttribute('data-c'); this.capture(this.row, this.col); }
        else if (a === 'preset') { this.row = acts.length; this.col = +t.getAttribute('data-c'); this.preset(t.getAttribute('data-p')); }
      },
      onClose() {
        if (this.waiting && I && has(I, 'captureNext')) { I.captureNext(null); st.capturing = false; this.waiting = null; }
      },
    };
    return w;
  };

  /* ── 16. Title screen ─────────────────────────────────────────────── */
  function autoMeta() {
    const s = saves().find((x) => x.slot === 'auto');
    return s ? [s.label || chapterName(s.chapter), s.loc, fmtTime(s.playtime || 0)].filter(Boolean).join(' · ') : '';
  }
  function titleItems() {
    const T = st.title;
    if (T.view === 'chapters') {
      const list = has(story, 'chapterList') ? safe(() => story.chapterList(), 'chapterList', []) || [] : [];
      const items = list.map((c) => ({
        text: c.sandbox ? 'Movement sandbox' : c.title,
        html: '<span class="n">' + esc(c.sandbox ? '—' : String(c.n)) + '</span><span>' + esc(c.sandbox ? 'Movement sandbox' : c.title) + '</span>' + (c.completed ? '<span class="ok">✓</span>' : ''),
        enabled: !!c.available, why: c.reason || 'Not available yet.', sub: [c.date, c.place].filter(Boolean).join(' · '),
        act: () => (c.sandbox ? safe(() => story.playSandbox(), 'sandbox') : replayChapter(c)),
      }));
      if (!items.length) items.push({ text: 'No chapters yet', enabled: false, why: 'No chapters are available in this build.' });
      items.push({ text: 'Back', act: () => { T.view = 'main'; T.sel = 3; renderTitle(); } });
      return items;
    }
    const auto = !!(has(S, 'hasSave') && S.hasSave('auto'));
    const first = has(story, 'firstChapter') ? safe(() => story.firstChapter(), 'firstChapter', null) : null;
    return [
      { text: 'Continue', enabled: auto, why: 'No saved game yet. Start a New Game.', sub: auto ? autoMeta() : '', act: continueGame },
      { text: 'New Game', enabled: first !== null && first !== undefined, why: 'No chapters are available in this build.', sub: first !== null && first !== undefined ? 'Begins with ' + chapterName(first) : '', act: newGame },
      { text: 'Load', enabled: hasAnySave(), why: 'There are no saves yet.', sub: 'Autosave and slots 1–3', act: () => openWin('load') },
      { text: 'Chapters', sub: 'Replay a chapter you have finished', act: () => { T.view = 'chapters'; T.sel = 0; renderTitle(); } },
      { text: 'Settings', sub: 'Difficulty, text, sound, controls', act: () => openWin('settings') },
      { text: 'Back to the lobby', sub: '', act: () => S.close() },
    ];
  }
  function continueGame() {
    const ok = has(story, 'continueGame') ? !!safe(() => story.continueGame(), 'continue', false) : false;
    if (!ok) UI.toast('The autosave could not be loaded.', 'error');
  }
  function newGame() {
    const go = () => { if (!safe(() => story.newGame(), 'newGame', false)) UI.toast('A new game could not start.', 'error'); };
    if (has(S, 'hasSave') && S.hasSave('auto')) {
      confirm({ title: 'Start a new game?', text: ['The autosave will be replaced once the new game saves.', 'Slots 1–3 are kept.'], yes: 'New Game', danger: true, onYes: go });
    } else go();
  }
  function replayChapter(c) {
    confirm({
      title: 'Replay Chapter ' + c.n + '?', yes: 'Replay',
      text: ['"' + c.title + '" starts over with the story as it stood when you first began it.', 'The replay takes over the autosave. Slots 1–3 are kept.'],
      onYes: () => { if (!safe(() => story.chapterSelect(c.n), 'chapterSelect', false)) UI.toast('That chapter could not start.', 'error'); },
    });
  }
  UI.title = function () {
    if (S.headless || !st.mounted) return;
    st.titleOn = true;
    st.title.view = 'main';
    if (st.screen) { const s = st.screen; st.screen = null; if (s.el.parentNode) s.el.parentNode.removeChild(s.el); }
    renderTitle();
  };
  function hideTitle() {
    if (!st.titleOn) return;
    st.titleOn = false;
    if (st.L.title) st.L.title.innerHTML = '';
  }
  function renderTitle() {
    if (!st.mounted || !st.titleOn) return;
    const T = st.title;
    T.items = titleItems();
    T.sel = clamp(T.sel | 0, 0, Math.max(0, T.items.length - 1));
    if (T.view === 'main' && T.items[T.sel] && T.items[T.sel].enabled === false) { const i = T.items.findIndex((x) => x.enabled !== false); T.sel = i < 0 ? 0 : i; }
    const chap = T.view === 'chapters';
    const box = el('div', 'su-title');
    box.setAttribute('role', 'menu');
    box.innerHTML = '<div class="su-kicker">Inside the Impact</div><h1>' + (chap ? 'Chapters' : 'Story Mode') + '</h1>' +
      '<div class="tag">' + (chap ? 'Replay a chapter you have finished.' : 'Calder, 1994 – 1997') + '</div>' +
      '<div class="su-menu' + (chap ? ' chap' : '') + '">' + T.items.map((it, i) => '<button type="button" role="menuitem" class="su-btn' + (i === T.sel ? ' sel' : '') +
        (it.enabled === false ? ' dis' : '') + '" data-i="' + i + '"' + (it.enabled === false ? ' aria-disabled="true" title="' + esc(it.why || '') + '"' : '') + '>' + (it.html || esc(it.text)) + '</button>').join('') + '</div>' +
      '<div class="meta"></div><div class="credit">Story Mode by Joohyun Lee and Elliot Jeong</div>';
    box.addEventListener('click', (ev) => {
      const b = ev.target && ev.target.closest ? ev.target.closest('[data-i]') : null;
      if (!b) return;
      T.sel = +b.getAttribute('data-i');
      titleActivate();
    });
    box.addEventListener('mouseover', (ev) => {
      const b = ev.target && ev.target.closest ? ev.target.closest('[data-i]') : null;
      if (b && +b.getAttribute('data-i') !== T.sel) { T.sel = +b.getAttribute('data-i'); titleMark(); }
    });
    const keys = el('div', 'su-title-keys', keyCap('↑↓') + ' choose  ' + keyHtml('interact') + ' select  ' + keyHtml('pause') + (chap ? ' back' : ' lobby'));
    st.L.title.innerHTML = '';
    st.L.title.appendChild(box);
    st.L.title.appendChild(keys);
    titleMark();
  }
  function titleMark() {
    const T = st.title, box = st.L.title && st.L.title.querySelector('.su-title');
    if (!box) return;
    const bs = box.querySelectorAll('[data-i]');
    for (let i = 0; i < bs.length; i++) toggle(bs[i], 'sel', +bs[i].getAttribute('data-i') === T.sel);
    const it = T.items[T.sel], meta = box.querySelector('.meta');
    if (meta) meta.innerHTML = it ? (it.enabled === false ? '<span class="su-why">' + esc(it.why || '') + '</span>' : esc(it.sub || '')) : '';
    ensureVisible(box.querySelector('.su-btn.sel'));
  }
  function titleActivate() {
    const T = st.title, it = T.items[T.sel];
    if (!it) return;
    if (it.enabled === false) { sound('uiBack'); titleMark(); return; }
    sound('ui');
    if (it.act) safe(it.act, 'title ' + it.text);
  }
  function titleKey(k) {
    const T = st.title, n = T.items.length;
    if (isUp(k) || isDown(k)) { T.sel = (T.sel + (isUp(k) ? -1 : 1) + n) % n; sound('uiMove'); titleMark(); return; }
    if (isOk(k)) { titleActivate(); return; }
    const d = digitOf(k);
    if (d && d <= n) { T.sel = d - 1; titleActivate(); return; }
    if (isBack(k)) {
      if (T.view === 'chapters') { T.view = 'main'; T.sel = 3; sound('uiBack'); renderTitle(); }
      else S.close();   // Esc on the title returns to the lobby
    }
  }

  /* ── 17. Error overlay ────────────────────────────────────────────── */
  // main.js routes S.fail here (except errors from the UI itself). Throwing makes main use its own overlay.
  UI.error = function (err, ctx) {
    if (S.headless) return;
    if (!st.mounted || !st.L.err) throw new Error('story ui is not mounted');
    const e = err instanceof Error ? err : new Error(String(err && err.message !== undefined ? err.message : err));
    if (st.err) { st.err.more++; renderErr(); return; }
    st.err = { msg: e.message || String(e), src: (ctx && ctx.source) || '', more: 0, sel: 0 };
    renderErr();
    syncPause();
  };
  function errButtons() {
    const play = playMode();
    return [['keep', play ? 'Keep playing' : 'Close']].concat(play ? [['title', 'Back to the title']] : [], [['lobby', 'Back to the lobby']]);
  }
  function renderErr() {
    const E = st.err, L = st.L.err;
    if (!L) return;
    if (!E) { L.innerHTML = ''; return; }
    const bs = errButtons();
    E.sel = clamp(E.sel, 0, bs.length - 1);
    L.innerHTML = '<div class="su-err" role="alertdialog" aria-label="Something went wrong"><div class="su-err-box" tabindex="-1"><div class="su-kicker">Story Mode</div>' +
      '<h2>Something went wrong</h2><p class="msg">' + esc(E.msg) + '</p>' + (E.src ? '<p class="src">Where: ' + esc(E.src) + '</p>' : '') +
      (E.more ? '<p class="src">' + E.more + ' more error' + (E.more > 1 ? 's' : '') + ' since (see the console).</p>' : '') +
      '<div class="btns">' + bs.map((b, i) => '<button type="button" class="su-btn' + (b[0] === 'lobby' ? ' danger' : '') + (i === E.sel ? ' sel' : '') + '" data-e="' + b[0] + '">' + esc(b[1]) + '</button>').join('') +
      '</div><p class="src" style="margin-top:.8em">' + keyHtml('interact') + ' choose  ' + keyHtml('pause') + (playMode() ? ' keep playing' : ' close') + '</p></div></div>';
    if (!L._wired) {
      L._wired = true;
      L.addEventListener('click', (ev) => { const b = ev.target && ev.target.closest ? ev.target.closest('[data-e]') : null; if (b) errAct(b.getAttribute('data-e')); });
    }
    focusEl(L.querySelector('.su-err-box'));
  }
  function errAct(kind) {
    st.err = null;
    renderErr();
    syncPause();
    focusEl(topWin() ? topWin().el : st.root);
    if (kind === 'title') { closeAll('silent'); if (S.main && has(S.main, 'toTitle')) S.main.toTitle(); }
    else if (kind === 'lobby') S.close();
  }
  function errKey(k) {
    const E = st.err, bs = errButtons();
    if (isUp(k) || isLeft(k)) { E.sel = (E.sel - 1 + bs.length) % bs.length; renderErr(); }
    else if (isDown(k) || isRight(k)) { E.sel = (E.sel + 1) % bs.length; renderErr(); }
    else if (isOk(k)) errAct(bs[E.sel][0]);
    else if (isBack(k)) errAct('keep');
  }

  /* ── 18. The frame update ─────────────────────────────────────────── */
  function routeKey(k) {
    if (st.err) { errKey(k); return; }
    const w = topWin();
    if (w) {
      if (k.at < w.openedAt) return;   // pressed before this window existed (it opened earlier in this frame)
      if (w.key) w.key(k);
      return;
    }
    const mode = S.main && S.main.mode;
    if (st.titleOn) { if (mode === 'title') titleKey(k); return; }
    if (mode !== 'play') return;
    if (st.screen) { screenKey(k); return; }
    if (sayKey(k)) return;
    if (!canSummon()) return;
    if (k.action === 'pause' || k.code === 'Escape') { openWin('pause'); return; }
    if (k.action === 'journal') { openWin('journal'); return; }
    if (k.action === 'map') { openWin('journal', { tab: 'map' }); return; }
    if (k.action === 'minimap') cycleMinimap();
  }

  UI.update = function (dt) {
    if (S.headless || !st.mounted) return;
    dt = Math.max(0, Math.min(0.25, +dt || 0));
    // Keys first, routed to what was on screen when they were pressed (director changes this frame come after).
    const keys = st.keys.splice(0);
    for (const k of keys) { safe(() => routeKey(k), 'key'); if (!st.mounted) return; }
    if (st.titleOn && !(S.main && S.main.mode === 'title')) hideTitle();
    safe(syncDirectorDoc, 'doc sync');
    for (const w of st.windows.slice()) if (w.tick) safe(() => w.tick(dt), 'tick ' + w.name);
    if (!st.mounted) return;
    safe(updateScreens, 'screens');
    safe(updateCard, 'card');
    safe(updateSay, 'dialogue');
    safe(() => updateHud(dt), 'hud');
    safe(updateLabels, 'labels');
    safe(updateToasts, 'toasts');
    syncPause();
  };

  /* ── 19. Events -> toasts and resets ──────────────────────────────── */
  function on(name, fn) {
    S.events.on(name, (d) => { if (S.headless || !st.mounted) return; safe(() => fn(d || {}), 'event ' + name); });
  }
  const QUEST_NEW = { main: 'New quest', side: 'Optional quest', missable: 'Missable quest', collectable: 'Collectable' };
  on('toast', (d) => UI.toast(d.text, d.kind));
  on('quest', (d) => {
    const k = kindOf(d.kind), title = d.title || d.id;
    if (d.state === 'done') UI.toast(title, 'quest', { head: 'Quest complete', icon: '✓', iconCls: 'k-' + k });
    else if (d.state === 'failed') UI.toast(title, 'fail', { head: k === 'missable' ? 'Missed' : 'Quest closed' });
    else if ((d.step | 0) === 0) UI.toast(title, 'quest', { head: QUEST_NEW[k], icon: KIND_ICON[k], iconCls: 'k-' + k });
    else UI.toast(d.text || title, 'quest', { head: 'Quest updated · ' + title, icon: KIND_ICON[k], iconCls: 'k-' + k });
  });
  on('evidence', (d) => UI.toast(d.title || d.id, 'evidence'));
  on('memory', (d) => UI.toast(d.title || d.id, 'memory'));
  on('people', (d) => UI.toast(d.isNew ? d.name || d.id : (d.name || d.id) + ' — something new', 'people', { head: d.isNew ? 'Someone new' : 'People' }));
  on('checkpoint', (d) => {
    if (d.ok === false) UI.toast('Could not save. The browser may be blocking storage.', 'error');
    else UI.toast(d.label && d.label !== 'Checkpoint' ? d.label : 'Progress saved', 'checkpoint', { head: 'Checkpoint' });
  });
  on('fightLost', () => UI.toast('Down. The fight starts again.', 'info', { life: 2.4 }));
  on('mode', (d) => {
    if (d.mode !== 'title') hideTitle();
    if (d.mode !== 'play') { st.notices.slice().forEach(dropNotice); }
  });
  on('settings', () => { if (st.mm) st.mm.geoKey = ''; });
  on('resize', () => { if (st.mm) st.mm.geoKey = ''; });
  on('loaded', () => { st.toasts.slice().forEach(dropToast); });
  on('chapterStart', () => { st.toasts.slice().forEach(dropToast); if (st.place) st.place.loc = null; });
})(window.STORY);
