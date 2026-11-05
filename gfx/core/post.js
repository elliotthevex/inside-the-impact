/* The film pipeline. Written directly on the renderer rather than through EffectComposer, for one reason: everything
   here reads a single depth texture from the main pass, so depth of field and ambient occlusion add no extra geometry
   passes. That matters on phones, and on the M1 this game was built on.

     scene (HDR, MSAA) -> ambient occlusion (half res) -> depth of field -> bloom (dual filter) -> film (tone map, grade, grain)

   On the low preset nothing here runs: the renderer tone-maps directly and materials stay correct either way, because
   their shaders use the standard tonemapping and colorspace chunks. */
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const pass = (frag, uniforms, extra = {}) => new FullScreenQuad(new THREE.ShaderMaterial({
  vertexShader: VS, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped: false, ...extra,
}));
const hdr = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, ...o,
});
const LINEAR_Z = `float linZ(float d){float z=d*2.-1.;return 2.*uNear*uFar/(uFar+uNear-z*(uFar-uNear));}`;

const AO_FRAG = `varying vec2 vUv;uniform sampler2D tDepth;uniform float uNear,uFar,uRadius,uFrame;uniform vec2 uTexel;uniform mat4 uInvProj;
${LINEAR_Z}
vec3 vpos(vec2 uv){float d=texture2D(tDepth,uv).r;vec4 c=vec4(uv*2.-1.,d*2.-1.,1.);vec4 v=uInvProj*c;return v.xyz/v.w;}
float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){float d=texture2D(tDepth,vUv).r;if(d>=.99999){gl_FragColor=vec4(1.);return;}
 vec3 P=vpos(vUv);vec3 l=vpos(vUv-vec2(uTexel.x,0.)),r=vpos(vUv+vec2(uTexel.x,0.)),b=vpos(vUv-vec2(0.,uTexel.y)),t=vpos(vUv+vec2(0.,uTexel.y));
 vec3 dx=abs(r.z-P.z)<abs(l.z-P.z)?r-P:P-l,dy=abs(t.z-P.z)<abs(b.z-P.z)?t-P:P-b;vec3 N=normalize(cross(dx,dy));
 float rad=uRadius/max(.25,-P.z);float a0=ign(gl_FragCoord.xy+uFrame*5.588)*6.2831853;float occ=0.;const int S=SAMPLES;
 for(int i=0;i<S;i++){float f=(float(i)+.5)/float(S);float a=a0+float(i)*2.3999632;vec2 o=vec2(cos(a),sin(a))*rad*sqrt(f);vec3 Q=vpos(vUv+o);vec3 v=Q-P;float dist2=dot(v,v);float nv=dot(N,v)/sqrt(dist2+1e-5);
  float w=1./(1.+dist2*5.);occ+=max(0.,nv-.06)*w;}
 float ao=clamp(1.-occ/float(S)*2.1,0.,1.);gl_FragColor=vec4(ao,ao,ao,1.);}`;
const AO_BLUR = `varying vec2 vUv;uniform sampler2D tAo,tDepth;uniform float uNear,uFar;uniform vec2 uDir;
${LINEAR_Z}
void main(){float c=linZ(texture2D(tDepth,vUv).r);float s=0.,w=0.;for(int i=-2;i<=2;i++){vec2 u=vUv+uDir*float(i);float z=linZ(texture2D(tDepth,u).r);float g=exp(-abs(z-c)*14.)*(1.-abs(float(i))*.18);s+=texture2D(tAo,u).r*g;w+=g;}float a=s/max(w,1e-4);gl_FragColor=vec4(a,a,a,1.);}`;

/* Gathers along a Vogel disk. A sample only spreads into this pixel if its own blur reaches this far, so sharp
   foreground never smears over the blurred room behind it. */
