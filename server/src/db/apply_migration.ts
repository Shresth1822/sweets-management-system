import fs from "fs";
import path from "path";
import { query } from "./index";

const runMigration = async () => {
  try {
    const migrationPath = path.join(
      __dirname,
      "migrations/002_create_transactions.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration 002...");
    await query(sql);
    console.log("Migration 002 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
