# Asset list

What Street Fight 3D uses, where each thing comes from, and what is still a stand-in. Licences and authors are in `CREDITS.md`. `assets/manifest.json` is the machine-readable record of the Poly Haven files.

## From outside the project

| What | Where it lives | Source |
|---|---|---|
| Fighter mesh, skeleton, face morphs | `assets/people/fighter.glb` | Rocketbox `Sports_Male_01`, processed by `tools/gfx/person.py` |
| Player skin and normal maps | `assets/people/m021_*` | Rocketbox `Sports_Male_01`, processed by `tools/gfx/skin.py` |
| Rival skin, normal maps and head shape | `assets/people/m007b_*` | Rocketbox `Male_Adult_12`, moved onto the fighter's head by `tools/gfx/second_face.py` |
| Stance, punches, knockdown, get-up | `assets/anim/clips.{json,bin}` | CMU mocap, cut by `tools/gfx/clips.py` from `tools/gfx/clips_spec.json` |
| Room props | `assets/models/ph/` | Poly Haven |
| Wall, floor, satin, leather, wood, linen | `assets/tex/` | Poly Haven |
| Lighting and reflections | `assets/hdri/` | Poly Haven |
| Display font | `assets/fonts/` | Barlow Condensed |
| 3D engine | `vendor/three/` | Three.js r187 |

## Made for this game

| What | Where it is made |
|---|---|
| Room shell, ring, ropes, posts, benches, posters, banner | `gfx/world/kit.js`, `gfx/arena/stage.js` |
| Canvas markings and scuffs, painted wall band | `gfx/world/kit.js` |
| Baked room lighting | `gfx/world/kit.js`, at load |
| Trunks and boots | cut from the Rocketbox mesh in `tools/gfx/person.py`, textures from `tools/gfx/gear_tex.py` |
| Gloves | `gfx/people/glove.js`, textures from `tools/gfx/glove_tex.py` |
| Footwork, slip, arm aim and reactions | `gfx/people/rig.js` |
| Skin shader, sweat and flush | `gfx/people/skin.js` |
| Hit flash, dust and other effects | `gfx/arena/fx.js` |
| All sound | `gfx/arena/audio.js` |
| HUD | `gfx/arena/hud.js`, `gfx/arena/arena.css` |

## Stand-ins and known limits

These work in the game today, and a future pass could replace them.

| What | The limit | What would replace it |
|---|---|---|
| Crowd | One base mesh in five poses, so people repeat when you look closely | More Rocketbox characters run through the same pose code |
| Rival | Same body as the player with a different face and skin | A second body mesh |
| Slip | Made in code, because no mocap take showed a clean slip | A motion-captured slip |
| Sound | Synthesised and measured, not yet judged by a person | Recordings, if the synthesised sound falls short |

## Rebuilding

Raw downloads are not in the repo. To rebuild the people or clips, fetch them again:

- CMU mocap: `github.com/una-dinosauria/cmu-mocap`
- Rocketbox: `github.com/microsoft/Microsoft-Rocketbox`, under `Assets/Avatars/Adults/`

Rerunning `tools/gfx/gear_tex.py` overwrites the glove textures, so run `tools/gfx/glove_tex.py` after it.
