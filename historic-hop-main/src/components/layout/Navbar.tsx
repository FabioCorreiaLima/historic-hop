import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  History, 
  User as UserIcon, 
  Settings, 
  LogOut, 
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
      "fixed top-0 w-full z-50 transition-all duration-500 px-6 h-20 flex items-center justify-center",
      isScrolled ? "bg-quiz-bg/90 backdrop-blur-xl border-b border-quiz-border py-2" : "bg-transparent py-4"
    )}>
      <div className="max-w-7xl w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-quiz-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-quiz-primary/20 group-hover:rotate-6 transition-transform">
            <History className="w-7 h-7 text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase hidden sm:block text-quiz-text-main">Historic <span className="text-quiz-primary">Hop</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-quiz-surface/50 p-1.5 rounded-2xl border border-quiz-border shadow-2xl">
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
              <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0 overflow-hidden border-2 border-quiz-border hover:border-quiz-primary transition-all">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-quiz-primary/10 text-quiz-primary font-black">
                    {profile?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-4 bg-quiz-surface border-quiz-border text-quiz-text-main rounded-2xl p-2" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-lg font-black leading-none text-quiz-primary uppercase tracking-tight">{profile?.display_name || "Viajante"}</p>
                  <p className="text-xs leading-none text-quiz-text-muted font-medium">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-quiz-border" />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="flex items-center cursor-pointer p-3 rounded-xl hover:bg-quiz-bg focus:bg-quiz-bg focus:text-quiz-primary">
                  <UserIcon className="mr-3 h-5 w-5" /> <span className="font-bold">Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/config" className="flex items-center cursor-pointer p-3 rounded-xl hover:bg-quiz-bg focus:bg-quiz-bg focus:text-quiz-primary">
                  <Settings className="mr-3 h-5 w-5" /> <span className="font-bold">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-quiz-border" />
              <DropdownMenuItem onClick={signOut} className="text-quiz-wrong focus:text-quiz-wrong focus:bg-quiz-wrong/10 cursor-pointer font-black p-3 rounded-xl">
                <LogOut className="mr-3 h-5 w-5" /> SAIR
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
        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
        active 
          ? "bg-quiz-primary text-black shadow-xl shadow-quiz-primary/10" 
          : "text-quiz-text-muted hover:text-quiz-text-main hover:bg-quiz-bg"
      )}
    >
      {children}
    </Link>
  );
}
