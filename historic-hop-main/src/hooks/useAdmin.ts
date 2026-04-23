import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // For now, any logged-in user can access the admin panel in local development
    setIsAdmin(true);
    setLoading(false);
  }, [user]);

  return { isAdmin, loading };
}
