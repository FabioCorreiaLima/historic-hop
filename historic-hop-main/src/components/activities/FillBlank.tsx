import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, PenLine } from "lucide-react";
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
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <PenLine className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Complete o Texto</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 mb-8">
          <p className="text-base md:text-lg leading-relaxed text-white/90">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <button
                    onClick={() => handleRemoveFromBlank(i)}
                    className={cn(
                      "inline-flex items-center justify-center min-w-[80px] h-9 mx-1 px-3 rounded-xl border-2 transition-all font-bold text-sm",
                      !selectedOptions[i] ? "border-dashed border-white/20 bg-white/5 text-white/20" : 
                      checked ? (selectedOptions[i] === safeBlanks[i] ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-rose-500 bg-rose-500/10 text-rose-400") :
                      "border-primary/50 bg-primary/10 text-white"
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
                className="duo-btn h-12 px-6 text-sm bg-slate-800 border-white/10 text-white hover:bg-slate-700"
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
            className="duo-btn duo-btn-primary w-full h-16 text-lg"
          >
            Verificar Resposta
          </button>
        )}
      </div>
    </div>
  );
};

export default FillBlank;
