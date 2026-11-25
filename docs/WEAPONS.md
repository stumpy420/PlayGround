# Vanguard Ballistics — Weapon Data Review

## Scope and conventions

I reviewed the live weapon table in `js/content.js` — the only weapon data in the
project — plus the ballistics code that consumes it. The table covers five
purchasable primaries and one always-available sidearm.

All values use the game's existing units:

| Term | Meaning |
| --- | --- |
| Damage | Per projectile, before armor, headshot, and range falloff. |
| Rate of Fire | Cyclic rounds per minute. |
| Accuracy | Maximum deviation from aim in degrees (±); lower is better. |
| Range | Distance in world units where falloff reaches its floor; 1 tile = 40 units. |
| Velocity | Projectile speed in world units per second, not real-world m/s. |
| Penetration | Tier 0–3. Higher tiers defeat harder cover. |
| Recoil | Camera-kick and heat multiplier; higher is worse. |
| Bars | 0–100 UI ratings derived from the same formulas for every weapon. |

The map is 2,000 × 1,360 units, so the in-game ranges are deliberately
compressed. Real-world effective ranges are noted only where they explain a
correction.

---

## Corrected weapon entries

### 1. VECTOR GEN II

| Field | Value |
| --- | --- |
| **Name** | VECTOR GEN II |
| **Type** | Submachine gun (SMG) |
| **Caliber** | 9×19mm |
| **Damage** | 12 per round |
| **Rate of Fire** | 900 RPM, full-auto |
| **Accuracy** | 3.5° (±), 61/100 |
| **Range** | 650 units; falloff starts at 250, floor 55% |
| **Magazine** | 33 rounds, 198 reserve (6 magazines) |
| **Reload** | 1.45 s |
| **Penetration** | Tier 1 |
| **Special Attributes** | Highest cyclic rate; light recoil (1.05); fast handling. |
| **Description** | Compact 9×19mm submachine gun. High cyclic rate and fast handling dominate close quarters, but energy falls off quickly. |

**Corrections**

- **Renamed “MK4 VECTOR” to “VECTOR GEN II.”** “MK4” is not a factory Vector designation; Gen II identifies the real KRISS Vector generation without inventing a variant.
- **Magazine 32 → 33; reserve 224 → 198.** The 9×19mm Vector uses 17- or 33-round magazines, and six 33-round magazines give the cleaner reserve figure of 198.
- **Added caliber, fire mode, effective range, and falloff.** The original entry had no caliber or range data, so its “close-quarters” role could not be verified in play.
- **Rebalanced bars to 24/100/61/36.** The old 28/92/58/42 ratings did not correspond to 12 damage, 900 RPM, 3.5° spread, or any range value; the new bars use the shared formulas.

### 2. SENTINEL AR

| Field | Value |
| --- | --- |
| **Name** | SENTINEL AR |
| **Type** | Assault rifle |
| **Caliber** | 5.56×45mm |
| **Damage** | 19 per round |
| **Rate of Fire** | 640 RPM, full-auto |
| **Accuracy** | 2.15° (±), 76/100 |
| **Range** | 1,200 units; falloff starts at 500, floor 72% |
| **Magazine** | 30 rounds, 210 reserve (7 magazines) |
| **Reload** | 1.9 s |
| **Penetration** | Tier 2 |
| **Special Attributes** | Balanced damage, reach, and control; the general-purpose benchmark. |
| **Description** | Standard-issue 5.56×45mm assault rifle. Balanced damage, reach, and control for most engagements. |

**Corrections**

- **Renamed “AR-9 SENTINEL” to “SENTINEL AR” and specified 5.56×45mm.** “AR-9” denotes a 9mm AR-pattern carbine, but the entry’s 19 damage, 1,560 velocity, and tier-2 penetration are 5.56-class values; the name and ballistics contradicted each other.
- **Kept the 30-round magazine and 640 RPM.** These are credible for a 5.56 assault rifle and preserve the weapon’s intended balanced role.
- **Added range and falloff.** The rifle now keeps 72% of its damage at 1,200 units, giving it a clear reach advantage over the SMG without making it a DMR.
- **Rebalanced bars to 38/71/76/67.** The previous 52/68/74/72 overrated per-shot damage relative to the DMR and shotgun and did not match the other ratings.

### 3. BREACHER-12

| Field | Value |
| --- | --- |
| **Name** | BREACHER-12 |
| **Type** | Shotgun |
| **Caliber** | 12 gauge, 00 buckshot |
| **Damage** | 10 × 8 pellets (80 per shell at point-blank) |
| **Rate of Fire** | 95 RPM, semi-auto |
| **Accuracy** | 8.5° (±), 6/100 |
| **Range** | 400 units; falloff starts at 120, floor 25% |
| **Magazine** | 7 shells, 56 reserve (8 tubes) |
| **Reload** | 3.2 s |
| **Penetration** | Tier 0 |
| **Special Attributes** | Eight-pellet spread; highest burst damage; cannot penetrate cover. |
| **Description** | 12-gauge, eight-pellet breaching shotgun. Devastating at point-blank range; spread and energy loss make it ineffective at distance. |

