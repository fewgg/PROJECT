"use client";

import { motion } from "framer-motion";
import { Package, Search, Box } from "lucide-react";
import Link from "next/link";

export function HeroBanner() {
  return (
    <div className="relative w-full h-auto min-h-[320px] rounded-[32px] overflow-hidden shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Background Image */}
      <img src="/banner.jpg" alt="NMC Banner" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-transparent z-0"></div>

      {/* Background soft shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Left Content */}
      <div className="relative z-10 max-w-xl text-white space-y-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl kanit-bold tracking-tight mb-2"
          >
            ระบบคลังวัสดุ NMC
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-blue-100 text-lg md:text-xl kanit-medium"
          >
            ระบบบริหารคลังวัสดุสำหรับวิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-blue-50 kanit-regular"
        >
          <div className="flex items-center gap-1"><Box className="w-4 h-4"/> จัดการข้อมูลวัสดุ</div>
          <div className="flex items-center gap-1"><Search className="w-4 h-4"/> ติดตามจำนวนคงเหลือ</div>
          <div className="flex items-center gap-1"><Package className="w-4 h-4"/> เบิก-คืนวัสดุรวดเร็ว</div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          action="/inventory"
          method="GET"
          className="relative mt-8 max-w-lg"
        >
          <input 
            type="text" 
            name="q"
            placeholder="พิมพ์ชื่อวัสดุที่ต้องการเบิก..." 
            className="w-full pl-6 pr-32 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-100 backdrop-blur-md focus:bg-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all outline-none kanit-regular text-lg shadow-2xl"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-white text-blue-700 hover:bg-slate-50 px-6 rounded-full kanit-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Search className="w-5 h-5" /> ค้นหา
          </button>
        </motion.form>
      </div>

    </div>
  );
}
