/* The engine: one renderer, one film pipeline, one loop.

     const engine = new Engine(canvas, { quality: 'auto', onQuality(q) {} });
     engine.scene = stage.scene;                    // whatever is being drawn
     engine.start((dt, t) => { ...update... });     // real-time loop, or
     engine.step(120, 1 / 60);                      // test stepping, no requestAnimationFrame

   PRESETS hold the Post fields (film, msaa, ao, aoSamples, dof, bloom, grain, tex, aniso, motion) plus what the world
   needs (shadow size, haze march steps, dust and crowd counts, how many bulbs are real lights) and the fighters' character light (charFill, charRim,
   charSoft, see people/charlight.js; fewer real bulbs on a preset means a little more fill). The loop watches frame
   time and drops a level when frames stay slow. A level change rebuilds Post and calls every quality listener. */
import * as THREE from 'three';
import { Post } from './post.js';

export const PRESETS = {
  low: { name: 'low', film: false, msaa: 0, ao: false, aoSamples: 0, dof: 0, bloom: false, grain: false, tex: 1024, aniso: 2, motion: true, pixelRatio: 1, maxPixels: 1280 * 720, shadow: 1024, hazeSteps: 3, dust: 60, crowd: 44, bulbs: 0, exposureScale: 0.29, charFill: 3.6, charRim: 0.5, charSoft: 30 },
  medium: { name: 'medium', mainFormat: 'r11', film: true, msaa: 2, ao: false, aoSamples: 0, dof: 12, bloom: true, grain: true, tex: 1024, aniso: 4, motion: true, pixelRatio: 1.5, maxPixels: 1600 * 900, shadow: 1536, hazeSteps: 5, dust: 220, crowd: 110, bulbs: 1, exposureScale: 1, charFill: 4.3, charRim: 0.5, charSoft: 22 },
  high: { name: 'high', mainFormat: 'r11', film: true, msaa: 4, ao: true, aoSamples: 8, dof: 16, bloom: true, grain: true, tex: 2048, aniso: 8, motion: true, pixelRatio: 2, maxPixels: 1800000, shadow: 2048, hazeSteps: 6, dust: 420, crowd: 200, bulbs: 2, exposureScale: 1, charFill: 4.3, charRim: 0.5, charSoft: 20 },
};
const ORDER = ['low', 'medium', 'high'];

/* Reads the GPU name and the device class. ST.lowdetail (the game's Low Detail setting) always wins. */
/* The film path renders to R11F_G11F_B10F under MSAA. A GPU that refuses it gives a black canvas and no error, so ask first. */
function filmTargetsWork(gl) {
  if (!gl.getExtension('EXT_color_buffer_float')) return false;
  const fb = gl.createFramebuffer(); const rb = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, Math.min(2, gl.getParameter(gl.MAX_SAMPLES)), gl.R11F_G11F_B10F, 4, 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.deleteRenderbuffer(rb);
  return ok;
}

export function detectQuality(opts = {}) {
  const st = opts.st ?? (typeof ST !== 'undefined' ? ST : null); // eslint-disable-line no-undef
  if (opts.lowDetail || (st && st.lowdetail)) return 'low';
  let gpu = ''; let film = false;
  try {
    const c = document.createElement('canvas'); const gl = c.getContext('webgl2');
    if (!gl) return 'low';
    film = filmTargetsWork(gl);
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
  } catch (e) { return 'low'; }
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const mem = navigator.deviceMemory || 8;
  if (!film) return 'low';
  if (/swiftshader|llvmpipe|software|microsoft basic/i.test(gpu)) return 'low';
  if (coarse || mem < 4) return 'low'; // phones and tablets: Safari reports every iPhone as "Apple GPU", so an old one cannot be told from a new one
  if (/Apple M\d|RTX|GTX|Radeon (RX|Pro)|Arc\b|Apple GPU/i.test(gpu)) return 'high';
  return 'medium';
}

export function hasWebGL2() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch (e) { return false; }
}

