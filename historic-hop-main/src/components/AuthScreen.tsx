import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

const AuthScreen = ({ onSkip }: { onSkip: () => void }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError("Digite seu nome de jogador");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error);
      else setSuccess("Conta criada! Verifique seu email para confirmar.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 mb-4 shadow-lg">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Historic Hop</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {mode === "login" ? "Entre para salvar seu progresso" : "Crie sua conta de jogador"}
        </p>
      </div>

      <div className="duo-card-flat p-6 space-y-5">
        {/* Toggle */}
        <div className="flex rounded-xl overflow-hidden border-2 border-border">
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="inline w-4 h-4 mr-1" /> Entrar
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="inline w-4 h-4 mr-1" /> Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nome de jogador"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
          {success && <p className="text-sm text-success text-center font-medium">{success}</p>}

          <button type="submit" disabled={loading} className="duo-btn duo-btn-primary w-full text-base py-3.5">
            {loading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
        >
          Jogar sem conta (progresso local apenas)
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
