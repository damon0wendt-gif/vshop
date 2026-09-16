export interface SeedProduct {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  features: string[];
  priceRobux: number;
  version: string;
  studioVersion: string;
  images: string[];
  status: string;
  featured: boolean;
  updates: { version: string; notes: string }[];
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "crystal-island-map",
    name: "Crystal Island Map",
    category: "maps",
    shortDescription:
      "A complete fantasy island map with glowing crystal caves, waterfalls and hand-built terrain.",
    description:
      "Crystal Island is a production-ready fantasy environment built for Roblox developers who want a stunning world without spending weeks on terrain work.\n\nThe island includes a glowing crystal cave network, two waterfall systems, a harbor area, hidden ruins and optimized custom terrain. Every zone is StreamingEnabled-friendly and uses a clean folder structure so you can reskin or extend it in minutes.\n\nDrop it into an empty baseplate, press play, and start building your game on top of it.",
    features: [
      "Hand-sculpted custom terrain with streaming-friendly zones",
      "Glowing crystal cave network with animated lighting",
      "Pre-configured Lighting + Atmosphere preset",
      "Day / night cycle script included",
      "40+ unique props and environment models",
      "Fully documented folder structure",
    ],
    priceRobux: 1000,
    version: "1.4.2",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/crystal-island.jpg"],
    status: "published",
    featured: true,
    updates: [
      { version: "1.4.2", notes: "Fixed waterfall particle density on low graphics modes." },
      { version: "1.4.0", notes: "Added hidden ruins zone and 6 new crystal props." },
      { version: "1.3.0", notes: "Terrain optimization pass — ~18% less memory on mobile." },
    ],
  },
  {
    slug: "abyss-combat-system",
    name: "Abyss Combat System",
    category: "gameplay-systems",
    shortDescription:
      "Server-authoritative combo combat with hitboxes, VFX hooks, stun, block and parry.",
    description:
      "Abyss is a complete combat foundation for action and fighting games. It ships with server-authoritative hitbox validation, M1 combo chains, blocking, parrying, stun windows and a flexible VFX / SFX hook system.\n\nEverything is configurable from a single module: damage, timing windows, cooldowns, ragdoll behavior and camera shake. Mobile, console and PC inputs are handled out of the box.\n\nUsed as the base of several front-page style fighting games — now available for your own project.",
    features: [
      "Server-authoritative hitbox system (anti-exploit)",
      "M1 combo chains with custom animations",
      "Block, parry, stun and ragdoll states",
      "VFX / SFX hook framework with pooling",
      "Mobile, console & PC input support",
      "Single-module configuration",
    ],
    priceRobux: 2500,
    version: "2.1.0",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/abyss-combat.jpg"],
    status: "published",
    featured: true,
    updates: [
      { version: "2.1.0", notes: "New parry timing window config + controller haptics." },
      { version: "2.0.0", notes: "Full rewrite: server authority, pooled VFX, new combos." },
    ],
  },
  {
    slug: "datastore-pro",
    name: "DataStore Pro",
    category: "scripts",
    shortDescription:
      "Battle-tested DataStore wrapper with session locking, autosaves, retries and a clean API.",
    description:
      "DataStore Pro is the data layer you paste into every project and never think about again. Session locking prevents data loss from double-joins, autosaves run on an adaptive interval, and every API call is wrapped with exponential backoff retries.\n\nIncludes a ProfileService-style API, a mock mode for Studio testing, and migration helpers for moving legacy saves.\n\nStop losing player data. Seriously.",
    features: [
      "Session locking (no more double-join wipes)",
      "Adaptive autosave with retry & backoff",
      "Clean profile-style API",
      "Studio mock mode for safe testing",
      "Legacy save migration helpers",
      "Typed, documented source",
    ],
    priceRobux: 450,
    version: "1.8.3",
    studioVersion: "Roblox Studio 2023.2+",
    images: ["/products/datastore-pro.jpg"],
    status: "published",
    featured: true,
    updates: [
      { version: "1.8.3", notes: "Hardened retry logic for Roblox outage windows." },
      { version: "1.8.0", notes: "Added migration helpers and improved mock mode." },
    ],
  },
  {
    slug: "neon-ui-kit",
    name: "Neon UI Kit",
    category: "ui",
    shortDescription:
      "40+ polished dark-neon UI components with smooth tweens, theming and mobile scaling.",
    description:
      "Neon UI Kit gives your game the interface it deserves. Over 40 ready-made components — inventory grids, shop frames, settings panels, HUD elements, sliders, toggles, notifications and more — all styled in a sleek dark-neon theme.\n\nEvery component is themeable from one config module and animates with buttery tween presets. Automatic scaling keeps layouts crisp from phones to ultrawide monitors.\n\nShip a professional UI in days, not months.",
    features: [
      "40+ ready-to-use components",
      "One-config theming (colors, corners, strokes)",
      "Buttery tween & spring animation presets",
      "Automatic mobile / console scaling",
      "Matching icon pack included",
      "Clean, commented module code",
    ],
    priceRobux: 800,
    version: "3.0.1",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/neon-ui-kit.jpg"],
    status: "published",
    featured: true,
    updates: [
      { version: "3.0.1", notes: "Fixed notification stacking on small screens." },
      { version: "3.0.0", notes: "New component set: battle pass, quests & daily rewards." },
    ],
  },
  {
    slug: "tycoon-framework",
    name: "Tycoon Framework",
    category: "systems",
    shortDescription:
      "Complete tycoon backend: buttons, droppers, upgrades, saving and rebirths — prewired.",
    description:
      "The Tycoon Framework is a full backend for classic and modern tycoon games. Purchase buttons, droppers, conveyors, upgraders, currency handling, plot claiming and rebirths are all prewired and driven by a declarative config.\n\nBuilt on DataStore Pro for reliable saving, with anti-exploit server validation on every purchase.\n\nLaunch your tycoon this weekend.",
    features: [
      "Declarative tycoon config (no spaghetti)",
      "Buttons, droppers, conveyors & upgraders",
      "Plot claiming & player lifecycle",
      "Rebirth system with multipliers",
      "DataStore Pro saving built in",
      "Server-validated purchases",
    ],
    priceRobux: 3200,
    version: "1.2.0",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/tycoon-framework.jpg"],
    status: "published",
    featured: false,
    updates: [
      { version: "1.2.0", notes: "Added rebirth multipliers and new conveyor physics." },
      { version: "1.1.0", notes: "Plot claiming rewrite + offline earnings option." },
    ],
  },
  {
    slug: "ultimate-developer-bundle",
    name: "Ultimate Developer Bundle",
    category: "bundles",
    shortDescription:
      "Every flagship asset in one pack: Crystal Island, Abyss Combat, Neon UI and DataStore Pro.",
    description:
      "The Ultimate Developer Bundle packs our four flagship products into one discounted bundle: Crystal Island Map, Abyss Combat System, Neon UI Kit and DataStore Pro.\n\nYou get a complete foundation for a polished Roblox game — world, combat, interface and data — for 40% less than buying each product separately. Bundle owners receive every future update of all included products automatically.",
    features: [
      "Crystal Island Map (v1.4.2)",
      "Abyss Combat System (v2.1.0)",
      "Neon UI Kit (v3.0.1)",
      "DataStore Pro (v1.8.3)",
      "40% cheaper than separate purchases",
      "Lifetime updates for all included products",
    ],
    priceRobux: 5000,
    version: "1.0.0",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/dev-bundle.jpg"],
    status: "published",
    featured: true,
    updates: [{ version: "1.0.0", notes: "Initial bundle release." }],
  },
  {
    slug: "cyber-city-map",
    name: "Cyber City Map",
    category: "maps",
    shortDescription:
      "A dense neon cyberpunk city block with interiors, roads, signage and ambience scripts.",
    description:
      "Cyber City is a night-time neon metropolis: a fully dressed city block with enterable interiors, animated signage, road splines, graffiti-tagged alleys and ambient NPC pathing hooks.\n\nShips with a custom rain ambience script, optimized streaming chunks and an emissive-lighting preset that makes the whole city glow without melting frame rates.\n\nPerfect for roleplay, fighting and story games.",
    features: [
      "6 enterable interiors (bar, shop, HQ, apartments)",
      "Animated neon signage & billboards",
      "Rain + ambience script included",
      "NPC pathing hooks",
      "Streaming-chunk optimized",
      "Emissive lighting preset",
    ],
    priceRobux: 1800,
    version: "1.1.0",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/cyber-city.jpg"],
    status: "published",
    featured: false,
    updates: [
      { version: "1.1.0", notes: "New apartments interior + performance pass." },
      { version: "1.0.0", notes: "Initial release." },
    ],
  },
  {
    slug: "pet-system-x",
    name: "Pet System X",
    category: "gameplay-systems",
    shortDescription:
      "Hatching, inventories, rarities, trading-ready pets with smooth follow physics.",
    description:
      "Pet System X is the complete pet pipeline for simulator-style games: egg hatching with reveal animations, weighted rarities, pet inventories, equip limits, golden / rainbow variants and buttery follow physics.\n\nThe data layer is trading-ready and built on DataStore Pro, so pets persist reliably across sessions.\n\nFrom egg to equipped in one afternoon.",
    features: [
      "Egg hatching with reveal animations",
      "Weighted rarity system",
      "Inventory, equip limits & variants",
      "Smooth pet follow physics",
      "Trading-ready data structure",
      "DataStore Pro persistence",
    ],
    priceRobux: 1500,
    version: "2.4.0",
    studioVersion: "Roblox Studio 2024.1+",
    images: ["/products/pet-system.jpg"],
    status: "published",
    featured: false,
    updates: [
      { version: "2.4.0", notes: "Rainbow variants + hatch-3-opens." },
      { version: "2.3.0", notes: "Big follow-physics performance improvements." },
    ],
  },
];
