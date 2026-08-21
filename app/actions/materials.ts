"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";

//********************************//
// การเชื่อมต่อฐานข้อมูล (Database Connection)
//********************************//
const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

//********************************//
// Type ของข้อมูลพัสดุ (Material Model)
//********************************//
export type Material = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  status: string;
  unit: string;
  category: string;
};

//********************************//
// ดึงรายการพัสดุทั้งหมด (Get All Materials)
//********************************//
export async function getMaterials() {
  try {
    const materials = await sql<Material[]>`
      SELECT * FROM materials ORDER BY created_at DESC
    `;
    return materials.map(m => ({
      id: String(m.id),
      name: String(m.name || ''),
      image: String(m.image || ''),
      quantity: Number(m.quantity || 0),
      status: String(m.status || ''),
      unit: String(m.unit || ''),
      category: String(m.category || '')
    }));
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

//********************************//
// ดึงพัสดุแนะนำ (Get Recommended Materials)
//********************************//
export async function getRecommendedMaterials() {
  try {
    const materials = await sql<Material[]>`
      SELECT * FROM materials ORDER BY updated_at DESC LIMIT 5
    `;
    return materials;
  } catch (error) {
    console.error("Error fetching recommended materials:", error);
    return [];
  }
}

//********************************//
// ดึงข้อมูลพัสดุตาม ID (Get Material By ID)
//********************************//
export async function getMaterialById(id: string) {
  try {
    const materials = await sql<Material[]>`
      SELECT * FROM materials WHERE id = ${id} LIMIT 1
    `;
    return materials[0] || null;
  } catch (error) {
    console.error("Error fetching material by ID:", error);
    return null;
  }
}

//********************************//
// เพิ่มพัสดุใหม่ (Add Material)
//********************************//
export async function addMaterial(data: Omit<Material, "id">) {
  try {
    // Generate a random ID (e.g. cus-123)
    const id = `${data.category === 'พัสดุสำนักงาน' ? 'off' : 'item'}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    await sql`
      INSERT INTO materials (id, name, image, quantity, status, unit, category)
      VALUES (${id}, ${data.name}, ${data.image}, ${data.quantity}, 
        CASE 
          WHEN ${data.quantity} <= 0 THEN 'OUT_OF_STOCK'
          WHEN ${data.quantity} <= 5 THEN 'LOW_STOCK'
          ELSE 'AVAILABLE'
        END, 
        ${data.unit}, ${data.category})
    `;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding material:", error);
    return { success: false, error: "Failed to add material" };
  }
}

//********************************//
// แก้ไขพัสดุ (Update Material)
//********************************//
export async function updateMaterial(id: string, data: Partial<Material>) {
  try {
    await sql`
      UPDATE materials SET 
        name = ${data.name ?? sql`name`},
        image = ${data.image ?? sql`image`},
        quantity = ${data.quantity ?? sql`quantity`},
        status = CASE 
                   WHEN (${data.quantity ?? sql`quantity`}) <= 0 THEN 'OUT_OF_STOCK'
                   WHEN (${data.quantity ?? sql`quantity`}) <= 5 THEN 'LOW_STOCK'
                   ELSE 'AVAILABLE'
                 END,
        unit = ${data.unit ?? sql`unit`},
        category = ${data.category ?? sql`category`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "Failed to update material" };
  }
}

//********************************//
// ลบพัสดุ (Delete Material)
//********************************//
export async function deleteMaterial(id: string) {
  try {
    await sql`DELETE FROM materials WHERE id = ${id}`;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "Failed to delete material" };
  }
}
