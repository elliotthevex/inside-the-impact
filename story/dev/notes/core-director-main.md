# core / director / main / manifest — builder notes

Status: IN PROGRESS (restart: read this, then continue with the files listed under "Progress").

## Progress
- core.js: complete (input lock done). Syntax OK.
- director.js: complete draft (sections 1-10), syntax OK. Next: integration review against world/combat/activities as they land.
- main.js: being written (run 3).
- manifest.js: being written (run 3).

## Key decisions (planned)
- S.director.busy = a scene HOLDS control (or dialog/card/screen/doc open). A scene that called A.control(true), or is waiting in A.reach / A.waitFor / A.fight / A.bout / A.activity, does not count as busy, so the world keeps interaction/triggers live. `S.director.running` = any scene at all.
- A run() request while the top scene has given control interrupts it (pushed on a stack, parent resumes after); otherwise it queues. Fights/activities/system flows are never interrupted. Same scene id requested twice is not stacked.
- Input lock: while busy, core's S.input reads only virtual input for movement/combat actions (director drives Jin with virtual keys in A.walk). up/down presses stay live for menus; held up/down are locked.
- Effects (fade/letterbox/fx/cam/walk/goto/card/doc) start at call time as director tasks; `yield` only waits for them. So a forgotten `yield` never silently drops an effect.
- Resume from save: a save inside a scene records {scene id, yields so far, checkpoint count, recorded wait results}. Load re-runs the scene in fast-forward (no G writes, instant waits fed recorded results) up to the save point.
- A.fx: for every name, amount 0 = off. 'slowmo' amount a => S.timeScale = 1 - a.
- S.fx.fade / S.fx.fadeColor added (A.fade). main.js draws the fade overlay after world.render.
