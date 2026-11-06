/* The kit the fight venue is built from: PBR materials with world-space grime, the ring, the room shell, the lamp, haze and dust.

   Everything is real geometry lit by real lights. Static pieces are merged per material so the whole room costs few draw calls;
   repeated props are instanced. Surfaces carry UVs in metres, so one tile size means the same thing everywhere. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const TEX = new URL('../../assets/tex/', import.meta.url).href;
const MODELS = new URL('../../assets/models/ph/', import.meta.url).href;
const PERSON = new URL('../../assets/people/fighter.glb', import.meta.url).href;

/* Sizes in metres. Sim and camera read these through the stage. */
export const RING = {
  platformHalf: 3.2,   // 6.4 m platform
  canvasY: 0.75,       // platform height
  postAt: 3.0,         // post centres
  ropeAt: 2.93,        // rope centre line
  ropeR: 0.024,
  ringHalf: 2.9,       // inside the ropes
  ropeH: [0.45, 0.85, 1.25], // above the canvas
  postTop: 1.42,
};
export const ROOM = { half: 9, height: 4.5 };

let mgr; const texCache = new Map(); const modelCache = new Map(); const pending = [];
export function setLoader(m) { mgr = m || undefined; }
/* Resolves when every texture asked for so far has arrived. Clones made before that share the image once it does. */
export function texturesReady() { return Promise.all(pending); }

function loadTex(file, srgb, aniso = 4) {
  const key = file + (srgb ? ':s' : '');
  if (!texCache.has(key)) {
    const t = new THREE.Texture();
    const fetch = (tries, ok, err) => new THREE.ImageLoader(mgr).load(TEX + file, (img) => { t.image = img; t.needsUpdate = true; ok(t); }, undefined, (e) => { if (tries > 0) setTimeout(() => fetch(tries - 1, ok, err), 500); else err(e); });
    pending.push(new Promise((ok, err) => fetch(2, ok, err)));
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key, t);
  }
  return texCache.get(key);
}

/* A shared RGBA tileable noise, one octave band per channel: r low, g mid, b high, a spotty. One lookup gives four scales. */
let noiseTex = null;
export function noiseTexture() {
  if (noiseTex) return noiseTex;
  const S = 256; const data = new Uint8Array(S * S * 4);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const lattice = (p) => { const a = new Float32Array(p * p); for (let i = 0; i < a.length; i++) a[i] = rnd(); return a; };
  const sample = (a, p, x, y) => {
    const fx = x * p; const fy = y * p; const ix = Math.floor(fx); const iy = Math.floor(fy); let u = fx - ix; let v = fy - iy;
    u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
    const g = (i, j) => a[((j + p) % p) * p + ((i + p) % p)];
    return (g(ix, iy) * (1 - u) + g(ix + 1, iy) * u) * (1 - v) + (g(ix, iy + 1) * (1 - u) + g(ix + 1, iy + 1) * u) * v;
  };
  const oct = [4, 8, 16, 32, 64, 128].map((p) => [p, lattice(p)]);
  const fbm = (x, y, from, n) => { let s = 0; let w = 0; let k = 1; for (let i = from; i < from + n && i < oct.length; i++) { s += sample(oct[i][1], oct[i][0], x, y) * k; w += k; k *= 0.55; } return s / w; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = i / S; const y = j / S; const o = (j * S + i) * 4;
    data[o] = fbm(x, y, 0, 3) * 255; data[o + 1] = fbm(x + 0.31, y + 0.77, 2, 3) * 255; data[o + 2] = fbm(x + 0.53, y + 0.11, 4, 2) * 255;
    const sp = fbm(x + 0.71, y + 0.43, 1, 4); data[o + 3] = Math.max(0, Math.min(1, (sp - 0.42) * 4)) * 255;
  }
  const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  noiseTex = t; return t;
}

/* A PBR material from Poly Haven maps converted by ph.py. tile = metres per repeat when the geometry has UVs in metres. */
export function pbr(id, o = {}) {
  const maps = o.maps || ['diff', 'nor_gl', 'rough']; const aniso = o.aniso || 4; const rep = o.repeat || (o.tile ? [1 / o.tile, 1 / o.tile] : [1, 1]);
  const get = (m, s) => { const t = loadTex(`${id}_${m}.webp`, s, aniso).clone(); t.repeat.set(rep[0], rep[1]); t.needsUpdate = true; return t; };
  const mat = new THREE.MeshStandardMaterial({ roughness: o.roughness ?? 1, metalness: o.metalness ?? 0, color: o.color ?? 0xffffff, side: o.side ?? THREE.FrontSide });
  if (maps.includes('diff')) mat.map = get('diff', true);
  if (maps.includes('nor_gl')) { mat.normalMap = get('nor_gl', false); const n = o.normalScale ?? 1; mat.normalScale.set(n, n); }
  if (maps.includes('rough')) mat.roughnessMap = get('rough', false);
  mat.name = id; return mat;
}

/* ---- Baked light ----
   The bulbs are static, so their light is computed once per vertex at load, with soft shadows from columns, beams, ducts, benches and the
   ring, and ambient occlusion from the same boxes. World surfaces then skip the real point lights altogether: they run the shadowed key
   light, the environment and one varying. Real point lights stay for the fighters and small props, where they cost few pixels.
   A dominant light direction is kept per vertex, so normal maps still catch the bulbs. */
