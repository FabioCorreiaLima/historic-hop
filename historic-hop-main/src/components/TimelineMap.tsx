import { useState } from "react";
import { Lock, Star, CheckCircle2, ChevronRight, Trophy, LogIn, LogOut, User, Settings, Award, MessageCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { type HistoricalPeriod } from "@/data/activities";
import StreakBadge from "./StreakBadge";

interface TimelineMapProps {
  periods: HistoricalPeriod[];
  periodProgress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>;
  onSelectPeriod: (periodId: string) => void;
  onShowRanking: () => void;
  onShowAuth: () => void;
  onShowAchievements: () => void;
  onOpenChat: (periodId: string) => void;
  streakCount: number;
  practicedToday: boolean;
  achievementCount: number;
}

const TimelineMap = ({ 
  periods, 
  periodProgress, 
  onSelectPeriod, 
  onShowRanking, 
  onShowAuth, 
  onShowAchievements, 
  onOpenChat, 
  streakCount, 
  practicedToday, 
  achievementCount 
}: TimelineMapProps) => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoverBg, setHoverBg] = useState<string | null>(null);

  const completedCount = Object.values(periodProgress).filter(p => p.completed).length;
  const totalStars = Object.values(periodProgress).reduce((sum, p) => sum + (p.stars || 0), 0);

  const isPeriodUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevPeriod = periods[index - 1];
    return periodProgress[prevPeriod.id]?.completed || false;
  };

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

      {/* Sidebar - Desktop Stats */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900/95 md:bg-slate-900/40 backdrop-blur-xl border-r border-white/10 p-6 z-[60] flex flex-col gap-8 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xl shadow-lg ring-1 ring-white/20">
            📚
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter">HISTORIC HOP</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Explorador de História</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white shadow-inner">
              {profile?.display_name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-white">{profile?.display_name || "Viajante"}</p>
              <p className="text-xs text-blue-300/70">Nível {Math.floor(totalStars / 5) + 1}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 p-2 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40 font-bold uppercase">Estrelas</p>
              <p className="text-lg font-black text-amber-400">{totalStars} ⭐</p>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40 font-bold uppercase">Ofensiva</p>
              <p className="text-lg font-black text-orange-500">{streakCount} 🔥</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-white/50 uppercase">Progresso Geral</span>
              <span className="text-[10px] font-bold text-emerald-400">{Math.round((completedCount / periods.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${(completedCount / periods.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-2">
          <button onClick={onShowRanking} className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-white/5 text-white/70 hover:text-white transition-all group">
            <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Ranking Global</span>
          </button>
          <button onClick={onShowAchievements} className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-white/5 text-white/70 hover:text-white transition-all group">
            <Award className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">Conquistas</span>
          </button>
          {isAdmin && (
            <a href="/admin" className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-white/5 text-white/70 hover:text-white transition-all group">
              <Settings className="w-5 h-5 text-slate-400 group-hover:rotate-45 transition-transform" />
              <span className="text-sm font-bold">Administração</span>
            </a>
          )}
        </div>

        <div className="mt-auto">
          {user ? (
            <button onClick={signOut} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 p-2">
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          ) : (
            <button onClick={onShowAuth} className="duo-btn duo-btn-primary w-full py-3">
              ENTRAR NO JOGO
            </button>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-screen overflow-y-auto relative p-8 md:p-12 lg:p-20 scrollbar-hide">
        <div className="max-w-5xl mx-auto flex flex-col gap-24 relative pb-40">
          
          {/* Header Title for Web */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-tighter">
              LINHA DO TEMPO
            </h2>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Uma jornada pelos grandes eventos da humanidade</p>
          </div>

          {periods.map((period, index) => {
            const unlocked = isPeriodUnlocked(index);
            const progress = periodProgress[period.id];
            const completed = progress?.completed || false;
            
            // Web Layout: Alternate sides
            const isLeft = index % 2 === 0;

            return (
              <div 
                key={period.id} 
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 group animate-fade-in-up ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Period Image/Card (Desktop) */}
                <div className={`hidden lg:block w-full max-w-[400px] h-[250px] relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 ${!unlocked && 'grayscale opacity-30'}`}>
                  {period.image_url ? (
                    <img 
                      src={period.image_url} 
                      alt={period.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/map-bg.png";
                        (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-20 grayscale";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-6xl opacity-20">
                      {period.emoji}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${period.color || 'text-primary'}`}>{period.years}</p>
                    <h3 className="text-2xl font-black text-white">{period.name}</h3>
                  </div>
                </div>

                {/* The "Node" */}
                <div className="relative">
                  {/* Connection Line */}
                  {index < periods.length - 1 && (
                    <div className="absolute top-full left-1/2 w-1.5 h-24 bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2" />
                  )}

                  <button
                    onClick={() => unlocked && onSelectPeriod(period.id)}
                    onMouseEnter={() => unlocked && period.image_url && setHoverBg(period.image_url)}
                    onMouseLeave={() => setHoverBg(null)}
                    disabled={!unlocked}
                    className={`relative z-10 w-20 h-20 lg:w-28 lg:h-28 rounded-[2.5rem] lg:rounded-[3rem] flex items-center justify-center text-3xl lg:text-5xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 active:scale-90 hover:shadow-primary/20 ${
                      completed
                        ? `bg-gradient-to-br from-emerald-400 to-green-600 text-white ring-4 lg:ring-8 ring-emerald-400/20`
                        : unlocked
                        ? `bg-white border-4 ${(period.borderColor || 'border-primary').replace('border-', 'border-')} hover:-translate-y-3`
                        : "bg-slate-800 border-4 border-slate-700 grayscale opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {completed ? (
                      <div className="relative">
                        <CheckCircle2 className="w-10 h-10 lg:w-14 lg:h-14" />
                        <div className="absolute -top-10 lg:-top-12 left-1/2 -translate-x-1/2 flex gap-1">
                          {[1, 2, 3].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${s <= (progress?.stars || 0) ? "text-amber-300 fill-amber-300" : "text-white/20"}`} />
                          ))}
                        </div>
                      </div>
                    ) : unlocked ? (
                      <span className="drop-shadow-lg">{period.emoji}</span>
                    ) : (
                      <Lock className="w-8 h-8 lg:w-10 lg:h-10 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Mobile/Tablet Card */}
                <div className={`w-full max-w-sm ${!unlocked && 'opacity-30'}`}>
                  <div className={`bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem] backdrop-blur-md transition-all duration-500 group-hover:bg-white/10 ${!isLeft ? 'lg:text-right' : 'text-left'}`}>
                    {/* Mobile Image */}
                    <div className="mb-4 lg:hidden rounded-2xl overflow-hidden h-32 border border-white/5 relative">
                       {period.image_url ? (
                        <img 
                          src={period.image_url} 
                          alt={period.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/map-bg.png";
                            (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-20 grayscale";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl opacity-20">{period.emoji}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <p className="absolute bottom-3 left-3 text-[9px] font-black text-white/80 uppercase tracking-widest">{period.years}</p>
                    </div>

                    <div className="hidden lg:block">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${period.color || 'text-primary'}`}>{period.years}</p>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{period.name}</h3>
                    <p className="text-[11px] md:text-xs text-white/50 mb-4 line-clamp-3 md:line-clamp-2">{period.description}</p>
                    
                    {unlocked && (
                      <div className={`flex items-center gap-3 ${!isLeft ? 'lg:justify-end' : 'justify-start'}`}>
                        <button
                          onClick={() => onSelectPeriod(period.id)}
                          className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-white text-black text-[11px] font-black hover:scale-105 active:scale-95 transition-all"
                        >
                          EXPLORAR
                        </button>
                        <button
                          onClick={() => onOpenChat(period.id)}
                          className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
                        >
                          <MessageCircle className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineMap;
