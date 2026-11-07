# Balance notes

Status: see "Round 4 result" at the end for the current table and code. The first final table below is older. Working files: gfx/arena/sim.js, gfx/arena/ai.js, gfx/dev/simtest.html.

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

## Round 2: fixing what balance-verify.md found (STOPPED at the usage line 47, restart from here)
Status: NOT finished. ai.js runs and holds both rules below. No n=200 table was run on this code, no rule-break check was read, no Chrome run, simtest.html untouched (it already calls setReach). sim.js untouched. Everything below is n=40 on seeds 81000+ only, so about +-8 points per row. No second seed range yet.
Working folder: scratchpad `balance/fix/`. `q.py n seed --ov 'JS' --set y|b|a` prints yardsticks (mixed, learner, skilled at E/N/H) and a basket of 19 no-timing policies at N/H; `--ov 'L.LEVELS.normal.spareFrom=-4'` overrides for one run. Use own seeds 81000+, 91000+ (the checker used 50000, 60000, 70000). The checker's full tools are in `balance/verify/`: table.py + ev.py, bconf.py, short.py, pols.py, sloppy.py, grid.py, boring.py. Run them on own seeds at the end.
Rules added, ai.js:
- spare (inside decide): he spares a man only from ahead. lead = what he dealt this round minus what he felt this round, plus kdLead per knockdown difference, minus lostLead per round already lost. It also fades when he carries more hidden load than the man (spareHead, spareHeadSpan). soft is multiplied by spare. LEVELS spareFrom, lostLead, spareHead; TEMPER kdLead, spareSpan, spareHeadSpan; eye sample kd. Easy has spareFrom -200, spareHead 99, beat 0, so easy only moves through TEMPER.tempo.
- readBeat: a man who keeps time gets timed. Seen throw times and kinds in S.seq (last 9). If the gaps and buttons repeat over a period of 1, 2 or 3 punches within beatTol, the next punch is predicted. With chance LEVELS.beat he holds the guard for a head shot or steps back for a body shot. Reads only the delayed view. TEMPER beatTol .14, beatLead .2.
- TEMPER.tempo .4 to .7. Normal spareFrom -5, spareHead 3, beat .6, lostLead 2. Hard spareFrom -2, spareHead 2, beat .85, lostLead 3.
Measured, win % normal / hard, n=40, seeds 81000+. "Before" is the verified code, same seeds. Basket rows over the line: before 34 of 38, now 10 of 38.
| Row | Before | Now | Line |
|---|---|---|---|
| bodyL+bodyR 1.3 s beat | 97.5 / 92.5 | 40 / 0 | 50 / 25 |
| jab+bodyL 1.2 s beat | 95 / 85 | 32.5 / 0 | |
| one-two 1 s pause | 87.5 / 72.5 | 62.5 / 7.5 | OVER on normal |
| one-two 1.5 s pause | 77.5 / 60 | 42.5 / 12.5 | |
| hook+cross .9 s beat | 70 / 55 | 75 / 47.5 | OVER both |
| jab cross hook, back, wait for bar 60 | 75 / 75 | 97.5 / 50 | OVER both, got worse on normal |
| one-two, guard after a hit, step back | 92.5 / 77.5 | 87.5 / 47.5 | OVER both |
| hook+upper in turn 1 s | 82.5 / 57.5 | 60 / 32.5 | OVER both |
| sloppy jab+bodyL | 87.5 / 92.5 | 60 / 2.5 | OVER on normal |
Yardsticks now, E / N / H: mixed 62.5 / 30 / 0, learner 65 / 20 / 7.5, skilled 100 / 70 / 37.5. Targets: mixed 40-65 / 10-30 / at most 10, learner 55-80 / 25-45 / 5-20, skilled at least 85 / 60-70 / 30-45. Learner on normal is under its band, mixed on normal and skilled on normal sit at the top edge, all on small samples.
Next, in order:
1. What is left over the line steps away between combos or uses hooks. Stepping back after a combo breaks the beat read's range and resets his soft. Lower threatAt or make being behind on the head race shorten his gaps (heat), and give him a lunge or chase against a man who steps out after a combo. Check the two jch-back60 and j2-guardback rows first: they are the worst.
2. Learner on normal needs about 10 more points without lifting skilled (top of band): try spareFrom lower only while the man's land share is low, or more softness once ahead (TEMPER.load).
3. Skilled decisions on normal near 25 (one miss at 24 in the check): try kdBase .16 to .13, or head load x.98. Not touched yet.
4. Whole table at n=200 on two own seed ranges, checker's tools on own seeds, Chrome run of simtest.html, same seed 20 of 20, rule breaks.

