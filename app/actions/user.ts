"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfile(firstName: string, lastName: string, department: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const client = await clerkClient();
  
  // Update name
  await client.users.updateUser(userId, {
    firstName: firstName,
    lastName: lastName,
  });

  // Update metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      department: department
    }
  });
  
  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserDepartment(department: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const client = await clerkClient();
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      department: department
    }
  });
  
  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}
