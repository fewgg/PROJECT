"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Package, Info, CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { Material } from "@/app/actions/materials";
import { ProductCardProps } from "@/components/ui-custom/ProductCard";

export default function ProductDetailsClient({ product }: { product: Material }) {
  const { addToCart } = useCart();
  
  // สร้างคำอธิบายจำลอง (Mockup Description) ตามหมวดหมู่
  const generateDescription = (category: string) => {
    switch (category) {
      case "พัสดุคอมพิวเตอร์และไอที":
        return "อุปกรณ์และพัสดุที่เกี่ยวข้องกับระบบคอมพิวเตอร์ เครือข่าย และไอที เหมาะสำหรับการใช้งานในห้องปฏิบัติการและสำนักงานทั่วไป ผ่านมาตรฐานความปลอดภัยและรองรับการใช้งานต่อเนื่อง";
      case "พัสดุสำนักงาน":
        return "พัสดุสิ้นเปลืองสำหรับสำนักงาน คุณภาพดี เหมาะสำหรับงานเอกสาร งานธุรการ และการเรียนการสอน ช่วยให้การจัดการงานต่างๆ เป็นไปอย่างราบรื่น";
      case "พัสดุทำความสะอาด":
        return "น้ำยาและอุปกรณ์ทำความสะอาด เพื่อสุขอนามัยที่ดีในสถานที่ทำงานและห้องเรียน ปลอดภัยต่อผู้ใช้งานและเป็นมิตรกับสิ่งแวดล้อม";
      case "พัสดุช่างและอุปกรณ์ทั่วไป":
        return "เครื่องมือช่างและอุปกรณ์สำหรับการบำรุงรักษาอาคารสถานที่ แข็งแรงทนทาน ได้มาตรฐานอุตสาหกรรม";
      default:
        return "พัสดุและอุปกรณ์คุณภาพสูง สำหรับใช้งานภายในวิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร";
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 py-6 md:py-10 px-4 md:px-0">
      <Link href="/inventory" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 kanit-medium transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        กลับไปหน้าคลังพัสดุ
      </Link>

      <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10">
        
        {/* รูปภาพด้านซ้าย */}
        <div className="w-full md:w-1/2 lg:w-2/5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 relative border border-slate-100"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              {product.status === "AVAILABLE" && (
                <Badge className="bg-emerald-500/90 text-white border-none shadow-md backdrop-blur-md px-3 py-1 text-sm kanit-medium">
                  มีพัสดุพร้อมเบิก
                </Badge>
              )}
              {product.status === "LOW_STOCK" && (
                <Badge className="bg-amber-500/90 text-white border-none shadow-md backdrop-blur-md px-3 py-1 text-sm kanit-medium">
                  พัสดุใกล้หมด
                </Badge>
              )}
              {product.status === "OUT_OF_STOCK" && (
                <Badge className="bg-rose-500/90 text-white border-none shadow-md backdrop-blur-md px-3 py-1 text-sm kanit-medium">
                  พัสดุหมด
                </Badge>
              )}
            </div>
          </motion.div>
        </div>

        {/* รายละเอียดด้านขวา */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col justify-center">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 kanit-medium">
              {product.category || "หมวดหมู่ทั่วไป"}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl kanit-bold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-slate-500 kanit-regular text-sm mb-8 flex items-center gap-2">
            <Package className="w-4 h-4" /> รหัสพัสดุ: {product.id}
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <h3 className="kanit-semibold text-slate-800 text-lg mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              รายละเอียดและคุณสมบัติ
            </h3>
            <p className="kanit-regular text-slate-600 leading-relaxed">
              {generateDescription(product.category)}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="kanit-medium text-slate-800 text-lg">
                จำนวนคงเหลือปัจจุบัน: <span className="text-blue-600 font-bold">{product.quantity}</span> {product.unit}
              </p>
            </div>
          </div>

          {/* เงื่อนไขการเบิก (Mockup) */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-2 kanit-regular text-sm text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>สำหรับการใช้งานภายในวิทยาลัยฯ เท่านั้น</span>
            </div>
            <div className="flex items-start gap-2 kanit-regular text-sm text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>ผู้เบิกต้องระบุเหตุผลในการเบิกทุกครั้ง</span>
            </div>
          </div>

          <button 
            onClick={() => addToCart(product as unknown as ProductCardProps)}
            disabled={product.status === "OUT_OF_STOCK"}
            className="w-full md:w-auto px-12 py-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 kanit-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:-translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> เพิ่มลงรายการขอเบิก
          </button>
        </div>

      </div>
    </div>
  );
}
