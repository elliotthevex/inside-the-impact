# activities.js — builder notes (in progress)

Status: writing `story/activities.js` (contract §7). Restart: read the file; sections are marked `/* ── n. ... ── */`.

## Decisions so far
- ActivityState is also a director Wait: `state.wait()` returns `state.done`, `state.result` is the result (world.js uses the same convention). `A.activity` can yield the state itself.
- Ticking: `S.activities.update(dt)` is idempotent per sim step (stamped by S.time). It is driven by a wrapper installed on `S.world.update` (pre: consume owned actions; then world update; then activity tick; then re-apply Jin pin). The director wait or main loop may also call it; double calls are harmless.
- Director notes say A.activity is not "busy", so real input is live during activities. Activities that must hold Jin still (balance, repair) pin his x/pose after world.update and consume punch/dash/slip/jump/flurry/interact before world.update, so Jin neither attacks nor triggers world interactions. They read input with their own edge detector over `S.input.down()` (not affected by consume).
- Training effects are written only to `S.tune` (exactly one place: `S.activities.applyTraining()`), snapshotting the untrained base values once. Re-applied automatically whenever `G.train` changes (checked every step) or `S.tune` is replaced.
- Drill visuals: DOM overlay inside `#story-root` (top panel + screenPos markers + floating feedback words) and world-space canvas marks via `S.activities.draw(ctx, layer)`; if world.render does not call draw, a render wrapper draws them after the frame using S.cam (top-left, zoom about view centre).
