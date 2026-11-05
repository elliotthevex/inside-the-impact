import numpy as np,re
class BVH: pass
ORD={'X':0,'Y':1,'Z':2}
def rot(axis,a):
    c,s=np.cos(a),np.sin(a);M=np.zeros(a.shape+(3,3));M[...,0,0]=M[...,1,1]=M[...,2,2]=1
    i={'X':(1,2),'Y':(2,0),'Z':(0,1)}[axis];p,q=i
    M[...,p,p]=c;M[...,q,q]=c;M[...,p,q]=-s;M[...,q,p]=s
    return M
def load(path):
    b=BVH();names=[];par=[];off=[];chs=[];st=[];T=open(path).read().split('\n');i=0
    while not T[i].strip().startswith('MOTION'):
        t=T[i].split()
        if not t: i+=1;continue
        if t[0] in('ROOT','JOINT'):
            names.append(t[1]);par.append(st[-1] if st else -1);st.append(len(names)-1)
        elif t[0]=='End':
            st.append(-2)
        elif t[0]=='}': st.pop()
        elif t[0]=='OFFSET' and st and st[-1]>=0:
            if len(off)<len(names): off.append([float(x) for x in t[1:4]])
        elif t[0]=='CHANNELS': chs.append(t[2:])
        i+=1
    n=int(T[i+1].split()[1]);dt=float(T[i+2].split()[2]);M=np.array([[float(x) for x in l.split()] for l in T[i+3:i+3+n] if l.strip()])
    b.names=names;b.par=np.array(par);b.off=np.array(off);b.chs=chs;b.dt=dt;b.M=M;b.n=len(M)
    j=0;R=np.zeros((b.n,len(names),3,3));P=np.zeros((b.n,len(names),3))
    for k,c in enumerate(chs):
        L=np.tile(np.eye(3),(b.n,1,1));t=np.tile(b.off[k],(b.n,1))
        for q in c:
            v=M[:,j];j+=1
            if q.endswith('rotation'): L=L@rot(q[0],np.radians(v))
            else: t[:,ORD[q[0]]]=(v if par[k]<0 else t[:,ORD[q[0]]]+v)
        if par[k]<0:
            R[:,k]=L;P[:,k]=t
        else:
            R[:,k]=R[:,par[k]]@L;P[:,k]=P[:,par[k]]+(R[:,par[k]]@t[...,None])[...,0]
    b.R=R;b.P=P;return b
