# Inside the Impact — Story Mode Bible

The single authoritative content bible for Story Mode, merged from the three design drafts (`design/draft-cinematic.md`, `design/draft-world.md`, `design/draft-systems.md`) and checked against `design/ref-story.pdf` (canon), `design/ref-movement-art.pdf` and `design/BRIEF.md`. Chapter authors implement from this file. Where this file and a draft disagree, this file wins; where this file and the story PDF disagree, the PDF wins and this file is wrong.

**How to read it.** `Global` holds the cast, every flag, meter, evidence item and memory, progression and the map. Each chapter then gives date and mood, gameplay identity, locations (ids, sizes, left-to-right layouts), NPCs, interactables (with the text the examine shows), quests (with HUD text), scripted scenes beat by beat (camera in zoom values: 1.0 is gameplay, higher is closer; `[beat]` is 0.8 s), encounters, choices and the state handed on. Thoughts in *italics* are Jin's inner voice. Every id is snake_case and appears once in the registries.

## Decisions (conflicts resolved, and why)
Rule order used: the story PDF first; then coherence across chapters; then the user's brief; then the strongest draft idea.

1. **Backbone.** The systems draft supplies the registry structure and most shared facts; the cinematic draft supplies the direction grammar (the bell motif, the `Hold still` framing, match cuts, the Row K view, the corner framing inverted in Ch8); the world draft supplies the lived-in places and routines (Foundry Courts by the hour, the union hall, the Grill booth, Bernice Hale's windows, Mrs. Okafor's family's-family role). Each chapter takes the strongest idea for each beat and grafts the rest.
2. **Timeline.** One calendar for the whole game: Ch0 Sat Aug 20, 1994 · Ch1 Mon Oct 7 – Wed Dec 18, 1996 · Ch2 Wed Dec 18, 1996 · Ch3 Thu Jan 9 – Sun Jan 12, 1997 · Ch4 Fri Jan 17 and Sun Jan 19 · Ch5 Mon Jan 27 – Fri Jan 31 · Ch6 Mon Feb 3 – Tue Feb 11 (the fire's first anniversary) · Ch7 Thu Feb 27 · Ch8 Sat Mar 8 ("Farewell to the Civic") · Ch9 Wed Apr 16 – Thu Apr 17 · Ch10 Fri Apr 18, 1997 (closing 10:00). The drafts' dates (December 1996 to May 1997) conflicted; this one keeps Ch1's "two years later", puts the Ch6 cemetery visit on the anniversary, and gives Ch8 a reason to exist that night (the arena's closing).
3. **The sabotage object** is a **white plastic squeeze bottle with a red tape band on the neck**, handed over by Lenny in Locker Room B right after the bribe refusal ("You're dry, kid. Drink."), hidden by a four-second jump cut in Ch0, glimpsed in round 2, completed in Ch3. The drafts' paper cup / orange cup versions were dropped; paper cups stay only as an echo (Ch3 the tap cup, Ch10 Mr. Phan's coffee). The PDF: make the sabotage clear without revealing who ordered it.
4. **The bribe** is $50,000 to go down in the fourth, offered as "arithmetic" by the man in the camel coat. All three dialogue options refuse (the PDF says he refuses). The coat is never named; he is Lyle Penner's man (his coat hangs outside Penner's office in Ch9).
5. **The two fighters the PDF describes** are Deshawn Tillery (fights because refusing a booking costs him the key to the only ring on the Northside) and Cyrus "Slim" Whitlock (an ex-pro skilled enough to win, booked to lose in round two: the mirror of Ch0). Stan "Wojo" Wojcik fights for pleasure. The drafts' other fighters (Lolo, Mari, Big Ike, Tommy, Luis, Lucho, Kenny) are cut to keep the cast small. **Deshawn is also the Courts' "local boxer"** (PDF Ch5), which links the Cellar to Foundry Courts and to the payroll envelope.
6. **Skills arrive where the PDF puts them:** dashes and jab–cross in Ch2, hook and the first reliable slip-counter in Ch3 "through practice and encounters", group tools in Ch4, the full toolkit by Ch6. Every practice unlock has an in-play fallback so a skipped side scene never withholds a core move (the hook from Slim's own hook, the dash straight from the corridor guard).
7. **No stamina meter.** The movement spec keeps basic movement and ordinary punches free of stamina; the PDF says extended exchanges exhaust him. Resolution: a **winded** body state (posture, breath puffs, −25% damage, slower dash recharge until he backs off), never a bar that blocks inputs. Ch1 and Ch2 were patched to match.
8. **Ch4 order.** The fights come before the reading (yard and boss, then the quiet records room), so no combat follows the discoveries. Dutch's statement never names Rook and the depot ledger never shows the Council's share: in Ch5 Jin must only suspect (PDF).
9. **Ch5 keeps the connection a suspicion.** The plaque gives the date (41 days after the fight) and Odette's minutes give the $640,000 from "private partners"; the proof (the escrow wire, the executive minutes) waits for Ch7. Ada and Odette were merged into one resident, Odette Baptiste (Deshawn's grandmother, the tenants' secretary who typed the minutes).
10. **The critical discovery (Ch6) happens at 88 Market Street**, Pike's Fund office and P.O. Box 1180 (the address on his card since Ch1 and in Min's notebook): nine held letters, Pike's memo, and Rook's handwritten reply, "Maintain." The world draft's Courts archive was moved to Ch7 (the residents open the books). The board's centre question "What killed them?" can't be answered with one card, which builds in the PDF's caution that one answered letter would not certainly have prevented everything.
11. **The four PDF questions recur at different scales**, each tracked by a tally that only shapes Jin's own voice: take (bingo jar, payroll, 4D), threaten (Lenny, Roz, Asher, Owen), abandon (the boiler, Deshawn's corner), keep hurting (Benny, Dutch, Rook, Ray). None of them is read by the ending.
12. **Ch7: the union hall, no boss, no Penner.** Council HQ is the old Local 1197 hall on Foundry Street (not a bank). The confrontation is a presentation duel with no fail state. Rook's admission includes Row K and "Sit down, Walter. It's almost over." (Dutch beside him). The name of the financier is left for the champion (PDF: "The next lead is the champion, who knows which financial figure gave the final instructions"); Carrow says only "the people upstairs".
13. **Ch8: stopping is ringing the bell.** When Ray is no longer a threat the player can walk to the timekeeper's table and ring the 1961 bell once into silence, or keep hitting him while Morty hammers the bell and the camera watches from Row K. `bell_state` then colours the last two chapters. Ray names Penner only if Jin stops; the note and the Alder Row agreement are in his bag either way, so the main path never breaks.
14. **Ch9: no answer in the boardroom.** The offer is laid out item by item (the real Beacon Street program at Dr. Whitlow's $84,000, a home over the old ring, income, his name restored by court petition, a managed title route, the `JIN SEO` brass plate), every question is answered honestly, people outside hold copies, and the decision waits for the gate. A full consideration day follows with no timer. Alder Row can't be visited before Ch10, so the residents stay strangers.
15. **Ch10's residents** are Mr. Phan (closing his shoe-repair shop), Rosa Medina (moving a crib mattress), Gloria and Terrence Hale (arguing whether resistance makes it worse), Henry Odell (84, "Fifty-one years") and June (10, flyers): the PDF's three actions, nobody with a backstory, nobody connected to Jin. The choice is the chain on the cooperative's gate ("Lindell's chain kept them in. This one keeps them out."), with both consequences printed under each option and a dedicated save before it.
16. **Endings.** Ending One makes Jin participate (cut, restrain, hold the door) with every reward withheld from the screen until the years, then shows the rewards honestly, the manipulated title, the administrative report, and the poster with his scar airbrushed away. Ending Two makes the fight an opening for a process carried by other people (copy holders, residents, Channel 6's own camera, Rook's testimony), leaves Jin poor and partly recovered with work, a rented room, Saturdays teaching, and keeps his disappointment on screen.
17. **Bases:** St. Agnes (Ch1) → Calder YMCA Room 312, $8/night (Ch2–4) → the workshop loft at Foundry Courts, or 4D if taken (Ch5–7) → the loft or the Calder Arms, $45/week (Ch8–9).
18. **Critic fixes applied to the first three chapters:** Hana's card names Otis (the YMCA desk), not Gus (a Courts resident); Ch2's alley moved after the 9 PM Teddy scene; Ch1's night stealth reduced to a scripted path and a light cone; the Ch9 visit to 3B pays off Ch2's height marks.
19. **Engine fit.** Everything is built from the engine's stated parts: discrete maps with doors and vertical layers, NPC paths and barks, examine/sit/use/carry/repair, the document and photo viewers, the timeline board, the evidence-presenting activity, `A.fight` and `A.bout`, and the listed archetypes (collector, thug, trained boxer, guard, director, boss collector, champion). AI allies exist only in Ending Two (Deshawn) and draw one attacker.
20. **Hard "do nots" kept:** the Ch0 injury is unavoidable but good play shows resistance; no combat right after emotional discoveries; Rook is never a boss fight; the Courts' benefits are never revealed as fraudulent and the residents are never all ungrateful; Alder Row is not Foundry Courts and nobody Jin loves lives there; the offer is never revealed as a scam; no misleading options and no timers at the decision; both endings always available; the residents don't have to learn his history; Jin's disappointment is not erased; money never buys the recovery package.


## Contents
- Global: direction grammar · cast bible · flags & relationships registry · evidence and memory registry · progression · world map
- Chapter 0 — One More Round
- Chapter 1 — The Name Above the Bed
- Chapter 2 — No One Waiting
- Chapter 3 — The Price of Admission
- Chapter 4 — Collections
- Chapter 5 — The Houses Still Standing
- Chapter 6 — Undelivered
- Chapter 7 — What Your Life Bought
- Chapter 8 — The Man in the Other Corner
- Chapter 9 — The Offer
- Chapter 10 — Somebody Else's Home

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
- **Change.** From beloved benefactor to a man reading his own handwriting. Never a boss fight. He refuses to sign the Alder Row letter, testifies in every version of Ending Two, and is neither forgiven nor destroyed on screen.

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
- **Stan "Wojo" Wojcik, 46.** 48 px, heavy, forklift-driver's jacket, a laugh that slaps his own chest. "Oh-and-nineteen! Undefeated in spirit!" / "Down here for six minutes I'm a lion." Fights for the pleasure of it. His mother Bernice volunteers at the Council's pantry.
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
- **Change.** None on screen; in Ending Two she remains chair after a fine.

### Lyle Penner, managing director, Ashgrove Capital, 40s
- **Look.** 47 px, slim, navy suit, horn-rimmed glasses, sleeves rolled, a black fountain pen he uncaps and recaps.
- **Body language.** Sits on the edge of tables; reads lines off a typed page; smiles while saying numbers.
- **Voice.** Cheerful, exact, quoting the player's own choices back. "We have very good notes." / "I gave the last instruction because somebody has to." / "A man who can't be bought at twenty-six is worth a great deal at twenty-nine."
- **Wants.** The closing at 10:00.
- **Perspective.** Gave the final instructions in 1994 (the note to Ray on his notepaper; "now"); doesn't remember it as a moral event.
- **Change.** None; in Ending Two he resigns and waits for a trial.

### The Alder Row residents (Ch10 only; strangers)
No backstories, each one human thing (PDF). **Mr. Phan** (`PHAN SHOE REPAIR · KEYS CUT`; gray apron; pulls his grate down and pours free coffee for everyone, the crew included). **Rosa Medina** (house 7; drags a crib mattress to safety; "I've got a baby. I'm not standing in front of anything."). **Gloria Hale** (co-op president, 70s; reading glasses on her head; clipboard; "Somebody tell me the third thing.") and her grandson **Terrence Hale**, 19 (a broom handle held like a bat). **Henry Odell**, 84 (a webbed folding chair on his stoop, a radio on his knee; "Fifty-one years."). **June**, 10 (a bike, a stack of flyers: `DO NOT SIGN ANYTHING`). Jin has no friend, relative or secret connection among them, and none is ever revealed.

### Supporting cast (each carries a fact, a choice or a perspective)
Mrs. Grace Okafor (3A; Umma's friend; "Knock him down, then come home safe. In that order.") · Rita Mancuso (Sunny's waitress since 1981; free refills, says little) · Augie (Sunny's cook) · Earl Dunning (Room 214's roommate; the crossword; the radio Jin keeps) · Nurse Dolores Reyes · Dr. Anita Whitlow ($84,000; the affidavit) · Sister Margaret Doyle (twelve beds) · Petra Novak and Rosie (the new 3B) · Benny Szabo, Carl Dunphy, Vic (Pike's collectors) · Otis (YMCA desk) · Peg Halloran, Tiny Russo, Doc Ferris (Starlite) · Fran DeLuca (Harlan Grill), Pat Gorman (old gate man; never hit), Carmine "Whistle" Dalto (yard foreman, director), Roz Kaminski (night dispatcher) · Leon Dukes (Annex property cage), Bernice Hale (Window 5), Wendell Asher (former Lindell night man), Dot Pham (Kwik Copy, Min's coworker), Dr. Saul Brandt (the dentist at 88 Market) · Bernice Wojcik (Council volunteer) · Vince Carrow (Harlan Street crew boss) · Morty Fine (Civic timekeeper since 1961) · Joan Albright (Calder Ledger; Hana's college roommate) · Owen Tully (analyst, floor 22), Mr. Garvey (tower security) · Brenda and Ed (Channel 6).

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
| `ch3_covered_slim` | bool | Ch3 after the card (straight only) | `slim` +2; Ch10 |
| `ch3_teddy_mitts` | bool | Ch3 Friday | `teddy` +1; the loft "why" line |
| `ch3_lenny_method` | `patient` / `pressed` | Ch3 loft | Tape clean/stretched; `lenny` +2/−3; Ch6 Lenny at the corner; Ch8 copy holder; Ch9 visit; Ending Two; `threat_count` |
| `ch4_scouted` | bool | Ch4 booth | Siding route; Ch9 Penner |
| `ch4_called_hana` | bool | Ch4 Grill | `hana` +1 (+1 "after"); Ch6 Sunny's |
| `ch4_roz` | `let_go` / `threatened` | Ch4 dispatch | Safe combination; `ev_roz_account`; Ch8 copy holder; Ch9 Penner list; Ch10 Joan; `threat_count` |
| `ch4_took_profit` | bool | Ch4 counting room | +$600; Ch9 Celeste |
| `ch4_envelope` | `taken` / `left` | Ch4 counting room | Ch5 whole texture; Ch7 Darnell/Rook; Ch9 Penner; Ch10 thought; `take_count` |
| `ch4_dutch_after` | `walked_away` / `kept_going` | Ch4 river | Ch7 branch; Ch9 van; Ch10 both endings; `harm_count` |
| `ch5_held_mitts` | bool | Ch5 gym | Ending Two teaching vignette |
| `ch5_promised_corner` | bool | Ch5 gym | Ch6 Saturday choice exists |
| `ch5_left_repair` | bool | Ch5 boiler night | `ev_pike_call`; `mara` ±2; Ch7 Mara; Ch9 Mara; `abandon_count` |
| `ch5_took_4d` | bool | Ch5 Rook's visit | Base; Ch6 Elena; Ch7 Rook; Ch9 Penner; Ch10 thought; `take_count` |
| `ch5_meeting_stance` | `boiler` / `payroll` / `kitchen` / `independence` / `silent` | Ch5 meeting | Ch6–7 prop; Ch7 Gus; Ending Two Courts card |
| `ch5_donation` | amount | Ch5 meeting | `courts` +1 if ≥ $20; Ch7 Odette |
| `ch5_returned_envelope` | `confessed` / `anonymous` / `kept` / `confessed_late` (unset if `left`) | Ch5 night / Ch7 meeting | Ch7 Mara/Darnell; Ch9 Penner; `take_count` stays |
| `ch6_asher_method` | `patient` / `threatened` | Ch6 Suds | Full/partial testimony; Ch8 copy holder; Ch9 Penner; Ending Two; `threat_count` |
| `ch6_strippers` | `talked_down` / `fought` | Ch6 Lindell | Flavour |
| `ch6_saturday` | `corner` / `pike` | Ch6 Saturday | `deshawn` +3/−3; Pike in person; Ch7 Deshawn; Ch10 thought; `abandon_count` |
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
| `ch9_visits` | set of ids | Ch9 Thursday | Completion screen; ending props |
| `ch9_mara_will_come` | bool | Ch9 Mara (if `mara ≥ 3`) | Ending One (truck turns round); Ending Two (truck blocks) |
| `ch9_knuckles` | `took` / `left` | Ch9 door | Ending Two tuning; Teddy's line |
| `ch10_names_learned` | list of resident ids | Ch10 street | Ending One report; Ending Two walk |
| `ch10_choice` | `accept` / `refuse` | Ch10 gate | **The ending.** The only flag that decides which ending plays. |

### State flags (not choices)
`bell_state` (`rung` / `ringing`, from `ch8_ray_after`) · `base` (`stagnes_room214` → `ymca_312` → `courts_workshop` (the loft) / `courts_4d` → `calder_arms`) · `ending_seen_one`, `ending_seen_two` · per-chapter `chN_complete`.

### Relationship meters (integers; shown in the People tab only as a short sentence, never as a number)
| Meter | Moves up | Moves down | Read at |
|---|---|---|---|
| `hana` | told her about the fight (+1), records together (+2), first drill (+1), calls (Ch2 +1, Ch4 +1/+1, Ch8 +1), repaid (+1) | the bingo jar (−1), Ray continued (−1) | ≥ 3: call log (Ch6), Joan's offer (Ch9), she arrives with the Ledger (Ending Two) |
| `teddy` | Ch2 asked (+1) / forgave (+2), Ch3 mitts (+1), Ch4 mitts (+1 if already ≥ 1) | Ch2 blamed (−1), Ray continued (−1) | ≥ 0 robe; ≥ 1 copy holder; ≥ 2 Ch8 corner, Ending Two corner and Saturdays |
| `lenny` | patient (+2) | pressed (−3) | copy holder and witness via `ch3_lenny_method` |
| `deshawn` | touched gloves (+1), asked why (+1), Ch5 gym (+1), Ch6 corner (+3), towel thrown (+1) | Ch6 pike (−3) | ≥ 1 Ch8 scouting, copy holder; ≥ 2 Ending Two gym; ≥ 3 Ch9 line, Ending Two ally; ≥ 5 Ch7 softening |
| `slim` | fought straight (+2), covered his pay (+2) | — | ≥ 2: Ch10 refuses to work / guards Odell |
| `mara` | shifts (+1 each, max +3), stayed with the boiler (+2), roof line (+1), confessed (+1) | left the boiler (−2), late confession (−1), kept the envelope (−1), Ray continued (−1) | ≥ 1 copy holder, Ending Two work; ≥ 2 Ch7 roof, Ending Two room; ≥ 3 Ch9 "I'd come" |
| `courts` (the residents as a whole) | shifts (+1, max +2), boiler (+1), donation ≥ $20 (+1), gave back 4D (+1), Rook told it (+1) | left the boiler (−1), took 4D (−1), silent at the late envelope (−1), kept envelope (−2) | Ch7 meeting (≤ 0 more people turn on Jin; ≥ 2 only Gus leaves) |

### The four tallies (the PDF's four questions; read only for Jin's own voice and a few lines; **never for the ending**)
| Tally | PDF question | Incremented by |
|---|---|---|
| `take_count` | Does Jin take money or things already allocated to someone else? | the bingo jar (Ch1), the payroll envelope (Ch4), 4D (Ch5; −1 if given back in Ch6) |
| `threat_count` | Does he threaten a frightened witness to save time? | Lenny pressed (Ch3), Roz threatened (Ch4), Asher threatened (Ch6), Owen threatened (Ch9) |
| `abandon_count` | Does he abandon a commitment for an investigative opportunity? | left the boiler for Pike (Ch5), left Deshawn's corner for Pike (Ch6) |
| `harm_count` | Does he keep hurting someone after getting what he needs? | Benny hit again (Ch2), Dutch kept going (Ch4), Rook hit (Ch7), Ray continued (Ch8) |
- `jin_voice` = `restrained` if `harm_count + threat_count = 0`; `mixed` if 1–2; `hard` if ≥ 3. It changes Jin's phrasing in Ch7, Ch9 and the Ch10 gate thoughts. If the player has shown restraint, Jin never speaks as if he brutalised anyone.
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
| `ev_whitlow_note` | Dr. Whitlow's sheet | Ch1 Dec 16 | Beacon Street Institute, 18 months, est. $84,000 | What real recovery costs; money can't buy it |
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
| `ev_civic_ledger` ★ | Folder "CIVIC" | Ch4 Dutch's safe | L.V. $5,000; Dock B gate P.G. $200; unit 7 ER run $400; private transfer $1,800; G.P. paperwork $2,500; `POSITION: CASTELL KO RDS 3–5 · gross $4.1M · per A.C.` | The fix produced a payout; the gang paid for his concealment |
| `ev_ncc_ledger` ★ | Ledger "N.C.C." | Ch4 records cage | Roofing B–C Foundry Courts $31,200; boiler $22,400; community room; playground; maintenance payroll; St. Agnes rm 214 $3,100/mo; Pike $1,500/mo; 1994 balance under a coffee ring | Criminal money has legitimate destinations (tagged *front?* until Ch5) |
| `ev_payroll_note` | The envelope's label | Ch4 counting room | `FOUNDRY CTS MAINT. PAYROLL · 2 WKS ENDING 1/17/97 · $1,840 · Kowalski 640 · Greer 480 · Tillery 320 · Lindqvist 240 · Baptiste 160 · deliver Mon. w/ N. Faraday` | Whose money it was |
| `ev_dutch_statement` | Dutch at the bollard | Ch4 | "Your fight paid for things"; "the money lives across the river" | The depot is the truck, not the driver |
| `ev_roz_account` | Roz's account (let go only) | Ch4 | Tuesday envelopes to Nell; Dutch drove the ambulance money | The Council's side of the window |
| `ev_courts_plaque` ★ | Bronze plaque | Ch5 gate | Deed recorded September 30, 1994; 212 households | Bought 41 days after the fight |
| `ev_courts_minutes` ★ | Tenants' minutes | Ch5 Odette | June 1994 $3,000; September $640,000 from "private partners"; source deferred | Suspicion without proof |
| `ev_pike_call` | Overheard call | Ch5 (left the boiler) | "He's at the Courts, Walter... You tell me what to do with him." | Rook is managing Jin's concealment |
| `ev_shopping_list` | Shopping list | Ch6 box | rice, scallions, navy thread, BATTERIES (hall detector!!), lottery YES for science | Their lives weren't only the search |
| `ev_fridge_note` | The fridge note | Ch6 box | "AFTER: Sunny's, window booth... WIN FAST. — M" | The message about meeting after the fight |
| `ev_umma_paystubs` | Royal Linen paystubs | Ch6 box | 60-hour weeks; "Sat. extra 4 hrs. For Min's books." | She kept working while they searched |
| `ev_min_notebook` ★ | Min's notebook | Ch6 box | Calder General "sponsor confidential"; Box 1180 letters #1–9, no answer; calls; fares | The search and where it was sent |
| `ev_detective_invoice` | Calloway Investigations | Ch6 box | $350; "not located under given name" | The search cost money |
| `ev_council_referral` | Council letter | Ch6 box | Jan 1995: Eastgate outside service area, referred out, G. Pike for the Council | Assistance redirected |
| `ev_judgment` | Housing Court judgment | Ch6 box | Kessler Realty v. Seo, Apr 11, 1995; Umma's note: purse held until the fighter signs | The eviction; the purse they couldn't reach |
| `ev_ha_application` | Housing Authority file | Ch6 Window 3 | Pending, incomplete: "whereabouts of household member SEO, JIN" | His concealment blocked their help |
| `ev_building_complaints` ★ | Building Dept file | Ch6 Window 5 | Three complaints; petition signed first by Min; inspections postponed; next 2/22/96 | The building's danger was known |
| `ev_fire_report` | Fire Marshal report | Ch6 Window 5 | Feb 11, 1996, 02:40; Room 7 heater; rear exit chained; 3F detector sounded (resident's battery); two deaths | How it happened |
| `ev_asher_testimony` | Wendell Asher | Ch6 Suds | Lazarou's chain order (note in full version); Min went back up for Umma | Who chained the door; what Min did |
| `ev_film_roll` ★ | Min's eight frames | Ch6 Kwik Copy | Umma on the bus; the cake; the chained door 01/28/96; Umma laughing; Min with flyers; snow ×3 | Their lives, and Min documenting the door |
| `ev_min_letters` ★ | Nine letters to Box 1180 | Ch6 Fund storage | Sept 1994 – Jan 1996, stamped received, held | The family wrote; the box held them |
| `ev_pike_memo` ★ | Pike to Rook, June 12, 1995 | Ch6 Pike's drawer | "The Seo girl has written six times... How do you want this handled?" | Rook was informed the family was searching |
| `ev_rook_reply` ★ | Rook to Pike, 6/14/95 | Ch6 Pike's drawer | "Maintain. No contact, no confirmation. Nothing from our fund under that name. It holds, or everything goes. — W.R." | **The critical discovery:** he chose to preserve the concealment |
| `ev_pike_statement` | Pike's two pages | Ch6 (pike path) | The name change via Harlan Freight; letters held; $1,500 a month | A participant's sworn account |
| `ev_whitlow_affidavit` ★ | Dr. Whitlow's affidavit | Ch6 Sunny's | Daniel Ahn and Jin Seo are the same man | His identity, in a form a judge must read |
| `ev_stagnes_calllog` | Switchboard log (hana ≥ 3) | Ch6 Sunny's | 11/02/95 Seo, Min-ji, "no such patient" | She called the building he was in |
| `ev_stone_ledger` | Cemetery ledger | Ch6 | Stone paid cash, T. Marsh, 4/96 | Teddy paid |
| `ev_exec_minutes` ★ | Executive minutes 8/15/94 | Ch7 archive | "One-time arrangement with outside partners"; Lindqvist opposed; no further minutes | The Council agreed to it |
| `ev_council_ledger` ★ | NCC capital account 1994 | Ch7 archive | 9/27/94 $640,000 from Harlan Freight Co. escrow ref ASH-0894; 9/28 paid to the pension trustee | The negotiated share financed Foundry Courts |
| `ev_rook_notebook` | Rook's 1994 notebook | Ch7 office | July: "a share — ONE TIME"; 8/21 "no name"; 6/14/95 "Told him maintain." | His reasoning, in his hand |
| `ev_rook_testimony` ★ | Rook's admission | Ch7 office | July at Starlite; Row K; "Then nothing changes." | The full chain, admitted |
| `ev_alder_letter` | Statement of Support (unsigned) | Ch7 | Council endorsement of Alder Row's "voluntary relocation"; due 4/1 | The outfit has outgrown the deal |
| `ev_penner_note` ★ | Note to Ray, Aug 19, 1994 | Ch8 Ray's bag | Ashgrove notepaper: "The referee has been spoken to. Don't stop till it's done. Everything after is arranged. — L.P." | Identifies the financial leadership |
| `ev_alder_agreement` ★ | Ambassador agreement | Ch8 Ray's bag | Alder Row closing Fri Apr 18, 1997, 10:00, Ashgrove Tower 30F; "R. Castell, or an alternative" | The upcoming property transaction |
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
| `mem_row` | The half-second | Ch0 R3 · Ch8 Ray (complete if stopped) | Ray looks to the press row; the coat nods |
| `mem_bell` | The bell | Ch0 | The bell ringing after he can't defend himself |
| `mem_waistband` | Hold still | Ch1 | Umma's needle and the bitten thread |
| `mem_roof` | Everything leaks | Ch2 412 roof | Fourth of July 1993 with Min |
| `mem_umbrella` | Umbrella | Ch2 bus bench | After his first amateur loss |
| `mem_first_wraps` | First wraps | Ch2 Iron Pulse bench | Teddy wrapping a fourteen-year-old's hands |
| `mem_backdoor` | Not tonight it isn't | Ch4 ambulance | Stretcher-level, ceiling lights passing |
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
| Ch2 | jab–cross, guard, slip (vs slow committed attacks), forward dash and backdash (1 charge), knuckles gear | instinct in the first exchange: speed and timing are still exceptional; stopping power isn't (power 0.55 bare / 0.80 knuckles) |
| Ch3 | second dash charge; reliable slip → counter-cross; hook | Deshawn's footwork ladder and tip; Slim at the bag (fallback: answering Slim's own hook) |
| Ch4 | air dash; dash straight; backdash → returning cross | the container gap; Teddy's mitts (fallback: the corridor guard); Dutch's charge |
| Ch5 | uppercut | Deshawn, the Courts gym ("Hips first. The hand's the last thing to know.") |
| Ch6 | flurry | the Courts speed bag. **The core toolkit is complete.** |
| Ch7–Ch10 | nothing new | mastery tests only (PDF) |

### Training (Journal → Training; optional; never required between scenes)
- Drills: **balance** (bars, beam), **footwork** (tape marks, ladder), **reaction** (Hana's bulb board, pads), **conditioning** (laps), **bag** (combos), **mitts** (Teddy at Iron Pulse; Deshawn at the Courts), **slip-rope** (the Cellar, the Courts).
- Each level is a short drill passed at a target (not repetitions); the next level stays locked until the story raises the cap. **Caps:** Ch1 1 · Ch2 1 · Ch3 2 · Ch4 2 · Ch5 3 · Ch6 3 · Ch7 onward 4 (final).
- Effects per level (small, capped; control of the body he has, never recovery from the injury): balance: stumble recovery 5% faster; footwork: dash recharge −0.03 s (0.60 → 0.48 at L4); reaction: slip window +4 ms (0.060 → 0.076 s); conditioning: winded threshold +0.5 s (6 → 8 s); bag: punch damage +4%; mitts: combo input window +10 ms; slip-rope: slip cooldown −0.02 s. Power never exceeds the chapter's body value.
- **Winded (no stamina meter):** the movement spec keeps basic movement and ordinary punches free of stamina. After ~6 s of continuous close exchange without a break, Jin's shoulders heave and small breath puffs appear; his punch damage drops 25% and dashes recharge 50% slower until he spends 1.5 s out of reach. Shown first in Ch1's laps; explained once in Ch2.

### Money
- Never negative (desks run a tab). The HUD shows money only in the Journal.
- **Sources:** Ch1 fare ($5–$20); Ch3 purses ($60 + $90 + $150/$120); Ch4 the A.C. stacks ($600, optional) and the payroll envelope ($1,840, optional); Ch5 shifts ($20 × up to 5); Ch6 corner money ($20); the Ch7 and Ch8 rest cards (Mara's crew or unloading trucks: +$60 and +$240). Without the depot money a campaign earns about $900; with all of it, about $3,300.
- **Sinks:** YMCA $8/night (charged on chapter cards), the Calder Arms $45/week, Slim's $100, Hana's $20, coffee and pie, flowers ($5), the Courts can, Doc Ferris ($40, optional), returning the envelope.
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
- Locked nodes always say why in Jin's words (Ch2: Garrison Street "*Not yet.*"; the Annex "*Closed. And I'm not ready.*").



# Chapter 0 — One More Round

**Card:** `One More Round` · `Eastgate, Calder · Saturday, August 20, 1994` · bell: one clean strike (the only clean bell on any card until Ch8).

## Date, mood, palette, weather
- Saturday, August 20, 1994. 4:40 PM on Kessler Avenue; 7:30 PM backstage; 9:50 PM main event.
- Mood: warm, crowded, teasing, proud, then wrong in a way the body notices before the mind does. The happiest chapter in the game; the player should want to stay in the kitchen.
- Palette: late-summer gold. Amber sky gradient over the usual blue-gray street, west faces of the brick lit warm, long shadows pointing left (toward home). Min's yellow scrunchie is the brightest small colour in the chapter. The arena is the only saturated place in the whole game: four white-hot ring lamps over a blue (left) and red (right) ring, the crowd in dark plum with cigarette haze and flashbulbs.
- Weather: humid, heat shimmer over the river, cicadas. A thunderstorm arrives during the fight and is heard only once, as rain on the arena roof, at the moment Jin's hearing starts to fail in round 2.
- Skyline (background storytelling): across the river the dead Calder Foundry smokestack (no smoke); downtown, **Ashgrove Tower as a crane-topped steel skeleton** with a blinking red aircraft light. From Ch1 on it is finished and lit.

## Gameplay identity
**Feel what he had, then feel it taken away mid-sentence.** A short free run through a street that knows him, a kitchen scene that sets up every motif, a warm-up that teaches the four core verbs in motion, a private refusal, and a three-round title fight whose controls degrade in a way the game explains as it happens.
- Exploration 20% · dialogue 25% · investigation 0% · combat 40% (warm-up + bout) · cinematic 15%.
- Target length: 15–18 min.
- Verbs available: walk, run, jump, jab, cross, guard, slip, counter-cross. **No dash in Ch0** (the PDF teaches dashes in Ch2; the HUD shows no dash pips). Body: `jin_street` → `jin_ring`, power 1.3, breath off.

## Locations

### `kessler_ave_1994` — Kessler Avenue, Eastgate (2400 × 360, exterior)
Left → right:
- **0–260 Kessler & 5th.** Route 14 bus stop (sign: `14 KESSLER–CIVIC CTR · LAST BUS FROM CIVIC 12:10 AM`), a payphone, an open hydrant with water running across the gutter, the **poster wall**: two fresh championship posters at eye level beside a church bake-sale flyer and a lost-cat notice.
- **260–620 Han's Market** (fruit crates, window sign `GO JIN! EASTGATE'S OWN`), then **Sunny's Diner** (neon `EAT`, a window booth with a red vinyl seat, Rita visible pouring coffee).
- **620–1200 No. 412 Kessler.** Four-storey worn brown brick, swept stoop with a geranium in a coffee can, a side fire escape to the 3rd floor; the 3B window has a box fan and a basil plant. Rooftop water tank, antennas, sagging wires.
- **1200–1260 alley mouth** (Pratt Alley; closed this chapter: "Home by five. Teddy's orders.").
- **1260–1800 Marsh Boxing Club.** Dark brick, hand-painted sign `MARSH BOXING CLUB · EST. 1971` with a red glove; a bedsheet banner from the upstairs window, kids' paint: `GOOD LUCK JIN!!`. The door sign: `CLOSED TONIGHT — WE'RE AT THE CIVIC! — T.M.`
- **1800–2400 toward the river.** Low concrete wall, Teddy's maroon '84 Buick station wagon at the curb, the 9th Street bridge in the far layer.
- Sidewalk chalk at 700: a boxing ring with `JIN` written in the blue corner.
- Light: low sun from the right, shop windows already lit. Sound: a radio from Han's calling tonight's card, the hydrant, kids, a distant ice-cream truck tune that cuts off mid-phrase.
- Exits: 412 stoop door → `kessler_412_stairs_1994`; Teddy's wagon (after dinner) → drive vignette → `civic_backstage_1994`. Left edge: "Home by five. Teddy's orders."

### `kessler_412_stairs_1994` — 412 Kessler stairwell (320 × 720, vertical, three landings)
Lobby: brass mailboxes; the 3B label in Min's hand `SEO — MI-OK / JIN / MIN-JI — NO MENUS PLEASE`; checkerboard tile. 2nd landing: a flickering bulb. 3rd landing: **3A** (Mrs. Okafor: a straw wreath, a mat `BLESS THIS HOME`) opposite **3B** (brass numbers, a `WELCOME` mat with the W worn off). The first vertical traversal in the game. Exits: lobby ↔ street; 3B door ↔ `apt_3b_1994`.

### `apt_3b_1994` — Apartment 3B (1120 × 360, interior; faded green vine wallpaper, wood floor)
Left → right: **Jin's room** (mattress on the floor, jump rope on a nail, box fan, a framed `CALDER GOLDEN GLOVES 1986 · J. SEO` certificate, the gym bag packed by the door, the navy robe on a hanger with `EASTGATE` across the back in off-white) → **hallway** (photo frames: Jin's first amateur trophy; Min's graduation; a black-framed photo of Appa, 1979) → **bathroom door** with a sock tied on the knob (the lock is broken; the sock means "occupied") → **kitchen** (stove, rice cooker steaming, three-chair table, fridge with a notepad, a red plastic strawberry magnet and the Route 14 schedule; the doorframe beside the fridge carries pencil height marks, top two visible: `JIN 17`, `MIN 13`; a sugar jar with a pink envelope corner under it; a calendar with `AUG 20 — JIN!!` circled three times in red) → **living room** (Umma's black Singer sewing machine at the window, a TV on a cart showing the Channel 6 fight promo, a couch with a crocheted blanket, Min's accounting textbook open on the cushion) → front door.
Light: low gold sun through the right-hand windows, long shadows left, one ceiling bulb out. Sound: box fan, TV, rice cooker, Kessler Avenue below. Exit: front door → stairwell.

### `civic_backstage_1994` — Calder Civic Arena, service corridor (1600 × 360, interior concrete)
Left → right: **Loading Dock B** (roll-up door, sign `DOCK B — NO PUBLIC ACCESS`; a gray van's nose visible through the wired window: remembered in Ch4) → long painted corridor with a yellow floor stripe and old fight posters (one is a 1971 card with a young Teddy as a fighter) → the **commission table** (inspector stamps wraps and gloves) → **Locker Room A** (gold star tape, `CASTELL`, laughter and music inside) → **Locker Room B** (masking tape with `SEO / MARSH — NO PRESS` in marker) → the tunnel mouth (locked until the walk-out: "Not yet. Teddy says walk out when they call you.").
Light: cool fluorescent, one flickering tube. Sound: the crowd as a sea-roar through concrete, an undercard bell, footsteps. Exits: Locker Room B door ↔ `civic_locker_b`; tunnel → `civic_ring_1994` (scripted).

### `civic_locker_b` — Locker Room B (720 × 360)
Bench and six lockers → taping table (white tape, scissors, a Vaseline jar, an ice bucket) → open floor with **zigzag footwork tape marks** → a heavy bag on a pipe → a mirror ringed with bulbs (two dead) → sink. One fluorescent tube flickers every 7 s: the only rhythm in the room. Wall clock reads 9:20.

### `civic_ring_1994` — Calder Civic Arena, the bowl (1280 × 540, interior with stands)
Tunnel at the far left (a white rectangle that grows as Jin walks; crowd volume ramps with x) → aisle → the ring (520 px, centred). **Blue corner (Jin's) left, red corner (Ray's) right.** At ringside below the blue corner: the **timekeeper's table with the brass bell** (chipped lip, engraved `CALDER CIVIC ARENA 1961`); press row on the right with phones; a Channel 6 camera on a riser. Stands rise in three parallax tiers. **Section 14, Row F**, behind the blue corner: Umma and Min (Min's cardboard sign `KESSLER KID`). **Section 11, Row K**, high on the left: a man in a flat cap who stays seated while everyone stands (Rook; never pointed out). **End of the press row**, by the aisle: a camel coat.
Light: four ring lamps in cones, everything else dark plum. Sound: crowd (idle / cheer / tense), announcer, the bell.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `min` | Comes out of Kwik Copy's bus stop as Jin jogs past; then the kitchen counter; Section 14 | sits on counters, heels knocking the cabinet; points with the newspaper | "They airbrushed you into a different man. This guy has a jaw." / "Window booth after. I'll save it." | (if Jin dawdles) "Umma said five. It's four fifty-two." | every purse option has her comeback |
| `umma` | Kitchen stove, back half-turned; then the Singer | `cook/work at counter` | "Jin-ah. Sit. Eat first. Then be famous." / "How will you get home?" | "Your collar. Come here." | `ch0_purse_dream` |
| `okafor` | 3A doorway as they pass | hand on the door frame | "Knock him down, then come home safe. In that order." | — | — |
| `teddy` | Marsh BC door (taps his watch); the wagon; Locker B with mitts; the corner | `armsCrossed`, `handsHips`, whistle on a shoelace | "Hands up, chin down, feet under you. That's the whole religion." | "Feet! Where are your feet?" | `ch0_told_teddy` |
| `lenny` | Wagon back seat (tackle box on his knees); Locker B taping table; the corner | rubs his neck, wipes clean hands on a towel; white tape roll on his left wrist | "Big night, kid. Big night." / "Look at these hands. Insurance should cover these hands." | — | — |
| `rita` | Sunny's window, coffee pot | `work` | — | "Window booth's yours after, champ." | — |
| `inspector` | Commission table | `write` | "Gloves, Seo. Then go be famous." | — | — |
| `ray_1994` | Passes in the corridor; red corner | slow showman's walk; taps his gloves together twice | "Good luck, kid. I mean it. Make it a fight." | — | — |
| `camel_coat` | Locker B (scene only); end of press row | sits on the far edge of the bench; hands still | see scene 0.6 | — | `ch0_purse_dream`, `ch0_refusal_line` |
| `referee` (Phil Ostrowski) | Ring | arms out | "Protect yourselves at all times. Touch 'em." | — | — |
| `timekeeper` (Morty Fine; unnamed until Ch8) | Ringside bell table | hammer in hand | — | — | — |
| `rook_1994` | Section 11, Row K, seated, flat cap | `sit` | none | none | — |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i0_poster_1994` | Championship poster | `CONTINENTAL MIDDLEWEIGHT CHAMPIONSHIP · RAY "THE CROWN" CASTELL vs JIN "THE KESSLER KID" SEO · SAT AUG 20 · CALDER CIVIC ARENA`. Thought: "*My passport photo, two feet tall. Nobody's pasted anything over it yet.*" | Ch2 echoes this exact object (buried) |
| `i0_chalk_ring` | Chalk on the sidewalk | "*Somebody drew a ring. My name's in the blue corner. Spelled right, even.*" | — |
| `i0_sugar_jar` | Sugar jar | Doc: `KESSLER REALTY — PAST DUE — Unit 3B — Balance $570.00 — Please remit by 8/31/94.` Thought: "*She put the jar on it so I wouldn't see.*" | sets up `rent` option |
| `i0_bathroom_sock` | Sock on the doorknob | "*The lock's been broken since Christmas. The sock is the lock.*" | sets up `new_apartment` option |
| `i0_robe` | Robe on the door | "*EASTGATE. Umma did the letters by hand, two nights. The G is a little crooked. Don't tell her.*" | — |
| `i0_photo_appa` | Photo: Appa, 1979 | "*He'd have hated the noise tonight. He'd have come anyway.*" | — |
| `i0_height_marks` | Doorframe | "*JIN 17. MIN 13. Umma stopped measuring when I got taller than the fridge. Min didn't.*" | Ch2 echo in Petra's kitchen |
| `i0_singer` | Sewing machine | "*Umma's machine. It's older than me and better maintained.*" | — |
| `i0_tv` | TV | Channel 6: "Tonight! Castell–Seo! The Crown versus the Kessler Kid!" A clip of Ray hitting pads. Thought: "*He tells you with his left hand before the right. Taps his chin. Every time.*" (the tell, stated once, never again) | — |
| `i0_fridge` | Fridge | After the kitchen scene: the note under the strawberry magnet: `AFTER: Sunny's, window booth. Umma says last bus is 12:10 so WIN FAST. — M` | found again in Ch6 (`ev_fridge_note`) |
| `i0_dock_b` | Dock B door | "`DOCK B — NO PUBLIC ACCESS.` *A gray van's backing in. Nobody's unloading anything.*" | recalled in Ch4 |
| `i0_mirror` | Mirror (Locker B) | "*No scar. Just a nervous guy with good hair.*" | — |

## Quests
- **Main `q0_main` — "One More Round."** HUD steps: `Finish your run. Home by five.` → `Go up to 3B.` → `Eat with your family.` → `Teddy's honking.` → `Warm up with Teddy.` → `Get your hands wrapped.` → `Walk out.` → `Win the title.` (this last objective never completes; it fades out during round 3). Triggers: reaching the stoop; entering 3B; kitchen scene end; wagon door; mitts done; Lenny's wraps; tunnel; bell.
- **Optional `q0_look_around` — "Look around before you go."** (kind: side) Examine 4 of the 8 apartment objects. Reward: `mem_kitchen` gains one extra line (Min's weigh-in notes). No mechanical reward. Missable (closes when Jin leaves 3B).

## Scripted scenes

### 0.1 Cold open — the bell, then the street
1. Black. **A brass bell strikes once**, clear and close. 1.0 s of silence.
2. Sound bridge: running shoes on concrete, the radio from Han's ("...tonight at the Civic, the champion Ray Castell against Eastgate's own Jin Seo..."). Card fades in, bottom left: `August 20, 1994 · Eastgate, Calder`.
3. Fade up on the skyline at golden hour (zoom 0.85): the crane on the Ashgrove skeleton turning slowly. Camera pans down through the parallax to the river end of Kessler Avenue and settles. Jin jogs in from the right edge, towel round his neck. Control is given mid-stride. A small `→` glyph, gone after 2 s. Objective: `Finish your run. Home by five.`
4. Barks as he passes: Han: "Kessler Kid! Bring back the belt!" / two kids on a stoop shadowboxing: "I'm Seo! No, *I'm* Seo!" / Teddy at the Marsh BC door taps his watch: "Five o'clock. Car at six. Eat something boiled."
5. At the bus stop Min steps off the 14 (Kwik Copy name tag still on), falls into step (follower; if the player runs ahead she calls "I'm in *clogs*, Jin" and a thin letterbox holds until she catches up). Walk-and-talk, player in control at walk speed:
   - **Min:** "You're dripping on my street."
   - **Jin:** "It's my street too."
   - **Min:** "One day on the front page and you own a street." *(She stops at the poster wall on her own; camera 1.2.)* "Forty of these. I put up forty. You owe me forty favours."
   - **Jin:** "Name one."
   - **Min:** "Win fast. The bus."

### 0.2 The kitchen (key scene; thin letterbox, then full)
Trigger: Jin enters the kitchen. Staging: Umma at the stove, back to us; Min on the counter with the Calder Ledger sports page; Jin between them. Two-shot of Min and Jin at 1.15, Umma at the frame edge.
- **Min:** "Okay. Important question. Who is this?" *(Holds up the paper. Camera 1.45 on the clipping: a grainy square-jawed man under `SEO: "I'M READY."` Hold 1.2 s.)*
- **Jin:** "That's me."
- **Min:** "That is a man who sells aluminium siding. They airbrushed you into a different person. Look at his chin."
- **Umma** *(not turning)*: "He has my chin."
- **Min:** "Umma, *nobody* has that chin."
- **Umma:** "Jin-ah. Sit. Eat first. Then be famous." *(Jin sits; camera eases to 1.0 to hold all three. Umma sets down a bowl and stays standing, hands folded at her waist: her worried pose.)*
- **Umma:** "How will you get home? The last bus from the Civic is twelve-ten. If it goes long—"
- **Jin:** "It won't go long."
- **Umma:** "Everybody says that. Then it goes long."
- **Jin:** "I'll take a cab, Umma. I'll have money for a cab."
- **Umma:** "A cab is eight dollars." [beat 1.0] "Eight dollars."
- **Min:** "So. Forty thousand dollars. Minus Teddy's third, minus Lenny's little cut, minus the government's giant cut. What's it for, champ? And don't say 'the future.' Umma hates 'the future.'"
- **Choice `ch0_purse_dream`** (no timer):
  - "The rent. Every month we're behind." → `rent`. *Umma glances at the sugar jar.* **Umma:** "We are two months behind." **Min:** "Three." **Umma:** "Two and a half. Rent is my problem." **Jin:** "Not after tonight." **Umma:** "...Then it's our problem. Eat."
  - "Umma stops working Saturdays." → `umma_saturdays`. **Min:** "I already told her you agreed." **Umma:** "Who will fold the hotel sheets? The sheets don't fold themselves." **Min:** "The sheets will survive."
  - "A new place. With a bathroom lock that works." → `new_apartment`. **Min:** "*A lock.* He listens. He actually listens." **Umma:** "The sock works."
- **Min** *(any option)*: "You paid my fall tuition with your last fight. So tonight's cab is on me. That's how this family works." *(Hops off the counter, tears a sheet off the fridge pad and writes with her back to camera.)*
- **Umma:** "Stand up. Hold still." *(She has his blue trunks; the waistband is half re-sewn.)* **Interaction `Hold still`**: the player releases all keys; if Jin moves, Umma says "Ya. Still." and waits. Camera 1.3 on her hands; 3 s of sewing; she bites the thread.
- **Umma:** "Don't let them hit your face. I just fixed your face."
- Min slaps the note on the fridge with the strawberry magnet. **The camera does not go to it.** (The player can examine it. Most won't. Ch6 finds it for them.)
- Teddy's horn from the street: twice, then a long one. Umma straightens Jin's collar and taps his forearm twice. Optional last interaction: `Hug Umma` (`hug`) or `Jab Min's shoulder` (she jabs back). No flag; just the player choosing a goodbye.
- Journal: `mem_kitchen`. Objective: `Teddy's honking.`

### 0.3 Stairwell, the wagon, the drive
- On the 3rd landing Mrs. Okafor opens 3A: "Knock him down, then come home safe. In that order." She touches two fingers to Jin's forehead.
- Getting in the wagon: letterbox on; the camera stays on the street for 2 s after the wagon pulls away (the poster wall, the chalk ring, the 3B window with the fan turning).
- **Drive vignette** (full letterbox, 30 s): side view of the wagon on the river road; parallax streetlights sweep amber bars across the car every 0.7 s; the Civic glows ahead.
  - **Lenny** *(back seat, tackle box on his knees)*: "Big night, kid. Big night."
  - **Teddy:** "You don't talk to the press. You don't talk to Castell's people. You don't talk to anybody but me."
  - **Lenny:** "Who's he gonna talk to, Ted? He doesn't talk." *(laughs a little too long)*
- Breath cut on the sound of the dock's roll-up door. Card: `Calder Civic Arena · 7:30 PM`.

### 0.4 Backstage corridor (playable)
- Objective: `Get your hands wrapped.` Jin can examine Dock B and the posters.
- Ray's group comes out of Locker Room A as Jin passes: two cornermen, a manager in a gray suit, Ray in a white satin robe with gold trim. Ray stops; two-shot at 1.2. **Ray:** "Good luck, kid. I mean it. Make it a fight." He taps his gloves together twice and walks on. (Replayed in Ch8, the line sounds different.)
- The inspector stamps the wraps: "Gloves, Seo. Then go be famous."

### 0.5 Locker Room B — wraps and the warm-up (teaching in motion; no tutorial menu)
1. Lenny wraps Jin's hands on the bench. **Interaction `Hold still`**, camera 1.35 on hands: Lenny's left wrist carries the tape-roll bracelet; his hands shake slightly (a 1 px tremor). **Lenny:** "Look at these hands. Beautiful. Insurance should cover these hands."
2. Teddy picks up the mitts. His words are the prompt; a small key glyph appears beside the bubble only on the first call.
   1. **"Jab."** ×3 on the left mitt. → "Again. Snap it back. A jab you leave out there is a gift."
   2. **"One-two."** jab–cross ×3. → "Turn the back foot. The power's in the floor." (Tip, once: "Tap ATTACK twice: jab, cross. You can stop after either.")
   3. **"Hands up!"** Teddy swats a slow high mitt; hold **guard**. → "Chin down. Feet under you. That's the whole religion."
   4. **"Slip."** Teddy throws a slow, telegraphed hook (0.5 s windup); the player **slips** in the window. On a success the counter window opens: **"Now. Make me pay."** → counter-cross. Misses get "Early." / "Late." and an instant retry.
   5. **Free 20 s:** Teddy calls random one-twos and swings back. Prime body: full run speed, hit-stop 50 ms on crosses, a heavy flash on counters. Teddy grunts happily: "There it is. There's the one I drove to Pittsburgh."
   6. If the player keeps hitting the heavy bag, Teddy lets them, and after 20 s: "You're gonna leave it all in here, kid."
3. Teddy: "Commission wants the gloves signed. Back in five." He leaves. **Lenny:** "I'll get ice." He leaves. Jin is alone, wraps on, gloves on the bench. The player can shadowbox in the mirror; the tube flickers every 7 s.

### 0.6 The offer and the four missing seconds (key scene)
1. The door opens without a knock. **The man in the camel coat.** The camera does not cut to him: he walks into the existing frame from the left and sits on the far edge of the bench. Full letterbox slides in. Jin's back stays to him; the player sees the coat only in the mirror.
2. **Coat:** "Mr. Seo. Don't get up. I'm not anyone. I'm the kind of person who's in a lot of locker rooms."
   [beat 1.2]
   **Coat:** "I'm going to give you some practical advice, and then I'll leave, and you'll never see me again. Fifty thousand dollars. Cash, tonight, in your trainer's car. You go four rounds, you show this town your heart, and you go down, honourably, in the fourth."
   **Coat:** "Your purse is forty, win or lose, less your trainer, the commission, the taxman. Win and you're a champion with a landlord. Take this and—" *(variant)* `rent`: "—the rent on 3B is paid till Christmas of next year." / `umma_saturdays`: "—your mother never works another Saturday." / `new_apartment`: "—a building with a doorman, if you like. Locks that work." *(He knows what was said in the kitchen. Nobody remarks on it.)*
   **Coat:** "Castell's been champion three years. I'm offering you the guaranteed money instead of the risk. I've watched a lot of young men be brave for one night and poor for forty years. That isn't a bribe, son. That's arithmetic."
3. **Choice `ch0_refusal_line`** (all three refuse; the PDF says he refuses):
   - "I'm not for sale." → `not_for_sale`
   - "My family's in Section 14. I'm not losing in front of them." → `my_family`
   - "Get out of my locker room." → `get_out`
4. **Coat** *(stands, smooths his gloves)*: "Then I hope you're as good as they say. Truly." He leaves. The door's pneumatic closer hisses for 2 s. [beat 1.5] The tube flickers. Journal: `mem_offer`.
5. The door opens again. Lenny backs in with the ice bucket, talking before he's through: "Kid, you look pale, you're dry—" **HARD CUT.** No fade, no sound bridge: music, room tone and the flicker phase all jump. **Four seconds are missing.**
6. New frame: Teddy in the doorway: **"Time."** Jin is standing, **gloves now laced on his hands** (they were on the bench a moment ago). Lenny is at the sink with his back turned, running the tap. Nothing comments on it. An observant player notices the gloves.

### 0.7 The tunnel and the walk-out
- **Teddy** *(walking beside Jin, hand on his shoulder)*: "Anything you need to tell me before we walk?"
- **Choice `ch0_told_teddy`:**
  - "A man in a camel coat offered me fifty to go down in four." → `true`. Teddy stops for a beat. **Teddy:** "Every title fight has a guy in a coat. We win anyway. That's the answer to the coat." *(Behind them, Lenny's hand goes to his neck.)*
  - "No. Let's go." → `false`. **Teddy:** "Good. Chin down." *(Thought: "Not now. After. Everything after.")*
- The player walks 1100 px of dark (walk only: "Walk. Let them see you."). The crowd swells with every step; the announcer arrives in fragments: "...from Eastgate... Calder's own... the KESSLER KID—"
- **The reveal:** at the tunnel mouth the camera pulls out from 1.0 to **0.8** over 2.5 s while Jin keeps walking. The bowl opens. The player has 4 s to look before the auto-walk to the ring: **Section 14, Row F**, Umma standing with both hands at her mouth, Min holding up `KESSLER KID` with the yellow scrunchie bright beside it; **Row K**, a flat cap, the only person seated; **press row's end**, a camel coat. No callouts, no highlights; each sits on a third of the frame. A camera flash from Section 14 (Min's Pentax).
- Centre ring. **Referee:** "Protect yourselves at all times. Touch 'em." Ray taps his gloves twice and touches Jin's. Bell. Letterbox off; HUD fades in minimal (condition bar, round clock; no dash pips).

## Encounters

### E0.1 Warm-up (activity; cannot fail)
`train_mitts` tutorial tier inside scene 0.5. Teaches jab, cross, guard, slip, counter-cross. Checkpoint before it.

### E0.2 Title bout vs Ray Castell (`A.bout`)
`ring {x0:380, x1:900}`, `opponent {type:'champion', name:'Ray Castell', opts:{patternSet:'ch0'}}`, `rounds:3`, `roundTime:60`, `allowLoss:false`, `crowd:true`, `bell:true`, corners scripted. Checkpoints: before the walk-out and at the start of each round.

**Ray's four patterns** (the same four return in Ch8, readable then):
1. **Double jab, step right.** Slip either jab to counter.
2. **Chin tap → straight right.** He taps his own chin with the left glove (0.35 s, readable at normal scale), then throws a long straight right. The best counter window in the fight.
3. **Body hook → head hook.** Triggered if Jin holds guard high for more than 1 s; the body hook ignores guard. Teaches that guard isn't a wall; backdash is not available yet, so the answer is to step out.
4. **Lean-back counter.** If Jin throws three jabs in a row, Ray leans away and returns a cross.
Ray resists stagger (boss rule) and cannot drop below 55% in Ch0.

**Round 1 — prime Jin (60 s).** Full power, full speed, crisp hit-stop. The crowd chants `KES-SLER! KES-SLER!` when a counter lands. The player should win this round and feel it. Ray cannot knock Jin down in round 1 (HP floor). Bell: clean, dry.
- **Corner 1** (scripted, 12 s): **Teddy:** "You're winning the round and you know it. Quit showing off. He's waiting on your jab. Give him the jab and then don't be there." Lenny holds the corner's **clear** bottle to the mouthguard (an ordinary bottle; the red-taped one is never in the ring). From Section 14, Min's voice cuts through: "WIN FAST!"

**Round 2 — wrong (60 s; cannot be lost).**
- At 0:20, ramping over 6 s: audio low-passes until the crowd is underwater; a heartbeat fades in; **rain starts on the roof** (the first time the storm is heard). `speedMul` 1 → 0.75, input `delay` 0 → 0.08 s, slip window 0.06 → 0.04 s, punch damage −40%. Jin's idle overlay starts to sway.
- The world shows the block and the thought names it: "*My legs. Why are my legs—*" A small crossed-foot icon appears beside the condition bar for 3 s. A one-time small line at the bottom: `Your body isn't answering. Keep your guard up.`
- At 0:40, **the interrupted recollection:** freeze frame 0.25 s; memory filter; a 0.9 s flash of Locker B from a new angle: a hand with a taped wrist holding a **white squeeze bottle with a red tape band** toward the camera; Lenny's voice, muffled: "You're dry, ki—". Cut back hard on the impact of a Ray jab. Journal: `mem_bottle` (shard 1 of 3; three grainy frames).
- If Jin's condition empties in round 2 he is saved by the bell: it rings early, the referee steps between them, no game-over. Ray's damage is real, so good play still shows.

**Corner 2 — "Something's wrong"** (scripted, full letterbox; the PDF beat). Camera 1.3 from behind the blue corner post: Jin on the stool, Teddy kneeling in front of him, Lenny behind with the towel and bucket. All voices low-passed; Teddy's arrives late, as if through water.
- Jin (thought, slow typewriter): "*The ropes are too far away. Why are the ropes so far away.*"
- **Jin:** "Teddy. Something's wrong."
- **Teddy:** "What?"
- **Jin:** "My legs. I can't— I can't hear you right."
- **Teddy:** "It's nerves, kid. It's the lights. Breathe. Breathe with me."
- If `ch0_told_teddy`: **Jin:** "The coat, Teddy. The guy in the—" **Teddy** looks at the red corner for a long beat, then away: "...Not now. Win this, then we talk about coats."
- **Lenny** *(fast, over Teddy's shoulder, not looking at Jin)*: "He's fine, Ted. Look at him. He's fine. Send him."
- [beat 1.5: Teddy looks at Jin. The camera holds on Teddy; no face, only the head tilting. The one time the game shows his doubt.]
- **Teddy:** "One more round. Win it or I stop it myself."
- The stool is pulled out. Jin stands. **The camera stays on the empty stool for 1.0 s** after Jin leaves frame. Journal: `mem_corner` (shard 1). They send him back out.

**Round 3 — the fall (playable, then unavoidable).**
- Effects intensify: `double` vision (a ghost Ray 6 px behind, 0.1 s late), Jin stumbles if he moves more than 1 s, `speedMul` 0.5, `delay` 0.15 s, slip window 0.04 s, punch damage −60%, heartbeat. His guard drifts down unless the player holds it.
- **Good play is still possible:** a perfect slip on the chin-tap right opens a counter-cross that staggers Ray once. Teddy roars "THAT'S IT!" and the crowd surges. `ch0_resistance` (0–3) counts each counter-cross landed in round 3. This is how good play shows Jin resisting the sabotage. If `ch0_resistance ≥ 2`, Jin slips the first right hand of the finish on his own (below) and the crowd gasps.
- **The scripted end** begins at round clock 0:40 *or* when Jin's condition reaches 25%, whatever the player is doing:
  1. **Legs go.** Jin's knees buckle; one glove touches the canvas.
  2. **The warning sign ignored.** Referee Ostrowski steps in. Camera 1.4 on his hands: he wipes Jin's gloves on his own shirt, looks at Jin's eyes for half a second, glances at the round clock, and waves: **"Box."** Hold 2.0 s on the wave.
  3. **Ray's half-second.** Ray stands still for 0.5 s. His head turns toward the end of the press row (the camel coat is a silhouette there; the camera does not follow his look). Then he taps his chin. Journal: `mem_row` (shard 1).
  4. **Control leaves.** The HUD fades over 0.5 s. Jin's guard lowers on its own. Inputs do nothing, and the screen says why in Jin's thought: "*Hands up. Hands up. Hands—*" (the third cut off). Input glyphs gray out.
  5. Ray walks Jin into **Jin's own blue corner** and lands a combination on the ropes (full hit-stop on each; camera shake on the third).
  6. **The bell.** The timekeeper strikes the end of the round: clear, dry, unmuffled, the only clear sound in the scene. **Ray throws one more right after the bell.** Slow motion 0.25× for that punch.
  7. **The fall.** Jin falls forward. The camera zooms 1.0 → 1.5 while lowering until the canvas line sits at screen centre. Everything is underwater except **the bell, which keeps ringing**: the timekeeper hammering it because nobody is stopping anything. Ding. Ding. Ding. Ray's white shoes step away. The referee's shoes come late.
  8. **Fragments** between bell strikes (memory filter, 0.5 s each): Umma standing in Section 14, both hands at her mouth. Min climbing onto the ring apron, the yellow scrunchie, her mouth open on a shout we cannot hear. A camel coat walking up the aisle, back to us. Row K: the flat cap seated; then the seat empty.
  9. Black. **The bell rings three more times over black.** Silence for 2.0 s. Journal: `mem_bell`.
- **Rule (PDF):** an unavoidable story event, not a secretly unwinnable challenge. No "You lost" screen, no retry prompt, no score. Good play changes `ch0_resistance` and Ray's Ch8 line, never the outcome.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| What the purse is for | `ch0_purse_dream` = `rent` / `umma_saturdays` / `new_apartment` | Umma and Min's replies; the coat's arithmetic line | Ch2 Okafor: "Your mother told the whole building you'd pay the rent off / get her Saturdays back / find a place with a lock for Min." Ch6 Min's letter #4 mentions it. Ch9 Penner's offer echoes it. Endings: E1 epilogue shows Jin able to buy exactly that with no one to give it to; E2 shows the rented room. |
| How Jin refuses | `ch0_refusal_line` = `not_for_sale` / `my_family` / `get_out` | Coat's exit is identical | Ch9 Penner quotes it word for word ("We have very good notes."). Ch10 it is Jin's last thought at the door. |
| Tell Teddy about the coat | `ch0_told_teddy` (bool) | Teddy's tunnel line; Lenny's hand to his neck; corner-2 variant | Ch2 Teddy's confession has two versions; Ch8 Teddy's corner line. |
| (observed) counters in round 3 | `ch0_resistance` 0–3 | Teddy's shout, crowd | Ch8 Ray's pre-fight line. |

## Chapter ending and state handed on
- **Completion screen** (slow fade on black, no music): `CHAPTER 0 — ONE MORE ROUND` · "Jin loses control over his future." · **What you did** (plain sentences): "You told Min the purse was for the rent." / "You told the man in the coat to get out." / "You told Teddy about him." or "You didn't tell anyone." / "You landed two counters in the third round." No grade. The bell is silent on this screen.
- **Handed on:** `ch0_*` flags; memories `mem_kitchen`, `mem_offer`, `mem_bottle` (shard 1), `mem_corner` (shard 1), `mem_row` (shard 1), `mem_bell`. Jin's moveset is **wiped** (Ch1 starts with no punching, no running, no slip). Money $0.
- **Transition (match cut):** on continue, black. **One bell strike, muffled**, answered by an electronic **ding... ding** of a hospital nurse-call chime. The Ch1 card appears on the second chime.



# Chapter 1 — The Name Above the Bed

**Card:** `The Name Above the Bed` · `St. Agnes Long-Term Care, Hillcrest · October 1996` · bell: one strike, heavily muffled, answered by the nurse-call chime *ding... ding*.

## Date, mood, palette, weather
- Monday, October 7 to Wednesday, December 18, 1996, in short playable sessions separated by time cards: `Day 1` · `Day 3` · `Week 2` · `Week 4` · `Week 7` · `Week 9` · `Week 10` · `December 16` · `December 18`.
- Mood: disoriented, then patient, then quietly furious. Institutional calm hiding a lie, with ordinary kindness all around it.
- Palette: pale green-gray walls, cream linoleum with a brown stripe, buzzing fluorescent white, cold blue window light; the records basement in sodium yellow and boiler-pipe green. Warm pools only at the nurses' station lamp, the day-room TV and Hana's desk.
- Weather and clock: the courtyard maple outside Room 214 is the chapter's clock: orange (Day 1), half-bare (Week 4), bare (Week 9), frost (Week 10), first snow on the last morning. October rain streaks the window; the whiteboard by the door updates its date after every time card.
- Skyline through the window: the river, the dead Foundry stacks, and **Ashgrove Tower finished and lit** (it was a crane in Ch0).

## Gameplay identity
**Relearn the body; read the paperwork.** Short rehab sections, each a single movement problem, inside a building the player learns room by room, and a quiet investigation inside it. **No combat.** The controls start almost absent and grow back; the game always says why a verb is missing.
- Exploration 20% · dialogue 30% · investigation 20% · combat 0% · activities (rehab drills) 30%.
- Target length: 18–22 min.

**Movement by session** (each restriction shown in the world first, then a small crossed icon; never unexplained):
| Session | Jin can | The world shows why |
|---|---|---|
| Day 1–3 | turn his head (camera nudge ±40 px), sit up (hold) | in bed; IV line a 1 px gray thread |
| Week 2 | parallel bars only (alternate left/right; rushing makes him sag) | Hana's hands hovering at his belt |
| Week 4 | wheelchair (slow); stand at the handrail and walk along it | the wheelchair parked by the bed |
| Week 7 | walk unaided at 60% (limp 0.4), no run, no jump | his idle lists right; he touches the wall |
| Week 9–10 | walk, stairs, a short hop, jog at 70% (the winded state shown for the first time: no meter, Jin's shoulders heave and he slows) | Hana: "Stairs today. Don't show off." |
| Dec 16–18 | run at 85%, full jump | — |
Punch, dash and slip are restricted all chapter: "*Not yet. Hana says the shoulder's held by two screws and good intentions.*"

## Locations

### `stagnes_room214` — Room 214 (640 × 360)
Door (right) → **Earl Dunning's bed** (side table: a transistor radio, a crossword book, a framed photo `CALDER FOUNDRY RIGGING CREW 1971`, get-well cards strung on yarn) → **Jin's bed by the window** (left). Above it, a slide-in **name card** in a plastic sleeve. Jin's side table holds a plastic water jug and nothing else: no cards, no photos (two years without visitors, told by an empty table). A whiteboard by the door: `TODAY IS: MONDAY OCT 7 · YOUR NURSE: DOLORES · YOUR THERAPIST: HANA`. Closet. Window: the courtyard maple, the river, the skyline.
Light: daylight through blinds in stripes; at night the hall light under the door and the radio's dial glow. Sound: Earl's radio (a ballgame, then talk radio, then Christmas music by December), the call chime, rain. Exit: door → `stagnes_2west`.

### `stagnes_2west` — Second floor, West corridor and day room (1700 × 360)
Left → right: stairwell and elevator (to the gym 1F, lobby 1F, basement records) → rooms 210, 212, **214**, 216 (doors half open; a woman knitting in 216 who waves; in December she holds up a finished scarf) → a long **handrail** on the wall → **nurses' station** (counter, chart rack with a binder `AHN, D. 214`, the **sponsor binder**, desk lamp, phone, a bowl of peppermints Dolores refills) → bulletin board (`BINGO THURSDAYS 2 PM · prizes from the jar!`; a paper turkey appears in Week 7, a snowflake chain in Week 10) → **day room** (TV on a wall bracket, a card table with a half-done 1000-piece lighthouse puzzle, a **patient payphone** with a sign `PATIENT CALLS 7–9 PM`, two armchairs, the **bingo jar** on the windowsill) → Sister Margaret's office door (right end).
Light: fluorescent strips, one buzzing over the payphone; warm lamp at the station. Sound: carts, call bells, a TV game show, a floor polisher at night.

### `stagnes_gym` — Rehabilitation gym, 1F (1100 × 360)
Doors from the stairwell → **parallel bars** → low balance beam → four-step stair trainer → mats → **mirror wall** → floor-tape **footwork marks** (numbers 1–6 in a zigzag) → **Hana's reaction board** (plywood, four coloured bulbs, a switch box with taped labels) → Hana's desk (a mug `CALDER FOUNDRY & FORGE — 25 YEARS`, her father's; a stack of charts; a **Beacon Street Institute brochure** in a tray) → glass door to the courtyard. The ceiling lights are four long tubes in a square: the match cut from the Ch0 ring lamps. Two other patients do their own therapy with their own therapists, never named: ordinary.

### `stagnes_courtyard` — Courtyard garden (1200 × 360, exterior, overcast)
Glass door → gravel path loop round a dry fountain full of leaves (conditioning laps) → two benches → the maple → iron fence. Leaves fall in a loop; frost on the path in Week 10. Exits: gym door; lobby door.

### `stagnes_records` — Medical records, basement (900 × 360)
Stairwell landing (staff door, locked: "Staff only. Hana has a reason to be down here. You don't, yet.") → boiler and pipes → steel shelving rows of archive boxes by quarter → a microfiche desk under a pull-chain bulb → a Xerox machine (staff code) → **patient-property shelf** → a high ground-level window that takes the late sun.
Box `ADMISSIONS 1994 Q3 — ORIGINALS` sits on the bottom shelf, dusty except for one hand-shaped clean patch (someone took things out of it once; the transfer form was missed because it was stapled behind another patient's). Sound: dehumidifier hum, boiler knocks, a dripping pipe.

### `stagnes_lobby` — Lobby and front steps (1300 × 360)
Chapel door with a small stained-glass window → front desk and the **visitor binder** → brochure rack (`Living With Brain Injury`, `Your Rights as a Resident`) → the **donor plaque** → glass front doors → steps → Hillcrest Road and the **Route 14 bus shelter** under a streetlight at the far right, Calder below in haze, the Civic Arena's dome a small gray bump on the river.
Plaque: `REHABILITATION WING · Twelve beds supported by the CALDER FOUNDRY RELIEF FUND since 1994`. (The Fund's money is real. Twelve beds depend on it. That is why the administrator obeys it.) Front doors locked to residents until departure: "Residents sign out at the desk. There's a form."

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `hana` | Gym (desk, kneeling at the bars); corridor with clipboard; records | hugs the clipboard; kneels to eye level; `handsHips` when decided | Week 2: "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe." / Week 7: "I typed this file. I typed it from what Mr. Pike handed me." / Dec 18: "Because the chart's wrong. I hate it when the chart's wrong." | "Heel, toe. Heel, toe." / "Don't look at your feet, look at me." / "Three more. Then you're allowed to hate me." | `ch1_told_hana_boxing`, `ch1_pike_stance`, `ch1_records_route` |
| `pike` | Room 214 chair (Day 3), nurses' station (Week 7), lobby (Dec 18) | edge of the chair, briefcase on his knees, hands clasped; leaves a butterscotch on the tray each visit (the pile is the visit counter) | "Confusion is very normal, Daniel. The brain fills gaps with stories. Boxing is a very common story." / "All inquiries go through the Fund. It's for your protection." / "We're paying for all of this, Daniel. The least we can do is get well quietly." | — | `ch1_pike_stance` |
| `earl` (Earl Dunning, 74, ex-Foundry rigger, emphysema) | Room 214 left bed; day room wheelchair | `sit` with a crossword | "Morning, Daniel. Or whatever your name is today." / (Week 4, at the TV) "Never trusted that Korean kid. Took the money and ran, I bet." / (after the crossword) "Jin. Right? Jin." | "Seven letters. Don't tell me, I'll get it." | `q1_crossword` |
| `dolores` (Nurse Dolores Reyes) | Nurses' station; night rounds with a flashlight | `write`; refills peppermints | "Good morning, Daniel. Big day. You're going to sit up and I'm going to cheer." / "Sponsor says calls go through the Fund, honey. It's in the binder. I'm sorry. I'm really sorry." | "Pills, then glory." | after the records: "Lights out at ten, Mr. Seo. Sorry. I'll get used to it." |
| `whitlow` (Dr. Anita Whitlow, attending physiatrist) | Corridor on rounds; her office (Dec 16) | walking with a chart | "Your recovery is real. It is also slow. Both of those are going to annoy you." / Dec 16: "Medically, you can go. I've written down what you actually need. Nobody is going to pay for it." | "Morning, Mr. —" (from Week 7 she pauses before the surname) | starts calling him Jin in December |
| `sister_margaret` (Margaret Doyle, administrator) | Her office (Week 9, overheard) | `write` | "Twelve beds, Hana. Twelve people who'd be somewhere worse." | — | Hana's calls |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i1_namecard` | Name above the bed | `AHN, DANIEL · DOB 03/14/68 · ADM 08/22/94 · DR. WHITLOW · FUNDING: CFRF`. Thought: "*That's my birthday. That's not my name.*" | `ev_name_card` ★ |
| `i1_whiteboard` | Whiteboard | Updates per session, e.g. `TODAY IS: TUESDAY OCT 22 · GOAL: STAND 30 SEC ☺` (Hana's smiley). | — |
| `i1_window` | Window | Day 1: "*Calder. That tower wasn't finished.*" Dec: "*Frost. Two Decembers gone.*" | — |
| `i1_earl_photo` | Old photo | "*Calder Foundry Rigging Crew, 1971. Thirty men in hard hats. Earl's the one pretending not to smile.*" | — |
| `i1_candies` | Butterscotch | (count) "*He leaves one every time. Like I'm a grave.*" | — |
| `i1_pikecard` | Business card | Doc: `Gerald T. Pike · Liaison · Calder Foundry Relief Fund · 88 Market Street, 2nd floor · P.O. Box 1180, Calder`. Thought: "*I never worked a day at the Foundry.*" | `ev_pike_card` |
| `i1_sponsor_binder` | Sponsor binder | "`AHN, D. — All correspondence and telephone contact to be routed via CFRF liaison. Visitors by prior approval only. — G.P.` *My life has a routing slip.*" | — |
| `i1_chart_rack` | Charts | Before Week 7: "*Not mine to read, apparently.*" Week 7 (Hana opens it with him present): the face sheet. | `ev_current_file` ★ |
| `i1_dayroom_tv` | TV | Week 4 scene; afterwards: "*Champion. Three defenses. I was supposed to be in that sentence.*" | — |
| `i1_jar` | Bingo jar | "*$6.40 in coins and two singles. A masking-tape label: 'DAY ROOM — BINGO PRIZES — thank you! — Mrs. Alvarez, Volunteer.'*" | departure option |
| `i1_payphone` | Payphone | `q1_calls`. If `insisted`, from Week 7: an index card taped on it, `Resident AHN D. — calls via CFRF liaison.` "*My name, on a payphone. Not even my name.*" | — |
| `i1_hana_mug` | Coffee mug | "CALDER FOUNDRY & FORGE — 25 YEARS." Hana: "My dad's. They gave him a mug and a pension that lasted until the bankruptcy." | sets up Week 7 |
| `i1_beacon_brochure` | Brochure (Hana's tray) | Doc (Dec 16): `BEACON STREET INSTITUTE · Boston · Residential Neuro-Rehabilitation · 18 months · specialists daily · est. $84,000`. | the money rule |
| `i1_rights_brochure` | Brochure rack | "*'You have the right to communicate privately with persons of your choice.' Somebody circled it in pen. Not me.*" (Hana did, Week 9.) | — |
| `i1_plaque` | Donor plaque | Text above. Thought: "*They bought twelve beds and a name.*" | — |
| `i1_records_box` | "ADMISSIONS 1994 Q3 — ORIGINALS" | Doc: the transfer form; the intake sheet. | `ev_transfer_form` ★, `ev_intake_whiteout` ★ |
| `i1_property_shelf` | Patient property | "*A bag with a tag. SEO, J. My handwriting isn't on it, but my name is.*" | `ev_property_tag` |

## Quests
| id | Kind | HUD objective text | Completion | Reward / consequence |
|---|---|---|---|---|
| `q1_main` | main | `Sit up.` → `Walk the bars with Hana.` → `Get to the day room.` → `Ask to call home.` → `Walk to the nurses' station.` → `Climb the stairs. Then the courtyard.` → [with Hana] `Wait for Thursday. Hana has the key.` / [alone] `Go down to the records room. Don't get caught.` → `Get your things. Get out before the 19th.` → `Catch the 14.` | Session triggers; records found; form signed; bus boarded | Training menu (Week 4); evidence; Hana's number |
| `q1_crossword` | side | `Help Earl with Sunday's crossword.` | Talk to Earl in three sessions; each time one clue, three answers, only one fits the letters (no trick options). Clue 1 (Week 2), 7 letters, "a fighter throws it first": OPENING ("*You throw it first or you don't throw anything.*"). Clue 2 (Week 4), 7 letters, "Calder's old employer, closed in '92": FOUNDRY, which starts Earl's story. Clue 3 (Week 7), 4 letters, "what's on a bed card": NAME (Earl: "Funny clue for this room."). | `ev_earl_testimony`; Earl calls him Jin and apologises for the TV line; Earl's fare offer on Dec 18; a postcard from Florida in Ch9 |
| `q1_calls` | side | `Make a phone call.` | Two calls from the day-room payphone: 412 Kessler (the three-tone "not in service" sound, played in full) and the Marsh Boxing Club number from memory ("Iron Pulse Fitness, how can I pump you up?"). Thought: "*Both numbers belong to somebody else now.*" | Seeds Ch2: the gym changed hands |
| `q1_exercise_card` | side (training intro) | `Hana's home exercise card: try a drill.` | Any drill to level 1 | `hana` +1 (first session only); Hana: "Training isn't the plan. It's the homework. The plan is you walking out of here." |

## Scripted scenes

### 1.1 Waking (Day 1; key scene; input is look and sit up)
1. Card (above). Fade from white, not black: overexposed, then the room resolves. Camera starts at **1.6** on Jin's shoulder and pillow; the IV line is a 1 px gray thread. Earl's radio: "...Ashgrove Tower's ribbon-cutting drew the mayor and—"
2. Earl presses his call button: *ding*. Jin's head turns (the first sign of life).
3. Over 4 s the camera eases out to 1.0 and **pans up the wall to the name card. It stops on `AHN, DANIEL` at 1.4 and holds 2.5 s.** No music.
4. Thought: "*That's not my name.*" [beat] "*My name is Seo Jin.*" [beat] "*Ceiling tiles. Thirty-seven. I counted yesterday too.*" (He has been surfacing for days. He remembers who he is; the fight itself is the gap.)
5. Prompt `Sit up` (hold). The first two fail (Jin rises 2 px and falls back; the bed creaks; "*My arms don't answer yet.*"); the third succeeds. The camera settles at 1.0 and the whiteboard comes into frame: `TODAY IS: MONDAY OCT 7`. Thought: "*October.*" [beat] The calendar card on the board says 1996. "*Nineteen ninety-six.*" [beat 1.5] "*Two years.*"
6. Dolores in the doorway with a cup of ice chips: "Daniel? Oh my God. Okay. Okay. Don't move. Dr. Whitlow!" She runs; the ice chips stay on the tray.
7. **Earl:** "Two years I've had a roommate who doesn't snore. Figures you'd wake up the week the Steelhawks blow the season."
8. **Jin** *(hoarse, slow typewriter)*: "Jin. My name's Jin."
9. **Dolores** *(back, writing, kind)*: "Mm-hm. We'll tell the doctor you're talking. That's wonderful."

### 1.2 Pike's first visit (Day 3; full letterbox)
Camera: a slight low angle from the bed, Pike tall in frame, standing too close.
- **Pike:** "Daniel. Gerald Pike, Calder Foundry Relief Fund. We've been looking after you since your accident. You're a lucky man." *(A butterscotch on the tray; his card beside it.)*
- **Jin:** "What accident?"
- **Pike:** "Salvage work at the old Foundry. A beam came down. August of '94. You don't have to remember. Most men don't."
- **Jin** *(one word per line)*: "Jin." / "Seo Jin." / "I'm a boxer. I fought at the Civic."
- **Pike** *(adjusting his glasses, smiling)*: "Confusion is very normal after an injury like yours, Daniel. The brain fills gaps with stories. Boxing is a very common story. Young men see it on television." *(standing)* "Questions about boxing will only upset you. Let's not make your recovery harder than it needs to be."
- At the door, to Dolores, at normal volume because he doesn't think Jin is listening: "No outside calls until the Fund's physician clears it. It's in the binder. For his own good." Over his shoulder: "We're paying for all of this, Daniel. The least we can do is get well quietly."
- **Earl** *(after he's gone, radio clicking back on)*: "That fella's been here every month for two years. Never once took his coat off. Never once asked how you slept."

### 1.3 Week 2: the bars and the mirror
Time card `Week 2`. **Match cut:** the four ring lamps of Ch0's last image become the four fluorescent tubes of the gym, in the same square.
- Hana wheels Jin in, crouches at the bars to eye level. **Hana** *(reading the chart)*: "Daniel Ahn, thirty-one, foundry. Hi. I'm Hana. I've been moving your arms and legs for nine months while you weren't here. Now you get to help."
- **Jin:** "My name is Jin Seo."
- **Hana:** "Your chart says Daniel, so for now you're Daniel. Records are how we keep people safe." (She trusts the chart. She thinks it's confusion. That's her job.)
- **Parallel bars** (`train_balance` tutorial framing): stand, hold steady against the sway meter for 8 s, then walk the bars with alternating left/right at a steady rhythm; rushing makes Jin sag and Hana's hands catch his belt: "Slow is smooth. Your left foot is lying to you. Don't believe it."
- Halfway, a relationship-only choice: **"Tell her about the fight."** → `ch1_told_hana_boxing = true`, `hana` +1. **Jin:** "I'm a boxer. Was. I fought Ray Castell for the title." **Hana:** "Okay. I'm writing that you said so. That's what I can do today." (She writes it in her own notebook, not the chart: the first person at St. Agnes to listen without correcting.) / **"Say nothing."** → `false`. Thought: "*Let her watch me move for a few weeks. Then she can decide.*"
- **The mirror** (key scene, at the end of the bars, which face the mirror wall): the camera pushes from 1.0 to **1.35 on the reflection** over 5 s while the gym sound fades to the hum of the tubes. In the reflection: thin shoulders, hair grown shaggy over the ears, **the broad reddish scar on the right cheek**. No thought line. Hana, behind him in the mirror, sees him looking and says nothing; she lays a towel over the bar beside his hand and steps out of the reflection. [hold 3.0 s] **Hana** *(quietly)*: "That's enough for today." Breath zone: the gym empties, the sit spot on the mat is available.
- First time Jin sits on the bed edge that night (sit interaction): `mem_waistband` plays (Umma's hands, the needle, the bitten thread; two seconds; gone).

### 1.4 Week 4: the day room and the public lie
Time card `Week 4`. Wheelchair; the handrail. The **Training** tab appears in the Journal with four drills (balance, footwork, reaction, conditioning) and "Level cap 1 for now." Toast: `Training unlocked. Optional. It improves control of the body you have.`
- Jin wheels into the day room. Channel 6, `Calder Sports Weekly`: Ray Castell hitting pads, heavier. **Anchor:** "...Castell's title came, of course, at the expense of Eastgate's Jin Seo, who, you'll remember, checked himself out of Calder General against medical advice two days after that knockout, and hasn't been seen since."
- **Earl:** "Never trusted that Korean kid. Took the money and ran, I bet."
- The camera pushes slowly in on Jin in the wheelchair, silhouetted against the TV's blue; the anchor's voice drops in volume. **Jin's hand tightens on the wheel** (a 1 px pose change). Hana is in the doorway with a clipboard and heard all of it. She looks at the TV, then at Jin, for 2 s, and says nothing. Breath zone.
- **Ask to call home** (main step): at the nurses' station. **Dolores:** "Your Fund says calls go through them, honey. It's in the binder. I'm sorry. I'm really sorry." The sponsor binder is examinable. Hana, passing: "I'll ask Mr. Pike."

### 1.5 Week 7: the contradiction and the letter (key scene)
Time card `Week 7`. Jin walks the corridor unaided for the first time (the handrail for the first 10 m, then Hana walking backwards in front of him: "Don't look at your feet, look at me."). Dolores claps once, quietly.
- Earlier that week Hana wrote to "Mrs. Seo, 412 Kessler Ave, Apt 3B" on St. Agnes letterhead and left it in the outgoing tray (shown in a 3 s cut at the start of the session: the tray, the envelope).
- At the station Pike is signing the visitor binder. He opens his briefcase to hand Dolores "the Fund's paperwork"; **Hana's letter is visible inside it** (camera pushes to 1.5 on the briefcase for one second, then back). Hana sees it.
- **Pike:** "Daniel. You look wonderful. Ms. Lim, you're working miracles. Let's start simply, shall we? Tell me your name."
- **Jin:** "I fought Ray Castell for the title. August twentieth. At the Civic."
- **Pike:** "Daniel, you worked the pour floor at Calder Foundry for nine years. It's in the file Ms. Lim typed."
- **Hana** *(not looking up from her clipboard)*: "Calder Foundry closed in March of '92."
- [beat 1.5]
- **Pike:** "Salvage, Ms. Lim. A salvage crew. The paperwork around that bankruptcy was extensive."
- **Hana:** "My father got his last check from Calder Foundry in March of '92. They gave him a mug." *(Camera 1.25 on Hana and Pike; Jin between them.)* "Nobody was salvaging anything in August '94. The gates were chained."
- **Pike** *(still smiling, to Jin)*: "Your name, Daniel."
- **Choice `ch1_pike_stance`:**
  - "...Daniel." → `played_along`. Pike's hands unclasp. "There. You see? It comes back." He signs a day-room and courtyard pass on the spot. Thought: "*Let him think he's won. I need the courtyard more than I need him to say it.*" Hana's pencil stops.
  - "Seo Jin. S-E-O. Call my mother. Mi-ok Seo, 412 Kessler." → `insisted`. Pike sighs. "I'll let the Fund know Mr. Ahn is agitated. For his protection, calls will go through our office." He tapes the index card on the patient payphone himself. **Hana:** "He can't do that." **Dolores** *(gently)*: "He can, honey. Sponsor's instructions."
- After Pike leaves, in the gym, Hana closes the door. "I typed that file. In February '95, during the records conversion. I typed it from a face sheet Mr. Pike handed me." She asks reception for her letter back; the receptionist says Mr. Pike took "the Ahn correspondence, as usual." **Hana:** "As usual." She takes the chart from the rack and opens it with Jin present (she is allowed to): `ev_current_file`. She reads the note that matches the player's answer aloud and puts the chart down. **Hana:** "'Redirect gently.' I've redirected you gently for nine months. Huh."
- **Hana** *(sitting on the windowsill, which she never does)*: "I'm not on your side, Jin. I'm on the side of the chart being true." [beat] "Right now that's the same thing."

### 1.6 Week 9: stairs, the courtyard, and the office door
Time card `Week 9`. Stair trainer, then the real stairwell (2 West ↔ 1F) with a hop at the top step ("Jump" works now: a small hop). Courtyard: first jog laps (`train_conditioning` framing; the first time Jin gets winded: no meter, his shoulders heave, his pace drops, small breath puffs; Hana explains it: "When your shoulders go up like that, you stop. Not when you feel like stopping. Before.").
- **Overheard** (corridor; control kept; walking closer raises the volume): Sister Margaret's door half open. **Sister Margaret:** "You called the State Athletic Commission. You called a disconnected number in Eastgate nine times. Mr. Pike called me at home, Hana. At home." **Hana:** "The commission says Jin Seo's licence lapsed in '95. Last address: 412 Kessler. His purse from August '94 is still sitting there, unclaimed." **Sister Margaret:** "Twelve beds, Hana. Twelve people who'd be somewhere worse. Staff do not contact outside parties on behalf of Fund patients." (She is not a villain; she is tired and frightened of an empty wing.)
- Hana comes out, sees Jin in the corridor, and doesn't pretend he didn't hear. **Hana:** "Thursday, I'm on until eleven. Medical records keeps originals from before the conversion. If there's another version of you, it's down there. Dolores will lend me the key if I call it a chart audit. **Wait for Thursday.**"

### 1.7 Week 10: the records room (key scene, two variants)
Time card `Week 10 · Wednesday, 11:10 PM`. Jin can't sleep. The corridor is dark. **Choice `ch1_records_route` happens in play, not in a menu:** if Jin walks to the stairwell and down, he finds the basement door propped open by the night janitor's mop bucket; a prompt at the door, `Go down now`. Walking back and using the bed (`Sleep`) leads to Thursday.
- **`with_hana` (Thursday, 6:15 PM, sunset).** Hana unlocks the records room. She crouches at the low shelves, finger under each label; Jin reads box labels while she holds the flashlight, so the light follows her. The player finds `ADMISSIONS 1994 Q3 — ORIGINALS`. Two-shot at 1.2, both sitting on the floor among the boxes. Hana reads the transfer form aloud in a flat voice: "Seo. Jin. Date of birth March fourteenth, sixty-eight. MR number four-four-seven-one dash zero. Closed head injury, professional boxing contest, Calder Civic Arena." [beat] "Same MR number as Daniel Ahn. Same bed. Different man." Then the St. Agnes intake sheet. **Hana:** "That's white-out." She stands and holds the sheet up to the high window. **Camera 1.5 on the paper:** in the red sunset light, the typed letters `SEO, JIN` show through under `AHN, DANIEL`. [hold 2.5 s] Hana sits down on a box. **Hana:** "Okay." [beat] "Okay. I'm going to copy this, and put it back exactly where it was, and then I'm going to be very normal for a while." The Xerox light sweeps across both of them. She is the one who finds the property bag on the shelf. `hana` +2.
- **`alone_at_night` (Wednesday, 11:15 PM).** A soft stealth walk: Dolores does rounds with a flashlight on a fixed loop. Dolores walks a fixed scripted path; if Jin comes within her lamp's 70 px light cone she walks him back to bed ("Daniel, it's eleven. Even the goldfish is asleep.") and the player retries from the corridor; no fail state. In the basement Jin checks three shelves himself. The reveal is under the **bare bulb**: he pulls the chain; camera 1.5 on the paper held up to the bulb, `SEO, JIN` showing through. Nobody to share it with. Thought: "*Somebody sat at a desk and did this with a little brush.*" He can't use the Xerox (staff code), so he takes the originals. He finds the property bag himself and sits on the floor among the shelves; the camera eases out to 0.8, Jin small under one bulb. Next morning, **Hana:** "You went down there alone? On those legs? I said Thursday." **Jin:** "I've lost two years. I couldn't lose one more day." **Hana:** "...I know. I still said Thursday." [beat] "Show me." The same reveal happens again in daylight; she copies it. `hana` +0.
- **The property bag** (both variants; doc viewer): tag `SEO, J. · ER 8/20/94 · MR# 4471-0`. Inside: a muted blue track top, black pants, worn white running shoes, a wallet with an Athletic Commission licence card `SEO, JIN · Professional Boxer · Lic. CA-1187`. The player turns the collar in the viewer: in marker, `PROPERTY OF THE CHAMP (allegedly) — M`. Thought: "*Min bought it. Christmas '92. She wrote that so the gym guys wouldn't take it.*"
- Both variants add `ev_transfer_form`, `ev_intake_whiteout`, `ev_property_tag`. Breath zone afterwards (records room safe; night corridor empty).

### 1.8 December 16: the transfer order and the price
Time card `December 16`. A new memo in the sponsor binder (examinable; Dolores leaves it open on purpose): `Patient AHN, Daniel to be transferred to Ridgeview State Home, Millbrook, 12/19/96, 7:00 AM, at sponsor's request.` (Millbrook is 200 miles upstate.)
- **Dr. Whitlow's office.** "Medically, you can go. If you have somewhere to go." She hands him a sheet (`ev_whitlow_note`). Camera lingers 2 s on the last lines. "That's what fixing this properly looks like. Eighteen months. Specialists every day. People sell houses for it. People who have houses." [beat] "Nobody is going to pay for that, Jin. I'm sorry." (She uses his name.)
- Thought: "*I was going to make forty thousand on the biggest night of my life. Before the cuts.*" This is the moment the game states that ordinary money will never buy the real recovery.
- Earl, packing for his daughter's in Florida (leaves Dec 19), gives Jin the transistor radio: "For the ball games. Or whatever you call yourself." (If `q1_crossword` done: "Jin. Right? Jin. Find a fight on it.") The radio is Jin's from now on: it sits by his bed in every later base.

### 1.9 December 18: leaving (key scene)
1. Hana, in the gym before her shift: "I read your admission paperwork front to back. There's no court order. No guardianship. You're a voluntary resident. The Fund pays the bill. It doesn't own you." [beat] "You can walk out the door, Jin. Nobody told you that, because nobody wanted you to know."
2. **Room 214, last time.** Jin changes into his own clothes from the property bag; the look switches to `jin_street` in a single cut. Mirror: "*Track top's loose in the shoulders. Still mine.*" The bed interaction reads `Take the name card`. Jin slides `AHN, DANIEL` out of the sleeve and pockets it. **The camera holds the empty slot above the empty bed for 2 s.** (It returns in Ch9 as a brass plate, and in Ending One with another man's name in it.)
3. **Bus fare. Choice `ch1_fare_source`** (whichever he takes first; once he has fare, the others close):
   - Day room, the jar: `[Take the bingo jar. $6.40. It's the day room's prize money.]` → `activities_jar` (+$6.40; the jar left empty on the sill, the "thank you!" label facing the room).
   - Earl, in the corridor (only if Jin talks to him): "Forty years I rigged steel and never once tipped a bus driver. Take five." → `earl_gift` (+$5).
   - Hana, at the front doors: "Take it. It's a loan. I'm keeping a list." → `hana_loan` (+$20).
4. **The lobby.** Pike at the desk, coat on, with a man from the transport company (gray uniform, says nothing). Camera wide: Jin entering from the left, Pike framed in the glass doors, frost outside.
   - **Pike:** "Daniel. The Fund has found a facility that will suit you better. Quieter. Less... imaginative staff."
   - **Hana** *(`handsHips`, stepping between them)*: "He's a voluntary resident. He can sign himself out against medical advice any time he likes. It's in the brochure. Someone circled it."
   - Dolores slides the AMA form across the desk without being asked, and turns the visitor binder toward Jin as she does: 26 visits, one name, `G. Pike, CFRF`. Family visits: none.
   - **Choice `ch1_signed_name`** (the form's name line):
     - Sign `Daniel Ahn` → `daniel_ahn`. Fast and quiet. Pike relaxes: "Sensible." Thought: "*It's just a form. I'll get the name back when I can prove it.*"
     - Sign `Seo Jin` → `seo_jin`. Dolores reads it upside down: "That's not the name on the file, hon." **Jin:** "It's the name on me." Pike's smile goes. He leaves first, already feeling his coat for a dime for the payphone.
5. **Outside** (control returns). Hana follows in her navy peacoat over scrubs. She hands him the copy (with_hana) or nothing (he has the originals), and an appointment card: front `Hana Lim · Rehab · ext. 214 · before 7 or after 9`; back `Calder YMCA, Front St. $8/night. Tell Otis at the desk I sent you.`
   - **Hana:** "The address on the form is 412 Kessler. Eastgate. The 14 goes there."
   - **Jin:** "Why are you doing this?"
   - **Hana:** "Because the chart's wrong. I hate it when the chart's wrong."
   - If `ch1_told_hana_boxing`: "You told me on the bars. I should've written it bigger."
   - If `ch1_fare_source = hana_loan`: "Twenty dollars. It's on the list."
6. First snow begins. On the steps the camera eases out to **0.8**: Calder below in blue haze, the Civic dome a gray bump on the river. Jin walks down to the shelter; nothing hurries him. The 14 arrives. Last shot from inside the bus window (side view, moving left): St. Agnes sliding away, and in a second-floor window a small figure in teal with a clipboard, not waving.

## Encounters
None. Ch1 has no hostiles. The "fights" are rehab: balance, bars, stairs, laps, the reaction board (four bulbs light in random order; press the matching direction within 0.6 s; level 1 target 12 in a row). Every failure is a stumble with one line from Hana and an instant retry. The night stealth cannot fail.

## Choices made here
| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Tell Hana about the fight | `ch1_told_hana_boxing` (bool) | `hana` +1; she writes it in her notebook | Ch6 Hana: "You told me on the bars, the second week. I didn't put it in the chart. I should have." |
| Pike: "Your name?" | `ch1_pike_stance` = `played_along` / `insisted` | courtyard pass vs payphone card (Hana sees it) | Ch2: `insisted` → the gray van is already parked on Kessler when Jin arrives; `played_along` → it arrives at dusk. Ch6: Pike's file note on Jin reads "cooperative" or "agitated, monitor". |
| Wait for Hana or go alone | `ch1_records_route` = `with_hana` / `alone_at_night` | records variant; `hana` +2 / +0 | Ch6 Hana: "We found it together. I'm not stopping now." / "You didn't wait for me then either. I'm here anyway." (Q3, smallest scale) |
| Bus fare | `ch1_fare_source` = `hana_loan` / `activities_jar` / `earl_gift` | money | Ch6: repay prompt (loan), or Hana mentions bingo prizes were cancelled in December (jar; `hana` −1 when she connects it). Ch9 Penner (jar only): "Even the bingo money." (Q1, smallest scale) |
| The AMA form | `ch1_signed_name` = `seo_jin` / `daniel_ahn` | Pike's reaction | Ch2 collector's opening line ("Mr. Pike's real upset about your little signature" / "You signed his name, Daniel. Get in the van."). Ch9 Penner: "That's when we started paying attention." Ending Two: Hana's complaint cites the signature. |

## Chapter ending and state handed on
- Ending beat: the bus window reflection over the snowy city. Thought: "*She charted what she saw. Somebody else charted what they wanted.*" Card: `An address: 412 Kessler Avenue.`
- **Completion screen:** background is the name card with `AHN, DANIEL` struck through in Hana's pen and `SEO, JIN` written above it. "Someone is still controlling his life." What you did, in plain words.
- **Handed on:** evidence `ev_name_card`, `ev_current_file`, `ev_transfer_form`, `ev_intake_whiteout`, `ev_property_tag`, `ev_whitlow_note`, `ev_pike_card` (+ `ev_earl_testimony` if done); memories `mem_waistband`; items: Hana's card (enables `q2_call_hana`), Earl's radio, the `AHN, DANIEL` name card; money $5–$20 less a $1 fare; training levels ≤ 1; body `jin_street` (no knuckles), walk/run/jump; punches return in Ch2's first exchange.



# Chapter 2 — No One Waiting

**Card:** `No One Waiting` · `Eastgate · Wednesday, December 18, 1996` · bell: muffled, a touch clearer than Ch1.

## Date, mood, palette, weather
- Wednesday, December 18, 1996: 3:10 PM (the 14 arrives) → dusk at 4:40 (streetlights) → Iron Pulse after 9 PM → the alley (~9:45 PM) → YMCA Room 312 (~10:20 PM).
- Mood: recognition turning to absence; a long quiet afternoon; a dusk that lights one lamp at a time; then a night with teeth.
- Palette: the Ch0 street repainted cold. Blue-gray slush, brick darkened by wet, wet black asphalt with broken amber reflections. Warm windows (Sunny's, Mrs. Okafor's kitchen, Han's Market) are the islands. Iron Pulse's pink-and-teal neon on Marsh B.C.'s old brick is the one unwelcome colour.
- Weather: overcast; the morning's thin first snow already gray in the gutters; sleet turns to fresh snow at dusk and falls heavier in the alley's light cones. A red-kettle volunteer's hand bell outside Han's (first time heard, Jin's thought: "*Bells.*").

## Gameplay identity
**Walk through what's gone.** Free exploration of the street the player saw in Ch0's gold, now in winter with other people's lives in it. One long conversation, room to sit, a reunion and a haircut, then the first street fight, where speed works and power doesn't.
- Exploration 35% · dialogue 25% · investigation 10% · combat 20% · cinematic 10%.
- Target length: 20–25 min.
- **No hostile exists anywhere on Kessler Avenue.** The fight is attached to Pratt Alley and starts only after the Okafor scene, Teddy, and the player choosing to walk to the YMCA.

## Locations

### `kessler_ave_1996` — Kessler Avenue, December (2400 × 360; same geometry as `kessler_ave_1994`)
Same left-to-right layout as Ch0 so the player can compare. Differences, by block:
- **Kessler & 5th.** Bus sign `14 · SERVICE REDUCED · LAST BUS 10:50 PM`. The payphone still works. The **poster wall** is three layers deep over Jin's poster. The hydrant is capped. A bus shelter bench (sit spot).
- **Han's Market** (green awning). A clean rectangle on the glass where `GO JIN!` was taped. The red-kettle volunteer outside. **Sunny's Diner**: same booth, a `PIE $1.50` sign, tinsel; in the lower corner of the window a **sun-faded MISSING flyer**, taped at four corners and once more across a tear.
- **412 Kessler.** The stoop unswept; the geranium coffee can holds only snow; Mrs. Okafor's lawn chair folded and chained to the railing. The buzzer panel reads `3B — NOVAK`. The 3B window has a paper snowflake cut by a child.
- **Pratt Alley mouth** (open now).
- **Iron Pulse Fitness.** Same building painted gray, pink-and-teal neon, a vinyl banner `JOIN NOW · NO INITIATION FEE` where the bedsheet `GOOD LUCK JIN!!` hung; the old hand-painted glove ghosts through the white paint above the sign.
- **River end.** A snowed-in sedan where Teddy's wagon used to be.
- **The gray panel van** (see `ch1_pike_stance`): parked across from 412 with its wipers going every 6 s, or absent until dusk.
- Background: Ashgrove Tower finished, a crown of white lights; the Foundry stack; heavy sky.
- Light: 3 PM flat gray; streetlights come on one by one at dusk; night is amber pools on wet black. Sound: snow hush, tyres on slush, the kettle bell, a bus kneeling, aerobics music thumping from Iron Pulse until 9.
- Exits: 412 door → `kessler_412_stairs_1996`; Sunny's door → `sunnys`; Iron Pulse door → `iron_pulse` (front until 9 PM; the side door after); Pratt Alley mouth → `pratt_alley`; right edge → Front Street (locked until after the alley: "*Through the alley's quicker.*"). Map nodes shown but locked with Jin's own reason: **Garrison Street** ("*Not yet.*"), **City Hall Annex** ("*Closed. And I'm not ready.*").

### `kessler_412_stairs_1996` — 412 stairwell (320 × 720, three landings)
Mailbox 3B: `NOVAK` on a label-maker strip; under it, Min's handwriting `NO MENUS PLEASE` still shows. A child's mitten on the 2nd landing. 3A: the straw wreath is a Christmas wreath. 3B: a plastic Halloween skeleton still taped to the door in December, a child's boots on the mat. Exits: street, 3A (`okafor_3a`), 3B (doorway only).

### `okafor_3a` — Mrs. Okafor's apartment (640 × 360)
Door → plastic-covered sofa with a crocheted throw → church calendar → a radiator that clanks → kitchen table with a lace cloth, a kettle → a photo wall: one frame shows **Umma and Mrs. Okafor at a church supper, 1993**, both holding dishes, Umma's with blue cornflowers; another is **Jin's 1994 walk-out**, blurred, the ring lights white ("Min gave it to me. She said it was the only one where you didn't look arrested."). Light: warm lamplight, the window going dim. Sound: gospel radio low, the radiator.

### `sunnys` — Sunny's Diner (960 × 360)
Door (a small brass bell over it: thought, "*Not that one. A smaller one.*") → counter and stools (Rita with a coffee pot) → **the booth by the window** (sit spot) → TV on a bracket (a commercial: "Ray Castell defends at the Civic — March — tickets on sale now") → kitchen pass-through (Augie the cook). Warm amber, grill sizzle.

### `iron_pulse` — Iron Pulse Fitness (1200 × 360)
Front desk (a teenage receptionist in a visor; dark after 9) → Stairmasters and Nautilus machines (under covers after hours) → the glass aerobics room → **where the ring stood, a 300 px rectangle of brighter floorboards**, and on the back wall older paint showing through a bad gray coat: `HANDS UP / CHIN` (the rest painted over) → door `STAFF` → **the back room**: Teddy's cot, a hot plate, one heavy bag Teddy kept and hung from a pipe, a cracked mirror, the old taping bench, a locker with a box on top marked `SEO — DON'T TOSS`, Teddy's hair clippers. After 9 PM only the back room is lit.

### `pratt_alley` — Pratt Alley and the 412 roof (1600 × 560, two layers)
Ground, left → right: Kessler mouth → Sunny's back door (Augie smoking on a milk crate) → dumpsters (green-gray) → the laundromat's dryer vent puffing steam → **a single streetlight pool at the centre over a brick wall with torn posters** (the art-reference shot; the fight stage, x 600–1300) → Han's delivery bay (Tomas unloading soda cases) → the far mouth to Front Street, where the van backs in. Upper layer: the 412 fire escape (one-way platforms at y 220 and 150; a ladder at x 820) up to **the 412 roof**: tar paper, the water tank on legs (scratched in its paint: `J + M 1989`), antennas, **two old lawn chairs** at the parapet (sit spot) facing the skyline with the Civic dome far off. Fire escape blocked during the fight ("*Not while they're between me and the ladder.*").
Light: one amber streetlight cone, caged bulbs over the back doors, snow in each cone; the van's headlights. Sound: dryer vent, a radio playing a Christmas song in Spanish from an upstairs window.

### `ymca_312` — Calder YMCA, Front Street: lobby and Room 312 (900 × 360)
Lobby: front desk (Otis, 60s, cardigan, police scanner murmuring), a payphone, a corkboard of swim schedules, a wall clock → stairs → Room 312: a cot, a radiator that clanks but works, a chair, a Gideon Bible, a window onto the river and the lit tower. **Jin's base for Ch2–4** ($8/night). A wall above the cot where Jin pins things: the **evidence wall** (each new evidence card adds a pinned paper; the place tells the investigation's progress).

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `petra` (Petra Novak, 35, Calder Transit driver; daughter Rosie, 3) | 3B door, chain on, Rosie on her hip | holds the door; `armsCrossed` | "We've been here since July '95. Management said the last people moved out." / "Stuff kept coming for 'Seo'. I couldn't throw it out. That felt wrong." | Rosie: "Is he Santa?" | Ch9: Rosie's height mark |
| `okafor` (Grace Okafor, 66) | 3A | at her door with keys; then sitting | see scene 2.2 | — | `ch0_purse_dream` |
| `rita` (Rita Mancuso, waitress since 1981) | Sunny's counter | `work`, coffee pot | "Coffee's on the house. You look like the weather." / "She sat in that booth with her envelopes. Every Saturday." | "Pie's from yesterday. Still pie." | — |
| `augie` (Sunny's cook) | Sunny's kitchen; alley back step | `smoke` on a crate | (during the fight) "Hey! HEY! I'm calling somebody!" (he does; nobody comes) / after: "...You want some coffee?" | — | fight |
| `teddy` | Iron Pulse: mopping the aerobics room before 9 (gray `IRON PULSE` vest, doesn't look up); the back room after 9 | leaning on a push broom; `armsCrossed` | see scene 2.4 | (before 9) "We close at nine." | `ch0_told_teddy` |
| `receptionist` | Iron Pulse desk | chewing gum | "Membership's nineteen a month. You look like you need it." / "The old guy? Mr. Marsh? He sold it to my boss. He mops. He comes in at nine and just looks at that wall." | — | — |
| `tomas` | Alley delivery bay | `carry box` | "Not my business, man. Not my business." | — | keeps working through the fight, eyes down |
| `benny` (Benny Szabo, 38, `collector`) | The van; the alley | leaning on the van | "Daniel Ahn? Mr. Pike's worried sick. Let's get you home." / if `ch1_signed_name = seo_jin`: "Mr. Pike's real upset about your little signature." | — | `ch1_pike_stance` (timing), `ch1_signed_name` |
| `carl` (Carl Dunphy, `collector`) | The van | `armsCrossed` | "Pike said you'd say that." | — | — |
| `vic` (the driver, `thug`) | In the van, then out | — | "Just grab him, Carl, it's freezing." | — | — |
| `otis` | YMCA desk | `sit`, scanner | "Lim called ahead. First week's paid. Room 312. Radiator's loud, it means it's working." | — | Ch3: "A Ms. Lim called." if `ch2_called_hana` |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i2_poster_wall` | Poster wall (verb `Peel`, ×3) | Layer 1 `IRON PULSE FITNESS — NEW YEAR NEW YOU $19/MO`: "*Nineteen dollars a month to look at my old gym.*" Layer 2 `THE RUST BELT REVUE — LIVE AT STARLITE LANES — FRIDAYS` (seeds Ch3). Layer 3 `ASHGROVE TOWER · NOW LEASING · LIVE ABOVE IT ALL`. Then the 1994 poster, torn across the face: "*Two years of other people's Fridays on top of my Saturday.*" | `ev_fight_poster` |
| `i2_flyer` | MISSING flyer (Sunny's window) | Doc: `MISSING · JIN SEO, 26 · Boxer · Last seen Calder General Hospital 8/22/94 · He did NOT "leave town." · Please call Min: 555-0143 (eves) or ask at Sunny's.` A photocopied photo of Jin in his track top. "*She wrote the phone number twice. Bigger the second time.*" | `ev_missing_flyer` |
| `i2_mailbox` | Mailbox 3B | "*NOVAK. Under the sticker, Min's writing. NO MENUS PLEASE.*" | — |
| `i2_3b_doorway` | 3B, from the doorway | Camera over Jin's shoulder at 1.4: yellow walls, a high chair where the table was, the same window. "*Same window. Different everything.*" | — |
| `i2_height_marks` | Doorframe (only if Petra lets him look) | "*She painted until she reached the names. JIN 8. MIN 4. JIN 12. The rest is white.*" | `ch2_saw_height_marks` |
| `i2_okafor_photo` | Framed photo (3A) | "*My walk-out. The lights went white. Min took it from Section 14.*" | — |
| `i2_ring_floor` | Bright floorboards | "*Sixteen by sixteen. That's where the ring was. They sanded around it.*" | — |
| `i2_old_paint` | Old paint | "*HANDS UP / CHIN. Teddy painted that in '79. He said the third part didn't need a sign.*" | — |
| `i2_seo_box` | Box: SEO — DON'T TOSS | (scene 2.4) old hand wraps, a 1993 team photo, Jin's amateur belt, and the navy robe with `EASTGATE` on the back. | — |
| `i2_taping_bench` | Taping bench (sit) | Memory. | `mem_first_wraps` |
| `i2_tank_ladder` | Water tank ladder | `J + M 1989`. "*She did the M. I did the plus sign and got in trouble for both.*" | — |
| `i2_roof_chairs` | Lawn chair (sit) | Sitting eases the camera out to the whole skyline; time passes; snow thickens. Memory. | `mem_roof` |
| `i2_bus_bench` | Bus shelter bench (sit) | Memory. | `mem_umbrella` |
| `i2_booth` | Booth by the window (sit) | Coffee on the house. Thought: "*Min paid for pie here once and came up forty cents short. We split it anyway.*" | — |
| `i2_knuckles` | Brass knuckles (in the alley) | `Pick up`. | gear `knuckles` |
| `i2_benny_vest` | Benny's vest (after the fight) | Doc: the pickup slip. | `ev_pickup_order` ★ |
| `i2_payphone` | Payphone (YMCA lobby) | `q2_call_hana` | — |
| `i2_window_312` | Window, Room 312 | "*The river. That tower again. It's in every window in this city.*" | — |

**Memories (Ch2):**
- `mem_roof` — Fourth of July 1993, the two lawn chairs. **Min:** "When you're champion, buy a building with a roof that doesn't leak." **Jin:** "This roof leaks?" **Min:** "Everything leaks, Jin. You've just never been home when it rains." (Echoed at the Foundry Courts roof in Ch5.)
- `mem_umbrella` — after his first amateur loss, Umma at this shelter with two umbrellas: "You lost. Okay. Umbrella."
- `mem_first_wraps` — Teddy wrapping a fourteen-year-old's hands on this bench: "Hands up, chin down, mouth shut. In that order."

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q2_main` | main | `Go home. 412 Kessler Avenue, 3B.` → `Ask someone who'd know.` → (after Okafor, the HUD hides itself) → `Iron Pulse. Teddy sweeps it at night.` → `Find a bed. Hana's card: Calder YMCA, Front Street.` → (alley) `Ask him who sent them.` → **`Find the man who was supposed to protect you.`** | 3B knocked; Okafor's account; Teddy scene; alley; slip taken; Room 312 | `ev_okafor_account`, `ev_pickup_order`, knuckles, base |
| `q2_posters` | side | `Peel back the poster wall.` | three peels | `ev_fight_poster` |
| `q2_roof` | side (a `…` marker on the fire escape ladder; no HUD text) | — | climb to the roof and sit | `mem_roof`; teaches the fire-escape layer and gives the player a quiet place to put the news down |
| `q2_call_hana` | side | `Call Hana. Before 7 or after 9.` | YMCA lobby payphone | `ch2_called_hana`, `hana` +1 |

## Scripted scenes

### 2.1 Arrival
- Bus vignette (side view, the city sliding by, Jin's reflection in the glass). The 14's doors fold open; Jin steps down. The camera starts at **0.85** with Jin small at the stop and the street running both ways into sleet; over 6 s of the player walking it eases to 1.0. **No music at all until the roof or the booth.**
- Thought: "*Same street. Somebody moved all the furniture.*" Objective: `Go home. 412 Kessler Avenue, 3B.`
- No one on the street recognises him (two years, the scar, a thinner man in an old track top). If `ch1_pike_stance = insisted`, the gray van idles across from 412 from the first frame and never moves: dread without interruption.

### 2.2 3B and Mrs. Okafor (key scene)
1. Jin climbs (a delivery man has propped the street door). At 3B, a knock. **Petra Novak** opens on the chain, Rosie on her hip. "Can I help you?" **Jin:** "I lived here. Jin Seo. My mother, Mi-ok Seo. My sister." **Petra:** "We've been here since July '95. Management said the last people moved out. I'm sorry."
2. **Choice** (no wrong answer):
   - "Could I just see the kitchen? From here." → She looks at Rosie, opens the chain. Jin stays in the doorway (the player can move only within the doorway's 60 px). The doorframe: `i2_height_marks`. **Petra:** "I painted it in the summer. When I got to the names, I didn't know what to do. So I stopped." **Jin:** "Thank you for stopping." Sets `ch2_saw_height_marks`.
   - "Never mind. Sorry." → she nods through the gap.
   - Either way, after a beat: **Petra:** "Stuff kept coming for 'Seo'. I didn't know where to send it and I couldn't throw it out." **Choice `ch2_took_mailbox`:** "Can I have it?" (a shoebox of mail: `ev_returned_letter`) / "Keep it. It's fine." **Petra:** "Mrs. Okafor across the hall. She'd know. She's been here forever."
3. Across the hall, 3A opens. **Mrs. Okafor**, coat half on, keys in hand. She sees him. **Her keys drop.** The camera holds the two-shot across the hall at 1.15; the gap between them is the whole width of the landing.
   - **Okafor:** "Jin?" [beat 1.5] "Jin. Oh, Lord. Oh, Lord, look at you. Come in. Come in before I fall down."
4. **Her kitchen** (full letterbox). She puts the kettle on and sits first. Jin stands until she says "Sit." He sits. The radiator clanks.
   - **Okafor:** "They said you left. The hospital said you checked yourself out and went, and the newspaper said it, and the television said it. Your sister said it was a lie. Every day she said it was a lie."
   - **Jin:** "Where are they?"
   - [beat 2.0. She puts down her cup. The camera eases 1.15 → 1.25 over her next lines, slowly enough not to be noticed.]
   - **Okafor:** "They lost the apartment. May, the year after. They were behind, and the searching cost money, and your mother went to the court herself, in her good coat. In her good navy coat. They went to a rooming house on Garrison Street. Lindell House. I told her it was no place. She said, 'For a little while, Grace.'"
   - **Okafor:** "There was a fire. In February. At night."
   - [beat 1.5]
   - **Okafor:** "Both of them, Jin. Both of them."
   - **[Silence 3.0 s.]** No music, no typewriter. Jin's pose: `head down`. The radiator clanks once. The kettle starts to whistle and Mrs. Okafor doesn't get up for it for 2 s. Then she does, turns it off, and stands with her back to him at the stove.
   - **Okafor** *(back turned)*: "The county buried them. Calder Municipal, Section fourteen. My church put up a cross. Then somebody put up a stone. I don't know who. Not me. I wish it was me."
   - **Okafor:** "Their things. What the fire didn't take, the county boxed. Unclaimed property, at the City Hall Annex. I tried to get them. They said only family." [beat] "Only family. They keep it a year, Jin. Until February."
5. **Choice** (no flag; each option once, then "Stand up" ends it):
   - "Tell me about Umma." → "She hemmed half the church for free that winter so she wouldn't have to sit still." + `ch0_purse_dream` variant: `rent` "She told the whole building you'd have the rent paid off by Christmas. She was so proud she told the *mailman*." / `umma_saturdays` "She said she'd never work another Saturday. She worked every Saturday after." / `new_apartment` "She told everyone about the bathroom lock. She laughed so hard telling it."
   - "Tell me about Min." → "Flyers on every pole in Eastgate. Letters to everybody. She'd come up these stairs with her bag of envelopes and say, 'Mrs. O, today somebody answers.'"
   - "Stand up." →
6. She takes a casserole dish from her cupboard: Pyrex, blue cornflowers, `SEO` on masking tape on the bottom. "This is hers. She brought me japchae in it the week before... I never gave it back. I kept meaning to." (`bel_dish`.) Jin holds it in both hands (carry pose; "*Hands full.*" if punch is pressed); it goes to his inventory on the street.
7. At the door: **Okafor:** "Teddy Marsh came up these stairs twice asking for you. He sweeps that gym at night now. You go see him. And you come back. You hear me? You come back up these stairs." `ev_okafor_account` ★ is added **silently** (badge only, no toast). The objective HUD **hides itself**.

### 2.3 Room to breathe (no enemy anywhere; the PDF's rule)
- Control returns on the landing with `muffle 0.3` for 20 s. The minimap drops to partial. Sit glints appear on the 412 stoop, the bus-shelter bench, Sunny's booth and (via the alley fire escape) the roof chairs. Every sit spot has 2–3 short thoughts:
  - Stoop: "*Garrison Street. February. I was on Hillcrest in February, counting ceiling tiles.*" / "*Her good coat. The navy one with the big buttons.*"
  - Bus bench: `mem_umbrella`.
  - Sunny's booth: Rita brings coffee without asking. "She sat in that booth with her envelopes. Every Saturday. I gave her the refills free and she tipped me anyway, the stubborn thing." Thought: "*Every Saturday. In this booth.*"
  - Roof: `mem_roof`, then "*I kept thinking they were somewhere I hadn't looked yet.*" (after 20 s) "*Garrison Street. I don't even know what it looks like.*"
- **The first sit passes time:** the camera eases out to 0.8 and holds 6 s while dusk falls; **the seven streetlights of Kessler Avenue come on one by one, 0.4 s apart, from the bus stop to 412**, and the snow starts. If the player never sits, dusk still falls as he walks and the streetlights still light one by one as he passes under them. The image is withheld from no one.
- If `ch1_pike_stance = played_along`, the gray van turns onto Kessler at dusk, headlights on, and parks across from 412. No comment.
- The objective returns when the player leaves a sit spot or after 90 s: `Iron Pulse. Teddy sweeps it at night.`

### 2.4 Iron Pulse: Teddy, the haircut, the box (key scene)
1. Before 9 PM Teddy is mopping the aerobics room and doesn't look up; the receptionist says they close at 9. Sitting in the booth or on the stoop passes time to 9.
2. After 9, the side door; the back room. Teddy on his cot eating soup from a can. Jin in the doorway. Teddy looks up. **He stands too fast and the can tips over.** [beat 2.0] **Teddy:** "...Kid?"
3. **Teddy:** "They said you walked out of Calder General. I went there. I *went* there, Jin. They said 'discharged.' Then the Fund fella, Pike, he told me you didn't want visitors." *(sits back down, hard)* "I sold the gym. I couldn't walk in the door. Now I walk in it every night with a mop."
4. **The haircut.** "Sit." Jin sits on an upturned bucket facing the cracked mirror; Teddy stands behind him with the clippers. Staging device: Teddy talks while cutting so he never has to look at Jin's face; the camera holds both **in the mirror** at 1.2. The two-block returns in three steps during the conversation (the sprite updates each step).
   - **Teddy:** "I've said this to that mirror every night for two years, so I'll say it to you. Your eyes were swimming in the second. I saw it. You told me something was wrong and I called it nerves, because the other thing meant stopping a title fight, and I'd waited thirty years for one." `mem_corner` shard 2.
   - If `ch0_told_teddy`: "And you told me about the coat. You *told* me, and I said we win anyway." Else Jin tells him now. **Teddy:** "You never said a word about a coat? Jesus, kid. And I sent you out."
   - **Choice `ch2_teddy_tone`:**
     - "You sent me out." → `blamed`. **Teddy:** "Yeah." *(keeps cutting)* "Yeah, I did." `teddy` −1.
     - "Who else was in my corner? Who did the water?" → `asked`. **Teddy:** "Lenny. Lenny Voss did the bucket and the bottles. Said you were fine. I wanted you to be fine. He quit the week after. Took his kit and went." `teddy` +1.
     - "You didn't put anything in me." → `forgave`. Teddy stops cutting. [beat] "Don't do that. Don't make it easy." He resumes. `teddy` +2.
5. **The box.** Teddy takes it down: masking tape, `SEO — DON'T TOSS`. Old hand wraps, a 1993 team photo, the amateur belt, and the navy robe with `EASTGATE` across the back. **Teddy:** "Your mother sewed those letters. I couldn't throw it out and I couldn't look at it." Jin touches the crooked G and puts the robe back. "*Not yet.*" (It returns in Ch8.)
6. **Teddy:** "Bag's still on the pipe. After nine, you come hit it. I'll hold mitts if you want." Iron Pulse after hours becomes a training place (bag, mitts, footwork; cap 1 this chapter). "YMCA on Front Street's eight a night. Cut through the alley, it's quicker. Go."

### 2.5 The alley (the art-reference shot, then the van)
1. Entering Pratt Alley at night: a short framing (thin letterbox, 4 s; the player can still walk): wide at 0.9 of the brick wall with torn posters, the dumpster, the fire escape, the single streetlight. If the player presses nothing, Jin stops in the cone and leans on the wall, hands in pockets, one knee bent (`leanWall`): the game's key image. Augie smokes on Sunny's step; Tomas unloads cases.
2. Headlights sweep the far wall. The gray van backs into the Front Street mouth and stops, blocking it. Camera pulls back to frame the whole alley: van at right, Jin centre, the back doors and people at left. Benny and Carl get out; Vic stays at the wheel.
   - **Benny:** "Daniel Ahn? Mr. Pike's worried sick. Let's get you home." (variant if `seo_jin`)
   - **Jin:** "I'm not Daniel."
   - **Carl:** "Pike said you'd say that."
   - Benny reaches for Jin's collar: a slow two-arm grab, the first telegraph the player sees. Letterbox off.

## Encounters

### E2.1 Pratt Alley (`A.fight`; arena x 600–1300; `maxAttackers: 2`)
Body: `jin_street`, power 0.55 bare / 0.80 knuckles, winded state on. **New this chapter: dash forward and backdash (1 charge, a single pip), jab–cross, slip against slow committed attacks.** Checkpoints: the van's arrival; after the knuckles pickup. Loss: Jin is shoved toward the van doors, fade, retry ("*They nearly had me. Again.*").
- **Phase 1, bare hands (40 s or 3 landed counters).** Benny and Carl (`collector`: big, slow haymakers with a 0.6 s windup and a glint on the fist; a two-arm grab when Jin is close in front; poor recovery). Teaching in motion: the first haymaker shows the backdash glyph once; the first grab shows the dash-through glyph once. Thought lines carry the lesson: "*Big. Slow. Move.*" / "*He missed. That's the opening. Two punches, not five.*" **But his punches don't put them down:** each collector's thin poise outline refills 1.5 s after Jin stops hitting. **Benny** (shrugging off a combo): "That all you got, Danny?" Thought, first refill: "*I can hit him all night. He doesn't feel it.*" Winded (no meter; the movement spec keeps ordinary punches free of stamina): after ~6 s of continuous close exchange without a break Jin's shoulders heave, small breath puffs appear, his punch damage drops 25% and the dash recharges 50% slower until he spends 1.5 s out of reach; tip, once: `Winded. Back off. Let it come back.`
- **The knuckles** (on the third landed counter): Benny staggers and something falls out of his coat. **Slow motion 0.4× for 2 s.** The knuckles skitter across the wet asphalt into the centre of the streetlight pool; camera 1.5 on the brass in the slush; ambient sound drops out. Thought: "*Teddy would throw me out of the gym for this.*" Normal speed. The collectors keep coming. The player must reach them and press `Pick up` (a 0.3 s crouch: a risk). If ignored for 10 s: "*Bare hands won't put these two down.*" Toast on pickup: `Knuckles: more stagger, more damage. Not boxing anymore.`
- **Phase 2, knuckles.** Two 2 px brass glints on Jin's fists; heavier hit-stop; a metallic click on contact; poise breaks. Vic climbs out (`thug`, light, can be interrupted). Teaches: dodge one committed swing while the other approaches; dash out from between them. Carl and Vic stumble back into the van, which peels out with its door open. Benny stays down against a dumpster.
- **Bystanders** stay outside the arena band and are never hostile or hittable (punches pass through non-hostiles): Augie stands and backs against his door ("Hey! HEY! I'm calling somebody!"; he does; nobody comes); Tomas keeps stacking cases ("Not my business"); a woman on the fire escape pulls in her frozen laundry and herself.

### Questioning Benny (full letterbox; Jin crouches in the streetlight pool; snow heavier)
- **Benny:** "Okay. Okay! It's a job. The Fund pays to bring the strays back. You're a stray."
- **Jin:** "Who pays you?"
- **Benny:** "Pike don't hire guys like us direct. Lenny does. Lenny Voss. Little guy, cutman. He does the cuts at the Cellar now, under Starlite Lanes, out on Route 9. He gets the envelopes from Pike's office, takes his piece, passes 'em down. I never even met no Pike."
- Thought, with a 0.5 s memory-filter flash (a taped wrist, white plastic): "*Lenny. Lenny was in my corner.*"
- Jin takes the slip from Benny's vest: `ev_pickup_order` ★.
- **Choice `ch2_collector_after`:**
  - "Get up. Go home." → `let_go`. Benny gets up holding his ribs and backs out of the alley. "...You're not what they said."
  - `[Hit him again]` → `hit_again`. One more punch, framed wide (0.9); the sound is wrong (muffled, no spark, no hit-stop). Augie, in the doorway, goes inside and locks the door, audibly. Thought: "*That one wasn't for information.*"
- Augie (if `let_go`): "...You want some coffee?" He brings a towel packed with snow for Jin's hand.

### 2.6 Room 312
1. Front Street, snow heavier. YMCA lobby: Otis, the scanner. "Seo? Lim called ahead. Hana Lim sends people sometimes. First week's paid. She said you'd argue, so I'm not listening." (From Ch3 the room is $8/night, charged on each chapter card.)
2. Optional lobby payphone (`q2_call_hana`). The lobby clock reads 10:20 (after nine, as her card says). In later chapters, if the clock reads 7–9, Otis: "Shift change up there. Try after nine." (sitting in the lobby passes time).
   - **Hana:** "Jin? You're alive. Good. Did you find them?"
   - (the dialogue box shows "...")
   - **Hana:** "...Oh. Oh, Jin. I'm sorry." [beat] "I'm keeping the copy somewhere safe. Call me anyway. Even if there's nothing to say." `ch2_called_hana`, `hana` +1.
3. Room 312. Jin sets the dish on the chair, takes the knuckles out of his pocket and turns them over. The radio from Earl on the sill. Sit on the cot: the camera eases out to the window, the lit tower, snow. Thoughts: "*Their things are in a room downtown until February.*" / "*Not yet. I can't open those boxes yet.*" / "*First the man who was supposed to protect me.*"
4. Objective: **`Find the man who was supposed to protect you.`** (PDF wording.)

## Choices made here
| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Ask to see the kitchen | `ch2_saw_height_marks` (bool) | memory text | Ch9 night: Petra has added "ROSIE 3" in pencil beside the old marks. |
| Take the mail | `ch2_took_mailbox` (bool) | `ev_returned_letter` now | Ch6: if not taken, the same letter is in the Annex mail-return bin. |
| Talk to Teddy | `ch2_teddy_tone` = `blamed` / `asked` / `forgave` | `teddy` −1 / +1 / +2 | Ch4 Teddy holds mitts and teaches the dash straight either way (warm if `teddy ≥ 1`, curt if not); Ch8 Teddy is in the corner if `teddy ≥ 2`. |
| After Benny names Lenny | `ch2_collector_after` = `let_go` / `hit_again` (Q4) | Benny walks or doesn't; Augie's door | Ch3 Lenny: "Benny says you let him walk. Says you're a gentleman." / "Benny's got wires in his jaw. They put *wires* in, kid." Ch6 Benny at Pike's stairwell steps aside or is absent (hospital). Ch10 Benny on the crew steps aside or fights. `harm_count` +1 if `hit_again`. |
| Call Hana | `ch2_called_hana` (bool) | `hana` +1 | Ch3 Otis: "A Ms. Lim called. Said eat something." |

## Chapter ending and state handed on
- Ending beat: Room 312, the knuckles on the chair beside Umma's dish, snow on the window, the radio low. The camera eases out to 0.85 and holds 3 s. Fade.
- **Completion screen:** background is the layered poster wall with the torn 1994 poster showing through. "Finding answers becomes personal revenge." What you did: "You stood in the doorway of 3B." / "You let the collector go." etc.
- **Handed on:** canonical look (track top, two-block hair, scar); movement 100%; dash 1 charge; jab–cross; slip; knuckles gear; winded state on; base `ymca_312`; Iron Pulse training after hours; evidence `ev_okafor_account`, `ev_pickup_order` (+ optional `ev_fight_poster`, `ev_missing_flyer`, `ev_returned_letter`); belongings `bel_dish`; memories `mem_corner` shard 2, `mem_roof`, `mem_umbrella`, `mem_first_wraps` (optional); money $4–$19 (Hana prepaid the first week; from Ch3 the room is $8/night); map: **Route 9 — Starlite Lanes** unlocks; bus travel enabled.



# Chapter 3 — The Price of Admission

**Card:** `The Price of Admission` · `Starlite Lanes, Route 9 · Thursday, January 9, 1997` · bell: muffled but with an edge now; its ring is answered by a strike on lane 16 (pins crashing), which bridges into the card. Before the card, a time card: `Three weeks. The Cellar was dark for the holidays.`

## Date, mood, palette, weather
- Thursday, January 9, 1997, 7:10 PM (tryout night) → Friday, January 10 (rest day, optional) → Saturday, January 11, 10:40 PM (the card) → Sunday, January 12, 1:50 AM (the loft).
- Mood: loud, smoky, transactional, oddly friendly. Everyone down here has a reason, and none of the reasons is evil. The first chapter where Jin is good at something again, in a room that makes him ashamed of it.
- Palette: outside, sodium orange over plowed snow; the Starlite star sign in pink and teal with three of its eight points dead and the `L` out (`STAR ITE LANES`). Upstairs: honey-wood lanes, glowing pin decks, orange-and-teal carpet; on Saturday "Cosmic Bowl" turns it blacklight purple. Downstairs: green-painted cinderblock, one green-shaded lamp over the ring, a red `EXIT`, blue cigarette haze. The Cellar is the warmest-coloured room since the Ch0 kitchen, and the warmth should feel slightly wrong.
- Weather: hard dry cold Thursday; sleet Friday (the YMCA window streaks); clear and windy Saturday with frost glittering in the sign's light.

## Gameplay identity
**Earn the room.** A two-floor building the player learns by talking to the people in it, three short ring bouts against trained opponents who each fight for a different reason, an office to look through when nobody's watching, and a frightened witness at the end who can be heard out or broken. All combat is in the ring, under house rules, in gloves (the knuckles go in Jin's pocket: "No metal in my ring.").
- Exploration 15% · dialogue 30% · investigation 15% · combat 30% (three bouts) · activities 10% (footwork ladder, bag, slip-rope).
- Target length: 22–25 min.
- **New this chapter:** second dash charge (Thursday), the reliable slip → counter-cross (Thursday, confirmed in bout 1), the hook (Saturday). Trained enemies: punish repeated jabs, keep distance, feint, leave different openings after different misses (PDF list).

## Locations

### `starlite_lot` — Route 9 and the Starlite parking lot (1400 × 360, exterior, night)
Left → right:
- **0–200 Route 9 bus shelter.** Plexiglass scratched with initials; ad panel `CALDER SAVINGS · WE SAID YES TO 1,000 CALDER FAMILIES` (paid off in Ch7: the bank said no to Rook four times; and on Lenny's tape).
- **200–900 the lot.** Two sodium poles, plowed banks, Mo's white Cadillac Seville (plate `MO 1`), a pickup with a bowling bag on the seat, and **Slim's brown '78 Buick Electra** with a pillow and a folded blanket on the back seat and a child's drawing of a horse on the dashboard. The sign pole at x≈720: the star, letter board `THURS TRYOUTS · SAT COSMIC BOWL · CONGRATS GARY 300`.
- **900–1250 building front.** Glass doors fogged at the bottom. In the window a curling poster: `NORTHSIDE COMMUNITY COUNCIL HOLIDAY TOY DRIVE · THANK YOU CALDER!`, a photo of a broad gray-haired man in a canvas work jacket and Mo in a satin jacket holding a box of toy trucks between them. (Rook's first appearance, unnamed, as a benefactor.)
- **1250–1400 loading alley.** Dumpster, grease barrel, a steel door with a painted star: `DELIVERIES · FIGHTERS USE THIS DOOR`.
- Background: Route 9 overpass, a motel sign `VACAN Y`, far off Ashgrove Tower's white crown.
- Light: sodium pools; the sign throws pink on the snowbank. Sound: Route 9 traffic, the sign's transformer buzz, pins crashing through the wall.
- Exits: bus shelter → world map (Route 9 bus, $1); front doors → `starlite_lanes`; fighters' door → `cellar` (before Mo has met Jin: "*Fighters' door. Mo hasn't met me yet.*").

### `starlite_lanes` — Starlite Lanes, upstairs (1800 × 360)
Left → right: entry mat and the Council toy-drive box (empty, a marker sign `412 TOYS DELIVERED! — N.C.C.`) → **shoe counter** (Peg; cubbies of rental shoes; a can of disinfectant; sign `SHOES MUST BE RETURNED. WE KNOW WHO YOU ARE.`) → the **Star Bar** (horseshoe counter, a TV on Channel 6, a jar of pickled eggs, a **trophy case**) → **lanes 1–16** seen side-on in shallow perspective, pin decks glowing at the far end, overhead score screens with league names → at lane 16, door `STAFF — PINSETTERS` (to the loft) → beside the shoe office, a narrow stair marked `STAFF` down to the Pit.
- Light: warm tungsten, homely; Saturday after 10 PM blacklight purple with glowing pins. Sound: pins crashing every 3–5 s, ball returns rumbling, league banter, a jukebox (soft rock).
- Exits: front doors ↔ lot; `STAFF` stair ↔ `cellar_pit`; `STAFF — PINSETTERS` ↔ `pinsetter_loft` (locked: Thursday "*Locked. From the other side.*"; Saturday until the card ends: Tiny is sitting on the step, "Card first.").

### `cellar_pit` — The Pit, the fighters' room (1000 × 360)
Left → right: stair foot → three cots along the wall (Slim's, his gym bag on it, a snapshot wedged in the frame; Deshawn's, made tight, a Walkman on the pillow; an empty one with a bare mattress) → **heavy bag** on a chain from a beam → **slip-rope** strung at head height → **floor-tape footwork ladder** → Mo's **house rules** on a shirt cardboard → **"MO'S WALL OF FAME"**: forty Polaroids, seven marked `moved on` in Mo's hand → a cracked sink, a mini fridge, a **space heater with a scorched cord** → a stool facing a cracked mirror → frosted-glass door `M. FEENEY · PROMOTIONS` (`cellar_office`) → curtain to the Cellar.
- Light: two bare bulbs and the heater's orange coil. Sound: the heater ticking, pins thudding through the ceiling, Deshawn's Walkman leaking a beat.

### `cellar_office` — Mo's office (480 × 360)
Desk with **the card book** (green ledger), a gray cash box, rotary phone, a bowling-pin lamp; a filing cabinet with a drawer labelled `TAPES` (Mo videotapes main events "for highlights"); a boombox; framed photos of Mo with a weatherman, a minor-league pitcher, and the toy-drive man again; a wall calendar `HARLAN FREIGHT CO. · WE MOVE CALDER · 1997` (January: a truck on a bridge). The first time the depot's name is seen, before anyone says it.

### `cellar` — The Cellar (1280 × 480; the low ceiling is the underside of the old lanes 17–24)
Left → right: the Pit curtain → a plywood bar with two coolers and an honour box (`BEER $2 · BE HONEST · MO IS WATCHING`) → **Mo's chalkboard** of the card and odds → **the ring** (x 500–920, **420 px**, smaller and lower than the Civic; ropes wrapped in duct tape; corner posts taped **blue on the left, red on the right**: "Ghosts go in the blue. Tradition." — Mo) → folding chairs three deep, standing room on beer crates → **Mo's card table** at ringside left with the cash box and **the Cellar's bell: a chrome hotel desk bell screwed to a plank**, which Mo slaps with his palm → the slanted cellar doors up to the loading alley.
- When someone bowls a strike upstairs, the ceiling thunders and dust sifts through the ring lamp (a timed particle burst; recurring cue).
- Light: the green ring lamp, a string of bare bulbs, red EXIT. Sound: crowd (Thursday a dozen; Saturday ~70), cash counted, the ceiling's *thoom*.

### `pinsetter_loft` — Behind the lanes (1600 × 480, two layers)
Ladder up from the `STAFF — PINSETTERS` door → **lower walkway** between sixteen big green pinsetter machines (sweep bars, rotating decks) → ladders at x 420 and 1100 → **upper catwalk** → at the far right, **Lenny's workbench**: a clamp lamp, a coffee can of bolts, a transistor radio on a late-night call-in show, a magazine photo of a fishing boat taped to the wall, the **green tackle box** (his cut kit), a padlocked **gray lockbox**, a cot, and a 1994 calendar still on August.
- After closing, the machines tick as they cool; once, as Jin passes machine 9, its deck cycles by itself with a bang (no damage; a start).
- Light: small work lamps, EXIT glow; the lanes below dark. Sound: cooling motors, the radio.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `mo` (Maurice "Mo" Feeney, 61, promoter) | Pit card table (Thu); Cellar ringside (Sat); office | sits wide, licks a thumb and counts bills, points with an unlit cigar | "The Kessler Kid! Back from the dead, in my basement! That's not a fight, that's a resurrection. People pay for resurrections." / "I don't fix fights. I suggest outcomes." / "Nobody's forced. Everybody's welcome to be broke somewhere else." / "I was at the Civic that night. Row C. Lost two hundred on you. Lost it fair, I figured. Now I'm not so sure. Don't tell me. I don't want to know things on a Thursday." | "Bets close at the bell!" | Never reacts to anything moral. Calls Jin "the Ghost" in public and never says his real name to the room. |
| `lenny` (Leonard Voss, 52, cutman) | Thu: a face in the lane-16 pin deck; Sat: Pit bench, Jin's corner; Sun: the loft | rubs his neck; wipes clean hands on a towel; white tape roll worn on the left wrist like a bracelet; 2 px tremor (1 px in Ch0) | "Big night, kid." (he can't help it) / "I carried a bottle. That's all I did. A guy hands you a bottle, you carry it." / "They said slow. *Slow*, kid." | (to himself, taping) "Over, under, over." | `ch2_collector_after`, `ch3_lenny_water`, `ch3_lenny_method` |
| `deshawn` (Deshawn Tillery, 23) | Pit, skipping rope or on the footwork ladder; ring (bout 1) | `skipRope`; `shadowbox` with headphones on | "You're the guy from the poster? My grandma had five dollars on you. She still says you didn't lose, you got robbed." / "Mo's room is the only ring on the Northside with real ropes. I get a key, I train all week. I fight when Mo books me. Lose the booking, lose the key." / "I live at Foundry Courts. My grandma's building. Best roof on the Northside, they redid it last year." | "Nobody slips it." | `ch3_touched_gloves` |
| `wojo` (Stan Wojcik, 46, forklift driver) | Star Bar, then ring (bout 2) | `drink`, laughing, slaps his own chest | "Oh-and-nineteen! Undefeated in spirit!" / "Why do I fight? I drive a forklift forty hours a week. Down here for six minutes I'm a lion." / (after) "Drinks on me! Not you, Ghost. You're working." | "Hit me pretty tonight!" | Happy either way. Buys Jin a coffee. |
| `slim` (Cyrus "Slim" Whitlock, 34, ex-pro, 22-6 in the '80s) | Pit bench under a towel; sweeps the Cellar for Mo; ring (bout 3) | `sit`, towel over his head | "You're arm-punching on the bag. Don't tell anybody I told you." / "Mo wants you in the second. I go down in the second. Don't make it weird." / "I sleep on that cot because I'm useful. Useful means I fall when Mo says." | — | `ch3_slim_result`, `ch3_covered_slim` |
| `ferris` (Doc Ferris, 70s, ringside doctor; a veterinarian for thirty-one years) | Ringside with a black bag and a penlight | `sit`, penlight | "Follow the light. Good. You're cleared." / "I was a vet. Horses, mostly. Don't make that face, horses are harder." / (Sat, quietly) "You've had a bleed, son. I can see it in how you track. Nobody down here's going to stop you. So you'd better." | — | checks Jin's pupils twice after bout 1 and says nothing the first time |
| `peg` (Peg Halloran, shoe counter) | Shoe counter | `work`, spraying shoes | "Which pinsetter, hon? We got two. One's eighteen and one's Lenny." / "Size? Ten-and-a-half. You look like a ten-and-a-half." | "Shoes back by eleven." | Sat: "Mo says your coffee's on him. Mo has never said that." |
| `tiny` (Bruno "Tiny" Russo, doorman and referee) | Fighters' door; referee in a striped shirt; the loft step after the card | sits, `armsCrossed` | "Admission's free for fighters." / (as ref) "Touch 'em. Or don't. I don't care." / "Card first." | — | keeps Mo's word: holds the loft door for Jin |
| `teddy` (optional, Friday) | Iron Pulse back room after 9 | holding mitts | see scene 3.4 | — | `ch2_teddy_tone` |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i3_toydrive` | Poster (window) | "*Northside Community Council. Mo and somebody's grandfather holding a box of trucks. Everybody loves a toy drive.*" | People: "Northside Community Council — toy drive at Starlite." (The Council's name enters the journal before the player knows what it is.) |
| `i3_buick` | Brown Buick | "*A pillow. A blanket. A horse in crayon on the dash. Somebody lives in this car, or is ready to.*" | pays off after bout 3 |
| `i3_trophy_case` | Trophy case | "*MARSH B.C. BOWLING NIGHT, 1971. Teddy with hair. Mo with a waist. They were friends before I was born.*" | — |
| `i3_pin_deck` | Pin deck, lane 16 | (Thursday) triggers scene 3.1 | — |
| `i3_house_rules` | House rules (Pit wall) | `1. FIGHTERS WHO TRAIN IN MY ROOM FIGHT WHEN I BOOK THEM. 2. NO METAL. 3. NO CRYING ON MY CANVAS. — M.F.` "*Rule one is the only rule.*" | — |
| `i3_wall_of_fame` | Wall of Fame | "*Forty Polaroids. Seven say 'moved on'. One's a younger Lenny with his tackle box, 1989, thumbs up. Moved on. Like I moved on.*" | — |
| `i3_slim_photo` | Snapshot on Slim's cot | Photo: a girl of about eight on a porch in Akron holding a ribbon. Back: `TANYA — 2ND PLACE SPELLING.` | — |
| `i3_space_heater` | Space heater | "*The cord's insulation is scorched black near the plug. Somebody should throw that out.*" (No action. The game's first space heater; Ch6 makes the player remember it.) | — |
| `i3_hotel_bell` | The Cellar's bell | "*A hotel desk bell screwed to a plank. Ding. Like checking into a motel.*" | — |
| `i3_chalkboard` | Mo's chalkboard | Thu: `TRYOUTS — THE GHOST vs D. TILLERY`. Sat: `1) THE GHOST vs WOJO "THE LION" WOJCIK · 2) MAIN EVENT: THE GHOST vs SLIM WHITLOCK` and Mo's added line `THE GHOST + LENNY V. — TOGETHER AGAIN!!` Odds Sat: `GHOST 3/2`. | — |
| `i3_card_book` | Mo's card book (office; Saturday, while Mo is out) | Doc: green ledger, columns `DATE · BOUT · PURSE · EXP.` Mostly blank EXP. Some aren't: `11/22 Tillery–Bell · Tillery 3rd` / `12/14 Reardon–Ocasio (pulled — kid's 17)` / `1/11 Seo–Whitlock · Whitlock 2nd · house 3/2`. Thought: "*I'm in the book. Somebody's already decided how my Saturday goes.*" [beat] "*That's twice.*" | `ev_card_book` |
| `i3_harlan_calendar` | Calendar (office) | "*HARLAN FREIGHT CO. — WE MOVE CALDER. Mo's got their calendar. Everybody's got somebody's calendar.*" | — |
| `i3_ferris_list` | Doc Ferris's bag | A card taped inside the lid: `STITCHES $40 · NOSE $60 · RIBS $150 · TEETH (ASK) · REAL REHAB: $84,000. NOT HERE.` Thought: "*Same number as Dr. Whitlow. Everyone in this city knows what I cost.*" | — |
| `i3_footwork` | Floor tape | `Train with Deshawn` (required Thursday) | second dash charge |
| `i3_slip_rope` | Slip-rope | `Train` (slip-rope drill, cap 2 this chapter) | — |
| `i3_heavy_bag` | Heavy bag | `Train` (bag drill; Saturday with Slim) | hook |
| `i3_lenny_calendar` | Calendar (loft) | "*August 1994. He never turned the page.*" | — |
| `i3_lockbox` | Lenny's lockbox (after the confession) | a microcassette recorder and a folded slip | `ev_lenny_tape` ★, `ev_lenny_voucher` ★ |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q3_main` | main | `Find Lenny Voss. Starlite Lanes, Route 9.` → `Ask for the pinsetter.` → `Find Lenny.` → `Talk to Mo Feeney.` → `Footwork with Deshawn.` → `Tryout: Deshawn Tillery.` → (Fri) `Rest. The card is Saturday.` → (Sat) `Let Lenny wrap your hands.` → `Bout 1: Wojo Wojcik.` → `Bout 2: Slim Whitlock.` → `Talk to Lenny. The loft, after closing.` → **`Harlan Freight Depot. Find out where the money went.`** | Pin-deck reveal; Mo's terms; drills; bouts; the confession | Purses; second dash, counter-cross, hook; evidence; map node **Harlan Freight Depot, Dock Road** |
| `q3_why_they_fight` | side (`…` over each fighter; no HUD text until the second) | `Ask the fighters why they fight.` | Talk to Deshawn, Wojo, Slim and (if present) Lenny about why | Journal page "Why they fight". Jin's thought: "*A key. Six minutes of being a lion. A cot. A debt. Nobody down here's here for the same reason. Nobody's here for no reason.*" `deshawn` +1 the first time he's asked |
| `q3_teddy_mitts` | side (Friday only) | `Teddy holds mitts after nine.` | Visit Iron Pulse Friday after 9 PM | `ch3_teddy_mitts`, `teddy` +1, mitts drill cap 2; Teddy's line "Ask him why." |
| `q3_slim_pay` | side (only if `ch3_slim_result = straight`) | `Mo docked Slim a hundred.` | Give Slim $100 in the Pit, or leave | `ch3_covered_slim` |

## Scripted scenes

### 3.0 Time card and arrival (Thursday, 7:10 PM)
1. Time card `Three weeks. The Cellar was dark for the holidays.` Under it, small: a 2 s shot of the Starlite fighters' door with a hand-lettered sign `CLOSED DEC 22 – JAN 6 · HAPPY HOLIDAYS FROM MO & THE STARLITE FAMILY` and Jin's footprints in the snow turning back. Then the chapter card.
2. The Route 9 bus pulls away and leaves Jin at the shelter, breath showing. Camera wide (**0.85**) on the lot under the buzzing half-dead star; it settles to 1.0 as the player walks. Thought: "*A bowling alley. Lenny always said he'd end up somewhere with a bar.*" Objective: `Ask for the pinsetter.`

### 3.1 The face in the pin deck (playable, then a 6 s reveal)
- **Peg** (spraying shoes): "Which pinsetter, hon? We got two. One's eighteen and one's Lenny." **Jin:** "Lenny." **Peg:** "Back of sixteen. Don't let him talk you into a beer. He never pays."
- The concourse walk past sixteen lanes of Thursday league is long on purpose; two barks only: "Seven-ten split. Story of my life." / a child: "Mom, that man's face has a mark." Lanes 1–15 are busy; lane 16 is empty.
- **The reveal.** At lane 16 the camera eases to **1.4** on the far pin deck. The sweep bar comes down; between the bar and the pins, through the gap, **a face** (the slicked hair, the rounded shoulders) looks straight down the lane at Jin. 0.5 s. The bar rises; the gap is empty; the pins reset perfectly. No music, just the machine's clunk.
- The `STAFF — PINSETTERS` door: "*Locked. From the other side.*" **Peg** (across the concourse): "He went down the back stairs like his pants were on fire. What'd you *do* to Lenny?" [beat] "Stairs are by my office. I didn't tell you." Objective: `Find Lenny.`

### 3.2 Mo's terms (the Pit; 1.15 two-shot; Mo stays seated, counting)
- The Pit is empty of Lenny; the heater ticks. Mo at a card table by his office door.
- **Mo:** "The Kessler Kid! Back from the dead, in my basement! That's not a fight, that's a resurrection. People pay for resurrections."
- **Jin:** "Where's Lenny?"
- **Mo:** "Lenny's working. Lenny's always working. Lenny owes me eleven hundred dollars, so Lenny's mine." *(licks a thumb, counts)* "You want my cutman, you talk on my time. Saturday I got a card. You fight on it, and after the main event you get Lenny for as long as you want him, and Tiny holds the door so nobody bothers you. That's the price of admission."
- **Jin:** "Or I find him tonight."
- **Mo:** "Then you meet Tiny, and Tiny's cousin, and seventy people who paid to see a ghost. You're quick, Kessler. You're not seventy quick." *(cigar point)* "Thursdays is tryouts. Show me something tonight, you're on Saturday. Tryout pays sixty, win or lose. I'm not a monster. A fighter don't pay admission. A fighter gets paid."
- *(quieter, rolling the cigar)* "I was at the Civic that night. Row C. Lost two hundred on you. Lost it fair, I figured." [beat] "Now I'm not so sure. Don't tell me. I don't want to know things on a Thursday."
- Objective: `Footwork with Deshawn.`

### 3.3 Deshawn: the ladder and the tip (Thursday, before the tryout)
- Deshawn on the footwork ladder, headphones round his neck. **Deshawn:** "You're the guy from the poster? My grandma had five dollars on you. She still says you didn't lose, you got robbed."
- **Footwork ladder (required, `train_footwork` framing).** **Deshawn:** "You step once and wait. Like you're asking permission." *(he stops the rope)* "Step twice." Two dashes through the tape ladder within 0.8 s, three times. **The second dash charge unlocks** (a second pip appears with a soft click). **Deshawn:** "There. Now you're rude."
- Talk options (any order; each counts for `q3_why_they_fight` where marked):
  - "Why fight down here?" (★) → "Mo's back room is the only ring on the Northside with real ropes. I get a key." *(touches a shoelace key on his neck)* "I train all week. I fight when Mo books me. Lose the booking, lose the key." [beat] "Tonight Mo booked me on you. So."
  - "Where do you live?" → "Foundry Courts, off Foundry Street. My grandma's building. Best roof on the Northside, they redid it last year." (When the Ch4 ledger names Foundry Courts, Jin's thought quotes this.)
  - "Any advice for your opponent?" → *(grinning, cocky, generous)* "Sure. I throw the right after two jabs. Everybody knows. Doesn't matter. Nobody slips it."
- **The counter, in practice.** Deshawn: "Show me. Light." He throws jab, jab, right at half speed. The first time, a small glyph over his glove as the right comes. If the player slips it, the counter window opens with a pale 0.3 s outline on Deshawn and the prompt `Punch now` appears once. Thought: "*There. That's the door. Walk through it.*" Tip, once: `After a successful slip, press ATTACK to counter. The game won't do it for you.`
- Slim, from under his towel on the bench, not looking: "You're arm-punching on the bag. Don't tell anybody I told you."

### 3.4 Friday (time card `Friday, January 10 · Sleet`; optional)
- YMCA Room 312, the evidence wall, sleet on the window. Otis: "A Ms. Lim called. Said eat something." (if `ch2_called_hana`) / "Nobody called. Somebody should." (if not). The lobby payphone (optional): **Hana:** "Pike was here Monday asking if you'd called. I said 'who?' I've never said 'who' to anybody in my life. It felt great."
- **Optional `q3_teddy_mitts`** (bus to Eastgate; Iron Pulse after 9). Teddy holds mitts in the back room. **Teddy:** "Who're you fighting?" **Jin:** "Two guys in a basement." **Teddy:** "Keep your chin down in a basement too." Dialogue option **"Lenny's there."** → Teddy goes still with the mitts up. [beat 1.5] **Teddy:** "Ask him why. Not what. Everybody knows what. Ask him why." (Seeds the patient method; doesn't force it.)
- Sitting on the cot ends the day. Card: `Saturday, January 11 · 10:40 PM`.

### 3.5 Saturday: Lenny wraps his hands (key scene, full letterbox)
1. Upstairs is purple (Cosmic Bowl). Downstairs the Cellar fills; the ceiling's *thoom* is constant.
2. In the Pit, **Mo** (delighted): "Good news, Ghost. You got a cutman. House cutman works both corners. Rules are rules." Tiny steers **Lenny** in by the elbow, the green tackle box under his arm. Mo chalks `THE GHOST + LENNY V. — TOGETHER AGAIN!!` (Mo doesn't know what happened in 1994. To him it's a gimmick, and he's pleased with it.)
3. Lenny's opening line reads `ch2_collector_after`: `let_go`: "Benny says you let him walk. Says you're a gentleman now." / `hit_again`: "Benny's got wires in his jaw. They put *wires* in, kid."
4. Lenny sits on the bench and holds out his hands for Jin's. **Interaction `Hold still`.** Camera **1.35 on the hands, exactly the Ch0 Locker B framing**: the tape-roll bracelet; the tremor is 2 px now. Silence except the tape's rip and the lanes overhead. `mem_bottle` shard 2: the image of the hands, overlaid for 0.5 s with the 1994 frame.
   - **Lenny** (to the hands): "...You got thinner." [beat] "Hands are still good, though. You always had good—" 
   - **Jin:** "Later."
   - **Lenny:** "Later. Sure, kid. Later." He tears the tape.
5. Lenny takes a **water bottle** from his tackle box and holds it out. [beat 2.0] Camera 1.4: clear plastic, no tape, ordinary. **Choice `ch3_lenny_water`:**
   - `[Take it from his hand.]` → `took_bottle`. Jin drinks, watching Lenny over the bottle the whole time. The world muffles for one second (the Ch0 effect, very brief), then clears. Thought: "*Water. Just water. My hands are shaking anyway.*"
   - `[Not from your hand.]` → `tap_cup`. Jin doesn't take it and doesn't look away. Lenny lowers it slowly. "...Yeah. Okay. Yeah." He gets up, fills a paper cup from the tap in front of Jin, and hands it over. Jin drinks it. Nobody says anything.
6. Objective: `Bout 1: Wojo Wojcik.`

### 3.6 Walk-out and bout 1 (Wojo)
- The walk-out is the Pit curtain opening on the green lamp and the crowd: the camera holds Jin's back as the curtain parts (the Ch0 tunnel reveal at one-tenth the scale). **Mo** (standing on his chair): "In the blue corner — back from the dead — the man Calder forgot — THE GHOST!" He never says Jin's name to the room.
- **Mo slaps the hotel bell.** *Ding*: thin, tinny, wrong. Thought (first bell only): "*That's not a bell.*"
- Bout 1 (see E3.2). Wojo loses happily and bear-hugs Jin after the bell: "Best six minutes of my week!"

### 3.7 Between bouts: the stool, the hook, the book
1. **The stool** (in the Pit, facing the cracked mirror; `Sit` is prompted and the objective waits). On sitting, a sound bridge: the Ch0 crowd, underwater. Lenny behind Jin with a towel says, on autopilot, **"You're fine, kid. You look fine—"** and hears himself. He stops mid-word. Memory filter 1.0 s: the Ch0 corner, from this exact angle: Lenny's hand on Teddy's arm, "He's fine, Ted. Send him." (`mem_corner` shard 3.) Back in the Pit, the camera holds Lenny's reflection in the cracked mirror for 2 s. He puts the towel on Jin's shoulder and steps out of the mirror.
2. **The hook** (`train_bag`, hook tier). Slim, at the heavy bag, takes the towel off his head for the first time: "Your hooks are lazy. Come here." He positions Jin's elbow (`hand on shoulder`). "Turn the hip like you're shutting a door with it. Your arm's just along for the ride." Three reps after jab–cross: the third input becomes the **hook** with its short curved trail; the bag swings properly for the first time. **Slim:** "There you go. Now forget I'm a nice guy." (Fallback if skipped: the hook unlocks in bout 2 the first time Slim's own hook lands and Jin then lands any punch: "*Watched him do it. Do it back.*")
3. **Slim's ask.** On the bench, the towel back on: "Mo wants you in the second. I go down in the second. Don't make it weird." **Jin:** "Why?" **Slim:** "Because I sleep on that cot because I'm useful, and useful means I fall when Mo says. I was twenty-two and six. I could take you tonight. That's what makes the money." (★ `q3_why_they_fight`) [beat] Thought: "*Fifty thousand. Go down in the fourth. It's practical advice.*"
4. **The book** (optional). Mo goes upstairs to settle with the bowling league: "Don't touch my office." The office door is ajar; the card book is on the desk (`i3_card_book`). Doc Ferris is in the hall with his bag open (`i3_ferris_list`) and checks Jin's pupils again: "You've had a bleed, son. I can see it in how you track. Nobody down here's going to stop you. So you'd better."
5. **Choice `ch3_slim_result`** (asked when Jin walks to the curtain; Slim stands at the curtain with him; no timer, both outcomes stated):
   - "Fight me straight." → `straight`. Slim, a long pause: "Kid, I haven't been asked for my best in three years." [beat] "Mo docks me a hundred. Okay. Okay. Worth it." `slim` +2.
   - `[Say nothing. Nod.]` → `arranged`. **Slim:** "See? Easy. Nobody gets hurt." Thought: "*That's what they told me too.*"

### 3.8 Bout 2 — the main event (Slim Whitlock) and after
- See E3.3. Lenny works the corner. Between rounds he holds out the water: if `took_bottle` Jin takes it from him again, and this time Lenny's hand doesn't shake; if `tap_cup` Lenny already has a paper cup filled from the tap, without being asked.
- **After `arranged`:** the crowd roars; Mo slaps the bell over and over. **The camera eases out to 0.85**: Jin small in the centre of the ring, hands reaching from every side, Lenny clapping in the corner, Slim on his back looking at the ceiling, unhurt. Thought: "*So this is what it looks like from the other side.*" Purse $150 ("house bonus"). Slim takes his pay from Mo without looking at anyone.
- **After `straight`:** whoever wins (the bout is winnable but hard), the room is quiet for a second (the odds just lost), then Wojo starts clapping and the room follows. **Slim:** "Thank you. I mean it. Now I'm broke." Purse $120. Mo counts out Slim's pay in front of everyone, $100 short: "You were paid to tell a story, Whitlock. You told a different one." `q3_slim_pay` appears: **give Slim $100** → `ch3_covered_slim`, `slim` +2, **Slim:** "Don't do that." *(takes it)* "Don't ever do that again." / walk away → **Slim** (to Jin's back): "Thanks for the principle. I'll tell the cot about it."
- Mo, collecting: "Good card, Ghost. Come back anytime. *Anytime.*" Tiny gets up off the loft step and goes. Mo kept his word.

### 3.9 The loft (key scene; full letterbox)
Time card `Sunday, 1:50 AM`. The lanes are dark except EXIT signs. Tiny walks Jin up the staff ladder, opens the loft door, and sits down outside it with his back turned. The player climbs the two ladders and crosses the catwalk above sixteen dead machines (machine 9 cycles once by itself: a start, no damage). Lenny is at his workbench under the clamp lamp on a stool, a cigarette, the radio murmuring a call-in show. Camera 1.15.
- **Lenny (minimising):** "I carried a bottle. That's all I did. A guy hands you a bottle, you carry it." / "Electrolytes, he said. *Electrolytes.*" / "Guy from the depot. Dutch's guy. You don't know Dutch. Be glad."
- **Choice `ch3_lenny_method`:**
  - **"Sit down, Lenny. Tell me why."** → `patient`. Jin sits on an upturned pin crate, below Lenny's eye level. Camera **1.2**. A short `present` activity (claim → evidence; wrong picks just get "That's not it, kid," never a fail):
    1. Claim *"You did more than carry a bottle."* → present `ev_pickup_order` (`job via L.V.`). **Lenny:** "Okay. Okay. I pass Pike's jobs to Benny. That's money. That's not— that's not the fight."
    2. Claim *"Somebody put something in me before the walk-out."* → present `ev_transfer_form` (closed head injury, Civic Arena) or `mem_bottle`. Lenny, after a long silence, talks for a long time, and the typewriter slows with him:
       - "I bet fights. You knew that. Everybody knew that. By summer I owed Harlan Street nine thousand. Nine. They said, the kid takes a drink, the debt's gone and there's five on top."
       - "They said slow. *Slow*, kid. Not— not that. Slow. You lose on points, you go home. I seen guys on stuff, they go slow, they lose a decision."
       - [beat 2.0] "Then in the corner you said your legs. And I said send him." [beat] "Because if you didn't go back out, they'd know it was me."
       - **The four seconds** (memory filter, Jin's own point of view; the Locker B tube flickers): Lenny backs in with the ice bucket: "Kid, you look pale, you're dry—" He holds out the **white squeeze bottle with the red tape band on the neck**. "You're dry, kid. Drink." Jin drinks. Lenny takes the gloves off the bench and laces them onto Jin's hands, fast, eyes down. The door: Teddy: "Time." Breath cut back to the loft. **`mem_bottle` is complete** (shard 3; the grainy frames in the Journal develop into a clean strip).
       - **Lenny:** "I laced your gloves so you wouldn't look at my hands."
    3. Claim *"Who paid you?"* → no present needed; if `ch3_teddy_mitts`, Jin asks it Teddy's way, "*Why*, Lenny?", and Lenny answers the why first: "Because I'm a coward with a bookie. That's the whole why." Then: "Harlan Freight, Dock Road. Window two. Dutch Brannigan does the envelopes. They paid the corner, the doors, the van. Who do you think drove you out of General in the middle of the night? Dutch don't think of things like this. Somebody upstairs from Dutch does. I never saw upstairs."
    - He hands over the lockbox key himself: "I kept a tape. Insurance. Everybody in this business keeps insurance." [beat] "I'll say it again. To a lawyer, a judge, whoever. Just don't make me say it to you twice." `lenny` +2.
  - **`[Grab him by the collar.]`** → `pressed`. Jin hauls Lenny off the stool and bends him back over the catwalk rail; the camera tilts down past him to the machines eight feet below. Lenny talks in pieces: "Debt— nine— they said *slow*— I said send him, I said send him, okay?" The memory arrives only as **three hard-cut flashes** (no filter, no sound bridge): the ice bucket; the bottle with the red tape; the gloves being laced. `mem_bottle` completes, marked *flashes*. "Harlan Freight! Dock Road! Brannigan! Take it, it's in the box, there's a tape—" He throws the key on the bench and is down the far ladder and gone without his jacket. `lenny` −3, `threat_count` +1. In the lockbox the cassette's tape has been yanked half out of the shell; it plays, stretched and warbling.
- **The tape** (both paths; interaction `Play`; camera 1.3 on the little recorder; the machines tick; the cigarette burns down). `ev_lenny_tape`, recorded by Lenny on a pocket recorder in the Harlan Freight office, August 1994:
  - (hiss, a door, a radiator) **Dutch** (gravel, bored): "...one bottle, before he walks. He goes slow, he loses on points, everybody goes home. Your money's at the window Monday."
  - **Lenny:** "And if he don't slow?"
  - A third voice, soft and reasonable, from farther away (the camel coat; Jin's thought: "*I know that voice. Locker B.*"): "Then it isn't your problem, Mr. Voss. If he's still standing in the fourth—"
  - and a bright radio jingle cuts in over the rest: "*Calder Savings! We said yes!*" (Lenny, if present: "I taped over it. By accident. I was drunk for most of '94.")
- The slip under the recorder: `ev_lenny_voucher` (`HARLAN FREIGHT CO. · PETTY CASH VOUCHER · Pay to: L. VOSS · For: consulting 8/20 · $5,000.00 · 08/22/94 · Approved: D.B.`).
- Patient path only: **Lenny:** "What're you gonna do?" **Jin:** "Go to Dock Road." **Lenny:** "They'll kill you." **Jin:** "They already did, Lenny. Mostly." Lenny laughs at the wrong time, then stops. Then he drives Jin to the YMCA in his brown Cutlass without being asked and doesn't turn the radio on (a 10 s windshield vignette, the star sign pink on the fogged glass, a rosary swinging). At the curb: "I'm sorry, kid." He drives off before Jin can decide whether to answer.
- Pressed path: the last bus is gone. Jin walks Route 9 home: a long side-scroll under the overpass, the star sign shrinking behind him, the cassette in one pocket and the knuckles in the other.

## Encounters
All three are `A.bout` in the Cellar ring (`ring {x0:500, x1:920}`), house gloves (power 0.60; the HUD shows a wraps icon instead of knuckles; intro card `GLOVES ON · HOUSE RULES`), Tiny refereeing, Mo's hotel bell, crowd on, `allowLoss: false` (a loss restarts the bout with Mo's line "Get up, Ghost, they paid for a fight." or Ferris: "Follow the light. Good. Go again."). Checkpoint at each bout and each round. The winded state matters: Jin can't press for a whole round; the stool between rounds restores it.

### E3.1 Tryout — Deshawn Tillery (Thursday; 2 rounds × 60 s)
- `boxer` archetype, "deshawn" tuning: punishes repeated jabs (three jabs inside two seconds → he slips the third and counters with a cross); one feint per exchange (a shoulder dip that isn't a punch; the first time, a thought: "*Feint. He wanted that.*"); his tell is the right after exactly two jabs, which he told Jin about.
- Teaches: don't peck; dash in, jab–cross, get out; slip the right he announced → counter-cross under a real punch.
- Before the bell the player may walk to centre and touch gloves → `ch3_touched_gloves`, `deshawn` +1.
- After, win or lose: **Deshawn:** "Okay. Okay, ex-champ. Nobody slips it." Mo: "Saturday, Ghost. Bring a cutman. Oh wait." $60.

### E3.2 Bout 1 — Wojo Wojcik (Saturday; 2 rounds × 60 s)
- `boxer` with a heavy build: slow, high stagger resistance, wide bar-room swings. **Feints like a drunk**: a shoulder twitch 0.3 s, then the *other* hand. A bear-hug grab if Jin stays close in front for more than 1 s. **Different openings after different misses**: a missed wide right leaves his body open (a hook to the body staggers him); a missed jab leaves his chin open to a cross; a missed lead hook turns him square for a jab–cross. Each opening shows once as a 0.3 s pale edge the first time, then never again.
- Teaches: read the miss, answer with the matching punch; the hook as a tool.
- After every counter Wojo laughs: "Ha! *That's* what I'm talking about!" $90.

### E3.3 Main event — Slim Whitlock (Saturday; 3 rounds × 60 s)
- **`straight`:** `boxer`, "slim" tuning at full strength: southpaw, long jab, keeps distance (backs off whenever Jin is inside 70 px; uses the ropes to angle off), feints twice before committing, punishes repeated jabs with a straight left (0.2 s shoulder-dip telegraph), changes his opening after a miss (missed jab → he steps left; missed cross → he clinches). The hardest fight so far; the dash in → jab–cross → slip → counter rhythm is the only reliable way through. Jin can lose the bout outright here: if Jin's condition empties in round 3 the bout ends on Mo's card for Slim ($60 instead of $120), the story continues identically, and Slim says "Thank you. I mean it." either way. (The one ring loss in the game that isn't retried; the game says so on the intro card: `Win or lose, the card goes on.`)
- **`arranged`:** Slim fights at half pace in round 1, then in round 2 walks onto a jab, waits for Jin's cross, and goes down on cue. The player has full control the whole time; if the player throws nothing, Slim goes down on the next jab anyway (the result isn't Jin's to change once he agreed). Camera holds on Jin standing over a man who isn't hurt.
- Teaches: patience under distance; the full ring rhythm against an opponent who could win.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Touch gloves with Deshawn | `ch3_touched_gloves` (bool) | `deshawn` +1 | Ch5 Deshawn: "You touched gloves. Nobody touches gloves at a tryout." |
| Lenny's water | `ch3_lenny_water` = `took_bottle` / `tap_cup` | Lenny's reaction | Ch8 Teddy cracks a sealed bottle in front of Jin either way; with `tap_cup` he adds: "Sealed. You watched me open it." |
| Slim's result | `ch3_slim_result` = `straight` / `arranged` | Harder bout, $120 vs $150; `slim` +2 / 0 | Ch9 Penner (arranged only): "You've accepted an outcome before, Mr. Seo. Starlite Lanes. Round two." Ch10: Slim, rented out by Mo to the clearance crew, drops his hands and stands with the residents if `slim ≥ 2`; otherwise fights Jin once, reluctantly, and leaves after one knockdown. |
| Cover Slim's docked pay | `ch3_covered_slim` (bool) | −$100; `slim` +2 | Ch10 line: "You owe me nothing. I'm saying it first so you can't." |
| Teddy's mitts | `ch3_teddy_mitts` (bool) | `teddy` +1 | The "why" line in the loft. |
| Hear Lenny out or break him | `ch3_lenny_method` = `patient` / `pressed` (PDF Q2) | Full memory or flashes; tape clean or stretched; `lenny` +2 / −3; `threat_count` +1 if pressed | `patient`: Lenny stays in Calder, holds a copy of the evidence (Ch8) and testifies in Ending Two. `pressed`: Lenny leaves town (Mo, Ch6: "Lenny? Scranton or Erie or the moon."); Ending Two reads "Lenny Voss was never found to testify. The tape stood on its own." Jin's Ch4 opening thought differs. |

## Chapter ending and state handed on
- Ending beat: Room 312 at 2:40 AM. The cassette on the chair beside Umma's dish; the knuckles beside them. Jin pins the voucher to the evidence wall next to the pickup slip. Thought: "*A step slower. That's all anyone needs.*" [beat] "*Dock Road.*" Fade.
- **Completion screen:** background is Mo's chalkboard with the week's results added in Mo's hand (`GHOST W`, `GHOST W`, and `GHOST W` or `WHITLOCK W`). "Jin discovers an organized operation." What you did: "You touched gloves with Deshawn." / "You took the water from Lenny's hand." / "You fought Slim straight." or "You let Slim lie down." / "You sat down and let Lenny talk." or "Lenny ran."
- **Handed on:** skills: second dash charge, slip → counter-cross, hook; training cap 2; money +$270 to +$300 (less $100 if Slim was covered; less $16 for two YMCA nights); evidence `ev_lenny_tape` ★, `ev_lenny_voucher` ★, `ev_lenny_statement` (full or partial), optional `ev_card_book`; memories `mem_bottle` complete, `mem_corner` shard 3; People: Mo, Lenny, Deshawn ("lives at Foundry Courts"), Wojo, Slim, Doc Ferris, Peg; map: **Harlan Freight Depot, Dock Road** pencilled in; Starlite stays open (Saturday cards are flavour only; no further bouts are required).
- Time card for the next chapter: `Five days.`



# Chapter 4 — Collections

**Card:** `Collections` · `Harlan Street · Friday, January 17, 1997` · bell: muffled but nearer; its ring is answered by a truck's reversing beeper, *beep... beep*, which bridges into the card.

## Date, mood, palette, weather
- Part A: Friday, January 17, 1997, 5:20 PM to 10:30 PM (looking; Iron Pulse after nine). Part B: Sunday, January 19, 11:05 PM to Monday 2:30 AM (the assault). Sunday night because Monday's envelopes sit in the counting room overnight, and the night shift goes out on a pickup ("back by one, regular as church").
- Mood: a workplace that happens to be criminal (time clocks, coffee, a Christmas tree nobody took down with three working bulbs), then momentum and danger. The first time Jin goes into somebody else's building on purpose, and the first time the game lets him feel dangerous. The records room is a held breath.
- Palette: Harlan Street in sodium orange; the depot under floodlight towers in cold blue-white; rust-red and green-gray containers; yellow safety stripes; the river black with broken orange reflections. Warm amber only in the Harlan Grill's windows and the office lamps upstairs, which makes the paperwork look respectable.
- Weather: Friday thin snow blowing sideways through the floodlights. Sunday sleet, turning to wet snow during the boss fight; puddles reflect the floodlights in broken horizontal clusters.

## Gameplay identity
**Break into a working machine.** Scout it from a diner booth, slip in or fight through the gate, cross a loading floor, find what they kept in the garage, climb over the stacks, break a crowded yard, beat the man who uses the walls, then read in silence upstairs with nobody left to fight, and decide whose money is on the table. Group combat is the lesson: enemies coordinate, one directs the others, the boss herds rather than chases.
- Exploration 15% · dialogue 10% · investigation 20% · combat 50% · activities 5% (scouting booth, mitts).
- Target length: 22–25 min.
- **New this chapter:** air dash; dash straight (Teddy's mitts on Friday, or in play in the office corridor); backdash → returning cross (against Dutch). Knuckles on (power 0.85). Combat emphasis (PDF): repositioning through groups, interrupting one attacker while avoiding another, hooks for crowd control, choosing when to retreat, recognising enemies who protect or direct others.

## Locations

### `harlan_street` — Harlan Street (2000 × 360, exterior)
Left → right:
- **0–200 Route 22 stop** under the railroad overpass; icicles in a drip line; timetable `LAST 22 — 11:50 PM`.
- **200–650 Harlan Grill.** Chrome trim, red neon `HARLAN GRILL · OPEN 24 HRS · DRIVERS WELCOME`; three booths in the window face the depot gate.
- **650–900 Haddad Hardware.** Roll gate down; a sign `CLOSED SUNDAYS`; under it an older one, half scraped off: `PAID UP — LEAVE US A—`.
- **900–1100 the rail siding.** Chain-link with a gap where the spur runs in; snowed-over rails; a dead switch lamp.
- **1100–2000 Harlan Freight front.** Razor wire; the guard shack with a space heater's orange glow; the rolling gate (`HARLAN FREIGHT DEPOT — DELIVERIES 6AM–6PM — VISITORS REPORT TO DISPATCH`); a ghost sign on the warehouse wall `HARLAN FREIGHT CO. · EST. 1958 · WE MOVE CALDER`; two trucks idling; Dutch's black Lincoln by the office stairs inside the fence.
- Background: the river, bridges, grain elevators; across the water Ashgrove Tower's white crown.
- Light: sodium pools; floodlight glare spilling over the fence in hard orange bars. Sound: idling diesels, chain-link humming in the wind, a reversing beeper (the district's signature), a train horn, the Grill's jukebox when its door opens.
- Exits: bus stop → map; Grill door → `harlan_grill`; rail siding gap → `depot_warehouse` rail door (Sunday, only if `ch4_scouted`; otherwise "*Floodlight on the gap. The man in the shack would see me.*"); front gate → E4.1, then `depot_warehouse` front. Friday: the depot is locked to Jin ("*Not now. Sunday, when the shift's out.*").

### `harlan_grill` — Harlan Grill (700 × 360)
Counter and stools, a pie case, a coffee urn, a pass-through with Ernie the cook; three booths along the window, the middle one with the best view of the gate (sit spot); a payphone by the restrooms; a corkboard (`LOST DOG · ANSWERS TO PEPPER`; `TENANT RIGHTS CLINIC · TUESDAYS · NORTHSIDE COMMUNITY COUNCIL`); a framed team photo `HARLAN HAWKS 1996 · SPONSORED BY HARLAN FREIGHT`, a dozen eight-year-olds and a big man kneeling carefully at the end of the row. Warm fluorescent, red neon on the window, grill sizzle.

### `depot_warehouse` — Loading floor and garage bay (2400 × 540, two layers)
Ground, left → right: **rail door** (a boxcar half inside) → **dock floor**: a forklift abandoned with its reverse alarm beeping, pallets of ordinary freight (boxed washing machines, canned tomatoes, brake drums) beside a chain-link cage stencilled `HOLD — D.B.` full of cigarette cases and VCR boxes (the legal and the illegal sharing one floor) → a **time clock** with a rack of punch cards → side door to the **garage bay** (a 600 px room: two box trucks; **the gray panel van** from Ch2 with its sliding door dented where it hit the Pratt Alley dumpster; a workbench of licence plates; at the back, under a tarp, an **old white private ambulance**, `H.F.D. 7` stencilled on the driver's door over a painted-out `KEYSTONE MEDICAL TRANSPORT`, rear window cracked) → **container stacks**, two high, then three, with a gap at x 1700–1810 too wide to jump (the air-dash lesson) → dock doors 4–6 rolled open onto the yard, snow blowing in.
Upper layer: a steel catwalk along the back wall (1300–2300), ladders at 1350 and 2250; container tops as one-way platforms.
- Light: sodium high-bays, one dead; floodlight blue through the open doors. Sound: the forklift beeping until someone (or Jin) turns it off, a pallet jack, wind through the doors, a country station from somewhere.

### `depot_yard` — The yard and the river corner (2000 × 420, exterior)
Left → right: dock doors → rows of trailers; a **burning barrel** with two drivers warming their hands (they walk out the gate when the fight starts: "Not our shift. Not our problem.") → a trailer at x 900 with a ladder to its roof (the retreat spot) → **the river corner** (x 1350–1950): three stacked containers forming an L against the river edge, bollards, a crane gantry with its hook swaying (Dutch's arena) → the **office block stairs** at x 1300.
- Light: four floodlight towers, each throwing a cone with dark between them; the barrel's orange. Sound: barrel crackle, ballast hum, air brakes hissing, river lapping.

### `depot_offices` — Office block, 2F (1600 × 360, reached by a 320 × 540 stairwell)
Stair landing → a narrow **corridor** (the dash-straight lesson) → **dispatch room** (Roz's desk, a CB radio, a crossword, a thermos, a space heater, a **shelf of dispatch binders by year**, a key board with labelled hooks, a window over the yard, a wall map of Calder with pins at Starlite Lanes, St. Agnes, Calder Civic and one up north at Foundry Courts) → **break room** (coffee maker, a TV with the Bruins, the two-foot Christmas tree with three working bulbs and a paper star cut from a dispatch form) → **counting room** (a long table under a green-shaded lamp, a money counter ticking as it cools, banded stacks, a row of labelled manila envelopes) → **records cage** (chain-link, padlocked, four filing cabinets and a table) → **Dutch's office** (wood panelling; a deer head with a Santa hat on one antler; a framed photo `TEAMSTERS LOCAL 25 — 1978` with a young Dutch in the second row; the smaller Hawks photo on the desk with a spot worn on the glass over one kid; a wedding photo; a floor safe under a rug; a window over the river) → fire stairs down to the river path.
- Light: warm lamps; windows full of orange floodlight and sleet. Sound: the Bruins, the CB crackling dispatches.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `fran` (Fran DeLuca, 58, Grill waitress) | Grill counter | `work`, coffee pot | "Coffee? You look like coffee." / "Dutch? Tips twenty percent. Always. That's how you know a man's paying for something." / (on the way out, Monday 2 AM, if visited) "I didn't see you tonight, and you didn't eat." | "Pie's cherry or nothing." | `ch4_scouted` |
| `truckers` (two, at the counter; unnamed texture) | Grill stools | `drink` coffee | "The depot? They pay cash and they pay on time. Don't ask what's in the box." / "Shift goes out on a pickup Sunday nights. Back by one. Regular as church." | — | — |
| `pat` (Pat Gorman, 70, gate man) | Guard shack (asleep with a radio); the Grill at 9:00 Friday for two crullers | `sit`, head down | "Gate's closed, pal. Deliveries Monday." / (if woken Sunday) "I'm the night man. I don't fight. I'm seventy." *(hands up)* | — | Never hostile, never hittable. In 1994 he worked the Civic's Dock B gate and waved the van in; the CIVIC ledger names him (`P.G.`). After reading it, examining him: "*Clipboard. Dock B. He waved them in.*" |
| `teddy` | Iron Pulse back room, Friday after 9 | holding mitts | warm (`teddy ≥ 1`): "Don't stop at the end of the step. Let the step throw the punch." / "Where are you going with that? ...Don't tell me. Come back after." Curt (`teddy ≤ 0`): "I hold mitts. I don't talk." | — | `ch2_teddy_tone`, `ch3_teddy_mitts` |
| `hana` (phone) | Grill payphone, Friday | — | "Jin. Do you know what's on Harlan Street?" / "If you're going to do something stupid, call me after. Call me after so I know there's an after." | — | `ch4_called_hana` |
| `whistle` (Carmine "Whistle" Dalto, yard foreman) | Yard, by the barrel; clipboard and a steel whistle on a lanyard | `point`, yelling | "Two on him! Two! Don't bunch up!" / "He's one guy!" | whistle blasts | director archetype; flees when beaten, drops the whistle |
| `roz` (Roz Kaminski, 58, night dispatcher) | Dispatch desk | `write at desk`; mint cardigan, pencil behind her ear, crossword | "I log trucks. I log trucks, that's all I do. Nineteen years. I've got a bad stomach and a sister in Quincy." | — | `ch4_roz` |
| `dutch` (Francis "Dutch" Brannigan, 59, boss collector) | Friday: through the office window, laughing on the phone; Sunday: the river corner | slow walk, keys on a chain, neck crack | "There's no back door, son. There's never a back door." / "Nobody paid for your fight. Your fight paid for things. Different." / "We're the truck. Ask who paid for the gas." | (fight) "Back up. Keep backing up." / "I don't chase. I wait for the wall." | `ch4_dutch_after`; `ch4_envelope` |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i4_booth` | Booth by the window (sit) | Sitting passes time in 10-minute steps with the gate in the window. 6:40 "*Two trucks in. Same driver both times. He doesn't get out.*" / 8:10 the Lincoln arrives; a huge man in a peacoat goes up the office stairs, everyone stops talking as he passes. / 9:00 "*Gate man's walking over here.*" Pat comes in stamping snow: **Fran:** "Two crullers, Pat?" **Pat:** "Two crullers, Fran." "*Twenty minutes. Every night. The siding gap's nobody's job.*" | `ch4_scouted`; the rail-siding route |
| `i4_hawks_photo` | Team photo (Grill) | "*Harlan Hawks, 1996. A dozen eight-year-olds and a big man kneeling at the end, very carefully, like his knees hurt.*" | — |
| `i4_council_flyer` | Flyer (Grill) | "*Tenant Rights Clinic. Northside Community Council. They're on every corkboard in this city.*" | — |
| `i4_haddad_sign` | Old sign | "*PAID UP — LEAVE US A—. Somebody scraped the rest off. Probably him.*" | — |
| `i4_payphone` | Payphone (Grill) | `Call Hana` ($0.25) | `ch4_called_hana` |
| `i4_forklift` | Forklift | "*Still beeping.*" `Turn the key` (silences it; the radio becomes audible) | — |
| `i4_hold_cage` | Cage | "*HOLD — D.B. Cigarettes and VCRs next to canned tomatoes. Everything here moves on the same trucks.*" | — |
| `i4_time_clock` | Punch cards | One old card stuck behind the rack: `VOSS, L. — WEEK OF 8/15/94 — "CONSULTING"`. "*He punched in. They had him punch in.*" | — |
| `i4_van` | Gray van | "*The dent in the door. A Pratt Alley parking ticket on the dash.*" | — |
| `i4_ambulance` | Something under a tarp | `Pull the tarp` → `Look inside` (scene 4.4) | `mem_backdoor` |
| `i4_dispatch_1994` | Dispatch binder, 1994 | Doc (see `ev_transport_log`) | `ev_transport_log` ★ |
| `i4_wall_map` | Wall map (dispatch) | "*Pins. Starlite Lanes. St. Agnes. The Civic. And one up north: Foundry Courts.*" | — |
| `i4_ncc_cabinet` | Records cage, drawer `N.C.C.` | Doc (see `ev_ncc_ledger`) | `ev_ncc_ledger` ★ |
| `i4_profit` | Banded stacks | Paper bands `to A.C. — JAN`. "*Six hundred, banded. Somebody's monthly. Not anybody's rent.*" `[Take the stacks. $600.]` / `Leave them` | `ch4_took_profit` |
| `i4_envelope` | Manila envelope | Doc first (the label, every name readable): see `ev_payroll_note`. Then `[Take the envelope. $1,840. Five people's wages.]` / `Copy the label` | `ch4_envelope`, `ev_payroll_note` |
| `i4_other_envelopes` | Envelopes | `PIKE — JAN` · `ST. BRENDAN'S — XMAS` · `HAWKS — SPRING FEES`. "*Pike gets an envelope. Of course he does.*" (Not takeable: the decision stays clean.) | — |
| `i4_wedding_photo` | Wedding photo (Dutch's desk) | "*'Moira — 4.11.62 — always.'*" | the combination |
| `i4_union_photo` | Union photo, 1978 | "*A young Dutch, second row, grinning. He was somebody's working man once. He thinks he still is.*" | — |
| `i4_safe` | Floor safe | Combination input (three numbers). Opens: the folder `CIVIC`. | `ev_civic_ledger` ★ |
| `i4_tree` | Christmas tree | "*Three bulbs work. Somebody cut a star out of a dispatch form.*" | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q4_main` | main | (Fri) `Look over Harlan Freight from the street.` → (Sun card) `Get inside.` → `Cross the loading floor.` → `Get over the stacks.` → `Break the yard.` → `Ask Dutch Brannigan.` → `Upstairs. Find the records.` → `Read.` → `Get out by the river.` → **`Foundry Courts. Northside.`** | Scene triggers; areas cleared; the three documents read | Air dash, dash straight, returning cross; evidence; map node **Foundry Courts** |
| `q4_like_church` | side (Fran's `…`) | `Watch the gate from the booth.` | Sit through to 9:00 | `ch4_scouted`: the siding route (skips E4.1) |
| `q4_teddy_mitts` | side (Friday only) | `Iron Pulse. Teddy holds mitts after nine.` | Mitts session | Dash straight (else learned in the corridor); `teddy` +1 if `teddy ≥ 1` already |
| `q4_call_hana` | side | `Call Hana.` | Grill payphone | `ch4_called_hana`, `hana` +1 |

## Scripted scenes

### 4.1 Friday: looking (playable; thin letterbox at the fence)
- Time card `Five days.` then the chapter card. The Route 22 pulls away under the overpass. **Camera** wide (0.85), a slow pan right along the fence to the ghost sign and the floodlights, then back to Jin. Thought: "*Window two. Lenny's money came out of a window.*" (pressed path: "*Lenny ran. I have his tape and his voucher and nobody to say them out loud.*")
- At the fence, the camera lifts 60 px to see over it: forklifts, men loading a truck, Whistle with his clipboard, and in the lit office window above the dock **a huge man in a peacoat leaning on a filing cabinet, laughing on the phone**. That's all we see of Dutch on Friday.
- The Grill (Fran, truckers, the booth, the payphone). **Hana** (optional): "Where are you?" **Jin:** "Harlan Street." [beat] **Hana:** "Jin. Do you know what's on Harlan Street?" **Jin:** "Trucks." **Hana:** "Don't be funny with me." [beat] "If you're going to do something stupid, call me after. Call me after so I know there's an after."

### 4.2 Friday night: the step that throws the punch (optional; Iron Pulse after 9)
- `train_mitts`, dash-straight tier: Teddy backs away; the player dashes in and presses attack during the burst. **Teddy:** "Don't stop at the end of the step. Let the step throw the punch." Three clean ones: toast `Dash straight`. Warm Teddy notices Jin isn't asking for the bag, he's asking for a technique for a particular night: "Where are you going with that?" [beat] "...Don't tell me. Come back after." Curt Teddy says nothing and turns off the light when Jin leaves, then turns it on again so he can see the stairs.
- Card: `Sunday, January 19 · 11:05 PM`. Sleet.

### 4.3 The way in
- Front gate (E4.1) or, if `ch4_scouted`, the siding gap at 11:05 when Pat has his feet up in the shack with the radio on. Optional: walk past the shack on the dark side between cones without waking him. If he wakes: "I'm the night man. I don't fight. I'm seventy." A prompt appears: `Go home, Pat.` He goes. (No flag. A small proof that the game never asks Jin to hit a bystander.)
- The dock floor (E4.2). Turning off the forklift makes the room quieter afterwards.

### 4.4 The garage bay: the ambulance (key scene; then a breath zone)
- The side door opens into the garage. The bay is empty of people (the shift is out on the pickup). The gray van with its dented door: thought, "*Pratt Alley.*"
- At the back, the tarp. `Pull the tarp`: it slides off a **white private ambulance**, `H.F.D. 7`, the rear window cracked. `Look inside`: the rear doors open on a **stretcher with straps**; on the frame a strip of masking tape in marker: `BACK DOOR — D.B.`
- **Sound bridge:** an engine idling; a siren that isn't on. **`mem_backdoor`** (memory filter): **stretcher-level view**, the only shot in the game where the camera lies flat. Ceiling lights pass overhead one by one. A man's voice above, unseen: "Back door. Dutch said back door." Another: "What's his name?" The first: "Not tonight it isn't." Breath cut.
- Back in the bay, Jin is standing at the open rear doors. Thought: "*I was in here. I was lying right here.*"
- **Breath zone (guaranteed):** the warehouse door stays shut until the player chooses `Go on`. A sit spot on the ambulance's rear step; sleet on the roof. Sitting: the camera eases out to 0.85 and holds. After 20 s: "*Two days in a van with a new name. Like moving a sofa.*"

### 4.5 Over the stacks; the yard; Dutch
- The catwalk and the container gap (E4.3): the first jump short of the far stack drops Jin safely onto the floor with "*Not enough. More.*"; the prompt appears once: `Jump, then dash in the air.` Across: "*My legs remember more than my hands do.*"
- The yard (E4.4). When the crew are down or scattered, **Dutch** steps out from between the containers in the river corner, slowly, keys swinging on their chain, arms wide like he's herding cattle. Camera eases out to show the whole corner: containers on two sides, river on the third.
  - **Dutch:** "There's no back door, son. There's never a back door."
  - **Jin:** "There was one for me."
  - [beat 1.5] **Dutch:** "...Yeah. There was." He takes off his peacoat, folds it, and lays it on a bollard. He is careful with it.
  - Boss line appears as a thin bar at the bottom edge: `F. BRANNIGAN`. E4.5.

### 4.6 After Dutch: questioning at the bollard (full letterbox; no music)
Dutch is down against a bollard at the river edge, wet snow on his shoulders, no longer a threat.
- **Dutch:** "Okay. Okay. You hit like a welterweight who's been sick. That's a compliment." *(He tosses his key ring into the slush between them.)* "Records are upstairs. Read whatever you want. Paper never hurt anybody."
- **Jin:** "Who paid for my fight?"
- **Dutch:** "Paid *for*? Nobody paid for your fight. Your fight paid for things. Different."
- **Jin:** "The ambulance. The back door."
- **Dutch:** "We moved you. We didn't hurt you. You were already hurt. Somebody wanted you somewhere quiet with a different name on the bed, and we're the people you call for quiet."
- **Jin:** "Who's A.C.?"
- **Dutch:** "Somebody who don't come to Dock Road. The money lives across the river, son. I just move it around this side."
- If `ch4_envelope` is decided later, nothing here reads it (the money comes after).
- `ev_dutch_statement`. **Choice `ch4_dutch_after`:**
  - "Walk away." → `walked_away`. Jin picks up the folded peacoat and drops it in Dutch's lap. He walks. **Dutch** (after him): "Hey. Kid." Jin stops; he doesn't turn. **Dutch:** "We're the truck. Ask who paid for the gas."
  - `[Keep going.]` → `kept_going`. Two more blows, framed wide at **0.8** from behind the containers so the player sees it small, through the snow; the sound is wrong (muffled, no spark, no hit-stop, the Ch2 treatment). Dutch slumps sideways against the bollard and stays there. He moves; he groans; he is alive. The peacoat stays folded on the other bollard. Thought: "*He gave me the keys first.*" `harm_count` +1.

### 4.7 Upstairs: the corridor and Roz
- The office stairs. A single `guard` holds the narrow 2F corridor, baton up, backed against the dispatch door (E4.6). If Jin doesn't have the dash straight yet, the prompt appears once: `Dash, and keep going.` and the straight unlocks in play, knocking the guard back down the corridor into the break room. Thought: "*Through the door, not around it.*"
- **Dispatch** (camera 1.2, the CB between them). Roz is doing the crossword with the heater at her ankles. She looks up. She drops her pencil. Her hand goes toward the CB. **Jin:** "Don't." She stops with her hand in the air.
  - **Roz:** "I log trucks. I log trucks, that's all I do. Nineteen years. I've got a bad stomach and a sister in Quincy." [beat] "What do you want?"
  - **Jin:** "The 1994 binder. Whatever opens the cage. And the safe."
  - **Choice `ch4_roz`:**
    - **"Sit down. Nobody's hurting you."** → `let_go`. She sits. She takes the cage key off its hook herself, puts it on the desk, and slides the 1994 binder after it. "The safe's under the rug in his office. Dutch can't remember numbers. Everything's his wedding day. Four, eleven, sixty-two. Moira's been gone six years. He's sentimental." She stands and picks up her thermos. "I'm going to the ladies' room for twenty minutes. I have a bad stomach. Everybody knows I have a bad stomach." She leaves. The CB stays silent. `ev_roz_account` (full): "Tuesday envelopes go up north with a woman from the Council. Nell. She signs for them. Dutch drove the ambulance money himself in '94. He was proud of it, like it was a favour."
    - **`[Pin her hand flat on the desk.]`** → `threatened`. She gives the key immediately, crying without sound, and says the combination is "Four, four, seven, one." It's wrong. (4471 is the MR number on a St. Agnes invoice in her out-tray; the player who has read the transfer form may notice.) The safe rejects it; the real number is on the wedding photo in Dutch's office, an extra search. At the safe, thought: "*She lied. Of course she lied. I'd have lied.*" `threat_count` +1. `ev_roz_account` is not added.
  - `ev_transport_log` from the binder, read in the viewer while Roz is gone or frozen. The two lines are highlighted only by Jin's thumb pausing on them (a 1 px pose change).

### 4.8 The records cage and the safe (investigation; the depot noise drops away)
- The cage key, the padlock, the table under one bulb. Opening the first drawer: slow zoom in until the room is a pool of light; ambient muffle 0.4; only the bulb's buzz stays. Each document is read in the viewer, and **the table divides itself into two piles as the player reads** (each document slides left or right after reading):
  - Left pile: `ev_transport_log`, then (from the safe) `ev_civic_ledger`.
  - Right pile: `ev_ncc_ledger`.
- Reading `ev_civic_ledger`, Jin's thoughts resolve line by line: `L.V. — consulting — $5,000` "*Lenny.*" / `Dock B gate — P.G. — $200` "*Pat. The crullers.*" / `unit 7, ER run — $400` / `unit 7, private transfer Gen → St. Agnes — $1,800` "*That's me. That's the ambulance.*" / `G.P. — paperwork — $2,500` "*Pike. Twenty-five hundred dollars to make me Daniel.*" / `POSITION: CASTELL KO RDS 3–5 · books: Reno, Atlantic City, Montreal · per A.C.` "*They bet I'd go down. They made sure.*"
- Reading `ev_ncc_ledger`: "*Roofs. A boiler. A community room. Wages. And my bed: three thousand one hundred a month, St. Agnes, Room 214.*" [beat] "*The Council pays for my bed out of a gangster's cash office.*" [beat] "*And roofs. And a playground. Every outfit in this city's got a church it gives to.*" [beat] "*It's a front.*" (The PDF: at first he assumes the second category is a front. The game lets him be wrong: the right pile stays in the Journal tagged *front?* until Ch5 removes the question mark.)
- If the player met Deshawn's "best roof" line in Ch3, the roofing line's address (`Bldgs B–C, Foundry Courts, 40 Foundry St.`) adds: "*Foundry Courts. Deshawn's grandmother's building. 'Best roof on the Northside. They redid it last year.'*"

### 4.9 The counting room (key decision; no timer, no enemies)
The door shuts behind Jin and the noise of the depot drops further. Camera eases to **1.15** on the table under the green lamp; every label is readable at that zoom. Each object is a separate examine, and Jin's thoughts frame each one honestly; none of them argues.
- **The banded stacks** (`to A.C. — JAN`, $600): "*Somebody's monthly. Not anybody's rent.*" → **choice `ch4_took_profit`**.
- **The envelope.** The label opens in the document viewer first, so the player has read every name before choosing (`ev_payroll_note`):
  > FOUNDRY CTS MAINT. PAYROLL · 2 WKS ENDING 1/17/97 · $1,840
  > Kowalski M. 640 · Greer D. 480 · Tillery D. 320 · Lindqvist G. 240 · Baptiste O. (laundry & stairs) 160
  > deliver Mon. w/ N. Faraday
  - Thought: "*Eighteen-forty. A warm room for the rest of the winter. A real doctor for these ribs.*" [beat] "*Tillery. Deshawn Tillery.*" (only if he was met; he was, in Ch3) "*Five names. Monday.*"
  - **Choice `ch4_envelope`:** `[Take the envelope. $1,840. Five people's wages.]` → `taken`, `take_count` +1 / `Copy the label` → `left` (Jin writes the label and names on the back of Hana's card).
- The camera holds on the table for 2 s after each choice, with the envelope there or gone. Nothing else in the chapter changes. **What taking it does immediately** is shown in the rest card (below): the help is real, and small.
- `PIKE — JAN` envelope: examine only.

### 4.10 Out by the river (chapter ending; a breath zone)
- Fire stairs to the river path. Sleet has become wet snow. The yard is empty; the floodlights hum. The objective HUD is hidden. If `walked_away`, Dutch is still at the bollard with his peacoat over his shoulders; he lifts two fingers off his knee as Jin passes. If `kept_going`, only the coat on the bollard.
- A **sit spot under the last floodlight**. Sitting (or after 60 s of walking), Jin reads the right-hand pile again: `Bldgs B–C, Foundry Courts, 40 Foundry St.` Camera 1.4 on the words, then **eases out to 0.8**: Jin small under one light, the river, the depot dark behind him.
- Thought: "*Foundry Courts.*" [beat] "*Let's see what a front looks like.*"
- Optional on the way to the bus: the Grill, Fran pours a coffee without being asked. If `ch4_called_hana`, the Grill payphone prompt reads `Call Hana after`: **Hana** (half asleep): "...Jin? Is there an after?" **Jin:** "There's an after." **Hana:** "Okay. Good. Go to sleep." `hana` +1.
- Objective: **`Foundry Courts. Northside.`**

## Encounters
All street encounters: `A.fight`, `maxAttackers: 2` (3 in the yard while Whistle is up), knuckles (power 0.85), checkpoint at each area entrance. Loss: "*Pinned. Again.*" and an instant retry.

### E4.1 The gate (skipped if `ch4_scouted`)
2 `thug` + 1 `guard` (a younger night man with a dock baton; Pat is asleep and is never part of it). The baton swing has a longer telegraph and reach and **can't be slipped, only stepped out of or dashed through during the dodge window**; slipping inside a jab still works. Teaches: reach and the dash's dodge window.

### E4.2 The loading floor
4 `thug` + 1 `collector` (slow haymaker, grab). Teaches **repositioning through groups** (the hint once when two flank him: `Through, not around.`; the dash's dodge window passes through ordinary enemies) and **hooks for crowd control** (the hook hits up to three in front; a multi-hit triggers one hit-stop only). Checkpoint at the time clock.

### E4.3 The catwalk
2 `thug` chasing up the ladder + 1 waiting on the far stack. **Air dash unlock.** Teaches using vertical layers to split a group: the chasers climb one at a time.

### E4.4 The crowded yard
- **Wave 1:** **Whistle** (`director`, stays back by the barrel; every whistle blast makes allies within 160 px attack 30% faster and makes one feint while another closes) + 3 `thug`. Tip on spawn: `The one with the whistle makes them faster. Get to him first.` Hitting Whistle interrupts his directing for 3 s (pose drops from `point` to `hurt`); enough hits and he runs out the gate, dropping the whistle. Teaches: **recognise and hit the enemy who directs others**.
- **Wave 2:** 2 `collector` + 1 `guard`. Teaches **interrupting one attacker while avoiding another** (a collector's grab can be interrupted with a jab during its wind-up; the baton can't, so it must be avoided).
- **Retreat:** the trailer roof at x 900 is always reachable by its ladder; up there Jin's winded state clears faster and enemies take 3–4 s to come round. Tip the first time Jin is winded with three enemies up: `Too many? Get up on the trailer. Choose when.` (PDF: **choosing when to retreat**.)
- Checkpoints: the dock doors; between waves.

### E4.5 Boss — Dutch Brannigan (`boss collector`; the river corner; checkpoint at the corner's mouth)
- **Herd (phase 1, 100–60%):** walks forward with arms wide, sidesteps to mirror Jin's dashes and cut off the open side. Never runs: "I don't chase. I wait for the wall." If Jin's back is within 40 px of a container or the river edge, Dutch's **pin** (a two-hand shove into the wall, 0.5 s wind-up, slippable) does heavy damage and leads into a slam. The lesson: never let the space behind you run out.
- **Punish the runner:** two backdashes in a row trigger a long shoulder charge. The answer is **backdash → returning cross**: the first time the player backdashes once and presses attack, the returning cross fires with a heavy flash and "*Back, then in.*" (unlocked here).
- **Phase 2 (60–30%), the keys:** he wraps the key chain round his right fist: "You brought brass. I brought keys." His hook gets a heavy trail and breaks guard. He plants himself in the gap between containers to block the exit. Answer: work him from the open side; jump from a low crate and **air dash over** him to escape a corner (a ground dash can't pass through a man that size; the game says so on the first attempt: "*Can't get past him. Go over.*").
- **Phase 3 (<30%):** the snow thickens; he throws a two-hit haymaker, then is open for the longest window in the fight.
- Resists stagger (three clean hits within 1.2 s to stagger once) and cannot be launched. The player who hits and moves beats him; the player who trades against a wall loses.
- **The cracked rib:** whatever happens, Dutch's phase-3 haymaker cracks one (shown on the condition bar as a small hairline icon). Until it heals (the rest card, or Doc Ferris), Jin gets winded 1.5 s sooner.

### E4.6 The corridor
1 `guard` with a baton in a corridor too narrow to get round. Dash straight (unlocked here if not from Teddy). Instant retry; no checkpoint needed.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Watch the gate | `ch4_scouted` (bool) | Siding route, gate fight skipped | Ch9 Penner's dossier: "Subject observed the gate for three hours from a diner booth. Patient." |
| Call Hana | `ch4_called_hana` (bool) | `hana` +1 (and +1 more if he calls "after") | Ch6 Hana: "You called me after. I counted that." |
| Roz in dispatch | `ch4_roz` = `let_go` / `threatened` (PDF Q2) | The right combination and a quiet CB / a wrong combination and an extra search | `let_go`: Roz quits the depot, writes to Jin c/o the YMCA ("If you need a dispatcher to say it out loud, I will."); she holds a copy of the evidence in Ch8 and testifies in Ending Two. `threatened`: her name appears only in Penner's dossier: "a dispatcher who will describe you to anyone who asks." |
| Criminal profit | `ch4_took_profit` (bool) | +$600 | Ch9 Celeste: "You took six hundred dollars of ours, Mr. Seo. Consider it an advance." No innocent person is harmed; not counted in `take_count`. |
| The payroll envelope | `ch4_envelope` = `taken` / `left` (PDF Q1, first small-scale version of the final question) | +$1,840 and the better rest card / the label copied | Ch5's whole texture: `taken` → the payroll never arrives on Monday; Mara pays Odette and Gus out of her own pocket and can't pay herself, Darnell picks up extra rail-yard nights, Deshawn takes a Saturday booking at the Cellar he didn't want, and the residents' meeting is about covering wages from the roof reserve. `left` → wages paid; the meeting is about the boiler controls vs the roof reserve vs independence from the Council. Ch5 night: Jin can return the money (`ch5_returned_envelope`). Ch7 Darnell. Ch9 Penner: "Eighteen hundred and forty dollars of other people's wages. You understood the arrangement before we offered it." Ch10 reflection. |
| Dutch at the river | `ch4_dutch_after` = `walked_away` / `kept_going` (PDF Q4) | Coat in his lap and "Ask who paid for the gas" / the muffled blows | Ch7: `walked_away` → Dutch is with the Harlan men at the union hall and stands his men down ("Not him. Not tonight."); `kept_going` → he's absent and Vince Carrow's men push. Ch10: `walked_away` → Dutch steps aside at Alder Row ("I collect. I don't do this."); `kept_going` → he's in the final wave with a bandaged hand and a grudge. `harm_count` +1 if kept going. |

## Chapter ending and state handed on
- **Completion screen:** background is the counting-room table under the green lamp, the envelope there or gone. "Criminal money has legitimate destinations." What you did: "You watched the gate from the booth." / "You let Roz go to the ladies' room." / "You left the payroll on the table and copied the names." / "You walked away from Dutch."
- **Rest card: `Eight days.`** (2.5 s, then a 20 s vignette, no control). `taken`: a clean room at the Calder Arms Hotel (`calder_arms`: a 640 × 360 downtown hotel room, Room 6: a real bed, a radiator that works, a window on Front Street, $45 a week; reused as a base in Ch8–9 if chosen), Doc Ferris's bag on the chair (a full course of rib strapping and physio, paid), Jin asleep on top of the covers with his shoes on; Ch5 starts with no rib icon. `left`: YMCA Room 312, Jin's ribs strapped with a bedsheet, Teddy setting a can of soup on the chair without a word; Ch5's first day still shows the rib icon (winded sooner on day one only). Both: Earl's radio on the sill, Channel 6 news: "...police are investigating a break-in at a Harlan Street freight company. A spokesman says nothing of value was taken." Thought: "*Nothing of value.*"
- **Handed on:** skills air dash, dash straight, backdash → returning cross (the whole movement set is now present); training cap 2; money as chosen (≈ $250 base; +$600; +$1,840); evidence `ev_transport_log` ★, `ev_civic_ledger` ★, `ev_ncc_ledger` ★ (tagged *front?*), `ev_payroll_note`, `ev_dutch_statement`, optional `ev_roz_account`; memory `mem_backdoor`; map: **Foundry Courts (Northside, Route 22)** unlocks; Harlan Street afterwards shows the gate chained with a sign `CLOSED FOR INVENTORY` (visible from the bus only); the Grill stays open.



# Chapter 5 — The Houses Still Standing

**Card:** `The Houses Still Standing` · `Foundry Courts, Northside · Monday, January 27, 1997` · bell: muffled, nearer again; its ring is answered by children shouting in a courtyard and a cast-iron radiator set down on concrete, *clang*.

## Date, mood, palette, weather
- Monday, January 27 to Friday, January 31, 1997. Five short days, each a loop of **morning work shift → free afternoon → evening event**. Sleeping on the loft cot advances the day once its main beat is done. A small label in the corner says where in the day it is (`Wednesday · Evening`); every activity says what it costs before the player commits ("*This takes the afternoon.*").
- Mood: relief the player shouldn't trust and can't help enjoying. Ordinary noise; people who disagree loudly and look after each other anyway. A splinter Jin carries the whole week.
- Palette: the first bright daylight chapter since Ch0. The same worn brown brick as Eastgate, but cared for: repointed mortar in newer, redder patches; every front door painted a colour its residents chose (teal, mustard, barn red, bottle green); white window trim; frozen sheets on lines across the courtyard; a swept path. Behind everything the dead foundry stack, enormous, `LOCAL 1197` in faded white at its base. Mornings pale gold, dusk deep blue at 4:50, every window amber at night. Warm notes: Keisha's pink jacket, the community room's yellow windows, the burn barrel.
- Weather: Monday clear and cold; Wednesday a hard freeze (the boiler night); Thursday bright; Friday light snow from mid-afternoon, an orange sunset behind the stack before it starts.

## Gameplay identity
**Live somewhere for a week.** Carry radiators, fix a washer, help restart a boiler, set out chairs, patch a roof; train with a local boxer; hold mitts for a kid; sit in on the residents' argument about their own money; meet the man who saved the place. **No hostile combat exists anywhere in this chapter** (no enemy spawner is loaded at the Courts). The punch button still works: on the bag and mitts it punches; near a person or object outside the gym it plays a small shadowbox instead.
- Exploration 20% · dialogue 35% · investigation 10% · combat 0% · activities 35% (work, training, chores).
- Target length: 22–25 min (about 5 min a day).
- **New this chapter:** the uppercut (Deshawn, Tuesday). Training cap rises to 3.

## Locations

### `foundry_street` — Foundry Street (1800 × 360, exterior)
Left → right:
- **0–250 Route 22 stop and Northside Car Wash** (`HAND WASH $5 · WINTER UNDERBODY $3`; spray mist freezing on the fence; Deshawn in a yellow slicker on weekday mornings).
- **250–600 Dombrowski's Market** (green awning, `LOTTO · WIC ACCEPTED · KIELBASA FRIDAY`; a shop: coffee, bread, kids' gloves $12).
- **600–1100 Council HQ.** The old union hall: two-storey brick, a carved limestone lintel `UNITED FOUNDRY WORKERS LOCAL 1197 · 1937`, and over the door a newer painted sign `NORTHSIDE COMMUNITY COUNCIL`. A glass bulletin case (the tenant clinic flyer, the toy-drive thank-you). Door `OFFICE HOURS TUE / THU 10–4`; locked whenever Jin passes in Ch5 ("*After four.*" / Thursday: "*Nobody inside. Rook's at the Courts.*"). It opens in Ch7.
- **1100–1400 mural** `FOUNDRY STRONG · 1911–1992`: a giant ladle pouring orange iron, men in hard hats, the stack; paint flaking at the bottom.
- **1400–1800 the gate.** An iron arch with cast letters `FOUNDRY COURTS 1911`, repainted black; a faded cloth banner tied to it: `SAVED BY ITS PEOPLE · 1994`, embroidered (the stitching is better than the spelling); the **bronze plaque** on the gatepost.
- Light: daylight; sodium at night. Sound: the 22 bus, the car-wash hose, a church bell at noon from somewhere in Northside (*Bells.*).
- Exits: bus stop → map; gate ↔ `courts_yard`.

### `courts_yard` — The courtyard (2600 × 540, exterior, two layers)
Ground, left → right:
- **0–250 the gate** (from Foundry Street); a bench; a lamp post with a hand-lettered `SLOW — KIDS`.
- **250–800 Building A.** Three storeys of 1911 brick, a swept stoop (Odette sweeps it at 7 AM). Doors with nameplates: A-1C `BAPTISTE` (African violets in the window), A-3C `KOWALSKI` (Mara's; a bike on the landing). The half-basement **laundry room** door with Odette's schedule clipboard (`MON A1–A6 · TUE A7–B2 · WED B3–B8 · THU C (ALL DAY, GOD BLESS) · FRI D`).
- **800–1500 the courtyard proper.** A dry fountain basin used as a snow fort; Keisha's **chalk hopscotch** on the cleared path (it changes daily: Monday 1–8; Tuesday 1–10 with a `HOME` square; Thursday drawn round a snowman; Friday with a `BOXING` square you have to hop in twice); a bare oak with a tire swing; a burn barrel; clotheslines of frozen sheets from A to B; a basketball hoop with a chain net.
- **1500–2000 Building B** (B-3A `GREER`: a child's drawing taped to the door, `DAD AT WORK. ME AT HOME. TV.`) and **Building C** (scaffold on the façade; fire escapes climbable to the roof; unit **4D** on the top floor with a new white door).
- **2000–2300 the workshop**: the old foundry pattern shop, tall arched windows, a sliding door, a painted sign `MAINTENANCE · KNOCK LOUD · MARA`.
- **2300–2600 the community building** (the old foundry office, two storeys, an empty bell cote on the roof) and, parked beside it, the **Council site office**: a white construction trailer with `N.C.C.` stencilled on the door.
- Upper layer: Building C's fire escape (3 landings, ladder at x 1580) to its roof; across the back wall, the rail spur and the stack.
- Light: low sun from the left, long shadows; evening lamp post and window glow; night amber windows. Sound: kids (3:30–5:00), a radio war between two windows (a Spanish-language station and an oldies station), sheets creaking, a dog, the 22 on Foundry Street, Odette's broom at 7 AM.
- Exits: gate; every door; fire escape → `courts_roof_c`.

### `courts_workshop` — Mara's workshop and the loft (900 × 540, two levels)
Ground: a long workbench with a vice; a pegboard with every tool painted in outline (one outline empty, chalked `WHO HAS THE 3/4 WRENCH`); wooden foundry patterns on high shelves, including a **full-size wooden pattern of a church bell**, dusty (Mara uses it as a hat rack); a woodstove; a dented percolator; the **pay tin** (a blue butter-cookie tin, masking tape `PAY`); the crew's time sheet on a clipboard; a radio on WCLD 1340; the **workshop phone** on the wall with the number painted beside it in red (`555-0172`; used in Ch6 and Ch8); the **key board** (tags `BOILER A`, `BOILER C`, `LAUNDRY`, `ROOF`, `LADDER`, `ARCHIVE (COUNCIL)`); a space heater Mara rewired herself. A ladder to the **loft**: a cot with a wool army blanket, a crate table, a hot plate, a nail for the track top, a window that looks straight at the stack, and a **bare plaster wall** (Jin's evidence wall from Friday night; the timeline board in Ch6–7). **Jin's base for Ch5–7.**

### `courts_community` — Community building (1200 × 360 ground + 1200 × 360 basement)
Ground: the **community room**: folding chairs stencilled `N. COMM. COUNCIL` (the same chairs Jin saw listed on a depot ledger), folding tables, a big coffee urn, a piano with a lace runner, kids' drawings, **Odette's black Singer** at the window (the same model as Umma's), a shelf with the **minutes binder**, a **fundraising thermometer** poster, a donation coffee can `COURTS FUND · EVERY DOLLAR COUNTS`, and at the back a kitchen with an old six-burner stove and a bucket under a ceiling drip.
Basement (stairs at the right): the **gym** (one heavy bag, one working speed bag, two mirrors salvaged from a closed dance school, mats, a ring in red tape on the concrete, a milk crate of donated gloves in mismatched sizes, a chalkboard `SAT 9 AM KIDS CLASS · D. TILLERY` with a roster of first names); the **Building C boiler room** (a riveted Foundry-era boiler with a newer burner bolted on, three gauges, a valve wheel, a logbook on a nail with Mara's readings three times a day since 1994); and a steel door stencilled `N.C.C. — RECORDS — NO ADMITTANCE`, padlocked ("*Council files. Not mine to open.*"; opened in Ch7, when the residents open the books).

### `courts_site_office` — Council site office (480 × 360, the trailer)
Nell's desk, a phone, blueprints, a waitlist board (`4D — VASQUEZ, E. (3 children) — APPROVED 1/23 — MOVE-IN 2/14`), a poster `NORTHSIDE COMMUNITY COUNCIL — 11 YEARS OF KNOCKING ON DOORS`, a free promotional calendar `ASHGROVE CAPITAL — Building Calder's Tomorrow` (January: a glass tower at dusk; nobody remarks on it), and a space heater, unplugged, with a note in Mara's capitals: `NOT IN MY BUILDINGS`.

### `courts_4d` — Unit 4D, Building C (640 × 360; only if `ch5_took_4d`)
Door → an empty living room with fresh cream paint → a mattress Rook had brought in → a radiator that hisses → a window over the yard and the stack. On the sill, a crayon drawing taped by a previous child: `MY HOUSE`. Jin's base instead of the loft while he keeps it (the evidence wall moves to the plaster beside the window).

### `courts_roof_c` — Roof of Building C (1000 × 360, exterior)
Tar paper, the leak patch, the scaffold top, two upturned buckets and a thermos (Mara's sunset spot); a view of the river and, far off, the dark dome of the Civic Arena (the same dome seen from the St. Agnes steps and the 412 roof).

## NPCs present
| id | Routine (Morning / Day / Evening / Night) | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `mara` (Mara Kowalski, 41, maintenance lead) | workshop / job sites / workshop; the C roof at sunset / her window in A-3C | `crouch` at a valve; wipes her hands on a red rag before offering one | "You can carry a radiator or you can carry an opinion. We're short on radiators." / "Twenty a shift, cash, Fridays. Coffee's free. The coffee's bad." / "Nobody runs this place. That's the point of this place." | "Lift with the legs, boxer." | `ch4_envelope`, `ch5_returned_envelope`, `ch5_left_repair`; `mara` +1 per shift (max +3) |
| `odette` (Odette Baptiste, 71, tenants' secretary; Deshawn's grandmother) | stoop at 7 AM sweeping / laundry room / the Singer in the community room / her window | `sweep`; `sit` at the Singer | "Slow. Nobody's chasing you. Not today." / "I took the minutes for eleven years. I know what a minute hides and what it brags about." | "Shut the door, you're heating the yard." | Calls Jin "the boxer" until he helps her, then "Jin" with a soft J |
| `deshawn` | car wash / car wash / basement gym 6–9 PM / — | `shadowbox`, `skipRope` | "Ex-champ! You following me?" / "Courts is through the arch. Ask for Mara if you want to be useful. Ask for my grandma if you want to be fed." | "Hands, ex-champ." | `ch3_touched_gloves` ("You touched gloves. Nobody touches gloves at a tryout."), `ch4_envelope` |
| `gus` (Gus Lindqvist, 68, ex-foundry pipefitter; radios, boilers part-time) | bench by the hoop with a radio in pieces / boiler room / meeting / — | `sit`, coughing, a screwdriver behind his ear | "I poured iron forty years for a company that sold us to a bank. Then Walter bought us back. I'd still like to know with what." / "I voted no on something once. Didn't matter." | "Bring me something with tubes." | `ch5_meeting_stance` |
| `darnell` (Darnell Greer, 36, crew; rail-yard nights when the crew isn't paid) | yard in an orange rail vest, going to or from a shift | `armsCrossed`, hard hat | `left`: "Monday's payday, and for once in my life it was Monday." / `taken`: "Somebody hit the depot. Our two weeks were in that envelope. Council says it's 'unrecoverable.'" [beat] "My kid's not unrecoverable." | "Not now, man." | `ch4_envelope` |
| `keisha` (Keisha Greer, 8) | school bus / school / hopscotch, the oak, the gym stairs / — | hopscotch loop; shadowboxing in oversized gloves | "Are you a real boxer or a fake boxer? Deshawn says you're real but he's a liar about my bedtime." | "Watch me! Watch me!" | `ch5_held_mitts` |
| `nell` (Nell Faraday, 50s, Council site coordinator) | site office / delivers the payroll Mondays / the meeting | `write`, cardigan, clipboard | "Sign-in sheet, please." / "Walter, 4D is the Vasquez family's. They were approved last Thursday." | — | `ch5_took_4d` |
| `elena` (Elena Vasquez, with three children; face only) | site office Tuesday; the yard Friday | `carry` a child | Tuesday: "Is 4D still the fourteenth? My lease ends the fifteenth." / Friday, if 4D was taken: "They told me April now. April." | — | `ch5_took_4d` |
| `rook` (Walter Rook, 63) | Thursday, noon, the courtyard only | `hand on shoulder`, sits on stoops instead of standing over people; reading glasses on a cord | see scene 5.5 | "Odette, you look twenty years younger. Liar that I am." | first meeting |
| `pike` | Wednesday evening only, crossing to the site office | briefcase | (no lines to Jin) | — | `ch5_left_repair` |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i5_plaque` | Bronze plaque (gatepost) | Doc: `FOUNDRY COURTS MUTUAL HOUSING · 4 buildings · 212 households · Purchased with the Northside Community Council · Deed recorded September 30, 1994 · "NOBODY LEAVES."` Thought: "*September thirtieth. Forty-one days after the fight.*" | `ev_courts_plaque` ★ |
| `i5_banner` | Banner | "*SAVED BY ITS PEOPLE. Somebody embroidered it. The stitching's better than the spelling.*" | — |
| `i5_stack` | The stack | "*LOCAL 1197, painted at the base. The letters are taller than me. Nothing's come out of the top since 1992.*" | — |
| `i5_thermometer` | Fundraising thermometer | `BOILER FUND — GOAL $22,400`. Red marker climbs in small steps (bake sale, car wash, Gus's raffle) to `$3,180 — JUNE '94`. Then one stroke to the top: `$22,400 — THANK YOU, ANONYMOUS FRIEND!! — OCT '94`. Thought: "*Twenty-two thousand four hundred. I read that number on a ledger at Dock Road.*" The Journal changes `ev_ncc_ledger`'s tag from *front?* to *real — the boiler is real*. | — |
| `i5_minutes` | Minutes binder | (with Odette, scene 5.6) | `ev_courts_minutes` ★ |
| `i5_singer` | Odette's sewing machine | (Tuesday afternoon) | `mem_singer` |
| `i5_pay_tin` | Pay tin | `left`: "*Five small envelopes, names in Mara's capitals. Kowalski. Greer. Tillery. Lindqvist. Baptiste. The same five.*" / `taken`: "*Empty. A note inside: 'IOU crew — 2 wks ending 1/17.'*" | (the return choice) |
| `i5_chairs` | Folding chairs | "*N. COMM. COUNCIL. Forty of them. I read about these chairs on a pallet list at Dock Road.*" | — |
| `i5_bell_pattern` | Wooden bell | "*A foundry pattern for a church bell. They carved the bell in wood first, then poured iron into the shape it left. Mara hangs her hat on it.*" | — |
| `i5_key_board` | Key board | "*BOILER A. BOILER C. LAUNDRY. ROOF. LADDER. ARCHIVE (COUNCIL).*" Mara, if near: "There's a valve in the archive. That's the only reason I've got that one." | (Ch7) |
| `i5_workshop_phone` | Phone | "*555-0172. Painted on the wall in red so nobody can say they didn't know the number.*" | — |
| `i5_greer_drawing` | Drawing on B-3A | "*DAD AT WORK. ME AT HOME. TV. A stick man in an orange vest and a stick girl next to a box.*" | — |
| `i5_hopscotch` | Chalk | Changes daily; Friday: "*Somebody added a square that says BOXING. You have to hop in it twice.*" | — |
| `i5_waitlist` | Waitlist board | "*4D. Vasquez, E. Three kids. Move-in the fourteenth.*" | — |
| `i5_site_heater` | Space heater (trailer) | "*'NOT IN MY BUILDINGS.' Mara's handwriting.*" (No further comment; Ch6 makes it land.) | — |
| `i5_ashgrove_calendar` | Calendar (trailer) | "*Ashgrove Capital. Building Calder's Tomorrow. A free calendar with a glass tower on it.*" | (seen again Ch9) |
| `i5_gym_chalkboard` | Kids' roster | `SAT 9 AM KIDS CLASS · KEISHA · BENNY · PAULIE K. · JOJO · MARISOL · (DESHAWN: BRING TAPE)` | — |
| `i5_speed_bag` | Speed bag | "*It works. I can't keep the rhythm yet. It keeps getting away from me.*" (Ch6 unlocks the flurry here.) | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q5_main` | main | (Mon) `Foundry Courts. See what the money pays for.` → `Find whoever runs this place.` → (Tue) `Mara's crew starts at eight.` → (Wed) `The boiler's out in C. Help Mara.` → (Thu) `Morning in the courtyard.` → `Ask Odette when the Council bought the buildings.` → (Fri) `The roof on C, with Mara.` → `Residents' meeting. Seven o'clock.` → `Sleep.` | Day triggers; the loft wall | The purchase date; suspicion without proof; relationships |
| `q5_shifts` | side (Mara's chalk board; repeatable, one per morning) | `Mara's board: [Radiators, C stairs / Washer two, laundry / Boiler C / Chairs for Friday / Roof patch, C]` | Each activity | $20 each; `mara` +1 (max +3), `courts` +1 (max +2). Monday's and Wednesday's are part of the main path. |
| `q5_gym` | side | `Deshawn's in the basement gym after six.` | Tuesday session (uppercut); Keisha's mitts | Uppercut; `deshawn` +1; `ch5_held_mitts`; Deshawn's corner request |
| `q5_crew_tin` | side (only if `ch4_envelope = taken`; no marker, a journal line appears Tuesday) | `The envelope's still in your jacket.` | Tell Mara / put it in the pay tin / do nothing | `ch5_returned_envelope` |

## Scripted scenes

### 5.1 Monday: the arch and the radiators
1. Time card `Eight days.` was the rest card; the chapter card follows. The 22 pulls away. **Camera** holds at **0.85** for 8 s while the player walks: the first wide, *bright* frame since Ch0. Then a slow tilt up the length of the stack (the only vertical pan in the chapter) and back down to Jin. No music; the courtyard is the music. Thought: "*A front. Gangster money in a housing project. Let's see the front.*"
2. Car wash: **Deshawn** (slicker, sprayer): "Ex-champ! You following me?" **Jin:** "Maybe." **Deshawn:** "Courts is through the arch. Ask for Mara if you want to be useful. Ask for my grandma if you want to be fed." (`ch4_envelope = taken`: he adds, not knowing: "I took a booking on Mo's card. The eighth. Didn't want to. Crew didn't get paid.")
3. At the gate the plaque is examinable; most players will read it (`ev_courts_plaque`).
4. **Mara** is wrestling a cast-iron radiator off the tailgate of a red '81 Ford pickup, alone. She doesn't look up. "You can carry a radiator or you can carry an opinion. We're short on radiators." **Jin:** "I'm looking for whoever runs this place." **Mara:** "Nobody runs this place. That's the point of this place." [beat] "Grab the other end."
5. **Shift: Radiators** (carry, ~2 min): three radiators from the truck up Building C's stairs to the 2nd, 3rd and 4th floors. Carrying is two-handed: **no punching, no dashing while carrying** (a crossed-fist icon the first time, with "*Hands full.*"). If the rib icon is still showing: "*Rib. Lift with the legs.*" Mara walks backward holding the other end and talks:
   - **Mara:** "Old Foundry houses. Built for the pour-floor families. When the Foundry went bust in '92 the bank was going to auction all four buildings in one lot. To a guy from Pittsburgh who'd have knocked them down for parking. Two hundred and twelve households."
   - **Mara:** "The Council bought them first. Rook and the Council. Don't ask me how. I fix pipes. I don't ask the pipes how."
6. On the last landing she straightens and looks at him for the first time. **Mara:** "You're good. You don't talk and you don't drop things." [beat] "Twenty a shift, cash, Fridays. Coffee's free. The coffee's bad. There's a cot above the shop if you need one. You look like you need one." [beat] "And there's a gym under the community room. Deshawn Tillery. Tell him Mara sent you or he'll make you fill out a form he doesn't have." $20.
7. Evening: the workshop. Mara shows him the loft and the space heater: "I rewired it. I check it every night. Don't touch it." Jin hangs the track top on the nail. Camera eases out through the loft window to the stack. **Sleep.**

### 5.2 Tuesday: the payroll, the washer, the Singer, the gym
- **The payroll** (morning, the workshop):
  - `left`: Mara's pay book is open on the bench: `2 WKS ENDING 1/17/97 · rec'd 1/20 · N.F.` and five crossed-off names. Camera 1.5 on the line. Thought: "*Same envelope. I left it on a table and it came here.*" Darnell, passing with a coffee: "Monday's payday, and for once in my life it was Monday."
  - `taken`: the pay tin is empty but for Mara's IOU. **Mara** (to Gus, not to Jin): "Harlan Freight says there was 'an incident.' No envelope. I paid Odette and you out of mine. Darnell said take care of the old folks first." **Gus:** "And you?" **Mara:** "I'm not old." Darnell is asleep on his feet in the yard after a rail-yard night. A journal line appears without a marker: `The envelope's still in your jacket.` (`q5_crew_tin`)
- **Shift: Washer Two** (repair sequence in the laundry room, 3 steps: pull the machine out, replace the belt, test a cycle while Odette watches with her arms folded). Odette: "That washer has been dead since Thanksgiving. I said a rosary for it. Now I owe God a different favour." $20.
- **Elena** at the site office door, three kids in a row: "Is 4D still the fourteenth? My lease ends the fifteenth." **Nell:** "The fourteenth, Mrs. Vasquez. Paint's drying."
- **The Singer** (late afternoon; key moment). Odette at the community-room window sewing a button on a child's coat. The treadle's rhythm reaches Jin before he reaches her. Sound bridge into **`mem_singer`** (memory filter, 3 s): 3B on a Saturday night, Umma at her Singer hemming church dresses while Jin and Min do homework on the floor: "Saturdays I sew for money. Sundays I sew for God. Weekdays I sew for you two, because you destroy everything." Breath cut: Jin is standing in the doorway and hasn't moved. Odette doesn't look up. **Odette:** "Sit down if you're going to stand there. There's tea." He sits. Camera eases to 0.9; the treadle; snow beginning outside. Neither speaks for 6 s. Breath zone. (The chapter's first quiet scene, earned by work, not tragedy.)
- **The gym** (`q5_gym`, 6 PM). Deshawn tapes Jin's hands without being asked.
  - **Deshawn:** "Everybody down at Mo's throws straight 'cause the ceiling's low. Up here we got a high ceiling." He holds a mitt low and flat. "You don't come up from underneath. Bend the knees. Hips first. The hand's the last thing to know."
  - **Uppercut unlock** (`train_mitts`, tutorial tier): "Up!" → uppercut into the low mitt; "One-two-up!"; then Deshawn tosses a medicine ball off the wall at chest height: the uppercut pops it up and a jab hits it again in the air (the launch-and-follow-up lesson, no enemy). **Deshawn:** "There it is. That's a punch that makes a man reconsider his evening."
  - **Keisha** has been watching from the stairs in her oversized gloves: "Can *I* hit something?" **Hold the mitts** (a reversed mitt drill: position the mitts at the height Jin calls as she swings, 30 s). Thought: "*Teddy did this for me. He never said how heavy it is when they're small.*" **Keisha:** "Am I a real boxer now?" **Jin:** "You're a real boxer now." → `ch5_held_mitts`, `deshawn` +1.
  - Sitting on the ring tape afterwards. **Deshawn:** "I got a fight Saturday the eighth. Mo's card. Co-main." (`taken`: "The one I didn't want.") "I need a corner. My grandma can't watch, and my last cutman was Lenny." (If `ch3_lenny_method = pressed`: "Lenny skipped town, so now I got nobody.") "You know what a corner's supposed to be. Better than anybody."
  - **Choice `ch5_promised_corner`:** "I'll be there." / "I can't promise." (**Deshawn:** "Okay. I'll ask Slim. Slim's slow with the stool, but he don't lie.")

### 5.3 Wednesday: the boiler night (choice in play)
- Hard freeze. At 9 PM Building C's boiler trips. Kids in coats in the stairwell; Darnell carries Keisha down to Odette's. **Shift: Boiler C** (repair sequence, 4 steps): (1) close the feed valve; (2) bleed the air (hold until the hiss turns to water); (3) relight the pilot (a timing press as the gas ticks); (4) bring the pressure up to the red mark and hold it. Mara works the other side by flashlight. **Mara:** "If this goes out tonight, Keisha sleeps in her coat."
- **The interruption** (between steps 2 and 3). Through the high window, a beige raincoat and a briefcase cross the snowy courtyard toward the Council trailer. The camera nudges to the window on its own: a 0.6 s look, the only time this chapter it moves without the player. Thought: "*Pike.*"
- **Choice `ch5_left_repair`** (made in play: the basement door shows `Follow Pike` while the boiler step waits):
  - **Stay** (continue to step 3) → `false`. The pilot catches with a soft *whump*; the gauges climb; the pump whines up; pipes tick through the building. Camera eases out through the high window to the yard: Building C's windows warming one by one. Pike's car leaves twenty minutes later. **Mara** (wiping her hands): "Good. That's good." [beat] "Who was the raincoat? You looked at him like he owed you money." **Jin:** "He does." Darnell, on the stairs with Keisha asleep on his shoulder: "Thanks, man." `mara` +2, `courts` +1, $20.
  - **Follow Pike** → `true`. **Mara:** "Hey— where are you going? *Jin!* I need four hands on this!" Jin crouches under the trailer window in the snow and hears Pike on Nell's phone: "He's at the Courts, Walter. *Living* there. Mara Kowalski's shed." [beat] "No. He doesn't know. He's carrying radiators." [beat] "Then you tell me what to do with him." He hangs up and leaves. → `ev_pike_call` (Jin's pencil note of the words). Back in the boiler room it's dark and Mara is gone; the boiler is relit with a note on the valve: `GOT IT. — M.` Building C was cold for three hours; through Odette's window the player can see the Greer kids asleep on her sofa. Next morning Mara is curt: "Next time tell me you're leaving before you leave." `mara` −2, `courts` −1, no pay for the shift. `abandon_count` +1.
- Either way, night in the loft. Thought: "*Everybody here says 'Walter' like it's a prayer.*" (or, if he followed Pike: "*Walter. Pike calls him Walter.*")

### 5.4 Thursday: Rook (key scene; thin letterbox, the player can walk)
- **Shift: Chairs for Friday** (carry, two-person with Gus: forty stencilled chairs from the basement to the community room; Gus sets the pace: "Left foot. Left foot. Your other left.").
- Noon. Clear and cold. **Rook** arrives **on foot** through the gate with a white bakery box from Polonia Bakery under his arm. The courtyard changes as he crosses it: Keisha runs to him ("Mr. Rook! Mr. Rook! I'm a real boxer!"), Gus hands him the morning paper without being asked, Darnell comes down the scaffold to shake his hand, Nell comes out of the trailer with a folder. **Odette** sits him in her chair on the stoop and stands beside him with her hand on his shoulder. He is a beloved man in a place he saved, and the staging should feel that way: the camera tracks him at 1.0 like any NPC.
- He sees Jin across the courtyard, by the oak. He stops mid-sentence. He takes off his reading glasses and folds them, slowly (the first time the player sees the tell that means *cornered*). Two seconds. He puts them back on. **The camera pans across the courtyard from Rook to Jin over 2.5 s, the tire swing moving between them.** Then Rook walks over, slowly, one hand at the small of his back.
- **Rook:** "Jin Seo." [beat] "I'm glad. I am very glad to see you on your feet."
- *He puts a hand on Jin's shoulder.* Jin lets it stay (the only time in the game). Camera **1.15**, two-shot; the hand at the centre of the frame.
- **Rook:** "Whatever you need. The Council can use a man who can carry things and keep his mouth shut, God knows. Dr. Anand at the Northside clinic sees our people for nothing. I'll call her today."
- **Jin:** "Why?"
- **Rook:** "Because you're here. Because it's what we do here." [beat] "And because I watched you fight. A lot of us did."
- **Rook** (turning toward the trailer): "And a man shouldn't sleep above a workshop in February. 4D's empty. Paint's dry. It's yours tonight if you want it."
- **Nell** (from the trailer door, the folder against her chest): "Walter, 4D is the Vasquez family's. They were approved last Thursday."
- **Rook:** "The Vasquez family can have 3C in April, when the Dudeks go to their daughter's. This man has nowhere."
- **Choice `ch5_took_4d`** (both outcomes stated plainly):
  - `[Take 4D. It was promised to the Vasquez family.]` → `true`. Rook gives him the key with both hands. Nell crosses something out on her clipboard and doesn't look up. `courts` −1, `take_count` +1. 4D becomes Jin's base (a mattress Rook had brought in, a crayon drawing on the sill, `MY HOUSE`, taped by a previous child).
  - "Give it to the Vasquezes. I've got a cot." → `false`. **Rook:** "Pride's expensive in February." He means it kindly. Nell, passing Jin later: "Thank you." That's all.
- **Rook:** "You look well. Better than—" [beat] "I'm glad St. Agnes was good to you."
- [beat 2.0; camera eases to **1.25**]
- **Jin:** "I never said St. Agnes."
- **Rook:** [beat] "Didn't you? I thought Mara—"
- **Mara** (from the workshop door, 80 px away; she heard): "I didn't know."
- **Rook** (taking his hand off Jin's shoulder): "Calder's a small town for bad news, Mr. Seo." [beat] "Eat a doughnut. Keisha will eat all of them if you don't." He moves on to the community room, greeting people, and doesn't look back.
- The thin letterbox stays 4 s on Jin by the oak. Thought: "*He knew which hospital.*" If `ev_pike_call`: "*'You tell me what to do with him.' He was asking Walter.*"
- Objective adds: `Ask Odette when the Council bought the buildings.`

### 5.5 Thursday afternoon: Odette's binder (key scene; conversation)
- The community room; Odette at the Singer; the binder on the shelf. **Jin:** "When did the Council buy the buildings?"
- Odette takes the binder down, sets it on the sewing table, and opens it with both hands. Viewer: **`ev_courts_minutes`**.
- **Odette:** "We had three thousand dollars in June. Bake sales. Gus's raffle. We had a rally on the City Hall steps, and Walter had a megaphone, and the bank sent a man in a nice coat to tell us to go home." [beat] "Then in September we had six hundred and forty thousand. Walter said private partners. Partners who don't want their names on anything." [beat] "I wanted my roof more than I wanted their names."
- **Odette:** "In August of '94 Walter said executive sessions didn't need minutes anymore. I didn't like it." [beat] "I liked the roof."
- **Odette** (at the window, quieter): "Leon passed in the spring of '94. Mr. Rook sat with me the night he went. In my chair, all night. He didn't say anything. He just sat." [beat] "So you'll understand if I don't want to know some things too quickly."
- **Jin:** "September thirtieth."
- **Odette:** "The day we didn't have to leave. Why?"
- [beat 2.0] Jin doesn't answer. (No dialogue option tells her. The suspicion stays his.) **Odette:** "...All right. When you want to say it, I'll be at my machine."
- Thought: "*Forty-one days after the fight. Six hundred and forty thousand. A depot paying for a boiler.*" [beat] "*I can't prove anything.*" (PDF: he suspects a connection; he does not yet have the evidence.)
- Gus, if Jin passes his bench afterwards (optional): "You asked Odette about September. I can tell by her shoulders." [beat] "I was the one no vote. I had the tenants' seat on the Council's executive then. Not a vote on the buildings. On taking money from 'partners' with no names. Four to one." [beat] "Didn't matter. I live here too."

### 5.6 Friday: the roof, the meeting, the wall
1. **Shift: Roof patch, C** (afternoon; vertical traversal + repair): up the fire escape with rolls of tar paper (carry: no dash on the ladder), then a 3-step patch with Mara calling steps (cut, lay, seal with the torch, a slow hold). It finishes as the sun drops behind the stack. `ch4_envelope = taken` and not yet returned: Darnell's crew isn't working, so it's Mara and Jin alone with a blue tarp and sandbags, a temporary fix. Mara sits on an upturned bucket and pours coffee from a thermos into its lid for Jin.
   - **Mara:** "My dad poured iron in that building for thirty years." *(She points the thermos at the stack.)* "When they closed it, he said, 'At least we've got the houses.' Then the bank said we didn't."
   - **Jin:** "And the Council bought them."
   - **Mara:** "Rook found the money. The bank said no, the state said 'maybe '96', and then in September Rook walked in with the cash. I don't know where from. I didn't ask." [beat] "You learn not to look a gift roof too hard."
   - **Jin:** "What if you had to?"
   - **Mara:** "Then I'd look." [beat] "And then I'd still have to fix the boiler."
   - Option (always available): "My sister wanted me to buy a building with a roof that doesn't leak." **Mara:** "Well. This one doesn't. Now." `mara` +1.
   - Sit on the roof edge (optional): camera eases out to **0.8**: Northside, the river, the Civic's dark dome far off. Thought: "*You can see it from everywhere in this town.*" Snow begins.
2. **The meeting** (7 PM; key scene; conversation, staged like a play). The community room; the chairs Jin set out; twenty residents with coats on their laps (six named, the rest posed silhouettes who murmur); Keisha asleep across two chairs under Odette's coat. Odette takes the minutes. Mara stands at the chalkboard: `COURTS FUND (ours, not the Council's): $3,040`. Static wide shot (0.9) with a zoom to 1.15 on whoever has the floor.
   - **Mara:** "Three thousand and forty dollars. Our money. Bake sales and the can. Not the Council's. Three asks. Then we vote."
   - **Darnell:** `left`: "C needs new boiler controls. Kids slept in coats Wednesday. Next time it won't be three hours." / `taken` and not returned: "Pay the crew out of this. Two weeks we worked. Somebody robbed a depot and our money was in it. I'm not asking for a raise. I'm asking for January."
   - **Odette:** "The kitchen roof. There's a bucket under it. Soup is a program too. It's the oldest program there is."
   - **Gus:** "Keep it. All of it. Start our own reserve, so one day we can say no to somebody. And I'd like to know where the roof money came from before we take any more of it."
   - They argue, overlapping, for ~40 s with no player input: none of them is wrong.
   - **Mara** (turning to Jin): "You've worked here all week. You get a voice. Not a vote. A voice."
   - **Choice `ch5_meeting_stance`** (Jin speaks one or two lines and sits down; the vote is the room's):
     - "The boiler. Wednesday can't happen again." → `boiler`. Darnell nods once.
     - "Pay the crew. Pay the people doing the work." → `payroll` (only if the envelope was taken; the player knows exactly why he's saying it). Darnell: "...Thank you."
     - "The kitchen roof. Old people shouldn't eat soup under a bucket." → `kitchen`. Odette: "Write that down. Somebody write that down. Oh, I'm the secretary."
     - "Gus is right. Find out where the money comes from." → `independence`. The room goes quiet. Gus: "Thanks for saying it out loud."
     - `[Say nothing. It's their money.]` → `silent`. Mara looks at him a beat longer than she needs to, then moves on.
   - The vote is fixed by the room's numbers, not by Jin: if the crew is unpaid, the payroll motion wins 14–9; otherwise the boiler controls win 13–10 ("It's always the boiler in January," says Odette, writing). Gus's motion to keep a reserve fails 11–12 in every case. Jin's stance changes what people remember (Ch7) and one prop (Ch6–7): a new thermostat on C with a strip of tape `JIN'S` (`boiler`), Darnell's crew in new matching gloves (`payroll`), a ceiling patch and no bucket (`kitchen`), Gus's motion written into the minutes with "seconded: J. Seo (non-resident, no vote)" (`independence`).
   - The coffee can goes round: **`ch5_donation`** ($0 / $10 / $20 / $50). Any amount ≥ $20 → `courts` +1. Odette sees either way and pats the seat next to her.
   - **Mara** (stacking chairs): "That's how it goes. Everybody loses a little. That's what fair looks like up close."
3. **The envelope at night** (only if `ch4_envelope = taken` and still unresolved). The loft; snow on the window; the envelope examinable (five names). Three options by action, not menu:
   - Walk across the yard to A-3C and knock → `confessed`. Mara in a sweatshirt, a mug in her hand. **Jin:** "I took this from a depot on Harlan Street. Two weeks ago." [long silence] **Mara:** "You robbed a freight company." **Jin:** "Yes." **Mara:** "And you brought back the part with our names on it." **Jin:** "Yes." **Mara:** "...Okay. I'm going to be mad at you for a while, and then I'm going to be done. Don't make me do it twice." [beat] "Why was our payroll at a freight company, Jin?" **Jin:** "Ask the Council." **Mara:** "I'll ask Nell." She closes the door. Saturday she pays the crew and says nothing in front of anyone. `mara` +1 net (she trusts the honesty, not the act). This plants Mara's question two chapters early.
   - Drop it in the pay tin when the workshop is empty → `anonymous`. Saturday morning Darnell holds up the tin in the yard: "Somebody left eighteen-forty in the pay tin. *Exact.* Who the hell does that?" (If Jin spent some: "...eighteen hundred and *something*. Somebody kept bus fare.") Mara looks at Jin once and doesn't ask. `mara` +0.
   - Go to sleep → `kept` (at chapter end). No reaction yet. Ch7: Nell's report lists "maint. payroll lost (robbery) — covered from M. Kowalski personal funds and the Courts Fund."
4. **The wall** (night; the loft). Jin takes Mara's carpenter's pencil from the bench and writes on the bare plaster: `AUG 20 '94`. A hand-span to the right: `SEP 30 '94`. He draws a line between them, then stops and adds a question mark over the line. **Camera** pulls back from the wall through the loft window to the whole courtyard at night: Odette's light, Keisha's hopscotch under new snow, Darnell crossing to the gate in his orange vest for the night shift, and on Foundry Street a broad man in a canvas jacket and a flat cap walking slowly past the arch without coming in.
5. Thought: "*Good people. A good roof. Forty-one days after.*" [beat] "*I just don't know what they cost.*"

## Encounters
None. No enemy exists in any Chapter 5 location. Deshawn's mitts and Keisha's mitts are activities with no damage or loss state.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Keisha's mitts | `ch5_held_mitts` (bool) | "You're a real boxer now." | Ending Two teaching vignette: Keisha, older, holding mitts for a smaller kid. |
| Deshawn's corner | `ch5_promised_corner` (bool) | Deshawn's line | Ch6: the commitment on Saturday the 8th (`ch6_saturday`). |
| Boiler or Pike | `ch5_left_repair` (bool) (PDF Q3, small scale) | Boiler relit together / `ev_pike_call`, a cold building, no pay; `mara` +2 / −2; `abandon_count` +1 if left | Ch7: Pike's call corroborates that Rook was managing Jin. Ch9 night, Mara: "You stayed with the boiler. I remember that kind of thing." / "You left me with the boiler once. I remember that kind of thing." |
| Unit 4D | `ch5_took_4d` (bool) (PDF Q1) | Base; `courts` −1; `take_count` +1 | Ch6: Elena and her kids are in Odette's front room "until April". Ch7 Rook: "I gave you 4D. I took it from a woman with three children and gave it to you, and you took it. We're the same animal, Jin." Ch9 Penner. Ch10 reflection. |
| The meeting | `ch5_meeting_stance` = `boiler` / `payroll` / `kitchen` / `independence` / `silent` | One line; the room still votes | Ch6–7 prop; Ch7 who speaks up for Jin first (Darnell / Odette / Gus); Ch9 night lines. |
| Donation | `ch5_donation` (amount) | `courts` +1 if ≥ $20 | Ch7 Odette: "You put money in the can. I saw." |
| The envelope | `ch5_returned_envelope` = `confessed` / `anonymous` / `kept` (unset if `ch4_envelope = left`) | Mara's door / Darnell's exact tin / nothing | Ch7 Mara: `confessed` "You told me. That's the only reason I'm still talking to you." / `kept`: the report is read aloud; `mara` −1, `courts` −2. `take_count` stays +1 for `kept`; returning doesn't erase that he took it. Ch9 Penner. |

## Chapter ending and state handed on
- Ending beat: the wall and the long shot (5.6 step 4).
- **Completion screen:** the courtyard at night from the loft window, with `AUG 20 '94 — ? — SEP 30 '94` in pencil faint in the corner. "The people who benefited become human." What you did: "You stayed with the boiler." / "You told the meeting to fix the kitchen roof." / "You held the mitts for Keisha." / "You gave 4D back."
- **Handed on:** uppercut; training cap 3; base = the workshop loft (or 4D); money +$20 per shift (≤ $100); evidence `ev_courts_plaque` ★, `ev_courts_minutes` ★, optional `ev_pike_call`; memory `mem_singer`; People entries for every resident; map: Foundry Street adds **Council HQ** (closed). Foundry Courts becomes home: a save point and fast-travel stop that changes in every later chapter.
- Time card for the next chapter: `Monday, February 3.`



# Chapter 6 — Undelivered

**Card:** `Undelivered` · `Calder · Monday, February 3, 1997` · bell: muffled, closer; the strike is now clearly a bell. It is answered not by another sound but by **silence**, held 1.5 s, then a radiator knock.

## Date, mood, palette, weather
- Monday, February 3 to Tuesday, February 11, 1997 (the first anniversary of the fire). Six playable days joined by time cards: Mon 3 (the Annex, the box), Tue 4 (Garrison Street), Wed 5 (the speed bag, Kwik Copy, a phone call), Sat 8 (one night, two places), Mon 10 (88 Market or its aftermath; Sunny's; the board), Tue 11 (Section 14). Days without a pinned scene can be skipped by sleeping.
- Mood: sorrow with a task. A detective's patience in civic buildings that smell of radiator paint. Anger that narrows to one name, and at the very end grief that has nothing to do with anyone else.
- Palette: the Annex in institutional green and beige, frosted glass with gold-leaf window numbers; Garrison Street in sooty yellow brick; the Lindell House ruin charred black with icicles at the window heads, white plastic sheeting flapping; Garrison Suds warm yellow behind steamed windows; Market Street blue-gray with the pink neon tooth of Brandt Dental; Mara's workshop the warm room the player comes back to every night; the cemetery the only open sky, pale and cold, with one red or yellow thing in it if Jin brings flowers.
- Weather: thaw. Monday rain; Tuesday river fog swallowing the upper floors; Saturday wet snow; Tuesday the 11th light snow, then still.

## Gameplay identity
**Walk Min's route two years late.** Read, compare, queue, listen, sort. The player claims his family's belongings and reads them, walks the place they lived, takes testimony, develops a dead woman's film, and builds a timeline on the loft wall that will not let him blame a single thing. Two short confrontations break the rhythm without dominating it, and neither follows an emotional discovery. Several leads are open at once and can be taken in any order (a MapleStory-style hub investigation).
- Exploration 25% · dialogue 20% · investigation 35% · combat 8% · activities 12% (the window run-around, folding sheets, working a corner, the board, a button).
- Target length: 22–25 min.
- **New this chapter:** the flurry (Wednesday, the Courts speed bag). **The core toolkit is now complete**; nothing new is added after this chapter (PDF: by Chapter 6 the player has the essential tools). Training cap stays 3.
- Base: the workshop loft (or 4D). Mara drives where the bus doesn't go (a 3 s side-view truck vignette with her radio on). The loft wall from Ch5 (`AUG 20 '94 — ? — SEP 30 '94`) becomes the **timeline board**.

## Locations

### `annex` — City Hall Annex (1600 × 720, two floors joined by an elevator)
- **Ground floor, left → right:** revolving door → security desk (guard Ruben with a newspaper) → bench rows (a woman with a stroller; an old man with a folder of carbons) → a red take-a-number dispenser (`NOW SERVING 41`) → **Window 3** Housing Authority → **Window 5** Building Department (Bernice Hale) → **Window 7** Mail Return / Unclaimed → elevator. A sign over every window: `ALL REQUESTS IN WRITING — FORM 7B`. A wall clock four minutes slow. Scuffs on the floor in front of each window where people have stood for years. A long wooden **bench** under a portrait of a 1950s mayor (sit spot).
- **Basement:** the **county property cage** (Leon Dukes behind wire mesh) → aisles of cardboard boxes labelled by surname and date (`ALVAREZ — 11/95`, `UNKNOWN MALE — RIVER — 1/96`, **`SEO — LINDELL — 2/96`**) → a **reading table under one hanging lamp** → a floor drain and mop bucket. A clipboard on the cage: `UNCLAIMED PROPERTY HELD 12 MONTHS, THEN DISPOSED`. The Seo box's tag: `DISPOSE AFTER 2/14/97` (a fact, not a timer; it tells the player how close it came).
- Light: fluorescent green-white; the basement one lamp over the table. Sound: the number dispenser's *ding*, two typewriters, rain on the high windows, the elevator hum, a dripping pipe.
- Exits: Market Street bus stop (map); elevator.

### `garrison_street` — Garrison Street, The Flats (1800 × 420, exterior)
Left → right: Route 14 stop → Duffy's Pawn (grate down) → **Garrison Suds** (lit, steamed windows; door → `garrison_suds`) → a vacant lot with a burnt mattress → **Lindell House** behind chain-link and flapping plastic, a stapled city notice `CONDEMNED · CITY OF CALDER · DO NOT ENTER`, a church's plastic flowers wired to the fence → a telephone pole with **Min's flyer**, weathered, still stapled → Garrison Realty's shuttered office (a new sign: `FOR SALE — DEVELOPMENT OPPORTUNITY — GARRISON REALTY`) → the street's end at the rail cut.
- Light: rain or fog; sodium lamps; plastic sheeting flapping. Sound: a freight train in the rail cut every few minutes; the dryers; a dog behind a fence; church bells at noon from St. Columba's (thought, the first time: "*Bells.*").
- Exits: bus stop; Suds door; the fence gap → `lindell_ruin`.

### `garrison_suds` — Garrison Suds laundromat (900 × 360)
Door with a bell → a row of washers → dryers (`DRYER 6 STICKS`) → **the long folding table** (Wendell Asher) → change machine → back door. A dusty coffee can on the counter: `LINDELL HOUSE FIRE — FAMILIES FUND — THANK YOU` (1996; two quarters in it). A sign: `NO DYEING. NO SLEEPING. NO KIDDING. — MGMT`. Warm yellow; steam; the dryers' tumble and buzzer.

### `lindell_ruin` — Lindell House, burnt (1000 × 600, three floors, vertical)
- **Ground (y 540):** front hall; the collapsed main stair (impassable); the rear hall → **the rear exit**: a steel door, a length of chain still looped through the push bar, the padlock melted into a lump.
- **Exterior fire escape** (right side): a ladder, then a gap where the 2nd-floor landing fell (jump + **air dash** across; the tip appears only after two failures: `Jump, then dash in the air.`).
- **2nd floor (y 360):** soft, sagging boards (darker patches); copper strippers pulling wire from the walls; Room 4.
- **3rd floor (y 180):** a hall with a scorched ceiling and an **empty smoke-detector bracket by the stair** (the detector itself is gone, taken as evidence); **Room 7** (the shell of a space heater, the floor burned through around it); **Room 9** (Umma and Min's: two iron bedframes; the cast-iron frame of a treadle sewing machine with its wooden top burned away and the wheel still on its axle; a scorched wall calendar; the window Min photographed the back door from). Snow blows in through the roof onto Room 9's floor.
- Light: gray daylight through holes. Sound: wind, drips, the strippers' radio (a ballgame), the train.

### `market_street` — Market Street, downtown (1400 × 360, exterior)
Left → right: Route 9 stop → **Kwik Copy** (red sign; wedding invitations in the window; door → `kwik_copy`) → a newsstand (`RING` magazine with Ray Castell on the cover: `THE PROMISE KEPT`; the vendor reads it aloud to nobody: "Castell at the Civic, March eighth. Farewell show. Who's he even fighting?") → **88 Market St**: Brandt Dental on the ground floor (pink neon tooth) and a street door with a directory `2F — CALDER FOUNDRY RELIEF FUND — G. PIKE` (door → `fund_office`) → First Calder Savings → an alley with a dumpster.
- Light: blue dusk, the neon tooth, office windows going dark. Sound: traffic, the dentist's drill through the wall.

### `kwik_copy` — Kwik Copy (800 × 360)
Counter with a bell → two big copiers → a curtain to the one-hour photo lab → staff cubbies. One cubby still has a name tag taped to it: `MIN`. Above the counter, a photo-booth strip: Dot and Min pulling faces, 1993. Fluorescent; copier rhythm; the lab fan.

### `fund_office` — 88 Market Street, 2F (stairwell 360 × 540 + office 960 × 360)
Street door → a narrow stair with a landing (a dying rubber plant) → a door with gold letters `CALDER FOUNDRY RELIEF FUND` → reception (empty desk; a 1995 calendar still on January; a jar of butterscotch) → **Pike's office** (desk; a **locked right-hand drawer**; a filing cabinet; a **shredder**; a window on the neon tooth; a framed photo of the Foundry's last shift, 1992, with the Fund's logo printed on the mat) → **storage room** (steel shelving; three mail trays: `1180 — RECEIVED — HOLD`, `1180 — FORWARD W.R.`, `1180 — DISCARD`).
- Light: desk lamp, the neon through frosted glass, a bare bulb in storage. Sound: the shredder's whine, a radiator, the drill downstairs.

### `cemetery_s14` — Calder Municipal Cemetery, Section 14 (1400 × 420, exterior)
Gate with a flower cart (yellow carnations, $5) and the **cemetery office** (a small stone lodge: a ledger on a stand, a space heater) → a gravel path between old family plots → **Section 14**: flat county markers in rows, numbers only → **96-031 and 96-032** side by side; between them a small white wooden cross, hand-lettered `MI-OK & MIN-JI SEO — ST. COLUMBA'S REMEMBERS`; behind them a **small gray stone**: `SEO MI-OK 1942–1996 · SEO MIN-JI 1972–1996` → a **bench** under a bare tree → a view down the hill to the river, the foundry stacks and the downtown towers (Ashgrove Tower the tallest, its top lit even in daylight).
- Light: clear cold light. Sound: wind, crows, distant traffic.

Reused: `courts_workshop` (base, the board), `courts_community` gym (speed bag), `courts_yard`, `sunnys`, `okafor_3a` (side), `cellar` (Saturday, corner path).

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `mara` | workshop; drives the truck | wiping hands; driving | "Where to?" / (Monday night, after 20 s of stillness, without turning round) "Coffee's hot. It's still bad." | — | Ch5 flags |
| `dukes` (Leon Dukes, 63, property clerk) | Annex basement cage | `write at desk`; gray cardigan, a pencil behind each ear | "Seo. Seo... One box left; the other was water damage. You're cutting it close, son. Fourteenth they go to the incinerator." / "I need something that says Seo with your face on it." | "Number, please." | the licence |
| `hale` (Bernice Hale, 58, Window 5 clerk) | Window 5 | cat-eye glasses on a chain, purple cardigan, a radio earpiece for the ballgame | "Seo. The girl with the camera. Every two weeks. She brought her own carbon paper because ours ran out." / "I'm not sending you round the windows. She went round them enough for both of you." / "The inspector rescheduled twice. I typed both reschedules. I'm sorry. I typed them." | "Five! Number forty-four!" | the run-around |
| `asher` (Wendell Asher, 60s, former Lindell night man) | Garrison Suds folding table | folding sheets that never end | see scene 6.3 | "Dryer six sticks. Kick it low." | `ch6_asher_method` |
| `fitz` (Fitz Mahoney) + 2 cousins | Lindell 2nd floor | `thug` builds, hard hats; a shopping cart of wire outside | "Building's condemned, pal. Finders keepers." | "Watch the floor, it's soft." | `ch6_strippers` |
| `deshawn` | Courts gym (Wed); the Cellar (Sat) | `skipRope`; speed bag | "Stop thinking. It's a rhythm. You're counting. Don't count. Listen." | — | `ch5_promised_corner`, `ch6_saturday`, `ch6_towel` |
| `dot` (Dot Pham, 30s, Kwik Copy) | Kwik Copy counter; red polo, toner on her sleeves | `work` | "You're Min's brother. You're Min's brother who's *alive*." / "She worked Saturdays so your mom didn't have to fold sheets on Saturdays. You know that?" | "Copies are seven cents. For you, they're seven cents." | returns Ch8 |
| `hana` | phone (Wednesday); Sunny's booth (Monday the 10th), off duty, navy peacoat, gray scarf | `sit` | see scenes 6.5 and 6.8 | — | `ch1_records_route`, `ch1_told_hana_boxing`, `ch1_fare_source`, `ch4_called_hana`, `hana` |
| `pike` | Fund office (Saturday night only), shirtsleeves, raincoat on the chair | feeding the shredder | see scene 6.6 | — | `ch1_pike_stance` |
| `carl`, `benny`, `vic` (Ch2 collectors) | Fund stair landing (Saturday night only) | leaning on the wall | Benny (if `let_go`): "You let me walk. I'm walking." / Carl: "Pike pays me to stand here. So I'm standing here." | — | `ch2_collector_after` |
| `brandt` (Dr. Saul Brandt, the dentist downstairs; corner path only) | 88 Market street door, Monday 9 AM | keys in hand, white coat | "He left owing two months and a box of butterscotch. Take whatever's his. I'm calling the landlord at noon." | — | — |
| `rita` | Sunny's | coffee pot | "Booth by the window's yours. She sat in it every Saturday." | — | — |
| `okafor` | 3A (side); Section 14 (if the cake print was given) | standing with her purse in both hands | "She made the cake herself. Three layers. It leaned like the Tower of Pisa. We ate the whole thing." | — | `q6_okafor_print` |
| `elena` (side, only if `ch5_took_4d`) | Odette's front room, three kids asleep on the sofa | `sit` | "You're the boxer in 4D? ...It's nice, 4D. The light's good in the morning." (no blame; that's what makes it land) | — | `ch6_gave_back_4d` |
| `mo`, `slim`, `lenny`, `ferris` | the Cellar (corner path) | — | Mo: "Working a corner, Ghost? Corners don't get paid much. Corners get blamed." / Slim (if `slim ≥ 2`): "I'll carry your stool. Don't tell anybody I'm nice." | — | Lenny is there only if `ch3_lenny_method = patient` |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `i6_licence` | (inventory) Athletic Commission licence | `SEO, JIN — PROFESSIONAL BOXER — STATE ATHLETIC COMMISSION — LIC. CA-1187 — EXP 03/95`, a photo of Jin at 25, unscarred. | ID at the cage |
| `i6_box` | Box `SEO — LINDELL — 2/96` | Opens the **box viewer** (scene 6.2) | `ev_shopping_list`, `ev_fridge_note`, `bel_min_coat`, `ev_umma_paystubs`, `ev_min_notebook` ★, `ev_detective_invoice`, `ev_council_referral`, `ev_judgment`, `bel_scrunchie`, the Pentax |
| `i6_window3` | Window 3 | after the run-around | `ev_ha_application` |
| `i6_window5` | Window 5 | after the run-around | `ev_building_complaints` ★, `ev_fire_report` |
| `i6_window7` | Window 7 bin | Only if `ch2_took_mailbox` is false: "*Return-to-sender bin. 'SEO' in the S drawer.*" | `ev_returned_letter` |
| `i6_min_flyer` | Flyer on the pole | Photo viewer: `HAVE YOU SEEN JIN SEO? Boxer, 26. Last seen Calder General Hospital 8/22/94. Call Min 555-0143 / Lindell House Rm 9, Garrison St.` "*Three layers of staples. She kept coming back to put it up again.*" | — |
| `i6_suds_can` | Coffee can (Suds) | "*'Lindell House fire — families fund.' Two quarters.*" Option: drop $5 (no flag; Asher sees: "...Thanks.") | — |
| `i6_rear_door` | Rear exit (Lindell ground floor) | "*A chain through the push bar. The padlock melted shut. Somebody had to put this here. Somebody had to lock it every night.*" | board card |
| `i6_detector_bracket` | Bracket (3rd floor) | "*An empty bracket. The report says it went off. Her battery.*" (before the report: "*A smoke-detector bracket. No detector.*") | — |
| `i6_heater_shell` | Space heater (Room 7) | "*Room seven. This is where it started. Somebody was cold.*" (No blame on the resident.) | — |
| `i6_room9_calendar` | Calendar scrap (Room 9) | "*'Sat 2/10 — Mrs. O bday — CAKE.' The day before.*" | — |
| `i6_room9_singer` | Burnt sewing machine | "*The wheel still turns.*" (it does, once, if pushed) | — |
| `i6_room9_window` | Window (Room 9) | "*From here you can see the back door.*" (after `ev_film_roll`: "*This is where she took it.*") | sit spot |
| `i6_min_cubby` | Cubby `MIN` (Kwik Copy) | "*Dot never took her name down.*" | — |
| `i6_shredder_basket` | Wastebasket (Fund office) | "*Shredded strips. I can read 'AHN, D.' on four of them.*" | — |
| `i6_foundry_photo` | Framed photo (Fund office) | "*The Foundry's last shift. A charity printed its name on a picture of men it never paid.*" | — |
| `i6_tray_hold` | Tray `1180 — RECEIVED — HOLD` | "*Nine envelopes. Min's handwriting. Every one stamped received.*" | `ev_min_letters` ★ |
| `i6_tray_forward` | Tray `1180 — FORWARD W.R.` | "*Empty. Whatever went to W.R. went.*" | — |
| `i6_pike_drawer` | Right-hand drawer | Locked until Pike opens it (Saturday) / found open with the two sheets squared on the desk (Monday) | `ev_pike_memo` ★, `ev_rook_reply` ★ |
| `i6_cemetery_ledger` | Ledger (cemetery office) | `Seo, Mi-ok / Seo, Min-ji · Sect. 14, county 96-031 / 96-032 · Marker stone: paid cash, T. MARSH, 4/96.` "*Teddy. Teddy paid. Teddy never said.*" | `ev_stone_ledger` |
| `i6_markers` | Markers 96-031, 96-032 | "*Numbers. The county gave them numbers. Somebody gave them their names back.*" With flowers: "*Yellow. Umma liked yellow. She said they were loud.*" | `ch6_flowers` |
| `i6_cross` | Wooden cross | "*'St. Columba's remembers.' Mrs. Okafor's church.*" | — |

## Evidence found this chapter (text as shown in the viewer)
- `ev_shopping_list` (Umma's hand, Min's additions): `rice 20 lb / scallions / navy thread / BATTERIES (hall detector!!) / stamps (Min) / lottery?? NO.` Min, under it: `lottery YES. one ticket. for science.`
- `ev_fridge_note` (still stuck to a red plastic strawberry magnet): `AFTER: Sunny's, window booth. Umma says last bus is 12:10 so WIN FAST. — M` (the Ch0 note).
- `bel_min_coat`: Min's charcoal wool coat; one navy button half-sewn, the needle still threaded, pinned through the cloth so it wouldn't fall.
- `ev_umma_paystubs`: Royal Linen Service (hotel sheets), eighteen months in a rubber band; sixty-hour weeks; margin notes `Sat. — extra 4 hrs. For Min's books.` / `Sun. off. Church, then Box 1180 letter w/ Min.`
- `ev_min_notebook` ★: two years of calls and fares. The page that matters: `Calder Gen records — "transferred, sponsor confidential" — they said write to sponsor: P.O. Box 1180` and a column `Box 1180 — #1 ✓ #2 ✓ #3 ✓ #4 ✓ #5 ✓ #6 ✓ #7 ✓ #8 ✓ #9 ✓ — no answer`. Also: `Athletic Comm. — lic. lapsed — "we can't release purse to family"`; `St. Agnes? Hillcrest — called 11/2 — "no such patient"`; bus fares to Pittsburgh, Cleveland, Buffalo hospitals.
- `ev_detective_invoice`: `CALLOWAY INVESTIGATIONS · Retainer $350 (two payments) · Report: Subject not located under given name. No forwarding from Calder General after 8/22/94. Recommend police missing-persons report.` Min's pencil: `Filed 9/6. Ha.`
- `ev_council_referral`: on Northside Community Council letterhead, January 20, 1995: `Re: Tenant Emergency Fund application, Seo, Mi-ok, 412 Kessler Ave #3B. Eastgate lies outside the Council's service area. Your application has been referred to the Calder Housing Authority. — G. Pike, for the Council.` Thought: "*Pike. He was handling my bed and her rent in the same month.*"
- `ev_judgment` (the family's copy): `Kessler Realty v. Seo — Judgment for possession — April 11, 1995 — stay of 30 days.` On the back, Umma's handwriting: `Jin's purse — Athletic Commission holds until the fighter signs. They will not give it to the mother. — M.O.`
- `ev_ha_application` (Window 3): `Calder Housing Authority · Emergency placement · SEO, Mi-ok (head), SEO, Min-ji · filed 2/95 · resubmitted 4/95, 6/95 · status: PENDING — INCOMPLETE: whereabouts of household member SEO, JIN.` Thought: "*They couldn't verify me because somebody made sure I didn't exist.*"
- `ev_building_complaints` ★ (Window 5): three complaints on Lindell House, 14 Garrison St: `9/14/95 — rear exit chained at night; no heat 3F rear (space heaters in use); detector missing 3F hall` (a petition, eleven signatures; the first: `Seo Min-ji, Rm 9`) / `11/30/95 — same` / `1/29/96 — same; photograph attached`. Log: `inspection 10/30/95 — no access (agent not present)` / `12/18/95 — postponed (staffing)` / `next: 2/22/96`.
- `ev_fire_report` (in the same folder): `Calder FD · Feb 11, 1996, 02:40 · Lindell House · Origin: Rm 7 (3F rear), portable electric heater. Rear exit (ground) chained and padlocked. 3F hall detector sounded (battery recently installed by a resident); occupants of Rms 1–8 evacuated by front stair. Deceased: SEO, Mi-ok (53); SEO, Min-ji (23). Owner: Garrison Realty (D. Lazarou). Referred to District Attorney 4/96.`
- `ev_asher_testimony` (full or partial; see 6.3). Full includes the note `Chain rear door nights. Squatters. — D.L.`
- `ev_film_roll` ★ (see 6.4).
- `ev_min_letters` ★ (nine letters; see 6.7).
- `ev_pike_memo` ★ (typed, Fund letterhead): `June 12, 1995. Walter — The Seo girl has written six times to Box 1180 and has come to this office twice. She traced the Fund through the Calder General ambulance invoice. She is persistent, organised and polite. The household was evicted last month; the mother's January application to our Tenant Emergency Fund was referred out per your standing instruction. She is now asking St. Agnes by name. How do you want this handled? — G.P.`
- `ev_rook_reply` ★ (handwritten, slanted, blue ink, on a Northside Community Council memo slip): `Gerald — Maintain. No contact, no confirmation. Nothing from our fund under that name. It holds, or everything goes. — W.R. 6/14/95`
- `ev_pike_statement` (Saturday path, optional; see 6.6).
- `ev_whitlow_affidavit` ★ (Hana; see 6.8): `I, Anita Whitlow, M.D., attending physiatrist, St. Agnes Long-Term Care, have compared the patient known as Daniel Ahn with the State Athletic Commission's 1993 physical of Jin Seo (healed fracture, fourth metacarpal, right hand; dental record) and attest they are the same man.`
- `ev_stagnes_calllog` (if `hana ≥ 3`): `St. Agnes switchboard · 11/02/95 14:10 · caller: Seo, Min-ji · asking for patient SEO, JIN · "no such patient" (per CFRF directive: route all inquiries to the Fund).`
- `ev_stone_ledger` (cemetery).

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q6_main` | main | `Find out how they lived. Not only how they died.` → (leads shown together) `The Annex: ask under Seo.` · `Lindell House, Garrison Street.` · `Min's film. Kwik Copy, Market Street.` (after the box) → `Put it in order.` (board, pass 1) → `P.O. Box 1180. 88 Market Street.` → `Read them. Sunny's, the booth by the window.` → `Put it in order.` (pass 2) → `February eleventh.` | Each lead's ★ items; both board passes; the Fund discovery; Sunny's; Section 14 | The chapter's turn |
| `q6_saturday` | choice (if `ch5_promised_corner`) | `Saturday night: Deshawn's corner, the Cellar, 8 PM.` and `Saturday night: Pike is clearing out his office.` (both on the map at once; the journal says plainly: `You can be at one of them tonight.`) | Going to either | `ch6_saturday` |
| `q6_okafor_print` | side | `Bring Mrs. Okafor the cake picture.` | Dot prints a second copy of frame 2; give it at 3A | `ch6_okafor_print`; her framed copy appears later; she's at Section 14 on the 11th |
| `q6_hana_repay` | side (only if `ch1_fare_source = hana_loan`) | `You owe Hana twenty dollars.` | Pay her at Sunny's | `ch6_hana_repaid`, `hana` +1 |
| `q6_4d` | side (only if `ch5_took_4d`; no HUD text, Elena in Odette's window is the prompt) | — | Talk to Elena; choose | `ch6_gave_back_4d` |

## Scripted scenes

### 6.1 Monday: the Annex
1. The loft, morning. Jin pins `ev_okafor_account` on the wall; camera 1.3 on the card. Thought: "*I know how they died. I don't know how they lived the last year and a half.*" The leads appear together. Mara, already taking the truck keys off the board: "Where to?"
2. **The cage.** Dukes: "I need something that says Seo with your face on it." Jin slides the Athletic Commission licence under the mesh (`i6_licence`; it came from the property bag in Ch1, so the player always has it). Dukes looks at the photo, at the scar, at the photo (camera 1.25 between them): "You look like you're being arrested for tax fraud." Jin stops. (Min's joke about the promotional photo, out of a stranger's mouth.) Thought: "*That's what she said.*" Dukes, not knowing why the man in front of him has gone quiet: "...It's a compliment. Most people look dead in these." He brings out the box. "Expired, but it's your face. One box. The other was water damage. Fourteenth they go to the incinerator." Thought: "*Until February. Mrs. Okafor said until February.*"
3. **The box** (sit at the reading table; no enemies, no timer). The box viewer shows one item at a time with a soft lift sound, laid on the table in a fixed spot so the table becomes a map of their lives. **The order is fixed so the mundane comes before the pleading:**
   1. `ev_shopping_list`. Thought: "*Navy thread.*" [beat] "*Batteries, hall detector, two exclamation marks.*"
   2. Min's Pentax K1000, film still in it, the counter at 8. Thought: "*Eight frames. She never finished the roll.*" → new lead `Min's film. Kwik Copy.`
   3. `ev_fridge_note` on its strawberry magnet. **The camera holds the note at 1.5 for 3.0 s.** The drip. Nothing else. Thought: "*I never got there.*"
   4. `bel_min_coat`. Jin holds it up with both hands at arm's length, the way Umma held his trunks to the window light (a pose echo). Camera 1.4 on the threaded needle for 2 s. He folds it and puts it aside, separately from everything else.
   5. `ev_umma_paystubs`. Thought: "*Sixty hours. Saturdays too.*"
   6. `ev_detective_invoice`. 7. `ev_council_referral`. 8. `ev_judgment` (turn it over: Umma's note about the purse). Thought: "*They wouldn't give her my money because I wasn't there to sign. I was on Hillcrest Road, signing nothing.*"
   9. `bel_scrunchie` (yellow, gray at one edge).
   10. `ev_min_notebook` ★. The viewer opens on the Box 1180 page. Thought: "*Box 1180. Pike's card says Box 1180.*"
   - After the last item the player can sit as long as they like (camera eases out to 0.85; the drip; the elevator hum). The objective only reappears when Jin stands.
4. **The windows (activity: the run-around).** Window 3 needs Form 7B stamped at Window 5; Window 5 stamps only building files and sends Jin back to 3 for "claimant ID for the household member"; Window 3 says the application is filed under the head of household and needs "proof of the claimant's relationship". Each window has its own number queue; the dispenser dings. A small counter in the HUD corner: `Trips: 1 … 2 … 3`. Thought on trip 2: "*She did this. In block capitals. Twice a week.*" On trip 3, **Bernice Hale** at Window 5 looks at the name on his form, takes off her glasses, and leaves her window (the queue groans). She walks the papers to Window 3 herself. "I'm not sending you round the windows. She went round them enough for both of you." Three folders: `ev_ha_application`, `ev_building_complaints` ★ with `ev_fire_report` clipped inside. "The inspector rescheduled twice. I typed both reschedules. I'm sorry. I typed them." (Most staff are ordinary people. She is one of them.) If `ch2_took_mailbox` is false, she points at Window 7's bin on the way back (`ev_returned_letter`).
   - Reading `ev_fire_report`, the Annex noise drops (muffle 0.5); thoughts appear one at a time as the player scrolls: `3F hall detector sounded (battery recently installed by a resident)` — "*BATTERIES, two exclamation marks. Her battery. That's how the others got out.*" / `Rear exit chained and padlocked.` / `next: 2/22/96` (from the complaints) — "*Eleven days. The inspector was coming in eleven days.*"
   - The bench under the mayor's portrait is a sit spot: the camera eases out to the whole long hall, Jin small, the slow clock moving. Nothing happens until the player stands.
5. **Night, the workshop.** Mara clears the bench and goes to the far end of the shop to work on a carburettor with her back to him: she gives him privacy by staying in the room. The coat on the cot. After 20 s of stillness: "Coffee's hot. It's still bad." That's all she says. Breath zone; sleep advances.

### 6.2 Tuesday: Garrison Street (fog)
- Mara drives (vignette): at the far end of Garrison Street the black shell of Lindell House slides past the passenger window. Jin doesn't turn his head. Mara sees him not turn it and drives a little slower.
- The flyer on the pole is the first interactable in the player's path.

### 6.3 Garrison Suds: Wendell Asher (PDF Q2: threaten a frightened witness to save time?)
Asher folds sheets at the long table. He knows who Jin is from the flyer; he's looked at it every day for a year.
- **Asher:** "You're the brother. From the poster." *(keeps folding)* "I was night man at Lindell. I'm not anymore."
- **Jin:** "Who chained the back door?"
- Asher's hands stop. "...I've got forty sheets for the Holiday Inn by four."
- **Choice `ch6_asher_method`** (the brackets say exactly what Jin does):
  - `[Help him fold. Let him talk while he works.]` → `patient`. **Activity: folding** (12 sheets; a two-button rhythm: grab the corners when the sheet billows, fold when it falls; mistakes cost only time). Umma folded hotel sheets at Royal Linen; the player does it beside a stranger while he tells it. Between sheets, in pieces:
    - "Mr. Lazarou. Garrison Realty. He said chain the rear door at night. 'Squatters.' I had the key on my ring."
    - "Your sister asked me twice to leave it open. 'Mr. Asher, if there's a fire, we're on three.' I said talk to Mr. Lazarou. She did. She wrote letters. She was good at letters."
    - On the last sheet he takes a folded note from his wallet and puts it on the stack: `Chain rear door nights. Squatters. — D.L.` "I kept it. In case. In case of what, I don't know. In case somebody ever asked me."
    - [beat 2.0] "The night of it, the alarm on three went off. Hers. She'd put a battery in it. I got four people out the front. I never thought of the back." [beat] "Your sister came down the stairs. She got to the bottom. I saw her at the front door." [beat] "She went back up for your mother."
    - [Silence 3.0 s. Asher keeps folding, badly. Jin holds his end of a sheet, head down.]
    - He asks nothing of Jin. `ev_asher_testimony` (full, with the note). Asher becomes a possible copy holder and witness.
  - `[Pull the sheet out of his hands. You don't have all day.]` → `threatened`. Jin yanks it; Asher flinches back into the dryers (`cower`). "The door was chained. Owner's orders. That's all I know." He goes out the back door and doesn't come back. `ev_asher_testimony` (partial: no note, no name beyond "the owner", no account of the night). About 90 s instead of four minutes. `threat_count` +1.

### 6.4 Lindell House (traversal, a short confrontation, then Room 9)
- Through the fence gap. Ground floor: the rear exit and its chain (`i6_rear_door`). The collapsed stair means the only way up is the exterior fire escape (one-way platforms, then the fallen landing: jump + air dash). Traversal, not combat.
- **2nd floor: the copper strippers** (`ch6_strippers`). Fitz and two cousins pulling wire into a duffel. **Fitz:** "Building's condemned, pal. Finders keepers."
  - "My mother and sister lived on three." → `talked_down`. Fitz takes off his hard hat. "...Your people? Jesus. Okay. Okay, we're gone. Take whatever you want. We didn't touch three." They leave with the duffel half full.
  - "Get out." → **Fitz:** "Or what?" → `fought` (E6.1). They flee down the fire escape.
- **3rd floor.** The hall and the bracket. Room 7: the heater shell ("*Somebody was cold.*"). **Room 9.** The camera eases from 1.0 to **1.3** and stops at the doorway; Jin steps in only as far as the threshold plank. Two bedframes; the burnt Singer frame with its wheel; the calendar scrap (`Sat 2/10 — Mrs. O bday — CAKE`); the window over the back door. [hold 4.0 s] No thought line. No music. Snow falls into the room through the roof.
- **Breath zone (guaranteed, extended):** the windowsill is a sit spot. Sitting eases the camera slowly out to **0.8**, showing all three floors in section, snow falling through the roof into Room 9. Thoughts, one per sit-beat: "*She stood here.*" / "*The cake was the day before.*" / (only if `patient`) "*She went back up.*" / "*I was on Hillcrest. Thirty-seven ceiling tiles.*" Wind only. Climbing down ends the zone.

### 6.5 Wednesday: the speed bag, the film, the phone
1. **The flurry** (Courts gym, morning). The speed bag that kept getting away from him. Deshawn, skipping rope, without stopping: "Stop thinking. It's a rhythm. You're counting. Don't count. Listen." Activity: tap punch on the bag's rhythm; after four clean bars the prompt changes to the flurry input and Jin rattles out a half-second burst with a clear final pop. **Deshawn:** "*There.* That's a sound I like." Toast: `Flurry. Short and deliberate. The toolkit is complete.`
2. **Kwik Copy.** Dot sees the Pentax before she sees Jin. Then she sees Jin. "You're Min's brother. You're Min's brother who's *alive*." She doesn't hug him; she takes the camera very carefully, like it's hot. "One hour. Sit. I'm not letting you walk around with Min's roll undeveloped." (Sitting passes the hour.) **Photo viewer: `ev_film_roll` ★**, eight frames with Dot's commentary:
   1. Umma asleep on the Route 14 bus, her head on the window, sewing in her lap. Dot: "Your mom slept on every bus in Calder."
   2. Mrs. Okafor's birthday cake, three layers, leaning. Dot: "Min made that. It leaned like the Tower of Pisa." (→ `q6_okafor_print`: Dot prints a second copy unasked.)
   3. **The chained rear door of Lindell House**, a wooden ruler held against the chain for scale, Min's thumb at the edge of the frame, date-stamped `01 28 96` in orange. Dot goes quiet. "She said she was taking it to Channel 8 if they didn't fix it."
   4. Umma laughing at Sunny's in the booth by the window, a fork in the air.
   5. Min's reflection in a shop window, holding a stack of `HAVE YOU SEEN JIN SEO?` flyers, sticking her tongue out at the camera.
   6–8. Snow on Garrison Street, three nearly identical frames. Dot: "She always shot three of everything. In case."
   - **Dot:** "She worked Saturdays here so your mom didn't have to fold sheets on Saturdays. You know that?" If `ch0_purse_dream = umma_saturdays`: **Jin:** "That was supposed to be my job." **Dot:** "Yeah. She said."
3. **The phone** (evening; the workshop phone rings twice before anyone notices). **Mara:** "It's for you. A Hana." **Hana:** "Pike told Sister Margaret the Fund is closing. 'Winding down.' He asked for every St. Agnes letter on Daniel Ahn back. He's clearing his office Saturday night, Jin. Saturday." [beat] "I'm not telling you to go. I'm telling you what I know." (If `ch1_records_route = with_hana`: "We found the first one together. I'm still finding things.")
4. **Board, pass 1** (any evening, the loft wall; activity). Four horizontal lanes in Jin's handwriting (the PDF's four failures): **"The search cost them"** (`ev_min_notebook`, `ev_detective_invoice`, `ev_umma_paystubs`, the flyer) · **"Help was delayed or sent elsewhere"** (`ev_council_referral`, `ev_ha_application`, `ev_judgment`, `ev_returned_letter`) · **"The building was known"** (`ev_building_complaints`, `ev_film_roll` frame 3, `ev_asher_testimony`, `ev_fire_report`) · **"Someone kept me hidden"** (`ev_transfer_form`, `ev_intake_whiteout`, `ev_current_file`, and a blank card reading only `Box 1180 — 9 letters — ?`). The player drags cards to dates along the top (Aug 1994 → Feb 1996). A wrong placement slides back with Jin's thought ("*No. That was after the court date.*"); there's no failure. A fifth row, **"Their lives, not only the search"**, takes the mundane cards (`ev_shopping_list`, `ev_fridge_note`, frames 1, 2, 4, 5, the coat) and writes no failure under it. When the first three lanes are full, the fourth lane's gap glows. Thought: "*Nine letters to one box. Somebody opened that box every week.*" Objective: `P.O. Box 1180. 88 Market Street.`

### 6.6 Saturday, February 8: one night, two places (PDF Q3: abandon a commitment when an investigative opportunity appears?)
At 6 PM Deshawn is in the courtyard with his gym bag: "Seven-thirty, Route 9. You're riding with me, right?" The map shows both destinations on opposite sides of the city; the journal says `You can be at one of them tonight.` No timer runs; the choice is which bus to take. (If Jin never promised the corner, only 88 Market appears, and `ch6_saturday = pike` is set by going.)

**6.6a — The corner** (`ch6_saturday = corner`). The Cellar, packed. Tiny waves Jin through. Slim carries the stool if `slim ≥ 2`. Mo: "Working a corner, Ghost? Corners don't get paid much. Corners get blamed."
- **Activity: working a corner.** Three rounds of Deshawn vs Andre "Hammer" Bell play with the camera on the corner (Jin on the apron, the fight behind the ropes; the player watches Bell's habits). Between rounds, the stool: choose what to tell Deshawn from three observations, only one of which the round actually showed (e.g. "He drops his right after he jabs." / "He's tired." / "Go to the body."). The right call changes Deshawn's next round ("You saw the right. Nobody sees the right."). Ice, water, grease: simple carry-and-use steps.
- Round 2: Bell opens a cut over Deshawn's left eye. If `ch3_lenny_method = patient`, the house cutman is Lenny: he steps into Deshawn's corner without being asked: "Let me see it." He closes it in forty seconds, humming, and never looks at Jin. Otherwise Doc Ferris swabs it and it keeps leaking.
- Before round 3, on the stool, **Deshawn:** "I can't see. Jin. I can't see out of the left." The camera uses the **Ch0 corner framing exactly**: tight on the corner from behind the post, crowd blurred, sound muffled except voices. Jin is where Teddy was.
- **Choice `ch6_towel`:**
  - `[Throw the towel.]` → `thrown`. **Mo:** "Corner stops it!" Boos. Deshawn shoves Jin off the apron: "I *had* him!" Later, in the Pit, an ice bag over his eye, quiet: "...I couldn't see him. I couldn't see anything." `deshawn` +1.
  - "Hands up. Go." → `sent_out`. Deshawn goes out half-blind and is dropped twice; Ferris's penlight; he's all right and doesn't remember the round. In the Pit: "You sent me out. I'd have hated you if you didn't." [beat] "I don't know which one's worse." Thought: "*I sent him out.*"
  - Either way: keeping the promise `deshawn` +3; $20 corner money from Mo; Jin writes under Deshawn's name on Mo's chalkboard: `corner: J. SEO`.
- **Monday morning, 88 Market** (corner path). The street door is locked; **Dr. Brandt** from downstairs comes out with his keys: "He left owing two months and a box of butterscotch. Take whatever's his. I'm calling the landlord at noon." The office is half empty; the shredder is full; the storage trays are there. **The drawer is unlocked**, and on the desk, squared to the edge, the two sheets lie side by side with a note in Pike's tidy hand: `For whoever comes. I was told. — G.P.` (No `ev_pike_statement`: Pike is gone to his sister's in Arizona.) Then 6.7.

**6.6b — Pike** (`ch6_saturday = pike`). Market Street at 8 PM, wet snow, the neon tooth.
- **The stair** (E6.2). If `ch2_collector_after = let_go`: Benny is on the landing with Carl. Benny looks at Jin, at the knuckles: "You let me walk. I'm walking." He goes down past Jin and out into the street. Carl, alone: "Pike pays me to stand here. So I'm standing here." If `hit_again`: "Benny's in the hospital. Jaw's still wired. Pike hired me a friend." (Carl + Vic.)
- **The office.** Pike in shirtsleeves feeding the `AHN, D.` file into the shredder. He sees Jin and doesn't stop feeding it, which is somehow worse. His file on Jin is on the desk, the top sheet visible: `ch1_pike_stance = insisted` → `Patient agitated. Monitor.` / `played_along` → `Patient cooperative. Low risk.` Thought (insisted): "*Agitated. I said my own name.*" / (played along): "*Low risk. I said 'Daniel' to get a courtyard pass.*"
- **Present** (evidence confrontation; no fail state). **Pike:** "There's nothing here for you, Daniel. The Fund is winding down. There's no box." Present `ev_min_notebook` (`Box 1180 — #1–#9`): "Letters come. I forward what I'm told to forward." Present `ev_transfer_form`, `ev_council_referral` or `ev_lenny_voucher` (`G.P.` lines): Pike stops the shredder. "...I'm a bookkeeper with a fund. I forwarded what I was told to forward." Wrong presentations get "That's not mine." Pike takes a key off his ring and puts it on the desk without looking up. "Storage. The tray says hold. I held."
- **The storage room**, then **the drawer**: Pike sees the bundle of letters in Jin's hands and does what frightened clerks do: he proves it wasn't him. He unlocks his own drawer and puts two sheets on the desk, side by side, squared to the edge. Then 6.7.
- After 6.7, **choice `ch6_pike_statement`:**
  - "Write it down. All of it. Sign it." → `true`. Pike writes for four minutes of game time (a time-skip fade: the neon tooth flickers, the street goes dark). Two pages in his tidy hand (`ev_pike_statement`): the name change came "from Mr. Rook, arranged through the Harlan Freight people"; he held the family's letters on instruction; he referred Mrs. Seo's application out on a standing instruction; he was paid $1,500 a month. He signs. "Is this... is this going to a lawyer?" **Jin:** "It's going to a lot of people."
  - `[Leave. You have what you came for.]` → `false`. Pike, as Jin goes: "I never opened them. I want you to know that. I never read a word."
- **Sunday, the Courts** (pike path). Deshawn in the courtyard with a swollen left eye and his gym bag on his shoulder: "You didn't come." `deshawn` −3, `abandon_count` +1. If the player says why ("The man who hid my family's letters was shredding them tonight."): "...Okay. That's a real reason. I'm still mad. Both of those." He lost on a stoppage; Slim threw the towel.

### 6.7 The two sheets (the critical discovery; both paths)
- Doc viewer, typewriter, slow: **`ev_pike_memo`** ★.
- Doc viewer, handwriting: **`ev_rook_reply`** ★. `Gerald — Maintain. No contact, no confirmation. Nothing from our fund under that name. It holds, or everything goes. — W.R.`
- On "Maintain." the ambience drops out entirely: no heartbeat, no sting, two seconds of silence, then the radiator ticks. The camera eases in on Jin from 1.0 to 1.2 over four seconds and stops.
- Thoughts: "*Walter.*" / "*Everybody at the Courts says 'Walter' like a prayer.*" / "*He put his hand on my shoulder and said he was glad.*"
- Pike (pike path only): "You see? Instruction. I'm a clerk. I had a mortgage." (Nothing in this scene lets Jin hit him.)
- **No combat after this.** The stair is empty on the way down. Objective: `Read them. Sunny's, the booth by the window.` Market Street at night, wet snow, one streetlight: **Jin framed alone under it at 0.8** (the second time in the game; the first was Pratt Alley). The objective HUD stays hidden until he reaches the bus stop or 90 s pass.

### 6.8 Monday the 10th: Sunny's, the booth by the window (key scene)
- Route 14 to Kessler. **Rita** puts a cup down at the window booth without asking: "She sat in it every Saturday. With her envelopes." Jin sits where the fridge note told him to sit two and a half years ago. The camera frames him from outside through the window glass (rain streaks, `SUNNY'S` reversed in neon), then cuts inside.
- **The letters** (letter viewer; read any, all or none; each is short). `ev_min_letters` ★, Min's voice, not only pleading:
  1. *Sept 3, 1994:* "Calder General says you were 'transferred' and the 'sponsor is confidential.' What sponsor? You don't have a sponsor. You have me. Write back."
  2. *Oct 1, 1994:* "Section 14 was LOUD. I got a picture of you in the tunnel before. You look good. When you wake up I'll give it to you and you have to say it's a good picture."
  3. *Nov 19, 1994:* "Mrs. O's tomatoes died. Umma made japchae for the whole floor in the blue cornflower dish. You'd have eaten three plates and said you were cutting weight."
  4. *Dec 24, 1994* (by `ch0_purse_dream`): `rent` "Umma still says when you're back you're paying the rent off 'and the rent after that.' She says it in your voice." / `umma_saturdays` "Umma still says when you're back she's quitting Saturdays. She worked this one." / `new_apartment` "Umma still says when you're back I'm getting a door with a lock. I'm going to lock it so hard."
  5. *Feb 12, 1995:* "I paid a detective. $350. In two parts. Don't be mad. He didn't find you either. Nobody finds you. It's like you're under a different name." (Thought: "*I was.*")
  6. *Apr 13, 1995:* "Umma went to court in her good coat. They gave us thirty days. Thirty. She asked them for your purse and they said you have to sign for it."
  7. *June 20, 1995:* "New address: Lindell House, Room 9, Garrison St. It's fine. The radiator works if you kick it. Don't worry. (Worry a little.)"
  8. *Oct 31, 1995:* "I did a petition about the back door. Eleven signatures. I'm good at petitions now. I'm good at a lot of boring things now. I passed Payroll with an A."
  9. *Jan 29, 1996:* "Jin-ah. Writing to the Box again, because it's the only address anyone gave me. Umma says hi. Umma says eat. I took a picture of the back door; if they don't fix it I'm taking it to Channel 8. Mrs. O's birthday is the 10th, I'm making the cake, pray for her. If you're reading this, come home. If you can't come home, write. If you can't write, I'll find you anyway. — Min"
  - After the ninth, no line for four seconds. Then: "*The tenth was the cake. The eleventh was the fire.*" He puts the letters back in their order.
- **Hana arrives** (after the player closes the viewer, never during). Peacoat, scarf, rain on her shoulders. She slides into the booth across from him and puts a manila envelope on the table.
  - **Hana:** "Dr. Whitlow pulled your Athletic Commission physical. The fourth metacarpal you broke at nineteen. Dental records from your gym's insurance. She signed it this afternoon." `ev_whitlow_affidavit` ★. "It says you are who you say you are. In a form a judge has to read."
  - If `hana ≥ 3`: a second sheet. "And this. Our switchboard log. I went through November '95 on my lunch breaks." `ev_stagnes_calllog`. "She called my building. You were down the hall from the switchboard. I was probably at the bars with somebody else."
  - Hana, about herself: "I filed with the state Department of Health in January. Falsified records. Interference with a resident's communications. They put me on administrative review. Dolores brings me coffee in the parking lot like I'm in prison." [beat] "I'm keeping everything. Two copies."
  - By `ch1_records_route`: `with_hana` → "We found the first one together. I'm not stopping now." / `alone_at_night` → "You didn't wait for me then either. I'm here anyway." If `ch4_called_hana`: "And you called me after. I counted that."
  - If `ch1_told_hana_boxing`: "You told me about the fight on the bars, the second week. I didn't put it in the chart. I should have."
  - If `ch1_fare_source = activities_jar`: Hana, carefully: "Mrs. Alvarez cancelled the bingo prizes in December. The jar was short. I didn't put it together until you'd gone." She waits. (`hana` −1, applied now, once.) Option "It was me." (no flag): "I know. Six-forty. I covered it. Don't do that again to people who have less than you." Or say nothing.
  - If `ch1_fare_source = hana_loan` and Jin has $20: `[Pay Hana back. $20.]` → `ch6_hana_repaid`, `hana` +1. "Good. Now I can buy my own pie."
  - Jin shows her the memo and the reply. Hana reads "Maintain." twice. She says the PDF's caution aloud, in her own words, because she's the one person who would: "Would one answered letter have saved them? I don't know, Jin. Nobody gets to know. He made sure nobody gets to know." [beat] "He didn't light the fire. He kept them from finding you, and he kept his fund closed to them, on purpose, for a building full of other people. That's what he did. That's enough."
- Optional, after Hana leaves: the booth's sugar jar → `mem_booth` (1993: Min counting out quarters for pie, forty cents short; Umma pretending not to notice and sliding a dime under the saucer).

### 6.9 Board, pass 2 (Monday night, the loft)
- The fourth lane fills: `ev_min_letters`, `ev_pike_memo`, `ev_rook_reply`, `ev_stagnes_calllog` (if held), `ev_pike_statement` (if held). Then the board asks one question in the centre, in Jin's handwriting: **"What killed them?"**
- The player may drag any single card into the centre. Each time it slides back to its lane and Jin answers it: `ev_rook_reply` → "*No. Not just that. He didn't chain the door.*" / `ev_building_complaints` → "*No. They'd have moved, if anyone had helped them move.*" / `ev_min_notebook` → "*No. Looking for me isn't what killed them.*" / `ev_fire_report` → "*No. A heater doesn't explain a chain.*"
- A button on the board reads **`Leave the centre empty.`** (offered from the start; the player never has to try a card). When chosen, all four lanes light left to right and Jin's thought writes itself across the top: "*Not one thing. Four things. One of them had a signature.*"
- The Journal's claim *What happened to Umma and Min* completes: "Their search cost them time and money. Help was delayed and redirected. The building's danger was known and left. And Walter Rook, told they were looking, chose to keep Jin hidden and keep his fund closed to them."
- Thought: "*I want to hear him say it. To me.*"

### 6.10 Tuesday, February 11, 1997 (ending; grief; no combat anywhere in the city)
- Time card `Tuesday, February 11.` Light snow. The objective reads only `February eleventh.`
- The cemetery gate; the flower cart (yellow carnations $5, or not; the scene plays the same). The **office ledger** (`ev_stone_ledger`): "*T. Marsh, 4/96. Teddy. Teddy paid. Teddy never said.*"
- The camera follows Jin along the gravel path at 0.9, then lets him walk ahead into Section 14 while it stays back: Jin small among numbered markers. At 96-031 and 96-032 he kneels (`kneel`). If flowers, he lays them (2 s). If `ch6_okafor_print`, **Mrs. Okafor** is already there, standing with her purse in both hands. She doesn't speak.
- No dialogue box at all for six seconds: wind, crows. Then thoughts, one per press:
  - "*Umma. Min.*"
  - "*You went to court in your good coat.*"
  - "*You made the cake. It leaned.*"
  - (by `ch0_purse_dream`) "*I was going to pay the rent and the rent after that.*" / "*You were going to have Saturdays.*" / "*You were going to have a door that locks.*"
  - "*He wrote 'maintain.'*"
- **The bench** under the bare tree, facing the river. `Sit`. Jin takes out Min's coat (he has carried it all week). **`Finish the button`** (repair sequence, in Umma's rhythm):
  1. The needle is already threaded with navy thread (hold to pull the slack through).
  2. Four stitches: timed presses on the same rhythm as Odette's treadle in Ch5 (the rhythm is shown only by the needle's motion; no meter; an off-beat press simply waits for the next beat).
  3. **Bite the thread.** Jin lifts the coat and bites it off, as Umma did in Ch0 (camera **1.35**, the Ch0 framing of Umma's hands).
  → `ch6_finished_button = true`. If he doesn't sew, he simply sits with the coat in his lap, and that is also allowed.
- If Mrs. Okafor is there, she sits beside him and puts a hand flat on his back (Umma's gesture, not a hug). No dialogue. If she isn't, a crow lands on the next bench and leaves.
- The camera eases out to **0.8** over 8 s: the bench, one or two small figures, the markers, the snow, the river, and across it Ashgrove Tower, its top lit. No music until the fade; then, for the first time since Ch0's kitchen, four piano notes, and black.

## Encounters
- **E6.1 Lindell House, 2nd floor** (only if `ch6_strippers = fought`): 3 `thug` (Fitz has a crowbar: a longer, slower swing that can't be slipped, only backdashed); **soft floor spots** (darker, sagging boards: anyone standing on one more than 1 s drops a few pixels and is stunned, Jin included). ~30 s. Teaches nothing new and isn't meant to. Checkpoint at the fire-escape window. They flee; nobody is questioned.
- **E6.2 88 Market stair** (pike path only): Carl (`collector`), or Carl + Vic (`collector` + `thug`), by `ch2_collector_after`. Narrow stair: `maxAttackers: 1` on the steps, 2 on the landing; uppercut the thug off the landing, slip Carl's committed haymaker against the wall. Checkpoint at the street door. Carl goes down the stairs holding his jaw. The discovery comes **after** this fight, never before it.
- **Explicitly no encounter** after 6.7, at Sunny's, on the board, or at the cemetery. Training remains available (cap 3) at Iron Pulse, the Courts gym, and the Cellar.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Asher | `ch6_asher_method` = `patient` / `threatened` (PDF Q2) | Folding and the full account with Lazarou's note / 90 s and a partial account; `threat_count` +1 | `patient`: Asher holds a copy (Ch8) and testifies in Ending Two ("Wendell Asher told the grand jury about the key on his ring."). Ch9 Penner (threatened): "You frightened an old man in a laundromat. Efficient." |
| Strippers | `ch6_strippers` = `talked_down` / `fought` | A short fight or none | Flavour: Ch9 night, Fitz waves from a scrap truck on Garrison Street if talked down. |
| Saturday | `ch6_saturday` = `corner` / `pike` (PDF Q3) | Corner activity, `deshawn` +3, $20 / Pike in person, the stair fight, `ch6_pike_statement` possible, `deshawn` −3, `abandon_count` +1 | Ch7 Deshawn's anger is milder if he got his corner. Ending Two wave 3: Deshawn at Alder Row only if `deshawn ≥ 4`. `pike`: Pike's two pages exist. `corner`: Pike is found later in Tucson (Ending Two epilogue). |
| The towel | `ch6_towel` = `thrown` / `sent_out` | Deshawn's anger, then thanks / "I sent him out." | Ch7 Deshawn: "You threw the towel for me. And you'd take my grandma's roof?" / "You sent me out. Now you're sending everybody out." Ch8 Teddy, told about it: "Then you know." |
| Pike's statement | `ch6_pike_statement` (bool; pike path) | `ev_pike_statement` | Ch7 can be presented to Rook ("Gerald always did want somebody to blame in writing."). Ending Two: "Gerald Pike's two handwritten pages were Exhibit 14." |
| Okafor's print | `ch6_okafor_print` (bool) | She frames it; she's at Section 14 | Ch9 night: the frame on her TV, the lamp on. |
| Repay Hana | `ch6_hana_repaid` (bool) | `hana` +1, −$20 | Ch9 night Hana: "You paid me back. Nobody pays me back." |
| 4D | `ch6_gave_back_4d` (bool; only if `ch5_took_4d`) | Elena's line; options `[Give 4D back to the Vasquez family.]` / `[Keep it.]`. Giving it back: Jin moves to the loft; Elena's kids carry their own boxes up on Sunday; `courts` +1; `take_count` −1 | Ch7 Rook's "same animal" line becomes: "You gave it back. I noticed. I never gave anything back." Ch9 Penner skips the 4D line. |
| Flowers | `ch6_flowers` (bool, $5) | Yellow carnations on 96-031/032 | They stay fresh for every later visit. |
| The button | `ch6_finished_button` (bool) | The coat mended | Ending Two: the coat hangs by Jin's door. Ending One: it's in a box he never opens. |

## Chapter ending and state handed on
- **Completion screen:** the loft wall, all five rows filled, the centre empty, and the memo card in the fourth lane with `Maintain.` legible. "Jin learns which decisions prolonged his disappearance." What you did: "You folded sheets with Wendell Asher until he was ready." / "You were in Deshawn's corner." or "You went to 88 Market Street." / "Gerald Pike wrote it down." / "You finished Min's button."
- **Handed on:** flurry (toolkit complete); training cap 3; evidence for all four lanes, including the critical `ev_pike_memo` ★ and `ev_rook_reply` ★, `ev_min_letters` ★, `ev_whitlow_affidavit` ★, `ev_film_roll` ★; optional `ev_pike_statement`, `ev_stagnes_calllog`, `ev_asher_testimony` (full/partial), `ev_stone_ledger`; belongings `bel_min_coat`, `bel_scrunchie`; memory `mem_booth`; the Journal's Timeline tab now exists (the board, viewable). Map: Garrison Street, the Annex and Section 14 stay open for the rest of the game; the Fund office shows `FOR LEASE` from Ch7.
- Time card for the next chapter: `Thursday, February 27. Rain.`
- **Transition (sound bridge):** over black, a man's voice reading names slowly from a list ("...Baptiste, Odette. Greer, Darnell. Greer, Keisha. Lindqvist, Gustav...") under the next card's bell.



# Chapter 7 — What Your Life Bought

**Card:** over black, the Ch6 sound bridge continues: Rook's voice reading names slowly from a list ("...Baptiste, Odette. Greer, Darnell. Greer, Keisha. Lindqvist, Gustav..."). **The bell**, muffled, cuts across the names; the names stop. `What Your Life Bought` · `Foundry Street, Northside · Thursday, February 27, 1997`.

## Date, mood, palette, weather
- Thursday, February 27, 1997: 8:30 AM the loft → 9:30 the courtyard → 11:00 the union hall → noon the Harlan men → 1:30 PM Rook's office → 7:00 PM the community room → 11:00 PM the roof of Building C.
- Mood: the quietest anger in the game. A conversation with the weight of a title fight, then a room full of people Jin knows hearing something they can't un-hear. Cold clarity; a man explaining himself well enough to make it worse; a community breaking along lines that don't match good and bad.
- Palette: the union hall in dark varnished oak, a faded 1937 strike mural, a maroon-and-gold `LOCAL 1197` banner, tall arched windows streaming with rain, green-shaded lamps; Rook's office in lamplight with the Courts' windows small and warm in the glass behind him. The Courts at night: every window lit early, then some deliberately dark. The community room under flat fluorescent light: for the first time it looks like an office, not a living room.
- Weather: rain all day, steady and gray; gutters overflowing; the stack black with wet. The rain is under every scene, louder at windows; it eases at 11 PM.

## Gameplay identity
**Make the case.** In the morning the player sees exactly which link of the chain is missing. In the Council's own archive the missing pieces are found, with the woman who typed them. The outfit comes to lean on the Council, and the player overhears who holds whose leash now. Then the confrontation with Rook is played as a **presentation duel**: Rook's statements against the player's evidence, three links, no fail state, no timer, the camera stepping closer with each link. It is the chapter's climax and **there is no boss fight; Rook never raises a hand**. After the admission the player chooses who tells the residents, and then walks among them while they react.
- Exploration 15% · dialogue 40% · investigation 25% · combat 5% (one short fight, in one branch only, always before the confrontation) · activities 10% (the chain board, the presentation) · cinematic 5%.
- Target length: 18–22 min.
- No new skills; training cap rises to 4 (the last cap).

## Locations

### `foundry_street` — Foundry Street (as Ch5) in the rain
The union hall's door is open today (`OFFICE HOURS TUE / THU 10–4`); Rook's umbrella in the stand by the door; at noon a **black Lincoln Town Car** double-parks in front, engine running, its plate frame `HARLAN FREIGHT — WE MOVE CALDER`.

### `union_hall` — Council HQ, the old Local 1197 hall (1600 × 720, three levels)
- **Ground floor (lobby), left → right:** street doors under the carved lintel `UNITED FOUNDRY WORKERS LOCAL 1197 · 1937` → a trophy case of union bowling trophies and a 1959 strike photograph → **the Council's food pantry** on folding tables (cans, bread, a sign-in sheet; a line of six people until 2 PM) → Bernice's volunteer desk (rotary phone, a bowl of butterscotch, knitting) → a water cooler with paper cone cups → a brass plaque facing the waiting chairs: `THE NORTHSIDE COMMUNITY COUNCIL BELIEVES NO FAMILY SHOULD FACE HARDSHIP ALONE` → double doors to the **assembly hall** (rows of folding chairs, a low stage with a lectern, a piano under a sheet, the **1937 strike mural** across the back wall: men at the foundry gate, a woman handing out bread, a policeman's horse) → stairs up and down at the right.
- **Upper level:** a horseshoe **balcony** of pews over the hall, union banners hanging from its rail; at its far end the corridor and **Rook's office**, whose **transom window** is propped open over the balcony (voices carry).
- **Basement:** the **archive**: steel shelving, banker's boxes by year, a typing table with a cover on the typewriter, a shoebox of steno pads labelled in Odette's hand `MINUTES 1983–1994 — O. BAPTISTE`, a single bulb on a chain (the St. Agnes records room, deliberately).
- Light: rain-gray windows; at dusk only the stage work light and a red EXIT. Sound: rain, radiators knocking, the pantry radio, footsteps that echo, the phone ringing and not being answered.

### `rook_office` — Rook's office (800 × 360)
Door → two visitor chairs (one with a cushion "for Odette's back") → a heavy oak desk (a green-shaded lamp; a coffee can of pens; a stack of unsigned letters on Council letterhead) → **four framed rejection letters** in a row on the wall (Calder Savings: "We regret." / Riverside Trust: "Unable at this time." / the State Housing Office: "Pending 1996 appropriations." / a Pittsburgh foundation: "Outside our guidelines.") → his **1961 union card** framed (`UNITED FOUNDRY WORKERS LOCAL 1197 · W. ROOK · 1961`) → a photo of Rook and Leon Baptiste in hard hats, 1971 → a coat rack with a canvas work jacket dripping and a **flat cap** → a radiator under the window; through the glass, a few blocks away, the lit windows of Foundry Courts. A list is taped inside the pencil drawer. Lamplight; rain on the glass; a clock.

### `courts_community` and `courts_yard` (as Ch5) at night
The chairs in rows like a hearing; the coffee urn; the Ch5 meeting prop visible (the `JIN'S` thermostat tape / the crew's gloves / the ceiling patch / the minutes on the table). The yard in rain: residents in clusters on three porches; some windows deliberately dark.

### `courts_roof_c` (as Ch5) at 11 PM.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `odette` | her machine (morning); with Jin at the hall; the archive (stays); the meeting | `sit`; walks with her keys in her hand, one hand on the rail | "I still have the archive keys. Walter never asked for them back. He never thinks about keys." / "I typed that sentence. I typed it, and covered the machine, and went home and made pork chops." | — | the meeting |
| `bernice` (Bernice Wojcik, 74, Council volunteer; Wojo's mother) | lobby desk | `sit`, knitting | "Mr. Rook's in. He's got visitors coming. Loud ones, usually." / "My Stanley fights at the bowling alley. He loses. He's happy." | "Sign the sheet, hon. Everybody signs." | If Jin fought Wojo in Ch3: "You know my Stanley? Is he winning? Don't tell me." |
| `nell` | lobby, then the meeting | `write`, clipboard | "I just do the forms. I believed the forms." / "The deed's the deed. It's recorded. The roof is real. The boiler is real." | — | — |
| `carrow` (Vince Carrow, Harlan Street; leather jacket, clipboard; never raises his voice) | Lincoln → stairs → Rook's office | `armsCrossed` | "The Alder Row matter needs the Council's endorsement and the tenant lists by April first. Mr. Rook stands on the steps and says it's progress. Simple." / "Once was a down payment, Walter." / to Jin: "You're the boxer. Huh. The people upstairs are going to want to hear about you." | "Easy. Easy. It's paperwork." | first appearance; returns Ch9–10 |
| `dutch` (only if `ch4_dutch_after = walked_away`) | arrives last from the car | arms wide, then down | "Not here." / "You walked away from me at the river, son. I'm walking away from you here. That's us square." | — | `ch4_dutch_after` |
| `whistle` + 2 `thug` (only if `kept_going`) | the lobby | `point` | "The ghost. Dutch is still eating soup through a straw. Says hello." | "Two on him!" | — |
| `rook` (Walter Rook, 63) | his office | at the window, hands behind his back; later the cap in both hands in his lap | see 7.5 | — | everything the player has |
| Courts residents | the meeting: `odette`, `gus`, `darnell`, `keisha`, `deshawn`, `mara`, `nell`, `elena` | rows of chairs | see 7.6 | — | Ch4–Ch6 flags |

## Interactables
| id | Label | Examine | Unlocks |
|---|---|---|---|
| `i7_chain_board` | The loft wall (morning) | Opens the **chain board** (7.1) | — |
| `i7_pantry_sheet` | Pantry sign-in sheet | "*Forty names today. He feeds people. That's real too.*" | — |
| `i7_hall_plaque` | Brass plaque | "*NO FAMILY SHOULD FACE HARDSHIP ALONE. Min read this while somebody said 'no record'.*" | — |
| `i7_ribbon_photo` | Photo (lobby) | "*September 30, 1994. Walter and Odette with giant scissors. Gus at the edge of the frame, not smiling.*" | — |
| `i7_steno` | Odette's steno pads | Doc (Odette reads her own shorthand aloud): see `ev_exec_minutes` | `ev_exec_minutes` ★ |
| `i7_ledger_box` | Box `N.C.C. — LEDGERS — 1994` | Doc: see `ev_council_ledger` | `ev_council_ledger` ★ |
| `i7_old_minutes` | Binders 1983–1993 | Summary page in Odette's hand: `Bake sales 1983–93: $1,214 / $880 / $1,530 / $640 / $1,102 / $910 / $1,288 ... City HOME applications: denied 1987, 1989, 1990; partial 1992 ($38,000). Letters to the Calder Foundry pension trustee: 31. Replies: 2.` Thought: "*Eleven years of asking politely.*" | journal note (feeds Rook's defence) |
| `i7_transom` | Transom (from the balcony) | (noon) the overheard demand | scene 7.3 |
| `i7_rejections` | Four framed letters | "*Four ways to say no. He framed them.*" | — |
| `i7_union_card` | Union card | "*W. Rook, 1961. He was twenty-seven. He poured iron.*" | — |
| `i7_leon_photo` | Photo, 1971 | "*Rook and Leon Baptiste in hard hats. Leon's holding a ladle like a trophy.*" | — |
| `i7_cap` | Flat cap on the rack | "*A flat cap.*" (after `mem_row_k`: "*Row K.*") | — |
| `i7_household_list` | List in the pencil drawer (after the confrontation) | "*Two hundred and twelve households, by building, in his hand. A tick by every one. BAPTISTE, O. — A-1C. LINDQVIST, G. — A-2A. GREER, R. — B-3A. No line for Seo.*" | — |

## Evidence found this chapter
- `ev_exec_minutes` ★ (Odette's steno pad, typed beside it): `8/15/94. Council executive session. W. Rook reports a one-time arrangement with outside partners to meet the 9/30 deadline. Motion to accept, carried 4–1 (G. Lindqvist opposed: "Ask where it comes from."). No further minutes to be taken at W.R.'s request.`
- `ev_council_ledger` ★: `NCC CAPITAL ACCOUNT 1994 · 9/27/94 Received: Harlan Freight Co. escrow, ref. ASH-0894 — $640,000.00 — Purchase, Foundry Courts (W.R.) · 9/28/94 Paid: Calder Foundry pension trustee — $640,000.00 · thereafter maint. serviced via H.F. window 2.` Thought: "*ASH-0894.*" (The People tab gains a pencil entry: `ASH-0894 — ?`.)
- `ev_rook_notebook` (Rook hands it over; a 1994 pocket notebook in his hand): `Foundry liquidation — auction 10/1 — 212 households — Pgh buyer (parking) — Calder Savings no (4th) — state "maybe '96" — Ruth Greer in the lot at Dombrowski's, 8/2 — Odette packing — D.B. + a man in a camel coat at Starlite: a fight in Aug, a sure thing, the people betting want a community partner, a share — ONE TIME.` / `8/21: D.B. from General. Not waking up. Best place, pay for it, no name. God help me.` / `6/14/95: Gerald re: the sister. Told him maintain.`
- `ev_alder_letter` (Carrow's clear sleeve; unsigned, Council letterhead): `STATEMENT OF SUPPORT. The Northside Community Council supports the voluntary relocation of the residents of the Alder Row Cooperative, Southbank, in favour of the Alder Commons mixed-income redevelopment, and will assist families during the transition.` Clipped note: `Sign and return with tenant lists by 4/1. — V.C.` (First mention of Alder Row in the game.)
- `ev_rook_testimony` ★ (the admission, recorded as a testimony card).
- `mem_row_k` (Rook's memory; the only memory in the game that isn't Jin's, marked by a cooler tint).

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q7_main` | main | `Put the chain together.` → `Tell Odette.` → `The Council's 1994 records. Odette has keys.` → `Rook's office. Upstairs.` → (HUD hidden in the office) → `Foundry Courts. Seven o'clock.` → `Get some air.` → **`Ray Castell. The Civic Arena, March 8.`** | Board opened; records read; confrontation done; meeting done; roof | The complete chain; the lead |
| `q7_bernice` | side | `Bernice asks about her Stanley.` | Tell her Wojo is happy (only if Ch3 bout 1 was Wojo; it always was) | She gives Jin a butterscotch that does nothing and stays in the inventory to the end. Pure warmth on the hardest day. |

The chapter is meant to feel narrow: no other optional quests are added. Mara's gym and the training menu are open in the afternoon.

## Scripted scenes

### 7.1 The chain board (morning, the loft)
The evidence wall opens in a new mode: three chain rings drawn across the top in Jin's handwriting with the PDF's sentences, and slots under each.
- **Link 1, "The forced result produced the payout."** Slots: who did it (`ev_lenny_tape` / `ev_lenny_statement`), who paid (`ev_lenny_voucher`), what it paid (`ev_civic_ledger`: `POSITION: CASTELL KO RDS 3–5 · gross $4.1M · per A.C.`).
- **Link 2, "A negotiated share financed Foundry Courts."** Slots: when (`ev_courts_plaque`), what the depot paid for (`ev_ncc_ledger`), **where the Council's $640,000 came from (empty)**, **who agreed to it (empty)**.
- **Link 3, "My concealment protected everyone involved."** Slots: the false name (`ev_transfer_form` / `ev_intake_whiteout`), the back door (`ev_transport_log`), who knew they were looking (`ev_pike_memo`), who decided (`ev_rook_reply`).
- Filling it takes a minute (the player drags cards already owned). The two empty slots pulse. Thought: "*Six hundred and forty thousand, in September. I can't prove it was the fight's money. Not yet.*" (If the player leaves without opening the board, the objective still advances: the board shows what's missing; it doesn't gate.)

### 7.2 Odette (morning; thin letterbox)
- The community room, Odette at the Singer. In Ch5 she said "When you want to say it, I'll be at my machine." The prompt reads `Say it`.
- **Jin:** "The Council's money came from my fight. The fight was fixed. They put me in a hospital under another name so nobody would ask. My mother and my sister were looking for me."
- [beat 3.0. The treadle stops.]
- **Odette:** "...I typed a sentence in August of '94." [beat] "I still have the archive keys. Walter never asked for them back. He never thinks about keys." She covers the machine (she has never done that in the game) and stands. "Help me with the steps. My hip doesn't like rain."
- They walk Foundry Street together under Odette's lavender umbrella (a thin-letterbox walk-and-talk; Jin matches her pace; there is no faster option). Nobody speaks. The union hall grows in the frame.

### 7.3 The union hall: the pantry, the archive, the transom
- **The lobby.** The pantry is open: six people in line, a volunteer bagging cans and bread. **The camera holds the line for 3 s at 1.0 before giving control**, so the player sees what the Council is before seeing what it did. A man in line, to no one: "Mr. Rook got my mother's heat turned back on." Bernice at her desk. Upstairs, Rook's voice on the phone through his door: unintelligible, warm.
- **The archive.** Odette leads Jin down, one step at a time, a hand on the rail. She pulls the bulb's chain; it swings; the shelves' shadows swing and settle. She finds August 1994 without looking for it.
  - `ev_exec_minutes` in the viewer, with her shorthand beside the typing. **Odette:** "I typed that sentence. I typed it, and covered the machine, and went home and made pork chops." [beat] "I knew it was something. I thought it was a loan shark. I thought, a loan shark for a roof, Lord forgive us, we'll pay it back." [beat] "Gus said 'ask where it comes from.' I wrote it down. That's all I did with it."
  - The box `N.C.C. — LEDGERS — 1994` on the bottom shelf: `ev_council_ledger`. **Camera 1.4 on the line** `Harlan Freight Co. escrow, ref. ASH-0894 — $640,000.00`. Thought: "*The truck.*" The chain board's two empty slots fill with a click the player hears even though the board isn't open (a small chain-link sound and a journal badge).
  - **Odette** (sitting down on a box): "Go on up. I'm going to sit here a minute." (She stays in the archive through the confrontation and can be found there after, still sitting.)
- **Noon: the Harlan men.** The Lincoln double-parks; three men in dark coats come in with rain on their shoulders and go up past Jin on the stairs without knowing him. If the player goes up to the **balcony** and stands under the **transom** (`i7_transom`), the voices carry down into the empty hall (the camera holds a wide of the hall, the banners, the rain on the windows, and two small figures behind frosted glass):
  - **Carrow:** "The Alder Row matter needs the Council's endorsement and the tenant lists by April first. Mr. Rook stands on the steps and says it's progress. Simple."
  - **Rook:** "I told you in '94. Once."
  - **Carrow:** "Once was a down payment, Walter. Every boiler in your Courts goes through our window. Everybody across the river knows your name now. That's worth money. We helped you make it worth money."
  - The sound of paper put on a desk. Nobody shouts.
- They come down. **Branch by `ch4_dutch_after`:**
  - **`walked_away`:** Dutch is the last of the four, arriving late from the car. He sees Jin at the foot of the stairs and stops; his men tense. [beat 2.0] **Dutch:** "Not here." *(to Jin)* "You walked away from me at the river, son. I'm walking away from you here. That's us square." *(to his men)* "Car." Carrow, passing Jin, looks him up and down: "You're the boxer. Huh. The people upstairs are going to want to hear about you." The doors swing shut. No HUD ever appears.
  - **`kept_going`:** No Dutch. The lead man sees Jin and grins: "The ghost. Dutch is still eating soup through a straw. Says hello." **E7.1** in the lobby. When the last man is down, Carrow, who never fought, says his line from the doorway and leaves. Then **20 s of guaranteed calm on the stairs** before Rook's door: a breath *before* the scene, so the confrontation starts in silence.

### 7.4 Rook's office: the presentation duel (the chapter's climax; full letterbox except during presenting)
**Staging.** Lamplight. Rook at the window, hands behind his back, Carrow's sleeve on the desk. He sees Jin in the glass and doesn't turn. **Camera 1.0, two-shot across the desk; the window behind Rook shows the Courts' lit windows a few blocks away, small and warm, centred between them.**
- **Rook:** "Mr. Seo." [beat] "I wondered which day it would be."
- He comes round the desk and reaches to put his hand on Jin's shoulder, as he did in the courtyard. **Jin steps back out from under it.** The hand stays in the air a moment, then goes to the small of his back. (Pose beat, no line.)
- **Rook:** "Sit down. Odette's chair has the cushion." **Jin:** "No."

**The duel.** Rook makes a statement; the player opens the evidence ring (a radial menu of the claim's cards) and presents one. A correct card advances the link; any other card gets a calm, specific answer from Rook and slides back (no penalty, no limit, no timer). With each closed link the camera moves a step closer (1.0 → 1.15 → 1.3) and Rook's posture changes: at the window → behind the desk → standing at the wall of rejection letters → sitting heavily with the cap in his hands.
- **Link 1.**
  - **Rook:** "I don't know anything about a fixed fight. I run a tenants' council. We do taxes on Tuesdays."
  - Present `ev_lenny_tape` → (the tape plays: Dutch, "...one bottle, before he walks"; the coat, "Then it isn't your problem, Mr. Voss"; the jingle) **Rook:** "Harlan Street does a lot of things. I don't ask."
  - Present `ev_exec_minutes` → Rook reads his own motion in Odette's typing. "...A one-time arrangement. Odette typed that." [beat] "Yes."
  - Present `ev_civic_ledger` → Rook takes off his reading glasses and folds them. "Four million one hundred thousand." He says it like a man hearing the number for the first time in a while. **Link 1 closes** (a chain-ring sound).
  - Wrong-card example: `ev_transport_log` → "That's a truck going to a hospital. I'm glad it went."
- **Link 2.**
  - **Rook** (behind the desk now): "The Courts were bought with a donation. An anonymous friend. It's on the thermometer."
  - Present `ev_council_ledger` → "Received. Yes. Escrow. From the outfit." [beat] "ASH." He almost smiles. "They put their initials on it. They always do. They think it's a signature." **Link 2 closes.**
  - Wrong-card example: `ev_ncc_ledger` alone → "That's a boiler, Mr. Seo. Boilers aren't crimes."
- **Link 3.**
  - **Rook** (standing at the four framed letters, his back to Jin): "I had nothing to do with your care. The Fund is separate. Gerald—"
  - Present `ev_pike_memo` → "Gerald worried. Gerald always worried."
  - Present `ev_rook_reply` → Rook looks at his own handwriting for a long time. He doesn't touch it. (If `ev_pike_statement` is presented instead or after: "Gerald always did want somebody to blame in writing." If `ev_pike_call`: "'You tell me what to do with him.' Yes. He asked me that too.") **Link 3 closes.** All three rings light, and the chain is shown once, whole, in Jin's handwriting: **"The forced result produced the payout. A negotiated share financed Foundry Courts. My concealment protected everyone involved."**
- Rook sits down heavily and takes the flat cap off the rack behind him, the way a man reaches for something to hold, and holds it in both hands in his lap. Full letterbox returns. Denial is over.

### 7.5 The admission (no more presenting; the player advances lines)
- **Rook:** "Yes." [beat 2.0] "Yes. I authorised it. In July. Dutch brought a man to the lounge at Starlite, a man in a good camel coat who did the talking. He never said his name. He said there'd be a fight in August, and a result, and the people betting on it wanted a community partner. A share." [beat] "I said yes in July, Jin."
- **Rook:** "They said you'd be slowed down. That you'd lose. Young men lose fights every Saturday in this city. I told myself that." [beat] "I was there. Row K. I'd never been to a fight. I wanted to see what I'd bought."
- **`mem_row_k`** (Rook's memory; a cooler tint): the Ch0 arena from high in Row K. A flat cap in the foreground. Round two, far below, small, a man in blue trunks whose legs are going. The flat cap rises halfway out of its seat. A large hand on its arm; Dutch's voice: "Sit down, Walter. It's almost over." The cap sits down. The bell keeps ringing. Then the seat is empty.
- **Rook:** "I stood up. I was going to walk down to the Commission table and say stop it." [beat] "And I sat down."
- **Rook:** "Gerald called my house at two in the morning. He said you were badly hurt. Your skull." [beat] "I said, 'Is he alive.' He said yes." [beat 2.0] "I said, 'Then nothing changes.' Keep him somewhere good. Pay for it. No name. I paid for your bed every month out of the same money. I told myself that was something."
- He takes the notebook from his drawer and puts it on the desk between them. "You'll want this. It's all in there. I kept it. I don't know why I kept it." (`ev_rook_notebook`)
- **His defence (concrete).** He takes the list from his pencil drawer and reads from it without looking at it:
  - "Baptiste, Odette. A-1C. Leon died that April; I sat with her all night in her chair. Lindqvist, Gus, foundry lungs. Ruth Greer and her son and her son's girl, B-3A. Mara Kowalski's father, who poured iron for thirty years and said 'at least we've got the houses.' Two hundred and twelve households. The pension trustee had a buyer, a parking outfit from Pittsburgh, and the auction was October first."
  - "Twelve hundred and fourteen dollars." *He nods at the framed letters without looking at them.* "Eleven years of bake sales. Four ways to say no. A rally on the City Hall steps with a megaphone I bought myself."
  - "Ruth Greer begged me in the parking lot at Dombrowski's with her granddaughter in the car. August second. I remember the date. Odette came to my office in July and didn't cry. She asked me what she should pack first."
  - "Polite never worked. Not once in eleven years. Dutch worked in three weeks."
  - "And I told myself once. A man can live a long time on once."
- **Jin's answer** (the line is fixed; its follow-up varies by `jin_voice`):
  - **Jin:** "Nobody asked me."
  - `restrained`: "You had a list. Two hundred and twelve names. You had my name too. You just didn't put a line next to it." / `mixed`: "You read me a list. Was my name on it? Was Umma's? Min wrote to your box nine times." / `hard`: "Nobody asked me. Nobody asked my mother. You asked Dutch."
  - **Rook:** "No. Nobody asked you." He doesn't defend that.
- **The financiers.** **Rook:** "Six hundred and forty thousand, out of four million one. They kept the rest. It went up the river to people who've never set foot on Northside. I bought two hundred and twelve homes with the change from your life." [beat] "The deed is real. The roof is real. Nobody can take it back from them. That's the worst part." [beat] "It's also the only good part." (PDF: the benefits are not fraudulent.)
- **Reflections of the player's own choices** (only those that happened; Rook has been watching too):
  - `ch5_took_4d` and not `ch6_gave_back_4d`: "I gave you 4D. I took it from a woman with three children and gave it to you, and you took it. We're the same animal, Jin. We just had different-sized rooms." / given back: "You gave 4D back. I noticed. I never gave anything back."
  - `ch4_envelope = taken` and `ch5_returned_envelope = kept`: "And Dock Road's payroll. Mara's crew went without. You see how easy it is? You see how it doesn't feel like anything at the time?"
  - `jin_voice = hard`: "You've hurt people to get to this office. You had reasons. So did I." / `restrained`: "You got all the way here without hurting anybody who didn't swing first. I couldn't have done that. I never tried."
- **Rook's question, `ch7_rook_answer`.** **Rook:** "What would you have said? If I'd come to you in July. Two hundred and twelve households against one fight. Tell me. I've asked everyone I know, in my head, for two and a half years."
  - "You'd have had to ask me. That's the point. You didn't." → `would_have_asked`. **Rook:** "And you'd have said no, and I'd have lost the buildings, and you'd have your mother. That's the arithmetic I didn't want to do."
  - "I don't know. I don't know what I'd have said." → `dont_know`. **Rook** (very quietly): "...Thank you for that. That's more than I gave you."
  - "Not this. Whatever I'd have said, not this." → `not_this`. **Rook:** "No. Not this. I'd agree with you, if it was mine to agree."
- **What the outfit wants now** (the PDF's "the mafia has outgrown the agreement"). Rook picks up Carrow's sleeve and hands it over (`ev_alder_letter`).
  - **Rook:** "They own the roof money now. Every boiler, every payroll goes through Dock Road, because I couldn't put that money in a bank, and they know it. Now they want a letter. Alder Row. A co-op across the river, Southbank. Twenty-four families. Somebody's going to build 'Alder Commons' where it stands. They want our name on a lie that says the Northside supports clearing it, because people trust our name in neighbourhoods like that." [beat] "Because of the Courts. They used my good name to buy the next one." [beat] "If I don't sign by April first, the roof money stops. I haven't signed it. I don't know if that's because I'm better than I was or because I'm more scared."
- **The lead.** **Jin:** "The man in the camel coat. Who does he work for? Who said when?" **Rook:** "I never met the money. I met Dutch, and the coat, and the coat met someone. But Castell met them. Dutch told me after, laughing, that Castell wouldn't do it on Dutch's word. He'd only take it from the money itself. Somebody from upstairs went to his dressing room that night." [beat] "He's at the Civic on the eighth. They're tearing it down. They asked him to come say goodbye to it."
- **The last beat in the office, `ch7_hit_rook`** (the PDF's Q4 at its smallest scale). Rook comes round the desk and stands in front of Jin with his hands at his sides. "If you want to hit me, do it now. There's nobody to see."
  - `[Hit him.]` → `true`. One punch: Jin's real cross, a heavy hit-stop, no spark. Rook goes into the bookcase and sits down on the floor. He touches his mouth. "...That's fair." `harm_count` +1. The bruise is on his face at the meeting tonight and in Ch9.
  - "No." → `false`. Rook nods. "No." He sits back down. Nothing more; the game doesn't praise the player for it.
- **`ch7_truth_told_by`.** **Rook:** "They'll have to know. The Courts. Let me tell them. Tonight. It should come from me."
  - `[Let Rook tell them. Stand at the back.]` → `rook` (`courts` +1: they heard it from him).
  - "No. I'll tell them." → `jin`. **Rook:** "...All right. Nell will call the meeting. I'll be here if anybody wants to come and shout." He doesn't come.
- Letterbox off. The HUD fades back in. **No combat after this anywhere in the chapter.** On the way out, the archive: if the player goes down, Odette is still on her box under the bulb. **Odette:** "Did he say it?" **Jin:** "Yes." **Odette:** "...Help me up the stairs."

### 7.6 The meeting (7 PM, the community room, rain)
Nell has put out the chairs in rows. Forty people. The camera works like a play again (static wide at 0.9), but this time **it doesn't zoom on speakers**: it stays wide and lets the whole room be seen reacting at once. Control returns after the first exchange, and each resident's reaction can be heard again by walking to them.
- **If `rook`:** Rook stands at the front without his cap (a bruise if `ch7_hit_rook`; Odette: "Walter, your face." Rook: "I walked into something I'd earned."). He tells it plainly, in order: July, the lounge at Starlite, the coat, the share, Row K, "Sit down, Walter," the hospital, the name, the letters. He doesn't say "for you"; he says "I did it." Jin stands at the back by the coffee urn and is pointed at once, by Rook: "That's Jin Seo. You know him as the man who carried your radiators."
- **If `jin`:** Jin stands at the front. The player doesn't type a speech: Jin pins four cards on Nell's easel as he speaks (the transfer form, the ledger line, the memo, "Maintain."). **Jin:** "My name is Jin Seo. Two and a half years ago I fought Ray Castell at the Civic. I was drugged in the locker room. Your Council took a share of the money that made. It bought these buildings. Walter Rook kept me under another name so nobody would ask. My mother and my sister looked for me until they died." Rook's chair at the side is empty. Everyone looks at it.
- **Reactions, one after another, each in its own body language** (PDF: some reject Rook immediately, some can't reconcile gratitude, a few turn on Jin out of fear; never all ungrateful, never fraud):
  - **Gus** stands first and puts on his cap. "I poured iron forty years for a company that sold us to a bank. Now I find out who bought us back. Wonderful." (If `ch5_meeting_stance = independence`, on his way past Jin: "You said it out loud in January. Thank you for that.") He leaves. **Rejects Rook immediately.**
  - **Odette** doesn't stand. Her purse in her lap with both hands. "He sat with me when Leon passed. Right there, in my chair, all night. Don't you tell me what kind of man he is. Tell me what kind of man he was that night." [beat, much quieter] "And that girl wrote nine letters. Lord." (If `ch5_donation ≥ $20`, first, to Jin: "You put money in the can. I saw.") **Can't reconcile it.**
  - **Darnell** is on his feet. "So what now? You got your truth. I got a kid and a lease that says Foundry Courts Mutual. Is the bank going to take it back because some gangster paid for it?" (If `ch4_envelope = taken` and `ch5_returned_envelope = kept`: Nell's report on the easel lists `maint. payroll lost (robbery) — covered by M. Kowalski (personal) and the Courts Fund`. Mara looks at the line, then at Jin: "That was January nineteenth. You were on Dock Road." A prompt: `[Put what's left on the table.]` → Darnell: "...You?" `ch5_returned_envelope` becomes `confessed_late`; `mara` −1 regardless (it's late). Or stay silent: `courts` −1.) **Angry at Jin, because he's afraid.**
  - **Deshawn**, against the back wall: "Don't you dare make my grandma's roof a question." Variants: `ch6_towel = thrown`: "You threw the towel for me. And you'd take my grandma's roof?" / `sent_out`: "You sent me out. Now you're sending everybody out." / `ch6_saturday = pike`: "You didn't come. Now you come with *this*." If `deshawn ≥ 5`, after a long time: "...I know it's not you that did it. I know. Give me a minute to stop knowing it."
  - **Elena** (if she's at the Courts), holding her youngest asleep: "My kids are warm." [beat] "I can't be sorry my kids are warm. Don't ask me to be sorry." Then: "Can they take it back? The buildings?" **Nell**, firmly, the one thing she's sure of: "No. The deed's the deed. It's recorded. The roof is real. The boiler is real." [beat] "I just do the forms. I believed the forms."
  - **Keisha**, too loudly, to Darnell: "Are we still allowed to live here?" Nobody answers for a moment. **Jin:** "Nobody's moving."
  - **Mara** has stood against the back wall with her arms crossed the whole time. "I fixed these pipes with that money. I'd fix them again. That's the worst part." Variants: `ch5_returned_envelope = confessed` (later, quieter, to Jin only): "You told me about the envelope. That's the only reason I'm still talking to you." / `kept`: she says nothing to Jin at all tonight. / `ch5_left_repair = true`: "And you left me with a boiler once to listen at a window. I know what you were listening to now."
- How many people turn on Jin depends on `courts` (≤ 0: Gus and two silhouettes leave when Jin stands; ≥ 2: only Gus leaves, and only because of Rook). Odette's and Elena's reactions never change.
- **The yard after** (free roam, rain, no hostiles). Three clusters on three porches; barks are this night's ("I don't know what to tell the kids." / "Deed's in our name. Nobody touches the deed." / "He was there? In the stands? He watched?"). If `rook` told it, Rook stands alone at the gate in front of the plaque with his cap off. **The camera holds him from the workshop door at 0.85 for 4 s**: an old man in front of a bronze sentence. After a while Odette walks out to him with her umbrella and holds it over both of them without speaking. If `jin` told it, the gate is empty.
- Later that night (shown in the rest card), Nell and Odette open the Courts' basement records door with Mara's key, and the residents start reading the Council's books on the community-room tables.

### 7.7 Where Jin sleeps; the roof (chapter ending)
- **Mara** at the workshop door, not looking at him: "Cot's still there."
- **Choice `ch7_stayed_at_courts`:**
  - "I'll stay." → `true`. She nods once and goes inside to check the heater. (If Jin had 4D and kept it, "Cot's still there" becomes "4D's still yours. I'm not the one who'll take it off you.")
  - "I'll get a room downtown." → `false`. The Calder Arms Hotel, $45 a week (if he can't afford it, Teddy's back room at Iron Pulse instead, said plainly). **Mara:** "...Okay." She doesn't argue.
- **The roof of Building C** (11 PM; rain easing). Jin climbs alone. Below, the yard: four buildings, the windows lit and dark in a pattern that wasn't there last week. If `mara ≥ 2`, Mara comes up after a minute, no thermos this time, and stands beside him. **Mara:** "I'm going to fix the boiler controls tomorrow. Because it's Friday and they need fixing." **Jin:** "I know." **Mara:** "I'm not saying that to make you feel better. I'm saying it because I don't know what else is true." She goes down. Otherwise he is alone.
- The camera eases out to 0.7. Thought: "*He had a list. Two hundred and twelve names. He had my name too.*" [beat] "*Castell. He was there for the word.*"

## Encounters
- **E7.1 The union hall lobby** (only if `ch4_dutch_after = kept_going`; always before the confrontation): **Whistle** (`director`) + 2 `thug` between the trophy case and the folded pantry tables. The pantry closed at 2 PM: no civilians are present (staged deliberately); Bernice has gone to lunch. `maxAttackers: 2`. **No tips**: the first fight since Ch4 that assumes the full toolkit and says nothing. Hit the director first; hooks among the tables; retreat to the stair's choke. Checkpoint at the street doors. ~45 s. Whistle crawls for the door; the player can let him.
- **No fight with Rook, ever.** The office has no HUD. Rook never raises a hand.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Rook's question | `ch7_rook_answer` = `would_have_asked` / `dont_know` / `not_this` | Rook's reply | Ch9 night: Rook (or Odette, if Rook told the Courts) quotes it back ("He said you said you didn't know. That's the most honest thing anybody's said about any of this."). Ch10: Jin's last thought at the gate uses it. |
| Hit Rook | `ch7_hit_rook` (bool) (PDF Q4) | One punch; `harm_count` +1 | Rook's bruise at the meeting; Ch9 night Rook: "My lip's healed. I'd have let you do it twice." / (false) "You didn't hit me. I've been trying to decide all month whether that was mercy or contempt." |
| Who tells the Courts | `ch7_truth_told_by` = `rook` / `jin` | Who stands at the front; `courts` +1 if `rook` | Ch9 night: `rook` → a vigil for Mi-ok and Min-ji in the yard (Nell's idea; candles in jars on the garden beds); `jin` → ordinary laundry on the lines and the residents divided. Ending Two: Rook testifies either way; only after `rook` does he speak at the Courts' meetings again. |
| The envelope, late | `ch5_returned_envelope` → `confessed_late` | Darnell's "...You?" | Ch9 Penner's dossier line changes. |
| Where Jin sleeps | `ch7_stayed_at_courts` (bool) | Mara's nod / "Okay." | Ch8–9 base: the loft (or 4D) / the Calder Arms. The Ch9 night starts there. |

## Chapter ending and state handed on
- **Completion screen:** the chain board with all three rings lit and the red thread running across it. "Jin learns why he was sacrificed." What you did: "You laid the memo on his desk." / "You told him nobody asked you." / "You didn't hit Walter Rook." / "Rook told them himself."
- **Rest card: `Nine days.`** Vignette (20 s): the workshop (or the hotel). The rain stops over three dissolves. The Courts' community room with ledgers open on every table and Gus reading one with his glasses on his forehead. Jin hangs Min's coat on a nail (if mended) or folds it into his bag. Earl's radio: Channel 6 sports: "...and this Saturday the Civic Arena says goodbye, with Calder's own Ray Castell as guest of honour..."
- **Handed on:** the complete chain (`ev_exec_minutes` ★, `ev_council_ledger` ★, `ev_rook_notebook`, `ev_rook_testimony` ★, `ev_alder_letter`); `mem_row_k`; the People entry `ASH-0894 — ?`; training cap 4 (final); Courts residents' barks and dispositions changed for the rest of the game; Council HQ stays open on the map (Rook's office lit late every night through Ch9). Objective: **`Ray Castell. The Civic Arena, March 8.`**



# Chapter 8 — The Man in the Other Corner

**Card:** black; **the bell**, almost unmuffled now: a clean, bright strike with only a little cotton around it. No other sound answers it. `The Man in the Other Corner` · `Calder Civic Arena · Saturday, March 8, 1997`.

## Date, mood, palette, weather
- Saturday, March 8, 1997 ("Farewell to the Civic", the arena's closing night): 3:00 PM Castell Champions Gym → 7:00 PM Iron Pulse → 10:05 PM the Civic, outside → 10:40 PM backstage → the fight ends near 11:50 PM (the clock time Ch0 ended) → dawn Sunday, March 9, Kwik Copy.
- Mood: ceremony and dust. Everything rhymes with Chapter 0 a half-step off: the same building, emptier; the same bell, rung by the same old hand; the same corner, with whoever Jin kept. A real fight, won, followed by nothing.
- Palette: Castell's gym in gold vinyl and mirrors. The Civic: the same four white ring lamps over the same blue-and-red ring (left on for a photographer), but the tiers **empty and dark**, dust hanging in the lamp beams, farewell bunting sagging from the rail, confetti from the evening's ceremony on the floor. The only saturated colours are the ring and the lamps, exactly as in Ch0, with nothing around them. Dawn at Kwik Copy: fluorescent white against a pale blue street.
- Weather: a raw, windy March day; wet streets drying; at night wind round the building and a dumpster lid banging at Dock B.

## Gameplay identity
**Finish the fight.** A short walk through the places of 1994 in reverse, a corner and a sealed bottle, then **the major personal combat climax** (PDF): Ray Castell, the same ring, lights, corner and bell, with attack patterns the player has seen and can now answer, testing everything learned since Chapter 0. Then a decision at the end of the fight that changes the sound of the rest of the game, and a dawn of envelopes.
- Exploration 15% · dialogue 15% · combat 40% · cinematic 20% · activities 10% (the copy run).
- Target length: 20–22 min.
- No new skills (the toolkit has been complete since Ch6). This is the full-system exam. The fight is winnable by speed and timing, and never comfortable: "His speed allows him to win a short, desperate encounter; afterward, his exhaustion and limitations remain."

## Locations

### `castell_gym` — Castell Champions Gym, downtown (1200 × 360)
Glass front with gold vinyl lettering `CASTELL CHAMPIONS GYM — HOME OF THE CROWN` → reception desk with a bowl of mints → a ring with gold ropes → mirrored walls, a row of new red heavy bags → the **wall of framed press**: Ring covers, posters, a Crown Motors billboard proof ("At Crown Motors, *everybody's* a champion"), and the **Calder Ledger front page of August 21, 1994**: `CASTELL KEEPS CROWN`, a photo of Ray walking away from the blue corner and, at the bottom edge, a man in blue trunks face down. By the door, a poster: `FAREWELL TO THE CIVIC — SAT MARCH 8 — An evening with Calder's champions — Guest of honour RAY "THE CROWN" CASTELL — 1961–1997`. Bright, clean, a radio on a sports station.

### `iron_pulse` (Ch2 location), early evening: the back room.

### `civic_exterior` — Calder Civic Arena, outside (1400 × 360)
The marquee `THANK YOU CALDER — 1961–1997`. People leaving the farewell event at 10 PM in coats, holding commemorative programmes. The parking lot, half empty; on its fence a big construction sign: **`COMING 1998: RIVERSIDE LOFTS — Luxury living on Calder's riverfront — An Ashgrove Capital development`**, with a painting of glass towers where the arena stands. Morty's brown station wagon. Around the side, **Dock B** (the same sign, `DOCK B — NO PUBLIC ACCESS`), its roll-up door open for the cleanup crew. A payphone by the box office. Wind; sodium light.

### `civic_backstage_1997` — Service corridor (1600 × 360; Ch0's geometry)
Dock B → the commission table folded against the wall → a hot-dog cart, unplugged and cobwebbed (a 1994 price card `JUMBO $2.50`) → **Locker Room A** (the gold star tape torn off, leaving a star-shaped ghost; inside, Ray's gym bag on the bench and his overcoat on a hook) → **Locker Room B** (the `SEO / MARSH` masking tape gone; a clean rectangle in the grime where it was; inside: the same bench, lockers, sink and taping table; the bulb-ringed mirror now has four dead bulbs; **the fluorescent tube still flickers every 7 s**) → the tunnel. Half the corridor tubes off; footsteps echo; no crowd at all.

### `civic_ring_1997` — The bowl (1280 × 540; Ch0's ring and coordinates)
The ring is identical. Below Jin's blue corner, the **timekeeper's table with the brass bell with the chipped lip**, an auction tag tied to its handle `LOT 112 — TIMEKEEPER'S BELL, CIVIC ARENA, 1961`, and a cardboard box beside it. **Section 14, Row F**, empty. **Section 11, Row K**, empty. The press row, empty. A photographer's light stand being folded. Confetti on the floor. Four lamps; everything else black; dust in the beams; the ropes creak.

### `kwik_copy` (Ch6 location) at dawn
Dot unlocks at 5:20 AM; the lights flicker on one row at a time; the copiers warm up with a rising hum; Min's cubby; on the corkboard, a sun-faded 1995 `MISSING — JIN SEO` flyer nobody ever took down.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `ray` (Ray Castell, 32, champion) | the ring, alone, in a charcoal suit with the tie pulled loose; sitting on the apron | showman's slow walk; taps his gloves together twice | see 8.6 | — | `ch0_resistance`, `ch8_hands`, `ch8_ray_after` |
| `morty` (Morty Fine, 74, Civic timekeeper since 1961) | the timekeeper's table | polishing the bell with a handkerchief | "Thirty-six years I rang this. They were going to auction it. Lot one-twelve. I said like hell." / "Somebody's got to ring it. Nobody's stopping anything tonight either, I suppose." | "BELL, Castell! The *bell*!" | `ch8_ray_after` |
| `teddy` | Iron Pulse; Locker B and the blue corner if `teddy ≥ 2` | mitts; kneeling at the stool | "I'm coming. Don't argue. I'm sixty-four. I don't have to listen to anybody." / "Hands up. Chin down. Feet under you." | "Feet." | `ch0_told_teddy`, `ch2_teddy_tone`, `ch3_lenny_water`, `ch8_teddy_bottle`, `ch8_ray_after` |
| `deshawn` | Castell gym, wrapping his hands to spar Ray's camp for $50 a session | headgear in his lap | (if `deshawn ≥ 1`) "Fifty bucks a session to get hit by a champion. Best job I ever had." / (if not) "He's slower than his posters. That's all you get from me." | — | `deshawn` |
| `gym_desk` (receptionist) | Castell gym desk | answering phones | "Mr. Castell's at the Civic tonight. It's a whole thing. They're tearing it down." | — | — |
| `dot` | Kwik Copy, 5:20 AM, a coat over her pajamas | stacking reams | "You call me at four in the morning, it better be for Min." / "Put your money away. Employee rate." | — | — |
| `joan` (Joan Albright, Calder Ledger metro desk; Hana's college roommate) | Castell gym at 6 AM (only if `stopped`) | steno pad | "Say it slowly, Mr. Castell. I'm going to print exactly what you say." | — | — |
| `hana` (phone; dawn vignette) | — | — | see 8.8 | — | `hana` |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i8_front_page` | Ledger front page, framed | `CASTELL KEEPS CROWN`. "*I've never seen it from outside.*" | — |
| `i8_farewell_poster` | Farewell poster | (text above) "*1961 to 1997. Like a gravestone.*" | — |
| `i8_riverside_sign` | Construction sign | (text above) "*Ashgrove.*" If the People entry `ASH-0894 — ?` exists: "*ASH. Ashgrove.*" | (pays off in Ch9) |
| `i8_dock_b` | Dock B | "`DOCK B — NO PUBLIC ACCESS.` *Twenty-three fifty-two. One passenger.*" (the transport log) | — |
| `i8_tape_ghost` | Locker Room B door | "*A clean rectangle where my name was. Somebody peeled me off.*" | — |
| `i8_tube` | Fluorescent tube | "*Every seven seconds. Still.*" | — |
| `i8_hotdog_cart` | Hot-dog cart | "*Jumbo, two-fifty. Min had two.*" | — |
| `i8_bell` | The bell | (before the fight) Morty: "Don't touch it, son. It's mine now." / (after, if Ray is down) `Ring the bell` | `ch8_ray_after` |
| `i8_ray_bag` | Ray's gym bag (Locker A) | (after the fight) the inner zip pocket and a folder | `ev_penner_note` ★, `ev_alder_agreement` ★ |
| `i8_payphone` | Civic payphone | `Call Hana` | `hana` +1 |
| `i8_missing_flyer` | Old flyer (Kwik Copy) | "*Min's number. Nobody took it down.*" `Take it` | `bel_old_flyer` |
| `i8_envelopes` | Manila envelopes (Kwik Copy) | the copy-holder activity | `copy_holder_<id>` |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q8_main` | main | `Find Ray Castell.` → (optional) `Iron Pulse. Teddy.` → `The Civic. Tonight.` → `Get ready.` → `Walk out.` → (fight; HUD reduced) → (after) `Find what Ray kept.` → (dawn) `Make copies. Give them to people who'll keep them.` → **`Ashgrove Tower.`** | Scene triggers; the fight; Locker A; the copies | `ev_penner_note` ★, `ev_alder_agreement` ★, `ev_ray_statement` (stopped only); copy holders; map node **Ashgrove Tower** |
| `q8_call_hana` | side | `Call Hana.` | Civic payphone after the fight | `hana` +1 (and −1 if `continued`, applied separately) |

## Scripted scenes

### 8.1 Afternoon: Castell Champions Gym
- Glass, mirrors, gold ropes. The **front page** on the press wall: the camera pushes slowly 1.0 → **1.35** on the photo of the blue corner while Jin stands in front of it. Thought: "*I've never seen it from outside.*"
- **Receptionist:** "Mr. Castell's at the Civic tonight. It's a whole thing. They're tearing it down."
- **Deshawn**, on a bench, wrapping his hands for a session with Ray's camp. If `deshawn ≥ 1`: "Fifty bucks a session to get hit by a champion. Best job I ever had." [beat] Scouting, spoken only, in his voice:
  - "He still taps his chin before the right. He doesn't know he does it. Nobody tells a champion anything."
  - "Sometimes he drops the shoulder and nothing comes. When it's real, his back heel comes up. When it's a feint, the heel stays down."
  - "His right shoulder's shot. Two big rights in a round and he's got to drop it and roll it. A second. That's your door."
  - "And he throws after the bell. Every round. In sparring too. He thinks it's a habit." [beat] "It's who he is."
  - If `deshawn < 1`: he doesn't look up. "He's slower than his posters. That's all you get from me."
  - (These openings exist in the fight whether or not the player heard about them; hearing about them only teaches where to look.)

### 8.2 Early evening: Iron Pulse (branch by `teddy`)
- **`teddy ≥ 2`:** Teddy is packing his old kit into a canvas bag on the cot: tape, gauze, Vaseline, the red towel, an end-swell, a **new bottle of water still in the store's paper bag**, and, folded on top, the **navy robe with `EASTGATE` across the back** from the box marked `SEO — DON'T TOSS`. **Teddy:** "I'm coming." [beat] "Don't argue. I'm sixty-four. I don't have to listen to anybody."
- **`teddy < 2`:** Teddy is mopping. **Teddy:** "You're going to the Civic." **Jin:** "Yes." [beat 2.0] **Teddy:** "...Chin down." He doesn't come. (He hands Jin the robe without a word if `teddy ≥ 0`; otherwise it stays in the box.)

### 8.3 The Civic, outside
- 10:05 PM, wind. People leaving with programmes; a man to his son: "Your grandfather saw Marciano here. Well. On TV here." The marquee. The **Riverside Lofts** sign on the lot fence (the camera holds it 1.5 s as Jin passes; no thought unless examined).
- Round the side to **Dock B**: its door is up for the cleanup crew. The camera frames the door exactly as Ch0's Dock B shot, but from outside.

### 8.4 Backstage, 1997 (playable walk; the corridor in reverse)
- Every Ch0 object in its place, aged: the commission table folded against the wall, the hot-dog cart in cobwebs, Locker Room A's star-shaped ghost of tape. Through its open door, Ray's gym bag on the bench (not searchable yet: "*Later.*").
- **Locker Room B.** The clean rectangle where the tape was. Inside, the bench, the sink and **the tube flickering every 7 s**. The room tone is the Ch0 room tone, note for note.

### 8.5 Locker Room B: the corner (key scene)
**If Teddy is present:**
1. Teddy sets the bag on the bench. **"Sit. Hands."** Interaction `Hold still`. Camera **1.35 on the hands**: the third time the game has used this framing (Ch0 Lenny, Ch3 Lenny). **Teddy's hands do not shake.** The tape tears; the tube flickers.
2. **Choice `ch8_hands`.** **Teddy:** "Wraps or brass?"
   - "Wraps." → `wraps`. **Teddy:** "Good." He ties off the wrap with his teeth. (Mechanically: power 0.70, counter-cross damage ×1.3: clean technique rewarded.)
   - "The knuckles." → `knuckles`. Teddy looks at the brass for 2 s. **Teddy:** "...Those aren't boxing, kid." **Jin:** "Neither was the last one." Teddy tapes over the brass so it won't cut, without another word. (Power 0.90, counters ×1.0, stagger +10%. Tuned so both are equally winnable; the choice is about what this fight is.)
3. **The bottle, `ch8_teddy_bottle`.** Teddy takes the bottle from the paper bag and holds it up between them. **Camera 1.4 on his hands and the cap.** "Sealed. I watched the kid at the store put it in the bag. I've watched it all the way here. It's been in my coat." He twists the cap: **a small, clear plastic *snap***. (If `ch3_lenny_water = tap_cup`: "Sealed. You watched me open it.") He holds it out.
   - "Drink." → `drank`. Jin drinks. Teddy nods once.
   - "I'm fine." → `declined`. Teddy looks at the bottle, then puts the cap back on. "...Yeah. I'd do the same."
4. **The robe, `ch8_robe`.** Teddy shakes it out. The crooked G. **Teddy:** "Your mother sewed those letters. Two nights. I said I couldn't look at it. I'm looking at it."
   - "Put it on." → `true`. Teddy holds it while Jin puts his arms in. Jin will walk out in it.
   - "Not tonight." → `false`. Teddy folds it over the bench. "It'll be here."
5. **The door opens.** The camera *jumps* to it (the Ch0 rhythm), and the player braces for a cut. **There is no cut.** It's an old man in a cardigan with a cardboard box: **Morty Fine.** "You the Seo kid? He's waiting on you. He said you'd come tonight." The scene continues unbroken; Teddy is still there; nothing is missing. (The player who remembers Ch0 will feel the absence of the four seconds.)

**If Teddy is not present:** Jin wraps his own hands, alone, slower (a longer `Hold still`, a clumsy wrap; one strip has to be redone). `ch8_hands` is a thought: "*Wraps. Or brass.*" No bottle. The robe (if Teddy gave it) is a choice by itself. Morty opens the door the same way.

### 8.6 The tunnel and the ring (playable walk, then key scene)
- The tunnel: the same 1100 px of dark, but **silent**: no crowd, no announcer, only footsteps and, growing ahead, the hum of four lamps. Teddy (if present) walks beside Jin with a hand on his shoulder and asks nothing. If `ch8_robe`, the robe's hem moves with the walk.
- **The reveal, reprised.** At the mouth the camera pulls out from 1.0 to **0.8** over 2.5 s while Jin walks, exactly as in Ch0. The arena opens: the white lamps, the ring, dust in the beams, empty tiers. The player has 4 s to look, and the composition places the same three thirds: **Section 14, Row F** (empty), **Row K** (empty), **the press row's end** (empty). Confetti on the floor. Morty at the timekeeper's table, polishing the bell.
- **Ray** sits on the ring apron in his charcoal suit, tie loose, a pair of white gloves beside him from the evening's photographs. A photographer folds his light stand and leaves by the far tunnel: "Thanks, champ. Great stuff." Ray raises a hand without looking.
- Jin climbs through the ropes **at the blue corner**.
- **Ray** (by `ch8_hands`): `wraps`: "Wraps. Okay. You want it to be boxing." / `knuckles`: "Brass. So it's not boxing. Fine. Neither was the last one."
- **Ray** (standing, taking off the jacket, folding it over the top rope): "I saw it in the second round. I knew. You think I didn't know?"
- **Ray** (by `ch0_resistance`): `≥ 1`: "You hit me [N] times in that third round. Clean. Nobody ever believed me it was [N]. Everybody wanted it to be zero." / `0`: "You never laid a glove on me in that third round. I told myself that's why I didn't stop. Because you weren't fighting back."
- **Jin:** "Who told you not to stop?"
- **Ray:** "Everybody wants a name from me." [beat] "You know what I had, that night? A mortgage on my mother's house. Six guys in my camp whose kids ate because I won. A manager who'd sold me to a bank. You know what a champion is at twenty-nine? A man who's about to not be one."
- **Ray:** "They're putting up lofts where this ring is. You know who's guest of honour at the groundbreaking? Me. You know what I am without the belt? Nobody's guest."
- **Ray** (pulling on the white gloves): "Three rounds. Like last time. You're standing at the end, I'll give you a name. I'm standing, you walk out of my arena and you never say my name again."
- **Jin:** "It's not your arena."
- **Ray:** "It is for two more weeks."
- **Morty** (sitting down at the table, setting the bell upright, taking out the hammer): "Somebody's got to ring it." [beat] "Nobody's stopping anything tonight either, I suppose."
- Ray taps his gloves together twice (the Ch0 gesture). **The bell.** Clear. The first unmuffled bell since 1994.

### 8.7 The fight — see E8.1. Between rounds (12 s, full letterbox):
- **With Teddy, after round 1:** "Hands up. Chin down. Feet under you." [beat] **Jin:** "That's the whole religion." **Teddy:** "...That's the whole religion."
- **With Teddy, after round 2:** camera **1.3 from behind the blue corner post**, the exact Ch0 Corner 2 framing. **Jin:** "Teddy." **Teddy:** "What? What is it?" [beat 1.5] **Jin:** "Nothing's wrong." [beat] **Teddy:** "...Okay." [beat] "Okay, kid." (If `ch0_told_teddy`, very low: "I should've stopped it. I'm stopping it tonight if I have to. I mean it this time.") The stool is pulled; **the camera stays on the empty stool for 1.0 s**, as in Ch0.
- **Without Teddy:** no stool. Jin leans on the ropes. After round 1, Morty pushes a wooden stool up to the apron with his foot: "Sit down, son. You look like hell." After round 2, Morty, without looking up from his stopwatch: "Your corner man ought to be here." **Jin:** "He was. Once."
- **A safety valve, never the expected path:** if Jin's condition is below 20% going into round 3 and Teddy is present, a stool choice appears: "I'm fine." / "Something's wrong." "Something's wrong" makes Teddy stop the fight on the spot ("That's it. That's it, Ray, we're done."), and Ray, breathing hard, sits down on the canvas and gives the name anyway (as `stopped`: "...Your corner stopped it. Huh. Nobody stopped it for you.") The player is never trapped in this fight the way Jin was in 1994.

### 8.8 Ray down: the choice (key scene; no timer; the PDF's "stop or continue")
- When Ray's condition reaches its floor he is no longer a threat. The scene takes over gently: Ray staggers back **into Jin's blue corner**, where Jin fell in 1994, slides down the ropes and sits on the bottom rope with his gloves in his lap. His guard won't come up. The music drops out. The four lamps hum. Morty's hand hovers over the bell. The input buffer is flushed and input is ignored for 1.0 s (nobody "continues" by mashing the last combo).
- The camera eases to **1.15**, a wide two-shot: Ray in the corner on the left third, Jin centre, the timekeeper's table and the bell on the right third below the ring. **Control returns with two in-world prompts and nothing else:**
  - Near Ray: `[Keep hitting him]`. The **first** ATTACK press does not hit: Jin raises his fist over Ray and holds (the punch frozen at its start), and a thought appears: "*He's done.*" The **second** press commits.
  - At the timekeeper's table (Jin climbs out between the ropes and walks to it): `Ring the bell`.
  - If the player does nothing: nothing happens. After 15 s, one thought: "*Walk away. Or don't.*" No timer, no default.
- **`Ring the bell`** → `ch8_ray_after = stopped`. Morty slides the hammer across the table without a word. Jin strikes the bell **once**. The ring is clear and decays over **6 seconds** while every ambient bed (lamp hum, wind, the building) fades to zero. **True silence, 3 s**: the first in the game. `bell_state = rung`.
- **`[Keep hitting him]`** → `ch8_ray_after = continued`. Each press is one blow: muffled, no spark, no hit-stop, no shake. On the first, **Morty starts hammering the bell**, standing: *ding, ding, ding*, "IT'S OVER! IT'S OVER, SON!", the Ch0 pattern exactly, the bell ringing because nobody is stopping anything. **The camera cuts to a wide from high in Row K at 0.8**: the ring small and far below, the railing's shadow in the foreground like a flat cap (the composition of `mem_row_k`). The player sees what they are doing from where Rook sat. After the third blow Jin stops on his own, chest heaving. The bell goes on 4 s more; Morty stops; the arena hum returns with **a high, thin ring under it that never fully goes away** (`bell_state = ringing`). `harm_count` +1.

### 8.9 Nothing (key scene; breath zone; no time limit)
- Jin sits on the ring apron in the blue corner. Ray is a shape on the ropes behind him.
- **Sound bridge:** the 1994 crowd, faint. **`mem_reel`**: the whole night, uncut, 25 s of memory-filtered frames: the kitchen ("Eat first. Then be famous."); Locker B with the four seconds in sequence (the ice bucket, the bottle with the red tape, the gloves laced, "Time."); the tunnel; round 1, `KES-SLER!`; the corner ("Send him."); round 3; the chin tap; the fall; the bell. It ends on **Section 14, Row F: Umma with both hands at her mouth, Min with her sign and the yellow scrunchie.**
- **Match cut** to the same seats, now: empty, dust drifting through the lamp beam. Hold **4.0 s**.
- Thoughts, one per press, only while the player stays seated: "*I thought it would feel like something.*" / "*Umma's still dead. Min's still dead.*" / "*Two and a half years. Still gone.*" / "*My hands are shaking.*" (They are: a cosmetic tremor on Jin's idle pose for the rest of the night; his walk has the Ch1 limp again, `limp 0.25`, until he sleeps. The fight was short and desperate; this is what it cost.)
- If Teddy is present he sits down on the apron next to Jin, slowly, knees cracking. After a while: "...Let's go home, kid." (If `continued`, Teddy sits one body-width farther away and says nothing. `teddy` −1.)
- The objective returns only when the player stands: `Find what Ray kept.`

### 8.10 What Ray kept (evidence)
- **If `stopped`:** Ray, still on the bottom rope, after the silence: "Penner." [beat] "Lyle Penner. Ashgrove Capital. A note came to my hotel the night before the fight. On his paper. 'The referee has been spoken to. Don't stop till it's done.'" [beat] "And in the third I looked down the press row, and the man in the camel coat nodded. Penner's man. So I threw." (`mem_row` completes: the Ch0 half-second, now with the nod in it.) "I kept the note. Insurance. It's in my bag. It's always in my bag." [beat] "I knew you were hurt. I kept going. I'll say that to anybody you want." [beat] "Tell your nurse to bring a reporter to my gym at six. I'll say it once." → leads to `ev_ray_statement`.
- **If `continued`:** Ray can't speak. Morty packs the bell into its box, puts on his coat and leaves without looking at Jin. Jin goes to Locker Room A alone. (`mem_row` stays at shard 1: the nod is never seen.)
- **Locker Room A** (both): Ray's gym bag.
  - Inner zip pocket: **`ev_penner_note`** ★, folded small, soft from years: heavy cream notepaper engraved `ASHGROVE CAPITAL`, fountain pen: `Aug. 19, 1994. Ray — The referee has been spoken to. Don't stop till it's done. Everything after is arranged. — L.P.`
  - In a folder: **`ev_alder_agreement`** ★: `COMMUNITY AMBASSADOR AGREEMENT between Ashgrove Capital, L.P., and Raymond Castell. Appearance fee: $40,000, payable upon the Ambassador's participation in the groundbreaking ceremony for ALDER COMMONS, to follow the closing of the Company's acquisition of the Alder Row Cooperative, Southbank (24 units), scheduled Friday, April 18, 1997, 10:00 a.m., Ashgrove Tower, 30th floor. Ambassador: R. Castell, or an alternative to be agreed by the Company. Signed: Lyle Penner, Managing Director.` The cover photo: four plain brick buildings by the river, laundry on a line. Thought: "*Twenty-four.*" [beat] "*'Or an alternative.'*" If `ev_alder_letter` is held: "*Rook's letter. Voluntary relocation.*"
- **Payphone** (`q8_call_hana`): **Hana:** "Jin? Are you hurt?" `stopped`: **Jin:** "No. He is. I stopped." **Hana:** "...He'll talk? On the record?" [beat] "Joan. My roommate from State. She's at the Ledger. I'll call her now." / `continued`: **Jin:** "...I didn't stop." Long silence. **Hana:** "Is he alive?" **Jin:** "Yes." [beat] **Hana:** "Okay." [beat] "Go home, Jin."
- **No combat after this.**

### 8.11 Dawn: Kwik Copy (activity) and the envelopes
- A payphone at 4:10 AM. **Dot:** "You call me at four in the morning, it better be for Min." **Jin:** "It's for Min." **Dot:** "...I'll be there at five."
- **Kwik Copy, 5:20 AM.** Dot unlocks in a coat over her pajamas; the lights come on one row at a time. **Copying (activity):** Jin feeds the evidence through the copier, one document per press; **the copier's light bar sweeps across his face each time** (the echo of the St. Agnes Xerox sweeping across Hana and Jin in Ch1). The stack grows. Dot staples.
- **The envelopes (`copy_holder_<id>`).** A counter of manila envelopes and a marker. The player writes a name on as many as they choose, from those who would keep one. Eligible names appear only if they qualify; ineligible people don't appear (the hidden-option rule), and Jin's thought says why once ("*Lenny ran. Lenny won't keep anything for me.*"):
  - **Hana** (always; written first, automatically).
  - **Mara** (`mara ≥ 1`) · **Teddy** (`teddy ≥ 1`) · **Lenny** (`ch3_lenny_method = patient`) · **Deshawn** (`deshawn ≥ 1`) · **Roz** (`ch4_roz = let_go`; mailed to her sister's in Quincy) · **Wendell Asher** (`ch6_asher_method = patient`) · **Mrs. Okafor** (always offered: "*She's my family's family.*") · **Dot** (always offered: "Me? ...Yeah. Give me one. I'll put it in Min's cubby.") · **Ray** (`stopped`).
  - More holders means a faster, wider exposure in Ending Two's epilogue; fewer is allowed. Dot, when Jin tries to pay: "Put your money away." [beat] "Employee rate."
- Optional: `Take it` (the old MISSING flyer). **Dot:** "Take it. It's yours. It's always been yours." `bel_old_flyer`.
- **6:00 AM, Castell Champions Gym** (only if `stopped`; a 15 s vignette, no control): Ray in last night's shirt, one eye swollen shut, on his own ring apron. Joan Albright with a steno pad; Hana beside her in her navy coat. **Ray:** "I knew he was hurt. I kept going." [beat] "Lyle Penner. P-E-N-N-E-R." → `ev_ray_statement`.
- **The montage** (25 s, wordless; each holder gets a 2–3 s shot as Jin hands over the envelope, in the order written): Hana at St. Agnes's back door, tucking it inside her cardigan. Mara at the workshop, sliding it behind the pegboard. Teddy putting it in the box marked `SEO — DON'T TOSS`. Lenny at the Starlite loft, holding it like it's hot ("...Yeah. Okay. Yeah."). Deshawn in his Walkman case. Roz's envelope into a blue mailbox on Market Street. Wendell Asher folding it into a pillowcase ("In case."). Mrs. Okafor into her Bible. Dot into Min's cubby. Ray (if stopped) into the inner pocket where the note was.

## Encounters

### E8.1 Ray Castell, 1997 (`A.bout`, unsanctioned; the major personal combat climax)
`ring {x0:380, x1:900}` (Ch0's coordinates), `opponent {type:'champion', name:'Ray Castell', opts:{patternSet:'ch8'}}`, `rounds:3`, `roundTime:60`, `crowd:false`, `bell:true` (Morty), no referee, corner by `teddy`. Checkpoint at the start of each round; if Jin's condition hits zero he goes down; **Ray:** "Get up. I'm not doing this twice." and the round restarts. HUD: Ch0's ring HUD plus the two dash pips. Music: percussion only, sparse, the Ch0 fight cue slowed 10%.

| # | Attack | Tell | Answer | Echo |
|---|---|---|---|---|
| 1 | Double jab, step right | a small step in | slip either jab → counter-cross | Ch0 |
| 2 | **Chin tap → straight right** | the left glove taps his chin (0.35 s) | perfect slip → the longest counter window in the fight | Ch0's tell, now the player's weapon |
| 3 | Body hook → head hook | Jin holds guard > 1 s | don't turtle: backdash out of the second, hook as he resets | Ch0 |
| 4 | Lean-back counter | Jin throws three jabs in a row | don't; jab–cross–hook or go to the body | Ch0 |
| 5 | **The feint** | the right shoulder drops but the back heel stays down; a jab comes instead, then the real right a beat later | wait for the heel; slipping on the shoulder alone gets punished | Deshawn's scouting |
| 6 | **The shoulder** | after two straight rights in a round he drops the right hand and rolls the shoulder for 1.2 s | dash straight or flurry into the opening | Deshawn's scouting |
| 7 | Clinch-and-lean | Jin is winded | break with a backdash on his first step or a short uppercut inside (he can't be launched, but the uppercut breaks the clinch) | — |
| 8 | Showman's flurry (below 50%) | he taps his gloves together twice | backdash → returning cross | Ch0's glove tap, given a meaning |
| 9 | **The after-the-bell right** (end of rounds 1 and 2) | the bell, then 0.3 s | slip it; **the counter window does not open**: Jin's thought says "*Bell.*" and he lowers his hands and walks to his corner. **Morty:** "BELL, Castell! The *bell*!" **Ray:** "...Habit." (Jin's restraint as character, not a player decision; the player's decision comes at the end.) If the slip fails, the punch lands, and that's all. | Ch0's last punch |
- **Round 3:** Ray throws pattern 2 twice in a row, the 1994 finish. Countering both ends it if it hasn't ended already.
- **Boss rules:** resists stagger (no flinch from jabs after the first two in a sequence; recovers from stagger in 0.6 s); no launch loops; can't be knocked out early (the scene owns the ending). Below 30% he glances toward the empty press row, as if checking for someone.
- **Jin's limits:** he gets winded sooner than in any earlier fight and the stool restores only part of it; by round 3 his shoulders heave after short exchanges. Tuned to be won in round 2 or 3 by a player who reads and counters; a player who trades ends up exhausted and restarts the round.
- **What it teaches:** nothing new. Every verb since Ch0 has a use, and the player who learned to read in Chapters 3–7 can read Ray.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Wraps or brass | `ch8_hands` = `wraps` / `knuckles` | Numbers; Ray's and Teddy's lines | Ch9 Penner: "Brass, at the Civic. We heard." (knuckles only). Ending Two: the knuckles on the rented room's windowsill (knuckles) or dropped off the river path at dawn (wraps; an optional `[Drop them.]` at the river rail, a prop only). |
| Teddy's bottle | `ch8_teddy_bottle` = `drank` / `declined` | Teddy's nod / he recaps it | Ending Two gym vignette: Teddy cracks a sealed bottle in front of a kid before handing it over. |
| The robe | `ch8_robe` (bool) | Jin walks out in it | Ending Two: it hangs on the back of the rented room's door. Ending One: the PR people want it for the comeback walk-out ("The original robe! It's a story!"). |
| Ray down | `ch8_ray_after` = `stopped` / `continued` (PDF Q4; the player's choice; **never read by the ending**) | The bell rung once into silence, or hammered by Morty while the player watches from Row K; Ray's name, the nod and `ev_ray_statement`, or silence; `harm_count` +1 if continued | `bell_state` for every remaining card and Ending One's last sound. Relationships: Teddy, Hana, Mara −1 each if `continued`; Deshawn ("You did what he did, man." / "You stopped. Huh."). Ch9 Penner ("You stopped. Interesting." / "You didn't stop. Neither do we."). Ending Two: `stopped` → Ray's statement runs in the Ledger and he testifies; `continued` → Ray's camp closes ranks and the note stands alone. |
| Copy holders | `copy_holder_<id>` (bool each) | The envelopes; the montage | Ch9 Penner reads the list back to Jin; Ending Two: how widely and quickly the exposure travels. |

## Chapter ending and state handed on
- After the montage Jin walks from the last envelope to a bus stop as the streetlights go off one by one, the reverse of Ch2's dusk. The camera eases out to 0.85. Thought: "*Penner. Ashgrove. Friday, April eighteenth, ten o'clock.*" [beat] "*'Or an alternative.'*"
- **Completion screen:** the empty bowl with the ring lit, seen from Section 14. "Revenge fails to restore what he lost." What you did: "You wore wraps." / "You drank from Teddy's bottle." / "You walked out in her robe." / "You rang the bell yourself." or "You kept hitting him after he stopped being a threat." / "You gave copies to six people."
- **Rest card: `Five weeks.`** (20 s vignette, no control): Sunny's, a few days later. Rita's TV: "Champion Ray Castell has [withdrawn from public appearances, citing personal reasons (stopped) / withdrawn from public appearances after a reported assault (continued)]." Rita looks at Jin's hands and refills his cup. Then the base (loft or the Calder Arms): Jin training alone, his hands steady again; the Ledger on the cot (if `stopped`: `CASTELL: "I KNEW HE WAS HURT"` below the fold).
- **Handed on:** `ev_penner_note` ★, `ev_alder_agreement` ★, `ev_ray_statement` (if stopped); `mem_reel`, `mem_row` (complete if stopped); `bell_state`; copy holders; map: **Ashgrove Tower** (downtown, the riverfront) inked; the Civic fenced (`RIVERSIDE LOFTS — 1998`). **The Ch9 card:** if `rung`, there is **no bell**: the first silent card in the game. If `ringing`, a faint high ring sits under the card and doesn't resolve.



# Chapter 9 — The Offer

**Card:** if `bell_state = rung`: **no bell** (the first silent card in the game). If `ringing`: a faint high ring that doesn't resolve. `The Offer` · `Ashgrove Tower · Wednesday, April 16, 1997`.

## Date, mood, palette, weather
- Wednesday, April 16, 1997, 8:40 PM to 11:30 PM: the tower. Thursday, April 17, from morning to 5:10 AM Friday: **the day and night of consideration**, free roam, as long as the player likes.
- Mood: up out of the neighbourhoods into a clean, quiet, expensive place where nobody has ever had to see the consequences of a decision. Then the longest and warmest free roam in the game, saddest because everyone Jin meets is someone the player made, or didn't make, a relationship with.
- Palette: the tower is the anti-Eastgate: white marble, pale granite, brushed steel, clear glass, gray carpet, cool white downlights; **the only place in the game with no brick and no amber**, except the city itself through the glass: a field of amber windows far below, the river black, the Civic's dark dome with a crane beside it now. Thursday is Calder in full spring: green on Kessler, open windows, a ballgame on every radio.
- Weather: Wednesday spring rain that stops around eleven; the tower hums in the wind at the top. Thursday warm; clear night; mist on the river before dawn.

## Gameplay identity
**Climb, then consider.** A vertical assault through security in spaces built to look like nobody gets hurt in them (the PDF's "private offices, immaculate corridors, guarded reception rooms"), one frightened analyst, and a long seated scene in which the offer is laid out item by item and every question is answered honestly. Then a whole day and night across Calder to visit anyone, or no one, before the trucks leave. **No answer is given in the boardroom**; the decision is made at the gate in Chapter 10.
- Exploration 20% · dialogue 35% · combat 25% · cinematic 10% · free roam (the consideration) 10%+ (player-paced).
- Target length: 22–25 min (the tower ~13; the consideration as long as the player wants; a player who goes straight to bed finishes in ~15).

## Locations

### `ashgrove_plaza` — Ashgrove Plaza, the riverfront (1400 × 420, exterior)
Route 9 stop → a dry fountain with a polished steel loop titled `MOMENTUM` → a bronze statue `THE WORKER` (a foundry man with a ladle; plaque: `In honour of the men and women who built Calder. — Ashgrove Capital, 1991`) → the revolving doors. On arrival the camera **tilts up** for the only time in the game, from Jin at street level to thirty storeys of dark glass with one lit floor at the top (3 s, zoom 0.8), then back down. Uplights on wet granite; wind; the river horn.

### `ashgrove_lobby` — Lobby (1600 × 480)
White marble reflecting the downlights in soft horizontal bars → a long security desk (a bank of small monitors) → leather benches nobody sits on → a donor wall of brass names (one reads `NORTHSIDE COMMUNITY COUNCIL — COMMUNITY PARTNER, 1995`) → **under a glass case, the architectural model `ALDER COMMONS — 140 RESIDENCES — 1999`**: white towers, tiny plastic trees, tiny white figures with briefcases, and along the river edge **four gray blocks labelled `EXISTING STRUCTURES — TO BE REMOVED`** → elevators (key-card only after hours: "*Locked. Card only.*") → the **service stair** door. The HVAC hush replaces the rain the moment the revolving door turns (the district's signature sound).

### `ashgrove_stair` — Service stair (360 × 2000, vertical)
Concrete flights with steel rails; landings painted with big floor numbers (8, 15, 22, 30); the main lights cut below 15 (emergency red); a flight between 15 and 16 barricaded with a cleaning cart (air dash over the gap); a coffee can of cigarette butts on landing 27, the same as the Civic stairwell.

### `ashgrove_floor22` — Acquisitions, floor 22 (1200 × 360)
Open-plan gray cubicles at night; one desk lamp lit; a beige computer with a green-on-black spreadsheet; a printer; a child's drawing on Owen's partition (`DADDY'S OFFICE IS IN THE SKY`); a whiteboard in the project room: `ALDER — CLOSING 4/18 10:00 — · NCC letter (W.R. — no) · ambassador (Castell out — alt.) · HS crew x 12 · Ch. 6 at 8:00 · surrender forms x 24`; a wall of windows over the city (the Courts' lights, Eastgate, the river, the Civic and its crane). HVAC hush; a vending machine.

### `ashgrove_floor30` — Executive floor (1800 × 360)
Stair door → a **reception room** (an empty receptionist's desk, two leather sofas, a vase of white lilies, abstract canvases in beige) → a long **corridor of glass** with the city on the right → **Lyle Penner's office door** and beside it **a coat stand holding a knee-length camel overcoat and a charcoal scarf** → **the boardroom** at the end (a long pale table for fourteen, one lamp, a window wall; through it, across the river and downstream, Southbank and a short row of small lit windows: Alder Row).

### The consideration (Thursday): existing locations, spring state
`stagnes_2west` (night corridor), `courts_yard` and `courts_workshop`, `iron_pulse`, `union_hall`, `starlite_lot`, `okafor_3a`, `kessler_412_stairs_1996` and 3B's doorway, `sunnys`, `cemetery_s14`, and the **river path** (a viewpoint, not a map: from the rail, Alder Row across the water as a row of lit windows). **Alder Row itself is not on the map:** trying it shows "*Southbank. I've never been. I don't know anyone there.*" The first time Jin goes, he goes with them.

## NPCs present
| id | Where | Idle | Key lines | Barks | Reacts to |
|---|---|---|---|---|---|
| `celeste` (Celeste Ashgrove, 50s, chair of Ashgrove Capital) | the boardroom, seated at the far end, back to the window wall | hands flat and still; a flat palm on the table when something is settled | "We aren't your enemies, Mr. Seo. We're your options." / "Everything on this table is real. I'd be insulting you if it weren't." | — | several flags, quoted |
| `penner` (Lyle Penner, 40s, managing director) | the boardroom; standing at Celeste's right, then sitting on the table's edge | uncaps and recaps a black fountain pen | "We've been following you. Not in a sinister way. In the way we follow anything that's moving value around in Calder." / "I gave the last instruction because somebody has to. You'd be surprised how often that's all anyone at the top does." | — | `ch0_refusal_line`, `ch0_purse_dream` and the four tallies' flags |
| `camel_coat` | the boardroom window, his back to the room the whole scene | hands clasped behind him | (once, when Jin stands to leave) "I did tell you to take the money." | — | — |
| `owen` (Owen Tully, 26, analyst) | floor 22, the one lit desk | `write at desk`, then hands up | "I just model it. I've never been to Southbank." | — | `ch9_owen` |
| `garvey` (Mr. Garvey, head of building security) | floor 30 reception | radio in hand | "All units to thirty. All units." | — | — |
| guards | lobby, landings, floor 30 | baton | "Sir, the building is closed." / "Stairs! He's on the stairs!" | — | — |
| consideration visits | see 9.7 | — | — | — | each reads its own flags |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i9_statue` | Statue | "*'In honour of the men and women who built Calder.' They bought a statue of Mara's father.*" | — |
| `i9_model` | Alder Commons model | "*140 residences. Four gray blocks: to be removed. Somebody's kitchen is one of those blocks.*" | — |
| `i9_donor_wall` | Donor wall | "*Northside Community Council, community partner. Rook's on their wall.*" | — |
| `i9_whiteboard` | Whiteboard (22) | (text above) "*'Ambassador — Castell out — alt.' The alternative.*" | journal note |
| `i9_owen_drawing` | Child's drawing | "*'Daddy's office is in the sky.'*" | — |
| `i9_owen_screen` | Owen's screen | (scene 9.3) | `ev_relocation_model` (persuaded only) |
| `i9_camel_coat` | Coat stand | A camel overcoat, knee-length; a charcoal scarf; black leather gloves folded in the pocket. (No thought line. The camera stops on it for 1.0 s at 1.2 as Jin passes; the examine text is only the description.) | — |
| `i9_folder` | The blue folder (boardroom) | each item opens in the viewer (9.5) | `ev_offer_folder` ★, `bel_nameplate` |
| `i9_card` | Penner's card | `HARLAN STREET — 5:30 AM — FIRST TRUCK.` in fountain pen on the back of an Ashgrove business card. | — |

## Quests
| id | Kind | HUD objective | Completion | Reward / consequence |
|---|---|---|---|---|
| `q9_main` | main | (time card) `Ashgrove Tower. Find Lyle Penner.` → `Get upstairs.` → (22) `Keep going.` → `The executive floor.` → `Hear them out.` (HUD hidden) → **`Take the day. Harlan Street, Friday, 5:30 AM.`** (this line never changes or counts down) | Tower climbed; the offer heard; the player chooses to go to Harlan Street | `ev_offer_folder` ★; the trucks |
| `q9_visits` | side (non-binding; not shown as a list; a `…` marker over each person on the world map) | — | Any visit | `ch9_visits`; Mara's support line |

## Scripted scenes

### 9.0 Five weeks (time card and a 25 s vignette, no control)
- Time card `Five weeks.` (from March 9).
- Joan Albright on the phone in the Ledger newsroom, the cord wrapped round her wrist: "My editor won't run a boxer's word against Ashgrove. Not before their closing. Their lawyers sent a letter thicker than the Bible." [beat] "Get me someone who isn't a boxer and isn't dead, and I'll get you a front page." (Exposure is possible, and it will take people.)
- A black Lincoln parked across from the Foundry Courts gate in rain; then across from Iron Pulse; then across from St. Agnes. (They've followed his progress. Nobody comments.)
- Jin on the heavy bag in the Courts gym; Jin on Mara's roof crew (if `mara ≥ 1`) or unloading trucks at night (otherwise).
- Jin at the workbench (or the hotel desk) with the ambassador agreement open at its date: `Friday, April 18, 1997, 10:00 a.m.` Thought: "*Friday.*"

### 9.1 The plaza and the lobby
- 8:40 PM, rain. The tilt (see `ashgrove_plaza`). The statue. Through the revolving door the rain is cut off by the glass as it turns.
- The lobby is the first room in the game with nothing broken in it. The player can look at the model and the donor wall before the guards move. **Guard:** "Sir, the building is closed." **Jin:** "Lyle Penner." **Guard** (hand going to the baton): "Mr. Penner doesn't have appointments at night, sir." E9.1. The monitors at the desk show Jin from four angles while he fights.
- The elevators won't open. The service stair: `Get upstairs.`

### 9.2 The stair (vertical endurance)
- Flights and landings (E9.2). Running up flights makes Jin winded sooner; the player learns to pause on landings. **The PDF's mastery test as endurance: no new verbs, only better use of them.**
- Landing 22: the stair door propped open with a rubber wedge; a printer's hum beyond. The guards below have stopped coming for now; the stair is quiet.

### 9.3 Floor 22: Owen Tully (PDF Q2: threaten a frightened witness to save time?)
- One lamp lit among dark cubicles. **Owen**, tie loose, sleeves rolled, at the beige computer. He sees Jin in the stair door, stands so fast his chair rolls into the next cubicle, and raises his hands. "I'm an analyst. I'm— I do models."
- On his screen, green on black; camera **1.4**: `ALDER ROW — RELOCATION MODEL v7 · 24 households, 61 residents · expected holdouts: 6 · enforcement window 06:00–09:00 4/18 · "voluntary surrender" route: 1 day, $110,000 · eminent-domain route: 14–20 months, $520,000 · public face: J. SEO (TBC)`.
- [beat 2.0] Thought: "*They had me in the spreadsheet before I came in.*"
- **Owen:** "I just model it. I've never been to Southbank. It's units. Tenure, age, likelihood of holdout."
- **Jin:** "Who's unit three?"
- **Owen:** "...I don't know. It's a unit." [beat] "Tenure fifty-one years. Age eighty-four." [beat] "I don't know his name."
- **Choice `ch9_owen`:**
  - "Print it. Then go home, and don't come in tomorrow." → `persuaded`. Owen looks at the screen a long moment. He prints it (the printer's hum, the page sliding into the lamp light). He hands it over, takes his coat, and at the stair door: "I'll remember the six. I'll know which ones." [beat] "The executive elevator logs my card. I've got a kid. I can't." He points at the stair. "Eight floors." → `ev_relocation_model`. Jin climbs the eight floors from 22 to 30: no guards, the HUD faded out, only footsteps and breathing (a breath after the spreadsheet, before the last fight).
  - `[Take his keycard. Now.]` → `threatened`. Jin closes the distance; Owen flinches into the partition (`cower`). "Take it! Take it! It's on the lanyard!" In the panic he hits a key and the screen goes blank ("It saves to the server, I can't print it now, I'm sorry—"). No printout. The executive elevator takes Jin straight to 30 (the eight flights are skipped). `threat_count` +1. Owen pays for it (Penner, 9.4).

### 9.4 Floor 30: the stopped fight, the corridor, the boardroom
- The reception room: lilies, sofas, and **Mr. Garvey** with four guards and his radio (E9.3). **Garvey:** "All units to thirty. All units."
- **When Garvey drops (or at the encounter's 60% mark if the player is struggling):** the boardroom doors at the far end of the corridor open on their own. A woman's voice, unhurried, carries down the glass: **Celeste:** "That's enough, Mr. Garvey." The guards stop mid-motion and step back to the walls. Garvey lowers his radio. **Celeste:** "Let him in. He's been on his way here for two and a half years."
- The HUD fades out. The music stops. Jin walks the **glass corridor** (thin letterbox, walk speed); the city slides by on his right. **The coat stand** passes on his left: the camel coat. The camera stops on it for 1.0 s at 1.2. No line. He keeps walking.
- **The boardroom (key scene; full letterbox with a sit choice).** A long pale table. **Celeste** seated at the far end, her back to the window wall, hands flat and still. **Penner** standing at her right, pen in hand. At the window, **a man in a gray suit with his back to the room**, hands clasped behind him (the camel coat's owner; he never turns until the end). A blue folder on the table in front of the empty near chair. The camera holds a symmetrical wide at 1.0: the table's length is the distance between them.
  - **Celeste:** "Mr. Seo. Celeste Ashgrove. Lyle Penner, whom you've been looking for." [beat] "Please sit, if you'd like. You don't have to."
  - `Sit` (the camera eases to 1.1) / `Stand` (he stays behind the chair with his hands on its back). Presentation only; kept for the whole scene.
  - **Penner** (sitting on the table's edge, uncapping the pen): "We've been following you. Not in a sinister way. In the way we follow anything that's moving value around in Calder." [beat] He quotes the refusal word for word (`ch0_refusal_line`): "'I'm not for sale.'" / "'My family's in Section 14. I'm not losing in front of them.'" / "'Get out of my locker room.'" [beat] "August twentieth, Locker Room B. We have very good notes."
  - **Penner:** "We were impressed. Genuinely. A man who can't be bought at twenty-six is worth a great deal at twenty-nine."
  - **Penner's ledger of Jin** (each line only if its flag is set; he reads them off a single typed page, and the camera holds Jin, not Penner):
    - `ch1_fare_source = activities_jar`: "Six dollars and forty cents from a bingo jar. Even the bingo money."
    - `ch1_signed_name = seo_jin`: "'Seo Jin,' on a form, in front of witnesses. That's when we started paying attention."
    - `ch3_slim_result = arranged`: "You've accepted an outcome before, Mr. Seo. Starlite Lanes. Round two. We don't hold it against you."
    - `ch4_envelope = taken` and `ch5_returned_envelope ∉ {confessed, anonymous, confessed_late}`: "Eighteen hundred and forty dollars of other people's wages. You understood the arrangement before we offered it."
    - `ch4_took_profit`: **Celeste:** "And six hundred dollars of ours. Consider it an advance."
    - `ch5_took_4d` and not `ch6_gave_back_4d`: "And an apartment promised to a woman with three children. You slept fine, I hope."
    - `ch6_asher_method = threatened`: "You frightened an old man in a laundromat. Efficient."
    - `ch9_owen = threatened`: "Mr. Tully's card opened our elevator at nine-fourteen. He'll be clearing his desk in the morning. That was you, not us. You see how quickly it becomes nobody's fault?"
    - `ch8_hands = knuckles`: "Brass, at the Civic. We heard."
    - `ch8_ray_after`: `stopped`: "You stopped, with Castell. Interesting. He's been talking to a reporter. It won't come to much. A boxer with a grudge." / `continued`: "You didn't stop, with Castell. Neither do we. We sent him flowers." [beat] "You understand we send flowers."
    - If `take_count = 0` and `harm_count + threat_count = 0`: Penner closes the page. "You've been remarkably careful not to take anything that wasn't yours. I admire it. It's expensive."
  - **Celeste:** "Here's where we are. You've beaten men we pay by the hour. A depot, a basement, a champion, a floor of my building. You haven't touched a dollar of ours that matters. That isn't an insult. It's why this offer is real: we can still afford it." (PDF: he hasn't destroyed their resources; that is why the offer remains credible.)

### 9.5 The folder (interactive; the offer laid out)
The letterbox thins; the player opens the folder and each item opens in the viewer, in any order. Penner or Celeste speaks over each. **None of it is a trick.** (`ev_offer_folder` ★ collects them.)
1. **Treatment.** `BEACON STREET INSTITUTE, Boston · Residential Neuro-Rehabilitation · 18 months · Dear Mr. Seo: We are pleased to confirm your admission beginning June 2, 1997. Tuition and care: PAID IN FULL.` Stapled behind it, the price sheet: `est. $84,000`. Thought: "*Eighty-four thousand. Dr. Whitlow's number. It's the first page.*" **Celeste:** "The real thing. The program your Dr. Whitlow wrote down for you. You won't be what you were. You'll be a great deal more than you are."
2. **A home.** `Riverside Lofts, Unit 1104 · Term: 10 years · Rent: $0.00.` A floor plan; a photo of the site: **the Civic Arena's lot**. **Penner:** "It's going up where the Civic was. You'd be living over the ring. We thought you'd appreciate that. Or not. Either way it has a view." (If `ch0_purse_dream = new_apartment`: "The bathroom door has a lock. A good one. We have very good notes.") (If `rent`: "No rent. Ever. We read that too.") (If `umma_saturdays`: "Your weekends are yours.")
3. **Income.** `$4,000 per month, 36 months — appearances and community consultancy.` **Penner:** "Rent, food, physio, and something for Mrs. Okafor upstairs, if you like." (They know her name.)
4. **A name.** `In re SEO, JIN, formerly recorded as AHN, DANIEL — Petition to Correct Records — filed, Calder County Court — hearing June 3.` With the court's filing stamp. Thought: "*Hana's been trying to get my name back with forms since December. They did it with a phone call.*"
5. **A route.** Three bouts in 1998, named opponents and venues; a title shot in 1999 for **the vacant Continental Middleweight Championship**. **Celeste:** "Mr. Castell is no longer available. The belt will be."
6. **A press release (draft).** `KESSLER KID FOUND: Jin Seo's Remarkable Return. Ashgrove Capital's Beacon Fellowship restores Calder's lost champion.` A quote under his name: "*I never stopped believing in this city.*" **Penner:** "You can change the quote. People always want to change the quote."
7. **A small box.** Inside, **a brass nameplate engraved `JIN SEO`**. Camera **1.5** for 2 s. In Jin's pocket since Ch1: the card that said `AHN, DANIEL`. **Celeste:** "For your door. Your name, on your door." (`bel_nameplate`)
- **The price.** Penner lays a second, thinner folder on top: a photo of four plain brick buildings on the river, laundry on a line. "**Alder Row.** A residents' cooperative in Southbank. Twenty-four households. Average tenure eleven years. Six holdouts. Relocation assistance is generous; I wrote it myself."
  - **Penner:** "Tomorrow night, sleep. Friday at five-thirty a crew leaves Harlan Street. At six they arrive. You walk to the cooperative's office first and hand the president the surrender agreement, and a Channel 6 camera sees the Kessler Kid, who knows what it is to lose a home, helping Alder Row's families move on to something better. By nine the street is empty. At ten the board signs in this room. In May you cut the ribbon."
  - **Celeste:** "The sale pays for your future, and for some of ours. We won't pretend otherwise." [beat] "And it's your face. That's the part we actually want. Your comeback makes us look like what we say we are." (PDF: his public cooperation would legitimise the network.)
  - **Jin:** "Rook said no."
  - **Celeste:** "Mr. Rook said no the second time. It's easy to say no the second time." [beat] "You haven't been asked the first time yet."
- **The envelopes.** **Penner** reads names off a card, by flag: "Ms. Lim at St. Agnes. [Mrs. Kowalski at the Courts.] [Mr. Marsh.] [Mrs. Okafor.] [Mr. Voss, if he hasn't left town.] [Ms. Kaminski, formerly of our own dispatch desk, which was disappointing.] [Mr. Asher.] [A Ms. Pham at a copy shop.] [Mr. Castell.] And a Ms. Albright at the Ledger, who has been very patient with her editor."
  - **Celeste:** "We aren't threatening them, Mr. Seo. We're describing them. You could expose us. It's possible. I won't insult you by saying it isn't. It would take a year, a dozen people who'd have to keep being brave long after you'd stopped being interesting, a newspaper that would have to keep caring, and a great deal of luck. And you'd be poor while you did it." [beat] "You won't win one more fight and have it be over. We're offering you *over*." (PDF: exposure is possible, but only by rejecting the deal and cooperating with others; one more fight can't solve the system.)
- **Jin's questions** (optional, each once, any order; each answered honestly; the scene closes when the player chooses `Stand up`):
  - "Did you know what Lenny gave me?" → **Penner:** "I knew a result was arranged. I didn't ask how. I gave the last instruction because somebody has to. You'd be surprised how often that's all anyone at the top does." (He doesn't remember it as a moral event.)
  - "Is the treatment real?" → **Celeste:** "Call them. Your Ms. Lim already has, I expect." (She has; 9.7.)
  - "What happens to the people on Alder Row?" → **Penner:** "Relocation assistance: a hundred and ten thousand dollars, split among them. Some go to family. Some find something. A few will have a hard year." **Celeste:** "People move every day in this city, Mr. Seo. Usually nobody gives them anything."
  - "Have you been to Alder Row?" → **Celeste:** "No." [beat] "I've been to the model in the lobby. It's very good."
  - "What if I say no?" → **Celeste:** "Then you leave, and we close later, slower, through the courts. It costs us a year and four hundred thousand dollars. And you'll be exactly where you are. We don't threaten people, Mr. Seo. We've never needed to."
  - "Why me?" → **Celeste:** "Because you're the only person in Calder who could make this look like mercy."
- **Celeste** (flat palm on the table: settled): "Take tomorrow. Be in the first truck on Friday. Whatever you decide, you'll want to be there when it happens. Men like you always do." **Penner** writes on the back of a business card and slides it down the table: `HARLAN STREET — 5:30 AM — FIRST TRUCK.`
- **There is no dialogue option to accept or refuse in this room**, so the day can be a real day.
- When Jin stands to leave, the man at the window turns, only once, and adjusts a cuff. It is the man from the Locker Room B mirror: the same coat-shoulders, the same stillness. **Camel coat:** "I did tell you to take the money." He turns back to the window. Jin leaves by the elevator, which now opens for him; the camera holds the doors closing from the corridor, the coat on its stand at the edge of frame.

### 9.6 The street, near midnight (transition)
- The plaza; the rain has stopped. **The camera pulls out to 0.8 and Jin is framed alone under a streetlight** (the third time, after Pratt Alley and Market Street), the tower going up out of frame above him.
- The base for the night (loft or the Calder Arms). The evidence wall shows the offer pinned in the middle of everything. Sleep → Thursday morning.

### 9.7 Thursday: consideration (free roam; no timer; `ch9_visits`)
**Rules.** The world map opens. Buses run everywhere. Each visit moves the clock (morning → afternoon → evening → night → small hours). There is no failure and no timer; the clock moves only when Jin goes somewhere. The HUD shows one line that never changes or counts down: `Take the day. Harlan Street, Friday, 5:30 AM.` At any point the base offers `Sleep until four`, and after midnight every bus stop also offers `Harlan Street (ends the night)`. **Each visit is one short scene and one point of view. Nobody's view is the right one, and some of them want him to take it.** Nothing here changes which ending is available.

| Visit | Where / when / pose | What they say (key lines) | Reads |
|---|---|---|---|
| **Hana** | St. Agnes, the night corridor; the nurses' station; teal scrubs; Room 214's slot above the bed empty | "I called Boston at lunch as a referring therapist. The program's real. They have a file with your name on it. *Jin Seo.*" [beat] "I'm not going to tell you what to do. Everyone's been deciding for you. I'll tell you both doors are real. Somebody should." `hana ≥ 3`: "Joan says she can run it if you'll stand next to it. Your name, on the record. It'll take a year. It'll take all of us." `ch6_hana_repaid`: "You paid me back. Nobody pays me back." `ch8_ray_after = continued`: "I keep thinking about the phone call. You said 'I didn't stop.' I believed you." If `q1_crossword` was done, she hands him a postcard from Florida: `JIN SEO c/o ST. AGNES RM 214 — Seven letters, "what you do when you've had enough": RETIRES. Ha. Come see the ocean. — Earl` | `hana` |
| **Mara** | the workshop at night, at the vise | She keeps working while she talks. "Twenty-four families. That's one of my stairwells." [beat] "I won't tell you. Somebody already decided for you once." By `ch5_left_repair`: "You stayed with the boiler. I remember that kind of thing." / "You left me with the boiler once. I remember that kind of thing." [beat] "If you take it, and you come by someday, I'll still fix your heater. I won't like you. I'll fix it." If `mara ≥ 3`: "And if you go down there and stand on the wrong side of their door, call the workshop. I'd come. I'd bring people. Some of them still owe you a radiator." (→ `ch9_mara_will_come`) | `mara`, `ch5_left_repair` |
| **The Courts** (evening) | the yard | `ch7_truth_told_by = rook`: a vigil for Mi-ok and Min-ji, candles in jam jars on Keisha's garden beds (Nell's idea); Odette and Gus sit with Jin if he sits; Gus: "Walter told us you said [you don't know what you'd have said / he'd have had to ask / not this]. That's the most honest thing anybody's said about any of this." / `jin`: laundry on the lines, the residents divided; some nod, Darnell doesn't. Keisha, either way: "Are you going away?" | `ch7_truth_told_by`, `ch7_rook_answer` |
| **Teddy** | Iron Pulse back room, the cot, a can of soup | "Take it, kid." [beat] "Take it, and let me hate myself a little less. That's the truth. That's a selfish old man talking." [beat] "...Don't listen to me." | `teddy` |
| **Rook** | the union hall, alone, on the edge of the dark stage with his cap in his hands (`rook` told it) / his office, lights off; he speaks only if Jin knocks (`jin` told it) | By `ch7_rook_answer`: "You said I'd have had to ask. I've been thinking about who I'd have asked. Odette. She'd have said no. That's why I didn't." / "You said you don't know. I've been glad of that. I shouldn't be." / "You said 'not this.' I keep saying it to the window." [beat] "They asked me for a letter. They asked you for your face. Same price list." [beat] "I didn't sign. The roof money's done. Nell's finding a bank that lends to tenants. We'll be cold for a year." [beat] "I'm going to tell you not to do it, and you're going to think about who's saying it. That's fair." `ch7_hit_rook`: "My lip's healed. I'd have let you do it twice." / else: "You didn't hit me. I've been trying to decide all month whether that was mercy or contempt." | `ch7_rook_answer`, `ch7_hit_rook` |
| **Lenny** (only if `ch3_lenny_method = patient`) | Starlite's dark lot, on the hood of his Cutlass, smoking | "Take the money, kid. That's what I'd do. That's what I did." [beat] "Look at me." He laughs at the wrong time and doesn't stop for a while. Then: "If you don't — if it's the court thing, the room for a year — I'll say what I said in the loft. To a judge. Not if you're not. I'm not brave by myself." | `lenny` |
| **Deshawn** | the Cellar, leaving with his gym bag | "Mo's renting guys out for a job tomorrow. Fifty bucks to stand in a doorway on Southbank and look big. Slim took it. He needs the cot." [beat] "I didn't." [beat] "You're in it. Aren't you." If `deshawn ≥ 3`: "...If you're not, I know where Southbank is." | `deshawn` |
| **Mrs. Okafor** | 3A, in her robe, the kettle; if `ch6_okafor_print`, the cake photo framed on her TV | "Your mother would want you well. I know that like I know my own name." [beat] "She would also want to know whose house it was." She says nothing else and pours the tea. | — |
| **Petra and Rosie** (only if `ch2_saw_height_marks`) | 3B's doorway, evening | The doorframe: beside `JIN 8` and `MIN 4`, a new pencil line, `ROSIE 3`. **Petra:** "She asked whose names those were. I said a family who lived here before. She said, 'Then we live here after.'" | `ch2_saw_height_marks` |
| **Sunny's** | the window booth; Rita on the night shift | Rita refills the cup and doesn't ask. The 12:10 bus goes by outside, empty. | — |
| **Section 14** | the gate is locked after dusk; Jin sits on the low wall outside it | No one. The markers and the small stone, far off in the dark. Thoughts: "*Umma would take the money. She'd take it and feel terrible and send half of it to church.*" [beat] "*Min would want me well. Min would also photograph the gate.*" By `ch6_finished_button`: "*I finished the button, Umma.*" | — |
| **The river path** | the rail, small hours | Across the water and downstream, Alder Row as a short row of lit windows. Thought: "*Twenty-four windows. I don't know a single name.*" | — |

- Each visit appends its id to `ch9_visits` (flavour only; the endings never read it except for props).
- **If the player visits no one** and sits at the base: the camera eases out to 0.8 and time passes in dissolves while Jin sits; the radiator; the stack or the river in the window. That is a valid way to spend the day.
- **Sleep** (when the player chooses). Thought before sleep, by `jin_voice`: `restrained`: "*Friday.*" / `mixed`: "*Friday. Whatever I am by Friday.*" / `hard`: "*Friday. They think they know what I'll do. They've been reading the same file I have.*"

### 9.8 Friday, 4:50 AM: the door, and Harlan Street (chapter ending)
- An alarm clock at the base. The map is closed ("*Not now.*"). At the door: **`ch9_knuckles`**: `[Take the knuckles.]` / `[Leave them on the sill.]` (no effect in Ending One; in Ending Two, without them his punches stagger less and the fight is harder, and Teddy's epilogue line changes).
- Harlan Street, 5:10 AM. The depot's floodlights are on again behind the gate that said `CLOSED FOR INVENTORY`. Three trucks idle in the yard with their headlights on, exhaust white in the cold; magnetic signs on their doors: `WEST END RELOCATION SERVICES`. A **gray panel van** in front of them, the Ch2 van's twin. Jin stands at the gate; the camera holds him small against the headlights at 0.85. If the player presses nothing, he leans on the fence, hands in his pockets, one knee bent: the game's key image, now at 5:28 in the morning.
- 5:30. **Vince Carrow** at the van's wheel. The side door slides open: **Dutch** on the bench in his peacoat (a bandaged hand if `ch4_dutch_after = kept_going`), **Benny** (if `ch2_collector_after = let_go` he nods; if `hit_again` he looks away), **Slim** in a hoodie with his gym bag on his knees ("I needed the money, man. Two hundred for a morning."), and five men Jin doesn't know.
- **Carrow:** "Morning, champ. Get in."
- The player presses E on the van door. (Getting in is canon: the PDF has Jin arrive at the neighbourhood with the enforcers. The decision is at the gate, and Jin's thought says so: "*I'll decide when I see it. They'll have to show me.*")
- The door slides shut. Black. **No completion screen here**: Ch9 and Ch10 share one, shown after the ending. A small card only: `CHAPTER 9 — THE OFFER` / "Jin is offered the power once used against him."

## Encounters
All `A.fight`, no tips (mastery), guards with batons (a long overhead arc that can't be slipped, only backdashed or dashed through; a poke that can be slipped). Checkpoint at each area; a loss returns to the start of that fight ("*Again. Same floor.*").
- **E9.1 The lobby:** 3 `guard`. Slick marble: dash distance +10% (the guards slide too). The security desk works as a wall to avoid being surrounded.
- **E9.2 The stair:** landing 8: 2 `guard`; landing 15: 2 `guard` in emergency red; the barricade gap above 15 (air dash). Narrow landings: an uppercut sends a guard down a flight and out of the fight; winded management on the climb.
- **E9.3 Floor 30 reception:** **Mr. Garvey** (`director`: while his radio is live, nearby guards attack 30% faster) + 2 shield guards who stay between Jin and Garvey + 2 `guard`. Everything at once: get round the shield (dash through in the dodge window, or launch a guard into another) and hit the director. Stopped by Celeste (9.4); never fought to the end.
- **No combat after the boardroom.** Nothing in the consideration day is hostile.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Owen | `ch9_owen` = `persuaded` / `threatened` (PDF Q2) | `ev_relocation_model` and the eight quiet flights / the keycard and the elevator; `threat_count` +1 | Penner's line about Owen's desk. Ending Two: `persuaded` → "Owen Tully testified for two days. His daughter drew the courthouse." / `threatened` → "Owen Tully was let go on April 17. He did not testify." Ending One: the administrative report is "prepared by O. Tully" either way. |
| Sit or stand | presentation only | the boardroom framing | — |
| The day | `ch9_visits` (set) | each visit's scene | Completion screen lists who Jin saw; small props in the endings. |
| Mara's offer | `ch9_mara_will_come` (bool; heard with `mara ≥ 3`) | — | Ending Two: Mara and Courts residents arrive at Alder Row during the fight. |
| The knuckles | `ch9_knuckles` = `took` / `left` | — | Ending Two fight tuning; Teddy's epilogue line. |

## Chapter ending and state handed on
- Ending beat: the van door shutting in the dark (9.8). No completion screen until after Chapter 10.
- **Handed on:** `ev_offer_folder` ★ (all seven items; the `JIN SEO` plate stays in Jin's pocket next to the `AHN, DANIEL` card), `ev_relocation_model` (if persuaded), Penner's card; `ch9_visits`, `ch9_mara_will_come`, `ch9_knuckles`; every flag and relationship. `support_at_alder` is computed at the start of Ch10 (see Ch10) and nothing is shown.



# Chapter 10 — Somebody Else's Home

**Card:** over the bell state (`rung`: silence; `ringing`: the faint ring, a little louder than in Ch9). `Somebody Else's Home` · `Alder Row, Southbank · Friday, April 18, 1997`.

## Date, mood, palette, weather
- Friday, April 18, 1997: 5:35 AM the ride → 5:55 AM Alder Row → (no clock on screen; nothing happens on its own) → the gate → Ending One runs to 9:00 AM and then years; Ending Two runs to 9:00 AM and then months. The closing is set for 10:00 at Ashgrove Tower, 30th floor. Carrow says it plainly: "We go when the ambassador's ready. Mr. Penner's orders." The sun rises slowly behind the row whatever the player does; nothing else moves until the gate.
- Mood: an ordinary morning in a stranger's street, with men unloading bolt cutters at one end of it. Then either a quiet, purposeful wrongness, or the last fight in the game.
- Palette: Southbank is older and lower than anywhere else in Calder: two-storey red brick rowhouses with white-painted stoops, window boxes, a green iron gate into the cooperative's inner garden, a corner shop with a striped awning, **one cherry tree in early bloom** (the only blossom in the game). Blue dawn and a light rain that stops at 6:40; then low gold sun on the brick. The vans and the trucks are the only gray things on the street. Across the river, the whole city, Ashgrove Tower catching the sun first.
- Weather: light rain to 6:40; then clear, cool, still; breath visible until seven.

## Gameplay identity
**Meet the people it would cost, then choose where the cost falls.** A short, slow walk down a street of strangers doing ordinary things under pressure (closing a shop, dragging a mattress to safety, arguing on a step), who can be spoken to or not; then the gate. After it, one of two endings: an uncomfortable participation and then the rewards over time; or the last fight in the game beside whoever the campaign left him, and then an ordinary, poorer life.
- Pre-choice: exploration 45% · dialogue 50% · activity 5% (the mattress). About 8 min at a natural pace; as long as the player likes.
- Ending One: participation ~6 min (no real combat; one restraint, one held door) + years ~6 min. Ending Two: combat ~7 min (three waves) + months ~7 min with one playable walk.
- Target length: 20–25 min either way.
- **The PDF's rule, built in:** the residents stay strangers (no friend, relative or secret connection); the player knows both consequences before choosing; both endings are always available; earlier actions change who trusts Jin and what support exists, never which ending can be chosen.

## Locations

### `truck_cab` — the ride (vignette; side view, 40 s)
The gray van's cab moving right along the river road; parallax streetlights sweep amber bars across the cab every 0.7 s, exactly the timing and colour of Teddy's wagon in Ch0. Rain on the windshield. The streetlights go off one by one as dawn comes up, partway through (unlike Ch0).

### `alder_row` — Alder Row, Southbank (2400 × 420, exterior; stoops as one-way platforms at y 330; two fire escapes at y 240)
Left → right:
- **0–300 Southbank Avenue corner:** the gray van and two box trucks (`WEST END RELOCATION SERVICES`), the crew unloading; a payphone.
- **300–600 `PHAN SHOE REPAIR · KEYS CUT`:** a narrow shop with a hand-painted boot on the sign; Mr. Phan pulling his grate down, then halfway up, then down; a thermos and a sleeve of paper cups on a card table in front.
- **600–1200 houses 1–11:** stoops, window boxes, a kid's bike, a `SUPPORT ALDER ROW CO-OP` sign in a window; moving boxes on stoops labelled in marker (`KITCHEN`, `BABY`, `MAMA'S DISHES — CAREFUL`); a rented truck, back open, half full of other people's furniture (they rented it themselves, to get their things out before anyone else carries them); the cherry tree with a bench under it; house 3 with **Mr. Odell's green-and-white folding chair** on the stoop, a bicycle chain hanging off the railing, unlocked; house 7 (Rosa's).
- **1200–1300 the gate:** green iron between houses 12 and 13, **chained from inside** with a new chain and a padlock still wearing its price sticker (`$6.99 — HANDY HARDWARE`). Over it, the co-op's hand-painted sign: `ALDER ROW COOPERATIVE · EST. 1979 · 24 HOMES · ONE ROOF AT A TIME`. Flyers taped to every lamppost: `MEETING 6 AM — DO NOT SIGN ANYTHING`.
- **1300–2000 houses 13–24;** house 19 with a `SOLD` sticker in the window (somebody already left).
- **2000–2400 the far end:** a black sedan parked under a lamppost, engine off; behind the windshield, a man in a camel coat reading a newspaper. The **Channel 6 van** with its mast down; the cameraman Ed and the reporter Brenda.
- Background: the river; across it the city; Ashgrove Tower.
- Light: dawn blue to gold. Sound: rain stopping, birds, a baby crying in house 7, June's bike bell, a radio in the garden (a morning sports call-in show), the trucks' diesels idling, crew voices kept low.
- Exits: none (the map is closed for this chapter: "*Not now.*"). The gate → `alder_garden`.

### `alder_garden` — The cooperative's garden (1200 × 420)
The gate → a brick path → raised beds with name stakes (`ODELL — BEANS — 51 YRS`, `JUNE — SUNFLOWERS (DON'T STEP)`, `HALE`) → the co-op office door (house 12's back door, a frosted pane lettered `ALDER ROW COOPERATIVE — OFFICE — TUES & THURS 6–8 PM`) → laundry lines → the back doors of houses 9–16 → a mural on the back wall painted by kids: twenty-four houses with twenty-four different coloured doors. (The player has seen this kind of place before, with different names: compare Keisha's tomatoes at the Courts.)

### Ending locations (vignettes; short scenes, most without control)
- `beacon_rehab` — Beacon Street Institute rehab gym, Boston (900 × 360): tall windows, new equipment, parallel bars in the Ch1 framing, three therapists. (Ending One, playable 8 s on the bars.)
- `riverside_1104` — Riverside Lofts, Unit 1104 (900 × 360): a window wall over the river where the Civic stood, the brass `JIN SEO` plate on the door, a bathroom door with a lock, a hall closet with a taped box marked `SEO`.
- `ashgrove_center` — the new arena on the riverfront (reuses `civic_ring_1994`'s geometry and camera; every seat full; gold-and-white instead of blue-and-red).
- Reused: `ashgrove_lobby` (the press conference), `stagnes_room214` (the new name card), `kessler_ave_1996` in spring 2000 (the poster wall), `sunnys`, `courts_community` (the gym), `iron_pulse`, `alder_row` in autumn; a county courthouse's steps (a single 1200 px exterior: granite steps, brass doors, a news van).

## NPCs present
Residents are labelled by description until Jin speaks to them; then their name appears in their bubble and is stored in `ch10_names_learned`. They don't need backstories (PDF); each does one human thing.

| id | Label → name | Where / idle | Key lines | Barks |
|---|---|---|---|---|
| `phan` | "Shopkeeper" → **Mr. Phan** | his corner shop, pulling the grate; pouring coffee into paper cups for anyone who walks past, **the crew included** | "Twenty-two years. Heels, soles, keys. Nobody's buying keys this morning." / (handing Jin a cup without asking who he is) "Everybody's cold. Coffee doesn't pick sides." | "Coffee. Free. Today only." |
| `rosa` | "Woman with a mattress" → **Rosa Medina** | house 7, dragging a crib mattress off her stoop toward the rented truck; the baby inside crying | "Help me with this or get out of the way." / (after) "Thanks. ...You're with them, though. I saw you get out of the van." | "Careful, that's the baby's." |
| `gloria` | "Woman with a clipboard" → **Gloria Hale**, co-op president (70s) | inside the gate on the garden path, reading glasses on her head, arguing through the bars | "If we lock the gate, they call it resisting. If we open it, they call it consent. Somebody tell me the third thing." | "Nobody signs anything!" |
| `terrence` | "Young man with a broom handle" → **Terrence Hale**, 19, Gloria's grandson | inside the gate, a broom handle held like a bat | "You're the boxer. From the TV. You're with them?" | "Let 'em try." |
| `odell` | "Old man in a chair" → **Henry Odell**, 84 | in his folding chair on house 3's stoop, overcoat over pyjamas, a radio on his knee | "Fifty-one years. They can carry me with the chair." / "I was here before the co-op. I'll be here after the vans. One of those is true." | (hums along to the radio) |
| `june` | "Girl on a bike" → **June**, 10 | circling on a bike, delivering flyers very seriously to every stoop and every crew member | "You can have one. You're not supposed to sign anything either." | "Meeting! Six o'clock! It's six o'clock!" |
| `carrow` | Vince Carrow, crew boss | by the first truck, clipboard against his chest | see 10.2 | "Cutters in the first truck. No, the *first* truck." |
| `dutch` | Dutch Brannigan | on the van's step in his peacoat (bandaged right hand if `ch4_dutch_after = kept_going`) | `walked_away`: "I collect. I don't do this." / `kept_going`: "You did my hand. Moira's sister cried. She doesn't cry." | — |
| `benny` | Benny Szabo | unloading boxes | `let_go`: "Morning." (embarrassed to be here) / `hit_again`: says nothing; his jaw clicks when he chews gum | — |
| `slim` | Slim Whitlock, rented out by Mo | in the van's open door in a borrowed black jacket too short in the sleeves, gym bag on his knees | "I needed the money, man. Two hundred for a morning. I didn't ask what it was." | "...Hey, Ghost." (if `slim ≥ 2`) |
| `camel_coat` | the man in the camel coat | in the black sedan at the far end; never gets out | — | — |
| `brenda`, `ed` | Channel 6 reporter and cameraman | the van | **Brenda:** "Mr. Seo? Can we get you walking up to the gate? Just natural. Like you're helping." | — |

## Interactables
| id | Label | Examine (actual text) | Unlocks |
|---|---|---|---|
| `i10_cup` | Paper cup (from Mr. Phan) | "*A paper cup. Coffee. A stranger handed it to me because I looked cold.*" `[Drink it.]` / `[Hold it.]` (no flag). If he drinks: "*It's coffee. It's just coffee.*" (The game's motif closes here: in Ch0 a drink was handed to Jin to take his choice away; this one is given by a stranger who wants nothing.) | — |
| `i10_flyer` | June's flyer | "*'Meeting 6 AM — Do not sign anything.' In a ten-year-old's handwriting, photocopied.*" | — |
| `i10_coop_sign` | Co-op sign | "*'One roof at a time.' Since 1979.*" | — |
| `i10_boxes` | Moving boxes | "*'Mama's dishes — careful.'*" (Thought: "*Umma's cornflower dish is on a chair in the loft.*") | — |
| `i10_truck` | Rented truck | "*Half full of somebody's living room. They rented it themselves.*" | — |
| `i10_padlock` | Padlock (gate) | "*Six ninety-nine at Handy Hardware. Bought yesterday.*" | — |
| `i10_chair` | Odell's chair | "*A webbed folding chair. A bike chain on the railing, unlocked. He took it off so they couldn't say he chained himself.*" | — |
| `i10_house19` | `SOLD` sticker (house 19; a sit spot on its stoop) | "*Somebody already left. Took the money. I don't blame them.*" | — |
| `i10_sedan` | Black sedan | "*A man in a camel coat behind the windshield. He's reading a newspaper.*" | — |
| `i10_name_stakes` | Name stakes (through the gate) | "*'June — sunflowers (don't step).'*" | — |

## Quests
| id | Kind | HUD objective | Completion | Consequence |
|---|---|---|---|---|
| `q10_main` | main | `Alder Row.` → `The gate.` (shown after Carrow's briefing; nothing forces the player toward it) → [accept] `Walk in first.` → `Stand where they tell you.` / [refuse] `Keep them off the gate.` → (epilogue; HUD hidden) | The gate choice; the ending's sequence | `ch10_choice` |
| `q10_rosa` | side (pre-choice) | `Rosa needs a hand with the mattress.` | Carry activity across the street (no punching or dashing while carrying; "*Hands full.*") | Rosa's name; her line |

## Scripted scenes

### 10.1 The ride (vignette; full letterbox; 40 s; the Ch0 drive, rhymed)
- Jin in the middle of the bench seat; Carrow driving; Dutch at the passenger window.
- **A crewman in the back:** "Big morning, champ. Big morning." (Lenny's line, in a stranger's mouth.)
- **Carrow:** "You don't talk to the residents. You don't talk to the TV. You walk to the gate, you hand the lady the papers, you stand there while we work." [beat] "That's the whole job." (Teddy's "You don't talk to the press" rhythm.)
- **Crewman:** "Who's he gonna talk to? He doesn't talk." He laughs a little too long. Dutch doesn't.
- Jin says nothing for the whole ride. The streetlights go off one by one.

### 10.2 Arrival and Carrow's briefing (5:55 AM; the consequences, stated before the choice)
- The van door slides open. The camera starts inside the van, looking out (1.3), then lets Jin step down into a wide (0.85) of the whole row at dawn: the trucks, the shop, the stoops, the cherry tree, the gate, the sedan. No music. A baby crying. June ringing her bike bell. Thought: "*Twenty-four doors.*"
- **Carrow**, by the first truck, explains it like moving furniture: "Here's the morning. You walk up first. They've chained the gate; they always chain the gate. You cut it. You hand Mrs. Hale the agreement. We walk in behind you. Every unit gets a form. They sign, they get forty-five hundred and a ride. Furniture to the curb. Channel 6 wants you at the gate. Nine o'clock the street's empty. Ten o'clock Mr. Penner signs. Then you go home to Riverside."
- **Jin:** "And if they don't sign?"
- **Carrow:** "Then it takes longer and it's louder, and you're still in front." [beat] "We go when you're ready. Mr. Penner's orders. Take a walk. Get a coffee. The shoe man's giving it away."
- While he talks, the Journal's last claim, *What they want*, writes itself in plain words (a badge, not a pop-up): "**Accept:** cut the chain, walk in first, help them clear Alder Row this morning. Treatment, the apartment, the income, my name back, the comeback, my face on a poster again. **Refuse:** stop this crew. No treatment. No comeback. The envelopes go to court with the people holding them, and it takes years."
- Objective: `The gate.` The player is free. **There is no timer.** If the player waits, the crew smokes, the rain stops at 6:40, the light turns gold, and every 40 s Dutch or Carrow says one more thing ("Take your time." / "Coffee's getting cold." / "They're not going to get any happier, champ."). Nothing advances by itself.

### 10.3 The street (free; thin letterbox; walk speed; attacking shows a crossed-fist icon: "*Not yet.*")
Everything is optional; the player can walk straight to the gate. Nothing is withheld if they don't talk.
- **Mr. Phan** pours coffee for residents and crew alike and hands Jin a cup (`i10_cup`). "Everybody's cold. Coffee doesn't pick sides." If asked: "Twenty-two years. Heels, soles, keys. My wife did the books. Now I do the books badly."
- **Rosa Medina** (`q10_rosa`): Jin can take one end of the crib mattress across the street to the rented truck. "Thanks." [beat] "...You're with them, though. I saw you get out of the van." No choice; it's just true.
- **Gloria and Terrence**, through the gate bars, arguing. **Gloria:** "They want us to swing first, Terrence. Then it's a riot on Channel 6 and nobody remembers why." **Terrence:** "So we just watch?" **Rosa**, passing with a box: "I've got a baby. I'm not standing in front of anything." (PDF: residents arguing about whether resistance will make things worse.) If Jin comes close, **Terrence:** "You're the boxer. From the TV. You're with them?" Options (both honest, neither binding): "I came in their van." / say nothing.
- **Henry Odell** on his stoop: "Fifty-one years. They can carry me with the chair." [beat] "I was here before the co-op. I'll be here after the vans. One of those is true." (If the player has `ev_relocation_model`: Thought: "*Unit three. Tenure fifty-one years. Age eighty-four.*")
- **June** gives Jin a flyer: "You can have one. You're not supposed to sign anything either."
- **The crew:** Slim in the van door ("I didn't ask what it was."); Benny unloading; Dutch on the step (his line by flag).
- **The sedan:** examine only. The man in the camel coat doesn't look up from his newspaper.
- **Channel 6:** **Brenda:** "Mr. Seo? Can we get you walking up to the gate? Just natural. Like you're helping." Ed lifts the camera; its red light comes on and stays on until the end of the chapter, in either ending.
- **House 19's stoop** is a sit spot. Thought: "*Somebody already left. Took the money. I don't blame them.*"
- The residents don't know who Jin is beyond the TV. Nobody tells him a life story.

### 10.4 The gate (the choice; full letterbox; no timer)
- When Jin walks up to the gate, Carrow comes up the street with the bolt cutters (red handles) and holds them out handle-first. The camera settles into a fixed two-sided frame at 1.0: Carrow and the crew on the left; the residents behind the bars on the right (Gloria in front with her clipboard, Terrence with the broom handle, Rosa at the back with the baby, Mr. Odell's chair visible through the bars on his stoop, June on her bike); Jin in the middle with the chain at chest height between him and them. The sun comes up behind the row, slowly; it's the only thing that moves. Ed's red light.
- Jin takes the cutters (holding them is not the choice). Thought (fixed): "*Lindell's chain kept them in. This one keeps them out.*"
- **Voices** (memory filter on the audio only, no images; one line per beat; deliberately both sides):
  - The camel coat: "That isn't a bribe, son. That's arithmetic."
  - Jin, 1994, by `ch0_refusal_line`: "*I'm not for sale.*" / "*My family's in Section 14.*" / "*Get out of my locker room.*"
  - Rook: "I told myself once. A man can live a long time on once."
  - Hana: "Both doors are real."
  - Celeste: "We're offering you *over*."
  - Teddy: "Take it, kid."
- **Jin's own thoughts**, one per press, built only from what the player actually did (nothing invented; nothing the player didn't do is said):
  1. Taking (`take_count`): `0`: "*I never took anything that wasn't mine. It was always small things. It was always easy to leave them.*" / `≥ 1`: "*I took [the bingo jar / their payroll / the Vasquez family's apartment]. Small. It was always small.*" (only the ones that happened, in order)
  2. Hurting (`jin_voice`): `restrained`: "*I never hit anyone who'd already given me what I came for.*" / `mixed`: "*I hit some people who'd already given me what I wanted.*" / `hard`: "*I hurt people who were down. I had reasons. Rook had reasons.*"
  3. The corner (`ch6_saturday`): `corner` + `ch6_towel = thrown`: "*I threw the towel for Deshawn. Nobody threw it for me.*" / `corner` + `sent_out`: "*I sent Deshawn out. He said he couldn't see. I knew.*" / `pike`: "*I left Deshawn without a corner for a shredder. It was the right night. It still cost him.*"
  4. `ch7_rook_answer`: "*Rook asked what I'd have said. [You'd have had to ask me. / I don't know. / Not this.]*"
  5. `ch10_names_learned`: none: "*I don't know a single name.*" / some: "*[Mr. Phan. Rosa. June...]*" (the names learned, in the order learned)
  6. `ch0_purse_dream`: "*Umma's rent.*" / "*Umma's Saturdays.*" / "*Min's door.*"
  7. Fixed, last: **"*Nobody asked me. Nobody's asking them.*"**
- Silence, 2 s.
- **Choice `ch10_choice`** (both always shown, both always enabled; no timer; the consequences printed under each in plain words; the player can leave the menu up as long as they want, and the residents and crew keep breathing):
  - **`[Cut the chain. Take the deal.]`** — *You accept. You cut the chain and help the crew clear Alder Row this morning. You get the treatment, the home, the income, your name and the comeback, and the people on this street lose their homes.* → `accept` → Ending One.
  - **`[Drop the cutters. Stand with Alder Row.]`** — *You refuse. You stop the crew here, with your hands. You lose the treatment, the home and the arranged comeback. The people on this street keep their homes this morning.* → `refuse` → Ending Two.
- The game autosaves to its own slot before the menu (`Before the gate`), so a player who wants to see the other ending can, without replaying the campaign. The game never says which is right.

## Ending One — The Champion (`ch10_choice = accept`)
**Presentation rules.** From the cut until the years: **no combat HUD, no music, no hit-stop flash, no sparks, no camera shake**; no reward pop-ups of any kind; no money counter. The objective line says only what to do. The player is never allowed to fail out of this sequence, and it never moves forward on its own: if the player stops, everyone waits, and Carrow says "Champ." every 20 s. (PDF: uncomfortable and purposeful; never a celebratory loot wave.)

### E1.1 Opening access
- The player **holds E** to cut (2 s; the jaws closing visibly). The chain drops onto the path. Gloria steps back from the gate without being touched. Jin holds out the agreement (`AGREEMENT OF SALE AND RELOCATION — Alder Row Cooperative to Ashgrove Capital, L.P.`, yellow tabs `SIGN HERE`, a cover letter introducing "our community liaison, Mr. Jin Seo"). Gloria looks at it, at the crew, at the red light, at Jin. [beat 2.0] **Gloria:** "You're the boxer." [beat] "They said they'd send someone we'd trust." She takes it. The crew walks in behind Jin. HUD: `Walk in first.`

### E1.2 Overcoming resistance
- Terrence comes at the crew with the broom handle. The game hands Jin one verb for this: ATTACK becomes **`Restrain`** (the prompt changes on screen; punches are disabled here and the HUD says so: `Not with your fists. Stop him.`). Terrence's swings are slow and clumsy; Jin slips one and ties him up (the same clinch Ray used on Jin in Ch8) and holds him against the garden wall while the crew walks past. No hit-stop, no sparks, no music, no bars. **Gloria:** "Terrence. Terrence, stop. Let it go." Terrence goes limp. Into Jin's shoulder: "You were on TV." Jin lets go.
- The crew reacts according to what the player built:
  - Slim (`slim ≥ 2`): drops the box he's carrying. "You fought me straight once. I'm not carrying this." He walks out of the gate and down the street with his gym bag and doesn't come back. (`< 2`: he carries boxes with his hood up and looks at nobody.)
  - Dutch (`walked_away`): sits on the van step for the whole clearance, smoking. "I collect. I don't do this." **Carrow:** "Fine. More for the rest of us." (`kept_going`: Dutch works, efficiently.)
  - Benny (`let_go`): carries Mr. Odell's bean pots to the curb very carefully, as if that helps.

### E1.3 Allowing the residents to be forced out
- House 3. Two crewmen lift Mr. Odell's chair with him in it, one at each side, as he said they would. **Carrow:** "Champ. Get the door." Jin holds the front door open: **`Hold the door`** is a **held input**, about 10 s, while the two men carry the chair down the steps past him. **The camera stays at 1.2 on Jin's hand on the door**; Mr. Odell's slippers pass through the bottom of the frame. If the player lets go, the door swings shut against the chair, the men stop, and **Carrow:** "Champ." The player has to hold it all the way. On the sidewalk, in his chair, not looking at Jin: "Fifty-one years."
- **The wide take** (no control; 20 s, no cut): **the camera cuts to the sedan's point of view**, through its windshield at the far end of the row, at 0.8, the whole street small, the camel coat's newspaper at the bottom of the frame. In that one take: Rosa's crib mattress goes on the curb after all and she sits on it with the baby; Mr. Phan pulls his grate down all the way and padlocks it, and the coffee on the card table goes cold; June's flyers in the gutter, wet; furniture coming out of the gate; Jin standing at the gate with nothing in his hands. **Brenda** (audio over the take): "...a smooth and peaceful relocation this morning in Southbank, assisted by a familiar face. The Kessler Kid, Calder's own Jin Seo, who knows better than anyone what it means to start over."
- If `ch9_mara_will_come`: at the corner, Mara's red '81 Ford pickup stops, idles, and turns around. No dialogue. (She read her envelope; she came for Alder Row; she saw where he was standing.)
- The sedan starts its engine and pulls away.
- 9:00. Brenda's microphone. Jin stands in front of the open gate. The player advances the line Carrow gave him: "**This neighbourhood deserves a future.**" (He accepted; there is no option to say something else, and the game doesn't pretend there is.)

### E1.4 The rewards, over time (time cards; each a 10–20 s scene; one short playable beat)
1. **`June 1997 · Boston.`** The Beacon Street Institute: a bright rehab gym with tall windows. **Parallel bars**, the Ch1 framing exactly. The player walks Jin along the bars for 8 s and the body answers at once; his idle lean to the right is gone. A therapist counts out loud. It isn't Hana.
2. **`September 1997 · Riverside Lofts, Unit 1104`**, over the old Civic lot. On the door, the brass plate `JIN SEO`. By `ch0_purse_dream`: `new_apartment`: he closes the bathroom door and **turns the lock: a solid, heavy click**, and stands with his hand on it for 3 s ("*She wanted to slam it.*") / `rent`: a folder of receipts paid a year ahead for an apartment nobody else lives in / `umma_saturdays`: a Saturday morning with nothing to do; he turns the radio up, then off. In the hall closet, a cardboard box marked `SEO` in his own handwriting, taped shut; Min's coat is in it (mended or not, the camera knows; he never opens it). The `AHN, DANIEL` card is in a kitchen drawer with the takeout menus. The cornflower dish is on a high shelf.
3. **`January 1998 · Ashgrove Tower lobby.`** A press conference beside the Alder Commons model. Penner at his elbow, smiling; Celeste's hand on his arm. The Calder Ledger, next shot: **`SEO: "I OVERCAME IT. ANYONE CAN."`** (The organisation presents him as a man who overcame hardship through determination.)
4. **`March 1998 · St. Agnes, Room 214.`** Hana slides a new card into the slot above the bed by the window: **`ODELL, HENRY`**. She looks at it for a moment and goes on with her rounds. (She opened her envelope once, read it, and put it back. Nothing came of it without him.)
5. **`1998.`** Three posters on a wall, three wins. His trunks' waistband carries a small Ashgrove logo where Umma's stitches were.
6. **`November 1999 · The Ashgrove Center, riverfront.`** (Cutscene; no control; the PDF's manipulated championship.) Sold out. The same tunnel composition as Ch0: the camera pulls out to 0.8 at the mouth; every seat is full. Round 3: Jin's opponent, a young fighter in green trunks, starts to move wrong: his legs slow, his guard drifts (the Ch0 effect, seen from outside). Between rounds, across the ring, the young man says something to his corner and shakes his head; his corner pushes him back out. A cornerman on Jin's side hands Jin a bottle; **Jin drinks without looking at it.** The referee wipes the young man's gloves on his shirt and glances at the clock. Jin's guard is perfect. He pauses half a second, as Ray did, and looks at nobody. Then he finishes it. The young man falls **in his own corner**. **The bell**, by `bell_state`: `rung`: one clear strike that stops, and the roar fills the space / `ringing`: the high ring that has sat under every card since Ch8 swells under the roar and doesn't stop. **The announcer:** "...AND THE NEW CONTINENTAL MIDDLEWEIGHT CHAMPION OF THE WORLD... CALDER'S OWN... JIN 'THE KESSLER KID' SEO!" His own name, in an arena full of people. At the back, at the top of an aisle, a silhouette in a camel coat turns and leaves. Nobody remarks on it.
7. **The administrative report.** Cut from the roar to silence. The document viewer, typewriter sound: `ASHGROVE CAPITAL — ALDER ROW SITE DELIVERY — FINAL REPORT · prepared by O. Tully · Delivery date: April 18, 1997 · Households: 24 · Residents: 61 · Voluntary surrenders: 24 · Relocation assistance disbursed: $110,000 · Incidents: 1 (minor; resolved on site) · Status: CLOSED. · Case notes:` then one line per household. **Residents whose names Jin learned appear by name; the rest appear only as units:**
   - `PHAN, V. — commercial tenant — business closed; no relocation requested.` / `UNIT 1 (COMMERCIAL) — closed.`
   - `MEDINA, R. — Unit 7 — 1 adult, 2 minors — doubled up with family, Millport.` / `UNIT 7 — relocated.`
   - `HALE, G. & T. — Unit 12 — address unknown.` / `UNIT 12 — relocated.`
   - `ODELL, H. — Unit 3 — age 84 — placed: St. Agnes Long-Term Care, Rehabilitation Wing, Rm 214.` / `UNIT 3 — relocated (care facility).`
   - `Unit 17 — 1 adult, 1 minor (incl. JUNE, 10) — Route 9 Motor Inn (temporary, 11 months).` / `UNIT 17 — relocated (temporary).`
   - then eighteen lines that read only `UNIT — relocated.`
   (PDF: their losses are summarised in an administrative report.)
8. **Last image. `Spring 2000 · Kessler Avenue.`** The poster wall from Ch0 and Ch2, with a fresh poster at eye level pasted over everything: **`THE RETURN OF THE KESSLER KID — JIN SEO — CHAMPION`.** The camera pushes to **1.45** on his face in the poster, the exact framing of Min's clipping in Ch0: the photo is airbrushed smooth, and **the scar on the right cheek is gone.** Hold 3 s. No voice. (The player remembers Min: "That is a man who sells aluminium siding.") Last sound by `bell_state`: `rung`: the street only, a bus kneeling, a dog two streets over / `ringing`: the faint high ring, under the street, until black.
- Card: **`THE CHAMPION`**. Then the shared completion screen.
- Ending One's sentence on the completion screen: "You took the bargain. Jin Seo received treatment, a home, an income, his name and a championship. Alder Row's twenty-four households were relocated on April 18, 1997." (His success is genuine in material terms, and dependent on the institution that destroyed his first future.)

## Ending Two — His Own Name (`ch10_choice = refuse`)

### E2.1 The refusal
- Jin opens his hand. The bolt cutters fall on the path with a heavy clang (1 s of nothing else). He turns his back to the gate and puts his guard up. Behind the bars, **Terrence:** "Wait— you're—" **Gloria**, pulling him back: "Terrence. Get back."
- **Jin:** "Go home." [beat] "All of you. Go home."
- **Carrow** (stepping back, lifting his clipboard): "This doesn't stop anything, champ. It stops today." (He's right: the PDF says the fight creates an opportunity for accountability and does not replace it.)
- **Dutch**, by `ch4_dutch_after`:
  - `walked_away`: He looks at Jin a long time. Then at the sedan at the far end. Then back. "There's never a back door, son." [beat] "Turns out you're one." He drops his cigarette and steps on it. "I'm going for coffee. Anybody wants to keep his teeth, come get coffee." He walks off down Southbank Avenue, and **three men go with him**. (He steps aside.)
  - `kept_going`: Through his teeth: "I been waiting all winter for this." He takes off his peacoat, folds it, and lays it on the hood of the first truck. (He'll lead the last wave.)
- HUD: `Keep them off the gate.` Letterbox off. **Music enters on the first landed punch**, the first full score in the game: the Ch0 fight percussion with the kitchen's piano over it.

### E2.2 The fight for the gate (`A.fight` on `alder_row`, arena x 700–1800, the gate behind Jin; checkpoints before each wave; a loss retries the wave: "*Again. You know how to do this.*")
- In every wave, one crewman carries a second pair of bolt cutters and goes for the gate; he is marked like a director (hit him first). If he reaches it, Gloria and Terrence hold the chain from the inside and shove him back while Jin gets there: **there is no fail state for the gate.** Residents are never hostile and can't be hit (punches pass through them).
- **Allies and defectors** (`support_at_alder`, computed from relationships and flags; never from `jin_voice`; they come *for Alder Row*, because each of them read the agreement in their envelope; none of them was promised anything by Jin; none changes the outcome, only how alone Jin is in it):
  - **Slim** (`slim ≥ 2`): at the first punch he drops his hands, walks up house 3's steps and stands in front of Mr. Odell's chair with his arms folded. "Not him." (He protects; he doesn't fight.) (`< 2`: he fights as a reluctant `boxer` in wave 1 and leaves after his first knockdown: "I'm done. I'm done, man.")
  - **Benny** (`let_go`): "You let me walk. I'm walking." He walks to the river rail and stands there. (`hit_again`: he fights in wave 1 as a `collector`.)
  - **Mara** (`ch9_mara_will_come`): between waves 1 and 2, her red '81 Ford pickup comes round the corner and **stops broadside in front of the trucks**; wave 3 has two fewer men. She leans out of the cab with a wrench: "Twenty-four families. One stairwell. I said I'd hate you a bit either way. I lied."
  - **Teddy** (`teddy ≥ 2`): between waves, on the curb with a towel and **a sealed bottle**, which he cracks in front of Jin. Jin sits (5 s; condition restored). **Teddy:** "Watch the big one's shoulders." Then, asked first this time: "You all right? ...Hands up. Chin down. Go."
  - **Deshawn** (`deshawn ≥ 3`): arrives at the start of wave 3, running down Southbank Avenue in his hoodie: "You're in it. I figured." Fights beside Jin (an AI ally `boxer`; draws one attacker).
  - **Hana** (`hana ≥ 3`): arrives after the fight with Joan Albright and a Ledger photographer (E2.3). If `ch4_roz = let_go`, Joan says once: "A dispatcher named Roz called the paper at four this morning."
  - **Channel 6, always:** when the fighting starts, Brenda tries to stop Ed filming. **Ed:** "I'm a news cameraman, Brenda. This is news." He keeps rolling. Ashgrove's own booked camera becomes the record.
  - With no allies at all, the fight is tuned to be winnable alone on Normal by a player who uses the whole toolkit; the residents hold the gate.
- **Wave 1:** 4 crew (`thug` ×2, `collector` ×2) + Benny (if `hit_again`) + Slim (if `< 2`).
- **Wave 2:** 4 crew (`collector` ×2, `thug` ×2) + **Carrow** as a `director` (he never throws a punch; his men attack faster while he talks into a radio; one hit sends him back behind the trucks for good).
- **Wave 3:** `kept_going` → **Dutch** (`boss collector`, bandaged hand, his Ch4 herd-and-pin aimed at the gate: he walks Jin back toward it, because a man with people behind a gate can't step aside: "I don't chase. I wait for the wall. You brought your own wall.") + 2 `collector` (0 if Mara's truck). / `walked_away` → **Whistle** (`director`) + 3 `thug` (1 if Mara's truck). Deshawn beside Jin if he came.
- **Jin's body.** He gets winded sooner here than anywhere (everything since 1994 is in his shoulders); the knuckles (`ch9_knuckles = took`) add stagger; without them the fight is harder and honest. Short, desperate, winnable by speed and timing; it ends with him barely standing.
- **After the last man goes down:** the crew backs into the trucks. **Carrow**, from the van window: "It stops today." The vans leave. At the far end of the row the sedan starts and pulls away; the man in the camel coat doesn't look over. Jin sits on the curb in front of the gate (`sit` curb, forearms on his knees: the Ch2 grief pose, now exhaustion). His shoulders heave and don't stop; his hands shake. **He can't get up for a while.** The camera eases out to 0.85 and holds 8 s. (His exhaustion and limitations remain.)

### E2.3 Nine o'clock
- Behind Jin, **Gloria** takes the padlock off the gate from the inside (she has the key; she always had the key). Residents come out onto the street.
- The Channel 6 van films a different story than Ashgrove booked: Brenda's microphone in front of Gloria. **Gloria:** "Some men came to take our homes this morning. Some other people came and stood in the way. That's all I know." She doesn't point at Jin.
- If Hana came: she sits down on the curb next to him in her peacoat. The Ledger photographer's flash goes off once, white, across the gate: the same flash as Min's Pentax from Section 14 in Ch0. Hana gives Joan her envelope. **Hana:** "You don't have to talk to anybody today." **Jin:** "I'll talk." / If Hana didn't come: Jin gets up, finds the payphone on the corner, and calls her. **Jin:** "It's done. Alder Row." **Hana:** "...I'm coming. Don't go anywhere."
- **The residents don't have to know** (PDF). **Rosa**, with the baby: "Thanks. I still don't know who you are." **Mr. Phan** pushes his grate back up: "Keys are back on." He hands Jin a fresh paper cup of coffee. Mr. Odell's radio is still going; he nods once. **June** gives Jin a new flyer, handwritten in the night: `MEETING TOMORROW 6 AM — STILL DON'T SIGN ANYTHING`. **Gloria:** "Whoever you are. There's a meeting at six tomorrow. You're welcome. Don't sign anything."

### E2.4 Afterward (time cards; one playable walk near the end)
Each card shows only what the player's choices made true. The PDF's shape is kept: exposure happens through evidence, witnesses, residents and people he worked with; Jin loses the treatment and the comeback; he stays poor and his recovery incomplete; his ordinary future has choices in it; he still wants what he refused; many may never know what he gave up.
1. **`April 21, 1997.`** The Calder Ledger, front page, Joan's byline: `FIGHTER, WITNESSES DESCRIBE '94 FIX; ASHGROVE CAPITAL NAMED`. Channel 6 runs Ed's footage at six. Brenda isn't the one reading it.
2. **`June 1997 · Calder County Courthouse.`** The grand jury. Witnesses climb the courthouse steps one at a time, each only if it's true: Hana with her envelope (and her Department of Health complaint); Dot with Min's; Mara; Teddy with the box `SEO — DON'T TOSS`; Deshawn; Mrs. Okafor with her Bible; Roz ("If you need a dispatcher to say it out loud, I will."); Wendell Asher ("Wendell Asher told the grand jury about the key on his ring."); Lenny (`ch3_lenny_method = patient`: "Lenny Voss said it again, to a judge." / else a card: "Lenny Voss was never found to testify. The tape stood on its own."); Owen Tully (`persuaded`: "Owen Tully testified for two days. His daughter drew the courthouse." / `threatened`: "Owen Tully was let go on April 17. He did not testify."); Gerald Pike (`ch6_pike_statement`: "Gerald Pike's two handwritten pages were Exhibit 14." / else: "Gerald Pike was found in Tucson in August and agreed to testify."); Ray Castell (`stopped`: in a suit at a lawyer's table, his statement typed in front of him / `continued`: "Ray Castell's camp closed ranks. The note in his bag stood on its own."). **The residents too:** Gloria hands Joan the Ashgrove cover letter that called Jin "our community liaison"; Ed's tape is entered as an exhibit. **Walter Rook testifies in every version:** "Walter Rook testified for the prosecution and resigned from the Northside Community Council the same week." The more copy holders there were, the faster it moves: many (≥ 5): "The Ledger ran it for eleven days." / few: "It took a year for anyone else to print it."
3. **`1998.`** Partial accountability, the way Celeste said it would go, and a little more: "Harlan Freight's Dock Road operation was indicted. Francis Brannigan pleaded guilty. Ashgrove Capital paid a fine and replaced two officers. Lyle Penner resigned; his trial was set for 1999. Celeste Ashgrove remained chair." / "Alder Commons was cancelled. The cooperative remains." (It is not finished when the credits roll.)
4. **`August 1997 · Calder County Court.`** A one-page order in the viewer: `In re SEO, JIN, registered at St. Agnes Long-Term Care as DANIEL AHN: the petitioner's identity is restored.` (Dr. Whitlow's affidavit; Hana's forms.) Then the State Athletic Commission: Jin signs for his 1994 purse, held "until the fighter signs" (Umma's note on the judgment). After the Commission, the taxman and Calder General's 1994 bill: `$9,400`. The viewer shows where it went, in his handwriting: `Kessler Realty — 3B arrears, Seo — $1,140 / T. Marsh — the stone — $300 (he won't take it; it's in an envelope under his door anyway) / St. Columba's — $200 / Rent.` What's left lasts the winter. (He remains poor.)
5. **`Foundry Courts.`** The roof money ended; Nell found a tenants' credit union; they were cold for a year. The buildings still stand (the benefits were real). Odette at her machine; Gus fixing a radio; the Ch5 prop still there (the `JIN'S` thermostat / the patched kitchen ceiling / the crew's gloves / Gus's motion, adopted at last). Odette's chair on the stoop, with Rook in it on a Sunday, if `ch7_truth_told_by = rook`; empty otherwise.
6. **`A rented room.`** `mara ≥ 2`: the loft behind the workshop, the cot replaced by a bed Mara found; otherwise a room above Han's Market on Kessler Avenue. Min's coat on a nail by the door (if mended; otherwise folded on a chair, the needle still in it). Umma's cornflower dish on the shelf. The robe on the back of the door (`ch8_robe`). On the windowsill, the knuckles (`ch8_hands = knuckles`) or nothing. Hana's referral form on the table: `Calder General Outpatient Neuro PT — Tuesdays — sliding scale $15/visit`. He goes. It's slow.
7. **`Difficult work.`** `mara ≥ 1`: Mara's crew, carrying radiators at six in the morning ("Lift with the legs, boxer."). Otherwise: nights unloading trucks at the rail yard with Darnell.
8. **`Saturdays.`** Occasional teaching at a gym: `teddy ≥ 2`: the kids' class at Iron Pulse on the old Marsh canvas, Teddy on a stool with a whistle ("Hands up, chin down, mouth shut."), cracking a sealed bottle for a kid before handing it over (`ch8_teddy_bottle = drank`); and/or `deshawn ≥ 2`: the Courts' basement gym with Deshawn, Keisha in the front row holding mitts for a smaller kid with total stillness (`ch5_held_mitts`). If neither: Jin shadowboxes alone on the river path on Saturday mornings; a kid on a bike stops to watch, then rides on.
9. **`Relationships he kept.`** Each only if earned: Friday pie with Hana at Sunny's in the booth by the window (`hana ≥ 3`; else a postcard on his windowsill: "Still here. — H."); soup at Odette's; Mrs. Okafor showing him the framed cake photo again (`ch6_okafor_print`); Teddy at the Iron Pulse back room with two cans of soup; Earl's postcards from Florida (`q1_crossword`).
10. **`November 1999 · Sunny's.`** Rita's TV: a title fight for the vacant Continental Middleweight Championship at the new Ashgrove Center that Jin will never be in. He watches every round from the counter. Rita refills his coffee without asking. Jin's hands move a little on the counter with every exchange (the absent-minded double jab). Thought: "*I'd have been good.*" [beat] "*I still want it.*" (PDF: do not erase his disappointment.) **Rita:** "You want the next one on?" **Jin:** "Yeah."
11. **`Autumn 1997 · Alder Row`** (playable, short). Jin walks through on his way to work (left to right; nothing else to do). Mr. Phan's shop is open. June on her bike. Mr. Odell's radio. Rosa hanging laundry on a stoop rail. Residents whose names the player learned are greeted by name in Jin's small bubble barks ("Morning, Rosa."); the others are still "Resident": he never learned them, and they never learned his history. A couple of them nod. Nobody stops him. At the shop, Mr. Phan holds out a paper cup: "Cold one this morning." Jin takes it (if the player walks on, Mr. Phan presses it into his hand anyway). The camera stops following and lets him walk out of frame while the street goes on with its morning. Thought, as he leaves frame: "*They don't know my name. That's all right. I do.*"
12. **Last image: the gym.** A Saturday; kids, mitts, the round timer's bell on the wall ringing for the end of a round. A small boy in oversized gloves (a new kid, not Keisha) stops in front of Jin with his hands up. **Kid:** "Coach. What's your name?" **Jin:** "Jin." [beat] "Seo Jin." The round bell is still ringing. Jin turns toward the room and calls **"Time."** **The bell stops when he says it.** (If `bell_state = ringing`, the faint high ring that has lived under every card since Ch8 stops at the same moment, for the first time.)
- Black. Card: **`HIS OWN NAME`**. Then the shared completion screen.
- Ending Two's sentence on the completion screen: "You refused the bargain. Jin Seo did not receive the treatment program or the managed comeback. Alder Row is still occupied."

## Shared completion screen (after either ending)
- `CHAPTER 9 — THE OFFER` / "Jin is offered the power once used against him." and `CHAPTER 10 — SOMEBODY ELSE'S HOME` / "Jin determines who will pay for his future."
- **What you did**: plain sentences, one per meaningful flag across the campaign, in chapter order (e.g. "You told Min the purse was for the rent." · "You waited for Hana." · "You let Benny walk." · "You fought Slim straight." · "You left the payroll on the table." · "You stayed with the boiler." · "You finished Min's button." · "You let Rook tell them himself." · "You rang the bell yourself." · "You gave copies to seven people." · "You cut the chain." / "You dropped the cutters."). No score, no grade, no morality number.
- **People**: the Journal's People tab, final sentences (e.g. "Hana Lim keeps your number by the phone." / "Teddy Marsh holds mitts on Saturdays." / "Rosa Medina doesn't know your name.").
- Chapter select unlocks for every chapter; the `Before the gate` save is offered for the other ending; replaying Ch10 from its start keeps all earlier flags. The save slot records a one-line summary: "The Champion · November 1999" or "His Own Name · Autumn 1997".

## Encounters
| Where | Enemies | What it tests | Checkpoint | After |
|---|---|---|---|---|
| Ending One: the garden | Terrence (one slow, untrained swing) | nothing; a participation beat with combat feedback removed (`Restrain`) | — | `Hold the door` |
| Ending Two: the gate | Wave 1: 4 crew (+ Benny, Slim conditional) · Wave 2: 4 crew + Carrow (director) · Wave 3: Dutch (boss collector) + 2, or Whistle (director) + 3 | purpose: hold the gate (the cutter-man first), not score knockouts; Jin winded at his worst; allies by relationship | the start of each wave | the vans leave; the sedan leaves |

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Speaking to residents | `ch10_names_learned` (list of resident ids) | Names on their labels | Ending One: names instead of unit numbers in the report. Ending Two: named greetings in the autumn walk. |
| **The gate** | `ch10_choice` = `accept` / `refuse` | **The ending.** | The only flag either ending reads to decide what happens. Everything else in the campaign only shaped who stood where and what was said. |

## State at the end
- Both endings write `ch10_choice`, the completion summary and `ending_seen_one` / `ending_seen_two` (for chapter select and the title screen: after either ending, the title screen's background is the Kessler poster wall; after Ending One the top layer is the airbrushed champion; after Ending Two it's June's flyer, `STILL DON'T SIGN ANYTHING`; after both, the wall shows both, half pasted over each other).



