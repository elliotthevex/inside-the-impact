# Fighters: rig, clips, reach, second character

Status: done and verified by render on the real sim, real AI and real stage. Not yet joined into `gfx/arena/index.js`, which did not exist when this was written.

## Join it up
```js
import { preloadFighter, Fighter } from '../people/fighter.js';
import { loadClips } from '../people/anim.js';
import { FighterRig } from '../people/rig.js';
import { setReach } from './sim.js';

setReach(await (await fetch(new URL('./reach.json', import.meta.url))).json());   // before createMatch
await preloadFighter(engine.q, mgr);                                              // also loads the second man's face and skin
const clips = await loadClips(new URL('../../assets/anim/clips.json', import.meta.url).href);
const fp = new Fighter({ corner: 'blue', build: 0.6 }), fo = new Fighter({ corner: 'red', build: 0.55, variant: 'b' });
scene.add(fp.root, fo.root);
const rigP = new FighterRig(fp, clips, { who: 'p', floorY: stage.canvasY, ringHalf: stage.ringHalf });
const rigO = new FighterRig(fo, clips, { who: 'o', floorY: stage.canvasY, ringHalf: stage.ringHalf });
FighterRig.pair(rigP, rigO);
// each render frame, after match.step and BEFORE match.events is cleared:
FighterRig.updateBoth(rigP, rigO, match, dt);
```
- The rig reads `match.p/o`, `match.state`, `match.result`, `match.time`, `match.events` and writes only bones, face morphs, sweat and flush. It never writes the sim. It reads events itself and remembers which it has seen, so dispatch order does not matter as long as it runs before the clear.
- `dt` can be 0 or small during hit-stop. A new match object resets the rig by itself (`rig.reset()` also exists).
- The rig owns `fighter.root`: it stays at (0, floorY, 0) with no rotation and the pelvis carries the position. Do not position `root`. Use the getters.
- Getters, world space, shared vectors (copy to keep): `headWorld()`, `chestWorld()`, `gloveWorld('L'|'R')` (middle of the mitt), `knuckleWorld('L'|'R')` (the striking face, use this for `fx.impact` at contact). Valid after `updateBoth`.
- `rig.update(match, dt)` works for one rig alone. `PUNCH_DEF[kind].hand` names the glove, same as `PUNCHES[kind].hand` in sim.js. `getUpTime` option must match `TUNE.getUpTime` (default 1.2).

## What it does
- `gfx/people/anim.js`: `loadClips(url) -> ClipLib`. `lib.get(name).sample(t, q, root)`, nlerp between frames. No THREE.
- `gfx/people/rig.js`: stance loop plus punch clips time-warped so the arm is furthest out at exactly `punch.contact`, holding through `punch.active`. Non-punching arm stays on the stance so the other hand stays home. Clip lean is capped per punch and chest twist is capped at 54 to 60 degrees: some CMU follow-throughs fold or spin too far.
- Planter: a foot is a fixed point on the canvas until it takes a step. Lead foot first going forward, rear foot first going back, the foot on that side first going sideways, then the feet take turns. Steps have an arc, toe-off and a landing dip. Rear heel light, more on a cross. Driving foot pivots on its ball. Over-stretched legs move the pelvis, never the foot.
- Arm IK: the knuckle point goes to the other man's real head or ribs (ellipsoids fitted to his actual mesh at load, so the second face is measured too), or onto his glove if the shot is blocked, or where his head was if he slipped. Approach differs: straight, from the side with a high elbow for the hook, from under for the uppercut, low for body shots with a level change.
- Reactions are springs: head snap by force direction and hook twist, body fold with an open mouth, stagger, flinch on a blocked shot. Face: wince, blink, jaw, squint, brows, breath, a smile for the winner.
- Warning signs, performed and never drawn, from `fighter.head`: 7 and up squint and a head shake after a hit, 13 and up hands drift low, slack jaw, brows up, long blinks and a standing sway. Gassed: hands lower and mouth open. The numbers are below.
- Knockdown: fall from `knockdown` turned to the blow's direction and kept inside the ropes. He lies still, then `down.up` (the mash bar) visibly moves him toward sitting up, and `down.rising` plays the rest of `getup` and lands him on the sim's x, z and yaw. Feet are re-seeded from the clip and the planter takes over.
- Winner raises his right hand. A loser still standing slumps. In a break or the intro he walks square with his hands down.
- `gfx/people/glove.js` plus `tools/gfx/glove_tex.py`: new glove. Cuff, strap, trim, two piped back panels, palm panels, double stitching, crease where fingers meet palm, deeper on the back of the hand, separate thumb. `glove_d.webp` alpha says where corner colour applies, so trim and strap stay white and black on both corners. Hands are no longer drawn inside gloves (a thumb was poking through).
- Head subdivision in `fighter.js`: one PN-curved round at load, skipped when `q.name === 'low'`. Head goes from 3210 to 12840 triangles and every morph is carried. Silhouette is visibly smoother. Load cost is part of the 128 ms total below.
- Second person: Rocketbox heads do not match in topology (m021 3210 tris, Male_Adult_12 3028, Male_Adult_04 3236), but their atlases share a UV layout. `tools/gfx/second_face.py` moves m021's head vertices onto Male_Adult_12's surface through UV space, so there is no neck weld and all 27 face morphs keep working. Skin below his atlas and the whole body atlas get a log-space recolour, brightened 2.7x so he still reads in a dark room. `new Fighter({ variant: 'b' })`. He looks like a different man at game distance and close up.

