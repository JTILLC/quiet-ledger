// Pure game logic: state in, state out. No DOM.
import { TUNING } from "./tuning.js";
import { CARDS, STARTER, PICKUPS, SHADE_INTENTS, CHANDLER_INTENTS, BAKER_INTENTS, FOES, SPOT, CHAPEL, BAKERY, GEAR, STARTING_GEAR, GEAR_SPOTS } from "./content.js";

export const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export const has=(s,id)=>s.found.includes(id);
export const shadeVisible=s=>has(s,"ribbon")&&!s.won;
export const chandlerVisible=s=>has(s,"name")&&!s.chapelWon;
export const bakerInside=s=>has(s,"slip")&&!s.bakeryWon;

export function initialState(){
  return { mode:"street", scene:"street", player:{x:2,y:3}, found:[], won:false, chapelWon:false,
    baker:{...SPOT.baker}, bakerTick:0, looks:{}, bakeryOpen:false, bakeryWon:false, trail:[],
    gear:structuredClone(STARTING_GEAR),
    say:{text:"You wake standing in the middle of a street. No one is here. Your breath doesn't fog. Near the records room, one small thing still has colour in it.",choices:[]},
    battle:null };
}

// ---- Gear
export const owns=(s,id)=>s.gear.owned.includes(id);
export const wearing=(s,id)=>Object.values(s.gear.equipped).includes(id);
export function gearMods(s){
  const m={maxHp:0,blockStart:0,penBonus:0,stillBonus:0,firstWill:0,bakerSteps:0,sightHeal:0,freeLight:0,loafFree:0,sightRange:0};
  for(const id of Object.values(s.gear.equipped)) for(const [k,v] of Object.entries(GEAR[id].mods)) m[k]+=v;
  return m;
}
// Adds gear to the satchel (and puts it on, if that slot is empty). Returns a line for the narration.
export function gainGear(s,id){
  if(owns(s,id)) return "";
  const g=GEAR[id]; s.gear.owned.push(id); s.lastGear={id,at:Date.now()};
  if(!s.gear.equipped[g.slot]){ s.gear.equipped[g.slot]=id; return `\n\n${g.name} (${g.slot}): you put it on. ${g.text}`; }
  return `\n\n${g.name} (${g.slot}) goes in your satchel. ${g.text}`;
}
const gearSpotAvailable=(s,id)=>!owns(s,id)&&(!GEAR_SPOTS[id].needs||s[GEAR_SPOTS[id].needs]);
export const gearSpotVisible=gearSpotAvailable;
export const intentDmg=(foe,it)=>Math.round(it.dmg*FOES[foe].hit);
export const intentText=(foe,it)=>it.seen.replace("{d}",intentDmg(foe,it));
export const costOf=(b,id)=>id==="loaf"&&b.mods.loafFree?0:CARDS[id].cost;
export const lightCostOf=b=>b.freeLight>0?0:TUNING.lightCost;
export function cardText(b,id){
  const m=b.mods;
  if(id==="pen") return `Deal ${3+m.penBonus}.`;
  if(id==="still") return `Block ${4+m.stillBonus}.`;
  if(id==="loaf"&&m.loafFree) return "Set it down. Free, and he doesn't move.";
  return CARDS[id].battle;
}
// Saves from older versions are missing newer fields; fill them in.
export function upgrade(saved){
  const base=initialState();
  return {...base,...saved,gear:saved.gear?{owned:[...saved.gear.owned],equipped:{...saved.gear.equipped}}:base.gear,looks:saved.looks||{},trail:saved.trail||[]};
}

