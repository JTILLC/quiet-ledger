import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { reduce, initialState } from "./game/rules.js";
import { SFX, ambienceFor } from "./audio/sfx.js";
import Stage from "./ui/Stage.jsx";
import Battle from "./ui/Battle.jsx";
import Narration from "./ui/Narration.jsx";
import Ledger from "./ui/Ledger.jsx";

export default function App(){
  const [state, dispatch]=useReducer(reduce, undefined, initialState);
  const stateRef=useRef(state); stateRef.current=state;
  const prevRef=useRef(state);
  const [soundOn,setSoundOn]=useState(SFX.on);

  // Sound follows the state: footsteps on moves, a thump when a card is stolen, ambience per place.
  useEffect(()=>{
    const prev=prevRef.current, n=state; prevRef.current=n;
    if(prev.player!==n.player&&(prev.player.x!==n.player.x||prev.player.y!==n.player.y)) SFX.step(n.scene==="chapel"&&!n.chapelWon);
    if(prev.battle&&n.battle&&n.battle.taken.length>prev.battle.taken.length) SFX.thump();
    SFX.ambience(ambienceFor(n));
  },[state]);
  useEffect(()=>{
    const wake=()=>{ SFX.unlock(); SFX.ambience(ambienceFor(stateRef.current)); };
    addEventListener("pointerdown",wake,{once:true}); addEventListener("keydown",wake,{once:true});
    return ()=>{ removeEventListener("pointerdown",wake); removeEventListener("keydown",wake); };
  },[]);
  const toggleSound=useCallback(()=>{ SFX.toggle(); setSoundOn(SFX.on); SFX.ambience(ambienceFor(stateRef.current)); },[]);

  const battle=state.mode==="battle";
  return (
    <main className="app">
      <section aria-label="The street">
        <div className="stage">
          <Stage state={state} stateRef={stateRef} dispatch={dispatch} hidden={battle}/>
          {battle&&<Battle battle={state.battle} dispatch={dispatch}/>}
        </div>
        <Narration say={state.say} dispatch={dispatch}/>
        <div className="under">
          <p className="hint" style={{visibility:battle?"hidden":"visible"}}>Arrow keys or WASD to walk, or tap the street. Walk into things to look at them.</p>
          <button className="mini" aria-pressed={soundOn} onClick={toggleSound}>{soundOn?"Sound on":"Sound off"}</button>
        </div>
      </section>
      <Ledger state={state}/>
    </main>
  );
}
