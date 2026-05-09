import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
} from "lucide-react";
import QuizActivityComponent from "./activities/QuizActivityComponent";
import FillBlank from "./activities/FillBlank";
import Matching from "./activities/Matching";
import ChronologicalOrder from "./activities/ChronologicalOrder";
import TrueFalse from "./activities/TrueFalse";
import EducationalFeedback from "./EducationalFeedback";
import { type Activity } from "@/types";

interface QuizGameProps {
  periodId: string;
  activities: Activity[];
  isLoading: boolean;
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
  periodName?: string;
}

const QuizGame = ({ activities, isLoading, onComplete, onBack, periodName = "Brasil Colônia" }: QuizGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);

  const currentActivity = activities[currentIndex];

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore(prev => prev + (10 * newCombo));
    } else {
      setCombo(0);
    }
  };

  const nextActivity = () => {
    setShowFeedback(false);
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(correctCount, activities.length);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-quiz-bg z-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 md:w-16 md:h-16 rounded-3xl border-4 border-quiz-primary border-t-transparent mb-6 md:mb-8"
        />
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 uppercase text-quiz-text-main">Preparando Desafio</h2>
        <p className="text-quiz-text-muted text-sm md:text-base font-medium">A IA está consultando os registros históricos...</p>
      </div>
    );
  }

  if (!currentActivity) return null;

  return (
    <div className="fixed inset-0 bg-quiz-bg text-quiz-text-main z-50 flex flex-col overflow-y-auto md:overflow-hidden font-sans pt-16 md:pt-0">
      {/* Botão Sair flutuante */}
      <button 
        onClick={onBack}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-[70] p-2.5 md:p-3 rounded-xl md:rounded-full bg-quiz-surface border border-quiz-border text-quiz-text-muted hover:text-quiz-primary transition-all shadow-xl"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <main className="min-h-full flex flex-col items-center justify-center py-8 md:py-4 px-4">
        {currentActivity.type === "quiz" ? (
          <QuizActivityComponent 
            activity={currentActivity} 
            onComplete={handleAnswer}
            onNext={nextActivity}
            isLast={currentIndex === activities.length - 1}
            score={score}
            combo={combo}
            periodName={periodName}
          />
        ) : (
          <div className="w-full max-w-2xl px-4">
             {/* Header para outros tipos (também responsivo) */}
             <div className="flex justify-between items-center mb-6 bg-quiz-surface/50 p-3 rounded-xl border border-quiz-border">
                <div className="text-quiz-primary font-black text-xs md:text-sm">PONTOS: {score}</div>
                <div className="text-rose-500 font-black text-xs md:text-sm uppercase tracking-tighter flex items-center gap-1">
                  COMBO: {combo}x
                </div>
             </div>
             
             <div className="bg-quiz-surface border border-quiz-border rounded-2xl p-6 md:p-8 shadow-2xl">
                <h2 className="text-lg md:text-2xl font-bold mb-6 leading-tight">{currentActivity.question || "Resolva o desafio"}</h2>
                <div className="space-y-6">
                  {currentActivity.type === "true_false" && <TrueFalse activity={currentActivity} onComplete={handleAnswer} />}
                  {currentActivity.type === "fill_blank" && <FillBlank activity={currentActivity} onComplete={handleAnswer} />}
                  {currentActivity.type === "matching" && <Matching activity={currentActivity} onComplete={handleAnswer} />}
                  {currentActivity.type === "chronological" && <ChronologicalOrder activity={currentActivity} onComplete={handleAnswer} />}
                </div>
             </div>

             {showFeedback && (
               <div className="mt-6 md:mt-8">
                 <EducationalFeedback 
                    isCorrect={isCorrect}
                    explanation={currentActivity.explanation || ""}
                    onNext={nextActivity}
                    nextLabel={currentIndex === activities.length - 1 ? "FINALIZAR" : "PRÓXIMO"}
                 />
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizGame;
