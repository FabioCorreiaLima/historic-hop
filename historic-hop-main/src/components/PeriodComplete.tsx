import { useEffect } from "react";
import { RotateCcw, Star, ArrowRight, MapPin, Target, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";

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
      const end = Date.now() + 2000;
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#a855f7", "#3b82f6", "#f59e0b", "#22c55e"] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#a855f7", "#3b82f6", "#f59e0b", "#22c55e"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [passed]);

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-in-scale">
      <div className="duo-card-flat p-6 md:p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
          passed ? "bg-gradient-to-br from-amber-100 to-amber-200" : "bg-destructive/10"
        }`}>
          <span className="text-4xl">{passed ? "🏆" : "💪"}</span>
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-1">
          {passed ? "Período Concluído!" : "Tente Novamente!"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">{periodEmoji} {periodName}</p>

        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <Star key={s} className={`w-10 h-10 transition-all duration-500 ${
              s <= stars ? "text-amber-400 fill-amber-400 drop-shadow-md animate-bounce-in" : "text-muted"
            }`} style={{ animationDelay: `${s * 0.2}s` }} />
          ))}
        </div>

        <div className="duo-card-flat p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Target className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-extrabold text-foreground">{correct}/{total}</span>
            <span className="text-sm text-muted-foreground">acertos ({percentage}%)</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {passed
            ? percentage >= 85 ? "Excelente! Você domina esse período! 🌟" : "Bom trabalho! Mínimo de 70% alcançado ✅"
            : `Você precisa de 70% para avançar. Fez ${percentage}%.`}
        </p>

        <div className="space-y-3">
          {passed && hasNext && (
            <button onClick={onNext} className="duo-btn duo-btn-primary w-full text-base py-4">
              Próximo Período <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {onChat && characterName && (
            <button onClick={onChat} className="duo-btn duo-btn-secondary w-full">
              <MessageCircle className="w-4 h-4" /> Conversar com {characterName} {characterEmoji}
            </button>
          )}
          <button onClick={onRetry} className="duo-btn duo-btn-secondary w-full">
            <RotateCcw className="w-4 h-4" /> Jogar Novamente
          </button>
          <button onClick={onBackToMap} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 py-2">
            <MapPin className="w-4 h-4" /> Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodComplete;
