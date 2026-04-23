import { useState, useMemo } from "react";
import { ArrowLeft, Star, Zap, Target } from "lucide-react";
import type { Activity } from "@/data/activities";
import QuizActivityComponent from "./activities/QuizActivityComponent";
import ChronologicalOrder from "./activities/ChronologicalOrder";
import TrueFalse from "./activities/TrueFalse";
import FillBlank from "./activities/FillBlank";
import Matching from "./activities/Matching";

interface Props {
  activities: Activity[];
  periodName: string;
  periodEmoji: string;
  backgroundImage?: string;
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

const ActivityRunner = ({ activities, periodName, periodEmoji, backgroundImage, onComplete, onBack }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const current = activities[currentIndex];
  const progress = ((currentIndex) / activities.length) * 100;

  const handleActivityComplete = (correct: boolean) => {
    const newCorrect = correct ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (currentIndex + 1 < activities.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newCorrect, activities.length);
    }
  };

  // Activity type label
  const typeLabels: Record<string, string> = {
    quiz: "Múltipla Escolha",
    chronological: "Ordenação",
    true_false: "V ou F",
    fill_blank: "Completar",
    matching: "Associação",
  };

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.svg') || url.includes('pollinations.ai');
  };

  const finalBg = isImageUrl(backgroundImage) ? backgroundImage : "/map-bg.png";

  return (
    <div 
      className="min-h-screen w-full relative pt-8 pb-20 overflow-x-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("${finalBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 flex flex-col h-[90vh]">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={onBack} 
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Desafio Histórico</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{typeLabels[current.type] || current.type}</span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5">
                  {periodEmoji}
                </span> 
                {periodName}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-black text-emerald-400 tracking-tighter">
                {correctCount} <span className="text-xs text-emerald-400/50">/ {activities.length}</span>
              </span>
            </div>
          </div>

          {/* Premium Progress Bar */}
          <div className="relative pt-2">
            <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_infinite]" />
              </div>
            </div>
            <div className="flex justify-between mt-3 px-1 items-baseline">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-wider">
                Questão <span className="text-white">{currentIndex + 1}</span> <span className="opacity-50">de</span> {activities.length}
              </span>
              <div className="flex gap-1">
                {activities.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary scale-125 shadow-[0_0_8px_var(--primary)]' : i < currentIndex ? 'bg-emerald-500' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Component Area */}
        <div key={current.id} className="animate-fade-in-scale">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-1 rounded-[2.5rem] shadow-2xl">
            {current.type === "quiz" && (
              <QuizActivityComponent activity={current} onComplete={handleActivityComplete} />
            )}
            {current.type === "chronological" && (
              <ChronologicalOrder activity={current} onComplete={handleActivityComplete} />
            )}
            {current.type === "true_false" && (
              <TrueFalse activity={current} onComplete={handleActivityComplete} />
            )}
            {current.type === "fill_blank" && (
              <FillBlank activity={current} onComplete={handleActivityComplete} />
            )}
            {current.type === "matching" && (
              <Matching activity={current} onComplete={handleActivityComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRunner;
