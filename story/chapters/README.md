# Writing a chapter file

How to write `story/chapters/cNN.js` against the finished engine. Read this with:

- `story/design/ref-story.pdf`: the story. It wins over everything below.
- `story/design/bible-parts/01-global.md` (registries) and your `chNN.md` (locations, NPCs, interactables, quests, scenes, choices, state handed on).
- `story/ARCHITECTURE.md` §5 (LocationDef), §8 (ChapterDef, script API `A`), §11 (headless). Where the engine notes in `story/dev/notes/` differ from the contract, the code wins. The differences that matter for chapters are in "Engine pitfalls" below.
- `story/chapters/c99_sandbox.js`: a complete, working chapter. Copy its shape.

Shared files loaded before yours: `cast.js` (looks and People entries, `S.cast`, `S.castNpc`, `S.castLook`) and `places.js` (`S.places`: location builders for recurring places, the world map, stair helpers).

---

## 1. File shape

```js
/* Story Mode — chapters/c03.js — Chapter 3, The Price of Admission (BIBLE ch03). */
(function (S) {
  'use strict';
  const N = 3, P = S.places;
  const flag = (G, k) => !!(G && G.flags && G.flags[k]);

  const scenes = { *c03_start(A, G) { ... }, ... };
  const dialogs = { *c03_mo_talk(A, G) { ... }, ... };

  S.defineChapter({
    id: N, title: 'The Price of Admission', date: 'Thursday, January 9, 1997', place: 'Route 9, Calder',
    card: ['...'],
    start: { loc: 'starlite_lot', x: 120, face: 1, scene: 'c03_start' },   // y: for a tall map's upper level
    required: ['starlite_lot', 'starlite_lanes', 'cellar_pit', 'cellar', 'pinsetter_loft'],
    body: { look: 'jin_street', power: 0.55, speedMul: 1, breath: false, limp: 0 },
    skills: { hook: true },                       // granted at chapter start, cumulative with G.skills
    locations: { starlite_lot: P.starliteLot({ ... }), ... },
    quests: P.withClimb({ q3_main: { ... } }),     // withClimb only matters if a step goes through a tall place
    evidence: { ... }, memories: { ... }, people: { ... },
    scenes, dialogs,
    mapNodes: P.nodes({ map_route9: ['starlite_lot', 'starlite_lanes'], map_front_street: ['ymca_312'], map_eastgate: { locs: ['iron_pulse'] } }),
    canon: { ... },                               // see §4
    summary: (G) => [ ... ],
  });
})(window.STORY);
```

Every scene and dialog is a generator `function* (A, G)`. Talk handlers (`npc.talk`), object `run`, trigger `run`, door `run` take a scene id or an inline generator.

## 2. Ids

| Kind | Rule | Examples |
|---|---|---|
| Locations | Exactly the bible's id (they are shared across chapters; never prefixed). | `kessler_ave_1996`, `sunnys`, `courts_yard` |
| Flags, relationship meters, tallies | Exactly the ids in 01-global "Flags & relationships registry". | `ch3_lenny_method`, `A.rel('lenny', 2)`, `take_count` |
| Evidence, memories, belongings | Exactly 01-global "Evidence and memory registry". | `ev_lenny_tape`, `mem_bottle`, `bel_dish` |
| People / NPC ids | The cast ids (cast.js header lists all). An NPC with a cast id gets the cast name and People entry. | `teddy`, `mo`, `ray_1994`, `camel_coat` |
| Quests, interactables | The bible's own ids where it gives them. | `q3_main`, `i2_poster_wall` |
| Everything else you invent (scenes, dialogs, triggers, extra objects, doors, NPCs the bible leaves unnamed) | Prefix `cNN_` with two digits. | `c03_tryout`, `c03_mo_talk`, `c03_trig_curtain` |

Built-in ids from places.js start with the place's own short prefix (`kes_`, `st4_`, `sun_`, `cy_`, `uh_`, ...); never reuse those for your own things unless you mean to patch them (see §6).

