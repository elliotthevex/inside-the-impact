/* Story Mode — dev/stubs.js
   Minimal browser globals for running Story Mode headless in JavaScriptCore
   (`osascript -l JavaScript story/dev/headless.js <repoRoot> <command>`). ARCHITECTURE.md §11.

   The headless runner evaluates this file first, with indirect eval, so its top level runs in the
   global scope. It provides only what core.js and main.js touch when S.headless is true:
     window (= the global object), document (inert elements; canvases get a no-op 2D context),
     localStorage (in memory, fresh every run), performance.now(), console (buffered, not printed),
     setTimeout / clearTimeout (queued, never run by themselves), navigator, location, devicePixelRatio.
   requestAnimationFrame is deliberately left undefined: nothing in the simulation may wait on a frame.

   Extras for the runner (window.__stubs):
     console      { lines: [{level, text}], counts: {log, info, warn, error, debug} }
     timers       pending setTimeout callbacks; flushTimers() runs those that are due on the stub clock
     advance(s)   moves the stub clock (performance.now) forward by s seconds
     canvasCtx(w, h) a fresh no-op 2D context (the runner's --render check draws frames into one)
     drawCalls    number of 2D context calls made through stub contexts (render smoke test) */
(function (g) {
  'use strict';

  if (!g.window) g.window = g;
  const W = g.window;
  const noop = function () { /* stub */ };
  const T0 = Date.now();
  let clockOffset = 0;   // seconds added by __stubs.advance()

  /* ── console: buffered so the runner prints clean JSON ─────────────── */
  const con = { lines: [], counts: { log: 0, info: 0, warn: 0, error: 0, debug: 0 }, max: 400 };
  function fmt(args) {
    const out = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (typeof a === 'string') out.push(a);
      else if (a instanceof Error) out.push(a.message);
      else { try { out.push(JSON.stringify(a)); } catch (_) { out.push(String(a)); } }
    }
    const s = out.join(' ');
    return s.length > 400 ? s.slice(0, 400) + '…' : s;
  }
  function logger(level) {
    return function () {
      con.counts[level]++;
      if (con.lines.length < con.max) con.lines.push({ level, text: fmt(arguments) });
    };
  }
  W.console = {
    log: logger('log'), info: logger('info'), warn: logger('warn'), error: logger('error'), debug: logger('debug'),
    trace: logger('debug'), group: noop, groupEnd: noop, groupCollapsed: noop, table: logger('log'), assert(c) { if (!c) logger('error').apply(null, Array.prototype.slice.call(arguments, 1)); },
    time: noop, timeEnd: noop, dir: logger('log'),
  };

  /* ── clocks and timers ────────────────────────────────────────────── */
  W.performance = { now: () => Date.now() - T0 + clockOffset * 1000, timeOrigin: T0 };
  const timers = [];
  let timerSeq = 0;
  W.setTimeout = function (fn, ms) {
    const id = ++timerSeq;
    if (typeof fn === 'function') timers.push({ id, fn, at: W.performance.now() + (+ms || 0) });
    return id;
  };
  W.clearTimeout = function (id) { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); };
  W.setInterval = function () { return ++timerSeq; };   // never fires: simulation code must not use intervals
  W.clearInterval = noop;
  W.queueMicrotask = W.queueMicrotask || function (fn) { W.setTimeout(fn, 0); };

  /* ── a no-op 2D context (Proxy: any method is a no-op, any property is stored) ── */
  const stubs = { console: con, timers, drawCalls: 0 };
  const gradient = () => ({ addColorStop: noop });
  function makeCtx(canvas) {
    const state = {
      canvas, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000000', strokeStyle: '#000000',
      lineWidth: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', imageSmoothingEnabled: true,
      shadowBlur: 0, shadowColor: 'rgba(0,0,0,0)', shadowOffsetX: 0, shadowOffsetY: 0, filter: 'none', lineCap: 'butt', lineJoin: 'miter',
    };
    const methods = {
      createLinearGradient: gradient, createRadialGradient: gradient, createConicGradient: gradient,
      createPattern: () => ({ setTransform: noop }),
      measureText: (t) => ({ width: String(t || '').length * 6, actualBoundingBoxAscent: 7, actualBoundingBoxDescent: 2 }),
      getImageData: (x, y, w, h) => {
        w = Math.max(1, Math.min(4096, w | 0)); h = Math.max(1, Math.min(4096, h | 0));
        return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
      },
      createImageData: (w, h) => {
        if (w && typeof w === 'object') { h = w.height; w = w.width; }
        w = Math.max(1, Math.min(4096, w | 0)); h = Math.max(1, Math.min(4096, h | 0));
        return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
      },
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      isPointInPath: () => false, isPointInStroke: () => false, getLineDash: () => [],
      getContextAttributes: () => ({ alpha: true }),
    };
    return new Proxy(state, {
      get(t, k) {
        if (k in methods) { stubs.drawCalls++; return methods[k]; }
        if (k in t) return t[k];
        if (typeof k === 'symbol') return undefined;
        return function () { stubs.drawCalls++; };   // fillRect, drawImage, save, restore, setTransform, …
      },
      set(t, k, v) { t[k] = v; return true; },
    });
  }
  stubs.canvasCtx = function (w, h) { return makeCtx(makeElement('canvas', { width: w || 640, height: h || 360 })); };

  /* ── document: inert elements ─────────────────────────────────────── */
  function classList() {
    const set = new Set();
    return { add() { for (const c of arguments) set.add(c); }, remove() { for (const c of arguments) set.delete(c); },
      toggle(c, on) { const v = on === undefined ? !set.has(c) : !!on; if (v) set.add(c); else set.delete(c); return v; },
      contains: (c) => set.has(c), get length() { return set.size; }, toString: () => Array.from(set).join(' ') };
  }
  function makeElement(tag, init) {
    const el = {
      tagName: String(tag || 'div').toUpperCase(), nodeType: 1, children: [], childNodes: [], parentNode: null,
      style: { setProperty: noop, removeProperty: noop, getPropertyValue: () => '' }, dataset: {}, attributes: {},
      classList: classList(), className: '', id: '', textContent: '', innerHTML: '', value: '', disabled: false,
      width: 300, height: 150, clientWidth: 640, clientHeight: 360, offsetWidth: 640, offsetHeight: 360, offsetParent: null,
      appendChild(c) { if (c && typeof c === 'object') { if (c.parentNode && c.parentNode !== el) c.parentNode.removeChild(c); el.children.push(c); el.childNodes.push(c); c.parentNode = el; } return c; },
      removeChild(c) { const i = el.children.indexOf(c); if (i >= 0) { el.children.splice(i, 1); el.childNodes.splice(el.childNodes.indexOf(c), 1); } if (c) c.parentNode = null; return c; },
      insertBefore(c) { return el.appendChild(c); },
      remove() { if (el.parentNode) el.parentNode.removeChild(el); },
      append() { for (const c of arguments) el.appendChild(c); },
      prepend() { for (const c of arguments) el.appendChild(c); },
      setAttribute(k, v) { el.attributes[k] = String(v); if (k === 'id') el.id = String(v); if (k === 'class') el.className = String(v); },
      getAttribute: (k) => (k in el.attributes ? el.attributes[k] : null),
      removeAttribute(k) { delete el.attributes[k]; },
      hasAttribute: (k) => k in el.attributes,
      addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
      querySelector: () => null, querySelectorAll: () => [], getElementsByTagName: () => [], closest: () => null,
      contains: (c) => { for (let n = c; n; n = n.parentNode) if (n === el) return true; return false; },
      getBoundingClientRect: () => ({ left: 0, top: 0, right: el.clientWidth, bottom: el.clientHeight, x: 0, y: 0, width: el.clientWidth, height: el.clientHeight }),
      focus: noop, blur: noop, click: noop, scrollIntoView: noop, animate: () => ({ cancel: noop, finished: null }),
    };
    if (el.tagName === 'CANVAS') {
      let ctx = null;
      el.getContext = function (kind) {
        if (kind !== '2d') return null;     // no WebGL headless
        if (!ctx) ctx = makeCtx(el);
        return ctx;
      };
      el.toDataURL = () => 'data:,';
    }
    if (init) Object.assign(el, init);
    return el;
  }
  const docEl = makeElement('html'), head = makeElement('head'), body = makeElement('body');
  docEl.appendChild(head); docEl.appendChild(body);
  function findById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    for (const c of node.children || []) { const r = findById(c, id); if (r) return r; }
    return null;
  }
  W.document = {
    nodeType: 9, documentElement: docEl, head, body, readyState: 'complete', visibilityState: 'visible', hidden: false,
    activeElement: body, title: '',
    createElement: (tag) => makeElement(tag),
    createElementNS: (ns, tag) => makeElement(tag),
    createTextNode: (t) => ({ nodeType: 3, textContent: String(t), parentNode: null }),
    createDocumentFragment: () => makeElement('fragment'),
    getElementById: (id) => findById(docEl, id),
    querySelector: () => null, querySelectorAll: () => [], getElementsByTagName: () => [],
    addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
    hasFocus: () => false,
  };

  /* ── storage: in memory, empty at the start of every run ──────────── */
  function memStorage() {
    const m = new Map();
    return {
      getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
      setItem: (k, v) => { m.set(String(k), String(v)); },
      removeItem: (k) => { m.delete(String(k)); },
      clear: () => m.clear(),
      key: (i) => Array.from(m.keys())[i] || null,
      get length() { return m.size; },
    };
  }
  W.localStorage = memStorage();
  W.sessionStorage = memStorage();

  /* ── the rest of window ───────────────────────────────────────────── */
  W.navigator = { userAgent: 'StoryHeadless/1 (JavaScriptCore)', language: 'en-US', languages: ['en-US'], maxTouchPoints: 0, getGamepads: () => [] };
  W.location = { href: 'file:///story-headless/', search: '', hash: '', pathname: '/story-headless/', protocol: 'file:', host: '', origin: 'null' };
  W.devicePixelRatio = 1;
  W.innerWidth = 1280; W.innerHeight = 720;
  W.addEventListener = W.addEventListener || noop;
  W.removeEventListener = W.removeEventListener || noop;
  W.dispatchEvent = W.dispatchEvent || (() => true);
  W.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop });
  W.getComputedStyle = () => ({ getPropertyValue: () => '' });
  W.alert = noop; W.confirm = () => false; W.prompt = () => null;
  W.history = { pushState: noop, replaceState: noop, back: noop, state: null };
  // No AudioContext, no requestAnimationFrame: S.audio and the render loop stay off by construction.

  stubs.advance = function (sec) { clockOffset += +sec || 0; };
  stubs.flushTimers = function () {
    const now = W.performance.now();
    let n = 0;
    for (let i = 0; i < timers.length;) {
      if (timers[i].at <= now) { const t = timers.splice(i, 1)[0]; try { t.fn(); } catch (e) { W.console.error('timer: ' + (e && e.message)); } n++; }
      else i++;
    }
    return n;
  };
  W.__stubs = stubs;
})(typeof globalThis !== 'undefined' ? globalThis : this);
