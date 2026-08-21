//********************************//
// หน้าประวัติการเบิกพัสดุ (User Requests Page)
//********************************//
import { getUserRequests } from "@/app/actions/requests";
import { checkOnboarding } from "@/lib/checkAuth";
import RequestsClient from "./RequestsClient";

export const revalidate = 0;

export default async function UserRequestsPage() {
  await checkOnboarding();
  const requests = await getUserRequests();

  return <RequestsClient initialRequests={requests} />;
}
