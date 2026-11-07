# Balance verification

Independent check of the balance work. Scripts: /private/tmp/claude-501/-Users-elliot-jeong-Downloads-Inside-the-Impact/a4d575ac-45f5-438b-a265-75fe753a2111/scratchpad/balance/verify (vlib.js my own measuring loop, v.py runner, table.py target table, pol.js player policies, out/ saved rows).

## Round 1 results (2026-11-06)
**Verdict: failed.** Simple policies with no timing beat the AI far past the line on normal and hard. The most boring one: walk at him and tap left body, right body every 1.3 s, looking at nothing, wins 93.5 on normal and 94 on hard, all on points, never touching his head. The target table was met on seeds 50000+ and 60000+; on seeds 70000+ skilled decisions came in at 24 against 25-50. The AI does not cheat and nothing in the contract was removed.

Code under test: HEAD 5d6668b, sim.js 21e694f5ca844352, ai.js 528b13922a53ec6b, simtest.html c009adc5f8900614. My own loop (`vlib.js`) copies the frame loop in index.js; on skilled normal and learner hard at n=200 its counts equal the page harness. All tables 200 per row unless stated.

### Targets, win % easy / normal / hard
| Measure | seeds 50000+ | seeds 60000+ | seeds 70000+, game seed rule | Target |
|---|---|---|---|---|
| mixed win % | 47 / 21.5 / 2.5 | 43.5 / 18 / 8 | 52 / 25.5 / 5 | 40-65 / 10-30 / at most 10 |
| learner win % | 58.5 / 30.5 / 10 | 63 / 39.5 / 10.5 | 57 / 30 / 8 | 55-80 / 25-45 / 5-20 |
| skilled win % | 100 / 69 / 36.5 | 99.5 / 70 / 33.5 | 100 / 68.5 / 36.5 | at least 85 / 60-70 / 30-45 |
| mixed ended in round 1 % | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | at most 20 / 35 / 60 |
| learner ended in round 1 % | 0.5 / 0.5 / 1 | 1 / 0 / 0.5 | 1 / 0 / 0.5 | at most 20 / 35 / 60 |
| idle, turtle win % | 0, 0 / 0, 0 / 0, 0 | 0, 0 / 0, 0 / 0, 0 | 0, 0 / 0, 0 / 0, 0 | 0 |
| normal mixed, learner seconds | 201.2, 169.4 | 201.3, 169.8 | 201.6, 171.5 | at least 80 |
| normal spam win %, jab cross hook upper bodyL bodyR | 0, 0, 11.5, 0, 2.5, 0.5 | 0, 0, 12, 0, 2.5, 0 | 0, 0, 6.5, 0.5, 2, 0 | at most 35 |
| hard spam win % | 0, 0, 2.5, 0, 2, 0 | 0, 0, 3, 0, 1, 0 | 0, 0, 5.5, 0, 0, 0 | at most 15 |
| normal spam land % | 71, 10, 14, 15, 86, 79 | 71, 10, 14, 14, 86, 78 | 71, 10, 13, 15, 85, 79 | above 0 |
| normal runner, guardjab win % | 0, 0.5 | 0, 0 | 0, 0 | at most 35 |
| skilled reach round 3 % | 84.5 | 84 | 85.5 | at least 50 |
| skilled decisions % | 27.5 | 29.0 | 24.0 | 25-50 |
| skilled KO plus TKO % | 41.0 | 45.0 | 43.5 | at least 15 |
| skilled stopped % | 31.5 | 26.0 | 32.5 | 20-45 |
| mixed stopped % | 29.5 | 28.0 | 25.5 | at most 60 |
| median HP at a stoppage, player, AI, pooled | 54.6 (n 1405), 61.5 (n 84) | 54.9 (n 1385), 62.2 (n 72) | 54.7 (n 1390), 60.8 (n 76) | 40-65 |
| skilled whiff %, AI whiff against skilled % | 27.4, 28.4 | 27.8, 29 | 27.8, 28.4 | at most 40 |
| dead time p90 against mixed, skilled, s | 3.75, 4.12 | 3.76, 4.03 | 3.72, 4.33 | at most 6 |
| skilled slips AI head punches % | 3.3 | 3.2 | 3.3 | at least 3 |
| jab share R1 / R3 against skilled | 56.3 / 23 | 55.9 / 23.8 | 56.7 / 23.1 | R1 at least 1.5x |
| body share R1 / R2 / R3 against skilled | 3.8 / 31.9 / 6.9 | 3.6 / 31.7 / 6.7 | 3.4 / 32.4 / 6.6 | peak in R2 |
| mean distance R1 / R2 against skilled | 1.162 / 0.992 | 1.165 / 0.995 | 1.161 / 0.989 | R2 at least .15 closer |
| jab share R1 / R3 against learner | 66.2 / 27.7 | 68.2 / 27.9 | 66.5 / 28.4 | R1 at least 1.5x |
| body share R1 / R2 / R3 against learner | 8.6 / 46.2 / 10.6 | 8.6 / 44.5 / 10.2 | 9 / 46.1 / 10.7 | peak in R2 |
| mean distance R1 / R2 against learner | 1.078 / 0.851 | 1.077 / 0.853 | 1.076 / 0.85 | R2 at least .15 closer |
| jab share R1 / R3 against mixed | 72.2 / 31.8 | 73.2 / 33.7 | 72.9 / 32.2 | R1 at least 1.5x |
| body share R1 / R2 / R3 against mixed | 10.5 / 65.9 / 11.8 | 9.5 / 66.1 / 10.9 | 9.6 / 66 / 12.1 | peak in R2 |
| mean distance R1 / R2 against mixed | 1.006 / 0.815 | 1.007 / 0.815 | 1.006 / 0.815 | R2 at least .15 closer |
| normal endings, all rows | KO 263, TKO 457, stopped 1703, decision 177 | KO 281, TKO 475, stopped 1658, decision 186 | KO 271, TKO 487, stopped 1672, decision 170 | each above 0 |
| rule breaks, 7800 matches | none | none | none | none |

