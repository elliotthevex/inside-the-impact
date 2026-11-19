/* Story Mode — combat.js
   Jin's controller, enemy archetypes and AI, the hit system, combat effects,
   fights (waves in the open world), bouts (rounds in a ring) and the tuning table.
   Contract: ARCHITECTURE.md §6. Feel spec: design/ref-movement-art.pdf §1–§9.
   Integration notes (actor fields, render hooks, extra events): story/dev/notes/combat.md.

   Actor fields this module writes for the renderer:
     pose, poseT (s into pose), poseK (0..1 for one-shots), tint, squash, lean, alpha, speed, scaleX, carry,
     poseOpts {same}, w, h, vx, vy, face, down, hostile, kind:'enemy', enemy (AI state), ctrl (Jin), draw(ctx) (bag/dummy).
   Render hooks for world.render (ctx already in world space): S.combat.drawUnder(ctx) before actors,
   S.combat.drawOver(ctx) after actors. */
(function (S) {
  'use strict';

  const U = S.util;
  const clamp = U.clamp, sign = U.sign, approach = U.approach, lerp = U.lerp;
  const C = S.combat = S.combat || {};

  /* ── Tuning (ref-movement-art.pdf §6; H = Jin's standing height in px) ── */
  const TUNE_DEFAULT = {
    H: 46,
    // Locomotion. Speeds in H/s, gravity in H/s².
    runSpeed: 4, walkSpeed: 1.7, footworkMul: 0.8, retreatMul: 0.72, carrySpeed: 1.9,
    accelTime: 0.10, decelTime: 0.07, turnBoost: 1.6, airControl: 0.7, airDrag: 0.25,
    gravity: 27, fallGravityMul: 1.25, jumpVel: 8.6, jumpCut: 0.5, maxFall: 13, jumpCarryMax: 4.6,
    coyote: 0.08, landRecover: 0.06, climbSpeed: 2.2,
    // Dashes. Distances in H, times in s.
    dashDist: 1.8, dashTime: 0.16, backdashDist: 1.1, backdashTime: 0.14, dashProtect: 0.07,
    dashCharges: 2, dashRecharge: 0.6, airDashes: 1, dashStraightFrom: 0.07, dashChainFrom: 0.11,
    // Defence.
    slipTime: 0.20, slipWindow: [0.02, 0.08], slipCooldown: 0.40, counterWindow: 0.30, slipBadMul: 1.15,
    inputBuffer: 0.10, comboGrace: 0.22, heavyCancelFrac: 0.4, returnCrossWindow: 0.16,
    hurtTime: 0.30, downTime: 0.75, getupTime: 0.45, wakeInvuln: 0.4, blockStun: 0.12, blockPush: 70,
    // Punches. reach in px from Jin's centre; knock in px/s; hitstop in s.
    jab: { startup: 0.05, active: 0.05, recovery: 0.12, comboFrom: 0.07, dmg: 6, reach: 22, stun: 0.18, hitstop: 0.025, knock: 60, step: 34 },
    cross: { startup: 0.08, active: 0.05, recovery: 0.16, comboFrom: 0.10, dmg: 9, reach: 26, stun: 0.24, hitstop: 0.03, knock: 95, step: 46 },
    hook: { startup: 0.11, active: 0.06, recovery: 0.20, dmg: 11, reach: 24, arc: true, multi: true, stun: 0.30, hitstop: 0.05, knock: 115, step: 20 },
    uppercut: { startup: 0.10, active: 0.06, recovery: 0.24, dmg: 10, reach: 20, launch: 260, hitstop: 0.05, stun: 0.36, knock: 30, step: 18 },
    dashStraight: { startup: 0.04, active: 0.07, recovery: 0.22, dmg: 12, reach: 30, knockback: 180, hitstop: 0.055, stun: 0.32 },
    counter: { startup: 0.03, active: 0.05, recovery: 0.16, dmg: 16, reach: 26, hitstop: 0.065, stun: 0.42, knock: 150, step: 110 },
    flurry: { time: 0.5, hits: 6, dmg: 3, finisherDmg: 8, reach: 22, startup: 0.05, recovery: 0.16, cooldown: 0.5,
      stun: 0.16, knock: 26, finisherStun: 0.4, finisherKnock: 160, hitstop: 0.02, finisherHitstop: 0.05 },
    returnCross: { lunge: 150 },
    guardReduce: 0.75, guardSpeedMul: 0.45,
    breath: { max: 100, punchCost: 7, dashCost: 10, regen: 30, regenDelay: 0.5, exhaustedRecoveryMul: 1.4, recoverAt: 0.35, flurryCostMul: 2.5 },
    hitstopCapPerFrame: true, hitstopMinGap: 0.09, maxAttackers: 2,
    hpMax: 100,
    // Condition recovery by difficulty (damage itself never changes).
    regen: { storyDelay: 2, normalDelay: 3, rate: 0.9 },
    // Enemy-wide rules.
    enemy: { aggroRange: 200, separation: 22, backAttackDelay: 0.12, staggerBreak: 4, breakArmor: 0.6,
      openingMul: 1.25, whiffOpening: 0.3, tokenGap: 0.28, chaseGiveUp: 2.6, launchGravityMul: 0.7,
      directorRange: 160, directorBuff: 1.3, hurtFriction: 900 },
  };
  function deepCopy(v) { return JSON.parse(JSON.stringify(v)); }
  S.tune = Object.assign(deepCopy(TUNE_DEFAULT), S.tune || {});
  S.tuneBase = deepCopy(TUNE_DEFAULT);          // untouched defaults (training applies relative to these)
  C.tuneBase = S.tuneBase;
  C.resetTune = function () { const t = deepCopy(TUNE_DEFAULT); for (const k in S.tune) delete S.tune[k]; Object.assign(S.tune, t); };

  /* ── Module state ─────────────────────────────────────────────────── */
  const BODY_DEFAULT = { power: 1, speedMul: 1, breath: false, limp: 0, delay: 0, knuckles: false };
  C.body = Object.assign({}, BODY_DEFAULT);
  const VERBS = ['jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter', 'flurry', 'dash', 'backdash', 'airdash', 'slip', 'guard', 'jump', 'run', 'punch'];
  C.allowed = {}; for (const v of VERBS) C.allowed[v] = true;
  C.state = { fight: null, bout: null };
  C.inputEnabled = null;        // null = automatic (director/dialogue decide); true/false = forced
  function newStats() {
    return { hits: 0, taken: 0, slips: 0, counters: 0, blocks: 0, whiffs: 0, punches: 0, dashes: 0,
      dmgDealt: 0, dmgTaken: 0, kos: 0, knockdowns: 0, maxCombo: 0, retries: 0 };
  }
  C.stats = newStats();          // session totals (fight/bout states keep their own)

  const restriction = { verbs: Object.create(null), reasons: Object.create(null) };
  let lastG = null;
  let boutDebuff = null;         // current bout debuff result, folded into the effective body
  let EB = effBody();            // effective body for this step

  // Cosmetic randomness never touches the seeded sim RNG.
  let crs = 0x5eed1994;
  const crand = () => { crs = (Math.imul(crs, 1664525) + 1013904223) >>> 0; return crs / 4294967296; };

  function makeJin() {
    return {
      state: 'idle', t: 0, loopT: 0,
      hp: S.tune.hpMax, hpMax: S.tune.hpMax, lastDamageAt: -99, ko: false,
      breath: S.tune.breath.max, breathMax: S.tune.breath.max, breathSpentAt: -99, exhausted: false,
      charges: S.tune.dashCharges, chargeMax: S.tune.dashCharges, rechargeT: 0, chargeK: 0,
      airDashUsed: false, airHangUsed: false, coyoteT: 0, jumpHeld: false, landT: 0,
      atk: null, chain: 0, chainUntil: -99, fl: null, flurryCdUntil: -99,
      dash: null, returnCrossUntil: -99, invulnUntil: -99,
      slipCdUntil: -99, slipEvaded: false, counterT: 0, counterTarget: null,
      buffer: null, walkMode: false, carry: null, carryReason: null,
      inCombat: false, combatT: 9, autoTurnT: 0,
      hurtT: 0, grab: null, ladder: null, auto: null, locked: false, scriptedDown: false,
      combo: 0, comboAt: -99, jabStreak: [], lastAttackName: null, blockFlash: 0,
      afterT: 0, afterN: 0, stepT: 0, squashT: 0, squash: 0, wasGround: true, fallV: 0,
      getupTaps: 0,
    };
  }
  C.jin = makeJin();

  /* ── Small helpers ────────────────────────────────────────────────── */
  const W = () => S.world || null;
  const Hpx = () => S.tune.H;
  function jinActor() { const w = W(); return w && w.jin ? w.jin : null; }
  function isJin(a) { if (!a) return false; const w = W(); return (w && a === w.jin) || a.id === 'jin' || a.isJin === true; }
  function actorList() { const w = W(); return w && Array.isArray(w.actors) ? w.actors : []; }
  let ENEMIES = [];               // cached per step; spawnEnemy appends
  function enemyActors() { return ENEMIES; }
  function refreshEnemies() {
    const out = [];
    for (const a of actorList()) if (a && a.enemy && !a.removed) out.push(a);
    ENEMIES = out;
  }
  function isHostileAwake(e) { const ai = e.enemy; return !!(ai && !ai.ko && !ai.fled && !e.hidden && !ai.arch.passive && e.hostile !== false); }
  function hittable(e) {
    const ai = e.enemy; if (!ai || ai.ko || ai.fled || e.hidden) return false;
    if (ai.state === 'knockdown' || ai.state === 'getup' || ai.state === 'boutDown') return false;
    return S.time >= (ai.invulnUntil || 0);
  }
  function groundY(x, y) {
    const w = W();
    try { if (w && typeof w.groundAt === 'function') { const g = w.groundAt(x, y); if (Number.isFinite(g)) return g; } } catch (_) { /* fall through */ }
    return (w && w.loc && Number.isFinite(w.loc.ground)) ? w.loc.ground : 300;
  }
  function locWidth() { const w = W(); return w && w.loc && w.loc.w ? w.loc.w : 4000; }
  function snd(name, opts) { if (S.headless || !S.audio) return; try { S.audio.play(name, opts); } catch (_) { /* audio never breaks the sim */ } }
  function shake(amount, dur) { if (S.headless) return; try { if (S.cam && typeof S.cam.shakeIt === 'function') S.cam.shakeIt(amount, dur); } catch (_) { /* ignore */ } }
  function emit(name, data) { try { S.events.emit(name, data); } catch (err) { S.fail(err, { source: 'combat emit ' + name }); } }
  const toastAt = Object.create(null);
  function toast(text, kind, key, every) {
    if (!text) return;
    key = key || text;
    if (toastAt[key] !== undefined && S.time - toastAt[key] < (every === undefined ? 1.5 : every)) return;
    toastAt[key] = S.time;
    emit('toast', { text, kind: kind || 'hint' });
  }
  // '{punch}' in tip text becomes the bound key label.
  function fmtKeys(text) {
    return String(text).replace(/\{(\w+)\}/g, (m, a) => (S.input && S.input.actions && S.input.actions.includes(a) ? S.input.labelFor(a) : m));
  }
  function statAdd(key, n) {
    n = n === undefined ? 1 : n;
    C.stats[key] = (C.stats[key] || 0) + n;
    const f = C.state.fight, b = C.state.bout;
    if (f && !f.done) f.stats[key] = (f.stats[key] || 0) + n;
    if (b && !b.done) { b.stats[key] = (b.stats[key] || 0) + n; if (b.roundStats) b.roundStats[key] = (b.roundStats[key] || 0) + n; }
  }
  function statMax(key, v) {
    if (v > (C.stats[key] || 0)) C.stats[key] = v;
    const f = C.state.fight, b = C.state.bout;
    if (f && !f.done && v > (f.stats[key] || 0)) f.stats[key] = v;
    if (b && !b.done && v > (b.stats[key] || 0)) b.stats[key] = v;
  }
  function effBody() {
    const b = C.body || BODY_DEFAULT, d = boutDebuff;
    const gearK = !!(S.G && S.G.gear && S.G.gear.knuckles);
    return {
      power: Number.isFinite(b.power) ? b.power : 1,
      speedMul: clamp((Number.isFinite(b.speedMul) ? b.speedMul : 1) * (d && Number.isFinite(d.speedMul) ? d.speedMul : 1), 0.3, 1.6),
      delay: Math.max(+b.delay || 0, d && +d.delay || 0),
      limp: clamp(+b.limp || 0, 0, 1),
      breath: !!b.breath,
      knuckles: !!b.knuckles || (gearK && !C.state.bout),
      dmgMul: Number.isFinite(b.dmgMul) ? b.dmgMul : 1,
    };
  }
  // Attack speed factor from the body (sabotage and injury slow the hands too).
  const handSpeed = () => clamp(EB.speedMul, 0.5, 1.3);
  function arena() {
    const f = C.state.fight, b = C.state.bout;
    if (b && b.ring) return b.ring;
    if (f && f.arena) return f.arena;
    return null;
  }
  function clampToArena(a, pad) {
    const ar = arena(); if (!ar) return false;
    pad = pad === undefined ? 6 : pad;
    if (a.x < ar.x0 + pad) { a.x = ar.x0 + pad; if (a.vx < 0) a.vx = 0; a.arenaL = true; return true; }
    if (a.x > ar.x1 - pad) { a.x = ar.x1 - pad; if (a.vx > 0) a.vx = 0; a.arenaR = true; return true; }
    a.arenaL = a.arenaR = false;
    return false;
  }

  /* Physics: gravity is applied here; S.world.collide integrates and resolves.
     Fast movers are sub-stepped so a dash never tunnels through a wall. */
  function integrate(a, dt) {
    const w = W();
    const n = Math.max(1, Math.min(8, Math.ceil(Math.abs(a.vx || 0) * dt / 5)));
    const sub = dt / n;
    for (let i = 0; i < n; i++) {
      if (w && typeof w.collide === 'function') w.collide(a, sub);
      else fallbackCollide(a, sub);
    }
  }
  function fallbackCollide(a, dt) {
    a.x += (a.vx || 0) * dt; a.y += (a.vy || 0) * dt;
    const g = groundY(a.x, a.y - 1);
    if (a.y >= g && (a.vy || 0) >= 0) { a.y = g; a.vy = 0; a.onGround = true; } else a.onGround = false;
    const lw = locWidth();
    a.wallL = a.x <= 4; a.wallR = a.x >= lw - 4;
    a.x = clamp(a.x, 4, lw - 4);
  }
  function applyGravity(a, dt, mul) {
    const T = S.tune, g = T.gravity * T.H * (a.vy > 0 ? T.fallGravityMul : 1) * (mul || 1);
    a.vy = Math.min((a.vy || 0) + g * dt, T.maxFall * T.H);
  }
  function onOneWay(a) {
    if (a.onOneway || a.onOneWay) return true;
    const w = W(), solids = w && w.loc && w.loc.solids;
    if (!Array.isArray(solids)) return false;
    for (const s of solids) if (s && s.oneway && Math.abs(a.y - s.y) < 2.5 && a.x >= s.x && a.x <= s.x + s.w) return true;
    return false;
  }

  /* ── Restrictions, skills and the derived allowed table ───────────── */
  function recomputeAllowed() {
    const sk = (S.G && S.G.skills) || {};
    const r = restriction.verbs, j = C.jin;
    for (const v of VERBS) {
      let ok = v in sk ? !!sk[v] : true;     // jump, run and punch are not skills
      if (r[v] === false) ok = false;
      C.allowed[v] = ok;
    }
    if (!C.allowed.punch) for (const v of ['jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter', 'flurry']) C.allowed[v] = false;
    if (!C.allowed.dash) { C.allowed.backdash = false; C.allowed.airdash = false; C.allowed.dashStraight = false; }
    if (j.carry) for (const v of ['jab', 'cross', 'hook', 'uppercut', 'dashStraight', 'counter', 'flurry', 'dash', 'backdash', 'airdash', 'slip', 'guard', 'jump', 'run', 'punch']) C.allowed[v] = false;
  }
  C.restrict = function (o) {
    o = o || {};
    const reasons = o.reasons || {};
    for (const v of VERBS) {
      if (!(v in o)) continue;
      if (o[v] === false) { restriction.verbs[v] = false; restriction.reasons[v] = reasons[v] || o.reason || restriction.reasons[v] || null; }
      else { delete restriction.verbs[v]; delete restriction.reasons[v]; }
    }
    persistRestriction(); recomputeAllowed();
    return C.allowed;
  };
  C.unrestrict = function (verbs) {
    if (Array.isArray(verbs)) for (const v of verbs) { delete restriction.verbs[v]; delete restriction.reasons[v]; }
    else { for (const k in restriction.verbs) delete restriction.verbs[k]; for (const k in restriction.reasons) delete restriction.reasons[k]; }
    persistRestriction(); recomputeAllowed();
    return C.allowed;
  };
  C.restrictions = () => ({ verbs: Object.assign({}, restriction.verbs), reasons: Object.assign({}, restriction.reasons) });
  function persistRestriction() {
    if (!S.G) return;
    const any = Object.keys(restriction.verbs).length > 0;
    S.G.restrict = any ? { verbs: Object.assign({}, restriction.verbs), reasons: Object.assign({}, restriction.reasons) } : null;
  }
  // Body changes persist in G.body so a loaded save keeps the chapter's body.
  C.setBody = function (p) {
    p = p || {};
    for (const k of ['power', 'speedMul', 'breath', 'limp', 'delay', 'knuckles', 'dmgMul']) if (p[k] !== undefined) C.body[k] = p[k];
    if (S.G) S.G.body = Object.assign({}, S.G.body || {}, pickBody(p));
    EB = effBody();
    return C.body;
  };
  function pickBody(p) { const o = {}; for (const k of ['power', 'speedMul', 'breath', 'limp', 'delay', 'knuckles', 'dmgMul', 'look']) if (p[k] !== undefined) o[k] = p[k]; return o; }
  function syncFromG() {
    if (S.G === lastG) return;
    lastG = S.G;
    for (const k in restriction.verbs) delete restriction.verbs[k];
    for (const k in restriction.reasons) delete restriction.reasons[k];
    const r = S.G && S.G.restrict;
    if (r && r.verbs) { Object.assign(restriction.verbs, r.verbs); Object.assign(restriction.reasons, r.reasons || {}); }
    const b = S.G && S.G.body;
    Object.assign(C.body, BODY_DEFAULT);
    if (b && typeof b === 'object') for (const k of ['power', 'speedMul', 'breath', 'limp', 'delay', 'knuckles', 'dmgMul']) if (b[k] !== undefined) C.body[k] = b[k];
    recomputeAllowed();
  }
  S.events.on('loaded', () => { lastG = null; syncFromG(); C.resetJin(); });

  // Why a verb is unavailable, in plain words. Restriction reasons come from the director.
  function blockedReason(verb) {
    const j = C.jin;
    if (j.carry) return j.carryReason || ('Hands full — Jin is carrying ' + (typeof j.carry === 'string' ? 'the ' + j.carry : 'something') + '.');
    const umbrella = (verb === 'flurry' || verb === 'punch') ? ['flurry', 'punch'] : verb === 'dash' ? ['dash'] : [verb];
    for (const v of umbrella) if (restriction.verbs[v] === false) return restriction.reasons[v] || defaultReason(v);
    if (verb === 'punch' && restriction.verbs.punch === false) return restriction.reasons.punch || defaultReason('punch');
    return null;
  }
  function defaultReason(v) {
    return ({ punch: "Jin can't throw punches right now.", dash: "Jin's legs won't take a dash right now.", slip: "Jin can't slip right now.",
      jump: "Jin can't jump right now.", flurry: "Jin can't throw a flurry right now.", run: 'Running is not possible here.' })[v] || 'Not possible right now.';
  }
  function verbOpen(verb) {
    const al = C.allowed;
    switch (verb) {
      case 'punch': return al.punch && (al.jab || al.cross || al.hook || al.uppercut || al.counter || al.dashStraight);
      case 'dash': return al.dash;
      case 'slip': return al.slip;
      case 'jump': return al.jump;
      case 'flurry': return al.flurry && al.punch;
      default: return true;
    }
  }
  function onBlockedVerb(verb) {
    const reason = blockedReason(verb);
    if (reason) { toast(reason, 'restrict', 'restrict:' + verb, 1.6); return; }
    // Not learned yet: only the flurry key has nothing else to do, so it says so (rarely).
    if (verb === 'flurry' && S.G && S.G.skills && !S.G.skills.flurry) toast("Jin hasn't put a flurry together yet.", 'hint', 'learn:flurry', 8);
  }

  /* ── Input: sabotage delay queue and the one-slot buffer ───────────── */
  const CACT = ['left', 'right', 'up', 'down', 'jump', 'punch', 'dash', 'slip', 'flurry', 'run'];
  const inQ = [];
  let delayedDown = blankMap();
  function blankMap() { const o = {}; for (const k of CACT) o[k] = false; return o; }
  function controlEnabled(j) {
    if (C.inputEnabled === false) return false;
    if (S.paused) return false;
    if (C.inputEnabled === true) return true;
    if (j.locked || j.scriptedDown) return false;
    const d = S.director;
    if (d) {
      if (d.dialog) return false;
      if (d.busy) {
        if (typeof d.hasControl === 'function') return !!d.hasControl();
        if (typeof d.playerControl === 'boolean') return d.playerControl;
        if (typeof d.control === 'boolean') return d.control;
        return !!(C.state.fight || C.state.bout);
      }
    }
    return true;
  }
  function rawSample(ctl, j, a) {
    const s = { t: S.time, down: blankMap(), pressed: blankMap(), released: blankMap() };
    if (j.auto) {                               // S.combat.walkTo drives synthetic input
      const au = j.auto, dx = au.x - a.x;
      if (Math.abs(dx) > au.tol) { s.down[dx > 0 ? 'right' : 'left'] = true; }
      return s;
    }
    if (ctl && S.input) for (const k of CACT) { s.down[k] = S.input.down(k); s.pressed[k] = S.input.pressed(k); s.released[k] = S.input.released(k); }
    return s;
  }
  // body.delay > 0 replays input `delay` seconds late (the sabotaged round). Presses are never lost.
  function readInput(ctl, j, a) {
    const s = rawSample(ctl, j, a);
    const delay = j.auto ? 0 : EB.delay;
    if (!(delay > 0)) { inQ.length = 0; delayedDown = s.down; return s; }
    inQ.push(s);
    const out = { t: S.time, down: delayedDown, pressed: blankMap(), released: blankMap() };
    while (inQ.length && inQ[0].t <= S.time - delay + 1e-9) {
      const q = inQ.shift();
      for (const k of CACT) { if (q.pressed[k]) out.pressed[k] = true; if (q.released[k]) out.released[k] = true; }
      out.down = q.down;
    }
    if (inQ.length > 900) inQ.splice(0, inQ.length - 900);
    delayedDown = out.down;
    return out;
  }
  const dirOf = (inp) => (inp.down.right ? 1 : 0) - (inp.down.left ? 1 : 0);
  // One slot: the newest press replaces whatever was waiting (PDF §5: store only the next intended action).
  const BUF_ORDER = ['slip', 'dash', 'jump', 'punch', 'flurry'];
  function capturePresses(j, inp) {
    for (const k of BUF_ORDER) {
      if (!inp.pressed[k]) continue;
      if (!verbOpen(k)) { onBlockedVerb(k); continue; }
      j.buffer = { a: k, t: S.time, dir: dirOf(inp), down: !!inp.down.down, up: !!inp.down.up };
      return;
    }
  }

  /* ── Effects (visual only; nothing is recorded when headless) ───────── */
  const FX = [];
  function fx(o) { if (S.headless) return; o.age = 0; FX.push(o); if (FX.length > 120) FX.splice(0, FX.length - 120); }
  function dust(x, y, dir, n) { fx({ k: 'dust', x, y, dir: dir || 0, life: 0.32, n: n || 1 }); }
  function spark(x, y, heavy, color) { fx({ k: 'spark', x, y, life: heavy ? 0.2 : 0.13, heavy: !!heavy, color: color || (heavy ? '#ffe2a0' : '#fff2d6') }); }
  function smear(a, kind) { fx({ k: 'smear', x: a.x, y: a.y, face: a.face, kind, life: 0.09, follow: a }); }
  function afterimage(a) { fx({ k: 'after', x: a.x, y: a.y, face: a.face, pose: a.pose, t: a.poseT || 0, look: a.look, life: 0.16 }); }

  /* ── Hit-stop: one freeze per step for the longest request; multi-hits are rate limited ── */
  let hsReq = 0, lastHitstopAt = -9, hsSeen = 0;
  function requestHitstop(d, multi) {
    if (!(d > 0)) return;
    if (multi && S.time - lastHitstopAt < S.tune.hitstopMinGap) return;
    if (S.tune.hitstopCapPerFrame !== false) { hsReq = Math.max(hsReq, d); S.hitstop = Math.max(S.hitstop || 0, hsReq); }
    else S.hitstop = (S.hitstop || 0) + d;
    lastHitstopAt = S.time; hsSeen = S.hitstop;
  }

  /* ════════════════════════════════════════════════════════════════════
     JIN
     ════════════════════════════════════════════════════════════════════ */
  function linkJin(a) {
    if (a.ctrl !== C.jin) a.ctrl = C.jin;
    if (!a.w) a.w = 12;
    if (!a.h) a.h = S.tune.H;
    if (a.vx === undefined) a.vx = 0;
    if (a.vy === undefined) a.vy = 0;
    if (!a.face) a.face = 1;
    a.isJin = true;
  }
  function setJ(j, state) { j.state = state; j.t = 0; }
  function jinGrounded(a) { return !!a.onGround; }
  function nearestHostile(a, side, range) {
    let best = null, bd = 1e9;
    for (const e of enemyActors()) {
      if (!isHostileAwake(e)) continue;
      const dx = e.x - a.x, ad = Math.abs(dx);
      if (ad > range) continue;
      if (side && ad > 2 && sign(dx) !== side) continue;
      if (Math.abs(e.y - a.y) > 60) continue;
      if (ad < bd) { bd = ad; best = e; }
    }
    return best;
  }
  function computeInCombat(a) {
    if (C.state.fight || C.state.bout) return true;
    return !!nearestHostile(a, 0, 200);
  }
  // In an exchange, stepping away from the man in front keeps the guard on him (PDF §1: backward footwork).
  function wantsBackstep(j, a) {
    if (!j.inCombat) return false;
    const front = nearestHostile(a, a.face, 130);
    if (!front) return false;
    const behind = nearestHostile(a, -a.face, 130);
    if (behind && Math.abs(behind.x - a.x) < Math.abs(front.x - a.x)) return false;
    return true;
  }
  function protectedNow(j) { return j.state === 'dash' && j.dash && j.dash.t < S.tune.dashProtect; }
  function invulnerable(j) {
    return protectedNow(j) || S.time < j.invulnUntil || j.state === 'down' || j.state === 'getup' || j.state === 'scripted' || j.state === 'climb' && false;
  }
  function inSlipWindow(j) {
    if (j.state !== 'slip') return false;
    const w = S.tune.slipWindow;
    return j.t >= w[0] - 1e-9 && j.t <= w[1] + 1e-9;
  }
  function spendBreath(cost) {
    const j = C.jin;
    if (!EB.breath || !(cost > 0)) return;
    j.breath = Math.max(0, j.breath - cost);
    j.breathSpentAt = S.time;
    if (j.breath <= 0.01 && !j.exhausted) { j.exhausted = true; emit('breathOut', {}); }
  }
  function toggleWalk(j) {
    j.walkMode = !j.walkMode;
    toast(j.walkMode ? 'Walking' : 'Running', 'hint', 'walkmode', 0.2);
  }

  // Cancel windows (PDF §5). Light punches cancel into defence any time (a pending hitbox is dropped);
  // heavies keep their active frames and part of recovery first.
  function canCancel(j, kind) {
    const k = j.atk;
    if (!k) return true;
    const T = S.tune, activeEnd = k.startup + k.active;
    if (kind === 'combo') return k.light ? k.t >= k.comboFrom : (k.chainable ? k.t >= activeEnd : false);
    if (kind === 'defense') return k.light ? true : k.t >= activeEnd + k.recovery * T.heavyCancelFrac;
    if (kind === 'jump') {
      if (k.name === 'uppercut') return k.t >= activeEnd;     // jump after the launch for the follow-up
      return k.light ? k.t >= activeEnd : k.t >= activeEnd + k.recovery * T.heavyCancelFrac;
    }
    return false;
  }

  function tryBuffered(j, a, inp) {
    const b = j.buffer;
    if (!b) return false;
    if (S.time - b.t > S.tune.inputBuffer + 1e-9) { j.buffer = null; return false; }
    let ok = false;
    switch (b.a) {
      case 'jump': ok = tryJump(j, a, b, inp); break;
      case 'dash': ok = tryDash(j, a, b); break;
      case 'slip': ok = trySlip(j, a, b); break;
      case 'punch': ok = tryPunch(j, a, b); break;
      case 'flurry': ok = tryFlurry(j, a, b); break;
    }
    if (ok) j.buffer = null;
    return ok;
  }

  const FREE = { idle: 1, move: 1, brake: 1, land: 1, air: 1, guard: 1 };

  /* Jump: variable height, coyote time, momentum carried within a limit. Down+jump on a one-way platform drops through. */
  function tryJump(j, a, b) {
    const T = S.tune;
    if (b.down && a.onGround && onOneWay(a)) {
      a.dropThrough = true; a.dropUntil = S.time + 0.25; a.y += 2; a.onGround = false;
      j.coyoteT = 0; setJ(j, 'air'); return true;
    }
    const grounded = a.onGround || j.coyoteT > 0;
    if (!grounded) return false;
    if (j.state === 'attack' && !canCancel(j, 'jump')) return false;
    if (j.state === 'dash' && protectedNow(j)) return false;
    if (!(FREE[j.state] || j.state === 'attack' || j.state === 'dash' || j.state === 'climb')) return false;
    if (j.state === 'attack') j.atk = null;
    if (j.state === 'dash') j.dash = null;
    const carry = T.jumpCarryMax * T.H;
    a.vx = clamp(a.vx, -carry, carry);
    a.vy = -T.jumpVel * T.H;
    a.onGround = false; j.coyoteT = 0; j.jumpHeld = true; j.airHangUsed = false;
    setJ(j, 'air');
    snd('jump', { vol: 0.7 }); dust(a.x, a.y, -sign(a.vx), 2);
    return true;
  }

  /* Dash: two shared charges recharging one at a time; protection only at the start. */
  function tryDash(j, a, b) {
    const T = S.tune;
    if (j.charges < 1) return false;
    if (j.state === 'attack' && !canCancel(j, 'defense')) return false;
    if (j.state === 'dash') { if (!j.dash || j.dash.t < T.dashChainFrom) return false; }
    else if (!(FREE[j.state] || j.state === 'attack')) return false;
    if (j.state === 'flurry') return false;
    const grounded = a.onGround || j.coyoteT > 0;
    if (!grounded) {
      if (!C.allowed.airdash) { onBlockedVerb('airdash'); return false; }
      if (j.airDashUsed) return false;
    }
    let dir = b.dir || a.face;
    let back = false;
    if (dir !== a.face) {
      // Keep facing when the exchange is in front (or Jin is guarding/punching): that is a backdash.
      if ((j.state === 'guard' || j.state === 'attack' || wantsBackstep(j, a)) && C.allowed.backdash) back = true;
      else a.face = dir;
    }
    const dist = (back ? T.backdashDist : T.dashDist) * T.H * EB.speedMul;
    const time = back ? T.backdashTime : T.dashTime;
    j.atk = null;
    j.charges -= 1;
    if (!grounded) j.airDashUsed = true;
    spendBreath(T.breath.dashCost);
    j.dash = { dir, back, air: !grounded, t: 0, T: time, D: dist };
    j.afterT = 0; j.afterN = 0;
    if (!grounded) a.vy = 0;
    setJ(j, 'dash');
    statAdd('dashes');
    snd('dash', { vol: back ? 0.75 : 0.9 });
    if (grounded) dust(a.x - dir * 4, a.y, -dir, 3);
    return true;
  }

  /* Slip: short evade window, cooldown from activation, vulnerable outside the window. */
  function trySlip(j, a) {
    const T = S.tune;
    if (!a.onGround) return false;
    if (S.time < j.slipCdUntil) return false;
    if (j.state === 'attack' && !canCancel(j, 'defense')) return false;
    if (!(FREE[j.state] || j.state === 'attack')) return false;
    j.atk = null;
    j.slipCdUntil = S.time + T.slipCooldown;
    j.slipEvaded = false;
    a.vx *= 0.2;
    setJ(j, 'slip');
    snd('slip', { vol: 0.8 });
    return true;
  }

  function tryFlurry(j, a) {
    const T = S.tune;
    if (!a.onGround) return false;
    if (S.time < j.flurryCdUntil) return false;
    if (j.state === 'attack' && !canCancel(j, 'combo') && !canCancel(j, 'defense')) return false;
    if (!(FREE[j.state] || j.state === 'attack')) return false;
    j.atk = null;
    const F = T.flurry;
    j.fl = { t: 0, i: 0, fin: false, startup: F.startup, interval: (F.time - F.startup - 0.06) / Math.max(1, F.hits), finAt: F.time,
      recovery: F.recovery * (j.exhausted ? T.breath.exhaustedRecoveryMul : 1), hitStopped: false, connected: false, hit: new Set() };
    spendBreath(T.breath.punchCost * T.breath.flurryCostMul);
    setJ(j, 'flurry');
    a.vx *= 0.3;
    statAdd('punches');
    notifyJinAttack(a, 'flurry');
    return true;
  }

  // Which punch a press produces right now.
  function choosePunch(j, a, b) {
    const al = C.allowed, grounded = a.onGround;
    if (j.counterT > 0 && al.counter && grounded) return 'counter';
    if (j.state === 'dash' && j.dash) {
      if (j.dash.back) return al.cross ? 'returnCross' : (al.jab ? 'jab' : null);
      if (!j.dash.air && al.dashStraight) return 'dashStraight';
    }
    if (S.time < j.returnCrossUntil && grounded && al.cross) return 'returnCross';
    if (b.down && grounded && al.uppercut) return 'uppercut';
    const inChain = j.state === 'attack' || S.time <= j.chainUntil;
    const step = inChain ? j.chain : 0;
    if (step === 1 && al.cross) return 'cross';
    if (step === 2 && al.hook) return 'hook';
    if (al.jab) return 'jab';
    if (al.cross) return 'cross';
    return null;
  }
  function tryPunch(j, a, b) {
    const T = S.tune;
    if (j.state === 'attack') {
      // A counter press during a light punch's recovery still wins the counter.
      if (!canCancel(j, 'combo') && !(j.counterT > 0 && canCancel(j, 'defense'))) return false;
    } else if (j.state === 'dash') {
      const d = j.dash;
      if (!d) return false;
      if (d.back) { if (d.t < d.T * 0.4) return false; }
      else if (d.t < T.dashStraightFrom) return false;           // after the initial burst (PDF §5)
    } else if (j.state === 'slip') {
      if (!j.slipEvaded) return false;                           // a missed slip plays out its recovery
    } else if (j.state === 'flurry') return false;
    else if (!FREE[j.state]) return false;
    const name = choosePunch(j, a, b);
    if (!name) return false;
    // Turning: a held direction turns Jin when the threat is that way (or nothing is in front).
    if (name === 'counter' && j.counterTarget && j.counterTarget.x !== undefined) {
      const d = sign(j.counterTarget.x - a.x); if (d) a.face = d;
    } else if (j.state !== 'dash' && b.dir && b.dir !== a.face) {
      const behind = nearestHostile(a, b.dir, 70), front = nearestHostile(a, a.face, 60);
      if (behind && (!front || Math.abs(behind.x - a.x) < Math.abs(front.x - a.x))) a.face = b.dir;
      else if (!front) a.face = b.dir;
    } else if (!b.dir && j.state !== 'dash') {
      // No direction: turn to a man right behind Jin when nobody is in front.
      const front = nearestHostile(a, a.face, 56), behind = nearestHostile(a, -a.face, 40);
      if (!front && behind) a.face = -a.face;
    }
    startAttack(j, a, name);
    return true;
  }

  const MOVE_INFO = {
    jab: { light: true, pose: 'jab', smear: 'jab', sound: 'jab', kind: 'light', chainTo: 1 },
    cross: { light: true, pose: 'cross', smear: 'cross', sound: 'cross', kind: 'light', chainTo: 2 },
    returnCross: { light: true, pose: 'cross', smear: 'cross', sound: 'cross', kind: 'light', chainTo: 2, base: 'cross' },
    hook: { light: false, pose: 'hook', smear: 'hook', sound: 'hook', kind: 'heavy', chainTo: 0 },
    uppercut: { light: false, pose: 'uppercut', smear: 'upper', sound: 'upper', kind: 'heavy', chainTo: 0 },
    dashStraight: { light: false, pose: 'dashStraight', smear: 'straight', sound: 'heavy', kind: 'heavy', chainTo: 0 },
    counter: { light: false, pose: 'counter', smear: 'cross', sound: 'counter', kind: 'heavy', chainTo: 2, chainable: true },
  };
  function startAttack(j, a, name) {
    const T = S.tune, info = MOVE_INFO[name];
    const def = T[info.base || name];
    const hs = handSpeed();
    const exh = j.exhausted ? T.breath.exhaustedRecoveryMul : 1;
    const air = !a.onGround;
    const k = {
      name, def, info, t: 0, air,
      startup: def.startup / hs, active: def.active, recovery: def.recovery / hs * exh,
      comboFrom: (def.comboFrom || (def.startup + def.active)) / hs,
      light: info.light, chainable: !!info.chainable, hit: new Set(), connected: false, evaded: false,
      activeStarted: false, activeDone: false, hitstopDone: false, fromDash: j.state === 'dash' ? Math.abs(a.vx) : 0,
    };
    if (j.state === 'dash') j.dash = null;
    j.atk = k;
    j.chain = info.chainTo;
    j.lastAttackName = name;
    j.counterT = name === 'counter' ? 0 : j.counterT;
    if (name === 'counter') j.counterTarget = null;
    j.returnCrossUntil = name === 'returnCross' ? -99 : j.returnCrossUntil;
    setJ(j, 'attack');
    statAdd('punches');
    spendBreath(T.breath.punchCost);
    if (air && !j.airHangUsed) { j.airHangUsed = true; if (a.vy > -40) a.vy = -40; }   // one small hang per airborne sequence
    if (!air && name !== 'dashStraight') a.vx *= 0.35;
    trackJab(name);
    notifyJinAttack(a, name);
  }
  // Three quick jabs in a row are what a trained boxer waits for.
  function trackJab(name) {
    const j = C.jin;
    if (name !== 'jab') { j.jabStreak.length = 0; return; }
    j.jabStreak.push(S.time);
    while (j.jabStreak.length && S.time - j.jabStreak[0] > 1.4) j.jabStreak.shift();
  }

  function attackUpdate(j, a, inp, dir, dt) {
    const k = j.atk, T = S.tune;
    if (!k) { setJ(j, a.onGround ? 'idle' : 'air'); return; }
    k.t += dt;
    const actStart = k.startup, actEnd = k.startup + k.active, end = actEnd + k.recovery;
    // Footwork inside the punch: a small step in for jab/cross, lunges for counters and returning crosses.
    if (!k.air) {
      let target = 0;
      if (k.t < actEnd) {
        if (k.name === 'dashStraight') target = a.face * Math.max(k.fromDash * (1 - k.t / actEnd), 60);
        else if (k.name === 'returnCross') target = a.face * T.returnCross.lunge;
        else target = a.face * (k.def.step || 0);
      }
      a.vx = approach(a.vx, target, (k.name === 'dashStraight' ? 2600 : 3200) * dt);
    } else {
      a.vx = approach(a.vx, dir * T.runSpeed * T.H * 0.9, T.runSpeed * T.H / T.accelTime * 0.5 * dt);
    }
    if (k.t >= actStart && !k.activeStarted) {
      k.activeStarted = true;
      smear(a, k.info.smear);
    }
    if (k.t >= actStart && k.t < actEnd + 1e-9) resolveJinAttack(j, a, k);
    if (k.t >= actEnd && !k.activeDone) {
      k.activeDone = true;
      if (!k.connected) {
        statAdd('whiffs');
        snd('whiff', { vol: 0.55 });
        emit('whiff', { actor: a, move: k.name });
        breakCombo(j);
      }
    }
    if (tryBuffered(j, a, inp)) return;
    if (j.atk === k && k.t >= end) {
      j.atk = null;
      j.chainUntil = S.time + T.comboGrace;
      setJ(j, a.onGround ? (dir ? 'move' : 'idle') : 'air');
    }
  }
  function breakCombo(j) { j.combo = 0; }

  // Strike geometry for each move (PDF §4: close range; trails are visual only).
  function strikeSpec(k) {
    const d = k.def, n = k.name;
    const sp = {
      name: n, dmg: d.dmg, reach: d.reach, stun: d.stun || 0.25, knock: d.knock || d.knockback || 80,
      hitstop: d.hitstop || 0.03, kind: k.info.kind, sound: k.info.sound, top: 0.95, bot: 0.22, back: 0, multi: !!d.multi,
      launch: n === 'uppercut' ? d.launch : 0, counter: n === 'counter', poiseMul: k.light ? 1 : 1.5, air: k.air,
    };
    if (d.arc) { sp.back = 4; sp.top = 1.05; sp.bot = 0.15; }
    if (n === 'uppercut') { sp.top = 1.35; sp.bot = 0.2; }
    if (n === 'dashStraight') sp.multi = false;
    return sp;
  }
  function resolveJinAttack(j, a, k) {
    const n = jinStrike(a, strikeSpec(k), k.hit, k);
    if (n > 0) k.connected = true;
  }
  // Returns the number of targets contacted (blocked counts as contact; evaded does not).
  function jinStrike(a, sp, hitSet, owner) {
    const face = a.face, Hp = S.tune.H;
    const x0 = a.x - face * sp.back, x1 = a.x + face * sp.reach;
    const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    const yTop = a.y - Hp * sp.top, yBot = a.y - Hp * sp.bot;
    const cands = [];
    for (const e of enemyActors()) {
      if (hitSet.has(e) || !hittable(e)) continue;
      const hw = (e.w || 14) / 2, eTop = e.y - (e.h || 46), eBot = e.y;
      if (e.x + hw < lo || e.x - hw > hi) continue;
      if (eBot < yTop || eTop > yBot) continue;
      cands.push(e);
    }
    if (!cands.length) return 0;
    cands.sort((p, q) => Math.abs(p.x - a.x) - Math.abs(q.x - a.x));
    const list = sp.multi ? cands.slice(0, 5) : [cands[0]];
    let n = 0;
    for (const e of list) {
      hitSet.add(e);
      const r = hitEnemy(a, e, sp, owner, n);
      if (r) n++;
      else if (owner) owner.evaded = true;
    }
    return n;
  }

  function slipUpdate(j, a, inp, dir, dt) {
    const T = S.tune;
    // A small knee-bend lean away: Jin stays close enough to counter.
    a.vx = approach(a.vx, j.t < 0.09 ? -a.face * 36 : 0, 2400 * dt);
    if (j.slipEvaded && tryBuffered(j, a, inp)) return;
    if (j.t >= T.slipTime) setJ(j, a.onGround ? (dir ? 'move' : 'idle') : 'air');
  }

  function dashUpdate(j, a, inp, dir, dt) {
    const d = j.dash, T = S.tune;
    if (!d) { setJ(j, 'idle'); return; }
    d.t += dt;
    const k = Math.min(1, d.t / d.T);
    a.vx = d.dir * (2 * d.D / d.T) * (1 - k);     // ease-out burst covering exactly D
    if (d.air) a.vy = 0;
    j.afterT -= dt;
    if (j.afterT <= 0 && j.afterN < 3 && d.t > 0.01) { j.afterN++; j.afterT = 0.045; afterimage(a); }
    if ((d.dir < 0 && a.wallL) || (d.dir > 0 && a.wallR)) d.t = d.T;   // walls stop a dash; it never passes through
    if (tryBuffered(j, a, inp)) return;
    if (d.t >= d.T) {
      j.dash = null;
      if (d.back) j.returnCrossUntil = S.time + T.returnCrossWindow;
      a.vx = (!d.back && dir === d.dir && !d.air) ? d.dir * T.runSpeed * T.H * EB.speedMul * 0.85 : (d.air ? d.dir * T.runSpeed * T.H * 0.5 : 0);
      setJ(j, a.onGround ? (dir ? 'move' : 'idle') : 'air');
    }
  }

  function flurryUpdate(j, a, inp, dir, dt) {
    const fl = j.fl, T = S.tune, F = T.flurry;
    if (!fl) { setJ(j, 'idle'); return; }
    fl.t += dt;
    a.vx = approach(a.vx, 0, 2400 * dt);
    const Hs = handSpeed();
    while (fl.i < F.hits && fl.t >= fl.startup + fl.i * fl.interval / Hs) {
      const sp = { name: 'flurry', dmg: F.dmg, reach: F.reach, stun: F.stun, knock: F.knock, hitstop: fl.hitStopped ? 0 : F.hitstop,
        kind: 'light', sound: 'jab', top: 0.95, bot: 0.25, back: 0, multi: false, poiseMul: 0.7, flurry: true };
      smear(a, fl.i % 2 ? 'cross' : 'jab');
      const n = jinStrike(a, sp, new Set(), null);
      if (n) { fl.connected = true; fl.hitStopped = true; }
      fl.i++;
    }
    if (!fl.fin && fl.t >= fl.finAt / Hs) {
      fl.fin = true;
      const sp = { name: 'flurryFinisher', dmg: F.finisherDmg, reach: F.reach + 2, stun: F.finisherStun, knock: F.finisherKnock,
        hitstop: F.finisherHitstop, kind: 'heavy', sound: 'heavy', top: 1.0, bot: 0.2, back: 2, multi: true, poiseMul: 2 };
      smear(a, 'straight');
      const n = jinStrike(a, sp, new Set(), null);
      if (n) fl.connected = true;
      if (!fl.connected) { statAdd('whiffs'); snd('whiff', { vol: 0.6 }); emit('whiff', { actor: a, move: 'flurry' }); }
    }
    if (fl.fin) {
      const after = fl.t - fl.finAt / Hs;
      // Heavy rule: defence becomes available after part of the recovery.
      if (after >= fl.recovery * T.heavyCancelFrac && j.buffer && (j.buffer.a === 'slip' || j.buffer.a === 'dash')) {
        j.fl = null; j.flurryCdUntil = S.time + F.cooldown; setJ(j, 'idle');
        tryBuffered(j, a, inp); return;
      }
      if (after >= fl.recovery) { j.fl = null; j.flurryCdUntil = S.time + F.cooldown; j.chain = 0; setJ(j, dir ? 'move' : 'idle'); }
    }
  }

  function freeUpdate(j, a, inp, dir, dt) {
    const T = S.tune, Hp = T.H, eb = EB;
    if (tryBuffered(j, a, inp)) return;
    if (tryLadder(j, a, inp)) return;
    const grounded = a.onGround;
    // Guard: hold down while grounded and not punching.
    if (grounded && inp.down.down && C.allowed.guard && !j.carry && !(inp.down.down && onLadderTop(a))) {
      if (j.state !== 'guard') setJ(j, 'guard');
    } else if (j.state === 'guard') setJ(j, grounded ? 'idle' : 'air');

    const maxRun = T.runSpeed * Hp * eb.speedMul;
    let retreat = false;
    if (dir !== 0 && dir !== a.face) {
      if (j.state === 'guard' || wantsBackstep(j, a)) retreat = true;
      else { if (grounded && Math.abs(a.vx) > maxRun * 0.5) dust(a.x, a.y, -dir, 2); a.face = dir; }
    }
    let spd = 0;
    if (dir !== 0) {
      if (j.state === 'guard') spd = maxRun * T.guardSpeedMul;
      else if (j.carry) spd = T.carrySpeed * Hp * eb.speedMul;
      else if (j.walkMode || !C.allowed.run) spd = T.walkSpeed * Hp * eb.speedMul;
      else if (j.inCombat) spd = maxRun * (retreat ? T.retreatMul : T.footworkMul);
      else spd = maxRun;
      if (eb.limp > 0) { spd *= 1 - 0.4 * eb.limp; if (eb.limp >= 0.5) spd = Math.min(spd, T.walkSpeed * Hp * 1.2); }
      if (j.state === 'land') spd *= 0.5;
    }
    const target = dir * spd;
    const accel = T.runSpeed * Hp / T.accelTime, decel = T.runSpeed * Hp / T.decelTime;
    let rate;
    if (target === 0) rate = grounded ? decel : decel * T.airDrag;
    else if (a.vx !== 0 && sign(target) !== sign(a.vx)) rate = decel * T.turnBoost;   // reverse without a sluggish turn
    else rate = accel;
    if (!grounded && target !== 0) rate *= T.airControl;
    const before = a.vx;
    a.vx = approach(a.vx, target, rate * dt);
    if (grounded && Math.abs(before) < 12 && Math.abs(a.vx) >= 12 && !j.carry) dust(a.x - dir * 3, a.y, -dir, 1);   // push-off

    if (!grounded) { if (j.state !== 'air' && j.state !== 'guard') setJ(j, 'air'); return; }
    if (j.state === 'guard') return;
    if (j.state === 'land') { if (j.t >= T.landRecover) setJ(j, dir ? 'move' : 'idle'); return; }
    // Sudden braking from full speed reads as its own silhouette.
    if (j.state === 'move' && !j.inCombat && Math.abs(before) > maxRun * 0.75 && (dir === 0 || dir !== sign(before))) {
      setJ(j, 'brake'); dust(a.x + sign(before) * 4, a.y, sign(before), 2); return;
    }
    if (j.state === 'brake') { if (j.t >= 0.08 || dir === sign(before)) setJ(j, dir ? 'move' : 'idle'); return; }
    const moving = dir !== 0 || Math.abs(a.vx) > 6;
    if (moving && j.state !== 'move') setJ(j, 'move');
    else if (!moving && j.state !== 'idle') setJ(j, 'idle');
    j.retreating = retreat;
    // Idle in an exchange: turn to face a threat that stays behind Jin.
    if (j.state === 'idle' && j.inCombat && dir === 0) {
      const front = nearestHostile(a, a.face, 160), behind = nearestHostile(a, -a.face, 160);
      if (!front && behind) { j.autoTurnT += dt; if (j.autoTurnT > 0.25) { a.face = -a.face; j.autoTurnT = 0; } } else j.autoTurnT = 0;
    }
  }

  /* Ladders (LocationDef.ladders {x, y0 top, y1 bottom}): up/down to climb; jump lets go. */
  function ladders() { const w = W(); return (w && w.loc && Array.isArray(w.loc.ladders)) ? w.loc.ladders : []; }
  function onLadderTop(a) { for (const l of ladders()) if (Math.abs(a.x - l.x) <= 8 && Math.abs(a.y - l.y0) < 3) return true; return false; }
  function tryLadder(j, a, inp) {
    if (!inp.down.up && !inp.down.down) return false;
    if (j.carry || j.state === 'guard' && !onLadderTop(a)) return false;
    for (const l of ladders()) {
      if (Math.abs(a.x - l.x) > 8) continue;
      const goingUp = inp.down.up && a.y > l.y0 + 2 && a.y <= l.y1 + 4;
      const goingDown = inp.down.down && Math.abs(a.y - l.y0) < 3;
      if (!goingUp && !goingDown) continue;
      j.ladder = l; a.x = l.x; a.vx = 0; a.vy = 0; a.onGround = false; a.climbing = true;
      if (goingDown) a.y = l.y0 + 3;
      setJ(j, 'climb');
      return true;
    }
    return false;
  }
  function climbUpdate(j, a, inp, dir, dt) {
    const l = j.ladder, T = S.tune;
    if (!l) { a.climbing = false; setJ(j, 'air'); return; }
    if (inp.pressed.jump && C.allowed.jump) {
      j.ladder = null; a.climbing = false;
      a.vy = -T.jumpVel * T.H * 0.6; a.vx = dir * T.runSpeed * T.H * 0.6;
      if (dir) a.face = dir;
      setJ(j, 'air'); return;
    }
    const v = (inp.down.up ? -1 : inp.down.down ? 1 : 0) * T.climbSpeed * T.H;
    a.vy = 0; a.vx = 0; a.x = l.x;
    a.y += v * dt;
    if (v) j.loopT += Math.abs(v) * dt / 40;
    if (a.y <= l.y0) { a.y = l.y0; a.onGround = true; j.ladder = null; a.climbing = false; setJ(j, 'idle'); }
    else if (a.y >= l.y1) { a.y = l.y1; a.onGround = true; j.ladder = null; a.climbing = false; setJ(j, 'idle'); }
  }

  function hurtUpdate(j, a, dt) {
    a.vx = approach(a.vx, 0, 700 * dt);
    if (j.t >= j.hurtT) setJ(j, a.onGround ? 'idle' : 'air');
  }
  function downUpdate(j, a, dt) {
    const T = S.tune;
    a.vx = approach(a.vx, 0, 500 * dt);
    if (j.scriptedDown) return;
    if (j.ko) {
      // Out of any fight or bout, a knockout ends with Jin getting up slowly (the world stays playable).
      if (!C.state.fight && !C.state.bout && j.t >= 2.5) { j.ko = false; j.hp = Math.max(j.hp, j.hpMax * 0.4); setJ(j, 'getup'); }
      return;
    }
    if (j.t >= T.downTime) setJ(j, 'getup');
  }
  function getupUpdate(j, a, dt) {
    a.vx = approach(a.vx, 0, 900 * dt);
    if (j.t >= S.tune.getupTime) { j.invulnUntil = S.time + S.tune.wakeInvuln; setJ(j, 'idle'); }
  }
  function blockUpdate(j, a, inp, dir, dt) {
    a.vx = approach(a.vx, 0, 800 * dt);
    if (j.t >= S.tune.blockStun) setJ(j, inp.down.down && a.onGround ? 'guard' : 'idle');
  }
  // Held by a grab: mashing punch shortens the hold; then thrown away from the wall.
  function grabbedUpdate(j, a, inp, dt) {
    const g = j.grab;
    if (!g || !g.by || g.by.enemy.ko) { j.grab = null; setJ(j, 'idle'); return; }
    const e = g.by;
    a.vx = 0; a.vy = 0;
    a.x = e.x + e.face * ((e.w || 18) / 2 + 5);
    a.face = -e.face;
    if (inp.pressed.punch || inp.pressed.jump || inp.pressed.dash) g.hold -= 0.09;
    g.t += dt;
    if (!g.sq1 && g.t >= 0.3) { g.sq1 = true; damageJin(g.dmg / 2, e, 'heavy'); snd('hurt'); shake(1, 0.1); }
    if (!g.sq2 && g.t >= Math.max(0.55, g.hold)) {
      g.sq2 = true;
      if (j.state !== 'grabbed') return;           // the first squeeze knocked him out
      damageJin(g.dmg / 2, e, 'heavy');
      j.grab = null;
      e.enemy.state = 'recovery'; e.enemy.t = 0; e.enemy.recT = 0.55; e.enemy.opening = true;
      if (j.state === 'grabbed') {
        a.vx = e.face * 260; a.vy = -160; a.onGround = false;
        j.knockdownPending = true; setJ(j, 'thrown');
        snd('heavy'); shake(1.6, 0.14);
      }
    }
  }
  function thrownUpdate(j, a, dt) {
    if (a.onGround && j.t > 0.05) { j.knockdownPending = false; snd('down', { vol: 0.8 }); setJ(j, 'down'); }
  }

  /* Jin takes damage. Difficulty never changes the number, only recovery (see regen()). */
  function damageJin(dmg, attacker, kind) {
    const j = C.jin, a = jinActor();
    if (!(dmg > 0)) return;
    const floor = S.settings && S.settings.difficulty === 'story' ? 1 : 0;
    const before = j.hp;
    j.hp = Math.max(floor, j.hp - dmg);
    const dealt = before - j.hp;
    j.lastDamageAt = S.time;
    statAdd('taken'); statAdd('dmgTaken', dealt);
    breakCombo(j);
    emit('jinHurt', { dmg: dealt, attacker });
    if (j.hp <= 0 && !j.ko) jinKnockedOut(a, attacker);
  }
  function jinKnockedOut(a, attacker) {
    const j = C.jin;
    j.ko = true; j.atk = null; j.dash = null; j.fl = null; j.grab = null;
    if (a) { a.vy = Math.min(a.vy || 0, -120); a.onGround = false; }
    setJ(j, 'down');
    statAdd('knockdowns');
    snd('down');
    emit('jinDown', { attacker: attacker || null });
    const b = C.state.bout, f = C.state.fight;
    if (b && !b.done) boutKnockdown(b, 'jin');
    else if (f && !f.done && !f.lostAt) f.lostAt = S.time;
  }

  // Enemy strike resolution against Jin (called in the enemy's active frames).
  function enemyStrikeVsJin(e, ai, atk) {
    if (atk.resolved) return;
    const a = jinActor(), j = C.jin;
    if (!a || j.state === 'scripted') return;
    const Hp = S.tune.H;
    const hw = (e.w || 14) / 2;
    const x0 = e.x + atk.dir * (hw - 3), x1 = e.x + atk.dir * atk.reach;
    const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    const eh = e.h || 46;
    const yTop = e.y - eh * (atk.low ? 0.65 : 0.95), yBot = e.y - eh * (atk.low ? 0.15 : 0.3);
    const jl = a.x - 6, jr = a.x + 6, jt = a.y - Hp, jb = a.y;
    if (jr < lo || jl > hi || jb < yTop || jt > yBot) return;
    // Overlap. Decide how it resolves, in priority order.
    if (j.state === 'down' || j.state === 'getup' || j.state === 'thrown') { atk.resolved = 'dodged'; return; }
    if (S.time < j.invulnUntil) { atk.resolved = 'dodged'; return; }
    if (protectedNow(j)) { atk.resolved = 'dodged'; return; }                        // dash dodge window
    if (atk.slippable !== false && inSlipWindow(j)) { slipSuccess(e, ai, atk); return; }
    if (atk.grab) {
      if (!a.onGround || j.state === 'grabbed') return;
      atk.resolved = 'hit';
      j.atk = null; j.dash = null; j.fl = null;
      j.grab = { by: e, t: 0, hold: atk.hold || 0.9, dmg: atk.dmg, sq1: false, sq2: false };
      setJ(j, 'grabbed');
      ai.state = 'grab'; ai.t = 0;
      snd('block', { vol: 0.8 });
      emit('hit', { attacker: e, target: a, kind: 'heavy', dmg: 0, x: a.x, y: a.y - Hp * 0.6, move: atk.name, grab: true });
      return;
    }
    const front = a.face === -atk.dir;
    if (j.state === 'guard' || j.state === 'block') {
      if (front && atk.guardable !== false) { blockHit(e, ai, atk, a, j); return; }
    }
    atk.resolved = 'hit';
    let dmg = atk.dmg * (ai.dmgMul || 1);
    const mistimed = j.state === 'slip';
    if (mistimed) { dmg *= S.tune.slipBadMul; emit('slip', { ok: false }); }
    const heavy = !!(atk.heavy || atk.knockdown || dmg >= 13);
    // Interrupt whatever Jin was doing: a canceled punch deals nothing.
    j.atk = null; j.dash = null; j.fl = null; j.counterT = 0;
    const kx = a.x - atk.dir * 3, ky = a.y - Hp * (atk.low ? 0.45 : 0.68);
    emit('hit', { attacker: e, target: a, kind: heavy ? 'heavy' : 'light', dmg, x: kx, y: ky, move: atk.name });
    spark(kx, ky, heavy, '#f0b8a0');
    snd(heavy ? 'heavy' : 'cross', { vol: 0.8 }); snd('hurt', { vol: 0.7 });
    requestHitstop(heavy ? 0.05 : 0.035, false);
    shake(heavy ? 1.3 : 0.7, heavy ? 0.14 : 0.09);
    j.squash = 0.25; j.squashT = 0.09;
    damageJin(dmg, e, heavy ? 'heavy' : 'light');
    if (j.ko) { a.vx = atk.dir * 140; return; }
    if (atk.knockdown) {
      a.vx = atk.dir * (atk.knock || 160); a.vy = -150; a.onGround = false;
      setJ(j, 'thrown'); j.knockdownPending = true;
    } else {
      a.vx = atk.dir * (atk.knock || 90) * 0.9;
      j.hurtT = (atk.stun || S.tune.hurtTime) * (S.tune.hurtTime / 0.30);
      setJ(j, 'hurt');
    }
  }
  function blockHit(e, ai, atk, a, j) {
    atk.resolved = 'blocked';
    const T = S.tune, Hp = T.H;
    const dmg = atk.dmg * (ai.dmgMul || 1) * (1 - T.guardReduce);
    j.atk = null;
    setJ(j, 'block');
    a.vx = atk.dir * T.blockPush * (atk.heavy ? 1.5 : 1);
    j.blockFlash = 0.1;
    const kx = a.x + a.face * 6, ky = a.y - Hp * 0.62;
    spark(kx, ky, false, '#cfd8e0');
    snd('block');
    requestHitstop(0.02, false);
    shake(0.4, 0.06);
    statAdd('blocks');
    emit('hit', { attacker: e, target: a, kind: 'light', dmg, x: kx, y: ky, move: atk.name, blocked: true });
    damageJin(dmg, e, 'light');
  }
  // A real evade: an incoming direct strike met Jin inside the slip window (PDF §3).
  function slipSuccess(e, ai, atk) {
    const j = C.jin, a = jinActor(), T = S.tune;
    atk.resolved = 'slipped';
    j.slipEvaded = true;
    j.counterT = T.counterWindow;
    j.counterTarget = e;
    statAdd('slips');
    snd('slipOk');
    fx({ k: 'slipok', x: a.x, y: a.y - T.H * 0.85, face: a.face, life: 0.22 });
    emit('slip', { ok: true, attacker: e, move: atk.name });
    fightTip('firstSlip');
  }

  /* Jin's per-step update. */
  function updateJin(a, dt) {
    const j = C.jin, T = S.tune;
    linkJin(a);
    if (a.scripted) {                       // the world/director is moving Jin; leave him alone
      j.atk = null; j.dash = null; j.fl = null; j.buffer = null;
      if (j.state !== 'down') setJ(j, 'scripted');
      return true;
    }
    if (j.state === 'scripted') setJ(j, 'idle');
    const ctl = controlEnabled(j);
    const inp = readInput(ctl, j, a);
    let dir = dirOf(inp);
    j.t += dt; j.loopT += dt;
    if (j.counterT > 0) { j.counterT -= dt; if (j.counterT <= 0) { j.counterT = 0; j.counterTarget = null; } }
    if (j.squashT > 0) { j.squashT -= dt; if (j.squashT <= 0) j.squash = 0; }
    if (j.blockFlash > 0) j.blockFlash -= dt;
    const busyStates = { hurt: 1, down: 1, getup: 1, grabbed: 1, thrown: 1, block: 1 };
    if (ctl && !busyStates[j.state]) {
      if (inp.pressed.run) { if (C.allowed.run) toggleWalk(j); else onBlockedVerb('run'); }
      capturePresses(j, inp);
    } else if (ctl && busyStates[j.state]) {
      capturePresses(j, inp);                 // a press just before recovery ends still counts (buffer)
    }
    if (j.buffer && S.time - j.buffer.t > T.inputBuffer + 1e-9) j.buffer = null;
    if (j.auto) {
      const au = j.auto;
      if (Math.abs(au.x - a.x) <= au.tol || S.time - au.at > au.timeout) {
        j.auto = null; a.vx = 0; if (au.face) a.face = au.face; au.handle.done = true; dir = 0;
      } else if (au.run === false) j.walkMode = true;
    }
    const wasGround = !!a.onGround;
    if (a.onGround) { j.coyoteT = T.coyote; j.airDashUsed = false; j.airHangUsed = false; } else j.coyoteT -= dt;
    j.inCombat = computeInCombat(a);
    j.combatT = j.inCombat ? 0 : j.combatT + dt;

    switch (j.state) {
      case 'attack': attackUpdate(j, a, inp, dir, dt); break;
      case 'dash': dashUpdate(j, a, inp, dir, dt); break;
      case 'slip': slipUpdate(j, a, inp, dir, dt); break;
      case 'flurry': flurryUpdate(j, a, inp, dir, dt); break;
      case 'hurt': hurtUpdate(j, a, dt); break;
      case 'block': blockUpdate(j, a, inp, dir, dt); break;
      case 'down': downUpdate(j, a, dt); break;
      case 'getup': getupUpdate(j, a, dt); break;
      case 'grabbed': grabbedUpdate(j, a, inp, dt); break;
      case 'thrown': thrownUpdate(j, a, dt); break;
      case 'climb': climbUpdate(j, a, inp, dir, dt); break;
      default: freeUpdate(j, a, inp, dir, dt);
    }

    // Variable jump: letting go while rising cuts the jump (a tap is a hop).
    if (j.jumpHeld && !inp.down.jump) { if (a.vy < 0) a.vy *= T.jumpCut; j.jumpHeld = false; }
    if (a.vy >= 0) j.jumpHeld = false;

    if (j.state !== 'climb' && j.state !== 'grabbed') {
      const airDash = j.state === 'dash' && j.dash && j.dash.air;
      if (!airDash) applyGravity(a, dt);
      j.fallV = Math.max(j.fallV, a.vy);
      integrate(a, dt);
      if (a.dropThrough && S.time > (a.dropUntil || 0)) a.dropThrough = false;
      pushBodies(a, j);
      clampToArena(a, 6);
    }
    // Landing.
    if (!wasGround && a.onGround) {
      j.airDashUsed = false;
      if (j.fallV > 140) { snd('land', { vol: clamp(j.fallV / 500, 0.3, 0.9) }); dust(a.x, a.y, 0, 2); }
      if (j.state === 'air') setJ(j, 'land');
      if (j.atk && j.atk.air) { j.atk = null; setJ(j, 'land'); }
      j.fallV = 0;
    }
    if (!a.onGround && (j.state === 'idle' || j.state === 'move' || j.state === 'brake' || j.state === 'land')) setJ(j, 'air');
    // Running steps (sound only).
    if (j.state === 'move' && a.onGround && Math.abs(a.vx) > 60) {
      j.stepT -= dt * Math.abs(a.vx) / (T.runSpeed * T.H);
      if (j.stepT <= 0) { j.stepT = 0.28; snd('step', { vol: 0.3 }); }
    }
    jinPose(j, a, dir);
    return true;
  }

  // Bodies block Jin except during the dash dodge window (ordinary enemies only; never walls).
  function pushBodies(a, j) {
    if (j.state === 'climb' || j.state === 'down' || j.state === 'thrown' || j.state === 'grabbed') return;
    const prot = protectedNow(j);
    for (const e of enemyActors()) {
      const ai = e.enemy;
      if (ai.ko || ai.fled || e.hidden || ai.state === 'launched' || ai.state === 'knockdown') continue;
      if (prot && ai.arch.passable !== false) continue;
      const minD = (a.w || 12) / 2 + (e.w || 14) / 2 - 3;
      const dx = a.x - e.x;
      if (Math.abs(dx) >= minD) continue;
      if (a.y < e.y - (e.h || 46) + 8 || e.y < a.y - S.tune.H + 8) continue;
      let side = dx !== 0 ? sign(dx) : (j.dash ? j.dash.dir : -a.face);
      const ar = arena();
      const blocked = (side < 0 && (a.wallL || (ar && a.x <= ar.x0 + 8))) || (side > 0 && (a.wallR || (ar && a.x >= ar.x1 - 8)));
      if (!blocked) { a.x = e.x + side * minD; if (sign(a.vx) === -side) a.vx = 0; }
      else e.x = a.x - side * minD;
    }
  }

  /* Pose output. One-shot punch poses are time-mapped so the arm is extended during active frames:
     startup -> first 35% of the pose, active -> 35–60%, recovery -> the rest. */
  const POSE_SET = new Set(['idle', 'guard', 'walk', 'run', 'backstep', 'jump', 'fall', 'land', 'dash', 'backdash', 'slip', 'jab', 'cross', 'hook',
    'uppercut', 'dashStraight', 'counter', 'flurry', 'hurt', 'stagger', 'knockdown', 'down', 'getup', 'carry', 'limp', 'tired', 'block', 'reach', 'windup',
    'baton', 'grab', 'shove', 'point']);
  function phaseMap(t, s, act, rec) {
    if (t < s) return 0.35 * (t / Math.max(1e-4, s));
    if (t < s + act) return 0.35 + 0.25 * ((t - s) / Math.max(1e-4, act));
    return Math.min(1, 0.6 + 0.4 * ((t - s - act) / Math.max(1e-4, rec)));
  }
  function poseDur(name, fallback) {
    try { if (S.art && typeof S.art.poseDuration === 'function') { const d = S.art.poseDuration(name); if (d > 0) return d; } } catch (_) { /* ignore */ }
    return fallback;
  }
  function setPose(a, pose, t, k, o) {
    if (a.pose !== pose) { a.prevPose = a.pose; a.prevPoseT = a.poseT || 0; a.poseChangedAt = S.time; }
    a.pose = pose; a.poseT = t; a.poseK = k === undefined ? null : k; a._cPose = pose;
    o = o || {};
    a.tint = o.tint || null; a.squash = o.squash || 0; a.lean = o.lean || 0; a.alpha = o.alpha === undefined ? 1 : o.alpha;
    a.speed = o.speed || 1; a.scaleX = o.scaleX || 1; a.carry = o.carry || null;
    a.poseOpts = { tint: a.tint, squash: a.squash, lean: a.lean, alpha: a.alpha, speed: a.speed, scaleX: a.scaleX, carry: a.carry };
  }
  function jinPose(j, a, dir) {
    const T = S.tune, Hp = T.H;
    // While a scene holds control and Jin is idle, keep any pose the director set.
    if (!controlEnabled(j) && (j.state === 'idle') && a.pose && (a.pose !== a._cPose || a.poseHold)) return;
    const o = { squash: j.squash || 0, alpha: S.time < j.invulnUntil ? (Math.floor(S.time * 20) % 2 ? 0.55 : 1) : 1 };
    if (j.carry) o.carry = typeof j.carry === 'string' ? j.carry : 'box';
    const runK = Math.abs(a.vx) / (T.runSpeed * Hp);
    let pose = 'idle', t = j.loopT, k;
    switch (j.state) {
      case 'idle':
        pose = j.carry ? 'carry' : (j.exhausted && EB.breath) ? 'tired' : (j.inCombat || j.combatT < 1.6) ? 'guard' : 'idle';
        break;
      case 'move': {
        const back = a.vx !== 0 && sign(a.vx) !== a.face;
        if (j.carry) { pose = 'carry'; o.speed = Math.max(0.5, runK * 1.6); }
        else if (back) { pose = 'backstep'; o.speed = Math.max(0.6, runK * 1.4); }
        else if (EB.limp >= 0.3 && !j.inCombat) { pose = 'limp'; o.speed = Math.max(0.5, runK * 1.6); }
        else if (j.inCombat || j.walkMode || runK < 0.5) { pose = 'walk'; o.speed = Math.max(0.6, runK * (j.inCombat ? 1.5 : 2)); o.lean = j.inCombat ? 0.05 : 0.04; }
        else { pose = 'run'; o.speed = Math.max(0.7, runK); o.lean = 0.12 * runK; }
        break;
      }
      case 'brake': pose = 'land'; o.lean = -0.35; t = j.t; break;
      case 'land': pose = 'land'; t = j.t; o.squash = 0.2 * (1 - j.t / Math.max(0.01, T.landRecover)); break;
      case 'air': pose = a.vy < 0 ? 'jump' : 'fall'; t = j.t; o.lean = clamp(a.vx / (T.runSpeed * Hp), -1, 1) * 0.1 * a.face; break;
      case 'guard': pose = 'guard'; if (Math.abs(a.vx) > 6) { pose = sign(a.vx) !== a.face ? 'backstep' : 'walk'; o.speed = 0.7; } break;
      case 'block': pose = 'block'; t = j.t; break;
      case 'dash': {
        const d = j.dash || { back: false, t: 0, T: 1 };
        pose = d.back ? 'backdash' : 'dash'; t = d.t; k = d.t / d.T;
        o.scaleX = d.t < d.T * 0.6 ? 1.12 : 1;            // brief stretch into the motion silhouette
        o.lean = d.back ? -0.15 : 0.2;
        break;
      }
      case 'slip': pose = 'slip'; t = j.t; k = j.t / T.slipTime; break;
      case 'attack': {
        const at = j.atk;
        if (at) {
          pose = at.info.pose;
          k = phaseMap(at.t, at.startup, at.active, at.recovery);
          t = k * poseDur(pose, at.startup + at.active + at.recovery);
          if (at.t >= at.startup && at.t < at.startup + at.active) o.scaleX = 1.06;   // impact stretch
        }
        break;
      }
      case 'flurry': pose = 'flurry'; t = j.fl ? j.fl.t : 0; k = j.fl ? clamp(j.fl.t / (T.flurry.time + T.flurry.recovery), 0, 1) : 1; break;
      case 'hurt': pose = 'hurt'; t = j.t; o.tint = j.t < 0.06 ? '#ffffff' : null; break;
      case 'grabbed': pose = 'hurt'; t = j.t; break;
      case 'thrown': pose = 'knockdown'; t = j.t; break;
      case 'down': pose = j.t < 0.4 ? 'knockdown' : 'down'; t = j.t; break;
      case 'getup': pose = 'getup'; t = j.t; k = j.t / T.getupTime; break;
      case 'climb': pose = 'reach'; t = j.loopT; break;
      default: pose = 'idle';
    }
    setPose(a, pose, t, k, o);
  }

  /* ════════════════════════════════════════════════════════════════════
     ENEMIES
     ════════════════════════════════════════════════════════════════════ */
  // Attack definitions. windup = telegraph time; whiffOpen = extra recovery when it misses (the opening).
  // slippable:false marks pushes and grabs (a slip does not avoid them; dash or jump does). Marked red.
  function atk(o) {
    return Object.assign({ pose: 'cross', wpose: 'windup', windup: 0.4, active: 0.08, recovery: 0.32, dmg: 7, reach: 25, stun: 0.28,
      knock: 90, lunge: 60, heavy: false, knockdown: false, slippable: true, guardable: true, grab: false, whiffOpen: null, weight: 1 }, o);
  }
  const SHOVE = atk({ name: 'shove', pose: 'shove', wpose: 'windup', windup: 0.32, active: 0.08, recovery: 0.3, dmg: 4, reach: 24, stun: 0.3, knock: 170, lunge: 40, slippable: false, weight: 1 });
  const ARCH = {
    thug: { label: 'Thug', hp: 40, poise: 0, speed: 2.3, w: 14, h: 46, mass: 1, launch: true, juggle: 3, look: 'thug', hover: [62, 98], cooldown: [0.6, 1.3],
      attacks: [
        atk({ name: 'punch', pose: 'cross', windup: 0.38, active: 0.08, recovery: 0.30, dmg: 7, reach: 25, knock: 80, lunge: 70, weight: 3 }),
        atk({ name: 'haymaker', pose: 'hook', windup: 0.55, active: 0.10, recovery: 0.45, dmg: 12, reach: 27, stun: 0.38, knock: 130, lunge: 90, heavy: true, whiffOpen: 0.5, weight: 1.4 }),
        { seq: [atk({ name: 'punch', pose: 'jab', windup: 0.34, active: 0.07, recovery: 0.12, dmg: 6, reach: 25, knock: 50, lunge: 50 }),
          atk({ name: 'punch2', pose: 'cross', windup: 0.18, active: 0.08, recovery: 0.34, dmg: 7, reach: 26, knock: 90, lunge: 70 })], weight: 1 },
      ] },
    collector: { label: 'Collector', hp: 90, poise: 22, poiseRegen: 14, speed: 1.6, w: 18, h: 50, mass: 1.8, launch: false, juggle: 1, look: 'collector', hover: [58, 92], cooldown: [0.8, 1.6],
      attacks: [
        atk({ name: 'haymaker', pose: 'hook', windup: 0.6, active: 0.1, recovery: 0.5, dmg: 15, reach: 28, stun: 0.4, knock: 160, lunge: 70, heavy: true, knockdown: true, whiffOpen: 0.55, weight: 2 }),
        atk({ name: 'grab', pose: 'grab', windup: 0.5, active: 0.12, recovery: 0.5, dmg: 10, reach: 22, grab: true, slippable: false, guardable: false, whiffOpen: 0.5, weight: 1, hold: 0.9 }),
        Object.assign({}, SHOVE, { weight: 1 }),
      ] },
    boxer: { label: 'Boxer', hp: 70, poise: 8, speed: 2.7, w: 14, h: 46, mass: 1, launch: true, juggle: 2, hover: [44, 72], cooldown: [0.5, 1.1],
      block: 0.4, feint: 0.25, punishJabs: true, retreatAfter: 0.3,
      attacks: [
        atk({ name: 'jab', pose: 'jab', wpose: 'guard', windup: 0.24, active: 0.06, recovery: 0.2, dmg: 6, reach: 26, stun: 0.2, knock: 60, lunge: 60, whiffOpen: 0.12, weight: 3 }),
        atk({ name: 'cross', pose: 'cross', windup: 0.32, active: 0.07, recovery: 0.28, dmg: 10, reach: 28, stun: 0.28, knock: 100, lunge: 80, whiffOpen: 0.25, weight: 2 }),
        atk({ name: 'hook', pose: 'hook', windup: 0.42, active: 0.08, recovery: 0.36, dmg: 12, reach: 24, stun: 0.32, knock: 120, lunge: 50, heavy: true, whiffOpen: 0.55, weight: 1.2 }),
        { seq: [atk({ name: 'jab', pose: 'jab', wpose: 'guard', windup: 0.24, active: 0.06, recovery: 0.1, dmg: 6, reach: 26, stun: 0.2, knock: 50, lunge: 60 }),
          atk({ name: 'cross', pose: 'cross', windup: 0.16, active: 0.07, recovery: 0.3, dmg: 10, reach: 28, stun: 0.28, knock: 100, lunge: 80, whiffOpen: 0.25 })], weight: 1.5 },
      ],
      punish: atk({ name: 'punishCross', pose: 'counter', windup: 0.11, active: 0.07, recovery: 0.3, dmg: 12, reach: 28, stun: 0.34, knock: 130, lunge: 110, whiffOpen: 0.3 }) },
    guard: { label: 'Guard', hp: 55, poise: 6, speed: 1.9, w: 15, h: 47, mass: 1.2, launch: true, juggle: 2, look: 'guard', hover: [66, 100], cooldown: [0.7, 1.4],
      attacks: [
        atk({ name: 'baton', pose: 'baton', windup: 0.42, active: 0.1, recovery: 0.38, dmg: 11, reach: 32, stun: 0.3, knock: 110, lunge: 60, weight: 3 }),
        atk({ name: 'overhead', pose: 'baton', windup: 0.62, active: 0.1, recovery: 0.5, dmg: 15, reach: 30, stun: 0.4, knock: 150, lunge: 50, heavy: true, knockdown: true, whiffOpen: 0.55, weight: 1 }),
        Object.assign({}, SHOVE, { weight: 1 }),
      ] },
    director: { label: 'Director', hp: 45, poise: 4, speed: 1.6, w: 14, h: 45, mass: 1, launch: true, juggle: 3, look: 'man', hover: [140, 210], cooldown: [1.2, 2],
      role: 'director', attacks: [Object.assign({}, SHOVE, { weight: 1 })] },
    boss_collector: { label: 'Boss', hp: 220, poise: 45, poiseRegen: 18, speed: 1.75, w: 20, h: 54, mass: 2.6, launch: false, juggle: 1, passable: false, boss: true,
      look: 'collector', hover: [46, 80], cooldown: [0.6, 1.2], role: 'corner', staggerImmune: 1.2,
      attacks: [
        atk({ name: 'haymaker', pose: 'hook', windup: 0.55, active: 0.1, recovery: 0.45, dmg: 18, reach: 30, stun: 0.42, knock: 170, lunge: 70, heavy: true, knockdown: true, whiffOpen: 0.55, weight: 2 }),
        { seq: [atk({ name: 'body', pose: 'jab', windup: 0.42, active: 0.07, recovery: 0.12, dmg: 8, reach: 26, stun: 0.25, knock: 60, lunge: 40, low: true }),
          atk({ name: 'body2', pose: 'cross', windup: 0.16, active: 0.07, recovery: 0.38, dmg: 9, reach: 27, stun: 0.3, knock: 110, lunge: 60, low: true, whiffOpen: 0.35 })], weight: 1.6 },
        atk({ name: 'charge', pose: 'shove', windup: 0.6, active: 0.32, recovery: 0.6, dmg: 14, reach: 22, stun: 0.4, knock: 230, lunge: 330, heavy: true, knockdown: true, whiffOpen: 0.7, cond: 'far', weight: 1.4, phase: 1 }),
        atk({ name: 'grab', pose: 'grab', windup: 0.38, active: 0.12, recovery: 0.55, dmg: 16, reach: 24, grab: true, slippable: false, guardable: false, whiffOpen: 0.6, cond: 'wall', weight: 6, hold: 1.0 }),
      ] },
    champion: { label: 'Champion', hp: 160, poise: 30, poiseRegen: 16, speed: 2.8, w: 14, h: 47, mass: 1.3, launch: false, juggle: 1, passable: false, boss: true,
      hover: [40, 64], cooldown: [0.45, 1.0], role: 'champion', staggerImmune: 1.5, block: 0.25 },
    sparring: { label: 'Sparring partner', hp: 60, poise: 6, speed: 2.4, w: 14, h: 46, mass: 1, launch: true, juggle: 2, hover: [46, 74], cooldown: [0.9, 1.6],
      block: 0.25, feint: 0, punishJabs: false, retreatAfter: 0.3, dmgMul: 0.5, windupAdd: 0.08,
      attacks: [
        atk({ name: 'jab', pose: 'jab', wpose: 'guard', windup: 0.3, active: 0.06, recovery: 0.22, dmg: 6, reach: 26, stun: 0.2, knock: 50, lunge: 50, whiffOpen: 0.15, weight: 3 }),
        atk({ name: 'cross', pose: 'cross', windup: 0.38, active: 0.07, recovery: 0.3, dmg: 9, reach: 28, stun: 0.26, knock: 90, lunge: 70, whiffOpen: 0.3, weight: 2 }),
        atk({ name: 'hook', pose: 'hook', windup: 0.46, active: 0.08, recovery: 0.36, dmg: 10, reach: 24, stun: 0.3, knock: 100, lunge: 40, heavy: true, whiffOpen: 0.5, weight: 1 }),
      ] },
    enforcer: { label: 'Enforcer', hp: 70, poise: 10, speed: 2.1, w: 15, h: 49, mass: 1.3, launch: true, juggle: 2, look: 'thug', hover: [60, 96], cooldown: [0.6, 1.3], block: 0.2,
      attacks: [
        { seq: [atk({ name: 'jab', pose: 'jab', windup: 0.32, active: 0.07, recovery: 0.12, dmg: 6, reach: 26, knock: 50, lunge: 50 }),
          atk({ name: 'cross', pose: 'cross', windup: 0.17, active: 0.08, recovery: 0.34, dmg: 9, reach: 27, knock: 100, lunge: 70, whiffOpen: 0.3 })], weight: 2 },
        atk({ name: 'haymaker', pose: 'hook', windup: 0.55, active: 0.1, recovery: 0.45, dmg: 14, reach: 28, stun: 0.4, knock: 150, lunge: 80, heavy: true, knockdown: true, whiffOpen: 0.55, weight: 1.2 }),
        Object.assign({}, SHOVE, { weight: 0.8 }),
      ] },
    bag: { label: 'Heavy bag', hp: 1e9, poise: Infinity, speed: 0, w: 14, h: 42, mass: 9, passive: true, passable: false, custom: 'bag', attacks: [] },
    dummy: { label: 'Dummy', hp: 1e9, poise: Infinity, speed: 0, w: 14, h: 44, mass: 6, passive: true, passable: false, custom: 'dummy', attacks: [] },
  };
  C.archetypes = ARCH;

  /* Champion patterns. 'ch0': the right hand's tell is only posture (shoulder drop) and a pause;
     'ch8': the same patterns, and the shoulder drop is marked — the tell the player now recognises. */
  const CH = {
    jab: atk({ name: 'jab', pose: 'jab', wpose: 'guard', windup: 0.2, active: 0.06, recovery: 0.18, dmg: 6, reach: 28, stun: 0.2, knock: 60, lunge: 60, whiffOpen: 0.1 }),
    right: atk({ name: 'right', pose: 'cross', wpose: 'windup', windup: 0.25, active: 0.08, recovery: 0.32, dmg: 16, reach: 31, stun: 0.36, knock: 150, lunge: 150, heavy: true, whiffOpen: 0.5, tell: 'shoulder' }),
    bodyHook: atk({ name: 'bodyHook', pose: 'hook', wpose: 'windup', windup: 0.3, active: 0.07, recovery: 0.12, dmg: 9, reach: 24, stun: 0.26, knock: 70, lunge: 50, low: true }),
    hook: atk({ name: 'hook', pose: 'hook', wpose: 'windup', windup: 0.18, active: 0.08, recovery: 0.34, dmg: 12, reach: 25, stun: 0.3, knock: 110, lunge: 40, heavy: true, whiffOpen: 0.4 }),
    counterRight: atk({ name: 'counterRight', pose: 'counter', wpose: 'windup', windup: 0.12, active: 0.07, recovery: 0.3, dmg: 14, reach: 30, stun: 0.34, knock: 140, lunge: 120, whiffOpen: 0.35 }),
  };
  const CH_PATTERNS = {
    doubleJab: () => [CH.jab, Object.assign({}, CH.jab, { windup: 0.12 })],
    rightHand: () => [CH.right],
    bodyCombo: () => [CH.bodyHook, Object.assign({}, CH.hook, { windup: 0.16 })],
    jabRight: () => [CH.jab, Object.assign({}, CH.jab, { windup: 0.12, recovery: 0.08 }), Object.assign({}, CH.right, { windup: 0.22 })],
  };
  const CH_PHASES = [
    { weights: { doubleJab: 3, rightHand: 2 }, lean: 0.12 },
    { weights: { doubleJab: 2, rightHand: 2, bodyCombo: 2 }, lean: 0.3 },
    { weights: { doubleJab: 1, rightHand: 2, bodyCombo: 2, jabRight: 2 }, lean: 0.45, speed: 1.12, cd: 0.7 },
  ];

  const DEFAULT_LOOKS = {
    boxer: { h: 46, build: 'boxer', skin: '#b98260', hair: { style: 'buzz', color: '#231a14' }, top: { kind: 'bare', color: '#b98260' }, bottom: { kind: 'trunks', color: '#7a2c2a' }, shoes: '#2a2a2e', extras: ['gloves:#a83a2c'] },
    sparring: { h: 46, build: 'boxer', skin: '#c99a78', hair: { style: 'short', color: '#3a2a1e' }, top: { kind: 'tank', color: '#5d6b78' }, bottom: { kind: 'trunks', color: '#2f3d52' }, shoes: '#2a2a2e', extras: ['gloves:#2f5f8f', 'headband:#c9c1ad'] },
    champion: { h: 47, build: 'boxer', skin: '#a8714f', hair: { style: 'buzz', color: '#1b1410' }, top: { kind: 'bare', color: '#a8714f' }, bottom: { kind: 'trunks', color: '#e6dfcc' }, shoes: '#ece6d8', extras: ['gloves:#c9a13b'] },
    enforcer: 'thug', thug: 'thug', collector: 'collector', boss_collector: 'collector', guard: 'guard', director: 'man',
  };

  let enemySeq = 0;
  function makeAI(type, spec, opts) {
    const A0 = ARCH[type];
    const A = Object.assign({}, A0);
    if (opts.attacks) A.attacks = opts.attacks.map((x) => (x.seq ? x : atk(x)));
    if (opts.poise !== undefined) A.poise = opts.poise;
    if (opts.passive) A.passive = true;
    if (opts.boss !== undefined) A.boss = !!opts.boss;
    const hp = spec.hp || opts.hp || A.hp;
    return {
      type, arch: A, opts, state: opts.passive || A.passive ? 'passive' : 'idle', t: 0, seed: S.rand(),
      hpMax: hp, poiseMeter: 0, poiseHitAt: -9, staggerChain: 0, lastStaggerAt: -9, staggerResist: 0, immuneUntil: -9,
      armorUntil: -9, breakOut: false, juggles: 0, popAt: -99, invulnUntil: -9, cdUntil: S.time + 0.4 + S.rand() * 0.5,
      plan: null, seq: null, seqIdx: 0, atk: null, tokenAt: 0, opening: false, retreatUntil: -9, evadeUntil: -9, evadeCounter: null,
      blocks: 0, lastBlockAt: -9, nextPoint: S.time + 1 + S.rand() * 2, tintT: 0, tintCol: null, showBarUntil: -9, ko: false, fled: false,
      speedMul: opts.speedMul || 1, dmgMul: (opts.dmgMul || 1) * (A.dmgMul || 1), windupMul: opts.windupMul || 1,
      needsKnuckles: !!opts.needsKnuckles, knuckleFloor: opts.knuckleFloor || 0.3, fleeAt: opts.fleeAt || 0,
      patternSet: opts.patternSet || 'ch8', phase: 0, leanAt: -9, repeats: Object.create(null), lastOpener: null,
      aggro: opts.aggro !== false, wakeAt: S.time + (opts.wake || 0), hits: 0, swing: 0, swingV: 0, bout: !!opts.bout,
      script: !!opts.script, kd: 0, getsUp: opts.getsUp !== false,
    };
  }
  function defaultLook(type, opts) {
    if (opts && opts.look) return opts.look;
    const l = DEFAULT_LOOKS[type];
    return l === undefined ? 'man' : l;
  }
  function lookHeight(look, fallback) {
    if (look && typeof look === 'object' && look.h) return look.h;
    if (typeof look === 'string' && S.looks && S.looks[look] && S.looks[look].h) return S.looks[look].h;
    return fallback;
  }

  C.spawnEnemy = function (spec) {
    spec = spec || {};
    const type = ARCH[spec.type] ? spec.type : 'thug';
    if (!ARCH[spec.type]) S.fail(new Error('unknown enemy type "' + spec.type + '"; using thug'), { source: 'combat.spawnEnemy' });
    const A = ARCH[type], opts = Object.assign({}, spec.opts || {});
    const id = spec.id || opts.id || type + '_' + (++enemySeq);
    const look = spec.look || defaultLook(type, opts);
    const x = Number.isFinite(spec.x) ? spec.x : ((jinActor() ? jinActor().x : 200) + 140);
    const face = spec.face || (jinActor() ? sign(jinActor().x - x) || -1 : -1);
    const placement = { id, look, name: spec.name || A.label, x, face, pose: A.passive ? 'idle' : 'guard', layer: 'main' };
    if (Number.isFinite(spec.y)) placement.y = spec.y;
    if (spec.talk || opts.talk) placement.talk = spec.talk || opts.talk;
    let e = null;
    const w = W();
    try { if (w && typeof w.spawn === 'function') e = w.spawn(placement); } catch (err) { S.fail(err, { source: 'combat.spawnEnemy world.spawn' }); }
    if (!e) {
      e = Object.assign({}, placement);
      if (w && Array.isArray(w.actors)) w.actors.push(e);
    }
    if (!Number.isFinite(e.y)) e.y = Number.isFinite(spec.y) ? spec.y : groundY(x, 0);
    e.x = x; e.face = face; e.vx = 0; e.vy = 0;
    if (e.onGround === undefined) e.onGround = true;
    e.look = e.look || look;
    e.name = e.name || placement.name;
    e.ai = undefined;
    e.enemy = makeAI(type, spec, opts);
    e.kind = 'enemy'; e.isEnemy = true;
    e.hostile = !(A.passive || opts.passive) || !!opts.hostile;
    e.hp = e.enemy.hpMax; e.hpMax = e.enemy.hpMax;
    e.w = A.w; e.h = lookHeight(e.look, A.h);
    e.down = false;
    if (A.custom === 'bag') { e.draw = (ctx) => drawBag(ctx, e); e.custom = 'bag'; }
    if (A.custom === 'dummy') { e.draw = (ctx) => drawDummy(ctx, e); e.custom = 'dummy'; }
    if (!ENEMIES.includes(e)) ENEMIES.push(e);
    setPose(e, A.passive ? 'idle' : 'guard', 0);
    return e;
  };
  C.enemies = function () {
    refreshEnemies();
    return ENEMIES.filter((e) => !e.enemy.ko && !e.enemy.fled && !e.hidden && !e.enemy.arch.passive);
  };

  /* Attack tokens: at most maxAttackers enemies may wind up at once; grants are spaced so strikes don't overlap exactly. */
  function makePool(max) { return { max: max || S.tune.maxAttackers, holders: new Set(), lastGrant: -9 }; }
  const globalPool = makePool(0);
  function pool() {
    const b = C.state.bout, f = C.state.fight;
    if (b && !b.done) return b.tokens;
    if (f && !f.done) return f.tokens;
    globalPool.max = S.tune.maxAttackers;
    return globalPool;
  }
  function hasToken(e) { return pool().holders.has(e); }
  function requestToken(e) {
    const p = pool();
    for (const h of p.holders) if (!h.enemy || h.enemy.ko || h.enemy.fled || h.removed || !ENEMIES.includes(h)) p.holders.delete(h);
    if (p.holders.has(e)) return true;
    if (p.holders.size >= p.max) return false;
    if (S.time - p.lastGrant < S.tune.enemy.tokenGap && p.max > 1) return false;
    p.holders.add(e); p.lastGrant = S.time;
    return true;
  }
  function releaseToken(e) { const p = pool(); p.holders.delete(e); globalPool.holders.delete(e); }

  function directorBuff(e) {
    const T = S.tune.enemy;
    for (const d of ENEMIES) {
      if (d === e || d.enemy.arch.role !== 'director' || d.enemy.ko || d.enemy.fled) continue;
      if (Math.abs(d.x - e.x) <= T.directorRange) return T.directorBuff;
    }
    return 1;
  }

  function chooseAttack(e, ai, adx) {
    const A = ai.arch, jin = jinActor();
    if (A.role === 'champion') return championPlan(e, ai);
    const nearWall = jin ? jinWallDistance(jin, sign(jin.x - e.x)) : 999;
    const pool = [];
    let total = 0;
    for (const at of A.attacks || []) {
      const first = at.seq ? at.seq[0] : at;
      if (first.cond === 'wall' && !(nearWall < 40 && adx < 60)) continue;
      if (first.cond === 'far' && adx < 80) continue;
      if (first.phase && ai.phase < first.phase) continue;
      const w = at.weight || first.weight || 1;
      pool.push([at, w]); total += w;
    }
    if (!pool.length) return null;
    let r = S.rand() * total, pick = pool[0][0];
    for (const [at, w] of pool) { r -= w; if (r <= 0) { pick = at; break; } }
    return { seq: pick.seq ? pick.seq.slice() : [pick], feint: !!(A.feint && S.rand() < A.feint) };
  }
  function championPlan(e, ai) {
    const ph = CH_PHASES[ai.phase] || CH_PHASES[0];
    let total = 0; for (const k in ph.weights) total += ph.weights[k];
    let r = S.rand() * total, name = 'doubleJab';
    for (const k in ph.weights) { r -= ph.weights[k]; if (r <= 0) { name = k; break; } }
    return { seq: CH_PATTERNS[name](), pattern: name, feint: false };
  }
  // Distance from Jin to the wall/arena edge behind him (side = direction from enemy to Jin).
  function jinWallDistance(jin, side) {
    const ar = arena();
    let edge = side > 0 ? (ar ? ar.x1 : locWidth()) : (ar ? ar.x0 : 0);
    const w = W(), solids = w && w.loc && w.loc.solids;
    if (Array.isArray(solids)) for (const s of solids) {
      if (!s || s.oneway) continue;
      if (jin.y <= s.y || jin.y - S.tune.H >= s.y + s.h) continue;
      if (side > 0 && s.x >= jin.x && s.x < edge) edge = s.x;
      if (side < 0 && s.x + s.w <= jin.x && s.x + s.w > edge) edge = s.x + s.w;
    }
    if (side > 0 && jin.wallR) return 0;
    if (side < 0 && jin.wallL) return 0;
    return Math.abs(edge - jin.x);
  }

  function startWindup(e, ai, step, opts) {
    const T = S.tune, jin = jinActor();
    opts = opts || {};
    const a = Object.assign({}, step);
    a.dir = e.face;                               // committed direction: never re-aims through a dash
    a.resolved = null;
    const buff = directorBuff(e);
    let w = (a.windup + (ai.arch.windupAdd || 0)) * ai.windupMul / buff;
    if (ai.arch.role === 'champion' && a.tell === 'shoulder' && ai.patternSet === 'ch0') { w += 0.12; a.subtle = true; }   // he pauses; nothing marks it
    if (jin && jin.face === e.face && !opts.chained) w += T.enemy.backAttackDelay;      // a strike from behind gives a little more warning
    a.windupT = w;
    a.recovery = a.recovery / buff;
    a.feintAt = opts.feint ? w * 0.55 : 0;
    ai.atk = a; ai.state = 'windup'; ai.t = 0; ai.opening = false;
    ai.tintT = a.subtle ? 0 : 0.07; ai.tintCol = a.slippable === false ? '#ffb0a0' : '#ffe7b0';
    ai.tellStrong = ai.arch.role === 'champion' && a.tell === 'shoulder' && ai.patternSet !== 'ch0';
    if (!a.subtle && !S.headless) fx({ k: 'tell', actor: e, life: 0.12, red: a.slippable === false });
  }
  function nextInSeq(ai) { return ai.seq && ai.seqIdx + 1 < ai.seq.length ? ai.seq[ai.seqIdx + 1] : null; }

  function updateEnemy(e, dt) {
    const ai = e.enemy, A = ai.arch, T = S.tune;
    if (e.removed) return true;
    if (!Number.isFinite(e.vx)) e.vx = 0;
    if (!Number.isFinite(e.vy)) e.vy = 0;
    ai.t += dt;
    if (ai.tintT > 0) ai.tintT -= dt;
    if (ai.staggerResist > 0) ai.staggerResist = Math.max(0, ai.staggerResist - 0.1 * dt);
    if (A.poiseRegen && S.time - ai.poiseHitAt > 0.8) ai.poiseMeter = Math.max(0, ai.poiseMeter - A.poiseRegen * dt);
    else if (!A.poiseRegen && S.time - ai.poiseHitAt > 1.2) ai.poiseMeter = 0;
    if (A.role === 'champion' || A.boss) updatePhase(e, ai);
    const jin = jinActor();
    let gravMul = 1;
    if (A.passive || ai.state === 'passive') passiveUpdate(e, ai, dt);
    else switch (ai.state) {
      case 'idle':
        e.vx = approach(e.vx, 0, 800 * dt);
        if (jin && ai.aggro && S.time >= ai.wakeAt && !ai.script && (C.state.fight || C.state.bout || Math.abs(jin.x - e.x) < T.enemy.aggroRange)) { ai.state = 'engage'; ai.t = 0; }
        break;
      case 'engage': if (jin) engage(e, ai, dt, jin); break;
      case 'windup': windupUpdate(e, ai, dt); break;
      case 'active': activeUpdate(e, ai, dt); break;
      case 'recovery': recoveryUpdate(e, ai, dt); break;
      case 'hurt':
        e.vx = approach(e.vx, 0, T.enemy.hurtFriction * dt);
        if (ai.t >= ai.stunT) afterStun(e, ai);
        break;
      case 'block':
        e.vx = approach(e.vx, 0, 900 * dt);
        if (ai.t >= 0.2) { ai.state = 'engage'; ai.t = 0; }
        break;
      case 'evade':
        e.vx = approach(e.vx, -e.face * 50, 900 * dt);
        if (ai.t >= ai.evadeT) {
          ai.state = 'engage'; ai.t = 0;
          if (ai.evadeCounter) { const c = ai.evadeCounter; ai.evadeCounter = null; forceAttack(e, ai, [c]); }
        }
        break;
      case 'launched':
        gravMul = T.enemy.launchGravityMul;
        if (e.onGround && ai.t > 0.06 && e.vy >= 0) landFromAir(e, ai);
        break;
      case 'knockdown':
        e.vx = approach(e.vx, 0, 700 * dt);
        if (ai.t >= 0.5) { ai.state = 'getup'; ai.t = 0; ai.invulnUntil = S.time + 0.5; }
        break;
      case 'getup':
        if (ai.t >= 0.38) { ai.state = 'engage'; ai.t = 0; ai.cdUntil = S.time + 0.35; }
        break;
      case 'grab':
        e.vx = 0;
        if (!C.jin.grab || C.jin.grab.by !== e) { ai.state = 'recovery'; ai.t = 0; ai.recT = 0.5; ai.opening = true; }
        break;
      case 'point':
        e.vx = approach(e.vx, 0, 800 * dt);
        if (jin) e.face = sign(jin.x - e.x) || e.face;
        if (ai.t >= 0.7) { ai.state = 'engage'; ai.t = 0; }
        break;
      case 'flee': fleeUpdate(e, ai, dt); break;
      case 'ko':
        e.vx = approach(e.vx, 0, (e.onGround ? 600 : 80) * dt);
        break;
      case 'boutDown':
        e.vx = approach(e.vx, 0, 600 * dt);
        break;
      case 'boutWait': boutWaitUpdate(e, ai, dt); break;
      case 'scripted':
        e.vx = approach(e.vx, 0, 800 * dt);
        break;
      default: ai.state = 'engage';
    }
    if (!A.passive) applyGravity(e, dt, gravMul);
    integrate(e, dt);
    separate(e, ai);
    if (!ai.fled) clampToArena(e, 8);
    enemyPose(e, ai);
    return true;
  }

  function engage(e, ai, dt, jin) {
    const A = ai.arch, T = S.tune, j = C.jin;
    if (ai.script) { e.vx = approach(e.vx, 0, 800 * dt); return; }
    const dx = jin.x - e.x, adx = Math.abs(dx), dirTo = dx >= 0 ? 1 : -1;
    e.face = dirTo;
    if (ai.fleeAt && e.hp <= ai.hpMax * ai.fleeAt && lastStanding(e)) { releaseToken(e); ai.state = 'flee'; ai.t = 0; return; }
    const spd = (A.speed || 2) * T.H * ai.speedMul * (ai.phaseSpeed || 1);
    const jinDown = j.ko || j.state === 'down' || j.state === 'getup' || j.scriptedDown;
    const hold = jinDown || j.state === 'grabbed' || (C.state.bout && C.state.bout.phase !== 'fight') || j.state === 'scripted';
    let target = 0;
    if (A.role === 'director' && directorThink(e, ai, adx, dirTo)) return;
    const holding = hasToken(e) && !hold;
    if (holding) {
      if (!ai.plan) { ai.plan = chooseAttack(e, ai, adx); ai.tokenAt = S.time; }
      if (!ai.plan) { releaseToken(e); ai.cdUntil = S.time + 0.8; return; }
      const first = ai.plan.seq[0];
      const range = first.reach - 3;
      if (adx > range) target = dirTo * spd * (A.role === 'corner' ? 1.15 : 1);
      else {
        ai.seq = ai.plan.seq; ai.seqIdx = 0;
        const feint = ai.plan.feint;
        ai.plan = null;
        startWindup(e, ai, ai.seq[0], { feint });
        if (ai.arch.role === 'champion' && ai.seq.length) noteChampionPattern(ai);
        return;
      }
      if (S.time - ai.tokenAt > T.enemy.chaseGiveUp) { releaseToken(e); ai.plan = null; ai.cdUntil = S.time + 0.6; }
    } else {
      if (hasToken(e) && hold) { releaseToken(e); ai.plan = null; }
      let [hmin, hmax] = A.hover || [60, 100];
      // Spread waiting enemies so a swarm stays readable instead of piling up.
      const rank = waitingRank(e);
      hmin += rank * 14; hmax += rank * 14;
      if (S.time < ai.retreatUntil) target = -dirTo * spd * 0.9;
      else if (adx < hmin - 4) target = -dirTo * spd * 0.75;
      else if (adx > hmax + 4) target = dirTo * spd;
      else target = dirTo * spd * 0.25 * Math.sin(S.time * 1.7 + ai.seed * 6.28);
      if (A.role === 'corner') target = cornerMove(e, ai, jin, adx, dirTo, spd, target);
      if (!hold && S.time >= ai.cdUntil && adx < hmax + 70 && jinActorTargetable()) {
        if (requestToken(e)) { ai.tokenAt = S.time; ai.plan = null; }
      }
    }
    e.vx = approach(e.vx, target, spd * 8 * dt);
  }
  function jinActorTargetable() { const j = C.jin; return !(j.state === 'climb'); }
  function waitingRank(e) {
    let r = 0;
    const jin = jinActor(); if (!jin) return 0;
    const side = sign(e.x - jin.x), d = Math.abs(e.x - jin.x);
    for (const o of ENEMIES) {
      if (o === e || !isHostileAwake(o) || hasToken(o)) continue;
      if (sign(o.x - jin.x) !== side) continue;
      if (Math.abs(o.x - jin.x) < d - 1) r++;
    }
    return Math.min(r, 3);
  }
  function lastStanding(e) { for (const o of ENEMIES) if (o !== e && isHostileAwake(o)) return false; return true; }

  // Director: stays back, points, and speeds up allies near him; shoves Jin away if he gets close.
  function directorThink(e, ai, adx, dirTo) {
    const T = S.tune, spd = ai.arch.speed * T.H * ai.speedMul;
    if (adx < 60) {
      if (S.time >= ai.cdUntil && requestToken(e)) { ai.seq = [SHOVE]; ai.seqIdx = 0; startWindup(e, ai, SHOVE); return true; }
      e.vx = approach(e.vx, -dirTo * spd * 1.1, spd * 8 * S.DT);
      return true;
    }
    if (S.time >= ai.nextPoint && adx < 260) {
      ai.nextPoint = S.time + 3 + S.rand() * 2;
      ai.state = 'point'; ai.t = 0; e.vx = 0;
      emit('enemyPoint', { enemy: e });
      return true;
    }
    return false;
  }
  // Boss collector: walks Jin toward the nearest wall and blocks the open side.
  function cornerMove(e, ai, jin, adx, dirTo, spd, target) {
    const ar = arena();
    const x0 = ar ? ar.x0 : 0, x1 = ar ? ar.x1 : locWidth();
    const centre = (x0 + x1) / 2;
    const openSide = jin.x < centre ? 1 : -1;            // the side Jin would escape toward
    const want = jin.x + openSide * 40;
    if (sign(e.x - jin.x) === openSide) {
      // On the open side: press forward slowly; mirror Jin when he tries to slip past.
      if (sign(jin.vx) === openSide && Math.abs(jin.vx) > 30) return sign(want - e.x) * spd * 1.25;
      return adx > 44 ? dirTo * spd * 0.8 : target;
    }
    return dirTo * spd;                                   // wrong side: just close in; the wall is behind him now
  }
  function separate(e, ai) {
    if (ai.ko || ai.state === 'launched' || ai.arch.passive) return;
    const sep = S.tune.enemy.separation;
    for (const o of ENEMIES) {
      if (o === e || o.enemy.ko || o.enemy.fled || o.enemy.arch.passive || o.enemy.state === 'launched') continue;
      const dx = e.x - o.x, ad = Math.abs(dx);
      if (ad >= sep || Math.abs(e.y - o.y) > 30) continue;
      const push = (sep - ad) * 0.25 * (dx === 0 ? (ai.seed > 0.5 ? 1 : -1) : sign(dx));
      e.x += push;
    }
  }

  function windupUpdate(e, ai, dt) {
    const a = ai.atk;
    e.vx = approach(e.vx, 0, 900 * dt);
    if (a.feintAt && ai.t >= a.feintAt) {
      // Feint: the windup was real-looking, the punch never comes.
      ai.atk = null; ai.seq = null; ai.state = 'engage'; ai.t = 0;
      ai.retreatUntil = S.time + 0.25; ai.cdUntil = S.time + 0.35;
      releaseToken(e);
      emit('enemyFeint', { enemy: e });
      return;
    }
    if (ai.t >= a.windupT) { ai.state = 'active'; ai.t = 0; }
  }
  function activeUpdate(e, ai, dt) {
    const a = ai.atk;
    e.vx = a.dir * (a.lunge || 0) * (ai.t < a.active * 0.8 ? 1 : 0.4);
    enemyStrikeVsJin(e, ai, a);
    if (ai.state !== 'active') return;              // grab changed state
    if (ai.t >= a.active) {
      const whiff = !a.resolved || a.resolved === 'slipped' || a.resolved === 'dodged';
      const next = nextInSeq(ai);
      if (whiff) {
        // An opening: longer recovery, any hit staggers him (PDF §9).
        emit('whiff', { actor: e, move: a.name });
        snd('whiff', { vol: 0.4 });
        fightTip('firstWhiff');
        const extra = a.whiffOpen !== null && a.whiffOpen !== undefined ? a.whiffOpen : S.tune.enemy.whiffOpening;
        ai.state = 'recovery'; ai.t = 0; ai.recT = a.recovery + extra; ai.opening = true; ai.seq = null;
        return;
      }
      if (next) { ai.seqIdx++; ai.state = 'recovery'; ai.t = 0; ai.recT = a.recovery; ai.chainNext = next; return; }
      ai.state = 'recovery'; ai.t = 0; ai.recT = a.recovery; ai.opening = false; ai.seq = null;
    }
  }
  function recoveryUpdate(e, ai, dt) {
    e.vx = approach(e.vx, 0, 900 * dt);
    if (ai.t < ai.recT) return;
    if (ai.chainNext) { const n = ai.chainNext; ai.chainNext = null; startWindup(e, ai, n, { chained: true }); return; }
    ai.opening = false; ai.atk = null; ai.seq = null;
    releaseToken(e);
    const cd = ai.arch.cooldown || [0.7, 1.4];
    const phaseCd = ai.arch.role === 'champion' && CH_PHASES[ai.phase] && CH_PHASES[ai.phase].cd ? CH_PHASES[ai.phase].cd : 1;
    ai.cdUntil = S.time + (cd[0] + S.rand() * (cd[1] - cd[0])) * phaseCd;
    if (ai.arch.retreatAfter) ai.retreatUntil = S.time + ai.arch.retreatAfter;
    ai.state = 'engage'; ai.t = 0;
  }
  // Force an attack now (boxer punish, champion counter, scripted drills). Takes the token if needed.
  function forceAttack(e, ai, seq) {
    const p = pool();
    if (!p.holders.has(e)) { p.holders.add(e); p.lastGrant = S.time; }
    ai.seq = seq; ai.seqIdx = 0; ai.plan = null;
    const jin = jinActor(); if (jin) e.face = sign(jin.x - e.x) || e.face;
    startWindup(e, ai, seq[0], { chained: true });
  }
  C.enemyAttack = function (idOrActor, name) {
    const e = typeof idOrActor === 'string' ? ENEMIES.find((x) => x.id === idOrActor) : idOrActor;
    if (!e || !e.enemy || e.enemy.ko) return false;
    const ai = e.enemy, A = ai.arch;
    let step = null;
    for (const at of A.attacks || []) { const s = at.seq ? at.seq[0] : at; if (!name || s.name === name) { step = at.seq ? at.seq : [at]; break; } }
    if (!step && CH[name]) step = [CH[name]];
    if (!step) return false;
    forceAttack(e, ai, step.slice());
    return true;
  };

  function afterStun(e, ai) {
    ai.state = 'engage'; ai.t = 0;
    if (ai.breakOut) {
      // Too many staggers in a row: he shrugs the next punch off and fires back (no infinite stun-locks).
      ai.breakOut = false;
      ai.armorUntil = S.time + S.tune.enemy.breakArmor;
      ai.staggerChain = 0;
      const plan = chooseAttack(e, ai, 20);
      if (plan && plan.seq.length) { forceAttack(e, ai, plan.seq); emit('enemyBreakOut', { enemy: e }); }
      else ai.retreatUntil = S.time + 0.4;
    }
  }
  function landFromAir(e, ai) {
    ai.juggles = 0;
    if (ai.koPending) { ai.koPending = false; ai.state = 'ko'; ai.t = 0; snd('down', { vol: 0.6 }); return; }
    if (ai.arch.launch) { ai.state = 'knockdown'; ai.t = 0; snd('land', { vol: 0.6 }); dust(e.x, e.y, 0, 3); }
    else { ai.state = 'hurt'; ai.t = 0; ai.stunT = 0.15; }
  }
  function fleeUpdate(e, ai, dt) {
    const jin = jinActor(), T = S.tune;
    const away = jin ? (sign(e.x - jin.x) || 1) : 1;
    e.face = away;
    e.vx = approach(e.vx, away * T.runSpeed * T.H * 0.8, 1500 * dt);
    const ar = arena();
    const out = ar ? (e.x <= ar.x0 + 10 || e.x >= ar.x1 - 10) : (ai.t > 2.5);
    if (out && ai.t > 0.6) {
      ai.fled = true; e.hostile = false; e.hidden = true; releaseToken(e);
      emit('enemyFled', { enemy: e });
      const w = W(); try { if (w && typeof w.remove === 'function') w.remove(e.id); } catch (_) { /* ignore */ }
      e.removed = true;
      checkFight();
    }
  }
  function boutWaitUpdate(e, ai, dt) {
    const b = C.state.bout, T = S.tune;
    const home = b && b.ring ? b.ring.x1 - 56 : e.x;
    const d = home - e.x;
    e.vx = approach(e.vx, Math.abs(d) > 3 ? sign(d) * T.H * 1.6 : 0, 900 * dt);
    const jin = jinActor(); if (jin && Math.abs(d) <= 3) e.face = sign(jin.x - e.x) || -1;
  }

  function updatePhase(e, ai) {
    const f = e.hp / ai.hpMax;
    const ph = f > 0.6 ? 0 : f > 0.3 ? 1 : 2;
    if (ph !== ai.phase) {
      ai.phase = ph;
      ai.phaseSpeed = ai.arch.role === 'champion' ? (CH_PHASES[ph].speed || 1) : (ph >= 1 ? 1.15 : 1);
      emit('bossPhase', { enemy: e, phase: ph });
    }
  }
  function noteChampionPattern(ai) { ai.lastPattern = ai.seq && ai.seq[0] ? ai.seq[0].name : null; }

  /* Jin started a punch: trained fighters read it. Boxers punish a third quick jab;
     the champion leans back from predictable straights and counters. */
  function notifyJinAttack(a, name) {
    const j = C.jin;
    for (const e of ENEMIES) {
      const ai = e.enemy, A = ai.arch;
      if (!isHostileAwake(e) || ai.state !== 'engage' || ai.script) continue;
      const dx = e.x - a.x, adx = Math.abs(dx);
      if (adx > 60 || sign(dx) !== a.face || e.face !== -a.face) continue;
      if (A.punishJabs && name === 'jab' && j.jabStreak.length >= 3) {
        j.jabStreak.length = 0;
        evadeAndCounter(e, ai, A.punish, 0.2, 'slip');
        emit('enemyRead', { enemy: e, read: 'jabs' });
        continue;
      }
      if (A.role === 'champion' && (name === 'cross' || name === 'dashStraight' || name === 'hook' || name === 'returnCross')) {
        ai.repeats[name] = (S.time - (ai.repeats[name + 'At'] || -99) < 4) ? (ai.repeats[name] || 0) + 1 : 1;
        ai.repeats[name + 'At'] = S.time;
        if (S.time - ai.leanAt < 1.5) continue;
        const base = (CH_PHASES[ai.phase] || CH_PHASES[0]).lean;
        const chance = Math.min(0.7, base + 0.15 * (ai.repeats[name] - 1));
        if (S.rand() < chance) {
          ai.leanAt = S.time;
          evadeAndCounter(e, ai, CH.counterRight, 0.26, 'lean');
          emit('enemyRead', { enemy: e, read: 'leanBack' });
        }
      }
    }
  }
  function evadeAndCounter(e, ai, counterAtk, dur, how) {
    releaseToken(e);
    ai.state = 'evade'; ai.t = 0; ai.evadeT = dur; ai.evadeHow = how;
    ai.evadeUntil = S.time + dur;
    ai.evadeCounter = counterAtk;
  }

  // Blocking decision when Jin's punch would land (boxers, enforcers, champion).
  function enemyBlocks(e, ai, sp) {
    const A = ai.arch;
    if (!A.block || sp.counter || sp.flurry) return false;
    if (ai.state !== 'engage' && ai.state !== 'block') return false;
    if (ai.opening || S.time < ai.armorUntil) return false;
    const jin = jinActor(); if (!jin || e.face !== -jin.face) return false;
    let p = A.block;
    if (sp.name === 'hook') p *= 0.6;
    if (sp.name === 'dashStraight') p *= 0.75;
    if (S.time - ai.lastBlockAt < 0.6) p *= 1.3;            // a fighter who is being hit in rhythm covers up
    return S.rand() < Math.min(0.75, p);
  }

  /* Jin's punch meets an enemy. Returns true on contact (hit or block), false if he evaded. */
  function hitEnemy(a, e, sp, owner, index) {
    const ai = e.enemy, A = ai.arch, T = S.tune, face = a.face, Hp = T.H;
    if (S.time < ai.evadeUntil) return false;
    const kx = e.x - face * ((e.w || 14) / 2 - 1);
    const ky = a.y - Hp * (sp.name === 'uppercut' ? 0.8 : 0.68);
    const firstContact = owner ? !owner.hitstopDone : (index === 0);
    if (A.passive) {
      ai.hits++;
      ai.swingV += face * (sp.knock || 80) * 0.02 / (A.mass / 6);
      ai.hurtT = 0.12;
      statAdd('hits'); statAdd('dmgDealt', sp.dmg);
      spark(kx, ky, sp.kind === 'heavy');
      snd(sp.sound, { vol: 0.9 });
      if (firstContact) { requestHitstop(sp.hitstop * 0.8, !!(sp.flurry || index > 0)); if (owner) owner.hitstopDone = true; }
      emit('hit', { attacker: a, target: e, kind: sp.kind, dmg: sp.dmg, x: kx, y: ky, move: sp.name, bag: true });
      return true;
    }
    if (enemyBlocks(e, ai, sp)) {
      ai.state = 'block'; ai.t = 0; ai.lastBlockAt = S.time; ai.blocks++;
      const bd = sp.dmg * EB.power * 0.25;
      e.hp = Math.max(1, e.hp - bd);
      e.vx = face * 70 / A.mass;
      spark(kx, ky, false, '#cfd8e0');
      snd('block');
      if (firstContact) { requestHitstop(0.02, false); if (owner) owner.hitstopDone = true; }
      emit('hit', { attacker: a, target: e, kind: 'light', dmg: bd, x: kx, y: ky, move: sp.name, blocked: true });
      // Two blocks in a short time: he fires back quickly.
      if (ai.blocks >= 2 && S.time - ai.lastCounterBlockAt > 1.5 && (A.attacks || []).length) {
        ai.lastCounterBlockAt = S.time; ai.blocks = 0;
        const plan = chooseAttack(e, ai, 20);
        if (plan) { const s = plan.seq.slice(); s[0] = Object.assign({}, s[0], { windup: Math.max(0.16, s[0].windup * 0.7) }); forceAttack(e, ai, s); }
      }
      return true;
    }
    const opening = ai.opening && (ai.state === 'recovery');
    let dmg = sp.dmg * EB.power * EB.dmgMul * (EB.knuckles ? 1.15 : 1);
    if (opening) dmg *= T.enemy.openingMul;
    // Bare fists can't finish a collector who needs the knuckles: he stays on his feet (decision in notes).
    if (ai.needsKnuckles && !EB.knuckles) {
      const floor = ai.hpMax * ai.knuckleFloor;
      if (e.hp - dmg < floor) { dmg = Math.max(0, e.hp - floor); ai.poiseMeter = 0; emit('needKnuckles', { enemy: e }); }
    }
    const before = e.hp;
    e.hp = Math.max(0, e.hp - dmg);
    const dealt = before - e.hp;
    ai.showBarUntil = S.time + 2.5;
    ai.lastHitAt = S.time;
    statAdd('hits'); statAdd('dmgDealt', dealt);
    if (sp.counter) { statAdd('counters'); emit('counter', { target: e }); }
    const j = C.jin;
    j.combo = S.time - j.comboAt < 1.2 ? j.combo + 1 : 1; j.comboAt = S.time;
    statMax('maxCombo', j.combo);
    reactToHit(e, ai, sp, face, opening);
    const heavy = sp.kind === 'heavy';
    spark(kx, ky, heavy || sp.counter);
    snd(sp.sound, { vol: 1 });
    if (firstContact) {
      requestHitstop(sp.hitstop, !!(sp.flurry || sp.multi && index > 0));
      if (owner) owner.hitstopDone = true;
      shake(sp.counter ? 1.4 : heavy ? 1 : 0.45, heavy ? 0.1 : 0.06);
    }
    ai.squash = 0.22; ai.squashT = 0.08;
    emit('hit', { attacker: a, target: e, kind: heavy ? 'heavy' : 'light', dmg: dealt, x: kx, y: ky, move: sp.name, counter: !!sp.counter, opening });
    if (e.hp <= 0.001) knockOut(e, face, sp);
    return true;
  }

  function reactToHit(e, ai, sp, face, opening) {
    const A = ai.arch, T = S.tune;
    const wasAttacking = ai.state === 'windup' || ai.state === 'active';
    const airborne = ai.state === 'launched' || (!e.onGround && e.vy < 0);
    // Launch: uppercut lifts light enemies; heavy ones and bosses pop once at most and never loop.
    if (sp.launch) {
      const canFull = A.launch && ai.juggles < (A.juggle || 3);
      const canPop = !A.launch && ai.juggles < 1 && S.time - ai.popAt > 3 && (opening || ai.poiseMeter + sp.dmg * 1.5 >= effPoise(ai) || sp.counter);
      if (canFull || canPop) {
        cancelEnemyAttack(e, ai);
        ai.juggles++; ai.popAt = S.time; ai.poiseMeter = 0;
        e.vy = -sp.launch * (canFull ? 1 : 0.5); e.vx = face * 30 / A.mass; e.onGround = false;
        ai.state = 'launched'; ai.t = 0;
        emit('launch', { enemy: e, full: canFull });
        return;
      }
    }
    if (airborne && ai.state === 'launched') {
      if (ai.juggles < (A.juggle || 3)) { e.vy = Math.min(e.vy, -110); ai.juggles++; }
      e.vx = face * (sp.knock || 60) * 0.5 / A.mass;
      return;
    }
    // Stagger or flinch (poise). Counters and openings always stagger, unless a boss just shrugged one off.
    const immune = S.time < ai.immuneUntil;
    let stagger;
    if (S.time < ai.armorUntil && !sp.counter) stagger = false;
    else if (immune) stagger = false;
    else if (sp.counter || opening || A.poise <= 0) stagger = true;
    else { ai.poiseMeter += sp.dmg * (sp.poiseMul || 1); ai.poiseHitAt = S.time; stagger = ai.poiseMeter >= effPoise(ai); }
    if (stagger) {
      ai.poiseMeter = 0;
      ai.staggerChain = S.time - ai.lastStaggerAt < 1.0 ? ai.staggerChain + 1 : 1;
      ai.lastStaggerAt = S.time;
      const decay = Math.max(0.4, 1 - 0.2 * (ai.staggerChain - 1));
      cancelEnemyAttack(e, ai);
      ai.state = 'hurt'; ai.t = 0; ai.stunT = (sp.stun || 0.25) * decay * (A.boss ? 0.7 : 1);
      if (!sp.counter && ai.staggerChain >= (A.breakAfter || T.enemy.staggerBreak)) ai.breakOut = true;
      if (A.boss || A.staggerImmune) { ai.immuneUntil = S.time + (A.staggerImmune || 1.2); ai.staggerResist = Math.min(1.5, ai.staggerResist + 0.35); }
      e.vx = face * (sp.knock || 80) / A.mass;
    } else {
      ai.tintT = 0.06; ai.tintCol = '#ffffff';
      e.vx = face * (sp.knock || 80) * 0.3 / A.mass;
      if (wasAttacking) ai.flinched = true;
    }
  }
  function effPoise(ai) { return ai.arch.poise * (1 + ai.staggerResist); }
  function cancelEnemyAttack(e, ai) {
    if (ai.atk || ai.seq || hasToken(e)) { ai.atk = null; ai.seq = null; ai.chainNext = null; ai.plan = null; releaseToken(e); ai.cdUntil = Math.max(ai.cdUntil, S.time + 0.4); }
    ai.opening = false;
    ai.evadeCounter = null;
  }

  // Knocked out: stays down. Nobody is ever killed.
  function knockOut(e, face, sp) {
    const ai = e.enemy;
    if (ai.ko) return;
    const b = C.state.bout;
    if (b && !b.done && ai.bout && b.opponent === e) { boutKnockdown(b, 'opp'); return; }
    finishEnemy(e, face, sp);
  }
  function finishEnemy(e, face, sp) {
    const ai = e.enemy;
    cancelEnemyAttack(e, ai);
    ai.ko = true; e.down = true; e.hostile = false;
    const airborne = ai.state === 'launched' || !e.onGround;
    ai.state = 'ko'; ai.t = 0;
    e.vx = (face || -e.face) * 110 / ai.arch.mass;
    if (!airborne) { e.vy = -100; e.onGround = false; }
    statAdd('kos');
    requestHitstop(0.06, false);
    shake(1.6, 0.14);
    snd('down');
    if (C.state.bout || C.state.fight) snd('crowdRoar', { vol: C.state.bout ? 0.8 : 0 });
    emit('enemyDown', { enemy: e });
    checkFight();
  }

  function passiveUpdate(e, ai, dt) {
    // Heavy bag sways on its chain; the dummy wobbles. Neither ever goes down.
    ai.swingV += -ai.swing * 40 * dt;
    ai.swingV *= Math.pow(0.08, dt);
    ai.swing = clamp(ai.swing + ai.swingV * dt, -0.6, 0.6);
    if (ai.hurtT > 0) ai.hurtT -= dt;
    e.vx = 0;
    e.hp = e.hpMax;
  }

  /* Enemy pose output. */
  function enemyPose(e, ai) {
    const A = ai.arch;
    const o = { squash: ai.squashT > 0 ? ai.squash : 0, tint: ai.tintT > 0 ? ai.tintCol : null };
    if (ai.squashT > 0) ai.squashT -= S.DT;
    if (S.time < ai.invulnUntil && ai.state === 'engage') o.alpha = Math.floor(S.time * 20) % 2 ? 0.6 : 1;
    let pose = 'guard', t = ai.t, k;
    switch (ai.state) {
      case 'passive':
        pose = 'idle'; o.lean = ai.swing; if (ai.hurtT > 0 && A.custom === 'dummy') pose = 'hurt';
        break;
      case 'idle': pose = A.role === 'director' ? 'armsCrossed' : 'idle'; t = S.time; break;
      case 'engage': {
        const mv = Math.abs(e.vx);
        if (mv > 8) { pose = sign(e.vx) !== e.face ? 'backstep' : 'walk'; o.speed = clamp(mv / (A.speed * S.tune.H || 1), 0.5, 1.4); }
        else pose = A.role === 'director' ? 'armsCrossed' : 'guard';
        t = S.time + ai.seed * 3;
        break;
      }
      case 'windup': {
        const a = ai.atk;
        pose = a.wpose === 'guard' ? a.pose : (a.wpose || 'windup');
        k = clamp(ai.t / Math.max(0.01, a.windupT), 0, 1);
        if (a.wpose === 'guard') { t = 0.12 * k * poseDur(pose, 0.3); k = 0.12 * k; }
        else t = ai.t;
        if (a.tell === 'shoulder') o.lean = 0.25 * k;     // the dropped right shoulder
        break;
      }
      case 'active': {
        const a = ai.atk; pose = a.pose;
        k = 0.35 + 0.25 * clamp(ai.t / Math.max(0.01, a.active), 0, 1); t = k * poseDur(pose, 0.4);
        o.scaleX = 1.06;
        break;
      }
      case 'recovery': {
        const a = ai.atk;
        if (a) { pose = a.pose; k = 0.6 + 0.4 * clamp(ai.t / Math.max(0.01, ai.recT), 0, 1); t = k * poseDur(pose, 0.4); }
        else pose = 'guard';
        if (ai.opening) o.lean = -0.08;
        break;
      }
      case 'hurt': pose = ai.stunT > 0.3 ? 'stagger' : 'hurt'; break;
      case 'block': pose = 'block'; break;
      case 'evade': pose = ai.evadeHow === 'lean' ? 'backstep' : 'slip'; o.lean = ai.evadeHow === 'lean' ? -0.3 : 0; k = clamp(ai.t / ai.evadeT, 0, 1); break;
      case 'launched': pose = 'hurt'; o.lean = -0.2; break;
      case 'knockdown': pose = ai.t < 0.3 ? 'knockdown' : 'down'; break;
      case 'getup': pose = 'getup'; k = clamp(ai.t / 0.38, 0, 1); break;
      case 'grab': pose = 'grab'; break;
      case 'point': pose = 'point'; break;
      case 'flee': pose = 'run'; o.speed = 1.2; break;
      case 'ko': case 'boutDown': pose = (ai.t < 0.45 || !e.onGround) ? 'knockdown' : 'down'; break;
      case 'boutWait': pose = Math.abs(e.vx) > 8 ? 'walk' : 'guard'; break;
      case 'scripted': return;                       // leave whatever the director set
    }
    setPose(e, pose, t, k, o);
    if (ai.ko || ai.state === 'boutDown') e.down = true;
  }

  /* ════════════════════════════════════════════════════════════════════
     FIGHTS (EncounterDef)
     ════════════════════════════════════════════════════════════════════ */
  function fightTip(at) {
    const f = C.state.fight;
    if (!f || f.done || !f.def.tips || f.tipsShown[at]) return;
    f.tipsShown[at] = true;
    if (S.settings && S.settings.showTips === false) return;
    for (const t of f.def.tips) if (t && (t.at || 'start') === at && t.text) emit('toast', { text: fmtKeys(t.text), kind: 'tip' });
  }
  function arenaFromLoc() {
    const jin = jinActor();
    const lw = locWidth();
    if (jin) return { x0: Math.max(0, jin.x - 320), x1: Math.min(lw, jin.x + 320) };
    return { x0: 0, x1: lw };
  }
  C.startFight = function (def) {
    def = def || {};
    const prev = C.state.fight;
    if (prev && !prev.done) finishFight(prev, false, { aborted: true });
    const jin = jinActor(), j = C.jin;
    const ar = def.arena && Number.isFinite(def.arena.x0) ? { x0: def.arena.x0, x1: def.arena.x1 } : arenaFromLoc();
    const f = {
      id: def.id || 'fight', def, done: false, won: null, round: null, time: 0, wave: -1, waveT: 0, clearAt: null, lostAt: null,
      stats: newStats(), arena: ar, tokens: makePool(def.maxAttackers || S.tune.maxAttackers), tipsShown: {}, attempt: 1,
      spawned: [], waveActors: [], locId: W() ? W().locId : null, bout: false,
      start: jin ? { x: jin.x, y: jin.y, face: jin.face || 1 } : null,
    };
    C.state.fight = f;
    resetJinForFight();
    if (jin) { j.inCombat = true; }
    if (def.checkpoint) {
      const label = def.checkpointLabel || 'Before the fight';
      emit('checkpoint', { label, fight: f.id });
      try { if (typeof S.save === 'function') S.save('auto', label); } catch (err) { S.fail(err, { source: 'fight checkpoint' }); }
    }
    spawnWave(f, 0);
    emit('fightStart', { id: f.id });
    fightTip('start');
    return f;
  };
  function resetJinForFight() {
    const j = C.jin, a = jinActor();
    if (j.scriptedDown || j.state === 'down' || j.state === 'scripted' || j.state === 'getup') { j.scriptedDown = false; j.ko = false; setJ(j, 'idle'); }
    j.locked = false; j.grab = null; j.auto = null;
    if (a) a.scripted = false;
  }
  function spawnWave(f, i) {
    const waves = f.def.waves || [];
    f.wave = i; f.waveT = 0; f.waveActors = [];
    const w = waves[i];
    if (!w) return;
    const list = w.enemies || [];
    let side = 1;
    list.forEach((spec, n) => {
      const s = Object.assign({}, spec);
      if (!Number.isFinite(s.x)) { s.x = side > 0 ? f.arena.x1 - 14 : f.arena.x0 + 14; side = -side; }
      s.x = clamp(s.x, f.arena.x0 + 10, f.arena.x1 - 10);
      s.opts = Object.assign({}, spec.opts || {}, { wake: 0.25 + n * 0.18 });
      const e = C.spawnEnemy(s);
      e.enemy.fightId = f.id;
      e.enemy.state = 'idle';
      f.spawned.push(e); f.waveActors.push(e);
    });
    if (i > 0) emit('fightWave', { id: f.id, wave: i });
  }
  function waveCleared(f) {
    for (const e of f.waveActors) if (!e.enemy.ko && !e.enemy.fled && !e.removed) return false;
    return true;
  }
  function checkFight() { /* evaluated each step in updateFight; kept for symmetry with immediate KOs */ }
  function updateFight(f, dt) {
    if (f.done) return;
    f.time += dt;
    const w = W();
    if (f.locId && w && w.locId && w.locId !== f.locId) { finishFight(f, false, { aborted: true }); return; }
    if (f.lostAt !== null) {
      if (S.time - f.lostAt >= 1.6) {
        if (f.def.allowLoss || f.def.onLoss === 'lose') finishFight(f, false);
        else retryFight(f);
      }
      return;
    }
    const j = C.jin;
    if (EB.breath && j.breath < j.breathMax * 0.25) fightTip('lowBreath');
    if (!waveCleared(f)) { f.clearAt = null; return; }
    const waves = f.def.waves || [];
    if (f.wave + 1 < waves.length) {
      f.waveT += dt;
      const delay = waves[f.wave + 1].delay !== undefined ? waves[f.wave + 1].delay : 0.8;
      if (f.waveT >= delay) spawnWave(f, f.wave + 1);
      return;
    }
    if (f.clearAt === null) f.clearAt = S.time;
    if (S.time - f.clearAt >= 0.8) finishFight(f, true);
  }
  function finishFight(f, won, extra) {
    if (f.done) return;
    f.done = true; f.won = !!won;
    if (extra && extra.aborted) f.aborted = true;
    f.tokens.holders.clear();
    if (C.state.fight === f) C.state.fight = null;
    emit('fightEnd', { id: f.id, won: f.won, stats: f.stats, aborted: !!f.aborted });
  }
  function retryFight(f) {
    // Defeat restores the fight start (not the save): enemies reset, Jin back on his feet, a few seconds lost.
    for (const e of f.spawned) {
      const w = W();
      try { if (w && typeof w.remove === 'function') w.remove(e.id); } catch (_) { /* ignore */ }
      e.removed = true;
      const i = ENEMIES.indexOf(e); if (i >= 0) ENEMIES.splice(i, 1);
      const al = actorList(), k = al.indexOf(e); if (k >= 0) al.splice(k, 1);
    }
    f.spawned = []; f.waveActors = []; f.lostAt = null; f.clearAt = null;
    f.tokens.holders.clear();
    f.attempt++; f.stats.retries++; C.stats.retries++;
    C.resetJin();
    const jin = jinActor();
    if (jin && f.start) { jin.x = f.start.x; jin.y = f.start.y; jin.face = f.start.face; jin.vx = 0; jin.vy = 0; }
    C.jin.invulnUntil = S.time + 1;
    spawnWave(f, 0);
    emit('fightRetry', { id: f.id, attempt: f.attempt });
    if (S.settings && S.settings.showTips !== false) toast('Back to the start of the fight.', 'retry', 'retry', 0.5);
  }
  C.endFight = function (won) {
    const f = C.state.fight; if (f) finishFight(f, !!won, { aborted: won === undefined });
    const b = C.state.bout; if (b) finishBout(b, !!won, won === undefined ? 'stopped' : 'stopped');
  };

  /* ════════════════════════════════════════════════════════════════════
     BOUTS (BoutDef): ring, rounds with a timer and the bell, corners, knockdown counts, decision by damage
     ════════════════════════════════════════════════════════════════════ */
  C.startBout = function (def) {
    def = def || {};
    const prevB = C.state.bout;
    if (prevB && !prevB.done) finishBout(prevB, false, 'stopped');
    const prevF = C.state.fight;
    if (prevF && !prevF.done) finishFight(prevF, false, { aborted: true });
    const ring = def.ring && Number.isFinite(def.ring.x0) ? { x0: def.ring.x0, x1: def.ring.x1 } : arenaFromLoc();
    const roundTime = def.roundTime || 60;
    const b = {
      id: def.id || 'bout', def, done: false, won: null, round: def.startRound || 1, rounds: def.rounds || 3,
      roundTime, time: roundTime, roundElapsed: 0, phase: 'intro', phaseT: 0,
      knockdowns: { jin: 0, opp: 0 }, count: null, countFor: null, countT: 0, decision: null, points: null,
      stats: newStats(), roundStats: newStats(), roundLog: [], ring, opponent: null, tokens: makePool(1),
      corner: null, attempt: 1, bout: true, crowdStarted: false, endWhen: def.endWhen || 'ko',
      endCorner() { if (b.phase === 'corner') nextRound(b); },
    };
    C.state.bout = b;
    resetJinForFight();
    const o = def.opponent || { type: 'boxer' };
    const e = C.spawnEnemy({ type: o.type || 'boxer', name: o.name, look: o.look, hp: o.hp, id: o.id, x: ring.x1 - 56, face: -1,
      opts: Object.assign({}, o.opts || {}, { bout: true }) });
    e.enemy.state = 'boutWait';
    b.opponent = e;
    placeBoutFighters(b);
    if (b.crowdOn = def.crowd !== false) {
      try { if (!S.headless && S.audio && S.audio.loop) { S.audio.loop('crowd', 0.45, 1.5); b.crowdStarted = true; } } catch (_) { /* ignore */ }
    }
    emit('fightStart', { id: b.id, bout: true });
    emit('boutRound', { id: b.id, round: b.round, phase: 'intro' });
    return b;
  };
  function placeBoutFighters(b) {
    const jin = jinActor(), e = b.opponent;
    if (jin) { jin.x = b.ring.x0 + 56; jin.face = 1; jin.vx = 0; jin.vy = 0; jin.y = groundY(jin.x, jin.y - 1); }
    if (e) { e.x = b.ring.x1 - 56; e.face = -1; e.vx = 0; e.y = groundY(e.x, e.y - 1); }
    C.jin.locked = true;
  }
  function setBoutPhase(b, p) { b.phase = p; b.phaseT = 0; C.jin.locked = p !== 'fight'; }
  function updateBout(b, dt) {
    if (b.done) return;
    b.phaseT += dt;
    const def = b.def, e = b.opponent, j = C.jin;
    const w = W();
    if (!e || e.removed) { finishBout(b, true, 'stopped'); return; }
    applyDebuff(b);
    switch (b.phase) {
      case 'intro':
        if (e.enemy.state !== 'boutWait' && !e.enemy.ko) { e.enemy.state = 'boutWait'; e.enemy.t = 0; }
        if (b.phaseT >= 1.2) {
          if (def.bell !== false) snd('bell');
          setBoutPhase(b, 'fight');
          e.enemy.state = 'engage'; e.enemy.t = 0; e.enemy.cdUntil = S.time + 0.6;
          emit('boutRound', { id: b.id, round: b.round, phase: 'fight' });
        }
        break;
      case 'fight':
        b.roundElapsed += dt;
        b.time = Math.max(0, b.roundTime - b.roundElapsed);
        if (b.time <= 0) roundEnd(b);
        break;
      case 'knockdown': updateCount(b, dt); break;
      case 'roundEnd':
        if (b.phaseT >= 1.6) {
          const last = b.round >= b.rounds || b.endWhen === 'roundEnd';
          if (last) decide(b); else startCorner(b);
        }
        break;
      case 'corner': updateCorner(b, dt); break;
      case 'koWait':
        if (b.phaseT >= 1.5) {
          if (b.koWho === 'opp') finishBout(b, true, 'ko');
          else if (def.allowLoss || b.forcedLoss) finishBout(b, false, 'ko');
          else retryBout(b);
        }
        break;
    }
    void w; void j;
  }
  function roundEnd(b) {
    if (b.def.bell !== false) snd('bell');
    b.roundLog.push({ round: b.round, dealt: b.roundStats.dmgDealt, taken: b.roundStats.dmgTaken });
    const e = b.opponent;
    if (e && !e.enemy.ko) { cancelEnemyAttack(e, e.enemy); e.enemy.state = 'boutWait'; e.enemy.t = 0; }
    setBoutPhase(b, 'roundEnd');
    emit('boutRound', { id: b.id, round: b.round, phase: 'end' });
  }
  function startCorner(b) {
    setBoutPhase(b, 'corner');
    const j = C.jin;
    // Between rounds both men recover some (Jin: 30% of max; the opponent: 12%).
    j.hp = Math.min(j.hpMax, j.hp + j.hpMax * 0.3);
    j.breath = j.breathMax; j.exhausted = false; j.charges = j.chargeMax; j.rechargeT = 0;
    const e = b.opponent;
    if (e) e.hp = Math.min(e.enemy.hpMax, e.hp + e.enemy.hpMax * 0.12);
    const def = b.def;
    let scene = def.corner;
    if (Array.isArray(scene)) scene = scene[b.round - 1] || null;
    else if (scene && typeof scene === 'object') scene = scene[b.round] || null;
    b.corner = { round: b.round, scene, claimed: false, done: false, wait: def.cornerTime || 3.5, viaDirector: false };
    let claimed = false;
    emit('boutCorner', { id: b.id, round: b.round, scene, bout: b, claim() { claimed = true; b.corner.claimed = true; return () => b.endCorner(); } });
    if (claimed) return;
    if (typeof scene === 'function') {
      try { const r = scene(b.round, b); if (typeof r === 'number') b.corner.wait = r; } catch (err) { S.fail(err, { source: 'bout corner' }); }
    } else if (typeof scene === 'string' && S.director && typeof S.director.run === 'function' && !S.director.busy) {
      try { S.director.run(scene, { label: 'corner' }); b.corner.viaDirector = true; } catch (err) { S.fail(err, { source: 'bout corner run' }); }
    }
  }
  function updateCorner(b) {
    const c = b.corner;
    if (!c) { nextRound(b); return; }
    if (c.claimed) return;                       // whoever claimed it calls b.endCorner()
    if (c.viaDirector) { if (b.phaseT > 0.3 && !(S.director && S.director.busy)) nextRound(b); return; }
    if (b.phaseT >= c.wait) nextRound(b);
  }
  function nextRound(b) {
    b.round++;
    b.roundElapsed = 0; b.time = b.roundTime;
    b.roundStats = newStats();
    b.corner = null;
    placeBoutFighters(b);
    setBoutPhase(b, 'intro');
    emit('boutRound', { id: b.id, round: b.round, phase: 'intro' });
  }
  function boutKnockdown(b, who) {
    const e = b.opponent, j = C.jin;
    b.knockdowns[who]++;
    b.countFor = who; b.count = 0; b.countT = 0;
    setBoutPhase(b, 'knockdown');
    if (who === 'opp') {
      const ai = e.enemy;
      cancelEnemyAttack(e, ai);
      ai.state = 'boutDown'; ai.t = 0; ai.kd++;
      e.down = true;
      if (e.onGround) { e.vy = -100; e.onGround = false; }
      // He beats the count for the first two knockdowns (unless told to stay down); the third is final.
      ai.getUpAt = (!ai.getsUp || b.knockdowns.opp >= 3) ? 99 : 4 + 2 * b.knockdowns.opp + Math.floor(S.rand() * 2);
      snd('crowdRoar'); snd('down');
      requestHitstop(0.065, false); shake(1.6, 0.16);
      statAdd('knockdowns', 0);
      emit('boutKnockdown', { id: b.id, who: 'opp', n: b.knockdowns.opp });
    } else {
      j.getupTaps = 0;
      snd('crowdGasp');
      emit('boutKnockdown', { id: b.id, who: 'jin', n: b.knockdowns.jin });
      if (b.knockdowns.jin < 3 && !j.scriptedDown) toast('Tap ' + (S.input ? S.input.labelFor('punch') : 'punch') + ' to get up.', 'tip', 'getup', 3);
    }
  }
  function updateCount(b, dt) {
    const j = C.jin, e = b.opponent;
    b.countT += dt;
    if (b.countFor === 'jin' && S.input && controlEnabledIgnoringLock() && (S.input.pressed('punch') || S.input.pressed('jump'))) j.getupTaps++;
    if (b.countT >= 1) {
      b.countT -= 1; b.count++;
      emit('boutCount', { id: b.id, who: b.countFor, count: b.count });
      snd('uiMove', { vol: 0.6 });
    }
    if (b.countFor === 'opp') {
      if (b.count >= e.enemy.getUpAt && b.count < 10) {
        const ai = e.enemy;
        e.hp = ai.hpMax * (b.knockdowns.opp === 1 ? 0.4 : 0.25);
        ai.state = 'getup'; ai.t = 0; ai.invulnUntil = S.time + 0.8; e.down = false;
        b.count = null; b.countFor = null;
        setBoutPhase(b, 'fight');
        return;
      }
    } else {
      const need = 3 + 3 * b.knockdowns.jin;
      if (!j.scriptedDown && b.knockdowns.jin < 3 && b.count >= 2 && b.count < 10 && j.getupTaps >= need) {
        j.ko = false; j.hp = j.hpMax * (b.knockdowns.jin === 1 ? 0.45 : 0.3);
        setJ(j, 'getup');
        b.count = null; b.countFor = null;
        setBoutPhase(b, 'fight');
        return;
      }
    }
    if (b.count >= 10) {
      b.koWho = b.countFor;
      if (b.countFor === 'opp') { const ai = e.enemy; ai.ko = true; e.hostile = false; ai.state = 'ko'; emit('enemyDown', { enemy: e }); statAdd('kos'); }
      setBoutPhase(b, 'koWait');
      snd(b.countFor === 'opp' ? 'crowdRoar' : 'crowdGasp');
    }
  }
  function controlEnabledIgnoringLock() {
    if (S.paused || C.inputEnabled === false) return false;
    const d = S.director; return !(d && d.dialog);
  }
  function decide(b) {
    const s = b.stats, k = b.knockdowns;
    const pj = s.dmgDealt + 20 * k.opp, po = s.dmgTaken + 20 * k.jin;
    b.points = { jin: Math.round(pj), opp: Math.round(po) };
    if (b.endWhen === 'time') finishBout(b, true, 'survived');
    else if (Math.abs(pj - po) < 0.5) finishBout(b, false, 'draw');
    else finishBout(b, pj > po, 'decision');
  }
  function retryBout(b) {
    const def = b.def, e = b.opponent;
    b.attempt++; b.stats.retries++; C.stats.retries++;
    b.round = def.startRound || 1; b.roundElapsed = 0; b.time = b.roundTime;
    b.knockdowns = { jin: 0, opp: 0 }; b.count = null; b.countFor = null; b.koWho = null;
    b.stats = Object.assign(newStats(), { retries: b.stats.retries }); b.roundStats = newStats(); b.roundLog = [];
    C.resetJin();
    if (e) { const ai = e.enemy; e.hp = ai.hpMax; ai.ko = false; e.down = false; e.hostile = true; ai.kd = 0; cancelEnemyAttack(e, ai); ai.state = 'boutWait'; ai.t = 0; }
    placeBoutFighters(b);
    setBoutPhase(b, 'intro');
    emit('fightRetry', { id: b.id, attempt: b.attempt, bout: true });
  }
  function finishBout(b, won, decision) {
    if (b.done) return;
    b.done = true; b.won = !!won; b.decision = decision || b.decision;
    b.phase = 'done';
    if (b.def.bell !== false && decision !== 'stopped') snd('bell3');
    clearDebuff(b);
    if (b.crowdStarted) { try { S.audio.loop('crowd', 0, 2); } catch (_) { /* ignore */ } }
    C.jin.locked = false;
    b.tokens.holders.clear();
    const e = b.opponent;
    if (e && !e.enemy.ko) { cancelEnemyAttack(e, e.enemy); e.enemy.state = won ? 'boutWait' : 'boutWait'; }
    if (C.state.bout === b) C.state.bout = null;
    emit('fightEnd', { id: b.id, won: b.won, bout: true, decision: b.decision, stats: b.stats, knockdowns: b.knockdowns, points: b.points });
  }
  let fxTouched = null, lastMuffle = 0;
  function applyDebuff(b) {
    const fn = b.def.debuff;
    if (typeof fn !== 'function' || b.phase === 'done') { boutDebuff = null; return; }
    let d = null;
    try { d = fn(b.round, b.roundElapsed) || null; } catch (err) { S.fail(err, { source: 'bout debuff' }); d = null; }
    boutDebuff = d;
    if (!d) return;
    if (!S.headless && S.fx) {
      fxTouched = fxTouched || {};
      for (const k of ['blur', 'double']) if (d[k] !== undefined) { S.fx[k] = +d[k] || 0; fxTouched[k] = true; }
    }
    if (d.muffle !== undefined && Math.abs((+d.muffle || 0) - lastMuffle) > 0.02) {
      lastMuffle = +d.muffle || 0;
      try { if (S.audio && S.audio.muffle) S.audio.muffle(lastMuffle, 0.3); } catch (_) { /* ignore */ }
    }
  }
  function clearDebuff() {
    boutDebuff = null;
    if (fxTouched && S.fx) for (const k in fxTouched) S.fx[k] = 0;
    fxTouched = null;
    if (lastMuffle) { lastMuffle = 0; try { if (S.audio && S.audio.muffle) S.audio.muffle(0, 0.6); } catch (_) { /* ignore */ } }
    EB = effBody();
  }

  /* ════════════════════════════════════════════════════════════════════
     GLOBAL STEP: timers, recovery, fights and bouts. Runs once per sim step
     (call S.combat.update(dt) from the world, or it runs on the first updateActor of the step).
     ════════════════════════════════════════════════════════════════════ */
  let lastStepTime = null, frozenThisStep = false;
  C.update = function (dt) {
    if (lastStepTime === S.time) return;
    lastStepTime = S.time;
    frozenThisStep = false;
    try {
      // Hit-stop: actors freeze; if nobody else counts it down, count it down here.
      if (S.hitstop > 0) {
        if (Math.abs(S.hitstop - hsSeen) < 1e-12) S.hitstop = Math.max(0, S.hitstop - dt);
        hsSeen = S.hitstop;
        frozenThisStep = S.hitstop > 0;
        if (frozenThisStep) { ageFx(dt * 0.25); return; }
      }
      hsReq = 0;
      syncFromG();
      refreshEnemies();
      recomputeAllowed();
      EB = effBody();
      jinTimers(dt);
      if (C.state.fight) updateFight(C.state.fight, dt);
      if (C.state.bout) updateBout(C.state.bout, dt);
      EB = effBody();
      ageFx(dt);
    } catch (err) { S.fail(err, { source: 'combat.update' }); }
  };
  function jinTimers(dt) {
    const j = C.jin, T = S.tune;
    // Dash charges recharge one at a time; exhaustion halves the rate.
    j.chargeMax = T.dashCharges;
    if (j.charges < j.chargeMax) {
      j.rechargeT += dt / Math.max(0.05, T.dashRecharge) * (j.exhausted ? 0.5 : 1);
      if (j.rechargeT >= 1) { j.charges++; j.rechargeT = 0; }
    } else { j.charges = j.chargeMax; j.rechargeT = 0; }
    j.chargeK = j.rechargeT;
    // Breath (only when the chapter's body has it).
    const B = T.breath;
    j.breathMax = B.max;
    if (EB.breath) {
      if (S.time - j.breathSpentAt >= B.regenDelay) j.breath = Math.min(j.breathMax, j.breath + B.regen * dt * (j.state === 'guard' ? 0.7 : 1));
      if (j.exhausted && j.breath >= j.breathMax * B.recoverAt) j.exhausted = false;
    } else { j.breath = j.breathMax; j.exhausted = false; }
    regen(j, dt);
  }
  // Condition recovery by difficulty (ARCHITECTURE §6). Damage values never change.
  function regen(j, dt) {
    const T = S.tune, diff = (S.settings && S.settings.difficulty) || 'normal';
    j.hpMax = T.hpMax;
    if (j.ko || j.state === 'down' || j.hp >= j.hpMax) return;
    const since = S.time - j.lastDamageAt;
    let ok, cap = j.hpMax;
    if (diff === 'story') ok = since >= T.regen.storyDelay;
    else {
      ok = since >= T.regen.normalDelay && !anyEnemyAttacking();
      if (diff === 'veteran') cap = j.hpMax * 0.5;
    }
    if (ok && j.hp < cap) j.hp = Math.min(cap, j.hp + j.hpMax * T.regen.rate * dt);
  }
  function anyEnemyAttacking() {
    for (const e of ENEMIES) {
      const s = e.enemy.state;
      if (e.enemy.ko || e.enemy.fled) continue;
      if (s === 'windup' || s === 'active' || s === 'grab' || (s === 'recovery' && e.enemy.chainNext)) return true;
    }
    return !!C.jin.grab;
  }
  function ageFx(dt) {
    for (let i = FX.length - 1; i >= 0; i--) { FX[i].age += dt; if (FX[i].age >= FX[i].life) FX.splice(i, 1); }
  }

  /* Per-actor entry point (world.update calls this for Jin and every enemy). */
  C.updateActor = function (actor, dt) {
    if (!actor) return false;
    try {
      C.update(dt);
      if (frozenThisStep && S.hitstop > 0) return true;     // hit-stop: actors hold still
      if (isJin(actor)) return updateJin(actor, dt);
      if (actor.enemy) return updateEnemy(actor, dt);
    } catch (err) { S.fail(err, { source: 'combat.updateActor ' + (actor.id || '') }); }
    return false;
  };

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════════════ */
  C.resetJin = function () {
    const j = C.jin, keep = { walkMode: j.walkMode, carry: j.carry, carryReason: j.carryReason };
    Object.assign(j, makeJin(), keep);
    const a = jinActor();
    if (a) { a.vx = 0; a.vy = 0; a.scripted = false; }
    inQ.length = 0;
  };
  C.healJin = function (amount) {
    const j = C.jin;
    if (amount === 'full' || amount === undefined) j.hp = j.hpMax;
    else j.hp = clamp(j.hp + (+amount || 0), 0, j.hpMax);
    if (j.hp > 0 && j.ko && !(C.state.bout && C.state.bout.phase === 'knockdown')) { j.ko = false; if (j.state === 'down' && !j.scriptedDown) setJ(j, 'getup'); }
    return j.hp;
  };
  C.forceDown = function (actorId) {
    const jin = jinActor();
    if (actorId === 'jin' || (jin && (actorId === jin.id || actorId === jin))) {
      const j = C.jin;
      j.atk = null; j.dash = null; j.fl = null; j.grab = null; j.buffer = null;
      j.scriptedDown = true;
      setJ(j, 'down');
      emit('jinDown', { forced: true });
      const b = C.state.bout;
      if (b && !b.done) {
        // A scripted knockdown in a bout is final: count it out.
        b.forcedLoss = true; b.knockdowns.jin = Math.max(b.knockdowns.jin, 2);
        boutKnockdown(b, 'jin');
      }
      return true;
    }
    const e = typeof actorId === 'object' ? actorId : ENEMIES.find((x) => x.id === actorId) || actorList().find((x) => x.id === actorId && x.enemy);
    if (!e || !e.enemy) return false;
    if (e.enemy.ko) return true;
    const b = C.state.bout;
    if (b && !b.done && b.opponent === e) {
      e.hp = 0; boutKnockdown(b, 'opp');
      e.enemy.getUpAt = 99;
      return true;
    }
    e.hp = 0;
    finishEnemy(e, -e.face, null);
    return true;
  };
  // Release a scripted knockdown (forceDown('jin')) and stand Jin up.
  C.standUp = function () {
    const j = C.jin;
    j.scriptedDown = false; j.ko = false;
    if (j.hp <= 0) j.hp = 1;
    if (j.state === 'down') setJ(j, 'getup');
  };
  C.autoWin = function () {
    refreshEnemies();
    const b = C.state.bout;
    if (b && !b.done) {
      const e = b.opponent;
      if (e && !e.enemy.ko) { cancelEnemyAttack(e, e.enemy); e.hp = 0; e.enemy.ko = true; e.down = true; e.hostile = false; e.enemy.state = 'ko'; emit('enemyDown', { enemy: e }); }
      b.knockdowns.opp = Math.max(1, b.knockdowns.opp);
      finishBout(b, true, 'ko');
    }
    const f = C.state.fight;
    for (const e of ENEMIES.slice()) if (isHostileAwake(e)) { e.hp = 0; finishEnemy(e, -e.face, null); }
    if (f && !f.done) { f.wave = (f.def.waves || []).length - 1; finishFight(f, true); }
    C.jin.locked = false;
    return true;
  };
  // Carry state: slower, no punch/dash/jump/slip; a pressed verb says why.
  C.carry = function (kind, reason) {
    const j = C.jin;
    j.carry = kind || null;
    j.carryReason = kind ? (reason || null) : null;
    if (kind) { j.atk = null; j.dash = null; j.fl = null; if (j.state === 'attack' || j.state === 'dash' || j.state === 'flurry' || j.state === 'slip' || j.state === 'guard') setJ(j, 'idle'); }
    recomputeAllowed();
    return !!j.carry;
  };
  // Drive Jin to x with synthetic input (scripts, tests). Returns a handle with .done.
  C.walkTo = function (x, opts) {
    opts = opts || {};
    const handle = { done: false, wait() { return handle.done; }, result: undefined };
    const a = jinActor();
    if (!a) { handle.done = true; return handle; }
    C.jin.auto = { x, run: opts.run !== false, tol: opts.tol || 3, face: opts.face || 0, at: S.time, timeout: opts.timeout || 30, handle };
    return handle;
  };
  C.isFree = function () { return !!FREE[C.jin.state]; };
  // Data the HUD needs, in one place.
  C.hud = function () {
    const j = C.jin, b = C.state.bout, f = C.state.fight;
    let boss = null;
    for (const e of ENEMIES) if (e.enemy.arch.boss && !e.enemy.fled && !e.removed) { boss = { name: e.name, hp: e.hp, hpMax: e.enemy.hpMax, phase: e.enemy.phase, down: !!e.enemy.ko }; break; }
    return {
      hp: j.hp, hpMax: j.hpMax, breathOn: EB.breath, breath: j.breath, breathMax: j.breathMax, exhausted: j.exhausted,
      charges: j.charges, chargeMax: j.chargeMax, chargeK: j.chargeK, counter: j.counterT > 0, counterK: j.counterT / Math.max(0.01, S.tune.counterWindow),
      inCombat: j.inCombat || !!f || !!b, walkMode: j.walkMode, carry: j.carry,
      fight: f ? { id: f.id, wave: f.wave + 1, waves: (f.def.waves || []).length, enemies: C.enemies().length } : null,
      bout: b ? { id: b.id, round: b.round, rounds: b.rounds, time: b.time, phase: b.phase, count: b.count, countFor: b.countFor,
        knockdowns: Object.assign({}, b.knockdowns), opponent: b.opponent ? { name: b.opponent.name, hp: b.opponent.hp, hpMax: b.opponent.enemy.hpMax } : null } : null,
      boss,
    };
  };

  /* ════════════════════════════════════════════════════════════════════
     RENDERING (world space; the world applies the camera transform)
     ════════════════════════════════════════════════════════════════════ */
  const artOk = (fn) => S.art && typeof S.art[fn] === 'function';
  C.drawUnder = function (ctx) {
    if (S.headless || !ctx) return;
    try {
      for (const f of FX) {
        const k = f.age / f.life;
        if (f.k === 'after') {
          const alpha = 0.45 * (1 - k);
          if (artOk('drawAfterimage')) S.art.drawAfterimage(ctx, f.x, f.y, f.face, f.pose, f.t, f.look, alpha);
          else { ctx.globalAlpha = alpha; ctx.fillStyle = '#7f9ccf'; ctx.fillRect(Math.round(f.x - 5), Math.round(f.y - 40), 10, 40); ctx.globalAlpha = 1; }
        } else if (f.k === 'dust') {
          if (artOk('dust')) S.art.dust(ctx, f.x + f.dir * k * 6, f.y, k);
          else { ctx.globalAlpha = 0.5 * (1 - k); ctx.fillStyle = '#9a9488'; ctx.fillRect(Math.round(f.x + f.dir * k * 6 - 2), Math.round(f.y - 2 - k * 3), 4, 2); ctx.globalAlpha = 1; }
        }
      }
    } catch (err) { S.fail(err, { source: 'combat.drawUnder' }); }
  };
  C.drawOver = function (ctx) {
    if (S.headless || !ctx) return;
    try {
      for (const f of FX) {
        const k = f.age / f.life;
        if (f.k === 'smear') {
          const a = f.follow || f;
          if (artOk('drawSmear')) S.art.drawSmear(ctx, a.x, a.y, a.face, f.kind, k);
          else drawSmearFallback(ctx, a.x, a.y, a.face, f.kind, k);
        } else if (f.k === 'spark') {
          if (artOk('spark')) S.art.spark(ctx, f.x, f.y, k, f.color);
          else drawSparkFallback(ctx, f.x, f.y, k, f.color, f.heavy);
        } else if (f.k === 'slipok') {
          ctx.globalAlpha = 0.85 * (1 - k);
          ctx.fillStyle = '#f4ecd2';
          const x = Math.round(f.x - f.face * (4 + k * 6)), y = Math.round(f.y);
          ctx.fillRect(x - 4, y, 8, 1); ctx.fillRect(x - 2, y + 3, 6, 1);
          ctx.globalAlpha = 1;
        } else if (f.k === 'tell' && f.actor) {
          const e = f.actor;
          if (artOk('spark')) S.art.spark(ctx, e.x, e.y - (e.h || 46) - 6, k, f.red ? '#e0604a' : '#f2c14e');
        }
      }
      for (const e of ENEMIES) drawEnemyMarks(ctx, e);
      drawJinMarks(ctx);
    } catch (err) { S.fail(err, { source: 'combat.drawOver' }); }
  };
  C.render = function (ctx, layer) { if (layer === 'under') C.drawUnder(ctx); else C.drawOver(ctx); };

  // Telegraph: a tiny exclamation at the head (amber = slippable, red = grab/push: dash or jump instead).
  function drawEnemyMarks(ctx, e) {
    const ai = e.enemy;
    if (!ai || e.hidden || ai.fled) return;
    const top = Math.round(e.y - (e.h || 46));
    if (ai.state === 'windup' && ai.atk && !ai.atk.subtle) {
      const red = ai.atk.slippable === false;
      const col = red ? '#e0604a' : '#f2c14e';
      const x = Math.round(e.x), y = top - 9;
      ctx.fillStyle = '#1a1420';
      ctx.fillRect(x - 2, y - 1, 4, 9);
      ctx.fillStyle = col;
      ctx.fillRect(x - 1, y, 2, 4);
      ctx.fillRect(x - 1, y + 5, 2, 2);
      if (ai.tellStrong) { ctx.fillStyle = col; ctx.fillRect(Math.round(e.x - e.face * 4) - 1, top + 9, 3, 1); }   // the shoulder
    }
    if (!ai.arch.boss && !ai.arch.passive && !ai.ko && S.time < ai.showBarUntil && ai.hpMax < 1e8) {
      const w = 16, x = Math.round(e.x - w / 2), y = top - 3;
      ctx.globalAlpha = Math.min(1, (ai.showBarUntil - S.time) / 0.4);
      ctx.fillStyle = '#231b26'; ctx.fillRect(x - 1, y - 1, w + 2, 3);
      ctx.fillStyle = '#d8402f'; ctx.fillRect(x, y, Math.max(0, Math.round(w * e.hp / ai.hpMax)), 1);
      ctx.globalAlpha = 1;
    }
  }
  function drawJinMarks(ctx) {
    const j = C.jin, a = jinActor();
    if (!a) return;
    if (j.counterT > 0) {
      // Counter opportunity: a small gold chevron over Jin's lead shoulder.
      const k = j.counterT / Math.max(0.01, S.tune.counterWindow);
      ctx.globalAlpha = 0.5 + 0.5 * k;
      ctx.fillStyle = '#e8c272';
      const x = Math.round(a.x + a.face * 5), y = Math.round(a.y - S.tune.H - 5);
      ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x - 1, y + 1, 1, 1); ctx.fillRect(x, y + 2, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + 2, y, 1, 1);
      ctx.globalAlpha = 1;
    }
  }
  function drawSmearFallback(ctx, x, y, face, kind, k) {
    const H = S.tune.H;
    ctx.globalAlpha = 0.6 * (1 - k);
    ctx.fillStyle = '#e9e2cf';
    if (kind === 'hook') { for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + face * (6 + i * 3)), Math.round(y - H * 0.7 + Math.abs(i - 2) * 2), 2, 1); }
    else if (kind === 'upper') { for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + face * 10), Math.round(y - H * 0.4 - i * 4), 1, 3); }
    else { const len = kind === 'straight' ? 20 : kind === 'cross' ? 16 : 12; ctx.fillRect(Math.round(face > 0 ? x + 6 : x - 6 - len), Math.round(y - H * 0.7), len, 1); }
    ctx.globalAlpha = 1;
  }
  function drawSparkFallback(ctx, x, y, k, color, heavy) {
    const r = (heavy ? 7 : 4) * (0.4 + k);
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = color || '#fff2d6';
    const xi = Math.round(x), yi = Math.round(y);
    ctx.fillRect(xi - 1, yi - 1, 2, 2);
    ctx.fillRect(Math.round(xi - r), yi, 2, 1); ctx.fillRect(Math.round(xi + r - 1), yi, 2, 1);
    ctx.fillRect(xi, Math.round(yi - r), 1, 2); ctx.fillRect(xi, Math.round(yi + r - 1), 1, 2);
    ctx.globalAlpha = 1;
  }
  // Heavy bag: chain, worn leather, tape bands; sways from its anchor.
  function drawBag(ctx, e) {
    if (S.headless || !ctx) return;
    const ai = e.enemy, sw = ai ? ai.swing : 0;
    const x = Math.round(e.x), top = Math.round(e.y - 44), anchor = top - 18;
    ctx.fillStyle = '#5d6266';
    for (let y = anchor; y < top; y += 3) ctx.fillRect(Math.round(x + sw * (y - anchor) * 0.5), y, 1, 2);
    for (let i = 0; i < 30; i++) {
      const off = Math.round(sw * (18 + i) * 0.5);
      const shade = i < 3 || i > 26 ? '#3e1d1a' : '#5a2a24';
      ctx.fillStyle = shade; ctx.fillRect(x - 6 + off, top + i, 12, 1);
      ctx.fillStyle = '#6f362e'; ctx.fillRect(x - 6 + off, top + i, 3, 1);
      ctx.fillStyle = '#2f1614'; ctx.fillRect(x + 5 + off, top + i, 1, 1);
      if (i === 8 || i === 21) { ctx.fillStyle = '#9c917c'; ctx.fillRect(x - 6 + off, top + i, 12, 2); }
    }
    if (ai && ai.hurtT > 0) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff2d6'; ctx.fillRect(x - 6 + Math.round(sw * 30), top + 10, 12, 8); ctx.globalAlpha = 1; }
  }
  // Wooden training dummy: post, padded torso, round head.
  function drawDummy(ctx, e) {
    if (S.headless || !ctx) return;
    const ai = e.enemy, wob = ai ? Math.round(ai.swing * 6) : 0;
    const x = Math.round(e.x), y = Math.round(e.y);
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 6, y - 2, 12, 2);
    ctx.fillStyle = '#5a4632'; ctx.fillRect(x - 1, y - 22, 3, 20);
    ctx.fillStyle = (ai && ai.hurtT > 0) ? '#a08a66' : '#7b6a4f'; ctx.fillRect(x - 6 + wob, y - 38, 12, 16);
    ctx.fillStyle = '#625440'; ctx.fillRect(x - 6 + wob, y - 38, 2, 16);
    ctx.fillStyle = '#8c7b5c'; ctx.fillRect(x - 4 + wob, y - 45, 8, 7);
    ctx.fillStyle = '#6e5f47'; ctx.fillRect(x - 4 + wob, y - 39, 8, 1);
  }

  // First sync (G may already be loaded when this file runs).
  syncFromG();
  recomputeAllowed();
})(window.STORY);
