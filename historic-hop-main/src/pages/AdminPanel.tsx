import { useState, useEffect, useCallback, cloneElement } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { 
  Users, 
  BookOpen, 
  Zap, 
  Plus, 
  Search, 
  LayoutDashboard, 
  Map as MapIcon, 
  Settings,
  AlertCircle,
  Loader2,
  Filter,
  Menu,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PeriodTable } from "@/components/admin/PeriodTable";
import { PeriodForm } from "@/components/admin/PeriodForm";
import { ActivityTable } from "@/components/admin/ActivityTable";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminPanel = () => {
  const { session, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modais
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const [statsData, periodsData, activitiesData] = await Promise.all([
        adminService.getStats(session.access_token),
        adminService.getPeriods(session.access_token),
        adminService.getActivities(session.access_token, filterPeriod || undefined, filterType || undefined)
      ]);
      setStats(statsData);
      setPeriods(periodsData);
      setActivities(activitiesData);
    } catch (error) {
      toast.error("Erro ao carregar dados do painel");
    } finally {
      setLoading(false);
    }
  }, [session, filterPeriod, filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePeriod = async (data: any) => {
    try {
      await adminService.createPeriod(session?.access_token || "", data);
      toast.success("Período criado com sucesso!");
      setIsPeriodModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao criar período");
    }
  };

  const handleUpdatePeriod = async (data: any) => {
    try {
      await adminService.updatePeriod(session?.access_token || "", editingPeriod.id, data);
      toast.success("Período atualizado!");
      setIsPeriodModalOpen(false);
      setEditingPeriod(null);
      fetchData();
    } catch (error) {
      toast.error("Erro ao atualizar período");
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!confirm("Tem certeza? Isso pode afetar atividades vinculadas.")) return;
    try {
      await adminService.deletePeriod(session?.access_token || "", id);
      toast.success("Período excluído");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir período");
    }
  };

  const handleCreateActivity = async (data: any) => {
    try {
      await adminService.createActivity(session?.access_token || "", data);
      toast.success("Atividade salva!");
      setIsActivityModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar atividade");
    }
  };

  const handleUpdateActivity = async (data: any) => {
    try {
      await adminService.updateActivity(session?.access_token || "", editingActivity.id, data);
      toast.success("Atividade atualizada!");
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      fetchData();
    } catch (error) {
      toast.error("Erro ao atualizar atividade");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Excluir esta atividade?")) return;
    try {
      await adminService.deleteActivity(session?.access_token || "", id);
      toast.success("Atividade excluída");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir atividade");
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-quiz-bg">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-quiz-primary mb-4" />
        <p className="text-[10px] md:text-xs text-quiz-text-muted font-black uppercase tracking-widest text-center">Acessando Arquivos Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-bg text-quiz-text-main flex flex-col md:flex-row relative">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-72 md:w-64 lg:w-72 bg-quiz-surface border-r border-quiz-border transition-transform duration-300 md:relative md:translate-x-0 md:flex md:flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:p-8 flex flex-col h-full gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-quiz-primary rounded-xl flex items-center justify-center text-black font-black">H</div>
              <span className="font-black text-xl tracking-tighter">ADMIN PANEL</span>
            </div>
            <button className="md:hidden p-2 text-quiz-text-muted" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 md:gap-2">
            <AdminNavItem 
              active={activeTab === "dashboard"} 
              onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
            />
            <AdminNavItem 
              active={activeTab === "periods"} 
              onClick={() => { setActiveTab("periods"); setIsSidebarOpen(false); }} 
              icon={<MapIcon />} 
              label="Períodos" 
            />
            <AdminNavItem 
              active={activeTab === "activities"} 
              onClick={() => { setActiveTab("activities"); setIsSidebarOpen(false); }} 
              icon={<BookOpen />} 
              label="Atividades" 
            />
            <AdminNavItem 
              active={activeTab === "users"} 
              onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }} 
              icon={<Users />} 
              label="Usuários" 
            />
            <AdminNavItem 
              active={activeTab === "settings"} 
              onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} 
              icon={<Settings />} 
              label="Configurações" 
            />
          </nav>

          <div className="mt-auto p-4 bg-quiz-bg rounded-xl border border-quiz-border">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-quiz-primary/20 flex items-center justify-center text-quiz-primary text-[10px] font-black">AD</div>
               <div className="min-w-0">
                  <p className="text-xs font-black text-quiz-text-main truncate">{profile?.display_name || "Admin"}</p>
                  <p className="text-[10px] text-quiz-text-muted">Status: Online</p>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-quiz-surface border-b border-quiz-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-quiz-primary rounded-lg flex items-center justify-center text-black font-black text-xs">H</div>
            <span className="font-black text-sm uppercase tracking-tighter">{activeTab}</span>
          </div>
          <button className="p-2 bg-quiz-bg rounded-lg border border-quiz-border" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-quiz-primary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          {activeTab === "dashboard" && (
            <div className="space-y-6 md:space-y-8 animate-fade-in max-w-7xl mx-auto">
              <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase">DASHBOARD</h1>
                  <p className="text-quiz-text-muted text-xs md:text-sm font-medium">Visão geral do ecossistema Historic Hop.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard label="Usuários Totais" value={stats?.totalUsers || 0} icon={<Users className="text-quiz-primary" />} />
                <StatCard label="Atividades Ativas" value={stats?.totalActivities || 0} icon={<BookOpen className="text-quiz-primary" />} />
                <StatCard label="Períodos Criados" value={stats?.totalPeriods || 0} icon={<MapIcon className="text-quiz-primary" />} />
                <StatCard label="Precisão Média" value={`${stats?.avgAccuracy || 0}%`} icon={<Zap className="text-quiz-primary" />} />
              </div>

              <Card className="bg-quiz-surface border-quiz-border p-6 md:p-8 shadow-xl">
                 <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                   <AlertCircle className="w-5 h-5 text-quiz-primary" /> Status do Sistema
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <StatusIndicator label="Servidor Backend" value="Online (v2.4.0)" />
                    <StatusIndicator label="Banco de Dados" value="Conectado (PostgreSQL)" />
                    <StatusIndicator label="Serviço de IA" value="Groq API (Stable)" />
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "periods" && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase">GESTÃO DE PERÍODOS</h2>
                  <Button onClick={() => { setEditingPeriod(null); setIsPeriodModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black text-xs md:text-sm h-11 md:h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" /> NOVO PERÍODO
                  </Button>
               </div>
               <div className="bg-quiz-surface rounded-2xl border border-quiz-border overflow-hidden">
                 <PeriodTable 
                    periods={periods} 
                    onEdit={(p) => { setEditingPeriod(p); setIsPeriodModalOpen(true); }}
                    onDelete={handleDeletePeriod}
                    onViewActivities={(id) => { setFilterPeriod(id); setActiveTab("activities"); }}
                 />
               </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase">BANCO DE QUESTÕES</h2>
                  <Button onClick={() => { setEditingActivity(null); setIsActivityModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black text-xs md:text-sm h-11 md:h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" /> NOVA ATIVIDADE
                  </Button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-quiz-surface border border-quiz-border rounded-xl">
                  <div className="lg:col-span-7 flex items-center gap-3 bg-quiz-bg rounded-lg px-3 py-2 border border-quiz-border">
                    <Search className="w-4 h-4 text-quiz-text-muted" />
                    <Input placeholder="Pesquisar atividades..." className="bg-transparent border-none h-8 text-sm p-0 focus-visible:ring-0" />
                  </div>
                  <div className="lg:col-span-5 grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-quiz-primary" />
                        <select 
                          value={filterPeriod} 
                          onChange={e => setFilterPeriod(e.target.value)}
                          className="w-full bg-quiz-bg border border-quiz-border rounded-lg text-[10px] md:text-xs py-2 pl-8 pr-2 appearance-none outline-none focus:border-quiz-primary"
                        >
                          <option value="">Todos Períodos</option>
                          {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <Badge className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-transparent p-0"><Zap className="w-3.5 h-3.5 text-quiz-primary" /></Badge>
                        <select 
                          className="w-full bg-quiz-bg border border-quiz-border rounded-lg text-[10px] md:text-xs py-2 pl-8 pr-2 appearance-none outline-none focus:border-quiz-primary"
                        >
                          <option value="">Todas Dificuldades</option>
                          <option value="facil">Fácil</option>
                          <option value="medio">Médio</option>
                          <option value="avancado">Avançado</option>
                        </select>
                      </div>
                  </div>
               </div>

               <div className="bg-quiz-surface rounded-2xl border border-quiz-border overflow-hidden">
                 <ActivityTable 
                    activities={activities}
                    periods={periods}
                    onEdit={(a) => { setEditingActivity(a); setIsActivityModalOpen(true); }}
                    onDelete={handleDeleteActivity}
                    onDuplicate={(a) => { setEditingActivity({...a, id: undefined}); setIsActivityModalOpen(true); }}
                 />
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Modais Responsivos */}
      <Dialog open={isPeriodModalOpen} onOpenChange={setIsPeriodModalOpen}>
        <DialogContent className="max-w-2xl bg-quiz-surface border-quiz-border text-quiz-text-main p-4 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {editingPeriod ? "Editar Período" : "Criar Novo Período"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <PeriodForm 
              initialData={editingPeriod} 
              onSubmit={editingPeriod ? handleUpdatePeriod : handleCreatePeriod}
              onCancel={() => setIsPeriodModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl bg-quiz-surface border-quiz-border text-quiz-text-main p-4 md:p-8 h-[95vh] md:h-auto flex flex-col">
          <DialogHeader className="shrink-0 mb-4">
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {editingActivity ? "Editar Atividade" : "Criar Nova Atividade"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ActivityForm 
              periods={periods}
              initialData={editingActivity}
              onSubmit={editingActivity && editingActivity.id ? handleUpdateActivity : handleCreateActivity}
              onCancel={() => setIsActivityModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminNavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold transition-all",
      active ? "bg-quiz-primary text-black shadow-lg shadow-quiz-primary/10" : "text-quiz-text-muted hover:bg-quiz-bg hover:text-quiz-text-main"
    )}
  >
    {cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    {label}
  </button>
);

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <Card className="bg-quiz-surface border-quiz-border p-5 md:p-6 hover:border-quiz-primary/30 transition-all group shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 md:p-3 bg-quiz-bg rounded-xl border border-quiz-border group-hover:border-quiz-primary/50 transition-all">
        {cloneElement(icon as React.ReactElement, { className: "w-5 h-5 md:w-6 md:h-6" })}
      </div>
      <Badge variant="outline" className="bg-quiz-bg border-quiz-correct/20 text-quiz-correct text-[10px]">+12%</Badge>
    </div>
    <p className="text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    <h4 className="text-2xl md:text-3xl lg:text-4xl font-black mt-1">{value}</h4>
  </Card>
);

const StatusIndicator = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] md:text-xs font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    <p className="text-quiz-correct text-xs md:text-sm font-bold flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-quiz-correct animate-pulse" /> 
      {value}
    </p>
  </div>
);

export default AdminPanel;
