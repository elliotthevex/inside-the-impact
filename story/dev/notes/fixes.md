
## Fixer art+pieces (visual review, 11 findings): 11 fixed, 0 skipped
Files: story/pieces.js, story/art.js (+ notes pieces.md, art.md). All 11 findings were real (checked in code,
headless joints, and the browser). Details in pieces.md / art.md under "Fix pass".
1. FIXED (major, pieces.js shopWindow). `shop.interior` store|diner|laundry|bar|liquor|gym|pawn, inferred from
   the sign; each draws its own interior (washers with round ports, counter + stools + booths, bottle shelves +
   bar + BEER neon, bags + mirror, guitars + case + bars, shelves). Lit glass amber[3] -> amber[1] with a darker
   lower third, mullion, one OPEN card per storefront; shop light k .85 -> .6 (per interior), halo .6, and a new
   light field `core: false` removes the lens glare. Jin in front of the laundromat reads in colour again.
2. FIXED (minor, building fire escape). Over a shop the fire escape draws before the storefront and the drop
   ladder stops above the sign, or is drawn stowed when there is no room. "MARGE'S DINER" and "DELGADO GROCERY"
   read whole.
3. FIXED (minor, reflections). New S.light.reflections(); under world.js pieces.js registers a 'back' draw hook
   through the public S.world.addDraw (no world.js edit) that draws reflections in world coordinates under the
   hook's transform, and composite skips them that frame. Verified in sb_street at zoom 1 and 1.6: the
   front-layer sedan carries no streaks. The gallery (no world.js) still draws them in composite.
4. FIXED (minor, bus_stop). Plate sized from the text, centred on the pole ('ROUTE 14' fits).
5. FIXED (minor, art.js hook/uppercut). Matched to combat's new tune from the combat fixer (hook reach 18,
   arcReach 30, uppercut 16): fist peaks hook 17.9, uppercut 15.2 (+~3 px step = 2–3 px past reach, like jab
   and cross). Hook smear now peaks at x 24.
6. FIXED (minor, scale). Container 158 x 68 (h settable), hydrant 21, mailbox 32, forklift guard 56 / mast 58.
7. FIXED (minor, enemy looks). Thug hoodie '#6e5a40' (tan rather than the suggested red-brown, which sat on
   red brick), collector coat '#5a4a3c' / '#6e6256', slacks '#3a3a42'.
8. FIXED (minor, palette). PAL built from S.pal where a counterpart exists (brick, brick_red, metal, wood, amber,
   ink, night, shadow, plum, charcoal, neon, rust); lamp = S.pal.glow, new bulb = S.pal.lamp.
9. FIXED (minor, art.js dust). dust(ctx, x, y, k, wet); wet defaults to S.weather.wet(S.world.loc), so
   combat.js needs no change: pale blue-white splash arc + ripple on wet ground, dust alpha ~.8 early.
10. FIXED (minor, arena). stage_lights/spotlight default to warm tungsten (PAL.tungsten '#fad395', bulb lenses);
    shaft .6 -> .35 (stage) and 1 -> .6 (spot) in smoke. The arena's ambient is already '#1a1420'.
11. FIXED (minor, newspapers/graffiti). Folded tabloid with headline bar + loose sheets, one curling; graffiti is
    a bubble-letter throw-up (outline, shadow, muted fill, counters, drips) plus a thin tag.
Checks: syntax OK (pieces.js, art.js); headless load okEngine, 0 problems/warnings; sandbox 29/29; chapter 99
--render reached the end, 61 frames, no errors; locations --render 3/3; a stub-canvas probe drew every piece
type plus 800 storefront/prop variants, composite and reflections with no errors. Browser: pieces.html scenes
and gallery, play.html?ch=99.
Not done (not my files): dev/pieces.html gallery cells for container and forklift now clip; its Kessler scene
could call S.light.reflections after the back layer to show the occlusion there too.

## Fixer combat+activities (movement review, 10 findings): 10 fixed, 0 skipped
File: story/combat.js (+ notes combat.md). Each finding was reproduced headless on the old file and checked again on
the new one. After the fixes: syntax ok, `load` okEngine (chapter files still missing, as before), `sandbox` 29/29
(also with --render), `chapter 99` finishes with no errors. activities.js needed no change.
1. (major) A press during hit-stop is buffered: C.update reads Jin's input on frozen steps, input is read once per step,
   and the buffer, combo-chain and return-cross windows count down in Jin's time, not S.time. Tap during a jab's freeze
   → jab, cross (was jab only); jump pressed in an uppercut's freeze now jumps.
