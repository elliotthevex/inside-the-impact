"""Rocketbox FBX dump -> skinned GLB in metres, with a reduced skeleton and selected morph targets.

  person.py DUMP_BASE OUT.glb [--morphs fighter|none] [--subdiv N] [--names head=...,body=...]

The Rocketbox rig carries 81 bones, half of them facial, which only matter in Max. Morph targets
do the face here, so facial bones are collapsed into the head and the weights follow them.
"""
import sys,os,json,argparse
sys.path.insert(0,os.path.dirname(__file__))
import numpy as np
from glb import GLB,m2q
KEEP_PREFIX=("Bip01_Pelvis","Bip01_Spine","Bip01_Neck","Bip01_Head","Bip01_L_","Bip01_R_","Bip01_LEye","Bip01_REye")
FACE_DROP=("Bip01_MJaw","Bip01_MBottomLip","Bip01_MTongue")
FIGHTER_MORPHS={  # the few that act: blink, squint, stare, wince, slack jaw, a breath through the mouth
 'AK_01_BrowDownLeft':'browDownL','AK_02_BrowDownRight':'browDownR','AK_03_BrowInnerUp':'browInnerUp','AK_04_BrowOuterUpLeft':'browOuterUpL','AK_05_BrowOuterUpRight':'browOuterUpR',
 'AK_06_CheekPuff':'cheekPuff','AK_07_CheekSquintLeft':'cheekSquintL','AK_08_CheekSquintRight':'cheekSquintR','AK_09_EyeBlinkLeft':'blinkL','AK_10_EyeBlinkRight':'blinkR',
 'AK_19_EyeSquintLeft':'squintL','AK_20_EyeSquintRight':'squintR','AK_21_EyeWideLeft':'wideL','AK_22_EyeWideRight':'wideR','AK_25_JawOpen':'jawOpen','AK_27_MouthClose':'mouthClose',
 'AK_30_MouthFrownLeft':'frownL','AK_31_MouthFrownRight':'frownR','AK_32_MouthFunnel':'funnel','AK_36_MouthPressLeft':'pressL','AK_37_MouthPressRight':'pressR',
 'AK_44_MouthSmileLeft':'smileL','AK_45_MouthSmileRight':'smileR','AK_46_MouthStretchLeft':'stretchL','AK_47_MouthStretchRight':'stretchR','AK_50_NoseSneerLeft':'sneerL','AK_51_NoseSneerRight':'sneerR'}
def load(base):
    h=json.load(open(base+'.json'));b=np.memmap(base+'.bin',mode='r')
    def arr(s,t,n=None): return np.frombuffer(b,dtype=t,count=s[1],offset=s[0]).copy()
    return h,arr
def mat4(e): return np.array(e,dtype=np.float64).reshape(4,4).T

def posweld(P,eps=1e-4):
    k=np.round(P/eps).astype(np.int64);_,first,inv=np.unique(k,axis=0,return_index=True,return_inverse=True);return first,inv.ravel()
def smooth_normals(P,T):
    """area-weighted normals, shared across UV seams so an offset shell cannot crack"""
    first,inv=posweld(P);n=np.zeros((len(first),3));a,b,c=T[:,0],T[:,1],T[:,2];f=np.cross(P[b]-P[a],P[c]-P[a])
    for v in(a,b,c): np.add.at(n,inv[v],f)
    n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12);return n[inv]
def anatomy_delta(P,Nm,lm):
    """A 'muscle' morph built from Gaussian bulges at measured landmarks. Gear Up drives this."""
    D=np.zeros_like(P)
    def bulge(c,r,a,mirror=True):
        for sx in((1,-1) if mirror else (1,)):
            cc=np.array([c[0]*sx,c[1],c[2]]);w=np.exp(-np.sum((P-cc)**2,axis=1)/(r*r));D[:]+=Nm*(w*a)[:,None]
    S,E,W,hip,knee,ank=lm['shoulder'],lm['elbow'],lm['wrist'],lm['hip'],lm['knee'],lm['ankle']
    mid=lambda a,b,t:a+(b-a)*t
    bulge((.085,1.365,.095),.085,.020)              # pectorals
    bulge(S,.075,.022)                              # deltoids
    bulge(mid(S,E,.5)+np.array([0,0,.02]),.055,.018)   # biceps
    bulge(mid(S,E,.55)-np.array([0,0,.03]),.055,.015)  # triceps
    bulge(mid(E,W,.28),.05,.014)                    # forearm flexors
    bulge((.135,1.245,-.045),.095,.018)             # lats
    bulge((.065,1.505,-.035),.065,.022)             # traps
    bulge((.0,1.54,-.01),.05,.008,False)            # neck
    bulge(mid(hip,knee,.45)+np.array([0,0,.03]),.095,.022)  # quads
    bulge(mid(hip,knee,.5)-np.array([0,0,.05]),.09,.014)    # hamstrings
    bulge((.085,.86,-.085),.09,.014)                # glutes
    bulge(mid(knee,ank,.3)-np.array([0,0,.03]),.06,.016)    # calves
    bulge((.05,1.17,.10),.07,.006)                  # abs
    return D
