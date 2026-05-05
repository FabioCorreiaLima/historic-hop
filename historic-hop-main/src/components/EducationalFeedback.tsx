import { CheckCircle2, XCircle, BookOpen, Lightbulb, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface EducationalFeedbackProps {
  isCorrect: boolean;
  isTimeout?: boolean;
  correctAnswerText?: string;
  explanation: string;
  historicalFact?: string;
  source?: string;
  onNext: () => void;
  nextLabel?: string;
}

export function EducationalFeedback({
  isCorrect,
  isTimeout = false,
  correctAnswerText,
  explanation,
  historicalFact,
  source,
  onNext,
  nextLabel = "PRÓXIMA PERGUNTA",
}: EducationalFeedbackProps) {
  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Resultado Principal */}
      <div className={cn(
        "flex items-center gap-4 p-5 rounded-xl border-2 transition-all",
        isCorrect ? "bg-quiz-correct/10 border-quiz-correct/50" : "bg-quiz-wrong/10 border-quiz-wrong/50"
      )}>
        {isCorrect ? (
          <CheckCircle2 className="w-10 h-10 text-quiz-correct" />
        ) : (
          <XCircle className="w-10 h-10 text-quiz-wrong" />
        )}
        <div>
          <h4 className={cn(
            "text-xl font-black uppercase tracking-tight",
            isCorrect ? "text-quiz-correct" : "text-quiz-wrong"
          )}>
            {isTimeout ? "Tempo Esgotado!" : isCorrect ? "Você Acertou!" : "Resposta Errada"}
          </h4>
          <p className="text-quiz-text-muted text-sm italic leading-relaxed mt-1">
            {explanation}
          </p>
        </div>
      </div>

      {/* Fato Histórico Complementar */}
      {historicalFact && (
        <div className="p-5 rounded-xl bg-quiz-surface border border-quiz-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-quiz-primary" />
            <span className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Fato Complementar</span>
          </div>
          <p className="text-sm text-quiz-text-main/80 leading-relaxed">
            {historicalFact}
          </p>
          {source && (
            <p className="text-[10px] text-quiz-text-muted mt-3 italic">Fonte: {source}</p>
          )}
        </div>
      )}

      {/* Botão de avançar */}
      <button
        onClick={onNext}
        className="w-full bg-quiz-primary text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-quiz-primary-dark transition-all transform hover:translate-y-[-1px] active:translate-y-[0] shadow-lg shadow-quiz-primary/10"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default EducationalFeedback;
