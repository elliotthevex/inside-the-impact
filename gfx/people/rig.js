/* FighterRig: turns sim state into a body. It reads sim state and events and writes only bones and face morphs.

   Upper body from mocap (a stance loop and punch clips time-warped so the arm is out at exactly punch.contact). Lower body
   from a planter: every foot is a fixed point on the canvas until it takes a real step, and two-bone IK does the rest, so
   a planted foot cannot skate. Arm IK sends the glove's knuckles to the opponent's actual head or ribs at contact.

     const rigP = new FighterRig(fighterP, clips, { who: 'p', floorY: canvasY });
     const rigO = new FighterRig(fighterO, clips, { who: 'o', floorY: canvasY });
     FighterRig.pair(rigP, rigO);
     each frame, before match.events is cleared:  FighterRig.updateBoth(rigP, rigO, match, dt);

   Getters are world positions: headWorld(), chestWorld(), gloveWorld('L'|'R'), knuckleWorld('L'|'R'). Each returns a shared Vector3 per getter: copy it to keep it. */
import * as THREE from 'three';

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const UP = new THREE.Vector3(0, 1, 0);
const wq = (b, q) => q.setFromRotationMatrix(b.matrixWorld);
const wp = (b, v) => v.setFromMatrixPosition(b.matrixWorld);

/* kind -> clip, hand, what it aims at. The hand matches PUNCHES in sim.js. */
export const PUNCH_DEF = {
  jab: { clip: 'jab', hand: 'L', tgt: 'head', approach: 'straight' },
  cross: { clip: 'cross', hand: 'R', tgt: 'head', approach: 'straight' },
  hook: { clip: 'hook', hand: 'L', tgt: 'head', approach: 'side' },
  hookR: { clip: 'hookR', hand: 'R', tgt: 'head', approach: 'side' },
  upper: { clip: 'upper', hand: 'R', tgt: 'head', approach: 'under' },
  bodyL: { clip: 'bodyL', hand: 'L', tgt: 'chest', approach: 'ribs' },
  bodyR: { clip: 'bodyR', hand: 'R', tgt: 'chest', approach: 'ribs' },
};
/* per punch: heel lift and pivot of the driving foot at contact (radians), how much of the clip's own pelvis travel to keep */
const DRIVE = {
  jab: { foot: 'L', heel: 0.10, pivot: 0, travel: 0.55, maxTravel: 0.09, lean: 0.46, dip: 0.005 },
  cross: { foot: 'R', heel: 0.62, pivot: 0.5, travel: 0.6, maxTravel: 0.11, lean: 0.46, dip: 0.012 },
  hook: { foot: 'L', heel: 0.42, pivot: -0.55, travel: 0.4, maxTravel: 0.07, lean: 0.4, dip: 0.018 },
  hookR: { foot: 'R', heel: 0.55, pivot: 0.5, travel: 0.4, maxTravel: 0.07, lean: 0.4, dip: 0.018 },
  upper: { foot: 'R', heel: 0.5, pivot: 0.45, travel: 0.35, maxTravel: 0.07, lean: 0.34, dip: 0.07, load: true },
  bodyL: { foot: 'L', heel: 0.2, pivot: -0.15, travel: 0.6, maxTravel: 0.05, lean: 0.3, dip: 0.12 },
  bodyR: { foot: 'R', heel: 0.5, pivot: 0.4, travel: 0.6, maxTravel: 0.05, lean: 0.3, dip: 0.125 },
};
const TORSO = ['Bip01_Pelvis', 'Bip01_Spine', 'Bip01_Spine1', 'Bip01_Spine2', 'Bip01_Neck', 'Bip01_Head'];
const ARM = (s) => ['Clavicle', 'UpperArm', 'Forearm', 'Hand'].map((n) => `Bip01_${s}_${n}`);
const LEG = (s) => ['Thigh', 'Calf', 'Foot', 'Toe0'].map((n) => `Bip01_${s}_${n}`);
/* planted ball of each foot in the fighter's frame (x his left, z forward), and the foot's yaw */
const STANCE = { L: { x: 0.115, z: 0.285, yaw: -0.16, heel: 0.05 }, R: { x: -0.165, z: -0.225, yaw: -0.72, heel: 0.3 } };
const PELVIS_Y = 0.845;
const FALL_CLIP = 'knockdown', RISE_CLIP = 'getup';
const SIT_T = 2.1; /* time in the get-up clip where he is sitting up: mashing moves him this far, rising does the rest */
const STIR_RATE = 1.9; /* clip seconds per second: however the mash jumps, he stirs and sits up at a man's speed */
const RISE_BLEND = 0.78; /* part of the get-up after which the fight pose takes over. At 1.7 s that is .37 s, and the head stays under about 2.5 m/s */

class Spring { constructor(w, z) { this.w = w; this.z = z; this.x = new THREE.Vector3(); this.v = new THREE.Vector3(); }
  step(dt) { const k = this.w * this.w, c = 2 * this.z * this.w; this.v.x += (-k * this.x.x - c * this.v.x) * dt; this.v.y += (-k * this.x.y - c * this.v.y) * dt; this.v.z += (-k * this.x.z - c * this.v.z) * dt; this.x.x += this.v.x * dt; this.x.y += this.v.y * dt; this.x.z += this.v.z * dt; } }

const _v = [...Array(14)].map(() => new THREE.Vector3()); const _q = [...Array(10)].map(() => new THREE.Quaternion()); const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _axisQ = new THREE.Quaternion();
function nlerpArr(o, a, ai, b, bi, t) { /* out into o at ai, mixing a[ai..] toward b[bi..] */
  const ax = a[ai], ay = a[ai + 1], az = a[ai + 2], aw = a[ai + 3]; let bx = b[bi], by = b[bi + 1], bz = b[bi + 2], bw = b[bi + 3];
  if (ax * bx + ay * by + az * bz + aw * bw < 0) { bx = -bx; by = -by; bz = -bz; bw = -bw; }
  const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t, w = aw + (bw - aw) * t, l = 1 / (Math.hypot(x, y, z, w) || 1);
  o[ai] = x * l; o[ai + 1] = y * l; o[ai + 2] = z * l; o[ai + 3] = w * l;
}
/* an ellipsoid fitted to mesh vertices picked by `test`, in `bone`'s rest frame */
function fitRegion(mesh, bone, test) {
  const g = mesh.geometry, P = g.attributes.position, I = g.index, inv = new THREE.Matrix4().copy(bone.matrixWorld).invert(), v = new THREE.Vector3(), seen = new Set();
  const lo = new THREE.Vector3(1e9, 1e9, 1e9), hi = new THREE.Vector3(-1e9, -1e9, -1e9);
  for (let i = 0; i < I.count; i++) { const k = I.getX(i); if (seen.has(k)) continue; seen.add(k); v.fromBufferAttribute(P, k); if (!test(v)) continue; v.applyMatrix4(inv); lo.min(v); hi.max(v); }
  return { c: lo.clone().add(hi).multiplyScalar(0.5), r: hi.clone().sub(lo).multiplyScalar(0.5) };
}

export class FighterRig {
  static pair(a, b) { a.opponent = b; b.opponent = a; a.who = 'p'; b.who = 'o'; }
  /* Both bodies first, then both arms: each glove aims at where the other head is this frame, not the last. */
  static updateBoth(a, b, match, dt) { a.pose(match, dt); b.pose(match, dt); a._solveHands(false, dt); b._solveHands(false, dt); a._solveHands(true, dt); b._solveHands(true, dt); a.fighter.root.updateMatrixWorld(true); b.fighter.root.updateMatrixWorld(true); }

