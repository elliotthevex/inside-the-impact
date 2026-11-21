# Global

## Direction grammar (applies to every chapter)
- **Camera.** Default gameplay zoom 1.0 (Jin ~46 px on a 640 × 360 canvas). Zoom **in** (1.2–1.6) for shock, impact and small objects that matter (a name card, a needle, a padlock); zoom **out** (0.6–0.85) for distance, loneliness and aftermath. Each scene sets its own camera; there is no single global follow during cinematics. Never zoom on ordinary punches.
- **Letterbox.** Thin letterbox = the player still walks (walk-and-talks, framings). Full letterbox = a scripted scene. The HUD fades for both.
- **Beats.** `[beat]` = 0.8 s; `[beat 2.0]` = 2.0 s. Silences are written in and are not to be trimmed.
- **Breath zones.** After every emotional discovery: no hostile in the area, the objective HUD hidden until the player moves on, at least one sit spot that eases the camera out. No combat ever follows an emotional discovery directly (PDF).
- **The bell.** The game's motif. Ch0: one clean strike. Ch1–Ch7 cards: the same bell, muffled, getting clearer each chapter, each answered by a sound from the next place (a nurse-call chime, pins, a reversing beeper, children, silence, names). Ch8: unmuffled. After Ch8 `bell_state` (`rung` / `ringing`) decides whether the Ch9 and Ch10 cards are silent or carry a faint ring, and the endings' last sounds.
- **The key image.** Jin leaning on a brick wall under a streetlight, hands in his track-top pockets, one knee bent (`leanWall`). It happens if the player presses nothing in Pratt Alley (Ch2), at the Harlan Street gate (Ch9) and is echoed at Alder Row (Ch10).
- **Framed alone under a streetlight at 0.8:** Pratt Alley (Ch2), Market Street after the memo (Ch6), Ashgrove Plaza (Ch9).
- **The `Hold still` framing** (camera 1.35 on hands): Umma sewing (Ch0), Lenny wrapping (Ch0, Ch3), Teddy wrapping (Ch8), Jin biting the thread (Ch6).
- **Teaching.** No tutorial menus. A lesson arrives as a line from a person, a single small key glyph the first time, and Jin's thought; then never again. Every missing verb is explained where it's missing (a crossed icon plus a line: "*Hands full.*", "*Not yet.*").
- **Engine additions this bible relies on (small, explicit; everything else is built from the engine's listed parts).**
  1. **Tether NPC.** An NPC that holds a fixed x-offset from Jin (ahead, beside or behind), clamps Jin's speed to its own walk (or carry) speed, and plays its walk / `carry` / `hand on shoulder` pose while it moves. Used for: Min falling into step (Ch0), Teddy's hand on Jin's shoulder in the tunnels (Ch0, Ch8), Hana walking backwards in front of him (Ch1), Mara carrying the radiators and Gus the chairs (Ch5, two-person `carry`), Odette's umbrella walk (Ch7). **Fallback if the engine can't add it:** each becomes a scripted walk, control limited to walk-right only, with the NPC's path played at Jin's speed.
  2. **Hold and stillness interactions,** two variants of approach + E: `holdE(duration, onRelease)` (hold the interact key for N s) and `stillness(duration)` (no input at all for N s). One on-screen glyph for both: a thin ring filling round the E key (`holdE`) or round a small standing-figure icon (`stillness`). Every instance uses this table, so timings and glyphs match across chapters:

| Where | Variant | Duration | On release / on movement |
|---|---|---|---|
| Ch0 Umma sewing the trunks (`Hold still`) | `stillness` | 3.0 s | the count restarts; Umma: "Ya. Still." |
| Ch0 Lenny wraps (`Hold still`) | `stillness` | 4.0 s | the count restarts |
| Ch1 `Sit up` | `holdE` | 1.5 s | he drops back (the first two attempts always fail) |
| Ch3 Lenny wraps (`Hold still`) | `stillness` | 4.0 s | the count restarts |
| Ch5 boiler: bleed the air | `holdE` | 2.5 s | it hisses; the hold restarts |
| Ch5 roof C: seal with the torch | `holdE` | 3.0 s | the hold restarts |
| Ch6 Min's button: pull the slack through | `holdE` | 1.5 s | the hold restarts |
| Ch8 Teddy wraps (`Hold still`) | `stillness` | 4.0 s | the count restarts |
| Ch8 Jin wraps alone | `stillness` | 6.0 s | the count restarts |
| Ch10 E1.1 cut the chain | `holdE` | 2.0 s | the jaws open again; the hold restarts |
| Ch10 E1.3 `Hold the door` | `holdE` | 10.0 s | progress pauses (no reset); the door swings to against the chair; Carrow: "Champ." |

- **Archetype ids.** Encounters use the engine's archetype ids: `collector`, `thug`, `trained_boxer`, `guard`, `director`, `boss collector`, `champion`, sparring partner, heavy bag / dummy (with a light "swing dummy" variant that launches like a light enemy, Ch5). There is no ally-combatant AI, no protector archetype, no hazard-tile system and no enemy ladder-climbing anywhere in the bible; scenes that seemed to need them are staged with scripted beats, trigger zones and spawn points (Ch4, Ch6, Ch9, Ch10).

## Cast bible
Looks are simple pixel shapes and colours; standing heights in px (Jin = 46). No faces are drawn on anyone: posture tells everything.

### Jin Seo (Seo Jin), 26 in 1994 / 28–29 in 1996–97
- **Look.** 46 px, a regular athletic boxer's build: developed shoulders, narrow waist. Dark-brown Korean two-block hair, fringe over the eyes, upper face shaded, no eyes drawn. Muted blue zip track top (off-white sleeve stripes, collar slightly raised), black pants, worn white running shoes; no cane, ever. Ring 1994: navy robe with `EASTGATE` in off-white on the back (Umma's letters, the G crooked), blue trunks with a white stripe. From 1996: a broad reddish healed scar patch on the right cheek; the track top a little loose across the shoulders; hospital gown and gray rehab tee in Ch1; brass knuckles as two 2 px glints when worn.
- **Body language.** Idle is a relaxed guard with a small weight shift; he stands half-turned, ready. When thinking he rolls his neck once. Under emotion his head goes down and his hands go into his pockets. In rehab (Ch1) his idle lists right and he touches walls. After hard fights (Ch8, Ch10) his shoulders heave and his hands tremble 1 px.
- **Voice.** Few words, plain, dry; his inner voice (italic thoughts) carries most of what he feels. "*That's not my name. My name is Seo Jin.*" / "They already did, Lenny. Mostly." / "Nobody asked me."
- **Wants.** At first: his name back and the truth. Then: to make someone answer. At the end: to decide where the cost falls.
- **Perspective.** He was the sacrifice; he refused the bribe once at 26 and nobody asked him again. His suffering is real; the question the game keeps asking him is whether it gives him the right to repeat it.
- **Change.** From a confident fighter to a body that won't answer, to a man who can win short desperate fights and nothing longer; from revenge to responsibility (or to the bargain). His speech reflects the player's real choices (`jin_voice`); he never talks as if he brutalised people the player spared.

### Min (Seo Min-ji), 22 in 1994
- **Look.** 40 px, slim. Black bob with blunt bangs, a **yellow scrunchie** on her wrist or in her hair (the brightest small colour in Ch0), oversized maroon cardigan over a Calder Community College tee, faded jeans, red sneakers, a Pentax K1000 on a strap across her body, ink on her right hand. Kwik Copy name tag on weekdays.
- **Body language.** Sits on counters with her heels knocking the cabinet; points with whatever she's holding; jabs Jin's shoulder; walks fast and turns round to talk.
- **Voice.** Teasing, quick, organised, funny when she's frightened. "They airbrushed you into a different person. That is a man who sells aluminium siding." / "Win fast. The bus." / (letter) "I'm going to stop waiting. I'm not going to stop looking."
- **Wants.** Her brother home; a door that locks; her bookkeeping certificate; a family that pays its own way.
- **Perspective.** Never doubted he was alive; refused the TV story; fought institutions with petitions, carbons and photographs.
- **Change.** Seen only in Ch0, then in what she left: the fridge note, nine letters, eight photographs, a coat with a button half sewn. Ch6 makes her a whole person and not only a searcher.

