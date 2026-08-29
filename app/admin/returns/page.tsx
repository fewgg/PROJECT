import { getReturnRequests } from "@/app/actions/requests";
import AdminReturnsClient from "./AdminReturnsClient";

export const revalidate = 0; // Don't cache this page so admin sees new returns immediately

export default async function AdminReturnsPage() {
  const returnRequests = await getReturnRequests();
  
  return <AdminReturnsClient returnRequests={returnRequests} />;
}
