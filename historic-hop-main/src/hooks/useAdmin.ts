import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user, profile, loading: authLoading } = useAuth();
  const devBypass = import.meta.env.DEV && !!user;
  const isAdmin = profile?.is_admin === true || devBypass;

  return { isAdmin, loading: authLoading };
}
