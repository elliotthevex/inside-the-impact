#!/usr/bin/env python3
"""End-to-end check of the Corner Pass, the login screen, against the real accounts code.

  python3 -I tools/accounts/e2e.py [--shots DIR] [--keep]

Starts tools/accounts/devserver.py on a free port with a throwaway database,
then drives two headless Chromes (two "computers"), both started with
--mute-audio, by keyboard and mouse:

  guest progress survives the new screen, Tab order and focus, hotkeys stay
  quiet, a new corner takes the guest progress with it, saves reach the
  server, a reload stays signed in, sign out brings guest progress back,
  wrong passwords count down and then pause, the second computer gets the
  same progress and the first one picks up what the second saved, Text Size
  and Reduced Motion are respected, deleting a corner works, and with no
  database the card offers guest play only.

Prints one line per check and exits non-zero if any fail. Screenshots go to
--shots (default: a temp folder, printed at the end). Stdlib only."""
import base64, json, os, shutil, socket, subprocess, sys, tempfile, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from devserver import WS, CHROME  # noqa: E402

FAILS, PASSES = [], []


def check(name, cond, detail=""):
    (PASSES if cond else FAILS).append(name)
    print(("  ok    " if cond else "  FAIL  ") + name + ("" if cond or not detail else "  -- " + str(detail)[:300]), flush=True)
    return cond


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


