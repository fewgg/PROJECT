const postgres = require('postgres');
const sql = postgres('postgresql://postgres.kmkmkwslboqmahlrzcnm:R3vgtUJT6E2V1cd1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    const res = await sql`SELECT * FROM materials LIMIT 1`;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
