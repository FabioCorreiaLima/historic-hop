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
  CheckCircle2
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
}

const QuizGame = ({ activities, isLoading, onComplete, onBack }: QuizGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(30);

  const currentActivity = activities[currentIndex];
  const progress = ((currentIndex) / activities.length) * 100;

  // Timer logic
  useEffect(() => {
    if (isLoading || showFeedback || !currentActivity) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isLoading, showFeedback, currentActivity]);

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      
      // Play success sound logic would go here
    } else {
      setCombo(0);
      // Play error sound logic
    }
  };

  const nextActivity = () => {
    setShowFeedback(false);
    setTimeLeft(30);
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(correctCount, activities.length);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-3xl border-4 border-primary border-t-transparent mb-8"
        />
        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Preparando Desafio</h2>
        <p className="text-muted-foreground font-medium">A IA está consultando os registros históricos...</p>
      </div>
    );
  }

  if (!currentActivity) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-50 z-50 flex flex-col overflow-hidden">
      {/* Quiz Header */}
      <header className="h-20 px-6 border-b border-white/10 flex items-center gap-6 max-w-5xl mx-auto w-full">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-6 h-6" />
        </Button>
        
        <div className="flex-1 px-4">
          <div className="flex justify-between items-end mb-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progresso</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{currentIndex + 1} de {activities.length}</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-slate-800" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
            <Heart className="w-4 h-4 fill-current" />
            <span className="font-black text-sm">3</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors",
            timeLeft < 10 ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse" : "bg-slate-800 text-slate-200 border-white/5"
          )}>
            <Timer className="w-4 h-4" />
            <span className="font-black text-sm w-4">{timeLeft}</span>
          </div>
        </div>
      </header>

      {/* Main Activity Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {/* Combo Indicator */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute top-4 right-12 flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-2xl text-white font-black shadow-xl shadow-amber-500/20 z-10"
              >
                <Zap className="w-5 h-5 fill-current" />
                COMBO x{combo}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
            <div className="mb-10">
               <Badge variant="outline" className="mb-4 font-black uppercase tracking-widest text-[10px] py-1 px-4">
                 {currentActivity.type.replace('_', ' ')}
               </Badge>
               <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1]">
                  {currentActivity.type === 'matching' ? 'Associe os conceitos corretamente' : 
                   currentActivity.type === 'chronological' ? 'Ordene os eventos no tempo' :
                   currentActivity.type === 'fill_blank' ? 'Complete as lacunas do texto' :
                   'Responda a pergunta abaixo'}
               </h2>
            </div>

            <div className="bg-white/5 rounded-[3rem] p-4 md:p-8 border border-white/10 backdrop-blur-md">
              {currentActivity.type === "quiz" && (
                <QuizActivityComponent activity={currentActivity} onComplete={handleAnswer} />
              )}
              {currentActivity.type === "true_false" && (
                <TrueFalse activity={currentActivity} onComplete={handleAnswer} />
              )}
              {currentActivity.type === "fill_blank" && (
                <FillBlank activity={currentActivity} onComplete={handleAnswer} />
              )}
              {currentActivity.type === "matching" && (
                <Matching activity={currentActivity} onComplete={handleAnswer} />
              )}
              {currentActivity.type === "chronological" && (
                <ChronologicalOrder activity={currentActivity} onComplete={handleAnswer} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Feedback Bar */}
      <AnimatePresence>
        {showFeedback && (
          <motion.footer 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 p-6 md:p-8 z-[60] border-t-4 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl",
              isCorrect 
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-200" 
                : "bg-rose-950/90 border-rose-500 text-rose-200"
            )}
          >
            <div className="max-w-3xl mx-auto">
              <EducationalFeedback 
                isCorrect={isCorrect}
                explanation={currentActivity.explanation || ""}
                historicalFact={(currentActivity as any).historicalFact || (currentActivity as any).content?.explanation}
                source={(currentActivity as any).source}
                onNext={nextActivity}
                nextLabel={currentIndex === activities.length - 1 ? "Finalizar Trilha →" : "Continuar Desafio →"}
                correctAnswerText={!isCorrect ? "Veja a explicação abaixo" : undefined}
              />
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;
