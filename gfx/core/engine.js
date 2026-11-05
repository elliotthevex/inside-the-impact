/* The engine: one renderer, one film pipeline, one loop.

     const engine = new Engine(canvas, { quality: 'auto', onQuality(q) {} });
     engine.scene = stage.scene;                    // whatever is being drawn
     engine.start((dt, t) => { ...update... });     // real-time loop, or
     engine.step(120, 1 / 60);                      // test stepping, no requestAnimationFrame

   PRESETS hold the Post fields (film, msaa, ao, aoSamples, dof, bloom, grain, tex, aniso, motion) plus what the world
   needs (shadow size, haze march steps, dust and crowd counts, how many bulbs are real lights). The loop watches frame
   time and drops a level when frames stay slow. A level change rebuilds Post and calls every quality listener. */
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Post } from './post.js';

export const PRESETS = {
  low: { name: 'low', film: false, msaa: 0, ao: false, aoSamples: 0, dof: 0, bloom: false, grain: false, tex: 1024, aniso: 2, motion: true, pixelRatio: 1, maxPixels: 1280 * 720, shadow: 1024, hazeSteps: 3, dust: 60, crowd: 44, bulbs: 0, exposureScale: 0.29 },
  medium: { name: 'medium', mainFormat: 'r11', film: true, msaa: 2, ao: false, aoSamples: 0, dof: 16, bloom: true, grain: true, tex: 1024, aniso: 4, motion: true, pixelRatio: 1.5, maxPixels: 1600 * 900, shadow: 1536, hazeSteps: 5, dust: 220, crowd: 110, bulbs: 1, exposureScale: 1 },
  high: { name: 'high', mainFormat: 'r11', film: true, msaa: 4, ao: true, aoSamples: 8, dof: 32, bloom: true, grain: true, tex: 2048, aniso: 8, motion: true, pixelRatio: 2, maxPixels: 1800000, shadow: 2048, hazeSteps: 6, dust: 420, crowd: 200, bulbs: 2, exposureScale: 1 },
};
const ORDER = ['low', 'medium', 'high'];

/* Reads the GPU name and the device class. ST.lowdetail (the game's Low Detail setting) always wins. */
export function detectQuality(opts = {}) {
  const st = opts.st ?? (typeof ST !== 'undefined' ? ST : null); // eslint-disable-line no-undef
  if (opts.lowDetail || (st && st.lowdetail)) return 'low';
  let gpu = '';
  try {
    const c = document.createElement('canvas'); const gl = c.getContext('webgl2');
    if (!gl) return 'low';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
  } catch (e) { return 'low'; }
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const mem = navigator.deviceMemory || 8;
  if (/swiftshader|llvmpipe|software|microsoft basic/i.test(gpu)) return 'low';
  if (coarse || mem < 4) return /Apple A1[5-9]|Apple GPU|Adreno \(TM\) [78]\d\d/i.test(gpu) ? 'medium' : 'low';
  if (/Apple M\d|RTX|GTX|Radeon (RX|Pro)|Arc\b|Apple GPU/i.test(gpu)) return 'high';
  return 'medium';
}

export function hasWebGL2() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch (e) { return false; }
}

export class Engine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas; this.opts = opts;
    const name = !opts.quality || opts.quality === 'auto' ? detectQuality(opts) : opts.quality;
    this.q = { ...PRESETS[name] };
    this.adaptive = opts.adaptive !== false && (!opts.quality || opts.quality === 'auto');
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
    this.resize(); this.post = makePost(r, this.q); this._syncExposure();
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
    this.resize(); disposePost(old);
    this.post = makePost(this.renderer, this.q); Object.assign(this.post, keep); this._syncExposure();
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
      const raw = (now - this._last) / 1000; this._last = now; const dt = Math.min(raw, 1 / 15); this.t += dt;
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
    disposePost(this.post); this.listeners.clear(); this.renderer.dispose();
  }
}

