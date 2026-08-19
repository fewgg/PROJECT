"use client"

import { Bell, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotifications, NotificationType } from "@/app/actions/notifications"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();
        const dismissed: string[] = JSON.parse(localStorage.getItem('dismissed_notifs') || '[]');
        setNotifications(data.filter(n => !dismissed.includes(n.id)));
      } catch (error) {
        console.error("Failed to load notifications", error)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        title="การแจ้งเตือน" 
        className="relative p-2.5 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 border border-transparent outline-none"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full animate-pulse bg-red-500"></span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[320px] p-2 kanit-regular rounded-2xl shadow-xl border-slate-100 mt-2 max-h-[400px] overflow-y-auto">
        <div className="kanit-semibold text-slate-900 px-3 py-2 text-base flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>การแจ้งเตือน</span>
            {notifications.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full kanit-medium">
                {notifications.length} ใหม่
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                const dismissed = JSON.parse(localStorage.getItem('dismissed_notifs') || '[]');
                const newDismissed = [...dismissed, ...notifications.map(n => n.id)];
                localStorage.setItem('dismissed_notifs', JSON.stringify(newDismissed));
                setNotifications([]);
              }}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline kanit-medium"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-100" />
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <span className="text-slate-400 text-sm">กำลังโหลด...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col gap-1 mt-1">
            {notifications.map((notif) => (
              <div key={notif.id} className="group relative flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <Link href={notif.link} className="flex gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 pr-6">
                    <p className="kanit-medium text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                  </div>
                </Link>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const dismissed = JSON.parse(localStorage.getItem('dismissed_notifs') || '[]');
                    localStorage.setItem('dismissed_notifs', JSON.stringify([...dismissed, notif.id]));
                    setNotifications(notifications.filter(n => n.id !== notif.id));
                  }}
                  className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="ลบการแจ้งเตือนนี้"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 text-sm kanit-regular space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
              <Bell className="w-6 h-6 text-slate-300" />
            </div>
            <p>ไม่มีการแจ้งเตือนใหม่ในขณะนี้</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
