"""CMU BVH (MotionBuilder-friendly release) -> Rocketbox Biped local rotations.

Rotations transfer in world space through a common T-pose: the source's rotation away from its T-pose
is applied to the target's own T-pose. Rocketbox binds in an A-pose, so the target's T-pose is derived by
swinging each bone until it points the way the source's bone points in frame 0, the T-pose that the
BVH release adds to every file. No axis conventions are assumed anywhere, only measured bone directions.
"""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
import numpy as np,bvh
from glb import m2q
MAP={'Hips':'Bip01_Pelvis','LowerBack':'Bip01_Spine','Spine':'Bip01_Spine1','Spine1':'Bip01_Spine2','Neck1':'Bip01_Neck','Head':'Bip01_Head',
 'LeftShoulder':'Bip01_L_Clavicle','LeftArm':'Bip01_L_UpperArm','LeftForeArm':'Bip01_L_Forearm','LeftHand':'Bip01_L_Hand',
 'RightShoulder':'Bip01_R_Clavicle','RightArm':'Bip01_R_UpperArm','RightForeArm':'Bip01_R_Forearm','RightHand':'Bip01_R_Hand',
 'LeftUpLeg':'Bip01_L_Thigh','LeftLeg':'Bip01_L_Calf','LeftFoot':'Bip01_L_Foot','LeftToeBase':'Bip01_L_Toe0',
 'RightUpLeg':'Bip01_R_Thigh','RightLeg':'Bip01_R_Calf','RightFoot':'Bip01_R_Foot','RightToeBase':'Bip01_R_Toe0'}
# which child defines each bone's direction, on both skeletons
DIR={'Hips':('LowerBack','Bip01_Spine'),'LowerBack':('Spine','Bip01_Spine1'),'Spine':('Spine1','Bip01_Spine2'),'Spine1':('Neck','Bip01_Neck'),'Neck1':('Head','Bip01_Head'),
 'LeftShoulder':('LeftArm','Bip01_L_UpperArm'),'LeftArm':('LeftForeArm','Bip01_L_Forearm'),'LeftForeArm':('LeftHand','Bip01_L_Hand'),'LeftHand':('LeftFingerBase','Bip01_L_Finger2'),
 'RightShoulder':('RightArm','Bip01_R_UpperArm'),'RightArm':('RightForeArm','Bip01_R_Forearm'),'RightForeArm':('RightHand','Bip01_R_Hand'),'RightHand':('RightFingerBase','Bip01_R_Finger2'),
 'LeftUpLeg':('LeftLeg','Bip01_L_Calf'),'LeftLeg':('LeftFoot','Bip01_L_Foot'),'LeftFoot':('LeftToeBase','Bip01_L_Toe0'),
 'RightUpLeg':('RightLeg','Bip01_R_Calf'),'RightLeg':('RightFoot','Bip01_R_Foot'),'RightFoot':('RightToeBase','Bip01_R_Toe0')}
def arc(a,b):
    # some BVH joints sit exactly on their parent (Hips and LowerBack), so they have no direction to match
    if np.linalg.norm(a)<1e-6 or np.linalg.norm(b)<1e-6: return np.eye(3)
    a=a/np.linalg.norm(a);b=b/np.linalg.norm(b);v=np.cross(a,b);c=float(a@b);K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]])
    return np.eye(3)+K+K@K*(1/(1+c)) if c>-.9999 else -np.eye(3)
class Target:
    def __init__(s,dump):
        h=json.load(open(dump+'.json'));B=h['bones'];keep=lambda n:n=="Bip01" or n in("Bip01_Pelvis","Bip01_Spine","Bip01_Spine1","Bip01_Spine2","Bip01_Neck","Bip01_Head","Bip01_LEye","Bip01_REye") or n.startswith(("Bip01_L_","Bip01_R_"))
        order=[i for i,b in enumerate(B) if keep(b['name'])];ix={i:k for k,i in enumerate(order)}
        s.names=[B[i]['name'] for i in order];s.par=[ix[B[i]['parent']] if B[i]['parent'] in ix else -1 for i in order];s.ix={n:i for i,n in enumerate(s.names)}
        # world matrices are the only trustworthy thing in the dump: the skin omits the Bip01 root, so a
        # bone's "local" can be relative to a node that is not in the skeleton
        W=[np.array(B[i]['world']).reshape(4,4).T for i in order]
        s.Wrest=np.array([w[:3,:3]/np.linalg.norm(w[:3,:3],axis=0) for w in W]);s.Prest=np.array([w[:3,3]*.01 for w in W])
        s.Lrest=np.array([s.Wrest[k] if p<0 else s.Wrest[p].T@s.Wrest[k] for k,p in enumerate(s.par)])
        s.Ltrans=np.array([s.Prest[k] if p<0 else s.Wrest[p].T@(s.Prest[k]-s.Prest[p]) for k,p in enumerate(s.par)])
        # FBX cluster order is not parent-first
        depth=[0]*len(order)
        for k in range(len(order)):
            j=k
            while s.par[j]>=0: j=s.par[j];depth[k]+=1
        s.topo=sorted(range(len(order)),key=lambda k:depth[k])
def retarget(src,tg):
    N=src.names;ix={n:i for i,n in enumerate(N)};S0=src.P[0];WS0=src.R[0]
    WT0={}
    for s_,t_ in MAP.items():
        A=np.eye(3)
        if s_ in DIR:
            sc,tc=DIR[s_];A=arc(tg.Prest[tg.ix[tc]]-tg.Prest[tg.ix[t_]],S0[ix[sc]]-S0[ix[s_]])
        WT0[t_]=A@tg.Wrest[tg.ix[t_]]
    F=src.n;nb=len(tg.names);W=np.zeros((F,nb,3,3));L=np.zeros((F,nb,3,3));rev={v:k for k,v in MAP.items()}
    for b in tg.topo:
        name=tg.names[b];p=tg.par[b]
        if name in rev:
            s_=ix[rev[name]];W[:,b]=src.R[:,s_]@WS0[s_].T@WT0[name]
            L[:,b]=(np.transpose(W[:,p],(0,2,1))@W[:,b]) if p>=0 else W[:,b]
        else:
            L[:,b]=tg.Lrest[b];W[:,b]=(W[:,p]@tg.Lrest[b]) if p>=0 else tg.Lrest[b]
    foot=min(S0[ix['LeftToeBase']][1],S0[ix['RightToeBase']][1]);scale=(tg.Prest[tg.ix['Bip01_Pelvis']][1])/(S0[ix['Hips']][1]-foot)
    root=(src.P[:,ix['Hips']]-np.array([0,foot,0]))*scale
    return L,W,root,scale
def fk(tg,L,root):
    """world positions per frame, for measuring what the retarget did"""
    F=len(L);nb=len(tg.names);W=np.zeros((F,nb,3,3));Pn=np.zeros((F,nb,3))
    for b in tg.topo:
        p=tg.par[b]
        if p<0: W[:,b]=L[:,b];Pn[:,b]=root
        else:
            W[:,b]=W[:,p]@L[:,b];Pn[:,b]=Pn[:,p]+(W[:,p]@tg.Ltrans[b][...,None])[...,0]
    return W,Pn
