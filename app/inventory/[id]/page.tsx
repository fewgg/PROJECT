import { getMaterialById } from "@/app/actions/materials";
import ProductDetailsClient from "./ProductDetailsClient";
import { notFound } from "next/navigation";
import { getSystemSettings } from "@/app/actions/settings";

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getMaterialById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const settings = await getSystemSettings();

  return <ProductDetailsClient product={product} schoolName={settings.schoolName} />;
}
