// Rough balance check: a simple bot plays each fight thousands of times,
// once wearing only the starting gear and once wearing everything findable by then.
//   npm run balance            (or: npm run balance -- 5000)
import { reduce, initialState } from "../src/game/rules.js";
import { playBattle } from "../test/bot.js";

const decks={
  shade:["flower","coin","ribbon"],
  chandler:["flower","coin","ribbon","glance","taper","name"],
  baker:["flower","coin","ribbon","glance","taper","name","candle","slip"],
};
const skipped={
  shade:{head:"cap",chest:"coat"},
  chandler:{head:"cap",chest:"coat",trinket:"tallow"},
  baker:{head:"cap",chest:"coat",trinket:"tallow"},
};
const found={
  shade:{head:"cap",chest:"coat",hands:"gloves",belt:"rope"},
  chandler:{head:"cap",chest:"coat",hands:"gloves",legs:"gaiters",belt:"rope",feet:"slippers",trinket:"tallow"},
  baker:{head:"cap",neck:"key",chest:"apron",hands:"gloves",legs:"gaiters",belt:"rope",feet:"slippers",fingers:"ring",trinket:"tallow"},
};
const N=+(process.argv[2]||2000);
function rate(foe,wear,careful=true){
  let wins=0;
  for(let i=0;i<N;i++){
    const start={...initialState(),found:decks[foe],won:true,gear:{owned:Object.values(wear),equipped:{...wear}}};
    if(playBattle(reduce(start,{type:"START_BATTLE",foe}),{careful}).battle.over==="won") wins++;
  }
  return `${(wins/N*100).toFixed(0).padStart(3)}%`;
}
console.log("fight                 skipped gear   found gear");
for(const foe of Object.keys(decks)){
  console.log(`${foe.padEnd(22)}${rate(foe,skipped[foe]).padStart(8)}${rate(foe,found[foe]).padStart(13)}`);
  if(foe==="baker") console.log(`${"baker (ignoring him)".padEnd(22)}${rate(foe,skipped[foe],false).padStart(8)}${rate(foe,found[foe],false).padStart(13)}`);
}
