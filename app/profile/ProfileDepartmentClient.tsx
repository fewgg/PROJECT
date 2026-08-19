"use client";

import { useState } from "react";
import { updateUserDepartment } from "@/app/actions/user";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const DEPARTMENTS = [
  "สาขาวิชาเครื่องกล",
  "สาขาวิชายานยนต์ไฟฟ้า",
  "สาขาวิชาช่างกลโรงงาน",
  "สาขาวิชาเทคนิคโลหะ",
  "สาขาวิชาก่อสร้าง-โยธา",
  "สาขาวิชาไฟฟ้ากำลัง",
  "สาขาวิชาอิเล็กทรอนิกส์/เทคนิคคอมพิวเตอร์",
  "สาขาวิชาการบัญชี",
  "สาขาวิชาคอมพิวเตอร์ธุรกิจ/เทคโนโลยีธุรกิจดิจิทัล",
  "สาขาวิชาการตลาด-โลจิสติกส์",
  "สาขาวิชาอาหารและโภชนาการ",
  "สาขาวิชาการโรงแรม",
  "สาขาวิชาเทคโนโลยีสารสนเทศ/คอมพิวเตอร์โปรแกรมเมอร์",
  "แผนกวิชาเทคนิคพื้นฐาน",
  "แผนกวิชาสามัญสัมพันธ์"
];

export default function ProfileDepartmentClient({ initialDepartment }: { initialDepartment: string }) {
  const [department, setDepartment] = useState(initialDepartment || DEPARTMENTS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (department === initialDepartment) {
      toast.info("ข้อมูลสาขาวิชาตรงกับข้อมูลเดิม");
      return;
    }
    
    setLoading(true);
    try {
      await updateUserDepartment(department);
      toast.success("อัปเดตสาขาวิชาเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="w-full space-y-2">
        <label className="kanit-medium text-slate-700 text-sm">สาขาวิชา / แผนก ปัจจุบัน</label>
        <div className="relative">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full appearance-none rounded-xl h-12 border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 kanit-regular text-base px-4 pr-10 outline-none transition-all"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || department === initialDepartment}
        className="shrink-0 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white kanit-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        บันทึกสาขา
      </button>
    </form>
  );
}
