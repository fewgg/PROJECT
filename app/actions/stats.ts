"use server";

import postgres from "postgres";
import { clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export async function getDashboardStats() {
  try {
    const [{ count: totalMaterials }] = await sql`SELECT COUNT(*) FROM materials`;
    const [{ count: lowStock }] = await sql`SELECT COUNT(*) FROM materials WHERE status IN ('LOW_STOCK', 'OUT_OF_STOCK')`;
    const [{ count: pendingRequests }] = await sql`SELECT COUNT(*) FROM transactions WHERE type = 'OUTBOUND' AND status = 'PENDING'`;
    const [{ count: approvedToday }] = await sql`SELECT COUNT(*) FROM transactions WHERE type = 'OUTBOUND' AND status = 'APPROVED' AND DATE(updated_at) = CURRENT_DATE`;

    return {
      totalMaterials: parseInt(totalMaterials, 10),
      lowStock: parseInt(lowStock, 10),
      pendingRequests: parseInt(pendingRequests, 10),
      approvedToday: parseInt(approvedToday, 10),
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalMaterials: 0, lowStock: 0, pendingRequests: 0, approvedToday: 0 };
  }
}

function getRelativeTime(date: Date) {
  const rtf = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });
  const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));

  if (Math.abs(daysDifference) > 0) {
    return rtf.format(daysDifference, 'day');
  } else if (Math.abs(hoursDifference) > 0) {
    return rtf.format(hoursDifference, 'hour');
  } else {
    return rtf.format(minutesDifference, 'minute');
  }
}

export async function getRecentActivities() {
  try {
    const transactions = await sql`
      SELECT t.id, t.user_id, t.type, t.quantity, t.status, t.created_at, m.name as material_name
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `;

    if (transactions.length === 0) return [];

    const client = await clerkClient();
    const users = await client.users.getUserList({
      userId: transactions.map(t => t.user_id)
    });

    return transactions.map((t, index) => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        id: t.id || index.toString(),
        user: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown User") : "Unknown User",
        avatar: u?.imageUrl || "https://ui-avatars.com/api/?name=User",
        action: t.type === 'OUTBOUND' ? 'เบิก' : 'รับเข้า',
        item: t.material_name,
        quantity: t.quantity,
        time: getRelativeTime(new Date(t.created_at)),
        status: t.status
      };
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}
