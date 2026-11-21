# combat.js — builder notes

Status: DONE (run 2: integration + verification pass over the run-1 file; 2026-11-22 fix pass from the movement
review, see "Fix pass"). Syntax-clean in JavaScriptCore.
Headless tests used for this pass live in the session scratchpad (`ctest/`: run.js, fakeworld.js, bots.js, t_*.js);
they are not part of the repo. When `story/dev/headless.js` exists, port the fairness bots there.

## What is in story/combat.js (contract §6)
- `S.tune` (every PDF §6 number; H = 46) + extras: footwork/retreat multipliers, turnBoost, brakeTime/turnTime, jump physics, dash chaining
  (`dashStraightFrom`, `dashChainFrom`), `slipBadMul`, `comboGrace`, `heavyCancelFrac`, `returnCrossWindow`, recovery times,
  per-move `knock/step/stun`, `hook.arcReach`, `returnCross.dist` (H), breath extras, `regen` (difficulty recovery and
  bout corner shares), `enemy` (AI-wide rules). `S.tuneBase` = untouched defaults. `flurry.startup` is gone: the
  flurry schedule comes from art.js's drawn punches (see Fix pass below).
- Jin: input → one-slot buffer (newest press replaces, 0.10 s of Jin's own time; presses on hit-stop steps are kept)
  → state machine (idle, move, brake, turn, land, air, guard,
  block, dash (ground/air/back), slip, attack, flurry, hurt, down, getup, grabbed, thrown, climb (fallback only), scripted).
  Explicit cancel windows (`canCancel`): light punches chain at comboFrom and cancel into dash/slip any time (a pending
  hitbox is dropped); heavies keep active frames + 40% of recovery. Two shared dash charges recharge one at a time;
  air dash once per airborne sequence (landing restores eligibility, not charges); 0.07 s dash dodge, ended by attacking;
  passes ordinary enemies only in the dodge window, never walls/bosses; dashing deals no damage. Dash covers exactly
  dashDist at any step rate (displacement-based). Slip: window [.02,.08] checked against the enemy's active frames;
  counter window only after a real evade; counter needs a press. jab→cross→hook, down+punch uppercut (launch), dash →
  dash straight after the burst, backdash → returning cross (steps back in 1 H), flurry (6 hits + finisher, one hit-stop).
  Hit-stop: longest request per step; multi-hits rate-limited. Afterimages, smears, sparks, dust, slip flash, telegraph
  marks, counter chevron (via S.art when present, small fallbacks otherwise).
- Body: power, speedMul (also slows the hands), limp, breath, delay (sabotage: input replayed late, no presses lost),
  knuckles (+15%), dmgMul. Bout `debuff(round, t)` folds into it (speedMul, delay) and drives S.fx blur/double + muffle.
- Enemies: thug, collector, boxer, guard, director, boss_collector, champion ('ch0'/'ch8'), sparring, bag, dummy,
  enforcer. Telegraph = tint flash + '!' at the head (amber slippable, red = push/grab/charge: dash or jump).
  Committed direction at windup. Attack tokens (maxAttackers) granted with a gap; waiting men hover in ranks.
  Openings after whiffs (per-attack `whiffOpen`), feints, boxer jab-read (slips inside, counters), director buff
  (allies within 160 px wind up and recover 30% faster), boss cornering + wall grab + poise, champion phases and
  lean-back counter, juggle limits, KO = stays down (never killed), `fleeAt`, `needsKnuckles`.
- Fights (waves, arena via actor.bounds, tips start/firstWhiff/firstSlip/lowBreath, loss → restore fight start unless
  allowLoss) and bouts (intro → bell → rounds with clock → round end → corner → … ; knockdown counts with get-up taps,
  3 knockdowns = KO, decision by damage + 20/knockdown; endWhen 'ko' | 'time' (survive the final bell = win) | 'roundEnd').

## Exports beyond the contract
`C.update(dt)` (idempotent per S.time; world calls it), `C.refresh()` (director calls it after A.skill), `C.restriction`
(current restrictions in the flat shape), `C.restrictions()`, `C.setBody(p)` (also writes G.body), `C.archetypes`,
`C.enemyAttack(idOrActor, name)` (scripted/drill attacks), `C.endFight(won)`, `C.resetJin()`, `C.standUp()` (ends a
scripted knockdown), `C.carry(kind, reason)`, `C.walkTo(x, opts)`, `C.isFree()`, `C.hud()` (HUD data in one object),
`C.drawUnder/drawOver/render`, `C.stats` (session totals), `C.inputEnabled` (null auto / true / false), `C.tuneBase`,
`C.resetTune()`.
Events beyond §2: breathOut, launch, enemyPoint, enemyFeint, enemyRead {read:'jabs'|'leanBack'}, enemyCover,
enemyBreakOut, enemyFled, needKnuckles, bossPhase, fightWave, fightRetry, boutRound {round, phase}, boutCorner
{round, scene, claim()}, boutKnockdown {who, n}, boutCount {who, count}. 'slip' {ok:false} also carries early/late
(late = Jin slipped too late: the strike met him before the window opened; early = too soon: after the window, or the
slip had already ended) and unslippable (a push/grab met a well-timed slip).
FightState/BoutState stats also have blocks, whiffs, punches, dashes, dmgDealt, dmgTaken, kos, knockdowns, maxCombo, retries.

## Actor fields combat writes (renderer/world read them)
pose, poseT, poseK, prevPose, tint, squash, lean, alpha, speed, scaleX, poseOpts{…, carry}, vx, vy, face, bounds
(fight arena, `_combat` marked; cleared when the fight ends), down, hostile, kind:'enemy', enemy (AI), ctrl (Jin).
combat never writes `actor.carry` except through `C.carry`.

## Decisions
- `restrict(o)` REPLACES the standing set (matches A.restrict storing G.restrict = o; activities merge prev themselves).
  combat never writes G.restrict — the director owns it; combat reads flat `{punch:false, reason, reasons}` or `{verbs, reasons}`.
- Carry is an actor fact: activities.js sets `actor.carry`; combat mirrors it into `C.jin.carry` each step, blocks every
  verb, uses walk-only carry speed. Restriction reasons win over the generic carry reason. Toasts dedupe per reason text.
- Control: world writes `actor.control` each step (director hand-off, transitions); combat uses it, falling back to the
  director flags when absent. A scripted knockdown (`forceDown('jin')`) holds until a bout counts it or the player has
  control again (then Jin gets up).
- world.js owns ladders/stairs and down+jump drop-through (`W.drop`); combat's own ladder code runs only without them.
  `world.collide` is called once per step (it sub-steps fast movers itself).
- Draw hooks registered with `S.world.addDraw('back'|'effects')`; each layer draws once per frame even if world also
  calls `S.combat.drawUnder/drawOver` directly.
- A.fight saves the checkpoint; startFight saves only when there is no director.
- Bout corner scenes run as BACKGROUND director scenes (`run(id, {background:true})`): A.bout is noInterrupt, so a normal
  run() would queue until the bout ended. The corner phase waits for the handle.
- Condition recovery: story = 1 HP floor + full regen 2 s after damage; normal = regen 3 s after damage while nobody is
  attacking; veteran = same, capped at half. In bouts (not story) there is no mid-round regen: the corner gives
  normal +45%, veteran +30% (never above half), story full. Out of any fight, a KO'd Jin gets up after 2.5 s at 40%.
- Fairness rules added in run 2 (from the bot simulation below):
  - Cover-up: three staggers in a row (each within 1 s) → the man covers (blocks everything but a counter) for 0.3 s,
    then fires back with a quick, armored answer (armor: no stagger, 35% damage; counters cut through). Stopping after
    jab–cross, or slipping the answer, beats it; mashing walks into it.
  - Heavy men guard and are tough: collector (block .45, tough .6), boss_collector (.55/.55), champion (.4/.65),
    enforcer (tough .85). `tough` = damage multiplier unless exposed (after a whiff, recovering, staggered, launched,
    or hit by a counter).
  - Boss shoulder charge is unslippable (a body attack, PDF §3): dash or jump.
  - Boxer jab-read radius 80 px; he slips INSIDE and counters. Champion leans back from repeated straights.
  - Director hovers 80–120 px from Jin so the men he directs stay inside his 160 px.
- `firstWhiff` tip fires on the first ENEMY whiff (the opening is the lesson).
- Champion hp default 200 (chapters can set opponent.hp).
- Slow motion (`S.timeScale`) scales combat timers (charges, breath, round clock, effects) with the actors.

## Fairness simulation (normal difficulty, 4 seeds each; taken = damage Jin took)
| encounter | masher | dash spammer | skilled (slips, counters, stops after 2) |
|---|---|---|---|
| 3 thugs | 10 | 12–23 | 2 |
| 2 thugs + director | 12 | 6–8 | 8 |
| boxer | 9–11 | 2–4 | 0 |
| collector + thug + enforcer | 20–26 | 10–13 | 11–16 |
| boss_collector | 100 (0/4 wins) | 79–89 (2–3/4) | 0 (4/4) |
| 2 guards, then 2 thugs | 44–46 | 5–14 | 16 |
| champion bout ch0 / ch8 | loses 5 of 6 | loses 4 of 6 | wins 6/6, 0 taken |
The dash spammer bot is really "dash in → straight", the PDF's own rhythm, so it stays competitive on light groups;
pure dash spam without punching cannot win.

## Fix pass (2026-11-22, movement review; all checked headless before/after, sandbox 29/29)
- Hit-stop no longer eats presses: `C.update` reads Jin's input on frozen steps (`sampleFrozen`), input is read once per
  step (`sampleJin`, keyed on main.steps + S.time), and the buffer ages in Jin's time (`b.age += dt` in updateJin).
  `chainUntil`/`returnCrossUntil` became `chainT`/`returnCrossT` countdowns in Jin's time for the same reason.
- Counter needs a press after the evade: `slipSuccess` stamps `j.evadeAt` and drops a buffered punch; `choosePunch`
  gives 'counter' only for `b.t > j.evadeAt`. A punch pressed mid-slip before the evade is simply dropped.
- Flurry hits land on art.js's drawn punch peaks (`FLURRY_ART` {burst .5, punches 6, peak .45, finPeak .06}): hit i at
  (i + .45)·time/hits, finisher at time + .06, all on the flurry clock u = t·handSpeed; the pose gets `flurryArtT(fl)`
  (identity at the defaults). If art.js changes its flurry timing, change FLURRY_ART with it.
- Dash after walking off a ledge is the air dash (coyote time is for jumping only).
- A held direction turns the punch whenever a hostile is within 70 px that way (or nobody is in front); the returning
  cross never turns.
- Boxer read (`readStreak`, replaces jabStreak): the third light straight (jab/cross/returnCross) in one unbroken run
  of punches (each starting within 0.25 s of the previous one ending; hooks continue the run without counting; slip,
  dash, guard, step back, getting hit/blocked or any other punch resets). Pressing every 0.10 s or 0.25 s → read;
  spaced jabs every 0.5 s → never.
- Reach matched to the drawn fist (art joints: jab 21/22, cross 23/26): hook reach 24 → 18 (trail tip 17.5), arcReach
  34 → 30 (a two-man hook still works when the men are bunched), uppercut 20 → 16 (fist ~10.5). These differ from the
  ARCHITECTURE §6 sample values on purpose (PDF §4 close range; the PDF itself gives no reach numbers).
- Braking from a run uses art 'brake' (`brakeTime` .16, any input ends it); a full-speed reversal uses 'turn'
  (`turnTime` .08). Both are FREE states (visual only; velocity is unchanged).
- Full-figure white hit flashes (Jin hurt, enemy flinch) follow `settings.flash`: ≥ .5 white, (0, .5) '#c9d3dc', 0 none.

## Known gaps
- Windows timed on S.time (invuln, slip cooldown) are not stretched by hit-stop or slow motion (tens of ms; negligible).
- `C.resetTune()` restores defaults into the same object, so activities' training snapshot is not re-applied until
  G.train changes (dev tool only).
- Enemies are ground-bound: they don't jump or climb; fights belong on one floor.
- The bout clock stops during knockdown counts (a game choice).
- The ch0 'subtle' right-hand tell is only a pause + posture lean; the bots read internal state, so its readability
  needs a look in the browser once art.js lands.
- art.js: the hook sweep (fist ~14 px, trail ~17.5 px) is shorter than the two-man arcReach (30); if art widens the hook
  arc toward ~28-30 px, arcReach can stay and the visual will match. The uppercut fist (~10.5 px) is short for reach 16.
- world.drawActor does not pass `tintK`, so the flash setting can only pick the tint colour, not scale its strength.
- Telegraph tints (amber/red windup flash) ignore settings.flash on purpose: they are gameplay information.
- The fairness table above predates the fix pass (shorter hook/uppercut, stricter boxer read); not re-simulated.
