/**
 * Origem do backend Express (sem barra final).
 * Defina em `.env`: VITE_API_ORIGIN=http://localhost:5001
 */
const trim = (s: string) => s.replace(/\/$/, "");

export const API_ORIGIN = trim(import.meta.env.VITE_API_ORIGIN || "http://localhost:5001");

/** Prefixo `/api` do servidor Historic Hop */
export const API_BASE = `${API_ORIGIN}/api`;
