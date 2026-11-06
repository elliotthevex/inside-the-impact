/* The corner man: one short sentence at each round break, chosen from what really happened in the round.

   createCoach({ HEAD }) -> { onEvent(ev), line(match), offerStop(match), reset(), stats() }
     onEvent(ev)      feed it every sim event. It keeps its own per-round and per-match counts, because the Fighter holds few of them.
     line(match)      { text, tag }. Ask at round_end. Asking again in the same round gives the same line.
     offerStop(match) true at a break when the player's own man is at or over HEAD.bad, or was knocked down this round at or over HEAD.warn.
                      It only answers the question. Ask once, at round_end: the load sheds during the break, so a later answer can differ.
     reset()          new match. A round_start for round 1 does the same. The rotation through the lines carries on, so a rematch sounds different.

   Priority: signs on the player's own man, then signs on the rival, then fight coaching, then praise, then a general word.
   This file reads the hidden head load and is the only UI-facing code that does. No line may show it as a quantity: every sentence names
   only what can be seen on the fighter (the rig performs late guard and slow turning at warn; low hands, sway and long blinks at bad).

   Text rules, checked by the test in the notes: about fourteen words at most, no digits or number words, no diagnosis, nothing that sends a
   man with a head sign back out to fight. The medical substance comes from the game's own Codex and tips in index.html; the key after a
   line names its source there (CX.x is a Codex entry, TP.x a tip, HUD is a load-screen tip in hud.js).

   No DOM and no imports: this runs in JavaScriptCore against the real sim. */

/* A bar at or over this share of full "looks fine". Lines in `bar` say so out loud, so they only come out when it is true. */
const BAR_FINE = 0.5;

/* What counts as a pattern in one round. Measured against the bots in the notes. */
const MISS_MIN = 8, MISS_RATE = 0.4;    // thrown at least this many, and at least this share missed
const IDLE_MAX = 4;                     // fewer punches than this in a whole round
const GUARD_CLEAN = 6, GUARD_RATE = 0.15; // clean shots taken, and blocks as a share of blocks plus clean shots under this
const SLIP_MIN = 8;                     // head shots thrown at him with no slip at all
const GAS_STA = 0.25, GAS_THROWN = 10;  // stamina share at the bell (the HUD says Tired under the same line), for a man who has been working
const BODY_MIN = 10, BODY_RATE = 0.05;  // thrown at least this many, under this share to the body
const PRAISE_SLIP = 2, PRAISE_GUARD = 8, PRAISE_BODY = 4, PRAISE_LAND = 8;

