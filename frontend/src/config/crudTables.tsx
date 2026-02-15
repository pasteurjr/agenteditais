/**
 * Configuração de todas as tabelas CRUD.
 * Define campos, labels e tipos para cada tabela.
 */
import {
  Building, FileText, Shield, Users, Package, Sliders, Search,
  FileCheck, Layers, BarChart2, Gavel, DollarSign, Scale, Eye,
  Bell, Clock, Mail, Send, Briefcase, TrendingUp, AlertTriangle,
  Database, BookOpen, Target, Zap
} from "lucide-react";
import type { CrudPageConfig, FieldConfig } from "../components/CrudPage";

// ─── Helper: Enum → options ───────────────────────────────────────────────────

function enumOpts(values: string[]): { value: string; label: string }[] {
  return values.map((v) => ({
    value: v,
    label: v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}

// ─── Tabelas por Categoria ────────────────────────────────────────────────────

// === 1. EMPRESA ===

export const empresaConfig: CrudPageConfig = {
  table: "empresas",
  title: "Empresas",
  icon: <Building size={24} />,
  fields: [
    { name: "cnpj", label: "CNPJ", type: "text", required: true, width: "half", placeholder: "00.000.000/0001-00" },
    { name: "razao_social", label: "Razão Social", type: "text", required: true, width: "half" },
    { name: "nome_fantasia", label: "Nome Fantasia", type: "text", width: "half" },
    { name: "inscricao_estadual", label: "Inscrição Estadual", type: "text", width: "half" },
    { name: "inscricao_municipal", label: "Inscrição Municipal", type: "text", width: "half" },
    { name: "regime_tributario", label: "Regime Tributário", type: "select", options: enumOpts(["simples", "lucro_presumido", "lucro_real"]), width: "half" },
    { name: "porte", label: "Porte", type: "select", options: enumOpts(["me", "epp", "medio", "grande"]), width: "half" },
    { name: "endereco", label: "Endereço", type: "textarea", width: "full" },
    { name: "cidade", label: "Cidade", type: "text", width: "half" },
    { name: "uf", label: "UF", type: "text", width: "half", placeholder: "MG" },
    { name: "cep", label: "CEP", type: "text", width: "half", placeholder: "00000-000" },
    { name: "telefone", label: "Telefone", type: "text", width: "half" },
    { name: "email", label: "Email", type: "email", width: "half" },
    { name: "areas_atuacao", label: "Áreas de Atuação", type: "json", width: "full" },
    { name: "ativo", label: "Ativo", type: "boolean", width: "half" },
  ],
};

export const empresaDocumentosConfig: CrudPageConfig = {
  table: "empresa-documentos",
  title: "Documentos da Empresa",
  icon: <FileText size={24} />,
  parentFk: "empresa_id",
  parentTable: "empresas",
  parentLabelField: "razao_social",
  fields: [
    { name: "empresa_id", label: "Empresa ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["contrato_social", "atestado_capacidade", "balanco", "alvara", "registro_conselho", "procuracao", "outro"]), width: "half" },
    { name: "nome_arquivo", label: "Nome do Arquivo", type: "text", required: true, width: "half" },
    { name: "path_arquivo", label: "Caminho do Arquivo", type: "text", required: true, width: "half" },
    { name: "data_emissao", label: "Data de Emissão", type: "date", width: "half" },
    { name: "data_vencimento", label: "Data de Vencimento", type: "date", width: "half" },
    { name: "processado", label: "Processado", type: "boolean", width: "half" },
  ],
};

export const empresaCertidoesConfig: CrudPageConfig = {
  table: "empresa-certidoes",
  title: "Certidões da Empresa",
  icon: <Shield size={24} />,
  parentFk: "empresa_id",
  parentTable: "empresas",
  parentLabelField: "razao_social",
  fields: [
    { name: "empresa_id", label: "Empresa ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["cnd_federal", "cnd_estadual", "cnd_municipal", "fgts", "trabalhista", "outro"]), width: "half" },
    { name: "orgao_emissor", label: "Órgão Emissor", type: "text", width: "half" },
    { name: "numero", label: "Número", type: "text", width: "half" },
    { name: "data_emissao", label: "Data de Emissão", type: "date", width: "half" },
    { name: "data_vencimento", label: "Data de Vencimento", type: "date", required: true, width: "half" },
    { name: "path_arquivo", label: "Caminho do Arquivo", type: "text", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["valida", "vencida", "pendente"]), width: "half" },
    { name: "url_consulta", label: "URL de Consulta", type: "text", width: "full" },
  ],
};

export const empresaResponsaveisConfig: CrudPageConfig = {
  table: "empresa-responsaveis",
  title: "Responsáveis da Empresa",
  icon: <Users size={24} />,
  parentFk: "empresa_id",
  parentTable: "empresas",
  parentLabelField: "razao_social",
  fields: [
    { name: "empresa_id", label: "Empresa ID", type: "text", required: true, width: "half" },
    { name: "nome", label: "Nome", type: "text", required: true, width: "half" },
    { name: "cargo", label: "Cargo", type: "text", width: "half" },
    { name: "cpf", label: "CPF", type: "text", width: "half" },
    { name: "email", label: "Email", type: "email", width: "half" },
    { name: "telefone", label: "Telefone", type: "text", width: "half" },
    { name: "tipo", label: "Tipo", type: "select", options: enumOpts(["representante_legal", "preposto", "tecnico"]), width: "half" },
  ],
};

// === 2. PORTFOLIO ===

export const produtosConfig: CrudPageConfig = {
  table: "produtos",
  title: "Produtos",
  icon: <Package size={24} />,
  fields: [
    { name: "nome", label: "Nome", type: "text", required: true, width: "half" },
    { name: "codigo_interno", label: "Código Interno", type: "text", width: "half" },
    { name: "categoria", label: "Categoria", type: "select", required: true, options: enumOpts(["equipamento", "reagente", "insumo_hospitalar", "insumo_laboratorial", "informatica", "redes", "mobiliario", "eletronico", "outro"]), width: "half" },
    { name: "fabricante", label: "Fabricante", type: "text", width: "half" },
    { name: "modelo", label: "Modelo", type: "text", width: "half" },
    { name: "ncm", label: "NCM", type: "text", width: "half" },
    { name: "preco_referencia", label: "Preço Referência", type: "decimal", width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", width: "full" },
  ],
};

export const produtosEspecificacoesConfig: CrudPageConfig = {
  table: "produtos-especificacoes",
  title: "Especificações de Produtos",
  icon: <Sliders size={24} />,
  parentFk: "produto_id",
  parentTable: "produtos",
  parentLabelField: "nome",
  fields: [
    { name: "produto_id", label: "Produto ID", type: "text", required: true, width: "half" },
    { name: "nome_especificacao", label: "Especificação", type: "text", required: true, width: "half" },
    { name: "valor", label: "Valor", type: "text", required: true, width: "half" },
    { name: "unidade", label: "Unidade", type: "text", width: "half" },
    { name: "valor_numerico", label: "Valor Numérico", type: "decimal", width: "half" },
    { name: "operador", label: "Operador", type: "text", width: "half", placeholder: ">=, <=, =, range" },
    { name: "valor_min", label: "Valor Mín", type: "decimal", width: "half" },
    { name: "valor_max", label: "Valor Máx", type: "decimal", width: "half" },
    { name: "pagina_origem", label: "Página Origem", type: "number", width: "half" },
  ],
};

export const produtosDocumentosConfig: CrudPageConfig = {
  table: "produtos-documentos",
  title: "Documentos de Produtos",
  icon: <FileText size={24} />,
  parentFk: "produto_id",
  parentTable: "produtos",
  parentLabelField: "nome",
  fields: [
    { name: "produto_id", label: "Produto ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["manual", "ficha_tecnica", "certificado_anvisa", "certificado_outro"]), width: "half" },
    { name: "nome_arquivo", label: "Nome do Arquivo", type: "text", required: true, width: "half" },
    { name: "path_arquivo", label: "Caminho do Arquivo", type: "text", required: true, width: "half" },
    { name: "processado", label: "Processado", type: "boolean", width: "half" },
  ],
};

// === 3. FONTES ===

export const fontesEditaisConfig: CrudPageConfig = {
  table: "fontes-editais",
  title: "Fontes de Editais",
  icon: <Search size={24} />,
  fields: [
    { name: "nome", label: "Nome", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["api", "scraper"]), width: "half" },
    { name: "url_base", label: "URL Base", type: "text", width: "full" },
    { name: "api_key", label: "API Key", type: "text", width: "half" },
    { name: "ativo", label: "Ativo", type: "boolean", width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", width: "full" },
  ],
};

// === 4. EDITAIS ===

export const editaisConfig: CrudPageConfig = {
  table: "editais",
  title: "Editais",
  icon: <FileCheck size={24} />,
  fields: [
    { name: "numero", label: "Número", type: "text", required: true, width: "half" },
    { name: "orgao", label: "Órgão", type: "text", required: true, width: "half" },
    { name: "orgao_tipo", label: "Tipo de Órgão", type: "select", options: enumOpts(["federal", "estadual", "municipal", "autarquia", "fundacao"]), width: "half" },
    { name: "modalidade", label: "Modalidade", type: "select", options: enumOpts(["pregao_eletronico", "pregao_presencial", "concorrencia", "tomada_precos", "convite", "dispensa", "inexigibilidade"]), width: "half" },
    { name: "categoria", label: "Categoria", type: "select", options: enumOpts(["comodato", "venda_equipamento", "aluguel_com_consumo", "aluguel_sem_consumo", "consumo_reagentes", "consumo_insumos", "servicos", "informatica", "redes", "mobiliario", "outro"]), width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["novo", "analisando", "participando", "proposta_enviada", "em_pregao", "vencedor", "perdedor", "cancelado", "desistido", "aberto", "fechado", "suspenso", "ganho", "perdido"]), width: "half" },
    { name: "objeto", label: "Objeto", type: "textarea", required: true, width: "full" },
    { name: "uf", label: "UF", type: "text", width: "half" },
    { name: "cidade", label: "Cidade", type: "text", width: "half" },
    { name: "valor_referencia", label: "Valor Referência", type: "decimal", width: "half" },
    { name: "data_publicacao", label: "Data Publicação", type: "date", width: "half" },
    { name: "data_abertura", label: "Data Abertura", type: "datetime", width: "half" },
    { name: "data_limite_proposta", label: "Prazo Proposta", type: "datetime", width: "half" },
    { name: "data_limite_impugnacao", label: "Prazo Impugnação", type: "datetime", width: "half" },
    { name: "data_recursos", label: "Prazo Recursos", type: "datetime", width: "half" },
    { name: "fonte", label: "Fonte", type: "text", width: "half" },
    { name: "url", label: "URL", type: "text", width: "full" },
  ],
};

export const editaisRequisitosConfig: CrudPageConfig = {
  table: "editais-requisitos",
  title: "Requisitos de Editais",
  icon: <Layers size={24} />,
  parentFk: "edital_id",
  parentTable: "editais",
  parentLabelFn: (item) => `${item.numero || ""} - ${item.orgao || ""}`,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["tecnico", "documental", "comercial", "legal"]), width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", required: true, width: "full" },
    { name: "nome_especificacao", label: "Nome Especificação", type: "text", width: "half" },
    { name: "valor_exigido", label: "Valor Exigido", type: "text", width: "half" },
    { name: "operador", label: "Operador", type: "text", width: "half" },
    { name: "valor_numerico", label: "Valor Numérico", type: "decimal", width: "half" },
    { name: "obrigatorio", label: "Obrigatório", type: "boolean", width: "half" },
    { name: "pagina_origem", label: "Página Origem", type: "number", width: "half" },
  ],
};

export const editaisDocumentosConfig: CrudPageConfig = {
  table: "editais-documentos",
  title: "Documentos de Editais",
  icon: <FileText size={24} />,
  parentFk: "edital_id",
  parentTable: "editais",
  parentLabelFn: (item) => `${item.numero || ""} - ${item.orgao || ""}`,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["edital_principal", "termo_referencia", "anexo", "planilha", "outro"]), width: "half" },
    { name: "nome_arquivo", label: "Nome do Arquivo", type: "text", required: true, width: "half" },
    { name: "path_arquivo", label: "Caminho do Arquivo", type: "text", required: true, width: "half" },
    { name: "processado", label: "Processado", type: "boolean", width: "half" },
  ],
};