def laplace(P,T,it,fix=None):
    first,inv=posweld(P);Q=P[first].copy();e=np.r_[np.c_[inv[T[:,0]],inv[T[:,1]]],np.c_[inv[T[:,1]],inv[T[:,2]]],np.c_[inv[T[:,2]],inv[T[:,0]]]];n=len(Q)
    for _ in range(it):
        s=np.zeros_like(Q);c=np.zeros(n);np.add.at(s,e[:,0],Q[e[:,1]]);np.add.at(c,e[:,0],1);np.add.at(s,e[:,1],Q[e[:,0]]);np.add.at(c,e[:,1],1)
        Q=Q*.45+.55*s/np.maximum(c,1)[:,None]
    return Q[inv]
def mix_skin(SIa,SWa,SIb,SWb,t):
    d={}
    for i,w in zip(SIa,SWa):
        if w>0: d[int(i)]=d.get(int(i),0)+float(w)*(1-t)
    for i,w in zip(SIb,SWb):
        if w>0: d[int(i)]=d.get(int(i),0)+float(w)*t
    it=sorted(d.items(),key=lambda x:-x[1])[:4];tot=sum(w for _,w in it) or 1
    return [x[0] for x in it]+[0]*(4-len(it)),[x[1]/tot for x in it]+[0.]*(4-len(it))
def clip_plane(V,T,y,keep_above):
    """Sutherland-Hodgman against a horizontal plane, sharing new vertices along shared edges.
    V is a dict of parallel arrays: P, N, SI, SW, D."""
    P=[x for x in V['P']];N=[x for x in V['N']];SI=[x for x in V['SI']];SW=[x for x in V['SW']];D=[x for x in V['D']];cache={};out=[]
    inside=(lambda p:p[1]>=y) if keep_above else (lambda p:p[1]<=y)
    def cut(a,b):
        k=(min(a,b),max(a,b))
        if k in cache: return cache[k]
        t=(y-P[a][1])/(P[b][1]-P[a][1]);P.append(P[a]+(P[b]-P[a])*t);n=N[a]+(N[b]-N[a])*t;N.append(n/max(np.linalg.norm(n),1e-9));D.append(D[a]+(D[b]-D[a])*t)
        si,sw=mix_skin(SI[a],SW[a],SI[b],SW[b],t);SI.append(np.array(si));SW.append(np.array(sw));cache[k]=len(P)-1;return cache[k]
    for tri in T:
        poly=[];n=3
        for i in range(n):
            a,b=int(tri[i]),int(tri[(i+1)%n]);ia,ib=inside(P[a]),inside(P[b])
            if ia: poly.append(a)
            if ia!=ib: poly.append(cut(a,b))
        for i in range(1,len(poly)-1): out.append([poly[0],poly[i],poly[i+1]])
    return dict(P=np.array(P),N=np.array(N),SI=np.array(SI),SW=np.array(SW),D=np.array(D)),np.array(out,int)
