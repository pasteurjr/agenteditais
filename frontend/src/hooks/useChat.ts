import { useState, useCallback } from "react";
import type { Message } from "../types";
import { sendMessage, getSessionMessages } from "../api/client";
import type { SendMessageResponse } from "../api/client";

export type ActionType =
  | "chat_livre"
  | "buscar_material_web"
  | "upload_manual"
  | "cadastrar_fonte"
  | "buscar_editais"
  | "buscar_editais_score"
  | "listar_editais"
  | "calcular_aderencia"
  | "gerar_proposta";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    async (sessionId: string, text: string, actionType: ActionType = "chat_livre"): Promise<SendMessageResponse | null> => {
      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await sendMessage(sessionId, text, actionType);
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
        setIsLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, send, loadSession, clearMessages };
}
