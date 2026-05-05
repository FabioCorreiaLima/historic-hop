import { useState } from "react";
import { PenLine } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { FillBlankActivity } from "@/data/activities";
import { cn } from "@/lib/utils";

interface Props {
  activity: FillBlankActivity;
  onComplete: (correct: boolean) => void;
  onFactCollected?: (fact: string, source: string, emoji: string) => void;
}

const FillBlank = ({ activity, onComplete, onFactCollected }: Props) => {
  let normalizedText = activity.textWithBlanks.replace(/\[BLANK\]|\{\{blank\}\}|___\+|__\d+__/gi, "__BLANK__");
  
  if (!normalizedText.includes("__BLANK__") && activity.blanks.length > 0) {
    normalizedText += " " + "__BLANK__ ".repeat(activity.blanks.length).trim();
  }
  const parts = normalizedText.split("__BLANK__");
  const blankCount = Math.max(parts.length - 1, activity.blanks.length);
  
  const normalizeOption = (opt: any): string => {
    if (typeof opt === 'string') return opt;
    if (opt && typeof opt === 'object') {
      return opt.option || opt.blank || opt.text || opt.value || opt.answer || 
             Object.values(opt).find(v => typeof v === 'string') || 
             JSON.stringify(opt);
    }
    return String(opt);
  };

  const safeBlanks = activity.blanks
    .slice(0, blankCount)
    .map(normalizeOption)
    .map(s => s.match(/^__\d+__$/) ? "" : s);
  
  while (safeBlanks.length < blankCount) safeBlanks.push("");

  const initialOptions = (activity.options.length > 0 ? activity.options : activity.blanks.filter(Boolean))
    .map(normalizeOption);

  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>(
    Array.from({ length: blankCount }, () => null)
  );
  const [availableOptions, setAvailableOptions] = useState(() => {
    const shuffled = [...initialOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [checked, setChecked] = useState(false);

  const currentBlankIndex = selectedOptions.findIndex(o => o === null);

  const handleSelectOption = (option: string) => {
    if (checked || currentBlankIndex === -1) return;
    const newSelected = [...selectedOptions];
    newSelected[currentBlankIndex] = option;
    setSelectedOptions(newSelected);
    setAvailableOptions((prev) => {
      const idx = prev.indexOf(option);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const handleRemoveFromBlank = (index: number) => {
    if (checked) return;
    const removed = selectedOptions[index];
    if (!removed) return;
    const newSelected = [...selectedOptions];
    newSelected[index] = null;
    setSelectedOptions(newSelected);
    setAvailableOptions(prev => [...prev, removed]);
  };

  const checkAnswer = () => {
    const correct = selectedOptions.every((opt, i) => opt === safeBlanks[i]);
    setChecked(true);
    if (correct) playCorrectSound();
    else playWrongSound();
    
    const fact = (activity as any).historicalFact;
    const source = (activity as any).source;
    if (fact && onFactCollected) {
      onFactCollected(fact, source ?? "", "📝");
    }

    onComplete(correct);
  };

  const allFilled = selectedOptions.every(o => o !== null);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="p-5 md:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-quiz-primary/10 flex items-center justify-center border border-quiz-primary/20">
            <PenLine className="w-5 h-5 text-quiz-primary" />
          </div>
          <p className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Complete o Texto</p>
        </div>

        <div className="bg-quiz-surface border border-quiz-border rounded-[12px] p-6 md:p-10 mb-8 shadow-xl">
          <p className="text-base md:text-lg leading-relaxed text-quiz-text-main font-medium">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <button
                    onClick={() => handleRemoveFromBlank(i)}
                    className={cn(
                      "inline-flex items-center justify-center min-w-[80px] h-9 mx-1 px-3 rounded-xl border-2 transition-all font-black text-xs",
                      !selectedOptions[i] ? "border-dashed border-quiz-border bg-quiz-bg/50 text-quiz-text-muted" : 
                      checked ? (selectedOptions[i] === safeBlanks[i] ? "border-quiz-correct bg-quiz-correct/10 text-quiz-correct" : "border-quiz-wrong bg-quiz-wrong/10 text-quiz-wrong") :
                      "border-quiz-primary/50 bg-quiz-primary/10 text-quiz-primary"
                    )}
                  >
                    {selectedOptions[i] || "___"}
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>

        {!checked && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {availableOptions.map((option, idx) => (
              <button
                key={`${option}-${idx}`}
                onClick={() => handleSelectOption(option)}
                className="bg-quiz-surface border-2 border-quiz-border text-quiz-text-main px-6 py-3 rounded-xl font-bold hover:border-quiz-primary hover:scale-[1.05] transition-all active:scale-95 text-sm"
                disabled={currentBlankIndex === -1}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {!checked && (
          <button
            onClick={checkAnswer}
            disabled={!allFilled}
            className="w-full h-16 bg-quiz-primary text-black font-black rounded-xl text-lg hover:bg-quiz-primary-dark transition-all shadow-lg shadow-quiz-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            VERIFICAR RESPOSTA
          </button>
        )}
      </div>
    </div>
  );
};

export default FillBlank;
