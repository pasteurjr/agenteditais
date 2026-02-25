# ANALISE PROFUNDA — COBERTURA DE REQUISITOS + BUGS — 23/02/2026 12:40

**Commit de seguranca**: `6b34881` (23/02/2026 CHAT FUNCIONA BEM)
**Requisitos**: `docs/requisitos_completosv2.md` — 60 RFs + 4 RNFs
**Arquivos analisados**: 5 paginas React/TypeScript (total ~4.135 linhas)

---

## PARTE 1 — COBERTURA DE REQUISITOS RF POR RF

Legenda de status:
- **OK** = Implementado e funcionando
- **PARCIAL** = Parcialmente implementado (funcionalidade existe mas incompleta)
- **MOCK** = Interface existe mas dados sao fake/hardcoded
- **STUB** = Botao/UI existe mas handler vazio ou desabilitado
- **NAO** = Nao implementado
- **BUG** = Implementado mas com defeito que impede uso

---

### FUNDACAO — EmpresaPage (RF-001 a RF-005)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-001 | Cadastro da Empresa | **OK** | Todos os campos do wireframe: razao social, CNPJ, inscricao estadual, website, instagram, linkedin, facebook, emails (multiplos), celulares (multiplos), endereco/cidade/UF/CEP. CRUD create/update funciona (linhas 179-210). |
| RF-002 | Documentos Habilitativos | **OK** | Upload de documentos com tipo (11 opcoes em optgroup), data_vencimento, visualizar/download/excluir. Falta: status calculado (ok/vence/falta) e NAO e baseado em data_vencimento real — usa `path_arquivo ? "ok" : "falta"` (linha 151). |
| RF-003 | Certidoes Automaticas | **BUG** | Secao existe com tabela de certidoes (linhas 587-607). POREM: (a) enum de status no frontend `obtida/pendente/erro` NAO bate com backend `valida/vencida/pendente` — badges nunca aparecem corretamente; (b) campo `certidao` no frontend vs `tipo` no backend — coluna certidao sempre vazia; (c) botao "Buscar Certidoes" desabilitado com handler vazio. **Nenhuma certidao automatica funciona de verdade.** |
| RF-004 | Alertas IA sobre Documentos | **NAO** | Nao existe implementacao de comparacao IA entre documentos da empresa e requisitos dos editais. Nao ha alertas de documentos faltantes/vencidos/excessivos. Nao ha verificacao de jurisprudencia. |
| RF-005 | Responsaveis da Empresa | **PARCIAL** | Tabela de responsaveis com nome, cargo, email, telefone funciona. Modal para adicionar funciona. Excluir funciona. **Falta**: (a) campo `tipo` (representante_legal/preposto/tecnico) nao implementado; (b) botao de EDITAR responsavel nao existe — so criar e excluir. |

**EmpresaPage: 1 OK + 1 OK(parcial) + 1 BUG + 1 NAO + 1 PARCIAL = 2/5 funcionando**

---

