"use client";

import { useState } from "react";
import { Check, X, Search, Eye, Loader2, Download } from "lucide-react";
import { Transaction, updateRequestStatus } from "@/app/actions/requests";
import { toast } from "sonner";

export default function AdminRequestsClient({ initialRequests }: { initialRequests: Transaction[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredRequests = requests.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.user_name && r.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.material_name && r.material_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApprove = async (id: string) => {
    if (confirm("ยืนยันการอนุมัติคำร้องนี้?")) {
      setProcessingId(id);
      const res = await updateRequestStatus(id, "APPROVED");
      if (res.success) {
        setRequests(requests.filter(r => r.id !== id));
        toast.success("อนุมัติคำร้องเรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("ยืนยันการปฏิเสธคำร้องนี้?")) {
      setProcessingId(id);
      const res = await updateRequestStatus(id, "REJECTED");
      if (res.success) {
        setRequests(requests.filter(r => r.id !== id));
        toast.success("ปฏิเสธคำร้องเรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    
    // สร้าง Header ของ CSV
    const headers = ["เลขที่คำร้อง", "ชื่อผู้เบิก", "รหัสวัสดุ", "ชื่อวัสดุ", "จำนวนที่เบิก", "สถานะ", "วันที่", "หมายเหตุ"];
    
    // แปลงข้อมูลเป็น array ของ string
    const csvRows = filteredRequests.map(req => [
      req.id,
      `"${req.user_name || ''}"`,
      req.material_id,
      `"${req.material_name || ''}"`,
      req.quantity,
      req.status,
      new Date(req.created_at).toLocaleString('th-TH'),
      `"${req.remark || ''}"`
    ]);
    
    // รวม Header และ Data
    const csvContent = [
      headers.join(","),
      ...csvRows.map(e => e.join(","))
    ].join("\n");
    
    // เพิ่ม BOM สำหรับรองรับภาษาไทยใน Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `requests_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("ดาวน์โหลดไฟล์ CSV เรียบร้อย");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">อนุมัติเบิกวัสดุ</h1>
          <p className="text-slate-500 kanit-regular mt-1 text-sm">ตรวจสอบและอนุมัติคำร้องขอเบิกพัสดุจากผู้ใช้งาน</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl kanit-medium text-sm transition-colors border border-blue-100 shadow-sm"
        >
          <Download className="w-4 h-4" />
          ส่งออกรายงาน (CSV)
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาเลขที่คำร้อง หรือ ชื่อผู้เบิก..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg kanit-regular text-sm transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">เลขที่คำร้อง</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">ผู้เบิก</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รายการที่ขอเบิก</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">วันที่/เวลา</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 kanit-medium text-xs text-slate-800 whitespace-nowrap">
                    {req.id.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-700 whitespace-nowrap">
                    {req.user_name}
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <img src={req.material_image} alt={req.material_name} className="w-8 h-8 rounded-lg object-cover border border-slate-100" />
                      <div>
                        <p className="kanit-medium text-slate-800">{req.material_name}</p>
                        <p className="text-xs text-slate-500">จำนวน: {req.quantity}</p>
                      </div>
                    </div>
                    {req.remark && <p className="text-xs text-slate-400 mt-1 italic">"{req.remark}"</p>}
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-500 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                        className="p-2 text-emerald-500 hover:text-white hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors" 
                        title="อนุมัติ"
                      >
                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                        className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 disabled:opacity-50 rounded-lg transition-colors"
                        title="ไม่อนุมัติ"
                      >
                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 kanit-regular">
                    ไม่พบข้อมูลคำร้องที่รอการอนุมัติ
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
