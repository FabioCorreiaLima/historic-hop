import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Globe, Award, Zap, ChevronRight, History, BookOpen, ShieldCheck } from "lucide-react";
import { useState } from "react";
import LoginModal from "./LoginModal";

const LandingPage = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary selection:text-white overflow-x-hidden relative">
      {/* Imagem de Fundo Imersiva */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-[#0a0a0c] z-10" />
        <img 
          src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2070&auto=format&fit=crop" 
          alt="History Background" 
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-transparent px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 ring-1 ring-white/20">
              <History className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-[0.1em] uppercase">Historic Hop</span>
          </div>
          <button 
            onClick={() => setShowLogin(true)}
            className="px-8 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
          >
            Acessar Plataforma
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">A Nova Fronteira do Conhecimento</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1] tracking-tighter animate-fade-in-up">
            DESCUBRA O<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">PASSADO VIVO.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-white/70 mb-16 font-medium animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Transformamos a história em uma jornada interativa épica.<br className="hidden md:block" /> 
            Desafie sua mente com conteúdos gerados por IA e conquiste o tempo.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={() => setShowLogin(true)}
              className="group relative px-10 py-5 bg-primary rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(168,85,247,0.4)] flex items-center gap-4 overflow-hidden"
            >
              Iniciar Exploração
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-7xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {[
            {
              icon: Globe,
              title: "Jornada Universal",
              desc: "Navegue por todas as eras da humanidade em uma linha do tempo dinâmica e imersiva.",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              icon: Zap,
              title: "Conteúdo Inteligente",
              desc: "Atividades e desafios históricos gerados em tempo real por inteligência artificial.",
              color: "text-amber-400",
              bg: "bg-amber-400/10"
            },
            {
              icon: Award,
              title: "Legado de Glória",
              desc: "Ganhe insígnias reais, suba no ranking global e torne-se um mestre da história.",
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.07] transition-all hover:-translate-y-3">
              <div className={`w-16 h-16 ${feature.bg} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-white/50 text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 pt-12 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Historic Hop</span>
          </div>
          <p className="text-sm text-white/30 font-medium">© 2026 Historic Hop. Explorando o tempo, uma descoberta por vez.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LandingPage;
