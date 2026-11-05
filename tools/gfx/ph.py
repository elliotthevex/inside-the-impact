#!/usr/bin/env python3
"""Fetch CC0 assets from Poly Haven into the project and record them for CREDITS.md.

  ph.py tex ID [--res 1k] [--maps diff,nor_gl,rough] [--size 1024] [--q 82]
  ph.py hdri ID [--res 1k]            writes assets/hdri/ID_RES.hdr
  ph.py model ID [--res 1k]           writes assets/models/ph/ID/ (glTF plus converted textures)

Every call updates assets/manifest.json with the asset's name, authors, licence and URL.
"""
import argparse,json,os,sys,time,urllib.request
HERE=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(os.path.dirname(HERE));ASSETS=os.path.join(SITE,'assets');MAN=os.path.join(ASSETS,'manifest.json')
UA={'User-Agent':'InsideTheImpact-asset-tool/1.0'}
def get(u,dest=None,tries=4):
    for t in range(tries):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=240);d=r.read()
            if dest:
                os.makedirs(os.path.dirname(dest),exist_ok=True);open(dest,'wb').write(d);return dest
            return d
        except Exception as e:
            if t==tries-1: raise
            time.sleep(2+t*3)
def record(kind,id_,files,info):
    m=json.load(open(MAN)) if os.path.exists(MAN) else {}
    m[kind+':'+id_]=dict(kind=kind,id=id_,name=info.get('name',id_),authors=list(info.get('authors',{}).keys()),license='CC0 1.0',source='Poly Haven',url=f'https://polyhaven.com/a/{id_}',files=sorted(set(os.path.relpath(f,SITE) for f in files)))
    json.dump(m,open(MAN,'w'),indent=1,sort_keys=True)
def to_webp(src,dst,size,q,kind):
    from PIL import Image
    im=Image.open(src);im=im.convert('RGB')
    if size and im.width!=size: im=im.resize((size,size),Image.LANCZOS)
    os.makedirs(os.path.dirname(dst),exist_ok=True);im.save(dst,'WEBP',quality=q,method=6)
    return dst
def main():
    a=argparse.ArgumentParser();a.add_argument('kind');a.add_argument('id');a.add_argument('--res',default='1k');a.add_argument('--maps',default='diff,nor_gl,rough');a.add_argument('--size',type=int,default=1024);a.add_argument('--q',type=int,default=82);a=a.parse_args()
    info=json.loads(get('https://api.polyhaven.com/info/'+a.id));files=json.loads(get('https://api.polyhaven.com/files/'+a.id));tmp=os.path.join(os.environ.get('ITI_TMP','/tmp'),'ph_'+a.id);os.makedirs(tmp,exist_ok=True);out=[]
    if a.kind=='tex':
        NAMES={'diff':'Diffuse','nor_gl':'nor_gl','rough':'Rough','ao':'AO','arm':'arm','disp':'Displacement'}
        for mp in a.maps.split(','):
            key=NAMES[mp];ent=files.get(key) or files.get(mp)
            if not ent: print('no map',mp,list(files)[:20]);continue
            e=ent[a.res];fmt=e.get('jpg') or e.get('png');raw=os.path.join(tmp,mp+'.'+('jpg' if 'jpg' in e else 'png'));get(fmt['url'],raw)
            dst=os.path.join(ASSETS,'tex',f'{a.id}_{mp}.webp');to_webp(raw,dst,a.size,a.q,mp);out.append(dst)
    elif a.kind=='hdri':
        e=files['hdri'][a.res]['hdr'];dst=os.path.join(ASSETS,'hdri',f'{a.id}_{a.res}.hdr');get(e['url'],dst);out.append(dst)
    elif a.kind=='model':
        g=files['gltf'][a.res]['gltf'];base=os.path.join(ASSETS,'models','ph',a.id);os.makedirs(base,exist_ok=True);top=os.path.join(base,os.path.basename(g['url']));get(g['url'],top);out.append(top)
        for rel,e in g.get('include',{}).items():
            dst=os.path.join(base,rel);get(e['url'],dst);out.append(dst)
    record(a.kind,a.id,out,info);print(a.kind,a.id,'->',[f'{os.path.relpath(f,SITE)} ({os.path.getsize(f)//1024}KB)' for f in out])
main()
