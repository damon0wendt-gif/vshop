export const SITE = {
  name: "VELOX",
  suffix: "STUDIOS",
  fullName: "VELOX Studios",
  description: "High-quality assets and systems made for Roblox developers.",
  discordInvite:
    process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/your-server",
} as const;

export type CategorySlug =
  | "maps"
  | "gameplay-systems"
  | "scripts"
  | "ui"
  | "systems"
  | "bundles";

export interface Category {
  slug: CategorySlug;
  label: string;
  tagline: string;
}

export const CATEGORIES: Category[] = [
  { slug: "maps", label: "Maps", tagline: "Ready-to-play worlds" },
  { slug: "gameplay-systems", label: "Gameplay Systems", tagline: "Combat, pets & progression" },
  { slug: "scripts", label: "Scripts", tagline: "Drop-in code modules" },
  { slug: "ui", label: "UI", tagline: "Interfaces & HUD kits" },
  { slug: "systems", label: "Systems", tagline: "Frameworks & backends" },
  { slug: "bundles", label: "Bundles", tagline: "Everything, discounted" },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [
  CategorySlug,
  ...CategorySlug[],
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatRobux(amount: number): string {
  return `${amount.toLocaleString("en-US")} R$`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
