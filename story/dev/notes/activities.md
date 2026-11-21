# activities.js — builder notes

Status: COMPLETE (run 3). `story/activities.js` implements contract §7 and passes the syntax check. A headless
self-test against the real core.js + combat.js + director.js with a stub world passed every check (all eleven
activities under autoplay, the director's A.activity path, stop/autoComplete, the timeline and present APIs
driven by hand, and the bag, reaction and repair drills driven through real input and the combat controller).
The test lives in the session scratchpad (`acttest.js`), not in the repo. Restart: read this file, then the
code; sections are marked `/* ── n. ... ── */`.

## What is built
- `S.activities.start(name, opts) -> ActivityState { done, result, wait() }`. Names: `train_balance`, `train_footwork`,
  `train_reaction`, `train_conditioning`, `train_bag`, `train_mitts`, `carry`, `repair`, `work_shift`, `timeline`, `present`
  (aliases: `balance`, `bag`, `shift`, `board`, ...). Every result has `ok`, `name`, plus per-kind fields
  (drills: `drill, level, score, of, need, best, sets, before, after, improved`; carry: `item, delivered, loc, x`;
  shift: `pay, money, tasks, completed, shifts`; timeline: `mistakes, order`; present: `evidence, tries, wrong`).
  `auto: true` when autoplayed, `forced` when ended by `stop()` under a policy, `cancelled` + `reason` when cancelled.
- Six drills, three levels each. A set is short (6–11 s of steadiness, 6–10 cues or marks, 3–5 laps); a missed
  set gets one retry, then the drill ends gracefully ("It will come. Try again later.") with no penalty. Passing
  level L raises `G.train[drill]` to L (cap 3); repeating a level already earned changes nothing. Default level is
  the next one up. Prompts use `S.input.labelFor` through `[K]` markup.
  - balance: sway meter, unstable lean, gusts (L3 also nudges); left/right push back; time in the gold zone counts.
    Uses the location's `parallel_bars` piece (pose 'bars') or draws a low beam.
  - footwork: floor marks light in sequence; L2 needs dashes for the spacing; L3 adds arrow marks behind Jin that
    must be reached still facing front (backdash or guarded backstep).
  - reaction: a partner telegraphs HIGH (slip), LOW (hold guard), PAD (jab). Nothing hurts; wrong/late = miss.
  - conditioning: cone to cone laps against a clock with a drill-only wind meter; run dry and Jin is winded 2.2 s.
  - bag: combinations shown as chips (jab/cross/hook/uppercut, dash straight, flurry by skill); three tries each.
    Punches are read from the real combat controller (`ctrl.atk` identity), so jab-jab vs jab-cross is exact.
  - mitts: partner calls a combination, then swings back: slip it (and counter from L2).
- carry: walk to the load (if `from`), lift, carry to an x / point / location (`to: x | 'pointName' | locId`,
  or `{x, loc}`, or `toLoc` + `toX`), set down. Uses `S.combat.carry(item, reason)`: combat's carry speed, carry
  pose, every verb blocked with "Hands full — set the crate down first." Doors stay usable (world.js allows doors
  while a carry runs), so carries can cross locations.
- repair: steps `{ prompt, action, hold, count, pose }`; press, press ×count, or hold (letting go drains slowly).
  Jin is held at the work; a punch step shows a jab at the stuck part (no real attack).
- work_shift: runs task specs (`'repair'`, `['carry', opts]`, `{ name, ...opts }`, `{ name, opts }`) in order,
  then pays `pay` (default $20) into `G.money`, emits `money` and a toast, and counts `G.flags['shift.<id|label>']`.
