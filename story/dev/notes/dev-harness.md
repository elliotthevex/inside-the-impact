# dev harness — builder notes (stubs, headless runner, play.html, sandbox chapter, game.js loader)

Status: COMPLETE (run 1). Restart: read this file, then the owned files; everything below is done and verified.

Owned: `story/dev/stubs.js`, `story/dev/headless.js`, `story/dev/play.html`, `story/chapters/c99_sandbox.js`,
`game.js` (contract §12 lines only).

## Verified (2026-11-21, with core/art/pieces/world/combat/activities/director/ui/main on disk, chapters 0–10 not yet)
- `osascript -l JavaScript story/dev/headless.js <root> load` — all present files evaluate, no problems; the 13 chapter
  files not yet written are reported as `missing` (so `ok` is false until they exist; `okEngine` is the engine-only flag).
- `… sandbox` — 29/29 integration checks pass, no errors, all 7 movement-checklist items ticked (≈7 s wall, 60 sim s).
- `… chapter 99` and `… chapter 99 --render` — the autopilot finishes the sandbox in 35 sim s; 69 frames rendered into
  the stub canvas without an error. `… locations --render` — all three sandbox places enter, run their scenes and draw.
- Browser (preview copy via `story/dev/sync-preview.sh`, port 8795): `play.html?ch=99&test=1` passes 28/28 (save/load
  is headless only); the lobby Story Mode card loads the title, Esc returns to the lobby, the failure panel (forced with a
  bad file) shows Try again / Back and Esc backs out; `hotkeysBlocked()` is true while loading, failed, or open.
- Gates on game.js: `python3 -I tools/jscheck.py index.html` ALL SCRIPTS PARSE; `tools/smoke.js` 20/20 pass;
  `tools/parity.js` signature `3bea3b59` (unchanged).

## What is built
### story/dev/stubs.js
`window` = the global object; inert `document` (elements with the methods core/main/world/pieces touch; canvases return a
Proxy no-op 2D context); in-memory `localStorage`/`sessionStorage` (fresh per run); `performance.now`; buffered `console`
(so stdout is clean JSON; the report carries counts and unique warnings); queued `setTimeout` (never fires on its own);
`navigator`, `location`, `matchMedia`, `devicePixelRatio`. No `requestAnimationFrame`, no `AudioContext` on purpose.
Extras on `window.__stubs`: `console`, `timers`, `flushTimers()`, `advance(s)`, `canvasCtx(w, h)`, `drawCalls`.

