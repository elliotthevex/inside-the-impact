# Phone fixes: what strands real players

Branch phone-fixes, worktree phone-fixes/. Finding numbers refer to audit-findings.md. Newest log entry at the bottom.

## Plan (order A to G, commit after each group)
A failure panel, B context loss, C loading, D sound, E touch and keys, F frame rate, G memory on low. Then full matches, gates, final list.

## Log
- 19:55 read everything. Nothing written yet.
- 20:20 A, B, C, D written and checked with the audit's steps, committed (b3adaea). Scripts are in the scratchpad phone/audit (lib.js, run.sh, s_*.js, p_*.js, res.py, j.py, o/ for results).
- 20:45 E, F, G patches applied in the working tree; E checked. G and F checks running. NEXT if restarted: read scratchpad phone/audit/o/tally1, audio_touch, audio_js, layout; run F before/after (s_fps.js on 8791 and the old copy on 8793, scratchpad phone/before, `python3 -I -m http.server 8793 --bind 127.0.0.1` from there); slow line s_slow.js with --net 500:300; hung file s_hang.js; then full matches with play.js, gates, final report in this file.
- 21:05 G measured: GPU tally low 282.2 to 115.7 MB at 844x390, 276.7 to 110.3 MB at 390x844 dpr 3. jsc table with 150 seeds: harness loop at 60 and the new tick loop agree within noise (mixed 26.7 and 28, learner 28.7 and 26.7, skilled 62 and 64), the old loop at 30 fps does not (34.7, 33.3, 68). Real frame before and after running in the batch phone/audit/b6.sh. play.js has a touch bot now (spec.touch).
