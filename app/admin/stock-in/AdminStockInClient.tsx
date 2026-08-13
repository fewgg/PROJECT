"use client";

import { useState } from "react";
import { Search, Save, PackagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Material } from "@/app/actions/materials";
import { Transaction, stockInMaterial } from "@/app/actions/stock-in";

export default function AdminStockInClient({ materials, recentStockIns }: { materials: Material[], recentStockIns: Transaction[] }) {
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    
    setIsSubmitting(true);
    const res = await stockInMaterial(selectedItem, parseInt(quantity), remark);
    
    if (res.success) {
      toast.success("บันทึกการรับของเข้าคลังเรียบร้อยแล้ว", {
        description: `เพิ่มรายการลงในคลังจำนวน ${quantity} หน่วย`,
      });
      setSelectedItem("");
      setQuantity("");
      setRemark("");
    } else {
      toast.error("เกิดข้อผิดพลาด: " + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">รับของเข้าคลัง (Stock In)</h1>
        <p className="text-slate-500 kanit-regular mt-1 text-sm">บันทึกการรับวัสดุใหม่เข้าสู่คลัง</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-2">
            <label className="kanit-medium text-slate-700 text-sm">ค้นหาและเลือกวัสดุ</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none appearance-none"
                required
              >
                <option value="" disabled>-- กรุณาเลือกวัสดุ --</option>
                {materials.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (คงเหลือ: {item.quantity} {item.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="kanit-medium text-slate-700 text-sm">จำนวนรับเข้า</label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="ระบุจำนวน" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="kanit-medium text-slate-700 text-sm">อ้างอิงเอกสาร/หมายเหตุ (ถ้ามี)</label>
              <input 
                type="text" 
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="เช่น เลขที่ใบสั่งซื้อ PO-001" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white kanit-medium px-8 py-3 rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกรับเข้าคลัง
            </button>
          </div>
        </form>
      </div>
      
      {/* ประวัติการรับเข้าล่าสุด */}
      <div className="mt-12">
        <h2 className="text-lg kanit-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-blue-600" /> ประวัติการรับเข้าล่าสุด
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">วันที่/เวลา</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รายการ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium text-center whitespace-nowrap">จำนวนที่รับ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentStockIns.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-500 whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 kanit-medium text-sm text-slate-800">
                    {tx.material_name}
                  </td>
                  <td className="px-6 py-4 kanit-semibold text-sm text-blue-600 text-center">
                    + {tx.quantity}
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-600 whitespace-nowrap">
                    {tx.user_name}
                  </td>
                </tr>
              ))}
              {recentStockIns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 kanit-regular">
                    ยังไม่มีประวัติการรับของเข้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
