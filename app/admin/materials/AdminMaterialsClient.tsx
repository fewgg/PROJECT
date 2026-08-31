//********************************//
// หน้าจัดการพัสดุ (Admin Materials Client)
//********************************//
"use client";

import { useState } from "react";
import { Search, Plus, Edit2, Trash2, X, Loader2, Download } from "lucide-react";
import { Material, addMaterial, updateMaterial, deleteMaterial } from "@/app/actions/materials";
import { Category } from "@/app/actions/categories";
import { toast } from "sonner";

//********************************//
// หมวดหมู่พัสดุเริ่มต้น
//********************************//
const DEFAULT_CATEGORIES = ["พัสดุคอมพิวเตอร์และไอที", "พัสดุสำนักงาน", "พัสดุช่างและอุปกรณ์ทั่วไป", "พัสดุทำความสะอาด"];

export default function AdminMaterialsClient({ 
  initialData, 
  categories = [] 
}: { 
  initialData: Material[]; 
  categories?: Category[]; 
}) {
  //********************************//
  // State ข้อมูลและการทำงาน
  //********************************//
  const [materials, setMaterials] = useState<Material[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  //********************************//
  // ดึงรายการหมวดหมู่ทั้งหมดสำหรับให้เลือก (ดึงจากตารางหมวดหมู่โดยตรง เพื่อไม่ให้หมวดหมู่ที่ถูกลบไปแล้วแสดงขึ้นมา)
  //********************************//
  const availableCategories = categories.map(c => c.name);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    name: "", image: "", quantity: 0, status: "AVAILABLE", unit: "", category: availableCategories[0] || "พัสดุคอมพิวเตอร์และไอที", requires_return: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //********************************//
  // กรองรายการพัสดุตามคำค้นหา
  //********************************//
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  //********************************//
  // เปิด Modal เพิ่มพัสดุใหม่
  //********************************//
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", image: "", quantity: 0, status: "AVAILABLE", unit: "", category: availableCategories[0] || "พัสดุคอมพิวเตอร์และไอที", requires_return: true });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  //********************************//
  // เปิด Modal แก้ไขพัสดุ
  //********************************//
  const openEditModal = (item: Material) => {
    setEditingId(item.id);
    setFormData({
      ...item,
      requires_return: item.requires_return !== false
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  //********************************//
  // บันทึกข้อมูลเพิ่ม/แก้ไขพัสดุ
  //********************************//
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let imageUrl = formData.image;
    
    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData
        });
        
        if (uploadRes.ok) {
          const result = await uploadRes.json();
          imageUrl = result.url;
        } else {
          toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setIsSubmitting(false);
        return;
      }
    }
    
    const finalFormData = { ...formData, image: imageUrl };
    
    if (editingId) {
      const res = await updateMaterial(editingId, finalFormData);
      if (res.success) {
        setMaterials(materials.map(m => m.id === editingId ? { ...m, ...finalFormData } as Material : m));
        toast.success("แก้ไขพัสดุสำเร็จ");
        setIsModalOpen(false);
      } else {
        toast.error("เกิดข้อผิดพลาดในการแก้ไข");
      }
    } else {
      const res = await addMaterial(finalFormData as Omit<Material, "id">);
      if (res.success) {
        // Optimistic refresh (in real app, server action revalidatePath will fetch updated data on next load)
        toast.success("เพิ่มพัสดุใหม่สำเร็จ");
        setIsModalOpen(false);
        // Soft reload to get new ID from server
        window.location.reload();
      } else {
        toast.error("เกิดข้อผิดพลาดในการเพิ่ม");
      }
    }
    
    setIsSubmitting(false);
  };

  //********************************//
  // ลบพัสดุ
  //********************************//
  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบพัสดุรายการนี้?")) {
      const res = await deleteMaterial(id);
      if (res.success) {
        setMaterials(materials.filter(m => m.id !== id));
        toast.success("ลบพัสดุสำเร็จ");
      } else {
        toast.error("ลบไม่สำเร็จ");
      }
    }
  };

  //********************************//
  // ส่งออกข้อมูลพัสดุเป็นไฟล์ CSV
  //********************************//
  const exportToCSV = () => {
    if (filteredMaterials.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    
    const headers = ["รหัสพัสดุ", "ชื่อพัสดุ", "หมวดหมู่", "จำนวนคงเหลือ", "หน่วย", "สถานะ"];
    
    const csvRows = filteredMaterials.map(item => [
      item.id,
      `"${item.name || ''}"`,
      `"${item.category || ''}"`,
      item.quantity,
      `"${item.unit || ''}"`,
      item.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvRows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `materials_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("ดาวน์โหลดไฟล์ CSV เรียบร้อย");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ******************************** */}
      {/* ส่วนหัวและการจัดการ (Header Actions) */}
      {/* ******************************** */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">จัดการพัสดุ</h1>
          <p className="text-slate-500 kanit-regular mt-1 text-sm">เพิ่ม ลบ แก้ไข ข้อมูลพัสดุในคลัง (เชื่อมต่อฐานข้อมูลแล้ว)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl kanit-medium text-sm transition-colors border border-blue-100 shadow-sm"
          >
            <Download className="w-4 h-4" />
            ส่งออก (CSV)
          </button>
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white kanit-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> เพิ่มพัสดุใหม่
          </button>
        </div>
      </div>

      {/* ******************************** */}
      {/* ตารางแสดงรายการพัสดุทั้งหมด       */}
      {/* ******************************** */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อพัสดุ หรือ หมวดหมู่..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg kanit-regular text-sm transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รูปภาพ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">รหัส/ชื่อพัสดุ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">หมวดหมู่</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">คงเหลือ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">สถานะ</th>
                <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="kanit-medium text-sm text-slate-800">{item.name}</p>
                    <div className="flex gap-1.5 mt-1 items-center">
                      <span className="kanit-regular text-[11px] text-slate-500">ID: {item.id}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium kanit-medium ${
                        item.requires_return 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {item.requires_return ? 'ทรัพย์สินคงทนถาวร' : 'สิ้นเปลือง/คงทนอายุสั้น'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 kanit-regular">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 kanit-regular text-sm text-slate-700">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium kanit-regular ${
                      item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status === 'AVAILABLE' ? 'มีพัสดุ' :
                       item.status === 'LOW_STOCK' ? 'ใกล้หมด' : 'หมด'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 kanit-regular">
                    ไม่พบรายการพัสดุที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ******************************** */}
      {/* Modal เพิ่ม / แก้ไขพัสดุ (Add/Edit Modal) */}
      {/* ******************************** */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl kanit-semibold text-slate-800">{editingId ? "แก้ไขพัสดุ" : "เพิ่มพัสดุใหม่"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-1">ชื่อพัสดุ</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm kanit-medium text-slate-700 mb-1">หมวดหมู่</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    {availableCategories.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm kanit-medium text-slate-700 mb-1">สถานะ</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="AVAILABLE">มีพัสดุ</option>
                    <option value="LOW_STOCK">ใกล้หมด</option>
                    <option value="OUT_OF_STOCK">หมด</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm kanit-medium text-slate-700 mb-1">จำนวนคงเหลือ</label>
                  <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm kanit-medium text-slate-700 mb-1">หน่วยนับ</label>
                  <input required type="text" placeholder="เช่น อัน, ชิ้น, รีม" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-1">อัปโหลดรูปภาพ</label>
                <div className="flex items-center gap-4 mt-2">
                  {(selectedFile || formData.image) && (
                    <img 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:kanit-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl kanit-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl kanit-medium text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