  constructor(fighter, clips, opts = {}) {
    this.fighter = fighter; this.lib = clips; this.who = opts.who ?? 'p'; this.opponent = opts.opponent ?? null; this.floorY = opts.floorY ?? 0; this.ringHalf = opts.ringHalf ?? 3.0;
    this.getUpTime = opts.getUpTime ?? 1.2; const B = this.B = fighter.bones;
    fighter.root.position.set(0, 0, 0); fighter.root.rotation.set(0, 0, 0); fighter.root.updateMatrixWorld(true);
    const nb = clips.bones.length; this.nb = nb; this.ix = clips.ix; this.bl = clips.bones.map((n) => B[n]);
    this.qS = new Float32Array(nb * 4); this.qA = new Float32Array(nb * 4); this.qD = new Float32Array(nb * 4); this.qG = new Float32Array(nb * 4); this.qP = new Float32Array(nb * 4); this.qSnap = new Float32Array(nb * 4);
    this.rS = new Float32Array(3); this.rA = new Float32Array(3); this.rA0 = new Float32Array(3); this.rD = new Float32Array(3); this.rG = new Float32Array(3);
    const ids = (l) => l.map((n) => this.ix[n]); this.mTorso = ids(TORSO); this.mArm = { L: ids(ARM('L')), R: ids(ARM('R')) }; this.mLeg = { L: ids(LEG('L')), R: ids(LEG('R')) };
    this.iPelvis = this.ix.Bip01_Pelvis;

    /* rest measurements, all from the skeleton */
    const chain = [B.Bip01_Spine, B.Bip01_Spine1, B.Bip01_Spine2, B.Bip01_Neck, B.Bip01_Head];
    this.chain = chain; this.chainWorld = chain.map(() => new THREE.Quaternion());
    this.legs = {}; for (const s of ['L', 'R']) {
      const T = B[`Bip01_${s}_Thigh`], C = B[`Bip01_${s}_Calf`], F = B[`Bip01_${s}_Foot`], O = B[`Bip01_${s}_Toe0`];
      const pT = wp(T, new THREE.Vector3()), pC = wp(C, new THREE.Vector3()), pF = wp(F, new THREE.Vector3()), pO = wp(O, new THREE.Vector3());
      const fwd = new THREE.Vector3(0, 0, 1), frame = (bone, dirW) => { /* the bone's aim and knee-forward axes in its own frame, for rebuilding its rotation */
        const qi = wq(bone, new THREE.Quaternion()).invert(), d = dirW.clone().normalize(), p = fwd.clone().addScaledVector(d, -fwd.dot(d)).normalize();
        const dl = d.clone().applyQuaternion(qi), pl = p.clone().applyQuaternion(qi), zl = dl.clone().cross(pl), m = new THREE.Matrix4().makeBasis(dl, pl, zl).invert(); return m; };
      const toFoot = pO.clone().sub(pF); toFoot.y = 0; const restYaw = Math.atan2(toFoot.x, toFoot.z);
      this.legs[s] = { s, T, C, F, O, a: pC.distanceTo(pT), b: pF.distanceTo(pC), mT: frame(T, pC.clone().sub(pT)), mC: frame(C, pF.clone().sub(pC)), qFootRest: wq(F, new THREE.Quaternion()), qToeRest: wq(O, new THREE.Quaternion()), qToeLocalRest: O.quaternion.clone(),
        ballLocal: O.position.clone(), restYaw, heelAxis: UP.clone().cross(toFoot.clone().normalize()), restBallY: pO.y };
    }
    this.ballY = this.legs.L.restBallY + 0.006;
    this.arms = {}; const front = new THREE.Vector3(); for (const s of ['L', 'R']) { const g = fighter.gloves[s]; const P = g.geometry.attributes.position; const gc = new THREE.Vector3(0.072, 0.008, 0); /* the middle of the mitt, not of the whole glove with its cuff */ let bx = -1e9; for (let i = 0; i < P.count; i++) { const x = P.getX(i); if (x > bx) { bx = x; front.fromBufferAttribute(P, i); } }
      this.arms[s] = { s, C: B[`Bip01_${s}_Clavicle`], U: B[`Bip01_${s}_UpperArm`], F: B[`Bip01_${s}_Forearm`], H: B[`Bip01_${s}_Hand`], gloveC: gc, knuckle: new THREE.Vector3(front.x * 0.98, 0.5 * front.y + 0.005, 0) }; }
    /* the head and ribs as ellipsoids, from the real mesh */
    const head = fighter.head, body = Object.values(fighter.meshes).find((m) => m.material === fighter.skinMats[0]);
    const hb = wp(B.Bip01_Head, new THREE.Vector3());
    this.headFit = fitRegion(head, B.Bip01_Head, (v) => v.y > hb.y - 0.03); this.chestFit = fitRegion(body, B.Bip01_Spine1, (v) => v.y > 1.12 && v.y < 1.34 && Math.abs(v.x) < 0.2);
    this.chestFwdLocal = new THREE.Vector3(0, 0, 1).applyQuaternion(wq(B.Bip01_Spine2, new THREE.Quaternion()).invert()); const qi = wq(B.Bip01_Head, new THREE.Quaternion()).invert(); this.headFwdLocal = new THREE.Vector3(0, 0, 1).applyQuaternion(qi); this.eye = { L: B.Bip01_LEye, R: B.Bip01_REye };

    /* state */
    this.clock = 0; this.st = Math.random() * 3; this.bobT = Math.random() * 6; this.yaw = 0; this.init = false;
    this.feet = { L: { s: 'L', x: 0, z: 0, y: this.ballY, yaw: 0, swing: null, heel: 0, pivot: 0 }, R: { s: 'R', x: 0, z: 0, y: this.ballY, yaw: 0, swing: null, heel: 0, pivot: 0 } };
    this.pu = null; this.wClip = 0; this.wAim = 0; this.snapW = 0; this.snapRate = 12; this.lean = new THREE.Vector2(); this.dip = 0; this.dipV = 0;
    this.sHead = new Spring(12, 0.45); this.sTorso = new Spring(9, 0.55); this.sPel = new Spring(10, 0.6); this.sHand = new Spring(16, 0.5);
    this.low = 0; this.relax = 0; this.seen = new WeakSet(); this.D = null; this.wDown = 0; this.win = 0; this.lose = 0; this.blink = 1.5 + Math.random() * 2; this.blinkT = 0; this.blinkDur = 0.12;
    this.wince = 0; this.body = 0; this.effort = 0; this.shake = 0; this.dazed = 0; this.sweat = 0; this.face = { }; this.slipW = 0; this.stepping = 0; this.lastStep = 'R'; this.pelvis = new THREE.Vector3(0, PELVIS_Y, 0); this.aimP = new THREE.Vector3(); this.aimHold = false; this.lastHeadAim = new THREE.Vector3();
    this.m = new Float32Array(0); this.log = null; this.rnd = Math.random;
    this._head = new THREE.Vector3(); this._chest = new THREE.Vector3(); this._glove = { L: new THREE.Vector3(), R: new THREE.Vector3() }; this._kn = { L: new THREE.Vector3(), R: new THREE.Vector3() };
  }

  /* back to a clean stance: called by itself when the match object changes */
  reset() { this.init = false; this.D = null; this.pu = null; this.wDown = 0; this.wClip = 0; this.wAim = 0; this.snapW = 0; this.win = 0; this.lose = 0; this.relax = 0; this.low = 0; this.sweat = 0; this.wince = 0; this.body = 0; this.shake = 0; this.dazed = 0; this.slipW = 0; for (const f of Object.values(this.feet)) { f.swing = null; f.y = this.ballY; f.swPitch = 0; f.pivotNow = 0; } for (const sp of [this.sHead, this.sTorso, this.sPel, this.sHand]) { sp.x.set(0, 0, 0); sp.v.set(0, 0, 0); } this.dip = 0; this.dipV = 0; this.settle = 0; }
  /* one rig on its own; use updateBoth for a pair */
  update(match, dt) { this.pose(match, dt); this.solve(match, dt); }

  /* ---------- getters ---------- */
  headWorld() { return this._head.copy(this.headFit.c).applyMatrix4(this.B.Bip01_Head.matrixWorld); }
  chestWorld() { return this._chest.copy(this.chestFit.c).applyMatrix4(this.B.Bip01_Spine1.matrixWorld); }
  gloveWorld(s) { return this._glove[s].copy(this.arms[s].gloveC).applyMatrix4(this.arms[s].H.matrixWorld); }
  knuckleWorld(s) { return this._kn[s].copy(this.arms[s].knuckle).applyMatrix4(this.arms[s].H.matrixWorld); }
  /* where the planted foot's ball is: for the skate test */
  ballWorld(s, out) { return wp(this.legs[s].O, out); }
  isPlanted(s) { return !this.feet[s].swing && this.wDown < 0.001; }

