/* Measures how each man reads, on the real engine, stage, fighters and rig, with no game logic running: the men in stance at centre and near two corners, the camera at
   8 azimuths, face and torso mean sRGB luminance from an id mask and the eye and spine bones, plus whole-frame stats at 6 fixed cameras.
   Run with tools/gfx/cdp.py on gfx/dev/arena.html?q=high&manual=1&seed=1&adaptive=0 --js this file, with window.__LB = { tag, sp, frameAperture, ratio, sheets, post } set in a line above it.
   sp is a folder the sink may write to: it gets polish/lb_TAG_q.json and contact sheets. ratio adds lamp only, fill only and neither, for fill against key. */
(async () => {
  const CFG = Object.assign({ tag: 'x', q: 'high', sheets: true, fold: false, aperture: 0 }, window.__LB || {});
  const SP = CFG.sp;
  const until = async (fn, ms = 120000) => { const t0 = performance.now(); while (performance.now() - t0 < ms) { const v = fn(); if (v) return v; await new Promise((r) => setTimeout(r, 50)); } throw new Error('timeout'); };
  await until(() => window.READY); if (window.READY !== true) throw new Error(String(window.READY));
  let seed = 12345; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const s = ARENA.session, E = s.engine, st = s.stage, rp = s.rigP, ro = s.rigO, m = s.match, T = s.mods.THREE, R = s.mods.rig.FighterRig, r = E.renderer, gl = r.getContext(), scene = E.scene, cam = E.camera;
  const W = E.stats.w, H = E.stats.h;
  if (CFG.post) Object.assign(E.post, CFG.post);
  m.state = 'fight'; m.stateT = 5; m.events.length = 0; m.result = null;
  const save = (name, body) => fetch('/__save?path=' + encodeURIComponent(SP + '/polish/' + name), { method: 'POST', body });
  /* poses */
  function place(px, pz, ox, oz) {
    const yp = Math.atan2(ox - px, oz - pz), yo = Math.atan2(px - ox, pz - oz);
    Object.assign(m.p, { x: px, z: pz, yaw: yp, vx: 0, vz: 0 }); Object.assign(m.o, { x: ox, z: oz, yaw: yo, vx: 0, vz: 0 });
    m.p.guard = 1; m.o.guard = 1;
    rp.reset(); ro.reset(); rp.st = 0.3; ro.st = 1.4; rp.bobT = 0; ro.bobT = 2;
    for (let i = 0; i < 40; i++) R.updateBoth(rp, ro, m, 1 / 60);
  }
  /* camera like the fight camera places it */
  const LIMIT = 6.1, BASE_TAN = Math.tan(19 * Math.PI / 180);
  function setCam(tx, tz, az, d, lift = 0.97) {
    const nx = Math.sin(az), nz = Math.cos(az); let dh = d;
    const lim = Math.min(Math.abs(nx) > 1e-3 ? ((nx > 0 ? LIMIT : -LIMIT) - tx) / nx : 1e9, Math.abs(nz) > 1e-3 ? ((nz > 0 ? LIMIT : -LIMIT) - tz) / nz : 1e9); if (lim < dh) dh = Math.max(2.6, lim);
    const tan = BASE_TAN * Math.max(1, d / dh);
    cam.position.set(tx + nx * dh, st.canvasY + lift, tz + nz * dh); cam.up.set(0, 1, 0); cam.lookAt(tx, st.canvasY + 0.88, tz); cam.fov = 2 * Math.atan(tan) * 180 / Math.PI; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    E.post.focus = dh; E.post.aperture = E.q.film ? CFG.aperture : 0;
  }
  /* id pass */
  const rt = new T.WebGLRenderTarget(W, H, { depthBuffer: true, type: T.UnsignedByteType });
  const idMat = (c) => new T.MeshBasicMaterial({ color: new T.Color().setRGB(c[0] / 255, c[1] / 255, c[2] / 255, T.LinearSRGBColorSpace), toneMapped: false, fog: false });
  const IDS = { pHead: [255, 0, 0], pBody: [0, 255, 0], oHead: [0, 0, 255], oBody: [255, 255, 0], other: [255, 0, 255] };
  const mats = { pHead: idMat(IDS.pHead), pBody: idMat(IDS.pBody), oHead: idMat(IDS.oHead), oBody: idMat(IDS.oBody), other: idMat(IDS.other) };
  function idPass() {
    const hide = []; for (const c of scene.children) { if (c !== s.rigP.fighter.root && c !== s.rigO.fighter.root && c.visible) { c.visible = false; hide.push(c); } }
    const swap = [];
    for (const [fi, w] of [[rp.fighter, 'p'], [ro.fighter, 'o']]) fi.root.traverse((n) => { if (n.isMesh) { const k = n === fi.head ? w + 'Head' : n.material === fi.skinMats[0] ? w + 'Body' : 'other'; swap.push([n, n.material]); n.material = mats[k]; } });
    const au = r.shadowMap.autoUpdate; r.shadowMap.autoUpdate = false; const keepTM = r.toneMapping; r.toneMapping = T.NoToneMapping; const bg = scene.background; scene.background = null; const fog = scene.fog; scene.fog = null;
    r.setRenderTarget(rt); r.setClearColor(0, 1); r.clear(); r.render(scene, cam);
    const buf = new Uint8Array(W * H * 4); r.readRenderTargetPixels(rt, 0, 0, W, H, buf); r.setRenderTarget(null);
    r.shadowMap.autoUpdate = au; r.toneMapping = keepTM; scene.background = bg; scene.fog = fog;
    for (const [n, ma] of swap) n.material = ma; for (const c of hide) c.visible = true;
    return buf;
  }
  const v = new T.Vector3(), v2 = new T.Vector3(), v3 = new T.Vector3(), q = new T.Quaternion();
  const toPx = (p) => { v3.copy(p).project(cam); return [(v3.x * 0.5 + 0.5) * W, (v3.y * 0.5 + 0.5) * H]; };
  function measure(rig, who, ids, col) {
    const B = rig.fighter.bones; const eL = new T.Vector3().setFromMatrixPosition(B.Bip01_LEye.matrixWorld), eR = new T.Vector3().setFromMatrixPosition(B.Bip01_REye.matrixWorld), hc = new T.Vector3().setFromMatrixPosition(B.Bip01_Head.matrixWorld);
    const em = eL.clone().add(eR).multiplyScalar(0.5), fc = em.clone(); fc.y -= 0.035;
    const fw = rig.headFwdLocal.clone().applyQuaternion(B.Bip01_Head.getWorldQuaternion(q)).normalize();
    const toC = cam.position.clone().sub(em).normalize(); const faceOn = fw.dot(toC);
    const chest = new T.Vector3().setFromMatrixPosition(B.Bip01_Spine2.matrixWorld); chest.y -= 0.02;
    const pxPerM = (p) => { const d = cam.position.distanceTo(p); return H / (2 * Math.tan(cam.fov * Math.PI / 360) * d); };
    const pF = toPx(fc), rF = 0.075 * pxPerM(fc), pC = toPx(chest), rC = 0.2 * pxPerM(chest);
    const hid = ids[who + 'Head'], bid = ids[who + 'Body'];
    let fS = 0, fN = 0, hS = 0, hN = 0, tS = 0, tN = 0, sum = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4; const a = rt._buf[i], b = rt._buf[i + 1], c = rt._buf[i + 2];
      const L = col[i] * 0.2126 + col[i + 1] * 0.7152 + col[i + 2] * 0.0722;
      if (a === hid[0] && b === hid[1] && c === hid[2]) { hS += L; hN++; if ((x - pF[0]) ** 2 + (y - pF[1]) ** 2 < rF * rF) { fS += L; fN++; } }
      else if (a === bid[0] && b === bid[1] && c === bid[2]) { if ((x - pC[0]) ** 2 + (y - pC[1]) ** 2 < rC * rC) { tS += L; tN++; } }
    }
    return { face: faceOn > 0.2 && fN > 12 ? +(fS / fN).toFixed(1) : null, faceN: fN, faceOn: +faceOn.toFixed(2), head: hN > 20 ? +(hS / hN).toFixed(1) : null, torso: tN > 40 ? +(tS / tN).toFixed(1) : null, torsoN: tN };
  }
  const col = new Uint8Array(W * H * 4);
  const out = { tag: CFG.tag, q: E.q.name, W, H, sets: {}, frames: [], when: new Date().toISOString() };
  const POS = { centre: [-0.55, 0, 0.55, 0], blueC: [-2.15, -1.75, -1.35, -1.05], neutB: [1.75, -2.15, 1.05, -1.35] };
  const sheetC = CFG.sheets ? document.createElement('canvas') : null; let sx = null; const CW = 320, CH = 180;
  if (sheetC) { sheetC.width = CW * 8; sheetC.height = CH * 3; sx = sheetC.getContext('2d'); }
  st.autoRopes = false; for (const k of ['px', 'nx', 'pz', 'nz']) st.setRopeAlpha(k, 0); for (let i = 0; i < 4; i++) st.setPostAlpha(i, 0);
  for (let i = 0; i < 8; i++) st.update(0.5, cam);
  let row = 0;
  const BIG = ['centre0', 'centre1', 'centre4', 'centre6', 'blueC0', 'blueC4', 'neutB3', 'neutB5'];
  const bigC = CFG.sheets ? document.createElement('canvas') : null; let bx = null; if (bigC) { bigC.width = 640 * 4; bigC.height = 460 * 2; bx = bigC.getContext('2d'); }
  for (const [name, P] of Object.entries(POS)) {
    place(P[0], P[1], P[2], P[3]); const tx = (P[0] + P[2]) / 2, tz = (P[1] + P[3]) / 2; const rows = [];
    for (let a = 0; a < 8; a++) {
      setCam(tx, tz, a * Math.PI / 4 + 0.13, 4.6);
      st.update(1e-4, cam);
      E.render(1 / 60); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, col);
      if (sx) sx.drawImage(E.canvas, a * CW, row * CH, CW, CH);
      if (bx) { const key = name + a; const idx = BIG.indexOf(key); if (idx >= 0) { const cw = 640, ch = 460; bx.drawImage(E.canvas, (W - cw) / 2, 30, cw, ch, (idx % 4) * cw, Math.floor(idx / 4) * ch, cw, ch); } }
      rt._buf = idPass();
      const a1 = measure(rp, 'p', IDS, col), a2 = measure(ro, 'o', IDS, col);
      const row1 = { az: a, p: a1, o: a2 };
      if (CFG.ratio) {
        /* linear light: lamp only, fill and rim only, neither */
        const lin = (v) => { v = (v || 0) / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        const CL = s.mods.fighter.setCharLight, Q = E.q, KI = st.keyLight.intensity;
        const shot = (key, fill) => { CL(fill ? Q : { ...Q, charFill: 0, charRim: 0, charSoft: 1e6 }); st.keyLight.intensity = key ? KI : 0; E.render(1 / 60); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, col); return [measure(rp, 'p', IDS, col), measure(ro, 'o', IDS, col)]; };
        const none = shot(false, false), keyOnly = shot(true, false), fillOnly = shot(false, true); CL(Q); st.keyLight.intensity = KI;
        row1.ratio = {}; [['p', 0], ['o', 1]].forEach(([w, k]) => { row1.ratio[w] = {}; for (const part of ['face', 'torso']) { const N = lin(none[k][part]), K = lin(keyOnly[k][part]), F = lin(fillOnly[k][part]); row1.ratio[w][part] = none[k][part] == null ? null : { key: +(K - N).toFixed(4), fill: +(F - N).toFixed(4), room: +N.toFixed(4) }; } });
      }
      rows.push(row1);
    }
    out.sets[name] = rows; row++;
  }
  if (bx) { const blob = await new Promise((ok) => bigC.toBlob(ok, 'image/jpeg', 0.86)); await save('lbb_' + CFG.tag + '_' + E.q.name + '.jpg', blob); }
  if (sx) { const blob = await new Promise((ok) => sheetC.toBlob(ok, 'image/jpeg', 0.82)); await save('lb_' + CFG.tag + '_' + E.q.name + '.jpg', blob); }
  /* frame brightness at fixed cameras, posts and ropes as the game shows them, men at centre */
  st.autoRopes = true; for (let i = 0; i < 4; i++) st.setPostAlpha(i, 1);
  place(-0.55, 0, 0.55, 0);
  const CAMS = [['side', 0, 0, 0.13, 4.6, 0.97], ['diag', 0, 0, 0.82, 4.8, 0.97], ['end', 0.3, 0.2, 1.63, 5.2, 0.97], ['back', -0.2, 0, 3.3, 4.6, 0.97], ['wide', 0, 0, 0.78, 8.0, 1.75], ['wide2', 0, 0, 3.92, 8.0, 1.75]];
  const fsheet = CFG.sheets ? document.createElement('canvas') : null; let fx = null; if (fsheet) { fsheet.width = 426 * 3; fsheet.height = 240 * 2; fx = fsheet.getContext('2d'); }
  let ci = 0;
  for (const c of CAMS) {
    setCam(c[1], c[2], c[3], c[4], c[5]); if (E.q.film) E.post.aperture = CFG.frameAperture ?? 0;
    for (let i = 0; i < 6; i++) st.update(0.2, cam);
    E.render(1 / 60); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, col);
    if (fx) fx.drawImage(E.canvas, (ci % 3) * 426, Math.floor(ci / 3) * 240, 426, 240); ci++;
    const hist = new Float64Array(256); let sum = 0; const N = W * H;
    for (let i = 0; i < N * 4; i += 4) { const L = col[i] * 0.2126 + col[i + 1] * 0.7152 + col[i + 2] * 0.0722; sum += L; hist[Math.min(255, Math.round(L))]++; }
    const pct = (p) => { let t = 0; for (let k = 0; k < 256; k++) { t += hist[k]; if (t >= p * N) return k; } return 255; };
    let lt4 = 0; for (let k = 0; k < 4; k++) lt4 += hist[k]; let lt10 = 0; for (let k = 0; k < 10; k++) lt10 += hist[k];
    out.frames.push({ cam: c[0], mean: +(sum / N).toFixed(1), p5: pct(0.05), p25: pct(0.25), p50: pct(0.5), p75: pct(0.75), p95: pct(0.95), under4: +(lt4 / N * 100).toFixed(1), under10: +(lt10 / N * 100).toFixed(1) });
  }
  if (fx) { const blob = await new Promise((ok) => fsheet.toBlob(ok, 'image/jpeg', 0.85)); await save('lbf_' + CFG.tag + '_' + E.q.name + '.jpg', blob); }
  await save('lb_' + CFG.tag + '_' + E.q.name + '.json', JSON.stringify(out));
  return { ok: true, q: E.q.name, W, H };
})()
