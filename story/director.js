/* Story Mode — director.js
   Scene runner (generator scripts stepped with Wait objects), the script API `A`,
   dialogue and choice state, quests / evidence / memories / people / flags /
   relationships, chapter flow, checkpoints, resume-from-save and the autoplay
   policy used by headless tests. Contract: ARCHITECTURE.md §8, §9, §11.

   Wait object: { wait(dt) -> done?, result, start?(), ff?(), control?, noInterrupt?, autoplay? }
     start()      called once, when the wait is first polled
     ff()         applied instead of waiting while a resumed scene fast-forwards
     control      the player has control while the scene waits on this
     noInterrupt  other scenes queue instead of interrupting while this runs
     autoplay     { walkTo, interact, loc } hint for the test autopilot */
(function (S) {
  'use strict';

  const U = S.util;
  const { clamp, lerp, sign } = U;
  const clone = U.clone;
  const own = (o, k) => !!o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);
  const warned = Object.create(null);
  function warnOnce(key, msg) {
    if (warned[key]) return; warned[key] = true;
    try { console.warn('[story director]', msg); } catch (_) { /* no console */ }
  }
  function jsonSafe(v) {
    if (v === undefined) return null;
    try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; }
  }
  function safe(fn, source) {
    try { return fn(); } catch (err) { S.fail(err, { source: source || 'director' }); return undefined; }
  }

  /* ── 1. Registry: chapters, scenes, locations, people ─────────────── */
  const story = S.story = S.story || {};
  story.chapters = story.chapters || [];      // sparse, indexed by chapter id (99 = sandbox)
  story.scenes = story.scenes || {};          // shared scenes (cast.js / places.js)
  story.dialogs = story.dialogs || {};
  story.locations = story.locations || {};    // shared locations (places.js)
  story.people = story.people || {};          // base People archive entries (cast.js)
  story.quests = story.quests || {};
  story.evidence = story.evidence || {};
  story.memories = story.memories || {};
  const SANDBOX = 99;
  const LAST = 10;

  const KINDS = ['locations', 'quests', 'evidence', 'memories', 'people', 'scenes', 'dialogs'];
  S.defineChapter = function (def) {
    try {
      if (!def || typeof def !== 'object') throw new Error('S.defineChapter needs a ChapterDef object');
      const id = +def.id;
      if (!Number.isInteger(id) || id < 0) throw new Error('ChapterDef.id must be a non-negative integer (got ' + def.id + ')');
      def.id = id;
      for (const k of KINDS) if (!def[k] || typeof def[k] !== 'object') def[k] = {};
      if (!Array.isArray(def.mapNodes)) def.mapNodes = [];
      if (!Array.isArray(def.card)) def.card = def.card ? [String(def.card)] : [];
      if (!def.start || typeof def.start !== 'object') def.start = {};
      if (!def.title) def.title = 'Chapter ' + id;
      if (story.chapters[id] && story.chapters[id] !== def) warnOnce('dup' + id, 'chapter ' + id + ' registered twice; the later definition wins');
      story.chapters[id] = def;
      S.events.emit('chapterDefined', { n: id });
      return def;
    } catch (err) { S.fail(err, { source: 'defineChapter' }); return null; }
  };
  // Shared registries for content that belongs to no single chapter.
  S.defineScene = (id, fn) => { story.scenes[id] = fn; return fn; };
  S.defineLocation = (id, def) => {
    story.locations[id] = def;
    if (S.world && typeof S.world.defineLocation === 'function') S.world.defineLocation(id, def);
    return def;
  };
  S.definePerson = (id, def) => { story.people[id] = def; return def; };

  // Registered chapter ids in order (sandbox last).
  story.ids = function () { const out = []; story.chapters.forEach((d, i) => { if (d) out.push(i); }); return out; };
  story.has = (n) => !!story.chapters[+n];
  story.current = () => story.chapters[S.G ? S.G.chapter : 0] || null;

  /* Look an id up: the current chapter first, then shared registries, then earlier
     chapters (latest first), then later ones. 'c3:id' or '3:id' pins a chapter. */
  function lookup(kind, id) {
    if (id === undefined || id === null || id === '') return null;
    id = String(id);
    const m = /^c?(\d+)[:/](.+)$/.exec(id);
    if (m) { const d = story.chapters[+m[1]]; return d && own(d[kind], m[2]) ? d[kind][m[2]] : null; }
    const n = S.G ? S.G.chapter | 0 : 0;
    const cur = story.chapters[n];
    if (cur && own(cur[kind], id)) return cur[kind][id];
    if (own(story[kind], id)) return story[kind][id];
    for (let k = Math.min(n - 1, story.chapters.length - 1); k >= 0; k--) { const d = story.chapters[k]; if (d && own(d[kind], id)) return d[kind][id]; }
    for (let k = n + 1; k < story.chapters.length; k++) { const d = story.chapters[k]; if (d && own(d[kind], id)) return d[kind][id]; }
    return null;
  }
  story.lookup = lookup;
  // Locations may be written as (G) => LocationDef so they change with the story.
  story.location = function (id) {
    let L = lookup('locations', id);
    if (!L && S.world && S.world.locations && own(S.world.locations, id)) L = S.world.locations[id];
    if (typeof L === 'function') return safe(() => L(S.G, S), 'location ' + id) || null;
    return L || null;
  };
  story.scene = (id) => {
    const f = lookup('scenes', id) || lookup('dialogs', id);
    return typeof f === 'function' ? f : null;
  };
  story.questDef = (id) => lookup('quests', id);
  story.evidenceDef = (id) => lookup('evidence', id);
  story.memoryDef = (id) => lookup('memories', id);
  // People: chapter entries refine the base cast entry (notes are concatenated).
  story.person = function (id) {
    const base = own(story.people, id) ? story.people[id] : (S.cast && own(S.cast, id) ? S.cast[id] : null);
    const ch = lookup('people', id);
    if (!base) return ch || null;
    if (!ch || ch === base) return base;
    return Object.assign({}, base, ch, { notes: [].concat(base.notes || [], ch.notes || []) });
  };
  // Everything of one kind visible up to the current chapter (journal archives).
  function collect(kind) {
    const out = {}, n = S.G ? S.G.chapter | 0 : 0;
    Object.assign(out, story[kind]);
    for (const k of story.ids()) { if (k > n && k !== SANDBOX) continue; const d = story.chapters[k]; if (d) Object.assign(out, d[kind]); }
    return out;
  }
  story.allQuests = () => collect('quests');
  story.allEvidence = () => collect('evidence');
  story.allMemories = () => collect('memories');
  story.allPeople = function () {
    const out = {}, ids = Object.keys(collect('people'));
    for (const id of Object.keys(story.people)) if (!ids.includes(id)) ids.push(id);
    for (const id of ids) out[id] = story.person(id);
    return out;
  };
  story.mapNodes = function () {
    const def = story.current();
    return def && Array.isArray(def.mapNodes) ? def.mapNodes : [];
  };
  // Jin's look this chapter (world.js builds Jin with it).
  story.jinLook = () => (S.G && S.G.body && S.G.body.look) || 'jin';

  /* ── 2. Waits ─────────────────────────────────────────────────────── */
  const Wait = {
    instant: (result) => ({ wait: () => true, result }),
    // Completes on the next step (`yield` with nothing waits one step).
    step: (result) => ({ wait: (dt) => dt > 0, result }),
    timer(sec) { let t = 0; sec = Math.max(0, +sec || 0); return { wait(dt) { t += dt; return t >= sec - 1e-9; }, result: undefined }; },
    until(pred) { return { wait: () => !!pred(), result: undefined }; },
  };
  S.Wait = Wait;
  const isWait = (v) => !!v && typeof v === 'object' && typeof v.wait === 'function';
  const isIter = (v) => !!v && typeof v === 'object' && typeof v.next === 'function' && typeof v.throw === 'function';

  function poll(w, dt) {
    if (!w._started) { w._started = true; if (typeof w.start === 'function') w.start(); }
    return !!w.wait(dt);
  }
  // Anything a script yields becomes a Wait.
  function toWait(v) {
    if (v === undefined || v === null || v === true || v === false) return Wait.step();
    if (typeof v === 'number') return Wait.timer(v);
    if (isWait(v)) return v;
    if (isIter(v)) return genWait(v);
    if (typeof v === 'function') return { wait: () => !!v(S.G, S), result: true };
    if (Array.isArray(v)) return allWait(v.map(toWait));
    if (typeof v === 'object' && 'done' in v) {   // FightState, ActivityState, scene handles
      const w = { wait: () => !!v.done };
      Object.defineProperty(w, 'result', { get: () => (v.result !== undefined ? v.result : v) });
      return w;
    }
    return Wait.instant(v);
  }
  // A generator run inside a single wait (composites like A.timeskip, or `yield gen` without *).
  function genWait(gen) {
    let cur = null, done = false, value;
    const w = {
      result: undefined,
      wait(dt) {
        if (done) return true;
        if (cur) { if (!poll(cur, dt)) return false; value = cur.result; cur = null; }
        for (let g = 0; g < 200; g++) {
          const r = gen.next(value);
          if (r.done) { done = true; w.result = r.value; return true; }
          cur = toWait(r.value); value = undefined;
          if (!poll(cur, 0)) return false;
          value = cur.result; cur = null;
        }
        return false;
      },
    };
    return w;
  }
  function allWait(list) {
    const w = { result: undefined, wait(dt) {
      let all = true;
      for (const x of list) { if (x._done) continue; if (poll(x, dt)) x._done = true; else all = false; }
      if (all) w.result = list.map((x) => x.result);
      return all;
    } };
    return w;
  }

  /* ── 3. Tasks: tweens and movers that run whether or not a script yields ── */
  const tasks = [];
  function addTask(t) { t.done = !!t.done; if (!t.done) tasks.push(t); return t; }
  function updateTasks(dt) {
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (t.done || !t.update) continue;
      try { t.update(dt); } catch (err) { t.done = true; S.fail(err, { source: 'director task' }); }
    }
    for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].done) tasks.splice(i, 1);
  }
  // Tween obj[key] to `to` over `dur` seconds. A newer tween on the same field wins.
  function tween(obj, key, to, dur, easeFn) {
    for (const t of tasks) if (t.obj === obj && t.key === key) t.done = true;
    const task = { obj, key, done: false };
    to = +to || 0; dur = Math.max(0, +dur || 0);
    if (!obj) { task.done = true; return task; }
    if (dur === 0) { obj[key] = to; task.done = true; return task; }
    const from = +obj[key] || 0, e = easeFn || U.ease.inOut;
    let t = 0;
    task.update = (dt) => { t += dt; const k = Math.min(1, t / dur); obj[key] = lerp(from, to, e(k)); if (k >= 1) task.done = true; };
    task.finish = () => { obj[key] = to; task.done = true; };
    return addTask(task);
  }
  const taskWait = (task, extra) => Object.assign({ wait: () => task.done, result: undefined, ff() { if (task.finish) task.finish(); } }, extra || {});

  /* ── 4. Scene runner ──────────────────────────────────────────────── */
  let runnerSeq = 0;
  function makeHandle(label) {
    return { id: ++runnerSeq, label, done: false, cancelled: false, result: undefined, error: null,
      cancel() { if (this._runner) this._runner.cancel(); else { this.done = true; this.cancelled = true; dropQueued(this); } } };
  }
  function finishHandle(h, result, error, cancelled) {
    if (!h || h.done) return;
    h.done = true; h.result = result; h.error = error || null; h.cancelled = !!cancelled;
  }

  class Runner {
    constructor(gen, o) {
      this.gen = gen;
      this.label = o.label || 'scene';
      this.sceneId = o.sceneId || null;      // string id when the scene can be found again after a load
      this.target = o.target;
      this.args = o.args;
      this.system = !!o.system;               // chapter flows: hold control, never interrupted, not resumed as scenes
      this.resumeAs = o.resumeAs || null;     // what a save during a system flow resumes to
      this.hint = o.hint || null;             // scene-level autoplay hint
      this.ctrl = !!o.control;                // A.control(true) given
      this.wait = null; this.started = false; this.done = false;
      this.n = 0; this.cp = 0; this.results = [];
      this.ff = o.ff ? Object.assign({ results: [] }, o.ff) : null;   // fast-forward replay after a load
      this.ffLoc = this.ff ? (this.ff.loc || null) : null;
      this.startLoc = (S.world && S.world.locId) || (S.G && S.G.loc) || null;
      this.handle = o.handle || makeHandle(this.label);
      this.handle._runner = this;
    }
    hasControl() { return this.ctrl || !!(this.wait && this.wait.control); }
    canInterrupt() { return !this.system && !(this.wait && this.wait.noInterrupt); }
    update(dt) {
      if (this.done) return;
      let value;
      if (!this.started) this.started = true;
      else if (this.wait) {
        const w = this.wait;
        let ok;
        const prev = D.cur; D.cur = this;
        try { ok = poll(w, dt); } catch (err) { D.cur = prev; this.fail(err); return; }
        D.cur = prev;
        if (this.done) return;
        if (!ok) return;
        value = w.result; this.wait = null;
        if (!w.carry) this.results.push(jsonSafe(value));
      }
      this.resume(value);
    }
    resume(value) {
      for (let guard = 0; guard < 400; guard++) {
        let r;
        const prev = D.cur; D.cur = this;
        try { r = this.gen.next(value); } catch (err) { D.cur = prev; this.fail(err); return; }
        D.cur = prev;
        if (this.done) return;                                   // cancelled from inside the step
        if (D.endReq && !this.system) { this.finish(undefined); return; }   // A.endChapter / A.credits
        if (r.done) { this.finish(r.value); return; }
        const w = toWait(r.value);
        if (w.terminal) { this.finish(undefined); return; }
        this.n++;
        if (this.ff) {
          const ff = this.ff;
          // Yields before the save point complete at once with the result recorded then.
          if (this.n < ff.n || (this.n === ff.n && ff.sync)) {
            try { if (w.ff) w.ff(); } catch (_) { /* ignore */ }
            value = ff.results[this.n - 1]; if (value === null) value = undefined;
            this.results.push(jsonSafe(value));
            continue;
          }
          this.endFF();                                          // this wait runs for real
        }
        let ok;
        D.cur = this;
        try { ok = poll(w, 0); } catch (err) { D.cur = prev; this.fail(err); return; }
        D.cur = prev;
        if (this.done) return;
        if (ok) { value = w.result; this.results.push(jsonSafe(value)); continue; }
        this.wait = w;
        return;
      }
      // 400 instant waits in one step: carry on next step rather than freeze the page.
      this.wait = { wait: (dt) => dt > 0, result: value, _started: true, carry: true };
    }
    endFF() {
      if (!this.ff) return;
      this.ff = null; this.ffLoc = null;
      S.events.emit('sceneResumed', { label: this.label });
    }
    finish(value) {
      if (this.done) return;
      this.done = true; this.wait = null;
      finishHandle(this.handle, value, null, false);
    }
    fail(err) {
      S.fail(err, { source: 'scene ' + this.label });
      if (this.done) return;
      this.done = true; this.wait = null;
      finishHandle(this.handle, undefined, err, false);
      // Control returns to the player and play continues.
      if (D.dialog && D.dialog.owner === this) closeLine(D.dialog);
    }
    cancel() {
      if (this.done) return;
      this.done = true; this.wait = null;
      try { this.gen.return(); } catch (_) { /* a finally block threw; ignore */ }
      finishHandle(this.handle, undefined, null, true);
    }
  }

  /* ── 5. Director state, run(), update() ───────────────────────────── */
  const FX_DEFAULTS = { muffle: 0, blur: 0, double: 0, desat: 0, vignette: 0.25, heartbeat: 0, flash: 0, flashColor: '#ffffff',
    sepia: 0, letterbox: 0, fade: 0, fadeColor: '#000000' };
  function fx() { if (!S.fx) S.fx = Object.assign({}, FX_DEFAULTS); if (S.fx.fade === undefined) { S.fx.fade = 0; S.fx.fadeColor = '#000000'; } return S.fx; }
  fx();

  const D = S.director = S.director || {};
  Object.assign(D, {
    stack: [],          // main scene + interrupting scenes (top runs)
    queue: [],          // waiting requests { target, opts, handle, label }
    bg: [],             // background scenes (never take control)
    dialog: null,       // current line for the UI (see openLine)
    card: null,         // A.card title card { title, sub, seconds, t }
    screen: null,       // chapter card / completion / ending / credits / continued
    doc: null,          // document viewer request { doc, id, page, closed }
    policy: null,       // autoplay policy for tests
    objectiveOverride: null,
    history: [],        // last lines spoken (tests, backlog)
    progress: 0,        // bumps on any story progress (stuck detection)
    time: 0,
    cur: null,          // runner currently executing script code
    endReq: null,
    interactCooldown: 0,
    keys: true,         // director reads interact to advance plain dialogue lines (UI also may; double calls are debounced)
    autoHeadless: false, // headless without a policy: lines and screens close by themselves
  });
  const deferred = [];
  D.defer = (fn) => { deferred.push(fn); };
  const top = () => D.stack[D.stack.length - 1] || null;

  Object.defineProperty(D, 'busy', {
    configurable: true,
    // True while the player does NOT have control: a scene holds it, or a dialogue / card / screen / document is up.
    get() {
      if (D.dialog || D.screen || D.card || D.doc || D.endReq) return true;
      if (D.interactCooldown > 0) return true;
      const t = top();
      if (t && !t.done) return !t.hasControl();
      return D.queue.length > 0;
    },
  });
  Object.defineProperty(D, 'running', { configurable: true, get: () => D.stack.some((r) => !r.done) || D.queue.length > 0 });
  Object.defineProperty(D, 'control', { configurable: true, get: () => !D.busy });
  D.canInteract = () => !D.busy && !!(S.main ? S.main.mode === 'play' : true);
  D.label = () => { const t = top(); return t ? t.label : null; };

  function reverseSceneId(fn) {
    const def = story.current();
    for (const reg of [def && def.scenes, def && def.dialogs, story.scenes, story.dialogs]) {
      if (!reg) continue;
      for (const k in reg) if (reg[k] === fn) return k;
    }
    return null;
  }
  function makeRunner(target, opts, label, handle) {
    let fn = target, sceneId = opts.sceneId || null, gen = null;
    if (typeof target === 'string') {
      sceneId = target; fn = story.scene(target);
      if (!fn) {
        const err = new Error('Unknown scene "' + target + '"');
        S.fail(err, { source: 'director.run' }); finishHandle(handle, undefined, err); return null;
      }
    }
    if (isIter(target)) gen = target;
    else if (typeof fn !== 'function') {
      const err = new Error('director.run needs a scene id or a generator function');
      S.fail(err, { source: 'director.run' }); finishHandle(handle, undefined, err); return null;
    } else {
      if (!sceneId) sceneId = reverseSceneId(fn);
      try { gen = fn.call(null, A, S.G, opts.args); } catch (err) { S.fail(err, { source: 'scene ' + label }); finishHandle(handle, undefined, err); return null; }
      if (!isIter(gen)) { finishHandle(handle, gen); return null; }   // a plain function: already ran
    }
    const r = new Runner(gen, { label, sceneId, target, args: opts.args, system: opts.system, resumeAs: opts.resumeAs,
      hint: (fn && fn.autoplay) || opts.autoplay || null, control: opts.control, ff: opts.ff, handle });
    D.progress++;
    S.events.emit('sceneStart', { label, id: sceneId });
    return r;
  }
  function dropQueued(h) { const i = D.queue.findIndex((q) => q.handle === h); if (i >= 0) D.queue.splice(i, 1); }

  /* run(scene, opts) -> handle. opts: { label, args, queue (never interrupt), front (queue first),
     background (parallel, never takes control), control (start with control given), allowDuplicate } */
  D.run = function (target, opts) {
    opts = opts || {};
    if (target === undefined || target === null) return null;
    const label = opts.label || (typeof target === 'string' ? target : (target.name || 'scene'));
    const handle = makeHandle(label);
    if (opts.background) {
      const r = makeRunner(target, opts, label, handle);
      if (r) D.bg.push(r);
      return handle;
    }
    if (!opts.allowDuplicate && !isIter(target)) {
      for (const r of D.stack) if (!r.done && r.target === target) return r.handle;
      for (const q of D.queue) if (q.target === target) return q.handle;
    }
    const t = top();
    const interrupt = t && !t.done && !opts.queue && t.hasControl() && t.canInterrupt();
    if ((t && !t.done && !interrupt) || (!t && D.queue.length && !opts.now) || D.endReq) {
      const q = { target, opts, handle, label };
      if (opts.front) D.queue.unshift(q); else D.queue.push(q);
      return handle;
    }
    const r = makeRunner(target, opts, label, handle);
    if (r) D.stack.push(r);
    return handle;
  };
  D.runSystem = (gen, opts) => D.run(gen, Object.assign({ system: true, now: true, allowDuplicate: true }, opts || {}));
  D.parallel = (target, opts) => D.run(target, Object.assign({}, opts || {}, { background: true }));

  function startQueued() {
    const q = D.queue.shift();
    if (!q) return;
    const r = makeRunner(q.target, q.opts, q.label, q.handle);
    if (r) D.stack.push(r);
  }

  const scripted = new Set();   // actors a scene moved or posed (released when control returns)
  const heldVirtual = new Set(); // virtual keys the director holds for Jin
  function holdKey(a, on) {
    if (!S.input || !S.input.virtualDown) return;
    S.input.virtualDown(a, !!on);
    if (on) heldVirtual.add(a); else heldVirtual.delete(a);
  }
  function releaseKeys() { for (const a of Array.from(heldVirtual)) holdKey(a, false); }

  // When the last scene ends: release actors, camera, letterbox and fade back to the player.
  function returnControl() {
    for (const a of scripted) if (!a.poseHold) { a.scripted = false; a.scriptPose = null; }
    scripted.clear();
    releaseKeys();
    const jin = S.world && S.world.jin;
    if (jin && !jin.poseHold) jin.scriptPose = null;
    if (S.cam && S.cam.mode === 'scripted' && typeof S.cam.follow === 'function') safe(() => S.cam.follow(), 'cam.follow');
    const f = fx();
    if (f.letterbox > 0) tween(f, 'letterbox', 0, 0.45);
    if (f.fade > 0) tween(f, 'fade', 0, 0.6);
    if (S.timeScale !== 1) tween(S, 'timeScale', 1, 0.25);
    if (D.objectiveOverride) { D.objectiveOverride = null; S.events.emit('objective', { text: null }); }
    S.events.emit('control', { player: true });
  }

  let lastAdvance = -1, lastSel = -1, hbT = 0, lastAutosave = -1e9, pendingLocSave = false;

  D.update = function (dt) {
    if (S.paused) return;
    D.time += dt;
    if (deferred.length) for (const fn of deferred.splice(0)) safe(fn, 'director deferred');
    if (D.interactCooldown > 0) { D.interactCooldown -= dt; if (S.input) S.input.consume('interact'); }
    updateTasks(dt);
    updateDialog(dt);
    // Main stack: only the top scene runs; finished scenes pop and queued ones start in the same step.
    for (let guard = 0, first = true; guard < 12; guard++) {
      if (D.endReq) break;
      const t = top();
      if (!t) {
        if (!D.queue.length) break;
        startQueued(); continue;
      }
      if (t.done) {
        D.stack.pop();
        S.events.emit('sceneEnd', { label: t.label, error: t.handle.error ? String(t.handle.error.message || t.handle.error) : null });
        if (!D.stack.length && !D.queue.length && !D.endReq) returnControl();
        continue;
      }
      t.update(first ? dt : 0); first = false;
      if (!t.done) break;
    }
    for (let i = 0; i < D.bg.length; i++) D.bg[i].update(dt);
    for (let i = D.bg.length - 1; i >= 0; i--) if (D.bg[i].done) D.bg.splice(i, 1);
    if (S.input && S.input.lock) S.input.lock(D.busy);
    // Heartbeat fx also beats in the audio (world.js does it when it renders the fx; this is the fallback).
    const f = fx();
    if (f.heartbeat > 0.15 && !(S.world && typeof S.world.update === 'function')) { hbT -= dt; if (hbT <= 0) { hbT = 1.15 - 0.45 * clamp(f.heartbeat, 0, 1); S.audio.play('heartbeat', { vol: clamp(f.heartbeat, 0.2, 1) }); } }
    else hbT = 0;
    // Autosave on entering a location (world.js does it on enter) — fallback only when world does not.
    if (pendingLocSave && !D.busy && !D.stack.some((r) => r.system)) {
      pendingLocSave = false;
      if (S.time - lastAutosave >= 20 && !(S.world && S.world.enter && S.world.locationDef)) D.checkpoint(null, { quiet: true });
    }
  };

  // Clear every scene, request and effect (chapter start, load, title).
  D.reset = function () {
    // A fight, bout or activity from the scene being dropped must not outlive it.
    const cs = S.combat && S.combat.state;
    if (cs && ((cs.fight && !cs.fight.done) || (cs.bout && !cs.bout.done)) && typeof S.combat.endFight === 'function') safe(() => S.combat.endFight(), 'combat.endFight');
    if (S.activities && S.activities.running && typeof S.activities.cancel === 'function') safe(() => S.activities.cancel('reset'), 'activities.cancel');
    for (const r of D.stack) r.cancel();
    for (const r of D.bg) r.cancel();
    for (const q of D.queue) finishHandle(q.handle, undefined, null, true);
    D.stack.length = 0; D.queue.length = 0; D.bg.length = 0; tasks.length = 0; deferred.length = 0;
    D.dialog = null; D.card = null; D.screen = null; D.doc = null; D.objectiveOverride = null;
    D.endReq = null; D.cur = null; D.interactCooldown = 0; lastLine = null; lastChoice = null;
    releaseKeys();
    for (const a of scripted) { a.scripted = false; a.scriptPose = null; a.poseHold = false; }
    scripted.clear();
    S.timeScale = 1; S.hitstop = 0;
    Object.assign(fx(), FX_DEFAULTS);
    if (S.audio && S.audio.muffle) S.audio.muffle(0, 0.1);
    if (S.input && S.input.lock) S.input.lock(false);
    pendingLocSave = false;
  };

  /* ── 6. Dialogue ──────────────────────────────────────────────────── */
  let lineSeq = 0, lastLine = null, lastChoice = null;
  const CPS = 42;   // typewriter characters per second at text speed 1

  function actor(id) {
    if (id && typeof id === 'object') return id;
    if (!S.world) return null;
    if (id === 'jin' || id === 'Jin') return S.world.jin || null;
    return typeof S.world.actor === 'function' ? S.world.actor(id) || null : null;
  }
  const isJin = (a) => !!a && !!S.world && a === S.world.jin;
  function speakerName(who, opts) {
    if (opts && opts.name) return opts.name;
    if (who === undefined || who === null) return null;
    if (who === 'jin' || who === 'Jin') return 'Jin';
    const a = actor(who); if (a && a.name) return a.name;
    const p = story.person(who); if (p && p.name) return p.name;
    return String(who).replace(/^\w/, (c) => c.toUpperCase());
  }
  function openLine(d) {
    if (D.dialog) closeLine(D.dialog, true);
    const text = String(d.text === undefined || d.text === null ? '' : d.text);
    const line = {
      id: ++lineSeq, speaker: d.speaker === undefined ? null : d.speaker, name: d.name === undefined ? null : d.name,
      text, shown: 0, thought: !!d.thought, narration: (d.speaker === undefined || d.speaker === null) && !d.thought,
      choices: null, sel: 0, t: 0, done: false, auto: +d.auto || 0, picked: -1, acc: 0, owner: D.cur,
    };
    if (S.settings.textSpeed >= 3) line.shown = text.length;
    D.dialog = line; lastLine = line;
    D.history.push({ name: line.name, text, thought: line.thought, chapter: S.G.chapter });
    if (D.history.length > 200) D.history.splice(0, D.history.length - 200);
    const a = line.speaker ? actor(line.speaker) : null;
    if (a) a.talking = true;
    line.actor = a || null;
    S.events.emit('dialog', line);
    return line;
  }
  function closeLine(line, replaced) {
    line.done = true;
    if (line.actor) line.actor.talking = false;
    if (D.dialog === line) {
      D.dialog = null;
      if (!replaced) {
        D.interactCooldown = Math.max(D.interactCooldown, 0.18);   // the closing press must not start a new talk
        if (S.input) S.input.consume('interact');
        S.events.emit('dialogEnd', { id: line.id });
      }
    }
  }
  function enabledOf(o) {
    if (o.enabled === undefined) return true;
    if (typeof o.enabled === 'function') return !!safe(() => o.enabled(S.G, S), 'choice enabled');
    return !!o.enabled;
  }
  function moveSel(line, d) {
    const n = line.choices.length; if (!n) return;
    for (let k = 1; k <= n; k++) { const i = ((line.sel + d * k) % n + n) % n; if (line.choices[i].enabled) { line.sel = i; break; } }
    S.audio.play('uiMove');
  }

  function updateDialog(dt) {
    const line = D.dialog;
    if (!line || line.done) return;
    line.t += dt;
    const len = line.text.length;
    if (line.shown < len) {
      const sp = S.settings.textSpeed >= 3 ? 1e9 : CPS * clamp(+S.settings.textSpeed || 1, 0.5, 2);
      line.acc += sp * dt;
      const k = Math.floor(line.acc);
      if (k > 0) { line.acc -= k; line.shown = Math.min(len, line.shown + k); }
    }
    const P = D.policy;
    if (P) {
      line.shown = len;
      if (line.choices) pickByPolicy(line);
      else if (P.autoAdvance !== false) closeLine(line);
      return;
    }
    if (S.headless && !line.choices && line.t > 0.05 && D.autoHeadless) { closeLine(line); return; }
    if (!line.choices && line.auto > 0 && line.shown >= len && line.t >= line.auto) { closeLine(line); return; }
    // Keyboard: plain lines advance on interact. Choices are navigated by the UI when it exists.
    if (D.keys && S.input) {
      if (line.choices) {
        if (!S.ui && line.shown >= len) {
          if (S.input.pressed('up')) moveSel(line, -1);
          if (S.input.pressed('down')) moveSel(line, 1);
          if (S.input.pressed('interact')) D.choose(line.sel, 'key');
        }
      } else if (S.input.pressed('interact')) D.advance('key');
    }
  }
  function pickByPolicy(line) {
    let i = 0;
    try { i = D.policy.choose(line.choices, { prompt: line.text, id: line.choiceId, options: line.options, chapter: S.G.chapter, scene: D.label(), G: S.G }); }
    catch (err) { S.fail(err, { source: 'policy.choose' }); i = 0; }
    i = i | 0;
    if (!line.choices[i] || !line.choices[i].enabled) i = line.choices.findIndex((c) => c.enabled);
    if (i < 0) i = 0;
    pick(line, i);
  }
  function pick(line, i) {
    if (line.picked >= 0) return false;
    line.picked = i; line.sel = i;
    const o = line.options[i];
    const value = o.value !== undefined ? o.value : o._index;
    line.value = value;
    // Remember the decision in plain words for the completion screen.
    const entry = { chapter: S.G.chapter, id: line.choiceId || (line.text ? line.text.slice(0, 60) : null), text: o.record || o.text,
      value: jsonSafe(value), minor: !(o.record || line.recordAll) };
    S.G.choices.push(entry);
    if (S.G.choices.length > 400) S.G.choices.splice(0, S.G.choices.length - 400);
    lastChoice = { entry, runner: D.cur || line.owner };
    S.events.emit('choice', { id: entry.id, text: o.text, value: entry.value });
    S.audio.play('ui');
    D.progress++;
    closeLine(line);
    return true;
  }

  /* Debounce across channels only: the director's own key read ('key') and a UI call ('ui', the default)
     for the same press land within a frame of each other, so the second is dropped. Two presses on one
     channel always both count (fast readers, tests). */
  let advSrc = null, selSrc = null;
  D.advance = function (src) {
    src = src === 'key' ? 'key' : 'ui';
    const l = D.dialog;
    // With no line up, advance confirms a chapter / completion screen or skips a title card (mouse clicks).
    if (!l || l.done) return D.screen || D.card ? D.dismiss() : false;
    if (lastAdvance >= 0 && src !== advSrc && S.realTime - lastAdvance < 0.1) return false;
    lastAdvance = S.realTime; advSrc = src;
    if (l.shown < l.text.length) { l.shown = l.text.length; return true; }
    if (l.choices) return false;
    closeLine(l);
    return true;
  };
  D.choose = function (i, src) {
    src = src === 'key' ? 'key' : 'ui';
    const l = D.dialog;
    if (!l || !l.choices || l.done) return false;
    if (lastSel >= 0 && src !== selSrc && S.realTime - lastSel < 0.1) return false;
    const c = l.choices[i | 0];
    if (!c || !c.enabled) { S.audio.play('uiBack'); return false; }
    lastSel = S.realTime; selSrc = src;
    l.shown = l.text.length;
    return pick(l, i | 0);
  };
  D.moveSel = function (d) { const l = D.dialog; if (l && l.choices) moveSel(l, d < 0 ? -1 : 1); };

  /* ── 7. Script API `A` ────────────────────────────────────────────── */
  // Fast-forward helpers for a resumed scene (see Runner.ff).
  function ffYield() {        // the wait about to be created is replayed, not shown
    const r = D.cur; if (!r || !r.ff) return false;
    const k = r.n + 1;
    return k < r.ff.n || (k === r.ff.n && r.ff.sync);
  }
  function ffMut() {          // state writes before the save point already live in the loaded G
    const r = D.cur; if (!r || !r.ff) return false;
    return r.ff.sync ? true : r.n < r.ff.n;
  }
  function ffWorldOk() {      // world edits replay only while the replay is in the same place as the player
    const r = D.cur; if (!r || !r.ff) return true;
    return !r.ffLoc || !S.world || r.ffLoc === S.world.locId;
  }
  const ffOn = () => !!(D.cur && D.cur.ff);

  const A = S.A = {};

  A.say = function (who, text, opts) {
    opts = opts || {};
    if (ffYield()) return Wait.instant();
    if (Array.isArray(text)) {
      const lines = text.slice();
      return genWait((function* () { for (const t of lines) yield A.say(who, t, opts); })());
    }
    if (who && opts.pose) A.pose(who, opts.pose);
    if (who && opts.face !== undefined) A.face(who, opts.face);
    const thought = !!opts.thought;
    const line = openLine({ speaker: who === undefined ? null : who, name: thought && !opts.name ? null : speakerName(who, opts), text, thought, auto: opts.wait });
    return { wait: () => line.done, result: undefined, line };
  };
  A.think = (text, opts) => A.say('jin', text, Object.assign({}, opts || {}, { thought: true }));
  A.narrate = (text, opts) => A.say(null, text, opts);

  /* choice(prompt, options, opts) -> chosen value (option.value, else its index).
     option: { text, value, when?(G), enabled?(G)|bool, hint, record?: 'plain words for the completion screen', policy?: 'restraint'|'ruthless' }
     Options whose `when` is false are hidden. A disabled option is shown with its hint (why). */
  A.choice = function (prompt, options, opts) {
    opts = opts || {};
    if (ffYield()) return Wait.instant();
    const all = (options || []).map((o, i) => (typeof o === 'string' ? { text: o, value: i, _index: i } : Object.assign({}, o, { _index: i })));
    const vis = all.filter((o) => !o.when || !!safe(() => o.when(S.G, S), 'choice when'));
    if (!vis.length) { warnOnce('nochoice' + prompt, 'A.choice: every option is hidden (' + prompt + ')'); return Wait.instant(undefined); }
    let base;
    if (prompt) base = { speaker: opts.who === undefined ? null : opts.who, name: opts.who ? speakerName(opts.who, opts) : null, text: prompt, thought: !!opts.thought };
    else if (lastLine) base = { speaker: lastLine.speaker, name: lastLine.name, text: lastLine.text, thought: lastLine.thought };
    else base = { speaker: null, name: null, text: '' };
    const line = openLine(base);
    if (!prompt) line.shown = line.text.length;
    line.options = vis;
    line.choiceId = opts.id || null;
    line.recordAll = !!opts.record;
    line.choices = vis.map((o) => ({ text: String(o.text), enabled: enabledOf(o), hint: o.hint || null }));
    line.sel = Math.max(0, line.choices.findIndex((c) => c.enabled));
    S.events.emit('choices', line);
    return { wait: () => line.picked >= 0, get result() { return line.value; }, line };
  };

  A.wait = (seconds) => (ffYield() ? Wait.instant() : Wait.timer(seconds));

  // NPCs move directly; Jin is driven with virtual keys so his own controller animates him.
  function npcWalkTask(a, x, opts) {
    for (const t of tasks) if (t.walker === a) t.done = true;
    const speed = +opts.speed || (opts.run ? 150 : 54);
    a.scripted = true; scripted.add(a);
    const task = { walker: a, reached: false, done: false };
    const arrive = () => {
      a.x = x; a.vx = 0; task.reached = true; task.done = true;
      const p = opts.pose || 'idle';
      a.pose = p; a.poseT = 0; a.scriptPose = opts.pose || null;
      if (opts.face !== undefined) A.face(a, opts.face);
    };
    task.update = (dt) => {
      if (!S.world || a.removed) { task.done = true; return; }
      if (S.hitstop > 0) return;
      const d = x - a.x;
      if (Math.abs(d) <= 0.5) { arrive(); return; }
      const ts = S.timeScale === undefined ? 1 : S.timeScale;
      const stepX = Math.min(Math.abs(d), speed * dt * ts);
      a.x += sign(d) * stepX; a.face = sign(d); a.vx = sign(d) * speed;
      const pose = opts.run ? 'run' : 'walk';
      if (a.pose !== pose) { a.pose = pose; a.poseT = 0; }
      a.scriptPose = pose;
      if (S.world.groundAt) { const g = safe(() => S.world.groundAt(a.x, a.y - 4), 'groundAt'); if (typeof g === 'number' && isFinite(g)) a.y = g; }
    };
    task.finish = arrive;
    return task;
  }
  function jinWalkTask(j, x, opts) {
    for (const t of tasks) if (t.walker === j) t.done = true;
    const dir = sign(x - j.x) || 1, key = dir > 0 ? 'right' : 'left', other = dir > 0 ? 'left' : 'right';
    const maxT = Math.abs(x - j.x) / 35 + 2.5;
    let t = 0, still = 0, lastX = j.x;
    j.scriptPose = null;
    const task = { walker: j, reached: false, done: false };
    const stop = () => {
      holdKey(key, false); if (opts.run) holdKey('run', false);
      task.reached = Math.abs(x - j.x) <= 8; task.done = true;
      if (opts.face !== undefined) A.face(j, opts.face);
    };
    task.update = (dt) => {
      if (!S.world || S.world.jin !== j) { stop(); return; }
      t += dt;
      const d = x - j.x;
      if (Math.abs(d) <= 3 || sign(d) !== dir || t > maxT) { stop(); return; }
      holdKey(other, false); holdKey(key, true); if (opts.run) holdKey('run', true);
      if (Math.abs(j.x - lastX) < 0.02) still += dt; else still = 0;
      lastX = j.x;
      if (still > 0.6 && t > 0.4) stop();   // blocked by a wall or a closed door
    };
    task.finish = () => { holdKey(key, false); if (opts.run) holdKey('run', false); task.done = true; };
    return task;
  }
  const hasController = () => !!(S.combat && typeof S.combat.updateActor === 'function');
  const W_has = (fn) => !!(S.world && typeof S.world[fn] === 'function');
  function worldWalkOpts(o) {
    const out = {};
    for (const k of ['run', 'speed', 'face', 'pose', 'endPose']) if (o[k] !== undefined) out[k] = o[k];
    if (typeof out.face === 'number') out.face = sign(out.face) || 1;
    return out;
  }

  A.walk = function (id, x, opts) {
    opts = opts || {};
    const a = actor(id);
    if (ffYield()) {
      if (a && !isJin(a) && ffWorldOk()) {
        if (W_has('place')) safe(() => S.world.place(a, +x), 'world.place'); else { a.x = +x; a.vx = 0; }
        if (opts.face !== undefined) A.face(a, opts.face);
      }
      return Wait.instant(true);
    }
    if (!a) { warnOnce('walk' + id, 'A.walk: no actor "' + id + '" in this location'); return Wait.instant(false); }
    x = +x;
    if (!isFinite(x)) return Wait.instant(false);
    // world.js owns actor motion when it offers walkTo (it drives Jin too, with collision).
    if (W_has('walkTo')) {
      if (!isJin(a)) scripted.add(a);
      const w = safe(() => S.world.walkTo(a, x, worldWalkOpts(opts)), 'world.walkTo');
      return isWait(w) ? w : Wait.instant(false);
    }
    const task = addTask(isJin(a) && hasController() ? jinWalkTask(a, x, opts) : npcWalkTask(a, x, opts));
    return { wait: () => task.done, get result() { return task.reached; }, ff() { if (task.finish) task.finish(); } };
  };
  A.walkTo = function (id, otherId, gap, opts) {
    const a = actor(id), b = actor(otherId);
    if (!a || !b) return A.walk(id, a ? a.x : 0, opts);
    gap = gap === undefined ? 24 : +gap;
    if (!ffYield() && W_has('walkToActor')) {
      if (!isJin(a)) scripted.add(a);
      const w = safe(() => S.world.walkToActor(a, b, gap, worldWalkOpts(opts || {})), 'world.walkToActor');
      return isWait(w) ? w : Wait.instant(false);
    }
    const side = sign(a.x - b.x) || -1;
    const w = A.walk(a, b.x + side * gap, opts);
    return { wait(dt) { if (!w.wait(dt)) return false; A.face(a, b); return true; }, get result() { return w.result; }, ff() { if (w.ff) w.ff(); } };
  };
  A.face = function (id, dirOrId) {
    const a = actor(id);
    if (!a || (ffOn() && !ffWorldOk())) return;
    let f;
    if (typeof dirOrId === 'number') f = sign(dirOrId) || 1;
    else { const b = actor(dirOrId); if (!b) return; f = sign(b.x - a.x) || a.face || 1; }
    if (W_has('face')) safe(() => S.world.face(a, f), 'world.face'); else a.face = f;
  };
  /* pose(id, pose, { hold }) — sets actor.pose and the sticky actor.scriptPose (renderers prefer scriptPose).
     hold: seconds -> clears after that long; true -> survives the end of the scene. pose null clears. */
  A.pose = function (id, pose, opts) {
    const a = actor(id);
    if (!a || (ffOn() && !ffWorldOk())) return;
    opts = opts || {};
    if (!pose) {
      a.scriptPose = null; a.poseHold = false;
      if (!isJin(a) && W_has('setPose')) safe(() => S.world.setPose(a, (a.placement && a.placement.pose) || 'idle'), 'world.setPose');
      return;
    }
    if (W_has('setPose')) {
      // world: hold seconds -> back to the resting pose after; otherwise the pose becomes the NPC's resting pose.
      const o = {};
      if (+opts.hold > 0) o.hold = +opts.hold; else if (opts.hold === true && isJin(a)) o.hold = true;
      if (opts.t !== undefined) o.t = opts.t;
      safe(() => S.world.setPose(a, pose, o), 'world.setPose');
      if (isJin(a)) { if (opts.hold === true) a.poseHold = true; scripted.add(a); }
      return;
    }
    a.pose = pose; a.poseT = 0; a.scriptPose = pose;
    if (!isJin(a)) a.scripted = true;
    scripted.add(a);
    if (opts.hold === true) a.poseHold = true;
    else if (+opts.hold > 0) {
      let t = 0; const h = +opts.hold;
      addTask({ update(dt) { t += dt; if (t >= h) { if (a.scriptPose === pose) a.scriptPose = null; this.done = true; } } });
    }
  };
  A.place = function (id, x, y) {
    const a = actor(id);
    if (!a || (ffOn() && (isJin(a) || !ffWorldOk()))) return;
    if (W_has('place')) { safe(() => S.world.place(a, x === undefined || x === null ? a.x : +x, y === undefined ? null : y), 'world.place'); return; }
    if (x !== undefined && x !== null) a.x = +x;
    if (y !== undefined && y !== null) a.y = +y;
    else if (S.world && S.world.groundAt) { const g = safe(() => S.world.groundAt(a.x, a.y - 4), 'groundAt'); if (typeof g === 'number' && isFinite(g)) a.y = g; }
    a.vx = 0; a.vy = 0;
  };
  A.show = function (id, on) {
    const a = actor(id);
    if (!a || (ffOn() && !ffWorldOk())) return;
    if (W_has('show')) safe(() => S.world.show(a, !!on), 'world.show'); else { a.hidden = !on; a.visible = !!on; }
  };
  A.spawn = function (placement) {
    if (ffOn() && !ffWorldOk()) return null;
    if (!S.world || !S.world.spawn) { warnOnce('spawn', 'A.spawn: world has no spawn()'); return null; }
    return safe(() => S.world.spawn(placement), 'A.spawn') || null;
  };
  A.remove = function (id) {
    if (ffOn() && !ffWorldOk()) return;
    if (S.world && S.world.remove) safe(() => S.world.remove(id), 'A.remove');
  };
  A.bark = function (id, text, seconds) {
    if (ffOn()) return;
    seconds = seconds === undefined ? 2.5 : +seconds;
    if (S.world && typeof S.world.bark === 'function') { safe(() => S.world.bark(id, text, seconds), 'A.bark'); return; }
    const a = actor(id);
    if (a) a.bark = { text: String(text), until: S.time + seconds, t: seconds };
    S.events.emit('bark', { id, text: String(text), seconds });
  };

  // Camera. S.cam.to returns a Wait (world.js); x/y name the centre of the view.
  A.cam = function (o) {
    o = Object.assign({}, o || {});
    if (o.target) { const a = actor(o.target); if (a) { if (o.x === undefined) o.x = a.x; if (o.y === undefined) o.y = a.y - 24; } }
    const replay = ffYield();
    if (replay) o.dur = 0;
    if (S.cam && typeof S.cam.to === 'function') {
      const w = safe(() => S.cam.to(o), 'cam.to');
      if (replay) { if (isWait(w)) safe(() => w.wait(1), 'cam.to'); return Wait.instant(); }
      return isWait(w) ? w : Wait.timer(o.dur || 0);
    }
    // Fallback when world.js has no cam.to: tween the fields directly.
    if (!S.cam) return Wait.instant();
    S.cam.mode = 'scripted';
    const ts = [];
    if (o.x !== undefined) ts.push(tween(S.cam, 'x', o.x - S.W / 2, o.dur || 0));
    if (o.y !== undefined) ts.push(tween(S.cam, 'y', o.y - S.H / 2, o.dur || 0));
    if (o.zoom !== undefined) ts.push(tween(S.cam, 'zoom', o.zoom, o.dur || 0));
    return { wait: () => ts.every((t) => t.done), result: undefined };
  };
  A.follow = function (id) {
    if (!S.cam || typeof S.cam.follow !== 'function') return;
    const a = id ? actor(id) : null;
    safe(() => (a ? S.cam.follow(a) : S.cam.follow()), 'cam.follow');
  };
  A.shake = function (amount, dur) {
    if (ffOn()) return;
    if (S.cam && typeof S.cam.shakeIt === 'function') safe(() => S.cam.shakeIt(amount === undefined ? 2 : amount, dur === undefined ? 0.3 : dur), 'cam.shakeIt');
  };

  A.letterbox = function (on, dur) {
    const replay = ffYield();
    const t = tween(fx(), 'letterbox', on === false || on === 0 ? 0 : 1, replay ? 0 : (dur === undefined ? 0.6 : dur));
    return replay ? Wait.instant() : taskWait(t);
  };
  // fade(to, dur, color): to 1 (or 'out') = covered, 0 (or 'in') = clear.
  A.fade = function (to, dur, color) {
    const replay = ffYield();
    const f = fx();
    const v = to === 'out' || to === true ? 1 : to === 'in' || to === false ? 0 : clamp(+to || 0, 0, 1);
    if (color) f.fadeColor = color;
    else if (v > 0 && f.fade <= 0.001) f.fadeColor = '#000000';
    const t = tween(f, 'fade', v, replay ? 0 : (dur === undefined ? 0.8 : dur));
    return replay ? Wait.instant() : taskWait(t);
  };
  A.flash = function (color, dur) {
    const replay = ffYield();
    const f = fx();
    if (replay) { f.flash = 0; return Wait.instant(); }
    f.flashColor = color || '#ffffff';
    f.flash = clamp(S.settings.flash === undefined ? 1 : S.settings.flash, 0, 1);
    const t = tween(f, 'flash', 0, dur === undefined ? 0.25 : dur, U.ease.out);
    return taskWait(t);
  };
  /* fx(name, amount, dur): for every name amount 0 = off.
     'slowmo' amount a sets S.timeScale = 1 - a (0.7 -> 30% speed, 1 -> freeze frame).
     'flash' jumps to amount and decays over dur. 'muffle' also muffles the audio. */
  A.fx = function (name, amount, dur) {
    const replay = ffYield();
    amount = amount === undefined ? 1 : +amount;
    dur = replay ? 0 : (dur === undefined ? 0.5 : Math.max(0, +dur));
    const f = fx();
    let t;
    if (name === 'slowmo') t = tween(S, 'timeScale', clamp(1 - amount, 0, 1), dur);
    else if (name === 'flash') { if (replay) { f.flash = 0; return Wait.instant(); } f.flash = clamp(amount, 0, 1) * clamp(S.settings.flash, 0, 1); t = tween(f, 'flash', 0, dur || 0.25, U.ease.out); }
    else if (name === 'tinnitus') { if (!replay) S.audio.loop('tinnitus', clamp(amount, 0, 1) * 0.8, dur || 0.3); t = { done: true }; }
    else {
      if (!(name in FX_DEFAULTS)) warnOnce('fx' + name, 'A.fx: unknown effect "' + name + '"');
      if (name === 'muffle' && S.audio && S.audio.muffle) S.audio.muffle(amount, dur);
      t = tween(f, name, amount, dur);
    }
    return replay ? Wait.instant() : taskWait(t);
  };
  A.sound = function (name, opts) { if (!ffOn()) S.audio.play(name, opts); };
  // ambience(loop, vol): starts or re-levels one loop; vol 0 stops it; ambience(null) stops all.
  A.ambience = function (loop, vol, fade) {
    if (!loop || loop === 'none') { S.audio.stopLoops(fade === undefined ? 1 : fade); return; }
    S.audio.loop(loop, vol === undefined ? 0.6 : vol, fade);
  };

  // Title card in the centre of the screen. Input skips it after 1 s.
  A.card = function (title, sub, seconds) {
    if (ffYield()) return Wait.instant();
    const c = { title: title || '', sub: sub || '', seconds: seconds === undefined ? 3 : +seconds, t: 0, skip: false, done: false };
    if (D.card) D.card.done = true;
    D.card = c;
    S.events.emit('card', c);
    addTask({ update(dt) {
      if (D.card !== c) { c.done = true; this.done = true; return; }
      c.t += dt;
      const skip = c.t >= 1 && (c.skip || (S.input && S.input.any()));
      if (c.t >= c.seconds || skip || (D.policy && c.t > 0.05) || (S.headless && !D.policy && c.t >= c.seconds)) {
        c.done = true; this.done = true; D.card = null;
        if (S.input) S.input.consume('interact');
        S.events.emit('cardEnd', {});
      }
    } });
    return { wait: () => c.done, result: undefined };
  };
  A.timeskip = function (text, sub) {
    if (ffYield()) { fx().fade = 0; return Wait.instant(); }
    return genWait((function* () {
      yield A.fade(1, 0.7);
      yield A.card(text, sub, 2.6);
      yield A.fade(0, 0.7);
    })());
  };

  // Change location inside a scene: fade, load, fade back (stays covered if the screen already was).
  A.goto = function (locId, x, opts) {
    opts = opts || {};
    const r = D.cur;
    if (ffYield()) { if (r && r.ff) r.ffLoc = locId; return Wait.instant(); }
    const f = fx();
    const useFade = opts.fade !== false && f.fade < 0.99;
    const dur = opts.dur === undefined ? 0.35 : +opts.dur;
    const task = { done: false, ph: useFade ? 0 : 1, fadeT: null };
    const enter = () => {
      enterWorld(locId, x === undefined ? null : x, { face: opts.face, y: opts.y, silent: !!opts.silent });
    };
    task.update = function () {
      if (this.ph === 0) { this.fadeT = tween(f, 'fade', 1, dur); this.ph = 1; return; }
      if (this.ph === 1) { if (this.fadeT && !this.fadeT.done) return; enter(); this.ph = useFade ? 2 : 4; return; }
      if (this.ph === 2) { this.fadeT = tween(f, 'fade', 0, dur); this.ph = 3; return; }
      if (this.ph === 3) { if (!this.fadeT.done) return; this.ph = 4; }
      if (this.ph === 4) this.done = true;
    };
    if (!useFade) { enter(); task.ph = 4; }
    addTask(task);
    return { wait: () => task.done, result: undefined };
  };

  // Persistent state (skipped while a resumed scene replays: the loaded G already holds these).
  A.flag = function (name, value) {
    if (ffMut()) return;
    const v = value === undefined ? true : value;
    S.G.flags[name] = v;
    // A flag set right after a choice marks that choice as one worth listing on the completion screen.
    if (lastChoice && lastChoice.runner === D.cur && name.charAt(0) !== '_') { lastChoice.entry.minor = false; lastChoice.entry.flag = name; }
    D.progress++;
    S.events.emit('flag', { name, value: v });
  };
  A.get = (name) => S.G.flags[name];
  A.has = (name) => !!S.G.flags[name];
  A.rel = function (who, delta) {
    if (ffMut()) return;
    const v = (S.G.rel[who] || 0) + (+delta || 0);
    S.G.rel[who] = v;
    S.events.emit('rel', { who, delta: +delta || 0, value: v });
  };
  A.money = function (delta) {
    if (ffMut()) return;
    delta = Math.round(+delta || 0);
    if (!delta) return;
    S.G.money = Math.max(0, (S.G.money || 0) + delta);
    S.events.emit('money', { delta, total: S.G.money });
    S.events.emit('toast', { text: (delta > 0 ? '+' : '−') + U.fmtMoney(Math.abs(delta)).replace('-', ''), kind: 'money' });
  };
  A.quest = function (id, action, step) { if (!ffMut()) D.quest(id, action, step); };
  A.objective = function (text) {
    D.objectiveOverride = text || null;
    S.events.emit('objective', { text: D.objectiveOverride });
  };
  A.evidence = function (id) { if (!ffMut()) D.addEvidence(id); };
  A.memory = function (id) { if (!ffMut()) D.addMemory(id); };
  A.meet = function (personId, noteId) { if (!ffMut()) D.meet(personId, noteId); };
  const SKILL_NAMES = { jab: 'Jab', cross: 'Cross', hook: 'Hook', uppercut: 'Uppercut', counter: 'Counter-cross', dashStraight: 'Dash straight',
    flurry: 'Flurry', guard: 'Guard', slip: 'Slip', dash: 'Dash', backdash: 'Backdash', airdash: 'Air dash' };
  A.skill = function (name) {
    if (ffMut()) return;
    const had = !!S.G.skills[name];
    S.G.skills[name] = true;
    if (S.combat && typeof S.combat.refresh === 'function') safe(() => S.combat.refresh(), 'combat.refresh');
    if (!had) {
      S.events.emit('skill', { name });
      S.events.emit('toast', { text: 'New technique: ' + (SKILL_NAMES[name] || name), kind: 'skill' });
    }
  };
  A.gear = function (name, on) {
    if (ffMut()) return;
    const v = on === undefined ? true : !!on;
    S.G.gear[name] = v;
    if (S.combat && S.combat.body && name in S.combat.body) S.combat.body[name] = v;
    S.events.emit('gear', { name, value: v });
    if (v) S.events.emit('toast', { text: 'Gear: ' + name.replace(/^\w/, (c) => c.toUpperCase()), kind: 'gear' });
  };

  // Document / photo viewer: the UI shows D.doc and calls S.director.closeDoc().
  A.doc = function (x) {
    if (ffYield()) return Wait.instant();
    let doc;
    if (typeof x === 'string') {
      const def = story.evidenceDef(x);
      if (!def) warnOnce('doc' + x, 'A.doc: no evidence "' + x + '"');
      doc = Object.assign({ id: x, title: x, text: '' }, def || {});
      if (S.G.evidence[x]) S.G.evidence[x].seen = true;
    } else doc = Object.assign({ title: '', text: '' }, x || {});
    if (!Array.isArray(doc.pages) || !doc.pages.length) doc.pages = [String(doc.text || '')];
    const d = { doc, id: doc.id || null, page: 0, closed: false, t: 0 };
    if (D.doc) D.closeDoc();
    D.doc = d;
    S.events.emit('doc', d);
    addTask({ update(dt) {
      d.t += dt;
      if (D.doc !== d) d.closed = true;
      else if ((D.policy || S.headless) && d.t > 0.1) D.closeDoc();
      else if (!S.ui && d.t > 0.4 && S.input && S.input.pressed('interact')) D.closeDoc();
      this.done = d.closed;
    } });
    return { wait: () => d.closed, result: undefined };
  };
  D.closeDoc = function () {
    const d = D.doc; if (!d) return;
    d.closed = true; D.doc = null;
    D.interactCooldown = Math.max(D.interactCooldown, 0.18);
    S.events.emit('docClosed', { id: d.id });
  };

  // Fights and bouts. A loss with allowLoss false restarts the fight from its start (not the save).
  function combatWait(kind, def) {
    def = def || {};
    const fnName = kind === 'fight' ? 'startFight' : 'startBout';
    const w = { control: true, noInterrupt: true, result: undefined, state: null, kind };
    let st = null, t = 0, autoT = 0, retryT = -1, tries = 0, startPos = null;
    const begin = () => { st = S.combat[fnName](def); w.state = st; };
    w.start = () => {
      if (!S.combat || typeof S.combat[fnName] !== 'function') {
        warnOnce(fnName, 'A.' + kind + ': combat.' + fnName + ' is missing; counted as won');
        w.result = { won: true, skipped: true }; w.skip = true; return;
      }
      const j = S.world && S.world.jin;
      if (j) startPos = { x: j.x, y: j.y, face: j.face };
      // The label is shown to the player (pause menu, quit dialog), so it names the place, never the encounter id.
      if (def.checkpoint) {
        const where = S.world && S.world.loc && S.world.loc.name;
        const cpLabel = def.label || ((kind === 'fight' ? 'Before the fight' : 'Before the bout') + (where ? ' — ' + where : ''));
        D.checkpoint(cpLabel, { async: true, quiet: true });
      }
      try { begin(); } catch (err) { S.fail(err, { source: 'A.' + kind }); w.result = { won: true, error: true }; w.skip = true; }
    };
    w.wait = (dt) => {
      if (w.skip || !st) return true;
      t += dt;
      const P = D.policy;
      if (P && (P.fights || 'auto') === 'auto' && !st.done) {
        autoT += dt;
        if (autoT >= 0.3) { autoT = -0.7; if (typeof S.combat.autoWin === 'function') safe(() => S.combat.autoWin(), 'combat.autoWin'); }
      }
      if (P && !st.done && t > (P.fightTimeout || 240)) {
        S.fail(new Error('A.' + kind + ' "' + (def.id || '') + '" did not finish under autoplay'), { source: 'autoplay' });
        w.result = { won: true, forced: true }; return true;
      }
      if (!st.done) return false;
      if (!st.won && !def.allowLoss && !(P && P.allowLoss)) {
        if (retryT < 0) { retryT = 1.4; S.events.emit('fightLost', { id: def.id || null, kind }); }
        retryT -= dt;
        if (retryT > 0) return false;
        retryT = -1; tries++;
        const j = S.world && S.world.jin;
        if (j && startPos) { j.x = startPos.x; j.y = startPos.y; j.face = startPos.face; j.vx = 0; j.vy = 0; }
        if (typeof S.combat.healJin === 'function') safe(() => S.combat.healJin('full'), 'healJin');
        S.events.emit('fightRetry', { id: def.id || null, kind, tries });
        try { begin(); } catch (err) { S.fail(err, { source: 'A.' + kind + ' retry' }); w.result = { won: true, error: true }; return true; }
        return false;
      }
      w.result = { won: !!st.won, round: st.round, time: st.time, tries, stats: jsonSafe(st.stats || {}) };
      return true;
    };
    return w;
  }
  A.fight = (def) => (ffYield() ? Wait.instant({ won: true }) : combatWait('fight', def));
  A.bout = (def) => (ffYield() ? Wait.instant({ won: true }) : combatWait('bout', def));

  A.activity = function (name, opts) {
    if (ffYield()) return Wait.instant();
    opts = opts || {};
    const w = { control: true, noInterrupt: true, result: undefined, state: null };
    let st = null, t = 0, tried = false;
    w.start = () => {
      if (!S.activities || typeof S.activities.start !== 'function') { warnOnce('act', 'A.activity: activities.js is missing'); w.skip = true; return; }
      try { st = S.activities.start(name, opts); w.state = st; } catch (err) { S.fail(err, { source: 'A.activity ' + name }); w.skip = true; }
    };
    w.wait = (dt) => {
      if (w.skip || !st) { if (w.result === undefined && opts.autoResult !== undefined) w.result = opts.autoResult; return true; }
      t += dt;
      if (D.policy && !st.done) {
        // Prefer the module's own autoplay hook, then finish it after a few seconds.
        if (!tried && t > 0.2) {
          tried = true;
          safe(() => {
            if (typeof S.activities.autoComplete === 'function') S.activities.autoComplete(st);
            else if (typeof st.autoComplete === 'function') st.autoComplete();
            else if (typeof st.finish === 'function') st.finish(true);
          }, 'activity autoplay');
        }
        // activities.js plays itself under a policy inside this budget; stop() ends a straggler as a pass.
        if (!st.done && t > (D.policy.activityTimeout || 4)) {
          safe(() => {
            if (typeof S.activities.stop === 'function') S.activities.stop(st);
            else if (typeof st.cancel === 'function') st.cancel('autoplay timeout');
          }, 'activities.stop');
          st.done = true;
          if (st.result === undefined) st.result = opts.autoResult !== undefined ? opts.autoResult : { ok: true, auto: true };
        }
      }
      if (!st.done) return false;
      w.result = st.result;
      return true;
    };
    return w;
  };

  A.control = function (on) {
    const r = D.cur;
    if (!r) return;
    r.ctrl = !!on;
    if (on) {
      releaseKeys();
      const j = S.world && S.world.jin;
      if (j && !j.poseHold) j.scriptPose = null;
    }
    S.events.emit('control', { player: !!on });
  };
  // Waits with the player in control (unless opts.control === false). opts: { timeout, control, autoplay: {walkTo, interact, loc} }
  A.waitFor = function (pred, opts) {
    opts = opts || {};
    if (ffYield()) return Wait.instant(true);
    let t = 0;
    const w = { control: opts.control !== false, autoplay: opts.autoplay || null, result: undefined,
      wait(dt) {
        t += dt;
        let ok;
        try { ok = !!pred(S.G, S); } catch (err) { S.fail(err, { source: 'A.waitFor' }); ok = true; }
        if (ok) { w.result = true; return true; }
        if (opts.timeout && t >= opts.timeout) { w.result = false; return true; }
        return false;
      } };
    return w;
  };
  // Waits until Jin passes x (dir +1: going right, -1: going left; default: away from where he stands).
  A.reach = function (x, dir, opts) {
    opts = opts || {};
    if (ffYield()) return Wait.instant(true);
    const j0 = S.world && S.world.jin;
    const d = dir ? sign(dir) : (j0 ? sign(x - j0.x) || 1 : 1);
    return { control: true, autoplay: Object.assign({ walkTo: x + d * 8 }, opts.autoplay || {}), result: true,
      wait() { const j = S.world && S.world.jin; return !!j && (d > 0 ? j.x >= x : j.x <= x); } };
  };
  A.restrict = function (o) {
    if (!o) { A.unrestrict(); return; }
    S.G.restrict = jsonSafe(o);
    if (S.combat && typeof S.combat.restrict === 'function') safe(() => S.combat.restrict(o), 'combat.restrict');
  };
  A.unrestrict = function () {
    S.G.restrict = null;
    if (S.combat && typeof S.combat.unrestrict === 'function') safe(() => S.combat.unrestrict(), 'combat.unrestrict');
  };
  // body({ power, speedMul, breath, limp, delay, look }) — Jin's body; stored in G so loads restore it.
  A.body = function (o) {
    if (!o) return;
    S.G.body = Object.assign({}, S.G.body || {}, jsonSafe(o));
    applyBody();
  };
  A.checkpoint = function (label) {
    const r = D.cur;
    if (r) r.cp++;
    if (r && r.ff) { if (r.ff.sync && r.cp >= r.ff.cp) r.endFF(); return; }
    D.checkpoint(label, { runner: r });
  };
  A.endChapter = function () {
    if (ffOn()) return { wait: () => false, terminal: true };
    D.requestEnd({ kind: 'chapter', n: S.G.chapter });
    return { wait: () => false, terminal: true, result: undefined };
  };
  A.ending = function (id) {
    if (ffMut()) return;
    S.G.ending = id;
    S.G.flags.ending = id;
    S.events.emit('ending', { id });
  };
  A.credits = function () {
    if (ffOn()) return { wait: () => false, terminal: true };
    D.requestEnd({ kind: 'credits', n: S.G.chapter });
    return { wait: () => false, terminal: true, result: undefined };
  };
  A.sub = function (id) {
    const fn = typeof id === 'function' ? id : story.scene(id);
    if (!fn) { S.fail(new Error('A.sub: unknown scene "' + id + '"'), { source: 'A.sub' }); return (function* () { /* nothing */ })(); }
    const g = fn(A, S.G);
    return isIter(g) ? g : (function* () { return g; })();
  };
  // Extras for scripts.
  A.actor = (id) => actor(id);
  A.jin = () => (S.world ? S.world.jin : null);
  A.chapter = () => S.G.chapter;
  A.queue = (id, opts) => D.run(id, Object.assign({}, opts || {}, { queue: true }));
  A.parallel = (target, opts) => D.parallel(target, opts);
  Object.defineProperty(A, 'G', { get: () => S.G });
  A.S = S;

  /* ── 8. Story state: quests, evidence, memories, people ────────────── */
  let questSeq = 0;
  D.quest = function (id, action, step) {
    const G = S.G, def = story.questDef(id);
    if (!def) warnOnce('quest' + id, 'quest "' + id + '" is not defined');
    let q = G.quests[id];
    const nSteps = def && Array.isArray(def.steps) ? def.steps.length : 0;
    switch (action || 'start') {
      case 'start':
        // Starting a running or finished quest again is a no-op (talk scenes may call it every time).
        if (q && q.state !== 'active') return q;
        if (q) { if (step === undefined || (step | 0) === q.step) return q; q.step = step | 0; }
        else q = G.quests[id] = { state: 'active', step: step === undefined ? 0 : step | 0, seen: false };
        break;
      case 'step':
        if (!q) q = G.quests[id] = { state: 'active', step: 0, seen: false };
        if (q.state !== 'active') q.state = 'active';
        q.step = step === undefined ? q.step + 1 : step | 0;
        if (nSteps) q.step = clamp(q.step, 0, nSteps - 1);
        q.seen = false;
        break;
      case 'done':
        if (!q) q = G.quests[id] = { state: 'done', step: Math.max(0, nSteps - 1), seen: false };
        else if (q.state === 'done') return q;
        q.state = 'done'; q.seen = false;
        if (def && def.reward && typeof def.reward === 'object') giveReward(def.reward);
        break;
      case 'fail':
        if (!q) q = G.quests[id] = { state: 'failed', step: 0, seen: false };
        q.state = 'failed'; q.seen = false;
        break;
      default:
        warnOnce('qa' + action, 'A.quest: unknown action "' + action + '"');
        return q;
    }
    q.at = ++questSeq + Math.floor(S.time * 1000);
    D.progress++;
    const st = def && def.steps ? def.steps[Math.min(q.step, Math.max(0, nSteps - 1))] : null;
    S.events.emit('quest', { id, state: q.state, step: q.step, title: def ? def.title : id, kind: def ? def.kind || 'main' : 'main', text: st ? st.text : null });
    return q;
  };
  // QuestDef.reward may be a plain line (shown by the UI) or { money, rel: {who: delta}, flags, skill, gear, evidence, memory }.
  function giveReward(r) {
    if (r.money) A.money(r.money);
    if (r.rel) for (const k in r.rel) A.rel(k, r.rel[k]);
    if (r.flags) for (const k in r.flags) A.flag(k, r.flags[k]);
    if (r.skill) A.skill(r.skill);
    if (r.gear) A.gear(r.gear);
    if (r.evidence) D.addEvidence(r.evidence);
    if (r.memory) D.addMemory(r.memory);
  }
  D.addEvidence = function (id) {
    const G = S.G;
    if (G.evidence[id]) return false;
    const def = story.evidenceDef(id);
    if (!def) warnOnce('ev' + id, 'evidence "' + id + '" is not defined');
    G.evidence[id] = { at: G.chapter, seen: false };
    D.progress++;
    S.audio.play('evidence');
    S.events.emit('evidence', { id, title: def ? def.title : id, kind: def ? def.kind : null });
    return true;
  };
  D.addMemory = function (id) {
    const G = S.G;
    if (G.memories[id]) return false;
    const def = story.memoryDef(id);
    if (!def) warnOnce('mem' + id, 'memory "' + id + '" is not defined');
    G.memories[id] = { seen: false, at: G.chapter };
    D.progress++;
    S.events.emit('memory', { id, title: def ? def.title : id });
    return true;
  };
  D.meet = function (personId, noteId) {
    const G = S.G;
    let p = G.people[personId];
    const isNew = !p;
    if (!p) p = G.people[personId] = { met: true, notes: [] };
    p.met = true;
    let added = false;
    if (noteId && !p.notes.includes(noteId)) { p.notes.push(noteId); added = true; }
    if (isNew || added) {
      p.seen = false;
      D.progress++;
      const def = story.person(personId);
      S.events.emit('people', { id: personId, note: noteId || null, name: def ? def.name : personId, isNew });
    }
  };
  // Mark something read in the journal: kind 'quests'|'evidence'|'memories'|'people'.
  D.markSeen = function (kind, id) { const e = S.G[kind] && S.G[kind][id]; if (e) e.seen = true; };
  D.unread = function () {
    const G = S.G;
    for (const k of ['quests', 'evidence', 'memories', 'people']) for (const id in G[k]) if (G[k][id] && G[k][id].seen === false) return true;
    return false;
  };

  // Current HUD objective: the scene's override, else the latest active main quest's step (else a side quest).
  D.objective = function () {
    if (D.objectiveOverride) return { text: D.objectiveOverride, kind: 'main', quest: null, target: null, autoplay: null };
    const G = S.G;
    let best = null;
    for (const id in G.quests) {
      const q = G.quests[id];
      if (!q || q.state !== 'active') continue;
      const def = story.questDef(id);
      if (!def) continue;
      const kind = def.kind || 'main';
      const rank = kind === 'main' ? 2 : 1;
      if (!best || rank > best.rank || (rank === best.rank && (q.at || 0) > (best.q.at || 0))) best = { id, q, def, rank, kind };
    }
    if (!best) return null;
    const steps = Array.isArray(best.def.steps) ? best.def.steps : [];
    const st = steps.length ? steps[clamp(best.q.step | 0, 0, steps.length - 1)] : null;
    return { text: st && st.text ? st.text : best.def.title, kind: best.kind, quest: best.id, title: best.def.title,
      step: best.q.step, target: st && st.target ? st.target : null, autoplay: st && st.autoplay ? st.autoplay : null };
  };
  // Quest list for the journal.
  D.quests = function () {
    const G = S.G, out = [];
    for (const id in G.quests) {
      const q = G.quests[id], def = story.questDef(id) || { title: id, steps: [] };
      out.push({ id, title: def.title, kind: def.kind || 'main', state: q.state, step: q.step, seen: q.seen, giver: def.giver || null,
        summary: def.summary || '', steps: (def.steps || []).map((s, i) => ({ text: s.text, done: q.state === 'done' || i < q.step, current: q.state === 'active' && i === q.step })) });
    }
    return out;
  };
  // Where the test autopilot should go while the top scene waits with the player in control.
  D.waitHint = function () {
    const t = top();
    if (!t || t.done || !t.hasControl()) return null;
    if (t.wait && t.wait.autoplay) return t.wait.autoplay;
    return t.hint || null;
  };

  /* ── 9. Checkpoints, autosave and chapter flow ─────────────────────── */
  D.checkpoint = function (label, o) {
    o = o || {};
    const G = S.G, W = S.world;
    G.checkpoint = { chapter: G.chapter, loc: (W && W.locId) || G.loc || null, x: W && W.jin ? Math.round(W.jin.x) : G.x, label: label || null };
    D.syncSaveRunner = o.runner && !o.async ? o.runner : null;
    const ok = S.save('auto', null);
    D.syncSaveRunner = null;
    lastAutosave = S.time;
    if (!o.quiet) S.events.emit('checkpoint', { label: label || 'Checkpoint', ok });
    return ok;
  };
  S.events.on('enterLoc', (d) => {
    if (d && d.id && S.G) S.G.visited[d.id] = true;
    D.progress++;
    if (!(d && d.silent)) pendingLocSave = true;
  });

  // What a save made right now should resume (S.save calls this).
  D.captureResume = function () {
    const out = { v: 1, chapter: S.G.chapter, queue: [] };
    for (const q of D.queue) if (typeof q.target === 'string' && !q.opts.system) out.queue.push(q.target);
    const base = D.stack.find((r) => !r.done);
    if (base) {
      if (base.system) { if (base.resumeAs) Object.assign(out, base.resumeAs); }
      else if (base.sceneId) {
        const sync = D.syncSaveRunner === base;
        out.scene = { id: base.sceneId, n: base.n, cp: base.cp, sync, results: base.results.slice(0, base.n), loc: base.startLoc,
          label: base.label, args: jsonSafe(base.args) };
      }
    }
    return out;
  };

  function enterWorld(locId, x, o) {
    if (!S.world || typeof S.world.enter !== 'function') { warnOnce('enter', 'world.js is missing: cannot enter ' + locId); return false; }
    if (!story.location(locId)) {
      S.fail(new Error('Location "' + locId + '" is not defined'), { source: 'enter' });
      return false;
    }
    const opts = { fade: false, silent: !!(o && o.silent) };
    if (o && o.face !== undefined && o.face !== null) opts.face = o.face;
    if (o && o.y !== undefined && o.y !== null) opts.y = o.y;
    return safe(() => { S.world.enter(locId, x, opts); return true; }, 'world.enter ' + locId) || false;
  }
  D.enterWorld = enterWorld;

  // Jin's body and standing restrictions from G (chapter start, A.body, loads).
  function applyBody() {
    const G = S.G, c = S.combat, b = G.body || {};
    if (c) {
      const base = { power: 1, speedMul: 1, breath: false, limp: 0, delay: 0, knuckles: !!(G.gear && G.gear.knuckles) };
      const vals = {};
      for (const k of ['power', 'speedMul', 'breath', 'limp', 'delay', 'knuckles']) if (b[k] !== undefined) vals[k] = b[k];
      if (c.body && typeof c.body === 'object') Object.assign(c.body, base, vals); else c.body = Object.assign(base, vals);
      safe(() => {
        if (typeof c.unrestrict === 'function') c.unrestrict();
        if (G.restrict && typeof c.restrict === 'function') c.restrict(G.restrict);
        if (typeof c.refresh === 'function') c.refresh();
      }, 'applyBody');
    }
    const j = S.world && S.world.jin;
    if (j && b.look && j.look !== b.look) { if (W_has('setLook')) safe(() => S.world.setLook(j, b.look), 'world.setLook'); else j.look = b.look; }
    S.events.emit('body', b);
  }
  D.applyBody = applyBody;

  function setMode(m) { if (S.main && typeof S.main.setMode === 'function') S.main.setMode(m); }

  // Screens shown by the UI from D.screen: 'chapter' | 'completion' | 'ending' | 'credits' | 'continued'.
  function screenWait(scr) {
    const s = Object.assign({ t: 0, done: false, minTime: 1 }, scr);
    return {
      noInterrupt: true, result: undefined,
      start() { D.screen = s; S.events.emit('screen', s); },
      wait(dt) {
        if (D.screen !== s) return true;
        s.t += dt;
        if (!s.done) {
          if (D.policy) { if (s.t >= 0.05) s.done = true; }
          else if (s.t >= s.minTime && S.input && (S.input.pressed('interact') || (s.anyKey && S.input.any()))) s.done = true;
          else if (s.auto && s.t >= s.auto) s.done = true;
          else if (S.headless && s.t >= Math.max(s.minTime, 0.5) && D.autoHeadless) s.done = true;
        }
        if (!s.done) return false;
        D.screen = null;
        if (S.input) S.input.consume('interact');
        D.interactCooldown = Math.max(D.interactCooldown, 0.18);
        S.events.emit('screenEnd', { kind: s.kind });
        return true;
      },
    };
  }
  // UI: the player confirmed the current screen (or skipped the title card).
  D.dismiss = function () {
    if (D.screen && D.screen.t >= 0.3) { D.screen.done = true; return true; }
    if (D.card && D.card.t >= 0.5) { D.card.skip = true; return true; }
    return false;
  };

  function nextId(n) { for (const k of story.ids()) if (k > n && k !== SANDBOX) return k; return null; }
  function firstId() { const ids = story.ids().filter((k) => k !== SANDBOX); return ids.length ? ids[0] : null; }
  story.firstChapter = firstId;
  story.nextChapter = nextId;

  /* start(n, { fromSave }) — chapter card -> start location -> start scene.
     Without fromSave the chapter snapshot is taken and the chapter's skills and body are applied. */
  story.start = function (n, opts) {
    opts = opts || {};
    n = +n;
    const def = story.chapters[n];
    if (!def) { S.fail(new Error('Chapter ' + n + ' is not available in this build.'), { source: 'story.start' }); return false; }
    story.startSeq = (story.startSeq | 0) + 1;   // main.js: a load that nobody resumed resumes itself
    D.reset();
    const G = S.G = S.migrateState(S.G);
    if (!opts.fromSave) {
      G.chapter = n;
      G.snapshots[n] = S.stateCopy(G);
      G.skills = Object.assign({}, G.skills, def.skills || {});
      G.body = Object.assign({ look: 'jin' }, jsonSafe(def.body || {}) || {});
      G.restrict = null;
      G.stats[n] = { startPlaytime: G.playtime };
      // Choices made in an earlier run of this chapter no longer apply.
      G.choices = G.choices.filter((c) => c.chapter !== n);
      const st = def.start || {};
      G.loc = st.loc || null; G.x = +st.x || 0; G.y = st.y === undefined ? null : st.y; G.face = st.face || 1;
      G.checkpoint = { chapter: n, loc: G.loc, x: G.x, label: 'Chapter start' };
    } else G.chapter = n;
    setMode('play');
    fx().fade = 1;
    applyBody();
    D.runSystem(chapterFlow(n, opts), { label: 'chapter ' + n + ' start', resumeAs: { startChapter: n } });
    D.progress++;
    return true;
  };
  function* chapterFlow(n, opts) {
    const def = story.chapters[n], G = S.G, st = def.start || {};
    const f = fx();
    f.fade = 1; f.fadeColor = '#000000';
    S.audio.stopLoops(1.2);
    S.events.emit('chapterStart', { n });
    yield screenWait({ kind: 'chapter', n, title: def.title, date: def.date || '', place: def.place || '', lines: def.card.slice(), minTime: 1.2, anyKey: true });
    const resumeHere = opts.fromSave && G.loc;
    const loc = resumeHere ? G.loc : st.loc;
    if (!loc) { S.fail(new Error('Chapter ' + n + ' has no start location'), { source: 'chapter start' }); f.fade = 0; return; }
    if (!enterWorld(loc, resumeHere ? G.x : (st.x === undefined ? null : st.x), { face: resumeHere ? G.face : st.face, y: resumeHere ? G.y : st.y })) { f.fade = 0; return; }
    if (S.combat && typeof S.combat.healJin === 'function') safe(() => S.combat.healJin('full'), 'healJin');
    applyBody();
    // The start scene runs before any firstEnter scene the location queued.
    if (st.scene) D.run(st.scene, { front: true, queue: true });
    if (!opts.fromSave) {
      lastAutosave = S.time;
      S.save('auto', null, { resume: { v: 1, chapter: n, queue: st.scene ? [st.scene] : [] }, backup: true });
    }
    if (st.fadeIn !== false) yield A.fade(0, 1.0);
  }

  // Ends the scene that asked (A.endChapter / A.credits) and runs the matching flow next step.
  D.requestEnd = function (req) {
    if (D.endReq) return;
    D.endReq = req;
    D.defer(() => {
      const r = D.endReq;
      D.reset();
      if (r.kind === 'credits') D.runSystem(creditsFlow(true), { label: 'credits' });
      else D.runSystem(endChapterFlow(r.n), { label: 'chapter ' + r.n + ' end' });
    });
  };

  function completionData(n) {
    const G = S.G, def = story.chapters[n] || { quests: {}, evidence: {} };
    const evIds = Object.keys(def.evidence || {});
    const found = evIds.filter((id) => G.evidence[id]).length;
    const sideIds = Object.keys(def.quests || {}).filter((id) => { const k = def.quests[id].kind; return k === 'side' || k === 'missable'; });
    const sidesDone = sideIds.filter((id) => G.quests[id] && G.quests[id].state === 'done').length;
    const st = G.stats[n] || {};
    const time = Math.max(0, G.playtime - (st.startPlaytime || 0));
    let summary = [];
    if (typeof def.summary === 'function') summary = safe(() => def.summary(G) || [], 'chapter summary') || [];
    return {
      n, title: def.title || '', date: def.date || '', place: def.place || '',
      evidence: { found, total: evIds.length },
      sides: { done: sidesDone, total: sideIds.length,
        list: sideIds.map((id) => ({ id, title: def.quests[id].title || id, kind: def.quests[id].kind, state: G.quests[id] ? G.quests[id].state : 'missed' })) },
      choices: G.choices.filter((c) => c.chapter === n && !c.minor).map((c) => c.text),
      time, timeText: U.fmtTime(time), summary: Array.isArray(summary) ? summary : [String(summary)],
    };
  }
  D.completionData = completionData;

  function* endChapterFlow(n) {
    const G = S.G, def = story.chapters[n] || { title: '' };
    const data = completionData(n);
    G.completed[n] = true;
    G.stats[n] = { startPlaytime: (G.stats[n] || {}).startPlaytime || 0, evidence: data.evidence.found, evidenceTotal: data.evidence.total,
      sides: data.sides.done, sidesTotal: data.sides.total, time: Math.round(data.time) };
    S.events.emit('chapterEnd', { n });
    D.progress++;
    yield A.fade(1, 0.9);
    S.audio.stopLoops(1);
    const nx = n === SANDBOX ? null : nextId(n);
    // Autosave at chapter end: Continue opens the next chapter (or replays the last one after the ending).
    if (nx !== null) {
      G.chapter = nx; G.loc = null; G.checkpoint = { chapter: nx, loc: null, x: 0, label: 'Chapter start' };
      S.save('auto', 'Chapter ' + n + ' complete', { keepPos: true, resume: { v: 1, startChapter: nx } });
      G.chapter = n;
    } else if (n !== SANDBOX) {
      S.save('auto', 'Chapter ' + n + ' complete', { keepPos: true, resume: { v: 1, chapterSelect: n } });
    }
    yield screenWait({ kind: 'completion', n, title: def.title, data, minTime: 1.5 });
    if (n === SANDBOX) { D.defer(toTitle); return; }
    D.defer(() => story.next(n));
  }
  const ENDING_TITLES = { champion: 'The Champion', own_name: 'His Own Name' };
  story.endingId = function () {
    const G = S.G, c = G.flags.ch10_choice;
    return G.ending || (c === 'accept' ? 'champion' : c === 'refuse' ? 'own_name' : null);
  };
  function* endingFlow() {
    const G = S.G, id = story.endingId();
    const c10 = story.chapters[LAST];
    const e = c10 && c10.endings && id ? c10.endings[id] : null;
    const cards = e ? (Array.isArray(e) ? e : (e.cards || e.lines || [])) : [];
    fx().fade = 1;
    if (id) yield screenWait({ kind: 'ending', id, title: (e && e.title) || ENDING_TITLES[id] || 'The End', cards, minTime: 2 });
    yield* creditsFlow(false);
  }
  function* creditsFlow(markDone) {
    const G = S.G;
    if (markDone) {
      G.completed[G.chapter] = true;
      S.save('auto', 'The end', { keepPos: true, resume: { v: 1, chapterSelect: G.chapter } });
    }
    fx().fade = 1;
    S.audio.stopLoops(2);
    S.events.emit('credits', {});
    yield screenWait({ kind: 'credits', title: 'Inside the Impact', lines: story.CREDITS.slice(), ending: story.endingId(), minTime: 2.5, anyKey: true, auto: 45 });
    D.defer(toTitle);
  }
  story.CREDITS = ['Inside the Impact', 'Story Mode', 'Story Mode by Joohyun Lee and Elliot Jeong'];
  function* continuedFlow(n) {
    fx().fade = 1;
    yield screenWait({ kind: 'continued', n, title: 'To be continued', lines: ['Chapter ' + (n + 1) + ' is not in this build yet.'], minTime: 1.5, anyKey: true });
    D.defer(toTitle);
  }
  function toTitle() {
    if (S.main && typeof S.main.toTitle === 'function') S.main.toTitle();
    else D.reset();
  }

  // next(n): chapter n+1 (the next registered one), or the ending flow after chapter 10.
  story.next = function (n) {
    n = n === undefined ? S.G.chapter : +n;
    const nx = n === SANDBOX ? null : nextId(n);
    if (nx !== null) return story.start(nx);
    D.reset();
    setMode('play');
    if (n >= LAST && n !== SANDBOX) { S.G.completed[n] = true; D.runSystem(endingFlow(), { label: 'ending' }); return true; }
    if (n === SANDBOX) { toTitle(); return false; }
    D.runSystem(continuedFlow(n), { label: 'to be continued' });
    return false;
  };

  // A chapter's canonical outcome, used to seed a fresh state for chapter select and headless runs.
  // ChapterDef.canon = { flags, rel, money, evidence: [ids], memories: [ids], people: [ids], quests: {id: 'done'}, gear, train, skills }
  function applyCanon(g, c, k) {
    if (c.flags) Object.assign(g.flags, c.flags);
    if (c.rel) for (const w in c.rel) g.rel[w] = (g.rel[w] || 0) + (+c.rel[w] || 0);
    if (c.money) g.money = Math.max(0, g.money + (+c.money || 0));
    const ids = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v) : []);
    for (const id of ids(c.evidence)) if (!g.evidence[id]) g.evidence[id] = { at: k, seen: true };
    for (const id of ids(c.memories)) if (!g.memories[id]) g.memories[id] = { seen: true, at: k };
    for (const id of ids(c.people)) if (!g.people[id]) g.people[id] = { met: true, notes: [] };
    if (c.quests) for (const id in c.quests) g.quests[id] = { state: c.quests[id] || 'done', step: 0, seen: true };
    if (c.gear) Object.assign(g.gear, c.gear);
    if (c.train) for (const d in c.train) g.train[d] = clamp(Math.max(g.train[d] || 0, +c.train[d] || 0), 0, 3);
    if (c.skills) Object.assign(g.skills, c.skills);
    if (c.visited) for (const id of ids(c.visited)) g.visited[id] = true;
  }
  story.seedState = function (n, flags) {
    const g = S.newState();
    for (const k of story.ids()) {
      if (k >= n || k === SANDBOX) continue;
      const d = story.chapters[k];
      Object.assign(g.skills, d.skills || {});
      const c = d.canon || d.seed || null;
      if (c && typeof c === 'object') applyCanon(g, c, k);
      g.completed[k] = true;
    }
    if (flags) Object.assign(g.flags, flags);
    g.chapter = n;
    return g;
  };

  // Replay a chapter from its start with the state it had then. The current autosave is kept as 'autoBackup'.
  story.chapterSelect = function (n) {
    n = +n;
    if (!story.chapters[n]) return false;
    const cur = S.migrateState(S.G);
    const snap = cur.snapshots && cur.snapshots[n];
    const g = S.migrateState(snap ? clone(snap) : story.seedState(n));
    g.snapshots = Object.assign({}, cur.snapshots || {});
    g.completed = Object.assign({}, g.completed || {}, cur.completed || {});
    g.chapter = n;
    const prev = S.store.get('save.auto', null);
    if (prev && prev.G) S.store.set('save.autoBackup', prev);
    S.G = g;
    return story.start(n);
  };
  // Chapters for the title's Chapters list: registered ones only.
  // The sandbox (99) is listed only in dev builds (S.dev) or when asked: chapterList(g, { sandbox: true }).
  story.chapterList = function (g, o) {
    g = g || S.peekSave('auto') || S.G;
    const done = (g && g.completed) || {};
    const withSandbox = !!(S.dev || (o && o.sandbox));
    return story.ids().filter((n) => n !== SANDBOX || withSandbox).map((n) => {
      const d = story.chapters[n];
      return { n, title: d.title, date: d.date || '', place: d.place || '', sandbox: n === SANDBOX,
        completed: !!done[n], available: n === SANDBOX || !!done[n] || !!S.dev,
        reason: n === SANDBOX || done[n] || S.dev ? null : 'Finish this chapter in the story to replay it.' };
    });
  };

  // Title actions.
  story.newGame = function () {
    const n = firstId();
    if (n === null) { S.events.emit('toast', { text: 'No chapters are available in this build.', kind: 'error' }); return false; }
    S.G = S.newState();
    S.seed(19940820);
    return story.start(n);
  };
  story.continueGame = function () { return S.load('auto') ? story.resume() : false; };
  story.loadGame = function (slot) { return S.load(slot) ? story.resume() : false; };
  story.playSandbox = function () {
    if (!story.chapters[SANDBOX]) return false;
    S.G = story.seedState(SANDBOX);
    return story.start(SANDBOX);
  };

  /* Resume after S.load(): restart a chapter, or enter the saved place and replay the scene
     that was running in fast-forward up to the save point. */
  story.resume = function () {
    story.startSeq = (story.startSeq | 0) + 1;
    const pr = S.pendingResume;
    const res = (pr && !pr.used && pr.resume) || {};
    if (pr) pr.used = true;
    const G = S.G = S.migrateState(S.G);
    if (res.startChapter !== undefined && res.startChapter !== null && story.chapters[res.startChapter]) {
      G.chapter = +res.startChapter;
      return story.start(G.chapter);
    }
    if (res.chapterSelect !== undefined && res.chapterSelect !== null) return story.chapterSelect(res.chapterSelect);
    if (!story.chapters[G.chapter]) {
      S.fail(new Error('This save is from Chapter ' + G.chapter + ', which is not in this build.'), { source: 'resume' });
      return false;
    }
    if (!G.loc || !story.location(G.loc)) return story.start(G.chapter, { fromSave: false });
    D.reset();
    setMode('play');
    applyBody();
    if (!enterWorld(G.loc, G.x, { y: G.y, face: G.face, silent: true })) return false;
    applyBody();
    lastAutosave = S.time; pendingLocSave = false;
    const f = fx();
    f.fade = 1; f.fadeColor = '#000000';
    tween(f, 'fade', 0, 0.8);
    const sc = res.scene;
    if (sc && sc.id && story.scene(sc.id)) {
      D.run(sc.id, { label: sc.label || sc.id, args: sc.args || undefined,
        ff: sc.n > 0 || sc.sync ? { n: sc.n | 0, cp: sc.cp | 0, sync: !!sc.sync, results: Array.isArray(sc.results) ? sc.results : [], loc: sc.loc || null } : null });
    }
    for (const id of res.queue || []) if (story.scene(id)) D.run(id, { queue: true });
    D.progress++;
    S.events.emit('resumed', { chapter: G.chapter, loc: G.loc });
    return true;
  };

  /* ── 10. Autoplay policies (headless tests, §11) ───────────────────── */
  const WORDS = {
    restraint: ['refuse', 'refused', 'spare', 'spared', 'leave', 'decline', 'stop', 'stopped', 'patient', 'forgive', 'forgave', 'persuade',
      'persuaded', 'protect', 'give back', 'return', 'walk away', 'let him go', 'own_name', 'no'],
    ruthless: ['accept', 'accepted', 'continue', 'continued', 'take', 'taken', 'threaten', 'threatened', 'press', 'pressed', 'blame',
      'blamed', 'finish', 'sign', 'pocket', 'champion', 'yes'],
  };
  const wordRe = (w) => new RegExp('(^|[^a-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/_/g, '[_ ]') + '([^a-z]|$)');
  function scoreOption(o, name) {
    const other = name === 'restraint' ? 'ruthless' : 'restraint';
    const tags = [].concat(o.policy || [], o.autoplay === true ? [] : o.autoplay || [], o.tags || []).map(String);
    if (o.autoplay === true) return 50;
    if (tags.includes(name)) return 100;
    if (tags.includes(other)) return -100;
    const v = String(o.value === undefined || o.value === null ? '' : o.value).toLowerCase();
    const t = String(o.text || '').toLowerCase();
    let s = 0;
    for (const w of WORDS[name]) { const re = wordRe(w); if (v === w) s += 12; else if (re.test(v)) s += 6; if (w.length > 3 && re.test(t)) s += 2; }
    for (const w of WORDS[other]) { const re = wordRe(w); if (v === w) s -= 12; else if (re.test(v)) s -= 6; if (w.length > 3 && re.test(t)) s -= 2; }
    return s;
  }
  // makePolicy('first' | 'restraint' | 'ruthless', extra) -> { name, choose, autoAdvance, fights }
  D.makePolicy = function (name, extra) {
    name = name || 'first';
    const p = Object.assign({ name, autoAdvance: true, fights: 'auto' }, extra || {});
    if (typeof p.choose !== 'function') {
      p.choose = function (choices, ctx) {
        const opts = (ctx && ctx.options) || [];
        let best = -1, bestS = -Infinity;
        choices.forEach((c, i) => {
          if (!c.enabled) return;
          let s = 0;
          if (name === 'restraint' || name === 'ruthless') s = scoreOption(opts[i] || c, name);
          else if (opts[i] && opts[i].autoplay === true) s = 50;
          if (s > bestS) { bestS = s; best = i; }
        });
        return best < 0 ? 0 : best;
      };
    }
    return p;
  };
  D.policies = { first: () => D.makePolicy('first'), restraint: () => D.makePolicy('restraint'), ruthless: () => D.makePolicy('ruthless') };
  D.setPolicy = function (p, extra) { D.policy = !p ? null : typeof p === 'string' ? D.makePolicy(p, extra) : p; return D.policy; };
})(window.STORY);