export function thingAt(x,y,s){
  const at=p=>p.x===x&&p.y===y;
  if(s.scene==="chapel"){
    if(CHAPEL.door.some(at)) return "door";
    if(CHAPEL.altar.some(at)) return "altar";
    if(at(CHAPEL.stand)) return "stand";
    if(at(CHAPEL.lectern)) return "lectern";
    if(at(CHAPEL.chandler)&&chandlerVisible(s)) return "chandler";
    const gi=CHAPEL.ghosts.findIndex(at); if(gi>=0) return "ghost"+gi;
    if(CHAPEL.pews.some(([px,py])=>px===x&&py===y)) return "pew";
    return null;
  }
  if(s.scene==="bakery"){
    const on=list=>list.some(([px,py])=>px===x&&py===y);
    if(BAKERY.door.some(at)) return "bdoor";
    if(at(BAKERY.baker)&&bakerInside(s)) return "bakerIn";
    if(at(PICKUPS.slip)) return "slip";
    if(at(BAKERY.dough)) return "dough";
    if(at(BAKERY.hook)) return "hook";
    if(on(BAKERY.ovens)) return "oven";
    if(on(BAKERY.shelves)) return "shelf";
    if(on(BAKERY.counter)) return "counter";
    return null;
  }
  if(at(SPOT.well)) return "well";
  if(at(SPOT.maren)&&has(s,"flower")) return "maren";
  if(at(SPOT.shade)&&shadeVisible(s)) return "shade";
  if(at(s.baker)&&s.won&&!s.bakeryOpen) return "baker";
  for(const k of ["records","bakeryDoor","chapel"]) if(at(SPOT[k])) return k;
  return null;
}
export function walkable(x,y,s){
  const top=s.scene==="chapel"?2:3;
  if(x<1||x>10||y<top||y>6) return false;
  const t=thingAt(x,y,s); return !t;
}
// The baker never moves while you're near him. Walk away and he's a step closer when you look back.
export const BAKER_AVOID=[[2,3],[6,3],[9,3],[3,4],[10,5]];
export function creep(s){
  if(s.scene!=="street"||!s.won||s.bakeryOpen) return;
  const b=s.baker, p=s.player, dx=p.x-b.x, dy=p.y-b.y;
  s.bakerTick++;
  if(Math.abs(dx)+Math.abs(dy)<4||s.bakerTick<TUNING.bakerEvery) return;
  s.bakerTick=0;
  const tries=[[Math.sign(dx),0],[0,Math.sign(dy)]].filter(([x,y])=>x||y);
  if(Math.abs(dy)>Math.abs(dx)) tries.reverse();
  for(const [mx,my] of tries){
    const nx=b.x+mx, ny=b.y+my;
    if(walkable(nx,ny,s)&&!BAKER_AVOID.some(([ax,ay])=>ax===nx&&ay===ny)){ s.baker={x:nx,y:ny}; return; }
  }
}
export const looked=(s,id)=>(s.looks[id]=(s.looks[id]||0)+1)-1;

export function pickupAvailable(s,id){ const p=PICKUPS[id]; return !has(s,id)&&(!p.needs||has(s,p.needs)); }

export function say(s,text,choices=[]){ s.say={text,choices}; return s; }
export const fight=foe=>[{label:"Face it",action:{type:"START_BATTLE",foe}},{label:"Back away",action:{type:"DISMISS"}}];

export function pickup(s,id){
  s.found.push(id); s.lastFound={id,at:Date.now()};
  if(id==="flower") return say(s,"A pressed flower, violet gone to brown. The moment your hand closes on it, there is a woman by the well who was not there before. She doesn't blink. She's staring at the chapel steps.");
  if(id==="coin") return say(s,"At the bottom of the dry well, a coin so cold it burns. Now you can see frost crossing the cobbles near the chapel, one patch at a time, and the woman's eyes following it.");
  if(id==="ribbon") return say(s,"A ribbon, burned at one end. You close your hand on it and the thing on the chapel steps is suddenly there: tall, smoke and old tallow. It turns its head. For the first time, something on this street sees you.",fight("shade"));
  if(id==="taper") return say(s,"You take a taper from the stand and light it from the one candle still burning. The dark steps back a little. Across the chapel, something on the lectern catches the light.");
  if(id==="slip") return say(s,"An order slip on the counter, in your handwriting:\n“One loaf, for the clerk. To be collected three winters on.”\nYou don't remember writing it. The date at the bottom is today.\n\nBehind you, the bell over the door rings once. The baker is in the doorway with his tray, and he is smiling now.",fight("baker"));
  if(id==="name") return say(s,"You hold the taper over the register and the wax goes soft. Names, a long column of them: everyone on this street. Near the bottom is yours. Someone has been writing over it in tallow, night after night.\n\nYou say it out loud. It's the first sound you've made since you woke. At the altar, something tall straightens up from its work, a fistful of half-made candles in its hands. It heard you too.",fight("chandler"));
}

