# Polish pass notes (Street Fight 3D: how it reads and feels)

Status: code done. Restart 3, at the bottom of this file, is the newest word: it says what ran on the final code and what is still open. fps numbers in this file are under macOS Low Power Mode with other jobs running (load average 30 to 70).

## What changed, by problem
- A, fighters go black. New gfx/people/charlight.js: `withCharLight(material, gainVec3)` adds to the fighter materials only (skin, trunks, boots, gloves) a soft fill from above the lens that only makes up what the room does not give, a thin rim on the edges facing the lamp, and a soft limit on the hottest direct light. Numbers per preset in engine.js PRESETS (charFill, charRim, charSoft), applied by `setCharLight(q)` from index.js, also on a quality change. Rival skin has a per-channel gain (2.3, 2.8, 3.1 on the head, 2.8, 3.4, 3.8 on the body) because his albedo is about a third of the player's and redder (linear median .115 against .337). The key's direction and shadows are untouched. Nothing in the room's shaders changed.
- B, too much blur. Post has a sharp zone around the focal plane (`post.sharp`, driven by `cam.getSharp()` so it always reaches both men), a far clamp (`post.maxCoc` .006), and a hard cut on near-field blur (`post.nearScale` .25, `post.nearMax` .002). Fight aperture .013, was .016, and because of the sharp zone the blur on the canvas is gone, not just smaller. Wide shots, intro, between rounds, end, run at a fifth of that. Aperture is also scaled by the lens, so a tall screen's wider lens gets the same look. Taps 16 on high, 12 on medium, were 32 and 16. Post patches folded into post.js with the same output, see below.
- C, high darker than low. The main cause was a bug in the grade: contrast was a straight line around .18, which sent everything under .01 linear, about 25/255 on screen, to pure black. It is now a power around mid grey. Vignette .36 (was .55), AO strength .5 (was .85), contrast 1.18, saturation .95.
- D, graphics. Every banner is a lower third (ROUND, TIME, DOWN and count, KO, TKO, STOPPED, DECISION), or a top zone on a tall screen where thumbs own the bottom. FIGHT is a small tag under the clock for .42 s plus a .18 s fade, and the same tag after a get-up. Call tags: one at a time, cleared on a knockdown and at the end. The end panel docks to the right (bottom on a tall screen) and the camera slides the men out from under it with a view offset (`cam.setShift`, `hud` option `onEndPanel`). Also: hint bar goes when someone is down, a banner sits above the hint bar while it shows.
- E, camera. Dead zone with edge tracking in place of a proportional follow: still until the line is .66 rad off the aim, then it slides along with the line and stops when the line comes back. Aim is .08 rad behind the player's shoulder of side-on, because with both men orthodox a square view shows the rival's back. Between rounds and in the intro it holds a wide view side-on to the line between the two corners. A little slack in the frame centre (.14 m) and in coming back in (.3 m), so footwork does not move the picture. Posts fade from 3.9 m (was 2.8) and always when within 1.3 m of the lens. A tall screen may open the lens further against a wall, which took a man leaving the frame from .123% of frames to .003% on the bench.
- F, low crowd. Crowd heads keep a finer cell on every preset and carry a per-vertex face shade (eye sockets, brow, under the nose, mouth), one more float per vertex and about 2% more triangles (302k against 296k on low, same camera). On low the crowd's light is also a fifth dimmer, since nothing blurs it. High and medium need the face shade as well now that depth of field no longer hides the faces.
- G, get-up. index.js passes `TUNE.getUpTime` to the rig at load: rig 1.7, sim 1.7, measured rise 1.70 to 1.716 s. Three snaps fixed in rig.js: a fast mash could start the rise while the stir weight was still low (head 6.11 m/s), a first AI mash popped the weight (foot 8.74 m/s for a frame), and the end blend was .24 s (now .37 s, from .78 of the rise). The sequence reads well at this length: he lies still, stirs with the mash, sits, crouches, stands, guard comes up.

