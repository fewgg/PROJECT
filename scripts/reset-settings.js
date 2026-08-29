const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    console.log("Cleaning up current settings...");
    await sql`DELETE FROM system_settings;`;

    console.log("Re-seeding clean default settings...");
    const defaults = {
      schoolName: "วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร",
      systemName: "ระบบบริหารคลังพัสดุและเบิกจ่ายพัสดุ",
      contactEmail: "fuse7300@gmail.com",
      notifyOnNewRequest: true,
      notifyOnLowStock: true,
      autoApproveSmallRequests: false,
    };

    for (const [key, val] of Object.entries(defaults)) {
      await sql`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (${key}, ${sql.json(val)}, CURRENT_TIMESTAMP);
      `;
    }

    console.log("Database reset completed successfully.");
  } catch (error) {
    console.error("Database reset failed:", error);
  } finally {
    await sql.end();
  }
}

run();
