// The chapel: dark until the Chandler is gone.
import { SPOT, CHAPEL, BAKERY, PICKUPS } from "../game/content.js";
import { has, pickupAvailable, shadeVisible, chandlerVisible, bakerInside } from "../game/rules.js";
import { g, og, state, T, reduced, px, qx, fadeIn, lookAt, glimpse, sprite, halo } from "./paint.js";

export function drawChapel(t){
  const s=state, lit=s.chapelWon, fl=reduced?0:(Math.sin(t/180)>0?1:0);
  px(0,0,192,128,"#2e2b27");
  // back wall, window, altar
  px(16,0,160,32,"#46423a");
  for(let i=0;i<14;i++) px(16+(i*37)%150,4+(i*11)%24,10,1,"#3c3832");
  px(84,1,24,22,"#2a2d33");
  const panes=lit?["#9a5a72","#5a7a9c","#6f9a5a","#b0904a"]:["#5a4650","#46505c","#4c5a46","#5c5646"];
  px(86,3,9,9,panes[0]); px(97,3,9,9,panes[1]); px(86,13,9,8,panes[2]); px(97,13,9,8,panes[3]);
  px(78,18,36,14,"#6a5a48"); px(78,18,36,4,"#e4ddc8");
  for(let k=0;k<6;k++){ const cx=81+k*6, h=3+(k*5)%4; px(cx,18-h,2,h,"#e8e2cc"); if(lit) px(cx,15-h-fl*(k%2),2,3,"#ffcf6b"); }
  // floor, aisle runner, door
  for(let y=2;y<7;y++)for(let x=1;x<11;x++){ px(x*T,y*T,T,T,"#57524a"); px(x*T,y*T,T,1,"#4a463f"); px(x*T,y*T,1,T,"#4a463f"); }
  px(5*T+4,2*T,24,5*T,"#5e2e2a"); px(5*T+5,2*T,22,5*T,"#6a3430");
  px(80,112,32,16,"#8a8578"); px(80,112,32,2,"#a9a28f"); px(78,108,2,20,"#3a3630"); px(112,108,2,20,"#3a3630");
  // candle stand
  { const ox=CHAPEL.stand.x*T, oy=CHAPEL.stand.y*T;
    px(ox+7,oy+4,2,11,"#3a3a3a"); px(ox+3,oy+3,10,2,"#3a3a3a"); px(ox+4,oy+14,8,2,"#3a3a3a");
    px(ox+4,oy,1,3,"#e8e2cc"); px(ox+11,oy,1,3,"#e8e2cc"); px(ox+7,oy-1,2,4,"#efe6cf"); px(ox+7,oy-4-fl,2,3,"#ffcf6b");
    if(!has(s,"taper")) px(ox+2,oy+12,10,1,"#efe6cf"); }
  // lectern and register
  { const ox=CHAPEL.lectern.x*T, oy=CHAPEL.lectern.y*T;
    px(ox+6,oy+6,4,9,"#5a3b26"); px(ox+3,oy+14,10,2,"#4a301f");
    px(ox+2,oy+2,12,5,"#d8d0b8"); px(ox+7,oy+2,1,5,"#8a7a60");
    if(!has(s,"name")) px(ox+3,oy+3,10,3,"#ece2c4"); else for(let r=0;r<3;r++){ px(ox+3,oy+3+r,3,1,"#5a5246"); px(ox+9,oy+3+r,3,1,"#5a5246"); } }
  // pews, then the people in them
  for(const [x,y] of CHAPEL.pews){ const ox=x*T, oy=y*T; px(ox,oy+3,T,3,"#4a301f"); px(ox,oy+9,T,3,"#5a3b26"); px(ox+1,oy+12,2,4,"#3a2618"); px(ox+13,oy+12,2,4,"#3a2618"); }
  const ghostA=lit?0.9:(has(s,"name")?0.3:0.16)+(reduced?0:0.05*Math.sin(t/600));
  for(const gh of CHAPEL.ghosts) if(gh.look) sprite(g,gh.x,gh.y,lit?gh.look:{...gh.look,eyes:lookAt(gh,s.player)},ghostA*(lit?fadeIn("candle",t):1));
  if(!lit&&glimpse(t,17000,130)){ px(98,5,7,7,"#d8d2c2"); px(99,7,2,2,"#111"); px(103,7,2,2,"#111"); px(100,10,3,1,"#3a2a2a"); }
  // clerk: more solid once you have your name back
  const flick=reduced?0.75:0.7+0.08*Math.sin(t/400);
  sprite(g,s.player.x,s.player.y,{hair:"#3a2a1e",face:"#e0b894",coat:"#26335a",quill:true},has(s,"name")?0.92:flick);
}

export function drawChapelOver(t){
  og.clearRect(0,0,192,128);
  const s=state, pulse=reduced?0.25:0.16+0.14*(0.5+0.5*Math.sin(t/320));
  if(!s.chapelWon){
    // the dark: you only see what's near you, near the one candle, and near the door
    const r=has(s,"taper")?3.2:1.6, pl=s.player;
    for(let y=0;y<8;y++)for(let x=0;x<12;x++){
      const fall=(cx,cy,rad)=>Math.max(0,(Math.hypot(x-cx,y-cy)-rad)*0.32);
      const a=Math.min(0.88,fall(pl.x,pl.y,r),fall(CHAPEL.stand.x,CHAPEL.stand.y,1),fall(5.5,7,0.8));
      if(a>0) qx(x*T,y*T,T,T,`rgba(8,8,12,${a})`);
    }
  }
  if(!has(s,"name")){
    const pl=s.player, m={x:11-pl.x,y:pl.y}, d=Math.abs(m.x-pl.x);
    if(d>=3) sprite(og,m.x,m.y,{hair:"#3a2a1e",face:"#e0b894",coat:"#26335a",quill:true,eyes:lookAt(m,pl)},reduced?0.22:0.16+0.08*Math.sin(t/300));
  }
  if(pickupAvailable(s,"taper")) halo(CHAPEL.stand.x,CHAPEL.stand.y,pulse);
  if(pickupAvailable(s,"name")) halo(CHAPEL.lectern.x,CHAPEL.lectern.y,pulse);
  if(chandlerVisible(s)){
    const ox=CHAPEL.chandler.x*T, oy=CHAPEL.chandler.y*T, sway=reduced?0:Math.round(Math.sin(t/650)), fl=reduced?0:(Math.sin(t/150)>0?1:0);
    og.globalAlpha=fadeIn("name",t);
    qx(ox+3,oy-12,10,27,"#3b3026"); qx(ox+5,oy-4,6,17,"#d8cfb8");
    qx(ox+4+sway,oy-18,8,7,"#cdc2a4"); qx(ox+6+sway,oy-15,1,1,"#111"); qx(ox+9+sway,oy-15,1,1,"#111");
    qx(ox+5+sway,oy-11,1,3,"#efe6cf"); qx(ox+10+sway,oy-11,1,2,"#efe6cf");
    qx(ox+13,oy-6,2,7,"#efe6cf"); qx(ox+13,oy-9-fl,2,3,"#ffcf6b"); qx(ox,oy-4,3,2,"#2a2a2a"); qx(ox-1,oy-6,2,3,"#2a2a2a");
    og.globalAlpha=1;
  }
}
