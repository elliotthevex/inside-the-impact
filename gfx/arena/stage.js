/* The fight venue. createStage(engine, loader) resolves to:

     { scene, ringHalf, floorY, canvasY, platformHalf, corners: {blue, red, neutralA, neutralB}, ropes: {px, nx, pz, nz},
       update(dt, camera), setRopeAlpha(side, a), ropeHit(side, amount, along), kickLamp(power), applyQuality(q), lamp, autoRopes }

   Origin at ring centre, floor at y 0, canvas at y 0.75. loader is an optional THREE.LoadingManager for the load screen.

   Light: one real shadowed spot on the swaying lamp; everything else that lights the room is baked per vertex at load (see LightField in
   kit.js), so the walls and floor stay cheap. A few real point lights remain for the fighters and small props. */
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  RING, ROOM, setLoader, texturesReady, pbr, grime, applyBake, bakeInto, aabb, LightField, loadModel, loadCrowdGeometry, paintPosters, wallQuad, box, metreUV, instanced, trs, cable, tube, buildRing, buildRoom, buildBenches, pendantGeometry, hangingLamp, hazeCone, dust, halos,
} from '../world/kit.js';

const KEY = 52; // with decay 1.15 so the ring stays readable to its corners
const HDRI = new URL('../../assets/hdri/basement_boxing_ring_1k.hdr', import.meta.url).href;
const DOWN = new THREE.Vector3(0, -1, 0);
const SIDE_N = { px: [1, 0], nx: [-1, 0], pz: [0, 1], nz: [0, -1] };

/* Where the dim bulbs hang: x, z, yaw. The first few get the caged fixture, the rest a plain pendant. */
const BULBS = [[-7.3, -2.6, Math.PI / 2], [7.3, 3.2, Math.PI / 2], [2.6, -7.3, 0], [-3.1, 7.3, 0], [7.3, -5.0, Math.PI / 2], [-7.3, 4.4, Math.PI / 2]];
const BULB_Y = ROOM.height - 0.95;
const BULB_COLOR = new THREE.Color(0xffc096);
const COOL_POS = [-2.6, 3.48, -8.45];
const FILL_POS = [0, 2.1, 0];

function crowdMaterial(u) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82 });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = u.uTime;
    applyBake(s, { hemi: true });
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aPart;varying vec2 vPart;varying float vPh;uniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
 vPart=aPart;
 #ifdef USE_INSTANCING
 float ph=instanceMatrix[3].x*1.73+instanceMatrix[3].z*2.31;vPh=fract(ph);float sw=sin(uTime*(.6+vPh*.7)+ph);float nod=sin(uTime*(1.1+vPh)+ph*2.);float hh=smoothstep(.5,1.5,position.y);
 transformed.x+=sw*.024*hh;transformed.z+=nod*.016*hh;
 #endif`);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vPart;varying float vPh;')
      .replace('#include <color_fragment>', `#include <color_fragment>
 {vec3 shirt=diffuseColor.rgb;vec3 pants=mix(vec3(.022,.026,.038),vec3(.06,.055,.05),fract(vPh*7.3));vec3 shoes=vec3(.012);vec3 hair=mix(vec3(.012,.009,.007),vec3(.06,.04,.025),fract(vPh*3.7)*fract(vPh*3.7));vec3 skin=mix(vec3(.3,.18,.13),vec3(.13,.075,.05),fract(vPh*5.1)*.8);
 float p=vPart.x;vec3 c=mix(shirt,pants,smoothstep(.1,.25,p));c=mix(c,shoes,smoothstep(.42,.58,p));c=mix(c,hair,smoothstep(.75,.92,p));c=mix(c,skin,smoothstep(.3,.7,vPart.y));diffuseColor.rgb=c;}`);
  };
  m.customProgramCacheKey = () => 'crowd2';
  return m;
}
const PALETTE = [0x33373f, 0x403d35, 0x4c2e2a, 0x323f46, 0x4e483c, 0x2d2d2f, 0x3f4b5c, 0x5e5a50, 0x3c2b36, 0x6a6458, 0x57251f, 0x243f5a, 0x262628, 0x4a463f];

