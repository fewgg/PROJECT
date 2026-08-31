const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Creating user_favorites table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        material_id VARCHAR(255) NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_material UNIQUE (user_id, material_id)
      );
    `;
    console.log("user_favorites table created successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
