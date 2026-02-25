# PLANEJAMENTO SPRINT 2 — 37 RFs Completos + UI Reorganizada

**Data:** 2026-02-23
**Objetivo:** Tornar RF-001 a RF-037 100% implementados, com UI organizada em abas/cards claros
**Principio:** NAO reinventar — usar endpoints existentes, prompts do chat, CRUD genérico

---

## ESTRATEGIA GERAL

### O que JA EXISTE e deve ser PRESERVADO:
- 47 action_types no backend (buscar_editais, calcular_aderencia, gerar_proposta, etc.)
- 149 prompts prontos no ChatInput.tsx
- onSendToChat() integrado em Portfolio, Empresa, Parametrizacoes
- CRUD genérico com 37+ tabelas
- Endpoints específicos: /api/editais/buscar, /api/editais/{id}/scores-validacao, /api/editais/{id}/documentacao-necessaria

### O que precisa ser FEITO:
1. **Reorganizar UI** — ValidacaoPage empilhada → abas/cards claros
2. **Corrigir 10 bugs** identificados
3. **Integrar prompts de IA** como botões nas páginas corretas (muitos existem só no dropdown do chat)
4. **Fechar gaps de RFs** — 11 PARCIAL + 3 NAO implementados

---

## AGENT TEAM: 5 AGENTES

### Dependencias:
- Todos independentes (nenhum cria backend novo)
- Podem rodar em PARALELO

---

## AGENTE 1: empresa-agent — EmpresaPage (RF-001 a RF-005)

**Arquivo:** `frontend/src/pages/EmpresaPage.tsx` (707 linhas)

### Tarefas:

**E1. RF-002 — Status de documentos com vencimento**
- Linha 151: `status: d.path_arquivo ? "ok" : "falta"` → calcular: se tem arquivo + validade > 30 dias = "ok", validade <= 30 dias = "vence", sem arquivo = "falta"
- Adicionar cores: verde=ok, amarelo=vence, vermelho=falta no StatusBadge

**E2. RF-003 — Certidoes Automaticas (IMPLEMENTAR DO ZERO)**
- Linha 157: Mapear `certidao` → `c.tipo`. Criar label map: `{cnd_federal: "CND Federal", cnd_estadual: "CND Estadual", cnd_municipal: "CND Municipal", fgts: "FGTS", trabalhista: "Trabalhista", outro: "Outro"}`
- Linha 50: Mudar enum de `obtida/pendente/erro` para `valida/vencida/pendente` (igual backend)
- Adaptar getCertidaoStatus() para novos valores
- Habilitar botão "Buscar Certidoes" → `onSendToChat("Busque certidões automáticas para a empresa CNPJ " + cnpj)`
- Conectar botões Visualizar/Download/RefreshCw a handlers reais

**E3. RF-004 — Alertas IA sobre Documentos**
- Adicionar Card "Alertas IA" no topo da página, acima de Documentos
- Botão "Verificar Documentos" (já existe desabilitado) → habilitar → `onSendToChat("Verifique os documentos da empresa contra os editais que estamos participando. Liste documentos faltantes, vencidos e exigências possivelmente ilegais.")`
- Mostrar resposta da IA em card de alertas com badges vermelhas/amarelas/verdes

**E4. RF-005 — Responsaveis com Tipo e Edicao**
- No modal de adicionar: adicionar dropdown `tipo` com opções: representante_legal, preposto, tecnico
- Adicionar botão Editar na tabela → abre modal pre-preenchido
- Coluna "Tipo" na tabela

### Regras:
- NAO reescrever a página, só modificar seções específicas
- Usar onSendToChat para integrar IA (já recebe como prop)
- CRUD já funciona, só precisa corrigir mapeamentos

---

## AGENTE 2: validacao-agent — ValidacaoPage (RF-026 a RF-037)

**Arquivo:** `frontend/src/pages/ValidacaoPage.tsx` (1315 linhas)

### REORGANIZACAO DE UI (PRINCIPAL):

A página está empilhada verticalmente e confusa. Reorganizar em layout claro:

**Layout proposto:**
```
┌─────────────────────────────────────────────────┐
│ TABELA DE EDITAIS (sem mudança)                  │
├─────────────────────────────────────────────────┤
│ TOP BAR: Decisão + Sinais de Mercado (sem mudança)│
├──────────────────┬──────────────────────────────┤
│ CARD ESQUERDO:   │ CARD DIREITO:                │
│ Info do Edital   │ Score Dashboard              │
│ + Status         │ + GO/NO-GO                   │
│ + Produto        │ + 6 ScoreBars                │
│                  │ + Botão Calcular             │
├──────────────────┴──────────────────────────────┤
│ 5 ABAS (reorganizadas):                         │
│ ┌────────┬──────────┬──────────┬───────┬──────┐ │
│ │Aderencia│Documentos│Riscos   │Mercado│IA    │ │
│ └────────┴──────────┴──────────┴───────┴──────┘ │
│                                                  │
│ Conteúdo da aba selecionada                     │
└─────────────────────────────────────────────────┘
```

