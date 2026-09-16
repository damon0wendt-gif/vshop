import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { formatRobux, categoryLabel } from "@/lib/constants";
import type { PublicProduct } from "@/lib/products";

export default function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="panel card-hover group flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-950/40">
            <CategoryIcon slug={product.category} className="h-10 w-10 text-violet-400/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/12 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md">
          <CategoryIcon slug={product.category} className="h-3 w-3 text-violet-300" />
          {categoryLabel(product.category)}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full border border-violet-400/30 bg-violet-600/85 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-violet-900/50 backdrop-blur-md">
          {formatRobux(product.priceRobux)}
        </div>

        {product.featured && (
          <div className="absolute bottom-3 left-3 rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md">
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight text-white transition-colors group-hover:text-violet-200">
            {product.name}
          </h3>
          <span className="mt-0.5 shrink-0 rounded-md border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            v{product.version}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-semibold text-violet-300">
            {formatRobux(product.priceRobux)}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-all duration-300 group-hover:gap-2.5 group-hover:text-white">
            View Product
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
