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
- **Stan "Wojo" Wojcik, 46.** h 49, `heavy`, forklift driver, a mustache, a tank top under a flannel. 0-19 at the Cellar and delighted about it: the one man downstairs who fights only for the pleasure of it. "Down here for six minutes I'm a lion." His mother Bernice volunteers at the Council HQ desk (Ch7).
- **Luis Ocasio, 17.** h 45, `slim`, an oversized Steelhawks tee, fast hands and bad breathing. Lies about his age to fight Thursday undercards for $40, which is his share of the rent. Optional thread "Seventeen" (Ch3); rents Jin's old YMCA room in Ch9.

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
- **Joanna Kaczmarek, 38, and six children** (only Paulie, 12, speaks). A-3B. Jin carries their new radiator up in Ch5; Rook names them in Ch7; "I'd beg him again."
- **Mrs. Mehta, 76.** B-1B, Dr. Anjali Mehta's mother. "He saved my home. I am old. I will not pretend otherwise."

### Celeste Ashgrove, chair, Ashgrove Capital, 48

- **Look.** h 45, build `slim`. Hair `bob` silver. Ivory `blazer` suit, pearl `earrings`, charcoal heels. Thin gold `watch`.
- **Body language.** Sits with hands folded on the table; stands only to walk to the architectural model, where she rests one fingertip on a building. Never hurried. Signature pose: at the floor-to-ceiling window with the city behind her, back half-turned.
- **Voice.** Gracious, philanthropic, speaks about "the city" as if it were a client.
  - "I've read everything you've done, Mr. Seo. It's a remarkable file."
  - "Somebody always moves. The only question a city ever answers is who, and whether they're helped."
  - "We can't give you 1994. We can give you 1998."
- **Wants.** The riverfront redeveloped, her family's name on something that lasts.
- **Perspective.** Displacement is a regrettable logistical step. She has rarely witnessed the consequences of her decisions (PDF).
- **How she changes.** She doesn't. In Ending Two she is investigated and issues a statement about "individual employees"; in Ending One she sits beside him on Channel 6 and calls his story Calder's story.

### Lyle Penner, managing director, Ashgrove Capital, 42

- **Look.** h 47, build `avg`. Hair `slick` dark. Navy pinstripe `suit`, red `tie`, cufflinks, `watch`. Jacket off in his own office, sleeves rolled two turns.
- **Body language.** Leans on desks, taps a pen against his teeth, paces. Points at documents rather than people. Signature pose: sitting on the edge of the boardroom table.
- **Voice.** Brisk, numbers-first, frank to the point of insult.
  - "Nobody in this building hurt you. We priced a risk."
  - "If he's still standing in the fourth, end it." (as quoted by Ray, Ch8; Penner gave the final instructions)
  - "You'll be on a poster again. A good one this time."
- **Wants.** The Alder Row closing on May 30.
- **Perspective.** Markets clear. People are inputs.
- **How he changes.** Not at all; he is placed on leave and investigated in Ending Two; in Ending One he sits in the back row at Jin's name hearing, reading something else.

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
| `teddy` | Coach Teddy Marsh | letting him explain in Ch3 (+1); asking whether he looked for him (+1); accepting the robe (Ch8, +1); mitts in the ring (Ch8, +1); stopping at the bell (Ch8, +2) | walking away mid-explanation (Ch3, -1); continuing past the bell (Ch8, -2) | Ch8 bell scene, Ch9 copy holder, epilogue gym |
| `lenny` | Lenny Voss | not threatening him (+2); presenting the tape calmly (+1) | threatening (-3) | Ch9 witness availability, Ending Two testimony |
| `deshawn` | Deshawn Tillery | bout 1 sportsmanship (touch gloves, +1); holding his bucket in Ch3 (+1); Ch5 mitts and gym help (+1 each, max +2); keeping the corner promise (Ch6, +3); throwing the towel when he can't see (+1) | skipping the corner promise (-3); Ch7 if Jin tells the residents himself without warning him (-1) | Ch7 anger intensity; Ch10 ally; epilogue gym |
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
| `asked_collector` | `asked` / `knee` | Ch2 questioning | Lenny's first line in Ch3 |
| `signed_glove` | bool | Ch0 Darnell | Ch2 Darnell line |
| `saw_poster_1994` | bool | Ch0 poster wall | Ch2 peel text |
| `luis_outcome` | `paid` / `reported` / `fought` | Ch3 "Seventeen" | Ch9 YMCA 312; Ending One undercard (`fought`); Ending Two Tuesday class (`paid`/`reported`) |
| `grill_scouted` | bool | Ch4 Harlan Grill booth | Ch4 route; Ch9 dossier |
| `stayed_for_soup` | bool | Ch5 Wednesday soup | Ch7 Odette line |
| `mentioned_dutch_to_rook` | bool | Ch5 Rook's visit | Ch7 Rook line |
| `bought_kid_gloves` | bool | Ch5 Dombrowski's ($12) | Benny in Ch6–7, Ending Two class |
| `left_flowers` | bool | Ch6 Lindell fence / Mount Hope ($4) | Ch9 candles at the fence |
| `read_all_letters` | bool | Ch6 archive | Ch7 Jin's answer to Rook |
| `visited_hana_ch6` | bool | Ch6 St. Agnes | `ev_hana_complaint`; Ch9 copies box ready |
| `showed_hector_print` | bool | Ch6 Courts | Ch7 Hector's line; Ch10 Hector's bus; Ending Two epilogue |
| `sat_with_odette` | bool | Ch7 Odette's 1C | Ch9 soup; Ending Two Odette |
| `accepted_robe` | bool | Ch8 watch booth | Ending props (robe on the door / PR call) |
| `mitts_with_teddy` | bool | Ch8 ring | Ending Two Saturday class |
| `ch9_visits` | set of names | Ch9 week | Ending lines per person |
| `mara_will_come` | bool | Ch9 workshop step, heard with mara ≥ 4 | Ch10: Mara's truck (Ending Two help; Ending One witness after the doors open) |
| `darnell_later` | `yes` / `not_yet` | Ch9 Kessler | Ending Two class |
| `knuckles_ch10` | bool | Ch9 last night, at the door | Ch10 Dutch line; Ending Two fight difficulty; Teddy's epilogue line |
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
| `ev_funeral_card` | Funeral card | Mrs. Sun's apron, Sun's | "In loving memory · Seo Mi-ok 1942–1996 · Seo Min-ji 1972–1996 · St. Casimir's Church · January 20, 1996 · Mount Hope Cemetery". | Where they're buried; who held the service (Father Nowak). |
| `mem_roof_1993` | The roof that leaks | Sitting in the lawn chairs on the 412 roof | Fourth of July 1993: "When you're champion, buy a building with a roof that doesn't leak." | — (echoed at the Ch5 kitchen roof) |

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
| `ev_civic_ledger` | Folder "CIVIC" | Records room, upstairs depot | Aug–Sept 1994: "8/19 DR2 access — P. O'Shea — $1,000 · 8/22 L.V. — $2,500 (window 2) · 8/24 R.H. wire recd · 9/2 Keystone, private transfer, Calder General → St. Agnes — $1,800 · 9/2 G.P., paperwork — $500 · 9/28 transfer to 'N' acct — per D.B. — (amount scratched out)". No name of the Council anywhere in it. | The gang handled the fight money, the dressing-room access and his hospital transfer. ('N' stays unexplained until Ch7.) |
| `ev_keystone_invoice` | Keystone Medical Transport invoice | Records room file | "9/2/94 · Calder General → St. Agnes · 1 pt, non-emergent · name: per G.P. · bill to Harlan Freight". | The transfer was paid by the gang. |
| `ev_disbursements` | Ledger "N.C.C. — SERVICED ACCT. 1995–97" | Records room, second ledger | "Bal. fwd 12/31/94: [under a coffee ring] · 3/95 Kewanee Boiler Co., Bldg A, Foundry Cts — $38,000 · 6/95 Delaney Roofing, Bldgs B–C — $61,500 · 11/95 community room fit-out — $22,000 · 4/96 playground surfacing — $6,800 · weekly: F. Courts maint. wages, envelope, window 2, Mon — $640 · monthly: St. Agnes, acct 'D. AHN' — $1,400–1,650". | Criminal money has legitimate destinations (PDF). Jin first reads it as a front. It does not show where the 1994 purchase money came from. |
| `ev_wage_envelope` | Payroll envelope | Cash office safe (examined either way) | "FOUNDRY CTS MAINT. · WK OF 1/20/97 · KOWALSKI M. / ESPOSITO R. / NUNES A. / ODOM T. / BRANDT K. · 5 @ $128 = $640". | Whose money it is. |
| `ev_dutch_statement` | What Dutch said | Questioning at the yard barrel | "Nobody paid for your fight. Your fight paid for things." Keystone is his cousin's ("We moved you. You were already hurt."). "The money lives across the river, in a tower." "Walter Rook sat in my office in '94 and negotiated like a union man. Ask the Council where their boiler came from." (Negotiated what: "Ask him.") | The Council and the outfit deal with each other; the money's owners are across the river. |

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
| `ev_complaint_file` | Complaint 95-2231 | City Hall Annex, Housing Inspection | 9/14/95, five signatures (M. Seo Rm 9, A. Ortiz Rm 5, D. Washington Rm 3, K. and L. Tran Rm 6): rear fire escape door padlocked from outside by agent L. Fisk, no working smoke detectors 2F, space heaters, pennies in the fuse box. Inspection 10/30/95 "no access (agent not present)"; 12/11/95 "postponed (staffing)"; next date 1/22/96. | Unsafe conditions were known and unresolved. |
| `ev_fire_report` | Fire Marshal report | City Hall Annex, Fire Marshal records | 1/14/96, 3:10 a.m., origin Rm 7 (2F rear), space heater on an overloaded circuit. 2F hall detector operational (battery dated 11/95, installed by a resident), so Rms 1–6 escaped by the front stair. Rear exit door padlocked, exterior hasp. Rm 9 occupants could not reach the front stair: SEO, MI-OK (53), SEO, MIN-JI (23). Agent L. Fisk referred to the DA 3/96. | How they died, and that it was a sequence of failures. |
| `ev_min_prints` | Unclaimed prints #4471 | Kessler One-Hour Photo (claim ticket in Min's wallet; balance $7.38) | 24 prints: Mom asleep at a sewing machine in room 9; the padlocked fire escape door with a ruler for scale (Min documenting the complaint); a cake with "JIN 27" (March 1995); Min holding her bookkeeping certificate (Dec 1995) in the half-hemmed blazer; Mom asleep on the dawn 14 bus with the driver's mirror in frame (Hector); Garrison Street in snow (Jan 12, 1996), the last frame. | Their life, their agency, their documentation. |
| `ev_ortiz` | Abel Ortiz's account | In person (Greyhound station, Ch6 Friday) or his letter via Father Nowak | Room 5. Fisk padlocked the rear door "against junkies" in July 1995; Min wrote the complaint and bought the hall detector's batteries with her own money, standing on his chair; Mi-ok worked nights, slept days, sewed his curtains for nothing; Min went to the Council office twice; he got as far as the door of 7. | Testimony to the conditions, the search, and their lives. |
| `ev_min_letters` | Eleven letters | Council archive, Foundry Courts community building basement (carbons also in her folder) | Addressed "Mr. Jin Seo, c/o Northside Community Council, Foundry Workers Relief Fund, 220 Foundry St.", Sept 1994–Dec 1995. Every original was slit open, read, refolded and stamped "HOLD — G.P."; none was answered except by the 7/1/95 standard regret. | The organization read her letters and withheld what they asked for. Title of the chapter. |
| `ev_pike_memo` | Memo, 6/12/95 | Same archive box | "To W. Rook from G. Pike. Re: Seo family. The sister has written seven times and came to the office twice. She has traced the Relief Fund from the Calder General ambulance invoice. Request instruction." Rook, in pencil: "Hold. No confirmation. We do not move him and we do not open this. Not now. — W.R." Below, Pike: "7/1 standard regret sent." | THE CRITICAL DISCOVERY: Rook was informed the family was searching and chose to preserve the concealed identity. |
| `ev_headstone_ledger` | Cemetery office ledger | Mount Hope office | "Seo, Mi-ok / Seo, Min-ji, Sect. F row 9. Stone: paid cash, T. Marsh, 4/96." | Teddy paid. |
| `mem_snow_garrison` | Snow on Garrison | Sitting at Lindell's fence | The last photo, re-imagined. | — |
| `ev_hana_complaint` | Hana's complaint | St. Agnes, Ch6 (optional visit) | Filed with the state Department of Health on 1/6/97: falsified identifying records, interference with a resident's communications; Hana on administrative review. | An institution's own staff on record; Ending Two process. |

### Chapter 7
| id | Title | Where | Summary | Proves |
|---|---|---|---|---|
| `ev_pike_ledger` | "D. AHN" account | Pike, Council HQ records room | 26 monthly payments to St. Agnes, Sept 1994–Oct 1996, $1,400–$1,650; total $41,210. First page, Pike's margin: "Per W.R.: best available care. Do not economize." | The Council paid for good care and no name (the PDF's thematic seed in one line). |
| `ev_rook_notebook` | Rook's 1994 notebook | Rook hands it over in his office | "Foundry Co. liquidation — 90 days — deadline 9/30 — 212 households — Pgh buyer (parking) — Calder Savings no (4th time) — state program '96 — Kaczmarek baby due Oct — Odette packing — B. says there's a fight in Aug, a sure thing, the people betting want a community partner, a share — ONE TIME." 8/21: "B. called from General. Not waking up. If the name comes out the deal comes out. Told him: best place, pay for it, no name." 6/12/95: "Pike re: sister. Told him hold." | The negotiation, the deadline, the decision to conceal, and the decision to hold. |
| `ev_ledger_1994` | "NCC SPECIAL ACCOUNT 1994" | Pike, Council HQ records room (the page missing from Harlan Street) | "9/28/94 received via Harlan Frt (Riverside Hldgs) $410,000 · 9/28/94 Foundry Cts purchase deposit $410,000 · 10/3/94 closing · thereafter serviced by H.F., window 2". | With the CIVIC folder ("8/24 R.H. wire recd", "9/28 transfer to 'N'"), it links the fight's payout to the purchase. |
| `ev_alder_letters` | Letterhead letters | Rook's desk | A hundred unsigned copies: "To the residents of the Alder Row Cooperative: The Northside Community Council supports the voluntary relocation of residents..." | The outfit now uses the Council's dependence to demand cooperation with further deals (PDF). First mention of Alder Row. |
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
| `ev_terms_sheet` | Terms | Boardroom, handed to Jin by Celeste | Hollis Neurorehabilitation 18-month inpatient program (admission letter issued to SEO, JIN); Riverside Lofts 9C for three years; $2,000/month for 3 years; name petition "In re SEO, JIN, formerly recorded as AHN, DANIEL" already filed, hearing June 3; three tune-up bouts then a title eliminator at Calder Civic Arena, "the championship route to be arranged". In consideration of his presence at Alder Row, 5 a.m. May 30, and his public part in the groundbreaking. | The offer is real (PDF: the benefits are real). |
| `ev_dossier` | Their file on him | Boardroom table | Photographs of Jin at Starlite, at Foundry Courts, on the Annex steps; Hana's complaint; his AMA form; Marty's incident report; notes on the depot money and on the bell; copies of Min's letters from the Council archive. | They followed his progress, and read everything. |

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
- Luis repays $40 in Ch9 (if `luis_outcome = paid`).

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
- Photocopies of the evidence at Kessler Drug, Ch9: $6.40 a set (Dale waives it if Jin can't pay); Ch7 posting copies $2.10.
- Luis's $40 so he doesn't fight (Ch3, optional).
- Coffee at the Harlan Grill: $1 (Ch4).
- Carnations or a votive candle at Garrison Grocery: $4 (Ch6).
- Pier Street room 4: $45/week (Ch7 on, only if `left_courts_loft`; charged at chapter start).

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
| **Riverside — Pier Street** | Mrs. Okafor's rooming house, room 4 | Ch7 (only if Jin leaves the loft) | Ch9: lilac in bloom; the window looks across the river toward South River. Ending Two: the rented room (robe on the door, gloves on a nail, the smoke detector's blink). |

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

---

# Chapter 3 — The Price of Admission

## Date, mood, palette, weather

Tuesday, January 7 to Friday, January 10, 1997, three nights at Starlite Lanes on Route 9 with a rest day at the YMCA between them. The chapter opens on a time card: "Three weeks. The Cellar was dark for the holidays." (Jin went once on December 23 and found a hand-lettered sign: "CLOSED DEC 22 – JAN 6 · HAPPY HOLIDAYS FROM MO & THE STARLITE FAMILY".) Mood: loud, smoky, transactional, oddly friendly; a whole economy of men doing what they have to. Palette: outside, sodium orange over dirty plowed snow and the Starlite star sign in pink and teal with three of its eight points dead; upstairs, warm varnished lanes under fluorescent light with glowing pin decks; downstairs, green-painted cinderblock, one cage light over the ring, red EXIT sign, blue cigarette haze. Weather: hard, dry cold on Tuesday; sleet on Thursday (the parking lot reflects the sign in broken horizontal streaks); clear and windy on Friday.

## Gameplay identity