Seeds 70000+ use the rule index.js uses to seed the AI and a bot (seed+1, seed+2); the others use the page harness rule. Thin margins: skilled on normal sits at the top of its band, and skilled decisions at the bottom of its band with one miss. Median HP inside single rows on normal goes outside 40-65 in two places: player stopped while spamming left body 69.6, 68.9 on seeds 50000+, 70000+, right body 66.6 on seeds 70000+, and AI stopped by skilled 65.35 on seeds 60000+. The pooled medians are inside. Counting whiffs only among punches that resolved, seeds 50000+, skilled 31.5 and the AI 33.

Scripted (scripted.py): slip pressed inside the window, 880 shots (4 head punches, 4 distances, 5 directions, 11 press times): evaded 95.5% (80.1 slipped, 15.3 whiff); with no slip the same shots land 100%. Fastest route, a standing man, median fight seconds to the stoppage: hook 10.6, hook plus uppercut 13.1, cross plus hook 16, jab plus hook 16.7, uppercut 19, cross 32.1, jab plus cross 44.6, jab 104.5. Median HP at a hook stoppage 64.1. Same seed 20 of 20, also the same across two separate runs. TUNE.getUpTime 1.7.

Chrome: `gfx/dev/simtest.html` in headless Chrome, skilled normal and learner hard, seeds 50000+, n=200: both rows equal JavaScriptCore in every field I compared, in a hash of the whole row and in a chained hash over the 200 matches. Reach read in the page equals reach.json.

