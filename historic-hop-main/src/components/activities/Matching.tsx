import { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import type { MatchingActivity } from "@/data/activities";

interface Props {
  activity: MatchingActivity;
  onComplete: (correct: boolean) => void;
}

const Matching = ({ activity, onComplete }: Props) => {
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);
  const [selectedRightIndex, setSelectedRightIndex] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [matchedRightIndices, setMatchedRightIndices] = useState<Set<number>>(new Set());
  const [wrongPairIndices, setWrongPairIndices] = useState<[number, number] | null>(null);

  const normalize = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
      return val.option || val.blank || val.text || val.value || val.answer || 
             Object.values(val).find(v => typeof v === 'string') || 
             JSON.stringify(val);
    }
    return String(val);
  };

  const leftItems = useMemo(() => 
    activity.pairs?.map((p, idx) => ({ text: normalize(p.left), originalIndex: idx })) ?? [], 
    [activity.pairs]
  );

  const rightItems = useMemo(() => {
    const items = activity.pairs?.map((p, idx) => ({ text: normalize(p.right), originalIndex: idx })) ?? [];
    return [...items].sort(() => Math.random() - 0.5);
  }, [activity.pairs]);

  useEffect(() => {
    if (selectedLeftIndex !== null && selectedRightIndex !== null) {
      const expectedRightText = normalize(activity.pairs[selectedLeftIndex].right);
      const selectedRightText = normalize(activity.pairs[selectedRightIndex].right);

      if (expectedRightText === selectedRightText) {
        setMatchedPairs(prev => new Set(prev).add(selectedLeftIndex));
        const vIdx = rightItems.findIndex(ri => ri.originalIndex === selectedRightIndex);
        setMatchedRightIndices(prev => new Set(prev).add(vIdx));
        setSelectedLeftIndex(null);
        setSelectedRightIndex(null);
      } else {
        setWrongPairIndices([selectedLeftIndex, selectedRightIndex]);
        setTimeout(() => {
          setSelectedLeftIndex(null);
          setSelectedRightIndex(null);
          setWrongPairIndices(null);
        }, 900);
      }
    }
  }, [selectedLeftIndex, selectedRightIndex, leftItems, rightItems, activity.pairs]);

  useEffect(() => {
    if (leftItems.length > 0 && matchedPairs.size === leftItems.length) {
      onComplete(true);
    }
  }, [matchedPairs.size, leftItems.length, onComplete]);

  const isWrong = wrongPairIndices !== null;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.has(item.originalIndex);
            const isSelected = selectedLeftIndex === item.originalIndex;
            const isError = wrongPairIndices?.[0] === item.originalIndex;

            return (
              <button
                key={`left-${item.originalIndex}`}
                disabled={isMatched || isWrong}
                onClick={() => setSelectedLeftIndex(item.originalIndex)}
                className={`p-4 rounded-xl border-2 text-xs md:text-sm font-bold transition-all text-left min-h-[70px] flex items-center justify-between gap-2
                  ${isMatched
                    ? "bg-quiz-correct/10 border-quiz-correct text-quiz-correct opacity-60"
                    : isError
                    ? "bg-quiz-wrong/10 border-quiz-wrong text-quiz-wrong"
                    : isSelected
                    ? "bg-quiz-primary/10 border-quiz-primary text-quiz-primary scale-105"
                    : "bg-quiz-surface border-quiz-border text-quiz-text-main hover:border-quiz-primary/50"}
                `}
              >
                <span>{item.text}</span>
                {isMatched && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Coluna Direita */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item, visualIdx) => {
            const isMatched = matchedRightIndices.has(visualIdx);
            const isSelected = selectedRightIndex === item.originalIndex;
            const isError = wrongPairIndices?.[1] === item.originalIndex;

            return (
              <button
                key={`right-${visualIdx}`}
                disabled={isMatched || isWrong}
                onClick={() => setSelectedRightIndex(item.originalIndex)}
                className={`p-4 rounded-xl border-2 text-xs md:text-sm font-bold transition-all text-left min-h-[70px] flex items-center justify-between gap-2
                  ${isMatched
                    ? "bg-quiz-correct/10 border-quiz-correct text-quiz-correct opacity-60"
                    : isError
                    ? "bg-quiz-wrong/10 border-quiz-wrong text-quiz-wrong"
                    : isSelected
                    ? "bg-quiz-primary/10 border-quiz-primary text-quiz-primary scale-105"
                    : "bg-quiz-surface border-quiz-border text-quiz-text-main hover:border-quiz-primary/50"}
                `}
              >
                <span>{item.text}</span>
                {isMatched && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Matching;
