import { HeroBanner } from "@/components/ui-custom/HeroBanner"
import { ProductGrid } from "@/components/ui-custom/ProductGrid"
import { StatCards } from "@/components/ui-custom/StatCards"
import { RecentActivity } from "@/components/ui-custom/RecentActivity"
import { getDashboardStats, getRecentActivities } from "./actions/stats"
import { getRecommendedMaterials } from "./actions/materials"
import { checkOnboarding } from "@/lib/checkAuth"
import { getSystemSettings } from "@/app/actions/settings"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await checkOnboarding();
  const user = await currentUser();
  if (user?.publicMetadata?.role === "admin") {
    redirect("/admin");
  }
  const [stats, activities, materials, settings] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
    getRecommendedMaterials(),
    getSystemSettings()
  ]);

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700 space-y-8 md:space-y-12 py-8 md:py-12 px-4 md:px-0">
      <HeroBanner 
        systemName={settings.systemName} 
        schoolName={settings.schoolName} 
      />
      <ProductGrid materials={materials} />
      
      <div className="w-full mt-4 border-t border-slate-100 pt-8">
        <h2 className="text-2xl kanit-bold tracking-tight text-slate-900 mb-2">ภาพรวมระบบ</h2>
        <p className="kanit-regular text-slate-500 mb-6">ข้อมูลสถิติการใช้งานและพัสดุคงคลัง</p>
        <StatCards stats={stats} />
      </div>

      <div className="w-full mt-4">
        <RecentActivity activities={activities} />
      </div>
    </div>
  )
}
