"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Camera, Loader2, X, Check } from "lucide-react";
import getCroppedImg from "@/lib/cropImage";

export function ProfileImageUpload() {
  const { user, isLoaded } = useUser();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number } | null) => {
    setCroppedAreaPixels(croppedAreaPixels as any);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    setIsUploading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (!croppedImage) throw new Error("Failed to crop image");

      const file = new File([croppedImage], "profile.jpg", { type: "image/jpeg" });
      await user.setProfileImage({ file });
      
      toast.success("อัปเดตรูปโปรไฟล์สำเร็จ!");
      setImageSrc(null); // close modal
    } catch (e) {
      console.error(e);
      toast.error("อัปเดตรูปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <>
      <div className="flex flex-col items-center sm:flex-row gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
            {user.hasImage ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl kanit-bold">
                {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors cursor-pointer border-2 border-white"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center sm:text-left flex-1">
          <h3 className="kanit-medium text-lg text-slate-800">รูปภาพโปรไฟล์</h3>
          <p className="text-sm text-slate-500 kanit-regular mt-1">อัปโหลดรูปภาพใหม่เพื่อเปลี่ยนรูปโปรไฟล์ของคุณ (รองรับ JPG, PNG)</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 kanit-medium text-sm rounded-xl transition-colors"
          >
            เลือกรูปภาพใหม่
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      </div>

      {/* Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h3 className="kanit-semibold text-lg text-slate-800">ปรับแต่งรูปโปรไฟล์</h3>
              <button 
                onClick={() => setImageSrc(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative w-full h-[300px] sm:h-[400px] bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 sm:p-6 bg-white z-10 space-y-4">
              <div>
                <label className="text-xs kanit-medium text-slate-500 block mb-2">ปรับขนาด (ซูม)</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setImageSrc(null)}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl kanit-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl kanit-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก</>
                  ) : (
                    <><Check className="w-4 h-4" /> บันทึกรูปโปรไฟล์</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
