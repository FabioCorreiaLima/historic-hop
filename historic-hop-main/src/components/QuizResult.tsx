import { Trophy, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizResultProps {
  score: number;
  total: number;
  onRestart: () => void;
}

const QuizResult = ({ score, total, onRestart }: QuizResultProps) => {
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return { text: "Perfeito! Você é um gênio da História! 🏆", emoji: "🎯" };
    if (percentage >= 80) return { text: "Excelente! Você manda muito bem! 🌟", emoji: "🌟" };
    if (percentage >= 60) return { text: "Bom trabalho! Continue estudando! 📚", emoji: "📚" };
    if (percentage >= 40) return { text: "Você está no caminho certo! 💪", emoji: "💪" };
    return { text: "Não desista! Tente novamente! 🔄", emoji: "🔄" };
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up max-w-md">
      <div className="w-24 h-24 rounded-full bg-secondary/15 flex items-center justify-center mb-6">
        <Trophy className="w-12 h-12 text-secondary" />
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        Resultado
      </h2>

      <div className="my-6 relative">
        <div className="w-36 h-36 rounded-full border-8 border-primary/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">{score}</span>
            <span className="text-lg text-muted-foreground">/{total}</span>
          </div>
        </div>
        <div className="absolute -top-1 -right-1">
          <Star className="w-8 h-8 text-secondary fill-secondary" />
        </div>
      </div>

      <p className="text-lg text-foreground font-medium mb-2">
        Você acertou {score} de {total} perguntas
      </p>
      <p className="text-muted-foreground mb-8">{message.text}</p>

      <Button
        onClick={onRestart}
        size="lg"
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-10 py-6 rounded-xl shadow-lg"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Jogar Novamente
      </Button>
    </div>
  );
};

export default QuizResult;