def make_shell(Pw,Nm,SI,SW,Dm,T,ylo,yhi,xmax,offset,uvfn,smooth=0,hem=None):
    """Clothing as a shell off the body, cut to level edges, carrying the body's skin weights and muscle morph."""
    first,inv=posweld(Pw);Tw=inv[T]
    keep=(np.abs(Pw[first][Tw][:,:,0])<xmax).all(1)&(Pw[first][Tw][:,:,1].min(1)<yhi)&(Pw[first][Tw][:,:,1].max(1)>ylo);Tw=Tw[keep]
    ids=np.unique(Tw);mp=-np.ones(len(first),int);mp[ids]=np.arange(len(ids));Tw=mp[Tw];src=first[ids]
    V=dict(P=Pw[src].copy(),N=Nm[src].copy(),SI=SI[src].copy(),SW=SW[src].copy(),D=Dm[src].copy())
    V,Tw=clip_plane(V,Tw,yhi,False)
    if ylo>-1e5: V,Tw=clip_plane(V,Tw,ylo,True)
    ids=np.unique(Tw);mp=-np.ones(len(V['P']),int);mp[ids]=np.arange(len(ids));Tw=mp[Tw];V={k:v[ids] for k,v in V.items()}
    # identical cut points from duplicate seam edges must fuse, or the boundary reads as open everywhere
    f2,i2=posweld(V['P'],2e-4);V={k:v[f2] for k,v in V.items()};Tw=i2[Tw];Tw=Tw[(Tw[:,0]!=Tw[:,1])&(Tw[:,1]!=Tw[:,2])&(Tw[:,2]!=Tw[:,0])]
    P2=V['P']+V['N']*offset(V['P'])[:,None];N=V['N'];SIo=V['SI'];SWo=V['SW'];Do=V['D']
    e=np.sort(np.r_[Tw[:,[0,1]],Tw[:,[1,2]],Tw[:,[2,0]]],axis=1);u,c=np.unique(e,axis=0,return_counts=True);bd=u[c==1];pinned=np.unique(bd)
    if smooth:
        Q=P2.copy();ed=u;n=len(Q)
        for _ in range(smooth):
            s_=np.zeros_like(Q);cn=np.zeros(n);np.add.at(s_,ed[:,0],Q[ed[:,1]]);np.add.at(cn,ed[:,0],1);np.add.at(s_,ed[:,1],Q[ed[:,0]]);np.add.at(cn,ed[:,1],1)
            R=Q*.5+.5*s_/np.maximum(cn,1)[:,None];R[pinned,1]=P2[pinned,1];Q=R
        P2=Q
    if hem:
        low=bd[P2[bd].mean(1)[:,1]<ylo+.02];ring=np.unique(low);nid=-np.ones(len(P2),int);nid[ring]=np.arange(len(ring))+len(P2)
        outward=N[ring]*np.array([1,0,1]);P3=P2[ring]+np.array([0,-hem['drop'],0])+outward*hem['flare'];add=[]
        for a_,b_ in low: add+=[[a_,b_,nid[b_]],[a_,nid[b_],nid[a_]]]
        P2=np.r_[P2,P3];N=np.r_[N,N[ring]];SIo=np.r_[SIo,SIo[ring]];SWo=np.r_[SWo,SWo[ring]];Do=np.r_[Do,Do[ring]];Tw=np.r_[Tw,np.array(add,int)]
    UV=uvfn(P2);bad=(UV[Tw,0].max(1)-UV[Tw,0].min(1))>.5
    if bad.any():
        extra={};new=[]
        for t in Tw[bad]:
            o=[]
            for v in t:
                v=int(v)
                if UV[v,0]<.5:
                    if v not in extra: extra[v]=len(P2)+len(extra)
                    o.append(extra[v])
                else:o.append(v)
            new.append(o)
        Tw=Tw.copy();Tw[bad]=np.array(new,int);ex=np.array(list(extra.keys()),int)
        UV=np.r_[UV,UV[ex]+np.array([1,0])];P2=np.r_[P2,P2[ex]];N=np.r_[N,N[ex]];SIo=np.r_[SIo,SIo[ex]];SWo=np.r_[SWo,SWo[ex]];Do=np.r_[Do,Do[ex]]
    return dict(P=P2,N=smooth_normals(P2,Tw),UV=UV,SI=SIo,SW=SWo,T=Tw,D=Do)
