#!/usr/bin/env python3
"""Static server for the project plus a POST sink, so pages running in Chrome can write converted
assets to disk. Writes are confined to the directories named on the command line."""
import http.server,os,sys,socketserver,urllib.parse
ROOT=sys.argv[1];PORT=int(sys.argv[2]);ALLOW=[os.path.realpath(p) for p in sys.argv[3:]]
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=ROOT,**k)
    def log_message(s,*a): pass
    def end_headers(s):
        s.send_header("Cache-Control","no-store");s.send_header("Access-Control-Allow-Origin","*");super().end_headers()
    def do_POST(s):
        q=urllib.parse.parse_qs(urllib.parse.urlparse(s.path).query);p=os.path.realpath(q.get("path",[""])[0])
        if not any(p.startswith(a+os.sep) for a in ALLOW):
            s.send_response(403);s.end_headers();return
        n=int(s.headers.get("Content-Length",0));os.makedirs(os.path.dirname(p),exist_ok=True)
        with open(p,"wb") as f:
            while n>0:
                b=s.rfile.read(min(n,1<<20))
                if not b:break
                f.write(b);n-=len(b)
        s.send_response(200);s.end_headers();s.wfile.write(b"ok")
class T(socketserver.ThreadingMixIn,http.server.HTTPServer): daemon_threads=True;allow_reuse_address=True
T(("127.0.0.1",PORT),H).serve_forever()
