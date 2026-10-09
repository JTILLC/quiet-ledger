import { TUNING } from "./tuning.js";

export const CARDS = {
  pen:   {name:"Clerk's pen",    cost:1, battle:"Deal 3.", starter:true},
  still: {name:"Hold still",     cost:1, battle:"Block 4.", starter:true},
  flower:{name:"Pressed flower", cost:1, battle:"Regain 3 presence.", sight:"Maren, at the well", reveal:"Lets you see Maren, at the well."},
  coin:  {name:"Cold coin",      cost:1, battle:"Deal 2. Its next attack is 3 weaker.", sight:"the traces it leaves", reveal:"Lets you see the traces it leaves."},
  ribbon:{name:"Burned ribbon",  cost:2, battle:"Deal 7.", sight:"the shade itself", reveal:"Lets you see the shade itself."},
  glance:{name:"Maren's glance", cost:0, battle:"Draw 2.", sight:"lets Maren see you", reveal:"Lets Maren see you, a little.", keep:true},
  taper: {name:"Chapel taper",   cost:0, battle:"Light every card in your hand. Draw 1.", sight:"what's written in the dark", reveal:"Lets you read what's written in the dark."},
  name:  {name:"Your own name",  cost:1, battle:"Deal 3. Block 3. It can't be taken.", sight:"yourself", reveal:"Lets you see yourself. Lets Maren hear you.", keep:true},
  candle:{name:"Lit candle",     cost:1, battle:"Deal 4. Light a card.", sight:"the people in the pews", reveal:"Lets you see the people in the pews."},
  slip:  {name:"Order slip",     cost:1, battle:"Deal 5.", sight:"who the bread is for", reveal:"Lets you see who the bread is for."},
  bread: {name:"Warm bread",     cost:0, battle:"Regain 4 presence. Draw 1.", sight:"the street as it was", reveal:"Lets you see the street as it was."},
  loaf:  {name:"Grey loaf",      cost:1, battle:"Set it down. It's gone for this fight.", junk:true, keep:true},
};
export const STARTER = ["pen","pen","pen","still","still","still"];
export const PICKUPS = {
  flower:{scene:"street",x:3,y:4,needs:null,step:true},
  coin:  {scene:"street",x:6,y:5,needs:"flower",inWell:true},
  ribbon:{scene:"street",x:10,y:5,needs:"coin",step:true},
  taper: {scene:"chapel",x:1,y:2,needs:null},
  name:  {scene:"chapel",x:10,y:2,needs:"taper"},
  slip:  {scene:"bakery",x:9,y:4,needs:null},
};
export const SHADE_INTENTS = [
  {kind:"lunge", dmg:6, seen:"Maren's eyes go to your throat. It will lunge for {d}."},
  {kind:"grasp", dmg:3, seen:"Maren's eyes go to your hands. It will tear a card away ({d} damage)."},
  {kind:"smother", dmg:9, seen:"Maren covers her mouth. It will smother you for {d}."},
  {kind:"lunge", dmg:7, seen:"Maren's eyes go to your throat. It will lunge for {d}."},
];
export const CHANDLER_INTENTS = [
  {kind:"snuff", dmg:3, seen:"It lifts its snuffer toward you. {d} damage, and your whole next hand comes up dark."},
  {kind:"melt", dmg:7, seen:"It tips a candle over your head. Hot wax for {d}."},
  {kind:"grasp", dmg:2, seen:"It twists a wick between its fingers. It will draw a card into a candle ({d} damage)."},
  {kind:"melt", dmg:8, seen:"It tips two candles at once. Hot wax for {d}."},
];
export const BAKER_INTENTS = [
  {kind:"bake", dmg:3, seen:"He slides a tray toward you. {d} damage, and two grey loaves go into your deck."},
  {kind:"press", dmg:6, seen:"He reaches for you with floury hands. {d} damage."},
  {kind:"bake", dmg:3, seen:"He slides another tray toward you. {d} damage, and two more grey loaves."},
  {kind:"press", dmg:7, seen:"He leans in, kneading the air between you. {d} damage."},
];
export const FOES = {
  shade:{name:"The tallow shade", hp:TUNING.shadeHp, hit:TUNING.shadeHit, grips:TUNING.shadeGrips, intents:SHADE_INTENTS, dark:0,
    opening:"Every card you hold is a way of seeing it. It knows that.",
    win:"It comes apart like smoke through a keyhole.", lose:"It pushes you out of itself.",
    verbs:{lunge:"lunges",grasp:"reaches into you",smother:"smothers you"}, take:n=>`It tears away your ${n}.`},
  chandler:{name:"The Chandler", hp:TUNING.chandlerHp, hit:TUNING.chandlerHit, grips:TUNING.chandlerGrips, intents:CHANDLER_INTENTS, dark:TUNING.chandlerDark,
    opening:"It pinches out the light around your hands. A dark card has to be brought into the light before you can play it.",
    win:"It sags into its own wax and goes out.", lose:"It sets you on a shelf with the other candles, and you go out.",
    verbs:{snuff:"snuffs the light around you",melt:"pours hot wax over you",grasp:"winds a wick around your wrist"}, take:n=>`It draws your ${n} into a candle.`},
  baker:{name:"The baker", hp:TUNING.bakerHp, hit:TUNING.bakerHit, grips:[], intents:BAKER_INTENTS, dark:0,
    opening:"He doesn't move while you're looking at him. Every card you play without Sight, you look down at your hand, and he takes a step.",
    win:"He sags, softens, and slumps into the flour like dough left too long. The tray clatters on the floor.", lose:"His hands are warm. They close over your face, gently, the way you'd cover rising bread.",
    verbs:{bake:"slides a tray of grey loaves at you",press:"presses his floury hands to your chest"}, take:()=>"", he:true},
};
export const SPOT = { records:{x:2,y:2}, bakeryDoor:{x:6,y:2}, chapel:{x:9,y:2}, well:{x:6,y:5}, maren:{x:7,y:5}, shade:{x:9,y:3}, baker:{x:5,y:3} };
export const CHAPEL = {
  entry:{x:6,y:6}, door:[{x:5,y:7},{x:6,y:7}], altar:[{x:5,y:1},{x:6,y:1}],
  stand:{x:1,y:2}, lectern:{x:10,y:2}, chandler:{x:6,y:2},
  pews:[[2,3],[3,3],[4,3],[7,3],[8,3],[9,3],[2,5],[3,5],[4,5],[7,5],[8,5],[9,5]],
  ghosts:[
    {x:3,y:3, look:{hair:"#cfcfcf",face:"#d9b49a",coat:"#4a4a52"},
      dim:"A shape in the pew, like breath on glass. Maybe a man with his hat in his lap.",
      lit:"Old Tobin, the lamplighter, hat in his lap. “Is it evening yet?” he asks no one in particular."},
    {x:8,y:3, look:{hair:"#d8b46a",face:"#ecc9ae",coat:"#6f5a7a"},
      dim:"A small shape in a Sunday collar.",
      lit:"Ada Hale, in her Sunday collar, counting the candles under her breath. She gets to nine and starts again."},
    {x:2,y:5, look:{hair:"#4a3020",face:"#c99a78",coat:"#5a4a32"},
      dim:"Someone broad-shouldered, leaning forward as if to pray.",
      lit:"Brenner the cooper, sawdust still in his sleeves. He's watching the door like he means to leave."},
    {x:9,y:5, look:null,
      dim:"This pew is empty, but the cushion is worn into a shallow. Someone sat here every week.",
      lit:"Still empty. It was yours."},
  ],
};

