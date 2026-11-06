# Balance notes

Status: finished, final table below. Scratchpad `balance/snap8` holds the same code apart from one comment. Final table below. Working files: gfx/arena/sim.js, gfx/arena/ai.js, gfx/dev/simtest.html.

## How it is measured
`gfx/dev/simtest.html`, `SIMTEST.run({n:200})`. The harness calls setReach from reach.json first, plays the game's real frame loop at 60 fps (one decide per frame, presses once, a contact ends the frame's ticks) on the real ring (half 2.9, corners 2.5). Earlier tables at 1/120 flattered the code. Scratch tools in the scratchpad `balance/`: t.py (table, --checks), q.py (quick rows, overrides), chk.sh (misses plus exploit bots), diag.py (state of a man when hit), tl.py (timeline; needs `state: S` returned from createAI), exploits.py (scratch strategies, not yardsticks), th.py (threat statistics).

## Baseline at the rig's reach, before any tuning (200 per row, JavaScriptCore, seeds 1000+, 1/120 loop)
win %, ended in round 1 %, seconds. mixed 0,100,46 / 0,100,41 / 0,100,39 (easy/normal/hard); learner 0,82,62 / 0,82,58 / 0,92,52; skilled 90.5,1,178 / 63.5,0,187 / 21.5,2,148; runner 46 / 9 / .5; guardjab 2 / 0 / 0. Spam win %, normal/hard: jab 0/0, cross 23.5/22, hook 36/59.5, upper 12.5/11.5, bodyL 4/.5, bodyR 3/1. Skilled normal: whiff 54.2, AI whiff 51.2, slips .7% of head punches, decisions 51.5%, stopped 26.5%, KO+TKO 22%. 27 of 77 checks missed.

## What was tried and what moved which number
Rules (sim.js):
- Hook and cross start slower (cross .26, hook .30, upper .28) so they can be reacted to. A light shot no longer interrupts a heavy (heavyThrough). Longer step into a punch (moveStart 1.1). These cut whiffs from over 50% to under 30%.
- Regen 16, slip from 0 to .27 for 12 stamina: scripted slip evades head shots, skilled slips over 3%.
- Damage and load well down from the first pass, because fights ended in round 1. Decisions are very sensitive to load: head x.93 took skilled decisions from 17 to 43%. Final numbers are in PUNCHES.
- guardLoad .85 to .9: a blocked hook was still .27 load, half of what hook-with-pauses needed. This took hook-with-pauses from 50 to 22 on hard.
- blockedRec .12: a heavy shot into a guard leaves him open a moment longer, so a block can be punished.
- getUpTime 1.7. kdBase .16.
- Tried and dropped: backAfter (retreat slowed after a punch). It beat jab-and-run but cut whiffs to 17%, shortened every fight and pushed skilled up. Solved in the AI instead.

AI (ai.js):
- feast no longer goes all-in on a man who is merely tired: press per level. This was the main known problem (39 s round 1 losses).
- soft: he gauges how much of his work lands. Against a man who cannot defend he works jab and body, with longer gaps and fewer reads. This is what gives mixed and learner a real fight. TEMPER.load 2.4 to 3.2 took normal mixed 7 to 17 and learner 20 to 33; tempo .25 to .4 took learner 23 to 32.
- Scratch bots found that soft could be farmed: hook-or-cross won 100/95/93 (easy/normal/hard), jab-and-run 92/100/100, one-two 85/85/60, hook with pauses 100/77/45. So:
- threat and heat: the head load he took over 20 s separates brawlers (hook-or-cross median 6.3) from learner and mixed (97th percentile 5.4 and 4.8). Past the level's threatAt he stops sparing and fights faster and heavier, and uses hunter plans. leadAt does the same when he carries much more load than the man.
- learn: reads grow with how often a man throws that punch, so patterns get read and random buttons do not.
- kite: share of a man's punches after which he is moving away. Past kiteAt he stays on him, works faster, and goes in behind the punch with a cross (lunge). Jab-and-run on normal 97 to 20.
- waitGuard removed: holding a guard while waiting out a one-button man burned his stamina (a guard refills nothing). He now just stays out of range. One-two on normal 85 to 45.
- Levels: LEVELS is monotonic easy to hard except where noted (guardRead and cadence equal on normal and hard). Hard is harder through reaction, fewer gaps of mistake, reads, punish, finish and press. Hard threatAt 4.6 and leadAt 4 sit below normal.

