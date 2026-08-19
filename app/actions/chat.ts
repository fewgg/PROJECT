"use server";

import postgres from "postgres";
import { auth, clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export type ChatMessage = {
  id: string;
  user_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  content: string;
  created_at: Date;
  is_read: boolean;
};

export type ChatThread = {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
};

// Send a message (works for both user and admin)
export async function sendMessage(chatUserId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role === "admin" ? "admin" : "user";
    
    // If a regular user is sending, they can only send to their own chat thread
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

// Get messages for a specific chat thread
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

    const messages = await sql<ChatMessage[]>`
      SELECT * FROM messages 
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

    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}

// Get list of all chat threads (Admin only)
export async function getAdminThreads(): Promise<ChatThread[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") return [];

    // Get latest message for each user and unread count
    const threads = await sql`
      SELECT 
        user_id,
        MAX(created_at) as last_message_time,
        (
          SELECT content FROM messages m2 
          WHERE m2.user_id = m1.user_id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        COUNT(CASE WHEN sender_role = 'user' AND is_read = FALSE THEN 1 END) as unread_count
      FROM messages m1
      GROUP BY user_id
      ORDER BY last_message_time DESC
    `;

    if (threads.length === 0) return [];

    // Fetch user names from Clerk
    const users = await client.users.getUserList({
      userId: threads.map(t => t.user_id)
    });

    return threads.map(t => {
      const u = users.data.find(user => user.id === t.user_id);
      return {
        user_id: t.user_id,
        user_name: u ? (u.fullName || u.primaryEmailAddress?.emailAddress || "Unknown") : "Unknown User",
        last_message: t.last_message,
        last_message_time: t.last_message_time,
        unread_count: parseInt(t.unread_count, 10)
      };
    });
  } catch (error) {
    console.error("Error getting admin threads:", error);
    return [];
  }
}
