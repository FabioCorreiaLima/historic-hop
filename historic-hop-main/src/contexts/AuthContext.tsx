import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { API_BASE } from "@/config/api";

export interface User {
  id: string;
  email: string;
}

interface Profile {
  display_name: string;
  avatar_url: string | null;
  is_admin?: boolean;
}

interface AuthState {
  user: User | null;
  session: { access_token: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        setSession({ access_token: token });
        await fetchProfile(token);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  async function fetchProfile(token: string) {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ id: data.id, email: data.email });
        setProfile({
          display_name: data.name || data.email,
          avatar_url: data.avatar,
          is_admin: data.is_admin === true,
        });
      } else {
        // Token might be invalid
        localStorage.removeItem("auth_token");
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: displayName })
      });
      const data = await res.json();
      
      if (!res.ok) return { error: data.error || "Erro ao registrar" };
      
      localStorage.setItem("auth_token", data.token);
      setSession({ access_token: data.token });
      setUser(data.user);
      setProfile({
        display_name: data.user.name,
        avatar_url: data.user.avatar,
        is_admin: data.user.is_admin === true,
      });
      
      return { error: null };
    } catch (error) {
      return { error: "Erro de conexão" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) return { error: data.error || "Credenciais inválidas" };
      
      localStorage.setItem("auth_token", data.token);
      setSession({ access_token: data.token });
      setUser(data.user);
      setProfile({
        display_name: data.user.name,
        avatar_url: data.user.avatar,
        is_admin: data.user.is_admin === true,
      });
      
      return { error: null };
    } catch (error) {
      return { error: "Erro de conexão" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name: data.display_name, avatar: data.avatar_url })
      });
      
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
