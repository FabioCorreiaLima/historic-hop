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
    <div className="game-bg min-h-screen pb-20 selection:bg-primary/30">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header Responsivo */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/")} 
                className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                title="Voltar ao Início"
              >
                <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Painel Admin</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Gestão de Conteúdo</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeTab === "questions" ? (
                <button
                  onClick={() => setEditingQuestion({ ...emptyQuestion })}
                  className="duo-btn duo-btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Nova Pergunta
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleGenerateBNCC}
                    disabled={generatingBNCC}
                    className="duo-btn duo-btn-secondary flex items-center justify-center gap-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {generatingBNCC ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generatingBNCC ? "Gerando IA..." : "Gerar BNCC"}
                  </button>
                  <button
                    onClick={() => setEditingPeriod({ ...emptyPeriod })}
                    className="duo-btn duo-btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" /> Novo Período
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs Responsivas */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 w-full sm:w-fit">
            <button
              onClick={() => { setActiveTab("questions"); setSearchTerm(""); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === "questions" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"}`}
            >
              <Database className="w-4 h-4" /> Perguntas
            </button>
            <button
              onClick={() => { setActiveTab("periods"); setSearchTerm(""); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === "periods" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"}`}
            >
              <MapIcon className="w-4 h-4" /> Mapa e Períodos
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-medium">{success}</div>}

        {/* PERIODS TAB CONTENT */}
        {activeTab === "periods" && (
          <div className="animate-fade-in space-y-6">
            {editingPeriod && (
              <div className="glass-strong rounded-3xl p-6 md:p-10 mb-10 border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                    {editingPeriod.emoji}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {editingPeriod.id ? `Editar: ${editingPeriod.name}` : "Novo Período"}
                    </h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Configurações da Linha do Tempo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
                  {/* Seção 1 */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-primary uppercase flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center"><MapIcon className="w-3 h-3" /></div>
                      Essenciais
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">ID Único (Slug)</label>
                        <input
                          type="text"
                          value={editingPeriod.id || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          placeholder="ex: era_vargas"
                          disabled={!!editingPeriod.id && periods.some(p => p.id === editingPeriod.id)}
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Nome do Período</label>
                        <input
                          type="text"
                          value={editingPeriod.name || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                          placeholder="ex: Era Vargas"
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-primary transition-all outline-none font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Emoji</label>
                          <input
                            type="text"
                            value={editingPeriod.emoji || ""}
                            onChange={e => setEditingPeriod({ ...editingPeriod, emoji: e.target.value })}
                            className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-2xl"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Anos</label>
                          <input
                            type="text"
                            value={editingPeriod.years || ""}
                            onChange={e => setEditingPeriod({ ...editingPeriod, years: e.target.value })}
                            placeholder="1930-1945"
                            className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2 */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-amber-400 uppercase flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center"><MessageSquare className="w-3 h-3" /></div>
                      Pedagógico & Chat
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Nome do Personagem</label>
                        <input
                          type="text"
                          value={editingPeriod.characterName || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, characterName: e.target.value })}
                          placeholder="ex: Getúlio"
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Emoji do Personagem</label>
                        <input
                          type="text"
                          value={editingPeriod.characterEmoji || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, characterEmoji: e.target.value })}
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-2xl"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Descrição (Contexto IA)</label>
                        <textarea
                          value={editingPeriod.description || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, description: e.target.value })}
                          rows={3}
                          placeholder="Fatos chaves para a IA usar no chat e perguntas..."
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white resize-none text-sm font-medium leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 3 */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-emerald-400 uppercase flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center"><Sparkles className="w-3 h-3" /></div>
                      Aparência & Mapa
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Ordem (Índice)</label>
                        <input
                          type="number"
                          value={editingPeriod.order_index || 0}
                          onChange={e => setEditingPeriod({ ...editingPeriod, order_index: parseInt(e.target.value) || 0 })}
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Cor Texto</label>
                        <input
                          type="text"
                          value={editingPeriod.color || ""}
                          onChange={e => setEditingPeriod({ ...editingPeriod, color: e.target.value })}
                          placeholder="text-blue-500"
                          className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">URL da Imagem</label>
                      <input
                        type="text"
                        value={editingPeriod.image_url || ''}
                        onChange={e => setEditingPeriod({ ...editingPeriod, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium"
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                       {editingPeriod.image_url ? (
                         <img src={editingPeriod.image_url} alt="Preview" className="h-20 w-full object-cover rounded-lg" />
                       ) : (
                         <div className="text-[10px] font-bold text-white/20">Sem preview de imagem</div>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                  <button
                    onClick={handleSavePeriod}
                    disabled={saving || !editingPeriod.id || !editingPeriod.name}
                    className="duo-btn duo-btn-primary px-10 py-4 flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                  >
                    <Save className="w-5 h-5" /> {saving ? "Salvando..." : "Salvar Período"}
                  </button>
                  <button
                    onClick={() => setEditingPeriod(null)}
                    className="duo-btn duo-btn-secondary px-8 py-4 flex items-center justify-center gap-3 text-base"
                  >
                    <X className="w-5 h-5" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {periods.map(p => (
                <div key={p.id} className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 flex items-center gap-5 hover:bg-slate-900/60 hover:border-white/20 transition-all group relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-white/5 bg-white/5 shadow-inner`}>
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <h3 className="font-black text-white mb-0.5 truncate tracking-tight">{p.name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{p.years}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">{p.characterEmoji}</div>
                      <span className="text-[10px] font-bold text-white/40 truncate">{p.characterName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPeriod(p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/5 text-white/50 hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUESTIONS TAB CONTENT */}
        {activeTab === "questions" && (
          <div className="animate-fade-in space-y-6">
            {editingQuestion && (
              <div className="glass-strong rounded-3xl p-6 md:p-10 border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />
                
                <h3 className="text-2xl font-black text-white mb-8">
                  {editingQuestion.id ? "Editar Pergunta" : "Nova Pergunta"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Nível (Fase)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editingQuestion.level}
                      onChange={e => setEditingQuestion({ ...editingQuestion, level: parseInt(e.target.value) || 1 })}
                      className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Dificuldade</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white font-medium outline-none focus:border-primary transition-all appearance-none"
                    >
                      {difficulties.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Tópico / Assunto</label>
                    <input
                      type="text"
                      value={editingQuestion.topic || ""}
                      onChange={e => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                      placeholder="Ex: Revolução Industrial"
                      className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5 block">Texto da Pergunta</label>
                  <textarea
                    value={editingQuestion.question || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    rows={3}
                    placeholder="Escreva a pergunta aqui..."
                    className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white resize-none font-medium leading-relaxed outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${editingQuestion.correct_index === i ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correct_index: i })}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${editingQuestion.correct_index === i ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white/10 text-white/40 hover:bg-white/20"}`}
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
                        placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                        className="flex-1 bg-transparent border-none text-white font-medium focus:ring-0 outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                  <button
                    onClick={handleSaveQuestion}
                    disabled={saving || !editingQuestion.question.trim()}
                    className="duo-btn duo-btn-primary px-10 py-4 flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                  >
                    <Save className="w-5 h-5" /> {saving ? "Salvando..." : "Salvar Pergunta"}
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="duo-btn duo-btn-secondary px-8 py-4 flex items-center justify-center gap-3 text-base"
                  >
                    <X className="w-5 h-5" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar perguntas, tópicos ou períodos..."
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white font-medium focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-24">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" />
                <p className="mt-4 text-white/20 font-bold uppercase tracking-widest text-xs">Carregando Acervo...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map(q => (
                  <div key={q.id} className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 md:p-6 flex items-center gap-6 hover:bg-slate-900/60 transition-all group relative overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                      <span className="text-[10px] font-black text-white/30 uppercase leading-none mb-1">Nível</span>
                      <span className="text-xl font-black text-white leading-none">{q.level}</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <p className="font-bold text-white mb-1.5 leading-tight group-hover:text-primary transition-colors">{q.question}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{q.topic}</span>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">• {q.difficulty}</span>
                      </div>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <button onClick={() => setEditingQuestion(q)} className="p-3 rounded-xl bg-white/5 text-white/50 hover:bg-white hover:text-slate-950 transition-all shadow-xl"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/20 font-bold uppercase tracking-widest text-sm">Nenhuma pergunta encontrada</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
