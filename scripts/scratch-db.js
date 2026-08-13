require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function checkDb() {
  const mCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='materials'`;
  console.log("Materials columns:", mCols);
  
  process.exit(0);
}

checkDb();
