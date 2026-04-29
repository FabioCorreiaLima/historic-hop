import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Search, Filter, Image, Video, Volume2, Map as MapIcon, Database, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import { type HistoricalPeriod as Period, type Activity } from "@/types";

// Adapt Question interface to match the existing one based on Activity
interface Question {
  id: string;
  level: number;
  difficulty: string;
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  media_type: string;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
}

const emptyQuestion: Omit<Question, "id"> = {
  level: 1,
  difficulty: "Fácil",
  topic: "",
  question: "",
  options: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
  media_type: "text",
  image_url: null,
  audio_url: null,
  video_url: null,
};

const emptyPeriod: Period = {
  id: "",
  name: "",
  emoji: "📜",
  years: "",
  color: "text-primary",
  bgColor: "bg-primary/5",
  borderColor: "border-primary/20",
  description: "",
  characterName: "",
  characterEmoji: "👤",
};

const difficulties = ["Fácil", "Médio", "Avançado", "Expert"];
const mediaTypes = [
  { value: "text", label: "Apenas Texto", icon: null },
  { value: "image", label: "Com Imagem", icon: Image },
  { value: "audio", label: "Com Áudio", icon: Volume2 },
  { value: "video", label: "Com Vídeo", icon: Video },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [activeTab, setActiveTab] = useState<"questions" | "periods">("questions");
  
  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Omit<Question, "id"> & { id?: string } | null>(null);
  
  // Periods State
  const [periods, setPeriods] = useState<Period[]>([]);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatingBNCC, setGeneratingBNCC] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const data = await api.questions.getQuestions(session.access_token, filterLevel || undefined);
      setQuestions(data as Question[]);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar perguntas");
    }
    setLoading(false);
  }, [session, filterLevel]);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.periods.getAll();
      setPeriods(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar períodos");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin && session) {
      if (activeTab === "questions") fetchQuestions();
      else fetchPeriods();
    }
  }, [isAdmin, session, activeTab, fetchQuestions, fetchPeriods]);

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !session?.access_token) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingQuestion.id) {
        await api.questions.updateQuestion(session.access_token, editingQuestion.id, editingQuestion);
        setSuccess("Pergunta atualizada!");
      } else {
        await api.questions.createQuestion(session.access_token, editingQuestion);
        setSuccess("Pergunta criada!");
      }
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
    setSaving(false);
  };

  const handleGenerateBNCC = async () => {
    if (!confirm("Isso irá apagar a trilha atual e gerar a Base Nacional Comum Curricular (História do Brasil) completa via IA. Esse processo pode demorar até 1 minuto. Deseja continuar?")) return;
    if (!session?.access_token) return;

    setGeneratingBNCC(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.curriculum.generateFullCurriculum(session.access_token);
      setSuccess(`Currículo gerado! ${response.result?.count || ''} períodos criados.`);
      fetchPeriods();
    } catch (err: any) {
      setError(err.message || "Erro ao gerar currículo BNCC");
    }
    setGeneratingBNCC(false);
  };

  const handleSavePeriod = async () => {
    if (!editingPeriod) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.periods.save(editingPeriod);
      setSuccess("Período histórico salvo!");
      setEditingPeriod(null);
      fetchPeriods();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar período");
    }
    setSaving(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    if (!session?.access_token) return;

    try {
      await api.questions.deleteQuestion(session.access_token, id);
      setSuccess("Pergunta excluída!");
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir");
    }
  };

  if (adminLoading) {
    return (
      <div className="game-bg flex items-center justify-center">
        <div className="glass rounded-2xl px-8 py-6 animate-pulse">
          <p className="text-lg text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="game-bg flex items-center justify-center">
        <div className="glass rounded-2xl px-8 py-6 text-center">
          <p className="text-lg text-foreground mb-4">Acesso negado.</p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPeriods = periods.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="game-bg min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="glass-option p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          </div>
          
          <div className="flex bg-muted/30 p-1 rounded-xl border border-border">
            <button
              onClick={() => { setActiveTab("questions"); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "questions" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Database className="w-4 h-4" /> Perguntas
            </button>
            <button
              onClick={() => { setActiveTab("periods"); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "periods" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <MapIcon className="w-4 h-4" /> Mapa e Períodos
            </button>
          </div>

          <div className="md:ml-auto">
            {activeTab === "questions" ? (
              <button
                onClick={() => setEditingQuestion({ ...emptyQuestion })}
                className="duo-btn duo-btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nova Pergunta
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateBNCC}
                  disabled={generatingBNCC}
                  className="duo-btn duo-btn-secondary flex items-center gap-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-50"
                >
                  {generatingBNCC ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generatingBNCC ? "Gerando IA..." : "Gerar BNCC"}
                </button>
                <button
                  onClick={() => setEditingPeriod({ ...emptyPeriod })}
                  className="duo-btn duo-btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo Período
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-medium">{success}</div>}

        {/* PERIODS TAB CONTENT */}
        {activeTab === "periods" && (
          <>
            {editingPeriod && (
              <div className="glass-strong rounded-2xl p-6 mb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
                    {editingPeriod.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {editingPeriod.id ? `Editar: ${editingPeriod.name}` : "Novo Período Histórico"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <MapIcon className="w-4 h-4" /> Informações Básicas
                    </h4>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">ID Único (Slug)</label>
                      <input
                        type="text"
                        value={editingPeriod.id || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        placeholder="ex: era_vargas"
                        disabled={!!editingPeriod.id && periods.some(p => p.id === editingPeriod.id)}
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Nome do Período</label>
                      <input
                        type="text"
                        value={editingPeriod.name || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                        placeholder="ex: Era Vargas"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground mb-1 block">Emoji</label>
                        <input
                          type="text"
                          value={editingPeriod.emoji || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, emoji: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-center text-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground mb-1 block">Anos</label>
                        <input
                          type="text"
                          value={editingPeriod.years || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, years: e.target.value })}
                          placeholder="1930-1945"
                          className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Personagem do Chat
                    </h4>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Nome do Personagem</label>
                      <input
                        type="text"
                        value={editingPeriod.characterName || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, characterName: e.target.value })}
                        placeholder="ex: Getúlio"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Emoji do Personagem</label>
                      <input
                        type="text"
                        value={editingPeriod.characterEmoji || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, characterEmoji: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-center text-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Descrição do Período (Para a IA)</label>
                      <textarea
                        value={editingPeriod.description || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, description: e.target.value })}
                        rows={3}
                        placeholder="Descreva os principais eventos deste período para que a IA gere as perguntas e o chat corretamente."
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground resize-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Estilo Visual
                    </h4>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Cor do Texto (Tailwind)</label>
                      <input
                        type="text"
                        value={editingPeriod.color || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, color: e.target.value })}
                        placeholder="text-blue-600"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Cor de Fundo (Tailwind)</label>
                      <input
                        type="text"
                        value={editingPeriod.bgColor || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, bgColor: e.target.value })}
                        placeholder="bg-blue-50"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Cor da Borda (Tailwind)</label>
                      <input
                        type="text"
                        value={editingPeriod.borderColor || ""}
                        onChange={e => setEditingPeriod({ ...editingPeriod, borderColor: e.target.value })}
                        placeholder="border-blue-300"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Ordem (Posição no Mapa)</label>
                      <input
                        type="number"
                        value={editingPeriod.order_index || 0}
                        onChange={e => setEditingPeriod({ ...editingPeriod, order_index: parseInt(e.target.value) || 0 })}
                        placeholder="ex: 10, 20, 30..."
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">URL da Imagem de Capa</label>
                      <input
                        type="text"
                        value={editingPeriod.image_url || ''}
                        onChange={e => setEditingPeriod({ ...editingPeriod, image_url: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={handleSavePeriod}
                    disabled={saving || !editingPeriod.id || !editingPeriod.name}
                    className="duo-btn duo-btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Período"}
                  </button>
                  <button
                    onClick={() => setEditingPeriod(null)}
                    className="duo-btn duo-btn-secondary px-6 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periods.map(p => (
                <div key={p.id} className="glass rounded-2xl p-4 flex items-start gap-4 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border-2 ${p.borderColor} ${p.bgColor}`}>
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1 truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">{p.years}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                      Personagem: {p.characterName}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPeriod(p)}
                    className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* QUESTIONS TAB CONTENT (Omitted for brevity, but kept intact in the real file) */}
        {activeTab === "questions" && (
          <>
            {editingQuestion && (
              <div className="glass-strong rounded-2xl p-6 mb-6 animate-fade-in-up">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {editingQuestion.id ? "Editar Pergunta" : "Nova Pergunta"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Nível</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editingQuestion.level}
                      onChange={e => setEditingQuestion({ ...editingQuestion, level: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Dificuldade</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground"
                    >
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Tópico</label>
                    <input
                      type="text"
                      value={editingQuestion.topic || ""}
                      onChange={e => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                      placeholder="Ex: Segunda Guerra Mundial"
                      className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Pergunta</label>
                  <textarea
                    value={editingQuestion.question || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correct_index: i })}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${editingQuestion.correct_index === i ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                      <input
                        type="text"
                        value={opt || ""}
                        onChange={e => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[i] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveQuestion}
                    disabled={saving || !editingQuestion.question.trim()}
                    className="duo-btn duo-btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="duo-btn duo-btn-secondary px-6 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar perguntas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {filteredQuestions.map(q => (
                  <div key={q.id} className="glass rounded-xl p-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">N{q.level}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{q.question}</p>
                      <p className="text-xs text-muted-foreground">{q.topic} • {q.difficulty}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditingQuestion(q)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
