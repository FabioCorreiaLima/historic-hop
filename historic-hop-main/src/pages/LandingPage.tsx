import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Globe, 
  Award, 
  Zap, 
  ChevronRight, 
  History, 
  BookOpen, 
  ShieldCheck,
  PlayCircle,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LandingPage = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-amber-500 selection:text-white overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(38,92,250,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-[#0a0a0c] z-10" />
        <img 
          src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2070&auto=format&fit=crop" 
          alt="History Background" 
          className="w-full h-full object-cover opacity-20 grayscale"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 ring-1 ring-white/20">
              <History className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Historic Hop</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={() => setShowLogin(true)}
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all px-8 py-6"
            >
              Acessar Plataforma
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-10"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">A Nova Fronteira do Conhecimento</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter"
          >
            DESCUBRA O<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">PASSADO VIVO.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-white/60 mb-16 font-medium leading-relaxed"
          >
            Navegue por períodos históricos em uma linha do tempo gamificada.<br className="hidden md:block" /> 
            Conteúdo dinâmico gerado por IA para uma aprendizagem sem limites.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button 
              onClick={() => setShowLogin(true)}
              className="duo-btn duo-btn-primary bg-amber-500 border-amber-700 hover:bg-amber-600 px-12 py-8 text-lg shadow-[0_0_50px_rgba(245,158,11,0.3)]"
            >
              <PlayCircle className="w-6 h-6 mr-3" /> Começar Jornada
            </Button>
            <Button 
              variant="ghost"
              className="rounded-2xl px-10 py-8 font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all"
            >
              Ver Demonstração <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="max-w-7xl mx-auto mt-60">
           <div className="text-center mb-20">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Como Funciona</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">O aprendizado do futuro.</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Escolha seu Destino",
                  desc: "Explore o mapa dos períodos históricos, do Brasil Colônia à Atualidade.",
                  color: "text-blue-400"
                },
                {
                  icon: Zap,
                  title: "Enfrente Desafios",
                  desc: "Participe de quizzes, associações e minigames gerados por IA.",
                  color: "text-amber-400"
                },
                {
                  icon: Award,
                  title: "Ganhe Recompensas",
                  desc: "Acumule XP, ganhe conquistas e suba no ranking dos historiadores.",
                  color: "text-emerald-400"
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-10 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-white/40 text-base leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-6 z-10 border-t border-white/5 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Historic Hop</span>
          </div>
          <p className="text-sm text-white/20 font-medium">© 2026 Historic Hop. Criado com ❤️ para o futuro da educação.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-amber-500 transition-colors">Instagram</a>
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-amber-500 transition-colors">Twitter</a>
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-amber-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LandingPage;
