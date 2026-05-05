import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  History, 
  User as UserIcon, 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  Store, 
  Trophy 
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-6 h-16 flex items-center justify-center",
      isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-2" : "bg-transparent py-4"
    )}>
      <div className="max-w-7xl w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <History className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">Historic Hop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-border/20">
          <NavLink to="/" active={location.pathname === "/"}>Mapa</NavLink>
          <NavLink to="/ranking" active={location.pathname === "/ranking"}>Ranking</NavLink>
          <NavLink to="/loja" active={location.pathname === "/loja"}>Loja</NavLink>
          {profile?.is_admin && (
            <NavLink to="/admin" active={location.pathname.startsWith("/admin")}>Admin</NavLink>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border/50">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black">
                    {profile?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{profile?.display_name || "Viajante"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="flex items-center cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" /> Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/config" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-rose-500 focus:text-rose-500 cursor-pointer font-bold">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </Link>
  );
}
