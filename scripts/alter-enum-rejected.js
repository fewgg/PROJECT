const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Altering transaction_status enum to add 'RETURN_REJECTED'...");
    await sql`ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'RETURN_REJECTED';`;
    console.log("transaction_status enum altered successfully.");
  } catch (error) {
    console.error("Failed to alter enum:", error);
  } finally {
    await sql.end();
  }
}

run();
