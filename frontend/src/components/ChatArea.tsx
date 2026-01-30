import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { FileText } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  loadingStatus?: string;
  onSend: (message: string, file?: File) => void;
  hasSession: boolean;
}

export function ChatArea({ messages, isLoading, loadingStatus, onSend, hasSession }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <FileText size={48} />
            <h2>Agente de Editais e Licitações</h2>
            <p>
              Busque editais, analise especificações técnicas e gere propostas.
              <br />
              Selecione um prompt pronto ou digite livremente.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="message-row assistant-row">
            <div className="message-avatar assistant-avatar">
              <FileText size={18} />
            </div>
            <div className="message-bubble assistant-bubble loading-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              {loadingStatus && (
                <div className="loading-status">{loadingStatus}</div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSend} disabled={isLoading || !hasSession} />
    </div>
  );
}
