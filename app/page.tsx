import { HeroBanner } from "@/components/ui-custom/HeroBanner"
import { ProductGrid } from "@/components/ui-custom/ProductGrid"
import { StatCards } from "@/components/ui-custom/StatCards"
import { RecentActivity } from "@/components/ui-custom/RecentActivity"
import { getDashboardStats, getRecentActivities } from "./actions/stats"
import { getRecommendedMaterials } from "./actions/materials"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, activities, materials] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
    getRecommendedMaterials()
  ]);

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700 space-y-8 md:space-y-12 py-8 md:py-12 px-4 md:px-0">
      <HeroBanner />
      <ProductGrid materials={materials} />
      
      <div className="w-full mt-4 border-t border-slate-100 pt-8">
        <h2 className="text-2xl kanit-bold tracking-tight text-slate-900 mb-2">ภาพรวมระบบ</h2>
        <p className="kanit-regular text-slate-500 mb-6">ข้อมูลสถิติการใช้งานและวัสดุคงคลัง</p>
        <StatCards stats={stats} />
      </div>

      <div className="w-full mt-4">
        <RecentActivity activities={activities} />
      </div>
    </div>
  )
}
