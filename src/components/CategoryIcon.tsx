import { Map, Swords, Braces, Palette, Wrench, Package, Box, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  maps: Map,
  "gameplay-systems": Swords,
  scripts: Braces,
  ui: Palette,
  systems: Wrench,
  bundles: Package,
};

export default function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS[slug] ?? Box;
  return <Icon className={className} aria-hidden />;
}
