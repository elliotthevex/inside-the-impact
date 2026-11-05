#!/usr/bin/env python3
"""A second person from the fighter's own mesh.

  second_face.py M021_DUMP OTHER_DUMP M021_TEX_DIR OTHER_TEX_DIR OTHER_PREFIX OUT_DIR NAME [--sizes 2048,1024]

Rocketbox heads differ in vertex count, so they do not swap, but their atlases share one UV layout. That gives a
correspondence: the other man's head surface is rasterised into UV space and every vertex of the fighter's head
moves to the surface point that has its own UV. Topology, skin weights and all face morphs stay, so there is no
neck seam to weld. Below the other atlas's coverage (neck and upper chest) the fighter's texture is recoloured
to the other man's skin, and his body atlas gets the same recolour, so the skin stays continuous.

Outputs in OUT_DIR: NAME_head_{d,n,s}_{size}.webp, NAME_body_d_{size}.webp, NAME_face.bin
(uint32 n, uint32 idx[n], float32 dPos[3n], float32 dNormal[3n], little endian; idx is into fighter.glb's shared vertices)."""
import sys,os,json,argparse,struct
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image,ImageFilter
def load(base):
    h=json.load(open(base+'.json'));b=np.memmap(base+'.bin',mode='r');M=[m for m in h['meshes'] if m['skinned']][0]
    arr=lambda s,t:np.frombuffer(b,dtype=t,count=s[1],offset=s[0]).copy()
    # float32 throughout: the weld below must reproduce person.py's exactly
    P=arr(M['position'],np.float32).reshape(-1,3)*.01;N=arr(M['normal'],np.float32).reshape(-1,3);UV=arr(M['uv'],np.float32).reshape(-1,2)
    return M,P,N,UV
def posmap(P,UV,idx,S=1536):
    """position of the surface at each UV texel"""
    G=np.zeros((S,S,3),np.float32);C=np.zeros((S,S),bool)
    T=idx.reshape(-1,3)
    for t in T:
        uv=UV[t]*(S-1);lo=np.floor(uv.min(0)).astype(int);hi=np.ceil(uv.max(0)).astype(int)
        if (hi-lo).max()>S//3 or (lo<0).any() or (hi>=S).any(): continue
        xs,ys=np.meshgrid(np.arange(lo[0],hi[0]+1),np.arange(lo[1],hi[1]+1));a,b,c=uv
        d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(d)<1e-9: continue
        l0=((b[1]-c[1])*(xs-c[0])+(c[0]-b[0])*(ys-c[1]))/d;l1=((c[1]-a[1])*(xs-c[0])+(a[0]-c[0])*(ys-c[1]))/d;l2=1-l0-l1
        m=(l0>=-.02)&(l1>=-.02)&(l2>=-.02)
        G[ys[m],xs[m]]=(P[t[0]]*l0[m,None]+P[t[1]]*l1[m,None]+P[t[2]]*l2[m,None]).astype(np.float32);C[ys[m],xs[m]]=True
    return G,C
def sample(G,C,uv,S):
    x=np.clip(np.round(uv[:,0]*(S-1)).astype(int),0,S-1);y=np.clip(np.round(uv[:,1]*(S-1)).astype(int),0,S-1)
    out=G[y,x].astype(np.float64);ok=C[y,x].copy()
    # just outside coverage: look a few texels around
    for i in np.nonzero(~ok)[0]:
        r=8;x0,x1,y0,y1=max(0,x[i]-r),min(S,x[i]+r+1),max(0,y[i]-r),min(S,y[i]+r+1);m=C[y0:y1,x0:x1]
        if m.any():
            yy,xx=np.nonzero(m);k=np.argmin((yy+y0-y[i])**2+(xx+x0-x[i])**2);out[i]=G[yy[k]+y0,xx[k]+x0];ok[i]=True
    return out,ok
def smooth_normals(P,T,inv,nv):
    n=np.zeros((nv,3));a,b,c=T[:,0],T[:,1],T[:,2];f=np.cross(P[b]-P[a],P[c]-P[a])
    for v in (a,b,c): np.add.at(n,inv[v],f)
    n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12);return n[inv]
