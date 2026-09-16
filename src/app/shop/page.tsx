import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { SearchX } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { publicProduct } from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import CategoryIcon from "@/components/CategoryIcon";
import Reveal from "@/components/Reveal";
import DiscordCta from "@/components/DiscordCta";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Premium Roblox maps, gameplay systems, scripts, UI kits and bundles.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.some((c) => c.slug === category) ? category : null;

  const conditions = [eq(products.status, "published")];
  if (active) conditions.push(eq(products.category, active));

  let items: ReturnType<typeof publicProduct>[] = [];
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.featured), desc(products.createdAt));
    items = rows.map(publicProduct);
  } catch {
    /* bootstrapping */
  }

  return (
    <div className="vx-container pb-8 pt-28 sm:pt-32">
      <Reveal>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-400">
          Marketplace
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          The Shop
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-500">
          Production-ready Roblox assets. Buy once, own forever, receive every
          update automatically.
        </p>
      </Reveal>

      {/* category filter */}
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link
            href="/shop"
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              !active
                ? "border-violet-400/50 bg-violet-600/20 text-white shadow-lg shadow-violet-950/40"
                : "border-white/10 bg-white/4 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
          >
            All Products
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active === c.slug
                  ? "border-violet-400/50 bg-violet-600/20 text-white shadow-lg shadow-violet-950/40"
                  : "border-white/10 bg-white/4 text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <CategoryIcon slug={c.slug} className="h-3.5 w-3.5" />
              {c.label}
            </Link>
          ))}
        </div>
      </Reveal>

      {/* grid */}
      {items.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 5) * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="panel mt-10 flex flex-col items-center gap-4 rounded-3xl px-6 py-20 text-center">
          <SearchX className="h-10 w-10 text-zinc-600" />
          <p className="font-display text-lg font-semibold text-white">
            No products in this category yet
          </p>
          <p className="max-w-sm text-sm text-zinc-500">
            New assets are released regularly — join the Discord to vote on what
            I build next.
          </p>
          <Link
            href="/shop"
            className="mt-2 rounded-xl border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            View everything
          </Link>
        </div>
      )}

      <div className="mt-24">
        <DiscordCta />
      </div>
    </div>
  );
}
