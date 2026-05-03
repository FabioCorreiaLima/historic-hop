import { useState } from "react";
import { Lock, Star, CheckCircle2, ChevronRight, Trophy, LogIn, LogOut, User, Settings, Award, MessageCircle, Menu, X, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { type HistoricalPeriod } from "@/types";
import StreakBadge from "./StreakBadge";
import { getLevel } from "@/lib/gamification";
import { api } from "@/lib/api";
import StoreModal from "./StoreModal";

interface TimelineMapProps {
  periods: HistoricalPeriod[];
  periodProgress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>;
  /** Quando definido (após GET /curriculum/me), desbloqueio segue o servidor (trilha ordenada). */
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
  practicedToday, 
  achievementCount 
}: TimelineMapProps) => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [currentSkin, setCurrentSkin] = useState("classic");
  const [hoverBg, setHoverBg] = useState<string | null>(null);

  const completedCount = Object.values(periodProgress).filter(p => p.completed).length;
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

  if (periodsLoading && periods.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white">
        <p className="text-sm text-white/60">Carregando trilha…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-[#0a0a0c] flex flex-col md:flex-row">
      {/* Historical Map Background - Persistent underlayer */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url("/map-bg.png")` }}
      />
      {hoverBg && (
        <div 
          className="fixed inset-0 opacity-30 bg-cover bg-center pointer-events-none transition-all duration-700 animate-fade-in"
          style={{ backgroundImage: `url("${hoverBg}")` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c] pointer-events-none opacity-60" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm">📚</div>
          <span className="font-black text-white text-sm tracking-tighter">HISTORIC HOP</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar - Desktop Stats & Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-[#0a0a0c]/95 md:bg-slate-900/20 backdrop-blur-3xl border-r border-white/5 p-6 md:p-8 z-[60] flex flex-col gap-6 md:gap-10 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-2xl shadow-2xl shadow-primary/20 ring-1 ring-white/20 animate-float">
            📚
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">HISTORIC<br/>HOP</h1>
            <p className="text-[9px] font-black text-primary tracking-[0.3em] uppercase mt-1">Timeline Explorer</p>
          </div>
        </div>

        {/* Profile Card Premium */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-black text-white shadow-xl ring-2 ring-white/10">
                {profile?.display_name?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-black text-white text-lg tracking-tight">{profile?.display_name || "Viajante"}</p>
                <div className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/5 ${getLevel(profile?.total_score || 0).color}`}>
                  {getLevel(profile?.total_score || 0).title}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-[9px] text-white/30 font-black uppercase tracking-tighter mb-1">Estrelas</p>
                <p className="text-xl font-black text-amber-400 leading-none">{totalStars} <span className="text-xs">⭐</span></p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-[9px] text-white/30 font-black uppercase tracking-tighter mb-1">Ofensiva</p>
                <p className="text-xl font-black text-orange-500 leading-none">{streakCount} <span className="text-xs">🔥</span></p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nível de Exploração</span>
                <span className="text-[10px] font-black text-emerald-400">{Math.round((completedCount / periods.length) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full p-0.5 overflow-hidden ring-1 ring-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${(completedCount / periods.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-4 mb-2">Comunidade</p>
          <button onClick={() => setIsStoreOpen(true)} className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-white/5 text-white/50 hover:text-white transition-all group border border-transparent hover:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm font-black tracking-tight">Loja de Avatares</span>
          </button>
          
          <button onClick={onShowAchievements} className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-white/5 text-white/50 hover:text-white transition-all group border border-transparent hover:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-black tracking-tight">Conquistas</span>
          </button>

          {isAdmin && (
            <a href="/admin" className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-white/5 text-white/50 hover:text-white transition-all group border border-transparent hover:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-slate-400/10 flex items-center justify-center group-hover:rotate-45 transition-transform">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm font-black tracking-tight">Administração</span>
            </a>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          {user ? (
            <button onClick={signOut} className="flex items-center gap-3 w-full p-4 rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 transition-all font-black text-xs">
              <LogOut className="w-4 h-4" /> SAIR DA CONTA
            </button>
          ) : (
            <button onClick={onShowAuth} className="w-full py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              ENTRAR NO JOGO
            </button>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-screen overflow-y-auto relative p-4 sm:p-6 md:p-12 lg:p-16 scrollbar-hide">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 md:gap-20 relative pb-32 md:pb-40">
          
          {/* Header Title Compact */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">
              Explore a História do Brasil
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-xl tracking-tighter italic">
              LINHA DO TEMPO
            </h2>
          </div>

          {periods.map((period, index) => {
            const unlocked = isPeriodUnlocked(index);
            const progress = periodProgress[period.id];
            const completed = progress?.completed || false;
            const periodCardImage = period.image_url || period.imageUrl;
            
            const isLeft = index % 2 === 0;

            return (
              <div 
                key={period.id} 
                className={`flex flex-col lg:flex-row items-center gap-4 md:gap-6 lg:gap-10 group relative ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Visual Connector Line - More subtle */}
                {index < periods.length - 1 && (
                  <div className="absolute top-[48px] lg:top-full left-1/2 w-0.5 h-12 md:h-24 bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2 -z-10 hidden md:block" />
                )}

                {/* Period Card - Compact & Elegant */}
                <div className={`w-full lg:w-[340px] transition-all duration-500 ${!unlocked ? 'opacity-20 grayscale scale-95' : 'group-hover:translate-y-[-4px]'}`}>
                  <div className="relative overflow-hidden rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md shadow-xl group-hover:border-white/20 transition-all">
                    {/* Compact Image with Error Handling */}
                    <div className="h-32 relative overflow-hidden bg-slate-800">
                      {periodCardImage ? (
                        <img 
                          src={periodCardImage} 
                          alt={period.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails, hide the image and show the placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.parentElement?.querySelector('.image-placeholder');
                            if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Placeholder (Hidden by default if image exists) */}
                      <div 
                        className={`image-placeholder absolute inset-0 ${period.bgColor?.replace('bg-', 'bg-').replace('/5', '/50') || 'bg-slate-800'} flex items-center justify-center text-4xl opacity-20`}
                        style={{ display: periodCardImage ? 'none' : 'flex' }}
                      >
                        {period.emoji}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 border border-white/5">
                        <p className="text-[8px] font-black text-white/60 tracking-widest">{period.years}</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-black text-white mb-1 tracking-tight uppercase italic">{period.name}</h3>
                      <p className="text-[10px] text-white/40 mb-5 line-clamp-2 leading-relaxed">{period.description}</p>
                      
                      {unlocked && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPeriod(period.id)}
                            className="flex-1 py-2 rounded-xl bg-white text-slate-950 text-[10px] font-black hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg"
                          >
                            EXPLORAR
                          </button>
                          
                          <button
                            onClick={() => onPlayPacman(period.id)}
                            className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all active:scale-90"
                            title="Pac-Man"
                          >
                            <span className="text-sm">👾</span>
                          </button>
                          <button
                            onClick={() => onOpenChat(period.id)}
                            className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                            title="Chat"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* The Central Node - Balanced Size */}
                <div className="relative flex-shrink-0 order-first lg:order-none mb-3 lg:mb-0">
                  <div className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-[1rem] md:rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-2xl md:text-3xl lg:text-4xl shadow-2xl transition-all duration-500 ${
                    completed
                      ? "bg-gradient-to-br from-emerald-400 to-teal-600 ring-4 ring-emerald-500/20 shadow-emerald-500/20"
                      : unlocked
                      ? `bg-white ring-4 ring-white/5 group-hover:scale-110`
                      : "bg-slate-900 border-2 border-white/5 opacity-20"
                  }`}>
                    {completed ? (
                      <div className="relative flex flex-col items-center">
                        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                        <div className="absolute -top-6 md:-top-8 flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= (progress?.stars || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="drop-shadow-lg">{unlocked ? period.emoji : <Lock className="w-6 h-6 text-white/10" />}</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {isStoreOpen && (
        <StoreModal 
          onClose={() => setIsStoreOpen(false)} 
          currentSkin={currentSkin}
          onSkinChange={(id) => setCurrentSkin(id)}
        />
      )}
    </div>
  );
};

export default TimelineMap;