**Corrections**

- **Reduced price 1,150 → 1,050 CR.** The shotgun has lower sustained DPS and far shorter range than the 900 CR rifle, so the old price made it a strict downgrade for most players.
- **Reload 2.4 → 3.2 s.** A seven-shell tube reload in 2.4 seconds is unrealistically fast; 3.2 seconds is a better abstraction of shell-by-shell loading without changing the magazine model.
- **Added 12-gauge/00-buck caliber and explicit falloff.** Eight pellets is valid for reduced-recoil 00 buck, and the new 400-unit falloff finally models the description’s “ineffective at distance.”
- **Rebalanced bars to 100/11/6/22.** The old 88 damage bar understated the 80-point point-blank burst, while 30 accuracy overstated a 8.5° spread; the new values are consistent with the formulas.

### 4. LONGBOW MK7

| Field | Value |
| --- | --- |
| **Name** | LONGBOW MK7 |
| **Type** | Designated marksman rifle (DMR) |
| **Caliber** | 7.62×51mm |
| **Damage** | 48 per round |
| **Rate of Fire** | 190 RPM, semi-auto |
| **Accuracy** | 0.7° (±), 92/100 |
| **Range** | 1,800 units; falloff starts at 800, floor 85% |
| **Magazine** | 20 rounds, 100 reserve (5 magazines) |
| **Reload** | 2.4 s |
| **Penetration** | Tier 3 |
| **Special Attributes** | Highest accuracy and penetration; slowest follow-up shot among rifles. |
| **Description** | 7.62×51mm designated marksman rifle. High velocity and penetration reward precise fire at long range. |

**Corrections**

- **Renamed “LONGBOW DMR” to “LONGBOW MK7” and changed class MARKSMAN → DMR.** “DMR” is a weapon type and “MARKSMAN” is a role, so the old name repeated the class and mislabeled the platform.
- **Magazine 12 → 20; reserve 96 → 100.** Mainstream 7.62 DMRs use 20-round magazines; 12 rounds was closer to a hunting rifle and punished the weapon’s sustained-engagement role.
- **Reload 2.2 → 2.4 s.** The slightly longer reload offsets the larger magazine and keeps the DMR’s uptime in line with its damage.
- **Added 7.62×51mm, range, and falloff.** The new 85% floor at 1,800 units preserves the DMR’s long-range identity while still making extreme distance matter.
- **Rebalanced bars to 96/21/92/100.** The old 30 rate bar overstated a 190 RPM rifle, and the 94 accuracy bar was inconsistent with the new shared accuracy scale.

### 5. M249 BASTION

| Field | Value |
| --- | --- |
| **Name** | M249 BASTION |
| **Type** | Light machine gun (LMG) |
| **Caliber** | 5.56×45mm |
| **Damage** | 15 per round |
| **Rate of Fire** | 760 RPM, full-auto |
| **Accuracy** | 4.4° (±), 51/100 |
| **Range** | 1,100 units; falloff starts at 450, floor 70% |
| **Magazine** | 100 rounds, 400 reserve (4 belts) |
| **Reload** | 4.0 s |
| **Penetration** | Tier 2 |
| **Special Attributes** | Deep belt, sustained fire, long reload; poor snap accuracy. |
| **Description** | 5.56×45mm belt-fed light machine gun. Deep magazine and sustained output; the long reload punishes poor positioning. |

**Corrections**

- **Magazine 80 → 100; reserve 400 retained.** The M249 feeds from 100- or 200-round belts, not an 80-round box; 100 rounds preserves four full belts in reserve.
- **Reload 3.6 → 4.0 s.** A belt change is slower than a box-magazine reload; four seconds better reflects the weapon’s sustained-fire tradeoff.
- **Specified 5.56×45mm and added range/falloff.** The original “belt-fed” description omitted the caliber, and the LMG now loses 30% damage at its 1,100-unit falloff floor.
- **Rebalanced bars to 30/84/51/61.** The old 46 damage bar overstated a 15-damage round; the new ratings correctly show high rate and range but low per-shot damage and accuracy.

### 6. VX-9

| Field | Value |
| --- | --- |
| **Name** | VX-9 |
| **Type** | Service pistol |
| **Caliber** | 9×19mm |
| **Damage** | 17 per round |
| **Rate of Fire** | 380 RPM, semi-auto |
| **Accuracy** | 2.2° (±), 76/100 |
| **Range** | 600 units; falloff starts at 220, floor 55% |
| **Magazine** | 15 rounds, 90 reserve (6 magazines) |
| **Reload** | 1.25 s |
| **Penetration** | Tier 1 |
| **Special Attributes** | Fast reload, always available, cheap reserve ammunition. |
| **Description** | 9×19mm service pistol. Fast handling and a reliable reserve make it a dependable backup. |

