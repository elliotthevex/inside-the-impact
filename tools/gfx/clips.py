#!/usr/bin/env python3
"""Cut, clean and pack the fighter's clip library.

  clips.py DUMP OUT_BASE SPEC.json [--cmu DIR ...]

SPEC is a JSON list of clips:
  {"name","src","t0","t1","anchor"?,"contact"?,"hand"?,"aim":"glove"|"pelvis","blade"?,"guard"?,"lift"?,"mirror"?,"loop"?,"fps"?,"fade"?}

Every clip is turned so its target lies along +Z: aim "glove" points the horizontal chest-to-glove line at the contact
time along +Z (the rig's IK takes it from there); aim "pelvis" sets the pelvis yaw at the anchor to `blade` degrees.
Rotations are local, in the bone order of the index. The pelvis's position is in the same frame, zero in x and z at the anchor.
Mirroring is done in world space through the rest pose: D = W_R Wrest_R^T, D' = S D S, W_L = D' Wrest_L, with S = diag(-1,1,1).
"""
import sys,os,json,argparse
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np,bvh,retarget as rt
from glb import m2q
from clipcut import boxer,smooth
S=np.diag([-1.,1,1])
def partner(n):
    if n.startswith('Bip01_L_'): return 'Bip01_R_'+n[8:]
    if n.startswith('Bip01_R_'): return 'Bip01_L_'+n[8:]
    if n=='Bip01_LEye': return 'Bip01_REye'
    if n=='Bip01_REye': return 'Bip01_LEye'
    return n
def mirror(tg,L,root):
    """whole-body mirror across the X=0 plane, in world space, back to locals"""
    W,_=rt.fk(tg,L,root);W2=np.zeros_like(W)
    for b,n in enumerate(tg.names):
        p=tg.ix[partner(n)];D=W[:,p]@tg.Wrest[p].T;W2[:,b]=(S@D@S)@tg.Wrest[b]
    L2=np.zeros_like(L)
    for b in range(len(tg.names)):
        p=tg.par[b];L2[:,b]=(np.transpose(W2[:,p],(0,2,1))@W2[:,b]) if p>=0 else W2[:,b]
    return L2,root*np.array([-1.,1,1])
