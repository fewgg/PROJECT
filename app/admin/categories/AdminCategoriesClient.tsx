"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { Category, addCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { toast } from "sonner";

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingId(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setCategoryName(cat.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    setIsSubmitting(true);
    
    if (editingId) {
      const res = await updateCategory(editingId, categoryName.trim());
      if (res.success) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, name: categoryName.trim() } : c));
        toast.success("แก้ไขหมวดหมู่เรียบร้อย");
        setIsModalOpen(false);
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
    } else {
      const res = await addCategory(categoryName.trim());
      if (res.success) {
        toast.success("เพิ่มหมวดหมู่ใหม่เรียบร้อย");
        setIsModalOpen(false);
        window.location.reload(); // Refresh to get the new ID and updated list
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบหมวดหมู่นี้? (หากมีพัสดุในหมวดหมู่นี้ อาจทำให้ข้อมูลแสดงผลผิดพลาด)")) {
      const res = await deleteCategory(id);
      if (res.success) {
        setCategories(categories.filter(c => c.id !== id));
        toast.success("ลบหมวดหมู่เรียบร้อย");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + res.error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl kanit-bold text-slate-900 tracking-tight">จัดการหมวดหมู่</h1>
          <p className="text-slate-500 kanit-regular mt-1 text-sm">เพิ่ม ลบ แก้ไข หมวดหมู่พัสดุ</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white kanit-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium">ชื่อหมวดหมู่</th>
              <th className="px-6 py-4 kanit-medium text-sm text-slate-600 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 kanit-medium text-sm text-slate-800">
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-slate-500 kanit-regular">
                  ไม่มีหมวดหมู่
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl kanit-semibold text-slate-800">{editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm kanit-medium text-slate-700 mb-1">ชื่อหมวดหมู่</label>
                <input 
                  required 
                  type="text" 
                  value={categoryName} 
                  onChange={e => setCategoryName(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg kanit-regular text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                  placeholder="เช่น เครื่องเขียน, อุปกรณ์คอมพิวเตอร์"
                />
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
