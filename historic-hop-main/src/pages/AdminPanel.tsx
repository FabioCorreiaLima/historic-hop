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
  
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [editingActivity, setEditingActivity] = useState<any>(null);

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
      toast.success("Período criado!");
      setIsPeriodModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Erro ao criar"); }
  };

  const handleUpdatePeriod = async (data: any) => {
    try {
      await adminService.updatePeriod(session?.access_token || "", editingPeriod.id, data);
      toast.success("Período atualizado!");
      setIsPeriodModalOpen(false);
      setEditingPeriod(null);
      fetchData();
    } catch (error) { toast.error("Erro ao atualizar"); }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!confirm("Excluir período?")) return;
    try {
      await adminService.deletePeriod(session?.access_token || "", id);
      toast.success("Excluído");
      fetchData();
    } catch (error) { toast.error("Erro ao excluir"); }
  };

  const handleCreateActivity = async (data: any) => {
    try {
      await adminService.createActivity(session?.access_token || "", data);
      toast.success("Atividade salva!");
      setIsActivityModalOpen(false);
      fetchData();
    } catch (error) { toast.error("Erro ao salvar"); }
  };

  const handleUpdateActivity = async (data: any) => {
    try {
      await adminService.updateActivity(session?.access_token || "", editingActivity.id, data);
      toast.success("Atividade atualizada!");
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      fetchData();
    } catch (error) { toast.error("Erro ao atualizar"); }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Excluir atividade?")) return;
    try {
      await adminService.deleteActivity(session?.access_token || "", id);
      toast.success("Excluída");
      fetchData();
    } catch (error) { toast.error("Erro ao excluir"); }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-quiz-bg">
        <Loader2 className="w-10 h-10 animate-spin text-quiz-primary mb-4" />
        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-center">Acessando Arquivos Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-bg text-quiz-text-main flex flex-col md:flex-row relative">
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-64 lg:w-72 bg-quiz-surface border-r border-quiz-border transition-transform duration-300 md:relative md:translate-x-0 md:flex md:flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 lg:p-8 flex flex-col h-full gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-quiz-primary rounded-xl flex items-center justify-center text-black font-black">H</div>
              <span className="font-black text-base lg:text-lg tracking-tighter uppercase">ADMIN</span>
            </div>
            <button className="md:hidden p-2 text-quiz-text-muted" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <AdminNavItem active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} icon={<LayoutDashboard />} label="Dashboard" />
            <AdminNavItem active={activeTab === "periods"} onClick={() => { setActiveTab("periods"); setIsSidebarOpen(false); }} icon={<MapIcon />} label="Períodos" />
            <AdminNavItem active={activeTab === "activities"} onClick={() => { setActiveTab("activities"); setIsSidebarOpen(false); }} icon={<BookOpen />} label="Atividades" />
            <AdminNavItem active={activeTab === "users"} onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }} icon={<Users />} label="Usuários" />
            <AdminNavItem active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} icon={<Settings />} label="Config" />
          </nav>

          <div className="mt-auto p-4 bg-quiz-bg rounded-xl border border-quiz-border">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-quiz-primary/20 flex items-center justify-center text-quiz-primary text-xs font-black">AD</div>
               <div className="min-w-0">
                  <p className="text-xs font-black text-quiz-text-main truncate uppercase">{profile?.display_name || "Admin"}</p>
                  <p className="text-[10px] text-quiz-text-muted">Status: Online</p>
               </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-quiz-surface border-b border-quiz-border shrink-0">
          <div className="flex items-center gap-2 text-base font-black tracking-tighter uppercase">
            <div className="w-8 h-8 bg-quiz-primary rounded-lg flex items-center justify-center text-black font-black text-xs">H</div>
            <span>{activeTab}</span>
          </div>
          <button className="p-2 bg-quiz-bg rounded-lg border border-quiz-border" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-quiz-primary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6 md:space-y-8 animate-fade-in max-w-7xl mx-auto">
              <header>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase">DASHBOARD</h1>
                <p className="text-quiz-text-muted text-xs md:text-sm font-medium">Visão geral do ecossistema Historic Hop.</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard label="Usuários Totais" value={stats?.totalUsers || 0} icon={<Users className="text-quiz-primary" />} />
                <StatCard label="Atividades Ativas" value={stats?.totalActivities || 0} icon={<BookOpen className="text-quiz-primary" />} />
                <StatCard label="Períodos Criados" value={stats?.totalPeriods || 0} icon={<MapIcon className="text-quiz-primary" />} />
                <StatCard label="Precisão Média" value={`${stats?.avgAccuracy || 0}%`} icon={<Zap className="text-quiz-primary" />} />
              </div>

              <Card className="bg-quiz-surface border-quiz-border p-5 md:p-8 shadow-xl">
                 <h3 className="text-lg md:text-xl lg:text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                   <AlertCircle className="w-5 h-5 text-quiz-primary" /> Status do Sistema
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <StatusIndicator label="Backend" value="Online (v2.4.0)" />
                    <StatusIndicator label="Database" value="Conectado" />
                    <StatusIndicator label="AI Service" value="Groq Stable" />
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "periods" && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight">GESTÃO DE PERÍODOS</h2>
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
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight">BANCO DE QUESTÕES</h2>
                  <Button onClick={() => { setEditingActivity(null); setIsActivityModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black text-xs md:text-sm h-11 md:h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" /> NOVA ATIVIDADE
                  </Button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-quiz-surface border border-quiz-border rounded-xl">
                  <div className="lg:col-span-7 flex items-center gap-3 bg-quiz-bg rounded-lg px-3 py-2 border border-quiz-border">
                    <Search className="w-4 h-4 text-quiz-text-muted" />
                    <Input placeholder="Pesquisar..." className="bg-transparent border-none h-8 text-xs md:text-sm p-0 focus-visible:ring-0" />
                  </div>
                  <div className="lg:col-span-5 grid grid-cols-2 gap-2">
                      <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="bg-quiz-bg border border-quiz-border rounded-lg text-xs md:text-sm py-2 px-3 appearance-none outline-none focus:border-quiz-primary">
                        <option value="">Períodos</option>
                        {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <select className="bg-quiz-bg border border-quiz-border rounded-lg text-xs md:text-sm py-2 px-3 appearance-none outline-none focus:border-quiz-primary">
                        <option value="">Tipo</option>
                        <option value="quiz">Quiz</option>
                        <option value="v_f">V/F</option>
                      </select>
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

      <Dialog open={isPeriodModalOpen} onOpenChange={setIsPeriodModalOpen}>
        <DialogContent className="max-w-2xl bg-quiz-surface border-quiz-border text-quiz-text-main p-5 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tight">
              {editingPeriod ? "Editar Período" : "Criar Novo Período"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <PeriodForm initialData={editingPeriod} onSubmit={editingPeriod ? handleUpdatePeriod : handleCreatePeriod} onCancel={() => setIsPeriodModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl bg-quiz-surface border-quiz-border text-quiz-text-main p-5 md:p-8 h-[90vh] md:h-auto flex flex-col">
          <DialogHeader className="shrink-0 mb-4">
            <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tight">
              {editingActivity ? "Editar Atividade" : "Criar Nova Atividade"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ActivityForm periods={periods} initialData={editingActivity} onSubmit={editingActivity && editingActivity.id ? handleUpdateActivity : handleCreateActivity} onCancel={() => setIsActivityModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminNavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all", active ? "bg-quiz-primary text-black shadow-lg" : "text-quiz-text-muted hover:bg-quiz-bg hover:text-quiz-text-main")}>
    {cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    {label}
  </button>
);

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <Card className="bg-quiz-surface border-quiz-border p-5 md:p-6 hover:border-quiz-primary transition-all group shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 md:p-3 bg-quiz-bg rounded-xl border border-quiz-border">{cloneElement(icon as React.ReactElement, { className: "w-5 h-5 md:w-6 md:h-6" })}</div>
      <Badge variant="outline" className="text-[10px] md:text-xs">+12%</Badge>
    </div>
    <p className="text-xs md:text-sm font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    <h4 className="text-xl md:text-2xl lg:text-3xl font-black mt-1">{value}</h4>
  </Card>
);

const StatusIndicator = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-xs md:text-sm font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    <p className="text-quiz-correct text-xs md:text-sm font-bold flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-quiz-correct animate-pulse" /> {value}
    </p>
  </div>
);

export default AdminPanel;
