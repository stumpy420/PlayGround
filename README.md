# BELLINGHAM: THE UNDERGROUND

An original, fully playable first-person open-world life sim and arcade fighting game set in a fictionalized Bellingham, Washington. Clock in, pay rent, fall in love, and try not to notice the city breathing back. Every stranger is a fighter. Every night is a round.

**18+.** Contains violence, crime, alcohol and drug themes, profanity, and psychological horror. Romance and intimacy are between consenting adults only, are non-graphic, and fade to black. There is no sexual violence or exploitation. All characters are adults. This is a work of fiction.

## Run it

No framework, no build step. The game is static HTML/CSS/JS with a locally vendored Three.js and local fonts.

```bash
python3 -m http.server 8123
```

Then open <http://127.0.0.1:8123/>. A modern desktop or mobile browser with WebGL is required.

On the hosted runtime, `start.sh` serves the project automatically.

## Controls

### On foot (keyboard + mouse)

| Input | Action |
| --- | --- |
| `W A S D` | Move |
| Mouse | Look |
| `Shift` | Sprint |
| `Ctrl` | Crouch |
| `Space` | Jump |
| `E` | Interact / talk |
| `Tab` | Phone |
| `M` | Map |
| `Esc` | Pause / close |

### Fighting

| Input | Action |
| --- | --- |
| `LMB` / `J` | Punch |
| `RMB` / `K` | Kick |
| `Q` | Block (hold) |
| `Space` | Dodge |
| `E` | Grapple |
| `R` | Special |
| `F` | Environmental attack |
| `C` | Finisher (when the meter is ready) |

### Driving

| Input | Action |
| --- | --- |
| `W` / `S` | Throttle / brake-reverse |
| `A` / `D` | Steer |
| `F` | Exit the car |

### Touch

Phones and tablets get a virtual stick, a look area, and context buttons for interact, jump, phone, sprint, and the full fight set (punch, kick, block, dodge, special). Touch controls respect safe areas and disable page gestures over the game surface.

## What is in the game

- **A living city.** Downtown, Fairhaven, Boulevard Park, the waterfront, WWU, Whatcom Falls, Lake Whatcom, Chuckanut, the marina, industrial lots, trails, and Mount Baker on the horizon. Rain, fog, storms, wet streets, traffic, pedestrians, wildlife, and a day/night cycle.
- **A life sim.** Jobs and shifts, rent and home ownership, food and cooking, sleep, hygiene, mood, gym training, bars, cafés, clubs, dating, relationships, clothing, hair, tattoos, vehicles, skills, reputation ranks, quests, and saving/loading.
- **A fighting game.** Ten named bosses, each with their own style and AI. Punch, kick, block, dodge, counter, grapple, combo, specials, environmental attacks, stamina, health, special meters, slow-motion finishers, and learnable fighting styles.
- **A story that starts normal.** The first shift is just a shift. Then the transit board flickers, a bus takes a road that was always there, and the city begins to stutter. The underground tournament is only the first layer.
- **The ten names:** THE BARISTA, THE FERRYMAN, THE HIKER, THE MECHANIC, THE STUDENT, THE OLD MAN AT THE PARK, THE RAINCOAT, THE MAYOR, THE MIRROR, and THE FUTURE PLAYER.
- **Hundreds of encounters.** 24 authored random events plus 480 procedurally generated street encounters, scaled by how much the simulation is glitching.
- **Artifacts, secrets, and alternate realities.** The brass token, the raincoat button, the mirror shard, the cassette. The Quiet Table. The thin door into the version of Bellingham that watches this one.
- **Five endings.** Escape, become champion, shut it down, take control, or stay. Requirements are tracked in the phone's journal. You can also ignore the tournament and live normally for as long as you like.

## Project layout

```text
index.html          DOM shell, HUD, menus, touch controls
styles.css          all layout and visual styling
src/main.js         orchestrator: state, story, jobs, phone, endings, input
src/world.js        procedural city, weather, arena, interactables
src/player.js       first-person movement, collision, driving, arms
src/npcs.js         NPC models, schedules, memory, ambient crowds
src/combat.js       fight loop, boss AI, meters, effects
src/ui.js           HUD, panels, dialogue, modal, map, combat UI
src/audio.js        procedural Web Audio music, rain, and SFX
src/data.js         characters, bosses, items, quests, events, styles
vendor/             local Three.js runtime
fonts/              local display and text fonts
```

Saves use `localStorage` under `bellingham_underground_save_v3`. The pause menu can erase a save.

## Notes

- All characters, businesses, art, music, dialogue, and events are original.
- The city is a fictionalized version of Bellingham, not a map of the real place.
- Built with Three.js (MIT) and locally bundled fonts. See the font licenses in `fonts/` and the vendored Three.js license in `vendor/`.

---

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