export const editaisItensConfig: CrudPageConfig = {
  table: "editais-itens",
  title: "Itens de Editais",
  icon: <Layers size={24} />,
  parentFk: "edital_id",
  parentTable: "editais",
  parentLabelFn: (item) => `${item.numero || ""} - ${item.orgao || ""}`,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "numero_item", label: "Nº Item", type: "number", width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", width: "full" },
    { name: "unidade_medida", label: "Unidade", type: "text", width: "half" },
    { name: "quantidade", label: "Quantidade", type: "decimal", width: "half" },
    { name: "valor_unitario_estimado", label: "Valor Unit. Estimado", type: "decimal", width: "half" },
    { name: "valor_total_estimado", label: "Valor Total Estimado", type: "decimal", width: "half" },
    { name: "codigo_item", label: "Código Item", type: "text", width: "half" },
  ],
};

// === 5. ANÁLISES ===

export const analisesConfig: CrudPageConfig = {
  table: "analises",
  title: "Análises",
  icon: <BarChart2 size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "produto_id", label: "Produto ID", type: "text", required: true, width: "half" },
    { name: "score_tecnico", label: "Score Técnico", type: "decimal", width: "half" },
    { name: "score_comercial", label: "Score Comercial", type: "decimal", width: "half" },
    { name: "score_potencial", label: "Score Potencial", type: "decimal", width: "half" },
    { name: "score_final", label: "Score Final", type: "decimal", width: "half" },
    { name: "requisitos_total", label: "Total Requisitos", type: "number", width: "half" },
    { name: "requisitos_atendidos", label: "Atendidos", type: "number", width: "half" },
    { name: "requisitos_parciais", label: "Parciais", type: "number", width: "half" },
    { name: "requisitos_nao_atendidos", label: "Não Atendidos", type: "number", width: "half" },
    { name: "preco_sugerido", label: "Preço Sugerido", type: "decimal", width: "half" },
    { name: "recomendacao", label: "Recomendação", type: "textarea", width: "full" },
  ],
};