def tolin(a): return np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4)
def tosrgb(a): a=np.clip(a,0,1);return np.where(a<=.0031308,a*12.92,1.055*a**(1/2.4)-.055)
def dilate(rgb,mask):
    """push-pull padding, same as skin.py: fill unset texels from a coarse pyramid of the set ones"""
    levels=[(rgb.astype(np.float32),mask.astype(np.float32))]
    while min(levels[-1][1].shape)>2:
        c,m=levels[-1];H,W=m.shape;H2,W2=H//2*2,W//2*2;c=c[:H2,:W2];m=m[:H2,:W2];cc=c*m[...,None];cs=cc.reshape(H2//2,2,W2//2,2,3).sum((1,3));ms=m.reshape(H2//2,2,W2//2,2).sum((1,3));levels.append((cs/np.maximum(ms,1e-6)[...,None],(ms>0).astype(np.float32)))
    c=levels[-1][0]
    for cl,ml in reversed(levels[:-1]):
        up=np.repeat(np.repeat(c,2,0),2,1);H,W=ml.shape;up=np.pad(up,((0,max(0,H-up.shape[0])),(0,max(0,W-up.shape[1])),(0,0)),mode='edge')[:H,:W];c=cl*ml[...,None]+up*(1-ml[...,None])
    return c
