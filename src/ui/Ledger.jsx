import { useEffect, useState } from "react";
import { TUNING } from "../game/tuning.js";
import { CARDS } from "../game/content.js";
import { has } from "../game/rules.js";
import { PHANTOM } from "./phantom.js";

const subtitle=s=>s.bakeryWon?"Someone on this street has been waiting for you."
  :s.chapelWon?"Someone on this street can hear you now."
  :has(s,"name")?"You have a name again."
  :s.won?"Someone on this street can see you now."
  :"What you hold is what you can see.";

export default function Ledger({state}){
  const rows=[{name:"Clerk's pen ×3, hold still ×3",sight:"The street, and nobody on it."},
    ...state.found.map(id=>({id,name:CARDS[id].name,sight:CARDS[id].reveal}))];
  if(state.mode==="end"&&state.bakeryWon) rows.push({id:"clerk",foreign:true,name:"The clerk",sight:"Received into the chapel, three winters ago. Entered in another hand."});
  const count=Math.max(7,rows.length);

  // Now and then, a line inks itself into an empty row and fades.
  const [ghost,setGhost]=useState(null);
  const quiet=state.mode==="street"&&count>rows.length;
  useEffect(()=>{
    if(!quiet) return;
    const [lo,hi]=TUNING.phantomEveryMs;
    const t=setTimeout(()=>{
      if(document.hidden) return;
      setGhost({row:rows.length+Math.floor(Math.random()*(count-rows.length)),text:PHANTOM[Math.floor(Math.random()*PHANTOM.length)]});
    },lo+Math.random()*(hi-lo));
    return ()=>clearTimeout(t);
  },[quiet,ghost,rows.length,count]);
  useEffect(()=>{ if(!ghost) return; const t=setTimeout(()=>setGhost(null),7000); return ()=>clearTimeout(t); },[ghost]);

  return (
    <aside className="ledger" aria-label="The ledger">
      <h1>The Quiet Ledger</h1>
      <p className="sub">{subtitle(state)}</p>
      <ol>
        {Array.from({length:count},(_,i)=>{
          const r=rows[i], phantom=!r&&ghost?.row===i;
          return (
            <li key={r?.id??"row"+i} className={[r?.id&&"new",r?.foreign&&"foreign"].filter(Boolean).join(" ")}>
              <span className="n">{i+1}</span>
              {r?<span className="t">{r.name}<span className="s">{r.sight}</span></span>
                :<span className={`t${phantom?" phantom":""}`}>{phantom?ghost.text:""}</span>}
            </li>);
        })}
      </ol>
    </aside>
  );
}