// === 6. PROPOSTAS ===

export const propostasConfig: CrudPageConfig = {
  table: "propostas",
  title: "Propostas",
  icon: <Send size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "produto_id", label: "Produto ID", type: "text", required: true, width: "half" },
    { name: "analise_id", label: "Análise ID", type: "text", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["rascunho", "revisao", "aprovada", "enviada"]), width: "half" },
    { name: "preco_unitario", label: "Preço Unitário", type: "decimal", width: "half" },
    { name: "preco_total", label: "Preço Total", type: "decimal", width: "half" },
    { name: "quantidade", label: "Quantidade", type: "number", width: "half" },
    { name: "texto_tecnico", label: "Texto Técnico", type: "textarea", width: "full" },
    { name: "arquivo_path", label: "Arquivo", type: "text", width: "full" },
  ],
};

// === 7. CONCORRÊNCIA ===

export const concorrentesConfig: CrudPageConfig = {
  table: "concorrentes",
  title: "Concorrentes",
  icon: <Users size={24} />,
  fields: [
    { name: "nome", label: "Nome", type: "text", required: true, width: "half" },
    { name: "cnpj", label: "CNPJ", type: "text", width: "half" },
    { name: "razao_social", label: "Razão Social", type: "text", width: "half" },
    { name: "editais_participados", label: "Editais Participados", type: "number", width: "half" },
    { name: "editais_ganhos", label: "Editais Ganhos", type: "number", width: "half" },
    { name: "preco_medio", label: "Preço Médio", type: "decimal", width: "half" },
    { name: "taxa_vitoria", label: "Taxa Vitória (%)", type: "decimal", width: "half" },
    { name: "segmentos", label: "Segmentos", type: "json", width: "full" },
    { name: "observacoes", label: "Observações", type: "textarea", width: "full" },
  ],
};

