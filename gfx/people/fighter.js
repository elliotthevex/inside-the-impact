/* A fighter: the Rocketbox athlete with trunks, boots, gloves and a fist. One instance per person in the ring.
   Only reads what it is told. It holds no game state and never writes any. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { makeSkin } from './skin.js';
import { buildGloveGeometry } from './glove.js';

const BASE = new URL('../../assets/people/', import.meta.url).href;
const shared = { gltf: null, tex: {}, gloves: null };
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
  Object.assign(shared, { gltf, tex: { bd, bn, bs, hd, hn, hs, gd, gn, gr, tn, tr, od, on, or } });
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

const FIST = { 1: [1.25, 1.55, 1.0], 2: [1.3, 1.6, 1.0], 3: [1.35, 1.6, 1.0], 4: [1.4, 1.55, 1.0] };
const MORPHS_FACE = ['blinkL', 'blinkR', 'jawOpen', 'browDownL', 'browDownR', 'squintL', 'squintR', 'browInnerUp', 'frownL', 'frownR', 'stretchL', 'stretchR', 'cheekPuff', 'wideL', 'wideR'];

export class Fighter {
  constructor({ corner = 'blue', build = 0.55, tint = null, gloved = true }) {
    if (!shared.gltf) throw new Error('preloadFighter first');
    const T = shared.tex; this.corner = corner; this.root = new THREE.Group(); this.root.name = 'fighter-' + corner;
    this.model = cloneSkinned(shared.gltf.scene); this.root.add(this.model);
    this.bones = {}; this.meshes = {}; this.skinMats = [];
    const C = CORNER[corner];
    const tn = T.tn; const skinBody = makeSkin({ map: T.bd, normalMap: T.bn, specMap: T.bs, tint }); const skinHead = makeSkin({ map: T.hd, normalMap: T.hn, specMap: T.hs, tint, normalScale: 0.9 }); this.skinMats = [skinBody, skinHead];
    const trunks = new THREE.MeshPhysicalMaterial({ map: trunksMap(C.trunks, C.stripe), normalMap: tn, roughnessMap: T.tr, roughness: 1, metalness: 0, sheen: 0.6, sheenRoughness: 0.35, sheenColor: new THREE.Color(C.trunks).lerp(new THREE.Color(0xffffff), 0.35), side: THREE.DoubleSide });
    const boots = new THREE.MeshStandardMaterial({ map: T.od, normalMap: T.on, roughnessMap: T.or, roughness: 1 });
    const glove = new THREE.MeshPhysicalMaterial({ map: T.gd, normalMap: T.gn, roughnessMap: T.gr, roughness: 1.0, color: C.glove, clearcoat: 0.08, clearcoatRoughness: 0.5 });
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