### FUNDACAO — PortfolioPage (RF-006 a RF-012)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-006 | Fontes de Obtencao | **PARCIAL** | 6 de 10 fontes implementadas em UPLOAD_TYPES (linhas 19-26): Manual, Instrucoes, NFS, Plano de Contas, Folders, Website. **Faltam 4**: ANVISA (tem botao separado, ver RF-007), ERP (integracao), Redes Sociais (crawl), Editais Anteriores (extracao de specs). Upload funciona via onSendToChat. |
| RF-007 | Registros ANVISA | **PARCIAL** | Botao "Buscar ANVISA" existe no header (linha 478). Modal com busca por registro ou nome (linhas 972-993). Envia para chat via onSendToChat. **Funciona SE** a tool_buscar_anvisa existir no backend. Nao ha campo de registro ANVISA no cadastro do produto. |
| RF-008 | Cadastro Manual | **OK** | Aba "Cadastro Manual" (linhas 735-828) com: Nome, Classe (dropdown dinamico backend ou fallback), Subclasse, NCM, Fabricante, Modelo, Specs dinamicos por classe. Envio via onSendToChat. |
| RF-009 | Mascara Parametrizavel | **PARCIAL** | Specs mudam dinamicamente conforme classe (linhas 409-427). Prioriza `campos_mascara` do backend, fallback para SPECS_POR_CLASSE. **PROBLEMA**: SPECS_POR_CLASSE so tem 4 de 9 categorias definidas (linhas 79-106). Categorias `insumo_laboratorial`, `redes`, `mobiliario`, `eletronico`, `outro` usam fallback de `equipamento`. |
| RF-010 | IA Le Manuais | **PARCIAL** | Upload de manual na aba Uploads aciona IA via onSendToChat com prompt "Cadastre este produto a partir do manual" (linha 20). IA extrai specs. **Falta**: (a) indicador visual "preenchido pela IA" vs "preenchido manualmente" — so existe badge "IA" generico; (b) usuario nao pode aceitar/rejeitar cada sugestao individualmente; (c) IA nao sugere NOVOS campos alem da mascara. |
| RF-011 | Funil de Monitoramento | **MOCK** | Card informativo com 3 niveis de funil (linhas 915-967) existe visualmente. **POREM**: (a) "Agente Ativo" sempre verde (hardcoded, linha 963); (b) timestamp sempre "hoje 06:00" (fake, linha 964); (c) nao mostra numero real de editais por categoria; (d) nao conecta com monitoramentos reais do backend. E uma ilustracao estatica, nao um componente funcional. |
| RF-012 | Importancia do NCM | **OK** | Campo NCM no cadastro manual (linha 767). NCM por classe e subclasse em CLASSES_PRODUTO. NCM auto-preenchido ao selecionar classe (linhas 303-326). NCM na tabela de produtos (coluna, linha 444). |

**PortfolioPage: 2 OK + 4 PARCIAL + 1 MOCK = 2/7 completos**

Aba Classificacao (linhas 833-913):
- Quando backend tem classes: mostra arvore hierarquica com contagem de produtos. **Funciona.**
- Quando backend vazio: mostra 4 classes hardcoded de CLASSES_PRODUTO. **Fallback funcional.**
- **PROBLEMA CONCEITUAL**: Esta aba deveria estar em Parametrizacoes (RF-013/RF-015), nao em Portfolio. Na Parametrizacoes ja existe a mesma funcionalidade com CRUD completo. A aba Classificacao no Portfolio e **duplicada e read-only** — nao permite criar/editar/excluir classes. Confunde o usuario.

---

### FUNDACAO — ParametrizacoesPage (RF-013 a RF-018)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-013 | Classificacao/Agrupamento | **OK** | Arvore hierarquica Classe > Subclasse com NCMs (linhas 635-682). Criar/editar/excluir classes funciona. Criar/excluir subclasses funciona. **Bug menor**: editar subclasse sem handler (linha 672). IA gerar agrupamentos = STUB (botao desabilitado "Onda 4", linha 622). |
| RF-014 | Fontes de Busca | **OK** | Aba "Fontes de Busca" com: CRUD de fontes (tabela, criar/ativar/pausar/excluir) funciona (linhas 943-1057). Palavras-chave editaveis e persistidas (linhas 980-1011). NCMs de busca editaveis e persistidos (linhas 1014-1055). "Gerar do portfolio" = STUB (Onda 4). |
| RF-015 | Estrutura de Classificacao | **OK** | Mesmo que RF-013. Modal criar/editar classe com Nome e NCMs (linhas 1186-1206). Modal criar subclasse com Classe Pai, Nome, NCMs (linhas 1208-1231). Persistencia via CRUD `classes-produtos`. |
| RF-016 | Comerciais (Regiao e Tempo) | **OK** | Aba "Comercial" com: (a) Grid de 27 estados brasileiros com botoes clicaveis (linhas 877-887); (b) "Todo Brasil" (linha 870-874); (c) Prazo maximo aceito (linha 901); (d) Frequencia maxima (linhas 904-912); (e) TAM/SAM/SOM (linhas 921-937). Tudo persistido via parametros-score. |
| RF-017 | Tipos de Edital | **OK** | 6 checkboxes (linhas 686-717): Comodato, Venda, Aluguel, Consumo, Insumos Lab, Insumos Hosp. Persistencia via parametros-score. |
| RF-018 | Norteadores de Score | **OK** | 6 norteadores visuais com icone, titulo, badge de status (linhas 724-797): (a) Classificacao, (b) Aderencia Comercial, (c) Tipos de Edital, (d) Aderencia Tecnica, (e) Recomendacao Participacao, (f) Aderencia de Ganho. Cada um indica se esta configurado ou nao. Score Ganho configuravel com 3 campos (linhas 800-818). |

