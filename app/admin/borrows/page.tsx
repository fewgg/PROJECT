import { getActiveBorrows } from "@/app/actions/requests";
import AdminBorrowsClient from "./AdminBorrowsClient";

export const revalidate = 0; // Don't cache this page so admin sees new borrows immediately

export default async function AdminBorrowsPage() {
  const activeBorrows = await getActiveBorrows();
  
  return <AdminBorrowsClient activeBorrows={activeBorrows} />;
}
