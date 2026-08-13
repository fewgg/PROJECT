"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import Link from "next/link";

export type ProductStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  quantity: number;
  status: ProductStatus;
  unit: string;
  category?: string;
}

export function ProductCard({ id, name, image, quantity, status, unit }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const product = { id, name, image, quantity, status, unit };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl border border-slate-100 flex flex-col h-full overflow-hidden relative"
    >
      <Link href={`/inventory/${id}`} className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4 cursor-pointer block">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          {status === "AVAILABLE" && (
            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-none shadow-sm backdrop-blur-md">
              มีสินค้า
            </Badge>
          )}
          {status === "LOW_STOCK" && (
            <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-none shadow-sm backdrop-blur-md">
              ใกล้หมด
            </Badge>
          )}
          {status === "OUT_OF_STOCK" && (
            <Badge className="bg-rose-500/90 hover:bg-rose-500 text-white border-none shadow-sm backdrop-blur-md">
              หมด
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 px-1">
        <Link href={`/inventory/${id}`}>
          <h3 className="kanit-medium text-slate-800 text-lg mb-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors">{name}</h3>
        </Link>
        <p className="kanit-regular text-slate-500 text-sm mb-4">
          คงเหลือ: <span className="kanit-semibold text-slate-700">{quantity}</span> {unit}
        </p>
        <div className="mt-auto flex gap-2 pt-2">
          <Link href={`/inventory/${id}`} className="flex-1">
            <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 kanit-medium text-sm transition-colors border border-slate-100">
              รายละเอียด
            </button>
          </Link>
          <button 
            onClick={() => addToCart(product)}
            disabled={status === "OUT_OF_STOCK"}
            className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white kanit-medium text-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:hover:bg-blue-50 disabled:hover:text-blue-700 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> เบิก
          </button>
        </div>
      </div>
    </motion.div>
  );
}
