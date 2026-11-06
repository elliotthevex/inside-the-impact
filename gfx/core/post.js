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

/* Positions are rebuilt at the centre of the depth texel that was read. Half-res pixel centres sit exactly on texel edges, and on a surface seen at a grazing
   angle a half-texel mismatch shows as dark stripes across the canvas. The small offset keeps rounding from flipping between neighbours. */
const AO_FRAG = `varying vec2 vUv;uniform sampler2D tDepth;uniform float uNear,uFar,uRadius,uFrame;uniform vec2 uTexel;uniform mat4 uInvProj;
${LINEAR_Z}
vec3 vpos(vec2 uv0){vec2 uv=(floor(uv0/uTexel+.25)+.5)*uTexel;float d=texture2D(tDepth,uv).r;vec4 c=vec4(uv*2.-1.,d*2.-1.,1.);vec4 v=uInvProj*c;return v.xyz/v.w;}
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

const DOWN = `varying vec2 vUv;uniform sampler2D t;uniform vec2 uTexel;uniform float uFirst,uThresh;
vec3 pick(vec2 u){vec3 c=texture2D(t,u).rgb;if(uFirst>.5){c=min(c,vec3(24.));float l=max(c.r,max(c.g,c.b));float k=uThresh*.5;float s=clamp(l-uThresh+k,0.,2.*k);s=s*s/(4.*k+1e-4);c*=max(s,l-uThresh)/max(l,1e-4);}return c;}
void main(){vec2 p=uTexel;vec3 c=pick(vUv)*4.+pick(vUv+vec2(-p.x,-p.y))+pick(vUv+vec2(p.x,-p.y))+pick(vUv+vec2(-p.x,p.y))+pick(vUv+vec2(p.x,p.y));gl_FragColor=vec4(c/8.,1.);}`;
const UP = `varying vec2 vUv;uniform sampler2D t;uniform vec2 uTexel;
void main(){vec2 p=uTexel;vec3 c=texture2D(t,vUv+vec2(-p.x*2.,0.)).rgb+texture2D(t,vUv+vec2(-p.x,p.y)).rgb*2.+texture2D(t,vUv+vec2(0.,p.y*2.)).rgb+texture2D(t,vUv+vec2(p.x,p.y)).rgb*2.+texture2D(t,vUv+vec2(p.x*2.,0.)).rgb+texture2D(t,vUv+vec2(p.x,-p.y)).rgb*2.+texture2D(t,vUv+vec2(0.,-p.y*2.)).rgb+texture2D(t,vUv+vec2(-p.x,-p.y)).rgb*2.;gl_FragColor=vec4(c/12.,1.);}`;

/* Filmic curve then grade: slightly desaturated, warm highlights over cool shadows. Contrast is a power around mid grey, so it can never push a shadow through zero.
   It used to be a straight line around .18, which sent everything under .01 linear, about 25/255 on screen, to pure black. */
const FILM = `varying vec2 vUv;uniform sampler2D tColor,tBloom;uniform float uBloom,uExposure,uTime,uGrain,uVig,uSat,uContrast,uFade;uniform vec3 uShadow,uHigh;uniform vec2 uRes;
vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
const mat3 AI=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777);
const mat3 AO=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602);
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(.0)),vec3(.41666))-.055,step(.0031308,c));}
void main(){vec3 c=texture2D(tColor,vUv).rgb;c+=texture2D(tBloom,vUv).rgb*uBloom;c*=uExposure;
 vec2 q=vUv-.5;q.x*=uRes.x/uRes.y;float v=smoothstep(.95,.25,length(q)*(1.+uVig*.2));c*=mix(1.,v,uVig);
 c*=.6;c=AI*c;c=RRT(c);c=AO*c;c=clamp(c,0.,1.);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);c=pow(max(c,vec3(1e-5))/.18,vec3(uContrast))*.18;
 vec3 t=mix(uShadow,uHigh,smoothstep(.0,.65,l));c*=t;
 float n=hash(gl_FragCoord.xy+fract(uTime)*311.)-.5;c+=n*uGrain*(1.-l*.72);
 c=srgb(clamp(c,0.,1.));c+=(hash(gl_FragCoord.yx+7.)-.5)/255.;c*=uFade;gl_FragColor=vec4(c,1.);}`;

/* Depth of field at half resolution: gather along a Vogel disk, tent filter, depth-aware upsample. A sample only spreads into a pixel if its own blur reaches that far,
   so a sharp foreground never smears over the blurred room behind it. 32 taps at full resolution with two texture reads each cost 9.5 ms at 1080p on the M1; this costs about 3.5. */
/* Blur radius as a fraction of screen height, negative in front of the focal plane. A zone around the focal plane stays fully sharp, so the canvas around the men does.
   Behind it the room softens up to a clamp that still leaves ropes and people recognisable. In front of it the blur is cut hard: a blurred foreground is what makes a wide shot read as a miniature. */
const COC = 'float coc(float z){float d=z-uFocus;float a=max(abs(d)-uSharp,0.)/max(z,.001)*uAperture;return d<0.?-min(a*uNearK,uNearMax):min(a,uMaxCoc);}';
class HalfResDof {
  constructor(post, taps) {
    this.post = post; this.w = 0; this.h = 0; this.a = null; this.b = null;
    const U = this.U = {
      tColor: { value: null }, tDepth: { value: null }, tAo: { value: null }, tHalf: { value: null }, tBlur: { value: null }, uFocus: { value: 4 }, uAperture: { value: 0 }, uMaxCoc: { value: 0.006 }, uSharp: { value: 1.6 }, uNearK: { value: 0.25 }, uNearMax: { value: 0.002 }, uAoAmt: { value: 0.5 }, uUseAo: { value: 0 }, uAspect: { value: 1 }, uNear: { value: 0.1 }, uFar: { value: 100 }, uTexel: { value: new THREE.Vector2() },
    };
    const mk = (frag, defines = {}) => new FullScreenQuad(new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms: U, defines, depthTest: false, depthWrite: false, toneMapped: false }));
    const HEAD = `varying vec2 vUv;uniform sampler2D tColor,tDepth,tAo,tHalf,tBlur;uniform float uFocus,uAperture,uMaxCoc,uSharp,uNearK,uNearMax,uAoAmt,uUseAo,uAspect,uNear,uFar;uniform vec2 uTexel;${LINEAR_Z}${COC}`;
    this.pre = mk(`${HEAD}void main(){vec3 c=min(texture2D(tColor,vUv).rgb,vec3(40.));if(uUseAo>.5)c*=mix(1.,texture2D(tAo,vUv).r,uAoAmt);gl_FragColor=vec4(c,coc(linZ(texture2D(tDepth,vUv).r)));}`);
    this.gather = mk(`${HEAD}float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){vec4 c0=texture2D(tHalf,vUv);float cc=c0.a,ca=abs(cc);if(ca<.0008){gl_FragColor=vec4(c0.rgb,ca);return;}
 vec3 s=c0.rgb;float w=1.;const int N=TAPS;float rot=ign(gl_FragCoord.xy)*6.2831853;
 for(int i=0;i<N;i++){float f=sqrt((float(i)+.5)/float(N));float a=float(i)*2.3999632+rot;vec2 o=vec2(cos(a)/uAspect,sin(a))*f*ca;vec4 t=texture2D(tHalf,vUv+o);float reach=smoothstep(f*ca-.002,f*ca+.002,abs(t.a)+(t.a>cc?ca:0.));s+=t.rgb*reach;w+=reach;}
 gl_FragColor=vec4(s/w,ca);}`, { TAPS: taps });
    this.tent = mk(`${HEAD}void main(){vec2 p=uTexel;gl_FragColor=(texture2D(tHalf,vUv+vec2(-p.x,-p.y))+texture2D(tHalf,vUv+vec2(p.x,-p.y))+texture2D(tHalf,vUv+vec2(-p.x,p.y))+texture2D(tHalf,vUv+vec2(p.x,p.y)))*.25;}`);
    this.comp = mk(`${HEAD}void main(){vec3 base=texture2D(tColor,vUv).rgb;if(uUseAo>.5)base*=mix(1.,texture2D(tAo,vUv).r,uAoAmt);float cc=abs(coc(linZ(texture2D(tDepth,vUv).r)));if(uAperture<=0.||cc<.0008){gl_FragColor=vec4(base,1.);return;}
 vec2 g=vUv/uTexel-.5,i=floor(g),f=g-i;vec4 s00=texture2D(tBlur,(i+vec2(.5,.5))*uTexel),s10=texture2D(tBlur,(i+vec2(1.5,.5))*uTexel),s01=texture2D(tBlur,(i+vec2(.5,1.5))*uTexel),s11=texture2D(tBlur,(i+vec2(1.5,1.5))*uTexel);
 vec4 w=vec4((1.-f.x)*(1.-f.y),f.x*(1.-f.y),(1.-f.x)*f.y,f.x*f.y)*(exp(-abs(vec4(s00.a,s10.a,s01.a,s11.a)-cc)*420.)+.002);
 vec3 b=(s00.rgb*w.x+s10.rgb*w.y+s01.rgb*w.z+s11.rgb*w.w)/(w.x+w.y+w.z+w.w);gl_FragColor=vec4(mix(base,b,smoothstep(.0006,.0024,cc)),1.);}`);
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

export class Post {
  constructor(renderer, q) {
    this.r = renderer; this.q = q; this.t = 0; this.frame = 0;
    this.focus = 4; this.aperture = 0; this.exposure = 1; this.bloom = 0.16; this.bloomThreshold = 1.15;
    this.grain = 0.011; this.vignette = 0.36; this.saturation = 0.95; this.contrast = 1.18; this.fade = 1;
    this.sharp = 1.6; this.nearScale = 0.25; this.nearMax = 0.002; this.maxCoc = 0.006; this.aoAmount = 0.5;
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
    /* R11F_G11F_B10F is half the bytes per sample under MSAA, and nothing reads the main target's alpha */
    const format = q.mainFormat === 'r11' ? { type: THREE.UnsignedInt101111Type, format: THREE.RGBFormat } : { type: THREE.HalfFloatType };
    this.main = new THREE.WebGLRenderTarget(w, h, { ...format, samples: q.msaa || 0, depthBuffer: true, depthTexture: depth, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
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
    if (q.dof) this.dofPass = new HalfResDof(this, q.dof);
    this.down = pass(DOWN, { t: { value: null }, uTexel: { value: new THREE.Vector2() }, uFirst: { value: 0 }, uThresh: { value: 1 } });
    this.up = pass(UP, { t: { value: null }, uTexel: { value: new THREE.Vector2() } }, { blending: THREE.AdditiveBlending, transparent: true });
    this.film = pass(FILM, { tColor: { value: null }, tBloom: { value: null }, uBloom: { value: 0 }, uExposure: { value: 1 }, uTime: { value: 0 }, uGrain: { value: 0 }, uVig: { value: 0 }, uSat: { value: 1 }, uContrast: { value: 1 }, uFade: { value: 1 }, uShadow: { value: new THREE.Color(1, 1, 1) }, uHigh: { value: new THREE.Color(1, 1, 1) }, uRes: { value: new THREE.Vector2() } });
    this.blit = pass('varying vec2 vUv;uniform sampler2D t;uniform float uAo;uniform sampler2D tAo;void main(){vec3 c=texture2D(t,vUv).rgb;if(uAo>0.)c*=mix(1.,texture2D(tAo,vUv).r,uAo);gl_FragColor=vec4(c,1.);}', { t: { value: null }, tAo: { value: null }, uAo: { value: 0 } });
  }
  dispose() {
    for (const k of ['main', 'aoA', 'aoB', 'dofRT']) if (this[k]) this[k].dispose();
    (this.bloomDown || []).forEach((t) => t.dispose()); (this.bloomUp || []).forEach((t) => t.dispose());
    if (this.dofPass) { this.dofPass.dispose(); this.dofPass = null; }
    for (const k of ['aoPass', 'aoBlur', 'down', 'up', 'film', 'blit']) if (this[k]) { this[k].material.dispose(); this[k].dispose(); }
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
      const d = this.dofPass.material.uniforms; d.tColor.value = color; d.tDepth.value = depth; d.tAo.value = aoTex; d.uUseAo.value = aoTex ? 1 : 0; d.uNear.value = near; d.uFar.value = far; d.uFocus.value = this.focus; d.uAperture.value = this.aperture; d.uSharp.value = this.sharp; d.uNearK.value = this.nearScale; d.uNearMax.value = this.nearMax; d.uMaxCoc.value = this.maxCoc; d.uAoAmt.value = this.aoAmount; d.uAspect.value = this.w / this.h;
      r.setRenderTarget(this.dofRT); this.dofPass.render(r); color = this.dofRT.texture;
    } else if (aoTex) {
      if (!this.dofRT) this.dofRT = hdr(this.w, this.h);
      const u = this.blit.material.uniforms; u.t.value = color; u.tAo.value = aoTex; u.uAo.value = this.aoAmount; r.setRenderTarget(this.dofRT); this.blit.render(r); color = this.dofRT.texture;
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
