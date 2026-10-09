// Shared canvas state and pixel helpers. Scenes draw through these.
import { TUNING } from "../game/tuning.js";

export let g, og, state;
export const T=TUNING.tile;
export const reduced=typeof matchMedia!=="undefined"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
export function bind(base,over){ g=base.getContext("2d"); og=over.getContext("2d"); }
export function setState(s){ state=s; }
export const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
export const qx=(x,y,w,h,c)=>{og.fillStyle=c;og.fillRect(x,y,w,h)};
export function fadeIn(id,t){ const lf=state.lastFound; if(!lf||lf.id!==id||reduced) return 1; return Math.min(1,(Date.now()-lf.at)/1800); }
export const lookAt=(from,to)=>[to.x>from.x?1:0,to.y<from.y?0:1];
// A brief, rare flash. Never under reduced motion.
export const glimpse=(t,every,len)=>!reduced&&t>every&&(t%every)<len;

export function sprite(ctx,x,y,c,alpha=1){
  const ox=x*T, oy=y*T, f=(a,b,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(ox+a,oy+b,w,h)};
  ctx.globalAlpha=alpha;
  f(4,15,8,1,"#00000033"); f(5,1,6,3,c.hair); f(5,4,6,4,c.face);
  if(c.eyes){ const [ex,ey]=c.eyes; f(5,5,2,2,"#f4f0e6"); f(9,5,2,2,"#f4f0e6"); f(5+ex,5+ey,1,1,"#111"); f(9+ex,5+ey,1,1,"#111"); }
  else { f(6,5,1,1,"#2a2a2a"); f(9,5,1,1,"#2a2a2a"); }
  f(4,8,8,6,c.coat); if(c.apron) f(5,9,6,5,c.apron); if(c.shawl){ f(3,8,10,3,c.shawl); }
  f(5,14,2,2,"#2a2420"); f(9,14,2,2,"#2a2420");
  if(c.smile){ f(6,7,4,1,"#5a1a1a"); f(5,6,1,1,"#5a1a1a"); f(10,6,1,1,"#5a1a1a"); }
  if(c.quill){ f(12,6,1,5,"#e8e2d0"); f(12,11,1,1,"#1d2b4a"); }
  if(c.tray){ f(1,7,6,2,"#8a6a3a"); f(2,6,4,1,"#d2a35a"); }
  ctx.globalAlpha=1;
}

export function halo(x,y,pulse){ qx(x*T-1,y*T+5,18,9,`rgba(255,120,90,${pulse*0.6})`); qx(x*T+1,y*T+6,14,7,`rgba(255,120,90,${pulse})`); }

