#!/usr/bin/env python3
"""Run the game with its accounts API on this computer, without Cloudflare.

  python3 -I tools/accounts/devserver.py [PORT] [--db FILE] [--no-db]

Static files come from the repo root with Cache-Control: no-store, as in
tools/serve.py. Requests to /api/* run functions/api/[[route]].js, the same
file Cloudflare Pages runs, inside a headless Chrome started with
--mute-audio. Chrome stands in for the Workers runtime: same JavaScript
engine and the same WebCrypto, so the password hashing, the sessions and
the routes are the real code. Its D1 binding (env.DB) is a local SQLite
file, reached through /__d1. --no-db starts it with no binding, which is
what the live site does before a database is attached.

What this does not reproduce: Cloudflare's CPU limits, its exact cookie
handling over HTTPS, and D1's network latency. Stdlib only."""
import base64, json, os, shutil, signal, socket, sqlite3, struct, subprocess, sys, tempfile, threading, time, urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FN = "/functions/api/%5B%5Broute%5D%5D.js"

WORKER = """<!doctype html><meta charset="utf-8"><title>corner worker</title><script type="module">
/* Script-made Responses drop Set-Cookie, and script-made Requests drop Cookie
   and Origin. Keep the raw lists so the server can send them on. */
const RAW = new WeakMap(), NativeResponse = Response;
window.Response = class extends NativeResponse {
  constructor(body, init) { super(body, init); if (init && init.headers) RAW.set(this, init.headers); }
};
const USE_DB = __USE_DB__;
async function d1(payload) {
  const r = await fetch("/__d1", { method: "POST", body: JSON.stringify(payload) });
  const j = await r.json();
  if (j.error) throw new Error("D1_ERROR: " + j.error);
  return j;
}
const check = (args) => { for (const a of args) if (a === undefined) throw new Error("D1_TYPE_ERROR: Type 'undefined' not supported"); return args; };
class Stmt {
  constructor(sql, args) { this.sql = sql; this.args = args || []; }
  bind(...a) { return new Stmt(this.sql, check(a)); }
  async first(col) { const r = await d1({ sql: this.sql, params: this.args }); const row = r.results[0]; return row === undefined ? null : col ? row[col] : row; }
  async all() { return d1({ sql: this.sql, params: this.args }); }
  async run() { return d1({ sql: this.sql, params: this.args }); }
}
const DB = { prepare: (sql) => new Stmt(sql), batch: async (s) => (await d1({ batch: s.map((x) => ({ sql: x.sql, params: x.args })) })).results,
  exec: async (sql) => d1({ exec: sql }) };
const mod = await import("__FN__");
window.__handle = async (r) => {
  const init = { method: r.method };
  if (r.body !== null && r.method !== "GET" && r.method !== "HEAD") init.body = r.body;
  const req = new Request(r.url, init), h = new Map(r.headers.map(([k, v]) => [k.toLowerCase(), v]));
  Object.defineProperty(req, "headers", { value: { get: (k) => h.has(k.toLowerCase()) ? h.get(k.toLowerCase()) : null,
    has: (k) => h.has(k.toLowerCase()), forEach: (f) => h.forEach((v, k) => f(v, k)), entries: () => h.entries(), [Symbol.iterator]: () => h.entries() } });
  const res = await mod.onRequest({ request: req, env: USE_DB ? { DB } : {}, params: {}, data: {}, waitUntil() {}, next() {} });
  const raw = RAW.get(res);
  return { status: res.status, headers: raw ? (Array.isArray(raw) ? raw : Object.entries(raw)) : [...res.headers], body: await res.text() };
};
window.__ready = true;
</script>"""


