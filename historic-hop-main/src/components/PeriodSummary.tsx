/**
 * PeriodSummary.tsx
 * Resumo educacional do período histórico exibido ao final de cada fase.
 * Inclui: resultado, fatos coletados no caderno, e botões de navegação.
 */

import { Trophy, BookOpen, Star, RotateCcw, ChevronRight, Map } from "lucide-react";
import type { HistorianEntry } from "@/hooks/useHistorianNotebook";

interface PeriodSummaryProps {
  periodName: string;
  periodEmoji: string;
  summary: string;          // parágrafo de resumo do período
  correct: number;
  total: number;
  collectedFacts: HistorianEntry[];
  onNext: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
  onOpenNotebook: () => void;
  hasNext: boolean;
}

export function PeriodSummary({
  periodName,
  periodEmoji,
  summary,
  correct,
  total,
  collectedFacts,
  onNext,
  onRetry,
  onBackToMap,
  onOpenNotebook,
  hasNext,
}: PeriodSummaryProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const stars = percentage >= 100 ? 3 : percentage >= 85 ? 2 : percentage >= 70 ? 1 : 0;
  const passed = percentage >= 70;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-xl space-y-4 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10">
            {periodEmoji}
          </div>
          <h2 className="text-2xl font-black text-white">{periodName}</h2>
          <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-bold">
            Fase Concluída
          </p>
        </div>

        {/* Score card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${passed ? "text-amber-400" : "text-white/30"}`} />
              <span className="font-black text-white text-lg">{correct}/{total} corretas</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 transition-all ${s <= stars ? "text-amber-400 fill-amber-400" : "text-white/10"}`}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                passed ? "bg-gradient-to-r from-emerald-500 to-green-400" : "bg-gradient-to-r from-red-500 to-orange-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className={`text-sm font-bold mt-2 ${passed ? "text-emerald-400" : "text-red-400"}`}>
            {percentage}% — {passed ? "Aprovado! 🎉" : "Tente novamente para avançar"}
          </p>
        </div>

        {/* Period summary */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Resumo do Período
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{summary}</p>
        </div>

        {/* Collected facts */}
        {collectedFacts.length > 0 && (
          <div className="bg-white/3 border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📖</span>
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                  {collectedFacts.length} {collectedFacts.length === 1 ? "fato coletado" : "fatos coletados"}
                </span>
              </div>
              <button
                onClick={onOpenNotebook}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Ver caderno →
              </button>
            </div>
            <div className="space-y-2">
              {collectedFacts.slice(0, 2).map((f) => (
                <div key={f.id} className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">{f.emoji}</span>
                  <p className="text-xs text-white/50 leading-snug line-clamp-2">{f.fact}</p>
                </div>
              ))}
              {collectedFacts.length > 2 && (
                <p className="text-xs text-white/30 text-center">
                  + {collectedFacts.length - 2} mais no caderno
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {passed && hasNext && (
            <button
              onClick={onNext}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
            >
              Próximo Período
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              className="py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir
            </button>
            <button
              onClick={onBackToMap}
              className="py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4" />
              Mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeriodSummary;
