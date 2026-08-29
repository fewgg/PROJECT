const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function test() {
  try {
    // 1. Test querying settings
    console.log("Testing settings query...");
    const [settingRow] = await sql`
      SELECT value FROM system_settings WHERE key = 'autoApproveSmallRequests'
    `;
    console.log("Settings query success, value:", settingRow ? settingRow.value : "not found");

    // 2. Test materials query
    console.log("Testing materials query...");
    const materials = await sql`SELECT id, name, quantity FROM materials LIMIT 1`;
    console.log("Materials query success, count:", materials.length);
    if (materials.length > 0) {
      console.log("Material sample:", materials[0]);
    }

    console.log("All DB queries tested successfully!");
  } catch (error) {
    console.error("DB query test failed:", error);
  } finally {
    await sql.end();
  }
}

test();
