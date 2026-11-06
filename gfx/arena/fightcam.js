/* The fight camera. Side-on to the line between the two men, the way a Tekken camera sits: both in frame, the player on the left,
   pulling back as they separate, and orbiting slowly after the line as they circle. It reads the sim and the rigs and writes only the camera.

     const cam = createFightCam(engine.camera, { reducedMotion, shake, canvasY });
     each frame: cam.update(match, rigP, rigO, realDt);   engine.post.focus = cam.getFocus();   engine.post.aperture = cam.getAperture();
     on a landed punch: cam.kick(power, dir);
     for input: cam.basis() -> { rx, rz, fx, fz }, the screen's right and into-the-screen directions on the canvas, without any shake.

   The orbit angle th is where the camera sits around the target: offset (sin th, cos th) on x, z. th 0 looks down -Z with +X on the right.
   The camera stays still while the line between the men moves inside a dead zone. Past the edge of the zone it slides along with the line and stops when the line comes back,
   so it never travels further than the line makes it. The player can never end up on the right, and the rate is capped so it can never whip round.
   The men in corners and walking to them are held on a wide view, side-on to the line between where they will be in a moment, which ends side-on to the line between the two corners.
   A tall screen cannot hold two men far apart side by side, so there it turns off side-on, behind the player, and rises: the height of the screen shows the distance between them.

   Kick and shake are off when the settings say so. Reduced motion also drops the round-start dolly and the push-in at the end. */
import * as THREE from 'three';

const TAU = Math.PI * 2;
const wrap = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const BASE_TAN = Math.tan(THREE.MathUtils.degToRad(38 / 2));
const MAX_TAN = Math.tan(THREE.MathUtils.degToRad(62 / 2));
const TALL_MAX_TAN = 0.92;       // on a tall screen the lens is already at MAX_TAN, so against a wall it may open further than that, or a man leaves the frame
const TALL_FIT_TAN = 0.72;       // the widest lens a calm view on a tall screen may need before the camera turns off side-on instead
const TALL_TURN = 1.42;          // radians off side-on it may turn at most: beyond that the men stand in line with the lens
const TALL_LIFT = 1.35;          // metres it rises at that angle, so the far man stands above the near one on the screen
const WALK_AHEAD = 2.8;          // metres further along their walk to the corners that the view between rounds already aims for: about the 1.75 s that half of a half turn takes at the calm rate
const MIN_TAN_H = 0.36;         // a narrow screen widens the lens until this much sideways view is left
const BODY_TOP = 1.97;          // metres above the canvas that must stay in frame: head plus raised gloves
const WIN_TOP = 2.5;            // the same at the end, when the winner raises a hand under the HUD
const LOOK_H = 0.88;            // look-at height above the canvas
const TOP_ROOM = 0.70;          // part of the upper half of the screen a head may use: the HUD owns the rest
const BOTTOM_ROOM = 0.92;
const SIDE_MARGIN = 0.62;       // metres kept clear beside each man
const MIN_DIST = 2.6, MAX_DIST = 9.5;
const LIMIT = 6.1;              // camera stays inside this square: the columns stand at 6.3
const MAX_RATE = 3.4;           // rad/s, the orbit never goes faster than this
const APERTURE = 0.013;         // film aperture in a fight: the room behind the ring softens, the men and the canvas around them do not
const SHARP = 1.6;              // metres each side of the focal plane that stay fully sharp
/* deadOut, deadIn: radians off the aim where turning starts and stops. gain: how hard an error past the edge is followed. calm: rate limit outside the fight, tallCalm the same on a tall screen, which has further to turn and less time before the men leave the view.
   softRate: rate limit in the fight while the line is under softAt off the aim, so a quick swing of the line does not whip the room past; further off it may use the full MAX_RATE.
   bias: radians of the aim behind the player's shoulder. slack: metres the frame centre may lag the men. distSlack: metres of extra distance kept before coming in. */
const ORBIT = { deadOut: 0.66, deadIn: 0.64, softRate: 2.2, softAt: 0.8, gain: 20, smooth: 14, calm: 0.9, heldGain: 1.2, tallCalm: 1.5, tallGain: 2.4, bias: 0.08, slack: 0.14, distSlack: 0.3 };

