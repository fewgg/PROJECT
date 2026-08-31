const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("1. Adding requires_return column to categories table...");
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS requires_return BOOLEAN DEFAULT FALSE;`;
    console.log("requires_return column added to categories table successfully.");

    console.log("2. Setting all existing categories to requires_return = FALSE...");
    await sql`UPDATE categories SET requires_return = FALSE;`;
    console.log("All categories updated to FALSE.");

    console.log("3. Syncing materials requires_return from their categories...");
    // Update materials matching categories
    await sql`
      UPDATE materials m
      SET requires_return = c.requires_return
      FROM categories c
      WHERE m.category = c.name
    `;
    // For materials that don't match any category, default to FALSE (consumable)
    await sql`
      UPDATE materials
      SET requires_return = FALSE
      WHERE category NOT IN (SELECT name FROM categories)
    `;
    console.log("Materials synced successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
