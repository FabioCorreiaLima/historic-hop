import { ArrowLeft, Lock, Trophy, Sparkles } from "lucide-react";
import { ACHIEVEMENTS } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

interface Props {
  unlockedKeys: Set<string>;
  onBack: () => void;
}

const AchievementsPanel = ({ unlockedKeys, onBack }: Props) => {
  const categories = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 md:mb-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-3 rounded-xl bg-quiz-surface border border-quiz-border text-quiz-text-muted hover:text-quiz-text-main hover:border-quiz-primary transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-quiz-text-main tracking-tight uppercase">Minhas Conquistas</h2>
            <p className="text-xs md:text-sm text-quiz-text-muted font-medium uppercase tracking-widest mt-1">Sua glória eternizada no tempo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-quiz-surface px-5 py-3 rounded-2xl border border-quiz-border self-start md:self-auto">
          <Trophy className="w-5 h-5 text-quiz-primary" />
          <span className="text-sm md:text-base font-black text-quiz-text-main">
            {unlockedKeys.size} <span className="text-quiz-text-muted">/ {ACHIEVEMENTS.length}</span>
          </span>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-quiz-primary" />
            <h3 className="text-xs md:text-sm font-black text-quiz-text-muted uppercase tracking-[0.3em]">{cat}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
              const unlocked = unlockedKeys.has(a.key);
              return (
                <div 
                  key={a.key} 
                  className={cn(
                    "relative group p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center text-center overflow-hidden",
                    unlocked 
                      ? "bg-quiz-surface border-quiz-border hover:border-quiz-primary shadow-xl" 
                      : "bg-quiz-bg border-dashed border-quiz-border/50 opacity-40 grayscale"
                  )}
                >
                  {/* Glow Effect */}
                  {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-quiz-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className={cn(
                    "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 transition-all duration-500",
                    unlocked ? "bg-quiz-bg border border-quiz-border group-hover:scale-110 group-hover:rotate-6" : "bg-quiz-surface"
                  )}>
                    {unlocked ? a.emoji : <Lock className="w-6 h-6 text-quiz-text-muted" />}
                  </div>

                  <h4 className="text-xs md:text-sm font-black text-quiz-text-main uppercase tracking-tight mb-2">
                    {a.name}
                  </h4>
                  <p className="text-[10px] md:text-xs text-quiz-text-muted font-medium leading-relaxed">
                    {a.description}
                  </p>

                  {unlocked && (
                    <div className="absolute top-3 right-3">
                      <div className="w-2 h-2 rounded-full bg-quiz-primary shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsPanel;
