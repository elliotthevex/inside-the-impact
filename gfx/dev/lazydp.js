// lower bound: least mean orbit for a camera with perfect foresight, within Wmax always and within 45 deg for a given share of frames
(async()=>{
while(!window.READY)await new Promise(r=>setTimeout(r,50));
const {createMatch,setReach}=await import('/site/gfx/arena/sim.js');
const {createAI,createBot}=await import('/site/gfx/arena/ai.js');
const SPECS=[['skilled'],['skilled'],['mixed'],['turtle'],['spam','hook'],['spam','cross'],['idle'],['learner'],['runner'],['guardjab']];
setReach(await (await fetch('/site/gfx/arena/reach.json')).json());
const series=[];
const n=window.__N||20,seed0=window.__S||500;
for(let i=0;i<n;i++){
  const sp=SPECS[i%SPECS.length],seed=seed0+i*97;
  const m=createMatch({seed,names:{p:'P',o:'O'},ringHalf:2.9,corners:{blue:[-2.5,-2.5],red:[2.5,2.5]}});
  const ai=createAI({difficulty:'normal',seed:seed+1}),bot=createBot(sp[0],{seed:seed+2,kind:sp[1]||'jab'});
  const dt=1/60;let t=0,last=null,un=0;const th=[];let was=null;
  while(m.state!=='over'&&t<400){
    m.step(dt,bot.decide(m,m.p,m.o,dt),ai.decide(m,m.o,m.p,dt));m.events.length=0;t+=dt;
    if(m.state==='fight'){const l=Math.atan2(m.o.z-m.p.z,m.o.x-m.p.x);if(last!=null){let d=l-last;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;un+=d;}last=l;th.push(un*57.2958);}
  }
  series.push({spec:sp.join(':'),th});
}
function dp(th,W,lam,step=6,grid=1){ // th deg at 60 Hz, decimate by step
  const dt=step/60;let lo=1e9,hi=-1e9;for(const a of th){if(a<lo)lo=a;if(a>hi)hi=a;}
  const base=Math.floor((lo-W-2)/grid),N=Math.ceil((hi+W+2)/grid)-base+1;
  let V=new Float64Array(N).fill(Infinity),C=new Float64Array(N);
  const a0=th[0];for(let k=0;k<N;k++){const x=(k+base)*grid;if(Math.abs(x-a0)<=W){V[k]=0;}}
  let bl=0,bh=N-1;let frames=0;
  for(let j=step;j<th.length;j+=step){
    const a=th[j];frames++;
    const l=Math.max(0,Math.floor((a-W)/grid)-base),h=Math.min(N-1,Math.ceil((a+W)/grid)-base);
    // keep only reachable ranges: sweep in union
    const u0=Math.max(0,Math.min(l,Math.floor((th[j-step]-W)/grid)-base)),u1=Math.min(N-1,Math.max(h,Math.ceil((th[j-step]+W)/grid)-base));
    for(let k=u0+1;k<=u1;k++){const v=V[k-1]+grid;if(v<V[k]){V[k]=v;C[k]=C[k-1];}}
    for(let k=u1-1;k>=u0;k--){const v=V[k+1]+grid;if(v<V[k]){V[k]=v;C[k]=C[k+1];}}
    for(let k=u0;k<=u1;k++){const e=Math.abs((k+base)*grid-a);if(e>W){V[k]=Infinity;}else if(e>45){V[k]+=lam*dt;C[k]+=dt;}}
  }
  let best=Infinity,bc=0;for(let k=0;k<N;k++)if(V[k]<best){best=V[k];bc=C[k];}
  // best includes lam*C
  return {tv:best-lam*bc,out:bc,secs:frames*dt};
}
const out=[];
for(const W of [60,75,85]) for(const lam of [0,3,6,10,15,20,30,50,100,400]){
  let tv=0,o=0,s=0;const per={};
  for(const q of series){if(q.th.length<30)continue;const r=dp(q.th,W,lam);tv+=r.tv;o+=r.out;s+=r.secs;const P=per[q.spec]??={tv:0,s:0};P.tv+=r.tv;P.s+=r.secs;}
  out.push(`W${W} lam${lam}: mean ${(tv/s).toFixed(1)} within45 ${(100-100*o/s).toFixed(1)}%`+(lam==6&&W==85?' '+Object.entries(per).map(([k,v])=>k+' '+(v.tv/v.s).toFixed(0)).join(' '):''));
}
const secs=series.map(q=>q.spec+':'+(q.th.length/60|0)).join(' ');
return JSON.stringify({secs,out});
})()