export class Engine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas; this.opts = opts;
    const name = PRESETS[opts.quality] ? opts.quality : detectQuality(opts);
    this.q = { ...PRESETS[name] };
    this.adaptive = opts.adaptive !== false && !PRESETS[opts.quality];
    this.reducedMotion = !!opts.reducedMotion; if (this.reducedMotion) this.q.motion = false;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: name === 'low', powerPreference: 'high-performance', stencil: false, alpha: false, depth: true });
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.info.autoReset = false; r.setClearColor(0x000000, 1);
    this.camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 42);
    this.scene = null; this.exposure = opts.exposure ?? 1;
    this.listeners = new Set(); if (opts.onQuality) this.listeners.add(opts.onQuality);
    this.update = null; this.running = false; this.t = 0; this._raf = 0; this._last = 0;
    this.stats = { fps: 0, ms: 0, calls: 0, tris: 0, w: 0, h: 0, quality: name };
    this._win = { sum: 0, n: 0, slow: 0, skip: 90 };
    this.resize(); this.post = new Post(r, this.q); this._syncExposure();
    this._onResize = () => this.resize(); window.addEventListener('resize', this._onResize);
    this._onLost = (e) => { e.preventDefault(); this.stop(); this.contextLost = true; };
    canvas.addEventListener('webglcontextlost', this._onLost);
  }
  get quality() { return this.q.name; }
  _size() {
    const c = this.canvas; const w = c.clientWidth || window.innerWidth; const h = c.clientHeight || window.innerHeight;
    return [Math.max(1, w), Math.max(1, h)];
  }
  /* Pixel ratio is capped twice: by the preset's ratio, and by a pixel budget so a Retina panel cannot quadruple the work. */
  resize() {
    const [w, h] = this._size(); const q = this.q;
    let pr = Math.min(window.devicePixelRatio || 1, q.pixelRatio); pr = Math.min(pr, Math.sqrt(q.maxPixels / (w * h))); pr = Math.max(0.5, pr);
    this.renderer.setPixelRatio(pr); this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    const b = this.renderer.getDrawingBufferSize(new THREE.Vector2()); this.stats.w = b.x; this.stats.h = b.y;
    if (this.post) this.post.setSize(b.x, b.y);
  }
  _syncExposure() { this.post.exposure = this.exposure * this.q.exposureScale; }
  /* Scene exposure in film-pipeline terms. The low path tone-maps in the material with a curve 2.8 times hotter, so it is scaled to match. */
  setExposure(v) { this.exposure = v; this._syncExposure(); }
  /* Rebuilds the pipeline for another level, keeping the film settings a caller has changed. */
  setQuality(name) {
    if (!PRESETS[name] || name === this.q.name) return;
    const old = this.post; const keep = { focus: old.focus, aperture: old.aperture, bloom: old.bloom, bloomThreshold: old.bloomThreshold, grain: old.grain, vignette: old.vignette, saturation: old.saturation, contrast: old.contrast, fade: old.fade };
    this.post = null; this.q = { ...PRESETS[name] }; if (this.reducedMotion) this.q.motion = false;
    this.resize(); old.dispose();
    this.post = new Post(this.renderer, this.q); Object.assign(this.post, keep); this._syncExposure();
    this.stats.quality = name; this._win = { sum: 0, n: 0, slow: 0, skip: 90 };
    for (const fn of this.listeners) fn(this.q);
  }
  render(dt = 1 / 60) {
    if (!this.scene) return;
    const r = this.renderer; r.info.reset(); this.post.render(this.scene, this.camera, dt);
    this.stats.calls = r.info.render.calls; this.stats.tris = r.info.render.triangles;
  }
  /* Compiles every shader for the current scene ahead of time, against the target it will really draw into, so the first frames do not hitch. */
  async precompile() {
    if (!this.scene) return; const r = this.renderer; const keep = r.getRenderTarget();
    r.setRenderTarget(this.q.film ? this.post.main : null);
    try { await r.compileAsync(this.scene, this.camera); } finally { r.setRenderTarget(keep); }
  }
  /* Real-time loop. update(dt, t) runs before each render. */
  start(update) {
    if (update) this.update = update; if (this.running) return; this.running = true; this._last = performance.now();
    const frame = (now) => {
      if (!this.running) return; this._raf = requestAnimationFrame(frame);
      const raw = Math.max(0, now - this._last) / 1000; this._last = now; const dt = Math.min(raw, 1 / 15); this.t += dt; /* a frame's timestamp can be older than the moment start() ran */
      if (this.update) this.update(dt, this.t);
      this.render(dt); this._watch(raw);
    };
    this._raf = requestAnimationFrame(frame);
  }
  stop() { this.running = false; cancelAnimationFrame(this._raf); }
  /* n updates of dt seconds, rendering only the last unless renderAll. For tests: deterministic, no requestAnimationFrame. */
  step(n = 1, dt = 1 / 60, { renderAll = false } = {}) {
    for (let i = 0; i < n; i++) {
      this.t += dt; if (this.update) this.update(dt, this.t);
      if (renderAll || i === n - 1) this.render(dt);
    }
    return this.stats;
  }
  /* Three seconds of slow frames in a row, twice over, drop one level. Long gaps (tab switch, shader compile) do not count. */
  _watch(raw) {
    const w = this._win; const s = this.stats;
    if (w.skip > 0) { w.skip--; return; }
    if (raw > 0.25) return;
    w.sum += raw; w.n++;
    if (w.sum >= 3) {
      const avg = w.sum / w.n; s.ms = avg * 1000; s.fps = 1 / avg; w.sum = 0; w.n = 0;
      if (this.adaptive && avg > 1 / 42) { w.slow++; if (w.slow >= 2) { const i = ORDER.indexOf(this.q.name); if (i > 0) this.setQuality(ORDER[i - 1]); w.slow = 0; } } else w.slow = 0;
    }
  }
  dispose() {
    this.stop(); window.removeEventListener('resize', this._onResize); this.canvas.removeEventListener('webglcontextlost', this._onLost);
    this.post.dispose(); this.listeners.clear(); this.renderer.dispose();
  }
}