A boxing-economy hub. The player returns to the same two-floor building three nights running and watches it fill up, the way a MapleStory town fills up at a set hour. Most of the chapter is talking to fighters and staff between bouts, inspecting the venue, three short ring bouts with rounds and the bell, one office to look through, and one frightened witness to handle. All combat this chapter is in the ring, under rules, in gloves (the knuckles go in Jin's pocket: "Gloves on. House rules."). Share: exploration 20% · dialogue 30% · investigation 15% · combat 30% · activities 5% (heavy bag, holding the bucket). Target 22–25 min.

## Locations

### `route9_starlite_lot` — Route 9 and the Starlite parking lot (1800 x 360, exterior)
Left to right:
- **0–200 Route 9 bus shelter.** Plexiglass scratched with initials. Ad panel: "CALDER SAVINGS · WE SAID YES TO 1,000 CALDER FAMILIES" (Chapter 7 pays this off: Rook says the bank said no to him four times).
- **200–500 Dino's Tire.** Closed for the season, tires stacked under snow, a hand-painted "BACK IN MARCH".
- **500–1300 the parking lot.** Two sodium poles; plowed banks; Mo's white Cadillac Seville (vanity plate "MO 1"); a pickup with a bowling bag on the seat; on Friday only, Lenny's brown Cutlass Supreme with a rosary on the mirror, parked nose-out by the loading alley. The **Starlite sign** on a tall pole at x≈900: an eight-point star, five points lit, and a letter board: "TUES LEAGUE · FRI COSMIC · CONGRATS GARY 300".
- **1300–1650 building front.** Glass doors fogged at the bottom; in the window, a curling poster: "NORTHSIDE COMMUNITY COUNCIL HOLIDAY TOY DRIVE · THANK YOU CALDER!" with a photo of a broad gray-haired man in a canvas jacket and Mo in his satin jacket holding a box of toys between them. (First appearance of Rook, unnamed, as a benefactor. Examining it: "Somebody's grandfather and Mo, holding a box of trucks. Everybody loves a toy drive.")
- **1650–1800 loading alley.** Dumpster, grease barrel, a steel door with a painted star and "DELIVERIES · FIGHTERS USE THIS DOOR". Stairs down to `cellar_main`.
Background: Route 9 overpass, a motel sign ("VACANCY" with the C out), far off the Ashgrove Tower's white crown. Lighting: sodium pools; the star sign throws pink on the snowbank. Ambient: Route 9 traffic, the sign's transformer buzz, muffled pin crashes through the wall.
Exits: front doors → `starlite_lanes`; fighters' door → `cellar_main` (from Tuesday on, after Mo has met Jin; before that: "Fighters' door. Mo hasn't met me yet."); bus shelter → map (Route 9 bus to Front Street, $1 token).

### `starlite_lanes` — Starlite Lanes, upstairs (1800 x 360, interior)
Left to right: entry mat and the Council toy-drive box, empty now, with a thank-you sign in marker ("412 TOYS DELIVERED! — N.C.C."); the **shoe counter** (Rhonda; cubbies of rental shoes; a sign "SHOES MUST BE RETURNED. WE KNOW WHO YOU ARE."); lanes 1–12 seen side-on in shallow perspective, pin decks glowing, overhead score screens with names; **lane 7** (Teddy's team, "CIVIC ARENA OPS"); a ball rack; the **Star Bar** (horseshoe counter, a TV on Channel 6 sports, a jar of pickled eggs, a **trophy case** holding league trophies and a framed photo "MARSH B.C. BOWLING NIGHT · 1971" showing a young Teddy and a thinner Mo); an arcade fighting-game cabinet with a cracked joystick; at the far right, the "EMPLOYEES ONLY" door and **Hutch's stool** at the top of the stairs down. Lighting: warm, bright, homely. Ambient: pins crashing, a ball return's rumble, league banter, a jukebox (soft rock), the bar TV.
Exits: front doors → lot; EMPLOYEES ONLY → stairs → `cellar_main` (Hutch: "Ten bucks to watch. Fighters see Mo.").

### `cellar_main` — The Cellar (1400 x 420, interior, low ceiling)
The old pinsetter maintenance floor under lanes 13–24, which closed in 1989. The ceiling is the underside of the lanes: when someone bowls upstairs the ceiling thunders and dust sifts down through the cage light (a recurring environmental cue).
Left to right:
- **0–250 stairs and bar.** Stairs come down from the upper left. A plywood bar with two coolers and an honor box ("BEER $2 · BE HONEST · MO IS WATCHING"). **Sully's chalkboard** of odds on an easel.
- **250–1050 the ring.** Ring 500–800 (300 px): ropes wrapped in duct tape, corner posts made of steel pipe, a canvas with old brown stains scrubbed pale. One cage light over it, two clamp lights on the pinsetter beams. Folding chairs on three sides, standing room behind. The **timekeeper's crate**: a kitchen timer and a red fire-alarm bell bolted to a plank with a push button. (It is not the 1961 bell. It is louder and uglier, and the first time it rings Jin's thought is *Not that bell. Good.*)
- **1050–1400 back hall.** Doors: the warm-up room, the cutman's room (light under the door on Friday only), Mo's office (frosted glass "M. FEENEY · PROMOTIONS"), and the loading stairs up to the alley.
Lighting: hard white over the ring, everything else brown and blue in smoke. Ambient: crowd (Tue: thin, a dozen; Thu: thirty; Fri: packed), the ceiling's bowling thunder, a radio behind the bar.

### `cellar_warmup` — Warm-up room (700 x 360)
A heavy bag hanging from a pinsetter beam on a chain; a speed bag with a split bladder ("Out of order since Reagan," in marker); two benches; a rack of cracked house balls used as weights; a long mirror with a crack; a radiator that hisses; and the **record wall**, fighters' names and records written in marker on the painted cinderblock: "DESHAWN T. 4-1", "TOMMY R. 2-3 (OWES)", "SLIM W. — RETIRED 3X", "WOJO 0-19 (UNDEFEATED IN SPIRIT)". A shoelace key on a nail by the door: Deshawn's key to this room.

### `cellar_office` — Mo's office (640 x 360)
Desk with **the card book** (green ledger), a cash box, a rotary phone, a bowling-pin lamp; a filing cabinet whose bottom drawer is labeled "TAPES" (Mo videotapes main events for "highlights"; VHS tapes by date, and behind them a few audio cassettes in a shoebox with fighters' and staff names on masking tape); a **boombox** on the cabinet; framed photos of Mo with a weatherman, a minor-league pitcher, and the same gray-haired toy-drive man; and a wall calendar: "HARLAN FREIGHT CO. · WE MOVE CALDER · 1997", January showing a truck on a bridge (first sight of the depot's name, before anyone says it).

### `cellar_cutroom` — Cutman's room (480 x 360)
A closet with a rubbing table, a hot plate with a coffee pot, Lenny's kit laid out with surgical neatness (cotton swabs, adrenaline bottle, an enswell in a cup of ice, gauze, a jar of petroleum jelly), an ashtray, a maroon windbreaker on a hook. One bulb. The only clean surface in the Cellar is Lenny's tray.

### `lenny_cutlass` — Lenny's car (640 x 360, scene set)
The back lot by the loading alley, seen through the windshield of a brown Cutlass Supreme; engine idling for the heater, the star sign pink on the fogged glass, a rosary swinging, a cassette deck with a station-preset sticker "WCLD 1340".

### `ymca_track` — Calder YMCA indoor track (1600 x 360)
A banked running track on a balcony around the old gym; below, a pickup basketball game; a "1 MILE = 14 LAPS" sign; a water fountain; a window over Front Street. The Ch2–4 training spot for conditioning and footwork (cap 2 this chapter). Gus's scanner can be heard from the stairwell.

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions to earlier choices and to this chapter |
|---|---|---|---|---|
| `mo_feeney` | Cellar bar (Tue), ringside folding chair (Thu, Fri), office | `shrug` with the cigar | "Champ! Ex-champ. Almost-champ. What do I call you?" / "A fighter don't pay admission, kid. A fighter gets paid." / "I don't fix fights. I suggest outcomes." / "I was at the Civic that night. Row C. Lost two hundred on you. Lost it fair, I figured. Now I'm not so sure." | If `paid_cellar_admission`: "You *paid*? Nobody pays. Hutch, give the man his ten back. No, keep it, it's funny." Calls Jin "Eastgate" after bout 1. After Friday he never says "ex-champ" again. |
| `teddy` | Lane 7 (Tue, Thu), Starlite bar | `armsCrossed` over his ball; maroon league shirt | See Scene 3.2. Bark from lane 7 before the scene: (none; he hasn't seen Jin yet). | If the Iron Pulse wall was visited in Ch2, Jin recognizes the shirt from across the room and the scene opens with Jin's thought *That's his shirt. That's him in it.* Otherwise Rhonda points: "Teddy Marsh? Lane seven. He bowls like he's mad at the pins." |
| `rhonda` (Rhonda Szymanski) | Shoe counter / Star Bar | `work` spraying shoes | "Size?" / "Ten-and-a-half. You look like a ten-and-a-half. I'm never wrong." / Friday: "Mo says your coffee's on him. Mo has never said that." | Gives the "Teddy" pointer. Friday, if Lenny fled: "Lenny ran out without his jacket. In January. That's a man with a reason." |
| `hutch` | Stool at the top of the Cellar stairs | `sit`, reading a paperback western | "Ten bucks to watch. Fighters see Mo." / "Kid's mother cleans the lanes Sundays. He's seventeen. I didn't tell you that." | Remembers if Jin paid. After bout 1: "Fighters' door's yours now. Use the alley." |
| `sully` (bookie) | Next to his chalkboard | `write` chalk | Barks the odds as they change: "Eastgate four-to-one! Four-to-one on a man who went the distance with the champ, that's charity!" / After bout 2: "Even money. You ruined my board." | The board is readable each night and shows the odds moving with Jin's results; Friday's board lists "SEO–WHITLOCK · SEO IN 2 · 3/2" (a strange line to bet on, which the player can notice before Slim explains it). |
| `doc_haskell` | Ringside, black bag | `sit`, penlight | "Follow the light. Good. You're cleared." / (to Jin, privately, Tue) "I was a veterinarian for thirty-one years. Horses, mostly. Don't make that face, horses are harder." | After Jin's first bout he quietly checks Jin's pupils a second time and says nothing. Friday, if asked: "You've had a bleed, son. I can see it in how you track. Nobody down here's going to stop you, so you'd better." |
| `deshawn` | Warm-up room (Tue, Fri), ring | `shadowbox`, then `skipRope` | "Ex-champ! You following me?" (Tue, first meeting: "You're the guy from the poster? My grandma had money on you.") / "Mo's room is the only ring on the Northside with real ropes. Lose the booking, lose the key." / "I live at Foundry Courts. My grandma's building. Best roof on the Northside." | Bout 1 sportsmanship (+1). Friday: works his co-main; if Jin holds the bucket (+1). |
| `tommy_reardon` | Warm-up room (Thu), bar (Fri) | `sit` bench, taping his own hands badly | "Nothing personal. I owe him four hundred. You're forty of it." / Friday, ice pack on his eye, invoice book open: "Forty down. Three-sixty to go. I got a water heater in Hillcrest at seven a.m." | Thanks Jin for "not making it long". If Jin asks about the debt: "Truck loan. Mo's the only bank that says yes to a plumber with a bad year." |
| `slim_whitlock` | Warm-up room (all nights; sweeps the Cellar for Mo), bench | towel over head, `sit` | Tue: "You're arm-punching. Don't tell anybody I told you." Thu (the hook, see scenes). Fri: "Mo wants you in the second. I go down in the second. Don't make it weird." | Slim works for Mo: he sweeps, fixes the ropes, spars with anybody, and gets a cot in the back. Refusing Mo's expected result means losing the job and the cot. Choice and covering his pay change his Ch6/Ch9 lines. |
| `wojo` (Stan Wojcik) | Bar, then ring (Thu) | `drink`, laughing | "Oh-and-nineteen! Undefeated in spirit!" / After losing again: "Drinks on me! Not you, ex-champ. You're working." / "Why do I fight? I drive a forklift forty hours a week. Down here for six minutes I'm a lion." | The one man in the building who fights only because he loves it. He buys Jin a coffee on Friday whichever way the Slim bout goes. |
| `luis_ocasio` | Warm-up room (Thu), undercard | `shadowbox`, too fast | "I'm nineteen." / "Forty if I win, twenty if I lose. Rent's forty. You do the math." | Optional quest "Seventeen". |
| `civic_ops_bowlers` (Frank, Oscar, Lou) | Lane 7 | bowling, `sit` | Frank: "Teddy, you're up. Teddy. Teddy, you're *up*." / Oscar (after the scene): "He doesn't talk about the old gym. Thirty years we work nights with him, we know about the gym from his shirt." | Seeds Ch8: Teddy's crew are the Civic Arena maintenance staff; one of them leaves the loading-dock door unlocked for Jin in Ch8. |
| `lenny` | Cutman's room, ringside (Fri only) | `work` at his tray; `cower` | See Scene 3.6. | First line varies with `asked_collector` and `hurt_collector_after`. |
| `gus` | YMCA desk | `sit`, scanner | Wednesday: "A Ms. Lim called." (if `called_hana_ch2`) / "Nobody called. Somebody should." (if not) | — |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `toydrive_poster` | Poster | "NORTHSIDE COMMUNITY COUNCIL HOLIDAY TOY DRIVE. Mo and somebody's grandfather holding a box of trucks. Everybody loves a toy drive." | People note: "Northside Community Council — toy drive at Starlite." (The Council's name enters the journal before the player knows what it is.) |
| `trophy_case` | Trophy case | "MARSH B.C. BOWLING NIGHT, 1971. Teddy with hair. Mo with a waist. They were friends before I was born." | — |
| `sully_board` | Odds board | Changes nightly. Friday: "SEO–WHITLOCK · SEO IN 2 · 3/2. Who bets on a round?" | Hint toward the arranged result. |
| `fire_bell` | Bell | "A fire-alarm bell bolted to a board. Not that bell. Good." | — |
| `record_wall` | Names on the wall | "Every fighter who's fought down here, in marker. WOJO 0-19 (UNDEFEATED IN SPIRIT). Somebody's added me already: EASTGATE ?-?" (After the chapter the wall reads "EASTGATE 3-0", and in Ch6 it has a second line under Deshawn's name in Jin's handwriting if he worked the corner.) | — |
| `speed_bag_broken` | Speed bag | "Split. 'Out of order since Reagan.'" (Ch6 pays this off: the Courts gym has a working one.) | — |
| `heavy_bag_cellar` | Heavy bag | Opens the bag drill (Thursday unlocks the hook). | Hook (Thu), bag drill cap 1. |
| `card_book` | Mo's card book | Viewer: Mo's green ledger. Columns "DATE · BOUT · PURSE · DRAW · EXP." The EXP. column is mostly blank. Some lines aren't: "11/22 Tillery–Bell · Tillery 3rd". "12/13 Reardon–Ocasio (pulled)". "1/10 Seo–Whitlock · Whitlock 2nd · house 3/2". | `ev_cellar_book` |
| `harlan_calendar` | Calendar | "HARLAN FREIGHT CO. · WE MOVE CALDER. Mo's got their calendar. Everybody's got somebody's calendar." | — |
| `tape_drawer` | TAPES | Before Friday: "VHS tapes of Mo's main events. A shoebox of cassettes behind them, names on masking tape. One says L.V." (Locked behind Mo unless the threaten path sends Jin here.) | `ev_cassette` (threaten path) |
| `lenny_tray` | Cutman's tray | "Everything lined up. Swabs, gauze, adrenaline, the enswell in ice. The cleanest thing in this building." | — |
| `lenny_jacket` | Maroon windbreaker | (Threaten path, after he runs) "He left his jacket. In January." | — |
| `ymca_message_board` | Message slot 312 | Wednesday. If `called_hana_ch2`: a pink slip, "Ms. Lim: 'Ask him if he's eating.' — Gus". Otherwise empty. | — |

## Quests

- **Main — "The Price of Admission."** HUD steps: "Find Lenny Voss. (The Cellar, under Starlite Lanes)" → "Get downstairs." → "Talk to Mo." → "Tuesday tryout: win or lose, you're seen." → (bout 1) → "Rest. Come back Thursday." → "Thursday card." → (bout 2) → "Friday. Lenny works the cuts." → "Fight Slim Whitlock." → (bout 3) → "Talk to Lenny." → "Follow the money: Harlan Freight, window 2." Completion: back in YMCA 312 with the cassette and the slip. Reward: purses ($60 / $80 / $120 or $150), hook, counter-cross, `ev_cassette`, `ev_payment_slip`, map node Harlan Street.
- **Optional — "Lane Seven."** Not shown as a quest; a `…` over Teddy at lane 7. Triggers Scene 3.2 the first time Jin approaches him on Tuesday or Thursday; if the player avoids him both nights, Teddy comes downstairs on Friday, stands at the back wall during the Slim bout, and the scene happens at the Star Bar before Lenny. `teddy_stance` is always set by the end of the chapter. Reward: `mem_corner_r2`; People note "Teddy: night watchman, Calder Civic Arena."
- **Optional — "Seventeen."** Giver: Hutch's aside (`…` on Luis after it). Objective: "The kid on Thursday's undercard is seventeen." Resolutions (all complete the quest; none is wrong): give Luis $40 so he can walk away tonight (`luis_outcome = paid`); tell Mo (`reported`, Mo pulls him: "I don't book children. I book liars, and he lied, so it's his fault, but I don't book children."); leave it (`fought`: Luis is dropped in the second, Doc Haskell checks his eyes with the penlight, Luis gets $20 and says "They pay half if you lose. Half's still something."). Read in Ch9 (Luis has Jin's old YMCA room).
- **Optional — "House Rules."** Talk to every fighter on the record wall who is present (Deshawn, Tommy, Slim, Wojo, Luis). Completion line, Jin's thought: *Rent. Debt. A key. A cot. Six minutes of being a lion. Nobody down here's here for the same reason.* Reward: journal page "Why they fight" (the PDF's list made personal: rent, recognition, debt, employment, the pleasure of fighting).
- **Training.** Bag drill (Cellar warm-up room, cap 1). YMCA track for conditioning and footwork (cap 2).

## Scripted scenes

### Scene 3.1 — Route 9 (Tuesday, January 7, 7:10 p.m.)
1. Card: "January 7, 1997 · Route 9". The Route 9 bus pulls away, revealing Jin at the shelter with his breath showing. **Camera** holds wide on the lot: the star sign, half dead, buzzing. Thought: *A bowling alley. Lenny always said he'd end up somewhere with a bar.*
2. The player walks the lot. Examining the toy-drive poster puts the Council's name in the journal. The fighters' door says why it won't open yet.
3. Inside: warmth, noise, Rhonda. **Rhonda:** "Size?" **Jin:** "I'm not bowling." **Rhonda:** "Everybody says that. Ten-and-a-half." (She sets a pair on the counter anyway; the player can take them, which does nothing except make Rhonda happy: "Told you.")
4. The shoe counter, the lanes and the bar are free to explore. Teddy is on lane 7 (see Scene 3.2). Hutch guards the stairs.
5. At Hutch's stool: **Hutch:** "Ten bucks to watch. Fighters see Mo." **Choice** (`paid_cellar_admission`): pay $10 / "I'm here to fight." (**Hutch:** "Tuesday's tryouts. It's Tuesday. Mo's at the bar. Don't touch his cigar.")

### Scene 3.2 — Lane seven (optional timing, always happens)
1. Jin approaches lane 7. Teddy is mid-approach with the ball. He sees Jin in the reflection of the ball return's hood and the ball goes into the gutter. Frank: "Teddy. That's a gutter, Teddy." **Camera**: slow push-in on Teddy's back as he stands at the foul line and doesn't turn around for three seconds.
2. **Teddy** (still not turning): "Frank, bowl for me." He walks to the Star Bar. Two coffees. They sit at the end of the horseshoe (`sit` stools). Letterbox on. The jukebox keeps playing; the pins keep crashing; no one else is paying attention, which is the point.
3. **Teddy:** "They told me you were in a home. Out of state. Family arrangement. I believed it because it let me off."
4. **Jin:** "I told you something was wrong."
5. **Teddy:** "You said something's wrong. I heard you. I sent you out anyway. I've had two years to come up with a better reason and I don't have one."
6. **Memory** `mem_corner_r2` plays here (sepia, full corner exchange from round 2, now with Teddy's half-second look held longer and Lenny's hand on Teddy's arm: "He's fine, Ted. I'll give him salts."). Back to the bar; Teddy has both hands around the coffee cup.
7. **Choice** (`teddy_stance`), offered while Teddy is still talking:
   - Stay. Let him finish. (`listened`, +1 teddy) → **Teddy:** "Lenny quit two weeks after. Said his back. Bought a Cutlass with his back. I sold the gym in '95. Your camp ran up bills I'd floated, and then there wasn't a fighter to float them for. I work nights at the Civic now. Watchman. I check the doors on the building where I— where we— I check the doors." He takes a breath. "I've got some of your things. Not tonight. I'm not ready to hand you anything."
   - Get up and walk out while he's talking. (`cold`, −1 teddy) → Teddy says to Jin's back: "He's downstairs Fridays! Lenny! Fridays!" and then, quieter, to the coffee: "...Okay."
8. **Follow-up option** (only on `listened`): "Did you look for me?" (+1 teddy) → **Teddy:** "Once. October '94. I took your sister to General. The desk said 'family arrangement'. Your sister said 'I'm the family.' They called security on a girl with a folder. I drove her home and I didn't go back. That's the whole story. It's short because I made it short." (This line is what makes Teddy appear in Min's Ch6 folder.)
9. Letterbox off. Teddy goes back to lane 7 and bowls a strike he doesn't celebrate. Oscar's bark: "He doesn't talk about the old gym."

### Scene 3.3 — Mo (Tuesday)
1. Downstairs. The ceiling thunders (a strike upstairs) and dust falls through the cage light onto an empty ring. Mo at the bar.
2. **Mo:** "Champ! Ex-champ. Almost-champ. What do I call you?" **Jin:** "Jin." **Mo:** "Jin. Eastgate. I'll workshop it."
3. **Jin:** "I'm looking for Lenny Voss." **Mo:** "Everybody's looking for Lenny, Lenny owes everybody. Lenny works my fighters, Fridays. You want to sit in his chair, you're my fighter. Tryout tonight. Thursday's a small card. Friday's the real one. Three fights, and Friday night he's taping your hands whether he likes it or not."
4. **Jin:** "And the purse?" **Mo:** "Tryout pays sixty, win or lose. I'm not a monster. A fighter don't pay admission, kid. A fighter gets paid." (If `paid_cellar_admission`: the "you paid?" line first.)
5. **Mo** (quieter, rolling the cigar): "I was at the Civic that night. Row C. Lost two hundred on you. Lost it fair, I figured." (beat) "Now I'm not so sure. Don't tell me. I don't want to know things on a Tuesday."
6. Objective: "Tuesday tryout: win or lose, you're seen."

### Scene 3.4 — The warm-up room (Tuesday, before bout 1)
1. Deshawn is skipping rope; Slim is on the bench under his towel. **Deshawn:** "You're the guy from the poster? My grandma had money on you. Five dollars. She still says you didn't lose, you got robbed."
2. Talk options (all available, any order):
   - "Why fight down here?" → **Deshawn:** "Mo's back room is the only ring on the Northside with real ropes. I get a key. I train all week. I fight when Mo says fight. Lose the booking, lose the key." (He touches the shoelace key on the nail.)
   - "Where do you live?" → **Deshawn:** "Foundry Courts, off Foundry Street. My grandma's building. Best roof on the Northside, they redid it last year." (Seeds Ch4–Ch5. When the Ch4 ledger names Foundry Courts, Jin's thought references this line.)
   - "Any advice for your opponent?" → **Deshawn** (grinning, cocky, generous): "Sure. I throw the right after two jabs. Everybody knows. Doesn't matter. Nobody slips it."
3. Slim, from under the towel, without looking: "You're arm-punching on the bag. Don't tell anybody I told you."
4. **Counter-cross unlock (practice → encounter).** Deshawn offers a light round on the mitts' wrong side: he throws, Jin slips. A glyph appears once over Deshawn's glove when the right is coming after two jabs. If the player slips it, the counter window opens and the prompt shows "Punch now" for the first time. Thought: *There. That's the door. Walk through it.* The counter-cross is learned; bout 1 is where it's confirmed.

### Scene 3.5 — Thursday: the office and the hook
1. Card: "Wednesday." YMCA: rest, the message slot, the track (training), Gus. If the player calls Hana (optional, payphone): **Hana:** "Pike was here Monday asking if you'd called. I said 'who?' I've never said 'who' to anybody in my life. It felt great." Sit on the cot to end the day.
2. Card: "Thursday, January 9 · Sleet." The lot is slick and the sign doubles itself in the puddles.
3. Mo calls Jin into his office to sign the house waiver ("You fall down, it was your idea. Sign here."). A shout from the ring (two drunks squaring off in the crowd); Mo swears and goes out. Jin is alone in the office for as long as the player wants. The card book is on the desk; the tape drawer is shut; the Harlan Freight calendar is on the wall.
4. Reading `ev_cellar_book`: Jin finds tomorrow's line, "1/10 Seo–Whitlock · Whitlock 2nd · house 3/2". Thought: *I'm in the book. Somebody's already decided how my Friday goes.* (beat) *That's twice.*
5. Warm-up room. Jin works the heavy bag; his punches slap. Slim watches from the bench, then gets up for the first time all week. **Slim:** "Turn the hip like you're shutting a door with it. Your arm's just along for the ride." **Hook unlock (practice).** The bag drill's first tier now accepts jab–cross–hook; the bag swings properly for the first time. **Slim:** "There you go. Now forget I'm a nice guy."
6. Luis is shadowboxing in the corner, too fast, breathing wrong (quest "Seventeen").

### Scene 3.6 — Friday: Lenny
1. Card: "Friday, January 10." The lot is full; Lenny's Cutlass is parked nose-out by the alley. The Cellar is packed; the ceiling thunders with Cosmic Bowl upstairs (black lights spill pink and green down the stairwell).
2. Warm-up room. The cutman's room door is open; Lenny is laying out his tray, his back to the door, humming. He turns. **Camera** holds on Lenny, small in the doorway frame, as he sees Jin. His swab drops.
   - Default: **Lenny:** "Jin. Kid. Look at you. Look at you *walking*."
   - If `asked_collector` was the knee: **Lenny:** "Tooley says you put a knee on him."
   - If `hurt_collector_after`: Lenny is already backed into the corner. **Lenny:** "Tooley's eating through a straw, Jin. Through a *straw*."
3. Lenny tries to leave through the loading stairs. Mo is standing on them. **Mo:** "You work my card, Lenny, or you work somebody else's. Somebody else's is in Pennsylvania." Lenny goes back to his tray.
4. **Slim**, in the warm-up room before the bout: "Mo wants you in the second. I go down in the second. Don't make it weird." **Choice** (`slim_fought_straight`):
   - "Fight me straight." → **Slim:** (long pause; he takes the towel off his head for the first time in the chapter) "Kid, I haven't been asked for my best in three years." (beat) "Okay. Okay. Mo docks me a hundred. Worth it." (+2 slim)
   - Say nothing. Nod. → **Slim:** "See? Easy. Nobody gets hurt." Jin's thought: *That's what they told me too.*
5. Bout 3 (see Encounters). Lenny works Jin's corner, because the house cutman works both corners (the echo of 1994 is built into the rules). Between rounds Lenny holds out the water bottle. The interact prompt on it reads "Not from his hand." Jin takes the bottle, pours it out on the canvas, and drinks from Doc Haskell's. Lenny's hands shake while he greases Jin's brows; he does it perfectly anyway.
6. After bout 3, Mo pays (purse by result, see Encounters). If Slim fought straight, Mo counts out Slim's pay in front of everyone, $100 short. **Choice** (`covered_slim_pay`): hand Slim $100 (+2 slim; **Slim:** "Don't do that." He takes it. "Don't ever do that again.") / leave it.
7. The cutman's room. Lenny is packing his kit. **Jin:** "You gave me the cup." **Lenny:** "I gave you a lotta cups. I gave you a thousand cups—" **Jin:** "Teddy's mix." Silence. The bulb buzzes.
8. **Lenny** (minimizing): "A step. They said slow him a step. Nobody said nothing about your head. I fix faces, I don't break 'em." **Jin:** "Who's they." **Lenny:** "A guy in a coat. I don't know his name, I swear on my mother. He knew mine. That's how it works. The guy who knows the names ain't the guy you know." **Jin:** "Who paid you." **Lenny:** "...Harlan Freight. Window two. Dutch Brannigan's people. They did the money, the cars, the doors. Who do you think opened Dressing Room 2 for the coat? Who do you think drove you out of General in the middle of the night?"
9. **Choice** (`threatened_lenny`) — the PDF's "frightened witness" question. Both paths give the same evidence; the difference is time, and what it does to Lenny.
   - **Threaten him.** Jin puts Lenny against the wall, knuckle-hand on the cinderblock beside his head. → Lenny talks fast: "The tape! I got a tape, it's in Mo's drawer, under L, take it, take it—" He throws his wallet on the rubbing table, ducks under Jin's arm and is out the loading door and gone into the lot without his jacket. (−3 lenny.) Jin takes the slip from the wallet (`ev_payment_slip`), goes to Mo's office; **Mo**, at the door with an unlit cigar: "He owes me a month on that drawer. Take whatever's his." Jin plays the cassette on Mo's boombox (`ev_cassette`). Mo listens to the whole thing standing in the doorway and says: "I didn't hear that. I don't fix fights." He leaves the door open.
   - **"Finish your night. Then we talk."** → **Lenny:** "I got Deshawn's co-main and the last bout. Hold the bucket. Please. If Mo sees me walk out with you I'm done." (+2 lenny.) Jin holds the bucket in Deshawn's corner for his co-main against Andre "Hammer" Bell (activity: carry the bucket and stool through the crowd, hand Lenny what he calls for: "Swab. Ice. Gauze. Not that, the *other* gauze."). Deshawn is cut over the left eye in round 2; Lenny closes it in forty seconds, humming; Deshawn wins in the third. (+1 deshawn for holding the bucket.) Jin watches Lenny be good at his job. Then: the Cutlass.
10. **The Cutlass** (patience path). Engine idling, heater roaring, windshield fogging pink from the star sign. Lenny opens the glovebox and takes out a cassette with "L.V." on masking tape. He puts it in the deck.
    - The tape (`ev_cassette`): a hallway hum, a door, and then the camel-coat voice, soft and reasonable: "...one cup, before he walks. A step slower, that's all anyone needs..." Lenny's voice: "And if he don't slow?" Coat: "Then it's not your problem. If he's still standing in the fourth—" and then a bright radio jingle cuts in over it: "*Calder Savings! We said yes!*" Lenny: "I taped over it. By accident. I was drunk. I was drunk for most of '94."
    - `mem_orange_cup_2` plays: the sepia fragment again, now with the hand complete to the wrist, a pinky ring, Lenny's.
    - **Lenny:** "I kept the tape 'cause I figured one day somebody'd come. I figured it'd be a cop. I didn't figure it'd be you." He gives Jin the slip from his wallet (`ev_payment_slip`): "Two thousand five hundred. Your purse was supposed to be forty. Everybody got paid. I got paid least." **Jin:** "I didn't get paid." Lenny has nothing to say to that. He drives Jin to the YMCA without being asked, and doesn't turn the radio on.
11. Either way, objective: "Follow the money: Harlan Freight, window 2."

## Encounters

All three are ring bouts (BoutDef), three rounds of 45 seconds, Cellar rules: house gloves (the knuckles are removed and pocketed, stated by the bout intro card "GLOVES ON · HOUSE RULES"), a win by two knockdowns or on Doc Haskell's points card after three rounds. Jin's breath meter matters: he cannot sustain a full round of pressure, and between rounds it refills only partly (the stool scene). Checkpoint at the start of each bout and each round. A loss restarts the bout with Mo's line ("Again. Nobody paid to watch you lie down." / or Doc: "Follow the light. Good. Go again.").

### Bout 1 — Deshawn Tillery (Tuesday tryout)
- Opponent: `trained` archetype, "deshawn" variant. Punishes repeated jabs: if Jin throws three jabs inside two seconds, Deshawn slips the third and counters with a cross. Feints: a shoulder dip that isn't a punch (the first time, a thought line: *Feint. He wanted that.*). His tell: the right hand after exactly two jabs, which he told Jin about.
- Teaches: slip → counter-cross under a real punch (confirmation of Scene 3.4), not repeating one punch, reading a feint.
- Sportsmanship: before the bell the player may touch gloves (interact with Deshawn in the center): +1 deshawn. After the bout, win or lose: **Deshawn:** "Okay. Okay, ex-champ. Nobody slips it."
- After: $60. Hutch gives Jin the fighters' door. Sully moves his odds.

### Bout 2 — Tommy Reardon (Thursday)
- Opponent: `trained` archetype, "tommy" variant: a plodding pressure fighter, rusty, honest. Leaves different openings after missed strikes: a missed wide right leaves his body open (a hook to the body staggers him); a missed jab leaves his head open for a cross; a missed lead hook turns him square (a jab–cross lands clean). The openings are shown once each as a 0.3 s white edge on the open target the first time they occur, then never again.
- Undercard texture: Wojo loses his 20th fight in the bout before, cheerfully; Luis's bout (if not resolved) runs before Wojo's.
- Teaches: reading misses, using the new hook to punish a specific opening.
- After: $80. Tommy at the bar Friday with the ice pack.

### Bout 3 — Cyrus "Slim" Whitlock (Friday main event)
- **Straight** (`slim_fought_straight`): `trained` archetype, "slim" variant at full strength. Maintains distance (long jab, steps out after every exchange, uses the ropes to angle off), feints twice before committing, and changes his opening after a miss (a missed jab → he steps left; a missed cross → he clinches). Hardest fight so far; the dash in → jab–cross → slip → counter rhythm is the only reliable way through. Purse $120. If Jin wins, the crowd is quiet for a second (Sully's board just lost), then Wojo starts clapping and the room follows. **Slim** after: "Thank you. I mean it. Now I'm broke."
- **Arranged** (Jin said nothing): Slim fights at half pace in round 1, then in round 2 he walks onto a jab, waits for Jin's cross, and goes down on cue. The game gives Jin full control the whole time; nothing stops the player from not punching, in which case Slim goes down anyway on the next jab (the result is not Jin's to change once he agreed). Purse $150 ("house bonus"). The crowd roars; Sully pays out; the ceiling thunders. **Camera** holds on Jin standing over a man who isn't hurt. Thought: *That's what it looks like from the other side.* (No meter change: "everybody does.")
- Corner between rounds: Lenny and the water bottle (Scene 3.6 step 5).
- After: Mo pays. The record wall gets "EASTGATE 3-0" in Mo's marker.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Pay at the door | `paid_cellar_admission` | Mo's line, $−10 | Ch6 if Jin works the corner: Hutch waves him through: "You paid once. Lifetime membership." |
| Stay with Teddy or walk out | `teddy_stance` (`listened` / `cold`) | Teddy's account or his shout | Ch8: `listened` → Teddy calls the workshop phone and lets Jin in; `cold` → Jin finds his own way in and Teddy finds him in Section 14. Ch9 copy holder; epilogue gym. |
| Luis | `luis_outcome` (`paid` / `reported` / `fought`) | $−40 or Mo's line or the penlight | Ch9: Luis rents YMCA 312; his line and condition differ. Ending Two: Jin teaches him at the YMCA on Tuesdays if `paid` or `reported`. |
| Fight Slim straight | `slim_fought_straight` | Harder bout, $120 vs $150 | Slim's Ch6 and Ch9 lines; if straight and covered, Slim comes to Alder Row in Ending Two. |
| Cover Slim's docked pay | `covered_slim_pay` | $−100, +2 slim | Ch9: "You owe me nothing. I'm saying it first so you can't." |
| Threaten Lenny | `threatened_lenny` | Fast path; Lenny flees jacketless | Lenny leaves town after Ch4 (Mo, Ch6: "Lenny? Scranton or Erie or the moon."). He can't testify in Ending Two; the tape stands alone. Patience path: Lenny stays, waits on a Greyhound bench in Ch9 with a ticket he doesn't use, and testifies. |

## Chapter ending beat and hand-off

Patience path: Lenny's Cutlass pulls up outside the YMCA at 1:20 a.m.; Jin gets out; Lenny says through the window, "I'm sorry, kid," and drives off before Jin can decide whether to answer. Threaten path: Jin walks Route 9 in the wind because the last bus is gone, a long side-scrolling walk under the overpass with the star sign shrinking behind him, the cassette in one pocket and the knuckles in the other. Either way: Room 312, the cassette on the chair beside Mrs. Sun's empty soup container. Thought: *A step slower. That's all anyone needs.*

Completion screen: the Cellar's record wall with "EASTGATE 3-0" added. Summary lines from flags ("You fought Slim straight." / "You let Slim lie down." / "You waited for Lenny." / "Lenny ran."). State handed on: hook, counter-cross, bag drill cap 1; money ≈ $290–$320 (minus any Slim or Luis payments); `ev_cellar_book`, `ev_cassette`, `ev_payment_slip`, `mem_corner_r2`, `mem_orange_cup_2`; People: Teddy (watchman), Mo, Deshawn ("lives at Foundry Courts"), Slim, Tommy, Wojo, Luis. Map: Harlan Street unlocks ("Harlan Freight Depot · Route 22"). Time card for the next chapter: "One week. Friday again."

---

# Chapter 4 — Collections

## Date, mood, palette, weather

Friday, January 17, 1997, 8:00 p.m. to about 11:40 p.m. Friday is collection night at Harlan Freight: the week's envelopes come in from Harlan Street's shops and go out to the people the outfit pays. Mood: cold, procedural, tense; the first time Jin walks into somebody else's building on purpose. Palette: Harlan Street in sodium orange; the depot under floodlights in cold blue-white; rust-red and green-gray containers; yellow safety stripes; warm amber only in the Harlan Grill's windows and the cash office desk lamp upstairs. Weather: thin snow blowing sideways through the floodlights, truck exhaust steaming, a river wind that makes the chain-link sing.

## Gameplay identity

The first assault, built as a sequence of different kinds of space rather than one long corridor: scout from a diner booth, slip in or fight through a gate, cross a working loading floor, climb onto catwalks, break into a crowded yard, beat the man who runs it, and then read in silence upstairs with nobody left to fight. Group combat is the lesson: enemies coordinate, one of them directs the others, and the boss herds rather than chases. The chapter ends quietly on a choice about two piles of money. Share: exploration 15% · dialogue 10% · investigation 20% · combat 50% · activities 5% (the scouting booth). Target 20–25 min.

## Locations

### `harlan_street` — Harlan Street (2000 x 360, exterior)
Left to right:
- **0–200 Route 22 stop** under the railroad overpass. Pigeons, a drip line of icicles, a timetable with "LAST 22 — 11:50 PM".
- **200–650 Harlan Grill.** Chrome trim, red neon "HARLAN GRILL · OPEN 24 HRS · DRIVERS WELCOME", three booths visible in the window facing the depot gate.
- **650–900 Haddad Hardware.** Roll gate down. A hand-lettered sign taped inside the glass: "CLOSED SUNDAYS". Under it, an older sign, half scraped off: "PAID UP — LEAVE US A—".
- **900–1100 the rail siding.** Chain-link with a gap where the spur runs into the depot. Snowed-over rails, a dead switch lamp. (The scouted route.)
- **1100–2000 Harlan Freight front.** Razor wire; a guard shack with a space heater's orange glow; the rolling gate; the warehouse wall with a ghost sign "HARLAN FREIGHT CO. · EST. 1958 · WE MOVE CALDER"; two trucks idling; Dutch's black Lincoln parked by the office stairs inside the fence.
Background: the river, the bridges, grain elevators, and across the water the Ashgrove Tower's white crown. Lighting: sodium pools on the street; floodlight glare spilling over the fence. Ambient: idling diesels, the chain-link humming in the wind, a train horn far off, the Grill's jukebox when its door opens.
Exits: Grill door → `harlan_grill`; rail siding gap → `depot_docks` rail door (only once `grill_scouted`, otherwise "Floodlight on the gap. Somebody in the shack would see me."); front gate → Encounter 4A, then `depot_docks` front.

### `harlan_grill` — Harlan Grill (700 x 360, interior)
Counter and stools; a pie case; a coffee urn; a pass-through with Ernie the cook; three booths along the window, the middle one with the best view of the gate. A corkboard: "LOST DOG · ANSWERS TO PEPPER", a babysitting card, and a flyer "TENANT RIGHTS CLINIC · TUESDAYS · NORTHSIDE COMMUNITY COUNCIL" (the Council is everywhere that people need help). On the wall, a framed team photo: "HARLAN HAWKS 1996 · SPONSORED BY HARLAN FREIGHT" with a big man in a flat cap kneeling at the end of the row. Lighting: warm fluorescent, a red neon reflection on the window. Ambient: grill sizzle, the jukebox, Fran's pad.

### `depot_docks` — Loading floor (2400 x 480, interior warehouse, two layers)
Ground, left to right: the **rail door** (0–300) with a boxcar half inside; the **dock floor** (300–1100): a forklift abandoned with its reverse alarm beeping, pallets of ordinary freight (boxed washing machines, canned tomatoes, brake drums) and a chain-link cage stenciled "HOLD — D.B." full of cigarette cases and VCR boxes (the legal and the illegal sharing one floor); **Dot's dispatch booth** (1100–1400): glass box, space heater, bills of lading on a spike, a country station on the radio, a sign "88 DAYS WITHOUT A LOST-TIME ACCIDENT"; the **container stacks** (1400–2000), rust red and green, two high; **dock doors 4–6** (2000–2400) rolled open onto the yard, snow blowing in.
Upper layer: a steel catwalk along the back wall from 1300 to 2300 with ladders at 1350 and 2250, and container tops as platforms; between the stacks at 1700–1810 a gap too wide to jump (the air dash lesson).
Lighting: sodium high-bays, one dead; Dot's booth warm; the open dock doors throw blue floodlight in. Ambient: the forklift beeping until someone (or Jin) turns it off, the radio, wind through the doors, a pallet jack rattling.

### `depot_yard` — The yard (2000 x 420, exterior)
Floodlit truck yard: rows of trailers; two **container walls** that make dead-end corners at 600 and 1400 (Dutch uses them); a **burning barrel** with two drivers warming their hands; a trailer at 900 with a ladder to its roof (the retreat spot); the **office block stairs** at 1850. Snow, slush, puddles with floodlight reflections broken into streaks. Ambient: the barrel crackle, the floodlights' ballast hum, a truck's air brakes hissing.

### `depot_offices` — Office block (1600 x 360 per floor, stairwell 320 x 720)
1F: the **payroll windows** 1–3 (window 2 has a brass slot and a stencil "MISC. LABOR · FRIDAYS 4–6"), a waiting bench with a pair of work gloves forgotten on it, a time clock, a bulletin board with OSHA notices and a Harlan Hawks schedule. 2F: a narrow **corridor** (the dash-straight lesson), a **break room** (TV with the late news, a coffee machine, a calendar of the Steelhawks' season), the **records room** (steel door, padlock: "Padlocked. Dutch's ring has every key in the building."), the **cash office** (Marty's desk, a desk lamp, an adding machine with a paper tail on the floor, the open safe, an envelope rack), and **Dutch's office** (a cot, a space heater, a bottle in the drawer, a Rolodex, a framed 1958 photo of his father at the gate, and the Harlan Hawks photo again, a smaller copy he keeps on his desk).

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions |
|---|---|---|---|---|
| `fran` (Fran DeLuca, 58) | Grill, behind the counter | `work`, coffee pot | "Coffee? You look like coffee." / "Dutch? Tips twenty percent. Always. That's how you know a man's paying for something." / (scouting) "Shift changes at nine. Pat comes over for two crullers and doesn't go back till twenty after. Every night. Like church." | After the chapter, if Jin stops in on the way out: she pours without asking and says "I didn't see you tonight, and you didn't eat." |
| `ernie` | Pass-through | `cook` | Bark: "Order up! Nobody ordered this! Somebody eat it!" | — |
| `sam_haddad` | Grill counter, 8:15 p.m. | `sit`, counting change | "Sixty dollars a week so nobody breaks my window. Nobody's broken my window. So I suppose it works." | His name is on a tally slip in the collections bag upstairs. |
| `pat_oshea` (gate guard) | Guard shack, or the Grill 9:00–9:20 | `sit` in the shack / `drink` coffee | "Gate's closed, pal. Deliveries Monday." | He's a security guard (baton). In 1994 he worked the Civic Arena loading dock: he's the man with the clipboard who waved Teddy's wagon through in Ch0. The CIVIC folder names him. If the player examines him at the Grill after reading the folder, Jin's thought: *Clipboard. Loading dock. He waved us in.* |
| `dot_reilly` (61, dispatcher) | Dispatch booth | `write` bills of lading | "I do bills of lading, hon. I don't know what's in the cage and I don't want to." / (rail entry, before any fight) "Second floor's where the money is. Marty's a good boy. Don't hurt Marty." / (after the dock fight, putting her coat on) "I'm going home. I was never here. Neither were you." | Never hostile. Ducks under her desk during the dock fight (`cower`). |
| `drivers_barrel` (two drivers) | Yard barrel | `sit`/warming hands | "Not our shift. Not our problem." (They walk out the gate as the yard fight starts.) | Shows the depot also does honest work for honest people. |
| `cal_brannigan` (26, Dutch's nephew) | Yard, then office stairs | `point`, yelling | "Corner him! Left side, Joey, *left*!" | Director archetype. Flees up the office stairs when beaten; reappears in Ch7 (HQ) and leads the crew in Ch10 if `beat_dutch_after`. |
| `dutch_brannigan` | Yard; afterwards sitting at the barrel | slow walk, neck crack | "You don't run from a wall, son. You run into it. Saves time." | See questioning. |
| `marty_gold` (bookkeeper, 34) | Cash office, under the desk | `cower` | "Don't— I'm the *bookkeeper*. I keep books." / "'N' is a client account. A council. They're nice. A bus driver comes Mondays for the Courts envelope. Brings me a coffee. Hector. Nice fella." / Leaving: "Could you tie me up a little? So it looks like I tried?" | Frightened, cooperative, never threatened by the design (Chapter 3 already asked that question). |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `grill_booth` | Booth by the window (sit) | Sitting passes time in 10-minute steps and shows the gate through the window. 8:40: "Two trucks in. Same driver both times. He doesn't get out." 9:00: "Gate guard's walking over here." 9:05 (Pat at the counter): "Crullers." Sitting through to 9:05 sets `grill_scouted`. | `grill_scouted` |
| `hawks_photo_grill` | Team photo | "HARLAN HAWKS 1996. A dozen eight-year-olds and a big man in a flat cap kneeling at the end, very carefully, like his knees hurt." | — |
| `council_flyer_grill` | Flyer | "TENANT RIGHTS CLINIC, TUESDAYS. Northside Community Council. They're on every corkboard in this city." | — |
| `haddad_sign` | Old sign | "PAID UP — LEAVE US A—. Somebody scraped the rest off. Probably him." | — |
| `forklift_alarm` | Forklift | "Still beeping. I turn the key." (Silences the alarm; the room gets quieter and the radio becomes audible.) | — |
| `hold_cage` | Cage | "HOLD — D.B. Cigarettes and VCRs, stacked next to canned tomatoes. Everything here moves on the same trucks." | — |
| `window_2` | Window 2 | "MISC. LABOR · FRIDAYS 4–6. Lenny stood here in August of '94 and got paid for my legs." | — |
| `forgotten_gloves` | Work gloves on the bench | "Somebody waited here and forgot their gloves. Fingers worn through." | — |
| `dutch_keyring` | Key ring | Taken from Dutch after the questioning (or from the barrel where he drops it). | Records room access |
| `civic_folder` | Folder "CIVIC" | See `ev_civic_ledger`. | `ev_civic_ledger` |
| `keystone_file` | Keystone Medical file | See `ev_keystone_invoice`. | `ev_keystone_invoice` |
| `ncc_ledger` | Ledger "N.C.C." | See `ev_disbursements`. | `ev_disbursements` |
| `collections_bag` | Canvas bag "COLLECTIONS 1/17 — HOUSE" | "$300 in small bills, banded. The tally slips are stapled to the band: HADDAD HDWE $60. LUCKY WASH $40. HARLAN GRILL $50. ... Fran's fifty is in here." | `took_depot_profit` choice |
| `wage_envelope` | Envelope in the N slot | See `ev_wage_envelope`. Before taking: "Five names. Kowalski. Esposito. Nunes. Odom. Brandt. Somebody's Friday." | `ev_wage_envelope`; `took_wage_envelope` choice |
| `hawks_photo_desk` | Photo on Dutch's desk | "The same team photo. Smaller. Somebody's thumb has worn a spot on the glass over one kid." | — |
| `father_photo` | Old photo | "HARLAN FREIGHT 1958. A man in a flat cap at this gate. Same cap." | — |

## Quests

- **Main — "Collections."** HUD steps: "Harlan Freight Depot. Window 2." → "Get inside." → "Cross the loading floor." → "Get over the stacks." → "Break the yard." → "Ask Dutch Brannigan." → "Find the records." → "Read." → "Leave." Completion: boarding the Route 22. Reward: air dash, dash straight; `ev_civic_ledger`, `ev_keystone_invoice`, `ev_disbursements`, `ev_wage_envelope`, `ev_dutch_statement`; map node Foundry Courts.
- **Optional — "Like Church."** Giver: Fran (`…`). Objective: "Watch the gate from the booth." Completion: `grill_scouted`. Reward: the rail-siding route (skips Encounter 4A) and Dot's tip.
- **Optional — "The Bookkeeper's Alibi."** Marty asks to be tied up loosely with the phone cord. Completion: Marty sits tied on the floor and says "Thank you. Really. Tighter on the left. No, that's fine." No reward; Ch9's dossier contains Marty's incident report, which describes "a large, violent intruder" and is the only place in the game where Jin is described as large.

## Scripted scenes

### Scene 4.1 — The Grill
1. Card: "One week later · January 17, 1997 · Harlan Street". The Route 22 bus pulls away under the overpass. **Camera**: wide, slow pan right along the fence to the ghost sign and the floodlights, then back to Jin.
2. Inside the Grill. **Fran:** "Coffee? You look like coffee." (Coffee $1, or free if Jin sits without ordering: "Sit. I'll bring you a coffee and you'll owe me.")
3. Sam Haddad at the counter (texture). Fran's scouting line if asked about the depot.
4. The booth (optional quest). **Camera** eases out while Jin sits; the window becomes the frame; time steps forward with a small clock in the corner of the booth's window reflection. At 9:05 Pat comes in stamping snow off his boots. Fran: "Two crullers, Pat?" **Pat:** "Two crullers, Fran." If the player has examined Pat before: nothing. (The CIVIC folder later makes the player look at him again.)

### Scene 4.2 — Dot
(Rail entry only, before the dock fight.) Jin comes through the rail door into the quiet end of the floor. Dot looks up from her bills of lading through the glass. Long pause. **Dot:** "You're not a driver." **Jin:** "No." **Dot:** "I do bills of lading, hon. I don't know what's in the cage and I don't want to." (beat) "Second floor's where the money is. Marty's a good boy. Don't hurt Marty." She turns her radio up. The dock crew comes around the container stacks a moment later (Encounter 4B).

### Scene 4.3 — The gap
On the catwalk at x 1690, the container top ends. Below: a ten-foot drop into two crew who are climbing the ladder behind Jin. **Camera** zooms out slightly to show the far stack. Prompt (shown once): "Jump. Then dash, in the air." Jin's thought on the first attempt that falls short: *Not enough. More.* The air dash carries him across; landing restores air-dash eligibility but not the charge (the meter shows it). Thought: *My legs remember more than my hands do.*

### Scene 4.4 — Dutch
1. The yard after the crew are down (Encounter 4D). Dutch comes down the office stairs, slowly, zipping his vest. He doesn't hurry; he walks to cut off the lane between the trailers.
2. **Dutch:** "You're Seo. Thought you'd be bigger. TV makes everybody bigger." (cracks his neck) "You don't run from a wall, son. You run into it. Saves time."
3. **Camera**: zoom out to the whole yard as Dutch's crew step back to the trailers and form a loose ring; letterbox off; boss bar appears as a thin line at the bottom edge with "D. BRANNIGAN".

### Scene 4.5 — Questioning at the barrel
Dutch down, sitting against a trailer tire beside the burning barrel, breathing hard, cap off. The crew are gone or holding their ribs by the gate. Cal has fled upstairs. The barrel crackles; snow hisses into it.
1. **Dutch:** "Okay. Okay. You hit like a welterweight who's been sick. That's a compliment." (He tosses his key ring into the slush between them.) "Records are upstairs. Read whatever you want. Paper never hurt anybody."
2. **Jin:** "Who paid for my fight?" **Dutch:** "Paid *for*? Nobody paid for your fight. Your fight paid for things. Different."
3. **Jin:** "The ambulance. General to St. Agnes." **Dutch:** "Keystone Medical's my cousin's outfit. We moved you. We didn't hurt you. You were already hurt."
4. **Jin:** "The man in the coat." **Dutch:** "I don't know any coats. I know who signs. The money lives across the river, son. In a tower. I just move it around this side."
5. **Dutch** (unprompted, with something like amusement): "We collect. Some of what we collect goes to roofs. Funny world." (beat) "Walter Rook sat in my office in '94 and negotiated like a union man. Ask the Council where their boiler came from." **Jin:** "Negotiated what?" **Dutch:** (smiles, shuts his eyes) "Ask him."
6. `ev_dutch_statement` added. Jin picks up the keys.
7. **Choice** (`beat_dutch_after`):
   - Leave him at the barrel. → Dutch, eyes still shut: "Smart."
   - Hit him again. → One more punch with the knuckles. The sound is wrong (muffled, no spark, no hit-stop, the same treatment as Chapter 2). Cal's voice from the office stairwell: "Uncle Dutch!" Dutch, on the ground, very quietly: "That's the one you'll remember. Not the others." He doesn't get up. (Ch10: he is in the hospital and Cal leads the crew.)

### Scene 4.6 — Records
1. 2F corridor and the baton guard (Encounter 4F).
2. The records room: steel shelves, banker's boxes by year, a single bulb. **Camera**: when Jin opens the first folder, slow zoom-in to the desk until the room is a pool of light; the depot's noise drops away (muffle 0.4); the bulb's buzz stays.
3. **Document viewer, three items, any order:**
   - `ev_civic_ledger`: Jin's thoughts as the lines resolve: "8/19 DR2 access — P. O'Shea — $1,000." *Dressing Room 2. O'Shea. The clipboard at the loading dock.* "8/22 L.V. — $2,500." *Lenny.* "9/2 Keystone, private transfer — $1,800." *That's me. That's the ambulance.* "9/2 G.P., paperwork — $500." *Pike. Five hundred dollars to make me Daniel.*
   - `ev_keystone_invoice`: "name: per G.P." *They didn't even write a name. They wrote whose idea it was.*
   - `ev_disbursements`: the N.C.C. account, 1995 onward: Kewanee boiler, Delaney Roofing, the community room, playground surfacing, weekly wages, and a monthly line to St. Agnes for "D. AHN". The balance carried forward from 1994 is under a coffee ring. Thought: *The Council pays for my bed out of a gangster's cash office.* (beat) *And roofs. And a playground. Nice touch. Every outfit in this city's got a church it gives to.* (This is the PDF's "at first he assumes the second category is a front", said in Jin's voice.)
4. If the player has met Deshawn's "Foundry Courts" line in Ch3, the address on the Delaney Roofing line ("Bldgs B–C, Foundry Courts, 40 Foundry St.") triggers: *Foundry Courts. Deshawn's grandmother's building. "Best roof on the Northside, they redid it last year."*

### Scene 4.7 — The cash office
1. Marty under the desk: "Don't— I'm the *bookkeeper*. I keep books." Talking to him (optional, recommended) explains the room: "CIVIC was before my time. I just keep it." / "'N' is a client account. A council. They're nice. They don't yell." / "The fat envelope? That's not ours. That's the Courts' maintenance payroll. A bus driver picks it up Mondays at window two with a Council voucher. Brings me a coffee. Hector. Nice fella."
2. Two things on the desk under the lamp, both examinable before anything is taken: the canvas **collections bag** ($300, with Fran's fifty on a tally slip) and the **wage envelope** ($640, five names).
3. **Choices**, independent of each other, each confirmed with a plain two-option prompt and no timer:
   - Bag: "Take the house money." / "Leave it." (`took_depot_profit`) Taking: Jin's thought: *Theirs. Mostly. Fran's fifty is in there too.*
   - Envelope: "Take the envelope." / "Leave it." (`took_wage_envelope`) Taking: Jin's thought: *Somebody's Friday. Not mine.* (He takes it anyway if the player chooses; the game does not argue.) Leaving: *It's got names on it.*
   - Marty watches whichever Jin does. If the envelope is taken, Marty says, very small: "Hector's going to come Monday." That is the last word on it this chapter.
4. Marty's alibi (optional quest).

## Encounters

### 4A — The gate (skipped if `grill_scouted`)
Pat O'Shea (`guard`, baton) + 2 `thug`. `maxAttackers` 2. Teaches the baton's reach: a baton swing has a longer telegraph and a longer hitbox; slipping inside it opens a counter, backing out of it wastes the dash. Checkpoint at the shack.

### 4B — The loading floor
4 `thug` + 1 `guard`. `maxAttackers` 2, spaced. Teaches: repositioning through a group (the dash's dodge window lets Jin pass through ordinary enemies; the hint appears once when two enemies flank him: "Through, not around."), and the hook as crowd control (hook hits up to three in front; the first multi-hit shows one hit-stop only). Dot under her desk; the forklift alarm beeping until Jin or the fight's end silences it. Checkpoint at Dot's booth.

### 4C — The catwalks
2 `thug` chasing up the ladder + 1 waiting on the far stack. **Air dash unlock** (Scene 4.3). Teaches using vertical layers to split a group: the chasers climb one at a time.

### 4D — The crowded yard
- **Wave 1:** Cal Brannigan (`director`) + 3 `thug`. While Cal is shouting ("Corner him! Left side, Joey, *left*!"), the thugs attack faster and coordinate (one feints while another closes). Hitting Cal interrupts his directing for 3 seconds (his pose drops from `point` to `hurt`), and after enough hits he flees up the office stairs. Teaches: recognize and hit the enemy who directs others first.
- **Wave 2:** 2 `collector` + 1 `guard`. Teaches interrupting one attacker while avoiding another (a collector's grab is interruptible with a jab during its wind-up; the guard's baton is not, so it must be slipped).
- **Retreat:** the trailer roof at x 900 is always reachable by its ladder. Up there Jin's breath refills faster and enemies take 3–4 seconds to come around. The tip appears the first time Jin's breath falls below 25%: "Back off. Breathe. Choose when." (PDF: choosing when to retreat.)
- **Checkpoint** at the dock doors and between waves.

### 4E — Dutch Brannigan (boss, yard)
- `bossCollector`. HP high; resists stagger (needs three clean hits inside 1.2 s to stagger; launches never work on him). Behavior: walks to cut angles; never runs; herds Jin toward the two container dead-ends (his "wall" stance: arms wide, side-stepping to mirror Jin's dashes). Moves: a long straight shove (pushes Jin toward the corner), a looping hook, a two-punch body combo, and a **corner grab** (only when Jin's back is to a container wall: a slow two-arm grab, then a slam). Escapes: backdash before the wall, air dash over his shoulder from the trailer bumper at x 560 and x 1360, or slip the shove and counter-cross to turn him.
- At 50%: Dutch throws his cap down and says "Nobody touches him. He's mine." The crew who are still standing step back; he speeds up slightly and adds a feinted shove.
- Teaches the PDF lesson: distance and corners. The player who stays in the open beats him; the player who trades against a wall loses.
- **Checkpoint** at Scene 4.4. Loss: "Pinned. Again." retry from the start of the boss.

### 4F — The corridor
One `guard` holding the narrow 2F corridor, baton up, backed against the cash office door. There is no room to get around him. Prompt (once): "Dash, and keep going." **Dash straight unlock**: a forward dash flows into an extended straight after the initial burst and knocks him back down the corridor into the break room. Thought: *Through the door, not around it.* No checkpoint needed (single enemy, retry instantly).

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Watch from the booth | `grill_scouted` | Rail route, Dot's tip, gate fight skipped | Ch9 dossier notes "subject observed the gate for 25 min." |
| Take the house money | `took_depot_profit` | +$300 | Ch9 Penner's dossier lists it ("He took our money. Good. We understand people who take money."). Ch10 Dutch/Cal: "You took the house money. Fair." |
| Take the wage envelope | `took_wage_envelope` | +$640 | Ch5 Friday: Mara's crew is not paid; she pays Ade out of her own pocket. Night choice to return it (`returned_wage_envelope`). Ch7 when the books are opened: the missing week is a line in Hector's treasurer's report. Mara meter. |
| Hit Dutch after | `beat_dutch_after` | Cal's shout | Ch10: Dutch in hospital, Cal leads. Jin's self-talk lines drop "I never kept going" phrasing. |

The PDF's "first small-scale version of the final question" is the envelope. Its destination is written on it, said aloud by Marty, and repeated in Jin's thought. Leaving it blocks nothing.

## Chapter ending beat and hand-off

Out through the yard: if Dutch was left at the barrel, he's still sitting there with a driver's coat over his shoulders, and he lifts two fingers off his knee as Jin passes. If he was hit again, there's only the barrel and the cap in the slush. At the Grill (optional), Fran pours a coffee without being asked: "I didn't see you tonight, and you didn't eat."

The Route 22 crosses the river at 11:50. **Camera**: the reused bus-window shot, but this time the city slides past and stops on the Northside: the dead foundry stack, and under it a cluster of warm, lit windows in rows. Thought: *Foundry Courts.* (beat) *Let's see what a front looks like.*

Completion screen: the open safe under the desk lamp, envelope rack visible (empty slot or not, by flag). Summary lines: "You watched the gate." / "You took the house money." / "You left the envelope." / "You hit Dutch after he gave you the keys." State handed on: air dash and dash straight (all movement verbs now present), money ≈ $300–$1,240 by choices, the four Ch4 evidence items. Map: Northside — Foundry Courts unlocks ("40 Foundry St. · Route 22"); Harlan Street becomes "Gate chained · CLOSED FOR INVENTORY" (visible from the bus only). Time card: "Five days later. Wednesday."

---

# Chapter 5 — The Houses Still Standing

## Date, mood, palette, weather

Wednesday, January 22 to Saturday, January 25, 1997, four days at Foundry Courts with a day cycle (Morning / Day / Evening / Night). Mood: relief that the player doesn't trust at first; ordinary warmth; people who disagree loudly and look after each other anyway; a splinter Jin carries the whole time. Palette: Foundry Courts is the same worn brown brick as Eastgate, but cared for: every front door painted a different color the residents chose (teal, mustard, barn red, bottle green), white-painted window trim, clotheslines of frozen sheets across the courtyard, a swept path. Behind everything, the dead foundry stack, enormous, gray-brown, "LOCAL 1197" in faded white at its base. Mornings are pale gold, dusk is a deep blue at 4:50, and at night every window is amber. Weather: Wednesday clear and cold; Thursday bright; Friday light snow from mid-afternoon; Saturday clear, with an orange sunset behind the stack.

## Gameplay identity

The MapleStory chapter: a small town with routines, where the player spends days instead of minutes. There is no combat at all. The player works short paid jobs (carrying, repairs), trains with a local boxer, runs errands for residents, eats with them, sits in on their argument about money, and watches the same courtyard change by the hour (kids after school, Odette's 7 a.m. sweeping, Hector leaving for the night bus). Activities spend time slots; a few scenes are pinned to a day and slot so the player always meets them. Share: exploration 20% · dialogue 35% · activities 35% · investigation 10% · combat 0%. Target 25 min (the longest chapter, built from short tasks so it never drags).

The day-and-slot label sits small in the corner ("Thursday · Day"). Sleeping on the loft cot moves to the next morning. Every activity says what slot it uses before the player commits ("This takes the afternoon.").

## Locations

### `foundry_street` — Foundry Street (1800 x 360, exterior)
Left to right:
- **0–250 Route 22 stop and Northside Car Wash.** Hand-painted sign "HAND WASH $5 · WINTER UNDERBODY $3"; spray mist freezing on the fence; Deshawn in a yellow slicker on weekdays.
- **250–600 Dombrowski's Market.** Produce crates under a green awning, "LOTTO · WIC ACCEPTED · KIELBASA FRIDAY", Mr. Dombrowski on a stool by the register visible through the glass. (Shop: groceries for Odette's quest, kids' boxing gloves $12, a smoke detector $9 from Ch6.)
- **600–1100 Council HQ.** The old union hall: two-story brick with a carved limestone lintel "UNITED FOUNDRY WORKERS LOCAL 1197 · 1937", and over the door a newer painted sign "NORTHSIDE COMMUNITY COUNCIL". Glass door: "OFFICE HOURS TUE / THU 10–4". A glass bulletin case: tenant clinic flyer, the toy-drive thank-you, a notice "STATE HOUSING HEARINGS · HARRISBURG · FEB 24 – MAR 5 · W. ROOK TESTIFYING" (sets up Ch6's gap). On Thursday, Rook's maroon Buick at the curb. The door is locked whenever Jin passes in Ch5 ("Office hours Tue/Thu 10–4. It's after four." / on Thursday daytime: "Nobody inside. Rook's car is at the Courts.").
- **1100–1400 mural.** "FOUNDRY STRONG · 1911–1992": a giant painted ladle pouring orange iron, men in hard hats, the stack. Paint flaking at the bottom.
- **1400–1800 Foundry Courts gate.** Iron arch with cast letters "FOUNDRY COURTS 1911", repainted black; a cloth banner tied to it, faded: "SAVED BY ITS PEOPLE · 1994".

### `foundry_courts` — The courtyard (2600 x 540, exterior, two layers)
Ground, left to right:
- **0–250 the gate** from Foundry Street, a bench, a lamp post with a hand-lettered "SLOW — KIDS".
- **250–800 Building A** (three stories, 1911 brick, a swept stoop). Doors with nameplates: A-1C **BAPTISTE** (violets in the window; Odette's chair visible), A-3B **KACZMAREK** (paper snowflakes, small handprints on the glass), A-3C **KOWALSKI** (Mara's; a bike on the landing). The half-basement **laundry room** door with a clipboard schedule on it.
- **800–1500 the courtyard.** A dry fountain basin used as a sandbox in summer and a snow fort in winter; Tamika's **chalk hopscotch** on the cleared path (it changes every day: Wednesday 1–8, Thursday 1–10 with a "HOME" square, Friday drawn around a snowman, Saturday with a "BOXING" square that Benny added); a basketball hoop with a chain net; clotheslines of frozen sheets strung from A to B; benches.
- **1500–2000 Building B.** Doors: B-1A **DELGADO** (a wreath still up), B-1B **MEHTA** (an elderly woman's slippers on the mat), B-2B **RUIZ** (a Calder Transit cap hanging on the inside knob, visible through the side glass), B-3A **GREER** (a child's drawing taped to the door: "MOM AT WORK. ME AT HOME. TV."). Stairwell door → `courts_b_stairwell`.
- **2000–2350 the workshop.** The old foundry pattern shop: tall arched windows, a sliding door, a painted sign "MAINTENANCE · KNOCK LOUD · MARA". Door → `courts_workshop`.
- **2350–2600 the community building.** The old foundry office, two stories, a bell-less bell cote on the roof. Door → `courts_community`.
Upper layer: Building B's fire escape (ladder down at 1560) to its gutter ledge and roof; the workshop roof by an inside ladder (Mara's sunset spot: two upturned buckets and a thermos); across the back wall, the rail spur and the stack.
Lighting: day: low sun from the left, long shadows; evening: lamp post and window glow; night: amber windows, the community room lit on Wednesday and Saturday. Ambient: kids (3:30–5:00), a radio from the workshop, a dog somewhere, sheets creaking on the lines, the 22 bus on Foundry Street, Odette's broom at 7 a.m.

### `courts_workshop` — Workshop and loft (900 x 540, two levels)
Ground: Mara's long workbench; a pegboard with every tool painted in outline (one outline empty: "WHO HAS THE 3/4 WRENCH" in chalk); wooden foundry patterns on high shelves (a gear, a pipe elbow, and a full-size wooden pattern of a church bell, dusty); a woodstove; a coffee can of bolts and a second coffee can, Mara's cash float; the crew's time sheet on a clipboard; a radio on WCLD; the **workshop phone** on the wall with the number painted beside it (555-0172; used in Ch6 and Ch8); the **key board** (hooks with tags: BOILER A, BOILER B, LAUNDRY, ROOF, LADDER, ARCHIVE (COUNCIL)); a ladder to the loft. Loft: a cot with a wool army blanket, a crate for a table, a hot plate, one window looking straight at the stack, a nail for the track top, and a bare plaster wall (it becomes Jin's evidence wall at the end of the chapter and the timeline board in Ch6–7).

### `courts_community` — Community building (1200 x 360 ground + 1200 x 360 basement)
Ground: the **community room**: folding tables, a big coffee urn, a piano with a lace runner, kids' drawings, a donated TV on a cart, the **deed plaque** on the wall by the door, a shelf with the **minutes binder**, the donation jar "COURTS FUND · EVERY DOLLAR COUNTS", and at the back a small kitchen with an old six-burner stove and a bucket under a ceiling drip (the kitchen-roof quest). Basement (stairs at the right): the **gym** (one heavy bag, one working speed bag, mirrors, mats, a ring marked out in red tape on the concrete, a milk crate of donated gloves in mismatched sizes, a chalkboard "SAT 9 AM KIDS CLASS · D. TILLERY" with a roster of first names); **Building B's boiler room**, no, the **community building's boiler room** (a 1961 American Standard boiler that also feeds Building B, the one Hector wants replaced); and a steel door stenciled "N.C.C. — RECORDS — NO ADMITTANCE", padlocked (the Council archive; Ch6).

### `courts_laundry` — Laundry room (640 x 360)
Half-basement under Building A: four washers, two dryers, a folding table, a radio, Odette's schedule clipboard ("MON A1–A6 · TUE A7–B2 · WED B3–B8 · THU KACZMAREK (ALL DAY, GOD BLESS) · FRI B9–C4"), washer #2 with a sign "OUT OF ORDER · MARA KNOWS", and a corkboard (where, in Ch7, the truth can be posted).

### `odette_1c` — Odette's apartment, A-1C (640 x 360)
A plastic-covered gold sofa; a photograph of Leon Baptiste in a foundry hard hat; African violets on the sill; a radio with a gospel station; a pot on the stove; Deshawn's trophies on a shelf (Golden Gloves novice 1992, "MOST IMPROVED" 1990); a Council calendar; and by the window **an armchair nobody sits in** ("That's Mr. Rook's chair. Sit if you want. He won't mind.").

### `courts_b_stairwell` — Building B stairwell (320 x 720)
Three landings; on the second, the **hall light is out** (a dark band in the stairwell). It is the same kind of fixture as the one on the second floor of 412 Kessler.

### `calder_general_outpatient` — Calder General, outpatient neurology (900 x 360) (only if `accepted_rook_doctor`)
Waiting room with a fish tank and a TV; the exam room with a light box; a reflex board on the wall (a grid of lights; the clinic's version of the reaction drill). Lighting: hospital white, a little warmer than St. Agnes.

## NPCs present (with routines)

| id | Routine (Morning / Day / Evening / Night) | Idle pose | Key lines / barks | Reactions |
|---|---|---|---|---|
| `mara` | Workshop / job sites (boiler, laundry, roofs) / workshop; workshop roof at sunset Thu–Sat / her window in A-3C | `crouch` at a valve, `carry` | "You've got shoulders. Grab the other end." / "You want to earn your keep or your sympathy? I only pay for one." / "Fifteen a job, cash, Fridays." | If money > $400: "You don't look like you need fifteen dollars. So what do you need?" Meter +1 per shift (max +3). |
| `odette` | Stoop at 7:00 sweeping / laundry room with the schedule / 1C, Wednesday soup in the community room / window light | `sweep`; `sit` by the window | "Slow. Nobody's chasing you. Not today." / "Wednesday is soup. Every Wednesday. People who skip soup end up in trouble, I've seen it." | Calls Jin "the boxer" until he carries her groceries, then "Jin" with a soft J. |
| `deshawn` | (asleep) / car wash on Foundry Street / basement gym 6–9 p.m. / — ; Saturday morning: kids' class | `shadowbox`, `skipRope` | "Ex-champ! You following me?" / "Courts is through the arch. Ask for Mara if you want to be useful. Ask for my grandma if you want to be fed." | Warmer if Ch3 bout 1 touch of gloves, or if Jin held his bucket ("You held my bucket. You're halfway to a corner already."). |
| `hector` | Asleep (blinds down in B-2B) / treasurer's table in the community room with a ledger and an adding machine / soup, then leaves at 9:30 for the night 14 with his thermos / driving | `write` at the adding machine | "Every dollar. Every single dollar." / "Bus driver. Night 14, nine years. Kessler to downtown." | Wednesday, if Jin says he grew up on Kessler: "Then I drove your mother home from somewhere. Everybody's mother rides the 14." (Pays off in Ch6.) |
| `pauline` | Home at 7:45 from the night shift, puffer over pale-blue scrubs / asleep / up at 3 p.m. for Tamika; leaves 10:30 p.m. / Calder General | `walk` tired, `armsCrossed` | "You're Mara's new guy. Don't let them keep you waiting at General. Tell them Pauline said." / "I work nights so she can eat days. That's the whole math." | Friday (washer fixed): "You fixed number two? Her uniform's in that machine. You just saved me a fight with an eight-year-old." |
| `tamika` (8) / `benny` (7) | School bus / school / courtyard 3:30–5:00, then community room homework and TV / — | hopscotch, snowballs, imitation boxing | Benny: "Are you a real boxer?" / Tamika: "Benny thinks you're famous. I think you're tall." | Ball-on-the-roof quest; Benny's glove. |
| `ray_esposito` (61) / `ade_nunes` (22) | Workshop crew, day jobs | `carry`, `work` | Ray: "I've carried radiators up these stairs since Nixon. They don't get lighter. I get older." / Ade: "Baby's got an ear infection. Third one. She's fine. She's loud." | Payday scene. |
| `joanna_kaczmarek` + six kids (only Paulie, 12, speaks) | A-3B, all day | `work` at the stove; kids in a cluster | Joanna: "Six kids and a radiator that whistles like a teakettle. You're bringing a new one? I'll cry. Ignore me." / Paulie: "Is that heavy? Can I try? I can't. Okay." | Radiator job. Rook names this family in Ch7. |
| `mrs_mehta` (B-1B) | Window | `sit` | "My daughter is a doctor at General. Neurology. Very busy. Very good." | Only if `accepted_rook_doctor` does the player learn Dr. Mehta is her daughter. |
| `mr_dombrowski` | Market, all day | `sit` stool | "Groceries for Odette? She's got a tab. She pays it every first of the month, to the penny, and she yells at me for the price of eggs." | Shop. |
| `rook` | Thursday Day only, in the courtyard | `handShoulder`, `sit` on Odette's stoop | See Scene 5.4. | First meeting. |
| `dr_mehta` (Anjali Mehta, 44) | Calder General, Friday Morning | `write`, light box | See Scene 5.6. | — |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `deed_plaque` | Brass plaque | "FOUNDRY COURTS MUTUAL HOUSING · Purchased by its residents with the Northside Community Council · October 3, 1994." (Jin's thought, the first time:) *Six weeks after my fight.* | `ev_deed_plaque` |
| `minutes_binder` | Binder: "ASSEMBLY MINUTES 1993–" | Viewer. Sept 14, 1994: "W. Rook reports purchase funds secured through private partners. Questions on source deferred to next meeting. Motion to thank W. Rook carried by acclamation. (Mrs. Baptiste wept.)" Oct 12, 1994: deed, roof schedule, a potluck; no mention of the source. Nov 1994: no mention. | `ev_assembly_minutes` |
| `banner_gate` | Banner | "SAVED BY ITS PEOPLE · 1994. Somebody embroidered it. The stitching's better than the spelling." | — |
| `stack` | The stack | "LOCAL 1197, painted at the base. The letters are taller than me. Nothing's come out of the top since 1992." | — |
| `nameplates` | Door nameplates (each door) | BAPTISTE, KACZMAREK, KOWALSKI, DELGADO, MEHTA, RUIZ, GREER: one line each ("DELGADO. A Christmas wreath, still up in January. Nobody's in a hurry here."). | People notes (names Rook will say in Ch7) |
| `hopscotch` | Chalk | Changes daily. Saturday: "Benny added a square that says BOXING. You have to hop in it twice." | — |
| `greer_drawing` | Drawing on 3A | "MOM AT WORK. ME AT HOME. TV. A stick woman in blue scrubs and a stick girl next to a box." | — |
| `pattern_bell` | Wooden bell | "A foundry pattern for a church bell. They carved the bell in wood first, then poured the iron into the shape it left. Mara uses it as a hat rack." | — |
| `key_board` | Key board | "BOILER A. BOILER B. LAUNDRY. ROOF. LADDER. ARCHIVE (COUNCIL)." Mara, if near: "Valve's in there. That's the only reason I've got that one." | — |
| `archive_door` | Steel door | "N.C.C. — RECORDS — NO ADMITTANCE. Padlocked." (Ch5 always locked: "Council files. Not mine to open. Not yet.") | — |
| `speed_bag_courts` | Speed bag | "It works. I can't keep the rhythm yet. It keeps getting away from me." (Ch6 unlocks the flurry here.) | — |
| `kids_roster` | Chalkboard | "SAT 9 AM KIDS CLASS. TAMIKA. BENNY. PAULIE K. JOJO. MARISOL. (DESHAWN: BRING TAPE)." | — |
| `leon_photo` | Photograph | "Leon Baptiste, in a foundry hard hat, holding a ladle like a trophy." | — |
| `rooks_chair` | Armchair | Sitting: Odette tells the story (see Scene 5.3). | — |
| `loft_window` | Window | "The stack. Every window in this place looks at it." | — |
| `donation_jar` | COURTS FUND jar | (Saturday, after the vote) donation choice. | `courts_donation` |
| `workshop_phone` | Phone | "555-0172. Painted on the wall in red so nobody can say they didn't know the number." | — |

## Quests

- **Main — "The Houses Still Standing."** HUD steps: "Foundry Courts. See what the money pays for." → "Find whoever runs this place." → "Help with the valve." → "Wednesday is soup." → "Work a job." → (Rook) → "Deshawn's in the basement gym after six." → "Friday is payday." → "Saturday, 7 p.m.: the assembly." → "Sleep." Completion: the loft wall (Scene 5.9). Reward: uppercut; gym drills join the training menu; `ev_deed_plaque`, `ev_rook_slip`; money from shifts.
- **Work shifts** (each $15, each one slot, Mara meter +1 each up to +3): "Boiler Valve" (Wed, with Mara, Building B boiler room, required); "Radiator, A-3B" (Thu Day, carry with Ray up three flights to the Kaczmareks); "Washer Number Two" (Fri Day, repair sequence in the laundry room); "Bulb on Two, Again" (any Evening, Building B stairwell); "Kitchen Roof" (Sat Day, with Mara, ends at sunset).
- **Optional — "Odette's Groceries."** Thu Morning (or Fri Morning). Objective: "Carry Odette's groceries from Dombrowski's." Two bags; "Hands full." blocks punching and running on ice patches makes Jin slip once (Odette: "Slow. Nobody's chasing you. Not today."). Completion in 1C, with the chair story. Reward +1 odette, +1 courts.
- **Optional — "Ball on the Roof."** Any Day/Evening 3:30–5:00. Giver: Benny (`!`). Objective: "Get the ball off Building B's gutter." Fire-escape climb, an air dash to the gutter ledge (the Ch4 skill used for something ordinary). Reward: +1 courts; Benny asks Jin to sign his plastic toy glove, opening the sink "Real Gloves for Benny" ($12 at Dombrowski's; `bought_kid_gloves`).
- **Optional — "Wednesday Soup."** Stay through dinner in the community room. Reward +1 courts; meet everyone at once; `stayed_for_soup`.
- **Optional — "Saturday Class."** Sat Morning. Hold pads for five kids while Deshawn calls combinations (a reverse reaction drill: Jin positions the pads for each kid's punch). Reward +1 deshawn; Tamika: "You hold pads like my mom holds my hand crossing the street."
- **Optional — "The Minutes."** Any evening, the community room shelf. Reward `ev_assembly_minutes`.
- **Optional — "See Rook's Doctor."** Only if `accepted_rook_doctor`. Fri Morning. Reward `ev_mehta_assessment`.
- **Optional — "Somebody's Friday."** Only if `took_wage_envelope`. Appears silently after the payday scene as a journal entry with no marker, objective: "The envelope's still in your jacket." Resolved by the night choice.
- **Training.** The Courts gym adds bag and mitts to the training menu (cap 2 in Ch5); balance, footwork, reaction and conditioning (the Foundry Street loop) are also available here (cap 2).

## Scripted scenes

### Scene 5.1 — The arch (Wednesday Day)
1. Card: "Five days later · Wednesday, January 22, 1997 · Northside". The 22 bus pulls away. **Camera**: wide on Foundry Street; then a slow tilt up the length of the stack (the only vertical pan in the chapter), down again to Jin.
2. Car wash: **Deshawn** (slicker, sprayer): "Ex-champ! You following me?" **Jin:** "Maybe." **Deshawn:** "Courts is through the arch. Ask for Mara if you want to be useful. Ask for my grandma if you want to be fed."
3. Thought at the arch, reading the banner: *Saved by its people.*
4. The courtyard is quiet at noon: sheets on the lines, Odette's broom against the stoop, a radio from the workshop. The player can explore freely. The workshop's sliding door is open; the sound of a wrench slipping and a woman swearing comes from Building B's basement steps.

### Scene 5.2 — The valve (Wednesday Day)
1. Building B's boiler room. Mara on her knees at a stuck valve with a three-foot pipe wrench. **Mara** (not looking up): "If you're from the gas company, you're late. If you're not, you've got shoulders. Grab the other end."
2. **Activity**: a two-person repair (Jin holds the cheater bar, the player times pushes to Mara's "Now."; three good pushes turn it). The pipes knock all through the building and then go quiet; radiators upstairs start ticking.
3. **Mara** (wiping her hands before offering one): "Mara Kowalski. Maintenance. You want work? Fifteen a job, cash, I pay Fridays. There's a cot above the workshop. Heat's free if the boiler is." **Jin:** "You don't know me." **Mara:** "You turned a valve I've been fighting since Monday. That's most of what I need to know." (Money variant: "You don't look like you need fifteen dollars. So what do you need?" **Jin:** "A place to sleep where nobody's looking for me." **Mara:** "Nobody looks for anybody up here. That's the nice part.")
4. She shows him the loft. Jin sets down his bag. **Camera** eases out to the window and the stack. (+$15, +1 mara.)

### Scene 5.3 — Wednesday soup (Wednesday Evening)
1. The community room, lit, steamed windows. Odette at the stove with a big pot; she makes soup joumou on every Wednesday in January ("One day a year isn't enough freedom, so I make it all month."). Residents come in with their own bowls.
2. The player is free to circulate. Each resident has one introduction line and one question Jin can ask. Highlights:
   - **Hector** (ladling soup into his thermos before the night shift): "Bus driver. Night 14, nine years. Kessler to downtown." If Jin says he grew up on Kessler: "Then I drove your mother home from somewhere. Everybody's mother rides the 14."
   - **Pauline** (with Tamika, in scrubs, eating standing up): "I work nights so she can eat days. That's the whole math."
   - **Joanna Kaczmarek** (six kids in a row on one bench): "Don't count them, it makes them nervous."
   - **Mara** (late, wiping her hands): "Odette, he turned the B valve." **Odette:** "Then he gets a big bowl."
3. The **deed plaque** by the door. When Jin examines it, Odette is beside him, drying a ladle. **Odette:** "That's the day we didn't have to leave. October third. I cried on that plaque. Leon had been gone a year. Mr. Rook sat with me the night he passed. Right there, in my chair, all night. He didn't say anything. He just sat." Jin's thought: *October third. Six weeks after.*
4. Staying to the end (`stayed_for_soup`, +1 courts): the room empties; Jin helps stack chairs (an optional carry); Odette sends him to the loft with a jar of soup.

### Scene 5.4 — Rook (Thursday Day, noon, pinned)
1. Jin is carrying the radiator across the courtyard with Ray Esposito (a two-person carry; Ray sets the pace: "Left foot. Left foot. Your other left."). The maroon Buick pulls up at the gate.
2. **Camera**: the courtyard from high and wide; residents drift toward the gate without being called. Rook gets out with a cardboard box of donated winter coats. He sits on Odette's stoop instead of standing over her; asks Hector (in his bathrobe, woken by the noise) about the B boiler by name; hands Tamika a library-card form ("Fill it out yourself. Your mother's got enough forms."); laughs at something Mara says. He's good at this, and it's real.
3. He sees Jin. He stops mid-sentence. He takes off his reading glasses and folds them, slowly (the first time the player sees the tell that means *cornered*). Two seconds. He puts them back on and walks over.
4. **Rook:** "Jin Seo." (beat) "You look like a man who could use a doctor. A real one. I know people at General."
5. **Jin:** "Have we met?"
6. **Rook:** "Everybody in Calder met you in August of '94. Channel 6 ran your face all week." (beat, quieter) "You look like you've been in one. A hospital. A long one."
7. **Jin:** "How would you know where I've been?"
8. **Rook:** "I run a council, son. People tell me things. Most of them are about boilers." He turns, louder: "Mara, this man's carrying radiators for fifteen dollars? Pay him twenty. The Council will cover it." **Mara:** "The Council will cover it how?" **Rook:** "Generously and late, like always." People laugh. (`ev_rook_slip`: he knew the name before anyone said it, and the hospital no one mentioned.)
9. **Choice** (`accepted_rook_doctor`):
   - "I'll see your doctor." → Rook writes on the back of a Council business card: "Dr. Anjali Mehta, Calder General, Neurology, Friday 8 a.m." "Her mother's in B-1B. She'll see you. Tell her Walter sent you, she'll pretend to be annoyed." (+1 rook.)
   - "I'm fine." → **Rook:** "Nobody who says 'I'm fine' is. The offer stands. Ask Mara for my number, she has it on a wall somewhere."
10. **Optional line** (only if the player has `ev_dutch_statement`): "Dutch Brannigan says hello." (`mentioned_dutch_to_rook`) → The glasses come off again. **Rook:** "Dutch Brannigan moves freight for half this city. The Council's done business with every honest company on the Northside and one or two of the other kind. You don't get a boiler from the Rotary Club." He puts the glasses on. "Whatever you need here, Jin. I mean that. These are good people. Let them be good to you."
11. He leaves with the empty box. Jin's thought: *He knew my name before anybody said it. He knew about the hospital. He didn't ask how I got out.*

### Scene 5.5 — Mitts (Thursday Evening, pinned)
1. Basement gym. Deshawn tapes Jin's hands without being asked. **Deshawn:** "Everybody down at Mo's throws straight 'cause the ceiling's low. Up here we got a high ceiling." He holds a mitt low and flat, facing down. "You don't come up from underneath. Bend the knees. Hips first. The hand's the last thing to know."
2. **Uppercut unlock** (activity `train_mitts`, tutorial tier): Deshawn calls "Up!"; the player throws the uppercut into the low mitt; then "One-two-up!" Then Deshawn tosses a medicine ball off the wall at chest height: the uppercut pops it up and a jab can hit it again in the air (the launch-and-follow-up lesson without an enemy). **Deshawn:** "There it is. That's a punch that makes a man reconsider his evening."
3. Sitting on the ring tape afterwards. **Deshawn:** "I got a fight February 21st. Mo's Friday card, co-main, Hammer Bell again, the rematch. I need a corner. My grandma can't watch, and my last cutman was Lenny." (If `threatened_lenny`: "Lenny skipped town, so now I got nobody.") "You know what a corner's supposed to be. Better than anybody."
4. **Choice** (`promised_deshawn_corner`): "I'll be there." / "I can't promise." (**Deshawn:** "Okay. I'll ask Slim. Slim's slow with the stool but he don't lie.")

### Scene 5.6 — Dr. Mehta (Friday Morning, only if accepted)
1. Calder General outpatient. In the lobby Pauline is leaving her night shift: "You're Mara's new guy. Don't let them keep you waiting. Tell them Pauline said."
2. Exam room. **Activity**: the clinic reflex board (lights on a grid; press when each lights; the result screen gives a number that is absurdly good). Then a balance line on the floor and a grip dynamometer (both mediocre). Then the light box: CT films from 1994 labeled "AHN, D."
3. **Dr. Mehta:** "These films say Daniel Ahn." **Jin:** "They're wrong about the name. Not about the bleed." She looks at him for a moment and writes "Seo, J. (per pt)" in the margin of her own notes.
4. **Dr. Mehta:** "Your reflex latency is the fastest I've recorded in this room. Your balance is a sixty-year-old's. You had a subdural bleed, and I can see it in how you track. I'm not clearing you for contact sport. Not this year. Maybe not ever." (beat) "There's a program in Boston. Hollis Neurorehabilitation. Eighteen months, inpatient, the best in the country for what you have. Ninety-six thousand dollars. Not covered." (beat) "I'm telling you the number so you know it exists. Not so you can reach it."
5. `ev_mehta_assessment`. The journal's Money page gains a permanent line: "What it would take: Hollis Neurorehabilitation, 18 months: $96,000." (If the player declined, this line arrives in Ch6 from Hana instead.)

### Scene 5.7 — Payday (Friday, 4 p.m., pinned)
The workshop, snow starting outside the arched windows, the woodstove going. Mara, Ray and Ade (Odom and Brandt are on a job across town; their envelopes would go to them).
- **If the envelope was left at the depot:** Mara hands out the brown envelopes Hector picked up Monday ("Esposito. Nunes. Odom and Brandt, I'll drop. Don't spend it on anything I'd spend it on.") Then she pays Jin from her own coffee can: "You're not on the Council's sheet. You're on mine." Ade, counting: "Ear-drops money." Ordinary, warm, and over in thirty seconds.
- **If `took_wage_envelope`:** **Mara:** "No envelope this week. Hector went to the fund window Monday. They said there was a robbery Friday night. Council says two weeks. Maybe three." **Ray:** "Two weeks. My landlord's not a council." **Ade** (quiet): "Baby's got an ear infection, Mara." Mara opens the coffee can, counts out $128 in fives and ones, and puts it in Ade's hand. "Don't argue. Pay me back in March." She looks at what's left, then at Jin. "I owe you for the week." **Choice**: take it / "Give it to Ray." (+1 mara; Ray: "...Thanks, kid.") **Camera** holds on the coffee can, nearly empty, on the bench. Jin's thought: *Six hundred and forty dollars. In my jacket. Their names on it.* The player is not told what to do.

### Scene 5.8 — The envelope at night (Friday Night, only if `took_wage_envelope`)
The loft. Snow on the window. The envelope can be examined (the five names). Three options, chosen by action, not by a menu: walking down to the workshop's time-sheet lockbox (a slot in a steel box screwed to the bench) and using it; walking across the courtyard to A-3C and knocking on Mara's door; or simply going to sleep.
- **Lockbox** (`returned_wage_envelope = lockbox`): Jin drops it through the slot. An optional prompt to write a note on the envelope: "SORRY" or nothing. Saturday morning, Mara: "Somebody returned the payroll. In my lockbox." (holds it up; if the note: "With 'sorry' on it.") "Whoever it was, they're welcome here." Ade pays her back on the spot. (+2 mara.)
- **Knock on 3C** (`told_mara`): Mara in a sweatshirt, hair down, holding a mug. **Jin:** "I took this from the depot on Harlan Street. Last Friday." Long silence. **Mara:** "You robbed a freight company." **Jin:** "Yes." **Mara:** "And you brought back the part with our names on it." **Jin:** "Yes." **Mara:** "...Okay. I'm going to need you to explain the first part someday." (beat) "Why was our payroll at a freight company, Jin?" **Jin:** "Ask the Council." **Mara:** "I'll ask Hector." She closes the door. Saturday she says nothing about it in front of anyone, and pays the crew. (+3 mara. This plants Mara's question three chapters early, so her Ch7 reaction is a person finishing a thought, not starting one.)
- **Sleep** (`returned_wage_envelope = none`): no immediate reaction. Ch7: −1 mara and −2 courts when Hector's treasurer's report lists "Week of 1/20: maint. payroll lost (robbery), $640, covered from M. Kowalski personal funds and the Courts Fund."
- If Jin has spent part of it, he can only return what he still has; the envelope's label is the same and the shortfall is shown ("$590. Fifty short.").

### Scene 5.9 — Saturday: class, roof, assembly, wall
1. **Saturday Class** (optional, morning). Kids in the basement in sneakers, Deshawn with a whistle he never uses.
2. **Kitchen Roof** (afternoon, with Mara): carry rolls of tar paper up the ladder, scrape, lay, nail flashing (a repair sequence with Mara calling steps). It finishes as the sun drops behind the stack. Mara sits on an upturned bucket and pours coffee from a thermos into its own lid for Jin.
   - **Mara:** "My dad poured iron in that building for thirty years." (She points the thermos at the stack.) "When they closed it, the company tried to sell these houses to a parking-lot man from Pittsburgh. Ninety days' notice. Two hundred and twelve households."
   - **Jin:** "And the Council bought them."
   - **Mara:** "Rook found the money. The bank said no, the state said 'maybe '96', and then in September Rook walked in with a deposit. I don't know where from. I didn't ask." (beat) "You learn not to look a gift roof too hard."
   - **Jin:** "What if you had to?"
   - **Mara:** "Then I'd look." (beat) "And then I'd still have to fix the boiler."
   - If the player has `mem_roof_1993`, an extra option: "My sister wanted me to buy a building with a roof that doesn't leak." **Mara:** "Well. This one doesn't. Now." (+1 mara.)
3. **The assembly** (7 p.m., pinned). The community room, twenty-odd residents on folding chairs, coats on laps, the coffee urn. Hector at an easel: "COURTS FUND: $4,212.40". Mara's maintenance report lists the jobs Jin did by name if he did them ("Washer two, fixed. B-two hall light, fixed. Kitchen roof, as of four-fifty this afternoon, fixed. Our new guy." A little applause.) Then the argument over $3,000 of surplus:
   - **Hector:** "Building B's boiler is a 1961 American Standard held together with Mara's prayers and a coat hanger. If it goes in February it goes for six weeks, and forty people sleep in their coats."
   - **Pauline:** "Tamika is alone from three to eleven four nights a week. You know who's watching her? Channel 6. I'm asking for two hundred a month for a sitter, in this room, for every kid in the Courts. Boilers don't do homework."
   - **Odette:** "Soup is a program too, Pauline. It's the oldest program there is. And the stove in that kitchen is older than me with the same attitude."
   - **A voice from the back (Ray):** "Why don't we ask Rook?" **Hector:** "Because we don't ask Mr. Rook for everything. That's the point of having a fund."
   - Hands go up. The boiler wins, as it does every January ("It's always the boiler in January," says Joanna). Hector adds, writing: "And a hundred a month for Pauline's sitter from April, if the boiler comes in under." Pauline: "It won't." Hector: "It won't."
   - Jin can't vote. Jin's thought, watching hands go up: *Building A's boiler came out of a cash office on Harlan Street. They're voting on the other one out of a coffee can.*
   - After the vote, the jar by the door (`courts_donation`): $10 / $25 / $50 with a paper tag for boiler / after-school / kitchen, or nothing. (+1 courts for any amount.) Reactions: Hector: "Every dollar." / Pauline squeezes his arm on her way out to the night shift / Odette: "Now the stove owes you."
4. **The wall** (Saturday Night). The loft. Jin takes Mara's carpenter's pencil from the bench and writes on the bare plaster: "AUG 20 '94". A hand-span to the right: "OCT 3 '94". He draws a line between them, then stops and adds a question mark over the line. **Camera** pulls back from the wall through the loft window to the whole courtyard at night: Odette's light, the Kaczmareks' paper snowflakes, Hector crossing to the gate with his thermos for the night 14, and on Foundry Street a maroon Buick passing slowly without stopping. Thought: *Good people. A good roof. Six weeks after.*

## Encounters

None. No enemy exists in any Chapter 5 location. Sparring with Deshawn (mitts) and the Saturday class are activities with no damage or loss state. The punch button works everywhere (Jin can hit the gym bag and the mitts), and outside the gym a punch near a person or object plays a small shadowbox instead, without any message.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Stay for soup | `stayed_for_soup` | +1 courts | Ch7: Odette says "You ate at my table" in her scene. |
| Accept Rook's doctor | `accepted_rook_doctor` | Dr. Mehta; +1 rook | Ch7 Rook: "Did Anjali look after you? Good. That was real. I need you to know one thing I did was real." Ch9: the offer's treatment package names the same program; the offer feels familiar. |
| Mention Dutch to Rook | `mentioned_dutch_to_rook` | Rook's deflection | Ch7 Rook: "You said his name in January. I knew then." |
| Promise Deshawn the corner | `promised_deshawn_corner` | Deshawn's line | Ch6 Friday choice exists. |
| Return the envelope | `returned_wage_envelope` (`none` / `lockbox` / `told_mara`) | Mara's reaction | Ch7 treasurer's report; Mara's Ch7 reaction; `told_mara` makes Mara ask Hector about window 2 in February, so in Ch7 she already half-knows. |
| Real gloves for Benny | `bought_kid_gloves` | −$12 | Benny wears them in Ch6–Ch7 and in the Ending Two class. |
| Donation | `courts_donation` | +1 courts | Ch7: the person whose cause he gave to defends him first; epilogue. |

## Chapter ending beat and hand-off

The loft wall and the long shot (Scene 5.9 step 4). Completion screen: the courtyard at night from the loft window, with the two dates and the question mark in pencil superimposed faintly in the corner. Summary lines from flags ("You stayed for soup." / "You returned the envelope and told Mara." / "You promised Deshawn his corner." / "You saw Rook's doctor."). State handed on: uppercut; training caps rise to 2 here; base = workshop loft; money ≈ shifts $15–$75 plus prior; People entries for every resident with their doors; `ev_deed_plaque`, `ev_assembly_minutes`, `ev_rook_slip`, maybe `ev_mehta_assessment`. Map: Foundry Street adds Council HQ (closed). Time card for the next chapter: "Four weeks later." (In those weeks Jin works for Mara, trains with Deshawn, and does not go to Garrison Street.)

---

# Chapter 6 — Undelivered

## Date, mood, palette, weather

Thursday, February 20 to Sunday, February 23, 1997. The thaw: eaves dripping, gutters running, brown snowbanks collapsing, morning fog off the river, the river high and fast. Mood: grief turning into an account; the anger narrows until it has one name in it. Palette: wet blue-gray, brick darkened by water, puddles holding amber window light; The Flats (Garrison Street) are lower and poorer than Eastgate, wood-frame rowhouses with aluminum siding and chain-link yards; Lindell House is a black-and-gray shell behind plywood. Interiors are lit by single sources: a church basement's fluorescent tube, an archive's pull-chain bulb, a desk lamp at City Hall, a candle on a fence. One break of thin sunlight on Saturday afternoon, at Mount Hope only.

## Gameplay identity

An investigation chapter built from places, objects and people, with a timeline board on the loft wall that the player fills in as they go. The player opens two boxes of belongings, reads a sister's letters in her own voice, takes a claim ticket to a photo counter, asks a clerk for files, listens to a witness or keeps a promise, walks a burned building's back alley, finds a grave someone else paid for, and then, last, opens a locked storeroom under the community building they've been living beside. Two short confrontations and one corner-work activity break the rhythm; none of them follows an emotional discovery. The flurry unlocks on the first morning, which completes the toolkit (PDF: by Chapter 6, the essential tools). Share: exploration 25% · dialogue 20% · investigation 35% · combat 10% · activities 10%. Target 25 min.

## Locations

### `courts_thaw` — Foundry Courts in the thaw (same geometry as `foundry_courts`)
Changes since Chapter 5: the snow fort in the fountain has slumped into a gray hill; the clotheslines are empty; meltwater runs down the courtyard's center drain (the Ch6 work shift: clear the storm drain, $15); the hopscotch now has the "BOXING" square permanently, redrawn in pink; kids call Jin by name; Benny wears his real gloves if `bought_kid_gloves`; Jin's track top hangs in the loft window like a curtain. The Council archive door in the basement is still padlocked. The loft wall still says "AUG 20 '94 — ? — OCT 3 '94".

### `st_casimir_basement` — St. Casimir's Church, basement (1000 x 360)
Stairs down from the nave at left. An inch of water on the floor; planks laid on cinderblocks as a walkway (gentle platforming; stepping off the planks splashes and makes Father Nowak say "Ah. Your shoes."); a dehumidifier droning; folding tables pushed up against the walls with their legs in coffee cans; boxes stacked high and dry: "CHRISTMAS CRÈCHE", "PALMS — DO NOT OPEN UNTIL MARCH 23", "CLOTHING DRIVE — MEN'S L"; and on the highest table, two cardboard boxes marked in black marker in a careful priest's hand: "SEO — 1" and "SEO — 2". A coffee urn. A crucifix over a sump pump. Lighting: one fluorescent tube and the gray daylight from two ground-level windows. Ambient: the dehumidifier, water dripping, the organist practicing upstairs (the same four bars, over and over, with one wrong note).

### `garrison_street` — Garrison Street, The Flats (2200 x 480, exterior, two layers)
Left to right: **St. Casimir's** (twin brick spires, steps, a board "LENTEN FISH FRY FRIDAYS"); **Garrison Grocery** ("CANDLES · FLOWERS · LOTTO", a bucket of carnations at $4); rowhouses with aluminum siding, one with a plastic Virgin in a bathtub shrine; **Lindell House** (1100–1500): a three-story wood rooming house, burned out, windows plywooded, a city notice stapled to the plywood ("CONDEMNED · CITY OF CALDER · DO NOT ENTER"), and along its chain-link fence a row of melted votive candles, plastic flowers, a laminated photo too sun-bleached to see; a **gap in the fence** at 1480 into the **rear alley**; more rowhouses; a streetlight.
Upper layer (rear alley, reached through the gap): the back of Lindell House, a rusted **rear fire escape** up to the second floor, and at the top a **steel door with a hasp and a padlock still on it**, rusted shut, the paint around it scorched.
Lighting: flat overcast; the streetlight comes on at 5:20. Ambient: water in the gutters, a dog behind a fence, the church bells at noon (Jin's thought, the first time: *Bells.*).

### `city_hall_annex` — City Hall Annex (1400 x 360) and `annex_ramp` — its parking ramp (1200 x 480, two levels)
Annex, left to right: the steps and glass doors; a lobby with a directory board; the **Records counter** (Yvette, a take-a-number dispenser, a sign "COPIES 25¢"); behind a half-door, **Housing Inspection files** (gray cabinets) and the **Fire Marshal records** window; a long wooden **bench** under a portrait of a 1950s mayor; a water fountain that only works if you hold it for a second first. Ramp: a concrete two-level parking structure beside the Annex, a down-ramp joining the levels, oil-stained, a pay booth with no attendant, puddles under drips. Lighting: Annex fluorescent and a desk lamp at Yvette's counter; the ramp sodium-lit even in daytime. Ambient: Annex typewriters and a radiator; ramp echoes, dripping, a car alarm that chirps once.

### `kessler_ave_1997` — Kessler Avenue in the thaw (same geometry as Ch2)
Changes: snow gone, slush; Sun's has a new menu board with prices up 50¢; the 3B window has Rosie's crayon drawing of a house with a sun taped to it; the poster wall has a fresh layer ("THE RUSTBELTS · REUNION · SOLD OUT"), and the corner Jin peeled in Ch2 has been left peeled; Darnell's sign in the laundromat window "WASH & FOLD · ASK FOR DARNELL". Kessler Drug's One-Hour Photo counter has Dale.

### `mount_hope` — Mount Hope Cemetery (2000 x 360)
Left to right: iron gate with a flower stand (an old man selling carnations, $4); the **office**, a small stone lodge with a ledger on a stand and a space heater; paths between bare trees; **Section F**; **row 9**: a gray granite stone, new compared to its neighbors, "SEO MI-OK 1942–1996 · SEO MIN-JI 1972–1996 · BELOVED MOTHER AND DAUGHTER"; a bench; beyond the low wall, the river and, across it, the Ashgrove Tower. Lighting: the one afternoon of thin sun, low and gold through bare branches; long shadows of headstones. Ambient: crows, wind, the river.

### `greyhound_depot` — Calder Greyhound Station, Front Street (1400 x 360)
Ticket counter, rows of molded plastic seats bolted together, coin lockers, a coffee machine with a handwritten "EXACT CHANGE", a TV on the wall, a departure board ("7:40 SCRANTON · WILKES-BARRE · BAY 3"), glass doors to the **bus bay** (where the Ortiz-path confrontation happens). Ambient: announcements, idling buses, a vending machine's hum.

### `courts_archive` — Council archive storeroom (640 x 360)
Under the community building, behind the steel door. Steel shelving; banker's boxes labeled in Pike's square capitals: "NCC CORRESP. 1994", "NCC CORRESP. 1995", "TENANT EMERG. FUND", "RELIEF FUND — CONFIDENTIAL", and one box with only one word on its end: "HOLD". The building's water shutoff (a red-painted wheel) is on the back wall, which is why Mara has a key. A mop sink. A pull-chain bulb. Lighting: the bulb only. When pulled it swings, and the shadows of the shelves swing with it for a few seconds. Ambient: the boiler ticking through the wall, water in the pipes.

Also used: `stagnes_lobby` / `stagnes_2west` (Ch1, February variant), `suns_noodle` (Ch2), `kessler_drug` (Ch2), `cellar_*` (Ch3; corner path), `courts_workshop` loft (the timeline board).

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions |
|---|---|---|---|---|
| `deshawn` | Courts gym (Thu Morning) / Cellar (Fri, corner path) | `skipRope`; speed bag | "Stop thinking. It's a rhythm." | Friday depends on `ch6_friday`. |
| `mara` | Workshop; drives the truck (Thu); workshop step (Sat Night) | `carry`, `sit` on the step | "I've got the truck. I'll drive." / (if asked for the key) "Lock up when you're done. I don't want to know what's in Council boxes. I like my roof." | If mara ≥ 4 she carries a box with him and stays in the loft for the first one. Otherwise she waits in the truck with the engine running and the radio on. |
| `father_nowak` (Tomasz Nowak, 64) | St. Casimir's basement; the church steps (Sat) | rubber boots under a cassock and cardigan, `work` | "I kept them dry for a year. God kept them dry; I moved them twice." / "Your sister came to Mass at Christmas and argued with my homily on the steps afterwards. I miss that very much." / "Abel Ortiz from room five comes to the seven o'clock Mass. He is leaving on Friday, the evening bus, to his sister. He wanted to see you, I think, and he is afraid to." | Ch9: holds a copy (`copies_given`). If Ortiz is missed, Nowak has his letter on Saturday. |
| `mrs_sun` | Sun's | `work`, then `sit` across from Jin | See Scene 6.2. | — |
| `pauline` | Courts, 7:45 a.m. (Fri), coming home in scrubs | `walk` tired, then `sit` on the B stoop | See Scene 6.3. | — |
| `pike` | City Hall Annex steps (Fri) | clasped hands, briefcase | "Mr. Seo. You've been reading." | First time he uses Jin's name. |
| `tooley` | Annex ramp (only if Ch2 `hurt_collector_after` is false) | `leanWall` | "Aw, no. No. Mr. Pike didn't say it was *him*." / "I got a kid. I'm going home." | Walks away before the fight, if he was let go in Ch2. If Jin hit him after, he's not there; Big Carl: "Tooley's eating through a straw. He says hi." |
| `yvette` (Annex clerk, 46) | Records counter | `write`, stamp | "Seo, with an S-E-O? ... Lindell House. Hm. You're the second person to ask for this file this week." / "There's a bench. Sit as long as you like. We close at five, but I'm slow at closing." | Ch9: "Seo, with an S-E-O." |
| `hana` | St. Agnes lobby or the parking lot bench (Fri Day or Sat Morning, optional) | peacoat over scrubs, `sit` | See Scene 6.4. | +1 hana for the visit (`visited_hana_ch6`). |
| `earl_dunning` | Room 214 | `sit` in bed | "Kid! Jin! They gave me a new roommate. He snores. I miss you." | If `earl_crossword`: he's saved Jin the Sunday crossword. |
| `dale` | Kessler Drug photo counter | `write` | "I didn't throw them out. We're supposed to after ninety days. I put them in the back. I kept thinking she'd come in and make fun of me for saying 'matte'." | — |
| `abel_ortiz` (58) | Greyhound depot bench (Fri, Ortiz path) | white cotton gloves over burned hands, a duffel, `sit` | See Scene 6.6b. | If missed: a letter via Father Nowak. |
| `fisk_men` (two) | Greyhound bus bay (Ortiz path) | `leanWall`, then fight | "Abel's just getting on his bus. Right, Abel? Nice and quiet." | Leon Fisk was Lindell House's managing agent; the city has opened a case and Ortiz's statement is in it. |
| `mr_ferris` (cemetery clerk) | Mount Hope office | `sit` by the heater | "Seo. Section F, row nine. The stone was paid cash, April '96. Big fella, older, didn't want a receipt. I made him take one. Marsh. T. Marsh." | — |
| `hector` | Community room table (Sat Evening) | `write` | If shown the bus print: see Scene 6.7. | `showed_hector_print`. |
| `mo`, `slim`, `hutch`, `lenny` | Cellar (corner path) | — | Mo: "Eastgate! Working a corner? Corners don't get paid much. Corners get blamed." / Slim (if straight and covered): "I'll carry your stool. Don't tell anybody I'm nice." / Hutch (if `paid_cellar_admission`): "You paid once. Lifetime membership." | Lenny (if not threatened) works Hammer Bell's corner across the ring and never looks over. If threatened: Mo: "Lenny? Scranton or Erie or the moon." |

## Interactables

The belongings are laid out on the loft floor and crate after the boxes come home, each a separate examine, so the player can pick them up in any order. The document viewer shows the actual text.

| id | Label | Examine text (summary of the viewer) | Unlocks |
|---|---|---|---|
| `min_folder` | Min's accordion folder | Tabbed in her handwriting: "HOSPITAL", "COUNCIL", "HOUSING", "MONEY", "LETTERS (CARBONS)". Opening it opens the next five items. | — |
| `eviction_notice` | Notice to Quit | "412 Kessler Ave #3B · March 3, 1995 · arrears $1,140 · thirty days." Min's pencil in the margin: "Appealed 3/6. Denied 3/20. Appealed again. — M" | `ev_eviction_notice` |
| `mercer_receipt` | Mercer Investigations | "Retainer $300, Nov 4, 1994. Report: 'No record of subject at Calder General after 9/1. No forwarding. Recommend police missing-persons report.' (Min, pencil: 'Filed 9/6. Ha.')" | `ev_skip_tracer` |
| `ncc_referral` | Letter on Council letterhead | NCC Tenant Emergency Fund, Jan 1995: "Eastgate is outside our service area. Referred to Calder Housing Authority. — G. Pike, for the Council." Jin's thought: *Pike. He was handling my bed and her rent in the same month.* | `ev_ncc_referral` |
| `cha_letters` | Housing Authority | Feb 1995: "Pending: verify status of household member SEO, JIN." April 1995: "Denied: incomplete (household member status unverifiable)." May 1995 appeal: "Denied." Thought: *They couldn't verify me because somebody made sure I didn't exist.* | `ev_cha_letters` |
| `standard_regret` | Letter, July 1, 1995 | NCC: "Dear Ms. Seo, We have no record of the individual you name. We wish you every success in your search." Unsigned, a stamped signature. | `ev_standard_regret` |
| `min_carbons` | Carbon copies | Eleven onionskin carbons of typed letters, Sept 1994 – Dec 1995, all addressed "Mr. Jin Seo, c/o Northside Community Council, Foundry Workers Relief Fund, 220 Foundry St." (She kept carbons of everything; she was a bookkeeping student.) Reading them here gives Min's voice (see "The letters" below); where they went is the question the board asks. | Board card "Eleven letters sent. One reply." |
| `min_visit_log` | Index card | "NCC office, 220 Foundry St. 4/18/95: Mr. Pike. 'No record.' Asked for his supervisor. 'Mr. Rook is in a meeting.' 6/9/95: Mr. Pike again. Water. 'No record' x4. Plaque in the lobby: 'No family should face hardship alone.' — M" | Board card |
| `pay_stubs` | Pay envelopes | Two employers: Kessler Cleaners (alterations, days) and Calder Linen Service (nights). On the back of one, in Korean-inflected English: "Min-ah, eat the rice in the fridge. Sleep before the appeal. I will iron your blazer. — Umma" | Board card "She kept working." |
| `shopping_list` | Mom's sewing tin | "rice 10 lb / scallions / thread navy / BATTERIES (smoke alarm!!) / Min bus pass / stamps (lots)" | `ev_shopping_list` |
| `half_hem` | Navy blazer | "Min's interview blazer. The hem is pinned all the way round and stitched halfway. The needle's still in it, threaded navy." A note pinned inside the collar: "Halvorsen & Pratt · Tues Jan 16 · 10 a.m." | `ev_half_hem` |
| `recipe_box` | Mom's recipe box | Under the kimchi card: the Sun's takeout menu from the fridge, Ch0. "AFTER THE FIGHT → SUN'S. I'M BUYING. (UNLESS YOU LOSE.) — M". Under it, blue pen: "Still buying. 3/11/95". | `ev_after_fight_note` |
| `min_wallet` | Min's wallet | A Calder Community College ID; a bus pass; $3; and a pink claim ticket: "KESSLER ONE-HOUR PHOTO · #4471 · 1/12/96 · BAL $7.38". | Lead to Kessler Photo |
| `golden_gloves_cert` | Certificate | "CALDER GOLDEN GLOVES 1986. They took it with them. From my room to their room. Room nine." | — |
| `bookkeeping_cert` | Certificate | "Calder Community College · Certificate in Bookkeeping and Accounting · Seo Min-ji · December 15, 1995." | Board card |
| `complaint_file` | Housing Inspection file 95-2231 | 9/14/95 complaint, five signatures: "M. Seo (Rm 9), A. Ortiz (Rm 5), D. Washington (Rm 3), K. Tran and L. Tran (Rm 6)". Items: "rear fire escape door padlocked from outside by agent (L. Fisk); no working smoke detectors 2F; space heaters in use (no heat 2F rear); overloaded wiring (fuses replaced with pennies)". Log: "10/30/95 inspection: no access (agent not present)." "12/11/95: postponed (staffing)." "Next: 1/22/96." | `ev_complaint_file` |
| `fire_report` | Fire Marshal report | "1/14/96, 3:10 a.m. Origin: Rm 7 (2F rear), portable space heater on overloaded circuit. 2F hall detector operational (battery dated 11/95, recently installed by a resident); occupants of Rms 1–6 evacuated by front stair. Rear exit door (2F) padlocked, exterior hasp. Occupants of Rm 9 unable to reach front stair through smoke. Deceased: SEO, MI-OK (53); SEO, MIN-JI (23). Rm 7 occupant (R. Kell) hospitalized, survived. Witness: A. Ortiz (Rm 5) attempted entry to rear corridor; turned back by smoke. Agent L. Fisk referred to District Attorney 3/96." | `ev_fire_report` |
| `claim_prints` | Envelope #4471 | Twenty-four prints (viewer, one at a time; see Scene 6.5). | `ev_min_prints` |
| `rear_padlock` | Padlock | (Lindell rear fire escape) "Still on the hasp. Rusted shut. On the outside. Somebody locked a door that only opened from the inside, from the outside." | — |
| `fence_candles` | Candles on the fence | "Somebody keeps these lit. Not me." (If Jin buys a candle or carnations at Garrison Grocery and leaves them: `left_flowers`.) | — |
| `headstone` | Stone, F-9 | "SEO MI-OK 1942–1996 · SEO MIN-JI 1972–1996 · BELOVED MOTHER AND DAUGHTER." | — |
| `cemetery_ledger` | Ledger | "Seo, Mi-ok / Seo, Min-ji · Sect. F row 9 · Stone: paid cash, T. Marsh, 4/96." | `ev_headstone_ledger` |
| `hold_box` | Box marked HOLD | See Scene 6.8. | `ev_min_letters`, `ev_pike_memo` |
| `smoke_detector_shop` | Smoke detector (Dombrowski's, $9) | Available after `ev_fire_report`. "Nine dollars. Batteries included." Buying and installing it in the loft (interact the ceiling hook) sets `bought_smoke_detector`; the loft gets a small red light that blinks every 40 seconds for the rest of the game. | `bought_smoke_detector` |
| `hq_door_note` | Note on the HQ door | (Sunday) "W. ROOK IN HARRISBURG (STATE HOUSING HEARINGS). BACK THURSDAY, MARCH 6. — G.P." | Sets Ch7's date. |

### The letters (Min's voice; carbons in her folder, originals in the archive)
The viewer shows each letter in full; these are the five the scenes quote. The other six are shorter (a birthday, a rent payment, a request for any form of confirmation, a Thanksgiving, a note about the 14 bus, one that only says "Still here. Still looking. — M").
1. **September 9, 1994.** "Jin, If this reaches you, call 555-0148, any time, day or night. Mom has the phone by the bed. General says you were moved for 'specialized care' and the family would be contacted. Nobody has contacted the family. I am the family." (If `teddy_stance = listened`: "P.S. Teddy came with me to General. He looked like he'd been hit.")
2. **November 20, 1994.** "I hired a man named Mercer to find you. He cost $300 and found out that you are nowhere, which I could have told him for free. Mom took in the Kaplan girl's prom dress and three hems to pay him. We're fine. We're not fine. We're fine."
3. **February 14, 1995.** "We got a Notice to Quit. Don't worry. I'm appealing everything. The Housing Authority wants to 'verify the status of household member SEO, JIN.' I wrote back: so do I."
4. **June 9, 1995.** "I came to your office today, the second time. A man named Mr. Pike gave me a cup of water and said 'no record' four times. I counted. There's a plaque in his lobby about families. I read it while he said it."
5. **October 2, 1995.** "I'm not going to stop looking. I'm going to stop waiting. Those are different, and I've decided I'm allowed the second one. I'm finishing my certificate in December. Mom says when you come home you have to pay for the cake. You owe us a cake for your 27th." Then by `purse_wish`: `rent`: "You were going to pay the rent. We paid it ourselves until we couldn't, which I think counts." / `radiator`: "The radiator in room 9 doesn't knock. It doesn't do anything. You'd hate it." / `tuition`: "I paid my own tuition. You owe me a graduation instead."
6. **December 18, 1995** (the last). "Merry Christmas. I passed. I'm a certified bookkeeper. I have an interview at Halvorsen & Pratt on January 16th and Mom is hemming the navy blazer so I look like a person who owns a calculator. We put your stocking up. It's empty because you're not here to fill it, not because we forgot. — Min"

## The timeline board — "The Last Sixteen Months"

An activity on the loft wall (`board_timeline`). The pencil line from Chapter 5 is extended by Jin across the wall into sixteen month columns, September 1994 to January 1996. Cards are made automatically from evidence and memories as they're found; the player places each card in its month. A misplaced card slides back with Jin's thought ("No. That was after the eviction."). Each completed row writes one plain sentence under the board, so the PDF's several failures become visible as separate things, not one explanation:

| Row | Cards | Sentence when complete |
|---|---|---|
| The search | MISSING flyer (9/94), Teddy and Min at General (10/94, if `listened`), Mercer receipt (11/94), carbons 1–4, Min's visit log (4/95, 6/95) | "Looking for me cost them money and time." |
| Help | NCC referral (1/95), CHA pending (2/95), CHA denied (4/95), appeal denied (5/95), standard regret (7/95) | "Every door they knocked on sent them to another door." |
| The house | Notice to Quit (3/95), Lindell House room 9 (4/95), complaint 95-2231 (9/95), no access (10/95), postponed (12/95), fire report (1/96) | "The house was reported, and left as it was." |
| Their lives | pay stubs, "Still buying 3/11/95", the cake photo (3/95), the certificate (12/95), the blazer (1/96), the shopping list | (no failure sentence; the row title changes from "Their lives" to "Their lives, not only the search") |
| Who knew | an empty row with one slot at June 1995 | Before the archive: "?" After the archive: the memo card snaps into June 1995 and the sentence reads: "Someone knew she was looking, and decided not now." |

The board never adds the sentences together into a verdict. Jin's thought after the last row: *I don't know if one letter would have saved them. Nobody gets to know that. He made sure nobody would ever find out.*

## Quests

- **Main — "Undelivered."** HUD steps: "St. Casimir's. Father Nowak has your boxes." → "Open the boxes." → "Put the months in order." (board) → "City Hall Annex: the house." → "Friday night." (choice) → "Claim ticket #4471." → "Garrison Street." → "Mount Hope." → "The board has a hole in June 1995." → "Mara's key." → "Read." → (Sunday) "Rook." Completion: the HQ door note. Reward: flurry; the full family evidence set; `ev_min_letters`, `ev_pike_memo`.
- **Optional — "Sun's."** Thursday or Saturday evening. Mrs. Sun sets a bowl down and sits across from him (Scene 6.2).
- **Optional — "Sealed by Payer."** Friday morning at the Courts. Pauline (Scene 6.3). Reward: the board card "How she found the fund" (explains Min's trace).
- **Optional — "Hana."** Friday or Saturday. St. Agnes (Scene 6.4). Reward: +1 hana; `ev_hana_complaint`; if no Dr. Mehta in Ch5, the Hollis price.
- **Optional — "Storm Drain."** Work shift at the Courts ($15, +1 mara if under cap).
- **Optional — "Nine Dollars."** After the fire report: the smoke detector.
- **Optional — "Flowers."** Garrison Grocery or the Mount Hope gate stand ($4 each): leave carnations at the fence and/or the stone (`left_flowers`).
- **Optional — "His Mirror."** Show Hector the print of Mom on the bus (Scene 6.7).
- **Choice quest — "Friday Night."** If `promised_deshawn_corner`: "Deshawn's corner, the Cellar, 8 p.m." and "Abel Ortiz, Greyhound, 7:40 bus" both appear on the map at once; choosing one makes the other unreachable that night. If no promise, only Ortiz appears.

## Scripted scenes

### Scene 6.1 — The speed bag and the phone (Thursday Morning)
1. Card: "Four weeks later · Thursday, February 20, 1997 · The thaw". **Camera**: the courtyard from the loft window, dripping eaves in the foreground; the fountain's gray hill; kids' boots splashing.
2. Courts gym. The speed bag that kept getting away from him. Deshawn, skipping rope, without stopping: "Stop thinking. It's a rhythm. You're counting. Don't count. Listen." **Flurry unlock**: an activity in which the player taps punch on the bag's rhythm; after four clean bars the prompt changes to the flurry input, and Jin rattles out a half-second burst with a clear final pop. **Deshawn:** "*There.* That's a sound I like."
3. The workshop phone rings (it rings twice before anyone notices; everyone in the Courts knows that phone's ring). **Mara:** "It's for you. A priest." Father Nowak (voice only): "Jin. It is Father Nowak at St. Casimir's. The river is in my basement. Your mother's and sister's boxes are up on a table, dry for now, but they need to go by Saturday. I'm sorry. I would have kept them forever." Thought: *Not yet. I kept saying not yet.* **Mara**, already taking the truck keys off the board: "I've got the truck. I'll drive."

### Scene 6.2 — The boxes (Thursday Day) and Sun's (Thursday Evening, optional)
1. Garrison Street from the truck's passenger window (a moving shot). At the far end, behind plywood, the black shell of Lindell House slides past. Jin does not turn his head. Mara sees him not turn it and drives a little faster.
2. St. Casimir's basement. **Father Nowak:** "I kept them dry for a year. God kept them dry; I moved them twice." He leads Jin along the planks to the table. "Your sister came to Mass at Christmas and argued with my homily on the steps afterwards. I miss that very much."
3. Carry: each box is a carry (no running on the planks: "Wet planks. Slow."). If mara ≥ 4 she takes box 2 without asking.
4. The loft. Jin sets the boxes on the floor. **Camera**: from the top of the loft ladder, Jin small between two cardboard boxes, the window gray. Letterbox on, then off when the first box opens. The belongings are laid out by the game as the player opens each item; nothing is required to be read in order. If Mara stayed: she sits on the top rung, says nothing, and leaves after the first box with "I'll be downstairs," which she is, for the rest of the afternoon, making more noise than she needs to so he knows.
5. The board activity begins with whatever cards exist.
6. **Sun's** (optional). Mrs. Sun sees him, puts down a bowl without asking, and sits across the booth. **Mrs. Sun:** "She sat here. Writing. One day she came in and said, 'Ajumma, I found the people who pay for him. Now they have to answer.' She was so proud. I thought: good. Somebody will answer." (beat) "Eat. You don't have to talk. I'll sit."

### Scene 6.3 — Pauline: "sealed by payer" (Friday Morning, optional)
Pauline on the B stoop at 7:50, still in scrubs, too tired to go up yet. If Jin asks how a hospital loses a man:
- **Pauline:** "It doesn't lose him. It seals him. When the payer asks for a sealed transfer, the floor only sees a code. The family calls, the desk says 'no record.' It's legal. It's ugly. I've said 'no record' to mothers myself, Jin. I didn't know what I was saying."
- **Pauline:** "But billing doesn't know about the seal. If your sister asked billing for the ambulance invoice, billing would print the payer's name right on it. Billing tells the truth because nobody bothers to lie to billing."
- Board card: "How she found the fund: the ambulance invoice, Calder General billing."

### Scene 6.4 — Hana (Friday Day or Saturday Morning, optional)
St. Agnes, the garden bench under the bare maple. Hana in her peacoat, a coffee from Dolores in her hands.
- **Hana:** "I filed with the state Department of Health on January sixth. Falsified records. Interference with a resident's communications. They put me on administrative review. Dolores brings me coffee in the parking lot like I'm in prison."
- **Jin:** "I'm sorry."
- **Hana:** "Don't be. I'm a records person. They're reviewing my records. Turns out it feels exactly like you'd think." (She gives him a copy of her complaint: `ev_hana_complaint`.) "I'm keeping everything. Two copies. One here, one at my sister's."
- If the player has the boxes: Jin tells her about the letters' carbons. **Hana**, after a long time: "She kept carbons." (beat) "I would've liked her."
- If `ev_mehta_assessment` is missing: **Hana:** "There's one program that could really help you. Hollis, in Boston. I looked it up. Don't look at the number." (The Money page gains the Hollis line.)
- If repaying the $40 (if he has it): **Hana:** "You remembered." (+2 hana.) "I wrote it down too. I'm crossing it out now." She does, in a pocket notebook.

### Scene 6.5 — The Annex (Friday Day)
1. The Annex steps. Pike is coming out with a manila envelope under his arm. He stops two steps above Jin. **Camera**: low angle from Jin's position, Pike tall against a white sky.
   - **Pike:** "Mr. Seo. You've been reading." (First time he uses the name.)
   - **Jin:** "You called me Daniel for two years."
   - **Pike:** "I called you what the file said. I'm a file man." (adjusts his glasses) "Some files are better left in their drawers. For everyone. For the people at the Courts, especially. Do you understand what I'm saying?"
   - **Jin:** "Are you threatening the Courts?"
   - **Pike:** "I'm protecting them. It's what I do. It's all I've ever done." He goes down the steps and, at the bottom, nods once toward the parking ramp.
2. Encounter 6A (the ramp) happens **before** Jin goes in for the files (the ramp's men try to take the copies he came for and keep him from going back in).
3. Inside. **Yvette:** "Seo, with an S-E-O? ... Lindell House. Hm. You're the second person to ask for this file this week." (A beat for the player to understand who the first was.) She brings two files and a copy card.
4. The document viewer: `ev_complaint_file`, then `ev_fire_report`. **Camera**: when the fire report opens, the Annex noise drops away (muffle 0.5); the radiator stays. The viewer does not hurry. Jin's thoughts appear one at a time, each only after the player scrolls to its line:
   - *"2F hall detector operational. Battery dated 11/95, recently installed by a resident."* — *BATTERIES (smoke alarm!!). Her battery. That's how everybody on the front got out.*
   - *"Rear exit door (2F) padlocked, exterior hasp."* — *Locked from the outside.*
   - *"Occupants of Rm 9 unable to reach front stair."*
   - *"Next: 1/22/96."* (from the complaint file) — *Eight days. The inspector was coming in eight days.*
5. **Yvette:** "There's a bench. Sit as long as you like. We close at five, but I'm slow at closing." The bench: sitting eases the camera out to the whole long corridor, Jin small under the mayor's portrait, the clock above the counter moving. Nothing happens until the player stands. The objective updates only then.
6. The smoke detector becomes available at Dombrowski's.

### Scene 6.6 — Friday night (the commitment choice)
The workshop phone rings at 5:30. **Father Nowak:** "Abel is leaving tonight. The 7:40, to Scranton. He says if you want to hear it, it has to be tonight." If `promised_deshawn_corner`, Deshawn is in the courtyard with his gym bag at the same moment: "Seven-thirty, Route 9. You're riding with me, right?" The map shows both, on opposite sides of the city, and the journal states it plainly: "You can be at one of them tonight." No timer runs; the choice is which bus to take (`ch6_friday`).

**6.6a — The corner** (`corner`). The Cellar, packed. Hutch waves Jin through. Slim carries the stool if he's friendly. Lenny (if he's still in town) is in Hammer Bell's corner across the ring and never looks over. Mo: "Corners don't get paid much. Corners get blamed."
- **Activity: working a corner.** Three rounds of Deshawn vs. Bell play out with the camera on the corner (Jin on the apron, the fight behind the ropes; the player watches Bell's habits). Between rounds, the stool scene: the player chooses what to tell Deshawn from three observations, only one of which the round actually showed (e.g., "He drops his right hand after he jabs." / "He's tired." / "Go to the body."). The correct call changes Deshawn's next round and his line ("You saw the right. Nobody sees the right."). Ice, water, grease (simple carry and use steps).
- Round 2: Bell opens a cut over Deshawn's left eye. Between rounds, Jin works the cut with Slim's (or Doc Haskell's) swab; the bleeding slows but doesn't stop.
- Before round 3, on the stool, **Deshawn:** "I can't see. Jin. I can't see out of the left." (The camera uses the Ch0 corner framing exactly: tight on the corner, crowd blurred, sound muffled except voices. The fire-alarm bell hasn't rung yet.)
- **Choice** (`towel_thrown`):
  - Throw the towel. → **Mo:** "Corner stops it!" The crowd boos. Deshawn shoves Jin off the apron: "I *had* him!" Later, in the warm-up room, an ice bag over his eye, quiet: "...I couldn't see him. I couldn't see anything." (+1 deshawn.)
  - "Hands up. Go." → Deshawn goes out half-blind and is dropped twice; Doc Haskell's penlight; he's okay, and doesn't remember the round. In the warm-up room: "You sent me out. I'd have hated you if you didn't." (beat) "I don't know which one's worse." Jin's thought: *I sent him out.* (No meter change.)
- Either way: keeping the promise +3 deshawn; $20 corner money from Mo; Jin writes under Deshawn's name on the record wall: "corner: J. SEO".
- Ortiz's account arrives on Saturday as a letter via Father Nowak (6.6c).

**6.6b — Ortiz** (`ortiz`). The Greyhound station, 7:15. Ortiz on a bench in Bay 3's doorway, cotton gloves, duffel between his feet. Two men in Carhartt jackets standing too close to him.
- Encounter 6B (short).
- The bench. Ortiz doesn't look at Jin; he looks at the departure board. Letterbox on. **Ortiz:** "You have her face. Around the mouth. Not the rest." Then, unprompted, in order:
  - "Fisk put a padlock on the back door in July. 'Junkies,' he said. We told him we'd burn up like rats. He laughed. We put it in the complaint. Your sister wrote the complaint. She wrote it so well the inspector called it 'very thorough' on the phone, and then he didn't come."
  - "The detector in the hall didn't work. She bought batteries with her own money and stood on my chair to put them in. November. She said, 'Somebody has to, Abel, and I'm the one with a chair.' It was my chair."
  - "Your mother worked nights. She slept in the day with a sock over her eyes. She sewed curtains for my room, for nothing. She wouldn't let me pay. She said I could pay her back by not being so sad."
  - "She went to that Council twice. The second time she came back and sat on the stairs for an hour and didn't come up."
  - "That night I got to the door of seven and the smoke pushed me down. I went down the front stair because I could. I've been going down that stair every night since."
  - The bus is called. He stands, picks up the duffel with his wrists, not his hands. "I'm not brave twice. I was brave once, on those stairs, and it wasn't enough. I'm going to my sister's." He gets on.
- `ev_ortiz`. Deshawn, back at the Courts later that night, in the courtyard with his gym bag and an ice pack: "You didn't come." (−3 deshawn.) If the player says why ("A man who was in the fire was leaving town."): "...Okay. That's a real reason. I'm still mad. Both of those." Deshawn lost by stoppage; Slim threw the towel.

**6.6c — Ortiz's letter** (if `corner` or neither). Saturday, Father Nowak on the church steps hands Jin an envelope: Ortiz's account in a shaky hand, shorter, the same facts (padlock, batteries, the curtains, the Council visits, the door of seven), and at the end: "I'm sorry I did not wait for you. I am not brave twice. — Abel Ortiz." `ev_ortiz` (letter version).

### Scene 6.7 — Claim ticket #4471 (Saturday Morning)
1. Kessler Avenue in the thaw. Kessler Drug. **Dale:** "I didn't throw them out. We're supposed to after ninety days. I put them in the back." He takes the ticket and goes into the back for a long time. "I kept thinking she'd come in and make fun of me for saying 'matte'." Balance: $7.38. (If Jin can't pay, Dale pays it himself and doesn't mention it.)
2. The prints, in the viewer, one at a time. Twenty-four, but the viewer shows these and summarizes the rest as "eleven of the street, two blurry, one of Dale making a face":
   - Mom asleep at a sewing machine in room 9, her glasses on her forehead.
   - The rear fire escape door with the padlock on it and a wooden ruler held against it for scale; Min's thumb at the edge of the frame. (She was documenting the complaint.)
   - A cake on a card table that says "JIN 27" in blue icing, two forks, one plate.
   - Min holding her bookkeeping certificate, mouth open mid-laugh, wearing the navy blazer with its hem still pinned.
   - Mom asleep on a city bus at dawn, sewing in her lap, and at the top of the frame a driver's rearview mirror with a mustache in it.
   - Garrison Street in snow, January 12, 1996, from the stoop of Lindell House. The last frame.
3. **Camera**: the viewer closes on the last print, and the real Kessler Avenue fades up behind it in the same framing (the street now, slush instead of snow). The player has control on the sidewalk. Nothing is required. Sitting on the 412 stoop is possible; Sal's geranium can is there, empty.
4. `ev_min_prints`.
5. **"His Mirror"** (optional, Saturday Evening at the Courts). Hector is at his treasurer's table. Shown the bus print, he takes off his cap. **Hector:** "That's my bus. That's my mirror. That's my mustache, God help me." (beat) "She rode the 6:10 from downtown. Every morning. I gave her the seat behind me because of the heater. She sewed the whole way. I never knew her name. I called her 'Mrs. Sewing.' She called me 'Mister Fourteen.'" (`showed_hector_print`.) He gives the print back very carefully. In Ch7 his anger at Jin is the same, and harder for him to hold.

### Scene 6.8 — Garrison Street and Mount Hope (Saturday Day)
1. **Lindell House.** The player can walk the front, read the city notice, and look at the fence candles. The gap in the fence leads to the rear alley. The rear fire escape is climbable (one-way platforms). At the top, the steel door, the hasp, the rusted padlock (`rear_padlock`). From the landing, through a gap in the plywood, the corridor: black, the doors of rooms 7, 8 and 9 in a row. Jin does not go in; there is no prompt to.
2. Back on the street, the fence: sitting against it (interaction) plays `mem_snow_garrison`: the last print re-imagined from where Min stood, snow falling in the memory filter, her voice once ("Smile, it's snowing, nobody's looking."), then the thaw again. Garrison Grocery sells carnations and votive candles ($4).
3. The church bells at noon. *Bells.*
4. **Mount Hope.** The one hour of sun. Mr. Ferris at the office ledger (`ev_headstone_ledger`): "Big fella, older, didn't want a receipt. I made him take one. Marsh. T. Marsh." Thought: *Teddy.* The stone in F-9. The player can leave flowers, sit on the bench, or stand. **Camera**: slow zoom out from the bench until the stone is one of hundreds and the Ashgrove Tower stands across the river in the same frame. No thought lines unless the player sits; if they sit: *I didn't come to the funeral. I was asleep with somebody else's name over my head.* / *Teddy paid. Teddy never said.*

### Scene 6.9 — The archive (Saturday Night)
1. **The key** (`archive_key`), Saturday evening at the Courts.
   - **Ask Mara.** She's finishing a radiator bleed in Building A and says she'll be done at nine. The player waits (sitting passes the time; the courtyard goes dark around the workshop step). At nine: "Council boxes. What for?" **Jin:** "My sister wrote to the Council. Eleven times." Mara looks at him for a long moment, then takes the ARCHIVE key off the board. "Lock up when you're done. I don't want to know what's in Council boxes. I like my roof." (+1 mara.) She sits on the workshop step with a coffee instead of going home.
   - **Take it.** Mara is at Odette's Saturday cards in 1C (her laugh carries across the courtyard). The key board, the ARCHIVE hook. Immediate. (−2 mara, applied when she notices Sunday morning.)
2. The basement, past the gym (the speed bag hanging still), past the boiler (ticking), to the steel door. Letterbox on. The padlock. The pull chain. The bulb swings; the shelves' shadows swing and settle.
3. Shelves. The box marked HOLD. Inside: eleven envelopes in a rubber band. Min's handwriting on every one: "Mr. Jin Seo, c/o Northside Community Council, Foundry Workers Relief Fund, 220 Foundry St." Each slit neatly along the top, read, refolded, and stamped in red on the front: "HOLD — G.P." with a date. Jin's thoughts: *She addressed them to me.* (beat) *They opened every one.*
4. Under the bundle, a typed inter-office memo with a carbon behind it (`ev_pike_memo`), in the viewer:
   > INTER-OFFICE · June 12, 1995 · To: W. Rook · From: G. Pike · Re: Seo family (D. Ahn file)
   > The sister has written seven times and came to this office twice (4/18, 6/9). She has traced the Relief Fund from the Calder General ambulance invoice. She is persistent, organized, and polite. The household is in arrears and has applied to our Tenant Emergency Fund, which I redirected. Request instruction.
   >
   > *(pencil, a looser hand)* Hold. No confirmation. We do not move him and we do not open this. Not now. — W.R.
   >
   > *(typed)* 7/1/95 standard regret sent. G.P.
5. **Camera**: slow zoom-in on "Not now." until the two words fill the viewer; then the viewer closes, and the room is the room again, smaller. Audio: everything muffled except the bulb's buzz and the boiler through the wall. Letterbox stays.
6. The player has control in the archive. Nothing is required. Jin can sit on the floor with his back to the shelves (`sit` floor) and read any of the eleven originals; the originals have Pike's red stamp and, on three of them, Pike's small pencil tick in the margin beside sentences about money. Reading all eleven sets `read_all_letters`. If the player sits, thoughts arrive slowly, one per sit-beat:
   - *June 1995. They had seven more months.*
   - *He knew she was looking. He wrote "not now."*
   - *I don't know if one letter would have saved them. Nobody gets to know that.*
   - *He made sure nobody would ever find out.*
7. On the loft board (automatically): the memo card snaps into June 1995 and the "Who knew" row's sentence writes itself.
8. Leaving: up the stairs, through the dark community room; the deed plaque catches the red of the EXIT sign; **camera** holds on it for two seconds as Jin passes, without a thought line. Outside, the courtyard at night, Odette's light on.
9. If Mara gave him the key: she's on the workshop step. She sees the box in his arms. **Mara:** "Is that Council property?" **Jin:** "It's my sister's." Mara looks at the box, then at him. "...Okay." She doesn't ask. She goes in. (She has chosen not to look, one more night. Chapter 7 takes that choice away from her.)

There is no combat anywhere after Scene 6.9 in this chapter.

### Scene 6.10 — Sunday (Sunday Morning)
1. The loft. The board complete. Morning light. If `archive_key = took`: Mara at the bottom of the ladder: "The archive key was on my board on Saturday and in your pocket on Sunday. I'd have given it to you. You know that, right?" She leaves before he answers. If asked: a coffee on the bottom rung, no note.
2. Foundry Street. The HQ door: the note (`hq_door_note`). Jin sits on the HQ steps. **Camera**: very wide, the union hall's carved lintel above him, "UNITED FOUNDRY WORKERS LOCAL 1197 · 1937", Jin small on the steps with a cardboard box beside him. Church bells from somewhere on the Northside.
3. Thought: *Thursday.*

## Encounters

### 6A — The Annex ramp (Friday, always)
- Two levels joined by a down-ramp; Pike's hired crew: Big Carl (`collector`) + 2 `thug`. If Tooley was let go in Ch2, he's here at the start, recognizes Jin, and walks off ("I got a kid. I'm going home."), leaving the fight one man lighter. If Tooley was hit after, Big Carl says "Tooley's eating through a straw. He says hi."
- Teaches: the flurry as a finisher on a staggered collector (it has a clear last hit and doesn't lock Jin in place); using the ramp's slope to split two enemies.
- `maxAttackers` 2. Checkpoint at the ramp entrance. Short (under a minute for a competent player).
- After: Big Carl, sitting on a parking bumper: "Pike pays two hundred a man. Pike's paying for nothing tonight." No questioning needed.

### 6B — The bus bay (Friday, Ortiz path only)
- Two of Leon Fisk's men (`thug` + `collector`) in the Bay 3 doorway. **Fisk man:** "Abel's just getting on his bus. Right, Abel? Nice and quiet." Ortiz says nothing and looks at his gloves.
- Teaches: nothing new; a short test of the full toolkit in a confined space (bus bay between two parked coaches; no room to retreat; slip and counter or go over with the air dash off a luggage cart).
- Checkpoint at the doors. After: they leave in a pickup. Ortiz's bench scene follows only after a deliberate walk back inside (the player has to choose to sit beside him), so the testimony is never interrupted by the fight's adrenaline.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Corner or witness | `ch6_friday` (`corner` / `ortiz` / `none`) | Corner: +3 deshawn, $20, corner activity. Ortiz: −3 deshawn, the in-person testimony and Encounter 6B. | Ch7 Deshawn's anger is milder if he got his corner. Ch10: Deshawn at Alder Row only if deshawn ≥ 4. Ortiz in person makes him reachable in Ch9 by phone (his sister's number) for Ending Two testimony; the letter version is evidence only. |
| Throw the towel | `towel_thrown` | Deshawn's anger, then thanks / or "I sent him out." | Ch7: "You threw the towel for me. And you'd take my grandma's roof?" / or "You sent me out. Now you're sending everybody out." Ch10/epilogue lines. |
| Ask Mara for the key, or take it | `archive_key` (`asked` / `took`) | +1 / −2 mara | Ch7 Mara: "You asked me for a key once. I gave it to you. I wish I'd gone down with you." / "You took a key off my board. I'd have given it to you." |
| Smoke detector | `bought_smoke_detector` | −$9, the red blink in the loft | The blink is in every later room Jin lives in, including the Ending Two rented room and the Ending One Riverside Lofts apartment (where it is mounted by a building manager instead). |
| Flowers | `left_flowers` | −$4 | Fresh candles at the Lindell fence in Ch9 (somebody else keeps it up). |
| Read every letter | `read_all_letters` | — | Ch7: Jin quotes letter 5 to Rook: "She said she was going to stop waiting. She'd decided she was allowed." |
| Visit Hana | `visited_hana_ch6` | +1 hana, `ev_hana_complaint` | Ch9: Hana already has a box of copies ready. |
| Show Hector the print | `showed_hector_print` | Hector's memory | Ch7 Hector's line changes. Epilogue Ending Two: Hector drives Jin to work on the 14 some mornings and says nothing about it. |

## Chapter ending beat and hand-off

Sunday, the HQ steps. Completion screen: the loft wall board, all five rows filled, the June 1995 card in the center with "Not now." legible. Summary lines from flags ("You were in Deshawn's corner." / "You sat with Abel Ortiz." / "You asked Mara for the key." / "You read every letter."). State handed on: flurry (toolkit complete: nothing new after this), training caps rise to 3; `ev_min_letters`, `ev_pike_memo` and the full family set; base = workshop loft. Map: Council HQ opens on Thursday, March 6; Garrison Street, City Hall Annex and Mount Hope stay unlocked for the rest of the game. Time card: "Thursday, March 6. Rain."

---

# Chapter 7 — What Your Life Bought

## Date, mood, palette, weather

Thursday, March 6, 1997, from 9 a.m. to past midnight, and the morning after. Rain all day, steady and gray, gutters overflowing, the stack black with wet. Mood: heavy, clear, adult; a day of saying things out loud. Palette: the union hall in dark varnished wood, green-shaded lamps, a faded 1937 mural, a red-and-gold Local 1197 banner, rain-gray light through tall arched windows; the Courts in blue-gray rain with every window lit early because it's dark by four; at night the community room is the only warm box in the courtyard. Weather never lets up; the sound of rain is under every scene, louder at windows.

## Gameplay identity

The confrontation chapter. The player carries a box of evidence into the building where the decision was made, breaks up a visit from the outfit that shows who holds whose leash now, collects the last records from a man packing his desk, builds the chain on a union bulletin board, and then presents it to Rook in an empty hall until he stops telling himself the easy version. There is no boss. After the admission, the player chooses how the residents find out, and then walks among them while they react. Share: exploration 15% · dialogue 40% · investigation 25% · combat 10% · activities 10% (the chain board). Target 22 min.

## Locations

### `courts_rain_morning` / `courts_rain_night` / `courts_after` — Foundry Courts (same geometry)
Morning: ordinary. Odette's broom is inside the door because of the rain; Hector asleep; Pauline home; kids under the B stoop's overhang playing jacks; Tamika's chalk on the dry patch under the workshop eaves: a blue figure with a glove and "JIN" over it (`tamika_drawing`). Night: every window lit, the community room full. After (next morning): see Scene 7.8.

### `council_hq_lobby` — Council HQ, lobby (900 x 360)
The old union hall's front room. A volunteer's desk with a rotary phone and a bowl of butterscotch; a row of waiting chairs; a **water cooler with paper cone cups**; framed photos of the Council's work (the Foundry Courts ribbon-cutting, October 1994, Rook and Odette holding giant scissors; the toy drive; the tenant clinic); and on the wall facing the chairs, a brass **plaque**: "THE NORTHSIDE COMMUNITY COUNCIL BELIEVES NO FAMILY SHOULD FACE HARDSHIP ALONE." Stairs up at the right. Lighting: lamps, rain-light from the door. Ambient: rain, a radiator, the phone ringing and not being answered, raised voices upstairs.

### `council_hq_stairwell` — Stairwell (320 x 720)
Wide union-hall stairs, brass rail, a landing with a stained-glass window of a ladle and a gear. The encounter starts here.

### `council_hq_upstairs` — Second floor (1400 x 360)
Left to right: the **records room** (filing cabinets, half of them open and empty, cardboard boxes, Pike's desk with a typed resignation letter, a hot plate, a framed photo of a younger Pike shaking hands with Rook in front of the hall); Rook's **office** (an oak desk, a cot folded against the wall, a coat rack with the canvas jacket dripping, a photo of Rook and Leon Baptiste in hard hats in 1971, Rook's Local 1197 card from 1961 framed, and **four framed rejection letters** in a row, from Calder Savings, Riverside Trust, the state housing office and a foundation, all saying no in different typefaces); the door to the **hall balcony**.

### `council_hq_hall` — The assembly hall (1600 x 420)
The union hall proper: a raised stage with a podium; the Local 1197 banner; a long **1937 strike mural** across the back wall (men at the foundry gate, a woman handing out bread, a policeman's horse); rows of folding chairs, some stacked; radiators knocking; tall arched windows streaming with rain; and along one wall a big cork **bulletin board** (the chain board). A balcony runs across the back with the stairs from the second floor. Lighting: rain-gray from the windows, two green-shaded lamps on the stage, everything else dim. Ambient: rain, radiators, footsteps that echo.

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions to earlier choices and to this chapter |
|---|---|---|---|---|
| `bernice` (Bernice Wojcik, 74, volunteer) | Lobby desk | `sit`, knitting | "Mr. Rook's back from Harrisburg. He's got visitors. Loud ones." / "My Stanley fights at the bowling alley. He loses. He's happy." (Wojo's mother.) | If Jin met Wojo in Ch3: "You know my Stanley? Is he winning? Don't tell me." |
| `cal_brannigan` + `joey`, `frankie` | Rook's office → stairwell | `point` | "Mr. Rook. The letters. Sign the letters." / to Jin: "*You.* Uncle Dutch said you'd come around." (If `beat_dutch_after`: "You put my uncle in the hospital.") | Director again (Ch4). Flees. |
| `pike` | Records room | `carry` boxes, then `sit` | "I wrote everything down. I always write everything down. That was supposed to protect us." | If `insisted_to_pike`: "You told me your name on the third day. I wrote 'confabulation.' I knew how to spell it." If `hurt_collector_after`: "Tooley's jaw is wired, Mr. Seo." If `signed_real_name`: "Seo Jin. On a form. In front of Grace Ito. I knew then it was over. I just didn't know it would take until March." |
| `rook` | Office (split lip), then the hall | `sit` on the stage edge, glasses folded | See Scene 7.5. | Lines vary with `accepted_rook_doctor`, `mentioned_dutch_to_rook`, `read_all_letters`, `took_wage_envelope`. |
| `mara` | Workshop (morning); community room (night) | `armsCrossed` | See Scene 7.7. | Varies with `returned_wage_envelope`, `archive_key`. |
| `odette` | Community room; then 1C by the window | `sit`, hands in her lap | "He sat with me when Leon passed. Right there in that chair. Don't you tell me what kind of man he is. Tell me what kind of man he was that night." | `stayed_for_soup`: "You ate at my table." Sitting with her (+1 odette). |
| `hector` | Community room | `handsHips` | "My kid was born in 2B. If this goes to a courtroom, who holds the note? You?" | `showed_hector_print` variant. |
| `pauline` | Community room, in scrubs (she's late for her shift and doesn't go) | stands first | "Get out of my kid's building. Today. I'll carry your boxes." | Rejects Rook immediately. If `courts_donation = afterschool`: she's the first to say Jin's not the one to blame ("Hector, sit down. He didn't sign anything."). |
| `deshawn` | Community room, standing at the back wall | `armsCrossed` → `point` | "Don't you dare make my grandma's roof a question." | `towel_thrown` / sent out / `ortiz` variants. |
| `joanna_kaczmarek` | Community room | `sit`, a baby on her knee | "I begged him. In the parking lot at Dombrowski's, with four kids in the car. I'd beg him again. God forgive me, I'd beg him again." | — |
| `mrs_mehta` | Community room | `sit` | "He saved my home. I am old. I will not pretend otherwise." | — |
| `ray_esposito`, `ade_nunes` | Community room | `sit` | Ray: "So who's paying the boiler now?" / Ade: "Does this mean no payroll again?" | — |
| `tamika`, `benny` | Community room floor; courtyard next morning | `sit` cross-legged | Benny: "Is Mr. Rook in trouble?" / Tamika (next morning, redrawing her chalk): "Somebody stepped on you." | — |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `hq_plaque` | Plaque | "NO FAMILY SHOULD FACE HARDSHIP ALONE. She read this while he said 'no record.' Four times." | — |
| `water_cooler` | Water cooler | "Paper cones. He gave her a cup of water. Both times." | — |
| `ribbon_photo` | Photo | "October 1994. Rook and Odette with giant scissors. Everybody's laughing. Somebody's holding up a sign: SAVED BY ITS PEOPLE." | — |
| `rejection_letters` | Four framed letters | "Calder Savings: 'We regret.' Riverside Trust: 'Unable at this time.' The state: 'Pending 1996 appropriations.' A foundation in Pittsburgh: 'Outside our guidelines.' He framed them. Four ways to say no." | — |
| `rook_union_card` | Union card | "UNITED FOUNDRY WORKERS LOCAL 1197 · W. ROOK · 1961. He was eighteen." | — |
| `rook_leon_photo` | Photo | "Rook and Leon Baptiste in hard hats, 1971. Leon's holding the same ladle as in Odette's photo." | — |
| `alder_letters` | Stack of letters on Rook's desk | "On Council letterhead, unsigned, a hundred copies: 'To the residents of the Alder Row Cooperative: The Northside Community Council supports the voluntary relocation of residents and will assist families during the transition.' Voluntary." | `ev_alder_letters` |
| `rook_notebook` | Notebook (Rook hands it over) | See `ev_rook_notebook`. | `ev_rook_notebook` |
| `pike_ledger` | Ledger "D. AHN" | See `ev_pike_ledger`. | `ev_pike_ledger` |
| `ledger_1994` | Ledger page, "SPECIAL ACCOUNT 1994" | See `ev_ledger_1994`. | `ev_ledger_1994` |
| `pike_resignation` | Typed letter | "To the Board of the Northside Community Council: I hereby resign as liaison, effective immediately. I have kept complete records of my work. They are in the boxes by the door. — Gerald Pike" | — |
| `chain_board` | Bulletin board | The chain activity (below). | `ev_chain` |
| `mural_1937` | Mural | "1937. Men at the foundry gate. A woman handing out bread. A horse. They painted the strike so nobody would forget who paid for the eight-hour day." | — |
| `tamika_drawing` | Chalk | Morning: "A blue man with a glove. JIN." Next morning: "Somebody stepped on it. Tamika's redrawing it with the blue chalk worn down to a nub." | — |
| `courts_wall_chalk` | Chalk on the B wall (next morning) | "WHO PAID FOR OUR ROOF? Under it, another hand: WE DID. Under that, a third: HE DID, with an arrow. The arrow points at Tamika's blue man. Somebody's tried to rub it out." | — |

### Evidence gained this chapter
- `ev_pike_ledger` — "D. AHN — St. Agnes — 26 monthly payments, Sept 1994 – Oct 1996, $1,400–$1,650; total $41,210." Pike's margin note on the first page: "Per W.R.: best available care. Do not economize." (The Council paid for good care and no name. The PDF's thematic seed, written in a ledger.)
- `ev_ledger_1994` — "NCC SPECIAL ACCOUNT 1994 · 9/28/94 received via Harlan Frt (Riverside Hldgs) $410,000 · 9/28/94 Foundry Cts purchase deposit $410,000 · 10/3/94 closing · thereafter serviced by H.F., window 2". Paired with the CIVIC folder's "8/24 R.H. wire recd" and "9/28 transfer to 'N' acct", it closes the gap Chapter 4 left open.
- `ev_rook_notebook` — a 1994 pocket notebook in Rook's hand: "Foundry Co. liquidation — 90 days — deadline 9/30 — 212 households — Pgh buyer (parking) — Calder Savings no (4th time) — state program '96 — Kaczmarek baby due Oct — Odette packing — B. says there's a fight in Aug, a sure thing, the people betting want a community partner, a share — ONE TIME." And on 8/21: "B. called from General. Not waking up. If the name comes out the deal comes out. Told him: best place, pay for it, no name. God help me." And on 6/12/95, a single line: "Pike re: sister. Told him hold."
- `ev_alder_letters` — the letterhead stack (above). First mention of Alder Row in the game.
- `ev_chain` and `ev_rook_admission` — from the board and the confrontation.

## The chain board — "What Your Life Bought"

An activity on the assembly hall's bulletin board (`board_chain`). Three statements are written across the top in Jin's hand on index cards (the PDF's chain, verbatim in meaning):

1. **"The forced result produced the payout."** Supports: `ev_cassette` ("one cup... a step slower"), `mem_orange_cup_2` (Lenny's hand), `ev_payment_slip`, `ev_civic_ledger` ("8/19 DR2 access", "8/24 R.H. wire recd").
2. **"A negotiated share financed Foundry Courts."** Supports: `ev_rook_notebook` ("a share — ONE TIME", deadline 9/30), `ev_ledger_1994` ($410,000 via Riverside Holdings, 9/28/94), `ev_deed_plaque` (October 3, 1994), `ev_dutch_statement` ("negotiated like a union man").
3. **"Jin's concealment protected everyone involved."** Supports: `ev_transfer_form` ("NOK NOT NOTIFIED, PER PAYER REQUEST"), `ev_keystone_invoice` ("name: per G.P."), `ev_pike_ledger` ($41,210, "no name"), `ev_pike_memo` ("Hold... Not now."), `ev_min_letters`.

Each statement needs any two of its supports to lock; extra supports add a line of string between the cards (pure feedback). A card placed under the wrong statement slides back with Jin's thought ("That's the money, not the fight."). There is no penalty and no timer. When all three lock, red string runs from the first card on the left to the last card on the right, across the whole board; the camera pulls back so the board fills the frame and then keeps pulling back until Jin is small in front of it in the empty hall. `ev_chain`.

## Quests

- **Main — "What Your Life Bought."** HUD steps: "Council HQ. Office hours today." → "Upstairs." → (fight) → "Rook says: give him an hour. In the hall." → "Pike's packing. Get the records." → "Build the chain." → "The hall. Rook." → "How do they find out?" → (residents) → "Tonight: the loft or somewhere else." Completion: the night's last scene. Reward: `ev_chain`, `ev_rook_admission`, the lead to Ray Castell; map: Civic Arena becomes visible as "Calder Civic Arena · Teddy's building".
- **Optional — "Mrs. Sewing."** If `showed_hector_print`: after the assembly, find Hector at the bus stop with his thermos, about to leave for the night 14. (See Scene 7.7, Hector variant.)
- **Optional — "His Chair."** After the assembly, Odette's 1C. Sit with her (+1 odette, `sat_with_odette`).
- **Optional — "Bernice's Stanley."** Tell Bernice that Wojo is happy. Pure warmth; she gives Jin a butterscotch, which becomes an inventory item that does nothing and stays in the inventory to the end.

## Scripted scenes

### Scene 7.1 — Leaving the Courts (Thursday Morning)
1. Card: "Thursday, March 6, 1997 · Rain". The loft. Jin puts the HOLD box under his arm. The board on the wall behind him.
2. The courtyard in the rain, ordinary. Barks: Odette from her window: "Umbrella! Take an umbrella, you'll catch your death!" (She throws one down; it's a lavender umbrella; Jin uses it, and it stays as a prop in his hand for the walk.) Benny under the B overhang: "Are you going to work?" Jin: "Sort of." Mara in the workshop door, seeing the box: a look, nothing said.
3. Tamika's chalk under the eaves: the blue man with "JIN" over him.
4. Foundry Street. Rook's maroon Buick at the curb in front of HQ, and behind it a black Lincoln with Harlan Freight plates.

### Scene 7.2 — Bernice and the lobby
**Bernice:** "Mr. Rook's back from Harrisburg. He's got visitors. Loud ones." The plaque and the water cooler can be examined (Min's letter 4 is now a place the player is standing in). Shouting upstairs: "Sign the letters, Walter!" and Rook's voice, not shouting: "I said no on Tuesday, Cal."

### Scene 7.3 — The stairs (Encounter 7A)
The fight (see Encounters). At the end, Cal flees down the stairs and out into the rain to the Lincoln. Rook in his office doorway, a handkerchief to a split lip, glasses in his other hand.
- **Rook:** "Jin." (He sees the box.) "Ah." (beat) "That's the archive box. Mara's key?" (If `archive_key = took`: "Mara didn't give you that. I know Mara.")
- **Rook:** "Sit down. No— don't. Give me an hour. Then ask me whatever you want. In the hall. I'd rather answer in the hall."
- He opens his desk drawer and puts a small black 1994 notebook on the desk between them. "You'll want this. It's all in there. I kept it. I don't know why I kept it." (`ev_rook_notebook`)
- On the desk, the stack of Alder Row letters, unsigned (`ev_alder_letters`).

### Scene 7.4 — Pike (records room)
Pike is taping a box shut. He doesn't stop.
- **Pike:** "Mr. Seo." (beat) "I wrote everything down. I always write everything down. That was supposed to protect us." He slides a ledger across the desk (`ev_pike_ledger`) and a single ledger page in a plastic sleeve (`ev_ledger_1994`). "That's the one you couldn't find at Harlan Street. The balance forward. I kept it here."
- Flag lines (see NPC table).
- **Jin:** "You gave my sister a cup of water."
- **Pike** (stops taping): "She thanked me for it. Both times. I wrote 'polite' in the memo because it was the only true thing I could think to say about her that wouldn't make him answer." (He goes back to taping.) "I believed in this Council, Mr. Seo. I still believe in it. That's the part I can't get out of my head."
- He leaves with one box, and doesn't come back. His resignation letter stays on the desk.

### Scene 7.5 — The hall
1. The chain board (activity above). Rook comes in during it through the balcony door and sits on the edge of the stage without interrupting. If the player looks at him, he's looking at the mural.
2. When the chain is done, the board pull-back ends with Rook in frame. Letterbox on. **Camera**: wide and symmetrical, the stage centered, Rook small on its edge, Jin at the board, the rain-gray windows between them. The radiators knock.
3. **The presentation** (activity `present`). Rook offers the versions he has told himself, one at a time. For each, the player presents a card from the chain. Wrong cards get Rook's rebuttal and nothing else ("That's Brannigan's paper. I'm asking you about mine."). Right cards move the scene forward.
   - **Rook:** "The Council took a loan from private partners. It's in the minutes." → `ev_ledger_1994` (or the CIVIC folder). **Rook:** "...Yes. Private. That was the word I used."
   - **Rook:** "I didn't know what they'd do to you. Brannigan said a sure thing." → `ev_rook_notebook` ("a share — ONE TIME"). **Rook:** "I knew it was fixed. I didn't ask how. I told myself 'fixed' means a man lies down for money. Men lie down for money every Saturday in this city. I didn't ask how, because asking would've made it mine." (This is the admission of authorizing interference.)
   - **Rook:** "When I heard you were hurt, it was already done." → `ev_pike_ledger` or `ev_keystone_invoice`. **Rook:** "Brannigan called me from General on the twenty-first. He said you weren't waking up. He said if your name came out, the deal came out, and the deal was the houses. I said: the best place there is. Pay for it. No name." (beat) "I said 'no name' on the phone to a man like Brannigan, about a boy who'd been on television the night before. And I went to bed."
   - **Rook:** "Your family— I didn't know they were looking." → `ev_pike_memo`. Rook takes off his glasses and folds them. A long silence; the rain. **Rook:** "...I knew."
4. **Rook's defense** (not a choice; the player listens; the camera slowly pushes in on Rook as he talks, then stops pushing and holds):
   - "The Kaczmareks. Six kids, and she was carrying the sixth that September. The Ruizes; Hector's boy was born in 2B. Odette Baptiste, eighty dollars a month from a widow's pension. The Delgados. The Mehtas. Pauline Greer and a baby on her hip. Two hundred and twelve households. Calder Foundry gave them ninety days. The buyer was a parking-garage outfit from Pittsburgh."
   - "I had a bank that said no in four different typefaces." (He gestures toward the office; if the player read the framed letters, Jin's thought: *He framed them.*) "A state program that said 'maybe '96', and a September thirtieth deadline. I spent eleven years at bake sales, Jin. Eleven years of chicken dinners and raffles and polite letters to men in towers. You know what eleven years of raffles buys? A copier."
   - "Joanna Kaczmarek begged me in the parking lot at Dombrowski's with four kids in the car. August second. I remember the date. Odette came to my office in July and didn't cry. She asked me what she should pack first."
   - "Then Brannigan sat me down in his office and said there's a fight in August, and the people betting on it would like a community partner, and there's a share for the Council. A sure thing. And I said—" (beat) "I said one time. Just once. That's what everybody tells himself, isn't it."
5. **Jin's answer.** One line is fixed; the rest is chosen from what the player knows (each option is a true sentence; none is a trap):
   - Fixed: **Jin:** "You had a list of names. I wasn't on it. Nobody asked me."
   - Then one of (only those the player has the evidence for are shown):
     - "Nobody asked my mother. She was hemming a blazer for an interview when the house burned."
     - "Min asked you. Eleven times. You wrote 'not now.'"
     - (`read_all_letters`) "She said she was going to stop waiting. She'd decided she was allowed. You hadn't decided anything. You'd decided 'not now.'"
     - "You paid for the best bed in Calder and took my name off it."
   - **Rook** doesn't argue. "No. Nobody asked you." (beat) "And nobody asked the Kaczmareks if they wanted to be saved with you. I did all the asking and all the answering. That was the job I took."
6. **The financiers.** **Rook:** "Do you know what our share was? Eleven percent. Eleven. The rest went across the river into a tower. I bought two hundred and twelve homes with the change from your life, and the men who made the bet bought a skyline." (Jin's thought, if the player has seen the tower from every window: *That tower again.*)
7. **The leash.** **Rook:** "And now they don't need the bet. They've got me. Every boiler, every roof, every payroll goes through Brannigan's window, because I couldn't put that money in a bank. That's the leash. On Tuesday Cal brought me a hundred letters on our letterhead for a co-op on South River I've never set foot in. Alder Row. 'Voluntary relocation.' They want our name on it because people trust our name. I said no on Tuesday. That was Cal on the stairs this morning. That was the second time I said no." (beat) "There'll be a third time. I don't know what I'll say."
8. **The next lead.** **Jin:** "Who's across the river?" **Rook:** "I never met the money. I met Brannigan, and Brannigan met someone. But Castell met them. Ray Castell wouldn't do it on Brannigan's word. He said he'd only take it from the money itself. Somebody went to his dressing room that night. Ask him who." (Flag lines: `accepted_rook_doctor`: "Did Anjali look after you? Good. That was real. I need one thing I did to have been real." / `mentioned_dutch_to_rook`: "You said his name in January. I knew then. I went to Harrisburg anyway.")
9. **Choice** (`truth_told_by`), asked plainly by Jin, no timer:
   - "Tell them yourself. Tonight." (`rook`, +1 rook) → **Rook:** "...Yes. Tonight. Seven. I'll call Hector."
   - "I'll tell them." (`jin`) → **Rook:** "That's your right." (beat) "I won't be there. I'm not brave enough to watch it land." (−1 courts at the assembly: the accusation happens without him.)
   - "I'll put it on their wall and let them read it." (`posted`) → **Rook:** "The laundry room board. That's where they read everything. Hector checks it on his way to the bus." (−1 courts.)
10. Letterbox off. Rook stays on the edge of the stage. When Jin leaves, the camera holds on Rook alone in the hall with the mural behind him for three seconds after the door closes.

### Scene 7.6 — How they find out
- **`rook`**: 7 p.m., the community room, rain on the steamed windows. Rook stands at the front without a podium and tells it in the same plain cadence, with the names. Jin is in the back row, by the door, beside the deed plaque.
- **`jin`**: Hector calls an emergency assembly when Jin asks. Jin stands at the front. The player chooses which three cards to hold up (the memo, the 1994 page, the CIVIC lines are suggested). Jin's lines are short; the residents' are not.
- **`posted`**: that night, the laundry room corkboard. Jin pins up photocopies (Kessler Drug copier, $2.10; or the originals). In the morning (Scene 7.8) the residents are gathered in the courtyard in the rain in front of the laundry door, and the reactions happen there, without a room, without Rook. Rook's Buick appears at the gate around nine and he doesn't get out.

### Scene 7.7 — The residents (reactions)
The scene plays in the community room (`rook`, `jin`) or the courtyard (`posted`). It is staged as a crowd the player can walk through after the first lines (control returns; each resident has their reaction as dialogue when approached, and barks to each other). The PDF's spread of reactions is fixed; the details move with flags:
- **Pauline** stands first: "Get out of my kid's building. Today. I'll carry your boxes." (To Rook, or, in `jin`/`posted`, to the empty space where he should be: "Where is he? Where is he right now?") She rejects him immediately and never takes it back.
- **Odette** doesn't stand: "He sat with me when Leon passed. Right there in that chair. Don't you tell me what kind of man he is. Tell me what kind of man he was that night." (beat, much quieter) "And that girl wrote eleven letters. Lord." She can't reconcile it and doesn't try in front of people. (`stayed_for_soup`: she looks at Jin: "You ate at my table. I don't know what to do with you either.")
- **Hector**, to Jin, not Rook: "My kid was born in 2B. If this goes to a courtroom, who holds the note? You?" (`showed_hector_print`: "I drove your mother. Every morning. Don't you think I don't know what that means. And I have a boy who's never slept anywhere else.") He's angry at Jin because he's afraid. If `returned_wage_envelope = none`, his treasurer's report is on the easel behind him: "Week of 1/20: maint. payroll lost (robbery), $640, covered by M. Kowalski (personal) and the Courts Fund." Mara looks at the line and then at Jin: "The robbery was January seventeenth. You were at Harlan Street." (−1 mara, −2 courts.) If `lockbox`: "And somebody put it back." She looks at him; he can say "Me." or nothing.
- **Deshawn** at the back wall: "Don't you dare make my grandma's roof a question." Variants: `towel_thrown`: "You threw the towel for me. And you'd take my grandma's roof?" / sent out: "You sent me out. Now you're sending everybody out." / `ortiz`: "You didn't come Friday. Now you come with *this*." He's angry out of fear; if deshawn ≥ 6, he adds, after a long time: "...I know it's not you that did it. I know. Give me a minute to stop knowing it."
- **Joanna Kaczmarek**, with the baby: "I begged him. In the parking lot. I'd beg him again. God forgive me, I'd beg him again."
- **Mrs. Mehta**: "He saved my home. I am old. I will not pretend otherwise."
- **Ray Esposito**: "So who's paying the boiler now?" **Ade**: "Does this mean no payroll again?"
- **Benny**, wearing his real gloves if `bought_kid_gloves`: "Is Mr. Rook in trouble?" Nobody answers him.
- **Mara**, last, when Jin reaches her (she's standing by the coffee urn, not drinking): "I'm not giving the roof back. I'm also not shaking his hand again. Both of those are true and I'll sort out how later." Variants: `told_mara`: "I asked Hector in February why our payroll came out of a freight window. He said, 'Don't ask, Mara.' I didn't." / `archive_key = asked`: "You asked me for a key once. I gave it to you. I wish I'd gone down with you." / `took`: "You took a key off my board. I'd have given it to you. I'd have gone with you."
- **In the `rook` variant only**, before he leaves: "I'm resigning as chair of this Council. Hector, you'll have the books by Monday. All of them. Including the ones I never showed you." **Hector:** "I don't want them." **Rook:** "Nobody does." He goes out into the rain without his umbrella.

Do-nots honored: no one says the houses aren't theirs, no document says the purchase was void, and the room is split, not ungrateful.

### Scene 7.8 — The night and the next morning
1. **Odette's chair** (optional). 1C, late. Odette by the window. The armchair. **Odette:** "That's his chair." **Jin:** "I know." **Odette:** "Sit. Somebody should." Sitting: the camera eases out to the window, the rain, Odette's violets. After a while: "I don't know what to do with you either. I'll pray on it. It'll take a while. I pray slow." (+1 odette, `sat_with_odette`.)
2. **Hector at the bus stop** (optional, `showed_hector_print`). In the rain with his thermos. He says nothing for a while, then: "Mrs. Sewing. I should've asked her name." The 14 comes. He gets on and drives.
3. **The loft question.** Mara at the bottom of the ladder. **Mara:** "You can stay. I'm not saying that because I want you here tonight. I'm saying it because I said you could in January." **Choice** (`left_courts_loft`):
   - Stay. → The loft for Chapters 8 and 9. Mornings in the courtyard are cooler for a while (barks become shorter; Deshawn stops saying "ex-champ"), and warmer later if relationships hold.
   - "I'll find a room." → Mrs. Okafor's rooming house on **Pier Street**, room 4 ($45/week, by the river, a narrow bed, a window on the water). The first thing Jin does is press the test button on the hallway smoke detector. It shrieks. Mrs. Okafor, from downstairs: "It works! Everything in my house works!" (Base for Ch8–9 and the Ending Two room.)
4. **The next morning**, either way, the courtyard: the chalk on Building B's wall, "WHO PAID FOR OUR ROOF?", "WE DID", "HE DID" with an arrow toward Tamika's blue man, half rubbed out by a wet shoe. Tamika is crouched redrawing the blue man with a nub of chalk. **Tamika:** "Somebody stepped on you." She doesn't look up. The player can crouch beside her (interaction): the two of them, small, in front of the wall.
5. Foundry Street: the HQ door has a new note in Pike's handwriting, though Pike is gone: "CLOSED UNTIL FURTHER NOTICE." (Someone else must have found his stationery.)

## Encounters

### 7A — The stairs and the hall balcony
- Cal Brannigan (`director`) + Joey and Frankie (`thug`). The fight starts on the stairwell landing and spills up into the second-floor corridor and out onto the hall balcony (a narrow walkway with a rail and a drop to the hall floor; folding chairs stacked as obstacles that break when an enemy is knocked into them).
- Teaches nothing new: a mastery check of the director rule (hit Cal first) in a vertical, narrow space where the dash's pass-through matters.
- `maxAttackers` 2. Checkpoint at the stairwell landing.
- After: Cal flees to the Lincoln (`flee`), Joey and Frankie limp after him. No questioning; Rook's doorway follows immediately, and the emotional material starts only after a deliberate hour of investigation.

There is no fight with Rook. Rook never raises a hand.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Who tells the residents | `truth_told_by` (`rook` / `jin` / `posted`) | Scene staging; `rook` +1 rook; `jin`/`posted` −1 courts | Ch9 night: if `rook`, he's on the HQ steps; if not, the HQ is dark and he's at Mount Hope in front of a different grave (Leon Baptiste's). Ch10: residents at Alder Row are more likely if `rook` (they don't feel ambushed). Ending Two: Rook testifies if rook ≥ 1. |
| Sit in Rook's chair with Odette | `sat_with_odette` | +1 odette | Ch9 night: Odette's window light, and she waves. Ending Two: Odette makes the soup at the Alder Row assembly hall. |
| Stay in the loft or move to Pier Street | `left_courts_loft` | Base | Ch8–9 base; Ending Two room is Pier Street room 4 if `left_courts_loft`, otherwise the loft. |

## Chapter ending beat and hand-off

Night, rain easing. Wherever Jin sleeps, he pins one more card on the wall (the loft board, or above the bed on Pier Street): an index card that says "CASTELL — WHO WENT TO HIS DRESSING ROOM?" The smoke detector's red light (if bought) blinks on the ceiling. Thought: *Eleven percent.*

Completion screen: the union hall's bulletin board with the red string across it. Summary lines from flags ("Rook told them himself." / "You told them." / "You pinned it to their wall." / "You sat in his chair."). State handed on: `ev_chain`, `ev_rook_admission`, `ev_alder_letters`; relationships reshaped (Deshawn and Hector cooler, Pauline firm, Odette undecided, Mara torn); base = loft or Pier Street. Map: Calder Civic Arena becomes enterable on the night of April 11 ("Teddy works nights"). Council HQ: "CLOSED UNTIL FURTHER NOTICE". Time card: "Five weeks later. April 11. The first warm night."

---

# Chapter 8 — The Man in the Other Corner

## Date, mood, palette, weather

Friday, April 11, 1997, 10:40 p.m. to about 2 a.m. The first warm night of the year: rain earlier in the evening, wet streets steaming, the smell of spring on the river. Mood: echo and dread, then purpose, then a terrible flatness. Palette: outside, the arena's loading dock under one security light, puddles holding orange; inside, the Ch0 arena exactly, but empty: the same yellow-striped corridor, the same fluorescent cool, and in the bowl the same four ring-light cones over the same ring, with the stands falling away into dark plum instead of crowd. The chapter's one color note that wasn't in 1994: Teddy's watch booth high in the stands, a small warm box with a space heater's orange glow.

## Gameplay identity

A return. The player walks the Chapter 0 arena again on foot with nobody in it, finds the places where things happened (the dressing room, the seats, the corner) and lets the building complete a memory. Then the major personal fight: a pattern boss the player has seen before, in the same ring, under the same lights, with the same bell, in a body that can win a short fight and nothing longer. Then a choice at the bell, and an aftermath that refuses to feel like winning. Share: exploration 25% · dialogue 25% · combat 40% · activities 5% (mitts with Teddy) · investigation 5%. Target 20 min.

## Locations

### `civic_dock_1997` — Calder Civic Arena loading dock (1400 x 360, exterior)
The same dock Teddy's wagon pulled into in 1994. Left to right: the street and a bus shelter (Route 3 owl service); the dock apron with puddles; two dumpsters; the dock wall with posters ("CALDER GOLDEN GLOVES · APRIL 19", "CASTELL vs. TBA · WORLD TITLE DEFENSE · JUNE 14 · TICKETS ON SALE NOW" with Ray's face, airbrushed); **Teddy's brown station wagon**, three years older, one hubcap gone; a white Lexus with a dented rear quarter parked crooked (Ray's); the steel dock door, propped with a brick (or not, see Scene 8.1). Lighting: one caged security light over the door, the street's sodium. Ambient: dripping gutters, a far siren, the river.

### `civic_backstage_1997` — Backstage (1900 x 360; the same geometry as `civic_arena_backstage_1994`)
Same corridor, same yellow stripe, same 1970s and 1980s fight posters, plus three new ones. The commission table folded against the wall with a chair upside down on it. A new glass display case: **"CALDER CIVIC ARENA HALL OF CHAMPIONS"**, and in it, a photograph of Ray with the belt over his head, captioned "AUG 20 1994 · CASTELL RETAINS · KO 3", and a pair of his white gloves. **Dressing Room 2**: the door has no tape on it now; inside, the same bench, six lockers (locker 6 still has a strip of old athletic tape that says "SEO" in Teddy's marker, half peeled), the bulb mirror with two bulbs out, the rubbing table, the high small window. The fluorescent tube outside Dressing Room 2 still flickers; nobody ever fixed it. **Dressing Room 1** ("CASTELL" placard, a gold star): Ray's gym bag on the bench, a radio playing low, a bottle of liniment, a picture of an older woman taped inside his locker door. The tunnel at the end.

### `civic_bowl_1997` — The bowl (1600 x 480; the same geometry as `civic_arena_bowl_1994`)
The ring is up for next week's Golden Gloves. At first only work lights are on (two cold cones from the catwalk; everything else dark). The timekeeper's table at ringside with the **1961 brass bell**. **Section 14, Row F**: the seats folded up, a program from some other night stuck under one. The **watch booth** high in the stands at the upper right (reached by stairs through the stands, a second vertical layer): a glassed box with a space heater, a radio tuned to a ballgame, a thermos, a bank of four black-and-white security monitors, a corkboard with a team photo ("MARSH B.C. · 1979" — a dozen kids and Teddy, and second from the left a skinny eleven-year-old with a fringe over his eyes), and on a hook, a zipped garment bag.

## NPCs present

| id | Where | Idle pose | Key lines / barks | Reactions to earlier choices |
|---|---|---|---|---|
| `teddy` | Watch booth; then the timekeeper's table; then Jin's corner | navy security uniform, flashlight, `armsCrossed` | "He comes at midnight. Shadowboxes an hour. Hits the bag till his knee gives. Then he sits on the apron with his head in his hands." / "If you two are doing this, you're doing it with a bell." / "That's the bell. That's the bell, Jin." | `teddy_stance = listened`: he called Jin and is waiting at the dock. `cold`: he finds Jin in Section 14 with a flashlight. teddy ≥ 3 changes his corner lines (warmer, more talk). |
| `oscar` | Dock (smoke break) | `smoke` | (`cold` path) "Teddy's guy. From lane seven. He's up in the booth. I didn't let you in." | Civic ops crew; seeded in Ch3. |
| `ray_castell` | Dressing Room 1 → the bowl | gray hoodie, wraps, a pale knee brace on the left knee; double glove tap | See Scene 8.5. | Varies with Jin's choices only after the bell. |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `title_poster_1997` | Poster | "CASTELL vs. TBA. They airbrushed him too. He looks like a man who sleeps." | — |
| `hall_case` | Display case | "HALL OF CHAMPIONS. AUG 20 1994. CASTELL RETAINS. KO 3. My worst night has a brass plate." | — |
| `locker_6` | Locker 6 | "SEO. Teddy's marker. Nobody took it off in three years." | — |
| `dr2_bench` | Bench (sit) | Sitting completes the memory. | `mem_orange_cup_full` |
| `dr2_tube` | Flickering light | "Still flickering. Nobody fixed it. It was flickering when he stood in the doorway." | — |
| `ray_bag` | Gym bag (Dressing Room 1) | Before the fight: "Ray's bag. Not mine to open." After: opens `ev_ambassador_contract`. | `ev_ambassador_contract` |
| `ray_locker_photo` | Photo in Ray's locker | "An older woman on a porch, squinting at the camera. 'MA — 1996 — THE NEW HOUSE.'" | — |
| `bell_1961` | Bell | "CALDER CIVIC ARENA 1961. There's a crack along the lip I never saw from the ring." | — |
| `section_14_seat` | Seat F-? (sit) | Sitting: the memory of Mom with the program in both hands and Min's cardboard sign, in the memory filter, crowd sound faint; then the empty seats again. | (replays `mem_section_14`) |
| `marsh_1979_photo` | Team photo (booth) | "MARSH B.C. 1979. Second from the left. I was eleven. Teddy's got his hand on my head like he's keeping me from floating off." | — |
| `garment_bag` | Garment bag | Teddy's robe scene. | `accepted_robe` |
| `booth_monitors` | Monitors | "Four cameras. The dock. The corridor. The ring. An empty parking lot. He watches this building all night." | — |

## Quests

- **Main — "The Man in the Other Corner."** HUD steps: "The Civic. Teddy's building." → "Get inside." → "Walk it." → "Wait for him." → (fight) → "The bell." → "Sit down." Completion: Teddy's wagon. Reward: `mem_orange_cup_full`, `ev_ambassador_contract`, `ev_ray_statement` or `ev_penner_note`; map: Riverfront — Ashgrove Tower becomes enterable.
- **Optional — "Hands Up, Chin Down."** Mitts with Teddy in the ring before Ray arrives (`train_mitts`, top tier, raises mitts to 3 if not already). Teddy calls the same combinations as in Chapter 0, in the same order, and the player feels the difference: Jin's crosses don't make Teddy grunt any more; his slips are faster than they were in 1994. **Teddy:** "Hands up, chin down, mouth shut." (beat) "Two of those three you're still good at." (`mitts_with_teddy`, +1 teddy.)
- **Optional — "The Robe."** The garment bag (Scene 8.4).

## Scripted scenes

### Scene 8.1 — The dock
1. Card: "Five weeks later · Friday, April 11, 1997 · The first warm night". The owl bus drops Jin across the street. **Camera**: the same angle as the 1994 wagon arrival, but on foot and from across the street; a slow push across the wet road to the dock.
2. `teddy_stance = listened`: the dock door is propped with a brick and Teddy is in it, flashlight off, in his uniform. **Teddy:** "He comes at midnight. Shadowboxes an hour. Hits the bag till his knee gives. Then he sits on the apron with his head in his hands, and then he goes home to a house full of people who need him to be champion." (beat) "You're early. Good. Walk it first."
3. `teddy_stance = cold`: the door is shut. Oscar, smoking under the light: "Teddy's guy. From lane seven." He looks at the door, at Jin, and kicks the brick into place. "He's up in the booth. I didn't let you in." The player enters alone.

### Scene 8.2 — The corridor
1. **Camera** trucks along the corridor with Jin exactly as it trucked with Teddy, Jin and Lenny in Chapter 0 (same speed, same posters sliding past), but he's alone and the sound is only his shoes and the flickering tube.
2. The Hall of Champions case. The folded commission table.
3. **Dressing Room 2.** The flicker in the doorway. Sitting on the bench completes the memory: **`mem_orange_cup_full`**, in the memory filter, now without interruption: Lenny's hand with the pinky ring holding out the paper cup, "Teddy's mix, kid," Jin drinking, and in the doorway behind Lenny, half lit by the flickering tube, a camel coat, still, watching him finish it. The man nods once, as if a delivery has been signed for, and steps back out of the light. Back to 1997: the empty doorway, flickering. Thought: *He stayed to watch me drink it.*
4. Locker 6 with its tape. Dressing Room 1 has a light on and a radio; Ray isn't here yet. His bag is on the bench (not openable yet).

### Scene 8.3 — The bowl
1. The tunnel opens into the dark bowl. **Camera** pulls out exactly as it did on the 1994 walk-out, but the bowl is black and silent, two work lights on the ring, Jin's footsteps echoing.
2. The player can climb to Section 14 Row F and sit (the memory replays, faint crowd, Mom's hands, Min's sign; then empty seats). They can stand in the blue corner. They can touch the bell.
3. Teddy (`listened`) is waiting in the booth; or (`cold`) a flashlight beam finds Jin in Section 14: **Teddy:** "Building's closed, pal—" The beam holds on Jin's face. It lowers. "...Jin."

### Scene 8.4 — Teddy and the robe
The booth. The heater. The ballgame on the radio, low.
1. If the player has `ev_headstone_ledger`: **Jin:** "You paid for the stone." **Teddy:** "Ferris has a big mouth." (beat) "I couldn't give her back her son. I could give her a rock with her name spelled right."
2. Teddy unzips the garment bag. The navy robe with SEO across the back in off-white, and folded inside it the oxblood gloves from 1994. **Teddy:** "You left it in Dressing Room 2. I took it home. I meant to bring it to your mother. I got to the stairs on Kessler twice. Both times I stood on the stoop until the light came on in 3B, and I went home."
3. **Choice** (`accepted_robe`): take the robe (+1 teddy) / "Keep it. You earned that one." (Teddy zips the bag shut very carefully. No meter change.)
4. Teddy looks at Jin's hands. The knuckles. **Teddy:** "Not in my ring with those." He holds out the gloves. **Choice** (`fought_ray_bare`; the flag name means "without the knuckles"):
   - Take off the knuckles; put on the 1994 gloves. → Teddy laces them himself, the way he did in 1994, and slaps the left one twice when he's done. Jin's damage and stagger drop back to his own (the knuckles' bonus is gone); the fight is harder and honest.
   - Keep the knuckles. → **Teddy:** "Then it's not boxing. Then it's whatever you want to call it." He doesn't argue. He takes the gloves back to the booth.
5. Optional mitts in the ring with Teddy (`mitts_with_teddy`). The ring lights are still off; Teddy turns on one.

### Scene 8.5 — The man in the other corner
1. Midnight. Teddy goes down to the timekeeper's table and throws the switches. The four ring lights come on one at a time with the same heavy *chunk* as in 1994; the cones are exactly the Chapter 0 cones. Jin is in the blue corner.
2. The tunnel. Ray walks out in his gray hoodie with his hands wrapped, rolling his neck, and stops at the edge of the light when he sees who's in the ring. He taps his wraps together twice. **Camera**: the 1994 ring-introduction framing, the two corners, empty stands behind.
3. **Ray:** "Seo." (beat) "I wondered when."
4. **Jin:** "You knew."
5. **Ray:** "I looked at the ref. He looked at the clock. So I threw it." (beat) "You'd have thrown it."
6. **Jin:** "Would I."
7. **Ray:** "You don't know. You were never champion. You don't know what it costs to stay one. My mother's house. My trainer's mortgage. Two cousins on salary. Twelve people eat if I win. You know how many eat if I lose? None. Not even me." He climbs through the ropes into the red corner. "I saw your eyes in the second. You weren't looking at anything. I saw your hands drop in the third. Everybody in that building knew. The ref knew. Your own corner knew, and sent you out." (He looks up at Teddy at the table. Teddy doesn't look away.) "You came to me because I'm the one you can hit."
8. **Jin:** "I came to you because you know who said 'the fourth.'"
9. Ray's glove tap stops halfway. **Ray:** "I'm defending in June. If I give you a name, I don't have June." (beat) "You want it, take it out of me. That's the only way I've ever given anybody anything."
10. **Teddy**, at the table, his hand on the 1961 bell: "If you two are doing this, you're doing it with a bell." He rings it once. The sound is the Chapter 0 bell, exactly: bright, slightly cracked. Jin's thought: *That bell.*

## Encounters

### Boss — Ray Castell (BoutDef `bout_ch8`, unsanctioned)
- **Ring:** the Chapter 0 ring and coordinates. Teddy at the timekeeper's table rings each round and then comes to the blue corner between rounds (he works Jin's corner).
- **Rounds:** 3 × 60 s. Jin's breath is the real opponent: it refills only partly between rounds, and by round 3 his max breath is reduced (his body, not sabotage).
- **Ray (`champion`, `patternSet: 'ch8'`):** every Chapter 0 pattern, now readable because the player has seen them and now has the tools to answer:
  - Double jab → answer: slip the second, counter-cross.
  - Right hand, telegraphed by a back-foot step → answer: slip and counter, or backdash and return with a dash straight.
  - Body hook combo (left-left) → answer: backdash out of the second, hook as he resets.
  - Lean-back counter (punishes a lazy single cross) → answer: don't throw the lazy cross; jab–cross–hook instead, or feint with a jab and go to the body.
  - **The tell:** Ray taps his gloves together twice before every committed exchange (the 1994 habit the player could have learned in Ch0). Spotting it is the single most useful thing in the fight.
  - **1997 additions:** his braced left knee makes him slow to turn toward his left (circling to Jin's right resets him for a beat); a clinch when his breath is low (break it with an uppercut inside); and below 30% a desperate flurry with no tell at all (slip it or eat it).
- **Corner between rounds** (the Chapter 0 echo, inverted). Camera tight on the blue corner, the same framing. **Teddy:** "How do you feel?" **Jin:** "Tired." **Teddy:** "Tired I can work with. Anything else, you say it, and I stop it. I'll stop it this time." (Round 2 break, if teddy ≥ 3: "He's waiting on your jab. Give him the jab and then don't be there." — the same line as 1994.) If Jin's condition is very low going into round 3, a choice appears on the stool: "I'm fine." / "Something's wrong." — "Something's wrong" makes Teddy stop the fight on the spot ("That's it. That's it, Ray, we're done.") and Ray, breathing hard, says the name anyway, because a corner stopping a fight for its fighter is the one thing he can't argue with (counts as `ray_spared`; Ray: "...Your corner stopped it. Huh." He sits down on the canvas.) This is not the expected path; it exists so the player is never trapped in the fight the way Jin was in 1994.
- **The end of the fight.** When Ray's guard breaks (HP floor), he's on the ropes in the **blue corner**, the same corner where Jin fell, and his hands drop to his waist and stay there (the 1994 warning sign, in the other man's body). Slow motion 0.5×, letterbox. Teddy rings the bell. And keeps ringing it. **Teddy:** "That's the bell. That's the bell, Jin."
- **Checkpoint** at the start of each round; a loss restarts the round with Teddy's line ("Again. You know him. You've known him for three years.").

### The bell (the choice)
Control stays with the player while the bell rings. One small diegetic glyph appears after two seconds over Jin: "Step back". Nothing else.
- **Step back, drop the hands, or simply don't punch for three seconds** → `ray_spared`. The bell stops. **Teddy** lets go of the hammer and puts both hands flat on the table.
- **Punch** → each punch lands on a defenseless man with the wrong sound (no spark, no hit-stop, muffled), and the bell keeps ringing under it. After the third, Teddy is through the ropes, an arm across Jin's chest, pulling him back: "JIN!" → `ray_beaten_past_bell`.
The game names neither outcome; the flags change only lines, relationships and Ray's later availability (PDF: not a hidden morality score).

## Scripted scenes (continued)

### Scene 8.6 — After
**If `ray_spared`:** Ray slides down the corner post to sit on the canvas. A long time breathing. Then, without being asked:
- **Ray:** "Penner. Lyle Penner. Ashgrove Capital. He came to my dressing room himself at the end of the second. Not the coat. The coat works for him. Penner. He said, 'He'll be slow by the third. If he's still standing in the fourth, end it. Don't let it go to the cards.'" (beat) "I ended it in the third because I could."
- **Ray:** "There's a contract in my bag. Read it. I'm cutting a ribbon on May thirtieth for the people who paid for your legs. Forty thousand dollars to hold a pair of scissors." (`ev_ray_statement`.)
- **Ray:** "I'll say it. To whoever. If you want. I don't know what that costs yet." He looks at the empty seats. "Probably June."
**If `ray_beaten_past_bell`:** Ray isn't able to talk. Teddy, kneeling by him, doesn't look at Jin: "Get out of my ring." (beat, quieter) "...Go sit down. Not in my ring." He goes up to the booth to call an ambulance. Ray's gym bag in Dressing Room 1 is where it was; in the wallet inside, a folded square of heavy cream notepaper, engraved "ASHGROVE CAPITAL", with "4th — L.P." in fountain pen (`ev_penner_note`).
**Either way:** the bag in Dressing Room 1: `ev_ambassador_contract` — "COMMUNITY AMBASSADOR AGREEMENT between Ashgrove Capital, L.P., and Raymond Castell. Appearance fee: $40,000, payable upon the Ambassador's participation in the groundbreaking ceremony for ALDER COMMONS, to follow the closing of the Alder Row Cooperative acquisition (scheduled May 30, 1997). Signed: Lyle Penner, Managing Director." Thought: *Alder Row.* (If the player has `ev_alder_letters`: *Cal's letters. Voluntary relocation.*)

### Scene 8.7 — No restoration
1. Jin sits on the blue corner's stool (or the apron, if Teddy has taken the stool away). The ring lights stay on. **Camera**: a very slow zoom out, the ring shrinking until it's a lit square in a black bowl, and then a slow pan up through the dark stands to Section 14, Row F, where a stray work light shows two empty folded seats.
2. No music. The building's hum. Thoughts, one at a time, only while the player stays seated (the player can stand at any point, and the thoughts stop):
   - *I won.*
   - *They're still dead.*
   - *Two years. Still gone.*
   - (`ray_beaten_past_bell`) *I kept going after the bell. Like they did.*
   - (`ray_spared`) *I stopped at the bell. Nobody stopped it for me. It doesn't give anything back.*
3. Standing up: the first attempt fails ("Legs won't."); Jin's walk is a limp for the rest of the night. If `ray_spared` or teddy ≥ 3, Teddy comes down and puts a hand under his arm. Otherwise Oscar does, wordlessly, from the tunnel.

### Scene 8.8 — The wagon
The dock. Teddy's brown wagon (Teddy drives; if he's with the ambulance after `ray_beaten_past_bell`, Oscar drives the wagon with Teddy's permission and says nothing the whole way). The wagon's interior at night, the same seat Jin sat in on the way to the arena in 1994.
- `ray_spared`: **Teddy:** "You stopped at the bell." (beat) "That's more than I did." Long silence. "Your mother told me once she didn't watch the punches. She watched your feet." **Jin:** "When my feet are happy, she's happy." **Teddy:** "Yeah. That."
- `ray_beaten_past_bell`: Oscar drives. Nobody speaks. At a red light, Oscar turns the radio on, then off again.
- If `accepted_robe`, the garment bag is on the back seat.
The wagon drops him at the Courts gate or Pier Street.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Take the robe | `accepted_robe` | +1 teddy | Ending Two: the robe hangs on the back of the rented room's door; Ending One: Ashgrove's PR people want to use it for the comeback ("The original robe! It's a story!") and Jin says no or yes (a small epilogue line). |
| Mitts with Teddy | `mitts_with_teddy` | +1 teddy, mitts 3 | Ending Two epilogue: Teddy and Jin hold mitts for kids. |
| Fight without the knuckles | `fought_ray_bare` | Harder fight | Teddy: "You fought him like a boxer." Ch10: Jin can choose to leave the knuckles in a drawer before Alder Row (a line, not a mechanic). |
| Stop at the bell / continue | `ray_spared` / `ray_beaten_past_bell` | Ray talks / Ray can't; Teddy's reaction (+2 / −2 teddy) | Ending Two: Ray testifies if spared; if beaten, he retreats behind lawyers and the note stands alone. Ch9: Penner knows which ("You stopped. Interesting." / "You didn't stop. We noticed that too."). Ch9 night: Teddy's line. Jin's later self-talk follows the flag. |

## Chapter ending beat and hand-off

Morning light in the loft or the Pier Street room; the contract on the crate or the bed; the index card "CASTELL — WHO WENT TO HIS DRESSING ROOM?" gets a new line in pencil: "PENNER. ASHGROVE. ALDER ROW — MAY 30." Jin's hands, wrapped in tape that Teddy put on, shaking slightly when he lifts the pencil. Completion screen: the empty bowl with the ring lit, viewed from Section 14. Summary lines from flags ("You stopped at the bell." / "You kept going after the bell." / "You wore your own gloves."). State handed on: `ev_ambassador_contract`, `ev_ray_statement` or `ev_penner_note`, `mem_orange_cup_full`; teddy meter moved; Jin's body: a rest period. Map: Riverfront — Ashgrove Tower ("31st floor: Ashgrove Capital") unlocks; "South River — Alder Row" appears as a gray node: "Closing May 30". Time card: "Six weeks. Thursday, May 22."

---

# Chapter 9 — The Offer

## Date, mood, palette, weather

Thursday, May 22, 1997, 5:30 p.m. to sunset at Ashgrove Tower; then the week, May 23 to the night of May 29, across all of Calder. Mood: first the hush of money (carpet, glass, nobody raising their voice); then a warm, ordinary late-spring week in which every place the player has been is open and lived in, and Jin carries a piece of paper through all of it. Palette: the tower is the only place in the game without brown brick or amber streetlight: pale stone, brushed steel, white glass, soft indirect gold light, and through every window the city below as small amber points. The boardroom at sunset is orange and long-shadowed. The week is Calder in late May: green trees on Kessler, open windows, people on stoops, the river smelling of spring, warm amber at night with the first moths around the streetlights. Weather: clear Thursday; a warm rain Sunday night; clear and mild to the end.

## Gameplay identity

Two halves. **The ascent** is the last structured assault: three floors of polished security in spaces built to look like nobody gets hurt in them, ending in the longest conversation in the game, with documents on the table and time to read them. **The week** is the game's MapleStory finale: an open hub of every unlocked place in Calder, where the player can visit the people they've met, see how each place has changed, make copies of the evidence and decide who to give them to, and sit with the offer. Nothing in the week is required; nothing in it is lost by doing it; the week ends only when the player chooses to sleep on the last night. Share: exploration 35% · dialogue 35% · combat 20% · investigation 5% · activities 5%. Target 25 min (the week is player-paced; a player who goes straight to bed finishes in 12).

## Locations

### `ashgrove_plaza` — Ashgrove Plaza, Riverfront (1400 x 360, exterior)
Left to right: the river walk railing; a **working fountain** (Foundry Courts' fountain is a dry sandbox); a steel sculpture "CONVERGENCE"; tulip planters; a sign on an easel "ALDER COMMONS · COMING 1998 · A PROJECT OF ASHGROVE CAPITAL" with a watercolor rendering of glass townhouses and a café; the tower's base of pale stone and glass; the revolving door; a uniformed doorman. Background, across the river: the Northside, the foundry stack (the reverse of every view the player has had of the tower), the Civic Arena dome, the Courts as a cluster of roofs. Lighting: late afternoon, warm and clean; no sodium.

### `ashgrove_lobby` — Lobby (1800 x 480, three-story atrium)
A marble floor that reflects everything in broken horizontal streaks; a water wall; a long reception desk with two receptionists; security turnstiles; the elevator bank (31 requires a key card: "Express to 31. Card only."); a donor wall, "ASHGROVE FAMILY FOUNDATION · GIVING BACK TO CALDER", listing grants in brass, among them "Northside Community Council — Tenant Rights Clinic — $5,000 (1995)"; leather benches no one sits on. A night cleaner, Mrs. Paz, with her cart by the service door. Ambient: the water wall, a soft chime, heels on marble.

### `ashgrove_30` — 30th floor: mailroom and security (1600 x 360)
Mail carts; pigeonholes; a security office with a wall of monitors (tower cameras, and on one monitor a still photograph of Jin outside Starlite Lanes, part of the file being kept on him); a file room labeled "SPECIAL PROJECTS"; a fire stair up to 31 (the service elevator stops here).

### `ashgrove_31` — 31st floor corridor, reception and offices (1800 x 360)
Thick carpet that swallows footsteps; abstract paintings; framed renderings of Ashgrove projects ("RIVERSIDE LOFTS 1995", "ASHGROVE TOWER 1996", "ALDER COMMONS 1998"); glass-walled offices, empty at this hour; **Penner's office** (jacket on the chair, sleeves-rolled habit visible in a second shirt hanging on the door, a desk covered in closing documents, a Calder Steelhawks pennant, a photo of a sailboat); the **reception room** (a white desk, a receptionist who keeps typing, two guards, a water cooler with glass cups instead of paper cones); the boardroom's double doors.

### `ashgrove_boardroom` — Boardroom (1200 x 360)
A long pale table; a floor-to-ceiling window over Calder at sunset (the Northside, the river, Kessler Avenue's water tanks, the stack); on a side table, the **architectural model** of Alder Commons, with a small clear plastic overlay of the existing Alder Row buildings that lifts off; water in carafes; the dossier and the terms sheet on the table.

### The week: every unlocked place, in late May
All map nodes are open for fast travel. Places changed since the player last saw them (each is a short visit with one or two people and one or two changed details):

| Place | What changed | Who's there (and when) |
|---|---|---|
| Kessler Avenue | Trees in leaf; Sun's door propped open; the poster wall has a new top layer, "ALDER COMMONS · LIVE WHERE CALDER IS GOING"; Darnell (13) sitting on the laundromat step. If `saw_height_marks`: Luz Alvarez invites Jin in; beside "JIN 8" there's a new pencil line, "ROSIE 1997". | Mrs. Sun closing up (night); Darnell (evening); Luz and Rosie (evening, if `saw_height_marks`). |
| St. Agnes | A "Patient Rights" poster at the front desk that Hana put up; Earl's bed (214) has fresh flowers and a postcard from Florida (he went to his daughter's); the lighthouse puzzle still taped on the day-room wall. | Hana in her office after her shift (night), a box of copies on her desk; Dolores; Grace Ito. |
| Calder YMCA | Room 312 is rented to Luis Ocasio (`luis_outcome` changes him). | Gus; Luis (evening). |
| Starlite Lanes & the Cellar | League-night posters; the record wall has "EASTGATE 3-0" and, if Jin worked the corner, "corner: J. SEO". | Mo at the bar counting receipts (night); Slim in the warm-up room teaching a teenager (evening). |
| Foundry Courts | Leaves on the one tree; laundry on the lines again; the chalk on B's wall washed out by rain except "WHO PAID"; Tamika's blue man redrawn bigger; Benny's gloves. | Mara on the workshop step at night; Deshawn in the gym wrapping Benny's hands (evening); Odette at her window, light on; Hector leaving for the 14. |
| Council HQ | If `truth_told_by = rook`: Rook on the steps at night. Otherwise dark, "CLOSED UNTIL FURTHER NOTICE". | Rook (night, conditional). |
| Garrison Street | A "SOLD" sign on Lindell House's fence: "SOLD · RIVERSIDE HOLDINGS". Fresh candles at the fence if `left_flowers` (someone else keeps them lit). | Father Nowak on the church steps (evening). |
| City Hall Annex | — | Yvette ("Seo, with an S-E-O."). |
| Greyhound station | — | Lenny on a bench with a ticket he doesn't use (night, only if not `threatened_lenny`). |
| Calder Civic Arena | "CASTELL vs. TBA" poster now says "POSTPONED". | Teddy at the loading dock, smoking (night); Ray in the ring alone (night, only if `ray_spared`). |
| Mount Hope | Gates close at dusk; the player can sit outside the gate on the wall. | — |
| Pier Street (if `left_courts_loft`) | Mrs. Okafor's lilac in bloom. | Mrs. Okafor. |
| Kessler Drug | The copier. | Dale. |
| Alder Row | Locked: "You've never been there. The first time you go, you'll go with them, whatever you mean to do when you get there." | — |

## NPCs present (the ascent)

| id | Where | Idle pose | Key lines / barks | Reactions |
|---|---|---|---|---|
| `doorman` | Revolving door | `armsCrossed` | "Delivery entrance is around the side, sir." | — |
| `mrs_paz` (night cleaner) | Lobby service door, then the 31st floor | `sweep` with a cart | "I clean. I don't see." | Never hostile (the tower's Dot). |
| `security_supervisor` | Lobby, radio | `point` | "Lobby to thirty. We have the boxer." | Director archetype; carries the key card. |
| `kale` (head of tower security, ex-pro) | 30th floor | `guard` stance | "I fought on your undercard in '93. You won. I'm not sentimental about it." | `trained` archetype (mastery check). |
| `receptionist_31` | Reception, typing | `write` | (after the reception fight, still typing) "Mr. Seo. They're expecting you. Can I get you a water?" | — |
| `camel_coat` | Boardroom doorway | still, half lit | "Mr. Seo. Same advice as last time. The terms are better." | `refusal_tone` callback. |
| `celeste_ashgrove` | At the window; at the model | hands folded; one fingertip on a model building | See Scene 9.3. | — |
| `lyle_penner` | Edge of the table | sleeves rolled, pen tapping | See Scene 9.3. | Dossier lines from many flags. |

## Interactables

| id | Label | Examine text | Unlocks |
|---|---|---|---|
| `alder_easel` | Rendering | "ALDER COMMONS. Glass townhouses and a café with umbrellas. There's nobody in the drawing who looks like they live there." | — |
| `donor_wall` | Donor wall | "Northside Community Council — Tenant Rights Clinic — $5,000 (1995). Eleven percent of my life, and five thousand dollars for a clinic." | — |
| `monitor_photo` | Monitor | "Me. Outside Starlite Lanes. January. Somebody was across the lot with a camera while I was looking for Lenny." | — |
| `penner_desk` | Desk | Opens `ev_project_alder`. | `ev_project_alder` |
| `glass_cups` | Water cooler | "Glass cups. Up here they don't use paper." | — |
| `alder_model` | Model | "Alder Row, under a clear plastic cover: four old buildings, thirty-eight units, a courtyard, a shoe-repair shop on the corner. Lift the cover off and it's Alder Commons." (The player can lift the overlay and put it back.) | — |
| `dossier` | Dossier | See `ev_dossier` and Penner's lines. | `ev_dossier` |
| `terms_sheet` | Terms | See `ev_terms_sheet`. Jin keeps it. | `ev_terms_sheet` |
| `kessler_copier` | Copier (Kessler Drug, the week) | "Copies, 10¢ a page. A full set of everything is sixty-four pages." ($6.40 per set; if Jin can't pay, Dale: "Machine's broken tonight. It's broken free.") | Copy sets for `copies_given` |

## Quests

- **Main — "The Offer."** HUD steps: "Ashgrove Tower. 31st floor." → "Get upstairs." → "The boardroom." → (the offer) → "Alder Row, May 30, 5 a.m. You have until then." → "Sleep on it." Completion: the last night's sit. Reward: `ev_terms_sheet`, `ev_dossier`, `ev_project_alder`.
- **Optional — "Copies."** Objective after the offer: "People outside the tower should have copies." Hana already has a full set (she always has; she said so in Chapter 1). Kessler Drug copier, then give sets to any of: Mara, Teddy, Father Nowak, Mrs. Sun, Lenny (if he's in town), Ray (if `ray_spared`). Each gift is a short scene and adds to `copies_given`.
- **Optional — "The Week."** No objective text; the journal's People page shows a small open-door icon beside everyone who can be visited this week, and the icon closes after a visit. Visiting sets members of `ch9_visits`.
- **Optional — "Is It Later Yet?"** Darnell on the laundromat step (only if Ch2's Darnell conversation happened).

## Scripted scenes

### Scene 9.1 — The plaza (Thursday, 5:30 p.m.)
1. Card: "Six weeks later · Thursday, May 22, 1997 · Riverfront". **Camera**: begins on the Northside from across the river (the stack, the Courts' roofs), and pans right across the water and up the full height of Ashgrove Tower, the reverse of every shot in the game where the tower stood in the background. Settles on Jin at the fountain.
2. The easel; the doorman's line. Thought at the revolving door: *Every window in this city looked at this building. Now I'm in it.*

### Scene 9.2 — The ascent (Encounters 9A–9C)
Lobby fight → supervisor's key card → service elevator (a short ride: muffled Muzak, the floor numbers counting, Jin's reflection in the brushed steel, breathing) → 30th floor → fire stair → 31st floor reception. After the reception fight, the receptionist hasn't stopped typing. **Receptionist:** "Mr. Seo. They're expecting you. Can I get you a water?" **Jin:** "No." Penner's office is open on the way (`ev_project_alder`).

### Scene 9.3 — The offer
1. The double doors open before Jin touches them. The camel coat is in the doorway, half in the boardroom's sunset light, half in the corridor's. **Coat:** "Mr. Seo. Same advice as last time. The terms are better." By `refusal_tone`: `angry` → "You said 'Get out.' I've thought about that." / `flat` → "You said, 'Tell whoever sent you I said no.' I told him." / `silent` → "You didn't say anything. I respected that. I'll respect it again." He steps aside and does not come in. He stays in the doorway for the whole scene.
2. Letterbox on. **Camera**: wide, the long table running left to right, the window behind it full of Calder at sunset; Celeste at the window with her back half turned; Penner sitting on the table's edge with his sleeves rolled.
3. **Celeste:** "I've read everything you've done, Mr. Seo. It's a remarkable file." (She turns.) "Please. Sit or don't. Most people stand the first time."
4. **The dossier** (`ev_dossier`) is open on the table. The player can examine it page by page while Penner talks; each page triggers his line:
   - Photos at Starlite, at Foundry Courts carrying a radiator, on the Annex steps.
   - The AMA form. (`signed_real_name`) **Penner:** "'Seo Jin.' On a form, in front of witnesses. That's when we started paying attention." (else) "You signed 'Daniel Ahn.' We liked that. It didn't last."
   - Marty's incident report. **Penner:** "'A large, violent intruder.' You're not large. Marty is very small."
   - (`took_depot_profit`) **Penner:** "You took our money at Harlan Street. Good. We understand people who take money." (`took_wage_envelope`) "And the other envelope. Less good, from a public-relations standpoint."
   - (`ray_spared`) "You stopped at the bell. Interesting." / (`ray_beaten_past_bell`) "You didn't stop. We noticed that too. So will a commission, if we're not careful. We'll be careful."
   - Hana's complaint letter. **Penner:** "Ms. Lim. Very thorough. She'll be fine, if you are."
   - Copies of Min's letters, from the Council's archive. **Penner:** "Pike made copies of everything. You wanted to pay your family's rent with your purse." (by `purse_wish`: "...the rent." / "...fix a radiator." / "...pay your sister's tuition.") "We read that too. We read everything. It's the job."
5. **Penner:** "Nobody in this building hurt you. We priced a risk." (beat) "Now we'd like to price an opportunity."
6. **The terms** (`ev_terms_sheet`), slid across the table, readable in the viewer:
   > TERMS · Prepared for Mr. Jin Seo · May 22, 1997
   > 1. Treatment: Hollis Neurorehabilitation, Boston. 18-month inpatient program, all costs paid. (Admission letter attached, issued in the name SEO, JIN.)
   > 2. Housing: Riverside Lofts, Unit 9C, furnished, three years.
   > 3. Income: $2,000 per month, three years.
   > 4. Name: Petition In re SEO, JIN, formerly recorded as AHN, DANIEL, already filed with the Calder County Court; hearing June 3.
   > 5. Career: three tune-up bouts, 1998; a title eliminator at Calder Civic Arena; the championship route to be arranged.
   > In consideration of: Mr. Seo's presence and assistance at the Alder Row Cooperative, 5:00 a.m., May 30, 1997, and his public participation in the Alder Commons groundbreaking.
   Jin's thought at item 1, if `ev_mehta_assessment` or Hana told him: *Hollis. The number I wasn't supposed to look at.* At item 4: *My name. Hana's been trying to get it back with forms for six months. They did it with a phone call.*
7. **Why him** (Penner, unprompted): "Alder Row is thirty-eight units. Thirty-one households have taken relocation assistance. Seven are holding out, and on Monday they chained the main entrance. Mr. Brannigan's people will be there at five a.m. on the thirtieth. If they go in alone, the news runs pictures of men with bolt cutters. If you're with them — Calder's own, the boxer this city robbed, standing at that door saying it's time — it ends in ten minutes and nobody films it. And then you're on a poster again." (beat) "A good one this time."
8. **Celeste** walks to the model and rests one fingertip on the corner building (the shoe-repair shop). "Somebody always moves, Mr. Seo. The only question a city ever answers is who, and whether they're helped." (beat) "We can't give you 1994. We can give you 1998."
9. **Jin's questions** (any order, all optional, all answered straight; no option is misleading):
   - "Why should I believe any of this?" → **Penner** turns two pages: the court's filing stamp on the name petition; the Hollis admission letter on its letterhead. "We don't promise things we don't do. It's bad for business. Everything on that page is real, Mr. Seo, and it'll stay real."
   - "What happens to them?" → **Celeste:** "Relocation assistance. Twelve hundred dollars per household and a list of available units. It's more than the law requires."
   - "And if I say no?" → **Penner:** "Then you go home to a rooming house, and we close on the thirtieth anyway, a little louder. You can't stop a closing by punching it."
   - "People have copies of everything." → **Penner:** "I know. Ms. Lim has a box. The Kowalski woman has a key. A priest has an envelope." (He knows about whatever `copies_given` already holds.) "Copies are paper. Paper needs people willing to stand behind it in a room for a year. You'd have to be one of them. You'd have to be poor for that whole year, and the year after." (This is the PDF's "exposing them is possible, but it requires rejecting the deal and cooperating with others," said by the man who would lose.)
   - "Why me? You've got Castell." → **Penner:** "Mr. Castell has become... unavailable." (If `ray_spared`, Jin understands why.)
10. **Penner** stands, finally. "You don't answer tonight. Nobody serious answers tonight. Be at Alder Row at five a.m. on the thirtieth with Mr. Brannigan's people, or don't. Either way, we'll know your answer." **Celeste** hands Jin the terms sheet herself, the only time she comes within arm's length.
11. Letterbox off. The camel coat walks ahead of Jin to the elevator, holds the door, and doesn't get in. **Coat:** "It's practical advice, Mr. Seo. It always was." The doors close on him in the corridor light.

There is no fight after the offer. The elevator goes down without stopping; the lobby is quiet; Mrs. Paz is mopping where the fight was and doesn't look up.

### Scene 9.4 — The week (hub)
The card: "Alder Row closing: Friday, May 30, 5 a.m. You have until then." The base (loft or Pier Street) is the hub. Each visit below is optional, short, and has the person's honest view of the offer (the PDF's different perspectives, given as people rather than as a debate). No one tells Jin what to do in a way that settles it.
- **Hana** (St. Agnes office, after her shift; box of copies on the desk): "They'd give you your name back with a phone call. I've been trying to do it with forms since December." (beat) "I can't tell you what to do. I can tell you I'll still be here doing forms." If `told_hana_early`: "You told me who you were on the first day. You don't need them to tell you." Earl's postcard (if `earl_crossword`), addressed "JIN SEO c/o ST. AGNES RM 214": "Seven letters, 'what you do when you've had enough': RETIRES. Ha. Come see the ocean. — Earl". Repaying the $40 (if not already): she crosses it out in her notebook.
- **Mara** (workshop step, a thermos): "If you take it, I won't hate you. I'll want to. I won't." (beat) "If you don't, you're still on my sheet. Fifteen a job." If mara ≥ 4: "And if you don't go with them — if you go and stand on the wrong side of that door — I'd come. I'd bring people. Some of them still owe you a radiator." (Ending Two support flag `mara_will_come`, set by this line being heard with mara ≥ 4.)
- **Deshawn** (gym, wrapping Benny's hands): "You'd get to fight again. For real. On TV." (long pause) "...I'd take it. I think I'd take it. Don't listen to me." If deshawn ≥ 4: "If you don't take it, Saturday class could use a second guy who can hold pads."
- **Odette** (window): she waves. If `sat_with_odette`, she comes down in her slippers with a jar of soup: "I prayed on you. It's not done yet. Eat this."
- **Teddy** (Civic dock, smoking): "Take it." (beat) "No. I don't know. I sent you out once for a title. Don't ask me about titles." If the robe wasn't taken, he offers it again.
- **Rook** (HQ steps, only if `truth_told_by = rook`): "They'll keep their word. That's the worst part. They always keep their word." (beat) "I said one time. You'll say one time. It's never one time." Otherwise his HQ is dark and Bernice has left a butterscotch on the step.
- **Mrs. Sun** (Sun's, closing up): she asks nothing. She sets a bowl down. "Whatever you decide, you eat first." If Jin tells her about the offer: "Your mother would have said take the money. Then she'd have cried in the kitchen for a week. Then she'd have said it again."
- **Mo** (Starlite bar): "Either way I'm selling tickets, kid. Seo Returns, or Seo Says No. Both fit on the marquee."
- **Slim** (Cellar warm-up room, teaching a kid): (`covered_slim_pay`) "You owe me nothing. I'm saying it first so you can't." Then: "I took a lot of second rounds. The money was real. So's the floor."
- **Lenny** (Greyhound bench, ticket in hand, only if not threatened): "I keep buying 'em. I keep not getting on." (beat) "If you're doing it — the court thing, the room for a year — I'll say what I said in the car. To a judge. Not if you're not. I'm not brave by myself."
- **Ray** (the Civic ring, alone, only if `ray_spared`): "Penner's people called. I'm 'unavailable' for the ribbon. They found somebody else." (looks at Jin) "Oh." (beat) "Cut it. I would." (beat) "No. I don't know what I'd do. I know what I did."
- **Luis** (YMCA 312): `paid`: "Told you I'd pay you back." (He does, $40.) `reported`: "Eighteen in June. Then you can't do nothing." `fought`: a cauliflower ear, a Cellar regular slot: "I'm 4-2 now. Mo calls me 'Kid Rent.'"
- **Darnell** (laundromat step): "Is it later yet?" → "Yes. I got robbed." (**Darnell:** "My mom was right. She's going to be so annoying about it.") / "Not yet." (**Darnell:** "Okay. I'll be here.") (`darnell_later`)
- **Luz and Rosie** (3B, if `saw_height_marks`): the new pencil line "ROSIE 1997" beside "JIN 8". **Luz:** "She asked whose names those were. I said a family who lived here before. She said, 'Then we live here after.'"
- **Father Nowak** (church steps): if given a copy: "I'll keep it with the palms. Nobody steals palms."
- **Copies** given to anyone above who can take one: a short handover line each, and the person's choice of hiding place (Mara: "Behind the bell pattern." Teddy: "In the booth, under the 1979 picture." Mrs. Sun: "With the kimchi. Nobody looks in the kimchi."). Each adds to `copies_given`.

### Scene 9.5 — The last night (May 29)
Choosing "Sleep on it" at the base (available from the first night) asks once: "This is the last night before Alder Row. Sleep?" (yes / not yet). Then:
1. The room at night. The terms sheet on the crate or the bed. The robe on the door (if `accepted_robe`). The smoke detector's red blink (if bought). The window: the stack (loft) or the river and, across it, the dark shape of South River where Alder Row is (Pier Street).
2. Sitting: the camera eases out; thoughts arrive one at a time and alternate, and the game never adds them up:
   - *Hollis. Eighteen months. My legs back. Most of them.*
   - *Thirty-eight doors. Seven of them chained.*
   - *My name on a court paper by June third.*
   - *Nobody asked me.*
   - *Nobody's asking them.*
   - *Min wanted a building with a roof that doesn't leak.*
   - *Somebody always moves.*
3. An alarm clock set for 4:00. Black. The sound of the alarm. Card: "May 30, 1997 · 4:40 a.m."

## Encounters

### 9A — The lobby
- 3 `guard` (batons, disciplined: they don't all swing at once; they hold a line and close it) + the `security_supervisor` (`director`, radio: while he's talking into it the guards' attacks come faster). Marble floor (no traction change, but every reflection doubles every telegraph, which reads beautifully and also makes it busy; the supervisor is the target). Mrs. Paz and the receptionists move away; the doorman locks the revolving door from outside and walks off.
- Teaches: nothing new; mastery of the director rule and slipping baton strikes.
- After: the supervisor's key card.

### 9B — The 30th floor
- Mailroom carts as moving obstacles (they roll when hit). 2 `guard` + **Kale** (`trained`): punishes repeated jabs, keeps distance, feints, changes his opening after a miss. "I fought on your undercard in '93. You won. I'm not sentimental about it."
- Teaches: the Chapter 3 lessons under Chapter 9 pressure, with the full toolkit.

### 9C — Reception
- 2 `guard` in a small, bright room with a glass wall; the receptionist keeps typing behind her desk throughout.
- After: no questioning. The boardroom doors.

Checkpoints at each floor. A loss returns to the start of that floor's fight ("Again. Same floor.").

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Who holds copies | `copies_given` (set; `hana` is always in it) | Hiding-place lines | Ending Two: each holder appears in the exposure epilogue doing their part (Hana's complaint becomes a state investigation; Mara opens the Council's books at the assembly; Teddy gives the robe and the stone receipt to a reporter; Nowak gives his to the District Attorney with Ortiz's letter; Mrs. Sun's copy is the one the reporter quotes; Lenny and Ray testify if they're holders and willing). Ending One: the copies stay where they're hidden; the epilogue shows one of them (Mara's, behind the bell pattern) still there in 1999. |
| Who he visited | `ch9_visits` (set) | Lines | Ending lines for each person visited this week. |
| Mara's offer to come | `mara_will_come` | — | Ending Two: Mara and Courts residents arrive at Alder Row at dawn. |
| Darnell | `darnell_later` | Darnell's line | Ending Two epilogue: Darnell, older, at the gym. |

## Chapter ending beat and hand-off

The alarm in the dark; the card "May 30, 1997 · 4:40 a.m."; a Harlan Freight truck's headlights pulling up outside (the Courts gate or Pier Street), Dutch (wrist in a cast) or Cal at the wheel, the engine idling. Jin goes down the stairs. No completion screen between Chapters 9 and 10 (the only chapter break without one): the truck pulls away and the title card for Chapter 10 rises over the moving road.

State handed on: everything. `copies_given`, `ch9_visits`, `mara_will_come`, every relationship meter; the terms sheet in his pocket; the knuckles in his pocket or left in a drawer (a last small choice at the door: "Take the knuckles." / "Leave them." — no mechanical effect in Ending One, a small one in Ending Two: without them his punches stagger less and the fight is harder, and Teddy's epilogue line changes).

---

# Chapter 10 — Somebody Else's Home

## Date, mood, palette, weather

Friday, May 30, 1997, 4:40 a.m. to about 6:20 a.m., then each ending's epilogue across months and years. Mood: the hour before something irreversible in a place where ordinary life is still going on. Palette: Alder Row is a different brick from anywhere else in the game, a sandy yellow-brown with green-painted trim and window boxes, so the player's eye knows at once that this is nobody's place they've been. Pre-dawn navy over sodium streetlights; the sky warming to gray, then pink over the river by 5:40; across the water the Ashgrove Tower still lit, and further up the river the foundry stack. Weather: river mist at first, lifting at dawn; birds starting; a radio.

## Gameplay identity

A short walk through strangers' lives, one plain decision with its consequences stated before it's made, and then one of two endings, each with a playable sequence and an epilogue that moves through time. The residents get no backstories (PDF); they get visible lives, one line each, and the player's full attention. Share before the choice: exploration 40% · dialogue 40% · the choice 20%. After: Ending One is a clearance (no combat, shoves only) and an epilogue; Ending Two is the last fight of the game and an epilogue. Target 15–20 min including the epilogue.

## Locations

### `harlan_truck` — The truck (scene set, 640 x 360)
The back of a Harlan Freight box truck with the roll door half up, benches along the sides, a dome light. The road sliding past the gap: South River Road, warehouses, the river. Ambient: the engine, the crew's quiet, the radio in the cab on the early traffic report.

### `alder_row` — Alder Row Cooperative, South River (2400 x 480, exterior, two layers)
Left to right:
- **0–200 South River Road.** A bus stop (Route 22's last stop: "22 · SOUTH RIVER · END OF LINE"); the truck pulls up here; Cal's Lincoln behind it.
- **200–500 Phan Shoe Repair · Keys Cut.** A narrow corner shop with a hand-painted sign, a roll-down gate, and in the window forty pairs of shoes on shelves, each with a paper ticket tied to its laces. A key-cutting machine visible through the glass.
- **500–900 Building 1.** Sandy brick, green trim, window boxes with geraniums in coffee cans (the player has seen a geranium in a coffee can once before, on Sal's stoop in 1994). A woman carrying a disassembled crib, one piece at a time, from the main entrance to a borrowed station wagon at the curb.
- **900–1300 Building 2 and the main entrance.** Double glass doors with a heavy chain wrapped through the push bars and a padlock the size of a fist. Behind the glass, in the lobby: the seven households who stayed (shapes, a toddler, someone in a bathrobe, the co-op secretary's husband holding a thermos). In front of the doors, outside the chain, an **old man in a kitchen chair** with a transistor radio on his knees. A **bulletin board** by the doors. The **stoop**, where a teenager sits with a boombox.
- **1300–1500 the courtyard arch.** An iron gate standing open. In it, at the edge of the light, **the man in the camel coat**.
- Upper/behind layer, seen through the arch: the **courtyard** with a mulberry tree, a chalk hopscotch on the path (another child's handwriting, a "HOME" square), a raised bed of **tomato seedlings planted this week**, laundry lines, a kid's bike.
- **1500–2000 Buildings 3 and 4.** Residents at windows; a bedsheet banner hung from a third-floor window in house paint: "WE ARE NOT VOLUNTARY".
- **2000–2400 the river end.** A railing; across the river, the Ashgrove Tower lit from inside; further upstream, the stack.
Lighting: two sodium streetlights; the lobby's fluorescent through the chained glass; the shoe shop's back-room bulb; then dawn from the right. Ambient: the old man's radio (the early traffic report: "...inbound on the Ninth Street bridge, light..."), birds beginning, the river, the truck idling, then, as dawn comes, a dog, a kettle, someone's alarm clock through an open window.

## NPCs present

| id | Where | Idle pose | Line(s) | Notes |
|---|---|---|---|---|
| `dutch_brannigan` (wrist in a cast) **or** `cal_brannigan` (if `beat_dutch_after`) | The truck; then the steps | `armsCrossed` | Dutch: "This is the easy part, son. We open a door. They walk out. Nobody gets hurt if nobody's stupid." / (`took_depot_profit`) "You took the house money. Fair." (`took_wage_envelope`) "You took the bus driver's too, Marty says. Or you put it back. I forget which. I don't, actually." / Cal: "Uncle Dutch says hi from the hospital." | The crew boss. |
| `harlan_crew` (Joey, Frankie, two collectors, a guard) | The truck; the street | — | Joey (in the truck, to nobody): "My ma lived on South River. Different building." | Enemies only in Ending Two. |
| `camel_coat` | The courtyard arch | still, one hand in his pocket | "Mr. Seo." (and nothing else until the choice) | His third and last appearance; always in a doorway. |
| `mr_phan` (shoe repair) | His shop door | pulling the gate halfway down, then up, then halfway | "Forty pairs on the shelf. Whose shoes do I give back first?" | — |
| `crib_woman` | Between the entrance and the station wagon | `carry` | "Don't help me. I don't know who you're with." | — |
| `coop_secretary` (60s, red cardigan, clipboard of signatures) | The steps | `armsCrossed`, arguing | "If we fight, they'll say we were violent and the judge will believe them." | Arguing with the young man. |
| `young_man` (20, hood, a broom handle he doesn't know how to hold) | The steps | `guard`, badly | "And if we don't, they'll say we agreed." | — |
| `old_man_chair` (80s, cardigan) | Kitchen chair in front of the doors | `sit`, radio | (only if Jin sits on the step near him) "I've lived here since Truman. I'll sit." | — |
| `teen_boombox` (15) | Stoop | `sit` | (none) He turns his music off when the crew get out of the truck and doesn't turn it back on. | — |

## Interactables

| id | Label | Examine text |
|---|---|---|
| `phan_window` | Shoe window | "Forty pairs, each with a paper ticket on the laces. A name and a day on every ticket. KOWALCZYK — THU. DIAZ — FRI. LE — SAT." |
| `coffee_can_geranium` | Window box | "Geraniums in a coffee can. Somebody's always got geraniums in a coffee can." |
| `alder_board` | Bulletin board | "ALDER ROW COOPERATIVE · MEETING TONIGHT 7 PM." And, by `truth_told_by`: (`rook`) a handwritten note on Council letterhead: "The Northside Community Council does NOT support this relocation. — H. Ruiz, Acting Chair." / (otherwise) one of the hundred letters from Rook's desk, "supports the voluntary relocation of residents", unsigned. Jin's thought: *Nobody signed it. Nobody had to.* |
| `tomato_bed` | Tomato seedlings | "Planted this week. Somebody planted tomatoes in May, to eat in August." |
| `hopscotch_alder` | Chalk | "Somebody else's hopscotch. 1 to 10 and HOME." |
| `ashgrove_across` | River railing | "The tower. From here it looks like it's watching the door." |
| `chain` | The chain | Before the choice: "A chain through the push bars and a padlock the size of my fist. Seven households on the other side of the glass." |

## Quests

- **Main — "Somebody Else's Home."** HUD steps: "Alder Row." → "Walk it." → "The door." → (the choice) → Ending One: "Open the door." → "Hold it." / Ending Two: "Stand in front of the door." → "Stay standing." There are no optional quests in this chapter. The walk is optional in the sense that the player may go straight to the door; the game doesn't stop them, and doesn't reward or punish the walk.

## Scripted scenes

### Scene 10.1 — The truck
1. Title card over the moving road: "Chapter 10 — Somebody Else's Home". The truck's interior; the roll door's gap shows South River Road. Dutch (or Cal) across from Jin; the crew on the benches, Joey staring at his boots.
2. **Dutch:** "This is the easy part, son. We open a door. They walk out. Nobody gets hurt if nobody's stupid." Flag lines (see NPC table).
3. If Jin brought the knuckles (`knuckles_ch10`), Dutch looks at his pocket: "Leave those in. You won't need them. That's the whole idea of you."
4. Joey: "My ma lived on South River. Different building." Nobody answers him.

### Scene 10.2 — Alder Row (the walk)
1. The truck stops; the roll door goes up; mist. **Camera**: very wide, the whole street small under two streetlights, the tower lit across the river. Held for three seconds before control returns. Thought: *I've never been here.*
2. The crew spread along the street without hurrying. They don't touch anyone. The teenager turns his music off.
3. The player can walk the street and meet each resident's single line (the PDF's three images are all here: someone closing a shop, people moving possessions away from the entrance, people arguing about whether resistance will make it worse). The camel coat watches from the arch. **Coat:** "Mr. Seo." Nothing more.
4. If Jin sits on the step near the old man, the radio's traffic report plays on, and after a while: **Old man:** "I've lived here since Truman. I'll sit." Jin sits beside him for as long as the player likes. Nobody hurries them. The sky lightens slightly while they sit.
5. When the player approaches the doors (or after the walk, at the steps), **Dutch** (or Cal) holds out a pair of long bolt cutters, handles first. "Your door, champ."

### Scene 10.3 — Before you choose
Letterbox on. The street holds still (time does not run; there is no timer). The journal's page "Before you choose" opens over the scene, in the same plain hand-lettered style as the board cards, and states the consequences:

> **If you cut the chain:** the seven households behind this door are removed this morning. Alder Row closes today. Everything on the terms sheet is yours: Hollis, the apartment, the income, your name in a court on June 3rd, the comeback. The people here get $1,200 a household and a list.
>
> **If you put the cutters down:** you fight the men you came with. The clearance stops this morning, not forever. The offer is gone: no Hollis, no apartment, no income, no arranged comeback. Whether anyone in the tower answers for any of it depends on the evidence and on the people holding it, over months, not on this morning.
>
> **Who is with you, and who trusts you, came from what you did before. This doesn't.**

The page closes. Two options, side by side, no default highlighted:
- "Cut the chain."
- "Put the cutters down."

(`ending = champion` / `own_name`.)

---

## Ending One — The Champion

### Scene E1.1 — The door
1. The cut is a held input; the cutters are slow; the chain's sound is loud in the quiet street and the radio's traffic report keeps going under it. The padlock drops. The chain slides through the push bars and hits the step.
2. The doors open. **The clearance** is playable and uncomfortable on purpose. Jin's punch input becomes a shove (the prompt reads once: "Not a fight. You're clearing a door."). Jin must:
   - **Open access**: prop the doors with the wedge the crew hands him. The crew go in past him.
   - **Overcome resistance**: the young man with the broom handle swings once, badly. Jin's reflexes slip it without the player asking (the only automatic defense in the game, and Jin's thought says so: *I didn't decide that. My body did.*). The player must shove him off the steps to continue; he sits down on the sidewalk and doesn't get up. The co-op secretary sits on the lobby stairs with her clipboard and has to be walked past.
   - **Allow the residents to be forced out**: two crewmen lift the old man's kitchen chair with him in it and carry it down the steps. Jin's required action is "Hold the door." The camera holds on Jin holding the door while the chair passes through it, the radio still in the old man's lap, still on the traffic report.
3. Nothing in the clearance can be picked up. Interacting with anything (a toy, a dropped coat, the tomato bed) gives only Jin's thought: *Not mine.* There is no money, no item, no score, no reward popup (PDF: no celebratory loot wave).
4. **Mr. Phan** pulls his gate all the way down, locks it, and hands Jin the key. "You'll want this. It opens the shop. There are forty pairs inside. Somebody should give them back." He walks away up South River Road with no bag.
5. By 5:50 the seven households are on the sidewalk with what they could carry. The crib woman's station wagon pulls away. The teenager carries his boombox, off.
6. If `mara_will_come`: at 5:25, after the doors are open, Mara's pickup pulls up at the corner with three Courts residents in the bed. She gets out, sees Jin holding the door, and stops at the curb. She doesn't come closer. After a while she gets back in the truck and drives away. No line.
7. The camel coat, leaving the arch: "Practical." He walks to a dark sedan and is gone.
8. **Camera**: pull back from the street, across the river, up the side of the tower to the 31st floor, where one light is on.

### Scene E1.2 — The rewards, over time (epilogue)
Each card is a short scene; most are playable for a few seconds (walk, sit, a drill) so the rewards are felt, not only listed. The administrative report interleaves with them.
1. **"June 3, 1997 · Calder County Court."** "In re Seo, Jin." The judge reads it twice, correctly. Penner in the back row, reading something else. Jin's name is legally his again. Thought: *My name.* (A beat.) *They gave it to me.*
2. **"October 1997 · Hollis Neurorehabilitation, Boston."** Parallel bars again (the Ch1 drill), with a therapist who isn't Hana. It's easy now. The balance meter barely moves. **Therapist:** "Remarkable." The window shows a city that isn't Calder.
3. **"April 1998 · Riverside Lofts, 9C."** A clean apartment with a river view. The smoke detector on the ceiling (if `bought_smoke_detector`, a building manager mounted it; the red blink is the same). The robe (if `accepted_robe`) in a closet; Ashgrove's publicist on the phone: "The original robe! It's a story!" (Jin's answer is a choice that changes nothing but him: "No." / "...Fine.")
3b. **"1998 · What the purse was for."** One quiet card by `purse_wish`: (`rent`) a money order for two months' rent mailed to 412 Kessler, 3B, and returned by the Alvarezes with a note: "We think this is a mistake." / (`radiator`) a plumber installing a new radiator in 3B for the Alvarezes, paid anonymously; it doesn't knock / (`tuition`) a $500 bookkeeping prize at Calder Community College in Seo Min-ji's name, announced by Ashgrove's public-relations office with a photo of Jin at the podium.
4. **"Summer 1998 · Kessler Avenue."** A new poster pasted over the old layers on the Kessler Drug wall: "SEO RETURNS · CALDER CIVIC ARENA · PRESENTED BY ASHGROVE CAPITAL." Under it, three layers down, the torn 1994 poster. Through Sun's window, Mrs. Sun looks at it and turns her sign to CLOSED, three hours early.
5. **"Channel 6 · 1998."** An interview set, Celeste beside Jin. **Celeste:** "Jin's story is Calder's story. A man who overcame hardship through determination." **Anchor:** "Jin?" **Jin:** "I had help." **Anchor** (laughing): "Modest, too!"
6. **"March 11, 1999 · Calder Civic Arena."** His birthday. The title bout. The blue corner. Ashgrove's trainers in his corner, not Teddy. The 1961 bell. His opponent goes down in the second round from a cross that barely lands (the player throws it). Jin knows the shape of it: Slim, in the Cellar, on cue. The crowd is enormous. **Announcer:** "...AND THE NEW... CHAMPION OF THE WORLD... CALDER'S OWN... JIN... SEO!" His name, announced to an arena full of people. **Camera**: up from the ring through the roaring stands to Section 14, Row F, where Jin has bought two seats for every fight and left them empty. Higher: the watch booth's light is on; a figure in it, watching on a monitor, does not come down.
7. **Interleaved document (the viewer, full screen, quiet):**
   > ASHGROVE CAPITAL, L.P. · ALDER ROW ACQUISITION · RELOCATION SUMMARY (FINAL)
   > Units: 38 · Households relocated with assistance: 31 · Households relocated by enforcement (5/30/97): 7
   > Assistance disbursed: $45,600 · Forwarding addresses on file: 29 · No forwarding address: 9
   > Commercial tenant: Phan Shoe Repair & Keys — lease terminated — no forwarding address
   > Complaints received: 4 (closed) · Status: COMPLETE
8. **The others** (one image each, by flags; no dialogue unless noted):
   - The old man's transistor radio on a nightstand at St. Agnes, still on the traffic report. Dolores: "Good morning, Mr. Kowalczyk."
   - Mr. Phan at a folding table in a flea-market parking lot, fixing a heel in the rain.
   - Foundry Courts: over the courtyard wall, a billboard of Jin's face and "SEO — CALDER'S OWN". Mara on the workshop roof at sunset, looking at it. Behind the wooden bell pattern in the workshop, the copy she was given (if `copies_given` includes `mara`) still there.
   - The Courts community room, the title fight on the donated TV: the kids cheering; Deshawn not, then, because the kids are cheering, a little.
   - Hana (by letter): "The state closed my complaint as 'resolved between the parties.' Nobody asked me which parties. I made a copy of that too. — H." (She has left St. Agnes for a hospital in another state.)
   - Rook, in a folding chair at a church table on South River, helping a family fill out a housing form. He doesn't look up.
   - Lenny (if he was in town): this time he gets on the bus.
   - Luis (`fought`): on the undercard of "SEO RETURNS", billed "Kid Rent".
9. **Final image.** The arena announcer's voice, "...JIN... SEO!", echoing under the last line of the report, "Status: COMPLETE." The 1961 bell rings once. Black. Title: "Ending One — The Champion."

The ending never says he was wrong. It shows what he received and who paid, in the same frame.

---

## Ending Two — His Own Name

### Scene E2.1 — The cutters
1. Jin puts the bolt cutters down on the step. They clang. The radio's traffic report keeps going.
2. **Dutch** (or Cal): "...You're kidding." (beat) "You're not kidding."
3. **The camel coat**, from the arch, the last thing he ever says in the game: "That's a shame, Mr. Seo." He turns and walks to his sedan without hurrying. The tower doesn't fight its own fights.
4. Jin turns to face the crew with his back to the chained doors. Behind the glass, the seven households. The old man in the chair doesn't move.

### Encounter 10A — The door (the last fight)
- **Wave 1, the steps:** 2 `thug` + 2 `collector`. The young man with the broom handle tries to help and gets in the way; if Jin is near him when a collector's grab winds up, Jin can shove him clear (a single prompt; no penalty if missed: he scrambles off on his own).
- **Wave 2, the arch and courtyard:** Cal (`director`) + 2 `thug` + 1 `guard`. The tomato bed and the hopscotch are in the fight space; enemies knocked into the bed flatten seedlings (a small, permanent change to the courtyard in the epilogue: two plants are crooked and survive anyway).
- **The end of the fight depends on who is here** (support from earlier choices; it changes the length and the shape of the fight, never the decision):
  - If **Dutch** is present: after wave 2 he watches Jin standing, breathing hard, and says, "Not for Penner. Not with one arm. We're done here." He calls the crew off. They load the truck and go. (Dutch's limit, which the player saw in Chapter 4.)
  - If **Cal** is present (`beat_dutch_after`): a **wave 3** at the entrance: Cal + 2 `collector` + 1 `thug`, `maxAttackers` 3. It's long, and Jin's breath is the real enemy; the game drops his max breath a step per wave (his body, not sabotage). It ends when Cal flees.
  - **Support arriving** shortens wave 3 or wave 2 by removing enemies as the situation changes (none of them fight; they make the street a place with witnesses):
    - `mara_will_come`: at 5:25 Mara's pickup and the Courts residents arrive and stand in a line in front of the chained doors, arms linked with Alder Row's secretary and her husband. Two crewmen look at the line and walk back to the truck.
    - courts ≥ 4 or `showed_hector_print`: at 5:30 a Calder Transit bus with "NOT IN SERVICE" on its sign comes down South River Road and stops in the middle of the street, blocking the truck. Hector opens the doors. Odette (if odette ≥ 3) steps down with a pot. **Hector:** "I'm going to get fired. Everybody off my bus."
    - teddy ≥ 3 and `copies_given` includes `teddy`: Teddy's wagon, and behind it a Channel 6 van; its camera light comes on. (Penner's own words in Ch9: if men with bolt cutters are filmed, it's over.) One crewman puts his hood up and leaves.
    - hana ≥ 4: Hana gets out of a taxi in her peacoat with a clipboard and starts writing down the license plates and the crewmen's descriptions, out loud. "I chart what I see."
    - deshawn ≥ 4: Deshawn pulls the young man with the broom handle back out of the fight and keeps him back.
    - `truth_told_by = rook` and rook ≥ 1: Rook's maroon Buick. He walks up to Cal (or Dutch) and says, "The Council says no. That's three." Then he stands in the arch where the coat stood.
  - With no support at all, Jin fights every wave alone and wins on his knees on the steps, and the street is quiet except for the radio. The clearance still stops for this morning. The game does not make the lonely version worse in any other way.
- **Checkpoint** at the start of each wave. A loss returns to the wave's start ("Again. The door's still behind you.").
- After: no questioning. Nobody is beaten after the fight (the game doesn't offer it; there's nothing left to learn from these men).

### Scene E2.2 — Dawn
1. 5:50. The sky pink over the river. Jin sits on the steps (he can't stand for a while: "Legs won't."). The old man in the chair turns his radio up a little.
2. The co-op secretary unlocks the chain from the inside with her own key. The doors open from the inside. The seven households come out onto the steps, look at the street, and stand there.
3. **Secretary** (to the young man): "So now what?" **Young man:** "Now we have the meeting." (beat) "At seven, like it says."
4. Mr. Phan rolls his gate up, all the way, and props it. He looks at Jin on the steps for a second, the way you look at a stranger who's been in a fight, and goes inside to his shoes.
5. If Odette came: she's ladling soup into paper cups on the bus steps for whoever wants one, Alder Row residents and Courts residents together. ("Soup is a program too.")
6. A police car arrives late, takes statements, and leaves. The combat made an opening, not an outcome (PDF). The objective line simply fades out.
7. Jin's thought, on the steps: *I didn't get anything. That was the point.* (beat) *I still wanted it.*

### Scene E2.3 — Afterwards (epilogue, over months)
Each card is a short scene; the people who appear depend on relationships and `copies_given`. The exposure is shown as process, by many hands, slowly (PDF).
1. **"June 1997 · Foundry Courts."** An assembly. Mara at the easel with the Council's books open (if `copies_given` includes `mara`, she holds up the copy from behind the bell pattern). Hector as acting chair. **Pauline:** "We keep the roof. We tell the truth about how we got it. Both." A vote to cooperate with the state auditor carries, not unanimously. Nobody says the houses aren't theirs. (PDF: the benefits were not fraudulent.)
2. **"July 1997 · Harrisburg."** Hana testifying to the state Department of Health, Dolores in the row behind her. (If `copies_given` includes `hana`, which it always does.)
3. **"September 1997 · Calder County Courthouse."** The District Attorney's office: Leon Fisk indicted (Father Nowak's copy and Ortiz's letter or testimony). Lenny Voss testifying (if not `threatened_lenny` and lenny ≥ 2), in a borrowed suit, hands shaking, telling it straight. Ray Castell testifying (if `ray_spared`); his title vacated. Gerald Pike, cooperating, with eleven boxes. Walter Rook pleading guilty and testifying (if rook ≥ 1); otherwise named in the indictment.
4. **"1998."** A newspaper on Sun's counter: "ASHGROVE CAPITAL UNDER STATE, FEDERAL INVESTIGATION · Managing director placed on leave · Alder Commons 'on hold'". Celeste Ashgrove's statement, quoted: "regrettable conduct by individual employees." The man in the camel coat is never identified. (The system bends; it doesn't fall. One fight didn't solve it.)
5. **"Alder Row · Autumn 1997."** The neighborhood is still occupied. The mulberry tree, the two crooked tomato plants with tomatoes on them, the "HOME" square.
6. **Jin's ordinary future** (playable, a few seconds each):
   - **Difficult work.** Mara's crew, Friday, the coffee can (`mara` ≥ 2): "Fifteen a job. Don't spend it on anything I'd spend it on." Or, if Mara's meter is low, the night dock at a legitimate freight company across the river, carrying boxes (a carry with "Hands full.").
   - **A rented room.** Pier Street room 4 (or the loft): a narrow bed, the smoke detector's red blink (if bought), the robe on the back of the door (if `accepted_robe`), Teddy's 1994 gloves on a nail (if `fought_ray_bare`).
   - **Occasional teaching.** Saturday 9 a.m., the Courts basement gym, holding pads for kids with Deshawn (deshawn ≥ 4): Benny in his real gloves, Tamika, Darnell (if `darnell_later`). Teddy holding the other pair of mitts (`mitts_with_teddy`): "Hands up, chin down, mouth shut." Or, if those relationships didn't survive, Tuesday nights at the YMCA with Luis (`paid` / `reported`).
   - **Relationships he preserved** (one image each, only if earned): Hana and Jin at a diner on Thursdays, her appointment book open to "Jin Seo — coffee." Odette's Wednesday soup with Rook at the far end of the table and only Odette sitting next to him. Hector's 14 bus at dawn with Jin in the seat behind the driver, by the heater; neither says anything. Mrs. Sun letting him pay for his own bowl.
7. **He still wants it.** Sun's, a Saturday night. A title fight on the little TV over the counter, someone else's, at the Civic. Jin in the back booth with a bowl he isn't eating, his shoulders moving with the punches. Thought: *I'd have slipped that.* (beat) *I'd have been there.* Mrs. Sun turns the volume up for him without being asked. (PDF: do not erase his disappointment.)
8. **His own name.** Autumn. Alder Row. Jin walks in off South River Road with his old white running shoes in his hand, the soles split. Phan Shoe Repair. Mr. Phan doesn't recognize him (it was dark; he was busy; Jin was one of many strangers that morning). "Resole? Ten dollars. Thursday." He takes a paper ticket from the roll. "Name for the ticket?"
   - **Jin:** "Seo."
   - **Mr. Phan:** "S-O?"
   - **Jin:** "S-E-O."
   Mr. Phan writes it, tears the ticket, ties one half to the laces, and hands Jin the other. **Camera**: close on the ticket in Jin's hand: "SEO — RESOLE — THU." Then wide: Jin walking back out onto Alder Row, small, past the mulberry tree and the hopscotch, nobody looking at him. The sound of the street. No bell.
9. Title: "Ending Two — His Own Name."

The residents of Alder Row never learn what he gave up (PDF). The only acknowledgment in the ending is a paper ticket with his name spelled right.

## Choices made here

| Choice | Flag | Immediate | Later |
|---|---|---|---|
| Bring the knuckles | `knuckles_ch10` | Dutch's line | Ending Two: without them, staggers are weaker and the fight is harder; Teddy's epilogue line changes ("You fought it with your hands."). |
| Cut the chain / put the cutters down | `ending` (`champion` / `own_name`) | Ending One / Ending Two | Chapter select unlocks; the save records the ending; the main menu's Story Mode card shows the last image of the ending reached (the arena announcement or the shoe ticket). |

## Chapter ending

There is no "next chapter". After the title card, the completion screen shows every chapter's summary line in order, as a single column of the choices the player actually made, the last line being "You cut the chain." or "You put the cutters down." Chapter select becomes available from the Story Mode menu with all chapters replayable from their starts.

---

# Decisions log (made alone, because nobody could be asked mid-run)

Run 1 decisions are in `draft-world-notes.md`; run 2 added these while writing Chapters 3–10:

1. **Chapter dates.** Ch3 is three nights (Tue Jan 7, Thu Jan 9, Fri Jan 10, 1997) with a rest day, so the Cellar fills up like a town at a set hour. Ch6 is Thu Feb 20 – Sun Feb 23 (the thaw), Ch7 Thu Mar 6 (Council office hours), Ch8 Fri Apr 11, Ch9 Thu May 22 plus a free week, Ch10 Fri May 30.
2. **Why the gaps.** Ch2→Ch3: the Cellar was closed for the holidays. Ch5→Ch6: Jin wasn't ready; the thaw flooding St. Casimir's basement forces him. Ch6→Ch7: Rook was at state housing hearings in Harrisburg (posted on the HQ door). Ch7→Ch8 and Ch8→Ch9: rest periods after fights (PDF: recovery takes time).
3. **Ch4 records made less explicit than run 1's registry.** The PDF says that in Ch5 Jin only *suspects* the purchase is connected to his fight, so the Ch4 CIVIC folder doesn't name the Council's share, and the Council's ledger at the depot starts in 1995 with a smeared balance-forward. The explicit 1994 page (`ev_ledger_1994`) is found at HQ in Ch7. The Global registry rows were revised to match.
4. **The Council's money stays at Harlan Freight.** Rook couldn't bank it, so the outfit "services" the Council's account and pays out boilers, roofs and wages, which is the leash in Ch7 (PDF: the mafia uses the organization's dependence). Hector, the tenant treasurer, picks up the maintenance envelope every Monday at window 2 without knowing what it means.
5. **Pat O'Shea**, the gate guard at Harlan Freight, is the 1994 arena loading-dock guard who let the camel coat into Dressing Room 2 ($1,000 in the CIVIC folder). One small connective thread; the player can notice it or not.
6. **Lenny works Jin's corner again in Ch3**, because the Cellar's house cutman works both corners. Jin refuses the water bottle. The patience path makes Jin hold Deshawn's bucket while Lenny works, which is the "time" that threatening him would have saved.
7. **Slim's arranged loss** is a mirror of Ch0: Jin is offered a fixed *win*. The player can ask Slim to fight straight (harder, less money) or accept it.
8. **Luis Ocasio (17)** was added as a small optional thread so the "rent" reason from the PDF's list has a face; he later rents Jin's old YMCA room.
9. **The Kaczmareks' radiator.** Jin carries a radiator into the apartment of a family Rook names in Ch7, so the names in Rook's defense are doors the player has stood in.
10. **Hector drove Jin's mother.** Mi-ok rode the night 14 home from Calder Linen Service; Hector gave "Mrs. Sewing" the seat by the heater. Optional (a print in Min's photos). It makes Hector's fear in Ch7 harder for him to hold without changing what he says.
11. **The fire.** Min's own battery made the hallway detector work, so the front rooms escaped; the rear door was padlocked from outside by the agent; the inspector was due eight days later. Several failures, no single cause (PDF).
12. **Min's letters were opened, read and stamped**, not left sealed (revised from run 1): it proves the Council knew what she was asking, which is the critical discovery's point.
13. **The Ch6 commitment choice** is Deshawn's corner vs. Abel Ortiz's departing bus; both paths give the evidence (Ortiz leaves a letter). The corner path recreates Ch0's corner from the other side ("I can't see"), and the player chooses whether to stop it.
14. **Ch7's short fight comes before the confrontation**: Cal Brannigan leaning on Rook to put Council letterhead on Alder Row relocation letters. This shows the outfit outgrowing the agreement and introduces Alder Row's name. Rook never fights.
15. **Who tells the residents** (`truth_told_by`) also decides, in Ch10, whether Alder Row's bulletin board carries a Council refusal signed by Hector as acting chair or the unsigned letterhead letters from Rook's desk.
16. **Ch8: Teddy works Jin's corner and asks "How do you feel?"** If Jin says "Something's wrong," Teddy stops the fight and Ray gives the name anyway, so the player is never trapped the way Jin was in 1994. The bell choice is made with control in the player's hands and a single "Step back" glyph.
17. **Ch9's "people outside hold copies"** is always true because Hana always has a set (Ch1: "I always make a copy"). Giving more copies is optional and shapes Ending Two's exposure scenes.
18. **Alder Row is never visitable before Ch10**, so its residents stay strangers (PDF).
19. **Ch10's consequences are stated on screen before the choice**, in plain language, with no timer and no default.
20. **Support in Ending Two arrives after the choice**, never before it, so nobody Jin knows is standing at the door when he decides (PDF: the final residents remain strangers; no loved one among them). Mara's truck arriving after the doors are open in Ending One follows the same rule.
21. **Ending Two's last beat** is a shoe-repair ticket with his name spelled right, from a man who doesn't know who he is.
