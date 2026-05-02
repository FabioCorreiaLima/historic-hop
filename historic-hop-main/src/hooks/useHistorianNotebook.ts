/**
 * useHistorianNotebook.ts
 * Hook para gerenciar o "Caderno do Historiador" — coleção de fatos históricos
 * que o aluno acumula ao longo das atividades. Persiste no localStorage.
 */

import { useState, useCallback, useEffect } from "react";

export interface HistorianEntry {
  id: string;
  periodId: string;
  periodName: string;
  fact: string;
  source: string;
  activityType: string;
  collectedAt: string; // ISO date string
  emoji: string;
}

const NOTEBOOK_KEY = "historian_notebook_v1";

export function useHistorianNotebook() {
  const [entries, setEntries] = useState<HistorianEntry[]>([]);
  const [newEntry, setNewEntry] = useState<HistorianEntry | null>(null);

  // Carregar do localStorage ao montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTEBOOK_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persistir no localStorage sempre que entries mudar
  useEffect(() => {
    try {
      localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries]);

  /**
   * Adiciona um novo fato ao caderno
   */
  const addFact = useCallback(
    (params: Omit<HistorianEntry, "id" | "collectedAt">) => {
      const entry: HistorianEntry = {
        ...params,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        collectedAt: new Date().toISOString(),
      };
      setEntries((prev) => [entry, ...prev]);
      setNewEntry(entry);
      // Auto-dismiss after 4 seconds
      setTimeout(() => setNewEntry(null), 4000);
      return entry;
    },
    []
  );

  /**
   * Retorna os fatos de um período específico
   */
  const getFactsByPeriod = useCallback(
    (periodId: string) => entries.filter((e) => e.periodId === periodId),
    [entries]
  );

  /**
   * Limpa o caderno (útil para testes)
   */
  const clearNotebook = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(NOTEBOOK_KEY);
  }, []);

  /**
   * Conta quantos fatos únicos foram coletados para um período
   */
  const countForPeriod = useCallback(
    (periodId: string) => entries.filter((e) => e.periodId === periodId).length,
    [entries]
  );

  const dismissNewEntry = useCallback(() => setNewEntry(null), []);

  return {
    entries,
    newEntry,
    totalCount: entries.length,
    addFact,
    getFactsByPeriod,
    countForPeriod,
    clearNotebook,
    dismissNewEntry,
  };
}
