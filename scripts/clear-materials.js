const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Clearing all materials from database (TRUNCATE CASCADE)...");
    await sql`TRUNCATE TABLE materials CASCADE;`;
    console.log("Materials and related transactions cleared successfully.");
  } catch (error) {
    console.error("Failed to clear materials:", error);
  } finally {
    await sql.end();
  }
}

run();
