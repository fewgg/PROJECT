import { getMaterials } from "@/app/actions/materials";
import { getRecentStockIns } from "@/app/actions/stock-in";
import AdminStockInClient from "./AdminStockInClient";

export const revalidate = 0; // Don't cache this page so admin sees new stock-ins immediately

export default async function AdminStockInPage() {
  const materials = await getMaterials();
  const recentStockIns = await getRecentStockIns();
  
  return <AdminStockInClient materials={materials} recentStockIns={recentStockIns} />;
}
