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
  requires_return: boolean;
};

//********************************//
// ดึงรายการพัสดุทั้งหมด (Get All Materials)
//********************************//
export async function getMaterials() {
  try {
    const materials = await sql<any[]>`
      SELECT * FROM materials ORDER BY created_at DESC
    `;
    return materials.map(m => ({
      id: String(m.id),
      name: String(m.name || ''),
      image: String(m.image || ''),
      quantity: Number(m.quantity || 0),
      status: String(m.status || ''),
      unit: String(m.unit || ''),
      category: String(m.category || ''),
      requires_return: m.requires_return !== false
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
    const materials = await sql<any[]>`
      SELECT * FROM materials ORDER BY updated_at DESC LIMIT 5
    `;
    return materials.map(m => ({
      id: String(m.id),
      name: String(m.name || ''),
      image: String(m.image || ''),
      quantity: Number(m.quantity || 0),
      status: String(m.status || ''),
      unit: String(m.unit || ''),
      category: String(m.category || ''),
      requires_return: m.requires_return !== false
    }));
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
    const materials = await sql<any[]>`
      SELECT * FROM materials WHERE id = ${id} LIMIT 1
    `;
    if (!materials[0]) return null;
    const m = materials[0];
    return {
      id: String(m.id),
      name: String(m.name || ''),
      image: String(m.image || ''),
      quantity: Number(m.quantity || 0),
      status: String(m.status || ''),
      unit: String(m.unit || ''),
      category: String(m.category || ''),
      requires_return: m.requires_return !== false
    };
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
    // Check for duplicate material name (case-insensitive and trimmed)
    const [existing] = await sql`
      SELECT id FROM materials WHERE TRIM(LOWER(name)) = TRIM(LOWER(${data.name})) LIMIT 1
    `;
    if (existing) {
      return { success: false, error: "มีพัสดุชื่อนี้อยู่แล้ว" };
    }

    // Lookup requires_return from categories table based on data.category
    const [categoryRow] = await sql`
      SELECT requires_return FROM categories WHERE name = ${data.category} LIMIT 1
    `;
    const requires_return = categoryRow ? categoryRow.requires_return : false;

    // Generate a random ID (e.g. cus-123)
    const id = `${data.category === 'พัสดุสำนักงาน' ? 'off' : 'item'}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    await sql`
      INSERT INTO materials (id, name, image, quantity, status, unit, category, requires_return)
      VALUES (${id}, ${data.name}, ${data.image}, ${data.quantity}, 
        CASE 
          WHEN ${data.quantity} <= 0 THEN 'OUT_OF_STOCK'
          WHEN ${data.quantity} <= 5 THEN 'LOW_STOCK'
          ELSE 'AVAILABLE'
        END, 
        ${data.unit}, ${data.category}, ${requires_return})
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
    if (data.name) {
      // Check for duplicate material name (case-insensitive and trimmed)
      const [existing] = await sql`
        SELECT id FROM materials WHERE TRIM(LOWER(name)) = TRIM(LOWER(${data.name})) AND id != ${id} LIMIT 1
      `;
      if (existing) {
        return { success: false, error: "มีพัสดุชื่อนี้อยู่แล้ว" };
      }
    }

    let requires_return = undefined;
    if (data.category) {
      // Lookup requires_return from categories table based on data.category
      const [categoryRow] = await sql`
        SELECT requires_return FROM categories WHERE name = ${data.category} LIMIT 1
      `;
      if (categoryRow) {
        requires_return = categoryRow.requires_return;
      }
    }

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
        requires_return = ${requires_return !== undefined ? requires_return : (data.requires_return !== undefined ? data.requires_return : sql`requires_return`)},
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
