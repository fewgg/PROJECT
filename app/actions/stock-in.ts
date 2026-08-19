"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

export type Transaction = {
  id: string;
  material_id: string;
  user_id: string;
  type: "INBOUND" | "OUTBOUND";
  quantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  remark: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  material_name?: string;
  material_image?: string;
  user_name?: string;
};

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

// Get recent stock ins (admin)
export async function getRecentStockIns() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const transactions = await sql<Transaction[]>`
      SELECT t.*, m.name as material_name 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'INBOUND'
      ORDER BY t.created_at DESC
      LIMIT 10
    `;
    
    const client = await clerkClient();
    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });
    
    return transactions.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress) : "Unknown Admin"
      };
    });
  } catch (error) {
    console.error("Error fetching recent stock ins:", error);
    return [];
  }
}


// Perform a stock in operation (admin)
export async function stockInMaterial(materialId: string, quantityToAdd: number, remark?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql.begin(async (sql) => {
      // Create IN transaction
      await sql`
        INSERT INTO transactions (material_id, user_id, type, quantity, status, remark)
        VALUES (${materialId}, ${userId}, 'INBOUND', ${quantityToAdd}, 'COMPLETED', ${remark || null})
      `;

      // Update material quantity
      await sql`
        UPDATE materials 
        SET quantity = quantity + ${quantityToAdd},
            status = CASE 
                       WHEN (quantity + ${quantityToAdd}) <= 0 THEN 'OUT_OF_STOCK'
                       WHEN (quantity + ${quantityToAdd}) <= 5 THEN 'LOW_STOCK'
                       ELSE 'AVAILABLE'
                     END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${materialId}
      `;
    });
    
    revalidatePath("/admin/stock-in");
    revalidatePath("/admin/materials");
    revalidatePath("/admin");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error during stock in:", error);
    return { success: false, error: "Failed to stock in material" };
  }
}
