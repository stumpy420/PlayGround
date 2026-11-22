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

---

## SENTINEL PROTOCOL

A browser-native 5v5 tactical FPS built with Three.js. The vertical slice includes three modes (Team Deathmatch, Domination, Blackout), bot AI, a Neon Harbor arena, loadout/camos, battle pass, armory, wallet, match rewards, and Android touch + gamepad controls.

### Run locally

```bash
PORT=3002 bash start.sh
# or any static server:
python3 -m http.server 3002
# open http://localhost:3002/
```

Deep links for capture/QA:

- `/?screen=store`, `/?screen=wallet`, `/?screen=loadout`, `/?screen=dossier`
- `/?play=tdm`, `/?play=dom`, `/?play=blackout` (add `&autofire=1` for a hands-free combat check)

### Controls

- **Desktop:** WASD move, mouse look, LMB fire, RMB aim, R reload, Space jump, Ctrl/C crouch-slide, Shift sprint, G frag, V melee, Q swap, Esc pause.
- **Android:** dual-stick touch controls, auto-fire, aim assist, safe-area layout, and a landscape recommendation.
- **Controller:** standard-mapping gamepad — left stick move, right stick look, RT fire, LT aim, A jump, B crouch/slide, X reload, Y swap, LB melee, RB frag, START pause. Menus navigate with the D-pad or left stick; A confirms and B goes back. Controller aim sensitivity is adjustable in Settings.

### Demo boundaries

- Bots simulate the opposing team; there is no real multiplayer server.
- Stripe checkout is a UI demo and never transmits card data.
- $SRN balances and settlement are stored locally and simulated. `js/web3.js` contains an optional ethers.js Polygon wallet/ERC-20 bridge, disabled by default.
- The design dossier is in [`DESIGN.md`](./DESIGN.md) and is rendered in-game under **DOSSIER**.

