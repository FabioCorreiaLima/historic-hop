import { useEffect } from "react";
import confetti from "canvas-confetti";
import { playAchievementSound } from "@/lib/sounds";
import type { AchievementDef } from "@/hooks/useAchievements";

interface Props {
  achievement: AchievementDef;
  onDismiss: () => void;
}

const AchievementPopup = ({ achievement, onDismiss }: Props) => {
  useEffect(() => {
    playAchievementSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#f59e0b", "#3b82f6", "#22c55e"],
    });
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative animate-bounce-in duo-card-flat p-8 text-center max-w-xs">
        <div className="text-5xl mb-3 animate-wiggle">{achievement.emoji}</div>
        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Nova Conquista!</p>
        <h3 className="text-xl font-extrabold text-foreground mb-1">{achievement.name}</h3>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
      </div>
    </div>
  );
};

export default AchievementPopup;
