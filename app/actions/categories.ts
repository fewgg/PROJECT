"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

//********************************//
// การเชื่อมต่อฐานข้อมูล (Database Connection)
//********************************//
const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

//********************************//
// Type ของหมวดหมู่พัสดุ (Category Model)
//********************************//
export type Category = {
  id: string;
  name: string;
  created_at?: Date | string;
};

//********************************//
// ดึงรายการหมวดหมู่ทั้งหมด (Get All Categories)
//********************************//
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await sql<Category[]>`
      SELECT id, name, created_at FROM categories ORDER BY name ASC
    `;
    return categories.map(c => ({
      id: String(c.id),
      name: String(c.name),
      created_at: c.created_at ? new Date(c.created_at).toISOString() : undefined
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

//********************************//
// เพิ่มหมวดหมู่พัสดุใหม่ (Add Category - Admin)
//********************************//
export async function addCategory(name: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql`
      INSERT INTO categories (name) VALUES (${name})
    `;
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/materials");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding category:", error);
    if (error.code === '23505') { // Postgres unique violation code
      return { success: false, error: "มีหมวดหมู่นี้อยู่แล้ว" };
    }
    return { success: false, error: "Failed to add category" };
  }
}

//********************************//
// แก้ไขหมวดหมู่พัสดุ (Update Category - Admin)
//********************************//
export async function updateCategory(id: string, name: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Optional: we can also update all materials that use this category name to the new name,
    // if materials store the category as a string name rather than id.
    const [oldCat] = await sql`SELECT name FROM categories WHERE id = ${id}`;
    
    await sql.begin(async (sql) => {
      await sql`UPDATE categories SET name = ${name} WHERE id = ${id}`;
      
      if (oldCat) {
        await sql`UPDATE materials SET category = ${name} WHERE category = ${oldCat.name}`;
      }
    });
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/materials");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error.code === '23505') {
      return { success: false, error: "มีหมวดหมู่นี้อยู่แล้ว" };
    }
    return { success: false, error: "Failed to update category" };
  }
}

//********************************//
// ลบหมวดหมู่พัสดุ (Delete Category - Admin)
//********************************//
export async function deleteCategory(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql`DELETE FROM categories WHERE id = ${id}`;
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
