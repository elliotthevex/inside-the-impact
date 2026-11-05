/* The clip library: one binary with a JSON index, built by tools/gfx/clips.py from CMU boxing mocap retargeted onto the
   Rocketbox Biped. Each frame holds a local rotation per bone (int16 quaternion) and a pelvis position (int16 mm).

     const lib = await loadClips(url, onProgress);
     const c = lib.get('jab'); c.sample(t, q, root);         // q: Float32Array(4 * bones), root: Float32Array(3)

   Nothing here knows about THREE. Times are seconds. c.contact is when the glove is furthest out, for punches. */
const Q = 1 / 32767, MM = 0.001;

export class Clip {
  constructor(meta, nb, bytes) {
    this.name = meta.name; this.frames = meta.frames; this.fps = meta.fps; this.dur = (meta.frames - 1) / meta.fps;
    this.contact = meta.contact ?? null; this.hand = meta.hand ?? null; this.loop = !!meta.loop; this.meta = meta; this.nb = nb;
    this.q = new Int16Array(bytes, meta.offset, meta.frames * nb * 4);
    this.r = new Int16Array(bytes, meta.offset + meta.frames * nb * 8, meta.frames * 3);
  }
  /* Quaternions are written sign-continuous over time, so a normalised lerp is enough between neighbouring frames. */
  sample(t, out, root) {
    const { frames: F, q, r, nb } = this; let x = t * this.fps, a, b;
    if (this.loop) { const n = F - 1; x = ((x % n) + n) % n; a = Math.floor(x); b = (a + 1) % n; }
    else { x = Math.max(0, Math.min(F - 1, x)); a = Math.min(F - 2, Math.floor(x)); b = a + 1; }
    const f = x - a, g = 1 - f;
    let i = a * nb * 4, j = b * nb * 4;
    for (let k = 0, o = 0; k < nb; k++, o += 4, i += 4, j += 4) {
      const w = q[i] * q[j] + q[i + 1] * q[j + 1] + q[i + 2] * q[j + 2] + q[i + 3] * q[j + 3] < 0 ? -f : f;
      const x_ = q[i] * g + q[j] * w, y_ = q[i + 1] * g + q[j + 1] * w, z_ = q[i + 2] * g + q[j + 2] * w, w_ = q[i + 3] * g + q[j + 3] * w;
      const l = 1 / (Math.hypot(x_, y_, z_, w_) || 1);
      out[o] = x_ * l; out[o + 1] = y_ * l; out[o + 2] = z_ * l; out[o + 3] = w_ * l;
    }
    if (root) { const m = a * 3, n = b * 3; for (let k = 0; k < 3; k++) root[k] = (r[m + k] * g + r[n + k] * f) * MM; }
    return out;
  }
}
export class ClipLib {
  constructor(index, bytes) {
    this.bones = index.bones; this.index = index; this.clips = {}; const nb = index.bones.length; const ix = {};
    index.bones.forEach((b, i) => { ix[b] = i; }); this.ix = ix;
    for (const m of index.clips) this.clips[m.name] = new Clip(m, nb, bytes);
  }
  has(n) { return !!this.clips[n]; }
  get(n) { const c = this.clips[n]; if (!c) throw new Error('no clip ' + n); return c; }
  names() { return Object.keys(this.clips); }
}
/* url points at the JSON index; the binary sits beside it under the name the index gives. */
export async function loadClips(url, onProgress) {
  const j = await (await fetch(url)).json(); if (onProgress) onProgress(0.3);
  const bin = await (await fetch(new URL(j.bin, new URL(url, location.href)).href)).arrayBuffer(); if (onProgress) onProgress(1);
  return new ClipLib(j, bin);
}
