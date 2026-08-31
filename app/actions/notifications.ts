"use server";

import postgres from "postgres";
import { auth, clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "error";
  time: string;
  link: string;
};

export async function getNotifications(): Promise<NotificationType[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const isAdmin = user.publicMetadata?.role === "admin";
    
    const notifications: NotificationType[] = [];
    
    if (isAdmin) {
      // 1. Check pending requests
      const pendingTx = await sql`SELECT count(*) as count FROM transactions WHERE status = 'PENDING' AND type = 'OUTBOUND'`;
      const pendingCount = parseInt(pendingTx[0].count, 10);
      if (pendingCount > 0) {
        notifications.push({
          id: 'pending-req',
          title: 'คำร้องขอเบิกรออนุมัติ',
          message: `มีคำร้องขอเบิกพัสดุใหม่จำนวน ${pendingCount} รายการรอการอนุมัติ`,
          type: 'info',
          time: 'ตอนนี้',
          link: '/admin/requests'
        });
      }
      
      // 2. Check low stock materials
      const lowStock = await sql`SELECT id, name, quantity, status FROM materials WHERE status IN ('LOW_STOCK', 'OUT_OF_STOCK') OR quantity <= 5 ORDER BY quantity ASC LIMIT 10`;
      
      for (const item of lowStock) {
        if (item.quantity <= 0) {
          notifications.push({
            id: `stock-${item.id}`,
            title: 'พัสดุหมดสต๊อก',
            message: `${item.name} หมดสต๊อกแล้ว กรุณาเติมด่วน`,
            type: 'error',
            time: 'ด่วน',
            link: '/admin/stock-in'
          });
        } else {
          notifications.push({
            id: `stock-${item.id}`,
            title: 'พัสดุใกล้หมด',
            message: `${item.name} ใกล้หมด (เหลือ ${item.quantity})`,
            type: 'warning',
            time: 'ตอนนี้',
            link: '/admin/stock-in'
          });
        }
      }

      // 3. Check overdue items across the system for admin
      const adminOverdueTx = await sql`
        SELECT COUNT(*) as count 
        FROM transactions 
        WHERE status IN ('APPROVED', 'RETURN_REJECTED') 
        AND due_date < NOW()
      `;
      const adminOverdueCount = parseInt(adminOverdueTx[0].count, 10);
      if (adminOverdueCount > 0) {
        notifications.push({
          id: 'admin-overdue',
          title: 'มีพัสดุเลยกำหนดคืน',
          message: `มีพัสดุเลยกำหนดส่งคืนจำนวน ${adminOverdueCount} รายการที่ยังไม่ส่งคืน`,
          type: 'warning',
          time: 'ทวงของ',
          link: '/admin/returns'
        });
      }
    }
    
    // For everyone (including admins): Check recently processed requests (APPROVED/REJECTED) within last 3 days
    const recentTx = await sql`
      SELECT t.id, t.status, m.name 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.user_id = ${userId} AND t.status IN ('APPROVED', 'REJECTED')
      AND t.updated_at >= NOW() - INTERVAL '3 days'
      ORDER BY t.updated_at DESC LIMIT 5
    `;
    
    for (const tx of recentTx) {
      if (tx.status === 'APPROVED') {
        notifications.push({
          id: `tx-${tx.id}`,
          title: 'คำร้องได้รับการอนุมัติ',
          message: `คำร้องขอเบิก "${tx.name}" ได้รับการอนุมัติแล้ว`,
          type: 'success',
          time: 'ล่าสุด',
          link: '/requests'
        });
      } else if (tx.status === 'REJECTED') {
        notifications.push({
          id: `tx-${tx.id}`,
          title: 'คำร้องถูกปฏิเสธ',
          message: `คำร้องขอเบิก "${tx.name}" ถูกปฏิเสธ`,
          type: 'error',
          time: 'ล่าสุด',
          link: '/requests'
        });
      }
    }

    // Check if the user has any overdue borrowed items
    const overdueTx = await sql`
      SELECT t.id, m.name, t.due_date 
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE t.user_id = ${userId} 
      AND t.status IN ('APPROVED', 'RETURN_REJECTED')
      AND t.due_date < NOW()
      ORDER BY t.due_date ASC
    `;

    for (const tx of overdueTx) {
      notifications.push({
        id: `overdue-${tx.id}`,
        title: 'เลยกำหนดคืนพัสดุ!',
        message: `พัสดุ "${tx.name}" เลยกำหนดคืนแล้วตั้งแต่เมื่อวันที่ ${new Date(tx.due_date).toLocaleDateString('th-TH')}`,
        type: 'error',
        time: 'เกินกำหนด',
        link: '/requests'
      });
    }
    
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}
