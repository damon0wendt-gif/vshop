"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Star,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
  Package,
} from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import { categoryLabel, formatRobux } from "@/lib/constants";

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceRobux: number;
  version: string;
  status: string;
  featured: boolean;
  image: string | null;
  sales: number;
}

export default function ProductsTable({ rows }: { rows: AdminProductRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: string, body: Record<string, unknown>, method = "PATCH") => {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (row: AdminProductRow) => {
    if (
      !window.confirm(
        `Delete "${row.name}" permanently? Owners will lose access. This cannot be undone.`,
      )
    ) {
      return;
    }
    await mutate(row.id, {}, "DELETE");
  };

  if (rows.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
        <Package className="h-9 w-9 text-zinc-600" />
        <p className="font-display text-lg font-semibold text-white">No products yet</p>
        <p className="max-w-sm text-sm text-zinc-500">
          Create your first product to start selling.
        </p>
        <Link
          href="/admin/products/new"
          className="btn-glow mt-1 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          New Product
        </Link>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-2xl">
      {error && (
        <p className="border-b border-red-500/20 bg-red-500/10 px-6 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-[11px] uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-4 py-4 font-semibold">Category</th>
              <th className="px-4 py-4 font-semibold">Price</th>
              <th className="px-4 py-4 font-semibold">Version</th>
              <th className="px-4 py-4 font-semibold">Sales</th>
              <th className="px-4 py-4 font-semibold">Status</th>
              <th className="px-4 py-4 font-semibold">Featured</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-white/2">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated">
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-950/40">
                          <CategoryIcon slug={row.category} className="h-4 w-4 text-violet-400/60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{row.name}</p>
                      <p className="truncate font-mono text-[11px] text-zinc-600">/{row.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <CategoryIcon slug={row.category} className="h-3.5 w-3.5 text-violet-400" />
                    {categoryLabel(row.category)}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-zinc-200">
                  {formatRobux(row.priceRobux)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-md border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                    v{row.version}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-zinc-300">{row.sales}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={row.status}
                    disabled={pendingId === row.id}
                    onChange={(e) => mutate(row.id, { status: e.target.value })}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors disabled:opacity-50 ${
                      row.status === "published"
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                        : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                    } [&>option]:bg-panel [&>option]:text-zinc-200`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    disabled={pendingId === row.id}
                    onClick={() => mutate(row.id, { featured: !row.featured })}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:opacity-50 ${
                      row.featured
                        ? "border-amber-300/40 bg-amber-500/15 text-amber-300"
                        : "border-white/10 bg-white/4 text-zinc-600 hover:text-zinc-300"
                    }`}
                    aria-label="Toggle featured"
                  >
                    <Star className={`h-4 w-4 ${row.featured ? "fill-amber-300" : ""}`} />
                  </button>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {pendingId === row.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    )}
                    {row.status === "published" && (
                      <Link
                        href={`/shop/${row.slug}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-500 transition-colors hover:text-white"
                        aria-label="View live product"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/products/${row.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-400 transition-colors hover:border-violet-400/40 hover:text-violet-300"
                      aria-label="Edit product"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === row.id}
                      onClick={() => remove(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-500 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
