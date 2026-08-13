const postgres = require("postgres");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Mock data (hardcoded here to avoid TS import issues)
const INVENTORY_DATA = [
  // 💻 วัสดุคอมพิวเตอร์และไอที (15)
  { id: "it-01", name: "เมาส์", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", quantity: 20, status: "AVAILABLE", unit: "อัน", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-02", name: "คีย์บอร์ด", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", quantity: 15, status: "AVAILABLE", unit: "อัน", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-03", name: "USB Flash Drive", image: "https://images.unsplash.com/photo-1605372439169-f1fb011e0dc4?w=500&q=80", quantity: 30, status: "AVAILABLE", unit: "อัน", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-04", name: "สาย LAN", image: "https://images.unsplash.com/photo-1558227691-41ea78d1f631?w=500&q=80", quantity: 50, status: "AVAILABLE", unit: "เส้น", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-05", name: "หัว RJ45", image: "https://images.unsplash.com/photo-1544131551-7890cc328135?w=500&q=80", quantity: 200, status: "AVAILABLE", unit: "ตัว", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-06", name: "สาย HDMI", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80", quantity: 25, status: "AVAILABLE", unit: "เส้น", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-07", name: "สาย VGA", image: "https://images.unsplash.com/photo-1624823183495-2c8eb1608920?w=500&q=80", quantity: 10, status: "LOW_STOCK", unit: "เส้น", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-08", name: "สาย USB", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80", quantity: 40, status: "AVAILABLE", unit: "เส้น", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-09", name: "แผ่นรองเมาส์", image: "https://images.unsplash.com/photo-1616886470308-2e0f0bd4267f?w=500&q=80", quantity: 15, status: "LOW_STOCK", unit: "แผ่น", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-10", name: "หมึกพิมพ์", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80", quantity: 5, status: "LOW_STOCK", unit: "ขวด", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-11", name: "ตลับหมึก", image: "https://images.unsplash.com/photo-1598285526017-f58cda7eebc5?w=500&q=80", quantity: 3, status: "LOW_STOCK", unit: "ตลับ", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-12", name: "โทนเนอร์", image: "https://images.unsplash.com/photo-1588698188151-5125206ec4a3?w=500&q=80", quantity: 0, status: "OUT_OF_STOCK", unit: "ตลับ", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-13", name: "แฟลชไดรฟ์", image: "https://images.unsplash.com/photo-1605372439169-f1fb011e0dc4?w=500&q=80", quantity: 12, status: "LOW_STOCK", unit: "อัน", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-14", name: "แบตเตอรี่สำรอง", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80", quantity: 8, status: "LOW_STOCK", unit: "ก้อน", category: "วัสดุคอมพิวเตอร์และไอที" },
  { id: "it-15", name: "ถ่านไฟฉาย", image: "https://images.unsplash.com/photo-1611119575193-41ee3f11d619?w=500&q=80", quantity: 45, status: "AVAILABLE", unit: "ก้อน", category: "วัสดุคอมพิวเตอร์และไอที" },

  // 📝 วัสดุสำนักงาน (15)
  { id: "off-01", name: "กระดาษ A4", image: "https://images.unsplash.com/photo-1585435422894-672520864eb1?w=500&q=80", quantity: 100, status: "AVAILABLE", unit: "รีม", category: "วัสดุสำนักงาน" },
  { id: "off-02", name: "กระดาษสี", image: "https://images.unsplash.com/photo-1601000676451-b847a9ee0df7?w=500&q=80", quantity: 20, status: "AVAILABLE", unit: "รีม", category: "วัสดุสำนักงาน" },
  { id: "off-03", name: "ปากกาลูกลื่น", image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80", quantity: 150, status: "AVAILABLE", unit: "ด้าม", category: "วัสดุสำนักงาน" },
  { id: "off-04", name: "ดินสอ", image: "https://images.unsplash.com/photo-1580977227446-07f90380f2d4?w=500&q=80", quantity: 100, status: "AVAILABLE", unit: "แท่ง", category: "วัสดุสำนักงาน" },
  { id: "off-05", name: "ยางลบ", image: "https://images.unsplash.com/photo-1615598696008-62d1a3be095d?w=500&q=80", quantity: 50, status: "AVAILABLE", unit: "ก้อน", category: "วัสดุสำนักงาน" },
  { id: "off-06", name: "ปากกาเน้นข้อความ", image: "https://images.unsplash.com/photo-1527334919515-b8dee906a34b?w=500&q=80", quantity: 30, status: "AVAILABLE", unit: "ด้าม", category: "วัสดุสำนักงาน" },
  { id: "off-07", name: "ปากกาไวท์บอร์ด", image: "https://images.unsplash.com/photo-1580569214296-5cb2bfc41fa1?w=500&q=80", quantity: 40, status: "AVAILABLE", unit: "ด้าม", category: "วัสดุสำนักงาน" },
  { id: "off-08", name: "สมุด", image: "https://images.unsplash.com/photo-1531346878377-a541e4ab69bc?w=500&q=80", quantity: 80, status: "AVAILABLE", unit: "เล่ม", category: "วัสดุสำนักงาน" },
  { id: "off-09", name: "แฟ้มเอกสาร", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80", quantity: 60, status: "AVAILABLE", unit: "แฟ้ม", category: "วัสดุสำนักงาน" },
  { id: "off-10", name: "ซองเอกสาร", image: "https://images.unsplash.com/photo-1588514528373-6789e5d4816c?w=500&q=80", quantity: 120, status: "AVAILABLE", unit: "ซอง", category: "วัสดุสำนักงาน" },
  { id: "off-11", name: "ลวดเย็บกระดาษ", image: "https://images.unsplash.com/photo-1623916999252-78d10b005115?w=500&q=80", quantity: 40, status: "AVAILABLE", unit: "กล่อง", category: "วัสดุสำนักงาน" },
  { id: "off-12", name: "เครื่องเย็บกระดาษ", image: "https://images.unsplash.com/photo-1522880928233-a3d8272de3ba?w=500&q=80", quantity: 15, status: "LOW_STOCK", unit: "อัน", category: "วัสดุสำนักงาน" },
  { id: "off-13", name: "คลิปหนีบกระดาษ", image: "https://images.unsplash.com/photo-1502920514313-52581002a659?w=500&q=80", quantity: 35, status: "AVAILABLE", unit: "กล่อง", category: "วัสดุสำนักงาน" },
  { id: "off-14", name: "เทปใส", image: "https://images.unsplash.com/photo-1585435422894-672520864eb1?w=500&q=80", quantity: 50, status: "AVAILABLE", unit: "ม้วน", category: "วัสดุสำนักงาน" },
  { id: "off-15", name: "กาว", image: "https://images.unsplash.com/photo-1588190438644-80946d47b524?w=500&q=80", quantity: 20, status: "AVAILABLE", unit: "ขวด", category: "วัสดุสำนักงาน" },

  // 🔧 วัสดุช่างและอุปกรณ์ทั่วไป (10)
  { id: "tool-01", name: "ไขควง", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&q=80", quantity: 20, status: "AVAILABLE", unit: "อัน", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-02", name: "คีม", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&q=80", quantity: 15, status: "LOW_STOCK", unit: "อัน", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-03", name: "เทปพันสายไฟ", image: "https://images.unsplash.com/photo-1621535780517-5674395e55e0?w=500&q=80", quantity: 30, status: "AVAILABLE", unit: "ม้วน", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-04", name: "ปลั๊กไฟ", image: "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=500&q=80", quantity: 25, status: "AVAILABLE", unit: "ตัว", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-05", name: "ปลั๊กพ่วง", image: "https://images.unsplash.com/photo-1581403057176-a21239c5bbf8?w=500&q=80", quantity: 12, status: "LOW_STOCK", unit: "อัน", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-06", name: "สายไฟ", image: "https://images.unsplash.com/photo-1600860548174-51786577884d?w=500&q=80", quantity: 50, status: "AVAILABLE", unit: "เมตร", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-07", name: "หลอดไฟ", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&q=80", quantity: 40, status: "AVAILABLE", unit: "หลอด", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-08", name: "ถ่านไฟฉาย", image: "https://images.unsplash.com/photo-1611119575193-41ee3f11d619?w=500&q=80", quantity: 30, status: "AVAILABLE", unit: "แพ็ค", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-09", name: "น็อต", image: "https://images.unsplash.com/photo-1585223308351-46abefec58e6?w=500&q=80", quantity: 200, status: "AVAILABLE", unit: "ตัว", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },
  { id: "tool-10", name: "สกรู", image: "https://images.unsplash.com/photo-1534067341851-bcbd67b9de8f?w=500&q=80", quantity: 300, status: "AVAILABLE", unit: "ตัว", category: "วัสดุช่างและอุปกรณ์ทั่วไป" },

  // 🧹 วัสดุทำความสะอาด (8)
  { id: "clean-01", name: "น้ำยาทำความสะอาด", image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&q=80", quantity: 20, status: "AVAILABLE", unit: "ขวด", category: "วัสดุทำความสะอาด" },
  { id: "clean-02", name: "น้ำยาล้างห้องน้ำ", image: "https://images.unsplash.com/photo-1584820927498-cafe8c1f0ab9?w=500&q=80", quantity: 15, status: "AVAILABLE", unit: "ขวด", category: "วัสดุทำความสะอาด" },
  { id: "clean-03", name: "ผ้าเช็ดทำความสะอาด", image: "https://images.unsplash.com/photo-1584813539806-2538b8d918c6?w=500&q=80", quantity: 40, status: "AVAILABLE", unit: "ผืน", category: "วัสดุทำความสะอาด" },
  { id: "clean-04", name: "ถุงขยะ", image: "https://images.unsplash.com/photo-1528323273322-d81458248d40?w=500&q=80", quantity: 60, status: "AVAILABLE", unit: "แพ็ค", category: "วัสดุทำความสะอาด" },
  { id: "clean-05", name: "ไม้กวาด", image: "https://images.unsplash.com/photo-1585934500096-7c0ee6e3cbcf?w=500&q=80", quantity: 10, status: "LOW_STOCK", unit: "อัน", category: "วัสดุทำความสะอาด" },
  { id: "clean-06", name: "ที่ตักขยะ", image: "https://images.unsplash.com/photo-1585934500096-7c0ee6e3cbcf?w=500&q=80", quantity: 10, status: "LOW_STOCK", unit: "อัน", category: "วัสดุทำความสะอาด" },
  { id: "clean-07", name: "ไม้ถูพื้น", image: "https://images.unsplash.com/photo-1585934500096-7c0ee6e3cbcf?w=500&q=80", quantity: 8, status: "LOW_STOCK", unit: "อัน", category: "วัสดุทำความสะอาด" },
  { id: "clean-08", name: "ฟองน้ำ", image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&q=80", quantity: 30, status: "AVAILABLE", unit: "อัน", category: "วัสดุทำความสะอาด" },
];

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function seed() {
  try {
    console.log("Connecting to database...");
    
    // Create materials table
    console.log("Creating materials table...");
    await sql`
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Drop all existing data to cleanly insert new mock data
    await sql`TRUNCATE TABLE materials`;

    console.log(`Inserting ${INVENTORY_DATA.length} materials...`);
    
    for (const item of INVENTORY_DATA) {
      await sql`
        INSERT INTO materials (id, name, image, quantity, status, unit, category)
        VALUES (${item.id}, ${item.name}, ${item.image}, ${item.quantity}, ${item.status}, ${item.unit}, ${item.category})
      `;
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await sql.end();
  }
}

seed();