2. (major) Counter needs a press after the evade: slipSuccess stamps j.evadeAt and drops an older buffered punch;
   choosePunch gives 'counter' only for later presses. Punch 1-5 steps after slip → no counter (was a counter every time).
3. (major) Flurry hits and the finisher land on art.js's drawn punch peaks (FLURRY_ART in combat.js: 6 punches over
   0.5 s, each fist out 45% into its slot, finisher 0.06 s after the burst), with handSpeed applied to both. Fist x at
   each hit is now 19.7-20.9 px (finisher 23.2), was 6-20 px.
   NOTE for art: if art.js changes the 'flurry' pose timing, update FLURRY_ART in combat.js to match.
4. (minor) 'slip' {ok:false} flags fixed: late = met before the window (slipped too late), early = after it or after
   the slip ended. Added `unslippable` for a push/grab.
5. (minor) Coyote time no longer grants a ground dash: a dash off a ledge is the one air dash.
6. (minor) A held direction turns the punch whenever a hostile is within 70 px that way (returning cross excepted).
7. (minor) Boxer read now catches a run of light straights (third jab/cross/returnCross with < 0.25 s between punches,
   hooks continue the run; slip/dash/guard/step back/hit resets). Press every 0.1 s or 0.25 s → read; every 0.5 s → none.
8. (minor) Hook reach 24 → 18 and arcReach 34 → 30, uppercut reach 20 → 16, to match the drawn fist (art.js was not
   mine to widen). arcReach 30 keeps the two-man hook for bunched men; if art widens the hook arc, the visual will match.
9. (minor) Braking from a run uses art 'brake' (brakeTime 0.16 s, ends on any input); full-speed reversal uses 'turn'.
10. (minor) White hit flashes follow settings.flash: ≥ 0.5 white, below that '#c9d3dc', 0 none. (world.drawActor does
   not pass tintK, so strength cannot be scaled from combat; telegraph tints stay on purpose.)

## world.js (visual review) — 3 fixed, 0 skipped
1. FIXED (major, zoom resampling, world.js setupRenderCam/applyLayer/blit). Real: zoom was a setTransform on the
   640x360 canvas, so nearest-neighbour dropped/doubled rows and fillRect edges blurred. Now every world pass
   draws at zoom 1 (into the frame at zoom 1, unchanged path; else into a ceil(640/z)+4 x ceil(360/z)+4 scene
   canvas) and the scene is scaled once onto a frame at the display's own resolution (K = S.main view k), so
   s = K*zoom >= 1 device px per world px and no source pixel is dropped. Screen-space passes (sky, weather,
   lighting, screen hooks, post fx) draw in logical coordinates under a K transform. main.js (not mine) still
   blits the logical canvas after world.render, so a zoomed frame is drawn onto S.main.dctx in a microtask after
   that blit (before paint); the logical canvas keeps a nearest copy. Effective zoom = max(cam.zoom, 1/K), and
   screenPos/toScreen use it. Verified in play.html?ch=99 at K=4: runs of 3/4 device px at .9, 4/5 at 1.15,
   zoom 1 byte-identical to the logical upscale. Sit default zoom kept at 0.9 (brief: zoom out for distance);
   with the fix nothing is dropped at K>=2. Note for main.js: calling S.world.render(S.main.dctx) directly
   would make the microtask unnecessary.
2. FIXED (major, no haze). Real: hazeFor was never called. bakeLayer now tints far/mid chunks with
   S.backdrop.hazeFor (source-atop, as dev/pieces.html); animated far/mid pieces get the same haze through a
   scratch canvas. Yard region contrast (sd) 16.6 -> 14.5.
3. FIXED (major, cues dimmed by lighting). Real: spark core 160 instead of 255 at dark .42. New emissive buffer
   composited after S.light.composite: world fx kinds spark/smear/ring/text (opts.emissive overrides),
   particles with p.emissive, combat.drawOver (sparks, slip streaks, telegraph '!', HP bars, counter chevron;
   world's direct call precedes combat's 'effects' hook, and combat's once-per-frame guard skips the hook),
   actor tint flashes (a flat tint silhouette at art's strength) and a new 'emissive' addDraw stage. No
   combat.js edit needed. Spark core now 253, gold telegraph keeps its colour. Trade-off: these cues now draw
   over front/fore pieces.
Also (world.js, found while restructuring render): S.activities.draw was called directly and through its own
'back'/'front' hooks, drawing its marks twice; the direct call now runs only when activities did not register hooks.
Checks: syntax OK; headless load (no failed/errors; chapters c00-c10 missing as before), sandbox 29/29,
locations --render 3/3, chapter 99 --render reached end; headless zoom matrix (z 1/.9/1.15/.6/1.5/.25 on 640 and
1920 targets, debug + double + blur) with no errors.
