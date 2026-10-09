// A simple player used by tests and the balance script.
import { reduce, initialState, findPath, has } from "../src/game/rules.js";
import { CARDS, FOES } from "../src/game/content.js";

export function walkTo(s,tx,ty){
  for(const [x,y] of findPath(s,tx,ty)||[]){
    if(Math.abs(x-s.player.x)+Math.abs(y-s.player.y)!==1) break;
    s=reduce(s,{type:"STEP",dx:x-s.player.x,dy:y-s.player.y});
  }
  if(Math.abs(tx-s.player.x)+Math.abs(ty-s.player.y)===1) s=reduce(s,{type:"STEP",dx:tx-s.player.x,dy:ty-s.player.y});
  return s;
}

// careful: respects the baker (won't look down when he's one step away)
export function playBattle(s,{careful=true}={}){
  for(let guard=0;guard<600&&!s.battle.over;guard++){
    const b=s.battle, it=FOES[b.foe].intents[b.turn%FOES[b.foe].intents.length];
    const ti=b.hand.findIndex((id,i)=>id==="taper"&&!b.dark[i]); if(ti>=0){ s=reduce(s,{type:"PLAY",i:ti}); continue; }
    const prio=["glance","bread","ribbon","slip","candle","name","coin","flower","pen",it.dmg>=6?"still":"pen","still","loaf"];
    let next=null;
    for(const want of prio){
      const i=b.hand.findIndex((id,k)=>id===want&&!b.dark[k]&&CARDS[id].cost<=b.will);
      if(i<0) continue;
      if(careful&&b.foe==="baker"&&!CARDS[want].sight&&b.near<=1) continue;
      const n=reduce(s,{type:"PLAY",i}); if(n!==s){ next=n; break; }
    }
    if(next){ s=next; continue; }
    const d=b.dark.findIndex(Boolean);
    if(d>=0&&b.will>=2){ s=reduce(s,{type:"LIGHT",i:d}); continue; }
    s=reduce(s,{type:"END_TURN"});
  }
  return s;
}

// Fight until won, re-finding anything lost along the way.
export function winFight(s,foe,refind){
  for(let tries=0;tries<80;tries++){
    s=playBattle(reduce(s,{type:"START_BATTLE",foe}));
    if(s.battle.over==="won") return reduce(s,{type:"CLAIM"});
    s=reduce(s,{type:"RETREAT"}); s=refind(s);
  }
  throw new Error("could not win "+foe);
}

export function playthrough(){
  let s=initialState();
  const streetCards=s=>{ s=walkTo(s,3,4); s=walkTo(s,6,5); return s.won?s:walkTo(s,10,5); };
  const refindStreet=s=>{ for(const [id,x,y] of [["flower",3,4],["coin",6,5],["ribbon",10,5]]) if(!has(s,id)) s=walkTo(s,x,y); return s; };
  s=walkTo(s,2,2); s=walkTo(s,2,4); s=walkTo(s,2,2); // records room twice: gloves
  s=streetCards(s);
  s=walkTo(s,5,6); s=walkTo(s,6,5); s=walkTo(s,5,6); s=walkTo(s,6,5); // the well twice more: rope
  s=winFight(s,"shade",refindStreet);                // the shade leaves the tallow stub
  s=walkTo(s,1,3);                                   // slippers by the records room
  s=walkTo(s,9,2);                                   // into the chapel
  s=walkTo(s,9,5);                                   // your empty pew: gaiters
  s=walkTo(s,1,2); s=walkTo(s,10,2);                 // taper, then your name
  s=winFight(s,"chandler",s=>has(s,"taper")?s:walkTo(s,1,2));
  s=walkTo(s,3,3);                                   // Tobin's key
  s=walkTo(s,6,7);                                   // back out
  s=walkTo(s,7,5);                                   // Maren opens the bakery
  s=walkTo(s,6,2);                                   // into the bakery
  s=walkTo(s,3,5); s=walkTo(s,3,6); s=walkTo(s,3,5);  // the dough, twice: ring
  s=walkTo(s,10,3);                                  // the apron (goes in the satchel; the bot keeps the coat)
  s=walkTo(s,9,4);                                   // the order slip
  s=winFight(s,"baker",s=>s);
  s=walkTo(s,6,7); s=walkTo(s,7,5);                  // out to Maren
  return s;
}
