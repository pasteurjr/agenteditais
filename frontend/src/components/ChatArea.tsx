import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import type { ActionType } from "./ChatInput";
import { FileText } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string, actionType: ActionType) => void;
  hasSession: boolean;
}

export function ChatArea({ messages, isLoading, onSend, hasSession }: ChatAreaProps) {
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
              Selecione uma ação acima e descreva o que precisa.
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
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={(msg, action) => onSend(msg, action)} disabled={isLoading || !hasSession} />
    </div>
  );
}
