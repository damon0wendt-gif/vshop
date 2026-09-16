import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, purchases } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ productId: string }> };

/**
 * Protected delivery endpoint. Product files are NEVER linked publicly —
 * access is granted only after a verified, completed purchase. Delivery
 * always serves the latest published version, so buyers receive updates
 * automatically.
 */
export async function GET(request: NextRequest, ctx: Ctx) {
  const { productId } = await ctx.params;
  const origin = request.nextUrl.origin;

  const user = await getSessionUser();
  if (!user) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", "/purchases");
    return NextResponse.redirect(login);
  }

  const rl = rateLimit(`download:${user.id}:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const productRows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  const product = productRows[0];
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const purchaseRows = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, user.id),
        eq(purchases.productId, productId),
        eq(purchases.status, "completed"),
      ),
    )
    .limit(1);

  if (!purchaseRows[0]) {
    return NextResponse.json(
      { error: "You need to own this product before downloading it." },
      { status: 403 },
    );
  }

  // Preferred: redirect to the privately hosted delivery file.
  if (product.fileUrl) {
    return NextResponse.redirect(product.fileUrl);
  }

  // Fallback: generate a delivery manifest / license file on the fly.
  const manifest = [
    "===============================================================",
    `  VELOX STUDIOS — PRODUCT DELIVERY`,
    "===============================================================",
    "",
    `  Product        : ${product.name}`,
    `  Category       : ${product.category}`,
    `  Version        : ${product.version}`,
    `  Compatibility  : ${product.studioVersion}`,
    `  Licensed to    : ${user.displayName} (@${user.username})`,
    `  Roblox User ID : ${user.robloxId}`,
    `  Delivered at   : ${new Date().toISOString()}`,
    "",
    "  This license is personal and non-transferable.",
    "  You always receive the latest version of this product",
    "  through your VELOX Studios purchases page.",
    "",
    "  Need help? Chat with us on Discord.",
    "===============================================================",
  ].join("\n");

  const safeName = (product.fileName ?? `${product.slug}-v${product.version}.txt`).replace(
    /[^\w.\-]+/g,
    "-",
  );

  return new Response(manifest, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName.replace(/\.rbxm$/, ".txt")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
