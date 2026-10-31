// ---------------------------------------------------------------------------
// CATTERFALL — world data: cats, callings, items, spells, skills, quests.
// All names, places and story elements are original.
// ---------------------------------------------------------------------------

export const ICONS = {
  sword: '<path d="M14.5 3.5 20 9l-8.5 8.5-2-2L18 7l-3.5-3.5Z"/><path d="m9.5 13.5 1 1-4 4-2-2 4-4Z"/><path d="M4 20l2-2M3 17l4 4"/>',
  axe: '<path d="M14 4c3 0 6 2 7 5-2 2-5 3-8 2l-2-2c1-3 1-4 3-5Z"/><path d="M12 9 4 20"/><path d="m6 17 3 3"/>',
  claws: '<path d="M5 4c-1 5 0 9 3 12M10 3c-1 6 0 10 3 14M15 3c-1 6 0 11 3 15"/><path d="M4 20c3 1 6 1 9 0"/>',
  bow: '<path d="M6 4c8 2 12 8 12 16M6 4l-2 2m14 14 2-2"/><path d="M4 20 20 4"/><path d="m17 4 3 3-3 1-1-1 1-3Z"/>',
  shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="M9 12h6M12 9v6"/>',
  armor: '<path d="M8 4 5 6l-1 6 3 1v7h10v-7l3-1-1-6-3-2-4 2-4-2Z"/><path d="M8 4c0 3 1 5 4 5s4-2 4-5"/>',
  potion: '<path d="M9 3h6M10 3v5l-4 8a3 3 0 0 0 3 4h6a3 3 0 0 0 3-4l-4-8V3"/><path d="M7 15h10"/>',
  food: '<path d="M15 4c3 0 5 2 5 5 0 2-1 3-2 4l-1 1v6h-3v-6l-2-1c-3-1-5-3-5-6 0-2 2-3 4-2 1 1 2 1 3 0 .3-.6.6-1 1-1Z"/><path d="M5 19h6"/>',
  gold: '<circle cx="12" cy="12" r="8"/><path d="M9 12h6M12 9v6"/>',
  relic: '<path d="m12 3 5 5-5 13L7 8l5-5Z"/><path d="m7 8 10 0M12 3v13"/>',
  quest: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  herb: '<path d="M12 21V9"/><path d="M12 13C7 13 5 10 5 5c5 0 7 3 7 8ZM12 10c0-4 2-6 7-6 0 5-3 7-7 6Z"/>',
  fish: '<path d="M3 12c4-5 9-5 12 0-3 5-8 5-12 0Z"/><path d="m15 12 6-4v8l-6-4Z"/><circle cx="7" cy="11" r=".6" fill="currentColor"/>',
  ring: '<circle cx="12" cy="14" r="5"/><path d="m9 6 3-3 3 3-3 3-3-3Z"/>',
  arrow: '<path d="M4 20 20 4M14 4h6v6"/><path d="m4 16 4 4"/>',
  torch: '<path d="M12 3c3 3 4 5 2 7-1 1-3 1-4 0-2-2 0-5 2-7Z"/><path d="M10 11h4l1 10H9l1-10Z"/>',
  key: '<circle cx="8" cy="8" r="4"/><path d="m11 11 8 8M16 16l2-2M18 18l2-2"/>',
  book: '<path d="M4 4h7c1 0 2 1 2 2v14c0-1-1-2-2-2H4V4ZM20 4h-5c-1 0-2 1-2 2v14c0-1 1-2 2-2h5V4Z"/>',
  fire: '<path d="M12 3c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10Z"/><path d="M12 12c2 2 2 3 1 5-1 1-3 0-3-2 0-1 1-2 2-3Z"/>',
  bolt: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>',
  heal: '<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/><path d="M12 9v6M9 12h6"/>',
  ice: '<path d="M12 2v20M3 7l18 10M21 7 3 17"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4M20 14l-4-1 1 4M20 10l-4 1 1-4M4 14l4-1-1 4"/>',
  bag: '<path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 12h6"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v14M15 6v14"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z"/>',
  skull: '<path d="M5 11a7 7 0 0 1 14 0c0 3-1 4-2 5v3H7v-3c-1-1-2-2-2-5Z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/><path d="M10 17h4M10 20v-3M14 20v-3"/>',
  paw: '<circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M12 11c3 0 5 3 4 6-1 3-3 2-4 2s-3 1-4-2c-1-3 1-6 4-6Z"/>',
  meow: '<path d="M5 5v9c0 3 3 5 7 5s7-2 7-5V5l-4 3H9L5 5Z"/><path d="M9 12h.01M15 12h.01M10 16c1 .7 3 .7 4 0"/>',
  heart: '<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/>',
  snow: '<path d="M12 2v20M3 7l18 10M21 7 3 17"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  sleep: '<path d="M4 6h8l-8 9h8M15 12h6l-6 6h6"/>',
  crown: '<path d="m3 8 5 4 4-7 4 7 5-4-2 12H5L3 8Z"/><path d="M6 20h12"/>',
  hand: '<path d="M8 12V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v8M16 12V7a2 2 0 0 1 4 0v7c0 4-3 7-7 7h-1c-2 0-4-1-5-3l-3-5a2 2 0 0 1 3-2l3 2"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  flask: '<path d="M9 3h6M10 3v6L4 20h16L14 9V3"/><path d="M7 15h10"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9l3-6Z"/><path d="M3 9h18M9 3l3 6 3-6M12 9v12"/>',
  scroll: '<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z"/><path d="M6 4a2 2 0 0 0-2 2v2h3M10 9h6M10 13h6"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  bell: '<path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Z"/><path d="M10 20h4"/>',
  fishbone: '<path d="M4 12h13M17 12l3-3v6l-3-3Z"/><path d="M7 9v6M10 8v8M13 9v6"/>',
  snowflake: '<path d="M12 2v20M4 6l16 12M20 6 4 18"/>',
};

