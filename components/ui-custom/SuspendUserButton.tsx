"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { toggleUserSuspension } from "@/app/actions/user";
import { toast } from "sonner";

interface SuspendUserButtonProps {
  userId: string;
  isCurrentlySuspended: boolean;
}

export function SuspendUserButton({ userId, isCurrentlySuspended }: SuspendUserButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(isCurrentlySuspended);

  const handleToggle = async () => {
    setLoading(true);
    const res = await toggleUserSuspension(userId, !suspended);
    if (res.success) {
      setSuspended(!suspended);
      toast.success(!suspended ? "ระงับสิทธิ์การเบิกสำเร็จ" : "ปลดระงับสิทธิ์สำเร็จ");
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm kanit-medium transition-all cursor-pointer shadow-sm border ${
        suspended
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200"
          : "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-200"
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : suspended ? (
        <>
          <ShieldCheck className="w-4 h-4" /> ปลดระงับสิทธิ์การเบิก
        </>
      ) : (
        <>
          <ShieldAlert className="w-4 h-4" /> ระงับสิทธิ์การเบิก
        </>
      )}
    </button>
  );
}
