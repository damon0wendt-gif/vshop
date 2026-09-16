import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  robloxId: text("roblox_id").notNull().unique(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  // Only present for the owner account (demo mode). Roblox OAuth does not
  // share user emails, so real-account admin rights bind to ADMIN_ROBLOX_IDS.
  email: text("email"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    robloxAccessToken: text("roblox_access_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  priceRobux: integer("price_robux").notNull().default(0),
  version: text("version").notNull().default("1.0.0"),
  studioVersion: text("studio_version").notNull().default("Roblox Studio 2024+"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  // Delivery target. NEVER exposed to the public — only served through the
  // authenticated download endpoint after a verified purchase.
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  // Official Roblox Game Pass id used for the Roblox-native payment flow.
  gamePassId: text("game_pass_id"),
  status: text("status").notNull().default("draft"), // "draft" | "published"
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("completed"), // "completed" | "pending"
    pricePaid: integer("price_paid").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("purchases_user_product_idx").on(t.userId, t.productId),
    index("purchases_user_id_idx").on(t.userId),
  ],
);

export const productUpdates = pgTable(
  "product_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    notes: text("notes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("product_updates_product_id_idx").on(t.productId)],
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type ProductUpdate = typeof productUpdates.$inferSelect;
