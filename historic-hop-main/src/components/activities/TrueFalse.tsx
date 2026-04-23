import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { TrueFalseActivity } from "@/data/activities";

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
    if (value === activity.isTrue) playCorrectSound();
    else playWrongSound();
  };

  const isCorrect = answer === activity.isTrue;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <div className="duo-card-flat p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="text-lg">⚖️</span>
          </div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Verdadeiro ou Falso</p>
        </div>

        {/* Statement */}
        <div className="duo-card-flat p-5 mb-6">
          <p className="text-lg font-bold text-foreground leading-relaxed text-center">
            "{activity.statement}"
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => handleAnswer(true)}
            disabled={showFeedback}
            className={`duo-btn w-full text-lg py-5 ${
              showFeedback && answer === true
                ? isCorrect ? "duo-btn-success" : "duo-btn-danger"
                : showFeedback ? "duo-btn-secondary opacity-50" : "duo-btn-success"
            }`}
          >
            <ThumbsUp className="w-5 h-5" /> Verdadeiro
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={showFeedback}
            className={`duo-btn w-full text-lg py-5 ${
              showFeedback && answer === false
                ? isCorrect ? "duo-btn-success" : "duo-btn-danger"
                : showFeedback ? "duo-btn-secondary opacity-50" : "duo-btn-danger"
            }`}
          >
            <ThumbsDown className="w-5 h-5" /> Falso
          </button>
        </div>

        {/* Feedback */}
        {showFeedback && (
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
                  {isCorrect ? "Correto! 🎉" : "Errado! 😕"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-red-600 mt-1">
                    A resposta correta é: <strong>{activity.isTrue ? "Verdadeiro" : "Falso"}</strong>
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

export default TrueFalse;
