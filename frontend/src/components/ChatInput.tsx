import { useState, useRef, useEffect } from "react";
import { SendHorizontal, ChevronDown, Paperclip, X, FileText } from "lucide-react";

// Prompts prontos para o dropdown
interface PromptPronto {
  id: string;
  nome: string;
  prompt: string;
}

const PROMPTS_PRONTOS: PromptPronto[] = [
  { id: "vazio", nome: "-- Selecione um prompt pronto --", prompt: "" },
  // === CONSULTAS ANALÍTICAS (MindsDB) ===
  { id: "mindsdb_totais", nome: "📊 Totais (produtos/editais)", prompt: "Quantos produtos e editais existem no banco?" },
  { id: "mindsdb_editais_novos", nome: "📊 Editais com status novo", prompt: "Quais editais estão com status novo?" },
  { id: "mindsdb_editais_orgao", nome: "📊 Editais por órgão", prompt: "Liste editais do Ministério da Saúde" },
  { id: "mindsdb_editais_mes", nome: "📊 Editais do mês", prompt: "Quais editais têm data de abertura em fevereiro de 2026?" },
  { id: "mindsdb_score_medio", nome: "📊 Score médio de aderência", prompt: "Qual é o score médio de aderência das análises?" },
  { id: "mindsdb_produtos_categoria", nome: "📊 Produtos por categoria", prompt: "Quantos produtos temos em cada categoria?" },
  { id: "mindsdb_alta_aderencia", nome: "📊 Produtos c/ alta aderência", prompt: "Quais produtos têm aderência acima de 70% em algum edital?" },
  { id: "mindsdb_propostas", nome: "📊 Total de propostas", prompt: "Quantas propostas foram geradas?" },
  { id: "mindsdb_editais_semana", nome: "📊 Editais da semana", prompt: "Quais editais vencem esta semana?" },
  { id: "mindsdb_melhor_produto", nome: "📊 Produto c/ melhor score", prompt: "Qual produto tem o melhor score de aderência?" },
  { id: "mindsdb_editais_uf", nome: "📊 Editais por UF", prompt: "Quantos editais temos por estado (UF)?" },
  { id: "mindsdb_resumo", nome: "📊 Resumo geral do banco", prompt: "Faça um resumo do banco: total de produtos, editais, análises e propostas" },
  // === AÇÕES DO SISTEMA ===
  { id: "listar_produtos", nome: "📦 Listar meus produtos", prompt: "Liste todos os meus produtos cadastrados" },
  { id: "listar_editais", nome: "📋 Listar editais abertos", prompt: "Quais editais estão abertos?" },
  { id: "calcular_aderencia", nome: "🎯 Calcular aderência", prompt: "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]" },
  { id: "gerar_proposta", nome: "📝 Gerar proposta", prompt: "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]" },
  { id: "buscar_editais", nome: "🔍 Buscar editais", prompt: "Busque editais de [TERMO] no PNCP" },
  { id: "cadastrar_fonte", nome: "➕ Cadastrar fonte", prompt: "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]" },
  { id: "listar_fontes", nome: "🌐 Listar fontes", prompt: "Quais são as fontes de editais cadastradas?" },
  { id: "ajuda", nome: "❓ O que posso fazer?", prompt: "O que você pode fazer? Quais são suas capacidades?" },
  // === REGISTRO DE RESULTADOS (Sprint 1) ===
  { id: "registrar_derrota", nome: "📉 Registrar derrota", prompt: "Perdemos o edital [NUMERO] para [EMPRESA] com R$ [VALOR_VENCEDOR], nosso preço foi R$ [NOSSO_VALOR]" },
  { id: "registrar_vitoria", nome: "🏆 Registrar vitória", prompt: "Ganhamos o edital [NUMERO] com R$ [VALOR]" },
  { id: "registrar_cancelado", nome: "⛔ Edital cancelado", prompt: "O edital [NUMERO] foi cancelado" },
];

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if ((!trimmed && !selectedFile) || disabled) return;
    onSend(trimmed, selectedFile || undefined);
    setText("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Focar no textarea para o usuário digitar o nome do produto
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      {/* Arquivo selecionado */}
      {selectedFile && (
        <div className="selected-file-banner">
          <FileText size={16} />
          <span className="selected-file-name">{selectedFile.name}</span>
          <button className="remove-file-btn" onClick={handleRemoveFile} title="Remover arquivo">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="chat-input-wrapper">
        {/* Botão de upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
        />
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Enviar PDF/Manual para cadastrar produto"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={selectedFile ? "Pressione Enter para cadastrar (nome será extraído automaticamente)" : "Digite sua pergunta sobre editais, produtos ou licitações..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={disabled || (!text.trim() && !selectedFile)}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
