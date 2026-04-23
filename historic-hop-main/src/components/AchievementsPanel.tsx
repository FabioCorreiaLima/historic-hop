import { ArrowLeft, Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/hooks/useAchievements";

interface Props {
  unlockedKeys: Set<string>;
  onBack: () => void;
}

const AchievementsPanel = ({ unlockedKeys, onBack }: Props) => {
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-xl font-extrabold text-foreground">Conquistas</h2>
        <span className="ml-auto text-sm font-bold text-muted-foreground">
          {unlockedKeys.size}/{ACHIEVEMENTS.length}
        </span>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h3>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.filter(a => a.category === cat).map(a => {
              const unlocked = unlockedKeys.has(a.key);
              return (
                <div key={a.key} className={`duo-card-flat p-4 text-center transition-all ${
                  unlocked ? "" : "opacity-40 grayscale"
                }`}>
                  <div className="text-3xl mb-1">{unlocked ? a.emoji : "🔒"}</div>
                  <p className="text-sm font-bold text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsPanel;
