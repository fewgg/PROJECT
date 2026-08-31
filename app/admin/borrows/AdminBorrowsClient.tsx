"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, User, Building, Package, Loader2, ShieldAlert, ShieldCheck, Clock, UserX } from "lucide-react";
import { toast } from "sonner";
import { toggleUserSuspension } from "@/app/actions/user";

interface AdminBorrowsClientProps {
  activeBorrows: any[];
}

const checkOverdueStatus = (dueDateStr?: string | null) => {
  if (!dueDateStr) return { isOverdue: false, label: "ไม่มีกำหนด", colorClass: "bg-slate-50 text-slate-700 border-slate-100" };
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const isOverdue = now > dueDate;
  const diffTime = Math.abs(now.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (isOverdue) {
    return {
      isOverdue: true,
      label: `เลยกำหนด ${diffDays} วัน`,
      colorClass: "bg-rose-50 text-rose-700 border-rose-100 animate-pulse font-semibold"
    };
  }
  return {
    isOverdue: false,
    label: `เหลืออีก ${diffDays} วัน`,
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-100 font-medium"
  };
};

export default function AdminBorrowsClient({ activeBorrows }: AdminBorrowsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  const handleToggleSuspension = async (userId: string, isCurrentlySuspended: boolean) => {
    setSuspendingId(userId);
    const res = await toggleUserSuspension(userId, !isCurrentlySuspended);
    if (res.success) {
      toast.success(isCurrentlySuspended ? "ปลดระงับสิทธิ์สำเร็จ" : "ระงับสิทธิ์สำเร็จ");
      router.refresh();
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
    setSuspendingId(null);
  };

  const filteredBorrows = activeBorrows.filter((b) => {
    const matchesSearch =
      (b.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.material_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">สถานะผู้เบิกพัสดุ</h1>
        <p className="text-slate-500 kanit-regular mt-1">ตรวจสอบผู้ที่อยู่ระหว่างถือครองพัสดุและวันกำหนดส่งคืน พร้อมจัดการสิทธิ์บัญชีผู้ใช้</p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้เบิก, พัสดุ หรือ แผนก/สาขา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
          />
        </div>
        <div className="kanit-regular text-sm text-slate-500 hidden sm:block whitespace-nowrap">
          พบทั้งหมด {filteredBorrows.length} รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">ผู้ขอเบิก</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">รายการพัสดุ</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">วันที่อนุมัติเบิก</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">วันกำหนดคืน</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">สถานะกำหนดส่ง</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600 text-right">การจัดการสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBorrows.map((row) => {
                const overdueInfo = checkOverdueStatus(row.due_date);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="kanit-medium text-sm text-slate-800">{row.user_name}</span>
                          {row.department && (
                            <span className="text-xs text-blue-600 kanit-regular mt-0.5 flex items-center gap-1">
                              <Building className="w-3 h-3" /> {row.department}
                            </span>
                          )}
                          {row.is_suspended && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] kanit-semibold border border-rose-100 mt-1 w-max">
                              <UserX className="w-3 h-3" /> ถูกระงับสิทธิ์เบิก
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Material info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.material_image ? (
                          <img src={row.material_image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="kanit-medium text-slate-800 text-sm">{row.material_name}</p>
                          <p className="text-xs text-slate-500 kanit-regular mt-0.5">
                            จำนวน: <strong className="text-slate-800">{row.quantity}</strong> {row.unit || 'ชิ้น'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Approved Date */}
                    <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(row.updated_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {row.due_date ? (
                          new Date(row.due_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        ) : (
                          'ไม่มีกำหนด'
                        )}
                      </div>
                    </td>

                    {/* Overdue status label */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs kanit-medium border ${overdueInfo.colorClass}`}>
                        {overdueInfo.label}
                      </span>
                    </td>

                    {/* Suspend action */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSuspension(row.user_id, !!row.is_suspended)}
                        disabled={suspendingId === row.user_id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs kanit-medium transition-all shadow-sm border cursor-pointer ${
                          row.is_suspended
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                            : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                        }`}
                      >
                        {suspendingId === row.user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : row.is_suspended ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> ปลดระงับสิทธิ์
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" /> ระงับสิทธิ์การเบิก
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredBorrows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 kanit-regular">
                    ไม่มีรายการพัสดุค้างส่งอยู่ในขณะนี้
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
