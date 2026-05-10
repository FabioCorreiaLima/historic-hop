import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MapPin, History, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-quiz-bg text-quiz-text-main p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-quiz-primary rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-quiz-surface border border-quiz-border rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
          <History className="w-12 h-12 md:w-16 md:h-16 text-quiz-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-quiz-primary italic">404</h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight">Perdido no Tempo?</h2>
          <p className="text-sm md:text-base text-quiz-text-muted font-medium max-w-xs mx-auto leading-relaxed">
            Parece que você viajou para uma coordenada que ainda não foi registrada em nossos arquivos históricos.
          </p>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-quiz-primary text-black font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:bg-quiz-primary-dark transition-all shadow-xl shadow-quiz-primary/10 active:scale-95 group"
        >
          <MapPin className="w-5 h-5" /> Voltar ao Mapa <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
