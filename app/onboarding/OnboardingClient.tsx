"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions/user";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface OnboardingProps {
  initialDepartment: string;
  initialFirstName: string;
  initialLastName: string;
}

export default function OnboardingClient({ initialDepartment, initialFirstName, initialLastName }: OnboardingProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [department, setDepartment] = useState(initialDepartment || DEPARTMENTS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("กรุณากรอกชื่อและนามสกุลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    
    try {
      const res = await updateUserProfile(firstName.trim(), lastName.trim(), department);
      if (res.success) {
        toast.success("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
        router.push("/");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 text-white">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl kanit-bold text-white tracking-wide">ข้อมูลผู้ใช้งาน</h1>
          <p className="text-blue-100 kanit-regular text-sm mt-2 opacity-90">
            โปรดระบุชื่อและแผนกของคุณเพื่อความถูกต้องในการทำรายการต่างๆ
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="space-y-2">
          <label className="kanit-medium text-slate-700 text-sm">ชื่อ (First Name)</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="กรอกชื่อของคุณ"
            className="w-full rounded-xl h-12 border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 kanit-regular text-base px-4 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="kanit-medium text-slate-700 text-sm">นามสกุล (Last Name)</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="กรอกนามสกุลของคุณ"
            className="w-full rounded-xl h-12 border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 kanit-regular text-base px-4 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="kanit-medium text-slate-700 text-sm">สาขาวิชา / แผนก</label>
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
          disabled={loading || !firstName.trim() || !lastName.trim()}
          className="w-full h-12 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white kanit-medium text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <span>บันทึกข้อมูลและเข้าสู่ระบบ</span>
          )}
        </button>
      </form>
    </div>
  );
}