const BAKE_VS_PARS = 'attribute vec3 aBake;attribute vec4 aBakeDir;varying vec3 vBake;varying vec4 vBakeDir;';
const BAKE_VS = 'vBake=aBake;vBakeDir=vec4(mat3(viewMatrix)*aBakeDir.xyz,aBakeDir.w);';
const NO_POINTS = THREE.ShaderChunk.lights_fragment_begin.replace(/#if \( NUM_POINT_LIGHTS > 0 \) && defined\( RE_Direct \)[\s\S]*?#pragma unroll_loop_end\s*#endif/, '');
/* Patches a standard-material shader to use baked light. hemi: one value per instance (crowd, benches), else per vertex. */
export function applyBake(s, { hemi = false, spec = false } = {}) {
  s.vertexShader = s.vertexShader.replace('#include <common>', `#include <common>\n${BAKE_VS_PARS}`).replace('#include <begin_vertex>', `#include <begin_vertex>\n ${BAKE_VS}`);
  s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBake;varying vec4 vBakeDir;')
    .replace('#include <lights_fragment_begin>', NO_POINTS)
    .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
 #if defined( RE_IndirectDiffuse )
 {vec3 bd=vBakeDir.xyz;
 ${hemi ? 'irradiance+=vBake*(.62+.38*dot(normal,bd));' : 'float bk=1.+(dot(normal,bd)-dot(nonPerturbedNormal,bd))*1.6;irradiance+=vBake*clamp(bk,.15,2.4);'}
 iblIrradiance*=vBakeDir.w;
 ${spec ? 'float bl=length(bd);if(bl>.05){vec3 bL=bd/bl;float bnl=saturate(dot(normal,bL));if(bnl>.001)reflectedLight.directSpecular+=vBake*bnl*BRDF_GGX(bL,geometryViewDir,normal,material);}' : ''}
 }
 #endif
 #if defined( RE_IndirectSpecular )
 radiance*=mix(1.,vBakeDir.w,.7);
 #endif`);
}

/* Occluder as [minx,miny,minz,maxx,maxy,maxz] from centre and size. */
export function aabb(cx, cy, cz, w, h, d) { return [cx - w / 2, cy - h / 2, cz - d / 2, cx + w / 2, cy + h / 2, cz + d / 2]; }

const AO_DIRS = (() => { const out = []; const N = 12; for (let i = 0; i < N; i++) { const f = (i + 0.5) / N; const r = Math.sqrt(f); const a = i * 2.3999632; out.push([Math.cos(a) * r, Math.sqrt(1 - f), Math.sin(a) * r]); } return out; })();
const JITTER = [[0, 0, 0], [0.16, 0.05, -0.1], [-0.13, -0.06, 0.14], [0.05, -0.1, -0.16]];

export class LightField {
  /* lights: {p:[x,y,z], c:[r,g,b] linear times intensity, decay, tag}. boxes: aabb(). */
  constructor({ lights, boxes, ambient = [0.05, 0.043, 0.036], aoDist = 1.5, samples = 3, half = ROOM.half, height = ROOM.height }) {
    this.lights = lights; this.boxes = boxes; this.ambient = ambient; this.aoDist = aoDist; this.samples = samples; this.half = half; this.height = height; this.rays = 0;
  }
  _hit(ox, oy, oz, dx, dy, dz, tmax, list) {
    this.rays++;
    for (let i = 0; i < list.length; i++) {
      const b = list[i]; let t0 = 0.001; let t1 = tmax; let a; let c;
      if (dx > 1e-9 || dx < -1e-9) { const k = 1 / dx; a = (b[0] - ox) * k; c = (b[3] - ox) * k; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue; } else if (ox < b[0] || ox > b[3]) continue;
      if (dy > 1e-9 || dy < -1e-9) { const k = 1 / dy; a = (b[1] - oy) * k; c = (b[4] - oy) * k; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue; } else if (oy < b[1] || oy > b[4]) continue;
      if (dz > 1e-9 || dz < -1e-9) { const k = 1 / dz; a = (b[2] - oz) * k; c = (b[5] - oz) * k; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) continue; } else if (oz < b[2] || oz > b[5]) continue;
      return true;
    }
    return false;
  }
  /* Irradiance at a point. n null means no surface: an average over directions, for people. out: r g b, dir xyz, ao */
  sample(px, py, pz, nx, ny, nz, out, skip) {
    const has = nx !== null; const ox = px + (has ? nx * 0.03 : 0); const oy = py + (has ? ny * 0.03 : 0); const oz = pz + (has ? nz * 0.03 : 0); let r = 0; let g = 0; let bb = 0; let dx = 0; let dy = 0; let dz = 0;
    const S = this.samples; const boxes = this.boxes;
    for (const L of this.lights) {
      if (skip && skip === L.tag) continue;
      const lx0 = L.p[0] - ox; const ly0 = L.p[1] - oy; const lz0 = L.p[2] - oz; const d0 = Math.sqrt(lx0 * lx0 + ly0 * ly0 + lz0 * lz0) + 1e-5;
      const nl = has ? (lx0 * nx + ly0 * ny + lz0 * nz) / d0 : 0.5 + 0.1 * Math.max(0, ly0 / d0); if (nl <= 0) continue;
      const att = 1 / Math.pow(Math.max(d0, 0.35), L.decay); const lum = (L.c[0] + L.c[1] + L.c[2]) * att * nl; if (lum < 0.012) continue;
      let vis = 0;
      for (let s = 0; s < S; s++) {
        const j = JITTER[s]; const lx = lx0 + j[0]; const ly = ly0 + j[1]; const lz = lz0 + j[2]; const d = Math.sqrt(lx * lx + ly * ly + lz * lz);
        if (!this._hit(ox, oy, oz, lx / d, ly / d, lz / d, d, boxes)) vis += 1;
      }
      vis /= S; if (vis <= 0) continue;
      const e = att * nl * vis; r += L.c[0] * e; g += L.c[1] * e; bb += L.c[2] * e; const w = lum * vis / d0; dx += lx0 * w; dy += ly0 * w; dz += lz0 * w;
    }
    let ao = 1;
    if (has) {
      /* tangent frame, then a short cosine fan against the boxes and the room shell */
      const ux = Math.abs(nx) > 0.9 ? 0 : 1; const uy = Math.abs(nx) > 0.9 ? 1 : 0; let tx = uy * nz; let ty = -ux * nz; let tz = ux * ny - uy * nx; const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl; const bx = ny * tz - nz * ty; const by = nz * tx - nx * tz; const bz = nx * ty - ny * tx;
      const D = this.aoDist; const H = this.half; const T = this.height; let near = this._near; near = []; for (const b of boxes) { const ex = Math.max(b[0] - ox, 0, ox - b[3]); const ey = Math.max(b[1] - oy, 0, oy - b[4]); const ez = Math.max(b[2] - oz, 0, oz - b[5]); if (ex * ex + ey * ey + ez * ez < D * D) near.push(b); }
      let occ = 0;
      for (const a of AO_DIRS) {
        const rx = tx * a[0] + nx * a[1] + bx * a[2]; const ry = ty * a[0] + ny * a[1] + by * a[2]; const rz = tz * a[0] + nz * a[1] + bz * a[2];
        let tmax = D; let shell = false;
        if (rx > 1e-4) { const t = (H - ox) / rx; if (t < tmax) { tmax = t; shell = true; } } else if (rx < -1e-4) { const t = (-H - ox) / rx; if (t < tmax) { tmax = t; shell = true; } }
        if (rz > 1e-4) { const t = (H - oz) / rz; if (t < tmax) { tmax = t; shell = true; } } else if (rz < -1e-4) { const t = (-H - oz) / rz; if (t < tmax) { tmax = t; shell = true; } }
        if (ry > 1e-4) { const t = (T - oy) / ry; if (t < tmax) { tmax = t; shell = true; } } else if (ry < -1e-4) { const t = (0 - oy) / ry; if (t < tmax) { tmax = t; shell = true; } }
        if (shell) occ += 1 - tmax / D * 0.7; else if (near.length && this._hit(ox, oy, oz, rx, ry, rz, D, near)) occ += 0.85;
      }
      ao = Math.max(0.12, 1 - (occ / AO_DIRS.length) * 1.5);
    }
    const dl = Math.hypot(dx, dy, dz);
    out[0] = r + this.ambient[0] * ao; out[1] = g + this.ambient[1] * ao; out[2] = bb + this.ambient[2] * ao;
    if (dl > 1e-6) { out[3] = dx / dl; out[4] = dy / dl; out[5] = dz / dl; } else { out[3] = 0; out[4] = 0; out[5] = 0; }
    out[6] = ao;
  }
  bakeGeometry(g, skip) {
    const p = g.attributes.position; const n = g.attributes.normal; const a = new Float32Array(p.count * 3); const d = new Float32Array(p.count * 4); const o = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < p.count; i++) { this.sample(p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i), o, skip); a[i * 3] = o[0]; a[i * 3 + 1] = o[1]; a[i * 3 + 2] = o[2]; d[i * 4] = o[3]; d[i * 4 + 1] = o[4]; d[i * 4 + 2] = o[5]; d[i * 4 + 3] = o[6]; }
    g.setAttribute('aBake', new THREE.BufferAttribute(a, 3)); g.setAttribute('aBakeDir', new THREE.BufferAttribute(d, 4)); return g;
  }
  bakeInstances(im, y = 1, ao = 0.9, gain = 1) {
    const n = im.instanceMatrix.count; const a = new Float32Array(n * 3); const d = new Float32Array(n * 4); const o = [0, 0, 0, 0, 0, 0, 0]; const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { im.getMatrixAt(i, m); const e = m.elements; this.sample(e[12], e[13] + y, e[14], null, null, null, o); a[i * 3] = o[0] * gain; a[i * 3 + 1] = o[1] * gain; a[i * 3 + 2] = o[2] * gain; d[i * 4] = o[3]; d[i * 4 + 1] = o[4]; d[i * 4 + 2] = o[5]; d[i * 4 + 3] = ao; }
    im.geometry.setAttribute('aBake', new THREE.InstancedBufferAttribute(a, 3)); im.geometry.setAttribute('aBakeDir', new THREE.InstancedBufferAttribute(d, 4)); return im;
  }
}

const bakedMats = new Map();
/* Forgets the baked copies when a stage closes: each stage makes its own materials, so old entries would only pile up. */
export function clearBakedMaterials() { bakedMats.clear(); }
function bakedMaterial(mat, hemi, spec) {
  const key = `${mat.uuid}:${hemi}:${spec}`; if (bakedMats.has(key)) return bakedMats.get(key);
  const m = mat.clone(); m.onBeforeCompile = (s) => applyBake(s, { hemi, spec }); m.customProgramCacheKey = () => `bakeprop${hemi ? 1 : 0}${spec ? 1 : 0}`; bakedMats.set(key, m); return m;
}
/* Puts a placed prop on baked light: per vertex for a single mesh, per instance for an instanced one. Its shaders then skip the real point lights too. */
export function bakeInto(field, root, { spec = true, skip, y = 0, ao = 0.85, single = false } = {}) {
  root.updateWorldMatrix(true, true);
  root.traverse((m) => {
    if (!m.isMesh) return; const inst = m.isInstancedMesh || single;
    if (m.isInstancedMesh) field.bakeInstances(m, y, ao);
    else if (single) {
      /* a small prop: one sample at its middle, read per pixel against a dominant direction. Dense models stay cheap to bake. */
      const b = new THREE.Box3().setFromObject(m); const c = b.getCenter(new THREE.Vector3()); const o = [0, 0, 0, 0, 0, 0, 0]; field.sample(c.x, c.y, c.z, null, null, null, o); const g = m.geometry.clone(); const n = g.attributes.position.count; const a = new Float32Array(n * 3); const d = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) { a[i * 3] = o[0]; a[i * 3 + 1] = o[1]; a[i * 3 + 2] = o[2]; d[i * 4] = o[3]; d[i * 4 + 1] = o[4]; d[i * 4 + 2] = o[5]; d[i * 4 + 3] = ao; }
      g.setAttribute('aBake', new THREE.BufferAttribute(a, 3)); g.setAttribute('aBakeDir', new THREE.BufferAttribute(d, 4)); m.geometry = g;
    } else {
      const g = m.geometry.clone(); const w = g.clone(); w.applyMatrix4(m.matrixWorld); if (!w.attributes.normal) w.computeVertexNormals();
      field.bakeGeometry(w, skip); g.setAttribute('aBake', w.attributes.aBake); g.setAttribute('aBakeDir', w.attributes.aBakeDir); m.geometry = g; w.dispose();
    }
    m.material = Array.isArray(m.material) ? m.material.map((x) => bakedMaterial(x, inst, spec)) : bakedMaterial(m.material, inst, spec);
  });
}