  /* ---------- events ---------- */
  _events(match, me) {
    for (const e of match.events) { if (this.seen.has(e)) continue; this.seen.add(e);
      if ((e.type === 'hit' || e.type === 'block') && e.def === this.who) this._struck(e, me);
      else if (e.type === 'stagger' && e.who === this.who) { this.sPel.v.y -= 0.9; this.sTorso.v.addScaledVector(_v[0].set(e.dir[1], 0, -e.dir[0]), 2.4); this.shake = Math.max(this.shake, 0.7); }
      else if (e.type === 'knockdown' && e.who === this.who) this._enterDown(e, me);
      else if (e.type === 'throw' && e.who === this.who) this.effort = 1;
      else if (e.type === 'block' && e.who === this.who) this.sHand.v.addScaledVector(_v[0].set(-e.dir[0], 0, -e.dir[1]), 0.5);
    }
  }
  _struck(e, me) {
    const p = e.power ?? 0.5, d = e.dir ?? [0, -1], ax = _v[0].set(d[1], 0, -d[0]), fx = Math.sin(me.yaw), fz = Math.cos(me.yaw), twist = fz * d[0] - fx * d[1];
    if (e.blocked) { this.sHand.v.add(_v[1].set(d[0], 0, d[1]).multiplyScalar(1.1 * p + 0.2)); this.sTorso.v.addScaledVector(ax, 0.7 * p); this.sHead.v.addScaledVector(ax, 0.8 * p); this.wince = Math.max(this.wince, 0.25 * p + 0.1); return; }
    if (e.tgt === 'body') { this.sTorso.v.addScaledVector(ax, -3.6 * p); this.sPel.v.add(_v[1].set(d[0] * 0.75 * p, -0.5 * p, d[1] * 0.75 * p)); this.sHead.v.addScaledVector(ax, -1.2 * p); this.body = Math.max(this.body, p + 0.3); this.wince = Math.max(this.wince, 0.5 + p * 0.5); return; }
    const big = e.kind === 'hook' || e.kind === 'upper';
    this.sHead.v.addScaledVector(ax, (e.kind === 'upper' ? 15 : big ? 7 : 13) * p + 1.5); this.sHead.v.y += twist * (e.kind === 'hook' ? 18 : 4) * p;
    if (e.kind === 'upper') this.sHead.v.addScaledVector(_v[1].set(-fz, 0, fx), 0.3);
    this.sTorso.v.addScaledVector(ax, 2.6 * p); this.sTorso.v.y += twist * 2.2 * p; this.sPel.v.add(_v[1].set(d[0] * 0.5 * p, -0.25 * p, d[1] * 0.5 * p));
    this.wince = Math.max(this.wince, 0.55 + p * 0.45); this.blinkT = Math.max(this.blinkT, 0.09); this.blinkDur = Math.max(this.blinkDur, 0.1);
    if (me.head >= 7) this.shake = Math.max(this.shake, 0.35 + p * 0.5); if (p > 0.5) this.dazed = Math.max(this.dazed, p);
  }
  _snapshot(rate = 12) { for (let i = 0; i < this.nb; i++) { const q = this.bl[i].quaternion; const o = i * 4; if (i === this.iPelvis) { this.qSnap[o] = this.qP[o]; this.qSnap[o + 1] = this.qP[o + 1]; this.qSnap[o + 2] = this.qP[o + 2]; this.qSnap[o + 3] = this.qP[o + 3]; } else { this.qSnap[o] = q.x; this.qSnap[o + 1] = q.y; this.qSnap[o + 2] = q.z; this.qSnap[o + 3] = q.w; } } this.snapW = 1; this.snapRate = rate; }

  /* ---------- knockdown ---------- */
  _enterDown(e, me) {
    const dir = e.dir ?? [0, -1], l = Math.hypot(dir[0], dir[1]) || 1, fall = this.lib.get(FALL_CLIP), rise = this.lib.get(RISE_CLIP);
    /* the clip falls toward its own -Z. Turn it so he falls with the blow, but never so far that the turn reads as a spin. */
    const toward = Math.atan2(-dir[0] / l, -dir[1] / l), yaw = me.yaw + clamp(wrap(toward - me.yaw), -0.9, 0.9);
    fall.sample(fall.dur, this.qD, this.rD); const c = Math.cos(yaw), s = Math.sin(yaw), ex = this.rD[0] * c + this.rD[2] * s, ez = -this.rD[0] * s + this.rD[2] * c;
    /* the body has to end up inside the ropes */
    const lim = this.ringHalf - 0.45, shx = clamp(me.x + ex, -lim, lim) - (me.x + ex), shz = clamp(me.z + ez, -lim, lim) - (me.z + ez);
    this.D = { t: 0, phase: 'fall', yaw, bx: me.x, bz: me.z, shx, shz, g: 0, g0: 0, ry: 0, prog: 0, base2x: 0, base2z: 0, fall, rise, seeded: false, p0: this.B.Bip01_Pelvis.position.clone(), y0: this.yaw };
    this.pu = null; this.wClip = this.wAim = 0; this._snapshot(9); this.wince = 1; this.blinkT = 0.2; this.sHead.v.multiplyScalar(0.5);
    rise.sample(0, this.qG, this.rG); const dy = (fall.meta.lieYaw ?? 0) - (rise.meta.lieYaw ?? 0); this.D.yawG = yaw + dy;
    const cg = Math.cos(this.D.yawG), sg = Math.sin(this.D.yawG); this.D.base2x = me.x + ex + shx - (this.rG[0] * cg + this.rG[2] * sg); this.D.base2z = me.z + ez + shz - (-this.rG[0] * sg + this.rG[2] * cg);
  }
  _downLayer(me, dt) {
    const D = this.D; if (!D) { this.wDown = 0; return; }
    D.t += dt; const fall = D.fall, rise = D.rise;
    fall.sample(Math.min(D.t, fall.dur), this.qD, this.rD);
    const breathe = Math.sin(this.clock * 2.2) * 0.012;
    const dn = me.down; const up = dn ? (dn.up ?? 0) : 1; const rising = dn && dn.rising != null ? dn.rising : (dn ? null : 1e3);
    /* he lies still for a moment, then starts to stir toward the get-up pose as the mash fills, rises when the sim says so */
    if (rising == null) { const stir = sstep(fall.dur - 0.5, fall.dur + 1.1, D.t), gw = damp(D.g, SIT_T * Math.pow(up, 1.3), 3.5, dt), gMax = STIR_RATE * dt; D.g = D.g + clamp(gw - D.g, -gMax, gMax); D.g0 = D.g; const wWant = stir * (up > 0.02 ? 1 : 0.65), wNow = D.wG ?? 0; D.wG = Math.max(wNow, Math.min(wWant, wNow + 1.5 * dt)); }
    else { if (D.phase !== 'rise') { D.phase = 'rise'; D.g0 = D.g; D.riseT = 0; D.wG = D.wG ?? 1; D.wG0 = D.wG; D.yaw1 = wrap(me.yaw - (D.yawG + (rise.meta.endYaw ?? 0))); }
      D.riseT += dt; D.prog = clamp(D.riseT / this.getUpTime); const pr = D.prog; D.g = lerp(D.g0, rise.dur, pr * pr * (3 - 2 * pr) * 0.35 + pr * 0.65); D.wG = lerp(D.wG0, 1, sstep(0, lerp(0.42, 0.12, D.wG0), pr)); }
    rise.sample(D.g, this.qG, this.rG);
    const wG = D.wG ?? 0;
    for (let i = 0; i < this.nb; i++) nlerpArr(this.qD, this.qD, i * 4, this.qG, i * 4, wG);
    /* pelvis of each layer in world, mixed */
    const c = Math.cos(D.yaw), s = Math.sin(D.yaw), sp = sstep(0.2, fall.dur * 0.7, D.t);
    let px = D.bx + this.rD[0] * c + this.rD[2] * s + D.shx * sp, pz = D.bz - this.rD[0] * s + this.rD[2] * c + D.shz * sp, py = this.rD[1];
    let yawW = D.yaw;
    if (wG > 0) { const y1 = D.phase === 'rise' ? D.yaw1 * sstep(0.35, 1, D.prog) : 0, yg = D.yawG + y1, cg = Math.cos(yg), sg = Math.sin(yg); const c0 = Math.cos(D.yawG), s0 = Math.sin(D.yawG);
      let gx = D.base2x + this.rG[0] * c0 + this.rG[2] * s0, gz = D.base2z - this.rG[0] * s0 + this.rG[2] * c0;
      if (D.phase === 'rise') { rise.sample(rise.dur, this.qA, this.rA); const ex = D.base2x + this.rA[0] * c0 + this.rA[2] * s0, ez = D.base2z - this.rA[0] * s0 + this.rA[2] * c0, k = sstep(0.3, 1, D.prog); gx += (me.x - ex) * k; gz += (me.z - ez) * k; }
      px = lerp(px, gx, wG); pz = lerp(pz, gz, wG); py = lerp(py, this.rG[1], wG); yawW = lerp(D.yaw, yg, wG); void cg; void sg; }
    py += breathe * (1 - (D.phase === 'rise' ? D.prog : 0));
    /* the first moments of the fall fade out of wherever he was standing */
    const inF = sstep(0, 0.2, D.t); px = lerp(D.p0.x, px, inF); py = lerp(D.p0.y, py, inF); pz = lerp(D.p0.z, pz, inF); yawW = D.y0 + wrap(yawW - D.y0) * inF;
    D.px = px; D.py = py; D.pz = pz; D.yawW = yawW;
    /* weight of this layer over the fight pose */
    if (D.phase === 'rise') { this.wDown = 1 - sstep(RISE_BLEND, 1, D.prog); if (!D.seeded && D.prog >= RISE_BLEND - 0.02) { this._seedFeet(); D.seeded = true; } if (D.prog >= 1 && !dn) { this.D = null; this.wDown = 0; } }
    else this.wDown = 1;
  }
  _seedFeet() { for (const s of ['L', 'R']) { const f = this.feet[s], p = wp(this.legs[s].O, _v[0]), q = wq(this.legs[s].F, _q[0]); f.x = p.x; f.z = p.z; f.swing = null; const dir = _v[1].copy(this.legs[s].ballLocal).applyQuaternion(q); f.yaw = Math.atan2(dir.x, dir.z); f.y = this.ballY; } this.settle = 0.15; }

