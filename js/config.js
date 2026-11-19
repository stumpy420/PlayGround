// ============ SENTINEL PROTOCOL — TUNING & CONTENT ============

export const GAME_NAME = 'SENTINEL PROTOCOL';
export const SEASON = 'SEASON 04 · NEON HARBOR';
export const TOKEN_SYMBOL = 'SRN';
export const SRN_USD = 0.025;

export const WEAPONS = {
  ar: {
    id: 'ar', name: 'VK-7 HAVOC', type: 'ASSAULT RIFLE', slot: 'primary',
    damage: 32, headMult: 1.9, rpm: 640, mag: 30, reserve: 180, reload: 2.15,
    spread: 0.012, adsSpread: 0.0038, moveSpread: 0.030, recoil: 0.85, recoilYaw: 0.35,
    range: 70, falloff: 0.55, auto: true, pellets: 1, adsFov: 55, adsTime: 0.22,
    speedMult: 1.0, model: { len: 1.05, barrel: 0.62, mag: 0.26, stock: 0.34, sight: true }
  },
  smg: {
    id: 'smg', name: 'HORNET SMG', type: 'SUBMACHINE GUN', slot: 'primary',
    damage: 23, headMult: 1.7, rpm: 900, mag: 32, reserve: 192, reload: 1.8,
    spread: 0.016, adsSpread: 0.0062, moveSpread: 0.024, recoil: 0.6, recoilYaw: 0.42,
    range: 38, falloff: 0.45, auto: true, pellets: 1, adsFov: 62, adsTime: 0.18,
    speedMult: 1.08, model: { len: 0.78, barrel: 0.4, mag: 0.3, stock: 0.18, sight: true }
  },
  sniper: {
    id: 'sniper', name: 'LONGSHOT .50', type: 'BOLT-ACTION SNIPER', slot: 'primary',
    damage: 96, headMult: 1.6, rpm: 52, mag: 5, reserve: 30, reload: 3.3,
    spread: 0.075, adsSpread: 0.0006, moveSpread: 0.11, recoil: 2.6, recoilYaw: 0.9,
    range: 160, falloff: 0.98, auto: false, pellets: 1, adsFov: 22, adsTime: 0.34,
    speedMult: 0.94, scope: true, model: { len: 1.35, barrel: 0.95, mag: 0.16, stock: 0.5, sight: true }
  },
  shotgun: {
    id: 'shotgun', name: 'BREACHER 12', type: 'TACTICAL SHOTGUN', slot: 'primary',
    damage: 13, headMult: 1.35, rpm: 78, mag: 8, reserve: 48, reload: 3.2,
    spread: 0.068, adsSpread: 0.05, moveSpread: 0.08, recoil: 2.0, recoilYaw: 0.7,
    range: 20, falloff: 0.4, auto: false, pellets: 8, adsFov: 68, adsTime: 0.22,
    speedMult: 0.97, model: { len: 1.1, barrel: 0.72, mag: 0.1, stock: 0.36, sight: false }
  },
  pistol: {
    id: 'pistol', name: 'P-9 SIDEARM', type: 'SIDEARM', slot: 'secondary',
    damage: 27, headMult: 1.8, rpm: 380, mag: 15, reserve: 90, reload: 1.55,
    spread: 0.014, adsSpread: 0.005, moveSpread: 0.028, recoil: 0.75, recoilYaw: 0.3,
    range: 45, falloff: 0.6, auto: false, pellets: 1, adsFov: 64, adsTime: 0.16,
    speedMult: 1.05, model: { len: 0.48, barrel: 0.2, mag: 0.14, stock: 0, sight: false }
  }
};
export const PRIMARY_IDS = ['ar', 'smg', 'sniper', 'shotgun'];

export const BOT_NAMES = [
  'VIPER', 'ROOK', 'KESTREL', 'HALLOW', 'DRIFT', 'CINDER', 'NOMAD', 'ONYX',
  'TALON', 'GHOST', 'MACE', 'SABLE', 'FROST', 'ECHO', 'RIPTIDE', 'CIPHER'
];

