const postgres = require('postgres');
const sql = postgres('postgresql://postgres.kmkmkwslboqmahlrzcnm:R3vgtUJT6E2V1cd1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE
      );
    `;
    console.log('Created messages table successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
run();