## Round 3: continuing the fixes from Round 2 (in progress, started 2026-11-06 20:00 KST)
Tools: scratchpad `balance/fix/b.py n seed --ov JS --lv normal --yl normal --brief` (yardsticks and a 30-policy basket), `d.py` (AI inner state per round; ai.js now returns `state: S`, read-only). Inert knobs added so far, defaults keep behaviour: TEMPER softPunish, softOut, gasBack, blockPunish, slowSoft; LEVELS slowRead; TUNE.whiffRec. Findings at n=40, seeds 81000+: with spar 0 everything is under the line except j2gb (52.5) but mixed and learner win 0 and skilled falls to 52.5. Reading slow punches more (slowRead) costs skilled far more than the no-timing bots. Better presser stamina (rest further out, gasBack) also costs skilled and not them. Sparing punish is what mixed and learner live on.
Key finding (n=100, seeds 81000+): a routine signal fixes the hole. ai.js now learns the man's punch order (learnOrder: order-2 table, how often the guess is right = S.pred). Recipes reach .97, mixed .2, learner .35-.45, skilled .55-.67. Past routineFrom he stops sparing, works faster (routineTempo) and punishes more (routinePunish). Over the line fell from 17 of 60 to 1 of 70 (a random-button policy I added). Values live in TEMPER. Still to do: fine tune, full n=200 table on two own seed ranges, checker's tools on own seeds, Chrome run.
More findings, n=60-100, seeds 91000+: holding a guard on a predicted beat burned his stamina (gas 40-83%), so LEVELS.beat is 0 now. A head-load budget (L.budget, budgetLine) turns heat on when he is carrying more than a beginner could have put on him by now. A stop-jab on entry (L.intercept) made things much worse: one-two went to 82. Global gasBack cuts skilled from 65 to 38, so it is not used. Lunge .3 or lungeReach .2 did not clearly help.
Code cleaned (scratchpad `balance/fix/ai_before_cleanup.js` holds the version with the failed knobs). ai.js now has: routine (learnOrder), budget heat, felt counter, kiteStep. sim.js is back to HEAD. n=60, seeds 91000+, before cleanup: mixed 65/15/3.3, learner 61.7/28.3/8.3, skilled 100/60/31.7; over the line 2 of 96 (gb2, gb8 at 55, 53 on normal). Next: skilled decisions (20%, need 25+), then the whole table at n=200 on two own seed ranges and the checker's tools on own seeds.
Saved at usage 64 of the 67 line. Values now in code (candidate E5): LEVELS normal hurtHead 12, spareFrom -6.5, budget .12; hard hurtHead 12, spareFrom -3, budget .105; TEMPER softFrom .45, load 3.6; head load x.97 in PUNCHES. Measured n=100, seeds 94000+: mixed n 26 h 6; learner n 34 h 12; skilled n 68 h 37; skilled decisions 28, stopped 26, KO+TKO 46, round 3 87. Easy not yet re-measured on these values. Next if restarted: `cd balance/verify; python3 table.py 94000 200; python3 ev.py out/t94000_200_harness -q`, then a second seed range, then bconf.py, short.py, pols.py, sloppy.py, boring.py, grid.py on own seeds.