export const SKINS = {
  camo_standard: { id: 'camo_standard', name: 'GUNMETAL', rarity: 'standard', price: 0, colors: { body: 0x272c30, accent: 0x5d6b70, metalness: 0.55, roughness: 0.42, emissive: 0x000000, emissiveIntensity: 0 }, swatch: 'linear-gradient(135deg,#3b4247,#14181b)' },
  camo_neon: { id: 'camo_neon', name: 'NEON TIDE', rarity: 'epic', price: 850, colors: { body: 0x0a2427, accent: 0x4ff5df, metalness: 0.4, roughness: 0.3, emissive: 0x17c9b8, emissiveIntensity: 1.0 }, swatch: 'linear-gradient(135deg,#0a4b4b,#4ff5df)' },
  camo_ember: { id: 'camo_ember', name: 'EMBERFALL', rarity: 'rare', price: 450, colors: { body: 0x2a1510, accent: 0xff7a2f, metalness: 0.5, roughness: 0.38, emissive: 0xff4d10, emissiveIntensity: 0.5 }, swatch: 'linear-gradient(135deg,#4a1c0d,#ff7a2f)' },
  camo_void: { id: 'camo_void', name: 'VOID CHROME', rarity: 'legendary', price: 1200, colors: { body: 0x141126, accent: 0xb18cff, metalness: 0.95, roughness: 0.14, emissive: 0x6a3cff, emissiveIntensity: 0.4 }, swatch: 'linear-gradient(135deg,#211a44,#b18cff 60%,#f2eaff)' },
  camo_frost: { id: 'camo_frost', name: 'WHITEOUT', rarity: 'rare', price: 450, colors: { body: 0xc6d5d8, accent: 0x6fb7c9, metalness: 0.35, roughness: 0.5, emissive: 0x2a6b7a, emissiveIntensity: 0.25 }, swatch: 'linear-gradient(135deg,#ecf6f7,#89b4c1)' },
  camo_aurora: { id: 'camo_aurora', name: 'AURORA', rarity: 'legendary', price: 1100, colors: { body: 0x0b241d, accent: 0x7dffb0, metalness: 0.6, roughness: 0.25, emissive: 0x2dff8b, emissiveIntensity: 0.75 }, swatch: 'linear-gradient(135deg,#073b2c,#7dffb0 55%,#4f8bff)' },
  camo_gold: { id: 'camo_gold', name: '24K', rarity: 'legendary', price: 1500, colors: { body: 0x3d2a0e, accent: 0xffd27a, metalness: 1.0, roughness: 0.2, emissive: 0x7a5310, emissiveIntensity: 0.3 }, swatch: 'linear-gradient(135deg,#8c6a20,#ffe7a8,#6b4c10)' }
};

export const OPERATORS = {
  op_standard: { id: 'op_standard', name: 'GHOST-7', role: 'VANGUARD · ASSAULT', rarity: 'standard', price: 0, accent: 0x5ce8d4, suit: 0x1b2a2e, stats: { speed: 80, armor: 65, stealth: 55, tech: 70 } },
  op_ronin: { id: 'op_ronin', name: 'RONIN', role: 'BREACHER · CQB', rarity: 'epic', price: 1400, accent: 0xff5f52, suit: 0x2a1a18, stats: { speed: 72, armor: 88, stealth: 48, tech: 62 }, armor: 15 },
  op_vanta: { id: 'op_vanta', name: 'VANTA', role: 'INFILTRATOR · RECON', rarity: 'legendary', price: 1800, accent: 0xb18cff, suit: 0x181426, stats: { speed: 92, armor: 55, stealth: 90, tech: 76 } },
  op_emissary: { id: 'op_emissary', name: 'EMISSARY', role: 'ENVOY · SUPPORT', rarity: 'legendary', price: 1800, accent: 0xffb454, suit: 0x2a2113, stats: { speed: 78, armor: 74, stealth: 62, tech: 92 } },
  op_spectre: { id: 'op_spectre', name: 'SPECTRE', role: 'PHANTOM · ASSASSIN', rarity: 'legendary', price: 0, passOnly: true, accent: 0x7dffb0, suit: 0x12241b, stats: { speed: 88, armor: 60, stealth: 94, tech: 70 } }
};

export const MODES = {
  tdm: {
    id: 'tdm', name: 'TEAM DEATHMATCH', short: 'TDM', icon: '✦',
    desc: 'First squad to 50 eliminations. Respawns enabled.',
    scoreLimit: 50, time: 360, teamSize: 4, respawn: 4, ffa: false
  },
  dom: {
    id: 'dom', name: 'DOMINATION', short: 'DOM', icon: '⬡',
    desc: 'Capture and hold A / B / C. Score 200 to win.',
    scoreLimit: 200, time: 420, teamSize: 4, respawn: 4, ffa: false
  },
  blackout: {
    id: 'blackout', name: 'BLACKOUT', short: 'BR', icon: '◐',
    desc: '10 operators. One life. The zone closes. Last one standing.',
    scoreLimit: 1, time: 240, teamSize: 10, respawn: 0, ffa: true
  }
};

