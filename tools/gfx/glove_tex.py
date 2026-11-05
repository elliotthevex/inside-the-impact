#!/usr/bin/env python3
"""The glove's textures: leather from the CC0 tile, panels, double stitching, piping, strap and trim drawn into a height field.
Outputs assets/people/glove_{d,n,r}.webp. glove_d's alpha says where the corner colour applies: 1 on leather, 0 on trim and strap.
UV follows gfx/people/glove.js: u round from the thumb side (0), palm .25, far side .5, back of the hand .75; v = .78*(x+.098)/.249; thumb v .80..1."""
import os
import numpy as np
from PIL import Image,ImageFilter
HERE=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(os.path.dirname(HERE));TEX=os.path.join(SITE,'assets','tex');OUT=os.path.join(SITE,'assets','people')
W=H=1400
v,u=np.meshgrid((np.arange(H)+.5)/H,(np.arange(W)+.5)/W,indexing='ij')
def load(n): return np.asarray(Image.open(os.path.join(TEX,n)).convert('RGB'),dtype=np.float32)/255
def tile(a,rx,ry):
    h,w=a.shape[:2];yy=(np.arange(H)*ry*h/H).astype(int)%h;xx=(np.arange(W)*rx*w/W).astype(int)%w;return a[yy][:,xx]
def h2n(Hg,s):
    gy,gx=np.gradient(Hg);n=np.dstack([-gx*s,-gy*s,np.ones_like(Hg)]);return n/np.linalg.norm(n,axis=2,keepdims=True)
def rnm(a,b):
    t=a+np.array([0,0,1.]);u_=b*np.array([-1,-1,1.]);r=t*(t*u_).sum(2,keepdims=True)/t[...,2:3]-u_;return r/np.linalg.norm(r,axis=2,keepdims=True)
gauss=lambda x,s:np.exp(-(x/s)**2)
vx=lambda x:.78*(x+.098)/.249                  # v of a position along the spine
Lu=.36;Lv=.249/.78                             # metres per unit of u (mitt girth) and of v
lw=load('leather_white_nor_gl.webp')*2-1;ld=load('leather_white_diff.webp').mean(2);lr=load('leather_white_rough.webp').mean(2)
rx,ry=Lu/.11,Lv/.11                            # one tile about 11 cm of leather
gN=tile(lw,rx,ry);gD=tile(ld[...,None],rx,ry)[...,0];gR=tile(lr[...,None],rx,ry)[...,0]
mitt=v<.79;thumb=v>=.795
Hg=np.zeros((H,W));dark=np.zeros((H,W));thread=np.zeros((H,W));trim=np.zeros((H,W));strapM=np.zeros((H,W),bool)
def cyc(a,b): d=np.abs(a-b);return np.minimum(d,1-d)
def useam(c,vlo,vhi,depth=1.,pipe=False,stitch=True):
    """a seam running along the spine at u=c"""
    d=cyc(u,c)*Lu;on=((v>vlo)&(v<vhi)).astype(np.float32)
    # the puff fades out where the seam ends, or its edge would draw a ring round the mitt
    sm=lambda a,b,x:(lambda s:s*s*(3-2*s))(np.clip((x-a)/(b-a),0,1));fade=sm(vlo-.002,vlo+.012,v)*(1-sm(vhi-.05,vhi+.002,v))
    Hg[:]+=-gauss(d,.0016)*on*depth;dark[:]=np.maximum(dark,gauss(d,.0014)*on)
    Hg[:]+=(1-np.exp(-(d/.016)**2))*fade*.9      # the panels either side puff up away from it
    if pipe:
        p=gauss(d-.0003,.0011)*on;trim[:]=np.maximum(trim,p*.8);Hg[:]+=p*.8
    if stitch:
        for off in (.0042,):
            s=gauss(d-off,.00085)*on*(np.sin(v*Lv*2*np.pi/.0062)>-.25);thread[:]=np.maximum(thread,s)
def vseam(x,depth=1.,stitch=True,off=(.0042,)):
    """a seam running round the glove at spine position x"""
    d=np.abs(v-vx(x))*Lv;on=mitt.astype(np.float32)
    Hg[:]+=-gauss(d,.0014)*on*depth;dark[:]=np.maximum(dark,gauss(d,.0012)*on)
    if stitch:
        for o in off:
            d2=np.abs(v-vx(x)-o/Lv)*Lv;s=gauss(d2,.00085)*on*(np.sin(u*Lu*2*np.pi/.0062)>-.25);thread[:]=np.maximum(thread,s)
