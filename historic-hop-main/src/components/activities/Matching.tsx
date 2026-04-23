import { useState, useEffect, useMemo } from "react";
import { Check, Info } from "lucide-react";
import type { MatchingActivity } from "@/data/activities";

interface Props {
  activity: MatchingActivity;
  onComplete: (correct: boolean) => void;
}

const Matching = ({ activity, onComplete }: Props) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);

  const leftItems = useMemo(() => activity.pairs?.map(p => p.left) ?? [], [activity.pairs]);
  const rightItems = useMemo(() => [...(activity.pairs?.map(p => p.right) ?? [])].sort(() => Math.random() - 0.5), [activity.pairs]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const pair = activity.pairs?.find(p => p.left === selectedLeft && p.right === selectedRight);

      if (pair) {
        setMatches(prev => ({ ...prev, [selectedLeft]: selectedRight }));
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setWrongPair([selectedLeft, selectedRight]);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPair(null);
        }, 900);
      }
    }
  }, [selectedLeft, selectedRight, activity.pairs]);

  useEffect(() => {
    if (leftItems.length > 0 && Object.keys(matches).length === leftItems.length) {
      setShowFeedback(true);
    }
  }, [matches, leftItems.length]);

  const isWrong = wrongPair !== null;

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <h3 className="text-xl md:text-2xl font-black text-white mb-6 leading-tight">
        {activity.instruction}
      </h3>

      {activity.imageUrl && (
        <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-48">
          <img
            src={activity.imageUrl}
            alt="Imagem da atividade"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8">
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = !!matches[item];
            const isSelected = selectedLeft === item;
            const isError = wrongPair?.[0] === item;

            return (
              <button
                key={item}
                disabled={isMatched || isWrong}
                onClick={() => setSelectedLeft(item)}
                className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all text-left min-h-[70px] flex items-center justify-between gap-2
                  ${isMatched
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-60"
                    : isError
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : isSelected
                    ? "bg-primary/20 border-primary text-primary scale-105"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"}
                `}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Coluna Direita */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = Object.values(matches).includes(item);
            const isSelected = selectedRight === item;
            const isError = wrongPair?.[1] === item;

            return (
              <button
                key={item}
                disabled={isMatched || isWrong}
                onClick={() => setSelectedRight(item)}
                className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all text-left min-h-[70px] flex items-center justify-between gap-2
                  ${isMatched
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-60"
                    : isError
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : isSelected
                    ? "bg-primary/20 border-primary text-primary scale-105"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"}
                `}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="mt-4 animate-fade-in-up">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-emerald-400">Perfeito! Todas as associações corretas.</h4>
            </div>
            <div className="flex gap-3 text-emerald-400/80">
              <Info className="w-5 h-5 shrink-0 mt-1" />
              <p className="text-sm font-medium leading-relaxed">{activity.explanation}</p>
            </div>
          </div>

          <button
            onClick={() => onComplete(true)}
            className="w-full py-5 rounded-[2rem] bg-emerald-500 text-white font-black text-lg hover:bg-emerald-600 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95"
          >
            CONTINUAR
          </button>
        </div>
      )}
    </div>
  );
};

export default Matching;
