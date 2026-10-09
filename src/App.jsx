import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { reduce, initialState } from "./game/rules.js";
import { readSave, writeSave, eraseSave, hasFinished } from "./game/save.js";
import { SFX, ambienceFor } from "./audio/sfx.js";
import Stage from "./ui/Stage.jsx";
import Battle from "./ui/Battle.jsx";
import Narration from "./ui/Narration.jsx";
import Ledger from "./ui/Ledger.jsx";
import Satchel from "./ui/Satchel.jsx";
import Title from "./ui/Title.jsx";

export default function App(){
  const [screen,setScreen]=useState("title");
  const [save,setSave]=useState(readSave);
  const [state, dispatch]=useReducer(reduce, undefined, initialState);
  const stateRef=useRef(state); stateRef.current=state;
  const prevRef=useRef(state);
  const [soundOn,setSoundOn]=useState(SFX.on);
  const [satchel,setSatchel]=useState(false);
  const [seenGear,setSeenGear]=useState(0);

  // Autosave after every action while playing.
  useEffect(()=>{ if(screen==="game") writeSave(state); },[state,screen]);

  // Sound follows the state: footsteps on moves, a thump when a card is stolen, ambience per place.
  useEffect(()=>{
    const prev=prevRef.current, n=state; prevRef.current=n;
    if(screen!=="game") return;
    if(prev.player!==n.player&&(prev.player.x!==n.player.x||prev.player.y!==n.player.y)) SFX.step(n.scene==="chapel"&&!n.chapelWon);
    if(prev.battle&&n.battle&&n.battle.taken.length>prev.battle.taken.length) SFX.thump();
    SFX.ambience(ambienceFor(n));
  },[state,screen]);
  useEffect(()=>{
    const wake=()=>{ SFX.unlock(); SFX.ambience(ambienceFor(stateRef.current)); };
    addEventListener("pointerdown",wake,{once:true}); addEventListener("keydown",wake,{once:true});
    return ()=>{ removeEventListener("pointerdown",wake); removeEventListener("keydown",wake); };
  },[]);
  const toggleSound=useCallback(()=>{ SFX.toggle(); setSoundOn(SFX.on); SFX.ambience(ambienceFor(stateRef.current)); },[]);

  // The satchel opens with I, closes with I or Escape. Not during a fight.
  const canOpen=state.mode!=="battle";
  useEffect(()=>{ if(!canOpen) setSatchel(false); },[canOpen]);
  useEffect(()=>{
    if(screen!=="game") return;
    const onKey=e=>{
      if(e.key==="Escape") setSatchel(false);
      else if((e.key==="i"||e.key==="I")&&stateRef.current.mode!=="battle"){ setSatchel(v=>!v); }
    };
    addEventListener("keydown",onKey); return ()=>removeEventListener("keydown",onKey);
  },[screen]);
  useEffect(()=>{ if(satchel) setSeenGear(Date.now()); },[satchel,state.gear]);

  const begin=s=>{ dispatch(s?{type:"LOAD",state:s.state}:{type:"RESET"}); setSatchel(false); setScreen("game"); };
  const toTitle=()=>{ writeSave(stateRef.current); setSave(readSave()); setScreen("title"); SFX.ambience("street"); };

  if(screen==="title") return (
    <Title save={save} finished={hasFinished()} soundOn={soundOn} toggleSound={toggleSound}
      onContinue={()=>begin(save)} onNew={()=>{ eraseSave(); begin(null); }}/>
  );

  const battle=state.mode==="battle";
  const newGear=state.lastGear&&state.lastGear.at>seenGear;
  return (
    <main className="app">
      <section aria-label="The street">
        <div className="stage">
          <Stage state={state} stateRef={stateRef} dispatch={dispatch} hidden={battle||satchel} paused={satchel}/>
          {battle&&<Battle battle={state.battle} dispatch={dispatch}/>}
          {satchel&&!battle&&<Satchel gear={state.gear} dispatch={dispatch} onClose={()=>setSatchel(false)}/>}
        </div>
        <Narration say={state.say} dispatch={dispatch}/>
        <div className="under">
          <p className="hint" style={{visibility:battle?"hidden":"visible"}}>Arrow keys or WASD to walk, or tap the street. Walk into things to look at them. I opens your satchel.</p>
          <div className="buttons">
            <button className="mini" disabled={battle} onClick={()=>setSatchel(v=>!v)}>{satchel?"Close satchel":"Satchel"}{newGear&&!satchel?" •":""}</button>
            <button className="mini" aria-pressed={soundOn} onClick={toggleSound}>{soundOn?"Sound on":"Sound off"}</button>
            <button className="mini" onClick={toTitle}>Title</button>
          </div>
        </div>
      </section>
      <Ledger state={state}/>
    </main>
  );
}
