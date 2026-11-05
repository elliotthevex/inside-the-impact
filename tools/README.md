# Pre-deploy checks

Two layers. The first is automatic, the second needs a browser, and the
second is the one that matters.

## 1. `jscheck.py` — does it parse?

```sh
python3 -I site/tools/jscheck.py inside-the-impact.html
```

Pulls every `<script>` out of the page, wraps each body in an uncalled
function and hands it to JavaScriptCore via `osascript -l JavaScript`.
Only syntax errors surface; no browser globals are touched.

Caught: `\"gym\"` inside a `${}` interpolation, where backslash escapes
do not apply and the stray backslash killed the whole script.

## 2. `smoke.js` — does it actually start?

Serve it over HTTP rather than opening the file directly. The build is
now too large for the browser pane's `file://` snapshot, and a real
origin also gives you working `localStorage`, which `data:` URLs block:

```sh
python3 tools/serve.py        # http://127.0.0.1:8781
```

```
open http://localhost:8781/   # wait ~9s for boot to clear
paste site/tools/smoke.js into the console
```

Returns `{pass, ran, failures}`. Deploy only on `pass: true`.

It checks that init finished (`#boot` is gone, the lobby exists, the
reward hook is installed), that every global the screens rely on is
declared, that all three lobby views render, that all seven overlay
screens open **and** close, and that the multiplier, upgrade-ladder and
gym-level maths are still sane.

Caught: deleting the old gym block also deleted `let lobbyView`. That is
valid syntax, so layer 1 passed it — but `intro()` threw, which meant
`bootUp()` never ran and the live site sat on the loading screen.
The smoke test reports exactly that:

```
pass: false
failures:
  boot cleared — init threw before bootUp()
  lobby built
  reward hook installed
  globals declared — missing: lobbyView
```

## Why a parse check alone is not enough

Verified against a rebuilt copy of that regression: `jscheck.py` printed
`ALL SCRIPTS PARSE`, and the smoke test failed it. Run both.

## 3. `parity.js` — did the simulation move?

```
open http://127.0.0.1:8090/inside-the-impact.html   # wait for boot
paste site/tools/parity.js into the console
```

Returns `{signature, covered, notes}`. Capture the signature before a change
and compare after. Identical = the simulation is untouched.

Baseline at the time of writing: **3bea3b59**

Proven to bite: nudging `BAL.medical.headWarn` from 7 to 8 — a single point —
moves it to `88e5684e`. Restoring brings `3bea3b59` straight back.

This exists because the renderer is being replaced and the simulation must not
drift underneath it. This game teaches a safety judgement; if the thresholds
move during a visual rewrite, the lesson moves and nothing on screen says so.

Scope is deliberately honest and stated in the file header: it locks the
opponent ladder, the medical thresholds and the sign logic that reads them, the
progression maths, and a seeded exchange model built on the real constants. It
does NOT drive the DOM bout flow, which is a timer chain and needs a headless
driver. That is the next layer, not this one.