Relationship meters: `hana`, `teddy`, `lenny`, `deshawn`, `slim`, `mara`, `courts`. Tallies (numbers in `G.flags`): `take_count`, `threat_count`, `abandon_count`, `harm_count`. Voice helpers read them (`jin_voice` from `harm_count` only; `threat_voice` from `threat_count`): compute them where you need them, never store a second copy.

## 3. ChapterDef fields the engine reads

`id, title, date, place, card[], start {loc, x, y?, face, scene}, required[], body {look, power, speedMul, breath, limp, delay}, skills{}, locations{}, quests{}, evidence{}, memories{}, people{}, scenes{}, dialogs{}, mapNodes[], canon{}, summary(G)`, plus `travel` (bool | string | (G)=>bool|string: the map's chapter-wide travel gate; a string is the reason travel is closed) and, in chapter 10 only, `endings: { champion: { title, cards: [...] }, own_name: { title, cards: [...] } }` (the ending is chosen by `G.flags.ch10_choice` = `'accept'` | `'refuse'`, or `A.ending(id)`).

- `QuestDef { title, kind: 'main'|'side'|'missable', giver, summary, steps: [{ text, target: { loc, x, y? }, autoplay? }], reward }`.
- `EvidenceDef { title, kind: 'document'|'photo'|'object'|'recording'|'letter'|'record', text, pages[], proves, date }`.
- `PersonDef` in `people`: only your chapter's notes, e.g. `people: { lenny: { notes: [{ id: 'c03_tape', text: '...' }] } }`. The base entry (name, role, look) comes from cast.js; your notes are appended.
- NPC placements: `S.castNpc('teddy', { x, face, pose, talk, barks, marker, chapter: 3 })` gives the cast name and the chapter's look; or `{ id, look: S.castLook('teddy', 3), name, ... }`.

## 4. `canon`: the state your chapter hands on

`story.seedState(n)` builds the state at the start of chapter `n` by applying the `canon` of every chapter **before** `n` in order (chapter select, `play.html?ch=n`, headless `chapter n`). So:

- **Your `canon` = what your chapter hands on along the restraint path** (refuse, spare, leave the money, keep promises): the bible's "Choices made here" restraint values and "Chapter ending and state handed on".
- The state **at your chapter's start** is the union of the earlier chapters' canons. Test it: headless `chapter N` starts from it.

```js
// Illustration of the shape only: your values come from your chNN.md ("Choices made here", "state handed on").
canon: {
  flags: { ch3_touched_gloves: true, ch3_lenny_water: 'tap_cup', ch3_slim_result: 'straight', ch3_covered_slim: true, ch3_teddy_mitts: true,
           ch3_lenny_method: 'patient', ch3_tryout_won: true, ch3_slim_won: true, base: 'ymca_312' },
  rel: { deshawn: 1, slim: 4, teddy: 1, lenny: 2 },      // ADDED to the meter (deltas, not totals)
  money: 210,                                            // added
  evidence: ['ev_card_book', 'ev_lenny_tape', 'ev_lenny_voucher', 'ev_lenny_statement'],
  memories: ['mem_bottle', 'mem_corner'],
  people: ['mo', 'deshawn', 'wojo', 'slim', 'ferris', 'peg', 'tiny'],
  quests: { q3_main: 'done' },
  skills: { counter: true },                             // skills learned mid-chapter (A.skill); ChapterDef.skills of earlier chapters apply anyway
  gear: { knuckles: true },
  train: { bag: 2 },                                     // engine cap is 3 (bible says 4 from Ch7: the engine clamps to 3)
  visited: ['starlite_lot', 'cellar'],
}
```

Values must be restraint-path values (the ruthless run is tested by `--policy ruthless` playing your choices, not by canon).

## 5. Choices, policies and records

```js
const v = yield A.choice('He holds the bottle out.', [
  { text: 'Take the bottle.', value: 'took_bottle', policy: 'ruthless', record: 'Took Lenny\'s bottle.' },
  { text: 'Fill a paper cup at the tap.', value: 'tap_cup', policy: 'restraint', record: 'Drank from the tap instead.' },
], { who: 'lenny', id: 'c03_water' });
A.flag('ch3_lenny_water', v);
```

- `policy: 'restraint' | 'ruthless'` tags the option for the headless policies (`restraint` → own_name ending, `ruthless` → champion). Tag every option of a choice that the registry tracks. Options the policies should never pick get neither tag; untagged options are scored by words in `value`/`text`, so tag explicitly rather than rely on that.
- `autoplay: true` marks the option the default policy (`'first'`) takes; without it `'first'` picks the first enabled option.
- `record: 'plain words'` puts the decision on the completion screen (options without `record` are "minor" and only logged).
- `when: (G) => bool` hides an option (never show traps); `enabled: false` + `hint` shows it disabled with the reason. No timers anywhere.
- If every option is hidden, `A.choice` returns `undefined` at once: always leave one visible option.
- Chapter 10's gate: `ch10_choice` `'accept'` must be `policy: 'ruthless'`, `'refuse'` `policy: 'restraint'`; both always available.

## 6. Shared places (`S.places`)

Each builder returns a plain LocationDef. Put it under the bible's id in **your** chapter's `locations` (every chapter defines its own copy of a shared place, with that chapter's state):

```js
locations: {
  kessler_ave_1996: P.kesslerAve({ year: 1996, time: 'overcast', van: (G) => G.flags.ch1_pike_stance === 'insisted',
    npcs: [S.castNpc('petra', { ... })],
    objects: [{ id: 'i2_poster_wall', x: P.spots.kesslerAve.posterWall, label: 'Poster wall', verb: 'Peel', run: 'c02_posters' }],
    door: { kes_right: { locked: (G) => (G.flags.c02_alley_done ? false : "Through the alley's quicker.") } } }),
  sunnys: P.sunnys({ year: 1996, tv: 'boxing', npc: { rita: { talk: 'c02_rita' } } }),
}
```

When the whole shape depends on story state, write the location as a function (location builders receive `(G, S)` at entry):
`courts_yard: (G) => P.courtsYard({ phase: G.flags.phase || 'morning' })`.

### Opts every builder takes

| Opt | Effect |
|---|---|
| `name, area, map, sky, backdrop, weather, weatherAmount, wind, wet, groundStyle, firstEnter, enter, ground, h, street` | override |
| `ambient, camera, room, points` | merged into the built value |
| `sound` | replaced |
| `training: {...}` / `null` | merged drill spots / removed |
| `npcs, objects, doors, triggers` (arrays) | added; **an entry whose `id` matches a built-in patches it** (so `npcs: [{ id: 'rita', talk: '...' }]` gives Rita a dialog instead of making a second Rita) |
| `npc, obj, door: { id: false \| { patch } }` | remove or patch built-ins by id |
| `to: { doorId: 'locId' \| null }` | retarget a built-in door, or remove it (placeholder locks are cleared when retargeted) |
| `layers: { back: [...], ... }`, `drop: ['pieceId']` | add pieces / remove built-in pieces that carry that `id` |
| `lights, solids, ladders` | added |
| `cast: false` | no built-in residents (Rita, Augie, Otis, Peg, Dot, Wanda, the Courts routine, ...) |
| `edit: (L) => L` | last word |

Built-ins are environment pieces, lights, doors, stairs and the place's background residents (with barks only). **No built-in examine objects**: your chapter's interactables table is the source; put objects at `P.spots.<builder>.<name>` so they sit on the right prop.

### Builders

`year` defaults are noted; `time` is `'day' | 'overcast' | 'dusk' | 'night' | 'late' | 'dawn'`; `season` `'summer' | 'autumn' | 'winter' | 'spring'` (from `year`/`month` if left out: 1994 summer, 1996 winter, 1997 winter, `month: 'apr'`/`'mar'` or `season: 'spring'` for Ch8–Ch9).

| Builder | Bible ids | Chapters | Place opts | Built-in doors (default target) |
|---|---|---|---|---|
| `kesslerAve` | `kessler_ave_1994`, `kessler_ave_1996` | 0, 2, 9, 10 | `year` 1994\|1996 (default)\|1997\|2000, `time`, `season`, `van` (bool\|fn), `wagon` (bool\|fn; 1994 default on), `poster` 'fight'\|'layers'\|'champion'\|'june' | `kes_412` (stairs of that year), `kes_sunnys` (`sunnys`; 1994 locked), `kes_alley` (`pratt_alley` in 1996; else locked), `kes_gym` (`iron_pulse`; 1994 "CLOSED TONIGHT"), `kes_gym_side` (`iron_pulse_backroom`, 1996+), `kes_left` (1994: "Home by five."), `kes_right` (1996: `ymca_312`). Resident `kettle` (Dec 1996) |
| `kessler412Stairs` | `kessler_412_stairs_1994/_1996` | 0, 2, 9 | `year` | tall: lobby y 680, landings 500, 320. `st4_street`, `st4_3a` (`okafor_3a`; 1994 locked), `st4_3b` (`apt_3b_1994` in 1994; else locked "Somebody else lives here now." — patch with `run` for the doorway scene), stairs `st4_f1_*`, `st4_f2_*` |
| `okafor3a` | `okafor_3a` | 2, 6, 9 | `year`, `time`, `tv` | `ok_door`. Resident `okafor` (sitting) |
| `sunnys` | `sunnys` | 2, 6, 8, 9, 10 | `year` (1996: tinsel), `time`, `tv` 'boxing'\|'news'\|'static'\|false | `sun_door` → `kessler_ave_1996`. Residents `rita`, `augie` |
| `ironPulse` | `iron_pulse` | 2–4, 8–10 | `after9` (front dark, desk empty, front door locked) | `ip_front`, `ip_staff` → `iron_pulse_backroom`. Resident `receptionist` (before 9) |
| `ironPulseBackroom` | `iron_pulse_backroom` | 2–4, 7–10 | `time` | `ipb_staff` → `iron_pulse`, `ipb_side` → `kessler_ave_1996`. Drill: bag |
| `ymca312` | `ymca_312` | 2–4 | `time` | `ym_front` (placeholder: "Front Street. The bus stops out front."). Resident `otis` |
| `civicExterior` | `civic_exterior` | 8, 10 | `year` 1997 (default)\|1994, `time`, `lofts` | `cx_front` (locked), `cx_dock` → `civic_backstage_1997` |
| `civicBackstage` | `civic_backstage_1994/_1997` | 0, 8 | `year` | `cb_dock` (1997 → `civic_exterior`), `cb_lockerA` (locked), `cb_lockerB` → `civic_locker_b`, `cb_tunnel` → the ring (1994 locked "Not yet. Teddy says walk out when they call you." — patch `locked`) |
| `civicLockerB` | `civic_locker_b` | 0, 8 | `year` | `lb_door`. Drills: bag, footwork |
| `civicRing` | `civic_ring_1994/_1997`, `ashgrove_center` | 0, 8, 10 | `year`, `crowd` 'full'\|'empty', `mood`, `variant: 'center'` | floor y 480 (h 540). `cr_tunnel`. Points `blue`, `red`, `center`, `bell`, `rowF`, `rowK`, `pressEnd` |
| `stagnesRoom214` | `stagnes_room214` | 1, 10 | `year` (2000: Ending One), `time`, `earl`, `board` (whiteboard lines), `iv` | `r214_door`. Resident `earl` (1996) |
| `stagnes2West` | `stagnes_2west` | 1, 9 | `time` ('night' empties the station), `month` 'oct'\|'nov'\|'dec'\|'apr' | `w2_stairs` → gym, `w2_basement` → records, `w2_elevator` → lobby, `w2_214`, `w2_office` (locked). Residents `dolores`, `knitter` (day) |
| `stagnesGym` | `stagnes_gym` | 1 | `time`, `patients` | `sg_stairs`, `sg_courtyard`. Drills: balance, footwork, reaction (gate them with `training: { balance: { x, when } }`) |
| `stagnesCourtyard` | `stagnes_courtyard` | 1 | `time`, `month` | `sc_gym`, `sc_lobby`. Drill: conditioning |
| `stagnesRecords` | `stagnes_records` | 1 | `time` | `rec_door` (add the bible's staff-door lock yourself) |
| `stagnesLobby` | `stagnes_lobby` | 1 | `time`, `month` | cut-away: lobby left, steps and the Route 14 shelter right. `lob_elevator`, `lob_courtyard`, `lob_chapel` (locked) |
| `starliteLot` | `starlite_lot` | 3, 6, 9 | `time`, `season`, `closed` (Ch9 dark lot), `cars {mo, slim, pickup}`, `letters` | `sl_front` → `starlite_lanes`, `sl_fighters` → `cellar` (add Ch3's "Mo hasn't met me yet." lock) |
| `starliteLanes` | `starlite_lanes` | 3, 6 | `cosmic`, `loft` (target or null) | `ln_front`, `ln_staff` → `cellar_pit`, `ln_loft` → `pinsetter_loft`. Resident `peg` |
| `cellarPit` | `cellar_pit` | 3, 6 | `office` (target or null) | `pit_stair`, `pit_office` → `cellar_office`, `pit_cellar` → `cellar`. Drills: bag, footwork, reaction (the slip-rope) |
| `cellar` | `cellar` | 3, 6, 9 | `crowd` 'thursday'\|'saturday'\|'empty', `mood`, `card` (chalkboard lines) | floor y 420 (h 480). `cel_curtain`, `cel_doors` → `starlite_lot`. Resident `mo` (when there is a crowd). Points `blue`, `red`, `mo` |
| `harlanStreet` | `harlan_street` | 4, 9 | `state` 'open'\|'chained'\|'trucks', `time`, `season`, `grill` | `hs_grill` → `harlan_grill` (open), `hs_siding` / `hs_gate` → `depot_warehouse` (open; locked texts otherwise) |
| `calderArms` | `calder_arms` | 4, 7–9 | `time` | `ca_door` (placeholder) |
| `foundryStreet` | `foundry_street` | 5, 7 | `time`, `season`, `weather`, `hq` (bool\|fn: the hall door opens), `hqLocked` (text), `lincoln` | `fs_hq` → `union_hall`, `fs_courts` (right edge) → `courts_yard` |
| `courtsYard` | `courts_yard` | 5–7, 9, 10 | `time`, `season`, `phase` 'morning'\|'afternoon'\|'evening'\|'night', `took4d` (default reads `ch5_took_4d`), `siteOffice` | ground y 480 (h 540); fire escape `cy_fe_*` to the top landing y 270 and `cy_roof` → `courts_roof_c`; `cy_gate` (left edge), `cy_workshop`, `cy_community`, `cy_site_office`, `cy_4d`. Residents by phase: `odette`, `gus`, `keisha`, `darnell` |
| `courtsWorkshop` | `courts_workshop` | 5–7, 9 | `time` | floor 480, loft 300 (ladder `ws_ladder_*` at x 446); `ws_door` |
| `courtsCommunity` | `courts_community` | 5–7, 10 | `time`, `meeting` (chairs in rows) | room y 330 (= ground), basement y 690; stairs `cc_stairs_*`; `cc_door`, `cc_records` (locked "Council files. Not mine to open."). Drills: bag, mitts |
| `courtsRoofC` | `courts_roof_c` | 5, 7 | `time` 'dusk'\|'late', `season` | `rc_down` → the yard's top landing |
| `courts4d` | `courts_4d` | 5, 6 | `time` | `d4_door` |
| `unionHall` | `union_hall` | 7, 9 | `time` | balcony y 230, ground y 470 (= ground), basement y 700; stairs `uh_up_*`, `uh_base_*`; `uh_street`, `uh_office` → `rook_office`. Resident `wanda` |
| `rookOffice` | `rook_office` | 7, 9 | `time` | `ro_door` → the balcony |
| `marketStreet` | `market_street` | 6–8 | `time`, `season`, `forLease` (Ch7+), `fund` | `ms_kwik`, `ms_88` → `fund_office` (FOR LEASE: locked) |
| `kwikCopy` | `kwik_copy` | 6, 8 | `time` ('dawn'), `flyer` (Ch8 corkboard) | `kc_door`. Resident `dot` |
| `garrisonStreet` | `garrison_street` | 6, 9 | `time`, `weather`, `sold`, `suds`, `lindell` | ground y 360 (h 420). `gs_suds` → `garrison_suds`, `gs_lindell` → `lindell_ruin` |
| `cemeteryS14` | `cemetery_s14` | 6, 9 | `time`, `season`, `flowers` (default reads `ch6_flowers`) | ground y 360. No doors (map travel) |
| `ashgrovePlaza` | `ashgrove_plaza` | 9, 10 | `time`, `weather`, `lobby`, `river` | ground y 360. `ap_lobby` → `ashgrove_lobby`, `ap_river` → `river_path`. The bronze statue is an NPC with no talk (`ap_statue`) |
| `ashgroveLobby` | `ashgrove_lobby` | 9, 10 | `time`, `press` (Ending One) , `stair` | ground y 420 (h 480). `al_revolving`, `al_elevators` ("Locked. Card only."), `al_stair` → `ashgrove_stair` |
| `riverPath` | `river_path` | 9, 10 | `time` 'night'\|'dawn'\|'day', `season`, `plaza` | ground y 360. `rp_steps` → `ashgrove_plaza`. Points `rail` (the `[Drop them.]` rail), `shadowbox` |

`P.spots.<builder>` holds every named x (and level y) used above; `P.catalog` lists the same table in code. Not built here (single-chapter places; write them in your chapter): `apt_3b_1994`, `pratt_alley`, `cellar_office`, `pinsetter_loft`, `route9_walk`, `harlan_grill`, `depot_*`, `courts_site_office`, `annex`, `garrison_suds`, `lindell_ruin`, `fund_office`, `castell_gym`, `ashgrove_stair/floor22/floor30`, `truck_cab`, `alder_row`, `alder_garden`, the ending vignettes. Use `P.stairs()` / `P.ladder()` for their levels (§8).

### World map

`P.calderMap` is the one node table (640 × 360, over the map sheet ui.js draws: river along the bottom). Build your `mapNodes` from it so every chapter shares coordinates:

```js
mapNodes: P.nodes({
  map_eastgate: ['kessler_ave_1996', 'sunnys', 'iron_pulse'],   // locs[0] is where map travel arrives (its points.arrive / start)
  map_front_street: { locs: ['ymca_312'], travel: (G) => G.flags.c02_alley_done ? true : "Through the alley's quicker." },
  map_garrison: { locs: ['garrison_street'], locked: 'Not yet.' }, // shown, locked, Jin's reason (needs a loc: with none ui says
                                                                   // "There is nowhere to go there."; the id may be defined in a later chapter)
}),
```

Nodes: `map_hillcrest` (96, 86), `map_northside` (256, 70), `map_cemetery` (446, 92), `map_route9` (62, 196), `map_downtown` (330, 194), `map_eastgate` (522, 182), `map_garrison` (150, 246), `map_front_street` (372, 252), `map_calder_arms` (432, 236; only while it is the base), `map_civic` (228, 270), `map_riverfront` (318, 278), `map_harlan` (562, 262), `map_southbank` (382, 328; locked: "Southbank. I've never been. I don't know anyone there."). Node fields ui.js reads: `name, x, y, locs, travel (bool|string|fn), locked (bool|string|fn), when (fn), arrive {loc, x, face}, desc, district`.

## 7. Autoplay: every scene must finish headless

The headless autopilot (`S.test.autopilot`) plays your chapter with no special cases. It walks left/right, uses doors (BFS over door targets), presses interact, and lets the director policy answer lines and choices. Its target order:

1. the waiting scene's hint (`A.waitFor(fn, { autoplay })`, `A.reach(x)` gives `{ walkTo }`),
2. the current quest step's `autoplay` hint `{ walkTo, interact, loc }`,
3. the step's `target { loc, x }`: route to `loc`, walk to `x`, interact with the nearest thing within 90 px,
4. exploration: NPCs with markers, unclaimed evidence objects, unvisited doors, then the map's two ends.

Rules that keep it unstuck:

- **Give every main quest step a `target`** at the thing that advances it, and make that thing an NPC/object/door within 90 px of `x`. If the next thing is a trigger, put the trigger on the walking line toward `target.x` (or give the step `autoplay: { walkTo: x }`).
- Progress = a change of flags, quests, evidence, memories, people, visited places or location. If nothing changes for 120 sim s the run is "stuck"; an interaction that does nothing visible to G (pure thoughts) counts as tried once and is skipped after.
- **The autopilot cannot climb ladders or walk stairs.** In tall places, give quest steps `autoplay: S.places.climb` (or wrap all quests: `quests: S.places.withClimb({...})`) and, for scene waits on an upper level, `yield A.waitFor(fn, { autoplay: S.places.climbTo({ loc, x, y, interact }) })`. These hints send it through the place's stair doors until it stands on the target's level. Put `y` in a step target that sits on an upper/lower level (`target: { loc: 'union_hall', x: 900, y: 700 }`), or let it find the level from the nearest interactable.
- `A.reach(x, dir, { autoplay })` copies its hint when called (getters are read once): use `A.waitFor` when the wait is on another level.
- Choices: tag options (§5); `autoplay: true` for the `'first'` policy's path.
- Fights and bouts: `fights: 'auto'` wins them at once (`--real` plays them with a simple bot); `allowLoss` fights must still let the story continue.
- Activities end after 4 s under a policy (a pass): never branch the main path on an activity's score.
- `ChapterDef.required` lists the places a full run must visit (the report shows `unvisited`).

## 8. Tall places and stairs

- `P.stairs({ id, from: {x, y}, to: {x, y}, up, down, draw: 'wood'|'iron'|'concrete'|false, when })` returns `{ ladders, doors, pieces }`: a walkable flight (hold up/down at its foot/head) and two `'stairs'` doors (`<id>_up`, `<id>_down`; E takes the flight with a short fade). `P.ladder({ id, x, top, bottom, up, down })` is the same for a plain ladder. Spread them into your def (`L.ladders.push(...f.ladders); L.doors.push(...f.doors); L.layers.back.push(...f.pieces)`).
- Upper levels are one-way solids (`{ x, y, w, oneway: true, style: 'wood' }`). `L.ground` should be the level the player arrives on; deeper levels are extra `floors` entries (`floors: [{ x0: 0, x1: w, y: deeperY }]`).
- **Give `y` to every NPC, object, door and trigger (`y0/y1`) that is not on `L.ground`**, and `ty` to every door that leads INTO a tall place onto a level other than its `L.ground`. Without `y` things drop to the floor at or below `L.ground`.
- Keep doors on one level at least 30 px apart: while waiting for focus on a stairs/ladder door the autopilot holds `up`, and `up` enters whichever door has focus.
- Wall pieces that default to `L.ground` (tv, mirror, clock, catwalk, fireescape) need an explicit `y` on upper levels.

## 9. Engine pitfalls (found while building places.js)

1. **A missing location is silently borrowed.** `story.lookup` falls back to other chapters' definitions of an id. If your door leads to `kessler_ave_1996` and you don't define it, you get Chapter 2's December street. Define every place your doors reach, or retarget/remove the door (`to: { id: null }`).
2. A door needs `to` or `run`. A locked door with nowhere to go: `{ ..., locked: () => 'reason', run: 'places_noop' }` (the shared do-nothing scene).
3. Locked reasons are shown as toasts in Jin's words; keep them short. Edge doors (`kind: 'edge'`) fire when walked into and show the reason once per approach.
4. An object with `evidence` and no `run`/`text` disappears once the evidence is held. `once: true` hides an object after use. Triggers fire once per chapter unless `once: false` (then on every entry).
5. NPCs with `barks` and no `talk` cycle their barks on E; NPCs with neither are scenery (not interactable). NPCs in static poses (`sit`, `work`, `sweep`, `write`, `lieBed`, `kneel`, `crouch`, `leanWall`, `phone`, ...) do not turn to face Jin.
6. Duplicate actor ids in one location are a load problem. Add to a built place through opts (they merge by id), not by pushing a second entry with a built-in's id.
7. Piece `when(G)` is evaluated when the place is baked; flag/quest/evidence changes re-bake it. NPC/object/door/trigger `when` is live.
8. The headless `load` check only sees literal ids: `A.flag('ch3_x')`, `A.evidence('ev_x')`, `A.goto('loc')`. Computed ids are not checked; prefer literals.
9. `G.train` is clamped to 0–3 by the engine (bible cap 4 from Ch7 cannot be reached); drills are optional and never gate the story.
10. `A.goto(loc, x, { y, face })` takes `y` for tall maps; `start.y` too.
11. `heavy_bag` outdoors hangs from ground − 210: give it a scaffold or pipes to hang from; `y` lifts the whole bag.
12. A map node shows its `locked` reason only when its `locs` is not empty (ui checks `locs` first).
13. Map travel arrives at `locs[0]`'s `points.arrive` (else `points.start`) on `L.ground`: list a ground-level place first in each node.
14. `A.choice` with every option hidden returns `undefined` immediately.

## 10. Testing a chapter

```sh
R=/Users/elliot_jeong/Desktop/Inside-the-Impact/story-mode
osascript -l JavaScript $R/story/dev/syntax.js $R/story/chapters/c03.js
osascript -l JavaScript $R/story/dev/headless.js $R load                       # problems (must be 0 for your file) and warnings
osascript -l JavaScript $R/story/dev/headless.js $R chapter 3 --policy restraint
osascript -l JavaScript $R/story/dev/headless.js $R chapter 3 --policy ruthless
osascript -l JavaScript $R/story/dev/headless.js $R chapter 3 --real --render    # real fights, every render path
osascript -l JavaScript $R/story/dev/headless.js $R locations --render           # every place of every chapter enters and draws
osascript -l JavaScript $R/story/dev/headless.js $R chapter 3 --log              # event log when something is stuck
```

`chapter N` reports `reachedEnd`, `stuck`/`stuckAt` (where Jin stood, the objective, the focus), `errors`, `unvisited`, `choices`, `autopilot` (its last plans). A run must reach the end under both policies with 0 errors.

Browser (optional): `sh $R/story/dev/sync-preview.sh`, then your own tab at `http://localhost:8795/story/dev/play.html?ch=3` (add `&auto=restraint` to watch the autopilot, `&debug=1` for collision boxes). Right after load run `STORY.audio.muted = true; STORY.audio.ctx && STORY.audio.ctx.suspend()` (no sound on the user's Mac); resize to 1280×720 if `innerWidth` is 0; a hidden pane runs slowly, so drive time with `STORY.test.step(seconds)` or `STORY.test.frames(seconds)`. Close the tab when done.

Never touch anything VEX or EZ Template related, and do not change git state.
