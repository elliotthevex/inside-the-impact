# Inside the Impact: Story Mode design draft (cinematic lens)

Lens of this draft: **SANABI-style cinematic and emotional direction.** Authored camera, staging, pacing, silence, the seams between exploration, dialogue, combat and cutscene, environmental storytelling, the sabotaged fight in Chapter 0 and its echo in Chapter 8, and the endings. Every section of the shared format is covered. Weight sits on how each scene is *shot and timed*.

Authority order: `ref-story.pdf` (canon, wins over everything) → canon names in `BRIEF.md` → `ref-movement-art.pdf` → research principles summarised in `BRIEF.md`. Nothing here rewrites the narrative; where the PDF is silent, the decision is listed below.

## Decisions I made (nobody could be asked mid-run)

1. **Facts shared with `draft-systems.md`, kept identical so the drafts merge cleanly:** the funding organisation in Chapter 1 is the **Calder Foundry Relief Fund**, administered by Gerald Pike. The fight-night corner is Coach Teddy Marsh (honest; thought it was nerves; sent Jin out) and Lenny Voss (knew; pushed). The family lost apartment 3B in **May 1995**, lived in **Room 9 of Lindell House** from June 1995, and died in the fire on the night of **February 11, 1996**. The Council's negotiated share was **$640,000**, paid **September 28, 1994**; the Foundry Courts deed recorded **September 30, 1994**, two days before the bankruptcy auction's deadline. Fighter names Slim and Deshawn, collector Benny Szabo, and analyst Owen Tully match too. Flag ids match where the choice is the same one.
2. **What was administered backstage:** a **white plastic squeeze bottle with a band of red tape around its neck**, handed over by Lenny in Locker Room B after the bribe is refused ("You're dry, kid. Drink."). Chapter 0 never shows the moment: the scene **jump-cuts over four seconds**, and the player feels the gap. Round 2 shows an interrupted fragment (white bottle, red tape, a taped wrist). Chapter 3 completes the four seconds when Lenny confesses. Chapter 8 answers it: Teddy cracks the seal of a new bottle in front of Jin.
3. **The bell is the game's spine.** The last clear sound of Chapter 0 is the bell ringing on while Jin cannot defend himself. Every chapter card from Chapter 1 to Chapter 8 opens on that same bell, heavily muffled, a little clearer each chapter. In Chapter 8, if Jin stops when Ray is no longer a threat, **he walks to the timekeeper's table and rings the bell himself, once**. It decays to true silence, and the Chapter 9 and 10 cards open with no bell. If he keeps hitting Ray, the bell never stops: a faint ring stays under the Chapter 9 and 10 cards. Presentation only; it never touches the ending.
4. **Calder Foundry closed in March 1992.** The St. Agnes file claims an industrial accident there in August 1994. Hana's father got his last paycheck from the Foundry in '92: that impossibility is her first doubt. It also explains the Courts: the Foundry's worker housing was going to auction after the bankruptcy.
5. **The public lie:** Calder was told that Jin Seo "checked himself out of Calder General against medical advice two days after the knockout and hasn't been seen since." His family spent eighteen months looking for a man everyone said had walked away.
6. **The blue track top was Min's gift.** Inside the collar, in marker: `PROPERTY OF THE CHAMP (allegedly) — M.` Jin wears it in Chapter 0, wakes in Chapter 1 in gray hospital sweats, and gets it back in Chapter 2 from a box Teddy kept at Iron Pulse Fitness ("SEO — DON'T TOSS"). From that moment his sprite matches the art spec.
7. **The scar** (broad reddish healed patch, right cheek) comes from fight night. Jin's cheek is clean in Chapter 0. In Chapter 1 he first sees the scar in the rehab-gym mirror.
8. **The fridge note.** In Chapter 0 Min writes on the fridge pad: `AFTER: Kessler Diner, window booth. Umma says last bus is 12:10 so WIN FAST. — M`. In Chapter 6 Jin finds it in the county storage box with the magnet still stuck to the back. This is the PDF's "message about meeting after the fight."
9. **Walter Rook was in the arena.** In Chapter 0 a man in a flat cap sits in Row K, the only seated figure while the crowd stands, and leaves before the bell stops. Nobody points him out. In Chapter 7 Rook confirms it.
10. **The man in the camel coat is never named or explained.** In Chapter 9 a camel overcoat hangs on the stand outside Lyle Penner's office. In Ending One he is a silhouette at the back of the arena. That is all.
11. **Ray Castell's tell:** he taps his own chin with his left glove before the straight right, and he throws after the bell. Chapter 0 shows both; Chapter 8 lets the player use both.
12. **Chapter 6's grief action is a repair.** Among Umma's belongings is Min's winter coat with one button half-sewn, the needle still threaded with navy thread. On the cemetery bench on the anniversary, February 11, 1997, the player can finish it with the ordinary three-step repair interaction.
13. **Jin's lodging moves with the story:** St. Agnes Room 214 (Ch1) → a cot in Iron Pulse's boiler room that Teddy lends him (Ch2–4) → the cot in Mara's workshop at Foundry Courts (Ch5–7) → by the player's choice in Ch7, either stay at the Courts or take a room at the Calder Arms Hotel (Ch8–9). The Chapter 9 night of consideration starts wherever he sleeps.
14. **Ending One's last image is a poster:** the comeback poster has the scar airbrushed off, which echoes Min's Chapter 0 joke about the promo photo that "barely looks like him." **Ending Two's last beat:** a kid at the gym asks the coach his name. "Jin. Seo Jin." He calls "Time," and the round bell stops when he says so.
15. **Rest periods** are time-skip cards with a resting scene (Ch1 between weeks; after Ch4, "Two weeks"; after Ch7, "Nine days"). They are where Jin's condition visibly recovers, never via money.

---

# Global

## Direction grammar (applies to every chapter)

**Camera states.** Every location has a default *follow* camera: 0.18 s lag, 48 px look-ahead in the facing direction, vertical dead-zone 40 px. Scenes override it with authored states, which return to follow over 0.8 s:
- `zoom 1.0`: play. `zoom 1.15–1.25`: intimacy in two-shots and examining. `zoom 1.4–1.6`: shock (the nameplate, the knuckles in the puddle, the bottle). Never above 1.6, so pixels stay crisp.
- `zoom 0.8–0.85`: distance and loneliness (Jin small under a streetlight; the empty arena; the tower plaza). Reserved for after discoveries.
- **Letterbox**: 22 px bars (thin) for walk-and-talk, where the player keeps control at walk speed; 36 px bars (full) for authored scenes, where the player has no control. Bars slide in over 0.4 s. A full letterbox always means "you cannot move now"; a thin one always means "you can walk."
- **Shake** only on impacts that matter to the story (the fall, Dutch hitting a container, a door kicked in). Combat shake obeys the reduced-shake setting.

**Transitions.**
- *Walk-through*: no cut; the street simply continues. Used inside one district.
- *Breath cut*: 0.6 s to black while ambient sound continues, then 0.6 s up. Used between rooms of the same building.
- *Sound bridge*: the next scene's sound starts 1–2 s before its picture (rain, a bell, a crowd). Used for every chapter transition and for memories.
- *Match cut*: a shape or sound carries across the cut. The ring bell becomes the nurse-call chime (Ch0→1); the ring lights become the rehab-gym fluorescent tubes; a rice-cooker "ding" opens Chapter 0.
- *Time-skip card*: white serif text centred on black, ambient sound underneath ("Week 3."). Never more than 2.5 s.
- *Memory filter*: desaturate to 30%, warm the highlights, add 1 px horizontal jitter every 0.5 s, low-pass the audio, and grain at 6% opacity. Memories always enter on a sound bridge and leave on a breath cut.

**Breath zones.** After every emotional discovery (the canon list: the Okafor news, the mirror, Lenny's confession, the transfer van, Room 9, the Pike memo, the Rook admission, Ray's defeat, the offer), the next 60 s of the player's time is guaranteed hostile-free. The location's hostile spawner is locked, music is off or a single held tone, the objective HUD hides itself, and a **Sit** spot is always within 200 px. Sitting eases the camera out to 0.85, lets time-of-day advance, and plays one or two of Jin's thoughts. The objective comes back when the player leaves the zone or after 90 s of sitting. Nothing forces the sit.

**Combat entry.** Never a hard cut. Hostiles arrive from the world (a van door, a stairwell, a roller door). The HUD (dash pips, condition) fades in on the first hostile action, not before. Music enters on the first landed punch, not on the spawn. Combat UI fades out 2 s after the last enemy stays down.

**Dialogue staging.**
- *Barks*: in-world speech bubbles, max 7 words, only when Jin is within 96 px.
- *Conversation*: lower-third box with the speaker's name. The camera eases to a two-shot at 1.15 with both figures on the thirds, and the background dims 15%.
- *Key scene*: full letterbox, no portrait, typewriter text at 38 chars/s, and silences written as explicit `[beat]` holds of 0.8–2.0 s in which nothing is printed. Characters have no faces, so every key line carries a pose change (head down, turn away, hand on shoulder, sit).
- Jin's **thought lines** are italic, never more than one sentence, and never explain what the screen already shows.

