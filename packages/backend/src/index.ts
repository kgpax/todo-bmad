import { buildApp } from "./app";
import { getConfig } from "./config";
import { getDb } from "./db/client";
import { runMigrations } from "./db/migrate";

const config = getConfig();
const db = getDb(config.DATABASE_PATH);
runMigrations(db);

const start = async () => {
  const app = buildApp(config);
  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