const DOF_FRAG = `varying vec2 vUv;uniform sampler2D tColor,tDepth,tAo;uniform float uNear,uFar,uFocus,uAperture,uMaxCoc,uUseAo,uAspect;
${LINEAR_Z}
float coc(float z){return clamp((z-uFocus)/max(z,.001)*uAperture,-uMaxCoc,uMaxCoc);}
void main(){vec3 base=texture2D(tColor,vUv).rgb;if(uUseAo>.5){float a=texture2D(tAo,vUv).r;base*=mix(1.,a,.85);}
 float z=linZ(texture2D(tDepth,vUv).r);float cc=coc(z);float ca=abs(cc);if(uAperture<=0.||ca<.0006){gl_FragColor=vec4(base,1.);return;}
 vec3 s=base;float w=1.;const int N=TAPS;float rad=ca;for(int i=0;i<N;i++){float f=sqrt((float(i)+.5)/float(N));float a=float(i)*2.3999632;vec2 o=vec2(cos(a)/uAspect,sin(a))*f*rad;vec2 u=vUv+o;float zz=linZ(texture2D(tDepth,u).r);float c2=abs(coc(zz));
  float reach=smoothstep(f*rad-.002,f*rad+.002,c2+ (zz>z?ca:0.));vec3 t=texture2D(tColor,u).rgb;if(uUseAo>.5){t*=mix(1.,texture2D(tAo,u).r,.85);}s+=t*reach;w+=reach;}
 gl_FragColor=vec4(s/w,1.);}`;

const DOWN = `varying vec2 vUv;uniform sampler2D t;uniform vec2 uTexel;uniform float uFirst,uThresh;
vec3 pick(vec2 u){vec3 c=texture2D(t,u).rgb;if(uFirst>.5){c=min(c,vec3(24.));float l=max(c.r,max(c.g,c.b));float k=uThresh*.5;float s=clamp(l-uThresh+k,0.,2.*k);s=s*s/(4.*k+1e-4);c*=max(s,l-uThresh)/max(l,1e-4);}return c;}
void main(){vec2 p=uTexel;vec3 c=pick(vUv)*4.+pick(vUv+vec2(-p.x,-p.y))+pick(vUv+vec2(p.x,-p.y))+pick(vUv+vec2(-p.x,p.y))+pick(vUv+vec2(p.x,p.y));gl_FragColor=vec4(c/8.,1.);}`;
const UP = `varying vec2 vUv;uniform sampler2D t;uniform vec2 uTexel;
void main(){vec2 p=uTexel;vec3 c=texture2D(t,vUv+vec2(-p.x*2.,0.)).rgb+texture2D(t,vUv+vec2(-p.x,p.y)).rgb*2.+texture2D(t,vUv+vec2(0.,p.y*2.)).rgb+texture2D(t,vUv+vec2(p.x,p.y)).rgb*2.+texture2D(t,vUv+vec2(p.x*2.,0.)).rgb+texture2D(t,vUv+vec2(p.x,-p.y)).rgb*2.+texture2D(t,vUv+vec2(0.,-p.y*2.)).rgb+texture2D(t,vUv+vec2(-p.x,-p.y)).rgb*2.;gl_FragColor=vec4(c/12.,1.);}`;

/* Filmic curve then grade: high contrast, slightly desaturated, warm highlights over cool shadows. */
const FILM = `varying vec2 vUv;uniform sampler2D tColor,tBloom;uniform float uBloom,uExposure,uTime,uGrain,uVig,uSat,uContrast,uFade;uniform vec3 uShadow,uHigh;uniform vec2 uRes;
vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
const mat3 AI=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777);
const mat3 AO=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602);
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(.0)),vec3(.41666))-.055,step(.0031308,c));}
void main(){vec3 c=texture2D(tColor,vUv).rgb;c+=texture2D(tBloom,vUv).rgb*uBloom;c*=uExposure;
 vec2 q=vUv-.5;q.x*=uRes.x/uRes.y;float v=smoothstep(.95,.25,length(q)*(1.+uVig*.2));c*=mix(1.,v,uVig);
 c*=.6;c=AI*c;c=RRT(c);c=AO*c;c=clamp(c,0.,1.);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);c=mix(c,(c-.18)*uContrast+.18,1.);c=max(c,vec3(0.));
 vec3 t=mix(uShadow,uHigh,smoothstep(.0,.65,l));c*=t;
 float n=hash(gl_FragCoord.xy+fract(uTime)*311.)-.5;c+=n*uGrain*(1.-l*.72);
 c=srgb(clamp(c,0.,1.));c+=(hash(gl_FragCoord.yx+7.)-.5)/255.;c*=uFade;gl_FragColor=vec4(c,1.);}`;

