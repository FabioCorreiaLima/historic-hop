import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user, profile, loading: authLoading } = useAuth();
  
  // Apenas usuários com a flag is_admin no banco de dados verão o botão
  const isAdmin = profile?.is_admin === true;

  return { isAdmin, loading: authLoading };
}
