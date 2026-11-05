#!/bin/bash
# run.sh PAGE 'js' [cdp args...]: evaluate JS on a page in headless Chrome, print the value and any errors.
# PAGE is a path on the sink server, e.g. site/index.html. Needs sink.py on port 8791.
HERE="$(cd "$(dirname "$0")" && pwd)"
PY="${ITI_PY:-python3}"
page="$1"; js="$2"; shift 2
"$PY" -I "$HERE/cdp.py" "http://127.0.0.1:8791/$page" --wait 1 --timeout 300 --eval "$js" "$@" | "$PY" -I -c "
import json,sys
d=json.load(sys.stdin)
e=[x for x in d['errors'] if 'favicon' not in x]
print(json.dumps(d.get('value'),indent=0)[:8000])
if e: print('ERRORS',e[:8])
c=[x for x in d['console'] if x.startswith(('error','warning'))]
if c: print('CONSOLE',c[:8])
"
