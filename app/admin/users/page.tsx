import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export type SerializedClerkUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  hasImage: boolean;
  role: string;
  department: string;
  isSuspended: boolean;
  createdAt: number;
};

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const currentUserObj = await client.users.getUser(userId);
  const role = currentUserObj.publicMetadata?.role;

  if (role !== "admin") {
    redirect("/");
  }

  // Fetch up to 100 users
  const response = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  const serializedUsers: SerializedClerkUser[] = response.data.map((u) => ({
    id: u.id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.emailAddresses[0]?.emailAddress || "",
    imageUrl: u.imageUrl || "",
    hasImage: u.hasImage,
    role: (u.publicMetadata?.role as string) || "user",
    department: (u.publicMetadata?.department as string) || "ไม่ระบุแผนก",
    isSuspended: u.publicMetadata?.isSuspended === true,
    createdAt: u.createdAt,
  }));

  return <AdminUsersClient initialUsers={serializedUsers} />;
}