**ParametrizacoesPage: 6 OK de 6 — MELHOR cobertura de requisitos!**

**Problemas NAO relacionados a requisitos RF-013 a RF-018:**
- Aba Notificacoes: botao Salvar vazio (linha 1087) — nao e RF nenhum, mas e funcionalidade prometida quebrada
- Aba Preferencias: botao Salvar vazio (linha 1141) — idem
- Documentos exigidos: lista MOCK hardcoded (linhas 827-851) — deveria ser RF-002/RF-004 cruzado, nao e um RF de Parametrizacoes per se
- Editar subclasse sem handler (linha 672) — bug menor no RF-013

---

### FLUXO COMERCIAL — CaptacaoPage (RF-019 a RF-025)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-019 | Painel de Oportunidades | **PARCIAL** | Tabela com colunas: Numero, Orgao, UF, Objeto, Valor, Produto Correspondente, Prazo, Score (linhas 511-640). Score como circulo colorido com tooltip de gaps. Linhas coloridas por faixa. **PROBLEMA**: Score comercial e copia do tecnico (BUG, linhas 136-137). Gaps sempre vazios na busca inicial (linha 147). |
| RF-020 | Painel Lateral de Analise | **PARCIAL** | Painel lateral abre ao clicar (linhas 829-1104). Score geral grande + 3 sub-scores (tecnico, comercial, recomendacao em estrelas). Potencial de ganho. Botao X para fechar. **PROBLEMA**: Score comercial = tecnico (fake). Scores de validacao so carregam lazy se edital tem UUID. |
| RF-021 | Filtros e Classificacao | **PARCIAL** | (a) Filtro tipo: 5 opcoes (Reagentes, Equipamentos, Comodato, Aluguel, Oferta Preco) — linhas 727-735. **OK conforme RF.** (b) Filtro origem: 8 opcoes (Municipal a Autarquia) — linhas 740-751. **RF pede 12+, faltam**: Universidades, Labs Publicos, Hospitais Universitarios, Centros Pesquisa, Campanhas Governamentais, Fundacoes. (c) Fontes: 5 opcoes — linhas 700-709. (d) Busca por NCM: OK (linhas 754-760). Palavra-chave: OK. (e) UFs: todas 27 + "Todas" — OK (linhas 61-73). **Falta**: Faixa de valor (min/max), IA le edital inteiro. |
| RF-022 | Datas de Submissao | **OK** | 4 StatCards (2/5/10/20 dias) com contagem e cores por urgencia (linhas 154-162, 658-683). Funciona corretamente mas so apos busca (nao e dashboard permanente). |
| RF-023 | Intencao Estrategica e Margem | **OK** | Radio buttons 4 opcoes (linhas 888-899). Slider de margem 0-50% (linhas 903-911). Botoes "Varia por Produto" e "Varia por Regiao" (linhas 918-963). Persistencia via estrategias-editais CRUD (linhas 338-406). |
| RF-024 | Analise de Gaps | **PARCIAL** | Tooltip no hover do score mostra gaps (linhas 581-624). **PROBLEMA**: gaps sempre `[]` na busca inicial — tooltip mostra "Todos os requisitos atendidos" (dado falso). Gaps reais so aparecem no painel via endpoint scores-validacao. |
| RF-025 | Monitoramento 24/7 | **PARCIAL** | Card "Monitoramento Automatico" mostra monitoramentos do backend com status ativo/inativo, termo, UFs, editais encontrados (linhas 1109-1153). **Falta**: configuracao de periodicidade na UI (so via chat), notificacoes de novos editais. |

**CaptacaoPage: 2 OK + 5 PARCIAL = 2/7 completos**

---

