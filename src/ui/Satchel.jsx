import { useEffect, useRef } from "react";
import { GEAR, SLOTS } from "../game/content.js";

// What you're wearing, slot by slot, and what you're carrying.
export default function Satchel({gear,dispatch,onClose}){
  const close=useRef(null);
  useEffect(()=>{ close.current?.focus(); },[]);
  const carried=gear.owned.filter(id=>gear.equipped[GEAR[id].slot]!==id);
  return (
    <div className="satchel" role="dialog" aria-label="Satchel">
      <div className="satchel-head">
        <h2>What you're wearing</h2>
        <button ref={close} className="mini dark" onClick={onClose}>Close</button>
      </div>
      <ul className="slots">
        {SLOTS.map(slot=>{
          const id=gear.equipped[slot], g=id&&GEAR[id];
          return (
            <li key={slot} className={g?"worn":"empty"}>
              <span className="slot">{slot}</span>
              {g?<>
                <span className="gear"><b>{g.name}</b><small>{g.text}</small></span>
                <button className="mini dark" onClick={()=>dispatch({type:"UNEQUIP",slot})}>Take off</button>
              </>:<span className="gear"><small>Nothing.</small></span>}
            </li>);
        })}
      </ul>
      <h2>In your satchel</h2>
      {carried.length===0?<p className="none">Nothing else. Whatever you find, you'll carry here.</p>:
        <ul className="carried">
          {carried.map(id=>{ const g=GEAR[id], cur=gear.equipped[g.slot];
            return (
              <li key={id}>
                <span className="gear"><b>{g.name}</b> <span className="slot-tag">{g.slot}</span><small>{g.text}</small><i>{g.lore}</i></span>
                <button className="mini dark" onClick={()=>dispatch({type:"EQUIP",id})}>{cur?`Wear instead of ${GEAR[cur].name.toLowerCase()}`:"Wear it"}</button>
              </li>);
          })}
        </ul>}
    </div>
  );
}
