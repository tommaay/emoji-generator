import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema, casing: "snake_case" });

// Migration function
export async function migrate() {
  if (process.env.NODE_ENV === "production") return;
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  await migrate(db, { migrationsFolder: "drizzle" });
}
