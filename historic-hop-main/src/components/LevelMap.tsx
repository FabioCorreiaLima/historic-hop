import { Lock, Star, CheckCircle2, Sparkles, Trophy, LogIn, LogOut, User, Settings } from "lucide-react";
import type { LevelInfo } from "@/data/quizQuestions";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

interface LevelMapProps {
  levels: LevelInfo[];
  onSelectLevel: (level: number) => void;
  onShowRanking: () => void;
  onShowAuth: () => void;
}

const difficultyColors: Record<string, string> = {
  "fácil": "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  "médio": "from-sky-500/20 to-sky-600/10 border-sky-500/30",
  "avançado": "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  "expert": "from-rose-500/20 to-rose-600/10 border-rose-500/30",
};

const difficultyLabels: Record<string, string> = {
  "fácil": "Fácil",
  "médio": "Médio",
  "avançado": "Avançado",
  "expert": "Expert",
};

const difficultyEmoji: Record<string, string> = {
  "fácil": "🌱",
  "médio": "⚡",
  "avançado": "🔥",
  "expert": "💎",
};

const LevelMap = ({ levels, onSelectLevel, onShowRanking, onShowAuth }: LevelMapProps) => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-xs font-bold text-foreground">
                {profile?.display_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <span className="text-sm text-foreground font-medium hidden sm:inline">{profile?.display_name}</span>
              <button onClick={signOut} className="glass-option p-1.5 rounded-lg hover:bg-muted/50 transition-colors ml-1">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <button onClick={onShowAuth} className="glass-option px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <a href="/admin" className="glass-option px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Settings className="w-4 h-4" /> Admin
            </a>
          )}
          <button onClick={onShowRanking} className="glass-option px-3 py-1.5 rounded-lg text-sm text-accent hover:bg-muted/50 transition-colors flex items-center gap-1">
            <Trophy className="w-4 h-4" /> Ranking
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          <Sparkles className="inline w-8 h-8 text-accent mr-2" />
          Quiz de História
        </h1>
        <p className="text-muted-foreground">Escolha um nível para começar</p>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {levels.map((level, i) => {
          const colors = difficultyColors[level.difficulty] || difficultyColors["fácil"];
          
          return (
            <button
              key={level.level}
              onClick={() => level.unlocked && onSelectLevel(level.level)}
              disabled={!level.unlocked}
              className={`relative rounded-2xl p-4 text-left transition-all duration-300 animate-fade-in-scale
                ${level.unlocked
                  ? `glass-option bg-gradient-to-br ${colors} hover:scale-[1.03] active:scale-[0.98]`
                  : "glass opacity-40 cursor-not-allowed"
                }
                stagger-${Math.min(i % 6 + 1, 6)}
              `}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Level Number */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 font-bold text-lg
                ${level.completed
                  ? "bg-success/20 text-success"
                  : level.unlocked
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}
              >
                {level.unlocked ? (
                  level.completed ? <CheckCircle2 className="w-5 h-5" /> : level.level
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              {/* Topic */}
              <p className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
                {level.topic}
              </p>

              {/* Difficulty badge */}
              <span className="text-xs text-muted-foreground">
                {difficultyEmoji[level.difficulty]} {difficultyLabels[level.difficulty]}
              </span>

              {/* Stars */}
              {level.completed && (
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= level.stars ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              )}

              {/* Questions count */}
              <p className="text-xs text-muted-foreground mt-1">
                {level.totalQuestions} perguntas
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