export const precosHistoricosConfig: CrudPageConfig = {
  table: "precos-historicos",
  title: "Preços Históricos",
  icon: <DollarSign size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", width: "half" },
    { name: "produto_id", label: "Produto ID", type: "text", width: "half" },
    { name: "concorrente_id", label: "Concorrente ID", type: "text", width: "half" },
    { name: "preco_referencia", label: "Preço Referência", type: "decimal", width: "half" },
    { name: "preco_vencedor", label: "Preço Vencedor", type: "decimal", width: "half" },
    { name: "nosso_preco", label: "Nosso Preço", type: "decimal", width: "half" },
    { name: "desconto_percentual", label: "Desconto (%)", type: "decimal", width: "half" },
    { name: "empresa_vencedora", label: "Empresa Vencedora", type: "text", width: "half" },
    { name: "resultado", label: "Resultado", type: "select", options: enumOpts(["vitoria", "derrota", "cancelado", "deserto", "revogado"]), width: "half" },
    { name: "motivo_perda", label: "Motivo Perda", type: "select", options: enumOpts(["preco", "tecnica", "documentacao", "prazo", "outro"]), width: "half" },
    { name: "data_homologacao", label: "Data Homologação", type: "date", width: "half" },
    { name: "fonte", label: "Fonte", type: "select", options: enumOpts(["manual", "pncp", "ata_pdf", "painel_precos"]), width: "half" },
  ],
};

