/* The fight camera. Side-on to the line between the two men, the way a Tekken camera sits: both in frame, the player on the left,
   pulling back as they separate, and orbiting slowly after the line as they circle. It reads the sim and the rigs and writes only the camera.

     const cam = createFightCam(engine.camera, { reducedMotion, shake, canvasY });
     each frame: cam.update(match, rigP, rigO, realDt);   engine.post.focus = cam.getFocus();   engine.post.aperture = cam.getAperture();
     on a landed punch: cam.kick(power, dir);
     for input: cam.basis() -> { rx, rz, fx, fz }, the screen's right and into-the-screen directions on the canvas, without any shake.

   The orbit angle th is where the camera sits around the target: offset (sin th, cos th) on x, z. th 0 looks down -Z with +X on the right.
   Orbit speed follows the angle error softly when it is small and hard when it is large, so ordinary circling moves the room little
   while the player can never end up on the right for long, and the rate is capped so it can never whip round.

   Kick and shake are off when the settings say so. Reduced motion also drops the round-start dolly and the push-in at the end. */
import * as THREE from 'three';

const TAU = Math.PI * 2;
const wrap = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const BASE_TAN = Math.tan(THREE.MathUtils.degToRad(38 / 2));
const MAX_TAN = Math.tan(THREE.MathUtils.degToRad(62 / 2));
const MIN_TAN_H = 0.36;         // a narrow screen widens the lens until this much sideways view is left
const BODY_TOP = 1.97;          // metres above the canvas that must stay in frame: head plus raised gloves
const LOOK_H = 0.88;            // look-at height above the canvas
const TOP_ROOM = 0.70;          // part of the upper half of the screen a head may use: the HUD owns the rest
const BOTTOM_ROOM = 0.92;
const SIDE_MARGIN = 0.62;       // metres kept clear beside each man
const MIN_DIST = 2.6, MAX_DIST = 9.5;
const LIMIT = 6.1;              // camera stays inside this square: the columns stand at 6.3
const MAX_RATE = 3.4;           // rad/s, the orbit never goes faster than this
const APERTURE = 0.016;         // film aperture when both men stand near the focal plane

