import Link from "next/link";
import { LayoutDashboard, Package, ListTree, ClipboardCheck, ArrowDownToLine, Settings } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  
  if (role !== "admin") {
    redirect("/");
  }

  const navItems = [
    { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
    { name: "จัดการวัสดุ", href: "/admin/materials", icon: Package },
    { name: "จัดการหมวดหมู่", href: "/admin/categories", icon: ListTree },
    { name: "อนุมัติเบิกวัสดุ", href: "/admin/requests", icon: ClipboardCheck },
    { name: "รับของเข้าคลัง", href: "/admin/stock-in", icon: ArrowDownToLine },
  ];

  return (
    <div className="flex w-full h-[calc(100vh-72px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl kanit-bold text-slate-800">Admin Panel</h2>
          <p className="text-sm kanit-regular text-slate-500">ระบบจัดการหลังบ้าน</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl kanit-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <item.icon className="w-5 h-5" />
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link href="/admin/settings">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl kanit-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings className="w-5 h-5" />
              การตั้งค่า
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc] p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
