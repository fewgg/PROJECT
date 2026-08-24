require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function main() {
  // Check current columns
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages' ORDER BY ordinal_position`;
  console.log('Current columns:', JSON.stringify(cols));

  // Add image_url column if not exists
  try {
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL`;
    console.log('Added image_url column');
  } catch (e) {
    console.log('image_url column error:', e.message);
  }

  // Add is_deleted column if not exists
  try {
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`;
    console.log('Added is_deleted column');
  } catch (e) {
    console.log('is_deleted column error:', e.message);
  }

  // Verify
  const cols2 = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages' ORDER BY ordinal_position`;
  console.log('Updated columns:', JSON.stringify(cols2));

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
