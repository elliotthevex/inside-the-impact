/* A photographed room as the background, projected so the camera can move inside it.

   A sphere map only looks right from the exact point it was shot. This one treats the room as a box the size of the
   real space: each pixel's view ray is intersected with that box, and the photo is sampled along the direction from
   the capture point to the hit. Walls, floor and ceiling then keep their parallax as the camera moves, the same trick
   as box-projected reflections, and it costs one texture read. Blur comes from the mip chain, so depth of field on the
   background costs nothing even on a phone. */
import * as THREE from 'three';

const VS = `varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS = `varying vec3 vWorld;uniform sampler2D tMap;uniform vec3 uMin,uMax,uCap;uniform float uRot,uExposure,uBoost,uBlur,uSat;uniform vec3 uTint;uniform vec3 uFogColor;uniform float uFog;
vec2 equi(vec3 d){return vec2(atan(d.z,d.x)*.1591549+.5,asin(clamp(d.y,-1.,1.))*.3183099+.5);}
void main(){vec3 ro=cameraPosition;vec3 rd=normalize(vWorld-ro);vec3 inv=1./max(abs(rd),vec3(1e-4))*sign(rd+1e-6);vec3 t1=(uMin-ro)*inv,t2=(uMax-ro)*inv;vec3 tf=max(t1,t2);float t=min(tf.x,min(tf.y,tf.z));vec3 hit=ro+rd*t;vec3 d=normalize(hit-uCap);
 float c=cos(uRot),s=sin(uRot);d=vec3(c*d.x+s*d.z,d.y,-s*d.x+c*d.z);vec3 col=textureLod(tMap,equi(d),uBlur).rgb;
 float l=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(l),col,uSat);col*=1.+uBoost*smoothstep(.6,1.,l)*smoothstep(.6,1.,l);col*=uExposure*uTint;
 col=mix(col,uFogColor,1.-exp(-t*t*uFog*uFog));gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
export function makeBackdrop(tex, o = {}) {
  tex.mapping = THREE.UVMapping; tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
  const r = o.room || { w: 8, d: 8, h: 3 }; const cap = o.cap || [0, 1.5, 0];
  const m = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side: THREE.BackSide, depthWrite: true, fog: false,
    uniforms: {
      tMap: { value: tex }, uMin: { value: new THREE.Vector3(-r.w + (cap[0] || 0), o.floorY ?? 0, -r.d + (cap[2] || 0)) }, uMax: { value: new THREE.Vector3(r.w + (cap[0] || 0), r.h, r.d + (cap[2] || 0)) }, uCap: { value: new THREE.Vector3(...cap) },
      uRot: { value: o.rot || 0 }, uExposure: { value: o.exposure ?? 0.35 }, uBoost: { value: o.boost ?? 6 }, uBlur: { value: o.blur ?? 1.5 }, uSat: { value: o.saturation ?? 0.85 }, uTint: { value: new THREE.Color(...(o.tint || [1, 1, 1])) }, uFogColor: { value: new THREE.Color(...(o.fogColor || [0.02, 0.018, 0.016])) }, uFog: { value: o.fog ?? 0 },
    },
  });
  const size = Math.max(r.w, r.d, r.h) * 3; const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), m);
  mesh.frustumCulled = false; mesh.renderOrder = -10; mesh.name = 'backdrop'; mesh.userData.u = m.uniforms;
  return mesh;
}