### FLUXO COMERCIAL — ValidacaoPage (RF-026 a RF-037)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-026 | Sinais de Mercado | **OK** | Barra no topo com badges coloridas de sinais (linhas 1021-1034). "Concorrente Dominante", "Licitacao Direcionada", "Preco Predatorio" — dados do backend via campo `sinaisMercado`. |
| RF-027 | Decisao (Participar/Acompanhar/Ignorar) | **OK** | 3 botoes com cores (linhas 1036-1038). Abre formulario de justificativa com dropdown de 8 motivos pre-definidos (linhas 1049-1058) + textarea livre (linha 1063). Persistencia via CRUD `validacao_decisoes` (linhas 446-496). |
| RF-028 | Score Dashboard (6 Dimensoes) | **OK** | ScoreCircle grande (120px) + 6 barras horizontais: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial (linhas 1137-1143). Cores e niveis (High/Medium/Low) via ScoreBar component. Botao "Calcular Scores IA" (linhas 1127-1133). |
| RF-029 | 3 Abas (Objetiva/Analitica/Cognitiva) | **OK** | TabPanel com 3 abas (linhas 949-953, 1182-1191). Cada aba com componentes conforme requisito. Dados reais do backend. |
| RF-030 | Aderencia Trecho-a-Trecho | **OK** | Tabela 3 colunas: Trecho Edital, Aderencia (ScoreBadge), Trecho Portfolio (linhas 846-861). Dados do campo `aderenciaTrechos` populado pelo endpoint scores-validacao. |
| RF-031 | Analise de Lote (Itens Intrusos) | **OK** | Barra horizontal segmentada com blocos aderente (verde) e intruso (amarelo) (linhas 747-765). Legenda com contagem. Dados do campo `analiseLote`. |
| RF-032 | Pipeline de Riscos | **OK** | 2 secoes: (a) Modalidade e Risco com badges (linhas 774-781); (b) Flags Juridicos com badges (linhas 784-789). Fatal Flaws destacado em card vermelho (linhas 796-808). |
| RF-033 | Reputacao do Orgao | **OK** | Card com 3 campos: Pregoeiro, Pagamento, Historico (linhas 812-833). **Dados reais calculados**: busca editais do mesmo orgao, conta decisoes GO/NO-GO (linhas 287-356). |
| RF-034 | Alerta de Recorrencia | **OK** | Card de alerta quando `historicoSemelhante` tem 2+ perdas (linhas 837-842). Descricao textual com quantidade. |
| RF-035 | Aderencias/Riscos por Dimensao | **PARCIAL** | 6 dimensoes de score existem (RF-028). **Falta**: (a) nao classifica como "Impeditivo" vs "Ponto de Atencao"; (b) IA nao sugere como contornar cada risco; (c) tipo de empresa (ME, lucro presumido) nao verificado; (d) dimensoes nao sao clicaveis para detalhes. |
| RF-036 | Processo Amanda | **OK** | 3 pastas coloridas (azul=empresa, amarelo=fiscal, verde=tecnica) com documentos e status (linhas 1194-1289). Dados reais do endpoint `/api/editais/{id}/documentacao-necessaria`. StatusBadges por documento. Nota "Exigido" quando aplicavel. |
| RF-037 | GO/NO-GO | **OK** | Botao "Calcular Scores IA" aciona calculo completo (linha 1127-1133). Recomendacao automatica da IA GO/NO-GO/CONDICIONAL com badge visual (linhas 1101-1121). Decisao flui para o CRM via CRUD. |

**ValidacaoPage: 11 OK + 1 PARCIAL = 11/12 completos — EXCELENTE**

---

### FLUXO COMERCIAL — Paginas NAO IMPLEMENTADAS (RF-038 a RF-046)

| RF | Titulo | Status | Pagina necessaria |
|----|--------|--------|-------------------|
| RF-038 | Impugnacao de Edital | **NAO** | ImpugnacaoPage (nao existe) |
| RF-039 | Precificacao | **NAO** | PrecificacaoPage (nao existe) |
| RF-040 | Proposta / Documentacao | **NAO** | PropostaPage (nao existe) |
| RF-041 | Submissao | **NAO** | SubmissaoPage (nao existe) |
| RF-042 | Disputa de Lances | **NAO** | DisputaLancesPage (nao existe) |
| RF-043 | Followup — Novas Anexacoes | **NAO** | FollowupPage (nao existe) |
| RF-044 | Recurso / Contra Razoes | **NAO** | RecursoPage (nao existe) |
| RF-045 | CRM — So Desse Processo | **NAO** | CRMPage (nao existe) |
| RF-046 | Execucao de Contrato | **NAO** | ContratoPage (nao existe) |