## Clips: `assets/anim/clips.{json,bin}`, 121 KB, built by `tools/gfx/clips.py DUMP OUT tools/gfx/clips_spec.json --cmu DIRS`
| name | source | note |
|---|---|---|
| stance | 15_13 69.10-70.05 | loop, 2.0 s after stretch, motion shrunk to 50% around the mean |
| jab | 14_01 L 41.18 | |
| cross | 14_01 R 27.70 | |
| hook | 14_03 L 17.08 | lead hook |
| hookR | 14_03 R 39.32 | rear hook. Looked at on the rig through `PUNCH_DEF.hookR`, lands on the head. The sim does not throw it yet |
| upper | 14_03 R 11.95 | rear uppercut, loads low and rises |
| bodyL, bodyR | 14_03 L 27.20, R 29.14 | |
| knockdown | 90_18 0.62-3.15 | RugPullFall, on his back |
| getup | 140_08 0.05-5.62 | Get Up From Ground Laying on Back, sits up, crouches, stands |

Rejected after looking at contact sheets: all southpaw takes (the subjects switch stance, found by foot position at each punch), the earlier 13_17 uppercut and the 15_13 left uppercut (fold too far forward), wide swings 15_13 L 64.71 and 68.37 as hooks, 90_16 (a dive), 139_18, 111_06, 140_09, 139_16, 139_17 (rolls and crawls, or face down).

**Slip is not a clip.** I cut eight candidate windows from the boxing takes (largest sideways head moves) and looked at them from the front: all are repositioning or stance changes, none is an evasive slip. So the slip is procedural in the rig, driven by `slipT` and `slipDir`: head 17 cm off the line and 7 to 9 cm lower by .18 s, inside the sim's .04 to .22 evade window.

## Reach: `gfx/arena/reach.json`
Largest centre-to-centre distance where the glove touches with a believable elbow. Gap read from nearest glove vertex to nearest skinned vertex of the real head or torso at `punch.t == contact`.
| punch | measured | gap there | elbow | top-level value for the sim |
|---|---|---|---|---|
| jab | 1.06 | 0.4 mm | 170 | 1.05 |
| cross | 1.11 | 0.5 mm | 172 | 1.10 |
| hook | 0.92 | 2.3 mm | 128 | 0.91 |
| upper | 0.99 | 1.4 mm | 110 | 0.98 |
| bodyL | 1.17 | 7.3 mm | 130 | 1.09 |
| bodyR | 1.10 | 6.7 mm | 131 | 1.09 |
minSep .72 kept: at .72 in stance, glove to other torso 7 to 11 cm and glove to glove about 4 cm (it moves with the stance loop), torso to torso 28 cm.
Top-level is measured minus 1 cm of margin. bodyL is held to the bodyR value by choice, so a lead body shot does not outrange the cross. Change it if you want; it still touches. These replace the sim's defaults (jab 1.12, cross 1.15, hook .98, upper .88, body 1.02), so the sim's balance tables want a re-run after `setReach`, and the AI reads `REACH` so it follows.