/* World-space detail on top of a PBR material, so nothing reads as a tiled grid: macro tone, damp rising from the floor, soot, streaks,
   old paint, puddles. All of it costs one or two noise lookups. kind: 'wall' | 'floor' | 'concrete' | 'plain'.
   bake: 'vertex' or 'instance' switches the surface to baked light. bulbs: [{p,c}] adds their mirror highlights to a wet floor. */
export function grime(mat, o = {}) {
  const kind = o.kind || 'plain'; const bulbs = o.bulbs || []; const NB = bulbs.length;
  const u = {
    uNoise: { value: noiseTexture() }, uMacro: { value: o.macro ?? 0.35 }, uSpecBoost: { value: o.specBoost ?? 1 }, uDiffBoost: { value: o.diffBoost ?? 1 },
    uPaint: { value: new THREE.Color(o.paint ?? 0x39453f) }, uPaintH: { value: o.paintH ?? 1.25 }, uWet: { value: o.wet ?? 0.5 }, uRoomH: { value: ROOM.height }, uContact: { value: o.contact ?? null },
  };
  if (NB) { u.uBulbP = { value: bulbs.map((b) => new THREE.Vector3(...b.p)) }; u.uBulbC = { value: bulbs.map((b) => new THREE.Vector3(...b.c)) }; }
  mat.userData.u = u;
  const KIND = { wall: 1, floor: 2, concrete: 3, plain: 0 }[kind];
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    if (o.bake) applyBake(s, { hemi: o.bake === 'instance', spec: !!o.bakeSpec });
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;varying vec3 vWN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
 {mat4 wm=modelMatrix;
 #ifdef USE_INSTANCING
 wm=modelMatrix*instanceMatrix;
 #endif
 vWP=(wm*vec4(position,1.)).xyz;vWN=normalize(mat3(wm)*normal);}`);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP;varying vec3 vWN;uniform sampler2D uNoise;uniform float uMacro,uSpecBoost,uDiffBoost,uPaintH,uWet,uRoomH;uniform vec3 uPaint;
${KIND === 2 ? 'uniform sampler2D uContact;' : ''}${NB ? `uniform vec3 uBulbP[${NB}];uniform vec3 uBulbC[${NB}];` : ''}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
 float gWet=0.;float gRough=1.;float gCS=1.;
 {
  vec2 q=abs(vWN.y)>.5?vWP.xz:vec2(vWP.x+vWP.z,vWP.y);
  vec4 n1=texture2D(uNoise,q*.043+vec2(.13,.37));vec4 n2=texture2D(uNoise,q.yx*.0117+vec2(.61,.19));
  float macro=n1.r*.55+n2.r*.45;
  diffuseColor.rgb*=mix(1.,.55+macro*.95,uMacro);
#if ${KIND}==1
  float y=vWP.y;
  vec4 s1=texture2D(uNoise,vec2(q.x*.21,y*.018));
  float streak=smoothstep(.52,.74,s1.g)*smoothstep(.2,1.6,y)*(1.-smoothstep(3.4,4.4,y)*.4);
  diffuseColor.rgb*=1.-streak*.5;gRough*=1.-streak*.22;
  float edge=uPaintH+(n1.b-.5)*.02;float chip=smoothstep(.34,.62,n1.a*.45+n1.g*.55+(y/uPaintH-.5)*.1);
  float paint=(1.-smoothstep(edge-.004,edge+.004,y))*(1.-chip*.8);
  diffuseColor.rgb=mix(diffuseColor.rgb,uPaint*(.62+macro*.7)*(.55+diffuseColor.g*2.2),paint);gRough*=1.-paint*.26;
  float dh=y/(.5+macro*1.1);float damp=1.-smoothstep(.15,1.,dh);
  diffuseColor.rgb*=1.-damp*.58;gRough*=1.-damp*.55;
  diffuseColor.rgb*=1.-smoothstep(3.1,4.5,y)*.55;
#elif ${KIND}==2
  vec2 w=vec2(q.x*.866-q.y*.5,q.x*.5+q.y*.866)*.29;
  vec3 d2=texture2D(map,w).rgb;
  diffuseColor.rgb*=.6+d2*1.05;
  float edge=max(abs(vWP.x),abs(vWP.z));
  float pud=macro*.72+n1.g*.28+smoothstep(6.,9.,edge)*.13;
  gWet=smoothstep(.44-uWet*.14,.66-uWet*.08,pud);
  float damp=smoothstep(.34,.56,pud);
  diffuseColor.rgb*=mix(1.,.5,damp);diffuseColor.rgb*=mix(1.,.72,gWet);
  gRough=mix(mix(.92,.42,damp),.06,gWet);
  gCS=texture2D(uContact,vWP.xz/18.+.5).r;diffuseColor.rgb*=gCS;
#elif ${KIND}==3
  float y=vWP.y;
  float dh=y/(.45+macro*.9);diffuseColor.rgb*=1.-(1.-smoothstep(.1,1.,dh))*.5;
  if(abs(vWN.y)<.5){vec4 s1=texture2D(uNoise,vec2(q.x*.3,y*.02));diffuseColor.rgb*=1.-smoothstep(.55,.76,s1.g)*.4;}
#endif
 }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
 roughnessFactor=clamp(roughnessFactor*gRough,.045,1.);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
 normal=normalize(mix(normal,nonPerturbedNormal,gWet*.96));`)
      .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
 #if defined( RE_IndirectSpecular )
 radiance*=uSpecBoost*gCS;${KIND === 2 ? 'radiance=min(radiance,vec3(.42,.38,.34));' : ''}
 #endif
 #if defined( RE_IndirectDiffuse )
 iblIrradiance*=uDiffBoost;
 #endif
 ${KIND === 2 ? 'reflectedLight.directSpecular=min(reflectedLight.directSpecular*.35,vec3(.55,.46,.38));' : ''}${NB ? `for(int i=0;i<${NB};i++){vec3 lp=(viewMatrix*vec4(uBulbP[i],1.)).xyz-geometryPosition;float dd=length(lp);vec3 ll=lp/dd;float nl=max(dot(normal,ll),0.);reflectedLight.directSpecular+=min(uBulbC[i]*nl/pow(dd,1.15)*BRDF_GGX(ll,geometryViewDir,normal,material)*gCS,vec3(1.3,.8,.5));}` : ''}`);
  };
  mat.customProgramCacheKey = () => `grime${kind}:${o.bake || 0}:${o.bakeSpec ? 1 : 0}:${NB}`;
  return mat;
}

export async function loadModel(id) {
  if (!modelCache.has(id)) modelCache.set(id, new GLTFLoader(mgr).loadAsync(`${MODELS}${id}/${id}_1k.gltf`).catch(() => new Promise((ok) => setTimeout(ok, 500)).then(() => new GLTFLoader(mgr).loadAsync(`${MODELS}${id}/${id}_1k.gltf`))));
  const g = await modelCache.get(id); const meshes = {};
  g.scene.traverse((n) => {
    if (!n.isMesh) return; meshes[n.name] = n; n.castShadow = false; n.receiveShadow = true;
    /* Real transmission makes three draw every opaque object a second time, each frame. These are tiny lamp glasses: plain alpha looks the same. */
    if (n.material.transmission > 0) { n.material.transmission = 0; n.material.transparent = true; n.material.opacity = 0.32; n.material.depthWrite = false; }
  });
  return { scene: g.scene, meshes };
}

/* One InstancedMesh for a model's mesh, geometry in its own local space. list: Matrix4s. */
export function instanced(mesh, list, { cast = false, receive = true } = {}) {
  const im = new THREE.InstancedMesh(mesh.geometry, mesh.material, list.length);
  list.forEach((m, i) => im.setMatrixAt(i, m)); im.instanceMatrix.needsUpdate = true; im.castShadow = cast; im.receiveShadow = receive; im.computeBoundingSphere();
  return im;
}
export function trs(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
}

/* Geometry helpers. */
export function box(w, h, d, x = 0, y = 0, z = 0) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; }
/* A box cut into cells of about res metres, for per-vertex light. */
export function sbox(w, h, d, x, y, z, res = 0.25) { const g = new THREE.BoxGeometry(w, h, d, Math.max(1, Math.round(w / res)), Math.max(1, Math.round(h / res)), Math.max(1, Math.round(d / res))); g.translate(x, y, z); return g; }
/* Sets UVs to world metres, chosen per vertex by the dominant axis of its normal. */
export function metreUV(g, sc = 1, off = [0, 0]) {
  const p = g.attributes.position; const n = g.attributes.normal; const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)); const ay = Math.abs(n.getY(i)); const az = Math.abs(n.getZ(i)); let a; let b;
    if (ax >= ay && ax >= az) { a = p.getZ(i); b = p.getY(i); } else if (ay >= az) { a = p.getX(i); b = p.getZ(i); } else { a = p.getX(i); b = p.getY(i); }
    uv.setXY(i, a * sc + off[0], b * sc + off[1]);
  }
  return g;
}
/* A cable or rod between two points, sagging by sag metres. */
export function cable(a, b, sag = 0.1, r = 0.008, seg = 10, rad = 4) {
  const A = new THREE.Vector3(...a); const B = new THREE.Vector3(...b); const pts = [];
  for (let i = 0; i <= seg; i++) { const t = i / seg; const p = A.clone().lerp(B, t); p.y -= sag * 4 * t * (1 - t); pts.push(p); }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, rad, false);
}
export function tube(a, b, r = 0.03, rad = 8) { return cable(a, b, 0, r, 1, rad); }
function colored(g, hex) {
  const c = new THREE.Color(hex); const n = g.attributes.position.count; const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
}

/* Painted canvas: oxblood cloth, worn pale where feet go, scuffs, old sweat rings, a faded print. Drawn at load, no image file. */
function paintCanvas(size = 1024) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); const r = document.createElement('canvas'); r.width = r.height = 512; const y = r.getContext('2d');
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const s = size;
  x.fillStyle = '#4a221d'; x.fillRect(0, 0, s, s);
  y.fillStyle = '#c8c8c8'; y.fillRect(0, 0, 512, 512);
  const blot = (cx, cy, rad, col, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); };
  for (let i = 0; i < 90; i++) blot(rnd() * s, rnd() * s, 40 + rnd() * 180, rnd() < 0.5 ? 'rgba(20,9,8,A)' : 'rgba(112,72,60,A)', 0.05 + rnd() * 0.1);
  blot(s / 2, s / 2, s * 0.46, 'rgba(150,118,104,A)', 0.36); // traffic wear in the middle
  // fine cloth noise
  const img = x.getImageData(0, 0, s, s); const d = img.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 12; d[i] += n; d[i + 1] += n * 0.8; d[i + 2] += n * 0.8; } x.putImageData(img, 0, 0);
  // faded print
  x.save(); x.translate(s / 2, s / 2); x.globalAlpha = 0.17; x.strokeStyle = '#d8cfc2'; x.fillStyle = '#d8cfc2'; x.lineWidth = s * 0.008;
  x.beginPath(); x.arc(0, 0, s * 0.155, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 0, s * 0.137, 0, 7); x.stroke();
  x.font = `700 ${s * 0.036}px "Arial Narrow", Impact, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INSIDE', 0, -s * 0.03); x.fillText('THE IMPACT', 0, s * 0.03);
  x.globalAlpha = 0.1; x.lineWidth = s * 0.005; x.strokeRect(-s * 0.44, -s * 0.44, s * 0.88, s * 0.88); x.restore();
  // scuffs: short curved drags from boots, densest near the middle, plus heel arcs
  for (let i = 0; i < 620; i++) {
    const a = rnd() * 6.283; const rr = Math.pow(rnd(), 0.7) * s * 0.47; const px = s / 2 + Math.cos(a) * rr; const py = s / 2 + Math.sin(a) * rr; const L = 6 + rnd() * 46; const ang = rnd() * 6.283; const dark = rnd() < 0.55;
    x.strokeStyle = dark ? `rgba(14,5,4,${0.06 + rnd() * 0.17})` : `rgba(196,160,140,${0.03 + rnd() * 0.09})`; x.lineWidth = 0.6 + rnd() * 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(ang) * L * 0.6 + rnd() * 8, py + Math.sin(ang) * L * 0.6 + rnd() * 8, px + Math.cos(ang) * L, py + Math.sin(ang) * L); x.stroke();
    const k = 512 / s; y.strokeStyle = dark ? `rgba(90,90,90,${0.2 + rnd() * 0.25})` : `rgba(235,235,235,${0.15})`; y.lineWidth = (1 + rnd() * 4) * k; y.beginPath(); y.moveTo(px * k, py * k); y.lineTo((px + Math.cos(ang) * L) * k, (py + Math.sin(ang) * L) * k); y.stroke();
  }
  // dried sweat and water, a little shinier
  for (let i = 0; i < 26; i++) { const px = s * 0.12 + rnd() * s * 0.76; const py = s * 0.12 + rnd() * s * 0.76; const rad = 10 + rnd() * 46; blot(px, py, rad, 'rgba(24,8,6,A)', 0.2); const k = 512 / s; const g = y.createRadialGradient(px * k, py * k, 0, px * k, py * k, rad * k); g.addColorStop(0, 'rgba(70,70,70,.55)'); g.addColorStop(1, 'rgba(70,70,70,0)'); y.fillStyle = g; y.fillRect((px - rad) * k, (py - rad) * k, rad * 2 * k, rad * 2 * k); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; map.generateMipmaps = true;
  const rough = new THREE.CanvasTexture(r); rough.anisotropy = 4;
  return { map, rough };
}
function paintRopeTape() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d');
  x.fillStyle = '#c9c3b6'; x.fillRect(0, 0, 256, 32);
  for (let i = -32; i < 256 + 32; i += 7) { x.strokeStyle = 'rgba(40,34,28,.24)'; x.lineWidth = 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 20, 32); x.stroke(); }
  for (let i = 0; i < 140; i++) { x.fillStyle = `rgba(30,24,20,${Math.random() * 0.1})`; x.fillRect(Math.random() * 256, Math.random() * 32, 3 + Math.random() * 26, 1 + Math.random() * 5); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}

