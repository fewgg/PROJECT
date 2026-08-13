import { getPendingRequests } from "@/app/actions/requests";
import AdminRequestsClient from "./AdminRequestsClient";

export const revalidate = 0; // Don't cache this page so admin sees new requests immediately

export default async function AdminRequestsPage() {
  const pendingRequests = await getPendingRequests();
  
  return <AdminRequestsClient initialRequests={pendingRequests} />;
}
