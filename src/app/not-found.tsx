import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="vx-container flex min-h-[80vh] flex-col items-center justify-center pt-20 text-center">
      <p className="font-display text-8xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">
        This page wandered off the map
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        The product or page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/shop"
        className="btn-glow mt-8 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
      >
        <Compass className="h-4 w-4" />
        Back to the Shop
      </Link>
    </div>
  );
}