function buildCrowd(seats, u, doorX, geos) {
  let seed = 29; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const face = (x, z) => Math.atan2(x, z) + Math.PI; const col = new THREE.Color(); const mat = crowdMaterial(u);
  /* seated: nearer rows first, so fewer people still fill ringside. Front rows lean in. */
  const taken = shuffle(seats.filter(() => rnd() < 0.8)).sort((a, b) => a.row - b.row).map((s) => ({ ...s, y: 0, jx: (rnd() - 0.5) * 0.08, jz: (rnd() - 0.5) * 0.04 }));
  const stand = [];
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let a = -7.6; a < 7.6; a += 0.55 + rnd() * 0.42) {
      if (rnd() < 0.3) continue; if (Math.abs(Math.abs(a) - 4.5) < 0.55) continue; if (nz < 0 && Math.abs(a - doorX) < 2) continue;
      const d = 7.72 + rnd() * 0.5; stand.push({ x: nx * d + nz * a, z: nz * d + nx * a });
    }
  }
  for (const [x, z] of [[5.1, 5.3], [-5.3, 5.0], [5.3, -5.1], [-5.0, -5.3], [4.8, 5.8], [-5.8, 4.9], [5.7, -4.8]]) stand.push({ x, z });
  shuffle(stand);
  const buckets = { seated: [], lean: [], stand: [], crossed: [], cheer: [] };
  for (const s of taken) (rnd() < (s.row < 5 ? 0.45 : 0.25) ? buckets.lean : buckets.seated).push(s);
  for (const s of stand) { const r = rnd(); (r < 0.16 ? buckets.cheer : r < 0.5 ? buckets.crossed : buckets.stand).push(s); }
  const g = new THREE.Group(); g.name = 'crowd'; const parts = [];
  for (const [name, list] of Object.entries(buckets)) {
    const im = new THREE.InstancedMesh(geos[name], mat, Math.max(1, list.length)); im.name = 'crowd-' + name;
    list.forEach((s, i) => { im.setMatrixAt(i, trs(s.x + (s.jx || 0), 0, s.z + (s.jz || 0), 0, face(s.x, s.z) + (rnd() - 0.5) * 0.36, 0, 0.94 + rnd() * 0.12)); im.setColorAt(i, col.set(PALETTE[Math.floor(rnd() * PALETTE.length)])); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; im.castShadow = false; im.computeBoundingSphere(); im.frustumCulled = false; g.add(im); parts.push({ im, full: list.length, seated: name === 'seated' || name === 'lean' });
  }
  const total = parts.reduce((a, p) => a + p.full, 0);
  const feet = [...taken.map((s) => ({ x: s.x - Math.sign(s.x) * (Math.abs(s.x) > Math.abs(s.z) ? 0.28 : 0), z: s.z - Math.sign(s.z) * (Math.abs(s.z) >= Math.abs(s.x) ? 0.28 : 0), r: 0.44, a: 0.3 })), ...stand.map((s) => ({ x: s.x, z: s.z, r: 0.34, a: 0.38 }))];
  return {
    group: g, parts, feet, total,
    setCount(n) { const k = Math.min(1, n / total); for (const p of parts) p.im.count = Math.round(p.full * k); },
    bake(field) { for (const p of parts) field.bakeInstances(p.im, p.seated ? 1.0 : 1.35, 0.9, 0.7); },
  };
}

/* Soft darkening where things meet the floor, drawn into a small canvas once. Nothing floats, and it costs one lookup. */
function paintContact(items, extraRects) {
  const S = 512; const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, S, S); const k = S / 18;
  const blob = (px, pz, r, a) => { const cx = (px + 9) * k; const cy = (pz + 9) * k; const R = r * k; const g = x.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - R, cy - R, R * 2, R * 2); };
  for (const it of items) blob(it.x, it.z, it.r, it.a);
  for (const [x0, z0, x1, z1, r, a] of extraRects) { const L = Math.hypot(x1 - x0, z1 - z0); const n = Math.max(2, Math.ceil(L / (r * 0.6))); for (let i = 0; i <= n; i++) { const t = i / n; blob(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, r, a); } }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; return t;
}

