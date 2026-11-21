/* Story Mode — activities.js
   Training drills, carrying, repairs, work shifts, the timeline board and evidence presentation.
   Contract: story/ARCHITECTURE.md §7. Builder notes: story/dev/notes/activities.md.

   HOW AN ACTIVITY RUNS
   S.activities.start(name, opts) -> ActivityState. The director wraps it as A.activity and waits until
   state.done; state.result is the result object. The state is also a director Wait: state.wait() -> done.
   Activities advance once per sim step in S.activities.update(dt). That call is idempotent per step and is
   hooked onto S.world.update automatically (the main loop may call it too; double calls are harmless).
   state.control === true: the player steers Jin while it runs (A.activity's wait hands control over).
   S.activities.current is the innermost running activity (a work shift's current task), S.activities.root
   the one the director is waiting on.
   AUTOPLAY: when S.director.policy is set (unless policy.activities === 'real') or opts.auto is true, an
   activity plays itself through the same judging code with synthetic input, ACT.autoRate sub-steps per sim
   step, so it ends well inside the director's 4 s budget. S.activities.autoComplete(st) switches a running
   one to autoplay; S.activities.stop(st) ends it at once (under a policy: as a pass), always cleaning up.

   WHAT THE UI READS — timeline board: S.ui.openWindow('timeline', state), state === S.activities.current
     state.kind        'timeline'
     state.title       heading ('Put it in order')         state.prompt   one instruction line
     state.cards       [{ id, title, date, kind, text }] every card, in tray order (shuffled, never the answer)
     state.slots       [cardId | null, ...] the line from earliest (0) to latest; length = answer length
     state.tray()      -> [card] cards not yet on the line
     state.place(cardId, slot) -> { ok, correct, hint, line, complete }
                       the right card locks into its slot; a wrong card stays in the tray and state.hint says why
     state.hint        last hint (after a wrong placement) or null
     state.line        { speaker, name, text } | null — Jin's line when a card lands right (show under the board)
     state.mistakes    wrong placements so far (there is no failure)
     state.complete    every slot is right; show state.line and a Done button
     state.finish()    Done button / window closed after completion: ends the activity (before completion it
                       behaves like close())
     state.close()     the player closed the window early: the board waits and [interact] reopens it
     state.done        the activity is over (the director resumes); the UI closes the window when it sees this
   evidence presentation: S.ui.openWindow('present', state)
     state.kind 'present'; state.title; state.claim (the claim to support); state.speaker (id); state.speakerName
     state.options     [{ id, title, kind, date, text, owned }] — the evidence archive (an accepted item Jin
                       somehow lacks is added with owned:false so a scene can never lock up)
     state.pick(evidenceId) -> { ok, correct, line, complete }
     state.line        { speaker, name, text } — the rebuttal after a wrong pick, the closing line after a right one
     state.picks, state.wrong, state.complete, state.finish(), state.close(), state.done
   optional UI helpers this file uses when present: S.ui.isOpen(name) -> bool, S.ui.closeWindow().
   drills, carry, repair, shifts: state.hud = { title, sub, prompt, chips, meter, bar, pips } (prompts carry
     keys as "[J]" built from S.input.labelFor) and state.marks() -> world markers. This file draws its own
     overlay for them (set S.activities.overlay = false if ui.js takes over).
   CHAPTERS: where a drill can be started from the journal, the LocationDef says so with
     training: { bag: { x, coach, coachName, coachLook, when }, balance: true, ... } or points.train_<drill>. */
