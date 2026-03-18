#!/usr/bin/env node

/**
 * Resets the backend SQLite database by deleting the DB files.
 * Schema is re-applied automatically on the next server start.
 *
 * Usage: node scripts/db-reset.js
 */

const fs = require("fs");
const path = require("path");

const DB_DIR = path.resolve(__dirname, "..", "packages", "backend", "data");
const DB_FILES = ["todos.db", "todos.db-shm", "todos.db-wal"];

for (const file of DB_FILES) {
  const filePath = path.join(DB_DIR, file);
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${filePath}`);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

console.log("DB reset. Schema will be re-applied on next server start.");