## Tools (scratchpad polish/, the two benches also in gfx/dev/)
- gfx/dev/lightbench.js: on the real engine, stage, fighters and rig, men in stance at centre and near two corners, camera at 8 azimuths. Face and torso mean sRGB luminance from an id mask and bones, plus whole-frame stats at 6 fixed cameras. lb2.sh TAG APERTURE presets runs it, lbshow.py prints it. Contact sheets lb_TAG_q.jpg, lbb_TAG_q.jpg, lbf_TAG_q.jpg.
- gfx/dev/cambench.html: real sim, real AI, real camera, fake rigs, about 70000 fight frames in 2 s. `runCam(orbit, n, seed, {aspect, dt, aiSide})`, `lineStats()`, `lazy()`, `counters()`.
- foldshot.js, fs.sh, fdiff.py: bit-exact frame compare with seeded Math.random. Object UUIDs need their own random stream: each three object takes four numbers, and the rope tape texture is painted with Math.random, so a different object count moves the rope pattern.
- getup.js, gu.sh: real knockdown through the sim's own code, speeds of head, pelvis, feet, bones frame by frame, contact sheet.
- syncms.js, ab.sh and oldsite/ (git HEAD's gfx with today's sim and ai): cost, old against new, alternating under the same load.
- play.js, drive.py, show.py: copies of integrate/ with extra measures (banner over men, posts, between rounds, camera at rest) and two test fixes: the stick check measured after a screenshot of unknown length, the mash check tapped during hit-stop and slow motion. A direct test of taps while down passes with both.

## Numbers
### Fold of Post patches into post.js
Same frame, old code against folded code, 1280x720: high 0 pixels differ; medium 246 pixels differ by 1/255, the same size as run-to-run noise on old code (262 pixels by 1/255).

### A. Mean sRGB luminance, men at centre and near two corners, camera at 8 azimuths, 1280x720
tp_ex1.png, the look to aim for: player face 158, chest 142; rival face 128, chest 81.
| preset | man | face before: min-max, worst/best | torso before | face after | torso after |
|---|---|---|---|---|---|
| high | player | 26-147, .17 | 17-127, .13 | 97-163, .59 | 98-149, .66 |
| high | rival | 7-103, .07 | 3-114, .03 | 81-120, .67 | 72-119, .60 |
| medium | player | 41-170, .24 | 13-127, .11 | 111-177, .63 | 101-150, .67 |
| medium | rival | 8-126, .06 | 3-115, .03 | 95-135, .70 | 80-120, .66 |
| low | player | 32-129, .25 | 15-110, .13 | 88-145, .60 | 78-129, .61 |
| low | rival | 7-95, .08 | 4-94, .04 | 74-106, .70 | 67-99, .68 |
Target was worst view at least 60% of best, no face under about 45. High player face is .59; everything else meets it. Lowest face on any preset 74.
Fill against key, in linear light on screen: on his most lamp-lit views the fill adds about 0 to 10% (on a face right under the lamp the soft limit takes off a little more than the fill adds); on unlit views the fill is nearly all there is, and his worst total is .27 to .37 of his best total, so about a third. In scene-linear terms it is more than that on the rival: his fill alone is .84 of his lamp alone at their maximums, because his albedo needs it. By eye he still reads as brown skin with shape, not grey. The player's is .47.

### C. Whole-frame mean sRGB luminance, same camera, lamp sway fixed
| camera | low | high, ratio to low | medium, ratio | before: high, ratio | pixels under 4/255, high now / before |
|---|---|---|---|---|---|
| side | 48.8 | 46.3, .95 | 47.0, .96 | 35.6, .75 | 8% / 20% |
| diag (half the frame is a post) | 33.0 | 27.6, .84 | 28.3, .86 | 18.6, .57 | 6% / 22% |
| end | 48.8 | 45.9, .94 | 46.3, .95 | 35.6, .74 | 6% / 20% |
| back | 50.4 | 47.7, .95 | 48.2, .96 | 36.7, .75 | 6% / 20% |
| wide | 36.2 | 34.6, .96 | 35.3, .98 | 26.3, .73 | 15% / 32% |
| wide2 | 36.2 | 33.2, .92 | 33.6, .93 | 24.3, .68 | 14% / 33% |

### B. Cost, same camera, frame forced to finish, old and new alternating, machine at load average about 50, so medians swing 2x from noise; best tenth of frames
high 1280x720: old 16.2 ms, new 14.6. medium: old 14.5, new 13.6. low (no depth of field): old 8.2, new 8.2. Frames as fast as the browser takes them with the real game, two 3 s windows, alternating: high 1280x720 old 25-38, new 28-62 fps; high 1920x1080 old 13-34, new 15-38; medium 1920x1080 old 38-52, new 35-57; low 1280x720 old 103-123, new 98-112. So not more expensive on film presets; on low the two ranges overlap with the new one a little lower, and the sync numbers say equal.

