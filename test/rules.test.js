import { describe, it, expect } from "vitest";
import { reduce, initialState, walkable } from "../src/game/rules.js";
import { TUNING } from "../src/game/tuning.js";
import { playthrough, walkTo } from "./bot.js";

const inBattle=(foe,found,patch={})=>{
  let s={...initialState(),found,won:true,...patch};
  s=reduce(s,{type:"START_BATTLE",foe});
  return s;
};

describe("the whole game", ()=>{
  it("can be played from waking up to Maren's last scene", ()=>{
    const s=playthrough();
    expect(s.mode).toBe("end");
    expect(s.bakeryWon).toBe(true);
    expect(s.found).toEqual(expect.arrayContaining(["glance","name","candle","slip","bread"]));
  });
});

describe("the street", ()=>{
  it("keeps the chapel shut until the shade is gone", ()=>{
    let s=walkTo(initialState(),9,2);
    expect(s.scene).toBe("street");
    expect(s.say.text).toMatch(/won't open/);
  });
  it("the baker only moves while you're far from him", ()=>{
    let s={...initialState(),won:true,player:{x:5,y:4},bakerTick:99};
    s=reduce(s,{type:"STEP",dx:1,dy:0});
    expect(s.baker).toEqual({x:5,y:3});
    s={...s,player:{x:10,y:5},bakerTick:99};
    s=reduce(s,{type:"STEP",dx:0,dy:1});
    expect(s.baker).not.toEqual({x:5,y:3});
  });
});

describe("the Chandler", ()=>{
  it("won't let you play a dark card until you light it", ()=>{
    let s=inBattle("chandler",["name"]);
    const i=s.battle.dark.indexOf(true);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(reduce(s,{type:"PLAY",i})).toBe(s);
    s=reduce(s,{type:"LIGHT",i});
    expect(s.battle.dark[i]).toBe(false);
    expect(s.battle.will).toBe(TUNING.will-TUNING.lightCost);
  });
});

describe("the baker", ()=>{
  const withHand=(hand)=>{ const s=inBattle("baker",["slip"]); s.battle.hand=hand; s.battle.dark=hand.map(()=>false); return s; };
  it("steps closer when you play a card without Sight", ()=>{
    const s=reduce(withHand(["pen"]),{type:"PLAY",i:0});
    expect(s.battle.near).toBe(TUNING.bakerSteps-1);
  });
  it("holds still while you play a Sight card", ()=>{
    const s=reduce(withHand(["slip"]),{type:"PLAY",i:0});
    expect(s.battle.near).toBe(TUNING.bakerSteps);
  });
  it("reaches you at zero steps, then goes back", ()=>{
    let s=withHand(["pen"]); s.battle.near=1; s.battle.will=3;
    s=reduce(s,{type:"PLAY",i:0});
    expect(s.battle.hp).toBe(TUNING.hp-TUNING.bakerReach);
    expect(s.battle.near).toBe(TUNING.bakerSteps);
  });
  it("bakes grey loaves that leave the fight when set down", ()=>{
    let s=withHand([]);
    s=reduce(s,{type:"END_TURN"});
    const all=[...s.battle.hand,...s.battle.draw,...s.battle.discard];
    expect(all.filter(id=>id==="loaf")).toHaveLength(2);
  });
  it("blocks the bakery door while he's inside", ()=>{
    let s={...initialState(),won:true,chapelWon:true,bakeryOpen:true,scene:"bakery",player:{x:6,y:6},found:["slip"]};
    s=reduce(s,{type:"STEP",dx:0,dy:1});
    expect(s.scene).toBe("bakery");
    expect(walkable(5,6,s)).toBe(false);
  });
});
