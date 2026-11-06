/* Inside the Impact — simulation parity harness.
 *
 * Why this exists: the renderer is going to be replaced, and the one thing
 * that must NOT move while that happens is the simulation. This game teaches
 * a safety judgement; if the thresholds or the opponent ladder drift during a
 * visual rewrite, the lesson drifts with them and nothing on screen says so.
 *
 * It seeds the RNG, sweeps the deterministic core, and prints a signature.
 * Capture it BEFORE a change and compare AFTER. Identical signature = the sim
 * is untouched.
 *
 * Run it the same way as smoke.js:
 *   python3 tools/serve.py, then open http://127.0.0.1:8781/   (wait for boot)
 *   paste this file into the console
 *
 * HONEST SCOPE — read this before trusting it.
 * Covered: the opponent ladder, the medical thresholds and the sign logic that
 * reads them, the reward/XP/upgrade/gym maths, and a seeded exchange model that
 * uses the real BAL constants.
 * NOT covered: the DOM-driven bout flow (setTimeout chains), the camp loop, and
 * anything whose outcome depends on which buttons a human pressed. Those need a
 * headless driver; this is the layer worth locking down first and the one a
 * renderer rewrite is most likely to disturb by accident.
 */
(() => {
  const out = { sections: {}, notes: [] };

  /* deterministic RNG — mulberry32, seeded, so every run is identical */
  const mk = (seed) => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r3 = (v) => Math.round(v * 1000) / 1000;

  /* ── 1. the opponent ladder ──────────────────────────────── */
  try {
    out.sections.opponents = Array.from({ length: 8 }, (_, i) => {
      const o = mkOpp(i);
      return [o.n, o.pow, o.spd, o.def, o.sta, r3(o.bt), r3(o.ti)].join("|");
    });
    if (typeof CH !== "undefined")
      out.sections.champion = [CH.n, CH.pow, CH.spd, CH.def, CH.sta].join("|");
  } catch (e) { out.notes.push("opponents: " + e.message); }

  /* ── 2. medical thresholds, and the logic that reads them ── */
  try {
    out.sections.bal = JSON.stringify(BAL);
    const probe = [];
    const base = () => ({
      conc: false, sdh: false, abd: false, eye: false, hand: false,
      cut: 0, head: 0, body: 0, fat: 0,
    });
    /* sweep head/body/fatigue across the bands and record what the game
       would conclude at each point */
    for (let h = 0; h <= 24; h += 4)
      for (let b = 0; b <= 24; b += 8)
        for (const fat of [0, 60, 80]) {
          const saved = G.me;
          G.me = Object.assign(base(), { head: h, body: b, fat });
          const w = warningSigns();
          probe.push([h, b, fat, hasConcern() ? 1 : 0, mustStop() ? 1 : 0,
                      hasWarning() ? 1 : 0, w.hard.length, w.soft.length].join(","));
          G.me = saved;
        }
    out.sections.medical = probe;
    /* the flag paths, each on its own */
    const flags = [];
    for (const f of ["conc", "sdh", "abd", "eye", "hand"]) {
      const saved = G.me;
      G.me = Object.assign(base(), { [f]: true });
      flags.push(f + ":" + (hasConcern() ? 1 : 0) + (mustStop() ? 1 : 0) +
                 ":" + warningSigns().hard.length);
      G.me = saved;
    }
    out.sections.flags = flags;
  } catch (e) { out.notes.push("medical: " + e.message); }

  /* ── 3. progression maths ────────────────────────────────── */
  try {
    out.sections.xp = Array.from({ length: 14 }, (_, i) => xpNeed(i + 1)).join("|");
    out.sections.gymLevels = Array.from({ length: 10 }, (_, i) => gymNeed(i)).join("|");
    if (typeof upCost === "function")
      out.sections.upCost = Array.from({ length: 10 }, (_, i) => upCost(i)).join("|");
    if (typeof DIFFS !== "undefined")
      out.sections.diffs = DIFFS.map((d) => [d.name, d.gold, d.gems, d.xp].join("|"));
    if (typeof GYMS !== "undefined")
      out.sections.venues = GYMS.map((g) => [g.n, g.k, g.mult].join("|"));
    if (typeof REWARDS !== "undefined")
      out.sections.rewards = Object.entries(REWARDS)
        .map(([k, v]) => k + ":" + JSON.stringify(v));
  } catch (e) { out.notes.push("progression: " + e.message); }

  /* ── 4. a seeded exchange model on the real constants ─────
     Not the live bout (that is a timer chain). This replays the same damage
     and onset arithmetic the bout uses, so a change to the numbers shows up
     here even though the DOM path is not exercised. */
  try {
    const runs = [];
    for (let seed = 1; seed <= 6; seed++) {
      const rnd = mk(seed * 7919);
      const me = { head: 0, body: 0, conc: false, fat: 12, career: 0 };
      let concRound = -1, stopRound = -1;
      for (let round = 1; round <= 12; round++) {
        for (let ex = 0; ex < 8; ex++) {
          if (rnd() < 0.33) {
            const head = rnd() < 0.6;
            const d = (2.2 + rnd() * 2.2) * (1 + me.fat / 160) * (me.conc ? 1.7 : 1);
            if (head) {
              me.head += d * 0.78; me.career += d * 0.78;
              if (!me.conc && me.head > BAL.medical.concussionExposure &&
                  rnd() < BAL.medical.concussionChance) {
                me.conc = true; if (concRound < 0) concRound = round;
              }
            } else me.body += d * 0.65;
          }
          me.fat = Math.min(100, me.fat + 2.4 + rnd() * 1.8);
        }
        if (stopRound < 0 &&
            (me.conc || me.head >= BAL.medical.headStop || me.body >= BAL.medical.bodyStop))
          stopRound = round;
      }
      runs.push([seed, r3(me.head), r3(me.body), r3(me.career),
                 me.conc ? 1 : 0, concRound, stopRound].join("|"));
    }
    out.sections.exchange = runs;
  } catch (e) { out.notes.push("exchange: " + e.message); }

  /* ── signature ───────────────────────────────────────────── */
  const flat = JSON.stringify(out.sections);
  let h = 2166136261;
  for (let i = 0; i < flat.length; i++) {
    h ^= flat.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  out.signature = (h >>> 0).toString(16).padStart(8, "0");
  out.size = flat.length;
  out.covered = Object.keys(out.sections);
  return out;
})();
