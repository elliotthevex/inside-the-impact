# core / director / main / manifest — builder notes

Status: DONE for the build phase (run 4). All four files pass `story/dev/syntax.js`. Restart: nothing pending;
see "Known gaps" for what the integrate phase should look at.

Files: `story/core.js` (§2, §9), `story/director.js` (§8), `story/main.js` (§1, §11 S.test, §12), `story/manifest.js`.

## Tested (headless, JavaScriptCore)
Scratch harness (not in the repo): core + director + main with a stub world, then again with the real
`pieces.js`, `combat.js`, `activities.js` loaded. 26/26 checks pass:
title with no chapters (empty list, New Game refuses politely); chapter list hides the sandbox;
`S.test.runCampaign('restraint')` reaches `own_name`, `'ruthless'` reaches `champion`, credits return to the title;
`runChapter(0)` reaches the end with no errors; a real `A.fight` (thug, auto-won) and a real `A.activity('carry')`
complete under the policy; save at an `A.checkpoint` inside a scene, `S.load('auto')`, the scene resumes at the
save point with no repeated line; walkJinTo / interactNearest / snapshot / goto / log / errors; an exception in a
scene goes to S.fail and play continues; sandbox autosave does not touch the campaign autosave; close.
Not exercised: the browser-only paths of main.js (DOM, canvas, scaling, overlay, fallback UI). world.js, art.js
and ui.js were not finished during this run, and the browser pane cannot open file:// pages without adding a
`.claude/launch.json`, which is not my file.

## main.js — what it does
- `STORY.open(opts)` (= `S.open`): opts `{ onExit, chapter, flags, headless, dev, policy }`. Builds `#story-root`
  once (fixed, inset 0, z-index 1000, black) and re-attaches the same element on later opens, so DOM that ui.js
  builds inside it survives a trip to the lobby. `opts.chapter` starts that chapter seeded with earlier canon
  (play.html `?ch=N`); otherwise the title.
- `STORY.close()`: autosaves if the player has control, stops the game (director reset, fights, activities,
  location, ambience, input), calls `S.ui.destroy()`/`unmount()` if present, detaches the root, restores body
  overflow, calls `onExit`.
- Loop: rAF, accumulator, fixed 1/120 steps, at most 0.25 s of sim per frame. Step order: pre-step hooks ->
  `S.input.update()` -> `S.director.update(dt)` -> `S.world.update(dt)` (world freezes actors itself during
  hit-stop and pause; main counts hit-stop down only when no world exists) -> `S.activities.update(dt)` ->
  `S.time` and `G.playtime` advance unless paused -> post-step hooks. Frame: `S.world.render(ctx)` on the
  640x360 logical canvas (title backdrop when no location) -> `S.fx.fade` overlay -> nearest-neighbour blit ->
  `S.ui.update(dt)` -> `S.audio.update(dt)` -> `S.input.clearFrame()`.
- Scaling: integer device-pixel scale when it fills >= 80% of the window, else the exact fit. The display
  canvas backing store is an integer multiple of 640x360 (cap 6x) and the CSS size is the fit, so fractional
  fits stay even. `S.main.view = { x, y, w, h, scale, k }` (canvas rect in CSS px inside #story-root),
  `S.main.toScreen(lx, ly)`, CSS vars `--story-scale`, `--story-view-x/y/w/h` on the root, event `resize`.
- Errors: `S.fail(err, ctx)` replaces core's: records into `S.errors` (same array; each distinct error at most 3
  times, capped at 300), logs, and shows ONE overlay (later errors raise a counter). `S.ui.error(err, {source})`
  is used when ui.js has it, except for errors whose source starts with `ui`. Main's own overlay: message,
  source, Keep playing / Back to the title / Back to the lobby; Esc closes it. `window` error events from
  story/ scripts are reported too.
- Esc on the title goes back to the lobby: a capture keydown listener marks it, and after `S.ui.update` runs the
  frame closes Story Mode unless a UI window was open before or after, the error overlay is up, or
  `S.ui.handlesTitleEsc` is true.