**9 paginas do fluxo comercial NAO EXISTEM.**

---

### INDICADORES (RF-047 a RF-053)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-047 | Flags (Sinalizadores) | **NAO** | Nao existe pagina/aba de flags |
| RF-048 | Monitoria | **PARCIAL** | Existe card na CaptacaoPage (linhas 1109-1153) mas nao e pagina dedicada |
| RF-049 | Concorrencia | **NAO** | Nao existe |
| RF-050 | Mercado (TAM/SAM/SOM) | **PARCIAL** | Campos TAM/SAM/SOM existem na ParametrizacoesPage (linhas 921-937) mas nao ha dashboard de mercado |
| RF-051 | Contratado X Realizado | **NAO** | Nao existe (depende de RF-046) |
| RF-052 | Pedidos em Atraso | **NAO** | Nao existe (depende de RF-046) |
| RF-053 | Perdas | **NAO** | Nao existe |

**Indicadores: 0 OK + 2 PARCIAL + 5 NAO = 0/7 completos**

---

### TRANSVERSAIS (RF-054 a RF-060)

| RF | Titulo | Status | Detalhe |
|----|--------|--------|---------|
| RF-054 | Interface Hibrida (Chat + CRUD) | **PARCIAL** | FloatingChat existe. Paginas visuais CRUD existem. **PROBLEMA**: So PortfolioPage usa onSendToChat. CaptacaoPage, ValidacaoPage, EmpresaPage e ParametrizacoesPage NAO integram com o chat — usam APIs diretas ou nao integram de todo. |
| RF-055 | Aprendizado Continuo | **PARCIAL** | Justificativas de decisao sao salvas (ValidacaoPage). **Falta**: scores nao se ajustam com base no historico, recomendacoes de preco nao melhoram. |
| RF-056 | Governanca e Auditoria | **NAO** | Nao existe log de auditoria, nem middleware, nem dashboard |
| RF-057 | Dispensas de Licitacao | **NAO** | Nao existe filtro nem workflow de dispensas |
| RF-058 | Suporte Juridico IA | **PARCIAL** | IA responde sobre juridico via chat mas nao ha disclaimers automaticos nem base de legislacao RAG |
| RF-059 | Autenticacao e Multi-tenancy | **OK** | Login com email/senha, JWT + refresh tokens, dados isolados por user_id |
| RF-060 | Analytics com MindsDB | **NAO** | Nao existe |

**Transversais: 1 OK + 3 PARCIAL + 3 NAO = 1/7 completos**

---

## PARTE 2 — RESUMO QUANTITATIVO

### Por pagina

| Pagina | RFs Associados | OK | PARCIAL | BUG | MOCK | STUB | NAO | % Completo |
|--------|---------------|-----|---------|-----|------|------|-----|------------|
| EmpresaPage | RF-001 a RF-005 (5) | 2 | 1 | 1 | 0 | 0 | 1 | **40%** |
| PortfolioPage | RF-006 a RF-012 (7) | 2 | 4 | 0 | 1 | 0 | 0 | **29%** |
| ParametrizacoesPage | RF-013 a RF-018 (6) | 6 | 0 | 0 | 0 | 0 | 0 | **100%** |
| CaptacaoPage | RF-019 a RF-025 (7) | 2 | 5 | 0 | 0 | 0 | 0 | **29%** |
| ValidacaoPage | RF-026 a RF-037 (12) | 11 | 1 | 0 | 0 | 0 | 0 | **92%** |
| (Nao existem) | RF-038 a RF-046 (9) | 0 | 0 | 0 | 0 | 0 | 9 | **0%** |
| (Nao existem) | RF-047 a RF-053 (7) | 0 | 2 | 0 | 0 | 0 | 5 | **0%** |
| (Transversais) | RF-054 a RF-060 (7) | 1 | 3 | 0 | 0 | 0 | 3 | **14%** |

