const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  try {
    const result = await sql`
      UPDATE transactions 
      SET due_date = NOW() - INTERVAL '2 days'
      WHERE status IN ('APPROVED', 'RETURN_REJECTED')
    `;
    console.log("Successfully updated transactions to be overdue. Rows affected:", result.count);
  } catch (e) {
    console.error("Failed to update transactions in DB:", e);
  } finally {
    await sql.end();
  }
}
run();
