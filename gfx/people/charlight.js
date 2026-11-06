/* The character light. The room is baked and three.js has no light linking, so a light that only touches the fighters has to live in their materials.
   This adds two things to skin, trunks, boots and gloves, in both the film path and the low path, and to nothing else:

   - a soft fill from a large source just above the lens. It only makes up what the room does not give: where the lamp or a bulb already lights a surface it fades
     away, so the lit side, the key's direction and the shape of every shadow stay as they were, and the dark side keeps its form because the fill falls off around him;
   - a thin rim on the edges that face the lamp, which is what a boxer under a hanging lamp has anyway, and which lifts him off a dark background.

   The lamp hangs a metre and a half over his head, so a man under it gets several times the light of a man at the ropes. A soft limit on the direct light evens that out a little.

   Numbers are set per preset through setCharLight(q), since the presets differ in how many real bulbs reach the fighters.
   Each material has its own gain, because the same light has to read on two different skins. */
import * as THREE from 'three';

const FILL_COLOR = new THREE.Color(1, 0.86, 0.72);   // the room's own warm, a little cooler than the key so the dark side does not go orange
const RIM_COLOR = new THREE.Color(1, 0.82, 0.62);

/* shared by every fighter material: one write reaches them all */
const U = { uCharFill: { value: new THREE.Color() }, uCharRim: { value: new THREE.Color() }, uCharKnee: { value: 3 }, uCharSoft: { value: 22 } };

/* fill and rim in the same units as a light's irradiance: the key gives a vertical surface at chest height about 5 to 8 */
export function setCharLight(q = {}) {
  U.uCharFill.value.copy(FILL_COLOR).multiplyScalar(q.charFill ?? 4.3);
  U.uCharRim.value.copy(RIM_COLOR).multiplyScalar(q.charRim ?? 0.5);
  U.uCharKnee.value = q.charKnee ?? 3;
  U.uCharSoft.value = q.charSoft ?? 22;
}
setCharLight();

const PARS = 'uniform vec3 uCharFill,uCharRim,uCharGain;uniform float uCharKnee,uCharSoft;';
const BODY = `
 {
  vec3 cN=normal;float cNV=saturate(dot(cN,geometryViewDir));
  const vec3 cL=vec3(-.24,.52,.82);
  float cW=dot(cN,cL)*.5+.5;cW=.36+.64*cW*cW;
  const vec3 cLuma=vec3(.2126,.7152,.0722);
  float cHave=dot(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse,cLuma)*PI/max(dot(material.diffuseColor,cLuma),.02);
  reflectedLight.indirectDiffuse+=uCharFill*uCharGain*cW*(uCharKnee/(uCharKnee+cHave))*BRDF_Lambert(material.diffuseColor);
  reflectedLight.directDiffuse/=1.+cHave/uCharSoft;
  #if NUM_SPOT_LIGHTS > 0
  float cF=1.-cNV;cF*=cF;cF*=cF;
  reflectedLight.directSpecular+=uCharRim*cF*smoothstep(-.3,.45,dot(cN,normalize(spotLights[0].position-geometryPosition)));
  #endif
 }`;

/* gain, a THREE.Vector3 or nothing, scales the fill per channel for this material only. Call once, after any onBeforeCompile of the material's own. */
export function withCharLight(mat, gain = null) {
  const prev = mat.onBeforeCompile, key = mat.customProgramCacheKey();
  const g = { value: gain || new THREE.Vector3(1, 1, 1) }; mat.userData.charGain = g;
  mat.onBeforeCompile = (s, r) => {
    prev.call(mat, s, r);
    s.uniforms.uCharFill = U.uCharFill; s.uniforms.uCharRim = U.uCharRim; s.uniforms.uCharKnee = U.uCharKnee; s.uniforms.uCharSoft = U.uCharSoft; s.uniforms.uCharGain = g;
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\n${PARS}`).replace('#include <lights_fragment_end>', `#include <lights_fragment_end>${BODY}`);
  };
  mat.customProgramCacheKey = () => `${key}|char`;
  return mat;
}