### story/dev/headless.js
Loads stubs → `window.STORY = { headless: true }` → `story/manifest.js` → every `STORY_FILES` path with indirect eval,
recording per-file `ok | missing | error` (syntax vs runtime) and carrying on. Prints one JSON report; exit 0 when `ok`,
1 when not, 2 on a fatal runner error. The root argument may be omitted when run from the repo root.
- `load` — static cross-reference check: chapter files register their chapter; start loc/scene; every location (builders
  are called with a seeded G for that chapter): piece types exist in `S.pieces`, door targets, npc talk/look/pose, object
  run/evidence/memory/doc, trigger run, firstEnter/enter, ladders/solids shape, training keys; quests (kinds, step target
  locs, autoplay locs, giver), evidence (kind, text/pages), people looks, map-node locs, canon ids; and every scene/dialog
  function's source for `A.goto/sub/queue/parallel/evidence/doc/memory/quest/meet(+note id)/activity/skill/gear/ending/
  sound/ambience/fx('id')`, pose names, enemy `type:` in fight/bout/spawn code. Flags: `readNeverSet` / `setNeverRead`
  (heuristic, warnings only). Problems make `ok` false; warnings do not.
- `chapter N [--real] [--policy p] [--limit s] [--stuck s] [--seed n] [--flags json] [--render] [--log]` — wraps
  `S.test.runChapter`; `ok` = reached the end, not stuck, no errors (and no render errors).
- `campaign <restraint|ruthless|both> [--real] [--limit s] [--render]` — wraps `S.test.runCampaign`; adds
  `expectedEnding` (restraint → own_name, ruthless → champion) and `endingOk`.

### Extra commands (beyond §11)
- `sandbox [--render] [--verbose]` — runs `S.sandbox.selfTest()` (below).
- `locations [--render]` — enters every location of every chapter (not silent: enter scenes run under the 'first'
  policy for 1 s), reports errors per place; `--render` draws one frame of each into the stub canvas.
- `exec <file.js>` — dev helper: boots headless and runs the file as a function body with `(S, T, stubs, args)`;
  its return value is `report.result`. Handy for one-off investigations (scratch scripts stay out of the repo).
- `--render` (chapter/campaign/sandbox): every 0.5 sim s sets `S.headless = false` for one `S.world.render(stubCtx)`
  call, then restores it. It catches exceptions in every render path (world, pieces, art) headless. It may perturb
  determinism slightly (render-time caches); use plain runs for reproducibility comparisons.

### story/dev/play.html
Standalone dev page: loads `story/story.css` and the manifest scripts in order (relative to the repo root, with a
cache-busting query), skips missing optional files (lists them in a small note), then `STORY.open()`.
`?ch=N` starts chapter N directly (via `STORY.open({chapter})`, seeded with earlier canon), `?ch=99` the sandbox (dev
mode, so it is also listed under Chapters), nothing = the title. Also `&test=1` (sandbox self-test panel), `&auto=<policy>`
(the test autopilot plays in the page), `&dev=1`, `&debug=1` (world debug overlay), `&seed=N`. Closing Story Mode shows
"Open again / Back to the game".

### story/chapters/c99_sandbox.js (chapter 99, "Back Lot")
Three places. `sb_yard` (tall map, h 480, ground 420): controls board + an in-world notice sign built from
`S.input.labelFor` (arrows spelled out for the pixel font), bench (Sit, memory), fuse box (repair → yard light rebakes
via piece `when`), run lane, solid crate wall, one-way planks at 44/88/132 px and a far plank across a 140 px gap (needs
the air dash), a dummy and a heavy bag (combat 'dummy'/'bag' actors spawned by the `enter` scene), the bell (one
telegraphed thug, `maxAttackers: 1`, tips), the training corner (all six drills: objects + `LocationDef.training`, Dell as
the reaction/mitts coach), Dell (talk, choices, key, drill menu, breath on/off), the warehouse door (locked with a reason
until Dell's key), a ladder to a walkable rooftop (trigger quest, hidden snapshot evidence, Sit ledge), the crate for
Rosa, an auto edge to the avenue. `sb_warehouse` (interior): trigger → two-wave swarm (3 thugs; thug + enforcer +
director), a shutter to fight again. `sb_street`: Rosa (side quest marker ! / ?, carry across maps), a kid on a looping
path with barks, payphone (choice), newspaper box (document evidence with pages), bus schedule.
Main quest `sb_tour` steps are derived from flags (`tourStep(G)`), so any order works and the autopilot finishes it.
`required: ['sb_yard', 'sb_warehouse']` (the avenue is optional). Looks are inline LookDefs (no dependency on cast.js).

Movement checklist tracker (PDF §10 "Verify that I can"): a post-step hook (registered lazily through `S.main.onStep`
on chapterStart/resumed/enterLoc/open) plus 'hit'/'slip'/'counter'/'launch' events tick `G.flags.sb_chk_<id>` with a
toast: reverse, dashCombo, cancel, slipCounter, launch, switch, airdash. The board's third page lists them.

`S.sandbox.selfTest(opts)` — drives the real engine through the sandbox with `S.test` (virtual keys, `S.main.step`),
policy 'first' with `fights: 'real'`: run/stop/reverse timings vs `S.tune`, dash distance + two sequential charges, backdash
keeps facing, variable jump, plank land + drop-through, wall, air dash once per jump onto the far plank, jab→cross→hook,
dash→jab→cross, recovery cancel into slip, uppercut, bag + target switch, board doc + quest step, locked door reason,
slip a telegraphed strike and counter by hand (presses slip from the enemy's remaining windup), launch + airborne
follow-up, round won, coach choice → key, door opens, swarm (attacker limit ≤ token max, second wave spawns after the
first is downed with `forceDown`, cleared), ladder up/roof trigger/hidden evidence/ladder down, every drill through
`S.activities.train`, repair, edge travel + Rosa + carry across maps + turn-in, barks + payphone choice + newspaper
evidence, save/load (headless only, so a browser run never touches the player's slots), sign out → chapterEnd.
Returns `{ ok, checks:[{name, ok, detail}], checklist, errors, passed, failed, time }`; restores the previous policy.

### game.js (§12 only)
- MODES story entry: `live: true`, subtitle "Calder, 1994. One fight cost Jin two years and his name. Walk his streets
  and find out who took them."; its click calls `window.__openStory()`.
- `window.__openStory` (next to MODES): a `#story-root` placeholder shows "Loading n / N" (so `hotkeysBlocked()` covers
  loading too), loads `story/manifest.js` once, injects `story/story.css` once, loads each `STORY_FILES` path in order
  (relative paths; a file already run is never re-run; optional files that fail are skipped), then removes the
  placeholder and calls `STORY.open({ onExit })`. Failure: a plain panel with the reason, Try again (resumes from the file
  that failed) and Back (Esc too). Later clicks open at once. onExit clears leftovers and blurs focus (the lobby is
  underneath; STORY.close() removed #story-root).
- `hotkeysBlocked()` selector gains `#story-root`.
- Lobby-side CSS fix (found in the browser): style.css has a global `canvas { display: none; border: 4px …; width: 100%;
  height: auto }`, which hid Story Mode's display canvas in the lobby (play.html does not load style.css, so it only
  shows there). The loader injects `#story-root #story-canvas{display:block;border:0;border-radius:0;max-width:none;…}`
  once, next to story.css. Nothing in style.css changed.

