import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Zap, 
  Plus, 
  Search, 
  LayoutDashboard, 
  Map as MapIcon, 
  Settings,
  AlertCircle,
  Loader2,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Loader2 className="w-12 h-12 animate-spin text-quiz-primary mb-4" />
        <p className="text-quiz-text-muted font-black uppercase tracking-widest">Acessando Arquivos Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-bg text-quiz-text-main flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-quiz-surface border-r border-quiz-border p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-quiz-primary rounded-xl flex items-center justify-center text-black font-black">H</div>
          <span className="font-black text-xl tracking-tighter">ADMIN PANEL</span>
        </div>

        <nav className="flex flex-col gap-2">
          <AdminNavItem active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard />} label="Dashboard" />
          <AdminNavItem active={activeTab === "periods"} onClick={() => setActiveTab("periods")} icon={<MapIcon />} label="Períodos" />
          <AdminNavItem active={activeTab === "activities"} onClick={() => setActiveTab("activities")} icon={<BookOpen />} label="Atividades" />
          <AdminNavItem active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users />} label="Usuários" />
          <AdminNavItem active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings />} label="Configurações" />
        </nav>

        <div className="mt-auto p-4 bg-quiz-bg rounded-xl border border-quiz-border">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-quiz-primary/20 flex items-center justify-center text-quiz-primary text-xs font-black">AD</div>
             <div>
                <p className="text-xs font-black text-quiz-text-main">{profile?.display_name || "Admin"}</p>
                <p className="text-[10px] text-quiz-text-muted">Status: Online</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tight">DASHBOARD</h1>
                <p className="text-quiz-text-muted font-medium">Visão geral do ecossistema Historic Hop.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Usuários Totais" value={stats?.totalUsers || 0} icon={<Users className="text-quiz-primary" />} />
              <StatCard label="Atividades Ativas" value={stats?.totalActivities || 0} icon={<BookOpen className="text-quiz-primary" />} />
              <StatCard label="Períodos Criados" value={stats?.totalPeriods || 0} icon={<MapIcon className="text-quiz-primary" />} />
              <StatCard label="Precisão Média" value={`${stats?.avgAccuracy || 0}%`} icon={<Zap className="text-quiz-primary" />} />
            </div>

            <Card className="bg-quiz-surface border-quiz-border p-8">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-quiz-primary" /> Sistema Operacional
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-quiz-text-muted uppercase">Servidor Backend</p>
                    <p className="text-quiz-correct font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-quiz-correct animate-pulse" /> Online (v2.4.0)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-quiz-text-muted uppercase">Banco de Dados</p>
                    <p className="text-quiz-correct font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-quiz-correct animate-pulse" /> Conectado (PostgreSQL)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-quiz-text-muted uppercase">Serviço de IA</p>
                    <p className="text-quiz-correct font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-quiz-correct animate-pulse" /> Groq API (Stable)</p>
                  </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === "periods" && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">GESTÃO DE PERÍODOS</h2>
                <Button onClick={() => { setEditingPeriod(null); setIsPeriodModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black">
                  <Plus className="w-4 h-4 mr-2" /> NOVO PERÍODO
                </Button>
             </div>
             <PeriodTable 
                periods={periods} 
                onEdit={(p) => { setEditingPeriod(p); setIsPeriodModalOpen(true); }}
                onDelete={handleDeletePeriod}
                onViewActivities={(id) => { setFilterPeriod(id); setActiveTab("activities"); }}
             />
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">BANCO DE QUESTÕES</h2>
                <Button onClick={() => { setEditingActivity(null); setIsActivityModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black">
                  <Plus className="w-4 h-4 mr-2" /> NOVA ATIVIDADE
                </Button>
             </div>

             <div className="flex gap-4 p-4 bg-quiz-surface border border-quiz-border rounded-xl">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-quiz-text-muted" />
                  <Input placeholder="Pesquisar atividades..." className="bg-quiz-bg border-none h-8 text-sm" />
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-quiz-primary" />
                      <select 
                        value={filterPeriod} 
                        onChange={e => setFilterPeriod(e.target.value)}
                        className="bg-quiz-bg border border-quiz-border rounded-md text-xs p-1"
                      >
                        <option value="">Todos Períodos</option>
                        {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                </div>
             </div>

             <ActivityTable 
                activities={activities}
                periods={periods}
                onEdit={(a) => { setEditingActivity(a); setIsActivityModalOpen(true); }}
                onDelete={handleDeleteActivity}
                onDuplicate={(a) => { setEditingActivity({...a, id: undefined}); setIsActivityModalOpen(true); }}
             />
          </div>
        )}
      </main>

      {/* Modais */}
      <Dialog open={isPeriodModalOpen} onOpenChange={setIsPeriodModalOpen}>
        <DialogContent className="max-w-2xl bg-quiz-surface border-quiz-border text-quiz-text-main">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              {editingPeriod ? "Editar Período" : "Criar Novo Período"}
            </DialogTitle>
          </DialogHeader>
          <PeriodForm 
            initialData={editingPeriod} 
            onSubmit={editingPeriod ? handleUpdatePeriod : handleCreatePeriod}
            onCancel={() => setIsPeriodModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl bg-quiz-surface border-quiz-border text-quiz-text-main max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              {editingActivity ? "Editar Atividade" : "Criar Nova Atividade"}
            </DialogTitle>
          </DialogHeader>
          <ActivityForm 
            periods={periods}
            initialData={editingActivity}
            onSubmit={editingActivity && editingActivity.id ? handleUpdateActivity : handleCreateActivity}
            onCancel={() => setIsActivityModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminNavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
      active ? "bg-quiz-primary text-black shadow-lg shadow-quiz-primary/10" : "text-quiz-text-muted hover:bg-quiz-bg hover:text-quiz-text-main"
    )}
  >
    {cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    {label}
  </button>
);

const StatCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <Card className="bg-quiz-surface border-quiz-border p-6 hover:border-quiz-primary/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-quiz-bg rounded-xl border border-quiz-border group-hover:border-quiz-primary/50 transition-all">
        {icon}
      </div>
      <Badge variant="outline" className="bg-quiz-bg border-quiz-correct/20 text-quiz-correct text-[10px]">+12%</Badge>
    </div>
    <p className="text-[10px] font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    <h4 className="text-3xl font-black mt-1">{value}</h4>
  </Card>
);

import { cloneElement } from "react";

export default AdminPanel;