export const DIFFICULTY = {
  recruit: { label: 'RECRUIT', acc: 0.48, reaction: 0.65, burst: [2, 4], damage: 0.8, hp: 90, aimSpeed: 2.4 },
  regular: { label: 'REGULAR', acc: 0.66, reaction: 0.38, burst: [3, 5], damage: 1.0, hp: 100, aimSpeed: 3.4 },
  veteran: { label: 'VETERAN', acc: 0.82, reaction: 0.2, burst: [4, 7], damage: 1.12, hp: 110, aimSpeed: 4.6 }
};

export const BATTLE_PASS = [
  { tier: 1, type: 'credits', amount: 100, label: '100 CREDITS' },
  { tier: 2, type: 'srn', amount: 25, label: '25 $SRN' },
  { tier: 3, type: 'camo', id: 'camo_ember', label: 'EMBERFALL CAMO' },
  { tier: 4, type: 'credits', amount: 150, label: '150 CREDITS' },
  { tier: 5, type: 'srn', amount: 40, label: '40 $SRN' },
  { tier: 6, type: 'credits', amount: 200, label: '200 CREDITS' },
  { tier: 7, type: 'srn', amount: 55, label: '55 $SRN' },
  { tier: 8, type: 'camo', id: 'camo_frost', label: 'WHITEOUT CAMO' },
  { tier: 9, type: 'credits', amount: 250, label: '250 CREDITS' },
  { tier: 10, type: 'srn', amount: 75, label: '75 $SRN' },
  { tier: 11, type: 'credits', amount: 300, label: '300 CREDITS' },
  { tier: 12, type: 'srn', amount: 90, label: '90 $SRN' },
  { tier: 13, type: 'camo', id: 'camo_neon', label: 'NEON TIDE CAMO' },
  { tier: 14, type: 'credits', amount: 350, label: '350 CREDITS' },
  { tier: 15, type: 'srn', amount: 110, label: '110 $SRN' },
  { tier: 16, type: 'credits', amount: 400, label: '400 CREDITS' },
  { tier: 17, type: 'srn', amount: 130, label: '130 $SRN' },
  { tier: 18, type: 'camo', id: 'camo_aurora', label: 'AURORA CAMO' },
  { tier: 19, type: 'srn', amount: 160, label: '160 $SRN' },
  { tier: 20, type: 'operator', id: 'op_spectre', label: 'SPECTRE OPERATOR' }
];
export const BP_XP_PER_TIER = 600;