## Verified, and how
All numbers from `gfx/dev/rig-bench.js` through `tools/gfx/run.sh site/gfx/dev/rig.html`, on the real `sim.js` and `ai.js` where it says so.
- Planted foot: 0.000 cm of movement while planted, over 3 full AI fights (3873 planted spans, both fighters), plus 40 s at 24 fps with 120 ms hitches. IK error at the foot 0.000 cm. No NaN.
- Glove at contact on the real sim, 3 fights with `hard` AI and the final reach table: jab n=59 max 9 mm, cross n=38 max 1 mm, hook n=4 max 3 mm, upper n=5 max 2 mm, bodyL n=8 max 8 mm, bodyR n=9 max 7 mm. Blocked shots n=49 land on the guarding glove (exact to the aim point). An earlier 4-fight batch had cross n=47 max 19 mm, hook n=9 max 5 mm.
  One outlier in about 250 landed punches over the last two batches: a jab landing on the same tick the round bell ends the round. The sim nulls `punch`, the arm is already going home: 17 cm gap for one frame, on the bell.
- First step from a standstill: forward L, back R, his left L, his right R.
- Warning bands (glove height against head centre, stance, 8 s): fresh -5/-4 cm, head 15 -13/-12 cm, head 19.5 -19/-18 cm, gassed -10/-9 cm. Longest blink .08 s fresh, .28 s from 13 up. Head sway range over 8 s: 9 cm fresh, 22 cm from 15 up.
- Cost: `updateBoth` for the pair 0.09 ms per frame. Fighter load 128 ms at 1024 textures. 6 draw calls per fighter plus shadows.
- Looked at: contact sheets of every clip on the real fighter, every punch at reach and at .78 from his left, cross, uppercut and right body shot also from his right, knockdown and get-up on the stand-in and on the real sim in the real stage, slip, guard, bands, winner and loser, walking, gait at speed, face states, hand and glove close-ups, stage shots at hits and blocks. Shots are under the scratchpad `shots/rig/`.

## Not done, or not verified
- `index.js`, `fightcam.js` and `fx.js` did not exist yet, so nothing here has been run through them. `stageFight()` in the bench stands in for that join.
- `TUNE.getUpTime` is 1.2 s, so `getup` runs about 2.8x real speed from sitting to standing. It reads as hasty but fine. 1.6 to 1.8 would look better. If you change it, pass the same value as `getUpTime` to both rigs.
- Sweat and flush follow `fat`, stamina and match time through the existing skin uniforms. I saw droplets in stage shots but did not tune them.
- Low preset: rendered in the real stage with the real sim for 13 s (no subdivision, `q.name === 'low'`) and it looks right. Foot and gap numbers were only run with subdivision on, which does not touch them.
- Stage lighting gives hard glove and forearm shadows on the chest and some shadow acne stripes on skin in my test lights. I did not chase that: it depends on the stage's shadow settings.
- Rerunning `tools/gfx/gear_tex.py` overwrites `glove_*.webp` with the old look. Run `glove_tex.py` after it, or remove `glove()` from it. It was outside my files so I left it.
- Rebuilding clips or the face needs raw sources I deleted to save disk: fetch from `github.com/una-dinosauria/cmu-mocap` (`data/090/90_18.bvh`, `data/140/140_08.bvh` are kept for now) and Rocketbox `Assets/Avatars/Adults/Male_Adult_12` (`Export/*_facial.fbx`, `Textures/m007_head_*.tga`), then dump with `lab/dump.html`.

## Credits to carry
CMU mocap takes 13_17, 14_01, 14_03, 15_13, 90_18, 140_08 (standard CMU credit line). Microsoft Rocketbox `Sports_Male_01` and `Male_Adult_12` head textures and shape (MIT). Leather tile is the Poly Haven one already in the manifest.