### Totais globais

| Status | Quantidade | % dos 60 RFs |
|--------|-----------|-------------|
| **OK** (completo e funcionando) | **24** | **40%** |
| **PARCIAL** (funcionalidade incompleta) | **16** | **27%** |
| **BUG** (implementado mas quebrado) | **1** | **2%** |
| **MOCK** (interface fake) | **1** | **2%** |
| **NAO** (nao implementado) | **18** | **30%** |

### Cobertura real

- **40% dos 60 RFs estao completos (24/60)**
- **69% tem alguma implementacao (41/60)** — OK + PARCIAL + BUG + MOCK
- **30% nao tem NADA implementado (18/60)** — 9 paginas do fluxo comercial + 5 indicadores + 3 transversais + RF-004 (alertas IA)

---

## PARTE 3 — BUGS ENCONTRADOS

### CRITICOS (impedem uso correto)

| # | Pagina | Bug | Linhas |
|---|--------|-----|--------|
| 1 | EmpresaPage | Enum certidoes frontend `obtida/pendente/erro` vs backend `valida/vencida/pendente` — badges NUNCA aparecem para status valida/vencida | L47-53, L324-332 |
| 2 | EmpresaPage | Campo `certidao` no frontend vs `tipo` no backend — coluna certidao sempre vazia | L157 |
| 3 | CaptacaoPage | `score_comercial = score_tecnico` — dado FAKE apresentado como metrica diferente | L136-137 |

### ALTOS (funcionalidade prometida quebrada)

| # | Pagina | Bug | Linhas |
|---|--------|-----|--------|
| 4 | ParametrizacoesPage | Lista "Fontes Documentais Exigidas" e MOCK hardcoded com checkboxes `onChange={() => {}}` | L827-851 |
| 5 | ParametrizacoesPage | Botoes "Salvar" de Notificacoes e Preferencias = `onClick={() => {}}` | L1087, L1141 |

### MEDIOS

| # | Pagina | Bug | Linhas |
|---|--------|-----|--------|
| 6 | PortfolioPage | `SPECS_POR_CLASSE` falta 5 de 9 categorias — fallback para equipamento | L79-106 |
| 7 | PortfolioPage | "Agente Ativo" sempre verde com timestamp `{new Date()} 06:00` fake | L962-965 |
| 8 | PortfolioPage | Aba Classificacao duplica funcionalidade de Parametrizacoes (read-only, confusa) | L833-913 |
| 9 | CaptacaoPage | gaps sempre `[]` na busca — tooltip mostra "Todos os requisitos atendidos" (falso) | L147 |
| 10 | ValidacaoPage | Mapa Logistico hardcoded "SP" para UF da empresa | L720 |
| 11 | EmpresaPage | Botoes "Verificar Documentos" e "Buscar Certidoes" desabilitados com handler vazio | L431-436, L593-598 |
| 12 | EmpresaPage | RF-002 status documento nao baseado em data_vencimento, usa `path_arquivo ? ok : falta` | L151 |
| 13 | ParametrizacoesPage | Botao "Editar" subclasse sem onClick | L672 |

---

## PARTE 4 — O QUE FALTA CONSTRUIR (18 RFs = 30%)

### Prioridade 1 — Fluxo Comercial (9 paginas novas)

Estas 9 paginas representam o **core do fluxo comercial** apos a validacao:

1. **ImpugnacaoPage** (RF-038) — Gerar minutas de impugnacao com IA
2. **PrecificacaoPage** (RF-039) — Recomendacao de precos com historico PNCP
3. **PropostaPage** (RF-040) — Gerar proposta tecnica completa com IA
4. **SubmissaoPage** (RF-041) — Checklist e organizacao para submissao
5. **DisputaLancesPage** (RF-042) — Monitoramento de pregoes e sugestao de lances
6. **FollowupPage** (RF-043) — Acompanhamento pos-pregao
7. **RecursoPage** (RF-044) — Minutas de recurso/contra-razoes
8. **CRMPage** (RF-045) — CRM do processo de licitacao
9. **ContratoPage** (RF-046) — Execucao pos-vitoria

