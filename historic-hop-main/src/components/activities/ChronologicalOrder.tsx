import { useState, useCallback } from "react";
import { ArrowUpDown } from "lucide-react";
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
    setChecked(true);
    if (correct) playCorrectSound();
    else playWrongSound();
    onComplete(correct);
  };

  const correctOrder = [...activity.events].sort((a, b) => a.year - b.year);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-quiz-primary/10 flex items-center justify-center border border-quiz-primary/30">
            <ArrowUpDown className="w-6 h-6 text-quiz-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-quiz-primary uppercase tracking-[0.2em] mb-1">Ordenação Cronológica</p>
            <h2 className="text-xl font-bold text-quiz-text-main leading-tight">{activity.instruction}</h2>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {items.map((item, index) => {
            let itemClass = "bg-quiz-surface border border-quiz-border text-quiz-text-main rounded-xl p-4 transition-all duration-200";
            if (checked) {
              const correctPos = correctOrder.findIndex(e => e.year === item.year);
              itemClass += correctPos === index 
                ? " !border-quiz-correct/50 !bg-quiz-correct/10 text-quiz-correct" 
                : " !border-quiz-wrong/50 !bg-quiz-wrong/10 text-quiz-wrong animate-shake";
            } else {
              itemClass += " hover:border-quiz-primary/50 cursor-grab active:cursor-grabbing hover:scale-[1.02] shadow-lg";
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
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-quiz-bg flex items-center justify-center text-xs font-black text-quiz-primary border border-quiz-border">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm md:text-base font-medium">
                  {typeof item.text === 'string' ? item.text : (item.text as any).option || (item.text as any).text || String(item.text)}
                </span>
                {!checked && (
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(index, -1)} className="text-quiz-text-muted hover:text-quiz-primary transition-colors p-1" disabled={index === 0}>▲</button>
                    <button onClick={() => moveItem(index, 1)} className="text-quiz-text-muted hover:text-quiz-primary transition-colors p-1" disabled={index === items.length - 1}>▼</button>
                  </div>
                )}
                {checked && (
                  <span className="text-[10px] font-black text-quiz-text-muted tracking-tighter">{item.year}</span>
                )}
              </div>
            );
          })}
        </div>

        {!checked && (
          <button 
            onClick={checkAnswer} 
            className="w-full h-16 rounded-xl bg-quiz-primary text-black font-black text-lg uppercase tracking-widest hover:bg-quiz-primary-dark transition-all shadow-xl shadow-quiz-primary/10"
          >
            VERIFICAR ORDEM
          </button>
        )}
      </div>
    </div>
  );
};

export default ChronologicalOrder;
