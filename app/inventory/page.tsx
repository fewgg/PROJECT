import { Suspense } from "react";
import { getMaterials } from "@/app/actions/materials";
import InventoryClient from "./InventoryClient";
import { checkOnboarding } from "@/lib/checkAuth";

// Revalidate this page every 60 seconds or when revalidatePath is called
export const revalidate = 60;

export default async function InventoryPage() {
  await checkOnboarding();
  const materials = await getMaterials();
  
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center p-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <InventoryClient initialData={materials} />
    </Suspense>
  );
}