### Dominant strategies: FAILED
Line: wins over 50% on normal or over 25% on hard with no real timing. Each policy sees the rival 250 ms late. Win %, normal / hard, n=200, seeds 50000+.
| Policy | Normal | Hard | How it wins | Over the line |
|---|---|---|---|---|
| Body shots only, step off when the bar is low | 96 | 93.5 | KO 0, TKO 0, stopped 0, decision 192 | yes |
| Hook and uppercut in turn from close | 70 | 49 | KO 77, TKO 20, stopped 43, decision 0 | yes |
| Jab, cross, hook, then a breath | 42.5 | 31 | KO 38, TKO 15, stopped 32, decision 0 | yes |
| Guard up, body shots | 33 | 35 | KO 0, TKO 0, stopped 0, decision 66 | yes |
| Back on the ropes, guard, one-two | 21.5 | 11 | KO 26, TKO 4, stopped 13, decision 0 | no |
| All six buttons in turn | 16.5 | 4.5 | KO 19, TKO 5, stopped 9, decision 0 | no |
| Block, then hit back (timed) | 4.5 | 0.5 | KO 2, TKO 3, stopped 4, decision 0 | no |
| Jab, step straight out | 2 | 0.5 | KO 0, TKO 0, stopped 0, decision 4 | no |
| Circle, cross on a beat | 1.5 | 0 | KO 0, TKO 0, stopped 0, decision 3 | no |
| Back on the ropes, guard, counter | 0.5 | 0 | KO 0, TKO 1, stopped 0, decision 0 | no |
| Cross, step out | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Wait for a whiff, then a cross (timed) | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Slip spam, no punches | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Slip then cross | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Hook only, from close | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Uppercut only, from close | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Guard up, walk in, one hook | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Guard up, walk in, one cross | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Damage early, run till the bell | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Backing away, cross when near | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Stand still, cross what comes | 0 | 0 | KO 0, TKO 0, stopped 0, decision 0 | no |
| Jab then left body, 1.3 s pause | 93 | 89 | KO 0, TKO 0, stopped 0, decision 186 | yes |
| Left and right body in turn, .8 s pause, bar at 25 | 88 | 85 | KO 0, TKO 0, stopped 0, decision 176 | yes |
| One-two, 1 s pause | 85.5 | 82 | KO 57, TKO 45, stopped 69, decision 0 | yes |
| Jab then right body, 1.3 s pause | 85.5 | 78 | KO 0, TKO 0, stopped 0, decision 171 | yes |
| One-two, step back, guard after a hit | 85 | 69 | KO 60, TKO 47, stopped 63, decision 0 | yes |
| Jab, cross, hook, step back, wait for bar 60 | 84 | 70 | KO 66, TKO 27, stopped 75, decision 0 | yes |
| One-two, 1.5 s pause | 75.5 | 54 | KO 78, TKO 26, stopped 47, decision 0 | yes |
| Hook and uppercut in turn, 1 s pause | 75 | 47.5 | KO 70, TKO 27, stopped 53, decision 0 | yes |
| Uppercut and left body in turn, 1.6 s pause | 65 | 72.5 | KO 2, TKO 1, stopped 0, decision 127 | yes |
| Walk at him, tap bodyL+bodyR every 1.3 s, looks at nothing | 93.5 | 94 | KO 0, TKO 0, stopped 0, decision 187 | yes |
| Walk at him, tap bodyL+bodyR every 1.1 s, looks at nothing | 95 | 91.5 | KO 0, TKO 0, stopped 0, decision 190 | yes |
| Walk at him, tap jab+bodyL every 0.7 s, looks at nothing | 96 | 97 | KO 0, TKO 0, stopped 0, decision 192 | yes |
| Walk at him, tap jab+bodyL every 1.1 s, looks at nothing | 93.5 | 97 | KO 0, TKO 0, stopped 0, decision 187 | yes |
| Walk at him, tap hook+bodyL every 1.1 s, looks at nothing | 75 | 56 | KO 59, TKO 18, stopped 73, decision 0 | yes |
| Walk at him, tap hook+cross every 0.9 s, looks at nothing | 73 | 57 | KO 63, TKO 20, stopped 63, decision 0 | yes |
| Walk at him, tap jab+cross every 1.1 s, looks at nothing | 17 | 27 | KO 15, TKO 3, stopped 16, decision 0 | yes |
| Walk at him, tap jab+cross every 0.9 s, looks at nothing | 7 | 16 | KO 12, TKO 1, stopped 1, decision 0 | no |

