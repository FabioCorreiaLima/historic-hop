import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { useStreaks } from "./hooks/useStreaks";
import { cn } from "./lib/utils";
import { Navbar } from "./components/layout/Navbar";

import Index from "./pages/Index.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";
import RankingPage from "./pages/RankingPage.tsx";
import StorePage from "./pages/StorePage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const { streak } = useStreaks();

  return (
    <div className="min-h-screen bg-quiz-bg flex overflow-hidden">
      {user && !isAdminPath && (
        <Sidebar 
          totalStars={0} 
          streakCount={streak.currentStreak} 
          onOpenStore={() => {}} 
        />
      )}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {!isAdminPath && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/loja" element={<StorePage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/config" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
