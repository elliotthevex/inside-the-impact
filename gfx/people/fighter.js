/* A fighter: the Rocketbox athlete with trunks, boots, gloves and a fist. One instance per person in the ring.
   Only reads what it is told. It holds no game state and never writes any. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { makeSkin } from './skin.js';
import { buildGloveGeometry } from './glove.js';

const BASE = new URL('../../assets/people/', import.meta.url).href;
const shared = { gltf: null, tex: {}, gloves: null, face: {} };
const tl = new THREE.TextureLoader();
function loadTex(mgr, url, srgb, aniso = 4) {
  return new Promise((ok, err) => { (mgr ? new THREE.TextureLoader(mgr) : tl).load(url, (t) => { t.flipY = false; t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; ok(t); }, undefined, err); });
}
export const CORNER = { blue: { trunks: 0x173a9c, stripe: '#e8e6df', glove: 0x123a9e }, red: { trunks: 0x8e1712, stripe: '#e8e6df', glove: 0x9a130e } };

export async function preloadFighter(q = { tex: 2048 }, mgr) {
  if (shared.gltf) return shared;
  const sz = q.tex >= 2048 ? 2048 : 1024; const a = q.aniso || 4;
  const [gltf, bd, bn, bs, hd, hn, hs, gd, gn, gr, tn, tr, od, on, or] = await Promise.all([
    new GLTFLoader(mgr).loadAsync(BASE + 'fighter.glb'),
    loadTex(mgr, `${BASE}m021_body_d_${sz}.webp`, true, a), loadTex(mgr, `${BASE}m021_body_n_${sz}.webp`, false, a), loadTex(mgr, `${BASE}m021_body_s_${sz}.webp`, false, a),
    loadTex(mgr, `${BASE}m021_head_d_${sz}.webp`, true, a), loadTex(mgr, `${BASE}m021_head_n_${sz}.webp`, false, a), loadTex(mgr, `${BASE}m021_head_s_${sz}.webp`, false, a),
    loadTex(mgr, BASE + 'glove_d.webp', true, a), loadTex(mgr, BASE + 'glove_n.webp', false, a), loadTex(mgr, BASE + 'glove_r.webp', false, a),
    loadTex(mgr, BASE + 'trunks_n.webp', false, a), loadTex(mgr, BASE + 'trunks_r.webp', false, a),
    loadTex(mgr, BASE + 'boot_d.webp', true, a), loadTex(mgr, BASE + 'boot_n.webp', false, a), loadTex(mgr, BASE + 'boot_r.webp', false, a),
  ]);
  /* the opponent: same mesh, another man's face and skin. See tools/gfx/second_face.py */
  const [bd2, hd2, hn2, hs2, faceBin] = await Promise.all([
    loadTex(mgr, `${BASE}m007b_body_d_${sz}.webp`, true, a), loadTex(mgr, `${BASE}m007b_head_d_${sz}.webp`, true, a), loadTex(mgr, `${BASE}m007b_head_n_${sz}.webp`, false, a), loadTex(mgr, `${BASE}m007b_head_s_${sz}.webp`, false, a),
    fetch(BASE + 'm007b_face.bin').then((r) => r.arrayBuffer()),
  ]);
  Object.assign(shared, { gltf, tex: { bd, bn, bs, hd, hn, hs, gd, gn, gr, tn, tr, od, on, or, b: { bd: bd2, hd: hd2, hn: hn2, hs: hs2 } } });
  shared.face.b = faceBin; shared.smoothHead = q.name !== 'low'; shared.heads = {};
  shared.gloves = { L: buildGloveGeometry(-1), R: buildGloveGeometry(1) };
  return shared;
}

/* trunks colour lives in a little painted texture: cloth, waistband, side stripe */
function trunksMap(color, stripe) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#' + new THREE.Color(color).getHexString(); x.fillRect(0, 0, 1024, 512);
  const band = 512 * 0.115; x.fillStyle = '#0d0d10'; x.fillRect(0, 0, 1024, band);
  x.fillStyle = stripe; x.fillRect(0, band * 0.36, 1024, band * 0.12); x.fillRect(0, band * 0.62, 1024, band * 0.12);
  x.fillStyle = stripe; for (const u of [0.25, 0.75]) x.fillRect(u * 1024 - 11, band, 22, 512 - band);
  x.fillStyle = '#0d0d10'; for (const u of [0.25, 0.75]) { x.fillRect(u * 1024 - 22, band, 8, 512 - band); x.fillRect(u * 1024 + 14, band, 8, 512 - band); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}