  /* ---------- the feet ---------- */
  _home(s, cx, cz, yaw, out) { const h = STANCE[s], c = Math.cos(yaw), sn = Math.sin(yaw), w = this.relax; const hx = lerp(h.x, s === 'L' ? 0.1 : -0.1, w), hz = lerp(h.z, 0.02, w), hy = lerp(h.yaw, s === 'L' ? 0.08 : -0.08, w); out.x = cx + hx * c + hz * sn; out.z = cz - hx * sn + hz * c; out.yaw = yaw + hy; return out; }
  _planter(me, dt) {
    const yaw = this.yaw, vx = me.vx + (me.knock ? me.knock.x : 0), vz = me.vz + (me.knock ? me.knock.z : 0), speed = Math.hypot(vx, vz), fx = Math.sin(yaw), fz = Math.cos(yaw), lx = fz, lz = -fx;
    const along = vx * fx + vz * fz, side = vx * lx + vz * lz; let first = Math.abs(along) >= Math.abs(side) ? (along >= 0 ? 'L' : 'R') : (side >= 0 ? 'L' : 'R');
    const dur = lerp(lerp(0.19, 0.135, clamp(speed / 2.4)), 0.26, this.relax), lead = lerp(0.14 * clamp(speed / 2.4) + 0.02 * speed, 0.12 * clamp(speed), this.relax);
    if (this.settle > 0) this.settle -= dt;
    const H = this._hA ??= { x: 0, z: 0, yaw: 0 }, G = this._hB ??= { x: 0, z: 0, yaw: 0 };
    let anySwing = false, swingProg = 1, swinger = null;
    for (const s of ['L', 'R']) { const f = this.feet[s]; if (f.swing) { const w = f.swing; w.t += dt; const u = clamp(w.t / w.dur);
        /* the target keeps tracking him while the foot is in the air, so a step lands where it is needed */
        this._home(s, me.x + vx * Math.max(0, w.dur - w.t) * 1.05 + (speed > 0.01 ? (vx / speed) * lead : 0), me.z + vz * Math.max(0, w.dur - w.t) * 1.05 + (speed > 0.01 ? (vz / speed) * lead : 0), yaw, H); if (w.t < w.dur * 0.7) { w.tx = H.x; w.tz = H.z; w.tyaw = H.yaw; }
        const e = u * u * (3 - 2 * u); f.x = lerp(w.x, w.tx, e); f.z = lerp(w.z, w.tz, e); f.yaw = w.yaw + wrap(w.tyaw - w.yaw) * e; f.y = this.ballY + Math.sin(u * Math.PI) * w.h; f.lift = Math.sin(u * Math.PI);
        f.swPitch = lerp(0.5, -0.12, sstep(0, 0.75, u)) * (1 - sstep(0.75, 1, u));
        if (u >= 1) { f.swing = null; f.y = this.ballY; f.lift = 0; f.swPitch = 0; this.dipV -= 0.14 + speed * 0.1; this.lastStep = s; this.lastStepT = this.clock; } else { anySwing = true; swinger = s; swingProg = u; } } }
    const moving = speed > 0.15, thr = moving ? 0.07 + 0.05 * clamp(speed / 2.4) : 0.05;
    if (!(anySwing && swingProg < 0.6) && this.wDown < 0.5) { let pick = null, pickE = 0;
      for (const s of ['L', 'R']) { const f = this.feet[s]; if (f.swing) continue; this._home(s, me.x, me.z, yaw, H); const e = Math.hypot(f.x - H.x, f.z - H.z), ye = Math.abs(wrap(f.yaw - H.yaw)); const score = e + ye * 0.1;
        const needs = e > (moving ? thr : (this.settle > 0 ? 0.3 : thr)) || ye > 0.7;
        if (needs && (score > pickE)) { pickE = score; pick = s; } this['_err' + s] = e; }
      /* the foot on the side he is going leads a new move (lead foot advancing, rear foot retreating); once going, the feet take turns */
      const other = (k) => (k === 'L' ? 'R' : 'L'), fresh = this.clock - (this.lastStepT ?? -9) > 0.22;
      if (pick && moving) { if (fresh) { if (pick !== first && !this.feet[first].swing && (this['_err' + first] ?? 0) > 0.02) pick = first; } else if (pick === this.lastStep && !this.feet[other(pick)].swing && (this['_err' + other(pick)] ?? 0) > thr * 0.5) pick = other(pick); }
      if (pick) { const f = this.feet[pick]; this._home(pick, me.x + vx * dur + (speed > 0.01 ? (vx / speed) * lead : 0), me.z + vz * dur + (speed > 0.01 ? (vz / speed) * lead : 0), yaw, H);
        f.swing = { t: 0, dur: dur * (1 + clamp(0.3 - Math.hypot(f.x - H.x, f.z - H.z)) * 0.6), x: f.x, z: f.z, yaw: f.yaw, tx: H.x, tz: H.z, tyaw: H.yaw, h: 0.028 + 0.02 * clamp(Math.hypot(f.x - H.x, f.z - H.z) / 0.5) }; f.swPitch = 0.3; } }
    void swinger; void G;
  }

