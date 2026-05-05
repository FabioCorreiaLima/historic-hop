import { useState, useEffect, useMemo } from "react";
import { Check, Info } from "lucide-react";
import type { MatchingActivity } from "@/data/activities";

interface Props {
  activity: MatchingActivity;
  onComplete: (correct: boolean) => void;
}

const Matching = ({ activity, onComplete }: Props) => {
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);
  const [selectedRightIndex, setSelectedRightIndex] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set()); // IDs dos pares originais resolvidos
  const [matchedRightIndices, setMatchedRightIndices] = useState<Set<number>>(new Set()); // Índices da direita já usados
  const [showFeedback, setShowFeedback] = useState(false);
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

  // Prepara os itens com seus índices originais para não perder a referência
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
      // O par está correto se o texto da direita selecionado for igual ao texto esperado para o item da esquerda
      const expectedRightText = normalize(activity.pairs[selectedLeftIndex].right);
      const selectedRightText = normalize(activity.pairs[selectedRightIndex].right);

      if (expectedRightText === selectedRightText) {
        // Encontramos um par válido por texto! 
        // Vamos marcar o par original da esquerda como resolvido
        setMatchedPairs(prev => new Set(prev).add(selectedLeftIndex));
        
        // E marcar o índice visual da direita como usado
        const rightVisualIndex = rightItems.findIndex(item => 
          item.originalIndex === selectedRightIndex && !matchedRightIndices.has(rightItems.indexOf(item))
        );
        // Nota: O findIndex acima é um pouco redundante pois já temos o visualIdx no loop, 
        // mas aqui no useEffect precisamos encontrar qual botão da direita foi clicado.
        
        // Na verdade, o useEffect já sabe qual rightItem foi clicado via selectedRightIndex.
        // Mas como podem haver vários com o mesmo originalIndex (não, originalIndex é único), 
        // basta encontrar o índice visual dele.
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
  }, [selectedLeftIndex, selectedRightIndex, leftItems, rightItems]);

  useEffect(() => {
    if (leftItems.length > 0 && matchedPairs.size === leftItems.length) {
      onComplete(true);
    }
  }, [matchedPairs.size, leftItems.length, onComplete]);

  const isWrong = wrongPairIndices !== null;

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* instruction and image removed as they are now in the parent QuizGame header/area */}
      
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8">
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
