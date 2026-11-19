# world.js — builder notes

Status: IN PROGRESS (restart: read story/world.js; sections are marked `/* ── n. ... ── */`).

Owner file: `story/world.js` (contract §5).

## Decisions so far
- Coordinates follow pieces.js: `S.cam.x/y` = world top-left of the 640x360 view at zoom 1; zoom scales about the view centre. Screen helpers (backdrop, weather, light) are called on an identity transform with the real `S.cam`.
- `S.cam.to({x, y})`: x/y are the CENTRE of view to look at (target actor -> its x, head height).
- Doors and objects are centred on `x` (interaction point). Solids are rects `{x,y,w,h}` with x = left. Ladders `{x,y0,y1}` x = centre, y0 top.
- Waits returned by world (`S.cam.to`, `S.world.walkTo`, `S.world.travel`, `S.world.enter`) have the director shape `{ wait(dt) -> done, result }`; world.update drives them, `wait()` only reports.
- `collide()` integrates velocity and resolves; it does NOT apply gravity (combat owns gravity tuning).
