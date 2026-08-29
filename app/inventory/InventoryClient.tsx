"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard, ProductCardProps } from "@/components/ui-custom/ProductCard";
import { Material } from "@/app/actions/materials";
import { Category } from "@/app/actions/categories";

export default function InventoryClient({ initialData, categories = [] }: { initialData: Material[]; categories?: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultQuery = searchParams.get("q") || "";
  
  //********************************//
  // State การค้นหาและตัวกรอง
  //********************************//
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["AVAILABLE", "LOW_STOCK"]);

  //********************************//
  // ดึงรายการหมวดหมู่ทั้งหมดสำหรับแสดงผล
  //********************************//
  const categoryList = ["ทั้งหมด", ...Array.from(new Set([
    ...categories.map(c => c.name),
    ...initialData.map(m => m.category).filter(Boolean)
  ]))];

  //********************************//
  // สลับการเลือกสถานะพัสดุ
  //********************************//
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => 
      prev.includes(status) 
        ? prev.filter((s) => s !== status) 
        : [...prev, status]
    );
  };

  //********************************//
  // การกรองข้อมูลพัสดุตามคำค้นหา, หมวดหมู่, และสถานะ
  //********************************//
  const filteredData = initialData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "ทั้งหมด" || 
      item.category === selectedCategory ||
      (item.category && item.category.replace("วัสดุ", "พัสดุ") === selectedCategory.replace("วัสดุ", "พัสดุ"));
    const matchStatus = selectedStatuses.includes(item.status);
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 py-8 animate-in fade-in duration-500">
      
      {/* ******************************** */}
      {/* Sidebar ตัวกรองหมวดหมู่และสถานะ      */}
      {/* ******************************** */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4 kanit-semibold text-slate-800">
            <Filter className="w-4 h-4" /> หมวดหมู่พัสดุ
          </div>
          <div className="flex flex-col gap-2">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-left px-4 py-2 rounded-xl kanit-regular text-sm transition-colors ${
                  selectedCategory === cat 
                    ? "bg-blue-50 text-blue-700 kanit-medium" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 kanit-semibold text-slate-800">
            <SlidersHorizontal className="w-4 h-4" /> สถานะพัสดุ
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedStatuses.includes("AVAILABLE")}
                onChange={() => toggleStatus("AVAILABLE")}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
              />
              <span className="kanit-regular text-sm text-slate-600 group-hover:text-slate-900 transition-colors">มีพัสดุ (Available)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedStatuses.includes("LOW_STOCK")}
                onChange={() => toggleStatus("LOW_STOCK")}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
              />
              <span className="kanit-regular text-sm text-slate-600 group-hover:text-slate-900 transition-colors">ใกล้หมด (Low Stock)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedStatuses.includes("OUT_OF_STOCK")}
                onChange={() => toggleStatus("OUT_OF_STOCK")}
                className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500" 
              />
              <span className="kanit-regular text-sm text-slate-600 group-hover:text-slate-900 transition-colors">หมด (Out of Stock)</span>
            </label>
          </div>
        </div>
      </aside>

      {/* ******************************** */}
      {/* ส่วนแสดงรายการพัสดุและช่องค้นหา     */}
      {/* ******************************** */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหารายการพัสดุ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl kanit-regular text-sm transition-all outline-none"
            />
          </div>
          <div className="kanit-regular text-sm text-slate-500 whitespace-nowrap">
            แสดงผล {filteredData.length} รายการ
          </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              key={item.id}
            >
              <ProductCard {...item as ProductCardProps} />
            </motion.div>
          ))}
          {filteredData.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="kanit-medium text-lg">ไม่พบรายการพัสดุ</p>
              <p className="kanit-regular text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
            </div>
          )}
        </motion.div>
      </main>

    </div>
  );
}
