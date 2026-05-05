import { motion } from "framer-motion";
import { Lock, Star, Play, MessageCircle, Gamepad2, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type HistoricalPeriod } from "@/types";
import { Button } from "./ui/button";
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Sincronizando História...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Map Header */}
      <div className="mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
        >
          TRILHA DO TEMPO
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-medium"
        >
          Cada lição desbloqueia um novo capítulo da nossa história.
        </motion.p>
      </div>

      {/* Grid of Periods */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-secondary/30 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12 relative z-10">
          {periods.map((period, index) => {
            const unlocked = isUnlocked(index);
            const progress = periodProgress[period.id] || { stars: 0, completed: false };
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={period.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Content Card */}
                <div className={cn(
                  "w-full md:w-[45%] p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                  unlocked 
                    ? "bg-card border-border hover:border-primary/50 shadow-xl shadow-black/5" 
                    : "bg-secondary/20 border-dashed border-border/50 grayscale"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110",
                      unlocked ? "bg-secondary" : "bg-muted text-muted-foreground"
                    )}>
                      {unlocked ? period.emoji : <Lock className="w-8 h-8" />}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star 
                          key={s} 
                          className={cn(
                            "w-5 h-5", 
                            s <= progress.stars ? "fill-amber-500 text-amber-500" : "text-muted/30"
                          )} 
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{period.name}</h3>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">{period.years}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8 line-clamp-3">
                    {period.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      disabled={!unlocked}
                      onClick={() => onSelectPeriod(period.id)}
                      className={cn(
                        "duo-btn duo-btn-primary flex-1",
                        !unlocked && "opacity-50"
                      )}
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" /> Jogar
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="secondary" 
                            disabled={!unlocked}
                            onClick={() => onOpenChat(period.id)}
                            className="h-12 w-12 rounded-2xl p-0"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Conversar com Personagem</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="secondary" 
                            disabled={!unlocked}
                            onClick={() => onPlayPacman(period.id)}
                            className="h-12 w-12 rounded-2xl p-0"
                          >
                            <Gamepad2 className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Minigame Pac-Man</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex w-[10%] items-center justify-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-4 border-background z-20",
                    unlocked ? "bg-primary shadow-[0_0_15px_rgba(38,92,250,0.5)]" : "bg-muted"
                  )} />
                </div>

                {/* Empty space for grid alignment */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