def rd(p): return np.asarray(Image.open(p).convert('RGB'),dtype=np.float32)/255
def wr(a,path,q,sizes,sz_name):
    a8=(np.clip(a,0,1)*255).astype(np.uint8)
    for sz in sizes:
        I=Image.fromarray(a8)
        if sz!=I.width: I=I.resize((sz,sz),Image.LANCZOS)
        d=path.replace('{s}',str(sz));I.save(d,'WEBP',quality=q,method=6);print(os.path.basename(d),os.path.getsize(d)//1024,'KB')
def main():
    a=argparse.ArgumentParser();a.add_argument('base');a.add_argument('other');a.add_argument('basetex');a.add_argument('othertex');a.add_argument('prefix');a.add_argument('out');a.add_argument('name');a.add_argument('--sizes',default='2048,1024');a.add_argument('--geo-only',action='store_true');a.add_argument('--check');a.add_argument('--boost',type=float,default=1.0);a=a.parse_args();sizes=[int(x) for x in a.sizes.split(',')]
    M,P,N,UV=load(a.base);Mo,Po,No,UVo=load(a.other)
    hg=[g for g in M['groups'] if 'head' in g['mat']];idx=np.concatenate([np.arange(g['start'],g['start']+g['count']) for g in hg]);hgo=[g for g in Mo['groups'] if 'head' in g['mat']];idxo=np.concatenate([np.arange(g['start'],g['start']+g['count']) for g in hgo])
    S=1536;G,C=posmap(Po,UVo,idxo,S);print('coverage',C.mean())
    # same weld as person.py, so indices line up with fighter.glb
    key=np.round(np.c_[P*1e4,N*1e3,UV*1e4]).astype(np.int64);_,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.ravel()
    Pw=P[first].astype(np.float64);UVw=UV[first].astype(np.float64);T=inv[idx].reshape(-1,3);used=np.unique(T)
    if a.check:
        with open(a.check,'rb') as f:
            hd=f.read(12);jl=struct.unpack('<I',f.read(4))[0];f.read(4);J=json.loads(f.read(jl));f.read(8);B=f.read()
        acc=J['accessors'][J['meshes'][0]['primitives'][0]['attributes']['POSITION']];v=J['bufferViews'][acc['bufferView']];GP=np.frombuffer(B,np.float32,acc['count']*3,v['byteOffset']).reshape(-1,3)
        assert len(GP)==len(Pw) and np.abs(GP-Pw).max()<1e-6,'vertex order differs from '+a.check
        print('vertex order matches fighter.glb',len(GP))
    tgt,ok=sample(G,C,UVw[used],S);d=tgt-Pw[used];d[~ok]=0
    # the neck and below stay exactly as they are, so nothing moves at the body seam
    y=Pw[used,1];w=np.clip((y-1.50)/.06,0,1);w=w*w*(3-2*w);d*=w[:,None]
    mag=np.linalg.norm(d,axis=1);print('delta mm: median',np.median(mag)*1e3,'p95',np.percentile(mag,95)*1e3,'max',mag.max()*1e3,'moved',(mag>1e-4).sum(),'of',len(used))
    # welded by position, then a few passes of neighbour smoothing: UV seams must not tear
    ku=np.round(Pw[used]/2e-4).astype(np.int64);_,fp,ip=np.unique(ku,axis=0,return_index=True,return_inverse=True);ip=ip.ravel();nw=len(fp);dd=np.zeros((nw,3));cc=np.zeros(nw);np.add.at(dd,ip,d);np.add.at(cc,ip,1);dd/=cc[:,None]
    rem=-np.ones(len(Pw),int);rem[used]=np.arange(len(used));Tw=ip[rem[T]];e=np.r_[Tw[:,[0,1]],Tw[:,[1,2]],Tw[:,[2,0]]];e=e[e[:,0]!=e[:,1]]
    # outliers: a vertex far from its neighbours' delta took a wrong sample
    for it in range(4):
        s=np.zeros((nw,3));n=np.zeros(nw);np.add.at(s,e[:,0],dd[e[:,1]]);np.add.at(n,e[:,0],1);np.add.at(s,e[:,1],dd[e[:,0]]);np.add.at(n,e[:,1],1);av=s/np.maximum(n,1)[:,None];far=np.linalg.norm(dd-av,axis=1)>.012;dd[far]=av[far];dd=dd*.75+av*.25
    d=dd[ip];newP=Pw[used]+d
    # normals: recompute on the moved surface, keep the original where nothing moved
    Pu=Pw[used];n0=smooth_normals(Pu,rem[T],ip,nw);n1=smooth_normals(newP,rem[T],ip,nw);dn=(n1-n0)*w[:,None]
    keep=np.nonzero(np.linalg.norm(d,axis=1)>1e-5)[0]
    os.makedirs(a.out,exist_ok=True);fn=os.path.join(a.out,a.name+'_face.bin')
    with open(fn,'wb') as f:
        f.write(struct.pack('<I',len(keep)));f.write(used[keep].astype(np.uint32).tobytes());f.write(d[keep].astype(np.float32).tobytes());f.write(dn[keep].astype(np.float32).tobytes())
    print(os.path.basename(fn),os.path.getsize(fn)//1024,'KB',len(keep),'verts')
    if a.geo_only: return
    # skin: fighter's neck band versus the other man's, same UV region, linear log-space transfer
    bd=os.path.join;A=rd(bd(a.basetex,'m021_head_color.tga'));B=rd(bd(a.othertex,a.prefix+'_head_color.tga'));Bd=rd(bd(a.basetex,'m021_body_color.tga'));H=A.shape[0]
    la,lb=tolin(A),tolin(B);cover=(B.max(2)>6/255);r0,r1=int(H*.47),int(H*.58);c0,c1=int(H*.14),int(H*.86);band=np.zeros(cover.shape,bool);band[r0:r1,c0:c1]=True;band&=cover&(A.max(2)>6/255)
    ma=np.log(np.maximum(la[band],1e-4));mb=np.log(np.maximum(lb[band],1e-4));mua,mub=ma.mean(0),mb.mean(0);sa,sb=ma.std(0),mb.std(0);g=np.clip(sb/np.maximum(sa,1e-3),.85,1.15);mub=mub+np.log(a.boost);print('skin mean lin base',np.exp(mua).round(3),'other',np.exp(mub).round(3),'gamma',g.round(2))
    rec=lambda im:tosrgb(np.exp(mub+(np.log(np.maximum(tolin(im),1e-4))-mua)*g))
    Bb=tosrgb(lb*a.boost);B=Bb;Rh=rec(A);Rb=rec(Bd);bodymask=Bd.max(2)>6/255;Rb=dilate(Rb,bodymask)
    # the other atlas down to its neck edge, recoloured fighter below it
    img=Image.fromarray((cover*255).astype(np.uint8));rad=int(H*.012);bl=np.asarray(img.filter(ImageFilter.GaussianBlur(rad)),dtype=np.float32)/255;m=np.clip((bl-.55)/.4,0,1);m=m*m*(3-2*m)
    amask=(A.max(2)>6/255)|cover;Hd=dilate(B*m[...,None]+Rh*(1-m[...,None]),amask)
    wr(Hd,bd(a.out,a.name+'_head_d_{s}.webp'),84,sizes,0)
    An=rd(bd(a.basetex,'m021_head_normal.tga'));Bn=rd(bd(a.othertex,a.prefix+'_head_normal.tga'));wr(dilate(Bn*m[...,None]+An*(1-m[...,None]),amask),bd(a.out,a.name+'_head_n_{s}.webp'),88,sizes,0)
    As=rd(bd(a.basetex,'m021_head_specular.tga'));Bs=rd(bd(a.othertex,a.prefix+'_head_specular.tga'));wr(dilate(Bs*m[...,None]+As*(1-m[...,None]),amask),bd(a.out,a.name+'_head_s_{s}.webp'),84,sizes,0)
    wr(Rb,bd(a.out,a.name+'_body_d_{s}.webp'),84,sizes,0)
if __name__=='__main__': main()