export const STORE_ITEMS = [
  { id: 'bundle_neon', cat: 'bundle', name: 'NEON HARBOR OPERATOR PACK', desc: 'EMISSARY operator, 2 camos, 1,200 credits, +5 pass tiers.', price: 2400, rarity: 'legendary', glyph: 'NH', art: 'linear-gradient(135deg,#1b4a4e,#0d1a2e 55%,#5b2a52)', grants: { operator: 'op_emissary', camos: ['camo_neon', 'camo_void'], credits: 1200, bpTiers: 5 } },
  { id: 'sub_plus', cat: 'sub', name: 'SENTINEL+ MONTHLY', desc: '500 credits monthly, 10% store discount, exclusive deployment badge.', price: 799, priceUsd: 7.99, rarity: 'epic', glyph: 'S+', art: 'linear-gradient(135deg,#1a4a42,#0b211f)', recurring: true },
  { id: 'pass_premium', cat: 'pass', name: 'PREMIUM BATTLE PASS', desc: 'Unlock all 20 premium reward tiers this season.', price: 1000, rarity: 'legendary', glyph: 'BP', art: 'linear-gradient(135deg,#4a3a12,#161006)', grants: { pass: true } },
  { id: 'pass_tier5', cat: 'pass', name: '5 TIER SKIP', desc: 'Instantly advance 5 battle pass tiers.', price: 500, rarity: 'rare', glyph: '+5', art: 'linear-gradient(135deg,#26323d,#0d1216)', grants: { bpTiers: 5 } },
  { id: 'op_ronin', cat: 'operator', name: 'RONIN', desc: 'Breacher operator · +15 bonus max armor.', price: 1400, rarity: 'epic', glyph: 'RO', art: 'linear-gradient(135deg,#4a2018,#170d0b)', grants: { operator: 'op_ronin' } },
  { id: 'op_vanta', cat: 'operator', name: 'VANTA', desc: 'Infiltrator operator · low-profile silhouette.', price: 1800, rarity: 'legendary', glyph: 'VA', art: 'linear-gradient(135deg,#332257,#120e1e)', grants: { operator: 'op_vanta' } },
  { id: 'op_emissary', cat: 'operator', name: 'EMISSARY', desc: 'Support operator · envoys of the Blacksite network.', price: 1800, rarity: 'legendary', glyph: 'EM', art: 'linear-gradient(135deg,#4d3a10,#1a1205)', grants: { operator: 'op_emissary' } },
  { id: 'camo_gold', cat: 'camo', name: '24K CAMO', desc: 'Polished gold finish for all primaries.', price: 1500, rarity: 'legendary', glyph: '24K', art: 'linear-gradient(135deg,#7a5a15,#f5d98a 50%,#4a350b)', grants: { camos: ['camo_gold'] } },
  { id: 'camo_void', cat: 'camo', name: 'VOID CHROME CAMO', desc: 'Mirror chrome with ultraviolet accent glow.', price: 1200, rarity: 'legendary', glyph: 'VX', art: 'linear-gradient(135deg,#2b2350,#b18cff)', grants: { camos: ['camo_void'] } },
  { id: 'camo_aurora', cat: 'camo', name: 'AURORA CAMO', desc: 'Reactive green-teal energy finish.', price: 1100, rarity: 'legendary', glyph: 'AU', art: 'linear-gradient(135deg,#073b2c,#7dffb0 55%,#4f8bff)', grants: { camos: ['camo_aurora'] } },
  { id: 'camo_neon', cat: 'camo', name: 'NEON TIDE CAMO', desc: 'Cyan emissive circuit styling.', price: 850, rarity: 'epic', glyph: 'NT', art: 'linear-gradient(135deg,#0a4b4b,#4ff5df)', grants: { camos: ['camo_neon'] } },
  { id: 'camo_ember', cat: 'camo', name: 'EMBERFALL CAMO', desc: 'Heat-scorched orange accenting.', price: 450, rarity: 'rare', glyph: 'EF', art: 'linear-gradient(135deg,#4a1c0d,#ff7a2f)', grants: { camos: ['camo_ember'] } },
  { id: 'camo_frost', cat: 'camo', name: 'WHITEOUT CAMO', desc: 'Arctic ceramic finish.', price: 450, rarity: 'rare', glyph: 'WO', art: 'linear-gradient(135deg,#ecf6f7,#89b4c1)', grants: { camos: ['camo_frost'] } }
];

export const CREDIT_PACKS = {
  credits_1000: { id: 'credits_1000', name: '1,000 CREDITS', desc: 'Sentinel Strike Credits', credits: 1000, usd: 9.99, icon: '◈' },
  credits_2500: { id: 'credits_2500', name: '2,500 CREDITS', desc: '2,500 + 250 bonus credits', credits: 2750, usd: 19.99, icon: '◈' },
  credits_6000: { id: 'credits_6000', name: '6,000 CREDITS', desc: '6,000 + 900 bonus credits', credits: 6900, usd: 39.99, icon: '◈' },
  sub_plus: { id: 'sub_plus', name: 'SENTINEL+ MONTHLY', desc: '500 credits / month · 10% discount', credits: 500, usd: 7.99, icon: 'S+', recurring: true }
};

export const CONTROL_POINTS = [
  { id: 'A', x: -25, z: 9, r: 5.2 },
  { id: 'B', x: 0, z: -2, r: 6.0 },
  { id: 'C', x: 25, z: 9, r: 5.2 }
];

export const SPAWNS = {
  blue: [ { x: -9, z: 38 }, { x: 0, z: 41 }, { x: 9, z: 38 }, { x: 0, z: 35 } ],
  red: [ { x: -9, z: -38 }, { x: 0, z: -41 }, { x: 9, z: -38 }, { x: 0, z: -35 } ],
  ffa: [
    { x: -34, z: 32 }, { x: 34, z: 32 }, { x: -34, z: -32 }, { x: 34, z: -32 },
    { x: -15, z: 22 }, { x: 15, z: 22 }, { x: -15, z: -26 }, { x: 15, z: -26 },
    { x: 0, z: 12 }, { x: 0, z: -16 }
  ]
};

export const REWARDS = {
  base: 40,
  perKill: 6,
  perAssist: 2,
  win: 120,
  perCapture: 15,
  perObjectiveTick: 1.2,
  perMatchComplete: 10,
  xpBase: 320,
  xpPerKill: 55,
  xpPerCapture: 80,
  xpWin: 500
};
