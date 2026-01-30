import { useState, useRef, useEffect } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";

// Prompts prontos para o dropdown
interface PromptPronto {
  id: string;
  nome: string;
  prompt: string;
}

const PROMPTS_PRONTOS: PromptPronto[] = [
  { id: "vazio", nome: "-- Selecione um prompt pronto --", prompt: "" },
  { id: "listar_produtos", nome: "📦 Listar meus produtos", prompt: "Liste todos os meus produtos cadastrados" },
  { id: "listar_editais", nome: "📋 Listar editais abertos", prompt: "Quais editais estão abertos?" },
  { id: "calcular_aderencia", nome: "📊 Calcular aderência", prompt: "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]" },
  { id: "gerar_proposta", nome: "📝 Gerar proposta", prompt: "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]" },
  { id: "buscar_editais", nome: "🔍 Buscar editais", prompt: "Busque editais de [TERMO] no PNCP" },
  { id: "cadastrar_fonte", nome: "➕ Cadastrar fonte", prompt: "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]" },
  { id: "listar_fontes", nome: "🌐 Listar fontes", prompt: "Quais são as fontes de editais cadastradas?" },
  { id: "ajuda", nome: "❓ O que posso fazer?", prompt: "O que você pode fazer? Quais são suas capacidades?" },
];

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const prompt = PROMPTS_PRONTOS.find(p => p.id === selectedId);
    if (prompt && prompt.prompt) {
      setText(prompt.prompt);
      // Foca no textarea para o usuário poder editar
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    // Reset o select para mostrar o placeholder
    e.target.value = "vazio";
  };

  return (
    <div className="chat-input-container">
      <div className="action-selector-wrapper">
        <div className="action-selector">
          <select
            onChange={handlePromptSelect}
            disabled={disabled}
            className="action-select"
            defaultValue="vazio"
          >
            {PROMPTS_PRONTOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="select-arrow" />
        </div>
        <span className="action-description">Selecione um prompt ou digite livremente</span>
      </div>
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Digite sua pergunta sobre editais, produtos ou licitações..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
