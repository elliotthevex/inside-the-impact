
## c00 (Chapter 0 author) — 2026-11-22
- dev/headless.js `load`: `KNOWN.fx` lacks `letterbox`, so `A.fx('letterbox', 0.4, d)` (the thin letterbox the bible's direction
  grammar asks for; director FX_DEFAULTS has `letterbox` and tweens it fine) is reported as "unknown screen effect".
  Repro: any scene with `yield A.fx('letterbox', 0.4, 0.5)` -> warning in `load`. Workaround in c00.js: the name is held in a constant.

## From c01 (Chapter 1 author) — 2026-11-22 (worked around in c01.js; nothing blocks)
1. holdE / stillness and the tether NPC (bible Global → Direction grammar) are not in the engine. c01.js builds them locally (custom Wait reading `S.input.rawHeld('interact')` + a 'screen' draw hook; tether via `S.main.onStep` and `jin.bounds`). Other chapters that need them (Ch0, Ch3, Ch5, Ch6, Ch8, Ch10) will duplicate this unless the engine ships them.
2. ObjectDef/DoorDef `label` and `verb` must be strings: a function shows as text. Repro: `objects: [{ id: 'x', x: 100, label: (G) => 'A', verb: 'Use', text: ['t'] }]` -> prompt reads the function source. Workaround: two objects gated by `when`.
3. Patching a builder placeholder door with only `locked` drops its `run` (places.js mergeList), so `load` reports "has neither `to` nor `run`". Workaround: also pass `run: 'places_noop'`.
4. Journal Training: a training spot whose `when` is false reports "There is no place for X here." There is no per-spot reason field; c01.js wraps `S.activities.canTrain` (guarded to chapter 1 at St. Agnes) to give Hana's reasons. A `why` field on training spots would remove the wrapper.
5. Any `A.flag` set right after an `A.choice` marks that choice non-minor (listed on the completion screen), even for trivia like crossword answers. Workaround: record progress in a quest step instead of a flag.

## From c02 (Chapter 2 author), 2026-11-22
1. **A quest step that hides the HUD objective** (bible ch02 2.2/2.3: "the objective HUD hides itself" after Mrs. Okafor,
   back after 90 s or when Jin leaves a sit spot). `D.objective()` falls back to the quest title when a step's text is empty,
   so a step cannot be blank. Workaround in c02.js: `S.director.objective` is wrapped (chapter 2 only) to return
   `text: ''` while `G.flags.c02_hud_off` holds a recent sim time; target/autoplay are kept. Suggested: QuestDef step
   `hud: false` (or `A.objective(false)` = hide) honoured by `D.objective()` / ui.js.
   Repro: any active main quest; `A.quest(id, 'step', n)` with `steps[n].text = ''` -> HUD shows the quest title.
2. **Ladders/objects during fights**: world focus is off during a fight, so a scene object (the Ch2 knuckles,
   "Pick up" mid-fight) cannot be used; and a `run` scene requested mid-fight queues until the fight ends.
   Workaround: a post-step hook reads `S.input.pressed('interact')` near the spot and draws its own prompt.
   Suggested: ObjectDef `inFight: true` (focusable during a fight, run as a background scene).
3. **`S.world.extraLights` is not initialised** (frameLights reads it only if it is an array). c02.js creates it.
4. **Dash charges per chapter**: `S.tune.dashCharges` is global; Ch2 wants 1 (bible progression). c02.js sets it while
   G.chapter === 2 and restores it after. A `ChapterDef.body.dashCharges` would be cleaner.
5. **headless load warns on `A.fx('letterbox', ...)`** ("unknown screen effect") although the director tweens it fine;
   a thin letterbox needs it (A.letterbox only does full). c02.js passes the name through a constant.
