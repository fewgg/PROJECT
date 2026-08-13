"use server"

import sql from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function requestMaterials(materialIds: string[]) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized: Please sign in first")
  }

  if (!materialIds || materialIds.length === 0) {
    return { success: false, message: "No materials selected" }
  }

  try {
    for (const id of materialIds) {
      await sql`
        INSERT INTO transactions (material_id, user_id, type, quantity, status, remark)
        VALUES (${id}, ${userId}, 'OUTBOUND', 1, 'PENDING', 'ทำเรื่องเบิกผ่านระบบ')
      `
    }
    
    revalidatePath("/")
    return { success: true, message: "ส่งคำร้องขอเบิกสำเร็จแล้ว" }
  } catch (error) {
    console.error("Failed to request materials:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการส่งคำร้อง" }
  }
}