export const COACH_LINES = {
  /* his own man, at or over HEAD.bad: hands low, sway, long blinks */
  'self-bad': {
    bar: [
      "Your bar looks fine. Your hands are dropping. That's what to watch for.",       // CX.screen, signs override appearance
      "Never mind the bar. You're swaying and blinking slow. A real corner stops this.", // TP.towel, CX.conc
    ],
    any: [
      "Your hands are sinking and you're swaying. That's what to watch for.",
      'Long blinks, low hands. In a real fight, that means stop and get checked.',     // CX.conc
      "You're swaying on your feet. A real corner calls the doctor now.",              // TP.bh
      "Hands low, eyes blinking long. Feeling fine wouldn't clear that.",              // CX.sic
      "I don't like your hands or your balance. That's a doctor's call, not yours.",   // CX.screen, TP.corner
      "You're swaying and your hands won't stay up. I'd stop this now.",               // TP.towel, TP.bf
    ],
  },
  /* knocked down this round, and a late guard: offerStop is true here */
  'self-down-warn': {
    bar: [],
    any: [
      "You went down and your guard's still late. A real corner stops this.",          // CX.conc, TP.towel
      'You beat the count, but your hands are slow. A count clears nothing.',          // CX.conc
      "You got dropped and you're slow to cover. That's what to watch for.",
      'Knocked down, and now a late guard. Feeling fine would not clear that.',        // CX.sic
    ],
  },
  /* his own man, at or over HEAD.warn: late guard, slow turning */
  'self-warn': {
    bar: [
      "Bar looks fine, but your guard's coming up late. That's what to watch for.",    // CX.screen
      "Don't trust the bar. You're late covering up after those head shots.",          // HUD
    ],
    any: [
      "Your guard's coming up late. That's what to watch for.",
      "You're slow to turn and slow to cover. That's what to watch for.",
      "Slow hands mean something. Signs can show up late, so don't wave it off.",      // HUD, CX.conc
      'Your hands are slow coming back. A corner watches that, not the scorecard.',    // TP.corner, TP.bh
      'Late guard after those shots. Feeling fine is not clearance.',                  // CX.sic
      'Head shots add up, even ones that look harmless. Your guard is slowing.',       // TP.corner, CX.cum
      "You're turning late. Fighters hide this stuff, so I watch it for you.",         // TP.obs
      "Your guard's late. Rest and water won't tell us what that means.",              // CX.conc, TP.water
    ],
  },
  /* knocked down this round, nothing else showing */
  'self-down': {
    bar: [],
    any: [
      'You beat the count, but a count clears nothing.',                               // CX.conc
      "You went down. Signs can come late, so don't trust how you feel.",              // CX.conc, CX.sic
      "A knockdown's a reason to get checked, however you feel.",                      // CX.sic
      "You're up, but up isn't cleared. I'm watching your balance and your hands.",    // CX.conc, TP.corner
    ],
  },

  /* the rival, at or over HEAD.bad */
  'rival-bad': {
    bar: [
      "His bar looks fine. Look how he's standing. That's the danger.",                // the game's lesson
      "Ignore his bar. Hands dropping, swaying. That's what to watch for.",
    ],
    any: [
      "See him sway? His bar can't tell you that.",
      "His hands are dropping and he's blinking long. That's what to watch for.",
      'Look at his hands. A referee can stop this before the bar runs out.',           // HUD
      "He's swaying. In a real fight, someone should be calling the doctor.",          // TP.bh
    ],
  },
  /* the rival, at or over HEAD.warn */
  'rival-warn': {
    bar: [
      "His bar looks fine, but his guard's late. That's what to watch for.",
    ],
    any: [
      "He's slow to turn now. Watch how he stands, not just his bar.",                 // HUD
      'His hands are coming back slow. That says more than his bar.',
      "His guard's coming up late. Referees watch for that, and so should you.",       // TP.corner
      'See how late he covers? Slow hands and a late guard mean something.',           // HUD
    ],
  },
  /* the rival went down this round */
  'rival-down': {
    bar: [],
    any: [
      'He beat the count. A count clears nothing, so watch how he stands.',            // CX.conc
      'He got up, but signs can come late. Keep your eyes on him.',                    // CX.conc
      "Getting up isn't the same as being fine. Watch his balance.",                   // CX.sic
      'He went down. Watch his feet and his hands now, not his bar.',
    ],
  },

  /* fight coaching */
  miss: {
    bar: [],
    any: [
      "You're swinging at air. Step in before you throw.",
      'Too many misses. Get closer, then let your hands go.',
      "He's out of reach when you throw. Close the distance, then punch.",
      'Every miss costs you wind. Pick your shots.',
    ],
  },
  idle: {
    bar: [],
    any: [
      'You barely threw anything. Standing there only gives him free shots.',
      "Throw something back. A guard alone won't win you the round.",
      "You've got hands. Use them, or he just keeps coming.",
    ],
  },
  guard: {
    bar: [],
    any: [
      "Your guard hardly came up. Hold it when he's close.",
      'Too many got through clean. A guard stops most of that.',
      "Hands up when he's close. Covering up cuts the punches that land.",             // TP.st0
      'You hardly blocked that round. Strong defence is how you protect your head.',   // CX.cum
    ],
  },
  slip: {
    bar: [],
    any: [
      'Try slipping. A slipped punch is a head shot that never happens.',              // TP.def
      'Slip to the side when he throws and make him miss.',
      'Make him miss. Every slip is a shot your head never takes.',                    // TP.def
      "You're not slipping anything. Move off the line when he throws.",
    ],
  },
  gas: {
    bar: [],
    any: [
      "You're out of gas. Tired fighters drop their hands and react late.",            // TP.sta
      'Your arms are gone. Pace yourself; fatigue and hits go together.',              // TP.sta
      'Save some wind. A tired fighter gets hit more.',                                // TP.spd
      'Slow it down and breathe. Tired hands get you hit.',                            // TP.bf
    ],
  },
  body: {
    bar: [],
    any: [
      'Nothing to the body that round. Mix it in.',
      "You're only head-hunting. Go to the body, it takes his wind.",
      'Work the body too. It slows his hands down later.',
      'All head, no body. Body shots drain him and open him up.',
    ],
  },

  /* praise, each for something that really happened in the round */
  'praise-slip': {
    bar: [],
    any: [
      'Nice slips. Every punch you slip is a shot that never happens.',                // TP.def
      "You made him miss. That's how you protect your head.",                          // TP.def
      "Good head movement. He's hitting air.",
    ],
  },
  'praise-guard': {
    bar: [],
    any: [
      'Good hands. Covering up cuts the punches that land.',                           // TP.st0
      "He hit a lot of glove that round. That's what I like.",
      'Nice guard. Strong defence is real protection.',                                // CX.cum
    ],
  },
  'praise-clean': {
    bar: [],
    any: [
      "You barely got touched up top. That's the whole job.",
      'You hit him more than he hit you, and cleaner. Good round.',
      'He hardly touched your head. Keep it that way.',
    ],
  },
  'praise-body': {
    bar: [],
    any: [
      'Good work to the body. That takes his wind.',
      "Good mix, head and body. He can't guess what's next.",
      'Nice body shots. That slows him down later.',
    ],
  },
  'praise-work': {
    bar: [],
    any: [
      'Good round. You out-landed him.',
      "You're winning the exchanges. Keep your eyes on how he stands.",                // HUD
      "Sharp round. You're picking your shots well.",
    ],
  },

  /* nothing stands out: a general word from the corner */
  watch: {
    bar: [],
    any: [
      'Watch how he stands, not just his bar.',                                        // HUD
      "The bar's only part of it. Watch his hands and his feet.",                      // HUD
      'Slow hands and a late guard mean something. Keep your eyes on him.',            // HUD
      'A referee can stop a fight long before the bar runs out.',                      // HUD
      'Even shots that look harmless add up. Keep your defence honest.',               // TP.corner
      "Balance, reactions, guard. That's what I watch, not the scorecard.",            // TP.corner
      'If you feel foggy or sick, tell me. Hiding it helps nobody.',                   // TP.obs, TP.dx
      "Fighters hide it when they're hurt. That's why a corner watches.",              // TP.obs
    ],
  },
};

