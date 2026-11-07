# Check of the phone and failure fixes

Independent check of branch phone-fixes. Nothing in game code is edited by this check. Scripts and frames: scratchpad phone/check1. fps and timing from this Mac say little (Low Power Mode, other agents' Chrome, 8 GB).

## Check round 1: status
- Started 2026-11-07 about 21:30 UTC+9 at usage 53. Mac on battery at 5% at the start, so this can die at any time: the list below is what is done so far.
- 21:40 battery 2%. Scripts: scratchpad phone/check1 (q1.sh runs the flows scenarios that never ran, results flows/out; q2.sh runs c_quick, c_lost, c_hidden, c_layout through run.sh, results o/NAME.txt, j.py NAME prints one; c_leak.js is written, not yet run). To restart: read this file, then run what has no result yet.
- First result, not yet explained: s3 stress on low, garbage collected, each open and close leaves 492 nodes, 11 listeners and about 1.1 MB of heap. Mode Select alone is 69 nodes and 7 listeners of that. integrate.md had only the 69 before. To chase with c_leak.js.
