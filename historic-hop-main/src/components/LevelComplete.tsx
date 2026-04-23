import { useEffect } from "react";
import { Trophy, RotateCcw, Star, ArrowRight, MapPin, Zap, Target, Clock } from "lucide-react";
import confetti from "canvas-confetti";

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
      // Fire confetti!
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#a855f7", "#3b82f6", "#f59e0b", "#22c55e"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#a855f7", "#3b82f6", "#f59e0b", "#22c55e"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [passed]);

  const avgTime = totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-in-scale">
      <div className="glass-strong rounded-3xl p-6 md:p-8 text-center">
        {/* Trophy / Icon */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
          passed ? "bg-accent/20 glow-accent" : "bg-destructive/20"
        }`}>
          {passed ? (
            <Trophy className="w-10 h-10 text-accent" />
          ) : (
            <Target className="w-10 h-10 text-destructive" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1">
          {passed ? "Nível Concluído! 🎉" : "Tente Novamente!"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Nível {level} — {topic}
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              className={`w-8 h-8 transition-all duration-500 ${
                s <= stars
                  ? "text-accent fill-accent drop-shadow-lg animate-bounce-in"
                  : "text-muted-foreground/20"
              }`}
              style={{ animationDelay: `${s * 0.2}s` }}
            />
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-xl p-3">
            <Target className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{correctAnswers}/{totalQuestions}</p>
            <p className="text-xs text-muted-foreground">Acertos</p>
          </div>
          <div className="glass rounded-xl p-3">
            <Star className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Pontos</p>
          </div>
          <div className="glass rounded-xl p-3">
            <Zap className="w-4 h-4 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">x{maxCombo}</p>
            <p className="text-xs text-muted-foreground">Maior Combo</p>
          </div>
          <div className="glass rounded-xl p-3">
            <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{avgTime}s</p>
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
          </div>
        </div>

        {/* Progress text */}
        <p className="text-sm text-muted-foreground mb-6">
          {passed
            ? percentage >= 85 ? "Excelente! Você domina esse tema! 🌟" : "Bom trabalho! Mínimo de 70% alcançado! ✅"
            : `Você precisa de 70% para avançar. Você fez ${percentage}%.`
          }
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {passed && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full glass-option !bg-primary/20 !border-primary/40 hover:!bg-primary/30 rounded-xl py-4 font-semibold text-foreground flex items-center justify-center gap-2 glow-primary"
            >
              Próximo Nível <ArrowRight className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={onRetry}
            className="w-full glass-option rounded-xl py-3.5 font-medium text-foreground flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Jogar Novamente
          </button>
          
          <button
            onClick={onBackToMap}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 py-2"
          >
            <MapPin className="w-4 h-4" /> Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
