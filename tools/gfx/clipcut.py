"""Cut clips out of retargeted mocap: clipcut.py DUMP OUTDIR 'name|bvh|start|end[|anchor]' ...
Times in seconds. Each clip is re-based so the pelvis starts at the origin facing +Z at its anchor time
(default: start), then filtered and resampled to 60 fps."""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
import numpy as np,bvh,retarget as rt
from glb import m2q
def arc(a,b):
    a=a/np.linalg.norm(a,axis=-1,keepdims=True);b=b/np.linalg.norm(b,axis=-1,keepdims=True);v=np.cross(a,b);c=(a*b).sum(-1)
    K=np.zeros(a.shape[:-1]+(3,3));K[...,0,1]=-v[...,2];K[...,0,2]=v[...,1];K[...,1,0]=v[...,2];K[...,1,2]=-v[...,0];K[...,2,0]=-v[...,1];K[...,2,1]=v[...,0]
    return np.eye(3)+K+(K@K)*(1/np.maximum(1+c,1e-6))[...,None,None]
def sstep(a,b,x):
    t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)
def boxer(tg,L,root,lift):
    """The capture subjects were not boxers: their hands rest at the chest, and CMU's wrist data is noisy.
    Lift each hand toward the chin whenever it is not out on a punch, solved with two-bone IK so the
    shoulder stays put, and replace the wrist with a straight one, thumb up in guard and turning over as the arm extends."""
    ix=tg.ix;L=L.copy()
    for side,sg in(('L',1),('R',-1)):
        n=lambda s:f'Bip01_{side}_{s}';W,Pn=rt.fk(tg,L,root)
        fw=W[:,ix['Bip01_Spine2']]@np.linalg.inv(W[0,ix['Bip01_Spine2']])@tg_forward0(tg,W)
        fw=fw/np.linalg.norm(fw,axis=1,keepdims=True);up=np.array([0,1.,0])
        S,E,H=Pn[:,ix[n('UpperArm')]],Pn[:,ix[n('Forearm')]],Pn[:,ix[n('Hand')]];Nk=Pn[:,ix['Bip01_Neck']]
        rel=H-Nk;zf=(rel*fw).sum(1);home=1-sstep(.30,.46,zf);home=home*(1-sstep(-.42,-.30,-np.abs(rel[:,1]+0.02)-0.0)*0)
        side_ax=np.cross(up,fw);side_ax/=np.linalg.norm(side_ax,axis=1,keepdims=True)
        lat=(rel*side_ax).sum(1);want_lat=sg*.135
        d=home[:,None]*(np.array([0,lift,0])[None]+fw*.04+side_ax*((want_lat-lat)*.55)[:,None])
        T=H+d
        a,b=np.linalg.norm(E-S,axis=1),np.linalg.norm(H-E,axis=1);v=T-S;dist=np.clip(np.linalg.norm(v,axis=1),1e-4,a+b-1e-3);vh=v/np.linalg.norm(v,axis=1,keepdims=True)
        pole=E-S-(vh*((E-S)*vh).sum(1,keepdims=True));pole/=np.maximum(np.linalg.norm(pole,axis=1,keepdims=True),1e-6)
        ca=(a*a+dist*dist-b*b)/(2*a*dist);E2=S+vh*(a*ca)[:,None]+pole*(a*np.sqrt(np.maximum(1-ca*ca,0)))[:,None];H2=S+vh*dist[:,None]
        Wu=arc(E-S,E2-S)@W[:,ix[n('UpperArm')]];Wf=arc(H-E,H2-E2)@W[:,ix[n('Forearm')]]
        Wc=W[:,ix[n('Clavicle')]];L[:,ix[n('UpperArm')]]=np.transpose(Wc,(0,2,1))@Wu;L[:,ix[n('Forearm')]]=np.transpose(Wu,(0,2,1))@Wf
        # straight wrist: bone X along the forearm; rig measured: thumb is local -Z on the left, +Z on the right
        f=(H2-E2)/np.linalg.norm(H2-E2,axis=1,keepdims=True);ext=sstep(.35,.52,zf)
        thumb_up=up-f*(f@up)[:,None];thumb_up/=np.maximum(np.linalg.norm(thumb_up,axis=1,keepdims=True),1e-6)
        med=-sg*side_ax;med=med-f*(med*f).sum(1,keepdims=True);med/=np.maximum(np.linalg.norm(med,axis=1,keepdims=True),1e-6)
        th=thumb_up*(1-ext)[:,None]+med*ext[:,None];th/=np.maximum(np.linalg.norm(th,axis=1,keepdims=True),1e-6)
        Z=-th if side=='L' else th;Y=np.cross(Z,f);Y/=np.linalg.norm(Y,axis=1,keepdims=True);Z=np.cross(f,Y)
        Wh=np.stack([f,Y,Z],axis=-1);L[:,ix[n('Hand')]]=np.transpose(Wf,(0,2,1))@Wh
    return L
