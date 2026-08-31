const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Cleaning up materials referencing deleted categories...");
    const result = await sql`
      UPDATE materials 
      SET category = 'ไม่มีหมวดหมู่' 
      WHERE category IS NOT NULL 
      AND category NOT IN (SELECT name FROM categories)
    `;
    console.log(`Cleanup complete. Updated ${result.count} materials.`);
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await sql.end();
  }
}

run();
