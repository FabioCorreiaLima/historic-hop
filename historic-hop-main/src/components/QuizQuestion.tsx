import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion as QuizQuestionType } from "@/data/quizQuestions";

interface QuizQuestionProps {
  question: QuizQuestionType;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

const optionLetters = ["A", "B", "C", "D"];

const QuizQuestionComponent = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isCorrect = selectedIndex === question.correctIndex;

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
  };

  const handleNext = () => {
    onAnswer(isCorrect);
    setSelectedIndex(null);
    setShowFeedback(false);
  };

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pergunta {currentIndex + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
        <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-6 leading-snug">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => {
            let optionStyle =
              "border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer";

            if (showFeedback) {
              if (i === question.correctIndex) {
                optionStyle = "border-success bg-success/10 cursor-default";
              } else if (i === selectedIndex) {
                optionStyle = "border-destructive bg-destructive/10 cursor-default";
              } else {
                optionStyle = "border-border bg-muted/30 opacity-60 cursor-default";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${optionStyle}`}
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    showFeedback && i === question.correctIndex
                      ? "bg-success text-success-foreground"
                      : showFeedback && i === selectedIndex
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {optionLetters[i]}
                </span>
                <span className="text-card-foreground font-medium">{option}</span>
                {showFeedback && i === question.correctIndex && (
                  <CheckCircle2 className="ml-auto w-5 h-5 text-success flex-shrink-0" />
                )}
                {showFeedback && i === selectedIndex && i !== question.correctIndex && (
                  <XCircle className="ml-auto w-5 h-5 text-destructive flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-6 animate-fade-in-up">
            <div
              className={`flex items-start gap-3 p-4 rounded-xl ${
                isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <p className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? "Correto! 🎉" : "Errado! 😕"}
              </p>
            </div>

            <div className="flex items-start gap-3 mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="mt-5 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl py-5 text-base font-semibold"
            >
              {currentIndex + 1 < totalQuestions ? "Próxima Pergunta →" : "Ver Resultado →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionComponent;
