"use server";

import postgres from "postgres";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

// Toggle favorite a material for the current user
export async function toggleFavorite(materialId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Check if it's already favorited
    const existing = await sql`
      SELECT id FROM user_favorites 
      WHERE user_id = ${userId} AND material_id = ${materialId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Remove it
      await sql`
        DELETE FROM user_favorites 
        WHERE user_id = ${userId} AND material_id = ${materialId}
      `;
      revalidatePath("/inventory");
      revalidatePath("/profile");
      return { success: true, isFavorited: false };
    } else {
      // Add it
      await sql`
        INSERT INTO user_favorites (user_id, material_id)
        VALUES (${userId}, ${materialId})
      `;
      revalidatePath("/inventory");
      revalidatePath("/profile");
      return { success: true, isFavorited: true };
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: error.message || "Failed to toggle favorite" };
  }
}

// Get all favorite material IDs for the current user
export async function getFavoriteIds() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const rows = await sql`
      SELECT material_id FROM user_favorites 
      WHERE user_id = ${userId}
    `;
    return rows.map(r => String(r.material_id));
  } catch (error) {
    console.error("Error fetching favorite ids:", error);
    return [];
  }
}

// Get all favorite materials (complete objects) for the current user
export async function getFavoriteMaterials() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const materials = await sql<any[]>`
      SELECT m.* 
      FROM materials m
      JOIN user_favorites f ON m.id = f.material_id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
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
    console.error("Error fetching favorite materials:", error);
    return [];
  }
}
