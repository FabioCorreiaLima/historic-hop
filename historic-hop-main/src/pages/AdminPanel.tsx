import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { 
  LayoutDashboard, 
  History, 
  Gamepad2, 
  Users, 
  BarChart3, 
  Plus, 
  Sparkles, 
  Trash2, 
  Database, 
  Loader2,
  Edit,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Filter,
  Download,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Question {
  id: string;
  type: string;
  content: any;
  period: string;
  level: number;
  difficulty: string;
}

interface Period {
  id: string;
  name: string;
  emoji: string;
  years: string;
  color: string;
  description: string;
  order_index: number;
  characterName?: string;
  characterEmoji?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { session } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const activeTab = searchParams.get("tab") || "dashboard";
  
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [statsData, setStatsData] = useState({ totalUsers: 0, totalActivities: 0, avgAccuracy: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingBNCC, setGeneratingBNCC] = useState(false);
  
  // Modals state
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const [activitiesData, periodsData, realStats] = await Promise.all([
        api.admin.getActivities(session.access_token),
        api.periods.getAll(),
        api.admin.getStats(session.access_token)
      ]);
      setQuestions(activitiesData as Question[]);
      setPeriods(periodsData);
      setStatsData(realStats);
    } catch (err: any) {
      toast.error("Erro ao carregar dados do painel");
      setError(err.message);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (isAdmin && session) {
      fetchData();
    }
  }, [isAdmin, session, fetchData]);

  // Dashboard Stats
  const stats = useMemo(() => {
    return [
      { title: "Total de Períodos", value: periods.length, icon: History, color: "text-blue-500", trend: { value: 12, isPositive: true } },
      { title: "Atividades Ativas", value: statsData.totalActivities, icon: Gamepad2, color: "text-emerald-500", trend: { value: 5, isPositive: true } },
      { title: "Usuários Ativos", value: statsData.totalUsers, icon: Users, color: "text-amber-500", trend: { value: 8, isPositive: true } },
      { title: "Taxa de Acertos", value: `${statsData.avgAccuracy}%`, icon: TrendingUp, color: "text-purple-500", trend: { value: 2, isPositive: false } },
    ];
  }, [periods, statsData]);

  // Chart Data
  const chartData = useMemo(() => {
    return periods.map(p => ({
      name: p.name,
      atividades: questions.filter(q => q.period === p.id).length
    })).slice(0, 8);
  }, [periods, questions]);

  const userGrowthData = [
    { name: '01/05', users: 12 },
    { name: '05/05', users: 18 },
    { name: '10/05', users: 25 },
    { name: '15/05', users: 32 },
    { name: '20/05', users: 38 },
    { name: '25/05', users: 42 },
  ];

  // Handlers
  const handleGenerateBNCC = async () => {
    if (!confirm("Isso irá apagar a trilha atual e gerar a Base Nacional Comum Curricular via IA. Deseja continuar?")) return;
    setGeneratingBNCC(true);
    try {
      await api.curriculum.generateFullCurriculum(session!.access_token);
      toast.success("Currículo BNCC gerado com sucesso!");
      fetchData();
    } catch (err: any) {
      toast.error("Erro ao gerar currículo");
    }
    setGeneratingBNCC(false);
  };

  const handleClearAll = async () => {
    if (!confirm("Deseja apagar TUDO? Essa ação é irreversível.")) return;
    try {
      await api.curriculum.clearAll(session!.access_token);
      toast.success("Banco de dados limpo!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao limpar banco");
    }
  };

  const handleSavePeriod = async () => {
    if (!editingPeriod) return;
    setIsSaving(true);
    try {
      await api.periods.save(editingPeriod);
      toast.success("Período salvo com sucesso!");
      setEditingPeriod(null);
      fetchData();
    } catch (err) {
      toast.error("Erro ao salvar período");
    }
    setIsSaving(false);
  };

  if (adminLoading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="h-screen w-full flex items-center justify-center text-rose-500 font-bold uppercase tracking-widest">Acesso Negado</div>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight capitalize">{activeTab === 'dashboard' ? 'Visão Geral' : activeTab}</h2>
            <p className="text-muted-foreground text-sm font-medium mt-1">Gerencie o currículo e acompanhe o progresso da plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl border-border/50">
              <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Atualizar
            </Button>
            <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={() => setEditingPeriod({} as any)}>
              <Plus className="w-4 h-4 mr-2" /> Novo Período
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Atividades por Período
                  </h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><Download className="w-4 h-4" /></Button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'hsl(var(--secondary) / 0.4)' }}
                      />
                      <Bar dataKey="atividades" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Crescimento de Usuários
                  </h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-8 rounded-[2rem] bg-secondary/20 border border-dashed border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Geração em Lote com IA</h4>
                  <p className="text-muted-foreground text-sm font-medium">Automatize a criação de atividades para todos os períodos da BNCC.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button onClick={handleGenerateBNCC} disabled={generatingBNCC} className="flex-1 md:flex-none duo-btn duo-btn-primary shadow-amber-500/20 border-amber-600 bg-amber-500 hover:bg-amber-600">
                  {generatingBNCC ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Gerar BNCC Full
                </Button>
                <Button variant="outline" onClick={handleClearAll} className="flex-1 md:flex-none h-12 rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Reset DB
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Periods Tab */}
        {activeTab === "periods" && (
          <div className="animate-fade-in-up">
            <DataTable 
              isLoading={loading}
              columns={[
                { 
                  header: "Período", 
                  cell: (p) => (
                    <div className="flex items-center gap-4">
                      <div className="text-2xl w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center border border-border/50">{p.emoji}</div>
                      <div>
                        <p className="font-black tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.years}</p>
                      </div>
                    </div>
                  )
                },
                { 
                  header: "Status", 
                  cell: () => <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[9px] tracking-widest px-3 py-1">Ativo</Badge>
                },
                { header: "Índice", accessorKey: "order_index", className: "text-center w-24" },
                { 
                  header: "Ações", 
                  className: "text-right",
                  cell: (p) => (
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPeriod(p)} className="rounded-xl hover:bg-secondary"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-500/10 text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )
                }
              ]}
              data={periods}
            />
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-4">
               <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Filtrar por pergunta ou período..." className="pl-12 rounded-2xl border-border/50 h-12" />
               </div>
               <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/50"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
            </div>

            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 border-2 border-dashed border-border/50 rounded-[2rem]">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black tracking-tight">Sem Atividades Disponíveis</h4>
                <p className="text-muted-foreground text-sm max-w-xs text-center mt-2 mb-8 font-medium">Use o botão de geração BNCC no Dashboard para criar automaticamente as atividades da plataforma.</p>
                <Button variant="outline" onClick={() => setSearchParams({ tab: 'dashboard' })} className="rounded-xl border-border/50">Ir para o Dashboard</Button>
              </div>
            ) : (
              <DataTable 
                isLoading={loading}
                columns={[
                  { header: "Tipo", cell: (q) => <Badge variant="outline" className="font-bold uppercase text-[9px] tracking-widest border-border/50">{q.type.replace('_', ' ')}</Badge> },
                  { 
                    header: "Conteúdo", 
                    cell: (q) => <p className="truncate max-w-[400px] font-medium text-xs">{q.content?.question || q.content?.statement || q.content?.instruction || 'Atividade Variada'}</p> 
                  },
                  { header: "Período", accessorKey: "period", className: "text-muted-foreground font-bold text-[10px] uppercase" },
                  { header: "Nível", accessorKey: "level", className: "text-center w-20" },
                  { 
                    header: "Ações", 
                    className: "text-right",
                    cell: (q) => (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-500/10 text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    )
                  }
                ]}
                data={questions}
              />
            )}
          </div>
        )}
      </div>

      {/* Period Edit Modal */}
      <Dialog open={!!editingPeriod} onOpenChange={(open) => !open && setEditingPeriod(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">{editingPeriod?.id ? 'Editar Período' : 'Novo Período'}</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Preencha os dados abaixo para {editingPeriod?.id ? 'atualizar o' : 'criar um novo'} período histórico.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold text-xs uppercase tracking-widest">Nome</Label>
              <Input 
                value={editingPeriod?.name || ""} 
                onChange={(e) => setEditingPeriod({ ...editingPeriod!, name: e.target.value })}
                className="col-span-3 rounded-xl border-border/50" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold text-xs uppercase tracking-widest">Emoji / Anos</Label>
              <Input 
                value={editingPeriod?.emoji || ""} 
                onChange={(e) => setEditingPeriod({ ...editingPeriod!, emoji: e.target.value })}
                placeholder="Emoji"
                className="col-span-1 rounded-xl border-border/50 text-center" 
              />
              <Input 
                value={editingPeriod?.years || ""} 
                onChange={(e) => setEditingPeriod({ ...editingPeriod!, years: e.target.value })}
                placeholder="Ex: 1500-1822"
                className="col-span-2 rounded-xl border-border/50" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold text-xs uppercase tracking-widest">Descrição</Label>
              <Textarea 
                value={editingPeriod?.description || ""} 
                onChange={(e) => setEditingPeriod({ ...editingPeriod!, description: e.target.value })}
                className="col-span-3 rounded-xl border-border/50 min-h-[100px]" 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPeriod(null)} className="rounded-xl font-bold uppercase tracking-widest text-xs">Cancelar</Button>
            <Button onClick={handleSavePeriod} disabled={isSaving} className="duo-btn duo-btn-primary px-8">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Período'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPanel;
