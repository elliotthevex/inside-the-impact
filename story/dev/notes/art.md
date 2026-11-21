# art.js notes (builder: art)

Status: DONE (run 2). Files owned: story/art.js, story/dev/poses.html.
Restart: everything in the contract (§3) is implemented and browser-checked. Further work is polish only; see "Known gaps".

## What was built
- `S.pal`: named muted palette (blue-gray air and street, brick browns and faded reds, charcoal, plum, green-gray metal, rust, amber light, wood, paper, skin tones skin0..skin6, Jin's colours, UI gold/red, effect colours).
- `S.font.draw / width`: 3x5 pixel font (A-Z, 0-9, . , ' ! ? - : / & # $ ( ) " plus + % = ; * < > _ [ ]), lowercase drawn as uppercase, `\n` for lines, align left/center/right, shadow true or a colour, integer scale. Returns the width. Unknown characters draw as '?'.
- `S.looks` and `S.defineLook`; every LookDef field in the contract: 7 builds, 17 hair styles (+ `shaggy`), 22 top kinds, 8 bottom kinds, shoes, and all 19 extras.
- Built-in looks: `jin`, `jin_ring`, `jin_hospital`, `jin_rehab`, `jin_street`, and the fallbacks `man`, `woman`, `kid`, `thug`, `collector`, `guard`. Extras: `jin_1994`, `jin_ring_robe`, `old_man`, `old_woman`, `nurse`, `suit`, `worker`.
- `S.art.drawFigure` with every contract opt: blendFrom, alpha, tint, squash, lean, carry, speed, flip, scaleX, outlineCol, shadow.
- `S.art.poses`: all 63 contract poses + extras `brake`, `turn`, `climb` (world.js already looks for `climb`). Unknown pose -> idle with one console warning.
- `S.art.poseDuration`, `drawAfterimage`, `drawSmear` (jab/cross narrow streaks, straight longer, hook curved arc, upper upward sweep), `spark`, `dust`.
- `story/dev/poses.html`: 640x360 canvas at 2x, pixelated. Pages: Movement + combat (each pose plus its flat silhouette), Everyday + story, Frame strips 1 and 2 (8 frames per animation), Looks + heads (every look, every hair style at 4x, Jin's head both ways), Effects + scene (dash afterimages, smears, sparks, dust, crossfade combo, tint/outline/alpha/squash/lean/knuckles, the font, and Jin leaning on brick under a streetlight). Controls: look, facing (f), slow motion, silhouettes, scrub slider (freezes every pose at a progress), live toggle (space), arrow keys for pages and looks. Query `?page=moves&look=jin`.

## Exports beyond the contract
- `S.art.joints(pose, t, look, opts)`: headless-safe joint positions (hip, chest, head, hands, elbows, knees, feet) in local space (facing right, feet centre 0,0, y up negative). Useful for fist hitboxes or attaching effects.
- `S.art.lookOf(look)` -> {id, h, build}; `S.art.lookHeight(look)`.
- Colour helpers `S.art.mix(a, b, t)`, `shade(c, k)`, `lighten(c, k)`, `ramp(c)` (5 shades, dark to light), `rgba(c, a)`.
- `S.art.forgetLook(look)`: drop the cached normalised look after mutating a LookDef in place (S.defineLook does this too).
- LookDef `extrasWhen: (G, S) => ['extra', ...]` for dynamic extras (`jin_street` uses it for knuckles from G.gear.knuckles or S.combat.body.knuckles). `hair.under` sets the hair colour that shows under headwear.

## Extra opts that drawFigure reads (for world.js / integrator)
- `k` (0..1): progress override for one-shot poses (combat's actor.poseK). Without it, progress = t / poseDuration.
- `moving` (bool) or `vx` (px/s): legs step in `carry`, `wheelchair` and `push` only while moving. Without either, `speed != 1` counts as moving (that matches what combat sets today). If `vx` is given, walk, run, backstep, limp and carry cycle rates follow it, so feet do not slide. Recommended: pass `vx: a.vx`.
- `shadowY`: ground y for the shadow when airborne (default: the feet y). `shadow: false` hides it.
- `tintK` (0..1): tint strength (default 0.82 for white, 0.55 otherwise; afterimages use 0.85).
- `seat` (px, default 12; bench 11, stool 18, bed 20), `desk` (px, default 20), `bed` (lieBed surface, default 20), `barH` (parallel-bar height, default 32.5), `blanket` ('#hex', lieBed).
- `carry`: object kind string, matched by keyword: crate, groceries/sack, tool(box), bucket/paint, file/record/paper, tray/dish/pot, bag/duffel, tire; anything else draws a cardboard box. In `drink` it picks the container: bottle/beer, can/soda, else a paper cup.
- `blendFrom.k2`: progress override for the pose being blended from.

## Decisions
- Figures render facing right into one shared offscreen buffer, then are blitted (mirrored for face -1) so alpha, tint and outline cover the whole figure without seams. Only the figure's bounding box is cleared and blitted. squash, scaleX and lean move the joints before rasterising, so pixels stay crisp.
- The skeleton is authored for a 46 px figure. Everything below the head scales by (h - 10) / 36. The head is a fixed-size pixel template (7x8 skull + hair), so kids (h ~30) get bigger heads and tall adults read tall. Knees and elbows use two-bone IK with pole vectors; forearms can be foreshortened (`nfs`/`ffs`), which the hook uses.
- Limbs are stamped squares in two passes (dark, then base one pixel smaller and shifted up-front), giving a one-pixel shadow edge on the back/bottom and no outline. Torso, pelvis, skirts and coat tails are scanline polygons (no antialiasing). Far-side limbs are pushed toward a cool dark. Near-black cloth (Jin's pants) lifts the near side a step instead, so legs still separate.
- Upper-face shading is automatic: skin directly under hair gets the deep tone and the row below the mid tone (2 steps for fringes, 1 for hairlines). Heads are cached as sprites per look, wind, scar and rotation. Rotation is quantised to 22.5 degrees, with a dead zone under ~11 degrees so heads do not shimmer.
- Near side = the side facing the camera. Facing right that is Jin's RIGHT side, the rear hand of an orthodox stance, so the scar on his right cheek shows only when facing right (never on a mirrored bed pose). Jab and hook use the far (lead) arm; cross, uppercut, counter and dash straight use the near (rear) arm. During the hook the lead arm is drawn in front of the torso (`ffront`) so the short bent arm reads.
- Punch timing matches combat's phaseMap: fully extended over p 0.35..0.6, with a small load before 0.12 so an enemy windup that holds the punch pose at p <= 0.12 shows a pull-back.
- Jin's relaxed idle (build 'boxer') is a loose half guard with fists at the belt; `guard` is the alert stance (crouched, staggered, lead fist forward, rear fist at the chin). Other builds idle with arms hanging, and their guard sits lower and more upright (a street fighter, not a boxer). Boxer builds walk with loose fists at the belt.
- 1994 vs 1996: the drafts say the scar arrives with fight night. `jin` (canonical, Ch2+) has the scar; `jin_1994` and `jin_ring` (Ch0) do not. `jin_hospital` / `jin_rehab` are slim with grown-out `shaggy` hair (drafts: thinner, hair over the ears).
- `lieBed` is authored head-left and drawn mirrored, so the head points the way the actor faces (pieces' bed puts its pillow on its `face` side). `down` / `knockdown` put the head behind (fell backward). Lying in bed draws no ground shadow.
- `write` is seated at a desk (BRIEF: "write at desk"). A standing clerk should use `idle` plus the `clipboard` extra.
- blendFrom.k = weight of the PREVIOUS pose (1 = all previous, fading to 0), matching world.js `_blend`.
- Base stances are frozen; `kf`/`lerpRig` always return copies. (Run 2 found shadowbox mutating the shared GUARD rig through a keyframe end; this rule fixes it.)
- Errors inside drawFigure are caught and reported through S.fail once per pose.

## Verification done
- `osascript -l JavaScript story/dev/syntax.js story/art.js`: ok.
- Headless (JavaScriptCore, core.js + art.js with S.headless = true): every pose x every built-in look x 6 times through `S.art.joints`, with blendFrom; no NaN, no exception, all 63 contract poses present.
- Browser (poses.html): 26,400 draws over random looks covering every build, hair style, top, bottom and extra, every pose, with outline/tint/squash/lean/blend: no errors, no warnings, no console output. Visual review at 3-5x of every page; fixed body mass, guard vs idle, the hook, hurt recoil, brake, lying legs, kneel foot, leanWall knee, cheer, phone handset, scar placement and stripe contrast.
- Cost: about 0.4-0.9 ms per figure in the (background) preview pane, including heads from the sprite cache.

## Known gaps / ideas
- The shadow sits at the feet y unless `shadowY` is passed (jumping actors need it from world.js).
- No per-frame figure cache. If scenes with many actors get heavy, cache rasterised frames keyed by look, pose, quantised t and the opts signature.
- The `jin_ring` trunks colour and boots are my choice (drafts disagree: navy/blue trunks); cast.js can override any built-in look with S.defineLook.
- The brass/steel knuckles colour follows draft-cinematic ("two gold glints").
