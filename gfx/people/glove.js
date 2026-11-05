/* A boxing glove, lofted: a curved spine in the hand's own plane, cross sections along it, and a separate thumb.
   The mitt is deeper on the back of the hand than on the palm, narrows hard at the wrist into a cuff, and rolls over the
   knuckles into the curl of the fingers, which is what makes it a glove and not a ball. Lofting gives clean UVs, so
   panels, stitching, the strap and the trim are texture work (tools/gfx/glove_tex.py).

   Hand bone frame, measured off the Rocketbox rig: +X runs along the fingers, +Y comes out of the palm, and the
   thumb lies along -Z on the left hand and +Z on the right. Metres.

   UV: body u goes round from the thumb side (0) through the palm (.25), the far side (.5) and the back of the hand (.75);
   v = .78 * (x + .098) / .249 along the spine. Thumb v is .80..1. */
import * as THREE from 'three';

const X0 = -0.098, XL = 0.249, VB = 0.78;
const SECTIONS = [
  // x, spine y, half-width (z), back of hand depth (-y), palm depth (+y), squareness
  [-0.098, -0.002, 0.0410, 0.0350, 0.0340, 3.0],  // cuff mouth, a little flared
  [-0.090, -0.002, 0.0405, 0.0345, 0.0335, 3.2],
  [-0.070, -0.002, 0.0395, 0.0335, 0.0325, 3.2],  // strap
  [-0.045, -0.002, 0.0388, 0.0328, 0.0318, 3.2],
  [-0.024, -0.002, 0.0388, 0.0328, 0.0318, 3.1],
  [-0.010, -0.002, 0.0405, 0.0350, 0.0325, 2.8],  // wrist, then the heel of the hand swells out of the cuff
  [ 0.006, -0.002, 0.0455, 0.0415, 0.0350, 2.5],
  [ 0.024,  0.000, 0.0515, 0.0490, 0.0385, 2.3],
  [ 0.044,  0.002, 0.0565, 0.0550, 0.0420, 2.2],
  [ 0.066,  0.005, 0.0595, 0.0595, 0.0450, 2.15], // padding over the back of the hand
  [ 0.088,  0.009, 0.0605, 0.0615, 0.0470, 2.1],  // the knuckles
  [ 0.108,  0.015, 0.0590, 0.0595, 0.0480, 2.1],
  [ 0.124,  0.023, 0.0545, 0.0535, 0.0465, 2.1],
  [ 0.137,  0.033, 0.0460, 0.0435, 0.0400, 2.05],
  [ 0.146,  0.043, 0.0330, 0.0300, 0.0280, 2.0],
  [ 0.150,  0.050, 0.0130, 0.0115, 0.0105, 2.0],
  [ 0.151,  0.053, 0.0008, 0.0008, 0.0008, 2.0],
];
const THUMB = [
  // x, y, z (thumb side positive), depth along y, depth along z
  [-0.006, 0.012, 0.028, 0.0110, 0.0110],
  [ 0.010, 0.016, 0.038, 0.0185, 0.0165],
  [ 0.028, 0.020, 0.0465, 0.0235, 0.0205],
  [ 0.048, 0.024, 0.0525, 0.0255, 0.0232],
  [ 0.068, 0.028, 0.0560, 0.0250, 0.0235],
  [ 0.085, 0.032, 0.0565, 0.0218, 0.0212],
  [ 0.098, 0.035, 0.0545, 0.0160, 0.0160],
  [ 0.105, 0.037, 0.0520, 0.0085, 0.0085],
  [ 0.1075, 0.038, 0.0510, 0.0012, 0.0012],
];
const cr = (a, b, c, d, t) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
/* Catmull-Rom through a table, `sub` steps per interval */
function dense(T, sub) {
  const out = []; const n = T.length;
  for (let i = 0; i < n - 1; i++) for (let s = 0; s < sub; s++) { const t = s / sub, r = []; for (let k = 0; k < T[0].length; k++) r.push(cr(T[Math.max(0, i - 1)][k], T[i][k], T[i + 1][k], T[Math.min(n - 1, i + 2)][k], t)); out.push(r); }
  out.push(T[n - 1].slice()); return out;
}
const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

/* side: 1 for a thumb on +Z (right hand), -1 for -Z (left hand) */
export function buildGloveGeometry(side) {
  const pos = [], uv = [], idx = []; const A = 64;
  const rows = dense(SECTIONS, 2); const NR = rows.length;
  rows.forEach((s, r) => {
    const a0 = rows[Math.max(0, r - 1)], a1 = rows[Math.min(NR - 1, r + 1)]; let tx = a1[0] - a0[0], ty = a1[1] - a0[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx, e = 2 / s[5];  /* section's own axis toward the palm */
    for (let a = 0; a <= A; a++) {
      const th = (a / A) * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th), z = spow(c, e) * s[2]; let dn = spow(sn, e) * (sn > 0 ? s[4] : s[3]);
      /* the crease where the curled fingers meet the palm */
      if (sn > 0) { const g = Math.exp(-Math.pow((s[0] - 0.074) / 0.009, 2)) * sn * sn; dn -= 0.0085 * g; }
      pos.push(s[0] + nx * dn, s[1] + ny * dn, z * side); uv.push(a / A, VB * (s[0] - X0) / XL);
    }
  });
  const na = A + 1;
  for (let r = 0; r < NR - 1; r++) for (let a = 0; a < A; a++) { const i = r * na + a, j = i + 1, k = i + na, m = k + 1; idx.push(i, k, j, j, k, m); }
  /* thumb */
  const off = pos.length / 3, tb = dense(THUMB, 2), TA = 24, tn = tb.length, tna = TA + 1;
  tb.forEach((s, r) => {
    const a0 = tb[Math.max(0, r - 1)], a1 = tb[Math.min(tn - 1, r + 1)]; const t = new THREE.Vector3(a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]).normalize();
    const n1 = new THREE.Vector3(0, 1, 0).addScaledVector(t, -t.y).normalize(), n2 = new THREE.Vector3().crossVectors(t, n1).normalize();
    for (let a = 0; a <= TA; a++) { const th = (a / TA) * Math.PI * 2, y = Math.sin(th) * s[3], z = Math.cos(th) * s[4]; pos.push(s[0] + n1.x * y + n2.x * z, s[1] + n1.y * y + n2.y * z, (s[2] + n1.z * y + n2.z * z) * side); uv.push(a / TA, 0.80 + 0.20 * (r / (tn - 1))); }
  });
  for (let r = 0; r < tn - 1; r++) for (let a = 0; a < TA; a++) { const i = off + r * tna + a, j = i + 1, k = i + tna, m = k + 1; idx.push(i, k, j, j, k, m); }
  /* the thumb's winding comes out opposite to the mitt's because of how its frame is built */
  const ntb = (tn - 1) * TA * 6; for (let i = idx.length - ntb; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  if (side < 0) for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  /* close both lofts' seams in shading */
  const n = g.attributes.normal;
  const weld = (a, b) => { const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1; n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l); };
  for (let r = 0; r < NR; r++) weld(r * na, r * na + A);
  for (let r = 0; r < tn; r++) weld(off + r * tna, off + r * tna + TA);
  return g;
}
