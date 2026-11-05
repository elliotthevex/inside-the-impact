/* Street Fight 3D: the rules of the fight.
   Pure logic: no THREE, no DOM, no clock of its own. Same seed and same inputs give the same fight. Fixed step 1/120.
   Units are metres and seconds, origin at the ring centre. Same axes as the rig: yaw 0 faces +Z and his left is +X,
   so forward is (sin yaw, cos yaw) and his left is (cos yaw, -sin yaw).

   Use:   const m = createMatch({ seed, names: { p: 'YOU', o: 'RIVAL' } });
          each frame:  m.step(dt, inputP, inputO);  for (const e of m.events) dispatch(e);  m.events.length = 0;
   Input: { mx, mz, guard, punch, slip, getUp }. mx,mz is world move, length <= 1 (longer is normalised).
          punch is one shot: pass the kind only on the frame it was pressed. It is held for .15 s, so a press just before a
          recovery ends still comes out. slip and getUp are counted on their rising edge, so hold or tap are both safe.
   Event: { type, who, t, ... }.  who is the puncher for throw, whiff, hit, block, slipped; the fighter it happens to for
          stagger, knockdown, count, getup, ko, tko, stopped, step, rope; the winner (or null) for round_end and decision.
          Punch events also carry kind, tgt 'head'|'body', power 0..1, dir [x,z] (direction of the force), blocked, counter.
          hit and block also carry dmg, clean, interrupted. count carries n (1..10). round_end carries score [p,o].
          Beyond the contract list: 'rope' { who, power, dir } when a fighter meets the ropes hard enough to move them. */

export const STEP = 1 / 120;

/* Largest centre-to-centre distance at which each punch touches. The rig measures the true values: pass them to setReach. */
export const REACH = { jab: 1.12, cross: 1.15, hook: .98, upper: .88, bodyL: 1.02, bodyR: 1.02 };

/* Ring geometry. half is the rope line. A fighter's centre stops at limit, may sink give further into the ropes and springs back. */
export const RING = { half: 3.0, bodyR: .30, give: .10, minSep: .72 };

/* setReach({ jab, cross, hook, upper, bodyL, bodyR, minSep }): override any of them, e.g. with what the rig measured. Body sets both body shots. */
export function setReach(t = {}) {
  for (const k of Object.keys(REACH)) if (Number.isFinite(t[k])) REACH[k] = t[k];
  if (Number.isFinite(t.body)) REACH.bodyL = REACH.bodyR = t.body;
  if (Number.isFinite(t.minSep)) RING.minSep = t.minSep;
  return REACH;
}

/* start, active, rec: the three windows in seconds. head is the hidden load a clean contact adds. drain comes off the target's stamina.
   arc is the cosine of the widest angle off his facing that still connects. hand is which glove the rig should send (orthodox stance).
   stun is how long the target cannot start a punch. knock is the target's shove in m/s. sweep turns the force toward his right (+) for a hook. */
export const PUNCHES = {
  jab:   { start: .12, active: .05, rec: .14, dmg: 1.2, head: .35, sta: 5,  drain: 0,  tgt: 'head', hand: 'L', arc: .80, power: .28, stun: .09, knock: .55, sweep: 0 },
  cross: { start: .18, active: .05, rec: .24, dmg: 2.7, head: 1.15, sta: 11, drain: 0,  tgt: 'head', hand: 'R', arc: .80, power: .60, stun: .16, knock: 1.25, sweep: 0 },
  hook:  { start: .24, active: .06, rec: .28, dmg: 3.6, head: 1.9, sta: 14, drain: 0,  tgt: 'head', hand: 'L', arc: .55, power: .85, stun: .24, knock: 1.1, sweep: 1, heavy: true, staggers: true },
  upper: { start: .22, active: .05, rec: .30, dmg: 3.8, head: 1.55, sta: 14, drain: 0,  tgt: 'head', hand: 'R', arc: .72, power: .85, stun: .22, knock: .9, sweep: 0, heavy: true },
  bodyL: { start: .20, active: .05, rec: .24, dmg: 2.1, head: 0,   sta: 10, drain: 12, tgt: 'body', hand: 'L', arc: .72, power: .50, stun: .14, knock: .85, sweep: .35 },
  bodyR: { start: .24, active: .05, rec: .28, dmg: 2.5, head: 0,   sta: 12, drain: 14, tgt: 'body', hand: 'R', arc: .72, power: .60, stun: .18, knock: 1.0, sweep: -.35 },
};
const CHAIN_FROM_JAB = { cross: 1, hook: 1, bodyL: 1, bodyR: 1 };

