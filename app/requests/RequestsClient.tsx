"use client";

import { useState } from "react";
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { userReturnRequest } from "@/app/actions/requests";

//********************************//
// Type ของข้อมูลคำร้อง
//********************************//
type Transaction = {
  id: string;
  material_id: string;
  user_id: string;
  type: string;
  quantity: number;
  status: string;
  remark: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
  material_name?: string;
  material_image?: string;
};

//********************************//
// Component หลักประวัติการเบิกพัสดุ
//********************************//
export default function RequestsClient({ initialRequests }: { initialRequests: Transaction[] }) {
  const router = useRouter();
  const [returningId, setReturningId] = useState<string | null>(null);

  //********************************//
  // State การค้นหาและตัวกรองสถานะ
  //********************************//
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  //********************************//
  // ส่งคืนพัสดุ (User Return Action)
  //********************************//
  const handleUserReturn = async (id: string) => {
    if (confirm("ยืนยันว่าคุณต้องการส่งคืนพัสดุนี้กลับเข้าสู่คลัง?")) {
      setReturningId(id);
      const res = await userReturnRequest(id);
      if (res.success) {
        toast.success("ส่งคืนพัสดุสำเร็จ");
        router.refresh();
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการส่งคืน");
      }
      setReturningId(null);
    }
  };

  //********************************//
  // คำนวณจำนวนคำร้องแต่ละสถานะ
  //********************************//
  const countAll = initialRequests.length;
  const countPending = initialRequests.filter(r => r.status === "PENDING").length;
  const countApproved = initialRequests.filter(r => r.status === "APPROVED").length;
  const countRejected = initialRequests.filter(r => r.status === "REJECTED").length;
  const countCompleted = initialRequests.filter(r => r.status === "COMPLETED").length;

  //********************************//
  // กรองรายการคำร้องตามสถานะและคำค้นหา
  //********************************//
  const filteredRequests = initialRequests.filter(req => {
    const matchStatus = selectedStatus === "ALL" || req.status === selectedStatus;
    const matchSearch = 
      (req.material_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto py-8">
      {/* ******************************** */}
      {/* ส่วนหัวหน้าประวัติการเบิกพัสดุ       */}
      {/* ******************************** */}
      <div>
        <h1 className="text-3xl kanit-bold tracking-tight text-slate-900">ประวัติการเบิก-คืนพัสดุ</h1>
        <p className="kanit-regular text-slate-500 mt-1">รายการคำร้องขอเบิกและส่งคืนพัสดุของคุณและสถานะปัจจุบัน</p>
      </div>

      {/* ******************************** */}
      {/* ส่วนค้นหาและหมวดหมู่ตัวกรองสถานะ   */}
      {/* ******************************** */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
        {/* ช่องค้นหา */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อพัสดุ หรือ เลขที่คำร้อง..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl kanit-regular text-sm transition-all outline-none"
          />
        </div>

        {/* หมวดหมู่เลือกสถานะ */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs kanit-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            ทั้งหมด
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedStatus === "ALL" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus("PENDING")}
            className={`px-3.5 py-2 rounded-xl text-xs kanit-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            รออนุมัติ
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedStatus === "PENDING" ? "bg-amber-600 text-white" : "bg-amber-200/70 text-amber-800"}`}>
              {countPending}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus("APPROVED")}
            className={`px-3.5 py-2 rounded-xl text-xs kanit-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "APPROVED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            อนุมัติแล้ว
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedStatus === "APPROVED" ? "bg-emerald-700 text-white" : "bg-emerald-200/70 text-emerald-800"}`}>
              {countApproved}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus("REJECTED")}
            className={`px-3.5 py-2 rounded-xl text-xs kanit-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "REJECTED"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            ถูกปฏิเสธ
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedStatus === "REJECTED" ? "bg-rose-700 text-white" : "bg-rose-200/70 text-rose-800"}`}>
              {countRejected}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus("COMPLETED")}
            className={`px-3.5 py-2 rounded-xl text-xs kanit-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === "COMPLETED"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            คืนพัสดุแล้ว
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedStatus === "COMPLETED" ? "bg-blue-700 text-white" : "bg-blue-200/70 text-blue-800"}`}>
              {countCompleted}
            </span>
          </button>
        </div>
      </div>

      {/* ******************************** */}
      {/* ส่วนตาราง/รายการประวัติการเบิก     */}
      {/* ******************************** */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center text-slate-400 kanit-regular shadow-sm flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            {initialRequests.length === 0 ? "คุณยังไม่มีประวัติการขอเบิกพัสดุ" : "ไม่พบประวัติการขอเบิกพัสดุในหมวดหมู่นี้"}
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <img src={req.material_image || "/placeholder.png"} alt={req.material_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="kanit-medium text-lg text-slate-800">{req.material_name}</h3>
                  <div className="text-sm kanit-regular text-slate-500 mt-1 space-y-1">
                    <p>เลขที่คำร้อง: {req.id.substring(0, 8)}...</p>
                    {req.department && <p className="text-blue-600 kanit-medium">สาขาที่รับ: {req.department}</p>}
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      {new Date(req.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  {req.remark && <p className="text-xs text-slate-400 mt-1 italic">"{req.remark}"</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <div className="text-xs kanit-medium text-slate-400">จำนวนที่ขอเบิก</div>
                  <div className="kanit-bold text-2xl text-slate-700">{req.quantity}</div>
                </div>
                
                <div className="flex flex-col items-end min-w-[120px]">
                  {req.status === 'PENDING' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 kanit-medium text-sm border border-amber-100">
                      <Clock className="w-4 h-4 mr-1.5" /> รออนุมัติ
                    </div>
                  )}
                  {req.status === 'APPROVED' && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 kanit-medium text-sm border border-emerald-100">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> อนุมัติแล้ว
                      </div>
                      <button
                        onClick={() => handleUserReturn(req.id)}
                        disabled={returningId === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all cursor-pointer shadow-sm border border-blue-100"
                      >
                        {returningId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        ส่งคืนพัสดุ
                      </button>
                    </div>
                  )}
                  {req.status === 'REJECTED' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-600 kanit-medium text-sm border border-rose-100">
                      <XCircle className="w-4 h-4 mr-1.5" /> ถูกปฏิเสธ
                    </div>
                  )}
                  {req.status === 'COMPLETED' && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 kanit-medium text-sm border border-blue-100">
                      <CheckCircle className="w-4 h-4 mr-1.5" /> คืนพัสดุแล้ว
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
