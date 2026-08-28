"use client";

import { useState } from "react";
import { Check, X, Search, Loader2, Download, History, ClipboardCheck, Undo2, Ban } from "lucide-react";
import { Transaction, updateRequestStatus, returnRequest } from "@/app/actions/requests";
import { toast } from "sonner";

//********************************//
// ส่วนจัดการคำร้องเบิกพัสดุสำหรับแอดมิน (Admin Requests Client)
//********************************//
export default function AdminRequestsClient({ 
  initialRequests,
  allRequests = []
}: { 
  initialRequests: Transaction[],
  allRequests: Transaction[]
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [historyRequests, setHistoryRequests] = useState(allRequests);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // ตัวกรองสถานะในแท็บประวัติ
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  //********************************//
  // กรองข้อมูลตามการค้นหาและแท็บ
  //********************************//
  const filteredRequests = (activeTab === "pending" ? requests : historyRequests).filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.user_name && r.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.material_name && r.material_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "pending") {
      return matchesSearch;
    } else {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  });

  //********************************//
  // อนุมัติคำร้องขอเบิกพัสดุ
  //********************************//
  const handleApprove = async (id: string) => {
    if (confirm("ยืนยันการอนุมัติคำร้องนี้?")) {
      setProcessingId(id);
      const res = await updateRequestStatus(id, "APPROVED");
      if (res.success) {
        // อัปเดตรายการที่รออนุมัติออก
        setRequests(prev => prev.filter(r => r.id !== id));
        
        // อัปเดตในประวัติทั้งหมด
        setHistoryRequests(prev => prev.map(r => 
          r.id === id ? { ...r, status: "APPROVED", updated_at: new Date() } : r
        ));
        
        toast.success("อนุมัติคำร้องเรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  //********************************//
  // ปฏิเสธคำร้องขอเบิกพัสดุ
  //********************************//
  const handleReject = async (id: string) => {
    if (confirm("ยืนยันการปฏิเสธคำร้องนี้?")) {
      setProcessingId(id);
      const res = await updateRequestStatus(id, "REJECTED");
      if (res.success) {
        // อัปเดตรายการที่รออนุมัติออก
        setRequests(prev => prev.filter(r => r.id !== id));
        
        // อัปเดตในประวัติทั้งหมด
        setHistoryRequests(prev => prev.map(r => 
          r.id === id ? { ...r, status: "REJECTED", updated_at: new Date() } : r
        ));
        
        toast.success("ปฏิเสธคำร้องเรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  //********************************//
  // ดำเนินการรับคืนพัสดุ (ส่งคืนคลังและคืนจำนวนพัสดุ)
  //********************************//
  const handleReturn = async (id: string) => {
    if (confirm("ยืนยันการรับคืนพัสดุรายการนี้กลับเข้าสู่คลัง?")) {
      setProcessingId(id);
      const res = await returnRequest(id);
      if (res.success) {
        // อัปเดตสถานะในประวัติทั้งหมดเป็น COMPLETED
        setHistoryRequests(prev => prev.map(r => 
          r.id === id ? { ...r, status: "COMPLETED", updated_at: new Date() } : r
        ));
        toast.success("รับคืนพัสดุและเพิ่มสต๊อกกลับเข้าคลังสำเร็จ!");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
      setProcessingId(null);
    }
  };

  //********************************//
  // ส่งออกข้อมูลรายงานเป็นไฟล์ CSV
  //********************************//
  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    
    const headers = ["เลขที่คำร้อง", "ชื่อผู้เบิก", "สาขาวิชา", "รหัสพัสดุ", "ชื่อพัสดุ", "จำนวนที่เบิก", "สถานะ", "วันที่ขอเบิก", "หมายเหตุ"];
    
    const csvRows = filteredRequests.map(req => [
      req.id,
      `"${req.user_name || ''}"`,
      `"${req.department || ''}"`,
      req.material_id,
      `"${req.material_name || ''}"`,
      req.quantity,
      req.status,
      new Date(req.created_at).toLocaleString('th-TH'),
      `"${req.remark || ''}"`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvRows.map(e => e.join(","))
    ].join("\n");
    
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

  //********************************//
  // ฟังก์ชันช่วยแสดง Badge สถานะ
  //********************************//
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 text-xs kanit-medium bg-amber-50 text-amber-600 rounded-full border border-amber-100">รออนุมัติ</span>;
      case "APPROVED":
        return <span className="px-2.5 py-1 text-xs kanit-medium bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">กำลังครอบครอง (เบิกไปแล้ว)</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 text-xs kanit-medium bg-rose-50 text-rose-600 rounded-full border border-rose-100">ถูกปฏิเสธ</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 text-xs kanit-medium bg-blue-50 text-blue-600 rounded-full border border-blue-100">ส่งคืนพัสดุเรียบร้อย</span>;
      default:
        return <span className="px-2.5 py-1 text-xs kanit-medium bg-slate-50 text-slate-600 rounded-full border border-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">การเบิกจ่ายและประวัติผู้ครอบครอง</h1>
          <p className="text-slate-500 kanit-regular mt-1 text-sm">ตรวจสอบคำร้อง อนุมัติการเบิกจ่าย และติดตามพัสดุที่ผู้ใช้ถือครอง</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl kanit-medium text-sm transition-colors border border-blue-100 shadow-sm"
        >
          <Download className="w-4 h-4" />
          ส่งออกรายงาน (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveTab("pending"); setSearchQuery(""); }}
          className={`pb-3 text-sm kanit-semibold transition-all relative flex items-center gap-2 ${activeTab === "pending" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <ClipboardCheck className="w-4 h-4" />
          คำร้องรออนุมัติ ({requests.length})
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button
          onClick={() => { setActiveTab("history"); setSearchQuery(""); }}
          className={`pb-3 text-sm kanit-semibold transition-all relative flex items-center gap-2 ${activeTab === "history" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <History className="w-4 h-4" />
          ประวัติการเบิกและผู้ถือครอง ({historyRequests.length})
          {activeTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === "pending" ? "ค้นหาเลขที่คำร้อง หรือชื่อผู้ขอเบิก..." : "ค้นหาชื่อผู้เบิก พัสดุ หรือสาขา..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
            />
          </div>

          {activeTab === "history" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm kanit-regular focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="ALL">แสดงประวัติทั้งหมด</option>
                <option value="APPROVED">ผู้ครอบครองอยู่ (ยังไม่คืน)</option>
                <option value="COMPLETED">ส่งคืนแล้ว</option>
                <option value="PENDING">รออนุมัติ</option>
                <option value="REJECTED">ถูกปฏิเสธ</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">ผู้ขอเบิก</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รายการพัสดุ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">วันที่ทำรายการ</th>
                {activeTab === "history" && (
                  <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium whitespace-nowrap">สถานะ</th>
                )}
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
                        <p className="text-xs text-slate-500">จำนวนที่เบิก: <strong className="text-slate-800">{req.quantity}</strong> ชิ้น</p>
                      </div>
                    </div>
                    {req.remark && <p className="text-xs text-slate-400 mt-1 italic">หมายเหตุ: "{req.remark}"</p>}
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-500 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleString('th-TH')}
                  </td>
                  {activeTab === "history" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      {activeTab === "pending" ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          {req.status === "APPROVED" && (
                            <button
                              onClick={() => handleReturn(req.id)}
                              disabled={processingId === req.id}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 rounded-lg text-xs kanit-medium transition-all border border-blue-100"
                              title="รับคืนพัสดุเข้าคลัง"
                            >
                              {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                              รับคืนพัสดุ
                            </button>
                          )}
                          {req.status === "COMPLETED" && (
                            <span className="text-xs text-slate-400 kanit-regular mr-2">คืนเรียบร้อยแล้ว</span>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="text-xs text-rose-400 kanit-regular mr-2">ถูกปฏิเสธแล้ว</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={activeTab === "pending" ? 4 : 5} className="px-6 py-12 text-center text-slate-400 kanit-regular">
                    ไม่พบรายการข้อมูลที่ค้นหา
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
