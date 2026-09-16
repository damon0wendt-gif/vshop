import "server-only";
import { z } from "zod";
import type { Product } from "@/db/schema";
import { CATEGORY_SLUGS } from "./constants";

export const productInputSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes")
    .min(2)
    .max(80)
    .optional(),
  category: z.enum(CATEGORY_SLUGS),
  shortDescription: z.string().min(4).max(220),
  description: z.string().min(10).max(8000),
  features: z.array(z.string().min(1).max(140)).max(24).default([]),
  priceRobux: z.number().int().min(0).max(1_000_000),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must look like 1.0.0")
    .default("1.0.0"),
  studioVersion: z.string().min(2).max(80).default("Roblox Studio 2024+"),
  images: z.array(z.string().min(1).max(3_500_000)).max(8).default([]),
  fileUrl: z.string().max(2000).nullable().optional(),
  fileName: z.string().max(200).nullable().optional(),
  gamePassId: z.string().max(40).nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  changelogNotes: z.string().max(1500).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export interface PublicProduct {
  id: string;
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
  featured: boolean;
  createdAt: string;
}

/** Public shape — strictly no delivery URLs, credentials or draft metadata. */
export function publicProduct(p: Product): PublicProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    shortDescription: p.shortDescription,
    description: p.description,
    features: p.features,
    priceRobux: p.priceRobux,
    version: p.version,
    studioVersion: p.studioVersion,
    images: p.images,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Admin shape — includes delivery target + publishing metadata. */
export function adminProduct(p: Product) {
  return {
    ...publicProduct(p),
    status: p.status,
    fileUrl: p.fileUrl,
    fileName: p.fileName,
    gamePassId: p.gamePassId,
    updatedAt: p.updatedAt.toISOString(),
  };
}
