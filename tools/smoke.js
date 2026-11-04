/* Inside the Impact — runtime smoke test.
 *
 * Why this exists: a parse check cannot catch the bug that took the site
 * down. Deleting a block removed `let lobbyView`, which is valid syntax
 * and only throws at init — and because init threw, bootUp() never ran,
 * so the page sat on the loading screen forever.
 *
 * Run it in the browser pane against the LOCAL file before deploying:
 *   1. open file:///…/inside-the-impact.html
 *   2. wait ~9s for the boot screen to clear
 *   3. paste this whole file into the JS console / javascript_tool
 * It returns {pass, failures, checks}. Deploy only on pass: true.
 */
(async () => {
  const fails = [], checks = [];
  const ok = (name, cond, detail) => {
    checks.push(name + (cond ? " ok" : " FAILED"));
    if (!cond) fails.push(name + (detail ? " — " + detail : ""));
    return cond;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tryIt = async (name, fn) => {
    try { await fn(); ok(name, true); }
    catch (e) { ok(name, false, e.name + ": " + e.message); }
  };

  /* ── 1. did init finish? this is the one that bit us ── */
  ok("boot cleared", !document.querySelector("#boot"),
     "init threw before bootUp(); check the console for a ReferenceError");
  ok("lobby built", !!document.querySelector(".lobby"));
  ok("reward hook installed", typeof end === "function" && !!end.__wrapped);

  /* ── 2. every global the screens rely on ── */
  const needed = [
    "P", "ST", "lobbyView", "VIEW_ORDER", "GRADES", "UP_TRACKS", "GYM_MACHINES",
    "GYM_STATS", "BOARDS", "DIFFS", "GYMS", "MODES", "SETTINGS", "BOOST_DEF",
    "LOBBY_TABS", "GEAR_RAIL", "PMULT", "fx", "upAverage", "gymLevel", "gymBonus",
  ];
  const missing = needed.filter((n) => {
    try { return eval("typeof " + n) === "undefined"; } catch (e) { return true; }
  });
  ok("globals declared", missing.length === 0, "missing: " + missing.join(", "));

  /* ── 3. every room renders ── */
  for (const v of ["ring", "gym", "plaza"]) {
    await tryIt("view renders: " + v, async () => { setLobbyView(v); await wait(140); });
  }
  setLobbyView("ring"); await wait(120);

  /* ── 4. every screen opens and closes ── */
  const screens = [
    ["settings", () => openSettings("display"), closeSettings, ".settings"],
    ["market", () => openMarket("boosts"), closeMarket, ".market"],
    ["gear up", () => openGear(), closeGear, ".gearup"],
    ["mode select", () => openModeSelect(), closeModeSelect, ".modesel"],
    ["mission setup", () => openMissionSetup(), closeMissionSetup, ".msetup"],
    ["board", () => openBoard("level"),
      () => document.querySelectorAll(".boardwrap").forEach((n) => n.remove()), ".boardwrap"],
    ["trade", () => openTrade(),
      () => document.querySelectorAll(".tradewrap").forEach((n) => n.remove()), ".tradewrap"],
  ];
  for (const [name, open, close, sel] of screens) {
    await tryIt("screen opens: " + name, async () => {
      open(); await wait(130);
      if (!document.querySelector(sel)) throw new Error("no " + sel + " in the DOM");
      close(); await wait(60);
      if (document.querySelector(sel)) throw new Error(sel + " would not close");
    });
  }

  /* ── 5. the numbers still add up ── */
  await tryIt("multipliers sane", async () => {
    const m = PMULT();
    for (const k of ["gold", "luck", "exp", "str"]) {
      if (!isFinite(m[k]) || m[k] <= 0) throw new Error(k + " = " + m[k]);
    }
  });
  await tryIt("upgrade ladder sane", async () => {
    if (GRADES.length !== 18) throw new Error("ladder is " + GRADES.length + " long");
    if (successPct(15) >= 100 || successPct(17) >= successPct(16)) throw new Error("S-rank odds are wrong");
    if (upCost(10) <= upCost(2)) throw new Error("cost does not climb");
  });
  /* the lifts must actually move. Sample several phases rather than two:
     a running stride has the legs together at both 0 and 0.5, so those
     two frames match even though the animation is fine. */
  await tryIt("exercise animations render", async () => {
    const c = document.createElement("canvas"); c.width = 180; c.height = 130;
    const g = c.getContext("2d");
    for (const k of ["squat", "bench", "rack"])
      for (const ph of [0, .25, .5, .75, .99]) drawExercise(g, 180, 130, k, ph, .5, 3);
  });
  await tryIt("rep pose changes", async () => {
    const c = document.createElement("canvas"); c.width = 180; c.height = 130;
    const g = c.getContext("2d");
    for (const k of ["squat", "bench", "rack"]) {
      const frames = new Set();
      for (const ph of [0, .25, .5, .75]) {
        g.clearRect(0, 0, 180, 130);
        drawExercise(g, 180, 130, k, ph, 0, 0);
        frames.add(g.getImageData(0, 0, 180, 130).data.join(","));
      }
      if (frames.size < 3) throw new Error(k + " barely moves (" + frames.size + " distinct frames of 4)");
    }
  });

  await tryIt("gym levels sane", async () => {
    const before = gymBonus("strength");
    if (!isFinite(before)) throw new Error("strength bonus is " + before);
    const lifts = GYM_MACHINES.filter((m) => m.stat === "strength");
    if (lifts.length < 4) throw new Error("expected four lifts, got " + lifts.length);
    if (GYM_MACHINES.some((m) => m.stat && m.stat !== "strength"))
      throw new Error("the gym should only train strength now");
    if (typeof strCap !== "function" || strCap() <= 0) throw new Error("no carry capacity");
    /* levelling must get harder, and the HUD must track it */
    if (gymNeed(5) <= gymNeed(0) * 2) throw new Error("level curve is too flat");
    if (typeof refreshGymHud !== "function") throw new Error("no HUD refresh");
  });

  /* Nothing may sit over a mode when it opens. A scrim with its own
     display beats the hidden attribute, and that put an 86% black sheet
     over the whole street fight from the first frame. Check what the
     player's eye actually lands on, not what the code intended. */
  await tryIt("no scrim over an open mode", async () => {
    openStreetFight();
    await wait(260);
    const cv = document.querySelector("#sf-canvas");
    if (!cv) throw new Error("no canvas");
    const r = cv.getBoundingClientRect();
    const top = document.elementsFromPoint(
      Math.round(r.left + r.width / 2), Math.round(r.top + r.height * .35))[0];
    if (top !== cv) throw new Error("covered by ." + (top.className || top.tagName));
    for (const n of document.querySelectorAll(".sfight *")) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.position !== "absolute") continue;
      const b = n.getBoundingClientRect();
      const bg = cs.backgroundColor.match(/[\d.]+/g);
      const covers = b.width > r.width * .9 && b.height > r.height * .9;
      if (covers && bg && bg.length === 4 && parseFloat(bg[3]) > .4)
        throw new Error("full-screen scrim visible: ." + n.className);
    }
    closeStreetFight();
  });

  setLobbyView("ring");
  return { pass: fails.length === 0, failures: fails, checks: checks.length + " run" };
})()
