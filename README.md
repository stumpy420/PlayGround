# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://go.ondev.store/).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://go.ondev.store/stumpy420/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/stumpy420/PlayGround)

- 🎮 [Open the project](https://go.ondev.store/stumpy420/PlayGround).
- ✨ [Remix this project](https://go.ondev.store/stumpy420/PlayGround?remix=1).
- 💻 [Explore the source](https://github.com/stumpy420/PlayGround).
- 🛠️ [Check build runs](https://github.com/stumpy420/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/stumpy420/PlayGround/issues).
- 👤 [Explore the creator's projects](https://go.ondev.store/stumpy420).
- 🌍 [Create with OMGithub](https://go.ondev.store/).
<!-- omgithub:readme:end -->

## Bellingham Heat 3D

A rain-soaked Pacific Northwest crime game, rendered in real time with Three.js. Steal a car, move the package across the city, shake the patrols, and finish the drop before sunrise.

### Play

Open `index.html` through any static server (the project runs on port 3002). Everything is local: the engine lives in `vendor/three.module.js`, and all models, textures, audio, and UI are generated in code. No network connection is needed at runtime.

### Controls

- **Desktop:** `WASD` / arrow keys move and drive, `Space` handbrake, `E` enter or exit a car.
- **Mobile:** left pad moves and steers, `GO` / `BRAKE` / `DRIFT` drive, `CAR` enters or exits.

### Features

- Fully 3D city with wet asphalt, reflections, rain, fog, street lights, neon, a waterfront, and a lit skyline.
- Cinematic post stack: HDR bloom on lights and neon, filmic ACES tone mapping, cool-shadow grade, vignette, and subtle grain.
- On-foot exploration, parked and moving traffic, vehicle theft, chase camera, damage, and drifting.
- Four-stage mission chain with wanted levels, spawning police patrols, screens and sirens.
- HUD with cash, health, speed, wanted stars, objective distance, and a local minimap.
- Adaptive quality that drops shadows, rain, and the post stack if the frame rate falls on weaker devices.

### Files

- `index.html` - HUD, title screen, touch controls, and page styles.
- `game.js` - scene, procedural assets, and all gameplay.
- `vendor/three.module.js` - vendored Three.js module.
