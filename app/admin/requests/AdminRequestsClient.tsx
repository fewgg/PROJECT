"use client";

import { useState } from "react";
import { Check, X, Search, Loader2 } from "lucide-react";
import { Transaction, updateRequestStatus } from "@/app/actions/requests";
import { toast } from "sonner";

export default function AdminRequestsClient({ 
  initialRequests
}: { 
  initialRequests: Transaction[]
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.user_name && r.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.material_name && r.material_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const handleApprove = async (id: string) => {
    if (confirm("ยืนยันการอนุมัติคำร้องนี้?")) {
      setProcessingId(id);
      const res = await updateRequestStatus(id, "APPROVED");
      if (res.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
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
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success("ปฏิเสธคำร้องเรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">การอนุมัติเบิกพัสดุ</h1>
          <p className="text-slate-500 kanit-regular mt-1">ตรวจสอบและอนุมัติคำร้องขอเบิกพัสดุจากพนักงานและอาจารย์</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาเลขที่คำร้อง หรือชื่อผู้ขอเบิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
            />
          </div>
          <div className="kanit-regular text-sm text-slate-500 whitespace-nowrap">
            รออนุมัติทั้งหมด {requests.length} รายการ
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">ผู้ขอเบิก</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รายการพัสดุ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">วันที่ทำรายการ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="kanit-medium text-sm text-slate-800">{req.user_name}</span>
                      {req.department && (
                        <span className="text-xs text-blue-600 kanit-regular mt-0.5">{req.department}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      {req.material_image ? (
                        <img src={req.material_image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                          ?
                        </div>
                      )}
                      <div>
                        <p className="kanit-medium text-slate-800">{req.material_name}</p>
                        <p className="text-xs text-slate-500">จำนวนที่เบิก: <strong className="text-slate-800">{req.quantity}</strong> {req.unit || 'ชิ้น'}</p>
                        {req.borrow_duration_days && (
                          <p className="text-[10px] text-blue-600 kanit-medium mt-0.5">ระยะเวลาขอยืม: {req.borrow_duration_days} วัน</p>
                        )}
                      </div>
                    </div>
                    {req.remark && <p className="text-xs text-slate-400 mt-1 italic">หมายเหตุ: "{req.remark}"</p>}
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-500 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all"
                        title="อนุมัติการเบิก"
                      >
                        {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        อนุมัติ
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all"
                        title="ไม่อนุมัติ"
                      >
                        {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        ปฏิเสธ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 kanit-regular">
                    ไม่มีรายการคำร้องรออนุมัติในขณะนี้
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
