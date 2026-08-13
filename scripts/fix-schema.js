require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function fixSchema() {
  try {
    console.log("Fixing DB schema...");
    
    // Add unique constraint to categories if it doesn't exist
    try {
      await sql`ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name)`;
    } catch (e) {
      console.log("Constraint might already exist or error:", e.message);
    }

    // Seed categories
    const defaultCategories = ['วัสดุคอมพิวเตอร์และไอที', 'วัสดุสำนักงาน', 'วัสดุทำความสะอาด', 'วัสดุช่างและอุปกรณ์ทั่วไป'];
    for (const name of defaultCategories) {
      await sql`INSERT INTO categories (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
    }
    console.log("Seeded categories.");

    // Fix transactions table material_id type and foreign key
    await sql`TRUNCATE TABLE transactions`;
    
    await sql`ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_material`;
    await sql`ALTER TABLE transactions ALTER COLUMN material_id TYPE VARCHAR(255)`;
    await sql`ALTER TABLE transactions ADD CONSTRAINT fk_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE`;
    
    console.log("Fixed transactions table schema.");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fixSchema();
