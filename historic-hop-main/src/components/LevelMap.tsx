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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-quiz-bg p-6">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-quiz-primary mb-4" />
        <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-quiz-text-muted text-center">Recuperando registros históricos...</p>
      </div>
    );
  }

  return (
    <div className="bg-quiz-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-28">
        
        {/* Header Responsivo */}
        <div className="mb-16 md:mb-24 lg:mb-32 text-center relative px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 md:w-72 lg:w-96 h-48 md:h-72 lg:h-96 bg-quiz-primary/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-6 md:mb-8"
          >
            <Trophy className="w-3 h-3 md:w-4 md:h-4" />
            Sua Jornada Histórica
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter mb-6 md:mb-8 text-quiz-text-main leading-[1.1] md:leading-[0.9]"
          >
            LINHA DO <span className="text-quiz-primary">TEMPO</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm lg:text-base text-quiz-text-muted font-medium max-w-2xl mx-auto leading-relaxed opacity-80"
          >
            Domine os grandes eventos que moldaram o mundo e desbloqueie recompensas exclusivas através do conhecimento.
          </motion.p>
        </div>

        {/* Timeline Responsiva */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-quiz-border -translate-x-1/2 hidden md:block opacity-30" />
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-quiz-border md:hidden opacity-30" />

          <div className="space-y-10 md:space-y-24 lg:space-y-32 relative z-10">
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
                  <div className={cn(
                    "w-full md:w-[44%] lg:w-[42%] group relative",
                    !unlocked && "pointer-events-none"
                  )}>
                    <div className={cn(
                      "relative z-10 p-5 md:p-8 lg:p-10 rounded-2xl md:rounded-[2rem] border-2 transition-all duration-500 overflow-hidden",
                      unlocked 
                        ? "bg-quiz-surface border-quiz-border hover:border-quiz-primary shadow-2xl" 
                        : "bg-quiz-bg border-dashed border-quiz-border/50 opacity-40 grayscale"
                    )}>
                      <div className="relative z-20">
                        <div className="flex items-center justify-between mb-6 md:mb-10">
                          <div className={cn(
                            "w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl lg:text-4xl shadow-inner",
                            unlocked ? "bg-quiz-bg border border-quiz-border" : "bg-quiz-surface"
                          )}>
                            {unlocked ? period.emoji : <Lock className="w-5 h-5 md:w-8 md:h-8 text-quiz-text-muted" />}
                          </div>
                          <div className="flex gap-1 md:gap-1.5">
                            {[1, 2, 3].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "w-3 h-3 md:w-5 md:h-5 lg:w-6 lg:h-6", 
                                  s <= progress.stars ? "fill-quiz-primary text-quiz-primary" : "text-quiz-border"
                                )} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-3 mb-6 md:mb-10">
                          <div className="flex items-center gap-2 text-quiz-primary text-xs md:text-sm font-black uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{period.years}</span>
                          </div>
                          <h3 className="text-base md:text-lg lg:text-xl font-black tracking-tight text-quiz-text-main uppercase group-hover:text-quiz-primary transition-colors leading-tight">
                            {period.name}
                          </h3>
                          <p className="text-xs md:text-sm text-quiz-text-muted leading-relaxed line-clamp-2 md:line-clamp-3 font-medium opacity-70">
                            {period.description}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                          <button 
                            onClick={() => onSelectPeriod(period.id)}
                            className="flex-1 h-12 md:h-14 lg:h-16 bg-quiz-primary text-black font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-quiz-primary-dark transition-all text-xs md:text-sm lg:text-base uppercase tracking-widest"
                          >
                            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> JOGAR
                          </button>
                          
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    onClick={() => onOpenChat(period.id)}
                                    className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-xl md:rounded-2xl bg-quiz-surface border border-quiz-border text-quiz-text-main hover:text-quiz-primary transition-all flex items-center justify-center shadow-lg active:scale-95"
                                  >
                                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
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
                                    className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-xl md:rounded-2xl bg-quiz-surface border border-quiz-border text-quiz-text-main hover:text-quiz-primary transition-all flex items-center justify-center shadow-lg active:scale-95"
                                  >
                                    <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
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

                  <div className={cn(
                    "absolute left-6 md:left-1/2 flex items-center justify-center -translate-x-1/2 z-20",
                    "w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14"
                  )}>
                    <div className={cn(
                      "w-3 h-3 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border-4 md:border-8 border-quiz-bg transition-all duration-500",
                      unlocked ? "bg-quiz-primary shadow-xl scale-110" : "bg-quiz-border"
                    )} />
                  </div>

                  <div className="hidden md:block w-[44%] lg:w-[42%]" />
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
