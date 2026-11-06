#!/usr/bin/env python3
"""Parse-check every script a page has, using macOS JXA: inline <script> blocks
and local <script src> files. The bodies are wrapped in an uncalled function, so
only syntax errors surface - no browser globals are touched.

A local script or stylesheet that cannot be read fails, and so does a page with
no scripts at all: the page keeps its code in game.js and its styles in style.css,
and a check that looks only at inline blocks would find nothing and still pass."""
import os, re, subprocess, sys, tempfile
from html.parser import HTMLParser


class Page(HTMLParser):
    """What a browser would load: any attribute quoting is understood, comments are skipped."""

    def __init__(self):
        super().__init__()
        self.scripts = []  # [src or None, inline body]
        self.sheets = []
        self.open_script = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script":
            self.open_script = [a.get("src"), ""]
            self.scripts.append(self.open_script)
        elif tag == "link" and (a.get("rel") or "").lower() == "stylesheet" and a.get("href"):
            self.sheets.append(a["href"])

    def handle_data(self, data):
        if self.open_script:
            self.open_script[1] += data

    def handle_endtag(self, tag):
        if tag == "script":
            self.open_script = None


def local_file(url):
    """The file behind a relative or root-relative URL, or None for another host."""
    if re.match(r"(?:[a-z][a-z0-9+.-]*:)?//", url, re.I):
        return None
    return os.path.join(base, re.split(r"[?#]", url)[0].lstrip("/"))


path = sys.argv[1]
base = os.path.dirname(os.path.abspath(path))
page = Page()
page.feed(open(path, encoding="utf-8").read())
page.close()
bad = 0
checked = 0
for url in page.sheets:
    local = local_file(url)
    if local and not os.path.isfile(local):
        print(f"STYLESHEET {url}: missing, looked for {local}")
        bad += 1
for i, (src, body) in enumerate(page.scripts):
    label = f"SCRIPT #{i}"
    if src:
        label += f" {src}"
        local = local_file(src)
        if not local:
            print(f"{label}: skipped, not a local file")
            continue
        try:
            body = open(local, encoding="utf-8").read()
        except OSError as e:
            print(f"{label}: cannot read {local}: {e.strerror}")
            bad += 1
            continue
    if not body.strip():
        continue
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write("function __parseCheck__(){\n" + body + "\n}\n")
        tmp = f.name
    r = subprocess.run(["osascript", "-l", "JavaScript", tmp],
                       capture_output=True, text=True)
    err = (r.stderr or "").strip()
    os.unlink(tmp)
    checked += 1
    if "SyntaxError" in err or "Unexpected" in err or "Invalid" in err:
        print(f"{label}: {err.splitlines()[0][:300]}")
        bad += 1
    else:
        print(f"{label}: ok ({len(body)} bytes)")
if not checked and not bad:
    print("NO SCRIPTS FOUND")
    bad = 1
print("FAIL" if bad else "ALL SCRIPTS PARSE")
sys.exit(1 if bad else 0)
