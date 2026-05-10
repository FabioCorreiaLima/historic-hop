import { useState } from "react";
import { 
  Lock, 
  Star, 
  Trophy, 
  LogOut, 
  Settings, 
  Award, 
  ShoppingBag, 
  Zap, 
  Map as MapIcon,
  Crown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { getLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  totalStars: number;
  streakCount: number;
  onOpenStore: () => void;
}

export const Sidebar = ({ totalStars, streakCount, onOpenStore }: SidebarProps) => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const level = getLevel(profile?.total_score || 0);

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 xl:w-80 h-screen sticky top-0 bg-quiz-surface border-r border-quiz-border p-6 xl:p-8 gap-8 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-quiz-primary rounded-2xl flex items-center justify-center text-black shadow-xl shadow-quiz-primary/20">
          <MapIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-quiz-text-main tracking-tighter uppercase">Historic <span className="text-quiz-primary">Hop</span></h1>
          <p className="text-[10px] font-black text-quiz-text-muted uppercase tracking-[0.2em] mt-1">Timeline Explorer</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-quiz-bg border border-quiz-border rounded-3xl p-5 shadow-inner">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 rounded-xl bg-quiz-primary flex items-center justify-center text-black font-black text-lg">
             {profile?.display_name?.charAt(0) || "U"}
           </div>
           <div className="min-w-0">
              <p className="text-sm font-black text-quiz-text-main truncate uppercase tracking-tight">{profile?.display_name || "Explorador"}</p>
              <p className="text-[10px] font-bold text-quiz-primary uppercase tracking-widest">{level.title}</p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-quiz-surface p-3 rounded-xl border border-quiz-border flex flex-col items-center">
              <p className="text-[9px] font-black text-quiz-text-muted uppercase mb-1">Estrelas</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-quiz-primary fill-quiz-primary" />
                <span className="text-sm font-black">{totalStars}</span>
              </div>
           </div>
           <div className="bg-quiz-surface p-3 rounded-xl border border-quiz-border flex flex-col items-center">
              <p className="text-[9px] font-black text-quiz-text-muted uppercase mb-1">Ofensiva</p>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-quiz-primary fill-quiz-primary" />
                <span className="text-sm font-black">{streakCount}</span>
              </div>
           </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        <SidebarLink to="/" active={location.pathname === "/"} icon={<MapIcon className="w-5 h-5" />} label="Mapa do Tempo" />
        <SidebarLink to="/loja" active={location.pathname === "/loja"} icon={<ShoppingBag className="w-5 h-5" />} label="Loja de Avatares" />
        <SidebarLink to="/ranking" active={location.pathname === "/ranking"} icon={<Trophy className="w-5 h-5" />} label="Ranking" />
        <SidebarLink to="/perfil" active={location.pathname === "/perfil"} icon={<Award className="w-5 h-5" />} label="Conquistas" />
        {isAdmin && <SidebarLink to="/admin" active={location.pathname.startsWith("/admin")} icon={<Settings className="w-5 h-5" />} label="Painel Admin" />}
      </nav>

      <div className="mt-auto pt-6 border-t border-quiz-border">
        <button onClick={signOut} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-quiz-wrong/10 text-quiz-wrong font-black text-[10px] uppercase tracking-widest border border-quiz-wrong/20 hover:bg-quiz-wrong hover:text-black transition-all">
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, active, icon, label }: { to: string, active: boolean, icon: React.ReactNode, label: string }) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 w-full p-2.5 rounded-xl border transition-all group",
      active 
        ? "bg-quiz-primary border-quiz-primary text-black shadow-lg shadow-quiz-primary/10" 
        : "bg-quiz-bg border-quiz-border text-quiz-text-muted hover:text-quiz-text-main hover:border-quiz-primary/50"
    )}
  >
    <div className={cn(
      "w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
      active ? "bg-black/10" : "bg-quiz-surface"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
  </Link>
);
