import { useState } from "react";
import { Lock, Star, CheckCircle2, Trophy, LogOut, User, Settings, Award, MessageCircle, Menu, X, ShoppingBag, Zap, Map as MapIcon, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { type HistoricalPeriod } from "@/types";
import { getLevel } from "@/lib/gamification";
import StoreModal from "./StoreModal";
import { cn } from "@/lib/utils";

interface TimelineMapProps {
  periods: HistoricalPeriod[];
  periodProgress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>;
  periodServerUnlock?: Record<string, boolean> | null;
  periodsLoading?: boolean;
  onSelectPeriod: (periodId: string) => void;
  onShowRanking: () => void;
  onShowAuth: () => void;
  onShowAchievements: () => void;
  onOpenChat: (periodId: string) => void;
  onPlayPacman: (periodId: string) => void;
  streakCount: number;
  practicedToday: boolean;
  achievementCount: number;
}

const TimelineMap = ({ 
  periods, 
  periodProgress, 
  periodServerUnlock = null,
  periodsLoading = false,
  onSelectPeriod, 
  onShowRanking, 
  onShowAuth, 
  onShowAchievements, 
  onOpenChat, 
  onPlayPacman,
  streakCount, 
  achievementCount 
}: TimelineMapProps) => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const totalStars = Object.values(periodProgress).reduce((sum, p) => sum + (p.stars || 0), 0);

  const isPeriodUnlocked = (index: number) => {
    const p = periods[index];
    if (!p) return false;
    if (periodServerUnlock != null && p.id in periodServerUnlock) {
      return periodServerUnlock[p.id];
    }
    if (index === 0) return true;
    const prevPeriod = periods[index - 1];
    return periodProgress[prevPeriod.id]?.completed || false;
  };

  return (
    <div className="w-full min-h-screen bg-quiz-bg flex flex-col lg:flex-row relative">
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-quiz-surface border-b border-quiz-border z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-quiz-primary flex items-center justify-center text-black font-black text-xs">H</div>
          <span className="font-black text-sm text-quiz-text-main uppercase tracking-tighter">Timeline</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-quiz-primary bg-quiz-bg border border-quiz-border rounded-lg">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Responsive */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 lg:w-80 bg-quiz-surface border-r border-quiz-border transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex lg:flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:p-8 flex flex-col h-full gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-quiz-primary rounded-2xl flex items-center justify-center text-black shadow-xl shadow-quiz-primary/20">
              <MapIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-quiz-text-main tracking-tighter uppercase">Historic <span className="text-quiz-primary">Hop</span></h1>
              <p className="text-[10px] font-black text-quiz-text-muted uppercase tracking-[0.2em] mt-1">Timeline v3.0</p>
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
                  <p className="text-[10px] font-bold text-quiz-primary uppercase tracking-widest">{getLevel(profile?.total_score || 0).title}</p>
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
            <SidebarBtn icon={<ShoppingBag />} label="Loja" onClick={() => { setIsStoreOpen(true); setIsSidebarOpen(false); }} />
            <SidebarBtn icon={<Award />} label="Conquistas" onClick={() => { onShowAchievements(); setIsSidebarOpen(false); }} />
            <SidebarBtn icon={<Trophy />} label="Ranking" onClick={() => { onShowRanking(); setIsSidebarOpen(false); }} />
            {isAdmin && <SidebarBtn icon={<Settings />} label="Painel Admin" onClick={() => window.location.href='/admin'} />}
          </nav>

          <div className="mt-auto pt-6 border-t border-quiz-border">
            {user ? (
              <button onClick={signOut} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-quiz-wrong/10 text-quiz-wrong font-black text-[10px] uppercase tracking-widest border border-quiz-wrong/20 hover:bg-quiz-wrong hover:text-black transition-all">
                <LogOut className="w-4 h-4" /> Sair da Conta
              </button>
            ) : (
              <button onClick={onShowAuth} className="w-full py-4 rounded-xl bg-quiz-primary text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-quiz-primary/10 hover:scale-[1.02] active:scale-95 transition-all">
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-quiz-bg relative p-6 md:p-12 lg:p-20 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-24 pb-32">
          
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-quiz-text-main tracking-tight uppercase">Linha do Tempo</h2>
            <p className="text-xs md:text-sm text-quiz-text-muted font-medium mt-2 uppercase tracking-[0.3em]">Explore a história do Brasil</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-quiz-border -translate-x-1/2 opacity-20" />

            <div className="space-y-16 md:space-y-32 relative z-10">
              {periods.map((period, index) => {
                const unlocked = isPeriodUnlocked(index);
                const progress = periodProgress[period.id];
                const isEven = index % 2 === 0;

                return (
                  <div key={period.id} className={cn(
                    "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    {/* Card Side */}
                    <div className="w-full md:w-[42%] group">
                      <div className={cn(
                        "p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-500",
                        unlocked 
                          ? "bg-quiz-surface border-quiz-border hover:border-quiz-primary shadow-2xl" 
                          : "bg-quiz-bg border-dashed border-quiz-border opacity-30 grayscale pointer-events-none"
                      )}>
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-2 text-quiz-primary text-[10px] md:text-xs font-black uppercase tracking-widest">
                             <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                             {period.years}
                           </div>
                           <div className="flex gap-1">
                              {[1, 2, 3].map(s => (
                                <Star key={s} className={cn("w-3 h-3 md:w-4 md:h-4", s <= (progress?.stars || 0) ? "text-quiz-primary fill-quiz-primary" : "text-quiz-border")} />
                              ))}
                           </div>
                        </div>

                        <h3 className="text-base md:text-lg lg:text-xl font-black text-quiz-text-main uppercase tracking-tight mb-2 group-hover:text-quiz-primary transition-colors">
                          {period.name}
                        </h3>
                        <p className="text-xs md:text-sm text-quiz-text-muted font-medium leading-relaxed mb-8 line-clamp-3">
                          {period.description}
                        </p>

                        <div className="flex gap-2">
                           <button onClick={() => onSelectPeriod(period.id)} className="flex-1 py-3 md:py-4 rounded-xl bg-quiz-primary text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-quiz-primary-dark transition-all">Jogar</button>
                           <button onClick={() => onOpenChat(period.id)} className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-quiz-bg border border-quiz-border flex items-center justify-center text-quiz-text-muted hover:text-quiz-primary hover:border-quiz-primary transition-all"><MessageCircle className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Node Side */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                       <div className={cn(
                         "w-10 h-10 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border-4 md:border-8 border-quiz-bg flex items-center justify-center text-xl md:text-3xl transition-all duration-500 z-20 shadow-2xl",
                         unlocked ? "bg-quiz-primary text-black shadow-quiz-primary/20 scale-110" : "bg-quiz-surface text-quiz-text-muted grayscale"
                       )}>
                         {unlocked ? period.emoji : <Lock className="w-5 h-5 md:w-8 md:h-8" />}
                       </div>
                       {progress?.completed && (
                         <div className="mt-2 text-[8px] md:text-[10px] font-black text-quiz-correct uppercase tracking-widest">Concluído</div>
                       )}
                    </div>

                    {/* Empty Space for alignment */}
                    <div className="hidden md:block w-[42%]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {isStoreOpen && <StoreModal onClose={() => setIsStoreOpen(false)} currentSkin="classic" onSkinChange={() => {}} />}
    </div>
  );
};

const SidebarBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-4 w-full p-4 rounded-2xl bg-quiz-bg border border-quiz-border text-quiz-text-muted hover:text-quiz-text-main hover:border-quiz-primary/50 transition-all group">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-quiz-surface flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs md:text-sm font-black tracking-widest uppercase">{label}</span>
  </button>
);

export default TimelineMap;