### Prioridade 2 — Indicadores (5 paginas/dashboards novos)

1. **FlagsPage** (RF-047) — Dashboard de sinalizadores criticos
2. **ConcorrenciaPage** (RF-049) — Inteligencia competitiva
3. **MercadoPage** (RF-050) — TAM/SAM/SOM dashboard
4. **PedidosAtrasoPage** (RF-052) — Entregas atrasadas
5. **PerdasPage** (RF-053) — Analise de perdas

### Prioridade 3 — Transversais

1. **RF-004** — Alertas IA sobre documentos (EmpresaPage enhancement)
2. **RF-056** — Governanca e auditoria (middleware + dashboard)
3. **RF-057** — Dispensas de licitacao (filtro + workflow)
4. **RF-060** — Analytics com MindsDB

---

## PARTE 5 — ANALISE DA ABA CLASSIFICACAO DO PORTFOLIO

A aba "Classificacao" no PortfolioPage (linhas 833-913) tem **problemas conceituais graves**:

### Problema 1: Duplicacao com Parametrizacoes
- ParametrizacoesPage ja tem CRUD completo de classes/subclasses (RF-013/RF-015)
- PortfolioPage > Classificacao mostra a **mesma arvore** mas **read-only**
- Usuario nao sabe onde gerenciar: Portfolio ou Parametrizacoes?

### Problema 2: Card do Funil nao e funcional
- O card "Do ruido de milhares de editais..." (linhas 915-967) e **puramente ilustrativo**
- Nao conecta com dados reais de monitoramento
- "Agente Ativo" sempre verde (fake)
- Nao mostra editais reais por categoria

### Problema 3: Confusao de proposito
Conforme RF-011, o funil deveria:
1. Mostrar status real do monitoramento — **NAO FAZ**
2. Mostrar numero de editais por categoria — **NAO FAZ**
3. Classificacao parametrizavel — **DUPLICADA de Parametrizacoes**

### Recomendacao
A aba "Classificacao" no Portfolio deveria ser **removida ou transformada**:
- **Opcao A**: Remover e manter CRUD so em Parametrizacoes
- **Opcao B**: Transformar em dashboard real mostrando editais classificados por categoria do portfolio (conectar com monitoramento real)

---

## PARTE 6 — RANKING FINAL E RECOMENDACOES

### Ranking das paginas existentes

| # | Pagina | % RF OK | Nota |
|---|--------|---------|------|
| 1 | **ParametrizacoesPage** | 100% (6/6) | Todos os RFs da fundacao parametrica implementados. Bugs so em features extras (notif, prefs). |
| 2 | **ValidacaoPage** | 92% (11/12) | Excelente. 3 abas, 6 scores, GO/NO-GO, Processo Amanda. So falta classificar impeditivos vs pontos de atencao. |
| 3 | **EmpresaPage** | 40% (2/5) | CRUD basico funciona mas certidoes totalmente quebradas (BUG), alertas IA inexistentes, responsaveis sem editar. |
| 4 | **PortfolioPage** | 29% (2/7) | Upload e cadastro manual funcionam. Mascara, ANVISA, funil e fontes parciais. Aba classificacao confusa. |
| 5 | **CaptacaoPage** | 29% (2/7) | Busca funciona. Score comercial fake, gaps vazios, filtros incompletos. |

### O que corrigir AGORA (bugs que impedem uso)

1. EmpresaPage: Alinhar enum certidoes + campo tipo
2. CaptacaoPage: Score comercial real (nao copiar tecnico)
3. ParametrizacoesPage: Implementar salvar notificacoes/preferencias

### O que construir PROXIMO (maior impacto)

1. PrecificacaoPage (RF-039) — central para decidir participacao
2. PropostaPage (RF-040) — gera documento para submissao
3. CRMPage (RF-045) — pipeline de oportunidades
4. RF-004: Alertas IA sobre documentos — diferencial do produto

---

*Documento gerado em 23/02/2026 12:40. Baseado na leitura completa dos 5 arquivos TSX + requisitos_completosv2.md (60 RFs + 4 RNFs).*
