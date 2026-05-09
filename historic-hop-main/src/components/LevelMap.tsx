import { motion } from "framer-motion";
import { Lock, Star, Play, MessageCircle, Gamepad2, Loader2, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { type HistoricalPeriod } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface LevelMapProps {
  periods: HistoricalPeriod[];
  periodProgress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>;
  periodServerUnlock?: Record<string, boolean> | null;
  loading?: boolean;
  onSelectPeriod: (id: string) => void;
  onOpenChat: (id: string) => void;
  onPlayPacman: (id: string) => void;
}

const LevelMap = ({ 
  periods, 
  periodProgress, 
  periodServerUnlock, 
  loading,
  onSelectPeriod,
  onOpenChat,
  onPlayPacman
}: LevelMapProps) => {
  
  const isUnlocked = (index: number) => {
    const p = periods[index];
    if (!p) return false;
    if (periodServerUnlock && p.id in periodServerUnlock) return periodServerUnlock[p.id];
    if (index === 0) return true;
    return periodProgress[periods[index-1].id]?.completed || false;
  };

  if (loading && periods.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-quiz-bg">
        <Loader2 className="w-10 h-10 animate-spin text-quiz-primary mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-quiz-text-muted">Recuperando registros...</p>
      </div>
    );
  }

  return (
    <div className="bg-quiz-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        
        {/* Map Header */}
        <div className="mb-16 md:mb-24 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-quiz-primary/10 blur-[80px] md:blur-[100px] rounded-full -z-10" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6"
          >
            <Trophy className="w-3 h-3" />
            Sua Jornada Histórica
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 text-quiz-text-main"
          >
            LINHA DO <span className="text-quiz-primary">TEMPO</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-quiz-text-muted font-medium max-w-xl mx-auto text-sm md:text-lg px-4"
          >
            Domine os grandes eventos que moldaram o mundo e desbloqueie recompensas exclusivas.
          </motion.p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Central Vertical Line (Desktop Only) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-quiz-border -translate-x-1/2 hidden md:block" />
          
          {/* Left Vertical Line (Mobile Only) */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-quiz-border md:hidden" />

          <div className="space-y-12 md:space-y-24 relative z-10">
            {periods.map((period, index) => {
              const unlocked = isUnlocked(index);
              const progress = periodProgress[period.id] || { stars: 0, completed: false };
              const isEven = index % 2 === 0;

              return (
                <motion.div 
                  key={period.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-6 md:gap-0 pl-12 md:pl-0",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Card Section */}
                  <div className={cn(
                    "w-full md:w-[42%] group relative",
                    !unlocked && "pointer-events-none"
                  )}>
                    <div className={cn(
                      "relative z-10 p-6 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border-2 transition-all duration-500 overflow-hidden",
                      unlocked 
                        ? "bg-quiz-surface border-quiz-border hover:border-quiz-primary/50 shadow-2xl shadow-black" 
                        : "bg-quiz-bg border-dashed border-quiz-border opacity-60 grayscale"
                    )}>
                      {/* Glow Effect on Hover */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-quiz-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                      <div className="relative z-20">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                          <div className={cn(
                            "w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-4xl shadow-inner transition-transform group-hover:scale-110 duration-500",
                            unlocked ? "bg-quiz-bg border border-quiz-border" : "bg-quiz-surface"
                          )}>
                            {unlocked ? period.emoji : <Lock className="w-6 h-6 md:w-10 md:h-10 text-quiz-text-muted" />}
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "w-4 h-4 md:w-6 md:h-6 transition-all duration-500", 
                                  s <= progress.stars ? "fill-quiz-primary text-quiz-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" : "text-quiz-border"
                                )} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 md:space-y-2 mb-6 md:mb-8">
                          <div className="flex items-center gap-2 text-quiz-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3" />
                            <span>{period.years}</span>
                          </div>
                          <h3 className="text-xl md:text-3xl font-black tracking-tight text-quiz-text-main uppercase group-hover:text-quiz-primary transition-colors">
                            {period.name}
                          </h3>
                          <p className="text-xs md:text-sm text-quiz-text-muted leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">
                            {period.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                          <button 
                            onClick={() => onSelectPeriod(period.id)}
                            className="flex-1 h-12 md:h-14 bg-quiz-primary text-black font-black rounded-xl flex items-center justify-center gap-2 hover:bg-quiz-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-0 shadow-lg shadow-quiz-primary/5 text-xs md:text-sm"
                          >
                            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> JOGAR
                          </button>
                          
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    onClick={() => onOpenChat(period.id)}
                                    className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-quiz-surface border border-quiz-border text-quiz-text-main hover:text-quiz-primary hover:border-quiz-primary transition-all flex items-center justify-center shadow-lg"
                                  >
                                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-quiz-primary text-black font-bold">Conversar</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    onClick={() => onPlayPacman(period.id)}
                                    className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-quiz-surface border border-quiz-border text-quiz-text-main hover:text-quiz-primary hover:border-quiz-primary transition-all flex items-center justify-center shadow-lg"
                                  >
                                    <Gamepad2 className="w-5 h-5 md:w-6 md:h-6" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-quiz-primary text-black font-bold">Minigame</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className={cn(
                    "absolute left-4 md:left-1/2 flex items-center justify-center -translate-x-1/2 z-20",
                    "w-8 h-8 md:w-10 md:h-10"
                  )}>
                    <div className={cn(
                      "w-6 h-6 md:w-10 md:h-10 rounded-full border-4 md:border-8 border-quiz-bg transition-all duration-500",
                      unlocked ? "bg-quiz-primary shadow-[0_0_20px_rgba(234,179,8,0.4)] md:shadow-[0_0_30px_rgba(234,179,8,0.6)] scale-110" : "bg-quiz-border"
                    )} />
                  </div>

                  {/* Spacing for alignment (Desktop Only) */}
                  <div className="hidden md:block w-[42%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
