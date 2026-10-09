// The street: base layer, then the overlay (pickups, the shade).
import { SPOT, CHAPEL, BAKERY, PICKUPS } from "../game/content.js";
import { has, pickupAvailable, shadeVisible, chandlerVisible, bakerInside } from "../game/rules.js";
import { g, og, state, T, reduced, px, qx, fadeIn, lookAt, glimpse, sprite, halo } from "./paint.js";

export const DRIFT=[[9,3],[10,3],[10,4],[9,4],[8,3],[8,4]];
export function shadePos(t){ return shadeVisible(state)?[SPOT.shade.x,SPOT.shade.y]:DRIFT[Math.floor((reduced?0:t)/1500)%DRIFT.length]; }

export function drawStreet(t){
  const s=state, won=s.won;
  for(let y=3;y<8;y++)for(let x=0;x<12;x++){ px(x*T,y*T,T,T,"#7b7468"); px(x*T+2,y*T+3,5,3,"#6c655a"); px(x*T+9,y*T+9,5,3,"#6c655a"); px(x*T+4,y*T+11,2,1,"#8c8576"); }
  px(0,7*T,192,2,"#5e584e");
  // records
  px(0,4,64,8,"#39424c"); px(0,12,64,36,"#4f5d6b");
  px(6,20,14,12,"#2a3038"); px(6,25,14,2,"#7a6a50"); px(44,20,14,12,"#2a3038"); px(44,25,14,2,"#7a6a50");
  if(glimpse(t,21000,160)){ px(10,21,6,5,"#cfc6b4"); px(11,23,1,1,"#111"); px(14,23,1,1,"#111"); px(9,26,8,6,"#26335a"); }
  px(36,34,9,14,"#2c2620"); px(42,41,1,1,"#c9b27a");
  // bakery
  px(64,8,64,6,"#6b4a36"); px(64,14,64,34,"#c49a5a");
  for(let i=0;i<16;i++) px(64+i*4,24,4,6,i%2?"#e8dcc4":"#8e3b2f");
  px(70,33,18,11,"#3b2a1c"); if(won) px(72,35,14,7,"#e0a54a");
  px(100,34,9,14,"#5a3b26");
  if(s.bakeryOpen){ px(101,34,8,14,reduced||Math.sin(t/260)>-0.6?"#e8a04a":"#c9803a"); px(100,34,1,14,"#3b2a1c"); }
  // chapel
  px(128,14,64,34,"#a9a796"); px(128,10,64,5,"#5a5a4e"); px(146,0,28,16,"#a9a796"); px(146,0,28,2,"#5a5a4e");
  px(155,4,10,9,"#2e2a24"); px(157,5,6,7,"#b08a3a"); px(178,22,8,12,"#6c7f93"); px(134,22,8,12,"#6c7f93");
  if(won){ px(148,32,10,16,"#1a1410"); const fl=reduced?0:(Math.sin(t/180)>0?1:0); px(152,40,2,5,"#efe6cf"); px(152,37-fl,2,3,"#ffcf6b"); }
  else { const rattle=has(s,"coin")&&!reduced&&Math.floor(t/90)%23===0?1:0; px(148+rattle,32,10,16,"#4a3626"); px(155+rattle,40,1,1,"#c9b27a"); }
  // well
  { const ox=6*T, oy=5*T; px(ox+2,oy+3,12,11,"#8a8f94"); px(ox+4,oy+5,8,7,"#15181b"); px(ox+2,oy,2,4,"#5a4a3a"); px(ox+12,oy,2,4,"#5a4a3a"); px(ox+2,oy,12,1,"#5a4a3a"); px(ox+8,oy+1,1,5,"#c9b27a"); }
  // frost traces
  if(has(s,"coin")&&!won){
    const [sx,sy]=shadePos(t);
    for(const [fx,fy,a] of [[sx,sy,1],[sx,sy+1,.5]]){ if(fy>6) continue; g.globalAlpha=a*0.9;
      for(const [dx,dy] of [[3,4],[9,3],[6,9],[12,11],[2,12],[10,7]]) px(fx*T+dx,fy*T+dy,2,1,"#dfeaf2"); g.globalAlpha=1; }
  }
  // people
  if(won&&!s.bakeryOpen){ const b=s.baker; sprite(g,b.x,b.y,{hair:"#d7cfbf",face:"#d9a982",coat:"#7a5b3c",apron:"#ece6d6",tray:true,eyes:lookAt(b,s.player)},0.8); }
  if(has(s,"flower")){
    let eyes=[0,0];
    if(!won){ const [sx,sy]=shadePos(t); eyes=[Math.sign(sx-SPOT.maren.x)>0?1:0, sy<SPOT.maren.y?0:1]; }
    else { eyes=[s.player.x>SPOT.maren.x?1:0, s.player.y<SPOT.maren.y?0:1]; }
    sprite(g,SPOT.maren.x,SPOT.maren.y,{hair:"#6b3a26",face:"#e6c6ae",coat:"#3f5244",shawl:"#8d97a0",eyes},fadeIn("flower",t));
  }
  // clerk (a little less there than everyone else)
  const flick=reduced?0.75:0.7+0.08*Math.sin(t/400);
  sprite(g,s.player.x,s.player.y,{hair:"#3a2a1e",face:"#e0b894",coat:"#26335a",quill:true},won?0.85:flick);
  if(won) for(const lx of [0,11]){ const ox=lx*T, oy=4*T; px(ox+7,oy-2,2,16,"#3a3a3a"); px(ox+5,oy-6,6,4,"#ffd27a"); }
  else for(let y=0;y<8;y++)for(let x=0;x<12;x++){
    if(x>=1&&x<=10&&y<=6) continue; px(x*T,y*T,T,T,"#2b3137");
    const seed=reduced?0:Math.floor(t/140); for(let k=0;k<3;k++){ const h=(x*73+y*151+k*37+seed*11)%256; px(x*T+(h%16),y*T+((h>>4)%16),1,1,"#4a525a"); }
  }
}