/* What the engine changes in Post, without touching its interface. Measured on the M1 at 1080p.

   1. Ambient occlusion: post.js rebuilds positions at a sample's own UV but reads the depth of the nearest texel. On a surface seen at a
      grazing angle that half-texel mismatch shows as dark stripes across the canvas. Snapping to the texel centre removes them. The AO target is
      half size, so its pixel centres land exactly on texel edges; the small offset keeps rounding from flipping between neighbours.
   2. Depth of field: 32 full-res taps with two texture reads each cost 9.5 ms. HalfResDof gathers at half resolution and upsamples with a
      depth-aware filter, about 3.5 ms, and the blur looks the same or better because it is jittered and filtered.
   3. Main target: R11F_G11F_B10F instead of RGBA16F when MSAA is on, half the bytes per sample. Nothing reads its alpha. */
const LINEAR_Z = 'float linZ(float d){float z=d*2.-1.;return 2.*uNear*uFar/(uFar+uNear-z*(uFar-uNear));}';
const COC = 'float coc(float z){return clamp((z-uFocus)/max(z,.001)*uAperture,-uMaxCoc,uMaxCoc);}';
const VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
class HalfResDof {
  constructor(post, taps) {
    this.post = post; this.w = 0; this.h = 0; this.a = null; this.b = null;
    const U = this.U = {
      tColor: { value: null }, tDepth: { value: null }, tAo: { value: null }, tHalf: { value: null }, tBlur: { value: null }, uFocus: { value: 4 }, uAperture: { value: 0 }, uMaxCoc: { value: 0.022 }, uUseAo: { value: 0 }, uAspect: { value: 1 }, uNear: { value: 0.1 }, uFar: { value: 100 }, uTexel: { value: new THREE.Vector2() },
    };
    const mk = (frag, defines = {}) => new FullScreenQuad(new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms: U, defines, depthTest: false, depthWrite: false, toneMapped: false }));
    const HEAD = `varying vec2 vUv;uniform sampler2D tColor,tDepth,tAo,tHalf,tBlur;uniform float uFocus,uAperture,uMaxCoc,uUseAo,uAspect,uNear,uFar;uniform vec2 uTexel;${LINEAR_Z}${COC}`;
    this.pre = mk(`${HEAD}void main(){vec3 c=min(texture2D(tColor,vUv).rgb,vec3(40.));if(uUseAo>.5)c*=mix(1.,texture2D(tAo,vUv).r,.85);gl_FragColor=vec4(c,coc(linZ(texture2D(tDepth,vUv).r)));}`);
    this.gather = mk(`${HEAD}float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){vec4 c0=texture2D(tHalf,vUv);float cc=c0.a,ca=abs(cc);if(ca<.0008){gl_FragColor=vec4(c0.rgb,ca);return;}
 vec3 s=c0.rgb;float w=1.;const int N=TAPS;float rot=ign(gl_FragCoord.xy)*6.2831853;
 for(int i=0;i<N;i++){float f=sqrt((float(i)+.5)/float(N));float a=float(i)*2.3999632+rot;vec2 o=vec2(cos(a)/uAspect,sin(a))*f*ca;vec4 t=texture2D(tHalf,vUv+o);float reach=smoothstep(f*ca-.002,f*ca+.002,abs(t.a)+(t.a>cc?ca:0.));s+=t.rgb*reach;w+=reach;}
 gl_FragColor=vec4(s/w,ca);}`, { TAPS: taps });
    this.tent = mk(`${HEAD}void main(){vec2 p=uTexel;gl_FragColor=(texture2D(tHalf,vUv+vec2(-p.x,-p.y))+texture2D(tHalf,vUv+vec2(p.x,-p.y))+texture2D(tHalf,vUv+vec2(-p.x,p.y))+texture2D(tHalf,vUv+vec2(p.x,p.y)))*.25;}`);
    this.comp = mk(`${HEAD}void main(){vec3 base=texture2D(tColor,vUv).rgb;if(uUseAo>.5)base*=mix(1.,texture2D(tAo,vUv).r,.85);float cc=abs(coc(linZ(texture2D(tDepth,vUv).r)));if(uAperture<=0.||cc<.0008){gl_FragColor=vec4(base,1.);return;}
 vec2 g=vUv/uTexel-.5,i=floor(g),f=g-i;vec4 s00=texture2D(tBlur,(i+vec2(.5,.5))*uTexel),s10=texture2D(tBlur,(i+vec2(1.5,.5))*uTexel),s01=texture2D(tBlur,(i+vec2(.5,1.5))*uTexel),s11=texture2D(tBlur,(i+vec2(1.5,1.5))*uTexel);
 vec4 w=vec4((1.-f.x)*(1.-f.y),f.x*(1.-f.y),(1.-f.x)*f.y,f.x*f.y)*(exp(-abs(vec4(s00.a,s10.a,s01.a,s11.a)-cc)*420.)+.002);
 vec3 b=(s00.rgb*w.x+s10.rgb*w.y+s01.rgb*w.z+s11.rgb*w.w)/(w.x+w.y+w.z+w.w);gl_FragColor=vec4(mix(base,b,smoothstep(.0008,.003,cc)),1.);}`);
    this.material = this.comp.material;
  }
  _size() {
    const w = Math.ceil(this.post.w / 2); const h = Math.ceil(this.post.h / 2); if (w === this.w && h === this.h) return;
    if (this.a) { this.a.dispose(); this.b.dispose(); } this.w = w; this.h = h;
    const o = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    this.a = new THREE.WebGLRenderTarget(w, h, o); this.b = new THREE.WebGLRenderTarget(w, h, o); this.U.uTexel.value.set(1 / w, 1 / h);
  }
  /* Post sets uniforms on this.material and has already bound its depth-of-field target. */
  render(r) {
    const target = r.getRenderTarget(); this._size(); const U = this.U;
    r.setRenderTarget(this.a); this.pre.render(r);
    U.tHalf.value = this.a.texture; r.setRenderTarget(this.b); this.gather.render(r);
    U.tHalf.value = this.b.texture; r.setRenderTarget(this.a); this.tent.render(r);
    U.tBlur.value = this.a.texture; r.setRenderTarget(target); this.comp.render(r);
  }
  dispose() { for (const k of ['pre', 'gather', 'tent', 'comp']) { this[k].material.dispose(); this[k].dispose(); } if (this.a) { this.a.dispose(); this.b.dispose(); } }
}

