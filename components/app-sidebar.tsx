import { Package, Inbox, Settings, LayoutDashboard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "แผงควบคุม", url: "/", icon: LayoutDashboard },
  { title: "คลังพัสดุ", url: "/inventory", icon: Package },
  { title: "คำร้องขอเบิก", url: "/requests", icon: Inbox },
  { title: "ตั้งค่าระบบ", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg kanit-bold tracking-tight text-primary mt-2 mb-4 px-4">
            ระบบคลังพัสดุ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={
                    <a href={item.url} className="kanit-medium text-muted-foreground hover:text-foreground">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                    </a>
                  } />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
