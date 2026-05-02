/**
 * HistorianNotebook.tsx
 * Caderno do Historiador — painel que exibe todos os fatos históricos
 * coletados pelo aluno ao longo do jogo.
 */

import { useState } from "react";
import { BookOpen, X, ChevronDown, ChevronUp, Trash2, Trophy } from "lucide-react";
import type { HistorianEntry } from "@/hooks/useHistorianNotebook";

interface HistorianNotebookProps {
  entries: HistorianEntry[];
  onClose: () => void;
  onClear?: () => void;
}

export function HistorianNotebook({ entries, onClose, onClear }: HistorianNotebookProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  // Períodos únicos
  const periods = Array.from(new Set(entries.map((e) => e.periodName)));

  const filtered =
    filterPeriod === "all" ? entries : entries.filter((e) => e.periodName === filterPeriod);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f172a] border border-amber-500/30 rounded-[2rem] shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Caderno do Historiador</h2>
              <p className="text-sm text-white/40">
                {entries.length} {entries.length === 1 ? "fato coletado" : "fatos coletados"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onClear && entries.length > 0 && (
              <button
                onClick={onClear}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                title="Limpar caderno"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter by period */}
        {periods.length > 1 && (
          <div className="px-6 pt-4 pb-2 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterPeriod("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                filterPeriod === "all"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              Todos
            </button>
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border truncate max-w-[150px] ${
                  filterPeriod === p
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Trophy className="w-16 h-16 text-amber-400/20 mb-4" />
              <h3 className="text-lg font-bold text-white/40">Caderno vazio</h3>
              <p className="text-sm text-white/30 mt-2 max-w-xs">
                Complete atividades para coletar fatos históricos no seu caderno!
              </p>
            </div>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-amber-500/20"
              >
                {/* Entry header */}
                <button
                  className="w-full flex items-start gap-3 p-4 text-left"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest truncate">
                        {entry.periodName}
                      </span>
                      <span className="text-[10px] text-white/20">•</span>
                      <span className="text-[10px] text-white/30">{formatDate(entry.collectedAt)}</span>
                    </div>
                    <p className="text-sm text-white/80 leading-snug line-clamp-2">{entry.fact}</p>
                  </div>
                  <div className="flex-shrink-0 ml-2 mt-1">
                    {expandedId === entry.id ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>

                {/* Expanded: source */}
                {expandedId === entry.id && entry.source && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <p className="text-xs text-white/40 italic leading-relaxed">
                      📚 {entry.source}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorianNotebook;
