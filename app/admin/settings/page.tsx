import AdminSettingsClient from "./AdminSettingsClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSystemSettings } from "@/app/actions/settings";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  const initialSettings = await getSystemSettings();

  return <AdminSettingsClient key={JSON.stringify(initialSettings)} initialSettings={initialSettings} />;
}