**5 abas (em vez de 3 confusas + Processo Amanda solto):**

**Aba 1 — Aderência Técnica** (era parte da Objetiva)
- Score Detalhado (sub-scores técnicos)
- Certificações com status
- Análise de Lote (barra segmentada)
- Mapa Logístico (corrigir UF hardcoded → buscar empresa via crudList("empresas"))
- Intencão Estratégica + Margem (mover para cá, perto do score)

**Aba 2 — Documentos & Amanda** (era Processo Amanda + Checklist)
- Processo Amanda (3 pastas coloridas — já funciona com dados reais)
- Checklist Documental (mover da Objetiva para cá)
- Botão "Verificar Documentos via IA" → `onSendToChat("Quais documentos são exigidos no edital " + numero + "?")`

**Aba 3 — Riscos & Jurídico** (era parte da Analítica)
- Pipeline de Riscos (Modalidade + Flags)
- Fatal Flaws
- Alerta de Recorrência
- Aderência Trecho-a-Trecho
- Classificar Impeditivo vs Ponto de Atenção (RF-035): score < 30% = Impeditivo (vermelho), 30-70% = Ponto de Atenção (amarelo)

**Aba 4 — Mercado & Órgão** (era parte da Analítica)
- Reputação do Órgão (já funcional com dados reais)
- Histórico Semelhante (já funcional — mover da Cognitiva)
- Botão "Analisar Concorrente" → `onSendToChat("Analise o concorrente mais frequente do órgão " + orgao)`
- Botão "Buscar Preços de Mercado" → `onSendToChat("Busque preços de " + objeto + " no PNCP")`

**Aba 5 — IA Insights** (era Cognitiva)
- Resumo IA (já funcional)
- Pergunte à IA (já funcional)
- Botão "Resumir Edital" → onSendToChat (já existe)
- Botão "Documentos Exigidos" → `onSendToChat("Quais documentos são exigidos no edital " + numero + "?")`
- Botão "Requisitos Técnicos" → `onSendToChat("Quais são os requisitos técnicos do edital " + numero + "?")`
- Botão "Classificar Edital" → `onSendToChat("Classifique este edital: " + objeto)`

### Bugs a corrigir:
- Mapa Logístico: UF "SP" hardcoded → buscar empresa via `crudList("empresas", { limit: 1 })`
- RF-035: Adicionar badge "Impeditivo" (vermelho) vs "Ponto de Atenção" (amarelo) nas 6 dimensões

### Regras:
- MOVER conteúdo entre abas, não reescrever lógica
- Todo o código de fetch/state que já existe PERMANECE
- Apenas reorganizar o JSX de renderização
- Adicionar botões de IA via onSendToChat onde faltam

---

