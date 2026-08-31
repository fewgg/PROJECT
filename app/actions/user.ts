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

export async function toggleUserSuspension(targetUserId: string, suspend: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const currentUserObj = await client.users.getUser(userId);
    if (currentUserObj.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        isSuspended: suspend
      }
    });

    revalidatePath("/admin/returns");
    revalidatePath(`/admin/users/${targetUserId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling user suspension:", error);
    return { success: false, error: error.message || "Failed to toggle user suspension" };
  }
}
