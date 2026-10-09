import { bind, setState } from "./paint.js";
import { drawStreet, drawOver } from "./street.js";
import { drawChapel, drawChapelOver } from "./chapel.js";
import { drawBakery, drawBakeryOver } from "./bakery.js";

export { bind };
export function drawScene(s,t){
  setState(s);
  if(s.scene==="chapel"){ drawChapel(t); drawChapelOver(t); }
  else if(s.scene==="bakery"){ drawBakery(t); drawBakeryOver(t); }
  else { drawStreet(t); drawOver(t); }
}
