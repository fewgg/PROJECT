const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    const key = "schoolName";
    const value = "วิทยาลัยเทคโนโลยีแห่งใหม่";
    
    await sql`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${key}, ${sql.json(value)}, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
    
    const [row] = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
    console.log("Updated value in DB:", row.value);
  } catch (e) {
    console.error("Failed to update:", e);
  } finally {
    await sql.end();
  }
}
run();