## Decisions
- `ok` for `load` is strict (every manifest file present and clean); `okEngine` reports the engine alone.
- Default policy for `chapter N` is main.js's ('first'); pass `--policy restraint|ruthless` for choice-sensitive runs.
- JXA stacks have no file positions for eval'd code: reports carry the message, `line` and the first function names.
- The sandbox writes tracker flags straight into `G.flags` (outside any scene) and emits 'flag' + 'toast' itself.
- Map node coordinates for the sandbox use the 640×360 logical frame (x 260/360, y 190/170) — no convention exists yet.

## Integration findings for other owners (not fixed here: not my files)
1. **world.js / main.js — DOM prompts, barks and markers are mispositioned in the browser.** `S.world.screenPos` returns
   logical px instead of CSS px: `W.viewRect()` looks for `S.main.viewRect()` (main.js has none; it has `S.main.view`
   {x,y,w,h,scale} and `S.main.toScreen`) and then measures `st.displayCanvas`, which is main's *detached* 640×360
   logical canvas (rect 0×0), so it falls back to identity. Seen: "[E] Use — Ring bell" drawn ~150 px left of and
   ~250 px above the bell at 1024×768. Fix either side: main.js `M.viewRect = () => ({ x: M.view.x, y: M.view.y, w: M.view.w, h: M.view.h })`,
   or world.js skip a measured rect with zero width and try `S.main.canvas`. Headless is unaffected (logical px there).
2. **main.js** — its injected `#story-canvas` rule should itself carry `display:block;border:0` so any host page with a
   global canvas rule is safe (the lobby is covered by the loader fix above).
3. **pieces.js** — `heavy_bag` reads `p.y` both as the anchor top and (through `gyOf`) as the ground line, so a `y`
   lifts the whole bag off the floor; in exteriors the chain starts at ground − 210. The sandbox hangs it from a scaffold.
4. **ui.js (minor)** — the interaction prompt text can stay visible (stale) while a scene runs.

## Known gaps
- Chapters 0–10, cast.js and places.js were not on disk; `load`, `chapter N` and `campaign` were exercised only with the
  sandbox. `campaign` reports "New Game failed" until chapter 0 exists.
- `--render` uses a no-op context: it proves render code runs without throwing, not that it looks right.
- The selfTest's slip/counter and launch checks drive timing from enemy AI fields (`enemy.state`, `atk.windupT`, `t`);
  if combat renames them those two checks fail loudly rather than silently passing.
