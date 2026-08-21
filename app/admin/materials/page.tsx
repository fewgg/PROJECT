import { getMaterials } from "@/app/actions/materials";
import { getCategories } from "@/app/actions/categories";
import AdminMaterialsClient from "./AdminMaterialsClient";

export const revalidate = 0; // Always fetch fresh data for admin panel

export default async function AdminMaterialsPage() {
  const [materials, categories] = await Promise.all([
    getMaterials(),
    getCategories()
  ]);
  
  return <AdminMaterialsClient initialData={materials} categories={categories} />;
}
