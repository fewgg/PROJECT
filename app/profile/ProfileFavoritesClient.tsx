"use client";

import { Heart } from "lucide-react";
import { ProductCard, ProductCardProps } from "@/components/ui-custom/ProductCard";
import { useState } from "react";

export default function ProfileFavoritesClient({ initialFavorites }: { initialFavorites: any[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        <h2 className="text-xl kanit-semibold text-slate-800">
          รายการโปรดของฉัน
        </h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-16 text-slate-400 kanit-regular flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
          <Heart className="w-12 h-12 mb-4 text-slate-300" />
          <p className="kanit-medium text-lg text-slate-600">ยังไม่มีรายการโปรด</p>
          <p className="text-sm mt-1 text-slate-400">คุณสามารถกดไอคอนหัวใจที่รายการพัสดุในหน้าหลักเพื่อเก็บไว้ที่นี่ได้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div key={item.id}>
              <ProductCard {...item as ProductCardProps} isFavorited={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