  /* ---------- pose: everything but the arms ---------- */
  pose(match, dt) {
    const me = match[this.who], foe = this.who === 'p' ? match.o : match.p, B = this.B; this.me = me; this.foe = foe;
    this.fighter.root.position.set(0, this.floorY, 0);
    if (this.matchRef !== match) { this.matchRef = match; this.reset(); }
    if (!this.init) { this.init = true; this.yaw = me.yaw; for (const s of ['L', 'R']) { const f = this.feet[s], H = this._home(s, me.x, me.z, me.yaw, { x: 0, z: 0, yaw: 0 }); f.x = H.x; f.z = H.z; f.yaw = H.yaw; } this.pelvis.set(me.x, PELVIS_Y, me.z); }
    this.clock += dt; this._events(match, me);
    if (me.down && !this.D) this._enterDown({ dir: [-Math.sin(me.yaw), -Math.cos(me.yaw)] }, me);
    const turned = wrap(me.yaw - this.yaw); this.yaw = wrap(this.yaw + turned * (1 - Math.exp(-30 * dt)));
    const fatigue = clamp(1 - me.sta / me.maxSta), headLoad = me.head ?? 0, tired = me.sta < 25 ? (25 - me.sta) / 25 : 0, bad = sstep(13, 15, headLoad), warn = sstep(7, 9, headLoad);
    const over = match.state === 'over', res = match.result; const won = over && res && res.winner === this.who, lost = over && res && res.loser === this.who;
    this.win = damp(this.win, won ? 1 : 0, 3.2, dt); this.lose = damp(this.lose, lost && !me.down ? 1 : 0, 2.5, dt);
    const away = match.state === 'break' || (match.state === 'intro') ? 1 : 0; this.relax = damp(this.relax, away || (over ? 1 : 0), 3, dt);

    /* base: the stance loop */
    const rate = (0.85 + fatigue * 0.25); this.st += dt * rate; const stance = this.lib.get('stance'); stance.sample(this.st, this.qS, this.rS); this.qP.set(this.qS);
    let travelX = 0, travelY = 0, travelZ = 0;

    /* punch layer */
    const p = me.punch;
    if (p && (!this.pu || this.pu.ref !== p)) { if (this.wClip > 0.03 || this.pu) this._snapshot(16); const def = PUNCH_DEF[p.kind] ?? PUNCH_DEF.jab; const clip = this.lib.get(def.clip); clip.sample(0, this.qA, this.rA0); this.pu = { ref: p, def, clip, drive: DRIVE[p.kind] ?? DRIVE.jab, froze: false }; }
    if (!p && this.pu) { if (this.wClip > 0.03) this._snapshot(11); this.pu = null; }
    this.wClip = 0; this.wAim = 0; let drive = 0;
    if (this.pu) { const { clip, def } = this.pu; const hold = p.active ?? 0.05, u = clamp(p.t / p.contact), v = clamp((p.t - p.contact - hold) / Math.max(0.01, p.dur - p.contact - hold));
      const tc = p.t <= p.contact ? clip.contact * Math.pow(u, 1.25) : clip.contact + (clip.dur - clip.contact) * (1 - Math.pow(1 - v, 1.6));
      clip.sample(tc, this.qA, this.rA); const w = sstep(0, 0.32, u) * (1 - sstep(0.55, 1, v)); this.wClip = w;
      this.wAim = sstep(0.2, 0.92, u) * (1 - sstep(0, 0.62, v)); drive = sstep(0.3, 1, u) * (1 - sstep(0, 0.8, v));
      for (const i of this.mTorso) nlerpArr(this.qP, this.qP, i * 4, this.qA, i * 4, w); for (const i of this.mArm[def.hand]) nlerpArr(this.qP, this.qP, i * 4, this.qA, i * 4, w);
      const D_ = this.pu.drive, k = D_.travel * w; travelX = (this.rA[0] - this.rA0[0]) * k; travelZ = (this.rA[2] - this.rA0[2]) * k; const tl = Math.hypot(travelX, travelZ); if (tl > D_.maxTravel) { travelX *= D_.maxTravel / tl; travelZ *= D_.maxTravel / tl; }
      /* level change: body shots sit down into it, the uppercut loads and rises through contact */
      travelY = -(D_.load ? D_.dip * Math.sin(Math.PI * Math.min(1, u * 0.98)) * (1 - v) : D_.dip * drive); }

    /* the down layer replaces the lot */
    this._downLayer(me, dt);
    if (this.wDown > 0) for (let i = 0; i < this.nb; i++) nlerpArr(this.qP, this.qP, i * 4, this.qD, i * 4, this.wDown);

    /* a change of source fades through what was on screen */
    if (this.snapW > 0) { this.snapW = Math.max(0, this.snapW - dt * this.snapRate); const s = this.snapW * this.snapW * (3 - 2 * this.snapW); for (let i = 0; i < this.nb; i++) nlerpArr(this.qP, this.qP, i * 4, this.qSnap, i * 4, s); }

    /* springs */
    this.sHead.step(dt); this.sTorso.step(dt); this.sPel.step(dt); this.sHand.step(dt);
    this.dipV += (-90 * this.dip - 13 * this.dipV) * dt; this.dip += this.dipV * dt;

    /* lean into movement, weave when he is not moving, sway when hurt */
    const c = Math.cos(this.yaw), s = Math.sin(this.yaw), fv = me.vx * s + me.vz * c, sv = me.vx * c - me.vz * s; this.lean.x = damp(this.lean.x, fv, 8, dt); this.lean.y = damp(this.lean.y, sv, 8, dt);
    this.bobT += dt * (1 + clamp(Math.hypot(me.vx, me.vz) / 2.4) * 0.5) * lerp(1.0, 0.72, Math.max(tired, bad));
    const bounceAmp = lerp(0.014, 0.006, Math.max(tired, bad)) * (1 - this.relax * 0.7), bob = Math.sin(this.bobT * 2 * Math.PI * 1.75);
    const swX = bad * Math.sin(this.clock * 1.9) * 0.034 + bad * Math.sin(this.clock * 4.1) * 0.007, swZ = bad * Math.cos(this.clock * 1.37) * 0.022;

    /* slip: off the line, down and to the side, from sim time */
    const slipDir = me.slipDir; let sl = 0; if (me.slip > 0 && me.slipT != null) { const t = me.slipT; sl = sstep(0, 0.1, t) * (1 - sstep(0.2, 0.3, t)); } this.slipW = damp(this.slipW, sl, 40, dt);
    const slipLocal = slipDir ? (slipDir[0] * c - slipDir[1] * s) : 0; const slipSide = this.slipW * (Math.abs(slipLocal) > 0.25 ? Math.sign(slipLocal) : -1), slipFwd = slipDir ? (slipDir[0] * s + slipDir[1] * c) * this.slipW : 0;

    /* pelvis */
    const hurtDip = this.lose * 0.03 + bad * 0.012 + tired * 0.012 + (me.stagger > 0 ? 0.03 : 0);
    const py = PELVIS_Y + bob * bounceAmp + this.dip + this.rS[1] * 0 + travelY - hurtDip - this.slipW * 0.055 + this.sPel.x.y + this.relax * 0.022;
    const tx = travelX * c + travelZ * s, tz = -travelX * s + travelZ * c;
    const fpx = me.x + tx + this.sPel.x.x + swX * c + swZ * s, fpz = me.z + tz + this.sPel.x.z - swX * s + swZ * c;
    /* pelvis rotation: fight frame times clip */
    const qYaw = _q[0].setFromAxisAngle(UP, this.yaw), qPel = _q[1].fromArray(this.qP, this.iPelvis * 4);
    const pel = B.Bip01_Pelvis;
    if (this.wDown > 0 && this.D) { const qd = _q[2].setFromAxisAngle(UP, this.D.yawW); const q2 = _q[3].copy(qd).multiply(qPel); const q1 = _q[4].copy(qYaw).multiply(_q[5].fromArray(this.qS, this.iPelvis * 4)); pel.quaternion.copy(q1).slerp(q2, this.wDown); pel.position.set(lerp(fpx, this.D.px, this.wDown), lerp(py, this.D.py, this.wDown), lerp(fpz, this.D.pz, this.wDown)); }
    else { pel.quaternion.copy(qYaw).multiply(qPel); pel.position.set(fpx, py, fpz); }
    this.pelvis.copy(pel.position);
    /* write the rest, then push additive rotations down the spine in world space */
    for (let i = 0; i < this.nb; i++) if (i !== this.iPelvis) this.bl[i].quaternion.fromArray(this.qP, i * 4);
    this._additive(me, foe, dt, { bad, warn, tired, c, s, slipSide, slipFwd, fatigue });
    this.fighter.root.updateMatrixWorld(true);

    /* legs */
    const wPlant = 1 - this.wDown;
    if (wPlant > 0.001) { this._planter(me, dt); this._legsIK(me, wPlant, drive, bob, { tired, bad }); this.fighter.root.updateMatrixWorld(true); }
    else if (this.D && this.D.seeded) this._seedFeet();
    if (this.opponent && this.wDown < 0.5 && bad < 0.8) this._eyes();
    this._faceAndSkin(me, foe, dt, match, { bad, warn, tired, fatigue });
  }

