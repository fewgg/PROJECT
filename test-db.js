const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.kmkmkwslboqmahlrzcnm:R3vgtUJT6E2V1cd1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function check() {
  try {
    const res = await sql`SELECT id, name, image, created_at, updated_at FROM materials ORDER BY created_at DESC LIMIT 10`;
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
check();
