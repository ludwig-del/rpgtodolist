export const ITEMS = [
  // Common — 50%
  { id: 'torch',     name: 'Torch',           description: 'A simple torch to light the dark path.',         rarity: 'common',    icon: '🔦' },
  { id: 'herb',      name: 'Healing Herb',    description: 'Restores a small amount of vitality.',           rarity: 'common',    icon: '🌿' },
  { id: 'stone',     name: 'Sharpening Stone',description: 'Keeps your blade keen and ready.',               rarity: 'common',    icon: '🪨' },
  { id: 'bread',     name: 'Stale Bread',     description: 'Better than starving in the dungeon.',           rarity: 'common',    icon: '🍞' },
  { id: 'bandage',   name: 'Bandage',         description: 'Wraps wounds to slow the bleeding.',             rarity: 'common',    icon: '🩹' },

  // Uncommon — 25%
  { id: 'flask',     name: 'Crimson Flask',   description: 'A flask brimming with crimson liquid.',          rarity: 'uncommon',  icon: '🧪' },
  { id: 'map',       name: 'Tattered Map',    description: 'Reveals a hidden path through the ruins.',       rarity: 'uncommon',  icon: '🗺️' },
  { id: 'ring',      name: 'Iron Ring',       description: 'A simple iron band. Increases defense.',         rarity: 'uncommon',  icon: '💍' },
  { id: 'arrow',     name: 'Poison Arrow',    description: 'Tips coated with slow-acting venom.',            rarity: 'uncommon',  icon: '🏹' },
  { id: 'lantern',   name: 'Oil Lantern',     description: 'Casts a steady glow in the darkest halls.',      rarity: 'uncommon',  icon: '🏮' },

  // Rare — 15%
  { id: 'sword',     name: 'Rusted Longsword',description: 'An ancient blade, still sharp enough to bite.',  rarity: 'rare',      icon: '⚔️' },
  { id: 'shield',    name: 'Cracked Kite Shield', description: 'Cracked but sturdy enough to deflect blows.',rarity: 'rare',      icon: '🛡️' },
  { id: 'scroll',    name: 'Arcane Scroll',   description: 'Contains forgotten magic of the old order.',     rarity: 'rare',      icon: '📜' },
  { id: 'gem',       name: 'Bloodstone',      description: 'A crimson gem pulsing with dark energy.',        rarity: 'rare',      icon: '💎' },

  // Epic — 8%
  { id: 'staff',     name: 'Staff of Gold',   description: 'A staff blessed by radiant golden light.',       rarity: 'epic',      icon: '🔱' },
  { id: 'helmet',    name: 'Helm of the Fallen', description: 'Worn by a great warrior in ages past.',       rarity: 'epic',      icon: '⛑️' },
  { id: 'orb',       name: 'Sorcery Orb',     description: 'A swirling orb of condensed ancient sorcery.',  rarity: 'epic',      icon: '🔮' },

  // Legendary — 2%
  { id: 'rune',      name: 'Great Rune',      description: "A shattered fragment of a demigod's power.",    rarity: 'legendary', icon: '✨' },
  { id: 'crown',     name: 'Elden Crown',     description: 'The crown of the Elden Lord itself.',           rarity: 'legendary', icon: '👑' },
  { id: 'dragon',    name: 'Dragon Soul',     description: 'The condensed soul of a primordial dragon.',    rarity: 'legendary', icon: '🐉' },
];

const WEIGHTS = { common: 50, uncommon: 25, rare: 15, epic: 8, legendary: 2 };

export function rollItem() {
  let roll = Math.random() * 100;
  let rarity = 'common';
  for (const [r, w] of Object.entries(WEIGHTS)) {
    roll -= w;
    if (roll < 0) { rarity = r; break; }
  }
  const pool = ITEMS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
