/* Skin. Standard PBR plus the three things skin needs that PBR leaves out:

   - light that wraps past the terminator and picks up red on the way, which is what subsurface scattering looks like at game distance;
   - the Rocketbox specular map, which holds where skin is actually oily (nose, forehead, cheekbones);
   - sweat, a single uniform that builds with fatigue: lower roughness, a clear wet layer, and droplets that break it up.

   All of it is a cheap edit of the standard shader, so shadows, fog and image-based light keep working. */
import * as THREE from 'three';

export function makeSkin({ map, normalMap, specMap, tint, normalScale = 1 }) {
  const m = new THREE.MeshPhysicalMaterial({
    map, normalMap, roughness: 0.62, metalness: 0, specularIntensity: 0.55,
    clearcoat: 0.001, clearcoatRoughness: 0.3, sheen: 0.12, sheenRoughness: 0.55, sheenColor: new THREE.Color(0.85, 0.32, 0.25),
    normalScale: new THREE.Vector2(normalScale, normalScale),
  });
  if (tint) m.color.copy(tint);
  m.userData.u = { uSweat: { value: 0 }, uFlush: { value: 0 }, uSpec: { value: specMap || null }, uHasSpec: { value: specMap ? 1 : 0 }, uSSS: { value: 0.65 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.u);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uSweat,uFlush,uHasSpec,uSSS;uniform sampler2D uSpec;
float skinHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float skinNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(skinHash(i),skinHash(i+vec2(1,0)),f.x),mix(skinHash(i+vec2(0,1)),skinHash(i+vec2(1,1)),f.x),f.y);}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
 { vec3 flush=vec3(1.06,.90,.86); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*flush,uFlush); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
 float skinSpec=uHasSpec>.5?texture2D(uSpec,vMapUv).r:.2;
 float dropN=skinNoise(vMapUv*340.)*.6+skinNoise(vMapUv*120.)*.4;float wet=uSweat*smoothstep(.34,.72,dropN+uSweat*.25);
 roughnessFactor=clamp(roughnessFactor-skinSpec*.34,.2,1.);roughnessFactor=mix(roughnessFactor,.2,wet*.85);`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
 material.clearcoat=max(material.clearcoat,uSweat*.75*smoothstep(.25,.65,dropN+uSweat*.3));material.clearcoatRoughness=mix(material.clearcoatRoughness,.14,uSweat);`)
      .replace('#include <lights_physical_pars_fragment>', `#include <lights_physical_pars_fragment>
void RE_Direct_Skin(const in IncidentLight directLight,const in vec3 geometryPosition,const in vec3 geometryNormal,const in vec3 geometryViewDir,const in vec3 geometryClearcoatNormal,const in PhysicalMaterial material,inout ReflectedLight reflectedLight){
 RE_Direct_Physical(directLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
 float nl=dot(geometryNormal,directLight.direction);float wrap=.52;float s=max(0.,(nl+wrap)/(1.+wrap))-max(0.,nl);
 reflectedLight.directDiffuse+=s*uSSS*vec3(1.,.36,.24)*directLight.color*BRDF_Lambert(material.diffuseColor);
}
#undef RE_Direct
#define RE_Direct RE_Direct_Skin`);
  };
  m.customProgramCacheKey = () => 'skin1';
  return m;
}
