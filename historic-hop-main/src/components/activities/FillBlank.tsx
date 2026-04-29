import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, PenLine } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { FillBlankActivity } from "@/data/activities";

interface Props {
  activity: FillBlankActivity;
  onComplete: (correct: boolean) => void;
}

const FillBlank = ({ activity, onComplete }: Props) => {
  let normalizedText = activity.textWithBlanks.includes("__BLANK__")
    ? activity.textWithBlanks
    : activity.textWithBlanks.replace(/\[BLANK\]|\{\{blank\}\}|___+/gi, "__BLANK__");
  
  // Se ainda não houver marcadores mas houver lacunas definidas, adiciona ao final
  if (!normalizedText.includes("__BLANK__") && activity.blanks.length > 0) {
    normalizedText += " " + "__BLANK__ ".repeat(activity.blanks.length).trim();
  }
  const parts = normalizedText.split("__BLANK__");
  const blankCount = Math.max(parts.length - 1, activity.blanks.length);
  const safeBlanks = activity.blanks.slice(0, blankCount);
  while (safeBlanks.length < blankCount) safeBlanks.push("");

  const initialOptions =
    activity.options.length > 0 ? [...activity.options] : safeBlanks.filter(Boolean);

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
  const [isCorrect, setIsCorrect] = useState(false);

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
    setIsCorrect(correct);
    setChecked(true);
    if (correct) playCorrectSound();
    else playWrongSound();
  };

  const allFilled = selectedOptions.every(o => o !== null);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="duo-card-flat p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Complete o Texto</p>
        </div>

        {/* Text with blanks */}
        <div className="duo-card-flat p-5 mb-5">
          <p className="text-base leading-relaxed text-foreground">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <button
                    onClick={() => handleRemoveFromBlank(i)}
                    className={`blank-slot ${
                      selectedOptions[i] ? "filled" : ""
                    } ${
                      checked && selectedOptions[i] === safeBlanks[i] ? "correct-slot" : ""
                    } ${
                      checked && selectedOptions[i] && selectedOptions[i] !== safeBlanks[i] ? "incorrect-slot" : ""
                    }`}
                  >
                    {selectedOptions[i] || "___"}
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Available options */}
        {!checked && (
          <div className="flex flex-wrap gap-2 mb-5">
            {availableOptions.map((option, idx) => (
              <button
                key={`${option}-${idx}`}
                onClick={() => handleSelectOption(option)}
                className="duo-btn duo-btn-secondary text-sm py-2 px-4"
                disabled={currentBlankIndex === -1}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Check / Feedback */}
        {!checked ? (
          <button
            onClick={checkAnswer}
            disabled={!allFilled}
            className="duo-btn duo-btn-primary w-full"
          >
            Verificar
          </button>
        ) : (
          <div className="animate-fade-in-up">
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-3 ${
              isCorrect ? "bg-emerald-50 border-2 border-emerald-200" : "bg-red-50 border-2 border-red-200"
            }`}>
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className={`font-bold ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                  {isCorrect ? "Perfeito! 🎉" : "Quase lá! 😕"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-red-600 mt-1">
                    Resposta correta: {safeBlanks.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border-2 border-purple-200 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-800 leading-relaxed">{activity.explanation}</p>
            </div>

            <button onClick={() => onComplete(isCorrect)} className="duo-btn duo-btn-primary w-full">
              Continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillBlank;