/* Fight coaching in the order it matters. Each entry asks whether the pattern showed this round. */
const COACHING = [
  ['miss', (r) => r.thrown >= MISS_MIN && r.whiff / r.thrown >= MISS_RATE],
  ['idle', (r) => r.thrown < IDLE_MAX],
  ['guard', (r) => r.cleanTaken >= GUARD_CLEAN && r.blocks / (r.blocks + r.cleanTaken) < GUARD_RATE],
  ['slip', (r, ro) => r.slips === 0 && ro.headThrown >= SLIP_MIN],
  ['gas', (r, ro, f) => r.thrown >= GAS_THROWN && f.sta / (f.maxSta || 100) < GAS_STA],
  ['body', (r) => r.thrown >= BODY_MIN && r.bodyThrown / r.thrown < BODY_RATE],
];
const PRAISE = [
  ['praise-slip', (r) => r.slips >= PRAISE_SLIP],
  ['praise-clean', (r) => r.landed >= PRAISE_LAND && r.cleanTaken * 2.5 <= r.landed],
  ['praise-guard', (r) => r.blocks >= PRAISE_GUARD && r.blocks * 2 >= r.cleanTaken],
  ['praise-body', (r) => r.bodyLanded >= PRAISE_BODY],
  ['praise-work', (r, ro) => r.landed >= PRAISE_LAND && r.landed > ro.landed],
];

const blankSide = () => ({ thrown: 0, headThrown: 0, bodyThrown: 0, whiff: 0, landed: 0, bodyLanded: 0, cleanLanded: 0, cleanTaken: 0, taken: 0, blocks: 0, blockedBy: 0, slips: 0, slippedBy: 0, kd: 0, staggered: 0 });
const blankCounts = () => ({ p: blankSide(), o: blankSide() });
const other = (who) => (who === 'p' ? 'o' : 'p');
const barFine = (f) => f.hp / (f.maxHp || 100) >= BAR_FINE;