- Title backdrop drawn by main (Eastgate dusk in the rain: skyline, smokestacks, brick row, streetlight cone,
  puddle glints, rain, vignette; Jin under the light via `S.art.drawFigure` when art.js is loaded). Layers cached.
- Fallback UI (only if ui.js is missing or lacks pieces): title menu (Continue / New Game / Chapters / Back to the
  lobby, disabled items say why, keyboard + mouse), plain dialogue box with choices, screens, title cards,
  documents, objective line; Esc in play -> title. With a ui.js that has `update` but no `title()`, only the
  fallback title menu is used.
- `S.load()` from anywhere resumes on the next step unless the caller already called `story.start/resume`
  (tracked by `story.startSeq`). So a UI Load window may call just `S.load(slot)`.

## S.test (§11) and extras
Contract: `boot({headless, policy, seed, autoAdvance, dev})`, `step(seconds)`, `press(a)`, `release(a)`,
`tap(a, seconds)`, `snapshot()`, `goto(locId, x)`, `startChapter(n, flags)`, `walkJinTo(x, opts)`,
`interactNearest(kindOrId)`, `state()`, `log` ([{t, e, d}], d = small JSON-safe summary, 6000 max), `errors`.
Extras: `restore(snap)`, `advance()`, `choose(i)`, `setPolicy(p, extra)`, `interactables()`, `route(from, to)`,
`storyKey()`, `drive` (virtual-key driver), `autopilot` / `autoplay(on, policy)`,
`runChapter(n, {policy, real, realActivities, flags, limit=2400, stuckAfter=120})` ->
`{ chapter, title, policy, reachedEnd, time, stuck, stuckAt, scenes, errors, visited, unvisited, choices, quests, ending, autopilot }`,
`runCampaign(policy, {real, limit=36000, stuckAfter})` ->
`{ policy, finished, ending, time, chapters: [{n, reachedEnd, time}], stuck, stuckAt, errors, choices }`.
The headless runner's `chapter N` / `campaign P` commands can simply call these and print the JSON.
`boot({headless:true})` sets `S.director.autoHeadless` so plain lines close by themselves without a policy.
Autopilot order: the waiting scene's hint `{walkTo, interact, loc}` -> the quest step's `autoplay` hint -> the
step's `target {loc, x}` (routes through doors by BFS, then interacts with things near x) -> exploration
(NPCs with markers, unclaimed evidence objects, doors to unvisited places, map ends). Tries per target reset
whenever the story state changes. Stuck = no story-state or location change for 120 sim s.
`ChapterDef.required: [locIds]` (optional) narrows `unvisited`; default is every location the chapter defines.

## director.js — decisions
- `S.director.busy` = a scene HOLDS control (or a dialog/card/screen/doc is up). A scene that called
  `A.control(true)`, or waits in A.reach / A.waitFor / A.fight / A.bout / A.activity, is not busy, so the world
  keeps interaction and triggers live. `running` = any scene; `control` = !busy.
- A run() while the top scene has given control interrupts it (stack; the parent resumes); otherwise it queues.
  Fights, activities and system flows are never interrupted. The same scene requested twice is not stacked.
- Input lock: while busy, movement/combat actions read only virtual input (the director drives Jin with virtual
  keys when world has no walkTo). Up/down presses stay live for menus; meta actions are never locked.
- Effects (fade/letterbox/fx/cam/walk/goto/card/doc) start when called; `yield` only waits for them.
- Resume from save: a save inside a scene records {scene id, yields so far, checkpoint count, recorded wait
  results}; load re-runs the scene fast-forward (no G writes, instant waits fed the recorded results).
- `A.fx(name, 0)` turns any effect off; 'slowmo' a => S.timeScale = 1 - a. `S.fx.fade/fadeColor` for A.fade.
- `advance()` / `choose(i)` debounce only across channels: the director's own key read passes 'key', UI calls
  default to 'ui'; the second channel within 0.1 s for the same press is dropped, two presses on one channel
  always count. With no line up, `advance()` dismisses a screen or skips a title card (mouse clicks).