export function drawOver(t){
  og.clearRect(0,0,192,128);
  const s=state, pulse=reduced?0.25:0.16+0.14*(0.5+0.5*Math.sin(t/320)), blink=reduced||Math.floor(t/500)%2;
  if(pickupAvailable(s,"flower")){ const ox=3*T, oy=4*T; halo(3,4,pulse); qx(ox+7,oy+6,1,6,"#5f7a3a"); qx(ox+5,oy+5,5,3,"#8a5aa8"); qx(ox+6,oy+4,3,1,"#a57ac2"); if(blink) qx(ox+7,oy+6,1,1,"#fff"); }
  if(pickupAvailable(s,"coin")){ const ox=6*T, oy=5*T; qx(ox+5,oy+6,6,5,`rgba(170,210,255,${pulse})`); qx(ox+7,oy+8,2,2,"#cfe3f5"); if(blink) qx(ox+7,oy+8,1,1,"#fff"); }
  if(pickupAvailable(s,"ribbon")){ const ox=10*T, oy=5*T; halo(10,5,pulse); qx(ox+2,oy+8,2,2,"#c0392b"); qx(ox+4,oy+9,7,2,"#c0392b"); qx(ox+5,oy+8,3,1,"#e8644f"); qx(ox+11,oy+8,3,3,"#1a1a1a"); if(blink) qx(ox+13,oy+8,1,1,"#ff9a3c"); }
  if(shadeVisible(s)){
    const ox=SPOT.shade.x*T, oy=SPOT.shade.y*T, a=fadeIn("ribbon",t)*(reduced?0.85:0.7+0.2*Math.sin(t/230)), sway=reduced?0:Math.round(Math.sin(t/500));
    og.globalAlpha=a;
    qx(ox+3+sway,oy-14,10,28,"#1c1a1f"); qx(ox+5+sway,oy-18,6,6,"#1c1a1f"); qx(ox+1,oy+6,14,8,"#1c1a1fcc");
    qx(ox+4+sway,oy-10,8,2,"#d8cfa8"); qx(ox+6+sway,oy-15,1,1,"#f0ead0"); qx(ox+9+sway,oy-15,1,1,"#f0ead0");
    og.globalAlpha=1;
  }
}
