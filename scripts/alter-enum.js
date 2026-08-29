const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Altering transaction_status enum to add 'RETURN_PENDING'...");
    // ALTER TYPE ADD VALUE cannot run inside transaction, but postgres() handles it well here
    await sql`ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'RETURN_PENDING';`;
    console.log("transaction_status enum altered successfully.");
  } catch (error) {
    console.error("Failed to alter enum:", error);
  } finally {
    await sql.end();
  }
}

run();
