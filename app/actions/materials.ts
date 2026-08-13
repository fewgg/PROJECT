"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";

// Connect to Database using direct connection
const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export type Material = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  status: string;
  unit: string;
  category: string;
};

// GET all materials
export async function getMaterials() {
  try {
    const materials = await sql<Material[]>`
      SELECT * FROM materials ORDER BY created_at DESC
    `;
    return materials;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

// GET recommended materials (recently updated/most active)
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

// GET a single material by ID
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

// ADD a new material
export async function addMaterial(data: Omit<Material, "id">) {
  try {
    // Generate a random ID (e.g. cus-123)
    const id = `${data.category === 'วัสดุสำนักงาน' ? 'off' : 'item'}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    await sql`
      INSERT INTO materials (id, name, image, quantity, status, unit, category)
      VALUES (${id}, ${data.name}, ${data.image}, ${data.quantity}, ${data.status}, ${data.unit}, ${data.category})
    `;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error adding material:", error);
    return { success: false, error: "Failed to add material" };
  }
}

// UPDATE a material
export async function updateMaterial(id: string, data: Partial<Material>) {
  try {
    await sql`
      UPDATE materials SET 
        name = ${data.name ?? sql`name`},
        image = ${data.image ?? sql`image`},
        quantity = ${data.quantity ?? sql`quantity`},
        status = ${data.status ?? sql`status`},
        unit = ${data.unit ?? sql`unit`},
        category = ${data.category ?? sql`category`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "Failed to update material" };
  }
}

// DELETE a material
export async function deleteMaterial(id: string) {
  try {
    await sql`DELETE FROM materials WHERE id = ${id}`;
    
    revalidatePath("/admin/materials");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "Failed to delete material" };
  }
}
