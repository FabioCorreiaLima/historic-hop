import { useEffect } from "react";
import { RotateCcw, Star, ArrowRight, MapPin, Target, MessageCircle, Sparkles, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface Props {
  periodName: string;
  periodEmoji: string;
  correct: number;
  total: number;
  onNext: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
  hasNext: boolean;
  onChat?: () => void;
  characterName?: string;
  characterEmoji?: string;
}

const PeriodComplete = ({ periodName, periodEmoji, correct, total, onNext, onRetry, onBackToMap, hasNext, onChat, characterName, characterEmoji }: Props) => {
  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= 70;
  const stars = percentage >= 100 ? 3 : percentage >= 85 ? 2 : percentage >= 70 ? 1 : 0;

  useEffect(() => {
    if (passed) {
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#eab308", "#a16207", "#ffffff"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#eab308", "#a16207", "#ffffff"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [passed]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in-scale">
      <div className="bg-quiz-surface border border-quiz-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-quiz-primary/0 via-quiz-primary to-quiz-primary/0" />
        
        {/* Period Icon */}
        <div className={cn(
          "w-20 h-20 md:w-24 md:h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 md:mb-8 transition-all shadow-xl",
          passed ? "bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary" : "bg-quiz-wrong/10 border border-quiz-wrong/20 text-quiz-wrong"
        )}>
           {passed ? <Trophy className="w-10 h-10 md:w-12 md:h-12 animate-bounce" /> : <div className="text-4xl">💪</div>}
        </div>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quiz-surface border border-quiz-border mb-2">
            <Sparkles className="w-3 h-3 text-quiz-primary" />
            <span className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Período Concluído</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-quiz-text-main tracking-tight uppercase italic">
            {passed ? "História Conquistada!" : "Tente Novamente!"}
          </h2>
          <p className="text-xs md:text-sm text-quiz-text-muted font-black uppercase tracking-[0.2em]">
            {periodEmoji} {periodName}
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3 md:gap-4 mb-10">
          {[1, 2, 3].map(s => (
            <Star key={s} className={cn("w-10 h-10 md:w-14 md:h-14 transition-all duration-700", s <= stars ? "text-quiz-primary fill-quiz-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" : "text-quiz-border fill-quiz-surface")} />
          ))}
        </div>

        {/* Accuracy Box */}
        <div className="bg-quiz-bg border border-quiz-border rounded-2xl p-5 md:p-8 mb-8 md:mb-10 inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 mx-auto">
          <div className="flex items-center gap-3">
             <Target className="w-6 h-6 md:w-8 md:h-8 text-quiz-primary" />
             <div className="text-left">
                <p className="text-2xl md:text-4xl font-black text-quiz-text-main leading-none">{correct} / {total}</p>
                <p className="text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-widest mt-1">Acertos Totais</p>
             </div>
          </div>
          <div className="h-px md:h-10 w-full md:w-px bg-quiz-border" />
          <div className="text-left">
             <p className="text-xl md:text-2xl font-black text-quiz-primary leading-none">{percentage}%</p>
             <p className="text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-widest mt-1">Precisão</p>
          </div>
        </div>

        <p className="text-sm md:text-base text-quiz-text-muted font-medium mb-10 max-w-md mx-auto leading-relaxed">
          {passed
            ? percentage >= 85 ? "Incrível! Você dominou todos os detalhes históricos deste período. 🌟" : "Bom trabalho! Você atingiu o conhecimento necessário para avançar. ✅"
            : `Faltou pouco! Você precisa de 70% para consolidar este período no mapa. Atualmente: ${percentage}%`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {passed && hasNext && (
            <button onClick={onNext} className="w-full h-14 md:h-16 bg-quiz-primary text-black font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:bg-quiz-primary-dark transition-all shadow-xl shadow-quiz-primary/10 flex items-center justify-center gap-3 active:scale-95">
              PRÓXIMO PERÍODO <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {onChat && characterName && (
            <button onClick={onChat} className="w-full h-14 md:h-16 bg-quiz-surface border border-quiz-border text-quiz-text-main font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:border-quiz-primary transition-all flex items-center justify-center gap-3 active:scale-95">
              <MessageCircle className="w-5 h-5" /> FALAR COM {characterName} {characterEmoji}
            </button>
          )}
          <button onClick={onRetry} className="w-full h-14 md:h-16 bg-quiz-surface border border-quiz-border text-quiz-text-muted font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:text-quiz-text-main transition-all flex items-center justify-center gap-3">
            <RotateCcw className="w-4 h-4" /> REPETIR DESAFIO
          </button>
          <button onClick={onBackToMap} className="w-full h-12 text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-[0.2em] hover:text-quiz-primary transition-all flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> VOLTAR AO MAPA
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodComplete;
