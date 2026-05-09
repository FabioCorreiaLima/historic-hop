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
import { AnimatePresence, motion } from "framer-motion";

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-6 h-16 md:h-20 flex items-center justify-center",
      isScrolled ? "bg-quiz-bg/90 backdrop-blur-xl border-b border-quiz-border" : "bg-transparent"
    )}>
      <div className="max-w-7xl w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-quiz-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-quiz-primary/20 group-hover:rotate-6 transition-transform">
            <History className="w-6 h-6 md:w-7 md:h-7 text-black" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase hidden sm:block text-quiz-text-main">
            Historic <span className="text-quiz-primary">Hop</span>
          </span>
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

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Menu (Desktop & Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl p-0 overflow-hidden border-2 border-quiz-border hover:border-quiz-primary transition-all">
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

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center bg-quiz-surface border border-quiz-border rounded-xl text-quiz-text-main active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 bg-quiz-bg border-b border-quiz-border md:hidden z-40 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <MobileNavLink to="/" active={location.pathname === "/"}>Mapa</MobileNavLink>
            <MobileNavLink to="/ranking" active={location.pathname === "/ranking"}>Ranking</MobileNavLink>
            <MobileNavLink to="/loja" active={location.pathname === "/loja"}>Loja</MobileNavLink>
            {profile?.is_admin && (
              <MobileNavLink to="/admin" active={location.pathname.startsWith("/admin")}>Admin</MobileNavLink>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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

function MobileNavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between",
        active 
          ? "bg-quiz-primary text-black" 
          : "bg-quiz-surface text-quiz-text-main"
      )}
    >
      {children}
      {active && <div className="w-2 h-2 rounded-full bg-black" />}
    </Link>
  );
}
