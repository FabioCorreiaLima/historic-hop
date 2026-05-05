import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
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
    
    // Notifica o QuizGame imediatamente
    onComplete(correct);
  };

  const isCorrect = answer === activity.isTrue;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-xl">
             ⚖️
          </div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Verdadeiro ou Falso</p>
        </div>

        {/* Statement */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-8">
          <p className="text-xl md:text-2xl font-black text-white leading-tight text-center">
            "{activity.statement}"
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            disabled={showFeedback}
            className={cn(
              "duo-btn h-16 text-lg",
              showFeedback && answer === true
                ? isCorrect ? "duo-btn-success" : "duo-btn-danger"
                : showFeedback ? "opacity-30" : "duo-btn-success shadow-emerald-500/10"
            )}
          >
            <ThumbsUp className="w-5 h-5 mr-2" /> Verdadeiro
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={showFeedback}
            className={cn(
              "duo-btn h-16 text-lg",
              showFeedback && answer === false
                ? isCorrect ? "duo-btn-success" : "duo-btn-danger"
                : showFeedback ? "opacity-30" : "duo-btn-danger shadow-rose-500/10"
            )}
          >
            <ThumbsDown className="w-5 h-5 mr-2" /> Falso
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrueFalse;