export const BAKERY = {
  entry:{x:6,y:6}, door:[{x:5,y:7},{x:6,y:7}], baker:{x:5,y:6}, dough:{x:3,y:5}, hook:{x:10,y:3},
  ovens:[[2,2],[3,2],[8,2],[9,2]], shelves:[[1,3],[1,4],[1,5]], counter:[[6,4],[7,4],[8,4]],
};


// ---- Gear: worn, not played. Each piece changes how fights go.
export const SLOTS=["head","neck","chest","hands","legs","belt","feet","fingers","trinket"];
export const GEAR={
  cap:     {name:"Clerk's cap",        slot:"head",    mods:{maxHp:2},     text:"+2 presence.", lore:"Felt, gone shiny at the brim where your fingers find it."},
  veil:    {name:"Mourning veil",      slot:"head",    mods:{maxHp:1,sightRange:1}, text:"+1 presence. You see further in the dark.", lore:"It smells of tallow and someone's hair."},
  key:     {name:"Lamplighter's key",  slot:"neck",    mods:{blockStart:3}, text:"Start each fight with 3 block.", lore:"Tobin's. Iron on a string, warm from his neck."},
  coat:    {name:"Clerk's coat",       slot:"chest",   mods:{maxHp:2},     text:"+2 presence.", lore:"Ink on both cuffs. It was buttoned wrong when you woke."},
  apron:   {name:"Baker's apron",      slot:"chest",   mods:{loafFree:1},  text:"Grey loaves cost nothing to set down, and setting one down doesn't make him move.", lore:"Still warm, like it was just taken off. Like someone is still in it."},
  gloves:  {name:"Ink-stained gloves", slot:"hands",   mods:{penBonus:1},  text:"Clerk's pen deals 1 more.", lore:"Stained with your ink. They fit exactly."},
  gaiters: {name:"Your gaiters",       slot:"legs",    mods:{stillBonus:1}, text:"Hold still blocks 1 more.", lore:"Folded the way you fold things."},
  rope:    {name:"Well rope",          slot:"belt",    mods:{firstWill:1}, text:"+1 will on your first turn.", lore:"There was nothing on the end of it. It's warm."},
  slippers:{name:"Felt slippers",      slot:"feet",    mods:{bakerSteps:1}, text:"The baker needs one more step to reach you.", lore:"Left side by side, as if someone stepped out of them."},
  ring:    {name:"Ring from the dough",slot:"fingers", mods:{sightHeal:1}, text:"Playing a Sight card restores 1 presence.", lore:"There's a name inside the band, rubbed smooth by a thumb."},
  tallow:  {name:"Tallow stub",        slot:"trinket", mods:{freeLight:1}, text:"Once a turn, bringing a dark card into the light is free.", lore:"What the shade left behind. It never quite cools."},
};
export const STARTING_GEAR={owned:["cap","coat"],equipped:{head:"cap",chest:"coat"}};
// Gear lying in the open (walk onto it). The rest is handed over by people and places.
export const GEAR_SPOTS={ slippers:{scene:"street",x:1,y:3,needs:"won"} };
