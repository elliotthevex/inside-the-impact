#!/usr/bin/env python3
"""Serve the game over HTTP for the smoke test.

The page needs style.css and game.js beside it, and a file:// or data: origin
blocks localStorage, which the save tests need. This serves the repo root unless
you pass the folder that holds the page.

Every response is no-store. game.js and style.css are separate requests, so
without this a normal reload can keep running the old code after an edit, and
the smoke and parity checks would pass on code that is no longer on disk."""
import functools, http.server, socketserver, sys, os

D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8781


class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


H = functools.partial(NoStore, directory=D)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), H) as s:
    print("serving %s on http://127.0.0.1:%d" % (D, PORT), flush=True)
    s.serve_forever()
