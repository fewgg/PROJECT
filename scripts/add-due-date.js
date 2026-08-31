const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("1. Adding borrow_duration_days column to transactions...");
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS borrow_duration_days INTEGER;`;
    
    console.log("2. Adding due_date column to transactions...");
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;`;
    
    console.log("Database migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