His notes list four of his scratch strategies and not his body one. Rewritten here from his script, at the same 250 ms view: bodywork 36 / 26.5, onetwo 18 / 4, hookcross 7 / 1.5, hookpause 4.5 / 0.5, jabrun 0 / 0, standjab 0 / 0. They read lower than his n=50 table; his version read the true distance, which may be why. Not tested.

Random search (grid.py): 29.8% of 500 random simple recipes pass the line at n=12, and all 41 re-run at n=48 stayed over it.
Walk at him and tap on a fixed beat, n=100: 50 of 84 two-button patterns pass the line.

Why, my reading of ai.js against these numbers, tested only as far as spar.py below goes: one button is caught (`S.same >= 5` gives the full fight, so hook only is 6 / 1 and body only 0 / 0), and 6 throws in 3 s is caught (one-two at a .6 s pause 11.5 / 2.5). Any two-button pattern slower than that keeps him in soft, which spares a man who is not defending. Heat is the way out of soft, and heat only reads head load, so body work never raises it: he stays soft all fight and loses every round on damage. Difficulty hardly matters there: uppercut and left body is 65 on normal and 72.5 on hard.

Played by a sloppy person, n=100 (sloppy.py), to see if the wins need exact range and exact presses: 
```
n 100 seed0 50000  normal/hard win, by sloppiness (range error m, press delay s): clean 0/0, some .08/.1, sloppy .15/.2
onetwo-1s              clean: 91/77 land 39 whiff 37 | some: 86/69 land 40 whiff 36 | sloppy: 78/47 land 42 whiff 34
onetwo-1.5s            clean: 80/52 land 44 whiff 33 | some: 69/40 land 44 whiff 30 | sloppy: 61/23 land 44 whiff 28
jab-bodyL-1.3s         clean: 95/92 land 67 whiff 23 | some: 88/85 land 68 whiff 21 | sloppy: 84/75 land 69 whiff 20
bodyLR-1s              clean: 90/84 land 75 whiff 13 | some: 77/63 land 75 whiff 12 | sloppy: 69/57 land 76 whiff 11
jab-cross-hook-1.5s    clean: 78/56 land 40 whiff 36 | some: 74/42 land 36 whiff 40 | sloppy: 63/37 land 36 whiff 40
```

Sparing off in memory only, n=100 (spar.py), not a proposed fix: 
```
onetwo-1s  normal  as is   win 86 {'ko': 29, 'tko': 23, 'stopped': 34, 'decision': 0} secs 107.8 AI thrown 52.1 land 74.5 took/gave clean 33.4 42.6 kd p/o 0.29 1.46
onetwo-1s  normal  spar 0  win 39 {'ko': 26, 'tko': 4, 'stopped': 9, 'decision': 0} secs 121.5 AI thrown 63.5 land 71 took/gave clean 41.7 36.1 kd p/o 0.89 0.78
onetwo-1s  hard    as is   win 85 {'ko': 45, 'tko': 22, 'stopped': 18, 'decision': 0} secs 121 AI thrown 58.5 land 76.7 took/gave clean 37.3 44.8 kd p/o 0.36 1.52
onetwo-1s  hard    spar 0  win 4 {'ko': 0, 'tko': 0, 'stopped': 4, 'decision': 0} secs 97.6 AI thrown 57.4 land 80.2 took/gave clean 43 20.6 kd p/o 1.08 0.01
bodyLR     normal  as is   win 87 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 87} secs 203.4 AI thrown 93.3 land 82.6 took/gave clean 47 0 kd p/o 0.05 0
bodyLR     normal  spar 0  win 0 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 0} secs 145.5 AI thrown 73.8 land 76.8 took/gave clean 51.5 0 kd p/o 1.33 0
bodyLR     hard    as is   win 81 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 81} secs 203.4 AI thrown 92.8 land 83.6 took/gave clean 47.8 0 kd p/o 0.04 0
bodyLR     hard    spar 0  win 0 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 0} secs 119 AI thrown 63.3 land 78.2 took/gave clean 45.5 0 kd p/o 1.28 0
jab-bodyL  normal  as is   win 90 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 90} secs 203.8 AI thrown 92.1 land 76.8 took/gave clean 47.2 65.2 kd p/o 0.14 0
jab-bodyL  normal  spar 0  win 0 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 0} secs 132.2 AI thrown 71.3 land 67.6 took/gave clean 42.8 23.8 kd p/o 1.89 0
jab-bodyL  hard    as is   win 91 {'ko': 0, 'tko': 0, 'stopped': 0, 'decision': 91} secs 203.9 AI thrown 92.5 land 77.5 took/gave clean 47.6 65.5 kd p/o 0.11 0
jab-bodyL  hard    spar 0  win 0 {'ko': 0, 'tko': 0, 's
```

