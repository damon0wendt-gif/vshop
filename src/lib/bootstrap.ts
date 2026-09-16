import "server-only";
import { pool, db } from "@/db";
import { products, productUpdates } from "@/db/schema";
import { SEED_PRODUCTS } from "./seed-data";

let ran = false;

/**
 * Self-initializing bootstrap: creates tables when missing and seeds the demo
 * catalog. Idempotent — safe to run on every server start. This guarantees the
 * app works on any fresh PostgreSQL instance (previews, CI, local dev).
 */
export async function ensureDatabase(): Promise<void> {
  if (ran) return;
  ran = true;
  await ensureSchema();
  await seedIfEmpty();
}

async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      roblox_id text NOT NULL UNIQUE,
      username text NOT NULL,
      display_name text NOT NULL,
      email text,
      avatar_url text,
      is_admin boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  // Safe migration for databases created before the email column existed.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL UNIQUE,
      roblox_access_token text,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);`,
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      category text NOT NULL,
      short_description text NOT NULL,
      description text NOT NULL,
      features jsonb NOT NULL DEFAULT '[]'::jsonb,
      price_robux integer NOT NULL DEFAULT 0,
      version text NOT NULL DEFAULT '1.0.0',
      studio_version text NOT NULL DEFAULT 'Roblox Studio 2024+',
      images jsonb NOT NULL DEFAULT '[]'::jsonb,
      file_url text,
      file_name text,
      game_pass_id text,
      status text NOT NULL DEFAULT 'draft',
      featured boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'completed',
      price_paid integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_product_idx ON purchases(user_id, product_id);`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);`,
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_updates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      version text NOT NULL,
      notes text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS product_updates_product_id_idx ON product_updates(product_id);`,
  );
}

async function seedIfEmpty(): Promise<void> {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) return;

  for (const seed of SEED_PRODUCTS) {
    const { updates, ...product } = seed;
    const inserted = await db
      .insert(products)
      .values({
        ...product,
        fileName: `${seed.slug}-v${seed.version}.rbxm`,
      })
      .returning({ id: products.id });
    const productId = inserted[0]?.id;
    if (!productId) continue;
    for (const update of updates) {
      await db.insert(productUpdates).values({ productId, ...update });
    }
  }
  console.log(`[bootstrap] Seeded ${SEED_PRODUCTS.length} products.`);
}
