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
- **The ledger.** A ruled side panel that inks in each card and what it lets you see.

## Code map (`index.html`)

- `TUNING`: all balance numbers (HP, will, draw, shade HP, grip thresholds, grayscale steps).
- `CARDS`, `PICKUPS`, `INTENTS`, `SPOT`: content and layout.
- `reduce(state, action)`: all game logic as a pure reducer (`STEP`, `START_BATTLE`, `PLAY`, `END_TURN`, `CLAIM`, `RETREAT`, `RESET`).
- `render*`: DOM rendering for the ledger, narration, and battle.
- `drawStreet` / `drawOver`: canvas pixel art (base layer and glowing pickups/shade overlay).
- Input: keyboard, plus tap-to-walk with BFS pathfinding.

Supports light/dark themes and `prefers-reduced-motion`.