### AI does not cheat: passed
Read ai.js: `decide` reads the rival only through `eye.see` and, once at a round start, `foe.thrown`; nothing reads `_i`. A Proxy over the rival and the match in real matches (react.js, 18 matches, 166241 frames) confirms it: rival fields thrown, x, z, vx, vz, guard, stagger, slip, hp, sta, head, landed, down, punch, each once per fight frame, thrown once more per round; match fields state, time, round, ring only. Never p, o, events, rng or _i.
Real reaction, same seed twice with one press out of range, first frame of a real change, n=30 per row (react3.py): easy .30 s, normal .20, hard .15. At head load 8: .367, .25, .183. At head load 14: .43, .30, .217. Never below the level's react. Earlier changes exist but are at most .00008 of a move: they come from the sim turning him to face the rival, and they vanish with backSpeed 1.
Note, from reading only, not measured: for the first react seconds of a round he sees the first frame of the round, and just after a count he reads a stale sample with a large age, so his aim point can lurch for that moment. Neither gives him anything early.

### Contract: nothing removed
HEAD equals the working copy and already holds the balance work, so the comparison that means something is against d0e900e, the last commit before it. Run matches on both (contract.py): 19 event types, same fields on each; Match, Fighter, punch, down, result and Input fields all kept; every export kept. Added: export TEMPER, bots learner, runner, guardjab, new keys in TUNE, LEVELS and STYLES.
Readers, static scan (readers.py), so not proof at run time: hud.js, rig.js, index.js and also fightcam, fx, audio, coach read only fields that exist, with one exception: hud.js line 346 reads `ev.scores`, `ev.p`, `ev.o` on round_end, and `readResult` tries `r.type`, `r.method`. The sim never sent those, and d0e900e has the same line, so the balance work did not cause it. Harmless: `readScores` uses `m.scores`.

### Rules that must hold: all hold
HEAD 7, 13, 20. hud.js never reads fighter.head. coach.js, which index.js did not import when I looked, reads it to choose what the corner says at a break and shows no number. It is not the HUD; flagged so the main session can decide. Stoppages come with plenty of health left, see the pooled medians above. Reach: the run reads 1.05, 1.1, .91, .98, 1.09, 1.09, minSep .72, equal to reach.json; nothing writes REACH except setReach, which index.js line 345 calls with reach.json; the file has one commit. Rounds read off real fights with knockdowns: 3 of 60 s exactly in 569 rounds (42 with knockdowns) once the ticks where the state turns back to fight are taken out, raw at most .0417 s off, breaks 8 s, and index.js passes no other value. ev.py prints a miss on rounds of 60 s because its tolerance is tighter than the ticks where the state turns back to fight; that line is my check being too tight, not a broken rule. Yardstick bots idle, spam, mixed, skilled, turtle are byte-identical to d0e900e.

