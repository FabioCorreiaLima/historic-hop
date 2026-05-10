import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  History, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 flex items-center justify-center",
      "h-16 md:h-20 px-4 md:px-8 lg:px-12",
      isScrolled ? "bg-quiz-bg/95 backdrop-blur-md border-b border-quiz-border" : "bg-transparent"
    )}>
      <div className="max-w-7xl w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-quiz-primary rounded-lg md:rounded-xl flex items-center justify-center shadow-xl shadow-quiz-primary/20 group-hover:rotate-6 transition-transform">
            <History className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black" />
          </div>
          <span className="text-lg md:text-xl lg:text-2xl font-black tracking-tighter uppercase text-quiz-text-main">
            Historic <span className="text-quiz-primary">Hop</span>
          </span>
        </Link>

        {/* Desktop Nav - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-1 bg-quiz-surface/50 p-1 rounded-xl lg:rounded-2xl border border-quiz-border shadow-lg">
          <NavLink to="/" active={location.pathname === "/"}>Mapa</NavLink>
          <NavLink to="/ranking" active={location.pathname === "/ranking"}>Ranking</NavLink>
          <NavLink to="/loja" active={location.pathname === "/loja"}>Loja</NavLink>
          {profile?.is_admin && (
            <NavLink to="/admin" active={location.pathname.startsWith("/admin")}>Admin</NavLink>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Profile - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 md:h-11 md:w-11 lg:h-12 lg:w-12 rounded-lg md:rounded-xl p-0 overflow-hidden border border-quiz-border hover:border-quiz-primary transition-all">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-quiz-primary/10 text-quiz-primary font-black text-xs">
                    {profile?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 md:w-64 mt-2 md:mt-4 bg-quiz-surface border-quiz-border text-quiz-text-main rounded-xl md:rounded-2xl p-2" align="end">
              <DropdownMenuLabel className="font-normal p-3 md:p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm md:text-base font-black leading-none text-quiz-primary uppercase tracking-tight">{profile?.display_name || "Viajante"}</p>
                  <p className="text-[10px] md:text-xs leading-none text-quiz-text-muted font-medium truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-quiz-border" />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="flex items-center cursor-pointer p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-quiz-bg focus:bg-quiz-bg focus:text-quiz-primary text-xs md:text-sm">
                  <UserIcon className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" /> <span className="font-bold">Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/config" className="flex items-center cursor-pointer p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-quiz-bg focus:bg-quiz-bg focus:text-quiz-primary text-xs md:text-sm">
                  <Settings className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" /> <span className="font-bold">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-quiz-border" />
              <DropdownMenuItem onClick={signOut} className="text-quiz-wrong focus:text-quiz-wrong focus:bg-quiz-wrong/10 cursor-pointer font-black p-2 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm">
                <LogOut className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" /> SAIR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger Menu - Only on Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden w-9 h-9 items-center justify-center bg-quiz-surface border border-quiz-border rounded-lg text-quiz-text-main hover:border-quiz-primary transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Tailwind Only - Hidden on Desktop */}
      <div className={cn(
        "md:hidden fixed inset-x-0 top-16 bg-quiz-bg border-b border-quiz-border p-4 flex flex-col gap-2 transition-all duration-300 shadow-2xl z-40",
        isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <MobileNavLink to="/" active={location.pathname === "/"} onClick={() => setIsMobileMenuOpen(false)}>Mapa</MobileNavLink>
        <MobileNavLink to="/ranking" active={location.pathname === "/ranking"} onClick={() => setIsMobileMenuOpen(false)}>Ranking</MobileNavLink>
        <MobileNavLink to="/loja" active={location.pathname === "/loja"} onClick={() => setIsMobileMenuOpen(false)}>Loja</MobileNavLink>
        {profile?.is_admin && (
          <MobileNavLink to="/admin" active={location.pathname.startsWith("/admin")} onClick={() => setIsMobileMenuOpen(false)}>Admin</MobileNavLink>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-4 md:px-6 lg:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
        active 
          ? "bg-quiz-primary text-black shadow-lg shadow-quiz-primary/10" 
          : "text-quiz-text-muted hover:text-quiz-text-main hover:bg-quiz-bg"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, active, onClick }: { to: string; children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between",
        active 
          ? "bg-quiz-primary text-black" 
          : "bg-quiz-surface text-quiz-text-main border border-quiz-border/50"
      )}
    >
      {children}
      {active && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
    </Link>
  );
}
