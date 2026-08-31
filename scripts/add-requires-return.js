const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Adding requires_return column to materials...");
    await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS requires_return BOOLEAN DEFAULT TRUE;`;
    console.log("Column added successfully.");
  } catch (error) {
    console.error("Failed to add column:", error);
  } finally {
    await sql.end();
  }
}

run();