  _eyes() { const O = this.opponent, h = this.B.Bip01_Head, qh = wq(h, _q[0]), f = _v[0].copy(this.headFwdLocal).applyQuaternion(qh); for (const k of ['L', 'R']) { const e = this.eye[k]; if (!e) continue; const pe = wp(e, _v[1]), to = _v[2].copy(O.headFit.c).applyMatrix4(O.B.Bip01_Head.matrixWorld).sub(pe).normalize(), d = _q[1].setFromUnitVectors(f, to); const a = 2 * Math.acos(clamp(d.w, -1, 1)); if (a > 0.36) _q[2].identity().slerp(d, 0.36 / a); else _q[2].copy(d); const pw = wq(e.parent, _q[3]), ew = wq(e, _q[4]); if (!e.userData.rest) e.userData.rest = e.quaternion.clone(); e.quaternion.copy(e.userData.rest); const restW = _q[5].copy(pw).multiply(e.userData.rest); _q[6].copy(pw).invert().multiply(_q[7].copy(_q[2]).multiply(restW)); e.quaternion.copy(_q[6]); void ew; } }

  _additive(me, foe, dt, E) {
    const { bad, tired, c, s, slipSide, slipFwd } = E, B = this.B, up = this.wDown > 0 ? 1 - this.wDown : 1;
    /* world-axis rotation vectors */
    const fwdAxis = _v[2].set(c, 0, -s), latAxis = _v[3].set(s, 0, c); /* about his left-right axis: positive pitches forward. about his facing: positive rolls to his left */
    const swayRoll = -bad * Math.sin(this.clock * 1.9 + 0.25) * 0.05, droop = (this.lose * 0.38 + bad * 0.1 + tired * 0.06) * up;
    const torso = _v[4].copy(this.sTorso.x).multiplyScalar(up);
    torso.addScaledVector(fwdAxis, ((this.lean.x * 0.05) + droop * 0.4 + this.slipW * 0.18 + slipFwd * 0.08) * up);
    torso.addScaledVector(latAxis, (-this.lean.y * 0.03 + swayRoll - slipSide * 0.34) * up);
    /* clips can fold further than a man holds his balance: cap the chest's lean, and keep the twist */
    if (up > 0.01) { const qc = _q[6].copy(B.Bip01_Pelvis.quaternion).multiply(this.chain[0].quaternion).multiply(this.chain[1].quaternion).multiply(this.chain[2].quaternion); const cu = _v[6].set(1, 0, 0).applyQuaternion(qc), th = Math.acos(clamp(cu.y, -1, 1)); const dist = foe ? Math.hypot(foe.x - me.x, foe.z - me.z) : 1.2; const L = (this.pu ? lerp(0.6, this.pu.drive.lean, this.wClip) : 0.6) * lerp(0.78, 1, sstep(0.72, 1.0, dist)); this.leanNow = th; if (th > L) { const ax = _v[7].crossVectors(cu, UP).normalize(); torso.addScaledVector(ax, (th - L) * up); }
      /* same for twist: a follow-through can spin the chest round past where a man keeps his eyes on the other one */
      const cf = _v[7].copy(this.chestFwdLocal).applyQuaternion(qc), rel = wrap(Math.atan2(cf.x, cf.z) - this.yaw), over = rel > 0.95 ? rel - 0.95 : rel < -1.05 ? rel + 1.05 : 0; this.twistNow = rel; if (over !== 0) torso.y -= over * up; }
    const headV = _v[5].copy(this.sHead.x).multiplyScalar(up); headV.addScaledVector(fwdAxis, droop * 0.9); headV.addScaledVector(latAxis, swayRoll * 1.6 - slipSide * 0.05);
    if (this.shake > 0.01) { this.shake = Math.max(0, this.shake - dt * 0.9); headV.y += Math.sin(this.clock * 19) * this.shake * 0.11 * up; }
    /* spine: three segments share the torso's rotation, neck and head share the head's */
    const shares = [0.34, 0.33, 0.33, 0, 0], hshares = [0, 0, 0, 0.42, 0.58];
    const pel = B.Bip01_Pelvis; let w = _q[6].copy(pel.quaternion); const qa = _q[7], t1 = _q[8], t2 = _q[9];
    /* the head keeps looking at the other man */
    const fh = foe ? this.opponent : null;
    for (let i = 0; i < this.chain.length; i++) { const b = this.chain[i]; const sh = shares[i], hs = hshares[i]; const vx = torso.x * sh + headV.x * hs, vy = torso.y * sh + headV.y * hs, vz = torso.z * sh + headV.z * hs, ang = Math.hypot(vx, vy, vz);
      t1.copy(w).multiply(b.quaternion);
      /* look first, on the clip's pose, so the reaction below still shows on top of it */
      if (i === this.chain.length - 1 && fh && up > 0.01) { const hd = _v[7].copy(this.headFwdLocal).applyQuaternion(t1); const he = _v[8].copy(fh.headFit.c).applyMatrix4(fh.B.Bip01_Head.matrixWorld); const me_ = _v[9].set(pel.position.x, this.floorY + pel.position.y + 0.72, pel.position.z); he.sub(me_).normalize(); const look = _q[5].setFromUnitVectors(hd, he); const lim = 0.72 * up * (1 - this.lose); const a = 2 * Math.acos(clamp(look.w, -1, 1)); if (a > 1e-3) t2.identity().slerp(look, Math.min(lim, 0.8 * Math.min(1, 0.7 / a))); else t2.identity(); t1.premultiply(t2); }
      if (ang > 1e-5) { _axisQ.setFromAxisAngle(_v[6].set(vx / ang, vy / ang, vz / ang), ang); qa.copy(_axisQ); t1.premultiply(qa); }
      b.quaternion.copy(t2.copy(w).invert()).multiply(t1); w.copy(t1); }
  }

