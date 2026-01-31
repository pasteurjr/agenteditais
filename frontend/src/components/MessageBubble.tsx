import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Message } from "../types";
import { SourcesPanel } from "./SourcesPanel";
import { FileText, User, Save, CheckCircle, List } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onAction?: (action: string) => void;
}

// Extrai botões de ação do conteúdo markdown
function extractActionButtons(content: string): { cleanContent: string; buttons: Array<{ id: string; label: string }> } {
  const buttons: Array<{ id: string; label: string }> = [];

  // Regex para encontrar [[btn:id:label]]
  const btnRegex = /\[\[btn:([^:]+):([^\]]+)\]\]/g;
  let match;

  while ((match = btnRegex.exec(content)) !== null) {
    buttons.push({ id: match[1], label: match[2] });
  }

  // Remover marcações de botões e comentários do conteúdo
  let cleanContent = content
    .replace(/<!-- BOTOES_SALVAR -->/g, '')
    .replace(/<!-- \/BOTOES_SALVAR -->/g, '')
    .replace(btnRegex, '');

  return { cleanContent, buttons };
}

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Extrair botões de ação do conteúdo
  const { cleanContent, buttons } = isUser
    ? { cleanContent: message.content, buttons: [] }
    : extractActionButtons(message.content);

  const handleButtonClick = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
  };

  const getButtonIcon = (id: string) => {
    if (id.includes('participar')) return <CheckCircle size={16} />;
    if (id.includes('todos')) return <List size={16} />;
    return <Save size={16} />;
  };

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "assistant-avatar"}`}>
        {isUser ? <User size={18} /> : <FileText size={18} />}
      </div>
      <div className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {cleanContent}
            </ReactMarkdown>

            {/* Botões de ação */}
            {buttons.length > 0 && (
              <div className="action-buttons">
                {buttons.map((btn) => (
                  <button
                    key={btn.id}
                    className="action-btn"
                    onClick={() => handleButtonClick(btn.id)}
                  >
                    {getButtonIcon(btn.id)}
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            )}

            {message.sources && <SourcesPanel sources={message.sources} />}
          </>
        )}
      </div>
    </div>
  );
}
