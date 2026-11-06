# Sim and AI notes

Status: balance pass done on top of this, see `gfx/dev/notes/balance.md` for the current table and numbers. Tables in this file below the how-to are older and kept as history: they were measured before the harness used the rig's reach and the game's 60 fps loop.

## How to use
```js
import { createMatch, setReach, STEP, REACH, HEAD, PUNCHES, RING, TUNE } from './sim.js';
import { createAI, createBot, BOTS } from './ai.js';
const m = createMatch({ seed, names: { p: 'YOU', o: 'RIVAL' }, ringHalf, corners: { blue: [x,z], red: [x,z] } });
const ai = createAI({ difficulty: 'normal', seed });
// each frame
m.step(dt, inputP, ai.decide(m, m.o, m.p, dt));
for (const e of m.events) dispatch(e); m.events.length = 0;
```
- Reach: `setReach({ jab, cross, hook, upper, bodyL, bodyR, body, minSep })` at load, with the rig's measured values. Defaults 1.12, 1.15, .98, .88, 1.02, 1.02, minSep .72.
- `punch` in Input is one shot: pass it only on the frame of the press. `slip` and `getUp` count rising edges. Getting up is mashing `getUp`, so the view maps punch key presses to `getUp` while `me.down`. `down.up` is 0..1 progress.
- Bots for the dev page: `createBot(name, { seed, kind })`, names idle, spam, mixed, skilled, turtle, learner, runner, guardjab. Same `decide` signature as the AI.

## Contract details the module map left open
- `slip` is seconds left (number, 0 when not slipping); extras `slipT` elapsed, `slipDir` [x,z]. `stun` is seconds left. Extra `stagger` is seconds left.
- `punch`: { kind, t, dur, contact, active, phase, hit, blocked, result: null|'hit'|'block'|'slip'|'whiff', tired, id }. `hit` is true for a block too (the glove touched). `t` lands exactly on `contact`. `PUNCHES[kind].hand` says which glove: jab L, cross R, hook L, upper R, bodyL L, bodyR R.
- Event `who`: the puncher for throw, whiff, hit, block, slipped (`def` is the other man); the fighter it happens to for stagger, knockdown, count, getup, ko, tko, stopped, step, rope; the winner or null for round_end and decision. `power` 0..1, `dir` is force direction. `count` has `n`. `round_end` has `score` [p,o].
- New event beyond the list: `rope` { who, power, dir } for rope wobble.
- `match.result`: { winner, loser, how, round, clock, time, scores, totals, wins, loserHp, pClean, oClean, pHead, oHead }. Report line uses pClean and oClean.
- Clock stops during the count. During a break `clock` shows break time left.
- Knockdown HP on rising goes by knockdowns in the match (45, 30, 18), TKO counts knockdowns in the round. HP only rises to that value, never falls to it.

## Changes from the starting numbers (measured, see tables)
- Damage about .35x the DESIGN start values, head load 1x to 1.3x, because fights ended in round 1 and stoppages came at 15-30 HP. Now dmg/head: jab 1.2/.35, cross 2.7/1.15, hook 3.6/1.9, upper 3.8/1.55, bodyL 2.1, bodyR 2.5. Thresholds 7, 13, 20 and shed .05/s unchanged.
- A punch needs stamina equal to its cost (a press with too little is dropped). Without this, one button at empty stamina won fights.
- A heavy clean shot can also floor a man who was already down this round, not only one past `bad` or at 25 HP or less. This is what makes TKOs happen.

## Table for the code as it stands (100 matches per bot on normal, JavaScriptCore, same harness text, seeds 1000+). NOT yet run at 200 through the page.
| bot | win % | KO | TKO | stopped | decision | avg rounds | ended R1/R2/R3 | player land/block/slip/whiff % | AI land/block/slip/whiff % | stoppage HP median, player / AI |
|---|---|---|---|---|---|---|---|---|---|---|
| idle | 0 | 82 | 0 | 18 | 0 | 1.86 | 14/86/0 | - | 96.8/0/0/3.1 | 40.9 / - |
| spam | 10 | 5 | 28 | 67 | 0 | 1.32 | 68/32/0 | 59.8/6.2/.4/18.9 | 86.4/0/0/2 | 52 / 61.4 |
| mixed | 0 | 0 | 16 | 84 | 0 | 1.00 | 100/0/0 | 31/8.6/.6/42.4 | 80/9/1.4/3.1 | 48 / - |
| skilled | 61 | 12 | 6 | 39 | 43 | 2.77 | 1/21/78 | 25.8/12.8/.1/53.6 | 26.6/7.9/.5/51.5 | 52.2 / 46.9 |
| turtle | 0 | 0 | 0 | 100 | 0 | 1.22 | 78/22/0 | - | 61.4/30.1/0/8.5 | 39.8 / - |
Spam by button (n=30) win %, land %: jab 0, 49; cross 20, 45; hook 23, 25; upper 0, 19; bodyL 0, 74; bodyR 0, 76.
No rule breaks.