  _legsIK(me, wPlant, drive, bob, E) {
    const pu = this.pu; const dr = pu ? pu.drive : null;
    /* keep both ankles reachable: if a leg is over-stretched, the pelvis gives way */
    const pel = this.B.Bip01_Pelvis;
    for (const s of ['L', 'R']) { const f = this.feet[s], L = this.legs[s], st = STANCE[s]; const isD = dr && dr.foot === s ? drive : 0;
      f.heel = st.heel * (1 - this.relax) + (s === 'L' ? 0.015 : 0.05) * bob * (1 - this.relax) + (dr ? dr.heel : 0) * isD; f.pivotNow = (dr ? dr.pivot : 0) * isD; }
    for (let iter = 0; iter < 2; iter++) { let moved = false;
      for (const s of ['L', 'R']) { const L = this.legs[s], f = this.feet[s], A = this._ankle(s, f, _v[0], _q[0]); const hip = wp(L.T, _v[1]); const d = _v[2].copy(hip).sub(A); const len = d.length(), mx = (L.a + L.b) * 0.992; if (len > mx) { d.multiplyScalar((mx - len) / len); pel.position.add(d); moved = true; this.fighter.root.updateMatrixWorld(true); } }
      if (!moved) break; }
    this.pelvis.copy(pel.position);
    for (const s of ['L', 'R']) this._legIK(s, this.feet[s], wPlant);
  }
  _ankle(s, f, outPos, outQ) { const L = this.legs[s], yaw = f.yaw + (f.pivotNow || 0), pitch = f.swing ? (f.swPitch || 0) : f.heel; const qy = _q[1].setFromAxisAngle(UP, yaw - L.restYaw), qp = _q[2].setFromAxisAngle(L.heelAxis, pitch); outQ.copy(qy).multiply(qp).multiply(L.qFootRest); const bl = _v[3].copy(L.ballLocal).applyQuaternion(outQ); outPos.set(f.x, this.floorY + f.y, f.z).sub(bl); return outPos; }
  _legIK(s, f, wPlant) {
    const L = this.legs[s]; const qF = _q[3]; const A = this._ankle(s, f, _v[4], qF); const hip = wp(L.T, _v[5]);
    const axis = _v[6].copy(A).sub(hip); let d = axis.length(); axis.divideScalar(d || 1); d = clamp(d, Math.abs(L.a - L.b) + 0.01, L.a + L.b - 0.0005);
    const ca = clamp((L.a * L.a + d * d - L.b * L.b) / (2 * L.a * d), -1, 1), h = L.a * Math.sqrt(1 - ca * ca); const yaw = f.yaw + (f.pivotNow || 0);
    /* knees over the toes, a little outward */
    const side = s === 'L' ? 1 : -1, cy = Math.cos(this.yaw), sy = Math.sin(this.yaw); const hint = _v[7].set(Math.sin(yaw) + side * cy * 0.22, 0.0, Math.cos(yaw) - side * sy * 0.22); const perp = hint.addScaledVector(axis, -hint.dot(axis)).normalize();
    const knee = _v[8].copy(hip).addScaledVector(axis, L.a * ca).addScaledVector(perp, h), ank = _v[9].copy(hip).addScaledVector(axis, d);
    const dT = _v[10].copy(knee).sub(hip).normalize(), dC = _v[11].copy(ank).sub(knee).normalize();
    const pT = _v[12].copy(perp).addScaledVector(dT, -perp.dot(dT)).normalize(), zT = _v[13].copy(dT).cross(pT); _m.makeBasis(dT, pT, zT).multiply(L.mT); const qT = _q[4].setFromRotationMatrix(_m);
    const pC = _v[12].copy(perp).addScaledVector(dC, -perp.dot(dC)).normalize(), zC = _v[13].copy(dC).cross(pC); _m.makeBasis(dC, pC, zC).multiply(L.mC); const qC = _q[5].setFromRotationMatrix(_m);
    const parent = wq(L.T.parent, _q[6]); const lT = _q[7].copy(parent).invert().multiply(qT), lC = _q[8].copy(qT).invert().multiply(qC), lF = _q[9].copy(qC).invert().multiply(qF);
    if (wPlant >= 0.999) { L.T.quaternion.copy(lT); L.C.quaternion.copy(lC); L.F.quaternion.copy(lF); } else { L.T.quaternion.slerp(lT, wPlant); L.C.quaternion.slerp(lC, wPlant); L.F.quaternion.slerp(lF, wPlant); }
    /* toes stay flat on the canvas while the heel lifts; in the air they follow the foot */
    const qToeFlat = _q[0].setFromAxisAngle(UP, yaw - L.restYaw).multiply(L.qToeRest), lO = _q[1].copy(qF).invert().multiply(qToeFlat); const inAir = f.swing ? sstep(0, 0.012, f.y - this.ballY) : 0; lO.slerp(L.qToeLocalRest, inAir); if (wPlant >= 0.999) L.O.quaternion.copy(lO); else L.O.quaternion.slerp(lO, wPlant);
    void _m2;
  }

