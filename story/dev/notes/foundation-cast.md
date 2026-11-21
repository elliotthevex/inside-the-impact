# foundation — chapters/cast.js (shared looks and cast)

Status: DONE (2026-11-22). Restart: nothing pending. Re-run the checks under "Verified" after any change.
Owned: `story/chapters/cast.js`. Sources: `design/bible-parts/01-global.md` (Cast bible), every `chNN.md` "NPCs present"
table, `ref-story.pdf` (no appearance details there; roles kept spoiler-free against it).

## What chapter authors get
- **Looks** (`S.defineLook`): 132 ids, listed in `S.lookIds`. The default look id = the cast id (`look: 'teddy'`);
  variants add a suffix. Engine fallbacks from art.js stay valid (`man`, `woman`, `kid`, `thug`, `collector`, `guard`,
  `old_man`, `old_woman`, `nurse`, `suit`, `worker`).
- **`S.cast[id]`** = `{ name, full, role, look, notes: [], alt?, rel? }` for 69 ids (incl. `jin`). Every id except `jin`
  is also registered with `S.definePerson`, so it is the base People-archive entry: `story.person(id)` merges a
  chapter's `people[id]` over it (notes concatenated, other fields override in that chapter). A chapter only needs
  `people: { teddy: { notes: [ { id: 'haircut', text: '…' } ] } }`, then `A.meet('teddy', 'haircut')`.
  `name` = the dialogue-plate name ("Teddy", "Mrs. Okafor"); `full` = full name; `role` = what Jin knows on first
  meeting (no spoilers); `rel` = the relationship meter id (hana, teddy, lenny, deshawn, slim, mara).
- **`S.castLook(id, n)`**: the person's look for chapter n (default the current chapter) from `alt`
  (e.g. teddy: ch0 `teddy`, ch2+ `teddy_1996`; ray: ch0 `ray_1994`, ch8 `ray`; rook: ch0 `rook_1994`, ch5 `rook`;
  slim: ch10 `slim_jacket`; jin: ch0 `jin_1994`, ch1 `jin_hospital`, ch2 `jin_street`).
