import { useEffect } from "react";
import confetti from "canvas-confetti";
import { playAchievementSound } from "@/lib/sounds";
import type { AchievementDef } from "@/hooks/useAchievements";
import { X } from "lucide-react";

interface Props {
  achievement: AchievementDef;
  onDismiss: () => void;
}

const AchievementPopup = ({ achievement, onDismiss }: Props) => {
  useEffect(() => {
    if (!achievement) return;
    playAchievementSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#f59e0b", "#3b82f6", "#22c55e"],
    });
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss, achievement]);

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative animate-bounce-in duo-card-flat p-8 text-center max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-5xl mb-3 animate-wiggle">{achievement?.emoji || "🏆"}</div>
        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Nova Conquista!</p>
        <h3 className="text-xl font-extrabold text-foreground mb-1">{achievement?.name || "Conquista"}</h3>
        <p className="text-sm text-muted-foreground">{achievement?.description || "Você desbloqueou algo novo!"}</p>
      </div>
    </div>
  );
};

export default AchievementPopup;