### Round 3 result (final code, TEMPER.softFrom .46). Status: finished as far as the usage line allowed, see the tables just below.
What changed against the verified code:
- ai.js learnOrder: he learns the order of a man's punches (order-2 table). S.pred is how often his guess is right: recipes reach .97, mixed .2, learner .35-.45, skilled .5-.7. Past routineFrom .75 (span .12) a man has a routine: no sparing at all, gaps x(1-.3), punish +.3. LEVELS.routine switches it on (easy 0, normal and hard 1), so a new player on easy is not punished for repeating himself.
- ai.js budgetLine: heat when his head load runs past what a beginner could have put on him by now (L.budget .12 normal, .105 hard, 35% more after round 1, budgetAt 1.5, span 2).
- ai.js felt: against a routine (S.routine past feltFrom .6) he goes on the punch he feels land, not the one he sees, by L.felt (.8, .9). kiteStep .35: he steps deeper into a punish on a man who always leaves. These two closed the step-back hole.
- readBeat and the guard held on a predicted beat removed: it burned his stamina (gas 40-83%) and stopped his offence.
- Sparing retuned now that routine men are out of it: spareFrom -6.5 normal, -3 hard; hurtHead 12; softFrom .46 (he starts sparing a little earlier, which is what lifts skilled); TEMPER load 3.6, close .35, retreat .6. sim.js: head load x.97 on all four head punches, for skilled decisions. Nothing else in sim.js.
- createAI also returns state: S, read by the scratch tools only.
Tried and dropped, all n=40-60: slowRead (reading slow punches costs skilled 20 points and no-timing bots nothing), intercept stop-jab (one-two went from 42 to 82), stop-cross on the beat, global gasBack (skilled 65 to 38), backSpeed .7, moveRec .25, whiffRec .06, routineEase, kdBase .13.
Not run on the final code: Chrome (the brief did not ask for it, simtest.html is unchanged and its harness is the same rules), the checker's grid.py and boring.py, sloppy.py at n=100. grid.py at the earlier stage: 1.3% of 300 random recipes over the line at n=12, against 29.8% before. No human has played this.

