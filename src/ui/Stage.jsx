import { useEffect, useRef } from "react";
import { TUNING } from "../game/tuning.js";
import { findPath, thingAt } from "../game/rules.js";
import { bind, drawScene } from "../scenes/index.js";

const KEYS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]};
const LABEL={street:"The street",chapel:"Inside the chapel",bakery:"Inside the bakery"};

export default function Stage({state,stateRef,dispatch,hidden}){
  const base=useRef(null), over=useRef(null), walk=useRef(null);

  // Draw loop: the canvas is imperative pixel art; React only owns the state it reads.
  useEffect(()=>{
    bind(base.current,over.current);
    let raf; const loop=t=>{ const s=stateRef.current; if(s.mode!=="battle") drawScene(s,t); raf=requestAnimationFrame(loop); };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[stateRef]);

  const stopWalk=()=>{ clearInterval(walk.current); walk.current=null; };
  useEffect(()=>{
    const onKey=e=>{
      if(stateRef.current.mode!=="street"||e.target.tagName==="BUTTON") return;
      const k=KEYS[e.key]; if(!k) return; e.preventDefault(); stopWalk(); dispatch({type:"STEP",dx:k[0],dy:k[1]});
    };
    addEventListener("keydown",onKey); return ()=>{ removeEventListener("keydown",onKey); stopWalk(); };
  },[stateRef,dispatch]);

  const onClick=e=>{
    const s0=stateRef.current; if(s0.mode!=="street") return;
    const r=e.currentTarget.getBoundingClientRect(), tx=Math.floor((e.clientX-r.left)/r.width*TUNING.cols), ty=Math.floor((e.clientY-r.top)/r.height*TUNING.rows);
    stopWalk(); const path=findPath(s0,tx,ty); if(!path) return;
    const target=thingAt(tx,ty,s0); let moved=false;
    const step=()=>{
      const s=stateRef.current;
      if(s.mode!=="street"||(moved&&s.say.choices.length)){ stopWalk(); return; }
      const nx=path.shift();
      if(nx&&Math.abs(nx[0]-s.player.x)+Math.abs(nx[1]-s.player.y)!==1){ stopWalk(); return; }
      if(nx){ moved=true; dispatch({type:"STEP",dx:nx[0]-s.player.x,dy:nx[1]-s.player.y}); return; }
      stopWalk();
      if(target&&Math.abs(tx-s.player.x)+Math.abs(ty-s.player.y)===1) dispatch({type:"STEP",dx:tx-s.player.x,dy:ty-s.player.y});
    };
    if(!path.length) step(); else walk.current=setInterval(step,TUNING.stepMs);
  };

  const gray=TUNING.grayByFound[Math.min(state.found.length,TUNING.grayByFound.length-1)];
  const show={display:hidden?"none":"block"};
  return (<>
    <canvas id="street" ref={base} width="192" height="128" tabIndex="0" onClick={onClick}
      style={{...show,filter:`grayscale(${gray}) contrast(${0.85+0.15*(1-gray)})`}}
      aria-label={`${LABEL[state.scene]}. Use arrow keys to walk, or tap a place.`}/>
    <canvas id="over" ref={over} width="192" height="128" aria-hidden="true" style={show}/>
  </>);
}
