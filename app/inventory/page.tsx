import { Suspense } from "react";
import { getMaterials } from "@/app/actions/materials";
import { getCategories } from "@/app/actions/categories";
import InventoryClient from "./InventoryClient";
import { checkOnboarding } from "@/lib/checkAuth";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Revalidate this page every 60 seconds or when revalidatePath is called
export const revalidate = 60;

export default async function InventoryPage() {
  await checkOnboarding();
  const user = await currentUser();
  if (user?.publicMetadata?.role === "admin") {
    redirect("/admin");
  }
  const [rawMaterials, rawCategories] = await Promise.all([
    getMaterials(),
    getCategories()
  ]);
  
  const materials = JSON.parse(JSON.stringify(rawMaterials));
  const categories = JSON.parse(JSON.stringify(rawCategories));

  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center p-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <InventoryClient initialData={materials} categories={categories} />
    </Suspense>
  );
}
