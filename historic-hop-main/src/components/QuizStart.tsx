import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizStartProps {
  onStart: () => void;
}

const QuizStart = ({ onStart }: QuizStartProps) => {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        Quiz de História
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-2">
        Teste seus conhecimentos sobre a{" "}
        <span className="font-semibold text-secondary">
          Independência do Brasil
        </span>
        !
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        5 perguntas · Múltipla escolha · Feedback instantâneo
      </p>
      <Button
        onClick={onStart}
        size="lg"
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-10 py-6 rounded-xl shadow-lg animate-pulse-glow"
      >
        Começar Quiz
      </Button>
    </div>
  );
};

export default QuizStart;
