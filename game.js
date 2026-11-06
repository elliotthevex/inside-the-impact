/* Inside the Impact: all page scripts.
   Loaded by a plain <script src> at the end of <body>, once the markup exists.
   Keep it a classic script, not a module. The onclick attributes in the markup
   the game generates below, and tools/smoke.js and tools/parity.js, all rely on
   these top-level names being global. */

/* ── 3D arena loader ─────────────────────────────────── */

/* Street Fight 3D loads on click. The import map is added from here because tools/jscheck.py parses every script block as JavaScript. */
document.head.appendChild(Object.assign(document.createElement("script"),{type:"importmap",textContent:JSON.stringify({imports:{three:"./vendor/three/build/three.module.js","three/addons/":"./vendor/three/addons/"}})}));
window.__openRealArena=function(fallback){
  var gl=null;try{gl=document.createElement("canvas").getContext("webgl2");var x=gl&&gl.getExtension("WEBGL_lose_context");if(x)x.loseContext();}catch(e){gl=null;}
  if(!gl)return fallback();
  import("./gfx/arena/index.js").then(function(m){return m.openArena({onFail:function(){fallback();}});}).catch(function(e){console.warn("[arena] falling back to the canvas arena:",e);fallback();});
};

/* ── Static page buttons ─────────────────────────────────── */

/* Buttons written into index.html. These were onclick attributes. The buttons
   the game generates later keep theirs, because the hotkeys find some of them
   by that attribute: see clickLive. */
[
  ["#gear-btn", () => openSettings()],
  ["#guide-close", () => closeInstructions()],
  ["#guide-back", () => changeInstructionPage(-1)],
  ["#guide-next", () => changeInstructionPage(1)],
  ["#guide-start", () => startGameFromInstructions()],
  ["#guide-revisit", () => instructions()],
  ["#open-codex", () => cdx()],
  ["#open-sources", () => cdx(1)],
].forEach(([selector, onClick]) => document.querySelector(selector).addEventListener("click", onClick));

/* ── Main game ─────────────────────────────────── */

      /* Educational UI is deliberately independent of G, F, E and gameplay timers. */
      const TIP_DATA = {
        concussion: {
          title: "Concussion",
          icon: "head",
          intro:
            "Concussion can follow a head impact without a knockout. Signs may appear later.",
          bullets: [
            "Watch for headache, confusion, dizziness or poor balance.",
            "Stop contact and arrange qualified assessment.",
            "No same-day return after suspected concussion.",
          ],
          takeaway: "Feeling fine is not medical clearance.",
        },
        brain: {
          title: "Brain Injuries",
          icon: "brain",
          intro:
            "Head impacts can cause serious harm. The brain diagram shows fictional exposure, not an injury scan.",
          bullets: [
            "Repeated impacts matter, even without obvious symptoms.",
            "Worsening headache, repeated vomiting or seizure are emergency signs.",
            "Declining alertness, weakness or slurred speech also need emergency care.",
          ],
          takeaway:
            "Call local emergency services for danger signs; 119 in South Korea.",
        },
        body: {
          title: "Body Injuries",
          icon: "body",
          intro:
            "Body shots may affect ribs or internal organs. Symptoms can be delayed; diagram colours cannot locate or diagnose injury.",
          bullets: [
            "Watch for abdominal or shoulder pain, pallor and dizziness.",
            "Stop activity and seek urgent assessment for concerning symptoms.",
            "Breathing trouble, fainting or worsening symptoms need emergency care.",
          ],
          takeaway: "Do not dismiss body-impact warning signs.",
        },
        safety: {
          title: "Fighter Safety",
          icon: "shield",
          intro:
            "The corner protects the fighter, not just the score. Screening cannot rule out every injury.",
          bullets: [
            "Warning signs outweigh a reassuring appearance.",
            "Report symptoms honestly and respect medical stoppages.",
            "Wraps, gloves and mouthguards never make head impacts safe.",
          ],
          takeaway:
            "Stop when concerned; only qualified clinicians make medical decisions.",
        },
        recovery: {
          title: "Recovery",
          icon: "recovery",
          intro:
            "Game rest and water reduce simulated fatigue only. They do not diagnose, treat or medically clear an injury.",
          bullets: [
            "Use healthcare-provider-led recovery after suspected concussion.",
            "Return-to-sport steps typically take at least 24 hours each.",
            "Stop and contact the provider if symptoms return; combat-sport rules may be stricter.",
          ],
          takeaway: "An in-game countdown is never clearance.",
        },
        facts: {
          title: "Medical Facts",
          icon: "facts",
          intro:
            "Inside the Impact is an educational simulation, not a medical device. Its indicators are fictional counters.",
          bullets: [
            "Colours do not measure tissue damage, location or severity.",
            "A normal-looking observation cannot exclude injury.",
            "Original educational entries and sources remain in the Codex.",
          ],
          takeaway:
            "Use qualified assessment, not game values, for real medical decisions.",
        },
        controls: {
          title: "Game Controls",
          icon: "controls",
          intro:
            "You coach; bouts run automatically. Earn six wins in eight qualifiers, then beat the champion. Three ordinary losses end qualification.",
          bullets: [
            "Camp: choose training, rest, observations, or medical treatment when injury flags persist.",
            "Between rounds: choose tactics and one corner action.",
            "Safety stoppages/forfeits use a bout, not a loss; Tab and Enter/Space activate controls.",
          ],
          takeaway: "Escape closes tips; tips never reset or pause the bout.",
        },
      };
      function tipIcon(key) {
        const paths = {
          head: '<path d="M9 20v-4H6v-5H4l3-6a7 7 0 0 1 13 4c0 3-2 5-4 6v5"/><path d="m11 6-1 4 4-1-1 4"/>',
          brain:
            '<path d="M12 5c-3-5-8-1-6 3-4 1-4 6-1 7-1 5 5 7 7 3 2 4 8 2 7-3 3-1 3-6-1-7 2-4-3-8-6-3Z"/><path d="M12 5v13M7 9l2 2-2 2m10-4-2 2 2 2"/>',
          body: '<path d="m8 3-4 3 2 6 1 9h10l1-9 2-6-4-3M12 6v9M7 9h10M8 12h8M9 16h6"/>',
          shield:
            '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
          recovery:
            '<path d="M5 6a9 9 0 1 1-2 8M5 2v5H1"/><path d="M12 7v5l3 2"/>',
          facts:
            '<path d="M5 3h11l3 3v15H5Z"/><path d="M12 6v6M9 9h6M8 16h8"/>',
          controls:
            '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 12h4M9 10v4m6-3h1m2 3h1"/>',
        };
        return (
          '<svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          (paths[key] || paths.facts) +
          "</svg>"
        );
      }
      const escapeUI = (text) =>
        String(text).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
      const packUI = (text) =>
        encodeURIComponent(String(text)).replace(/'/g, "%27");
      function categoryFor(text) {
        const s = String(text)
          .replace(/<[^>]*>/g, "")
          .toLowerCase();
        if (
          /concussion|headache|dazed|wobbly|vacant|head shots|guard reset/.test(
            s,
          )
        )
          return "concussion";
        if (/brain|head impact|knockout|knocked|neurological|cte/.test(s))
          return "brain";
        if (
          /rib|body shot|abdomen|abdominal|torso|liver|spleen|hand|knuckle|eye|cut care/.test(
            s,
          )
        )
          return "body";
        if (/rest|sleep|recover|fatigue|fuel|hydration|water|fluid/.test(s))
          return "recovery";
        return "safety";
      }
      function infoButton(title, html, key, css = "tip-inline") {
        key = key || categoryFor(html);
        return `<button type="button" class="${css}" aria-haspopup="dialog" onclick="openTip('${key}',decodeURIComponent('${packUI(html)}'),decodeURIComponent('${packUI(title)}'))">${tipIcon(TIP_DATA[key].icon)}<span>${escapeUI(title)}</span><span aria-hidden="true">↗</span></button>`;
      }
      function contextTip(key, label) {
        return `<button type="button" class="tip-inline" aria-haspopup="dialog" onclick="openTip('${key}')">${tipIcon(TIP_DATA[key].icon)}<span>${escapeUI(label || TIP_DATA[key].title)}</span><span aria-hidden="true">↗</span></button>`;
      }
      function compactMessage(html) {
        const plain = String(html)
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        const first = (plain.match(/^.*?[.!?](?:\s|$)/) || [plain])[0].trim();
        const short = first.length > 120 ? first.slice(0, 117) + "…" : first;
        return `<div class="action-result">${escapeUI(short)}</div>${infoButton("Action details", html)}`;
      }
      function compactDetail(title, html, key) {
        return `<details class="educational-details"><summary>${escapeUI(title)}</summary><div class="detail-copy">${html}</div>${key ? contextTip(key, "Related tip") : ""}</details>`;
      }
      TIP_DATA.facts.originalCaveat =
        "Colour and values are game-only exposure indicators. They do not represent actual tissue damage, diagnostic scores, precise injury locations, or predict injury severity. Brain indicators are not precise locations or injury scans. Torso indicators are not tissue damage or diagnosis.";
      const educationalDialog = document.querySelector("#tip-dialog");
      let educationalReturnFocus = null,
        educationalReturnScroll = 0,
        educationalPausedCombat = false;
      let combatTimer = null, combatDue = 0, combatRemaining = 0, combatCallback = null;
      function scheduleCombat(callback, delay) {
        clearTimeout(combatTimer);
        combatCallback = callback;
        combatRemaining = delay;
        combatDue = Date.now() + delay;
        combatTimer = setTimeout(() => { combatTimer = null; combatCallback = null; combatRemaining = 0; callback(); }, delay);
      }
      function pauseCombatForEducation() {
        if (!combatTimer) return;
        combatRemaining = Math.max(0, combatDue - Date.now());
        clearTimeout(combatTimer); combatTimer = null;
      }
      function resumeCombatAfterEducation() {
        if (!combatCallback || combatTimer) return;
        scheduleCombat(combatCallback, combatRemaining);
      }
      function showEducational(title, html) {
        if (!educationalDialog.open) {
          educationalReturnFocus = document.activeElement;
          educationalReturnScroll = window.scrollY;
          if (F && F.busy && F.i < 8 && $("#cv").style.display === "block") { educationalPausedCombat = true; pauseCombatForEducation(); }
        }
        document.querySelector("#tip-title").textContent = title;
        document.querySelector("#tip-content").innerHTML = html;
        if (!educationalDialog.open) educationalDialog.showModal();
        document.querySelector("#tip-scroll").scrollTop = 0;
        document.querySelector("#tip-close").focus({ preventScroll: true });
      }
      function openTip(key, detail = "", detailTitle = "Original explanation") {
        const t = TIP_DATA[key];
        if (!t) return;
        if (key === "facts" && !detail) {
          detail = t.originalCaveat;
          detailTitle = "Full visualization limitations";
        }
        showEducational(
          t.title,
          `<div class="tip-intro">${tipIcon(t.icon)}<p>${escapeUI(t.intro)}</p></div><ul class="tip-points">${t.bullets.map((b) => "<li>" + escapeUI(b) + "</li>").join("")}</ul><div class="key-takeaway"><span>Key Takeaway</span><p>${escapeUI(t.takeaway)}</p></div>${detail ? compactDetail(detailTitle, detail) : ""}<div class="tip-footnote">Detailed reading pauses the exchange. Close to resume. Medical stops remain in force.</div>`,
        );
      }
      function openArticle(title, html) {
        showEducational(title, html);
      }
      function closeEducational() {
        if (educationalDialog.open) educationalDialog.close();
      }
      educationalDialog.addEventListener("close", () => {
        if (educationalSafetyTransition) {
          educationalSafetyTransition = false;
          const warning =
            document.querySelector("#m .safety-required") ||
            document.querySelector("#m .c.res") ||
            document.querySelector("#m .c.r") ||
            document.querySelector("#m .c");
          if (warning) {
            warning.setAttribute("tabindex", "-1");
            warning.focus({ preventScroll: true });
            warning.scrollIntoView({ block: "start" });
          }
          return;
        }
        const target =
          educationalReturnFocus && educationalReturnFocus.isConnected
            ? educationalReturnFocus
            : document.querySelector('[data-tip-key="controls"]');
        if (target) target.focus({ preventScroll: true });
        window.scrollTo(0, educationalReturnScroll);
        if (educationalPausedCombat) { educationalPausedCombat = false; resumeCombatAfterEducation(); }
      });
      document
        .querySelector("#tip-close")
        .addEventListener("click", closeEducational);
      educationalDialog.addEventListener("click", (event) => {
        if (event.target !== educationalDialog) return;
        const r = educationalDialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          closeEducational();
      });
      document.querySelector("#tip-cards").innerHTML = Object.entries(TIP_DATA)
        .map(
          ([key, t]) =>
            `<button type="button" class="tip-card" data-tip-key="${key}" aria-haspopup="dialog" aria-controls="tip-dialog" onclick="openTip('${key}')">${tipIcon(t.icon)}<span>${t.title}</span><span class="tip-arrow" aria-hidden="true">↗</span></button>`,
        )
        .join("");
      educationalDialog.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const items = [
          ...educationalDialog.querySelectorAll(
            'button:not(:disabled),a[href],summary,input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
          ),
        ].filter((el) => el.getClientRects().length > 0);
        const first = items[0],
          last = items[items.length - 1];
        if (!first) {
          event.preventDefault();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !educationalDialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !educationalDialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      });

      let educationalSafetyTransition = false;
      function revealSafetyNotice() {
        if (!educationalDialog.open) return;
        educationalSafetyTransition = true;
        educationalDialog.close();
      }

      const $ = (s) => document.querySelector(s),
        rn = Math.random,
        R = (a, b) => a + rn() * (b - a),
        cl = (v, a, b) => Math.max(a, Math.min(b, v));

      const PREF_KEY = "impact-ui-preferences-v1";
      let uiPrefs = { motion: false, shake: false, sound: false, text: "normal" }, uiAudio = null;
      function applyUiPrefs() {
        document.body.classList.toggle("reduce-motion", uiPrefs.motion);
        document.body.classList.toggle("has-shake", uiPrefs.shake); document.body.classList.toggle("no-shake", !uiPrefs.shake);
        document.documentElement.dataset.textSize = uiPrefs.text;
        $("#pref-motion").checked = uiPrefs.motion; $("#pref-shake").checked = uiPrefs.shake; $("#pref-sound").checked = uiPrefs.sound; $("#pref-text").value = uiPrefs.text;
      }
      try { uiPrefs = { ...uiPrefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; } catch {}
      applyUiPrefs();
      function saveUiPrefs() { localStorage.setItem(PREF_KEY, JSON.stringify(uiPrefs)); applyUiPrefs(); }
      $("#pref-motion").addEventListener("change", e => { uiPrefs.motion = e.target.checked; saveUiPrefs(); });
      $("#pref-shake").addEventListener("change", e => { uiPrefs.shake = e.target.checked; saveUiPrefs(); });
      $("#pref-text").addEventListener("change", e => { uiPrefs.text = e.target.value; saveUiPrefs(); });
      $("#pref-sound").addEventListener("change", e => { uiPrefs.sound = e.target.checked; if (uiPrefs.sound) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { uiAudio = uiAudio || new AC(); uiAudio.resume(); } } saveUiPrefs(); });
      function playImpactCue(hit, who) {
        if (hit && uiPrefs.shake && !uiPrefs.motion) { const canvas = $("#cv"); canvas.classList.remove("impact-shake"); void canvas.offsetWidth; canvas.classList.add("impact-shake"); setTimeout(() => canvas.classList.remove("impact-shake"), 130); }
        if (!uiPrefs.sound || !uiAudio || uiAudio.state !== "running") return;
        const o = uiAudio.createOscillator(), g = uiAudio.createGain();
        o.type = "square"; o.frequency.value = hit ? (who ? 105 : 145) : 82;
        g.gain.setValueAtTime(.0001, uiAudio.currentTime); g.gain.exponentialRampToValueAtTime(hit ? .035 : .012, uiAudio.currentTime + .008); g.gain.exponentialRampToValueAtTime(.0001, uiAudio.currentTime + .07);
        o.connect(g); g.connect(uiAudio.destination); o.start(); o.stop(uiAudio.currentTime + .075);
      }
      const NM = [
          "Diego Alvarez",
          "Marcus Hale",
          "Ivan Petrov",
          "Tomas Reyes",
          "Kofi Mensah",
          "Jin Park",
          "Luca Bianchi",
          "Andre Silva",
        ],
        STY = [
          {
            bt: 0.75,
            ti: 1,
            p: 0,
            s: 0,
            d: 0,
            drop: "def",
            sc: "Body-puncher who works the ribs and liver. Watch for belly pain later.",
          },
          {
            bt: 0.5,
            ti: 1,
            p: -1,
            s: 1,
            d: 0,
            drop: "pow",
            sc: "Fast counter-puncher. Wins on points if he sets the pace.",
          },
          {
            bt: 0.5,
            ti: 1.6,
            p: 2,
            s: -1,
            d: 0,
            drop: "sta",
            sc: "Heavy slugger who tires fast. Survive early, press when his hands drop.",
          },
          {
            bt: 0.5,
            ti: 1,
            p: -1,
            s: 0,
            d: 2,
            drop: "pow",
            sc: "Defensive technician, hard to hit. Be patient and protect your hands.",
          },
          {
            bt: 0.55,
            ti: 1.2,
            p: 0,
            s: 1,
            d: -1,
            drop: "def",
            sc: "Pressure fighter with relentless volume. Manage fatigue and cuts.",
          },
        ],
        CH = {
          n: "Ruben “The Wall” Okafor",
          pow: 7,
          spd: 6,
          def: 7,
          sta: 7,
          bt: 0.55,
          drop: "spd",
          ti: 1,
          sc: "Reigning champion: strong, patient, technically sound. Never walk in tired or injured.",
        };
      // Fictional balance knobs only. They are not clinical thresholds or medical decision rules.
      const BAL = {
        firstOpponent: { speedPenalty: 1, defencePenalty: 1 },
        medical: {
          /* headWarn: signs become visible and the call is YOURS.
             headStop: so extreme the doctor takes the decision away.
             The band between them is where this game actually lives —
             at 14 the old build simply forced a stop, so the player was
             handed an instruction instead of a decision. */
          headWarn: 7,
          headStop: 20,
          bodyStop: 22,
          /* Real concussion risk begins just inside the warning band, so
             every extra round after the signs appear is a gamble the
             player chose to take rather than one the game imposed. */
          concussionExposure: 10,
          concussionChance: 0.14,
        },
      };
      function mkOpp(i) {
        const t = STY[i % 5],
          b = 3 + Math.floor(i * 0.4),
          o = {
            n: NM[i],
            pow: cl(b + t.p, 2, 8),
            spd: cl(b + 1 + t.s, 2, 8) + 1,
            def: cl(b + t.d, 2, 8),
            sta: cl(b + 1, 2, 8) + 1,
            bt: t.bt,
            ti: t.ti,
            sc: t.sc,
          };
        o[t.drop] = Math.max(2, o[t.drop] - 1);
        if (i === 0) {
          o.spd = Math.max(1, o.spd - BAL.firstOpponent.speedPenalty);
          o.def = Math.max(1, o.def - BAL.firstOpponent.defencePenalty);
          o.sc +=
            " Opening bout: slower footwork and a looser guard give you room to learn.";
        }
        return o;
      }
      let G,
        F,
        A = null,
        E;
      function newGame() {
        G = {
          st: 0,
          tp: {},
          tip: "",
          days: 5,
          dx: false,
          out: 0,
          hits: 0,
          doc: 0,
          hard: 0,
          fc: false,
          oi: 0,
          me: {
            pow: 5,
            spd: 5,
            def: 5,
            sta: 5,
            fat: 10,
            head: 0,
            body: 0,
            conc: false,
            cd: 0,
            abd: false,
            cut: 0,
            eye: false,
            ed: 0,
            hand: false,
            hd: 0,
            sdh: false,
            lb: [0, 0, 0, 0, 0],
            sd: [0, 0],
            peak: 0,
            /* Career head exposure. Accumulates across every bout and is
               never reset, never shown in the status panel, and never
               mentioned until the career is over — because that is the
               actual epistemic situation a corner is in. */
            career: 0,
            boutsConcussed: 0,
          },
        };
        /* what you have unlocked shows up in the fighter you take to camp:
           punches add power, footwork adds speed, guard and slip add
           defence. Small, so the simulation's own balance still leads. */
        try {
          ensureSkills();
          const sk = skillStats();
          G.me.pow = cl(G.me.pow + Math.min(3, sk.dmg / 22), 1, 10);
          G.me.spd = cl(G.me.spd + Math.min(2, (sk.spd - 1) * 4 + (sk.move - 1) * 3), 1, 10);
          G.me.def = cl(G.me.def + Math.min(3, sk.soak * 4 + sk.evade * 4), 1, 10);
        } catch (e) {}
        G.w = 0;
        G.l = 0;
        G.k = 0;
        G.res = [];
        G.champ = false;
        G.checkedThisCamp = false;
        G.opp = mkOpp(0);
        intro();
      }
      function setGamePhase(phase) {
        document.body.dataset.phase = phase;
        const nav = $("#tournament-nav");
        if (nav) nav.hidden = phase === "title";
        const headings = {
          camp: ["Camp decisions", "Develop skills · recover · prepare safely"],
          "pre-bout": ["Pre-bout readiness", "Opponent preview · condition · weigh-in"],
          fight: ["Live bout", "Observe the exchange · coach the next safe response"],
          "between-rounds": ["Coaching decisions", "Safety assessment comes before another round"],
          result: ["Bout outcome", "Review the result · protect the fighter"],
          title: ["Coaching decisions", "Choose an action · safety overrides the score"],
        }[phase] || ["Coaching decisions", "Choose an action · safety overrides the score"];
        const title = $("#coach-area-head h2"), subtitle = $("#coach-area-head span");
        if (title) title.textContent = headings[0];
        if (subtitle) subtitle.textContent = headings[1];
        updateTrainingFatigueRule();
      }
      function renderOpponentPreview(mode) {
        const panel = $("#phase-summary");
        if (!panel || !G || !G.opp) return;
        const o = G.opp;
        panel.innerHTML = `<div class="phase-summary-heading"><span>${mode === "pre-bout" ? "PRE-BOUT · OPPONENT PREVIEW" : "UP NEXT · OPPONENT PREVIEW"}</span><strong>${escapeUI(o.n)}</strong></div><div class="opponent-simulation-label">FICTIONAL GAME PROFILE</div><div class="opponent-stat-row"><span>Power <b>${Math.round(o.pow)}</b></span><span>Speed <b>${Math.round(o.spd)}</b></span><span>Defence <b>${Math.round(o.def)}</b></span><span>Stamina <b>${Math.round(o.sta)}</b></span></div><p class="opponent-scouting">${o.sc}</p>`;
        panel.hidden = false;
      }
      function updateTrainingFatigueRule() {
        const block = $("#camp-fatigue-rule");
        if (!block || typeof G === "undefined" || !G || !G.me) return;
        const inCamp = document.body.dataset.phase === "camp";
        block.hidden = !inCamp;
        const projection = $("#training-fatigue-projection");
        const outcome = $("#training-fatigue-outcome");
        if (!projection || !outcome) return;
        const m = G.me, projected = Math.min(100, Math.round(m.fat + 25));
        projection.textContent = `Next session: +25 → ${projected}/100`;
        const overreach = m.fat + 25 > 85;
        const allMaxed = ["pow", "spd", "def", "sta"].every(k => m[k] >= 10);
        outcome.textContent = hasConcern()
          ? "Training is safety-locked. Rest changes game fatigue only; it is not medical clearance."
          : G.days <= 0
            ? "No camp days remain; training is unavailable."
            : overreach
              ? "No skill gain this session; game fatigue still rises."
              : allMaxed
                ? "All skills are at 10/10; no further skill gain is possible."
                : "An eligible unmaxed skill gains +1 in this simulation.";
      }
      function syncTournamentProgress() {
        const nav = $("#tournament-nav"), track = $("#tournament-progress-marks"), copy = $("#tournament-progress-copy");
        if (!nav || !track || !copy || typeof G === "undefined" || !G) return;
        const results = Array.isArray(G.res) ? G.res : [];
        const marks = [];
        for (let i = 0; i < 8; i++) {
          const result = results[i] || "";
          const current = !G.champ && i === G.k && !result;
          const label = result === "W" ? `Bout ${i + 1}: win` : result === "L" ? `Bout ${i + 1}: ordinary loss` : result === "S" ? `Bout ${i + 1}: safety stop` : current ? `Bout ${i + 1}: current` : `Bout ${i + 1}: upcoming`;
          marks.push(`<i class="${result} ${current ? "cur" : ""}" aria-label="${label}" title="${label}">${result === "S" ? "✚" : result || (i + 1)}</i>`);
        }
        const titleCurrent = !!G.champ;
        marks.push(`<i class="title-mark ${titleCurrent ? "cur" : ""}" aria-label="Title fight${titleCurrent ? ": current" : ": qualification goal"}" title="Title fight${titleCurrent ? ": current" : ": qualification goal"}">♛</i>`);
        track.innerHTML = marks.join("");
        const wins = Number(G.w) || 0, losses = Number(G.l) || 0;
        const needed = Math.max(0, 6 - wins);
        copy.textContent = `${wins} wins · ${losses} ordinary losses · ${titleCurrent ? "title fight" : `${needed} more win${needed === 1 ? "" : "s"} to qualify`}`;
        nav.hidden = document.body.dataset.phase === "title";
      }
      function setLandingChrome(show) {
        const display = show ? "" : "none";
        document.querySelector(".game-header").style.display = display;
        document.querySelector(".safety-strip").style.display = "";
        document.querySelector("#learning").style.display = display;
        document.querySelector("#injury-monitor").style.display = show ? "block" : "none";
        document.querySelector("#w").classList.toggle("landing-layout", !show);
        const nav = $("#tournament-nav"); if (nav) nav.hidden = !show;
        const training = $("#camp-training-top"); if (!show && training) { training.replaceChildren(); training.hidden = true; }
      }
      function intro() {
        setLandingChrome(false);
        setGamePhase("title");
        document.body.dataset.s = "title";
        $("#cv").style.display = "none";
        $("#sub").textContent = "";
        $("#m").innerHTML =
          `<section class="title-screen landing-screen"><div class="title-kicker">A BOXING DECISION SIMULATION</div><h1>INSIDE THE IMPACT</h1><button class="b p title-start" onclick="instructions()">START COACHING ▶<small>Read the instructions before your first camp decision</small></button><div class="title-credit">Created by Joohyun Lee and Elliot Jeong</div></section>`;
        window.scrollTo(0, 0);
      }
      let instructionPage = 0;
      let instructionReturnState = "title";
      function renderInstructionPage() {
        const dialog = $("#instruction-guide");
        const pages = Array.from(dialog.querySelectorAll("[data-guide-page]"));
        pages.forEach((page, index) => { page.hidden = index !== instructionPage; });
        $("#guide-page-number").textContent = String(instructionPage + 1);
        const dots = dialog.querySelectorAll(".guide-dots i");
        dots.forEach((dot, index) => dot.classList.toggle("active", index === instructionPage));
        $("#guide-back").disabled = instructionPage === 0;
        $("#guide-next").hidden = instructionPage === pages.length - 1;
        $("#guide-start").hidden = instructionPage !== pages.length - 1;
        $("#guide-start").textContent = instructionReturnState === "title" ? "Start game →" : "Return to game →";
        const heading = pages[instructionPage].querySelector("h2");
        if (heading) dialog.setAttribute("aria-labelledby", heading.id);
        if (heading) heading.focus({ preventScroll: true });
        const scrollPane = dialog.querySelector(".guide-pages");
        if (scrollPane) scrollPane.scrollTop = 0;
      }
      function instructions() {
        const currentState = document.body.dataset.s || "title";
        instructionPausedCombat = false;
        if (currentState === "fight" && F && F.busy && F.i < 8 && $("#cv").style.display === "block") {
          instructionPausedCombat = true;
          pauseCombatForEducation();
        }
        instructionReturnState = currentState;
        instructionPage = 0;
        const dialog = $("#instruction-guide");
        if (!dialog.open) dialog.showModal();
        renderInstructionPage();
      }
      function changeInstructionPage(step) {
        const count = $("#instruction-guide").querySelectorAll("[data-guide-page]").length;
        instructionPage = cl(instructionPage + step, 0, count - 1);
        renderInstructionPage();
      }
      let instructionPausedCombat = false;
      $("#instruction-guide").addEventListener("close", () => {
        if (instructionPausedCombat) {
          instructionPausedCombat = false;
          resumeCombatAfterEducation();
        }
      });
      function closeInstructions() {
        const dialog = $("#instruction-guide");
        if (dialog.open) dialog.close("dismissed");
      }
      function startGameFromInstructions() {
        const startFreshGame = instructionReturnState === "title";
        const dialog = $("#instruction-guide");
        if (dialog.open) dialog.close("start");
        if (typeof closeLobby === "function") closeLobby();
        if (startFreshGame) hub();
      }
      /* ══ FRONT END ═══════════════════════════════════════════════
         Boot → lobby → gym load → simulation. All art is pixel art
         drawn into canvases at runtime, so the game stays one file
         that works offline with no asset pipeline. */

      const px = (w, h) => {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const x = c.getContext("2d");
        x.imageSmoothingEnabled = false;
        return { c, x };
      };
      const cl01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
      const eOut = (v) => 1 - Math.pow(1 - cl01(v), 3);
      const eIn = (v) => Math.pow(cl01(v), 2.4);
      /* deterministic noise so a given gym always looks like itself */
      const rnd = (s) => { let v = Math.sin(s * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

      /* ── PLAYER PROFILE ──────────────────────────────────────────
         Persistent meta layer. The economy is the lesson: a safety
         stop pays more than a win, because the pressure this game
         teaches you to resist is the pressure to treat it as a loss. */
      const PROFILE_KEY = "iti.profile.v2";
      /* share: the fraction of the chosen difficulty's purse this outcome
         earns. A stoppage to protect the fighter earns the full purse —
         the economy has to agree with what the game is teaching, or the
         player learns the opposite of the lesson. */
      const REWARDS = {
        win:     { share: 1,   xpShare: 1,    sp: 2, label: "Win" },
        lose:    { share: .4,  xpShare: .62,  sp: 1, label: "Loss" },
        towel:   { share: 1,   xpShare: 1.6,  sp: 2, label: "Corner stoppage" },
        medstop: { share: 1,   xpShare: 1.6,  sp: 2, label: "Medical stoppage" },
        sdh:     { share: .25, xpShare: .85,  sp: 1, label: "Catastrophic outcome" },
        ko:      { share: .25, xpShare: .85,  sp: 1, label: "Knockout" },
        champ:   { share: 2,   xpShare: 2.4,  sp: 6, label: "Title won" },
        ret:     { share: .5,  xpShare: .75,  sp: 1, label: "Retirement" },
      };
      const xpNeed = (lv) => 200 + lv * 140;
      /* The four numbers on the lobby card. Gold and Exp are read by the
         payout, so what the card shows is what the bout actually pays.
         Luck and Strength are displayed but nothing consumes them yet. */
      const PMULT = () => {
        const lv = (P && P.lv) || 1;
        const m = {
          gold: 1 + (lv - 1) * 0.01,
          luck: 1 + (lv - 1) * 0.01,
          exp: 1 + (lv - 1) * 0.02,
          str: 1.05 + (lv - 1) * 0.01 + (typeof gymBonus === 'function' ? gymBonus('strength') : 0),
        };
        /* a running boost multiplies its own number */
        if (typeof BOOST_DEF === "object" && P && P.boosts) {
          for (const k in BOOST_DEF) {
            if (P.boosts[k] > Date.now()) m[k] *= BOOST_DEF[k].mult;
          }
        }
        return m;
      };
      const fx = (v) => {
        const n = Math.round(v * 1000) / 1000;
        return (Number.isInteger(n) ? n.toFixed(1) : String(n)) + "x";
      };
      let P = null;
      function loadProfile() {
        const base = { lv: 1, xp: 0, gold: 0, gems: 0, bouts: 0, wins: 0, stops: 0, seen: 0, train: 0, boosts: {}, up: null, gymStat: { strength: 0 }, skills: null, sp: 3, gym: { bag: 1 } };
        try {
          const raw = localStorage.getItem(PROFILE_KEY);
          P = raw ? Object.assign(base, JSON.parse(raw)) : base;
        } catch (e) { P = base; }
        return P;
      }
      function saveProfile() {
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(P)); } catch (e) {}
      }
      function grantReward(kind) {
        const base = REWARDS[kind];
        if (!base || !P) return null;
        const d = activeDiff || DIFFS[0];
        const gm = activeGymMult || 1, PM = PMULT();
        const r = Object.assign({}, base, {
          gold: Math.round(d.gold * base.share * PM.gold * gm),
          gems: Math.round(d.gems * gm * base.share),
          xp: Math.round((d.xp || 120) * gm * PM.exp * base.xpShare),
          sp: base.sp || 0,
          diff: d.name,
        });
        P.gold += r.gold; P.gems += r.gems; P.xp += r.xp; P.bouts++;
        P.sp = (P.sp || 0) + (r.sp || 0);
        if (kind === "win" || kind === "champ") P.wins++;
        if (kind === "towel" || kind === "medstop") P.stops++;
        let gained = 0;
        while (P.xp >= xpNeed(P.lv)) { P.xp -= xpNeed(P.lv); P.lv++; gained++; }
        saveProfile();
        return { ...r, levels: gained };
      }

      /* ── PIXEL ART · LOBBY PUNCH ─────────────────────────────────
         Close-up: a straight right landing flush. The head is built
         from a silhouette profile, drawn to a buffer, then blitted
         column by column through a shockwave displacement — so the
         cheek actually caves and the face twists off the impact
         instead of just sliding sideways. Every measurement is a
         percentage, so the frame holds whatever window it is given. */
      const SK = "#e0a478", SK2 = "#bd7e56", SK3 = "#8f5737", SK4 = "#6d4028",
            SKH = "#ffd2a8", HR = "#17120d", HR2 = "#2b2217",
            EYEW = "#f6edda", PUP = "#1b1109",
            MTH = "#3f0f0c", GRD = "#e6eef4",
            GL = "#cc3728", GL2 = "#941d14", GL3 = "#5f0f0a", GLH = "#ef6e59",
            LAC = "#f2e3c4", WRAP = "#2b3440", WRAP2 = "#1a212b";
      const headBuf = px(8, 8);

      /* head in three-quarter profile facing left: [y%, left%, right%] */
      const PROF = [
        [0, 37, 63], [4, 28, 73], [9, 22, 80], [15, 18, 84], [22, 15, 86],
        [28, 13, 86], [33, 14, 86], [38, 12, 85], [44, 8, 84], [49, 5, 83],
        [53, 10, 83], [57, 8, 82], [62, 7, 81], [67, 9, 79], [72, 12, 77],
        [77, 15, 74], [83, 21, 68], [88, 30, 61], [92, 38, 56],
      ];
      function silhouette(y) {
        for (let i = 1; i < PROF.length; i++) {
          if (y <= PROF[i][0] || i === PROF.length - 1) {
            const a = PROF[i - 1], b = PROF[i];
            const k = cl01((y - a[0]) / Math.max(.001, b[0] - a[0]));
            return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
          }
        }
        return [20, 80];
      }

      function drawHead(w, h, sq) {
        headBuf.c.width = w; headBuf.c.height = h;
        const x = headBuf.x;
        x.imageSmoothingEnabled = false;
        x.clearRect(0, 0, w, h);
        const U = w / 100, V = h / 100;
        const b = (X, Y, W, H, c) => {
          x.fillStyle = c;
          x.fillRect(Math.round(X * U), Math.round(Y * V),
                     Math.max(1, Math.round(W * U)), Math.max(1, Math.round(H * V)));
        };
        const js = sq * 4.5, jd = sq * 5;          /* jaw swing / drop */
        const band = 1.6;

        /* neck and trapezius, behind everything */
        b(44, 84, 36, 18, SK4);
        b(48, 82, 28, 20, SK3);
        b(53, 85, 18, 17, SK2);

        /* ── silhouette, filled band by band ── */
        for (let y = 0; y < 93; y += band) {
          let [xl, xr] = silhouette(y);
          let yy = y;
          if (y > 62) { const k = (y - 62) / 31; xl += js * k; xr += js * k; yy += jd * k; }
          const bw = xr - xl;
          const hair = y < 23;
          b(xl, yy, bw, band + .4, hair ? HR : SK);
          if (!hair) {
            b(xr - bw * .20, yy, bw * .20, band + .4, SK2);   /* back of head falls away */
            b(xr - bw * .07, yy, bw * .07, band + .4, SK3);
            if (y < 32) b(xl + bw * .24, yy, bw * .34, band + .4, SKH);
            if (y > 74) b(xl, yy, bw, band + .4, y > 84 ? SK3 : SK2);
          } else if (y > 4 && y < 19) {
            b(xl + bw * .22, yy, bw * .3, band + .4, HR2);     /* sheen on the crop */
          }
        }
        /* hairline edge and back of the crop */
        for (let y = 23; y < 40; y += band) {
          const [, xr] = silhouette(y);
          b(xr - 7, y, 7, band + .4, HR);
        }
        b(13, 22, 70, 2.4, HR);

        /* ── features ── */
        /* brow ridge and shadowed socket */
        b(13, 27, 34, 4, HR);
        b(15, 31, 29, 4, SK3);
        b(45, 28, 16, 3, SK2);
        /* eye — open, then squeezed shut under the shot */
        const lid = sq * 5;
        if (lid < 4.2) {
          b(17, 34 + lid, 21, 7 - lid, EYEW);
          b(23, 35 + lid, 7, Math.max(1.5, 6 - lid), PUP);
          b(24, 36 + lid, 2.4, Math.max(.8, 2.4 - lid), "#3f6f8a");
          b(17, 34 + lid, 21, 1.4, SK4);
        } else {
          b(17, 38, 21, 2.2, SK4);
        }
        /* cheekbone — the plane the glove is sitting on */
        b(14, 42, 30, 11, sq > .4 ? SK3 : SK2);
        b(16, 43, 24, 8, sq > .25 ? SK3 : SKH);
        if (sq > .45) b(17, 45, 19, 5, SK4);
        /* nostril and the shadow under the nose */
        b(9, 49, 7, 3.4, SK4);
        b(8, 52, 16, 3, SK3);
        /* mouth — opens, skews, mouthguard shows */
        const mO = sq * 7, mS = js;
        b(11 + mS, 61 + jd * .6, 36, 3, SK4);
        b(12 + mS, 63 + jd * .6, 33, 4 + mO, MTH);
        b(15 + mS, 64 + jd * .6, 26, 3, GRD);
        if (sq > .35) b(15 + mS, 66 + jd * .6 + mO - 2, 21, 2.2, "#c9d5de");
        b(12 + mS, 69 + jd * .6 + mO, 31, 2.4, SK3);
        /* chin and under-jaw */
        b(16 + js, 76 + jd, 30, 4, SK3);
        b(20 + js, 85 + jd, 34, 5, SK4);
        /* ear */
        b(68, 39, 11, 16, SK2); b(70, 42, 6.5, 10, SK3); b(71.5, 45, 3, 4.5, SK);
        /* sweat sheen */
        b(42, 16, 3.4, 1.6, SKH); b(58, 20, 2.6, 1.6, SKH); b(63, 56, 2.2, 1.4, SKH);
        /* cut over the eye, once the shot has landed */
        if (sq > .25) { b(14, 24, 9, 2.2, "#9c1e18"); b(16, 26, 5.5, 1.6, "#78130f"); }
      }

      /* glove + forearm, leading edge at gx, vertical centre at gy */
      function drawGlove(x, gx, gy, gh, sq) {
        const b = (X, Y, W, H, c) => {
          x.fillStyle = c;
          x.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(W)), Math.max(1, Math.round(H)));
        };
        const gw = gh * .94, flat = sq * gh * .11;
        const top = gy - gh / 2, bx = gx - gw;
        /* forearm and wrap running back off frame */
        b(-6, gy - gh * .26, bx + 6, gh * .52, WRAP2);
        b(-6, gy - gh * .19, bx + 4, gh * .38, WRAP);
        for (let i = 0; i < 10; i++) b(bx - gh * .18 - i * gh * .17, gy - gh * .21, gh * .05, gh * .42, "#141a22");
        /* cuff */
        b(bx - gh * .17, top + gh * .13, gh * .23, gh * .76, GL3);
        b(bx - gh * .13, top + gh * .19, gh * .17, gh * .64, GL2);
        /* glove body, compressing into the cheek */
        b(bx, top + flat * .5, gw - flat, gh - flat, GL2);
        b(bx + gh * .05, top + gh * .11 + flat * .5, gw - gh * .10 - flat, gh * .74 - flat, GL);
        b(bx + gh * .08, top + gh * .17, gw * .36, gh * .27, GLH);
        /* knuckle face flattened against the skin */
        b(gx - gw * .17 - flat, top + gh * .13 + flat, gw * .19, gh * .72 - flat * 2, GL2);
        b(gx - gw * .14 - flat, top + gh * .23 + flat, gw * .10, gh * .48 - flat * 2, GLH);
        /* laces and thumb */
        b(bx + gh * .05, top + gh * .33, gh * .07, gh * .33, LAC);
        for (let i = 0; i < 4; i++) b(bx - gh * .03, top + gh * .33 + i * gh * .10, gh * .19, gh * .027, LAC);
        b(bx + gh * .02, top + gh * .70, gh * .33, gh * .25, GL2);
        b(bx + gh * .06, top + gh * .74, gh * .24, gh * .17, GL);
      }

      function drawPunchScene(ctx, W, H, t) {
        const b = (X, Y, Wd, Ht, c) => {
          ctx.fillStyle = c;
          ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(Wd)), Math.max(1, Math.round(Ht)));
        };
        /* impulse: a hard spike, then a damped wobble as the head rings */
        let imp = 0;
        if (t >= .44 && t < .485) imp = (t - .44) / .045;
        else if (t >= .485) {
          const k = (t - .485) / .5;
          imp = Math.max(0, Math.cos(k * Math.PI * 2.1) * Math.exp(-k * 3.4));
        }
        const sq = cl01(imp);
        /* glove travel */
        let ext;
        if (t < .40) ext = eIn(t / .40) * .13;
        else if (t < .47) ext = .13 + .87 * eOut((t - .40) / .07);
        else if (t < .60) ext = 1 - .05 * ((t - .47) / .13);
        else ext = .95 * (1 - eOut((t - .60) / .40));

        /* ── layout: sized off BOTH axes so no window crops the shot ── */
        const hh = Math.min(H * .56, W * .46);      /* head height */
        const hw = hh * .80;
        const hx = W * .50 - hw * .06;              /* head sits just right of centre */
        const hy = H * .50 - hh * .50;
        const impX = hx + hw * .20;                 /* the cheek, in canvas space */
        const impY = hy + hh * .49;
        const gh = hh * .42;
        const gxRest = Math.min(W * .14, impX - gh * 1.5);
        const gxHit = hx + hw * .12;
        const gx = gxRest + (gxHit - gxRest) * ext;
        const shake = sq * H * .016;
        const sx = (rnd(t * 97) - .5) * shake, sy = (rnd(t * 57) - .5) * shake;

        ctx.save();
        ctx.translate(Math.round(sx), Math.round(sy));

        /* ── the room behind the exchange ── */
        b(-4, -4, W + 8, H + 8, "#090d14");
        b(-4, -4, W + 8, H * .48, "#111926");
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(255,226,168,.20)");
        g.addColorStop(1, "rgba(255,226,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(W * .44, -4); ctx.lineTo(W * .54, -4);
        ctx.lineTo(W * .82, H); ctx.lineTo(W * .14, H); ctx.fill();
        /* blurred crowd in the dark */
        const cw = Math.max(3, Math.round(W * .014));
        for (let i = 0; i < 130; i++) {
          const cxp = (i * 53 * cw) % W, cyp = H * .13 + ((i * 29) % Math.round(H * .25)), q = (i * 7) % 5;
          b(cxp, cyp, cw, cw * 1.2, q < 2 ? "#1a2331" : q < 4 ? "#222939" : "#2a2333");
          if (q === 1) b(cxp + 1, cyp + 1, cw * .4, cw * .4, "#4c4030");
        }
        /* ropes, apron, mat */
        const rw = Math.max(2, Math.round(H * .012));
        b(-4, H * .28, W + 8, rw, "#8a2820");
        b(-4, H * .45, W + 8, rw, "#b7b19e");
        b(-4, H * .62, W + 8, rw, "#2b5c94");
        b(-4, H * .76, W + 8, H, "#0c0f17");
        b(-4, H * .76, W + 8, H * .018, "#1a202f");
        b(-4, H * .82, W + 8, H, "#090c13");

        /* ── receiving fighter, blitted through the shockwave ── */
        const bw = Math.max(8, Math.round(hw)), bh = Math.max(8, Math.round(hh));
        drawHead(bw, bh, sq);
        const impCol = impX - hx;
        const shift = sq * bw * .085;
        const spread = bw * bw * .045, lift2 = bw * bw * .09, vspread = bw * bw * .03;
        for (let c = 0; c < bw; c++) {
          const d = c - impCol;
          const push = shift + sq * bw * .055 * Math.exp(-(d * d) / spread);
          const lift = -sq * bh * .018 * Math.exp(-(d * d) / lift2) + sq * (d / bw) * bh * .035;
          const vsq = 1 - sq * .10 * Math.exp(-(d * d) / vspread);
          const dh = bh * vsq;
          ctx.drawImage(headBuf.c, c, 0, 1, bh,
            Math.round(hx + c + push), Math.round(hy + lift + (bh - dh)), 1, Math.ceil(dh));
        }

        /* ── attacker: shoulder in the near foreground, arm across frame ── */
        b(-W * .08, H * .52 + ext * H * .03, W * .24, H * .60, "#241913");
        b(-W * .08, H * .57 + ext * H * .03, W * .18, H * .55, "#35251c");
        b(W * .01, H * .60 + ext * H * .03, W * .07, H * .50, "#452f23");
        drawGlove(ctx, gx, impY, gh, sq);

        /* ── impact: flash, rings, spray ── */
        if (sq > .10) {
          const a = sq, cxI = gx - gh * .04, cyI = impY;
          ctx.fillStyle = "rgba(255,241,208," + (a * .26).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(cxI, cyI, gh * (.10 + a * .20), 0, 6.3); ctx.fill();
          ctx.strokeStyle = "rgba(255,226,168," + (a * .5).toFixed(3) + ")";
          ctx.lineWidth = Math.max(1, H * .005);
          ctx.beginPath(); ctx.arc(cxI, cyI, gh * (.26 + (1 - a) * .55), 0, 6.3); ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const ang = i * 1.047 + .3, r0 = gh * (.2 + a * .1), r1 = r0 + gh * (.09 + a * .26);
            ctx.beginPath();
            ctx.moveTo(cxI + Math.cos(ang) * r0, cyI + Math.sin(ang) * r0);
            ctx.lineTo(cxI + Math.cos(ang) * r1, cyI + Math.sin(ang) * r1);
            ctx.stroke();
          }
          const dsz = Math.max(2, H * .009);
          for (let i = 0; i < 12; i++) {
            const sp = (1 - sq) * hh * .34 + gh * .2, ang = -2.4 + rnd(i * 3.3) * 3.2;
            b(cxI + Math.cos(ang) * sp, cyI + Math.sin(ang) * sp * .75,
              dsz * (1 + (i % 2) * .5), dsz, i % 3 ? "#d6e4ef" : "#ffe9c4");
          }
        }
        /* overhead bulb */
        b(W * .485, -4, Math.max(1, W * .004), H * .06, "#2a2a2a");
        b(W * .466, H * .05, W * .040, H * .032, "#ffeab4");
        b(W * .475, H * .044, W * .022, H * .016, "#fff8e2");
        ctx.restore();
        /* grade */
        ctx.fillStyle = "rgba(8,11,18,.14)";
        const step = Math.max(2, Math.round(H * .017));
        for (let y = 0; y < H; y += step) ctx.fillRect(0, y, W, 1);
      }
      /* ── PIXEL ART · UNDERGROUND GYMS ────────────────────────────
         Four rooms drawn procedurally. Each one is somewhere a fight
         like this actually happens: a basement, a boiler room, a
         parking level, a bag room over a shuttered shop. */
      /* Each room pays differently, and the multiplier tracks how little
         medical cover is in the building. The rooms that pay best are the
         ones with nobody there to stop the fight — which is the trade this
         whole game is about. */
      const GYMS = [
        { n: "Sub-Level Nine · Ironworks", k: 0, mult: 1.00,
          risk: "A ring, a timekeeper and a first-aid kit. The baseline." },
        { n: "The Boiler Room", k: 1, mult: 1.25,
          risk: "Hot, loud and unlicensed. The crowd is close enough to lean on the ropes." },
        { n: "Parking Level C · Chalk Circle", k: 2, mult: 1.55,
          risk: "No ring and no ropes. A circle on the concrete, and nowhere to fall safely." },
        { n: "Kowloon Bag Room", k: 3, mult: 0.85,
          risk: "A training room borrowed for the night. Small purse, sensible people." },
        { n: "Pier 14 · Cold Storage", k: 1, mult: 1.40,
          risk: "Freezing, so he will not feel the damage until afterwards." },
        { n: "The Cellar, Yongsan", k: 0, mult: 0.95,
          risk: "Regulars, a house doctor on call, and a promoter who likes repeat business." },
        { n: "Furnace Street Athletic Club", k: 3, mult: 0.75,
          risk: "Sanctioned, with a ringside physician who will stop it over your head." },
        { n: "Loading Bay Seven", k: 2, mult: 1.80,
          risk: "No commission, no doctor, no limit on the rounds. It pays what it pays for a reason." },
      ];
      const QUOTES = [
        "Everyone has a plan until they get punched in the mouth.",
        "The fight is won or lost far away from witnesses.",
        "A corner that cannot say stop is not a corner.",
        "It is not the mountain we conquer, but ourselves.",
        "The body remembers what the scorecard forgets.",
        "You do not rise to the occasion. You fall to your training.",
        "Protect yourself at all times.",
        "The bravest thing a corner does is throw the towel.",
        "He who is not courageous enough to take risks will accomplish nothing.",
        "To be a champion you have to believe in yourself when nobody else will.",
        "Rounds are cheap. Brains are not.",
        "The last round is the one you do not remember.",
      ];

      function drawGym(ctx, W, H, kind, seed) {
        const b = (X, Y, Wd, Ht, c) => { ctx.fillStyle = c; ctx.fillRect(X | 0, Y | 0, Wd | 0, Ht | 0); };
        const R = (i) => rnd(seed * 13.7 + i * 2.31);
        const horizon = Math.round(H * .62);
        /* shell */
        b(0, 0, W, H, "#070a0f");
        b(0, 0, W, horizon, kind === 1 ? "#2a1f18" : kind === 2 ? "#1e232c" : "#202833");
        /* back wall texture: breeze block, tile or concrete pour */
        for (let y = 0; y < horizon; y += 11) {
          for (let xx = (y / 11) % 2 ? -14 : 0; xx < W; xx += 29) {
            const q = R(y * 3 + xx);
            b(xx, y, 28, 10, q < .25 ? (kind === 1 ? "#3a2a1e" : "#2a3442")
              : q < .6 ? (kind === 1 ? "#31231a" : "#232c38") : (kind === 1 ? "#44301f" : "#313c4b"));
          }
        }
        /* damp staining */
        for (let i = 0; i < 9; i++) {
          const xx = R(i) * W, wd = 12 + R(i + 40) * 40;
          b(xx, 0, wd, horizon * (.3 + R(i + 80) * .6), "rgba(5,8,12,.26)");
        }
        /* floor */
        b(0, horizon, W, H - horizon, kind === 2 ? "#232832" : "#2a2219");
        b(0, horizon, W, 4, "#070a0f");
        for (let y = horizon + 8; y < H; y += 13) b(0, y, W, 1, "rgba(0,0,0,.3)");

        /* hanging bulbs, the light every one of these rooms is lit by */
        const bulbs = 3 + (kind === 3 ? 2 : 0);
        for (let i = 0; i < bulbs; i++) {
          const bx = Math.round(W * (i + .5) / bulbs + (R(i + 5) - .5) * 20), by = Math.round(H * .12);
          b(bx, 0, 1, by, "#2a2a2a");
          const g = ctx.createRadialGradient(bx, by + 4, 2, bx, by + 4, H * .55);
          g.addColorStop(0, "rgba(255,218,150,.6)");
          g.addColorStop(.45, "rgba(255,200,120,.16)");
          g.addColorStop(1, "rgba(255,200,120,0)");
          ctx.fillStyle = g;
          ctx.fillRect(bx - H * .55, by - 10, H * 1.1, H);
          b(bx - 4, by, 9, 7, "#ffeab4"); b(bx - 2, by - 2, 5, 4, "#fff8e2");
        }

        if (kind === 0) {
          /* basement ring: posts, ropes, apron */
          const ry = horizon - 46;
          for (const pxp of [Math.round(W * .1), Math.round(W * .9)]) {
            b(pxp - 4, ry - 34, 9, 80, "#39404b"); b(pxp - 2, ry - 32, 4, 76, "#4e5765");
            b(pxp - 7, ry - 38, 15, 7, "#8d2a22");
          }
          for (let i = 0; i < 4; i++) {
            const yy = ry - 26 + i * 13;
            b(W * .1, yy, W * .8, 3, i === 1 ? "#b9b3a0" : i === 3 ? "#2c5e96" : "#8d2a22");
            b(W * .1, yy + 3, W * .8, 1, "rgba(0,0,0,.45)");
          }
          b(W * .06, ry + 44, W * .88, 10, "#3a2c20");
          b(W * .08, horizon - 2, W * .84, 18, "#0b0e13");
          /* stacked chairs and a bucket at ringside */
          b(W * .03, horizon + 12, 22, 26, "#20262f");
          b(W * .78, horizon + 20, 14, 16, "#39404a");
        } else if (kind === 1) {
          /* boiler room: pipework, valves, one bag */
          for (let i = 0; i < 5; i++) {
            const yy = Math.round(H * (.08 + i * .1));
            b(0, yy, W, 7, "#3a2a1c"); b(0, yy + 1, W, 3, "#55402b");
            for (let j = 0; j < 7; j++) b(W * j / 7 + R(j) * 20, yy - 2, 7, 11, "#2a1e14");
          }
          b(W * .06, horizon - 96, 34, 100, "#2e2117"); b(W * .06 + 6, horizon - 90, 22, 88, "#42301f");
          b(W * .58, 0, 4, 48, "#2a2a2a");
          b(W * .54, 48, 30, 86, "#3b281a"); b(W * .555, 52, 22, 78, "#523724");
          for (let i = 0; i < 5; i++) b(W * .54, 56 + i * 16, 30, 2, "#1b120c");
        } else if (kind === 2) {
          /* parking level: pillars, painted bay lines, chalk circle */
          for (let i = 0; i < 4; i++) {
            const pxp = Math.round(W * (.08 + i * .28));
            b(pxp, 0, 42, horizon + 10, "#242b35");
            b(pxp + 4, 0, 32, horizon + 8, "#303946");
            b(pxp + 4, horizon - 40, 32, 10, "#8d7338");
            b(pxp + 4, horizon - 26, 32, 4, "#2a3038");
          }
          ctx.strokeStyle = "rgba(226,220,200,.3)"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(W * .5, horizon + (H - horizon) * .45, W * .26, (H - horizon) * .3, 0, 0, 6.3); ctx.stroke();
          b(W * .72, horizon - 34, 90, 40, "#1d2129"); b(W * .74, horizon - 28, 78, 30, "#262c36");
        } else {
          /* bag room: a row of heavy bags and a wall of mirror */
          b(W * .54, horizon - 118, W * .42, 104, "#1b222c");
          b(W * .55, horizon - 115, W * .40, 98, "#232c38");
          for (let i = 0; i < 4; i++) b(W * .55, horizon - 112 + i * 25, W * .40, 1, "rgba(255,255,255,.05)");
          for (let i = 0; i < 4; i++) {
            const bx = Math.round(W * (.06 + i * .13)), sw = Math.sin(seed + i) * 5;
            b(bx + sw * .4, 0, 3, 40, "#2a2a2a");
            b(bx - 13 + sw, 40, 30, 14, "#241a12");
            b(bx - 15 + sw, 52, 34, 92, "#3b281a");
            b(bx - 12 + sw, 56, 24, 84, "#523724");
            b(bx - 12 + sw, 56, 9, 84, "#64452a");
            for (let j = 0; j < 4; j++) b(bx - 15 + sw, 62 + j * 20, 34, 2, "#1a110b");
          }
        }
        /* dust in the beams */
        for (let i = 0; i < 70; i++) {
          const dx = R(i + 200) * W, dy = R(i + 300) * H;
          b(dx, dy, 1 + (i % 2), 1, i % 4 ? "rgba(255,230,180,.18)" : "rgba(255,230,180,.34)");
        }
        /* grade + grain */
        const v = ctx.createRadialGradient(W / 2, H * .5, H * .22, W / 2, H * .5, H * .95);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.48)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(10,8,6,.13)";
        for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      }

      /* ── SMALL PIXEL AVATAR ──────────────────────────────────── */
      function drawAvatar(ctx) {
        const b = (X, Y, W, H, c) => { ctx.fillStyle = c; ctx.fillRect(X, Y, W, H); };
        b(0, 0, 34, 34, "#10151d");
        b(0, 0, 34, 16, "#19202b");
        b(7, 22, 20, 12, "#8d2a22");          /* shoulders */
        b(10, 24, 14, 10, "#b03a2c");
        b(9, 6, 16, 18, SK2);                 /* head */
        b(11, 9, 12, 14, SK);
        b(9, 4, 16, 6, HR);                   /* hair */
        b(8, 8, 3, 8, HR);  b(23, 8, 3, 8, HR);
        b(12, 13, 3, 3, "#f4ead6"); b(19, 13, 3, 3, "#f4ead6");
        b(13, 14, 2, 2, PUP); b(20, 14, 2, 2, PUP);
        b(14, 19, 6, 2, "#8a4f34");           /* mouth */
        b(11, 11, 5, 1, HR); b(18, 11, 5, 1, HR);
        b(21, 7, 4, 2, "#a3201a");            /* old cut */
      }

      /* ── BOOT SEQUENCE ───────────────────────────────────────── */
      function bootUp() {
        const boot = $("#boot");
        if (!boot) { intro(); return; }
        const status = $("#boot-status"), bar = $("#boot-bar-fill");
        const steps = [
          "Loading", "Loading corner data", "Loading fighter", "Loading the room",
        ];
        let step = 0, dots = 0, pct = 0, done = false;
        /* pre-render the art the lobby needs while the words are on screen */
        const warm = () => { try { drawHead(120, 150, 0); } catch (e) {} };
        setTimeout(warm, 80);
        const tick = setInterval(() => {
          if (done) return;
          dots = (dots + 1) % 4;
          if (dots === 0) step = Math.min(steps.length - 1, step + 1);
          status.textContent = steps[step] + ".".repeat(dots);
          pct = Math.min(100, pct + 9 + Math.random() * 11);
          bar.style.width = pct + "%";
          if (pct >= 100) {
            clearInterval(tick);
            done = true;
            bar.style.width = "100%";
            status.textContent = "Loaded!";
            status.className = "boot-status done";
            setTimeout(() => {
              boot.classList.add("gone");
              setTimeout(() => boot.remove(), 600);
            }, 760);
          }
        }, 240);
      }

      /* ── LOBBY ───────────────────────────────────────────────────
         Front page of the game. GEAR UP is the only live tab; the
         others say so rather than pretending. PLAY is the whole
         point of the screen, so it gets the whole corner. */
      const LOBBY_TABS = [
        { id: "gear", label: "Gear Up", live: true },
        { id: "quests", label: "Quests" },
        { id: "equipment", label: "Equipment" },
        { id: "inventory", label: "Inventory" },
        { id: "market", label: "Market", live: true },
        { id: "rankings", label: "Rankings", live: true },
        { id: "gym", label: "Gym", live: true },
        { id: "regiment", label: "Regiment" },
        { id: "battlepass", label: "Battlepass" },
      ];
      const MAINT_COPY = {
        quests: "Daily corner objectives — spot the sign, make the call. Not built yet.",
        equipment: "Gloves, wraps, headgear and a corner kit that changes the fight. Not built yet.",
        inventory: "Everything you have earned between bouts. Not built yet.",
        market: "Spend gold on corner upgrades. Not built yet.",
        rankings: "Leaderboards for wins — and for fighters retired healthy. Not built yet.",
        gym: "Build out your own gym and take on students. Not built yet.",
        battlepass: "A season of corner challenges. Not built yet.",
        regiment: "Form a gym with other coaches and share a standings table. Not built yet.",
        friends: "Coach against a friend — one of you in each corner, same fighter, different calls. Not built yet.",
        customization: "Pick your fighter's look, stance and corner team. Not built yet.",
        codes: "Redeem codes for cosmetics. Not built yet.",
      };
      let lobbyRAF = 0, lobbyT = 0, lobbyLast = 0;

      function lobbyGo(id) {
        if (id === "play") return openModeSelect();
        if (id === "gear") return openGear();
        if (id === "market") return openMarket();
        if (id === "gym") return setLobbyView("gym");
        if (id === "rankings") return setLobbyView("plaza");
        if (id === "switchview") return cycleLobbyView();
        if (id === "gymview") return setLobbyView("gym");
        if (id === "guide") return instructions();
        if (id === "settings") return openSettings();
        maintenance(id);
      }
      function maintenance(id) {
        const label = (LOBBY_TABS.find((x) => x.id === id) || {}).label
          || id.charAt(0).toUpperCase() + id.slice(1);
        document.querySelectorAll(".maint-wrap").forEach((n) => n.remove());
        const wrap = document.createElement("div");
        wrap.className = "maint-wrap";
        wrap.innerHTML = `<div class="maint" role="status">
          <h3>Under maintenance</h3>
          <p><span class="tagname">${escapeUI(label)}</span> isn't in the build yet.</p>
          <p class="mu" style="font-size:10.5px;margin-top:5px;color:#7e8995">${escapeUI(MAINT_COPY[id] || "")}</p>
          <button type="button">Dismiss</button></div>`;
        const close = () => {
          wrap.classList.add("out");
          setTimeout(() => wrap.remove(), 260);
        };
        wrap.querySelector("button").addEventListener("click", close);
        document.body.appendChild(wrap);
        setTimeout(() => { if (wrap.isConnected) close(); }, 4200);
      }

      const COIN_SVG = `<svg class="lb-coin" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#e0a93c" stroke="#8a5f14" stroke-width="1.4"/><circle cx="8" cy="8" r="4.4" fill="#f7d070"/><path d="M6.4 5.6h3.2v1.3H8.7v4.4H7.3V6.9H6.4z" fill="#8a5f14"/></svg>`;
      const GEM_SVG = `<svg class="lb-gem" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2 14.4 6 8 14.8 1.6 6z" fill="#d8402f" stroke="#6d120c" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 1.2 11 6 8 14.8 5 6z" fill="#f2695a"/><path d="M1.6 6h12.8" stroke="#8c1d13" stroke-width="1"/></svg>`;

      function intro() {
        setLandingChrome(false);
        setGamePhase("title");
        document.body.dataset.s = "title";
        $("#cv").style.display = "none";
        $("#sub").textContent = "";
        document.querySelectorAll(".lobby,.maint-wrap").forEach((n) => n.remove());
        if (!P) loadProfile();

        const need = xpNeed(P.lv), pctXP = Math.min(100, (P.xp / need) * 100), PM = PMULT();
        const el = document.createElement("div");
        el.className = "lobby";
        el.innerHTML = `
          <canvas class="lb-art" id="lobby-art" role="img"
            aria-label="${lobbyView === 'gym' ? 'A weights room you walk around with WASD: bench, squat rack, dumbbells and a press' : lobbyView === 'plaza' ? 'Pixel art of a town square at dusk with a gilded statue of a boxer on a plinth' : 'Pixel art: a boxer taking a straight right flush on the cheek, head twisting off the impact'}"></canvas>
          <div class="lb-shade"></div>

          <div class="lb-top">
            <div class="lb-brand"><b>◆</b><span style="font:700 10px/1.3 var(--mono);letter-spacing:.1em;color:#8e99a7">INSIDE THE<br>IMPACT</span></div>
            <div class="lb-tabs" role="tablist">
              ${LOBBY_TABS.map((t) => `<button class="lb-tab ${t.id === "gear" ? "active" : t.live ? "" : "locked"}" data-lobby="${t.id}" role="tab" aria-selected="${t.id === "gear"}">${t.id === "gear" ? t.label + " [" + GRADES[Math.round(upAverage())] + "]" : t.label}</button>`).join("")}
            </div>
            <div class="lb-cur">
              <div><span id="lb-gold">${P.gold.toLocaleString()}</span>${COIN_SVG}</div>
              <div><span id="lb-gems">${P.gems.toLocaleString()}</span>${GEM_SVG}</div>
            </div>
            <div class="lb-icons">
              <button class="lb-ic" data-lobby="guide" title="Coach briefing" aria-label="Coach briefing">▤</button>
              <button class="lb-ic" data-lobby="friends" title="Friends" aria-label="Friends">⚇</button>
              <button class="lb-ic" data-lobby="settings" title="Settings" aria-label="Settings">⚙</button>
            </div>
          </div>

          <div class="lb-stage">
            ${lobbyView === "plaza" ? `
            <div class="lb-tagline">
              <b>The Square</b>
              <i>Four faces, four boards, and a floor where people deal.</i>
            </div>
            <div class="plaza-faces">
              <div class="plaza-col">
                ${BOARDS.slice(0, 2).map((bd) => `
                  <button class="plaza-face" data-board="${bd.id}" type="button">
                    <u>${bd.face} face</u><b>${bd.name}</b>
                  </button>`).join("")}
              </div>
              <div class="plaza-col">
                ${BOARDS.slice(2).map((bd) => `
                  <button class="plaza-face" data-board="${bd.id}" type="button">
                    <u>${bd.face} face</u><b>${bd.name}</b>
                  </button>`).join("")}
              </div>
            </div>
            <button class="plaza-trade" data-lobby="gymview" type="button">Trade Central &rarr; gym floor</button>
            ` : lobbyView === "gym" ? `
            <div class="lb-tagline">
              <b>Training Arena</b>
              <i>Strength is built under the bar. Judgement is built in the corner.</i>
            </div>
            <div class="gym-hud">
              <div class="gym-stat">
                <div class="r"><u>Strength</u><b id="gym-lv">Lv ${gymLevel("strength")} &middot; +${gymBonus("strength").toFixed(1)}x</b></div>
                <div class="t"><i id="gym-bar" style="width:${gymPct("strength")}%;background:${GYM_STATS.strength.col}"></i></div>
                <s id="gym-sub">${gymInto("strength")} / ${gymNext("strength")} to the next level &middot; you can carry about ${strCap()} kg</s>
              </div>
            </div>
            <div class="gym-prompt" id="gym-prompt" hidden></div>
            <div class="gym-help">WASD to walk &middot; E to occupy a machine</div>` : `
            <div class="lb-tagline">
              <b>Corner · Season One</b>
              <i>A safety stop pays more than a win. That is the whole game.</i>
            </div>`}

            <div class="lb-profile">
              <div class="lb-av"><canvas id="lb-avatar" width="34" height="34" aria-hidden="true"></canvas><b>LV. ${P.lv}</b></div>
              <button class="lb-switch" data-lobby="switchview">${VIEW_NEXT[lobbyView]}</button>
              <div class="lb-mults">
                <div class="lb-mult ${boostActive("gold") ? "boosted" : ""}" data-m="gold" title="Coins earned from a bout"><u>GOLD</u><s>${fx(PM.gold)}</s></div>
                <div class="lb-mult ${boostActive("luck") ? "boosted" : ""}" data-m="luck" title="Rare drop chance — not applied yet"><u>LUCK</u><s>${fx(PM.luck)}</s></div>
                <div class="lb-mult ${boostActive("exp") ? "boosted" : ""}" data-m="exp" title="Experience earned from a bout"><u>EXP</u><s>${fx(PM.exp)}</s></div>
                <div class="lb-mult ${boostActive("str") ? "boosted" : ""}" data-m="str" title="Your fighter's punching power — not applied yet"><u>STRENGTH</u><s>${fx(PM.str)}</s></div>
              </div>
            </div>

            <div class="lb-playwrap">
              <div class="lb-slot">NEXT BOUT · <b>${escapeUI((G && G.opp && G.opp.n) || "N/A")}</b></div>
              <button class="lb-play" data-lobby="play">Play</button>
            </div>

            <div class="lb-disclaim">Fictional teaching simulation — not a medical device, examination or clearance tool. Emergency in South Korea: 119.</div>
          </div>

          <div class="lb-xp"><i style="width:${pctXP}%"></i><span>XP ${Math.round(pctXP)}% (${P.xp.toLocaleString()} / ${need.toLocaleString()})</span></div>`;

        el.querySelectorAll("[data-lobby]").forEach((btn) =>
          btn.addEventListener("click", () => lobbyGo(btn.dataset.lobby)));
        el.querySelectorAll("[data-train]").forEach((btn) =>
          btn.addEventListener("click", () => trainAt(btn.dataset.train)));
        el.querySelectorAll("[data-board]").forEach((btn) =>
          btn.addEventListener("click", () => openBoard(btn.dataset.board)));
        el.querySelectorAll("[data-trade]").forEach((btn) =>
          btn.addEventListener("click", openTrade));
        document.body.appendChild(el);

        const av = $("#lb-avatar");
        if (av) drawAvatar(av.getContext("2d"));

        /* The punch runs at 30fps — it is wallpaper, not a renderer. The
           canvas is sized to its own box at roughly 5 screen pixels per
           art pixel, so the frame is never cropped and the blocks stay
           chunky on any window. */
        const art = $("#lobby-art"), actx = art.getContext("2d");
        let AW = 0, AH = 0;
        const sizeArt = () => {
          const r = art.getBoundingClientRect();
          const w = Math.max(150, Math.min(480, Math.round(r.width / 4)));
          const h = Math.max(80, Math.round(w * (r.height / Math.max(1, r.width))));
          if (w === AW && h === AH) return false;
          AW = w; AH = h; art.width = w; art.height = h;
          actx.imageSmoothingEnabled = false;
          return true;
        };
        sizeArt();
        cancelAnimationFrame(lobbyRAF);
        lobbyT = 0; lobbyLast = 0;
        const reduced = document.body.dataset.reduceMotion === "1"
          || document.body.dataset.lowDetail === "1"
          || matchMedia("(prefers-reduced-motion: reduce)").matches;
        const paint = () => (lobbyView === "gym" ? drawGymRoom : lobbyView === "plaza" ? drawPlaza : drawPunchScene)(actx, AW, AH, lobbyT);
        if (reduced) { lobbyT = .49; paint(); }
        else {
          /* Wall-clock driven: the punch takes the same 5.3s whether the
             browser hands us 60fps or 3. Advancing per frame made the
             whole combination play in slow motion on a throttled tab. */
          const CYCLE = 5300;
          let t0 = 0;
          const loop = (ts) => {
            if (!art.isConnected) return;
            if (!t0) t0 = ts;
            if (ts - lobbyLast > 32) {
              lobbyLast = ts;
              lobbyT = ((ts - t0) % CYCLE) / CYCLE;
              paint();
            }
            lobbyRAF = requestAnimationFrame(loop);
          };
          lobbyRAF = requestAnimationFrame(loop);
        }
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(() => { if (sizeArt()) paint(); });
          ro.observe(art);
        }
        window.scrollTo(0, 0);
      }
      /* the lobby is an overlay, so it has to come down when play starts */
      function closeLobby() {
        cancelAnimationFrame(lobbyRAF);
        document.querySelectorAll(".lobby,.maint-wrap").forEach((n) => n.remove());
      }

      /* ── GYM LOADING ─────────────────────────────────────────────
         The teleport screen. A real room, a real name, and a line
         worth reading while the simulation comes up behind it. */
      function enterMatch(chosenGym) {
        const seed = Date.now() % 100000;
        const gym = chosenGym || GYMS[Math.floor(Math.random() * GYMS.length)];
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        document.querySelectorAll("#gymload,.maint-wrap").forEach((n) => n.remove());

        const gl = document.createElement("div");
        gl.id = "gymload";
        gl.innerHTML = `
          <div class="gl-name">${escapeUI(gym.n)}</div>
          <div class="gl-art"><canvas id="gl-canvas" role="img"
            aria-label="Pixel art of an underground boxing gym"></canvas></div>
          <div class="gl-foot">
            <div class="gl-load">Loading<i id="gl-dots"></i></div>
            <div class="gl-bar"><i id="gl-fill"></i></div>
            <div class="gl-quote">${escapeUI(quote)}</div>
            <div class="gl-safety">Simulation · not diagnosis. Warning signs mean stop contact.</div>
          </div>`;
        document.body.appendChild(gl);
        const gcv = $("#gl-canvas"), gc = gcv.getContext("2d");
        const gr = gcv.parentElement.getBoundingClientRect();
        const gw = Math.max(200, Math.min(640, Math.round((gr.width || 480) / 3)));
        const gHt = Math.max(120, Math.round(gw * ((gr.height || 270) / Math.max(1, gr.width || 480))));
        gcv.width = gw; gcv.height = gHt;
        gc.imageSmoothingEnabled = false;
        drawGym(gc, gw, gHt, gym.k, seed);
        /* The screen is opaque the moment it is in the document. It used
           to fade the whole container in from a requestAnimationFrame
           callback, so on a throttled tab the player saw straight through
           it to the lobby — or saw nothing at all. */

        const dots = $("#gl-dots"), fill = $("#gl-fill");
        let d = 0, pct = 0;
        const tick = setInterval(() => {
          d = (d + 1) % 4;
          dots.textContent = ".".repeat(d);
          pct = Math.min(100, pct + 7 + Math.random() * 10);
          fill.style.width = pct + "%";
          if (pct >= 100) {
            clearInterval(tick);
            setTimeout(() => {
              closeLobby();
              const first = !P.seen;
              if (first) { P.seen = 1; saveProfile(); }
              gl.classList.add("out");
              setTimeout(() => gl.remove(), 400);
              if (first) instructions(); else hub();
            }, 520);
          }
        }, 230);
      }

      /* ══ 3D ARENA · 1v1 ═══════════════════════════════════════════
         A genuine 3D mode, not a side-on one rebadged. Both fighters
         hold real x/y/z positions and move freely across the floor; the
         camera is a true perspective camera that frames the pair. It is
         software-rendered onto the same 2D canvas the rest of the game
         uses — boxes, depth-sorted, lit by one directional light —
         which keeps the build a single file with no dependencies and
         suits the blocky look. The simulation is 3D; only the
         rasteriser is hand-rolled.                                      */

      const A3 = {
        on: false, raf: 0, last: 0,
        state: "intro", t: 0, intro: 3.2, left: 90, round: 1,
        keys: new Set(), mouse: 0,
        cam: { x: 0, y: 4, z: -9, lx: 0, ly: 1, lz: 0, fov: 1.02 },
        p: null, o: null, shake: 0,
      };
      /* The rope line is the one real boundary; everything else is derived
         from it. A3_BODY is the fighter's worst half-extent measured over a
         full turn of yaw with the guard out — not a guess, so a fighter
         backed into the ropes stops with his gloves at the rope rather than
         a quarter of a metre through it. */
      const A3_RING = 5.6;           /* where the ropes and posts stand   */
      /* Measured, not guessed: the widest the STANDING rig gets, swept over
         24 yaws x 16 stride phases x every guard height. Lunging gloves are
         deliberately not counted — a glove crossing the rope plane while he
         throws is what really happens and it reads fine; a fighter stood
         with his shoulder through the rope does not. 0.88 is the measured
         figure; the rest is margin, since the live pose settles on yaws the
         sweep steps over. */
      const A3_BODY = 0.96;
      const A3_BOUND = A3_RING - A3_BODY;  /* so nothing crosses a rope   */
      /* How close two fighters may stand, centre to centre. This does NOT
         keep the guards apart: measured, two idle guards touch at 1.20, so
         they overlap by 0.28 here. Every punch is solved against this
         number, and a3Tick keeps the arm bent at this range so the glove
         stops on the man instead of inside him. */
      const A3_SEP = 0.92;

      const A3_KIT = {
        player: { robe1:"#3a3f46", robe2:"#8e97a2", trimR:"rgb(190,48,44)", trimW:"rgb(232,232,228)",
                  glove:"#2f5fa8", gloveT:"#4e83d4", cuff:"#9aa4b0", chain:"rgb(206,212,219)",
                  short1:"#26438a", short2:"#7d8894", belt:"#1b2740", boot:"#1d2432", bootT:"#39424f" },
        rival:  { robe1:"#45383a", robe2:"#9a8a86", trimR:"rgb(214,164,60)", trimW:"rgb(236,228,214)",
                  glove:"#a8382c", gloveT:"#d2553f", cuff:"#b0a39a", chain:"rgb(214,198,150)",
                  short1:"#7a2320", short2:"#9d9188", belt:"#2c1a18", boot:"#241c1c", bootT:"#4a3b38" },
      };
      function a3Fighter(side, name, col, trim, kit) {
        return {
          name, col, trim,
          kit: A3_KIT[kit] || A3_KIT.player,
          dt: 0.016,
          robe: { rx:[0,0,0], rz:[0,0,0], vx:[0,0,0], vz:[0,0,0], pf:0, pl:0, py:0 },
          x: side * 2.4, y: 0, z: 0,
          vx: 0, vz: 0,                       /* velocity, for real accel */
          yaw: side > 0 ? -Math.PI / 2 : Math.PI / 2,
          hp: 100, maxHp: 100, sta: 100, maxSta: 100,
          step: 0, bob: 0, sprint: 0, sidestep: 0, lunge: 0, guard: 1,
          /* ── combat ──────────────────────────────────────────
             punch   the live punch, {k, t} where t is 0..1 through it
             fired   contact already tested for this punch
             block   1 while the guard is up
             spent   post-punch pause before stamina comes back
             stag    staggering, in seconds
             hurt    seconds left of the skin flash from a shot that got in
             head    HIDDEN head-exposure load. Never drawn, anywhere.
                     This is the quantity the whole mode is about: it is
                     NOT the HP bar, it rises mostly from rotational
                     shots, and it decays far slower than it accrues.
             clean / landed  solid head shots taken and given, for the
                     one honest line at the end                        */
          punch: null, fired: 0, block: 0, spent: 0, stag: 0,
          head: 0, clean: 0, landed: 0, bodyN: 0, bodyT: 0,
        };
      }

      /* ── maths ────────────────────────────────────────────────── */
      const a3Clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
      function a3Basis(cam) {
        let fx = cam.lx - cam.x, fy = cam.ly - cam.y, fz = cam.lz - cam.z;
        const fl = Math.hypot(fx, fy, fz) || 1;
        fx /= fl; fy /= fl; fz /= fl;
        /* right = up × forward, which stays in the XZ plane */
        let rx = fz, rz = -fx;
        const rl = Math.hypot(rx, rz) || 1;
        rx /= rl; rz /= rl;
        /* up = forward x right; the signs matter, a flipped one skews the whole view */
        const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
        return { fx, fy, fz, rx, ry: 0, rz, ux, uy, uz };
      }
      function a3Project(px, py, pz, cam, B, W, H) {
        const dx = px - cam.x, dy = py - cam.y, dz = pz - cam.z;
        const cz = dx * B.fx + dy * B.fy + dz * B.fz;
        if (cz < 0.12) return null;                      /* behind the eye */
        const cx = dx * B.rx + dz * B.rz;
        const cy = dx * B.ux + dy * B.uy + dz * B.uz;
        const k = (Math.min(W, H) * 0.5) / Math.tan(cam.fov * 0.5) / cz;
        return { sx: W * 0.5 + cx * k, sy: H * 0.5 - cy * k, z: cz };
      }
      /* a box, rotated about Y, pushed as six lit faces */
      function a3Box(out, cx, cy, cz, sx, sy, sz, yaw, col) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        const hx = sx / 2, hy = sy / 2, hz = sz / 2;
        const L = [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
                   [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]];
        const V = L.map((p) => ({
          x: cx + p[0] * c + p[2] * s,
          y: cy + p[1],
          z: cz - p[0] * s + p[2] * c,
        }));
        const F = [[0, 1, 2, 3, 0, 0, -1], [5, 4, 7, 6, 0, 0, 1],
                   [4, 0, 3, 7, -1, 0, 0], [1, 5, 6, 2, 1, 0, 0],
                   [3, 2, 6, 7, 0, 1, 0], [4, 5, 1, 0, 0, -1, 0]];
        for (const f of F) {
          const nx = f[4] * c + f[6] * s, ny = f[5], nz = -f[4] * s + f[6] * c;
          out.push({ v: [V[f[0]], V[f[1]], V[f[2]], V[f[3]]], nx, ny, nz, col });
        }
      }
      function a3Quad(out, a, b, c, d, nx, ny, nz, col) {
        out.push({ v: [a, b, c, d], nx, ny, nz, col });
      }
      const a3V = (x, y, z) => ({ x, y, z });

      /* ── the arena itself ─────────────────────────────────────── */
      function a3BuildArena(out) {
        const R = A3_RING;
        /* canvas */
        a3Quad(out, a3V(-R, 0, -R), a3V(R, 0, -R), a3V(R, 0, R), a3V(-R, 0, R),
               0, 1, 0, "#6d5468");
        /* mat seams, so movement across the floor is legible */
        for (let i = -4; i <= 4; i++) {
          const t = i * 1.2;
          a3Quad(out, a3V(t - .04, .01, -R), a3V(t + .04, .01, -R),
                      a3V(t + .04, .01, R), a3V(t - .04, .01, R), 0, 1, 0, "#5d4659");
          a3Quad(out, a3V(-R, .01, t - .04), a3V(R, .01, t - .04),
                      a3V(R, .01, t + .04), a3V(-R, .01, t + .04), 0, 1, 0, "#5d4659");
        }
        /* Apron skirt. Its top sits 0.02 BELOW the canvas on purpose: at
           y=0 it was exactly coplanar with the canvas quad and wider than
           it, and with no z-buffer the depth sort picked between the two
           arbitrarily — the dark apron won over the far half of the ring
           and the floor appeared to vanish behind the fighters. */
        a3Box(out, 0, -0.37, 0, R * 2 + .5, .7, R * 2 + .5, 0, "#2a1d2a");
        /* corner posts and three ropes a side */
        const P = [[-R, -R], [R, -R], [R, R], [-R, R]];
        for (const [px, pz] of P) a3Box(out, px, 0.75, pz, .22, 1.5, .22, 0, "#cfd8e2");
        const ropeCol = ["#d94f3e", "#e8e2d0", "#3e94e6"];
        for (let i = 0; i < 3; i++) {
          const y = 0.42 + i * 0.42, th = .07;
          for (let s = 0; s < 4; s++) {
            const a = P[s], b = P[(s + 1) % 4];
            const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
            const horiz = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
            a3Box(out, mx, y, mz, horiz ? R * 2 : th, th, horiz ? th : R * 2, 0, ropeCol[i]);
          }
        }
      }

      /* ══ RIGGED FIGHTER ═══════════════════════════════════════════
         A real bone hierarchy, not a pile of boxes at hand-computed
         world positions. Each bone holds a 3x4 matrix composed from its
         parent, so a glove follows a forearm that follows an upper arm,
         and elbows and knees actually bend.

         Conventions, derived from a3Box's own matrix rather than assumed:
           +X = the fighter's own right, +Y = up, +Z = forward (at his man)
           M = Mparent · T(offset) · Ry · Rx · Rz
           NEGATIVE rx flexes an elbow forward; POSITIVE rx folds a knee.
           +rz abducts the right arm, -rz the left.
           Mirroring a pose is (rx, -ry, -rz) with the x offset negated —
           never a negative scale, which flips winding and breaks both the
           backface test and the lambert, as both assume unit normals.      */

      const A3_BONE = [
        /* name,      parent,      offset            */
        ["root",      -1, 0, 1.00, 0],
        ["pelvis",     0, 0, 0.00, 0],
        ["spine",      1, 0, 0.12, 0],
        ["chest",      2, 0, 0.16, 0],
        ["neck",       3, 0, 0.28, 0.02],
        ["head",       4, 0, 0.10, 0],
        ["hood",       5, 0, 0.04, -0.03],
        ["clavR",      3, 0.09, 0.20, 0],
        ["upperR",     7, 0.21, 0, 0],
        ["foreR",      8, 0, -0.32, 0],
        ["gloveR",     9, 0, -0.28, 0],
        ["clavL",      3, -0.09, 0.20, 0],
        ["upperL",    11, -0.21, 0, 0],
        ["foreL",     12, 0, -0.32, 0],
        ["gloveL",    13, 0, -0.28, 0],
        ["hipR",       1, 0.17, -0.06, 0],
        ["shinR",     15, 0, -0.44, 0],
        ["footR",     16, 0, -0.40, 0],
        ["hipL",       1, -0.17, -0.06, 0],
        ["shinL",     18, 0, -0.44, 0],
        ["footL",     19, 0, -0.40, 0],
        ["robeR",      3, 0.20, 0.06, 0.28],
        ["robeL",      3, -0.20, 0.06, 0.28],
        ["robeB",      3, 0, 0.06, -0.28],
      ];
      const A3_NB = A3_BONE.length;
      const A3_BI = {};
      A3_BONE.forEach((b, i) => { A3_BI[b[0]] = i; });

      /* one 12-float matrix per bone, and one pose triple per bone.
         Module scope and reused, so a frame allocates nothing. */
      const a3M = new Float32Array(A3_NB * 12);
      const a3P = new Float32Array(A3_NB * 3);
      const a3TmpR = new Float32Array(9);

      function a3Local(rx, ry, rz, out) {
        const cx = Math.cos(rx), sx = Math.sin(rx);
        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cz = Math.cos(rz), sz = Math.sin(rz);
        /* R = Ry · Rx · Rz, multiplied out once rather than symbolically,
           because a hand-expanded version is where sign bugs hide */
        out[0] = cy * cz + sy * sx * sz;
        out[1] = -cy * sz + sy * sx * cz;
        out[2] = sy * cx;
        out[3] = cx * sz;
        out[4] = cx * cz;
        out[5] = -sx;
        out[6] = -sy * cz + cy * sx * sz;
        out[7] = sy * sz + cy * sx * cz;
        out[8] = cy * cx;
      }

      /* resolve the whole skeleton in one flat forward pass — the bone
         array is in topological order, so no recursion and no stack */
      function a3Skeleton(f) {
        for (let i = 0; i < A3_NB; i++) {
          const B = A3_BONE[i], p = B[1], m = i * 12;
          a3Local(a3P[i * 3], a3P[i * 3 + 1], a3P[i * 3 + 2], a3TmpR);
          const ox = B[2], oy = B[3], oz = B[4];
          if (p < 0) {
            /* the root carries the fighter into the world: his yaw and
               his position on the floor */
            const c = Math.cos(f.yaw), s = Math.sin(f.yaw);
            const r = [c, 0, s, 0, 1, 0, -s, 0, c];
            for (let r0 = 0; r0 < 3; r0++)
              for (let c0 = 0; c0 < 3; c0++) {
                let v = 0;
                for (let k = 0; k < 3; k++) v += r[r0 * 3 + k] * a3TmpR[k * 3 + c0];
                a3M[m + r0 * 3 + c0] = v;
              }
            a3M[m + 9] = f.x;
            a3M[m + 10] = f.y + oy + (f.bob || 0);
            a3M[m + 11] = f.z;
          } else {
            const q = p * 12;
            for (let r0 = 0; r0 < 3; r0++)
              for (let c0 = 0; c0 < 3; c0++) {
                let v = 0;
                for (let k = 0; k < 3; k++) v += a3M[q + r0 * 3 + k] * a3TmpR[k * 3 + c0];
                a3M[m + r0 * 3 + c0] = v;
              }
            a3M[m + 9] = a3M[q] * ox + a3M[q + 1] * oy + a3M[q + 2] * oz + a3M[q + 9];
            a3M[m + 10] = a3M[q + 3] * ox + a3M[q + 4] * oy + a3M[q + 5] * oz + a3M[q + 10];
            a3M[m + 11] = a3M[q + 6] * ox + a3M[q + 7] * oy + a3M[q + 8] * oz + a3M[q + 11];
          }
        }
      }

      /* a cuboid hung off a bone. The matrix origin IS the joint, and the
         box sits at a local offset from it — rotating a forearm about its
         own midpoint would pinwheel it instead of swinging it. bias pulls
         a face forward in the depth sort without moving it. */
      const A3_CORNER = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      ];
      const A3_FACE = [
        [0, 1, 2, 3, 0, 0, -1], [5, 4, 7, 6, 0, 0, 1],
        [4, 0, 3, 7, -1, 0, 0], [1, 5, 6, 2, 1, 0, 0],
        [3, 2, 6, 7, 0, 1, 0], [4, 5, 1, 0, 0, -1, 0],
      ];
      const a3CV = Array.from({ length: 8 }, () => ({ x: 0, y: 0, z: 0 }));
      function a3BoxM(out, bi, ox, oy, oz, sx, sy, sz, col, bias) {
        const m = bi * 12;
        const hx = sx / 2, hy = sy / 2, hz = sz / 2;
        for (let i = 0; i < 8; i++) {
          const c = A3_CORNER[i];
          const lx = ox + c[0] * hx, ly = oy + c[1] * hy, lz = oz + c[2] * hz;
          a3CV[i].x = a3M[m] * lx + a3M[m + 1] * ly + a3M[m + 2] * lz + a3M[m + 9];
          a3CV[i].y = a3M[m + 3] * lx + a3M[m + 4] * ly + a3M[m + 5] * lz + a3M[m + 10];
          a3CV[i].z = a3M[m + 6] * lx + a3M[m + 7] * ly + a3M[m + 8] * lz + a3M[m + 11];
        }
        for (const F of A3_FACE) {
          const nx = F[4], ny = F[5], nz = F[6];
          out.push({
            v: [
              { x: a3CV[F[0]].x, y: a3CV[F[0]].y, z: a3CV[F[0]].z },
              { x: a3CV[F[1]].x, y: a3CV[F[1]].y, z: a3CV[F[1]].z },
              { x: a3CV[F[2]].x, y: a3CV[F[2]].y, z: a3CV[F[2]].z },
              { x: a3CV[F[3]].x, y: a3CV[F[3]].y, z: a3CV[F[3]].z },
            ],
            /* normals go through the upper 3x3 only, and it is a pure
               rotation, so they stay unit length and the lambert holds */
            nx: a3M[m] * nx + a3M[m + 1] * ny + a3M[m + 2] * nz,
            ny: a3M[m + 3] * nx + a3M[m + 4] * ny + a3M[m + 5] * nz,
            nz: a3M[m + 6] * nx + a3M[m + 7] * ny + a3M[m + 8] * nz,
            col, bias: bias || 0,
          });
        }
      }

      /* ── POSE ──────────────────────────────────────────────────────
         Procedural channels on top of a base boxing stance. Everything
         reads the drivers that already tick: step, vx/vz, yaw, sidestep. */
      /* The punch table. Each entry is the pose at FULL EXTENSION in the
         fighter's own frame, and every number was solved against the built
         geometry: where the glove lands, and the separation at which its box
         first touches the target's box.

         Two rig facts the numbers depend on. The head sits 0.30 ABOVE the
         shoulder, and a down-pointing bone only rises once |rx| > pi/2, so
         a straight needs upper rx past -1.57: at -1.45 the glove stops at
         his own shoulder height, 0.14 under the other man's chin. And
         pelvis + spine leave 0.16 of yaw that no punch cancels, so the left
         and right entries are NOT mirrors. Each is solved on its own.

         reach sits just inside the distance where the glove first touches
         him, so a shot that lands has really arrived. close is how much of
         the pose a fighter gets out at A3_SEP: inside his full reach the
         arm stays bent, or the glove would finish inside the man's skull. */
      const A3_PUNCH = {
        /* name:  hand, head/body, seconds, reach+cone for the hit test,
                  HP damage, BRAIN load, stamina cost, then the pose.
           dmg and brain are two SEPARATE quantities and keeping them
           separate is the whole point — see a3Hurt. Note the hook: little
           more HP than the cross but nearly twice the brain load, because
           it is rotational. That is the real mechanism of concussion, and
           here it is a number a player can feel. */
        jab:    { hand: "L", high: 1, dur: 0.26, dmg: 0.6, brain: 0.37, sta: 5,  reach: 1.18, cone: 0.62, close: 0.43,
                  chest: [0.24,  0.60, 0], clav: [0,  0.16, -0.06], upper: [-2.05, -0.35, -0.36], fore: [-0.05, 0, 0] },
        cross:  { hand: "R", high: 1, dur: 0.38, dmg: 1.4, brain: 0.88, sta: 11, reach: 1.22, cone: 0.62, close: 0.39,
                  chest: [0.24, -0.80, 0], clav: [0, -0.41,  0.06], upper: [-2.01,  0.35,  0.50], fore: [-0.22, 0, 0] },
        hookL:  { hand: "L", high: 1, dur: 0.50, dmg: 1.7, brain: 1.50, sta: 14, reach: 1.12, cone: 0.52, close: 0.53,
                  chest: [0.17,  0.66, 0], clav: [0,  0.25, -0.06], upper: [-1.32, -0.10, -1.25], fore: [-1.00, 0, 0] },
        hookR:  { hand: "R", high: 1, dur: 0.50, dmg: 1.9, brain: 1.68, sta: 15, reach: 1.12, cone: 0.52, close: 0.58,
                  chest: [0.18, -0.90, 0], clav: [0, -0.31,  0.06], upper: [-1.26,  0.16,  1.25], fore: [-1.14, 0, 0] },
        bodyL:  { hand: "L", high: 0, dur: 0.42, dmg: 2.4, brain: 0,    sta: 12, reach: 1.16, cone: 0.62, close: 0.40,
                  chest: [0.29,  0.46, 0], clav: [0,  0.13, -0.06], upper: [-1.51, -0.35, -0.20], fore: [-0.02, 0, 0] },
        bodyR:  { hand: "R", high: 0, dur: 0.44, dmg: 2.7, brain: 0,    sta: 13, reach: 1.16, cone: 0.62, close: 0.40,
                  chest: [0.32, -0.60, 0], clav: [0, -0.34,  0.06], upper: [-1.58,  0.35,  0.24], fore: [-0.02, 0, 0] },
      };
      /* The contact frame sits at 0.32 of the punch, which is exactly where
         a3Pose's envelope peaks — so a shot registers at the instant the arm
         is furthest out, and what you see is what the maths did. */
      const A3_LAND = 0.32;
      /* Head-exposure bands. These are the career's own numbers (headWarn 7,
         headStop 20) restated here rather than read from BAL, so the arena
         stays wholly outside the career simulation and the parity signature
         cannot move. */
      const A3_MED = { warn: 7, bad: 13, stop: 20, fade: 0.10 };
      /* How long the AI needs to see a punch before his hands move, rolled
         once per punch. The window sits across the contact times (jab 83 ms
         to hook 160 ms), so the faster the punch the less often he covers
         it, and he covers none of them every time. */
      const A3_REACT = [0.05, 0.18];

      function a3Pose(f) {
        a3P.fill(0);
        const set = (name, rx, ry, rz) => {
          const i = A3_BI[name] * 3;
          a3P[i] = rx; a3P[i + 1] = ry; a3P[i + 2] = rz;
        };
        const t = f.step;
        const breathe = Math.sin(t * 0.8) * 0.02;

        /* how fast and which way he is travelling, in his own frame */
        const c = Math.cos(f.yaw), s = Math.sin(f.yaw);
        const fwd = f.vx * s + f.vz * c;          /* + = advancing   */
        const lat = f.vx * c - f.vz * s;          /* + = to his right */
        const sp = Math.min(1, Math.hypot(f.vx, f.vz) / 2.6);

        /* bladed stance: lead shoulder toward the opponent, hips squarer */
        set("pelvis", 0, 0.26, 0);
        set("spine", -0.04 + fwd * 0.03, -0.10, 0);
        set("chest", -0.06 - fwd * 0.04, -0.16, 0);
        set("neck", 0.05, 0.10, 0);
        set("head", 0.04 + breathe, 0.06, 0);

        /* taking one: the head snaps off the shot and the spine follows,
           fading over about a third of a second */
        const hit = f.hitT || 0;
        if (hit > 0) {
          /* POSITIVE rx leans an up-pointing bone FORWARD. That folds him
             over a body shot, but on a head shot it would drive his face
             into the glove, so the arena sets f.hitBack to reverse it.
             Career fighters never set it and keep the look they have. */
          const dir = f.hitBack ? -1 : f.hitLow ? 0.5 : 1;
          a3P[A3_BI.head * 3] += hit * 0.55 * dir;
          a3P[A3_BI.head * 3 + 2] += hit * 0.30;
          a3P[A3_BI.neck * 3] += hit * 0.26 * dir;
          a3P[A3_BI.chest * 3] += hit * 0.20 * dir;
          a3P[A3_BI.spine * 3] += hit * 0.12 * (f.hitBack ? -1 : 1);
        }
        /* fatigue drops the hands and rounds the back — the tell is
           performed, never pointed at */
        const gassed = Math.max(0, Math.min(1, ((f.fat || 0) - 55) / 45));
        const guard = (f.guard === undefined ? 1 : f.guard) - gassed * 0.42;

        /* guard up by the chin. Reach comes from the arm chain, never
           from translating the glove off the wrist. */
        const jab = f.lunge || 0;
        /* a sore right hand is a hand he will not throw */
        const rt = f.sore ? 0 : 1;
        set("clavR", 0, -0.10 - jab * 0.2 * rt, 0.06);
        set("upperR", (-0.55 - jab * 0.55 * rt) * guard, 0, 0.34);
        set("foreR", -1.50 * guard + jab * 1.30 * rt, 0, 0);
        set("clavL", 0, 0.14, -0.06);
        set("upperL", -0.70 * guard, 0, -0.30);
        set("foreL", -1.65 * guard, 0, 0);
        /* guarding the ribs after body work */
        if (f.guarded) {
          a3P[A3_BI.upperR * 3 + 2] -= 0.22;
          a3P[A3_BI.spine * 3 + 2] += 0.08;
        }

        /* Throwing one. f.punch is {k, t} — which punch, and how far
           through it we are, 0..1. The envelope snaps out over the first
           third and recovers over the rest, because that is what a punch
           does: the hand goes out far faster than it comes back.

           This blends ON TOP of the guard pose rather than replacing it,
           so the off hand stays where the guard put it and a fighter who
           is gassed or covering up still throws from the posture he is
           actually in. */
        const pk = f.punch && A3_PUNCH[f.punch.k];
        if (pk) {
          const pt = f.punch.t;
          const ext = (pt < A3_LAND ? pt / A3_LAND : Math.max(0, 1 - (pt - A3_LAND) / (1 - A3_LAND)))
                    * (f.punch.fit || 1);
          const mix = (name, v) => {
            const i = A3_BI[name] * 3;
            a3P[i]     += (v[0] - a3P[i])     * ext;
            a3P[i + 1] += (v[1] - a3P[i + 1]) * ext;
            a3P[i + 2] += (v[2] - a3P[i + 2]) * ext;
          };
          /* the chest turn is most of the reach, so it is blended first
             and the arm chain hangs off the turned chest */
          const ci = A3_BI.chest * 3;
          const turn = (pk.chest[1] - a3P[ci + 1]) * ext;
          a3P[ci]     += (pk.chest[0] - a3P[ci])     * ext;
          a3P[ci + 1] += turn;
          /* the shoulders turn into the shot, his eyes stay on his man */
          a3P[A3_BI.neck * 3 + 1] -= turn;
          mix("clav"  + pk.hand, pk.clav);
          mix("upper" + pk.hand, pk.upper);
          mix("fore"  + pk.hand, pk.fore);
        }

        /* footwork. A boxer never walks: the feet shuffle, the lead stays
           lead, and he never turns his back. Gait is a small oscillation
           scaled by speed, not a stride cycle. */
        const gait = Math.sin(t) * sp;
        const lift = Math.max(0, Math.sin(t)) * sp;
        /* hip rx swings the leg fore/aft; knee folds on POSITIVE rx */
        set("hipR", -0.12 - gait * 0.30 + fwd * 0.10, 0.10, lat * 0.26);
        set("shinR", 0.22 + lift * 0.40, 0, 0);
        set("footR", 0.04, 0, 0);
        set("hipL", -0.06 + gait * 0.30 - fwd * 0.10, -0.14, lat * 0.26);
        set("shinL", 0.30 + Math.max(0, -Math.sin(t)) * sp * 0.40, 0, 0);
        set("footL", 0.04, 0, 0);

        /* Staggering. This is the "wobbly legs" sign, and it reuses the
           same sway maths the seated branch already proves reads at this
           camera: the pelvis and spine rock, the head hangs, and the
           knees give. One channel, no new geometry. */
        if (f.stag > 0) {
          const k = Math.min(1, f.stag / 0.9), w = Math.sin(t * 2.4) * k;
          a3P[A3_BI.pelvis * 3 + 2] += w * 0.22;
          a3P[A3_BI.spine * 3 + 2] += w * 0.16;
          a3P[A3_BI.chest * 3] += 0.16 * k;
          a3P[A3_BI.neck * 3] += 0.20 * k;
          a3P[A3_BI.head * 3] += 0.26 * k;
          a3P[A3_BI.shinR * 3] += 0.45 * k;        /* POSITIVE rx folds a knee */
          a3P[A3_BI.shinL * 3] += 0.38 * k;
          a3P[A3_BI.hipR * 3 + 2] += w * 0.18;
          a3P[A3_BI.hipL * 3 + 2] += w * 0.18;
        }
        /* The standing sway of a man carrying too much. Small, constant,
           and never pointed at — if the player misses it, he missed it. */
        if (f.unsteady && !f.seated) {
          const sw = Math.sin(t * 0.42) * 0.05 * f.unsteady;
          a3P[A3_BI.pelvis * 3 + 2] += sw * 0.8;
          a3P[A3_BI.spine * 3 + 2] += sw;
          a3P[A3_BI.neck * 3 + 2] += sw * 0.6;
        }

        /* ── ON THE STOOL ──────────────────────────────────────
           Sat down between rounds. Everything here is a sign the sim is
           already tracking, acted out. Nothing is highlighted. */
        if (f.seated) {
          const br = Math.sin(t) * (0.5 + (f.fat || 0) / 150);
          const sway = f.unsteady ? Math.sin(t * 0.42) * 0.07 : 0;
          /* folded onto the stool */
          set("hipR", -1.45, 0.16, 0.10);
          set("shinR", 1.52, 0, 0);
          set("footR", 0.10, 0, 0);
          set("hipL", -1.45, -0.16, -0.10);
          set("shinL", 1.52, 0, 0);
          set("footL", 0.10, 0, 0);
          /* chest rises with the breathing rate; he sways if concussed */
          set("pelvis", 0, 0, sway * 0.4);
          set("spine", 0.20 + br * 0.05, 0, sway);
          set("chest", 0.10 + br * 0.07, 0, sway * 0.6);
          /* the head is the tell. A vacant fighter holds it still and
             low and does not track you; a tired one just hangs it. */
          /* he hangs his head when he is tired, but not so far that the
             face leaves the shot — the face IS the tell, so it has to
             stay readable at this camera */
          const droop = 0.08 + (f.fat || 0) / 420 + (f.vacant || 0) * 0.16;
          set("neck", droop * 0.45, (f.vacant || 0) * 0.22, sway * 0.8);
          set("head", droop, (f.vacant ? Math.sin(t * 0.21) * 0.10 : Math.sin(t * 0.9) * 0.05), 0);
          /* forearms on the thighs, or one hand up to a shut eye, or the
             right hand cradled when it is sore */
          set("clavR", 0, -0.20, 0.10);
          set("clavL", 0, 0.20, -0.10);
          /* elbows on the thighs. Measured, not guessed: at upper -0.35
             and fore -0.95 the glove lands below the elbow and short of
             the head in depth, so the forearms never mask the face. */
          if (f.eyeShut) {
            set("upperL", -1.45, 0.34, -0.26);
            set("foreL", -1.75, 0, 0);
          } else {
            set("upperL", -0.35 - br * 0.03, 0.20, -0.14);
            set("foreL", -0.95, 0, 0);
          }
          if (f.sore) {
            /* cradling it, turned in toward his body */
            set("upperR", -0.55, -0.55, 0.22);
            set("foreR", -1.35, 0, 0);
          } else {
            set("upperR", -0.35 - br * 0.03, -0.20, 0.14);
            set("foreR", -0.95, 0, 0);
          }
          /* body work: the elbow stays down over the ribs */
          if (f.guarded) {
            a3P[A3_BI.upperR * 3 + 2] -= 0.30;
            a3P[A3_BI.spine * 3 + 2] += 0.12;
            a3P[A3_BI.chest * 3] += 0.10;
          }
          return;
        }

        /* sidestep: drop and lean into the step */
        if (f.sidestep > 0) {
          const k = f.sidestep / 0.22;
          a3P[A3_BI.pelvis * 3 + 2] += lat * 0.18 * k;
          a3P[A3_BI.spine * 3 + 2] += lat * 0.12 * k;
        }

        /* the robe trails. Spring-damper per panel, driven by how hard he
           is accelerating and turning — bone-based secondary motion, which
           is what this renderer can actually carry. */
        const R = f.robe;
        const dvx = fwd - R.pf, dvl = lat - R.pl;
        R.pf = fwd; R.pl = lat;
        let dyaw = f.yaw - R.py;
        while (dyaw > Math.PI) dyaw -= Math.PI * 2;
        while (dyaw < -Math.PI) dyaw += Math.PI * 2;
        R.py = f.yaw;
        for (let i = 0; i < 3; i++) {
          const drive = (i === 2 ? -fwd * 0.16 : fwd * 0.10) - dvx * 0.9;
          const side = (i === 0 ? 1 : i === 1 ? -1 : 0) * dyaw * 2.2 - dvl * 0.5;
          /* critically damped-ish: stiff enough to settle, soft enough to lag */
          R.vx[i] += (drive - R.rx[i]) * 26 * f.dt - R.vx[i] * 7.5 * f.dt;
          R.vz[i] += (side - R.rz[i]) * 26 * f.dt - R.vz[i] * 7.5 * f.dt;
          R.rx[i] += R.vx[i] * f.dt;
          R.rz[i] += R.vz[i] * f.dt;
          R.rx[i] = a3Clamp(R.rx[i], -0.55, 0.55);
          R.rz[i] = a3Clamp(R.rz[i], -0.5, 0.5);
        }
        set("robeR", R.rx[0], 0, R.rz[0] + 0.05);
        set("robeL", R.rx[1], 0, R.rz[1] - 0.05);
        set("robeB", R.rx[2], 0, R.rz[2]);
        /* the hood lags the head, at a fraction of it */
        set("hood", a3P[A3_BI.head * 3] * 0.6, a3P[A3_BI.head * 3 + 1] * 0.6, 0);
      }

      /* ── COSTUME ───────────────────────────────────────────────────
         ~50 cuboids. Two rules drive the whole thing. The light only ever
         BRIGHTENS an up-facing surface (0.55x on every side, 1.08x on top),
         so the costume is terraced — every tier presents a horizontal top
         face to catch it. And a3Render shades only '#' colours, so the red
         and white trim is rgb(), which bypasses the lighting entirely and
         holds its value through every yaw. The trim carries the identity
         more reliably than the geometry does at 150-300px.              */
      const A3_SKIN = "#d9956e", A3_SKIN_D = "#b87a56";
      function a3BuildFighter(out, f, hurt) {
        a3Pose(f);
        a3Skeleton(f);
        const B = A3_BI;
        const kit = f.kit;
        const skin = hurt > 0 ? "#e8a090" : A3_SKIN;

        /* legs: boots terraced over shafts over shins */
        for (const side of ["R", "L"]) {
          const hip = B["hip" + side], shin = B["shin" + side], foot = B["foot" + side];
          a3BoxM(out, hip, 0, -0.22, 0, 0.26, 0.44, 0.26, kit.short2, 0);
          a3BoxM(out, hip, 0, -0.41, 0, 0.27, 0.06, 0.27, kit.trimW, 0);
          a3BoxM(out, shin, 0, -0.20, 0, 0.22, 0.40, 0.22, skin, 0);
          a3BoxM(out, shin, 0, -0.33, 0, 0.25, 0.20, 0.25, kit.boot, 0);
          a3BoxM(out, shin, 0, -0.24, 0, 0.26, 0.04, 0.26, kit.trimW, 0.01);
          a3BoxM(out, foot, 0, -0.03, 0.05, 0.26, 0.10, 0.34, kit.boot, 0);
          a3BoxM(out, foot, 0, 0.02, 0.05, 0.27, 0.03, 0.35, kit.bootT, 0.01);
        }

        /* hips and trunks, with a waistband tier */
        a3BoxM(out, B.pelvis, 0, -0.12, 0, 0.44, 0.26, 0.30, kit.short1, 0);
        a3BoxM(out, B.pelvis, 0, 0.02, 0, 0.46, 0.10, 0.32, kit.short2, 0);
        a3BoxM(out, B.pelvis, 0, 0.08, 0, 0.47, 0.05, 0.33, kit.belt, 0.01);

        /* torso: bare chest, framed later by the robe plackets */
        a3BoxM(out, B.spine, 0, 0.08, 0, 0.40, 0.22, 0.26, skin, 0);
        a3BoxM(out, B.chest, 0, 0.10, 0, 0.50, 0.30, 0.30, skin, 0);
        a3BoxM(out, B.chest, 0.12, 0.20, 0.13, 0.20, 0.10, 0.06, A3_SKIN_D, 0.015);
        a3BoxM(out, B.chest, -0.12, 0.20, 0.13, 0.20, 0.10, 0.06, A3_SKIN_D, 0.015);
        /* chain: unlit, so it keeps its glint on every face */
        a3BoxM(out, B.chest, 0, 0.26, 0.14, 0.26, 0.03, 0.03, kit.chain, 0.03);
        a3BoxM(out, B.chest, 0, 0.21, 0.15, 0.05, 0.07, 0.03, kit.chain, 0.03);

        /* head, and the hood over it. The hood is the silhouette: a wedge
           with side walls that project past the face, and an unlit void
           behind so the face reads as recessed rather than painted on. */
        a3BoxM(out, B.neck, 0, 0.05, 0, 0.17, 0.12, 0.17, A3_SKIN_D, 0);
        a3BoxM(out, B.head, 0, 0.14, 0.01, 0.34, 0.34, 0.33, skin, 0);
        a3BoxM(out, B.head, 0, 0.07, 0.17, 0.16, 0.07, 0.03, "#5b2a26", 0.02);
        /* eyes. They only exist as two small blocks, but open vs swollen
           shut vs not-tracking is the whole read, so they are drawn. */
        {
          const sh = f.eyeShut ? 0.012 : 0.034;
          const drift = f.vacant ? Math.sin(f.step * 0.21) * 0.012 : 0;
          a3BoxM(out, B.head, 0.075 + drift, 0.175, 0.168, 0.052, sh, 0.02, "#f4ead8", 0.022);
          a3BoxM(out, B.head, -0.075 + drift, 0.175, 0.168, 0.052,
                 f.eyeShut ? 0.012 : 0.034, 0.02, "#f4ead8", 0.022);
          if (!f.eyeShut) {
            a3BoxM(out, B.head, 0.075 + drift * 2, 0.173, 0.178, 0.022, 0.022, 0.015, "#1b1410", 0.024);
            a3BoxM(out, B.head, -0.075 + drift * 2, 0.173, 0.178, 0.022, 0.022, 0.015, "#1b1410", 0.024);
          }
          a3BoxM(out, B.head, 0.078, 0.205, 0.168, 0.062, 0.016, 0.02, "#2a1d16", 0.023);
          a3BoxM(out, B.head, -0.078, 0.205, 0.168, 0.062, 0.016, 0.02, "#2a1d16", 0.023);
        }
        if (f.bare) {
          /* in the ring: cropped hair and a vest, no entrance robe */
          a3BoxM(out, B.head, 0, 0.29, 0.01, 0.35, 0.10, 0.34, "#17202b", 0.01);
          a3BoxM(out, B.head, 0, 0.20, -0.16, 0.33, 0.22, 0.06, "#17202b", 0.005);
          a3BoxM(out, B.chest, 0, 0.09, -0.02, 0.46, 0.30, 0.27, kit.short1, 0.005);
          a3BoxM(out, B.chest, 0.15, 0.22, -0.02, 0.10, 0.18, 0.28, kit.short1, 0.006);
          a3BoxM(out, B.chest, -0.15, 0.22, -0.02, 0.10, 0.18, 0.28, kit.short1, 0.006);
        } else {
        a3BoxM(out, B.hood, 0, 0.20, -0.04, 0.44, 0.40, 0.44, kit.robe1, 0.06);
        a3BoxM(out, B.hood, 0, 0.40, -0.02, 0.40, 0.10, 0.40, kit.robe2, 0.065);
        a3BoxM(out, B.hood, 0.19, 0.16, 0.12, 0.08, 0.34, 0.22, kit.robe1, 0.07);
        a3BoxM(out, B.hood, -0.19, 0.16, 0.12, 0.08, 0.34, 0.22, kit.robe1, 0.07);
        a3BoxM(out, B.hood, 0, 0.32, 0.14, 0.34, 0.06, 0.06, kit.trimR, 0.075);
        a3BoxM(out, B.hood, 0, -0.04, -0.17, 0.42, 0.30, 0.10, kit.robe2, 0.05);
        }

        /* arms: shoulder yoke, upper, cuff, forearm, glove */
        for (const side of ["R", "L"]) {
          const cl = B["clav" + side], up = B["upper" + side];
          const fo = B["fore" + side], gl = B["glove" + side];
          a3BoxM(out, cl, 0.10 * (side === "R" ? 1 : -1), 0.02, 0, 0.22, 0.20, 0.26, kit.robe1, 0.02);
          a3BoxM(out, cl, 0.10 * (side === "R" ? 1 : -1), 0.12, 0, 0.23, 0.05, 0.27, kit.trimR, 0.025);
          a3BoxM(out, up, 0, -0.16, 0, 0.19, 0.32, 0.19, skin, 0);
          a3BoxM(out, fo, 0, -0.12, 0, 0.17, 0.26, 0.17, skin, 0);
          a3BoxM(out, fo, 0, -0.22, 0, 0.21, 0.09, 0.21, kit.cuff, 0.03);
          a3BoxM(out, fo, 0, -0.17, 0, 0.22, 0.03, 0.22, kit.trimW, 0.035);
          a3BoxM(out, gl, 0, -0.08, 0.02, 0.26, 0.26, 0.28, kit.glove, 0.10);
          a3BoxM(out, gl, 0, 0.02, 0.02, 0.27, 0.05, 0.29, kit.gloveT, 0.105);
        }

        /* the robe. Three lagging panels: two open plackets framing the
           bare chest, one long back. Each is tiered so the hem catches
           light, and each sits clear of the body in the depth sort. */
        const panel = (bone, w, bias) => {
          a3BoxM(out, bone, 0, -0.16, 0, w, 0.34, 0.09, kit.robe1, bias);
          a3BoxM(out, bone, 0, -0.44, 0, w * 1.04, 0.26, 0.10, kit.robe2, bias);
          a3BoxM(out, bone, 0, -0.58, 0, w * 1.08, 0.05, 0.11, kit.trimR, bias + 0.005);
          a3BoxM(out, bone, 0, -0.74, 0, w * 1.08, 0.28, 0.11, kit.robe1, bias);
          a3BoxM(out, bone, 0, -0.89, 0, w * 1.1, 0.05, 0.12, kit.trimW, bias + 0.005);
        };
        if (!f.bare) {
        panel(B.robeR, 0.17, 0.05);
        panel(B.robeL, 0.17, 0.05);
        /* the back panel sorts BEHIND the body, or it draws over his spine */
        a3BoxM(out, B.robeB, 0, -0.18, 0, 0.50, 0.38, 0.10, kit.robe2, -0.04);
        a3BoxM(out, B.robeB, 0, -0.48, 0, 0.52, 0.28, 0.11, kit.robe1, -0.04);
        a3BoxM(out, B.robeB, 0, -0.64, 0, 0.53, 0.05, 0.12, kit.trimR, -0.035);
        a3BoxM(out, B.robeB, 0, -0.80, 0, 0.53, 0.28, 0.12, kit.robe2, -0.04);
        a3BoxM(out, B.robeB, 0, -0.95, 0, 0.54, 0.05, 0.13, kit.trimW, -0.035);
        }
        /* a cut over the eye, at the severity the sim is already tracking.
           A clean mark and nothing more — no spray, no gore. */
        if (f.cut > 0)
          a3BoxM(out, B.head, -0.10, 0.22, 0.165, 0.09, 0.015 + f.cut * 0.012, 0.02,
                 "rgb(150,36,30)", 0.03);
        if (f.cut > 1)
          a3BoxM(out, B.head, -0.10, 0.14, 0.165, 0.035, 0.10, 0.02,
                 "rgb(126,28,24)", 0.03);

        /* contact shadow */
        a3Quad(out, a3V(f.x - .36, .02, f.z - .36), a3V(f.x + .36, .02, f.z - .36),
                    a3V(f.x + .36, .02, f.z + .36), a3V(f.x - .36, .02, f.z + .36),
               0, 1, 0, "rgba(0,0,0,.45)");
      }

      /* ── camera: frame both fighters, Tekken-ish ──────────────── */
      function a3Camera(dt) {
        const p = A3.p, o = A3.o, cam = A3.cam;
        const mx = (p.x + o.x) / 2, mz = (p.z + o.z) / 2;
        let ax = o.x - p.x, az = o.z - p.z;
        const sep = Math.hypot(ax, az) || 1;
        ax /= sep; az /= sep;
        let perpX = -az, perpZ = ax;
        /* stay on the side we are already on, or the view flips on a cross */
        if (perpX * (cam.x - mx) + perpZ * (cam.z - mz) < 0) { perpX = -perpX; perpZ = -perpZ; }
        const dist = a3Clamp(5.4 + sep * 0.8, 6.2, 12.5);
        const wantX = mx + perpX * dist, wantZ = mz + perpZ * dist;
        const wantY = 3.3 + sep * 0.1;
        const k = Math.min(1, dt * 3.2);
        cam.x += (wantX - cam.x) * k;
        cam.y += (wantY - cam.y) * k;
        cam.z += (wantZ - cam.z) * k;
        cam.lx += (mx - cam.lx) * Math.min(1, dt * 5);
        cam.ly += (1.45 - cam.ly) * Math.min(1, dt * 5);
        cam.lz += (mz - cam.lz) * Math.min(1, dt * 5);
        cam.fov += (a3Clamp(0.95 + sep * 0.012, 0.95, 1.12) - cam.fov) * Math.min(1, dt * 2);
      }

      /* ── shared movement rules ────────────────────────────────── */
      function a3Face(f, tx, tz, dt) {
        const want = Math.atan2(tx - f.x, tz - f.z);
        let d = want - f.yaw;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        if (Math.abs(d) < 0.004) return;                 /* no jitter */
        /* he turns into a punch he is throwing, or a man circling him would
           be "hit" by a glove that visibly passes beside his head */
        f.yaw += d * Math.min(1, dt * (f.punch && !f.fired ? 27 : 9));
      }
      /* direction is WORLD space. The player feeds it camera-relative input
         so W is always "away from the camera" whichever way the fight has
         turned; the AI feeds its own approach vector. Facing is handled
         separately by a3Face, so he stays bladed to his man either way. */
      function a3Drive(f, dx, dz, speed, dt) {
        const l = Math.hypot(dx, dz);
        if (l > 1) { dx /= l; dz /= l; }                 /* diagonals are not faster */
        const tvx = dx * speed, tvz = dz * speed;
        const a = Math.min(1, dt * (l > 0.01 ? 11 : 15)); /* accel in, brake harder */
        f.vx += (tvx - f.vx) * a;
        f.vz += (tvz - f.vz) * a;
        f.x += f.vx * dt;
        f.z += f.vz * dt;
        const moving = Math.hypot(f.vx, f.vz);
        f.step += dt * (3 + moving * 2.4);
        return moving;
      }
      function a3Collide() {
        for (const f of [A3.p, A3.o]) {
          f.x = a3Clamp(f.x, -A3_BOUND, A3_BOUND);
          f.z = a3Clamp(f.z, -A3_BOUND, A3_BOUND);
        }
        const p = A3.p, o = A3.o;
        let dx = o.x - p.x, dz = o.z - p.z;
        let d = Math.hypot(dx, dz);
        if (d < 0.0001) { dx = 1; dz = 0; d = 1; }
        if (d < A3_SEP) {
          const push = (A3_SEP - d) / 2;
          p.x -= (dx / d) * push; p.z -= (dz / d) * push;
          o.x += (dx / d) * push; o.z += (dz / d) * push;
        }
      }

      /* ── the player ───────────────────────────────────────────── */
      function a3Player(dt) {
        const p = A3.p, K = A3.keys, cam = A3.cam;
        const fwd = (K.has("w") ? 1 : 0) - (K.has("s") ? 1 : 0);
        const str = (K.has("d") ? 1 : 0) - (K.has("a") ? 1 : 0);
        /* camera-relative: flatten the camera's forward onto the floor and
           take right as a quarter turn from it, so W is always into the
           screen no matter where the camera has swung to */
        let cfx = cam.lx - cam.x, cfz = cam.lz - cam.z;
        const cl = Math.hypot(cfx, cfz) || 1;
        cfx /= cl; cfz /= cl;
        const crx = cfz, crz = -cfx;
        const dx = cfx * fwd + crx * str;
        const dz = cfz * fwd + crz * str;
        /* the guard is a held key, and it is not free: it bleeds stamina
           and it slows him down. Stamina is settled in a3Tick. */
        p.block = (K.has("shift") && !p.punch && p.stag <= 0) ? 1 : 0;

        /* walking is free; only the sidestep costs anything */
        let speed = 2.6;
        if (p.sidestep > 0) { p.sidestep -= dt; speed = 6.4; }
        if (p.block) speed *= 0.55;
        if (p.punch) speed *= 0.42;      /* you plant to throw */
        if (p.stag > 0) speed *= 0.3;
        a3Drive(p, dx, dz, speed, dt);
        /* a fighter carrying head load is slow to find his man — a real
           sign, and an exploitable one */
        a3Face(p, A3.o.x, A3.o.z, dt * (p.head >= A3_MED.warn ? 0.6 : 1));
      }
      function a3Sidestep() {
        const p = A3.p;
        if (p.sidestep > 0 || p.sta < 18 || p.punch || p.stag > 0) return;
        p.sta -= 18; p.sidestep = 0.22;
      }

      /* ── the opponent ─────────────────────────────────────────── */
      function a3AI(dt) {
        const o = A3.o, p = A3.p;
        o.ai = o.ai || { t: 0, strafe: 1, want: 2.1 };
        o.ai.t -= dt;
        if (o.ai.t <= 0) {                               /* re-think now and then */
          /* He commits and breaks off like a fighter rather than drifting.
             The preferred range MUST sit inside punching distance: the
             longest reach is 1.22, so the old 1.5-3.4 band meant he could
             never have landed anything even if he had tried. */
          o.ai.t = 0.35 + Math.random() * 0.45;
          o.ai.strafe = Math.random() < 0.5 ? -1 : 1;
          o.ai.want = 0.95 + Math.random() * 0.55;
          o.ai.aggr = 0.35 + Math.random() * 0.5;
        }
        const d = Math.hypot(p.x - o.x, p.z - o.z);
        /* close the gap, back off when crowded, and never just stand */
        const fwd = d > o.ai.want + 0.10 ? 1 : d < o.ai.want - 0.18 ? -1 : 0;
        const str = o.ai.strafe * (d < 3.2 ? 1 : 0.35);
        /* its intent is relative to the man in front of it; turn that into
           world space so it shares one movement path with the player */
        const dx = Math.sin(o.yaw) * fwd + Math.cos(o.yaw) * str;
        const dz = Math.cos(o.yaw) * fwd - Math.sin(o.yaw) * str;
        let speed = 2.3;
        /* a3Tick owns stamina now, for both fighters, so there is one
           recovery curve in the mode rather than two that drift apart */
        if (o.sidestep > 0) { o.sidestep -= dt; speed = 6.0; }
        else if (d < 2.2 && o.sta > 34 && !o.punch && o.stag <= 0 && Math.random() < dt * 0.5) {
          /* it buys angles with the same stamina the player spends */
          o.sidestep = 0.2; o.sta -= 18;
        }
        if (o.block) speed *= 0.55;
        if (o.punch) speed *= 0.42;
        if (o.stag > 0) speed *= 0.3;
        a3Drive(o, dx, dz, speed, dt);
        a3Face(o, p.x, p.z, dt * (o.head >= A3_MED.warn ? 0.6 : 1));

        /* ── his offence ─────────────────────────────────────────
           He picks by range and by what the player is doing, so the
           player's own habits are what punish him. Hiding behind a high
           guard invites the body; standing in range invites the hook. */
        o.ai.cool = (o.ai.cool || 0) - dt;
        if (a3CanAct(o) && o.ai.cool <= 0 && d < 1.17) {
          const r = Math.random();
          let k;
          /* digs to the body of a man hiding behind his hands */
          if (p.block && r < 0.55) k = Math.random() < 0.5 ? "bodyL" : "bodyR";
          else if (d < 1.08 && r < 0.32 + o.ai.aggr * 0.25) k = "hookR";
          else if (d < 1.18 && r < 0.36 + o.ai.aggr * 0.2) k = "cross";
          else k = "jab";
          if (a3Throw(o, k)) o.ai.cool = 0.70 + Math.random() * 0.9;
        }
        /* ── his defence ─────────────────────────────────────────
           He can only cover a punch he has had time to see, so he is
           beatable, and the reaction window is the one difficulty knob. */
        if (!o.punch && o.stag <= 0) {
          /* p.fired is what ends it: a3AI runs before a3Tick, so the guard
             he has up on the contact frame is the guard that gets tested */
          const inc = p.punch && !p.fired && d < 1.5 ? p.punch : null;
          if (inc !== o.ai.seen) {
            o.ai.seen = inc;
            o.ai.saw = 0;
            o.ai.react = A3_REACT[0] + Math.random() * (A3_REACT[1] - A3_REACT[0]);
          }
          if (inc) o.ai.saw += dt;
          o.block = (inc && o.ai.saw > o.ai.react && o.sta > 14) ? 1 : 0;
        } else o.block = 0;
      }

      /* ══ COMBAT ═══════════════════════════════════════════════════
         Two quantities, and keeping them apart is the entire design.

         hp    is on screen. It falls from everything, but mostly from the
               body: a head shot costs little of it.
         head  is NOT on screen, anywhere, ever. It rises only from head
               contact, weighted by rotation, and it sheds at 0.10/sec —
               far slower than it builds. A fighter can be in real trouble
               while his bar still looks healthy, which is the true thing
               this mode exists to teach. Drawing it would destroy it.

         Nothing here touches the career simulation: no BAL, no G.me, no
         mkOpp. It is all inside A3.* and the fighters A3 owns.          */

      /* Can he throw at all? */
      function a3CanAct(f) {
        return !f.punch && f.stag <= 0 && f.hp > 0 && A3.state === "fight";
      }
      /* Start a punch. Refuses a right hand he will not throw (f.sore is
         the same flag a3Pose already reads to keep that hand home). */
      function a3Throw(f, k) {
        const P = A3_PUNCH[k];
        if (!P || !a3CanAct(f)) return false;
        if (f.sore && P.hand === "R") return false;
        if (f.sta < P.sta * 0.5) return false;        /* too gassed to commit */
        f.punch = { k, t: 0 };
        f.fired = 0;
        f.block = 0;                                   /* cannot punch behind a guard */
        f.sta = Math.max(0, f.sta - P.sta);
        f.spent = 0.45;
        return true;
      }

      /* The contact test. Analytic from (x, z, yaw) only — no bone
         sampling. a3M is one shared scratch buffer that a3BuildFighter
         overwrites per fighter per frame, so reading it here would make
         the result depend on render order. It agrees with the picture
         because the poses and reach column were solved against each other. */
      function a3Contact(a, d) {
        const P = A3_PUNCH[a.punch.k];
        const dx = d.x - a.x, dz = d.z - a.z;
        const dist = Math.hypot(dx, dz) || 0.0001;
        if (dist > P.reach) return null;
        /* a3Face sets yaw = atan2(dx, dz), so forward is (sin, cos) */
        const dot = (dx * Math.sin(a.yaw) + dz * Math.cos(a.yaw)) / dist;
        if (dot < P.cone) return null;
        return { P, dist };
      }

      /* Land one. Returns what happened, for the cue. */
      function a3Hurt(a, d, P, dist) {
        /* A slip beats a punch outright — but only in the outer part of its
           range. Any closer there is nowhere to go and you have to block. */
        if (d.sidestep > 0 && dist > P.reach * 0.86) return "slip";

        const blocked = d.block && !d.punch && d.stag <= 0;
        let dmg = P.dmg, brain = P.brain;
        /* Thrown from the edge of his range it lands long and glances off.
           This is what makes distance a real defence rather than a number:
           being a foot further away turns a clean shot into a graze. */
        const graze = dist / P.reach > 0.92;
        if (graze) { dmg *= 0.45; brain *= 0.3; }

        /* caught mid-throw: the whole risk of committing to a power shot */
        if (d.punch) { dmg *= 1.6; brain *= 1.6; }
        /* a tired man hits softer on both counts: a slower fist also turns
           the head less */
        const gas = Math.max(0, Math.min(1, ((100 - a.sta) - 50) / 50));
        dmg *= 1 - 0.35 * gas;
        brain *= 1 - 0.35 * gas;
        /* and a tired NECK does not brace, so he takes more */
        if (d.sta < 30) brain *= 1.25;

        if (blocked) {
          /* How much the guard is worth scales with how high it actually
             is. a3Pose already sags a tired fighter's hands; this makes
             that sag cost him, so the picture and the maths are one
             thing rather than two. */
          const sag = Math.max(0, Math.min(1, ((d.fat || 0) - 55) / 45)) * 0.42;
          const hold = Math.max(0, Math.min(1, (d.guard - sag - 0.6) / 0.65));
          if (P.high) { dmg *= 0.25 + 0.6 * (1 - hold); brain *= 0.18 + 0.62 * (1 - hold); }
          else { dmg *= 0.9; d.sta = Math.max(0, d.sta - 6); }  /* the body is open */
        }
        d.hp = Math.max(0, d.hp - dmg);
        /* a high guard really stops a head shot; the body is open anyway */
        const covered = blocked && P.high;
        d.hitT = covered ? 0.35 : graze ? 0.6 : 1;
        d.hitLow = !P.high;
        d.hitBack = P.high;
        if (!covered && !graze) d.hurt = 0.18;   /* the flash of a shot that got in */

        if (P.high) {
          d.head += brain;
          if (!blocked && !graze) { d.clean++; a.landed++; }
          /* a hook that gets through clean staggers outright */
          if (!blocked && !graze && P.brain >= 1.25 && d.stag <= 0) d.stag = 0.9;
        } else {
          d.sta = Math.max(0, d.sta - 14);
          d.guarded = 1;
          d.bodyT = 6; d.bodyN++;
        }
        A3.shake = Math.min(1, A3.shake + (P.high ? 0.7 : 0.45));
        return blocked ? "block" : "hit";
      }

      /* Per-fighter timers. Everything the renderer already knows how to
         show is driven from here, so the tells cost no new geometry. */
      function a3Tick(f, dt) {
        f.spent = Math.max(0, f.spent - dt);
        f.stag = Math.max(0, f.stag - dt);
        f.bodyT = Math.max(0, f.bodyT - dt);
        if (f.bodyT <= 0) f.bodyN = 0;
        f.hitT = Math.max(0, (f.hitT || 0) - dt * 3.2);
        f.hurt = Math.max(0, (f.hurt || 0) - dt);
        if (f.guarded && f.bodyT <= 0) f.guarded = 0;

        /* head load sheds, slowly. Staying out of range is a tactic, not
           an eraser: a whole round sheds 9. */
        f.head = Math.max(0, f.head - A3_MED.fade * dt);

        /* THE LOOP, closed: stamina becomes fatigue, and a3Pose already
           drops the hands of a fatigued fighter at fat > 55. Hands down
           is how head load climbs. One assignment, and the most important
           tell in the mode renders through code that already shipped. */
        f.fat = 100 - f.sta;

        /* the bands. Every sign here is postural and therefore readable
           at arena distance; none of it is pointed at. */
        f.vacant = f.head >= A3_MED.bad ? 1 : f.head >= A3_MED.warn ? 0.6 : 0;
        f.unsteady = f.head >= A3_MED.bad ? 1 : 0;
        if (f.head >= A3_MED.warn && !f.cut && f.clean > 6) f.cut = 1;

        if (f.punch) {
          const P = A3_PUNCH[f.punch.k];
          const other = f === A3.p ? A3.o : A3.p;
          f.punch.t += dt / P.dur;
          /* the arm gets out as far as the man in front of it allows */
          const room = (Math.hypot(other.x - f.x, other.z - f.z) - A3_SEP) / (P.reach - A3_SEP);
          f.punch.fit = P.close + (1 - P.close) * a3Clamp(room, 0, 1);
          if (!f.fired && f.punch.t >= A3_LAND) {
            f.fired = 1;
            const c = a3Contact(f, other);
            if (c) a3Hurt(f, other, c.P, c.dist);
            else A3.shake = Math.min(1, A3.shake + 0.05);
          }
          if (f.punch.t >= 1) f.punch = null;
        }
        /* stamina returns, but not while guarding and not straight after
           a punch; three body shots in six seconds halves the recovery */
        if (!f.block && f.spent <= 0) {
          const rate = f.bodyN >= 3 ? 7 : 14;
          f.sta = Math.min(f.maxSta, f.sta + rate * dt);
        }
        if (f.block) f.sta = Math.max(0, f.sta - 9 * dt);
        f.sta = a3Clamp(f.sta, 0, f.maxSta);
        /* the guard itself: up is 1.25, and it sags when there is nothing
           left to hold it up with */
        const want = f.block ? (f.sta <= 12 ? 0.6 : 1.25) : 1;
        f.guard = (f.guard === undefined ? 1 : f.guard) + (want - f.guard) * Math.min(1, dt * 12);
      }

      /* ── render ───────────────────────────────────────────────── */
      function a3Render(cv, ctx) {
        const W = cv.width, H = cv.height;
        /* a landed shot kicks the camera, exactly the way boutScene does.
           The Camera Shake setting still governs it. */
        const sh = uiPrefs.shake && !uiPrefs.motion ? A3.shake : 0;
        const cam = sh > 0
          ? { x: A3.cam.x + Math.sin(sh * 37) * sh * 0.07,
              y: A3.cam.y + Math.cos(sh * 29) * sh * 0.05,
              z: A3.cam.z, lx: A3.cam.lx, ly: A3.cam.ly, lz: A3.cam.lz, fov: A3.cam.fov }
          : A3.cam;
        /* hall behind the ring */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#0a0f18"); g.addColorStop(0.55, "#141d2b"); g.addColorStop(1, "#070a10");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        const faces = [];
        a3BuildArena(faces);
        a3BuildFighter(faces, A3.o, A3.o.hurt || 0);
        a3BuildFighter(faces, A3.p, A3.p.hurt || 0);
        a3Draw(ctx, W, H, cam, faces);
      }

      /* the scene core, reusable: any camera, any face list, any canvas.
         The arena and the career bout both go through here. */
      function a3Draw(ctx, W, H, cam, faces, light) {
        const B = a3Basis(cam);
        /* project, cull, depth sort — painter's algorithm */
        const draw = [];
        for (const f of faces) {
          const pts = [];
          let ok = true, zsum = 0;
          for (const v of f.v) {
            const q = a3Project(v.x, v.y, v.z, cam, B, W, H);
            if (!q) { ok = false; break; }
            pts.push(q); zsum += q.z;
          }
          if (!ok) continue;
          /* backface: skip faces pointing away from the eye */
          const cxp = (f.v[0].x + f.v[2].x) / 2 - cam.x;
          const cyp = (f.v[0].y + f.v[2].y) / 2 - cam.y;
          const czp = (f.v[0].z + f.v[2].z) / 2 - cam.z;
          if (f.nx * cxp + f.ny * cyp + f.nz * czp > 0) continue;
          draw.push({ pts, z: zsum / f.v.length - (f.bias || 0),
                      nx: f.nx, ny: f.ny, nz: f.nz, col: f.col });
        }
        /* painter's algorithm keyed on mean depth, less each face's bias.
           A mean-of-four-corners key cannot order near-coplanar parts on
           its own, so the costume declares its own layering. */
        draw.sort((a, b) => b.z - a.z);

        /* One directional light plus ambient. It is per-scene because a
           fixed camera can end up staring into the shadow side: in the
           corner the key sits over the camera's shoulder, or every
           forward-facing surface — his whole face — renders at the 0.55
           floor and he reads as a silhouette. */
        const L = light || [-0.42, 0.82, -0.38];
        const LX = L[0], LY = L[1], LZ = L[2];
        for (const f of draw) {
          let col = f.col;
          if (col.charAt(0) === "#") {
            const lam = Math.max(0, f.nx * LX + f.ny * LY + f.nz * LZ);
            const sh = 0.55 + lam * 0.65;
            const n = parseInt(col.slice(1), 16);
            const r = a3Clamp(((n >> 16) & 255) * sh, 0, 255) | 0;
            const gg = a3Clamp(((n >> 8) & 255) * sh, 0, 255) | 0;
            const b2 = a3Clamp((n & 255) * sh, 0, 255) | 0;
            col = "rgb(" + r + "," + gg + "," + b2 + ")";
          }
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(f.pts[0].sx, f.pts[0].sy);
          for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i].sx, f.pts[i].sy);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* ── HUD ──────────────────────────────────────────────────── */
      function a3Hud() {
        const set = (id, v) => { const n = document.querySelector(id); if (n) n.style.width = v + "%"; };
        set("#a3-php", (A3.p.hp / A3.p.maxHp) * 100);
        set("#a3-psta", (A3.p.sta / A3.p.maxSta) * 100);
        set("#a3-ohp", (A3.o.hp / A3.o.maxHp) * 100);
        set("#a3-osta", (A3.o.sta / A3.o.maxSta) * 100);
        const t = document.querySelector("#a3-time");
        if (t) t.textContent = Math.max(0, Math.ceil(A3.left));
        const pv = document.querySelector("#a3-phpv"), ov = document.querySelector("#a3-ohpv");
        if (pv) pv.textContent = Math.max(0, Math.round(A3.p.hp));
        if (ov) ov.textContent = Math.max(0, Math.round(A3.o.hp));
      }

      /* ── match lifecycle ──────────────────────────────────────── */
      function a3Reset() {
        A3.state = "intro"; A3.t = 0; A3.intro = 3.2; A3.left = 90;
        A3.p = a3Fighter(-1, "You", "#2f6fb0", "#1d4a78", "player");
        A3.o = a3Fighter(1, "Rival", "#a8382c", "#75241b", "rival");
        /* In the ring, not in the entrance robe. The hood's side walls sit
           in front of the eyes at most camera angles and the face carries
           half the tells — and dropping the robe frees 90 faces a fighter. */
        A3.p.bare = true; A3.o.bare = true;
        A3.shake = 0; A3.taught = A3.taught || false;
        A3.cam = { x: 0, y: 4, z: -9, lx: 0, ly: 1.15, lz: 0, fov: 1.02 };
        A3.keys.clear();
        const b = document.querySelector("#a3-banner");
        if (b) { b.textContent = "READY"; b.hidden = false; }
        const r = document.querySelector("#a3-restart");
        if (r) r.hidden = true;
      }
      /* The only text in the mode, and it is a report rather than a lesson.
         It tells you what you TOOK, after the fact, which is the honest
         shape of the thing: you find out afterwards. If you won on time
         while taking more clean head shots than you landed, this line says
         so, and that reframes the win without a word of editorial. */
      function a3End(msg) {
        if (A3.state === "over") return;
        A3.state = "over";
        A3.p.punch = null; A3.o.punch = null;
        A3.p.block = 0; A3.o.block = 0;
        A3.p.hitT = 0; A3.o.hitT = 0;
        A3.p.hurt = 0; A3.o.hurt = 0;
        /* The man it happened to stops standing to attention about it.
           a3Tick no longer runs once the state is "over", so this sticks:
           the stagger pose folds his knees and hangs his head, which is
           the same channel the hook already uses. */
        const hard = msg.indexOf("DOWN") === 0 || msg.indexOf("STOPPED") === 0;
        const loser = !hard ? null
                    : msg.indexOf("WIN") >= 0 || msg.indexOf("HE WAS") >= 0 ? A3.o : A3.p;
        if (loser) { loser.stag = 0.9; loser.unsteady = 1; loser.hurt = 1; }
        const b = document.querySelector("#a3-banner");
        if (b) {
          const lines = ["you took " + A3.p.clean +
                         " clean to the head \u00b7 he took " + A3.p.landed];
          /* once per session, the first time a stoppage ever happens */
          if (msg.indexOf("STOPPED") === 0 && !A3.taught) {
            A3.taught = true;
            lines.push("he was carrying it before you saw it");
          }
          b.innerHTML = escapeUI(msg) +
            lines.map((l) => "<small>" + escapeUI(l) + "</small>").join("");
          b.hidden = false;
        }
        const r = document.querySelector("#a3-restart");
        if (r) r.hidden = false;
      }
      function a3Step(dt) {
        if (A3.state === "intro") {
          A3.intro -= dt;
          A3.p.dt = dt; A3.o.dt = dt;
          const b = document.querySelector("#a3-banner");
          if (b) b.textContent = A3.intro > 2.1 ? "READY" : A3.intro > 0.9 ? "SET" : "FIGHT";
          a3Face(A3.p, A3.o.x, A3.o.z, dt);
          a3Face(A3.o, A3.p.x, A3.p.z, dt);
          if (A3.intro <= 0) {
            A3.state = "fight";
            const bb = document.querySelector("#a3-banner");
            if (bb) bb.hidden = true;
          }
        } else if (A3.state === "fight") {
          A3.left -= dt;
          A3.p.dt = dt; A3.o.dt = dt;
          a3Player(dt);
          a3AI(dt);
          a3Tick(A3.p, dt);
          a3Tick(A3.o, dt);
          a3Collide();
          A3.shake = Math.max(0, A3.shake - dt * 4);
          /* A fight can end two ways, and that it can end the SECOND way
             is the point of the mode: a man whose head has taken too much
             is pulled out whatever his bar says. A player who sees that
             happen at two-thirds health has learned the thing. */
          if (A3.p.head >= A3_MED.stop) a3End("STOPPED - YOU WERE PULLED OUT");
          else if (A3.o.head >= A3_MED.stop) a3End("STOPPED - HE WAS PULLED OUT");
          else if (A3.p.hp <= 0) a3End("DOWN - YOU LOSE");
          else if (A3.o.hp <= 0) a3End("DOWN - YOU WIN");
          else if (A3.left <= 0) {
            a3End(A3.p.hp === A3.o.hp ? "DRAW"
                : A3.p.hp > A3.o.hp ? "TIME — YOU WIN" : "TIME — YOU LOSE");
          }
        } else {
          /* keep facing one another while the result sits on screen */
          a3Face(A3.p, A3.o.x, A3.o.z, dt);
          a3Face(A3.o, A3.p.x, A3.p.z, dt);
        }
        a3Camera(dt);
        a3Hud();
      }

      /* ── open / close ─────────────────────────────────────────── */
      function openArena3D() {
        document.querySelectorAll(".arena3").forEach((n) => n.remove());
        const el = document.createElement("div");
        el.className = "arena3";
        el.innerHTML =
          '<canvas id="a3-canvas"></canvas>' +
          '<div class="a3-hud">' +
            '<div class="a3-side">' +
              '<div class="a3-name">YOU <b id="a3-phpv">100</b></div>' +
              '<div class="a3-bar"><i id="a3-php" style="width:100%"></i></div>' +
              '<div class="a3-bar sta"><i id="a3-psta" style="width:100%"></i></div>' +
            "</div>" +
            '<div class="a3-mid"><b id="a3-time">90</b><span>ROUND 1</span></div>' +
            '<div class="a3-side right">' +
              '<div class="a3-name"><b id="a3-ohpv">100</b> RIVAL</div>' +
              '<div class="a3-bar"><i id="a3-ohp" style="width:100%"></i></div>' +
              '<div class="a3-bar sta"><i id="a3-osta" style="width:100%"></i></div>' +
            "</div>" +
          "</div>" +
          '<div class="a3-banner" id="a3-banner">READY</div>' +
          '<div class="a3-keys"><span>WASD move · Shift guard · Space slip · Esc exit</span>' +
            '<span>J jab · K cross · L hook · I body</span></div>' +
          '<button class="a3-exit" id="a3-exit" type="button">Exit</button>' +
          '<button class="a3-restart" id="a3-restart" type="button" hidden>Fight again</button>';
        document.body.appendChild(el);

        const cv = el.querySelector("#a3-canvas");
        const ctx = cv.getContext("2d");
        const fit = () => {
          const r = Math.min(2, window.devicePixelRatio || 1);
          cv.width = Math.round(el.clientWidth * r);
          cv.height = Math.round(el.clientHeight * r);
        };
        fit();
        window.addEventListener("resize", fit);
        el._fit = fit;

        a3Reset();
        A3.on = true;
        A3.last = performance.now();
        const loop = (now) => {
          if (!A3.on || !document.querySelector(".arena3")) return;
          const dt = Math.min(0.05, (now - A3.last) / 1000);
          A3.last = now;
          a3Step(dt);
          a3Render(cv, ctx);
          A3.raf = requestAnimationFrame(loop);
        };
        A3.raf = requestAnimationFrame(loop);

        el.querySelector("#a3-exit").addEventListener("click", closeArena3D);
        el.querySelector("#a3-restart").addEventListener("click", a3Reset);
      }
      function closeArena3D() {
        A3.on = false;
        if (A3.raf) cancelAnimationFrame(A3.raf);
        A3.raf = 0;
        const el = document.querySelector(".arena3");
        if (el && el._fit) window.removeEventListener("resize", el._fit);
        document.querySelectorAll(".arena3").forEach((n) => n.remove());
      }
      const a3Open = () => !!document.querySelector(".arena3");
      window.addEventListener("keydown", (e) => {
        if (!a3Open()) return;
        const k = e.key.toLowerCase();
        if (k === "escape") { e.preventDefault(); return closeArena3D(); }
        if (["w", "a", "s", "d", "shift"].includes(k)) { A3.keys.add(k); e.preventDefault(); }
        if (k === " ") { a3Sidestep(); e.preventDefault(); }
        /* punches. e.repeat is guarded or holding a key machine-guns.
           1-4 alias J/K/L/I so the arena matches the Street Fight
           convention for anyone who learned it there. */
        if (!e.repeat) {
          const PK = { j: "jab", k: "cross", l: "hookR", i: "bodyL",
                       "1": "jab", "2": "cross", "3": "hookR", "4": "bodyL" };
          if (PK[k]) { a3Throw(A3.p, PK[k]); e.preventDefault(); }
        }
      });
      window.addEventListener("keyup", (e) => {
        if (!a3Open()) return;
        A3.keys.delete(e.key.toLowerCase());
      });
      window.addEventListener("blur", () => A3.keys.clear());

      /* ── MODE SELECT ─────────────────────────────────────────────
         PLAY opens a picker rather than dropping straight into the
         career. Missions is the career and is live; the other three
         are stubs that say so instead of pretending. */
      const MODES = [
        { id: "missions", label: "Missions", live: true,
          sub: "The career. Eight bouts, then the title — and every call in between.",
          art: 0 },
        { id: "street", label: "Street Fight", live: true,
          sub: "Arcade. Hold the middle of the street for sixty seconds against waves from both sides.",
          art: 1 },
        { id: "duel", label: "1v1 Arena", live: true,
          sub: "Three dimensions, two fighters. Circle him, cut the ring off, and watch the angles.",
          art: 2 },
        { id: "thecall", label: "The Call", live: false,
          sub: "Ten seconds of tape. Continue, stop, or call the doctor. Placeholder name.",
          art: 3 },
      ];

      /* small pixel scenes for the cards, same palette as the lobby */
      function drawModeArt(ctx, W, H, kind) {
        const b = (X, Y, Wd, Ht, c) => {
          ctx.fillStyle = c;
          ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(Wd)), Math.max(1, Math.round(Ht)));
        };
        const R = (i) => rnd(kind * 31.7 + i * 2.13);
        b(0, 0, W, H, "#0a0e15");
        b(0, 0, W, H * .52, "#141c2a");
        /* a hanging bulb and its cone, in every room */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(255,226,168,.26)");
        g.addColorStop(1, "rgba(255,226,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(W * .38, 0); ctx.lineTo(W * .62, 0);
        ctx.lineTo(W * .92, H); ctx.lineTo(W * .08, H); ctx.fill();
        b(W * .49, 0, Math.max(1, W * .02), H * .07, "#2a2a2a");
        b(W * .42, H * .06, W * .16, H * .028, "#ffeab4");
        /* crowd haze */
        for (let i = 0; i < 40; i++)
          b(R(i) * W, H * .14 + R(i + 50) * H * .2, W * .07, H * .022,
            i % 3 ? "#1c2432" : "#262c3c");

        if (kind === 0) {
          /* MISSIONS — a lone fighter in the ring, gloves up */
          b(0, H * .66, W, H, "#0d1119");
          for (let i = 0; i < 3; i++)
            b(0, H * (.40 + i * .09), W, Math.max(1, H * .011),
              i === 0 ? "#8a2820" : i === 1 ? "#b7b19e" : "#2b5c94");
          const cx = W * .5, fy = H * .42;
          b(cx - W * .13, fy + H * .10, W * .26, H * .30, "#2b3a4c");   /* torso */
          b(cx - W * .10, fy + H * .13, W * .20, H * .24, "#384a5e");
          b(cx - W * .08, fy, W * .16, H * .11, SK2);                    /* head */
          b(cx - W * .06, fy + H * .015, W * .12, H * .08, SK);
          b(cx - W * .08, fy - H * .012, W * .16, H * .035, HR);
          b(cx - W * .19, fy + H * .06, W * .11, H * .09, GL2);          /* gloves */
          b(cx - W * .17, fy + H * .072, W * .07, H * .06, GL);
          b(cx + W * .08, fy + H * .055, W * .11, H * .09, GL2);
          b(cx + W * .10, fy + H * .067, W * .07, H * .06, GL);
          b(cx - W * .12, fy + H * .40, W * .09, H * .22, "#22303f");    /* legs */
          b(cx + W * .03, fy + H * .40, W * .09, H * .22, "#22303f");
        } else if (kind === 1) {
          /* WORKOUT — heavy bag taking a hook */
          b(0, H * .70, W, H, "#1d1912");
          b(W * .46, 0, Math.max(1, W * .03), H * .18, "#2a2a2a");
          b(W * .34, H * .17, W * .28, H * .05, "#241a12");
          b(W * .32, H * .21, W * .32, H * .44, "#3b281a");
          b(W * .35, H * .23, W * .22, H * .40, "#523724");
          b(W * .35, H * .23, W * .08, H * .40, "#64452a");
          for (let i = 0; i < 4; i++) b(W * .32, H * (.27 + i * .10), W * .32, H * .012, "#1a110b");
          b(W * .04, H * .40, W * .22, H * .12, GL2);                    /* glove mid-hook */
          b(W * .07, H * .425, W * .15, H * .08, GL);
          b(W * .20, H * .43, W * .09, H * .07, GLH);
          b(-W * .1, H * .44, W * .16, H * .09, WRAP);
          /* skipping rope coiled on the floor */
          ctx.strokeStyle = "#8d7338"; ctx.lineWidth = Math.max(1, H * .008);
          ctx.beginPath(); ctx.ellipse(W * .62, H * .83, W * .2, H * .05, 0, 0, 6.3); ctx.stroke();
        } else if (kind === 2) {
          /* 1V1 — two fighters squaring up, gloves touching */
          b(0, H * .70, W, H, "#0d1119");
          for (let i = 0; i < 2; i++)
            b(0, H * (.44 + i * .11), W, Math.max(1, H * .011), i ? "#2b5c94" : "#8a2820");
          const mk = (x, flip, trunk) => {
            const s = flip ? -1 : 1;
            b(x - W * .09, H * .40, W * .18, H * .24, trunk);
            b(x - W * .06, H * .30, W * .12, H * .10, SK2);
            b(x - W * .04, H * .315, W * .09, H * .07, SK);
            b(x - W * .06, H * .285, W * .12, H * .032, HR);
            b(x + s * W * .07, H * .38, W * .10, H * .08, flip ? "#2c5c94" : GL2);
            b(x - W * .07, H * .62, W * .06, H * .18, "#1c2733");
            b(x + W * .01, H * .62, W * .06, H * .18, "#1c2733");
          };
          mk(W * .27, false, "#8a2820");
          mk(W * .73, true, "#2b4f7e");
          b(W * .46, H * .38, W * .08, H * .07, "#ffeab4");             /* gloves meeting */
        } else {
          /* THE CALL — the corner between rounds: stool, towel, watch */
          b(0, H * .62, W, H, "#141019");
          b(W * .3, H * .44, W * .40, H * .05, "#2a3242");               /* stool seat */
          b(W * .34, H * .49, W * .05, H * .22, "#232a37");
          b(W * .61, H * .49, W * .05, H * .22, "#232a37");
          b(W * .33, H * .35, W * .34, H * .11, "#e8e2d2");              /* towel */
          b(W * .36, H * .37, W * .26, H * .06, "#fff6e6");
          b(W * .40, H * .44, W * .2, H * .09, "#d9d2c0");
          b(W * .12, H * .55, W * .16, H * .16, "#3a4350");              /* bucket */
          b(W * .14, H * .57, W * .12, H * .03, "#59636f");
          /* stopwatch, the whole point of the mode */
          const wx = W * .76, wy = H * .60, r = Math.min(W, H) * .085;
          ctx.fillStyle = "#e8c272";
          ctx.beginPath(); ctx.arc(wx, wy, r, 0, 6.3); ctx.fill();
          ctx.fillStyle = "#15110a";
          ctx.beginPath(); ctx.arc(wx, wy, r * .72, 0, 6.3); ctx.fill();
          ctx.strokeStyle = "#e8c272"; ctx.lineWidth = Math.max(1, r * .16);
          ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + r * .45, wy - r * .35); ctx.stroke();
          b(wx - r * .22, wy - r * 1.35, r * .44, r * .3, "#e8c272");
        }
        /* grade */
        const v = ctx.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .25, W / 2, H * .5, H * .85);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.6)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(8,11,18,.14)";
        const st = Math.max(2, Math.round(H * .016));
        for (let y = 0; y < H; y += st) ctx.fillRect(0, y, W, 1);
      }

      function closeModeSelect() {
        document.querySelectorAll(".modesel").forEach((n) => n.remove());
      }
      function openModeSelect() {
        closeModeSelect();
        const el = document.createElement("div");
        el.className = "modesel";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Choose a mode");
        el.innerHTML = `
          <div class="ms-head">
            <div class="ms-blurb">Pick how you want to coach tonight. One corner, one fighter, and every round you let him take is yours.</div>
            <button class="ms-close" type="button" aria-label="Back to lobby">&times;</button>
          </div>
          <div class="ms-grid">
            ${MODES.map((m) => `
              <button class="ms-card ${m.live ? "live" : "soon"}" data-mode="${m.id}" type="button">
                <canvas aria-hidden="true"></canvas>
                <span class="ms-lock">${m.live ? "Open" : "Soon"}</span>
                <span class="ms-label">${m.label}</span>
                <span class="ms-sub">${escapeUI(m.sub)}</span>
              </button>`).join("")}
          </div>`;
        document.body.appendChild(el);

        /* paint each card once, at its own size */
        el.querySelectorAll(".ms-card").forEach((card, i) => {
          const cv = card.querySelector("canvas");
          const r = cv.getBoundingClientRect();
          const w = Math.max(60, Math.min(220, Math.round((r.width || 160) / 2.6)));
          const h = Math.max(90, Math.round(w * ((r.height || 400) / Math.max(1, r.width || 160))));
          cv.width = w; cv.height = h;
          const c = cv.getContext("2d");
          c.imageSmoothingEnabled = false;
          drawModeArt(c, w, h, MODES[i].art);
        });

        el.querySelector(".ms-close").addEventListener("click", closeModeSelect);
        el.addEventListener("click", (e) => { if (e.target === el) closeModeSelect(); });
        el.querySelectorAll("[data-mode]").forEach((btn) =>
          btn.addEventListener("click", () => {
            const m = MODES.find((x) => x.id === btn.dataset.mode);
            if (m && m.live) {
              closeModeSelect();
              return m.id === "street" ? openStreetFight()
                   : m.id === "duel" ? window.__openRealArena(openArena3D)
                   : openMissionSetup();
            }
            maintenance(btn.dataset.mode);
          }));
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape") { closeModeSelect(); document.removeEventListener("keydown", esc); }
        });
      }

      /* ── STREET FIGHT ────────────────────────────────────────────
         A stylised arcade mode, deliberately nothing like the bout
         simulation: no rounds, no corner, no stoppage. Waves come at
         you from both sides and you hold the middle of the street for
         sixty seconds using the skills you actually unlocked.
         Fictional and cartoonish on purpose. */
      const SF = {
        on: false, raf: 0, last: 0, over: false,
        t: 0, left: 60, kills: 0, combo: 0, best: 0,
        foes: [], spawnT: 0, side: 1, firstBlood: false,
        shake: 0, hitStop: 0, flash: 0, pops: [],
        cam: { x: 0, z: 1, tx: 0, tz: 1 },
        p: null, keys: new Set(),
      };
      const SF_W = 1000;                       /* world half-width */
      const SF_TIERS = [
        { n: "Scrapper",  hp: 40,  dmg: 5,  spd: 62,  col: "#6a7a90", reach: 44 },
        { n: "Bruiser",   hp: 75,  dmg: 9,  spd: 54,  col: "#8a6a4e", reach: 48 },
        { n: "Enforcer",  hp: 120, dmg: 14, spd: 48,  col: "#9a4a5c", reach: 52 },
        { n: "Headliner", hp: 190, dmg: 20, spd: 44,  col: "#6e58a8", reach: 58 },
      ];

      function sfReset() {
        const sk = skillStats();
        SF.on = true; SF.over = false; SF.t = 0; SF.left = 60;
        SF.kills = 0; SF.combo = 0; SF.best = 0;
        SF.foes = []; SF.spawnT = .6; SF.side = 1; SF.firstBlood = false;
        SF.shake = 0; SF.hitStop = 0; SF.flash = 0; SF.pops = [];
        SF.cam = { x: 0, z: 1, tx: 0, tz: 1 };
        SF.keys.clear();
        /* the Gear Up stamina track is what sizes the tank, so that
           upgrade finally pays for something outside the card */
        const staLv = (typeof upLevel === "function" ? upLevel("sta") : 2) - 2;
        SF.p = {
          x: 0, hp: 100, max: 100, face: 1, step: 0,
          sta: 100, maxSta: 100 + staLv * 9, regen: 17 + staLv * 1.1,
          spent: 0, gassed: 0,
          atk: null, guard: false, dashT: 0, hurtT: 0, evadeT: 0,
          sk,
        };
        SF.p.sta = SF.p.maxSta;
      }
      function sfPunches() {
        /* the hotbar is literally what you own, strongest last */
        return SF.p.sk.punches.slice().sort((a, b) => a.dmg - b.dmg).slice(0, 4);
      }
      function sfPop(x, txt, col) { SF.pops.push({ x, y: 0, t: 0, txt, col }); }

      function sfSpawn() {
        const pressure = Math.min(1, SF.t / 45);
        let tier = 0;
        const r = Math.random();
        if (r < pressure * .18) tier = 3;
        else if (r < pressure * .45) tier = 2;
        else if (r < .3 + pressure * .4) tier = 1;
        const T = SF_TIERS[tier];
        const side = SF.side; SF.side *= -1;
        SF.foes.push({
          x: side * (SF_W * .62 + Math.random() * 120),
          hp: T.hp, max: T.hp, tier, T,
          face: -side, state: "walk", wind: 0, cool: .5 + Math.random(),
          hurtT: 0, dead: 0,
        });
      }

      /* heavier punches cost more breath than quick ones */
      const sfCost = (s) => Math.round(8 + s.dmg * .55);
      function sfAttack(idx) {
        const p = SF.p;
        if (SF.over || p.atk || p.hurtT > 0) return;
        const list = sfPunches();
        const s = list[Math.min(idx, list.length - 1)];
        if (!s) return;
        const cost = sfCost(s);
        if (p.sta < cost) {                       /* nothing left to throw it with */
          if (p.gassed <= 0) { p.gassed = .5; sfPop(p.x, "no breath", "#ff9a5a"); }
          return;
        }
        p.sta -= cost;
        p.spent = .45;                            /* pause the recovery a beat */
        p.atk = { s, t: 0, dur: s.wind ? .42 : .20, hit: false, heavy: !!s.wind };
      }
      function sfDash() {
        const p = SF.p;
        if (SF.over || p.dashT > 0 || !p.sk.dash) return;
        if (p.sta < 14) { if (p.gassed <= 0) { p.gassed = .5; sfPop(p.x, "no breath", "#ff9a5a"); } return; }
        p.sta -= 14; p.spent = .35;
        p.dashT = .22;
      }

      function sfStep(dt) {
        const p = SF.p;
        if (SF.hitStop > 0) { SF.hitStop -= dt; return; }
        SF.t += dt;
        SF.left = Math.max(0, SF.left - dt);
        if (SF.left <= 0 && !SF.over) return sfEnd("Time");

        /* ── player ── */
        const mv = (SF.keys.has("a") || SF.keys.has("arrowleft") ? -1 : 0)
                 + (SF.keys.has("d") || SF.keys.has("arrowright") ? 1 : 0);
        p.guard = SF.keys.has("s") || SF.keys.has("arrowdown");
        const spd = 210 * p.sk.move * (p.guard ? .45 : 1);
        if (p.dashT > 0) {
          p.dashT -= dt;
          p.x += p.face * 760 * p.sk.dash * dt;
        } else if (mv && !p.atk && p.hurtT <= 0) {
          p.x += mv * spd * dt;
          p.face = mv > 0 ? 1 : -1;
          p.step += dt * 10;
        } else p.step = 0;
        p.x = Math.max(-SF_W, Math.min(SF_W, p.x));
        if (p.hurtT > 0) p.hurtT -= dt;
        if (p.evadeT > 0) p.evadeT -= dt;
        if (p.gassed > 0) p.gassed -= dt;
        if (p.spent > 0) p.spent -= dt;
        else {
          /* you get it back by backing off: guarding or walking recovers
             slower than standing off and breathing */
          const rate = p.regen * (p.guard ? .55 : mv ? .8 : 1.25);
          p.sta = Math.min(p.maxSta, p.sta + rate * dt);
        }

        if (p.atk) {
          p.atk.t += dt * p.sk.spd;
          const a = p.atk;
          if (!a.hit && a.t >= a.dur * .45) {
            a.hit = true;
            const reach = (a.heavy ? 96 : 76);
            let landed = 0;
            for (const f of SF.foes) {
              if (f.dead) continue;
              const d = (f.x - p.x) * p.face;
              if (d > -18 && d < reach) {
                const chain = Math.min(SF.combo + 1, p.sk.chain);
                const mult = (SF.combo > 0 ? p.sk.combo : 1)
                           * (p.evadeT > 0 ? p.sk.counter : 1)
                           * (1 + chain * .05);
                const dmg = Math.round(a.s.dmg * mult);
                f.hp -= dmg; f.hurtT = .18;
                f.x += p.face * (a.heavy ? 34 : 16);
                landed++;
                sfPop(f.x, dmg, p.evadeT > 0 ? "#b9a0f0" : a.heavy ? "#ffd36a" : "#fff3cf");
                if (Math.random() < (a.s.stun || 0) + p.sk.stun) { f.state = "stun"; f.wind = .7; }
                if (f.hp <= 0) {
                  f.dead = .01; SF.kills++;
                  sfPop(f.x, f.T.n + " down", "#8ad17e");
                }
              }
            }
            if (landed) {
              SF.combo++; SF.best = Math.max(SF.best, SF.combo);
              SF.shake = a.heavy ? 12 : 6;
              SF.hitStop = a.heavy ? .085 : .045;
              SF.flash = .3;
              if (!SF.firstBlood) {               /* the camera closes in on the first one that lands */
                SF.firstBlood = true;
                const tgt = SF.foes.find((f) => !f.dead);
                SF.cam.tz = 1.42;
                SF.cam.tx = tgt ? (p.x + tgt.x) / 2 : p.x;
                setTimeout(() => { SF.cam.tz = 1.12; }, 1100);
              }
            }
          }
          if (p.atk.t >= p.atk.dur) p.atk = null;
        }

        /* ── foes ── */
        SF.spawnT -= dt;
        const want = 2 + Math.floor(SF.t / 14);
        if (SF.spawnT <= 0 && SF.foes.filter((f) => !f.dead).length < want) {
          sfSpawn();
          SF.spawnT = Math.max(.7, 2.1 - SF.t / 32);
        }
        for (const f of SF.foes) {
          if (f.dead) { f.dead += dt; continue; }
          if (f.hurtT > 0) f.hurtT -= dt;
          const d = p.x - f.x;
          f.face = d > 0 ? 1 : -1;
          if (f.state === "stun") {
            f.wind -= dt;
            if (f.wind <= 0) f.state = "walk";
          } else if (Math.abs(d) > f.T.reach) {
            f.x += Math.sign(d) * f.T.spd * dt;
            f.state = "walk";
          } else {
            f.cool -= dt;
            if (f.state === "wind") {
              f.wind -= dt;
              if (f.wind <= 0) {
                f.state = "walk"; f.cool = 1.1 + Math.random() * .7;
                if (Math.abs(p.x - f.x) <= f.T.reach + 10 && p.dashT <= 0) {
                  if (Math.random() < p.sk.evade) {
                    p.evadeT = .55; sfPop(p.x, "slip", "#7fd1ff");
                  } else {
                    const soak = p.guard ? Math.min(.85, p.sk.soak + .35) : p.sk.soak;
                    const dmg = Math.max(1, Math.round(f.T.dmg * (1 - soak)));
                    p.hp -= dmg; p.hurtT = .3; SF.combo = 0;
                    p.x += f.face * 22; SF.shake = 9;
                    sfPop(p.x, "-" + dmg, "#ff6a5a");
                    if (p.hp <= 0) { p.hp = 0; return sfEnd("Down"); }
                  }
                }
              }
            } else if (f.cool <= 0) { f.state = "wind"; f.wind = .42; }
          }
        }
        SF.foes = SF.foes.filter((f) => !f.dead || f.dead < .8);
        if (SF.combo > 0 && !p.atk) {
          SF.comboT = (SF.comboT || 0) + dt;
          if (SF.comboT > 1.6) { SF.combo = 0; SF.comboT = 0; }
        } else SF.comboT = 0;

        /* ── camera ── */
        if (!SF.firstBlood) SF.cam.tx = p.x;
        else {
          const near = SF.foes.filter((f) => !f.dead)
            .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          SF.cam.tx = near && Math.abs(near.x - p.x) < 380 ? (p.x + near.x) / 2 : p.x;
        }
        SF.cam.x += (SF.cam.tx - SF.cam.x) * Math.min(1, dt * 5);
        SF.cam.z += (SF.cam.tz - SF.cam.z) * Math.min(1, dt * 3);
        if (SF.shake > 0) SF.shake = Math.max(0, SF.shake - dt * 46);
        if (SF.flash > 0) SF.flash = Math.max(0, SF.flash - dt * 2.6);
        for (const o of SF.pops) { o.t += dt; o.y += dt * 46; }
        SF.pops = SF.pops.filter((o) => o.t < .9);
      }

      /* ── STREET FIGHT · RENDER ───────────────────────────────── */
      function sfDraw(ctx, W, H) {
        const b = artBlock(ctx);
        const z = SF.cam.z, camx = SF.cam.x;
        const sx = (SF.shake ? (Math.random() - .5) * SF.shake : 0);
        const sy = (SF.shake ? (Math.random() - .5) * SF.shake * .5 : 0);
        const ground = H * .74;
        const toX = (wx) => W / 2 + (wx - camx) * (z * W / 620) + sx;
        const sc = z * W / 620;                        /* world → screen scale */

        /* night sky over a wet street */
        const sky = ctx.createLinearGradient(0, 0, 0, ground);
        sky.addColorStop(0, "#221831"); sky.addColorStop(.5, "#3e2b44"); sky.addColorStop(1, "#6b4348");
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        /* far skyline, slow parallax */
        for (let i = -8; i < 20; i++) {
          const bw = 120, bx = toX(i * bw * 1.3 - camx * .55);
          const bh = ground * (.22 + rnd(i * 3.1) * .34);
          b(bx, ground - bh, bw * sc * 1.1, bh, "#241c36");
          for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) {
            if ((i * 7 + r * 3 + c) % 3) continue;
            b(bx + (6 + c * 13) * sc, ground - bh + (10 + r * 16) * sc, 7 * sc, 9 * sc, "#e8bf72");
          }
        }
        /* shutters and a wall behind the action */
        for (let i = -10; i < 24; i++) {
          const wx = i * 180, px = toX(wx - camx * .18);
          b(px, ground - 230 * sc, 170 * sc, 230 * sc, i % 2 ? "#3a2f47" : "#43374f");
          b(px + 14 * sc, ground - 160 * sc, 142 * sc, 130 * sc, "#271f33");
          for (let k = 0; k < 8; k++) b(px + 14 * sc, ground - 158 * sc + k * 17 * sc, 142 * sc, 7 * sc, "#3c3150");
          if (i % 2 === 0) {
            b(px + 70 * sc, ground - 256 * sc, 8 * sc, 30 * sc, "#2a2a2a");
            b(px + 52 * sc, ground - 266 * sc, 44 * sc, 16 * sc, "#fff0c0");
            const g = ctx.createRadialGradient(px + 74 * sc, ground - 250 * sc, 2, px + 74 * sc, ground - 250 * sc, 230 * sc);
            g.addColorStop(0, "rgba(255,214,130,.30)"); g.addColorStop(1, "rgba(255,214,130,0)");
            ctx.fillStyle = g; ctx.fillRect(px - 120 * sc, ground - 330 * sc, 380 * sc, 340 * sc);
          }
        }
        /* road */
        b(0, ground, W, H - ground, "#2b2434");
        b(0, ground, W, 4, "#463c54");
        for (let i = -14; i < 28; i++) {
          const px = toX(i * 120);
          b(px, ground + (H - ground) * .45, 64 * sc, 4 * sc, "rgba(236,226,196,.26)");
        }

        /* ── fighters ── */
        const drawFoe = (f) => {
          const x = toX(f.x), s = 58 * sc * (f.tier === 3 ? 1.16 : f.tier === 2 ? 1.08 : 1);
          const hurt = f.hurtT > 0;
          if (f.dead) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - f.dead / .8); }
          ctx.fillStyle = "rgba(0,0,0,.42)";
          ctx.beginPath(); ctx.ellipse(x, ground + 3, s * .42, s * .13, 0, 0, 6.3); ctx.fill();
          const bodyC = hurt ? "#fff2f4" : f.T.col;
          const lean = f.state === "wind" ? -f.face * s * .10 : 0;
          b(x - s * .20, ground - s * .46, s * .16, s * .46, "#1d1b26");
          b(x + s * .04, ground - s * .46, s * .16, s * .46, "#1d1b26");
          b(x - s * .28 + lean, ground - s * .96, s * .56, s * .52, bodyC);
          b(x - s * .22 + lean, ground - s * .90, s * .44, s * .38, hurt ? "#fff" : "#00000022");
          b(x - s * .20 + lean, ground - s * 1.28, s * .40, s * .34, hurt ? "#fff" : "#caa184");
          b(x - s * .20 + lean, ground - s * 1.34, s * .40, s * .12, "#15121b");
          /* the fist he is winding up with */
          const ar = f.state === "wind" ? s * .42 : s * .26;
          b(x + f.face * ar + lean, ground - s * .86, s * .18, s * .18, f.state === "wind" ? "#e8453a" : bodyC);
          /* health bar */
          const bw2 = s * .9, bx2 = x - bw2 / 2, by2 = ground - s * 1.62;
          b(bx2 - 1, by2 - 1, bw2 + 2, s * .11 + 2, "#0a0a0f");
          b(bx2, by2, bw2 * Math.max(0, f.hp / f.max), s * .11,
            f.tier === 3 ? "#b17ae0" : f.tier === 2 ? "#e8453a" : f.tier === 1 ? "#e8883a" : "#8ad17e");
          if (f.dead) ctx.restore();
        };
        const p = SF.p, px2 = toX(p.x), ps = 62 * sc;
        SF.foes.filter((f) => f.x < p.x).forEach(drawFoe);
        /* player */
        ctx.fillStyle = "rgba(0,0,0,.45)";
        ctx.beginPath(); ctx.ellipse(px2, ground + 3, ps * .44, ps * .14, 0, 0, 6.3); ctx.fill();
        const bob = Math.sin(p.step) * ps * .04;
        const hurt = p.hurtT > 0;
        const kick = p.atk ? Math.sin(Math.min(1, p.atk.t / p.atk.dur) * Math.PI) : 0;
        b(px2 - ps * .22, ground - ps * .48 + bob, ps * .17, ps * .48, "#243247");
        b(px2 + ps * .05, ground - ps * .48 + bob, ps * .17, ps * .48, "#243247");
        b(px2 - ps * .30, ground - ps * 1.00 + bob, ps * .60, ps * .54, hurt ? "#ffd9d4" : "#9d2b22");
        b(px2 - ps * .24, ground - ps * .94 + bob, ps * .48, ps * .40, hurt ? "#fff" : "#c2402f");
        b(px2 - ps * .21, ground - ps * 1.34 + bob, ps * .42, ps * .36, "#e0a478");
        b(px2 - ps * .21, ground - ps * 1.40 + bob, ps * .42, ps * .12, "#1d1711");
        /* guard up, or the glove out on a punch */
        if (p.guard) {
          b(px2 - ps * .34, ground - ps * 1.30 + bob, ps * .26, ps * .26, "#cc3728");
          b(px2 + ps * .08, ground - ps * 1.30 + bob, ps * .26, ps * .26, "#cc3728");
        } else {
          const reach = p.atk ? (p.atk.heavy ? ps * 1.1 : ps * .86) * kick : ps * .24;
          b(px2 + p.face * reach - (p.face < 0 ? ps * .24 : 0), ground - ps * .96 + bob,
            ps * .26, ps * .24, "#cc3728");
          b(px2 + p.face * reach * .55 - (p.face < 0 ? ps * .16 : 0), ground - ps * .92 + bob,
            ps * .18, ps * .17, "#e0a478");
          if (p.atk && kick > .6) {
            ctx.strokeStyle = "rgba(255,226,168,.75)"; ctx.lineWidth = Math.max(1, 2 * sc);
            ctx.beginPath();
            ctx.arc(px2 + p.face * reach, ground - ps * .86 + bob, ps * .34, -1, 1);
            ctx.stroke();
          }
        }
        if (p.dashT > 0) { ctx.fillStyle = "rgba(226,232,240,.25)";
          for (let i = 1; i < 4; i++) ctx.fillRect(px2 - p.face * i * ps * .3, ground - ps * 1.1, ps * .1, ps * 1.05); }
        if (p.evadeT > 0) { ctx.strokeStyle = "rgba(127,209,255,.6)"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(px2, ground - ps * .8, ps * .7, 0, 6.3); ctx.stroke(); }
        SF.foes.filter((f) => f.x >= p.x).forEach(drawFoe);

        /* damage numbers */
        ctx.textAlign = "center";
        for (const o of SF.pops) {
          ctx.globalAlpha = Math.max(0, 1 - o.t / .9);
          ctx.fillStyle = o.col;
          ctx.font = "700 " + Math.round(15 * sc + 6) + "px ui-monospace, monospace";
          ctx.fillText(o.txt, toX(o.x), ground - 110 * sc - o.y);
        }
        ctx.globalAlpha = 1; ctx.textAlign = "left";
        if (SF.flash > 0) { ctx.fillStyle = "rgba(255,240,205," + (SF.flash * .16).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }
        /* edge arrows for anyone off-screen */
        for (const f of SF.foes) {
          if (f.dead) continue;
          const fx2 = toX(f.x);
          if (fx2 < 8) { b(6, ground - 70, 10, 10, "#e8453a"); }
          else if (fx2 > W - 8) { b(W - 16, ground - 70, 10, 10, "#e8453a"); }
        }
        const v = ctx.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .42, W / 2, H * .55, H);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.32)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }

      /* ── STREET FIGHT · SCREEN ───────────────────────────────── */
      function closeStreetFight() {
        SF.on = false;
        cancelAnimationFrame(SF.raf);
        document.querySelectorAll(".sfight").forEach((n) => n.remove());
      }
      function sfEnd(why) {
        if (SF.over) return;
        SF.over = true; SF.on = false;
        const secs = Math.round(60 - SF.left);
        const gold = Math.round(SF.kills * 55 + secs * 6 + SF.best * 18);
        const xp = Math.round(SF.kills * 22 + secs * 3);
        P.gold += gold; P.xp += xp;
        let levels = 0;
        while (P.xp >= xpNeed(P.lv)) { P.xp -= xpNeed(P.lv); P.lv++; levels++; }
        if (SF.kills >= 12) { P.sp = (P.sp || 0) + 1; }
        saveProfile(); refreshLobbyCard();
        const host = document.querySelector("#sf-over");
        if (!host) return;
        host.hidden = false;
        host.innerHTML = `
          <div class="sf-card">
            <span>${why === "Down" ? "You went down" : "Time"}</span>
            <h3>${SF.kills} dropped</h3>
            <div class="sf-rows">
              <div><u>Survived</u><b>${secs}s</b></div>
              <div><u>Best combo</u><b>${SF.best}</b></div>
              <div><u>Gold</u><b>+${gold.toLocaleString()}</b></div>
              <div><u>Experience</u><b>+${xp.toLocaleString()}</b></div>
              ${SF.kills >= 12 ? `<div><u>Skill point</u><b>+1</b></div>` : ""}
              ${levels ? `<div><u>Level up</u><b>${P.lv}</b></div>` : ""}
            </div>
            <div class="sf-btns">
              <button class="tr-btn" id="sf-again" type="button">Again</button>
              <button class="tr-btn ghost" id="sf-quit" type="button">Leave</button>
            </div>
          </div>`;
        host.querySelector("#sf-again").addEventListener("click", () => { host.hidden = true; sfBegin(); });
        host.querySelector("#sf-quit").addEventListener("click", closeStreetFight);
      }

      function openStreetFight() {
        ensureSkills();
        closeModeSelect(); closeStreetFight();
        const el = document.createElement("div");
        el.className = "sfight";
        el.innerHTML = `
          <canvas id="sf-canvas" aria-label="Street fight arcade mode"></canvas>
          <div class="sf-hud">
            <div class="sf-timer"><u>Time</u><b id="sf-time">60</b></div>
            <div class="sf-mid">
              <div class="sf-cond"><u>Condition</u><div class="sf-bar"><i id="sf-hp"></i></div></div>
              <div class="sf-cond sf-stam"><u>Breath</u><div class="sf-bar"><i id="sf-sta"></i></div></div>
              <div class="sf-combo" id="sf-combo"></div>
            </div>
            <div class="sf-kills"><u>Dropped</u><b id="sf-kills">0</b></div>
            <button class="sf-exit" id="sf-exit" type="button" aria-label="Leave">&times;</button>
          </div>
          <div class="sf-bar2" id="sf-hotbar"></div>
          <div class="sf-keys">A / D move &middot; S guard &middot; 1&ndash;4 punch &middot; Shift dash</div>
          <div class="sf-over" id="sf-over" hidden></div>`;
        document.body.appendChild(el);
        el.querySelector("#sf-exit").addEventListener("click", closeStreetFight);
        const cv = $("#sf-canvas"), ctx = cv.getContext("2d");
        const fit = () => {
          const r = cv.getBoundingClientRect();
          cv.width = Math.max(320, Math.round(r.width));
          cv.height = Math.max(200, Math.round(r.height));
        };
        fit();
        if (window.ResizeObserver) new ResizeObserver(fit).observe(cv);

        const bar = $("#sf-hotbar");
        const paintBar = () => {
          bar.innerHTML = sfPunches().map((s, i) =>
            `<button class="sf-slot" data-p="${i}" data-cost="${sfCost(s)}" type="button"><u>${i + 1}</u><b>${escapeUI(s.name)}</b><s>${Math.round(s.dmg)}</s><em>${sfCost(s)}</em></button>`).join("");
          bar.querySelectorAll("[data-p]").forEach((bn) =>
            bn.addEventListener("click", () => sfAttack(Number(bn.dataset.p))));
        };
        sfBegin = function () {
          sfReset(); paintBar();
          SF.last = 0;
          cancelAnimationFrame(SF.raf);
          SF.raf = requestAnimationFrame(frame);
        };
        function frame(ts) {
          if (!document.querySelector(".sfight")) return;
          const dt = SF.last ? Math.min(.10, (ts - SF.last) / 1000) : 0;
          SF.last = ts;
          if (SF.on) sfStep(dt);
          sfDraw(ctx, cv.width, cv.height);
          const tEl = $("#sf-time"), hEl = $("#sf-hp"), kEl = $("#sf-kills"), cEl = $("#sf-combo");
          if (tEl) tEl.textContent = Math.ceil(SF.left);
          if (hEl) { hEl.style.width = (SF.p.hp / SF.p.max * 100) + "%";
                     hEl.style.background = SF.p.hp < 30 ? "#e8453a" : SF.p.hp < 60 ? "#e8883a" : "#6fcf5e"; }
          if (kEl) kEl.textContent = SF.kills;
          const sEl = $("#sf-sta");
          if (sEl) {
            const q = SF.p.sta / SF.p.maxSta;
            sEl.style.width = (q * 100) + "%";
            sEl.style.background = q < .22 ? "#e8453a" : q < .5 ? "#e8883a" : "#e8c272";
          }
          bar.querySelectorAll("[data-cost]").forEach((bn) =>
            bn.classList.toggle("broke", SF.p.sta < Number(bn.dataset.cost)));
          if (cEl) cEl.textContent = SF.combo > 1 ? SF.combo + " hit" : "";
          SF.raf = requestAnimationFrame(frame);
        }
        sfBegin();
      }
      let sfBegin = () => {};
      /* keys: only while the street fight is actually on screen */
      window.addEventListener("keydown", (e) => {
        if (!document.querySelector(".sfight")) return;
        const t = e.target;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "")) return;
        const k = e.key.toLowerCase();
        if (["a", "d", "s", "arrowleft", "arrowright", "arrowdown"].includes(k)) { SF.keys.add(k); e.preventDefault(); }
        else if (k >= "1" && k <= "4") { sfAttack(Number(k) - 1); e.preventDefault(); }
        else if (k === "shift") { sfDash(); e.preventDefault(); }
        else if (k === "escape") closeStreetFight();
      });
      window.addEventListener("keyup", (e) => SF.keys.delete(e.key.toLowerCase()));

      /* ── MISSION SETUP ───────────────────────────────────────────
         Pick the room and the level of fight. Difficulty is the honest
         trade this game is about: a harder card pays more and hurts
         the fighter faster, so the stoppage decision arrives sooner
         and costs you more to make. Payouts are coins and gems only
         for now. */
      const DIFFS = [
        { id: "novice",    name: "Novice",     grade: "E+ GRADE", col: "#6fcf5e",
          gold: 400,   gems: 1,  xp: 120,  lv: 1,
          blurb: "Four rounds, a light puncher. Room to read the signs before they matter." },
        { id: "club",      name: "Club Show",  grade: "D+ GRADE", col: "#e8c272",
          gold: 1100,  gems: 3,  xp: 300,  lv: 1,
          blurb: "Six rounds on a small-hall card. He can hurt you if you let it run." },
        { id: "contender", name: "Contender",  grade: "B- GRADE", col: "#b17ae0",
          gold: 3200,  gems: 8,  xp: 700,  lv: 4,
          blurb: "Eight rounds against someone ranked. Damage accumulates faster than you expect." },
        { id: "title",     name: "Title Fight", grade: "A- GRADE", col: "#e8453a",
          gold: 9000,  gems: 25, xp: 1800, lv: 8,
          blurb: "Twelve rounds, a champion, and every reason in the world not to stop it." },
      ];
      let selGym = 0, selDiff = 1, activeGymMult = 1;
      /* set when a bout starts; scales the payout the simulation hands back */
      let activeDiff = DIFFS[1];

      function gateToast(msg) {
        document.querySelectorAll(".gate-toast").forEach((n) => n.remove());
        const t = document.createElement("div");
        t.className = "gate-toast";
        t.setAttribute("role", "alert");
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1900);
      }
      function closeMissionSetup() {
        document.querySelectorAll(".msetup").forEach((n) => n.remove());
      }
      function openMissionSetup() {
        closeModeSelect();
        closeMissionSetup();
        if (!P) loadProfile();
        const el = document.createElement("div");
        el.className = "msetup";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Mission setup");
        el.innerHTML = `
          <div class="mz-wrap">
            <div class="mz-panel">
              <div class="mz-gym" id="mz-gym"></div>
              <div class="mz-risk" id="mz-risk"></div>
              <div class="mz-rule"></div>
              <div class="mz-h">Difficulty</div>
              <div class="mz-diffrow">
                <button class="mz-arrow" id="mz-prev" type="button" aria-label="Easier">&lt;</button>
                <div class="mz-diff" id="mz-diff"></div>
                <button class="mz-arrow" id="mz-next" type="button" aria-label="Harder">&gt;</button>
              </div>
              <div class="mz-h">Rewards</div>
              <div class="mz-rewards" id="mz-rewards"></div>
              <div class="mz-note" id="mz-note"></div>
              <div class="mz-btns">
                <button class="mz-btn" id="mz-back" type="button">Back</button>
                <button class="mz-btn go" id="mz-create" type="button">Create</button>
              </div>
            </div>
            <div class="mz-maps">
              <h3>Gyms</h3>
              <div class="mz-list" id="mz-list"></div>
            </div>
          </div>`;
        document.body.appendChild(el);

        /* map list, each with its own little room drawn in */
        const list = $("#mz-list");
        GYMS.forEach((g, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "mz-map" + (i === selGym ? " sel" : "");
          const bd = g.mult >= 1.3 ? "hot" : g.mult < 1 ? "low" : "";
          btn.innerHTML = `<b>${escapeUI(g.n)}</b><span class="tag ${bd}">&times;${g.mult.toFixed(2)}</span><canvas width="132" height="62" aria-hidden="true"></canvas>`;
          const c = btn.querySelector("canvas").getContext("2d");
          c.imageSmoothingEnabled = false;
          drawGym(c, 132, 62, g.k, i * 7 + 3);
          btn.addEventListener("click", () => {
            selGym = i;
            selDiff = 0;                       /* a new room starts back at E+ */
            list.querySelectorAll(".mz-map").forEach((n, j) => n.classList.toggle("sel", j === i));
            paint();
          });
          list.appendChild(btn);
        });

        const COIN = `<i>${COIN_SVG.replace('class="lb-coin"', 'style="width:22px;height:22px"')}</i>`;
        const GEM = `<i>${GEM_SVG.replace('class="lb-gem"', 'style="width:22px;height:22px"')}</i>`;
        function paint() {
          const d = DIFFS[selDiff], locked = P.lv < d.lv;
          const g = GYMS[selGym], gm = g.mult;
          const band = gm >= 1.3 ? "hot" : gm < 1 ? "low" : "";
          $("#mz-gym").innerHTML =
            `${escapeUI(g.n)}<span class="mz-mult ${band}">&times;${gm.toFixed(2)}</span>`;
          $("#mz-diff").innerHTML =
            `<span style="color:${d.col}">${d.name.toUpperCase()} (${d.grade})</span><small>${escapeUI(d.blurb)}</small>`;
          const PM = PMULT(), mult = PM.gold * gm;
          $("#mz-rewards").innerHTML =
            `<div class="mz-rw">${COIN}<b>${Math.round(d.gold * mult).toLocaleString()}</b><s>Coins</s></div>
             <div class="mz-rw gem">${GEM}<b>${Math.max(1, Math.round(d.gems * gm))}</b><s>Gem${Math.max(1, Math.round(d.gems * gm)) === 1 ? "" : "s"}</s></div>
             <div class="mz-rw exp"><i class="exp"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:20px;height:20px"><path d="M12 1.5 14.6 9 22 11.6 14.6 14.2 12 22 9.4 14.2 2 11.6 9.4 9z" fill="#8f6fd0" stroke="#d5c2f6" stroke-width="1.1" stroke-linejoin="round"/></svg></i><b>${Math.round(d.xp * gm * PM.exp).toLocaleString()}</b><s>Exp</s></div>`;
          const riskEl = $("#mz-risk");
          if (riskEl) riskEl.textContent = g.risk;
          $("#mz-note").textContent = locked
            ? `Locked until level ${d.lv}. You are level ${P.lv}.`
            : "Paid out when the bout ends — a stoppage to protect the fighter pays the full amount.";
          $("#mz-create").textContent = locked ? "Locked" : "Create";
          $("#mz-create").style.opacity = locked ? ".55" : "";
        }
        $("#mz-prev").addEventListener("click", () => { selDiff = (selDiff + DIFFS.length - 1) % DIFFS.length; paint(); });
        $("#mz-next").addEventListener("click", () => { selDiff = (selDiff + 1) % DIFFS.length; paint(); });
        $("#mz-back").addEventListener("click", () => { closeMissionSetup(); openModeSelect(); });
        $("#mz-create").addEventListener("click", () => {
          const d = DIFFS[selDiff];
          if (P.lv < d.lv) return gateToast(`You are not Level ${d.lv}+!`);
          activeDiff = d;
          activeGymMult = GYMS[selGym].mult;
          closeMissionSetup();
          enterMatch(GYMS[selGym]);
        });
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape") { closeMissionSetup(); document.removeEventListener("keydown", esc); }
        });
        paint();
      }

      /* ── SETTINGS ────────────────────────────────────────────────
         Five tabs. Name on the left, its control beside it, and the
         description of whatever you last touched on the right.
         `live:false` rows are honest: the switch remembers your choice
         but nothing reads it yet, and the panel says so. */
      const ST_ICONS = {
        display: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="5" width="19" height="14" rx="1.5"/><circle cx="8" cy="10" r="1.6" fill="currentColor" stroke="none"/><path d="M3.5 17l5-4.5 3.5 3 3-2.5 5 4"/></svg>`,
        gameplay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3.2 22 8l-10 4.8L2 8z" fill="currentColor" fill-opacity=".3"/><path d="M2 12.4 12 17.2 22 12.4"/><path d="M2 16.6 12 21.4 22 16.6"/></svg>`,
        audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 9.5h3.5L12.5 5v14L7.5 14.5H4z" fill="currentColor" fill-opacity=".35"/><path d="M16 9a4.5 4.5 0 0 1 0 6"/><path d="M18.8 6.4a8.5 8.5 0 0 1 0 11.2"/></svg>`,
        controls: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4.5" width="9" height="7" rx="1" fill="currentColor" fill-opacity=".35"/><rect x="13.5" y="4.5" width="8" height="15" rx="1"/><rect x="2.5" y="13.5" width="9" height="6" rx="1" fill="currentColor" fill-opacity=".35"/></svg>`,
        trading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 20V4.6M7.5 4.6 3.6 8.6M7.5 4.6l3.9 4"/><path d="M16.5 4v15.4M16.5 19.4l3.9-4M16.5 19.4l-3.9-4"/></svg>`,
      };
      const SETTINGS = [
        { id: "display", label: "Display", rows: [
          { id: "blur", name: "Blur", type: "toggle", def: true, live: true,
            desc: "Blurs the ring for a moment when your fighter takes a shot to the head." },
          { id: "dmgnum", name: "Damage Indicator", type: "toggle", def: true, live: false,
            desc: "Shows the damage numbers that appear when a punch lands directly." },
          { id: "lowdetail", name: "Low Detail", type: "toggle", def: false, live: true,
            desc: "Removes certain effects to reduce strain on less powerful devices." },
          { id: "playerfx", name: "Player Effects", type: "toggle", def: true, live: false,
            desc: "Enables or disables the visual effects of other players' skills." },
          { id: "shadows", name: "Shadows", type: "toggle", def: true, live: false,
            desc: "Enables or disables shadows. Turning them off improves performance." },
          { id: "motion", name: "Reduced Motion", type: "toggle", def: false, live: true,
            desc: "Stops the lobby animation and the screen shake. Useful if motion makes you unwell." },
          { id: "textsize", name: "Text Size", type: "choice", def: "normal", live: true,
            choices: [["small", "S"], ["normal", "M"], ["large", "L"]],
            desc: "Sets the size of the text across the whole game." },
        ]},
        { id: "gameplay", label: "Gameplay", rows: [
          { id: "autoskip", name: "Auto Skip", type: "toggle", def: false, live: false,
            desc: "Skips dialogue and story beats instead of showing them." },
          { id: "camerashake", name: "Camera Shake", type: "toggle", def: true, live: true,
            desc: "Shakes the screen when a punch lands — on your fighter or on his opponent." },
          { id: "invites", name: "Invites", type: "toggle", def: true, live: false,
            desc: "Enables or disables receiving party invites from other players." },
        ]},
        { id: "audio", label: "Audio", rows: [
          { id: "fxvol", name: "Effects", type: "range", def: 70, live: true,
            desc: "Changes the volume of ambient sounds such as footsteps, punches and the crowd." },
          { id: "musicvol", name: "Music", type: "range", def: 60, live: false,
            desc: "Changes the volume of the music within the game." },
        ]},
        { id: "controls", label: "Controls", rows: [
          { type: "header", name: "Movement" },
          { id: "k_fwd",   name: "Forward",   type: "key", def: "W", live: false, desc: "Step your fighter toward the opponent." },
          { id: "k_back",  name: "Backward",  type: "key", def: "S", live: false, desc: "Step your fighter away and out of range." },
          { id: "k_left",  name: "Left",      type: "key", def: "A", live: false, desc: "Circle to the left." },
          { id: "k_right", name: "Right",     type: "key", def: "D", live: false, desc: "Circle to the right." },
          { id: "k_stepin",name: "Step In",   type: "key", def: "Shift", live: false, desc: "Close the distance quickly to get inside his reach." },
          { id: "k_pivot", name: "Pivot",     type: "key", def: "Alt", live: false, desc: "Turn off the lead foot to change the angle." },

          { type: "header", name: "Offence" },
          { id: "k_jab",   name: "Jab",       type: "key", def: "J", live: false, desc: "The range finder. Cheap, fast, and how most rounds are won." },
          { id: "k_cross", name: "Cross",     type: "key", def: "K", live: false, desc: "The straight power hand behind the jab." },
          { id: "k_lhook", name: "Left Hook", type: "key", def: "Q", live: false, desc: "A short arcing shot to the side of the head or body." },
          { id: "k_rhook", name: "Right Hook",type: "key", def: "E", live: false, desc: "The same shot from the back hand, slower and heavier." },
          { id: "k_upper", name: "Uppercut",  type: "key", def: "R", live: false, desc: "Comes up the middle. The shot that snaps a head back." },
          { id: "k_body",  name: "Body Shot", type: "key", def: "Control", live: false, desc: "Hold to aim your next punch at the body instead of the head." },

          { type: "header", name: "Defence" },
          { id: "k_block", name: "Block",     type: "key", def: "F", live: false, desc: "Raise the guard. Takes the force on the gloves and arms." },
          { id: "k_slipl", name: "Slip Left", type: "key", def: "Z", live: false, desc: "Move your head off the centre line to the left." },
          { id: "k_slipr", name: "Slip Right",type: "key", def: "C", live: false, desc: "Move your head off the centre line to the right." },
          { id: "k_roll",  name: "Roll",      type: "key", def: "X", live: false, desc: "Duck under a hook and come up on the other side." },
          { id: "k_clinch",name: "Clinch",    type: "key", def: "G", live: false, desc: "Tie him up to buy a few seconds of recovery." },

          { type: "header", name: "The Corner" },
          { id: "c_stop",    name: "Stop The Bout", type: "key", def: "T", live: true,
            desc: "Throw the towel. Between rounds this pulls your fighter out, and it is never recorded as an ordinary loss." },
          { id: "c_medstop", name: "Medical Stop",  type: "key", def: "M", live: true,
            desc: "Call for the doctor and end the bout on medical grounds." },
          { id: "c_next",    name: "Send Him Out",  type: "key", def: "", live: true,
            desc: "Starts the next round. Unbound on purpose: sending your fighter back out should be a decision you make, not a key you hold down. Bind it if you would rather have it." },

          { type: "header", name: "Interface" },
          { id: "u_guide",    name: "Coach Guide", type: "key", def: "H", live: true, desc: "Open the coach briefing." },
          { id: "u_settings", name: "Settings",    type: "key", def: "O", live: true, desc: "Open this settings screen." },
          { id: "u_board",    name: "Scoreboard",  type: "key", def: "Tab", live: false, desc: "Hold to show the round-by-round scorecard." },
        ]},
        { id: "trading", label: "Trading", rows: [
          { id: "tradehist", name: "History", type: "toggle", def: false, live: false,
            desc: "Enables or disables other players being able to see your recent trades." },
        ]},
      ];
      const ST_KEY = "iti.settings.v1";
      let ST = null, stTab = "display", stSel = null;
      function stDefaults() {
        const o = {};
        SETTINGS.forEach((g) => g.rows.forEach((r) => { if (r.id) o[r.id] = r.def; }));
        return o;
      }
      function loadSettings() {
        const base = stDefaults();
        try {
          const raw = localStorage.getItem(ST_KEY);
          ST = raw ? Object.assign(base, JSON.parse(raw)) : base;
        } catch (e) { ST = base; }
        return ST;
      }
      function saveSettings() {
        try { localStorage.setItem(ST_KEY, JSON.stringify(ST)); } catch (e) {}
        applySettings();
      }
      /* the settings that actually drive something */
      function applySettings() {
        if (!ST) return;
        document.body.dataset.lowDetail = ST.lowdetail ? "1" : "0";
        document.body.dataset.reduceMotion = ST.motion ? "1" : "0";
        document.body.classList.toggle("reduce-motion", !!ST.motion);
        /* keep the simulation's own preference object in step */
        if (typeof uiPrefs === "object" && uiPrefs) {
          uiPrefs.shake = !!ST.camerashake && !ST.motion;
          uiPrefs.motion = !!ST.motion;
          uiPrefs.sound = Number(ST.fxvol) > 0;
          uiPrefs.text = ST.textsize || "normal";
          document.body.classList.toggle("has-shake", uiPrefs.shake);
          document.body.classList.toggle("no-shake", !uiPrefs.shake);
          document.documentElement.dataset.textSize = uiPrefs.text;
          try { localStorage.setItem(PREF_KEY, JSON.stringify(uiPrefs)); } catch (e) {}
          const a = $("#pref-motion"), b = $("#pref-shake"), c = $("#pref-sound"), d = $("#pref-text");
          if (a) a.checked = uiPrefs.motion;
          if (b) b.checked = uiPrefs.shake;
          if (c) c.checked = uiPrefs.sound;
          if (d) d.value = uiPrefs.text;
          if (uiPrefs.sound) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) { uiAudio = uiAudio || new AC(); if (uiAudio.state !== "running") uiAudio.resume(); }
          }
        }
      }
      /* ── HOTKEYS ─────────────────────────────────────────────────
         The bindings that do something drive the real buttons rather
         than the fight logic, so the simulation stays the one place
         a bout can be stopped. */
      const CTRL_ACTIONS = {
        c_stop:     () => clickLive("button[onclick*=\"fin('towel')\"]"),
        c_medstop:  () => clickLive("button[onclick*=\"fin('medstop')\"]"),
        c_next:     () => clickLive('button[onclick^="F.r++"]'),
        u_guide:    () => { instructions(); return true; },
        u_settings: () => { openSettings(); return true; },
      };
      function clickLive(sel) {
        const b = document.querySelector(sel);
        if (!b || b.disabled || b.offsetParent === null) return false;
        b.click();
        return true;
      }
      function hotkeysBlocked() {
        if (document.querySelector(".st-key.binding")) return true;
        if (document.querySelector("#boot,#gymload,.settings,.msetup,.modesel,.market,.gearup,.sfight,.arena3,.arena-x")) return true;
        return !!document.querySelector("dialog[open]");
      }
      window.addEventListener("keydown", (e) => {
        if (!ST || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        const t = e.target;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "")) return;
        if (t && t.isContentEditable) return;
        if (hotkeysBlocked()) return;
        const k = e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key;
        for (const id in CTRL_ACTIONS) {
          if (ST[id] && ST[id] === k) {
            if (CTRL_ACTIONS[id]()) e.preventDefault();
            return;
          }
        }
      });

      function closeSettings() {
        document.querySelectorAll(".settings").forEach((n) => n.remove());
      }
      function openSettings(tab) {
        if (!ST) loadSettings();
        closeSettings();
        stTab = tab || stTab || "display";
        const el = document.createElement("div");
        el.className = "settings";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Settings");
        el.innerHTML = `
          <div class="st-head">
            <div class="st-title" id="st-title"></div>
            <div class="st-tabs" role="tablist">
              ${SETTINGS.map((g) => `<button class="st-tab" data-tab="${g.id}" role="tab" title="${g.label}" aria-label="${g.label}">${ST_ICONS[g.id]}</button>`).join("")}
            </div>
            <button class="st-close" type="button" aria-label="Close settings">&times;</button>
          </div>
          <div class="st-rule"></div>
          <div class="st-body">
            <div class="st-rows" id="st-rows"></div>
            <div class="st-right">
              <div class="st-panel" id="st-panel"></div>
              <button class="st-reset" id="st-reset" type="button" hidden>Reset</button>
            </div>
          </div>`;
        document.body.appendChild(el);

        const panel = $("#st-panel"), rowsHost = $("#st-rows");
        function describe(r) {
          stSel = r.id;
          panel.innerHTML = `<h3>${escapeUI(r.name)}</h3><p>${escapeUI(r.desc)}</p>` +
            (r.live ? "" : `<span class="st-soon">Not wired up yet</span>`);
          rowsHost.querySelectorAll(".st-row").forEach((n) =>
            n.classList.toggle("sel", n.dataset.row === r.id));
        }
        function renderTab() {
          const grp = SETTINGS.find((g) => g.id === stTab) || SETTINGS[0];
          $("#st-title").textContent = grp.label;
          el.querySelectorAll(".st-tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === grp.id));
          rowsHost.innerHTML = "";
          grp.rows.forEach((r) => {
            if (r.type === "header") {
              const h = document.createElement("div");
              h.className = "st-group";
              h.textContent = r.name;
              rowsHost.appendChild(h);
              return;
            }
            const row = document.createElement("div");
            row.className = "st-row";
            row.dataset.row = r.id;
            let ctrl = "";
            if (r.type === "toggle") {
              ctrl = `<button class="st-sw ${ST[r.id] ? "on" : ""}" data-v="1" type="button">On</button>
                      <button class="st-sw ${ST[r.id] ? "" : "on"}" data-v="0" type="button">Off</button>`;
            } else if (r.type === "range") {
              ctrl = `<input class="st-range" type="range" min="0" max="100" step="5" value="${Number(ST[r.id])}" aria-label="${r.name}">`;
            } else if (r.type === "key") {
              ctrl = `<button class="st-key" type="button">${escapeUI(String(ST[r.id] || "\u2014"))}</button>`;
            } else if (r.type === "choice") {
              ctrl = r.choices.map(([v, lbl]) =>
                `<button class="st-sw ${ST[r.id] === v ? "on" : ""}" data-c="${v}" type="button">${lbl}</button>`).join("");
            }
            const nameLabel = r.type === "range" ? `${r.name} (${Number(ST[r.id])}%)` : r.name;
            row.innerHTML = `<button class="st-name" type="button">${escapeUI(nameLabel)}</button><div class="st-ctrl">${ctrl}</div>`;
            row.querySelector(".st-name").addEventListener("click", () => describe(r));

            if (r.type === "toggle") {
              row.querySelectorAll(".st-sw").forEach((b) =>
                b.addEventListener("click", () => {
                  ST[r.id] = b.dataset.v === "1";
                  saveSettings(); renderTab(); describe(r);
                }));
            } else if (r.type === "choice") {
              row.querySelectorAll(".st-sw").forEach((b) =>
                b.addEventListener("click", () => {
                  ST[r.id] = b.dataset.c;
                  saveSettings(); renderTab(); describe(r);
                }));
            } else if (r.type === "range") {
              const inp = row.querySelector(".st-range");
              inp.addEventListener("input", () => {
                ST[r.id] = Number(inp.value);
                row.querySelector(".st-name").textContent = `${r.name} (${ST[r.id]}%)`;
                saveSettings();
              });
              inp.addEventListener("pointerdown", () => describe(r));
            } else if (r.type === "key") {
              const kb = row.querySelector(".st-key");
              kb.addEventListener("click", () => {
                describe(r);
                kb.classList.add("binding");
                kb.textContent = "Press…";
                const grab = (ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  const k = ev.key === " " ? "Space" : ev.key.length === 1 ? ev.key.toUpperCase() : ev.key;
                  let stole = null;
                  if (k === "Escape") {
                    /* escape clears the binding instead of setting it */
                    ST[r.id] = "";
                  } else {
                    /* one key, one action: whoever held it loses it */
                    grp.rows.forEach((o) => {
                      if (o.id && o.id !== r.id && o.type === "key" && ST[o.id] === k) {
                        ST[o.id] = ""; stole = o.name;
                      }
                    });
                    ST[r.id] = k;
                  }
                  saveSettings();
                  window.removeEventListener("keydown", grab, true);
                  renderTab(); describe(r);
                  if (stole) {
                    panel.insertAdjacentHTML("beforeend",
                      `<p style="margin-top:12px;color:#e8c272;font-size:.9em">${escapeUI(k)} was on ${escapeUI(stole)}, so that is unbound now.</p>`);
                  }
                };
                window.addEventListener("keydown", grab, true);
              });
            }
            rowsHost.appendChild(row);
          });
          const reset = $("#st-reset");
          if (reset) reset.hidden = grp.id !== "controls";
          const keep = grp.rows.find((r) => r.id === stSel && r.type !== "header")
            || grp.rows.find((r) => r.type !== "header");
          if (keep) describe(keep);
        }
        el.querySelectorAll(".st-tab").forEach((t) =>
          t.addEventListener("click", () => { stTab = t.dataset.tab; stSel = null; renderTab(); }));
        el.querySelector(".st-close").addEventListener("click", closeSettings);
        $("#st-reset").addEventListener("click", () => {
          SETTINGS.find((g) => g.id === "controls").rows
            .forEach((r) => { if (r.id) ST[r.id] = r.def; });
          saveSettings(); renderTab();
        });
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape" && !document.querySelector(".st-key.binding")) {
            closeSettings(); document.removeEventListener("keydown", esc);
          }
        });
        renderTab();
      }

      /* ── THE GYM FLOOR ───────────────────────────────────────────
         A room you walk around with WASD. Stand on a bar, press E, pick
         your load, then rep until you stop or until it drops you.
         Everything in here builds strength, and every level is worth
         +0.1x on your card. */
      const GYM_STATS = {
        strength: { name: "Strength", col: "#e8453a", key: "str" },
      };
      /* Each level costs 1.55x the one before, so the first comes in a
         couple of dozen reps and the tenth is a project. A flat hundred
         a level made the whole ladder disappear in one sitting. */
      const gymNeed = (lv) => Math.round(150 * Math.pow(1.55, lv));
      /* ── MACHINE UNLOCKS ───────────────────────────────────────
         Owned machines live on the saved profile, so the gym you build
         up persists between sessions. */
      const mcOwned = (m) => !m || !m.req || !!(P && P.gym && P.gym[m.id]);
      function mcMissing(m) {
        if (!m || !m.req || !P) return [];
        const out = [];
        if ((P.lv || 1) < m.req.lv) out.push("level " + m.req.lv);
        if ((P.gold || 0) < m.req.gold) out.push(m.req.gold.toLocaleString() + " gold");
        if ((P.gems || 0) < (m.req.gems || 0)) out.push(m.req.gems + " gems");
        return out;
      }
      function mcUnlock(m) {
        if (!m || mcOwned(m)) return;
        const miss = mcMissing(m);
        if (miss.length) return gateToast("Still needed: " + miss.join(", ") + ".");
        P.gold -= m.req.gold;
        P.gems -= m.req.gems || 0;
        P.gym = P.gym || {};
        P.gym[m.id] = 1;
        saveProfile();
        document.querySelectorAll(".mcwrap").forEach((n) => n.remove());
        toast("Unlocked: " + m.name);
        if (typeof refreshGymHud === "function") refreshGymHud();
      }
      function mcAsk(m) {
        if (!m || !m.req) return;
        const miss = mcMissing(m), can = miss.length === 0;
        const r = m.req;
        const pill = (ok, txt) =>
          '<span class="' + (ok ? "ok" : "no") + '">' + txt + "</span>";
        const wrap = document.createElement("div");
        wrap.className = "maint-wrap mcwrap";
        wrap.innerHTML =
          '<div class="maint" role="dialog" aria-modal="true">' +
          "<h3>" + escapeUI(m.name) + "</h3>" +
          '<p class="mu" style="font-size:11px">This machine is not open yet.</p>' +
          '<div class="gym-cost">' +
          pill((P.lv || 1) >= r.lv, "Level " + r.lv) +
          (r.gold ? pill((P.gold || 0) >= r.gold, r.gold.toLocaleString() + " gold") : "") +
          (r.gems ? pill((P.gems || 0) >= r.gems, r.gems + " gems") : "") +
          "</div>" +
          "<p>" + (can ? "You can open it now." : "Still needed: " + escapeUI(miss.join(", ")) + ".") + "</p>" +
          '<button type="button" id="mc-do"' + (can ? "" : " disabled") + ">" + (can ? "Unlock" : "Not yet") + "</button>" +
          '<button type="button" id="mc-no" style="margin-top:7px;border-color:#3d5e76">Back</button>' +
          "</div>";
        const close = () => wrap.remove();
        wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
        document.body.appendChild(wrap);
        wrap.querySelector("#mc-no").addEventListener("click", close);
        if (can) wrap.querySelector("#mc-do").addEventListener("click", () => mcUnlock(m));
      }
      const gymPoints = (k) => (P && P.gymStat && P.gymStat[k]) || 0;
      function gymSplit(k) {
        let left = gymPoints(k), lv = 0;
        while (lv < 99 && left >= gymNeed(lv)) { left -= gymNeed(lv); lv++; }
        return { lv, into: left, need: gymNeed(lv) };
      }
      const gymLevel = (k) => gymSplit(k).lv;
      const gymInto = (k) => gymSplit(k).into;
      const gymNext = (k) => gymSplit(k).need;
      const gymPct = (k) => { const s = gymSplit(k); return Math.min(100, (s.into / s.need) * 100); };
      const gymBonus = (k) => gymLevel(k) * 0.1;

      /* The room is wider than the screen; the camera follows the player.
         World x runs 0 .. GYM_W, where 1.0 is one screen-width.
         ex: which trainer animation to reuse for the rep mini-game. */
      /* What each machine actually works, biggest share first. Shown on
         the walk-up card so the room teaches a bit of anatomy while you
         wander round it. */
      const MUSCLES = {
        dumbbell:  [["biceps", 50], ["shoulders", 30], ["forearms", 20]],
        heavybag:  [["shoulders", 40], ["core", 35], ["back", 25]],
        speedbag:  [["shoulders", 60], ["forearms", 25], ["core", 15]],
        bench:     [["chest", 70], ["triceps", 20], ["shoulders", 10]],
        doubleend: [["shoulders", 45], ["core", 30], ["neck", 25]],
        rope:      [["calves", 45], ["legs", 30], ["heart", 25]],
        squat:     [["legs", 65], ["glutes", 20], ["core", 15]],
        press:     [["shoulders", 65], ["triceps", 25], ["core", 10]],
        treadmill: [["heart", 60], ["legs", 30], ["calves", 10]],
        ring:      [["core", 30], ["shoulders", 25], ["legs", 25], ["neck", 20]],
      };
      const MUSCLE_NAME = {
        chest: "Chest", shoulders: "Shoulders", triceps: "Triceps", biceps: "Biceps",
        forearms: "Forearms", core: "Core", back: "Back", legs: "Legs",
        calves: "Calves", glutes: "Glutes", neck: "Neck", heart: "Cardio",
      };
      /* one little body, with the worked part lit up */
      function muscleIcon(key, big) {
        const on = "#ffcf59", off = "#44596e";
        const c = (k) => (key === k ? on : off);
        const sz = big ? 42 : 28;
        return (
          '<svg viewBox="0 0 24 30" width="' + sz + '" height="' + Math.round(sz * 1.25) + '" aria-hidden="true">' +
          '<circle cx="12" cy="4" r="3" fill="' + c("neck") + '"/>' +
          '<rect x="10.5" y="7" width="3" height="2" fill="' + c("neck") + '"/>' +
          '<rect x="3.5" y="9" width="5" height="4" rx="1" fill="' + c("shoulders") + '"/>' +
          '<rect x="15.5" y="9" width="5" height="4" rx="1" fill="' + c("shoulders") + '"/>' +
          '<rect x="8" y="9.5" width="8" height="5" fill="' + (key === "back" ? on : c("chest")) + '"/>' +
          '<rect x="8.5" y="14.5" width="7" height="5" fill="' + c("core") + '"/>' +
          '<rect x="2.6" y="13" width="3" height="4.5" fill="' + c("biceps") + '"/>' +
          '<rect x="18.4" y="13" width="3" height="4.5" fill="' + c("triceps") + '"/>' +
          '<rect x="2.6" y="17.5" width="3" height="4" fill="' + c("forearms") + '"/>' +
          '<rect x="18.4" y="17.5" width="3" height="4" fill="' + c("forearms") + '"/>' +
          '<rect x="8.3" y="19.5" width="3.1" height="3" fill="' + c("glutes") + '"/>' +
          '<rect x="12.6" y="19.5" width="3.1" height="3" fill="' + c("glutes") + '"/>' +
          '<rect x="8.3" y="22.5" width="3.1" height="4" fill="' + c("legs") + '"/>' +
          '<rect x="12.6" y="22.5" width="3.1" height="4" fill="' + c("legs") + '"/>' +
          '<rect x="8.3" y="26.5" width="3.1" height="3" fill="' + c("calves") + '"/>' +
          '<rect x="12.6" y="26.5" width="3.1" height="3" fill="' + c("calves") + '"/>' +
          (key === "heart" ? '<path d="M12 11.2c-1.6-1.9-4.2-.5-3.2 1.7.6 1.3 2.2 2.3 3.2 3 1-.7 2.6-1.7 3.2-3 1-2.2-1.6-3.6-3.2-1.7Z" fill="' + on + '"/>' : "") +
          "</svg>"
        );
      }
      function muscleCard(m) {
        const list = MUSCLES[m.id];
        if (!list || !list.length) return "";
        const top = list[0];
        const rest = list.slice(1, 3);
        const cell = (e, big) =>
          '<div class="gp-m' + (big ? " big" : "") + '">' + muscleIcon(e[0], big) +
          "<b>" + MUSCLE_NAME[e[0]] + "</b><i>" + e[1] + "%</i></div>";
        return (
          '<div class="gp-mus">' +
          (rest[0] ? cell(rest[0], false) : '<div class="gp-m"></div>') +
          cell(top, true) +
          (rest[1] ? cell(rest[1], false) : '<div class="gp-m"></div>') +
          "</div>"
        );
      }
      const GYM_W = 3.0;
      const GYM_MACHINES = [
        { id: "dumbbell", name: "Dumbbell Rack", stat: "strength", kind: "rack",
          x: .16, y: .72, w: .14, h: .14, unit: "kg", ex: "rack",
          req: { lv: 3, gold: 250, gems: 0 }, diffs: [20, 35, 50, 70] },
        { id: "heavybag", name: "Heavy Bag", stat: "strength", kind: "heavybag",
          x: .46, y: .66, w: .13, h: .26, unit: "rounds", ex: "rack",
          req: null, diffs: [2, 4, 6, 9] },
        { id: "speedbag", name: "Speed Bag", stat: "strength", kind: "speedbag",
          x: .78, y: .62, w: .12, h: .22, unit: "rounds", ex: "rack",
          req: { lv: 2, gold: 150, gems: 0 }, diffs: [2, 3, 5, 7] },
        { id: "trade", name: "Trade Central", stat: null, kind: "trade",
          x: 1.12, y: .53, w: .20, h: .24 },
        { id: "bench", name: "Bench Press", stat: "strength", kind: "bench",
          x: 1.42, y: .74, w: .18, h: .16, unit: "kg", ex: "bench",
          req: { lv: 4, gold: 400, gems: 1 }, diffs: [40, 70, 100, 140] },
        { id: "doubleend", name: "Double-End Bag", stat: "strength", kind: "doubleend",
          x: 1.72, y: .64, w: .12, h: .24, unit: "rounds", ex: "rack",
          req: { lv: 5, gold: 550, gems: 1 }, diffs: [2, 4, 6, 8] },
        { id: "rope", name: "Skipping Corner", stat: "strength", kind: "rope",
          x: 1.98, y: .76, w: .13, h: .16, unit: "rounds", ex: "rack",
          req: { lv: 3, gold: 200, gems: 0 }, diffs: [3, 5, 8, 12] },
        { id: "squat", name: "Squat Rack", stat: "strength", kind: "squat",
          x: 2.24, y: .60, w: .16, h: .22, unit: "kg", ex: "squat",
          req: { lv: 7, gold: 900, gems: 3 }, diffs: [60, 100, 150, 200] },
        { id: "press", name: "Overhead Press", stat: "strength", kind: "rack",
          x: 2.46, y: .74, w: .15, h: .20, unit: "kg", ex: "rack",
          req: { lv: 6, gold: 700, gems: 2 }, diffs: [30, 50, 75, 110] },
        { id: "treadmill", name: "Roadwork Treadmill", stat: "strength", kind: "treadmill",
          x: 2.68, y: .66, w: .16, h: .20, unit: "km", ex: "rack",
          req: { lv: 5, gold: 600, gems: 2 }, diffs: [3, 6, 10, 15] },
        { id: "ring", name: "Sparring Ring", stat: "strength", kind: "ring",
          x: 2.90, y: .76, w: .22, h: .20, unit: "rounds", ex: "bench",
          req: { lv: 8, gold: 1400, gems: 5 }, diffs: [1, 2, 3, 5] },
      ];
      /* how many clicks a setting asks for, and what it pays */

      const gymKeys = new Set();
      let gymPlayer = { x: .5, y: .78, face: 1, step: 0 };
      let gymCam = 0;
      let gymNear = null, gymLast = 0, gymBusy = false;

      function gymBounds() { return { x0: .06, x1: GYM_W + .02, y0: .50, y1: .92 }; }
      function gymStep(dt) {
        if (gymBusy) return;
        const sp = 0.42 * dt;                     /* screens per second */
        let dx = 0, dy = 0;
        if (gymKeys.has("a") || gymKeys.has("arrowleft")) dx -= 1;
        if (gymKeys.has("d") || gymKeys.has("arrowright")) dx += 1;
        if (gymKeys.has("w") || gymKeys.has("arrowup")) dy -= 1;
        if (gymKeys.has("s") || gymKeys.has("arrowdown")) dy += 1;
        if (dx || dy) {
          const n = Math.hypot(dx, dy) || 1;
          gymPlayer.x += (dx / n) * sp;
          gymPlayer.y += (dy / n) * sp * .72;
          gymPlayer.step += dt * 9;
          if (dx) gymPlayer.face = dx > 0 ? 1 : -1;
        } else gymPlayer.step = 0;
        const b = gymBounds();
        gymPlayer.x = Math.max(b.x0, Math.min(b.x1, gymPlayer.x));
        gymPlayer.y = Math.max(b.y0, Math.min(b.y1, gymPlayer.y));
        /* centre on the player, but never scroll past the walls */
        const want = Math.max(0, Math.min(GYM_W - 1, gymPlayer.x - .5));
        gymCam += (want - gymCam) * Math.min(1, dt * 7);
        /* nearest machine within reach */
        gymNear = null;
        let best = .11;
        for (const m of GYM_MACHINES) {
          const d = Math.hypot(m.x - gymPlayer.x, (m.y - gymPlayer.y) * 1.5);
          if (d < best) { best = d; gymNear = m; }
        }
        const p = $("#gym-prompt");
        if (p) {
          p.hidden = !gymNear;
          if (gymNear) {
            const locked = !mcOwned(gymNear);
            const miss = locked ? mcMissing(gymNear) : null;
            p.classList.toggle("gp-rich", !!gymNear.stat);
            p.innerHTML = !gymNear.stat
              ? `<b>E</b> Enter &middot; ${gymNear.name}<i>Trading floor</i>`
              : `<div class="gp-name">${gymNear.name}</div>${muscleCard(gymNear)}<div class="gp-act">${
                  locked
                    ? `<b>E</b> Locked &middot; ${miss.length ? "needs " + miss.join(", ") : "ready to unlock"}`
                    : `<b>E</b> Occupy &middot; ${GYM_STATS[gymNear.stat].name}`
                }</div>`;
          }
        }
      }

      function drawGymRoom(ctx, W, H, t) {
        const now = performance.now();
        const dt = gymLast ? Math.min(.05, (now - gymLast) / 1000) : 0;
        gymLast = now;
        gymStep(dt);
        const b = artBlock(ctx);
        const floorY = H * .44;
        /* walls and high windows */
        b(-4, -4, W + 8, H + 8, "#0c1118");
        b(-4, -4, W + 8, floorY, "#1b222e");
        for (let y = 0; y < floorY; y += H * .05) {
          for (let x = ((y / (H * .05)) % 2 ? -W * .04 : 0); x < W; x += W * .085) {
            b(x, y, W * .08, H * .044, (x * 7 + y * 11) % 3 ? "#202836" : "#26303f");
          }
        }
        for (let i = 0; i < 14; i++) {
          const wx = W * (.08 + i * .25 - gymCam * .55);   /* parallax */
          if (wx < -W * .2 || wx > W * 1.1) continue;
          b(wx, H * .07, W * .15, H * .26, "#2c3a4c");
          b(wx + W * .008, H * .08, W * .134, H * .24, "#3b4e66");
          b(wx + W * .072, H * .07, W * .006, H * .26, "#243040");
          b(wx, H * .19, W * .15, H * .008, "#243040");
        }
        /* strip lights */
        for (let i = 0; i < 3; i++) {
          const lx = W * (.2 + i * .3);
          b(lx - W * .08, H * .02, W * .16, H * .018, "#ffeab4");
          const g = ctx.createRadialGradient(lx, H * .04, 2, lx, H * .04, H * .6);
          g.addColorStop(0, "rgba(255,226,168,.15)"); g.addColorStop(1, "rgba(255,226,168,0)");
          ctx.fillStyle = g; ctx.fillRect(lx - H * .6, 0, H * 1.2, H);
        }
        /* rubber floor, receding */
        b(-4, floorY, W + 8, H, "#171d26");
        b(-4, floorY, W + 8, H * .012, "#2b3542");
        for (let i = 0; i < 16; i++) {
          const k = i / 15, y = floorY + Math.pow(k, 1.7) * (H - floorY);
          b(-4, y, W + 8, 1, "rgba(0,0,0,.22)");
        }
        /* training mats under the weights */
        for (const mt of [[.40, .30], [1.38, .26], [2.20, .34]]) {
          const mx = (mt[0] - gymCam) * W;
          if (mx > -W * .5 && mx < W * 1.5) b(mx, H * .62, W * mt[1], H * .30, "#231b22");
        }

        /* machines, back to front */
        const order = GYM_MACHINES.slice().sort((p, q) => p.y - q.y);
        for (const m of order) drawMachine(ctx, W, H, m, m === gymNear, t);
        /* player, drawn in the right depth order */
        drawGymPlayer(ctx, W, H);
        /* grade */
        const v = ctx.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .34, W / 2, H * .55, H);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.5)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }

      function drawMachine(ctx, W, H, m, near, t) {
        const b = artBlock(ctx);
        t = t || 0;
        const x = (m.x - gymCam) * W, y = m.y * H, w = m.w * W, h = m.h * H;
        if (x < -w * 2 || x > W + w * 2) return;   /* off-camera */
        /* every solid gets a lit top edge and a dark base: cheap, and it
           stops the room reading as flat rectangles */
        const sh = (X, Y, Wd, Ht, base, hi, lo) => {
          b(X, Y, Wd, Ht, base);
          b(X, Y, Wd, Math.max(1, Ht * .17), hi);
          b(X, Y + Ht - Math.max(1, Ht * .15), Wd, Math.max(1, Ht * .15), lo);
        };
        /* contact shadow so nothing floats */
        ctx.fillStyle = "rgba(0,0,0,.40)";
        ctx.beginPath();
        ctx.ellipse(x, y + h * .03, w * .46, h * .10, 0, 0, 6.3);
        ctx.fill();
        const locked = !mcOwned(m);
        if (locked) ctx.globalAlpha = .55;
        if (near) {
          ctx.strokeStyle = "rgba(232,194,114,.85)";
          ctx.lineWidth = Math.max(1, H * .007);
          ctx.strokeRect(Math.round(x - w / 2) + .5, Math.round(y - h * .78) + .5, Math.round(w), Math.round(h));
        }
        if (m.kind === "bench") {
          b(x - w * .46, y - h * .34, w * .92, h * .16, "#2a3240");
          b(x - w * .38, y - h * .30, w * .76, h * .09, "#3a4454");
          b(x - w * .30, y - h * .18, w * .10, h * .20, "#20262f");
          b(x + w * .20, y - h * .18, w * .10, h * .20, "#20262f");
          b(x - w * .52, y - h * .62, w * .09, h * .34, "#9a2a22");
          b(x + w * .43, y - h * .62, w * .09, h * .34, "#9a2a22");
          b(x - w * .56, y - h * .58, w * 1.12, h * .07, "#c9ced6");
          b(x - w * .66, y - h * .66, w * .11, h * .24, "#2b3340");
          b(x + w * .55, y - h * .66, w * .11, h * .24, "#2b3340");
        } else if (m.kind === "squat") {
          b(x - w * .40, y - h * .92, w * .11, h * .92, "#9a2a22");
          b(x + w * .29, y - h * .92, w * .11, h * .92, "#9a2a22");
          b(x - w * .48, y - h * .04, w * .96, h * .08, "#6d1b15");
          b(x - w * .52, y - h * .70, w * 1.04, h * .06, "#c9ced6");
          b(x - w * .62, y - h * .80, w * .12, h * .26, "#2b3340");
          b(x + w * .50, y - h * .80, w * .12, h * .26, "#2b3340");
        } else if (m.kind === "heavybag") {
          const sw = Math.sin(t / 900) * w * .07;          /* slow sway */
          sh(x - w * .13, y - h * 1.16, w * .26, h * .06, "#2b3340", "#3d4757", "#1a1f27");
          for (let i = 0; i < 4; i++)                      /* chain */
            b(x - w * .03 + sw * (i / 4), y - h * (1.10 - i * .05), w * .06, h * .04,
              i % 2 ? "#7d8a99" : "#a8b7c6");
          b(x - w * .19 + sw, y - h * .92, w * .38, h * .05, "#3a2a1e");
          sh(x - w * .21 + sw, y - h * .88, w * .42, h * .68, "#6a3327", "#8e4836", "#401e18");
          b(x - w * .21 + sw, y - h * .66, w * .42, h * .05, "#2e150f");
          b(x - w * .21 + sw, y - h * .44, w * .42, h * .05, "#2e150f");
          b(x - w * .16 + sw, y - h * .86, w * .07, h * .64, "rgba(255,206,170,.16)");
          sh(x - w * .22 + sw, y - h * .24, w * .44, h * .09, "#4a241c", "#67352a", "#2a1310");
        } else if (m.kind === "speedbag") {
          const wob = Math.sin(t / 55) * w * .06;          /* blur of use */
          sh(x - w * .36, y - h * 1.04, w * .72, h * .10, "#6b4a2f", "#8f6540", "#45301f");
          b(x - w * .32, y - h * .95, w * .64, h * .03, "#39424f");
          b(x - w * .05, y - h * .94, w * .10, h * .07, "#9fb0c2");
          sh(x - w * .13 + wob, y - h * .88, w * .26, h * .22, "#8a2820", "#b8422f", "#4d1410");
          b(x - w * .08 + wob, y - h * .85, w * .08, h * .11, "rgba(255,198,176,.30)");
          sh(x - w * .05, y - h * .68, w * .10, h * .66, "#39424f", "#505d6d", "#232a33");
          sh(x - w * .18, y - h * .06, w * .36, h * .07, "#2b3340", "#3b4555", "#1a1f27");
        } else if (m.kind === "doubleend") {
          const bob = Math.sin(t / 210) * h * .035;
          b(x - w * .02, y - h * 1.08, w * .04, h * .42 + bob, "#8d99a8");
          sh(x - w * .16, y - h * .70 + bob, w * .32, h * .28, "#8a2820", "#b8422f", "#4d1410");
          b(x - w * .11, y - h * .66 + bob, w * .10, h * .10, "rgba(255,200,180,.32)");
          b(x - w * .02, y - h * .44 + bob, w * .04, h * .44 - bob, "#8d99a8");
          sh(x - w * .12, y - h * .05, w * .24, h * .06, "#2b3340", "#3b4555", "#1a1f27");
        } else if (m.kind === "rope") {
          sh(x - w * .42, y - h * .12, w * .84, h * .12, "#241c23", "#33272f", "#151014");
          sh(x - w * .36, y - h * .90, w * .72, h * .06, "#3a4454", "#4e5c70", "#232a33");
          const a1 = Math.sin(t / 320);
          for (let i = 0; i < 3; i++) {                    /* ropes on hooks */
            const hx = x + (i - 1) * w * .26;
            b(hx - w * .025, y - h * .86, w * .05, h * .07, "#9fb0c2");
            for (let j = 0; j < 5; j++)
              b(hx - w * .025 + Math.sin(j * .8 + a1) * w * .035,
                y - h * (.79 - j * .11), w * .045, h * .10,
                j % 2 ? "#d8c08a" : "#bb9f6e");
          }
        } else if (m.kind === "treadmill") {
          const belt = (t / 420) % 1;
          sh(x - w * .44, y - h * .22, w * .88, h * .19, "#2a3240", "#3b4757", "#151b23");
          b(x - w * .40, y - h * .19, w * .80, h * .12, "#11151c");
          for (let i = 0; i < 7; i++) {                    /* belt, running */
            const by = y - h * .19 + (((i / 7) + belt) % 1) * h * .12;
            b(x - w * .40, by, w * .80, h * .013, "#2b3442");
          }
          sh(x - w * .42, y - h * .80, w * .08, h * .60, "#39424f", "#505d6d", "#232a33");
          sh(x + w * .34, y - h * .80, w * .08, h * .60, "#39424f", "#505d6d", "#232a33");
          sh(x - w * .36, y - h * .92, w * .72, h * .15, "#3a4454", "#50607a", "#212834");
          b(x - w * .28, y - h * .88, w * .56, h * .07, "#0b1922");
          b(x - w * .26, y - h * .865, w * .22, h * .032, "#7fd4ff");
          b(x + w * .04, y - h * .865, w * .12, h * .032, "#4a8fb0");
        } else if (m.kind === "ring") {
          sh(x - w * .54, y - h * .24, w * 1.08, h * .24, "#6b4a2f", "#8f6540", "#45301f");
          b(x - w * .50, y - h * .21, w * 1.00, h * .15, "#9aa7b6");
          b(x - w * .50, y - h * .21, w * 1.00, h * .035, "#c2cfdc");
          for (const px of [-.52, .45]) {                  /* corner posts */
            sh(x + w * px, y - h * .96, w * .08, h * .76, "#cfd8e2", "#f1f6fb", "#93a0ae");
            b(x + w * px - w * .012, y - h * .99, w * .105, h * .055, "#e8c272");
          }
          for (let i = 0; i < 3; i++) {                    /* ropes */
            const ry = y - h * (.36 + i * .20);
            b(x - w * .52, ry, w * 1.02, h * .038, ["#d94f3e", "#e8e2d0", "#3e94e6"][i]);
            b(x - w * .52, ry + h * .028, w * 1.02, h * .013, "rgba(0,0,0,.38)");
          }
        } else if (m.kind === "trade") {
          /* lit counter under a signed archway */
          b(x - w * .52, y - h * .96, w * .10, h * .96, "#4a3523");
          b(x + w * .42, y - h * .96, w * .10, h * .96, "#4a3523");
          b(x - w * .60, y - h * 1.08, w * 1.20, h * .18, "#5b4129");
          b(x - w * .48, y - h * 1.04, w * .96, h * .10, "#2a1f14");
          b(x - w * .40, y - h * 1.02, w * .80, h * .055, "#e8c272");
          b(x - w * .44, y - h * .40, w * .88, h * .26, "#2d2535");
          b(x - w * .40, y - h * .36, w * .80, h * .14, "#3c3345");
          b(x - w * .36, y - h * .33, w * .72, h * .045, "#6fcf5e");
          for (let i = 0; i < 3; i++) b(x - w * .30 + i * w * .22, y - h * .56, w * .12, h * .16, "#241a12");
        } else {
          b(x - w * .5, y - h * .34, w, h * .10, "#2a3240");
          b(x - w * .5, y - h * .74, w, h * .10, "#2a3240");
          b(x - w * .5, y - h * .80, w * .07, h * .80, "#20262f");
          b(x + w * .43, y - h * .80, w * .07, h * .80, "#20262f");
          for (let i = 0; i < 4; i++) {
            const ox = x - w * .38 + i * w * .25;
            for (const oy of [y - h * .80, y - h * .40]) {
              b(ox, oy, w * .16, h * .07, "#c9ced6");
              b(ox - w * .03, oy - h * .035, w * .06, h * .14, "#38424f");
              b(ox + w * .13, oy - h * .035, w * .06, h * .14, "#38424f");
            }
          }
        }
        /* floor marker so the walkable target reads at a glance */
        ctx.fillStyle = near ? "rgba(232,194,114,.22)" : "rgba(120,140,170,.10)";
        ctx.beginPath();
        ctx.ellipse(x, y + h * .05, w * .5, h * .12, 0, 0, 6.3);
        ctx.fill();
        ctx.globalAlpha = 1;   /* locked kit dims only itself */
      }

      function drawGymPlayer(ctx, W, H) {
        const b = artBlock(ctx);
        const x = (gymPlayer.x - gymCam) * W, y = gymPlayer.y * H;
        const s = H * .085;                               /* body unit */
        const bob = Math.sin(gymPlayer.step) * s * .08;
        const swing = Math.sin(gymPlayer.step) * s * .22;
        /* shadow */
        ctx.fillStyle = "rgba(0,0,0,.45)";
        ctx.beginPath(); ctx.ellipse(x, y + s * .06, s * .42, s * .14, 0, 0, 6.3); ctx.fill();
        /* legs */
        b(x - s * .26, y - s * .42 + bob, s * .22, s * .46 + swing * .3, "#2a3444");
        b(x + s * .04, y - s * .42 + bob, s * .22, s * .46 - swing * .3, "#2a3444");
        /* torso */
        b(x - s * .36, y - s * .96 + bob, s * .72, s * .58, "#8a2820");
        b(x - s * .28, y - s * .90 + bob, s * .56, s * .44, "#b03a2c");
        /* arms */
        b(x - s * .50, y - s * .92 + bob + swing * .4, s * .16, s * .46, SKIN2);
        b(x + s * .34, y - s * .92 + bob - swing * .4, s * .16, s * .46, SKIN2);
        /* head */
        b(x - s * .26, y - s * 1.40 + bob, s * .52, s * .46, SKIN2);
        b(x - s * .20, y - s * 1.34 + bob, s * .40, s * .34, SKIN);
        b(x - s * .26, y - s * 1.46 + bob, s * .52, s * .16, "#17120d");
        const ex = gymPlayer.face > 0 ? s * .02 : -s * .18;
        b(x + ex, y - s * 1.22 + bob, s * .10, s * .08, "#1b1109");
        b(x + ex + s * .16 * gymPlayer.face, y - s * 1.22 + bob, s * .10, s * .08, "#1b1109");
      }

      /* ── EXERCISE ANIMATION ──────────────────────────────────────
         The set is a thing you watch, not a number that goes up. Each
         click drives one rep and the figure actually performs it:
         the squat sinks and stands, the bench bar comes to the chest
         and back, the curls close, the runner's legs turn over. */
      function drawExercise(ctx, W, H, kind, phase, drive, rate, faint) {
        const b = artBlock(ctx);
        /* bend: 0 at the top of the rep, 1 at the bottom */
        const fk = Math.max(0, Math.min(1, faint || 0));
        const bend = fk > 0 ? 1 : Math.sin(Math.max(0, Math.min(1, phase)) * Math.PI);
        const BAR = "#c9ced6", PL = "#2b3340", PL2 = "#3d4756", KIT = "#8a2820", KIT2 = "#b03a2c";
        const u = H / 100;                               /* one percent of height */
        const cx = W * .52, ground = H * .88;

        /* room behind: a wall, a skirting line and the mat */
        b(-2, -2, W + 4, H + 4, "#0d131c");
        b(-2, -2, W + 4, ground - u * 2, "#161e2a");
        for (let y = 0; y < ground - u * 2; y += u * 9) {
          for (let x = ((y / (u * 9)) % 2 ? -W * .05 : 0); x < W; x += W * .11) {
            b(x, y, W * .105, u * 8, (x * 7 + y * 3) % 3 ? "#1a2330" : "#1e2836");
          }
        }
        b(-2, ground - u * 2, W + 4, u * 2, "#2b3542");
        b(-2, ground, W + 4, H, "#11171f");

        if (kind === "squat") {
          /* rack uprights behind the lifter */
          b(cx - W * .34, ground - u * 62, W * .05, u * 62, "#7d231d");
          b(cx + W * .29, ground - u * 62, W * .05, u * 62, "#7d231d");
          const drop = bend * u * 20;
          const hip = ground - u * 40 + drop;
          const sh = ground - u * 62 + drop;
          /* legs fold as the hips drop */
          const knee = ground - u * 21 + drop * .35;
          for (const s of [-1, 1]) {
            const lx = cx + s * W * .07;
            b(lx - W * .035, sh + u * 22, W * .07, knee - (sh + u * 22), SKIN2);   /* thigh */
            b(lx - W * .032 - bend * W * .03 * s, knee, W * .064, ground - knee, SKIN2);
            b(lx - W * .04, ground - u * 3, W * .08, u * 3, "#2a3240");             /* shoe */
          }
          b(cx - W * .12, hip - u * 4, W * .24, u * 9, PL);                         /* shorts */
          b(cx - W * .13, sh + u * 2, W * .26, hip - sh, KIT);                      /* torso */
          b(cx - W * .10, sh + u * 5, W * .20, hip - sh - u * 7, KIT2);
          b(cx - W * .08, sh - u * 11, W * .16, u * 12, SKIN2);                     /* head */
          b(cx - W * .06, sh - u * 9, W * .12, u * 9, SKIN);
          b(cx - W * .08, sh - u * 13, W * .16, u * 5, "#17120d");
          /* arms up on the bar */
          b(cx - W * .20, sh - u * 2, W * .055, u * 12, SKIN2);
          b(cx + W * .145, sh - u * 2, W * .055, u * 12, SKIN2);
          /* the bar, with plates, riding the shoulders */
          b(cx - W * .40, sh - u * 3, W * .80, u * 4, BAR);
          for (const px of [cx - W * .44, cx + W * .36]) {
            b(px, sh - u * 13, W * .08, u * 24, PL);
            b(px + W * .012, sh - u * 10, W * .056, u * 18, PL2);
          }
        } else if (kind === "bench") {
          /* bench, seen from the side, lifter on his back */
          const benchY = ground - u * 26;
          b(cx - W * .34, benchY, W * .68, u * 7, PL);
          b(cx - W * .30, benchY + u * 1.5, W * .60, u * 4, PL2);
          b(cx - W * .26, benchY + u * 7, W * .06, u * 19, "#20262f");
          b(cx + W * .20, benchY + u * 7, W * .06, u * 19, "#20262f");
          b(cx - W * .46, benchY - u * 20, W * .05, u * 20, "#7d231d");
          b(cx + W * .41, benchY - u * 20, W * .05, u * 20, "#7d231d");
          /* body lying along the bench */
          b(cx - W * .22, benchY - u * 9, W * .46, u * 10, KIT);
          b(cx - W * .18, benchY - u * 7, W * .38, u * 6, KIT2);
          b(cx - W * .34, benchY - u * 9, W * .13, u * 10, SKIN2);                  /* head end */
          b(cx - W * .32, benchY - u * 7, W * .09, u * 7, SKIN);
          b(cx - W * .34, benchY - u * 11, W * .13, u * 4, "#17120d");
          b(cx + W * .22, benchY - u * 6, W * .17, u * 7, PL);                      /* legs off the end */
          b(cx + W * .34, benchY - u * 2, W * .07, u * 16, SKIN2);
          /* the bar travels from locked out down to the chest */
          const top = benchY - u * 42, bottom = benchY - u * 13;
          const barY = top + (bottom - top) * bend;
          b(cx - W * .10, barY, W * .055, benchY - u * 8 - barY, SKIN2);            /* arms */
          b(cx + W * .05, barY, W * .055, benchY - u * 8 - barY, SKIN2);
          b(cx - W * .42, barY - u * 2, W * .84, u * 4, BAR);
          for (const px of [cx - W * .46, cx + W * .38]) {
            b(px, barY - u * 11, W * .08, u * 22, PL);
            b(px + W * .012, barY - u * 8, W * .056, u * 16, PL2);
          }
        } else if (kind === "rack") {
          /* standing curls, seen from the front */
          const sh = ground - u * 56;
          b(cx - W * .09, ground - u * 26, W * .07, u * 26, SKIN2);                 /* legs */
          b(cx + W * .02, ground - u * 26, W * .07, u * 26, SKIN2);
          b(cx - W * .11, ground - u * 3, W * .09, u * 3, "#2a3240");
          b(cx + W * .02, ground - u * 3, W * .09, u * 3, "#2a3240");
          b(cx - W * .11, ground - u * 30, W * .22, u * 8, PL);
          b(cx - W * .13, sh, W * .26, u * 24, KIT);                                /* torso */
          b(cx - W * .10, sh + u * 3, W * .20, u * 18, KIT2);
          b(cx - W * .08, sh - u * 12, W * .16, u * 13, SKIN2);                     /* head */
          b(cx - W * .06, sh - u * 10, W * .12, u * 10, SKIN);
          b(cx - W * .08, sh - u * 14, W * .16, u * 5, "#17120d");
          /* upper arms hang; forearms swing up with the rep */
          for (const s of [-1, 1]) {
            const ax = cx + s * W * .17 - (s < 0 ? W * .055 : 0);
            b(ax, sh + u * 2, W * .055, u * 15, SKIN2);
            const fy = sh + u * 17 - bend * u * 15;
            b(ax + (s > 0 ? -W * .004 : W * .004), fy, W * .055, u * 15 - bend * u * 9, SKIN2);
            if (bend > .3) b(ax, sh + u * 5, W * .055, u * 8 * bend, SKINH);        /* bicep */
            const dy = fy - u * 4;
            b(ax - W * .012, dy, W * .08, u * 5, BAR);                              /* dumbbell */
            b(ax - W * .03, dy - u * 3, W * .035, u * 11, PL);
            b(ax + W * .055, dy - u * 3, W * .035, u * 11, PL);
          }
        }
        /* going down: the whole frame slumps and the bar lands */
        if (fk > 0) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, fk * 1.4);
          ctx.fillStyle = "rgba(8,6,10,.55)";
          ctx.fillRect(0, 0, W, H);
          const dy = fk * u * 30;
          b(cx - W * .34, ground - u * 10 + dy * .2, W * .68, u * 8, "#7a2018");
          b(cx - W * .40, ground - u * 4, W * .80, u * 4, BAR);
          for (const px of [cx - W * .46, cx + W * .38]) b(px, ground - u * 12, W * .08, u * 12, PL);
          b(cx - W * .13, ground - u * 18 + dy * .1, W * .26, u * 9, SKIN2);
          ctx.restore();
        }
        /* effort tells: sweat flies and the frame shakes when you are working */
        if (drive > .15) {
          for (let i = 0; i < Math.round(drive * 7); i++) {
            const a = -2.6 + rnd(i * 4.1 + Math.floor(rate)) * 3.4;
            const r = u * (12 + rnd(i * 2.3) * 22) * drive;
            b(cx + Math.cos(a) * r, ground - u * 52 + Math.sin(a) * r * .8,
              Math.max(1, u * 1.6), Math.max(1, u * 1.6), i % 3 ? "#cfe2f2" : "#ffe9c4");
          }
        }
        /* grade */
        const v = ctx.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .3, W / 2, H * .5, H);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }

      /* ── the set ─────────────────────────────────────────────────
         Continuous: you rep until you stop or until you go down. Every
         rep banks immediately. Load above what your level can carry
         builds fatigue fast and can drop you mid-lift, which costs you
         a quarter of what the session earned. */
      /* what he can carry now. Starts high enough that a fresh player has a
         real choice of loads rather than one safe bar and three suicides. */
      const strCap = () => 80 + gymLevel("strength") * 25;
      function loadBand(w) {
        const r = w / strCap();
        return r <= .7 ? { k: "easy",  t: "Comfortable",      c: "#6fcf5e" }
             : r <= 1   ? { k: "work",  t: "Working weight",   c: "#e8c272" }
             : r <= 1.35 ? { k: "hard", t: "Over your limit",  c: "#e8883a" }
             :             { k: "crazy", t: "You will go down", c: "#e8453a" };
      }
      function closeTrainer() {
        document.querySelectorAll(".trainer").forEach((n) => n.remove());
        gymBusy = false;
      }
      function openTrainer(m) {
        if (gymBusy) return;
        gymBusy = true;
        gymKeys.clear();
        const st = GYM_STATS[m.stat];
        const el = document.createElement("div");
        el.className = "trainer";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", m.name);
        el.innerHTML = `
          <div class="tr-box">
            <div class="tr-head">
              <div><span style="color:${st.col}">${st.name}</span><h3>${m.name}</h3></div>
              <button class="tr-close" type="button" aria-label="Leave">&times;</button>
            </div>
            <div class="tr-stage" id="tr-stage"></div>
          </div>`;
        document.body.appendChild(el);
        el.querySelector(".tr-close").addEventListener("click", closeTrainer);
        const stage = $("#tr-stage");

        function pick() {
          const cap = strCap();
          stage.innerHTML = `
            <p class="tr-note">You can carry about <b>${cap} kg</b> at level ${gymLevel("strength")}. Go heavier for more per rep, and risk going down.</p>
            <div class="tr-diffs">
              ${m.diffs.map((d) => {
                const band = loadBand(d);
                return `<button class="tr-diff ${band.k}" data-d="${d}" type="button">
                  <b>${d}</b><u>${m.unit}</u>
                  <s style="color:${band.c}">${band.t}</s>
                  <em>+${Math.max(1, Math.round(d / 14))} / rep</em>
                </button>`;
              }).join("")}
            </div>
            <div class="tr-prog">
              <div class="tr-prow"><span>Strength level</span><b>${gymLevel("strength")}</b></div>
              <div class="tr-bar"><i style="width:${gymPct("strength")}%;background:${st.col}"></i></div>
              <div class="tr-prow small"><span>${gymInto("strength")} / ${gymNext("strength")} to the next</span><b>+${gymBonus("strength").toFixed(1)}x now</b></div>
            </div>`;
          stage.querySelectorAll("[data-d]").forEach((bn) =>
            bn.addEventListener("click", () => run(Number(bn.dataset.d))));
        }

        function run(w) {
          const cap = strCap(), ratio = w / cap, band = loadBand(w);
          const perRep = Math.max(1, Math.round(w / 14));
          const fatPerRep = 5.5 * Math.pow(ratio, 2.3);
          let reps = 0, earned = 0, fatigue = 0, done = false, faintK = 0;
          stage.innerHTML = `
            <div class="tr-run">
              <div class="tr-view"><canvas id="tr-canvas" aria-hidden="true"></canvas>
                <span class="tr-setbadge">${w} ${m.unit}</span>
                <span class="tr-load" style="color:${band.c}">${band.t}</span></div>
              <div class="tr-gauge">
                <u>Fatigue</u>
                <div class="tr-bigbar"><i id="tr-fill"></i></div>
              </div>
              <div class="tr-tally"><span id="tr-reps">0 reps</span><span id="tr-earn">+0 strength</span></div>
              <button class="tr-smash" id="tr-smash" type="button">LIFT</button>
              <button class="tr-stop" id="tr-stop" type="button">Rack it &amp; stop</button>
            </div>`;
          const fill = $("#tr-fill"), rp = $("#tr-reps"), er = $("#tr-earn"), smash = $("#tr-smash");
          const cvx = $("#tr-canvas"), g2 = cvx.getContext("2d");
          let shownReps = 0, raf = 0;
          const r0 = cvx.parentElement.getBoundingClientRect();
          cvx.width = Math.max(120, Math.min(300, Math.round((r0.width || 300) / 1.9)));
          cvx.height = Math.max(90, Math.round(cvx.width * ((r0.height || 170) / Math.max(1, r0.width || 300))));
          g2.imageSmoothingEnabled = false;
          const paintGauge = () => {
            fill.style.width = Math.min(100, fatigue) + "%";
            fill.style.background = fatigue > 75 ? "#e8453a" : fatigue > 45 ? "#e8883a" : "#6fcf5e";
            rp.textContent = reps + (reps === 1 ? " rep" : " reps");
            er.textContent = "+" + earned + " strength";
          };
          const loop = () => {
            if (!cvx.isConnected) return;
            if (faintK > 0 && faintK < 1) faintK = Math.min(1, faintK + .05);
            shownReps += (reps - shownReps) * .22;
            const drive = Math.min(1, Math.abs(reps - shownReps) * .9);
            drawExercise(g2, cvx.width, cvx.height, m.ex || m.kind, shownReps % 1, drive, shownReps, faintK);
            raf = requestAnimationFrame(loop);
          };
          loop();
          const hit = () => {
            if (done) return;
            reps++;
            earned += perRep;
            P.gymStat = P.gymStat || { strength: 0 };
            const ST = m.stat || "strength";
            const before = gymLevel(ST);
            P.gymStat[ST] = (P.gymStat[ST] || 0) + perRep;             /* banked as you go */
            if (gymLevel(ST) > before) gateToast(GYM_STATS[ST].name + " level " + gymLevel(ST) + " · +" + gymBonus(ST).toFixed(1) + "x");
            saveProfile(); refreshLobbyCard();
            fatigue += fatPerRep;
            paintGauge();
            smash.classList.remove("pop"); void smash.offsetWidth; smash.classList.add("pop");
            /* too heavy: the bar can drop you outright */
            if (ratio > 1 && Math.random() < (ratio - 1) * .20) return fall("The weight won. You went down under it.");
            if (fatigue >= 100) return fall("Nothing left. Your legs gave out.");
          };
          smash.addEventListener("click", hit);
          const keyHit = (e) => { if (e.code === "Space" || e.key === " ") { e.preventDefault(); hit(); } };
          window.addEventListener("keydown", keyHit);
          /* fatigue bleeds off while you pause, so you can pace a set */
          const tick = setInterval(() => {
            if (done) return;
            fatigue = Math.max(0, fatigue - 1.1);
            paintGauge();
          }, 140);
          $("#tr-stop").addEventListener("click", () => finish(false));

          function fall(why) { faintK = 0.001; finish(true, why); }
          function finish(fainted, why) {
            if (done) return;
            done = true;
            clearInterval(tick);
            window.removeEventListener("keydown", keyHit);
            let lost = 0;
            if (fainted) {
              lost = Math.round(earned * .25);
              const SL = m.stat || "strength";
              P.gymStat[SL] = Math.max(0, (P.gymStat[SL] || 0) - lost);
              saveProfile(); refreshLobbyCard();
            }
            setTimeout(() => {
              cancelAnimationFrame(raf);
              stage.innerHTML = `
                <div class="tr-end ${fainted ? "fail" : "win"}">
                  <h4>${fainted ? "You went down" : "Racked"}</h4>
                  <p>${fainted ? escapeUI(why) + "<br>" : ""}${reps} reps &middot; +${earned - lost} strength${lost ? ` <b style="color:#e8886a">(${lost} lost)</b>` : ""}</p>
                  <div class="tr-bar"><i style="width:${gymPct("strength")}%;background:${st.col}"></i></div>
                  <div class="tr-again">
                    <button class="tr-btn" id="tr-retry" type="button">Load up again</button>
                    <button class="tr-btn ghost" id="tr-leave" type="button">Leave</button>
                  </div>
                </div>`;
              $("#tr-retry").addEventListener("click", pick);
              $("#tr-leave").addEventListener("click", closeTrainer);
            }, fainted ? 900 : 0);
          }
          paintGauge();
        }
        pick();
      }

      /* ── gym input ───────────────────────────────────────────── */
      function gymActive() {
        return lobbyView === "gym" && !!document.querySelector(".lobby")
          && !document.querySelector(".trainer,.settings,.market,.gearup,.msetup,.modesel,#gymload,.boardwrap,.tradewrap,.sfight,.arena3");
      }
      window.addEventListener("keydown", (e) => {
        if (!gymActive()) return;
        const t = e.target;
        if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "") || t.isContentEditable)) return;
        const k = e.key.toLowerCase();
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
          gymKeys.add(k);
          e.preventDefault();
        } else if (k === "e" && gymNear) {
          e.preventDefault();
          if (gymNear.kind === "trade") openTrade();
          else if (!mcOwned(gymNear)) mcAsk(gymNear);
          else openTrainer(gymNear);
        }
      });
      window.addEventListener("keyup", (e) => {
        gymKeys.delete(e.key.toLowerCase());
      });
      window.addEventListener("blur", () => gymKeys.clear());

      /* which room the lobby is showing */
      let lobbyView = "ring";
      const VIEW_ORDER = ["ring", "gym", "plaza"];
      const VIEW_NEXT = { ring: "Switch gym", gym: "Switch plaza", plaza: "Switch lobby" };
      function setLobbyView(v) {
        lobbyView = v;
        intro();
      }
      function cycleLobbyView() {
        const i = VIEW_ORDER.indexOf(lobbyView);
        setLobbyView(VIEW_ORDER[(i + 1) % VIEW_ORDER.length]);
      }

      /* ── THE PLAZA ───────────────────────────────────────────────
         A square with a gilded statue in the middle. Each of its four
         faces carries a board. Nothing here is networked: the rosters
         are fictional and your own row is read from your save, which
         the panel says out loud rather than implying a live ranking. */
      const BOARD_NAMES = [
        "KINGBOBJR", "REQUIEM", "WORKERLOAD", "DARIOS1757", "CARTER",
        "halfguard", "Nikko_Helios", "DanaPikala", "coldstorage", "tenbell",
        "cutman_lee", "sparrow", "Ortiz_88", "glassjaw", "roundtwelve",
        "southpaw", "ringsalt", "brawler_k", "quietcorner", "redcorner",
      ];
      const BOARDS = [
        { id: "rank",  face: "North", name: "Rank",        unit: "pts",
          blurb: "Ranked by bouts coached and fighters brought home intact.",
          mine: () => ((P.wins || 0) * 120 + (P.stops || 0) * 180 + (P.bouts || 0) * 40) },
        { id: "spent", face: "East",  name: "Money Spent", unit: "gems",
          blurb: "Gems bought through Discord. Yours reads zero because nothing in this build takes payment.",
          mine: () => (P.spent || 0) },
        { id: "level", face: "South", name: "Level",       unit: "lv",
          blurb: "Coach level, earned from experience at the end of every bout.",
          mine: () => (P.lv || 1) },
        { id: "gold",  face: "West",  name: "Gold",        unit: "gold",
          blurb: "Coins in hand right now, not coins earned all time.",
          mine: () => (P.gold || 0) },
      ];
      function boardRows(b) {
        /* a fixed fictional roster, so the board does not shuffle each visit */
        const scale = { rank: 9000, spent: 42000, level: 70, gold: 900000 }[b.id];
        const rows = BOARD_NAMES.map((n, i) => ({
          n, v: Math.round(scale * (1 - i / BOARD_NAMES.length) * (0.55 + rnd(i * 3.7 + b.id.length) * 0.45)),
        }));
        rows.push({ n: "YOU", v: b.mine(), me: true });
        rows.sort((x, y) => y.v - x.v);
        return rows;
      }
      function openBoard(id) {
        const b = BOARDS.find((x) => x.id === id) || BOARDS[0];
        const rows = boardRows(b);
        rows.forEach((r, i) => { r.pos = i + 1; });
        const mineAt = rows.findIndex((r) => r.me) + 1;
        /* a board that cannot show you your own row is useless, so if you
           rank below the visible slice it is pinned on under a break */
        const shown = rows.slice(0, 12);
        if (!shown.some((r) => r.me)) {
          shown.push({ sep: true });
          shown.push(rows[mineAt - 1]);
        }
        document.querySelectorAll(".boardwrap").forEach((n) => n.remove());
        const el = document.createElement("div");
        el.className = "boardwrap";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", b.name + " board");
        el.innerHTML = `
          <div class="board">
            <div class="board-head">
              <div>
                <span>${b.face} Face</span>
                <h3>${b.name}</h3>
              </div>
              <button class="board-close" type="button" aria-label="Close">&times;</button>
            </div>
            <p class="board-blurb">${escapeUI(b.blurb)}</p>
            <ol class="board-list">
              ${shown.map((r) => r.sep
                ? `<li class="sep"><b></b><span>&hellip;</span><s></s></li>`
                : `<li class="${r.me ? "me" : ""}">
                     <b>${r.pos}</b><span>${escapeUI(r.n)}</span>
                     <s>${r.v.toLocaleString()} ${b.unit}</s>
                   </li>`).join("")}
            </ol>
            <div class="board-mine">Your position: <b>#${mineAt}</b> &middot; ${b.mine().toLocaleString()} ${b.unit}</div>
            <p class="board-note">Offline board. These names are fictional and the standings are generated on your own device — nothing is submitted anywhere.</p>
          </div>`;
        el.querySelector(".board-close").addEventListener("click", () => el.remove());
        el.addEventListener("click", (e) => { if (e.target === el) el.remove(); });
        document.body.appendChild(el);
      }

      /* ── TRADE CENTRAL ───────────────────────────────────────── */
      const TRADE_OFFERS = [
        { who: "coldstorage", has: "Pier 14 ticket", wants: "2,500 gold" },
        { who: "cutman_lee",  has: "Swab kit (3)",   wants: "1x Exp boost" },
        { who: "halfguard",   has: "Gold boost 3h",  wants: "180 gems" },
        { who: "tenbell",     has: "Furnace St pass", wants: "900 gold" },
        { who: "glassjaw",    has: "Mouthguard, red", wants: "Any boost" },
        { who: "sparrow",     has: "1,000 gold",     wants: "60 gems" },
      ];
      const TRADE_CHAT = [
        { who: "tenbell", t: "anyone got a spare gold boost" },
        { who: "sparrow", t: "selling 1k gold, 60 gems, first come" },
        { who: "cutman_lee", t: "wtb swabs. paying over" },
      ];
      function openTrade() {
        document.querySelectorAll(".tradewrap").forEach((n) => n.remove());
        const el = document.createElement("div");
        el.className = "tradewrap";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Trade Central");
        el.innerHTML = `
          <div class="trade">
            <div class="trade-head">
              <h3>Trade Central</h3>
              <button class="trade-close" type="button" aria-label="Close">&times;</button>
            </div>
            <div class="trade-body">
              <div class="trade-col">
                <div class="trade-h">Open offers</div>
                <div class="trade-list">
                  ${TRADE_OFFERS.map((o) => `
                    <div class="trade-offer">
                      <b>${escapeUI(o.who)}</b>
                      <span><i>has</i> ${escapeUI(o.has)}</span>
                      <span><i>wants</i> ${escapeUI(o.wants)}</span>
                      <button type="button" disabled>Offer</button>
                    </div>`).join("")}
                </div>
              </div>
              <div class="trade-col">
                <div class="trade-h">Floor chat</div>
                <div class="trade-chat" id="trade-chat"></div>
                <form class="trade-say" id="trade-say">
                  <input id="trade-input" type="text" maxlength="120" placeholder="Say something on the floor" aria-label="Chat message">
                  <button type="submit">Send</button>
                </form>
              </div>
            </div>
            <p class="trade-note">Not connected yet. The traders and their offers are fictional, and anything you type stays in this browser — no one else can see it and nothing is sent anywhere.</p>
          </div>`;
        document.body.appendChild(el);
        const log = $("#trade-chat");
        const push = (who, t, me) => {
          const d = document.createElement("div");
          d.className = "tc-line" + (me ? " me" : "");
          d.innerHTML = `<b>${escapeUI(who)}</b><span>${escapeUI(t)}</span>`;
          log.appendChild(d);
          log.scrollTop = log.scrollHeight;
        };
        TRADE_CHAT.forEach((m) => push(m.who, m.t));
        $("#trade-say").addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = $("#trade-input"), v = inp.value.trim();
          if (!v) return;
          push("YOU", v, true);
          inp.value = "";
        });
        el.querySelector(".trade-close").addEventListener("click", () => el.remove());
        el.addEventListener("click", (e) => { if (e.target === el) el.remove(); });
      }

      /* ── PLAZA ART ───────────────────────────────────────────── */
      function drawPlaza(ctx, W, H, t) {
        const b = (X, Y, Wd, Ht, c) => {
          ctx.fillStyle = c;
          ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(Wd)), Math.max(1, Math.round(Ht)));
        };
        const horizon = H * .56;
        const glow = 0.82 + Math.sin(t * Math.PI * 2) * 0.18;
        /* dusk sky */
        const sky = ctx.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, "#241c34");
        sky.addColorStop(.55, "#4a2f3f");
        sky.addColorStop(1, "#8a4c44");
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon);
        for (let i = 0; i < 40; i++) {
          const sx = rnd(i * 4.3) * W, sy = rnd(i * 7.1) * horizon * .7;
          b(sx, sy, 1, 1, "rgba(255,230,200,.5)");
        }
        /* distant skyline */
        for (let i = 0; i < 14; i++) {
          const bw = W * .09, bx = i * bw * .78 - W * .04;
          const bh = horizon * (.22 + rnd(i * 2.9) * .3);
          b(bx, horizon - bh, bw, bh, "#2b2234");
        }
        /* flanking buildings */
        const face = (x, w) => {
          b(x, horizon - H * .50, w, H * .50 + H * .14, "#2f2a36");
          b(x + w * .06, horizon - H * .47, w * .88, H * .47, "#3a3341");
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 3; c++) {
              const wx = x + w * (.14 + c * .28), wy = horizon - H * .44 + r * H * .085;
              const lit = (r * 3 + c + Math.floor(x)) % 4 < 2;
              b(wx, wy, w * .17, H * .055, lit ? "#e8b765" : "#241f2b");
              if (lit) b(wx + w * .03, wy + H * .012, w * .11, H * .03, "#ffd9a0");
            }
          }
        };
        face(-W * .06, W * .30);
        face(W * .76, W * .30);
        /* cobbles */
        b(0, horizon, W, H - horizon, "#312b33");
        for (let y = horizon; y < H; y += H * .035) {
          const row = Math.round((y - horizon) / (H * .035));
          for (let x = (row % 2 ? -W * .03 : 0); x < W; x += W * .062) {
            b(x, y, W * .058, H * .03, (row * 3 + Math.round(x)) % 3 ? "#3a333c" : "#342d36");
          }
        }
        /* plinth */
        const px0 = W * .38, pw = W * .24, pyTop = horizon - H * .02;
        b(px0 - pw * .14, pyTop + H * .10, pw * 1.28, H * .07, "#4a4350");
        b(px0 - pw * .07, pyTop + H * .05, pw * 1.14, H * .06, "#564e5d");
        b(px0, pyTop - H * .02, pw, H * .08, "#625969");
        /* light spill around the base */
        const gg = ctx.createRadialGradient(W * .5, pyTop + H * .07, 2, W * .5, pyTop + H * .07, W * .30);
        gg.addColorStop(0, "rgba(255,206,110," + (.42 * glow).toFixed(3) + ")");
        gg.addColorStop(1, "rgba(255,206,110,0)");
        ctx.fillStyle = gg; ctx.fillRect(0, horizon - H * .1, W, H * .5);
        /* ── the gilded fighter ── */
        const GX = W * .5, GY = pyTop - H * .02, S = H * .30;
        const G1 = "#f3d070", G2 = "#c99a33", G3 = "#8d661c", G4 = "#fff0bb";
        b(GX - S * .20, GY - S * .10, S * .40, S * .12, G2);              /* feet / base */
        b(GX - S * .16, GY - S * .40, S * .13, S * .32, G2);              /* legs */
        b(GX + S * .03, GY - S * .40, S * .13, S * .32, G2);
        b(GX - S * .14, GY - S * .38, S * .08, S * .28, G1);
        b(GX - S * .22, GY - S * .72, S * .44, S * .34, G2);              /* torso */
        b(GX - S * .17, GY - S * .69, S * .30, S * .28, G1);
        b(GX - S * .12, GY - S * .64, S * .18, S * .10, G4);              /* chest light */
        b(GX - S * .36, GY - S * .80, S * .17, S * .22, G2);              /* arms up */
        b(GX + S * .19, GY - S * .80, S * .17, S * .22, G2);
        b(GX - S * .40, GY - S * .97, S * .21, S * .20, G1);              /* gloves */
        b(GX + S * .19, GY - S * .97, S * .21, S * .20, G1);
        b(GX - S * .37, GY - S * .93, S * .12, S * .11, G4);
        b(GX + S * .22, GY - S * .93, S * .12, S * .11, G4);
        b(GX - S * .13, GY - S * .95, S * .26, S * .23, G2);              /* head */
        b(GX - S * .09, GY - S * .92, S * .18, S * .17, G1);
        b(GX - S * .13, GY - S * .99, S * .26, S * .08, G3);              /* brow */
        b(GX - S * .05, GY - S * .78, S * .10, S * .03, G3);              /* mouth */
        /* four engraved faces on the plinth */
        const plate = (x, y, w2, h2) => {
          b(x, y, w2, h2, "#3f3845");
          b(x + w2 * .08, y + h2 * .14, w2 * .84, h2 * .72, "#8d661c");
          b(x + w2 * .14, y + h2 * .26, w2 * .72, h2 * .20, "#f3d070");
          b(x + w2 * .14, y + h2 * .54, w2 * .52, h2 * .16, "#c99a33");
        };
        plate(px0 + pw * .06, pyTop + H * .062, pw * .38, H * .042);
        plate(px0 + pw * .56, pyTop + H * .062, pw * .38, H * .042);
        /* lanterns */
        for (const lx of [W * .22, W * .78]) {
          b(lx - W * .006, horizon - H * .24, W * .012, H * .24, "#2a2430");
          b(lx - W * .024, horizon - H * .29, W * .048, H * .055, "#ffd98a");
          b(lx - W * .016, horizon - H * .283, W * .032, H * .04, "#fff3cf");
          const lg = ctx.createRadialGradient(lx, horizon - H * .26, 2, lx, horizon - H * .26, W * .14);
          lg.addColorStop(0, "rgba(255,214,130,.28)"); lg.addColorStop(1, "rgba(255,214,130,0)");
          ctx.fillStyle = lg; ctx.fillRect(lx - W * .14, horizon - H * .4, W * .28, H * .35);
        }
        /* trade central gate, right */
        const tgx = W * .80;
        b(tgx - W * .02, horizon - H * .30, W * .025, H * .30, "#4a3523");
        b(tgx + W * .17, horizon - H * .30, W * .025, H * .30, "#4a3523");
        b(tgx - W * .05, horizon - H * .34, W * .27, H * .05, "#5b4129");
        b(tgx - W * .01, horizon - H * .325, W * .19, H * .03, "#2a1f14");
        b(tgx + W * .01, horizon - H * .318, W * .15, H * .016, "#e8c272");
        /* bunting of market stalls under it */
        b(tgx, horizon - H * .10, W * .18, H * .10, "#2d2535");
        b(tgx + W * .01, horizon - H * .085, W * .16, H * .05, "#3c3345");
        /* grade */
        const v = ctx.createRadialGradient(W / 2, H * .52, Math.min(W, H) * .3, W / 2, H * .52, H * .95);
        v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.6)");
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(8,11,18,.12)";
        const st = Math.max(2, Math.round(H * .017));
        for (let y = 0; y < H; y += st) ctx.fillRect(0, y, W, 1);
      }

      /* ── UPGRADES ────────────────────────────────────────────────
         Eight tracks on one grade ladder. Everything starts at E+.
         The art in the middle is drawn from the current levels, so a
         rank is something you can see rather than only read. */
      const GRADES = ["E-", "E", "E+", "D-", "D", "D+", "C-", "C", "C+",
                      "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+"];
      const GRADE_START = 2;                       /* E+ */
      const GRADE_MAX = GRADES.length - 1;
      const gradeCol = (i) =>
        i < 3 ? "#97a2ae" : i < 6 ? "#6fcf5e" : i < 9 ? "#56c8d6"
        : i < 12 ? "#7f9ff0" : i < 15 ? "#e8c272" : "#e8453a";
      /* cost climbs with the rank you are leaving */
      const upCost = (i) => Math.round(240 * Math.pow(1.42, i));
      /* only the S ranks can fail, and each one is worse than the last */
      const successPct = (target) =>
        target <= 14 ? 100 : target === 15 ? 70 : target === 16 ? 50 : 30;

      const UP_TRACKS = [
        { id: "spd",   name: "Speed",           art: "bust",  unit: "spd",
          val: (i) => 120 + i * 9,
          desc: "Hand and foot speed. Lands first and leaves before the counter." },
        { id: "dur",   name: "Durability",      art: "bust",  unit: "dur",
          val: (i) => 140 + i * 11,
          desc: "How much he can take before it starts to tell. It does not make him safe." },
        { id: "dmg",   name: "Damage",          art: "bust",  unit: "pwr",
          val: (i) => 160 + i * 14,
          desc: "Raw punching power behind every shot that lands clean." },
        { id: "cc",    name: "Critical Chance", art: "glove", unit: "%",
          val: (i) => (4 + i * 0.9).toFixed(1),
          desc: "How often a punch catches flush instead of partly on the guard." },
        { id: "cd",    name: "Critical Damage", art: "glove", unit: "x",
          val: (i) => (1.40 + i * 0.06).toFixed(2),
          desc: "What a flush punch is worth when it does catch him clean." },
        { id: "sta",   name: "Stamina",         art: "lungs", unit: "sta",
          val: (i) => 100 + i * 10,
          desc: "Engine. Decides whether the twelfth round looks like the first." },
        { id: "reach", name: "Reach",           art: "arm",   unit: "cm",
          val: (i) => (176.0 + i * 0.8).toFixed(1),
          desc: "Span from knuckle to knuckle. Grows slowly — a grade is a centimetre, not a foot." },
        { id: "ctrl",  name: "Body Control",    art: "full",  unit: "ctl",
          val: (i) => 110 + i * 8,
          desc: "Balance, footing and the ability to move his head off the line on the way out." },
      ];
      const upLevel = (id) => (P && P.up && P.up[id] != null) ? P.up[id] : GRADE_START;
      function upAverage() {
        const sum = UP_TRACKS.reduce((a, t) => a + upLevel(t.id), 0);
        return sum / UP_TRACKS.length;
      }

      /* ── parametric art ──────────────────────────────────────── */
      const SKIN = "#e0a478", SKIN2 = "#bd7e56", SKIN3 = "#8f5737", SKINH = "#ffd2a8";
      function artBlock(ctx) {
        return (X, Y, W, H, c) => {
          ctx.fillStyle = c;
          ctx.fillRect(Math.round(X), Math.round(Y), Math.max(1, Math.round(W)), Math.max(1, Math.round(H)));
        };
      }
      /* n: 0..1 normalised rank for each of the three build stats.
         He is a boxer in kit, not an anatomy mannequin: vest, shorts,
         wraps and a face. The build still reads - damage widens the
         shoulders and arms, durability thickens him, speed cuts the
         waist and sharpens the definition - but on a person. */
      function drawBust(ctx, W, H, spd, dur, dmg, full) {
        const b = artBlock(ctx);
        const cx = W * .5;
        const VEST = "#9d2b22", VEST2 = "#c2402f", VEST3 = "#6e1b15";
        const SHORT = "#243247", SHORT2 = "#32455f", WRAP = "#e4e8ee";
        /* vertical landmarks */
        const headTop = full ? H * .05 : H * .09;
        const headH   = full ? H * .13 : H * .19;
        const headW   = (full ? W * .13 : W * .18) * (1 + dur * .06);
        const neckY   = headTop + headH;
        const shY     = neckY + (full ? H * .035 : H * .05);
        const waistY  = full ? H * .50 : H * .74;
        const hipY    = full ? H * .57 : H * .86;
        const halfSh  = W * (full ? .15 : .20) * (1 + dmg * .38 + dur * .14);
        const halfWa  = W * (full ? .105 : .14) * (1 + dur * .30 - spd * .16);
        const armW    = W * (full ? .045 : .060) * (1 + dmg * .45 + dur * .18);

        /* ── torso: shoulders tapering to the waist ── */
        const steps = 12;
        for (let i = 0; i < steps; i++) {
          const k = i / (steps - 1);
          const hw = halfSh + (halfWa - halfSh) * Math.pow(k, .8);
          const y = shY + k * (waistY - shY);
          b(cx - hw, y, hw * 2, (waistY - shY) / steps + 2, SKIN2);
        }
        /* trapezius slope into the neck */
        b(cx - halfSh * .62, shY - H * .018, halfSh * 1.24, H * .03, SKIN2);
        /* ── the vest ── */
        const vTop = shY + (waistY - shY) * .30;
        for (let i = 0; i < steps; i++) {
          const k = i / (steps - 1);
          const y = vTop + k * (waistY - vTop);
          const kk = (vTop - shY + k * (waistY - vTop)) / (waistY - shY);
          const hw = (halfSh + (halfWa - halfSh) * Math.pow(kk, .8)) * .94;
          b(cx - hw, y, hw * 2, (waistY - vTop) / steps + 2, i < 5 ? VEST2 : VEST);
        }
        /* straps over the shoulders, framing a scoop neck */
        for (const s of [-1, 1]) {
          b(cx + s * halfSh * .66 - (s < 0 ? halfSh * .24 : 0), shY - H * .012,
            halfSh * .24, vTop - shY + H * .02, VEST);
        }
        b(cx - halfSh * .42, vTop - H * .012, halfSh * .84, H * .02, VEST3);
        /* chest above the vest line, bulkier with damage */
        for (const s of [-1, 1]) {
          b(cx + s * halfSh * .10 - (s < 0 ? halfSh * .40 : 0), shY + H * .025,
            halfSh * .40, (vTop - shY) * .62, SKINH);
        }
        b(cx - W * .004, shY + H * .025, W * .008, (vTop - shY) * .7, SKIN3);
        /* speed shows as a cut waist and a visible rib line */
        if (spd > .35) {
          b(cx - halfWa * .78, waistY - H * .035, halfWa * 1.56, H * .006, SKIN3);
        }
        /* ── shorts, with a waistband ── */
        b(cx - halfWa * 1.10, waistY, halfWa * 2.20, H * .022, WRAP);
        b(cx - halfWa * 1.14, waistY + H * .020, halfWa * 2.28, hipY - waistY, SHORT);
        b(cx - halfWa * 1.02, waistY + H * .030, halfWa * 1.1, (hipY - waistY) * .8, SHORT2);

        /* ── arms, joined at the shoulder, wrapped at the wrist ── */
        const armTop = shY - H * .005, armBot = waistY + H * .03;
        for (const s of [-1, 1]) {
          const ax = cx + s * halfSh - (s < 0 ? armW : 0);
          b(ax, armTop, armW, armBot - armTop, SKIN2);
          b(ax + armW * .18, armTop + H * .02, armW * .5, (armBot - armTop) * .76, SKIN);
          /* deltoid cap and bicep swell */
          b(ax - armW * .06, armTop, armW * 1.12, H * .05 * (1 + dmg * .5), SKIN2);
          if (dmg > .18) b(ax + armW * .08, armTop + H * .055, armW * .8,
                           (armBot - armTop) * (.22 + dmg * .16), SKINH);
          /* hand wraps */
          b(ax - armW * .06, armBot - H * .045, armW * 1.12, H * .048, WRAP);
          for (let i = 0; i < 3; i++)
            b(ax - armW * .06, armBot - H * .040 + i * H * .014, armW * 1.12, H * .005, "#b9c2cc");
        }

        /* ── head and face ── */
        const hx = cx - headW / 2, hy = headTop;
        b(cx - headW * .22, neckY - H * .022, headW * .44, H * .05, SKIN2);        /* neck */
        b(hx, hy + headH * .18, headW, headH * .70, SKIN2);                        /* skull */
        b(hx + headW * .08, hy + headH * .24, headW * .84, headH * .58, SKIN);
        b(hx + headW * .14, hy + headH * .74, headW * .72, headH * .18, SKIN2);    /* jaw */
        b(hx + headW * .04, hy + headH * .06, headW * .92, headH * .22, "#1d1711"); /* hair */
        b(hx, hy + headH * .22, headW * .10, headH * .26, "#1d1711");
        b(hx + headW * .90, hy + headH * .22, headW * .10, headH * .26, "#1d1711");
        b(hx + headW * .22, hy + headH * .10, headW * .34, headH * .06, "#2e2619");
        /* brow, eyes, nose, mouth - a face, not two dots */
        b(hx + headW * .14, hy + headH * .34, headW * .72, headH * .07, SKIN3);
        for (const s of [0, 1]) {
          const ex = hx + headW * (s ? .56 : .18);
          b(ex, hy + headH * .43, headW * .26, headH * .11, "#f3ead8");
          b(ex + headW * .09, hy + headH * .44, headW * .10, headH * .09, "#241a12");
          b(ex + headW * .10, hy + headH * .45, headW * .04, headH * .035, "#4b7f9c");
          b(ex, hy + headH * .41, headW * .26, headH * .025, "#1d1711");
        }
        b(cx - headW * .06, hy + headH * .52, headW * .12, headH * .14, SKIN2);    /* nose */
        b(cx - headW * .08, hy + headH * .64, headW * .16, headH * .035, SKIN3);
        b(cx - headW * .18, hy + headH * .74, headW * .36, headH * .05, "#7d3f31"); /* mouth */
        b(cx - headW * .14, hy + headH * .755, headW * .28, headH * .02, "#5d2a20");
        return { cx, waist: halfWa, bottom: hipY };
      }

      function drawFullFigure(ctx, W, H, spd, dur, dmg, ctrl) {
        const b = artBlock(ctx);
        const t = drawBust(ctx, W, H, spd, dur, dmg, true);
        const legW = W * (.062 + dur * .030);
        const hipY = t.bottom;
        const stance = W * (.050 + ctrl * .055);
        const bootTop = hipY + H * .255;
        for (const side of [-1, 1]) {
          const lx = t.cx + side * stance - legW / 2;
          b(lx, hipY, legW, H * .27, SKIN2);                       /* leg */
          b(lx + legW * .2, hipY + H * .02, legW * .5, H * .20, SKIN);
          if (dur > .3) b(lx + legW * .08, hipY + H * .03, legW * .84, H * .09 * dur, SKINH);
          b(lx - legW * .12, bootTop, legW * 1.24, H * .055, "#1b2430");   /* boot */
          b(lx - legW * .06, bootTop + H * .008, legW * 1.12, H * .016, "#2b3744");
          for (let i = 0; i < 2; i++)
            b(lx - legW * .06, bootTop + H * .022 + i * H * .013, legW * 1.12, H * .005, "#e4e8ee");
        }
        /* balance line: tighter and brighter the more control he has */
        const bw = W * (.34 - ctrl * .12);
        ctx.fillStyle = "rgba(232,194,114," + (.18 + ctrl * .5).toFixed(2) + ")";
        ctx.fillRect(Math.round(t.cx - bw / 2), Math.round(bootTop + H * .07), Math.round(bw), 2);
        for (let i = 0; i < 3; i++) {
          const o = bw / 2 - i * (bw / 6);
          b(t.cx - o, bootTop + H * .078, 2, H * .012, "rgba(232,194,114,.45)");
          b(t.cx + o, bootTop + H * .078, 2, H * .012, "rgba(232,194,114,.45)");
        }
      }
      function drawGloveArt(ctx, W, H, chance, power) {
        const b = artBlock(ctx);
        const cx = W * .52, cy = H * .5;
        const gw = W * (.30 + power * .14), gh = H * (.42 + power * .16);
        const GL = "#cc3728", GL2 = "#941d14", GL3 = "#5f0f0a", GLH = "#ef6e59", LAC = "#f2e3c4";
        /* wrist wrap */
        b(cx - gw * .22, cy + gh * .34, gw * .5, gh * .34, "#2b3440");
        b(cx - gw * .18, cy + gh * .38, gw * .42, gh * .24, "#3a4654");
        /* cuff and body */
        b(cx - gw * .55, cy + gh * .18, gw * 1.1, gh * .3, GL3);
        b(cx - gw * .5, cy - gh * .5, gw, gh * .78, GL2);
        b(cx - gw * .42, cy - gh * .42, gw * .84, gh * .6, GL);
        b(cx - gw * .34, cy - gh * .36, gw * .38, gh * .26, GLH);
        /* thumb */
        b(cx - gw * .62, cy - gh * .04, gw * .24, gh * .3, GL2);
        b(cx - gw * .58, cy, gw * .16, gh * .22, GL);
        /* laces */
        b(cx + gw * .1, cy - gh * .34, gw * .07, gh * .5, LAC);
        for (let i = 0; i < 4; i++) b(cx + gw * .02, cy - gh * .3 + i * gh * .13, gw * .23, gh * .035, LAC);
        /* critical chance shows as a brighter, studded knuckle line */
        const studs = Math.round(2 + chance * 6);
        for (let i = 0; i < studs; i++) {
          const sx = cx - gw * .38 + i * (gw * .76 / Math.max(1, studs - 1));
          b(sx, cy - gh * .50, gw * .05, gh * .07, "#ffe9a8");
        }
        /* critical damage shows as impact rings coming off the knuckles */
        if (power > .15) {
          ctx.strokeStyle = `rgba(255,226,168,${(.25 + power * .5).toFixed(2)})`;
          ctx.lineWidth = Math.max(1, H * .008);
          for (let i = 0; i < Math.round(1 + power * 3); i++) {
            ctx.beginPath();
            ctx.arc(cx, cy - gh * .1, gw * (.62 + i * .17), -1.1, 1.1);
            ctx.stroke();
          }
        }
      }
      function drawLungs(ctx, W, H, lvl) {
        const b = artBlock(ctx);
        const cx = W * .5, cy = H * .48;
        const s = 1 + lvl * .26;                        /* capacity */
        const lw = W * .19 * s, lh = H * .34 * s;
        const hue = ["#9f5a62", "#b9666f", "#cf737c", "#e3838c"][Math.min(3, Math.floor(lvl * 4))];
        /* trachea and bronchi */
        b(cx - W * .022, cy - lh * .86, W * .044, lh * .42, "#c9a9ad");
        for (let i = 0; i < 4; i++) b(cx - W * .03, cy - lh * .8 + i * lh * .1, W * .06, lh * .035, "#a98a8e");
        b(cx - lw * .5, cy - lh * .5, lw, lh * .1, "#c9a9ad");
        for (const side of [-1, 1]) {
          const lx = cx + side * W * .035;
          const x0 = side < 0 ? lx - lw : lx;
          b(x0, cy - lh * .5, lw, lh, hue);
          b(x0 + lw * .12, cy - lh * .42, lw * .6, lh * .7, "#eb98a0");
          /* lobe lines */
          for (let i = 1; i < 3; i++) b(x0, cy - lh * .5 + i * lh * .33, lw, lh * .03, "#8e4f56");
          /* the deeper the capacity the more alveolar texture shows */
          for (let i = 0; i < Math.round(4 + lvl * 10); i++) {
            const px = x0 + rnd(i * 3.1 + side) * lw * .8 + lw * .1;
            const py = cy - lh * .4 + rnd(i * 5.3 + side) * lh * .75;
            b(px, py, Math.max(1, W * .008), Math.max(1, W * .008), "rgba(255,210,214,.5)");
          }
        }
        /* capacity scale under the lungs */
        const bw = W * .36;
        b(cx - bw / 2, cy + lh * .62, bw, H * .018, "#2a3240");
        b(cx - bw / 2, cy + lh * .62, bw * (.18 + lvl * .82), H * .018, "#6fcf5e");
      }
      function drawArmArt(ctx, W, H, lvl) {
        const b = artBlock(ctx);
        const cy = H * .46;
        /* shoulder anchored left; the arm itself lengthens with reach */
        const sx = W * .13;
        const len = W * (.44 + lvl * .30);
        const th = H * (.12 + lvl * .035);
        b(sx - W * .06, cy - th * .9, W * .13, th * 1.8, SKIN2);      /* shoulder */
        b(sx - W * .04, cy - th * .7, W * .09, th * 1.4, SKIN);
        b(sx, cy - th / 2, len * .52, th, SKIN2);                      /* upper arm */
        b(sx, cy - th * .34, len * .5, th * .62, SKIN);
        if (lvl > .2) b(sx + len * .08, cy - th * .62, len * .22, th * (.5 + lvl * .4), SKINH);
        const ex = sx + len * .52;
        b(ex - W * .012, cy - th * .62, W * .034, th * 1.24, SKIN3);  /* elbow */
        b(ex, cy - th * .42, len * .48, th * .84, SKIN2);              /* forearm */
        b(ex, cy - th * .28, len * .46, th * .5, SKIN);
        /* wrap and fist at the end */
        const fx = sx + len;
        b(fx - W * .02, cy - th * .5, W * .05, th, "#2b3440");
        b(fx + W * .02, cy - th * .66, W * .10, th * 1.32, "#cc3728");
        b(fx + W * .035, cy - th * .5, W * .07, th, "#ef6e59");
        /* measuring rule beneath, so the centimetres are legible */
        const ry = cy + H * .26;
        b(sx - W * .06, ry, len + W * .18, H * .012, "#3a4454");
        for (let i = 0; i <= 10; i++) {
          const tx = sx - W * .06 + (len + W * .18) * (i / 10);
          b(tx, ry - H * .018, Math.max(1, W * .004), H * .018, i % 5 ? "#6b7786" : "#e8c272");
        }
      }

      /* ── SKILLS ──────────────────────────────────────────────────
         Three currencies do different jobs. Experience raises your
         coach level. Skill points unlock a skill for the first time.
         Gold raises a skill you already own. A skill is only worth
         unlocking if it does something, so every one of these is read
         by Street Fight, and the punches and guard feed the bout
         simulation's starting attributes too. */
      const SKILL_CATS = ["Punches", "Defence", "Movement", "Combos", "Special"];
      const SKILLS = [
        { id: "jab",   cat: "Punches", name: "Jab",           sp: 0, max: 6, base: 260,
          desc: "The range finder. Fast, cheap, and how most rounds are actually won.",
          per: (l) => ({ dmg: 4 + l * 1.6, spd: 1 + l * .05 }),
          note: (l) => `${(4 + l * 1.6).toFixed(1)} damage · ${(1 + l * .05).toFixed(2)}x hand speed` },
        { id: "cross", cat: "Punches", name: "Cross",         sp: 1, max: 6, base: 380, req: "jab",
          desc: "The straight power hand behind the jab.",
          per: (l) => ({ dmg: 9 + l * 2.6 }),
          note: (l) => `${(9 + l * 2.6).toFixed(1)} damage` },
        { id: "lhook", cat: "Punches", name: "Left Hook",     sp: 2, max: 6, base: 520, req: "cross",
          desc: "A short arc to the side of the head. Hard to see coming.",
          per: (l) => ({ dmg: 12 + l * 3.1, stun: .04 + l * .012 }),
          note: (l) => `${(12 + l * 3.1).toFixed(1)} damage · ${Math.round((.04 + l * .012) * 100)}% stagger` },
        { id: "upper", cat: "Punches", name: "Uppercut",      sp: 3, max: 6, base: 700, req: "lhook",
          desc: "Up the middle. The shot that snaps a head back.",
          per: (l) => ({ dmg: 16 + l * 4.0, stun: .08 + l * .018 }),
          note: (l) => `${(16 + l * 4).toFixed(1)} damage · ${Math.round((.08 + l * .018) * 100)}% stagger` },

        { id: "guard", cat: "Defence", name: "High Guard",    sp: 1, max: 6, base: 300,
          desc: "Hands up. Takes the force on the gloves instead of the head.",
          per: (l) => ({ soak: .12 + l * .055 }),
          note: (l) => `${Math.round((.12 + l * .055) * 100)}% of incoming damage absorbed` },
        { id: "slip",  cat: "Defence", name: "Slip",          sp: 2, max: 5, base: 460, req: "guard",
          desc: "Move the head off the centre line so the shot passes.",
          per: (l) => ({ evade: .06 + l * .028 }),
          note: (l) => `${Math.round((.06 + l * .028) * 100)}% chance to make them miss` },
        { id: "roll",  cat: "Defence", name: "Shoulder Roll", sp: 3, max: 4, base: 640, req: "slip",
          desc: "Ride the hook on the shoulder and come back up in range.",
          per: (l) => ({ evade: .04 + l * .022, soak: .05 + l * .02 }),
          note: (l) => `${Math.round((.04 + l * .022) * 100)}% evade · ${Math.round((.05 + l * .02) * 100)}% soak` },

        { id: "step",  cat: "Movement", name: "Footwork",     sp: 1, max: 6, base: 280,
          desc: "Cover ground without crossing your feet.",
          per: (l) => ({ move: 1 + l * .11 }),
          note: (l) => `${(1 + l * .11).toFixed(2)}x movement speed` },
        { id: "burst", cat: "Movement", name: "Burst Step",   sp: 2, max: 5, base: 520, req: "step",
          desc: "A short explosive step that closes or breaks distance.",
          per: (l) => ({ dash: .9 + l * .16 }),
          note: (l) => `${(.9 + l * .16).toFixed(2)}x dash distance` },

        { id: "onetwo", cat: "Combos", name: "One-Two",       sp: 2, max: 5, base: 560, req: "cross",
          desc: "Jab and cross as one motion. The second lands because the first went.",
          per: (l) => ({ chain: 2, combo: 1.12 + l * .07 }),
          note: (l) => `2-punch chain at ${(1.12 + l * .07).toFixed(2)}x damage` },
        { id: "triple", cat: "Combos", name: "Triple Threat", sp: 4, max: 4, base: 880, req: "onetwo",
          desc: "Jab, cross, hook. Three shots before he resets his guard.",
          per: (l) => ({ chain: 3, combo: 1.22 + l * .09 }),
          note: (l) => `3-punch chain at ${(1.22 + l * .09).toFixed(2)}x damage` },

        { id: "counter", cat: "Special", name: "Counter Window", sp: 4, max: 4, base: 950, req: "slip",
          desc: "Make him miss and the gap he leaves is yours for a moment.",
          per: (l) => ({ counter: 1.3 + l * .22 }),
          note: (l) => `${(1.3 + l * .22).toFixed(2)}x damage right after an evade` },
        { id: "hay",     cat: "Special", name: "Haymaker",      sp: 5, max: 3, base: 1300, req: "upper",
          desc: "Everything behind one shot. Slow, obvious, and it ends things.",
          per: (l) => ({ dmg: 34 + l * 11, wind: 1 }),
          note: (l) => `${34 + l * 11} damage · long wind-up` },
      ];
      const skillById = (id) => SKILLS.find((s) => s.id === id);
      const skLevel = (id) => (P && P.skills && P.skills[id]) || 0;
      const skOwned = (id) => skLevel(id) > 0;
      const skCost = (s) => Math.round(s.base * Math.pow(1.48, Math.max(0, skLevel(s.id) - 1)));
      const skLocked = (s) => s.req && !skOwned(s.req);
      /* aggregate everything the player owns into one set of numbers the
         modes can read without knowing about the tree */
      function skillStats() {
        const out = { dmg: 0, spd: 1, soak: 0, evade: 0, move: 1, dash: 0,
                      chain: 1, combo: 1, counter: 1, stun: 0, punches: [] };
        for (const s of SKILLS) {
          const l = skLevel(s.id);
          if (!l) continue;
          const p = s.per(l);
          if (p.dmg) { out.dmg += p.dmg; out.punches.push({ id: s.id, name: s.name, dmg: p.dmg, stun: p.stun || 0, wind: p.wind || 0 }); }
          if (p.spd) out.spd *= p.spd;
          if (p.soak) out.soak += p.soak;
          if (p.evade) out.evade += p.evade;
          if (p.move) out.move *= p.move;
          if (p.dash) out.dash = Math.max(out.dash, p.dash);
          if (p.chain) out.chain = Math.max(out.chain, p.chain);
          if (p.combo) out.combo = Math.max(out.combo, p.combo);
          if (p.counter) out.counter = Math.max(out.counter, p.counter);
          if (p.stun) out.stun += p.stun;
        }
        out.soak = Math.min(.70, out.soak);
        out.evade = Math.min(.55, out.evade);
        if (!out.punches.length) out.punches.push({ id: "jab", name: "Jab", dmg: 4, stun: 0, wind: 0 });
        return out;
      }
      function ensureSkills() {
        if (!P) loadProfile();
        if (!P.skills) { P.skills = { jab: 1 }; saveProfile(); }       /* the jab is free */
        if (P.sp == null) { P.sp = 3; saveProfile(); }                  /* three to start with */
      }
      function unlockSkill(id) {
        const s = skillById(id);
        if (!s || skOwned(id)) return false;
        if (skLocked(s)) return gateToast("Unlock " + skillById(s.req).name + " first."), false;
        if (P.sp < s.sp) return gateToast("Need " + s.sp + " skill point" + (s.sp === 1 ? "" : "s") + "."), false;
        P.sp -= s.sp;
        P.skills[id] = 1;
        saveProfile();
        gateToast(s.name + " unlocked.");
        return true;
      }
      function upgradeSkill(id) {
        const s = skillById(id);
        if (!s || !skOwned(id)) return false;
        if (skLevel(id) >= s.max) return gateToast(s.name + " is maxed."), false;
        const c = skCost(s);
        if (P.gold < c) return gateToast("Need " + c.toLocaleString() + " gold."), false;
        P.gold -= c;
        P.skills[id] = skLevel(id) + 1;
        saveProfile();
        refreshLobbyCard();
        return true;
      }

      /* ── SKILL TREE SCREEN ───────────────────────────────────── */
      let skSel = "jab";
      function renderSkillTree(host, panel, onChange) {
        ensureSkills();
        host.innerHTML = SKILL_CATS.map((cat) => `
          <div class="sk-cat">${cat}</div>
          <div class="sk-row">
            ${SKILLS.filter((s) => s.cat === cat).map((s) => {
              const l = skLevel(s.id), locked = skLocked(s), owned = l > 0;
              const state = owned ? "own" : locked ? "lock" : "open";
              return `<button class="sk-node ${state} ${s.id === skSel ? "sel" : ""}" data-sk="${s.id}" type="button">
                <b>${escapeUI(s.name)}</b>
                <s>${owned ? "Lv " + l + " / " + s.max : locked ? "Needs " + escapeUI(skillById(s.req).name) : s.sp + " SP"}</s>
                ${owned ? `<i class="sk-pips">${Array.from({ length: s.max }, (_, i) =>
                  `<u class="${i < l ? "on" : ""}"></u>`).join("")}</i>` : ""}
              </button>`;
            }).join("")}
          </div>`).join("");
        host.querySelectorAll("[data-sk]").forEach((bn) =>
          bn.addEventListener("click", () => { skSel = bn.dataset.sk; onChange(); }));

        const s = skillById(skSel) || SKILLS[0];
        const l = skLevel(s.id), owned = l > 0, locked = skLocked(s), maxed = l >= s.max;
        const cost = skCost(s);
        panel.innerHTML = `
          <div class="sk-head"><span>${s.cat}</span><h3>${escapeUI(s.name)}</h3></div>
          <p class="sk-desc">${escapeUI(s.desc)}</p>
          <div class="sk-now">
            <div><u>Now</u><b>${owned ? escapeUI(s.note(l)) : "Locked"}</b></div>
            ${owned && !maxed ? `<div><u>Level ${l + 1}</u><b class="up">${escapeUI(s.note(l + 1))}</b></div>` : ""}
          </div>
          ${locked
            ? `<div class="sk-gate">Unlock <b>${escapeUI(skillById(s.req).name)}</b> first.</div>`
            : !owned
              ? `<button class="sk-buy sp" id="sk-act" type="button">Unlock &middot; ${s.sp} SP</button>`
              : maxed
                ? `<div class="sk-gate">Fully upgraded.</div>`
                : `<button class="sk-buy" id="sk-act" type="button">${COIN_SVG}Upgrade &middot; ${cost.toLocaleString()}</button>`}`;
        const act = panel.querySelector("#sk-act");
        if (act) act.addEventListener("click", () => {
          const did = owned ? upgradeSkill(s.id) : unlockSkill(s.id);
          if (did) onChange();
        });
      }

      /* ── GEAR UP SCREEN ──────────────────────────────────────── */
      const GEAR_RAIL = [
        { id: "upgrades", label: "Upgrades", live: true },
        { id: "skills",   label: "Skills", live: true },
        { id: "perks",    label: "Perks" },
        { id: "artifacts",label: "Artifacts" },
        { id: "prestige", label: "Prestige" },
        { id: "loadouts", label: "Loadouts" },
        { id: "craft",    label: "Craft" },
      ];
      const UP_ICONS = {
        spd:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 8h10M3 12h7M3 16h11"/><path d="M14 5l6 7-6 7"/></svg>`,
        dur:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2.6 20.5 6v6.4c0 5-3.6 8-8.5 9.5-4.9-1.5-8.5-4.5-8.5-9.5V6z"/></svg>`,
        dmg:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M13 2 4.5 13H11l-1 9 9.5-11.5H13z"/></svg>`,
        cc:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.2"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/></svg>`,
        cd:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2.4 14.7 9 21.6 9.6 16.4 14 18 20.8 12 17.2 6 20.8 7.6 14 2.4 9.6 9.3 9z"/></svg>`,
        sta:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3v7"/><path d="M12 10c0-3-7-2-7 3.5S8 21 10 21s2-4 2-7"/><path d="M12 10c0-3 7-2 7 3.5S16 21 14 21s-2-4-2-7"/></svg>`,
        reach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M2 12h16"/><path d="M14 7l5 5-5 5"/><path d="M2 7v10"/></svg>`,
        ctrl:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="2.6"/><path d="M12 8v7M7 11h10M9 21l3-6 3 6"/></svg>`,
      };
      let gearRail = "upgrades", gearSel = "spd";

      function closeGear() { document.querySelectorAll(".gearup").forEach((n) => n.remove()); }
      function openGear() {
        if (!P) loadProfile();
        if (!P.up) { P.up = {}; UP_TRACKS.forEach((t) => { P.up[t.id] = GRADE_START; }); saveProfile(); }
        closeGear();
        const el = document.createElement("div");
        el.className = "gearup";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Gear up");
        el.innerHTML = `
          <div class="gu-head">
            <div class="gu-title" id="gu-title">Gear Up</div>
            <div class="mk-purse">
              <div><span id="gu-sp"></span><b class="gu-spchip">SP</b></div>
              <div><span id="gu-gold"></span>${COIN_SVG}</div>
            </div>
            <button class="gu-close" type="button" aria-label="Close">&times;</button>
          </div>
          <div class="mk-rule"></div>
          <div class="gu-body" id="gu-body">
            <div class="gu-left">
              <div class="gu-rail" id="gu-rail"></div>
              <div class="gu-picker" id="gu-picker"></div>
            </div>
            <div class="gu-art"><canvas id="gu-canvas" aria-hidden="true"></canvas></div>
            <div class="gu-panel" id="gu-panel"></div>
          </div>
          <div class="gu-body sk-body" id="sk-body" hidden>
            <div class="gu-left"><div class="gu-rail" id="sk-rail"></div></div>
            <div class="sk-tree" id="sk-tree"></div>
            <div class="gu-panel" id="sk-panel"></div>
          </div>`;
        document.body.appendChild(el);

        const cv = $("#gu-canvas"), cx2 = cv.getContext("2d");
        function paintArt() {
          const r = cv.parentElement.getBoundingClientRect();
          const w = Math.max(120, Math.min(360, Math.round((r.width || 320) / 2.4)));
          const h = Math.max(120, Math.round(w * ((r.height || 360) / Math.max(1, r.width || 320))));
          cv.width = w; cv.height = h;
          cx2.imageSmoothingEnabled = false;
          cx2.clearRect(0, 0, w, h);
          const t = UP_TRACKS.find((x) => x.id === gearSel) || UP_TRACKS[0];
          const nrm = (id) => (upLevel(id) - GRADE_START) / (GRADE_MAX - GRADE_START);
          if (t.art === "bust") {
            /* the bust always shows the real build, with this track leading */
            drawBust(cx2, w, h, nrm("spd"), nrm("dur"), nrm("dmg"), false);
          } else if (t.art === "full") {
            drawFullFigure(cx2, w, h, nrm("spd"), nrm("dur"), nrm("dmg"), nrm("ctrl"));
          } else if (t.art === "glove") {
            drawGloveArt(cx2, w, h, nrm("cc"), nrm("cd"));
          } else if (t.art === "lungs") {
            drawLungs(cx2, w, h, nrm("sta"));
          } else {
            drawArmArt(cx2, w, h, nrm("reach"));
          }
        }
        function renderRail() {
          $("#gu-rail").innerHTML = GEAR_RAIL.map((g) => {
            const tag = g.id === "upgrades"
              ? ` [${GRADES[Math.round(upAverage())]} Grade]` : "";
            return `<button class="gu-railbtn ${g.id === gearRail ? "on" : ""} ${g.live ? "" : "soon"}" data-rail="${g.id}" type="button">${g.label}${tag}</button>`;
          }).join("");
          $("#gu-rail").querySelectorAll("[data-rail]").forEach((bn) =>
            bn.addEventListener("click", () => {
              const g = GEAR_RAIL.find((x) => x.id === bn.dataset.rail);
              if (!g.live) return maintenance(g.id);
              gearRail = g.id; renderAll();
            }));
        }
        function renderPicker() {
          $("#gu-picker").innerHTML = UP_TRACKS.map((t) => {
            const i = upLevel(t.id);
            return `<button class="gu-pick ${t.id === gearSel ? "on" : ""}" data-pick="${t.id}" type="button" title="${t.name}" aria-label="${t.name}">
              ${UP_ICONS[t.id]}<u style="color:${gradeCol(i)}">${GRADES[i]}</u></button>`;
          }).join("");
          $("#gu-picker").querySelectorAll("[data-pick]").forEach((bn) =>
            bn.addEventListener("click", () => { gearSel = bn.dataset.pick; renderAll(); }));
        }
        function renderPanel() {
          const t = UP_TRACKS.find((x) => x.id === gearSel) || UP_TRACKS[0];
          const i = upLevel(t.id), maxed = i >= GRADE_MAX;
          const nx = Math.min(GRADE_MAX, i + 1);
          const cost = upCost(i), pct = successPct(nx), poor = P.gold < cost;
          $("#gu-panel").innerHTML = `
            <h3>${t.name}</h3>
            <div class="gu-step">
              <span class="gu-anvil">${UP_ICONS[t.id]}</span>
              <b style="color:${gradeCol(i)}">[${GRADES[i]}]</b>
              <i>&#9654;</i>
              <b style="color:${maxed ? "#8d97a3" : gradeCol(nx)}">[${maxed ? "MAX" : GRADES[nx]}]</b>
            </div>
            <div class="gu-step val">
              <span>${t.unit === "cm" ? "&#8596;" : "&#9733;"}</span>
              <b>${t.val(i)}${t.unit === "%" || t.unit === "x" ? t.unit : " " + t.unit}</b>
              <i>&#9654;</i>
              <b class="${maxed ? "" : "up"}">${maxed ? "&mdash;" : t.val(nx) + (t.unit === "%" || t.unit === "x" ? t.unit : " " + t.unit)}</b>
            </div>
            <p class="gu-desc">${escapeUI(t.desc)}</p>
            ${maxed ? "" : `<div class="gu-chance ${pct < 100 ? "risky" : ""}">
              Success chance <b>${pct}%</b>${pct < 100 ? " &middot; a failed attempt still costs the gold and leaves the rank where it is" : ""}
            </div>`}
            ${maxed
              ? `<div class="gu-maxed">Maxed</div>`
              : `<button class="gu-buy ${poor ? "poor" : ""}" id="gu-buy" type="button">${COIN_SVG}${cost.toLocaleString()}</button>`}`;
          const buy = $("#gu-buy");
          if (buy) buy.addEventListener("click", () => doUpgrade(t));
        }
        function renderAll() {
          ensureSkills();
          $("#gu-gold").textContent = P.gold.toLocaleString();
          $("#gu-sp").textContent = P.sp;
          const onSkills = gearRail === "skills";
          $("#gu-title").textContent = onSkills ? "Skills" : gearRail === "upgrades" ? "Upgrades" : "Gear Up";
          $("#gu-body").hidden = onSkills;
          $("#sk-body").hidden = !onSkills;
          renderRail();
          if (onSkills) {
            $("#sk-rail").innerHTML = $("#gu-rail").innerHTML;
            $("#sk-rail").querySelectorAll("[data-rail]").forEach((bn) =>
              bn.addEventListener("click", () => {
                const g = GEAR_RAIL.find((x) => x.id === bn.dataset.rail);
                if (!g.live) return maintenance(g.id);
                gearRail = g.id; renderAll();
              }));
            renderSkillTree($("#sk-tree"), $("#sk-panel"), renderAll);
          } else {
            renderPicker(); renderPanel(); paintArt();
          }
        }
        function doUpgrade(t) {
          const i = upLevel(t.id);
          if (i >= GRADE_MAX) return;
          const cost = upCost(i), nx = i + 1, pct = successPct(nx);
          if (P.gold < cost) return gateToast("Not enough gold.");
          P.gold -= cost;
          const ok = Math.random() * 100 < pct;
          if (ok) P.up[t.id] = nx;
          saveProfile();
          renderAll();
          refreshLobbyCard();
          gateToast(ok ? `${t.name} is now ${GRADES[nx]}.` : `${t.name} held at ${GRADES[i]}. The gold is gone.`);
        }
        el.querySelector(".gu-close").addEventListener("click", closeGear);
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape") { closeGear(); document.removeEventListener("keydown", esc); }
        });
        if (window.ResizeObserver) new ResizeObserver(() => paintArt()).observe(cv.parentElement);
        renderAll();
      }

      /* ── MARKET ──────────────────────────────────────────────────
         Three shelves for now. Boosts cost gems, gold costs gems, and
         gems are bought outside the game — there is no payment flow in
         here and nothing collects card details. */
      const DISCORD_NOTE = "Gems are sold through our Discord. Nothing is charged in the game.";
      const POTION = (c1, c2) => `<svg viewBox="0 0 48 64" aria-hidden="true">
        <path d="M19 6h10v11l9 16a13 13 0 0 1-11 25H21A13 13 0 0 1 10 33l9-16z" fill="#0d1119" stroke="${c2}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M13 38h22a12 12 0 0 1-11 18 12 12 0 0 1-11-18z" fill="${c1}"/>
        <ellipse cx="24" cy="38" rx="11" ry="3" fill="${c2}"/>
        <circle cx="19" cy="46" r="2.4" fill="#ffffff" fill-opacity=".45"/>
        <circle cx="28" cy="50" r="1.6" fill="#ffffff" fill-opacity=".35"/>
        <rect x="16" y="2" width="16" height="6" rx="1.5" fill="${c2}"/>
      </svg>`;
      const GEMPILE = (n) => {
        let out = `<svg viewBox="0 0 64 48" aria-hidden="true">`;
        const spots = n === 1 ? [[32, 24, 15]] : n === 2 ? [[24, 27, 13], [42, 20, 10]]
          : [[20, 30, 12], [36, 24, 14], [50, 31, 10]];
        spots.forEach(([x, y, r]) => {
          out += `<path d="M${x} ${y - r} ${x + r} ${y} ${x} ${y + r} ${x - r} ${y}z" fill="#d8402f" stroke="#6d120c" stroke-width="1.6" stroke-linejoin="round"/>
                  <path d="M${x} ${y - r} ${x + r * .45} ${y} ${x} ${y + r} ${x - r * .45} ${y}z" fill="#f2695a"/>`;
        });
        return out + `</svg>`;
      };
      const GOLDPILE = (n) => {
        let out = `<svg viewBox="0 0 64 48" aria-hidden="true">`;
        const spots = n === 1 ? [[32, 26, 14]] : n === 2 ? [[24, 28, 13], [43, 22, 11]]
          : [[19, 31, 12], [34, 25, 14], [49, 32, 11]];
        spots.forEach(([x, y, r]) => {
          out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0a93c" stroke="#8a5f14" stroke-width="1.8"/>
                  <circle cx="${x}" cy="${y}" r="${r * .6}" fill="#f7d070"/>`;
        });
        return out + `</svg>`;
      };
      /* a boost multiplies one of the lobby numbers while it is running */
      const BOOST_DEF = {
        gold: { mult: 2,   label: "Gold",     col: ["#e0a93c", "#8a5f14"] },
        exp:  { mult: 2,   label: "Exp",      col: ["#8f6fd0", "#4c3480"] },
        luck: { mult: 2,   label: "Luck",     col: ["#4fb87a", "#246343"] },
        str:  { mult: 1.5, label: "Strength", col: ["#d8402f", "#6d120c"] },
      };
      const BOOST_SKU = [
        { k: "gold", h: 1, gems: 150 }, { k: "gold", h: 3, gems: 350 },
        { k: "exp",  h: 1, gems: 150 }, { k: "exp",  h: 3, gems: 350 },
        { k: "luck", h: 1, gems: 200 }, { k: "luck", h: 3, gems: 450 },
        { k: "str",  h: 1, gems: 250 }, { k: "str",  h: 3, gems: 550 },
      ];
      const GEM_SKU = [
        { n: 500,   art: 1 }, { n: 2500,  art: 2 }, { n: 10000, art: 3 },
        { n: 25000, art: 3, tag: "Popular" }, { n: 50000, art: 3, tag: "Best deal" },
      ];
      const GOLD_SKU = [
        { n: 25000,  gems: 60 },
        { n: 125000, gems: 250, tag: "Popular" },
        { n: 550000, gems: 950, tag: "Best deal" },
      ];
      const MK_TABS = [
        { id: "boosts", label: "Boosts",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M10 2.5h4v5l4.2 7.6A6.6 6.6 0 0 1 12.5 25h-1A6.6 6.6 0 0 1 5.8 15.1L10 7.5z"/><path d="M6.6 14.5h10.8" /></svg>` },
        { id: "gems", label: "Gems",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.6 21.4 9 12 21.4 2.6 9z"/><path d="M2.6 9h18.8M12 2.6 15.4 9 12 21.4 8.6 9z"/></svg>` },
        { id: "gold", label: "Gold",
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6.6" rx="8.4" ry="3.6"/><path d="M3.6 6.6v4.2c0 2 3.8 3.6 8.4 3.6s8.4-1.6 8.4-3.6V6.6"/><path d="M3.6 10.8V15c0 2 3.8 3.6 8.4 3.6s8.4-1.6 8.4-3.6v-4.2"/></svg>` },
      ];
      let mkTab = "boosts";

      const boostLeft = (k) => {
        const t = P && P.boosts && P.boosts[k];
        return t && t > Date.now() ? t - Date.now() : 0;
      };
      const boostActive = (k) => boostLeft(k) > 0;
      function fmtLeft(ms) {
        const m = Math.ceil(ms / 60000);
        return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
      }
      function closeMarket() { document.querySelectorAll(".market").forEach((n) => n.remove()); }

      function openMarket(tab) {
        if (!P) loadProfile();
        closeMarket();
        mkTab = tab || mkTab || "boosts";
        const el = document.createElement("div");
        el.className = "market";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-label", "Market");
        el.innerHTML = `
          <div class="mk-head">
            <div class="mk-title" id="mk-title"></div>
            <div class="mk-purse">
              <div><span id="mk-gold"></span>${COIN_SVG}</div>
              <div><span id="mk-gems"></span>${GEM_SVG}</div>
            </div>
            <button class="mk-close" type="button" aria-label="Close market">&times;</button>
          </div>
          <div class="mk-rule"></div>
          <div class="mk-body">
            <div class="mk-scroll" id="mk-scroll"></div>
            <div class="mk-rail" role="tablist">
              ${MK_TABS.map((t) => `<button class="mk-railbtn" data-mk="${t.id}" role="tab" aria-label="${t.label}">${t.icon}<b>${t.label}</b></button>`).join("")}
            </div>
          </div>`;
        document.body.appendChild(el);

        const purse = () => {
          $("#mk-gold").textContent = P.gold.toLocaleString();
          $("#mk-gems").textContent = P.gems.toLocaleString();
        };
        function render() {
          const host = $("#mk-scroll");
          $("#mk-title").textContent = "Market";
          el.querySelectorAll(".mk-railbtn").forEach((b) => b.classList.toggle("on", b.dataset.mk === mkTab));
          purse();
          let html = "";
          if (mkTab === "boosts") {
            const running = Object.keys(BOOST_DEF).filter(boostActive);
            html += `<div class="mk-sec"><b>Boosts</b></div>`;
            if (running.length) {
              html += `<div class="mk-active">${running.map((k) =>
                `<i>${BOOST_DEF[k].label} &times;${BOOST_DEF[k].mult} &middot; ${fmtLeft(boostLeft(k))} left</i>`).join("")}</div>`;
            }
            html += `<p class="mk-note">Gold and Exp boosts change what a bout pays. Luck and Strength show on your card but nothing reads them yet.</p>`;
            html += `<div class="mk-grid">` + BOOST_SKU.map((sku, i) => {
              const d = BOOST_DEF[sku.k], poor = P.gems < sku.gems;
              return `<div class="mk-card">
                <div class="mk-art">${POTION(d.col[0], d.col[1])}</div>
                <div class="mk-name">${d.mult}&times; ${d.label} Boost</div>
                <div class="mk-meta">${sku.h} hour${sku.h === 1 ? "" : "s"}${boostActive(sku.k) ? " · stacks on time" : ""}</div>
                <button class="mk-buy gem ${poor ? "poor" : ""}" data-boost="${i}" type="button">${GEM_SVG}${sku.gems.toLocaleString()}</button>
              </div>`;
            }).join("") + `</div>`;
          } else if (mkTab === "gems") {
            html += `<div class="mk-sec"><b>Gems</b></div>`;
            html += `<p class="mk-note">${escapeUI(DISCORD_NOTE)}</p>`;
            html += `<div class="mk-grid">` + GEM_SKU.map((sku) =>
              `<div class="mk-card gemcard${sku.tag ? " best" : ""}">
                <div class="mk-art">${GEMPILE(sku.art)}</div>
                <div class="mk-name">${sku.n.toLocaleString()} Gems</div>
                <div class="mk-meta">${sku.tag || "&nbsp;"}</div>
                <div class="mk-locked">Purchasable through Discord</div>
              </div>`).join("") + `</div>`;
          } else {
            html += `<div class="mk-sec"><b>Gold</b></div>`;
            html += `<p class="mk-note">Gold is bought with gems. Everything here can also be earned by fighting.</p>`;
            html += `<div class="mk-grid">` + GOLD_SKU.map((sku, i) => {
              const poor = P.gems < sku.gems;
              return `<div class="mk-card${sku.tag ? " best" : ""}">
                <div class="mk-art">${GOLDPILE(i + 1)}</div>
                <div class="mk-name">${sku.n.toLocaleString()} Gold</div>
                <div class="mk-meta">${sku.tag || "&nbsp;"}</div>
                <button class="mk-buy gem ${poor ? "poor" : ""}" data-gold="${i}" type="button">${GEM_SVG}${sku.gems.toLocaleString()}</button>
              </div>`;
            }).join("") + `</div>`;
          }
          host.innerHTML = html;

          host.querySelectorAll("[data-boost]").forEach((b) =>
            b.addEventListener("click", () => {
              const sku = BOOST_SKU[Number(b.dataset.boost)], d = BOOST_DEF[sku.k];
              if (P.gems < sku.gems) return gateToast("Not enough gems.");
              P.gems -= sku.gems;
              P.boosts = P.boosts || {};
              const from = Math.max(Date.now(), P.boosts[sku.k] || 0);
              P.boosts[sku.k] = from + sku.h * 3600000;
              saveProfile();
              render();
              gateToast(`${d.mult}× ${d.label} boost active.`);
              if (document.querySelector(".lobby")) refreshLobbyCard();
            }));
          host.querySelectorAll("[data-gold]").forEach((b) =>
            b.addEventListener("click", () => {
              const sku = GOLD_SKU[Number(b.dataset.gold)];
              if (P.gems < sku.gems) return gateToast("Not enough gems.");
              P.gems -= sku.gems; P.gold += sku.n;
              saveProfile(); render();
              gateToast(`${sku.n.toLocaleString()} gold added.`);
              if (document.querySelector(".lobby")) refreshLobbyCard();
            }));
        }
        el.querySelectorAll(".mk-railbtn").forEach((b) =>
          b.addEventListener("click", () => { mkTab = b.dataset.mk; render(); }));
        el.querySelector(".mk-close").addEventListener("click", () => {
          closeMarket();
          if (document.querySelector(".lobby")) refreshLobbyCard();
        });
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape") { closeMarket(); document.removeEventListener("keydown", esc); }
        });
        render();
      }
      /* redraw the lobby's numbers without rebuilding the whole screen */
      function refreshLobbyCard() {
        if (!document.querySelector(".lobby")) return;
        const PM = PMULT();
        const set = (sel, v, k) => {
          const n = document.querySelector(sel);
          if (!n) return;
          n.querySelector("s").textContent = fx(v);
          n.classList.toggle("boosted", boostActive(k));
        };
        set('.lb-mult[data-m="gold"]', PM.gold, "gold");
        set('.lb-mult[data-m="luck"]', PM.luck, "luck");
        set('.lb-mult[data-m="exp"]', PM.exp, "exp");
        set('.lb-mult[data-m="str"]', PM.str, "str");
        const g = $("#lb-gold"), m = $("#lb-gems");
        if (g) g.textContent = P.gold.toLocaleString();
        if (m) m.textContent = P.gems.toLocaleString();
        refreshGymHud();
      }
      /* the gym HUD used to be rendered once when you walked in, so a set
         could end with the card reading 1.25x and the HUD still on Lv 0 */
      function refreshGymHud() {
        const lv = document.querySelector("#gym-lv");
        if (!lv) return;
        lv.textContent = "Lv " + gymLevel("strength") + " \u00b7 +" + gymBonus("strength").toFixed(1) + "x";
        const bar = document.querySelector("#gym-bar");
        if (bar) bar.style.width = gymPct("strength") + "%";
        const sub = document.querySelector("#gym-sub");
        if (sub) sub.textContent = gymInto("strength") + " / " + gymNext("strength")
          + " to the next level \u00b7 you can carry about " + strCap() + " kg";
      }

      /* ── REWARD HOOK ─────────────────────────────────────────────
         Wraps the simulation's own ending so every outcome pays into
         the meta layer, without touching the fight logic itself. */
      function installRewards() {
        if (typeof end !== "function" || end.__wrapped) return;
        const inner = end;
        const wrapped = function (t) {
          const r = grantReward(t);
          const out = inner.apply(this, arguments);
          if (r) {
            const host = $("#m");
            if (host) {
              const card = document.createElement("div");
              card.style.cssText = "margin:12px 0 0;border:2px solid #e8c272;background:rgba(10,13,18,.9);padding:11px 13px;font:700 10.5px/1.6 var(--mono);letter-spacing:.08em;color:#ffeec4";
              card.innerHTML = `<div style="color:#e8c272;letter-spacing:.16em;margin-bottom:5px">CORNER PAYOUT · ${escapeUI(r.label.toUpperCase())} · ${escapeUI(String(r.diff).toUpperCase())}</div>
                <div style="color:#b9c4d0">+${r.gold} gold · +${r.xp} XP${r.sp ? ` · +${r.sp} SP` : ""}${r.gems ? ` · +${r.gems} gems` : ""}${r.levels ? ` · <b style="color:#8ad17e">LEVEL ${P.lv}</b>` : ""}</div>
                ${(t === "towel" || t === "medstop") ? `<div style="margin-top:6px;color:#8ad17e;font-weight:400;font-size:10px;letter-spacing:.04em">Stoppages pay above a win in this game. That is deliberate.</div>` : ""}`;
              host.appendChild(card);
            }
          }
          return out;
        };
        wrapped.__wrapped = true;
        end = wrapped;
      }
      const M = (m) => G.me,
        bar = (l, v, mx, c) =>
          `<div class="mu">${l}</div><div class="bar"><i style="width:${cl((v / mx) * 100, 0, 100)}%;background:${c}"></i></div>`;
      const col = (v, mx) => {
        const q = cl(v / mx, 0, 1);
        return q < .25 ? "#72c7ee" : q < .5 ? "#ffd36a" : q < .75 ? "#ff9a45" : "#f04e3e";
      };
      function diag() {
        const m = G.me,
          l = m.lb,
          s = m.sd,
          N = "rgba(128,128,128,.14)",
          activeBrain = Math.max(...l) > 0 ? l.indexOf(Math.max(...l)) : -1,
          activeTorso = Math.max(...s) > 0 ? s.indexOf(Math.max(...s)) : -1,
          bc = (v, x, i) => i === activeBrain ? col(v, x) : "#263e54",
          tcx = (v, x, i) => i === activeTorso ? col(v, x) : "#263e54";
        const brain = `<svg viewBox="0 0 180 150" role="img" aria-label="Pixel-style sagittal brain diagram with frontal, parietal, temporal, occipital lobes, cerebellum and brainstem" style="width:100%"><defs><clipPath id="brainClip"><path d="M28 73C19 47 34 19 64 11c31-8 70 1 84 24 9 15 6 32-3 43-4 5-9 9-15 12-5 3-8 9-11 18H73c-5-9-10-14-19-18C41 86 32 82 28 73Z"/></clipPath></defs><path d="M28 73C19 47 34 19 64 11c31-8 70 1 84 24 9 15 6 32-3 43-4 5-9 9-15 12-5 3-8 9-11 18H73c-5-9-10-14-19-18C41 86 32 82 28 73Z" fill="#13253a" stroke="#d9e9e7" stroke-width="2"/><g clip-path="url(#brainClip)"><path d="M22 15h55v80H30Z" fill="${bc(l[0], 25, 0)}"/><path d="M76 10h45v64H76Z" fill="${bc(l[2], 25, 2)}"/><path d="M55 70h72v38H55Z" fill="${bc(l[1], 25, 1)}"/><path d="M119 17h42v80h-42Z" fill="${bc(l[3], 25, 3)}"/></g><path d="M74 15c-8 13 3 17-6 27 16 7 8 14 20 20-10 9 2 16-7 28M118 17c-13 8-3 15-12 23 14 5 5 14 12 21" fill="none" stroke="#07111e" stroke-width="2" stroke-dasharray="2 3"/><path d="M89 59c8 1 15 7 16 15-5 9-15 13-24 8-4-8 0-18 8-23Z" fill="${N}" stroke="#d9e9e7"/><path d="M94 80v29c0 8 5 12 12 12h9" fill="none" stroke="#d9e9e7" stroke-width="4"/><path d="M114 99c13-1 25 3 31 12-10 10-25 8-36 1Z" fill="${bc(l[4], 25, 4)}" stroke="#d9e9e7"/><g fill="#e7f1df" font-size="8" font-family="Arial"><text x="33" y="42">FRONTAL</text><text x="80" y="28">PARIETAL</text><text x="69" y="95">TEMPORAL</text><text x="126" y="49">OCCIP.</text><text x="122" y="116">CEREB.</text><text x="112" y="136">STEM</text></g></svg>`;
        const torso = `<svg viewBox="0 0 180 160" role="img" aria-label="Pixel-style anterior torso diagram showing ribs, lungs, heart, liver, stomach and spleen" style="width:100%"><path d="M54 8h72l11 18-8 30 12 26-10 73H49L39 82l12-26-8-30Z" fill="#13253a" stroke="#d9e9e7" stroke-width="2"/><path d="M90 12v62M52 28q38 20 76 0M47 38q43 22 86 0M44 49q46 22 92 0M43 60q47 20 94 0" fill="none" stroke="#8ca8bb" stroke-width="2"/><path d="M75 25c-17 2-24 17-21 34 2 10 8 17 18 19 8-11 9-39 3-53Z" fill="#355d72" stroke="#d9e9e7"/><path d="M105 25c17 2 24 17 21 34-2 10-8 17-18 19-8-11-9-39-3-53Z" fill="#355d72" stroke="#d9e9e7"/><path d="M94 34c10 2 13 10 9 17-5 7-11 7-16 1-4-7-1-15 7-18Z" fill="#d85b58" stroke="#ffe0c7"/><path d="M47 77q23-16 48-7l-5 34q-28 9-45-5Z" fill="${tcx(s[0], 25, 0)}" stroke="#d9e9e7"/><path d="M99 82q18 4 25 19-8 13-25 10-9-13 0-29Z" fill="#b47a55" stroke="#ffe0c7"/><path d="M130 73q16 2 15 16-6 15-19 12-5-15 4-28Z" fill="${tcx(s[1], 25, 1)}" stroke="#d9e9e7"/><path d="M61 121q29 8 58 0" stroke="#8ca8bb" stroke-width="2" fill="none"/><g fill="#e7f1df" font-size="8" font-family="Arial"><text x="49" y="75">LUNG</text><text x="111" y="75">LUNG</text><text x="96" y="52">HEART</text><text x="52" y="99">LIVER</text><text x="99" y="101">STOM.</text><text x="132" y="91">SPLEEN</text><text x="68" y="17">RIB CAGE</text></g></svg>`;
        return `<div class="row2"><div><div class="diagram-label">Brain exposure map</div><div class="anatomy-note">Sagittal orientation · regions are simplified game indicators</div>${brain}${contextTip("brain", "Brain map").replace('class="tip-inline"', 'class="tip-inline diagram-context"')}</div><div><div class="diagram-label">Torso exposure map</div><div class="anatomy-note">Anterior orientation · organ shapes are illustrative</div>${torso}${contextTip("body", "Body map").replace('class="tip-inline"', 'class="tip-inline diagram-context"')}</div></div><div class="mu">${m.cut ? `🩹 Cut ${"●".repeat(m.cut)} ` : ""}${m.eye ? "👁 Eye swollen " : ""}${m.hand ? "✋ Hand sore" : ""}</div><div class="anatomy-legend"><span><i style="background:#72c7ee"></i>LOW · I</span><span><i style="background:#ffd36a"></i>MOD · II</span><span><i style="background:#ff9a45"></i>HIGH · III</span><span><i style="background:#f04e3e"></i>TOP · IV</span></div><div class="diagram-caption">Simulated exposure only—not selective injury, diagnosis, or severity.</div>`;
      }

      function syncInjuryMonitor() {
        if (!G || !G.me) return;
        const m = G.me, panel = $("#injury-monitor");
        if (!panel) return;
        const s = sigs();
        const symptoms = $("#monitor-symptoms");
        const urgentSigns = m.sdh ? "Emergency danger signs: worsening headache, repeated vomiting, seizure or declining alertness after head impact." : F && F.kd ? "Knockdown or dazed / unsteady behavior: suspected concussion; remove from play." : "";
        symptoms.className = "monitor-value " + (urgentSigns ? "danger" : s.length ? "warn" : "safe");
        symptoms.innerHTML = urgentSigns ? escapeUI(urgentSigns) : s.length ? escapeUI(s.slice(0, 2).join(" · ")) + (s.length > 2 ? `<small>+${s.length - 2} more signs</small>` : "") : "No signs shown";
        const head = Math.min(100, Math.round((m.peak || m.head) / 40 * 100));
        const body = Math.min(100, Math.round(m.body / 35 * 100));
        $("#monitor-head-meter").style.width = head + "%";
        $("#monitor-body-meter").style.width = body + "%";
        const fatigue = Math.round(cl(m.fat, 0, 100));
        const fatigueValue = $("#monitor-fatigue-value"), fatigueMeter = $("#monitor-fatigue-meter");
        if (fatigueValue) fatigueValue.textContent = fatigue + "%";
        if (fatigueMeter) {
          fatigueMeter.style.width = fatigue + "%";
          const track = fatigueMeter.parentElement;
          track.setAttribute("aria-valuenow", String(fatigue));
        }
        $("#monitor-head-value").textContent = head ? (m.peak > m.head ? "Peak " + Math.round(m.peak) : "Building") : "No exposure shown";
        $("#monitor-body-value").textContent = body ? "Building" : "No exposure shown";
        const histories = [Math.min(5, Math.ceil(head / 20)), Math.min(5, Math.ceil(body / 20))];
        ["#monitor-head-history", "#monitor-body-history"].forEach((sel, ix) => { $(sel).innerHTML = Array.from({length:5}, (_,i)=>`<i class="${i < histories[ix] ? "on" : ""}"></i>`).join(""); });
        const response = $("#monitor-response");
        const urgent = !!m.sdh;
        const knockdown = !!(F && F.kd);
        const stop = !!(hasConcern() || (F && (F.stopRequired || F.kd)));
        response.className = "monitor-value " + (urgent ? "danger" : stop ? "warn" : "safe");
        response.textContent = urgent ? "URGENT · emergency care" : knockdown ? "SUSPECTED CONCUSSION · stop" : stop ? "STOP CONTACT · assessment" : "Observe · not medical clearance";
        const responseBlock = response.closest(".required-response"), instruction = $("#monitor-response-action");
        if (responseBlock) responseBlock.classList.toggle("is-danger", urgent);
        response.setAttribute("aria-live", urgent ? "assertive" : "polite");
        if (instruction) instruction.textContent = urgent
          ? "Call local emergency services now (119 in South Korea). Stay with the fighter; the game cannot assess an emergency."
          : knockdown
            ? "Remove the fighter from play now. No same-day return; arrange a qualified medical exam."
            : stop
              ? "Stop contact now. Do not return to play; arrange qualified medical assessment. Rest and water are not clearance."
            : "Continue observing. This game-only panel cannot diagnose injury or provide medical clearance.";
        const map = $("#monitor-map"), anatomy = $("#monitor-anatomy");
        if (map && anatomy) { const wasOpen = map.open; anatomy.innerHTML = diag(); map.open = wasOpen; }
        updateTrainingFatigueRule();
      }
      function sigs() {
        const m = G.me,
          s = [];
        if (m.conc) s.push("Delayed headache, light sensitivity or fogginess");
        if (m.fat >= 70) s.push("Heavy breathing, hands dropping");
        if (m.head >= BAL.medical.headStop)
          s.push("Slow to reset guard after head shots");
        if (m.head >= 20 || m.conc) s.push("Unsteady on feet, blank stare");
        if (m.body >= BAL.medical.bodyStop) s.push("Guarding his ribs");
        if (m.cut > 0) s.push("Bleeding above the eye");
        if (m.eye) s.push("Squinting, swelling around the eye");
        if (F && F.kd) s.push("Knockdown or dazed / unsteady behavior: suspected concussion");
        if (m.hand) s.push("Shaking out his right hand");
        if (m.abd && m.body >= 25) s.push("Pale, grimaces when he twists");
        return s;
      }
      const pp = (v) =>
        "▮".repeat(cl(Math.round(v), 0, 10)) +
        "▯".repeat(10 - cl(Math.round(v), 0, 10));
      function toast(t) {
        const e = document.createElement("div");
        e.className = "ts";
        e.textContent = t;
        let y = 0;
        document
          .querySelectorAll(".ts")
          .forEach((x) => (y += x.offsetHeight + 8));
        if (y)
          e.style.top =
            "calc(env(safe-area-inset-top,0px) + " + (12 + y) + "px)";
        document.body.appendChild(e);
        setTimeout(() => e.remove(), 2000);
      }
      document.addEventListener(
        "click",
        (e) => {
          const b = e.target.closest && e.target.closest(".b");
          if (b && !b.disabled && navigator.vibrate) navigator.vibrate(18);
        },
        true,
      );
      function chips() {
        const m = G.me,
          p = G.sn,
          c = [];
        if (p)
          [
                        ["pow", "Power"],
            ["spd", "Speed"],
            ["def", "Defence"],
            ["sta", "Stamina"],
          ].forEach(([k, l]) => {
            const x = Math.round(m[k] - p[k]);
            if (x)
              c.push(
                `<span class="ch ${(k == "fat" ? x > 0 : x < 0) ? "bad" : "good"}">${l} ${x > 0 ? "+" : ""}${x}</span>`,
              );
          });
        G.sn = { pow: m.pow, spd: m.spd, def: m.def, sta: m.sta, fat: m.fat };
        return c.join("");
      }
      function hub() {
        $("#fight-scoreboard").style.display = "none";
        setLandingChrome(true);
        setGamePhase("camp");
        document.body.dataset.s = "h";
        $("#cv").style.display = "none";
        $("#sub").textContent = "";
        const m = G.me,
          o = G.opp,
          L = (G.log = G.log || []),
          ch = chips(),
          d = G.days > 0;
        const T = (f, ic, t, sub, c) => {
          const trainingAction = f.startsWith("tr(") || f == "light()";
          return `<button class="b t ${c || ""}" ${d && (!trainingAction || !hasConcern()) ? "" : "disabled"} onclick="${f}"><span class="ic">${ic}</span><b>${t}</b><small>${sub}</small></button>`;
        };
        const skillKeys = ["pow", "spd", "def", "sta"];
        const trainingBlocked = hasConcern();
        const fatigueOverreach = m.fat + 25 > 85;
        const skillAtCap = (k) => m[k] >= 10;
        const trainingResult = (k) => {
          if (trainingBlocked) return ["locked", "LOCKED · SAFETY FIRST"];
          if (!d) return ["unavailable", "NO CAMP DAYS"];
          if (fatigueOverreach) return ["warning", "NO GAIN · OVERREACH"];
          if (skillAtCap(k)) return ["warning", "MAX · NO GAIN"];
          return ["available", "+1 SKILL"];
        };
        const trainT = (k, ic, t, sub) => {
          const level = Math.max(1, Math.min(10, Math.round(m[k])));
          const [resultClass, resultText] = trainingResult(k);
          return `<div class="training-action">${T("tr('" + k + "')", ic, t, sub)}<div class="training-readout"><div class="training-level-row"><span>GAME SKILL</span><b>${level} / 10</b></div><div class="training-level-meter" role="meter" aria-label="${t} fictional game skill level" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${level}" aria-valuetext="${level} of 10, fictional game skill"><i style="width:${level * 10}%"></i></div><small class="training-result ${resultClass}">${resultText}</small></div></div>`;
        };
        let h = "";
        if (G.msg || ch)
          h += `<div class="c res">${ch ? `<div>${ch}</div>` : ""}${G.msg ? compactMessage(G.msg) : ""}</div>`;
        /* deliberately NOT run through compactMessage — this one is the
           lesson, and compacting it to a single clause would gut it */
        if (G.counter) {
          h += `<div class="c res" style="border-color:var(--wn)"><div class="sl" style="margin-top:0">WHAT WAS ACTUALLY HAPPENING</div>${G.counter}</div>`;
          G.counter = "";
        }
        h += tc(G.tip, "Sports-med tip");

        if (m.sdh)
          h += `<button class="b p" onclick="er()">🚑 Call 119 (South Korea)</button>`;
        h +=
          `<div class="camp-training-menu"><div class="sl">CAMP PLAN · TRAINING &amp; RECOVERY</div><div class="camp-menu-days"><span>CAMP DAYS AVAILABLE</span><strong>${G.days} / 5</strong><small>Training or recovery uses one camp day</small></div>${hasConcern() ? `<div class="training-lock"><span class="lock-mark">🔒</span><div><strong>TRAINING LOCKED</strong><small>Safety concern active. See Fighter Status for the required response.</small></div></div>` : `<div class="training-ready"><span>✓ TRAINING CLEAR IN SIMULATION</span><small>Still watch signs; this is not medical clearance.</small></div>`}${infoButton("Training safely", "Skill gains cost fatigue. Training tired, or adding load too fast, raises injury risk.", "safety")}<div class="g train-grid">${trainT("pow", "💪", "Power", "hit harder")}${trainT("spd", "⚡", "Speed", "hit faster")}${trainT("def", "🛡️", "Defence", "take less")}${trainT("sta", "🫁", "Stamina", "tire slower")}</div>
<div class="camp-recovery"><div class="camp-recovery-heading"><div class="sl">RECOVERY &amp; CHECK</div>${contextTip("recovery", "Recovery · learn")}</div>${hasConcern() ? `<div class="care-open"><strong>CARE PATH OPEN</strong><small>Rest, Observe and available medical treatment actions remain accessible.</small></div>` : ""}<div class="camp-recovery-grid">${T("light()", "🥊", "Light", "recovery only")}${T("rest()", "😴", "Rest", "fatigue −35 only", "s")}${T("med()", "👁", "Observe", "medical check", "s")}${hasConcern() && !G.champ ? T("treat()", "🏥", "Medical treatment", "forfeit · full health", "treatment-option") : ""}</div></div>
</div>
` +
          `${G.postBout ? `<div class="c r post-bout-note"><b>Post-bout check</b><div class="mu">Watch for delayed symptoms. Worsening signs → emergency care (119 in South Korea).</div>${infoButton("Post-bout guidance", "Observe every fighter immediately and again later in a quiet setting. Hours later, headache, nausea, dizziness, light/noise sensitivity or fogginess may appear. Symptoms do not prove a diagnosis. Stop contact and arrange qualified assessment. The game cannot assess or clear anyone. With the training lock above, this is a separate post-bout check and does not control recovery buttons.", "recovery")}</div>` : ""}` +
          (L.length
            ? `<div class="c">${compactDetail("Coach log · " + L.length + " entries", L.map((x) => `<p class="mu">${escapeUI(x)}</p>`).join(""))}</div>`
            : "") +
          `${G.champ ? "" : `<button class="b" onclick="forf()">⏭ Forfeit this bout &amp; rest<small>Forfeit safely · no loss · fatigue recovery only</small></button>`}<button class="b" onclick="cdx()">📖 Medical Codex (${Object.keys(G.cx || {}).length}/${Object.keys(CX).length})</button><button class="b" onclick="cdx(1)">About / limitations &amp; sources</button><div class="fb"><button class="b" style="flex:1" onclick="end('withdraw')">Withdraw</button><button class="b p" style="flex:2" onclick="pre()">Enter the ring ▶<small>Open pre-bout checks</small></button></div>`;
        G.msg = "";
        G.tip = "";
        $("#m").innerHTML = h;
        const phaseSummary = $("#phase-summary");
        if (phaseSummary) { phaseSummary.replaceChildren(); phaseSummary.hidden = true; }
        syncTournamentProgress();
        updateTrainingFatigueRule();
        syncInjuryMonitor();
        window.scrollTo(0, 0);
      }
      function day(msg, k) {
        if (G.me.sdh) return end("sdh");
        G.days--;
        G.msg = msg;
        G.tip = k ? pick(k) : "";
        const pl = msg.replace(/<[^>]+>/g, "");
        (G.log = G.log || []).unshift("Day " + (5 - G.days) + ": " + pl);
        toast("✓ " + pl.split(/\. /)[0].slice(0, 70));
        const m = G.me;
        if (!m.conc) m.head = Math.max(0, m.head - 5);
        m.body = Math.max(0, m.body - 5);
        m.cut = Math.max(0, m.cut - 1);
        m.lb = m.lb.map((v) => v * 0.8);
        m.sd = m.sd.map((v) => v * 0.8);
        hub();
      }
      function tr(k) {
        const m = G.me;
        if (m.hand && k == "pow") {
          m.hd = 3;
          return day(
            "Power work on a sore hand reinjured the knuckle. Rest it and get it checked before loading it.",
            "hand",
          );
        }
        if (hasConcern()) {
          return day(
            "Training is blocked while warning indicators are present. Rest, hydration, or fatigue changes are not treatment or clearance; seek qualified medical assessment.",
            "blocked",
          );
        }
        if (m.abd && rn() < 0.6) return end("hospital");
        if (m.fat + 25 > 85) {
          m.fat = Math.min(100, m.fat + 25);
          unl("load");
          return day(
            "<b class='w'>Overreaching:</b> too much load on a tired body. No gain, higher injury risk. Spikes in training load are a classic cause of illness and injury.",
            "over",
          );
        }
        m[k] = Math.min(10, m[k] + 1);
        m.fat += 25;
        unl("warm");
        if (k == "def") unl("cum");
        if (k == "sta") unl("hyd");
        day(
          "<b>" + SD[k][0] + " session +1.</b> " + SD[k][1],
          m.fat > 60 ? "tired" : k,
        );
      }
      function light() {
        const m = G.me;
        if (hasConcern())
          return day(
            "No training while warning indicators are present. A game action cannot start return-to-sport; follow a healthcare provider-led staged progression.",
            "blocked",
          );
        m.fat += 5;
        day(
          "<b>Light session.</b> Shadowboxing, skipping and mobility at easy effort. It changes game fatigue only; it is not treatment or medical clearance.",
          "light",
        );
      }
      function clearSimulatedHealth() {
        const m = G.me;
        G.dx = false;
        m.head = 0;
        m.body = 0;
        m.conc = false;
        m.cd = 0;
        m.abd = false;
        m.cut = 0;
        m.eye = false;
        m.ed = 0;
        m.hand = false;
        m.hd = 0;
        m.lb = [0, 0, 0, 0, 0];
        m.sd = [0, 0];
      }
      function rest() {
        const m = G.me,
          hadConcern = hasConcern(),
          checked = !!G.checkedForRecovery;
        G.checkedForRecovery = false;
        m.fat = Math.max(0, m.fat - 35);
        if (m.hand && --m.hd <= 0) m.hand = false;
        if (m.eye && --m.ed <= 0) m.eye = false;
        unl("sleep");
        if (checked && hadConcern && !m.sdh && rn() < 0.6) {
          clearSimulatedHealth();
          return day(
            "<b>Rest after medical checkup.</b> The simulation’s 60% recovery roll succeeded, so warning indicators cleared for the next camp view. This is not medical clearance; real return requires qualified care.",
            "dx",
          );
        }
        day(
          "<b>Rest day.</b> Sleep, food and fluids bring fatigue down. A completed medical checkup gives this simulation a 60% chance to clear warning indicators; this roll did not succeed. Rest changes game fatigue only and is not medical treatment or clearance.",
          hadConcern
            ? m.conc || m.head >= BAL.medical.headStop
              ? "restHead"
              : "restHurt"
            : "rest",
        );
      }
      function med() {
        exam("hub");
      }
      function treat() {
        if (!hasConcern() || G.champ) return hub();
        setGamePhase("between-rounds");
        const m = G.me;
        document.body.dataset.s = "h";
        $("#cv").style.display = "none";
        $("#sub").textContent = "Medical treatment";
        $("#m").innerHTML =
          `<div class="c r"><h2>🏥 Medical treatment</h2><div class="essential-warning"><b>Safer option:</b> pull him now, get him checked.</div><ul class="mu"><li>Forfeits this bout — recorded as safe, not a loss.</li><li>Fully resets simulated health for the next bout.</li></ul>${infoButton("Why treatment is the safer call", "Real treatment, clearance and return-to-sport decisions belong to qualified clinicians; the game cannot diagnose or guarantee recovery. CDC guidance says athletes should return only with healthcare-provider approval and supervision, with steps typically taking at least 24 hours, and suspected concussion should be removed from play. See the CDC return-to-sport guidance and the AAN sports-concussion position statement in Sources.", "recovery")}</div><div class="fb"><button class="b" style="flex:1" onclick="hub()">← Keep resting</button><button class="b p treatment-option" style="flex:2" onclick="treatConfirm()">🏥 Confirm treatment<small>Forfeit current bout · full simulated health next bout</small></button></div>`;
        window.scrollTo(0, 0);
      }
      function treatConfirm() {
        if (!hasConcern() || G.champ) return hub();
        const m = G.me;
        clearSimulatedHealth();
        G.checkedForRecovery = false;
        G.cutw = false;
        G.k++;
        G.res.push("M");
        G.days = 5;
        if (G.w + 8 - G.k < 6) return end("qual");
        G.opp = mkOpp(G.k);
        G.msg =
          '<b class="k">Medical treatment chosen.</b> Current bout forfeited as a safety outcome; no loss recorded. Simulated health restored for the next bout.';
        G.tip = pick("forf");
        G.postBout = true;
        hub();
      }

      const CX = {
        conc: [
          "Possible concussion",
          "Concussion is a clinical brain injury; no single symptom proves it. Possible signs include confusion, appearing dazed, balance/vision problems, headache, nausea, or slowed responses, and signs may be delayed. Stop the bout/contact immediately, arrange qualified medical assessment, and do not return to sparring or competition that day. A countdown, rest, hydration, or normal-looking observation cannot clear it.",
        ],
        sdh: [
          "Serious brain injury / emergency warning signs",
          "Worsening headache, repeated vomiting, seizure, declining alertness, inability to wake, confusion, weakness, slurred speech, or unequal pupils after head impact are emergency warning signs; they do not identify a specific diagnosis. Call 119 in South Korea or local emergency services and seek emergency care now. Do not leave the person alone.",
        ],
        abd: [
          "Possible liver or spleen injury",
          "Torso impact followed by abdominal or shoulder pain, dizziness, weakness, pallor, faintness, or worsening symptoms can be concerning; symptoms do not prove an organ injury and may be delayed. Stop activity and seek urgent professional assessment. Emergency symptoms warrant 119 in South Korea. The game cannot diagnose internal injury.",
        ],
        cut: [
          "Cuts and facial injuries",
          "Bleeding, swelling, or a cut affecting vision needs prompt ringside/professional assessment; severe bleeding or eye involvement may require urgent care. Do not rely on a game scenario or home treatment to decide fitness. Follow the event physician and local rules.",
        ],
        eye: [
          "Eye injuries",
          "Pain, swelling, blurred/double vision, or reduced vision after impact warrants stopping activity and prompt professional eye/medical assessment. These symptoms do not prove a specific injury. Sudden vision loss or severe symptoms require emergency care.",
        ],
        hand: [
          "Hand fractures and hand injuries",
          "Pain, swelling, bruising, tenderness, or reduced function after punching can have several causes, including fracture. A break through the neck of the fifth metacarpal — the little-finger knuckle — is so characteristic of punching that it is called a boxer’s fracture. Stop loading the hand and obtain professional assessment; imaging may be considered by a clinician. The game cannot identify a fracture.",
        ],
        base: [
          "What actually injures boxers",
          "The famous injury is not the common one. In professional boxing, injuries run at roughly 17 per 100 boxer-matches, and the breakdown is dominated by the face: facial lacerations about 51%, hand about 17%, eye about 14%, nose about 5%. Amateurs are injured at roughly half the professional rate. Brain injuries — the ones that define the sport’s reputation and this game’s subject — are comparatively rare, and far more consequential when they do happen. Holding both of those facts at once is most of what it means to think about risk properly.",
        ],
        dehy: [
          "Weight cutting and dehydration",
          "Rapid fluid restriction/dehydration can be dangerous and may impair health and performance. Do not use dehydration as a power strategy. Seek qualified sports-medicine and sports-nutrition guidance and use an appropriate weight class.",
        ],
        rtp: [
          "Return to sport after concussion",
          "Only with healthcare-provider approval/supervision, symptom-free at the current step, and typically at least 24 hours per step: (1) regular activities, (2) light aerobic, (3) moderate activity, (4) heavy non-contact training, (5) practice/full contact when appropriate, (6) competition. If symptoms recur, stop, contact the provider, and resume only as directed after symptoms resolve. Combat-sport rules and specialist clearance/suspensions may be stricter. Never use a game countdown as clearance.",
        ],
        screen: [
          "Pre-fight screening and ringside observations",
          "Screening and brief observations cannot rule out every injury or replace a real medical examination. Symptoms or warning signs override reassuring appearance or a normal screen. Suspected concussion means stop and no same-day return. Qualified clinicians make clinical decisions; this game does not diagnose or clear fighters.",
        ],
        warm: [
          "Warm-up and injury prevention",
          "A warm-up that raises heart rate and moves joints through their range (skipping, shadowboxing, dynamic stretches) prepares the body for hard work, and structured warm-up programmes have reduced injuries in several team sports. Long static stretches right before explosive efforts may slightly reduce power, so save them for after training. Finish sessions with easy movement.",
        ],
        load: [
          "Training load and overtraining",
          "Injury and illness risk rises when training load jumps quickly or recovery is skipped. Increase volume and intensity gradually, alternate hard and easy days, and plan lighter weeks. Warning signs of overtraining include lasting fatigue, worse performance, poor sleep, mood changes and frequent illness. If they persist, see a clinician.",
        ],
        sleep: [
          "Sleep and recovery",
          "Most adults need about 7–9 hours of sleep and teenagers need more; athletes’ needs vary and many do better with extra. Habitually sleeping under about 7 hours is linked to more illness and injury and slower reactions. Rest days let muscle, tendon and bone adapt. Rest does not clear a concussion or internal injury.",
        ],
        hyd: [
          "Hydration and fuelling",
          "Fluid lost in sweat reduces strength, focus and heat tolerance. Drink regularly through the day and in small sips during breaks, guided by thirst; avoid both too little and gulping huge amounts. Carbohydrate fuels hard training and protein supports repair. Water does not treat a head injury.",
        ],
        cum: [
          "Repeated head impacts",
          "Brain risk is not only about knockouts. Repetitive head impacts, including ones with no obvious symptoms, are linked to a higher risk of later problems with thinking and mood and, in some people, chronic traumatic encephalopathy (CTE), which can currently only be confirmed after death. Imaging of active fighters over time found thalamic volume falling about 102 mm³ a year in boxers against roughly 58 in MMA fighters, tracking the number of professional bouts and years spent fighting. One finding there is worth sitting with: weekly sparring volume was not significantly associated with smaller volumes in that group — bout exposure carried the signal. How much risk applies to any individual is still genuinely unsettled, and that uncertainty is not a reason to ignore it. Practical protection: technical or light sparring over hard rounds, strong defence, early stoppage and honest symptom reporting.",
        ],
        sic: [
          "Why you can’t “play through” it",
          "Returning to contact before a concussion has resolved can worsen and prolong symptoms, and that on its own is reason enough not to do it. You will often also hear about “second-impact syndrome”, a catastrophic brain swelling supposedly caused by a second blow before recovery — treat that one carefully. A review of 17 published cases judged none of them definite, with only about five involving a proven second impact, and offered diffuse cerebral swelling as the better explanation. The no-same-day-return rule does not need second-impact syndrome to justify it, and a rule propped up by a shaky claim is a rule that falls over the first time somebody checks. “I feel fine” still is not clearance, because symptoms can be hidden or delayed.",
        ],
        gear: [
          "Protective gear: wraps, gloves, mouthguard",
          "Hand wraps and fitted gloves support the wrist and knuckles; they reduce hand injuries but cannot prevent them. A fitted mouthguard protects teeth and lips, but evidence that it reduces concussion is mixed. Headgear reliably reduces cuts and scrapes. On concussion, be careful how you state it: when elite men’s amateur boxing removed head guards, stoppages from head blows fell by roughly 43% while cuts rose more than fivefold — but stoppages were only a surrogate measure, concussion incidence was never directly measured, and a later systematic review found the headgear literature does not adequately capture it. “Headgear prevents concussion” and “removing headgear reduced concussion” both overstate what is actually known.",
        ],
        rib: [
          "Rib and chest injuries",
          "Sharp pain when breathing, twisting or pressing on the ribs after a body shot may mean a bruised or broken rib. It needs assessment, and tight rib wraps are discouraged because they limit breathing. Worsening shortness of breath, chest pain, dizziness or coughing blood needs emergency care: call 119 in South Korea.",
        ],
        fr: [
          "First response to a knockout",
          "If a fighter is knocked out: stop the bout, call for medical help at once, keep the head and neck still unless the airway needs managing, and stay with him. Note what happened and when for the responders. Do not give food, drink or medication, and never let him walk it off. Emergency in South Korea: 119.",
        ],
      };
      const SD = {
        pow: [
          "Power",
          "Heavy bag, medicine-ball throws and strength circuits.",
        ],
        spd: [
          "Speed",
          "Footwork ladders, pad work and short, sharp rounds help you hit faster.",
        ],
        def: [
          "Defence",
          "Slipping, blocking and ring movement with a partner.",
        ],
        sta: ["Stamina", "Roadwork and interval rounds build the engine."],
      };
      const OBS = [
        "Checks orientation and memory (the round, the opponent, recent events) and asks about headache, nausea, dizziness, fogginess or light sensitivity.",
        "Looks at balance and coordination (heel-to-toe stance, walking a straight line) and behaviour: a blank stare, slow answers or acting out of character.",
        "Checks cuts and swelling, plus eye movements, pupils and vision. Double or blurred vision, severe eye pain or a swollen-shut eye need prompt assessment.",
        "Looks for pain, swelling, bruising or weak grip, and whether he can make a fist and move fingers and wrist normally.",
        "Checks ribs and abdomen for tenderness, painful breathing, dizziness, pallor, or left-side or shoulder-tip pain, which can follow a body shot and need urgent care.",
      ];
      const TP = {
        pow: [
          "<b>Warm up first.</b> Five to ten minutes of skipping, shadowboxing and dynamic stretches readies muscles and joints for heavy work.",
          "<b>Progress gradually.</b> Muscle adapts faster than tendon and bone, so adding load too quickly invites overuse injuries.",
          "<b>Protect the hands.</b> Wrap snugly, wear fitted gloves on the bag, and stop if a knuckle or wrist hurts instead of punching through it.",
        ],
        spd: [
          "<b>Train fast when fresh.</b> Footwork and speed drills belong early in a session; sloppy reps on tired legs raise injury risk.",
          "<b>Fatigue slows reactions.</b> A tired athlete responds later, which means getting hit more often. Quality reps beat extra reps.",
        ],
        def: [
          "<b>Avoiding punches protects the brain.</b> Every punch slipped is a head impact that never happens, and impacts add up over a career.",
          "<b>Learn in controlled rounds.</b> Technical, light-contact sparring builds defence with far less head exposure than hard sparring.",
          "<b>Neck conditioning.</b> Many coaches include it. Research on whether it lowers concussion risk is mixed, so it is part of conditioning, not a shield.",
        ],
        sta: [
          "<b>Fatigue and hits go together.</b> A tired fighter drops his hands and reacts late, so more punches land. Endurance is also protection.",
          "<b>Fuel and fluids.</b> Drink regularly through the day and eat carbohydrate and protein after hard sessions to refill energy and help repair.",
          "<b>Build roadwork gradually.</b> Sharp jumps in running volume are a classic cause of shin pain and stress fractures.",
        ],
        tired: [
          "<b>Heads-up: fatigue is high.</b> One more hard session would push him into overreaching. Rest or go light first.",
          "<b>Fatigue is a safety issue.</b> Tired athletes move less cleanly and react later, and both raise injury risk.",
        ],
        over: [
          "<b>Load management.</b> Injury risk climbs when training load spikes or recovery is skipped. Hard day, easy day, and a lighter week now and then.",
          "<b>Overtraining is a slow burn.</b> Lasting tiredness, worse performance, poor sleep, low mood and frequent colds mean back off, and get checked if they persist.",
        ],
        light: [
          "<b>Active recovery.</b> Easy movement keeps him fresh between hard days. It is not treatment, and it is off the table with warning signs.",
          "<b>Technique days.</b> Easy sessions suit drilling form, where fixing mistakes costs little injury risk.",
        ],
        rest: [
          "<b>Sleep is training.</b> Most adults need about 7–9 hours, teens more, and hard-training athletes often do better with extra. Short sleep is linked to slower reactions and more injuries.",
          "<b>Adaptation happens at rest.</b> Muscle, tendon and bone get stronger during recovery, not during the workout itself.",
        ],
        restHead: [
          "<b>Rest is not clearance.</b> After a possible concussion, 24–48 hours of relative rest is followed by gradual, clinician-guided activity. Prolonged strict rest is not advised, and feeling better is not the same as being cleared.",
        ],
        restHurt: [
          "<b>Rest helps, but it doesn’t diagnose or clear.</b> Pain, swelling, dizziness or vision changes that persist after rest still need a clinician.",
        ],
        blocked: [
          "<b>Why training stops.</b> Exercising with a possible brain or internal injury can make it worse. After concussion, activity returns in steps of at least 24 hours each, with a healthcare provider’s approval.",
          "<b>“Feeling fine” isn’t a green light.</b> Symptoms can be hidden or delayed, so warning signs outweigh how an athlete says he feels.",
        ],
        hand: [
          "<b>Hand care.</b> Landing on the big knuckles with a straight wrist, and wrapping snugly, lowers hand-injury risk. A hand that stays swollen or painful needs assessment, not guesswork.",
        ],
        obs: [
          "<b>Observation isn’t clearance.</b> Tools such as the SCAT6 help clinicians structure an assessment, but a normal result never overrides symptoms or warning signs.",
          "<b>Fighters hide symptoms.</b> Athletes often under-report because they want to compete. Balance, behaviour and responses matter more than “I’m fine”.",
          "<b>Re-check later.</b> Symptoms can evolve over hours or days, so one normal check doesn’t end monitoring.",
        ],
        dx: [
          "<b>Most people recover.</b> Most adults improve within a few weeks with guided care. If symptoms last beyond about four weeks, ask the clinician about specialist rehabilitation.",
          "<b>Report everything.</b> Headache, fogginess, sleep changes and low mood all matter to the clinician, even when they seem minor.",
        ],
        eye: [
          "<b>Eye injuries.</b> After a facial blow, don’t press on the eye or blow the nose. Double or blurred vision, severe pain or a swollen-shut eye need prompt assessment.",
        ],
        rib: [
          "<b>Rib injuries.</b> Sharp pain on breathing or twisting after a body shot may be a bruised or broken rib and needs assessment. Tight rib wraps are discouraged because they limit breathing.",
          "<b>Breathing trouble is an emergency.</b> Worsening shortness of breath or chest pain after a body blow needs urgent care; call 119 in South Korea.",
        ],
        cut: [
          "<b>Cut care basics.</b> Firm direct pressure with clean gauze, plus cold, slows bleeding. Don’t rub it. The ringside physician decides whether a cut fighter may continue, especially near the eye.",
          "<b>Clean cuts heal best.</b> Glue, strips or stitches reduce infection and scarring, and blood running into the eye can block vision.",
        ],
        forf: [
          "<b>Pulling out is a decision, not a defeat.</b> Many injuries worsen when athletes compete through them. Withdrawing early protects the long-term career.",
          "<b>Plan the comeback.</b> A fighter who skips a bout healthy loses little; one who fights hurt can lose months.",
        ],
        after: [
          "<b>Recover after a fight.</b> Rehydrate, eat carbohydrate and protein, and sleep well. Keep the next few days easy.",
          "<b>Soreness vs. warning signs.</b> Aching that peaks a day or two after a fight is normal. Sharp, one-sided or worsening pain isn’t, and needs checking.",
          "<b>Count the rounds.</b> Head impacts add up, so most training should be technical or light, with hard sparring limited and planned.",
        ],
        medstop: [
          "<b>Doctor’s stoppage.</b> Ringside physicians can stop a bout to protect a fighter. After suspected concussion there is no more contact that day, and commissions often add mandatory suspensions.",
        ],
        towel: [
          "<b>Stopping early is a skill.</b> Referee, ringside doctor and corner can each stop a bout, and fighters rarely stop themselves, so the corner’s call matters.",
        ],
        kit: [
          "<b>Why rapid cuts are risky.</b> Losing weight fast through fluid restriction, saunas or diuretics lowers strength, reaction time and heat tolerance. Extreme cuts have contributed to deaths in combat sports, and some commissions now regulate them.",
          "<b>Kit check.</b> Fresh wraps, fitted gloves and a well-fitting mouthguard protect hands, lips and teeth. Evidence that mouthguards or headgear prevent concussion is limited or mixed, so they never replace good defence and early stopping.",
          "<b>Taper, don’t cram.</b> In fight week, cut training volume and keep sharpness so the body arrives recovered, not tired.",
        ],
        st0: [
          "<b>Defend.</b> Covering up and moving cuts the punches that land. It is a sound way to limit head impacts when tired, but never makes an injured fighter safe to continue.",
        ],
        st1: [
          "<b>Balance.</b> Mixing offence and defence keeps energy in reserve. Fatigue is a risk factor: tired fighters absorb more punches.",
        ],
        st2: [
          "<b>Attack.</b> Pressing the fight raises output and exposure. Trading punches while tired is when head impacts pile up, so weigh the risk every round.",
        ],
        water: [
          "<b>Sip, don’t gulp.</b> Small sips between rounds replace sweat losses and help with heat. Water won’t treat a head injury: a dazed fighter needs a doctor, not a drink.",
          "<b>Hydration matters.</b> Even mild dehydration dulls concentration and strength, so drink regularly in camp as well as in the corner.",
        ],
        bh: [
          "<b>Watch hands and eyes.</b> A slow guard reset, vacant look or wobbly legs after head shots mean call the doctor now, whatever the fighter says.",
        ],
        bc: [
          "<b>Mind the cut.</b> Blood near the eye can block vision, and a cut that keeps bleeding may be stopped by the ringside doctor. Use Cut care at the break.",
        ],
        bb: [
          "<b>Body shots add up.</b> A guarded side, painful breathing or a pale, queasy fighter can point to rib or organ injury, and fighters often hide it.",
        ],
        bf: [
          "<b>Fatigue is a safety issue.</b> Tired fighters protect themselves worse and react later. If the hands are dropping, think about stopping.",
        ],
        corner: [
          "<b>Your job in the corner.</b> The fighter wants to win; you decide when it’s safe. Watch balance, reactions and guard, not just the scorecard.",
          "<b>Every exchange is exposure.</b> Even punches that look harmless add to head-impact exposure over a career.",
          "<b>The doctor is on your side.</b> Calling the ringside physician isn’t weakness; it is how problems get caught early.",
        ],
      };
      const pick = (k) => {
          const a = TP[k];
          if (!a) return "";
          const n = (G.tp[k] = (G.tp[k] || 0) + 1);
          return a[(n - 1) % a.length];
        },
        tc = (t, l) =>
          t
            ? `<div class="c tip">${infoButton(l + " · " + TIP_DATA[categoryFor(t)].title, t, categoryFor(t))}</div>`
            : "",
        bt = () => {
          const m = G.me;
          return pick(
            m.head >= BAL.medical.headStop
              ? "bh"
              : m.cut > 0
                ? "bc"
                : m.body >= BAL.medical.bodyStop
                  ? "bb"
                  : m.fat >= 65
                    ? "bf"
                    : "corner",
          );
        };
      let UQ = [],
        UT = 0;
      function unl(k) {
        G.cx = G.cx || {};
        if (!G.cx[k]) {
          G.cx[k] = 1;
          UQ.push(CX[k][0]);
          clearTimeout(UT);
          UT = setTimeout(() => {
            toast("📖 Codex unlocked: " + UQ.join(" · "));
            UQ = [];
          }, 0);
        }
      }
      function cdx(a) {
        const u = G.cx || {};
        const content =
          `<div class="c"><h2>📖 Medical Codex</h2><div class="mu">Entries unlock as you meet them in a bout. <b class="w">${Object.keys(u).length} of ${Object.keys(CX).length}</b> so far — the locked ones are named, so you can see what is still out there.</div></div>` +
          /* Locked rows show their title. Twelve anonymous "Locked" bars
             read as broken; a named row you cannot open yet reads as
             something worth going and finding. */
          Object.keys(CX)
            .map((k) =>
              u[k]
                ? compactDetail(CX[k][0], escapeUI(CX[k][1]))
                : `<div class="codex-locked">🔒 ${escapeUI(CX[k][0])} · not yet encountered</div>`,
            )
            .join("") +
          `<div id="about" class="c"><h2>About / limitations</h2><p>This is a fictional educational game, not a medical device, examination, diagnosis, treatment, or clearance tool. Simulated values and scenarios are not real injury measurements. Have any suspected injury assessed by qualified clinicians. Emergency in South Korea: call 119.</p><p><b>Professional review:</b> Not yet reviewed by a qualified sports-medicine or concussion clinician; no professional endorsement is claimed.</p><p><b>Version history:</b> Compact Tips UI, 2026-10-25 — independent accessible education panels; original education, engine and canvas retained. Safety gate applied at round breaks. Safety Education Edition, 2026-10-25 — safety pathways, deterministic observations, revised medical education, emergency instructions, and references. Later the same day: sports-medicine tips on actions, ringside-observation notes and nine more Codex entries.</p><p><b>Feedback:</b> Use the platform’s feedback/report control and include “Inside the Impact” and the version date. No direct developer contact address was provided.</p><h2>Original sources (supplied check date: 2026-10-25)</h2><p><a href="https://www.cdc.gov/heads-up/signs-symptoms/index.html" target="_blank" rel="noopener">CDC HEADS UP: Signs and Symptoms of Concussion</a> (updated 2025-09-15)</p><p><a href="https://www.cdc.gov/heads-up/guidelines/returning-to-sports.html" target="_blank" rel="noopener">CDC HEADS UP: Returning to Sports</a> (updated 2025-09-15)</p><p><a href="https://www.aan.com/advocacy/sports-concussion-position-statement" target="_blank" rel="noopener">American Academy of Neurology: Sports Concussion Position Statement</a></p><p><a href="https://bjsm.bmj.com/content/53/6/328" target="_blank" rel="noopener">Neidecker et al., Association of Ringside Physicians: Concussion management in combat sports, consensus statement</a> (Br J Sports Med. 2019;53:328–333. doi:10.1136/bjsports-2017-098799)</p><p><a href="https://pubmed.ncbi.nlm.nih.gov/37316210/" target="_blank" rel="noopener">Patricios et al., Consensus statement on concussion in sport: 6th International Conference, Amsterdam 2022</a> (Br J Sports Med. 2023;57:695–711. doi:10.1136/bjsports-2023-106898)</p><p><a href="https://pubmed.ncbi.nlm.nih.gov/27535989/" target="_blank" rel="noopener">Soligard et al., IOC consensus statement on load in sport and risk of injury</a> (Br J Sports Med. 2016;50:1030–1041)</p><p><a href="https://researchonline.ljmu.ac.uk/id/eprint/16297/" target="_blank" rel="noopener">Walsh et al., Sleep and the athlete: narrative review and 2021 expert consensus recommendations</a> (Br J Sports Med. 2021;55(7))</p><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10020327/" target="_blank" rel="noopener">McKee et al., CTE: criteria for neuropathological diagnosis and relationship to repetitive head impacts</a> (Acta Neuropathol. 2023)</p><p><a href="https://pubmed.ncbi.nlm.nih.gov/16295814/" target="_blank" rel="noopener">Bledsoe et al., Incidence of injury in professional boxing</a> (South Med J. 2005) — source for the injury base rates (facial laceration ~51%, hand ~17%, eye ~14%)</p><p><a href="https://www.neurology.org/doi/10.1212/WNL.0000000000008817" target="_blank" rel="noopener">Bernick et al., Longitudinal change in regional brain volumes in professional fighters</a> (Neurology 2020) — thalamic volume decline, and the finding that bout exposure rather than sparring volume carried the signal</p><p><a href="https://pubmed.ncbi.nlm.nih.gov/9521255/" target="_blank" rel="noopener">McCrory &amp; Berkovic, Second impact syndrome</a> (Neurology 1998;50:677–683) — the review finding none of 17 published cases definite</p><p><a href="https://bjsm.bmj.com/content/57/11/622" target="_blank" rel="noopener">Echemendia et al., Sport Concussion Assessment Tool 6 (SCAT6)</a> (Br J Sports Med. 2023;57:622–631)</p><p><a href="https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/athletic-mouth-protectors-mouthguards" target="_blank" rel="noopener">American Dental Association: Athletic mouth protectors (mouthguards)</a></p><p><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12084430/" target="_blank" rel="noopener">The Case for Protective Headguards in Amateur Boxing and Implications for International Policy on Headguard Bans</a></p><p><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3607973/" target="_blank" rel="noopener">Franchini et al., Weight loss in combat sports: physiological, psychological and performance effects</a> (J Int Soc Sports Nutr. 2012;9:52)</p><p class="mu">UI update source check: CDC signs/symptoms and returning-to-sports pages checked 2026-10-25. Other references are retained from the original, not newly verified. Before public or professional use, request qualified clinician review.</p></div>`;
        openArticle(
          a ? "About / sources" : "Medical Codex",
          a
            ? content.slice(content.indexOf('<div id="about"'))
            : content.replace(/<div id="about"[\s\S]*/, ""),
        );
      }
      function fa() {
        G.fc = true;
        G.fy = true;
        fight();
      }
      function er() {
        unl("sdh");
        end("er");
      }
      function pre() {
        setGamePhase("pre-bout");
        renderOpponentPreview("pre-bout");
        if (G.me.sdh) return end("sdh");
        if (hasConcern()) return end("withdraw");
        unl("dehy");
        unl("gear");
        unl("base");
        $("#m").innerHTML =
          `<div class="c"><h2>Weigh-in</h2><div class="mu">Tomorrow · normal hydration</div></div><button class="b s" onclick="wi(0)">Make weight naturally<small>Normal hydration</small></button><div class="c note"><b>No rapid dehydration.</b> This game does not simulate weight cutting.${infoButton("Weight & kit guidance", "Rapid dehydration is not a performance upgrade. Choose a suitable weight class and seek qualified sports-nutrition guidance; this game does not simulate weight cutting.", "safety")}</div>${tc(pick("kit"), "Fight week")}`;
        window.scrollTo(0, 0);
      }
      function wi(c) {
        G.cutw = false;
        phys();
      }
      function hasConcern() {
        const m = G.me;
        return !!(
          G.dx ||
          m.conc ||
          m.sdh ||
          m.abd ||
          m.eye ||
          m.cut >= 2 ||
          m.head >= BAL.medical.headStop ||
          m.body >= BAL.medical.bodyStop
        );
      }
      /* Warning band: enough to see, not enough to be told.
         This is the decision the whole game is built around, so the
         game must never make it on the player's behalf. */
      function hasWarning() {
        if (mustStop()) return false;
        const w = warningSigns();
        return w.hard.length > 0 || w.soft.length > 0;
      }
      /* Hard signs come from the injury itself; soft signs come from a
         damage counter. That distinction is the entire skill being taught.
         Tying both to accumulated exposure — as this did at first — makes a
         decisive-looking sign about as informative as a coin flip, which
         teaches "you can never tell". The literature says the opposite:
         hard signs are specific, which is why they justify removal. */
      function warningSigns() {
        const m = G.me,
          hard = [],
          soft = [];
        if (m.conc) {
          hard.push("He is unsteady coming off the stool and puts a hand on the rope.");
          if (m.head >= BAL.medical.headWarn * 1.6)
            hard.push("Blank look. He answers a question you did not ask him.");
        }
        if (m.abd)
          hard.push("He is pale, guarding his side, and says he feels sick.");
        if (m.eye) hard.push("He is covering one eye and the vision is off.");
        if (m.head >= BAL.medical.headWarn)
          soft.push("He blinked hard after that exchange and took a beat to answer.");
        if (m.body >= BAL.medical.bodyStop * 0.55)
          soft.push("He keeps dropping an elbow to cover his right side.");
        if (m.hand)
          soft.push("He is not letting the right hand go. Something in it hurts.");
        if (m.fat >= 72)
          soft.push("His hands are drifting towards his waist between exchanges.");
        return { hard, soft };
      }
      /* Only genuine emergencies take the decision away. Everything else is
         the player's call, because recognising it IS the thing being learnt. */
      function mustStop() {
        const m = G.me;
        return !!(
          m.sdh ||
          m.head >= BAL.medical.headStop ||
          m.body >= BAL.medical.bodyStop ||
          m.cut >= 3
        );
      }
      function phys() {
        const m = G.me,
          u = [];
        if (m.conc || m.head >= BAL.medical.headStop)
          u.push("possible neurological warning signs");
        if (m.sdh) u.push("worsening neurological symptoms — emergency");
        if (m.abd) u.push("concerning torso symptoms");
        if (m.eye) u.push("eye/vision concern");
        if (m.cut >= 2) u.push("significant cut");
        if (m.hand) u.push("hand concern");
        unl("screen");
        const blocked = hasConcern();
        $("#m").innerHTML =
          `<div class="c ${blocked ? "r" : "k"}"><h2>Ringside check</h2><p>${u.length ? "Flagged: " + u.join("; ") + "." : "Nothing flagged right now — that doesn't rule injury out."}</p><div class="essential-warning">Warning signs beat appearance. Suspected concussion → stop, no same-day return.</div>${infoButton("Screening limitations", "Safety-critical findings are deterministic. A normal-looking observation never overrides a warning sign or reported symptom. If concussion is suspected: stop the bout, no same-day return, and arrange qualified medical assessment.", "safety")}</div>${blocked ? `<button class="b p" onclick="end(${m.sdh ? "'sdh'" : "'withdraw'"})">${m.sdh ? "🚑 Emergency care now" : "Withdraw and arrange professional assessment"}</button>` : `<button class="b" onclick="end('withdraw')">Withdraw safely</button><button class="b p" onclick="fight()">To the ring ▶<small>Observation is not medical clearance</small></button>`}`;
        window.scrollTo(0, 0);
      }
      function exam(md) {
        setGamePhase(md === "corner" ? "between-rounds" : "pre-bout");
        E = {
          md,
          seen: {},
          t: [
            [
              "🗣️",
              "Neurological warning signs",
              ...(G.me.conc || G.me.head >= BAL.medical.headStop
                ? [
                    "Possible warning signs are present — suspected concussion requires stopping activity",
                    "conc",
                  ]
                : [
                    "No obvious warning signs observed now; this cannot rule out concussion",
                    0,
                  ]),
            ],
            [
              "⚖️",
              "Balance / behavior",
              ...(G.me.conc
                ? ["Possible concerning change — stop activity", "conc"]
                : ["No obvious change simulated; not a clearance test", 0]),
            ],
            [
              "🩹",
              "Face & vision",
              ...(G.me.eye
                ? ["Eye/vision concern needs professional assessment", "eye"]
                : ["No obvious concern simulated; symptoms may be delayed", 0]),
            ],
            [
              "✋",
              "Hands",
              ...(G.me.hand
                ? ["Hand concern needs professional assessment", "hand"]
                : ["No obvious concern simulated", 0]),
            ],
            [
              "🫁",
              "Torso / general",
              ...(G.me.abd
                ? [
                    "Concerning torso symptoms: urgent professional assessment",
                    "abd",
                  ]
                : G.me.body >= BAL.medical.bodyStop
                  ? [
                      "Tender, guarded ribs after body shots: stop contact and arrange assessment",
                      "rib",
                    ]
                  : [
                      "No obvious concern simulated; internal injury cannot be ruled out",
                      0,
                    ]),
            ],
          ],
        };
        showEx();
      }
      function showEx() {
        const n = Object.keys(E.seen).length;
        $("#m").innerHTML =
          `<div class="c"><h2>🩺 ${E.md == "hub" ? "Ringside observations" : "Ringside observations"}</h2><div class="mu">Educational observations (${n}/5). Not a real exam; not medical clearance.</div>${E.md == "hub" ? `<div class="c note"><b>Game rule:</b> Finish this checkup, then Rest for a 60% chance signs clear by next camp — a missed roll leaves them. Medical treatment is the safer bet: it forfeits this bout but fully resets you. Neither is real medical clearance.</div>` : ""}</div><div class="g">${E.t.map((t, i) => `<button class="b t ${E.seen[i] ? "s" : ""}" onclick="tst(${i})"><span class="ic">${t[0]}</span><b>${t[1]}</b><small>${E.seen[i] ? "done" : "observe"}</small></button>`).join("")}</div>${E.t.map((t, i) => (E.seen[i] ? `<div class="c ${t[3] ? "r" : "k"}"><b>${t[1]}:</b> ${t[2]}${compactDetail("What is observed", escapeUI(OBS[i]))}</div>` : "")).join("")}<div class="fb"><button class="b" style="flex:1" onclick="${E.md == "hub" ? "hub()" : "rerender()"}">← Back</button><button class="b p" style="flex:2" onclick="vd(0)">Finish observations</button></div>`;
      }
      function tst(i) {
        E.seen[i] = 1;
        if (E.t[i][3]) unl(E.t[i][3]);
        showEx();
      }
      function vd(f) {
        const m = G.me,
          md = E.md,
          fl = E.t.filter((t, i) => E.seen[i] && t[3]);
        const un = hasConcern();
        const miss = false;
        G.doc++;
        if (md == "hub") {
          G.checkedForRecovery = true;
          G.checkedThisCamp = true;
        }
        unl("screen");
        if (miss) G.missed = (G.missed || 0) + 1;
        const fb = miss
          ? fl.length
            ? " <b class='r'>You cleared him despite warning findings.</b>"
            : " <b class='w'>A problem may have been missed: skipped tests can hide it.</b>"
          : "";
        if (md == "corner") {
          if (!f) {
            if (un) {
              G.why =
                "concerning signs were observed; safest action is to stop the bout";
              return fin("medstop");
            }
            F.used = true;
            F.ct = pick("obs");
            toast("No concern simulated; observations are not clearance");
            return rerender();
          }
          F.used = true;
          if (miss) {
            G.fc = true;
            F.inj = true;
          }
          toast("Observations are not clearance");
          return rerender();
        }
        if (m.sdh) return f ? day("") : er();
        if (!f) {
          if (m.abd) {
            unl("abd");
            return end("hospital2");
          }
          if (m.conc || m.head >= BAL.medical.headStop) {
            G.dx = true;
            unl("conc");
            unl("rtp");
            unl("sic");
            return day(
              "<b class='r'>Possible concussion warning signs.</b> This game cannot diagnose. No sparring or competition today; seek qualified medical assessment. Any return must follow clinician approval, CDC staged progression, and applicable combat-sport rules.",
              "dx",
            );
          }
          if (m.eye) {
            m.ed = 2;
            return day(
              "<b class='r'>Eye injury.</b> Referred to an eye specialist; no sparring.",
              "eye",
            );
          }
          if (m.body >= BAL.medical.bodyStop) {
            unl("rib");
            return day(
              "<b class='r'>Torso / rib concern.</b> Referred for assessment; no contact work until cleared.",
              "rib",
            );
          }
          if (m.cut >= 3) {
            m.cut = 0;
            return day("Cut closed with glue. Healing.", "cut");
          }
          return day(
            "Cautious call: extra rest day. Better safe than sorry.",
            "obs",
          );
        }
        day(
          "Observations are not a real examination or clearance. A normal-looking result cannot override warning signs; seek a qualified clinician when concerned.",
          "obs",
        );
      }
      /* ---------- FIGHT ---------- */
      function fight() {
        setGamePhase("fight");
        const m = G.me;
        if (m.sdh) return er();
        if (hasConcern()) return end("withdraw");
        F = {
          r: 1,
          R: G.champ ? 5 : 3,
          pts: [0, 0],
          landed: [0, 0],
          stance: 1,
          oh: G.champ ? 75 : 60,
          mh: G.champ ? 75 : 60,
          of: 10,
          pb: G.cutw ? 1 : 0,
          inj: !!(m.conc || m.abd || G.fy),
        };
        G.fy = false;
        if (m.sdh) return end("sdh");
        if (G.cutw) m.fat = Math.min(100, m.fat + 15);
        $("#cv").style.display = "block";
        $("#fight-scoreboard").style.display = "grid";
        $("#m").innerHTML = "";
        $("#sub").textContent = "ROUND 1 · " + G.opp.n;
        $("#objective").textContent = "Observe the exchange · choose the safe response at the bell";
        round();
      }
      function round() {
        setGamePhase("fight");
        if (G.me.sdh) return er();
        if (F.stopRequired || mustStop()) {
          G.why =
            "warning indicators require stopping contact; game actions cannot provide medical clearance";
          return fin("medstop");
        }
        if (G.me.cut >= 3 && F.r > 1) {
          G.why = "the cut was bleeding too heavily to continue safely";
          unl("cut");
          return fin("medstop");
        }
        document.body.dataset.s = "fight";
        F.used = false;
        F.ct = "";
        F.busy = true;
        F.i = 0;
        F.kd = false;
        F.banked = [];
        F.tell = null;
        clearTimeout(F.tellT);
        $("#sub").textContent = "ROUND " + F.r + "/" + F.R + " · " + G.opp.n;
        $("#objective").textContent = "Watch guard, balance, and breathing";
        toast("🔔 Round " + F.r);
        hud("");
        step();
      }
      function updateFightScoreboard() {
        if (!F || !F.pts) return;
        $("#score-you").textContent = F.pts[0];
        $("#score-opponent").textContent = F.pts[1];
        $("#landed-you").textContent = F.landed[0];
        $("#landed-opponent").textContent = F.landed[1];
        $("#score-health").textContent = fatigueHealthPercent(G.me.fat) + "% HEALTH";
        $("#score-opponent-name").textContent = G.opp.n;
        $("#score-opponent-health").textContent = Math.max(0, Math.round((F.oh / F.mh) * 100)) + "%";
      }
      function hud(t) {
        const m = G.me;
        const ex = Math.min(F.i || 0, 8);
        const lead = F.pts[0] - F.pts[1];
        $("#m").innerHTML =
          (F.tell
            ? `<button class="b" id="tell-btn" onclick="catchTell()" style="border-color:var(--wn);background:#4a3310;color:var(--wn);text-align:center;animation:blink .45s steps(2,end) infinite">⚠ Something just happened — look at him</button>`
            : "") +
          `<div class="c"><div class="combat-pulse"><span>EXCHANGE <strong>${ex}/8</strong></span><span>MOMENTUM <strong>${lead > 0 ? "YOU +" + lead : lead < 0 ? "OPP " + Math.abs(lead) : "EVEN"}</strong></span></div><div id="lg">${t}</div><div class="context-row">${m.head > 0 ? contextTip(m.conc ? "concussion" : "brain", "Head impacts · learn") : ""}${m.body > 0 ? contextTip("body", "Body impacts · learn") : ""}${!m.head && !m.body ? contextTip("controls", "Bout controls") : ""}</div></div>`;
        syncInjuryMonitor();
        updateFightScoreboard();
      }
      let lines = [];
      const lg = (t) => {
        lines.unshift(t);
        lines = lines.slice(0, 3);
        hud(lines.join("<br>"));
      };
      function step() {
        if (F.i >= 8 || F.kd) return brk();
        F.i++;
        const m = G.me,
          o = G.opp,
          s = F.stance;
        const pa = m.spd * (1 + (s - 1) * 0.15) * (1 - m.fat / 250),
          pb = o.spd * (1 - F.of / (250 + o.sta * 12)),
          who = rn() < pa / (pa + pb) ? 0 : 1;
        const atk = who ? o : m,
          df = who ? m : o,
          fa = who ? F.of : m.fat;
        let land =
          0.55 +
          (atk.spd - df.def) * 0.04 -
          fa / 400 -
          (who && s == 0 ? 0.1 : 0) -
          (!who && s == 0 ? 0.05 : 0) -
          (!who && m.eye ? 0.1 : 0);
        if (who == 0) m.fat += 2 + s * 0.8;
        else F.of += 2.5 * o.ti;
        const tgt = rn() < (who ? 1 - o.bt + 0.1 : 0.6) ? "h" : "b",
          hit = rn() < land;
        A = { who, tgt, t: 0, hit };
        playImpactCue(hit, who);
        if (hit) {
          F.landed[who]++;
          let d = (3 + (atk.pow + (who ? 0 : F.pb)) * 1.1) * R(0.7, 1.3);
          if (who == 0) {
            d *= [0.8, 1, 1.25][s] * (m.hand ? 0.75 : 1);
            if (rn() < 0.02 && !m.hand) {
              m.hand = true;
              m.hd = 3;
            }
            F.oh -= d * (tgt == "h" ? 1 : 0.8);
            F.pts[0] += 1;
            lg("You land to the " + (tgt == "h" ? "head" : "body") + ".");
            if (F.oh <= 0) {
              return scheduleCombat(() => fin("win", "KO"), 520);
            }
          } else {
            d *= [0.7, 1, 1.15][s];
            F.pts[1] += 1;
            G.hits++;
            if (tgt == "h") {
              d *=
                (1 + m.fat / 200) *
                (m.conc ? 1.6 : 1) *
                (1 - m.def * 0.03) *
                (G.cutw ? 1.25 : 1);
              m.head += d * 0.78;
              m.career += d * 0.78;
              m.peak = Math.max(m.peak, m.head);
              if (m.head >= BAL.medical.headWarn && rn() < 0.45)
                setTimeout(() => flashTell("conc"), 280);
              const q = rn(),
                li =
                  q < 0.3 ? 0 : q < 0.65 ? 1 : q < 0.9 ? 4 : q < 0.96 ? 2 : 3;
              m.lb[li] += d;
              lg("<span class='w'>Head shot absorbed.</span>");
              if (d > 7.5 && rn() < 0.08) m.cut = Math.min(4, m.cut + 1);
              if (d > 8 && rn() < 0.03 && !m.eye) {
                m.eye = true;
                m.ed = 99;
              }
              if (
                !m.conc &&
                m.head >
                  (G.cutw
                    ? BAL.medical.concussionExposure - 6
                    : BAL.medical.concussionExposure) &&
                rn() < BAL.medical.concussionChance
              ) {
                m.conc = true;
                m.cd = 999;
              }
              if (m.conc) {
                /* Do NOT end the bout here. The corner is supposed to spot
                   this and act; if the game removes him automatically the
                   player never practises the one judgement that matters. */
                G.why = "possible concussion warning signs during the bout";
                unl("conc");
                unl("rtp");
                unl("sic");
                setTimeout(() => flashTell("conc"), 240);
              }
              if (m.head >= (m.conc ? 40 : 62) && rn() < 0.8)
                return scheduleCombat(() => fin("ko"), 520);
              if (d > 10 && rn() < 0.18) {
                m.conc = true;
                m.cd = 999;
                F.kd = true;
                F.kdn = 1;
                lg("<b class='r'>KNOCKDOWN — mandatory 8-count.</b>");
              }
            } else {
              m.body += d * 0.65;
              m.sd[rn() < 0.5 ? 0 : 1] += d * 0.65;
              lg("Body shot lands.");
              if (m.body >= BAL.medical.bodyStop * 0.55 && rn() < 0.35)
                setTimeout(() => flashTell("body"), 280);
              if (m.body >= BAL.medical.bodyStop) unl("rib");
              if (m.body > 42 && rn() < 0.08) m.abd = true;
            }
          }
        } else lg(who ? "You slip the punch." : "Opponent blocks.");
        if (m.fat >= 74 && rn() < 0.14) setTimeout(() => flashTell("tired"), 280);
        scheduleCombat(step, 380);
      }
      function brk() {
        if (F.r < F.R) F.ct = bt();
        endRound();
        if (F.r < F.R) {
          const c = $("#cv");
          window.scrollTo(0, c.offsetTop + c.offsetHeight - 6);
        }
      }
      function endRound() {
        setGamePhase("between-rounds");
        document.body.dataset.s = "break";
        if (mustStop()) {
          F.stopRequired = true;
          revealSafetyNotice();
        }
        if (F.r >= F.R) {
          const w = F.pts[0] > F.pts[1];
          return fin(w ? "win" : "lose", "decision");
        }
        hud("");
        const s = F.stance,
          S = (i, ic, t, sub) =>
            `<button class="b sg ${s == i ? "on" : ""}" onclick="stc(${i})"><span class="ic">${ic}</span><b>${t}</b><small>${s == i ? "✓ selected" : sub}</small></button>`;
        $("#m").insertAdjacentHTML(
          "beforeend",
`<div class="sl">OBSERVE · WHAT CHANGED</div><div class="c mu"><b>Opponent:</b> ${F.of > 55 ? "tiring, hands dropping. A chance to press." : F.oh < 25 ? "badly hurt." : "still fresh."}</div>` +
            (F.banked && F.banked.length
              ? `<div class="c" style="border-color:#8cd7ff"><b style="color:#8cd7ff">YOU CAUGHT THIS DURING THE ROUND</b>${F.banked.map((x) => `<div class="mu" style="margin-top:5px">👁 ${escapeUI(x)}</div>`).join("")}</div>`
              : "") +
            (hasWarning()
              ? (() => {
                  const w = warningSigns();
                  return `<div class="c res" style="border-color:${w.hard.length ? "var(--ac)" : "var(--wn)"};background:${w.hard.length ? "#2b1715" : "#241f12"}">${w.hard.length ? `<b class="r">HARD SIGNS · THESE SETTLE IT</b>${w.hard.map((x) => `<div style="margin-top:5px;color:#ffd6cd">⚠ ${escapeUI(x)}</div>`).join("")}` : ""}${w.soft.length ? `<b class="w" style="display:block;margin-top:${w.hard.length ? "10px" : "0"}">UNCLEAR · COULD BE THE ROUNDS</b>${w.soft.map((x) => `<div class="mu" style="margin-top:5px">· ${escapeUI(x)}</div>`).join("")}` : ""}<div class="mu" style="margin-top:8px;color:#ffe6ac">${w.hard.length ? "A hard sign is enough on its own. Suspicion does not have to become certainty before you act." : "Nothing here settles it. Hard rounds produce all of this too."}</div>${infoButton("Reading an unclear fighter", "Some observations settle the question on their own: unsteadiness on the feet, a blank or vacant look, confusion, loss of consciousness. These are specific, which is why they justify removal by themselves. Others — slow answers, heavy legs, a late guard, breathlessness — are genuinely ambiguous, because a hard round produces them too. Suspicion alone is enough to remove a fighter; you never need to reach certainty first.", "concussion")}</div>`;
                })()
              : "") +
            `<div class="sl">DECIDE · ROUND ${F.r + 1}</div><div class="g3">${S(0, "🛡️", "Defend", "take less")}${S(1, "⚖️", "Balance", "even")}${S(2, "🔥", "Attack", "hit more")}</div><div class="sl">CORNER · ONE ACTION PER BREAK</div><div class="g3"><button class="b t" ${F.used ? "disabled" : ""} onclick="wat()"><span class="ic">💧</span><b>Water</b><small>fatigue −12 only</small></button><button class="b t" ${F.used || !G.me.cut ? "disabled" : ""} onclick="cutc()"><span class="ic">🩹</span><b>Cut care</b><small>${G.me.cut ? "stop bleeding" : "no cut"}</small></button><button class="b t s" ${F.used ? "disabled" : ""} onclick="dr()"><span class="ic">🩺</span><b>Doctor</b><small>observations</small></button></div><div class="sl">LEARN · QUICK TAKEAWAY</div>${tc(F.ct, "Corner tip")}` +
            (F.stopRequired
              ? `<div class="fb"><button class="b" style="flex:1" onclick="fin('towel')">🏳️ Stop</button><button class="b p" style="flex:2" onclick="fin('medstop')">Medical stop</button></div>`
              : hasWarning()
                ? `<div class="fb"><button class="b" style="flex:1;border-color:#ff5542;background:#3a1a18" onclick="fin('towel')">🏳️ Pull him out<small>Costs you the bout</small></button><button class="b p" style="flex:2" onclick="F.r++;round()">Send him out ▶<small>He says he's fine</small></button></div>`
                : `<div class="fb"><button class="b" style="flex:1" onclick="fin('towel')">🏳️ Stop</button><button class="b p" style="flex:2" onclick="F.r++;round()">Round ${F.r + 1} ▶</button></div>`),
        );
        syncInjuryMonitor();
      }
      /* Tells flash for under two seconds mid-round. Catching one banks it
         for the break. Miss them and you walk into the corner blind —
         which is the difference between watching a fight and reading one. */
      const TELL_LINES = {
        conc: [
          "His guard came back a full beat late after that shot.",
          "He turned towards the wrong corner for half a step.",
          "Blank for a second after the right hand. Just — gone.",
        ],
        tired: [
          "His hands are drifting down towards his waist.",
          "He is breathing through his mouth between every exchange.",
        ],
        body: ["His elbow keeps dropping to cover that right side."],
      };
      function flashTell(kind) {
        if (!F || F.tell) return;
        F.tell = { kind, text: pick2(TELL_LINES[kind]) };
        G.tellsSeen = (G.tellsSeen || 0) + 1;
        hud($("#lg") ? $("#lg").innerHTML : "");
        clearTimeout(F.tellT);
        F.tellT = setTimeout(() => {
          if (F && F.tell) {
            F.tell = null;
            if ($("#lg")) hud($("#lg").innerHTML);
          }
        }, 1900);
      }
      function catchTell() {
        if (!F || !F.tell) return;
        G.tellsCaught = (G.tellsCaught || 0) + 1;
        (F.banked = F.banked || []).push(F.tell.text);
        F.tell = null;
        clearTimeout(F.tellT);
        toast("👁 Noted: you saw it");
        if ($("#lg")) hud($("#lg").innerHTML);
      }
      const pick2 = (a) => a[Math.floor(Math.random() * a.length)];
      function stc(s) {
        F.stance = s;
        F.ct = pick("st" + s);
        toast("Game plan: " + ["Defend", "Balance", "Attack"][s]);
        rerender();
      }
      function rerender() {
        const y = window.scrollY;
        endRound();
        window.scrollTo(0, y);
      }
      function wat() {
        cornerAct("water");
        G.me.fat = Math.max(0, G.me.fat - 12);
        unl("hyd");
        F.ct = pick("water");
        toast("💧 Water & advice: fatigue −12");
        F.used = true;
        rerender();
      }
      function dr() {
        cornerAct("doctor");
        exam("corner");
      }
      function cutc() {
        cornerAct("cut");
        G.me.cut--;
        F.used = true;
        unl("cut");
        F.ct = pick("cut");
        toast(
          "Simulated bleeding control only; real cuts need appropriate assessment",
        );
        rerender();
      }
      function fin(t, how) {
        $("#fight-scoreboard").style.display = "none";
        if (hasConcern() || ["medstop", "ko"].includes(t)) revealSafetyNotice();
        A = null;
        $("#cv").style.display = "none";
        const m = G.me,
          cw = G.cutw,
          o = G.opp;
        G.cutw = false;
        if (!["win", "lose", "medstop", "towel"].includes(t)) return end(t);
        const W = t == "win";
        if (W) G.w++;
        else if (t == "lose") G.l++;
        /* Counted before the title-fight branch returns: the championship
           round is exactly where a stoppage matters most, and it used to
           be the one bout that recorded neither the concussion nor the
           counterfactual. */
        if (m.conc) m.boutsConcussed++;
        if (t === "towel" || t === "medstop")
          (G.stopLog = G.stopLog || []).push(
            !!(m.conc || m.abd || m.sdh || m.head >= BAL.medical.headStop),
          );
        const why = {
          win: "Won" + (how == "KO" ? " by KO" : "") + " vs " + o.n,
          lose: "Lost on points to " + o.n,
          medstop: "Medical stoppage: safety outcome, no loss",
          towel: "Coach stoppage: safety outcome, no loss",
        }[t];
        if (G.w >= 6) {
          G.champ = true;
          G.opp = CH;
          G.msg = `<b class="k">${why}. 🏆 Qualified with ${G.w} wins!</b> The champion is next.`;
        } else if (G.w + 8 - G.k < 6) {
          return end("qual");
        } else {
          G.opp = mkOpp(G.k);
          G.msg = `<b class="${W ? "k" : "r"}">${why}.</b>`;
        }
        G.tip = pick(
          t == "medstop" ? "medstop" : t == "towel" ? "towel" : "after",
        );
        G.postBout = true;
        hub();
      }
      function forf() {
        const m = G.me;
        if (G.champ) return end("withdraw");
        for (let i = 0; i < 5; i++) {
          m.fat = Math.max(0, m.fat - 35);
          if (m.hand && --m.hd <= 0) m.hand = false;
          if (m.eye && --m.ed <= 0) m.eye = false;
          m.head = Math.max(0, m.head - 5);
          m.body = Math.max(0, m.body - 5);
          m.cut = 0;
        }
        if (m.sdh) return end("sdh");
        G.k++;
        G.res.push("S");
        if (G.w + 8 - G.k < 6) return end("qual");
        G.days = 5;
        G.opp = mkOpp(G.k);
        G.tip = pick("forf");
        G.msg =
          "<b class='w'>Bout forfeited as a safety choice. No loss recorded.</b> Game recovery lowers simulated indicators, not medical risk or clearance.";
        hub();
      }
      /* ---------- ENDINGS ---------- */
      const LS = {
        sic: "“I feel fine” is not clearance. Returning too soon after a concussion can prolong recovery and, rarely, risks a dangerous second injury.",
        cum: "Head impacts add up. Fewer hard sparring rounds, better defence and earlier stoppage lower long-term risk; research on long-term effects, including CTE, is still developing.",
        fr: "If a fighter is knocked out: stop the bout, call for medical help, keep head and neck still, and stay with him. No walking it off, and no food, drink or medication.",
        conc: "Suspected concussion = remove from play and get a medical exam. No same-day return, then graded return of about 24 hours per step, stopping if symptoms reappear. Boxing commissions add suspensions of weeks.",
        abd: "Spleen and liver injuries from body blows can be subtle and delayed. Pain, dizziness or fainting hours later needs urgent medical assessment, which may include imaging, and return to sport is slow.",
        load: "Sharp jumps in training load raise injury and illness risk. Build gradually, warm up before hard sessions, keep fluids and meals regular, and protect sleep (about 7–9 hours for adults, more for teens).",
        hide: "Fighters minimise symptoms. Coaches must rely on observable signs, not on “I’m fine”.",
        stop: "Doctors can stop a bout when a boxer is in danger. A standing 8-count that lets a stunned fighter continue is a practice many ringside physicians question.",
      };
      function credits() {
        if (G.over !== "champ") return;
        $("#cv").style.display = "none";
        $("#sub").textContent = "Credits";
        $("#m").innerHTML =
          `<div class="c res" style="text-align:center;padding:28px 16px"><div class="w" style="font-size:12px;letter-spacing:.16em">INSIDE THE IMPACT</div><h2 style="font-size:22px;margin:18px 0">A game about<br>the impact of every choice</h2><div style="height:2px;background:var(--wn);margin:20px auto;max-width:180px"></div><p class="mu" style="letter-spacing:.12em;text-transform:uppercase">Created by</p><p class="w" style="font-size:21px;font-weight:900;margin:8px 0 18px">Joohyun Lee and Elliot Jeong</p><p class="mu">Thank you for playing — and for putting fighter safety first.</p></div><button class="b p" onclick="newGame()">Coach again</button>`;
        window.scrollTo(0, 0);
      }
      function end(t) {
        setGamePhase("result");
        syncTournamentProgress();
        $("#fight-scoreboard").style.display = "none";
        if (G.me.sdh && t != "er") t = "sdh";
        if (
          hasConcern() ||
          ["sdh", "er", "ko", "hospital", "hospital2", "medstop"].includes(t)
        )
          revealSafetyNotice();
        G.over = t;
        const m = G.me,
          inj = m.conc || m.abd,
          T = {
            champ:
              inj || m.peak > 35
                ? [
                    "Champion at a cost",
                    "The game’s simulated exposure indicators were high" +
                      (inj ? " and a warning remains" : "") +
                      ". This cannot establish actual tissue damage or injury. Safety comes before a sporting result.",
                  ]
                : [
                    "Champion · lower exposure",
                    "You beat the champion with lower simulated exposure. Game indicators cannot establish health or medical clearance.",
                  ],
            lose: [
              G.champ ? "Champion keeps the belt" : "Eliminated",
              (G.champ
                ? "You fell short in the title fight"
                : "Three ordinary bout losses end qualification; safety stoppages do not count as losses") +
                (inj
                  ? ", and an injury is still unresolved"
                  : ", with no concussion or torso flag recorded; this cannot establish health or medical clearance") +
                ".",
            ],
            qual: [
              "Qualification over",
              "You can’t reach six wins in the eight qualifying bouts any more. Protecting your fighter was never the wrong call" +
                (inj
                  ? ", and an injury is still unresolved, so recovery comes first"
                  : ", with no concussion or torso flag recorded; future participation still requires appropriate medical decisions") +
                ".",
            ],
            towel: [
              G.champ ? "You stopped the title fight" : "A coach’s call",
              (G.champ
                ? "One round from the belt, and you took it off him. He will not thank you for it tonight. "
                : "You stopped the fight to protect your fighter. ") +
                (G.titleStop === true
                  ? "He was concussed when you did it. Nobody will ever be able to show you the version where you left him in, which is the whole difficulty of this job."
                  : G.titleStop === false
                    ? "He was not concussed. He was exhausted, and he might well have survived the round. You will never be certain, and you made the call with what you had."
                    : "A loss is recoverable; a brain injury may not be."),
            ],
            medstop: [
              "Doctor stoppage",
              "The contest was stopped" +
                (G.why ? ": " + G.why : "") +
                ". Medical stoppages protect fighters, so respect them.",
            ],
            withdraw: [
              inj || G.dx ? "The right call" : "Safe withdrawal",
              inj || G.dx
                ? "Withdrawing with an injury is the responsible choice."
                : "A safe withdrawal is valid and not a loss. Game observations cannot rule out injury or establish medical clearance.",
            ],
            ko: [
              "Serious injury",
              "Your fighter was knocked out" +
                (G.fc
                  ? " while already concussed, which raises the risk of a worse brain injury"
                  : "") +
                ". He needs emergency care. Earlier stoppage would have helped.",
            ],
            hospital: [
              "Medical emergency",
              "Concerning torso symptoms worsened in this fictional scenario. The game cannot determine the cause; real symptoms need urgent professional assessment.",
            ],
            hospital2: [
              "Injury found in time",
              "A simulated emergency led to professional assessment (the game cannot diagnose an organ injury). Your fighter goes to hospital with a chance of full recovery because you sought assessment.",
            ],
            er: [
              "Emergency care in time",
              "You recognised the red flags and called emergency services. Emergency clinicians can assess and provide appropriate care. His boxing future is in doubt, but you gave him the best chance.",
            ],
            sdh: [
              "Emergency warning signs after head impact",
              "The warning signs were missed or ignored: worsening headache, vomiting, drowsiness. Bleeding around the brain can be fatal. Those signs mean call emergency services immediately.",
            ],
          }[t];
        const ko = t == "ko" || t == "sdh" || t == "er";
        if (ko) unl("fr");
        if (t.startsWith("hosp")) unl("abd");
        unl("cum");
        /* The career counter, revealed only now. You made every call on
           what you could see in a sixty-second break; this is what was
           adding up underneath it the whole time. */
        const career = Math.round(m.career),
          careerTone = career < 45 ? "k" : career < 95 ? "w" : "r",
          carePct = Math.max(3, Math.min(100, Math.round((career / 140) * 100))),
          afterYears =
            career < 45 && !m.boutsConcussed
              ? "He coaches now, in the same gym, mostly kids. He tells the same stories badly and at length, and he remembers every round of every one of them."
              : career < 95 && m.boutsConcussed <= 1
                ? "He gets headaches some weeks, and bright light bothers him more than it used to. He says that is just getting older. It might be. You find you watch him a little more carefully than you once did."
                : "He is in his thirties and loses words halfway through sentences, then covers it with the same joke. He does not drive any more. On the good days he is exactly who he always was.";
        const L = [];
        if (m.conc || G.fc || t == "ko" || t == "medstop" || G.hits > 12)
          L.push(LS.conc);
        if (m.abd || t.startsWith("hosp")) L.push(LS.abd);
        if (ko) L.push(LS.fr);
        if (t == "towel" || t == "medstop") L.push(LS.stop);
        if (m.conc || G.fc || t == "ko") L.push(LS.sic);
        if (G.hits > 12 || m.peak >= 20 || t == "ko") L.push(LS.cum);
        L.push(LS.hide, LS.load);
        $("#cv").style.display = "none";
        $("#sub").textContent = "Tournament over";
        $("#m").innerHTML =
          `<div class="c"><h2>${T[0]}</h2><p>${T[1]}</p><div class="essential-warning"><b>Post-bout:</b> Observe now and later. Delayed concerns need assessment; emergency signs require emergency care (119 in South Korea).</div>${infoButton("Post-bout check", "Every fighter, winner or loser, needs immediate observation and a repeat check later in a quiet setting; symptoms can be delayed. This game cannot perform that check. Seek professional assessment for concerns; call 119 in South Korea for emergency warning signs.", "recovery")}<div class="mu">Record ${G.w}–${G.l} · Simulated game counters only: hits ${G.hits} · peak head-exposure indicator ${Math.round(m.peak)} · ringside-observation interactions ${G.doc}${G.fc ? " · fought while injured" : ""}</div></div>
          <div class="c res" style="border-color:var(--wn)"><div class="sl" style="margin-top:0">TEN YEARS LATER</div>
            <p style="font:14px/1.65 Arial,sans-serif;color:#e8eef5">${afterYears}</p>
            <div class="mu" style="margin-top:12px">Career head exposure — counted every round, never once shown to you</div>
            <div class="bar" style="height:16px"><i class="${careerTone}" style="width:${carePct}%;background:${career < 45 ? "var(--ok)" : career < 95 ? "var(--wn)" : "var(--ac)"}"></i></div>
            <div class="mu">Bouts finished with a concussion present: <b class="${m.boutsConcussed ? "r" : "k"}">${m.boutsConcussed}</b></div>
            <div class="note" style="margin-top:10px"><b class="w">Honestly:</b> real outcomes are probabilistic, not scripted. Plenty of fighters with heavy exposure stay well, and the long-term picture is still being researched. This ending is a teaching device, not a prediction — the reason the rules are cautious is that nobody can tell you in advance which fighter they are coaching.</div>
          </div><div class="c">${compactDetail("Coach’s notebook", L.map((x) => `<p class="mu">${escapeUI(x)}</p>`).join("") + `<p class="mu">Educational prototype, not medical advice. In real life, follow your sport’s medical rules and a qualified doctor.</p>`)}</div><div class="c"><h2>📖 Codex ${Object.keys(G.cx || {}).length}/${Object.keys(CX).length}</h2>${
            Object.keys(G.cx || {}).length
              ? `${compactDetail(
                  "Unlocked topics",
                  Object.keys(G.cx)
                    .map((k) => `<p class="mu">${escapeUI(CX[k][0])}</p>`)
                    .join(""),
                )}<button class="b" onclick="cdx()">Read your Codex entries</button>`
              : "<p class=mu>Nothing unlocked. Try a doctor exam next time.</p>"
          }</div>${t === "sdh" ? `<button class="b p" onclick="er()">🚑 Call 119 in South Korea / emergency services</button>` : ""}${t === "champ" ? `<button class="b p" onclick="credits()">View credits ▶</button>` : ""}<button class="b p" onclick="newGame()">Coach again</button>`;
      }
      /* ---------- CANVAS ---------- */
      const cv = $("#cv"),
        cx = cv.getContext("2d");
      function bx(x, c, d, w) {
        const attacking = A && A.who == w,
          hit = A && A.who != w && A.hit;
        const swing = attacking ? Math.sin(Math.min(1, A.t) * Math.PI) : 0;
        const recoil = hit ? Math.sin(Math.min(1, A.t) * Math.PI) * 7 : 0;
        const p = Math.round(x + swing * 20 * d - recoil * d),
          enemy = w === 1;
        const skin = enemy ? "#a96848" : "#d9956e",
          hair = enemy ? "#15121a" : "#17202b";
        const trim = enemy ? "#ffc64c" : "#8cd7ff",
          glove = enemy ? "#e64a3d" : "#3e94e6";
        const block = (x, y, w, h, col) => {
          cx.fillStyle = col;
          cx.fillRect(
            Math.round(x),
            Math.round(y),
            Math.round(w),
            Math.round(h),
          );
        };
        const outline = (x, y, w, h, col) => {
          block(x - 2, y - 2, w + 4, h + 4, "#05070c");
          block(x, y, w, h, col);
        };
        // boots, staggered legs, and a deliberately chunky sprite silhouette
        outline(p - 17, 178, 15, 5, "#14191f");
        outline(p + 3, 178, 15, 5, "#14191f");
        block(p - 13, 151, 10, 28, "#203347");
        block(p + 3, 151, 10, 28, "#17283a");
        outline(p - 18, 132, 36, 22, c);
        block(p - 14, 136, 28, 5, trim);
        block(p - 7, 151, 14, 4, "#080b11");
        // head, hair, ear and face highlights
        outline(p - 11, 91, 22, 25, skin);
        block(p - 11, 89, 22, 8, hair);
        block(p - 7, 98, 4, 3, "#f6c49a");
        block(p + 5, 100, 3, 3, "#05070c");
        block(p + 9, 101, 3, 6, skin);
        // guard hand and rear arm
        outline(p - d * 22, 120, 9, 18, skin);
        outline(p - d * 26, 115, 15, 12, glove);
        block(p - d * 24, 117, 10, 3, trim);
        // lead arm extends on a punch; body-target shots visibly dip the glove
        const fx = Math.round(p + d * (18 + swing * 34)),
          fy = attacking && A.tgt === "b" ? 130 : 108;
        block(p + d * 13, 119, Math.round(d * 10), 7, skin);
        outline(fx - 7, fy - 6, 15, 13, glove);
        block(fx - 4, fy - 4, 9, 3, trim);
        if (hit) {
          block(p - d * 14, 104, 5, 4, "#fff0bd");
          block(p - d * 18, 109, 4, 3, "#fff0bd");
        }
      }
      function fatigueHealthPercent(fatigue) {
        const pointsOverThreshold = Math.max(0, Math.min(70, Number(fatigue) - 30));
        return Math.round(100 - pointsOverThreshold);
      }
      /* ══ CORNER SCENE ═════════════════════════════════════════════
         The round break, seen over the coach's shoulder: the fighter on
         the stool with the bucket, towel and bottle. This is the screen
         the whole game is about, so the rule is strict — the warning
         signs are PERFORMED by the body and nothing on screen points at
         them. No outline, no tint, no zoom, no slow motion. If the player
         misses a sign, they missed it.

         Reads G.me, F and A3 state. Writes only CORNER, which is view
         state, never game state.                                        */

      const CORNER = {
        /* far enough back that his whole upper body is readable — this
           is the screen the player has to read, so framing is function */
        cam: { x: 0.30, y: 1.46, z: 3.45, lx: -0.02, ly: 0.86, lz: 0, fov: 0.82 },
        f: null, act: "", actT: 0, blink: 0, sway: 0, t: 0,
      };
      /* the corner actions set this purely so the scene can play a beat.
         It is a render flag; the simulation never reads it. */
      function cornerAct(name) { CORNER.act = name; CORNER.actT = 1; }

      function cornerDrive(dt) {
        if (!CORNER.f) {
          CORNER.f = a3Fighter(-1, "You", "#2f6fb0", "#1d4a78", "player");
          CORNER.f.bare = true;
          CORNER.f.seated = true;
          CORNER.f.x = 0; CORNER.f.z = 0; CORNER.f.yaw = 0;
          CORNER.f.vx = 0; CORNER.f.vz = 0;
        }
        const f = CORNER.f, m = G && G.me ? G.me : null;
        f.dt = dt;
        f.y = -0.48;                       /* sat down on the stool */
        CORNER.t += dt;
        CORNER.actT = Math.max(0, CORNER.actT - dt * 0.9);
        if (CORNER.actT <= 0) CORNER.act = "";

        if (!m) return;
        f.fat = m.fat;
        f.cut = m.cut;
        f.sore = m.hand ? 1 : 0;
        f.guarded = m.body >= BAL.medical.bodyStop * 0.55 ? 1 : 0;
        f.eyeShut = m.eye ? 1 : 0;
        /* the brain signs. conc is the real thing; heavy head exposure
           reads as the softer version of the same picture. */
        f.vacant = m.conc ? 1 : (m.head >= BAL.medical.headWarn * 1.6 ? 0.6 : 0);
        f.unsteady = m.conc ? 1 : 0;
        /* breathing rate rides fatigue, and a concussed fighter sways */
        f.breath = 0.6 + (m.fat / 100) * 1.6;
        CORNER.sway = f.unsteady ? Math.sin(CORNER.t * 1.3) * 0.045 : 0;
        f.step = CORNER.t * f.breath;
      }

      function cornerProps(out, f) {
        /* stool, under him */
        const b = (x, y, z, sx, sy, sz, c, bias) =>
          a3BoxWorld(out, x, y, z, sx, sy, sz, c, bias);
        b(0, 0.22, 0, 0.09, 0.44, 0.09, "#2b3340", 0);
        b(0, 0.455, 0, 0.42, 0.07, 0.34, "#1d2430", 0);
        b(0, 0.49, 0, 0.40, 0.02, 0.32, "#2f3a48", 0.005);
        b(-0.18, 0.03, 0.02, 0.26, 0.06, 0.26, "#141a22", 0);
        /* bucket and bottle beside it, towel over the rope behind */
        b(0.56, 0.14, 0.18, 0.26, 0.28, 0.26, "#36414f", 0);
        b(0.56, 0.29, 0.18, 0.28, 0.03, 0.28, "#4b5a6b", 0);
        b(0.40, 0.11, 0.34, 0.07, 0.22, 0.07, "rgb(206,212,219)", 0.01);
        b(-0.52, 0.62, -0.10, 0.30, 0.46, 0.05, "#d8d2c4", 0);
      }
      /* a cuboid straight in world space, for props that hang off no bone */
      function a3BoxWorld(out, cx, cy, cz, sx, sy, sz, col, bias) {
        const hx = sx / 2, hy = sy / 2, hz = sz / 2;
        const V = A3_CORNER.map((c) => ({
          x: cx + c[0] * hx, y: cy + c[1] * hy, z: cz + c[2] * hz,
        }));
        for (const F of A3_FACE)
          out.push({
            v: [V[F[0]], V[F[1]], V[F[2]], V[F[3]]],
            nx: F[4], ny: F[5], nz: F[6], col, bias: bias || 0,
          });
      }

      function cornerScene(ctx, W, H) {
        const f = CORNER.f;
        if (!f) return;
        const faces = [];

        /* the ring behind him, and the dark hall beyond it */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#080d16"); g.addColorStop(0.6, "#121a28"); g.addColorStop(1, "#080b12");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        /* corner post and the two ropes meeting behind the stool */
        a3BoxWorld(faces, -0.95, 0.75, -0.95, 0.13, 1.5, 0.13, "#cfd8e2", 0);
        for (let i = 0; i < 3; i++) {
          const y = 0.42 + i * 0.42, c = ["#d94f3e", "#e8e2d0", "#3e94e6"][i];
          a3BoxWorld(faces, -0.2, y, -0.95, 1.7, 0.05, 0.05, c, 0);
          a3BoxWorld(faces, -0.95, y, -0.2, 0.05, 0.05, 1.7, c, 0);
        }
        a3BoxWorld(faces, 0, -0.01, 0, 4.2, 0.04, 4.2, "#6d5468", 0);

        cornerProps(faces, f);
        a3BuildFighter(faces, f, 0);

        const cam = CORNER.cam;
        a3Draw(ctx, W, H, cam, faces, [-0.30, 0.72, 0.62]);

        /* the coach's shoulder and head, in the near foreground and out
           of focus by virtue of being a flat dark mass */
        ctx.save();
        ctx.fillStyle = "rgba(6,9,14,.9)";
        ctx.beginPath();
        ctx.ellipse(W * 0.03, H * 1.16, W * 0.26, H * 0.42, 0, 0, 6.3);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W * 0.045, H * 0.86, W * 0.075, H * 0.12, 0, 0, 6.3);
        ctx.fill();
        ctx.restore();

        /* the cutman only appears when he is working, and the doctor only
           when called — both are people in the frame, not UI */
        if (CORNER.act === "cut" || CORNER.act === "doctor") {
          const k = CORNER.actT;
          ctx.save();
          ctx.fillStyle = CORNER.act === "doctor" ? "rgba(214,222,232,.96)" : "rgba(28,36,48,.96)";
          const hx = W * (0.93 - k * 0.05);
          ctx.beginPath();
          ctx.ellipse(hx, H * 1.02, W * 0.17, H * 0.36, 0, 0, 6.3);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(hx - W * 0.015, H * 0.66, W * 0.062, H * 0.10, 0, 0, 6.3);
          ctx.fill();
          /* a swab pressed to the cut, or a penlight held to the eye */
          ctx.fillStyle = CORNER.act === "doctor" ? "rgba(255,244,205,.92)" : "rgba(226,226,220,.95)";
          ctx.fillRect(W * (0.70 - k * 0.07), H * 0.52, W * 0.055, H * 0.035);
          ctx.restore();
        }
        if (CORNER.act === "water") {
          ctx.save();
          ctx.fillStyle = "rgba(150,210,245,.75)";
          ctx.fillRect(W * 0.505, H * 0.47, W * 0.011, H * 0.09 * CORNER.actT);
          ctx.restore();
        }
      }

      /* ══ BOUT SCENE ═══════════════════════════════════════════════
         The career bout rendered with the same rig the 1v1 Arena uses,
         on a side-on broadcast camera. This is a VIEW ONLY: it reads A,
         F and G.me and never writes them, so the simulation — and the
         parity signature — are untouched. The HUD and every piece of
         copy over the top stay exactly as they were.                   */

      const BOUT = {
        cam: { x: 0, y: 1.95, z: -4.3, lx: 0, ly: 1.12, lz: 0, fov: 0.92 },
        push: 0, shake: 0,
        p: null, o: null, lastA: null,
      };

      function boutFighters() {
        if (BOUT.p) return;
        BOUT.p = a3Fighter(-1, "You", "#2f6fb0", "#1d4a78", "player");
        BOUT.o = a3Fighter(1, "Opp", "#a8382c", "#75241b", "rival");
        for (const f of [BOUT.p, BOUT.o]) {
          f.bare = true;              /* in the ring, not in the entrance robe */
          f.z = 0; f.y = 0; f.vx = 0; f.vz = 0;
          f.hitT = 0; f.lunge = 0; f.guard = 1;
        }
        BOUT.p.x = -0.85; BOUT.p.yaw = Math.PI / 2;
        BOUT.o.x = 0.85;  BOUT.o.yaw = -Math.PI / 2;
      }

      /* Everything here is derived from the exchange the sim already ran.
         A is {who, tgt, t, hit}: who threw, head or body, how far through
         the animation, and whether it landed. */
      function boutDrive(dt) {
        boutFighters();
        const P = BOUT.p, O = BOUT.o;
        P.dt = O.dt = dt;
        const stance = F && typeof F.stance === "number" ? F.stance : 1;

        for (const f of [P, O]) {
          f.lunge = Math.max(0, f.lunge - dt * 4.5);
          f.hitT = Math.max(0, f.hitT - dt * 3.2);
          f.step += dt * 3.4;
        }
        /* guard rides the game plan: defend tucks up, attack drops and leans in */
        P.guard = stance === 0 ? 1.25 : stance === 2 ? 0.72 : 1;
        O.guard = 1;

        if (A) {
          const atk = A.who ? O : P, def = A.who ? P : O;
          const swing = Math.sin(Math.min(1, A.t) * Math.PI);
          atk.lunge = Math.max(atk.lunge, swing);
          if (A.hit && A.t > 0.3) {
            def.hitT = Math.max(def.hitT, 1 - (A.t - 0.3) / 0.7);
            def.hitLow = A.tgt === "b";
          }
          /* a landed shot pushes the camera in and shakes it a little —
             the Camera Shake setting still governs the screen-level shake */
          if (A.hit && A !== BOUT.lastA) {
            BOUT.push = A.tgt === "h" ? 0.5 : 0.3;
            BOUT.shake = uiPrefs.shake ? 0 : (A.tgt === "h" ? 1 : 0.6);
            BOUT.lastA = A;
          }
        }
        BOUT.push = Math.max(0, BOUT.push - dt * 1.6);
        BOUT.shake = Math.max(0, BOUT.shake - dt * 5);

        /* fatigue and injury are read straight off the sim's own flags —
           the body shows them, nothing highlights them */
        const m = G && G.me ? G.me : null;
        if (m) {
          P.fat = m.fat;
          P.cut = m.cut;
          P.sore = m.hand ? 1 : 0;
          P.guarded = m.body >= BAL.medical.bodyStop * 0.55 ? 1 : 0;
        }
        /* camera: side on, easing in on impact */
        const c = BOUT.cam;
        const wantZ = -4.3 + BOUT.push * 0.55;
        c.z += (wantZ - c.z) * Math.min(1, dt * 4);
        c.ly += (1.12 - c.ly) * Math.min(1, dt * 4);
      }

      function boutScene(ctx, W, H) {
        boutFighters();
        const faces = [];
        a3BuildArena(faces);
        /* far fighter first is irrelevant — the sort handles it — but
           building the opponent first keeps the face list stable */
        a3BuildFighter(faces, BOUT.o, BOUT.o.hitT > 0.5 ? 1 : 0);
        a3BuildFighter(faces, BOUT.p, BOUT.p.hitT > 0.5 ? 1 : 0);

        const c = BOUT.cam;
        const sh = BOUT.shake;
        const cam = sh > 0
          ? { x: c.x + Math.sin(sh * 37) * sh * 0.06, y: c.y + Math.cos(sh * 29) * sh * 0.05,
              z: c.z, lx: c.lx, ly: c.ly, lz: c.lz, fov: c.fov }
          : c;

        /* hall behind the ring */
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#070c15"); g.addColorStop(0.5, "#131d2c"); g.addColorStop(1, "#060a11");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        a3Draw(ctx, W, H, cam, faces, [-0.48, 0.74, 0.47]);

        /* the banner over the ring keeps its words */
        ctx.save();
        ctx.fillStyle = "#08101d";
        /* below the HUD bar, which occupies the top 13%. In the pixel
           build this banner was drawn under it and never once visible. */
        ctx.fillRect(W * 0.31, H * 0.150, W * 0.38, H * 0.082);
        ctx.fillStyle = "#203d59";
        ctx.fillRect(W * 0.32, H * 0.160, W * 0.36, H * 0.062);
        ctx.fillStyle = "#fff0bd";
        ctx.textAlign = "center";
        ctx.font = "bold " + Math.round(H * 0.042) + "px monospace";
        ctx.fillText("INSIDE THE IMPACT", W * 0.5, H * 0.208);
        ctx.restore();
      }

      /* The bout canvas renders the 3D scene at full backing resolution,
         then the HUD draws in the original 360x210 space through a scale
         transform — so every HUD coordinate, bar and word below is exactly
         what it was, and none of it had to be retyped. */
      let boutLast = 0;
      function draw() {
        const S = cv.width / 360;
        const block = (x, y, w, h, col) => {
          cx.fillStyle = col;
          cx.fillRect(
            Math.round(x),
            Math.round(y),
            Math.round(w),
            Math.round(h),
          );
        };
        const now = performance.now();
        const dt = boutLast ? Math.min(0.05, (now - boutLast) / 1000) : 0.016;
        boutLast = now;
        cx.setTransform(1, 0, 0, 1, 0, 0);
        cx.imageSmoothingEnabled = true;
        /* between rounds he is on the stool, not stood in the middle */
        if (document.body.dataset.s === "break") {
          cornerDrive(dt);
          cornerScene(cx, cv.width, cv.height);
        } else {
          boutDrive(dt);
          boutScene(cx, cv.width, cv.height);
        }
        /* back into 360x210 for the HUD, unchanged */
        cx.setTransform(S, 0, 0, S, 0, 0);
        cx.imageSmoothingEnabled = false;
        // black arcade HUD with score, energy bars, and round indicator
        block(0, 0, 360, 28, "#05080f");
        block(4, 4, 148, 20, "#152b40");
        block(208, 4, 148, 20, "#2b1821");
        if (F && F.r) {
          const health = fatigueHealthPercent(G.me.fat),
            healthColor = health >= 70 ? "#59d66d" : health >= 50 ? "#ffd15e" : "#f05143",
            of = Math.max(0, F.oh / F.mh),
            nm = G.opp.n.toUpperCase().slice(0, 16);
          block(8, 15, 126, 6, "#07121c");
          block(8, 15, Math.floor(126 * health / 100), 6, healthColor);
          block(226, 15, 126, 6, "#07121c");
          block(
            352 - Math.floor(126 * of),
            15,
            Math.floor(126 * of),
            6,
            "#f05143",
          );
          cx.fillStyle = "#cbeeff";
          cx.font = "bold 7px monospace";
          cx.fillText("YOU // HEALTH " + health + "%", 8, 11);
          cx.fillStyle = "#ffd7c0";
          cx.fillText(nm, 352 - cx.measureText(nm).width, 11);
          block(156, 4, 48, 20, "#d59b35");
          block(159, 7, 42, 14, "#0a111b");
          cx.fillStyle = "#fff3cf";
          cx.font = "bold 10px monospace";
          cx.fillText("R" + F.r + "/" + F.R, 165, 17);
          if (F.kd) {
            block(70, 43, 220, 28, "#1a0b14");
            cx.fillStyle = "#fff1c1";
            cx.font = "bold 21px monospace";
            cx.fillText("KNOCKDOWN", 89, 64);
          }
        }
        if (A && A.hit && A.t > 0.36) {
          const x = A.who ? 117 : 243,
            y = A.tgt === "h" ? 101 : 133;
          cx.strokeStyle = "rgba(255,237,164," + (1 - A.t).toFixed(2) + ")";
          cx.lineWidth = 3;
          cx.beginPath();
          cx.arc(x, y, 8 + A.t * 20, 0, Math.PI * 2);
          cx.stroke();
          cx.fillStyle = "#fff1ba";
          cx.font = "bold 13px monospace";
          cx.fillText(A.who ? "OW!" : "POW!", x - 15, y - 21);
        }
      }
      (function L() {
        if (A) {
          A.t += 0.07;
          if (A.t > 1.1) A = null;
        }
        if (cv.style.display == "block") draw();
        requestAnimationFrame(L);
      })();
      loadProfile();
      loadSettings();
      applySettings();
      newGame();
      installRewards();
      bootUp();
    
/* ── Redesign interactions ─────────────────────────────────── */

(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const panel = $("#monitor-anatomy"), cv = $("#cv"), mapDialog = $("#exposure-dialog");
  let mapReturnFocus = null;
  const mapInfo = {
    brain: {title:"Brain exposure map", description:"A simplified fictional game indicator for cumulative simulated head-exposure counters. Regions are illustrative only; they are not a brain scan, injury location, or severity rating."},
    torso: {title:"Torso exposure map", description:"A simplified fictional game indicator for cumulative simulated body-exposure counters. Organ shapes are illustrative only; they do not identify an injured organ or measure tissue damage."}
  };
  function setMapTiles(){
    if(!panel) return;
    $$(".row2 > div",panel).forEach((tile,index)=>{
      const key=index===0?"brain":"torso";
      tile.dataset.exposureMap=key;
      tile.setAttribute("role","button");
      tile.setAttribute("tabindex","0");
      tile.setAttribute("aria-label","Open larger fictional "+mapInfo[key].title.toLowerCase());
      tile.title="Open larger map visualization";
    });
  }
  function openMap(key,tile){
    if(!mapDialog||!panel) return;
    setMapTiles();
    const sourceTile=$(".row2 > div[data-exposure-map='"+key+"']",panel);
    const sourceSvg=sourceTile&&$("svg",sourceTile);
    if(!sourceSvg) return;
    mapReturnFocus=tile||sourceTile;
    $("#exposure-title").textContent=mapInfo[key].title;
    $("#exposure-explanation").textContent=mapInfo[key].description;
    const figure=$("#exposure-figure"); figure.replaceChildren();
    const svg=sourceSvg.cloneNode(true);
    const idPrefix="mapview-"+Date.now()+"-";
    const idMap=new Map();
    $$('[id]',svg).forEach(el=>{const old=el.id;const next=idPrefix+old;idMap.set(old,next);el.id=next;});
    $$('*',svg).forEach(el=>[...el.attributes].forEach(attr=>{
      let value=attr.value;
      idMap.forEach((next,old)=>{value=value.replaceAll("url(#"+old+")","url(#"+next+")").replaceAll("#"+old,"#"+next);});
      if(value!==attr.value) el.setAttribute(attr.name,value);
    }));
    figure.append(svg);
    if(!mapDialog.open) mapDialog.showModal();
    $("#exposure-close").focus({preventScroll:true});
  }
  if(panel){
    new MutationObserver(setMapTiles).observe(panel,{childList:true,subtree:true});
    setMapTiles();
    panel.addEventListener("click",event=>{
      const tile=event.target.closest(".row2 > div[data-exposure-map]");
      if(!tile||event.target.closest(".diagram-context")) return;
      openMap(tile.dataset.exposureMap,tile);
    });
    panel.addEventListener("keydown",event=>{
      const tile=event.target.closest(".row2 > div[data-exposure-map]");
      if(tile&&(event.key==="Enter"||event.key===" ")){event.preventDefault();openMap(tile.dataset.exposureMap,tile);}
    });
  }
  $("#exposure-close")?.addEventListener("click",()=>mapDialog.close());
  mapDialog?.addEventListener("close",()=>{if(mapReturnFocus?.isConnected)mapReturnFocus.focus({preventScroll:true});});

  const m=$("#m"), campTrainingTop=$("#camp-training-top");
  function syncCampTrainingMenu(){
    if(!campTrainingTop||!m)return;
    const camp=document.body.dataset.phase==="camp";
    const menu=m.querySelector(".camp-training-menu");
    if(!camp){campTrainingTop.replaceChildren();campTrainingTop.hidden=true;updateTrainingFatigueRule();return;}
    if(menu&&menu.parentElement!==campTrainingTop)campTrainingTop.replaceChildren(menu);
    campTrainingTop.hidden=campTrainingTop.childElementCount===0;
    updateTrainingFatigueRule();
  }
  if(m){
    new MutationObserver(()=>{syncCampTrainingMenu();syncTournamentProgress();}).observe(m,{childList:true,subtree:true,characterData:true});
    syncCampTrainingMenu();
  }
  syncTournamentProgress();
  const explanations={
    stats:"Power, Speed, Defence, Stamina, and fatigue are fictional game values used by the simulation. They are not fitness tests or health measurements.",
    maps:"Brain and torso colors visualize fictional game exposure counters. They are not scans, injury locations, diagnoses, or severity measurements. Open a map in the status panel for the larger view.",
    safety:"Warning signs mean stop contact. Suspected concussion means no same-day return and qualified assessment. A normal-looking check, rest, or water cannot provide medical clearance. Emergency danger signs require local emergency services."
  };
  document.addEventListener("click",event=>{
    const mapButton=event.target.closest("[data-open-exposure]");
    if(mapButton){openMap(mapButton.dataset.openExposure,mapButton);return;}
    const button=event.target.closest("[data-guide-explanation]");
    if(!button)return;
    const target=$("#guide-explanation"); if(!target)return;
    const key=button.dataset.guideExplanation;
    const isOpen=button.getAttribute("aria-expanded")==="true";
    $$('[data-guide-explanation]').forEach(b=>b.setAttribute("aria-expanded","false"));
    if(isOpen){target.hidden=true;target.textContent="";return;}
    button.setAttribute("aria-expanded","true");target.textContent=explanations[key]||"";target.hidden=false;
  });
})();