/* Move the head's vertices to another person's shape. Only this mesh's copy of the vertex data changes: the body keeps its own. */
/* Inside a glove the hand is never seen, but a thumb or a knuckle can poke through it, so gloved fighters do not draw it. */
function withoutHands(mesh) {
  const g0 = mesh.geometry, J = g0.attributes.skinIndex, W = g0.attributes.skinWeight, bones = mesh.skeleton.bones, I = g0.index, inHand = new Uint8Array(g0.attributes.position.count);
  const isHand = bones.map((b) => /_(Hand|Finger)/.test(b.name)); for (let k = 0; k < inHand.length; k++) { let best = 0, j = 0; for (let c = 0; c < 4; c++) { const w = W.getComponent(k, c); if (w > best) { best = w; j = J.getComponent(k, c); } } inHand[k] = isHand[j] ? 1 : 0; }
  const out = []; for (let i = 0; i < I.count; i += 3) { const a = I.getX(i), b = I.getX(i + 1), c = I.getX(i + 2); if (!(inHand[a] && inHand[b] && inHand[c])) out.push(a, b, c); }
  const g = new THREE.BufferGeometry(); g.attributes = g0.attributes; g.morphAttributes = g0.morphAttributes; g.morphTargetsRelative = g0.morphTargetsRelative; g.boundingSphere = g0.boundingSphere; g.boundingBox = g0.boundingBox; g.setIndex(inHand.length > 65535 ? new THREE.Uint32BufferAttribute(out, 1) : new THREE.Uint16BufferAttribute(out, 1)); return g;
}

function applyFace(mesh, buf) {
  const n = new Uint32Array(buf, 0, 1)[0], idx = new Uint32Array(buf, 4, n), dp = new Float32Array(buf, 4 + n * 4, n * 3), dn = new Float32Array(buf, 4 + n * 4 + n * 12, n * 3);
  const g = mesh.geometry.clone(); g.morphAttributes = mesh.geometry.morphAttributes; g.morphTargetsRelative = mesh.geometry.morphTargetsRelative;
  const P = g.attributes.position, N = g.attributes.normal;
  for (let i = 0; i < n; i++) { const k = idx[i]; P.setXYZ(k, P.getX(k) + dp[i * 3], P.getY(k) + dp[i * 3 + 1], P.getZ(k) + dp[i * 3 + 2]); const x = N.getX(k) + dn[i * 3], y = N.getY(k) + dn[i * 3 + 1], z = N.getZ(k) + dn[i * 3 + 2], l = Math.hypot(x, y, z) || 1; N.setXYZ(k, x / l, y / l, z / l); }
  P.needsUpdate = true; N.needsUpdate = true; mesh.geometry = g;
}

/* One round of curved subdivision on the head, for a jaw and skull without corners on their silhouette. New edge midpoints
   sit on a PN-triangle patch from the vertex normals; UVs, skin and every morph are carried along. Open edges stay straight so
   nothing pulls away from the body, and sharp creases (lips, lids) stay straight so they do not balloon. */
