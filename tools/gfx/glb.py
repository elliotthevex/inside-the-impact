"""Minimal glTF 2.0 binary writer: skinned meshes with sparse morph targets, nothing else.
Textures stay external so the engine can pick a resolution per quality preset."""
import json,struct
import numpy as np
class GLB:
    def __init__(s): s.bin=bytearray();s.views=[];s.acc=[];s.nodes=[];s.meshes=[];s.skins=[];s.mats=[];s.matix={}
    def _view(s,b,target=None):
        while len(s.bin)%4: s.bin.append(0)
        v={"buffer":0,"byteOffset":len(s.bin),"byteLength":len(b)}
        if target: v["target"]=target
        s.bin+=b;s.views.append(v);return len(s.views)-1
    def accessor(s,a,kind,ctype,target=None,minmax=False):
        v=s._view(a.tobytes(),target);d={"bufferView":v,"componentType":ctype,"count":len(a),"type":kind}
        if minmax: d["min"]=[float(x) for x in a.min(0)];d["max"]=[float(x) for x in a.max(0)]
        s.acc.append(d);return len(s.acc)-1
    def sparse(s,delta):
        """Morph delta as a sparse accessor: most targets move a few hundred verts."""
        n=len(delta);mask=np.abs(delta).max(1)>1e-5;idx=np.nonzero(mask)[0].astype(np.uint32);vals=delta[mask].astype(np.float32)
        if len(idx)==0: idx=np.array([0],np.uint32);vals=np.zeros((1,3),np.float32)
        iv=s._view((idx.astype(np.uint16) if n<65535 else idx).tobytes());vv=s._view(vals.tobytes())
        d={"componentType":5126,"count":n,"type":"VEC3","sparse":{"count":int(len(idx)),"indices":{"bufferView":iv,"componentType":5123 if n<65535 else 5125},"values":{"bufferView":vv}},"min":[float(x) for x in vals.min(0)],"max":[float(x) for x in vals.max(0)]}
        s.acc.append(d);return len(s.acc)-1
    def material(s,name):
        if name not in s.matix: s.mats.append({"name":name,"pbrMetallicRoughness":{"metallicFactor":0,"roughnessFactor":.6}});s.matix[name]=len(s.mats)-1
        return s.matix[name]
    def write(s,path,scene_nodes,extras=None):
        g={"asset":{"version":"2.0","generator":"inside-the-impact tools/gfx"},"scene":0,"scenes":[{"nodes":scene_nodes}],"nodes":s.nodes,"meshes":s.meshes,"accessors":s.acc,"bufferViews":s.views,"buffers":[{"byteLength":0}]}
        if s.skins: g["skins"]=s.skins
        if s.mats: g["materials"]=s.mats
        if extras: g["extras"]=extras
        while len(s.bin)%4: s.bin.append(0)
        g["buffers"][0]["byteLength"]=len(s.bin);j=json.dumps(g,separators=(',',':')).encode()
        while len(j)%4: j+=b' '
        with open(path,'wb') as f:
            f.write(struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(s.bin)));f.write(struct.pack('<I4s',len(j),b'JSON'));f.write(j);f.write(struct.pack('<I4s',len(s.bin),b'BIN\0'));f.write(bytes(s.bin))
def m2q(M):
    """rotation matrices (...,3,3) to quaternions (...,4) xyzw, sign-continuous only per call"""
    M=np.asarray(M);q=np.zeros(M.shape[:-2]+(4,));t=M[...,0,0]+M[...,1,1]+M[...,2,2]
    c0=t>0;s=np.sqrt(np.maximum(t+1,1e-12))*2;q[...,3]=np.where(c0,.25*s,0);q[...,0]=np.where(c0,(M[...,2,1]-M[...,1,2])/s,0);q[...,1]=np.where(c0,(M[...,0,2]-M[...,2,0])/s,0);q[...,2]=np.where(c0,(M[...,1,0]-M[...,0,1])/s,0)
    for i,j,k in((0,1,2),(1,2,0),(2,0,1)):
        c=(~c0)&(M[...,i,i]>=M[...,j,j])&(M[...,i,i]>=M[...,k,k])
        s=np.sqrt(np.maximum(1+M[...,i,i]-M[...,j,j]-M[...,k,k],1e-12))*2
        q[...,i]=np.where(c,.25*s,q[...,i]);q[...,j]=np.where(c,(M[...,j,i]+M[...,i,j])/s,q[...,j]);q[...,k]=np.where(c,(M[...,k,i]+M[...,i,k])/s,q[...,k]);q[...,3]=np.where(c,(M[...,k,j]-M[...,j,k])/s,q[...,3])
    return q/np.linalg.norm(q,axis=-1,keepdims=True)
