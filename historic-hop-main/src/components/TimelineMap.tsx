import { Lock, Star, MessageCircle, Calendar, Gamepad2 } from "lucide-react";
import { type HistoricalPeriod } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineMapProps {
  periods: HistoricalPeriod[];
  periodProgress: Record<string, { completed: boolean; stars: number; correct: number; total: number }>;
  periodServerUnlock?: Record<string, boolean> | null;
  periodsLoading?: boolean;
  onSelectPeriod: (periodId: string) => void;
  onOpenChat: (periodId: string) => void;
  onPlayPacman: (periodId: string) => void;
}

const TimelineMap = ({ 
  periods, 
  periodProgress, 
  periodServerUnlock = null,
  onSelectPeriod, 
  onOpenChat,
  onPlayPacman
}: TimelineMapProps) => {
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
    <div className="max-w-4xl mx-auto space-y-12 md:space-y-24 py-12 md:py-20 px-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-quiz-text-main tracking-tight uppercase">Linha do Tempo</h2>
        <p className="text-xs md:text-sm text-quiz-text-muted font-medium mt-2 uppercase tracking-[0.3em]">Explore a história do Brasil</p>
      </div>

      <div className="relative">
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
                       <button onClick={() => onPlayPacman(period.id)} className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-quiz-bg border border-quiz-border flex items-center justify-center text-quiz-text-muted hover:text-quiz-primary hover:border-quiz-primary transition-all"><Gamepad2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

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

                <div className="hidden md:block w-[42%]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineMap;
