# The Quiet Ledger

*What you hold is what you can see.*

A small narrative card game. You are a clerk who wakes on an empty street, barely there. Every card you find is also a way of seeing: it adds people, traces, and colour back into the world. Lose a card and you lose what it showed you.

Live version: https://claude.ai/artifact/7T3PhVbg2WS9ntJfV1WkGc

## Running it

Vite + React. Needs Node 18+.

```sh
npm install
npm run dev       # local dev server with hot reload
npm test          # rules tests, including a full bot playthrough of the game
npm run balance   # bot plays each fight thousands of times, with and without gear
npm run build     # one self-contained file: dist/index.html
```

## Deploying (Cloudflare Pages)

Connect the repo once and every push to `main` deploys:

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `JTILLC/quiet-ledger`.
2. Framework preset: **None**. Build command: `npm run build`. Build output directory: `dist`. Production branch: `main`.
3. Save and Deploy. It'll be at `quiet-ledger.pages.dev`; add a custom domain under the project's Custom domains tab if you want one.

Or from a machine with `wrangler` logged in: `npm run build && npx wrangler pages deploy dist --project-name quiet-ledger`.

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
- **Title and saving.** The game autosaves after every action (one save per browser, in `localStorage`). The title offers Continue, with where you are and how many ledger entries, or New game, which asks before wiping the save. Once you've finished, the title's empty street isn't empty anymore.
- **Gear.** Nine slots: head, neck, chest, hands, legs, belt, feet, fingers, trinket. Open the satchel with **I** or the Satchel button (not mid-fight) to see what you're wearing, take things off, or wear something else. Gear goes on automatically if its slot is empty.

  | Slot | Gear | Where | Effect |
  |---|---|---|---|
  | Head | Clerk's cap | you start in it | +2 presence |
  | Head | Mourning veil | the chapel altar | +1 presence, see further in the dark |
  | Neck | Lamplighter's key | Tobin, after the chapel | start each fight with 3 block |
  | Chest | Clerk's coat | you start in it | +2 presence |
  | Chest | Baker's apron | hook by the bakery ovens | grey loaves are free and don't draw the baker closer |
  | Hands | Ink-stained gloves | records room, second look | Clerk's pen deals 1 more |
  | Legs | Your gaiters | under your empty pew | Hold still blocks 1 more |
  | Belt | Well rope | the well, after listening | +1 will on your first turn |
  | Feet | Felt slippers | outside the records room, after the shade | the baker needs one more step |
  | Fingers | Ring from the dough | reach into the dough | Sight cards restore 1 presence |
  | Trinket | Tallow stub | left by the shade | once a turn, lighting a dark card is free |

  Fights are tuned so gear helps a lot without being required (see `npm run balance`).
- **Unease.** Quiet horror, no gore or jump-scares:
  - The baker never moves while you're near him. Walk away and he's closer, always facing you.
  - Records room, well, and bakery door get worse each time you look (`looks` counters).
  - In the dark chapel, the pew figures' eyes follow you, and a second clerk mirrors you at the edge of the light until you find your name.
  - Rare glimpses: someone at the records-room desk, a face at the chapel glass.
  - The ledger sometimes writes faint lines in empty rows, then they fade. The ending adds an entry in another hand.
  - Low presence in battle (4 or less) makes the screen close in.
  - Sound (toggle under the street; off until first tap/key): wind on the street, a drone in the chapel, a lower one in the bakery, footsteps that echo a beat late and sometimes once too often, a thump when a card is stolen.

## Code map

- `src/game/tuning.js`: all balance numbers (HP, will, draw, foe HP, grip thresholds, darkness, baker pace, ledger-phantom timing, grayscale steps).
- `src/game/content.js`: cards, pickups, foe intents, foes, gear and slots, and the layouts of the street, chapel, and bakery.
- `src/game/rules.js`: all game logic as a pure reducer, `reduce(state, action)` (`STEP`, `START_BATTLE`, `LIGHT`, `PLAY`, `END_TURN`, `CLAIM`, `RETREAT`, `RESET`, `LOAD`, `EQUIP`, `UNEQUIP`), plus map helpers and tap-to-walk pathfinding. `state.scene` is `street`, `chapel`, or `bakery`. No DOM, so it runs in tests and scripts.
- `src/scenes/`: canvas pixel art, one file per place (`street.js`, `chapel.js`, `bakery.js`), with shared pixel helpers and sprites in `paint.js`. Each draws a base layer, then an overlay for glowing pickups, darkness, and foes.
- `src/game/save.js`: autosave to `localStorage`; `upgrade()` in rules.js fills in fields older saves are missing.
- `src/ui/`: React components. `Title`, `Satchel`, `Stage` (canvases, draw loop, keyboard and tap input), `Battle`, `Narration`, `Ledger` (including the lines it writes on its own).
- `src/audio/sfx.js`: WebAudio ambience and footsteps, no audio files.
- `test/`: Vitest tests and the bot player; `scripts/balance.js` uses the same bot.

Adding a place: its layout and cards in `content.js`, its interactions in `rules.js`, a drawing file in `src/scenes/`, and a line in `src/scenes/index.js`.

Supports light/dark themes and `prefers-reduced-motion`.