const SIDES = { px: { n: [1, 0], t: [0, 1] }, nx: { n: [-1, 0], t: [0, 1] }, pz: { n: [0, 1], t: [1, 0] }, nz: { n: [0, -1], t: [1, 0] } };

/* One rope side as one mesh: three taped ropes with sag and two tie straps. The mesh has its own material, so a side can fade and wobble alone. */
function buildRopeSide(key, mat) {
  const { n, t } = SIDES[key]; const L = RING.ropeAt; const y0 = RING.canvasY; const parts = [];
  const P = (along, h, out = 0) => new THREE.Vector3(n[0] * (L + out) + t[0] * along, y0 + h, n[1] * (L + out) + t[1] * along);
  RING.ropeH.forEach((h, i) => {
    const sag = [0.028, 0.036, 0.045][i]; const pts = [];
    for (let k = 0; k <= 16; k++) { const u = k / 16; const a = -RING.postAt + u * RING.postAt * 2; const p = P(a, h - sag * 4 * u * (1 - u), 0.012 * Math.sin(u * Math.PI)); pts.push(p); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, RING.ropeR, 8, false);
    const uv = g.attributes.uv; for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * 24, uv.getY(v)); parts.push(g);
  });
  for (const a of [-RING.postAt / 3, RING.postAt / 3]) {
    const top = P(a, RING.ropeH[2] - 0.03); const bot = P(a, RING.ropeH[0] - 0.02); const g = new THREE.BoxGeometry(t[0] ? 0.03 : 0.01, top.y - bot.y, t[1] ? 0.03 : 0.01); g.translate(top.x, (top.y + bot.y) / 2, top.z);
    const uv = g.attributes.uv; for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * 0.1, uv.getY(v) * 0.1); parts.push(g);
  }
  const u = { uWob: { value: 0 }, uWobAt: { value: 0 }, uN: { value: new THREE.Vector3(n[0], 0, n[1]) }, uT: { value: new THREE.Vector3(t[0], 0, t[1]) }, uHalf: { value: RING.postAt } };
  const m = mat.clone(); m.transparent = false; m.userData.u = u; m.name = 'rope-' + key;
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u); applyBake(s, { spec: true });
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWob,uWobAt,uHalf;uniform vec3 uN,uT;').replace('#include <begin_vertex>', `#include <begin_vertex>
 {float a=dot(position,uT)/uHalf;float env=max(0.,1.-a*a);env*=exp(-(a-uWobAt)*(a-uWobAt)*1.6);transformed+=uN*uWob*env;}`);
  };
  m.customProgramCacheKey = () => 'rope1';
  const mesh = new THREE.Mesh(mergeGeometries(parts, false), m); mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = 'ropes-' + key;
  mesh.userData.side = key; return mesh;
}

/* The ring: platform, cloth skirt, canvas, padded edge, posts, coloured pads, steps, and ropes as four separate sides. */
export function buildRing({ leather, linenN, wood, steel, aniso = 4 }) {
  const g = new THREE.Group(); g.name = 'ring'; const H = RING.platformHalf; const Y = RING.canvasY; const meshes = {};
  /* canvas */
  const { map, rough } = paintCanvas(1024); map.anisotropy = aniso;
    const canvasMat = grime(new THREE.MeshStandardMaterial({ map, roughnessMap: rough, roughness: 1 }), { kind: 'plain', macro: 0.12, bake: 'vertex' }); canvasMat.name = 'canvas';
  const cg = new THREE.PlaneGeometry(H * 2, H * 2, 24, 24); cg.rotateX(-Math.PI / 2); cg.translate(0, Y, 0);
  const canvas = new THREE.Mesh(cg, canvasMat); canvas.receiveShadow = true; canvas.name = 'canvas'; g.add(canvas); meshes.canvas = canvas;
  /* padded edge rolled over the platform lip, and a dark cloth skirt with real folds */
  const lip = []; const skirt = []; const R = 0.055;
  for (const [nx, nz, rot] of [[1, 0, 0], [-1, 0, 0], [0, 1, 1], [0, -1, 1]]) {
    const c = new THREE.CapsuleGeometry(R, H * 2, 3, 8); c.rotateX(Math.PI / 2); if (rot) c.rotateY(Math.PI / 2); c.scale(nx ? 0.7 : 1, 1, nz ? 0.7 : 1); c.translate(nx * (H - R * 0.2), Y - R * 0.55, nz * (H - R * 0.2)); lip.push(c);
    const W = H * 2 + 0.03; const sk = new THREE.PlaneGeometry(W, Y - R, 120, 3); const p = sk.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i); const v = p.getY(i); const down = 0.5 - v / (Y - R); // 0 at top, 1 at bottom
      const fold = (Math.sin(u * 7.3) * 0.5 + Math.sin(u * 3.1 + 1.3) * 0.35 + Math.sin(u * 13.7 + 0.6) * 0.15) * (0.012 + 0.045 * down);
      p.setZ(i, fold + 0.02 * down);
    }
    sk.computeVertexNormals();
    sk.rotateY(nx ? nx * Math.PI / 2 : (nz > 0 ? 0 : Math.PI)); sk.translate(nx * (H + 0.012), (Y - R) / 2, nz * (H + 0.012)); metreUV(sk); skirt.push(sk);
  }
  const lipG = mergeGeometries(lip.map((x) => { x.deleteAttribute('uv'); x.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(x.attributes.position.count * 2), 2)); return metreUV(x); }), false);
  const lipMat = new THREE.MeshStandardMaterial({ color: 0x241414, roughness: 0.62, normalMap: leather.normalMap, normalScale: new THREE.Vector2(0.5, 0.5) });
  const lipM = new THREE.Mesh(lipG, lipMat); lipM.castShadow = false; lipM.receiveShadow = true; g.add(lipM);
  const fN = linenN.clone(); fN.repeat.set(3, 3); fN.needsUpdate = true;
  const skirtMat = grime(new THREE.MeshStandardMaterial({ color: 0x3d2622, roughness: 0.95, normalMap: fN, normalScale: new THREE.Vector2(0.8, 0.8), side: THREE.DoubleSide }), { kind: 'plain', macro: 0.4, bake: 'vertex' });
  const skirtM = new THREE.Mesh(mergeGeometries(skirt, false), skirtMat); skirtM.receiveShadow = true; skirtM.castShadow = false; g.add(skirtM);
  /* a solid core so nothing shows through the cloth, and for the shadow */
  const core = new THREE.Mesh(box(H * 2 - 0.02, Y - 0.01, H * 2 - 0.02, 0, (Y - 0.01) / 2, 0), new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 1 })); core.castShadow = true; core.name = 'ring-core'; g.add(core);
  /* posts and pads */
  const posts = []; const pads = []; const P = RING.postAt;
  const cols = [['blue', -1, -1, 0x173a9a], ['red', 1, 1, 0x9c1a14], ['neutralA', -1, 1, 0xb5ae9f], ['neutralB', 1, -1, 0xb5ae9f]]; const corners = {};
  for (const [name, sx, sz, col] of cols) {
    const c = new THREE.CylinderGeometry(0.055, 0.06, Y + RING.postTop, 12); c.translate(sx * P, (Y + RING.postTop) / 2, sz * P); posts.push(c);
    const cap = new THREE.CylinderGeometry(0.066, 0.066, 0.05, 12); cap.translate(sx * P, Y + RING.postTop, sz * P); posts.push(cap);
    const base = new THREE.BoxGeometry(0.24, 0.02, 0.24); base.translate(sx * P, Y + 0.01, sz * P); posts.push(base);
    const pad = new RoundedBoxGeometry(0.28, RING.postTop - 0.1, 0.28, 4, 0.05); pad.translate(sx * (P - 0.06), Y + (RING.postTop - 0.1) / 2 + 0.1, sz * (P - 0.06)); metreUV(pad); colored(pad, col); pads.push(pad);
    corners[name] = new THREE.Vector3(sx * (RING.ringHalf - 0.4), Y, sz * (RING.ringHalf - 0.4));
  }
  const postM = new THREE.Mesh(mergeGeometries(posts.map((x) => metreUV(x)), false), steel); postM.castShadow = true; postM.receiveShadow = true; postM.name = 'posts'; g.add(postM);
  const padMat = leather.clone(); padMat.vertexColors = true; padMat.color.set(0xffffff); padMat.name = 'pad';
  for (const k of ['map', 'normalMap', 'roughnessMap']) if (padMat[k]) { padMat[k] = padMat[k].clone(); padMat[k].repeat.set(1.8, 1.8); padMat[k].needsUpdate = true; }
  const padM = new THREE.Mesh(mergeGeometries(pads, false), padMat); padM.castShadow = true; padM.receiveShadow = true; padM.name = 'pads'; g.add(padM);
  /* steps at the blue and red corners */
  const steps = [];
  const addSteps = (sx, sz) => {
    for (let i = 0; i < 3; i++) {
      const h = Y * (i + 1) / 3.2; const zz = sz * (H + 0.74 - i * 0.28);
      steps.push(box(0.9, 0.05, 0.3, sx * (H - 0.75), h, zz));       // tread
      steps.push(box(0.86, h - 0.02, 0.04, sx * (H - 0.75), (h - 0.02) / 2, zz + sz * 0.13)); // riser
    }
    for (const a of [-0.42, 0.42]) { const yy = Y * 0.47; const s = box(0.05, Y * 0.94, 0.86, sx * (H - 0.75) + a, yy, sz * (H + 0.46)); steps.push(s); }
  };
  addSteps(-1, -1); addSteps(1, 1);
  const stepM = new THREE.Mesh(mergeGeometries(steps.map((x) => metreUV(x)), false), wood); stepM.castShadow = true; stepM.receiveShadow = true; stepM.name = 'steps'; g.add(stepM);
  /* ropes */
  const ropeMat = new THREE.MeshStandardMaterial({ map: paintRopeTape(), roughness: 0.72, metalness: 0 });
  const ropes = {}; const group = new THREE.Group(); group.name = 'ropes'; g.add(group);
  for (const key of Object.keys(SIDES)) { const m = buildRopeSide(key, ropeMat); ropes[key] = m; group.add(m); }
  return { group: g, ropes, corners, canvas, canvasMat, props: [postM, padM, stepM, lipM], bake: { canvas: cg, skirt: skirtM.geometry }, boxes: [aabb(0, Y / 2, 0, H * 2, Y, H * 2)] };
}

/* The room shell. Walls in breeze block, floor in wet concrete, concrete columns and beams, a steel beam across the middle for the lamp.
   Surfaces are cut into small cells so baked light has vertices to live on. */
export function buildRoom({ wall, floor, concrete, steel }) {
  const g = new THREE.Group(); g.name = 'room'; const H = ROOM.half; const T = ROOM.height; const CELL = 0.2; const boxes = [];
  const fg = new THREE.PlaneGeometry(H * 2, H * 2, H * 2 / CELL, H * 2 / CELL); fg.rotateX(-Math.PI / 2); metreUV(fg); const fm = new THREE.Mesh(fg, floor); fm.receiveShadow = true; fm.name = 'floor'; g.add(fm);
  const walls = [];
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const w = new THREE.PlaneGeometry(H * 2, T, H * 2 / CELL, Math.round(T / CELL)); w.rotateY(nx ? -nx * Math.PI / 2 : (nz > 0 ? Math.PI : 0)); w.translate(nx * H, T / 2, nz * H); walls.push(metreUV(w)); }
  const wg = mergeGeometries(walls, false); const wm = new THREE.Mesh(wg, wall); wm.receiveShadow = true; wm.name = 'walls'; g.add(wm);
  const conc = [];
  const ceil = new THREE.PlaneGeometry(H * 2, H * 2, 54, 54); ceil.rotateX(Math.PI / 2); ceil.translate(0, T, 0); conc.push(metreUV(ceil));
  const C = 0.6; const B = (w, h, d, x, y, z) => { conc.push(metreUV(sbox(w, h, d, x, y, z, 0.3))); boxes.push(aabb(x, y, z, w, h, d)); };
  for (const a of [-4.5, 4.5]) for (const s of [-1, 1]) { B(C, T, 0.5, a, T / 2, s * (H - 0.25)); B(0.5, T, C, s * (H - 0.25), T / 2, a); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { B(C, T, C, sx * 6.3, T / 2, sz * 6.3); conc.push(metreUV(sbox(C + 0.06, 0.1, C + 0.06, sx * 6.3, 0.05, sz * 6.3, 0.3))); }
  for (const a of [-6.3, 6.3]) { B(H * 2, 0.5, 0.42, 0, T - 0.25, a); B(0.42, 0.5, H * 2, a, T - 0.25, 0); }
  for (const a of [-4.5, 4.5]) B(0.3, 0.32, H * 2, a, T - 0.16, 0);
  const cg = mergeGeometries(conc, false); const cm = new THREE.Mesh(cg, concrete); cm.receiveShadow = true; cm.name = 'structure'; g.add(cm);
  /* steel I-beam over the ring */
  const st = [];
  for (const [w, h, y] of [[0.2, 0.018, T - 0.44], [0.2, 0.018, T - 0.12], [0.022, 0.32, T - 0.28]]) st.push(metreUV(box(w, h, H * 2, 0, y, 0)));
  const sm = new THREE.Mesh(mergeGeometries(st, false), steel); sm.receiveShadow = true; sm.name = 'lamp-beam'; g.add(sm);
  return { group: g, lampAnchorY: T - 0.44, boxes, beam: sm, bake: { floor: fg, walls: wg, structure: cg } };
}

/* Benches, modules along each side of the ring. Returns placements for the people. */
export function buildBenches(wood, steel, rows = [4.85, 5.75, 6.65]) {
  const planks = [box(2.3, 0.045, 0.3, 0, 0.45, 0), box(2.3, 0.03, 0.12, 0, 0.415, 0)]; metreUV(planks[0]); metreUV(planks[1]);
  const legs = []; for (const a of [-0.95, 0.95]) { legs.push(metreUV(box(0.05, 0.42, 0.26, a, 0.21, 0))); }
  const plank = mergeGeometries(planks, false); const leg = mergeGeometries(legs, false); const list = []; const seats = []; const boxes = [];
  for (const d of rows) for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const span = d - 0.9; const n = Math.max(1, Math.floor((span * 2) / 2.45)); const len = n * 2.45;
    boxes.push(nx ? aabb(nx * d, 0.26, 0, 0.3, 0.5, len) : aabb(0, 0.26, nz * d, len, 0.5, 0.3));
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 2.45; const x = nx * d + nz * a; const z = nz * d + nx * a; const yaw = nx ? Math.PI / 2 : 0;
      list.push(trs(x, 0, z, 0, yaw, 0));
      for (let k = -1.5; k <= 1.5; k++) { const sa = a + k * 0.58; seats.push({ x: nx * d + nz * sa, z: nz * d + nx * sa, row: d }); }
    }
  }
  const pm = new THREE.InstancedMesh(plank, wood, list.length); const lm = new THREE.InstancedMesh(leg, steel, list.length);
  list.forEach((m, i) => { pm.setMatrixAt(i, m); lm.setMatrixAt(i, m); }); pm.castShadow = true; pm.receiveShadow = true; lm.receiveShadow = true; pm.computeBoundingSphere(); lm.computeBoundingSphere(); pm.name = 'bench-planks'; lm.name = 'bench-legs';
  const g = new THREE.Group(); g.name = 'benches'; g.add(pm, lm); return { group: g, seats, boxes, planks: pm, legs: lm };
}


/* ---- Crowd people ----
   The Rocketbox athlete, posed by aiming bones, skinned once on the CPU, then reduced by vertex clustering to a static mesh that instances well.
   Done at load rather than offline: it takes a few tens of milliseconds and needs no extra asset. aPart says what each vertex is
   (see partOf). Local +Z faces the ring, feet on y 0, origin under the pelvis. */
const _qa = new THREE.Quaternion(); const _qb = new THREE.Quaternion(); const _va = new THREE.Vector3(); const _vb = new THREE.Vector3();
function aimAt(bone, child, dir) {
  bone.updateWorldMatrix(true, false); child.updateWorldMatrix(false, false);
  _va.setFromMatrixPosition(child.matrixWorld); _vb.setFromMatrixPosition(bone.matrixWorld); const cur = _va.sub(_vb).normalize();
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize(); const rot = new THREE.Quaternion().setFromUnitVectors(cur, d);
  bone.getWorldQuaternion(_qa); bone.parent.getWorldQuaternion(_qb); bone.quaternion.copy(_qb.clone().invert().multiply(rot).multiply(_qa)); bone.updateWorldMatrix(false, true);
}
const HEAD_CELL = 0.038; /* heads keep enough vertices for the face shade on every preset */
const POSES = {
  seated: { spine: [0, 1, 0.1], spine2: [0, 1, 0.06], head: [0, 1, 0.16], thighL: [0.16, -0.08, 1], thighR: [-0.16, -0.08, 1], calfL: [0.02, -1, 0.06], calfR: [-0.02, -1, 0.06], armL: [0.2, -0.95, 0.2], armR: [-0.2, -0.95, 0.2], foreL: [-0.2, -0.4, 0.9], foreR: [0.2, -0.4, 0.9] },
  lean: { spine: [0, 0.82, 0.55], spine2: [0, 0.9, 0.4], head: [0, 0.97, 0.22], thighL: [0.22, -0.05, 1], thighR: [-0.22, -0.05, 1], calfL: [0.03, -1, -0.05], calfR: [-0.03, -1, -0.05], armL: [0.22, -0.8, 0.55], armR: [-0.22, -0.8, 0.55], foreL: [-0.45, 0.5, 0.74], foreR: [0.45, 0.5, 0.74] },
  stand: { spine: [0, 1, 0], spine2: [0, 1, 0.03], head: [0, 1, 0.1], thighL: [0.09, -1, 0.02], thighR: [-0.09, -1, -0.02], calfL: [0.03, -1, -0.04], calfR: [-0.03, -1, -0.04], armL: [0.2, -1, 0.04], armR: [-0.2, -1, 0.04], foreL: [0.05, -0.9, 0.42], foreR: [-0.05, -0.9, 0.42] },
  crossed: { spine: [0, 1, -0.04], spine2: [0, 1, 0], head: [0, 1, 0.08], thighL: [0.12, -1, 0], thighR: [-0.1, -1, 0.03], calfL: [0.02, -1, -0.02], calfR: [-0.02, -1, -0.03], armL: [0.2, -1, 0.1], armR: [-0.2, -1, 0.1], foreL: [-0.92, 0.1, 0.4], foreR: [0.92, 0.2, 0.33] },
  cheer: { spine: [0.04, 1, 0.04], spine2: [0.03, 1, 0.05], head: [0, 1, 0.2], thighL: [0.12, -1, 0.04], thighR: [-0.09, -1, -0.04], calfL: [0.02, -1, -0.04], calfR: [-0.03, -1, -0.05], armL: [0.22, -1, 0.06], armR: [-0.42, 0.74, 0.24], foreL: [0.06, -0.85, 0.5], foreR: [-0.14, 1, 0.12] },
};
function applyPose(b, P) {
  const A = (n, c, d) => { if (b[n] && b[c]) aimAt(b[n], b[c], d); };
  A('Bip01_Spine', 'Bip01_Spine1', P.spine); A('Bip01_Spine1', 'Bip01_Spine2', P.spine2); A('Bip01_Spine2', 'Bip01_Neck', P.spine2); A('Bip01_Neck', 'Bip01_Head', P.head);
  for (const [s, t, c, u, f] of [['L', P.thighL, P.calfL, P.armL, P.foreL], ['R', P.thighR, P.calfR, P.armR, P.foreR]]) {
    A(`Bip01_${s}_Thigh`, `Bip01_${s}_Calf`, t); A(`Bip01_${s}_Calf`, `Bip01_${s}_Foot`, c); A(`Bip01_${s}_Foot`, `Bip01_${s}_Toe0`, [0, -0.25, 1]);
    A(`Bip01_${s}_UpperArm`, `Bip01_${s}_Forearm`, u); A(`Bip01_${s}_Forearm`, `Bip01_${s}_Hand`, f);
  }
}
/* Two channels so an interpolated edge never passes through a third part: cloth 0 shirt, 1/3 pants, 2/3 shoes, 1 hair; skin 0 or 1. */
function partOf(name, k, localY, localZ) {
  if (k.includes('boots')) return [0.667, 0]; if (k.includes('trunks')) return [0.333, 0];
  if (/Head|Eye/.test(name)) { const hair = localY > 0.135 || (localZ < -0.05 && localY > 0.03); return hair ? [1, 0] : [1, 1]; }
  if (/Neck/.test(name)) return [0, 1];
  if (/Hand|Finger/.test(name)) return [0, 1]; if (/Foot|Toe/.test(name)) return [0.667, 0]; if (/Thigh|Calf|Pelvis/.test(name)) return [0.333, 0]; return [0, 0];
}
/* Returns { seated, lean, stand, crossed, cheer } as indexed BufferGeometries with position, normal, aPart. */
export async function loadCrowdGeometry(cell = 0.07) {
  const gltf = await new GLTFLoader(mgr).loadAsync(PERSON); const out = {};
  for (const [poseName, P] of Object.entries(POSES)) {
    const root = cloneSkinned(gltf.scene); root.updateMatrixWorld(true); const bones = {}; const meshes = [];
    root.traverse((n) => { if (n.isBone) bones[n.name] = n; if (n.isSkinnedMesh) meshes.push(n); });
    applyPose(bones, P); root.updateMatrixWorld(true);
    const headM = bones.Bip01_Head.matrixWorld; const headInv = headM.clone().invert(); const pelvis = new THREE.Vector3().setFromMatrixPosition(bones.Bip01_Pelvis.matrixWorld);
    /* the face, as a shade per vertex: eye sockets, brow, under the nose and the mouth. A flat oval reads as a mannequin as soon as nothing blurs it, on any preset. */
    const eyeL = new THREE.Vector3().setFromMatrixPosition(bones.Bip01_LEye.matrixWorld), eyeR = new THREE.Vector3().setFromMatrixPosition(bones.Bip01_REye.matrixWorld), eyeC = eyeL.clone().add(eyeR).multiplyScalar(0.5);
    const headP = new THREE.Vector3().setFromMatrixPosition(headM); const faceUp = new THREE.Vector3(); faceUp.setFromMatrixColumn(headM, 0).normalize(); /* a Biped head bone runs along its own +X, up through the skull */
    const faceFwd = eyeC.clone().sub(headP); faceFwd.addScaledVector(faceUp, -faceFwd.dot(faceUp)).normalize();
    const gauss = (p, c, r) => Math.exp(-p.distanceToSquared(c) / (r * r));
    const mouthP = eyeC.clone().addScaledVector(faceUp, -0.078).addScaledVector(faceFwd, -0.004), noseUnder = eyeC.clone().addScaledVector(faceUp, -0.05).addScaledVector(faceFwd, 0.012), browL = eyeL.clone().addScaledVector(faceUp, 0.016), browR = eyeR.clone().addScaledVector(faceUp, 0.016);
    const faceShade = (p) => 1 - Math.min(0.8, 0.9 * (gauss(p, eyeL, 0.026) + gauss(p, eyeR, 0.026)) + 0.5 * (gauss(p, browL, 0.024) + gauss(p, browR, 0.024)) + 0.42 * gauss(p, noseUnder, 0.018) + 0.62 * gauss(p, mouthP, 0.024));
    const cells = new Map(); const pos = []; const part = []; const cnt = []; const tris = new Set(); const idx = []; const v = new THREE.Vector3(); const hv = new THREE.Vector3(); let minY = Infinity;
    for (const m of meshes) {
      const k = (m.material.name || m.name).toLowerCase(); const G = m.geometry; const index = G.index; const n = G.attributes.position.count; const si = G.attributes.skinIndex; const sw = G.attributes.skinWeight; const map = new Int32Array(n); const names = m.skeleton.bones.map((x) => x.name);
      for (let i = 0; i < n; i++) {
        m.getVertexPosition(i, v); v.applyMatrix4(m.matrixWorld);
        let best = 0; let bw = -1; for (let j = 0; j < 4; j++) { const w = sw.getComponent(i, j); if (w > bw) { bw = w; best = si.getComponent(i, j); } }
        const name = names[best]; hv.copy(v).applyMatrix4(headInv); const isHead = /Head|Eye/.test(name); const headSpace = new THREE.Vector3().copy(v).sub(_va.setFromMatrixPosition(headM));
        const pt = partOf(name, k, headSpace.y, headSpace.z); const c = isHead ? HEAD_CELL : cell;
        const key = `${isHead ? 'h' : 'b'}${Math.round(v.x / c)},${Math.round(v.y / c)},${Math.round(v.z / c)}`;
        let id = cells.get(key); if (id === undefined) { id = cnt.length; cells.set(key, id); pos.push(0, 0, 0); part.push(0, 0, 0); cnt.push(0); }
        pos[id * 3] += v.x; pos[id * 3 + 1] += v.y; pos[id * 3 + 2] += v.z; part[id * 3] += pt[0]; part[id * 3 + 1] += pt[1]; part[id * 3 + 2] += isHead ? faceShade(v) : 1; cnt[id]++; map[i] = id;
      }
      const tc = index ? index.count : n;
      for (let t = 0; t < tc; t += 3) {
        const a = map[index ? index.getX(t) : t]; const b = map[index ? index.getX(t + 1) : t + 1]; const c = map[index ? index.getX(t + 2) : t + 2]; if (a === b || b === c || a === c) continue;
        const so = [a, b, c].sort((x, y) => x - y).join(); if (tris.has(so)) continue; tris.add(so); idx.push(a, b, c);
      }
    }
    for (let i = 0; i < cnt.length; i++) { pos[i * 3] /= cnt[i]; pos[i * 3 + 1] /= cnt[i]; pos[i * 3 + 2] /= cnt[i]; part[i * 3] /= cnt[i]; part[i * 3 + 1] /= cnt[i]; part[i * 3 + 2] /= cnt[i]; if (pos[i * 3 + 1] < minY) minY = pos[i * 3 + 1]; }
    for (let i = 0; i < cnt.length; i++) { pos[i * 3] -= pelvis.x; pos[i * 3 + 1] -= minY; pos[i * 3 + 2] -= pelvis.z; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(part), 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere(); out[poseName] = g;
  }
  return out;
}

/* Fight posters and a cloth banner, painted into one small atlas: type and flat colour, aged, no photographs. Returns a texture and UV rects. */
export function paintPosters() {
  const S = 1024; const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const age = (l, t, w, h) => { for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '20,16,10' : '190,175,150'},${rnd() * 0.07})`; x.fillRect(l + rnd() * w, t + rnd() * h, 2 + rnd() * w * 0.35, 1 + rnd() * h * 0.08); } const g = x.createRadialGradient(l + w / 2, t + h / 2, h * 0.2, l + w / 2, t + h / 2, h * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,2,.45)'); x.fillStyle = g; x.fillRect(l, t, w, h); };
  const POST = [['#b8ad93', '#7a1a14', 'FRIDAY', 'FIGHT', 'NIGHT'], ['#23303d', '#d8cfb8', 'TEN', 'ROUNDS', 'LIVE'], ['#8a2a1c', '#e6d8bc', 'MAIN', 'EVENT', 'DOORS 8'], ['#d6cdb4', '#1d2a38', 'BASEMENT', 'BOXING', 'CLUB']]; const rects = [];
  POST.forEach((p, i) => {
    const w = 256; const h = 360; const l = i * 256; x.fillStyle = p[0]; x.fillRect(l, 0, w, h); x.fillStyle = p[1]; x.fillRect(l + 14, 14, w - 28, 8); x.fillRect(l + 14, h - 22, w - 28, 8); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 40px "Arial Narrow", Impact, sans-serif'; x.fillText(p[2], l + w / 2, 62); x.font = '700 76px "Arial Narrow", Impact, sans-serif'; x.fillText(p[3], l + w / 2, 150); x.font = '700 46px "Arial Narrow", Impact, sans-serif'; x.fillText(p[4], l + w / 2, 240); x.font = '700 22px "Arial Narrow", Impact, sans-serif'; x.fillText('RINGSIDE  BENCHES  STANDING', l + w / 2, 306, w - 30);
    age(l, 0, w, h); rects.push([l / S, 1 - h / S, w / S, h / S]);
  });
  /* banner */
  const bt = 400; const bh = 200; x.fillStyle = '#5d1712'; x.fillRect(0, bt, S, bh); x.fillStyle = '#d7c9a8'; x.fillRect(0, bt + 12, S, 6); x.fillRect(0, bt + bh - 18, S, 6); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 92px "Arial Narrow", Impact, sans-serif'; x.fillText('INSIDE THE IMPACT', S / 2, bt + bh / 2 + 4); age(0, bt, S, bh); rects.push([0, 1 - (bt + bh) / S, 1, bh / S]);
  /* exit sign */
  const et = 620; x.fillStyle = '#0f2a18'; x.fillRect(0, et, 256, 90); x.fillStyle = '#6dff9a'; x.font = '700 70px "Arial Narrow", Impact, sans-serif'; x.fillText('EXIT', 128, et + 48); rects.push([0, 1 - (et + 90) / S, 256 / S, 90 / S]);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { map: t, rects };
}
/* A flat quad on a wall, UVs from an atlas rect. Slightly cut so baked light has vertices. nx,nz is the wall's inward normal. */
export function wallQuad(rect, w, h, x, y, z, nx, nz, seg = 2) {
  const g = new THREE.PlaneGeometry(w, h, seg, seg); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, rect[0] + uv.getX(i) * rect[2], rect[1] + uv.getY(i) * rect[3]);
  g.rotateY(Math.atan2(nx, nz)); g.translate(x, y, z); return g;
}

