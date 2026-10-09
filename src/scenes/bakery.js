// The bakery: too warm.
import { SPOT, CHAPEL, BAKERY, PICKUPS } from "../game/content.js";
import { has, pickupAvailable, shadeVisible, chandlerVisible, bakerInside, owns } from "../game/rules.js";
import { g, og, state, T, reduced, px, qx, fadeIn, lookAt, glimpse, sprite, halo } from "./paint.js";

export function drawBakery(t){
  const s=state, done=s.bakeryWon;
  px(0,0,192,128,"#3a2a1e");
  // back wall, beams, ovens
  px(16,0,160,48,"#8a6a48"); px(16,8,160,3,"#5a3b26"); px(16,40,160,2,"#5a3b26");
  for(const ox of [2*T,8*T]){
    px(ox,12,32,36,"#7a3a2a"); for(let r=0;r<5;r++) px(ox,15+r*7,32,1,"#5e2c20");
    px(ox+6,22,20,18,"#1a0e08");
    const glow=done?"#a8481c":(reduced?"#ff7a2a":Math.sin(t/140+ox)>0?"#ff7a2a":"#e8601e");
    px(ox+8,30,16,10,glow); for(let i=0;i<5;i++) px(ox+8+i*4,24,1,16,"#2a1a10");
  }
  if(!done&&!(s.looks.oven>0)){ const ox=2*T; px(ox+13,28,6,7,"#e8c8a8"); for(let i=0;i<4;i++) px(ox+13+i*2-1,24,1,4,"#e8c8a8"); }
  // floor
  for(let y=3;y<7;y++)for(let x=1;x<11;x++){ px(x*T,y*T,T,T,"#6a4a30"); px(x*T,y*T+7,T,1,"#5a3e28"); px(x*T,y*T+15,T,1,"#5a3e28"); px(x*T+((x*7+y*3)%13),y*T+3,2,1,"#cfc6b4"); }
  px(0,112,192,16,"#3a2a1e"); px(80,112,32,16,"#7b7468"); px(78,108,2,20,"#2a1e14"); px(112,108,2,20,"#2a1e14");
  // footprints in the flour: yours, and a larger set a few steps behind
  if(!done){ const tr=s.trail;
    tr.slice(0,-1).forEach(p=>{ px(p.x*T+5,p.y*T+9,2,2,"#9a8468"); px(p.x*T+9,p.y*T+7,2,2,"#9a8468"); });
    tr.slice(0,-3).forEach(p=>{ px(p.x*T+3,p.y*T+3,3,4,"#a8957a"); px(p.x*T+3,p.y*T+8,3,1,"#a8957a"); px(p.x*T+10,p.y*T+1,3,4,"#a8957a"); px(p.x*T+10,p.y*T+6,3,1,"#a8957a"); });
  }
  // shelves of loaves; before the end, they breathe
  const loafCol=done?"#c8904a":"#9a9a94";
  BAKERY.shelves.forEach(([x,y],i)=>{ const ox=x*T, oy=y*T;
    px(ox,oy+4,T,2,"#4a301f"); px(ox,oy+13,T,2,"#4a301f");
    [[2,1],[8,1],[3,10],[9,10]].forEach(([lx,ly],k)=>{ const rise=done||reduced?0:(Math.sin(t/900+i*1.7+k)>0.7?1:0); px(ox+lx,oy+ly-rise,5,3+rise,loafCol); px(ox+lx+1,oy+ly-rise,3,1,done?"#e0aa60":"#b0b0aa"); });
  });
  // peg by the ovens, and the apron on it until you take it
  { const ox=BAKERY.hook.x*T, oy=BAKERY.hook.y*T; px(ox+6,oy,4,2,"#4a301f"); px(ox+7,oy+2,1,2,"#2a1e14");
    if(!owns(s,"apron")){ const sway=reduced||s.bakeryWon?0:Math.round(Math.sin(t/900)); px(ox+4+sway,oy+4,8,11,"#ece6d6"); px(ox+5+sway,oy+3,6,1,"#ece6d6"); px(ox+4+sway,oy+8,8,1,"#c9c1b0"); } }
  // counter, bell, order slip
  BAKERY.counter.concat([[PICKUPS.slip.x,PICKUPS.slip.y]]).forEach(([x,y])=>{ const ox=x*T, oy=y*T; px(ox,oy+3,T,2,"#efe9dc"); px(ox,oy+5,T,4,"#d8d2c4"); px(ox,oy+9,T,7,"#7a5a3a"); });
  px(7*T+6,4*T,4,3,"#c9a23a"); px(7*T+7,4*T-1,2,1,"#c9a23a");
  { const ox=PICKUPS.slip.x*T, oy=PICKUPS.slip.y*T; px(ox+7,oy-3,1,6,"#3a3a3a"); if(!has(s,"slip")) px(ox+4,oy,8,4,"#efe6cf"); }
  // dough
  { const ox=BAKERY.dough.x*T, oy=BAKERY.dough.y*T, r=done||reduced?0:Math.round(1+Math.sin(t/1200));
    px(ox+1,oy+9,14,2,"#7a5a3a"); px(ox+2,oy+11,2,5,"#5a3e28"); px(ox+12,oy+11,2,5,"#5a3e28");
    px(ox+3,oy+4,10,5,"#8a8f94"); px(ox+4,oy+2-r,8,3,"#e8dcc0"); px(ox+3,oy+3,10,1,"#cfc6b4");
    if(!done&&glimpse(t,9000,900)) px(ox+6,oy-r,4,2,"#e8dcc0"); }
  // the baker, in the doorway, smiling
  if(bakerInside(s)){ const b=BAKERY.baker; sprite(g,b.x,b.y,{hair:"#d7cfbf",face:"#d9a982",coat:"#7a5b3c",apron:"#ece6d6",tray:true,smile:true,eyes:lookAt(b,s.player)},fadeIn("slip",t)); }
  const flick=reduced?0.8:0.78+0.06*Math.sin(t/400);
  sprite(g,s.player.x,s.player.y,{hair:"#3a2a1e",face:"#e0b894",coat:"#26335a",quill:true},has(s,"name")?0.92:flick);
}
export function drawBakeryOver(t){
  og.clearRect(0,0,192,128);
  const s=state, pulse=reduced?0.25:0.16+0.14*(0.5+0.5*Math.sin(t/320));
  if(!s.bakeryWon) qx(0,0,192,128,`rgba(255,110,40,${reduced?0.06:0.05+0.03*Math.sin(t/700)})`);
  if(pickupAvailable(s,"slip")) halo(PICKUPS.slip.x,PICKUPS.slip.y,pulse);
}

