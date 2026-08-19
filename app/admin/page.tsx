import sql from "@/lib/db";
import { Package, AlertCircle, ClipboardList, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // Fetch materials from database
  const materials = await sql`SELECT * FROM materials`;
  
  const totalMaterials = materials.length;
  const lowStockMaterials = materials.filter((m) => m.status === "LOW_STOCK" || m.status === "OUT_OF_STOCK").length;
  
  // Dummy data for pending requests (To be implemented with real transactions later)
  const pendingRequests = 5;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-slate-500 kanit-regular mt-1">สรุปข้อมูลสถานะคลังพัสดุและการเบิกจ่าย</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm kanit-medium text-slate-500">รายการพัสดุทั้งหมด</p>
            <h3 className="text-3xl kanit-bold text-slate-800 mt-1">{totalMaterials}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm kanit-medium text-slate-500">พัสดุใกล้หมด / หมด</p>
            <h3 className="text-3xl kanit-bold text-slate-800 mt-1">{lowStockMaterials}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm kanit-medium text-slate-500">คำร้องรออนุมัติ</p>
            <h3 className="text-3xl kanit-bold text-slate-800 mt-1">{pendingRequests}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg kanit-semibold text-slate-800">คำร้องขอเบิกล่าสุด</h3>
            <Link href="/admin/requests">
              <button className="text-sm text-blue-600 kanit-medium hover:underline cursor-pointer">ดูทั้งหมด</button>
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="kanit-medium text-sm text-slate-800">REQ-2607{i}</p>
                    <p className="text-xs text-slate-500 kanit-regular">ขอเบิก กระดาษ A4 (2 รีม) ...</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 kanit-regular">
                    รออนุมัติ
                  </span>
                  <p className="text-xs text-slate-400 kanit-regular mt-1">2 ชม. ที่แล้ว</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg kanit-semibold text-slate-800">พัสดุที่ต้องเติมสต๊อกด่วน</h3>
            <Link href="/admin/stock-in">
              <button className="text-sm text-blue-600 kanit-medium hover:underline cursor-pointer">รับของเข้า</button>
            </Link>
          </div>
          <div className="space-y-4">
            {materials.filter(m => m.status === "OUT_OF_STOCK" || m.status === "LOW_STOCK").slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="kanit-medium text-sm text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500 kanit-regular">คงเหลือ: {item.quantity} {item.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium kanit-regular ${item.status === 'OUT_OF_STOCK' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {item.status === "OUT_OF_STOCK" ? "หมด" : "ใกล้หมด"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
