import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { TrueFalseActivity } from "@/data/activities";
import { cn } from "@/lib/utils";

interface Props {
  activity: TrueFalseActivity;
  onComplete: (correct: boolean) => void;
}

const TrueFalse = ({ activity, onComplete }: Props) => {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (value: boolean) => {
    if (showFeedback) return;
    setAnswer(value);
    setShowFeedback(true);
    const correct = value === activity.isTrue;
    if (correct) playCorrectSound();
    else playWrongSound();
    onComplete(correct);
  };

  const isCorrect = answer === activity.isTrue;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="p-5 md:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-quiz-primary/10 flex items-center justify-center border border-quiz-primary/20 text-xl">
             ⚖️
          </div>
          <p className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Verdadeiro ou Falso</p>
        </div>

        <div className="bg-quiz-surface border border-quiz-border rounded-[12px] p-8 mb-8 shadow-xl">
          <p className="text-xl md:text-2xl font-bold text-quiz-text-main leading-tight text-center italic">
            "{activity.statement}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            disabled={showFeedback}
            className={cn(
              "flex items-center justify-center gap-3 h-16 rounded-xl font-black transition-all border-2",
              showFeedback && answer === true
                ? (isCorrect ? "bg-quiz-correct/20 border-quiz-correct text-quiz-correct" : "bg-quiz-wrong/20 border-quiz-wrong text-quiz-wrong")
                : showFeedback ? "opacity-30 border-quiz-border text-quiz-text-muted" : "bg-quiz-correct/10 border-quiz-correct/50 text-quiz-correct hover:bg-quiz-correct/20"
            )}
          >
            <ThumbsUp className="w-6 h-6" /> VERDADEIRO
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={showFeedback}
            className={cn(
              "flex items-center justify-center gap-3 h-16 rounded-xl font-black transition-all border-2",
              showFeedback && answer === false
                ? (isCorrect ? "bg-quiz-correct/20 border-quiz-correct text-quiz-correct" : "bg-quiz-wrong/20 border-quiz-wrong text-quiz-wrong")
                : showFeedback ? "opacity-30 border-quiz-border text-quiz-text-muted" : "bg-quiz-wrong/10 border-quiz-wrong/50 text-quiz-wrong hover:bg-quiz-wrong/20"
            )}
          >
            <ThumbsDown className="w-6 h-6" /> FALSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrueFalse;