export const participacoesEditaisConfig: CrudPageConfig = {
  table: "participacoes-editais",
  title: "Participações em Editais",
  icon: <Scale size={24} />,
  parentFk: "edital_id",
  parentTable: "editais",
  parentLabelFn: (item) => `${item.numero || ""} - ${item.orgao || ""}`,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "concorrente_id", label: "Concorrente ID", type: "text", width: "half" },
    { name: "preco_proposto", label: "Preço Proposto", type: "decimal", width: "half" },
    { name: "posicao_final", label: "Posição Final", type: "number", width: "half" },
    { name: "desclassificado", label: "Desclassificado", type: "boolean", width: "half" },
    { name: "motivo_desclassificacao", label: "Motivo Desclassificação", type: "textarea", width: "full" },
    { name: "fonte", label: "Fonte", type: "select", options: enumOpts(["manual", "pncp", "ata_pdf"]), width: "half" },
  ],
};

// === 8. ALERTAS E MONITORAMENTO ===

export const alertasConfig: CrudPageConfig = {
  table: "alertas",
  title: "Alertas",
  icon: <Bell size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["abertura", "impugnacao", "recursos", "proposta", "personalizado"]), width: "half" },
    { name: "data_disparo", label: "Data Disparo", type: "datetime", required: true, width: "half" },
    { name: "tempo_antes_minutos", label: "Minutos Antes", type: "number", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["agendado", "disparado", "lido", "cancelado"]), width: "half" },
    { name: "titulo", label: "Título", type: "text", width: "half" },
    { name: "mensagem", label: "Mensagem", type: "textarea", width: "full" },
    { name: "canal_email", label: "Email", type: "boolean", width: "half" },
    { name: "canal_push", label: "Push", type: "boolean", width: "half" },
    { name: "canal_sms", label: "SMS", type: "boolean", width: "half" },
  ],
};

export const monitoramentosConfig: CrudPageConfig = {
  table: "monitoramentos",
  title: "Monitoramentos",
  icon: <Eye size={24} />,
  fields: [
    { name: "termo", label: "Termo de Busca", type: "text", required: true, width: "half" },
    { name: "fontes", label: "Fontes", type: "json", width: "half" },
    { name: "ufs", label: "UFs", type: "json", width: "half" },
    { name: "valor_minimo", label: "Valor Mínimo", type: "decimal", width: "half" },
    { name: "valor_maximo", label: "Valor Máximo", type: "decimal", width: "half" },
    { name: "frequencia_horas", label: "Frequência (horas)", type: "number", width: "half" },
    { name: "score_minimo_alerta", label: "Score Mínimo", type: "number", width: "half" },
    { name: "notificar_email", label: "Notificar Email", type: "boolean", width: "half" },
    { name: "notificar_push", label: "Notificar Push", type: "boolean", width: "half" },
    { name: "ativo", label: "Ativo", type: "boolean", width: "half" },
  ],
};

export const notificacoesConfig: CrudPageConfig = {
  table: "notificacoes",
  title: "Notificações",
  icon: <Mail size={24} />,
  fields: [
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["alerta_prazo", "novo_edital", "alta_aderencia", "resultado", "sistema"]), width: "half" },
    { name: "edital_id", label: "Edital ID", type: "text", width: "half" },
    { name: "alerta_id", label: "Alerta ID", type: "text", width: "half" },
    { name: "titulo", label: "Título", type: "text", required: true, width: "half" },
    { name: "mensagem", label: "Mensagem", type: "textarea", required: true, width: "full" },
    { name: "dados", label: "Dados Extra", type: "json", width: "full" },
    { name: "lida", label: "Lida", type: "boolean", width: "half" },
    { name: "enviado_email", label: "Enviado Email", type: "boolean", width: "half" },
    { name: "enviado_push", label: "Enviado Push", type: "boolean", width: "half" },
  ],
};

