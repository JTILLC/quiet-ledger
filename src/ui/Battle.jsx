import { useEffect, useRef } from "react";
import { TUNING } from "../game/tuning.js";
import { CARDS, FOES } from "../game/content.js";
import { costOf, lightCostOf, cardText, intentText } from "../game/rules.js";

const Bar=({n,max,cls})=>(
  <div className={`bar ${cls}`} aria-hidden="true">{Array.from({length:max},(_,i)=><span key={i} className={i<n?"f":""}/>)}</div>
);

function Card({b,id,i,dark,dispatch}){
  const c=CARDS[id], will=b.will, cost=costOf(b,id), light=lightCostOf(b);
  if(dark) return (
    <button className="card dark" disabled={will<light} onClick={()=>dispatch({type:"LIGHT",i})}>
      <span className="cost">{"●".repeat(light)}</span><b>A dark card</b>
      <small>{light?`Spend ${light} will to bring it into the light.`:"The tallow stub will light it, free."}</small>
    </button>);
  return (
    <button className={`card ${c.starter?"":c.junk?"loaf":"found"}`} disabled={cost>will} onClick={()=>dispatch({type:"PLAY",i})}>
      <span className="cost">{"●".repeat(cost)}</span><b>{c.name}</b><small>{cardText(b,id)}</small>
      {c.sight&&<i>Sight: {c.sight}</i>}
    </button>);
}

export default function Battle({battle:b,dispatch}){
  const foe=FOES[b.foe], it=foe.intents[b.turn%foe.intents.length], shade=b.foe==="shade";
  const seeing=!(shade&&b.taken.includes("flower"));
  const go=useRef(null);
  useEffect(()=>{ if(b.over) go.current?.focus(); },[b.over]);
  return (
    <div className={`battle on${!b.over&&b.hp<=4?" faint":""}`} aria-live="polite">
      <h2>{foe.name}</h2>
      <Bar n={b.foeHp} max={b.foeMax} cls="foe"/>
      <div className="row"><span>{b.foeHp} of {b.foeMax}</span>{shade&&b.taken.includes("ribbon")&&<span>half out of sight: your hits do half</span>}</div>
      {b.taken.length>0&&<p className="held">It is holding your {b.taken.map(id=>CARDS[id].name.toLowerCase()).join(", ")}. Hurt it enough and it lets go.</p>}
      {!b.over&&<p className={`intent ${seeing?"":"hidden"}`}>{seeing?intentText(b.foe,it)+(b.weaken?` (${b.weaken} weaker)`:""):"Maren is gone. You can't tell what it will do."}</p>}
      {b.foe==="baker"&&!b.over&&<p className="intent near">{b.near===1?"He is close enough to touch.":`He is ${b.near} steps away.`} Cards without Sight make you look down.</p>}
      <p className="log">{b.log}</p>
      <div className="you">
        <div className="row"><span>Your presence {b.hp} of {b.maxHp}</span>{b.block>0&&<span>block {b.block}</span>}<span>will {"●".repeat(b.will)}{"○".repeat(Math.max(0,TUNING.will-b.will))}</span>{b.freeLight>0&&b.dark.some(Boolean)&&<span>tallow: one free light</span>}</div>
        <Bar n={b.hp} max={b.maxHp} cls="you"/>
        {!b.over&&<>
          <div className="hand">{b.hand.map((id,i)=><Card key={i+":"+id} b={b} id={id} i={i} dark={b.dark[i]} dispatch={dispatch}/>)}</div>
          <div className="choices"><button onClick={()=>dispatch({type:"END_TURN"})}>End the turn</button></div>
        </>}
      </div>
      {b.over==="won"&&<div className="choices"><button ref={go} onClick={()=>dispatch({type:"CLAIM"})}>Take what it leaves behind</button></div>}
      {b.over==="lost"&&<div className="choices"><button ref={go} onClick={()=>dispatch({type:"RETREAT"})}>{shade?"Come back to the street":b.foe==="baker"?"Get up off the floor":"Come back to the chapel"}</button></div>}
    </div>
  );
}
