"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChatThread, ChatMessage, getAdminThreads, getChatMessages, sendMessage, deleteMessage, uploadChatImage, sendImageMessage } from "@/app/actions/chat";
import { MessageCircle, Send, User, ShieldCheck, Loader2, Search, ImagePlus, Trash2, X, Ban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  //********************************//
  // Poll threads (ดึงรายการสนทนา)
  //********************************//
  useEffect(() => {
    let isSubscribed = true;
    const fetchThreads = async () => {
      try {
        const data = await getAdminThreads();
        if (isSubscribed) {
          setThreads(data);
          setLoadingThreads(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  //********************************//
  // Poll messages (ดึงข้อความในห้องแชท)
  //********************************//
  useEffect(() => {
    if (!selectedUserId) return;
    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(selectedUserId);
        if (isSubscribed) {
          setMessages((prev) => {
             if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
             return prev;
          });
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
  }, [selectedUserId]);

  //********************************//
  // Scroll to bottom (เลื่อนลงล่าง)
  //********************************//
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //********************************//
  // ส่งข้อความ (Send Message)
  //********************************//
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      user_id: selectedUserId,
      sender_id: "admin",
      sender_role: "admin",
      content,
      image_url: null,
      is_deleted: false,
      created_at: new Date(),
      is_read: false
    }]);

    await sendMessage(selectedUserId, content);
    setSending(false);
  };

  //********************************//
  // อัปโหลดและส่งรูปภาพ (Upload & Send Image)
  //********************************//
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedUserId) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadChatImage(formData);
      if (result.success && result.url) {
        await sendImageMessage(selectedUserId, result.url);
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

  //********************************//
  // กรองรายการสนทนาตามชื่อ (Filter Threads)
  //********************************//
  const filteredThreads = threads.filter(t => 
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //********************************//
  // หา thread ที่เลือกอยู่ (Selected Thread)
  //********************************//
  const selectedThread = threads.find(t => t.user_id === selectedUserId);

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex overflow-hidden">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="kanit-semibold text-lg text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            ข้อความจากผู้ใช้
          </h2>
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้ใช้..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm kanit-regular focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-8 text-center text-slate-400 kanit-regular text-sm flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังโหลดข้อมูล...
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 kanit-regular text-sm">
              ไม่มีการสนทนา
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div 
                key={thread.user_id}
                onClick={() => setSelectedUserId(thread.user_id)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedUserId === thread.user_id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  {/* รูปโปรไฟล์ผู้ใช้ใน Sidebar */}
                  {thread.user_image_url ? (
                    <img src={thread.user_image_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="kanit-medium text-sm text-slate-900 truncate pr-2">{thread.user_name}</h3>
                      <span className="text-[10px] kanit-regular text-slate-400 shrink-0">
                        {formatDistanceToNow(new Date(thread.last_message_time), { addSuffix: true, locale: th })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs kanit-regular truncate ${thread.last_message === "ข้อความถูกลบ" ? "text-slate-400 italic" : "text-slate-500"}`}>
                        {thread.last_message || "ไม่มีข้อความ"}
                      </p>
                      {thread.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[10px] kanit-bold px-2 py-0.5 rounded-full shrink-0">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center shrink-0">
              <div className="flex items-center gap-3">
                <Link href={`/admin/users/${selectedUserId}`}>
                  {selectedThread?.user_image_url ? (
                    <img src={selectedThread.user_image_url} alt="" className="w-10 h-10 rounded-full object-cover hover:scale-105 transition-all cursor-pointer border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 hover:scale-105 transition-all cursor-pointer">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </Link>
                <div>
                  <h3 className="kanit-medium text-slate-900">
                    <Link href={`/admin/users/${selectedUserId}`} className="hover:text-blue-600 transition-colors">
                      {selectedThread?.user_name}
                    </Link>
                  </h3>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isAdmin = msg.sender_role === "admin";
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'} group`}>
                    {/* Avatar */}
                    {isAdmin ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-slate-800 text-white">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    ) : (
                      <Link href={`/admin/users/${selectedUserId}`}>
                        {msg.sender_image_url ? (
                          <img src={msg.sender_image_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 hover:scale-105 transition-all cursor-pointer border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 transition-all cursor-pointer">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </Link>
                    )}
                    
                    {/* Message Bubble */}
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      {msg.is_deleted ? (
                        <div className="rounded-2xl px-4 py-2.5 text-sm kanit-regular bg-slate-100 text-slate-400 italic border border-slate-200 flex items-center gap-2">
                          <Ban className="w-3.5 h-3.5" />
                          ข้อความถูกลบ
                        </div>
                      ) : (
                        <>
                          {msg.image_url && (
                            <img 
                              src={msg.image_url} 
                              alt="รูปภาพ" 
                              className="max-w-[280px] rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(msg.image_url)}
                            />
                          )}
                          {msg.content && (
                            <div className={`rounded-2xl px-4 py-2.5 text-sm kanit-regular ${isAdmin ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                              {msg.content}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Delete Button */}
                      {!msg.is_deleted && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs kanit-regular text-slate-400 hover:text-red-500 flex items-center gap-1 mt-0.5 cursor-pointer ${isAdmin ? 'self-end' : 'self-start'}`}
                          title="ลบข้อความ"
                        >
                          <Trash2 className="w-3 h-3" />
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSend} className="flex gap-3 items-center">
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
                  className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  title="ส่งรูปภาพ"
                >
                  {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none kanit-regular text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="h-12 px-6 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors kanit-medium text-sm"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  ส่งข้อความ
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="w-16 h-16 opacity-20 mb-4" />
            <h3 className="kanit-medium text-lg text-slate-600">ยังไม่ได้เลือกการสนทนา</h3>
            <p className="kanit-regular text-sm">คลิกที่รายชื่อผู้ใช้ด้านซ้ายเพื่อเปิดดูข้อความ</p>
          </div>
        )}
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
