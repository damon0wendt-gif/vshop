import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import AdminTabs from "@/components/admin/AdminTabs";

export const dynamic = "force-dynamic";

/**
 * Server-side guard for the entire /admin tree. Non-admin users are bounced
 * before any admin markup renders — the dashboard is never exposed.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="vx-container pb-8 pt-28 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Owner only
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
        </div>
        <AdminTabs />
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
