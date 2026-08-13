const postgres = require('postgres')

const sql = postgres('postgresql://postgres.kmkmkwslboqmahlrzcnm:fewggtv7300@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' })

async function migrate() {
  console.log('Running migrations...')
  
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      unit TEXT NOT NULL,
      balance INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `

  await sql`
    DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('INBOUND', 'OUTBOUND');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
  `
  
  await sql`
    DO $$ BEGIN
        CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      type transaction_type NOT NULL,
      quantity INTEGER NOT NULL,
      status transaction_status DEFAULT 'COMPLETED'::transaction_status NOT NULL,
      remark TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `

  // Insert seed data
  const cats = await sql`SELECT * FROM categories`
  if (cats.length === 0) {
    console.log('Seeding data...')
    const [cat1] = await sql`INSERT INTO categories (name, description) VALUES ('วัสดุสำนักงาน', 'ของใช้ในออฟฟิศทั่วไป') RETURNING id`
    const [cat2] = await sql`INSERT INTO categories (name, description) VALUES ('อุปกรณ์คอมพิวเตอร์', 'อุปกรณ์ไอทีต่างๆ') RETURNING id`
    const [cat3] = await sql`INSERT INTO categories (name, description) VALUES ('อุปกรณ์อิเล็กทรอนิกส์', 'วงจรและเครื่องมือไฟฟ้า') RETURNING id`

    await sql`INSERT INTO materials (category_id, name, unit, balance) VALUES (${cat1.id}, 'กระดาษ A4 80 แกรม', 'รีม', 150)`
    await sql`INSERT INTO materials (category_id, name, unit, balance) VALUES (${cat1.id}, 'ปากกาน้ำเงิน 0.5mm', 'กล่อง', 500)`
    await sql`INSERT INTO materials (category_id, name, unit, balance) VALUES (${cat1.id}, 'ปากกาไวท์บอร์ด', 'กล่อง', 12)`
    await sql`INSERT INTO materials (category_id, name, unit, balance) VALUES (${cat2.id}, 'สายแลน Cat6', 'เมตร', 0)`
    await sql`INSERT INTO materials (category_id, name, unit, balance) VALUES (${cat3.id}, 'หลอดภาพโปรเจคเตอร์', 'ชิ้น', 3)`
  }

  console.log('Done!')
  process.exit(0)
}

migrate().catch(err => {
  console.error(err)
  process.exit(1)
})
