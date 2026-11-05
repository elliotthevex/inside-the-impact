#!/usr/bin/env python3
"""Rocketbox TGA -> web textures. skin.py TEX_DIR PREFIX OUT_DIR OUT_PREFIX [--size 2048]

The atlases sit on black. Under mipmapping that black bleeds into every UV seam as a thin dark line across the
skin, so each map is edge-padded first: empty texels are flood-filled from the nearest filled texel."""
import sys,os,argparse
import numpy as np
from PIL import Image
def dilate(rgb,mask,it=64):
    """push-pull padding: fill unset texels from a coarse pyramid of the set ones"""
    h,w=mask.shape;levels=[(rgb.astype(np.float32),mask.astype(np.float32))]
    while min(levels[-1][1].shape)>2:
        c,m=levels[-1];H,W=m.shape;H2,W2=H//2*2,W//2*2;c=c[:H2,:W2];m=m[:H2,:W2]
        cc=c*m[...,None];cs=cc.reshape(H2//2,2,W2//2,2,3).sum((1,3));ms=m.reshape(H2//2,2,W2//2,2).sum((1,3));out=cs/np.maximum(ms,1e-6)[...,None]
        levels.append((out,(ms>0).astype(np.float32)))
    c=levels[-1][0]
    for cl,ml in reversed(levels[:-1]):
        up=np.repeat(np.repeat(c,2,0),2,1);H,W=ml.shape;up=np.pad(up,((0,max(0,H-up.shape[0])),(0,max(0,W-up.shape[1])),(0,0)),mode='edge')[:H,:W]
        c=cl*ml[...,None]+up*(1-ml[...,None])
    return c
def main():
    a=argparse.ArgumentParser();a.add_argument('dir');a.add_argument('prefix');a.add_argument('out');a.add_argument('name');a.add_argument('--parts',default='body,head');a.add_argument('--sizes',default='2048,1024');a.add_argument('--maps',default='color,normal,specular');a=a.parse_args()
    os.makedirs(a.out,exist_ok=True)
    for part in a.parts.split(','):
        col=Image.open(os.path.join(a.dir,f'{a.prefix}_{part}_color.tga')).convert('RGB');C=np.asarray(col,dtype=np.uint8)
        mask=C.max(2)>6
        # close pinholes so eyebrow and stubble darks do not read as empty
        for mp in a.maps.split(','):
            f=os.path.join(a.dir,f'{a.prefix}_{part}_{mp}.tga')
            if not os.path.exists(f): continue
            im=np.asarray(Image.open(f).convert('RGB'),dtype=np.uint8)
            out=dilate(im,mask if mp=='color' else (C.max(2)>6)).clip(0,255).astype(np.uint8)
            for sz in (int(x) for x in a.sizes.split(',')):
                I=Image.fromarray(out)
                if sz!=I.width: I=I.resize((sz,sz),Image.LANCZOS)
                suf={'color':'d','normal':'n','specular':'s'}[mp];d=os.path.join(a.out,f'{a.name}_{part}_{suf}_{sz}.webp');I.save(d,'WEBP',quality=88 if mp=='normal' else 84,method=6);print(os.path.relpath(d,a.out),os.path.getsize(d)//1024,'KB')
main()