export async function createStage(engine, loader) {
  setLoader(loader);
  const q = engine.q; const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); scene.name = 'venue';
  const aniso = q.aniso || 4; const doorX = -2.6;
  scene.fog = new THREE.FogExp2(0x0b0806, 0.016);
  engine.post.grain = 0.0045; // this room is mostly shadow, and post's default grain turns blacks to speckle

  const rgbI = (c, i) => [c.r * i, c.g * i, c.b * i];
  const bulbField = BULBS.map(([x, z]) => ({ p: [x, BULB_Y, z], c: rgbI(BULB_COLOR, 32), decay: 1.15 }));
  const fieldLights = [...bulbField, { p: COOL_POS, c: rgbI(new THREE.Color(0xbcd8ff), 10), decay: 1.5 }, { p: FILL_POS, c: rgbI(new THREE.Color(0xffbc96), 13), decay: 0.95, tag: 'fill' }];

  /* materials */
  const wall = grime(pbr('concrete_block_wall', { tile: 2.4, color: new THREE.Color(1.75, 1.82, 1.86), aniso, normalScale: 1.1 }), { kind: 'wall', macro: 0.5, specBoost: 1.2, bake: 'vertex', bakeSpec: true });
  const floor = grime(pbr('concrete_floor_worn_001', { tile: 3.1, color: new THREE.Color(1.0, 0.96, 0.9), aniso, normalScale: 0.7 }), { kind: 'floor', macro: 0.6, specBoost: 1.7, wet: 0.5, bake: 'vertex', bulbs: q.name === 'low' ? [] : bulbField.map((b) => ({ p: b.p, c: b.c.map((v) => v * 0.3) })) });
  const concrete = grime(pbr('concrete_floor_worn_001', { tile: 2.2, color: new THREE.Color(0.62, 0.61, 0.59), aniso }), { kind: 'concrete', macro: 0.55, bake: 'vertex' });
  const woodSteps = pbr('old_planks_02', { tile: 1.3, color: new THREE.Color(0.8, 0.72, 0.62), aniso });
  const woodBench = grime(woodSteps.clone(), { kind: 'plain', macro: 0.2, bake: 'instance' });
  const steel = new THREE.MeshStandardMaterial({ color: 0x34363a, metalness: 0.75, roughness: 0.5, name: 'steel' });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.5, roughness: 0.6, name: 'dark-steel' });
  const benchLeg = grime(new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.5, roughness: 0.6 }), { kind: 'plain', macro: 0, bake: 'instance' });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.7, name: 'cable' });
  const leather = pbr('leather_white', { color: 0xffffff, aniso, normalScale: 0.6 });
  const linen = pbr('rough_linen', { maps: ['nor_gl'], aniso });

  /* room and ring */
  const room = buildRoom({ wall, floor, concrete, steel: darkSteel }); scene.add(room.group);
  const ring = buildRing({ leather, linenN: linen.normalMap, wood: woodSteps, steel, aniso }); scene.add(ring.group);
  const benches = buildBenches(woodBench, benchLeg); scene.add(benches.group);

  const [crowdGeos, mLamp, mCage, mPipes, mDuct, mStool, mBucket, mTube, mBox, mDoor, mBarrel, env] = await Promise.all([
    loadCrowdGeometry(q.name === 'low' ? 0.095 : 0.07),
    loadModel('hanging_industrial_lamp'), loadModel('caged_hanging_light'), loadModel('modular_industrial_pipes_01'), loadModel('modular_airduct_circular_01'), loadModel('metal_stool_01'), loadModel('wooden_bucket_01'), loadModel('mounted_fluorescent_lights'), loadModel('utility_box_01'), loadModel('rollershutter_door'), loadModel('barrel_03'),
    new HDRLoader(loader).loadAsync(HDRI),
  ]);
  await texturesReady();
  env.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(engine.renderer); const envRT = pm.fromEquirectangular(env); scene.environment = envRT.texture; scene.environmentIntensity = 0.26; env.dispose(); pm.dispose();

  /* key lamp, and the real point lights the fighters see */
  const lamp = hangingLamp(mLamp, { anchorY: ROOM.height + 0.42, target: [0, RING.canvasY, 0], shadow: q.shadow, intensity: KEY, angle: 1.16, penumbra: 0.5, decay: 1.15, calm: engine.reducedMotion }); scene.add(lamp.group);
  const bounce = new THREE.PointLight(0xb8795c, 3.2, 7, 1.2); bounce.position.set(0, RING.canvasY - 0.6, 0); scene.add(bounce);
  const bulbs = BULBS.map(([x, z]) => { const l = new THREE.PointLight(BULB_COLOR, 9, 16, 1.15); l.position.set(x, BULB_Y, z); scene.add(l); return l; });

  /* fixtures: caged where the budget allows, pendants elsewhere, one set of draws each */
  const nCage = q.name === 'high' ? 3 : q.name === 'medium' ? 2 : 1;
  for (const m of Object.values(mCage.meshes)) { m.material = m.material.clone(); m.material.emissiveIntensity = 9; m.material.emissive.set(0xffa766); }
  const cageY = ROOM.height; // the model's chains end at its origin, so that goes on the ceiling
  const cageList = BULBS.slice(0, nCage).map(([x, z, r]) => trs(x, cageY, z, 0, r, 0));
  const toBake = []; const toBakeSmall = []; Object.values(mCage.meshes).forEach((m, i) => { const c = instanced(m, cageList); c.name = 'cages' + i; scene.add(c); toBake.push(c); });
  const pend = pendantGeometry(0.95); const pendList = BULBS.slice(nCage).map(([x, z]) => trs(x, ROOM.height, z));
  if (pendList.length) {
    const shade = new THREE.InstancedMesh(pend.shade, new THREE.MeshStandardMaterial({ color: 0x25231f, roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide }), pendList.length); const bm = new THREE.MeshBasicMaterial(); bm.color.setRGB(9, 5.2, 2.6); const bulbM = new THREE.InstancedMesh(pend.bulb, bm, pendList.length);
    pendList.forEach((m, i) => { shade.setMatrixAt(i, m); bulbM.setMatrixAt(i, m); }); shade.name = 'pendant-shades'; bulbM.name = 'pendant-bulbs'; scene.add(shade, bulbM); toBake.push(shade);
  }
  const hal = halos([...BULBS.map(([x, z], i) => (i >= nCage ? { p: [x, BULB_Y - 0.03, z], color: 0xffa070, i: 1.5, size: 0.5 } : { p: [x, cageY - 0.63, z], color: 0xffa070, i: 0.9, size: 1.0 })), { p: [doorX + 2.3, 3.04, -8.9], color: 0x4dff88, i: 0.5, size: 0.5 }]);
  scene.add(hal);

  /* fluorescent over the shutter door, cool against all that orange */
  const tubeM = mTube.meshes.mounted_fluorescent_lights_g || Object.values(mTube.meshes)[0];
  const tubeMat = tubeM.material.clone(); tubeMat.emissive.set(0xcfe6ff); tubeMat.emissiveIntensity = 7; tubeMat.emissiveMap = null;
  const tubes = new THREE.InstancedMesh(tubeM.geometry, tubeMat, 1); tubes.setMatrixAt(0, trs(doorX, 3.62, -8.82, Math.PI / 2, 0, 0, 1.3)); tubes.name = 'tube'; scene.add(tubes); toBake.push(tubes);
  const cool = new THREE.PointLight(0xbcd8ff, 5, 10, 1.7); cool.position.set(...COOL_POS); scene.add(cool);

  /* shutter door, sized to the room, against the wall */
  const doorScene = mDoor.scene.clone(true); const bb = new THREE.Box3().setFromObject(doorScene); const sz = bb.getSize(new THREE.Vector3()); const ds = 3.1 / Math.max(sz.x, sz.z); doorScene.scale.setScalar(ds);
  doorScene.position.set(doorX, -bb.min.y * ds, -9 + (-bb.min.z * ds) + 0.02); doorScene.name = 'door'; doorScene.traverse((n) => { if (n.isMesh) { n.material = n.material.clone(); n.material.color.multiplyScalar(0.42); } }); scene.add(doorScene); toBake.push(doorScene);

  /* posters, a banner over the door side, an exit sign, all lit by the same bake */
  const art = paintPosters(); const paper = grime(new THREE.MeshStandardMaterial({ map: art.map, roughness: 0.82 }), { kind: 'plain', macro: 0.25, bake: 'vertex' }); paper.name = 'posters';
  const aq = [];
  [[0, 0.66, 0.93, -7.9, 1.78, -8.98, 0, 1], [3, 0.66, 0.93, -6.9, 1.7, -8.98, 0, 1], [1, 0.66, 0.93, 2.3, 1.82, -8.98, 0, 1], [2, 0.66, 0.93, 8.98, 1.76, 6.4, -1, 0], [0, 0.66, 0.93, 8.98, 1.7, 7.3, -1, 0], [3, 0.66, 0.93, -8.98, 1.82, -1.1, 1, 0], [1, 0.66, 0.93, -2.0, 1.75, 8.98, 0, -1], [2, 0.66, 0.93, -1.0, 1.8, 8.98, 0, -1], [0, 0.66, 0.93, 4.5 - 0.31 - 0.4, 1.75, 8.98, 0, -1]].forEach(([r, w, h, x, y, z, nx, nz]) => aq.push(wallQuad(art.rects[r], w, h, x, y, z, nx, nz)));
  /* banners hang off the pipes, in front of them, with a little cloth wave */
  const banner = (w, h, x, y, z, nx, nz) => { const g = wallQuad(art.rects[4], w, h, x, y, z, nx, nz, 24); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const along = nx ? p.getZ(i) : p.getX(i); const k = Math.sin(along * 5.1) * 0.012 + Math.sin(along * 11.3 + 1) * 0.005; p.setX(i, p.getX(i) + nx * k); p.setZ(i, p.getZ(i) + nz * k); } g.computeVertexNormals(); return g; };
  aq.push(banner(4.0, 0.8, 1.6, 2.56, -8.6, 0, 1)); aq.push(banner(4.0, 0.8, -8.58, 2.94, 1.9, 1, 0));
  const artG = mergeGeometries(aq, false); const artM = new THREE.Mesh(artG, paper); artM.name = 'posters'; artM.receiveShadow = true; scene.add(artM);
  const exitMat = new THREE.MeshBasicMaterial({ map: art.map, color: new THREE.Color(1.6, 1.6, 1.6) }); const exitQ = new THREE.Mesh(wallQuad(art.rects[5], 0.46, 0.17, doorX + 2.3, 3.04, -8.93, 0, 1, 1), exitMat); exitQ.name = 'exit-sign'; scene.add(exitQ);
  const exitBox = new THREE.Mesh(metreUV(box(0.5, 0.2, 0.08, doorX + 2.3, 3.04, -8.97)), darkSteel); exitBox.name = 'exit-box'; scene.add(exitBox); toBake.push(exitBox);

  /* timekeeper's table and bell at ringside */
  const tableParts = [metreUV(box(0.52, 0.04, 0.95, -3.7, 0.74, 0.9))];
  for (const [a, b] of [[-0.22, -0.42], [0.22, -0.42], [-0.22, 0.42], [0.22, 0.42]]) tableParts.push(metreUV(box(0.05, 0.72, 0.05, -3.7 + a, 0.36, 0.9 + b)));
  const tableM = new THREE.Mesh(mergeGeometries(tableParts, false), woodSteps); tableM.castShadow = true; tableM.receiveShadow = true; tableM.name = 'table'; scene.add(tableM); toBake.push(tableM);
  const bellPts = [[0.002, 0.13], [0.03, 0.125], [0.055, 0.1], [0.07, 0.06], [0.085, 0.015], [0.1, 0]].map(([a, b]) => new THREE.Vector2(a, b)); const bellG = new THREE.LatheGeometry(bellPts, 20); bellG.translate(-3.7, 0.76, 1.1);
  const bell = new THREE.Mesh(bellG, new THREE.MeshStandardMaterial({ color: 0xb8893a, metalness: 1, roughness: 0.28, side: THREE.DoubleSide })); bell.name = 'bell'; bell.castShadow = true; scene.add(bell); toBakeSmall.push(bell);

  /* ducts on braces, pipes along the walls */
  const dM = mDuct.meshes; /* the duct brackets hang from the ceiling */ const seg = (axis, fixed, y, from, to, step = 1.42) => { const l = []; for (let a = from; a < to; a += step) l.push(axis === 'x' ? trs(a, y, fixed, 0, Math.PI / 2, 0) : trs(fixed, y, a)); return l; };
  const ductSeg = [...seg('x', -7.0, 3.72, -8.96, 8.96), ...seg('z', 7.1, 3.22, -8.96, 8.96)];
  const dGroup = new THREE.Group(); dGroup.name = 'ducts'; scene.add(dGroup);
  dGroup.add(instanced(dM.modular_airduct_circular_triple, ductSeg));
  const braces = []; for (let a = -7.5; a < 8.5; a += 2.84) { braces.push(trs(a, 3.72, -7.0, 0, Math.PI / 2, 0)); braces.push(trs(7.1, 3.22, a)); }
  dGroup.add(instanced(dM.modular_airduct_circular_brace, braces));
  const wires = []; for (let a = -7.5; a < 8.5; a += 2.84) { wires.push(trs(a, 3.72 + 0.45, -7.0, 0, Math.PI / 2, 0)); wires.push(trs(7.1, 3.22 + 0.45, a, 0, 0, 0, 1, 1.4, 1)); }
  dGroup.add(instanced(dM.modular_airduct_circular_brace_extention_wires, wires));
  const pGroup = new THREE.Group(); pGroup.name = 'pipes'; scene.add(pGroup);
  const pipeMesh = mPipes.meshes.modular_industrial_pipes_01_pipe02; const runs = [];
  const run = (axis, fixed, y, from, to, r = 0.55) => { for (let a = from; a < to; a += 1.96) runs.push(axis === 'x' ? trs(a + 0.98, y, fixed, 0, 0, Math.PI / 2, r, 1, r) : trs(fixed, y, a + 0.98, Math.PI / 2, 0, 0, r, 1, r)); };
  run('x', -8.72, 3.0, -9, 9); run('x', -8.76, 2.72, -9, 9, 0.4); run('z', 8.72, 2.92, -9, 9); run('z', 8.78, 2.62, -9, 9, 0.38); run('x', 8.72, 3.3, -9, 9, 0.5); run('z', -8.74, 3.4, -9, 9, 0.46);
  for (const [x, z, top, r] of [[8.66, 2.4, 2.92, 0.5], [8.66, -3.3, 2.92, 0.5], [-5.2, -8.68, 3.0, 0.5], [5.8, -8.68, 3.0, 0.5], [-8.7, 1.1, 3.4, 0.42], [1.6, 8.66, 3.3, 0.46]]) {
    const n = Math.ceil(top / 1.96); const h = top / n; for (let i = 0; i < n; i++) runs.push(trs(x, h * (i + 0.5), z, 0, 0, 0, r, h / 1.96, r));
  }
  pGroup.add(instanced(pipeMesh, runs));

  /* cables: feed to the key lamp along the beam, and bulb to bulb across the ceiling, with real sag */
  const wires2 = [cable([0, ROOM.height - 0.42, -0.05], [0, ROOM.height - 0.42, -8.9], 0.05, 0.012, 14), cable([0.04, ROOM.height - 0.4, 0], [8.9, ROOM.height - 0.7, 1.6], 0.5, 0.009, 16)];
  BULBS.forEach(([x, z], i) => { const [a, b] = BULBS[(i + 1) % BULBS.length]; wires2.push(cable([x, ROOM.height - 0.06, z], [a, ROOM.height - 0.06, b], 0.55, 0.008, 18)); });
  wires2.push(cable([8.9, 1.9, 1.5], [8.9, 3.0, 1.5], 0, 0.016, 2)); wires2.push(cable([8.9, 3.2, 1.3], [7.3, ROOM.height - 0.1, 3.2], 0.35, 0.01, 12));
  const wireM = new THREE.Mesh(mergeGeometries(wires2, false), rubber); wireM.name = 'cables'; scene.add(wireM);

  /* crowd barrier between ring and first bench, open at the corners */
  const rail = []; const rd = 4.15; const contact = [];
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const S = 3.3; const pt = (a, y) => [nx * rd + nz * a, y, nz * rd + nx * a];
    rail.push(tube(pt(-S, 1.02), pt(S, 1.02), 0.024)); rail.push(tube(pt(-S, 0.55), pt(S, 0.55), 0.016));
    for (let a = -S; a <= S + 0.01; a += S / 2) { rail.push(tube(pt(a, 0), pt(a, 1.02), 0.024)); const f = pt(a, 0); contact.push({ x: f[0], z: f[2], r: 0.12, a: 0.5 }); }
  }
  contact.push({ x: -3.7, z: 0.9, r: 0.62, a: 0.55 });
  const railM = new THREE.Mesh(mergeGeometries(rail, false), steel); railM.castShadow = true; railM.receiveShadow = true; railM.name = 'rail'; scene.add(railM); toBake.push(railM);

  /* props on the floor: everything rests on y 0 from its own bounds */
  const ground = (obj, x, z, ry = 0, s = 1, r = 0.3) => { const c = obj.clone(true); c.scale.setScalar(s); c.rotation.y = ry; c.position.set(x, 0, z); c.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(c); c.position.y = -b.min.y; c.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } }); scene.add(c); contact.push({ x, z, r: r * 1.5, a: 0.6 }); toBakeSmall.push(c); return c; };
  ground(mStool.scene, -3.62, -3.0, 0.4); ground(mStool.scene, 3.66, 3.04, 2.2);
  ground(mBucket.scene, -3.68, -2.45, 0.2, 1, 0.2); ground(mBucket.scene, 3.72, 2.52, 1.2, 1, 0.2);
  ground(mBarrel.scene, 7.8, 8.05, 0.3, 1, 0.4); ground(mBarrel.scene, 8.2, 7.2, 1.3, 1, 0.4); ground(mBarrel.scene, -8.2, -7.95, 2.0, 1, 0.4);
  const boxC = mBox.scene.clone(true); const bbx = new THREE.Box3().setFromObject(boxC); const bsz = bbx.getSize(new THREE.Vector3()); boxC.rotation.y = -Math.PI / 2; boxC.position.set(8.97 - bsz.z / 2, 1.5, 1.5); boxC.name = 'utility-box'; scene.add(boxC); toBakeSmall.push(boxC);

  /* crowd */
  const crowdU = { uTime: { value: 0 } };
  const crowd = buildCrowd(benches.seats, crowdU, doorX, crowdGeos); scene.add(crowd.group); crowd.setCount(q.crowd);

  /* bake: bulbs, tube and the ring's glow into room, canvas, skirt, benches, crowd */
  const t0 = performance.now();
  const boxes = [...room.boxes, ...ring.boxes, ...benches.boxes, aabb(0, 3.72, -7.0, 18, 0.38, 0.38), aabb(7.1, 3.22, 0, 0.38, 0.38, 18)];
  const field = new LightField({ lights: fieldLights, boxes, samples: q.name === 'low' ? 1 : 3, ambient: [0.13, 0.128, 0.13] });
  field.bakeGeometry(room.bake.floor); field.bakeGeometry(room.bake.walls); field.bakeGeometry(room.bake.structure); field.bakeGeometry(ring.bake.canvas, 'fill'); field.bakeGeometry(ring.bake.skirt); field.bakeGeometry(artG);
  for (const o of [...toBake, dGroup, pGroup, room.beam, ...ring.props]) bakeInto(field, o);
  for (const o of toBakeSmall) bakeInto(field, o, { single: true });
  for (const k of Object.keys(ring.ropes)) field.bakeGeometry(ring.ropes[k].geometry);
  field.bakeInstances(benches.planks, 0.5, 0.8); field.bakeInstances(benches.legs, 0.25, 0.6); crowd.bake(field);
  const bakeMs = performance.now() - t0;
  /* contact shadows under everything that stands on the floor */
  const H = RING.platformHalf + 0.05;
  floor.userData.u.uContact.value = paintContact([...contact, ...crowd.feet], [
    [-H, -H, H, -H, 0.5, 0.11], [H, -H, H, H, 0.5, 0.11], [H, H, -H, H, 0.5, 0.11], [-H, H, -H, -H, 0.5, 0.11],
    ...benches.boxes.map((b) => [b[0] + 0.15, b[2] + 0.15, b[3] - 0.15, b[5] - 0.15, 0.3, 0.09]),
    ...room.boxes.filter((b) => b[1] <= 0.01).map((b) => [b[0], b[2], b[3], b[5], 0.45, 0.14]),
  ]);

  /* air: haze cone under the lamp, dust in the beam */
  const haze = hazeCone({ angle: 0.9, length: 3.15, density: 0.22, steps: q.hazeSteps }); scene.add(haze);
  const motes = dust({ count: 420, half: 3.8 }); motes.geometry.setDrawRange(0, q.dust); scene.add(motes);

  /* rope state */
  const ropeState = {}; for (const k of Object.keys(ring.ropes)) ropeState[k] = { a: 1, target: 1, x: 0, v: 0 };
  const applyAlpha = (k, a) => { const m = ring.ropes[k].material; const hidden = a < 0.01; m.opacity = a; m.colorWrite = !hidden; m.depthWrite = a > 0.98; m.transparent = true; };
  for (const k of Object.keys(ring.ropes)) applyAlpha(k, 1);

  let flick = 2; let flickOn = 1;
  const stage = {
    scene, ringHalf: RING.ringHalf, floorY: 0, canvasY: RING.canvasY, platformHalf: RING.platformHalf, corners: ring.corners, ropes: ring.ropes, lamp, RING, autoRopes: true, keyLight: lamp.light, bakeMs, bakeRays: field.rays,
    /* a, 0..1, for one side: 'px', 'nx', 'pz', 'nz'. At 0 it no longer draws but still casts its shadow. Needs autoRopes false. */
    setRopeAlpha(side, a) { ropeState[side].target = a; },
    /* A fighter hit that side: amount in metres of push, along in -1..1 along the side. */
    ropeHit(side, amount = 0.05, along = 0) { const s = ropeState[side]; s.v += amount * 12; ring.ropes[side].material.userData.u.uWobAt.value = along; },
    kickLamp(power = 1) { lamp.kick(power); },
    applyQuality(nq) {
      const L = lamp.light; if (L.shadow.mapSize.x !== nq.shadow) { L.shadow.mapSize.set(nq.shadow, nq.shadow); if (L.shadow.map) { L.shadow.map.dispose(); L.shadow.map = null; } }
      bulbs.forEach((l, i) => { l.visible = i < nq.bulbs; }); cool.visible = nq.name !== 'low';
      motes.geometry.setDrawRange(0, nq.dust); crowd.setCount(nq.crowd); haze.userData.u.uSteps.value = nq.hazeSteps;
      hal.userData.u.uGain.value = nq.film ? 1 : 1.4;
    },
    update(dt, cam) {
      lamp.update(dt); const u = haze.userData.u;
      u.uTime.value += dt; u.uApex.value.copy(lamp.bulbWorld); u.uAxis.value.copy(lamp.axisWorld);
      haze.position.copy(lamp.bulbWorld); haze.quaternion.setFromUnitVectors(DOWN, lamp.axisWorld);
      const d = motes.userData.u; d.uTime.value += dt; d.uApex.value.copy(lamp.bulbWorld); d.uAxis.value.copy(lamp.axisWorld); crowdU.uTime.value += dt;
      const hpx = engine.stats.h || 720; d.uScale.value = hpx; hal.userData.u.uScale.value = hpx;
      /* the fluorescent is on its way out: mostly on, with short dips */
      flick -= dt; if (flick <= 0) { flick = Math.random() < 0.82 ? 0.3 + Math.random() * 3.5 : 0.04 + Math.random() * 0.1; flickOn = flickOn < 1 ? 1 : (Math.random() < 0.5 ? 0.25 : 0.7); }
      cool.intensity = 5 * flickOn; tubeMat.emissiveIntensity = 7 * flickOn;
      lamp.light.intensity = KEY * (1 + Math.sin(u.uTime.value * 11.7) * 0.004 + Math.sin(u.uTime.value * 2.3) * 0.006);
      /* ropes: a sprung wobble per side, and the fade toward each side's target */
      for (const k of Object.keys(ropeState)) {
        const s = ropeState[k]; const w = 22; s.v += (-w * w * s.x - 2.6 * s.v) * dt; s.x += s.v * dt; ring.ropes[k].material.userData.u.uWob.value = s.x;
        if (stage.autoRopes && cam) { const n = SIDE_N[k]; const out = cam.position.x * n[0] + cam.position.z * n[1]; s.target = out > RING.ropeAt - 0.35 ? 0 : 1; }
        if (s.a !== s.target) { s.a += Math.sign(s.target - s.a) * Math.min(Math.abs(s.target - s.a), dt * 5); applyAlpha(k, s.a); }
      }
    },
  };
  const onQuality = (nq) => stage.applyQuality(nq);
  /* Frees GPU memory when the arena closes. The kit's caches keep the images, so opening again is quick. */
  stage.dispose = () => {
    engine.listeners.delete(onQuality); const seen = new Set(); const drop = (t) => { if (t && t.isTexture && !seen.has(t)) { seen.add(t); t.dispose(); } };
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of mats) { for (const k of Object.keys(m)) drop(m[k]); m.dispose(); } if (o.isInstancedMesh) o.dispose(); });
    if (lamp.light.shadow.map) lamp.light.shadow.map.dispose(); envRT.dispose(); drop(floor.userData.u.uContact.value); scene.environment = null;
  };
  stage.applyQuality(q); engine.listeners.add(onQuality);
  stage.update(0.001, null);
  return stage;
}