export function createFightCam(camera, opts = {}) {
  const reduced = !!opts.reducedMotion, canvasY = opts.canvasY ?? 0.75, stage = opts.stage || null;
  const postHidden = [false, false, false, false];
  let shakeOn = opts.shake !== false && !reduced;
  const O = { ...ORBIT, ...(opts.orbit || {}) };
  const S = { init: false, th: 0, om: 0, d: 4.6, x: 0, z: 0, look: LOOK_H, wide: 1, push: 0, tan: BASE_TAN, focus: 4.6, ap: APERTURE, sharp: SHARP, init2: false, err: 0, follow: false, shift: 0, shiftTo: 0, up: 0, side: -1, tallSt: '' };
  const corners = stage && stage.corners ? stage.corners : { blue: { x: -2.5, z: -2.5 }, red: { x: 2.5, z: 2.5 } };
  const cornerTh = Math.atan2(-(corners.red.z - corners.blue.z), corners.red.x - corners.blue.x);
  const hereP = [0, 0], hereO = [0, 0];
  const cornerOf = (f) => corners[f.corner] || corners.blue;
  const kickP = new THREE.Vector3(), kickV = new THREE.Vector3(), look = new THREE.Vector3(), fwd = new THREE.Vector3();
  let roll = 0, rollV = 0, zoom = 0, zoomV = 0, rumble = 0, t = 0, fovNow = 0;
  const basisOut = { rx: 1, rz: 0, fx: 0, fz: -1 };

  /* Distance from the target that frames one point: a is its offset along the screen's right, b its offset into the screen. */
  function needFor(a, b, tanH, tanV, lookH, bodyTop = BODY_TOP) {
    const side = (Math.abs(a) + SIDE_MARGIN) / tanH;
    const top = (bodyTop - lookH) / (TOP_ROOM * tanV);
    const bottom = lookH / (BOTTOM_ROOM * tanV);
    return Math.max(side, top, bottom) - b;
  }

  /* How far along (nx, nz) from the frame centre the camera can go inside the room */
  const roomDist = (nx, nz) => Math.min(MAX_DIST, Math.abs(nx) > 1e-3 ? ((nx > 0 ? LIMIT : -LIMIT) - S.x) / nx : 1e9, Math.abs(nz) > 1e-3 ? ((nz > 0 ? LIMIT : -LIMIT) - S.z) / nz : 1e9);
  const camLift = (d, up) => 0.97 + 0.11 * Math.max(0, d - 4.4) + S.wide * 0.3 + up * TALL_LIFT;
  const tallUp = (off) => sstep(0.35, 1.25, Math.abs(off));

  /* Tall screens work with the real picture, because the far man and the near man differ so much in size: columns, each x, z and the height of its top */
  const cols = new Float64Array(9); let nCols = 0;
  const addCol = (x, z, h) => { cols[nCols * 3] = x; cols[nCols * 3 + 1] = z; cols[nCols * 3 + 2] = h; nCols++; };
  /* The lens (tan of half the vertical view) that holds every column from camera position x, y, z looking at the frame centre */
  function lensFrom(x, y, z, aspect) {
    const lx = S.x - x, ly = canvasY + S.look - y, lz = S.z - z, l = Math.hypot(lx, ly, lz) || 1, vx = lx / l, vy = ly / l, vz = lz / l;
    const hl = Math.hypot(vx, vz) || 1, rx = -vz / hl, rz = vx / hl, ux = -rz * vy, uy = rz * vx - rx * vz, uz = rx * vy;
    const roomUp = Math.max(0.2, TOP_ROOM - 2 * S.shift), roomDown = BOTTOM_ROOM + 2 * S.shift;
    let t = 0;
    for (let i = 0; i < nCols; i++) {
      const qx = cols[i * 3] - x, qz = cols[i * 3 + 1] - z;
      for (let k = 0; k < 2; k++) {
        const qy = canvasY + (k ? cols[i * 3 + 2] : 0) - y, depth = Math.max(0.5, qx * vx + qy * vy + qz * vz), side = Math.abs(qx * rx + qz * rz), v = qx * ux + qy * uy + qz * uz;
        t = Math.max(t, (side + SIDE_MARGIN) / (depth * aspect), v / (depth * roomUp), -v / (depth * roomDown));
      }
    }
    return t;
  }
  /* The same from orbit angle th, with the camera as far back as the room lets it. off: radians off side-on, which sets how high it is. */
  function lensAt(th, off, aspect) {
    const nx = Math.sin(th), nz = Math.cos(th), d = roomDist(nx, nz);
    return lensFrom(S.x + nx * d, canvasY + camLift(d, tallUp(off)), S.z + nz * d, aspect);
  }

  function update(match, rigP, rigO, dt) {
    const p = match.p, o = match.o;
    t += dt;
    let dx = o.x - p.x, dz = o.z - p.z; const sep = Math.hypot(dx, dz) || 1e-3; dx /= sep; dz /= sep;
    const sideOn = Math.atan2(-dz, dx);
    const aspect = camera.aspect || 16 / 9;
    const tanV = clamp(Math.max(BASE_TAN, MIN_TAN_H / aspect), BASE_TAN, MAX_TAN), tanH = tanV * aspect;
    const st = match.state, over = st === 'over', downed = p.down ? p : o.down ? o : null;

    /* where the frame should be centred */
    let cx = (p.x + o.x) / 2, cz = (p.z + o.z) / 2;
    if (downed) {
      /* the lying man's body can be a metre from where the sim keeps him, and the frame leans his way */
      const rig = downed === p ? rigP : rigO, standing = downed === p ? o : p, h = rig.headWorld();
      cx = (h.x * 0.55 + downed.x * 0.15 + standing.x * 0.3); cz = (h.z * 0.55 + downed.z * 0.15 + standing.z * 0.3);
    }

    const first = !S.init;
    if (first) {
      S.init = true; S.th = sideOn - O.bias; S.om = 0; S.follow = false; S.x = cx; S.z = cz; S.wide = reduced ? 0 : 1; S.push = 0; S.look = LOOK_H; S.tan = tanV;
      kickP.set(0, 0, 0); kickV.set(0, 0, 0); roll = rollV = zoom = zoomV = rumble = 0;
    }

    /* orbit. In a fight it aims a little behind the player's shoulder of side-on, because with both men orthodox a square view shows the rival's back. */
    const held = st === 'break' || st === 'intro', calm = held || st === 'down' || over;
    let want = sideOn - O.bias, aimed = held;
    if (held) {
      /* where the two of them will stand in a moment. Standing in their corners that is the corner line, and two men who have to swap sides have the camera half way round as they pass. */
      let lineTh = cornerTh;
      if (st === 'break') {
        const ahead = (f, c, out) => { const ax = c.x - f.x, az = c.z - f.z, l = Math.hypot(ax, az), k = l > WALK_AHEAD ? WALK_AHEAD / l : 1; out[0] = f.x + ax * k; out[1] = f.z + az * k; };
        ahead(p, cornerOf(p), hereP); ahead(o, cornerOf(o), hereO);
        lineTh = Math.atan2(-(hereO[1] - hereP[1]), hereO[0] - hereP[0]);
      }
      want = lineTh;
    }
    const tall = aspect < 1;
    const nowCols = () => {
      nCols = 0;
      for (const [f, rig] of [[p, rigP], [o, rigO]]) {
        addCol(f.x, f.z, f.down && f.down.rising == null ? 0.6 : over ? WIN_TOP : BODY_TOP);
        if (f.down) { const h = rig.headWorld(); addCol(h.x, h.z, 0.6); }
      }
    };
    if (tall && calm) {
      nowCols();
      if (held) {
        /* the turn is made while they are still close, because half way round two men already far apart do not fit at all */
        if (st === 'break') { nCols = 0; addCol(hereP[0], hereP[1], BODY_TOP); addCol(hereO[0], hereO[1], BODY_TOP); }
        /* the least turn that holds them both, on the side of the line it comes from: behind the player, or behind the rival if that is the shorter way round */
        if (st !== S.tallSt) { S.tallSt = st; if (st === 'break') S.side = wrap(S.th - want) > 0 ? 1 : -1; }
        let best = want, bestT = 1e9;
        for (let off = 0; off <= TALL_TURN; off += 0.06) {
          const t = lensAt(want + S.side * off, off, aspect);
          if (t < bestT) { bestT = t; best = want + S.side * off; }
          if (t <= TALL_FIT_TAN) break;
        }
        want = best;
      } else if (lensAt(S.th, wrap(sideOn - O.bias - S.th), aspect) > TALL_FIT_TAN) {
        /* the count and the end: it stays where it is while they both fit, and turns no further than it must */
        const line = sideOn - O.bias; let best = S.th, bestT = 1e9;
        for (let k = 1; k <= 26; k++) {
          for (const s of [-1, 1]) {
            const th1 = S.th + s * k * 0.06, off = wrap(line - th1);
            if (Math.abs(off) > TALL_TURN) continue;
            const t = lensAt(th1, off, aspect);
            if (t < bestT) { bestT = t; best = th1; }
          }
          if (bestT <= TALL_FIT_TAN) break;
        }
        want = best; aimed = true;
      }
    }
    if (first && held) S.th = want;
    let err = wrap(want - S.th);
    /* nearly opposite: keep turning the way it already turns instead of dithering at the far side */
    if (Math.abs(err) > 2.7 && S.om * err < 0) err += err > 0 ? -TAU : TAU;
    S.err = wrap(sideOn - S.th);
    const ae = Math.abs(err);
    if (aimed) S.follow = ae > 0.02; else if (S.follow) { if (ae < O.deadIn) S.follow = false; } else if (ae > O.deadOut) S.follow = true;
    /* past the edge of the dead zone it slides along with the line and stops as soon as the line comes back, so swings inside the zone never move it */
    const past = err > O.deadIn ? err - O.deadIn : err < -O.deadIn ? err + O.deadIn : 0, limit = calm ? O.calm : O.softRate + (MAX_RATE - O.softRate) * sstep(O.softAt, O.softAt + 0.35, ae);
    const wantOm = !S.follow ? 0 : aimed ? clamp((tall ? O.tallGain : O.heldGain) * err, -(tall ? O.tallCalm : limit), tall ? O.tallCalm : limit) : clamp(O.gain * past, -limit, limit);
    S.om += (wantOm - S.om) * (1 - Math.exp(-O.smooth * dt));
    S.th = wrap(S.th + S.om * dt);

    const nx = Math.sin(S.th), nz = Math.cos(S.th), rx = nz, rz = -nx, fx = -nx, fz = -nz;
    basisOut.rx = rx; basisOut.rz = rz; basisOut.fx = fx; basisOut.fz = fz;

    /* target */
    /* a little slack, so footwork does not move the picture. The distance below is worked out from where the men really are, so nobody can leave the frame because of it. */
    {
      const ox = cx - S.x, oz = cz - S.z, ol = Math.hypot(ox, oz), slack = downed || held ? 0 : O.slack;
      if (ol > slack) { const k = 1 - slack / ol, rate = downed ? 2.6 : 5.0; S.x = damp(S.x, S.x + ox * k, rate, dt); S.z = damp(S.z, S.z + oz * k, rate, dt); }
    }
    const lookWant = downed ? LOOK_H - 0.2 : over && match.result && match.result.how !== 'decision' ? LOOK_H - 0.08 : LOOK_H;
    S.look = damp(S.look, lookWant, 2.2, dt);

    /* how far back: the worst of both men, from their real positions */
    let need = MIN_DIST;
    for (const [f, rig] of [[p, rigP], [o, rigO]]) {
      const ax = f.x - S.x, az = f.z - S.z;
      need = Math.max(need, needFor(ax * rx + az * rz, ax * fx + az * fz, tanH, tanV, S.look, over ? WIN_TOP : BODY_TOP));
      if (f.down) { const h = rig.headWorld(), hx = h.x - S.x, hz = h.z - S.z; need = Math.max(need, needFor(hx * rx + hz * rz, hx * fx + hz * fz, tanH, tanV, S.look)); }
    }
    /* the walk to the marks and back to the corners is seen from further out and higher */
    let wideWant = 0;
    if (!reduced) {
      if (st === 'intro') wideWant = 1 - sstep(0.15, 1, match.stateT / 2.4);
      else if (st === 'break') wideWant = sstep(0.6, 2.2, match.stateT);
    }
    S.wide = damp(S.wide, wideWant, 1.8, dt);
    S.push = damp(S.push, over && !reduced ? 1 : 0, 0.55, dt);
    const needBare = need;
    need = clamp(need + S.wide * 1.0 - S.push * 0.45, MIN_DIST, MAX_DIST);
    /* pulls back at once when it has to and comes in late and slowly, so it does not breathe with every step */
    if (need > S.d) S.d = damp(S.d, need, 6.5, dt); else if (need < S.d - O.distSlack) S.d = damp(S.d, need + O.distSlack, 1.1, dt);

    /* place it, inside the room: a clamped camera widens the lens instead of losing someone from the frame */
    S.up = damp(S.up, tall && calm ? tallUp(wrap(sideOn - O.bias - S.th)) : 0, 2.2, dt);
    const lift = camLift(S.d, S.up);
    let px = S.x + nx * S.d, pz = S.z + nz * S.d; let dHave = S.d;
    const lim = Math.max(MIN_DIST, Math.min(Math.abs(nx) > 1e-3 ? ((nx > 0 ? LIMIT : -LIMIT) - S.x) / nx : 1e9, Math.abs(nz) > 1e-3 ? ((nz > 0 ? LIMIT : -LIMIT) - S.z) / nz : 1e9));
    if (S.d > lim) { dHave = lim; px = S.x + nx * dHave; pz = S.z + nz * dHave; }
    let tanWant;
    if (tall) {
      /* the lens answers to where the camera is going, not to where its smoothing has got to, so it does not breathe with footwork */
      nowCols();
      const dLens = Math.min(Math.max(dHave, Math.min(needBare, MAX_DIST)), lim);
      tanWant = clamp(lensFrom(S.x + nx * dLens, canvasY + lift, S.z + nz * dLens, aspect), tanV, TALL_MAX_TAN);
    } else tanWant = clamp(tanV * Math.max(1, S.d / dHave), BASE_TAN, MAX_TAN);
    S.tan = damp(S.tan, tanWant, 5, dt);

    /* kick and shake */
    if (shakeOn) {
      const w = 26, zeta = 0.42, K = w * w, C = 2 * zeta * w;
      kickV.x += (-K * kickP.x - C * kickV.x) * dt; kickV.y += (-K * kickP.y - C * kickV.y) * dt; kickV.z += (-K * kickP.z - C * kickV.z) * dt;
      kickP.addScaledVector(kickV, dt);
      rollV += (-K * roll - C * rollV) * dt; roll += rollV * dt;
      zoomV += (-K * 0.6 * zoom - C * 0.8 * zoomV) * dt; zoom += zoomV * dt;
      rumble = Math.max(0, rumble - dt * 3.4);
    }
    const y = canvasY + lift;
    camera.position.set(px + kickP.x, y + kickP.y, pz + kickP.z);
    if (rumble > 0.001) { const a = rumble * rumble * 0.016; camera.position.x += Math.sin(t * 71) * a * rx + Math.sin(t * 57) * a * 0.4 * fx; camera.position.z += Math.sin(t * 71) * a * rz + Math.sin(t * 57) * a * 0.4 * fz; camera.position.y += Math.sin(t * 83 + 1.3) * a; }
    look.set(S.x, canvasY + S.look, S.z);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    if (roll !== 0) camera.rotateZ(roll);
    /* the end panel takes one side of the screen: the picture slides out from under it */
    S.shift = reduced ? S.shiftTo : damp(S.shift, S.shiftTo, 3.2, dt);
    if (S.shift > 0.001) { const W = 1000, H = W / aspect, tall = aspect < 1; camera.setViewOffset(W, H, tall ? 0 : S.shift * W, tall ? S.shift * H : 0, W, H); fovNow = 0; } else if (camera.view && camera.view.enabled) { camera.clearViewOffset(); fovNow = 0; }
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(S.tan)) - zoom;
    if (Math.abs(fov - fovNow) > 1e-3) { fovNow = fov; camera.fov = fov; camera.updateProjectionMatrix(); }
    /* a corner post between the camera and either man fades out: side-on framing goes past every corner sooner or later */
    if (stage && stage.posts) {
      const px1 = camera.position.x, pz1 = camera.position.z;
      const a1 = (p.x - px1) * rx + (p.z - pz1) * rz, b1 = Math.max(0.5, (p.x - px1) * fx + (p.z - pz1) * fz), a2 = (o.x - px1) * rx + (o.z - pz1) * rz, b2 = Math.max(0.5, (o.x - px1) * fx + (o.z - pz1) * fz);
      const lo = Math.min((a1 - 0.6) / b1, (a2 - 0.6) / b2), hi = Math.max((a1 + 0.6) / b1, (a2 + 0.6) / b2), far = Math.max(b1, b2);
      for (let i = 0; i < 4; i++) {
        const q = stage.posts[i], a = (q[0] - px1) * rx + (q[1] - pz1) * rz, b = (q[0] - px1) * fx + (q[1] - pz1) * fz, m = postHidden[i] ? 0.14 : 0, mFar = postHidden[i] ? 0.45 : 0;
        /* wider than the pad itself; and one close to the lens goes whether or not it covers anyone, because it is a big pale strip down the side of the picture. Beside the lens it goes as well, so the camera can never sit inside one. */
        const hide = Math.hypot(a, b) < 1.3 || (b > 0.05 && ((b < far && (a + 0.38) / b > lo - m && (a - 0.38) / b < hi + m) || (b < 3.9 + mFar && Math.abs(a / b) < tanH + 0.4)));
        if (hide !== postHidden[i]) { postHidden[i] = hide; stage.setPostAlpha(i, hide ? 0 : 1); }
      }
    }
    /* focus on the plane through the two men, measured the way the depth buffer measures it */
    camera.getWorldDirection(fwd);
    S.focus = Math.max(0.5, (look.x - camera.position.x) * fwd.x + (look.y - camera.position.y) * fwd.y + (look.z - camera.position.z) * fwd.z);
    /* the sharp zone always reaches both men, so neither goes soft however they stand. Wide shots and the end of the fight stop down to almost deep focus. */
    {
      const dp = Math.abs((p.x - camera.position.x) * fx + (p.z - camera.position.z) * fz - S.focus), dq = Math.abs((o.x - camera.position.x) * fx + (o.z - camera.position.z) * fz - S.focus);
      const sharp = Math.max(SHARP, Math.max(dp, dq) + 0.45), deep = Math.max(S.wide, over ? 1 : 0, held ? 1 : 0);
      const want2 = APERTURE * (1 - 0.8 * deep) * (BASE_TAN / S.tan); /* a wider lens, on a tall screen, shows the men smaller, so the same blur would be more of them */
      S.ap = S.init2 ? damp(S.ap, want2, 2.4, dt) : want2; S.sharp = S.init2 ? damp(S.sharp, sharp, 5, dt) : sharp; S.init2 = true;
    }
  }

  /* power 0..1. dir, optional, is the blow's direction [x, z]: the camera gives way along it. */
  function kick(power = 0.5, dir = null) {
    if (!shakeOn) return;
    const p = clamp(power, 0, 1), a = 0.18 + p * 0.95;
    if (dir) { kickV.x += dir[0] * a * 0.42; kickV.z += dir[1] * a * 0.42; }
    kickV.y -= a * 0.34;
    rollV += (dir && dir[0] * basisOut.rx + dir[1] * basisOut.rz < 0 ? 1 : -1) * a * 0.075;
    zoomV += a * 13;
    rumble = Math.max(rumble, p * 0.9);
  }

  return {
    update, kick,
    getFocus() { return S.focus; },
    getAperture() { return S.ap; },
    getSharp() { return S.sharp; },
    basis() { return basisOut; },
    /* the next update starts clean, on the line, with no leftover motion */
    snap() { S.init = false; S.init2 = false; S.shift = 0; S.shiftTo = 0; S.side = -1; S.tallSt = ''; S.up = 0; },
    /* how far to slide the picture, as a part of the screen: to the left on a wide screen, upward on a tall one */
    setShift(v) { S.shiftTo = v; },
    setShake(on) { shakeOn = !!on && !reduced; if (!shakeOn) { kickP.set(0, 0, 0); kickV.set(0, 0, 0); roll = rollV = zoom = zoomV = rumble = 0; } },
    get shake() { return shakeOn; },
    stats() { return { th: S.th, om: S.om, err: S.err, d: S.d, tan: S.tan, wide: S.wide, push: S.push, follow: S.follow, postHidden }; },
  };
}