def tg_forward0(tg,W):
    # the chest's forward at frame 0 of this slice, expressed so the product above yields world forward
    return np.array([0,0,1.])
def smooth(q,k=2):
    """binomial filter along time, for any trailing shape"""
    w=np.array([1,4,6,4,1],float);w/=w.sum();n=len(q);out=np.zeros_like(q)
    for o,wt in zip(range(-2,3),w): out+=q[np.clip(np.arange(n)+o,0,n-1)]*wt
    return out
def main():
    dump,outdir=sys.argv[1],sys.argv[2];tg=rt.Target(dump);cache={};names=[n for n in tg.names if n in rt.MAP.values()]
    for spec in sys.argv[3:]:
        f=spec.split('|');name,src,t0,t1=f[0],f[1],float(f[2]),float(f[3]);anc=float(f[4]) if len(f)>4 and f[4] else t0
        guard=not(len(f)>5 and f[5]=='raw');lift=float(f[6]) if len(f)>6 else .17
        if src not in cache:
            b=bvh.load(src);L,W,root,sc=rt.retarget(b,tg);cache[src]=(b,L,W,root)
        b,L,W,root=cache[src];dt=b.dt;a,e,ai=int(t0/dt),int(t1/dt),int(anc/dt)
        # facing at the anchor, from the pelvis (it rotates with the feet, not the shot)
        pi=tg.ix['Bip01_Pelvis'];Wp=W[:,pi];fw=(Wp[ai]@tg.Wrest[pi].T)@np.array([0,0,1.]);yaw=np.arctan2(fw[0],fw[2]);c,s=np.cos(-yaw),np.sin(-yaw);Ry=np.array([[c,0,s],[0,1,0],[-s,0,c]])
        idx=[tg.ix[n] for n in names];Lc=L[a:e].copy();rootc=(root[a:e]-root[ai]*np.array([1,0,1]))
        rootc=(Ry@rootc[...,None])[...,0]
        ri=tg.ix['Bip01_Pelvis'];Lc[:,ri]=Ry@Lc[:,ri]
        if guard: Lc=boxer(tg,Lc,rootc,lift)
        Q=m2q(Lc[:,idx])
        for k in range(1,len(Q)):
            flip=(Q[k]*Q[k-1]).sum(-1)<0;Q[k][flip]*=-1
        Q=smooth(Q);Q/=np.linalg.norm(Q,axis=-1,keepdims=True);rootc=smooth(rootc)
        step=max(1,int(round((1/60)/dt)));Q=Q[::step];rootc=rootc[::step]
        meta=dict(name=name,fps=round(1/(dt*step)),frames=len(Q),bones=names,source=os.path.basename(src),t0=t0,t1=t1)
        np.concatenate([Q.astype(np.float32).ravel(),rootc.astype(np.float32).ravel()]).tofile(os.path.join(outdir,name+'.bin'));json.dump(meta,open(os.path.join(outdir,name+'.json'),'w'))
        print(name,len(Q),'frames',round(len(Q)/meta['fps'],2),'s')
if __name__=='__main__': main()
