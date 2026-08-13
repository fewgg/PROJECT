import { getCategories } from "@/app/actions/categories";
import AdminCategoriesClient from "./AdminCategoriesClient";

export const revalidate = 0; // Don't cache this page

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  
  return <AdminCategoriesClient initialCategories={categories} />;
}
