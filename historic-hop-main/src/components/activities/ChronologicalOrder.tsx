import { useState, useCallback } from "react";
import { ArrowUpDown, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import type { ChronologicalActivity } from "@/data/activities";

interface Props {
  activity: ChronologicalActivity;
  onComplete: (correct: boolean) => void;
}

const ChronologicalOrder = ({ activity, onComplete }: Props) => {
  const [items, setItems] = useState(() => {
    const shuffled = [...activity.events];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDrop = useCallback((dropIndex: number) => {
    if (dragIndex === null || checked) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, moved);
    setItems(newItems);
    setDragIndex(null);
  }, [dragIndex, items, checked]);

  const moveItem = (index: number, direction: -1 | 1) => {
    if (checked) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const checkAnswer = () => {
    const correct = items.every((item, i) => {
      const sortedEvents = [...activity.events].sort((a, b) => a.year - b.year);
      return item.year === sortedEvents[i].year;
    });
    setIsCorrect(correct);
    setChecked(true);
    onComplete(correct);
  };

  const correctOrder = [...activity.events].sort((a, b) => a.year - b.year);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <ArrowUpDown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Ordenação Cronológica</p>
            <h2 className="text-xl font-bold text-white leading-tight">{activity.instruction}</h2>
          </div>
        </div>

        {/* Sortable items */}
        <div className="space-y-3 mb-8">
          {items.map((item, index) => {
            let itemClass = "bg-white/5 border border-white/10 text-white rounded-2xl p-4 transition-all duration-200";
            if (checked) {
              const correctPos = correctOrder.findIndex(e => e.year === item.year);
              itemClass += correctPos === index 
                ? " !border-emerald-500/50 !bg-emerald-500/10" 
                : " !border-red-500/50 !bg-red-500/10 animate-shake";
            } else {
              itemClass += " hover:bg-white/10 cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-95 shadow-lg";
            }

            return (
              <div
                key={`${item.text}-${index}`}
                draggable={!checked}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={`${itemClass} flex items-center gap-4`}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm font-black text-white/60 border border-white/5">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm md:text-base font-medium text-white/90">
                  {typeof item.text === 'string' ? item.text : (item.text as any).option || (item.text as any).text || String(item.text)}
                </span>
                {!checked && (
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(index, -1)} className="text-white/30 hover:text-white transition-colors p-1" disabled={index === 0}>▲</button>
                    <button onClick={() => moveItem(index, 1)} className="text-white/30 hover:text-white transition-colors p-1" disabled={index === items.length - 1}>▼</button>
                  </div>
                )}
                {checked && (
                  <span className="text-xs font-black text-white/30 tracking-tighter">{item.year}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Check Button */}
        {!checked && (
          <button 
            onClick={checkAnswer} 
            className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Verificar Ordem
          </button>
        )}
      </div>
    </div>
  );
};

export default ChronologicalOrder;