- **`S.castNpc(id, opts)`**: `{ id, name, look: castLook(id) }` merged with opts (opts win; `opts.chapter` picks the
  look's chapter and is dropped). Example: `npcs: [S.castNpc('rita', { x: 420, pose: 'work', talk: 'c2_rita' })]`.
- Always give an NpcPlacement a `look`: world.js falls back to `'man'`, not to the cast entry.

## Look ids
Jin: `jin`, `jin_street`, `jin_1994`, `jin_ring`, `jin_ring_robe`, `jin_cellar`, `jin_training`, `jin_civic`,
`jin_civic_robe`, `jin_champion`, `jin_suit`, `jin_court` (built-in and unchanged: `jin_hospital`, `jin_rehab`).
Family: `min`, `umma`, `umma_coat`.
Fight night / Civic: `teddy`, `teddy_1996`, `lenny`, `camel_coat`, `ray_1994`, `ray_1994_robe`, `ray`, `ray_shirt`,
`ray_gym`, `referee`, `inspector`, `morty`, `announcer`.
Eastgate: `okafor`, `okafor_robe`, `rita`, `augie`, `petra`, `rosie`, `receptionist`, `tomas`.
St. Agnes: `hana`, `hana_scrubs`, `hana_coat`, `pike`, `pike_shirt`, `earl`, `dolores`, `whitlow`, `sister_margaret`.
Ch2: `benny`, `carl`, `vic`, `otis`.
Cellar: `mo`, `deshawn`, `deshawn_ring`, `deshawn_gym`, `wojo`, `wojo_ring`, `slim`, `slim_ring`, `slim_jacket`,
`ferris`, `peg`, `tiny`, `tiny_ref`.
Harlan Street: `fran`, `pat`, `whistle`, `whistle_fight`, `roz`, `dutch`, `dutch_fight`, `carrow`, `carrow_fight`.
Foundry Courts / Council: `mara`, `odette`, `odette_coat`, `gus`, `darnell`, `keisha`, `keisha_gloves`, `nell`,
`elena`, `vasquez_kid`, `rook`, `rook_bare`, `rook_glasses`, `rook_1994`, `wanda`, `courts_resident_m`,
`courts_resident_f`, `courts_resident_old`, `courts_kid`.
Downtown / Garrison: `dukes`, `hale`, `asher`, `fitz`, `fitz_cousin`, `fitz_cousin2`, `dot`, `dot_coat`, `brandt`.
Ch8: `gym_desk`, `joan`, `photographer`. Ashgrove: `celeste`, `penner`, `penner_suit`, `owen`, `garvey`.
Alder Row: `tran`, `rosa`, `gloria`, `terrence`, `odell`, `june`, `alder_neighbor_m`, `alder_neighbor_f`, `brenda`, `ed`.
Endings: `cornerman`, `fighter_green`, `kid_gloves`.
Generic enemies (pass as `look` in EncounterDef / spawnEnemy): `enforcer`, `thug_dock`, `thug_dock2`, `collector_dock`,
`guard_dock`, `guard_tower`, `guard_tower2`, `crew`, `crew2`, `crew3`; Grill texture: `trucker`, `trucker2`.

## Cast ids (S.cast; People archive)
jin, min, umma, teddy, lenny, camel_coat, ray, referee, inspector, morty, okafor, rita, augie, petra, rosie,
receptionist, tomas, hana, pike, earl, dolores, whitlow, sister_margaret, benny, carl, vic, otis, mo, deshawn, wojo,
slim, ferris, peg, tiny, fran, pat, whistle, roz, dutch, mara, odette, gus, darnell, keisha, nell, elena, rook, wanda,
dukes, hale, asher, fitz, dot, brandt, carrow, gym_desk, joan, celeste, penner, owen, garvey, tran, rosa, gloria,
terrence, odell, june, brenda, ed.
The bible's NPC ids `ray_1994` and `rook_1994` are NPC/look ids; their person id is `ray` / `rook` (meet those).

## Decisions
- **Jin's scar is dynamic** on `jin` and `jin_street`: shown in every chapter except Chapter 0 (`G.chapter === 0`), and
  shown when there is no G (title screen). Reason: bible ch00 says "Body: `jin_street` → `jin_ring`", but the scar
  arrives with fight night. `jin_street` still adds `knuckles` from `G.gear.knuckles` / `S.combat.body.knuckles`.
  Memory flashbacks of 1994 in later chapters must use `jin_1994` / `jin_ring` / `jin_ring_robe` (always clean).
- **`jin_ring` / `jin_ring_robe` overridden**: trunks `#3a5a90` (bible: "blue trunks with a white stripe"; the pale
  waistband is the stripe), red gloves, navy robe kept. Ray 1994: gold trunks, white gloves, white satin robe.
- **`jin_civic` / `jin_civic_robe`** read `G.flags.ch8_hands`: `'knuckles'` → brass, `'wraps'` → wraps, unset → bare
  hands. Bare chest, his black pants (unsanctioned fight; the bible names no outfit). Chapter 8 may use `jin_street`
  instead if it wants the track top.
- Ch3 bouts: `jin_cellar` (bare chest, black pants, oxblood house gloves, scar). Mitts/drills: `jin_training`.
- Teddy's gray horseshoe can't be drawn (no such hair template; art.js is not mine), so he is `bald` + white mustache.
- Rook's flat cap is the `cap` hat style (low brim); `rook_bare` is for the cap-in-hands confession (Ch7).
- Slim's towel over his head is the `hood` style in towel white. Darnell's hard hat is a yellow `cap`.
- Min's yellow scrunchie is `headband:#e8c43a` (the brightest small colour in Ch0); her Pentax is `bag:#2b2b30`.
- Props too small for a 46 px sprite are left to scenes/close-ups/documents: Lenny's tape roll and chain, Pike's
  briefcase and butterscotch, Mara's tool belt/rag/pencil, Teddy's whistle, Hana's pencil, reading glasses on cords
  (Rook gets `rook_glasses` for the ledgers), Dutch's key chain.
- Enemy looks avoid mid-blue (Jin's blue top stays the only blue mass in a fight): browns, olives, tans, charcoal.
  Dutch's peacoat is navy (bible) but very dark.
- Skin tones are varied and plausible for a 1990s river city; the bible states none except by family (Seo family,
  Hana Lim and Dot Pham Asian-American tones; Odette/Deshawn related; Gloria/Terrence related; Darnell/Keisha related).
- Roles are written from what Jin knows on first meeting and never spoil a later discovery (e.g. camel coat:
  "Never gave a name."; Rook: "Leader, Northside Community Council."). Chapters override `role` when it changes
  (Teddy from Ch2: he mops at Iron Pulse; Pike from Ch7: the Fund office is FOR LEASE, etc.).
- Morty's person name is "Morty"; Ch0 shows him as "Timekeeper" via the placement `name` and should not `A.meet` him.
- Ch10 residents are labelled by description until spoken to: use the placement `name` ("Shopkeeper") and switch it
  (or meet them) when Jin learns the name; the base entry carries the real name.
- Base notes are empty on purpose so chapter notes never duplicate a base line.

## Verified
- `osascript -l JavaScript story/dev/syntax.js story/chapters/cast.js`: ok.
- Headless `load`: cast.js ok, 0 problems, 0 warnings, 0 console output (people count 71 = 68 cast + 3 sandbox).
- Headless exec: every look x 14 poses through `S.art.joints` (1848 solves): no NaN, no exception, 0 console warnings
  (so no unknown hair/top/bottom); every cast look and alt resolves; castLook / castNpc / person merge / dynamic
  scar (ch0 none; ch2 scar+knuckles; no G scar) / civic hands checked.
- Headless `chapter 99 --render` (61 frames) and `sandbox` self-test: ok after the jin/jin_street overrides.
- Browser (poses.html with cast.js injected, own tab, muted, closed): every look drawn in idle on street/brick
  bands, plus guard and sit for fighters and coats. All read distinctly; no drawing errors.