/* A cheap bare-bulb pendant under a small enamel shade, for the bulbs that do not get a caged fixture. Local origin at the ceiling. */
export function pendantGeometry(drop = 0.95) {
  const parts = []; const cord = new THREE.CylinderGeometry(0.005, 0.005, drop - 0.1, 4); cord.translate(0, -(drop - 0.1) / 2, 0); parts.push(cord);
  const shade = new THREE.CylinderGeometry(0.03, 0.15, 0.1, 12, 1, true); shade.translate(0, -drop + 0.03, 0); parts.push(shade);
  const bulb = new THREE.SphereGeometry(0.035, 8, 6); bulb.translate(0, -drop - 0.015, 0);
  return { shade: mergeGeometries(parts, false), bulb };
}

/* The lamp over the ring: model, swinging pivot, shadowed warm spot. Pendulum in two axes, kick(power) adds swing from big hits. */
export function hangingLamp(model, { anchorY, target = [0, 0.75, 0], color = 0xffd0ac, intensity = 60, angle = 1.2, penumbra = 0.5, decay = 1.6, shadow = 2048, scale = 0.85, calm = false }) {
  const pivot = new THREE.Group(); pivot.position.set(0, anchorY, 0); pivot.name = 'lamp-pivot';
  const lampScene = model.scene.clone(true); lampScene.scale.setScalar(scale); pivot.add(lampScene); let shade = null;
  lampScene.traverse((n) => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; n.material = n.material.clone(); n.material.emissiveIntensity = 12; n.material.emissive.set(0xffc080); shade = n; } });
  const bulbLocal = new THREE.Vector3(0, -1.2 * scale, 0);
  const light = new THREE.SpotLight(color, intensity, 16, angle, penumbra, decay);
  light.castShadow = true; light.shadow.mapSize.set(shadow, shadow); light.shadow.camera.near = 0.35; light.shadow.camera.far = 14; light.shadow.bias = -0.0014; light.shadow.normalBias = 0.05; light.shadow.radius = 2.6;
  light.position.copy(bulbLocal); pivot.add(light);
  const tgt = new THREE.Object3D(); tgt.position.set(target[0], target[1], target[2]); light.target = tgt;
  const group = new THREE.Group(); group.name = 'key-lamp'; group.add(pivot, tgt);
  const drive = calm ? 0.25 : 1; const st = { t: 0, vx: 0, vz: 0, x: 0.03 * drive, z: 0 };
  const L = anchorY - target[1]; const w = 1.55;
  const api = {
    group, pivot, light, shade, bulbWorld: new THREE.Vector3(), axisWorld: new THREE.Vector3(0, -1, 0),
    kick(power = 1) { const a = Math.random() * 6.283; st.vx += Math.cos(a) * 0.02 * power * drive; st.vz += Math.sin(a) * 0.02 * power * drive; },
    update(dt) {
      // damped pendulum, with a small drive so it never quite stops
      st.t += dt; const damp = Math.exp(-dt * 0.12);
      st.vx += (-w * w * st.x + 0.0056 * drive * Math.cos(st.t * w)) * dt; st.vz += (-w * w * st.z + 0.0024 * drive * Math.sin(st.t * w * 1.03)) * dt; st.vx *= damp; st.vz *= damp; st.x += st.vx * dt; st.z += st.vz * dt;
      pivot.rotation.set(st.z, 0, st.x);
      pivot.updateMatrixWorld(true); light.getWorldPosition(api.bulbWorld);
      // the aim follows the swing, amplified by the lever from pivot to canvas
      tgt.position.set(target[0] + Math.sin(st.x) * L * 0.65, target[1], target[2] - Math.sin(st.z) * L * 0.65); tgt.updateMatrixWorld(true);
      api.axisWorld.copy(tgt.position).sub(api.bulbWorld).normalize();
    },
  };
  return api;
}

