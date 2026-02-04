import { useState, useRef, useEffect } from "react";
import { SendHorizontal, ChevronDown, Paperclip, X, FileText } from "lucide-react";

// Prompts prontos organizados por funcionalidade do roadmap
interface PromptPronto {
  id: string;
  nome: string;
  prompt: string;
}

const PROMPTS_PRONTOS: PromptPronto[] = [
  { id: "vazio", nome: "-- Selecione um prompt pronto --", prompt: "" },

  // =============================================================================
  // 1. CADASTRO DE PRODUTOS (Upload de manuais/PDFs)
  // =============================================================================
  { id: "sep_1", nome: "━━━ 1. CADASTRO DE PRODUTOS ━━━", prompt: "" },
  { id: "upload_manual", nome: "✅ 📎 Cadastrar produto (upload PDF)", prompt: "Cadastre este produto" },
  { id: "download_url", nome: "✅ 🔗 Cadastrar produto de URL", prompt: "Baixe o manual de [URL] e cadastre o produto" },
  { id: "listar_produtos", nome: "✅ 📦 Listar meus produtos", prompt: "Liste todos os meus produtos cadastrados" },
  { id: "reprocessar_produto", nome: "✅ 🔄 Reprocessar produto", prompt: "Reprocesse as especificações do produto [NOME_PRODUTO]" },
  { id: "excluir_produto", nome: "✅ 🗑️ Excluir produto", prompt: "Exclua o produto [NOME_PRODUTO]" },

  // =============================================================================
  // 2. BUSCA E CADASTRO DE EDITAIS
  // =============================================================================
  { id: "sep_2", nome: "━━━ 2. BUSCA E CADASTRO DE EDITAIS ━━━", prompt: "" },
  { id: "buscar_editais", nome: "✅ 🔍 Buscar editais na web (PNCP)", prompt: "Busque editais de [TERMO] no PNCP" },
  { id: "listar_editais", nome: "✅ 📋 Listar editais salvos", prompt: "Liste meus editais cadastrados" },
  { id: "cadastrar_edital", nome: "✅ ➕ Cadastrar edital manualmente", prompt: "Cadastre o edital [NUMERO], órgão [ORGAO], objeto: [OBJETO]" },
  { id: "salvar_editais", nome: "✅ 💾 Salvar editais da busca", prompt: "Salve os editais encontrados" },
  { id: "excluir_edital", nome: "✅ 🗑️ Excluir edital", prompt: "Exclua o edital [NUMERO]" },
  { id: "atualizar_edital", nome: "✅ ✏️ Atualizar edital", prompt: "Atualize o status do edital [NUMERO] para [STATUS]" },

  // =============================================================================
  // 3. ANÁLISE DE ADERÊNCIA (Produto x Edital)
  // =============================================================================
  { id: "sep_3", nome: "━━━ 3. ANÁLISE DE ADERÊNCIA ━━━", prompt: "" },
  { id: "calcular_aderencia", nome: "✅ 🎯 Calcular aderência", prompt: "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]" },
  { id: "verificar_completude", nome: "❌ 📝 Verificar completude do produto", prompt: "Verifique se o produto [NOME_PRODUTO] está completo para participar de editais" },

  // =============================================================================
  // 4. GERAÇÃO DE PROPOSTAS
  // =============================================================================
  { id: "sep_4", nome: "━━━ 4. GERAÇÃO DE PROPOSTAS ━━━", prompt: "" },
  { id: "gerar_proposta", nome: "✅ 📝 Gerar proposta técnica", prompt: "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]" },
  { id: "listar_propostas", nome: "✅ 📄 Listar propostas geradas", prompt: "Liste minhas propostas geradas" },

  // =============================================================================
  // 5. REGISTRO DE RESULTADOS
  // =============================================================================
  { id: "sep_5", nome: "━━━ 5. REGISTRO DE RESULTADOS ━━━", prompt: "" },
  { id: "registrar_vitoria", nome: "✅ 🏆 Registrar vitória", prompt: "Ganhamos o edital [NUMERO] com R$ [VALOR]" },
  { id: "registrar_derrota", nome: "✅ 📉 Registrar derrota", prompt: "Perdemos o edital [NUMERO] para [EMPRESA] com R$ [VALOR_VENCEDOR], nosso preço foi R$ [NOSSO_VALOR]" },
  { id: "registrar_cancelado", nome: "✅ ⛔ Edital cancelado/deserto", prompt: "O edital [NUMERO] foi cancelado" },
  { id: "consultar_resultado", nome: "✅ 🔎 Consultar resultado de edital", prompt: "Qual o resultado do edital [NUMERO]?" },
  { id: "consultar_todos_resultados", nome: "✅ 📊 Ver todos os resultados", prompt: "Mostre os resultados de todos os editais" },

  // =============================================================================
  // 6. EXTRAÇÃO DE ATAS (PDF)
  // =============================================================================
  { id: "sep_6", nome: "━━━ 6. EXTRAÇÃO DE ATAS ━━━", prompt: "" },
  { id: "buscar_atas", nome: "✅ 🔍 Buscar atas no PNCP", prompt: "Busque atas de [TERMO]" },
  { id: "extrair_ata", nome: "✅ 📄 Extrair resultados de ata (PDF)", prompt: "Extraia os resultados desta ata" },

  // =============================================================================
  // 7. HISTÓRICO DE PREÇOS
  // =============================================================================
  { id: "sep_7", nome: "━━━ 7. HISTÓRICO DE PREÇOS ━━━", prompt: "" },
  { id: "buscar_precos_pncp", nome: "❌ 💰 Buscar preços no PNCP", prompt: "Busque preços de [TERMO] no PNCP" },
  { id: "historico_precos", nome: "❌ 📈 Ver histórico de preços", prompt: "Mostre o histórico de preços para [TERMO/PRODUTO]" },

  // =============================================================================
  // 8. ANÁLISE DE CONCORRENTES
  // =============================================================================
  { id: "sep_8", nome: "━━━ 8. ANÁLISE DE CONCORRENTES ━━━", prompt: "" },
  { id: "listar_concorrentes", nome: "❌ 👥 Listar concorrentes", prompt: "Liste os concorrentes conhecidos" },
  { id: "analisar_concorrente", nome: "❌ 🔍 Analisar concorrente", prompt: "Analise o concorrente [NOME_EMPRESA]" },

  // =============================================================================
  // 9. RECOMENDAÇÃO DE PREÇOS
  // =============================================================================
  { id: "sep_9", nome: "━━━ 9. RECOMENDAÇÃO DE PREÇOS ━━━", prompt: "" },
  { id: "recomendar_preco", nome: "❌ 💡 Recomendar preço", prompt: "Recomende um preço para o produto [NOME_PRODUTO] no edital [NUMERO]" },

  // =============================================================================
  // 10. CLASSIFICAÇÃO DE EDITAIS
  // =============================================================================
  { id: "sep_10", nome: "━━━ 10. CLASSIFICAÇÃO DE EDITAIS ━━━", prompt: "" },
  { id: "classificar_edital", nome: "❌ 🏷️ Classificar edital", prompt: "Classifique o edital [NUMERO] (comodato, venda, aluguel...)" },

  // =============================================================================
  // 11. FONTES DE EDITAIS
  // =============================================================================
  { id: "sep_11", nome: "━━━ 11. FONTES DE EDITAIS ━━━", prompt: "" },
  { id: "cadastrar_fonte", nome: "✅ ➕ Cadastrar fonte de editais", prompt: "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]" },
  { id: "listar_fontes", nome: "✅ 🌐 Listar fontes de editais", prompt: "Quais são as fontes de editais cadastradas?" },

  // =============================================================================
  // 12. CONSULTAS ANALÍTICAS (MindsDB)
  // =============================================================================
  { id: "sep_12", nome: "━━━ 12. CONSULTAS ANALÍTICAS (MindsDB) ━━━", prompt: "" },
  { id: "mindsdb_totais", nome: "✅ 📊 Quantos produtos e editais?", prompt: "Quantos produtos e editais existem no banco?" },
  { id: "mindsdb_editais_novos", nome: "✅ 📊 Editais com status novo", prompt: "Quais editais estão com status novo?" },
  { id: "mindsdb_editais_orgao", nome: "✅ 📊 Editais por órgão", prompt: "Liste editais do [ORGAO]" },
  { id: "mindsdb_editais_mes", nome: "✅ 📊 Editais do mês", prompt: "Quais editais têm data de abertura em [MÊS] de [ANO]?" },
  { id: "mindsdb_score_medio", nome: "✅ 📊 Score médio de aderência", prompt: "Qual é o score médio de aderência das análises?" },
  { id: "mindsdb_produtos_categoria", nome: "✅ 📊 Produtos por categoria", prompt: "Quantos produtos temos em cada categoria?" },
  { id: "mindsdb_alta_aderencia", nome: "✅ 📊 Produtos c/ alta aderência", prompt: "Quais produtos têm aderência acima de 70% em algum edital?" },
  { id: "mindsdb_propostas", nome: "✅ 📊 Total de propostas", prompt: "Quantas propostas foram geradas?" },
  { id: "mindsdb_editais_semana", nome: "✅ 📊 Editais da semana", prompt: "Quais editais vencem esta semana?" },
  { id: "mindsdb_melhor_produto", nome: "✅ 📊 Produto c/ melhor score", prompt: "Qual produto tem o melhor score de aderência?" },
  { id: "mindsdb_editais_uf", nome: "✅ 📊 Editais por UF", prompt: "Quantos editais temos por estado (UF)?" },
  { id: "mindsdb_resumo", nome: "✅ 📊 Resumo geral do banco", prompt: "Faça um resumo do banco: total de produtos, editais, análises e propostas" },
  { id: "mindsdb_vitorias_derrotas", nome: "✅ 📊 Vitórias e derrotas", prompt: "Quantas vitórias e derrotas temos registradas?" },
  { id: "mindsdb_concorrentes_frequentes", nome: "✅ 📊 Concorrentes frequentes", prompt: "Quais concorrentes aparecem mais nos editais?" },
  { id: "mindsdb_preco_medio_categoria", nome: "✅ 📊 Preço médio por categoria", prompt: "Qual o preço médio dos editais por categoria?" },

  // =============================================================================
  // OUTROS
  // =============================================================================
  { id: "sep_outros", nome: "━━━ OUTROS ━━━", prompt: "" },
  { id: "ajuda", nome: "✅ ❓ O que posso fazer?", prompt: "O que você pode fazer? Quais são suas capacidades?" },
  { id: "chat_livre", nome: "✅ 💬 Perguntar sobre licitações", prompt: "O que é pregão eletrônico?" },
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
              <option
                key={p.id}
                value={p.id}
                disabled={p.id.startsWith("sep_")}
                style={p.id.startsWith("sep_") ? { fontWeight: "bold", backgroundColor: "#f0f0f0" } : {}}
              >
                {p.nome}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="select-arrow" />
        </div>
        <span className="action-description">✅ = Implementado | ❌ = Em breve</span>
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
