import { UserProfile } from "@clerk/nextjs"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl kanit-bold tracking-tight text-primary flex items-center gap-2">
            <Settings className="h-8 w-8" />
            ตั้งค่าระบบ
          </h2>
          <p className="kanit-regular text-muted-foreground mt-1">จัดการบัญชีผู้ใช้และการตั้งค่าส่วนตัวของคุณ</p>
        </div>
      </div>

      <div className="flex justify-center bg-card border rounded-2xl p-8 shadow-sm">
        <UserProfile 
          appearance={{
            elements: {
              card: "shadow-none border-0",
              navbar: "hidden", // Simplify the UI for a cleaner look
              pageScrollBox: "p-0",
            }
          }}
        />
      </div>
    </div>
  )
}
