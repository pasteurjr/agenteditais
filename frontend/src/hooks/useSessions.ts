import { useState, useEffect, useCallback } from "react";
import type { Session } from "../types";
import {
  fetchSessions,
  createSession,
  deleteSession,
  renameSession,
} from "../api/client";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error("Erro ao carregar sessões:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const addSession = async (name?: string) => {
    const session = await createSession(name);
    setSessions((prev) => [session, ...prev]);
    return session;
  };

  const removeSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
  };

  const updateSessionName = async (sessionId: string, name: string) => {
    await renameSession(sessionId, name);
    setSessions((prev) =>
      prev.map((s) => (s.session_id === sessionId ? { ...s, name } : s))
    );
  };

  return {
    sessions,
    loading,
    addSession,
    removeSession,
    updateSessionName,
    refreshSessions: loadSessions,
  };
}
