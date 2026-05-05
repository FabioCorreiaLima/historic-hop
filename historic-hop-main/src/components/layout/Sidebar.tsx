import { 
  LayoutDashboard, 
  History, 
  Gamepad2, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  BookOpen
} from "lucide-react";
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Períodos", icon: History, path: "/admin?tab=periods" },
  { title: "Atividades", icon: Gamepad2, path: "/admin?tab=questions" },
  { title: "Usuários", icon: Users, path: "/admin?tab=users" },
  { title: "Relatórios", icon: BarChart3, path: "/admin?tab=reports" },
  { title: "Configurações", icon: Settings, path: "/admin?tab=settings" },
];

export function Sidebar() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <ShadcnSidebar className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 group/logo">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover/logo:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">HISTORIC</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Admin Pro</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent className="px-3 pt-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname + location.search === item.path || 
                               (item.path === "/admin" && location.pathname === "/admin" && !location.search);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "py-6 px-4 rounded-xl transition-all duration-200",
                        isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Link to={item.path} onClick={() => setOpenMobile(false)}>
                        <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span className="font-bold text-sm tracking-tight">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Status do Sistema</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">Online & Estável</span>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
