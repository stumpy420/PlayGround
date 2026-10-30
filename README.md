# TRAITOR STRIKE // Dust Protocol

A single-round social-deduction shooter for desktop, phone, and tablet. You are a crewmate locked into a Counter-Strike-style compound with four operators. One of them is a traitor. Complete six defusal tasks, expose the traitor, or eject them before the clock runs out — but a single shot at the wrong operator loses the round.

Built with Three.js and Vite. All textures, audio, models, and map geometry are generated procedurally at runtime.

## Play

```bash
npm install
npm run dev
```

Open the printed local URL, then press **PLAY / DEPLOY**. For a production build:

```bash
npm run build
npm run preview
```

## Controls

### Desktop

| Input | Action |
| --- | --- |
| `WASD` | Move |
| Mouse | Look |
| Left click | Fire |
| `R` | Reload |
| `E` | Use / start task |
| `F` | Report body |
| `Esc` | Pause / resume |

### Phone & tablet

- **Left stick** — move.
- **Drag anywhere on the right** — look.
- **FIRE** — shoot.
- **USE** — interact with task consoles, sabotage panels, and vents.
- **R** — reload.
- **Ⅱ** — pause menu, tilt toggle, audio toggle.

**Tilt aim** is optional. Enable it on the start screen or in the pause menu. On iOS, the game requests motion permission through a user gesture before enabling the gyro.

## Round rules

- **Crew win:** finish all 6 tasks, shoot the traitor, or eject the traitor.
- **Traitor win:** the round timer expires, lights sabotage is left unrepaired too long, the traitor reaches parity, a crewmate is shot, or a crewmate is ejected.
- **Meetings:** report a body or call the one emergency meeting. Read squad comms, then vote. Bots vote and react based on suspicion and evidence.
- **Sabotage:** the traitor can trigger a lights blackout. Find the marked panel and repair it before the timer expires.
- **Bodies and vents:** bodies are evidence. Vents are suspicious, not proof.

## Project layout

- `src/game.js` — round state, tasks, meetings, sabotage, win/loss logic.
- `src/world.js` — procedural Dust2-inspired map, stations, lighting, merged geometry.
- `src/player.js` — first-person controller, viewmodel, desktop/touch/tilt input.
- `src/bots.js` — crew and traitor AI, navigation, kills, vents, bodies.
- `src/ui.js` — HUD, radar, task mini-games, meetings, pause, end screens.
- `src/nav.js` — A* grid navigation and line-of-sight helpers.
- `src/audio.js` — synthesized WebAudio effects and ambience.
- `src/textures.js` — procedural canvas textures and decals.
- `src/style.css` — responsive desktop, portrait, and short-landscape layouts.

## Notes

- Best played in landscape on a phone; portrait is fully supported.
- Headless/software WebGL is supported but slow. Use a hardware-accelerated browser for smooth play.
- The production bundle is a single app chunk; Three.js dominates the download. It is served gzip-compressed by typical hosts.

---

Created with [OMGithub](https://omgithub.com/stumpy420/PlayGround). [Remix this project](https://omgithub.com/?remix=stumpy420%2FPlayGround).