## Round 4: confirm Round 3 and run what it left out (started 2026-11-07 18:05 KST)
Code on disk at the start equals HEAD (sim.js 76b331f7a3480570, ai.js b00a3cbac537fcd6, simtest.html c009adc5f8900614, sha256 first 16). LEVELS and TEMPER values read against the Round 3 notes and they match. My seeds: 110000+ and 120000+ for the table (120000+ with the game's seed rule), 111000+ for the checker's policy tools.
Measured on the code at the start of Round 4, seeds 110000+, n=200 (checker's tools, `balance/verify`, saved in `balance/verify/out/r4_*`): the beat policies and named recipes are all far under the line, best hook+cross .9 s 7 / 5.5, jab cross hook 1 s 8 / 0, mash cycle 26 / 8.5. Table misses at n=200: easy mixed 65.5 (40-65), normal mixed 33 (10-30). Normal learner 27.5 is near the bottom of its band.
Second range on the same code, seeds 120000+, game seed rule, n=200: all targets met (mixed 64 / 25 / 2.5, learner 69 / 34 / 10, skilled 99.5 / 63 / 34.5). A third, seeds 200000+: mixed 64 / 27 / 2.5, learner 69 / 32.5 / 6.5, skilled 98.5 / 62.5 / 33. Pooled over the three, true values sit near: easy mixed 64.5 (top edge of 65), normal mixed 28 (top 30), hard learner 7 (bottom 5). So work on: mixed down a little on easy and normal, not learner. Experiments run on a copy in `balance/r4/arena/`, the project's files are only changed when a candidate is chosen.
Checker's tools on the start-of-Round-4 code, own seeds: boring.py n=100 seeds 113000+: 1 of 84 over the line, hook+bodyL .7 s beat 58 / 31. grid.py 500 12 seeds 114000+: 1.4% pass at n=12; 3 of 41 stay over at n=48: jab only, pause .4, wait for bar 40 (56 / 56, 67 / 50, all decisions), cross+upper in turn, pause .6, step back (71 / 12.5). sloppy.py n=100 seeds 112000+: all at most 8 / 2. So a few narrow holes remain; working on these next. Candidate knob so far (copy only): LEVELS gasSoft and gasFrom, soft fades when the man's bar is under gasFrom, lowers mixed much more than learner. n=400 seeds 210000+ on normal, from 15: gas 0 mixed 22.8 learner 26.8 skilled 67; .08: 22 / 26.3 / 65.8; .12: 15.5 / 23.5 / 68.3.
Holes at n=200 seeds 220000+ on that code: jab with a bar floor 62.5-71.5 / 42-50, cross+upper in turn stepping back 66.5 / 11, hook+bodyL .7 s beat 54.5 / 24.5. Causes found: (1) waitOut has no end, so against a one-button man whose bar never empties he only ever punishes. A limit of 8 s per round (TEMPER.waitMax) takes all those to 0 / 0. (2) A held routine is read too late on normal once he is hurt: .18 s react cannot guard a .26 s cross at head 7+. React is the only value that moves it (hard's .13 gives 19.5, but costs skilled 13). Scaling his delay down with S.routine (TEMPER.routineSee .28, floored at hard's react) takes cross+upper to 28 without touching men with no routine. (3) hook+bodyL .7: dropped presses at an empty bar break the order, so pred stays .47 and he spares him: gasSoft takes it down. Testing these on the copy, candidate values so far: waitMax 8, routineSee .28, normal gasSoft .12 gasFrom 20, normal budget .105.
Added on the copy: heavyRead (he reads a heavy punch he has seen often even while sparing, soft takes less off that read: S.freq above .2, span .2): hook+bodyL .7 s 50 to 22-27, nothing else moved. n=800 seeds 250000+ on normal, mixed / learner / skilled: base with waitMax 8 25.3 / 29.1 / 66.6; routineSee .28 25.3 / 29.3 / 64.6; plus heavyRead 1 23.6 / 27.9 / 63.9; plus gasSoft .08 gasFrom 15 18 / 29.1 / 60.9. Next: a sweep for what lifts learner, then copy the chosen values into the project's ai.js, then the final table and tools. The experiment copy is `balance/r4/arena/ai.js`, tools `balance/r4/y.py`, `h.py`.
Chosen and now in the project's ai.js (ai.js sha256 starts as shown in the final section): TEMPER routineSee .28, heavyFrom .2, heavySpan .2, heavyRead 1, gasFrom 15, gasSpan 10, waitMax 8; LEVELS gasSoft easy .2, normal .05, hard 0. sim.js untouched. n=800 seeds 251000+ on the copy, normal, mixed / learner / skilled: 20.9 / 30.8 / 64.4. Next: final table on two seed ranges (130000+, 140000+ with the game rule), checker's tools on seeds 131000+, same seed, Chrome. Results land in `balance/verify/out/r5_*`.
First final table on those values, n=200: seeds 130000+ mixed 59.5 / 20 / 2.5, learner 70.5 / 25.5 / 8.5, skilled 100 / 62 / 29 (hard skilled missed). Seeds 140000+ game rule: mixed 66 / 18 / 1.5, learner 62 / 32.5 / 4.5, skilled 99 / 63 / 27.5 (easy mixed, hard learner, hard skilled missed). So one more small step, now in the project: hard react .14, normal react .185, TEMPER reactFloor .13 (he reads a routine down to that), normal hurtHead 14, gasSoft easy .25, normal .08, hard 0. Hard's delay stays above .13 always. Final table and tools running against this: seeds 150000+, 160000+ with the game rule, policy tools seeds 151000+ to 154000+, logs `balance/verify/out/r6_*`.
Table on react .185 / .14: seeds 150000+ mixed 59.5 / 19 / 3.5, learner 68.5 / 24 / 9.5 (normal learner missed by 1), skilled 99 / 60.5 / 36. Seeds 160000+ game rule: mixed 56.5 / 25.5 / 1, learner 63 / 34.5 / 9, skilled 100 / 62 / 37.5, all met. n=800 seeds 256000+, normal: 22.1 / 30.8 / 66.9, so that 24 is sample noise around 30; react .19 gives 23.9 / 34 / 71, too high for skilled, not taken. boring.py n=100: one over the line, hook+upper .9 s on hard 28; at n=400 it is 22.8. Plan: hard gasSoft .2 (n=400: hook+upper .9 hard 13.5, mixed 1, learner 10.5, skilled 38.3), then re-run the hard rows only, because normal and easy never read LEVELS.hard.
Hard gasSoft .2 now in the project. Re-running only the hard rows of the two tables and of the policy tools (`balance/verify/r7.py`, log `out/r7_hard.log`), then Chrome once (`out/r7_chrome.txt`). Normal and easy rows stand, because they never read LEVELS.hard.

### Round 4 result (final code: sim.js 76b331f7a3480570, ai.js 0ff0c613ca5e1e15, simtest.html c009adc5f8900614, sha256 first 16; sim.js and simtest.html unchanged in this round). Status: finished.
What changed against Round 3, ai.js only:
- waitMax 8 s per round: waiting out a one-button man now ends. Closes jab with a bar floor (62.5-71.5 / 42-50, all decisions, now 0 / 0).
- routineSee .28, reactFloor .13: he sees a punch sooner against a held routine, never under .13 s. Closes cross+upper in turn stepping back (66.5 to about 30 on normal).
- heavyRead 1, heavyFrom .2, heavySpan .2: a heavy punch that makes up much of what a man throws gets read even while sparing. Closes hook+bodyL .7 s (54.5 / 24.5, now 26 / 0).
- gasSoft easy .25, normal .08, hard .2, gasFrom 15, gasSpan 10: sparing fades on a man whose bar is nearly empty. This is what brings mixed down without learner, so emptying yourself is a real risk.
- Normal react .185 (was .18), hurtHead 14 (was 12). Hard react .14 (was .13). These give back what the rules above took from learner and skilled.
Tried and not kept: feast on a tired routine man (moved nothing), budget .105 on normal (learner -4), backRead changes (noise at n=400 and no effect at n=600), normal react .19 (skilled 71 at n=800).
Final table, n=200 per row, checker's tools: seeds 150000+ harness rule / seeds 160000+ game rule. `table.py`, `ev.py`, logs `balance/verify/out/r7_ev*.txt`. Hard rows re-run after the last value (hard gasSoft); easy and normal rows stand because they never read LEVELS.hard, and three spot rows re-run on the final code gave the same results.
| Measure | Easy | Normal | Hard | Target E / N / H |
|---|---|---|---|---|
| mixed win % | 59.5 / 56.5 | 19 / 25.5 | 3.5 / .5 | 40-65 / 10-30 / at most 10 |
| learner win % | 68.5 / 63 | 24 MISS / 34.5 | 9 / 8 | 55-80 / 25-45 / 5-20 |
| skilled win % | 99 / 100 | 60.5 / 62 | 30.5 / 34 | at least 85 / 60-70 / 30-45 |
| mixed ended in round 1 % | 0 / 0 | 0 / 0 | 0 / 0 | at most 20 / 35 / 60 |
| learner ended in round 1 % | 0 / .5 | 1.5 / .5 | .5 / 1 | at most 20 / 35 / 60 |
| idle, turtle win % | 0, 0 | 0, 0 | 0, 0 | 0 |
Normal, two ranges: mixed 201.5, 200 s; learner 173.2, 169.7 s. Spam win % at most 3 on normal, at most 4 on hard; every button lands (lowest cross, hook, upper about 5-12%). Runner 0, 0; guardjab 0, 0. Skilled reach round 3 86.5, 85.5; decisions 31, 30; KO+TKO 40, 42; stopped 29, 28; whiff 26.7, 26.6; AI whiff 28.1, 28.2; slips 3.2, 3.3 of the AI's head punches. Mixed stopped 28.5, 26.5. Stop median HP pooled: player 51.1, 51.5, AI 59.4, 60.7; in single rows mixed 45, 44, learner 51, 50, skilled 55, 55, AI by skilled 61.5, 63. Dead p90 against mixed 3.98, 3.74, against skilled 4.47, 4.32. Round styles, jab R1/R3, body R1/R2/R3, distance R1-R2: skilled 54.3/24.8, 3.7/30.9/6.7, .171 and 53.4/25.3, 3.4/30.6/6.5, .169; learner 64.4/30.7, 7.2/44.2/9.8, .216 and 62.8/30.3, 7.2/44.9/10, .212; mixed 69.8/36.2, 9.6/61.5/9.4, .185 and 71.3/34.5, 9.3/60.8/10.8, .183. Rule breaks none. Smallest distance .72.
Chrome, once, simtest.html, `SIMTEST.run({n:200})`, seeds 1000+, final code, 263 s: 78 of 78 checks met, same seed 20 of 20, slip 96.3. Mixed 46 / 23.5 / 2, learner 65.5 / 33.5 / 8, skilled 99.5 / 63 / 41.5, idle, turtle 0.
Larger sample on normal (n=800, seeds 256000+, same normal values): mixed 22.1, learner 30.8, skilled 66.9. So the 24 is a low draw around about 30. Hard skilled reads 30.5, 34, 41.5 across three ranges: about 35, thin at the bottom.
ev.py also prints a miss "rounds of 60 s in decision matches" (20, 13): that line is the checker's own tolerance being tighter than the ticks when the state turns back to fight, as balance-verify.md says. scripted.py on final code: 60 rounds, largest error .0083 s, breaks 0.
Scripted on final code: fastest route, median fight seconds: hook 11.3, hook+upper 14.1, cross+hook 16, jab+hook 17.8, upper 20.3, cross 33.2, jab+cross 46.4, jab 110.2. Median HP at a hook stoppage 63.9. Same seed 20 of 20 across two processes.
Checker's policy tools on own seeds, final code, win % normal / hard. Line 50 / 25. No policy over the line.
- bconf.py n=200, seeds 151000+: bodyL+bodyR 1.3 s 0 / 0, 1.1 s 0 / 0, jab+bodyL .7 s .5 / at most 6.5, 1.1 s 0, hook+bodyL 1.1 s .5, hook+cross .9 s 19 / 6.5, jab+cross 1.1 s 0, .9 s 1 / at most 6.5.
- boring.py n=100, seeds 153000+: normal top hook+upper .9 s 35, hook+bodyL .7 s 26, jab+hook .7 s 17. Hard after hard gasSoft: top hook+cross .9 s 12, hook+upper .9 s 11. 0 of 84 over.
- short.py n=200, seeds 151000+: top jab cross hook 1 s 9 / 1, one-two .6 s 1.5, cross hook 1 s 1.5. pols.py n=200: top mash cycle 18.5 / at most .5 (all six buttons in turn), block then hit 2.5. sloppy.py n=100, seeds 152000+: at most 2 / 1.
- grid.py 500 at n=12, seeds 154000+: 0% over the line, 0 of 41 at n=48. Top jab+hook, step back, wait for bar 25: 35 / 19.
Normal rows come from the r6 logs (they never read LEVELS.hard), hard rows from `r7.py` on the final code.
What to look at next:
- Thin: normal learner (true about 30, band from 25), hard skilled (about 35, band from 30), skilled slip (3.2-3.4, line 3), skilled decisions (about 30, line 25).
- For a person: a held routine is now punished hard on normal and hard. A strict one-two on normal wins 0 to 1%, while random buttons win about 22% and the learner about 30%. Easy has routine off. Nothing in the targets asks for a floor here, but if a first-timer feels this as a wall, ease routineTempo or routinePunish: the policies have room under the line now.
- No human has played these numbers and the real game with rigs was not run here.
