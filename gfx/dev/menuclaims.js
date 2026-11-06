/* What the menu's three lines say, against LEVELS and against what each level really does in play.
   Run: /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m site/gfx/dev/menuclaims.js */
const SITE = String(import.meta.url).replace(/^file:\/\//, '').replace(/dev\/[^\/]*$/, 'arena/'); // JavaScriptCore has no URL
const { createMatch, setReach, STEP, HEAD, TUNE } = await import(SITE + 'sim.js');
const { createAI, createBot, LEVELS } = await import(SITE + 'ai.js');
setReach(JSON.parse(readFile(SITE + 'reach.json')));
const GAME_RING = { ringHalf: 2.9, corners: { blue: [-2.5, -2.5], red: [2.5, 2.5] } }, FRAME = 1 / 60;
const N = 60, out = {};
for (const level of ['easy', 'normal', 'hard']) {
  const t = { fight: 0, throws: 0, slips: 0, headAtHim: 0, whiff: 0, blocksMade: 0, aheadT: 0, aheadThrows: 0, levelT: 0, levelThrows: 0, tiredT: 0, tiredThrows: 0, freshT: 0, freshThrows: 0, hurtT: 0, hurtThrows: 0, okT: 0, okThrows: 0, wins: 0, matches: 0 };
  for (const bot of ['learner', 'mixed', 'skilled']) for (let i = 0; i < N; i++) {
    const seed = 7000 + i * 23, m = createMatch({ seed, ...GAME_RING }), b = createBot(bot, { seed: seed * 7 + 1 }), ai = createAI({ difficulty: level, seed: seed * 13 + 5 });
    let bank = 0, g = 0;
    while (m.state !== 'over' && g++ < 54000) {
      const ip = b.decide(m, m.p, m.o, FRAME), io = ai.decide(m, m.o, m.p, FRAME);
      m.step(0, ip, io); ip.punch = null; io.punch = null; bank += FRAME; let contact = false;
      const fighting = m.state === 'fight';
      const ahead = fighting && (m.o.landed - m.p.landed >= 6 || m.o.hp - m.p.hp >= 15), tired = fighting && m.p.sta < TUNE.lowSta, hurt = fighting && (m.p.hp < 28 || m.p.head >= HEAD.bad);
      if (fighting) { t.fight += FRAME; if (ahead) t.aheadT += FRAME; else t.levelT += FRAME; if (tired) t.tiredT += FRAME; else t.freshT += FRAME; if (hurt) t.hurtT += FRAME; else t.okT += FRAME; }
      while (bank >= STEP && m.state !== 'over') { bank -= STEP; const from = m.events.length; m.step(STEP, ip, io); for (let k = from; k < m.events.length; k++) if (m.events[k].type === 'hit' || m.events[k].type === 'block') contact = true; if (contact) { bank = 0; break; } }
      for (const e of m.events) {
        if (e.type === 'throw' && e.who === 'o') { t.throws++; if (ahead) t.aheadThrows++; else t.levelThrows++; if (tired) t.tiredThrows++; else t.freshThrows++; if (hurt) t.hurtThrows++; else t.okThrows++; }
        if (e.type === 'throw' && e.who === 'p' && e.tgt === 'head') t.headAtHim++;
        if (e.type === 'slipped' && e.def === 'o') t.slips++;
        if (e.type === 'whiff' && e.who === 'o') t.whiff++;
        if (e.type === 'block' && e.def === 'o') t.blocksMade++;
      }
      m.events.length = 0;
    }
    t.matches++; if (m.result.winner === 'p') t.wins++;
  }
  const rate = (a, b) => +(b ? a / b * 60 : 0).toFixed(1);
  out[level] = {
    react: LEVELS[level].react, slipRead: LEVELS[level].slipRead, ease: LEVELS[level].ease, cadence: LEVELS[level].cadence, press: LEVELS[level].press, finish: LEVELS[level].finish, finishGap: LEVELS[level].finishGap, mistake: LEVELS[level].mistake,
    'slips per 100 head shots at him': +(t.slips / Math.max(1, t.headAtHim) * 100).toFixed(1),
    'blocks per 100 head shots at him': +(t.blocksMade / Math.max(1, t.headAtHim) * 100).toFixed(1),
    'punches a minute': rate(t.throws, t.fight),
    'a minute when ahead / not': rate(t.aheadThrows, t.aheadT) + ' / ' + rate(t.levelThrows, t.levelT),
    'a minute when you are tired / fresh': rate(t.tiredThrows, t.tiredT) + ' / ' + rate(t.freshThrows, t.freshT),
    'a minute when you look hurt / not': rate(t.hurtThrows, t.hurtT) + ' / ' + rate(t.okThrows, t.okT),
    'his whiffs per 100 thrown': +(t.whiff / Math.max(1, t.throws) * 100).toFixed(1),
    'bot wins per 100': +(t.wins / t.matches * 100).toFixed(1),
  };
}
for (const k of Object.keys(out.easy)) print(k.padEnd(40), String(out.easy[k]).padEnd(16), String(out.normal[k]).padEnd(16), String(out.hard[k]));
const L = LEVELS, mono = (k, dir) => dir < 0 ? (L.easy[k] > L.normal[k] && L.normal[k] > L.hard[k]) : (L.easy[k] < L.normal[k] && L.normal[k] < L.hard[k]);
print('');
print('easy slowest to read, hard fastest (react falls):', mono('react', -1));
print('slips rise with the level (slipRead rises):', mono('slipRead', 1));
print('eases off less with the level (ease falls):', mono('ease', -1));
print('takes an opening more with the level (finish rises):', mono('finish', 1));
print('presses a tired man more with the level (press rises):', mono('press', 1));
print('attacks sooner with the level (cadence falls):', mono('cadence', -1));
