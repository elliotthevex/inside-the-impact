# pieces.js — builder notes

Status: IN PROGRESS (restart: read story/pieces.js; sections are marked `/* ── n. ... ── */`; the file ends with `/* @@END@@ */` while being written).

Owner files: `story/pieces.js`, `story/dev/pieces.html`.

## Decisions (so far)
- Coordinates: pieces draw in their layer's world coordinates. `x` is the LEFT edge for pieces that take `w`, the horizontal CENTRE for fixed-size props. `y` defaults to `L.ground` (300) and is the line the prop stands on; for wall-mounted pieces (poster, flyer, notice, sign, window, picture, clock, tv, radio, mirror, phone_wall, med_monitor, bulletin_board, chalkboard, art, window_city, billboard, banner, graffiti, mural, catwalk, pipes) `y` is the TOP edge.
- `draw(ctx, p, L, bake)`: `bake` is a boolean, true when world.js bakes the static layer. Animated pieces draw their static part in `draw` and moving parts in `drawAnimated(ctx, p, L, time)`.
- Screen-space helpers (`S.backdrop.draw`, `S.weather.draw`, `S.light.composite`) draw on an identity-transformed 640x360 context. `cam = {x, y, zoom}` where x/y are the world coordinates of the view's top-left at zoom 1 and zoom scales about the view centre.
- Weather particles use a private seeded PRNG so cosmetic effects never consume the gameplay `S.rand()` stream; no `Math.random()` anywhere.
