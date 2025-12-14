import { query } from "./index";

const migrate = async () => {
  try {
    console.log("Running migration...");
    await query("ALTER TABLE sweets ADD COLUMN IF NOT EXISTS description TEXT");
    await query("ALTER TABLE sweets ADD COLUMN IF NOT EXISTS image_url TEXT");
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