class WS:
    def __init__(s, url):
        h, _, p = url[5:].partition("/"); host, _, port = h.partition(":")
        s.c = socket.create_connection((host, int(port)), timeout=60); key = base64.b64encode(os.urandom(16)).decode()
        s.c.sendall((f"GET /{p} HTTP/1.1\r\nHost: {h}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                     f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b = b""
        while b"\r\n\r\n" not in b: b += s.c.recv(4096)

    def send(s, t):
        d = t.encode(); m = os.urandom(4); n = len(d)
        hdr = b"\x81" + (bytes([0x80 | n]) if n < 126 else (bytes([0x80 | 126]) + struct.pack(">H", n) if n < 65536 else bytes([0x80 | 127]) + struct.pack(">Q", n)))
        q = (m * (n // 4 + 1))[:n]
        s.c.sendall(hdr + m + (int.from_bytes(d, "little") ^ int.from_bytes(q, "little")).to_bytes(n, "little"))

    def _rd(s, n):
        b = bytearray()
        while len(b) < n:
            x = s.c.recv(min(1 << 20, n - len(b)))
            if not x: raise EOFError
            b += x
        return bytes(b)

    def recv(s):
        out = b""
        while True:
            h = s._rd(2); fin = h[0] & 0x80; op = h[0] & 15; n = h[1] & 127
            if n == 126: n = struct.unpack(">H", s._rd(2))[0]
            elif n == 127: n = struct.unpack(">Q", s._rd(8))[0]
            d = s._rd(n)
            if op == 9: continue
            if op == 8: raise EOFError
            out += d
            if fin: return out.decode("utf8", "replace")


class Worker:
    """One muted headless Chrome tab holding the function module."""
    def __init__(s, port, use_db):
        s.lock = threading.Lock(); s.nid = 0
        s.prof = tempfile.mkdtemp(prefix="iti-corner-worker-")
        sk = socket.socket(); sk.bind(("127.0.0.1", 0)); dbg = sk.getsockname()[1]; sk.close()
        s.p = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={dbg}", f"--user-data-dir={s.prof}",
                                "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-gpu",
                                "--disable-background-networking", "--disable-sync", "--mute-audio",
                                "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "about:blank"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t = []
        for _ in range(100):
            try:
                t = [x for x in json.load(urllib.request.urlopen(f"http://127.0.0.1:{dbg}/json", timeout=2)) if x.get("type") == "page"]
                if t: break
            except Exception: pass
            time.sleep(.2)
        s.ws = WS(t[0]["webSocketDebuggerUrl"]); s.ws.c.settimeout(60)
        s.cmd("Page.navigate", url=f"http://127.0.0.1:{port}/__worker.html?db={int(use_db)}")
        for _ in range(100):
            if s.eval("window.__ready === true") is True: return
            time.sleep(.1)
        raise RuntimeError("the worker page never became ready: " + json.dumps(s.eval("String(window.__err||'')")))

    def cmd(s, m, **k):
        s.nid += 1; i = s.nid; s.ws.send(json.dumps({"id": i, "method": m, "params": k}))
        while True:
            x = json.loads(s.ws.recv())
            if x.get("id") == i:
                if "error" in x: raise RuntimeError(m + ": " + json.dumps(x["error"]))
                return x.get("result", {})

    def eval(s, code):
        r = s.cmd("Runtime.evaluate", expression=code, awaitPromise=True, returnByValue=True)
        if "exceptionDetails" in r:
            raise RuntimeError(r["exceptionDetails"].get("exception", {}).get("description") or r["exceptionDetails"].get("text"))
        return r.get("result", {}).get("value")

    def handle(s, req):
        with s.lock:
            return s.eval("__handle(" + json.dumps(req) + ")")

    def close(s):
        s.p.terminate()
        try: s.p.wait(8)
        except Exception: s.p.kill()
        shutil.rmtree(s.prof, ignore_errors=True)


class D1:
    def __init__(s, path):
        s.lock = threading.Lock()
        s.c = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        s.c.row_factory = sqlite3.Row

    def _one(s, sql, params):
        cur = s.c.execute(sql, params)
        rows = [dict(r) for r in cur.fetchall()] if cur.description else []
        return {"results": rows, "success": True, "meta": {"changes": max(cur.rowcount, 0), "last_row_id": cur.lastrowid}}

    def run(s, p):
        with s.lock:
            try:
                if "batch" in p:
                    s.c.execute("BEGIN")
                    try:
                        out = [s._one(x["sql"], x.get("params") or []) for x in p["batch"]]
                        s.c.execute("COMMIT")
                    except Exception:
                        s.c.execute("ROLLBACK"); raise
                    return {"results": out}
                if "exec" in p:
                    s.c.executescript(p["exec"]); return {"results": [], "success": True}
                return s._one(p["sql"], p.get("params") or [])
            except sqlite3.Error as e:
                return {"error": str(e)}


def make_handler(state):
    class H(SimpleHTTPRequestHandler):
        def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
        def log_message(s, fmt, *a):
            if state["verbose"] or not s.path.startswith(("/__d1",)): sys.stderr.write("  " + (fmt % a) + "\n")
        def end_headers(s):
            s.send_header("Cache-Control", "no-store"); super().end_headers()

        def body(s):
            n = int(s.headers.get("Content-Length") or 0)
            return s.rfile.read(n) if n else b""

        def route(s):
            path = s.path.split("?")[0]
            if path.startswith("/api/"): return s.api()
            if path == "/__d1" and s.command == "POST":
                return s.send_json(200, state["d1"].run(json.loads(s.body() or b"{}")))
            if path == "/__worker.html":
                html = WORKER.replace("__USE_DB__", "true" if state["d1"] else "false").replace("__FN__", FN).encode()
                s.send_response(200); s.send_header("Content-Type", "text/html; charset=utf-8"); s.send_header("Content-Length", str(len(html)))
                s.end_headers(); s.wfile.write(html); return
            if s.command in ("GET", "HEAD"):
                return super().do_GET() if s.command == "GET" else super().do_HEAD()
            s.send_json(405, {"error": "static files are read-only"})

        def send_json(s, code, obj):
            b = json.dumps(obj).encode()
            s.send_response(code); s.send_header("Content-Type", "application/json"); s.send_header("Content-Length", str(len(b)))
            s.end_headers(); s.wfile.write(b)

        def api(s):
            raw = s.body()
            hdrs = [[k, v] for k, v in s.headers.items()]
            if not any(k.lower() == "cf-connecting-ip" for k, _ in hdrs): hdrs.append(["CF-Connecting-IP", s.client_address[0]])
            req = {"method": s.command, "url": f"http://{s.headers.get('Host') or '127.0.0.1'}{s.path}", "headers": hdrs,
                   "body": raw.decode("utf8", "replace") if raw else None}
            try:
                r = state["worker"].handle(req)
            except Exception as e:
                return s.send_json(500, {"error": "devserver: " + str(e)[:500]})
            b = r["body"].encode()
            s.send_response(r["status"])
            for k, v in r["headers"]:
                if k.lower() != "content-length": s.send_header(k, v)
            s.send_header("Content-Length", str(len(b)))
            SimpleHTTPRequestHandler.end_headers(s)
            s.wfile.write(b)

        do_GET = do_HEAD = do_POST = do_PUT = do_DELETE = route
    return H


def main():
    args = sys.argv[1:]
    port = int(args[0]) if args and args[0].isdigit() else 8797
    use_db = "--no-db" not in args
    db = args[args.index("--db") + 1] if "--db" in args else os.path.join(tempfile.gettempdir(), "iti-corner-dev.sqlite")
    state = {"d1": D1(db) if use_db else None, "worker": None, "verbose": "-v" in args}
    ThreadingHTTPServer.allow_reuse_address = True
    ThreadingHTTPServer.daemon_threads = True
    srv = ThreadingHTTPServer(("127.0.0.1", port), make_handler(state))
    th = threading.Thread(target=srv.serve_forever, daemon=True); th.start()
    signal.signal(signal.SIGTERM, lambda *a: sys.exit(0))   # so the worker Chrome is closed too
    try:
        state["worker"] = Worker(port, use_db)
        print(f"serving {ROOT} on http://127.0.0.1:{port}/  accounts API: " + (f"on, database {db}" if use_db else "no database (guest only)"), flush=True)
        while True: time.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        if state["worker"]: state["worker"].close()
        srv.shutdown()


if __name__ == "__main__":
    main()
