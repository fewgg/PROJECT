import { clerkClient } from "@clerk/nextjs/server";
import { User, Mail, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await clerkClient();
    const user = await client.users.getUser(id);
    const role = user.publicMetadata?.role || "user";
    const department = user.publicMetadata?.department || "ไม่ระบุแผนก";

    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin/chat" className="text-blue-600 hover:underline kanit-regular text-sm">
            &larr; กลับไปหน้าแชท
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-12 border-4 border-white rounded-full bg-white shadow-sm overflow-hidden w-24 h-24">
              {user.hasImage ? (
                <img src={user.imageUrl} alt={user.firstName || "User"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="pt-16 flex justify-between items-start">
              <div>
                <h1 className="text-2xl kanit-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-slate-500 kanit-regular mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <div>
                <span className={`px-4 py-1.5 rounded-full text-sm kanit-medium flex items-center gap-2 ${role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                  {role === 'admin' && <ShieldCheck className="w-4 h-4" />}
                  {role === 'admin' ? 'แอดมิน' : 'ผู้ใช้งาน'}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 kanit-regular mb-1">แผนก</p>
                <p className="kanit-medium text-slate-800">{String(department)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 kanit-regular mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  วันที่สมัคร
                </p>
                <p className="kanit-medium text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl kanit-semibold text-slate-800">ไม่พบผู้ใช้งาน</h2>
        <p className="text-slate-500 mt-2">อาจเป็นผู้ใช้ที่ถูกลบไปแล้ว หรือรหัสไม่ถูกต้อง</p>
        <Link href="/admin/chat" className="text-blue-600 hover:underline mt-4 inline-block">กลับไปหน้าแชท</Link>
      </div>
    );
  }
}
