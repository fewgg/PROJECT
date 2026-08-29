const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    const key = "test_schoolName";
    const value = "วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร";

    console.log("Method 1: Using plain value directly into JSONB...");
    try {
      await sql`
        INSERT INTO system_settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      const [row] = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
      console.log("Success! Plain value type:", typeof row.value, "value:", row.value);
    } catch (e) {
      console.log("Failed with plain value:", e.message);
    }

    console.log("Method 2: Using JSON.stringify without casting...");
    try {
      await sql`
        INSERT INTO system_settings (key, value)
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      const [row] = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
      console.log("Success! Stringify value type:", typeof row.value, "value:", row.value);
    } catch (e) {
      console.log("Failed with Stringify value:", e.message);
    }

    console.log("Method 3: Using sql.json()...");
    try {
      await sql`
        INSERT INTO system_settings (key, value)
        VALUES (${key}, ${sql.json(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      const [row] = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
      console.log("Success! sql.json value type:", typeof row.value, "value:", row.value);
    } catch (e) {
      console.log("Failed with sql.json:", e.message);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
