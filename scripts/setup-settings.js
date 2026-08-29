const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Creating system_settings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;

    console.log("Seeding default settings...");
    const defaults = {
      schoolName: "วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร",
      systemName: "ระบบบริหารคลังพัสดุ ",
      contactEmail: "admin@.ac.th",
      notifyOnNewRequest: true,
      notifyOnLowStock: true,
      autoApproveSmallRequests: false,
    };

    for (const [key, val] of Object.entries(defaults)) {
      await sql`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(val)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO NOTHING;
      `;
    }

    console.log("Migration and seeding completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