### E. Camera, bench, 10 matches per seed set, same seeds, 60 fps
| | old | new |
|---|---|---|
| mean orbit deg/s | 43.7 | 31.5 to 34.4 |
| at rest, % of fight frames | 5 to 7 | 41 to 45 |
| within 45 deg of side-on | 91.6% | 88.1 to 89.9% |
| player on the right | 0 | 0 |
| out of frame landscape / portrait | 0 / .123% | 0 / .003% |
| max rate rad/s (cap 3.4) | 3.32 | 3.4 |
**The 20 deg/s target cannot be met by a camera with this AI.** The line between the men turns 53 to 57 deg/s and swings about 200 deg in 8 s, net near zero: the AI circles a man a metre away. An ideal lazy camera with perfect foresight still has to turn 35 deg/s to stay within 35 deg, 33 deg/s at 45 deg, and 25 deg/s even with an 88 deg dead zone. For whoever owns ai.js, what-if on the bench only, not applied: the AI's sideways speed at 50% gives 24 deg/s with this camera, at 25% gives 19.7.

### D. Counter tag on both sides
The sim flags `counter` when the target is in startup or recovery, and each man's tag stayed .85 s. 20 bench matches: 1888 hits, 552 counters, 58 times the other man's tag was still showing, never on the same frame, gaps .05 to .77 s, median .33 s. So each tag was true and the display made two trades read as a contradiction. The HUD now shows the latest call only.

### G. Get-up, head speed m/s at the start of the rise, before and after
Player mashing fast: 6.11 to 1.78. AI: 3.03 to .91. Foot while down, AI: 8.74 to under 3. End blend: about 4.2 to about 3.5 to 3.8.

