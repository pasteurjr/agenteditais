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
  // -- CADASTRO --
  { id: "upload_manual", nome: "✅ 📎 Cadastrar produto (upload PDF)", prompt: "Cadastre este produto" },
  { id: "download_url", nome: "✅ 🔗 Cadastrar produto de URL", prompt: "Baixe o manual de [URL] e cadastre o produto" },
  // -- BUSCA NA WEB --
  { id: "buscar_produto_web", nome: "✅ 🌐 Buscar manual na web", prompt: "Busque o manual do produto [NOME] na web" },
  { id: "buscar_datasheet_web", nome: "✅ 🌐 Buscar datasheet na web", prompt: "Busque o datasheet do [NOME] na web" },
  // -- BUSCA NO BANCO --
  { id: "listar_produtos", nome: "✅ 💾 Listar meus produtos", prompt: "Liste todos os meus produtos cadastrados" },
  { id: "buscar_produto_banco", nome: "✅ 💾 Buscar produto no banco", prompt: "Busque o produto [NOME] no banco" },
  { id: "verificar_produto_cadastrado", nome: "✅ 💾 Verificar produto cadastrado", prompt: "Tenho o produto [NOME] cadastrado?" },
  // -- GESTÃO --
  { id: "reprocessar_produto", nome: "✅ 🔄 Reprocessar especificações", prompt: "Reprocesse as especificações do produto [NOME_PRODUTO]" },
  { id: "atualizar_produto", nome: "✅ ✏️ Atualizar/editar produto", prompt: "Atualize o produto [NOME_PRODUTO] com [NOVOS_DADOS]" },
  { id: "excluir_produto", nome: "✅ 🗑️ Excluir produto", prompt: "Exclua o produto [NOME_PRODUTO]" },
  { id: "excluir_todos_produtos", nome: "✅ 🗑️ Excluir TODOS os produtos", prompt: "Exclua todos os meus produtos" },

  // =============================================================================
  // 2. BUSCA E CADASTRO DE EDITAIS
  // =============================================================================
  { id: "sep_2", nome: "━━━ 2. BUSCA E CADASTRO DE EDITAIS ━━━", prompt: "" },
  // -- BUSCA NA WEB (PNCP) --
  { id: "buscar_editais_web", nome: "✅ 🌐 Buscar editais na web (PNCP)", prompt: "Busque editais de [TERMO] no PNCP" },
  { id: "buscar_edital_numero_web", nome: "✅ 🌐 Buscar edital por número (web)", prompt: "Busque o edital [PE-001/2026] no PNCP" },
  { id: "buscar_editais_web2", nome: "✅ 🌐 Encontrar editais na web", prompt: "Encontre editais de [TERMO] na web" },
  // -- BUSCA NO BANCO LOCAL --
  { id: "buscar_editais_banco", nome: "✅ 💾 Buscar editais no banco", prompt: "Busque editais de [TERMO] no banco" },
  { id: "buscar_edital_numero_banco", nome: "✅ 💾 Buscar edital no sistema", prompt: "Busque o edital [PE-001/2026] no sistema" },
  { id: "verificar_edital_cadastrado", nome: "✅ 💾 Verificar edital cadastrado", prompt: "Tenho o edital [PE-001/2026] cadastrado?" },
  { id: "listar_editais", nome: "✅ 📋 Listar editais salvos", prompt: "Liste meus editais cadastrados" },
  { id: "listar_editais_status", nome: "✅ 📋 Listar editais por status", prompt: "Liste meus editais com status [novo/analisando/participar/ganho/perdido]" },
  // -- CADASTRO E GESTÃO --
  { id: "cadastrar_edital", nome: "✅ ➕ Cadastrar edital manualmente", prompt: "Cadastre o edital [NUMERO], órgão [ORGAO], objeto: [OBJETO]" },
  { id: "salvar_editais", nome: "✅ 💾 Salvar editais da busca", prompt: "Salve os editais encontrados" },
  { id: "atualizar_edital", nome: "✅ ✏️ Atualizar/editar edital", prompt: "Atualize o edital [NUMERO] com status [novo/analisando/participar/ganho/perdido]" },
  { id: "excluir_edital", nome: "✅ 🗑️ Excluir edital", prompt: "Exclua o edital [NUMERO]" },
  { id: "excluir_todos_editais", nome: "✅ 🗑️ Excluir TODOS os editais", prompt: "Exclua todos os meus editais" },

  // =============================================================================
  // 3. ANÁLISE DE ADERÊNCIA (Produto x Edital)
  // =============================================================================
  { id: "sep_3", nome: "━━━ 3. ANÁLISE DE ADERÊNCIA ━━━", prompt: "" },
  { id: "calcular_aderencia", nome: "✅ 🎯 Calcular aderência", prompt: "Calcule a aderência do produto [NOME_PRODUTO] ao edital [NUMERO_EDITAL]" },
  { id: "listar_analises", nome: "✅ 📊 Listar análises realizadas", prompt: "Liste minhas análises de aderência" },
  { id: "verificar_completude", nome: "❌ 📝 Verificar completude do produto", prompt: "Verifique se o produto [NOME_PRODUTO] está completo para participar de editais" },

  // =============================================================================
  // 4. GERAÇÃO DE PROPOSTAS
  // =============================================================================
  { id: "sep_4", nome: "━━━ 4. GERAÇÃO DE PROPOSTAS ━━━", prompt: "" },
  { id: "gerar_proposta", nome: "✅ 📝 Gerar proposta técnica", prompt: "Gere uma proposta do produto [NOME_PRODUTO] para o edital [NUMERO_EDITAL] com preço R$ [VALOR]" },
  { id: "listar_propostas", nome: "✅ 📄 Listar propostas geradas", prompt: "Liste minhas propostas geradas" },
  { id: "excluir_proposta", nome: "✅ 🗑️ Excluir proposta", prompt: "Exclua a proposta do edital [NUMERO]" },

  // =============================================================================
  // 5. REGISTRO DE RESULTADOS
  // =============================================================================
  { id: "sep_5", nome: "━━━ 5. REGISTRO DE RESULTADOS ━━━", prompt: "" },
  { id: "registrar_vitoria", nome: "✅ 🏆 Registrar vitória", prompt: "Ganhamos o edital [NUMERO] com R$ [VALOR]" },
  { id: "registrar_derrota", nome: "✅ 📉 Registrar derrota", prompt: "Perdemos o edital [NUMERO] para [EMPRESA] com R$ [VALOR_VENCEDOR], nosso preço foi R$ [NOSSO_VALOR]" },
  { id: "registrar_derrota_motivo", nome: "✅ 📉 Registrar derrota com motivo", prompt: "Perdemos o edital [NUMERO] por [preço/técnica/documentação/prazo]" },
  { id: "registrar_cancelado", nome: "✅ ⛔ Edital cancelado", prompt: "O edital [NUMERO] foi cancelado" },
  { id: "registrar_deserto", nome: "✅ ⛔ Edital deserto", prompt: "O edital [NUMERO] foi deserto" },
  { id: "registrar_revogado", nome: "✅ ⛔ Edital revogado", prompt: "O edital [NUMERO] foi revogado" },
  { id: "consultar_resultado", nome: "✅ 🔎 Consultar resultado de edital", prompt: "Qual o resultado do edital [NUMERO]?" },
  { id: "consultar_todos_resultados", nome: "✅ 📊 Ver todos os resultados", prompt: "Mostre os resultados de todos os editais" },

  // =============================================================================
  // 6. BUSCA E EXTRAÇÃO DE ATAS - Funcionalidade 3 Sprint 1
  // =============================================================================
  { id: "sep_6", nome: "━━━ 6. BUSCA E EXTRAÇÃO DE ATAS ━━━", prompt: "" },
  // 6.1 Buscar atas no PNCP (intenção: buscar_atas_pncp)
  { id: "buscar_atas", nome: "✅ 🔍 Buscar atas no PNCP", prompt: "Busque atas de [TERMO]" },
  { id: "buscar_atas_2", nome: "✅ 🔍 Encontrar atas de pregão", prompt: "Encontre atas de pregão de [TERMO]" },
  { id: "baixar_atas", nome: "✅ 📥 Baixar atas do PNCP", prompt: "Baixe atas de [TERMO] do PNCP" },
  // 6.2 Extrair resultados de ata (PDF upload) (intenção: extrair_ata)
  { id: "extrair_ata", nome: "✅ 📄 Extrair resultados de ata (PDF)", prompt: "Extraia os resultados desta ata" },
  { id: "extrair_vencedor", nome: "✅ 🏆 Quem ganhou este pregão? (PDF)", prompt: "Quem ganhou este pregão?" },
  { id: "registrar_ata", nome: "✅ 💾 Registrar resultados da ata (PDF)", prompt: "Registre os resultados desta ata" },

  // =============================================================================
  // 7. HISTÓRICO DE PREÇOS
  // =============================================================================
  { id: "sep_7", nome: "━━━ 7. HISTÓRICO DE PREÇOS ━━━", prompt: "" },
  { id: "buscar_precos_pncp", nome: "❌ 💰 Buscar preços no PNCP", prompt: "Busque preços de [TERMO] no PNCP" },
  { id: "historico_precos", nome: "❌ 📈 Ver histórico de preços", prompt: "Mostre o histórico de preços para [TERMO/PRODUTO]" },
  { id: "preco_medio", nome: "❌ 💵 Preço médio de mercado", prompt: "Qual o preço médio de mercado para [TERMO]?" },

  // =============================================================================
  // 8. ANÁLISE DE CONCORRENTES
  // =============================================================================
  { id: "sep_8", nome: "━━━ 8. ANÁLISE DE CONCORRENTES ━━━", prompt: "" },
  { id: "listar_concorrentes", nome: "❌ 👥 Listar concorrentes", prompt: "Liste os concorrentes conhecidos" },
  { id: "analisar_concorrente", nome: "❌ 🔍 Analisar concorrente", prompt: "Analise o concorrente [NOME_EMPRESA]" },
  { id: "taxa_vitoria_concorrente", nome: "❌ 📊 Taxa de vitória do concorrente", prompt: "Qual a taxa de vitória do concorrente [NOME_EMPRESA]?" },
  { id: "historico_concorrente", nome: "❌ 📜 Histórico do concorrente", prompt: "Mostre o histórico de participações do concorrente [NOME_EMPRESA]" },

  // =============================================================================
  // 9. RECOMENDAÇÃO DE PREÇOS
  // =============================================================================
  { id: "sep_9", nome: "━━━ 9. RECOMENDAÇÃO DE PREÇOS ━━━", prompt: "" },
  { id: "recomendar_preco", nome: "❌ 💡 Recomendar preço", prompt: "Recomende um preço para o produto [NOME_PRODUTO] no edital [NUMERO]" },
  { id: "faixa_preco", nome: "❌ 📊 Faixa de preço sugerida", prompt: "Qual a faixa de preço sugerida para [TERMO]?" },

  // =============================================================================
  // 10. CLASSIFICAÇÃO DE EDITAIS
  // =============================================================================
  { id: "sep_10", nome: "━━━ 10. CLASSIFICAÇÃO DE EDITAIS ━━━", prompt: "" },
  { id: "classificar_edital", nome: "❌ 🏷️ Classificar edital", prompt: "Classifique o edital [NUMERO] (comodato, venda, aluguel...)" },
  { id: "editais_comodato", nome: "❌ 🏷️ Editais de comodato", prompt: "Liste editais classificados como comodato" },
  { id: "editais_venda", nome: "❌ 🏷️ Editais de venda", prompt: "Liste editais classificados como venda de equipamento" },

  // =============================================================================
  // 11. FONTES DE EDITAIS
  // =============================================================================
  { id: "sep_11", nome: "━━━ 11. FONTES DE EDITAIS ━━━", prompt: "" },
  { id: "cadastrar_fonte", nome: "✅ ➕ Cadastrar fonte de editais", prompt: "Cadastre a fonte [NOME], tipo [api/scraper], URL [URL]" },
  { id: "listar_fontes", nome: "✅ 🌐 Listar fontes de editais", prompt: "Quais são as fontes de editais cadastradas?" },
  { id: "ativar_fonte", nome: "✅ ✅ Ativar fonte", prompt: "Ative a fonte [NOME]" },
  { id: "desativar_fonte", nome: "✅ ❌ Desativar fonte", prompt: "Desative a fonte [NOME]" },

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
  { id: "mindsdb_editais_valor", nome: "✅ 📊 Editais por faixa de valor", prompt: "Quantos editais temos em cada faixa de valor?" },
  { id: "mindsdb_taxa_sucesso", nome: "✅ 📊 Taxa de sucesso", prompt: "Qual nossa taxa de sucesso em licitações?" },

  // =============================================================================
  // OUTROS / AJUDA
  // =============================================================================
  { id: "sep_outros", nome: "━━━ OUTROS / AJUDA ━━━", prompt: "" },
  { id: "ajuda", nome: "✅ ❓ O que posso fazer?", prompt: "O que você pode fazer? Quais são suas capacidades?" },
  { id: "chat_livre", nome: "✅ 💬 Perguntar sobre licitações", prompt: "O que é pregão eletrônico?" },
  { id: "chat_lei", nome: "✅ 💬 Dúvida sobre legislação", prompt: "O que diz a Lei 14.133/2021 sobre [TEMA]?" },
  { id: "chat_impugnacao", nome: "✅ 💬 Como fazer impugnação", prompt: "Como faço uma impugnação de edital?" },
  { id: "chat_recurso", nome: "✅ 💬 Como fazer recurso", prompt: "Como faço um recurso administrativo?" },
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
