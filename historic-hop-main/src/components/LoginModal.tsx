import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

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
      
      <div className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-scale">
        {/* Header Decor */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Inicie sua Jornada</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
              </h2>
              <p className="text-sm text-white/40 font-medium mt-1">
                {isLogin ? "Entre para continuar sua exploração." : "Junte-se a milhares de exploradores."}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Entrar" : "Criar Conta"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/40 font-medium">
              {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Cadastre-se agora" : "Entre aqui"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
