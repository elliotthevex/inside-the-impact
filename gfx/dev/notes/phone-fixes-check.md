# Check of the phone and failure fixes

Independent check of branch phone-fixes. Nothing in game code is edited by this check. Scripts and frames: scratchpad phone/check1. fps and timing from this Mac say little (Low Power Mode, other agents' Chrome, 8 GB).

## Check round 1: status
- Started 2026-11-07 about 21:30 UTC+9 at usage 53. Mac on battery at 5% at the start, so this can die at any time: the list below is what is done so far.
- 21:40 battery 2%. Scripts: scratchpad phone/check1 (q1.sh runs the flows scenarios that never ran, results flows/out; q2.sh runs c_quick, c_lost, c_hidden, c_layout through run.sh, results o/NAME.txt, j.py NAME prints one; c_leak.js is written, not yet run). To restart: read this file, then run what has no result yet.
- First result, not yet explained: s3 stress on low, garbage collected, each open and close leaves 492 nodes, 11 listeners and about 1.1 MB of heap. Mode Select alone is 69 nodes and 7 listeners of that. integrate.md had only the 69 before. To chase with c_leak.js.
- 21:46 battery 1%. Queued in scratchpad phone/check1: q1.sh (flows), q2.sh, q3.sh (audit's own scripts and c_leak), q4.sh (c_hang, c_fine, c_gl, c_css, c_lostresize, c_hang3, c_net). One Chrome at a time through the lock. The stress table's leak in s3 is probably that script's own __gl list holding contexts, and so the removed overlay: c_leak.js uses weak references to tell. Read from code, to prove in c_hang: game.js freshPage: Exit during "Checking the connection" does not stop the check, so the panel comes back or the page reloads after the player left.
- iOS run not started. Tools ready: phone/check1/ios/serve2.py (POST /__set {"fail":{"substr":n},"hang":[],"delay":{}}), ios.py, st.js, t2.js.
