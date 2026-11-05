#!/usr/bin/env python3
"""Bake the gear's textures from the CC0 tile textures, plus stitching drawn into a height field.
Outputs to assets/people/: glove_{d,n,r}.webp, trunks_{n,r}.webp, boot_{d,n,r}.webp
The glove's albedo is near-white so the corner colour is simply material.color."""
import os,sys
import numpy as np
from PIL import Image,ImageFilter
HERE=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(os.path.dirname(HERE));TEX=os.path.join(SITE,'assets','tex');OUT=os.path.join(SITE,'assets','people')
def load(n,size=None):
    im=Image.open(os.path.join(TEX,n)).convert('RGB')
    return np.asarray(im,dtype=np.float32)/255
def tile(a,W,H,rx,ry):
    h,w=a.shape[:2];yy=(np.arange(H)*ry*h/H).astype(int)%h;xx=(np.arange(W)*rx*w/W).astype(int)%w;return a[yy][:,xx]
def h2n(H,strength):
    gy,gx=np.gradient(H);n=np.dstack([-gx*strength,-gy*strength,np.ones_like(H)]);n/=np.linalg.norm(n,axis=2,keepdims=True);return n
def rnm(a,b):
    """reoriented normal mapping of two tangent-space normals, both in -1..1"""
    t=a+np.array([0,0,1.]);u=b*np.array([-1,-1,1.]);return t*(t*u).sum(2,keepdims=True)/t[...,2:3]-u
def gauss(x,c,s): return np.exp(-((x-c)/s)**2)
def save(arr,name,q=84):
    Image.fromarray((np.clip(arr,0,1)*255).astype(np.uint8)).save(os.path.join(OUT,name),'WEBP',quality=q,method=6);print(name,os.path.getsize(os.path.join(OUT,name))//1024,'KB')
def enc(n): return n*.5+.5
def stitches(mask_dist_u,v,rate,w):
    """a dashed line of thread along a seam: mask_dist is distance from the seam, v runs along it"""
    return gauss(mask_dist_u,0,w)*(np.sin(v*rate)>-.2)
def glove():
    W=H=1024;v,u=np.meshgrid(np.linspace(0,1,H),np.linspace(0,1,W),indexing='ij')
    # body loft: u around, v 0..0.78 cuff mouth to tip. thumb: v 0.80..1
    lw=load('leather_white_nor_gl.webp')*2-1;ld=load('leather_white_diff.webp');lr=load('leather_white_rough.webp')
    nt=tile(lw,W,H,4,5);dt=tile(ld,W,H,4,5);rt=tile(lr,W,H,4,5)
    Hgt=np.zeros((H,W));dark=np.zeros((H,W));thread=np.zeros((H,W))
    def useam(c,vlo=0.2,vhi=.78,depth=1.,thr=True):
        d=np.minimum(np.abs(u-c),1-np.abs(u-c))
        on=(v>vlo)&(v<vhi);Hgt[:]+=-(gauss(d,0,.0035))*on*depth;dark[:]+=gauss(d,0,.0028)*on*.5
        if thr:
            for off in(-.0085,.0085):
                s=gauss(d-abs(off),0,.0016)*on*(np.sin(v*520)>-.1);thread[:]=np.maximum(thread,s);Hgt[:]+=s*.6
    def vseam(c,depth=1.,thr=True):
        on=(v<.79);d=np.abs(v-c);Hgt[:]+=-(gauss(d,0,.0032))*on*depth;dark[:]+=gauss(d,0,.0026)*on*.5
        if thr:
            for off in(.008,):
                s=gauss(d-off,0,.0015)*on*(np.sin(u*760)>-.1);thread[:]=np.maximum(thread,s);Hgt[:]+=s*.6
    # three panels over the back of the hand, a palm panel, and the seam where the cuff meets the mitt
    for c in(.08,.42,.58,.92): useam(c)
    vseam(.245);vseam(.095,.6)
    # the hook-and-loop strap wraps the wrist between these
    strap=((v>.105)&(v<.215)).astype(np.float32);Hgt+=strap*1.1
    pad=gauss(v,.56,.17)*(1-strap);Hgt+=pad*.0
    nmap=h2n(Hgt,2.6);N=rnm(nt,nmap)
    A=dt.mean(2,keepdims=True)**.6;alb=np.dstack([A[...,0]]*3)*.98
    alb*=(1-dark*.65)[...,None];alb=alb*(1-thread[...,None])+np.array([.93,.92,.88])*thread[...,None]
    # strap reads darker and matte; the cuff mouth a little worn
    alb*=(1-strap*.82)[...,None]
    rough=np.clip(rt.mean(2)*.55+.18+strap*.42+dark*.2,0,1)
    # thumb seam
    alb[(v>.795)&(v<.803)]*=.4
    save(alb,'glove_d.webp');save(enc(N),'glove_n.webp',88);save(np.dstack([rough]*3),'glove_r.webp')
def trunks():
    W,H=1024,512;v,u=np.meshgrid(np.linspace(0,1,H),np.linspace(0,1,W),indexing='ij')
    sn=load('crepe_satin_nor_gl.webp')*2-1;nt=tile(sn,W,H,3,1.5)
    # cloth falls from the waistband and gathers at the hem: long soft vertical folds, shifting with height
    rng=np.random.default_rng(7);F=np.zeros((H,W))
    for k in range(26):
        c=rng.random();w=rng.uniform(.012,.05);a=rng.uniform(.3,1.);sw=rng.uniform(-.03,.03);p=rng.uniform(0,6.28)
        d=(u-c-sw*np.sin(v*4+p)+.5)%1-.5;F+=a*np.exp(-(d/w)**2)*np.clip(1.1-v*.9,0.12,1)
    band=np.clip((v-.885)/.01,0,1);F=F*(1-band)
    # waistband ribs, and the band's lower edge
    F+=band*(.45+.05*np.sin(v*520));N=rnm(nt*.35,h2n(F,5.5))
    R=np.clip(.24+.09*tile(load('crepe_satin_rough.webp').mean(2),W,H,3,1.5)+band*.48,0,1)
    save(enc(N),'trunks_n.webp',86);save(np.dstack([R]*3),'trunks_r.webp')
def boot():
    W,H=512,512;v,u=np.meshgrid(np.linspace(0,1,H),np.linspace(0,1,W),indexing='ij')
    lw=load('leather_white_nor_gl.webp')*2-1;nt=tile(lw,W,H,2,2);Hg=np.zeros((H,W));alb=np.full((H,W,3),.07,np.float32)
    # lace panel down the front: u=.5 is +Z; eyelets and crossing laces between the ankle and the top
    d=np.abs(u-.5);panel=(d<.085)&(v>.34);Hg+=panel*.5;alb[panel]=.045
    lace=((np.abs(((v*22)%1)-.5)<.17)&(d<.075)&(v>.36));Hg+=lace*1.1;alb[lace]=.72
    # a contrast sole and a heel counter
    sole=v<.075;alb[sole]=.62;Hg+=sole*.6;alb[(v>.075)&(v<.11)]*=.5
    N=rnm(nt*.6,h2n(Hg,4));R=np.clip(.42+sole*.3-(panel*.02)+lace*.35,0,1)
    save(alb,'boot_d.webp');save(enc(N),'boot_n.webp',86);save(np.dstack([R]*3),'boot_r.webp')
os.makedirs(OUT,exist_ok=True);glove();trunks();boot()
