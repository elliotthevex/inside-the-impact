#!/usr/bin/env python3
"""Parse-check every <script> block in an HTML file using macOS JXA.
The script bodies are wrapped in an uncalled function, so only syntax
errors surface - no browser globals are touched."""
import re, subprocess, sys, tempfile, os

path = sys.argv[1]
html = open(path, encoding="utf-8").read()
blocks = re.findall(r"<script\b[^>]*>(.*?)</script>", html, re.S)
bad = 0
for i, body in enumerate(blocks):
    if not body.strip():
        continue
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write("function __parseCheck__(){\n" + body + "\n}\n")
        tmp = f.name
    r = subprocess.run(["osascript", "-l", "JavaScript", tmp],
                       capture_output=True, text=True)
    err = (r.stderr or "").strip()
    os.unlink(tmp)
    if "SyntaxError" in err or "Unexpected" in err or "Invalid" in err:
        print(f"SCRIPT #{i}: {err.splitlines()[0][:300]}")
        bad += 1
    else:
        print(f"SCRIPT #{i}: ok ({len(body)} bytes)")
print("FAIL" if bad else "ALL SCRIPTS PARSE")
sys.exit(1 if bad else 0)
