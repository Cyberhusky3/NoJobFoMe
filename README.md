# NoJobFoMe Arena

A complete browser-based top-down shooter prototype built with vanilla HTML, CSS, and JavaScript.

## Features

- WASD/arrow-key movement, mouse aiming, and hold-to-fire shooting.
- Continuous enemy waves with basic, fast, and tank archetypes.
- Difficulty scaling through larger enemy groups, increased health, and increased speed.
- Health, healing pickups, XP, level progression, score, wave, and survival timer UI.
- Character progression with persistent unlocks via `localStorage`:
  - Starter Soldier: available immediately.
  - Scout: unlocks at Level 3.
  - Heavy Gunner: unlocks at Level 5.
  - Medic: unlocks at Level 7.
- Level-up weapon upgrades for fire rate, damage, and multi-shot.
- Procedural Web Audio sound effects and canvas-based visual effects.

## Running the Game

Open `index.html` directly in a modern browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Controls

- Move: `WASD` or arrow keys
- Aim: mouse
- Shoot: hold left mouse button
- Restart after defeat: use the Game Over screen button
