#!/usr/bin/env python3
"""HDRI -> backplate: backplate.py ID [--res 4k] [--ev 0] [--w 4096]
Writes assets/hdri/ID.webp (tone-mapped sRGB for the visible room) and keeps assets/hdri/ID_1k.hdr for light."""
import argparse,os,sys,urllib.request,json
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__))
HERE=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(os.path.dirname(HERE));OUT=os.path.join(SITE,'assets','hdri');MAN=os.path.join(SITE,'assets','manifest.json')
UA={'User-Agent':'InsideTheImpact-asset-tool/1.0'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=300).read()
def read_hdr(b):
    i=b.index(b'\n\n')+2;line_end=b.index(b'\n',i);res=b[i:line_end].split();H,W=int(res[1]),int(res[3]);p=line_end+1;out=np.zeros((H,W,4),np.uint8);d=np.frombuffer(b,np.uint8)
    for y in range(H):
        assert d[p]==2 and d[p+1]==2;p+=4
        for c in range(4):
            x=0
            while x<W:
                n=int(d[p]);p+=1
                if n>128:
                    n-=128;out[y,x:x+n,c]=d[p];p+=1;x+=n
                else:
                    out[y,x:x+n,c]=d[p:p+n];p+=n;x+=n
    e=out[...,3].astype(np.float32);f=np.where(e>0,np.ldexp(1.0,(e-136).astype(np.int32)),0);return out[...,:3].astype(np.float32)*f[...,None]
def main():
    a=argparse.ArgumentParser();a.add_argument('id');a.add_argument('--res',default='4k');a.add_argument('--ev',type=float,default=0);a.add_argument('--w',type=int,default=4096);a.add_argument('--q',type=int,default=80);a=a.parse_args()
    files=json.loads(get('https://api.polyhaven.com/files/'+a.id));info=json.loads(get('https://api.polyhaven.com/info/'+a.id))
    raw=get(files['hdri'][a.res]['hdr']['url']);img=read_hdr(raw)
    lum=(img*[.2126,.7152,.0722]).sum(2);key=float(np.exp(np.log(lum+1e-4).mean()));c=img*(.18/key)*(2**a.ev)
    # filmic shoulder that keeps lamps from clipping flat; the engine re-expands highlights from this
    x=np.maximum(c,0);y=(x*(2.51*x+.03))/(x*(2.43*x+.59)+.14);srgb=np.where(y<.0031308,y*12.92,1.055*np.power(np.maximum(y,1e-6),1/2.4)-.055)
    im=Image.fromarray((np.clip(srgb,0,1)*255).astype(np.uint8))
    if im.width!=a.w: im=im.resize((a.w,a.w//2),Image.LANCZOS)
    os.makedirs(OUT,exist_ok=True);d=os.path.join(OUT,a.id+'.webp');im.save(d,'WEBP',quality=a.q,method=5)
    hd=os.path.join(OUT,a.id+'_1k.hdr');open(hd,'wb').write(get(files['hdri']['1k']['hdr']['url']))
    m=json.load(open(MAN)) if os.path.exists(MAN) else {};m['hdri:'+a.id]=dict(kind='hdri',id=a.id,name=info.get('name',a.id),authors=list(info.get('authors',{}).keys()),license='CC0 1.0',source='Poly Haven',url='https://polyhaven.com/a/'+a.id,files=[os.path.relpath(d,SITE),os.path.relpath(hd,SITE)]);json.dump(m,open(MAN,'w'),indent=1,sort_keys=True)
    print(a.id,'key',round(key,4),'->',os.path.getsize(d)//1024,'KB webp,',os.path.getsize(hd)//1024,'KB hdr')
main()
