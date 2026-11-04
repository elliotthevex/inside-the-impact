#!/usr/bin/env python3
"""Serve the build over HTTP for the smoke test.

Opening the file directly stopped working once the page passed ~500KB
(the browser pane snapshots file:// URLs), and a file:// or data: origin
blocks localStorage, which the save tests need. Copy the build next to
this script's serve dir, or point D at wherever it lives."""
import functools, http.server, socketserver, sys, os

D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8781
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=D)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), H) as s:
    print("serving %s on http://127.0.0.1:%d" % (D, PORT), flush=True)
    s.serve_forever()
