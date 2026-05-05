import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, ArrowLeft, Crown, Calendar, Star } from "lucide-react";
import { getLevel } from "@/lib/gamification";

interface RankingEntry {
  user_id: string;
  total_score: number;
  weekly_score: number;
  max_level: number;
  display_name: string;
  avatar_url: string | null;
}

const Ranking = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [tab, setTab] = useState<"total" | "weekly">("total");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [tab]);

  async function fetchRanking() {
    setLoading(true);
    try {
      const data = await api.ranking.getRanking(tab);
      setEntries(data);
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
      setEntries([]);
    }
    setLoading(false);
  }

  const getMedalIcon = (pos: number) => {
    if (pos === 0) return <Crown className="w-5 h-5 text-accent" />;
    if (pos === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-accent/60" />;
    return <span className="text-sm text-muted-foreground font-bold">{pos + 1}</span>;
  };

  const userPosition = entries.findIndex(e => e.user_id === user?.id);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/20 shadow-xl shadow-accent/5">
          <Trophy className="w-10 h-10 text-accent animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Ranking Global</h2>
        <p className="text-sm text-muted-foreground font-medium">Os heróis que estão fazendo história</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-border mb-5">
        <button
          onClick={() => setTab("total")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${tab === "total" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Star className="w-4 h-4" /> Geral
        </button>
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${tab === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Calendar className="w-4 h-4" /> Semanal
        </button>
      </div>

      {/* User position */}
      {user && userPosition >= 0 && (
        <div className="glass rounded-xl p-3 mb-4 border border-primary/30 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            Sua posição: <span className="text-foreground font-bold">#{userPosition + 1}</span>
            {" · "}
            <span className="text-accent font-semibold">
              {tab === "weekly" ? entries[userPosition]?.weekly_score : entries[userPosition]?.total_score} pts
            </span>
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground animate-pulse">Carregando ranking...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum jogador no ranking ainda</p>
            <p className="text-sm text-muted-foreground/60">Seja o primeiro a jogar!</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const isMe = entry.user_id === user?.id;
            const score = tab === "weekly" ? entry.weekly_score : entry.total_score;
            return (
              <div
                key={entry.user_id}
                className={`glass rounded-xl p-3 flex items-center gap-3 transition-all ${isMe ? "border border-primary/40 bg-primary/5" : ""} ${i < 3 ? "animate-fade-in-scale" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-8 h-8 flex items-center justify-center">{getMedalIcon(i)}</div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-sm font-bold text-foreground">
                  {entry.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {entry.display_name} {isMe && <span className="text-xs text-primary">(Você)</span>}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${getLevel(entry.total_score).color}`}>
                    {getLevel(entry.total_score).title}
                  </p>
                </div>
                <p className="text-sm font-bold text-accent">{score.toLocaleString()} pts</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Ranking;
