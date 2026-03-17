import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export function getDb(databasePath: string) {
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  return drizzle({ client: sqlite, schema });
}
