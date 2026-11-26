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

## Vanguard Ballistics — Tactical Operations

A first-person tactical shooter with simulated ballistics, penetrable cover,
six campaign operations, and an endless skirmish mode. It runs entirely in the
browser with no build step.

### Run locally

```bash
python3 -m http.server 4173
# open http://127.0.0.1:4173/
```

Opening `index.html` directly also works, but service-worker/offline support
requires HTTP or HTTPS.

### Controls

| Action | Desktop | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | `WASD` / arrows | Left stick | Left stick |
| Look | Mouse (click to lock) | Right stick | Right stick |
| Fire | Left mouse button | Hold **FIRE** | RT / RB |
| Aim / scope | Right mouse button | **AIM** toggle | LT |
| Reload | `R` | Reload button | X |
| Frag | `G` | Frag button | B |
| Dash | `Space` | Dash button | A |
| Swap weapon | `1` / `2` | Swap button | Y |
| Tactical Focus | `Q` | Focus button | LB |
| Pause | `Esc` | Pause button | Start |

Touch layouts adapt to landscape and portrait, including safe-area insets.
Gamepad support uses the standard mapping.

### Progression

Completing an operation unlocks the next one and awards credits for weapons and
field modifications. Clearing all six unlocks endless skirmish. Progress is
stored locally under `vanguard.ballistics.save.v2`; **Options → Reset** clears it.

### Weapon data

The full balance table, unit conventions, corrections, and design notes are in
[`docs/WEAPONS.md`](docs/WEAPONS.md). The live values are in `js/content.js`.

### Install / offline

The web manifest and service worker provide an installable PWA with an offline
app shell. Android packaging lives in [`android/`](android/README.md); host,
path, icon, and signing values are synchronized with
`node android/scripts/configure-twa.mjs`.

