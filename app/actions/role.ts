"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setRole(role: "admin" | "user") {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  
  return { success: true };
}