**Corrections**

- **Renamed “VX-9 SIDEARM” to “VX-9.”** “Sidearm” duplicates the PISTOL class and adds no information; the model name is sufficient.
- **Magazine 14 → 15; reserve 84 → 90.** Fifteen rounds is the standard capacity for a full-size 9mm service pistol, and six magazines give 90 reserve rounds.
- **Added caliber, mode, range, and falloff.** The sidearm previously had no range or caliber data, which made its backup role impossible to compare with the SMG.
- **Added bars (34/42/76/33).** The sidearm is not shown in the armory, but giving it the same rating set keeps the data model consistent if it is ever displayed.

---

## Balance summary

Sustained damage assumes every projectile hits and ignores armor, headshots, and
falloff:

| Weapon | Damage per shot | Sustained DPS | Shots to kill a 54 HP grunt | Intended role |
| --- | ---: | ---: | ---: | --- |
| VECTOR GEN II | 12 | 180 | 5 | Free starter; close-quarters rush |
| SENTINEL AR | 19 | 203 | 3 | General-purpose benchmark |
| BREACHER-12 | 80 (8 pellets) | 127 | 1 | Point-blank breaching |
| LONGBOW MK7 | 48 | 152 | 2 | Long-range precision |
| M249 BASTION | 15 | 190 | 4 | Sustained suppression |
| VX-9 | 17 | 108 | 4 | Backup / emergency |

The resulting curve is coherent:

- The **rifle** has the best sustained DPS and the best all-round range, so it is
  the correct 900 CR baseline.
- The **SMG** trades range and per-shot damage for a free price, the highest
  cyclic rate, and the lightest recoil.
- The **shotgun** has the highest burst damage and the lowest sustained DPS; its
  new 400-unit falloff and 1,050 CR price make that tradeoff explicit.
- The **DMR** has the lowest DPS among the rifles but the best accuracy,
  penetration, and range retention; it rewards precision rather than spray.
- The **LMG** has rifle-class DPS with a 100-round belt and a four-second reload;
  it is correctly the most expensive primary.
- The **pistol** is weaker than every primary in DPS but has the fastest reload
  and a deep reserve, which is appropriate for a backup.

---

## Overall adjustments

1. **Standardized weapon types.** `MARKSMAN` became `DMR`, and names no longer
   repeat their class (“LONGBOW DMR,” “VX-9 SIDEARM”).
2. **Corrected caliber/name contradictions.** The AR-9 was a 9mm designation on
   5.56-class stats; it is now the 5.56mm SENTINEL AR. The Vector and M249 now
   carry their correct calibers.
3. **Corrected magazine and reload data.** 33-round Vector, 20-round DMR,
   100-round M249 belt, 15-round pistol, and a realistic tube reload for the
   shotgun.
4. **Added missing stats.** Caliber, fire mode, effective range, falloff start,
   falloff floor, and a documented penetration tier now exist for every weapon.
5. **Made the bars data-driven.** Damage, rate, accuracy, and range ratings now
   come from the same formulas for all six weapons instead of hand-tuned values
   that contradicted the underlying stats.
6. **Fixed the range mechanic.** Player bullets previously gained damage with
   distance (`1 + traveled / 5000`), which contradicted the manual’s claim that
   rounds “lose energy.” Damage now falls toward each weapon’s range floor.
7. **Surfaced the data in the armory.** The platform detail panel now shows
   caliber, fire mode, effective range, and penetration tier.

---

## Recommendations for further refinement

1. **Cap AP penetration.** The DMR already penetrates concrete at tier 3; AP
   Rounds push it to tier 4, which can trivialize the map’s hardest cover. Cap
   AP at tier 3 or raise the concrete threshold to 4.
2. **Give the suppressor a tradeoff.** It currently reduces alert radius with no
   cost. A small damage reduction (about 5%) or added spread would keep stealth
   from being a strictly better choice.
3. **Replace random headshots.** The current 10% random headshot chance rewards
   luck rather than aim. Use a hit-zone check or a weapon-specific headshot
   multiplier instead.
4. **Model shotgun reloads per shell.** The 3.2-second full-tube reload is a
   reasonable abstraction, but shell-by-shell loading would make the shotgun’s
   risk/reward clearer.
5. **Review LMG ammo economy in endless mode.** A 100-round belt plus 400 reserve
   is a very large damage pool; watch wave clears for ammo starvation or
   trivialization before changing it further.
6. **Add a handling/swap stat.** The SMG and pistol are described as fast-handling
   but use the same fixed swap time as the LMG. A per-weapon swap or ADS speed
   would make that distinction real.
7. **Document units in the UI.** “Range 650 u” is precise for designers but opaque
   to players; consider showing a relative bar or a meters-equivalent tooltip.
8. **Add recoil patterns.** A single recoil multiplier cannot distinguish a
   controllable rifle from a jumpy LMG; per-weapon horizontal/vertical curves
   would improve feel without changing the table’s top-level numbers.