### Not checked
No human played. The real game with rigs was not run, as the brief forbids arena.html here. The clock jumped about an hour twice between my calls and other agents loaded the machine, so run times mean nothing here; results are unaffected because they are seeded. Reaction test n=30 per row. Random search rows use small samples and are only leads: the table rows above are n=200.

## Round 2 (2026-11-07) - in progress
Code under test: sim.js 76b331f7a3480570, ai.js 0ff0c613ca5e1e15 (uncommitted on realistic-3d), simtest.html c009adc5f8900614. Battery was 11% discharging at start; rows save per file so a restart resumes (`python3 table.py SEED 200 harness 6`). Logs in scratchpad balance/verify/out/r2_*.
R2 step 1 done: table seeds 50000+ (harness rule), n=200, my own loop (vlib.js reads reach.json via setReach before any match; old round-1 rows were moved aside, not reused). Saved: scratchpad balance/verify/out/r2_ev50000.txt. 87 of 88 checks met; the one miss is my checker's "rounds of 60 s in decision matches" tick tolerance (known, not a game fault: 7 of 2130 rounds).
Win % easy/normal/hard: mixed 48.5/25/1.5, learner 63.5/37/9, skilled 98.5/60.5/37, idle 0, turtle 0. Normal: mixed 201.9 s, learner 173.5 s; skilled r3 90%, decisions 35%, KO+TKO 37.5%, stopped 27.5%; mixed stopped 19%; stop median HP pooled 51.2 (player) 59.9 (AI); skilled whiff 26.8, AI whiff vs skilled 28.6; dead p90 3.92/4.52 s; slip 3.3%; jab R1/R3 2.21x vs skilled; body peak R2; dist R1-R2 .168 vs skilled; runner .5, guardjab 0; spam max normal 3.5 (hook), hard 1; every button lands.
Next: table seeds 400000+ game rule (running), new policies pol2.js, simtest.html in Chrome, scripted slip, same-seed, reaction, contract.
R2 step 2: seeds 400000+ game rule, n=200: all targets met (ev out/r2_ev400000.txt; easy mixed/learner/skilled 50/61/100, normal 20.5/40.5/60.5, hard 1/8/35). Normal skilled sits at 60.5 on both ranges (line 60).
R2 step 3 dominant strategy search (scripts pol2.js, p2.py, p3.py in scratchpad verify; n=200 each, no policy was seen by the tuner):
- Over the line: "HUG, random hook/upper/cross": walk in to .8 m, hands up between punches, press hook, upper or cross chosen at random every 1.4 s, looking at nothing but range. Normal 64.5 (seed 300000+), 62 (seed 50000+); hard 20 (seed 300000+, under 25). Hook/upper only random: normal 50.5 / 48.5, hard 6. Same without the guard: normal 37.5, hard 30.5 (over 25). Wins are KO 61, TKO 22, stopped 42 out of 129.
- The same hug played in a fixed order (upper, hook, upper...) wins 1.5; the policy is beaten by a fixed order and rewarded for randomness. A person who mashes close-range power buttons without a pattern wins most normal fights.
- Under the line (normal/hard, 50000+): pinner 0/0, outboxer 0/0, openhit .5/0, tirehook .5/0, slipthrow 0/0, retreatpunish 0/0, turtlejab 0/0. Random all six buttons from close 46.5 normal / 4.5 hard, all decisions.
R2 step 4 other checks (code now committed as 9bf806e, same hashes sim 76b331f7a3480570 / ai 0ff0c613ca5e1e15):
- Reach used by the run = reach.json (1.05 1.1 .91 .98 1.09 1.09, minSep .72). Chrome simtest.html and JSC give identical row hashes for skilled normal (1219949899 / -340291053, win 60.5) and learner hard (2146993163 / -2017362647, win 9), seeds 50000+, n=200.
- AI cheat: decide reads the rival only through eye.see (delayed) plus foe.thrown at a round start and pickPlan's signature; bots lines 323+ are bots, not the AI. Real reaction n=30 (react3.py): easy .30, normal .217, hard .167 s (min over all actions at head 0); at head 8 hard .20; never below the level react (.27/.185/.14). Hard floor TEMPER.reactFloor .13 holds.
- Scripted slip: pressed in the window evades 95.5% (80.1 slipped) of 880 head shots; same seed 20/20 across two processes; round timing max error .0083 s; breaks 8 s; hook fastest route 11.3 s (stopped at median HP 63.9). TUNE.getUpTime 1.7.
- Contract: sim.js unchanged vs earlier HEAD; no event type, field or export removed (19 event types, same fields); added only bots learner/runner/guardjab, TEMPER, TUNE and LEVELS keys, input.ai.state. hud.js, rig.js, index.js read no field that is missing (readers.py); hud.js never touches fighter.head (only document.head).

