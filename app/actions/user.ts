"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

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

export async function deleteUser(targetUserId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const currentUserObj = await client.users.getUser(userId);
    if (currentUserObj.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Call Clerk API to delete user
    await client.users.deleteUser(targetUserId);

    // Clean up local database
    await sql.begin(async (sql) => {
      await sql`DELETE FROM user_favorites WHERE user_id = ${targetUserId}`;
      await sql`DELETE FROM messages WHERE user_id = ${targetUserId} OR sender_id = ${targetUserId}`;
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/borrows");
    revalidatePath("/admin/returns");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}