export function interact(s,id){
  if(id.startsWith("ghost")){
    const n=+id.slice(5), g=CHAPEL.ghosts[n];
    if(n===3&&!owns(s,"gaiters")) return say(s,g.dim+"\n\nUnder it, folded the way you fold things: a pair of gaiters. Yours."+gainGear(s,"gaiters"));
    if(n===0&&s.chapelWon&&!owns(s,"key")) return say(s,g.lit+"\n\nHe lifts a key on a string from around his neck and holds it out, still not looking at you. “You'll want light where you're going,” he says. “It's dark in an oven.”"+gainGear(s,"key"));
    return say(s,s.chapelWon?g.lit:g.dim);
  }
  switch(id){
    case "records":{
      const n=looked(s,"records");
      if(n===1) return say(s,"The ledger on the desk is open to today. The last entry is in your handwriting. The ink is still wet.\n\nIn the desk drawer: a pair of gloves, stained with the same ink."+gainGear(s,"gloves"));
      return say(s,n===0?"The records room. A desk, a ledger, and a chair worn to the shape of someone who sat there a long time.":"The chair is still warm.");
    }
    case "bakeryDoor":{
      if(s.bakeryOpen){ s.scene="bakery"; s.player={...BAKERY.entry}; s.trail=[];
        return say(s,s.bakeryWon?"The ovens are banked, and the bakery smells like bread. Only bread."
          :"It's warm inside. Too warm, like the inside of a mouth. The shelves are full of loaves, and every one of them is grey. There's flour on the floor, and your footprints in it."); }
      const n=looked(s,"bakeryDoor");
      if(n===0) return say(s,"The bakery door doesn't open. It has no inside yet.");
      if(n===1) return say(s,"You knock. After a moment, from the other side, something knocks back. Twice. Then it waits for you to answer.");
      return say(s,"You don't knock this time. Something on the other side does, very softly, at the height of your face.");
    }
    case "well":
      if(pickupAvailable(s,"coin")) return pickup(s,"coin");
      if(!has(s,"coin")) return say(s,"The well is dry. The rope goes down and stops at nothing.");
      if(looked(s,"well")===0) return say(s,"Dry. Something down there used to be cold.");
      if(!owns(s,"rope")) return say(s,"You lean over the edge and hold your breath. At the bottom, something keeps breathing. It's in time with you.\n\nYou haul the rope up, hand over hand, to see what's on the end of it. Nothing is. It's warm."+gainGear(s,"rope"));
      return say(s,"You lean over the edge and hold your breath. At the bottom, something keeps breathing. It's in time with you. It's in time with you even now.");
    case "maren":
      if(s.bakeryWon){ s.mode="end"; return say(s,"Maren is waiting at the well. She looks right at you, and then at the loaf in your hands. “Three winters,” she says. “And you came back for it.”\n\nShe breaks the loaf and gives you half. It's warm. You can taste it. Then she sets her half on the edge of the well, carefully, the way people leave bread out for the dead.",[{label:"Begin again",action:{type:"RESET"}}]); }
      if(s.chapelWon&&!s.bakeryOpen){ s.bakeryOpen=true; return say(s,"Maren turns before you reach her. “You said your name in there,” she says. “I heard it all the way out at the well. I'd forgotten I knew it.”\n\nShe looks right at you now, not near you. Behind her, the bakery door has swung open on warm light and the smell of bread. The baker isn't on the street anymore. You didn't see him go."); }
      if(s.bakeryOpen) return say(s,"“Don't eat anything in there,” she says. She won't look at the bakery.");
      if(s.won) return say(s,"She looks at you, or near you, the way you'd look at someone through a fogged window. “You're the clerk. You've stood at that desk three winters. I thought you were frost on the glass.”");
      if(has(s,"ribbon")) return say(s,"“It's on the steps,” she whispers. Not to you. She doesn't know you're here.");
      if(has(s,"coin")) return say(s,"She shivers as you come close and pulls her shawl tight. She's looking past you, at the frost.");
      return say(s,"She doesn't move. Her breath fogs in the cold. Yours doesn't.");
    case "shade": return say(s,"It waits on the chapel steps, and it is watching you.",fight("shade"));
    case "baker":
      if(s.baker.x===SPOT.baker.x&&s.baker.y===SPOT.baker.y) return say(s,"A baker, frozen mid-step with a tray of loaves. His eyes are on you. They were on you before you turned around.");
      return say(s,"He's still mid-step, tray held out toward you. He was by the bakery. You're sure he was by the bakery.");
    case "chapel":
      if(s.won){ s.scene="chapel"; s.player={...CHAPEL.entry};
        return say(s,s.chapelWon?"Back inside. The candles burn steady now, and the people in the pews are easy to see."
          :"Inside, the chapel is colder than the street, and dark. You can only see what's close to you. Faint shapes sit in the pews, like breath on glass. By the door, one candle is still burning."); }
      return say(s,"The chapel door won't open. Something is holding it shut from your side of things.");
    case "door": s.scene="street"; s.player={x:SPOT.chapel.x,y:SPOT.chapel.y+1};
      return say(s,s.chapelWon?"You step out onto the cobbles. The street looks warmer than you left it.":"You step back out onto the cobbles.");
    case "altar":
      if(chandlerVisible(s)) return say(s,"The Chandler stands over the altar, working the wax.",fight("chandler"));
      if(s.chapelWon) return say(s,"The altar candles burn evenly now, one for every name in the register.");
      return say(s,"The altar is crowded with half-made candles. Each has a scrap of paper pressed into the wax, a few letters showing."
        +(owns(s,"veil")?"":"\n\nAmong them, folded small, a black veil."+gainGear(s,"veil")));
    case "stand":
      if(pickupAvailable(s,"taper")) return pickup(s,"taper");
      return say(s,"One candle still burns on the stand. You've taken what light you can carry.");
    case "lectern":
      if(pickupAvailable(s,"name")) return pickup(s,"name");
      if(has(s,"name")) return say(s,"The register. Your name is still there under the wax, if you look for it.");
      return say(s,"A register lies open on the lectern, but a skin of wax covers the page. In this dark you can't make out a single word.");
    case "chandler": return say(s,"It waits by the altar, rolling a wick between finger and thumb. It hasn't taken its eyes off you.",fight("chandler"));
    case "pew": return say(s,"An empty stretch of pew.");
    case "bdoor":
      if(bakerInside(s)) return say(s,"You'd have to walk past him. You'd have to turn your back on him.");
      s.scene="street"; s.player={x:SPOT.bakeryDoor.x,y:SPOT.bakeryDoor.y+1};
      return say(s,s.bakeryWon?"You step out with the loaf held against you. It's still warm.":"You step back out onto the cobbles. The cold is almost a relief.");
    case "bakerIn": return say(s,"He stands between you and the door, tray held out. He hasn't moved since you looked. He won't, while you're looking.",fight("baker"));
    case "slip":
      if(pickupAvailable(s,"slip")) return pickup(s,"slip");
      return say(s,"The spike where the order slip was. There's a second slip under it now. It says the same thing, in the same hand.");
    case "counter": return say(s,s.bakeryWon?"The counter, scrubbed white. A bell. You could ring it now, if you wanted.":"The counter is scrubbed white. A brass bell sits on it. You don't ring it.");
    case "shelf": return say(s,s.bakeryWon?"Fresh loaves, brown and ordinary. The names are still scored in the crusts, but now they look like orders waiting to be collected."
      :"Grey loaves, row on row. Each one has a name scored into the crust. Tobin. Hale. Brenner. You stop reading before you get to the bottom shelf.");
    case "oven":
      if(s.bakeryWon) return say(s,"Just an oven. The coals are banked.");
      return say(s,looked(s,"oven")===0?"The oven is lit. Through the grate, a hand is pressed flat against the iron from the inside. It isn't burning. It's waiting."
        :"The hand is gone. There's a print on the inside of the grate, at the height of your face.");
    case "dough":
      if(s.bakeryWon) return say(s,"Just dough, rising under a cloth.");
      if(looked(s,"dough")>0&&!owns(s,"ring")) return say(s,"You lift the cloth and push your hand into the dough. It's warm all the way through. Something in there closes around your fingers, gently, and lets go. When you pull your hand out, you're holding a ring."+gainGear(s,"ring"));
      return say(s,"A bowl of dough under a cloth, rising. Something under the surface presses up against the cloth, the shape of a palm, and sinks back down.");
    case "hook":
      if(!owns(s,"apron")) return say(s,"On a hook by the ovens, a baker's apron. It's warm, like it was just taken off. Like someone is still in it."+gainGear(s,"apron"));
      return say(s,"An empty hook. It's still swinging a little.");
  }
  return s;
}