- `D.reset()` also ends a running fight/bout (`combat.endFight()`) and cancels an activity.
- Heartbeat audio comes from world.js; the director beats only when there is no world.
- Activity budget under a policy: 4 s (or `policy.activityTimeout`), then `S.activities.stop(st)` (a pass).
- `story.chapterList(g, {sandbox})` lists registered chapters only; the sandbox (99) only with `S.dev` or asked.
- Chapter flow: `story.start(n)` -> snapshot -> skills/body -> screen 'chapter' -> enter start loc -> start scene
  (queued first) -> autosave -> fade in. `A.endChapter()` -> completion data -> autosave (Continue opens the next
  chapter) -> screen 'completion' -> `story.next()`; after chapter 10 the ending screen (cards from
  `ChapterDef.endings[id]` of chapter 10) and credits ("Story Mode by Joohyun Lee and Elliot Jeong"), then title.
  A missing next chapter shows a 'continued' screen.
- `ChapterDef.canon` (or `seed`) = `{ flags, rel, money, evidence, memories, people, quests, gear, train, skills, visited }`
  seeds chapter select and headless runs for later chapters.

## core.js — decisions
- Sandbox (chapter 99) autosaves go to the unlisted key `save.sandbox`, never over the campaign autosave.
- G extensions: `G.body` (Jin's body this chapter incl. look), `G.restrict` (standing combat restriction).
- Storage falls back to memory when localStorage is blocked; settings validated on load.

## Screen shapes the UI reads from `S.director.screen` (event 'screen', 'screenEnd')
- `{ kind:'chapter', n, title, date, place, lines }` — any key after 1.2 s, or `D.dismiss()`.
- `{ kind:'completion', n, title, data: { evidence:{found,total}, sides:{done,total,list}, choices:[text], time, timeText, summary:[lines] } }`.
- `{ kind:'ending', id, title, cards }`, `{ kind:'credits', title, lines, ending }`, `{ kind:'continued', n, title, lines }`.
- `S.director.card = { title, sub, seconds, t }`; `S.director.doc = { doc:{id,title,text,pages,kind,...}, id, page }` -> `D.closeDoc()`.
- `S.director.dialog = { id, speaker, name, text, shown, thought, narration, choices:[{text, enabled, hint}], sel }`.

## What main.js expects from other modules (all optional, guarded)
- ui.js: `S.ui.update(dt)`, `S.ui.title()`, `S.ui.error(err, {source})`, `S.ui.isOpen()`, `S.ui.closeWindow()`;
  optional `init(root)`/`mount(root)`, `destroy()`/`unmount()`, flag `handlesTitleEsc`. Title buttons call
  `S.story.continueGame()`, `newGame()`, `loadGame(slot)` (or `S.load(slot)` alone), `chapterSelect(n)`,
  `chapterList()`; pause-menu Quit to title = `S.main.toTitle()`; Back to the lobby = `STORY.close()`.
- world.js: set `S.world.rendersFade = true` if world.render draws `S.fx.fade` itself (else main draws it);
  optional `S.world.unload()`/`clear()`, `S.world.interactables()`; `screenPos` can use `S.main.toScreen`.
- Loader (game.js) / headless runner: `window.STORY_FILES` (order of §1), `window.STORY_OPTIONAL` (content files
  whose load failure should be skipped, not fatal), `window.STORY_CSS`.

## Known gaps
- Browser paths of main.js untested in this run (see Tested). First thing for the integrator: open play.html,
  check scaling at 1280x720 / 1920x1080, Esc on title, error overlay, a second open from the lobby.
- The ui.js boundary names come from the workflow's ui instructions, not the contract; reconcile if ui.js differs.
- The autopilot is heuristic; chapters with unusual paths should add `autoplay` hints (§11) rather than special code.