function subdivideHead(geo) {
  const P = geo.attributes.position, N = geo.attributes.normal, T = geo.attributes.uv, J = geo.attributes.skinIndex, W = geo.attributes.skinWeight, I = geo.index, M = geo.morphAttributes.position || [];
  const idx = I.array, remap = new Map(), keep = [];
  const id = (k) => { let r = remap.get(k); if (r === undefined) { r = keep.length; remap.set(k, r); keep.push(k); } return r; };
  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), n0 = new THREE.Vector3(), n1 = new THREE.Vector3(), e = new THREE.Vector3(), b1 = new THREE.Vector3(), b2 = new THREE.Vector3();
  /* position-welded keys: UV seams duplicate vertices, and both sides must agree on the curve */
  const key = (k) => `${Math.round(P.getX(k) * 5000)},${Math.round(P.getY(k) * 5000)},${Math.round(P.getZ(k) * 5000)}`;
  const wnorm = new Map(), welded = new Map(); let nw = 0; const wid = new Int32Array(P.count).fill(-1);
  for (let i = 0; i < idx.length; i++) { const k = idx[i]; if (wid[k] >= 0) continue; const ky = key(k); let w = welded.get(ky); if (w === undefined) { w = nw++; welded.set(ky, w); wnorm.set(w, new THREE.Vector3()); } wid[k] = w; wnorm.get(w).add(n0.fromBufferAttribute(N, k)); }
  for (const v of wnorm.values()) v.normalize();
  const ecount = new Map(); for (let i = 0; i < idx.length; i += 3) for (let j = 0; j < 3; j++) { const a = wid[idx[i + j]], b = wid[idx[i + (j + 1) % 3]], k = a < b ? a * 1e6 + b : b * 1e6 + a; ecount.set(k, (ecount.get(k) || 0) + 1); }
  const mids = []; const midOf = new Map();
  const mid = (a, b) => { const k = a < b ? a * 1e6 + b : b * 1e6 + a; let m = midOf.get(k); if (m === undefined) { m = mids.length; mids.push([a, b]); midOf.set(k, m); } return m; };
  const tris = []; for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2]; id(a); id(b); id(c); tris.push(a, b, c, mid(a, b), mid(b, c), mid(c, a)); }
  const n = keep.length + mids.length, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), ji = new Uint16Array(n * 4), we = new Float32Array(n * 4), mo = M.map(() => new Float32Array(n * 3));
  keep.forEach((k, r) => { pos[r * 3] = P.getX(k); pos[r * 3 + 1] = P.getY(k); pos[r * 3 + 2] = P.getZ(k); nor[r * 3] = N.getX(k); nor[r * 3 + 1] = N.getY(k); nor[r * 3 + 2] = N.getZ(k); uv[r * 2] = T.getX(k); uv[r * 2 + 1] = T.getY(k); for (let c = 0; c < 4; c++) { ji[r * 4 + c] = J.getComponent(k, c); we[r * 4 + c] = W.getComponent(k, c); } M.forEach((a, t) => { mo[t][r * 3] = a.getX(k); mo[t][r * 3 + 1] = a.getY(k); mo[t][r * 3 + 2] = a.getZ(k); }); });
  const base = keep.length, skin = new Map();
  mids.forEach(([a, b], m) => { const r = base + m, wa = wid[a], wb = wid[b], ek = wa < wb ? wa * 1e6 + wb : wb * 1e6 + wa; v0.fromBufferAttribute(P, a); v1.fromBufferAttribute(P, b); const na = wnorm.get(wa), nb = wnorm.get(wb); let x = (v0.x + v1.x) / 2, y = (v0.y + v1.y) / 2, z = (v0.z + v1.z) / 2;
    if (ecount.get(ek) === 2 && na.dot(nb) > 0.64) { e.subVectors(v1, v0); b1.copy(v0).addScaledVector(e, 1 / 3).addScaledVector(na, -e.dot(na) / 3); e.negate(); b2.copy(v1).addScaledVector(e, 1 / 3).addScaledVector(nb, -e.dot(nb) / 3); x = (v0.x + v1.x + 3 * b1.x + 3 * b2.x) / 8; y = (v0.y + v1.y + 3 * b1.y + 3 * b2.y) / 8; z = (v0.z + v1.z + 3 * b1.z + 3 * b2.z) / 8; }
    pos[r * 3] = x; pos[r * 3 + 1] = y; pos[r * 3 + 2] = z; n0.fromBufferAttribute(N, a); n1.fromBufferAttribute(N, b); n0.add(n1).normalize(); nor[r * 3] = n0.x; nor[r * 3 + 1] = n0.y; nor[r * 3 + 2] = n0.z; uv[r * 2] = (T.getX(a) + T.getX(b)) / 2; uv[r * 2 + 1] = (T.getY(a) + T.getY(b)) / 2;
    skin.clear(); for (const k of [a, b]) for (let c = 0; c < 4; c++) { const w = W.getComponent(k, c); if (w > 0) { const j = J.getComponent(k, c); skin.set(j, (skin.get(j) || 0) + w / 2); } } const top = [...skin.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4); const sum = top.reduce((s_, t_) => s_ + t_[1], 0) || 1; top.forEach((t_, c) => { ji[r * 4 + c] = t_[0]; we[r * 4 + c] = t_[1] / sum; });
    M.forEach((at, t) => { mo[t][r * 3] = (at.getX(a) + at.getX(b)) / 2; mo[t][r * 3 + 1] = (at.getY(a) + at.getY(b)) / 2; mo[t][r * 3 + 2] = (at.getZ(a) + at.getZ(b)) / 2; }); });
  const out = []; for (let i = 0; i < tris.length; i += 6) { const a = remap.get(tris[i]), b = remap.get(tris[i + 1]), c = remap.get(tris[i + 2]), ab = base + tris[i + 3], bc = base + tris[i + 4], ca = base + tris[i + 5]; out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('skinIndex', new THREE.BufferAttribute(ji, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(we, 4)); g.setIndex(n > 65535 ? new THREE.Uint32BufferAttribute(out, 1) : new THREE.Uint16BufferAttribute(out, 1));
  if (M.length) { g.morphAttributes.position = mo.map((a) => new THREE.BufferAttribute(a, 3)); g.morphTargetsRelative = geo.morphTargetsRelative; }
  return g;
}

const FIST = { 1: [1.25, 1.55, 1.0], 2: [1.3, 1.6, 1.0], 3: [1.35, 1.6, 1.0], 4: [1.4, 1.55, 1.0] };
const MORPHS_FACE = ['blinkL', 'blinkR', 'jawOpen', 'browDownL', 'browDownR', 'squintL', 'squintR', 'browInnerUp', 'frownL', 'frownR', 'stretchL', 'stretchR', 'cheekPuff', 'wideL', 'wideR'];

export class Fighter {
  /* variant 'b' is the second person: another man's head shape and skin on the same skeleton, with every face morph intact */
  constructor({ corner = 'blue', build = 0.55, tint = null, gloved = true, variant = 'a' }) {
    if (!shared.gltf) throw new Error('preloadFighter first');
    const T = shared.tex; this.corner = corner; this.root = new THREE.Group(); this.root.name = 'fighter-' + corner;
    this.model = cloneSkinned(shared.gltf.scene); this.root.add(this.model);
    this.bones = {}; this.meshes = {}; this.skinMats = [];
    const C = CORNER[corner];
    const tn = T.tn, X = variant === 'b' ? T.b : T; this.variant = variant; const skinBody = makeSkin({ map: X.bd, normalMap: T.bn, specMap: T.bs, tint }); const skinHead = makeSkin({ map: X.hd, normalMap: X.hn, specMap: X.hs, tint, normalScale: 0.9 }); this.skinMats = [skinBody, skinHead];
    const trunks = new THREE.MeshPhysicalMaterial({ map: trunksMap(C.trunks, C.stripe), normalMap: tn, roughnessMap: T.tr, roughness: 1, metalness: 0, sheen: 0.6, sheenRoughness: 0.35, sheenColor: new THREE.Color(C.trunks).lerp(new THREE.Color(0xffffff), 0.35), side: THREE.DoubleSide });
    const boots = new THREE.MeshStandardMaterial({ map: T.od, normalMap: T.on, roughnessMap: T.or, roughness: 1 });
    const glove = new THREE.MeshPhysicalMaterial({ map: T.gd, normalMap: T.gn, roughnessMap: T.gr, roughness: 1.0, color: C.glove, clearcoat: 0.22, clearcoatRoughness: 0.42, specularIntensity: 0.7 });
    /* glove_d's alpha holds where the corner colour applies: leather takes it, trim, thread and strap do not */
    glove.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', 'vec4 gloveTex=texture2D(map,vMapUv);diffuseColor.rgb=mix(gloveTex.rgb,gloveTex.rgb*diffuseColor.rgb,gloveTex.a);'); };
    glove.customProgramCacheKey = () => 'glove1';
    this.gloveMat = glove;
    this.model.traverse((n) => {
      if (n.isBone) this.bones[n.name] = n;
      if (n.isMesh) {
        n.frustumCulled = false; n.castShadow = true; n.receiveShadow = true;
        const k = n.material.name; this.meshes[k] = n;
        if (k.includes('head')) n.material = skinHead; else if (k.includes('body')) n.material = skinBody; else if (k === 'trunks') n.material = trunks; else if (k === 'boots') n.material = boots;
      }
    });
    this.head = Object.values(this.meshes).find((m) => m.material === skinHead);
    if (variant === 'b' && shared.face.b) applyFace(this.head, shared.face.b);
    if (shared.smoothHead) { let g = shared.heads[variant]; if (!g) g = shared.heads[variant] = subdivideHead(this.head.geometry); this.head.geometry = g; }
    if (gloved) { const b = Object.values(this.meshes).find((m) => m.material === skinBody); if (b) b.geometry = shared.bodyGloved ??= withoutHands(b); }
    this.gloves = {};
    for (const s of ['L', 'R']) {
      const g = new THREE.Mesh(shared.gloves[s], glove); g.castShadow = true; g.receiveShadow = true; g.visible = gloved; this.bones[`Bip01_${s}_Hand`].add(g); this.gloves[s] = g;
      for (const f in FIST) { const a = FIST[f]; ['', '1', '2'].forEach((j, i) => { const b = this.bones[`Bip01_${s}_Finger${f}${j}`]; if (b) b.rotateZ(a[i]); }); }
    }
    this.setBuild(build); this.face = {}; this.blinkT = 2; this.t = Math.random() * 10;
  }
  setBuild(v) { this.build = v; for (const m of Object.values(this.meshes)) { const d = m.morphTargetDictionary; if (d && 'muscle' in d) m.morphTargetInfluences[d.muscle] = v; } }
  setSweat(v) { for (const m of this.skinMats) m.userData.u.uSweat.value = v; }
  setFlush(v) { for (const m of this.skinMats) m.userData.u.uFlush.value = v; }
  morph(name, v) { const m = this.head; if (!m) return; const i = m.morphTargetDictionary[name]; if (i !== undefined) m.morphTargetInfluences[i] = v; }
}
