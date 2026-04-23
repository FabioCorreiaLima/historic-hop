import { Flame } from "lucide-react";

interface Props {
  currentStreak: number;
  practicedToday: boolean;
}

const StreakBadge = ({ currentStreak, practicedToday }: Props) => {
  if (currentStreak === 0 && !practicedToday) return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
      practicedToday
        ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600"
        : "bg-muted text-muted-foreground"
    }`}>
      <Flame className={`w-4 h-4 ${practicedToday ? "text-orange-500 animate-wiggle" : "text-muted-foreground"}`} />
      <span>{currentStreak}</span>
    </div>
  );
};

export default StreakBadge;