- timeline / present: board logic; opens `S.ui.openWindow(kind, state)` (shapes below). No failure state.
- `S.activities.applyTraining()` — the only place training effects are applied. Writes S.tune fields combat reads:
  balance → `landRecover` −30%, `hurtTime` and `getupTime` −15% (combat scales hurt stun by hurtTime/0.30);
  footwork → `dashRecharge` −15%; reaction → `slipWindow[1]` +20 ms; conditioning → `breath.max` +30;
  bag → every move's `dmg` (and flurry dmg/finisherDmg) +10%; mitts → `counterWindow` +60 ms. Scaled by level/3.
  It never touches HP, condition recovery, `S.combat.body` (the chapter's injuries) or anything money can buy.
  Re-applied automatically when `G.train` changes, when `S.tune` is replaced, or when a trained field was edited
  from outside (that value becomes the new untrained base, so effects never stack and dev tuning survives).

## UI contract (for ui.js)
`S.activities.current` is the innermost running activity. For boards ui.js gets `S.ui.openWindow('timeline'|'present', state)`.
- timeline state: `kind 'timeline'`, `title`, `prompt`, `cards [{id,title,date,kind,text}]` (tray order, shuffled,
  never the answer order), `slots [cardId|null]` (earliest first), `tray()`, `place(cardId, slot) -> {ok, correct,
  hint, line, complete}`, `hint`, `line {speaker,name,text}|null`, `mistakes`, `complete`, `finish()` (Done button;
  before completion it acts like close()), `close()` (player closed early; [interact] reopens), `done`.
- present state: `kind 'present'`, `title`, `claim`, `speaker`, `speakerName`, `options [{id,title,kind,date,text,owned}]`,
  `pick(id) -> {ok, correct, line, complete}`, `line` (rebuttal after a wrong pick, closing line after the right one),
  `picks`, `wrong`, `complete`, `finish()`, `close()`, `done`.
- The UI should close its window when it sees `state.done`. Optional helpers used if present: `S.ui.isOpen(name)`
  (lets the board notice the player closed it, and auto-close on stop) and `S.ui.closeWindow()`.
- Drills/carry/repair/shift: `state.hud = { title, sub, prompt, chips:[{text,state}], meter:{value,zone},
  bar:{value,label,warn}, pips:{of,list:['ok'|'bad'|'now'|'todo']} }`, `state.marks()` world markers, floating
  feedback words in `state.floats`. activities.js draws its own small DOM overlay in `#story-root` (panel at top
  centre, Courier/serif, gold #e8c272, red #d8402f) — set `S.activities.overlay = false` if ui.js renders it.
- Journal Training tab: `drillList()` / `drillInfo(key)` → `{ key, id, name, what, level, max: 3, effect, next,
  available, why }`; `canTrain(key)` → true or the reason; `train(key)` starts it as a director scene.

## Chapter authoring
- `A.activity('train_bag', { level, x | at, coach, coachName, coachLook, bagX, tries, mustPass, quiet, title })`.
  Without x/at the drill uses the location's `training[drill]` entry, else `points.train_<drill>`, else Jin's spot.
- `LocationDef.training = { bag: { x, coach: 'teddy', when: (G) => ... }, balance: true, ... }` marks where the
  journal can start a drill. Reaction and mitts use `coach` (an NPC id, held in place for the drill) or spawn a
  partner `act_partner`. The bag drill reuses a `heavy_bag` piece at the spot (the punchable combat 'bag' actor is
  invisible and drives the piece's sway), else hangs its own bag (`act_bag`).
- Drills are tied to their location: leaving the location cancels them (`cancelled`, reason 'left the area').

## Exports beyond the contract
`update(dt, fromHook)`, `pre()`, `post(dt)`, `cancel(reason)`, `stop(st, reason)`, `autoComplete(st)`, `running`,
`current`, `root`, `last`, `log`, `overlay`, `autoRate` (8), `names`, `DRILLS`, `trainLevel(key)`,
`trainingReport()`, `drillInfo`, `drillList`, `canTrain`, `train`, `trainingSpot(key)`, `draw(ctx, layer)`,
`register(name, factory)`, `_ext`, `_clock`. Event `activity` `{ name, phase: 'start'|'end', result }`.
LocationDef field `training` (above).

## Decisions
- Ticking: `S.world.update` is wrapped once (pre: consume owned actions; world update; activity tick; pin). The
  main loop may also call `S.activities.update`; one tick per sim step either way.
- Autoplay: `opts.auto`, else `S.director.policy` (unless `policy.activities === 'real'`), else headless with
  `director.autoHeadless`. Autoplay feeds synthetic input into the same judging code and runs `autoRate` steps per
  sim step; drills that need positioning move Jin directly (test mode only). Every activity finishes in < 2.5 s
  of sim time under autoplay, inside the director's 4 s budget. `stop()` under a policy = forced pass (drills award
  the level, carries arrive, boards fill in, shifts finish every task and pay); without one = cancel.
- Holding Jin (balance, repair, lift/set-down, winded): the actor is marked `scripted` (combat leaves him alone),
  x/face/pose are re-applied after every world.update and his pose clock advanced here; restored on release.
- No director control hack: A.activity's wait already gives the player control. Restrictions add only verbs that
  were free and lift exactly those (`C.unrestrict([verbs])`), so a scene's own restrictions survive.
- Drawing: `S.world.addDraw('back'|'front')` hooks (floor marks, cones, beam, fallback bag); a render wrapper only
  if addDraw is missing.
- Resets: `loaded` and `chapterStart` cancel any activity and re-apply training.

## Known gaps
- Not yet run inside the real world.js (it was still being written) or with ui.js; the overlay and draw hooks are
  untested in a browser. Verify drill visuals and the board windows once world.render and ui.js exist.
- Carry speed is combat's `tune.carrySpeed` for every item (no per-item weight).
- A `heavy_bag` piece reused by the bag drill only shows stronger sway after hits, not a directional swing.
