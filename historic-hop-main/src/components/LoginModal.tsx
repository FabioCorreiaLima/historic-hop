import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

const LoginModal = ({ onClose }: Props) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = isLogin 
        ? await signIn(email, password) 
        : await signUp(email, password, name);

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-quiz-surface border border-quiz-border rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-scale">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-quiz-primary/0 via-quiz-primary to-quiz-primary/0" />
        
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 mb-3">
                <Sparkles className="w-3 h-3 text-quiz-primary" />
                <span className="text-[10px] font-black text-quiz-primary uppercase tracking-widest">Inicie sua Jornada</span>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-quiz-text-main tracking-tight uppercase">
                {isLogin ? "Bem-vindo!" : "Crie sua conta"}
              </h2>
              <p className="text-xs md:text-sm text-quiz-text-muted font-medium mt-1">
                {isLogin ? "Entre para continuar sua exploração." : "Junte-se a milhares de exploradores."}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-quiz-bg border border-quiz-border text-quiz-text-muted hover:text-quiz-text-main transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-quiz-text-muted uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-quiz-text-muted group-focus-within:text-quiz-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    className="w-full bg-quiz-bg border border-quiz-border rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm md:text-base text-quiz-text-main placeholder:text-quiz-text-muted/40 focus:border-quiz-primary/50 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-quiz-text-muted uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-quiz-text-muted group-focus-within:text-quiz-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-quiz-bg border border-quiz-border rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm md:text-base text-quiz-text-main placeholder:text-quiz-text-muted/40 focus:border-quiz-primary/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-quiz-text-muted uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-quiz-text-muted group-focus-within:text-quiz-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-quiz-bg border border-quiz-border rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm md:text-base text-quiz-text-main placeholder:text-quiz-text-muted/40 focus:border-quiz-primary/50 transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-quiz-wrong/10 border border-quiz-wrong/20 text-quiz-wrong text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-quiz-primary text-black font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl hover:bg-quiz-primary-dark active:scale-95 transition-all shadow-xl shadow-quiz-primary/10 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Entrar" : "Criar Conta"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-quiz-border text-center">
            <p className="text-xs md:text-sm text-quiz-text-muted font-medium">
              {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-quiz-primary font-bold hover:underline ml-1"
              >
                {isLogin ? "Cadastre-se" : "Entre aqui"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
