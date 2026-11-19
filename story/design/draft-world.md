# Inside the Impact — Story Mode design draft (world and people lens)

Draft by the world/people agent. Lens: MapleStory-style lived-in places, connected locations, NPCs with routines and opinions who react across chapters, optional quests that grow characters, ordinary activities, and places that change after you leave them. Every section of the shared format is covered. The story PDF is canon and wins over anything here; canon names come from BRIEF.md. Decisions I had to make alone are logged at the end ("Decisions log").

Conventions: sizes are logical px on the 640x360 canvas, Jin is 48 px tall. Location ids are snake_case. Flags are snake_case and live in `G.flags`. Relationship ids live in `G.rel`. Money is in dollars. "Bark" = short speech bubble when Jin is near. `!` / `?` / `…` are the NPC markers from the brief.

---

# Global

## The shape of the world in one paragraph

Calder is a river city whose foundry died in 1992. Everything in the campaign is downstream of that closing: the foundry's worker housing (Foundry Courts) went up for sale, the Northside Community Council could not raise the money politely, and in August 1994 a fixed championship fight paid for the houses. The player sees the city in that order without knowing it: in Chapter 0 the Ashgrove Tower is a crane skeleton on the skyline; from Chapter 1 on it is finished and lit, and it hangs in the background of every exterior until Jin walks into it in Chapter 9. The dead foundry smokestack is the other constant landmark: visible from Eastgate rooftops, huge over Foundry Courts, a silhouette across the river from Alder Row.

## Cast bible

Look lines are written so they map onto the engine's LookDef (`build`, `hair.style`, `top.kind`, colours, `extras`). Faces are featureless; posture carries everything, so every important character gets a signature pose the player learns to read from across a street.

### Jin Seo (SEO, JIN), 26 in 1994, 28–29 in 1996–97

