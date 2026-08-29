"use server";

import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

export type SystemSettings = {
  schoolName: string;
  systemName: string;
  contactEmail: string;
  notifyOnNewRequest: boolean;
  notifyOnLowStock: boolean;
  autoApproveSmallRequests: boolean;
};

const defaultSettings: SystemSettings = {
  schoolName: "วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร",
  systemName: "ระบบบริหารคลังพัสดุ ",
  contactEmail: "admin@.ac.th",
  notifyOnNewRequest: true,
  notifyOnLowStock: true,
  autoApproveSmallRequests: false,
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const rows = await sql`SELECT key, value FROM system_settings`;
    const settings = { ...defaultSettings };
    
    for (const row of rows) {
      if (row.key in settings) {
        let val = row.value;
        if (typeof defaultSettings[row.key as keyof SystemSettings] === "boolean") {
          val = val === true || val === "true";
        }
        // @ts-ignore
        settings[row.key] = val;
      }
    }
    
    return settings;
  } catch (error) {
    console.error("Error getting system settings:", error);
    return defaultSettings;
  }
}

export async function updateSystemSettings(settings: SystemSettings) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await sql.begin(async (sql) => {
      for (const [key, value] of Object.entries(settings)) {
        await sql`
          INSERT INTO system_settings (key, value, updated_at)
          VALUES (${key}, ${sql.json(value)}, CURRENT_TIMESTAMP)
          ON CONFLICT (key)
          DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        `;
      }
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating system settings:", error);
    return { success: false, error: "Failed to update system settings" };
  }
}