## Round 3 (2026-11-07/08)
Code under test: sim.js e6fc52b7b0c330be7b424cdf57a6f42d (equal to HEAD 020ba70), ai.js a38462d57beb116e64f346b9b3ba7c81 (uncommitted, differs from HEAD), simtest.html c492d5b8c29aba7ff435d9d6b75f3907. Scripts in scratchpad balance/verify: table.py, ev.py, pol3.js, p4.py to p8.py, polT.js (the tuner's rnd5 policy code, run by me); logs out/r9_*, out/r10_*. My own loop (vlib.js) calls setReach with reach.json before every match.
**Verdict: passed.** Two things to know, below under dominant strategies.

Targets, n=200 per row, fresh seeds, all 88 checks except my checker's known 60 s tick line (6 and 8 of about 2100 rounds, a tolerance in my checker; scripted max error .0083 s). Seeds 50000+ harness rule / 800000+ game rule:
| Measure | Easy | Normal | Hard |
|---|---|---|---|
| mixed win % | 48.5 / 50 | 22.5 / 21.5 | .5 / 0 |
| learner win % | 63.5 / 63.5 | 32 / 34.5 | 13 / 7.5 |
| skilled win % | 98.5 / 99.5 | 60.5 / 67 | 38.5 / 35.5 |
| idle, turtle win % | 0 | 0 | 0 |
Normal 50000+: mixed 201.5 s, learner 174.8 s; round 1 endings mixed .5, learner .5 (hard 0, 2); spam max win normal 2.5 (hook), hard .5, every button lands (jab 85.8, cross 6.8, hook 8.6, upper 9.6, bodyL 86.8, bodyR 86.3); runner 1, guardjab 0; skilled round 3 91, decisions 36 (32.5 on 800000+), KO+TKO 34 (42.5), stopped 30 (25); mixed stopped 26.5 (32.5); pooled stop median HP 51.4 player, 60.4 AI (51.6, 61.4), every single row with n at least 10 inside 40-65 (lowest spam upper 43.3, highest skilled-stopped-AI 63.65); every ending type occurs; whiff skilled 26.8, AI vs skilled 28.7; dead p90 3.92 mixed, 4.49 skilled (3.84, 4.48); slip 3.3 (3.4); jab R1/R3 vs skilled x2.27, body peak R2 (3.3/30.8/6.7), distance R1-R2 .169 (also learner .208, mixed .183); rule breaks none; smallest distance .72.
Scripted: slip in the window evades 95.5% of 880 head shots (80.1 slipped), no slip lands 100%; same seed 20 of 20, equal across two processes; rounds 60 of 60 s (max .0083 error), breaks 8 s; hook is the fastest route (11.3 s, stopped at median HP 63.9; upper 20.3 s); TUNE.getUpTime 1.7.
Chrome: gfx/dev/simtest.html, headless, skilled normal and learner hard, seeds 50000+, n=200: row hash and chained match hash equal JavaScriptCore (skilled normal 729666945 / -340319179, win 60.5; learner hard 327327134 / 937086669, win 13). Reach in the page equals reach.json (1.05 1.1 .91 .98 1.09 1.09, minSep .72). No console errors.
AI cheat: decide() reads the rival only through eye.see(now, foe) (delayed sample, aged by the real age) plus foe.thrown once per round (newRound); pickPlan takes foe but never reads it. Real reaction, same seed with one change, n=30: easy .30 s, normal .217, hard .167 (level react .27/.185/.14); hard at head 8 .20, at head 14 .233; never below the level react; hard floor TEMPER.reactFloor .13 holds. Tiny early movement (at most 8e-5 m) on easy/normal is the sim turning him to face the rival, not a reaction.
Contract: sim.js identical to HEAD. ai.js exports identical to HEAD. Against d0e900e (pre-balance): 19 event types, no field removed on events, Match, Fighter, punch, down, result; Input gained ai.state; added only bots, TEMPER, TUNE and LEVELS keys. Readers scan (hud, rig, index, fightcam, fx, audio, coach, menu): no missing field. hud.js never touches fighter.head. HEAD 7, 13, 20.

### Dominant strategies (new policies, seeds 50000+, n=200, normal / hard win %)
Not over the line: lastflurry (hands up, flurry last 15 s) 0 / 0; circlejab 0 / 0; cornerbody 0 / 0; threeback (jab jab cross, back out) 0 / 0; patient (throw only above bar 70) 0 / 0; clinch (jab, upper, bodyL at .75 m, hands up) 0 / 0; bankit (fight 30 s then coast) 0 / 0; standmash (stand still, random of six every .8 s, no hands) 28.5 / 3 (28.5 / 1.5 on 300000+); walkmash (walk in, random of six every .7 s, no hands) 31.5 / 8 (36.5 / 4); jab/cross from .9 m with a step back 35.5 / 5.5; jab/cross/hook from .74 m 6.5 / 3.5. All 84 fixed-beat pairs (boring.py, n=50, seed 90000): none over the line; top hook+cross .9 s 14 / 10. Re-checked top six beats at n=200 seed 700000: highest hook+upper .9 s 16.5 / 7.5.
Over the line, two items:
1. walkmash2: walk in to .78 m, random of the six every 1.2 s, hands up when close and between punches, looks at nothing else: normal 52 (seed 50000+), 54.5 (300000+); hard 11.5, 16.5. Over 50 on normal. It holds a guard and sits at close range, so it falls under the main session's ruling (close range, guard, pauses), and I do not count it.
2. The tuner's own tail policy (tail.json 30: cross and jab at random, walk to the reach of the chosen button, no guard, back off for the punch plus .3 s, pause .7 s, bar floor 28), run by me with its code, seed 50000+, n=200: normal 64.5, hard 61 (the tuner saw 67.5 / 68.5 and 62.5 / 57). Other no-guard members of the tail: tail 70 40 / 32, 42 33.5 / 23.5, 46 36.5 / 15. My own simple version of the same idea (jcback in pol3.js, .74 m, bar floor 28) gets only 39.5 / 12, so the win depends on the details: picking the button before walking in and backing off for the whole punch. It needs the right distance and the step back, so it is not buttons on a beat from any range, and under the ruling I do not count it. It is the strongest hard result I found and the tuner recorded it as accepted. A first-timer will not play it exactly; no human tested.
Most boring policy that still wins on normal: walkmash (walk in, mash random buttons on a beat, no guard): 31.5 / 36.5, below 50. The most boring one over 50 is walkmash2 above.

### Not checked
No human played; rigs and arena.html not run. Hard learner 7.5-13 and normal skilled 60.5 are close to their band edges, but inside it on both ranges. Only seeds 50000+ and 800000+ used for the table; policies on 50000+, a few on 300000+, 700000+, 90000+.