  /* ---------- arms: last, against the other man's final pose this frame ---------- */
  solve(match, dt) { this._solveHands(false, dt); this._solveHands(true, dt); this.fighter.root.updateMatrixWorld(true); }
  /* Guarding hands first on both men, punching hands second, so a blocked punch lands on where the guard really is this frame. */
  _solveHands(punching, dt) {
    const me = this.me, foe = this.foe; if (!me) return; const up = 1 - this.wDown; if (up <= 0.001) return;
    if (!punching) { const tired = me.sta < 25 ? (25 - me.sta) / 25 : 0, bad = sstep(12.5, 17.5, me.head ?? 0), staggerDrop = me.stagger > 0 ? 0.1 : 0;
      this.low = damp(this.low, tired * 0.07 + bad * 0.15 + staggerDrop + (me.stun > 0.12 ? 0.03 : 0) + this.relax * 0.2 + this.lose * 0.22, 5, dt); }
    const ph = this.pu ? this.pu.def.hand : null; let did = false;
    for (const s of ['L', 'R']) if ((s === ph) === punching) { this._arm(s, me, foe, dt, up); did = true; }
    if (did) this.fighter.root.updateMatrixWorld(true);
  }
  _arm(s, me, foe, dt, up) {
    const A = this.arms[s], pu = this.pu, S = wp(A.U, _v[0]), El = wp(A.F, _v[1]), K = _v[2].copy(A.knuckle).applyMatrix4(A.H.matrixWorld); const T = _v[3].copy(K); const c = Math.cos(this.yaw), sn = Math.sin(this.yaw); let w = 0;
    const isPunch = pu && pu.def.hand === s; const sign = s === 'L' ? 1 : -1;
    /* guard: gloves come in tight to the temples, by sim's guard value. Anchored to the neck, which a head snap does not throw around. */
    const neck = wp(this.B.Bip01_Neck, _v[4]); const g = (me.guard ?? 0) * up * (isPunch ? 1 - this.wClip : 1);
    if (g > 0.001) { const lx = sign * (s === 'L' ? 0.085 : 0.1), ly = 0.16, lz = s === 'L' ? 0.19 : 0.15; T.lerp(_v[5].set(neck.x + lx * c + lz * sn, neck.y + ly, neck.z - lx * sn + lz * c), g); }
    /* hands drop with fatigue, head load and in a break */
    const dr = this.low * (isPunch ? 1 - this.wClip : 1) * up; if (dr > 0.0005) { T.y -= dr; T.x += sn * dr * 0.2; T.z += c * dr * 0.2; }
    /* flinch from a blocked or landed blow */
    T.addScaledVector(this.sHand.x, up * (isPunch ? 0.3 : 1));
    /* winner's raised hand */
    if (this.win > 0.002) { const hand = 'R'; if (s === hand) { const lift = this.win, wave = Math.sin(this.clock * 3.4) * 0.03; T.lerp(_v[5].set(S.x - c * 0.1 + sn * 0.06, S.y + 0.62 + wave, S.z + sn * 0.1 + c * 0.06), lift); } else T.lerp(_v[5].set(S.x + (c * 0.1 + sn * 0.1) * sign, S.y - 0.62, S.z + (-sn * 0.1 + c * 0.1) * sign), this.win * 0.9); }
    /* the punch */
    let pole = null;
    if (isPunch && this.wAim > 0 && this.opponent) { const P = this._aimPoint(pu, s, me, foe, S); this._reachAssist(P, S, El, K, A, this.wAim); wp(A.U, S); wp(A.F, El); K.copy(A.knuckle).applyMatrix4(A.H.matrixWorld); T.lerp(P, this.wAim); w = this.wAim; pole = this.pu.def.approach; }
    /* two-bone solve: the knuckle point is rigid with the forearm */
    const a = El.distanceTo(S), b = K.distanceTo(El); const v = _v[6].copy(T).sub(S); let d = v.length(); v.divideScalar(d || 1); d = clamp(d, Math.abs(a - b) + 0.02, (a + b) * 0.9985);
    const ca = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), h = a * Math.sqrt(1 - ca * ca);
    const elbowOff = _v[7].copy(El).sub(S); let perp = _v[8].copy(elbowOff).addScaledVector(v, -elbowOff.dot(v)); if (perp.lengthSq() < 1e-4) perp.set(c * sign * 0.3, -1, -sn * sign * 0.3); perp.normalize();
    if (pole === 'side' && w > 0) { const hk = _v[9].set(c * sign * 0.75, 0.62, -sn * sign * 0.75); hk.addScaledVector(v, -hk.dot(v)).normalize(); perp.lerp(hk, w * 0.8).normalize(); }
    else if ((pole === 'under') && w > 0) { const dn = _v[9].set(c * sign * 0.25, -1, -sn * sign * 0.25); dn.addScaledVector(v, -dn.dot(v)).normalize(); perp.lerp(dn, w * 0.8).normalize(); }
    else if (g > 0.01) { const dn = _v[9].set(c * sign * 0.2, -1, -sn * sign * 0.2 + 0); dn.addScaledVector(v, -dn.dot(v)).normalize(); perp.lerp(dn, g * 0.7).normalize(); }
    if (this.win > 0.002) { const o = s === 'R' ? _v[9].set(c * sign, 0.1, -sn * sign) : _v[9].set(c * sign * 0.5, 0, -sn * sign * 0.5).addScaledVector(_v[12].set(-sn, 0, -c), 0.8); o.addScaledVector(v, -o.dot(v)).normalize(); perp.lerp(o, this.win).normalize(); }
    const E2 = _v[10].copy(S).addScaledVector(v, a * ca).addScaledVector(perp, h), K2 = _v[11].copy(S).addScaledVector(v, d);
    const qU = wq(A.U, _q[0]), qFw = wq(A.F, _q[1]), r1 = _q[2].setFromUnitVectors(_v[12].copy(El).sub(S).normalize(), _v[13].copy(E2).sub(S).normalize());
    const k1 = _v[12].copy(K).sub(El).applyQuaternion(r1).normalize(), r2 = _q[3].setFromUnitVectors(k1, _v[13].copy(K2).sub(E2).normalize());
    const nU = _q[4].copy(r1).multiply(qU), nF = _q[5].copy(r2).multiply(r1).multiply(qFw);
    const parent = wq(A.C, _q[6]); A.U.quaternion.copy(parent).invert().multiply(nU); A.F.quaternion.copy(_q[7].copy(nU).invert()).multiply(nF);
  }
  /* If the target sits a little past the straight arm (he was turned off line, or stepped back in the last moment), the chest
     rolls forward into the punch for the last few centimetres rather than leaving a gap. */
  _reachAssist(P, S, El, K, A, wAim) {
    const a = El.distanceTo(S), b = K.distanceTo(El), short = S.distanceTo(P) - (a + b) * 0.995; if (short <= 0) return;
    const sp = this.B.Bip01_Spine1, pivot = wp(sp, _v[4]), toS = _v[5].copy(S).sub(pivot), toP = _v[6].copy(P).sub(pivot), rs = toS.length(); if (rs < 0.05) return;
    const ang = Math.min(0.17, short / rs) * wAim * wAim, ax = _v[7].crossVectors(toS, toP); const l = ax.length(); if (l < 1e-5) return; ax.divideScalar(l);
    const q = _q[0].setFromAxisAngle(ax, ang), pw = wq(sp.parent, _q[1]), w = wq(sp, _q[2]); sp.quaternion.copy(_q[3].copy(pw).invert()).multiply(_q[4].copy(q).multiply(w)); sp.updateMatrixWorld(true);
  }
  /* The point on the other man the knuckles should reach, at the body's real position this frame. */
  _aimPoint(pu, s, me, foe, S) {
    const O = this.opponent, def = pu.def, p = pu.ref, sign = s === 'L' ? 1 : -1, cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    if (pu.froze) return this.aimP;
    const P = this.aimP; const headShot = def.tgt === 'head'; const fit = headShot ? O.headFit : O.chestFit, bone = headShot ? O.B.Bip01_Head : O.B.Bip01_Spine1, C = _v[4].copy(fit.c).applyMatrix4(bone.matrixWorld), qb = wq(bone, _q[6]);
    /* direction from the target toward where the glove comes from */
    const n = _v[5].copy(S).sub(C); if (def.approach === 'ribs') n.y = 0; n.normalize(); const lat = _v[6].set(cy * sign, 0, -sy * sign);
    if (def.approach === 'side') n.multiplyScalar(0.52).addScaledVector(lat, 0.85).normalize();
    else if (def.approach === 'under') { n.multiplyScalar(0.62); n.y = 0; n.addScaledVector(UP, -0.78).normalize(); }
    else if (def.approach === 'ribs') { n.multiplyScalar(0.8).addScaledVector(lat, 0.6).normalize(); C.y -= 0.03; }
    else n.addScaledVector(lat, 0.1).normalize();
    /* radius of the fitted ellipsoid along n */
    const q = _q[7].copy(qb).invert(), nl = _v[7].copy(n).applyQuaternion(q), r = fit.r, rad = 1 / Math.sqrt((nl.x * nl.x) / (r.x * r.x) + (nl.y * nl.y) / (r.y * r.y) + (nl.z * nl.z) / (r.z * r.z));
    P.copy(C).addScaledVector(n, rad * (this.tune ? this.tune.skin : 0.94));
    /* a blocked shot lands on the guard, not through it */
    if (headShot && (p.result ? p.blocked : foe.guard >= 0.5)) { const gl = O.gloveWorld('L'), gr = O.gloveWorld('R'), near = gl.distanceToSquared(S) < gr.distanceToSquared(S) ? gl : gr; const toS = _v[8].copy(S).sub(near).normalize(); P.copy(near).addScaledVector(toS, 0.062); }
    /* a slip leaves the glove going where the head was, but only a head shot and only while the sim would call it evaded: anything else really lands, on the man as he is */
    if (headShot && foe.slip > 0 && (foe.slipT ?? 0) >= 0.04 && (foe.slipT ?? 0) <= 0.22) P.copy(this.lastHeadAim); else this.lastHeadAim.copy(P);
    if (p.result || p.t >= p.contact + (p.active ?? 0.05)) pu.froze = true;
    return P;
  }

  /* ---------- face and skin ---------- */
  _faceAndSkin(me, foe, dt, match, E) {
    const { bad, warn, tired, fatigue } = E, F = this.fighter, m = this.face;
    this.wince = damp(this.wince, 0, 5, dt); this.body = damp(this.body, 0, 3.5, dt); this.effort = damp(this.effort, 0, 9, dt); this.dazed = damp(this.dazed, 0, 1.5, dt);
    this.blink -= dt; if (this.blink <= 0) { this.blinkDur = bad > 0.5 ? 0.42 : 0.12; this.blinkT = this.blinkDur; this.blink = bad > 0.5 ? 1.8 + this.rnd() * 1.6 : 2.4 + this.rnd() * 3; }
    if (this.blinkT > 0) this.blinkT = Math.max(0, this.blinkT - dt);
    const bl = this.blinkT > 0 ? Math.sin((1 - this.blinkT / this.blinkDur) * Math.PI) : 0;
    const breath = 0.5 + 0.5 * Math.sin(this.clock * lerp(1.6, 4.2, fatigue));
    const out = this.D ? 1 : 0, cold = out && (!me.down || (me.down.up ?? 0) < 0.15) ? 1 : 0, won = this.win;
    const set = (k, v) => { m[k] = v; F.morph(k, clamp(v)); };
    const closed = Math.max(bl, cold * 0.85, this.wince * 0.25);
    set('blinkL', closed); set('blinkR', closed);
    set('jawOpen', clamp(0.03 + fatigue * 0.16 * breath + bad * 0.16 + this.body * 0.36 + this.wince * 0.14 + this.effort * 0.05 + out * 0.24 + won * 0.1 + this.dazed * 0.12));
    set('squintL', clamp(this.wince * 0.9 + warn * 0.18 + bad * 0.1 + Math.sin(this.clock * 0.7) * warn * 0.1 + this.effort * 0.28)); set('squintR', clamp(this.wince * 0.9 + warn * 0.26 + bad * 0.14 + this.effort * 0.28));
    set('browDownL', clamp(this.wince * 0.85 + 0.12 * (1 - bad) * (1 - won) + this.effort * 0.5)); set('browDownR', clamp(this.wince * 0.85 + 0.12 * (1 - bad) * (1 - won) + this.effort * 0.5));
    set('browInnerUp', clamp(bad * 0.55 + tired * 0.25 + this.body * 0.45 + out * 0.3 + this.dazed * 0.3));
    set('frownL', clamp(this.wince * 0.45 + this.body * 0.3 + bad * 0.12)); set('frownR', clamp(this.wince * 0.45 + this.body * 0.3 + bad * 0.12));
    set('stretchL', clamp(this.wince * 0.38 + this.body * 0.3 + this.effort * 0.2)); set('stretchR', clamp(this.wince * 0.38 + this.body * 0.3 + this.effort * 0.2));
    set('smileL', won * 0.55); set('smileR', won * 0.55); set('funnel', clamp(this.effort * 0.22 + fatigue * 0.1 * breath));
    set('wideL', clamp(this.dazed * 0.2)); set('wideR', clamp(this.dazed * 0.2));
    /* sweat builds with work and never comes off in a hurry */
    const want = clamp(0.06 + (me.fat ?? 0) * 1.5 + fatigue * 0.28 + (match.time ?? 0) / 220); this.sweat = want > this.sweat ? damp(this.sweat, want, 0.5, dt) : damp(this.sweat, want, 0.05, dt);
    F.setSweat(this.sweat); F.setFlush(clamp(fatigue * 0.4 + (me.fat ?? 0) * 0.9 + this.wince * 0.2));
  }
}
