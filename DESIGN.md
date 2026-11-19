# SENTINEL PROTOCOL — GAME DESIGN DOCUMENT

**Version 1.0 · Confidential · Blacksite Operations**
Prepared for studio leadership, publishing partners, and live-ops.

> **Build status:** This repository contains a complete, browser-playable vertical slice. Matchmaking is simulated with AI bots, payments run in demo mode, and all $SRN settlement is local and simulated. No real money is charged and no on-chain transaction is broadcast.

---

## 1. Executive Summary & Product Vision

**SENTINEL PROTOCOL** is a free-to-play, browser-native 5v5 tactical first-person shooter built for instant play on desktop and Android. It combines short, high-lethality matches with a persistent operator loadout, a seasonal battle pass, and optional cryptocurrency-denominated match rewards.

### 1.1 Vision statement
> "A tactical FPS you can open in a tab, master over a season, and own your loadout in."

### 1.2 Product pillars
| Pillar | What it means in the build |
| --- | --- |
| **Zero-friction access** | One URL, no install, no launcher. WebGL2 + ES modules. |
| **Tactical, not twitchy** | 5v5 objective play, movement acceleration, recoil, ADS, slide, stamina. |
| **Every match pays** | Match performance converts into credits and a simulated $SRN reward. |
| **Operator ownership** | Cosmetics, camos, and loadout choices persist locally and are wallet-linked. |
| **Mobile parity** | Dual-stick touch controls, auto-fire, aim assist, safe-area layout, portrait guard. |

### 1.3 Target audience
- **Primary:** 16–34 competitive FPS players on mid-range Android devices and laptops.
- **Secondary:** Web3-curious players who value transparent, performance-based rewards.
- **Tertiary:** Content creators who need instant, linkable gameplay without downloads.

### 1.4 Session targets
| Metric | Target |
| --- | --- |
| Time to first match | < 15 seconds |
| Match length | 5–8 minutes |
| First-session retention | > 40% reach match 2 |
| D7 retention | > 18% |
| Average session | 3–5 matches |
| Crash-free sessions | > 99.5% |

### 1.5 Scope of this vertical slice
**Included:** three modes (TDM, Domination, Blackout), procedural Neon Harbor map, bot AI with navigation and combat, full HUD, loadout, armory, wallet, battle pass, dossier, settings, touch controls, match summary, and simulated checkout.

**Explicitly out of scope for this build:** real multiplayer networking, server-authoritative hit registration, real Stripe charges, real token custody or transfers, anti-cheat enforcement, and account recovery.

---

## 2. Core Gameplay & Match Design

### 2.1 Match structure
1. **Queue / deploy** — player selects an operation from the main menu.
2. **Countdown** — 3-second deploy sequence, loadout applied, bots spawned.
3. **Live match** — 5–8 minutes, score or timer victory condition.
4. **Summary** — performance breakdown, credits, $SRN estimate, battle-pass XP.
5. **Requeue** — return to HQ or deploy again with persistent progression.

### 2.2 Modes
| Mode | Teams | Win condition | Respawn | Design intent |
| --- | --- | --- | --- | --- |
| **Team Deathmatch** | 5v5 | First to 60 eliminations or highest score at 6:00 | 4s | Pure gunplay, fastest onboarding |
| **Domination** | 5v5 | First to 250 points via three control points | 5s | Map control, rotations, team play |
| **Blackout** | Free-for-all | Last operator standing as the zone collapses | None | High tension, reward multiplier |

### 2.3 Combat model
- **Weapons:** assault rifle, SMG, shotgun, marksman rifle, sniper rifle, pistol. Each has distinct damage, RPM, magazine, reserve, reload, ADS FOV, movement multiplier, and range falloff.
- **Damage:** head multiplier, limb reduction, distance falloff, and per-weapon pellet count for shotguns.
- **TTK target:** 250–450 ms in optimal range; 500–800 ms at falloff. Designed so reaction, cover, and aim matter more than tracking stamina.
- **Movement:** walk, sprint (stamina-limited), crouch, slide, jump, and acceleration-based strafing. No wall-running or double jump.
- **Aim:** hip-fire bloom, ADS stabilization, per-weapon recoil pattern, hit markers, and controller/touch aim assist.
- **Utility:** frag grenade with fuse and radial damage; melee with short lunge.
- **Health:** 100 base plus operator armor; delayed regeneration after 5.5 seconds out of damage.

