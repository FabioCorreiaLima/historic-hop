import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Crown, Calendar, Star, Loader2 } from "lucide-react";
import { getLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";

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
      const data = await api.apiCall(`/ranking?type=${tab}`);
      setEntries(data);
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
      setEntries([]);
    }
    setLoading(false);
  }

  const getMedalIcon = (pos: number) => {
    if (pos === 0) return <Crown className="w-5 h-5 md:w-6 md:h-6 text-quiz-primary" />;
    if (pos === 1) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />;
    if (pos === 2) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-700" />;
    return <span className="text-xs md:text-sm text-quiz-text-muted font-black">{pos + 1}</span>;
  };

  const userPosition = entries.findIndex(e => e.user_id === user?.id);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-quiz-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-quiz-primary/20 shadow-xl shadow-quiz-primary/5">
          <Trophy className="w-8 h-8 md:w-10 md:h-10 text-quiz-primary" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-quiz-text-main tracking-tight uppercase">Ranking de Historiadores</h2>
        <p className="text-xs md:text-sm text-quiz-text-muted font-medium mt-1 uppercase tracking-widest">Os maiores exploradores do tempo</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-quiz-surface rounded-xl md:rounded-2xl border border-quiz-border p-1 mb-6 md:mb-8">
        <button
          onClick={() => setTab("total")}
          className={cn(
            "flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-lg md:rounded-xl",
            tab === "total" ? "bg-quiz-primary text-black" : "text-quiz-text-muted hover:text-quiz-text-main"
          )}
        >
          <Star className="w-4 h-4" /> Geral
        </button>
        <button
          onClick={() => setTab("weekly")}
          className={cn(
            "flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-lg md:rounded-xl",
            tab === "weekly" ? "bg-quiz-primary text-black" : "text-quiz-text-muted hover:text-quiz-text-main"
          )}
        >
          <Calendar className="w-4 h-4" /> Semanal
        </button>
      </div>

      {/* User Status Card */}
      {user && userPosition >= 0 && (
        <div className="bg-quiz-primary/5 border border-quiz-primary/20 rounded-xl md:rounded-2xl p-4 md:p-5 mb-6 md:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-quiz-primary flex items-center justify-center text-black font-black text-xs md:text-sm">
              #{userPosition + 1}
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-quiz-primary uppercase tracking-widest">Sua Posição</p>
              <p className="text-sm md:text-base font-black text-quiz-text-main">{entries[userPosition].display_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm md:text-base font-black text-quiz-primary">
              {(tab === "weekly" ? entries[userPosition].weekly_score : entries[userPosition].total_score).toLocaleString()} pts
            </p>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="space-y-2 md:space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-quiz-primary mb-4" />
            <p className="text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-widest">Consultando arquivos...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-quiz-surface rounded-2xl border border-quiz-border border-dashed">
            <Trophy className="w-12 h-12 text-quiz-text-muted/20 mx-auto mb-4" />
            <p className="text-xs md:text-sm text-quiz-text-muted font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const isMe = entry.user_id === user?.id;
            const score = tab === "weekly" ? entry.weekly_score : entry.total_score;
            const level = getLevel(entry.total_score);

            return (
              <div
                key={entry.user_id}
                className={cn(
                  "bg-quiz-surface border border-quiz-border rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all hover:border-quiz-primary/30",
                  isMe && "border-quiz-primary bg-quiz-primary/5"
                )}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
                  {getMedalIcon(i)}
                </div>

                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-quiz-bg border border-quiz-border flex items-center justify-center text-xs md:text-sm font-black text-quiz-primary shrink-0 uppercase">
                  {entry.display_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm md:text-base font-black text-quiz-text-main truncate uppercase tracking-tight">
                      {entry.display_name}
                    </p>
                    {isMe && <span className="px-1.5 py-0.5 rounded bg-quiz-primary text-black text-[8px] md:text-[10px] font-black uppercase">Você</span>}
                  </div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-quiz-primary mt-0.5">
                    {level.title}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs md:text-sm font-black text-quiz-text-main">
                    {score.toLocaleString()}
                  </p>
                  <p className="text-[8px] md:text-[9px] font-black text-quiz-text-muted uppercase tracking-widest">PTS</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Ranking;