## Older table, two tuning passes earlier (200 seeded matches per bot on normal, through gfx/dev/simtest.html in Chrome, seeds 1000+)
Run: `SIMTEST.run({n:200})`. Same code runs in JavaScriptCore for fast tuning, see below.
| bot | win % | KO | TKO | stopped | decision | avg rounds | ended R1/R2/R3 | player land/block/slip/whiff % | AI land/block/slip/whiff % | stoppage HP p25 / median / p75 |
|---|---|---|---|---|---|---|---|---|---|---|
| idle | 0 | 129 | 0 | 71 | 0 | 1.06 | 187/13/0 | - | 95.5/0/0/4.5 | 34.8 / 38.5 / 42.1 |
| spam | 9 | 12 | 36 | 152 | 0 | 1.32 | 136/64/0 | 58.4/5.3/.2/21.6 | 85.1/0/0/1.8 | 50.5 / 52.8 / 55.7 |
| mixed | 0 | 0 | 21 | 179 | 0 | 1.00 | 200/0/0 | 31.2/7.6/.6/43.5 | 78.9/9.6/1.4/3.1 | 46.5 / 48.1 / 50.3 |
| skilled | 56 | 23 | 17 | 73 | 87 | 2.89 | 0/22/178 | 26.2/13.7/0/51.2 | 28.8/7.6/.5/49.2 | 47.6 / 53.8 / 57.1 |
| turtle | 0 | 0 | 0 | 200 | 0 | 1.00 | 199/1/0 | - | 56.5/35.6/0/7.9 | 38 / 40.4 / 42.4 |
Spam by button, win %: jab 0, cross 13, hook 30, upper 0, bodyL 3, bodyR 0 (n=30 each). Levels (n=40): skilled wins easy 95, normal 60, hard 20. Mixed wins 0 on all three.
No rule breaks in any match (overlap, ropes, ranges, NaN). Same seed gave the same fight 4 of 4.

## Not done yet / known problems
Next, in this order:
1. Run `SIMTEST.run({n:200})` through the page on the current code. Not done, the usage line came first.
2. Skilled wins 61% at n=100, target about 65%.
3. Mixed bot (random buttons) loses every match inside round 1 in about 39 s, on every level including easy (measured on the older code at n=40). Too harsh for a new player and it misses the round 2 or 3 target. The cause is the all-in the AI goes into when a man keeps throwing with low stamina (`feast` in ai.js) plus his standing in range with no guard. The `easeOff` tempo was meant to help and did not. Spam (68% round 1) and turtle (78% round 1) also end early.
4. The skilled bot's slip evades only about .5% of the AI's punches. It does slip, on a read of the step-in, but it rarely matters. The AI slipping the player's punches is about .1% against skilled and 2% against hook spam. Slip is real in the rules and thin in play.
5. Whiff rates near 50% for skilled and AI are high.
Not measured at all: whether the style shift by round reads as a style (no punch mix per round in the report), and any human playing it. Blocks by punch kind were measured on the older code only: skilled blocked AI jab 9.8%, cross 11.5%, hook 4.3%, upper 2.6%; AI blocked skilled jab 18.4%, cross 13.5%, hook 8%. Guard does not stop body shots, by design (x.9), they can only be stepped away from. On normal the 180 ms delay means jab and cross can only be blocked by a guard already up, never by reacting.
- The harness now calls `setReach` with `arena/reach.json` before any match and plays the game's 60 fps frame loop on the real ring (half 2.9, corners 2.5).
- `TUNE` values and punch numbers are the live ones in `sim.js`.

## Fast tuning without Chrome
macOS has JavaScriptCore: `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m file.js` runs the modules. The harness in simtest.html sits between `/* HARNESS START */` and `/* HARNESS END */` so a script can extract it and run it without the GPU lock.
