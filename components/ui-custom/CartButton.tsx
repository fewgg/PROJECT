"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "../providers/CartProvider";

export function CartButton() {
  const { cartItems, setIsCartOpen } = useCart();
  const totalItems = cartItems.reduce((acc, item) => acc + item.requestQuantity, 0);

  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className="relative p-2.5 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100 group"
    >
      <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] kanit-semibold flex items-center justify-center shadow-sm">
          {totalItems}
        </span>
      )}
    </button>
  );
}
