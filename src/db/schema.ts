import { pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export enum Tier {
  Free = "free",
  Pro = "pro",
}

export const profiles = pgTable("profiles", {
  user_id: text("user_id").primaryKey(),
  credits: integer("credits").notNull().default(3),
  tier: text("tier").notNull().default(Tier.Free),
  stripe_customer_id: text("stripe_customer_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const images = pgTable("images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  image_url: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  likes_count: integer("likes_count").default(0).notNull(),
  creator_user_id: text("creator_user_id")
    .notNull()
    .references(() => profiles.user_id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const imageLikes = pgTable("image_likes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  user_id: text("user_id").references(() => profiles.user_id),
  image_id: integer("image_id").references(() => images.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type inference for inserts and selects based on existing tables
export type InsertProfile = typeof profiles.$inferInsert;
export type SelectProfile = typeof profiles.$inferSelect;
export type InsertImage = typeof images.$inferInsert;
export type SelectImage = typeof images.$inferSelect;
export type InsertImageLike = typeof imageLikes.$inferInsert;
export type SelectImageLike = typeof imageLikes.$inferSelect;
