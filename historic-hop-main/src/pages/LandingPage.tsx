import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Globe, 
  Award, 
  Zap, 
  History, 
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
    <div className="min-h-screen bg-quiz-bg text-quiz-text-main selection:bg-quiz-primary selection:text-black overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-quiz-bg/80 via-quiz-bg/40 to-quiz-bg z-10" />
        <img 
          src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2070&auto=format&fit=crop" 
          alt="History Background" 
          className="w-full h-full object-cover opacity-10 grayscale"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-6 md:py-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-quiz-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-quiz-primary/20">
              <History className="w-6 h-6 md:w-7 md:h-7 text-black" />
            </div>
            <span className="text-lg md:text-xl lg:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">Historic Hop</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={() => setShowLogin(true)}
              className="bg-quiz-surface border border-quiz-border text-quiz-text-main hover:bg-quiz-primary hover:text-black transition-all rounded-xl px-4 md:px-8 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest"
            >
              Acessar
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 mb-8 md:mb-10"
          >
            <Sparkles className="w-4 h-4 text-quiz-primary" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-quiz-primary">A Nova Fronteira do Conhecimento</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-7xl font-black mb-8 md:mb-10 leading-[1.1] md:leading-[0.9] tracking-tighter uppercase italic"
          >
            DESCUBRA O<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-quiz-primary/50 via-quiz-primary to-quiz-primary/80">PASSADO VIVO.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-sm md:text-lg lg:text-xl text-quiz-text-muted mb-12 md:mb-16 font-medium leading-relaxed"
          >
            Navegue por períodos históricos em uma trilha gamificada.<br className="hidden md:block" /> 
            Conteúdo dinâmico gerado por IA para uma aprendizagem sem limites.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <Button 
              onClick={() => setShowLogin(true)}
              className="w-full sm:w-auto h-14 md:h-16 bg-quiz-primary text-black font-black px-8 md:px-10 rounded-2xl text-xs md:text-sm hover:bg-quiz-primary-dark transition-all shadow-[0_0_50px_rgba(234,179,8,0.2)]"
            >
              <PlayCircle className="w-5 h-5 mr-2" /> Começar Jornada
            </Button>
            <Button 
              variant="ghost"
              className="w-full sm:w-auto h-14 md:h-16 text-quiz-text-main font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-quiz-surface transition-all px-8"
            >
              Ver Demonstração <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="max-w-7xl mx-auto mt-40 md:mt-60 px-4">
           <div className="text-center mb-16 md:mb-20">
              <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-quiz-primary mb-4">Como Funciona</h2>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase italic">O aprendizado do futuro.</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                  color: "text-quiz-primary"
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
                  className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-quiz-surface/50 border border-quiz-border hover:border-quiz-primary/30 transition-all text-center md:text-left"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 bg-quiz-bg rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-quiz-border mx-auto md:mx-0`}>
                    <step.icon className={`w-7 h-7 md:w-8 md:h-8 ${step.color}`} />
                  </div>
                  <h3 className="text-base md:text-lg lg:text-xl font-black mb-4 tracking-tight uppercase">{step.title}</h3>
                  <p className="text-xs md:text-sm text-quiz-text-muted font-medium leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 md:py-20 px-6 z-10 border-t border-quiz-border bg-quiz-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-quiz-primary rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-black" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase">Historic Hop</span>
          </div>
          <p className="text-[10px] md:text-sm text-quiz-text-muted font-medium text-center md:text-left uppercase tracking-widest">© 2026 Historic Hop. Criado para o futuro da educação.</p>
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-quiz-text-muted hover:text-quiz-primary transition-colors">Instagram</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-quiz-text-muted hover:text-quiz-primary transition-colors">Twitter</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-quiz-text-muted hover:text-quiz-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LandingPage;