### 2.4 Controls
| Action | Desktop | Android |
| --- | --- | --- |
| Move | WASD | Left virtual stick |
| Look | Mouse | Right drag zone |
| Fire | Left mouse | FIRE button |
| Aim | Right mouse | ADS toggle/button |
| Reload | R | RELOAD button |
| Jump | Space | JUMP button |
| Crouch / slide | Ctrl / C | CROUCH button |
| Sprint | Shift | Stick pushed to edge |
| Grenade | G | FRAG button |
| Melee | V | MELEE button |
| Swap weapon | Q / wheel | SWAP button |
| Pause | Esc | Pause icon |

### 2.5 Bot AI
Bots use a lightweight tactical model:
- **Perception:** view cone, line-of-sight raycasts, distance falloff, and short-term target memory.
- **Navigation:** waypoint graph with obstacle avoidance and strafing during engagement.
- **Combat:** burst fire with skill-scaled accuracy, reaction delay, recoil, reload discipline, and grenade use.
- **Team behavior:** role assignment, objective attraction in Domination, and zone avoidance in Blackout.
- **Difficulty:** Recruit, Regular, Veteran, Elite — tuning accuracy, reaction time, and aggression.

Bots are intentionally readable: they call out contacts, take cover, and disengage at low health. The goal is a convincing co-op/competitive simulation without pretending to be human players.

### 2.6 Difficulty and accessibility
- Four difficulty presets.
- FOV slider, sensitivity, invert-Y, master/SFX volume.
- Colorblind-safe team palette (cyan vs. coral) in addition to hue.
- Reduced-motion option: disables bloom, screen shake, and camera bob.
- Touch layout with safe-area insets and a portrait-orientation guard.
- Subtitles-style kill feed and objective banners.

---

## 3. World, Art Direction & Audio

### 3.1 Setting — Neon Harbor
A rain-slick container terminal at the edge of a megacity. The map is a compact three-lane arena with a central drop-pod beacon, stacked cargo containers, service buildings, catwalks, and a distant skyline. Sightlines are intentionally broken by cover to support close-to-mid-range engagements.

### 3.2 Map layout
| Zone | Purpose | Landmarks |
| --- | --- | --- |
| **North Yard** | Long-range duels | Gantry crane, stacked containers |
| **Central Pad** | Contested power position | Drop-pod beacon, holographic beam |
| **South Docks** | Flank route | Warehouse, loading bay |
| **East Rail** | Verticality | Catwalk, freight cars |
| **West Gate** | Spawn protection | Checkpoint, blast barriers |

### 3.3 Art direction
- **Palette:** deep teal shadows, sodium-orange sunset, cyan holograms, coral enemy accents.
- **Materials:** wet concrete, painted steel, rust, emissive signage, volumetric fog.
- **Silhouette rule:** friendly operators read cool/cyan; hostile operators read warm/coral.
- **UI language:** military telemetry meets neon terminal — condensed display type, thin rules, scanlines, corner brackets.
- **Performance:** procedural geometry and instancing-friendly modules; no external texture downloads.

### 3.4 Audio direction
- Layered weapon reports with distance filtering.
- Distinct footstep surfaces (concrete, metal, water).
- UI clicks, confirmations, and reward stings.
- Ambient harbor bed: wind, gulls, distant machinery, low synth pulse.
- Dynamic mix ducks music during combat and raises objective callouts.

### 3.5 Presentation
- Boot sequence with uplink telemetry.
- Cinematic menu camera orbiting the harbor.
- Match countdown, kill feed, streak banners, hit markers, damage direction arcs.
- Post-match summary with animated reward tally.
- Bloom, tone mapping, fog, and emissive accents tuned for a moody but readable image.

---

## 4. Progression, Economy & Monetization

### 4.1 Player progression
- **Level:** account XP from matches, eliminations, objectives, and wins.
- **Battle pass:** 50 tiers per season; free and premium tracks; XP per tier.
- **Challenges:** daily and weekly objectives (planned; hooks present).
- **Operator mastery:** per-operator playtime and elimination tracking (planned).

### 4.2 Currencies
| Currency | Source | Sink | Notes |
| --- | --- | --- | --- |
| **Credits (◈)** | Matches, pass, challenges | Cosmetics, camos, operators | Soft currency, non-tradeable |
| **$SRN** | Performance-based match rewards | Premium cosmetics, pass | Simulated ERC-20 on Polygon |
| **USD** | Stripe checkout (demo) | Credit packs, premium pass | No real charge in this build |

