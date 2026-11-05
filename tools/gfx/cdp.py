#!/usr/bin/env python3
"""Drive a throwaway headless Chrome over the DevTools protocol. Stdlib only.

  cdp.py URL [--js FILE|--eval CODE] [--shot OUT.png] [--wait SEC] [--size WxH] [--dpr N] [--timeout SEC]

Prints a JSON result {value, console, errors}. A lock file keeps it to one GPU
job at a time, because this machine has 8GB shared between CPU and GPU.
"""
import argparse,base64,fcntl,json,os,shutil,socket,struct,subprocess,sys,tempfile,time,urllib.request
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LOCK=os.path.join(tempfile.gettempdir(),"iti-cdp.lock")
class WS:
    def __init__(s,url):
        assert url.startswith("ws://"); h,_,p=url[5:].partition("/"); host,_,port=h.partition(":")
        s.c=socket.create_connection((host,int(port)),timeout=600); key=base64.b64encode(os.urandom(16)).decode()
        s.c.sendall((f"GET /{p} HTTP/1.1\r\nHost: {h}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b: b+=s.c.recv(4096)
        assert b" 101 " in b.split(b"\r\n")[0],b
    def send(s,t):
        d=t.encode(); m=os.urandom(4); n=len(d)
        hdr=b"\x81"+(bytes([0x80|n]) if n<126 else (bytes([0x80|126])+struct.pack(">H",n) if n<65536 else bytes([0x80|127])+struct.pack(">Q",n)))
        s.c.sendall(hdr+m+bytes(b^m[i%4] for i,b in enumerate(d)) if n<4096 else hdr+m+_mask(d,m))
    def _rd(s,n):
        b=bytearray()
        while len(b)<n:
            x=s.c.recv(min(1<<20,n-len(b)))
            if not x: raise EOFError
            b+=x
        return bytes(b)
    def recv(s):
        out=b""
        while True:
            h=s._rd(2); fin=h[0]&0x80; op=h[0]&15; n=h[1]&127
            if n==126: n=struct.unpack(">H",s._rd(2))[0]
            elif n==127: n=struct.unpack(">Q",s._rd(8))[0]
            d=s._rd(n)
            if op==9: continue
            if op==8: raise EOFError
            out+=d
            if fin: return out.decode("utf8","replace")
def _mask(d,m):
    q=(m*(len(d)//4+1))[:len(d)]
    return (int.from_bytes(d,"little")^int.from_bytes(q,"little")).to_bytes(len(d),"little")
def main():
    a=argparse.ArgumentParser();a.add_argument("url");a.add_argument("--js");a.add_argument("--eval");a.add_argument("--shot");a.add_argument("--wait",type=float,default=1.0)
    a.add_argument("--size",default="1280x720");a.add_argument("--dpr",type=float,default=1);a.add_argument("--timeout",type=float,default=240);a=a.parse_args()
    lk=open(LOCK,"w");fcntl.flock(lk,fcntl.LOCK_EX)
    prof=tempfile.mkdtemp(prefix="iti-chrome-");s=socket.socket();s.bind(("127.0.0.1",0));port=s.getsockname()[1];s.close()
    w,h=a.size.split("x")
    p=subprocess.Popen([CHROME,"--headless=new",f"--remote-debugging-port={port}",f"--user-data-dir={prof}","--no-first-run","--no-default-browser-check","--disable-extensions","--disable-background-networking","--disable-sync","--mute-audio","--use-angle=metal","--enable-gpu-rasterization","--ignore-gpu-blocklist","--disable-background-timer-throttling","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows",f"--window-size={w},{h}","about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    res={"console":[],"errors":[]}
    try:
        for _ in range(100):
            try:
                t=[x for x in json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=2)) if x.get("type")=="page"]
                if t: break
            except Exception: pass
            time.sleep(.2)
        ws=WS(t[0]["webSocketDebuggerUrl"]);ws.c.settimeout(a.timeout);nid=[0];ev=[]
        def cmd(m,**k):
            nid[0]+=1;i=nid[0];ws.send(json.dumps({"id":i,"method":m,"params":k}))
            while True:
                x=json.loads(ws.recv())
                if x.get("id")==i:
                    if "error" in x: raise RuntimeError(m+": "+json.dumps(x["error"]))
                    return x.get("result",{})
                note(x)
        def note(x):
            m=x.get("method")
            if m=="Runtime.consoleAPICalled":
                res["console"].append(x["params"]["type"]+": "+" ".join(str(q.get("value",q.get("description",""))) for q in x["params"]["args"])[:600])
            elif m=="Runtime.exceptionThrown":
                d=x["params"]["exceptionDetails"];res["errors"].append((d.get("text","")+" "+str(d.get("exception",{}).get("description","")))[:800]+f" @{d.get('url','')}:{d.get('lineNumber','')}")
            elif m=="Log.entryAdded" and x["params"]["entry"].get("level")=="error":
                res["errors"].append("log: "+x["params"]["entry"].get("text","")[:300]+" "+x["params"]["entry"].get("url","")[:160])
            ev.append(m)
        cmd("Page.enable");cmd("Runtime.enable");cmd("Log.enable")
        cmd("Emulation.setDeviceMetricsOverride",width=int(w),height=int(h),deviceScaleFactor=a.dpr,mobile=False)
        cmd("Page.navigate",url=a.url)
        end=time.time()+60
        while time.time()<end and "Page.loadEventFired" not in ev:
            note(json.loads(ws.recv()))
        ws.c.settimeout(a.timeout)
        time.sleep(a.wait)
        code=open(a.js).read() if a.js else a.eval
        if code:
            r=cmd("Runtime.evaluate",expression=code,awaitPromise=True,returnByValue=True,timeout=int(a.timeout*1000),userGesture=True)
            if "exceptionDetails" in r:
                res["errors"].append("eval: "+json.dumps(r["exceptionDetails"].get("exception",{}).get("description",r["exceptionDetails"].get("text")))[:1200])
            res["value"]=r.get("result",{}).get("value")
        if a.shot:
            r=cmd("Page.captureScreenshot",format="png");open(a.shot,"wb").write(base64.b64decode(r["data"]));res["shot"]=a.shot
    finally:
        p.terminate()
        try:p.wait(8)
        except Exception:p.kill()
        shutil.rmtree(prof,ignore_errors=True)
    print(json.dumps(res,indent=1)[:60000])
main()
