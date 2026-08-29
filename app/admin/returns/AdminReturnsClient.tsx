"use client";

import { useState } from "react";
import { Search, RotateCcw, Calendar, User, Building, Package } from "lucide-react";
import { Transaction } from "@/app/actions/requests";

export default function AdminReturnsClient({ returnRequests }: { returnRequests: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = returnRequests.filter((r) => {
    const matchesSearch =
      (r.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.material_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">ประวัติการคืนพัสดุ</h1>
        <p className="text-slate-500 kanit-regular mt-1">บันทึกข้อมูลการส่งคืนพัสดุทั้งหมดของพนักงานและอาจารย์</p>
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
          ทั้งหมด {filteredRequests.length} รายการ
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
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">หมายเหตุ</th>
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
                      <span className="italic text-slate-600">"{req.remark}"</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 kanit-regular">
                    <div className="flex flex-col items-center justify-center">
                      <RotateCcw className="w-10 h-10 mb-3 opacity-20" />
                      <p>ไม่มีประวัติการส่งคืนพัสดุในขณะนี้</p>
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