const FADE_FRAG = '#include <tonemapping_fragment>\n#include <colorspace_fragment>';

/* A visible shaft of light. Marches the view ray through the cone inside the proxy's back faces. Fighters stay clean because the
   back of the cone is behind them and fails the depth test. */
export function hazeCone({ angle = 0.75, length = 2.8, color = 0xffc090, density = 0.5, steps = 8 }) {
  const radius = Math.tan(angle) * length;
  const geo = new THREE.ConeGeometry(radius, length, 40, 1, false); geo.translate(0, -length / 2, 0);
  const u = {
    uApex: { value: new THREE.Vector3() }, uAxis: { value: new THREE.Vector3(0, -1, 0) }, uCos: { value: Math.cos(angle) }, uColor: { value: new THREE.Color(color) }, uDensity: { value: density }, uTime: { value: 0 }, uBaseY: { value: 0.75 }, uSteps: { value: steps }, uNoise: { value: noiseTexture() },
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: `varying vec3 vW;uniform vec3 uApex,uAxis,uColor;uniform float uCos,uDensity,uTime,uBaseY;uniform int uSteps;uniform sampler2D uNoise;
float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){vec3 ro=cameraPosition;vec3 rd=vW-ro;float tEnd=length(rd);rd/=tEnd;vec3 co=ro-uApex;float dv=dot(rd,uAxis),cv=dot(co,uAxis),c2=uCos*uCos;
 float A=dv*dv-c2,B=2.*(dv*cv-dot(rd,co)*c2),C=cv*cv-dot(co,co)*c2;float t0=0.;
 bool inside=cv>0.&&C>0.;
 if(!inside){float D=B*B-4.*A*C;if(D<0.)discard;D=sqrt(D);float r1=(-B-D)/(2.*A),r2=(-B+D)/(2.*A);if(r1>r2){float s=r1;r1=r2;r2=s;}
  bool ok1=r1>0.&&r1<tEnd&&(cv+dv*r1)>0.,ok2=r2>0.&&r2<tEnd&&(cv+dv*r2)>0.;if(ok1)t0=r1;else if(ok2)t0=r2;else t0=max(0.,tEnd-.01);}
 float n=float(uSteps);float dt=(tEnd-t0)/n;float j=ign(gl_FragCoord.xy);float sum=0.;
 for(int i=0;i<uSteps;i++){vec3 p=ro+rd*(t0+dt*(float(i)+j));vec3 v=p-uApex;float d2=dot(v,v);float c=dot(v,uAxis)/sqrt(d2+1e-4);
  float edge=smoothstep(uCos,1.,c);edge*=edge;float fall=1./(d2*.3+.5);float base=smoothstep(uBaseY-.02,uBaseY+1.1,p.y);
  vec4 nn=texture2D(uNoise,p.xz*.11+vec2(p.y*.07,uTime*.006));float smoke=.15+nn.r*1.3*(.35+nn.g*1.3);sum+=edge*fall*base*smoke;}
 vec3 col=uColor*sum*dt*uDensity;gl_FragColor=vec4(col,1.);
 ${FADE_FRAG}
}`,
  });
  const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; mesh.renderOrder = 5; mesh.name = 'haze'; mesh.userData.u = u; return mesh;
}

