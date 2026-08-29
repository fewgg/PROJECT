//********************************//
// หน้าประวัติการเบิกพัสดุ (User Requests Page)
//********************************//
import { getUserRequests } from "@/app/actions/requests";
import { checkOnboarding } from "@/lib/checkAuth";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RequestsClient from "./RequestsClient";

export const revalidate = 0;

export default async function UserRequestsPage() {
  await checkOnboarding();
  const user = await currentUser();
  if (user?.publicMetadata?.role === "admin") {
    redirect("/admin");
  }
  const requests = await getUserRequests();

  return <RequestsClient initialRequests={requests} />;
}
