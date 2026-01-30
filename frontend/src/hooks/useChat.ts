import { useState, useCallback } from "react";
import type { Message } from "../types";
import { sendMessage, getSessionMessages } from "../api/client";
import type { SendMessageResponse } from "../api/client";

// Status de carregamento para feedback visual
const LOADING_STATUSES = [
  "Detectando intenção...",
  "Analisando sua solicitação...",
  "Buscando editais no PNCP...",
  "Filtrando resultados relevantes...",
  "Calculando scores de aderência...",
  "Gerando análise detalhada...",
  "Formatando resposta..."
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const data = await getSessionMessages(sessionId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
      setMessages([]);
    }
  }, []);

  const send = useCallback(
    async (sessionId: string, text: string): Promise<SendMessageResponse | null> => {
      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Iniciar rotação de status
      let statusIndex = 0;
      setLoadingStatus(LOADING_STATUSES[0]);
      const statusInterval = setInterval(() => {
        statusIndex = (statusIndex + 1) % LOADING_STATUSES.length;
        setLoadingStatus(LOADING_STATUSES[statusIndex]);
      }, 3000);

      try {
        const response = await sendMessage(sessionId, text);
        const assistantMessage: Message = {
          role: "assistant",
          content: response.response,
          sources: response.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return response;
      } catch (err) {
        const errorMessage: Message = {
          role: "assistant",
          content: `Erro: ${err instanceof Error ? err.message : "Falha ao obter resposta"}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
        return null;
      } finally {
        clearInterval(statusInterval);
        setIsLoading(false);
        setLoadingStatus("");
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, loadingStatus, send, loadSession, clearMessages };
}