### Umma (Mrs. Seo Mi-ok), b. 1942
- **Look.** 40 px, slight. Gray-streaked black hair in a low bun, lavender work smock over a cream blouse, brown cardigan, black flats, reading glasses on a beaded chain.
- **Body language.** Works with her back half-turned (`cook/work at counter`); stands with hands folded at her waist when worried; taps Jin's forearm twice for goodbye; bites a thread off.
- **Voice.** Short sentences, practical, warmth hidden in instructions. "Jin-ah. Sit. Eat first. Then be famous." / "A cab is eight dollars." / "You lost. Okay. Umbrella."
- **Wants.** Her children safe and fed; to get home after the fight; Saturdays back, someday.
- **Perspective.** Never in the arguments; her life is the stake. She went to court in her good navy coat; she kept working sixty-hour weeks at Royal Linen while they searched.
- **Change.** None on screen after Ch0. The player learns her through her paystubs, a shopping list, a needle, her Singer's rhythm in Odette's machine.

### Coach Teddy Marsh, 61 in 1994
- **Look.** 47 px, heavy. Bald with a gray horseshoe of hair, white mustache, gray `MARSH B.C.` sweatshirt, whistle on a shoelace (1994). From 1996: thinner, a gray `IRON PULSE` staff vest, a push broom, a ring of keys. Drives a maroon '84 Buick wagon.
- **Body language.** Arms crossed; taps his watch; kneels in front of the stool; cuts hair behind a fighter so he never has to look at his face (Ch2).
- **Voice.** Gym liturgy, gruff, short. "Hands up, chin down, feet under you. That's the whole religion." / "It's nerves, kid." / "Same corner. I'm not leaving it this time."
- **Wants.** In 1994, the title he waited thirty years for. Since then: to stop hating himself, which he knows he can't buy.
- **Perspective.** Honest and wrong: he called the warning nerves because the other answer meant stopping a title fight. He paid for the family's small stone and never said.
- **Change.** From the man who sent Jin out to the man who asks first ("Are you all right? If you're not, I stop it."). In Ch9 he tells Jin to take the deal, and tells him not to listen to him.

### Lenny Voss, cutman, 49 in 1994 / 52 in 1997
- **Look.** 44 px, slim, rounded shoulders, thinning slicked hair, maroon windbreaker, gold chain, a **roll of white tape worn on his left wrist like a bracelet** (the clue in the Ch0 fragments). A green tackle box (his cut kit). A brown Cutlass with a rosary on the mirror.
- **Body language.** Rubs the back of his neck; wipes clean hands on a towel; a 1 px tremor in 1994, 2 px in 1997; flinches (`cower`) when cornered; laughs at the wrong time.
- **Voice.** Nervous patter. "Big night, kid. Big night." / "I carried a bottle. That's all I did." / "I laced your gloves so you wouldn't look at my hands."
- **Wants.** His debts gone; not to be the one who did it.
- **Perspective.** A gambler who owed Harlan Street nine thousand and was told "slow, not that"; he believed it because he needed to.
- **Change.** Minimises, then confesses (fully if heard out). If heard out he keeps a copy, testifies, and in Ch9 tells Jin to take the money "because that's what I did".

