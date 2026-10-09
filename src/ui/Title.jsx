import { useEffect, useRef, useState } from "react";
import { initialState } from "../game/rules.js";
import { bind, drawScene } from "../scenes/index.js";
import { describeSave } from "../game/save.js";

// The street behind the title: empty. After you've finished once, the baker is standing in it.
function backdrop(finished){
  const s=initialState(); s.player={x:-4,y:-4};
  if(finished){ s.won=true; s.baker={x:2,y:4}; }
  return s;
}

export default function Title({save,finished,onContinue,onNew,soundOn,toggleSound}){
  const base=useRef(null), over=useRef(null), cont=useRef(null);
  const [confirming,setConfirming]=useState(false);
  useEffect(()=>{
    bind(base.current,over.current);
    const s=backdrop(finished); let raf;
    const loop=t=>{ drawScene(s,t); raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[finished]);
  useEffect(()=>{ cont.current?.focus(); },[]);

  return (
    <main className="title">
      <div className="title-stage" aria-hidden="true">
        <canvas ref={base} width="192" height="128"/>
        <canvas ref={over} width="192" height="128" className="title-over"/>
      </div>
      <div className="title-card">
        <h1>The Quiet Ledger</h1>
        <p className="sub">{finished?"Someone on this street is still waiting for you.":"What you hold is what you can see."}</p>
        {!confirming&&<div className="title-actions">
          {save&&<button ref={cont} className="primary" onClick={onContinue}>Continue<small>{describeSave(save)}</small></button>}
          <button ref={save?null:cont} className={save?"":"primary"} onClick={()=>save?setConfirming(true):onNew()}>{save?"New game":"Begin"}</button>
        </div>}
        {confirming&&<div className="title-actions">
          <p className="warn">Start over? Your ledger will be wiped clean. Everything you found, you'll have to find again.</p>
          <button className="primary" onClick={onNew}>Wipe it and begin</button>
          <button onClick={()=>setConfirming(false)}>Keep my ledger</button>
        </div>}
        <div className="title-foot">
          <span>Your progress saves itself in this browser.</span>
          <button className="mini" aria-pressed={soundOn} onClick={toggleSound}>{soundOn?"Sound on":"Sound off"}</button>
        </div>
      </div>
    </main>
  );
}