def main():
    a=argparse.ArgumentParser();a.add_argument('dump');a.add_argument('out');a.add_argument('--morphs',default='none');a.add_argument('--simplify',type=float,default=0);a.add_argument('--gear',action='store_true');a=a.parse_args()
    h,arr=load(a.dump);M=[m for m in h['meshes'] if m['skinned']][0];n=M['count']
    P=arr(M['position'],np.float32).reshape(-1,3)*.01;N=arr(M['normal'],np.float32).reshape(-1,3);UV=arr(M['uv'],np.float32).reshape(-1,2)
    SI=arr(M['skinIndex'],np.uint16).reshape(-1,4).astype(np.int32);SW=arr(M['skinWeight'],np.float32).reshape(-1,4)
    B=h['bones'];names=[b['name'] for b in B];par=[b['parent'] for b in B]
    # which bones survive
    keep=[]
    for i,nm in enumerate(names):
        k=nm=="Bip01" or nm in("Bip01_Pelvis","Bip01_Spine","Bip01_Spine1","Bip01_Spine2","Bip01_Neck","Bip01_Head","Bip01_LEye","Bip01_REye") or nm.startswith(("Bip01_L_","Bip01_R_"))
        keep.append(k)
    remap=np.arange(len(B))
    for i in range(len(B)):
        j=i
        while not keep[j]: j=par[j]
        remap[i]=j
    newix={i:k for k,i in enumerate(i for i in range(len(B)) if keep[i])}
    rem=np.array([newix[remap[i]] for i in range(len(B))])
    print('bones',len(B),'->',len(newix))
    # weld
    key=np.round(np.c_[P*1e4,N*1e3,UV*1e4]).astype(np.int64);_,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.ravel()
    print('verts',n,'->',len(first))
    # triangles by material group
    tris={}
    for g in M['groups']:
        idx=np.arange(g['start'],g['start']+g['count']);tris.setdefault(g['mat'],[]).append(inv[idx])
    if not M['groups']: tris[M['mats'][0]]=[inv]
    # skin weights into the reduced skeleton, merged
    SI2=rem[SI[first]];SW2=SW[first].copy();V=len(first)
    for v in range(V):
        d={}
        for i,w in zip(SI2[v],SW2[v]):
            if w>0: d[i]=d.get(i,0)+float(w)
        it=sorted(d.items(),key=lambda x:-x[1])[:4];t=sum(w for _,w in it) or 1
        SI2[v]=[x[0] for x in it]+[0]*(4-len(it));SW2[v]=[x[1]/t for x in it]+[0.]*(4-len(it))
    Pw,Nw,UVw=P[first],N[first],UV[first];UVw=UVw.copy();UVw[:,1]=1-UVw[:,1]
    g=GLB();order=[i for i in range(len(B)) if keep[i]];nodes=[]
    # local from world: the skin omits the Bip01 root, so a bone's own "local" can be relative to a node not exported
    WM={i:mat4(B[i]['world']) for i in order}
    for i in order:
        b=B[i];p=par[i];Lm=WM[i] if not(p>=0 and keep[p]) else np.linalg.inv(WM[p])@WM[i];R=Lm[:3,:3];sc=np.linalg.norm(R,axis=0);q=m2q(R/np.maximum(sc,1e-9));t=Lm[:3,3]*.01
        nd={"name":b['name'],"translation":[float(x) for x in t],"rotation":[float(x) for x in q],"children":[]}
        g.nodes.append(nd)
    for k,i in enumerate(order):
        p=par[i]
        if p>=0 and keep[p]: g.nodes[newix[p]]["children"].append(k)
    for nd in g.nodes:
        if not nd["children"]: del nd["children"]
    roots=[newix[i] for i in order if not(par[i]>=0 and keep[par[i]])]
    # bind from the skeleton's inverse matrices, in metres
    IBM=np.zeros((len(order),16),np.float32)
    for k,i in enumerate(order):
        m=mat4(B[i]['inverse']).copy();m[:3,3]*=.01;IBM[k]=m.T.ravel()
    ibm=g.accessor(IBM,"MAT4",5126)
    g.skins.append({"joints":list(range(len(order))),"inverseBindMatrices":ibm,"skeleton":roots[0]})
    T_all={k:np.concatenate(v).reshape(-1,3) for k,v in tris.items()};bodyk=[k for k in T_all if 'body' in k][0];T_body=T_all[bodyk]
    Pall=Pw.astype(np.float64);Nm=smooth_normals(Pall,np.concatenate(list(T_all.values())))
    ix={b['name']:newix[i] for i,b in enumerate(B) if keep[i]}
    Wp=lambda n:mat4(B[names.index(n)]['world'])[:3,3]*.01
    lm=dict(shoulder=Wp('Bip01_L_UpperArm'),elbow=Wp('Bip01_L_Forearm'),wrist=Wp('Bip01_L_Hand'),hip=Wp('Bip01_L_Thigh'),knee=Wp('Bip01_L_Calf'),ankle=Wp('Bip01_L_Foot'))
    muscle=anatomy_delta(Pall,Nm,lm) if a.gear else None
    extra=[]
    if a.gear:
        waist,hemy=1.045,.615
        def toff(Q):
            t=np.clip((waist-Q[:,1])/(waist-hemy),0,1);return .013+.036*t*t
        def tuv(Q):
            ang=np.arctan2(Q[:,0],Q[:,2])/(2*np.pi)+.5;return np.c_[ang,np.clip((Q[:,1]-(hemy-.05))/(waist-(hemy-.05)),0,1)]
        tr=make_shell(Pall,Nm,SI2,SW2,muscle,T_body,hemy,waist,.31,toff,tuv,smooth=2,hem=dict(drop=.035,flare=.018))
        extra.append(('trunks',tr))
        bootTop=.262
        def buv(Q):
            cx=np.where(Q[:,0]>0,lm['ankle'][0],-lm['ankle'][0]);ang=np.arctan2(Q[:,0]-cx,Q[:,2]-.02)/(2*np.pi)+.5;return np.c_[ang,np.clip(Q[:,1]/bootTop,0,1)]
        bo=make_shell(Pall,Nm,SI2,SW2,muscle,T_body,-1e6,bootTop,.31,lambda Q:np.full(len(Q),.0075),buv,smooth=6)
        extra.append(('boots',bo))
        # what the gear covers, the body no longer needs to draw; it would only poke through
        cov=((Pall[:,1]<waist-.02)&(Pall[:,1]>hemy-.01)&(np.abs(Pall[:,0])<.31))|((Pall[:,1]<bootTop-.02)&(np.abs(Pall[:,0])<.31))
        keeptri=~cov[T_body].all(1);print('body tris',len(T_body),'->',int(keeptri.sum()));tris[bodyk]=[T_body[keeptri].ravel()]
    # shared attributes
    pa=g.accessor(Pw.astype(np.float32),"VEC3",5126,34962,True);na=g.accessor(Nw.astype(np.float32),"VEC3",5126,34962);ua=g.accessor(UVw.astype(np.float32),"VEC2",5126,34962)
    ja=g.accessor(SI2.astype(np.uint16),"VEC4",5123,34962);wa=g.accessor(SW2.astype(np.float32),"VEC4",5126,34962)
    # morphs
    want=FIGHTER_MORPHS if a.morphs=='fighter' else {}
    targets={}
    if want and M.get('morphs'):
        for mo in M['morphs']:
            base=mo['name'].split('.')[-1]
            if base in want:
                D=arr(mo['delta'],np.float32).reshape(-1,3)[first]*.01;targets[want[base]]=D
        print('morphs',len(targets))
    meshnodes=[]
    for matname,parts in tris.items():
        idx=np.concatenate(parts).astype(np.uint32 if V>65535 else np.uint16);ia=g.accessor(idx,"SCALAR",5125 if V>65535 else 5123,34963)
        prim={"attributes":{"POSITION":pa,"NORMAL":na,"TEXCOORD_0":ua,"JOINTS_0":ja,"WEIGHTS_0":wa},"indices":ia,"material":g.material(matname),"mode":4}
        ex={}
        if targets and 'head' in matname:
            used=np.unique(idx);names_=[];tt=[]
            for nm,D in targets.items():
                # a target only matters here if it moves a vertex this primitive uses
                if np.abs(D[used]).max()>1e-5:
                    d2=np.zeros_like(D);d2[used]=D[used];tt.append({"POSITION":g.sparse(d2)});names_.append(nm)
            if a.gear: tt.append({"POSITION":g.sparse(muscle.astype(np.float32))});names_.append('muscle')
            if tt: prim["targets"]=tt;ex={"targetNames":names_}
        if a.gear and 'body' in matname:
            prim["targets"]=[{"POSITION":g.sparse(muscle.astype(np.float32))}];ex={"targetNames":["muscle"]}
        me={"name":matname,"primitives":[prim]}
        if ex: me["extras"]=ex;me["weights"]=[0.0]*len(ex["targetNames"])
        g.meshes.append(me);g.nodes.append({"name":matname,"mesh":len(g.meshes)-1,"skin":0});meshnodes.append(len(g.nodes)-1)
    for nm,x in extra:
        pa2=g.accessor(x['P'].astype(np.float32),"VEC3",5126,34962,True);na2=g.accessor(x['N'].astype(np.float32),"VEC3",5126,34962);ua2=g.accessor(x['UV'].astype(np.float32),"VEC2",5126,34962)
        ja2=g.accessor(x['SI'].astype(np.uint16),"VEC4",5123,34962);wa2=g.accessor(x['SW'].astype(np.float32),"VEC4",5126,34962);ia2=g.accessor(x['T'].ravel().astype(np.uint16),"SCALAR",5123,34963)
        d=x['D'].astype(np.float32);prim={"attributes":{"POSITION":pa2,"NORMAL":na2,"TEXCOORD_0":ua2,"JOINTS_0":ja2,"WEIGHTS_0":wa2},"indices":ia2,"material":g.material(nm),"mode":4,"targets":[{"POSITION":g.sparse(d)}]}
        g.meshes.append({"name":nm,"primitives":[prim],"extras":{"targetNames":["muscle"]},"weights":[0.0]});g.nodes.append({"name":nm,"mesh":len(g.meshes)-1,"skin":0});meshnodes.append(len(g.nodes)-1)
        print(nm,'verts',len(x['P']),'tris',len(x['T']))
    g.write(a.out,roots+meshnodes,{"source":os.path.basename(a.dump)})
    print('wrote',a.out,os.path.getsize(a.out))
main()
