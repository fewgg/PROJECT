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
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "RETURN_PENDING" | "RETURN_REJECTED";
  remark: string | null;
  department?: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  material_name?: string;
  material_image?: string;
  material_stock?: number;
  user_name?: string;
  unit?: string;
  requires_return?: boolean;
  borrow_duration_days?: number | null;
  due_date?: Date | string | null;
  is_suspended?: boolean;
};

// Create a new material request (user)
export async function createRequest(materialId: string, quantity: number, remark?: string, borrowDurationDays?: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const department = (user.publicMetadata?.department as string) || null;

    if (user.publicMetadata?.isSuspended === true) {
      return { success: false, error: "คุณถูกระงับสิทธิ์การเบิกพัสดุชั่วคราวเนื่องจากมีพัสดุเลยกำหนดส่งคืน" };
    }

    // Check if the material requires return
    const [materialRow] = await sql`
      SELECT requires_return, quantity FROM materials WHERE id = ${materialId} LIMIT 1
    `;
    const requiresReturn = materialRow ? materialRow.requires_return : false;
    const duration = requiresReturn ? (borrowDurationDays || 7) : null;

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
      const availableStock = materialRow ? Number(materialRow.quantity) : 0;
      
      if (!materialRow || availableStock < quantity) {
        // Fall back to PENDING if stock is insufficient
        await sql`
          INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department, borrow_duration_days, due_date)
          VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'PENDING', ${remark || null}, ${department}, ${duration}, null)
        `;
      } else {
        const dueDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        let autoApproveSuccess = false;

        await sql.begin(async (sql) => {
          // Lock row and check stock again inside transaction
          const [mat] = await sql`SELECT quantity FROM materials WHERE id = ${materialId} FOR UPDATE`;
          if (!mat || Number(mat.quantity) < quantity) {
            // Fallback to PENDING if stock was reduced concurrently
            return;
          }

          autoApproveSuccess = true;

          // 1. Insert transaction as APPROVED
          await sql`
            INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department, borrow_duration_days, due_date)
            VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'APPROVED', ${remark || null}, ${department}, ${duration}, ${dueDate})
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

        if (!autoApproveSuccess) {
          await sql`
            INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department, borrow_duration_days, due_date)
            VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'PENDING', ${remark || null}, ${department}, ${duration}, null)
          `;
        }
      }
    } else {
      await sql`
        INSERT INTO transactions (material_id, user_id, type, quantity, status, remark, department, borrow_duration_days, due_date)
        VALUES (${materialId}, ${userId}, 'OUTBOUND', ${quantity}, 'PENDING', ${remark || null}, ${department}, ${duration}, null)
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

    // Fetch transactions with material details and current stock
    const transactions = await sql<any[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.requires_return, m.quantity as material_stock, m.unit 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND' AND t.status = 'PENDING'
      ORDER BY t.created_at ASC
    `;
    
    if (transactions.length === 0) return [];

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
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress) : "Unknown User",
        requires_return: t.requires_return !== false,
        material_stock: t.material_stock !== undefined ? Number(t.material_stock) : 0,
        unit: t.unit || 'ชิ้น',
        borrow_duration_days: t.borrow_duration_days ? Number(t.borrow_duration_days) : null,
        due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
        created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
        is_suspended: u ? u.publicMetadata?.isSuspended === true : false,
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
    if (!userId) throw new Error("Unauthorized");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql.begin(async (sql) => {
      // Get the transaction
      const [tx] = await sql`
        SELECT * FROM transactions WHERE id = ${transactionId} AND status = 'PENDING'
      `;
      if (!tx) throw new Error("ไม่พบรายการคำร้อง หรือรายการนี้ได้รับการดำเนินการไปแล้ว");

      if (newStatus === "APPROVED") {
        // Lock material row and check available quantity
        const [material] = await sql`
          SELECT name, quantity FROM materials WHERE id = ${tx.material_id} FOR UPDATE
        `;

        if (!material) {
          throw new Error("ไม่พบข้อมูลพัสดุในระบบ");
        }

        const currentStock = Number(material.quantity);
        const reqQty = Number(tx.quantity);

        if (currentStock < reqQty) {
          throw new Error(`ไม่สามารถอนุมัติได้ เนื่องจากพัสดุ "${material.name}" ในคลังไม่เพียงพอ (คงเหลือ ${currentStock} ชิ้น / ขอเบิก ${reqQty} ชิ้น)`);
        }

        // Update transaction status and due_date
        await sql`
          UPDATE transactions SET 
            status = ${newStatus}, 
            due_date = CASE 
                         WHEN borrow_duration_days IS NOT NULL THEN CURRENT_TIMESTAMP + (borrow_duration_days || ' day')::INTERVAL 
                         ELSE NULL 
                       END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${transactionId}
        `;

        // Deduct material quantity
        await sql`
          UPDATE materials 
          SET quantity = quantity - ${reqQty},
              status = CASE 
                         WHEN (quantity - ${reqQty}) <= 0 THEN 'OUT_OF_STOCK'
                         WHEN (quantity - ${reqQty}) <= 5 THEN 'LOW_STOCK'
                         ELSE 'AVAILABLE'
                       END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${tx.material_id}
        `;
      } else {
        await sql`
          UPDATE transactions SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${transactionId}
        `;
      }
    });
    
    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/requests");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating request status:", error);
    return { success: false, error: error.message || "Failed to update request status" };
  }
}

//********************************//
// ดึงข้อมูลรายการคำร้องของตัวผู้ใช้เอง (Get User Requests)
//********************************//
export async function getUserRequests() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const transactions = await sql<any[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.requires_return
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
      material_image: String(t.material_image || ''),
      requires_return: t.requires_return !== false,
      borrow_duration_days: t.borrow_duration_days ? Number(t.borrow_duration_days) : null,
      due_date: t.due_date ? new Date(t.due_date).toISOString() : null
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

    const transactions = await sql<any[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.requires_return 
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
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User",
        requires_return: t.requires_return !== false,
        borrow_duration_days: t.borrow_duration_days ? Number(t.borrow_duration_days) : null,
        due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
        created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
        is_suspended: u ? u.publicMetadata?.isSuspended === true : false,
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
      // ดึงประวัติรายการที่เป็นสถานะ RETURN_PENDING
      const [tx] = await sql`
        SELECT * FROM transactions WHERE id = ${transactionId} AND status = 'RETURN_PENDING'
      `;
      if (!tx) throw new Error("ไม่พบรายการที่ผู้ใช้แจ้งส่งคืน หรือ รายการนี้ได้รับการยืนยันคืนไปแล้ว");

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

    const transactions = await sql<any[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.unit, m.requires_return
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND' AND t.status IN ('RETURN_PENDING', 'COMPLETED', 'RETURN_REJECTED')
      ORDER BY 
        CASE 
          WHEN t.status = 'RETURN_PENDING' THEN 1 
          WHEN t.status = 'RETURN_REJECTED' THEN 2 
          ELSE 3 
        END,
        t.updated_at DESC
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
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User",
        requires_return: t.requires_return !== false,
        borrow_duration_days: t.borrow_duration_days ? Number(t.borrow_duration_days) : null,
        due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
        created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
        is_suspended: u ? u.publicMetadata?.isSuspended === true : false,
      };
    });
  } catch (error) {
    console.error("Error fetching return requests for admin:", error);
    return [];
  }
}

// User-initiated return request (user)
export async function userReturnRequest(transactionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify the transaction belongs to the requesting user and status is APPROVED or RETURN_REJECTED
    const [tx] = await sql`
      SELECT * FROM transactions 
      WHERE id = ${transactionId} AND user_id = ${userId} AND status IN ('APPROVED', 'RETURN_REJECTED')
    `;
    if (!tx) throw new Error("ไม่พบรายการเบิกที่เปิดใช้งานอยู่ หรือ รายการนี้ถูกคืนแล้ว");

    // Update transaction status to RETURN_PENDING
    await sql`
      UPDATE transactions SET status = 'RETURN_PENDING', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId}
    `;

    revalidatePath("/requests");
    revalidatePath("/returns");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error in userReturnRequest:", error);
    return { success: false, error: error.message || "Failed to return request" };
  }
}

// Reject user return request (admin)
export async function rejectReturnRequest(transactionId: string, remark?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Update status to RETURN_REJECTED and record the reason in remark
    await sql`
      UPDATE transactions 
      SET status = 'RETURN_REJECTED', 
          remark = ${remark || 'ส่งคืนพัสดุไม่ถูกต้อง / ไม่ผ่านการตรวจสอบ'}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId} AND status = 'RETURN_PENDING'
    `;

    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    revalidatePath("/requests");
    revalidatePath("/returns");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectReturnRequest:", error);
    return { success: false, error: error.message || "Failed to reject return request" };
  }
}

export async function getActiveBorrows() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Get active borrows (APPROVED or RETURN_REJECTED) that require return
    const transactions = await sql<any[]>`
      SELECT t.*, m.name as material_name, m.image as material_image, m.unit, m.requires_return
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.type = 'OUTBOUND' 
      AND t.status IN ('APPROVED', 'RETURN_REJECTED')
      AND m.requires_return = TRUE
      ORDER BY 
        CASE WHEN t.due_date < NOW() THEN 1 ELSE 2 END,
        t.due_date ASC
    `;

    if (transactions.length === 0) return [];

    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });

    return transactions.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User",
        requires_return: t.requires_return !== false,
        borrow_duration_days: t.borrow_duration_days ? Number(t.borrow_duration_days) : null,
        due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
        created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        updated_at: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
        is_suspended: u ? u.publicMetadata?.isSuspended === true : false,
      };
    });
  } catch (error) {
    console.error("Error fetching active borrows for admin:", error);
    return [];
  }
}
