"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, ExternalLink } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/products/new", label: "New Product", icon: PlusCircle, exact: false },
];

export default function AdminTabs() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) &&
      !(href === "/admin/products" && pathname === "/admin/products/new");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            isActive(tab.href, tab.exact)
              ? "border-violet-400/50 bg-violet-600/20 text-white"
              : "border-white/10 bg-white/4 text-zinc-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <tab.icon className="h-3.5 w-3.5" />
          {tab.label}
        </Link>
      ))}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-white/20 hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View Site
      </Link>
    </div>
  );
}
