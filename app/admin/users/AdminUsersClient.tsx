"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Mail, Calendar, Building, ShieldAlert, ShieldCheck, Loader2, Eye, UserX, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleUserSuspension } from "@/app/actions/user";
import { SerializedClerkUser } from "./page";

interface AdminUsersClientProps {
  initialUsers: SerializedClerkUser[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<SerializedClerkUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  const handleToggleSuspension = async (userId: string, isCurrentlySuspended: boolean) => {
    setSuspendingId(userId);
    const res = await toggleUserSuspension(userId, !isCurrentlySuspended);
    if (res.success) {
      toast.success(isCurrentlySuspended ? "ปลดระงับสิทธิ์สำเร็จ" : "ระงับสิทธิ์สำเร็จ");
      // Update local state
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isSuspended: !isCurrentlySuspended } : u))
      );
      router.refresh();
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
    setSuspendingId(null);
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const department = u.department.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      department.includes(query);

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.role === "admin") ||
      (roleFilter === "user" && u.role !== "admin");

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "suspended" && u.isSuspended) ||
      (statusFilter === "active" && !u.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title */}
      <div>
        <h1 className="text-3xl kanit-bold text-slate-900 tracking-tight">จัดการสมาชิก</h1>
        <p className="text-slate-500 kanit-regular mt-1">รายชื่อบุคลากรและสมาชิกทั้งหมดในระบบ พร้อมฟังก์ชันค้นหาและจัดการสิทธิ์การเข้าถึง</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, นามสกุล, อีเมล หรือแผนก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl kanit-regular text-sm transition-all outline-none"
          />
        </div>

        {/* Status & Role Selects */}
        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl kanit-regular text-sm focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="all">ทุกบทบาท</option>
            <option value="user">ผู้ใช้งานทั่วไป</option>
            <option value="admin">แอดมิน</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl kanit-regular text-sm focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ปกติ (ใช้งานได้)</option>
            <option value="suspended">ถูกระงับสิทธิ์</option>
          </select>
          
          <div className="flex items-center px-2 text-xs text-slate-400 kanit-regular">
            พบทั้งหมด {filteredUsers.length} รายการ
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">สมาชิก</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">อีเมล</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">แผนก/สาขา</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">บทบาท</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">วันที่สมัคร</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600">สถานะ</th>
                <th className="px-6 py-4 kanit-semibold text-sm text-slate-600 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* User name & avatar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                        {user.hasImage ? (
                          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full text-slate-400 flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="kanit-medium text-sm text-slate-800">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-slate-400" />
                      {user.department}
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium kanit-regular ${
                      user.role === 'admin' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {user.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้ทั่วไป'}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 whitespace-nowrap kanit-regular text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(user.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium kanit-regular border ${
                      user.isSuspended
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {user.isSuspended ? (
                        <>
                          <UserX className="w-3.5 h-3.5" /> ถูกระงับสิทธิ์
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> ปกติ
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-2">
                      {/* View detail button */}
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="ดูประวัติและข้อมูลโปรไฟล์"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Suspend Toggle button (only for non-admin users) */}
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleSuspension(user.id, user.isSuspended)}
                          disabled={suspendingId === user.id}
                          className={`p-2 rounded-lg transition-all cursor-pointer border ${
                            user.isSuspended
                              ? "text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
                              : "text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-100"
                          }`}
                          title={user.isSuspended ? "ปลดการระงับสิทธิ์" : "ระงับสิทธิ์การเบิก"}
                        >
                          {suspendingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isSuspended ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-8"></div> // Spacer for alignment
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 kanit-regular">
                    ไม่พบข้อมูลสมาชิกตามที่ค้นหา
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
