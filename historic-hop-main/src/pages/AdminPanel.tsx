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
  Menu,
  X,
  TrendingUp,
  Activity as ActivityIcon,
  Database,
  Globe,
  LogOut,
  ChevronRight
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
import { UserTable } from "@/components/admin/UserTable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
      const [statsData, periodsData, activitiesData, usersData] = await Promise.all([
        adminService.getStats(session.access_token),
        adminService.getPeriods(session.access_token),
        adminService.getActivities(session.access_token, filterPeriod || undefined, filterType || undefined),
        adminService.getUsers(session.access_token)
      ]);
      setStats(statsData);
      setPeriods(periodsData);
      setActivities(activitiesData);
      setUsers(usersData);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#08080a]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-quiz-primary" />
          <div className="absolute inset-0 blur-xl bg-quiz-primary/20 animate-pulse" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-quiz-primary animate-pulse">Sincronizando Sistema Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-quiz-text-main flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-md z-[90] transition-opacity duration-500 md:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-72 bg-quiz-surface border-r border-quiz-border transition-all duration-500 md:relative md:translate-x-0 flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-quiz-primary rounded-2xl flex items-center justify-center text-black shadow-xl shadow-quiz-primary/20">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tighter uppercase leading-none">Historic <span className="text-quiz-primary">Hop</span></h1>
                <p className="text-[10px] font-bold text-quiz-text-muted uppercase tracking-[0.2em] mt-1">Admin Panel</p>
              </div>
            </div>
            <button className="md:hidden p-2 text-quiz-text-muted hover:text-quiz-primary" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            <AdminNavItem active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} icon={<LayoutDashboard />} label="Dashboard" />
            <AdminNavItem active={activeTab === "periods"} onClick={() => { setActiveTab("periods"); setIsSidebarOpen(false); }} icon={<MapIcon />} label="Períodos Históricos" />
            <AdminNavItem active={activeTab === "activities"} onClick={() => { setActiveTab("activities"); setIsSidebarOpen(false); }} icon={<BookOpen />} label="Banco de Atividades" />
            <AdminNavItem active={activeTab === "users"} onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }} icon={<Users />} label="Gestão de Usuários" />
            <div className="my-4 border-t border-quiz-border opacity-50" />
            <AdminNavItem active={false} onClick={() => navigate('/')} icon={<Globe />} label="Visualizar Site" />
          </nav>

          <div className="mt-auto space-y-4">
             <div className="p-4 bg-quiz-bg rounded-2xl border border-quiz-border flex items-center gap-3 group hover:border-quiz-primary transition-all">
                <div className="w-10 h-10 rounded-xl bg-quiz-primary/10 flex items-center justify-center text-quiz-primary font-black">
                   {profile?.display_name?.charAt(0) || "A"}
                </div>
                <div className="min-w-0 flex-1">
                   <p className="text-[10px] font-black text-quiz-text-main truncate uppercase">{profile?.display_name || "Administrador"}</p>
                   <p className="text-[8px] font-bold text-quiz-correct uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-quiz-correct animate-pulse" /> Online
                   </p>
                </div>
                <button onClick={signOut} className="p-2 text-quiz-text-muted hover:text-quiz-wrong transition-colors">
                   <LogOut className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-6 bg-quiz-surface border-b border-quiz-border shrink-0 z-50">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-quiz-primary" />
            <span className="font-black uppercase tracking-widest text-xs">{activeTab}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center bg-quiz-bg rounded-xl border border-quiz-border" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-quiz-primary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {activeTab === "dashboard" && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase italic leading-none mb-4">
                      Visão Geral <span className="text-quiz-primary">SaaS</span>
                    </h2>
                    <p className="text-quiz-text-muted text-xs md:text-sm font-medium uppercase tracking-[0.2em]">Monitoramento em tempo real do ecossistema.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-quiz-surface border border-quiz-border rounded-full text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">
                     <ActivityIcon className="w-3 h-3 text-quiz-primary" /> Ultima atualização: Agora
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Usuários Totais" value={stats?.totalUsers || 0} trend="+5.4%" trendUp={true} icon={<Users />} gradient="from-blue-600/20 to-transparent" />
                  <StatCard label="Atividades Ativas" value={stats?.totalActivities || 0} trend="+12%" trendUp={true} icon={<BookOpen />} gradient="from-purple-600/20 to-transparent" />
                  <StatCard label="Períodos Criados" value={stats?.totalPeriods || 0} trend="Estável" trendUp={true} icon={<MapIcon />} gradient="from-amber-600/20 to-transparent" />
                  <StatCard label="Precisão Média" value={`${stats?.avgAccuracy || 0}%`} trend="-1.2%" trendUp={false} icon={<Zap />} gradient="from-emerald-600/20 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <Card className="lg:col-span-2 bg-quiz-surface border-quiz-border p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                         <TrendingUp className="w-32 h-32" />
                      </div>
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                        <ActivityIcon className="w-6 h-6 text-quiz-primary" /> Performance do Sistema
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                         <StatusBox icon={<Database />} label="Database" value="Conectado" status="success" />
                         <StatusBox icon={<Zap />} label="AI Service" value="Groq v3.5" status="success" />
                         <StatusBox icon={<Globe />} label="API Gateway" value="v2.4.0 (Stable)" status="success" />
                      </div>
                   </Card>

                   <Card className="bg-gradient-to-br from-quiz-primary to-amber-600 p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between text-black relative overflow-hidden group">
                      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Ação Rápida</h3>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed">Crie novos períodos e expanda a linha do tempo agora mesmo.</p>
                      </div>
                      <Button onClick={() => { setEditingPeriod(null); setIsPeriodModalOpen(true); }} className="mt-8 bg-black text-white hover:bg-black/80 font-black rounded-xl h-14 uppercase tracking-[0.2em] text-[10px]">
                         Novo Período <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                   </Card>
                </div>
              </div>
            )}

            {activeTab === "periods" && (
              <div className="space-y-8">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Gestão de <span className="text-quiz-primary">Períodos</span></h2>
                      <p className="text-quiz-text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Controle a cronologia do sistema.</p>
                    </div>
                    <Button onClick={() => { setEditingPeriod(null); setIsPeriodModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black text-xs h-14 px-8 rounded-xl shadow-xl shadow-quiz-primary/20 uppercase tracking-widest">
                      <Plus className="w-5 h-5 mr-2" /> Novo Período
                    </Button>
                 </div>
                 <div className="bg-quiz-surface rounded-[2rem] border border-quiz-border overflow-hidden shadow-2xl">
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
              <div className="space-y-8">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Banco de <span className="text-quiz-primary">Questões</span></h2>
                      <p className="text-quiz-text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Gerencie os desafios gamificados.</p>
                    </div>
                    <Button onClick={() => { setEditingActivity(null); setIsActivityModalOpen(true); }} className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black text-xs h-14 px-8 rounded-xl shadow-xl shadow-quiz-primary/20 uppercase tracking-widest">
                      <Plus className="w-5 h-5 mr-2" /> Nova Atividade
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-quiz-surface border border-quiz-border rounded-[2rem] shadow-xl">
                    <div className="lg:col-span-6 flex items-center gap-4 bg-quiz-bg rounded-xl px-4 py-3 border border-quiz-border focus-within:border-quiz-primary transition-colors">
                      <Search className="w-5 h-5 text-quiz-text-muted" />
                      <Input placeholder="Pesquisar por título ou conteúdo..." className="bg-transparent border-none h-auto p-0 text-xs md:text-sm focus-visible:ring-0 uppercase font-bold tracking-widest placeholder:text-quiz-text-muted/50" />
                    </div>
                    <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="bg-quiz-bg border border-quiz-border rounded-xl text-[10px] font-black uppercase tracking-widest py-3 px-4 appearance-none outline-none focus:border-quiz-primary cursor-pointer">
                          <option value="">Todos os Períodos</option>
                          {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select className="bg-quiz-bg border border-quiz-border rounded-xl text-[10px] font-black uppercase tracking-widest py-3 px-4 appearance-none outline-none focus:border-quiz-primary cursor-pointer">
                          <option value="">Qualquer Tipo</option>
                          <option value="quiz">Quiz</option>
                          <option value="v_f">V/F</option>
                        </select>
                    </div>
                 </div>

                 <div className="bg-quiz-surface rounded-[2rem] border border-quiz-border overflow-hidden shadow-2xl">
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

            {activeTab === "users" && (
              <div className="space-y-8">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Gestão de <span className="text-quiz-primary">Usuários</span></h2>
                      <p className="text-quiz-text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Monitore e gerencie os exploradores da história.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-quiz-correct/10 border border-quiz-correct/20 px-6 py-4 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-quiz-correct/20 flex items-center justify-center text-quiz-correct">
                          <Users className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-quiz-correct">Total Ativos</p>
                          <p className="text-xl font-black text-quiz-text-main leading-none">{users.length}</p>
                       </div>
                    </div>
                 </div>
                 <div className="bg-quiz-surface rounded-[2rem] border border-quiz-border overflow-hidden shadow-2xl">
                   <UserTable users={users} />
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isPeriodModalOpen} onOpenChange={setIsPeriodModalOpen}>
        <DialogContent className="max-w-2xl bg-quiz-surface border-quiz-border text-quiz-text-main p-8 rounded-[2.5rem]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
              {editingPeriod ? "Configurar Período" : "Explorar Novo Tempo"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <PeriodForm initialData={editingPeriod} onSubmit={editingPeriod ? handleUpdatePeriod : handleCreatePeriod} onCancel={() => setIsPeriodModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl bg-quiz-surface border-quiz-border text-quiz-text-main p-8 rounded-[2.5rem] h-[90vh] md:h-auto flex flex-col">
          <DialogHeader className="shrink-0 mb-6">
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
              {editingActivity ? "Refinar Desafio" : "Injetar Atividade"}
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
  <button 
    onClick={onClick} 
    className={cn(
      "flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group border",
      active 
        ? "bg-quiz-primary border-quiz-primary text-black shadow-xl shadow-quiz-primary/10" 
        : "text-quiz-text-muted hover:bg-quiz-bg hover:text-quiz-text-main border-transparent hover:border-quiz-border"
    )}
  >
    <div className={cn("transition-transform group-hover:scale-110", active ? "text-black" : "text-quiz-text-muted group-hover:text-quiz-primary")}>
       {cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
    {label}
  </button>
);

const StatCard = ({ label, value, icon, trend, trendUp, gradient }: { label: string, value: string | number, icon: React.ReactNode, trend: string, trendUp: boolean, gradient: string }) => (
  <Card className={cn(
    "bg-quiz-surface border-quiz-border p-8 rounded-[2rem] transition-all group relative overflow-hidden shadow-xl border-b-4",
    trendUp ? "border-b-quiz-correct/50" : "border-b-quiz-wrong/50"
  )}>
    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", gradient)} />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-4 bg-quiz-bg rounded-2xl border border-quiz-border shadow-inner group-hover:border-quiz-primary transition-colors">
        {cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-quiz-primary" })}
      </div>
      <div className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border",
        trendUp ? "bg-quiz-correct/10 text-quiz-correct border-quiz-correct/20" : "bg-quiz-wrong/10 text-quiz-wrong border-quiz-wrong/20"
      )}>
        {trendUp ? <TrendingUp className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-quiz-text-muted uppercase tracking-[0.2em] mb-2">{label}</p>
      <h4 className="text-3xl font-black tracking-tight">{value}</h4>
    </div>
  </Card>
);

const StatusBox = ({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: 'success' | 'warning' | 'error' }) => (
  <div className="p-5 bg-quiz-bg rounded-2xl border border-quiz-border group hover:border-quiz-primary transition-all">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-quiz-text-muted group-hover:text-quiz-primary transition-colors">
        {cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <p className="text-[10px] font-black text-quiz-text-muted uppercase tracking-widest">{label}</p>
    </div>
    <div className={cn(
      "text-sm font-bold flex items-center gap-2",
      status === 'success' ? "text-quiz-correct" : "text-quiz-wrong"
    )}>
      <span className={cn("w-2 h-2 rounded-full animate-pulse", status === 'success' ? "bg-quiz-correct" : "bg-quiz-wrong")} />
      {value}
    </div>
  </div>
);

export default AdminPanel;
