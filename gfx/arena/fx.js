/* Impact effects: sweat spray, contact flash and ring, canvas dust, a brief real light at contact, rope wobble. No blood, by design.

     const fx = createFx(scene, engine.q, { stage, reducedMotion, onLand });
     const stop = fx.impact(pos, dir, power, blocked, ev);   // returns hit-stop seconds, 40 to 90 ms by power. dir is [x, z] or a Vector3
     fx.onEvent(ev, match);    fx.track(rigP, rigO);    fx.dust(pos, amount);    fx.update(realDt);    fx.clear();    fx.dispose();

   All particles live in one instanced mesh used as a ring buffer on the GPU. A particle is written once when it is born and the vertex shader
   works out its path from the clock, so a spawn only writes numbers into an array. Effects run on real time, so they keep moving through hit-stop.
   The light is pooled and stays in the scene at intensity 0, because adding or removing a light would recompile every lit shader. */
import * as THREE from 'three';

const KIND = { streak: 0, puff: 1, star: 2, ring: 3 };
const CAP = { low: 160, medium: 320, high: 520 };
const AMOUNT = { low: 0.5, medium: 0.8, high: 1 };
const FLOATS = 16;
const LAND_Y = 0.3;     // pelvis height above the canvas at which a falling man has landed

const VS = `
uniform float uTime;
attribute vec4 aA,aB,aC,aD;
varying vec2 vQ;varying vec4 vCol;varying float vKind;varying float vU;varying vec2 vDir;
void main(){
 float age=uTime-aA.w,life=aB.w,u=life>0.?age/life:2.;
 vQ=position.xy;vCol=aD;vKind=aC.w;vU=u;vDir=vec2(1.,0.);
 if(u<0.||u>=1.){gl_Position=vec4(0.,0.,2.,1.);return;}
 float kind=aC.w,size=aC.x,k=aC.y;
 vec3 wp=aA.xyz;vec3 wv=aB.xyz;
 if(kind<1.5){float e=k>0.?(1.-exp(-k*age))/k:age;wp+=aB.xyz*e;wp.y-=.5*aC.z*age*age;wv=aB.xyz*exp(-k*age);wv.y-=aC.z*age;}
 vec4 mv=viewMatrix*vec4(wp,1.);
 vec2 off;
 if(kind<.5){
  vec3 vv=(viewMatrix*vec4(wv,0.)).xyz;float sp=length(vv.xy);vec2 d=sp>1e-4?vv.xy/sp:vec2(0.,1.);vec2 n=vec2(-d.y,d.x);
  off=n*position.x*size+d*position.y*size*(1.+min(sp*5.,9.));
 }else if(kind<1.5){
  off=position.xy*size*(.5+sqrt(u));
 }else if(kind<2.5){
  vec3 vv=(viewMatrix*vec4(aB.xyz,0.)).xyz;float sp=length(vv.xy);vec2 d=sp>1e-3?vv.xy/sp:vec2(1.,0.);vec2 n=vec2(-d.y,d.x);
  float s=size*(.7+.5*u);off=d*position.x*s*1.5+n*position.y*s;
  mv.xyz+=normalize(-mv.xyz)*.16;
 }else{
  off=position.xy*size*(.2+1.05*sqrt(u));mv.xyz+=normalize(-mv.xyz)*.12;
 }
 mv.xy+=off;
 gl_Position=projectionMatrix*mv;
}`;
const FS = `
varying vec2 vQ;varying vec4 vCol;varying float vKind;varying float vU;
void main(){
 float r2=dot(vQ,vQ),a;
 if(vKind<.5){a=smoothstep(1.,.15,sqrt(vQ.x*vQ.x+vQ.y*vQ.y*.6))*(1.-vU*vU);}
 else if(vKind<1.5){a=exp(-r2*3.2)*smoothstep(1.,.7,r2)*smoothstep(0.,.12,vU)*(1.-vU);}
 else if(vKind<2.5){float q=1.-vU;float core=exp(-r2*16.);float streak=exp(-abs(vQ.y)*24.)*exp(-abs(vQ.x)*3.6);float cross=exp(-abs(vQ.x)*20.)*exp(-abs(vQ.y)*5.)*.45;a=(core+streak+cross)*q*q*smoothstep(1.,.8,r2);}
 else{float r=sqrt(r2);a=smoothstep(.72,.92,r)*smoothstep(1.,.93,r)*(1.-vU)*(1.-vU);}
 gl_FragColor=vec4(vCol.rgb,a*vCol.a);
 if(gl_FragColor.a<.002)discard;
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function createFx(scene, q, opts = {}) {
  const stage = opts.stage || null, reduced = !!opts.reducedMotion, canvasY = stage ? stage.canvasY : 0.75;
  let amount = AMOUNT[q.name] ?? 1, hasLight = q.name !== 'low';
  const cap = CAP.high;                    // the buffer is sized once; a lower level just spawns fewer
  const data = new Float32Array(cap * FLOATS);
  const buf = new THREE.InstancedInterleavedBuffer(data, FLOATS, 1); buf.setUsage(THREE.DynamicDrawUsage);
  const plane = new THREE.PlaneGeometry(2, 2);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = plane.index; geo.setAttribute('position', plane.attributes.position);
  geo.setAttribute('aA', new THREE.InterleavedBufferAttribute(buf, 4, 0)); geo.setAttribute('aB', new THREE.InterleavedBufferAttribute(buf, 4, 4));
  geo.setAttribute('aC', new THREE.InterleavedBufferAttribute(buf, 4, 8)); geo.setAttribute('aD', new THREE.InterleavedBufferAttribute(buf, 4, 12));
  geo.instanceCount = cap;
  const U = { uTime: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms: U, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 20; mesh.name = 'fx-particles';
  scene.add(mesh);
  const light = new THREE.PointLight(0xffe2c0, 0, 3.4, 2); light.name = 'fx-flash'; light.castShadow = false; light.visible = hasLight; scene.add(light);
  let head = 0, dirty = false, lightI = 0, seed = 12345, tracked = null;
  const falling = [];
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();

  function spawn(x, y, z, vx, vy, vz, life, size, drag, grav, kind, r, g, b, a) {
    const o = head * FLOATS; head = (head + 1) % cap;
    data[o] = x; data[o + 1] = y; data[o + 2] = z; data[o + 3] = U.uTime.value;
    data[o + 4] = vx; data[o + 5] = vy; data[o + 6] = vz; data[o + 7] = life;
    data[o + 8] = size; data[o + 9] = drag; data[o + 10] = grav; data[o + 11] = kind;
    data[o + 12] = r; data[o + 13] = g; data[o + 14] = b; data[o + 15] = a;
    dirty = true;
  }

  function sweat(x, y, z, dx, dz, n, speed) {
    for (let i = 0; i < n; i++) {
      const sp = speed * rr(0.45, 1.25), up = rr(-0.1, 0.65), side = rr(-0.75, 0.75);
      const vx = (dx - dz * side) * sp, vz = (dz + dx * side) * sp, vy = up * sp + rr(0, 0.4);
      const w = rr(0.75, 1.2);
      spawn(x + rr(-0.03, 0.03), y + rr(-0.04, 0.04), z + rr(-0.03, 0.03), vx, vy, vz, rr(0.26, 0.62), rr(0.0028, 0.0062), 1.5, 7.5, KIND.streak, 1.5 * w, 1.42 * w, 1.3 * w, rr(0.5, 0.95));
    }
  }

  function impact(pos, dir, power = 0.5, blocked = false, ev = null) {
    const p = Math.max(0, Math.min(1, power)), x = pos.x, y = pos.y, z = pos.z;
    let dx, dz; if (Array.isArray(dir)) { dx = dir[0]; dz = dir[1]; } else if (dir) { dx = dir.x; dz = dir.z; } else { dx = 0; dz = 1; }
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const body = ev && ev.tgt === 'body', heavy = p > 0.55;
    if (blocked) {
      spawn(x, y, z, dx, 0, dz, 0.07, 0.1 + p * 0.16, 0, 0, KIND.star, 2.4, 2.25, 2.1, 0.7);
      spawn(x, y, z, 0, 0, 0, 0.16, 0.12 + p * 0.2, 0, 0, KIND.ring, 1.2, 1.15, 1.05, 0.28);
      const n = Math.round((2 + p * 5) * amount); for (let i = 0; i < n; i++) spawn(x, y, z, dx * rr(0.2, 0.9) + rr(-0.4, 0.4), rr(-0.1, 0.5), dz * rr(0.2, 0.9) + rr(-0.4, 0.4), rr(0.22, 0.42), rr(0.02, 0.05), 3.4, 0.4, KIND.puff, 0.9, 0.8, 0.68, 0.16);
      if (hasLight) { light.position.set(x, y, z); lightI = Math.max(lightI, 3 + p * 6); }
    } else {
      spawn(x, y, z, dx, 0, dz, 0.075 + p * 0.05, 0.13 + p * 0.27, 0, 0, KIND.star, 3.6, 3.2, 2.7, 0.55 + p * 0.45);
      if (heavy) spawn(x, y, z, 0, 0, 0, 0.17 + p * 0.06, 0.2 + p * 0.3, 0, 0, KIND.ring, 1.5, 1.35, 1.15, 0.32);
      const n = Math.round((body ? 3 + p * 9 : 4 + Math.pow(p, 1.2) * 24) * amount);
      sweat(x, y, z, dx, dz, n, (body ? 1.1 : 1.6) * (0.65 + p * 1.5));
      if (hasLight) { light.position.set(x, y, z); lightI = Math.max(lightI, 5 + p * 26); }
    }
    return blocked ? 0.04 + p * 0.03 : 0.04 + p * 0.05;
  }

  function dust(pos, amt = 0.5) {
    const n = Math.round(Math.max(1, amt * 18 * amount));
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, sp = rr(0.25, 1.1) * (0.5 + amt);
      const s = rr(0.07, 0.2) * (0.6 + amt * 0.8);
      spawn(pos.x + rr(-0.1, 0.1), (pos.y ?? canvasY) + rr(0.02, 0.1), pos.z + rr(-0.1, 0.1), Math.cos(a) * sp, rr(0.04, 0.32), Math.sin(a) * sp, rr(0.55, 1.25), s, 2.6, -0.04, KIND.puff, 0.86, 0.68, 0.52, rr(0.05, 0.13));
    }
  }
  const _p = { x: 0, y: 0, z: 0 };
  const canvasDust = (x, z, amt) => { _p.x = x; _p.y = canvasY; _p.z = z; dust(_p, amt); };

  function onEvent(ev, match) {
    switch (ev.type) {
      case 'rope': {
        if (!stage || !stage.ropeHit) break;
        const f = match[ev.who], half = stage.RING ? stage.RING.ropeAt : 2.93, d = ev.dir || [1, 0], side = d[0] > 0.5 ? 'px' : d[0] < -0.5 ? 'nx' : d[1] > 0.5 ? 'pz' : 'nz';
        stage.ropeHit(side, 0.035 + (ev.power || 0) * 0.11, side === 'px' || side === 'nx' ? f.z / half : f.x / half);
        break;
      }
      case 'step': {
        if (amount >= 0.8 && (ev.power || 0) > 0.72 && rnd() < 0.3) { const f = match[ev.who]; canvasDust(f.x, f.z, 0.1); }
        break;
      }
      case 'knockdown': {
        const f = match[ev.who]; if (tracked) falling.push({ rig: ev.who === 'p' ? tracked.p : tracked.o, age: 0 }); else canvasDust(f.x, f.z, 1);
        break;
      }
      case 'getup': { const f = match[ev.who]; canvasDust(f.x, f.z, 0.35); break; }
      default: break;
    }
  }

  function update(dt) {
    U.uTime.value += dt;
    if (dirty) { buf.needsUpdate = true; dirty = false; }
    if (hasLight) {
      if (lightI > 0.01) { lightI *= Math.exp(-dt / 0.038); light.intensity = lightI; } else if (light.intensity !== 0) { lightI = 0; light.intensity = 0; }
    }
    /* a fall lands when the pelvis gets down there, whatever the time scale is doing */
    for (let i = falling.length - 1; i >= 0; i--) {
      const w = falling[i]; w.age += dt;
      if (w.rig.pelvis.y < LAND_Y) { canvasDust(w.rig.pelvis.x, w.rig.pelvis.z, 1); if (stage && stage.kickLamp) stage.kickLamp(1); if (opts.onLand) opts.onLand(); falling.splice(i, 1); } else if (w.age > 6) falling.splice(i, 1);
    }
  }

  return {
    impact, dust, onEvent, update,
    track(rigP, rigO) { tracked = { p: rigP, o: rigO }; },
    clear() { for (let i = 0; i < cap; i++) data[i * FLOATS + 7] = 0; dirty = true; lightI = 0; light.intensity = 0; falling.length = 0; },
    applyQuality(nq) { amount = AMOUNT[nq.name] ?? 1; hasLight = nq.name !== 'low'; light.visible = hasLight; light.intensity = 0; lightI = 0; },
    dispose() { scene.remove(mesh); scene.remove(light); geo.dispose(); plane.dispose(); mat.dispose(); light.dispose(); },
    get alive() { let n = 0; const t = U.uTime.value; for (let i = 0; i < cap; i++) { const o = i * FLOATS; if (data[o + 7] > 0 && t - data[o + 3] < data[o + 7]) n++; } return n; },
    get reduced() { return reduced; },
  };
}