### 4.3 Match rewards
Rewards scale with:
- Eliminations, assists, headshots, and damage.
- Objective captures, defends, and time on point.
- Win bonus, streak bonus, and mode multiplier.
- Blackout placement multiplier.

The reward formula is capped per match to protect the economy and is displayed transparently in the summary.

### 4.4 Store & battle pass
- **Armory tabs:** Featured, Operators, Weapons, Camos, Bundles.
- **Rarities:** Standard, Rare, Epic, Legendary with distinct card treatments.
- **Bundles:** curated cosmetics with a discount badge.
- **Battle pass:** free track plus premium unlock; tier rewards preview.
- **Checkout:** card form validation and order summary. In demo mode, no card data leaves the browser and no charge is created.

### 4.5 $SRN token design (proposed)
| Property | Value |
| --- | --- |
| Standard | ERC-20 |
| Network | Polygon PoS |
| Symbol | $SRN |
| Supply | Fixed, treasury-managed |
| Custody | Non-custodial player wallet |
| Settlement | Batched, server-signed claims |
| Eligibility | KYC/AML where required by jurisdiction |

**Reward pipeline (production):**
1. Match service validates the result server-side.
2. Reward engine computes the payout and writes an append-only ledger entry.
3. Settlement service batches claims and signs a Merkle root.
4. Player claims from the wallet screen; the contract verifies the proof.
5. Treasury reconciles daily; suspicious accounts are frozen pending review.

| **Demo implementation:** the wallet address is generated locally, balances are persisted in `localStorage`, and settlement creates a simulated transaction hash. No private keys, RPC calls, or token transfers are performed. The optional `js/web3.js` bridge vendors ethers.js and can connect an injected EVM wallet, switch to Polygon, and read a live ERC-20 balance once a token address is configured; it remains disabled in this build. |

### 4.6 Monetization principles
- Cosmetics only; no pay-to-win weapons or power.
- Published odds for any randomized content.
- Regional pricing and spend limits.
- Clear separation between soft currency, premium currency, and crypto rewards.
- Refund and chargeback policy aligned with platform rules.

### 4.7 Payments (Stripe)
The client implements a checkout UI and order state machine. Production requires:
- Server-created Stripe Checkout Sessions.
- Webhook verification and idempotent fulfillment.
- Tax handling and receipts.
- Fraud screening and velocity limits.

Until a backend exists, checkout is explicitly labeled **DEMO** and never transmits card data.

---

## 5. Technical Architecture & Android Delivery

### 5.1 Stack
| Layer | Technology |
| --- | --- |
| Rendering | Three.js (WebGL2), custom post-processing (bloom, output pass) |
| Language | Modern JavaScript ES modules |
| UI | Semantic HTML + CSS custom properties |
| Persistence | `localStorage` with schema versioning |
| Wallet bridge | ethers.js (vendored UMD, loaded on demand) |
| Audio | Web Audio API synthesis |
| Build | Static files; no bundler required |
| Hosting | Any static host / CDN |

### 5.2 Module map
| Module | Responsibility |
| --- | --- |
| `js/main.js` | Bootstrap, fatal error surface, deep-link/capture hooks |
| `js/game.js` | Renderer, composer, match loop, modes, scoring, rewards |
| `js/world.js` | Procedural Neon Harbor geometry, lighting, fog, props |
| `js/player.js` | Movement, camera, weapons, recoil, health, viewmodel |
| `js/bots.js` | Bot spawning, perception, navigation, combat, hitboxes |
| `js/weapons.js` | First-person weapon models and materials |
| `js/effects.js` | Tracers, impacts, muzzle flashes, explosions, decals |
| `js/audio.js` | Procedural SFX and ambient mix |
| `js/ui.js` | Menus, HUD, store, wallet, dossier, summary, settings |
| `js/economy.js` | Profile, rewards, pass, store, Stripe demo, wallet demo |
| `js/web3.js` | Optional ethers.js Polygon wallet connect / ERC-20 read bridge |
| `js/config.js` | Weapons, operators, skins, modes, spawns, catalog |
| `js/util.js` | Math, damping, raycasts, formatting, RNG |
| `css/style.css` | Responsive visual system and touch layout |

### 5.3 Frame budget (60 fps target)
| System | Budget |
| --- | --- |
| Render + post | 8–11 ms |
| Player + weapons | 1–2 ms |
| Bots (10) | 2–3 ms |
| World + effects | 2–3 ms |
| UI / minimap | < 1 ms |

