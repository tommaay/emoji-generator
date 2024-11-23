import { pgTable, text, timestamp, integer, numeric, primaryKey } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  credits: integer("credits").notNull().default(3),
  tier: text("tier").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emojis = pgTable("emojis", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  likesCount: numeric("likes_count").default("0"),
  creatorUserId: text("creator_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const emojiLikes = pgTable(
  "emoji_likes",
  {
    userId: text("user_id").references(() => profiles.userId),
    emojiId: integer("emoji_id").references(() => emojis.id),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.userId, table.emojiId],
      }),
    };
  }
);
