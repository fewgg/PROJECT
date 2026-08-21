"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { X, ZoomIn, Download, User } from "lucide-react";

//********************************//
// Component แสดงรูปโปรไฟล์ขนาดใหญ่ (Avatar Preview Lightbox Modal)
//********************************//
export function AvatarPreviewModal() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("");

  //********************************//
  // ดักจับการคลิกที่รูปโปรไฟล์ทุกจุดบนหน้าเว็บ
  //********************************//
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // ตรวจสอบว่าสิ่งที่กดคือรูปโปรไฟล์ (Clerk Avatar หรือ Custom Profile Avatar)
      const isClerkAvatar = 
        target.closest('.cl-avatarImage') || 
        target.closest('.cl-userPreviewAvatarImage') || 
        target.closest('.cl-userButtonAvatarBox') ||
        target.classList.contains('profile-avatar-clickable');

      if (isClerkAvatar) {
        e.preventDefault();
        e.stopPropagation();
        
        let imgUrl = user?.imageUrl;
        if (target instanceof HTMLImageElement && target.src) {
          imgUrl = target.src;
        } else {
          const imgInside = target.querySelector('img');
          if (imgInside && imgInside.src) {
            imgUrl = imgInside.src;
          }
        }

        if (imgUrl) {
          // ใช้ภาพความละเอียดสูงจาก Clerk (ถ้ามี)
          const highResUrl = imgUrl.replace(/\?.*$/, '') + '?height=500';
          setActiveImageUrl(highResUrl);
          setActiveTitle(user?.fullName || user?.username || "รูปโปรไฟล์");
          setIsOpen(true);
        }
      }
    };

    document.addEventListener('click', handleImageClick, true);
    return () => {
      document.removeEventListener('click', handleImageClick, true);
    };
  }, [user]);

  if (!isOpen || !activeImageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = activeImageUrl;
    link.download = `profile-picture.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col items-center p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด Modal */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors z-10 cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* หัวข้อชื่อเจ้าของโปรไฟล์ */}
        <div className="mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="kanit-semibold text-lg text-slate-800">{activeTitle}</h3>
            <p className="kanit-regular text-xs text-slate-400">รูปภาพโปรไฟล์ขนาดเต็ม</p>
          </div>
        </div>

        {/* กรอบแสดงรูปภาพขนาดใหญ่ */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center my-2 group">
          <img 
            src={activeImageUrl} 
            alt="Full Profile" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* แถบปุ่มเมนูจัดการรูปภาพ */}
        <div className="mt-6 flex items-center justify-center gap-3 w-full">
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl kanit-medium text-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลดรูปภาพ
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl kanit-medium text-sm transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
