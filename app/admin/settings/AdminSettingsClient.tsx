"use client";

import { useState } from "react";
import { Save, Bell, Shield, Mail, Loader2, Building } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsClient() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: "วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร",
    systemName: "ระบบบริหารคลังวัสดุ NMC",
    contactEmail: "admin@nmc.ac.th",
    notifyOnNewRequest: true,
    notifyOnLowStock: true,
    autoApproveSmallRequests: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // จำลองการบันทึกข้อมูล (Mockup)
    setTimeout(() => {
      setIsSaving(false);
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">การตั้งค่าระบบ</h1>
        <p className="text-slate-500 kanit-regular mt-1 text-sm">ตั้งค่าข้อมูลองค์กรและการแจ้งเตือนต่างๆ ของระบบ</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ข้อมูลองค์กร */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="kanit-semibold text-lg text-slate-800">ข้อมูลองค์กรและระบบ</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-2">ชื่อสถานศึกษา / องค์กร</label>
                <input 
                  type="text" 
                  value={settings.schoolName}
                  onChange={e => setSettings({...settings, schoolName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl kanit-regular focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-2">ชื่อระบบ</label>
                <input 
                  type="text" 
                  value={settings.systemName}
                  onChange={e => setSettings({...settings, systemName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl kanit-regular focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-2">อีเมลติดต่อสำหรับผู้ใช้งาน</label>
                <input 
                  type="email" 
                  value={settings.contactEmail}
                  onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl kanit-regular focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* การแจ้งเตือน */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="kanit-semibold text-lg text-slate-800">การแจ้งเตือน (Notifications)</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="kanit-medium text-slate-800">แจ้งเตือนเมื่อมีคำร้องใหม่</p>
                <p className="kanit-regular text-sm text-slate-500">รับอีเมลแจ้งเตือนเมื่อผู้ใช้งานส่งคำร้องขอเบิกวัสดุ</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifyOnNewRequest}
                onChange={e => setSettings({...settings, notifyOnNewRequest: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
              />
            </label>
            <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="kanit-medium text-slate-800">แจ้งเตือนวัสดุใกล้หมดสต๊อก</p>
                <p className="kanit-regular text-sm text-slate-500">ระบบจะแจ้งเตือนเมื่อวัสดุมีสถานะ "ใกล้หมด"</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifyOnLowStock}
                onChange={e => setSettings({...settings, notifyOnLowStock: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
              />
            </label>
          </div>
        </div>

        {/* ความปลอดภัย */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="kanit-semibold text-lg text-slate-800">ระบบการอนุมัติ</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="kanit-medium text-slate-800">อนุมัติคำร้องอัตโนมัติ (จำนวนน้อย)</p>
                <p className="kanit-regular text-sm text-slate-500">หากผู้ใช้งานขอเบิกวัสดุจำนวนไม่เกิน 1 ชิ้น จะทำการอนุมัติอัตโนมัติ</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.autoApproveSmallRequests}
                onChange={e => setSettings({...settings, autoApproveSmallRequests: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl kanit-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>
    </div>
  );
}
