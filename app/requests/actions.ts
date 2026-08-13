"use server"

import sql from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function approveRequest(transactionId: string, materialId: string, quantity: number) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Update transaction status
  await sql`UPDATE transactions SET status = 'APPROVED', updated_at = NOW() WHERE id = ${transactionId}`
  
  // Deduct stock
  await sql`UPDATE materials SET balance = balance - ${quantity}, updated_at = NOW() WHERE id = ${materialId}`

  revalidatePath("/requests")
  revalidatePath("/")
}

export async function rejectRequest(transactionId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Update transaction status
  await sql`UPDATE transactions SET status = 'REJECTED', updated_at = NOW() WHERE id = ${transactionId}`

  revalidatePath("/requests")
}