def yaw_rot(a):
    c,s=np.cos(a),np.sin(a);return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def cut(tg,names,cache,cmu,c):
    src=c['src']
    if src not in cache:
        path=next(p for p in ([os.path.join(d,src+'.bvh') for d in cmu]+[os.path.join(d,src,src+'.bvh') for d in cmu]) if os.path.exists(p))
        b=bvh.load(path);L,W,root,sc=rt.retarget(b,tg);cache[src]=(b,L,root)
    b,Lall,rootall=cache[src];dt=b.dt
    a,e=int(c['t0']/dt),min(b.n,int(c['t1']/dt)+1);L=Lall[a:e].copy();root=rootall[a:e].copy()
    ai=int(c.get('anchor',c['t0'])/dt)-a;hand=c.get('hand')
    if c.get('mirror'):
        L,root=mirror(tg,L,root)
        hand={'L':'R','R':'L'}[hand] if hand else hand
    W,Pn=rt.fk(tg,L,root);ix=tg.ix;ci=None
    if hand:
        H=Pn[:,ix[f'Bip01_{hand}_Hand']];Sh=Pn[:,ix['Bip01_Spine2']]
        if 'contact' in c: ci=int(c['contact']/dt)-a
        else:
            lo=max(0,int((c['tpeak']-.12)/dt)-a);hi=min(len(H),int((c['tpeak']+.12)/dt)-a);ci=lo+int(np.argmax(np.linalg.norm(H[lo:hi]-Sh[lo:hi],axis=1)))
    pi=ix['Bip01_Pelvis']
    if c.get('stroke') and hand:
        # keep only the stroke: from the hand's last rest before contact to its first rest after, within the given caps
        D=np.linalg.norm(H-Sh,axis=1);D=np.convolve(D,np.ones(9)/9,'same')
        # the search window can clip the true peak: climb to the local maximum first
        for _ in range(int(.2/dt)):
            if ci+1<len(D) and D[ci+1]>D[ci]: ci+=1
            elif ci>0 and D[ci-1]>D[ci]: ci-=1
            else: break
        k=ci;lim=max(0,ci-int(c.get('pre',.4)/dt))
        while k>lim and D[k-1]<=D[k]+1e-4: k-=1
        e2=ci;lim=min(len(D)-1,ci+int(c.get('post',.4)/dt))
        while e2<lim and D[e2+1]<=D[e2]+1e-4: e2+=1
        pad=int(.02/dt);k=max(0,k-pad);e2=min(len(D)-1,e2+pad)
        L=L[k:e2+1];root=root[k:e2+1];H=H[k:e2+1];Sh=Sh[k:e2+1];ci-=k;ai=0
        W,Pn=rt.fk(tg,L,root);meta_t=(c['t0']+k*dt,c['t0']+e2*dt)
    if c.get('floor'):
        # the subject's own T-pose can sit off the floor: stand the first or last frames on it, toe joints at their rest height
        n=int(.15/dt);rng=slice(0,n) if c['floor']=='start' else slice(-n,None)
        if c['floor']=='lie':   # flat on the back at the clip's end: the pelvis joint rests about 10 cm off the canvas
            root=root-np.array([0,Pn[-int(.4/dt):,pi,1].mean()-.1,0])
        else:
            toes=np.minimum(Pn[rng,ix['Bip01_L_Toe0'],1],Pn[rng,ix['Bip01_R_Toe0'],1]).mean();root=root-np.array([0,toes-tg.Prest[ix['Bip01_L_Toe0'],1],0])
        W,Pn=rt.fk(tg,L,root)
    if c.get('aim','glove')=='lie':
        d=Pn[ai,ix['Bip01_Head']]-Pn[ai,pi];yaw=np.arctan2(-d[0],-d[2])
    elif c.get('aim','glove')=='glove' and hand:
        d=(H[ci]-Sh[ci]);yaw=np.arctan2(d[0],d[2])
    else:
        fw=(W[ai,pi]@tg.Wrest[pi].T)@np.array([0,0,1.]);yaw=np.arctan2(fw[0],fw[2])-np.radians(c.get('blade',-28.))
    Ry=yaw_rot(-yaw)
    root=(Ry@(root-root[ai]*np.array([1,0,1]))[...,None])[...,0];L[:,pi]=Ry@L[:,pi]
    if c.get('guard',True): L=boxer(tg,L,root,c.get('lift',.17))
    Wf,Pf=rt.fk(tg,L,root);extra={}
    if c.get('lie'):
        i_=0 if c['lie']=='start' else -1;d=Pf[i_,ix['Bip01_Head']]-Pf[i_,pi];extra['lieYaw']=round(float(np.arctan2(d[0],d[2])),4)
    fe=(Wf[-1,pi]@tg.Wrest[pi].T)@np.array([0,0,1.]);extra['endYaw']=round(float(np.arctan2(fe[0],fe[2])+np.radians(28.)),4)
    idx=[ix[n] for n in names];Q=m2q(L[:,idx])
    for k in range(1,len(Q)):
        Q[k][(Q[k]*Q[k-1]).sum(-1)<0]*=-1
    Q=smooth(Q);Q/=np.linalg.norm(Q,axis=-1,keepdims=True);root=smooth(root)
    if c.get('calm') is not None:
        # keep the capture's life but shrink it around its mean: a guard that breathes instead of one that wanders
        m=Q.mean(0);m/=np.linalg.norm(m,axis=-1,keepdims=True);Q=m+(Q-m)*c['calm'];Q/=np.linalg.norm(Q,axis=-1,keepdims=True);mr=root.mean(0);root=mr+(root-mr)*c['calm']
    if c.get('stretch'):
        n=len(Q);x=np.linspace(0,n-1,int(n*c['stretch']));i0=np.floor(x).astype(int);i1=np.minimum(i0+1,n-1);f=(x-i0)[:,None,None];Q=Q[i0]*(1-f)+Q[i1]*f;Q/=np.linalg.norm(Q,axis=-1,keepdims=True);root=root[i0]*(1-f[:,0])+root[i1]*f[:,0]
    fps=c.get('fps',60);step=max(1,int(round((1/fps)/dt)));Q=Q[::step];root=root[::step];nfps=1/(dt*step)
    meta=dict(name=c['name'],fps=round(nfps,3),frames=len(Q),source=src,t0=c['t0'],t1=c['t1'])
    if c.get('mirror'): meta['mirror']=True
    meta.update(extra)
    if hand: meta['hand']=hand;meta['contact']=round(ci*dt,4)
    if c.get('stroke') and hand: meta['t0'],meta['t1']=round(meta_t[0],3),round(meta_t[1],3)
    if c.get('loop'):
        fade=max(2,int(c.get('fade',.5)*nfps));n=len(Q)-fade
        # the tail fades into the head: the loop's last frame equals its first, and pelvis drift is removed
        for i in range(fade):
            w=(i/(fade-1));w=w*w*(3-2*w);q=Q[n+i].copy();flip=(q*Q[i]).sum(-1)<0;q[flip]*=-1;Q[i]=q*(1-w)+Q[i]*w;Q[i]/=np.linalg.norm(Q[i],axis=-1,keepdims=True);root[i]=root[n+i]*(1-w)+root[i]*w
        Q=Q[:n+1];root=root[:n+1];Q[n]=Q[0];root[n]=root[0];meta['frames']=len(Q);meta['loop']=True
    return meta,Q,root
def main():
    a=argparse.ArgumentParser();a.add_argument('dump');a.add_argument('out');a.add_argument('spec');a.add_argument('--cmu',nargs='+',required=True);a=a.parse_args()
    tg=rt.Target(a.dump);names=[n for n in tg.names if n in rt.MAP.values()];spec=json.load(open(a.spec));cache={};metas=[];blob=bytearray()
    for c in spec:
        meta,Q,root=cut(tg,names,cache,a.cmu,c)
        meta['offset']=len(blob)
        blob+=np.round(Q.reshape(-1)*32767).astype(np.int16).tobytes();blob+=np.clip(np.round(root.reshape(-1)*1000),-32767,32767).astype(np.int16).tobytes()
        while len(blob)%8: blob.append(0)
        metas.append(meta);print(meta['name'],meta['frames'],'f',meta.get('hand',''),meta.get('contact',''))
    base=os.path.basename(a.out)
    open(a.out+'.bin','wb').write(bytes(blob));json.dump(dict(bones=names,bin=base+'.bin',clips=metas),open(a.out+'.json','w'),separators=(',',':'))
    print('wrote',a.out,len(blob)//1024,'KB')
if __name__=='__main__': main()