Quality presets scale pixel ratio, shadow resolution, bloom, fog, and bot update rate. A sustained sub-24 fps reading automatically drops to low quality with a player-facing notice.

### 5.4 Android delivery
- **Input:** touch dual-stick, configurable auto-fire, aim assist, and tap-to-ADS.
- **Layout:** safe-area insets, dynamic viewport units, orientation guard, 44 px minimum targets.
- **Performance:** capped pixel ratio, optional low-quality preset, no external asset fetch beyond vendor modules.
- **Packaging paths:** PWA install, Trusted Web Activity (TWA), or a Capacitor/WebView wrapper.
- **Offline:** menu and loadout work offline once cached; matches require only local assets.
- **Audio:** unlocked on first gesture to satisfy autoplay policies.

### 5.5 Data & persistence
Profile schema includes: callsign, level/XP, credits, $SRN, pending rewards, matches, wins, kills, deaths, equipped operator/weapon/camo, owned items, battle pass tier/premium, wallet address, settings, and recent transactions. Writes are debounced and guarded by try/catch; corrupt payloads fall back to defaults.

### 5.6 Security & anti-cheat roadmap
- Move hit validation and rewards to a server-authoritative model.
- Rate-limit reward claims and detect statistical outliers.
- Sign settlement payloads; never expose treasury keys to the client.
- Add device attestation for competitive modes.
- Sanction accounts for exploit abuse; publish an appeals process.

### 5.7 Telemetry
Planned events: session start, mode selected, match start/end, kills/deaths, objective events, frame-time buckets, store impressions, purchase funnel, wallet connect, claim result, and error boundary reports. No PII is collected in the vertical slice.

---

## 6. Production Plan, Risks & Compliance

### 6.1 Milestones
| Phase | Deliverable | Status |
| --- | --- | --- |
| **P0 — Vertical slice** | Playable browser match, bots, HUD, progression, store, wallet demo | Complete |
| **P1 — Online alpha** | Server matchmaking, authoritative movement/hits, accounts | Planned |
| **P2 — Economy beta** | Real payments, reward ledger, custody integration, KYC | Planned |
| **P3 — Android launch** | TWA/Capacitor build, store listing, device QA matrix | Planned |
| **P4 — Live season** | Seasonal content, ranked, challenges, creator tools | Planned |

### 6.2 Team shape (lean)
- 1 gameplay engineer
- 1 backend/platform engineer
- 1 technical artist
- 1 UI/UX designer
- 1 producer / live-ops
- Fractional QA, security, and legal

### 6.3 Risk register
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Mobile thermal throttling | Frame drops, churn | Quality presets, dynamic resolution, bot budget caps |
| Crypto regulatory uncertainty | Market restrictions | Jurisdiction gating, KYC/AML, non-custodial design, legal review |
| Payment fraud | Revenue loss | Stripe Radar, velocity limits, server fulfillment |
| Cheating | Competitive integrity | Server authority, telemetry, device attestation |
| Bot predictability | Poor retention | Behavior trees, skill variance, squad coordination |
| Content cadence | Engagement decay | Modular map kit, seasonal pass, community challenges |
| WebGL fragmentation | Device incompatibility | Capability detection, low-end fallback messaging |

### 6.4 Compliance checklist
- Age gate and parental controls where required.
- Loot-box odds disclosure (if randomized content ships).
- Privacy policy, terms of service, and cookie consent.
- Sanctions screening and geographic restrictions for token rewards.
- Accessibility conformance review (contrast, input remapping, motion).
- Platform billing rules for Android distribution.

### 6.5 Success metrics
- **Activation:** % of visitors who complete a match.
- **Retention:** D1/D7/D30 by cohort and device tier.
- **Engagement:** matches per session, average match completion.
- **Monetization:** conversion, ARPDAU, pass attach rate.
- **Economy health:** credit faucet/sink ratio, $SRN payout vs. treasury budget.
- **Performance:** p95 frame time, crash-free sessions, thermal throttling rate.

### 6.6 Known limitations of this build
- No real multiplayer, matchmaking service, or server authority.
- Bots are local simulations, not networked players.
- Stripe checkout is a UI demo; no charge or card transmission occurs.
- $SRN balances and settlement are simulated in `localStorage`.
- Progression is device-local; clearing storage resets the profile.
- No anti-cheat, account recovery, or moderation tooling yet.

---

*End of document. For the playable build, open the repository root through any static server and select **DEPLOY**.*