export function createCoach({ HEAD } = {}) {
  if (!HEAD || !Number.isFinite(HEAD.warn) || !Number.isFinite(HEAD.bad)) throw new Error('createCoach needs HEAD from sim.js');

  let round = blankCounts(), total = blankCounts();
  let used = new Set(), usedTags = new Set(), asked = null;
  const rotation = {}; // where each list carries on from. Kept across matches on purpose.

  function count(c, ev) {
    const who = ev.who, def = ev.def || other(who), a = c[who], d = c[def];
    switch (ev.type) {
      case 'throw': a.thrown++; if (ev.tgt === 'body') a.bodyThrown++; else a.headThrown++; break;
      case 'whiff': a.whiff++; break;
      case 'hit':
        a.landed++; d.taken++;
        if (ev.tgt === 'body') a.bodyLanded++;
        if (ev.clean) { a.cleanLanded++; d.cleanTaken++; }
        break;
      case 'block': d.blocks++; a.blockedBy++; break;
      case 'slipped': d.slips++; a.slippedBy++; break;
      default: break;
    }
  }

  function onEvent(ev) {
    if (!ev) return;
    switch (ev.type) {
      case 'round_start':
        if (ev.round === 1) reset();
        round = blankCounts(); asked = null;
        break;
      case 'throw': case 'whiff': case 'hit': case 'block': case 'slipped':
        if (ev.who === 'p' || ev.who === 'o') { count(round, ev); count(total, ev); }
        break;
      case 'knockdown':
        if (ev.who === 'p' || ev.who === 'o') { round[ev.who].kd++; total[ev.who].kd++; }
        break;
      case 'stagger':
        if (ev.who === 'p' || ev.who === 'o') { round[ev.who].staggered++; total[ev.who].staggered++; }
        break;
      default: break;
    }
  }

  /* The next unused line of one list, or null when every line of it has been said this match. */
  function nextOf(list, key) {
    const n = list.length;
    if (!n) return null;
    const from = rotation[key] || 0;
    for (let i = 0; i < n; i++) {
      const at = (from + i) % n;
      if (!used.has(list[at])) { rotation[key] = (at + 1) % n; return list[at]; }
    }
    return null;
  }
  function say(tag, fine) {
    const pool = COACH_LINES[tag];
    const text = (fine ? nextOf(pool.bar, tag + '/bar') : null) || nextOf(pool.any, tag);
    if (text) { used.add(text); usedTags.add(tag); return { text, tag }; }
    return null;
  }
  /* A sign has to be spoken even in a match long enough to use up its list: say the oldest line again rather than drop to something lighter. */
  function sayAlways(tag, fine) {
    const said = say(tag, fine);
    if (said) return said;
    const list = COACH_LINES[tag].any, at = rotation[tag] || 0;
    rotation[tag] = (at + 1) % list.length;
    return { text: list[at], tag };
  }

  /* What is showing on the men, or null. Their state decides this and nothing else. */
  function sign(p, o, kdP, kdO) {
    if (p.head >= HEAD.bad) return ['self-bad', barFine(p)];
    if (p.head >= HEAD.warn) return kdP ? ['self-down-warn', false] : ['self-warn', barFine(p)];
    if (kdP) return ['self-down', false];
    if (o.head >= HEAD.bad) return ['rival-bad', barFine(o)];
    if (o.head >= HEAD.warn) return ['rival-warn', barFine(o)];
    if (kdO) return ['rival-down', false];
    return null;
  }

  function choose(match) {
    const p = match.p, o = match.o, r = round.p, ro = round.o;
    const s = sign(p, o, Math.max(p.kd || 0, r.kd), Math.max(o.kd || 0, ro.kd));
    if (s) return sayAlways(s[0], s[1]);
    const hits = COACHING.filter(([, test]) => test(r, ro, p)).map(([tag]) => tag);
    /* A new lesson before the same lesson again, so three rounds can teach three things. */
    for (const tag of hits) if (!usedTags.has(tag)) { const said = say(tag); if (said) return said; }
    for (const tag of hits) { const said = say(tag); if (said) return said; }
    const good = PRAISE.filter(([, test]) => test(r, ro, p)).map(([tag]) => tag);
    for (const tag of good) if (!usedTags.has(tag)) { const said = say(tag); if (said) return said; }
    for (const tag of good) { const said = say(tag); if (said) return said; }
    return sayAlways('watch');
  }

  function line(match) {
    if (!match || !match.p || !match.o) return sayAlways('watch');
    if (asked && asked.match === match && asked.round === match.round) return asked.said;
    const said = choose(match);
    asked = { match, round: match.round, said };
    return said;
  }

  function offerStop(match) {
    if (!match || !match.p || match.state !== 'break') return false;
    const p = match.p;
    if (p.head >= HEAD.bad) return true;
    return p.head >= HEAD.warn && Math.max(p.kd || 0, round.p.kd) > 0;
  }

  function reset() {
    round = blankCounts(); total = blankCounts();
    used = new Set(); usedTags = new Set(); asked = null;
  }

  return { onEvent, line, offerStop, reset, stats: () => JSON.parse(JSON.stringify({ round, match: total })) };
}