/* Dust motes. They only show inside the key light's cone, drifting. count sets the draw range, so quality changes need no rebuild. */
export function dust({ count = 400, half = 5.5, top = 3.9, bottom = 0.3, color = 0xffc48a }) {
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pos = new Float32Array(count * 3); const aSeed = new Float32Array(count);
  for (let i = 0; i < count; i++) { const r = Math.sqrt(rnd()) * half; const a = rnd() * 6.283; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = bottom + rnd() * (top - bottom); pos[i * 3 + 2] = Math.sin(a) * r; aSeed[i] = rnd(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  const u = { uTime: { value: 0 }, uApex: { value: new THREE.Vector3(0, 3.5, 0) }, uAxis: { value: new THREE.Vector3(0, -1, 0) }, uCos: { value: Math.cos(1.05) }, uColor: { value: new THREE.Color(color) }, uScale: { value: 720 }, uBright: { value: 5 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aSeed;uniform float uTime,uCos,uScale;uniform vec3 uApex,uAxis;varying float vA;
void main(){float s=aSeed*6.2831;vec3 p=position+vec3(sin(uTime*.11+s*3.)*.5,sin(uTime*.07+s*5.)*.28,cos(uTime*.09+s*2.)*.5);vec3 v=p-uApex;float d2=dot(v,v);float c=dot(v,uAxis)/sqrt(d2+1e-4);
 float lit=smoothstep(uCos,uCos+.3,c)/(1.+d2*.16);vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float dist=max(.2,-mv.z);gl_PointSize=clamp((.011+aSeed*.012)*uScale/dist,1.2,16.);
 vA=lit*(.55+.45*sin(uTime*.6+s*7.))*min(1.,dist*.6);}`,
    fragmentShader: `varying float vA;uniform vec3 uColor;uniform float uBright;void main(){vec2 c=gl_PointCoord-.5;float a=smoothstep(.5,.05,length(c));gl_FragColor=vec4(uColor*a*a*vA*uBright,1.);
 ${FADE_FRAG}
}`,
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; pts.name = 'dust'; pts.userData.u = u; return pts;
}

/* Soft glow around bulbs, one draw call for all of them. HDR, so the film pipeline's bloom picks it up; on low it stands in for bloom. */
export function halos(list) {
  const n = list.length; const pos = new Float32Array(n * 3); const col = new Float32Array(n * 3); const size = new Float32Array(n);
  list.forEach((h, i) => { pos.set(h.p, i * 3); const c = new THREE.Color(h.color); col.set([c.r * h.i, c.g * h.i, c.b * h.i], i * 3); size[i] = h.size; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const u = { uScale: { value: 720 }, uGain: { value: 1 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute vec3 aCol;attribute float aSize;uniform float uScale;varying vec3 vC;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uScale/max(.3,-mv.z),2.,512.);}',
    fragmentShader: `varying vec3 vC;uniform float uGain;void main(){float d=length(gl_PointCoord-.5)*2.;float a=max(0.,1.-d);a=a*a*a*.6+pow(a,10.)*2.;gl_FragColor=vec4(vC*a*uGain,1.);
 ${FADE_FRAG}
}`,
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = 7; p.name = 'halos'; p.userData.u = u; return p;
}
