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
