"use client";

import { useEffect, useState } from "react";
import { getAdminThreads } from "@/app/actions/chat";

export function AdminChatBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isSubscribed = true;

    const fetchThreads = async () => {
      try {
        const threads = await getAdminThreads();
        if (isSubscribed) {
          const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0);
          setUnreadCount(totalUnread);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, 5000); // Poll every 5s
    
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="bg-red-500 text-white text-[10px] kanit-bold px-2 py-0.5 rounded-full shrink-0 ml-auto">
      {unreadCount}
    </span>
  );
}