export function drawCards(b,n){
  for(let i=0;i<n;i++){
    if(!b.draw.length){ b.draw=shuffle(b.discard); b.discard=[]; }
    if(!b.draw.length) break;
    b.hand.push(b.draw.pop()); b.dark.push(false);
  }
}
export function darken(b,n){ for(const i of shuffle(b.hand.map((_,i)=>i)).slice(0,n)) b.dark[i]=true; }

export function reduce(prev,a){
  const s=structuredClone(prev);
  switch(a.type){
    case "STEP":{
      if(s.mode!=="street") return prev;
      const x=s.player.x+a.dx, y=s.player.y+a.dy;
      if(walkable(x,y,s)){
        s.player={x,y}; s.say={text:s.say.text,choices:[]}; creep(s);
        if(s.scene==="bakery") s.trail=[...s.trail,{x,y}].slice(-9);
        for(const [id,p] of Object.entries(PICKUPS)) if(p.step&&p.scene===s.scene&&p.x===x&&p.y===y&&pickupAvailable(s,id)) return pickup(s,id);
        for(const [id,p] of Object.entries(GEAR_SPOTS)) if(p.scene===s.scene&&p.x===x&&p.y===y&&gearSpotAvailable(s,id))
          return say(s,"Outside the records room door, a pair of felt slippers, side by side, as if someone stepped out of them a moment ago. They're your size."+gainGear(s,id));
        return s;
      }
      const t=thingAt(x,y,s); return t?interact(s,t):prev;
    }
    case "DISMISS": return say(s,"");
    case "START_BATTLE":{
      const foe=FOES[a.foe];
      s.mode="battle"; s.say={text:"",choices:[]};
      const m=gearMods(s), hp=TUNING.hp+m.maxHp;
      const b={foe:a.foe,hp,maxHp:hp,block:m.blockStart,will:TUNING.will+m.firstWill,hand:[],dark:[],draw:shuffle([...STARTER,...s.found]),discard:[],taken:[],
        foeHp:foe.hp,foeMax:foe.hp,turn:0,weaken:0,snuffed:false,near:TUNING.bakerSteps+m.bakerSteps,grips:[...foe.grips],over:null,log:foe.opening,
        mods:m,freeLight:m.freeLight};
      drawCards(b,TUNING.draw); darken(b,foe.dark); s.battle=b; return s;
    }
    case "LIGHT":{
      const b=s.battle; if(!b||b.over||!b.dark[a.i]||b.will<lightCostOf(b)) return prev;
      if(b.freeLight>0) b.freeLight--; else b.will-=TUNING.lightCost; b.dark[a.i]=false; b.log=`You bring the ${CARDS[b.hand[a.i]].name.toLowerCase()} into the light.`;
      return s;
    }
    case "PLAY":{
      const b=s.battle; if(!b||b.over||b.dark[a.i]) return prev;
      const id=b.hand[a.i], c=CARDS[id]; if(!c||costOf(b,id)>b.will) return prev;
      b.will-=costOf(b,id); b.hand.splice(a.i,1); b.dark.splice(a.i,1); b.discard.push(id);
      const blind=b.foe==="shade"&&b.taken.includes("ribbon");
      const hit=n=>{ const d=blind?Math.floor(n/2):n; b.foeHp=Math.max(0,b.foeHp-d); return d; };
      if(id==="pen") b.log=`You strike with the pen. ${hit(3+b.mods.penBonus)} damage${blind?", swinging blind":""}.`;
      if(id==="still"){ const n=4+b.mods.stillBonus; b.block+=n; b.log=`You hold still and it loses track of you. Block ${n}.`; }
      if(id==="flower"){ b.hp=Math.min(b.maxHp,b.hp+3); b.log="You remember her face. Presence +3."; }
      if(id==="coin"){ const d=hit(2); b.weaken+=3; b.log=`The coin's cold bites into it. ${d} damage, and it slows.`; }
      if(id==="ribbon") b.log=`You lash it with the burned ribbon. ${hit(7)} damage.`;
      if(id==="glance"){ drawCards(b,2); b.log="Maren looks your way. You draw 2."; }
      if(id==="taper"){ b.dark=b.dark.map(()=>false); drawCards(b,1); b.log="The taper flares. Every card in your hand comes into the light, and you draw 1."; }
      if(id==="name"){ const d=hit(3); b.block+=3; b.log=`You say your name. ${d} damage, and block 3.`; }
      if(id==="slip") b.log=`You hold up the order slip. Your own handwriting. ${hit(5)} damage.`;
      if(id==="bread"){ b.hp=Math.min(b.maxHp,b.hp+4); drawCards(b,1); b.log="It's warm. You can taste it. Presence +4, and you draw 1."; }
      if(id==="loaf"){ b.discard.pop(); b.log="You set the grey loaf down. It's still warm. It's warm the way a hand is warm."; }
      if(id==="candle"){ const d=hit(4), j=b.dark.indexOf(true); if(j>=0) b.dark[j]=false; b.log=`The candle's flame licks at it. ${d} damage${j>=0?", and a dark card comes into the light":""}.`; }
      // The baker: every card without Sight means looking down at your hand.
      if(c.sight&&b.mods.sightHeal&&b.foeHp>0&&b.hp<b.maxHp){ b.hp=Math.min(b.maxHp,b.hp+b.mods.sightHeal); b.log+=" The ring is warm on your finger."; }
      if(b.foe==="baker"&&!c.sight&&!(id==="loaf"&&b.mods.loafFree)&&b.foeHp>0){
        b.near--;
        if(b.near<=0){
          const through=Math.max(0,TUNING.bakerReach-b.block); b.block=Math.max(0,b.block-TUNING.bakerReach); b.hp=Math.max(0,b.hp-through); b.near=TUNING.bakerSteps+b.mods.bakerSteps;
          b.log+=` When you look up he's right there, close enough to smell the yeast. You lose ${through} presence. Then he's back where he was.`;
          if(b.hp<=0){ b.over="lost"; b.log=FOES.baker.lose; return s; }
        } else b.log+=b.near===1?" You look down. When you look up, he's close enough to touch.":" You look down. He's a step closer.";
      }
      while(b.grips.length && b.foeHp<=b.grips[0]){
        b.grips.shift();
        if(b.taken.length){ const r=b.taken.pop(); b.discard.push(r); b.log+=` It loses its grip on the ${CARDS[r].name.toLowerCase()}.`; }
      }
      if(b.foeHp<=0){ b.over="won"; b.log=FOES[b.foe].win; }
      return s;
    }
    case "END_TURN":{
      const b=s.battle; if(!b||b.over) return prev;
      const foe=FOES[b.foe], it=foe.intents[b.turn%foe.intents.length];
      b.discard.push(...b.hand); b.hand=[]; b.dark=[];
      let note="";
      if(it.kind==="grasp"){
        const pool=[...b.draw.map((id,i)=>({id,from:"draw",i})),...b.discard.map((id,i)=>({id,from:"discard",i}))].filter(p=>!CARDS[p.id].keep);
        const pref=pool.filter(p=>!CARDS[p.id].starter), from=pref.length?pref:pool, pick=from[Math.floor(Math.random()*from.length)];
        if(pick){ b[pick.from].splice(pick.i,1); b.taken.push(pick.id); note=" "+foe.take(CARDS[pick.id].name.toLowerCase());
          if(b.foe==="shade"&&pick.id==="flower") note+=" Maren flickers out of the world.";
          if(b.foe==="shade"&&pick.id==="ribbon") note+=" It slips half out of sight."; }
      }
      if(it.kind==="snuff") b.snuffed=true;
      if(it.kind==="bake"){ b.discard.push("loaf","loaf"); note=" Two grey loaves go into your deck."; }
      const dmg=Math.max(0,intentDmg(b.foe,it)-b.weaken); b.weaken=0;
      const through=Math.max(0,dmg-b.block); b.hp=Math.max(0,b.hp-through); b.block=0; b.turn++;
      b.log=`${foe.he?"He":"It"} ${foe.verbs[it.kind]}. You lose ${through} presence.${note}`;
      if(b.hp<=0){ b.over="lost"; b.log=foe.lose; return s; }
      b.will=TUNING.will; b.freeLight=b.mods.freeLight; drawCards(b,TUNING.draw);
      darken(b,b.snuffed?b.hand.length:foe.dark); b.snuffed=false;
      return s;
    }
    case "CLAIM":{
      if(!s.battle) return prev;
      const foe=s.battle.foe; s.mode="street"; s.battle=null;
      if(foe==="baker"){
        s.found.push("bread"); s.bakeryWon=true; s.lastFound={id:"bread",at:Date.now()};
        return say(s,"He's gone. The ovens settle. The loaves on the shelves aren't grey anymore: they're brown and ordinary, with names scored in the crusts like orders waiting to be collected.\n\nOne of them is yours. It's warm. Outside, by the well, someone is waiting.");
      }
      if(foe==="chandler"){
        s.found.push("candle"); s.chapelWon=true; s.lastFound={id:"candle",at:Date.now()};
        return say(s,"The Chandler is gone. One by one the candles on the altar take light, and the shapes in the pews sharpen into people: a lamplighter, a girl in a Sunday collar, a cooper with sawdust in his sleeves. People from the street, written over and kept here.\n\nNone of them look at you yet. But somewhere outside, by the well, someone heard you say your name.");
      }
      s.found.push("glance"); s.won=true; s.lastFound={id:"glance",at:Date.now()};
      return say(s,"The shade is gone. Across the street, Maren's head turns, slowly, until she is almost looking at you. A baker has appeared outside the bakery, frozen mid-step.\n\nWhere it stood, a stub of tallow on the cobbles."+gainGear(s,"tallow"));
    }
    case "RETREAT":{
      if(!s.battle) return prev;
      const foe=s.battle.foe, lost=s.battle.taken; s.found=s.found.filter(id=>!lost.includes(id)); s.mode="street"; s.battle=null;
      const names=lost.map(id=>CARDS[id].name.toLowerCase());
      const tail=names.length?` You've lost the ${names.join(" and the ")}; you'll have to find ${names.length>1?"them":"it"} again.`:" You kept everything you came in with.";
      if(foe==="baker"){ s.player={x:8,y:5}; return say(s,"You come to face down in the flour. He's back by the door. He hasn't moved. You're sure he hasn't moved."+tail); }
      if(foe==="chandler"){ s.player={...CHAPEL.entry}; return say(s,"You come to by the chapel door, and the dark is thicker than before."+tail); }
      return say(s,"You're on the cobbles again, and the street is thinner than before."+tail);
    }
    case "RESET": return initialState();
    case "LOAD": return upgrade(a.state);
    case "EQUIP":{
      if(s.mode==="battle"||!owns(s,a.id)) return prev;
      s.gear.equipped[GEAR[a.id].slot]=a.id; return s;
    }
    case "UNEQUIP":{
      if(s.mode==="battle"||!s.gear.equipped[a.slot]) return prev;
      delete s.gear.equipped[a.slot]; return s;
    }
  }
  return prev;
}


// Tap-to-walk: shortest path to the tile, or next to it if it's a thing.
export function findPath(s,tx,ty){
  const goals=new Set(), N=[[0,1],[0,-1],[1,0],[-1,0]];
  if(walkable(tx,ty,s)) goals.add(tx+","+ty); else for(const [dx,dy] of N) if(walkable(tx+dx,ty+dy,s)) goals.add((tx+dx)+","+(ty+dy));
  const start=s.player.x+","+s.player.y, prev={[start]:null}, q=[start];
  while(q.length){ const cur=q.shift();
    if(goals.has(cur)){ const out=[]; let c=cur; while(c!==start){ out.unshift(c.split(",").map(Number)); c=prev[c]; } return out; }
    const [x,y]=cur.split(",").map(Number);
    for(const [dx,dy] of N){ const n=(x+dx)+","+(y+dy); if(!(n in prev)&&walkable(x+dx,y+dy,s)){ prev[n]=cur; q.push(n); } } }
  return null;
}
