import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser, toSafeUser } from "@/lib/session";
import { SITE } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.fullName} — Premium Roblox Maps & Gameplay Systems`,
    template: `%s · ${SITE.fullName}`,
  },
  description: SITE.description,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-void font-sans text-zinc-300 antialiased">
        {/* Ambient background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,black,transparent)]" />
          <div className="animate-pulse-glow absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-violet-700/14 blur-[140px]" />
          <div className="absolute top-[60%] -left-40 h-[26rem] w-[26rem] rounded-full bg-fuchsia-700/8 blur-[120px]" />
          <div className="absolute -right-40 top-[30%] h-[22rem] w-[22rem] rounded-full bg-indigo-700/10 blur-[120px]" />
        </div>

        <Navbar user={user ? toSafeUser(user) : null} />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