export class Post {
  constructor(renderer, q) {
    this.r = renderer; this.q = q; this.t = 0; this.frame = 0;
    this.focus = 4; this.aperture = 0; this.exposure = 1; this.bloom = 0.16; this.bloomThreshold = 1.15;
    this.grain = 0.011; this.vignette = 0.55; this.saturation = 0.9; this.contrast = 1.06; this.fade = 1;
    this.shadowTint = new THREE.Color(0.93, 0.97, 1.05); this.highTint = new THREE.Color(1.03, 1.0, 0.95);
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    this.main = null; this.u = {};
    this._build(size.x, size.y);
  }
  _build(w, h) {
    const q = this.q; this.w = w; this.h = h;
    for (const k of ['main', 'aoA', 'aoB', 'dofRT']) if (this[k]) this[k].dispose();
    (this.bloomDown || []).forEach((t) => t.dispose()); (this.bloomUp || []).forEach((t) => t.dispose());
    const depth = new THREE.DepthTexture(w, h); depth.type = THREE.UnsignedIntType; depth.minFilter = depth.magFilter = THREE.NearestFilter;
    this.main = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: q.msaa || 0, depthBuffer: true, depthTexture: depth, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    if (q.ao) { const aw = Math.ceil(w / 2), ah = Math.ceil(h / 2); this.aoA = new THREE.WebGLRenderTarget(aw, ah, { type: THREE.UnsignedByteType, depthBuffer: false }); this.aoB = this.aoA.clone(); }
    if (q.dof) this.dofRT = hdr(w, h);
    this.bloomDown = []; this.bloomUp = [];
    if (q.bloom) { let bw = w, bh = h; for (let i = 0; i < 5; i++) { bw = Math.max(2, bw >> 1); bh = Math.max(2, bh >> 1); this.bloomDown.push(hdr(bw, bh)); if (i < 4) this.bloomUp.push(hdr(bw, bh)); } }
    if (!this.film) this._materials();
    this._uniformSizes();
  }
  _materials() {
    const q = this.q;
    const camU = () => ({ uNear: { value: 0.1 }, uFar: { value: 100 } });
    if (q.ao) {
      this.aoPass = pass(AO_FRAG, { tDepth: { value: null }, uTexel: { value: new THREE.Vector2() }, uInvProj: { value: new THREE.Matrix4() }, uRadius: { value: 0.09 }, uFrame: { value: 0 }, ...camU() }, { defines: { SAMPLES: q.aoSamples || 8 } });
      this.aoBlur = pass(AO_BLUR, { tAo: { value: null }, tDepth: { value: null }, uDir: { value: new THREE.Vector2() }, ...camU() });
    }
    if (q.dof) this.dofPass = pass(DOF_FRAG, { tColor: { value: null }, tDepth: { value: null }, tAo: { value: null }, uFocus: { value: 4 }, uAperture: { value: 0 }, uMaxCoc: { value: 0.022 }, uUseAo: { value: 0 }, uAspect: { value: 1 }, ...camU() }, { defines: { TAPS: q.dof } });
    this.down = pass(DOWN, { t: { value: null }, uTexel: { value: new THREE.Vector2() }, uFirst: { value: 0 }, uThresh: { value: 1 } });
    this.up = pass(UP, { t: { value: null }, uTexel: { value: new THREE.Vector2() } }, { blending: THREE.AdditiveBlending, transparent: true });
    this.film = pass(FILM, { tColor: { value: null }, tBloom: { value: null }, uBloom: { value: 0 }, uExposure: { value: 1 }, uTime: { value: 0 }, uGrain: { value: 0 }, uVig: { value: 0 }, uSat: { value: 1 }, uContrast: { value: 1 }, uFade: { value: 1 }, uShadow: { value: new THREE.Color(1, 1, 1) }, uHigh: { value: new THREE.Color(1, 1, 1) }, uRes: { value: new THREE.Vector2() } });
    this.blit = pass('varying vec2 vUv;uniform sampler2D t;uniform float uAo;uniform sampler2D tAo;void main(){vec3 c=texture2D(t,vUv).rgb;if(uAo>.5)c*=mix(1.,texture2D(tAo,vUv).r,.85);gl_FragColor=vec4(c,1.);}', { t: { value: null }, tAo: { value: null }, uAo: { value: 0 } });
  }
  _uniformSizes() { if (this.film) this.film.material.uniforms.uRes.value.set(this.w, this.h); }
  setSize(w, h) { if (w !== this.w || h !== this.h) this._build(w, h); }
  render(scene, camera, dt) {
    const r = this.r, q = this.q; this.t += dt; this.frame++;
    if (!q.film) { r.setRenderTarget(null); r.toneMappingExposure = this.exposure; r.render(scene, camera); return; }
    r.setRenderTarget(this.main); r.clear(); r.render(scene, camera);
    let color = this.main.texture; const depth = this.main.depthTexture; const near = camera.near, far = camera.far;
    let aoTex = null;
    if (q.ao) {
      const a = this.aoPass.material.uniforms; a.tDepth.value = depth; a.uNear.value = near; a.uFar.value = far; a.uInvProj.value.copy(camera.projectionMatrixInverse); a.uTexel.value.set(1 / this.w, 1 / this.h); a.uFrame.value = q.motion === false ? 0 : this.frame % 16;
      r.setRenderTarget(this.aoA); this.aoPass.render(r);
      const b = this.aoBlur.material.uniforms; b.tDepth.value = depth; b.uNear.value = near; b.uFar.value = far;
      b.tAo.value = this.aoA.texture; b.uDir.value.set(2 / this.w, 0); r.setRenderTarget(this.aoB); this.aoBlur.render(r);
      b.tAo.value = this.aoB.texture; b.uDir.value.set(0, 2 / this.h); r.setRenderTarget(this.aoA); this.aoBlur.render(r);
      aoTex = this.aoA.texture;
    }
    if (q.dof) {
      const d = this.dofPass.material.uniforms; d.tColor.value = color; d.tDepth.value = depth; d.tAo.value = aoTex; d.uUseAo.value = aoTex ? 1 : 0; d.uNear.value = near; d.uFar.value = far; d.uFocus.value = this.focus; d.uAperture.value = this.aperture; d.uAspect.value = this.w / this.h;
      r.setRenderTarget(this.dofRT); this.dofPass.render(r); color = this.dofRT.texture;
    } else if (aoTex) {
      if (!this.dofRT) this.dofRT = hdr(this.w, this.h);
      const u = this.blit.material.uniforms; u.t.value = color; u.tAo.value = aoTex; u.uAo.value = 1; r.setRenderTarget(this.dofRT); this.blit.render(r); color = this.dofRT.texture;
    }
    let bloomTex = null;
    if (q.bloom && this.bloom > 0) {
      const D = this.bloomDown, U = this.bloomUp, du = this.down.material.uniforms, uu = this.up.material.uniforms; du.uThresh.value = this.bloomThreshold;
      let src = color;
      for (let i = 0; i < D.length; i++) { du.t.value = src; du.uFirst.value = i === 0 ? 1 : 0; du.uTexel.value.set(0.5 / D[i].width, 0.5 / D[i].height); r.setRenderTarget(D[i]); this.down.render(r); src = D[i].texture; }
      let cur = D[D.length - 1];
      for (let i = U.length - 1; i >= 0; i--) {
        const u = this.blit.material.uniforms; u.t.value = D[i].texture; u.uAo.value = 0; r.setRenderTarget(U[i]); this.blit.render(r);
        uu.t.value = cur.texture; uu.uTexel.value.set(0.5 / U[i].width, 0.5 / U[i].height); r.setRenderTarget(U[i]); r.autoClear = false; this.up.render(r); r.autoClear = true; cur = U[i];
      }
      bloomTex = cur.texture;
    }
    const f = this.film.material.uniforms; f.tColor.value = color; f.tBloom.value = bloomTex; f.uBloom.value = bloomTex ? this.bloom : 0; f.uExposure.value = this.exposure; f.uTime.value = q.motion === false ? 0.5 : this.t; f.uGrain.value = q.grain ? this.grain : 0; f.uVig.value = this.vignette; f.uSat.value = this.saturation; f.uContrast.value = this.contrast; f.uFade.value = this.fade; f.uShadow.value.copy(this.shadowTint); f.uHigh.value.copy(this.highTint);
    r.setRenderTarget(null); this.film.render(r);
  }
}
