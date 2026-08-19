const postgres = require('postgres');
const sql = postgres('postgresql://postgres.kmkmkwslboqmahlrzcnm:R3vgtUJT6E2V1cd1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS department TEXT;`;
    console.log('Added department column successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
run();