(function (S) {
  'use strict';

  const U = S.util;
  const clamp = U.clamp, lerp = U.lerp, approach = U.approach;
  const clone = U.clone || ((v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v))));

  /* ── 1. Tables ────────────────────────────────────────────────────── */
  const DRILL_KEYS = ['balance', 'footwork', 'reaction', 'conditioning', 'bag', 'mitts'];
  const PUNCHES = ['jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter', 'flurry'];
  const PUNCH_SET = new Set(PUNCHES);
  const ACT_ALIAS = { counterCross: 'counter', counter_cross: 'counter', straight: 'dashStraight', dash_straight: 'dashStraight',
    upper: 'uppercut', backDash: 'backdash', back_dash: 'backdash' };
  const ACT_SET = new Set(PUNCHES.concat(['slip', 'dash', 'backdash', 'airdash', 'guard', 'hurt', 'stagger', 'jump', 'fall', 'land',
    'walk', 'run', 'idle', 'carry', 'down', 'getup', 'knockdown', 'backstep', 'brake', 'turn']));
  const NAME = { jab: 'Jab', cross: 'Cross', hook: 'Hook', uppercut: 'Uppercut', dashStraight: 'Dash straight', counter: 'Counter', flurry: 'Flurry' };
  const CALL = { jab: '1', cross: '2', hook: '3', uppercut: 'UP', dashStraight: 'DASH', counter: 'C', flurry: 'FLURRY' };
  const DMG_MOVES = ['jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter'];

  // What each drill trains. effect(L) describes training level L (0..3); applyTraining() is the only code that applies it.
  const DRILLS = {
    balance: { id: 'train_balance', name: 'Balance', what: 'Hold steady against the sway.',
      effect: (L) => (L ? 'Lands ' + 10 * L + '% quicker, recovers from hits ' + 5 * L + '% quicker' : 'Untrained') },
    footwork: { id: 'train_footwork', name: 'Footwork', what: 'Reach each lit floor mark in time.',
      effect: (L) => (L ? 'Dashes recharge ' + 5 * L + '% faster' : 'Untrained') },
    reaction: { id: 'train_reaction', name: 'Reaction', what: 'Slip the high pad, guard the low one, jab the open one.',
      effect: (L) => (L ? 'Slip window ' + Math.round(20 * L / 3) + ' ms wider' : 'Untrained') },
    conditioning: { id: 'train_conditioning', name: 'Conditioning', what: 'Run the cones without losing your wind.',
      effect: (L) => (L ? 'Breath +' + 10 * L : 'Untrained') },
    bag: { id: 'train_bag', name: 'Heavy bag', what: 'Throw the shown combination cleanly.',
      effect: (L) => (L ? 'Punch damage +' + Math.round(10 * L / 3) + '%' : 'Untrained') },
    mitts: { id: 'train_mitts', name: 'Mitt work', what: 'Hit the called mitts, slip the return, counter.',
      effect: (L) => (L ? 'Counter window ' + 20 * L + ' ms longer' : 'Untrained') },
  };

  const H = () => (S.tune && S.tune.H) || 46;
  const runPx = () => ((S.tune && S.tune.runSpeed) || 4) * H();
  const walkPx = () => ((S.tune && S.tune.walkSpeed) || 1.7) * H();
  const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  const round4 = (v) => Math.round(v * 10000) / 10000;
  const round1 = (v) => Math.round(v * 10) / 10;
  const warned = Object.create(null);
  function warnOnce(key, msg) {
    if (warned[key]) return; warned[key] = true;
    try { console.warn('[story activities]', msg); } catch (_) { /* no console */ }
  }

  /* ── 2. Adapters: every assumption about other modules lives here ─── */
  function lookup(kind, id) {
    if (!id) return null;
    const st = S.story; if (!st) return null;
    const good = (v) => v && typeof v === 'object' && !Array.isArray(v);
    try {
      const reg = st[kind];
      if (typeof reg === 'function') { const v = reg.call(st, id); if (good(v)) return v; }
      else if (good(reg) && good(reg[id])) return reg[id];
      const ch = st.chapters; if (!ch) return null;
      const cur = S.G && ch[S.G.chapter];
      if (cur && cur[kind] && good(cur[kind][id])) return cur[kind][id];
      for (const k in ch) { const c = ch[k]; if (c && c[kind] && good(c[kind][id])) return c[kind][id]; }
    } catch (_) { /* a registry shaped differently: fall through */ }
    return null;
  }

  const Ext = {
    jin: () => (S.world && S.world.jin) || null,
    loc: () => (S.world && S.world.loc) || null,
    locId: () => (S.world && S.world.locId) || null,
    actor(id) {
      if (!id || !S.world) return null;
      try { if (typeof S.world.actor === 'function') return S.world.actor(id) || null; } catch (_) { /* fall through */ }
      return (S.world.actors || []).find((a) => a && a.id === id) || null;
    },
    point(name) {
      const L = Ext.loc(), p = name && L && L.points && L.points[name];
      return p && typeof p.x === 'number' ? { x: p.x, y: typeof p.y === 'number' ? p.y : null } : null;
    },
    // Floor height under x, searched from just above feet height y.
    groundY(x, y) {
      const j = Ext.jin(), L = Ext.loc();
      const fy = typeof y === 'number' ? y : j ? j.y : (L && L.ground) || 300;
      try {
        if (S.world && typeof S.world.groundAt === 'function') {
          const g = S.world.groundAt(x, fy - 14);
          if (typeof g === 'number' && isFinite(g) && Math.abs(g - fy) < 40) return g;
        }
      } catch (_) { /* no world */ }
      return fy;
    },
    pieces(type) {
      const L = Ext.loc(), out = [];
      if (!L || !L.layers) return out;
      for (const k in L.layers) { const list = L.layers[k]; if (Array.isArray(list)) for (const p of list) if (p && p.t === type) out.push(p); }
      return out;
    },
    doorTo(locId) {
      const L = Ext.loc();
      return L && Array.isArray(L.doors) ? L.doors.find((d) => d && d.to === locId) || null : null;
    },
    locName(id) {
      try { if (S.story && typeof S.story.location === 'function') { const L = S.story.location(id); if (L && L.name) return L.name; } } catch (_) { /* ignore */ }
      const L = lookup('locations', id);
      return (L && L.name) || String(id);
    },
    spawnNpc(pl) {
      try { return S.world && typeof S.world.spawn === 'function' ? S.world.spawn(pl) || null : null; }
      catch (e) { S.fail(e, { source: 'activities spawn' }); return null; }
    },
    spawnEnemy(def) {
      try { return S.combat && typeof S.combat.spawnEnemy === 'function' ? S.combat.spawnEnemy(def) || null : null; }
      catch (e) { S.fail(e, { source: 'activities spawnEnemy' }); return null; }
    },
    remove(id) { try { if (id && S.world && typeof S.world.remove === 'function') S.world.remove(id); } catch (e) { S.fail(e, { source: 'activities remove' }); } },
    setPose(a, pose) {
      if (!a || !pose) return;
      if (typeof a.setPose === 'function') { a.setPose(pose); return; }
      if (a.pose !== pose) { a.pose = pose; a.poseT = 0; }
    },
    tint(a, col) { if (a) a.tint = col || null; },
    // A verb is usable if combat allows it (skills + restrictions); before combat exists, if the skill is owned.
    allowed(verb) {
      const al = S.combat && S.combat.allowed;
      if (al && verb in al) return al[verb] !== false;
      const sk = S.G && S.G.skills;
      if (sk && verb in sk) return sk[verb] !== false;
      return true;
    },
    // Autoplay: opts.auto wins; else a director policy (unless policy.activities === 'real'); else headless
    // runs where the director closes screens by itself (director.autoHeadless).
    auto(opts) {
      if (opts && opts.auto !== undefined) return !!opts.auto;
      const D = S.director, p = D && D.policy;
      if (p) return p.activities !== 'real';
      return !!(S.headless && D && D.autoHeadless);
    },
    label(a) {
      let l = a;
      try { if (S.input && S.input.labelFor) l = S.input.labelFor(a); } catch (_) { /* keep name */ }
      if (l === '[') l = '［'; if (l === ']') l = '］';
      return '[' + l + ']';
    },
    sound(name, o) { try { if (!S.headless && S.audio && S.audio.play) S.audio.play(name, o); } catch (_) { /* audio is optional */ } },
    toast(text, kind) { S.events.emit('toast', { text, kind: kind || 'info' }); },
    // Restrict verbs on top of whatever the scene already restricted. Only verbs that were free before are
    // added, and the returned function lifts exactly those, so a scene's own restrictions survive.
    restrict(obj) {
      const C = S.combat;
      if (!C || typeof C.restrict !== 'function') return null;
      let had = {};
      try { const r = typeof C.restrictions === 'function' ? C.restrictions() : null; had = (r && r.verbs) || {}; } catch (_) { had = {}; }
      const add = {}, verbs = [];
      for (const k in obj) if (k !== 'reason' && k !== 'reasons' && obj[k] === false && had[k] !== false) { add[k] = false; verbs.push(k); }
      if (!verbs.length) return () => {};
      add.reason = obj.reason;
      try { C.restrict(add); } catch (e) { S.fail(e, { source: 'activities restrict' }); return null; }
      return () => { try { if (typeof C.unrestrict === 'function') C.unrestrict(verbs); } catch (e) { S.fail(e, { source: 'activities unrestrict' }); } };
    },
    // Combat's carry state (slower, no punch/dash/jump/slip, the reason shown when a blocked verb is pressed).
    carry(kind, reason) {
      const C = S.combat;
      if (!C || typeof C.carry !== 'function') return false;
      try { C.carry(kind || null, reason); return true; } catch (e) { S.fail(e, { source: 'activities carry' }); return false; }
    },
    evidence: (id) => lookup('evidence', id),
    personName(id) {
      if (!id) return null;
      if (id === 'jin') return 'Jin';
      const a = Ext.actor(id); if (a && a.name) return a.name;
      const p = lookup('people', id); if (p && p.name) return p.name;
      return String(id).replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    uiOpen(name, state) {
      try { if (!S.headless && S.ui && typeof S.ui.openWindow === 'function') { S.ui.openWindow(name, state); return true; } }
      catch (e) { S.fail(e, { source: 'activities ui ' + name }); }
      return false;
    },
    uiCanTellOpen: () => !!(S.ui && typeof S.ui.isOpen === 'function'),
    uiIsOpen(name) { try { return !!(S.ui && typeof S.ui.isOpen === 'function' && S.ui.isOpen(name)); } catch (_) { return false; } },
    uiClose() { try { if (S.ui && typeof S.ui.closeWindow === 'function') S.ui.closeWindow(); } catch (e) { S.fail(e, { source: 'activities ui close' }); } },
    enter(locId, x, o) { try { if (S.world && typeof S.world.enter === 'function') { S.world.enter(locId, x, o || {}); return true; } } catch (e) { S.fail(e, { source: 'activities enter' }); } return false; },
  };

  // What Jin is doing, read from the combat controller (combat.js: ctrl.state 'attack' with ctrl.atk.name,
  // 'flurry', 'dash' with ctrl.dash.back), then from the actor; names normalized to pose names.
  const ctrlOf = (j) => (j && j.ctrl) || (S.combat && S.combat.jin) || null;
  function jinAct(j) {
    if (!j) return null;
    const c = ctrlOf(j);
    const list = [];
    if (c) {
      if (c.state === 'attack' && c.atk) list.push(c.atk.name === 'returnCross' ? 'cross' : c.atk.name);
      if (c.state === 'flurry') list.push('flurry');
      if (c.state === 'dash' && c.dash) list.push(c.dash.back ? 'backdash' : c.dash.air ? 'airdash' : 'dash');
      for (const v of [c.move, c.attack]) if (v) list.push(typeof v === 'string' ? v : v.name || v.id || v.kind);
      list.push(c.state);
    }
    list.push(j.move, j.state, j.pose);
    for (let v of list) {
      if (typeof v !== 'string') continue;
      v = ACT_ALIAS[v] || v;
      if (ACT_SET.has(v)) return v;
    }
    return null;
  }
  // Identity of the current punch: a new attack object (or flurry) means a new throw even if the name repeats.
  function jinAttackRef(j) {
    const c = ctrlOf(j); if (!c) return null;
    if (c.state === 'attack' && c.atk && typeof c.atk === 'object') return c.atk;
    if (c.state === 'flurry' && c.fl && typeof c.fl === 'object') return c.fl;
    return null;
  }
  function actTime(j) {
    const c = ctrlOf(j);
    for (const v of [c && c.atk && c.atk.t, c && c.moveT, c && c.stateT, c && c.t, j && j.poseT, j && j.pt]) if (typeof v === 'number' && isFinite(v)) return v;
    return null;
  }

  /* ── 3. Training effects (the one place they are applied) ─────────── */
  // Every S.tune field training writes, with the drill that drives it and the formula (f = level / 3).
  // A field whose current value differs from what we last wrote was changed by someone else (combat.resetTune,
  // a dev panel, a replaced S.tune) and that value becomes the new untrained base. So training is always
  // "base + effect", never stacked twice, and runtime tuning edits survive.
  const TF = [];
  const isNum = (v) => typeof v === 'number' && isFinite(v);
  function tf(key, drill, get, set, calc) { TF.push({ key, drill, get, set, calc, base: undefined, wrote: undefined }); }
  const field = (k) => [(T) => T[k], (T, v) => { T[k] = v; }];
  const sub = (o, k) => [(T) => T[o] && T[o][k], (T, v) => { T[o][k] = v; }];
  // balance: quicker landing recovery, hurt stun and getting up (combat scales hurt stun by hurtTime / 0.30).
  tf('landRecover', 'balance', ...field('landRecover'), (b, f) => round4(b * (1 - 0.30 * f)));
  tf('hurtTime', 'balance', ...field('hurtTime'), (b, f) => round4(b * (1 - 0.15 * f)));
  tf('getupTime', 'balance', ...field('getupTime'), (b, f) => round4(b * (1 - 0.15 * f)));
  // footwork: dash charges recharge up to 15% faster.
  tf('dashRecharge', 'footwork', ...field('dashRecharge'), (b, f) => round4(b * (1 - 0.15 * f)));
  // reaction: the slip's evade window ends up to 20 ms later.
  tf('slipWindow[1]', 'reaction', (T) => (Array.isArray(T.slipWindow) ? T.slipWindow[1] : undefined), (T, v) => { T.slipWindow[1] = v; },
    (b, f) => round4(b + 0.020 * f));
  // conditioning: breath max up to +30 (combat reads it every step).
  tf('breath.max', 'conditioning', ...sub('breath', 'max'), (b, f) => Math.round(b + 30 * f));
  // bag: punch damage up to +10%.
  for (const m of DMG_MOVES) tf(m + '.dmg', 'bag', ...sub(m, 'dmg'), (b, f) => round1(b * (1 + 0.10 * f)));
  tf('flurry.dmg', 'bag', ...sub('flurry', 'dmg'), (b, f) => round1(b * (1 + 0.10 * f)));
  tf('flurry.finisherDmg', 'bag', ...sub('flurry', 'finisherDmg'), (b, f) => round1(b * (1 + 0.10 * f)));
  // mitts: the counter window after a real slip lasts up to 60 ms longer.
  tf('counterWindow', 'mitts', ...field('counterWindow'), (b, f) => round4(b + 0.060 * f));

  let trainSigLast = null, tuneRef = null;
  const trainLevel = (k) => clamp((S.G && S.G.train && S.G.train[k]) | 0, 0, 3);
  const trainSig = () => (S.G && S.G.train ? DRILL_KEYS.map(trainLevel).join(',') : '');
  // Applies G.train to S.tune. Training improves control of the body Jin has; it never touches HP,
  // condition recovery, S.combat.body (the chapter's injuries) or anything money can reach.
  function applyTraining() {
    const T = S.tune;
    if (!T || typeof T !== 'object') return null;
    for (const F of TF) {
      let cur;
      try { cur = F.get(T); } catch (_) { cur = undefined; }
      if (!isNum(cur)) continue;                          // this tune has no such field: nothing to train
      if (F.base === undefined || cur !== F.wrote) F.base = cur;
      const v = F.calc(F.base, trainLevel(F.drill) / 3);
      try { F.set(T, v); F.wrote = v; } catch (e) { warnOnce('train ' + F.key, 'cannot write S.tune.' + F.key + ': ' + (e && e.message)); }
    }
    const lv = {}; for (const k of DRILL_KEYS) lv[k] = trainLevel(k);
    T.training = lv;                                      // read-only mirror for the HUD / dev tools
    trainSigLast = trainSig(); tuneRef = T;
    return lv;
  }
  // The trained values, and the untrained base under each (tests, the journal's Training tab).
  function trainingReport() {
    const out = {};
    for (const F of TF) if (F.wrote !== undefined) out[F.key] = { drill: F.drill, base: F.base, value: F.wrote };
    return out;
  }
  function tuneDrifted(T) {
    for (const F of TF) {
      if (F.wrote === undefined) continue;
      let cur; try { cur = F.get(T); } catch (_) { continue; }
      if (isNum(cur) && cur !== F.wrote) return true;
    }
    return false;
  }
  // Cheap per-step check: re-apply when a level changed, S.tune was replaced or someone edited a trained field.
  function checkTraining() {
    const T = S.tune;
    if (!T) return;
    if (trainSig() !== trainSigLast || T !== tuneRef || tuneDrifted(T)) applyTraining();
  }
  function setTrainLevel(k, L) {
    if (!S.G) return;
    S.G.train = S.G.train || {};
    S.G.train[k] = clamp(L | 0, 0, 3);   // hard cap 3
  }
  const defaultLevel = (k) => clamp(trainLevel(k) + 1, 1, 3);

  // Where a drill can happen in the current location: LocationDef.training ({ key: {x, at, coach, ...} } or [keys])
  // or a named point 'train_<key>' (then 'train'). Returns { x, y, opts } or null.
  function trainingSpot(key) {
    const L = Ext.loc(); if (!L) return null;
    const tr = L.training;
    if (tr) {
      let e = null;
      if (Array.isArray(tr)) { if (tr.includes(key)) e = {}; }
      else if (typeof tr === 'object' && tr[key]) e = tr[key] === true ? {} : tr[key];
      if (e) {
        if (typeof e.when === 'function') { try { if (!e.when(S.G)) e = null; } catch (_) { e = null; } }
        if (e) {
          const p = e.at ? Ext.point(e.at) : Ext.point('train_' + key) || Ext.point('train');
          const x = typeof e.x === 'number' ? e.x : p ? p.x : null;
          return { x, y: typeof e.y === 'number' ? e.y : p ? p.y : null, opts: e };
        }
      }
    }
    const p = Ext.point('train_' + key);
    return p ? { x: p.x, y: p.y, opts: {} } : null;
  }

  /* ── 4. Input sensor ──────────────────────────────────────────────── */
  // Own edge detection over S.input.down(): other modules consuming a press never hide it from an activity.
  // Autoplay feeds the same sensor with synthetic taps and holds, so the judging code is identical.
  const PAD_ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'punch', 'dash', 'slip', 'flurry', 'interact', 'run'];
  let clock = 0;   // activity clock: advances once per sim step while an activity runs
  class Pad {
    constructor(real) {
      this.real = real; this.prev = {}; this.now = {}; this.hit = {}; this.at = {}; this.taps = {}; this.holds = {};
      for (const a of PAD_ACTIONS) this.at[a] = -1e9;
    }
    rawDown(a) { try { return this.real && S.input ? !!S.input.down(a) : false; } catch (_) { return false; } }
    sync() { for (const a of PAD_ACTIONS) { const d = this.rawDown(a); this.prev[a] = d; this.now[a] = d; this.hit[a] = false; } }
    read() {
      for (const a of PAD_ACTIONS) {
        const held = this.rawDown(a) || !!this.holds[a], tap = !!this.taps[a];
        const h = (held && !this.prev[a]) || tap;
        this.hit[a] = h; if (h) this.at[a] = clock;
        this.prev[a] = held; this.now[a] = held || tap;
      }
      this.taps = {};
    }
    pressed(a) { return !!this.hit[a]; }
    down(a) { return !!this.now[a]; }
    tap(a) { this.taps[a] = true; }
    hold(a, on) { this.holds[a] = !!on; }
    clear() { this.taps = {}; this.holds = {}; }
  }

  // Which punches Jin threw this step. Reads the controller's move; if the controller exposes no move names,
  // falls back to inferring the punch from the keys (down+punch uppercut, chained presses jab-cross-hook).
  class PunchWatch {
    constructor() { this.last = null; this.lastT = null; this.lastRef = null; this.seen = false; this.pend = null; this.chain = 0; this.chainAt = -9; this.dashAt = -9; }
    step(pad, j) {
      const out = [];
      const act = jinAct(j), mv = PUNCH_SET.has(act) ? act : null, mt = actTime(j), ref = mv ? jinAttackRef(j) : null;
      // A new throw: a new attack object from the controller; without one, a new name or a restarted clock.
      const fresh = mv && (ref ? ref !== this.lastRef
        : mv !== this.last || (mt !== null && this.lastT !== null && mt + 1e-6 < this.lastT));
      if (fresh) { out.push(mv); this.seen = true; this.pend = null; }
      this.last = mv; this.lastT = mv ? mt : null; this.lastRef = ref;
      if (pad.pressed('dash')) this.dashAt = clock;
      if (!this.seen) {
        if (pad.pressed('flurry') && Ext.allowed('flurry')) this.pend = { at: clock, kind: 'flurry' };
        else if (pad.pressed('punch')) this.pend = { at: clock, kind: this.infer(pad) };
        if (this.pend && clock - this.pend.at >= 0.12) { out.push(this.pend.kind); this.pend = null; }
      }
      return out;
    }
    infer(pad) {
      if (pad.down('down') && Ext.allowed('uppercut')) { this.chain = 0; return 'uppercut'; }
      if (clock - this.dashAt < 0.35 && Ext.allowed('dashStraight')) { this.chain = 0; return 'dashStraight'; }
      const seq = Ext.allowed('hook') ? ['jab', 'cross', 'hook'] : ['jab', 'cross'];
      this.chain = clock - this.chainAt < 0.45 && this.chain < seq.length ? this.chain + 1 : 1;
      this.chainAt = clock;
      return seq[this.chain - 1];
    }
  }

  /* ── 5. Activity base ─────────────────────────────────────────────── */
  // Jin held in place: { owner, x, pose, face, lean, flash, prevScripted }. While pinned Jin's actor is marked
  // `scripted` (combat.js then leaves him alone: no input, no pose writes) and applyPin() puts him back where
  // the activity wants him after every world.update, advancing his pose clock itself.
  let pin = null;

  class Activity {
    constructor(name, opts, parent) {
      this.name = name; this.kind = name; this.opts = opts || {}; this.parent = parent || null;
      this.done = false; this.result = null; this.control = true; this.complete = false;
      this.t = 0; this.locId = Ext.locId(); this.locBound = false; this.child = null;
      this.owns = null;   // actions consumed before world.update so Jin and the world ignore them
      this.hud = { title: '', sub: '', prompt: '', chips: null, meter: null, bar: null, pips: null };
      this.floats = [];
      this.auto = Ext.auto(this.opts);
      this.pad = new Pad(!this.auto);
      this._undo = [];
    }
    begin() {}
    tick() {}
    marks() { return null; }        // [{ x, y, kind, label }] world markers (overlay, canvas)
    draw() {}                       // world-space canvas drawing; see S.activities.draw
    step(dt) {
      if (this.done) return;
      this.pad.read();
      this.t += dt;
      if (this.floats.length && clock - this.floats[0].t > 1.1) this.floats = this.floats.filter((f) => clock - f.t <= 1.1);
      if (this.locBound && Ext.locId() !== this.locId) { this.cancel('left the area'); return; }
      this.tick(dt);
    }
    post() { if (this.child && !this.child.done) this.child.post(); }
    wait() { return this.done; }    // director Wait shape
    update(dt) { ACT.update(dt); }
    end(result) {
      if (this.done) return this.result;
      this.result = Object.assign({ ok: true, name: this.name }, result || {});
      if (this.auto) this.result.auto = true;
      if (this.child && !this.child.done) this.child.cancel('parent ended');
      this.cleanup();
      this.done = true;
      settle(this);
      return this.result;
    }
    cancel(reason) { return this.end({ ok: false, cancelled: true, reason: reason || 'cancelled' }); }
    undo(fn) { this._undo.push(fn); }
    cleanup() {
      this.pad.clear();
      while (this._undo.length) {
        const fn = this._undo.pop();
        try { fn(); } catch (e) { S.fail(e, { source: 'activity cleanup ' + this.name }); }
      }
    }
    // The player steers Jin while this runs (A.activity's wait already hands control over).
    wantControl(on) { this.control = !!on; }
    // Autoplay from here on (director autoComplete): synthetic input through the same judging code.
    setAuto() {
      if (this.done) return;
      this.auto = true; this.pad.real = false; this.pad.clear();
      if (this.child && !this.child.done) this.child.setAuto();
    }
    // End now as if it had been played through (director timeout under a policy). Subclasses add effects.
    forceFinish(reason) { return this.end({ ok: true, forced: reason || true }); }
    restrictJin(obj) { const r = Ext.restrict(obj); if (r) this.undo(r); return !!r; }
    listen(name, fn) { S.events.on(name, fn); this.undo(() => S.events.off(name, fn)); }
    holdJin(o) {
      const j = Ext.jin();
      const prev = pin && pin.owner === this ? pin.prevScripted : j ? !!j.scripted : false;
      if (pin && pin.owner !== this) releasePin();
      pin = Object.assign({ owner: this, x: j ? j.x : 0, face: j ? j.face || 1 : 1, pose: 'idle', lean: 0, flash: null, prevScripted: prev }, o || {});
      if (j) { j.scripted = true; j.vx = 0; }
      if (!this._pinUndo) { this._pinUndo = true; this.undo(() => this.releaseJin()); }
      return pin;
    }
    releaseJin() { if (pin && pin.owner === this) releasePin(); }
    // Floating feedback word. where: 'jin' | 'coach' | { x, y }.
    say(text, kind, where) {
      let x = 0, y = 0;
      if (where && typeof where === 'object') { x = where.x; y = where.y; }
      else if (where === 'coach' && this.coachPos) { const c = this.coachPos(); x = c.x; y = c.y - 56; }
      else { const j = Ext.jin(); if (j) { x = j.x; y = j.y - 54; } }
      this.floats.push({ text, kind: kind || 'info', x, y, t: clock, id: ++floatSeq });
    }
  }
  let floatSeq = 0;

  /* ── 6. Drill base ────────────────────────────────────────────────── */
  // Every drill: short intro -> a set -> (one retry by default if the target is missed) -> result.
  // Passing level L raises G.train[drill] to L (hard cap 3). Repeating a level already earned gives nothing.
  class Drill extends Activity {
    constructor(name, opts, parent, key) {
      super(name, opts, parent);
      this.key = key; this.info = DRILLS[key];
      const lv = opts && opts.level !== undefined ? +opts.level : defaultLevel(key);
      this.level = clamp(Math.round(isFinite(lv) ? lv : 1), 1, 3);
      this.cfg = Object.assign({}, this.levels()[this.level - 1], (opts && opts.tune) || {});
      this.tries = opts && opts.mustPass ? Infinity : Math.max(1, opts && opts.tries !== undefined ? opts.tries | 0 : 2);
      this.setNo = 0; this.phase = 'intro'; this.pt = 0; this.score = 0; this.of = 0; this.need = 0; this.best = 0;
      this.locBound = true;
      this.outcome = null;
      this.owns = ['interact'];   // no drill uses interact; keep it from starting conversations mid-set
    }
    levels() { return [{}, {}, {}]; }
    halfWidth() { return 60; }
    setup() {}
    startSet() {}
    runTick() { return true; }
    stopSet() {}
    autoTick() {}
    introTick() {}
    ready() { return true; }
    basePrompt() { return this.info.what; }
    begin() {
      this.area = this.findArea(this.halfWidth());
      this.hud.title = (this.opts.title || this.info.name) + ' — Level ' + this.level;
      this.setup();
      if (this.done) return;
      this.wantControl(this.control);
      this.hud.prompt = this.basePrompt();
      this.go('intro');
      Ext.sound('bell', { vol: 0.5 });
    }
    go(phase) { this.phase = phase; this.pt = 0; }
    tick(dt) {
      this.pt += dt;
      const fast = this.auto;
      if (this.phase === 'intro') {
        this.introTick(dt);
        this.hud.sub = 'Get ready';
        const wait = fast ? 0.25 : this.opts.introTime !== undefined ? +this.opts.introTime : 1.8;
        if (this.pt >= wait && this.ready()) this.beginSet();
        return;
      }
      if (this.phase === 'run') {
        if (fast) this.autoTick(dt);
        if (this.runTick(dt)) this.endSet();
        return;
      }
      if (this.phase === 'between') {
        if (this.pt >= (fast ? 0.2 : 1.8)) this.beginSet();
        return;
      }
      if (this.phase === 'outro' && this.pt >= (fast ? 0.2 : 1.4)) this.end(this.outcome);
    }
    beginSet() {
      this.setNo++; this.score = 0;
      this.hud.sub = this.setNo > 1 ? 'Set ' + this.setNo : '';
      this.hud.prompt = this.basePrompt();
      this.startSet();
      this.go('run');
    }
    endSet() {
      this.best = Math.max(this.best, this.score);
      const passed = this.score >= this.need;
      this.stopSet();
      this.pad.clear();
      this.hud.meter = null;
      if (passed || this.setNo >= this.tries) {
        this.outcome = this.conclude(passed);
        this.go('outro');
      } else {
        this.hud.prompt = fmtScore(this.score, this.of) + '. Need ' + fmtScore(this.need, this.of, true) + '. Again.';
        this.hud.sub = 'Reset';
        Ext.sound('uiBack');
        this.go('between');
      }
    }
    conclude(passed) {
      const before = trainLevel(this.key);
      let after = before;
      if (passed) { after = Math.max(before, this.level); setTrainLevel(this.key, after); }
      const improved = after > before;
      if (improved) {
        applyTraining();
        if (!this.opts.quiet) Ext.toast(this.info.name + ' ' + after + '/3 — ' + this.info.effect(after), 'training');
        Ext.sound('quest');
      } else Ext.sound(passed ? 'bell' : 'uiBack', { vol: 0.5 });
      this.hud.sub = passed ? 'Done' : 'Not this time';
      this.hud.prompt = passed
        ? (improved ? this.info.name + ' ' + after + '/3. ' + this.info.effect(after) + '.' : 'Clean. ' + this.info.name + ' stays at ' + after + '/3.')
        : fmtScore(this.best, this.of) + '. It will come. Try again later.';
      this.hud.bar = null; this.hud.chips = null;
      return { ok: passed, drill: this.key, level: this.level, score: this.score, best: this.best, of: this.of, need: this.need,
        sets: this.setNo, before, after, improved };
    }
    // Counted as passed (director timeout under a policy): awards the level like a clean set would.
    forceFinish(reason) {
      if (this.done) return this.result;
      try { if (this.phase === 'run') this.stopSet(); } catch (_) { /* best effort */ }
      this.pad.clear();
      if (!this.outcome) { this.score = Math.max(this.score, this.need); this.best = Math.max(this.best, this.score); this.outcome = this.conclude(true); }
      return this.end(Object.assign({}, this.outcome, { forced: reason || true }));
    }
    findArea(half) {
      const o = this.opts, j = Ext.jin(), L = Ext.loc();
      let p = null;
      if (typeof o.x === 'number') p = { x: o.x, y: typeof o.y === 'number' ? o.y : null };
      else if (o.at) p = Ext.point(o.at);
      if (!p) { const sp = trainingSpot(this.key); if (sp && typeof sp.x === 'number') p = sp; }
      let cx = p ? p.x : j ? j.x : S.W / 2;
      const W = (L && L.w) || S.W;
      if (W > half * 2 + 40) cx = clamp(cx, half + 20, W - half - 20);
      const y = Ext.groundY(cx, p && typeof p.y === 'number' ? p.y : j ? j.y : null);
      return { cx, y, x0: cx - half, x1: cx + half, half, W };
    }
    // The partner for reaction and mitts: an existing NPC (opts.coach or the training spot's coach) or a spawned one.
    setupCoach(defName) {
      const o = this.opts, spot = (trainingSpot(this.key) || {}).opts || {};
      const id = o.coach || spot.coach;
      const j = Ext.jin();
      let a = id ? Ext.actor(id) : null;
      if (a) {
        // Hold the partner where he stands (world.js skips wander/paths while poseHoldT runs) until we finish.
        const saved = { face: a.face, pose: a.pose, x: a.x };
        a.poseHoldT = 1e6;
        this.undo(() => { Ext.tint(a, null); a.poseHoldT = 0; a.face = saved.face; Ext.setPose(a, saved.pose || a.basePose || 'idle'); });
        this.coach = { actor: a, name: a.name || Ext.personName(id) || defName, x: a.x, y: a.y, face: a.face || -1 };
      } else {
        const face = j ? j.face || 1 : 1, L = Ext.loc();
        let x = (j ? j.x : this.area.cx) + face * 30;
        if (L && L.w) x = clamp(x, 16, L.w - 16);
        const pid = 'act_partner';
        Ext.remove(pid);
        const pl = { id: pid, look: o.coachLook || spot.coachLook || 'man', name: o.coachName || spot.coachName || defName,
          x, y: Ext.groundY(x, j ? j.y : null), face: -face, pose: 'guard' };
        a = Ext.spawnNpc(pl);
        if (a) { a.poseHoldT = 1e6; this.undo(() => Ext.remove(pid)); }
        this.coach = { actor: a, name: pl.name, x, y: pl.y, face: -face };
      }
      return this.coach;
    }
    coachPos() {
      const c = this.coach; if (!c) return { x: this.area.cx, y: this.area.y };
      return c.actor ? { x: c.actor.x, y: c.actor.y } : { x: c.x, y: c.y };
    }
    coachPose(pose, tint) { const a = this.coach && this.coach.actor; if (a) { Ext.setPose(a, pose); Ext.tint(a, tint || null); } }
    faceCoachToJin() {
      const a = this.coach && this.coach.actor, j = Ext.jin();
      if (a && j && Math.abs(j.x - a.x) > 2) a.face = sgn(j.x - a.x);
    }
    // Jin squared up in front of the partner, about a step away.
    inFront(maxD) {
      const j = Ext.jin(); if (!j || !this.coach) return true;
      const c = this.coachPos(), dx = c.x - j.x;
      return Math.abs(dx) >= 10 && Math.abs(dx) <= (maxD || 56) && (j.face || 1) === sgn(dx);
    }
    placeJinInFront(gap) {
      const j = Ext.jin(); if (!j) return;
      const c = this.coachPos(), side = sgn(j.x - c.x) || -1;
      j.x = c.x + side * (gap || 28); j.face = -side;
      if ('vx' in j) j.vx = 0;
    }
  }
  const fmtScore = (n, of, need) => (of && n !== of && !need ? n + ' of ' + of : String(n));

  /* ── 7. The six drills ────────────────────────────────────────────── */

  // Balance: Jin stands on a beam (or parallel bars). The sway grows on its own and gusts push it; left/right
  // push back. Time inside the gold zone adds up to the target. Hitting the edge is a stumble (lose a second).
  class BalanceDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'balance'); this.owns = ['punch', 'dash', 'slip', 'flurry', 'jump', 'interact']; }
    levels() {
      return [
        { hold: 7, zone: 0.5, k: 1.4, gust: 0.45, shove: 0, limit: 30 },
        { hold: 9, zone: 0.42, k: 2.0, gust: 0.75, shove: 0, limit: 30 },
        { hold: 11, zone: 0.36, k: 2.6, gust: 1.0, shove: 1.5, limit: 32 },
      ];
    }
    halfWidth() { return 30; }
    basePrompt() { return 'He sways. Push back against it: ' + Ext.label('left') + ' ' + Ext.label('right') + '. Keep the needle in the gold.'; }
    setup() {
      const cx = this.area.cx;
      const bars = Ext.pieces('parallel_bars').find((p) => typeof p.x === 'number' && (Math.abs(p.x - cx) < 50 || (p.w && cx >= p.x && cx <= p.x + p.w)));
      this.pose = this.opts.pose || (bars ? 'bars' : 'idle');
      this.beam = !bars && this.opts.beam !== false;
      const j = Ext.jin();
      this.face = this.opts.face || (j ? j.face || 1 : 1);
      this.holdJin({ x: j ? j.x : cx, pose: 'idle', face: this.face });
      this.of = this.cfg.hold; this.need = this.cfg.hold;
      this.s = 0; this.v = 0;
    }
    // Walk Jin onto the beam during the intro.
    introTick(dt) {
      const p = pin; if (!p || p.owner !== this) return;
      const dx = this.area.cx - p.x;
      if (Math.abs(dx) > 0.5) { p.x = approach(p.x, this.area.cx, walkPx() * dt); p.face = sgn(dx); p.pose = 'walk'; }
      else { p.x = this.area.cx; p.face = this.face; p.pose = this.pose; }
    }
    ready() { return !pin || pin.owner !== this || Math.abs(pin.x - this.area.cx) <= 0.5; }
    startSet() {
      this.s = (S.rand() - 0.5) * 0.2; this.v = 0; this.g = 0; this.gTarget = 0; this.gT = 0;
      this.steady = 0; this.setT = 0; this.stumble = 0; this.shoveT = S.randRange(2.5, 4);
      if (pin && pin.owner === this) pin.pose = this.pose;
    }
    runTick(dt) {
      const c = this.cfg;
      this.setT += dt;
      if (this.stumble > 0) {
        this.stumble -= dt;
        if (pin && pin.owner === this) { pin.pose = this.stumble > 0 ? 'stagger' : this.pose; pin.lean = 0; }
      } else {
        this.gT -= dt;
        if (this.gT <= 0) { this.gTarget = (S.rand() * 2 - 1) * c.gust; this.gT = S.randRange(0.6, 1.3); }
        this.g = approach(this.g, this.gTarget, dt * 1.6);
        if (c.shove) {
          this.shoveT -= dt;
          if (this.shoveT <= 0) { this.v += (S.rand() < 0.5 ? -1 : 1) * c.shove; this.shoveT = S.randRange(2.8, 4.5); this.say('NUDGE', 'info'); }
        }
        const ctrl = (this.pad.down('right') ? 1 : 0) - (this.pad.down('left') ? 1 : 0);
        this.v += (c.k * this.s + this.g + ctrl * 4.2) * dt;   // unstable: the lean feeds itself
        this.v *= Math.max(0, 1 - 1.6 * dt);
        this.s += this.v * dt;
        if (Math.abs(this.s) >= 1) {
          this.steady = Math.max(0, this.steady - 1);
          this.s = sgn(this.s) * 0.2; this.v = 0; this.stumble = 0.45;
          this.say('CAUGHT IT', 'bad'); Ext.sound('land', { vol: 0.6 });
        } else if (Math.abs(this.s) <= c.zone) this.steady += dt;
        if (pin && pin.owner === this) pin.lean = round4(this.s * 0.6);
      }
      this.score = Math.min(c.hold, Math.floor(this.steady * 10) / 10);
      this.hud.meter = { value: clamp(this.s, -1, 1), zone: c.zone };
      this.hud.bar = { value: clamp(this.steady / c.hold, 0, 1), label: 'Steady ' + this.score.toFixed(1) + ' / ' + c.hold + ' s' };
      this.hud.pips = null;
      this.hud.sub = Math.max(0, Math.ceil(c.limit - this.setT)) + ' s left';
      if (this.steady >= c.hold) { this.say('STEADY', 'ok'); return true; }
      return this.setT >= c.limit;
    }
    // Autoplay: a damped bang-bang controller, so the sway physics still runs in tests.
    autoTick() {
      const e = this.s * 2.4 + this.v * 0.9;
      this.pad.hold('right', e < -0.08); this.pad.hold('left', e > 0.08);
    }
    stopSet() { this.pad.hold('left', false); this.pad.hold('right', false); }
    marks() { return this.beam ? [{ x: this.area.cx, y: this.area.y, kind: 'beam' }] : null; }
    draw(ctx, layer) {
      if (layer !== 'back' || !this.beam) return;
      const x = Math.round(this.area.cx), y = Math.round(this.area.y);
      ctx.fillStyle = '#3a2a22'; ctx.fillRect(x - 26, y - 1, 3, 1); ctx.fillRect(x + 23, y - 1, 3, 1);
      ctx.fillStyle = '#6b4a32'; ctx.fillRect(x - 28, y - 4, 56, 3);
      ctx.fillStyle = '#8a6444'; ctx.fillRect(x - 28, y - 4, 56, 1);
    }
  }

  // Footwork: floor marks light one at a time; reach each before it goes out. Level 3 adds arrow marks behind
  // Jin that must be reached still facing front (backdash or guarded backstep).
  class FootworkDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'footwork'); }
    levels() {
      return [
        { n: 6, time: 2.3, spread: 72, back: 0, need: 5 },
        { n: 8, time: 1.5, spread: 100, back: 0, need: 6 },
        { n: 10, time: 1.1, spread: 115, back: 3, need: 8 },
      ];
    }
    halfWidth() { return this.cfg.spread + 10; }
    basePrompt() {
      if (this.level === 1) return 'Step onto the lit mark before it goes out (' + Ext.label('left') + ' ' + Ext.label('right') + ').';
      if (this.level === 2) return 'Lit mark — get there. ' + Ext.label('dash') + ' dashes.';
      return 'Arrow marks: keep facing front — ' + Ext.label('dash') + ' + back to backdash.';
    }
    setup() { this.of = this.cfg.n; this.need = this.cfg.need; this.list = []; }
    startSet() {
      const c = this.cfg, a = this.area, j = Ext.jin();
      this.face0 = j ? j.face || 1 : 1;
      let prev = clamp(j ? j.x : a.cx, a.x0, a.x1);
      const back = new Set();
      while (back.size < Math.min(c.back, c.n - 2)) { const i = S.randInt(2, c.n - 1); if (!back.has(i - 1) && !back.has(i + 1)) back.add(i); }
      this.list = [];
      for (let i = 0; i < c.n; i++) {
        let x, isBack = back.has(i);
        if (isBack) {
          x = prev - this.face0 * S.randRange(30, 56);
          if (x < a.x0 || x > a.x1) isBack = false;
        }
        if (!isBack) {
          for (let k = 0; k < 10; k++) { x = S.randRange(a.x0, a.x1); if (Math.abs(x - prev) >= 30 && Math.abs(x - prev) <= c.spread * 1.4) break; }
          if (Math.abs(x - prev) < 24) x = prev + (prev < a.cx ? 1 : -1) * 40;
        }
        x = Math.round(clamp(x, a.x0, a.x1));
        this.list.push({ x, y: Ext.groundY(x, a.y), back: isBack, state: 'wait' });
        prev = x;
      }
      this.cur = -1; this.gap = 0.3; this.markT = 0;
      this.hud.pips = { of: c.n, list: this.list.map(() => 'todo') };
    }
    lightNext() {
      this.cur++;
      const m = this.list[this.cur]; if (!m) return;
      m.state = 'lit'; this.markT = 0; this.sawBack = false;
      Ext.sound('uiMove', { vol: 0.6 });
    }
    runTick(dt) {
      const c = this.cfg;
      if (this.gap > 0) { this.gap -= dt; if (this.gap <= 0) this.lightNext(); this.syncHud(); return false; }
      const m = this.list[this.cur];
      if (!m) return true;
      this.markT += dt;
      const j = Ext.jin();
      if (j && jinAct(j) === 'backdash') this.sawBack = true;
      const there = j ? Math.abs(j.x - m.x) <= 9 && Math.abs(j.y - m.y) <= 12 : this.markT > 0.3;
      const facingOk = !m.back || !j || (j.face || 1) === this.face0 || this.sawBack;
      if (there && facingOk) {
        m.state = 'ok'; this.score++; this.say(m.back ? 'GUARD UP' : 'GOOD', 'ok'); Ext.sound('step');
        this.gap = 0.12;
      } else if (this.markT >= c.time) {
        m.state = 'miss'; this.say(there ? 'FACE FRONT' : 'LATE', 'bad'); Ext.sound('whiff', { vol: 0.5 });
        this.gap = 0.2;
      } else if (there && !facingOk) this.hud.prompt = 'Keep facing front: ' + Ext.label('dash') + ' + back.';
      this.syncHud();
      return this.cur >= this.list.length - 1 && this.gap > 0 && m.state !== 'lit';
    }
    syncHud() {
      const m = this.list[this.cur];
      this.hud.pips = { of: this.list.length, list: this.list.map((k) => (k.state === 'lit' ? 'now' : k.state === 'ok' ? 'ok' : k.state === 'miss' ? 'bad' : 'todo')) };
      this.hud.bar = m && m.state === 'lit' ? { value: clamp(1 - this.markT / this.cfg.time, 0, 1), label: '', warn: this.markT > this.cfg.time * 0.7 } : null;
    }
    autoTick(dt) {
      const m = this.list[this.cur], j = Ext.jin();
      if (!m || m.state !== 'lit' || !j || this.markT < 0.08) return;
      j.x = approach(j.x, m.x, runPx() * 1.6 * dt);
      j.face = m.back ? this.face0 : sgn(m.x - j.x) || j.face;
      if ('vx' in j) j.vx = 0;
    }
    marks() {
      const out = [];
      if (!this.list || this.phase !== 'run') return out;
      const m = this.list[this.cur], nx = this.list[this.cur + 1];
      if (m && m.state === 'lit') out.push({ x: m.x, y: m.y, kind: 'lit', back: m.back, face: this.face0, k: clamp(1 - this.markT / this.cfg.time, 0, 1) });
      if (nx) out.push({ x: nx.x, y: nx.y, kind: 'next', back: nx.back, face: this.face0 });
      return out;
    }
    draw(ctx, layer) { if (layer === 'back') for (const m of this.marks()) drawFloorMark(ctx, m); }
  }

  // Reaction: the partner telegraphs a cue. HIGH (a swing at the head): slip. LOW (to the body): guard.
  // PAD (an open mitt): jab it. Wrong answers and late answers are misses; nothing hurts.
  class ReactionDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'reaction'); }
    levels() {
      return [
        { n: 6, kinds: ['high', 'pad'], windup: 0.75, slipWin: 0.30, padWin: 0.95, gap: [0.9, 1.3], need: 5 },
        { n: 8, kinds: ['high', 'low', 'pad'], windup: 0.6, slipWin: 0.24, padWin: 0.75, gap: [0.7, 1.05], need: 6 },
        { n: 10, kinds: ['high', 'low', 'pad'], windup: 0.46, slipWin: 0.18, padWin: 0.58, gap: [0.45, 0.8], need: 8 },
      ];
    }
    halfWidth() { return 50; }
    basePrompt() {
      const parts = [];
      if (this.kinds.includes('high')) parts.push('High: slip ' + Ext.label('slip'));
      if (this.kinds.includes('low')) parts.push('Low: guard, hold ' + Ext.label('down'));
      if (this.kinds.includes('pad')) parts.push('Open pad: jab ' + Ext.label('punch'));
      return parts.join(' · ') + '.';
    }
    setup() {
      const ok = { high: Ext.allowed('slip'), low: Ext.allowed('guard'), pad: Ext.allowed('punch') && Ext.allowed('jab') };
      this.kinds = this.cfg.kinds.filter((k) => ok[k]);
      if (!this.kinds.length) { this.end({ ok: false, drill: this.key, level: this.level, reason: 'restricted' }); return; }
      this.setupCoach('Coach');
      this.of = this.cfg.n; this.need = this.cfg.need;
    }
    startSet() {
      const seq = [];
      for (let i = 0; i < this.cfg.n; i++) {
        let k = U.pick(this.kinds, S.rand());
        if (i >= 2 && seq[i - 1] === k && seq[i - 2] === k && this.kinds.length > 1) k = this.kinds[(this.kinds.indexOf(k) + 1) % this.kinds.length];
        seq.push(k);
      }
      this.seq = seq; this.i = 0; this.wait = 0.8; this.cue = null; this.results = [];
      this.coachPose('guard');
    }
    runTick(dt) {
      const c = this.cfg;
      this.faceCoachToJin();
      this.hud.pips = { of: c.n, list: this.seq.map((_, i) => (i < this.results.length ? (this.results[i] ? 'ok' : 'bad') : i === this.i - 1 && this.cue ? 'now' : 'todo')) };
      const q = this.cue;
      if (!q) {
        if (this.i >= this.seq.length) return true;
        if (!this.inFront()) { this.hud.prompt = 'Square up in front of ' + this.coach.name + ', about a step away.'; return false; }
        this.hud.prompt = this.basePrompt();
        this.wait -= dt;
        if (this.wait > 0) return false;
        this.cue = { kind: this.seq[this.i++], t: 0, slipAt: null, punchAt: null, punchLow: false, guard: null, judged: false, hold: 0 };
        const k = this.cue.kind;
        if (k === 'pad') { this.coachPose('reach'); this.say('PAD', 'call', 'coach'); }
        else { this.coachPose('windup', '#e8c272'); this.say(k === 'high' ? 'HIGH' : 'LOW', 'call', 'coach'); }
        return false;
      }
      q.t += dt;
      if (q.judged) {
        q.hold -= dt;
        if (q.hold <= 0) { this.cue = null; this.wait = S.randRange(c.gap[0], c.gap[1]); this.coachPose('guard'); }
        return false;
      }
      if (this.pad.pressed('slip')) q.slipAt = q.t;
      if (this.pad.pressed('punch') && q.punchAt === null) { q.punchAt = q.t; q.punchLow = this.pad.down('down'); }
      if (q.kind === 'pad') {
        if (q.punchAt !== null) {
          if (q.punchLow) this.judge(false, 'JUST THE JAB');
          else if (q.slipAt !== null) this.judge(false, 'IT WAS OPEN');
          else this.judge(true, 'POP', 'jab');
        } else if (q.t >= c.padWin) this.judge(false, q.slipAt !== null ? 'IT WAS OPEN' : 'LATE');
        return false;
      }
      const impact = c.windup;
      if (q.t >= impact && q.guard === null) {
        q.guard = this.pad.down('down');
        this.coachPose(q.kind === 'high' ? 'jab' : 'hook');
      }
      if (q.t >= impact + 0.05) {
        const slipIn = q.slipAt !== null && q.slipAt >= impact - c.slipWin && q.slipAt <= impact + 0.05;
        if (q.kind === 'high') {
          if (slipIn) this.judge(true, 'SLIPPED', 'slipOk');
          else if (q.slipAt !== null && q.slipAt < impact - c.slipWin) this.judge(false, 'EARLY');
          else if (q.guard) this.judge(false, 'SLIP THAT ONE');
          else if (q.punchAt !== null) this.judge(false, 'TOO GREEDY');
          else this.judge(false, 'TAGGED');
        } else {
          if (q.guard && !slipIn) this.judge(true, 'BLOCKED', 'block');
          else if (slipIn) this.judge(false, 'GUARD THE BODY');
          else this.judge(false, 'TAGGED');
        }
      }
      return false;
    }
    judge(ok, word, snd) {
      const q = this.cue; q.judged = true; q.hold = 0.28;
      this.results.push(ok);
      if (ok) this.score++;
      this.say(word, ok ? 'ok' : 'bad');
      Ext.sound(ok ? snd || 'ui' : 'whiff', { vol: ok ? 0.8 : 0.5 });
      if (!ok && q.kind !== 'pad') { const a = this.coach.actor; if (a) Ext.tint(a, null); }
    }
    autoTick() {
      const q = this.cue, c = this.cfg;
      if (!q) { if (!this.inFront()) this.placeJinInFront(28); this.pad.hold('down', false); return; }
      if (q.judged) { this.pad.hold('down', false); return; }
      if (q.kind === 'high' && !q.auto && q.t >= c.windup - c.slipWin * 0.5) { q.auto = true; this.pad.tap('slip'); }
      if (q.kind === 'low') this.pad.hold('down', q.t >= c.windup * 0.4);
      if (q.kind === 'pad' && !q.auto && q.t >= 0.15) { q.auto = true; this.pad.tap('punch'); }
    }
    stopSet() { this.pad.hold('down', false); this.coachPose('guard'); }
  }

  // Conditioning: run cone to cone. Running burns wind, walking or standing gives it back. Run dry and Jin
  // stops, winded, for two seconds. Reach the lap target before the clock runs out.
  class ConditioningDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'conditioning'); }
    levels() {
      return [
        { laps: 3, limit: 30, drain: 0.16, course: 90 },
        { laps: 4, limit: 21, drain: 0.19, course: 110 },
        { laps: 5, limit: 21, drain: 0.23, course: 120 },
      ];
    }
    halfWidth() { return this.cfg.course + 12; }
    basePrompt() { return 'Run the cones. Ease off before your wind gives out: ' + Ext.label('run') + ' switches to a walk.'; }
    setup() {
      const a = this.area;
      const course = Math.max(40, Math.min(this.cfg.course, (a.W - 64) / 2));
      this.cones = [a.cx - course, a.cx + course].map((x) => ({ x: Math.round(x), y: Ext.groundY(x, a.y) }));
      this.of = this.cfg.laps; this.need = this.cfg.laps;
    }
    startSet() {
      const j = Ext.jin();
      this.wind = 1; this.legs = 0; this.setT = 0; this.winded = 0; this.spd = 0; this.running = true;
      this.lastX = j ? j.x : this.area.cx;
      this.next = this.lastX < this.area.cx ? 1 : 0;   // first to the far cone
    }
    runTick(dt) {
      const c = this.cfg, j = Ext.jin();
      this.setT += dt;
      const x = j ? j.x : this.lastX;
      const v = Math.abs(x - this.lastX) / Math.max(dt, 1e-4);
      this.lastX = x;
      this.spd = lerp(this.spd, Math.min(v, runPx() * 3), Math.min(1, dt * 12));
      if (this.winded > 0) {
        this.winded -= dt;
        this.wind = Math.min(0.35, this.wind + (0.35 / 2.2) * dt);
        if (this.winded <= 0) { this.releaseJin(); this.say('GO', 'info'); }
      } else {
        const w = walkPx() * 1.15, run = clamp((this.spd - w) / Math.max(1, runPx() - w), 0, 1);
        if (run > 0) this.wind -= c.drain * run * dt;
        else this.wind = Math.min(1, this.wind + (this.spd < 12 ? 0.42 : 0.3) * dt);
        if (this.wind <= 0) {
          this.wind = 0; this.winded = 2.2;
          this.holdJin({ x, pose: 'tired' });
          this.say('WINDED', 'bad'); Ext.sound('heartbeat', { vol: 0.6 });
        }
        const cone = this.cones[this.next];
        if (Math.abs(x - cone.x) <= 10 && (!j || Math.abs(j.y - cone.y) <= 14)) {
          this.legs++; this.next ^= 1;
          this.say(this.legs % 2 === 0 ? 'LAP ' + this.legs / 2 : 'TURN', this.legs % 2 === 0 ? 'ok' : 'info');
          Ext.sound('step');
        }
      }
      this.score = Math.floor(this.legs / 2);
      const low = this.wind < 0.3;
      this.hud.prompt = this.winded > 0 ? 'Winded. Breathe.' : low ? 'Ease off — walk (' + Ext.label('run') + ') until your wind comes back.' : this.basePrompt();
      this.hud.bar = { value: clamp(this.wind, 0, 1), label: 'Wind', warn: low };
      this.hud.pips = { of: c.laps, list: Array.from({ length: c.laps }, (_, i) => (i < this.score ? 'ok' : i === this.score ? 'now' : 'todo')) };
      this.hud.sub = Math.max(0, Math.ceil(c.limit - this.setT)) + ' s left';
      return this.score >= c.laps || this.setT >= c.limit;
    }
    // Autoplay paces itself with the wind meter (run while above 35%, walk back up to 80%).
    autoTick(dt) {
      const j = Ext.jin(); if (!j || this.winded > 0) return;
      if (this.running && this.wind < 0.35) this.running = false;
      else if (!this.running && this.wind > 0.8) this.running = true;
      const cone = this.cones[this.next];
      j.x = approach(j.x, cone.x, (this.running ? runPx() : walkPx() * 0.9) * dt);
      j.face = sgn(cone.x - j.x) || j.face;
      if ('vx' in j) j.vx = 0;
    }
    marks() {
      if (!this.cones) return null;
      return this.cones.map((c, i) => ({ x: c.x, y: c.y, kind: 'cone', label: this.phase === 'run' && i === this.next ? 'NEXT' : null }));
    }
    draw(ctx, layer) {
      if (layer !== 'back' || !this.cones) return;
      this.cones.forEach((c, i) => drawCone(ctx, c.x, c.y, this.phase === 'run' && i === this.next));
    }
  }

  // Heavy bag: the combination is shown as chips; throw it in order, on the bag, without long pauses.
  // A wrong punch, a miss or a pause resets that combination (three tries each, then the next one).
  function comboPool(level) {
    const has = (v) => Ext.allowed(v);
    const J = ['jab'], JC = ['jab', 'cross'], JCH = has('hook') ? ['jab', 'cross', 'hook'] : ['jab', 'cross'];
    const UP = has('uppercut') ? ['uppercut'] : null;
    const cat = (...segs) => [].concat(...segs.map((s) => s || J));
    if (level === 1) return [cat(JC), cat(J, JC), cat(J, J), cat(JC, J)];
    if (level === 2) return [cat(JCH), cat(JC, UP), cat(J, JCH), cat(UP, JC), cat(JC, JC)];
    const L3 = [cat(JCH, UP || JC), cat(J, J, JCH), cat(JC, UP, JC), cat(UP, JCH)];
    if (has('dashStraight')) L3.push(['dashStraight']);
    if (has('flurry')) L3.push(['flurry']);
    return L3;
  }
  function pickFrom(pool, n) {
    const order = pool.map((c, i) => ({ c, r: S.rand(), i })).sort((a, b) => a.r - b.r).map((o) => o.c);
    const out = [];
    for (let i = 0; i < n; i++) out.push(order[i % order.length].slice());
    return out;
  }
  function comboPrompt(combo) {
    const bits = [Ext.label('punch') + ' punches; press again to chain'];
    // Repeated presses always run jab → cross → hook, so a jab after a jab or a cross needs a beat first.
    const CHAIN = { jab: 'cross', cross: 'hook' };
    if (combo.some((k, i) => i > 0 && k === 'jab' && CHAIN[combo[i - 1]] !== 'jab')) bits.push('pause a beat to start again with a jab');
    if (combo.includes('uppercut')) bits.push(Ext.label('down') + '+' + Ext.label('punch') + ' uppercut');
    if (combo.includes('dashStraight')) bits.push('back off, ' + Ext.label('dash') + ' in, then ' + Ext.label('punch'));
    if (combo.includes('flurry')) bits.push(Ext.label('flurry') + ' flurry');
    return bits.join(' · ') + '.';
  }
  const comboChips = (combo, pos) => combo.map((k, i) => ({ text: NAME[k] || k, state: i < pos ? 'ok' : i === pos ? 'now' : 'todo' }));

  class BagDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'bag'); this.watch = new PunchWatch(); }
    levels() {
      return [
        { combos: 4, gap: 1.0, need: 3 },
        { combos: 5, gap: 0.8, need: 4 },
        { combos: 6, gap: 0.65, need: 5 },
      ];
    }
    halfWidth() { return 50; }
    basePrompt() { const c = this.list && this.list[this.ci]; return 'Throw it clean. ' + comboPrompt(c || ['jab']); }
    setup() {
      if (!Ext.allowed('punch')) { this.end({ ok: false, drill: this.key, level: this.level, reason: 'restricted' }); return; }
      const a = this.area, j = Ext.jin(), o = this.opts;
      let bx = typeof o.bagX === 'number' ? o.bagX : null, piece = null;
      const near = Ext.pieces('heavy_bag').filter((p) => typeof p.x === 'number').sort((p, q) => Math.abs(p.x - a.cx) - Math.abs(q.x - a.cx))[0];
      if (bx === null && near && Math.abs(near.x - a.cx) < 160) bx = near.x;
      if (near && bx !== null && Math.abs(near.x - bx) < 4) piece = near;
      if (bx === null) {
        const sp = trainingSpot('bag');
        const placed = typeof o.x === 'number' || (o.at && Ext.point(o.at)) || (sp && typeof sp.x === 'number');
        bx = placed ? a.cx : j ? j.x + (j.face || 1) * 40 : a.cx;   // no spot: hang it just in front of Jin
      }
      this.bagX = bx; this.bagY = Ext.groundY(bx, a.y);
      // The bag hangs where the "Use" spot is, so Jin usually starts inside it: step him to working
      // distance on his side, facing it (combat lets him walk through idle props).
      if (j && Math.abs(j.x - bx) < 18) { const side = j.x < bx || (j.x === bx && (j.face || 1) > 0) ? -1 : 1; j.x = bx + side * 22; j.vx = 0; j.face = -side; }
      // The punchable bag is a combat 'bag' actor (hits, sparks, sounds, sway). When the room already hangs a
      // heavy_bag piece here, that piece stays the visible bag: the actor draws nothing and its swing drives
      // the piece's sway, so there are never two bags on screen.
      const e = Ext.spawnEnemy({ id: 'act_bag', type: 'bag', x: bx, y: this.bagY, face: -1, name: 'Heavy bag', opts: { drill: true, passive: true } });
      if (e) {
        this.bag = e; this.undo(() => Ext.remove(e.id));
        if (piece) {
          const sway0 = piece.sway;
          this.piece = piece; this.pieceSway = typeof sway0 === 'number' ? sway0 : 0.6;
          e.draw = () => {};
          this.undo(() => { if (sway0 === undefined) delete piece.sway; else piece.sway = sway0; });
        }
      }
      this.listen('hit', (ev) => { if (ev && this.bag && ev.target === this.bag) this.lastHit = clock; });
      this.of = this.cfg.combos; this.need = this.cfg.need;
    }
    startSet() {
      this.list = pickFrom(comboPool(this.level), this.cfg.combos);
      this.ci = 0; this.pos = 0; this.attempt = 0; this.lastAt = -9; this.results = []; this.autoAt = 0;
      this.hud.prompt = this.basePrompt();
    }
    bagPos() { return this.bag ? { x: this.bag.x, y: this.bag.y } : { x: this.bagX, y: this.bagY }; }
    post() {
      const ai = this.piece && this.bag && this.bag.enemy;
      if (ai) this.piece.sway = round1(this.pieceSway + Math.min(5, Math.abs(+ai.swing || 0) * 22));
    }
    inRange(kind) {
      const j = Ext.jin(); if (!j || this.auto) return true;
      const dx = this.bagPos().x - j.x, reach = kind === 'dashStraight' ? 46 : 36;
      return Math.abs(dx) <= reach && (Math.abs(dx) < 4 || (j.face || 1) === sgn(dx));
    }
    runTick() {
      const combo = this.list[this.ci];
      if (!combo) return true;
      const throws = this.auto ? this.injected || [] : this.watch.step(this.pad, Ext.jin());
      this.injected = null;
      for (const k of throws) { this.onPunch(k); if (this.ci >= this.list.length) break; }
      if (this.pos > 0 && clock - this.lastAt > this.cfg.gap + 0.35) this.failAttempt('TOO SLOW');
      const cur = this.list[this.ci];
      this.hud.chips = cur ? comboChips(cur, this.pos) : null;
      this.hud.pips = { of: this.list.length, list: this.list.map((_, i) => (i < this.results.length ? (this.results[i] ? 'ok' : 'bad') : i === this.ci ? 'now' : 'todo')) };
      const j = Ext.jin(), bp = this.bagPos();
      if (cur && j && !this.auto && Math.abs(bp.x - j.x) > 60) this.hud.prompt = 'Step up to the bag.';
      else if (cur) this.hud.prompt = 'Throw it clean. ' + comboPrompt(cur);
      this.hud.sub = this.attempt ? 'Try ' + (this.attempt + 1) + ' of 3' : '';
      return this.ci >= this.list.length;
    }
    onPunch(kind) {
      if (this.pos > 0 && clock - this.lastAt > this.cfg.gap) this.failAttempt('TOO SLOW');
      let combo = this.list[this.ci]; if (!combo) return;
      if (!this.inRange(kind)) {
        // Shadowboxing on the way in is not a try; a miss in the middle of a combination is.
        if (this.pos > 0) this.failAttempt('MISSED THE BAG'); else this.say('STEP IN', 'info');
        return;
      }
      if (kind !== combo[this.pos]) {
        const fumbled = this.pos > 0;
        this.failAttempt(fumbled && kind === combo[0] ? 'AGAIN' : 'THAT WAS A ' + (NAME[kind] || kind).toUpperCase());
        // A wrong punch that is the first punch of the (possibly next) combination starts it over.
        combo = this.list[this.ci];
        if (!fumbled || !combo || kind !== combo[0]) return;
      }
      this.pos++; this.lastAt = clock;
      if (this.pos >= combo.length) {
        this.score++; this.results.push(true);
        this.say('CLEAN', 'ok'); Ext.sound('ui', { vol: 0.6 });
        this.ci++; this.pos = 0; this.attempt = 0;
      }
    }
    failAttempt(msg) {
      this.say(msg, 'bad');
      this.pos = 0; this.attempt++;
      if (this.attempt >= 3) {
        this.results.push(false); this.say('NEXT ONE', 'info');
        this.ci++; this.attempt = 0;
      }
    }
    autoTick(dt) {
      const combo = this.list[this.ci]; if (!combo) return;
      const j = Ext.jin(), bp = this.bagPos();
      if (j && Math.abs(bp.x - j.x) > 30) { j.x = bp.x - (sgn(bp.x - j.x) || 1) * 24; j.face = sgn(bp.x - j.x) || 1; }
      this.autoAt += dt;
      if (this.autoAt >= 0.26) { this.autoAt = 0; this.injected = [combo[this.pos]]; }
    }
    marks() { return this.bag ? null : [{ x: this.bagX, y: this.bagY, kind: 'bag' }]; }
    draw(ctx, layer) { if (layer === 'front' && !this.bag) drawBag(ctx, this.bagX, this.bagY); }
  }

  // Mitt work: the partner calls a combination (1 = jab, 2 = cross, 3 = hook, UP = uppercut), Jin hits it on the
  // mitts, then the partner swings back: slip it, then counter. Level 1 only asks for the slip.
  class MittsDrill extends Drill {
    constructor(n, o, p) { super(n, o, p, 'mitts'); this.watch = new PunchWatch(); }
    levels() {
      return [
        { calls: 4, swings: [0, 1, 0, 1], limit: 2.4, windup: 0.75, slipWin: 0.30, counter: false },
        { calls: 5, swings: [1, 1, 0, 1, 1], limit: 2.1, windup: 0.6, slipWin: 0.24, counter: true },
        { calls: 6, swings: [1, 2, 1, 2, 1, 2], limit: 2.0, windup: 0.48, slipWin: 0.18, counter: true },
      ];
    }
    halfWidth() { return 50; }
    basePrompt() {
      let s = 'Hit the call on the mitts. When he swings back, slip ' + Ext.label('slip');
      if (this.cfg.counter) s += ', then counter ' + Ext.label('punch');
      return s + '.';
    }
    setup() {
      if (!Ext.allowed('punch')) { this.end({ ok: false, drill: this.key, level: this.level, reason: 'restricted' }); return; }
      this.canSlip = Ext.allowed('slip');
      this.setupCoach('Coach');
      const c = this.cfg;
      const swings = c.swings.slice(0, c.calls).map((n) => (this.canSlip ? n : 0));
      this.swings = swings;
      const swingTotal = swings.reduce((a, b) => a + b, 0);
      const counters = c.counter ? swings.filter((n) => n > 0).length : 0;
      this.of = c.calls + swingTotal + counters;
      this.need = Math.ceil(this.of * 0.7);
      this.counterWord = Ext.allowed('counter') ? 'COUNTER' : 'RETURN';
    }
    callPool() {
      const has = (v) => Ext.allowed(v);
      const J = ['jab'], JC = ['jab', 'cross'], JCH = has('hook') ? ['jab', 'cross', 'hook'] : ['jab', 'cross', 'jab'];
      const UP = has('uppercut') ? ['uppercut'] : ['cross'];
      if (this.level === 1) return [J, JC, ['jab', 'jab']];
      if (this.level === 2) return [JC, JCH, J.concat(JC), UP];
      return [JCH, JC.concat(UP), J.concat(JCH), JCH.concat(UP)];
    }
    startSet() {
      this.calls = pickFrom(this.callPool(), this.cfg.calls);
      this.ci = -1; this.stage = 'gap'; this.st = 0.9; this.results = [];
      this.coachPose('guard');
    }
    callName(call) { return call.length === 1 ? (NAME[call[0]] || call[0]).toUpperCase() : call.map((k) => CALL[k] || k).join('-'); }
    mark(ok, word, snd) {
      this.results.push(ok); if (ok) this.score++;
      this.say(word, ok ? 'ok' : 'bad');
      Ext.sound(ok ? snd || 'block' : 'whiff', { vol: ok ? 0.8 : 0.5 });
    }
    toSwing() {
      this.swingsLeft = this.swings[this.ci] || 0;
      this.lastSlipOk = false;
      this.telegraphed = false; this.hitShown = false; this.autoSlipped = false;
      if (this.swingsLeft > 0) { this.stage = 'swing'; this.st = -0.3; this.slipAt = null; }
      else { this.stage = 'gap'; this.st = 0.6; this.coachPose('guard'); }
    }
    runTick(dt) {
      const c = this.cfg, j = Ext.jin();
      this.faceCoachToJin();
      const throws = this.auto ? this.injected || [] : this.watch.step(this.pad, j);
      this.injected = null;
      const call = this.calls[this.ci];
      this.hud.pips = { of: this.of, list: Array.from({ length: this.of }, (_, i) => (i < this.results.length ? (this.results[i] ? 'ok' : 'bad') : 'todo')) };
      switch (this.stage) {
        case 'gap': {
          this.hud.chips = null;
          if (!this.inFront()) { this.hud.prompt = 'Square up in front of ' + this.coach.name + ', about a step away.'; return false; }
          this.hud.prompt = this.basePrompt();
          this.st -= dt;
          if (this.st > 0) return false;
          this.ci++;
          if (this.ci >= this.calls.length) return true;
          this.stage = 'call'; this.st = 0; this.pos = 0;
          this.coachPose('guard');
          this.say(this.callName(this.calls[this.ci]), 'call', 'coach');
          return false;
        }
        case 'call': {
          this.st += dt;
          this.hud.chips = comboChips(call, this.pos);
          this.hud.bar = { value: clamp(1 - this.st / c.limit, 0, 1), label: '', warn: this.st > c.limit * 0.7 };
          for (const k of throws) {
            if (!this.inFront(this.auto ? 999 : 44)) { this.say('REACH IT', 'bad'); continue; }
            if (k === call[this.pos]) {
              this.pos++; this.coachPose('block'); Ext.sound('block', { vol: 0.7 });
              if (this.pos >= call.length) { this.hud.bar = null; this.mark(true, 'GOOD', 'block'); this.toSwing(); return false; }
            } else { this.hud.bar = null; this.mark(false, 'LISTEN TO THE CALL'); this.toSwing(); return false; }
          }
          if (this.st >= c.limit) { this.hud.bar = null; this.mark(false, 'TOO SLOW'); this.toSwing(); }
          return false;
        }
        case 'swing': {
          this.st += dt;
          this.hud.chips = null;
          if (this.st < 0) return false;
          if (!this.telegraphed) { this.telegraphed = true; this.coachPose('windup', '#e8c272'); }
          if (this.pad.pressed('slip')) this.slipAt = this.st;
          if (this.st >= c.windup && !this.hitShown) { this.hitShown = true; this.coachPose('hook'); }
          if (this.st >= c.windup + 0.05) {
            const ok = this.slipAt !== null && this.slipAt >= c.windup - c.slipWin && this.slipAt <= c.windup + 0.05;
            const early = this.slipAt !== null && this.slipAt < c.windup - c.slipWin;
            this.mark(ok, ok ? 'SLIPPED' : early ? 'EARLY' : 'TAGGED', 'slipOk');
            this.lastSlipOk = ok;
            this.swingsLeft--; this.telegraphed = false; this.hitShown = false; this.autoSlipped = false;
            if (this.swingsLeft > 0) { this.st = -0.35; this.slipAt = null; }
            else if (c.counter && ok) { this.stage = 'counter'; this.st = 0; }
            else {
              if (c.counter) this.results.push(false);   // the counter never came: a missed unit
              this.stage = 'gap'; this.st = 0.6;
            }
            if (this.stage !== 'swing') this.coachPose('guard');
          }
          return false;
        }
        case 'counter': {
          this.st += dt;
          const win = ((S.tune && S.tune.counterWindow) || 0.3) + 0.1;
          this.hud.prompt = 'Now! ' + Ext.label('punch');
          for (const k of throws) {
            if (k && this.inFront(this.auto ? 999 : 48)) { this.mark(true, this.counterWord + '!', 'counter'); this.stage = 'gap'; this.st = 0.6; return false; }
          }
          if (this.st > win) { this.mark(false, 'NO ' + this.counterWord); this.stage = 'gap'; this.st = 0.6; }
          return false;
        }
      }
      return false;
    }
    autoTick(dt) {
      const c = this.cfg;
      if (!this.inFront()) this.placeJinInFront(28);
      if (this.stage === 'call') {
        this.autoAt = (this.autoAt || 0) + dt;
        if (this.autoAt >= 0.26) { this.autoAt = 0; const call = this.calls[this.ci]; if (call && this.pos < call.length) this.injected = [call[this.pos]]; }
      } else this.autoAt = 0;
      if (this.stage === 'swing' && this.st >= c.windup - c.slipWin * 0.5 && !this.autoSlipped) { this.autoSlipped = true; this.pad.tap('slip'); }
      if (this.stage === 'counter' && this.st >= 0.08) this.injected = ['cross'];
    }
    stopSet() { this.coachPose('guard'); }
  }

  /* ── 8. Carry, repair, work shift ─────────────────────────────────── */

  // Carry: walk to the load (if `from` is given), lift it, take it to `to` (an x here, a point name, or a location
  // id, optionally with toX), set it down. While carrying: slower, no punch/dash/jump/slip, with a stated reason.
  function resolveX(v) {
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object' && typeof v.x === 'number') return v.x;
    if (typeof v === 'string') { const p = Ext.point(v); if (p) return p.x; }
    return null;
  }
  class Carry extends Activity {
    constructor(n, o, p) {
      super(n, o, p);
      this.item = o.item || 'box';
      this.label = o.label || String(this.item).replace(/_/g, ' ');
    }
    begin() {
      const o = this.opts;
      this.fromX = resolveX(o.from);
      let toLoc = typeof o.toLoc === 'string' ? o.toLoc : null, toX = typeof o.toX === 'number' ? o.toX : null;
      if (typeof o.to === 'number') toX = o.to;
      else if (o.to && typeof o.to === 'object') { if (typeof o.to.x === 'number') toX = o.to.x; if (o.to.loc) toLoc = o.to.loc; }
      else if (typeof o.to === 'string') { const pt = Ext.point(o.to); if (pt) toX = pt.x; else toLoc = o.to; }
      this.toLoc = toLoc && toLoc !== this.locId ? toLoc : null;
      this.toX = toX;
      this.destLabel = o.toLabel || (this.toLoc ? Ext.locName(this.toLoc) : 'the spot');
      this.hud.title = o.title || 'Carry — ' + this.label;
      this.wantControl(true);
      const j = Ext.jin();
      this.go(this.fromX !== null && j && Math.abs(j.x - this.fromX) > 14 ? 'fetch' : 'lift');
    }
    go(phase) {
      this.phase = phase; this.pt = 0;
      if (phase === 'lift' || phase === 'drop') { const j = Ext.jin(); this.holdJin({ x: j ? j.x : 0, pose: 'crouch' }); }
    }
    arrived(j) {
      const here = Ext.locId();
      const sameLoc = this.toLoc ? here === this.toLoc : here === this.locId;
      return { sameLoc, there: sameLoc && (this.toX === null || !j || Math.abs(j.x - this.toX) <= 14) };
    }
    tick(dt) {
      this.pt += dt;
      const j = Ext.jin();
      switch (this.phase) {
        case 'fetch':
          this.hud.prompt = 'Walk to the ' + this.label + '.';
          if (this.auto && j) { j.x = approach(j.x, this.fromX, walkPx() * dt); j.face = sgn(this.fromX - j.x) || j.face; j.vx = 0; }
          if (!j || Math.abs(j.x - this.fromX) <= 14) this.go('lift');
          break;
        case 'lift':
          this.hud.prompt = 'Lifting the ' + this.label + '.';
          if (this.pt >= 0.35) { this.releaseJin(); this.pickUp(); this.go('carry'); }
          break;
        case 'carry': {
          const away = this.toLoc && Ext.locId() !== this.toLoc;
          this.hud.prompt = 'Carry the ' + this.label + ' to ' + (away ? this.destLabel : 'the marked spot') +
            '. Hands full: no punching, dashing or jumping.';
          if (this.toX === null && !this.toLoc) { this.go('drop'); break; }
          const st = this.arrived(j);
          if (st.there) { this.go('drop'); break; }
          if (this.auto) this.autoCarry(dt, st.sameLoc);
          break;
        }
        case 'drop':
          this.hud.prompt = 'Setting it down.';
          if (this.pt >= 0.35) {
            this.putDown(); this.releaseJin();
            Ext.sound('pickup', { vol: 0.6 });
            this.end({ ok: true, item: this.item, delivered: true, loc: Ext.locId(), x: j ? Math.round(j.x) : null, time: round1(this.t) });
          }
          break;
      }
    }
    // Combat's carry state does the rest: carry speed (tune.carrySpeed), the carry pose, every combat verb
    // blocked with our reason shown when one is pressed. Without combat, restrict the verbs directly.
    pickUp() {
      if (this.carrying) return;
      Ext.sound('pickup', { vol: 0.6 });
      this.carrying = true;
      const reason = 'Hands full — set the ' + this.label + ' down first.';
      if (!Ext.carry(this.item, reason)) {
        this.restrictJin({ punch: false, jab: false, cross: false, hook: false, uppercut: false, dashStraight: false, counter: false,
          flurry: false, dash: false, backdash: false, airdash: false, slip: false, jump: false, reason });
      }
      this.undo(() => this.putDown());
    }
    putDown() {
      if (!this.carrying) return;
      this.carrying = false;
      Ext.carry(null);
    }
    autoCarry(dt, sameLoc) {
      const j = Ext.jin(); if (!j) return;
      const sp = walkPx() * dt;
      j.vx = 0;
      if (sameLoc) { j.x = approach(j.x, this.toX, sp); j.face = sgn(this.toX - j.x) || j.face; return; }
      const door = Ext.doorTo(this.toLoc);
      if (door && typeof door.x === 'number' && Math.abs(j.x - door.x) > 6) { j.x = approach(j.x, door.x, sp); j.face = sgn(door.x - j.x) || j.face; return; }
      this.goThere(door);
    }
    // Into the destination location (autoplay and forceFinish); once only.
    goThere(door) {
      if (this.entering || !this.toLoc) return;
      this.entering = true;
      door = door === undefined ? Ext.doorTo(this.toLoc) : door;
      const tx = this.toX !== null ? this.toX : door && typeof door.tx === 'number' ? door.tx : 40;
      if (!Ext.enter(this.toLoc, tx, { face: door && door.face, fade: false })) this.toLoc = null;
    }
    forceFinish(reason) {
      if (this.done) return this.result;
      if (this.toLoc && Ext.locId() !== this.toLoc) this.goThere();
      else if (this.toX !== null) { const j = Ext.jin(); if (j) { j.x = this.toX; j.vx = 0; } }
      const j = Ext.jin();
      return this.end({ ok: true, item: this.item, delivered: true, forced: reason || true, loc: Ext.locId(), x: j ? Math.round(j.x) : null, time: round1(this.t) });
    }
    marks() {
      const out = [];
      const here = Ext.locId();
      if (this.phase === 'fetch') out.push({ x: this.fromX, y: Ext.groundY(this.fromX), kind: 'target', label: 'Pick up' });
      if (this.phase === 'carry') {
        if (this.toLoc && here !== this.toLoc) {
          const d = Ext.doorTo(this.toLoc);
          if (d && typeof d.x === 'number') out.push({ x: d.x, y: Ext.groundY(d.x), kind: 'target', label: '→ ' + this.destLabel });
        } else if (this.toX !== null && (this.toLoc ? here === this.toLoc : here === this.locId)) {
          out.push({ x: this.toX, y: Ext.groundY(this.toX), kind: 'target', label: 'Set down' });
        }
      }
      return out;
    }
    draw(ctx, layer) { if (layer === 'back') for (const m of this.marks()) drawFloorMark(ctx, { x: m.x, y: m.y, kind: 'lit', k: 1 }); }
  }

  // Repair: a short sequence of steps. Each step is a key press, a counted series of presses, or a hold.
  // Letting go of a hold only drains it slowly. Jin stays at the work, facing it.
  const REPAIR_ACTIONS = new Set(['interact', 'left', 'right', 'up', 'down', 'punch', 'jump', 'dash', 'slip']);
  const REPAIR_OWNS = ['punch', 'dash', 'slip', 'flurry', 'jump', 'interact'];
  class Repair extends Activity {
    constructor(n, o, p) {
      super(n, o, p);
      this.steps = (Array.isArray(o.steps) ? o.steps : []).map((s) => (typeof s === 'string' ? { prompt: s } : s || {})).map((s) => ({
        prompt: s.prompt || s.text || 'Work it',
        action: REPAIR_ACTIONS.has(s.action) ? s.action : 'interact',
        hold: Math.max(0, +s.hold || 0),
        count: Math.max(1, s.count | 0 || 1),
        pose: s.pose || null,
      }));
      this.label = o.label || 'Repair';
      this.i = 0; this.prog = 0; this.count = 0; this.pause = 0;
      this.setOwns(this.steps[0]);
    }
    // Jin is held at the work (scripted, so combat ignores his keys); the presses are swallowed too so nothing
    // else in the world reacts to them. A punch step shows a jab at the stuck part instead of a real attack.
    setOwns() { this.owns = REPAIR_OWNS.slice(); }
    begin() {
      this.hud.title = this.opts.title || this.label;
      this.wantControl(true);
      if (!this.steps.length) { this.end({ ok: true, label: this.label, steps: 0, time: 0 }); return; }
      const j = Ext.jin();
      this.holdJin({ x: j ? j.x : 0, face: this.opts.face || (j ? j.face || 1 : 1), pose: this.poseFor(this.steps[0]) });
    }
    poseFor(s) { return s.pose || this.opts.pose || (s.action === 'punch' ? 'guard' : 'work'); }
    forceFinish(reason) {
      if (this.done) return this.result;
      return this.end({ ok: true, label: this.label, steps: this.steps.length, time: round1(this.t), forced: reason || true });
    }
    tick(dt) {
      if (this.finishing) { this.finishing -= dt; if (this.finishing <= 0) this.end({ ok: true, label: this.label, steps: this.steps.length, time: round1(this.t) }); return; }
      const s = this.steps[this.i];
      if (this.pause > 0) {
        this.pause -= dt;
        if (this.pause <= 0) {
          this.i++; this.prog = 0; this.count = 0;
          if (this.i >= this.steps.length) { this.finishing = 0.4; this.hud.prompt = 'Done.'; this.hud.bar = null; Ext.sound('pickup'); return; }
          if (pin && pin.owner === this) pin.pose = this.poseFor(this.steps[this.i]);
          this.setOwns(this.steps[this.i]);
        }
        return;
      }
      if (this.auto) {
        if (s.hold > 0) this.pad.hold(s.action, true);
        else if (!this.autoGap || (this.autoGap -= dt) <= 0) { this.pad.tap(s.action); this.autoGap = 0.18; }
      }
      const a = s.action, key = Ext.label(a);
      if (s.hold > 0) {
        if (this.pad.down(a)) this.prog = Math.min(1, this.prog + dt / s.hold);
        else this.prog = Math.max(0, this.prog - dt / (s.hold * 2.5));
        this.hud.prompt = 'Hold ' + key + ' — ' + s.prompt;
      } else {
        if (this.pad.pressed(a)) {
          this.count++; Ext.sound(a === 'punch' ? 'block' : 'ui', { vol: 0.5 });
          if (a === 'punch' && pin && pin.owner === this) pin.flash = { pose: 'jab', t: 0.2 };
        }
        this.prog = this.count / s.count;
        const left = s.count - this.count;   // 0 during the short "DONE" pause before the next step
        this.hud.prompt = (left <= 0 ? '' : s.count > 1 ? key + ' ×' + left + ' — ' : key + ' ') + s.prompt;
      }
      this.hud.bar = { value: this.prog, label: '' };
      this.hud.pips = { of: this.steps.length, list: this.steps.map((_, k) => (k < this.i ? 'ok' : k === this.i ? 'now' : 'todo')) };
      this.hud.sub = 'Step ' + (this.i + 1) + ' of ' + this.steps.length;
      if (this.prog >= 1) {
        this.pause = 0.3; this.pad.hold(a, false);
        Ext.sound('pickup', { vol: 0.5 });
        this.say('DONE', 'ok');
      }
    }
  }

  // Work shift: runs carry/repair (or any) tasks one after another, then pays. Pay is modest by design.
  function normSpec(spec) {
    if (!spec) return null;
    if (typeof spec === 'string') return { name: spec, opts: {} };
    if (Array.isArray(spec)) return { name: spec[0], opts: Object.assign({}, spec[1] || {}) };
    const name = spec.name || spec.type || spec.activity;
    if (!name) return null;
    const opts = spec.opts ? Object.assign({}, spec.opts) : Object.assign({}, spec);
    delete opts.name; delete opts.type; delete opts.activity;
    return { name, opts };
  }
  class WorkShift extends Activity {
    constructor(n, o, p) {
      super(n, o, p);
      this.tasks = (Array.isArray(o.tasks) ? o.tasks : []).map(normSpec).filter(Boolean);
      this.pay = Math.max(0, Math.round(o.pay !== undefined ? +o.pay || 0 : 20));
      this.label = o.label || 'Work shift';
      this.idx = 0; this.results = []; this.phase = 'work'; this.pt = 0;
    }
    begin() {
      this.hud.title = this.opts.title || this.label;
      this.nextTask();
    }
    nextTask() {
      while (this.idx < this.tasks.length) {
        const spec = this.tasks[this.idx++];
        const o = Object.assign({}, spec.opts);
        if (this.opts.auto !== undefined && o.auto === undefined) o.auto = this.opts.auto;
        const ch = makeActivity(spec.name, o, this);
        if (!ch) { this.results.push({ ok: false, name: spec.name, error: 'unknown activity' }); continue; }
        this.child = ch; ACT.current = ch;
        this.hud.sub = 'Task ' + this.idx + ' of ' + this.tasks.length;
        try { ch.pad.sync(); ch.begin(); } catch (e) { S.fail(e, { source: 'activity ' + spec.name }); ch.end({ ok: false, error: String((e && e.message) || e) }); }
        this.control = ch.control;
        if (!ch.done) return;
        this.results.push(ch.result); this.child = null; ACT.current = this;
      }
      this.payOut();
    }
    payOut() {
      this.phase = 'paid'; this.pt = 0;
      const G = S.G;
      if (G) {
        G.money = (+G.money || 0) + this.pay;
        if (this.pay) S.events.emit('money', { delta: this.pay, total: G.money, source: 'work_shift' });
        G.flags = G.flags || {};
        const key = 'shift.' + (this.opts.id || String(this.label).toLowerCase().replace(/[^a-z0-9]+/g, '_'));
        G.flags[key] = (G.flags[key] | 0) + 1;
        this.count = G.flags[key];
        S.events.emit('flag', { name: key, value: G.flags[key] });
      }
      if (this.pay > 0) {
        if (!this.opts.quiet) Ext.toast('Paid ' + U.fmtMoney(this.pay) + (this.opts.employer ? ' — ' + this.opts.employer : ''), 'money');
        Ext.sound('pickup');
      }
      this.hud.prompt = this.pay > 0 ? 'Shift done. Paid ' + U.fmtMoney(this.pay) + '.' : 'Shift done.';
      this.hud.sub = ''; this.hud.bar = null; this.hud.pips = null; this.hud.chips = null;
    }
    tick(dt) {
      if (this.phase === 'work') {
        const ch = this.child;
        if (ch && !ch.done) ch.step(dt);
        if (ch && ch.done) { this.results.push(ch.result); this.child = null; ACT.current = this; this.nextTask(); }
        return;
      }
      this.pt += dt;
      if (this.pt >= (this.auto ? 0.2 : 1.4)) {
        this.end({ ok: true, pay: this.pay, money: S.G ? S.G.money : null, tasks: this.results, shifts: this.count || 1,
          completed: this.results.filter((r) => r && r.ok).length });
      }
    }
    marks() { return this.child && !this.child.done ? this.child.marks() : null; }
    draw(ctx, layer) { if (this.child && !this.child.done) this.child.draw(ctx, layer); }
    // Finish the current task and every remaining one as passes (a carry still arrives where it was going),
    // then pay as usual.
    forceFinish(reason) {
      if (this.done) return this.result;
      const why = reason || true;
      if (this.child && !this.child.done) { try { this.child.forceFinish(why); } catch (e) { S.fail(e, { source: 'shift task force' }); this.child.cancel('error'); } }
      if (this.child) { this.results.push(this.child.result); this.child = null; ACT.current = this; }
      while (this.phase === 'work' && this.idx < this.tasks.length) {
        const spec = this.tasks[this.idx++];
        const ch = makeActivity(spec.name, Object.assign({}, spec.opts, { auto: true }), this);
        if (!ch) { this.results.push({ ok: false, name: spec.name, error: 'unknown activity' }); continue; }
        try { ch.begin(); if (!ch.done) ch.forceFinish(why); }
        catch (e) { S.fail(e, { source: 'shift task ' + spec.name }); if (!ch.done) ch.cancel('error'); }
        this.results.push(ch.result);
        ACT.current = this;
      }
      if (this.phase === 'work') this.payOut();
      return this.end({ ok: true, pay: this.pay, money: S.G ? S.G.money : null, tasks: this.results, shifts: this.count || 1,
        completed: this.results.filter((r) => r && r.ok).length, forced: why });
    }
  }

  /* ── 9. Timeline board and evidence presentation ──────────────────── */
  function resolveCard(c) {
    if (!c) return null;
    if (typeof c === 'string') {
      const d = Ext.evidence(c) || {};
      return { id: c, title: d.title || c, date: d.date || '', kind: d.kind || 'document', text: d.text || '' };
    }
    if (typeof c === 'object' && c.id) {
      const d = Ext.evidence(c.id) || {};
      return { id: c.id, title: c.title || d.title || c.id, date: c.date || d.date || '', kind: c.kind || d.kind || 'document', text: c.text || d.text || '' };
    }
    return null;
  }

  // Shared by the two board windows: open the UI window, handle closing early, end once complete.
  class BoardActivity extends Activity {
    constructor(n, o, p) {
      super(n, o, p);
      this.away = false; this.opened = false; this.line = null; this.solvedAt = 0; this.openedAt = 0;
      this.owns = ['interact'];   // interact reopens the board; keep it from the world meanwhile
    }
    open() {
      this.opened = Ext.uiOpen(this.kind, this);
      // No window to show: in the browser that is a missing ui.js (solve it rather than lock the scene);
      // headless, tests drive place()/pick() themselves unless the director runs screens by itself.
      if (!this.opened && !this.auto && (!S.headless || (S.director && S.director.autoHeadless))) {
        if (!S.headless) warnOnce('noui ' + this.kind, 'S.ui.openWindow is missing; solving the ' + this.kind + ' automatically');
        this.setAuto();
      }
      if (this.opened) {
        this.away = false; this.openedAt = clock;
        // Ending for any other reason (autoplay, stop, a chapter reset) closes our window if it is still up.
        if (!this._closeUndo) {
          this._closeUndo = true;
          this.undo(() => { if (Ext.uiIsOpen(this.kind) || (!Ext.uiCanTellOpen() && this.auto && !this.away)) Ext.uiClose(); });
        }
      }
    }
    begin() { this.wantControl(true); this.open(); }
    finish() {
      if (this.done) return this.result;
      if (!this.complete) { this.close(); return null; }
      if (Ext.uiIsOpen(this.kind)) Ext.uiClose();
      return this.end(this.outcome);
    }
    close() {
      if (this.done) return;
      if (this.complete) { this.finish(); return; }
      this.away = true;
    }
    tick(dt) {
      if (this.auto) { this.autoTick(dt); if (this.complete && this.t > this.solvedAt + 0.2) this.end(this.outcome); return; }
      if (this.complete) {
        // Completed: end once the window is gone (closed by the player, or never opened). A UI that cannot say
        // whether it is open gets a moment of unpaused time to show the closing line, then the scene moves on.
        if (!this.opened || (Ext.uiCanTellOpen() ? !Ext.uiIsOpen(this.kind) : this.t - this.solvedAt > 1.2)) this.end(this.outcome);
        return;
      }
      if (this.opened && !this.away && Ext.uiCanTellOpen() && clock - this.openedAt > 0.2 && !Ext.uiIsOpen(this.kind)) this.away = true;
      if (this.away) {
        this.hud.prompt = Ext.label('interact') + ' Back to the ' + (this.kind === 'timeline' ? 'board' : 'evidence');
        if (this.pad.pressed('interact')) this.open();
      } else this.hud.prompt = '';
    }
    marks() { return null; }
  }

  class Timeline extends BoardActivity {
    constructor(n, o, p) {
      super(n, o, p);
      this.kind = 'timeline';
      this.title = o.title || 'Put it in order';
      this.prompt = o.prompt || 'Place each card where it belongs on the line, earliest first.';
      const cards = (Array.isArray(o.cards) ? o.cards : []).map(resolveCard).filter(Boolean);
      const ids = new Set(cards.map((c) => c.id));
      let answer = (Array.isArray(o.answer) && o.answer.length ? o.answer : cards.map((c) => c.id)).filter((id) => ids.has(id));
      if (!answer.length) answer = cards.map((c) => c.id);
      this.answer = answer.slice();
      // Tray order: shuffled, and never left in the answer order.
      const tray = cards.map((c) => ({ c, r: S.rand() })).sort((a, b) => a.r - b.r).map((o2) => o2.c);
      if (tray.length > 1 && tray.every((c, i) => c.id === this.answer[i])) tray.push(tray.shift());
      this.cards = tray;
      this.slots = new Array(this.answer.length).fill(null);
      this.lines = o.lines || {}; this.hints = o.hints || {};
      this.speaker = o.speaker || 'jin'; this.speakerName = Ext.personName(this.speaker);
      this.mistakes = 0; this.hint = null; this.complete = false;
      this.hud.title = this.title;
      if (!this.answer.length) { this.complete = true; this.outcome = { ok: true, mistakes: 0, order: [] }; }
    }
    card(id) { return this.cards.find((c) => c.id === id) || null; }
    tray() { return this.cards.filter((c) => !this.slots.includes(c.id)); }
    place(cardId, slot) {
      if (this.done || this.complete) return { ok: false, complete: this.complete };
      slot = slot | 0;
      const card = this.card(cardId);
      if (!card || slot < 0 || slot >= this.slots.length) return { ok: false, error: 'no such card or slot' };
      if (this.slots[slot] === cardId) return { ok: true, correct: true, line: null, complete: this.complete };
      if (this.slots[slot] !== null) { this.hint = 'That spot is settled.'; return { ok: true, correct: false, hint: this.hint, complete: false }; }
      if (this.answer[slot] === cardId) {
        this.slots[slot] = cardId;
        const text = this.lines[cardId];
        this.line = text ? { speaker: this.speaker, name: this.speakerName, text } : null;
        this.hint = null;
        Ext.sound('paper');
        if (this.slots.every((v, i) => v === this.answer[i])) {
          this.complete = true; this.solvedAt = this.t;
          this.outcome = { ok: true, mistakes: this.mistakes, order: this.answer.slice() };
          this.prompt = this.opts.donePrompt || 'That is how it happened.';
          Ext.sound('evidence');
        }
        return { ok: true, correct: true, line: this.line, complete: this.complete };
      }
      this.mistakes++;
      this.hint = this.hintFor(cardId, slot);
      this.line = null;
      Ext.sound('uiBack');
      return { ok: true, correct: false, hint: this.hint, complete: false };
    }
    hintFor(cardId, slot) {
      const h = this.hints[cardId];
      if (typeof h === 'string') return h;
      if (typeof h === 'function') { try { const v = h(slot); if (v) return String(v); } catch (_) { /* fall back */ } }
      const want = this.answer.indexOf(cardId), card = this.card(cardId);
      if (want < 0) return 'That one does not belong on this line.';
      const date = card && card.date ? ' Check the date: ' + card.date + '.' : '';
      return (want > slot ? 'That came later.' : 'That came earlier.') + date;
    }
    autoTick() {
      if (this.complete) return;
      this.autoAt = (this.autoAt || 0) + 1;
      if (this.autoAt % 18 !== 0) return;   // one card every 18 steps
      const i = this.slots.findIndex((v) => v === null);
      if (i >= 0) this.place(this.answer[i], i);
    }
    forceFinish(reason) {
      if (this.done) return this.result;
      for (let i = 0; i < this.slots.length && !this.complete; i++) if (this.slots[i] === null) this.place(this.answer[i], i);
      return this.end(Object.assign({}, this.outcome || { ok: true, mistakes: this.mistakes, order: this.answer.slice() }, { forced: reason || true }));
    }
  }

  class Present extends BoardActivity {
    constructor(n, o, p) {
      super(n, o, p);
      this.kind = 'present';
      this.title = o.title || 'Show it';
      this.claim = o.claim || '';
      this.accept = (Array.isArray(o.accept) ? o.accept : o.accept ? [o.accept] : []).slice();
      this.speaker = o.speaker || null;
      this.speakerName = Ext.personName(this.speaker) || '';
      this.rebuttal = o.rebuttal || 'That does not prove anything.';
      const owned = S.G && S.G.evidence ? Object.keys(S.G.evidence) : [];
      const opt = (id, has) => { const c = resolveCard(id); return c ? Object.assign(c, { owned: has }) : null; };
      this.options = owned.map((id) => opt(id, true)).filter(Boolean);
      this.missing = this.accept.filter((id) => !owned.includes(id));
      if (this.missing.length && this.missing.length === this.accept.length) {
        // Jin should have one of these; never let the confrontation lock up.
        warnOnce('present missing ' + this.missing.join(','), 'present: none of ' + this.missing.join(', ') + ' is in the archive; offering them anyway');
        for (const id of this.missing) { const c = opt(id, false); if (c) this.options.push(c); }
      }
      this.picks = []; this.wrong = 0; this.complete = false;
      this.hud.title = this.title;
      if (!this.accept.length) { this.complete = true; this.outcome = { ok: true, evidence: null, tries: 0, wrong: 0 }; }
    }
    pick(id) {
      if (this.done || this.complete) return { ok: false, complete: this.complete };
      if (!this.options.some((o) => o.id === id)) return { ok: false, error: 'not in the archive' };
      this.picks.push(id);
      if (this.accept.includes(id)) {
        this.complete = true; this.solvedAt = this.t;
        const t = (this.opts.lines && this.opts.lines[id]) || this.opts.success || null;
        this.line = t ? { speaker: this.opts.successSpeaker || this.speaker, name: Ext.personName(this.opts.successSpeaker || this.speaker), text: t } : null;
        this.outcome = { ok: true, evidence: id, tries: this.picks.length, wrong: this.wrong };
        Ext.sound('evidence');
        return { ok: true, correct: true, line: this.line, complete: true };
      }
      this.wrong++;
      const rb = (this.opts.rebuttals && this.opts.rebuttals[id]) || this.rebuttal;
      this.line = { speaker: this.speaker, name: this.speakerName, text: rb };
      Ext.sound('uiBack');
      return { ok: true, correct: false, line: this.line, complete: false };
    }
    autoTick() {
      if (this.complete) return;
      this.autoAt = (this.autoAt || 0) + 1;
      if (this.autoAt === 18) { const id = this.accept.find((a) => this.options.some((o) => o.id === a)); if (id) this.pick(id); }
    }
    forceFinish(reason) {
      if (this.done) return this.result;
      if (!this.complete) { const id = this.accept.find((a) => this.options.some((o) => o.id === a)); if (id) this.pick(id); }
      return this.end(Object.assign({}, this.outcome || { ok: true, evidence: this.accept[0] || null, tries: this.picks.length, wrong: this.wrong }, { forced: reason || true }));
    }
  }

  /* ── 10. Registry and public API ──────────────────────────────────── */
  const FACTORY = {
    train_balance: (o, p) => new BalanceDrill('train_balance', o, p),
    train_footwork: (o, p) => new FootworkDrill('train_footwork', o, p),
    train_reaction: (o, p) => new ReactionDrill('train_reaction', o, p),
    train_conditioning: (o, p) => new ConditioningDrill('train_conditioning', o, p),
    train_bag: (o, p) => new BagDrill('train_bag', o, p),
    train_mitts: (o, p) => new MittsDrill('train_mitts', o, p),
    carry: (o, p) => new Carry('carry', o, p),
    repair: (o, p) => new Repair('repair', o, p),
    work_shift: (o, p) => new WorkShift('work_shift', o, p),
    timeline: (o, p) => new Timeline('timeline', o, p),
    present: (o, p) => new Present('present', o, p),
  };
  const ALIASES = { balance: 'train_balance', footwork: 'train_footwork', reaction: 'train_reaction', conditioning: 'train_conditioning',
    bag: 'train_bag', mitts: 'train_mitts', shift: 'work_shift', work: 'work_shift', board: 'timeline' };
  const canonical = (name) => ALIASES[name] || name;

  function makeActivity(name, opts, parent) {
    const id = canonical(name);
    if (!FACTORY[id]) { warnOnce('unknown ' + id, 'unknown activity "' + name + '"'); return null; }
    return FACTORY[id](opts || {}, parent || null);
  }

  // Bookkeeping when an activity ends: the parent shift becomes current again, or the module goes idle.
  function settle(st) {
    if (st.parent) { if (ACT.current === st) ACT.current = st.parent; return; }
    if (ACT.root === st) { ACT.root = null; ACT.current = null; }
    ACT.last = st;
    ACT.log.push(st.result); if (ACT.log.length > 40) ACT.log.shift();
    S.events.emit('activity', { name: st.name, phase: 'end', result: st.result });
  }

  function rootOf(st) { while (st && st.parent) st = st.parent; return st; }

  let stepStamp = null, stampBy = null;
  const ACT = S.activities = {
    current: null,   // innermost running ActivityState (the UI reads this)
    root: null,      // the activity the director is waiting on
    last: null,      // the last finished root activity
    log: [],         // recent results (tests)
    overlay: true,   // draw the drill overlay (set false if ui.js renders state.hud itself)
    autoRate: 8,     // activity steps per sim step while autoplaying
    names: Object.keys(FACTORY),
    DRILLS,

    start(name, opts) {
      opts = opts || {};
      const id = canonical(name);
      if (!FACTORY[id]) {
        warnOnce('unknown ' + id, 'unknown activity "' + name + '"');
        return { name: id, done: true, result: { ok: false, name: id, error: 'unknown activity "' + name + '"' }, wait: () => true };
      }
      if (ACT.root && !ACT.root.done) ACT.root.cancel('replaced by ' + id);
      installHooks();
      checkTraining();
      let st;
      try { st = makeActivity(id, opts, null); }
      catch (e) { S.fail(e, { source: 'activity ' + id }); return { name: id, done: true, result: { ok: false, name: id, error: String((e && e.message) || e) }, wait: () => true }; }
      ACT.root = st; ACT.current = st;
      try { st.pad.sync(); st.begin(); }
      catch (e) { S.fail(e, { source: 'activity ' + id }); st.end({ ok: false, error: String((e && e.message) || e) }); }
      if (!st.done) {
        S.events.emit('activity', { name: id, phase: 'start' });
        overlayStart();
      }
      return st;
    },

    // Once per sim step. Safe to call more than once per step: every world.update (fromHook) ticks unless an
    // outside call (the main loop) already ticked at this same sim time; outside calls tick only when the sim
    // time moved on.
    update(dt, fromHook) {
      if (S.paused) return;
      const now = typeof S.time === 'number' ? S.time : NaN;
      if (now === stepStamp && !(fromHook && stampBy === 'hook')) return;
      stepStamp = now; stampBy = fromHook ? 'hook' : 'ext';
      checkTraining();
      const r = ACT.root;
      if (!r || r.done) return;
      dt = dt > 0 && dt < 1 ? dt : S.DT;
      clock += dt;
      // Autoplay runs several activity steps per sim step (same rules, compressed time).
      const c = ACT.current, n = r.auto || (c && c.auto) ? Math.max(1, ACT.autoRate | 0) : 1;
      try { for (let i = 0; i < n && !r.done; i++) { if (i) clock += dt; r.step(dt); } }
      catch (e) {
        S.fail(e, { source: 'activity ' + r.name });
        try { r.end({ ok: false, error: String((e && e.message) || e) }); } catch (_) { /* already reported */ }
      }
    },
    // After world.update: hold a pinned Jin where the activity wants him.
    post(dt) {
      const r = ACT.root;
      if (r && !r.done) { try { r.post(); } catch (e) { S.fail(e, { source: 'activity post' }); } }
      applyPin(dt > 0 && dt < 1 ? dt : S.DT);
    },
    // Before world.update: actions the current activity owns are consumed so Jin and the world ignore them.
    pre() {
      const c = ACT.current;
      if (!c || c.done || !c.owns || !S.input || typeof S.input.consume !== 'function') return;
      for (const a of c.owns) S.input.consume(a);
    },
    cancel(reason) { const r = ACT.root; if (r && !r.done) return r.cancel(reason || 'cancelled'); return null; },
    // Director hook (A.activity under a policy, after 0.2 s): play the rest automatically. Returns true if it will.
    autoComplete(st) {
      st = st || ACT.root;
      if (!st || st.done || typeof st.setAuto !== 'function') return false;
      const p = S.director && S.director.policy;
      if (p && p.activities === 'real' && st.opts.auto === undefined) return false;
      st.setAuto();
      return true;
    },
    // Director hook (A.activity timeout) and general "end it now". Under a policy the activity ends as a pass
    // (forceFinish: drills award their level, boards fill in, carries arrive); otherwise it is cancelled.
    // Either way everything it changed is put back.
    stop(st, reason) {
      st = st || ACT.root;
      if (!st || st.done || typeof st.end !== 'function') return st ? st.result : null;
      const target = st.parent ? rootOf(st) : st;
      try {
        if (S.director && S.director.policy) target.forceFinish(reason || 'stopped');
        else target.cancel(reason || 'stopped');
      } catch (e) {
        S.fail(e, { source: 'activities.stop ' + target.name });
        try { target.end({ ok: false, error: String((e && e.message) || e) }); } catch (_) { /* reported */ }
      }
      return target.result;
    },
    get running() { return !!(ACT.root && !ACT.root.done); },

    applyTraining,
    trainLevel,
    trainingReport,
    drillInfo(key) {
      key = String(key || '').replace(/^train_/, '');
      const d = DRILLS[key]; if (!d) return null;
      const L = trainLevel(key), here = ACT.canTrain(key);
      return { key, id: d.id, name: d.name, what: d.what, level: L, max: 3, effect: d.effect(L), next: L < 3 ? d.effect(L + 1) : null,
        available: here === true, why: here === true ? null : here };
    },
    drillList() { return DRILL_KEYS.map((k) => ACT.drillInfo(k)); },
    trainingSpot,
    // true, or the reason a drill cannot be started from the journal here and now.
    canTrain(key) {
      key = String(key || '').replace(/^train_/, '');
      if (!DRILLS[key]) return 'There is no drill by that name.';
      if (ACT.root && !ACT.root.done) return 'Finish what you are doing first.';
      const cs = S.combat && S.combat.state;
      if (cs && (cs.fight || cs.bout)) return 'Not in the middle of a fight.';
      if (S.director && S.director.busy) return 'Not while something is happening.';
      if (!S.world || !S.world.loc) return 'Nowhere to train right now.';
      if (!trainingSpot(key)) return 'There is no place for ' + DRILLS[key].name.toLowerCase() + ' here.';
      return true;
    },
    // Start a drill from the journal's Training tab (runs as a scene so the director waits on it).
    train(key, opts) {
      key = String(key || '').replace(/^train_/, '');
      const why = ACT.canTrain(key);
      if (why !== true) { Ext.toast(why, 'info'); return null; }
      const name = 'train_' + key, o = Object.assign({}, (trainingSpot(key) || {}).opts || {}, opts || {});
      delete o.when;
      if (S.director && typeof S.director.run === 'function') {
        return S.director.run(function* (A) {
          if (A && typeof A.activity === 'function') { yield A.activity(name, o); return; }
          yield ACT.start(name, o);
        }, { label: 'training ' + key });
      }
      return ACT.start(name, o);
    },

    // World-space drawing of marks, cones, the beam (layer 'back', under actors) and a fallback bag ('front').
    // world.render may call it with the camera transform applied; otherwise a render wrapper does it after the frame.
    draw(ctx, layer) {
      drawCalled = true;
      const c = ACT.current;
      if (!c || c.done || !ctx) return;
      try { c.draw(ctx, layer || 'back'); } catch (e) { warnOnce('draw ' + c.name, 'draw failed: ' + (e && e.message)); }
    },
    register(name, factory) { if (typeof factory === 'function') { FACTORY[name] = factory; ACT.names = Object.keys(FACTORY); } },
    // Exposed for tests.
    _ext: Ext,
    _clock: () => clock,
  };

  /* ── 11. Pins, hooks, events ──────────────────────────────────────── */
  function applyPin(dt) {
    if (!pin) return;
    if (!pin.owner || pin.owner.done) { releasePin(); return; }
    const j = Ext.jin(); if (!j) return;
    j.scripted = true;                       // re-assert: a director reset may have cleared it
    if (typeof pin.x === 'number') j.x = pin.x;
    j.vx = 0;
    if (pin.face) j.face = pin.face;
    j._ladderCd = Math.max(+j._ladderCd || 0, 0.2);   // no grabbing a ladder while held at the work
    let pose = pin.pose || 'idle';
    if (pin.flash) { pin.flash.t -= dt; if (pin.flash.t > 0) pose = pin.flash.pose; else pin.flash = null; }
    if (j.pose !== pose) { j.pose = pose; j.poseT = 0; } else j.poseT = (+j.poseT || 0) + dt;
    j.lean = pin.lean || 0;
    j.tint = null;
  }
  function releasePin() {
    const p = pin; pin = null;
    if (!p) return;
    const j = Ext.jin();
    if (j) { j.scripted = !!p.prevScripted; j.lean = 0; j.vx = 0; }
  }

  // The module ticks itself from S.world.update and draws itself after S.world.render, so nothing else has to
  // remember to call it. Re-installed if world.js ever replaces those functions.
  let drawCalled = false;
  function installHooks() {
    const W = S.world;
    if (!W) return;
    if (typeof W.update === 'function' && !W.update.__activities) {
      const orig = W.update;
      const hooked = function (dt) {
        try { ACT.pre(); } catch (e) { S.fail(e, { source: 'activities pre' }); }
        const r = orig.apply(this, arguments);
        try { ACT.update(dt, true); ACT.post(dt); } catch (e) { S.fail(e, { source: 'activities update' }); }
        return r;
      };
      hooked.__activities = true; hooked.__orig = orig;
      W.update = hooked;
    }
    // Drawing: world.js draw hooks (world transform) when it has them; otherwise wrap render and draw after it.
    if (!S.headless && typeof W.addDraw === 'function') {
      if (!W.__activitiesDraw) {
        W.__activitiesDraw = true;
        try { W.addDraw('back', (ctx) => ACT.draw(ctx, 'back')); W.addDraw('front', (ctx) => ACT.draw(ctx, 'front')); }
        catch (e) { W.__activitiesDraw = false; warnOnce('addDraw', 'world.addDraw failed: ' + (e && e.message)); }
      }
    } else if (!S.headless && typeof W.render === 'function' && !W.render.__activities) {
      const origR = W.render;
      const hookedR = function (ctx) {
        drawCalled = false;
        const r = origR.apply(this, arguments);
        if (!drawCalled && ctx && ACT.current && !ACT.current.done) drawFallback(ctx);
        return r;
      };
      hookedR.__activities = true; hookedR.__orig = origR;
      W.render = hookedR;
    }
  }
  // world.render did not draw our layers: draw them on top of the finished frame with S.cam
  // (cam.x/y = top-left of the view at zoom 1; zoom scales about the view centre).
  function drawFallback(ctx) {
    const cam = S.cam; if (!cam) return;
    const z = cam.zoom || 1, hw = S.W / 2, hh = S.H / 2;
    ctx.save();
    try {
      ctx.translate(hw, hh); ctx.scale(z, z); ctx.translate(-(cam.x + hw), -(cam.y + hh));
      ACT.draw(ctx, 'back'); ACT.draw(ctx, 'front');
    } finally { ctx.restore(); }
    drawCalled = false;
  }

  S.events.on('loaded', () => { ACT.cancel('save loaded'); releasePin(); applyTraining(); });
  S.events.on('chapterStart', () => { ACT.cancel('chapter start'); releasePin(); applyTraining(); });
  installHooks();
  applyTraining();

  /* ── 12. Pixel drawing helpers (world space) ──────────────────────── */
  function drawFloorMark(ctx, m) {
    const x = Math.round(m.x), y = Math.round(m.y);
    const lit = m.kind === 'lit';
    const pulse = lit ? 0.75 + 0.25 * Math.sin((S.realTime || 0) * 10) : 0.45;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = lit ? '#e8c272' : '#8796a6';
    ctx.fillRect(x - 6, y - 1, 13, 1);
    ctx.fillRect(x - 4, y - 2, 9, 1);
    ctx.fillRect(x - 4, y, 9, 1);
    if (lit && typeof m.k === 'number') {
      ctx.fillStyle = '#fff1c9';
      const w = Math.max(1, Math.round(11 * m.k));
      ctx.fillRect(x - 5, y - 1, w, 1);
    }
    if (m.back) {
      // a chevron pointing the way Jin must keep facing
      const f = m.face || 1;
      ctx.fillStyle = lit ? '#e8c272' : '#8796a6';
      ctx.fillRect(x + f * 2, y - 8, 1, 1); ctx.fillRect(x + f * 3, y - 7, 1, 1); ctx.fillRect(x + f * 2, y - 6, 1, 1);
      ctx.fillRect(x - f * 1, y - 8, 1, 1); ctx.fillRect(x, y - 7, 1, 1); ctx.fillRect(x - f * 1, y - 6, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
  function drawCone(ctx, x, y, hot) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#2b2730'; ctx.fillRect(x - 4, y - 1, 9, 1);
    ctx.fillStyle = hot ? '#e0894a' : '#b5653a';
    ctx.fillRect(x, y - 8, 1, 1); ctx.fillRect(x - 1, y - 7, 3, 2); ctx.fillRect(x - 2, y - 5, 5, 2); ctx.fillRect(x - 3, y - 3, 7, 2);
    ctx.fillStyle = '#e6dcc6'; ctx.fillRect(x - 2, y - 5, 5, 1);
    ctx.fillStyle = '#7a3f26'; ctx.fillRect(x + 2, y - 3, 1, 2);
  }
  function drawBag(ctx, x, y) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#4a4f57'; ctx.fillRect(x, y - 74, 1, 18);
    ctx.fillStyle = '#5a2e2a'; ctx.fillRect(x - 5, y - 56, 11, 26);
    ctx.fillStyle = '#74403a'; ctx.fillRect(x - 5, y - 56, 2, 26);
    ctx.fillStyle = '#3b1f1d'; ctx.fillRect(x + 4, y - 56, 2, 26); ctx.fillRect(x - 5, y - 46, 11, 1);
  }

  /* ── 13. Overlay (DOM; not used when headless) ────────────────────── */
  const OV = { root: null, raf: 0, cache: {}, markEls: [], floatEls: new Map(), css: false };
  const OV_CSS = [
    '.sa-root{position:absolute;inset:0;pointer-events:none;z-index:14;font-family:"Courier New",Courier,monospace;color:#efe6d2}',
    '.sa-panel{position:absolute;left:50%;top:12px;transform:translateX(-50%);min-width:260px;max-width:min(600px,82%);padding:7px 14px 9px;',
    'background:rgba(10,9,14,.74);border:1px solid rgba(232,194,114,.32);border-radius:3px;text-align:center;box-shadow:0 2px 14px rgba(0,0,0,.45)}',
    '.sa-title{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;color:#e8c272;font-size:15px;letter-spacing:.03em}',
    '.sa-sub{font-size:11px;font-variant:small-caps;letter-spacing:.14em;color:#a99f8c;min-height:0}',
    '.sa-prompt{font-size:13px;margin-top:4px;line-height:1.4}',
    '.sa-key{display:inline-block;min-width:1.3em;padding:0 .3em;margin:0 .05em;border:1px solid rgba(232,194,114,.55);border-radius:2px;color:#e8c272;font-weight:bold;line-height:1.25}',
    '.sa-chips{margin-top:6px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap}',
    '.sa-chip{font-size:11px;font-variant:small-caps;letter-spacing:.1em;padding:1px 7px;border:1px solid rgba(255,255,255,.18);color:#8f8778}',
    '.sa-chip.now{border-color:#e8c272;color:#e8c272}.sa-chip.ok{border-color:rgba(232,194,114,.35);color:#efe6d2;background:rgba(232,194,114,.14)}',
    '.sa-meter{position:relative;height:9px;width:220px;margin:7px auto 1px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2)}',
    '.sa-zone{position:absolute;top:0;bottom:0;background:rgba(232,194,114,.28)}',
    '.sa-needle{position:absolute;top:-3px;bottom:-3px;width:3px;margin-left:-1px;background:#efe6d2}',
    '.sa-bar{position:relative;height:5px;width:220px;margin:6px auto 0;background:rgba(255,255,255,.08)}',
    '.sa-fill{position:absolute;left:0;top:0;bottom:0;background:#e8c272}.sa-bar.warn .sa-fill{background:#d8402f}',
    '.sa-barlabel{font-size:10px;letter-spacing:.12em;color:#a99f8c;margin-top:2px;font-variant:small-caps}',
    '.sa-pips{margin-top:6px;display:flex;gap:3px;justify-content:center}',
    '.sa-pip{width:7px;height:7px;border:1px solid rgba(255,255,255,.25)}.sa-pip.ok{background:#e8c272;border-color:#e8c272}',
    '.sa-pip.bad{background:#d8402f;border-color:#d8402f}.sa-pip.now{border-color:#e8c272}',
    '.sa-mark{position:absolute;transform:translate(-50%,-100%);font-size:11px;font-variant:small-caps;letter-spacing:.1em;color:#e8c272;',
    'text-shadow:0 1px 0 #000,0 0 3px #000;white-space:nowrap;text-align:center}',
    '.sa-dot{width:12px;height:3px;margin:3px auto 0;background:#e8c272;box-shadow:0 0 6px rgba(232,194,114,.8)}.sa-dot.next{background:#8796a6;box-shadow:none}',
    '.sa-float{position:absolute;transform:translate(-50%,-100%);font-weight:bold;font-size:12px;letter-spacing:.1em;white-space:nowrap;',
    'text-shadow:0 1px 0 #000,0 0 4px #000;color:#efe6d2}.sa-float.ok{color:#e8c272}.sa-float.bad{color:#e0604f}.sa-float.call{color:#fff3cf;font-size:13px}',
  ].join('\n');

  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  const keyHtml = (s) => esc(s).replace(/\[([^\]]{1,14})\]/g, '<span class="sa-key">$1</span>');

  function overlayStart() {
    if (S.headless || !ACT.overlay || typeof document === 'undefined' || typeof requestAnimationFrame !== 'function') return;
    if (OV.raf) return;
    const loop = () => {
      OV.raf = 0;
      let keep = false;
      try { keep = renderOverlay(); } catch (e) { warnOnce('overlay', 'overlay failed: ' + (e && e.message)); keep = false; }
      if (!keep) { overlayStop(); return; }
      OV.raf = requestAnimationFrame(loop);
    };
    OV.raf = requestAnimationFrame(loop);
  }
  function overlayStop() {
    if (OV.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(OV.raf);
    OV.raf = 0;
    if (OV.root && OV.root.parentNode) OV.root.parentNode.removeChild(OV.root);
    OV.root = null; OV.cache = {}; OV.markEls = []; OV.floatEls = new Map();
  }
  function el(tag, cls, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function buildOverlay(host) {
    if (!OV.css && !document.getElementById('sa-style')) {
      const st = document.createElement('style'); st.id = 'sa-style'; st.textContent = OV_CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    OV.css = true;
    const root = el('div', 'sa-root');
    root.setAttribute('aria-live', 'polite');
    const panel = el('div', 'sa-panel', root);
    OV.title = el('div', 'sa-title', panel);
    OV.sub = el('div', 'sa-sub', panel);
    OV.prompt = el('div', 'sa-prompt', panel);
    OV.chips = el('div', 'sa-chips', panel);
    OV.meter = el('div', 'sa-meter', panel);
    OV.zone = el('div', 'sa-zone', OV.meter);
    OV.needle = el('div', 'sa-needle', OV.meter);
    OV.bar = el('div', 'sa-bar', panel);
    OV.fill = el('div', 'sa-fill', OV.bar);
    OV.barLabel = el('div', 'sa-barlabel', panel);
    OV.pips = el('div', 'sa-pips', panel);
    OV.panel = panel;
    OV.layer = el('div', '', root);
    host.appendChild(root);
    OV.root = root; OV.cache = {};
  }
  function setText(node, key, text, html) {
    if (OV.cache[key] === text) return;
    OV.cache[key] = text;
    if (html) node.innerHTML = keyHtml(text); else node.textContent = text;
    node.style.display = text ? '' : 'none';
  }
  function renderOverlay() {
    const st = ACT.current, root = ACT.root;
    if (!st || st.done || !root || root.done) return false;
    const host = document.getElementById('story-root');
    if (!host) return false;
    if (!OV.root || OV.root.parentNode !== host) { if (OV.root && OV.root.parentNode) OV.root.parentNode.removeChild(OV.root); buildOverlay(host); }
    const isBoard = st instanceof BoardActivity;
    const hidePanel = S.paused || (isBoard && !st.away);
    OV.panel.style.display = hidePanel ? 'none' : '';
    const hud = st.hud;
    if (!hidePanel) {
      const parentTitle = st.parent && st.parent.hud ? st.parent.hud.title : '';
      setText(OV.title, 'title', hud.title || '', false);
      const sub = [parentTitle && parentTitle !== hud.title ? parentTitle + (st.parent.hud.sub ? ' · ' + st.parent.hud.sub : '') : '', hud.sub || ''].filter(Boolean).join(' — ');
      setText(OV.sub, 'sub', sub, false);
      setText(OV.prompt, 'prompt', hud.prompt || '', true);
      const chips = hud.chips ? hud.chips.map((c) => c.state + ':' + c.text).join('|') : '';
      if (OV.cache.chips !== chips) {
        OV.cache.chips = chips;
        OV.chips.innerHTML = hud.chips ? hud.chips.map((c) => '<span class="sa-chip ' + esc(c.state) + '">' + esc(c.text) + '</span>').join('') : '';
        OV.chips.style.display = chips ? '' : 'none';
      }
      if (hud.meter) {
        OV.meter.style.display = '';
        const z = clamp(hud.meter.zone, 0, 1);
        OV.zone.style.left = (50 - z * 50) + '%'; OV.zone.style.width = (z * 100) + '%';
        OV.needle.style.left = (50 + clamp(hud.meter.value, -1, 1) * 50) + '%';
      } else OV.meter.style.display = 'none';
      if (hud.bar) {
        OV.bar.style.display = '';
        OV.fill.style.width = (clamp(hud.bar.value, 0, 1) * 100).toFixed(1) + '%';
        OV.bar.classList.toggle('warn', !!hud.bar.warn);
        setText(OV.barLabel, 'barLabel', hud.bar.label || '', false);
      } else { OV.bar.style.display = 'none'; setText(OV.barLabel, 'barLabel', '', false); }
      const pips = hud.pips && hud.pips.list ? hud.pips.list.join(',') : '';
      if (OV.cache.pips !== pips) {
        OV.cache.pips = pips;
        OV.pips.innerHTML = hud.pips && hud.pips.list ? hud.pips.list.map((s) => '<span class="sa-pip ' + esc(s) + '"></span>').join('') : '';
        OV.pips.style.display = pips ? '' : 'none';
      }
    }
    // World markers: labels always; the floor dot only when the canvas layer is not drawing marks itself.
    const W = S.world, sp = W && typeof W.screenPos === 'function' ? W.screenPos.bind(W) : null;
    const marks = (!S.paused && sp && st.marks()) || [];
    let mi = 0;
    for (const m of marks) {
      if (!m || typeof m.x !== 'number' || m.kind === 'beam' || m.kind === 'bag') continue;
      const showDot = (m.kind === 'lit' || m.kind === 'next' || m.kind === 'target') && !canvasMarks();
      if (!m.label && !showDot) continue;
      let e = OV.markEls[mi];
      if (!e) { e = OV.markEls[mi] = el('div', 'sa-mark', OV.layer); }
      const p = sp(m.x, m.y);
      e.style.left = Math.round(p.x) + 'px'; e.style.top = Math.round(p.y) + 'px';
      const html = (m.label ? esc(m.label) : '') + (showDot ? '<div class="sa-dot' + (m.kind === 'next' ? ' next' : '') + '"></div>' : '');
      if (e.__html !== html) { e.__html = html; e.innerHTML = html; }
      e.style.display = '';
      mi++;
    }
    for (let k = mi; k < OV.markEls.length; k++) OV.markEls[k].style.display = 'none';
    // Floating feedback words.
    const live = new Set();
    if (sp && !S.paused) {
      for (const f of st.floats) {
        const age = clock - f.t; if (age > 0.9) continue;
        live.add(f.id);
        let e = OV.floatEls.get(f.id);
        if (!e) { e = el('div', 'sa-float ' + f.kind, OV.layer); e.textContent = f.text; OV.floatEls.set(f.id, e); }
        const p = sp(f.x, f.y);
        e.style.left = Math.round(p.x) + 'px'; e.style.top = Math.round(p.y - age * 26) + 'px';
        e.style.opacity = String(clamp(1.2 - age / 0.75, 0, 1));
      }
    }
    for (const [id, e] of OV.floatEls) if (!live.has(id)) { if (e.parentNode) e.parentNode.removeChild(e); OV.floatEls.delete(id); }
    return true;
  }
  // True while world-space marks are being drawn on the canvas (world.render calls draw, or our render wrapper does).
  function canvasMarks() { return !!(S.world && (S.world.__activitiesDraw || (S.world.render && S.world.render.__activities))) || drawCalled; }
})(window.STORY);