- **Look.** h 48, build `boxer`: developed shoulders, narrow waist. Skin warm tan. Hair `twoblock` dark brown (#3b2a22), fringe over the eyes, upper face shaded. Reddish scar patch on the right cheek (from 1996 on; in 1994 the cheek is clean, so the player sees the scar arrive). Street look (`jin_street`): muted blue zip track top (#4d6c8f) with off-white sleeve stripes, collar half up; black pants; worn white running shoes. From Chapter 2, steel knuckles (`knuckles`) when gear is equipped. Variants: `jin_ring` (1994: navy robe with off-white "SEO" stitched across the back, black trunks with a blue stripe, oxblood gloves), `jin_hospital` (pale blue-green gown), `jin_rehab` (heather-gray tee, navy sweatpants, gray hospital socks until Hana returns his shoes).
- **Body language.** 1994: loose, bouncing weight shift, chin tucked, smiles with the shoulders (a quick shrug-roll). 1996 onward: the same guard, but he stands with weight on the left leg, and in quiet moments puts his hands in the track-top pockets and leans on a wall (the art-direction pose). Signature poses: `leanWall` with hands in pockets under a streetlight; sitting on curbs and stoops with forearms on knees; when he reads documents his head drops a few px and stays down.
- **Voice.** Short sentences. Dry, not cruel. In 1994 he jokes; after waking he answers questions with questions and says less than he thinks (his thoughts in italics carry the rest).
  - 1994, to Min: "If I win, you can airbrush me yourself."
  - 1996, to Pike: "My name's Jin Seo. You can write that down too."
  - 1997, to Rook: "You had a list of names. I wasn't on it. Nobody asked me."
- **Wants.** Ch0: the title, and the rent paid. Ch1–2: his name back and his family. Ch2–4: the people who did this. Ch5 onward, slowly: something that isn't revenge, which the campaign gives him and then makes expensive.
- **Perspective on the central conflict.** He was the cost of someone else's good outcome. The game never lets him (or the player) settle whether that outcome was worth it; his own answer is the final choice.
- **How he changes.** From a man whose future was decided for him to a man who decides where someone else's cost falls. His dialogue tracks the player: if the player has shown restraint, he never talks like a man who brutalized everyone (lines gated on `G.flags`, see the registry).

### Min (Seo Min-ji), Jin's sister, 22 in 1994 (died January 1996, age 23)

- **Look.** h 42, build `slim`. Hair `bob` black with a small yellow clip. Oversized mustard-and-brown plaid flannel (`shirt`, color #a8843f, color2 #6b4a2e) over a white tee, light-wash jeans, red canvas sneakers. A camera strap across her body (`bag:#2e2a28`). In photographs (Ch6) she wears a thrift navy blazer for interviews.
- **Body language.** Talks with her hands, perches on counters and chair backs instead of sitting properly, throws fake jabs at Jin's shoulder, holds things up to the light to inspect them. Signature pose: sitting on the kitchen counter, heels knocking the cabinet.
- **Voice.** Quick, teasing, precise about money (she does the family's paperwork and is studying bookkeeping at Calder Community College at night).
  - Holding up the promo photo: "They airbrushed you into a different man. This guy has a jaw."
  - "I did your purse math. After Teddy, after the commission, after Uncle Sam, you're rich enough to be poor somewhere warmer."
  - In her ninth letter (Ch6): "I'm not going to stop looking. I'm going to stop waiting. Those are different, and I've decided I'm allowed the second one."
- **Wants.** To finish her certificate, to get Mom off night shifts, to be taken seriously by people with desks.
- **Perspective.** She never accepted that a man can just vanish from a hospital. She fought the institutions with forms, carbons, and certified mail, which is exactly what made her dangerous to the arrangement and why her letters were held.
- **How she changes.** Only through what she left: from teasing sister (Ch0) to relentless searcher (letters 1–8) to someone who, while still searching, starts living again (certificate earned December 1995, a job interview blazer half-hemmed).

### Mother — Mrs. Seo Mi-ok ("Umma"), 52 in 1994 (died January 1996, age 53)

- **Look.** h 40, build `old`. Hair `bun` black streaked gray. Dusty-rose `cardigan` over a cream blouse, long brown skirt, flat black shoes. Reading glasses on a chain (`glasses`). At work: a pincushion on her wrist and a cloth `apron:#8a8f7c`.
- **Body language.** Hands always busy: straightens Jin's collar, picks lint, stirs, folds. Stands at the stove with her back to the room while saying the most important things. Signature pose: `work` at the counter, then a half-turn of the head, not the body.
- **Voice.** Practical, plain English with Korean endearments; she calls him "Jin-ah". Worries about logistics because logistics are things she can fix.
  - "The 14 bus stops at eleven-forty. If you go twelve rounds, how do we get home?"
  - "I don't watch the punches. I watch your feet. When your feet are happy, I'm happy."
  - Shopping list (Ch6), her handwriting: "rice 10 lb / scallions / thread navy / BATTERIES (smoke alarm!!) / Min bus pass / stamps (lots)".
- **Wants.** Her children safe and fed; the rent current; Min to finish school.
- **Perspective.** Boxing was Jin's, so she supported it the way she supported everything: by taking extra alteration work to cover his training camp. After he vanished she kept working (alterations at Kessler Cleaners by day, Calder Linen Service nights) and signed every appeal Min typed.
- **How she changes.** Seen only through traces: the robe she finished in 1994; the hem she never finished in 1996.

### Coach Teddy Marsh, 63 in 1994

- **Look.** h 47, build `heavy`. Hair `gray_short` with `mustache:#b9b4aa`. 1994: red-and-gray satin corner jacket ("MARSH B.C." in off-white), gray slacks, white towel on the shoulder. 1997: navy security `uniform` with a `badge`, a flashlight, a ring of keys; Tuesdays a maroon bowling shirt "CIVIC ARENA OPS".
- **Body language.** 1994: arms crossed, chin up, taps two fingers on the ring apron when he wants Jin's attention, rolls a towel when nervous. 1996–97: same arms-crossed pose but with the shoulders lower; when ashamed he looks at his shoes and rubs the back of his neck. Signature pose: `armsCrossed` beside a ring post.
- **Voice.** Gravel, clipped, old gym sayings, never says "sorry" easily.
  - 1994: "Hands up, chin down, mouth shut. Two of those three you're good at."
  - 1997: "You said something's wrong. I heard you. I sent you out anyway. I've had two years to come up with a better reason and I don't have one."
  - Ch8, ringing the bell: "That's the bell. That's the bell, Jin."
- **Wants.** 1994: one champion out of his gym before he retires. 1997: to be useful to Jin without asking to be forgiven.
- **Perspective.** He believed the sport was honest if you were. He was not paid and did not know; his failure is that he heard his fighter and chose the title shot. He sold the gym in 1995 to cover the debts from Jin's training camp, took the night watch job at the arena because he could not stay away, and anonymously paid for the Seo headstone (Ch6 discovery).
- **How he changes.** From proud coach to the man who rings the bell that nobody rang for Jin.

### Lenny Voss, cutman / corner assistant, 44 in 1994

- **Look.** h 44, build `slim`. Hair `slick` black thinning, `mustache:#2a2220` (pencil). 1994: white cutman's shirt, black slacks, a pouch belt (Q-tips, enswell). 1997: short-sleeve brown shirt with a loosened tie, maroon windbreaker, a Q-tip behind his ear, cigarette (`cigarette`).
- **Body language.** Never still: bounces on his heels, pats his pockets, talks with both hands, hunches when cornered (`cower` comes fast). Signature pose: leaning into someone's ear with a hand cupped.
- **Voice.** Fast, wheedling, self-justifying; calls everyone "kid" or "pal".
  - 1994, handing the cup: "Teddy's mix, kid. Electrolytes. Drink it all, you were cramping in camp."
  - 1997: "A step. They said slow him a step. Nobody said nothing about your head. I fix faces, I don't break 'em."
  - If treated with patience: "I kept the tape 'cause I figured one day somebody'd come. I figured it'd be a cop. I didn't figure it'd be you."
- **Wants.** To be safe, to be paid, to never be the one holding the bag.
- **Perspective.** "Everybody got paid. I got paid least." He is the clearest example of the PDF's compromise: he made the deal Jin refused, for $2,500.
- **How he changes.** Admits, minimizes, then either runs (if threatened) or becomes a witness (if handled with restraint).

### The man in the camel coat (unnamed)

- **Look.** h 49, build `slim`. Hair `slick` silver. Long camel `coat` (#b08a5a, `long:true`) over a charcoal suit, cream `scarf`, brown leather gloves. Never removes the coat indoors.
- **Body language.** Very still. Stands in doorways rather than entering rooms. One hand always in the coat pocket; gestures only with the other, palm up, like a man showing you a price. Never sits. Signature pose: framed in a door, half lit.
- **Voice.** Soft, reasonable, uses numbers and "we".
  - Ch0: "Nobody's asking you to lie down. Just don't win. There's a difference, and it's twenty-five thousand dollars wide."
  - Ch0, leaving: "It was practical advice, Mr. Seo. Practical advice is the only kind I give."
  - Ch9, opening the boardroom door: "Mr. Seo. Same advice as last time. The terms are better."
- **Wants.** Nothing personal; he is the offer given a body.
- **Perspective.** Risk is something you price, and people are a kind of risk.
- **How he changes.** He doesn't. That's the point of him. He appears exactly three times (Ch0 dressing room, Ch9 boardroom door, Ch10 Alder Row gate), always in a doorway.

### Ray Castell, the champion, 30 in 1994, 33 in 1997

- **Look.** h 50, build `broad`. Skin light olive. Hair `curly` short dark brown. 1994: white-and-gold robe and trunks, white shoes. 1997 night workout: gray hooded sweatsuit (`hoodie`), hand wraps (`wraps`), a brace on the left knee shown as a pale band.
- **Body language.** 1994: bounces on his toes, rolls his neck, taps his gloves together twice before every exchange (a tell the player can learn). 1997: the same glove tap, slower; rubs his left knee between rounds; sits on the ring apron with his head in his hands when nobody's watching.
- **Voice.** Public: confident, media-polished, "Calder's own". Private: tired and blunt.
  - 1994, at the weigh-in poster: "Pride of Southport."
  - 1997: "I looked at the ref. He looked at the clock. So I threw it. You'd have thrown it."
  - 1997: "Everybody in that building knew. You came to me because I'm the one you can hit."
- **Wants.** To stay relevant. He carries a payroll: his mother's house, his trainer, two cousins on salary.
- **Perspective.** He knew Jin was impaired, benefited, and continued when he could have stopped. His fear was losing relevance, income, and the people invested in him. That explains him; it does not absolve him (PDF).
- **How he changes.** From champion to a man who can't sleep the night before fights and works out alone in an empty arena. He may testify (if spared) or retreat behind lawyers (if beaten past the bell).

### Hana Lim, rehabilitation worker, St. Agnes, 29

- **Look.** h 43, build `slim`. Hair `ponytail` black. Teal-green `scrubs` (#4f8a83) with a heather-gray `cardigan`, white sneakers, `lanyard`, `clipboard`, a wristwatch she checks during drills (`watch`). Off duty: navy peacoat, mustard scarf.
- **Body language.** Spots Jin with one hand hovering an inch from his back; hugs her clipboard to her chest when unsure; `handsHips` when she's decided. Signature pose: crouching to Jin's eye level beside the parallel bars, counting on her fingers.
- **Voice.** Warm, exact, a little funny; counts reps out loud; speaks in the language of records because she believes records are promises.
  - "Again. Your left foot is lying to you. Don't believe it."
  - "Someone replaced your name after the fight. That's not confusion, Daniel—Jin. That's paperwork."
  - "I'm a records person. I always make a copy."
- **Wants.** To do her job well. Then: to make her own institution tell the truth.
- **Perspective.** She initially trusts the file; a falsified chart is a betrayal of the thing her job runs on. Most of her coworkers are ordinary caregivers, and she never stops treating them that way.
- **How she changes.** From trusting the records to filing a formal complaint with the state Department of Health, at real risk to her job (Ch6 onward). She holds a copy of the evidence by Chapter 9.

### Gerald Pike, Council liaison to St. Agnes, 55

- **Look.** h 45, build `avg`. Hair `short` thin brown, combed over, `glasses`. Brown tweed `blazer` over a mustard sweater vest, dull green `tie`, tan slacks, a briefcase (`bag:#5a3e2b`).
- **Body language.** Hands clasped in front of his belt; stands too close to the bed; adjusts his glasses before saying something untrue; small, constant smile. Signature pose: `write` at the foot of the bed, chart on his forearm.
- **Voice.** Soft, bureaucratic, always "the fund" and "we", always calls Jin "Daniel".
  - "Confusion is very normal after an injury like yours, Daniel. The mind invents a more exciting story."
  - "Forty-one thousand dollars of care. Somebody had to sign for it every month. I signed."
  - Ch7: "I wrote everything down. I always write everything down. That was supposed to protect us."
- **Wants.** The arrangement quiet; the Council safe; himself blameless on paper.
- **Perspective.** He believes in the Council's work and thinks of himself as the man who did the unglamorous part. He stamped Min's letters "HOLD" and reported them to Rook.
- **How he changes.** From smiling gatekeeper, to a frightened man hiring muscle through Lenny, to a man packing boxes who hands Jin the ledger (Ch7).

### Rook (Walter Rook), leader of the Northside Community Council, 60

- **Look.** h 49, build `broad` (gone soft). Hair `buzz` gray. Brown canvas work `jacket` over a gray `cardigan`, work trousers, steel-toe boots, reading glasses on a cord (`glasses`). An old Buick, maroon (`car` sedan) is parked wherever he is.
- **Body language.** Sits on stoops with people instead of standing over them; hand on shoulders; rubs the back of his neck when listening; never raises his voice; when cornered he takes his glasses off and folds them. Signature pose: `handShoulder` on a resident, head tilted.
- **Voice.** Plain union-hall cadence, full of names and numbers.
  - Ch5, meeting Jin: "Jin Seo. You look like a man who could use a doctor. A real one. I know people at General."
  - Ch7: "The Kaczmareks. Six kids. The Delgados. Odette Baptiste, eighty dollars a month from a widow's pension. Two hundred and twelve households, and a bank that said no in four different typefaces."
  - Ch7: "I told myself once. Just once. That's what everybody tells himself, isn't it."
- **Wants.** For the Courts to stand. Then, increasingly, for no one to look at how.
- **Perspective.** He watched polite fundraising fail for eleven years. The criminal arrangement delivered what appeals had not, while the financiers took most of the profit. He authorized interference in the fight, let it continue when Jin was in danger, and chose to keep the concealed identity when told the family was searching.
- **How he changes.** From open benefactor to exposed man. He is never a boss fight (PDF). After Chapter 7 he either faces the residents himself or is faced by them, depending on the player.

### Mara Kowalski, Foundry Courts maintenance workshop co-manager, 34

- **Look.** h 44, build `avg`. Hair `bun` auburn under a red bandana (`headband:#a8433a`). Green-gray `overalls` (#6f7a63) over a cream thermal, brown work boots, tool belt, pencil behind ear. Gloves tucked in the back pocket.
- **Body language.** Always carrying something; points with a wrench; wipes her hands on a rag before shaking; sits on an upturned bucket, never a chair. Signature pose: crouched at a boiler valve, one hand up for a tool without looking.
- **Voice.** Dry, short, honest; asks for what she needs plainly.
  - "You've got shoulders. Grab the other end."
  - "You want to earn your keep or your sympathy? I only pay for one."
  - Ch7: "I'm not giving the roof back. I'm also not shaking his hand again. Both of those are true and I'll sort out how later."
- **Wants.** The boiler to last another winter; her crew paid on Fridays; help that doesn't feel like charity.
- **Perspective.** She knows the Council helped purchase the buildings. She does not know about the rigged fight (PDF). Her father worked the Foundry for thirty years.
- **How she changes.** From employer and friend to someone forced to hold gratitude and disgust at once. With trust, she brings the residents to Alder Row at dawn and opens the Council's books at the assembly (Ending Two).

### Mo Feeney, promoter of the Cellar, 58

- **Look.** h 42, build `heavy`. Hair `short` comb-over. Teal Hawaiian `shirt` with orange flowers under a black satin bowling `jacket` ("STARLITE LANES"), gold chain, unlit cigar (`cigarette`).
- **Body language.** Palms spread, "what can I tell ya"; leans on the bar; pats backs while steering people where he wants them. Signature pose: `shrug` with the cigar.
- **Voice.** Patter, nicknames, deal language.
  - "Champ! Ex-champ. Almost-champ. What do I call you?"
  - "I don't fix fights. I suggest outcomes."
  - "A fighter don't pay admission, kid. A fighter gets paid."
- **Wants.** A good card, a full room, nobody dying on his floor.
- **Perspective.** Everyone downstairs chose to be there, which he repeats because he knows it isn't quite true.
- **How he changes.** He doesn't much; the Cellar changes around him (quieter after Ch7 in Ending Two, busier and sponsored in Ending One).

### The underground fighters

- **Deshawn Tillery, 23.** h 47, `boxer`, dark brown skin, `braids` tied back, red `hoodie` with sleeves cut, gray sweatpants, black high-tops. Works days at the Northside Car Wash. Lives at Foundry Courts with his grandmother Odette Baptiste. Fights at the Cellar because Mo's back room is the only place with a real ring and sparring; refusing a booking means losing his key to it. Bouncy, cocky, generous with tips ("You're throwing that jab three times. I'm slipping the third.") Later the "local boxer" at the Courts gym who trains kids on Saturdays. Ch7: furious at Jin out of fear for his grandmother's home. Lines: "Ex-champ! You following me?" / "Don't you dare make my grandma's roof a question."
- **Tommy Reardon, 31.** h 46, `avg`, pale, `gray_short` buzz too early, plumber's navy work shirt. Fights to pay down a debt to Mo (a truck loan). Quiet, polite, apologizes before the bell. "Nothing personal. I owe him four hundred. You're forty of it."
- **Cyrus "Slim" Whitlock, 34.** h 51, `slim`, dark skin, `short` hair graying at the temples, long arms, faded green satin trunks, a towel over his head between rounds. Ex-pro (undercards 1989–92). Skilled enough to win; told the expected result is that he goes down in the second. Tired, funny, unbothered on the surface. "Mo wants you in the second. I go down in the second. Don't make it weird." If Jin asks him to fight straight: "Kid, I haven't been asked for my best in three years. Okay. Okay."

### "Dutch" Brannigan, boss collector, Harlan Freight Depot, 54

- **Look.** h 50, build `heavy`. `cap` gray flat cap, `beard:#8d8a84` stubble. Quilted navy `vest` over a red-black flannel, fingerless gloves, work boots.
- **Body language.** Walks slow, cuts angles; never chases, herds. Cracks his neck once before a fight. In his office he has a Little League team photo (his grandson, the Harlan Hawks) and handles it carefully.
- **Voice.** Calm, old-school, almost courteous.
  - "You don't run from a wall, son. You run into it. Saves time."
  - After defeat: "We collect. Some of what we collect goes to roofs. Funny world."
  - "Ask the Council where their boiler came from."
- **Wants.** His crew paid and his corner of the business left alone.
- **Perspective.** It's work. The Council's people "get their envelopes like everyone else".
- **How he changes.** Not much. He reappears in Chapter 10 with a cast on his wrist (unless `beat_dutch_after`, in which case he is in the hospital and his nephew Cal leads the crew).

### Foundry Courts residents (small, named, recurring)

- **Odette Baptiste, 71.** h 38, `old`, dark skin, `gray_short` hair under a lavender headscarf, lavender `cardigan`, long gray skirt, house slippers outside (always). Runs the laundry-room schedule and Wednesday soup in the community room; sweeps the Building A stoop every morning at 7. Deshawn's grandmother. Rook sat with her the night her husband died. Ch7: cannot reconcile her gratitude with what happened. "He sat with me when Leon passed. Right there in that chair. Don't you tell me what kind of man he is. Tell me what kind of man he was that night."
- **Hector Ruiz, 45.** h 47, `avg`, `short` black hair with a mustache, Calder Transit driver's blue `uniform` with a patch, a thermos. Tenant treasurer. Drives the night 14. Thinks in budgets; argues for the boiler fund. Ch7: afraid the bank will call the mortgage note if the deal comes out. "My kid was born in 2B. If this goes to a courtroom, who holds the note? You?"
- **Pauline Greer, 31.** h 43, `slim`, brown skin, `curly` hair pulled back, pale-blue `scrubs` under a puffer coat. Night-shift nurse's aide at Calder General. Argues for the after-school program because Tamika is alone at night. Ch6: knows how Calder General handles "sealed by payer" transfers. Ch7: rejects Rook immediately. "Get out of my kid's building. Today. I'll carry your boxes."
- **Tamika Greer, 8, and Benny Ruiz, 7.** h 30/28, `kid`. Tamika: pink puffer, `braids`; Benny: oversized Calder Steelhawks jacket (green-gold), `beanie`. Chalk hopscotch, snow forts, imitation boxing. Benny wants Jin to sign a toy glove. They mark the passing of time: the hopscotch layout changes each visit; by Chapter 7 Tamika has drawn Jin (a blue scribble) on the courtyard wall.
- **Mara's crew** (names on the payroll envelope): R. Esposito, A. Nunes, T. Odom, K. Brandt. Two are visible in the workshop (Ray Esposito, older, `avg`, gray cap; Ade Nunes, young, `slim`, orange beanie). They don't get arcs; they get paid or not.

### Celeste Ashgrove, chair, Ashgrove Capital, 48

- **Look.** h 45, build `slim`. Hair `bob` silver. Ivory `blazer` suit, pearl `earrings`, charcoal heels. Thin gold `watch`.
- **Body language.** Sits with hands folded on the table; stands only to walk to the architectural model, where she rests one fingertip on a building. Never hurried. Signature pose: at the floor-to-ceiling window with the city behind her, back half-turned.
- **Voice.** Gracious, philanthropic, speaks about "the city" as if it were a client.
  - "I've read everything you've done, Mr. Seo. It's a remarkable file."
  - "Somebody always moves. The only question a city ever answers is who, and whether they're helped."
  - "We can't give you 1994. We can give you 1998."
- **Wants.** The riverfront redeveloped, her family's name on something that lasts.
- **Perspective.** Displacement is a regrettable logistical step. She has rarely witnessed the consequences of her decisions (PDF).
- **How she changes.** She doesn't. In Ending Two she is investigated; in Ending One she hands Jin his belt.

### Lyle Penner, managing director, Ashgrove Capital, 42

- **Look.** h 47, build `avg`. Hair `slick` dark. Navy pinstripe `suit`, red `tie`, cufflinks, `watch`. Jacket off in his own office, sleeves rolled two turns.
- **Body language.** Leans on desks, taps a pen against his teeth, paces. Points at documents rather than people. Signature pose: sitting on the edge of the boardroom table.
- **Voice.** Brisk, numbers-first, frank to the point of insult.
  - "Nobody in this building hurt you. We priced a risk."
  - "If he's still standing in the fourth, end it." (as quoted by Ray, Ch8; Penner gave the final instructions)
  - "You'll be on a poster again. A good one this time."
- **Wants.** The Alder Row closing on May 30.
- **Perspective.** Markets clear. People are inputs.
- **How he changes.** Not at all; he is investigated in Ending Two and promoted in Ending One's epilogue report.

### Alder Row Cooperative residents (Chapter 10; strangers)

They do not get backstories (PDF). They get visible lives and one line each, and the player never learns that any of them is connected to Jin.

- **The shoe-repair man.** Older, `avg`, gray `mustache`, brown shop `apron`. Pulling the roll-down gate of PHAN SHOE REPAIR · KEYS CUT halfway, then back up, then halfway. "Forty pairs on the shelf. Whose shoes do I give back first?"
- **The woman with the crib.** 30s, `avg`, `ponytail`, green coat. Carrying a disassembled crib away from the entrance, one piece at a time. "Don't help me. I don't know who you're with."
- **The co-op secretary.** 60s, `old`, `bun` gray, red cardigan, a clipboard of signatures. Argues with the young man: "If we fight they'll say we were violent and the judge will believe them."
- **The young man.** 20, `slim`, `hood`, holding a broom handle he doesn't know how to use. "And if we don't they'll say we agreed."
- **The old man in the chair.** 80s, `old`, cardigan, sitting on a kitchen chair in the main doorway with a radio on his lap playing the morning traffic report. Says nothing at all unless Jin sits near him: "I've lived here since Truman. I'll sit."
- **The teenager with the boombox.** 15, `kid` build scaled up (h 40), oversized tee, on the stoop. Turns the music off when the enforcers arrive and doesn't turn it back on.

## Flags & relationships registry

### Relationship meters (`G.rel`)

Integer, starts at 0 unless noted, clamped -5..10. "Trusts Jin" = 4+. Changes are small (±1, rarely ±2) and always shown by a reaction, never a number. The People archive shows a one-line "how they see you" that rewrites itself at 0, 4 and 8, and below 0.

| id | Who | Moves up | Moves down | Read at |
|---|---|---|---|---|
| `hana` | Hana Lim | finishing drills she sets (+1 each, max +3 in Ch1); telling her the truth (+1); calling her from the YMCA (Ch2, +1); repaying her $40 (+2); visiting St. Agnes in Ch6/Ch9 (+1 each) | lying to her about where he's going (Ch1, -1); never contacting her after Ch1 (no penalty, just stays low) | Ch6 complaint scene tone; Ch9 copy holder; Ending Two process; epilogue |
| `teddy` | Coach Teddy Marsh | letting him explain in Ch3 (+1); asking whether he looked for him (+1); accepting the robe (Ch8, +1); stopping at the bell (Ch8, +2) | walking away mid-explanation (Ch3, -1); continuing past the bell (Ch8, -2) | Ch8 bell scene, Ch9 copy holder, epilogue gym |
| `lenny` | Lenny Voss | not threatening him (+2); presenting the tape calmly (+1) | threatening (-3) | Ch9 witness availability, Ending Two testimony |
| `deshawn` | Deshawn Tillery | bout 1 sportsmanship (touch gloves, +1); Ch5 mitts and gym help (+1 each, max +2); keeping the corner promise (Ch6, +3); throwing the towel when he can't see (+1) | skipping the corner promise (-3); Ch7 if Jin tells the residents himself without warning him (-1) | Ch7 anger intensity; Ch10 ally; epilogue gym |
| `slim` | Slim Whitlock | asking for a straight fight (+2); covering his docked pay (+2) | taking the dive silently (0, no change: "everybody does") | Ch6 Cellar barks, Ch9 night visit |
| `mara` | Mara Kowalski | work shifts (+1 each, max +3); returning the wage envelope (+2, or +3 if handed to her with the truth); asking for the archive key (+1); keeping the Ch6 commitment (+1, she hears from Odette) | taking the archive key without asking (-2); `took_wage_envelope` and never returned (-1 at Ch7 when the books are opened) | Ch6 key scene, Ch7 reaction, Ch9 copy holder, Ch10 residents at the gate |
| `courts` | Foundry Courts residents as a group | Ch5 optional quests (+1 each: groceries, washer, ball on the roof, kitchen roof, hall light); donating to a fund (+1); staying for Wednesday soup (+1) | `took_wage_envelope` unreturned (-2 at Ch7); Ch7 public accusation without Rook present (-1) | Ch7 assembly mood, Ch10 support, epilogue |
| `odette` | Odette Baptiste | carrying her groceries (+1); Wednesday soup (+1); fixing the kitchen roof (+1); sitting with her in Ch7 (+1) | — | Ch7 scene variant |
| `rook` | Walter Rook | — (not a friendship meter; tracks how much he will say) accepting his doctor (+1); letting him speak at the assembly (+1) | public humiliation in Ch7 (-1) | Ch7 confession length, Ch9 night barks, Ending Two testimony |

### Choice and state flags (`G.flags`)

| id | Values | Set where | Read where |
|---|---|---|---|
| `purse_wish` | `rent` / `radiator` / `tuition` | Ch0 kitchen table | Ch6 Min's letters quote it; Ch9 Penner's dossier knows it; Ending One epilogue line |
| `refusal_tone` | `flat` / `angry` / `silent` | Ch0 dressing room | Ch9 the camel-coat man quotes it back |
| `insisted_to_pike` | bool | Ch1 day 3 | Ch1 chart note text; Ch7 Pike's line |
| `told_hana_early` | bool | Ch1 first session | Hana's trust curve in Ch1; Ch9 Hana line |
| `signed_real_name` | bool | Ch1 AMA discharge form | Ch2 collectors' opening line; Ch9 Penner ("That's when we started paying attention"); Ending Two Hana's complaint is stronger |
| `earl_crossword` | bool | Ch1 optional | Ch9 night visit to St. Agnes |
| `called_hana_ch2` | bool | Ch2 YMCA payphone | Ch3 Hana message at the YMCA desk |
| `saw_height_marks` | bool | Ch2 3B doorway | Ch9 night: Mrs. Alvarez has added her daughter's mark |
| `hurt_collector_after` | bool | Ch2 questioning | Ch3 Lenny has heard; Ch7 Pike's line; Jin's self-talk |
| `paid_cellar_admission` | bool | Ch3 door | Mo's first line |
| `teddy_stance` | `listened` / `cold` | Ch3 bar | Ch8 opening; Ch9 copy holder |
| `slim_fought_straight` | bool | Ch3 warm-up room | Ch3 bout 3 difficulty and purse; Ch6/Ch9 Slim barks |
| `covered_slim_pay` | bool | Ch3 after bout 3 | Slim's Ch9 line |
| `threatened_lenny` | bool | Ch3 cutman's room | Lenny flees town after Ch4 if true; Ending Two testimony |
| `took_depot_profit` | bool | Ch4 cash office | Dutch's Ch10 line; Ch9 Penner's dossier |
| `took_wage_envelope` | bool | Ch4 cash office | Ch5 payroll missing; Ch7 books; Mara meter |
| `returned_wage_envelope` | `none` / `lockbox` / `told_mara` | Ch5 night | Mara; Ch7 |
| `beat_dutch_after` | bool | Ch4 questioning | Ch10 Dutch present or his nephew Cal |
| `accepted_rook_doctor` | bool | Ch5 day 2 | Ch5 day 3 appointment; Ch7 Rook's line; Ch9 the offer feels familiar |
| `promised_deshawn_corner` | bool | Ch5 day 2 | Ch6 Friday choice exists only if true |
| `courts_donation` | `none` / `boiler` / `afterschool` / `kitchen` | Ch5 assembly | Ch7 Hector/Pauline/Odette lines; epilogue |
| `ch6_friday` | `corner` / `ortiz` / `none` | Ch6 Friday | Deshawn meter; Ortiz evidence version |
| `towel_thrown` | bool | Ch6 corner | Deshawn line in Ch7/Ch10 |
| `archive_key` | `asked` / `took` | Ch6 | Mara meter; Ch7 Mara line |
| `bought_smoke_detector` | bool | Ch6 after the fire report | Jin's room prop in later chapters; Ending Two room |
| `truth_told_by` | `rook` / `jin` / `posted` | Ch7 | Ch7 assembly reactions; Ch10 |
| `left_courts_loft` | bool | Ch7 end | base for Ch8–Ch9; epilogue |
| `ray_spared` / `ray_beaten_past_bell` | bool (exclusive) | Ch8 after the bell | Ray testimony; Teddy; Ch9 Penner; Ending Two |
| `fought_ray_bare` | bool | Ch8 (take off the knuckles) | Teddy's line; ring echo |
| `copies_given` | set of `hana` `mara` `teddy` `lenny` `ray` `nowak` `sun` | Ch9 | Ending Two: who exposes what |
| `ending` | `champion` / `own_name` | Ch10 | endings |

Every flag only changes dialogue, assistance and epilogue content. None of them removes either ending or decides it.

## Evidence and memory registry

Evidence ids start `ev_`, memories `mem_`. "Proves" is what the journal shows under the item and what the item can support in a `present` confrontation.

### Chapter 0
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `mem_kitchen_table` | Rent, radiator, tuition | 3B kitchen, family scene | The three things the purse would fix; who said what. | What the family hoped for. |
| `mem_robe` | Last stitch | Jin's room, Mom finishing the robe | Mom bites the thread off the "N" of SEO. | — |
| `mem_camel_coat` | Twenty-five thousand dollars wide | Dressing Room 2 | The offer, word for word. | Someone tried to buy the result. |
| `mem_orange_cup` (fragment) | Teddy's mix | Interrupted recollection, round 2 | A paper cup, orange, bitter "like aspirin and pennies"; whose hand is cut off. Completed in Ch3 (Lenny's hand) and Ch8 (full). | Something was administered backstage. |
| `mem_bell` | The bell kept going | Round 3 | Last clear sound. | — |
| `mem_section_14` | Section 14, Row F | Ring walk | Mom holding the program in both hands, Min with a cardboard sign "EASTGATE'S OWN". | Where his family sat. |

### Chapter 1
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_bed_card` | The name above the bed | Room 214 | "AHN, DANIEL · DOB 03/11/68 · Dr. P. Whitcomb · FALL RISK". DOB is Jin's real birthday: whoever did this used his real date. | The false identity. |
| `ev_face_sheet` | Current chart face sheet | Nurses' station chart rack (examined with Hana) | "AHN, DANIEL. Admitted 09/02/94 from Calder General. Dx: closed head injury, industrial accident (salvage work), Calder Foundry site, 08/20/94. Payer: Northside Community Council, Foundry Workers Relief Fund. Liaison: G. Pike. Note: Pt may present with confabulated history. Redirect gently." Plus a dated note that matches what the player said to Pike. | The official story. |
| `ev_belongings_tag` | Belongings bag | Storage closet, Ch1 week 5 | Bag tag "AHN, D. Rm 214". Inside: blue track top, white shoes. Inside the collar in marker: "SEO J." in Mom's hand. | The man who arrived was Seo Jin. |
| `ev_earl_testimony` | Earl's Foundry | Roommate Earl Dunning (optional, recommended) | The melt shop closed March '92; salvage was the Pulaski brothers' crew; no injury on the site in '94; "I'd have heard. I hear everything from that bed." | The accident story is false. |
| `ev_visitor_log` | Visitor log | Lobby desk binder | 26 visits signed "G. Pike, NCC". Family visits: none. Margin: "Family contact per liaison only." | Pike controlled contact. |
| `ev_transfer_form` | Interfacility Transfer Form T-0902-17 | Medical Records basement, with Hana | Calder General → St. Agnes, 09/02/94. "Patient: SEO, JIN. Age 26. Mechanism: blunt head trauma, boxing bout, Calder Civic Arena 08/20/94. Payer: NCC Foundry Workers Relief Fund. Next of kin: SEO, MI-OK (mother), 412 Kessler Ave #3B. NOK NOT NOTIFIED, PER PAYER REQUEST." Same transfer number as the face sheet. | Someone replaced his identifying information after the fight (PDF's first evidence). Gives the address. |
| `mem_hands_up` | Hands up, chin down | Rehab gym mirror | Teddy's voice during the first footwork drill. | — |

### Chapter 2
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_fight_poster` | CASTELL vs SEO | Kessler Ave poster wall, under three layers | "FOR THE CHAMPIONSHIP · CALDER CIVIC ARENA · SAT AUG 20 '94 · RAY 'PRIDE OF SOUTHPORT' CASTELL vs JIN SEO". Jin's photo half torn. | He existed publicly. |
| `ev_missing_flyer` | MISSING | Corner of Sun's Noodle window, sun-faded | "MISSING: JIN SEO, 26. Last seen Calder General Hospital, Sept 1, 1994. Boxer. Scar? (no) Call 555-0148 or Sun's Noodle." Min's handwriting on "(no)". | Min searched. |
| `mem_height_marks` | Behind the fridge | 3B kitchen doorframe (if Mrs. Alvarez lets him in) | Pencil marks: MIN 4, JIN 8 ... JIN 17, MIN 13. Above them, painted over. | — |
| `ev_van_work_order` | Work order | Gray van glovebox | "PICKUP: AHN, D. Return to St. Agnes. Auth: G.P. $200/man. Booked by L.V., Starlite." | Pike sent the collectors; Lenny booked them. |
| `ev_collector_statement` | What the collector said | Questioning in Tanner Alley | Lenny Voss hires them; works the Cellar under Starlite Lanes; paid by "the hospital guy with the vest". | Lenny = corner assistant now at the underground arena. |

### Chapter 3
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `mem_corner_r2` | "Something's wrong" | Teddy's account at Starlite bar | Completes the corner exchange: Jin saying it, Teddy's half-second look, Lenny's "he's fine, Ted". | His corner heard him and sent him out. |
| `ev_cellar_book` | Mo's card book | Mo's office desk | A ledger of bouts with pencil marks in a column headed "EXP." (expected): "Whitlock — 2nd". | Outcomes are arranged. |
| `ev_cassette` | Partial recording | Lenny (given or found in Mo's office tape drawer) | Hallway, Civic Arena, Aug 20 '94. Camel-coat voice: "...one cup, before he walks. A step slower, that's all anyone needs..." Second voice (Lenny): "And if he don't slow?" Coat: "Then it's not your problem. If he's still standing in the fourth—" Recorded over by a radio jingle for Calder Savings. | The sabotage was planned; a "fourth round" instruction existed. |
| `ev_payment_slip` | Payment slip | Lenny's wallet | Carbon: "HARLAN FREIGHT · MISC. LABOR · L. VOSS · $2,500.00 · 8/22/94 · window 2". | Payment ran through the Harlan Street depot. |
| `mem_orange_cup_2` | Lenny's hand | After Lenny's admission | The fragment now shows Lenny's hand and his ring. Still not complete (who ordered it). | — |

### Chapter 4
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_civic_ledger` | Special account "CIVIC" | Records room, upstairs depot | Aug–Sept 1994: "8/19 dressing rm access — $1,000 · 8/22 L.V. — $2,500 · 8/24 payout recd — Riverside Holdings wire · 9/2 private transfer, Keystone Medical Transport — $1,800 · 9/2 paperwork G.P. — $500 · 9/28 NCC share — see Disb." | The gang handled the fight money and his hospital transfer. |
| `ev_keystone_invoice` | Keystone Medical Transport invoice | Records room file | "9/2/94 · Calder General → St. Agnes · 1 pt, non-emergent · name: per G.P. · bill to Harlan Freight". | The transfer was paid by the gang. |
| `ev_disbursements` | NCC disbursements | Records room ledger 2 | "9/28/94 Foundry Courts purchase deposit $410,000 · 3/95 boiler, Bldg A $38,000 · 6/95 roofs B–C · 11/95 community room · weekly: Courts maint. wages". | Criminal money has legitimate destinations (PDF). Jin first reads it as a front. |
| `ev_wage_envelope` | Payroll envelope | Cash office safe (examined either way) | "FOUNDRY CTS MAINT. · WK OF 1/20/97 · KOWALSKI M. / ESPOSITO R. / NUNES A. / ODOM T. / BRANDT K. · 5 @ $128 = $640". | Whose money it is. |
| `ev_dutch_statement` | What Dutch said | Questioning in the yard | The Council's share was negotiated by Rook "in this office, in '94"; "ask the Council where their boiler came from". | The Council and the outfit are partners. |

### Chapter 5
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_deed_plaque` | Saved by its people | Community room wall | Brass plaque: "FOUNDRY COURTS MUTUAL HOUSING · Purchased by its residents with the Northside Community Council · October 3, 1994". | Bought six weeks after the fight. |
| `ev_assembly_minutes` | Minutes, Sept 1994 | Community room binder | "W. Rook reports purchase funds secured through private partners. Questions on source deferred to next meeting." (next meeting's minutes: no mention). | The source was never explained. |
| `ev_rook_slip` | "You look like a man who's been in one" | Rook's visit | Rook calls Jin by his real name before anyone introduces him and alludes to a hospital he was never told about. | Rook knows more than he says. |
| `ev_mehta_assessment` | Dr. Mehta's notes (if `accepted_rook_doctor`) | Calder General outpatient | "Reflex latency exceptional. History of subdural bleed. Not cleared for contact sport. Program referral: Hollis Neurorehabilitation, Boston, 18 mo., est. $96,000, not covered." | His limits are real; the price of real recovery. |

### Chapter 6
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_eviction_notice` | Notice to Quit | St. Casimir's box 1 | 412 Kessler #3B, March 3, 1995, arrears $1,140. | They lost the apartment. |
| `ev_skip_tracer` | Mercer Investigations receipt | Min's folder | Retainer $300, Nov 1994; report: "No record of subject at Calder General after 9/1." | The search consumed money. |
| `ev_ncc_referral` | Referral letter | Min's folder | NCC Tenant Emergency Fund, Jan 1995: "Eastgate is outside our service area. Referred to Calder Housing Authority." Signed G. Pike. | Requests were redirected, by the same man. |
| `ev_cha_letters` | Housing Authority letters | Min's folder | Feb 1995 "pending: verify status of household member SEO, JIN"; April 1995 "denied: incomplete". | Assistance delayed; the concealment made Jin impossible to document. |
| `ev_standard_regret` | Standard regret | Min's folder | NCC, July 1, 1995: "We have no record of the individual you name." | The Council denied knowing him. |
| `ev_shopping_list` | Shopping list | Mom's sewing tin | See Mother's voice above. | Their lives were not only pleading. |
| `ev_half_hem` | Half a hem | Box 2 | Min's navy interview blazer, hem pinned, half stitched, needle still threaded. | Unfinished repair (PDF). |
| `ev_after_fight_note` | Sun's after | Mom's metal recipe box | The Ch0 fridge note: "AFTER THE FIGHT → SUN'S. I'M BUYING. (UNLESS YOU LOSE.) — M". Second line, blue pen: "Still buying. 3/11/95". | A message about meeting after the fight (PDF). |
| `ev_complaint_file` | Complaint 95-2231 | City Hall Annex, Housing Inspection | 9/14/95 complaint by M. Seo and four residents: rear fire escape door padlocked, no working smoke detectors 2F, space heaters, overloaded wiring. Inspection 10/30/95 "no access"; 12/11/95 "postponed (staffing)"; next date 1/22/96. | Unsafe conditions were known and unresolved. |
| `ev_fire_report` | Fire Marshal report | City Hall Annex, Fire Marshal records | 1/14/96, 3:10 a.m., origin room 7 (2F rear), space heater on overloaded circuit; rear fire escape door padlocked; deceased: SEO, MI-OK (53), SEO, MIN-JI (23), room 9. | How they died. |
| `ev_min_prints` | Unclaimed prints #4471 | Kessler One-Hour Photo (pay $7.38) | 24 prints: Mom asleep at a sewing machine in room 9; the padlocked fire escape door with a ruler for scale (Min documenting the complaint); a cake with "JIN 27" (March 1995); Min holding a bookkeeping certificate (Dec 1995); Garrison Street in snow (Jan 12, 1996). | Their life, their agency, their documentation. |
| `ev_ortiz` | Abel Ortiz's account | In person (Greyhound depot) or his letter | Min bought batteries for the hallway detector herself; the landlord's agent Leon Fisk padlocked the fire escape "against junkies"; Min went to the Council office in person twice; Mi-ok worked nights and slept in the day. | Testimony to the conditions and the search. |
| `ev_min_letters` | Eleven letters | Council archive, Foundry Courts basement | Letters from Min addressed "Jin Seo, c/o Northside Community Council, Foundry Workers Relief Fund", Sept 1994–Dec 1995, unopened, rubber-banded, stamped "HOLD — G.P." | The organization withheld information. Title of the chapter. |
| `ev_pike_memo` | Memo, 6/12/95 | Same archive box | "To W. Rook from G. Pike. Re: Seo family. The sister has written seven times and came to the office twice. She has traced the Relief Fund from the Calder General ambulance invoice. Request instruction." Rook, in pencil: "Hold. No confirmation. We do not move him and we do not open this. Not now. — W.R." Below, Pike: "7/1 standard regret sent." | THE CRITICAL DISCOVERY: Rook was informed the family was searching and chose to preserve the concealed identity. |
| `ev_headstone_ledger` | Cemetery office ledger | Mount Hope office | "Seo, Mi-ok / Seo, Min-ji, Sect. F row 9. Stone: paid cash, T. Marsh, 4/96." | Teddy paid. |
| `mem_snow_garrison` | Snow on Garrison | Sitting at Lindell's fence | The last photo, re-imagined. | — |

### Chapter 7
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_pike_ledger` | "Daniel Ahn" account | Pike, Council HQ records room | 26 monthly payments to St. Agnes, $1,400–$1,650; total $41,210. | The Council paid for his concealment and his care. |
| `ev_rook_notebook` | Rook's 1994 notebook | Rook's desk drawer | "Foundry Co. liquidation — deadline 9/30 — 212 households — Calder Savings no — state program '96 — B. (Brannigan) says a share of a sure thing — one time." | The negotiation and the deadline. |
| `ev_chain` | The chain | Timeline board result | Forced result → payout → negotiated share → Foundry Courts; concealment protected everyone. | The complete money trail (PDF). |
| `ev_rook_admission` | Rook's admission | Confrontation | He authorized interference; kept it going after Jin was hurt; chose "hold". | Responsibility. |

### Chapter 8
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `mem_orange_cup_full` | The whole cup | Dressing Room 2 | Full memory: Lenny hands the cup; in the doorway, a camel coat. | Completes the Ch0 fragment. |
| `ev_ambassador_contract` | Community Ambassador Agreement | Ray's gym bag | Ashgrove Capital and Raymond Castell: appearance fee $40,000 "for groundbreaking at Alder Row Commons, upon closing of the Alder Row acquisition (scheduled May 30, 1997)". Signed L. Penner, Managing Director. | Identifies the financial leadership and the upcoming property transaction (PDF). |
| `ev_ray_statement` / `ev_penner_note` | Ray's statement / "4th — L.P." | If `ray_spared`: Ray talks. If `ray_beaten_past_bell`: a folded note from his wallet. | Penner gave the final instructions ("If he's still standing in the fourth, end it"). | Who gave the final instructions. |

### Chapter 9
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_project_alder` | Project Alder | Penner's office | "Acquisition of Alder Row Cooperative (38 units). Closing 5/30/97. Cooperation of key members to be secured on site." | What he would be doing. |
| `ev_terms_sheet` | Terms | Boardroom, handed to Jin | Hollis Neurorehabilitation 18-month program; apartment, Riverside Lofts 9C; stipend $2,000/month for 3 years; legal restoration of name (petition already drafted); three tune-up bouts then a title eliminator at Calder Civic Arena. | The offer is real (PDF: benefits are real). |
| `ev_dossier` | Their file on him | Boardroom table | Photographs of Jin at the Cellar, at Foundry Courts, Hana's complaint letter, a copy of his AMA form. | They followed his progress. |

## Progression

Three kinds of advancement stay separate (PDF): physical control (training and combat), knowledge and access (evidence and introductions), relationships and consequences (meters and flags).

### Combat skills: when and why

| Chapter | Unlocks | Where / why in-story |
|---|---|---|
| 0 | Jab, cross, guard, slip (basic), walk/run/jump. Prime body: power 1.3, no breath. | Mitt warm-up with Teddy in Dressing Room 2. This body is taken away at the end of the chapter. |
| 1 | Walk → stand unaided → stairs → jump (hop) → run. No punches ("Hana: not yet"). | Rehab sections separated by time cards. |
| 2 | Dash and backdash (2 charges), jab–cross, slip vs. slow committed attacks. Breath on. Gear: steel knuckles. | Tanner Alley: instinct returns under threat; knuckles taken from the first collector. |
| 3 | Hook (jab–cross–hook), counter-cross (slip-counter). Heavy bag drill. | Hook from a short bag drill in the Cellar warm-up room (practice). Counter from Deshawn's tip in the warm-up room, then confirmed the first time Jin slips a real punch in bout 1 (encounter). Never a recovered memory (PDF). |
| 4 | Air dash, dash straight. | Air dash: a gap between container stacks on the depot catwalks (practice under pressure). Dash straight: a baton guard blocking a narrow office corridor (the only way through is a committed straight at the end of a dash). |
| 5 | Uppercut. Gym drills (bag, mitts) join the training menu. | Deshawn's mitts in the Courts basement gym: "You don't come up from underneath." |
| 6 | Flurry. Full core toolkit complete. | Speed bag in the Courts gym on the morning of day 1 ("Stop thinking. It's a rhythm."). PDF: by Chapter 6 he has the essential tools. |
| 7–10 | Nothing new. Fights test mastery. | — |

Blocked verbs are always explained at the moment they are pressed: rehab ("Not yet. Hana's hand is on your back."), carrying ("Hands full."), the sabotaged fight (no prompt; Jin's thoughts: "My legs are late." "I can't hear the corner."), the Ending One clearance (punch becomes shove: "Not a fight. You're clearing a door.").

### Training

Training menu opens in Chapter 1. Each drill has levels 0–3 (engine cap 3). A level needs one clean run of the next drill tier, not repetitions, so there's no grind. Per-chapter caps keep it story-paced:

| Drill | Where | Ch1 | Ch2–4 | Ch5 | Ch6+ | Effect (engine) |
|---|---|---|---|---|---|---|
| balance | St. Agnes rehab gym; later Courts gym | 1 | 2 | 2 | 3 | shorter landing/hurt recovery |
| footwork | rehab gym floor marks; YMCA track; Courts gym chalk marks | 1 | 2 | 2 | 3 | dash recharge up to −15% |
| reaction | Hana's pads; Courts gym (Deshawn) | 1 | 2 | 2 | 3 | slip window up to +20 ms |
| conditioning | St. Agnes corridor laps; YMCA track; Foundry Street loop | 1 | 2 | 2 | 3 | breath max up to +30 |
| bag | Cellar warm-up room (Ch3); Courts gym | — | 1 (Ch3+) | 2 | 3 | punch damage up to +10% |
| mitts | Courts gym with Deshawn; Ch8 with Teddy in the arena before Ray arrives (optional) | — | — | 2 | 3 | counter window up to +60 ms |

Training costs in-game time only (a time-of-day step), never money. A drill partner's line changes as the meter rises (Hana, Deshawn, Teddy), so training is also a relationship scene.

### Money

Modest, physical, and always pointed at Jin's immediate life. The journal's Money page lists the price of the Hollis program ($96,000) under "What it would take" from Chapter 5 on, so the gap is visible and permanent. The most money a player can possibly hold across the whole game is about $1,700 including the wage envelope.

Sources:
- Hana's loan, end of Ch1: $40.
- Cellar purses, Ch3: bout 1 $60, bout 2 $80, bout 3 $120 straight / $150 with the dive.
- Ch4 cash office: criminal profit $300 (`took_depot_profit`), wage envelope $640 (`took_wage_envelope`).
- Foundry Courts work shifts, Ch5–Ch7: $15 each (boiler valve, radiator carry, washer repair, hall light, kitchen roof, Ch6 storm drain), at most 7 shifts.
- Corner money, Ch6 (if he works Deshawn's corner): $20.

Sinks (each one buys something small and human, never power):
- Bus tokens $1 (fast travel between unlocked map nodes).
- YMCA room $8/night, Ch2–Ch4 (paid automatically at chapter start, shown on the completion screen).
- The Cellar door, Ch3: $10, or fight instead.
- A bowl at Sun's: $4 (a sit-down scene, no stat effect).
- Covering Slim's docked pay: $100.
- Returning the wage envelope: $640 (only as much as he still has).
- Min's unclaimed prints: $7.38.
- Flowers at Mount Hope: $4.
- A smoke detector for his own room: $9 (Ch6, after the fire report).
- Repaying Hana: $40.
- A pair of kids' gloves for Benny: $12 (Ch5–Ch9).
- Courts fund donation at the assembly: $10 / $25 / $50.
- Photocopies of the evidence at Kessler Drug, Ch9: $6.40.

Money never buys training levels, health, skills or anything in the endings. The recovery package exists only inside the Ch9 offer.

### Difficulty

Per the brief, difficulty scales only Jin's condition recovery (story / normal / veteran). Damage, enemy timing, and story outcomes never change. Fights retry from their start; scripted losses (Ch0) are not failures.

## World map

Calder's map is a hand-drawn transit-style map that fills in as Jin learns places. Nodes are joined by Calder Transit routes (the 14, the 3, the 22, the 9); fast travel between unlocked nodes costs a $1 token and plays a short bus-window transition (parallax city sliding past, rain or snow streaking per chapter). Locked nodes show a reason on hover.

| Node | Places inside | First unlocked | How it changes later |
|---|---|---|---|
| **Eastgate — Kessler Avenue** | Kessler Ave street, 412 Kessler (Sun's Noodle House ground floor, stairwell, 3B), Kessler Drug & One-Hour Photo, Pruitt's Laundromat, Marsh Boxing Club → Iron Pulse Fitness, Tanner Alley | Ch0 | Ch0 summer 1994, busy and warm. Ch2 Dec 1996: snow, shuttered newsstand, Iron Pulse neon, 3B lived in by the Alvarez family, Jin's poster buried. Ch6: Sun's has a new menu board; Mrs. Alvarez's daughter's drawing in the 3B window. Ch9 night: the height marks have a new line, "ROSIE 1997"; Sun's late light on. Endings: Ending One a Jin comeback poster goes up on the same wall where his 1994 poster was buried; Ending Two the wall stays layered, and Jin passes it on his way to work. |
| **Hillcrest — St. Agnes** | Room 214, 2 West corridor, day room, rehab gym, medical records, lobby and garden | Ch1 | Ch6: Hana under review; Pike's name gone from the sign-in binder; a new "Patient Rights" poster at the desk that Hana put up. Ch9: Earl's bed has fresh flowers and a postcard from Florida (he went to his daughter's); Hana's office has a box of copies. |
| **Downtown — Front Street** | Calder YMCA (room 312, indoor track), bus terminal | Ch2 | After Ch4 the YMCA desk clerk Gus holds messages ("A Ms. Lim called"). Ch9: Jin's old room is rented to a teenage boxer. |
| **Route 9 — Starlite Lanes & the Cellar** | Bowling alley, bar, shoe counter, Cellar ring, Mo's office, warm-up room, loading alley | Ch3 | Ch6 (Friday): Jin works a corner here. Ch7+: league night posters; Slim teaching a kid in the warm-up room. Ending Two: Mo's Cellar is quieter, the "EXP." column gone from his book. Ending One: banner "SEO RETURNS" behind the bar. |
| **Harlan Street — Freight Depot** | Approach street and Harlan Grill, loading docks, offices, yard | Ch4 | After Ch4: gate chained, "CLOSED FOR INVENTORY"; visible only from the bus. Ch10: its trucks carry the enforcers to Alder Row. |
| **Northside — Foundry Courts** | Courtyard, Buildings A/B, workshop and loft, community building (community room, basement gym, Council archive), boiler room, Odette's 1C | Ch5 | Ch6: thaw; Jin lives in the loft; kids know his name; the hopscotch now includes a "boxing square". Ch7: rain; someone has chalked "WHO PAID FOR OUR ROOF?" on the wall; residents split. Ch9 night: Mara on the workshop step; quiet. Endings: Ending Two Saturday kids' class in the basement gym (if Deshawn/Mara relationships survived); Ending One a billboard of Jin's comeback visible over the courtyard wall. |
| **Northside — Council HQ** | Old Local 1197 union hall on Foundry Street: lobby, stairwell, records room, Rook's office, assembly hall | Ch5 (visible, closed: "Office hours Tue/Thu 10–4") → open Ch7 | After Ch7: "CLOSED UNTIL FURTHER NOTICE" in Pike's handwriting. Ending Two: open, with a state auditor's car outside. |
| **The Flats — Garrison Street** | Lindell House ruin and rear alley, St. Casimir's church and basement, corner store | Ch2 (named, "Not yet": Jin isn't ready) → Ch6 | After Ch6: fresh candles at the fence if Jin left flowers. Ch9 night: a "SOLD" sign on Lindell. |
| **Downtown — City Hall Annex** | Records counter, Housing Inspection files, Fire Marshal files | Ch6 | Ch9: Yvette the clerk recognizes him ("Seo, with an S-E-O"). |
| **Mount Hope Cemetery** | Gate, office, Section F | Ch2 (named; "Gates close at dusk") → Ch6 | Ch9 night; Ending Two epilogue. |
| **Downtown — Calder Civic Arena** | Loading dock, concourse, Section 14, dressing rooms, ring, timekeeper's table, watch booth | Ch0 → Ch8 | Ch8: same lighting, new banners, Teddy's booth. Ending One: Jin's title night, same corner. |
| **Riverfront — Ashgrove Tower** | Plaza, lobby, security floor, 31st-floor corridor, reception, boardroom, Penner's office | Visible from Ch0 (crane) → open Ch9 | Ending Two: news vans in the plaza; Ending One: Jin's photo in the lobby. |
| **South River — Alder Row** | Alder Row Cooperative street, courtyard, main entrance | Ch9 (as a model on the boardroom table; on the map as a gray node "Alder Row — closing 5/30") → Ch10 | Ending One: "ALDER COMMONS — LEASING SOON" fence wrap. Ending Two: still occupied; Phan Shoe Repair open. |

### NPC routine and reaction matrix (who is where, when)

Routines give the world rhythm; reactions prove the world remembers. Positions are the NPC's spot in that location; time slots are Morning / Day / Evening / Night where a chapter has a day cycle (Ch5, Ch6, Ch9).

| NPC | Ch0 | Ch1 | Ch2 | Ch3–4 | Ch5 | Ch6 | Ch7 | Ch8 | Ch9 (night tour) |
|---|---|---|---|---|---|---|---|---|---|
| Mrs. Sun | Sun's counter, ladling | — | Sun's, tells Jin | — | — | Sun's: sets a bowl in front of him and sits | — | — | Sun's, closing up; asks nothing |
| Teddy | Marsh BC door; corner | — | (absent; Kristy mentions his league shirt) | Starlite lane 7, Tuesday | — | Mount Hope ledger only | — | Watch booth; rings the bell | Arena loading dock, smoking, offers the robe or a coffee |
| Hana | — | Rehab gym, nurses' station | YMCA phone (optional) | Message at YMCA desk | — | St. Agnes: tells Jin she filed the complaint | — | — | St. Agnes office, after shift: takes copies |
| Pike | — | Room 214, lobby | (behind the van) | — | — | City Hall Annex steps (sends collectors) | HQ records room, packing | — | — (resigned; letter on HQ door) |
| Lenny | Dressing Room 2 | — | — | Cellar cutman's room | — | (if not threatened) Cellar, avoids eye contact; (if threatened) gone, Mo: "Left town." | — | — | (if witness) Greyhound bench, ticket in hand, waits for the hearing date |
| Deshawn | — | — | — | Cellar bout 1; warm-up room | Courts gym, car wash days | Courts gym morning; Friday bout | Courtyard, angry | — | Courts gym, wrapping a kid's hands |
| Mara | — | — | — | — | Workshop all day; roof at sunset | Workshop; archive key | Workshop step | — | Workshop step at night |
| Odette | — | — | — | — | Stoop at 7 a.m., laundry room midday, community room Wednesday | Same | Her chair in the community room | — | Her window, light on |
| Rook | — | — | — | — | Courtyard visit day 2 | (archive) | HQ office | — | HQ dark; he's on the HQ steps if `truth_told_by` = `rook` |
| Mo | — | — | — | Cellar office/bar | — | Cellar ring apron | — | — | Starlite bar, counting receipts |
| Slim | — | — | — | Cellar | — | Cellar bench | — | — | Cellar warm-up room |

---

# Chapter 0 — One More Round

## Date, mood, palette, weather

Saturday, August 20, 1994. 4:40 p.m. to about 10:30 p.m. Mood: warm, cocky, crowded, loved; then wrong. Palette: Eastgate in late-summer gold (amber sky gradient over the usual blue-gray street, brick lit warm on its west faces, long shadows). The arena is sodium-white ring light over a dark plum crowd. Weather: clear, humid, a heat shimmer over the river. This is the only chapter where Eastgate looks this way; Chapter 2 repaints the same street in snow.

## Gameplay identity

The player is the boxer Jin used to be, for twenty minutes, inside the life he's about to lose. They jog a street where everyone knows him, eat with his family, warm up with his coach, refuse a bribe, and then feel the controls betray them in the ring. Share: exploration 25% · dialogue 30% · combat 35% (mitts + title bout) · investigation 0% · activities 10% (mitt drill). Target 15–20 min.

The guided opening teaches in motion (research principle): run on the street, interact with neighbors, jab/cross/guard/slip on Teddy's mitts, then use all of it on Ray.

## Locations

### `kessler_ave_1994` — Kessler Avenue, Eastgate (2560 x 360, exterior)
Layout, left to right:
- **0–240 Kessler & 5th corner.** Route 14 bus stop (sign: "14 KESSLER–DOWNTOWN · LAST BUS 11:40 PM"), Abe's News stand (open; clipped front page of the Calder Ledger: "TITLE NIGHT: CASTELL–SEO AT THE CIVIC"), a payphone, hydrant.
- **240–620 Kessler Drug & One-Hour Photo.** Red brick, green-and-white awning, lit window with film boxes and a "1-HOUR PHOTO" neon in dull orange. Beside the door, the **poster wall**: two fresh CASTELL vs SEO posters side by side, a RUSTBELTS concert flyer, a lost-cat notice.
- **620–900 Pruitt's Laundromat.** Siding front, steam on the window, dryers turning (animated), Wanda Pruitt folding sheets inside.
- **900–1500 No. 412 Kessler.** Four-story worn brown brick. Ground floor: Sun's Noodle House (cream-and-red striped awning, window lettering "SUN'S NOODLE HOUSE · KOREAN & AMERICAN · OPEN 11–10"). Swept stoop with a geranium in a coffee can. Side fire escape climbing to the third floor; the 3B window has a basil plant and a box fan. Rooftop water tank, TV antennas, wires sagging to the next pole.
- **1500–1560 Alley mouth to Tanner Alley** (closed this chapter).
- **1560–2100 Marsh Boxing Club.** Dark brick, two floors, hand-painted sign "MARSH BOXING CLUB · EST. 1971 · ALL WELCOME", a bedsheet banner hung from the upstairs window: "GOOD LUCK JIN!!" in kids' paint with a lopsided glove.
- **2100–2560 toward the river.** Low concrete wall, Teddy's brown station wagon parked at the curb, the 9th Street bridge in the far layer.
Background layers: Eastgate rooftops; across the river, the dead Calder Foundry smokestack (no smoke); downtown skyline with the **Ashgrove Tower as a crane-topped steel skeleton**, red aircraft light blinking. Lighting: low sun from the right, warm; shop windows already lit. Ambient: traffic, a radio from Abe's stand calling tonight's card, laundromat dryers, kids, a distant ice-cream truck tune that cuts off.
Exits: 412 stoop door → `kessler_412_stairs_1994`; Teddy's wagon (after dinner) → cut to `civic_arena_backstage_1994`. Left edge and alley: blocked with a reason ("Home by five. Teddy's orders.").

### `kessler_412_stairs_1994` — 412 Kessler stairwell (320 x 720, vertical)
Lobby with brass mailboxes (3B label in Min's handwriting: "SEO — MI-OK / JIN / MIN-JI — NO MENUS PLEASE"), worn checkerboard tile, stairs up. 2A landing (the Suns' door, a pair of house slippers outside, smell lines of garlic shown as a faint steam). 3B landing (door with a small brass "3B", a doormat "WELCOME" with the W worn off). Stairs are the first vertical traversal; the bulb on 2 flickers (Sal's been promising to fix it — a note on the wall in Sal's hand: "BULB COMING — SAL").

### `apt_3b_1994` — Apartment 3B (1100 x 360, interior, room shell plaster + wallpaper, wood floor)
Left to right: entry (shoe rack, Jin's white running shoes beside Mom's flats and Min's red sneakers); living room (green sofa with a crocheted throw, TV on a cart showing Channel 6 local sports with Ray Castell's weigh-in, Min's textbooks "Principles of Accounting, 4th ed." open on the cushion, a fan); kitchen (stove with a pot, the table with three chairs, the fridge covered in magnets and a Calder Savings calendar; doorframe beside the fridge with pencil height marks, the top two visible: "JIN 17", "MIN 13"); window with the **radiator** that knocks; Jin's room at the right edge (single bed, a framed "CALDER GOLDEN GLOVES 1986 · 139 LB · J. SEO" certificate, a gym bag, and the **robe** on a hanger on the door). Lighting: warm afternoon through the window, the stove light, a ceiling fixture with one bulb out. Ambient: pot simmering, the TV low, street noise up through the open window.

### `civic_arena_backstage_1994` — Calder Civic Arena, backstage (1900 x 360, interior concrete)
Left to right: loading dock entrance (Teddy's wagon pulls in; a security guard with a clipboard waves them through); long painted corridor (yellow stripe, fight posters from the 70s and 80s, a fire hose cabinet); the commission table (Inspector Halloran, gray suit, checks hand wraps and stamps them); **Dressing Room 2** (door taped "BLUE CORNER — SEO"; inside: bench, six lockers, a bulb mirror, a rubbing table, an ice chest, a small window high up); further corridor; **Dressing Room 1** door (gold "CASTELL" placard, laughter and music behind it); the tunnel entrance (crowd noise swelling, light at the end). Lighting: fluorescent, cool, one flickering tube outside Dressing Room 2. Ambient: crowd rumble through concrete, an undercard bell, footsteps.

### `civic_arena_bowl_1994` — Calder Civic Arena, the bowl (1600 x 480, interior with stands)
Tunnel at left, aisle down to the ring at center (ring 360 px wide, blue corner left, red corner right, corner stools and buckets), timekeeper's table with the brass bell (engraved "CALDER CIVIC ARENA 1961") at ringside, press row. Stands rise in three parallax tiers behind; **Section 14, Row F** is a marked spot behind the blue corner where Mom and Min sit (Min's cardboard sign "EASTGATE'S OWN"). Lighting: four ring lights in cones, everything else dark plum with crowd silhouettes and cigarette haze. Ambient: crowd (cheer/idle/tense states), announcer, the bell.

## NPCs present

| id | Where | Idle pose | Key lines and barks | Reactions |
|---|---|---|---|---|
| `mr_sun` | Sun's door | `work` wiping a menu | Bark: "Tonight! Number one!" Talk: "Mrs. Sun is making you jjigae to go. Nobody eats before a fight. You eat after. Two bowls." | If talked to twice: "Your mother says you don't sleep. Sleep after. Everything after." |
| `sal_benedetto` | 412 stoop with a hose | `sweep` (hose) | Bark: "Don't track the street in, champ!" Talk: "The bulb on two? Monday. I swear on my mother. She's alive, so it counts." | — |
| `pruitt_boys` (Darnell 11, Marcus 9) | Sidewalk outside the laundromat | `shadowbox` | Bark: "Jin! Jin! Sign it!" (Darnell holds up a red toy glove). | Optional quest "Sign the glove" (see Quests). |
| `wanda_pruitt` | Inside the laundromat window | `work` folding | Bark through the open door: "Darnell, let the man breathe." | — |
| `abe` | News stand | `sit` stool, newspaper | Talk: "Got your picture on the front page. Doesn't look like you. Looks like a guy who'd win, though." | — |
| `min` | Exits Kessler Drug at 4:45 and walks with Jin | `walk`, swinging her bag | See scene 1. Bark if Jin dawdles: "Mom said five. It's four fifty-two. I'm not getting yelled at for your cooldown." | Follows Jin to the stoop. |
| `teddy` | Marsh B.C. door | `armsCrossed`, taps his watch | "Five o'clock. Car at six. Eat something boiled. Don't let your mother feed you like it's Chuseok." | After dinner: leans on the horn. |
| `mom` | 3B stove | `work` | See scene 2. | — |
| `lenny` | Dressing Room 2 | `work` at the rubbing table | "Look at these hands. Beautiful. Insurance should cover these hands." | — |
| `halloran` | Commission table | `write` | "Wraps are legal. Good luck, son. Don't get hit." | — |
| `camel_coat` | Dressing Room 2 doorway | standing, still | See scene 4. | — |
| `ray_castell` | Ring, red corner | bouncing, glove taps | Crowd bark: "Pride of Southport!" | — |
| `referee_dorsey` (Hal Dorsey) | Ring | `point` | "Protect yourselves at all times. Touch 'em up." | Ignores the warning sign in round 3. |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `poster_wall_1994` | Fight poster | "CASTELL vs SEO. They airbrushed my nose straight. Min's going to frame this and charge admission." | — (sets `saw_poster_1994`; Ch2 references) |
| `ledger_frontpage` | Newspaper | "'Seo, 26, a Golden Gloves champion from Eastgate, is a 3-to-1 underdog.' Three to one. Teddy will have read that out loud twice." | — |
| `mailbox_3b` | Mailbox | "Min wrote NO MENUS PLEASE. The menus come anyway. Mrs. Sun's are the only ones Mom keeps." | — |
| `radiator_3b` | Radiator | "It knocks. It's knocked since 1988. Sal says it's 'settling'." | Ties to `purse_wish = radiator`. |
| `height_marks_1994` | Doorframe | "JIN 17. MIN 13. Mom stopped measuring when I got taller than the fridge. Min didn't." | Ch2 echo. |
| `robe` | Robe | "Navy. SEO across the back in off-white. Mom's been on the N for three nights." (after scene 2: "Done.") | `mem_robe` |
| `golden_gloves` | Certificate | "1986. Teddy drove me to Pittsburgh in that wagon with no air conditioning. We won anyway." | — |
| `fridge_note` | Note on the fridge | (after Min sticks it) "AFTER THE FIGHT → SUN'S. I'M BUYING. (UNLESS YOU LOSE.) — M" | Sets up `ev_after_fight_note` (Ch6). |
| `dr2_mirror` | Mirror | "Two of me. Both of them look ready." | — |
| `dr2_payphone` (corridor) | Payphone | "Mom and Min left an hour ago. Nobody's home to pick up. Good." | — |

## Quests

- **Main — "One More Round."** HUD steps: "Finish your run. Home by five." → "Go up to 3B." → "Sit down with your family." → "Teddy's honking." → "Get your hands wrapped." → "Warm up with Teddy." → (scene) → "Walk out." → "Round 1." → "Round 2." → "Round 3." Completion: the knockdown scene. Reward: chapter end.
- **Optional — "Sign the Glove."** Giver: Darnell Pruitt (`!`). Objective: "Sign Darnell's glove." Trigger: talk to Darnell, choose "Sure." Darnell: "Write 'to Darnell, future champ'." Jin: "Future champ has to do his homework." Darnell: "That's not boxing." Reward: none now. Consequence: Ch2, Darnell (13) remembers it.
- **Optional — "Bulb on Two."** Giver: Sal (`…`). Not completable in 1994 ("Monday."). In Ch2 the bulb on two is still out. Pure world texture; journal entry closes in Ch2 with "Sal never fixed it. Sal moved to Erie."

## Scripted scenes

### Scene 0.1 — Roadwork (opening)
1. Black. Sound first: a jump rope on concrete, traffic, a radio: "...tonight at the Civic, the champion Ray Castell against Eastgate's own Jin Seo..."
2. Title card: "August 20, 1994 · Eastgate, Calder". Fade in on the far skyline at golden hour, the crane on the Ashgrove skeleton swinging slowly. **Camera** pans down and right through the parallax to Kessler Avenue, settling on the river end.
3. Jin jogs in from the right edge, hood down, towel around his neck (`jin_street` with towel extra). Control is given mid-stride, no prompt beyond a small "→" glyph that fades after two seconds.
4. Neighbors bark as he passes. Teddy at the gym door: talking to him sets the objective. Min comes out of Kessler Drug as Jin passes it, falls into step.
5. Walk-and-talk (no stopping; dialogue plays in bubbles while the player keeps control):
   - **Min:** "You're dripping on my street."
   - **Jin:** "It's my street too."
   - **Min:** "You've been on the front page one day and you already own a street?" She stops at the poster wall and holds up a copy of the photo next to his face. "They airbrushed you into a different man. This guy has a jaw."
   - **Jin:** "If I win, you can airbrush me yourself."
   - **Min:** "If you win, I'm taking a course in it."
6. At the 412 stoop Sal waves the hose aside. Door → stairwell. The player climbs to 3B (first vertical movement; the flickering bulb on two).

### Scene 0.2 — The kitchen table
Camera: interior wide, then a gentle zoom-in to the table once everyone sits (the only zoom-in on a happy moment in the game; Ch6 reuses this framing on an empty table).
1. Mom at the stove, back to the room. **Mom:** "Shoes." Jin is already taking them off. "Jin-ah, did you eat? Don't answer, I know you didn't."
2. Player is free in the apartment for a short time: examine the robe, the radiator, the certificate, the height marks. Min perches on the counter, heels knocking the cabinet.
3. Sit at the table (interaction `sit`) to continue. Camera eases in.
   - **Mom:** "The 14 stops at eleven-forty. If you go twelve rounds, how do we get home?"
   - **Jin:** "Teddy will drive you."
   - **Min:** "Teddy drives like he's in a title fight."
   - **Mom:** "Then we take a taxi. Taxi is four dollars." (beat) "After tonight we can take a taxi."
   - **Min:** "I did your purse math. After Teddy, after the commission, after Uncle Sam, you're rich enough to be poor somewhere warmer."
   - **Jin:** "What would you do with it?"
4. **Choice** (`purse_wish`), no wrong answer; each option is a family member's wish, and the others respond:
   - "Pay the rent. All of it." → **Mom:** "Two months. Mrs. Kaplan smiles at me on the stairs like a dentist." (`rent`)
   - "A place where the radiator doesn't knock." → **Min:** "A place where the radiator *works*. Dream bigger." (`radiator`)
   - "Min's tuition. The whole year." → **Min:** "You paid the deposit with your last undercard. I'm keeping receipts. You're getting audited." (`tuition`)
5. Reciprocity beat, whatever the choice. **Mom:** "When you were in camp I took the Hendersons' wedding. Eleven bridesmaids. Eleven hems. You owe me eleven hems." **Jin:** "I'll owe you a car." **Mom:** "I don't drive. Owe me a taxi."
6. Mom brings the robe, bites the thread off the N (`mem_robe`). She holds it up; the camera holds a two-shot of Jin looking at his own name. **Mom:** "Your name goes on the back. So when you walk away from somebody, they know who beat them."
7. Min takes a takeout menu from Sun's, writes on the back, and sticks it on the fridge with a magnet shaped like a pear. The player can read it (`fridge_note`).
8. Teddy's horn from the street (twice, then a long one). **Mom** straightens Jin's collar. "Don't watch the punches. Watch your feet. When your feet are happy, I'm happy."
9. Optional last interaction: hug Mom (`hug`) / jab Min's shoulder (she jabs back). No flag; just the player choosing how to say goodbye.

### Scene 0.3 — Backstage and the mitts
1. Cut on a horn to the arena loading dock, dusk turned to night. Teddy's wagon. Teddy, Jin and Lenny walk the long corridor; the camera trucks with them, posters sliding past (one is a 1971 card with a young Teddy as a fighter).
2. Commission table: Halloran stamps the wraps. Dressing Room 2: Lenny wraps (`wraps`) and talks. **Lenny:** "Look at these hands. Beautiful. Insurance should cover these hands."
3. **Warm-up drill (activity `train_mitts`, tutorial tier, no failure).** Teddy holds mitts in the dressing room.
   - Teddy: "Jab." (the player presses punch) "Again. Snap it back. A jab you leave out there is a gift." → jab.
   - "One-two." → cross. "Feet. Turn the back foot. The power's in the floor."
   - "Hands up." Teddy swings a mitt high: guard (hold down). "That's what your hands are for when they're not busy."
   - Teddy swings a slow hook: slip prompt shown once as a glyph on the mitt. "Slip. Not duck. Slip. Little. Like you're dodging a bad smell."
   - Free 20 seconds: Teddy calls random combinations; Jin's prime body hits hard (power 1.3, hit-stop 50 ms on crosses), Teddy grunts happily. **Teddy:** "There it is. There's the one I drove to Pittsburgh."
4. Inspector Halloran calls Teddy out to the corridor ("Marsh, tape on the left wrap's over the line, come look"). Lenny: "I'll get ice." Both leave. Jin alone. The flickering tube outside makes the doorway pulse.

### Scene 0.4 — Practical advice
Letterbox on. Camera: static wide of the dressing room, Jin on the bench in the left third; the doorway on the right third.
1. The man in the camel coat is in the doorway. He does not come in. No footsteps were heard.
2. **Coat:** "Mr. Seo. You don't know me, which is the nice part. I'm here with practical advice."
3. **Jin:** "I've got a coach for advice."
4. **Coat:** "Your coach gives the advice that wins fights. Mine wins years." (palm up) "Twenty-five thousand dollars, tonight, in cash, in your mother's name if you like. Nobody's asking you to lie down. Just don't win. There's a difference, and it's twenty-five thousand dollars wide."
5. **Jin:** "And if I win?"
6. **Coat:** "Then you'll have bet everything on one night against people who don't bet. The purse is a promise. This is money." (beat) "Your family's two months behind on 3B."
7. Camera: slow push-in on Jin's taped hands closing.
8. **Choice** (`refusal_tone`) — all are refusals; the bribe cannot be accepted (PDF: Jin refuses):
   - "Get out." (`angry`) → **Coat:** "Of course."
   - "Tell whoever sent you I said no." (`flat`) → **Coat:** "Nobody sent me. I'll tell him anyway."
   - Say nothing. Look at him until he leaves. (`silent`) → he waits four seconds, nods.
9. **Coat** (leaving): "It was practical advice, Mr. Seo. Practical advice is the only kind I give." He steps back out of the doorway light and is gone. Letterbox off.
10. Lenny comes back with ice and a paper cup of orange drink. The camera stays wide; the cup is ordinary. **Lenny:** "Teddy's mix, kid. Electrolytes. Drink it all, you were cramping in camp." Jin drinks; the player does not control this (control is already taken by the scene). **Jin:** "Tastes like aspirin." **Lenny:** "Tastes like a title." Teddy returns. Jin says nothing about the coat. (Thought: *Not now. After. Everything after.*) This silence matters later: Teddy never knew.

### Scene 0.5 — Walk-out
1. The tunnel. Jin in the robe. The player walks the aisle (control on, walking only; run is restricted: "Walk. Let them see you."). Crowd chants. Camera pulls out wide as the bowl opens.
2. Passing Section 14: a highlight cone finds Mom (program in both hands) and Min (sign "EASTGATE'S OWN") (`mem_section_14`). Min shouts something the crowd swallows; the bubble shows only "—!!".
3. Ring introductions: Ray Castell in white and gold taps his gloves twice. Referee Dorsey's instructions. The bell (first time the player hears the 1961 bell: bright, slightly cracked).

## Encounters

### Bout 0 — Ray Castell, title fight (BoutDef `bout_ch0`)
- **Ring:** `civic_arena_bowl_1994`, ring x0–x1 = 620–980. Opponent `champion`, `patternSet: 'ch0'`: double jab, right hand (telegraphed by a back-foot step), body hook combo (left-left), lean-back counter (punishes a lazy cross). HP floor: Ray cannot be knocked out.
- **Round 1 (60 s).** Jin's prime body, no debuff. The round is winnable on points: if the player lands 8+ clean punches, the crowd chants "SEO! SEO!" and the corner scene uses the happy variant. Teaches: the champion's patterns, which the player will recognize in Chapter 8.
- **Corner after R1.** Teddy: "He's waiting on your jab. Give him the jab and then don't be there." Lenny squeezes the water bottle. Normal.
- **Round 2 (60 s).** At 0:20: `debuff` ramps: `muffle` 0.4, `speedMul` 0.85, input `delay` 0.03→0.06 s. Jin's thought: *My legs are late.* At 0:35: **interrupted recollection** (sepia flash, 1.2 s, the game does not pause): Dressing Room 2, a paper cup, orange, a hand holding it out, "Drink it all, kid—" cut by a hard punch sound (`mem_orange_cup` fragment). Hand partially drawn; no face.
- **Corner after R2 (scene).** Camera: tight on the corner, crowd blurred, sound muffled except voices.
  - **Jin:** "Something's wrong. Teddy. My legs— I can't hear you right."
  - **Teddy:** "You're fine. It's the lights. It's nerves. You won the first."
  - **Lenny:** "He's fine, Ted. I'll give him salts."
  - Teddy looks at Jin's face for one held beat (camera holds on Teddy, the only time the game shows his doubt). Then: "Hands up. It's your night. Go."
  - They send him back out (PDF).
- **Round 3 (scripted at 0:40).** `delay` 0.10 s, `speedMul` 0.7, `double` vision 0.5, heartbeat. Ray takes advantage: his combo rate goes up. Good play still matters: slipping Ray's telegraphed right hand despite the delay keeps Jin upright and makes Ray glance at the referee. At 0:25 Jin's guard drops to his waist for a full second while he's not being hit (**the warning sign**); Referee Dorsey looks at it, then at the timekeeper's clock, and waves "Box." At 0:40 (or earlier if Jin's condition reaches the floor), the knockdown sequence fires regardless of the score.
- **Knockdown sequence (cinematic).** Slow motion 0.3×, letterbox. Jin's back on the ropes in the blue corner. Ray's right hand. Jin's hands don't come up. The bell rings for the end of the round; Ray's last right lands *after* the first ring. The bell keeps ringing: the timekeeper hammering it, the referee only now stepping in. All other audio drops out one layer at a time (crowd, announcer, Min's voice: "JIN—"), leaving only the bell, continuing. Jin falls (`knockdown`, then `down`). Camera: from overhead, zooming out slowly until he's small on the canvas. White, then black. The bell stops.
- **Checkpoint:** before the walk-out and at the start of each round. There is no loss state: if Jin's condition empties in rounds 1–2, he's simply knocked down and gets up on the count of eight (`getup`) with a thought (*Not yet.*). The defeat is narrative, not mechanical (PDF: not a secretly unwinnable challenge).
- **After:** no questioning. `mem_bell` unlocked on black.

## Choices made here
| Choice | Flag | Immediate | Later |
|---|---|---|---|
| What the purse should fix | `purse_wish` | Family reaction line | Min's letters quote it (Ch6); Penner's dossier (Ch9); Ending One epilogue: "The rent on 3B, two years late, paid to no one." |
| How Jin refuses | `refusal_tone` | Coat's reply | Ch9: Coat quotes it back ("You said 'Get out.' I've thought about that.") |
| Sign Darnell's glove | `signed_glove` | — | Ch2 Darnell line |

## Chapter ending beat and hand-off

Black, then a slow typewriter line in the center: "The last clear sound was the bell." Chapter completion screen titled "One More Round" with: the poster as the background image, a line from `summary(G)`: "Purse wish: [rent / a warm apartment / Min's tuition]." State handed on: `purse_wish`, `refusal_tone`, `signed_glove`, `mem_*` fragments. Prime body flags are discarded: Chapter 1 begins with a different body (`jin_hospital`, power 0.5, no punches).

---

# Chapter 1 — The Name Above the Bed

## Date, mood, palette, weather

Monday, October 7, 1996 through Friday, December 13, 1996, at St. Agnes Long-Term Care, Hillcrest. Mood: slow, disoriented, then stubborn; a quiet institution where most people are kind and one person is not. Palette: pale institutional green and cream walls, cool fluorescent white, the window's blue-gray city, with warm pools only at the nurses' station lamp and the day-room TV. Weather through the window: October rain → November bare trees → first frost on the last day. Each time card changes the view in Room 214's window (leaves on the courtyard maple: full, half, none, frost).

## Gameplay identity

Rehabilitation as play, and a paperwork mystery inside a building the player learns by heart. No combat at all; the verbs come back one at a time (sit up, roll, stand, walk, stairs, hop, jog), each in a short playable section separated by clear time cards (PDF). Between sessions, the player walks the same corridor and notices it changing: the puzzle in the day room grows, Earl's radio changes station, Pike's signature fills the visitor binder. Share: exploration 25% · dialogue 30% · investigation 20% · activities (rehab drills) 25% · combat 0%. Target 18–22 min.

## Locations

### `stagnes_room_214` — Room 214 (640 x 360, interior, room shell cream plaster, linoleum)
One screen. Left: Earl Dunning's bed by the door (side table with a transistor radio, a crossword book, a framed photo "CALDER FOUNDRY RIGGING CREW 1971", get-well cards strung on yarn). Right: Jin's bed by the window. Above it the **bed card**. Jin's side table: a plastic water jug and nothing else; no cards, no photos (two years with no visitors told by an empty table). A whiteboard by the door: "TODAY IS: MONDAY OCT 7 · YOUR NURSE: DOLORES · YOUR THERAPIST: HANA" (the date updates after every time card). Window: the river, Calder's skyline with the **Ashgrove Tower finished and lit**, the courtyard maple. Lighting: daylight through blinds in stripes; at night the hall light under the door and Earl's radio dial glow. Ambient: Earl's radio (a ballgame, then talk radio, then Christmas music by December), a call bell down the hall, rain.
Exit: door → `stagnes_2west`.

### `stagnes_2west` — Second floor, West corridor (1700 x 360)
Left to right: stairwell and elevator (to Rehab Gym 1F, Medical Records B, Lobby 1F); rooms 210, 212, **214**, 216 (doors half open: a TV glow, a woman knitting in 216 who waves); **nurses' station** (counter, chart rack with a binder labeled "AHN, D. 214", desk lamp, phone, a coffee maker, a bowl of peppermints Nurse Dolores refills); the **day room** (TV on a bracket, a puzzle table with a 1000-piece lighthouse puzzle, a **payphone**, two armchairs, a window); a linen cart. Lighting: fluorescent strips, one buzzing; warm lamp at the station. Ambient: carts, beeping, a TV game show.

### `stagnes_rehab_gym` — Rehabilitation Wing gym, 1F (1200 x 360)
Left to right: doors from the corridor; **parallel bars**; a balance beam (low); mats; the stair trainer (four wooden steps and a platform); **floor marks** (taped numbers 1–6 in a zigzag); a pad stand with Hana's focus pads; a mirror wall (where `mem_hands_up` triggers); Hana's desk (mug "WORLD'S OKAYEST P.T.", a stack of charts, a Polaroid of her rehab team bowling); window to the garden. Lighting: big windows, daylight; late sessions under fluorescent. Ambient: a radio on Hana's desk playing oldies, other patients' therapy murmurs (two other patients with their therapists, never named, doing their own work: an old man on the bars, a young woman on the stairs; ordinary).

### `stagnes_records` — Medical Records, basement (800 x 360)
Counter with a take-a-number dispenser; clerk Mr. Fenwick (65, cardigan, half-glasses, cheerful); shelving rows of manila folders behind; a copier (`copier`); a flickering fluorescent; a fire door with "AUTHORIZED STAFF" (locked: "Staff only. Hana has a reason to be here; you don't, yet."). Ambient: copier hum, a dripping pipe.

### `stagnes_lobby` — Lobby and garden (1400 x 360)
Left to right: chapel door (a small stained-glass window); the front desk with volunteer Mrs. Grace Ito and the **visitor binder**; a rack of brochures ("Living With Brain Injury", "Your Rights as a Resident"); glass front doors; outside: the **garden courtyard** (bench under the maple; leaves fall over the chapter) and the **Route 3 bus stop** under a streetlight at the far right. Lighting: lobby warm; outside, overcast daylight or, on the final day, a frosty late afternoon.

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions |
|---|---|---|---|---|
| `earl_dunning` | Room 214, left bed / wheelchair in the day room | `sit` (bed or `wheelchair`), crossword | "Morning, Daniel. Or whatever your name is today." / "Seven letters, 'what a fighter throws first'. ...Don't tell me, I'll get it." | Calls him "kid" once Jin insists on his name. If `earl_crossword` done: calls him "Jin" from then on. |
| `nurse_dolores` (Dolores Reyes) | Nurses' station | `write`; refills peppermints | "Good morning, Daniel. Big day. You're going to sit up and I'm going to cheer." / "Mr. Pike's here again. Smile, he brought nothing." | Ordinary caregiver. Week 8, if asked: "I write what the chart says, honey. If the chart's wrong I need a doctor or Hana to tell me." |
| `hana` | Rehab gym; nurses' station; lobby | `handsHips`; crouched at the bars | See scenes. | Trust curve: records-first (Part C) → doubt (Part D) → ally (Part F). |
| `pike` | Room 214 (Part B), nurses' station (Part E), lobby (Part F) | clasped hands, smile | See scenes. | Notes whatever the player tells him in the chart. |
| `mr_fenwick` | Records counter | `write` | "Number nine! Oh. You're the only one. Number nine anyway, I like the ceremony." | Ordinary worker; hands the intake packet to Hana because the form is correct. |
| `grace_ito` | Lobby desk | `sit`, knitting | "Sign in, sign out, dear, it's not a prison, it's paperwork." | Day of departure: quietly turns the binder so Jin can see Pike's 26 entries. |
| `woman_216` (unnamed, "Woman in 216") | Room 216 | `sit`, knitting | Waves. In December: holds up a finished scarf. | Pure texture; the corridor's clock. |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `bed_card` | Name card | "AHN, DANIEL. DOB 03/11/68. That's my birthday. That's not my name." | `ev_bed_card` |
| `whiteboard_214` | Whiteboard | Updates each part: "TODAY IS: TUESDAY OCT 22 · GOAL: STAND 30 SEC ☺" (Hana's smiley). | — |
| `window_214` | Window | Part A: "Calder. That tower wasn't finished." Part F: "Frost. Two Decembers gone." | — |
| `earl_photo` | Old photo | "Calder Foundry Rigging Crew, 1971. Thirty men in hard hats. Earl's the one pretending not to smile." | — |
| `chart_rack` | Charts | (Part E with Hana) opens `ev_face_sheet`. Alone: "Patient charts. Dolores looks up. Not alone." | `ev_face_sheet` |
| `day_puzzle` | Puzzle | Grows per part: "The lighthouse has no top." → "The lighthouse has a top, no sea." → "Done, except one piece of sky. Someone's been hiding it." (Optional: Earl has it in his pocket; he gives it to Jin in Part F: "You finish it. I've had the sky long enough.") | — |
| `payphone_dayroom` | Payphone | Part D: Jin dials 555-0148 → "The number you have reached is not in service." Dials Marsh B.C. from memory → "Iron Pulse Fitness, how can I pump you up?" Jin hangs up. Part E onward: an index card taped on it: "Resident AHN D. — calls supervised per funding liaison." | Seeds Ch2 (gym changed hands). |
| `belongings_bag` | Belongings bag | Part D (Hana brings it): opens `ev_belongings_tag`. | `ev_belongings_tag` |
| `visitor_binder` | Visitor binder | Part F: `ev_visitor_log`. Earlier: "Sign in. Sign out. My page is mostly one name." | `ev_visitor_log` |
| `rights_brochure` | Brochure | "'Your Rights as a Resident. You have the right to communicate privately with persons of your choice.' Somebody circled it in pen. Not me." (Hana did, in Part E.) | — |
| `gym_mirror` | Mirror | First footwork session: triggers `mem_hands_up` (Teddy's voice: "Hands up, chin down, mouth shut."). | `mem_hands_up` |

## Quests

- **Main — "The Name Above the Bed."** HUD steps: "Sit up." → "Answer the man in the tweed jacket." → "Session one: the bars." → "Walk on your own." → "Find something with your real name on it." → "Climb the stairs." → "Ask Hana to call your mother." → "Go to Medical Records with Hana." → "Leave St. Agnes." Completion: walking out the glass doors. Reward: `ev_transfer_form`, $40 (Hana), Hana's phone number (People note), the map node Eastgate.
- **Optional — "Seven Letters, Across."** Giver: Earl (`…` after Part C). Objective: "Help Earl finish Sunday's crossword." Trigger: talk to Earl in three different parts; each time he has one clue and the player picks from three answers (only one fits the letter count; no trick options). Clue 1 (Part C), 7 letters, "a fighter throws it first": OPENING (Jin: "You throw it first or you don't throw anything."). Clue 2 (Part D), 7 letters, "Calder's old employer, closed in '92": FOUNDRY, which starts Earl talking about the site and becomes his testimony. Clue 3 (Part E), 4 letters, "what's on a bed card": NAME (Earl, filling it in: "Funny clue for this room."). Completion grants `ev_earl_testimony`, sets `earl_crossword`. Reward: Earl calls him Jin; Ch9 night visit has a postcard from Earl.
- **Optional — "The Missing Sky."** The lighthouse puzzle (texture). Completion in Part F: the day room puzzle is finished and Dolores tapes it to the wall. Ch6/Ch9: it's still on the wall.
- **Training unlocked** (after Part C): journal tab "Training" appears with four drills (balance, footwork, reaction, conditioning), cap 1 this chapter. Hana's line: "Training isn't the plan. It's the homework. The plan is you walking out of here."

## Scripted scenes

### Part A — Waking (October 7, 1996)
1. Black. Muffled sound: a heart monitor that resolves into Earl's radio ("...Ashgrove Tower's ribbon-cutting drew the mayor and—"). Blur fx 1.0 → 0.3.
2. Fade in: overhead shot of Jin in bed, small in a big frame. **Camera** slowly zooms out to show the whole room, then pans up to the bed card. The text resolves letter by letter, like vision focusing: AHN, DANIEL.
3. Thought: *Daniel?*
4. Control: Jin can only turn his head (left/right looks at Earl / the window) and press interact on the bed rail to try to sit up. First try fails (`hurt` twitch, a short heavy-breath sound, prompt line: "Your arms don't answer yet."). Third try succeeds with Dolores arriving: "Look at you. Good morning, Daniel." `lieBed` → `sit` on bed edge.
5. **Earl:** "Two years I've had a roommate who doesn't snore. Figures you'd wake up the week the Steelhawks blow the season."
6. **Jin** (first words, hoarse): "Jin. My name's Jin."
7. **Dolores** (kindly, writing): "Mm-hm. We'll tell the doctor you're talking. That's wonderful."
8. Time card: "Day 3."

### Part B — The liaison (Day 3)
1. Pike enters Room 214 with a fruit basket he doesn't open. Stands too close. Camera: a slight low angle from the bed, Pike tall in the frame.
2. **Pike:** "Daniel. Gerald Pike, Northside Community Council. The Foundry Workers Relief Fund has been looking after you since your accident. You're a lucky man."
3. **Jin:** "What accident?"
4. **Pike:** "Salvage work at the old Foundry site. A beam came down. August of '94. You don't have to remember. Most men don't."
5. **Choice** (`insisted_to_pike`):
   - "My name's Jin Seo. I'm a boxer. I fought Ray Castell at the Civic." (`true`) → **Pike** (adjusting glasses, writing): "Confusion is very normal after an injury like yours, Daniel. The mind invents a more exciting story. Boxing. Hm." The chart (Part E) shows: "10/09/96 Pt insists on identity as professional boxer. Confabulation. Redirect; discourage."
   - "Who told you that?" (`false`, watchful) → **Pike:** "The paperwork told me. The paperwork is very reliable." Chart shows: "10/09/96 Pt quiet, cooperative. Good." Jin's thought: *He wrote "good" like a man closing a drawer.*
6. **Pike** (leaving): "Questions about boxing will only upset you. Let's not make your recovery harder than it needs to be. The fund is very generous. Let's keep it that way." Earl's radio clicks back on.
7. **Earl** (after he's gone): "That guy's been here every month for two years. Never once took his coat off. Never once asked how you slept."
8. Time card: "Two weeks later."

### Part C — Session one (late October)
1. Hana wheels Jin to the rehab gym. **Playable**: the player pushes the wheelchair down 2 West (left/right only; jump prompts "Not yet."). Barks along the corridor: Dolores "Go get 'em, Daniel!", the woman in 216 waves.
2. Gym. Hana crouches at the bars to eye level. **Hana:** "Hi. I'm Hana. I've been moving your arms and legs for nine months while you weren't here. Now you get to help."
3. **Activity `train_balance` tutorial** at the parallel bars: stand, hold steady against the sway meter for 10 seconds, then walk four steps along the bars. Hana counts out loud. No failure: if he slips, Hana catches (her `handShoulder`), "Again. Your left foot is lying to you. Don't believe it."
4. During the rest, Hana reads the chart. **Hana:** "Says here you were on a salvage crew at the Foundry site. Heavy work." **Jin:** "I've never worked a day at the Foundry." **Hana:** "Head injuries do strange things to memory, Daniel. That's not an insult. It's my whole job."
5. **Choice** (`told_hana_early`):
   - "I'm a boxer. Was. I fought for the title." (`true`) → **Hana** (not unkind): "Okay. I'm writing that you said so. That's what I can do today." (+1 hana; she does write it, in her own notes.)
   - "Watch me move for a few weeks. Then decide." (`false`) → **Hana:** "Deal. I like evidence." (later, in Part E, she says: "You were right to make me watch.")
6. The training menu unlocks (toast, journal badge). Hana: "Homework. Not the plan. The plan is you walking out of here."
7. Earl in the room that night (optional dialogue): first crossword clue (quest start).
8. Time card: "Five weeks later."

### Part D — The bag with my name in it (mid-November)
1. Jin walks unaided (`walk` slow, `limp` 0.3) for the first time: the player crosses 2 West from 214 to the day room with no assistance (Dolores at the station claps once, quietly).
2. **Footwork drill** in the gym (floor marks; `mem_hands_up` at the mirror the first time).
3. Hana brings his belongings from storage for the stair practice ("Street shoes. You're not climbing in hospital socks.") **Interact `belongings_bag`**: bag tag "AHN, D. — Rm 214"; inside, a blue track top and white running shoes. The player turns the collar in the viewer: in marker, "SEO J." in small careful letters.
   - **Jin:** "My mother labeled everything. Gym laundry got mixed up."
   - **Hana** (quiet, taking the tag, turning it over): "Who's Seo?"
   - **Jin:** "Me."
   - Hana looks at the tag for a long time. Camera holds on her, not on him. **Hana:** "...Put the shoes on. We'll do the stairs." (Her first doubt is an action, not a speech.)
   - Jin changes into the track top over the rehab tee (`jin_rehab` → track top over tee): the player's character finally looks like the art-direction Jin, half-healed.
4. **Payphone** (day room): Jin dials home (disconnected) and the gym (Iron Pulse). The thought after hanging up: *Both numbers belong to somebody else now.*
5. Earl's second clue → the Foundry testimony (`ev_earl_testimony`):
   - **Earl:** "Salvage? On the Foundry site? The Pulaski brothers had that contract, Stan and Leo, Polish fellows, I bowled with Leo. Nobody named Ahn. And nobody got hurt in '94. I'd have heard. I hear everything from this bed."
6. Time card: "Eight weeks later."

### Part E — Calls supervised (early December)
1. **Stairs**: the stair trainer, then the real stairwell (2 West ↔ 1F), with `hop` unlocked at the top step ("Jump" works now; a small hop). **Reaction drill** with Hana's pads (slip or guard only; punch is restricted: "Not yet. Hana says the pads are for your eyes, not your hands.").
2. Jin asks Hana to call his mother. **Choice-free**: he gives the number from memory and the address (412 Kessler #3B).
3. Next day, the **nurses' station scene**: the player arrives in the corridor and hears raised voices; walking closer raises the dialogue volume (eavesdrop: control kept).
   - **Pike** (to Hana's supervisor on the phone, and then to Hana): "The fund requests that no outside contact be initiated on Daniel's behalf without the liaison. Family situations can be very upsetting."
   - **Hana:** "He asked me to call his mother. Since when is calling someone's mother outside contact?"
   - **Pike:** "Since the fund paid for twenty-six months of his care, Ms. Lim. I'll note your concern."
   - Pike tapes an index card on the payphone on his way out ("calls supervised per funding liaison"). This is the second interference (the first was discouraging boxing questions, the third will be in Part F).
4. With Hana at the chart rack (she opens it in front of him, which she is allowed to do with the resident present): `ev_face_sheet`, including the note matching `insisted_to_pike`. **Hana**: "'Redirect gently.' I've redirected you gently for nine months. Huh." She circles "communicate privately with persons of your choice" on a rights brochure and leaves it at the lobby rack.
5. Time card: "Ten weeks later. December 13."

### Part F — Medical Records, and the door (December 13)
1. Hana requests the original intake packet for a "continuity of care review" (a real procedure; Mr. Fenwick is happy to help). The player walks with Hana down to the basement (stairs, no help).
2. Fenwick brings a thick folder: the new face sheet on top, and clipped behind it, "original attachments". **Document viewer, side by side**: the face sheet (AHN, DANIEL) and the **Interfacility Transfer Form T-0902-17** (SEO, JIN; boxing bout; NOK SEO, MI-OK; "NOK NOT NOTIFIED, PER PAYER REQUEST"). The matching transfer number is highlighted when the player hovers both.
3. **Activity `present`** (soft): Hana asks, "Show me the line that can't be confusion." Correct picks: the transfer number on both pages, or the NOK line. Wrong picks get Hana's gentle rebuttal ("That's a typo. Typos happen. Show me what can't happen.").
4. **Hana:** "Someone replaced your name after the fight. That's not confusion, Daniel— Jin. That's paperwork." (She corrects herself; from here on she says Jin.) She feeds a page into the copier without asking anyone. **Hana:** "I'm a records person. I always make a copy." (`ev_transfer_form`)
5. **Lobby.** Pike is at the desk, coat on, with a man from the fund's transport company (gray uniform, says nothing). Third interference. Camera: wide, Jin and Hana entering from the left, Pike framed in the glass doors with the frost outside.
   - **Pike:** "Ms. Lim. I'll need that folder back; it's fund property. And Daniel, the fund has found a facility that will suit you better. Quieter. Less... imaginative staff."
   - **Hana** (handsHips, between them): "He's a voluntary resident. He can sign himself out against medical advice any time he likes. That's in the brochure. Someone circled it."
   - **Mrs. Ito** slides the AMA form across the desk without being asked.
6. **Choice** (`signed_real_name`): the form's name line.
   - Sign "Daniel Ahn" (`false`): fast and quiet. **Pike** relaxes a little: "Sensible." Jin's thought: *It's just a form. I'll get the name back when I can prove it.*
   - Sign "Seo Jin" (`true`): **Mrs. Ito** reads it upside down: "That's not the name on the file, dear." **Jin:** "No. It's the name on me." **Pike**'s smile goes. He leaves first, already reaching for a payphone in his coat for a dime. (This makes Chapter 2's van arrive with Pike's full attention; Penner mentions it in Chapter 9.)
7. Mrs. Ito turns the visitor binder toward Jin as he passes (`ev_visitor_log`): 26 visits, one name.
8. **Outside, the bus stop** (control returns): frost on the bench, the streetlight just turning on. Hana follows in her peacoat over scrubs.
   - **Hana:** "Here. The copy." (the transfer form) "And this is forty dollars, which is mine, so don't spend it on anything stupid." (+$40)
   - **Jin:** "I'll pay you back."
   - **Hana:** "I know. That's why I'm writing it down." She writes her phone number on a St. Agnes appointment card: "Hana Lim, ext. 214. Before 7 or after 9." On the back: "Calder YMCA, Front St. $8/night. Tell Gus I sent you."
   - **Hana:** "The address on the form is 412 Kessler. Eastgate. The 3 to downtown, then the 14."
   - **Jin:** "Why are you doing this?"
   - **Hana:** "Because I chart what I see. And I see you."
   - If `told_hana_early`: "You told me the first day. I should've written it bigger."
9. The Route 3 bus arrives. **Camera** zooms out from the stop as Jin boards, holding the long shot as the bus pulls away and Hana stands alone under the streetlight, then walks back inside. Letterbox off.

## Encounters

None. Breath is off. The verbs return in this order and each blocked press is explained in a thought line: sit up → roll the wheelchair → stand at the bars → walk → stairs → hop → jog (conditioning laps, cap 1). Punching stays restricted all chapter ("Not yet.").

## Choices made here
| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Insist to Pike | `insisted_to_pike` | Chart note text | Ch7: Pike: "You told me your name on the third day. I wrote 'confabulation.' I knew how to spell it." |
| Tell Hana early | `told_hana_early` | +1 hana, her line | Ch9 Hana line; Part F line |
| Sign the AMA form | `signed_real_name` | Pike's reaction | Ch2 collectors say "Mr. Pike's real upset about your little signature"; Ch9 Penner; Ending Two Hana's complaint cites it |
| Crossword | `earl_crossword` | Earl calls him Jin | Ch9 postcard |

## Chapter ending beat and hand-off

On the bus, Jin by the rain-streaked window (a reused fast-travel shot), the track top's collar up. Thought: *She charted what she saw. Somebody else charted what they wanted.* Chapter completion screen: background is the bed card with "AHN, DANIEL" struck through in Hana's pen and "SEO, JIN" written above it. State handed on: `ev_transfer_form` in the archive (gives the 412 Kessler address), money $40, Hana's number, training levels ≤1, body `jin_street` without knuckles, power 0.6, breath on from the first fight in Ch2.

---

# Chapter 2 — No One Waiting

## Date, mood, palette, weather

Saturday, December 14, 1996, 3:50 p.m. to about 9 p.m. Mood: recognition turning into loss, then into anger. Palette: the Chapter 0 street repainted cold: blue-gray snow light, brick darkened by wet, warm amber only in a few windows (Sun's, the laundromat, the One-Hour Photo); sparse tinsel. Weather: first snow, light at arrival, heavier after dark, drifting in the alley light cones. Ambient motif: a red-kettle volunteer's hand bell outside Kessler Drug (Jin's thought the first time he hears it: *Bells.*).

## Gameplay identity

Walk a street the player already knows from Chapter 0 and find every difference. This is the "returning to his former neighborhood" chapter the user described: examine familiar objects, talk to people who remember him, sit down. One emotional discovery that the game lets breathe for as long as the player wants, then one street fight in an alley where ordinary life keeps going around it. Share: exploration 35% · dialogue 25% · investigation 10% · combat 25% · activities 5%. Target 20 min.

## Locations

### `kessler_ave_1996` — Kessler Avenue, December 1996 (2560 x 360, same geometry as `kessler_ave_1994`)
Same left-to-right layout as Chapter 0 so the player can compare. Differences, by block:
- **Corner (0–240).** Bus sign: "14 · SERVICE REDUCED · LAST BUS 10:50 PM". Abe's News is shuttered (roll gate, graffiti tag, "FOR LEASE · 555-0190"). The payphone still works. A red-kettle volunteer with a hand bell.
- **Kessler Drug (240–620).** Same store, now a "FUJI" sign on the One-Hour Photo. **Poster wall**: three layers deep (Iron Pulse "NEW YEAR NEW YOU $19/MO", "THE RUSTBELTS · REUNION · NEW YEAR'S EVE", "ASHGROVE TOWER · NOW LEASING · LIVE ABOVE IT ALL"); under them, the CASTELL vs SEO poster.
- **Laundromat (620–900).** "PRUITT'S" sign faded to "PRU T'S", tinsel in the window. Darnell Pruitt (13) sweeping lint inside.
- **412 Kessler (900–1500).** Sun's Noodle House still open, tinsel, steam on the glass; in the lower corner of the window, a **sun-faded MISSING flyer**. The stoop isn't swept; the geranium coffee can is empty, snow inside it. The 3B window has a paper snowflake taped to it, cut by a child.
- **Alley mouth (1500–1560)** to Tanner Alley: open now.
- **Iron Pulse Fitness (1560–2100).** Same building painted gray, pink-and-teal neon, vinyl banner "JOIN NOW · NO INITIATION FEE" where the bedsheet "GOOD LUCK JIN!!" used to hang.
- **River end (2100–2560).** A snowed-in sedan where Teddy's wagon used to be.
Background: the Ashgrove Tower finished, a crown of white lights; the foundry stack; heavy sky. Lighting: dusk to night across the chapter (sitting advances time); streetlights flicker on at 4:30. Ambient: snow hush, tires on slush, the kettle bell, Christmas music leaking from Kessler Drug.
Exits: 412 door → `kessler_412_stairs_1996`; Sun's door → `suns_noodle`; Iron Pulse door → `iron_pulse`; Kessler Drug door → `kessler_drug`; alley mouth → `tanner_alley`. Map nodes visible but locked: "Garrison Street" (*Not yet.*) and "Mount Hope" (*Gates close at dusk.*).

### `kessler_412_stairs_1996` — 412 stairwell (320 x 720)
Mailbox 3B now reads "ALVAREZ" on a label-maker strip; Min's handwritten "NO MENUS PLEASE" is still visible underneath. The bulb on two is still out; Sal's note "BULB COMING — SAL" is yellowed. 2A has the same house slippers outside.

### `apt_3b_1996` — 3B kitchen, from the doorway (640 x 360; only if Mrs. Alvarez invites him in)
A different table, a high chair, a small Christmas tree with paper ornaments, a Virgin of Guadalupe calendar where the Calder Savings calendar was. The fridge has been moved; the doorframe beside it was painted white, except a strip at the bottom where the old pencil marks still show: the painting stops mid-stroke.

### `suns_noodle` — Sun's Noodle House (800 x 360, interior)
Counter and register at left (Mr. Sun on a stool beside the radiator, a ledger and a heating pad); four booths; menu board; a shelf of kimchi jars; a small TV with the news; the front window (flyer in the corner, readable from inside, reversed); a swinging door to the kitchen and the back door to Tanner Alley. Lighting: warm pendant lamps, steam. Ambient: soup simmering, the TV, the kettle bell outside.

### `iron_pulse` — Iron Pulse Fitness (1000 x 360, interior)
Front desk with Kristy (headband, teal leotard, very kind); a step-aerobics class of four with an instructor in a headset mic; machines; a long mirror. At the back wall, where the ring used to be, a rectangle of older paint shows through a bad gray coat: "HANDS UP / CHIN" (the rest painted over). A lost-and-found bin. Ambient: aerobics music, instructor's "And four! And three!".

### `kessler_drug` — Kessler Drug & One-Hour Photo (640 x 360, interior)
Photo counter at the back with Dale (19, glasses, store vest), the copier (used in Ch9), aisles of cold medicine and tinsel. Dale's line is short this chapter (see NPCs); the unclaimed box behind him is just a prop until Chapter 6.

### `tanner_alley` — Tanner Alley (1600 x 480, exterior, two layers)
Ground layer, left to right: mouth from Kessler Avenue; Sun's kitchen back door (Danny Sun washing pots in a steam cloud, radio on); two dumpsters (green-gray); the laundromat back door with a dryer vent puffing steam (Wanda Pruitt on a smoke break, coat over her smock); Reyes Auto's closed bay door; the far mouth to Front Street. Upper layer: the 412 fire escape (one-way platforms, ladder drops at x=820) up to the **412 roof** (two old lawn chairs, Sal's coffee can of cigarette butts, the water tank, the whole skyline: Ashgrove Tower, foundry stack, the Civic Arena's dome far off). Lighting: two caged bulbs over back doors, one streetlight at the Front Street mouth, snow falling through each cone. Ambient: dryer vent, pots, a radio playing a Christmas song in Spanish from Reyes Auto's upstairs window.

### `ymca_lobby` and `ymca_room_312` — Calder YMCA, Front Street (640 x 360 each)
Lobby: front desk with Gus (60s, cardigan, police scanner murmuring), a payphone, a corkboard of swim schedules. Room 312: a cot, a radiator that clanks but works, a window onto the river and the lit Ashgrove Tower, a chair, a Gideon Bible. Jin's base for Chapters 2–4 ($8/night).

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions to earlier choices and to this chapter |
|---|---|---|---|---|
| `luz_alvarez` | 3B door (chain on), then kitchen | holds the door; `armsCrossed` | "Who is it? ...We've lived here since April of last year. The people before, I don't know them." | If Jin explains calmly: opens the door. If he insists: stays chained, but points downstairs: "The lady at the noodle place has been here forever." |
| `rosie_alvarez` | Behind her mother | peeks | (Bark) "Is he Santa?" | Ch9: her height mark beside Jin's. |
| `mr_sun` | Sun's stool | `sit`, ledger | Before the telling: "Jin-ah. Ok-ja is in the back. Go upstairs first. Then come down. Please." | His back is bad now; he never stands this chapter (in Ch0 he stood in the door). |
| `mrs_sun` (Sun Ok-ja) | Sun's kitchen → booth | `work`, then `sit` | See Scene 2.3. Bark after: "Eat. Then don't eat. Just sit." | — |
| `danny_sun` | Alley, back door | `work` washing pots | Before the fight: "Hey. You're— Aunt Ok-ja said. I'm sorry, man." During: "HEY! Leave him alone!" After: brings a towel packed with snow for Jin's hand. | — |
| `wanda_pruitt` | Alley, laundromat door | `smoke` | "That gray van's been parked out front since Thursday. Thought it was the gas company." During the fight: `cower`, then "I'm calling the cops!" After: "They don't come here. But I called." | — |
| `darnell_pruitt` | Laundromat, sweeping | `sweep` | If `signed_glove`: "You signed my glove! I still got it. ...You lost." Else: "You're the guy from the poster. You lost." Then: "My mom says you didn't lose, you got robbed. Is that true?" Jin: "Ask me later." | Ch9 night: "Is it later yet?" |
| `kristy` | Iron Pulse desk | `wave` | "Hi! Are you here for the free week?" / "The old guy? Mr. Marsh? He sold it to my boss last year. He comes in sometimes and just looks at that wall. He left his bowling shirt, it's in lost and found— Starlite Lanes, Tuesdays." | — |
| `dale` | Photo counter | `write` | If asked about Min: "Min Seo? She trained me. She was... she was funny. She made fun of how I said 'matte'." (He looks like he might say more, and doesn't.) | Ch6: he has her unclaimed prints. |
| `kettle_volunteer` | Outside Kessler Drug | rings a hand bell | Bark: "Merry Christmas!" | — |
| `tooley` | Collector (gray van) | `leanWall`, then fight | "Daniel! Mr. Pike's worried sick about you. Let's get you home." If `signed_real_name`: "Mr. Pike's real upset about your little signature." | Questioned after. |
| `big_carl` | Collector | `armsCrossed` | "Easy way, Danny boy." | — |
| `van_driver` (Ricky) | Thug | in the van, then out | "Just grab him, Carl, it's freezing." | — |
| `gus` | YMCA desk | `sit`, scanner | "Lim? Hana Lim sends people sometimes. Eight bucks. Room 312. Radiator's loud, it means it's working." | Ch3: "A Ms. Lim called." if `called_hana_ch2`. |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `poster_wall_1996` | Poster wall | Peel interaction (3 presses, one layer each). Text per layer: "Iron Pulse. Nineteen dollars a month to look at my old gym." / "The Rustbelts are getting back together. Good for them." / "Ashgrove Tower. 'Live above it all.'" Then the poster: "CASTELL vs SEO. Torn right across my face. Two years of other people's Fridays on top of my Saturday." | `ev_fight_poster` |
| `missing_flyer` | Flyer in the window | "MISSING: JIN SEO, 26. Last seen Calder General Hospital, Sept 1, 1994. Boxer. Call 555-0148 or Sun's Noodle. Min wrote the phone number twice, bigger the second time." | `ev_missing_flyer` |
| `mailbox_3b_1996` | Mailbox | "ALVAREZ. Under the sticker, Min's handwriting. NO MENUS PLEASE." | — |
| `geranium_can` | Coffee can | "Sal's geranium. Just snow now." | — |
| `bulb_on_two` | Light bulb | "BULB COMING — SAL. It didn't." (closes "Bulb on Two") | — |
| `height_marks_1996` | Doorframe | "She painted until she reached the names. JIN 8. MIN 4. JIN 12. The rest is white." | `mem_height_marks` |
| `old_wall_paint` | Old paint | "HANDS UP / CHIN. Teddy painted that in '79. He said the third part didn't need a sign." | — |
| `lost_and_found` | Lost and found | "A maroon bowling shirt. STARLITE LANES TUESDAY LEAGUE. On the back: CIVIC ARENA OPS. On the pocket: T. MARSH." | People note on Teddy: "Bowls Tuesdays at Starlite Lanes." |
| `roof_chairs` | Lawn chair (sit) | Sitting: the camera eases out to the whole skyline; time passes; snow thickens. Memory. | `mem_roof_1993` |
| `van_glovebox` | Glovebox | After the fight: the work order. | `ev_van_work_order` |
| `steel_knuckles` | Steel knuckles (pick up) | "They're warm from his hand. Teddy would've thrown me out of the gym for touching these." | Gear `knuckles` |
| `room312_window` | Window | "The river. That tower again. It's on every window in this city." | — |

`mem_roof_1993` — Fourth of July 1993, the two of them in these chairs. **Min:** "When you're champion, buy a building with a roof that doesn't leak." **Jin:** "This roof leaks?" **Min:** "Everything leaks, Jin. You've just never been home when it rains."

## Quests

- **Main — "No One Waiting."** HUD steps: "Go home. 412 Kessler, 3B." → "Ask someone who'd know." → (scene) → "Find somewhere to sleep tonight. (Hana's card: Calder YMCA, Front Street)" → (scene in the alley) → "Ask him who sent them." → "Find the man who was supposed to protect you." Completion: arriving at YMCA Room 312 and sitting on the cot.
- **Optional — "Under the Posters."** Objective: "Peel back the poster wall." Reward: `ev_fight_poster`.
- **Optional — "The Wall at Iron Pulse."** Objective: "See what happened to Marsh Boxing Club." Reward: Teddy's whereabouts (makes Chapter 3's opening a reunion instead of a coincidence; if skipped, Mo mentions Teddy instead).
- **Optional — "The Roof."** Objective: none shown (a `…` marker on the fire escape ladder). Climb to the 412 roof and sit. Teaches the fire-escape layer and gives the player a quiet place to put the news down.
- **Optional — "Call Hana."** Objective after arriving at the YMCA: "Call Hana (before 7 or after 9)." Sets `called_hana_ch2`, +1 hana.

## Scripted scenes

### Scene 2.1 — The 14
1. Card: "December 14, 1996 · Eastgate". The Route 14 bus pulls in from the left in light snow; its doors fold open; Jin steps down. **Camera**: very wide, the street small and quiet, held for three seconds before control returns. Thought: *Same street. Nobody's on it.*
2. The kettle bell rings once as he passes Kessler Drug. Thought: *Bells.*

### Scene 2.2 — 3B
1. The player buzzes 3B in the lobby or climbs and knocks. A woman's voice, chain on.
2. **Luz Alvarez:** "Who is it?" **Jin:** "I used to live here. Jin Seo. My mother— Mi-ok Seo. My sister." **Luz:** "We've lived here since April of last year. The super said the people before moved out. I'm sorry, I don't know them."
3. **Choice** (no flag beyond `saw_height_marks`):
   - "Could I just see the kitchen? One minute." → She hesitates, looks at Rosie, opens the chain. Jin stands in the doorway; he does not walk in (the player can move only within the doorway's 60 px). He can examine the doorframe (`mem_height_marks`). **Luz:** "I painted it in the summer. When I got to the names, I didn't know what to do. So I stopped." **Jin:** "Thank you for stopping." She doesn't know what to say; Rosie asks if he's Santa. Sets `saw_height_marks`.
   - "Never mind. Sorry to bother you." → **Luz** through the gap: "The lady at the noodle place downstairs. She has been here forever. Ask her."
4. Objective: "Ask someone who'd know."

### Scene 2.3 — Sun's (the discovery)
1. If the player enters Sun's before 3B, Mr. Sun sends him upstairs first (see NPC table). After 3B, entering Sun's: Mrs. Sun comes through the kitchen door, sees him, and drops a ladle (sound cue; the TV keeps talking). **Camera** cuts to a two-shot across the counter and holds.
2. She takes him by the sleeve to the back booth. They sit (`sit`). Letterbox on. The TV's volume dips (`muffle` 0.3).
3. **Mrs. Sun:** "Jin-ah. Two years. Where— no. No. Sit."
4. **Jin:** "Where's my mother."
5. **Mrs. Sun** (her hands flat on the table): "They lost the apartment. March, last year. Your mother sewed day and night. Min-ji went everywhere looking for you, every office, every week. The money went. Kaplan's son wanted the apartment empty. They moved to a rooming house. Lindell House, on Garrison Street. I said, come live with us. Your mother said we already did too much. Proud. Like you."
6. **Mrs. Sun:** "In January there was a fire. A cold, cold night. It started in another room. They were in number nine. They didn't get out." (beat) "Both of them, Jin-ah. Both."
7. **Camera**: slow push-in on Jin's hands on the table until they fill the lower third; the window behind goes soft; snow. No music. Heartbeat fx at 0.2, fading.
8. **Mrs. Sun** gives him the funeral card from her apron (`ev_funeral_card`: "In loving memory · Seo Mi-ok 1942–1996 · Seo Min-ji 1972–1996 · St. Casimir's Church · January 20, 1996 · Mount Hope Cemetery"). "Father Nowak at St. Casimir's did everything. What was left of their things, he keeps. In the church basement."
9. **Mrs. Sun:** "Min-ji came here every week with her flyers. She sat in this booth and wrote letters. To the hospital, to the city, to some council. So many envelopes." **Jin:** "What council?" **Mrs. Sun:** "I don't know, Jin-ah. She had so many."
10. She brings a bowl of soup and sets it down. Mr. Sun turns off the TV. Letterbox off. **Control returns inside Sun's.** Nothing is required. The player can:
    - sit at the booth (interaction `sit`): the camera eases out, time passes, the window goes dark, thoughts come one at a time: *Every week. In this booth.* / *Number nine.* / *I was asleep in a bed with somebody else's name on it.* Sitting long enough, Mrs. Sun turns the sign to CLOSED and sits across from him without speaking.
    - examine the MISSING flyer from inside (reversed text; the examine text reads it correctly).
    - leave.
11. Objective updates to "Find somewhere to sleep tonight. (Hana's card: Calder YMCA, Front Street)". Mrs. Sun at the door: "Stay with us tonight." **Jin:** "Not under that ceiling. Not yet." She presses a container of soup into his hands (a carry item that never blocks anything: it becomes a prop on the YMCA chair).

The street outside is unchanged. No enemies exist anywhere in `kessler_ave_1996`. The fight is attached to the alley and starts only when the player chooses to walk to Front Street.

### Scene 2.4 — The gray van
Trigger: Jin reaches x=1100 in `tanner_alley` with the Sun's scene completed.
1. Danny Sun at the back door: "Hey. You're— Aunt Ok-ja said. I'm sorry, man." Wanda on her smoke break: the van line.
2. Headlights from the Front Street end. A gray panel van backs into the alley mouth and stops, blocking it. **Camera** pulls back to frame the whole alley: van at right, Jin center, the back doors and the people at left.
3. Tooley and Big Carl step out. **Tooley:** "Daniel! Mr. Pike's worried sick about you. Let's get you home." (variant if `signed_real_name`.) **Jin:** "I am home."
4. **Big Carl** reaches for his arm: the first committed grab. Fight starts with no menu: the game shows only a one-time glyph when Carl winds up ("slip" glyph over Jin) and Jin's instinct line: *Too slow. Move.*

## Encounters

### Encounter 2A — Tanner Alley (EncounterDef `alley_ch2`)
- **Arena:** x 700–1450 in `tanner_alley`, ground layer only (fire escape blocked during the fight by a dropped ladder: "Not while they're between you and the ladder.").
- **Wave 1:** Big Carl (`collector`: big, slow, committed haymaker, grab). Teaches: slip the haymaker; dash and backdash to reset distance (two charges shown under Jin); jab–cross into the opening after his whiff. `maxAttackers` 1. Body: power 0.6, breath on. After ~12 seconds of trading without repositioning, Jin's breath runs low and his punches slow; the tip appears: "Brief openings. Don't trade." Carl takes many punches; this is intended (PDF: less stopping power, extended exchanges exhaust him).
- **Between waves (scripted, 4 s):** Carl goes down; steel knuckles skid out of his coat pocket across the snow. Interact to pick up (`steel_knuckles`). Gear on: stagger and damage up visibly (bigger spark, Tooley flinches at the first hit). The thought line is the only commentary on what it means.
- **Wave 2:** Tooley (`collector`) + Ricky the driver (`thug`). `maxAttackers` 2. Teaches: dodging one committed attack while the other approaches; using the dash to get out from between them.
- **Bystanders:** Danny shouts, Wanda cowers then calls; neither can be hit (Jin's punches pass through non-hostiles; they stay out of the arena band). Reyes Auto's radio keeps playing.
- **Checkpoint:** at the van's arrival (before wave 1) and after the knuckles pickup.
- **Loss:** Jin is shoved toward the van doors, fade, retry from the checkpoint ("They nearly had you. Again.").

### After the fight — questioning
Ricky runs off down the alley toward Kessler (enemies don't die; he flees). Big Carl is out cold. Tooley is down and conscious (`down`, then `sitFloor` against the dumpster).
1. **Choice: how to ask** (sets `asked_collector`, no meter):
   - "Who sent you?" → **Tooley:** "Pike. The hospital guy with the vest. He pays two hundred a man to bring you back."
   - Put a knee on his chest. "Who sent you." → same answer, faster, Tooley shaking.
2. **Jin:** "Pike doesn't know guys like you."
3. **Tooley:** "Pike don't. Lenny does. Lenny Voss. He books us. He works the Cellar now, under Starlite Lanes, out on Route 9. Fridays he does the cuts."
4. Thought (sepia flash 0.6 s, the paper cup again; this time a ring on the hand): *Lenny. Lenny was in my corner.*
5. **Choice** (`hurt_collector_after`):
   - Let him go. "Go home, Tooley." → Tooley gets Big Carl up and they leave on foot, the van abandoned.
   - Hit him again. → One more punch; the camera does not cut away; the sound is wrong (muffled, no spark, no hit-stop). Danny Sun in the doorway: "Man, he's done. He's done." Sets the flag.
6. Glovebox: `ev_van_work_order`. `ev_collector_statement` added.
7. Danny brings a towel packed with snow for Jin's hand. Wanda: "They don't come here. But I called."

### Scene 2.5 — Room 312
1. Front Street, snow heavier. YMCA lobby: Gus, the scanner, $8 (money −8). Gus: "Lim? Hana Lim sends people sometimes."
2. Optional: lobby payphone. If called (before 7 or after 9 in-game; the clock is shown on the lobby wall; if it's 7–9, Gus: "Shift change at St. Agnes. Try after nine." and sitting in the lobby passes time):
   - **Hana:** "Jin? You're alive. Good. Did you find them?"
   - (silence; the dialogue box shows "...")
   - **Hana:** "...Oh. Oh, Jin. I'm sorry." (beat) "I'm keeping the copy somewhere safe. Call me anyway. Even if there's nothing to say."
3. Room 312. Jin sets Mrs. Sun's soup on the chair, takes the knuckles out of his pocket, and turns them over. Sit on the cot: camera eases out to the window, the lit tower, snow.
4. Thoughts: *Their things are in a church basement on Garrison Street.* / *Not yet. I can't open those boxes yet.* / *First the man who was supposed to protect me.*
5. Objective: "Find the man who was supposed to protect you." (PDF wording.)

## Choices made here
| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Ask to see the kitchen | `saw_height_marks` | memory | Ch9: Rosie's mark added |
| How he asks Tooley | `asked_collector` | tone | Lenny's Ch3 first line ("Tooley says you put a knee on him.") |
| Hit Tooley again | `hurt_collector_after` | Danny's line | Ch3 Lenny is more terrified; Ch7 Pike: "Tooley's jaw is wired, Mr. Seo." Jin's later self-talk avoids "I never..." lines if set |
| Call Hana | `called_hana_ch2` | +1 hana | Ch3 message at the desk |

## Chapter ending beat and hand-off

A slow fade on the YMCA window. Chapter completion screen: background is the layered poster wall with the torn CASTELL vs SEO showing through. Summary line from flags, e.g. "You stood in the doorway of 3B." / "You let the collector go." State handed on: gear `knuckles`, skills dash/backdash/jab/cross/slip, breath on, money ≈ $32, People notes for Mrs. Sun, Teddy (if Iron Pulse visited: "Bowls Tuesdays at Starlite Lanes"), Lenny ("Works the Cellar under Starlite Lanes"). Map: Route 9 — Starlite Lanes unlocks. Garrison Street and Mount Hope stay visible and locked with Jin's own reason ("Not yet.") until Chapter 6.
