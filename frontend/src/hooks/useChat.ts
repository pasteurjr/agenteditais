import { useState, useCallback } from "react";
import type { Message } from "../types";
import { sendMessage, sendMessageWithFile, getSessionMessages } from "../api/client";
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
    async (sessionId: string, text: string, file?: File): Promise<SendMessageResponse | null> => {
      // Mostrar mensagem do usuário
      const userContent = file ? `📎 ${file.name}\n${text}` : text;
      const userMessage: Message = { role: "user", content: userContent };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Iniciar rotação de status
      let statusIndex = 0;
      const statuses = file
        ? ["Enviando arquivo...", "Extraindo texto do PDF...", "Identificando especificações...", "Cadastrando produto..."]
        : LOADING_STATUSES;
      setLoadingStatus(statuses[0]);
      const statusInterval = setInterval(() => {
        statusIndex = (statusIndex + 1) % statuses.length;
        setLoadingStatus(statuses[statusIndex]);
      }, 3000);

      try {
        // Se tem arquivo, usa endpoint de upload
        const response = file
          ? await sendMessageWithFile(sessionId, text, file)
          : await sendMessage(sessionId, text);

        const assistantMessage: Message = {
          role: "assistant",
          content: response.response,
          sources: response.sources,
          action_type: response.action_type,
          resultado: response.resultado,
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
