/**
 * EducationalFeedback.tsx
 * Componente de feedback educacional rico exibido após cada resposta.
 * Mostra: resultado, explicação, fato histórico complementar e fonte.
 */

import { CheckCircle2, XCircle, BookOpen, Lightbulb, Quote } from "lucide-react";

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
  nextLabel = "Próxima →",
}: EducationalFeedbackProps) {
  return (
    <div className="mt-6 animate-fade-in-up space-y-3">
      {/* Resultado */}
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${
          isCorrect
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <p className={`font-black text-base ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {isTimeout
              ? "Tempo esgotado! ⏰"
              : isCorrect
              ? "Correto! Excelente! 🎉"
              : "Não foi dessa vez! 😕"}
          </p>
          {!isCorrect && correctAnswerText && (
            <p className="text-sm text-white/50 mt-1">
              Resposta correta: <span className="text-white/80 font-semibold">{correctAnswerText}</span>
            </p>
          )}
        </div>
      </div>

      {/* Explicação */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
        <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-purple-100/80 leading-relaxed">{explanation}</p>
      </div>

      {/* Fato histórico complementar */}
      {historicalFact && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <BookOpen className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">
              📖 Fato Histórico
            </p>
            <p className="text-sm text-amber-100/80 leading-relaxed">{historicalFact}</p>
          </div>
        </div>
      )}

      {/* Fonte / Citação */}
      {source && (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/3 border border-white/10">
          <Quote className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/40 leading-relaxed italic">{source}</p>
        </div>
      )}

      {/* Botão de avançar */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default EducationalFeedback;
