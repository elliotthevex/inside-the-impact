/* A boxing glove, lofted rather than sculpted: a spine in the hand's own plane, cross sections along it, and a thumb.
   Lofting gives clean UVs, so seams, stitching and the cuff's strap are ordinary texture work.

   Hand bone frame, measured off the Rocketbox rig: +X runs along the fingers, +Y comes out of the palm, and the
   thumb lies along -Z on the left hand and +Z on the right. Metres. */
import * as THREE from 'three';

const SECTIONS = [
  // along-spine x, spine y, half-width rz, half-depth ry, squareness
  [-0.092, -0.008, 0.0395, 0.0345, 2.8],   // cuff mouth
  [-0.078, -0.008, 0.0415, 0.0360, 3.0],
  [-0.045, -0.007, 0.0425, 0.0370, 3.0],   // strap
  [-0.018, -0.005, 0.0440, 0.0385, 2.8],
  [ 0.002, -0.002, 0.0490, 0.0440, 2.5],   // heel of the hand swells out of the cuff
  [ 0.022,  0.002, 0.0565, 0.0515, 2.3],
  [ 0.044,  0.007, 0.0630, 0.0585, 2.2],
  [ 0.066,  0.014, 0.0675, 0.0630, 2.15],  // the knuckle pad
  [ 0.086,  0.022, 0.0690, 0.0645, 2.1],
  [ 0.104,  0.032, 0.0665, 0.0620, 2.1],
  [ 0.119,  0.043, 0.0595, 0.0560, 2.05],
  [ 0.130,  0.054, 0.0470, 0.0450, 2.0],
  [ 0.136,  0.063, 0.0300, 0.0290, 2.0],
  [ 0.1385, 0.068, 0.0040, 0.0040, 2.0],
];
const THUMB = [
  // x, y, z (thumb side positive), radius
  [0.006, 0.024, 0.034, 0.0170],
  [0.026, 0.034, 0.051, 0.0235],
  [0.048, 0.042, 0.062, 0.0265],
  [0.070, 0.048, 0.067, 0.0260],
  [0.088, 0.052, 0.067, 0.0220],
  [0.100, 0.054, 0.064, 0.0150],
  [0.106, 0.055, 0.061, 0.0025],
];

function loft(rings, around, uAtlas) {
  const pos = [], uv = [], idx = [];
  const nr = rings.length, na = around + 1;
  rings.forEach((ring, r) => {
    for (let a = 0; a < na; a++) {
      const p = ring(a / around);
      pos.push(p[0], p[1], p[2]);
      uv.push(uAtlas[0] + (a / around) * uAtlas[1], uAtlas[2] + (r / (nr - 1)) * uAtlas[3]);
    }
  });
  for (let r = 0; r < nr - 1; r++) for (let a = 0; a < around; a++) {
    const i = r * na + a, j = i + 1, k = i + na, l = k + 1;
    idx.push(i, k, j, j, k, l);
  }
  return { pos, uv, idx };
}

/* side: 1 for a thumb on +Z (right hand), -1 for -Z (left hand) */
export function buildGloveGeometry(side) {
  const body = loft(SECTIONS.map((s) => (t) => {
    const a = t * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), e = 2 / s[4];
    const z = Math.sign(c) * Math.pow(Math.abs(c), e) * s[2];
    const y = Math.sign(sn) * Math.pow(Math.abs(sn), e) * s[3];
    /* X tips toward the palm at the knuckles, so the sections fan with the curl */
    const tilt = Math.max(0, s[0] - 0.05) * 7.0;
    return [s[0] - y * Math.sin(tilt), s[1] + y * Math.cos(tilt), z * side];
  }), 40, [0, 1, 0, 0.78]);
  const thumb = loft(THUMB.map((s) => (t) => {
    const a = t * Math.PI * 2;
    return [s[0], s[1] + Math.sin(a) * s[3] * 1.05, (s[2] + Math.cos(a) * s[3]) * side];
  }), 18, [0, 1, 0.80, 0.20]);
  const off = body.pos.length / 3;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(body.pos.concat(thumb.pos), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(body.uv.concat(thumb.uv), 2));
  const idx = body.idx.concat(thumb.idx.map((i) => i + off));
  if (side < 0) for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  g.setIndex(idx);
  g.computeVertexNormals();
  /* close the loft's seam in shading */
  const n = g.attributes.normal, around = 41;
  for (let r = 0; r < SECTIONS.length; r++) {
    const a = r * around, b = a + around - 1;
    const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}