/* Hidden head load. Rises only from head contact. warn: late guard, slower turning. bad: hands drift low, sway, long blinks (rig). stop: referee. */
export const HEAD = { warn: 7, bad: 13, stop: 20, shed: .05 };

export const TUNE = {
  speed: 2.4, accel: 15, backSpeed: .86, guardMove: .55,
  turn: 9, buffer: .15,
  guardUp: 1 / .09, guardDown: 1 / .14, blockAt: .5, guardHead: .8, guardLoad: .85, guardBody: .1,
  guardDrain: 6, regen: 14, regenLock: .4, lowSta: 25, tiredSlow: 1.2, tiredDmg: .75,
  counter: 1.5,
  armor: .55, stunImm: .4, stunImmScale: .4, stagger: .5, staggerCd: 2.5,
  slip: { dur: .3, sta: 14, from: .04, to: .22, cd: .35, speed: 1.1, push: .2, whiffRec: .06 },
  knockDecay: 7, rebound: .55, ropeSpring: 8,
  hurtHp: 25, kdBase: .32, kdRamp: .04, kdAgain: .25,
  intro: 2.4, walk: 1.6, breakWalk: 1.6, getUpTime: 1.2, minDown: 1.1,
  count: 1, upHp: [45, 30, 18], breakHp: 18, breakHead: 1,
  mashBase: 5, mashPerKd: 5, mashPerHead: .45, mashKoBonus: 3, mashDecay: 1, mashDecayHead: .08,
  neutral: 2.2,
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const AXES = ['x', 'z'];

export function makeRng(seed = 1) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function makeFighter(id, name, corner, x, z) {
  return {
    /* contract */
    id, name, corner, x, z, vx: 0, vz: 0, yaw: 0, hp: 100, maxHp: 100, sta: 100, maxSta: 100, head: 0, guard: 0,
    punch: null,        /* { kind, t, dur, contact, active, phase: 'startup'|'active'|'recovery', hit, blocked, result, tired } */
    stun: 0,            /* seconds left unable to start a punch */
    slip: 0,            /* seconds left of a slip, 0 when not slipping. See slipT, slipDir */
    down: null,         /* { t, count, n, mash, need, up 0..1, rising: null|seconds, cause } */
    knock: { x: 0, z: 0 }, landed: 0, taken: 0, clean: 0, fat: 0,
    /* extra, safe to read from the view */
    stagger: 0, slipT: 0, slipDir: [0, 0], guarding: false, onRope: false, kd: 0, kdTotal: 0, wins: 0, dealt: 0, dealtTotal: 0, thrown: 0,
    /* private */
    slipCd: 0, armor: 0, stunImm: 0, staggerCd: 0, staLock: 0, _stepAcc: 0, _ropeCd: 0,
    _i: { mx: 0, mz: 0, guard: false, punch: null, punchAge: 0, slipReq: false, slipAge: 0, slipHeld: false, upHeld: false, ups: 0 },
  };
}

class Match {
  constructor(o = {}) {
    this.seed = o.seed ?? 1; this.rng = makeRng(this.seed);
    this.rounds = o.rounds ?? 3; this.roundTime = o.roundTime ?? 60; this.breakTime = o.breakTime ?? 8;
    const half = o.ringHalf ?? RING.half;
    this.ring = { half, limit: half - RING.bodyR, give: RING.give, minSep: o.minSep ?? RING.minSep };
    const c = half - .55;
    this.corners = o.corners ?? { blue: [-c, -c], red: [c, c] };
    this.marks = o.marks ?? { blue: [-1.2, 0], red: [1.2, 0] };
    const names = o.names ?? {};
    this.p = makeFighter('p', names.p ?? 'YOU', 'blue', this.corners.blue[0], this.corners.blue[1]);
    this.o = makeFighter('o', names.o ?? 'RIVAL', 'red', this.corners.red[0], this.corners.red[1]);
    this.p.yaw = Math.atan2(-this.p.x, -this.p.z); this.o.yaw = Math.atan2(-this.o.x, -this.o.z);
    this.state = 'intro'; this.stateT = 0; this.round = 0; this.clock = this.roundTime; this.time = 0;
    this.events = []; this.result = null; this.scores = []; this.downed = null;
    this._acc = 0;
    this._startRound();
  }

  /* dt can be anything: the rules always advance in steps of 1/120 and the remainder carries over. */
  step(dt, inputP, inputO) {
    this._ingest(this.p, inputP); this._ingest(this.o, inputO);
    this._acc += dt;
    while (this._acc >= STEP - 1e-9) { this._acc -= STEP; this._tick(); }
  }

  _ingest(f, inp) {
    const I = f._i;
    if (!inp) { I.mx = I.mz = 0; I.guard = false; I.slipHeld = false; I.upHeld = false; return; }
    let mx = inp.mx || 0, mz = inp.mz || 0; const l = Math.hypot(mx, mz);
    if (l > 1) { mx /= l; mz /= l; }
    I.mx = mx; I.mz = mz; I.guard = !!inp.guard;
    if (inp.punch && PUNCHES[inp.punch]) { I.punch = inp.punch; I.punchAge = 0; }
    if (inp.slip && !I.slipHeld) { I.slipReq = true; I.slipAge = 0; }
    I.slipHeld = !!inp.slip;
    if (inp.getUp && !I.upHeld) I.ups++;
    I.upHeld = !!inp.getUp;
  }

  _emit(type, fields) {
    const e = fields ? fields : {};
    e.type = type; e.t = this.time;
    if (this.events.length > 4000) this.events.splice(0, 2000); /* a view that never clears must not leak */
    this.events.push(e);
    return e;
  }

  _tick() {
    this.time += STEP; this.stateT += STEP;
    const { p, o } = this;
    switch (this.state) {
      case 'fight': this._tickFight(); break;
      case 'down': this._tickDown(); break;
      case 'intro': this._tickIntro(); break;
      case 'break': this._tickBreak(); break;
      default: this._tickOver();
    }
    this._vitals(p); this._vitals(o);
    this._separate();
  }

  /* ---------- states ---------- */
  _startRound() {
    this.round++; this.state = 'intro'; this.stateT = 0; this.clock = this.roundTime;
    for (const f of [this.p, this.o]) { f.kd = 0; f.dealt = 0; f.punch = null; f._i.punch = null; f._i.slipReq = false; f.stun = 0; f.stagger = 0; f.slip = 0; }
    this._emit('round_start', { who: null, round: this.round });
  }

  _tickIntro() {
    for (const f of [this.p, this.o]) {
      const g = f === this.p ? this.o : this.p, mk = this.marks[f.corner];
      this._walkTo(f, mk[0], mk[1], TUNE.walk, g);
    }
    if (this.stateT >= TUNE.intro) { this.state = 'fight'; this.stateT = 0; this._emit('bell', { who: null }); this._emit('fight', { who: null, round: this.round }); }
  }

  _tickBreak() {
    this.clock = Math.max(0, this.breakTime - this.stateT);
    for (const f of [this.p, this.o]) {
      const cn = this.corners[f.corner];
      this._walkTo(f, cn[0], cn[1], TUNE.breakWalk, null);
      const k = STEP / this.breakTime;
      f.hp = Math.min(f.maxHp, f.hp + TUNE.breakHp * k);
      f.head = Math.max(0, f.head - TUNE.breakHead * k);
      f.sta = Math.min(f.maxSta, f.sta + f.maxSta * k * 1.5);
      f.fat = Math.max(0, f.fat - .12 * k);
    }
    if (this.stateT >= this.breakTime) this._startRound();
  }

  _tickOver() {
    for (const f of [this.p, this.o]) {
      if (f.punch) this._advance(f, null);
      if (!f.down) this._move(f, 0, 0);
      else this._countDownOnly(f);
    }
  }

  _tickFight() {
    const { p, o } = this;
    this._control(p, o); this._control(o, p);
    this._separate();
    /* A punch that connects can end the state, so resolve in a fair order and stop if it did. */
    const first = (p.punch && o.punch && p.punch.t + STEP >= p.punch.contact && o.punch.t + STEP >= o.punch.contact && this.rng() < .5) ? o : p;
    const second = first === p ? o : p;
    if (first.punch) this._advance(first, second);
    if (second.punch) this._advance(second, this.state === 'fight' ? first : null);
    if (this.state !== 'fight') return;
    this.clock -= STEP;
    if (this.clock <= 0) { this.clock = 0; this._endRound(); }
  }

  _tickDown() {
    const f = this.downed, g = f === this.p ? this.o : this.p;
    if (g.punch) this._advance(g, null);
    if (f.punch) f.punch = null;
    /* the other man goes to a neutral distance */
    const dx = g.x - f.x, dz = g.z - f.z, d = Math.hypot(dx, dz) || 1;
    if (d < TUNE.neutral) {
      let tx = g.x + (dx / d) * .5, tz = g.z + (dz / d) * .5; const L = this.ring.limit - .25;
      tx = clamp(tx, -L, L); tz = clamp(tz, -L, L);
      if (Math.abs(tx - g.x) + Math.abs(tz - g.z) < .05) { tx = g.x + (dz / d) * .5 * (g.x * dz - g.z * dx > 0 ? -1 : 1); tz = g.z - (dx / d) * .5 * (g.x * dz - g.z * dx > 0 ? -1 : 1); tx = clamp(tx, -L, L); tz = clamp(tz, -L, L); }
      this._walkTo(g, tx, tz, TUNE.walk, f);
    } else { this._move(g, 0, 0); this._turn(g, f); }
    this._turn(f, g);
    this._move(f, 0, 0);
    const d0 = f.down, I = f._i;
    d0.t += STEP;
    if (d0.rising != null) {
      d0.rising += STEP;
      if (d0.rising >= TUNE.getUpTime) {
        f.down = null; this.downed = null; this.state = 'fight'; this.stateT = 0;
        f.armor = Math.max(f.armor, .6);
        this._emit('fight', { who: null, round: this.round, resumed: true });
      }
      return;
    }
    const n = Math.floor(d0.t / TUNE.count);
    if (n > d0.count) {
      d0.count = n; this._emit('count', { who: f.id, n });
      if (n >= 10) { this._emit('ko', { who: f.id }); this._finish('ko', g); return; }
    }
    const decay = TUNE.mashDecay + TUNE.mashDecayHead * f.head;
    d0.mash = Math.max(0, d0.mash + I.ups - decay * STEP); I.ups = 0;
    d0.up = clamp(d0.mash / d0.need, 0, 1);
    if (d0.mash >= d0.need && d0.t >= TUNE.minDown) {
      d0.rising = 0;
      const hp = TUNE.upHp[Math.min(f.kdTotal, TUNE.upHp.length) - 1];
      if (f.hp < hp) f.hp = hp;
      this._emit('getup', { who: f.id, n: d0.n, hp: f.hp });
    }
  }

  _countDownOnly(f) { const d = f.down; if (d) d.t += STEP; }

  _endRound() {
    const { p, o } = this;
    for (const f of [p, o]) { f.punch = null; f._i.punch = null; f.slip = 0; }
    let sp = 10, so = 10;
    const kdDiff = p.kd - o.kd;
    if (kdDiff > 0) so = 10, sp = Math.max(7, 9 - kdDiff);
    else if (kdDiff < 0) sp = 10, so = Math.max(7, 9 + kdDiff);
    else if (p.dealt > o.dealt + 1e-6) so = 9;
    else if (o.dealt > p.dealt + 1e-6) sp = 9;
    this.scores.push([sp, so]);
    if (sp > so) p.wins++; else if (so > sp) o.wins++;
    this._emit('bell', { who: null });
    this._emit('round_end', { who: sp > so ? 'p' : so > sp ? 'o' : null, round: this.round, score: [sp, so] });
    if (this.round >= this.rounds) { this._decide(); return; }
    this.state = 'break'; this.stateT = 0; this.clock = this.breakTime;
  }

  _decide() {
    const { p, o } = this;
    const tp = this.scores.reduce((a, s) => a + s[0], 0), to = this.scores.reduce((a, s) => a + s[1], 0);
    let w = null;
    if (tp > to) w = p; else if (to > tp) w = o;
    else if (p.dealtTotal > o.dealtTotal + 1e-6) w = p; else if (o.dealtTotal > p.dealtTotal + 1e-6) w = o;
    this._emit('decision', { who: w ? w.id : null, totals: [tp, to] });
    this._finish('decision', w, [tp, to]);
  }

  _finish(how, winner, totals) {
    const { p, o } = this; const loser = winner ? (winner === p ? o : p) : null;
    if (how !== 'decision') this._emit('bell', { who: null });
    this.state = 'over'; this.stateT = 0;
    for (const f of [p, o]) { f.stun = 0; f._i.punch = null; f._i.slipReq = false; }
    const tot = totals ?? [this.scores.reduce((a, s) => a + s[0], 0), this.scores.reduce((a, s) => a + s[1], 0)];
    this.result = {
      winner: winner ? winner.id : null, loser: loser ? loser.id : null, how, round: this.round, clock: this.clock, time: this.time,
      scores: this.scores.slice(), totals: tot, wins: [p.wins, o.wins], loserHp: loser ? loser.hp : null,
      /* the honest report line for the end screen: `you took pClean clean to the head · he took oClean` */
      pClean: p.clean, oClean: o.clean, pHead: p.head, oHead: o.head,
    };
  }

  /* ---------- control ---------- */
  _control(f, g) {
    const I = f._i;
    I.punchAge += STEP; if (I.punchAge > TUNE.buffer) I.punch = null;
    I.slipAge += STEP; if (I.slipAge > TUNE.buffer) I.slipReq = false;
    const S = TUNE.slip;

    if (I.slipReq && !f.punch && f.stun <= 0 && f.slip <= 0 && f.slipCd <= 0 && f.sta >= S.sta) {
      I.slipReq = false;
      f.sta -= S.sta; f.staLock = Math.max(f.staLock, TUNE.regenLock); f.fat = Math.min(1, f.fat + S.sta / 800);
      f.slip = S.dur; f.slipT = 0; f.slipCd = S.dur + S.cd;
      let dx = I.mx, dz = I.mz, l = Math.hypot(dx, dz);
      if (l < .2) { /* no direction held: lean to his right, off the line */
        dx = -Math.cos(f.yaw); dz = Math.sin(f.yaw); l = 1;
      }
      f.slipDir[0] = dx / l; f.slipDir[1] = dz / l;
    }

    if (I.punch && f.stun <= 0) {
      const inEvade = f.slip > 0 && f.slipT < S.to;
      if (!inEvade) {
        const pu = f.punch;
        if (!pu) this._throw(f, g, I.punch);
        else if (pu.kind === 'jab' && pu.hit && pu.phase === 'recovery' && CHAIN_FROM_JAB[I.punch]) this._throw(f, g, I.punch);
      }
    }

    /* guard */
    const wants = I.guard && !f.punch && f.stagger <= 0 && f.slip <= 0;
    f.guarding = wants;
    const staCap = f.sta >= TUNE.lowSta ? 1 : .35 + .65 * (f.sta / TUNE.lowSta);
    const headCap = f.head >= HEAD.bad ? .85 - .25 * clamp((f.head - HEAD.bad) / (HEAD.stop - HEAD.bad), 0, 1) : 1;
    const target = wants ? Math.min(staCap, headCap) : 0;
    let up = TUNE.guardUp;
    if (f.head >= HEAD.bad) up *= .4; else if (f.head >= HEAD.warn) up *= .6;
    f.guard = target > f.guard ? Math.min(target, f.guard + up * STEP) : Math.max(target, f.guard - TUNE.guardDown * STEP);
    if (wants) f.sta = Math.max(0, f.sta - TUNE.guardDrain * STEP);

    /* feet */
    if (f.slip > 0) {
      const v = f.slipT < S.to ? S.speed : 0;
      this._move(f, f.slipDir[0] * v, f.slipDir[1] * v, true);
    } else if (f.stagger > 0) {
      this._move(f, 0, 0);
    } else {
      let sp = TUNE.speed;
      if (f.guard > .3 || wants) sp *= TUNE.guardMove;
      if (f.punch) sp *= f.punch.phase === 'startup' ? .6 : f.punch.phase === 'active' ? .25 : .4;
      if (f.stun > 0) sp *= .3;
      if (f.sta < TUNE.lowSta) sp *= .85;
      if (f.head >= HEAD.bad) sp *= .9;
      let vx = I.mx * sp, vz = I.mz * sp;
      const fx = Math.sin(f.yaw), fz = Math.cos(f.yaw), fwd = vx * fx + vz * fz;
      if (fwd < 0) { const cut = fwd * (1 - TUNE.backSpeed); vx -= fx * cut; vz -= fz * cut; }
      this._move(f, vx, vz);
    }
    this._turn(f, g);
  }

  _turn(f, g) {
    let rate = TUNE.turn;
    if (f.sta < TUNE.lowSta) rate *= .65;
    if (f.head >= HEAD.bad) rate *= .6; else if (f.head >= HEAD.warn) rate *= .75;
    if (f.punch && f.punch.phase !== 'startup') rate *= .35;
    if (f.stun > 0) rate *= .3;
    this._faceToward(f, Math.atan2(g.x - f.x, g.z - f.z), rate);
  }

  _faceToward(f, want, rate) {
    let d = want - f.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const m = rate * STEP;
    f.yaw += d > m ? m : d < -m ? -m : d;
    if (f.yaw > Math.PI) f.yaw -= Math.PI * 2; else if (f.yaw < -Math.PI) f.yaw += Math.PI * 2;
  }

  _move(f, tvx, tvz, instant) {
    const a = TUNE.accel * STEP * (instant ? 4 : 1);
    let dvx = tvx - f.vx, dvz = tvz - f.vz; const d = Math.hypot(dvx, dvz);
    if (d > a) { dvx *= a / d; dvz *= a / d; }
    f.vx += dvx; f.vz += dvz;
    const k = f.knock; f.x += (f.vx + k.x) * STEP; f.z += (f.vz + k.z) * STEP;
    const dec = Math.exp(-TUNE.knockDecay * STEP); k.x *= dec; k.z *= dec;
    const sp = Math.hypot(f.vx, f.vz);
    f._stepAcc += sp * STEP;
    if (f._stepAcc >= .42) { f._stepAcc = 0; this._emit('step', { who: f.id, power: clamp(sp / TUNE.speed, 0, 1) }); }
  }

  /* Walk to a spot outside the fight. Faces where he walks until he is nearly there, then the opponent (or the ring centre). */
  _walkTo(f, tx, tz, speed, faceFoe) {
    const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
    if (d > .06) {
      const v = Math.min(speed, d * 5);
      this._move(f, (dx / d) * v, (dz / d) * v);
      if (d > .6) this._faceToward(f, Math.atan2(dx, dz), 6);
      else if (faceFoe) this._turn(f, faceFoe);
      else this._faceToward(f, Math.atan2(-f.x, -f.z), 6);
    } else {
      this._move(f, 0, 0);
      if (faceFoe) this._turn(f, faceFoe); else this._faceToward(f, Math.atan2(-f.x, -f.z), 6);
    }
  }

  /* ---------- punches ---------- */
  _throw(f, g, kind) {
    const P = PUNCHES[kind], I = f._i;
    if (f.sta < P.sta) return;                 /* arms gone: the press is held for the buffer, then dropped */
    I.punch = null; f.slip = 0;
    const tired = f.sta < TUNE.lowSta, k = tired ? TUNE.tiredSlow : 1;
    f.sta = Math.max(0, f.sta - P.sta); f.staLock = Math.max(f.staLock, TUNE.regenLock); f.fat = Math.min(1, f.fat + P.sta / 800);
    f.thrown++;
    f.punch = { kind, t: 0, dur: (P.start + P.active + P.rec) * k, contact: P.start * k, active: P.active * k, phase: 'startup', hit: false, blocked: false, result: null, tired, id: f.thrown };
    this._emit('throw', { who: f.id, kind, tgt: P.tgt, power: P.power, dir: [Math.sin(f.yaw), Math.cos(f.yaw)], hand: P.hand });
  }

  /* Move one punch on one step. g is null when it can no longer connect (round over, man down). */
  _advance(f, g) {
    const pu = f.punch, prev = pu.t;
    pu.t += STEP;
    if (prev < pu.contact && pu.t >= pu.contact) pu.t = pu.contact;  /* contact lands exactly on t == contact for the rig */
    if (pu.t >= pu.contact && pu.phase === 'startup') pu.phase = 'active';
    if (pu.phase === 'active') {
      if (!pu.result) {
        if (g) this._tryContact(f, g, pu);
        if (!pu.result && pu.t >= pu.contact + pu.active) { pu.result = 'whiff'; if (g) this._emit('whiff', { who: f.id, kind: pu.kind, tgt: PUNCHES[pu.kind].tgt, power: PUNCHES[pu.kind].power, dir: [Math.sin(f.yaw), Math.cos(f.yaw)] }); }
      }
      if (pu.t >= pu.contact + pu.active && f.punch === pu) pu.phase = 'recovery';
    }
    if (pu.t >= pu.dur && f.punch === pu) f.punch = null;
  }

  _tryContact(a, g, pu) {
    const P = PUNCHES[pu.kind];
    let dx = g.x - a.x, dz = g.z - a.z; const d = Math.hypot(dx, dz) || 1e-3;
    if (d > REACH[pu.kind]) return;
    dx /= d; dz /= d;
    const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw);
    if (dx * fx + dz * fz < P.arc) return;
    const S = TUNE.slip;
    if (P.tgt === 'head' && g.slip > 0 && g.slipT >= S.from && g.slipT <= S.to) {
      pu.result = 'slip'; pu.dur += S.whiffRec;
      this._emit('slipped', { who: a.id, def: g.id, kind: pu.kind, tgt: P.tgt, power: P.power, dir: [fx, fz] });
      return;
    }
    this._land(a, g, pu, P, dx, dz);
  }

  _land(a, g, pu, P, dx, dz) {
    const T = TUNE, head = P.tgt === 'head', gv = g.guard, tp = g.punch;
    const counter = !!tp && tp.phase !== 'active';
    let dmg = P.dmg * (pu.tired ? T.tiredDmg : 1), load = P.head;
    if (counter) { dmg *= T.counter; load *= T.counter; }
    let blocked = false;
    if (head) { blocked = gv >= T.blockAt; dmg *= 1 - T.guardHead * gv; load *= 1 - T.guardLoad * gv; } else dmg *= 1 - T.guardBody * gv;
    const clean = head && !blocked;

    g.hp = Math.max(0, g.hp - dmg); g.head += load;
    a.dealt += dmg; a.dealtTotal += dmg;
    if (P.drain) g.sta = Math.max(0, g.sta - P.drain * (1 - T.guardBody * gv));
    if (!blocked) { a.landed++; g.taken++; }
    if (clean) g.clean++;
    pu.hit = true; pu.blocked = blocked; pu.result = blocked ? 'block' : 'hit';

    /* force direction: forward, a hook sweeps across toward the puncher's right */
    const fx = dx, fz = dz, rx = -Math.cos(a.yaw), rz = Math.sin(a.yaw), sw = P.sweep;
    let fdx = fx + rx * sw, fdz = fz + rz * sw; const fl = Math.hypot(fdx, fdz) || 1; fdx /= fl; fdz /= fl;
    const kn = P.knock * (blocked ? .6 : 1) * (counter ? 1.15 : 1);
    g.knock.x += dx * kn; g.knock.z += dz * kn;
    if (blocked) { a.knock.x -= dx * .25; a.knock.z -= dz * .25; }

    /* being hit interrupts a punch in startup, then a short immunity so one jab cannot stun-lock */
    let interrupted = false;
    if (tp && tp.phase === 'startup' && !blocked && g.armor <= 0) { g.punch = null; g.armor = T.armor; interrupted = true; }
    let st = P.stun * (blocked ? .5 : 1);
    if (g.stunImm > 0) st *= T.stunImmScale;
    g.stun = Math.max(g.stun, st); g.stunImm = T.stunImm;

    const power = clamp(P.power * (blocked ? .45 : 1) * (counter ? 1.2 : 1), 0, 1);
    this._emit(blocked ? 'block' : 'hit', { who: a.id, def: g.id, kind: pu.kind, tgt: P.tgt, power, dir: [fdx, fdz], blocked, counter, clean, interrupted, dmg });

    if (P.staggers && clean && g.staggerCd <= 0) {
      g.stagger = T.stagger; g.staggerCd = T.staggerCd; g.stun = Math.max(g.stun, T.stagger);
      this._emit('stagger', { who: g.id, kind: pu.kind, power, dir: [fdx, fdz] });
    }

    if (g.head >= HEAD.stop) { this._emit('stopped', { who: g.id, hp: g.hp }); this._finish('stopped', a); return; }
    if (g.hp <= 0) { this._knockdown(g, a, pu.kind, power, fdx, fdz, 'hp'); return; }
    if (clean && (P.heavy || (counter && pu.kind === 'cross')) && (g.head >= HEAD.bad || g.hp <= T.hurtHp || g.kd > 0)) {
      const c = T.kdBase + T.kdRamp * Math.max(0, g.head - HEAD.bad) + (g.kd > 0 ? T.kdAgain : 0);
      if (this.rng() < c) this._knockdown(g, a, pu.kind, power, fdx, fdz, 'heavy');
    }
  }

  _knockdown(g, a, kind, power, dx, dz, cause) {
    const T = TUNE;
    g.kd++; g.kdTotal++; g.punch = null; g.stun = 0; g.stagger = 0; g.slip = 0; g.guard = 0;
    const need = T.mashBase + T.mashPerKd * (g.kdTotal - 1) + T.mashPerHead * g.head + (g.hp <= 0 ? T.mashKoBonus : 0);
    g.down = { t: 0, count: 0, n: g.kd, mash: 0, need, up: 0, rising: null, cause };
    g._i.ups = 0;
    this._emit('knockdown', { who: g.id, by: a.id, kind, power, dir: [dx, dz], n: g.kd, cause });
    if (g.kd >= 3) { this._emit('tko', { who: g.id }); this._finish('tko', a); return; }
    this.state = 'down'; this.stateT = 0; this.downed = g;
  }

  /* ---------- upkeep ---------- */
  _vitals(f) {
    const T = TUNE;
    if (f.stun > 0) f.stun = Math.max(0, f.stun - STEP);
    if (f.stagger > 0) f.stagger = Math.max(0, f.stagger - STEP);
    if (f.armor > 0) f.armor -= STEP;
    if (f.stunImm > 0) f.stunImm -= STEP;
    if (f.slipCd > 0) f.slipCd -= STEP;
    if (f.staggerCd > 0) f.staggerCd -= STEP;
    if (f.staLock > 0) f.staLock -= STEP;
    if (f._ropeCd > 0) f._ropeCd -= STEP;
    if (f.slip > 0) { f.slip = Math.max(0, f.slip - STEP); f.slipT += STEP; }
    if (this.state !== 'over') {
      if (f.head > 0) f.head = Math.max(0, f.head - HEAD.shed * STEP);
      if (f.staLock <= 0 && !f.guarding && this.state !== 'break') f.sta = Math.min(f.maxSta, f.sta + T.regen * STEP);
      f.fat = Math.max(0, f.fat - .004 * STEP);
    }
    if (this.state !== 'fight') f.guarding = false;
    if (this.state !== 'fight' && f.guard > 0) f.guard = Math.max(0, f.guard - T.guardDown * STEP);
  }

  /* Bodies never overlap and ropes hold. Rope contact takes the shove back out through the other man if he is pressing. */
  _separate() {
    const { p, o } = this, M = this.ring.minSep;
    for (let i = 0; i < 4; i++) {
      this._ropes(p); this._ropes(o);
      let dx = o.x - p.x, dz = o.z - p.z; const d = Math.hypot(dx, dz);
      if (d >= M) break;
      let over;
      if (d < 1e-4) { dx = 1; dz = 0; over = M; } else { dx /= d; dz /= d; over = M - d; }
      let wp = p.down ? 0 : p.onRope && !o.onRope ? .15 : .5, wo = o.down ? 0 : o.onRope && !p.onRope ? .15 : .5;
      const w = wp + wo || 1; wp /= w; wo /= w;
      p.x -= dx * over * wp; p.z -= dz * over * wp;
      o.x += dx * over * wo; o.z += dz * over * wo;
      const rel = (o.vx - p.vx) * dx + (o.vz - p.vz) * dz;
      if (rel < 0) { p.vx += dx * rel * wp; p.vz += dz * rel * wp; o.vx -= dx * rel * wo; o.vz -= dz * rel * wo; }
    }
  }

  _ropes(f) {
    const L = this.ring.limit, G = this.ring.give; let on = false;
    for (let i = 0; i < 2; i++) {
      const ax = AXES[i], c = f[ax], s = c > 0 ? 1 : -1, over = Math.abs(c) - L;
      if (over <= 0) continue;
      on = true;
      const v = i === 0 ? 'vx' : 'vz', out = (f[v] + f.knock[ax]) * s;
      if (out > 0) {
        if (out > .7 && f._ropeCd <= 0) { this._emit('rope', { who: f.id, power: clamp(out / 3, 0, 1), dir: i === 0 ? [s, 0] : [0, s] }); f._ropeCd = .35; }
        if (f.knock[ax] * s > 0) f.knock[ax] *= -TUNE.rebound;
        if (f[v] * s > 0) f[v] = 0;
      }
      f[ax] = s * (L + Math.min(over, G) * (1 - TUNE.ropeSpring * STEP));
    }
    f.onRope = on;
  }
}

export function createMatch(opts) { return new Match(opts); }
