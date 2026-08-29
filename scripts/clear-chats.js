const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Clearing all chat messages from database (TRUNCATE)...");
    await sql`TRUNCATE TABLE messages;`;
    console.log("Chat messages cleared successfully.");
  } catch (error) {
    console.error("Failed to clear chat messages:", error);
  } finally {
    await sql.end();
  }
}

run();