# panels over the back of the hand: a centre panel with piping, two side panels; a palm panel with its own seams
vtop=vx(.122);vbase=vx(-.012)
useam(.75-.082,vbase,vtop,1.,pipe=True);useam(.75+.082,vbase,vtop,1.,pipe=True)
useam(.075,vbase,vtop,.8);useam(.425,vbase,vtop,.8)
# the cuff: seam where it meets the mitt, a white band, the strap, a hem
vseam(-.012,1.2,True,(-.0042,.0042))
sv0,sv1=vx(-.072),vx(-.024);strapM[(v>sv0)&(v<sv1)]=True
Hg+=np.where(strapM,1.3,0)
Hg+=(np.random.default_rng(3).random((H,W))-.5)*.12*strapM     # hook and loop
edge=np.minimum(np.abs(v-sv0),np.abs(v-sv1))*Lv
trim=np.maximum(trim,gauss(edge,.0016)*(v<.79));thread=np.maximum(thread,gauss(edge-.0038,.0008)*(np.sin(u*Lu*2*np.pi/.006)>-.2)*strapM)
tab=(cyc(u,.75)*Lu<.034)&strapM                                   # the strap's pull tab, on the back of the wrist
Hg+=tab*.9;tabe=np.abs(cyc(u,.75)*Lu-.034);thread=np.maximum(thread,gauss(tabe-.002,.0008)*strapM*(np.sin(v*Lv*2*np.pi/.006)>-.2))
band=(v>vx(-.094))&(v<vx(-.083))                                  # a white band near the hem
trim=np.maximum(trim,band.astype(np.float32));Hg+=band*.35
hem=np.exp(-(v/.008)**2);Hg-=hem*.9;dark=np.maximum(dark,hem*.6)
# soft dome across the whole hand part, so highlights roll over the knuckles
# wrinkles at the wrist where the leather bends
rng=np.random.default_rng(11);wr=np.zeros((H,W))
for k in range(16):
    c=rng.uniform(vx(-.006),vx(.024));w=rng.uniform(.0016,.0035)/Lv;a=rng.uniform(.3,1.);p=rng.uniform(0,6.28);wr+=a*np.exp(-((v-c-.006*np.sin(u*12+p))/w)**2)*(.5+.5*np.sin(u*6.28*rng.integers(1,3)+p))
Hg-=wr*.35
# thumb: a seam along its outer side, a seam where it joins, darker at the root
tu=cyc(u,.0);d=tu*.13
tv=(v-.80)/.20
Hg=np.where(thumb,0,Hg);dark=np.where(thumb,0,dark);thread=np.where(thumb,0,thread);trim=np.where(thumb,0,trim)
sd=cyc(u,.75)*.13;Hg+=thumb*(-gauss(sd,.0014)+(1-np.exp(-(sd/.012)**2))*.6);dark=np.maximum(dark,thumb*gauss(sd,.0012));thread=np.maximum(thread,thumb*gauss(sd-.0038,.0008)*(np.sin(v*.07*2*np.pi/.0062*3)>-.2))
root=thumb*np.exp(-(tv/.12)**2);dark=np.maximum(dark,root*.8)
# normal
def blur(a):
    k=np.array([1,4,6,4,1],np.float32)/16;o=sum(np.roll(a,i-2,1)*k[i] for i in range(5));return sum(np.roll(o,i-2,0)*k[i] for i in range(5))
nmap=h2n(blur(Hg),3.2)
Ngrain=gN.copy();Ngrain[...,:2]*=.8;Ngrain/=np.linalg.norm(Ngrain,axis=2,keepdims=True)
Nf=rnm(Ngrain,nmap)
# albedo: near white leather so the corner colour rules; alpha 1 where it applies
A=np.clip(.86+(gD-gD.mean())*.5,.6,1)
alb=np.dstack([A,A,A])
alb*=(1-dark*.72)[...,None]
tint=np.ones((H,W),np.float32)
strapC=np.array([.035,.035,.04]);alb[strapM]=strapC*(1+(gD[strapM,None]-gD.mean())*.8)
tint[strapM]=0
tr=np.clip(trim,0,1)[...,None];alb=alb*(1-tr)+np.array([.86,.85,.82])*tr;tint=tint*(1-tr[...,0])
th=np.clip(thread,0,1)[...,None];alb=alb*(1-th)+np.array([.9,.89,.84])*th;tint=tint*(1-th[...,0])
tab2=(tab&(np.abs(v-(sv0+sv1)/2)<.013))
alb[tab2]=np.array([.82,.81,.78]);tint[tab2]=0
# roughness: broken-in leather, satin rather than glossy; matte on the strap and thread
R=np.clip(.40+(gR-gR.mean())*.55+dark*.25,.2,1);R=np.where(strapM,.85,R);R=R*(1-th[...,0])+.7*th[...,0];R=R*(1-tr[...,0]*.5)+.42*tr[...,0]*.5
def save(a,n,q,alpha=None):
    a8=(np.clip(a,0,1)*255).astype(np.uint8)
    if alpha is not None: a8=np.dstack([a8,(np.clip(alpha,0,1)*255).astype(np.uint8)])
    Image.fromarray(a8,'RGBA' if alpha is not None else 'RGB').save(os.path.join(OUT,n),'WEBP',quality=q,method=6,alpha_quality=90);print(n,os.path.getsize(os.path.join(OUT,n))//1024,'KB')
save(alb,'glove_d.webp',88,tint);save(Nf*.5+.5,'glove_n.webp',90);save(np.dstack([R]*3),'glove_r.webp',84)
