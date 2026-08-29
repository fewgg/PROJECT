"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSystemSettings } from "./settings";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export type Transaction = {
  id: string;
  material_id: string;
  user_id: string;
  type: "OUTBOUND" | "INBOUND";
  quantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  remark: string | null;
  department?: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  material_name?: string;
  material_image?: string;
  user_name?: string;
};

// Create a new material request (user)
export async function createRequest(materialId: string, quantity: number, remark?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const department = (user.publicMetadata?.department as string) || null;

    // Check if auto-approve is enabled for small requests (quantity <= 1)
    let shouldAutoApprove = false;
    if (quantity <= 1) {
      try {
        const [settingRow] = await sql`
          SELECT value FROM system_settings WHERE key = 'autoApproveSmallRequests'
        `;
        if (settingRow && (settingRow.value === true || settingRow.value === 'true')) {
          shouldAutoApprove = true;
        }
      } catch (e) {
        console.error("Failed to query settings for auto-approval, defaulting to PENDING:", e);
      }
    }

    if (shouldAutoApprove) {
      // Verify stock is sufficient before auto-approving
      const [material] = await sql`
        SELECT quantity FROM materials WHERE id = ${materialId}
      `;
      
      if (!material || material.quantity < quantity) {
        // Fall back to PENDING if stock is insufficient
        await sql`
          INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department)
          VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'PENDING', ${remark || null}, ${department})
        `;
      } else {
        await sql.begin(async (sql) => {
          // 1. Insert transaction as APPROVED
          await sql`
            INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department)
            VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'APPROVED', ${remark || null}, ${department})
          `;
          
          // 2. Deduct quantity from materials table
          await sql`
            UPDATE materials 
            SET quantity = quantity - ${quantity},
                status = CASE 
                           WHEN (quantity - ${quantity}) <= 0 THEN 'OUT_OF_STOCK'
                           WHEN (quantity - ${quantity}) <= 5 THEN 'LOW_STOCK'
                           ELSE 'AVAILABLE'
                         END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${materialId}
          `;
        });
      }
    } else {
      await sql`
        INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department)
        VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'PENDING', ${remark || null}, ${department})
      `;
    }
    
    // Refresh relevant paths
    revalidatePath("/requests");
    revalidatePath("/admin/requests");
    revalidatePath("/inventory");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error creating request:", error);
    return { success: false, error: "Failed to create request" };
  }
}

// Get all pending requests (admin)
export async function getPendingRequests() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch transactions with material details
    const transactions = await sql<Transaction[]>`
      SELECT t.*, m.name as material_name, m.image as material_image 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND' AND t.status = 'PENDING'
      ORDER BY t.created_at ASC
    `;
    
    // Fetch user details from Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });
    
    // Attach user names
    return transactions.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress) : "Unknown User"
      };
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
}

// Approve or Reject a request (admin)
export async function updateRequestStatus(transactionId: string, newStatus: "APPROVED" | "REJECTED") {
  try {
    const { userId } = await auth();
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql.begin(async (sql) => {
      // Get the transaction
      const [tx] = await sql`
        SELECT * FROM transactions WHERE id = ${transactionId} AND status = 'PENDING'
      `;
      if (!tx) throw new Error("Transaction not found or already processed");

      // Update transaction status
      await sql`
        UPDATE transactions SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${transactionId}
      `;

      // If approved, deduct material quantity
      if (newStatus === "APPROVED") {
        await sql`
          UPDATE materials 
          SET quantity = quantity - ${tx.quantity},
              status = CASE 
                         WHEN (quantity - ${tx.quantity}) <= 0 THEN 'OUT_OF_STOCK'
                         WHEN (quantity - ${tx.quantity}) <= 5 THEN 'LOW_STOCK'
                         ELSE 'AVAILABLE'
                       END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${tx.material_id}
        `;
      }
    });
    
    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/requests");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating request status:", error);
    return { success: false, error: "Failed to update request status" };
  }
}

//********************************//
// ดึงข้อมูลรายการคำร้องของตัวผู้ใช้เอง (Get User Requests)
//********************************//
export async function getUserRequests() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const transactions = await sql<Transaction[]>`
      SELECT t.*, m.name as material_name, m.image as material_image 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.user_id = ${userId} AND t.type = 'OUTBOUND'
      ORDER BY t.created_at DESC
    `;
    return transactions.map(t => ({
      id: String(t.id),
      material_id: String(t.material_id),
      user_id: String(t.user_id),
      type: t.type,
      quantity: Number(t.quantity),
      status: t.status,
      remark: t.remark ? String(t.remark) : null,
      department: t.department ? String(t.department) : null,
      created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
      updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
      material_name: String(t.material_name || ''),
      material_image: String(t.material_image || '')
    }));
  } catch (error) {
    console.error("Error fetching user requests:", error);
    return [];
  }
}

//********************************//
// ดึงข้อมูลประวัติการเบิกพัสดุทั้งหมด (Get All Outbound Requests for Admin)
//********************************//
export async function getAllRequests() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const transactions = await sql<Transaction[]>`
      SELECT t.*, m.name as material_name, m.image as material_image 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND'
      ORDER BY t.created_at DESC
    `;

    if (transactions.length === 0) return [];

    // Fetch user details from Clerk
    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });

    return transactions.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User"
      };
    });
  } catch (error) {
    console.error("Error fetching all requests for admin:", error);
    return [];
  }
}

//********************************//
// ดำเนินการรับคืนพัสดุ (Return Request & Restore Stock)
//********************************//
export async function returnRequest(transactionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql.begin(async (sql) => {
      // ดึงประวัติรายการที่เป็นสถานะ APPROVED
      const [tx] = await sql`
        SELECT * FROM transactions WHERE id = ${transactionId} AND status = 'APPROVED'
      `;
      if (!tx) throw new Error("ไม่พบรายการเบิกที่เปิดใช้งานอยู่ หรือ รายการนี้ถูกคืนแล้ว");

      // อัปเดตสถานะเป็น COMPLETED
      await sql`
        UPDATE transactions SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${transactionId}
      `;

      // คืนจำนวนพัสดุกลับเข้าคลัง
      await sql`
        UPDATE materials 
        SET quantity = quantity + ${tx.quantity},
            status = CASE 
                       WHEN (quantity + ${tx.quantity}) <= 0 THEN 'OUT_OF_STOCK'
                       WHEN (quantity + ${tx.quantity}) <= 5 THEN 'LOW_STOCK'
                       ELSE 'AVAILABLE'
                     END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${tx.material_id}
      `;
    });

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/requests");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error returning request:", error);
    return { success: false, error: error.message || "Failed to return request" };
  }
}

// Get all returned requests (admin)
export async function getReturnRequests() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const transactions = await sql<Transaction[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.unit
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND' AND t.status = 'COMPLETED'
      ORDER BY t.updated_at DESC
    `;

    if (transactions.length === 0) return [];

    // Fetch user details from Clerk
    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });

    return transactions.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User"
      };
    });
  } catch (error) {
    console.error("Error fetching return requests for admin:", error);
    return [];
  }
}
