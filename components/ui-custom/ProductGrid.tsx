"use client";

import { motion, Variants } from "framer-motion";
import { ProductCard, ProductCardProps } from "./ProductCard";

import Link from "next/link";
import { Material } from "@/app/actions/materials";
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function ProductGrid({ materials }: { materials: Material[] }) {
  return (
    <section className="w-full py-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl kanit-bold tracking-tight text-slate-900">วัสดุแนะนำ</h2>
          <p className="kanit-regular text-slate-500 mt-1">รายการวัสดุที่มีการเบิกใช้งานบ่อย</p>
        </div>
        <Link href="/inventory">
          <button className="text-blue-600 kanit-medium text-sm hover:underline">ดูทั้งหมด</button>
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        {materials.slice(0, 5).map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard {...(product as unknown as ProductCardProps)} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
