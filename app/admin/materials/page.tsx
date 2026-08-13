import { getMaterials } from "@/app/actions/materials";
import AdminMaterialsClient from "./AdminMaterialsClient";

export const revalidate = 0; // Always fetch fresh data for admin panel

export default async function AdminMaterialsPage() {
  const materials = await getMaterials();
  
  return <AdminMaterialsClient initialData={materials} />;
}