**Diegetic UI rule.** Whenever a verb is blocked (rehab, carrying, the sabotaged rounds, Rook's office), the block is shown in the world and in one line of Jin's thought, then confirmed by a small HUD icon (a crossed fist, a crossed dash). The controls never feel broken without a reason.

**Recurring motifs** (each is a prop the camera returns to):
| Motif | First seen | Returns |
|---|---|---|
| The brass bell with a chipped lip (Calder Civic timekeeper's table) | Ch0 fight | every chapter card; Ch3 the Cellar's hand bell (a cheap imitation); Ch8 the same bell; both endings |
| Blue track top | Ch0 home | Ch2 the box; Ch10 both endings (pristine and pressed vs. worn at the cuffs) |
| White bottle with red tape | Ch0 Locker B (unseen) | Ch0 R2 fragment; Ch3 confession; Ch8 Teddy's sealed bottle; Ending One a cornerman's bottle that Jin drinks without looking |
| Promo photo "that barely looks like him" | Ch0 newspaper | Ch2 poster wall (buried); Ch6 Min kept the clipping; Ending One airbrushed poster |
| Fridge note | Ch0 kitchen | Ch6 storage box; Ending Two Jin eats at the window booth |
| Streetlight pools | Ch2 Kessler Ave | Jin is framed alone under one in Ch2, Ch4, Ch7, Ch9 and Ending Two |
| Hands (Umma sewing, Lenny taping, Rook folding his, Celeste's still hands) | Ch0 | every confrontation is framed on hands at least once |

**Audio palette.** Calder's bed is a far-off river horn every 90–120 s, the hum of sodium lights, and distant trains. Each district adds one signature layer: Eastgate's buses and a dog, the Cellar's bowling pins overhead, the depot's reversing beepers, the Courts' kids and a radio, Ashgrove's HVAC hush. Score is sparse: piano and bass for home, a muted trumpet for the city, low strings for discoveries, and percussion only in fights.

---

## Cast bible

Pixel figures are ~46 px, faceless. Every description below is something the procedural renderer can draw: colours, shapes, accessories, and pose sets from the engine list.

### Jin Seo (26 in 1994; 28–29 in 1996–97)
- **Look.** Athletic boxer's build: developed shoulders, narrow waist. Dark-brown two-block hair; the fringe hides his eyes, and the upper face is shaded in 3 steps. *1994*: muted blue zip track top with off-white sleeve stripes, black pants, worn white running shoes, clean right cheek; in the ring, navy trunks with a white waistband (Umma re-sewed it), red gloves. *Ch1*: gray hospital sweats, hair grown shaggy over the ears (no two-block), thinner shoulders (−2 px). *Ch1 exit–Ch2*: donated brown corduroy coat over the sweats. *Ch2 onward*: the canonical blue track top again, hair cut back to two-block by Teddy's clippers, reddish scar patch on the right cheek. *Ch2–Ch7*: brass knuckles as two 2 px gold glints on the fists.
- **Body language.** Default idle is a relaxed guard with a breathing shift. Exploring, he walks with hands in pockets (`lean on wall with hands in pockets` when stopped). When hurt or tired, his shoulders heave. In Ch1 the idle is a slight list to the right, his weak side. In grief he sits on curbs and stoops (`sit curb`), forearms on knees, head down. He almost never points at people.
- **Voice.** Few words, short sentences, dry. He gets more precise when angry, not louder. *1994*: "Two rounds. He'll be tired by four." / "Umma. I'll take a cab. I'll have money for a cab." *1996–97*: "My name is Seo Jin." / "Nobody asked me." / "I'm not here for you. Sit down."
- **Wants.** 1994: the title, and the purse for his family. 1996: his name back, then his family, then the people responsible. Ch9: his life back, which is offered and real.
- **Perspective on the central conflict.** He begins thinking it's a crime with villains. He ends seeing a system that spends strangers, himself included, and knowing it will offer to spend strangers for him.
- **Change.** From a man whose future was taken to a man who decides who pays for his. His *voice* follows the player's record: restrained players hear a quieter Jin ("I let him walk"); harder players hear a man who knows what he did ("I put Dutch in the river mud. I'd do it again. That's the problem.").

### Min (Seo Min-ji, 22 in 1994)
- **Look.** Shoulder-length black hair in a low ponytail with a **yellow scrunchie** (the brightest small colour in Ch0), an oversized maroon Calder Community College sweatshirt, light jeans, red canvas sneakers. In Kessler Diner flashbacks, a pink waitress apron over the sweatshirt.
- **Body language.** Sits on counters and chair backs, never in chairs properly. Talks with her hands (`point`, `shrug`). Leans on Jin's shoulder to tease. Bumps him with her hip.
- **Voice.** Fast, teasing, practical underneath. "This is not you. This is a guy who sells aluminium siding. They airbrushed you into a different man." / "Purse first, then you can be humble. I want a bathroom with a lock that works." / (letters, Ch6) "To whom it may concern, for the fourth time: my brother is not a rumour."
- **Wants.** Jin safe, Umma off the double shifts, an accounting certificate, a bathroom lock that works.
- **Perspective.** In Ch6 her letters are the record of someone who refused to accept the official story. She is the family's investigator before Jin is.
- **Change** (told through belongings): from teasing sister to a tired, organised, furious searcher who still wrote shopping lists with jokes in the margins.

### Mother: Mrs. Seo Mi-ok, "Umma" (52 in 1994)
- **Look.** Short permed hair going gray, reading glasses on a beaded chain, a mustard cardigan over a cream blouse, gray slacks, house slippers indoors and black flats out. Small and slight.
- **Body language.** Her hands are always busy: `cook/work at counter`, sewing at the machine, folding. She stands with her hands folded at her waist when worried, and puts a hand on Jin's back rather than hugging.
- **Voice.** Plain, practical, Korean endearments. "Jin-ah. How will you get home? The bus stops at twelve-ten." / "Eat first. Then be famous." / "Don't let them hit your face. I just fixed your face."
- **Wants.** Her children fed, her son home safe, a smaller worry than rent.
- **Perspective.** No abstractions: rent, buses, thread. Her pay stubs in Ch6 (doubles at Kessler Cleaners while searching) are her argument.
- **Change.** Seen only in 1994 and in what she left behind. The unfinished repair is the last thing she was doing.

### Coach Teddy Marsh (61 in 1994; 63–64 in 1996–97)
- **Look.** Barrel belly, white flat-top crew cut, gray sweatshirt reading `MARSH B.C.`, a red towel over his right shoulder, a whistle on a shoelace. In 1996 the same sweatshirt, faded, plus a janitor's gray work vest with `IRON PULSE` on the back.
- **Body language.** Hands on hips, arms crossed, a slow heavy walk. He holds mitts with total stillness. In 1996 he leans on a push broom like a cane, but only as a prop at rest.
- **Voice.** Gruff, short, all instruction. "Hands up. Chin down. Feet under you. That's the whole religion." / "It's nerves, kid. Breathe. One more round." / (1996) "I said one more round. I've been saying it every night for two years."
- **Wants.** In 1994, one champion before he dies. In 1996, to be forgiven without asking for it.
- **Perspective.** Honest, and wrong at the one moment that mattered. He represents ordinary negligence beside deliberate harm.
- **Change.** From pride, to guilt, to a corner man again in Ch8 if the relationship allows, and in Ending Two maybe the gym Jin teaches at.

### Lenny Voss (42 in 1994; 44–45 in 1996)
- **Look.** Wiry, stooped, thinning hair slicked back, a brown leather jacket over a stained white tee, a roll of white tape worn on his left wrist like a bracelet, and a green tackle box (his cut kit). In 1996 he adds a blue Starlite Lanes mechanic's shirt with `LENNY` on an oval patch.
- **Body language.** Never still: rubs his neck, smokes, checks the door. He talks to the floor and laughs at the wrong time.
- **Voice.** Fast, deflecting, "kid" every other line. "Big night, kid. Big night." / "I carried a bottle. That's all I did. A guy hands you a bottle, you carry it." / "You think I sleep? I fix pinsetters at three in the morning so I don't have to sleep."
- **Wants.** Not to be the one who did it. Money. Not to die.
- **Perspective.** Small compromises add up to catastrophe, and each one felt practical at the time.
- **Change.** He minimises, then confesses (more of it if treated patiently), and ends as a witness in Ending Two or a man on a bus out of Calder.

### The man in the camel coat (age unclear, 50s)
- **Look.** Tall, knee-length **camel overcoat**, dark charcoal scarf, black leather gloves he never takes off, silver hair combed straight back. Polished shoes; the only clean shoes backstage.
- **Body language.** Perfectly still. He sits on the edge of the locker-room bench as if visiting a sick friend, and he leaves without turning his back quickly.
- **Voice.** Calm, almost kind. Practical advice, never a threat. "I'm not here to scare you. I'm here because I've watched a lot of young men be brave for one night and poor for forty years." / "Fifty thousand dollars. Lose in four, honourably. Your mother never works a Saturday again." / (refused) "Then I hope you're as good as they say. Truly."
- **Wants.** The arranged result, at the lowest cost.
- **Perspective.** He sincerely believes the system is weather, and that he's offering an umbrella.
- **Change.** None. That is the point. He is a coat on a stand in Ch9 and a silhouette in Ending One.

### Ray Castell, the champion (29 in 1994; 32 in 1997)
- **Look.** 1994: tall and broad, close-cropped hair, a thin moustache drawn as a 1 px dark line, a white satin robe with gold trim and `CASTELL` in gold, white trunks with a gold stripe, white gloves. 1997: 3 px heavier at the waist, a gray tracksuit with gold piping in training, and in public a charcoal suit.
- **Body language.** Upright, chin high, slow showman's walk. He taps his gloves together twice before a round. **The tell:** he taps his own chin with his left glove before a straight right. In 1997 he rubs his right shoulder when not performing.
- **Voice.** Smooth, media-trained, cracking underneath. "Good luck, kid. I mean it. Make it a fight." / (1997) "I saw it in the second round. I knew. You think I didn't know?" / "You know what I had? A mortgage on my mother's house and six guys whose kids ate because I won."
- **Wants.** To stay relevant, stay paid, and keep the people invested in him.
- **Perspective.** He chose to continue when he could have stopped. He knows it, and he explains it, which is not the same as excusing it.
- **Change.** If Jin stops, Ray gives a statement and says Penner's name aloud to a stenographer. If Jin continues, Ray says nothing and his camp turns hostile.

### Hana Lim, rehabilitation worker (29)
- **Look.** Teal scrubs, a white knit cardigan with pushed-up sleeves, black hair in a tight bun with a pencil through it, white sneakers, a clipboard. Off duty: a long navy wool coat and a red knit scarf.
- **Body language.** Brisk walk. Hugs the clipboard while thinking. Kneels to Jin's eye level when he is in the wheelchair, hands on hips when firm. In the records scene she `crouch`es at the low drawers and reads with a finger under the line.
- **Voice.** Direct, warm, dry, procedural. "Okay. One more length. Then we'll argue about your name." / "My father got his last check from Calder Foundry in March of '92. Nobody poured anything there in '94." / "I'm not on your side, Jin. I'm on the side of the chart being true. Right now that's the same thing."
- **Wants.** The chart to be true. Her patients to leave walking. To keep her job.
- **Perspective.** She is the ordinary institution working correctly, which is exactly why she notices when it doesn't.
- **Change.** From trusting the records, to concern, to holding a copy of the evidence. She never becomes a love interest; her final scene in Ending Two is a referral form for a cheaper outpatient clinic.

### Gerald Pike, liaison, Calder Foundry Relief Fund (54)
- **Look.** Beige raincoat over a brown suit, comb-over, wire glasses, a brown leather briefcase, and a paper bag of **butterscotch hard candies**.
- **Body language.** Hands clasped in front of his belt, a small forward bow when he speaks. He sits on the very edge of chairs and always leaves a candy on the bedside tray.
- **Voice.** Soft, managerial, plural pronouns. "Let's not tire ourselves with boxing, Daniel." / "We're paying for all of this. The least we can do is get well quietly." / (Ch6, cornered) "I process forms, Mr. Seo. I process what I'm given."
- **Wants.** The arrangement undisturbed and his Fund salary.
- **Perspective.** A bureaucrat of concealment, believing that paperwork makes him not responsible.
- **Change.** In Ch6 he's cornered and frightened. He writes a statement if the player makes him (`ch6_pike_statement`).

### Walter Rook, leader, Northside Community Council (58)
- **Look.** Tall, slightly stooped, short gray beard, a **wool flat cap**, a brown corduroy jacket with elbow patches over a cardigan, reading glasses in the breast pocket. He walks with one hand on the small of his back.
- **Body language.** Listens before speaking, sitting forward with elbows on knees. Folds his hands. Puts a hand on people's shoulders, Jin included in Ch5 (Jin steps out from under it in Ch7). He never raises his voice; when cornered he takes off the cap and holds it.
- **Voice.** Concrete, a slow cadence, names and numbers. "Hundred and twelve households. I can tell you every name. Do you want me to?" / "Twenty years of bake sales, Mr. Seo. Petitions. A federal grant we lost on a typo." / "I told myself once. Only once. I have said that sentence to myself every morning since."
- **Wants.** The neighbourhood to survive, and to not be what he is.
- **Perspective.** The genuinely hard case: real people really housed by a real crime.
- **Change.** From benefactor to confessor. He doesn't become a villain or a boss fight, and he doesn't get absolution.

### Mara Kowalski, maintenance lead, Foundry Courts (44)
- **Look.** Short sandy hair under a **red bandana**, an olive work jacket with sleeves rolled, a heavy tool belt, gray work pants, brown boots, a rag in her back pocket.
- **Body language.** Crouched at pipes (`crouch`), wiping her hands on the rag, arms crossed while judging. Laughs with her whole upper body. She carries things two at a time.
- **Voice.** Blunt, funny, fair. "You can carry a radiator or you can carry an opinion. We're short on radiators." / "Twenty-five a shift, coffee's free, the coffee's bad." / (Ch7) "I fixed every pipe in this place with that money. Every one."
- **Wants.** Things to work. People warm.
- **Perspective.** She knew the Council bought the buildings. She didn't know about the fight, and she has to hold both.
- **Change.** From employer, to friend, to someone who can't look at Rook or at Jin for a while. Depending on the player, she ends as a copy holder and the woman driving the truck in Ending Two.

### Mo Feeney, promoter, The Cellar (60)
- **Look.** Bald with a horseshoe fringe of white hair, a loud red-and-mustard plaid sport coat, a gold watch, an unlit cigar. He sits on a stool behind a card table with a gray cash box.
- **Body language.** Sits wide. Counts money while talking. Points with the cigar.
- **Voice.** Carnival barker, honest about being dishonest. "The Kessler Kid! Back from the dead, in my basement! That's not a fight, that's a resurrection. People pay for resurrections." / "Nobody's forced. Everybody's welcome to be broke somewhere else."
- **Wants.** A full house and no police.
- **Perspective.** Desperation is his business model, and he calls that freedom.
- **Change.** None. He books Jin again in Ending Two if asked, and Jin says no.

### The underground fighters (The Cellar)
- **Slim (Terrence Hollis, 36).** Lanky southpaw with long arms, faded orange trunks, a black knee sleeve on the left knee, gray hoodie. He lives on a cot in Mo's gym, and refusing a booking means losing the cot. *Pose:* stretching the knee, sitting on the cot edge. *Voice:* soft, proud. "Mo says fight, I fight. Mo says don't, I sleep in the Buick." Change depends on `ch3_slim_carried`.
- **Big Ike (Isaac Morrow, 41).** Dockworker, wide and bald, red suspenders over a white undershirt. He fights for the pleasure of it. *Pose:* laughing with his hands on his hips, slapping his own chest. *Voice:* "Best part of my week, son. Don't take it personal. Take it to the face." He feints like a man who learned in bars.
- **Deshawn Price (23).** Fast and skilled, the best pure boxer in the room. Green trunks, a white towel over his head between bouts, a Walkman. He fights for rent and has been told which result is expected (go down in round 2; Mo wants the ghost to win). *Pose:* sitting on the bench with his headphones on, head down, bouncing a knee. *Voice:* "I could beat you. Everybody in here knows I could beat you. That's what makes the money." Change depends on `ch3_deshawn_dive`.
- **Lolo Reyes (27).** The only woman on the card, fighting for recognition because no sanctioned body will book her. Purple trunks, black braid. A non-combat NPC who gives Jin scouting notes. *Voice:* "They'll pay to watch me. They won't pay to call it boxing."

### "Dutch" Brannigan, boss collector, Harlan Freight Depot (52)
- **Look.** Huge, red-blond beard, black wool peacoat, a flat cap pulled low, fingerless gloves, a ring of keys on a long chain.
- **Body language.** Walks slowly toward you with his arms wide, like herding cattle. Steps sideways to cut angles and leans on things to block exits.
- **Voice.** Patient, Boston-ish, almost fatherly. "There's no back door, son. There's never a back door." / "We're the truck. Ask who paid for the gas."
- **Wants.** The job done, and no surprises.
- **Perspective.** Labour for capital he never sees. He thinks of himself as a working man.
- **Change.** If spared, he refuses to fight Jin in Ch7 and steps aside in Ending Two's last wave. If not spared, he leads Ending Two's last wave with a grudge.

### Foundry Courts residents (a small fixed cast: no filler)
- **Ada Greer (71).** Retired Calder Foundry payroll clerk and the tenants' meeting secretary. Lavender knit hat, a long gray coat, a thermos, a green lawn chair at the courtyard gate. She keeps the Courts' binder of deeds and minutes. *Voice:* "I kept the Foundry's books for thirty-eight years. I know what a ledger hides and what it brags about." In Ch7 she rejects Rook first.
- **Keisha Greer (10).** Ada's granddaughter. Pink puffer jacket, two puff ponytails, oversized boxing gloves from Lucho's gym. Plays hopscotch, wants to learn to box. *Voice:* "Are you a real boxer or a fake boxer? Lucho says you're real but he's a liar about my bedtime."
- **Luis "Lucho" Ortega (38).** Bus mechanic who runs the little Boiler Room Gym. Navy mechanic coveralls tied at the waist, a white tank top, a gray beanie, a pencil moustache. *Voice:* "In here, we don't hit hard. We hit right. Hard is for people with insurance." The local boxer who trains Jin.
- **Gus Petrakis (64).** Runs the corner store on Building B's ground floor. Brown cardigan, white apron, glasses pushed up on his forehead. Complains about everything and gives credit to everyone. In Ch7 he is angry at Jin out of fear. *Voice:* "You want them to take it back? You want us on the sidewalk so you feel better?"
- **Elena Vasquez (33).** Nurse's aide on nights, mother of two (Tomás 8, Rosie 5). Lilac scrubs under a black puffer. She is waiting for the repaired Unit 4D in Building C (the roof leak job). *Voice:* "I don't care who bought the roof. I care if it leaks on Rosie."
- **Darnell Fisk (45).** Foreman of the Council's six-man repair crew. Yellow hard hat, a tan Carhartt jacket. His crew's pay is the Ch4 envelope. *Voice:* "Somebody hit the depot. Our two weeks were in that envelope. Council says it's 'unrecoverable.' My kid's not unrecoverable."

### Celeste Ashgrove, chair, Ashgrove Capital (56)
- **Look.** A silver bob, a cream wool suit, pearl stud earrings (1 px each), very still hands. Usually seated behind a pale desk.
- **Body language.** Doesn't stand when Jin enters. Turns pages slowly. Her one gesture is a flat palm on the table: "this is settled."
- **Voice.** Gracious, exact, never threatening. "We aren't your enemies, Mr. Seo. We're your options." / "Everything on this table is real. I'd be insulting you if it weren't." / "You've proven you can hurt us. That's why we're talking."
- **Wants.** The Alder Row sale closed, Jin's face on the deal, the network legitimised.
- **Perspective.** The cost is an administrative line. She has never been to Alder Row.
- **Change.** None on screen. In Ending Two, a newspaper photo of her leaving a courthouse.

### Lyle Penner, executive vice president, acquisitions, Ashgrove Capital (44)
- **Look.** Tall and thin, a navy suit, dark hair slicked back, rimless glasses (a 1 px glint). Always holding a black fountain pen.
- **Body language.** Moves while talking, sits on the edge of the table, uncaps and recaps the pen, taps it on the folder.
- **Voice.** Fast, numerical, salesman-warm. "Twenty-four households. Average tenure eleven years. Relocation assistance is generous, I wrote it myself." / He quotes Jin back to himself: "'I'm not for sale.' August twentieth, Locker Room B. We have very good notes." / (to Ray, 1994, as Ray reports it) "The referee has been spoken to. Don't stop till it's done."
- **Wants.** The deal, and to be the one who closed it.
- **Perspective.** He gave the final instructions in 1994 and doesn't remember them as a moral event.
- **Change.** In Ending Two, arrested in May 1997 ("for questioning," per the Calder Ledger); the process continues past the credits.

### Alder Row residents (Ch10 only; strangers to Jin)
Their labels read only a description until Jin speaks to them, then show the name (stored in `ch10_names_learned`).
- **"Woman with a lamp": Ruth Adeyemi (60s).** Green headwrap, a brown coat, carrying a tall floor lamp with a fringed amber shade out of her door. In Ending Two, she puts the lamp back in her window.
- **"Shopkeeper": Sal Ferrante (70).** `FERRANTE SHOE REPAIR`, gray cardigan, leather apron; pulling down his shop grate and then pulling it back up halfway, twice.
- **"Two men arguing": Tom Kerrigan (40s, plaid jacket)** wants to block the door; **Leon Baptiste (50s, mail-carrier uniform)** wants to sign and take the relocation money before it shrinks. *Leon:* "Resistance gets you a lawyer's bill and a smaller check." *Tom:* "It gets you a door you can still lock."
- **"Family with boxes": the Trans** (mother Linh, son Danny, 9). Carrying boxes to the curb, a goldfish bowl in the boy's arms. The boy's name is Danny, the name St. Agnes gave Jin. It is only a coincidence, and nobody remarks on it; the player may notice.
- **"Old man on the stoop": Mr. Henry Odell (80s).** A folding chair on his stoop, an overcoat over pyjamas, refusing to move. *"Fifty-one years. They can carry me with the chair."*

---

## Flags & relationships registry

### Rules
1. **The ending reads one flag only: `ch10_choice`.** Every other flag changes lines, who appears, staging, allies in Ending Two's fight, and epilogue vignettes. Both final options are always offered and always enabled.
2. **No visible morality number.** The People tab shows one sentence per person ("She keeps your number by the phone"). The chapter completion screen lists "What you did" in plain words ("You left the payroll envelope on the desk").
3. **Reflect, don't judge.** `jin_voice` (derived, below) picks Jin's line variants so a restrained player never hears Jin talk as if he brutalised people.
4. **Every flagged choice autosaves immediately after** (checkpoint labelled with the choice), so the choice is made once and owned.
5. **Choices that hurt someone say so in brackets** (`[Hit him again]`). No option misrepresents its result, and no choice has a timer.

### The PDF's four recurring questions, as a ladder
| Question | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Ch8 | Ch9 | Ch10 |
|---|---|---|---|---|---|---|---|---|---|
| Take money already allocated to someone else? | — | — | `ch3_deshawn_dive` (a gifted result) | `ch4_envelope` | `ch5_envelope_outcome` | — | — | — | `ch10_choice` |
| Threaten a frightened witness to save time? | — | — | `ch3_lenny_method` | `ch4_roz` | — | `ch6_pruitt_method` | — | `ch9_owen` | — |
| Abandon a commitment for an investigative opportunity? | `ch1_records_route` | — | — | — | `ch5_left_repair` | — | — | — | — |
| Keep hurting someone after getting what you need? | — | `ch2_collector_after` | `ch3_slim_carried` | `ch4_dutch_after` | — | — | `ch8_ray_after` | — | — |

### Choice flags (complete list)
| Flag id | Values | Set where | Read where |
|---|---|---|---|
| `ch0_purse_dream` | `rent` / `umma_shifts` / `new_apartment` | Ch0 kitchen, Min: "So what's the purse for, champ?" | Ch2 Mrs. Okafor quotes it; Ch6 Min's letter line; Ch9 Penner's offer echoes it; both endings (what money buys or doesn't) |
| `ch0_refusal_line` | `not_for_sale` / `my_family` / `get_out` | Ch0 Locker B, refusing the camel coat (all three refuse) | Ch9 Penner quotes it word for word; Ch10 Jin's thought at the door |
| `ch0_told_teddy` | bool | Ch0 Locker B, when Teddy returns | Ch2 Teddy's guilt line; Ch8 corner line |
| `ch0_resistance` | 0–3 (counters landed in round 3) | Ch0 round 3, counted, never shown | Ch8 Ray: "You hit me N times that night. Nobody ever believed me it was N."; 0 gives a different line |
| `ch1_pike_answer` | `played_along` / `insisted` | Ch1 week 3, Pike: "Your name?" | Ch1 privileges (garden pass early vs. calls revoked, which Hana witnesses); Ch2 when the van appears (dusk vs. already waiting); Ch6 Pike's file note on Jin |
| `ch1_records_route` | `with_hana` / `alone` | Ch1 week 5: wait for Hana's Thursday shift, or use the door the janitor propped on Wednesday night | Hana +2 / +0; records-room scene variant; Ch6 Hana line |
| `ch2_teddy_tone` | `blamed` / `asked` / `forgave` | Ch2 Iron Pulse back room | Teddy −1 / +1 / +2; Ch8 whether Teddy is in the corner |
| `ch2_collector_after` | `let_go` / `hit_again` | Ch2 Pratt Alley, after Benny names Lenny | Ch3 Lenny's opening line; Ch10 Benny steps aside or fights |
| `ch2_shoveled` | bool | Ch2 optional: clear Sung's sidewalk | Mr. Sung's later lines; small money |
| `ch3_slim_carried` | bool | Ch3 bout 1: carry Slim to the final bell, or knock him out | Slim +3 / −2; Slim teaches the hook (carried) or Lolo does; Ch10 Slim stands with the residents or fights |
| `ch3_deshawn_dive` | `accepted` / `refused` | Ch3 bout 3, freeze-frame in the clinch | Deshawn rel; bout 3 length; Ch8 Deshawn's scouting on Ray; Ch9 Penner ("You've accepted a gift before") |
| `ch3_deshawn_paid` | bool | Ch3, only if refused: Mo docks Deshawn's $200; Jin may cover it | Deshawn +2; money −200 |
| `ch3_lenny_method` | `patient` / `pressed` | Ch3 pinsetter loft | Lenny +2 / −3; `mem_00_bottle` completes in full (patient) or in flashes (pressed); Lenny as witness |
| `ch4_called_hana` | bool | Ch4 Harlan Grill payphone (optional) | Hana +1; her Ch6 line |
| `ch4_roz` | `let_go` / `threatened` | Ch4 dispatch room | Roz gives the safe combination (let go) or lies about it (threatened → extra search); Roz as copy holder |
| `ch4_took_profit` | bool | Ch4 counting room, the "A.C. — Q4" stacks ($600) | Ch9 Celeste: "Consider it an advance." No innocents harmed |
| `ch4_envelope` | `taken` / `left` | Ch4 counting room, payroll envelope ($1,840) | Ch5 whole chapter (Darnell's crew unpaid, Building C roof job suspended, the meeting's topic); Ch7 Darnell; Ch9 Penner |
| `ch4_dutch_after` | `walked_away` / `kept_going` | Ch4 river lot after the boss | Ch7 Dutch refuses to fight Jin (walked away) or isn't there; Ch10 Dutch steps aside or leads the last wave |
| `ch5_left_repair` | bool | Ch5 day 3: stay on the Building D boiler or follow Pike to the Council site office | Mara −2, courts −1, the Greer kids sleep at Gus's; gives `ev_pike_call` |
| `ch5_meeting_stance` | `roof` / `wages` / `heater` / `silent` | Ch5 residents' meeting | courts rel; which prop appears in the community room in Ch7 (new heater / a bucket under the roof) |
| `ch5_envelope_outcome` | `none` / `confessed` / `returned_anon` / `kept` | Ch5, only if the envelope was taken: Mara's pay tin | Mara rel; Darnell's Ch7 line; `jin_voice` input |
| `ch5_trained_kids` | bool | Ch5 optional: hold mitts for Keisha | Ending Two teaching vignette shows Keisha, older |
| `ch6_pruitt_method` | `patient` / `threatened` | Ch6 Garrison Street laundromat | Mrs. Pruitt's testimony (full / partial); witness and copy holder |
| `ch6_pike_statement` | bool | Ch6 Pike's office: make him write it down | `ev_pike_statement`; Ending Two epilogue line |
| `ch6_finished_repair` | bool | Ch6 cemetery bench: sew Min's button | Ending Two, the coat hangs by Jin's door; Ending One, it's in a box he never opens |
| `ch7_rook_answer` | `would_have_asked` / `dont_know` / `silent` | Ch7, Rook: "What would you have done?" | Ch9 night, Rook's line; Ch10 Jin's thought |
| `ch7_truth_told_by` | `jin` / `rook` | Ch7: who tells the residents | residents' scene staging; courts +1 if Rook tells it himself |
| `ch7_stayed_at_courts` | bool | Ch7 end: Mara: "Cot's still there." Stay, or take a room at the Calder Arms | Ch8–9 lodging; where the consideration night starts |
| `ch8_teddy_bottle` | `drank` / `declined` | Ch8 Locker B, only if Teddy is present (teddy ≥ 2) | Teddy's last corner line; Ending Two gym vignette |
| `ch8_hands` | `wraps` / `knuckles` | Ch8 Locker B | Ray's opening line; stagger numbers; Teddy's reaction |
| `ch8_ray_after` | `stopped` / `continued` | Ch8, Ray down and no longer a threat (canon choice) | **the bell** (`bell_state`); Ray's statement (stopped) or hostile camp (continued); Teddy, Hana, Mara, Deshawn, Lucho reactions; Ch9 Penner; Ending Two epilogue |
| `copy_holder_<id>` | bool each: `hana` (always), `mara`, `teddy`, `lenny`, `deshawn`, `roz`, `pruitt`, `ray`, `okafor` | Ch8 dawn at Kwik Copy: whom Jin gives an envelope (people with rel ≥ 1, or witness flags) | Ch9 Penner names them; Ending Two montage (how far exposure goes) |
| `ch9_owen` | `persuaded` / `threatened` | Ch9 floor 22 | `ev_relocation_model` (persuaded only); Ending Two Owen testifies |
| `ch9_night_visits` | list of npc ids | Ch9 consideration night | flavour only; each visit is a perspective |
| `ch10_names_learned` | list | Ch10, speaking to Alder Row residents | Ending One's administrative report shows those names as case lines; Ending Two's morning vignette shows those faces |
| `ch10_choice` | `accept` / `refuse` | Ch10 at the co-op office door | **the ending** |

### Derived values (computed, never displayed)
- `harm_count`: count of `ch2_collector_after=hit_again`, `ch3_slim_carried=false`, `ch3_lenny_method=pressed`, `ch4_roz=threatened`, `ch4_dutch_after=kept_going`, `ch6_pruitt_method=threatened`, `ch8_ray_after=continued`, `ch9_owen=threatened`.
- `take_count`: count of `ch3_deshawn_dive=accepted`, `ch4_envelope=taken` with `ch5_envelope_outcome ∈ {none, kept}`, `ch4_took_profit` (counts half, since it was criminal money).
- `jin_voice` = `restrained` (harm 0–1) / `mixed` (2–3) / `hard` (4+). Picks Jin's line variants and how others describe him. Never read by the ending.
- `bell_state` = `rung` if `ch8_ray_after=stopped`, else `ringing`. Presentation of the Ch9/Ch10 cards and Ending One's final sound.
- `alder_allies` = the people who appear in Ending Two's fight, built from meters (see Ch10).

### Relationship meters
Integer −3…+5, start 0. People-tab sentence bands: ≤−2 "cold", −1…0 "wary", 1–2 "warm", 3–4 "trusts you", 5 "would lie for you".

| Meter | Raised by | Lowered by | Read for |
|---|---|---|---|
| `hana` | each Ch1 week session finished (+1, max +2); `with_hana` (+2); `ch4_called_hana` (+1); Ch8 calling her after Ray (+1) | `alone` (no +2); `ch8_ray_after=continued` (−1) | Ch6 she brings the St. Agnes phone log (≥3); Ch9 night line; Ending Two: ≥3 she brings the Calder Ledger reporter to Alder Row |
| `teddy` | `forgave` (+2) / `asked` (+1); each mitts session (+1, max +2) | `blamed` (−1); `continued` (−1) | ≥2 Teddy works Jin's corner in Ch8; Ending Two gym |
| `lenny` | `patient` (+2) | `pressed` (−3) | ≥1 Lenny keeps the original tape and testifies in Ending Two; otherwise he's seen boarding a Greyhound in the montage |
| `slim` | `ch3_slim_carried` (+3) | knocked out (−2) | Ch10 ≥1 Slim drops his hands and stands with the residents |
| `deshawn` | `accepted` (+1); `refused`+`paid` (+2) | `refused` unpaid (−2) | ≥1 his Ray scouting in Ch8; ≥2 fights beside Jin in Ending Two |
| `mara` | each work shift (+1, max +3); staying on the boiler (+2); `confessed` (+1) | `left_repair` (−2); `kept` (−1 when the tin comes up short in Ch7); `continued` (−1) | ≥1 copy holder; ≥2 the Courts' truck blocks the vans in Ending Two; Ch9 night |
| `lucho` | each gym session (+1, max +2); `ch5_trained_kids` (+1) | `continued` (−1) | ≥2 fights beside Jin in Ending Two |
| `courts` (collective) | shifts (+1, max +2); boiler (+1); `ch5_meeting_stance=roof` or `heater` (+1); `ch7_truth_told_by=rook` (+1) | `left_repair` (−1); `kept` envelope (−1) | Ch7 how many residents turn on Jin; Ending Two who testifies |
| `okafor` | Ch2 visit (+1); Ch6 cemetery (+1) | — | copy holder (Ch8); Ending Two church supper |

Rook, Ray, Pike, Mo, Dutch, Celeste and Penner have **no meters**. What they think of Jin is read from flags.

---

## Evidence and memory registry

Journal → **Evidence** shows documents in a paper viewer (yellowed paper, typewriter or handwriting fonts, stamps). Journal → **Memories** is a film strip of frames: a fragment shows as grainy, half-developed frames until complete, then as a clean frame you can replay. Belongings (`bel_*`) live under Evidence → "Belongings" and have no evidential use, by design.

### Evidence
| id | Title | Where found | Text summary (what the viewer shows) | What it proves |
|---|---|---|---|---|
| `ev_chart_ahn` | Bed chart: AHN, DANIEL | Ch1 Room 214, clipboard at bed foot | "AHN, DANIEL. 31. Admitted 08/22/94. Hx: industrial accident (salvage), Calder Foundry, 08/20/94. Closed head injury. Responsible party: Calder Foundry Relief Fund (G. Pike)." | The official story |
| `ev_foundry_badge` | Foundry employment card (photocopy) | Ch1 week 3, Pike leaves it in the chart | "CALDER FOUNDRY & FORGE. AHN, DANIEL. Badge 4471. Pour floor. Hired 1985." | Paper was manufactured: the Foundry closed March 1992 (Hana's line) |
| `ev_fund_directive` | Relief Fund directive | Ch1 week 2, nurse station binder | "All correspondence and telephone contact for Fund patients is to be routed through the Fund. Visitors by prior approval only. — G. Pike, Administrator" | Someone controls his contact with the world |
| `ev_transfer_form` | Calder General transfer face sheet | Ch1 week 5, records room, box `TRANSFERS 94 Q3` | "Patient: SEO, JIN. DOB 03/14/68. NOK: SEO, MI-OK (mother), 412 Kessler Ave #3B. Dx: acute subdural hematoma, evacuated 08/20/94. Mechanism: blows to head, sanctioned bout, Calder Civic Arena. Transfer to St. Agnes LTC 08/22/94. Transport: private (H.F.D.)" | His identity was replaced after the fight |
| `ev_intake_whiteout` | St. Agnes intake sheet | same box | Admission #94-0822-3, name field in correction fluid reading AHN, DANIEL. Held to the window light, `SEO, JIN` shows through. NOK field whited out; "None" typed over. | Same admission, same day: a deliberate overwrite |
| `ev_returned_letter` | Jin's letter, returned | Ch1 week 6, Hana brings it | Jin's envelope to Mi-ok Seo, 412 Kessler #3B, stamped `RETURN TO SENDER — NOT AT THIS ADDRESS — UNABLE TO FORWARD` | His family is gone from the address |
| `ev_missing_flyer` | MISSING flyer | Ch2 Sung's Grocery, taped behind the register | "MISSING. JIN SEO, 26. Boxer. Last seen Calder General Hospital 8/22/94. He did NOT 'leave town.' Please call Min: 555-0143 (eves)." A photocopied photo of Jin in his track top. | His family searched, and did not believe the public lie |
| `ev_collector_card` | Outreach card | Ch2 Pratt Alley, Benny's coat | Front: "CALDER FOUNDRY RELIEF FUND — Patient Outreach." Back, in pencil: "L.V. Starlite. Thurs. Ask for the pinsetter." | Pike's collectors are paid through Lenny |
| `ev_lenny_tape` | Microcassette (partial) | Ch3 Lenny's lockbox | Hiss, then Dutch's voice: "...kid's in the van, back door, Pike's people take him Monday, new name, new everything..." [static] "...Harlan Street takes its end, the [static] get their number for the h[static]..." Lenny: "...I just want what I was promised." Dutch: "You got it. Now stop coming here." [ends] | The fight was manipulated by an organised operation that also moved and renamed him; someone else got "their number" (unclear until Ch7, when the cleaned-up line is replayed) |
| `ev_lenny_payslip` | H.F.D. payment slip | Ch3 Lenny's lockbox | "HARLAN FREIGHT DEPOT — Consulting — L. VOSS — $5,000.00 — 08/22/94 — approved D.B." | Lenny was paid by the depot two days after the fight |
| `ev_transport_log` | Dispatch log, Aug 1994 | Ch4 dispatch room | "08/20 23:52 Civic Arena dock B → Calder General ER, 1 pax, 'per D.B.'" / "08/22 06:10 Calder General → St. Agnes LTC, 1 pax, name per G.P., 'back door'" | The depot moved him and renamed him |
| `ev_book_ledger` | Book ledger | Ch4 records cage | "Castell/Seo 8/20 — position: Castell KO rds 3–5 — layoff through A.C. — gross $4.1M" | The forced result produced the payout |
| `ev_pike_payments` | Payments to G.P. | Ch4 records cage | Monthly "G.P. — Fund admin — $1,500" from Sept 1994 | Pike is on the depot's payroll |
| `ev_ncc_payments` | Payments to N.C.C. | Ch4 records cage | "N.C.C. — Foundry Cts acquisition — handled through A.C., see A.C. file" (no amount, no date); "N.C.C. — boiler, Bldg D — $22,400"; "N.C.C. — community room — $8,150"; "N.C.C. — repair crew wages (biweekly)" | Criminal money has legitimate destinations (Jin first reads it as a front). The purchase date and price are deliberately absent so Ch5 can deliver them |
| `ev_payroll_note` | Payroll envelope | Ch4 counting room | Manila envelope: "FOUNDRY CTS REPAIR CREW — PAYROLL 12/30 — D. FISK + 5 — $1,840" | Whose money it is (taken: the envelope itself; left: Jin's pencil copy of the label) |
| `ev_ac_wires` | Wire slips | Ch4 Dutch's office | "To: A.C. Holdings, Calder. Ref: Q4 remittance." | A financier exists above the depot (unexplained until Ch8) |
| `ev_courts_plaque` | Plaque text | Ch5 Foundry Courts gate | "FOUNDRY COURTS. Saved for the families of Northside by the Northside Community Council and the people who live here. September 30, 1994. 'We keep each other housed.'" | When: six weeks after the fight |
| `ev_courts_binder` | Ada's binder | Ch5 community room | Auction notice "Calder Foundry & Forge worker housing, 4 bldgs, sale Oct 1, 1994"; deed recorded 9/30/94, buyer N.C.C. Housing Trust, consideration "$640,000 cash" | The purchase price matches the depot payment |
| `ev_pike_call` | Overheard call (note) | Ch5 site office (only if `ch5_left_repair`) | Jin's note of Pike's words: "He's at the Courts, Walter. Living there. ... No, he doesn't know. ... Then you tell me what to do with him." | Pike reports to Rook |
| `ev_min_letters` | Min's letters (carbons) | Ch6 county storage, box 1 | Five carbon copies, March 1995–Jan 1996, to the Relief Fund, Calder General records, the State Athletic Commission, the police missing persons desk, and Channel 6 | The search, and how it was blocked |
| `ev_fund_replies` | Fund replies | Ch6 box 1 | Three letters on Relief Fund letterhead: "We have no record of a patient by that name. — G. Pike" | The organisation withheld his location |
| `ev_search_receipts` | Search receipts | Ch6 box 1 | Bus tickets to Pittsburgh, Cleveland, Buffalo; $600 to "Delmar Investigations"; $212 to Kwik Copy for flyers | The search consumed time and money |
| `ev_umma_paystubs` | Kessler Cleaners pay stubs | Ch6 box 2 | Doubles every Saturday and Sunday from Sept 1994 | Umma kept working through the search |
| `ev_eviction_judgment` | Housing Court judgment | Ch6 box 3 | "Kessler Avenue Realty v. Seo — possession granted — May 12, 1995" | How they lost 3B |
| `ev_housing_referral` | Emergency housing referral | Ch6 Housing Assistance Office | City file: Min's application (Nov 1995) "referred to N.C.C. Emergency Housing Fund"; N.C.C. reply "Under review — applicant #87 of 140" | Assistance was delayed and redirected (by scarcity, not malice) |
| `ev_lindell_complaints` | Tenant complaints | Ch6 Mrs. Pruitt | Three city complaints (Oct 2 1995, Dec 9 1995, Jan 20 1996): "rear exit chained", "space heaters in every room", "no smoke detector 2nd/3rd fl". Stamped "Referred — inspection not scheduled" | Unsafe conditions were known and unresolved |
| `ev_fire_report` | Fire report | Ch6 County Annex | Calder FD, Feb 11 1996, 02:40: "origin Rm 7, portable heater; rear exit chained; 3 fatalities: Seo, Mi-ok; Seo, Min-ji; Orr, Dennis." | How they died |
| `ev_pike_memo` | Pike to W.R., May 1995 | Ch6 Pike's office, the "W.R." folder | Typed: "The Seo girl has now written four times and visited Calder General records twice. She carries a photograph. If she reaches St. Agnes, the arrangement is exposed. Advise." Handwritten across the bottom: "Hold the line. Nothing changes. — W.R." | **Rook knew the family was searching and chose to keep the identity hidden** |
| `ev_pike_statement` | Pike's statement | Ch6 (optional) | Two handwritten pages naming Dutch, "W.R.", and "A.C.," dated and signed | A witness on paper |
| `ev_ncc_ledger` | Council ledger, 1994 | Ch7 bookkeeper's office | "9/28/94 Received: A.C. Holdings via H.F.D. — $640,000 — Purchase, Foundry Courts (W.R.)" | The negotiated share financed the Courts |
| `ev_exec_minutes` | Executive session minutes | Ch7 Council archive | "8/15/94. Exec. session. W.R. reports a one-time arrangement with outside partners to meet the 9/30 deadline. No further minutes taken at W.R.'s request." | Rook authorised it, before the fight |
| `ev_rook_calendar` | 1994 wall calendar | Ch7 Rook's office, behind the door | September 1994, the 30th circled twice, "640" in pencil, "AUCTION" on Oct 1 | The deadline |
| `ev_harlan_demand` | Harlan Street demand | Ch7 Rook's desk | Unsigned typed note: "The Alder Row matter needs the Council's endorsement and tenant lists by April 1. You owe us more than one favour." | The mafia has outgrown the agreement |
| `ev_rook_admission` | Rook's admission | Ch7 confrontation (testimony) | Summary card: "Authorised interference. Was told on fight night Jin was hurt badly. Let it continue." | Testimony to match the paper |
| `ev_penner_note` | Note to Ray, Aug 19 1994 | Ch8 Ray's locker (kept as insurance) | Ashgrove Capital notepaper: "Ray — the referee has been spoken to. Don't stop till it's done. Everything after is arranged. — L.P." | Penner gave the final instructions |
| `ev_alder_prospectus` | Alder Row prospectus | Ch8 Ray's gym bag | "Ashgrove Capital — Alder Row Redevelopment. Acquisition of the Alder Row Cooperative (24 units) closing April 18, 1997. Groundbreaking ceremony May 1, guest of honour Ray Castell." | The upcoming property transaction |
| `ev_ray_statement` | Ray's statement | Ch8 (only if `stopped`; given at dawn to Hana's reporter) | "I knew he was hurt. I kept going." | A witness against Penner |
| `ev_relocation_model` | Relocation model v7 | Ch9 floor 22 (only if `ch9_owen=persuaded`) | Printout: 24 households, "expected holdouts: 6", "enforcement window: 06:00–09:00, 4/18", "public face: J. Seo (TBC)" | Jin was the plan before he arrived |
| `ev_offer_folder` | The offer | Ch9 boardroom | Mercy Institute admission letter (start June 2, 1997, "PAID IN FULL"), Riverside Lofts lease, $4,000/month retainer, a three-fight route to a 1999 title shot, and a draft press release "KESSLER KID FOUND" | The benefits are real |

### Belongings (no evidential use)
| id | Title | Where | Text |
|---|---|---|---|
| `bel_dish` | Umma's casserole dish | Ch2 Mrs. Okafor | Pyrex, blue cornflowers, "SEO" on masking tape on the bottom. |
| `bel_track_top` | The blue track top | Ch2 Iron Pulse box | Collar, in marker: "PROPERTY OF THE CHAMP (allegedly) — M." Equipped automatically. |
| `bel_fridge_note` | Note from the fridge | Ch6 box 3 | "AFTER: Kessler Diner, window booth. Umma says last bus is 12:10 so WIN FAST. — M" A plastic strawberry magnet still stuck to the back. |
| `bel_shopping_list` | Shopping list | Ch6 box 2 | In Umma's hand, Korean and English: "rice 20 lb / eggs / navy thread / stamps (Min) / scallions / lottery?? NO." In Min's hand underneath: "lottery YES. one ticket. for science." |
| `bel_min_coat` | Min's winter coat | Ch6 box 2 | Charcoal wool. One navy button half-sewn, needle still threaded. |
| `bel_promo_clipping` | Newspaper clipping | Ch6 box 3 | The Ledger promo photo from Ch0, with "NOT HIM" written across the face in Min's red pen, and a heart. |
| `bel_scrunchie` | Yellow scrunchie | Ch6 box 1 | Smoke-gray at one edge. |

### Memory fragments
| id | Title | Where unlocked | What it shows | State |
|---|---|---|---|---|
| `mem_00_kitchen` | "Eat first" | Ch0 kitchen (auto) | The family at the table, the poster joke, the purse talk | complete |
| `mem_00_offer` | The coat | Ch0 Locker B (auto) | The camel coat on the bench, gloves on | complete |
| `mem_00_bottle` | Four seconds | fragment in Ch0 round 2; completed in Ch3 | Locker B: Lenny's taped wrist, the white bottle with red tape, "You're dry, kid. Drink." | partial → complete (Ch3) |
| `mem_00_bell` | The bell | Ch0 end | Canvas-level view, the bell ringing on, Ray's feet, the ropes | complete |
| `mem_01_waistband` | Umma's stitches | Ch1 sitting on the bed edge in week 2 | Umma sewing his trunk waistband the afternoon of the fight | complete |
| `mem_02_stairs` | Race you | Ch2 412 stairwell | Min racing Jin up to 3B, losing, claiming she let him win | complete |
| `mem_02_roof` | The roof | Ch2 412 roof (Sit) | Jin and Min on the parapet, sharing a soda, the Civic Arena's lights far off | complete |
| `mem_02_posters` | Twenty posters | Ch2 poster wall | Min making him sign twenty posters for the diner regulars | complete |
| `mem_03_corner` | "It's nerves" | Ch3 sitting on the Cellar stool between bouts | Corner after round 2 in 1994: Teddy's face close, Lenny's "Send him." | complete |
| `mem_04_backdoor` | Back door | Ch4 garage bay, the old private ambulance | Stretcher-level view: a garage ceiling, a voice: "Back door. Dutch said back door." | complete |
| `mem_05_thread` | Navy thread | Ch5 Ada's sewing machine | Umma biting off a thread, holding the trunks up to the light | complete |
| `mem_06_booth` | The window booth | Ch6 Kessler Diner booth (Sit) | A night that never happened, rendered as Min imagined it in the note: three plates, rain on the window. Shown only as an empty booth with three cups. | complete |
| `mem_07_row_k` | Row K | Ch7 Rook's admission | The fight from Row K: a flat cap in the foreground, unmoving | complete |
| `mem_08_reel` | The whole round | Ch8 after Ray (auto) | The complete Chapter 0 round 3, uncut, including the four seconds | complete |

---

## Progression

Three separate tracks, as the PDF requires: **physical control** (rehab, practice, use under pressure), **knowledge and access** (evidence opens places and accusations), and **relationships and consequences**. None of them can buy another.

### Combat skills (all unlocks happen in play, with an in-story reason)
| Chapter | Unlocked | How, in story |
|---|---|---|
| 0 | Jab, cross, guard, basic slip; full-speed movement | Prime Jin. Teddy's mitts warm-up teaches each one in motion. *All removed at the end of Ch0.* |
| 1 | Walk → jog → run; jump (short hop only, then full in week 6) | Rehab weeks with Hana. No punching in Ch1. |
| 2 | Jab–cross (his hands remember); forward and back dash (1 charge); slip vs. slow committed attacks; **knuckles** (equipment: +stagger, +damage) | The alley. His timing returns under pressure; the knuckles fall out of Benny's coat. |
| 3 | Second dash charge; **hook**; first reliable **slip → counter-cross** | Slim's (or Lolo's) heavy-bag lesson in the Pit (hook); the slip-rope plus bout 2 against Ike (counter). The PDF: through practice and encounters, not a recovered memory. |
| 4 | **Uppercut** (launch lighter thugs); **air dash**; backdash → returning cross | The depot teaches by necessity: light thugs who duck his hooks (the third duck prompts "*Get under him.*" and the uppercut), catwalk gaps that need an air dash, and Dutch, who punishes anyone who only retreats (backdash → returning cross). |
| 5 | **Dash straight**; **flurry** | Lucho's mitt work in the Boiler Room Gym ("Hit right, not hard"). |
| 6 | Nothing new | "By now, the player can have the full core combat toolkit." Ch6's short fights test the full set. |
| 7–10 | Nothing new; mastery | Ch8 is the full-system test; Ch9 the endurance test; Ch10 the test of purpose. |

**Breath (not a bar).** Jin's injury is shown in the body. After ~6 s of continuous close exchange (≤64 px from an enemy, attacking or being attacked), his shoulders heave (an idle overlay), dash recharge slows from 0.6 s to 0.9 s, and punch recovery gains +0.03 s. It resets after 2 s without contact. Conditioning raises the threshold. This is the PDF's "extended exchanges exhaust him," and it rewards the canon rhythm of hitting in brief openings and then repositioning.

### Training (menu unlocks in Ch1; drills, levels and caps)
Training is never compulsory between scenes: no story gate checks a training level. Each level is one **execution test** (not a grind) passed once.

| Track | Drill (engine activity) | Where | L1 / L2 / L3 effect | Cap by chapter |
|---|---|---|---|---|
| Movement & balance | balance beam | St. Agnes gym, later any gym | landing recovery 0.10 → 0.08 → 0.06 s | L1 Ch1, L2 Ch3, L3 Ch5 |
| Controlled footwork | footwork marks | St. Agnes gym, Iron Pulse, Boiler Room Gym | dash recharge 0.60 → 0.56 → 0.52 s | L1 Ch1, L2 Ch3, L3 Ch5 |
| Reaction | reaction pads (Hana's 4-bulb board) | St. Agnes gym, Pit, Boiler Room Gym | slip evade window 0.06 → 0.065 → 0.07 s | L1 Ch1, L2 Ch3, L3 Ch5 |
| Conditioning | conditioning laps | St. Agnes garden, Courts courtyard | breath threshold 6 → 7 → 8 s | L1 Ch1, L2 Ch4, L3 Ch6 |
| Heavy bag | heavy bag combos | Iron Pulse (after hours), Pit, Boiler Room Gym | stagger +5% / +10% / +15% | L1 Ch2, L2 Ch4, L3 Ch6 |
| Mitts | mitt work (Teddy or Lucho) | Iron Pulse, Boiler Room Gym | combo window +0.02 / +0.03 / +0.04 s | L1 Ch2, L2 Ch5, L3 Ch6 |
| Slip-rope | slip-rope | Pit, Boiler Room Gym | counter window 0.30 → 0.33 → 0.36 s | L1 Ch3, L2 Ch5, L3 Ch6 |

Caps are hard. The drill menu writes the reason in Jin's thought when a cap is hit: "*That's as far as this body goes this month.*" Training never adds health and never restores what the injury took. It improves control of the body he has.

### Money
Money shows only as a small cash figure in the Journal, never on the HUD. **It can never buy the recovery package.** That is established in Ch1, when Hana shows Jin the Mercy Institute price sheet ("Comprehensive Neurological Rehabilitation, 24-month residential: $186,400"), and every money screen keeps the honest scale: the most a careful player can hold at once is about $2,500.

| Sources | Amount |
|---|---|
| Ch2 shovel Sung's sidewalk | $10 |
| Ch3 Cellar purses | $60 / $90 / $150 (bout 3 is $150 either way; Mo pays the "winner") |
| Ch4 criminal profit stacks (optional) | $600 |
| Ch4 payroll envelope (optional, belongs to Darnell's crew) | $1,840 |
| Ch5–7 Foundry Courts work shifts | $25 per shift, up to 6 shifts |
| Ch5 Gus's store deliveries (optional) | $8 per run, up to 3 |
| Ch8 Iron Pulse mopping for Teddy (optional) | $15 |

| Sinks | Cost | What it does |
|---|---|---|
| Bus fare | $1 | Fast travel by bus between unlocked districts (walking is free) |
| Teddy's clippers | free | Haircut (cosmetic, Ch2) |
| Kessler Diner meal | $4 | A sit scene with a different thought each chapter |
| Doc Ferris (back-room physio, Ch4+) | $40 | Clears one chapter's "sore" overlay; comfort only, no stat |
| Pay Deshawn's docked purse | $200 | Deshawn +2 |
| Foundry Courts meeting donation | any | courts +1 at ≥ $50 |
| Return the envelope (Ch5) | $1,840 | Darnell's crew is paid |
| Calder Arms Hotel room | $45/week | Ch8–9 lodging if he leaves the Courts |
| Flowers, Calder Municipal | $6 | Laid on the graves in Ch6; stay there on later visits |
| Kwik Copy | $1 per envelope | Copies of the evidence (Ch8 dawn) |
| Funeral marker (Ch6, optional, St. Brigid's) | $300 | Replaces the county markers with a small stone reading SEO MI-OK 1942–1996 / SEO MIN-JI 1972–1996. Visible in both endings. |

### Difficulty
Three settings, named for Jin's condition rather than skill: **Steady**, **Standard**, **Raw**. They scale only how fast Jin's condition recovers between exchanges (regen delay 1.5 / 2.5 / 3.5 s) and how much a hit costs him. Enemy patterns, timing windows and story never change. Checkpoints are frequent on all settings, and retrying costs a few seconds.

---

## World map: Calder, 1994–1997

The map in the Journal is drawn as a folded city map: river (the Calder) running diagonally, districts as labelled blocks, and unlocked places as small hand-drawn icons. Locked places don't appear at all; they're not teased.

| Place (id) | District | Unlocks | How it changes later |
|---|---|---|---|
| Apartment 3B, 412 Kessler Ave (`kessler_3b`) | Eastgate | Ch0 | Ch2: the Rivera family lives there; Jin can't enter. Ending Two: still theirs; a child's drawing in the window. |
| Kessler Avenue (`eastgate_kessler_ave`) | Eastgate | Ch0 (1994), Ch2 (1996) | 1994 golden late summer, the fresh poster, Min's diner; 1996 sleet, the buried poster, "UNDER NEW MGMT" diner, the gray van; Ch6 snow, Jin knows everyone's story; Ending Two spring, Jin's rented room above Sung's |
| Marsh Boxing Club → Iron Pulse Fitness (`marsh_bc` / `iron_pulse`) | Eastgate | Ch0 / Ch2 | 1994 ring, ropes, Teddy's office; 1996 neon, Stairmasters, the ring gone, a ring-shaped rectangle of brighter floor where it stood. Jin's base Ch2–4. |
| Calder Civic Arena (`civic_arena`) | Downtown riverfront | Ch0, again Ch8 | 1994 sold out; 1997 dark, dust in the light beams, the same bell. Ending One full again. |
| St. Agnes Long-Term Care (`st_agnes_*`) | Bellhaven Hill | Ch1 | Ch9 night: Hana's night shift, the maple bare. Ending Two: Hana's referral desk. |
| Pratt Alley (`eastgate_pratt_alley`) | Eastgate | Ch2 | Ch6: the van gone, a new poster where the knuckles fell |
| Starlite Lanes / The Cellar (`starlite_*`, `the_cellar`) | Southside, Route 9 | Ch3 | Ch8: Deshawn there for scouting. Ending Two: Mo's chalkboard still lists "THE GHOST — ???" |
| Harlan Freight Depot (`depot_*`) | Harlan Street docks | Ch4 | Ch7: chained and quiet (if Dutch kept_going, police tape). Ch10 the trucks leave from here. |
| Foundry Courts (`foundry_*`, `courts_*`) | Northside | Ch5 | Ch6: Jin's home base, Mara's chalk wall becomes the timeline board. Ch7: after the truth, Rook's photo face-down in the community room; Gus's store closes early; graffiti "WHO PAID?" painted over by morning (Mara). Ch9 night: courtyard bonfire. Endings differ. |
| Calder County Annex (`county_annex`) | Civic Center | Ch6 | — |
| Garrison Street & Lindell House ruin (`garrison_street`, `lindell_ruin`) | Southside | Ch6 | Ending Two: a city inspection notice on the new boardinghouse two doors down (the inspection happens now) |
| Calder Housing Assistance Office (`housing_office`) | Civic Center | Ch6 | — |
| Relief Fund office (`relief_fund_office`) | Downtown | Ch6 | Ch7+: "OFFICE CLOSED" sign; Pike gone |
| Calder Municipal Cemetery (`cemetery`) | Riverside | Ch6 | Flowers persist if laid; the stone if bought; Ending One: Jin never visits again (a single shot of snow on unvisited markers); Ending Two: he visits with Mrs. Okafor |
| Kessler Diner (`kessler_diner`) | Eastgate | Ch2 (exterior), Ch6 (interior) | Ending Two: Jin eats at the window booth |
| Council HQ, the old Local 1180 Hall (`council_hall_*`) | Northside | Ch7 | Ch9 night: Rook alone in the main hall. Ending Two: Council under new interim leadership (Ada) |
| Calder Arms Hotel (`calder_arms`) | Downtown | Ch7 end (if he leaves the Courts) | — |
| Castell Champions Gym (`castell_gym`) | Downtown | Ch8 | Ending Two: closed, a lease sign |
| Kwik Copy (`kwik_copy`) | Downtown | Ch8 dawn | — |
| Ashgrove Tower (`ashgrove_*`) | Downtown financial row | Ch9 | Ending One: Jin's photo in the lobby |
| Alder Row (`alder_row_street`) | West End canal | Ch9 night (walk-by only, no entry to buildings) → Ch10 | Endings: emptied and boarded (One) / occupied, the lamp back in the window (Two) |

**Travel.** Inside a district, streets connect by walking (walk-through transitions). Between districts: the bus stop sign (pick an unlocked district; a 2 s ride vignette with the city sliding by in parallax), or the world map from the Journal while outdoors and not in a scene. Fast travel is disabled during scenes, chases and hostile areas, and the menu says why.

---

# Chapter 0 — One More Round

**Date/time.** Saturday, August 20, 1994, 4:30 PM to 11:50 PM. Eastgate, then Calder Civic Arena.
**Mood.** Warm, crowded, funny, proud, then wrong. The happiest chapter in the game; the player should want to stay in the kitchen.
**Palette and weather.** Late-summer gold: amber light through windows, dust motes, sun-bleached brick, Min's yellow scrunchie as the brightest small colour. A humid haze with cicadas. A thunderstorm rolls in during the fight, heard as rain on the arena roof only once sound starts to fail in round 2. The arena itself is the only saturated place in the game: four hot white ring lamps over a red and blue ring, black crowd tiers pricked with flashbulbs.

**Gameplay identity.** *Feel what he had.* A short, warm walk through home, a warm-up that teaches the four core verbs in motion, and a three-round title fight that becomes impossible on purpose.
Share: exploration 20% · dialogue 25% · combat 40% · cutscene 15%. Target length **15 min**.

## Locations

**`kessler_3b` — Apartment 3B, 412 Kessler Avenue** (1120 px)
Left to right: **Jin's room** (mattress on the floor, a jump rope on a nail, a box fan in the window, a taped-up poster of an unnamed 1970s middleweight, his gym bag packed by the door) → **hallway** (photo frames: Jin's first amateur trophy, Min's high-school graduation, a black-framed photo of their late father, 1979) → **bathroom door** with a sock tied around the knob (the lock is broken; the sock means "occupied") → **kitchen** (stove, rice cooker, a three-chair table, a fridge with a notepad and a red plastic strawberry magnet, a sugar jar with the corner of a pink paper sticking out from under it) → **living room** (Umma's black Singer sewing machine at the window, a TV with rabbit ears showing Channel 6's fight promo, a couch with a crocheted blanket) → front door.
*Lighting:* low gold sun from the right-hand windows, long shadows left. *Sound:* box fan, TV, the rice cooker, Kessler Avenue below (bus brakes, kids, an ice-cream truck once).
*Exits:* front door → `kessler_stairwell_1994`.

**`kessler_stairwell_1994`** (360 × 720, three landings)
Mrs. Okafor's door 3A (a straw wreath, a welcome mat reading BLESS THIS HOME) opposite 3B; a window on each landing; the street door at the bottom.

**`eastgate_kessler_ave_1994` — Kessler Avenue** (1800 px)
Left to right: 412 stoop → **Sung's Grocery** (fruit crates outside, Mr. Sung on a stool) → laundromat → **poster wall** (the fresh championship poster at eye level, beside a church bake-sale flyer) → **Kessler Diner** (neon EAT, Min's workplace) → bus stop → **Marsh Boxing Club** (a hand-painted sign with a red glove).
*Lighting:* golden hour, sun low at the far right, everyone's shadow pointing left toward home. *Sound:* a radio playing the pre-fight show from the diner, cicadas, kids.

**`marsh_bc` — Marsh Boxing Club** (1000 px)
Front desk with Teddy's dusty trophies → a row of three heavy bags → the raised ring (300 px wide) → Teddy's office (a calendar with AUG 20 circled in red, "CASTELL" written beside it) → locker door. Shafts of light through high factory windows; a ceiling fan.

**`civic_backstage` — Calder Civic Arena, service corridor** (1400 px)
Left to right: **Loading Dock B** (a roll-up door; a sign `DOCK B — NO PUBLIC ACCESS`. Remember it: Ch4's transport log names it) → commission table (the inspector checking gloves) → hot-dog vendor's cart parked in the hall → **Locker Room A** (Castell; gold star tape on the door, laughter inside) → **Locker Room B** (Seo; a strip of masking tape with SEO in marker) → the tunnel mouth.
Cool fluorescent light; the crowd as a sea-roar through concrete.

**`civic_locker_b` — Locker Room B** (640 px)
Bench, six lockers, a mirror ringed with bulbs (two dead), a sink, a rubbing table, one fluorescent tube that flickers every 7 s.

**`civic_tunnel`** (1200 px)
Dark concrete. The arena light is a white rectangle at the right end that grows as Jin walks. The crowd volume ramps with x; the ring announcer's voice echoes in.

**`civic_ring` — the arena floor** (1280 × 540)
The ring is 520 px wide, centred. **Jin's corner is the blue corner, left.** Ray's is the red corner, right. At ringside below Jin's corner sits the **timekeeper's table with the brass bell (chipped lip)**. Crowd tiers rise behind. **Row 6**, left of centre: Umma and Min. **Row K**, high on the left: a man in a flat cap who stays seated. **Press row**, ringside right: at its end, by the aisle, a camel coat.

## NPCs present
| id | Where | Idle | Key lines / barks | Reacts to |
|---|---|---|---|---|
| `umma` | 3B kitchen stove, later the sewing machine | `cook/work at counter`, then sewing | "Eat first. Then be famous." / "How will you get home?" | `ch0_purse_dream` reply |
| `min` | Sitting on the kitchen counter; later walks with Jin; Row 6 | sits on counter, `point` with the newspaper | "This is a man who sells aluminium siding." / "Win fast. The bus." | everything; she has a comeback for every option |
| `okafor` | Stairwell, door 3A | hand on her door frame | "Knock him down, then come home safe. In that order." | — |
| `sung` | Stool outside Sung's Grocery | sitting, fanning with a newspaper | bark: "Kessler Kid! Bring back the belt!" | — |
| `teddy` | Marsh BC ring with mitts; the drive; corner | arms crossed / mitts up | "Hands up, chin down, feet under you. That's the whole religion." | `ch0_told_teddy` |
| `hector` | Marsh BC ring (sparring partner) | bouncing in a red headguard | bark: "Easy, champ, I got kids." | — |
| `lenny` | the drive (back seat); Locker B; corner | rubbing his neck; taping | "Big night, kid. Big night." | — |
| `inspector` | backstage commission table | `write at desk` | bark: "Gloves, Seo. Then go be famous." | — |
| `ray_1994` | passes in the corridor; red corner | slow showman's walk | "Good luck, kid. I mean it. Make it a fight." | — |
| `camel_coat` | Locker B (scene), press row | sitting on the bench edge | see scene | `ch0_refusal_line` |
| `referee` (Phil Ostrowski) | ring | arms out | "Protect yourselves at all times." | — |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i0_gym_bag` | Gym bag | "*Wraps, mouthguard, the trunks Umma's still fixing. Everything I need is in this bag or in that kitchen.*" | — |
| `i0_photo_appa` | Photo: Appa, 1979 | "*He'd have hated the noise tonight. He'd have come anyway.*" | — |
| `i0_bathroom_sock` | Sock on the doorknob | "*The lock's been broken since Christmas. The sock is the lock.*" | sets up the `new_apartment` option |
| `i0_sugar_jar` | Sugar jar | A pink paper under the jar: "FINAL NOTICE. Balance past due: $1,140. Kessler Avenue Realty." Jin: "*Two months. Min says three.*" | — |
| `i0_singer` | Sewing machine | "*Umma's machine. It's older than me and better maintained.*" | — |
| `i0_tv` | TV | Channel 6: "Tonight! Castell–Seo! The Crown versus the Kessler Kid!" A clip of Ray hitting a pad. Jin: "*He drops nothing. He tells you with his left hand first, though.*" (a quiet hint at the chin tap) | — |
| `i0_fridge` | Fridge | After the kitchen scene: the note Min wrote, under the strawberry magnet: "AFTER: Kessler Diner, window booth. Umma says last bus is 12:10 so WIN FAST. — M" | (found again in Ch6) |
| `i0_poster` | Championship poster | "CONTINENTAL MIDDLEWEIGHT CHAMPIONSHIP — RAY 'THE CROWN' CASTELL vs. JIN 'THE KESSLER KID' SEO — SAT AUG 20 — CALDER CIVIC ARENA." Min: "I put up forty of these. You owe me forty favours." | `mem_02_posters` is staged here in Ch2 |
| `i0_teddy_calendar` | Teddy's calendar | AUG 20 circled in red. Every Sunday in July reads "roadwork 6am — J." | — |
| `i0_dock_b` | Dock B door | "DOCK B — NO PUBLIC ACCESS." A gray van's nose is visible through the window. | (remembered by Ch4) |
| `i0_bell` | Timekeeper's bell | Not interactable in Ch0. It's just there, lit, at the edge of every ring shot. | — |

## Quests (HUD objective text)
- **Main: "One more round."** Objective sequence: `Get ready. Eat with your family.` → `Walk to the gym with Min.` → `Warm up with Teddy.` → `Get your hands wrapped.` → `Walk out.` → `Win the title.` (this objective never completes; it fades out during round 3).
- No optional quests in Ch0. Optional examines only, so the chapter stays tight.

## Scripted scenes (beat by beat)

### 0.1 Cold open — "Ding"
1. Black. **A boxing bell rings once**, clear and close. Hold 1.0 s of silence.
2. Sound bridge: the bell's ring bends into the **"ding" of a rice cooker**. Fade up over 0.8 s on the 3B kitchen, camera at 1.2 on the cooker's lid steaming. Title card over the steam, small, bottom left: `August 20, 1994 · Eastgate, Calder`.
3. Camera eases out to 1.0 and pans left to find Jin in his room, sitting on the mattress edge wrapping nothing: practising the wrap pattern on bare hands. The player has control. Objective fades in: `Get ready. Eat with your family.`

### 0.2 The kitchen (key scene; thin letterbox, then full)
Trigger: Jin enters the kitchen.
- Staging: Umma at the stove (back to us), Min sitting on the counter swinging her legs with the Calder Ledger sports page. Jin stands between them. Two-shot of Min and Jin at 1.15, with Umma at the frame edge.
- **Min:** "Okay. Important question. Who is this?"
  *She holds up the paper. Camera to 1.45 on the clipping: a grainy photo of a square-jawed man under the headline* `SEO: "I'M READY."` *Hold 1.2 s.*
- **Jin:** "That's me."
- **Min:** "That is a man who sells aluminium siding. They airbrushed you into a different person. Look at his chin. You don't have that chin."
- **Umma** *(not turning around)*: "He has my chin."
- **Min:** "Umma, nobody has that chin."
- **Umma:** "Jin-ah. Sit. Eat first. Then be famous."
  *Jin sits; camera eases to 1.0 to hold all three. Umma sets down a bowl and stays standing, her hands folded at her waist: her worried pose.*
- **Umma:** "How will you get home? The last bus from the Civic is twelve-ten. If it goes long—"
- **Jin:** "It won't go long."
- **Umma:** "Teddy drives like an old man. You'll miss the bus."
- **Jin:** "I'll take a cab, Umma. I'll have money for a cab."
- **Min:** "He'll have money for a *cab company*."
- **Umma:** "A cab is eight dollars." [beat] "Eight dollars."
- **Min:** "So. Forty thousand dollars. Minus Teddy's third, minus Lenny's little cut, minus the government's giant cut. What's it for, champ?"
- **Choice `ch0_purse_dream`** (no timer):
  - **"The rent. All of it. Every month we're behind."** → `rent`. *Umma glances at the sugar jar.* **Umma:** "We are only two months behind." **Min:** "Three." **Umma:** "Two and a half."
  - **"Umma stops working Saturdays."** → `umma_shifts`. **Umma:** "Who will hem Mrs. Okafor's church dresses? She trusts nobody." **Jin:** "Mrs. Okafor can hem." **Umma:** "Mrs. Okafor *cannot* hem."
  - **"A new place. With a bathroom lock that works."** → `new_apartment`. **Min:** "*A lock.* He listens. He actually listens."
- **Min** *(any option)*: "You paid my fall tuition with your last fight. So tonight's cab is on me. That's the deal. That's how this family works." *She hops off the counter, tears a sheet off the fridge pad and writes, back to camera.*
- **Umma:** "Stand up. Hold still." *She has his navy trunks; the waistband is half re-sewn.* **Interaction prompt: `Hold still`** (the player releases all keys; if the player moves, Umma says "Ya. Still." and waits). Camera to 1.3 on her hands; 3 s of sewing; she bites the thread. *This is `mem_00_kitchen`'s last frame and the source of `mem_01_waistband`.*
- **Umma:** "Don't let them hit your face. I just fixed your face."
- Min slaps the note onto the fridge with the strawberry magnet, and the camera does not go to it. (The player can examine it. Most won't, which is fine; Ch6 will find it for them.)
- Objective: `Walk to the gym with Min.`

### 0.3 Stairwell and Kessler Avenue (walk-and-talk, thin letterbox, player in control at walk speed)
- Mrs. Okafor opens 3A as they pass: "Knock him down, then come home safe. In that order." She touches two fingers to Jin's forehead.
- Kessler Avenue at golden hour. Min walks beside Jin (a follower who matches his pace; if the player runs ahead, she calls "I'm in *clogs*, Jin" and the letterbox holds until she catches up).
- Barks fire as they pass: Sung: "Kessler Kid! Bring back the belt!" / a diner regular: "Knock his crown off!" / two kids shadowboxing on the stoop: "I'm Seo! No, I'm Seo!"
- At the poster wall Min stops on her own. **Min:** "Forty of these. I put up forty. You owe me forty favours." **Jin:** "Name one." **Min:** "Win fast. The bus."
- At the diner she peels off: "Window booth after. I'll save it. Umma's bringing the thermos." She walks backward into the diner, pointing at him until the door closes. That is the last time the player sees Min up close and in colour.

### 0.4 Warm-up at Marsh BC (playable, teaching in motion; no tutorial menu)
- Teddy waits in the ring with mitts. Camera at 1.1 on the ring, framed so the light shafts cross it.
- Teddy calls each verb; his words are the prompt, and a small key glyph appears beside the bubble only on the first call:
  1. **"Jab."** (×3 on the left mitt) → **"Again. Snap it back."**
  2. **"One-two."** jab–cross (×3) → **"Turn the hip on the two. There it is."**
  3. **"Hands up!"** Teddy swats with the right mitt in slow motion; hold **guard**. → **"Chin down. Feet under you. That's the whole religion."**
  4. **"Slip."** Teddy throws a slow, telegraphed mitt hook (wind-up 0.5 s); the player **slips** inside the 0.06 s window. On a successful slip the counter window opens, and Teddy says **"Now. Make me pay."** for a counter-cross. Misses get "Early." / "Late." and a retry with no penalty.
- **Spar with Hector (45 s, no damage to either):** Hector throws telegraphed jabs and one big right. Here the player feels prime Jin: full run speed, crisp hit-stop, crowd-less gym echo. Teddy at 30 s: **"Okay. Save it. Save it for him."**
- If the player stays and hits the heavy bags, Teddy lets them (no limit), and after 20 s says "You're gonna leave it in here, kid."

### 0.5 The drive (vignette, full letterbox, 40 s)
- Side view of Teddy's maroon '84 Buick moving right along the river road; parallax streetlights sweep **amber bars** across the car every 0.7 s; the Civic Arena glows ahead, growing.
- **Lenny** (back seat, tackle box on his knees): "Big night, kid. Big night."
- **Teddy:** "You don't talk to the press. You don't talk to Castell's people. You don't talk to anybody but me."
- **Lenny:** "Who's he gonna talk to, Ted? He doesn't talk." (He laughs a little too long.)
- Breath cut to the backstage corridor on the sound of a roll-up door.

### 0.6 Backstage corridor (playable)
- Objective: `Get your hands wrapped.`
- Ray Castell's group comes out of Locker Room A as Jin passes: two cornermen, a manager in a gray suit, Ray in the white and gold robe. Ray stops and the camera goes to a two-shot at 1.2. **Ray:** "Good luck, kid. I mean it. Make it a fight." He taps his gloves together twice and walks on. (Replayed in Ch8 memory, the line sounds different.)
- The commission inspector stamps Jin's gloves.

### 0.7 Locker Room B — the offer and the four missing seconds (key scene)
1. Lenny wraps Jin's hands on the bench. **Interaction `Hold still`**: camera at 1.35 on hands. Lenny's wrist carries the tape-roll bracelet; his own hands shake slightly as he tapes (a 1 px tremor). Teddy: "Gloves, commission, back in five." He leaves. **Lenny:** "I'll get ice." He leaves.
2. Jin is alone, wraps on, gloves on the bench. The player can shadowbox in the mirror; the flicker of the tube every 7 s is the only rhythm.
3. The door opens without a knock. **The man in the camel coat.** The camera does *not* cut to him; he walks into the existing frame from the left and sits on the far edge of the bench, gloves on. Full letterbox slides in.
4. **Coat:** "Mr. Seo. Don't get up. I'm not anyone. I'm the kind of person who's in a lot of locker rooms."
   [beat]
   **Coat:** "I'm going to give you some practical advice, and then I'll leave, and you'll never see me again. Fifty thousand dollars. Cash, tonight, in your trainer's car. You go four rounds, you show this town your heart, and you go down, honourably, in the fourth."
   **Coat:** "Your purse is forty, win or lose. Less your trainer, the commission, the taxman. Win and you're a champion with a landlord. Take this and your mother never works another Saturday. That isn't a bribe, son. That's arithmetic."
   *(If `ch0_purse_dream` = `rent`: "...and the rent's paid till Christmas of next year." / `umma_shifts`: "...your mother never works another Saturday." / `new_apartment`: "...a building with a doorman, if you like. Locks that work.") The camera holds Jin's back: he hasn't turned around. The player sees the coat only in the mirror.*
   **Coat:** "Castell's been champion three years. Men like him don't lose to men like you on nights like this. I'm offering you the guaranteed money instead of the risk. I've watched a lot of young men be brave for one night and poor for forty years."
5. **Choice `ch0_refusal_line`** (all three refuse; the PDF says Jin refuses):
   - **"I'm not for sale."** → `not_for_sale`
   - **"My family's in row six. I'm not losing in front of them."** → `my_family`
   - **"Get out of my locker room."** → `get_out`
6. **Coat** *(stands, smooths his gloves)*: "Then I hope you're as good as they say. Truly." He leaves. The door's pneumatic closer hisses for 2 s. [beat] Silence; the tube flickers.
   Journal: `mem_00_offer`.
7. The door opens again. Lenny backs in with an ice bucket, talking before he's through: "Kid, you look pale, you're dry—" **HARD CUT.** No fade, no sound bridge: the music, room tone and flicker phase all jump. **Four seconds are missing.**
8. The new frame: Teddy in the doorway saying **"Time."** Jin is standing, **gloves now laced on his hands** (they were on the bench a moment ago). Lenny is at the sink with his back turned, running the tap. Nothing comments on it. An observant player will notice the gloves.

### 0.8 The tunnel (playable walk, then reveal)
- **Teddy** (walking beside Jin, hand on his shoulder): "Anything you need to tell me before we walk?"
- **Choice `ch0_told_teddy`:**
  - **"A man in a camel coat offered me fifty to go down in four."** → true. Teddy stops walking and looks at Jin for a beat. **Teddy:** "Every title fight has a guy in a coat. We win anyway. That's the answer to the coat." *Behind them, Lenny rubs his neck.*
  - **"No. Let's go."** → false. **Teddy:** "Good. Chin down."
- The player walks right through 1200 px of dark. The crowd swells with every step; the announcer's voice arrives in fragments: "...from Eastgate... Calder's own... the KESSLER KID—"
- **The reveal:** at the tunnel mouth, the camera pulls out from 1.0 to **0.8** over 2.5 s while Jin keeps walking. The arena opens: the white lamps, the ring, flashbulbs. The player has 4 s to *look* before the auto-walk to the ring: **Row 6**, Umma standing with both hands at her mouth and Min holding a white sign `KESSLER KID` with the yellow scrunchie bright beside it; **Row K**, a flat cap, the only person seated; **press row's end**, a camel coat. No callouts, no highlights. The composition places each one on a third.
- Jin climbs through the ropes (auto). Ray enters from the right tunnel. Centre ring, **referee:** "Protect yourselves at all times. Touch 'em." Ray taps his gloves twice and touches Jin's.

## Encounter: the championship (3 rounds; the sabotage)

Ring rules: rounds have a small clock top-centre (rounds are compressed to 75 s of game time). The HUD shows only Jin's condition and the round clock; no dash pips (no dash in Ch0). The bell is a real sound object at the timekeeper's table, and every bell in this fight is that one bell.

**Ray Castell (1994): pattern boss.**
- *Double-jab probe:* two quick jabs. Slip either to counter.
- *Chin tap → straight right:* he taps his chin with the left glove (0.35 s, readable), then throws a long straight right. The best counter window in the fight.
- *Body hook:* when Jin holds guard high for more than 1 s, a hook to the ribs that ignores guard. It teaches that guard isn't a wall.
- *Clinch-push:* at close range for 2 s he ties Jin up and walks him to the ropes.
- Ray resists stagger (boss rule) and cannot drop below 55% in Ch0.

**Round 1 — prime Jin (playable, 75 s).** Jin is at full power: full speed, crisp hit-stop, every counter lands with a heavy flash. The crowd chants `KES-SLER! KES-SLER!` when the player lands a counter. The player should *win this round* and feel it. Bell (clear, dry).

**Corner 1 (scripted, 12 s, full letterbox):** Teddy: "You're winning the round and you know it. Quit showing off." Lenny holds the clear corner bottle to Jin's mouthguard (an ordinary bottle; the red-taped one is never in the ring). From Row 6, Min's voice cuts through: "WIN FAST!"

**Round 2 — wrong (playable, 75 s; cannot be lost).**
- 0:20 into the round, over 6 s: audio low-passes until the crowd is underwater; a heartbeat fades in; rain starts on the roof (the first time the player hears the storm). Jin's walk speed −35%; movement input latency +80 ms; slip window 0.06 → 0.04 s; punch damage −40%. His idle overlay starts to sway.
- The world shows the block, and the thought names it: **Jin (thought):** "*My legs. Why are my legs—*". A small icon of a crossed foot appears beside the condition bar for 3 s.
- 0:45: **the interrupted recollection.** Freeze frame 0.25 s; memory filter; a 0.9 s flash of Locker B from a new angle: a hand with a taped wrist holding a **white squeeze bottle with a red tape band** toward the camera, Lenny's voice: "You're dry, ki—". Cut back hard on the impact of a Ray jab. Journal: `mem_00_bottle` (partial; 3 grainy frames).
- If Jin's condition reaches zero in round 2, he's *saved by the bell*: the bell rings early, the referee steps between them, and the game never shows a game-over here. Ray's damage in round 2 is still real, so good play still shows.

**Corner 2: "Something's wrong" (scripted, full letterbox; the PDF beat).**
Camera at 1.3 from behind the blue corner post: Jin on the stool, Teddy kneeling in front of him, Lenny behind with the towel. Sound: all voices low-passed; Teddy's arrives late, as if through water.
- **Jin:** "Teddy. Something's wrong."
- **Teddy:** "What?"
- **Jin:** "My legs. I can't— I can't hear you right."
- **Teddy:** "It's nerves, kid. Big night. Breathe. Breathe with me."
- **Lenny** *(fast, over Teddy's shoulder)*: "He's fine, Ted. Look at him. He's fine. Send him."
- [beat: Teddy looks at Jin. The camera holds Teddy's face for 1.5 s; no face, only the head tilting.]
- **Teddy:** "One more round. Win it or I stop it myself."
- The stool is pulled out. Jin stands. **The camera stays on the empty stool for 1.0 s** after Jin leaves frame. (`mem_03_corner` will return to this exact frame.)

**Round 3: the fall (playable, then unavoidable).**
- Effects intensify: double vision (a ghost Ray offset 6 px, 0.1 s behind), stumbles when moving for more than 1 s, slip window 0.04 s, punch damage −60%. The tell is still there. **Good play is still possible:** a perfect slip on the chin-tap right opens a counter-cross that staggers Ray once. Teddy roars "THAT'S IT!", and the crowd surges. Each counter landed increments `ch0_resistance` (max 3). This is how good play shows Jin resisting the sabotage.
- **The scripted end** begins at round clock 0:55 *or* when Jin's condition reaches 25%, whichever comes first, whatever the player is doing:
  1. **Legs go.** Jin's knees buckle and one glove touches the canvas. By the rules that's a knockdown.
  2. **The warning sign ignored.** Referee Ostrowski steps in. Camera to 1.4 on his hands: he wipes Jin's gloves on his own shirt, glances at the round clock (not at anyone in the crowd), and waves: **"Box."** Hold 2.0 s on the wave.
  3. **Ray's half-second.** Ray stands still for 0.5 s and looks at the referee. Then he taps his chin.
  4. **Control leaves.** The HUD fades to nothing over 0.5 s. Jin's guard lowers on its own. The player's inputs do nothing, and the screen says why in Jin's thought: "*Hands up. Hands up. Hands—*" (the third time cut off). The input glyphs, if visible, gray out.
  5. Ray walks Jin into **Jin's own blue corner** and lands a combination on the ropes (each hit has full hit-stop; camera shake on the third).
  6. **The bell.** The timekeeper strikes the bell for the end of the round: clear, dry, unmuffled, the only clear sound in the scene. **Ray throws one more right after the bell.** Slow motion 0.25× for that punch.
  7. **The fall.** Jin falls forward. The camera zooms 1.0 → 1.5 while it lowers until the canvas line sits at screen centre. Jin lies in his corner. Everything is underwater except **the bell, which keeps ringing**: the timekeeper hammering it because no one is stopping anything. Ding. Ding. Ding. Ray's white shoes step away. The referee's shoes come late.
  8. **Fragments** (memory filter, 0.5 s each, between bell strikes): **Umma** standing in Row 6, both hands at her mouth. **Min** climbing onto the ring apron, the yellow scrunchie, her mouth open on a shout we can't hear. **A camel coat** walking up the aisle, back to us. **Row K**: the flat cap seated; then the seat empty.
  9. Black. **The bell rings three more times over black.** Silence for 2.0 s. Journal: `mem_00_bell`.

**Rule (PDF):** this is an unavoidable story event, not a secretly unwinnable challenge. No "You lost" screen, no retry prompt, no score. Good play changes `ch0_resistance` and Ray's Ch8 line, never the outcome.

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| What the purse is for | `ch0_purse_dream` | Umma and Min's replies; the coat's arithmetic line | Ch2 Okafor: "Your mother told the whole building you'd paid the rent till Christmas" / "...that she'd stop Saturdays" / "...about a bathroom lock"; Ch6 Min's letter; Ch9 Penner; endings |
| How Jin refuses the coat | `ch0_refusal_line` | Coat's exit line is the same for all | Ch9 Penner quotes it word for word; Ch10 the thought at the door |
| Tell Teddy about the coat | `ch0_told_teddy` | Teddy's tunnel line | Ch2 Teddy: "You told me. You *told* me, and I said we win anyway." / "You never said a word about a coat? Jesus, kid." |
| (observed) Counters in round 3 | `ch0_resistance` 0–3 | Teddy's shout, crowd | Ch8 Ray's opening line |

## Chapter ending and handoff
- **Completion screen** (slow fade in on black, no music): `CHAPTER 0 — ONE MORE ROUND` / "Jin loses control over his future." / **What you did:** one plain sentence per flag ("You told Min the purse was for the rent." / "You told the man in the coat to get out." / "You landed two counters in the third round."). The screen holds until the player presses continue. The bell is silent on this screen.
- **State handed on:** all Ch0 flags; Jin's moveset is **wiped** (Ch1 starts with no punching, no running, no slip); the Journal opens its Memories tab with four frames, one of them grainy (`mem_00_bottle`).
- **Transition into Ch1 (match cut):** on the continue press, black. **One bell strike, muffled**, which is then answered by an electronic **ding... ding** of a hospital nurse-call chime. The chapter card for Ch1 appears on the second chime.

---

# Chapter 1 — The Name Above the Bed

**Date/time.** Monday, October 7, 1996 (waking) to Monday, December 2, 1996, 6:50 AM (leaving). Seven weeks, shown as six playable "weeks" separated by time-skip cards.
**Mood.** Disoriented, then patient, then quietly furious. Institutional calm hiding a lie, with ordinary kindness all around it.
**Palette and weather.** Pale institutional green-gray walls, buzzing fluorescent white, cold window light, a maple outside Room 214 that is the chapter's clock: orange in week 0, half-bare in week 3, bare in week 5, first snow on the last morning. Drizzle, then frost. Hana's red scarf (off duty) is the one warm colour.

**Gameplay identity.** *Relearn the body; read the paperwork.* Short movement sections whose verbs grow week by week, rehab drills, a hospital you learn room by room, and the first evidence. **No combat at all.**
Share: exploration 20% · dialogue 30% · investigation 15% · activities/rehab 30% · cutscene 5%. Target length **18 min**.

**Movement by week** (each restriction shown in the world first, then by a small crossed icon; never unexplained):
| Week | Jin can | The world shows why |
|---|---|---|
| 0 (Day 1–2) | look (camera nudge ±40 px), sit up (hold) | in bed, IV line |
| 1 | parallel bars only (alternate left/right input, rushing makes him sag) | Hana's hands hovering at his belt |
| 2 | wheelchair (slow), stand at the handrail and walk along it | the wheelchair parked by the bed |
| 3 | walk at 50%, no run, no jump | his idle lists right; he touches the wall |
| 5 | walk, jog at 70%, stairs, a short hop | Hana: "Stairs today. Don't show off." |
| 6–7 | run at 85%, full jump; no punching (nothing to punch) | — |

## Locations

**`st_agnes_room_214` — Room 214** (640 px)
Two beds. Jin's by the window (left), Mr. Tibbs's by the door (right). **Above Jin's bed, a slide-in nameplate card: `AHN, DANIEL`.** Bedside tray with a growing pile of **butterscotch candies** (one per Pike visit; the pile is the visit counter). A wall calendar from the activities office (October 1996: the first shock). Call button with its chime. Chart clipboard at the bed foot. A closet with a clear plastic belongings bag labelled `AHN, D.` containing donated clothes, none of them his. The window and the maple.
*Lighting:* daylight through the window by day; a single reading lamp by night. *Sound:* Mr. Tibbs's TV (game shows), the call chime, a floor polisher somewhere.

**`st_agnes_corridor` — Rehabilitation Wing, 2nd floor** (1400 px)
Left to right: Room 214 → a long **handrail** on the wall (the week-2 walking aid) → **nurse station** (Nurse Dee, the Fund directive binder, the staff phone behind the counter) → bulletin board ("Bingo Thursdays 2 PM," "Music with Sister Agnes-Marie," staff photos with Hana's) → day room door → staff elevator (to the basement; staff key) → rehab gym double doors → stairwell → **Sister Margaret's office** (right end).

**`st_agnes_dayroom` — Day room** (900 px)
A TV high on a wall bracket, a card table where two residents play gin, an upright piano, a window seat, a fish tank with one fat goldfish named Walter Cronkite (label on the tank), a shelf of donated paperbacks.

**`st_agnes_rehab_gym` — Rehab gym** (1000 px)
Parallel bars (left) → low balance beam → a four-step stair trainer → mats → **mirror wall** (centre right) → floor-tape footwork marks → **Hana's reaction board** (plywood, four coloured bulbs, a switch box with taped labels) → Hana's desk (a coffee mug printed `CALDER FOUNDRY & FORGE — 25 YEARS`, her father's; the **Mercy Institute brochure** in a tray). The ceiling fluorescents are four long tubes in a square, which is the match cut from the ring lights.

**`st_agnes_garden` — Courtyard garden** (1200 px)
A gravel path loop (conditioning laps), two benches, a dry fountain full of leaves, a bird feeder, and the iron gate to Bellhaven Road with a sign: `PATIENTS MAY LEAVE THE GROUNDS WITH A SIGNED PASS`.

**`st_agnes_records` — Medical records, basement** (800 px)
Steel shelving with boxes labelled by quarter (`TRANSFERS 94 Q3`), a microfiche reader, a bare bulb on a pull chain, a dehumidifier humming, a Xerox machine, and a high ground-level window that takes the late sun.

**`st_agnes_lobby`** (900 px)
Front desk, a donor plaque, the front doors, steps down to the street. **Plaque:** `THE CALDER FOUNDRY RELIEF FUND — Proudly supporting twelve beds in the Rehabilitation Wing since 1994.` (The Fund's money is real. Twelve beds depend on it. This is why Sister Margaret obeys it.)

**`bellhaven_road`** (1000 px)
A bus shelter, a hill falling away to the right with all of Calder below in haze, and the Civic Arena's dome a small gray bump on the river.

## NPCs present
| id | Where | Idle | Key lines / barks | Reacts to |
|---|---|---|---|---|
| `hana` | rehab gym, corridor, records | clipboard hug, kneeling, hands on hips | "Okay. One more length. Then we'll argue about your name." | `ch1_pike_answer`, `ch1_records_route` |
| `pike` | Room 214 chair (days 2, week 3, week 6) | edge of chair, hands clasped | "Let's not tire ourselves with boxing, Daniel." | `ch1_pike_answer` |
| `nurse_dee` (Dolores Ramírez) | nurse station; night rounds | `write at desk`, pushing a med cart | bark: "Morning, Danny. Pills, then glory." / "It's in your file, hon. I'm sorry." | — (she is kind, and follows the binder) |
| `tibbs` (Carl Tibbs, 81) | bed by the door | `lie in bed`, remote in hand | "Danny! Price is Right! Bet you a pudding." / (week 2, after the TV) "Never trusted that Korean kid. Took the money and ran, I bet." | apologises in week 5 if Jin sat with him |
| `sister_margaret` (Margaret Doyle, administrator) | her office | `write at desk` | "Twelve beds, Ms. Lim. Twelve people who'd be somewhere worse." | Hana's phone calls |
| `dr_whitlow` (Paul Whitlow, attending) | corridor, week 0 and week 5 | walking with a chart | "Subdural, evacuated, old. You were very lucky, Mr. Ahn. Or very well treated." | — |
| `ochoa` (night janitor) | corridor at night (alone route) | mopping | bark: "I didn't see nothing. I never see nothing." | — |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i1_nameplate` | Name above the bed | `AHN, DANIEL`. "*That's not my name.*" | — |
| `i1_calendar` | Activities calendar | "OCTOBER 1996." "*Nineteen ninety-six.*" [beat] "*Two years.*" | — |
| `i1_chart` | Chart clipboard | opens `ev_chart_ahn` | evidence |
| `i1_belongings` | Belongings bag | "Donated sweatpants. A comb. Somebody else's socks. *Nothing in here is mine.*" | — |
| `i1_candies` | Butterscotch | (count) "*He leaves one every time. Like I'm a grave.*" | — |
| `i1_directive` | Binder at the nurse station | opens `ev_fund_directive` | evidence |
| `i1_mirror` | Mirror wall | (week 1 scene; later) "*I keep checking it's still there.*" | — |
| `i1_hana_mug` | Coffee mug | "CALDER FOUNDRY & FORGE — 25 YEARS." Hana: "My dad's. They gave him a mug and a pension that lasted until the bankruptcy." | sets up the week-3 contradiction |
| `i1_mercy` | Brochure | (week 6) opens the Mercy Institute price sheet | money rule |
| `i1_plaque` | Donor plaque | text above | — |
| `i1_tibbs_radio` | Transistor radio | (week 6, a gift) "*Tibbs's. 'For the ball games, Danny.' I'll find a fight on it.*" | carried; reappears in Ch8 and Ending Two |

## Quests
- **Main: "The name above the bed."** `Sit up.` → `Walk the length of the bars.` → `Get to the day room.` → `Ask to call home.` → (week 3) `Talk to Hana.` → (week 5) `Find your transfer papers.` → (week 7) `Leave St. Agnes.`
- **Optional: "Pudding."** Sit with Mr. Tibbs through one game show (sit on his bed edge; 40 s; Jin's thoughts about ordinary TV). Reward: in week 5 Tibbs says, "I said a thing about you. On the TV day. I'm eighty-one, that's not an excuse, I'm just telling you my age." In week 6 he gives the radio.
- **Optional: "Hana's board."** Clear each of the four starting drills once (L1). Reward: Hana +1 (max +2 across Ch1 sessions), and Hana's line "You're better at this than anybody I've had. That's not a compliment, that's a worry."

## Scripted scenes

### 1.0 Chapter card
Black. **One bell strike, muffled.** The nurse-call chime answers it: *ding... ding.* Card: `CHAPTER 1 — THE NAME ABOVE THE BED` / `St. Agnes Long-Term Care · October 1996`.

### 1.1 Waking (key scene; the player's only input is look and sit up)
1. Fade from white, not black: overexposed, then the room resolves. The camera starts at **1.6** on Jin's shoulder and pillow; the IV line is a 1 px gray thread.
2. Mr. Tibbs presses his call button: *ding*. Jin's head turns (the first sign of life the player sees).
3. Over 4 s the camera eases out to 1.0 and **pans up the wall to the nameplate. It stops on `AHN, DANIEL` at 1.4 and holds for 2.5 s.** No music.
4. **Jin (thought):** "*That's not my name.*" [beat] "*My name is Seo Jin.*"
5. Prompt: `Sit up` (hold). Three holds: the first two fail (Jin rises 2 px and falls back, and the bed creaks), the third succeeds. On success the camera settles at 1.0 and the calendar comes into frame on the wall: OCTOBER 1996. **Jin (thought):** "*Nineteen ninety-six.*"
6. Nurse Dee comes in on Tibbs's call and stops in the doorway, carrying a cup of ice chips. **Dee:** "Daniel? Daniel, you're— oh my God. Okay. Okay. Don't move. Dr. Whitlow! *Paul!*" She runs out, and the ice chips stay on the tray.

### 1.2 Pike's first visit (day 2; full letterbox)
Pike sits on the edge of the chair, briefcase on his knees, a candy bag in hand.
- **Pike:** "Daniel. Gerald Pike, Calder Foundry Relief Fund. We've been looking after you." *He sets a butterscotch on the tray.* "You had an accident on a salvage crew at the Foundry. A beam. Confusion is very normal. Dr. Whitlow says very normal."
- **Jin** *(barely audible; one word per line, slow typewriter)*: "Jin." / "Seo Jin." / "I'm a boxer."
- **Pike** *(smiling, standing)*: "We'll get there. Let's not tire ourselves with boxing."
- At the door, to Nurse Dee, at normal volume because he doesn't think Jin is listening: "No outside calls until the Fund's physician clears it. It's in the binder. For his own good."
- **Pike** *(back over his shoulder)*: "We're paying for all of this, Daniel. The least we can do is get well quietly."

### 1.3 Week 1: the bars and the mirror
Time card: `Week 1.` Match cut: the four ring lamps from Ch0's last image become the four fluorescent tubes of the rehab gym, in the same square.
- **Hana** (reading the chart): "Daniel Ahn, thirty-one, foundry. Hi, Daniel. I'm Hana. I'm going to make you hate me in a healthy way."
- **Jin:** "My name is Jin Seo."
- **Hana:** "Okay, Jin-Seo-or-Daniel. Either way you're walking to the end of these bars." (She trusts the chart. She thinks it's confusion. That's fine. It's her job.)
- **Parallel bars** (playable): alternate left/right inputs at a steady rhythm; rushing makes Jin sag and Hana's hands catch his belt ("Slow is smooth"). 6 m of bars.
- **The mirror** (key scene, triggered at the end of the bars): the bars end facing the mirror wall. The camera slowly pushes from 1.0 to **1.35 on the reflection** over 5 s while the gym sound fades to the hum of the tubes. In the reflection: thin shoulders, shaggy hair over the ears, and **the reddish scar on the right cheek**. No thought line. Hana, behind him in the mirror, sees him looking and says nothing. She puts a towel over the bar beside his hand and steps back out of the reflection. [hold 3.0 s] **Hana** (quietly): "That's enough for today." This is a breath zone: the gym empties, and the sit spot on the mat is available.

### 1.4 Week 2: the day room and the public lie
Time card: `Week 2.` Training menu unlocks (four drills on Hana's board). Jin roams in the wheelchair and can stand at the handrail.
- **Sitting on the bed edge** for the first time (sit interaction) plays `mem_01_waistband`: Umma's hands, the needle, the bitten thread, two seconds, gone.
- **The day room** (main beat): Jin wheels in. Channel 6, `Calder Sports Weekly`. On screen: Ray Castell hitting pads, older and heavier. **Anchor:** "...Castell's title, of course, came at the expense of Eastgate's Jin Seo, who, you'll remember, checked himself out of Calder General against medical advice two days after that knockout and hasn't been seen since."
- **Tibbs:** "Never trusted that Korean kid. Took the money and ran, I bet."
- The camera pushes slowly in on Jin in the wheelchair, silhouetted against the TV's blue. The anchor's voice keeps going but drops in volume. **Jin's hand tightens on the wheel** (a 1 px pose change). Hana is in the doorway with a clipboard and heard all of it. She looks at the TV, then at Jin, for 2 s. She doesn't speak. Breath zone.
- **Ask to call home** (main): at the nurse station. **Dee:** "Your Fund says calls have to go through them, hon. It's in your file. I'm sorry. I'm really sorry." The binder is examinable (`ev_fund_directive`). Hana, passing: "I'll ask Mr. Pike."

### 1.5 Week 3: the contradiction (key scene; full letterbox)
Time card: `Week 3.` Room 214, afternoon. Hana is taking Jin's blood pressure when Pike arrives. She stays.
- **Pike:** "Daniel. You look wonderful. Ms. Lim, you're working miracles." *A candy on the tray. He opens the briefcase.* "I brought something to help. Your employment card, from the Foundry. Sometimes seeing it helps." *He places a photocopy on the tray (`ev_foundry_badge`).*
- **Jin:** "I fought Ray Castell for the title. August twentieth. At the Civic."
- **Pike:** "Daniel, you've never boxed. You worked the pour floor at Calder Foundry for nine years. Badge four-four-seven-one."
- **Hana** *(not looking up from the cuff)*: "Calder Foundry closed in March of '92."
- [beat 1.5]
- **Pike:** "Salvage, Ms. Lim. A salvage crew. The paperwork around that bankruptcy was extensive."
- **Hana:** "My father got his last check from Calder Foundry in March of '92. They gave him a mug." *She takes the cuff off. Camera to 1.25 on Hana and Pike; Jin out of focus between them.* "Nobody was salvaging anything in August '94. The building was chained."
- **Pike** *(still smiling; turning to Jin)*: "Let's start simply, Daniel. Tell me your name."
- **Choice `ch1_pike_answer`:**
  - **"...Daniel."** → `played_along`. Pike relaxes visibly (hands unclasp). "There. You see? It comes back." He signs a garden pass on the spot ("fresh air"). The garden opens in week 3 instead of week 5. **Jin (thought):** "*Fine. Let him think it.*" Hana watches Jin say the name and her pencil stops.
  - **"Seo Jin. Call my mother. Mi-ok Seo, 412 Kessler."** → `insisted`. Pike sighs. "Ms. Lim, I'll speak to Sister Margaret about Daniel's phone privileges. Agitation is a setback." The next morning, Dee removes the phone from Room 214's wall jack and apologises. Hana sees it done.
- Pike leaves. Hana sits on the windowsill (an unusual pose for her: she never sits). **Hana:** "I'm not on your side, Jin. I'm on the side of the chart being true." [beat] "Right now that's the same thing."
- **Interference beat:** two days later (a short corridor scene) Sister Margaret calls Hana into her office, door half open, and the player hears it from the corridor. **Sister Margaret:** "You called the State Athletic Commission. You called a disconnected number in Eastgate *nine times*. Mr. Pike called me at home, Hana. At home." **Hana:** "The commission says Jin Seo's licence lapsed in '95. Last address: 412 Kessler." **Sister Margaret:** "Twelve beds, Hana. Twelve people who'd be somewhere worse. Staff do not contact outside parties on behalf of Fund patients." *She's not a villain; she's tired and frightened of an empty wing.*

### 1.6 Week 5: the records (key scene, two variants)
Time card: `Week 5.` Jin walks, jogs and climbs stairs. Garden laps unlock conditioning.
- **The letter.** In the day room, Jin writes a letter home (write-at-desk pose, 6 s, Jin's slow handwriting shown in the viewer: "Umma. Min. I'm alive. I'm at St. Agnes on Bellhaven Hill. They have me under another name. Come. — Jin"). Hana takes it: "I'll mail it from the box on my corner. Not from here."
- **Hana's plan.** In the gym: "Transfers come with a face sheet from the sending hospital. Always. Yours doesn't have one in the chart. The originals go to the basement. I'm pulling your intake Thursday after my shift. I have a reason to. Wait for me."
- **Choice `ch1_records_route`** happens in play, not in a menu. On Wednesday night (a time card: `Wednesday, 11:10 PM`), Jin can't sleep. The corridor is dark. If he walks to the staff elevator, he finds the basement door propped open by Mr. Ochoa's mop bucket. A prompt at the door: **`Go down now`** / walk away. Walking away and sleeping (bed interaction) leads to the Thursday scene.
  - **`with_hana` (Thursday, 6:15 PM, sunset).** Hana unlocks the records room. She crouches at the low shelves, finger under each label. She finds `TRANSFERS 94 Q3` and the folder. Two-shot at 1.2 on the floor, both of them sitting among boxes. She reads the face sheet aloud, in a flat voice: "Seo. Jin. Date of birth March fourteenth, sixty-eight. Next of kin: Seo Mi-ok, mother. 412 Kessler." Then the St. Agnes intake sheet: same admission number. **Hana:** "That's white-out." She stands and holds the intake sheet up to the high window. **Camera to 1.5 on the paper:** through the correction fluid, in the red sunset light, the typed letters `SEO, JIN` show through under `AHN, DANIEL`. [hold 2.5 s] Hana sits down on a box. **Hana:** "Okay." [beat] "Okay. I'm going to copy this, and put it back exactly where it was, and then I'm going to be very normal for a while." The Xerox's light sweeps across both of them. Hana +2.
  - **`alone` (Wednesday, 11:15 PM).** A short stealth-lite walk: Nurse Dee does rounds with a flashlight on a fixed loop. If she sees Jin, she walks him back to bed ("Danny, it's eleven. Even Walter Cronkite's asleep."), and the player retries from the corridor; there's no fail state. Mr. Ochoa sees Jin and shrugs: "I didn't see nothing." In the basement, Jin finds the box himself (slower: three shelves to check). The reveal is under the **bare bulb**: he pulls the chain, and the camera goes to 1.5 on the paper held up to the bulb, `SEO, JIN` showing through. No one to share it with. **Jin (thought):** "*Somebody sat at a desk and did this with a little brush.*" He can't use the Xerox (it needs a staff code), so he takes the original face sheet. On Thursday Hana notices the box was moved: "You could've waited one day. I said Thursday." [beat] "Show me." The same reveal happens again in daylight; she copies it. Hana +0.
- Both routes add `ev_transfer_form` and `ev_intake_whiteout`. Both are breath zones afterward (the records room is safe, and the corridor at night is empty).

### 1.7 Week 6: returned, and the price of recovery
Time card: `Week 6.` The maple is bare.
- **Returned letter.** Hana brings it to the garden bench and sits down next to Jin before handing it over. The envelope: `RETURN TO SENDER — NOT AT THIS ADDRESS — UNABLE TO FORWARD` (`ev_returned_letter`). The camera eases out to 0.85; the dry fountain, the leaves. No music. Sit spot. **Jin (thought):** "*Moved. They moved. People move.*" (He doesn't let himself think anything else, and the game doesn't either.)
- **The brochure (money rule).** In Hana's office, Jin picks up the Mercy Institute brochure. Viewer: "MERCY INSTITUTE FOR NEUROLOGICAL RECOVERY, Boston. Comprehensive residential programme, 24 months. Tuition and care: $186,400." **Hana:** "That's what fixing this properly looks like. Two years. Specialists every day." [beat] "People sell houses for it. People who have houses." **Jin (thought):** "*I was going to make forty thousand on the biggest night of my life. Before the cuts.*" This is the moment the game establishes that ordinary money will never buy the real recovery.
- **Tibbs leaves** for his daughter's in Ohio. He gives Jin the transistor radio: "For the ball games, Danny. Or whatever you call yourself." (If the "Pudding" quest was done: "Jin. Right? Jin.")

### 1.8 Week 7: leaving (key scene)
Time card: `Monday, December 2, 1996 · 6:40 AM.`
- In the gym before her shift, **Hana:** "I read your admission paperwork front to back. There's no court order. No guardianship. Nothing. You're a voluntary patient. The Fund pays the bill. It doesn't own you." [beat] "You can just walk out the door, Jin. Nobody's ever told you that, because nobody wanted you to know."
- She gives him a **brown corduroy coat** from the donation closet ("It was a dentist's. He won't miss it."), **$20**, and an appointment card with her phone number written on the back: `HANA — 555-0187 — call from a payphone if you have to`.
- **Jin:** "Why?"
- **Hana:** "Because the chart's wrong. I hate it when the chart's wrong."
- **Room 214, last time.** The interaction at the bed reads `Take the name card`. Jin slides `AHN, DANIEL` out of the slot and puts it in his pocket. **The camera holds the empty slot above the empty bed for 2 s.** (It returns in Ch9, when the offer includes a brass plate engraved `JIN SEO`.)
- **The walk out.** Corridor (Dee, at the station, looks up, looks at him, and looks back down at her binder: she lets him go, and that's her kindness) → lobby (the donor plaque) → front doors. On the steps, the camera eases out to **0.8**: first snow, Calder below in blue haze, the Civic Arena's dome a small gray bump on the river. Jin walks down Bellhaven Road to the bus shelter. The player controls the walk; nothing hurries him.
- The bus arrives. A last shot from inside the bus window (side view, the bus moving left): St. Agnes sliding away, and in a second-floor window a small figure in teal with a clipboard, not waving.

## Encounters
None. Ch1 has no hostiles. The reaction board is the nearest thing: four bulbs light in random order, and the player presses the matching direction within 0.6 s (L1 target: 12 in a row).

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| Pike: "Tell me your name." | `ch1_pike_answer` | garden pass early vs. phone removed (Hana sees it) | Ch2: `insisted` means the gray van is already parked on Kessler Ave when Jin arrives; `played_along` means it arrives at dusk (seen from the roof). Ch6: Pike's file note reads "compliant" or "agitated, monitor." |
| Wait for Hana or go alone | `ch1_records_route` | which records variant plays; Hana +2 / +0 | Ch6 Hana: "We found it together, I'm not stopping now." / "You didn't wait for me then either." |

## Chapter ending and handoff
- **Completion screen:** `CHAPTER 1 — THE NAME ABOVE THE BED` / "Someone is still controlling his life." / What you did (e.g., "You told Pike your real name." / "You waited for Hana.").
- **State handed on:** walk/run/jump at 85% (full 100% after Ch2's first scene); training menu with four L1 drills; evidence: chart, badge, directive, transfer form, white-out sheet, returned letter; items: Hana's card, $20, Tibbs's radio, the `AHN, DANIEL` name card; Jin wears gray sweats and the corduroy coat; Hana's number usable at any payphone from Ch2 on.

---

# Chapter 2 — No One Waiting

**Date/time.** Monday, December 2, 1996, 3:10 PM to 10:30 PM. Eastgate.
**Mood.** Recognition turning to absence. A long quiet afternoon, a dusk that lights up one lamp at a time, then a night with teeth.
**Palette and weather.** Cold blue-gray, wet black asphalt with broken amber reflections, sleet turning to snow at dusk. Warm windows (Sung's, Okafor's kitchen) are the islands. Iron Pulse's pink-and-teal neon is the only unwelcome colour on the street.

**Gameplay identity.** *Walk through what's gone.* Free exploration of a neighbourhood the player saw in Ch0's gold, now changed; one long conversation; a rooftop sit; a haircut; then the first street fight, where speed works and power doesn't.
Share: exploration 35% · dialogue 25% · combat 20% · activities 5% · cutscene 15%. Target length **20 min**.

## Locations

**`eastgate_kessler_ave` — Kessler Avenue, 1996** (2400 px; the same street as Ch0 in the same order, extended)
Left to right: **Pratt Alley mouth** → **412 stoop** (buzzer panel: `3B — RIVERA`; a stroller chained to the railing) → **Sung's Grocery** (fruit crates gone; a hand-lettered sign `HOT BARLEY TEA 25¢`) → laundromat (now `SUDS CITY`) → **poster wall** (three new layers over Jin's poster) → **Kessler Diner** (`UNDER NEW MANAGEMENT`, a sign `CLOSED 2–5 INVENTORY`) → **bus stop** → **Iron Pulse Fitness** (pink-and-teal neon on Marsh B.C.'s old brick; the old hand-painted glove ghosted under white paint) → the corner of 9th.
*Changes from 1994 the player can find:* the fruit stand is gone; the diner's EAT neon is replaced; the kids' stoop is empty; two storefronts are shuttered; **the gray panel van** (see Ch1 flag) is parked across from 412 with its wipers going every 6 s.
*Lighting:* 3 PM flat gray; from the roof scene on, the streetlights come on one by one; night is amber pools on wet black. *Sound:* sleet ticking on awnings, a bus kneeling, a dog two streets over, aerobics music thumping from Iron Pulse.

**`eastgate_412_stair`** (360 × 720)
The same stairwell. 3B's door: a plastic Halloween skeleton still taped to it in December, a child's boots on the mat. 3A: the wreath is now a Christmas wreath. The landing window is cracked and taped. At the top, a roof door with a broken latch.

**`okafor_3a` — Mrs. Okafor's apartment** (640 px)
A plastic-covered sofa, a church calendar, a radiator that clanks, a kettle, a kitchen table with a lace cloth, and a photo wall: one frame shows **Umma and Mrs. Okafor at a church supper, 1993**, both holding dishes, Umma's with blue cornflowers.

**`eastgate_roof` — 412's roof** (1000 px)
Tar paper, a water tank on legs, TV antennas, a neighbour's pigeon coop, and the **parapet sit spot** facing the skyline with the Civic Arena's dome far off. On the water tank's ladder, scratched into the paint: `J + M 1989`.

**`sung_store` — Sung's Grocery** (640 px)
Narrow aisles, rice sacks, a kettle of barley tea on a hot plate, a calendar from the Korean church, and behind the register, **the MISSING flyer**, sun-faded, taped at four corners and once more across the middle where it tore.

**`iron_pulse` — Iron Pulse Fitness** (1200 px)
Front: reception desk (a bored teenager in a visor), Stairmasters, the glass-walled aerobics room (instructor plus five women in leotards; music). **Where the ring stood, a 300 px rectangle of brighter floorboards.** A door marked `STAFF` leads to **the back room / boiler room**: Teddy's cot, a hot plate, a heavy bag Teddy kept and hung from a pipe, a cracked mirror, a locker with a box on top, Teddy's hair clippers. After 9 PM the front is dark and only the back is lit.

**`eastgate_pratt_alley` — Pratt Alley** (1600 × 520, fire-escape layers)
Left to right: Kessler Diner's back door (the cook smoking on a milk crate) → dumpsters → the laundromat's dryer vents puffing steam → fire escapes overhead (a woman taking in frozen laundry) → **a single streetlight pool in the centre** (the fight stage) → a homeless man under a blue tarp → the far end opening onto Pratt Street, where the van backs in.

## NPCs present
| id | Where | Idle | Key lines / barks | Reacts to |
|---|---|---|---|---|
| `okafor` | 3A | at her door; then sitting | see scene | `ch0_purse_dream` |
| `rivera` (Luz Rivera, 26) | 3B door | holding a toddler, door on the chain | "We've been here a year. I don't know any Seo. Please." | — |
| `sung` (Sung Dae-ho, 66) | behind the register | `sit` on stool, reading a Korean paper | "Jin-ah? ...*Jin-ah.*" / bark (later): "Tea is free for you. Forever. Don't argue." | `ch2_shoveled` |
| `teddy` | Iron Pulse back room (after 9 PM; before that, mopping the aerobics room) | leaning on a push broom | see scene | `ch0_told_teddy`, `ch2_teddy_tone` |
| `visor_teen` | Iron Pulse desk | chewing gum | "Membership's twenty-nine a month. You look like you need it." | — |
| `diner_cook` | Pratt Alley | `smoke` on a crate | "I'm calling the cops!" (he doesn't) / after: "...You want some coffee?" | — |
| `benny` (Benny Szabo) + `rudy`, `hal` | the van; then the alley | collectors leaning on the van | "Daniel Ahn? Mr. Pike's worried sick. Let's get you home." | `ch1_pike_answer` timing |

## Interactables
| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `i2_buzzer` | Buzzer panel | `3B — RIVERA`. "*Our name was on a strip of tape. Min wrote it.*" | — |
| `i2_poster_wall` | Poster wall | `Peel` (3 presses): IRON PULSE GRAND OPENING → CASTELL DEFENDS! MARCH 1996 → THE SMOKESTACKS, LIVE AT THE ANCHOR → under them a torn corner: "...SEO — SAT AUG 20 — CALDER CIV..." | `mem_02_posters` |
| `i2_ring_floor` | Bright floorboards | "*Sixteen by sixteen. That's where the ring was. They sanded around it.*" | — |
| `i2_3b_door` | Door 3B | "*Our door. A skeleton on it. A kid lives here now.*" | — |
| `i2_tank_ladder` | Water tank ladder | `J + M 1989`. "*She did the M. I did the plus sign and got in trouble for both.*" | — |
| `i2_flyer` | MISSING flyer | opens `ev_missing_flyer` | evidence |
| `i2_seo_box` | Box: SEO — DON'T TOSS | (scene) the track top, old hand wraps, Jin's boxing licence, a 1993 team photo | `bel_track_top`; licence used in Ch6 |
| `i2_knuckles` | Brass knuckles (in the alley) | "Pick up." | equipment |
| `i2_payphone` | Payphone (corner of 9th) | `Call Hana` ($0.25): see Ch2 optional | Hana +1 (once per chapter) |

## Quests
- **Main: "No one waiting."** `Go home. 412 Kessler Avenue, 3B.` → (after Okafor; the HUD hides itself in the breath zone, then returns) `Find Teddy Marsh. He sweeps the old gym at night.` → `Get something to eat at Sung's before ten.` → (after the alley) **`Find the man who was supposed to protect you.`**
- **Optional: "Sung's sidewalk."** Mr. Sung's back is bad; clear the sidewalk (hold-to-shovel along 160 px, 25 s; a sweep pose with a shovel prop). Reward $10, `ch2_shoveled`, and the line: "Your mother bought rice here every two weeks for nine years. Twenty pounds. I carried it for her. Now you carry for me."
- **Optional: "Call Hana."** Payphone. **Hana:** "You're alive. Good. Where are you?" (Jin tells her or doesn't.) "Okay. Eat something that isn't from a vending machine." Hana +1.

## Scripted scenes

### 2.0 Chapter card and arrival
Card on the muffled bell (a touch clearer than Ch1). `CHAPTER 2 — NO ONE WAITING` / `Eastgate · December 2, 1996`.
Bus vignette, then Jin steps off at the bus stop. The camera starts at **0.85** with Jin small at the stop and the street running both ways into sleet. Over 6 s of the player walking it eases to 1.0. **No music at all** until the roof. Objective: `Go home. 412 Kessler Avenue, 3B.`
The player walks the same street as Ch0, in the same order, from the other end. Barks are absent: no one recognises him on the street (gray sweats, a dentist's coat, the scar). The van idles across from 412 if `ch1_pike_answer = insisted`.

### 2.1 3B and Mrs. Okafor (key scene)
- Jin buzzes 3B: no answer. A delivery man props the street door; Jin climbs (stairwell; `mem_02_stairs` plays on the second landing: Min racing him up, the 1989 light).
- At 3B, a knock. **Luz Rivera** opens the door on its chain with a toddler on her hip: "We've been here a year. I don't know any Seo. Please." The door closes. The chain rattles.
- Across the hall, 3A opens. **Mrs. Okafor**, coat half on, keys in hand. She sees him. **Her keys drop.** The camera holds the two-shot across the hall at 1.15; the gap between them is the whole width of the hallway.
- **Okafor:** "Jin?" [beat 1.5] "Jin. Oh, Lord. Oh, Lord, look at you. Come in. Come in before I fall down."
- **Her kitchen** (full letterbox). She puts the kettle on and sits first. Jin stands until she says "Sit." He sits (chair pose). The radiator clanks.
- **Okafor:** "They said you left. The hospital said you checked yourself out and went, and the newspaper said it, and the television said it. Your sister said it was a lie. Every day she said it was a lie."
- **Jin:** "Where are they?"
- [beat 2.0. She puts down her cup. The camera eases 1.15 → 1.25 over her next lines, slowly enough not to be noticed.]
- **Okafor:** "They lost the apartment. May, the year after. They were behind, you know they were behind, and the searching cost money, and your mother was working doubles at the cleaners, and... May. They went to a rooming house on Garrison Street. Lindell House. I told her it was no place. She said, 'For a little while, Grace.'"
- **Okafor:** "There was a fire. In February. At night."
- [beat 1.5]
- **Okafor:** "Both of them, Jin. Both of them."
- **[Silence 3.0 s.]** No music, no typewriter. Jin's pose: `head down`. The radiator clanks once. The kettle starts to whistle and Mrs. Okafor doesn't get up for it for 2 s. Then she does, and turns it off, and stands with her back to him at the stove.
- **Okafor** *(with her back turned)*: "The county buried them. My church put up a cross."
- **Okafor:** "Their things. What the fire didn't take, the county took. Unclaimed property. They keep it at the Annex downtown. I tried to get them, Jin. They said only family." [beat] "Only family."
- **Choice (no flag; each option can be taken once, then "Stand up" ends it):**
  - **"Tell me about Umma."** → "She hemmed half the church for free that winter so she wouldn't have to sit still. She said if she sat still she'd go to every hospital in the state on foot." (If `ch0_purse_dream`: "...She told the whole building you'd paid the rent through Christmas. She was so proud she told the *mailman*." / "...that she'd never work another Saturday. She worked every Saturday after." / "...about a bathroom lock. She laughed so hard telling it.")
  - **"Tell me about Min."** → "Flyers on every pole in Eastgate. Letters to everybody. She'd come up these stairs with her bag of envelopes and say, 'Mrs. O, today somebody answers.'"
  - **"Stand up."** →
- **Okafor** gives him a casserole dish from her cupboard: Pyrex, blue cornflowers. "This is hers. She brought me japchae in it the week before... I never gave it back. I kept meaning to." `bel_dish`. Jin holds it in both hands (carry pose, no punching while carrying; the dish goes to his inventory when he leaves the building).
- At the door: **Okafor:** "You come back. You hear me? You come back up these stairs." okafor +1. Objective HUD **hides itself**.

### 2.2 The breath zone: stairwell, roof, dusk
- Nothing points the player anywhere. The hostile spawner is locked for the whole district until Iron Pulse after 9 PM. The stairwell's roof door has a `Go up` prompt; the street door has `Go out`. Both are fine.
- **The roof** (if taken): the parapet sit spot. Sitting eases the camera out to **0.8** and lets time run (1 real second = 2 game minutes). From 3:50 PM the sky shifts to dusk. **Below, the seven streetlights of Kessler Avenue come on one by one, 0.4 s apart, from the bus stop to 412.** Snow starts. The Civic Arena's dome lights up far away. `mem_02_roof` plays: Min and Jin on this parapet in 1989, a shared soda, the same dome. **Jin's thoughts**, one at a time, with long gaps:
  - "*I kept thinking they were somewhere I hadn't looked yet.*"
  - (after 20 s) "*Garrison Street. I don't even know what it looks like.*"
  - From the roof, if `ch1_pike_answer = played_along`, the player can see **the gray van pull up** across from 412 and its headlights go off. No comment.
- **If the player skips the roof**, dusk still falls during the walk to Iron Pulse, and the streetlights still light one by one as Jin passes under them. The image is not withheld from anyone.
- The objective returns when the player leaves the roof or after 90 s seated: `Find Teddy Marsh. He sweeps the old gym at night.`

### 2.3 Iron Pulse and the box (key scene)
- Before 9 PM, Teddy is mopping the aerobics room in a gray `IRON PULSE` vest and doesn't look up. The receptionist calls it closing at 9.
- **After 9 PM**, in the back room, Teddy is sitting on his cot eating soup from a can. Jin in the doorway. Teddy looks up. **He stands too fast and the can tips over.** [beat 2.0] **Teddy:** "...Kid?"
- **Teddy:** "They said you walked out of Calder General. I went there. I *went* there, Jin. They said 'discharged.'" *He sits back down, hard.* "I sold the gym. I couldn't walk in the door. Now I walk in it every night with a mop."
- **The haircut.** "Sit." Jin sits on an upturned bucket facing the cracked mirror; Teddy stands behind him with the clippers. **Staging device:** Teddy talks while cutting so he never has to look at Jin's face; the camera holds both of them *in the mirror* at 1.2. The two-block returns in three steps during the conversation (the sprite updates each step).
- **Teddy:** "I've said this to that mirror every night for two years, so I'll say it to you. I sent you back out. You told me something was wrong and I sent you back out." (If `ch0_told_teddy`: "And you told me about the coat. You *told* me, and I said we win anyway.")
- **Choice `ch2_teddy_tone`:**
  - **"You did."** → `blamed`. **Teddy:** "Yeah." [He keeps cutting.] "Yeah, I did." Teddy −1.
  - **"Why?"** → `asked`. **Teddy:** "Because Lenny said you were fine, and I wanted you to be fine. Thirty-one years in corners and I wanted something so bad I couldn't see it." Teddy +1.
  - **"You didn't put it in me."** → `forgave`. Teddy stops cutting. [beat] "Don't do that. Don't make it easy." He resumes. Teddy +2.
- **Teddy:** "Lenny quit the week after. Took his kit and went. Never saw him again."
- **The box.** Teddy takes it down from the locker: masking tape, `SEO — DON'T TOSS` in marker. Inside: old hand wraps, Jin's boxing licence, a 1993 team photo, and **the blue track top**, folded.
- **The reveal.** Jin takes off the dentist's coat and puts on the track top (`Put on`). He zips it. The camera pushes to **1.4 on the mirror** and holds 2 s: the canonical silhouette, finally. The aerobics music thumps faintly through the wall. Examine prompt on the collar: "PROPERTY OF THE CHAMP (allegedly) — M." **Jin (thought):** "*Allegedly.*"
- **Teddy:** "There's a cot. Owners don't come in before nine. Bag's on the pipe. I'll hold mitts if you want, after close." (Unlocks Heavy bag and Mitts training here.) "Sung closes at ten. Go eat something."

### 2.4 The van (the first street fight)
- Jin walks toward Sung's along Kessler. The van's side door slides open (sound first, off screen). Three collectors step out. **Benny** leads, wide, slow, smiling. **Benny:** "Daniel Ahn? Mr. Pike's worried sick. Let's get you home." **Jin:** "I'm not Daniel." **Benny:** "Sure you're not." They spread to herd him; the only open side is **Pratt Alley**. The camera follows Jin into the alley as the van backs in from the far end, headlights on, blocking it.
- **Civilians stay civilians:** the cook stands up from his crate and backs against the door ("I'm calling the cops!"); the woman on the fire escape pulls her laundry and herself inside; the man under the tarp pulls it over his head. None of them is ever hostile, and none can be hit (punches pass through civilians).
- **Phase 1: bare hands (40 s or 3 landed counters).** Collectors: big, slow haymakers (0.6 s wind-up, a glint on the fist), a two-arm grab (lunge), poor recovery. Jin's speed is exceptional: dash forward and back (1 charge, shown as a single pip), jab–cross, slip. **But his punches don't put them down:** each collector has a thin poise outline over his head that refills 1.5 s after Jin stops hitting. **Benny** (shrugging off a combo): "That all you got, Danny?" **Jin (thought, first refill):** "*I can hit him all night. He doesn't feel it.*" **Breath** kicks in on long exchanges; the shoulders heave. Teaching in motion: the first haymaker shows the dash-back glyph once; the first grab shows the dash-through glyph once. Thought lines carry the lesson: "*Big. Slow. Move.*" / "*Don't trade. Take what he gives you.*"
- **The knuckles (in slow motion).** On the third landed counter, Benny staggers and something falls out of his coat pocket. **Slow motion 0.4× for 2 s.** The knuckles skitter across the wet asphalt into the centre of the streetlight pool. The camera goes to **1.5** on the brass in the slush, and the ambient sound drops out. **Jin (thought):** "*Teddy would throw me out of the gym for this.*" Then normal speed resumes. The knuckles stay where they are, glinting. The collectors keep coming. The player must reach them and press `Pick up` (a 0.3 s crouch, which is a risk). Until then, poise keeps refilling: the game has shown why and doesn't need to say it again.
- **Phase 2: knuckles.** Two 2 px gold glints on Jin's fists. Stagger and damage go up; poise breaks. Hit-stop is heavier and the punch sound gains a metallic click. The collectors go down one by one. Rudy and Hal stumble back into the van and it **peels out**, its door still open. Benny stays down (down state, sitting against a dumpster).
- **Checkpoint:** the alley entrance at the start of the fight, and again at phase 2 (with the knuckles already picked up).

### 2.5 Questioning Benny
Full letterbox; Jin crouches in front of Benny in the streetlight pool; the snow is heavier.
- **Benny:** "Okay. Okay! It's a job. Pike's office pays us to bring the stray ones back, that's all. You're a stray."
- **Jin:** "Who pays you?"
- **Benny:** "Lenny. Lenny Voss. Little guy, cutman. He works the Cellar under Starlite Lanes. He gets the envelopes from Pike's office and passes 'em down. I never even met no Pike." `ev_collector_card` (from Benny's coat).
- [beat. **Jin (thought):** "*Lenny.*"]
- **Choice `ch2_collector_after`:**
  - **"Get up. Go home."** → `let_go`. Benny gets up, holding his ribs, and backs out of the alley. "...You're not what they said."
  - **`[Hit him again]`** → `hit_again`. One more punch, framed wide (zoom 0.9), with the cook watching from the door. Benny's head hits the dumpster. The cook goes inside and locks the door, audibly.
- Objective: **`Find the man who was supposed to protect you.`**

## Encounters
| Where | Enemies | Teaches | Checkpoint | After |
|---|---|---|---|---|
| Pratt Alley | 3 collectors (Benny, Rudy, Hal) | short dash forward/back; jab–cross; dodging slow committed attacks; using brief openings; that his power is gone and the knuckles exist | alley entrance; knuckle pickup | Benny questioned; `ch2_collector_after` |

## Choices made here
| Choice | Options → flag | Immediate | Later |
|---|---|---|---|
| What to say to Teddy | `ch2_teddy_tone` | Teddy's reply; meter | Ch8: Teddy is in the corner if teddy ≥ 2 |
| After Benny names Lenny | `ch2_collector_after` | Benny walks or doesn't; the cook's door | Ch3 Lenny: "Benny says you let him walk. Benny says you're a gentleman." / "Benny's got wires in his jaw. They put wires in, kid." Ch10: Benny on the crew steps aside or fights |
| (optional) Shovel for Sung | `ch2_shoveled` | $10 | Sung's later lines; Ending Two (Jin rents the room above the store) |

## Chapter ending and handoff
- Jin returns to the Iron Pulse back room. Teddy sees the brass on his hands, with blood on it. [beat] **Teddy:** "Those aren't boxing, kid." **Jin:** "I know." He lies down on the cot; the boiler's pilot light is the only colour. The camera eases out to 0.85 and holds 3 s. Fade.
- **Completion screen:** `CHAPTER 2 — NO ONE WAITING` / "Finding answers becomes personal revenge."
- **State handed on:** canonical look (track top, two-block hair, scar); movement 100%; dash 1 charge; jab–cross; slip; knuckles equipped; Teddy's back room is Jin's base (heavy bag, mitts after 9 PM); evidence +2; belongings: the dish, the track top, the licence; new world-map places: Starlite Lanes (via Benny).
