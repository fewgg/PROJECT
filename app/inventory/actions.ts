"use server"

import sql from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function addMaterial(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const categoryId = formData.get("category_id") as string
  const unit = formData.get("unit") as string
  const balance = parseInt(formData.get("balance") as string, 10)

  if (!name || !categoryId || !unit || isNaN(balance)) {
    return { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }

  try {
    await sql`
      INSERT INTO materials (name, category_id, unit, balance)
      VALUES (${name}, ${categoryId}, ${unit}, ${balance})
    `
    revalidatePath("/inventory")
    revalidatePath("/")
    return { success: true, message: "เพิ่มพัสดุเรียบร้อยแล้ว" }
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }
  }
}

export async function updateMaterial(id: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const categoryId = formData.get("category_id") as string
  const unit = formData.get("unit") as string
  const balance = parseInt(formData.get("balance") as string, 10)

  if (!id || !name || !categoryId || !unit || isNaN(balance)) {
    return { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }

  try {
    await sql`
      UPDATE materials 
      SET name = ${name}, category_id = ${categoryId}, unit = ${unit}, balance = ${balance}, updated_at = NOW()
      WHERE id = ${id}
    `
    revalidatePath("/inventory")
    revalidatePath("/")
    return { success: true, message: "แก้ไขพัสดุเรียบร้อยแล้ว" }
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }
  }
}

export async function deleteMaterial(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  try {
    await sql`DELETE FROM materials WHERE id = ${id}`
    revalidatePath("/inventory")
    revalidatePath("/")
    return { success: true, message: "ลบพัสดุเรียบร้อยแล้ว" }
  } catch (error) {
    return { success: false, message: "ไม่สามารถลบพัสดุได้ อาจมีคำร้องที่ผูกอยู่" }
  }
}
