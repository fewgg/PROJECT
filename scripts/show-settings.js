const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  const rows = await sql`SELECT * FROM system_settings`;
  console.log(rows);
  await sql.end();
}

run();