export const preferenciasNotificacaoConfig: CrudPageConfig = {
  table: "preferencias-notificacao",
  title: "Preferências de Notificação",
  icon: <Bell size={24} />,
  fields: [
    { name: "email_habilitado", label: "Email Habilitado", type: "boolean", width: "half" },
    { name: "push_habilitado", label: "Push Habilitado", type: "boolean", width: "half" },
    { name: "sms_habilitado", label: "SMS Habilitado", type: "boolean", width: "half" },
    { name: "email_notificacao", label: "Email para Notificações", type: "email", width: "half" },
    { name: "horario_inicio", label: "Horário Início", type: "text", width: "half", placeholder: "07:00" },
    { name: "horario_fim", label: "Horário Fim", type: "text", width: "half", placeholder: "22:00" },
    { name: "dias_semana", label: "Dias da Semana", type: "json", width: "full" },
    { name: "alertas_padrao", label: "Alertas Padrão (minutos)", type: "json", width: "full" },
    { name: "score_minimo_notificacao", label: "Score Mínimo", type: "number", width: "half" },
  ],
};

// === 9. CONTRATOS ===

export const contratosConfig: CrudPageConfig = {
  table: "contratos",
  title: "Contratos",
  icon: <Briefcase size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", width: "half" },
    { name: "proposta_id", label: "Proposta ID", type: "text", width: "half" },
    { name: "numero_contrato", label: "Nº Contrato", type: "text", width: "half" },
    { name: "orgao", label: "Órgão", type: "text", width: "half" },
    { name: "objeto", label: "Objeto", type: "textarea", width: "full" },
    { name: "valor_total", label: "Valor Total", type: "decimal", width: "half" },
    { name: "data_assinatura", label: "Data Assinatura", type: "date", width: "half" },
    { name: "data_inicio", label: "Data Início", type: "date", width: "half" },
    { name: "data_fim", label: "Data Fim", type: "date", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["vigente", "encerrado", "rescindido", "suspenso"]), width: "half" },
    { name: "observacoes", label: "Observações", type: "textarea", width: "full" },
  ],
};

export const contratoEntregasConfig: CrudPageConfig = {
  table: "contrato-entregas",
  title: "Entregas de Contratos",
  icon: <Clock size={24} />,
  parentFk: "contrato_id",
  parentTable: "contratos",
  parentLabelFn: (item) => `${item.numero_contrato || ""} - ${item.orgao || ""}`,
  fields: [
    { name: "contrato_id", label: "Contrato ID", type: "text", required: true, width: "half" },
    { name: "produto_id", label: "Produto ID", type: "text", width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", width: "full" },
    { name: "quantidade", label: "Quantidade", type: "decimal", width: "half" },
    { name: "valor_unitario", label: "Valor Unitário", type: "decimal", width: "half" },
    { name: "valor_total", label: "Valor Total", type: "decimal", width: "half" },
    { name: "data_prevista", label: "Data Prevista", type: "date", required: true, width: "half" },
    { name: "data_realizada", label: "Data Realizada", type: "date", width: "half" },
    { name: "nota_fiscal", label: "Nota Fiscal", type: "text", width: "half" },
    { name: "numero_empenho", label: "Nº Empenho", type: "text", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["pendente", "entregue", "atrasado", "cancelado"]), width: "half" },
    { name: "observacoes", label: "Observações", type: "textarea", width: "full" },
  ],
};

// === 10. RECURSOS ===

export const recursosConfig: CrudPageConfig = {
  table: "recursos",
  title: "Recursos e Impugnações",
  icon: <Gavel size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: enumOpts(["recurso", "contra_razao", "impugnacao"]), width: "half" },
    { name: "motivo", label: "Motivo", type: "textarea", width: "full" },
    { name: "texto_minuta", label: "Texto da Minuta", type: "textarea", width: "full" },
    { name: "fundamentacao_legal", label: "Fundamentação Legal", type: "textarea", width: "full" },
    { name: "prazo_limite", label: "Prazo Limite", type: "datetime", required: true, width: "half" },
    { name: "data_protocolo", label: "Data Protocolo", type: "datetime", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["rascunho", "protocolado", "deferido", "indeferido", "pendente"]), width: "half" },
    { name: "resultado", label: "Resultado", type: "textarea", width: "full" },
    { name: "arquivo_path", label: "Arquivo", type: "text", width: "full" },
  ],
};