export function createFightCam(camera, opts = {}) {
  const reduced = !!opts.reducedMotion, canvasY = opts.canvasY ?? 0.75, stage = opts.stage || null;
  const postHidden = [false, false, false, false];
  let shakeOn = opts.shake !== false && !reduced;
  const S = { init: false, th: 0, om: 0, d: 4.6, x: 0, z: 0, look: LOOK_H, wide: 1, push: 0, tan: BASE_TAN, focus: 4.6, ap: APERTURE, init2: false, err: 0 };
  const kickP = new THREE.Vector3(), kickV = new THREE.Vector3(), look = new THREE.Vector3(), fwd = new THREE.Vector3();
  let roll = 0, rollV = 0, zoom = 0, zoomV = 0, rumble = 0, t = 0, fovNow = 0;
  const basisOut = { rx: 1, rz: 0, fx: 0, fz: -1 };

  /* Distance from the target that frames one point: a is its offset along the screen's right, b its offset into the screen. */
  function needFor(a, b, tanH, tanV, lookH) {
    const side = (Math.abs(a) + SIDE_MARGIN) / tanH;
    const top = (BODY_TOP - lookH) / (TOP_ROOM * tanV);
    const bottom = lookH / (BOTTOM_ROOM * tanV);
    return Math.max(side, top, bottom) - b;
  }

  function update(match, rigP, rigO, dt) {
    const p = match.p, o = match.o;
    t += dt;
    let dx = o.x - p.x, dz = o.z - p.z; const sep = Math.hypot(dx, dz) || 1e-3; dx /= sep; dz /= sep;
    const want = Math.atan2(-dz, dx);
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

    if (!S.init) {
      S.init = true; S.th = want; S.om = 0; S.x = cx; S.z = cz; S.wide = reduced ? 0 : 1; S.push = 0; S.look = LOOK_H; S.tan = tanV;
      kickP.set(0, 0, 0); kickV.set(0, 0, 0); roll = rollV = zoom = zoomV = rumble = 0;
    }

    /* orbit */
    const calm = st === 'break' || st === 'intro' || st === 'down';
    let err = wrap(want - S.th);
    /* nearly opposite: keep turning the way it already turns instead of dithering at the far side */
    if (Math.abs(err) > 2.7 && S.om * err < 0) err += err > 0 ? -TAU : TAU;
    S.err = err;
    const dead = 0.035, e = err > dead ? err - dead : err < -dead ? err + dead : 0;
    const wantOm = clamp(1.7 * e + 1.2 * e * e * e, calm ? -1.1 : -MAX_RATE, calm ? 1.1 : MAX_RATE);
    S.om += (wantOm - S.om) * (1 - Math.exp(-5.5 * dt));
    S.th = wrap(S.th + S.om * dt);

    const nx = Math.sin(S.th), nz = Math.cos(S.th), rx = nz, rz = -nx, fx = -nx, fz = -nz;
    basisOut.rx = rx; basisOut.rz = rz; basisOut.fx = fx; basisOut.fz = fz;

    /* target */
    S.x = damp(S.x, cx, downed ? 2.6 : 5.0, dt); S.z = damp(S.z, cz, downed ? 2.6 : 5.0, dt);
    const lookWant = downed ? LOOK_H - 0.2 : over && match.result && match.result.how !== 'decision' ? LOOK_H - 0.08 : LOOK_H;
    S.look = damp(S.look, lookWant, 2.2, dt);

    /* how far back: the worst of both men, from their real positions */
    let need = MIN_DIST;
    for (const [f, rig] of [[p, rigP], [o, rigO]]) {
      const ax = f.x - S.x, az = f.z - S.z;
      need = Math.max(need, needFor(ax * rx + az * rz, ax * fx + az * fz, tanH, tanV, S.look));
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
    need = clamp(need + S.wide * 1.0 - S.push * 0.45, MIN_DIST, MAX_DIST);
    S.d = damp(S.d, need, need > S.d ? 6.5 : 1.5, dt);

    /* place it, inside the room: a clamped camera widens the lens instead of losing someone from the frame */
    const lift = 0.97 + 0.11 * Math.max(0, S.d - 4.4) + S.wide * 0.3;
    let px = S.x + nx * S.d, pz = S.z + nz * S.d; let dHave = S.d;
    const over1 = Math.max(Math.abs(px) - LIMIT, Math.abs(pz) - LIMIT, 0);
    if (over1 > 0) {
      const lim = Math.min(
        Math.abs(nx) > 1e-3 ? ((nx > 0 ? LIMIT : -LIMIT) - S.x) / nx : 1e9,
        Math.abs(nz) > 1e-3 ? ((nz > 0 ? LIMIT : -LIMIT) - S.z) / nz : 1e9,
      );
      dHave = Math.max(MIN_DIST, lim); px = S.x + nx * dHave; pz = S.z + nz * dHave;
    }
    const tanWant = clamp(tanV * Math.max(1, S.d / dHave), BASE_TAN, MAX_TAN);
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
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(S.tan)) - zoom;
    if (Math.abs(fov - fovNow) > 1e-3) { fovNow = fov; camera.fov = fov; camera.updateProjectionMatrix(); }
    /* a corner post between the camera and either man fades out: side-on framing goes past every corner sooner or later */
    if (stage && stage.posts) {
      const px1 = camera.position.x, pz1 = camera.position.z;
      const a1 = (p.x - px1) * rx + (p.z - pz1) * rz, b1 = Math.max(0.5, (p.x - px1) * fx + (p.z - pz1) * fz), a2 = (o.x - px1) * rx + (o.z - pz1) * rz, b2 = Math.max(0.5, (o.x - px1) * fx + (o.z - pz1) * fz);
      const lo = Math.min((a1 - 0.6) / b1, (a2 - 0.6) / b2), hi = Math.max((a1 + 0.6) / b1, (a2 + 0.6) / b2), far = Math.max(b1, b2);
      for (let i = 0; i < 4; i++) {
        const q = stage.posts[i], a = (q[0] - px1) * rx + (q[1] - pz1) * rz, b = (q[0] - px1) * fx + (q[1] - pz1) * fz, m = postHidden[i] ? 0.07 : 0;
        /* wider than the pad itself, because a post this close is a big soft blur; and one close to the lens goes whether or not it covers anyone */
        const hide = b > 0.05 && ((b < far && (a + 0.38) / b > lo - m && (a - 0.38) / b < hi + m) || (b < 2.8 + m && Math.abs(a / b) < tanH + 0.2));
        if (hide !== postHidden[i]) { postHidden[i] = hide; stage.setPostAlpha(i, hide ? 0 : 1); }
      }
    }
    /* focus on the plane through the two men, measured the way the depth buffer measures it */
    camera.getWorldDirection(fwd);
    S.focus = Math.max(0.5, (look.x - camera.position.x) * fwd.x + (look.y - camera.position.y) * fwd.y + (look.z - camera.position.z) * fwd.z);
    /* the lens stops down when the two men stand at different depths, so neither goes soft: walking to the corners, or caught mid-orbit */
    {
      const dp = Math.abs((p.x - camera.position.x) * fx + (p.z - camera.position.z) * fz - S.focus), dq = Math.abs((o.x - camera.position.x) * fx + (o.z - camera.position.z) * fz - S.focus);
      const want = Math.min(APERTURE, 0.0018 * S.focus / Math.max(0.2, Math.max(dp, dq)));
      S.ap = S.init2 ? damp(S.ap, want, 5, dt) : want; S.init2 = true;
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
    basis() { return basisOut; },
    /* the next update starts clean, on the line, with no leftover motion */
    snap() { S.init = false; S.init2 = false; },
    setShake(on) { shakeOn = !!on && !reduced; if (!shakeOn) { kickP.set(0, 0, 0); kickV.set(0, 0, 0); roll = rollV = zoom = zoomV = rumble = 0; } },
    get shake() { return shakeOn; },
    stats() { return { th: S.th, om: S.om, err: S.err, d: S.d, tan: S.tan, wide: S.wide, push: S.push }; },
  };
}
