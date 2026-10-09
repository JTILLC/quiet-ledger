// Rough balance check: a simple bot plays each fight thousands of times.
//   npm run balance
import { reduce, initialState } from "../src/game/rules.js";
import { playBattle } from "../test/bot.js";

const decks={
  shade:["flower","coin","ribbon"],
  chandler:["flower","coin","ribbon","glance","taper","name"],
  baker:["flower","coin","ribbon","glance","taper","name","candle","slip"],
};
const N=+(process.argv[2]||3000);
for(const [foe,found] of Object.entries(decks)){
  for(const careful of foe==="baker"?[true,false]:[true]){
    let wins=0, turns=0;
    for(let i=0;i<N;i++){
      const s=playBattle(reduce({...initialState(),found,won:true},{type:"START_BATTLE",foe}),{careful});
      if(s.battle.over==="won"){ wins++; turns+=s.battle.turn; }
    }
    console.log(`${foe.padEnd(9)}${foe==="baker"?(careful?" careful ":" careless"):"         "}  win ${(wins/N*100).toFixed(1).padStart(5)}%   avg turns on a win ${(turns/Math.max(wins,1)).toFixed(1)}`);
  }
}