class Browser:
    """One muted headless Chrome with its own profile: one computer."""
    def __init__(self, w=1440, h=900):
        self.prof = tempfile.mkdtemp(prefix="iti-e2e-")
        dbg = free_port()
        self.p = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={dbg}", f"--user-data-dir={self.prof}",
                                   "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--mute-audio",
                                   "--disable-background-networking", "--disable-sync", "--disable-background-timer-throttling",
                                   "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
                                   f"--window-size={w},{h}", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t = []
        for _ in range(100):
            try:
                t = [x for x in json.load(urllib.request.urlopen(f"http://127.0.0.1:{dbg}/json", timeout=2)) if x.get("type") == "page"]
                if t: break
            except Exception: pass
            time.sleep(.2)
        self.ws = WS(t[0]["webSocketDebuggerUrl"]); self.ws.c.settimeout(120); self.nid = 0; self.errors = []
        self.cmd("Page.enable"); self.cmd("Runtime.enable")
        self.size(w, h)

    def cmd(self, m, **k):
        self.nid += 1; i = self.nid; self.ws.send(json.dumps({"id": i, "method": m, "params": k}))
        while True:
            x = json.loads(self.ws.recv())
            if x.get("method") == "Runtime.exceptionThrown":
                d = x["params"]["exceptionDetails"]
                self.errors.append((d.get("exception", {}).get("description") or d.get("text", ""))[:400])
            if x.get("id") == i:
                if "error" in x: raise RuntimeError(m + ": " + json.dumps(x["error"]))
                return x.get("result", {})

    def size(self, w, h):
        self.cmd("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=False)

    def ev(self, js):
        r = self.cmd("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True, userGesture=True)
        if "exceptionDetails" in r:
            raise RuntimeError("eval: " + str(r["exceptionDetails"].get("exception", {}).get("description") or r["exceptionDetails"]))
        return r.get("result", {}).get("value")

    def wait(self, js, timeout=15):
        end = time.time() + timeout
        while time.time() < end:
            try:
                v = self.ev(js)
                if v: return v
            except RuntimeError: pass
            time.sleep(.15)
        return None

    def nav(self, url):
        self.cmd("Page.navigate", url=url)
        time.sleep(.3)
        self.wait("document.readyState === 'complete'")

    def key(self, key, shift=False):
        codes = {"Tab": 9, "Enter": 13, "Escape": 27, "ArrowLeft": 37, "ArrowRight": 39, "o": 79, "O": 79}
        mods = 8 if shift else 0
        base = dict(key=key, code=("Key" + key.upper()) if len(key) == 1 else key, windowsVirtualKeyCode=codes.get(key, 0), modifiers=mods)
        down = dict(base, type="keyDown")
        if key == "Enter": down["text"] = "\r"
        if len(key) == 1: down["text"] = key
        self.cmd("Input.dispatchKeyEvent", **down)
        self.cmd("Input.dispatchKeyEvent", **dict(base, type="keyUp"))
        time.sleep(.05)

    def type(self, text):
        self.cmd("Input.insertText", text=text); time.sleep(.05)

    def click(self, sel):
        r = self.ev(f"(()=>{{const n=document.querySelector({json.dumps(sel)});if(!n)return null;n.scrollIntoView({{block:'nearest'}});const b=n.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]}})()")
        if not r: raise RuntimeError("nothing to click: " + sel)
        for t in ("mouseMoved", "mousePressed", "mouseReleased"):
            self.cmd("Input.dispatchMouseEvent", type=t, x=r[0], y=r[1], button="left", clickCount=1)
        time.sleep(.1)

    def shot(self, path):
        time.sleep(.45)   # let the card's 240 ms entrance finish
        open(path, "wb").write(base64.b64decode(self.cmd("Page.captureScreenshot", format="png")["data"]))

    def focus_id(self):
        return self.ev("(document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName)) || ''")

    def close(self):
        try: self.p.terminate(); self.p.wait(8)
        except Exception: self.p.kill()
        shutil.rmtree(self.prof, ignore_errors=True)


def start_server(port, db, extra=()):
    p = subprocess.Popen([sys.executable, "-I", os.path.join(HERE, "devserver.py"), str(port), "--db", db, *extra],
                         stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    line = p.stdout.readline()
    if "serving" not in line: raise RuntimeError("devserver did not start: " + line)
    return p


def stop(p):
    try: p.terminate(); p.wait(8)
    except Exception: p.kill()


def d1(base, sql, params=()):
    req = urllib.request.Request(base + "__d1", data=json.dumps({"sql": sql, "params": list(params)}).encode(), method="POST")
    return json.load(urllib.request.urlopen(req))


BOOTED = "(()=>!document.querySelector('#boot') && !!document.querySelector('.cpass') && CP.view && CP.view !== 'check' && CP.view)()"
GUEST = {"lv": 3, "xp": 120, "gold": 777, "gems": 5, "bouts": 4, "wins": 3, "stops": 1}


def main():
    args = sys.argv[1:]
    shots = args[args.index("--shots") + 1] if "--shots" in args else tempfile.mkdtemp(prefix="iti-e2e-shots-")
    os.makedirs(shots, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="iti-e2e-db-")
    port = free_port(); base = f"http://127.0.0.1:{port}/"
    srv = start_server(port, os.path.join(tmp, "corner.sqlite"))
    A = B = None
    try:
        print("Corner Pass end-to-end, server " + base)
        A = Browser()
        A.nav(base)
        A.ev(f"localStorage.setItem('iti.profile.v2', {json.dumps(json.dumps(GUEST))})")
        A.nav(base)
        view = A.wait(BOOTED, 20)
        check("pass appears after the boot screen", view == "form", view)
        check("lobby is built underneath, out of reach", A.ev("!!document.querySelector('.lobby') && document.querySelector('.lobby').inert === true"))
        check("focus starts in the corner name", A.focus_id() == "cp-name", A.focus_id())
        A.shot(os.path.join(shots, "01-sign-in-1440.png"))

        order = []
        for _ in range(21):
            A.key("Tab"); order.append(A.focus_id())
        want = ["cp-pw", "cp-show", "cp-keep", "cp-forgot", "cp-go", "cp-to-new", "cp-guest", "cp-arrow", "cp-arrow"]
        check("Tab follows reading order, fighter browser last", order[:9] == want, order)
        check("Tab wraps inside the pass", order[17:21] == ["cp-text", "cp-settings", "cp-tab-in", "cp-name"], order[15:])
        A.ev("document.querySelector('#cp-guest').focus()")
        A.key("O")
        check("hub hotkeys stay quiet (O does not open Settings)", A.ev("!document.querySelector('.settings')"))

        A.click("#cp-guest")
        gone = A.wait("!document.querySelector('.cpass')", 5)
        check("Train as a guest opens the hub", bool(gone))
        check("guest progress is kept (gold 777, level 3)", A.ev("P.gold === 777 && P.lv === 3"), A.ev("[P.gold, P.lv]"))
        check("hub shows a Guest / Sign in button", A.ev("(document.querySelector('.lb-cp')||{}).textContent") == "GuestSign in",
              A.ev("(document.querySelector('.lb-cp')||{}).textContent"))
        A.shot(os.path.join(shots, "02-hub-guest.png"))

        # New corner, by keyboard
        A.click(".lb-cp")
        A.wait("CP.view === 'form'")
        A.ev("document.querySelector('#cp-tab-in').focus()")
        A.key("ArrowRight")
        check("arrow key switches to New corner", A.ev("CP.tab === 'new' && document.activeElement.id === 'cp-tab-new'"))
        A.ev("document.querySelector('#cp-name').focus()")
        A.type("rope_a_dope")
        avail = A.wait("document.querySelector('#cp-name-hint').textContent.startsWith('Available') && 'yes'", 5)
        check("name availability is checked after typing stops", avail == "yes", A.ev("document.querySelector('#cp-name-hint').textContent"))
        A.key("Tab"); A.type("lefthooks")
        check("strength pips: 9 letters is 'Good', two pips", A.ev("document.querySelectorAll('.cp-pips i.mid').length === 2"),
              A.ev("document.querySelector('#cp-pw-hint').textContent"))
        A.type(" 42")
        check("strength pips: 12 with a number is 'Strong'", A.ev("document.querySelectorAll('.cp-pips i.on').length === 3"))
        A.ev("document.querySelector('#cp-pw2').focus()"); A.type("lefthooks 4")
        A.ev("document.querySelector('#cp-keep').focus()")
        check("confirm is judged when it loses focus", A.ev("document.querySelector('#cp-pw2-hint').textContent") == "Doesn't match yet.")
        A.ev("document.querySelector('#cp-pw2').focus()"); A.type("2")
        A.shot(os.path.join(shots, "03-new-corner.png"))
        A.key("Enter")
        welcome = A.wait("CP.view === 'welcome' && 'yes'", 10)
        check("Enter creates the corner and shows the welcome", welcome == "yes", A.ev("CP.view + ' ' + ((document.querySelector('#cp-err')||{}).textContent||'')"))
        A.shot(os.path.join(shots, "04-welcome.png"))
        check("welcome hands over to the hub", bool(A.wait("!document.querySelector('.cpass')", 4)))
        check("new corner took the guest progress", A.ev("P.gold === 777 && P.lv === 3"))
        server = A.ev("fetch('api/profile').then(r=>r.json())")
        check("server holds the guest progress", server and server["profile"].get("gold") == 777, server)
        check("hub button shows the corner name", A.ev("document.querySelector('.lb-cp b').textContent") == "rope_a_dope")

        # a save goes up
        A.ev("P.gold += 100; saveProfile()")
        up = A.wait("fetch('api/profile').then(r=>r.json()).then(j=>j.profile.gold===877 && j.rev)", 8)
        check("a save reaches the server within seconds", bool(up), up)
        check("nothing left unsent", A.wait("JSON.parse(localStorage.getItem('iti.corner.v1')).dirty === false", 4))

        # reload: still signed in (session cookie, same browser session)
        A.nav(base)
        view = A.wait(BOOTED, 20)
        check("after a reload the pass says Signed in", view == "signed", view)
        check("Continue has focus", A.focus_id() == "cp-go")
        A.shot(os.path.join(shots, "05-signed-in.png"))
        A.key("Enter")
        check("Enter continues to the hub with the corner's progress", bool(A.wait("!document.querySelector('.cpass') && P.gold === 877", 4)))

        # sign out from the hub: guest progress comes back (it moved into the corner, so a fresh guest)
        A.click(".lb-cp"); A.wait("CP.view === 'signed'")
        A.click("#cp-out")
        check("sign out returns to the sign-in form", bool(A.wait("CP.view === 'form'", 6)))
        check("this computer is back on guest progress", A.ev("P.gold === 0 && !localStorage.getItem('iti.corner.v1')"), A.ev("P.gold"))
        check("server session is gone", A.ev("fetch('api/me').then(r=>r.json()).then(j=>j.corner===null)"))

        # wrong passwords: count down, then pause
        A.ev("document.querySelector('#cp-tab-in').click()")
        A.ev("document.querySelector('#cp-name').focus()")
        A.ev("document.querySelector('#cp-name').value=''"); A.type("rope_a_dope")
        A.key("Tab"); A.type("not it at all")
        A.key("Enter")
        A.wait("document.querySelector('#cp-pw-hint').textContent.includes('left')", 6)
        check("a miss says how many tries are left", A.ev("document.querySelector('#cp-pw-hint').textContent") == "4 tries left before a one-minute pause.",
              A.ev("document.querySelector('#cp-pw-hint').textContent"))
        check("the error never says which part was wrong", "don't match" in A.ev("document.querySelector('#cp-err').textContent"))
        for _ in range(4):
            A.ev("document.querySelector('#cp-pw').focus()"); A.type("still wrong")
            A.key("Enter"); time.sleep(.4); A.wait("!CP.busy", 6)
        locked = A.wait("document.querySelector('#cp-go').disabled && document.querySelector('#cp-go').textContent", 6)
        check("after 5 misses the button counts down a pause", bool(locked) and "Try again in" in locked, locked)
        A.shot(os.path.join(shots, "06-too-many-tries.png"))
        d1(base, "DELETE FROM tries")   # skip the minute
        A.ev("CP.wait = 0")

        # sign in with Keep me signed in
        A.ev("document.querySelector('#cp-pw').value=''; document.querySelector('#cp-pw').focus()"); A.type("lefthooks 42")
        A.ev("document.querySelector('#cp-keep').click()")
        A.ev("document.querySelector('#cp-go').disabled=false; document.querySelector('#cp-go').classList.remove('cp-wait')")
        A.key("Enter")
        check("correct password signs in", A.wait("CP.view === 'welcome' && 'yes'", 10) == "yes",
              A.ev("(document.querySelector('#cp-err')||{}).textContent"))
        A.wait("!document.querySelector('.cpass')", 4)
        check("signed in with the corner's progress (gold 877)", A.ev("P.gold === 877"))

        # the second computer
        B = Browser()
        B.nav(base); B.wait(BOOTED, 20)
        B.ev("document.querySelector('#cp-name').focus()"); B.type("ROPE_A_DOPE")
        B.key("Tab"); B.type("lefthooks 42"); B.key("Enter")
        check("computer B signs in with the same name in other letter case", B.wait("CP.view === 'welcome' && 'yes'", 10) == "yes",
              B.ev("(document.querySelector('#cp-err')||{}).textContent"))
        B.wait("!document.querySelector('.cpass')", 4)
        check("computer B gets the same progress", B.ev("P.gold === 877"))
        B.ev("P.gold = 1500; P.lv = 4; saveProfile()")
        check("computer B's save reaches the server", bool(B.wait("fetch('api/profile').then(r=>r.json()).then(j=>j.profile.gold===1500)", 8)))
        # A is still open on the older save. Its next save must not overwrite B's.
        A.ev("P.gold += 1; saveProfile()")
        took = A.wait("P.gold === 1500 && P.lv === 4 && !!document.querySelector('.cp-toast') && 'yes'", 10)
        check("a stale open computer takes the newer save instead of overwriting it", took == "yes",
              [A.ev("[P.gold, P.lv]"), B.ev("fetch('api/profile').then(r=>r.json()).then(j=>[j.rev,j.profile.gold])")])
        check("the server still holds B's progress", B.ev("fetch('api/profile').then(r=>r.json()).then(j=>j.profile.gold)") == 1500)
        A.shot(os.path.join(shots, "05b-newer-from-other-computer.png"))
        bad = B.ev("fetch('api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:{lv:'<img src=x onerror=alert(1)>'}})}).then(r=>r.status)")
        check("a save with markup in it is refused", bad == 400, bad)
        A.ev("localStorage.setItem('iti.x', '1')")
        check("save numbers are made numbers on load", A.ev("(()=>{const k='iti.profile.v2',o=localStorage.getItem(k);localStorage.setItem(k,JSON.stringify({lv:'<b>9</b>',gold:'12'}));const p=loadProfile();const r=[p.lv,p.gold];localStorage.setItem(k,o);loadProfile();return r})()") == [1, 12])
        A.nav(base)
        view = A.wait(BOOTED, 20)
        check("computer A picks up what B saved", view == "signed" and A.ev("P.gold === 1500 && P.lv === 4"), [view, A.ev("[P.gold, P.lv]")])
        check("the welcome card shows the right level", "Level 4" in A.ev("document.querySelector('.cp-sub').textContent"))

        # a sign-out that never reached the server is sent on the next start
        A.ev("localStorage.setItem('iti.signout.v1', '1')")
        A.nav(base)
        view = A.wait(BOOTED, 20)
        check("an unsent sign-out is sent first on the next start", view == "form"
              and A.ev("fetch('api/me').then(r=>r.json()).then(j=>j.corner===null)") and not A.ev("localStorage.getItem('iti.signout.v1')"), view)
        check("the card says who was signed in here", "You were signed in as" in (A.ev("document.querySelector('.cp-msg.gold') && document.querySelector('.cp-msg.gold').textContent") or ""))

        # many wrong passwords at once are all counted
        import concurrent.futures as cf
        def guess(i):
            r = urllib.request.Request(base + "api/signin", data=json.dumps({"name": "rope_a_dope", "password": f"guess {i}"}).encode(),
                                       headers={"Content-Type": "application/json", "CF-Connecting-IP": "10.7.7.7"}, method="POST")
            try: return urllib.request.urlopen(r).status
            except urllib.error.HTTPError as x: return x.code
        with cf.ThreadPoolExecutor(12) as ex: codes = list(ex.map(guess, range(24)))
        check("24 guesses at once: at most 5 are checked, the rest wait", codes.count(401) + codes.count(200) <= 5 and codes.count(429) >= 19, codes)
        d1(base, "DELETE FROM tries")

        # Text Size large, smaller window
        A.ev("ST.textsize = 'large'; saveSettings()")
        A.size(1280, 720)
        A.wait("CP.view === 'form'", 6)
        fits = A.ev("(()=>{const c=document.querySelector('.cp-card').getBoundingClientRect();const p=document.querySelector('.cpass');return {cardH:Math.round(c.height),scroll:p.scrollHeight>p.clientHeight,font:getComputedStyle(document.querySelector('.cp-card h2')).fontSize}})()")
        check("Text Size large scales the card's type", fits["font"] in ("34.8px", "40.8px"), fits)
        A.shot(os.path.join(shots, "07-large-text-1280x720.png"))
        A.ev("document.querySelector('.cpass').scrollTop = 1e6")
        A.shot(os.path.join(shots, "08-large-text-scrolled.png"))
        check("the tall card scrolls instead of clipping", A.ev("(()=>{const g=document.querySelector('#cp-guest').getBoundingClientRect();return g.bottom <= innerHeight && g.top >= 0})()"))
        A.ev("ST.textsize = 'normal'; saveSettings()")

        # Reduced Motion
        A.ev("ST.motion = true; saveSettings()")
        anim = A.ev("[getComputedStyle(document.querySelector('.cp-fighter')).animationName, getComputedStyle(document.querySelector('.cp-light')).animationName]")
        check("Reduced Motion stops the bounce and the lamp sway", anim == ["none", "none"], anim)
        fi = A.ev("CP.fi"); A.ev("CP.hold = 0; CP.hover = false"); time.sleep(6.5)
        check("Reduced Motion stops the fighter rotation", A.ev("CP.fi") == fi)
        A.click(".cp-arrow[data-step='1']")
        check("the arrows still browse by hand", A.ev("CP.fi") == (fi + 1) % 8)
        A.ev("ST.motion = false; saveSettings()")
        A.size(1440, 900)

        # small window: stacked
        A.size(900, 1000)
        A.shot(os.path.join(shots, "09-stacked-900.png"))
        check("below 960px the card sits under the arena banner",
              A.ev("document.querySelector('.cp-card').getBoundingClientRect().top >= 330"))
        A.size(1440, 900)

        # delete the corner from B
        B.click(".lb-cp"); B.wait("CP.view === 'signed'")
        B.click("#cp-del")
        B.ev("document.querySelector('#cp-delpw').focus()"); B.type("wrong one"); B.key("Enter")
        check("delete asks for the right password", bool(B.wait("document.querySelector('#cp-delhint').textContent.includes('doesn')", 6)),
              B.ev("document.querySelector('#cp-delhint').textContent"))
        B.ev("document.querySelector('#cp-delpw').value=''"); B.type("lefthooks 42"); B.key("Enter")
        check("deleting the corner removes it", bool(B.wait("CP.view === 'form'", 6))
              and d1(base, "SELECT COUNT(*) AS n FROM corners")["results"][0]["n"] == 0)
        B.shot(os.path.join(shots, "10-deleted.png"))
        A.ev("document.querySelector('#cp-name').focus(); document.querySelector('#cp-name').value=''"); A.type("rope_a_dope")
        A.key("Tab"); A.type("lefthooks 42"); A.key("Enter")
        check("a deleted corner cannot sign in", bool(A.wait("document.querySelector('#cp-err') && !document.querySelector('#cp-err').hidden", 6)))
        check("no script errors on either computer", not A.errors and not B.errors, A.errors + B.errors)
    finally:
        for b in (A, B):
            if b: b.close()
        stop(srv)

    # no database: guest only
    port2 = free_port(); base2 = f"http://127.0.0.1:{port2}/"
    srv2 = start_server(port2, os.path.join(tmp, "unused.sqlite"), ("--no-db",))
    C = None
    try:
        C = Browser()
        C.nav(base2)
        view = C.wait(BOOTED, 20)
        check("with no database the pass offers guest play only", view == "guestonly", view)
        check("no sign-in fields are shown", C.ev("!document.querySelector('#cp-name') && !document.querySelector('#cp-tab-new')"))
        check("Train as a guest has focus", C.focus_id() == "cp-guest")
        C.shot(os.path.join(shots, "11-no-accounts.png"))
        C.key("Enter")
        check("Enter goes to the hub", bool(C.wait("!document.querySelector('.cpass')", 4)))
        check("hub shows no corner button when accounts are off", C.ev("!document.querySelector('.lb-cp')"))
        # another tab signs someone in: this tab stops saving and reloads
        stale = C.ev("(()=>{const before=localStorage.getItem('iti.profile.v2');localStorage.setItem('iti.corner.v1',JSON.stringify({name:'someone',rev:1}));P.gold=999;saveProfile();return [CP.reloading===true, localStorage.getItem('iti.profile.v2')===before]})()")
        check("a tab whose corner changed elsewhere stops saving and reloads", stale == [True, True], stale)
    finally:
        if C: C.close()
        stop(srv2)
        if "--keep" not in args: shutil.rmtree(tmp, ignore_errors=True)
    print(f"\n{len(PASSES)} passed, {len(FAILS)} failed. Screenshots: {shots}")
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    main()