export const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.gem}</svg>`;

export const BREEDS = [
  { id: 'longhair', name: 'Whiskerford Longhair', scale: 1.08, fluff: 1.35, tufts: true, muzzle: 0.95, tail: 1.2, blurb: 'Bred for draughty castles and dramatic entrances.' },
  { id: 'ashpoint', name: 'Ashpoint', scale: 0.96, fluff: 0.7, tufts: false, muzzle: 1.1, tail: 1.0, darkPoints: true, blurb: 'Elegant, vocal, and convinced the prophecy is about them.' },
  { id: 'tabby', name: 'Cobble Tabby', scale: 1.0, fluff: 0.95, tufts: false, muzzle: 1.0, tail: 1.0, stripes: true, blurb: 'Sturdy alley royalty with a map of the city in their fur.' },
  { id: 'sootpaw', name: 'Sootpaw', scale: 0.98, fluff: 0.85, tufts: false, muzzle: 0.95, tail: 1.05, blurb: 'Sneaks through chimneys. Has opinions about doors.' },
  { id: 'calico', name: 'Ember Calico', scale: 0.94, fluff: 1.0, tufts: false, muzzle: 1.0, tail: 1.0, patches: true, blurb: 'Three colours, nine lives, zero patience.' },
  { id: 'snowshoe', name: 'Snowshoe', scale: 1.02, fluff: 1.1, tufts: false, muzzle: 1.05, tail: 1.05, socks: true, blurb: 'Born with snow between their toes and a secret in each ear.' },
  { id: 'ginger', name: 'Ginger Scrapper', scale: 1.04, fluff: 0.9, tufts: false, muzzle: 1.0, tail: 1.0, stripes: true, blurb: 'One brain cell, used exclusively for combat.' },
  { id: 'chinchilla', name: 'Silver Chinchilla', scale: 0.92, fluff: 1.25, tufts: true, muzzle: 0.9, tail: 1.15, blurb: 'A cloud that learned to hiss. Distantly related to the moon.' },
];

export const FURS = [
  { id: 'ember', name: 'Ember', base: '#a8643a', hi: '#d99a63', dark: '#5b321c' },
  { id: 'smoke', name: 'Smoke', base: '#6f7277', hi: '#a9adb2', dark: '#3c3e42' },
  { id: 'snow', name: 'Snow', base: '#d8d5ca', hi: '#f5f1e6', dark: '#a39e91' },
  { id: 'ink', name: 'Ink', base: '#2e3038', hi: '#525764', dark: '#141519' },
  { id: 'ginger', name: 'Ginger', base: '#c2763f', hi: '#e8a96c', dark: '#7c3f1c' },
  { id: 'moss', name: 'Moss', base: '#777b5e', hi: '#a8ab86', dark: '#464a35' },
  { id: 'frost', name: 'Frost', base: '#8fa5ad', hi: '#c2d4d9', dark: '#5d7279' },
  { id: 'dusk', name: 'Dusk', base: '#675a71', hi: '#998aa3', dark: '#3b3144' },
];

export const EYES = [
  { id: 'amber', name: 'Amber', color: '#e0b34f' },
  { id: 'jade', name: 'Jade', color: '#78c09b' },
  { id: 'ice', name: 'Ice', color: '#84c6e8' },
  { id: 'copper', name: 'Copper', color: '#cf8a5c' },
  { id: 'violet', name: 'Violet', color: '#b08ad8' },
  { id: 'moon', name: 'Moon', color: '#e8edf2' },
];

export const CLASSES = {
  wayfarer: {
    id: 'wayfarer', name: 'Wayfarer', title: 'The Tenth',
    blurb: 'Balanced in blade and bow. A little of everything, like a cat with nine hobbies.',
    health: 110, stamina: 105, mana: 85, damage: 1, magic: 1,
    items: ['rustySword', 'huntingBow', 'leatherArmor', 'healthPotion', 'healthPotion', 'bread'],
    equip: { weapon: 'rustySword', armor: 'leatherArmor', bow: 'huntingBow' },
  },
  pyrewitch: {
    id: 'pyrewitch', name: 'Pyrewitch', title: 'Keeper of the Hearth-Spark',
    blurb: 'Fire first, questions later. The robe is singed for a reason.',
    health: 85, stamina: 90, mana: 135, damage: 0.85, magic: 1.35,
    items: ['oakStaff', 'mageRobe', 'healthPotion', 'manaPotion', 'manaPotion', 'bread'],
    equip: { weapon: 'oakStaff', armor: 'mageRobe' },
  },
  prowler: {
    id: 'prowler', name: 'Prowler', title: 'Whisker in the Snow',
    blurb: 'Why fight a bear when you can outrun it, then steal its fish?',
    health: 95, stamina: 135, mana: 75, damage: 1.05, magic: 0.9,
    items: ['huntingBow', 'clawWraps', 'leatherArmor', 'healthPotion', 'fish', 'fish'],
    equip: { weapon: 'clawWraps', armor: 'leatherArmor', bow: 'huntingBow' },
  },
};

export const ITEMS = {
  gold: { name: 'Gold', type: 'gold', icon: 'gold', value: 1, desc: 'Cold, heavy, and universally admired.' },
  rustySword: { name: 'Rusty Whiskerblade', type: 'weapon', icon: 'sword', dmg: 8, speed: 1.0, value: 18, rarity: 'common', desc: 'It has killed at least one very unlucky fish.' },
  guardSaber: { name: "Guard's Saber", type: 'weapon', icon: 'sword', dmg: 14, speed: 1.05, value: 90, rarity: 'common', desc: 'Standard issue. The tassel is decorative and deeply serious.' },
  frostAxe: { name: 'Frostfang Axe', type: 'weapon', icon: 'axe', dmg: 22, speed: 0.82, effect: 'ice', value: 240, rarity: 'epic', desc: 'The haft is warm. The blade is not. Do not lick it.' },
  oathBlade: { name: 'Oath of Nine Bells', type: 'weapon', icon: 'sword', dmg: 26, speed: 1.1, effect: 'holy', value: 520, rarity: 'epic', desc: 'Forged from the ninth bell. It rings only when struck.' },
  oakStaff: { name: 'Oakheart Staff', type: 'weapon', icon: 'torch', dmg: 7, magic: 12, speed: 0.95, value: 70, rarity: 'common', desc: 'A walking stick that has learned one trick.' },
  clawWraps: { name: 'Claw Wraps', type: 'weapon', icon: 'claws', dmg: 10, speed: 1.25, unarmed: true, value: 45, rarity: 'common', desc: 'Leather strips for a cat who believes in the classics.' },
  huntingBow: { name: 'Hunting Bow', type: 'bow', icon: 'bow', dmg: 12, value: 60, rarity: 'common', desc: 'String made from a very tense cat. Metaphorically.' },
  moonBow: { name: 'Moonwhisker Bow', type: 'bow', icon: 'bow', dmg: 21, value: 280, rarity: 'epic', desc: 'Draws moonlight. Do not dry-fire it at the moon; it is rude.' },
  leatherArmor: { name: 'Snow-Leather Coat', type: 'armor', icon: 'armor', armor: 4, value: 50, rarity: 'common', desc: 'Smells faintly of wet cat and adventure.' },
  ironArmor: { name: 'Watchplate Harness', type: 'armor', icon: 'armor', armor: 9, value: 160, rarity: 'common', desc: 'City-watch issue. Comfortable if you are shaped like a barrel.' },
  mageRobe: { name: 'Hearth-Spark Robe', type: 'armor', icon: 'armor', armor: 3, magic: 18, value: 140, rarity: 'rare', desc: 'The singe marks are a feature. Probably.' },
  wardenArmor: { name: 'Frostwarden Plate', type: 'armor', icon: 'armor', armor: 16, magic: 10, value: 420, rarity: 'epic', desc: 'Worn by those who guard the barrow. Mostly they guard it from visitors.' },
  emberAmulet: { name: 'Ember Charm', type: 'trinket', icon: 'gem', magic: 12, value: 180, rarity: 'rare', desc: 'A coal that refuses to go out. Sentimental.' },
  nineBell: { name: 'Ninth Bell', type: 'trinket', icon: 'bell', armor: 3, magic: 10, value: 0, rarity: 'quest', quest: true, desc: 'One of the nine bells of Whiskerhold. It is not supposed to be here.' },
  healthPotion: { name: 'Warm Milk Potion', type: 'potion', icon: 'potion', heal: 38, value: 22, stack: 9, rarity: 'common', desc: 'Restores 38 health. Tastes like being small and safe.' },
  manaPotion: { name: 'Moonwater Flask', type: 'potion', icon: 'potion', mana: 42, value: 26, stack: 9, rarity: 'common', desc: 'Restores 42 mana. Bottled under a very patient moon.' },
  staminaPotion: { name: 'Brisk Tonic', type: 'potion', icon: 'potion', stamina: 50, value: 18, stack: 9, rarity: 'common', desc: 'Restores 50 stamina. Made from nettles and spite.' },
  fish: { name: 'River Trout', type: 'food', icon: 'fish', heal: 10, value: 6, stack: 9, rarity: 'common', desc: 'A fish. The kingdom runs on them.' },
  bread: { name: 'Hearth Loaf', type: 'food', icon: 'food', heal: 14, value: 5, stack: 9, rarity: 'common', desc: 'Still warm. Someone is missing it.' },
  cheese: { name: 'Wedge of Nine-Cheese', type: 'food', icon: 'food', heal: 20, value: 9, stack: 9, rarity: 'common', desc: 'Aged nine years. Nine is a theme here.' },
  stew: { name: 'Barrow Stew', type: 'food', icon: 'food', heal: 34, stamina: 20, value: 16, stack: 9, rarity: 'common', desc: 'Hearty, mysterious, and best not investigated.' },
  locket: { name: "Mittens' Locket", type: 'quest', icon: 'ring', value: 0, rarity: 'quest', quest: true, desc: 'A tiny silver locket with a portrait of a fish. Of course.' },
  lute: { name: "Bramble's Lute", type: 'quest', icon: 'music', value: 0, rarity: 'quest', quest: true, desc: 'Battered, beloved, and missing one string named Gerald.' },
  riverFish: { name: 'River Fish (Quest)', type: 'quest', icon: 'fish', value: 0, rarity: 'quest', quest: true, desc: 'Fresh enough to be smug about it.' },
  dreamHerb: { name: 'Dreamherb', type: 'quest', icon: 'herb', value: 0, rarity: 'quest', quest: true, desc: 'Smells like sleep. Do not eat the whole bunch.' },
  emberRelic: { name: 'The First Ember', type: 'quest', icon: 'gem', value: 0, rarity: 'quest', quest: true, desc: 'The first warmth the Nine ever stole from the dark. It is still angry.' },
  silverBell: { name: 'The Silver Bell', type: 'quest', icon: 'bell', value: 0, rarity: 'quest', quest: true, desc: 'The bell that woke the kingdom. It has been trying to apologise ever since.' },
  banditOrders: { name: 'Muddy Orders', type: 'quest', icon: 'scroll', value: 0, rarity: 'quest', quest: true, desc: 'Instructions in bad handwriting: “Dig where the snow does not melt.”' },
  frostKey: { name: 'Rimewrought Key', type: 'quest', icon: 'key', value: 0, rarity: 'quest', quest: true, desc: 'Cold enough to stick to your tongue. Do not test this.' },
};

export const SPELLS = {
  fireball: { id: 'fireball', name: 'Ember', cost: 18, cooldown: 1.2, damage: 34, icon: 'fire', color: '#ff8b3d', desc: 'Hurl a ball of hearth-fire. Excellent at parties, banned in barns.' },
  lightning: { id: 'lightning', name: 'Fulmin', cost: 24, cooldown: 2.0, damage: 44, icon: 'bolt', color: '#9fd8ff', desc: 'Call down a bolt of sky-anger. Chain hits the nearest second target.' },
  heal: { id: 'heal', name: 'Mend', cost: 26, cooldown: 4.0, damage: 0, heal: 38, icon: 'heal', color: '#8ee39b', desc: 'Knit flesh and fur with warm light. Does not fix emotional damage.' },
  ice: { id: 'ice', name: 'Frost', cost: 16, cooldown: 1.6, damage: 22, icon: 'ice', color: '#8fd9ff', slow: 2.5, desc: 'A shard of the old winter. Slows what it does not stop.' },
};

export const SKILLS = [
  { id: 'blade', name: 'Bladecraft', icon: 'sword', max: 5, desc: '+3 melee damage per rank.', tree: 'Hunter' },
  { id: 'claws', name: 'Claws of the Tenth', icon: 'claws', max: 5, desc: '+3 unarmed damage and +4% attack speed per rank.', tree: 'Hunter' },
  { id: 'archery', name: 'Truewhisker', icon: 'bow', max: 5, desc: '+4 bow damage per rank.', tree: 'Hunter' },
  { id: 'vitality', name: 'Nine Lives', icon: 'heart', max: 5, desc: '+16 maximum health per rank.', tree: 'Hunter' },
  { id: 'destruction', name: 'Hearth-Spark', icon: 'fire', max: 5, desc: '+12% spell damage per rank.', tree: 'Spell' },
  { id: 'restoration', name: 'Warm Milk', icon: 'heal', max: 5, desc: '+20% healing per rank.', tree: 'Spell' },
  { id: 'attunement', name: 'Moonwell', icon: 'moon', max: 5, desc: '+16 maximum mana per rank.', tree: 'Spell' },
  { id: 'endurance', name: 'Snowstride', icon: 'snow', max: 5, desc: '+16 maximum stamina per rank.', tree: 'Way' },
  { id: 'fortune', name: 'Knock It Off The Ledge', icon: 'paw', max: 5, desc: '+15% gold and loot luck per rank.', tree: 'Way' },
  { id: 'prowl', name: 'Prowl', icon: 'eye', max: 5, desc: '+12% damage from behind per rank. Guards will still see you.', tree: 'Way' },
];

export const QUESTS = [
  {
    id: 'main1', title: 'A Cold Welcome', type: 'main', giver: 'elder',
    summary: 'Something has gone wrong beneath the snow, and Elder Whiskerby thinks you are the wrong cat for the job. That has never stopped anyone.',
    desc: 'Whiskerby says the Shrine of the Nine has been restless since the first snow. A seer named Mothwhisker has been waiting for a cat with a tenth life. You have a suspiciously tenth-life-shaped feeling.',
    stages: [
      { text: 'Speak with Seer Mothwhisker at the Shrine of the Nine', event: 'talk', target: 'seer', marker: 'shrine' },
    ],
    reward: { xp: 140, gold: 35, items: ['healthPotion', 'manaPotion'] },
    next: 'main2',
  },
  {
    id: 'main2', title: 'The First Ember', type: 'main', giver: 'seer',
    summary: 'The Hollow are waking in the old barrows. Recover the First Ember before they remember how to burn.',
    desc: 'The First Ember was the warmth the Nine took from the dark and taught to cats. It was buried in Sunken Pawbarrow when the seal was made. The Hollow have found the door. They have not found the key — you are the key.',
    stages: [
      { text: 'Enter Sunken Pawbarrow', event: 'reach', target: 'pawbarrow', marker: 'pawbarrow' },
      { text: 'Recover the First Ember', event: 'collect', target: 'emberRelic', count: 1, marker: 'pawbarrow' },
      { text: 'Return to Seer Mothwhisker', event: 'talk', target: 'seer', marker: 'shrine' },
    ],
    reward: { xp: 260, gold: 60, items: ['emberAmulet', 'healthPotion', 'healthPotion'] },
    next: 'main3',
  },
  {
    id: 'main3', title: 'Two Good Paws', type: 'main', giver: 'seer',
    summary: 'A bard with more courage than sense and a mage with more sense than courage. The prophecy requires both.',
    desc: 'Mothwhisker says the Tenth cannot reach Frostfang alone. Bramble, a bard of the Leaky Whisker, has been singing about you for weeks (badly). Soot, a young mage in Frostpelt, has been dreaming of the barrow. Recruit them both.',
    stages: [
      { text: 'Recruit Bramble at the Leaky Whisker', event: 'recruit', target: 'bramble', marker: 'bramble' },
      { text: 'Recruit Soot in Frostpelt', event: 'recruit', target: 'soot', marker: 'soot' },
      { text: 'Return to Seer Mothwhisker', event: 'talk', target: 'seer', marker: 'shrine' },
    ],
    reward: { xp: 320, gold: 80, items: ['manaPotion', 'healthPotion', 'stew'] },
    next: 'main4',
  },
  {
    id: 'main4', title: 'The Silver Bell', type: 'main', giver: 'seer',
    summary: 'The bell that woke the dark is buried in Cinderdeep. Something else has been sleeping on it.',
    desc: 'Long ago, the Ninth Bell was rung to seal the Empty Bowl. Its echo became the Silver Bell, hidden in Cinderdeep Mine. Marrowmaw, an old hunger in a cat-shaped coat, guards it. The Hollow are already digging.',
    stages: [
      { text: 'Enter Cinderdeep Mine', event: 'reach', target: 'cinderdeep', marker: 'cinderdeep' },
      { text: 'Defeat Marrowmaw', event: 'kill', target: 'marrowmaw', count: 1, marker: 'cinderdeep' },
      { text: 'Take the Silver Bell', event: 'collect', target: 'silverBell', count: 1, marker: 'cinderdeep' },
      { text: 'Return to Seer Mothwhisker', event: 'talk', target: 'seer', marker: 'shrine' },
    ],
    reward: { xp: 480, gold: 120, items: ['oathBlade', 'wardenArmor', 'healthPotion', 'healthPotion'] },
    next: 'main5',
  },
  {
    id: 'main5', title: 'The Frostfang Pact', type: 'main', giver: 'seer',
    summary: 'Under Frostfang, the Empty Bowl is awake. It has been very patient. It is done being patient.',
    desc: 'With the Ember and the Bell, the way into Frostfang Barrow is open. Vaelmaw — the Empty Bowl, the Gnawing Dark, the thing the Nine could not kill — is rising. Bring your companions. Bring your claws. Bring a snack.',
    stages: [
      { text: 'Enter Frostfang Barrow', event: 'reach', target: 'frostfang', marker: 'frostfang' },
      { text: 'Defeat Vaelmaw, the Empty Bowl', event: 'kill', target: 'vaelmaw', count: 1, marker: 'frostfang' },
    ],
    reward: { xp: 1000, gold: 500, items: ['nineBell'] },
  },
  {
    id: 'rats', title: 'Pesky, Peskier, Peskiest', type: 'side', giver: 'farmer',
    summary: 'Frost rats are eating the turnips. The turnips are eating the fence. One problem at a time.',
    desc: 'Pelt-Pincher Nibs has a rat problem. The rats have a Nibs problem. Only one side can win, and the turnips are neutral.',
    stages: [
      { text: 'Kill frost rats around Hearthwhisker (0/5)', event: 'kill', target: 'frostRat', count: 5, marker: 'hearthwhisker' },
      { text: 'Return to Pelt-Pincher Nibs', event: 'talk', target: 'farmer', marker: 'farmer' },
    ],
    reward: { xp: 160, gold: 55, items: ['cheese', 'healthPotion'] },
  },
  {
    id: 'locket', title: 'The Fish In The Locket', type: 'side', giver: 'mittens',
    summary: "Mittens dropped her locket in the old barrow. Inside is a portrait of a fish. She would like it back before the fish gets ideas.",
    desc: 'A tiny silver locket, lost in Sunken Pawbarrow. Mittens claims it is an heirloom. The fish in the portrait has been described as “a handsome devil.”',
    stages: [
      { text: 'Find the locket in Sunken Pawbarrow', event: 'collect', target: 'locket', count: 1, marker: 'pawbarrow' },
      { text: 'Return the locket to Mittens', event: 'talk', target: 'mittens', marker: 'mittens' },
    ],
    reward: { xp: 140, gold: 45, items: ['healthPotion', 'fish'] },
  },
  {
    id: 'lute', title: 'The Missing String', type: 'side', giver: 'bramble',
    summary: "Bramble's lute was stolen by bandits. Without it, his ballads are just aggressively rhythmic breathing.",
    desc: 'The bandits at Scarwood Camp took Bramble\'s lute. He says it is priceless. They say it is worth eleven gold and a half-eaten cheese.',
    stages: [
      { text: 'Recover the lute from Scarwood Camp', event: 'collect', target: 'lute', count: 1, marker: 'banditcamp' },
      { text: 'Return the lute to Bramble', event: 'talk', target: 'bramble', marker: 'bramble' },
    ],
    reward: { xp: 180, gold: 60, items: ['manaPotion', 'bread'] },
  },
  {
    id: 'fish', title: 'Three Fish, One Pot', type: 'side', giver: 'cook',
    summary: 'Cook Barley needs three river fish for the Nine Bells Feast. The river has fish. The fish have opinions.',
    desc: 'The Leaky Whisker is preparing a feast. Barley needs three river fish. Fishing spots along the river and lake will provide. The fish are not consulted.',
    stages: [
      { text: 'Catch river fish (0/3)', event: 'collect', target: 'riverFish', count: 3, marker: 'pawsmouth' },
      { text: 'Deliver the fish to Cook Barley', event: 'talk', target: 'cook', marker: 'cook' },
    ],
    reward: { xp: 120, gold: 50, items: ['stew', 'stew', 'healthPotion'] },
  },
  {
    id: 'bandits', title: 'Scarwood Trouble', type: 'side', giver: 'captain',
    summary: 'Bandits are robbing travellers on the north road. The Watch would go, but it is nearly lunch.',
    desc: 'Captain Sable wants the Scarwood bandits thinned out. Four will do. The Watch will handle the paperwork, the funerals, and the group photograph.',
    stages: [
      { text: 'Defeat Scarwood bandits (0/4)', event: 'kill', target: 'bandit', count: 4, marker: 'banditcamp' },
      { text: 'Report to Captain Sable', event: 'talk', target: 'captain', marker: 'captain' },
    ],
    reward: { xp: 220, gold: 90, items: ['guardSaber', 'healthPotion'] },
  },
  {
    id: 'herb', title: 'A Cure For Dreaming', type: 'side', giver: 'nettle',
    summary: 'The apothecary needs dreamherb from the Whispering Cave. The cave is full of whispers. The herb is full of dreams.',
    desc: 'Nettle of Frostpelt cannot sleep. Dreamherb grows in the Whispering Cave, where the Hollow have been seen. She would fetch it herself, but she is very comfortable.',
    stages: [
      { text: 'Find dreamherb in the Whispering Cave', event: 'collect', target: 'dreamHerb', count: 1, marker: 'whispercave' },
      { text: 'Return to Nettle', event: 'talk', target: 'nettle', marker: 'nettle' },
    ],
    reward: { xp: 180, gold: 70, items: ['manaPotion', 'manaPotion', 'manaPotion'] },
  },
];

export const QUESTS_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q]));
export const ITEMS_BY_ID = ITEMS;

export const LANDMARKS = {
  pawsmouth: { x: 156, z: 306, name: 'Pawsmouth', sub: 'A fishing village with more cats than fish', radius: 80 },
  shrine: { x: -40, z: 170, name: 'Shrine of the Nine', sub: 'Nine stones, nine bells, one very tired seer', radius: 44 },
  whiskerhold: { x: -280, z: -160, name: 'Whiskerhold', sub: 'The nine-belled city', radius: 115 },
  highpaw: { x: 238, z: -292, name: 'Highpaw Keep', sub: 'Seat of the Snow Queen, who is also a cat', radius: 80 },
  hearthwhisker: { x: -392, z: 138, name: 'Hearthwhisker', sub: 'Turnips, tractors, and deeply suspicious geese', radius: 70 },
  frostpelt: { x: 352, z: 206, name: 'Frostpelt', sub: 'The last warm roofs before the peaks', radius: 66 },
  pawbarrow: { x: -360, z: -344, name: 'Sunken Pawbarrow', sub: 'A ruin that remembers being a temple', radius: 55 },
  cinderdeep: { x: 392, z: -356, name: 'Cinderdeep Mine', sub: 'They dug too deep. They were cats; it was inevitable.', radius: 50 },
  frostfang: { x: -40, z: -590, name: 'Frostfang Barrow', sub: 'The door the Nine could not close', radius: 55 },
  banditcamp: { x: 258, z: 72, name: 'Scarwood Camp', sub: 'Bandits, badly drawn wanted posters', radius: 40 },
  whispercave: { x: -126, z: 336, name: 'Whispering Cave', sub: 'It knows your name and is being smug about it', radius: 38 },
  leakywhisker: { x: -280, z: -160, name: 'The Leaky Whisker', sub: 'Warm beer, cold gossip', radius: 20 },
  ninegoods: { x: -280, z: -160, name: 'Nine Lives Goods', sub: 'Everything has a price, including the cat', radius: 20 },
  castlehall: { x: 238, z: -292, name: 'Highpaw Hall', sub: 'A throne built for nine, occupied by one', radius: 20 },
};
