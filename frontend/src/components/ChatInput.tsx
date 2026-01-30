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
  onUpload: (file: File, nomeProduto: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, onUpload, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nomeProduto, setNomeProduto] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadForm(true);
      // Tentar extrair nome do produto do nome do arquivo
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNomeProduto(fileName);
    }
  };

  const handleUploadSubmit = () => {
    if (selectedFile && nomeProduto.trim()) {
      onUpload(selectedFile, nomeProduto.trim());
      setSelectedFile(null);
      setNomeProduto("");
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setNomeProduto("");
    setShowUploadForm(false);
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

      {/* Formulário de upload */}
      {showUploadForm && selectedFile && (
        <div className="upload-form">
          <div className="upload-file-info">
            <FileText size={20} />
            <span className="upload-filename">{selectedFile.name}</span>
            <button className="upload-cancel" onClick={handleCancelUpload} title="Cancelar">
              <X size={16} />
            </button>
          </div>
          <div className="upload-product-name">
            <input
              type="text"
              placeholder="Nome do produto (ex: Analisador Bioquímico BS-240)"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUploadSubmit()}
            />
            <button
              className="upload-submit"
              onClick={handleUploadSubmit}
              disabled={!nomeProduto.trim()}
            >
              Cadastrar Produto
            </button>
          </div>
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
