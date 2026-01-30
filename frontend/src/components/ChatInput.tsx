import { useState, useRef, useEffect } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";

// Tipos de ação disponíveis
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

interface ActionOption {
  id: ActionType;
  nome: string;
  descricao: string;
}

const ACOES: ActionOption[] = [
  { id: "chat_livre", nome: "Chat Livre", descricao: "Conversa livre sobre editais e licitações" },
  { id: "buscar_material_web", nome: "Buscar Material na Web", descricao: "Busca PDFs na web, baixa e extrai especificações" },
  { id: "upload_manual", nome: "Upload de Manual", descricao: "Envia PDF de manual para extração de especificações" },
  { id: "cadastrar_fonte", nome: "Cadastrar Fonte", descricao: "Adiciona nova fonte de editais (PNCP, BEC, etc)" },
  { id: "buscar_editais", nome: "Buscar Editais", descricao: "Busca editais nas fontes cadastradas" },
  { id: "buscar_editais_score", nome: "Buscar Editais + Score", descricao: "Busca editais e calcula aderência com produtos" },
  { id: "listar_editais", nome: "Listar Editais", descricao: "Lista editais salvos com filtros" },
  { id: "calcular_aderencia", nome: "Calcular Aderência", descricao: "Compara produto com edital e gera scores" },
  { id: "gerar_proposta", nome: "Gerar Proposta", descricao: "Gera proposta técnica para edital" },
];

interface ChatInputProps {
  onSend: (message: string, actionType: ActionType) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<ActionType>("chat_livre");
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
    onSend(trimmed, actionType);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedAction = ACOES.find(a => a.id === actionType);

  return (
    <div className="chat-input-container">
      <div className="action-selector-wrapper">
        <div className="action-selector">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
            disabled={disabled}
            className="action-select"
          >
            {ACOES.map((acao) => (
              <option key={acao.id} value={acao.id}>
                {acao.nome}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="select-arrow" />
        </div>
        {selectedAction && (
          <span className="action-description">{selectedAction.descricao}</span>
        )}
      </div>
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={getPlaceholder(actionType)}
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

function getPlaceholder(actionType: ActionType): string {
  switch (actionType) {
    case "buscar_material_web":
      return "Descreva o material que deseja buscar (ex: manual do produto X)...";
    case "upload_manual":
      return "Descreva o produto para o qual será enviado o manual...";
    case "cadastrar_fonte":
      return "Informe a fonte de editais a cadastrar (nome, URL)...";
    case "buscar_editais":
      return "Informe critérios de busca (UF, categoria, palavra-chave)...";
    case "buscar_editais_score":
      return "Informe critérios de busca e produto para calcular aderência...";
    case "listar_editais":
      return "Informe filtros desejados (status, UF, categoria)...";
    case "calcular_aderencia":
      return "Informe o produto e edital para análise de aderência...";
    case "gerar_proposta":
      return "Informe o produto e edital para gerar proposta técnica...";
    default:
      return "Digite sua pergunta sobre editais e licitações...";
  }
}
