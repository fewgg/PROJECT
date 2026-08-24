"use server";

import postgres from "postgres";
import { auth, clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

//********************************//
// ประเภทข้อมูลข้อความแชท (Chat Message Type)
//********************************//
export type ChatMessage = {
  id: string;
  user_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  content: string;
  image_url: string | null;
  is_deleted: boolean;
  created_at: Date;
  is_read: boolean;
  sender_image_url?: string;
};

//********************************//
// ประเภทข้อมูลรายการสนทนา (Chat Thread Type)
//********************************//
export type ChatThread = {
  user_id: string;
  user_name: string;
  user_image_url: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
};

//********************************//
// ส่งข้อความ (Send Text Message)
//********************************//
export async function sendMessage(chatUserId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role === "admin" ? "admin" : "user";
    
    if (role === "user" && chatUserId !== userId) {
      throw new Error("Unauthorized");
    }

    await sql`
      INSERT INTO messages (user_id, sender_id, sender_role, content)
      VALUES (${chatUserId}, ${userId}, ${role}, ${content})
    `;
    
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

//********************************//
// ส่งข้อความพร้อมรูปภาพ (Send Image Message)
//********************************//
export async function sendImageMessage(chatUserId: string, imageUrl: string, caption?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role === "admin" ? "admin" : "user";
    
    if (role === "user" && chatUserId !== userId) {
      throw new Error("Unauthorized");
    }

    await sql`
      INSERT INTO messages (user_id, sender_id, sender_role, content, image_url)
      VALUES (${chatUserId}, ${userId}, ${role}, ${caption || ''}, ${imageUrl})
    `;
    
    return { success: true };
  } catch (error) {
    console.error("Error sending image message:", error);
    return { success: false, error: "Failed to send image" };
  }
}

//********************************//
// ลบข้อความ (Delete Message - Soft Delete)
//********************************//
export async function deleteMessage(messageId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role === "admin" ? "admin" : "user";

    if (role === "admin") {
      // Admin can delete any message
      await sql`UPDATE messages SET is_deleted = TRUE, content = '', image_url = NULL WHERE id = ${messageId}`;
    } else {
      // User can only delete their own messages
      await sql`UPDATE messages SET is_deleted = TRUE, content = '', image_url = NULL WHERE id = ${messageId} AND sender_id = ${userId}`;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

//********************************//
// ดึงข้อความในห้องแชท (Get Chat Messages)
//********************************//
export async function getChatMessages(chatUserId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role === "admin" ? "admin" : "user";
    
    if (role === "user" && chatUserId !== userId) {
      return [];
    }

    const messages = await sql`
      SELECT id, user_id, sender_id, sender_role, content, image_url, is_deleted, created_at, is_read
      FROM messages 
      WHERE user_id = ${chatUserId} 
      ORDER BY created_at ASC
    `;
    
    // Mark messages as read based on who is viewing
    if (messages.length > 0) {
      const targetRoleToMarkRead = role === "admin" ? "user" : "admin";
      await sql`
        UPDATE messages 
        SET is_read = TRUE 
        WHERE user_id = ${chatUserId} 
          AND sender_role = ${targetRoleToMarkRead}
          AND is_read = FALSE
      `;
    }

    // Get sender image URLs for user messages (not admin)
    let senderImageUrl = "";
    if (role === "admin") {
      try {
        const chatUser = await client.users.getUser(chatUserId);
        senderImageUrl = chatUser.imageUrl || "";
      } catch { /* ignore */ }
    }

    return messages.map((m: Record<string, unknown>) => ({
      id: String(m.id),
      user_id: String(m.user_id),
      sender_id: String(m.sender_id),
      sender_role: String(m.sender_role) as "user" | "admin",
      content: String(m.content || ""),
      image_url: m.image_url ? String(m.image_url) : null,
      is_deleted: Boolean(m.is_deleted),
      created_at: m.created_at as Date,
      is_read: Boolean(m.is_read),
      sender_image_url: String(m.sender_role) === "user" ? senderImageUrl : undefined,
    }));
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}

//********************************//
// ดึงรายการสนทนาทั้งหมด (Get Admin Threads)
//********************************//
export async function getAdminThreads(): Promise<ChatThread[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") return [];

    const threads = await sql`
      SELECT 
        user_id,
        MAX(created_at) as last_message_time,
        (
          SELECT content FROM messages m2 
          WHERE m2.user_id = m1.user_id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT is_deleted FROM messages m3 
          WHERE m3.user_id = m1.user_id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_is_deleted,
        COUNT(CASE WHEN sender_role = 'user' AND is_read = FALSE THEN 1 END) as unread_count
      FROM messages m1
      GROUP BY user_id
      ORDER BY last_message_time DESC
    `;

    if (threads.length === 0) return [];

    const users = await client.users.getUserList({
      userId: threads.map((t: Record<string, unknown>) => String(t.user_id))
    });

    return threads.map((t: Record<string, unknown>) => {
      const u = users.data.find(user => user.id === t.user_id);
      const isDeleted = Boolean(t.last_is_deleted);
      return {
        user_id: String(t.user_id),
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User",
        user_image_url: u?.imageUrl || "",
        last_message: isDeleted ? "ข้อความถูกลบ" : String(t.last_message || ""),
        last_message_time: t.last_message_time as Date,
        unread_count: parseInt(String(t.unread_count), 10)
      };
    });
  } catch (error) {
    console.error("Error getting admin threads:", error);
    return [];
  }
}

//********************************//
// อัปโหลดรูปภาพแชท (Upload Chat Image)
//********************************//
export async function uploadChatImage(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "ไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WEBP, GIF" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" };
    }

    // Upload via Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const filename = `chat/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("materials")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: "อัปโหลดรูปภาพไม่สำเร็จ" };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("materials")
      .getPublicUrl(filename);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload chat image error:", error);
    return { success: false, error: "อัปโหลดรูปภาพไม่สำเร็จ" };
  }
}
