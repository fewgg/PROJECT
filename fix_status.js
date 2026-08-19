const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
  try {
    console.log("Updating materials status based on quantity...");
    const result = await sql`
      UPDATE materials 
      SET status = CASE 
                     WHEN quantity <= 0 THEN 'OUT_OF_STOCK'
                     WHEN quantity <= 5 THEN 'LOW_STOCK'
                     ELSE 'AVAILABLE'
                   END
    `;
    console.log("Update complete. Rows affected:", result.count);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
