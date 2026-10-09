// One save per browser, written after every action. Old saves are upgraded on load.
import { upgrade } from "./rules.js";

const KEY="quiet-ledger:save", DONE="quiet-ledger:finished", VERSION=1;

export function readSave(){
  try{
    const raw=localStorage.getItem(KEY); if(!raw) return null;
    const data=JSON.parse(raw);
    if(!data||typeof data.state!=="object") return null;
    return {state:upgrade(data.state),savedAt:data.savedAt||0};
  }catch(e){ return null; }
}
export function writeSave(state){
  try{
    localStorage.setItem(KEY,JSON.stringify({version:VERSION,savedAt:Date.now(),state}));
    if(state.mode==="end") localStorage.setItem(DONE,"1");
  }catch(e){}
}
export function eraseSave(){ try{ localStorage.removeItem(KEY); }catch(e){} }
export function hasFinished(){ try{ return localStorage.getItem(DONE)==="1"; }catch(e){ return false; } }

const PLACE={street:"On the street",chapel:"Inside the chapel",bakery:"Inside the bakery"};
export function describeSave({state,savedAt}){
  const where=state.mode==="end"?"At the well, at the end":state.mode==="battle"?"In the middle of a fight":PLACE[state.scene];
  const entries=1+state.found.length;
  return `${where} · ${entries} ${entries===1?"entry":"entries"} in the ledger · ${ago(savedAt)}`;
}
function ago(t){
  if(!t) return "saved";
  const m=Math.round((Date.now()-t)/60000);
  if(m<1) return "saved just now";
  if(m<60) return `saved ${m} min ago`;
  const h=Math.round(m/60); if(h<24) return `saved ${h} hr ago`;
  const d=Math.round(h/24); return `saved ${d} day${d>1?"s":""} ago`;
}