function slimMain(p) {
  const m = p.main; const w = m.width; const h = m.height; const depth = new THREE.DepthTexture(w, h); depth.type = THREE.UnsignedIntType; depth.minFilter = depth.magFilter = THREE.NearestFilter;
  p.main = new THREE.WebGLRenderTarget(w, h, { type: THREE.UnsignedInt101111Type, format: THREE.RGBFormat, samples: p.q.msaa || 0, depthBuffer: true, depthTexture: depth, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }); m.dispose();
}
function makePost(renderer, q) {
  const p = new Post(renderer, q);
  if (p.aoPass) { const m = p.aoPass.material; m.fragmentShader = m.fragmentShader.replace('vec3 vpos(vec2 uv){float d=texture2D(tDepth,uv).r;', 'vec3 vpos(vec2 uv0){vec2 uv=(floor(uv0/uTexel+.25)+.5)*uTexel;float d=texture2D(tDepth,uv).r;'); m.needsUpdate = true; }
  if (p.dofPass && q.halfDof !== false) { p.dofPass.material.dispose(); p.dofPass.dispose(); p.dofPass = new HalfResDof(p, q.dof); }
  if (q.film && q.mainFormat === 'r11') { slimMain(p); p._build = (w, h) => { Post.prototype._build.call(p, w, h); slimMain(p); }; }
  return p;
}

function disposePost(p) {
  if (!p) return;
  for (const k of ['main', 'aoA', 'aoB', 'dofRT']) if (p[k]) p[k].dispose();
  (p.bloomDown || []).forEach((t) => t.dispose()); (p.bloomUp || []).forEach((t) => t.dispose());
  if (p.dofPass && p.dofPass.U) { p.dofPass.dispose(); p.dofPass = null; }
  for (const k of ['aoPass', 'aoBlur', 'dofPass', 'down', 'up', 'film', 'blit']) if (p[k]) { p[k].material.dispose(); p[k].dispose(); }
}
