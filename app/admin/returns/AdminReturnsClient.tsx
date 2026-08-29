"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RotateCcw, Calendar, User, Building, Package, Undo2, Loader2, CheckCircle2, History, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { returnRequest, rejectReturnRequest } from "@/app/actions/requests";

export default function AdminReturnsClient({ returnRequests }: { returnRequests: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter and counts
  const countPending = returnRequests.filter((r) => r.status === "RETURN_PENDING").length;
  const countCompleted = returnRequests.filter((r) => r.status === "COMPLETED" || r.status === "RETURN_REJECTED").length;

  const filteredRequests = returnRequests.filter((r) => {
    const matchesTab = activeTab === "pending" 
      ? r.status === "RETURN_PENDING" 
      : (r.status === "COMPLETED" || r.status === "RETURN_REJECTED");
      
    const matchesSearch =
      (r.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.material_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Accept return action
  const handleReturn = async (id: string) => {
    if (confirm("ยืนยันการรับคืนพัสดุรายการนี้กลับเข้าสู่คลัง?")) {
      setProcessingId(id);
      const res = await returnRequest(id);
      if (res.success) {
        toast.success("รับคืนพัสดุและเพิ่มสต๊อกกลับเข้าคลังสำเร็จ!");
        router.refresh();
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  // Reject return action
  const handleReject = async (id: string) => {
    const reason = prompt("กรุณาระบุเหตุผลในการปฏิเสธการรับคืน:", "พัสดุชำรุดเสียหาย / ข้อมูลไม่ตรงตามจริง");
    if (reason === null) return; // User cancelled the prompt

    if (!reason.trim()) {
      toast.error("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    setProcessingId(id);
    const res = await rejectReturnRequest(id, reason.trim());
    if (res.success) {
      toast.success("ปฏิเสธการรับคืนพัสดุเรียบร้อย");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด: " + res.error);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">ประวัติการคืนพัสดุ</h1>
        <p className="text-slate-500 kanit-regular mt-1">จัดการคำร้องและบันทึกข้อมูลการส่งคืนพัสดุทั้งหมดของพนักงานและอาจารย์</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveTab("pending"); setSearchQuery(""); }}
          className={`pb-3 text-sm kanit-semibold transition-all relative flex items-center gap-2 cursor-pointer ${activeTab === "pending" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
        >
          <RotateCcw className="w-4 h-4" />
          คำร้องขอส่งคืน ({countPending})
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button
          onClick={() => { setActiveTab("completed"); setSearchQuery(""); }}
          className={`pb-3 text-sm kanit-semibold transition-all relative flex items-center gap-2 cursor-pointer ${activeTab === "completed" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
        >
          <History className="w-4 h-4" />
          ประวัติการจัดการคืน ({countCompleted})
          {activeTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้คืน, พัสดุ หรือ แผนก/สาขา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
          />
        </div>
        <div className="kanit-regular text-sm text-slate-500 hidden sm:block whitespace-nowrap">
          แสดงผล {filteredRequests.length} รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">ผู้คืนพัสดุ</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">รายการพัสดุ</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">วันเวลาที่ส่งคืน</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">หมายเหตุ / เหตุผลปฏิเสธ</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* User info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="kanit-medium text-sm text-slate-800">{req.user_name}</span>
                        {req.department && (
                          <span className="text-xs text-blue-600 kanit-regular mt-0.5 flex items-center gap-1">
                            <Building className="w-3 h-3" /> {req.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Material info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {req.material_image ? (
                        <img src={req.material_image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="kanit-medium text-slate-800 text-sm">{req.material_name}</p>
                        <p className="text-xs text-slate-500 kanit-regular mt-0.5">
                          จำนวน: <strong className="text-slate-800">{req.quantity}</strong> {req.unit || 'ชิ้น'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Returned Date/Time */}
                  <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(req.updated_at).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </td>

                  {/* Remarks */}
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-500 max-w-xs truncate">
                    {req.remark ? (
                      <span className={`italic ${req.status === 'RETURN_REJECTED' ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
                        "{req.remark}"
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {req.status === "RETURN_PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleReturn(req.id)}
                          disabled={processingId === req.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all border border-blue-100 cursor-pointer shadow-sm"
                        >
                          {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                          ยืนยันรับคืน
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all border border-rose-100 cursor-pointer shadow-sm"
                        >
                          {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : req.status === "RETURN_REJECTED" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-500 bg-rose-50 border border-rose-100 rounded-lg text-xs kanit-medium">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        ปฏิเสธการคืนแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg text-xs kanit-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        รับคืนสำเร็จแล้ว
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 kanit-regular">
                    <div className="flex flex-col items-center justify-center">
                      <RotateCcw className="w-10 h-10 mb-3 opacity-20" />
                      <p>
                        {activeTab === "pending"
                          ? "ไม่มีคำร้องขอส่งคืนพัสดุในขณะนี้"
                          : "ไม่มีประวัติการส่งคืนพัสดุในขณะนี้"}
                      </p>
                    </div>
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