// === 11. CRM ===

export const leadsCrmConfig: CrudPageConfig = {
  table: "leads-crm",
  title: "Leads CRM",
  icon: <TrendingUp size={24} />,
  fields: [
    { name: "orgao", label: "Órgão", type: "text", required: true, width: "half" },
    { name: "cnpj_orgao", label: "CNPJ do Órgão", type: "text", width: "half" },
    { name: "edital_id", label: "Edital ID", type: "text", width: "half" },
    { name: "contato_nome", label: "Nome do Contato", type: "text", width: "half" },
    { name: "contato_cargo", label: "Cargo", type: "text", width: "half" },
    { name: "contato_telefone", label: "Telefone", type: "text", width: "half" },
    { name: "contato_email", label: "Email", type: "email", width: "half" },
    { name: "status_pipeline", label: "Status Pipeline", type: "select", options: enumOpts(["prospeccao", "contato", "proposta", "negociacao", "ganho", "perdido", "inativo"]), width: "half" },
    { name: "origem", label: "Origem", type: "text", width: "half" },
    { name: "valor_potencial", label: "Valor Potencial", type: "decimal", width: "half" },
    { name: "proxima_acao", label: "Próxima Ação", type: "textarea", width: "full" },
    { name: "data_proxima_acao", label: "Data Próxima Ação", type: "date", width: "half" },
    { name: "observacoes", label: "Observações", type: "textarea", width: "full" },
  ],
};

export const acoesPosePerdaConfig: CrudPageConfig = {
  table: "acoes-pos-perda",
  title: "Ações Pós-Perda",
  icon: <AlertTriangle size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", width: "half" },
    { name: "lead_crm_id", label: "Lead CRM ID", type: "text", width: "half" },
    { name: "tipo_acao", label: "Tipo de Ação", type: "select", options: enumOpts(["reprocessar_oferta", "visita_tecnica", "nova_proposta", "recurso", "acompanhar"]), width: "half" },
    { name: "responsavel", label: "Responsável", type: "text", width: "half" },
    { name: "descricao", label: "Descrição", type: "textarea", width: "full" },
    { name: "data_prevista", label: "Data Prevista", type: "date", width: "half" },
    { name: "data_realizada", label: "Data Realizada", type: "date", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["pendente", "em_andamento", "concluida", "cancelada"]), width: "half" },
    { name: "resultado", label: "Resultado", type: "textarea", width: "full" },
  ],
};

// === 12. AUDITORIA ===

export const auditoriaLogConfig: CrudPageConfig = {
  table: "auditoria-log",
  title: "Log de Auditoria",
  icon: <Database size={24} />,
  fields: [
    { name: "acao", label: "Ação", type: "text", width: "half" },
    { name: "entidade", label: "Entidade", type: "text", width: "half" },
    { name: "entidade_id", label: "Entidade ID", type: "text", width: "half" },
    { name: "user_email", label: "Email Usuário", type: "text", width: "half" },
    { name: "ip_address", label: "IP", type: "text", width: "half" },
    { name: "user_agent", label: "User Agent", type: "text", width: "full" },
    { name: "dados_antes", label: "Dados Antes", type: "json", width: "full" },
    { name: "dados_depois", label: "Dados Depois", type: "json", width: "full" },
  ],
};

export const aprendizadoFeedbackConfig: CrudPageConfig = {
  table: "aprendizado-feedback",
  title: "Feedback de Aprendizado",
  icon: <BookOpen size={24} />,
  fields: [
    { name: "tipo_evento", label: "Tipo de Evento", type: "select", required: true, options: enumOpts(["resultado_edital", "score_ajustado", "preco_ajustado", "feedback_usuario"]), width: "half" },
    { name: "entidade", label: "Entidade", type: "text", width: "half" },
    { name: "entidade_id", label: "Entidade ID", type: "text", width: "half" },
    { name: "dados_entrada", label: "Dados Entrada", type: "json", width: "full" },
    { name: "resultado_real", label: "Resultado Real", type: "json", width: "full" },
    { name: "delta", label: "Delta", type: "json", width: "full" },
    { name: "aplicado", label: "Aplicado", type: "boolean", width: "half" },
  ],
};

// === 13. PARÂMETROS E ESTRATÉGIA ===

