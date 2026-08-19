"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { createRequest } from "@/app/actions/requests";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function RequisitionCart() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState("");

  const totalItems = cartItems.reduce((acc, item) => acc + item.requestQuantity, 0);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    let allSuccess = true;
    for (const item of cartItems) {
      const res = await createRequest(item.id, item.requestQuantity, remark);
      if (!res.success) {
        allSuccess = false;
        toast.error(`ไม่สามารถเบิก ${item.name} ได้`);
      }
    }
    
    if (allSuccess) {
      toast.success("ส่งคำขอเบิกพัสดุเรียบร้อยแล้ว");
      clearCart();
      setIsCartOpen(false);
      setRemark("");
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-xl kanit-semibold text-slate-800">รายการเบิกพัสดุ</h2>
                {cartItems.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs kanit-medium px-2.5 py-0.5 rounded-full">
                    {cartItems.length} รายการ
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 text-slate-200" />
                  <p className="kanit-regular">ยังไม่มีรายการพัสดุในตะกร้า</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-blue-600 kanit-medium hover:underline"
                  >
                    เลือกดูพัสดุ
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id} 
                      className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="kanit-medium text-slate-800 line-clamp-2 text-sm">{item.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="kanit-regular text-xs text-slate-500 mt-1">
                            คงเหลือ {item.quantity} {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.requestQuantity <= 1}
                            className="p-1 rounded-md hover:bg-white text-slate-500 border border-transparent hover:border-slate-200 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="kanit-semibold text-sm w-4 text-center">{item.requestQuantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.requestQuantity >= item.quantity}
                            className="p-1 rounded-md hover:bg-white text-slate-500 border border-transparent hover:border-slate-200 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="mb-4">
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
                    className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl kanit-regular outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center mb-4 kanit-medium">
                  <span className="text-slate-500">รวมจำนวนพัสดุที่ขอเบิก</span>
                  <span className="text-xl text-slate-800">{totalItems} <span className="text-sm font-normal text-slate-500">ชิ้น</span></span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={clearCart}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-full kanit-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  >
                    ล้างตะกร้า
                  </button>
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex-1 py-3 flex items-center justify-center gap-2 rounded-full kanit-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ยืนยันการขอเบิก"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
