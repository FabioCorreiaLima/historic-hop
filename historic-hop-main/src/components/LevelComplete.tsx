import { useEffect } from "react";
import { Trophy, RotateCcw, Star, ArrowRight, MapPin, Zap, Target, Clock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface LevelCompleteProps {
  level: number;
  topic: string;
  passed: boolean;
  stars: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  maxCombo: number;
  timeSpent: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
  hasNextLevel: boolean;
}

const LevelComplete = ({
  level,
  topic,
  passed,
  stars,
  percentage,
  correctAnswers,
  totalQuestions,
  totalPoints,
  maxCombo,
  timeSpent,
  onNextLevel,
  onRetry,
  onBackToMap,
  hasNextLevel,
}: LevelCompleteProps) => {
  useEffect(() => {
    if (passed) {
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#eab308", "#a16207", "#ffffff"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#eab308", "#a16207", "#ffffff"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [passed]);

  const avgTime = totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in-scale">
      <div className="bg-quiz-surface border border-quiz-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-quiz-primary/0 via-quiz-primary to-quiz-primary/0" />
        
        {/* Header Icon */}
        <div className={cn(
          "w-20 h-20 md:w-24 md:h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 md:mb-8 transition-all shadow-xl",
          passed ? "bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary" : "bg-quiz-wrong/10 border border-quiz-wrong/20 text-quiz-wrong"
        )}>
          {passed ? (
            <Trophy className="w-10 h-10 md:w-12 md:h-12 animate-bounce" />
          ) : (
            <Target className="w-10 h-10 md:w-12 md:h-12" />
          )}
        </div>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quiz-surface border border-quiz-border mb-2">
            <Sparkles className="w-3 h-3 text-quiz-primary" />
            <span className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Nível {level} Concluído</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-quiz-text-main tracking-tight uppercase">
            {passed ? "Excelente Vitória!" : "Tente Novamente!"}
          </h2>
          <p className="text-xs md:text-sm text-quiz-text-muted font-medium uppercase tracking-widest">
            {topic}
          </p>
        </div>

        {/* Stars Section */}
        <div className="flex justify-center gap-3 md:gap-4 mb-10 md:mb-12">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              className={cn(
                "w-10 h-10 md:w-14 md:h-14 transition-all duration-700",
                s <= stars
                  ? "text-quiz-primary fill-quiz-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  : "text-quiz-border fill-quiz-surface"
              )}
            />
          ))}
        </div>

        {/* Stats Grid - Fluid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
          <StatBox icon={<Target className="text-quiz-primary" />} value={`${correctAnswers}/${totalQuestions}`} label="Acertos" />
          <StatBox icon={<Trophy className="text-quiz-primary" />} value={totalPoints} label="Pontos" />
          <StatBox icon={<Zap className="text-quiz-primary" />} value={`x${maxCombo}`} label="Combo Máx" />
          <StatBox icon={<Clock className="text-quiz-primary" />} value={`${avgTime}s`} label="Média/Q" />
        </div>

        {/* Motivation Text */}
        <p className="text-sm md:text-base text-quiz-text-muted font-medium mb-10 md:mb-12 leading-relaxed max-w-md mx-auto">
          {passed
            ? percentage >= 85 ? "Mestre historiador! Você demonstrou conhecimento absoluto sobre este tema. 🌟" : "Ótimo desempenho! Você atingiu a precisão necessária para avançar. ✅"
            : `Faltou pouco! Você precisa de 70% de precisão para desbloquear o próximo desafio. Atualmente: ${percentage}%.`
          }
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {passed && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full h-14 md:h-16 bg-quiz-primary text-black font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:bg-quiz-primary-dark transition-all shadow-xl shadow-quiz-primary/10 flex items-center justify-center gap-3 active:scale-95"
            >
              PRÓXIMO DESAFIO <ArrowRight className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={onRetry}
            className="w-full h-14 md:h-16 bg-quiz-surface border border-quiz-border text-quiz-text-main font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:border-quiz-primary transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> REPETIR NÍVEL
          </button>
          
          <button
            onClick={onBackToMap}
            className="w-full h-12 text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-[0.2em] hover:text-quiz-primary transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" /> VOLTAR AO MAPA
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
  <div className="bg-quiz-bg border border-quiz-border rounded-2xl p-4 md:p-5 flex flex-col items-center gap-1 hover:border-quiz-primary/30 transition-all">
    <div className="mb-1">{icon}</div>
    <p className="text-base md:text-lg font-black text-quiz-text-main leading-none">{value}</p>
    <p className="text-[9px] md:text-[10px] font-black text-quiz-text-muted uppercase tracking-widest mt-1">{label}</p>
  </div>
);

export default LevelComplete;
