"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, ShieldCheck, Loader2, ImagePlus, Trash2, Ban } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ChatMessage, getChatMessages, sendMessage, deleteMessage, uploadChatImage, sendImageMessage } from "@/app/actions/chat";
import { toast } from "sonner";

export function FloatingChat() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = user?.publicMetadata?.role === "admin";

  //********************************//
  // Auto scroll to bottom (เลื่อนลงล่าง)
  //********************************//
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  //********************************//
  // Poll for messages (ดึงข้อความ)
  //********************************//
  useEffect(() => {
    if (!isOpen || !user || isAdmin) return;

    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        const msgs = await getChatMessages(user.id);
        if (isSubscribed) {
          if (JSON.stringify(msgs) !== JSON.stringify(messages)) {
             setMessages(msgs);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, user, isAdmin, messages]);

  //********************************//
  // ส่งข้อความ (Send Message)
  //********************************//
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      user_id: user.id,
      sender_id: user.id,
      sender_role: "user",
      content,
      image_url: null,
      is_deleted: false,
      created_at: new Date(),
      is_read: false
    }]);

    await sendMessage(user.id, content);
    setSending(false);
  };

  //********************************//
  // อัปโหลดและส่งรูปภาพ (Upload & Send Image)
  //********************************//
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadChatImage(formData);
      if (result.success && result.url) {
        await sendImageMessage(user.id, result.url);
        toast.success("ส่งรูปภาพสำเร็จ");
      } else {
        toast.error(result.error || "ส่งรูปภาพไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งรูปภาพ");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  //********************************//
  // ลบข้อความ (Delete Message)
  //********************************//
  const handleDelete = async (messageId: string) => {
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, is_deleted: true, content: "", image_url: null } : m
        ));
        toast.success("ลบข้อความสำเร็จ");
      }
    } catch {
      toast.error("ลบข้อความไม่สำเร็จ");
    }
  };

  if (!isLoaded || !user || isAdmin) {
    return null;
  }

  const unreadCount = messages.filter(m => m.sender_role === 'admin' && !m.is_read).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="kanit-medium text-base">ติดต่อเจ้าหน้าที่ / แอดมิน</h3>
                <p className="text-xs text-blue-100 kanit-regular">เราพร้อมช่วยเหลือคุณเสมอ</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 kanit-regular space-y-3">
                <MessageCircle className="w-12 h-12 opacity-20" />
                <p className="text-sm text-center">ยังไม่มีข้อความ<br/>พิมพ์ข้อความเพื่อเริ่มสนทนาได้เลยครับ</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_role === "user";
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                      {isMe ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      {msg.is_deleted ? (
                        <div className="rounded-2xl px-4 py-2 text-sm kanit-regular bg-slate-100 text-slate-400 italic border border-slate-200 flex items-center gap-1.5">
                          <Ban className="w-3 h-3" />
                          ข้อความถูกลบ
                        </div>
                      ) : (
                        <>
                          {msg.image_url && (
                            <img 
                              src={msg.image_url} 
                              alt="รูปภาพ" 
                              className="max-w-[200px] rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(msg.image_url)}
                            />
                          )}
                          {msg.content && (
                            <div className={`rounded-2xl px-4 py-2 text-sm kanit-regular ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                              {msg.content}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Delete button - only for own messages */}
                      {!msg.is_deleted && isMe && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] kanit-regular text-slate-400 hover:text-red-500 flex items-center gap-0.5 self-end cursor-pointer"
                          title="ลบข้อความ"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              {/* ปุ่มส่งรูปภาพ */}
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                title="ส่งรูปภาพ"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none kanit-regular text-sm transition-all"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] kanit-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
