import { getMaterialById } from "@/app/actions/materials";
import ProductDetailsClient from "./ProductDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getMaterialById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
