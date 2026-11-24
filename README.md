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

Alongside **Free Hunt**, the game includes **THE MOURNING CHOIR**, a five-operation story campaign
with radio drama, authored objectives, scripted ambushes, boss fights, and two endings. You are
the last copy of Dr. Mara Voss. MOTH brought you back; the Warden remembers what you did; the
forty thousand names in the Ether-Core are still singing.

This is a self-contained Three.js prototype with no build step and no runtime network calls.

### Run it

```bash
# from this directory, using any static file server
python3 -m http.server 3002
# then open http://localhost:3002
```

In the OMGithub playground, `./start.sh` serves the same static site.

### THE MOURNING CHOIR

Select **Start Campaign** to open the operation briefing, then **Deploy**. Free Hunt remains
available from the start screen and plays exactly like the original extraction loop.

| Op | Title | Story beat |
| --- | --- | --- |
| 01 | **Dead Letter** | Recover a courier black box that is transmitting in your own voice. |
| 02 | **The Choir Below** | Slice the relay under Refinery 09 and survive the Warden's response. |
| 03 | **Bone Orchard** | Overload three storm spires and destroy the Shepherd. |
| 04 | **The Warden's Debt** | Kill the Warden Prime and recover his confession. |
| 05 | **The Last Ascent** | Choose: upload the Choir to MOTH, or burn it and let the dead rest. |

Objectives appear in the mission panel, the active waypoint is drawn in the world, MOTH and the
Warden transmit over the radio, and boss health is shown at the top of the HUD. Hold `E` (or gamepad
`X`) near story props to recover, slice, overload, or choose. Progress is saved in `localStorage`
under `aethelgard.campaign.v1`; death or abandonment returns you to the same operation. Completing
the campaign records your ending and unlocks a replay from Operation 01.

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

### Controller

Connect a standard-mapping gamepad (Xbox, DualShock/DualSense, Switch Pro, etc.) and press any
button to link it. The HUD shows a controller badge when one is connected.

| Gamepad | Action |
| --- | --- |
| Left stick | Move (full deflection auto-sprints) |
| Right stick | Look / aim |
| `RT` | Fire |
| `LT` | Aim down sights |
| `A` | Jump / confirm |
| `B` | Reload / back |
| `X` | Interact / mine / call lift (hold) |
| `Y` / bumpers | Cycle weapons |
| `L3` | Sprint |
| D-pad left/right | Previous / next weapon |
| `VIEW` | Field manual |
| `START` | Pause / resume |

On the start screen, `A` / `START` opens the campaign briefing; `A` deploys and `B` closes it.
On the end screen, `A` / `START` continues to the next operation, retries, or returns to Sanctuary.

### Loadout

- **VK-7 "Scrapper"** — 30-round assault rifle, balanced damage and recoil.
- **VX-4 "Hornet"** — 36-round SMG, fast fire rate, wider spread.
- **C-9 "Cinder"** — 6-shell pump shotgun, eight-pellet spread and heavy recoil.

Each weapon tracks its own magazine and reserve ammo, and aims down its own sights/optic.

### Economy note

The economy is **simulated for the prototype**. Extracted Scrap and $AETHER are written to a
local wallet in `localStorage` under `aethelgard.wallet.v1`; there is no wallet connection,
token, or blockchain transaction. One Ether-Core pays out 25 $AETHER on a successful ascent.