export const parametrosScoreConfig: CrudPageConfig = {
  table: "parametros-score",
  title: "Parâmetros de Score",
  icon: <Target size={24} />,
  fields: [
    { name: "peso_tecnico", label: "Peso Técnico", type: "decimal", width: "half" },
    { name: "peso_comercial", label: "Peso Comercial", type: "decimal", width: "half" },
    { name: "peso_participacao", label: "Peso Participação", type: "decimal", width: "half" },
    { name: "peso_ganho", label: "Peso Ganho", type: "decimal", width: "half" },
    { name: "limiar_go", label: "Limiar GO", type: "decimal", width: "half" },
    { name: "limiar_nogo", label: "Limiar NO-GO", type: "decimal", width: "half" },
    { name: "margem_minima", label: "Margem Mínima", type: "decimal", width: "half" },
  ],
};

export const dispensasConfig: CrudPageConfig = {
  table: "dispensas",
  title: "Dispensas",
  icon: <Zap size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "artigo", label: "Artigo", type: "text", width: "half" },
    { name: "valor_limite", label: "Valor Limite", type: "decimal", width: "half" },
    { name: "status", label: "Status", type: "select", options: enumOpts(["aberta", "cotacao_enviada", "adjudicada", "encerrada"]), width: "half" },
    { name: "justificativa", label: "Justificativa", type: "textarea", width: "full" },
    { name: "fornecedores_cotados", label: "Fornecedores Cotados", type: "json", width: "full" },
    { name: "data_limite", label: "Data Limite", type: "datetime", width: "half" },
  ],
};

export const estrategiasEditaisConfig: CrudPageConfig = {
  table: "estrategias-editais",
  title: "Estratégias de Editais",
  icon: <Target size={24} />,
  fields: [
    { name: "edital_id", label: "Edital ID", type: "text", required: true, width: "half" },
    { name: "decisao", label: "Decisão", type: "select", options: enumOpts(["go", "nogo", "acompanhar"]), width: "half" },
    { name: "prioridade", label: "Prioridade", type: "select", options: enumOpts(["alta", "media", "baixa"]), width: "half" },
    { name: "margem_desejada", label: "Margem Desejada (%)", type: "decimal", width: "half" },
    { name: "agressividade_preco", label: "Agressividade Preço", type: "select", options: enumOpts(["conservador", "moderado", "agressivo"]), width: "half" },
    { name: "data_decisao", label: "Data Decisão", type: "datetime", width: "half" },
    { name: "decidido_por", label: "Decidido Por", type: "text", width: "half" },
    { name: "justificativa", label: "Justificativa", type: "textarea", width: "full" },
  ],
};

// ─── All configs map (table slug → config) ────────────────────────────────────

export const ALL_CRUD_CONFIGS: Record<string, CrudPageConfig> = {
  "empresas": empresaConfig,
  "empresa-documentos": empresaDocumentosConfig,
  "empresa-certidoes": empresaCertidoesConfig,
  "empresa-responsaveis": empresaResponsaveisConfig,
  "produtos": produtosConfig,
  "produtos-especificacoes": produtosEspecificacoesConfig,
  "produtos-documentos": produtosDocumentosConfig,
  "fontes-editais": fontesEditaisConfig,
  "editais": editaisConfig,
  "editais-requisitos": editaisRequisitosConfig,
  "editais-documentos": editaisDocumentosConfig,
  "editais-itens": editaisItensConfig,
  "analises": analisesConfig,
  "propostas": propostasConfig,
  "concorrentes": concorrentesConfig,
  "precos-historicos": precosHistoricosConfig,
  "participacoes-editais": participacoesEditaisConfig,
  "alertas": alertasConfig,
  "monitoramentos": monitoramentosConfig,
  "notificacoes": notificacoesConfig,
  "preferencias-notificacao": preferenciasNotificacaoConfig,
  "contratos": contratosConfig,
  "contrato-entregas": contratoEntregasConfig,
  "recursos": recursosConfig,
  "leads-crm": leadsCrmConfig,
  "acoes-pos-perda": acoesPosePerdaConfig,
  "auditoria-log": auditoriaLogConfig,
  "aprendizado-feedback": aprendizadoFeedbackConfig,
  "parametros-score": parametrosScoreConfig,
  "dispensas": dispensasConfig,
  "estrategias-editais": estrategiasEditaisConfig,
};
