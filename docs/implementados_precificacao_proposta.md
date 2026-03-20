# Funcionalidades Já Implementadas para Precificação e Proposta

**Data:** 20/03/2026
**Contexto:** Itens removidos das abas Mercado e IA da Validação por pertencerem às etapas de Precificação (RF-039+) e Proposta (RF-040+). Já estão funcionais no sistema via chat ou endpoints.

---

## Removidos da Aba Mercado

### Buscar Preços (RF-039-12 — Precificação)
- **O que fazia:** Botão "Buscar Preços" enviava para o chat "Busque preços de [objeto] no PNCP"
- **Já implementado:**
  - `tool_buscar_precos_pncp()` — busca preços no PNCP por termo
  - `tool_historico_precos()` — consulta histórico local (tabela `precos_historicos`)
  - `tool_recomendar_preco()` — recomenda faixa de preço (agressivo/ideal/conservador)
  - Prompts no chat: "Busque preços de [TERMO] no PNCP", "Histórico de preços de [TERMO]", "Recomende preço para [TERMO]"
- **Onde usar na Precificação:** PrecificacaoPage — dashboard de preços com gráfico de evolução temporal

### Analisar Concorrentes (RF-049 — Concorrência)
- **O que fazia:** Botão "Analisar Concorrentes" enviava para o chat "Liste os concorrentes conhecidos"
- **Já implementado:**
  - `tool_listar_concorrentes()` — lista concorrentes com estatísticas
  - `tool_analisar_concorrente()` — análise detalhada de um concorrente
  - Tabela `concorrentes` com nome, CNPJ, participações, vitórias, taxa
  - Tabela `precos_historicos` com preços por concorrente
  - CRUD em Cadastros > Editais > Concorrentes
  - Listagem de concorrentes na aba Riscos da Validação
  - Prompts no chat: "Liste concorrentes", "Analise o concorrente [NOME]", "Taxa de vitória do concorrente [NOME]"
- **Onde usar na Concorrência:** Tela dedicada com tabela completa, filtros, análise comparativa

### Histórico de Editais Semelhantes (duplicado com Riscos)
- **O que fazia:** Buscava editais do mesmo órgão no banco e mostrava decisões anteriores
- **Já implementado na aba Riscos:**
  - Busca de atas no PNCP com frequência de recorrência
  - Vencedores e preços das atas
  - Concorrentes identificados
  - Alerta de recorrência

---

## Removidos da Aba IA

### Gerar Proposta (RF-040+ — Proposta)
- **O que fazia:** Botão "Gerar Proposta" enviava para o chat "Gere uma proposta do produto [X] para o edital [Y]"
- **Já implementado:**
  - `tool_gerar_proposta()` — gera proposta técnica completa via IA
  - PropostaPage — tela dedicada para geração e edição de propostas
  - Prompts no chat: "Gere uma proposta do produto [NOME] para o edital [NUMERO] com preço R$ [VALOR]"
- **Onde usar na Proposta:** PropostaPage — editor de proposta com preview e exportação

### Baixar PDF do Edital (redundante)
- **O que fazia:** Botão "Baixar PDF do Edital" enviava para o chat
- **Já implementado:**
  - Botão "Ver Edital" no topo da Validação (abre PDF em modal)
  - Botão "Baixar PDF" no painel da Captação
  - Download automático ao salvar edital
  - `tool_baixar_pdf_pncp()` com extração de ZIP

### Buscar Itens (redundante)
- **O que fazia:** Botão "Buscar Itens" enviava para o chat
- **Já implementado:**
  - Botão "Buscar Itens no PNCP" na aba Lotes (chamada direta ao endpoint)
  - Busca automática ao salvar edital na Captação
  - `tool_buscar_itens_edital_pncp()` — endpoint REST direto

---

## Funcionalidades Mantidas

### Aba Mercado
- **RF-033 — Reputação do Órgão:** Dados do órgão (pregoeiro, pagamento, histórico de participações)

### Aba IA
- **Resumo do Edital:** Geração de resumo via IA (2-3 parágrafos)
- **Perguntar à IA:** Campo livre para perguntas sobre o edital
- **Requisitos Técnicos:** Botão que consulta requisitos técnicos via chat
- **Classificar Edital:** Botão que classifica o edital via chat
