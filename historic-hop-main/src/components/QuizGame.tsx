import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Heart, 
  Timer, 
  Zap, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trophy,
  Flame
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import QuizActivityComponent from "./activities/QuizActivityComponent";
import FillBlank from "./activities/FillBlank";
import Matching from "./activities/Matching";
import ChronologicalOrder from "./activities/ChronologicalOrder";
import TrueFalse from "./activities/TrueFalse";
import EducationalFeedback from "./EducationalFeedback";
import { type Activity } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

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
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);

  const currentActivity = activities[currentIndex];

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
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
          className="w-16 h-16 rounded-3xl border-4 border-quiz-primary border-t-transparent mb-8"
        />
        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase text-quiz-text-main">Preparando Desafio</h2>
        <p className="text-quiz-text-muted font-medium">A IA está consultando os registros históricos...</p>
      </div>
    );
  }

  if (!currentActivity) return null;

  return (
    <div className="fixed inset-0 bg-quiz-bg text-quiz-text-main z-50 flex flex-col overflow-hidden font-sans">
      {/* Botão Sair flutuante */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-[70] p-3 rounded-full bg-quiz-surface border border-quiz-border text-quiz-text-muted hover:text-quiz-primary transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
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
          /* Fallback para outros tipos que ainda não foram refatorados para o novo layout de header interno */
          <div className="w-full max-w-2xl">
             {/* Header temporário para outros tipos */}
             <div className="flex justify-between mb-4">
                <div className="text-quiz-primary font-black">PONTOS: {score}</div>
                <div className="text-rose-500 font-black">COMBO: {combo}x</div>
             </div>
             
             <div className="bg-quiz-surface border border-quiz-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">{currentActivity.question || "Resolva o desafio"}</h2>
                {currentActivity.type === "true_false" && <TrueFalse activity={currentActivity} onComplete={handleAnswer} />}
                {currentActivity.type === "fill_blank" && <FillBlank activity={currentActivity} onComplete={handleAnswer} />}
                {currentActivity.type === "matching" && <Matching activity={currentActivity} onComplete={handleAnswer} />}
                {currentActivity.type === "chronological" && <ChronologicalOrder activity={currentActivity} onComplete={handleAnswer} />}
             </div>

             {showFeedback && (
               <div className="mt-6">
                 <EducationalFeedback 
                    isCorrect={isCorrect}
                    explanation={currentActivity.explanation || ""}
                    onNext={nextActivity}
                    nextLabel="CONTINUAR"
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