### The man in the camel coat (never named)
- **Look.** 48 px, average build, neat silver hair, knee-length camel overcoat in every season, charcoal suit, gray scarf, thin leather gloves. Never sweats, never hurries.
- **Body language.** Sits on the far edge of benches; hands still; appears in mirrors, at the ends of rows, behind windshields; turns his back to rooms.
- **Voice.** Soft, reasonable, paternal. "I'm not anyone. I'm the kind of person who's in a lot of locker rooms." / "That isn't a bribe, son. That's arithmetic." / "I did tell you to take the money."
- **Wants.** The arranged result; nothing personal.
- **Perspective.** The instrument of the financiers: he offered Jin the bribe, did the talking to Rook in July 1994, nodded to Ray from the press row. He works for Lyle Penner (his coat hangs outside Penner's office in Ch9).
- **Change.** None. That is his function: the system's patience.

### Ray Castell, champion, 29 in 1994 / 32 in 1997
- **Look.** 50 px (taller than Jin, longer reach), close-cropped hair with a shaved part. 1994: white satin robe with gold trim, gold trunks with black trim. 1997: charcoal suit with the tie pulled loose; burgundy tracksuit with gold piping at the gym.
- **Body language.** A showman's slow walk; **taps his gloves together twice** before he commits; **taps his chin with the left glove before the straight right** (his tell); below 30% he glances at the press row.
- **Voice.** Charming, then raw. "Good luck, kid. I mean it. Make it a fight." / "I saw it in the second round. I knew. You think I didn't know?" / "You know what a champion is at twenty-nine? A man who's about to not be one."
- **Wants.** To stay relevant; to keep feeding the people whose paychecks stand on him; to be somebody's guest of honour.
- **Perspective.** He knew Jin was impaired, benefited, and continued when he could have stopped. His fear explains it and doesn't absolve it.
- **Change.** Beaten in the same ring with nothing restored to anyone. If Jin stops, he gives Penner's name and testifies; if not, he can't.

### Hana Lim, rehabilitation therapist, 29
- **Look.** 42 px, slim. Black ponytail with a pencil through it, teal scrubs, white cardigan, ID badge on a lanyard, white sneakers. Off duty: navy peacoat, gray scarf. A clipboard she hugs.
- **Body language.** Kneels to eye level; hugs the clipboard; hands on hips when decided; sits on windowsills only when something has changed.
- **Voice.** Precise, kind, dry. "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe." / "Because the chart's wrong. I hate it when the chart's wrong." / "Both doors are real. Somebody should say so."
- **Wants.** The chart to be true.
- **Perspective.** Not on Jin's side; on the side of true records, which turns out to be the same thing. She files a state complaint and is put on review.
- **Change.** From trusting the file to holding the evidence; she never tells him what to choose.

### Gerald Pike, liaison, Calder Foundry Relief Fund, 54
- **Look.** 44 px, slim. Comb-over, wire glasses, a brown suit a size too big, tan raincoat he never takes off, briefcase. Leaves a butterscotch on the tray at every visit.
- **Body language.** Sits on the edge of chairs with the briefcase on his knees; squares papers to the edge of desks; adjusts his glasses before lying.
- **Voice.** Soothing institutional. "Confusion is very normal, Daniel. The brain fills gaps with stories. Boxing is a very common story." / "We're paying for all of this, Daniel. The least we can do is get well quietly." / "I'm a clerk. I had a mortgage."
- **Wants.** To be the man who followed instructions.
- **Perspective.** Administered the Fund for the Council; held the family's letters "per instruction", redirected their application, kept copies to prove it wasn't him.
- **Change.** From controller to frightened clerk who writes it all down (if asked) and leaves for his sister's in Tucson.

### Walter Rook, leader, Northside Community Council, 63
- **Look.** 48 px, broad, slightly stooped. Trimmed gray beard, a **flat cap**, a canvas work jacket over a cardigan, reading glasses on a cord. Walks everywhere on the Northside.
- **Body language.** Sits on stoops instead of standing over people; a hand on shoulders; one hand at the small of his back. **Takes off his reading glasses and folds them when cornered.** Holds his cap in both hands when he confesses.
- **Voice.** A union man's plain cadence; names, dates, numbers. "Twelve hundred and fourteen dollars." / "I told myself once. A man can live a long time on once." / "No. Nobody asked you."
- **Wants.** Two hundred and twelve households in their homes; once, he wanted it badly enough to buy it with someone else's life.
- **Perspective.** Eleven years of polite fundraising failed; the criminal arrangement worked in three weeks; the financiers kept most of it; now the outfit holds the Council's leash. He authorised the interference, stayed seated when Jin's legs went, said "Then nothing changes," and wrote "Maintain."
- **Change.** From beloved benefactor to a man reading his own handwriting. Never a boss fight. He refuses to sign the Southbank letter (Alder Row's, though Ch7's copy leaves the name blank), testifies in every version of Ending Two, and is neither forgiven nor destroyed on screen.

### Mara Kowalski, maintenance lead, Foundry Courts, 41
- **Look.** 44 px, broad. Short ash-blond hair under a dark-green beanie, brown canvas work jacket over a gray hoodie, tool belt, work boots, a red rag in her back pocket, a pencil behind her ear. Drives a red '81 Ford pickup.
- **Body language.** Crouches at valves; wipes her hands before offering one; walks backwards carrying the other end; arms crossed at the back wall of meetings.
- **Voice.** Blunt, funny, exact. "You can carry a radiator or you can carry an opinion. We're short on radiators." / "Nobody runs this place. That's the point of this place." / "I fixed these pipes with that money. I'd fix them again. That's the worst part."
- **Wants.** The boilers running and her crew paid; not to look a gift roof too hard.
- **Perspective.** Knew the Council helped buy the buildings; didn't know about the fight (PDF). After Ch7 she won't give the roof back and won't shake Rook's hand again.
- **Change.** Gives Jin work and a cot; becomes the relationship most shaped by his small choices (the envelope, the boiler); in Ch9 refuses to decide for him.

### Mo Feeney, promoter, the Cellar, 61
- **Look.** 46 px, heavy. Red face, white hair, plaid sport coat, open-collar shirt, a pinky ring, an unlit cigar.
- **Body language.** Sits wide; licks a thumb and counts bills; points with the cigar.
- **Voice.** Carnival barker. "That's not a fight, that's a resurrection. People pay for resurrections." / "I don't fix fights. I suggest outcomes."
- **Wants.** A good card.
- **Perspective.** Never reacts to anything moral; rents out fighters to whoever pays (Ch10).
- **Change.** None; he is the economy.

### The underground fighters
- **Deshawn Tillery, 23.** 46 px, lean, gray hoodie, black trunks, headphones round his neck, a shoelace key to Mo's back room on his neck. Skips rope; shadowboxes with headphones on. Cocky and generous: "Nobody slips it." / "Lose the booking, lose the key." / "Don't you dare make my grandma's roof a question." Fights because Mo's rule says fighters who train in his room fight when booked (the PDF's "refusing the booking would cost him his place at the gym"). Lives at Foundry Courts with his grandmother Odette; on Mara's crew; teaches the Saturday kids' class. Teaches Jin the second dash, the counter, the uppercut and the flurry. Changes from opponent to friend or to a wounded man Jin didn't show up for.
- **Stan "Wojo" Wojcik, 46.** 48 px, heavy, forklift-driver's jacket, a laugh that slaps his own chest. "Oh-and-nineteen! Undefeated in spirit!" / "Down here for six minutes I'm a lion." Fights for the pleasure of it. His mother Wanda volunteers at the Council's pantry.
- **Cyrus "Slim" Whitlock, 34.** 50 px, long-armed, gray hood, a towel over his head, a knee sleeve; sleeps on a cot in the Pit and lives half in his brown '78 Buick; a photo of his daughter Tanya. "I sleep on that cot because I'm useful. Useful means I fall when Mo says." Ex-pro, skilled enough to win, told which result is expected (the PDF's second fighter, the mirror of Ch0). Teaches the hook. Rented to the Ch10 crew by Mo; at Alder Row he either refuses or works, by how Jin treated him.

### Dutch Brannigan, boss collector, Harlan Freight Depot, 59
- **Look.** 52 px, heavy. Navy peacoat, black knit cap, gray stubble, scarred knuckles, a key ring on a chain he swings; his late wife Moira's wedding date is the safe's combination.
- **Body language.** Walks forward with arms wide like he's herding cattle; never runs; cracks his neck; folds his peacoat carefully before a fight.
- **Voice.** Gravel, amused, honest about what he is. "There's no back door, son. There's never a back door." / "Nobody paid for your fight. Your fight paid for things." / "We're the truck. Ask who paid for the gas."
- **Wants.** The work done, the envelopes moving, nobody asking him what's in them.
- **Perspective.** A working man who runs a criminal workplace; he moved Jin "somewhere quiet"; he sat beside Rook in Row K.
- **Change.** If Jin walks away at the river, Dutch walks away from him twice (Ch7, Ch10). If Jin keeps going, he waits all winter for a rematch at the gate.

### Foundry Courts residents (Ch5 onward)
- **Odette Baptiste, 71** (tenants' secretary; Deshawn's grandmother). 38 px, small, a lavender umbrella, a broom at 7 AM, a black Singer at the community-room window (Umma's model). Took the minutes for eleven years and typed Rook's "one-time arrangement". "Slow. Nobody's chasing you. Not today." / "Tell me what kind of man he was that night." Can't reconcile gratitude with what happened (PDF).
- **Gus Lindqvist, 68** (ex-foundry pipefitter; radios; boilers part-time). 44 px, stooped, cardigan, a screwdriver behind his ear, coughing. The one no vote in 1994: "Ask where it comes from." Rejects Rook immediately in Ch7.
- **Darnell Greer, 36** (Mara's crew; rail-yard nights when unpaid) and **Keisha Greer, 8.** Darnell: orange rail vest, hard hat, arms crossed; angry at Jin out of fear ("Is the bank going to take it back?"). Keisha: pink jacket, oversized gloves, hopscotch; "Are you a real boxer or a fake boxer?"
- **Nell Faraday, 50s** (Council site coordinator). Cardigan, clipboard; delivers the payroll Mondays; keeps the waitlist. "I just do the forms. I believed the forms." / "The deed's the deed. The roof is real."
- **Elena Vasquez** and three children (face only; 4D was promised to her). "My kids are warm. I can't be sorry my kids are warm."

### Celeste Ashgrove, chair, Ashgrove Capital, 50s
- **Look.** 44 px, silver bob, black turtleneck under a charcoal tailored suit, pearl earrings.
- **Body language.** Seated at the far end of the table, hands flat and still; a flat palm on the table when something is settled; stands once.
- **Voice.** Unhurried, never raised, honest because she can afford it. "We aren't your enemies, Mr. Seo. We're your options." / "Mr. Rook said no the second time. It's easy to say no the second time." / "We're offering you *over*."
- **Wants.** Value moved; a face that makes it look like mercy.
- **Perspective.** Has never been to the places her decisions reach; has been to the model in the lobby.
- **Change.** One moment of doubt, at the model: she once asked who lived in the four gray blocks, was told "units", and let it go; she says so in Ch9 and closes the subject herself. In Ending Two she remains chair after a fine.

### Lyle Penner, managing director, Ashgrove Capital, 40s
- **Look.** 47 px, slim, navy suit, horn-rimmed glasses, sleeves rolled, a black fountain pen he uncaps and recaps.
- **Body language.** Sits on the edge of tables; reads lines off a typed page; smiles while saying numbers.
- **Voice.** Cheerful, exact, quoting the player's own choices back. "We have very good notes." / "I gave the last instruction because somebody has to." / "A man who can't be bought at twenty-six is worth a great deal at twenty-nine."
- **Wants.** The closing at 10:00.
- **Perspective.** Gave the final instructions in 1994 (the note to Ray on his notepaper; "now"); remembers it as a decision, not as a man on a canvas. **One sincere belief:** "Alder Commons is a hundred and forty homes where there are twenty-four. I believe that, Mr. Seo. That's what makes me good at this." He has done the arithmetic and likes the answer; that is what makes him dangerous rather than a cartoon.
- **Change.** None on screen; in Ending Two he resigns and waits for a trial, still believing in the model.

### The Alder Row residents (Ch10 only; strangers)
No backstories, each one human thing (PDF). **Mr. Tran** (`TRAN SHOE REPAIR · KEYS CUT`; gray apron; pulls his grate down and pours free coffee for everyone, the crew included). **Rosa Medina** (house 7; drags a crib mattress to safety; "I've got a baby. I'm not standing in front of anything."). **Gloria Pryor** (co-op president, 70s; reading glasses on her head; clipboard; "Somebody tell me the third thing.") and her grandson **Terrence Pryor**, 19 (a broom handle held like a bat). **Henry Odell**, 84 (a webbed folding chair on his stoop, a radio on his knee; "Fifty-one years."). **June**, 10 (a bike, a stack of flyers: `DO NOT SIGN ANYTHING`). Jin has no friend, relative or secret connection among them, and none is ever revealed. **Every Ch10 surname is checked against the whole cast** (Tran, Medina, Pryor, Odell; June has none): none is shared with anyone Jin knows, so nothing hints at a family link (the earlier "Hale" echoed Bernice Hale at the Annex, and "Phan" echoed Dot Pham).

### Supporting cast (each carries a fact, a choice or a perspective)
Mrs. Grace Okafor (3A; Umma's friend; "Knock him down, then come home safe. In that order.") · Rita Mancuso (Sunny's waitress since 1981; free refills, says little) · Augie (Sunny's cook) · Earl Dunning (Room 214's roommate; the crossword; the radio Jin keeps) · Nurse Dolores Reyes · Dr. Anita Whitlow ($84,000; the affidavit) · Sister Margaret Doyle (twelve beds) · Petra Novak and Rosie (the new 3B) · Benny Szabo, Carl Dunphy, Vic (Pike's collectors) · Otis (YMCA desk) · Peg Halloran, Tiny Russo, Doc Ferris (Starlite) · Fran DeLuca (Harlan Grill), Pat Gorman (old gate man; never hit), Carmine "Whistle" Dalto (yard foreman, director), Roz Kaminski (night dispatcher) · Arnie Dukes (Annex property cage), Bernice Hale (Window 5), Wendell Asher (former Lindell night man), Dot Pham (Kwik Copy, Min's coworker), Dr. Saul Brandt (the dentist at 88 Market) · Wanda Wojcik (Council volunteer; Wojo's mother) · Vince Carrow (Harlan Street crew boss) · Morty Fine (Civic timekeeper since 1961) · Joan Albright (Calder Ledger; Hana's college roommate) · Owen Tully (analyst, floor 22), Mr. Garvey (tower security) · Brenda and Ed (Channel 6).

## Flags & relationships registry

### Choice flags
| Flag | Values | Set where | Read where |
|---|---|---|---|
| `ch0_purse_dream` | `rent` / `umma_saturdays` / `new_apartment` | Ch0 kitchen | Ch0 coat's arithmetic; Ch2 Okafor; Ch6 letter 4, Section 14 thought; Ch9 offer item 2; Ch10 gate thought; Ending One apartment |
| `ch0_refusal_line` | `not_for_sale` / `my_family` / `get_out` | Ch0 Locker B | Ch9 Penner quotes it; Ch10 gate voices |
| `ch0_told_teddy` | bool | Ch0 tunnel | Ch0 corner variant; Ch2 Teddy; Ch8 corner line |
| `ch0_resistance` | 0–3 (counters landed in round 3) | Ch0 bout | Ch8 Ray's line |
| `ch1_told_hana_boxing` | bool | Ch1 bars | `hana` +1; Ch1 leaving line; Ch6 Sunny's |
| `ch1_pike_stance` | `played_along` / `insisted` | Ch1 Week 7 | Ch2 van timing; Ch6 Pike's file note |
| `ch1_records_route` | `with_hana` / `alone_at_night` | Ch1 Week 10 | `hana` +2/0; Ch6 phone, Sunny's |
| `ch1_fare_source` | `hana_loan` / `activities_jar` / `earl_gift` | Ch1 Dec 18 | Ch6 Hana (repay or the jar); Ch9 Penner (jar); `take_count` +1 (jar) |
| `ch1_signed_name` | `seo_jin` / `daniel_ahn` | Ch1 lobby | Ch2 Benny's opener; Ch9 Penner |
| `ch2_saw_height_marks` | bool | Ch2 3B doorway | Ch9 Petra and Rosie's new mark |
| `ch2_took_mailbox` | bool | Ch2 3B | Ch6 Window 7 (`ev_returned_letter` if not taken) |
| `ch2_teddy_tone` | `blamed` / `asked` / `forgave` | Ch2 haircut | `teddy` −1/+1/+2; Ch4 mitts tone |
| `ch2_collector_after` | `let_go` / `hit_again` | Ch2 alley | Ch3 Lenny's opener; Ch6 stair; Ch9 van; Ch10 Benny; `harm_count` |
| `ch2_called_hana` | bool | Ch2 YMCA | `hana` +1; Ch3 Otis |
| `ch3_touched_gloves` | bool | Ch3 tryout | `deshawn` +1; Ch5 Deshawn |
| `ch3_lenny_water` | `took_bottle` / `tap_cup` | Ch3 wraps | Ch3 corner; Ch8 Teddy's bottle line |
| `ch3_slim_result` | `straight` / `arranged` | Ch3 curtain | Bout 2 mode; `slim` +2; Ch9 Penner (arranged) |
| `ch3_covered_slim` | bool | Ch3 after the card (straight only) | `slim` +2; Ch10 10.3 Slim's line ("You owe me nothing...") |
| `ch3_teddy_mitts` | bool | Ch3 Friday | `teddy` +1; the loft "why" line |
| `ch3_lenny_method` | `patient` / `pressed` | Ch3 loft | Tape clean/stretched; `lenny` +2/−3; Ch6 Lenny at the corner; Ch8 copy holder; Ch9 visit; Ending Two; `threat_count` |
| `ch4_scouted` | bool | Ch4 booth | Siding route; Ch9 Penner |
| `ch4_called_hana` | bool | Ch4 Grill | `hana` +1 (+1 "after"); Ch6 Sunny's |
| `ch4_roz` | `let_go` / `threatened` | Ch4 dispatch | Safe combination; `ev_roz_account`; Ch8 copy holder; Ch9 Penner list; Ch10 Joan; `threat_count` |
| `ch4_took_profit` | bool | Ch4 counting room | +$600; Ch9 Celeste |
| `ch4_envelope` | `taken` / `left` | Ch4 counting room | Ch5 whole texture; Ch7 Darnell/Rook; Ch9 Penner; Ch10 thought; `take_count` |
| `ch4_dutch_after` | `walked_away` / `kept_going` | Ch4 river | Ch7 branch; Ch9 van; Ch10 both endings; `harm_count` |
| `ch5_held_mitts` | bool | Ch5 gym | Ending Two teaching vignette |
| `ch5_promised_corner` | bool | Ch5 gym | Ch6 Saturday choice exists; going to 88 Market sets `pike` if true, `pike_unpromised` if false |
| `ch5_left_repair` | bool | Ch5 boiler night | `ev_pike_call`; `mara` ±2; Ch7 Mara; Ch9 Mara; `abandon_count` |
| `ch5_took_4d` | bool | Ch5 Rook's visit | Base; Ch6 Elena; Ch7 Rook; Ch9 Penner; Ch10 thought; `take_count` |
| `ch5_meeting_stance` | `boiler` / `payroll` / `kitchen` / `independence` / `silent` | Ch5 meeting | Ch6–7 prop; Ch7 Gus; Ending Two Courts card |
| `ch5_donation` | amount | Ch5 meeting | `courts` +1 if ≥ $20; Ch7 Odette |
| `ch5_returned_envelope` | `confessed` / `anonymous` / `kept` / `confessed_late` (unset if `left`) | Ch5 night / Ch7 meeting | Ch7 Mara/Darnell; Ch9 Penner; `take_count` stays |
| `ch6_asher_method` | `patient` / `threatened` | Ch6 Suds | Full/partial testimony; Ch8 copy holder; Ch9 Penner; Ending Two; `threat_count` |
| `ch6_strippers` | `talked_down` / `fought` | Ch6 Lindell | Flavour (Fitz waves in Ch9's first bus-ride vignette) |
| `ch6_saturday` | `corner` / `pike` / `pike_unpromised` | Ch6 Saturday | `deshawn` +3 (`corner`) / −3 (`pike` only); Pike in person (both pike values); Ch7 Deshawn; Ch10 thought; `abandon_count` +1 (`pike` only: a promise broken). `pike_unpromised` = no promise was made, so no penalty and neutral lines |
| `ch6_towel` | `thrown` / `sent_out` | Ch6 corner | Ch7 Deshawn; Ch10 thought |
| `ch6_pike_statement` | bool | Ch6 (pike path) | Ch7 presentable; Ending Two |
| `ch6_okafor_print` | bool | Ch6 side | Section 14; Ch9 Okafor's TV; Ending Two |
| `ch6_hana_repaid` | bool | Ch6 Sunny's | `hana` +1; Ch9 Hana |
| `ch6_gave_back_4d` | bool | Ch6 side | `courts` +1; `take_count` −1; Ch7 Rook; Ch9 Penner |
| `ch6_flowers` | bool | Ch6 cemetery | Flowers stay |
| `ch6_finished_button` | bool | Ch6 cemetery | Ch9 cemetery thought; both endings' coat |
| `ch7_rook_answer` | `would_have_asked` / `dont_know` / `not_this` | Ch7 office | Ch9 Rook/Gus; Ch10 gate thought |
| `ch7_hit_rook` | bool | Ch7 office | Bruise; Ch9 Rook; `harm_count` |
| `ch7_truth_told_by` | `rook` / `jin` | Ch7 office | Meeting staging; `courts` +1 (rook); Ch9 vigil; Ending Two |
| `ch7_stayed_at_courts` | bool | Ch7 night | Ch8–9 base |
| `ch8_hands` | `wraps` / `knuckles` | Ch8 Locker B | Fight numbers; Ray; Ch9 Penner; Ending Two room |
| `ch8_teddy_bottle` | `drank` / `declined` | Ch8 Locker B | Ending Two gym |
| `ch8_robe` | bool | Ch8 Locker B | Walk-out; both endings |
| `ch8_ray_after` | `stopped` / `continued` | Ch8 ring (played) | `bell_state`; Ray's statement; Ch9 Penner/Hana; Ending Two; relationships; `harm_count`. **Never read by the ending choice.** |
| `copy_holder_<id>` | bool each: `hana` (always), `mara`, `teddy`, `lenny`, `deshawn`, `roz`, `asher`, `okafor`, `dot`, `ray` | Ch8 dawn | Ch9 Penner's list; Ending Two speed and witnesses |
| `ch9_owen` | `persuaded` / `threatened` | Ch9 floor 22 | `ev_relocation_model`; Ch9 Penner; both endings; `threat_count` |
| `ch9_visits` | set of ids: `hana`, `mara`, `courts`, `teddy`, `rook`, `lenny`, `deshawn`, `okafor`, `petra`, `sunnys`, `section14`, `river_path` | Ch9 Thursday | Completion screen; the Thursday props (Ending Two card 9; Ending One's closet box) |
| `ch9_mara_will_come` | bool | Ch9 Mara (if `mara ≥ 3`) | Ending One (truck turns round); Ending Two (truck blocks) |
| `ch9_knuckles` | `took` / `left` | Ch9 door | Ending Two tuning; Teddy's Saturday line (Ending Two card 7) |
| `ch10_names_learned` | list of resident ids | Ch10 street | Ending One report; Ending Two walk |
| `ch10_choice` | `accept` / `refuse` | Ch10 gate | **The ending.** The only flag that decides which ending plays. |

### State flags (not choices)
`bell_state` (`rung` / `ringing`, from `ch8_ray_after`) · `base` (`stagnes_room214` → `ymca_312` → `courts_workshop` (the loft) / `courts_4d` → `calder_arms` / `iron_pulse_backroom` (Ch7's fallback when the Calder Arms can't be afforded)) · `ch3_tryout_won`, `ch3_slim_won` (bout results; the Ch3 chalkboard and purses read them) · `phase` (chapter-local day phase in Ch5 and Ch9: `morning` / `afternoon` / `evening` / `night` (/ `small_hours` in Ch9); NPC spawn tables and lighting read it) · `ending_seen_one`, `ending_seen_two` · per-chapter `chN_complete`.

### Relationship meters (integers; shown in the People tab only as a short sentence, never as a number)
| Meter | Moves up | Moves down | Read at |
|---|---|---|---|
| `hana` | told her about the fight (+1), records together (+2), first drill (+1), calls (Ch2 +1, Ch4 +1/+1, Ch8 +1), repaid (+1) | the bingo jar (−1), Ray continued (−1) | ≥ 3: call log (Ch6), Joan's offer (Ch9), she arrives with the Ledger (Ending Two) |
| `teddy` | Ch2 asked (+1) / forgave (+2), Ch3 mitts (+1), Ch4 mitts (+1 if already ≥ 1) | Ch2 blamed (−1), Ray continued (−1) | ≥ 0 robe; ≥ 1 copy holder; ≥ 2 Ch8 corner, Ending Two corner and Saturdays |
| `lenny` | patient (+2) | pressed (−3) | copy holder and witness via `ch3_lenny_method` |
| `deshawn` | touched gloves (+1), asked why (+1), Ch5 gym (+1), Ch6 corner (+3), towel thrown (+1) | Ch6 `pike` (−3; never for `pike_unpromised`) | ≥ 1 Ch8 scouting, copy holder; ≥ 2 Ending Two gym; ≥ 3 Ch9 line, Ending Two ally; ≥ 5 Ch7 softening |
| `slim` | fought straight (+2), covered his pay (+2) | — | ≥ 2: Ch10 refuses to work / guards Odell |
| `mara` | shifts (+1 each, max +3), stayed with the boiler (+2), roof line (+1), confessed (+1) | left the boiler (−2), late confession (−1), kept the envelope (−1), Ray continued (−1) | ≥ 1 copy holder, Ending Two work; ≥ 2 Ch7 roof, Ending Two room; ≥ 3 Ch9 "I'd come" |
| `courts` (the residents as a whole) | shifts (+1, max +2), boiler (+1), donation ≥ $20 (+1), gave back 4D (+1), Rook told it (+1) | left the boiler (−1), took 4D (−1), silent at the late envelope (−1), kept envelope (−2) | Ch7 meeting (≤ 0 more people turn on Jin; ≥ 2 only Gus leaves) |

### The four tallies (the PDF's four questions; read only for Jin's own voice and a few lines; **never for the ending**)
| Tally | PDF question | Incremented by |
|---|---|---|
| `take_count` | Does Jin take money or things already allocated to someone else? | the bingo jar (Ch1), the payroll envelope (Ch4), 4D (Ch5; −1 if given back in Ch6) |
| `threat_count` | Does he threaten a frightened witness to save time? | Lenny pressed (Ch3), Roz threatened (Ch4), Asher threatened (Ch6), Owen threatened (Ch9) |
| `abandon_count` | Does he abandon a commitment for an investigative opportunity? | left the boiler for Pike (Ch5), left Deshawn's corner for Pike (Ch6; only if he had promised it: `ch6_saturday = pike`) |
| `harm_count` | Does he keep hurting someone after getting what he needs? | Benny hit again (Ch2), Dutch kept going (Ch4), Rook hit (Ch7), Ray continued (Ch8) |
- **The voice is split in two**, so each line reflects only what the player actually did (PDF):
  - `jin_voice` comes from **`harm_count` only**: `restrained` (0), `mixed` (1), `hard` (≥ 2). It drives every line about **hitting** (Rook's Ch7 line, Jin's Ch7 answer, the Ch9 sleep thought, the Ch10 "hurting" gate thought). A player with `harm_count = 0` always gets restrained wording, however many people he frightened.
  - `threat_voice` comes from **`threat_count`**: `none` (0), `some` (≥ 1). It drives a **separate** thought about **frightening** people ("*I scared people who were already scared. It saved me time.*", naming only the people actually threatened) in Ch7 (after Rook's line), Ch9 (the sleep thought) and the Ch10 gate. `none` adds no line.
  - Neither is read by the ending. If the player has shown restraint, Jin never speaks as if he brutalised anyone, and a player who only threatened is never voiced as having hit anyone.
- `support_at_alder` (computed at the start of Ch10): Slim (`slim ≥ 2`), Benny (`let_go`), Dutch (`walked_away`), Mara (`ch9_mara_will_come`), Teddy (`teddy ≥ 2`), Deshawn (`deshawn ≥ 3`), Hana (`hana ≥ 3`). It changes the Ending Two fight and both endings' supporting beats. It never changes which ending is available.

## Evidence and memory registry
★ = required for the main path (always obtainable on every route). Every item has a card on the evidence wall and a line in the Journal.

### Evidence
| id | Title | Where found | Text summary | What it proves |
|---|---|---|---|---|
| `ev_name_card` ★ | The name above the bed | Ch1 Room 214 | `AHN, DANIEL · DOB 03/14/68 · ADM 08/22/94 · FUNDING: CFRF` | Someone renamed him with his own birthday |
| `ev_pike_card` | Pike's business card | Ch1 | Calder Foundry Relief Fund, 88 Market St 2F, P.O. Box 1180 | Links Pike, the Fund, the box |
| `ev_current_file` ★ | Current chart face sheet | Ch1 Week 7 | Industrial accident, salvage at Calder Foundry, 08/20/94; "redirect gently"; "cooperative"/"agitated" | The false account, typed from Pike's face sheet |
| `ev_transfer_form` ★ | Original transfer form | Ch1 records | `SEO, JIN, DOB 03/14/68, MR# 4471-0`, closed head injury, professional boxing contest, Calder Civic Arena | Same MR number, different man: identity replaced after the fight |
| `ev_intake_whiteout` ★ | Intake sheet | Ch1 records | `SEO, JIN` showing through white-out under `AHN, DANIEL` | The replacement was done by hand |
| `ev_property_tag` | Patient property bag | Ch1 records | `SEO, J. · ER 8/20/94 · MR# 4471-0`; track top, licence CA-1187 | His own things, under his own name |
| `ev_whitlow_note` | Dr. Whitlow's sheet | Ch1 Dec 18 (morning) | Beacon Street Institute, 18 months, est. $84,000 | What real recovery costs; money can't buy it |
| `ev_earl_testimony` | Earl's account | Ch1 crossword | The Foundry closed in March 1992; nobody salvaged in August 1994 | The accident story is impossible |
| `ev_fight_poster` | The buried poster | Ch2 poster wall | Castell vs Seo, Aug 20, under three layers | — (memory of who he was) |
| `ev_missing_flyer` | Min's MISSING flyer | Ch2 Sunny's window | "He did NOT 'leave town.'" | Min searched publicly |
| `ev_returned_letter` | Returned mail | Ch2 Petra's shoebox, or Ch6 Window 7 | Housing Authority letter, Oct 4, 1995, returned | Help came to the wrong address |
| `ev_okafor_account` ★ | Mrs. Okafor's account | Ch2 3A | Eviction, Lindell House, the fire in February, the county burial, the Annex keeps things a year | The basic facts of their deaths |
| `ev_pickup_order` ★ | Benny's pickup slip | Ch2 alley | `AHN, D. — return to St. Agnes — job via L.V.` | Pike's collectors are hired through Lenny |
| `ev_card_book` | Mo's card book | Ch3 office | `1/11 Seo–Whitlock · Whitlock 2nd · house 3/2` | Results are arranged down there too |
| `ev_lenny_tape` ★ | Lenny's tape (partial) | Ch3 loft | Dutch: "one bottle, before he walks"; the coat: "Then it isn't your problem, Mr. Voss"; a radio jingle over the rest | The sabotage was ordered and paid through the depot |
| `ev_lenny_voucher` ★ | Petty cash voucher | Ch3 loft | `HARLAN FREIGHT CO. · L. VOSS · consulting 8/20 · $5,000.00 · 08/22/94 · Approved: D.B.` | Payment record for the corner |
| `ev_lenny_statement` | Lenny's statement | Ch3 loft | Full (patient) or partial (pressed) | The corner's part, in his words |
| `ev_transport_log` ★ | Dispatch binder 1994 | Ch4 dispatch | `08/20 23:52 Civic Dock B → Calder General ER, per D.B.` / `08/22 06:10 Calder General → St. Agnes, name per G.P., "back door"` | The gang moved him and the name |
| `ev_civic_ledger` ★ | Folder "CIVIC" | Ch4 Dutch's safe | L.V. $5,000; Dock B gate P.G. $200; unit 7 ER run $400; private transfer $1,800; G.P. paperwork $2,500; `CFRF — rm 214 — $3,100/mo`; `CFRF — admin, G.P. — $1,500/mo`; `POSITION: CASTELL KO RDS 3–5 · gross $4.1M · per A.C.` (no Council heading anywhere) | The fix produced a payout; the gang's money paid for his concealment through the Fund (whose master Jin doesn't yet know) |
| `ev_ncc_ledger` ★ | Ledger "N.C.C." | Ch4 records cage | Foundry Courts acquisition costs / title (4 bldgs), date and amount under a coffee ring; roofing B–C $31,200; boiler $22,400; community room $9,800; playground $4,100; maintenance payroll | Criminal money has legitimate destinations: housing purchases, repairs, community facilities, wages (PDF's second category; tagged *front?* until Ch5) |
| `ev_payroll_note` | The envelope's label | Ch4 counting room | `FOUNDRY CTS MAINT. PAYROLL · 2 WKS ENDING 1/17/97 · $1,840 · Kowalski 640 · Greer 480 · Tillery 320 · Lindqvist 240 · Baptiste 160 · deliver Mon. w/ N. Faraday` | Whose money it was |
| `ev_dutch_statement` | Dutch at the bollard | Ch4 | "Your fight paid for things"; "the money lives across the river" | The depot is the truck, not the driver |
| `ev_roz_account` | Roz's account (let go only) | Ch4 | Monday envelopes to Nell; Dutch drove the ambulance money | The Council's side of the window |
| `ev_courts_plaque` ★ | Bronze plaque | Ch5 gate | Deed recorded September 30, 1994; 212 households | Bought 41 days after the fight |
| `ev_courts_minutes` ★ | Tenants' minutes | Ch5 Odette | June 1994 $3,000; September $640,000 from "private partners"; source deferred | Suspicion without proof |
| `ev_pike_call` | Overheard call | Ch5 (left the boiler) | "He's at the Courts, Walter... You tell me what to do with him." | Rook is managing Jin's concealment |
| `ev_shopping_list` | Shopping list | Ch6 box | rice, scallions, navy thread, BATTERIES (hall detector!!), lottery YES for science | Their lives weren't only the search |
| `ev_fridge_note` | The fridge note | Ch6 box | "AFTER: Sunny's, window booth... WIN FAST. — M" | The message about meeting after the fight |
| `ev_umma_paystubs` | Royal Linen paystubs | Ch6 box | 60-hour weeks; "Sat. extra 4 hrs. For Min's books." | She kept working while they searched |
| `ev_min_notebook` ★ | Min's notebook | Ch6 box | Calder General "sponsor confidential"; Box 1180 letters #1–9, no answer; St. Agnes front desk 7/14/95 "no Seo here"; St. Agnes call 11/2; fares | The search and where it was sent; she reached his building's door |
| `ev_detective_invoice` | Calloway Investigations | Ch6 box | $350; "not located under given name" | The search cost money |
| `ev_council_referral` | Council letter | Ch6 box | Jan 1995: Eastgate outside service area, referred out, G. Pike for the Council | Assistance redirected |
| `ev_judgment` | Housing Court judgment | Ch6 box | Kessler Realty v. Seo, Apr 11, 1995; Umma's note: purse held until the fighter signs | The eviction; the purse they couldn't reach |
| `ev_ha_application` | Housing Authority file | Ch6 Window 3 | Pending, incomplete: "whereabouts of household member SEO, JIN" | His concealment blocked their help |
| `ev_building_complaints` ★ | Building Dept file | Ch6 Window 5 | Three complaints; petition signed first by Min; inspections postponed; next 2/22/96 | The building's danger was known |
| `ev_fire_report` | Fire Marshal report | Ch6 Window 5 | Feb 11, 1996, 02:40; Room 7 heater; rear exit chained; 3F detector sounded (resident's battery); two deaths | How it happened |
| `ev_asher_testimony` | Wendell Asher | Ch6 Suds | Lazarou's chain order (note in full version); Min went back up for Umma | Who chained the door; what Min did |
| `ev_film_roll` ★ | Min's eight frames | Ch6 Kwik Copy | Umma on the bus; the cake; the chained door 01/28/96; Umma laughing; Min with flyers; snow ×3 | Their lives, and Min documenting the door |
| `ev_min_letters` ★ | Nine letters to Box 1180 | Ch6 Fund storage | Sept 1994 – Jan 1996, stamped received, held | The family wrote; the box held them |
| `ev_pike_memo` ★ | Pike to Rook, June 12, 1995 | Ch6 Pike's drawer | "The Seo girl has written six times... She is now writing to every long-term facility in the county by name. How do you want this handled?" | Rook was informed the family was searching |
| `ev_rook_reply` ★ | Rook to Pike, 6/14/95 | Ch6 Pike's drawer | "Maintain. No contact, no confirmation. Nothing from our fund under that name. It holds, or everything goes. — W.R." | **The critical discovery:** he chose to preserve the concealment |
| `ev_pike_statement` | Pike's two pages | Ch6 (pike path) | The name change via Harlan Freight; letters held; $1,500 a month | A participant's sworn account |
| `ev_whitlow_affidavit` ★ | Dr. Whitlow's affidavit | Ch6 Sunny's | Daniel Ahn and Jin Seo are the same man | His identity, in a form a judge must read |
| `ev_stagnes_calllog` | Front-desk slip and switchboard log (hana ≥ 3) | Ch6 Sunny's | 7/14/95 visitor inquiry, Seo, M., "no such resident (per CFRF list)"; 11/02/95 Seo, Min-ji, "no such patient" | She came to, and called, the building he was in; the Fund's instruction turned her away |
| `ev_stone_ledger` | Cemetery ledger | Ch6 | Stone paid cash, T. Marsh, 4/96 | Teddy paid |
| `ev_exec_minutes` ★ | Executive minutes 8/15/94 | Ch7 archive | "One-time arrangement with outside partners"; Lindqvist opposed; no further minutes | The Council agreed to it |
| `ev_council_ledger` ★ | NCC capital account 1994 | Ch7 archive | 9/27/94 $640,000 from Harlan Freight Co. escrow ref ASH-0894; 9/28 paid to the pension trustee | The negotiated share financed Foundry Courts |
| `ev_rook_notebook` | Rook's 1994 notebook | Ch7 office | July: "a share — ONE TIME"; 8/21 "no name"; 6/14/95 "Told him maintain." | His reasoning, in his hand |
| `ev_rook_testimony` ★ | Rook's admission | Ch7 office | July at Starlite; Row K; "Then nothing changes." | The full chain, admitted |
| `ev_alder_letter` | Relocation letter (unsigned) | Ch7 | Council endorsement of the "voluntary relocation" of an **unnamed** Southbank cooperative (name left blank, no household count); due 4/1 | The outfit has outgrown the deal (Ch8's agreement fills the blank) |
| `ev_penner_note` ★ | Note to Ray, Aug 19, 1994 | Ch8 Ray's bag | Ashgrove notepaper: "The referee has been spoken to. Don't stop till it's done. Everything after is arranged. — L.P." | Identifies the financial leadership |
| `ev_alder_agreement` ★ | Ambassador agreement | Ch8 Ray's bag | Alder Row Cooperative, Southbank (24 units), closing Fri Apr 18, 1997, 10:00, Ashgrove Tower 30F; "R. Castell, or an alternative" | The upcoming property transaction (the first time Alder Row is named) |
| `ev_ray_statement` | Ray's statement (stopped) | Ch8 dawn | "I knew he was hurt. I kept going." Penner named | A champion's testimony |
| `ev_relocation_model` | Owen's printout (persuaded) | Ch9 floor 22 | 24 households, 6 holdouts, enforcement window, "public face: J. SEO (TBC)" | How the clearance was planned |
| `ev_offer_folder` ★ | The offer | Ch9 boardroom | Beacon Street PAID IN FULL; Riverside 1104; $4,000 × 36; name petition; title route; press release; the brass plate | The benefits are real |

### Belongings
`bel_dish` (Umma's cornflower Pyrex, from Mrs. Okafor, Ch2) · `bel_min_coat` (the charcoal coat with the half-sewn button, Ch6) · `bel_scrunchie` (Min's yellow scrunchie, Ch6) · `bel_old_flyer` (the 1995 MISSING flyer from Kwik Copy's corkboard, Ch8) · `bel_nameplate` (the brass `JIN SEO` plate, Ch9) · the `AHN, DANIEL` name card (Ch1) · Earl's radio (Ch1) · the knuckles (Ch2) · Hana's card (Ch1).

### Memories (memory filter; one Journal page each; shards develop from grainy frames into a clean strip)
| id | Title | Shards: where | Content |
|---|---|---|---|
| `mem_kitchen` | Eat first | Ch0 | The kitchen scene (+ Min's weigh-in notes if `q0_look_around`) |
| `mem_offer` | Arithmetic | Ch0 | The camel coat in the mirror |
| `mem_bottle` | You're dry, kid | Ch0 R2 (fragment) · Ch3 wraps (overlay) · Ch3 loft (complete) | Lenny, the white squeeze bottle with the red tape band, the gloves laced; "flashes" variant if pressed |
| `mem_corner` | Send him | Ch0 corner 2 · Ch2 Teddy's account · Ch3 the Pit stool (complete) | "It's nerves." / "He's fine, Ted. Send him." |
| `mem_row` | The half-second | Ch0 R3 · Ch8 Ray (complete if stopped) | Ray looks to the press row; the coat nods (Ray had already decided; the nod only told him nobody would stop him) |
| `mem_bell` | The bell | Ch0 | The bell ringing after he can't defend himself |
| `mem_waistband` | Hold still | Ch1 | Umma's needle and the bitten thread |
| `mem_roof` | Everything leaks | Ch2 412 roof | Fourth of July 1993 with Min |
| `mem_umbrella` | Umbrella | Ch2 bus bench | After his first amateur loss |
| `mem_first_wraps` | First wraps | Ch2 Iron Pulse bench | Teddy wrapping a fourteen-year-old's hands |
| `mem_backdoor` | Not tonight it isn't | Ch4 ambulance | Stretcher-level, ceiling lights passing (its own full-screen vignette strip; no camera rotation) |
| `mem_singer` | Sewing for God | Ch5 Odette's machine | Umma at her Singer on a Saturday night |
| `mem_booth` | Forty cents short | Ch6 Sunny's | Min counting quarters; Umma's dime |
| `mem_row_k` | Sit down, Walter | Ch7 (Rook's memory, cooler tint) | Row K; the cap rises and sits down |
| `mem_reel` | The whole night | Ch8 | Ch0 uncut, ending on Section 14 |

## Progression
Three kinds of advancement stay separate (PDF): **physical control and combat skill** (rehab, practice, techniques under pressure), **knowledge and access** (documents, testimony, introductions: these open places and accusations), **relationships and consequences** (promises, witnesses, resources, restraint: these change help, dialogue and lives).

### Combat skills: when and why
| Chapter | Unlocks | In-story reason |
|---|---|---|
| Ch0 | jab, cross, guard, slip, counter-cross, run, jump (prime body; power 1.3) | the boxer he was; wiped at the end |
| Ch1 | sit up → bars → wheelchair → walk → stairs/hop → run 85%, full jump; no punches | rehabilitation in timed sessions |
| Ch2 | jab–cross, guard, slip (vs slow committed attacks; **no counter window yet**: a successful slip shows the opening and the player throws an ordinary jab–cross into it), forward dash and backdash (1 charge), knuckles gear | instinct in the first exchange: speed and timing are still exceptional; stopping power isn't (power 0.55 bare / 0.80 knuckles) |
| Ch3 | second dash charge; the 0.3 s counter window after a successful slip and the counter-cross (the "reliable slip → counter-cross"); hook | Deshawn's footwork ladder and tip (the counter window opens from his tip on Thursday); Slim at the bag on Saturday before the card (fallback: answering Wojo's wide right in bout 1) |
| Ch4 | air dash; dash straight; backdash → returning cross | the container gap; Teddy's mitts (fallback: the corridor guard); Dutch's charge |
| Ch5 | uppercut | Deshawn, the Courts gym ("Hips first. The hand's the last thing to know.") |
| Ch6 | flurry | the Courts speed bag. **The core toolkit is complete.** |
| Ch7–Ch10 | nothing new | mastery tests only (PDF) |

### Training (Journal → Training; optional; never required between scenes)
- Drills: **balance** (bars, beam), **footwork** (tape marks, ladder), **reaction** (Hana's bulb board, pads), **conditioning** (laps), **bag** (combos), **mitts** (Teddy at Iron Pulse; Deshawn at the Courts), **slip-rope** (the Cellar, the Courts).
- **Drills unlock with the body, not the menu.** Ch1 Week 4: balance (the bars) and reaction (the board, seated). Week 7: footwork (tape marks at 60% walk). Week 9: conditioning (courtyard laps). Locked drills are listed with Hana's reason ("Laps when you can jog. Not before."). Bag and mitts open with a gym and punches: Iron Pulse from the Ch3 card, Deshawn's mitts in Ch5; slip-rope in Ch3.
- Each level is a short drill passed at a target (not repetitions); the next level stays locked until the story raises the cap. **Caps:** Ch1 1 · Ch2 1 · Ch3 2 · Ch4 2 · Ch5 3 · Ch6 3 · Ch7 onward 4 (final).
- Effects per level (small, capped; control of the body he has, never recovery from the injury): balance: stumble recovery 5% faster; footwork: dash recharge −0.03 s (0.60 → 0.48 at L4); reaction: slip window +4 ms (0.060 → 0.076 s); conditioning: winded threshold +0.5 s (6 → 8 s); bag: punch damage +4%; mitts: combo input window +10 ms; slip-rope: slip cooldown −0.02 s. Power never exceeds the chapter's body value.
- **Winded (no stamina meter):** the movement spec keeps basic movement and ordinary punches free of stamina. After ~6 s of continuous close exchange without a break, Jin's shoulders heave and small breath puffs appear; his punch damage drops 25% and dashes recharge 50% slower until he spends 1.5 s out of reach. Shown first in Ch1's laps; explained once in Ch2.

### Money
- Never negative (desks run a tab). The HUD shows money only in the Journal.
- **Sources:** Ch1 fare ($5–$20); Ch3 purses ($60 + $90 + $150 arranged / $120 straight and won / $60 straight and lost); Ch4 the A.C. stacks ($600, optional) and the payroll envelope ($1,840, optional); Ch5 shifts ($20 × up to 5); Ch6 corner money ($20); the Ch7 and Ch8 rest cards (Mara's crew or unloading trucks: +$60 and +$240). Without the depot money a campaign earns about $900; with all of it, about $3,300.
- **Sinks:** YMCA $8/night (charged on chapter cards; rule below), the Calder Arms $45/week, Slim's $100, Hana's $20, coffee and pie, flowers ($5), the Courts can, Doc Ferris ($40, optional), returning the envelope.
- **The YMCA rule (one formula).** Each chapter card, while the base is `ymca_312`, charges **(nights since the last card − nights prepaid) × $8**. Whatever Jin can't pay goes on **Otis's tab**; the tab clears automatically the next time money arrives (a purse, a shift), and the Journal's Money page shows it as one line (`Otis's tab: $___`). Money never goes negative. Worked example: the Ch3 card (Jan 9) covers the 22 nights since the Ch2 card (Dec 18) minus the 7 Hana prepaid: 15 × $8 = $120, almost all of it on the tab, cleared from Thursday's $60 and Saturday's purses.
- **The rule, stated early and kept:** Dr. Whitlow names the real recovery in Ch1 (Beacon Street Institute, 18 months, est. $84,000); Doc Ferris's price card repeats it in Ch3 (`REAL REHAB: $84,000. NOT HERE.`); the Journal's Money page carries the line `What it would take: $84,000` from Ch1. Ordinary money can never reach it; only the Ch9 offer contains it.

### Difficulty
Story / Normal / Hard scale **only Jin's condition recovery** (regeneration out of combat and between waves: +50% / standard / none between waves). Enemy behaviour, windows and damage are identical; difficulty lives in the player's hands. Checkpoints are frequent on every setting; retries are instant ("*They nearly had me. Again.*").

## World map — Calder, 1994–1997
An industrial river city: the Northside (the dead Calder Foundry stack, `LOCAL 1197`), Eastgate, downtown and the riverfront (Ashgrove Tower, unfinished in 1994, lit from 1996), Southbank across the river. The map shows unlocked places as drawn nodes, pencilled leads as dashed nodes, and closed places with Jin's own reason.

| Node id | Places | Unlocks | Later changes |
|---|---|---|---|
| `map_eastgate` | Kessler Avenue, 412 (3A, 3B), Sunny's Diner, Han's Market, Marsh B.C. → Iron Pulse, Pratt Alley and the 412 roof | Ch0 (1994), Ch2 (1996) | Ch2 winter (poster wall buried, 3B NOVAK, the gym renamed); Ch6 Sunny's booth; Ch9 Rosie's mark; Ending One the champion poster; Ending Two June's flyer on the wall |
| `map_civic` | Calder Civic Arena (Dock B, corridor, Locker Rooms A/B, the bowl) | Ch0 | Ch8 Farewell night; afterwards fenced, `RIVERSIDE LOFTS — 1998`; Ending One the lofts built |
| `map_hillcrest` | St. Agnes Long-Term Care (Room 214, 2 West, gym, courtyard, records, lobby) | Ch1 | Ch9 night corridor; Ending One `ODELL, HENRY` in 214 |
| `map_front_street` | Calder YMCA (Room 312) | Ch2 | Base Ch2–4 |
| `map_route9` | Starlite Lanes, the Cellar, the Pit, the pinsetter loft | Ch3 | Ch6 corner night; Ch9 the dark lot |
| `map_harlan` | Harlan Street, the Grill, Harlan Freight Depot | Ch4 | Gate chained `CLOSED FOR INVENTORY` (Ch5–8); Ch9 floodlights and trucks |
| `map_northside` | Foundry Street, Foundry Courts (yard, workshop/loft, community room, gym, boiler, roof), Council HQ (Local 1197 hall) | Ch5 (HQ opens Ch7) | Changes every chapter: Ch6 thaw; Ch7 ledgers on the tables, three porches; Ch9 vigil or laundry; Ending Two cold year, buildings standing |
| `map_downtown` | City Hall Annex, Market Street (Kwik Copy, 88 Market), Castell Champions Gym | Ch6 (gym Ch8) | Fund office `FOR LEASE` from Ch7 |
| `map_garrison` | Garrison Street, Garrison Suds, Lindell House ruin | Ch6 | `SOLD — RIVERSIDE HOLDINGS` on the fence by Ch9 |
| `map_cemetery` | Calder Municipal Cemetery, Section 14 | Ch6 | Flowers stay; Ch9 locked after dusk |
| `map_riverfront` | Ashgrove Plaza and Tower | Ch9 | Ending One press lobby; the Ashgrove Center |
| `map_southbank` | Alder Row | Ch10 only (no fast travel; "*Southbank. I've never been. I don't know anyone there.*") | Ending Two autumn walk |
- The Calder Arms Hotel (downtown, $45/week) appears on the map only when used as a base.

### Shared locations (used across chapters or outside any one chapter's location list)
| id | Place | Size | Used in |
|---|---|---|---|
| `calder_arms` | Calder Arms Hotel, Room 6, downtown (on Front Street): a real bed, a radiator that works, a window on Front Street | 640 × 360 | Ch4 rest card (`ch4_envelope = taken`); base in Ch8–9 if `ch7_stayed_at_courts = false` |
| `iron_pulse_backroom` | Teddy's back room behind `iron_pulse`: the cot, the hot plate, the box `SEO — DON'T TOSS`, the bag on the pipe | 480 × 360 (reached through the `iron_pulse` side door) | Ch2 Teddy; Ch3–4 mitts; Ch7–9 fallback base; Ch9 visit; Ending Two |
| `route9_walk` | Route 9 under the overpass, walking left toward Calder, the star sign shrinking behind | 1600 × 360 | Ch3 (`pressed` path only) |
| `river_path` | The river rail below Ashgrove Plaza; Alder Row's windows across the water downstream | 1400 × 420 | Ch9 consideration (free, never advances the clock); Ending Two (Saturday shadowboxing; the optional `[Drop them.]` for the wraps path) |
| `courthouse_steps` | Calder County Courthouse steps: granite, brass doors, a news van | 1200 × 360 | Ending Two, June 1997 |
| `room_above_hans` | The room above Han's Market, Kessler Avenue: a sloping ceiling, one window on Kessler, a knocking radiator | 640 × 360 | Ending Two's rented room when `mara < 2` |
- Locked nodes always say why in Jin's words (Ch2: Garrison Street "*Not yet.*"; the Annex "*Closed. And I'm not ready.*").

<!-- end global -->