## Log
- A (first pass): gfx/people/charlight.js adds a soft fill and a thin rim to the fighter materials only; per-preset charFill, charRim in engine.js PRESETS, setCharLight on quality change. Rival skin has a per-channel gain (his albedo is about a third of the first man's: linear median .115 against .337).
- B, C (first pass): post.js contrast was a straight line around .18 and crushed everything under about 25/255 to pure black. It is now a power around mid grey. Vignette .36, contrast 1.18, saturation .95, AO strength .7. DOF has a sharp zone (post.sharp, cam.getSharp), a hard cut on near-field blur, far clamp .006. Taps 16 on high, 12 on medium, was 32 and 16.
- E: line between the men rotates about 53 to 57 deg/s. Ideal lazy tracker with perfect foresight still needs 33 deg/s to stay within 45 deg, 25 deg/s even with an 88 deg dead zone, so the 20 deg/s target cannot be met by a camera alone with this AI. Experiment on the bench only, not applied: AI sideways speed at 50% gives 24 deg/s, at 25% gives 19.7.
- D: all banners lower thirds, see above. HUD bench looked at 1280x720, 844x390 touch, 390x844 touch, 360x640 touch large text, 1280x720 large text; overflow report empty.
- G: rig reads TUNE.getUpTime at load (rig 1.7, sim 1.7, measured rise 1.70 to 1.716 s). A fast mash could start the rise while the stir weight was still low, so the pose jumped: head 6.11 m/s at the start. A first AI mash popped the weight from .65 to 1: foot 8.7 m/s for a frame. Fixed in rig.js: stir rate limit, weight rate limit, longer weight ramp at the start, fight pose blend from .78 of the rise. Now head .9 to 1.8 m/s at the start, foot under 3 m/s while down, about 3.5 m/s head at the end blend.
- F: crowd heads keep a finer cell on every preset and carry a per-vertex face shade (eye sockets, brow, under the nose, mouth).
- Counter tag, why both showed: the sim flags `counter` when the target is in startup or recovery, and each man's tag stayed .85 s. 20 bench matches: 1888 hits, 552 counters, 58 times the other man's tag was still showing, never on the same frame, gaps .05 to .77 s, median .33 s. So each tag was true, the display made two trades read as one contradiction. HUD now shows only the latest call and clears calls on a knockdown or the end.
- Camera, bench, same seeds, 60 fps, 148000 frames: old mean 42 deg/s, within 45 deg 92%, at rest 7% of frames. New mean 35 deg/s, within 45 deg 93%, at rest 42% of frames, player on the right 0, out of frame 0. Target of 20 deg/s not reachable with this AI, see above. For whoever owns ai.js: 50% of the AI's sideways speed gives 24 deg/s, 25% gives 19.7 deg/s, with the same camera.
- Fill against key, in linear light on screen: on his most lamp-lit views the fill adds about 0 to 10% (the soft limit on direct light takes off about as much on a face right under the lamp); on his unlit views the fill is nearly all there is, and his worst view's total is .27 to .37 of his best view's total, so about a third.

## Restart 3 (Nov 6, 10:40): where this picked up
Commit 063f451 holds the polish code. Read the code against this file: charlight.js, post.js, engine.js PRESETS, fightcam.js match what is written above. Last run on disk (fin_high) stopped at the usage line after one match of four, so the final high and low runs and the gates still have to be run. 5-hour usage 0% at the start of this restart. The Mac is on battery, 43% at 10:41.
- E, lower bound. New: a dynamic program over the real line angle, 20 bench matches, least total turning for a camera that knows the future. Hard limit 85 deg off side-on, within 45 deg on 85% of frames: 24.8 deg/s. Hard limit 60 deg: 28.3 at 91%. Within 45 deg always: 31.1. Skilled bot alone, 85 deg limit: 30. So no camera reaches 20 with this AI: the men go round in one direction, and that net turn has to be followed or the player ends up on the right. Tried also: a slow follow past the dead zone (soft zone, 35 settings): 27 to 33 deg/s with only 36 to 65% of frames within 45 deg, worse than the plain dead zone at every point, so not kept. Dead zone .75 gives 32.0 and 72%. Kept: .66, 33.3 and 89.7%. Tool: gfx/dev/lazydp.js, run with cdp.py --js on gfx/dev/cambench.html.
- Small fixes in this restart: charSoft on high 22 to 20, which brings the player's face worst/best from .59 to .60 (96-161); KO and TKO burst now fades out over 1.5 s instead of staying over the men (rest state opacity 0, so Reduced Motion shows none); at the end the camera frames the winner's raised hand (WIN_TOP 2.5 m), it was touching the health bars. Final runs on this code started 10:52 through polish/final.sh: fin_high, fin_low, fin_tp, fin_tl, fin_rm, then the three gates still to run.
- fin_high done 11:17 on this code: 4 matches on the real page, TKO, KO, TKO, stopped; all pause, reopen, settings, live quality, load and fallback checks ok. Camera: player on the right 0 frames, out of frame 0, within 45 deg 89.4, 89.8, 84.3, 93.1%, mean orbit 28.4, 28.8, 46 (hook spam), 26.3 deg/s. fps 25 to 50 with load average 30 to 100 and Low Power Mode. Looked at the TKO, STOPPED, KO and FIGHT frames: men visible under all. The overlap measure in play.js takes the word's whole box at its largest, and reports KO body 1, head 1 in one frame at some point; the KO frame I looked at has no overlap. Added a shot on the first frame a banner box covers a head, to see it.
- fin_low done 11:22: 2 matches on the real page, KO, stopped. Looked at intro, exchange, break, DOWN, get-up, KO, STOPPED, end panel: clear, men visible under every graphic, crowd reads as people. Touch and reduced motion runs going next, then gates.
- fin_tp (portrait touch, medium, TKO), fin_tl (landscape touch: stick, all six punches, guard, slip, pause, resume, mash, resize), fin_rm (no slow motion, no dolly, no push, shake setting) all pass. fin_tl's first attempt lost its Chrome (websocket EOF) after the Jab button at load average about 50, and a light bench run did the same at 10:51 at load average 100; both passed unchanged on the next try, so I put it down to the loaded machine, cause not proven. No Chrome crash report on disk.
- Last small changes, 11:40: KO and TKO word slams from scale 1.9, was 2.8 (it crossed both men for .15 s); KO flash .5 for .3 s, was .75 for .36 s (a milky screen for a third of a second over the very moment); camera rate limit 2.2 rad/s while the line is under .8 rad off the aim, full cap 3.4 beyond it, so a quick swing does not whip the room past (bench: mean same, within 45 deg about 87.5 against 89%, nobody out of frame, player never on the right). Final run on this code going: polish/final3.sh, then the gates.

## Restart 3: result (11:55)
Final code ran on the real page through the real Mode Select card and real key events (polish/final3.sh, results in polish/f3_high.txt, f3_low.txt; final.sh for the longer set just before the last three small changes). sim.js and ai.js were changing during this (11:45 and 11:49 last), so match lengths and endings are whatever was on disk at each load. All fps below are under macOS Low Power Mode with load average 30 to 100: they say nothing about cost, the cost numbers are in section B.
- High, final code: skilled TKO round 3, 43 fps; mixed stopped round 3, 46 fps. Low, final code: skilled stopped round 3, 25 fps (machine busy). Feet 0 cm in all, NaN 0, no page or console errors beyond the two old 404s, memory flat at 11 MB heap in the longer set.
- Gates on site/index.html, final code: jscheck ALL SCRIPTS PARSE, parity 3bea3b59, smoke pass true, 20 run. index.html not touched.
- Longer set just before the last small changes: high 4 matches (TKO, KO, TKO, stopped), low 2 (KO, stopped), portrait touch (TKO), landscape touch, reduced motion: every flow check ok (pause, Esc, restart, exit, reopen 3 times, Low Detail, volume, Shadows off, Text Size large, live quality switch, load screen, Esc during load, all four fallbacks, touch stick and buttons, mash, resize, no slow motion, no dolly, shake off).
- Looked at, all on real-page frames: intro, FIGHT tag, exchanges, native-size crop of both men, break, DOWN, get-up, TKO, KO, STOPPED, end panels at high; the same at low; portrait.

### E, final numbers
| | target | bench, 20 matches, 60 fps, current AI | real page, high skilled / high mixed / low skilled |
|---|---|---|---|
| mean orbit deg/s | 20 | 34.7 (old camera on an older AI 43.7) | 38.1 / 26.6 / 32.8 |
| within 45 deg | 85% | 86.0 and 86.4 on two seed sets | 77.8 / 90.3 / 87.2, together 85.0 |
| player on the right | at most .1% | 0 | 0 / 0 / 0 |
| out of frame | 0 | 0 | 0 / 0 / 0 |
| max rate rad/s, cap 3.4 | | 3.4 | 3.32 / 3.4 / 3.31 |
| camera at rest | | 41 to 44% | 45 / 56 / 46% |
**Mean orbit misses the target and no camera can meet it with this AI.** The least any camera could do, knowing the future, hard limit 85 deg, within 45 deg on 85% of frames: 26.0 deg/s on the current AI (gfx/dev/lazydp.js). The rest of the gap to 34.7 is the price of not knowing the future. What would meet it is the AI's sideways speed: same camera, bench only, not applied, 50% gives 22.4 deg/s and 94.7% within 45 deg, 25% gives 18.7 and 95.4%. That is for whoever owns ai.js to decide, since it changes how he fights. I did not scale it from index.js, because that would quietly change the balance pass's game.
Between rounds: overlap 0 and player on the right 0 in the final matches. In one hook-spam match in the longer set the men had to cross to reach their corners, and they did so under the wide view: 12.5% of that break's frames overlap, 10.4% player on the right. Left.

### Left, or not checked
- Nobody has played this by hand or heard it. 60 Hz on a real display has not been seen. Real phones never run.
- Fill against key: on screen the worst view's total is about a third of the best view's, but in scene-linear terms the fill is above a third of the key, .47 for the player and .84 for the rival at their maximums, because the unlit side has nothing else and his albedo is a third of the player's. By eye he reads as brown skin with shape, not grey. The fighter has no hair mesh of its own (hair is part of the head), so there was no hair material to change.
- No referee figure stands in the ring. A stoppage shows the two men, the STOPPED graphic and its caption, so the moment the game teaches is told in words only. Adding one is an asset job, not a polish fix.
- While a post fades it shows as a stippled ghost for about .17 s.
- At high, body overlap of a banner's box with a man is at most .21 to .36 of his box for TKO, mostly feet of the nearer man at the top edge of the lower third; never his head. FIGHT tag can touch a head box at the top of the frame (.25 at most) for a moment when a man stands near the top; it lasts .6 s and sits under the clock.
- Headless Chrome dropped out twice under load (light bench 10:51, touch run 11:28, both websocket EOF, both fine on the next try, no crash report). Cause not proven.