## AGENTE 3: captacao-agent — CaptacaoPage (RF-019 a RF-025)

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx` (1159 linhas)

### Tarefas:

**C1. Bug score_comercial = score (RF-020)**
- Linha 136-138: `comercial: score` → calcular separadamente
- Se backend retorna `e.score_comercial`, usar. Senão: calcular baseado em UF do edital vs estados de atuação do parametros-score
- Buscar estados via `crudList("parametros-score", { limit: 1 })` no useEffect

**C2. Bug gaps: [] sempre (RF-024)**
- Linha 147: `gaps: []` → extrair de `e.analise_gaps` ou `e.gaps` se backend retornar
- Se não retornar: calcular localmente comparando `e.produtos_aderentes` vs requisitos

**C3. RF-025 — Monitoramento CRUD Visual**
- Card de Monitoramento já existe mas sem CRUD visual
- Adicionar modal "Novo Monitoramento": Termo, UFs (checkboxes), Frequência (select)
- Criar via `onSendToChat("Monitore editais de " + termo + " nos estados " + ufs.join(", ") + " a cada " + freq)`
- Botões: Pausar → `onSendToChat("Pare de monitorar " + termo)`, Excluir

**C4. Integrar onSendToChat (FALTA)**
- CaptacaoPage NÃO usa onSendToChat! Recebe `_props?: PageProps` mas ignora
- Adicionar botões de IA no painel lateral:
  - "Classificar Edital" → `onSendToChat("Classifique este edital: " + objeto)`
  - "Recomendar Preço" → `onSendToChat("Recomende preço para " + objeto)`
  - "Analisar Concorrentes" → `onSendToChat("Liste os concorrentes conhecidos")`

**C5. RF-021 — Filtros completos**
- Adicionar 4 opções faltantes no filtro Origem: Centros de Pesquisas, Campanhas Governamentais, Fundações de Pesquisa, Fundações diversas

### Regras:
- Aceitar onSendToChat das props (hoje ignorado)
- Não mudar layout geral (StatCards + Busca + Tabela + Painel)

---

## AGENTE 4: portfolio-agent — PortfolioPage (RF-006 a RF-012)

**Arquivo:** `frontend/src/pages/PortfolioPage.tsx` (1020 linhas)

### Tarefas:

**P1. RF-011 — Funil de Monitoramento (IMPLEMENTAR)**
- Linhas 916-967: Substituir decorativo por dados reais
- Buscar `crudList("monitoramentos", { limit: 10 })` no useEffect
- "Agente Ativo" → verde se existe monitoramento ativo, cinza se não
- "Última verificação" → data real do último monitoramento
- Categorias do "Filtro Inteligente" → carregar de `crudList("classes-produtos")` em vez de hardcoded
- Contagem de editais → usar count dos monitoramentos

**P2. RF-009 — SPECS_POR_CLASSE completo**
- SPECS_POR_CLASSE tem 4 categorias (equipamento, reagente, insumo_hospitalar, informatica)
- Adicionar 5 faltantes: insumo_laboratorial, redes, mobiliario, eletronico, comodato
- Manter como fallback (backend `campos_mascara` tem prioridade)

**P3. Aba Classificação — Limpar duplicata**
- Adicionar nota "Gerencie classes em Parametrizações" com link/botão
- Remover card com texto "A IA deveria gerar esses agrupamentos" (linha 911)

**P4. Integrar mais prompts de IA como botões**
- Na aba Meus Produtos, ao selecionar produto:
  - "Buscar ANVISA" → já existe
  - "Verificar Completude" → já existe
  - Adicionar: "Buscar Preços de Mercado" → `onSendToChat("Busque preços de " + produto.nome + " no PNCP")`

### Regras:
- Não mudar as 4 abas (Meus Produtos, Uploads, Cadastro Manual, Classificação)
- Funil é a mudança principal

---

## AGENTE 5: parametrizacoes-agent — ParametrizacoesPage (RF-013 a RF-018)

**Arquivo:** `frontend/src/pages/ParametrizacoesPage.tsx` (1235 linhas)

### Tarefas:

**R1. Corrigir botão Salvar Notificações (Bug #5)**
- Linha 1087: `onClick={() => {}}` → implementar handler
- Salvar via `saveParamScore({ email_notificacao: emailNotif, notif_email: notifEmail, notif_sistema: notifSistema, notif_sms: notifSms, frequencia_resumo: frequenciaResumo })`
- Mostrar toast "Configurações salvas"

**R2. Corrigir botão Salvar Preferências (Bug #6)**
- Linha 1141: `onClick={() => {}}` → implementar handler
- Salvar via `saveParamScore({ tema: tema, idioma: idioma, fuso_horario: fusoHorario })`
- Mostrar toast "Preferências salvas"

**R3. Fontes Documentais — Sincronizar com Empresa**
- Linhas 821-856: Substituir mock hardcoded por dados reais
- Carregar `crudList("empresa-documentos", { limit: 50 })` e `crudList("empresa-certidoes", { limit: 50 })`
- Para cada tipo de documento listado, verificar se empresa tem: "Temos" (verde) ou "Não temos" (vermelho)
- Se empresa não cadastrada, mostrar "Configure na página Empresa"

**R4. Editar Subclasse (Bug #8)**
- Linha 672: Adicionar onClick no botão Pencil da subclasse
- Handler: abrir modal pre-preenchido com dados da subclasse (nome, NCMs)
- Salvar via `crudUpdate("classes-produtos", subId, { nome, ncms })`

**R5. RF-018 — Norteadores clicáveis**
- Cada card norteador deve ter onClick que navega para a aba/seção correspondente:
  - (a) Classificação → muda para aba "Produtos"
  - (b) Comercial → muda para aba "Comercial"
  - (c) Tipos Edital → scroll para seção Tipos
  - (d) Técnico → link para PortfolioPage
  - (e) Participação → muda para aba "Comercial"
  - (f) Ganho → placeholder

### Regras:
- Não mudar estrutura de 5 abas
- saveParamScore já existe, apenas chamar com campos corretos
- Verificar se campos existem no backend (adicionar se necessário via ALTER TABLE)

---

## VERIFICACAO FINAL

Após todos os agentes completarem:

1. `cd frontend && npx tsc --noEmit` — sem erros
2. `cd frontend && npx vite build` — compila OK
3. Criar MANUAL_TESTE_SPRINT2_2302.md com instruções para testar cada RF
4. Criar relatório final verificando os 37 RFs

---

## ESTIMATIVA

| Agente | Complexidade | Tempo estimado |
|--------|-------------|----------------|
| empresa-agent | Alta (certidões do zero + alertas IA) | ~40 min |
| validacao-agent | Alta (reorganizar 5 abas + integrar IA) | ~50 min |
| captacao-agent | Média (bugs + monitoramento + IA) | ~30 min |
| portfolio-agent | Média (funil real + specs) | ~25 min |
| parametrizacoes-agent | Baixa (bugs + sincronizar docs) | ~20 min |

**Total em paralelo: ~50 min (tempo do mais lento)**
