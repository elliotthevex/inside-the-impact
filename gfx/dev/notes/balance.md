# Balance notes

Status: started. Working files: gfx/arena/sim.js, gfx/arena/ai.js, gfx/dev/simtest.html.
Originals before this pass are copied to the scratchpad `balance/orig/`, and git HEAD has sim.js and ai.js too.

Restart notes:
- Step 1 (in progress): harness calls setReach from reach.json, baseline re-run.

## Baseline at the rig's reach, before any tuning (200 per row, JavaScriptCore, seeds 1000+)
Harness now calls setReach from reach.json. win %, ended in round 1 %, seconds:
| bot | easy | normal | hard |
|---|---|---|---|
| mixed | 0, 100, 46 | 0, 100, 41 | 0, 100, 39 |
| learner | 0, 82, 62 | 0, 82, 58 | 0, 92, 52 |
| skilled | 90.5, 1, 178 | 63.5, 0, 187 | 21.5, 2, 148 |
| runner | 46 | 9 | .5 |
| guardjab | 2 | 0 | 0 |
Spam win %, normal / hard: jab 0/0, cross 23.5/22, hook 36/59.5, upper 12.5/11.5, bodyL 4/.5, bodyR 3/1.
Skilled normal: whiff 54.2, AI whiff 51.2, slips .7% of head punches, decisions 51.5%, stopped 26.5%, KO+TKO 22%. 27 of 77 checks missed.

## Work log (restart from here)
Scratch tools live in the scratchpad `balance/`: r.py (jsc runner), t.py (full table), sw.py and sw2.py (sweeps), search.py (hill climb with overrides).
Done so far in the code: harness reach fix, three new bots, feast removed (press per level), rolls per look not per frame, whiffs cut by a longer step into the punch (moveStart) and a slower retreat (backSpeed .7), hook and upper start slower so they can be reacted to, a light shot no longer interrupts a heavy (heavyThrough), the AI gauges how much of his work lands (soft, spar per level) and against a man who cannot defend he works jab and body instead of the heavy hands. getUpTime 1.7.
Next: numeric search per level, then full table at n=200, then Chrome report.
State at this point (normal, n=80): mixed 29, learner 21, skilled 60, spam:cross 1, slip 2.5. Rule numbers and AI numbers are in the code as they stand. Easy and hard levels not yet retuned after these changes.
Then: cross start .26, regen 16, slip wider and cheaper, kdBase .18, body drain 6 and 7, blocks cover fully, AI gives no softness to a one-button man or a man not fighting, easeOff capped. At n=60 all levels are within 10 points of target; skilled on normal has too few decisions.

## Restart 1 (Nov 6): where this picked up
Code left by the interrupted attempt ran 1 of 78 missed at n=200 on seeds 1000+ and 1 of 78 on seeds 5000+, at dt 1/120 (normal mixed stoppage HP 39.6; normal skilled 70.5).
Found: those tables called the AI and bots 120 times a second, the game calls them once a frame. At the game's 60 fps, normal: skilled 56.5, mixed 30, slip 2.3%. So the 120 Hz tables flatter the code.
Doing now: harness plays the game's real frame loop at 60 fps on the real ring (half 2.9, corners 2.5), re-tune to that, make the LEVELS ladder monotonic (hill climb left hard reading less than normal), make easeOff use the delayed view.
Bots idle, spam, mixed, skilled, turtle checked against git HEAD: unchanged. Scratch tools: r.py, t.py, sw.py, cmp.py, rate.py in the scratchpad `balance/`.
Working values so far (restart 1): slip from 0, body dmg 1 and 1.2, TEMPER.tempo .25 (AI keeps working against a weak man, 33-41 a minute), LEVELS made monotonic, waitGuard on, spamRead up. Previous code saved in scratchpad balance/snap0.
Exploit check (scratch bots, `balance/exploits.py`, not yardsticks): jab-then-back-off won 92/100/100% easy/normal/hard; hook-or-cross at a walking pace won 100/95/93% in round 1; one-two chain 85/85/60; hook with pauses 100/77/45. The target table does not catch these, because the AI's softness (spar) cannot tell a dangerous man from a harmless one. Working on it: AI measures how hard he is really being hit (threat) and stops going easy.
Tried and dropped: AI covering up when rocked against a one-button man (hook spam rose to 99%, a guard loses the race), hands-up hold against one-button men (drains his stamina, hook-with-pauses rose), stop-jab on a man stepping in (hook spam rose to 58%, a jab does not interrupt a hook). Kept: backAfter, a man backs away at .4 of his retreat speed for .25 s after any punch. This is the rule that beats jab-and-run (100% down to 7-20% on normal), but it also cuts whiffs to 17% and shortens fights, so load and damage must come down.
Mid-experiment warning (10:20): the code now has experimental numbers and misses targets for mixed and learner while the kiting rule is being re-balanced. Last state that met nearly every target at 60 fps but lost to kiting: jab .75 dmg, .22 head; cross 2.2, .85; hook 3, 1.8; upper 3, 1.25; body 1 and 1.2; no backAfter; TEMPER tempo .25, close .25, load 2.4; soft from .5 over .25; no threat. Copies in scratchpad balance/snap1.
