# The Quiet Ledger

*What you hold is what you can see.*

A small narrative card game. You are a clerk who wakes on an empty street, barely there. Every card you find is also a way of seeing: it adds people, traces, and colour back into the world. Lose a card and you lose what it showed you.

Live version: https://claude.ai/artifact/7T3PhVbg2WS9ntJfV1WkGc

## Running it

It's a single self-contained file. Open `index.html` in a browser. There's no build step.

## What's in this slice

- **The street.** A 12×8 pixel-art scene (records room, bakery, chapel, well). Walk with arrow keys/WASD or tap a tile to path there; walk into things to look at them. The scene desaturates less with each card found.
- **Discovery chain.**
  1. *Pressed flower* lets you see Maren at the well. Her eyes follow the unseen shade.
  2. *Cold coin* (in the well) lets you see the shade's frost traces.
  3. *Burned ribbon* reveals the tallow shade, and it sees you, which starts the fight.
- **Battle.** A deckbuilder with 3 will per turn, drawing 4. Starter deck: 3× Clerk's pen (deal 3), 3× Hold still (block 4), plus every card you've found.
  - Maren's gaze shows the shade's next move. If it tears away the flower, she vanishes and its intent goes hidden.
  - *Grasp* steals a found card. Stolen ribbon halves your damage. The shade lets go of stolen cards at HP thresholds.
  - Lose and stolen cards are gone from the street until you find them again.
- **Win.** You gain *Maren's glance* (0 cost, draw 2). Maren starts to notice you, a baker appears, the lamps light, and the chapel opens.
- **The chapel.** Dark inside; you only see what's near you. Faint townsfolk sit in the pews.
  1. *Chapel taper* (candle stand) widens your light and lets you read.
  2. *Your own name* (the wax-covered register) wakes the Chandler at the altar.
- **The Chandler.** The second fight adds darkness: some cards in your hand come up dark and cost 1 will to bring into the light before you can play them. Its snuffer darkens your whole next hand, and it can draw cards into candles (released at HP thresholds, like the shade). *Your own name* can't be taken.
- **After the chapel.** Win and you gain the *Lit candle*; the pews fill with real people. Go back out to Maren and she hears you. The baker vanishes from the street and the bakery door opens.
- **The bakery.** Too warm. Grey loaves with the chapel townsfolk's names scored in the crusts, a hand in the oven, something pressing up through the dough, and a second, larger set of footprints in the flour following yours. On the counter, an *Order slip* in your handwriting. Take it and the baker is in the doorway, smiling.
- **The baker.** He only moves while you look away. Each card you play *without* Sight means looking down at your hand, and he takes a step (4 steps; at 0 he's on you for 9, then back to where he was). Sight cards let you keep your eyes on him. He also bakes *Grey loaves* into your deck: junk that costs 1 will (and a step) to set down.
- **Ending.** Win for *Warm bread* and the loaf with your name on it. Take it to Maren.
- **The ledger.** A ruled side panel that inks in each card and what it lets you see.
- **Unease.** Quiet horror, no gore or jump-scares:
  - The baker never moves while you're near him. Walk away and he's closer, always facing you.
  - Records room, well, and bakery door get worse each time you look (`looks` counters).
  - In the dark chapel, the pew figures' eyes follow you, and a second clerk mirrors you at the edge of the light until you find your name.
  - Rare glimpses: someone at the records-room desk, a face at the chapel glass.
  - The ledger sometimes writes faint lines in empty rows, then they fade. The ending adds an entry in another hand.
  - Low presence in battle (4 or less) makes the screen close in.
  - Sound (toggle under the street; off until first tap/key): wind on the street, a drone in the chapel, a lower one in the bakery, footsteps that echo a beat late and sometimes once too often, a thump when a card is stolen.

## Code map (`index.html`)

- `TUNING`: all balance numbers (HP, will, draw, foe HP, grip thresholds, darkness, baker pace, ledger-phantom timing, grayscale steps).
- `CARDS`, `PICKUPS`, `SHADE_INTENTS`, `CHANDLER_INTENTS`, `BAKER_INTENTS`, `FOES`, `SPOT`, `CHAPEL`, `BAKERY`: content and layout.
- `reduce(state, action)`: all game logic as a pure reducer (`STEP`, `START_BATTLE`, `LIGHT`, `PLAY`, `END_TURN`, `CLAIM`, `RETREAT`, `RESET`); `state.scene` is `street`, `chapel`, or `bakery`.
- `render*`: DOM rendering for the ledger, narration, and battle.
- `drawStreet` / `drawOver`, `drawChapel` / `drawChapelOver`, `drawBakery` / `drawBakeryOver`: canvas pixel art per scene (base layer, then an overlay for glowing pickups, darkness, and foes).
- `SFX`: WebAudio ambience and footsteps, no audio files.
- Input: keyboard, plus tap-to-walk with BFS pathfinding.

Supports light/dark themes and `prefers-reduced-motion`.
