# iPhone Monopoly AI (Expo MVP)

A beginner-friendly React Native + Expo prototype of a simple single-player monopoly-like board game.

## MVP Features

- 1 human player + 3 AI opponents
- Offline-only local game state
- Simple 2D square board UI (16 tiles)
- 4 player tokens with different colors
- Turn order system
- Dice roll movement
- Sample buyable properties
- Basic AI buying behavior:
  - buys cheaper property when cash buffer stays healthy
  - skips buying when cash is low

## Project Structure

- `App.js` - main game screen and turn flow
- `src/components/Board.js` - board rendering and token display
- `src/game/gameData.js` - tiles, constants, and initial player setup
- `src/game/gameLogic.js` - dice, movement, property buy/rent, AI turn logic

## Prerequisites

- Node.js 18+
- npm 9+
- iPhone with **Expo Go** installed

## Run with Expo

1. Install dependencies:

```bash
npm install
```

2. Start Expo dev server:

```bash
npm run start
```

3. Open on iPhone:
   - Make sure your computer and iPhone are on the same Wi-Fi network.
   - In terminal, a QR code appears.
   - Open **Expo Go** on iPhone and scan the QR code.

## How to Play (Current MVP)

1. Tap **Roll Dice** on your turn.
2. If you land on an unowned property and have enough cash, tap **Buy Property** or **Skip**.
3. Tap **End Turn**.
4. On AI turns, tap **Run AI Turn**.

## Notes

- Passing GO gives +$40.
- Landing on another player's property pays rent.
- This is an MVP prototype focused on core loop and clean code structure.