## Decisions made alone
- Target order followed: new player, then the stoppage lesson, then the skilled rate.
- The yardstick bots idle, spam, mixed, skilled, turtle are unchanged from commit d0e900e (diffed). No bug fixed in them.
- Scratch exploit bots stay out of the page because the brief named only three new bots.

## Final table (final code, 200 matches per row, seeds 1000+, 60 fps loop)
Run twice: JavaScriptCore (`t.py 200 --checks`) and once through the page in Chrome (`SIMTEST.run({n:200})`, 218 s). Both report 0 of 78 checks missed. Every row compared between the two is identical.
| Measure | Easy | Normal | Hard | Target E / N / H |
|---|---|---|---|---|
| mixed win % | 53.5 | 19.5 | 7.5 | 40-65 / 10-30 / at most 10 |
| learner win % | 60.5 | 27.5 | 8.5 | 55-80 / 25-45 / 5-20 |
| skilled win % | 99.5 | 65 | 32.5 | at least 85 / 60-70 / 30-45 |
| mixed ended in round 1 % | 0 | 0 | 0 | at most 20 / 35 / 60 |
| learner ended in round 1 % | .5 | 0 | .5 | at most 20 / 35 / 60 |
| idle, turtle win % | 0, 0 | 0, 0 | 0, 0 | 0 |
Normal: mixed 200.2 s, learner 170.1 s. Spam win % normal / hard: jab 0/0, cross 0/0, hook 11/3.5, upper 1.5/.5, bodyL 1.5/.5, bodyR 0/0; land % on normal: jab 71.2, cross 9.9, hook 13.4, upper 15.6, bodyL 85.1, bodyR 78.6. Runner 0, guardjab 0.
Skilled on normal: reach round 3 87%, decisions 33%, KO+TKO 39%, stopped 28%, whiff 27.9, AI whiff 29, slips 3.3% of the AI's head punches. All normal rows, endings: KO 270, TKO 513, stopped 1632, decision 185. Mixed stopped 24.5%.
Stoppage median HP, pooled without idle and turtle: player 55.3, AI 57.6. Mixed 44; learner 50.3, AI 53.8; skilled 58.4, AI 62.5. Fastest route (seconds of fight): hook 9.3, upper 16.5, cross 32.1, jab 104.4.
Dead time p90: against mixed 3.7, against skilled 4.1. Scripted slip inside the window evades 96.3%. Rule breaks none. Same seed 20 of 20. getUpTime 1.7. HEAD 7, 13, 20. Hard reaction .13.
Round styles on normal, jab share R1 / R3, body share R1 / R2 / R3, mean distance R1 / R2: against skilled 55.9/23.4, 3.4/32.1/7, 1.161/.993; learner 68.3/28.1, 8.2/45.3/10.4, 1.075/.851; mixed 72.5/33.2, 10.4/67/11.5, 1.006/.817.

## Second seed range, same code (seeds 5000+, n=100, JavaScriptCore): 3 of 77 missed
Easy learner 50 (55-80), hard mixed 12 (at most 10), skilled decisions on normal 24 (25-50). So these three, and normal learner (27.5), hard skilled (32.5) and skilled slip (3.3), have thin margins: the seeds 1000+ table passes, the true values sit near the edges.
Tried for easy: spar .85 gives learner 64 and 70 but mixed 64.5 and 66 (seeds 1000, 5000, n=200). Not kept. Spar .8 not measured. Stopped here at usage 42 of 47.

## Scratch strategies on the final code (n=50, not yardsticks), win % easy / normal / hard
Jab-and-run 52/24/4, hook-or-cross 78/40/12 (nearly all round 1), hook with pauses 96/44/28 (round 1 on easy and normal), one-two 72/56/32. Before this pass: 92/100/100, 100/95/93, 100/77/45, 85/85/60. Easy still falls to hooks in round 1. I accepted that for easy: it shows repeated clean hooks stopping a man.

## What is left
- No human has played this numbers set. Nothing here was run through the real game with rigs, only the page and JavaScriptCore.
- Fights are long: on normal 98% of mixed matches reach round 3 and mixed is stopped in only 24.5%. Inside target, but check that a new player actually sees a stoppage often enough. Raising load a little brings stoppages back and cuts decisions quickly (head x.93 moved skilled decisions by 26 points).
- If margins are wanted: try easy spar .8, and a little more softness on normal for learner.
