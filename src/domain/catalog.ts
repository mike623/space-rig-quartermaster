// Default item catalog. ALL names here are generic, original placeholders —
// no official/copyrighted weapon, overclock, beer, or card names. Users rename
// freely; the catalog is stored per-campaign and exported with the save.

import type { ItemCatalog } from "./types";

export function defaultCatalog(): ItemCatalog {
  return {
    // Board-game scale: 5 ammo per weapon. All names generic/editable.
    weapons: [
      { name: "Assault Rifle", slot: "primary", maxAmmo: 5 },
      { name: "Combat Shotgun", slot: "primary", maxAmmo: 5 },
      { name: "Heavy Autocannon", slot: "primary", maxAmmo: 5 },
      { name: "Flame Projector", slot: "primary", maxAmmo: 5 },
      { name: "Sidearm Pistol", slot: "secondary", maxAmmo: 5 },
      { name: "Hand Cannon", slot: "secondary", maxAmmo: 5 },
      { name: "Utility Tool", slot: "other", maxAmmo: 5 }
    ],
    upgrades: [
      "Extended Magazine",
      "Improved Stun",
      "Hardened Rounds",
      "Wide Spread",
      "Faster Reload",
      "Penetrating Shots",
      "Larger Blast"
    ],
    overclocks: [
      "Overdrive Booster",
      "Unstable Conversion",
      "Efficiency Tuning",
      "Volatile Mix"
    ],
    grenades: [
      "Frag Grenade",
      "Cryo Grenade",
      "Incendiary Grenade",
      "Sticky Bomb",
      "Pheromone Lure"
    ],
    beers: [
      "Backbreaker Stout",
      "Pots O' Gold",
      "Tunnel Lager",
      "Blackout Brew",
      "Rockbottom Ale"
    ],
    rockNStoneCards: [
      "Rallying Cry",
      "Second Wind",
      "Steady Aim",
      "Lucky Strike",
      "Hold The Line"
    ]
  };
}
