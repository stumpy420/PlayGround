# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/stumpy420/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/stumpy420/PlayGround)

- 🎮 [Open the project](https://omgithub.com/stumpy420/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=stumpy420%2FPlayGround).
- 💻 [Explore the source](https://github.com/stumpy420/PlayGround).
- 🛠️ [Check build runs](https://github.com/stumpy420/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/stumpy420/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/stumpy420).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

## AETHELGARD // Ether-Core Extraction

A playable first-person extraction slice set in the badlands of Aethelgard. Cross the dunes,
crack supply caches, mine glowing Ether-Core, put down rogue drones, and hold Lift 04 long
enough to bank your haul. Die — or abandon the run — and the wasteland keeps the cargo.

This is a self-contained Three.js prototype with no build step and no runtime network calls.

### Run it

```bash
# from this directory, using any static file server
python3 -m http.server 3002
# then open http://localhost:3002
```

In the OMGithub playground, `./start.sh` serves the same static site.

### Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move |
| `Shift` | Sprint (drains stamina) |
| `Space` | Jump |
| `Left mouse` | Fire (full-auto / pump) |
| `Right mouse` | Aim down sights |
| `1` `2` `3` | Equip VK-7 rifle, VX-4 SMG, or C-9 shotgun |
| `Q` | Cycle weapons |
| `R` | Reload |
| `E` | Interact / mine / call lift |
| `Esc` | Pause |
| `Touch` | On-screen stick, fire, reload and use buttons |

### Loadout

- **VK-7 "Scrapper"** — 30-round assault rifle, balanced damage and recoil.
- **VX-4 "Hornet"** — 36-round SMG, fast fire rate, wider spread.
- **C-9 "Cinder"** — 6-shell pump shotgun, eight-pellet spread and heavy recoil.

Each weapon tracks its own magazine and reserve ammo, and aims down its own sights/optic.

### Economy note

The economy is **simulated for the prototype**. Extracted Scrap and $AETHER are written to a
local wallet in `localStorage` under `aethelgard.wallet.v1`; there is no wallet connection,
token, or blockchain transaction. One Ether-Core pays out 25 $AETHER on a successful ascent.

