import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { getDb } from "./client";

export function runMigrations(db: ReturnType<typeof getDb>) {
  migrate(db, { migrationsFolder: path.resolve(__dirname, "../../drizzle") });
}
