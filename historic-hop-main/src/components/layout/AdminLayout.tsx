import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Search, 
  User as UserIcon,
  ChevronRight,
  Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();

  // Simple breadcrumb logic
  const pathParts = location.pathname.split("/").filter(Boolean);
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background dark:bg-[#0a0a0c]">
        <Sidebar />
        
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-border/50 hidden md:block" />
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Início
                </Link>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-foreground font-bold">Admin</span>
                {tab && (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                    <span className="text-primary font-bold capitalize">{tab}</span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center relative">
                <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all focus:w-64"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-background" />
              </Button>

              <div className="flex items-center gap-3 pl-2 border-l border-border/50">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold leading-none">{profile?.display_name || "Admin"}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1">Super Usuário</p>
                </div>
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                    {profile?.display_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in-up">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
