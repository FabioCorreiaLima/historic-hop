import { useState, useMemo } from "react";
import { ArrowLeft, Target, BookOpen } from "lucide-react";
import type { Activity } from "@/data/activities";
import QuizActivityComponent from "./activities/QuizActivityComponent";
import ChronologicalOrder from "./activities/ChronologicalOrder";
import TrueFalse from "./activities/TrueFalse";
import FillBlank from "./activities/FillBlank";
import Matching from "./activities/Matching";
import { PeriodSummary } from "./PeriodSummary";
import { HistorianNotebook } from "./HistorianNotebook";
import { useHistorianNotebook } from "@/hooks/useHistorianNotebook";

interface Props {
  activities: Activity[];
  periodName: string;
  periodEmoji: string;
  periodId?: string;
  backgroundImage?: string;
  periodSummary?: string;
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

const ActivityRunner = ({
  activities,
  periodName,
  periodEmoji,
  periodId = "unknown",
  backgroundImage,
  periodSummary,
  onComplete,
  onBack,
  onNext,
  hasNext = false,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [sessionFacts, setSessionFacts] = useState<string[]>([]); // IDs dos fatos desta sessão

  const {
    entries,
    addFact,
    getFactsByPeriod,
    clearNotebook,
  } = useHistorianNotebook();

  const current = activities[currentIndex];
  const progress = (currentIndex / activities.length) * 100;

  const handleActivityComplete = (correct: boolean) => {
    const newCorrect = correct ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (currentIndex + 1 < activities.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Concluiu todas as atividades — mostra o resumo do período
      setShowSummary(true);
      onComplete(newCorrect, activities.length);
    }
  };

  /**
   * Chamado quando um fato histórico deve ser adicionado ao caderno
   */
  const handleFactCollected = (fact: string, source: string, emoji: string) => {
    if (!fact) return;
    const entry = addFact({
      periodId,
      periodName,
      fact,
      source,
      activityType: current?.type ?? "quiz",
      emoji,
    });
    setSessionFacts((prev) => [...prev, entry.id]);
  };

  const typeLabels: Record<string, string> = {
    quiz: "Múltipla Escolha",
    chronological: "Ordenação",
    true_false: "V ou F",
    fill_blank: "Completar",
    matching: "Associação",
  };

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".svg") ||
      url.includes("pollinations.ai")
    );
  };

  const finalBg = isImageUrl(backgroundImage) ? backgroundImage : "/map-bg.png";

  // Fatos coletados nesta sessão (para exibir no PeriodSummary)
  const sessionFactEntries = useMemo(
    () => entries.filter((e) => sessionFacts.includes(e.id)),
    [entries, sessionFacts]
  );

  // Resumo padrão se não vier do backend
  const defaultSummary =
    periodSummary ||
    `${periodName} foi um período importante da história do Brasil. Complete mais atividades para aprender mais sobre este período!`;

  // ─── Tela de Resumo do Período ─────────────────────────────────────────────
  if (showSummary) {
    return (
      <>
        <PeriodSummary
          periodName={periodName}
          periodEmoji={periodEmoji}
          summary={defaultSummary}
          correct={correctCount}
          total={activities.length}
          collectedFacts={sessionFactEntries}
          hasNext={hasNext}
          onNext={() => {
            setShowSummary(false);
            onNext?.();
          }}
          onRetry={() => {
            setShowSummary(false);
            setCurrentIndex(0);
            setCorrectCount(0);
            setSessionFacts([]);
          }}
          onBackToMap={onBack}
          onOpenNotebook={() => setShowNotebook(true)}
        />

        {showNotebook && (
          <HistorianNotebook
            entries={entries}
            onClose={() => setShowNotebook(false)}
            onClear={clearNotebook}
          />
        )}
      </>
    );
  }

  // ─── Jogo em andamento ─────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full relative pt-8 pb-20 overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url("${finalBg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Caderno do Historiador modal */}
      {showNotebook && (
        <HistorianNotebook
          entries={entries}
          onClose={() => setShowNotebook(false)}
          onClear={clearNotebook}
        />
      )}

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 flex flex-col">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={onBack}
              className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  Desafio Histórico
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {typeLabels[current?.type] || current?.type}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
                <span className="bg-white/5 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl shadow-inner border border-white/5">
                  {periodEmoji}
                </span>
                {periodName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Caderno button */}
              <button
                onClick={() => setShowNotebook(true)}
                className="relative p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                title="Abrir Caderno do Historiador"
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                {sessionFactEntries.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-[9px] font-black text-black flex items-center justify-center">
                    {sessionFactEntries.length}
                  </span>
                )}
              </button>

              {/* Score badge */}
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-base font-black text-emerald-400 tracking-tighter">
                  {correctCount}{" "}
                  <span className="text-xs text-emerald-400/50">/ {activities.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative pt-1">
            <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_infinite]" />
              </div>
            </div>
            <div className="flex justify-between mt-2 px-1 items-baseline">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-wider">
                Questão <span className="text-white">{currentIndex + 1}</span>{" "}
                <span className="opacity-50">de</span> {activities.length}
              </span>
              <div className="flex gap-1">
                {activities.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "bg-primary scale-125 shadow-[0_0_8px_var(--primary)]"
                        : i < currentIndex
                        ? "bg-emerald-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Component */}
        <div key={current?.id} className="animate-fade-in-scale">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-1 rounded-[2.5rem] shadow-2xl">
            {current?.type === "quiz" && (
              <QuizActivityComponent
                activity={current}
                onComplete={handleActivityComplete}
                onFactCollected={handleFactCollected}
              />
            )}
            {current?.type === "chronological" && (
              <ChronologicalOrder
                activity={current}
                onComplete={handleActivityComplete}
              />
            )}
            {current?.type === "true_false" && (
              <TrueFalse activity={current} onComplete={handleActivityComplete} />
            )}
            {current?.type === "fill_blank" && (
              <FillBlank activity={current} onComplete={handleActivityComplete} />
            )}
            {current?.type === "matching" && (
              <Matching activity={current} onComplete={handleActivityComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRunner;
