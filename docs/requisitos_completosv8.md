# Documento de Requisitos Completos v8 — facilicita.ia

**Versao:** 8.0
**Data:** 13/04/2026
**Base:** requisitos_completosv7.md (v7.0, 2026-04-08)
**Revisao v8:** Adicao da **Secao 13 — Regras de Negocio (RNs)** com 217 regras formalizadas (142 ja implicitas no sistema + 75 faltantes identificadas). As RNs sao numeradas sequencialmente RN-001 a RN-217 e organizadas por sprint. Cada RN cita a fonte (RF/UC/arquivo:linha) ou e marcada como FALTANTE. As regras cobrem validacoes, invariantes, formulas, thresholds, transicoes de estado e restricoes legais (Lei 14.133/2021). Demais secoes (RF-001 a RF-052) inalteradas em relacao ao v7.

**Historico v7 (08/04/2026):** Expansao massiva de RF-045 (CRM) com pipeline de cards e 5 sub-requisitos detalhados (RF-045-01 a RF-045-05). Expansao de RF-046 (Execucao de Contrato) com gestao de empenhos, auditoria, contratos a vencer e 5 sub-requisitos detalhados (RF-046-01 a RF-046-05). Renumeracao de RF-046-EXT-01/02/03 para RF-046-06/07/08 e RF-052-EXT-01 para RF-052-01. Adicao de 10 novos requisitos detalhados extraidos do documento SPRINT 5 VF.

**Fontes Sprint 5:**
- Documento "SPRINT 5 VF" (Descritivo funcional do CRM e Execucao de Contratos)

**Fontes Sprint 3:**
- PDF "SPRINT PRECO e PROPOSTA - REVISADA" (Documento Tecnico Funcional, 14 paginas)
- PDF "SPRINT PRECO e PROPOSTA - ANOTACOES REUNIAO" (4 paginas)
- Blueprint Visual NotebookLM (6 imagens JPEG srpint31.jpeg a srpint36.jpeg)
- Transcricao integral: TRANSCRICAOJPEG.md

---

## 1. Visao Geral da Arquitetura (Pagina 1 do Workflow)

O sistema se organiza em **3 camadas**:

### Fundacao (F1) — Topo
Tres areas de configuracao inicial que alimentam todo o restante:
- **Empresa** — Dados cadastrais + documentos habilitativos
- **Portfolio** — Catalogo de produtos com especificacoes tecnicas
- **Parametrizacoes** — Classificacoes, scores, regioes, tipos de edital + TAM/SAM/SOM

### Fluxo Comercial — Esquerda (sequencial)
Pipeline de 11 etapas:
1. Captacao
2. Validacao
3. Impugnacao
4. Precificacao
5. Proposta / Documentacao
6. Submissao
7. Disputa Lances
8. Followup — Novas Anexacoes
9. Recurso / Contra Razoes
10. CRM — so desse processo
11. Execucao Contrato

### Indicadores — Direita (dashboards transversais)
7 paineis de monitoramento:
1. Flags
2. Monitoria
3. Concorrencia
4. Mercado
5. Contratado X Realizado
6. Pedidos em Atraso
7. Perdas

**Pagina central:** Dashboard/sumario com informacoes resumidas de cada processo.

---

## 2. Requisitos Funcionais — FUNDACAO

---

### RF-001: Cadastro da Empresa

**Pagina Workflow:** 2 (Empresa)
**Titulo Workflow:** "O cadastro da empresa sera importante para gerar fontes de consultas para o portfolio e registrar todas as documentacoes usualmente exigidas para participacao nos editais."

**Descricao:**
O usuario cadastra os dados da empresa que serao reutilizados em todo o sistema. A IA pode consultar esses dados para gerar documentos, preencher propostas e verificar habilitacao.

**Criterios de aceite:**
1. Formulario com dados basicos (CNPJ, razao social, nome fantasia, endereco, telefone, email)
2. Formulario de representante legal (nome, CPF, cargo, contato)
3. Upload de documentos habilitativos (contrato social, procuracoes, certidoes)
4. Dados salvos e consultaveis pela IA via chat
5. Validacao de CNPJ (formato)

---

### RF-002: Gestao de Certidoes

**Pagina Workflow:** 2 (Empresa — secao "Certidoes")
**Texto:** "Tela para gerar o download de todas as certidoes do orgao publico [...] exigidas no edital e que muitas vezes estao sendo atualizadas de forma constante."

**Descricao:**
Sistema de controle de validade de certidoes com alertas automaticos e download automatizado (quando possivel).

**Criterios de aceite:**
1. Tabela de certidoes: nome, orgao emissor, data emissao, data validade, status (valida/a vencer/vencida), arquivo
2. Upload manual de certidao (PDF)
3. Cores visuais: verde (>30 dias), amarelo (15-30 dias), vermelho (<15 dias ou vencida)
4. Botao "Verificar Online" (simula consulta ao orgao)
5. Alertas automaticos de vencimento proximo

---

### RF-003: Responsaveis da Empresa

**Pagina Workflow:** 2 (Empresa — secao de responsaveis)

**Descricao:**
Cadastro de responsaveis tecnicos e administrativos.

**Criterios de aceite:**
1. Lista de responsaveis: nome, cargo, CPF, CRM/CRF (quando aplicavel), contato
2. Modal de adicionar/editar responsavel
3. Dados consultaveis pela IA para preenchimento automatico

---

### RF-004: Documentos da Empresa

**Pagina Workflow:** 2 (Empresa)

**Descricao:**
Repositorio de documentos institucionais reutilizaveis.

**Criterios de aceite:**
1. Upload de documentos (contrato social, CNPJ, alvara, licencas)
2. Metadados: nome, tipo, data upload, validade
3. Visualizacao inline (PDF viewer)
4. Documentos acessiveis pela IA para composicao de propostas

---

### RF-005: Dados Complementares da Empresa

**Pagina Workflow:** 2 (Empresa)

**Descricao:**
Informacoes adicionais que enriquecem o perfil da empresa.

**Criterios de aceite:**
1. Porte da empresa (ME, EPP, medio, grande)
2. Segmento de atuacao
3. UFs de atuacao
4. Historico de participacoes (quantidade de editais)

---

### RF-006: Fontes de Portfolio

**Pagina Workflow:** 3 (Portfolio — "O portfolio pode ser gerado de tres formas")

**Descricao:**
O portfolio de produtos pode ser alimentado de 3 formas: registro ANVISA, upload de lista, e cadastro manual.

**Criterios de aceite:**
1. Opcao 1: Importacao a partir de registro ANVISA — campo para numero do registro, busca
2. Opcao 2: Upload de lista (CSV/Excel) com mapeamento de colunas
3. Opcao 3: Cadastro manual — formulario completo
4. As 3 formas geram o mesmo registro no banco (tabela `produtos`)

---

### RF-007: Consulta e Validacao ANVISA

**Pagina Workflow:** 3 (Portfolio — "Consulta automatica na base ANVISA")

**Descricao:**
Verificacao de registros ANVISA dos produtos.

**Criterios de aceite:**
1. Campo "Registro ANVISA" no cadastro do produto
2. Botao "Consultar ANVISA" — verifica status do registro
3. Status visual: Ativo (verde), Em Analise (amarelo), Cancelado (vermelho)
4. Data da consulta registrada (para auditoria)

---

### RF-008: Cadastro de Produto

**Pagina Workflow:** 3 (Portfolio — detalhamento de campos)

**Descricao:**
Formulario completo de cadastro de produto com todos os campos tecnicos.

**Criterios de aceite:**
1. Campos: nome, descricao, categoria, fabricante, modelo, NCM, preco referencia
2. Campos de registro: numero ANVISA, data validade
3. Especificacoes tecnicas estruturadas (ProdutoEspecificacao)
4. Upload de documentos do produto (manuais, fichas tecnicas, certificados)
5. Busca e filtros no catalogo

---

### RF-009: Mascara de Dados Sensiveis

**Pagina Workflow:** 3 (Portfolio — "mascara os dados, pois sao informacoes estrategicas")

**Descricao:**
Protecao de dados sensiveis do portfolio.

**Criterios de aceite:**
1. Campos de preco mascarados por padrao (exibir apenas para usuarios autorizados)
2. Logs de acesso a dados sensiveis

---

### RF-010: IA no Portfolio

**Pagina Workflow:** 3 (Portfolio — "Usar o LLM para popular")

**Descricao:**
IA auxilia no preenchimento do portfolio.

**Criterios de aceite:**
1. Sugestao automatica de especificacoes tecnicas a partir do nome/descricao
2. Preenchimento assistido de campos baseado em dados da ANVISA
3. Chat pode consultar e modificar produtos

---

### RF-011: Funil de Conversao de Produtos

**Pagina Workflow:** 3 (Portfolio — secao de funil)

**Descricao:**
Pipeline de status do produto (cadastrado → qualificado → ofertado → vencedor).

**Criterios de aceite:**
1. Status de produto: cadastrado, qualificado, ofertado, vencedor
2. Contadores por status
3. Filtro por status
4. Historico de participacoes por produto

---

### RF-012: NCM e Classificacao

**Pagina Workflow:** 3 (Portfolio — "Sera importante que o NCM do produto tambem esteja presente")

**Descricao:**
NCM como atributo central do produto, com classificacao automatica.

**Criterios de aceite:**
1. Campo NCM obrigatorio no cadastro
2. Busca/autocomplete de NCM por descricao
3. Alerta se NCM ausente
4. Classificacao fiscal basica

---

### RF-013: Classificacao de Editais (Classes e Subclasses)

**Pagina Workflow:** 4 (Parametrizacoes — "Classificacao do Cliente")
**Texto:** "A classificacao que a Empresa vai querer definir para rotular esses editais para facilitar sua filtragem [...] e uma sugestao de segmentacao do mercado de cada cliente"

**Descricao:**
Sistema hierarquico de classificacao de editais definido pela empresa.

**Criterios de aceite:**
1. CRUD de Classes (nivel 1) — ex: "Hematologia", "Bioquimica"
2. CRUD de Subclasses (nivel 2) — ex: "Hemograma Completo", "Glicose"
3. Um edital pode ter multiplas classes/subclasses
4. Filtro de editais por classe/subclasse na Captacao

---

### RF-014: Parametrizacao de Custos da Empresa

**Pagina Workflow:** 4 (Parametrizacoes)

**Descricao:**
Configuracao de margens e custos fixos.

**Criterios de aceite:**
1. Margem padrao (%)
2. Custos operacionais fixos
3. Frete padrao por regiao

---

### RF-015: Fontes de Editais

**Pagina Workflow:** 4 (Parametrizacoes — "Eu quero buscar editais de quais fontes?")

**Descricao:**
Configuracao das fontes de busca de editais.

**Criterios de aceite:**
1. Fontes disponiveis: PNCP (principal), Comprasnet (futuro), BEC (futuro), portais estaduais
2. Toggle de ativacao por fonte
3. Parametros por fonte (API key quando necessario)
4. PNCP como fonte obrigatoria padrao

---

### RF-016: Configuracoes Comerciais

**Pagina Workflow:** 4 (Parametrizacoes — campos comerciais)

**Descricao:**
Parametros comerciais que influenciam scores e analises.

**Criterios de aceite:**
1. Markup padrao (%)
2. Margem minima aceitavel
3. Regioes de atuacao (com prioridades)
4. Segmentos prioritarios

---

### RF-017: Tipos de Edital

**Pagina Workflow:** 4 (Parametrizacoes — "Tipos de Edital")

**Descricao:**
Tipificacao de editais para filtragem e classificacao.

**Criterios de aceite:**
1. CRUD de tipos: Pregao Eletronico, Pregao Presencial, Concorrencia, RDC, Dispensa
2. Filtro por tipo na Captacao
3. Cada tipo pode ter regras especificas de prazo

---

### RF-018: Norteadores de Score

**Pagina Workflow:** 4 (Parametrizacoes — "Pesos de Score")
**Texto:** "Score vai analisar o quanto o edital e aderente a nossas parametrizacoes"

**Descricao:**
Configuracao dos pesos de cada dimensao do score de aderencia.

**Criterios de aceite:**
1. 6 dimensoes configuraveis: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
2. Peso de 0 a 100 para cada dimensao
3. Soma dos pesos = 100%
4. Valores padrao pre-configurados
5. Impacto visual nos scores calculados

---

## 3. Requisitos Funcionais — FLUXO COMERCIAL

---

### RF-019: Painel de Captacao (Lista de Editais)

**Pagina Workflow:** 5 (Captacao — tabela principal)

**Descricao:**
Pagina principal de busca e exibicao de editais com tabela sortable, filtros e acoes.

**Criterios de aceite:**
1. Tabela com colunas: numero, orgao, UF, objeto (truncado), data publicacao, data encerramento, valor estimado, score, status, acoes
2. Sortable por qualquer coluna (click no header)
3. Paginacao (20 editais por pagina)
4. Botao "Buscar Editais" que consulta PNCP em tempo real
5. Botao "Salvar Edital" em cada linha
6. Badge de status colorido (novo/analisado/salvo/descartado)

---

### RF-020: Painel Lateral de Detalhes

**Pagina Workflow:** 5 (Captacao — painel lateral direito)

**Descricao:**
Painel slide-in com detalhes completos do edital selecionado.

**Criterios de aceite:**
1. Abre ao clicar em uma linha da tabela
2. Dados completos: numero, orgao, UASG, modalidade, objeto completo, datas, valores
3. Sub-scores visuais (tecnico, comercial, recomendacao) ou 6 scores quando disponivel
4. Botoes de acao: Salvar, Validar, Ver no PNCP
5. Link para o edital original no portal
6. Fechamento por botao X ou click fora

---

### RF-021: Filtros de Captacao

**Pagina Workflow:** 6 (Captacao — filtros)

**Descricao:**
Filtros avancados para refinar busca de editais.

**Criterios de aceite:**
1. Filtro por UF (multi-select)
2. Filtro por modalidade
3. Filtro por valor estimado (faixa)
4. Filtro por data de publicacao (range)
5. Filtro por classe/subclasse (RF-013)
6. Filtro por fonte de edital
7. Botao "Limpar Filtros"

---

### RF-022: Tratamento de Datas e Vigencia

**Pagina Workflow:** 5 (Captacao — logica de datas)

**Descricao:**
Calculo inteligente de prazos e vigencia dos editais.

**Criterios de aceite:**
1. Data de inicio e fim de vigencia
2. Calculo de "dias restantes" automatico
3. Cor de urgencia: verde (>15 dias), amarelo (5-15), vermelho (<5)
4. Filtro de encerrados (excluir editais com data_fim passada)

---

### RF-023: Intencao de Participacao

**Pagina Workflow:** 5 (Captacao — "Intencao de participar")

**Descricao:**
Marcacao rapida de interesse em editais.

**Criterios de aceite:**
1. Botao toggle "Tenho interesse" por edital
2. Filtro de editais com interesse marcado
3. Contadores no dashboard

---

### RF-024: Analise de Gaps na Captacao

**Pagina Workflow:** 5 (Captacao — "Gaps")

**Descricao:**
Identificacao de pontos fracos da empresa em relacao ao edital.

**Criterios de aceite:**
1. Secao "Gaps" no painel lateral com lista de gaps detectados
2. Classificacao: Tecnico, Documental, Juridico
3. Sugestao de acao para cada gap

---

### RF-025: Monitoramento Automatico

**Pagina Workflow:** 5 (Captacao — monitoramento)

**Descricao:**
Busca periodica automatica de novos editais.

**Criterios de aceite:**
1. Configuracao de monitoramento: termo, UFs, frequencia
2. Notificacao de novos editais encontrados
3. Historico de buscas automaticas

---

### RF-026: Sinais de Oportunidade

**Pagina Workflow:** 7 (Validacao — topo da pagina)

**Descricao:**
Indicadores rapidos sobre a oportunidade antes da analise profunda.

**Criterios de aceite:**
1. Cards de sinais: urgencia, complexidade, compatibilidade
2. Cores visuais de classificacao
3. Resumo IA do edital (2-3 frases)

---

### RF-027: Painel de Decisao GO/NO-GO

**Pagina Workflow:** 7 (Validacao — "Decisao GO/NO-GO")

**Descricao:**
Tela de decisao final sobre participar ou nao do edital.

**Criterios de aceite:**
1. Score geral com ScoreCircle (0-100)
2. 6 sub-scores visuais (barras ou radial)
3. Recomendacao IA: GO / NO-GO / AVALIAR
4. Justificativa detalhada da IA
5. Botoes: Aprovar (GO), Rejeitar (NO-GO), Pendente (AVALIAR)
6. Historico de decisoes

---

### RF-028: Scores Multidimensionais (6 Dimensoes)

**Pagina Workflow:** 7 (Validacao — "6 scores com justificativa")

**Descricao:**
Calculo de score de aderencia em 6 dimensoes usando IA.

**Criterios de aceite:**
1. Dimensoes: Tecnico, Documental, Complexidade, Juridico, Logistico, Comercial
2. Score 0-100 para cada dimensao com justificativa
3. Score geral ponderado (conforme RF-018)
4. Calculo via DeepSeek Reasoner para analise profunda
5. Tempo de processamento visivel ao usuario

---

### RF-029: Abas de Analise na Validacao

**Pagina Workflow:** 7-8 (Validacao — abas tematicas)

**Descricao:**
Organizacao da analise em abas tematicas.

**Criterios de aceite:**
1. Aba Resumo (visao geral + decisao)
2. Aba Tecnica (analise tecnica detalhada)
3. Aba Documental (documentos exigidos vs disponiveis)
4. Aba Riscos (pipeline de riscos)
5. Aba Historico (decisoes anteriores similares)

---

### RF-030: Analise Trecho-a-Trecho

**Pagina Workflow:** 8 (Validacao — "trecho do edital com analise")

**Descricao:**
IA analisa trechos especificos do edital com comentarios.

**Criterios de aceite:**
1. Exibicao de trechos relevantes do edital
2. Comentario IA por trecho (risco, oportunidade, alerta)
3. Cores por tipo de comentario
4. Possibilidade de marcar trechos manualmente

---

### RF-031: Analise de Lote na Validacao

**Pagina Workflow:** 7 (Validacao — "Lotes")

**Descricao:**
Analise de editais por lote com vinculacao de produtos.

**Criterios de aceite:**
1. Listagem de lotes do edital (numero, descricao, valor)
2. Produtos do portfolio vinculados a cada lote
3. Score por lote
4. Decisao por lote (GO/NO-GO por lote)

---

### RF-032: Pipeline de Riscos

**Pagina Workflow:** 7 (Validacao — "Riscos Mapeados")

**Descricao:**
Identificacao automatica de riscos no edital.

**Criterios de aceite:**
1. Lista de riscos: tipo, descricao, severidade, mitigacao
2. Severidade: alto/medio/baixo com cor
3. Mitigacao sugerida pela IA
4. Riscos juridicos, tecnicos, financeiros e logisticos

---

### RF-033: Reputacao do Orgao

**Pagina Workflow:** 7 (Validacao — "Orgao contratante")

**Descricao:**
Analise do historico do orgao contratante.

**Criterios de aceite:**
1. Dados do orgao: nome, CNPJ, UF, editais anteriores
2. Historico de pagamento (pontualidade)
3. Editais anteriores similares
4. Volume de compras no segmento

---

### RF-034: Alerta de Recorrencia

**Pagina Workflow:** 7 (Validacao — "Recorrencia")

**Descricao:**
Identificacao de editais recorrentes (orgao compra o mesmo item periodicamente).

**Criterios de aceite:**
1. Deteccao automatica de editais similares anteriores
2. Frequencia de recorrencia (anual, semestral)
3. Historico de vencedores (quem ganhou antes)
4. Alerta visual no painel de validacao

---

### RF-035: Aderencias Especificas

**Pagina Workflow:** 8 (Validacao — detalhamento)

**Descricao:**
Analise granular de aderencia tecnica.

**Criterios de aceite:**
1. Checklist item-a-item dos requisitos tecnicos do edital
2. Status por item: atende / nao atende / parcial
3. Justificativa por item
4. Score de aderencia global

---

### RF-036: Processo Amanda (Importacao de Dados)

**Pagina Workflow:** 9 (Validacao — "Processo Amanda")

**Descricao:**
Importacao de dados de editais de fontes diversas e processamento.

**Criterios de aceite:**
1. Upload de documento (PDF do edital)
2. Extracao automatica de dados (objeto, valor, prazos, lotes)
3. Mapeamento para campos do sistema
4. Revisao humana antes de salvar

---

### RF-037: Tela Final GO/NO-GO

**Pagina Workflow:** 9 (Validacao — tela final)

**Descricao:**
Consolidacao final da decisao com todos os dados.

**Criterios de aceite:**
1. Resumo de todas as analises (scores, riscos, gaps, aderencia)
2. Decisao final com justificativa
3. Botao de confirmacao
4. Registro de decisao com timestamp e usuario

---

### RF-038: Impugnacao

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Geracao de minutas de impugnacao para clausulas restritivas de editais.

**Criterios de aceite:**
1. Tabela de editais com prazo de impugnacao, dias restantes, status
2. Opcao de criar impugnacao ou recurso (radio button)
3. Formulario: motivo, fundamentacao legal
4. Botao "Gerar Texto com IA" — IA gera minuta de impugnacao
5. Textarea para edicao da minuta gerada
6. Status: rascunho, protocolado, deferido, indeferido

---

---

## ============================================================
## SPRINT 3 — PRECIFICACAO E PROPOSTA (RF-039 a RF-041 expandidos)
## ============================================================

**NOTA:** Os requisitos RF-039, RF-040 e RF-041 da v2 eram basicos (15 linhas cada). Nesta v5, eles sao substituidos por **23 requisitos detalhados** extraidos das fontes da Sprint 3 (20 originais + 3 novos na v5).

**Fontes Sprint 3:**
- PDF "SPRINT PRECO e PROPOSTA - REVISADA" (14 paginas) → referenciado como [PDF-REVISADA]
- PDF "SPRINT PRECO e PROPOSTA - ANOTACOES REUNIAO" (4 paginas) → referenciado como [PDF-REUNIAO]
- Blueprint Visual JPEG srpint31.jpeg a srpint36.jpeg → referenciado como [JPEG-X] (ex: [JPEG-3] = srpint33.jpeg)

**Legenda de Status de Implementacao:**
- ❌ NAO IMPLEMENTADO — Funcionalidade nova, ainda nao existe no sistema
- ⚙️ PARCIAL — Base existe mas Sprint 3 expande significativamente
- ✅ IMPLEMENTADO — Funcionalidade implementada e funcional
- 🔮 PLANEJADO — Decisao de arquitetura tomada, implementacao futura

---

### ======================================
### BLOCO A — PRECIFICACAO (RF-039-xx)
### ======================================

---

### RF-039-01: Organizacao por Lotes | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Selecao Inteligente + [JPEG-2] Secao 2.1 (Organizacao por Lotes e Gestao de Portfolio) |
| **Status** | ✅ IMPLEMENTADO — Aba Lotes com especialidade, itens PNCP, organizacao IA |

**Descricao:**
O sistema deve cadastrar lotes por edital, organizados por especialidade (Hematologia, Bioquimica etc.), associar parametros tecnicos a cada lote, e associar multiplos itens do portfolio a um lote.

**Nota:** A tabela `editais_itens` ja existe (importa itens do PNCP), mas nao tem conceito de "lotes por especialidade" com associacao ao portfolio.

**Criterios de aceite:**
1. CRUD de lotes por edital com especialidade
2. Associacao de parametros tecnicos por lote
3. Associacao de multiplos itens do portfolio a um lote
4. Visualizacao organizada por lote na tela de precificacao

---

### RF-039-02: Calculo Tecnico de Volumetria | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Calculo Tecnico + [JPEG-2] Secao 2.3 (Motor de Calculo de Kits — Engine) |
| **Status** | ✅ IMPLEMENTADO — Conversao de quantidade com deteccao automatica (kit/reagente vs unitario) |

**Descricao:**
Motor de calculo que determina a quantidade real de kits necessarios para atender ao edital, especifico para a industria de diagnostico laboratorial.

**Inputs obrigatorios (por item):**
- Rendimento do kit no equipamento
- No de repeticoes de amostras
- No de repeticoes de calibradores
- No de repeticoes de controles
- Volume de testes exigido no edital por parametro

**Regra de negocio:**
```
Volume Real Ajustado = Volume edital + repeticoes amostras + repeticoes calibradores + repeticoes controles
Quantidade de Kits = Volume Real Ajustado / Rendimento por kit
Arredondamento: SEMPRE para cima (ceil)
```

**Diagrama JPEG-2 (Secao 2.3):** Motor tipo funil com 5 inputs a esquerda, Engine com engrenagens ao centro, e output "Quantidade Final de Kits" a direita em caixa dourada. Destaque: "Sempre arredondado para cima."

**Criterio de aceite:** Calculo tecnico de kits opera com arredondamento preciso (ceil).

---

### RF-039-03: Integracao com ERP — Base de Custos | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Base de Custos + [PDF-REUNIAO] ref. Argus/Supra + [JPEG-3] Secao 3.1 (Pipeline de duas fontes convergentes) |
| **Status** | 🔮 PLANEJADO — Hoje manual, ERP futuro |

**Descricao:**
O sistema deve importar custo unitario do kit do ERP (preco de compra do fornecedor ou custo de producao). Campo editavel para validacao humana.

**Nota:** Hoje o campo `preco_referencia` existe no modelo Produto, mas e preenchido manualmente. A integracao ERP e nova.

**Diagrama JPEG-3 (Secao 3.1):** Dois streams convergentes — Stream 1: Importacao ERP (icone servidor) + Stream 2: Regras Tributarias NCM (icone selo fiscal/TAX) — convergem para bloco verde escuro "Permite validacao e edicao humana sobre as aliquotas aplicadas."

**Criterio de aceite:** Integracao de custo base com ERP esta funcional.

---

### RF-039-04: Regras Tributarias NCM | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Inteligencia Tributaria + [PDF-REUNIAO] NCM 3822 + [JPEG-3] Secao 3.1 (Stream 2 — Regras Tributarias) |
| **Status** | ⚙️ PARCIAL — ICMS isencao NCM 3822 automatica, tributos editaveis. Falta: cadastro de NCMs com beneficios |

**Descricao:**
O sistema deve parametrizar tributacao por NCM, identificar automaticamente isencao de ICMS para NCM 3822 (reagentes), manter cadastro de NCMs com beneficios fiscais, alertar sobre isencoes nos produtos do lote, e permitir validacao humana das aliquotas.

**Diagrama JPEG-3 (Secao 3.1):** Stream 2 mostra icone TAX com texto "Parametrizacao por NCM" e gatilho automatico "Identificacao de isencao de ICMS para a NCM 3822 (reagentes)."

**Criterios de aceite:**
1. Cadastro de NCMs com beneficios fiscais
2. Gatilho automatico para NCM 3822 (isencao ICMS)
3. Parametrizacao tributaria por item
4. Campo editavel para validacao humana das aliquotas
5. Alerta visual sobre isencoes aplicaveis

---

### RF-039-05: Selecao Inteligente — Agente Assistido | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO / PORTFOLIO |
| **Fonte** | [PDF-REVISADA] Secao Selecao Inteligente + [JPEG-2] Secao 2.2 (O Agente Inteligente: Match Assistido) |
| **Status** | ✅ IMPLEMENTADO — IA auto-link >20%, manual, Buscar Web, ANVISA |

**Descricao:**
O sistema deve sugerir itens do portfolio aderentes ao lote do edital, destacar campos tecnicos obrigatorios na proposta, e exigir validacao humana antes de confirmar selecao.

**Nota:** tool_calcular_score_aderencia (Sprint 2) calcula score geral edital x portfolio. O agente assistido e diferente: faz match item-a-item por lote, nao score geral.

**Diagrama JPEG-2 (Secao 2.2):** Lado esquerdo "Lote do Edital" (documento com lista), centro pecas de puzzle se encaixando (azul = edital, verde = portfolio), lado direito "Itens Sugeridos". Alerta amarelo: "VALIDACAO HUMANA OBRIGATORIA: Todos os itens pre-selecionados pelo agente exigem confirmacao do usuario."

**Criterios de aceite:**
1. Agente IA faz match lote x portfolio item-a-item
2. Destaque visual de parametros tecnicos obrigatorios
3. Validacao humana obrigatoria antes de confirmar
4. Score de aderencia por item sugerido

---

### RF-039-06: Volumetria por Parametro | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO / PORTFOLIO |
| **Fonte** | [PDF-REVISADA] Secao Portfolio + [PDF-REUNIAO] ref. Wiener + [JPEG-2] Secao 2.1 (Fabricante Links — Sincronizacao Periodica) |
| **Status** | ✅ IMPLEMENTADO — Por item com rendimento do produto |

**Descricao:**
Para itens importados de links de fabricante (ex: Wiener): registrar data da ultima atualizacao, rotina periodica (frequencia parametrizavel) para verificar mudancas, atualizar upload automaticamente se houver alteracao, registrar LOG de cada atualizacao.

**Diagrama JPEG-2 (Secao 2.1):** Centro mostra "Fabricante Links" (icone corrente) com automacao: "Sincronizacao periodica via links do fabricante (ex: Wiener)". Seta entre Fabricante Links e Base de Dados: "Identifica alteracoes → Atualiza automaticamente o upload → Registra LOG."

**Criterios de aceite:**
1. Campo de URL do fabricante por produto
2. Rotina periodica de verificacao
3. Atualizacao automatica com LOG
4. Frequencia configuravel

---

### RF-039-07: Gestao de Comodato | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Comodato + [PDF-REUNIAO] ref. comodato + [JPEG-4] Secao 4.1 (painel direito — Gestao de Comodato) |
| **Status** | ⚙️ PARCIAL — CRUD + amortizacao. Falta: IA e impacto no preco |

**Descricao:**
- Fase 1 (Sprint 3): Processo manual assistido — sistema organiza informacoes mas calculo e manual.
- Fase futura (roadmap): Agente de IA para calculo automatizado de comodato.

**Diagrama JPEG-4 (Secao 4.1):** Painel direito com evolucao em duas fases — Sprint Atual (pessoa com documento) = manual assistido → Fase Futura (robo IA com engrenagens) = automacao completa. Seta de progressao entre as fases.

**Criterios de aceite:**
1. Secao de comodato na precificacao
2. Campos para dados do equipamento (valor, amortizacao, prazo)
3. Calculo manual assistido pelo sistema
4. Estrutura preparada para agente IA futuro

---

### RF-039-08: Input de Preco Base — Camada B (3 modos) | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Camada B + [JPEG-3] Secao 3.2 (Piramide — Camada B) |
| **Status** | ✅ IMPLEMENTADO — Manual, Custo+Markup, Upload CSV |

**Descricao:**
Tres opcoes de input do preco base:
1. Preenchimento manual
2. Upload de tabela de precos
3. Upload de custo + markup

Flag para reutilizacao em outros editais.

**Diagrama JPEG-3 (Secao 3.2):** Camada B (meio da piramide) com icone de tabela de precos: "Preenchimento manual, upload de tabela, ou Custo + Markup." Flag de reutilizacao indicada.

**Criterios de aceite:**
1. 3 modos de input do preco base
2. Flag de reutilizacao
3. Upload de tabela com parsing automatico
4. Calculo custo + markup automatico

---

### RF-039-09: Valor de Referencia do Edital — Camada C | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Camada C + [JPEG-3] Secao 3.2 (Piramide — Camada C, topo) |
| **Status** | ✅ IMPLEMENTADO — Auto-importacao + % sobre base |

**Descricao:**
- Se o edital traz valor de referencia: importacao automatica.
- Se nao traz: percentual configuravel sobre tabela de preco BASE.
- Funciona como target estrategico da disputa.

**Diagrama JPEG-3 (Secao 3.2):** Camada C (topo da piramide) com icone de alvo/target: "Target Estrategico — importacao automatica do edital, se disponivel; caso inexistente, percentual sobre tabela de preco BASE."

**Criterios de aceite:**
1. Importacao automatica do valor de referencia do edital
2. Calculo percentual sobre preco BASE quando ausente
3. Campo de percentual configuravel
4. Indicacao visual de que e o target estrategico

---

### RF-039-10: Estrutura do Lance — Camadas D e E | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Lances + [JPEG-3] Secao 3.3 (Piramide D e E + Estrategia Competitiva) |
| **Status** | ✅ IMPLEMENTADO — Absoluto e percentual, barra visual |

**Descricao:**
- **Valor Inicial (D):** Obrigatorio. Valor absoluto ou percentual de desconto sobre preco BASE. Primeiro lance da disputa.
- **Valor Minimo (E):** Obrigatorio. Valor absoluto ou percentual maximo de desconto. Piso — abaixo disso e prejuizo.
- **Sistema bloqueia lances abaixo do minimo.**

**Diagrama JPEG-3 (Secao 3.3):** Piramide D e E — D (inferior): "Ponto de partida absoluto ou % de desconto sobre a Base (Obrigatorio)." E (superior): "O limite de sangria. Valor minimo absoluto ou desconto maximo aceitavel (Obrigatorio)."

**Criterio de aceite:** Parametrizacao dos lances (Base ao Minimo) esta ativa. Sistema bloqueia lances abaixo do minimo.

---

### RF-039-11: Estrategia Competitiva | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Estrategia + [PDF-REUNIAO] Explicacao de lances + [JPEG-3] Secao 3.3 (Estrategia Competitiva, lado direito) |
| **Status** | ⚙️ PARCIAL — Perfis "quero ganhar"/"nao ganhei", simulacao basica |

**Descricao:**
O usuario configura a estrategia competitiva:
- **"Quero ganhar"** — disputar agressivamente ate o valor minimo (Camada E).
- **"Nao ganhei no minimo"** — reposicionar lance para melhor colocacao apos 1o lugar (nao dar lance irracional).

O sistema deve bloquear lance abaixo do minimo e permitir simulacao de cenarios.

**Diagrama JPEG-3 (Secao 3.3):** Lado direito "Estrategia Competitiva" (escudo com engrenagem). Opcao 1: checkmark verde "Quero ganhar" — lances decrescentes ate Camada E. Opcao 2: moeda/posicionamento "Nao ganhei no minimo" — reposicionar para melhor colocacao.

**Criterios de aceite:**
1. Seletor de estrategia por edital
2. Bloqueio de lance abaixo do minimo
3. Simulacao de cenarios pre-disputa
4. Logica de reposicionamento quando nao ganha

---

### RF-039-12: Historico de Precos Visual — Camada F | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Camada F + [JPEG-4] Secao 4.1 (Inteligencia Historica — painel esquerdo) |
| **Status** | ✅ IMPLEMENTADO — Pipeline IA: historico local → atas PNCP → contratos → sugestoes A-E |

**Descricao:**
Ja existe: tool_historico_precos, tool_buscar_precos_pncp, tabela precos_historicos.

Novo a adicionar:
- Dashboard visual com grafico de evolucao temporal (SVG)
- Filtros por item, por orgao, data, margem aplicada
- Integracao visual na PrecificacaoPage

**Diagrama JPEG-4 (Secao 4.1):** Painel com grafico de linha (evolucao temporal), barra de 6 filtros: Todos, Ativos, Preco Gerador, Margem Aplicada, Orgao Publico, Margem. Linha principal (preco) oscilante com area sombreada (margem).

**Criterios de aceite:**
1. Grafico SVG de evolucao de precos
2. 6 filtros interativos
3. Dados de margem aplicada na data
4. Integracao na pagina de precificacao

---

### RF-039-13: Flag Reutilizar Preco | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | [PDF-REVISADA] Secao Camada B + [JPEG-3] Secao 3.2 (Flag de reutilizacao) |
| **Status** | ✅ IMPLEMENTADO — Checkbox na UI |

**Descricao:**
Flag que permite reutilizar precos ja definidos em editais anteriores para agilizar a precificacao de novos editais com itens similares.

**Criterios de aceite:**
1. Checkbox de reutilizacao por item na tela de precificacao
2. Busca de precos anteriores do mesmo item/produto
3. Preenchimento automatico quando flag ativada

---

### RF-039-14: Pipeline IA de Precificacao | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | Implementacao Sprint 3 — busca inteligente de referencias de preco |
| **Status** | ✅ IMPLEMENTADO |

**Descricao:**
Pipeline automatizado de inteligencia artificial para pesquisa de precos de referencia. O sistema busca automaticamente atas de registro de preco no PNCP, extrai vencedores e valores praticados, e gera sugestoes de preco com justificativa textual produzida por IA (DeepSeek).

**Criterios de aceite:**
1. Busca automatica de atas de registro de preco no PNCP por item
2. Extracao de vencedores, valores e datas dos contratos encontrados
3. Sugestoes de preco com faixas (A-E) baseadas nos dados historicos
4. Justificativa IA textual explicando a logica da sugestao
5. Integracao na tela de precificacao com acionamento por item

---

### RF-039-15: Relatorio de Custos e Precos | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | Implementacao Sprint 3 — documentacao de analise de precos |
| **Status** | ✅ IMPLEMENTADO |

**Descricao:**
Geracao de relatorio consolidado de custos e precos em formato Markdown, com visualizador integrado na interface. O relatorio inclui resumo dos itens precificados, fontes de referencia utilizadas, tributos aplicados e estrategia de lances. Suporta download em MD e PDF.

**Criterios de aceite:**
1. Geracao automatica de relatorio MD com dados da precificacao
2. Visualizador integrado na UI (renderizacao Markdown)
3. Download em formato MD
4. Download em formato PDF
5. Inclusao de resumo de itens, tributos e estrategia de lances

---

### RF-039-16: Persistencia da Analise IA | PRECIFICACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | PRECIFICACAO |
| **Fonte** | Implementacao Sprint 3 — cache e persistencia de insights IA |
| **Status** | ✅ IMPLEMENTADO |

**Descricao:**
Os insights e sugestoes gerados pela pipeline IA de precificacao (RF-039-14) sao salvos no banco de dados, permitindo carregamento instantaneo nas visitas subsequentes sem necessidade de reprocessamento. O usuario pode regenerar a analise sob demanda quando desejar dados atualizados.

**Criterios de aceite:**
1. Insights IA salvos no banco de dados vinculados ao item/edital
2. Carregamento instantaneo dos insights salvos ao abrir a tela
3. Botao de regeneracao sob demanda para atualizar a analise
4. Timestamp da ultima analise visivel ao usuario

---

### ======================================
### BLOCO B — PROPOSTA (RF-040-xx)
### ======================================

---

### RF-040-01: Motor de Geracao da Proposta | PROPOSTA

| Campo | Valor |
|-------|-------|
| **Modulo** | PROPOSTA |
| **Fonte** | [PDF-REVISADA] Secao Motor de Geracao + [JPEG-4] Secao 4.2 (Pipeline de geracao automatica de propostas) |
| **Status** | ⚙️ PARCIAL — tool_gerar_proposta ja existe mas e basico (Sprint 2) |

**Descricao:**
Ja existe: tool_gerar_proposta (gera texto via IA), CRUD de propostas, status 4 estados (rascunho/revisao/aprovada/enviada).

Novo a adicionar:
- Cruzar dados de precificacao (camadas A-F) com exigencias do edital
- Ajuste automatico de layout conforme modelo do orgao
- Templates pre-parametrizados + upload externo
- **100% editavel** antes da exportacao
- LOG de todas as alteracoes

**Diagrama JPEG-4 (Secao 4.2):** Pipeline 3 estagios — Estagio 1: dados de precificacao + exigencias edital → Estagio 2: engrenagens (motor) → Estagio 3: documento com selo verde "100% Editavel". Regra de Ouro (alerta amarelo): "A proposta gerada e 100% editavel antes da submissao. Nada e engessado." Templates: "Ajuste automatico de layout conforme exigencia do orgao."

**Criterios de aceite:**
1. Motor gera proposta automaticamente cruzando precificacao x edital
2. Layout ajustado conforme orgao (templates)
3. Upload de template externo
4. Documento 100% editavel antes da exportacao
5. LOG de todas as alteracoes na proposta

---

### RF-040-02: Alternativas de Entrada | PROPOSTA

| Campo | Valor |
|-------|-------|
| **Modulo** | PROPOSTA |
| **Fonte** | [PDF-REVISADA] Secao Alternativas de Entrada |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Tres formas de criar uma proposta:
1. Geracao automatica (RF-040-01 — motor de geracao)
2. Upload de proposta externa (proposta ja elaborada fora do sistema)
3. (Avaliar) Upload de template padrao da empresa

**Criterios de aceite:**
1. Opcao de geracao automatica
2. Upload de proposta pronta (DOCX/PDF)
3. Template da empresa importavel
4. Independente do modo, proposta segue fluxo de status

---

### RF-040-03: Descricao Tecnica A/B | PROPOSTA

| Campo | Valor |
|-------|-------|
| **Modulo** | PROPOSTA |
| **Fonte** | [PDF-REVISADA] Secao Descricao Tecnica A/B + [JPEG-4] Secao 4.3 (Decisao A/B com ramificacao e mitigacao de risco) |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Para cada item da proposta, duas opcoes de texto tecnico:

**Opcao 1 (A) — Texto do edital:** Copia literal da descricao tecnica exigida. Aderencia total, opcao mais segura.

**Opcao 2 (B) — Texto personalizado:** Descritivo proprio do cliente. Estrategico para produtos parcialmente aderentes.

Se texto proprio (Opcao B):
- LOG detalhado (usuario, data, hora)
- Destaque visual de que houve alteracao
- Versao original do edital salva como backup

**Diagrama JPEG-4 (Secao 4.3):** Fork A/B no centro. Opcao 1 (esquerda, documento com checkmark): texto do edital. Opcao 2 (direita, escudo com alerta vermelho): texto personalizado. Parte inferior: bloco de seguranca (cadeado): "Toda insercao de texto proprio gera LOG detalhado e versao original salva como backup."

**Criterios de aceite:**
1. Seletor A/B por item da proposta
2. Copia literal do edital (Opcao A)
3. Campo de texto livre (Opcao B) com destaque visual
4. LOG de alteracao (usuario, data, hora)
5. Backup da versao original

---

### ======================================
### BLOCO C — AUDITORIA (RF-040-xx continuacao)
### ======================================

---

### RF-040-04: Auditoria ANVISA | PROPOSTA (Auditoria)

| Campo | Valor |
|-------|-------|
| **Modulo** | PROPOSTA / AUDITORIA |
| **Fonte** | [PDF-REVISADA] Secao Auditoria ANVISA + [JPEG-5] Secao 5.1 (Compliance ANVISA — Painel de Status Regulatorio) |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Semaforo de 3 cores para registro de cada produto:
- **Verde — Valido** (pronto para uso)
- **Amarelo — Em Processo** (atencao requerida)
- **Vermelho — Vencido** (bloqueio — sistema impede inclusao na proposta)

Consulta: base interna importada (fase 1) → site ANVISA (fase futura).

LOG imutavel: data, fonte, resultado.

Campo opcional no cadastro: link oficial ANVISA.

**Modulo de alta confiabilidade — impacta diretamente a confianca do cliente.**

**Diagrama JPEG-5 (Secao 5.1):** Painel dark-mode com 3 linhas: bolinha verde "Valido (Pronto para uso)", bolinha amarela "Em Processo (Atencao requerida)", bolinha vermelha "Vencido (Alerta de bloqueio)". Lado direito: "Consulta a base importada (com roadmap para API externa)" + "Registro imutavel garantindo status na data da consulta."

**Criterios de aceite:**
1. Semaforo 3 cores por produto na proposta
2. Bloqueio de inclusao de produto com registro vencido
3. LOG imutavel de cada consulta ANVISA
4. Base interna de registros (fase 1)
5. Campo de link ANVISA no cadastro

---

### RF-040-05: Auditoria Documental + Fracionamento | PROPOSTA (Auditoria)

| Campo | Valor |
|-------|-------|
| **Modulo** | PROPOSTA / AUDITORIA |
| **Fonte** | [PDF-REVISADA] Secao Auditoria Documental + [JPEG-5] Secao 5.2 (Pipeline de compilacao documental com fracionamento) |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
1. Identificar no edital toda documentacao exigida (Instrucoes de Uso, Registro ANVISA, Manual Tecnico, FISPQ)
2. Validar que todos os documentos foram carregados
3. Verificar limites de tamanho do portal do orgao
4. **Smart Split** — fracionar automaticamente PDFs que excedam o limite
5. Gerar checklist para validacao humana rapida
6. Exportar pacote completo para submissao

**Diagrama JPEG-5 (Secao 5.2):** Pipeline 3 estagios — Estagio 1: 4 documentos em leque (Registro ANVISA, Instrucoes de Uso, Manual Tecnico, FISPQ) + "Checklist Automatico". Estagio 2: "Dossie Consolidado" (pasta grossa). Estagio 3: PDFs fracionados com etiquetas "SIZE". Smart Split: "O sistema verifica os limites de upload do portal e fraciona automaticamente PDFs muito pesados."

**Criterios de aceite:**
1. Deteccao automatica de documentos exigidos
2. Validacao de completude (todos carregados?)
3. Verificacao de limites de tamanho
4. Smart Split automatico
5. Checklist de validacao humana
6. Pacote completo exportavel

---

### ======================================
### BLOCO D — SUBMISSAO / EXPORTACAO (RF-041-xx)
### ======================================

---

### RF-041-01: Exportacao Completa | SUBMISSAO

| Campo | Valor |
|-------|-------|
| **Modulo** | SUBMISSAO / EXPORTACAO |
| **Fonte** | [PDF-REVISADA] Secao Exportacao + [JPEG-6] Secao 6.2 (Dossie aberto com formatos de exportacao) |
| **Status** | ⚙️ PARCIAL — GET /api/propostas/{id}/export ja existe (Sprint 2-3) |

**Descricao:**
Ja existe: endpoint GET /api/propostas/{id}/export (PDF/DOCX).

Novo a adicionar:
- **Dossie completo** — arquivo unico ou pacote organizado com proposta + laudos + registros + anexos
- **Fracionamento** — documentos ja divididos para caber nos limites de upload do portal
- **Dois formatos:** PDF (engessado para seguranca) + Word (editavel para ajustes finos)

**Diagrama JPEG-6 (Secao 6.2):** Pasta/dossie amarela aberta com dois documentos saindo: PDF (vermelho) "Proposta engessada para seguranca" + Word (azul) "Proposta 100% livre para ajustes finos". Dossie Completo: "Arquivo unico ou pacote organizado contendo proposta assinada, laudos, registros e todos os anexos documentais exigidos, ja fracionados para upload."

**Criterios de aceite:**
1. Exportacao dossie completo (proposta + todos os anexos)
2. Fracionamento para limites de upload
3. Formato PDF (seguro)
4. Formato Word (editavel)
5. Pacote organizado para submissao

---

### RF-041-02: Rastreabilidade Completa | SUBMISSAO (Transversal)

| Campo | Valor |
|-------|-------|
| **Modulo** | TRANSVERSAL |
| **Fonte** | [PDF-REVISADA] Secao Rastreabilidade + [JPEG-5] Secao 5.3 + [JPEG-6] Secao 6.1 (Escudo de Rastreabilidade — Global LOGs) |
| **Status** | ⚙️ PARCIAL — tabela auditoria_log existe (Sprint 1) mas e basica |

**Descricao:**
Ja existe: tabela auditoria_log com CRUD basico.

Novo — expandir para registrar:
- Alteracoes de preco e markup
- Alteracoes de descricao tecnica (com versao original)
- Atualizacoes de portfolio
- Validacoes ANVISA (data + status)
- Uploads e substituicoes de documentos

Cada registro: usuario, data, hora, acao, valor anterior, valor novo. **Imutavel.**

**Diagrama JPEG-5/6 (Secoes 5.3 e 6.1):** Escudo preto com cadeado central, aneis concentricos azuis (camadas de rastreabilidade), icones orbitantes de documento e cifrao. Lista de eventos rastreados: precos, descricoes tecnicas, sincronizacoes, ANVISA, uploads.

**Criterios de aceite:**
1. LOG imutavel de alteracoes de preco e markup
2. LOG de alteracoes de descricao tecnica com versao original
3. LOG de atualizacoes de portfolio
4. LOG de validacoes ANVISA
5. LOG de uploads e substituicoes de documentos
6. Campos: usuario, data, hora, acao, valor anterior, valor novo

---

## ============================================================
## FIM DA SPRINT 3 — Resumo dos 23 Requisitos
## ============================================================

### Tabela Resumo Sprint 3

| ID | Requisito | Bloco | Status | Fonte Principal |
|----|-----------|-------|--------|-----------------|
| RF-039-01 | Organizacao por Lotes | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-2 + PDF-REVISADA |
| RF-039-02 | Calculo Volumetria | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-2 + PDF-REVISADA |
| RF-039-03 | Integracao ERP | PRECIFICACAO | 🔮 PLANEJADO | JPEG-3 + PDF-REVISADA + PDF-REUNIAO |
| RF-039-04 | Regras Tributarias NCM | PRECIFICACAO | ⚙️ PARCIAL | JPEG-3 + PDF-REVISADA + PDF-REUNIAO |
| RF-039-05 | Selecao Inteligente Portfolio | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-2 + PDF-REVISADA |
| RF-039-06 | Volumetria por Parametro | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-2 + PDF-REVISADA + PDF-REUNIAO |
| RF-039-07 | Gestao Comodato | PRECIFICACAO | ⚙️ PARCIAL | JPEG-4 + PDF-REVISADA + PDF-REUNIAO |
| RF-039-08 | Preco Base (3 modos) | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-3 + PDF-REVISADA |
| RF-039-09 | Valor Referencia (Camada C) | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-3 + PDF-REVISADA |
| RF-039-10 | Lances D e E | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-3 + PDF-REVISADA |
| RF-039-11 | Estrategia Competitiva | PRECIFICACAO | ⚙️ PARCIAL | JPEG-3 + PDF-REVISADA + PDF-REUNIAO |
| RF-039-12 | Historico Visual (Camada F) | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-4 + PDF-REVISADA |
| RF-039-13 | Flag Reutilizar Preco | PRECIFICACAO | ✅ IMPLEMENTADO | JPEG-3 + PDF-REVISADA |
| RF-039-14 | Pipeline IA de Precificacao | PRECIFICACAO | ✅ IMPLEMENTADO | Implementacao Sprint 3 |
| RF-039-15 | Relatorio de Custos e Precos | PRECIFICACAO | ✅ IMPLEMENTADO | Implementacao Sprint 3 |
| RF-039-16 | Persistencia da Analise IA | PRECIFICACAO | ✅ IMPLEMENTADO | Implementacao Sprint 3 |
| RF-040-01 | Motor Proposta | PROPOSTA | ✅ IMPLEMENTADO | JPEG-4 + PDF-REVISADA |
| RF-040-02 | Alternativas Entrada | PROPOSTA | ✅ IMPLEMENTADO | PDF-REVISADA |
| RF-040-03 | Descricao Tecnica A/B | PROPOSTA | ✅ IMPLEMENTADO | JPEG-4 + PDF-REVISADA |
| RF-040-04 | Auditoria ANVISA | PROPOSTA | ✅ IMPLEMENTADO | JPEG-5 + PDF-REVISADA |
| RF-040-05 | Auditoria Documental | PROPOSTA | ✅ IMPLEMENTADO | JPEG-5 + PDF-REVISADA |
| RF-041-01 | Exportacao Completa | SUBMISSAO | ✅ IMPLEMENTADO | JPEG-6 + PDF-REVISADA |
| RF-041-02 | Rastreabilidade Completa | TRANSVERSAL | ⚙️ PARCIAL | JPEG-5/6 + PDF-REVISADA |

**Totais Sprint 3:** 10 IMPLEMENTADOS + 1 PLANEJADO + 5 PARCIAIS + 4 NAO IMPLEMENTADOS + 3 NOVOS (RF-039-14 a RF-039-16)
**Blocos:** 16 PRECIFICACAO + 5 PROPOSTA + 2 SUBMISSAO/TRANSVERSAL

### Criterios de Aceite da Sprint 3 (Definition of Done)

Extraidos de [JPEG-6] Secao 6.3 — Lista de 7 criterios com checkmarks verdes:

| # | Criterio | Requisito Relacionado |
|---|----------|----------------------|
| 1 | Calculo tecnico de kits opera com arredondamento preciso | RF-039-02 |
| 2 | Integracao de custo base com ERP esta funcional | RF-039-03 |
| 3 | Parametrizacao dos lances (Base ao Minimo) esta ativa | RF-039-10 |
| 4 | Motor gera proposta automaticamente com o edital | RF-040-01 |
| 5 | Documento gerado e 100% editavel e exportavel | RF-040-01, RF-041-01 |
| 6 | Auditoria de registros ANVISA apresenta status correto | RF-040-04 |
| 7 | Escudo de LOG rastreia todas as alteracoes criticas | RF-041-02 |

---

---

## ============================================================
## SPRINT 4 — RECURSOS E IMPUGNACOES (RF-042 a RF-044 expandidos)
## ============================================================

**NOTA:** Os requisitos RF-042, RF-043 e RF-044 da v5 eram placeholders basicos (5-7 criterios cada). Nesta v6, eles sao substituidos por **24 requisitos detalhados** organizados em 3 blocos: Disputas (Lances), Impugnacao e Esclarecimentos, e Recursos e Contra-Razoes.

**Legenda de Status de Implementacao:**
- ❌ NAO IMPLEMENTADO — Funcionalidade nova, ainda nao existe no sistema
- ⚙️ PARCIAL — Base existe mas Sprint 4 expande significativamente
- ✅ IMPLEMENTADO — Funcionalidade implementada e funcional
- 🔮 PLANEJADO — Decisao de arquitetura tomada, implementacao futura

---

### ======================================
### BLOCO E — DISPUTAS / LANCES (RF-042-xx)
### ======================================

---

### RF-042: Modulo de Disputas (Lances)

| RF | Descricao | Status |
|---|---|---|
| RF-042-01 | Modalidade Lance Aberto — sala virtual com contra-lances em janela de 2 minutos | 🔮 PLANEJADO |
| RF-042-02 | Modalidade Lance Aberto + Fechado — lance aberto seguido de 5 minutos de lance fechado sem visibilidade | 🔮 PLANEJADO |
| RF-042-03 | Identificacao automatica da modalidade de lance a partir do edital | 🔮 PLANEJADO |

---

### RF-042-01: Modalidade Lance Aberto | DISPUTAS

| Campo | Valor |
|-------|-------|
| **Modulo** | DISPUTAS / LANCES |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
Sala virtual de lances abertos onde todos os participantes podem ver os lances uns dos outros. O sistema opera com contra-lances em janela de 2 minutos — cada novo lance reinicia o cronometro. O usuario configura o lance inicial (Camada D da Precificacao) e o lance minimo (Camada E). O sistema sugere lances intermediarios com base na estrategia competitiva (RF-039-11).

**Criterios de aceite:**
1. Interface de sala de lances com cronometro de 2 minutos
2. Visibilidade de todos os lances em tempo real
3. Reinicio automatico do cronometro a cada novo lance
4. Bloqueio de lances abaixo do valor minimo (Camada E)
5. Sugestao de lances intermediarios baseada na estrategia competitiva

---

### RF-042-02: Modalidade Lance Aberto + Fechado | DISPUTAS

| Campo | Valor |
|-------|-------|
| **Modulo** | DISPUTAS / LANCES |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
Modalidade hibrida: fase inicial de lance aberto (visivel para todos), seguida de fase de lance fechado de 5 minutos sem visibilidade dos demais participantes. O sistema deve calcular automaticamente o lance fechado otimo com base no historico da fase aberta e na estrategia competitiva configurada.

**Criterios de aceite:**
1. Transicao automatica de fase aberta para fase fechada
2. Cronometro de 5 minutos para fase fechada
3. Sem visibilidade de lances dos concorrentes na fase fechada
4. Calculo automatico de lance fechado otimo sugerido pela IA
5. Bloqueio de lances abaixo do valor minimo em ambas as fases

---

### RF-042-03: Identificacao Automatica da Modalidade de Lance | DISPUTAS

| Campo | Valor |
|-------|-------|
| **Modulo** | DISPUTAS / LANCES |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
A IA le o edital e identifica automaticamente qual modalidade de lance sera utilizada (aberto, aberto+fechado, ou outras variantes). O sistema pre-configura a interface de disputa conforme a modalidade detectada, reduzindo erro humano na configuracao.

**Criterios de aceite:**
1. Extracao automatica da modalidade de lance a partir do texto do edital
2. Pre-configuracao da interface de disputa conforme modalidade
3. Indicacao visual clara da modalidade detectada
4. Possibilidade de correcao manual pelo usuario

---

### ======================================
### BLOCO F — IMPUGNACAO E ESCLARECIMENTOS (RF-043-xx)
### ======================================

---

### RF-043: Impugnacao e Esclarecimentos

| RF | Descricao | Status |
|---|---|---|
| RF-043-01 | Validacao Legal do Edital — IA le edital, identifica leis/normas citadas, compara conteudo com legislacao (Lei 14.133/2021, decretos estaduais/municipais), detecta inconsistencias | ❌ NAO IMPLEMENTADO |
| RF-043-02 | Classificacao de gravidade das inconsistencias legais | ❌ NAO IMPLEMENTADO |
| RF-043-03 | Sugestao automatica de Pedido de Esclarecimento (duvida/ambiguidade) ou Pedido de Impugnacao (nao conformidade legal) | ❌ NAO IMPLEMENTADO |
| RF-043-04 | Geracao automatica de Peticao de Impugnacao — juridicamente fundamentada, com base legal, jurisprudencias, identificacao de inconsistencias | ❌ NAO IMPLEMENTADO |
| RF-043-05 | Templates de peticao parametrizaveis — arquitetura padrao do sistema + modelos customizaveis pelo usuario | ❌ NAO IMPLEMENTADO |
| RF-043-06 | Edicao completa da peticao gerada pela IA — 100% editavel com LOG de alteracoes (usuario, data, hora) | ❌ NAO IMPLEMENTADO |
| RF-043-07 | Upload de peticao externa (elaborada fora do sistema) | ❌ NAO IMPLEMENTADO |
| RF-043-08 | Controle de prazo — alertar que impugnacao deve ser feita ate 3 dias uteis antes da abertura | ❌ NAO IMPLEMENTADO |

---

### RF-043-01: Validacao Legal do Edital | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
A IA le o edital completo, identifica todas as leis, normas e decretos citados no texto, e compara o conteudo das clausulas com a legislacao vigente (Lei 14.133/2021, decretos estaduais/municipais, normas tecnicas). O sistema detecta inconsistencias, clausulas restritivas indevidas e desvios da legislacao. Utiliza base de legislacao indexada (RAG juridico) para fundamentacao precisa.

**Criterios de aceite:**
1. Extracao automatica de leis/normas citadas no edital
2. Comparacao clausula-a-clausula com legislacao vigente
3. Deteccao de inconsistencias e clausulas restritivas
4. Base de legislacao indexada (Lei 14.133/2021, decretos, normas)
5. Relatorio de inconsistencias com citacao da lei violada

---

### RF-043-02: Classificacao de Gravidade das Inconsistencias | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Cada inconsistencia detectada pela Validacao Legal (RF-043-01) recebe uma classificacao de gravidade: Critica (viola lei federal, impede participacao), Alta (restringe competitividade indevidamente), Media (ambiguidade que pode prejudicar), Baixa (imprecisao sem impacto direto). A classificacao orienta a decisao entre Pedido de Esclarecimento e Pedido de Impugnacao.

**Criterios de aceite:**
1. 4 niveis de gravidade: Critica, Alta, Media, Baixa
2. Cores visuais por nivel (vermelho, laranja, amarelo, azul)
3. Justificativa IA para cada classificacao
4. Ordenacao por gravidade no relatorio
5. Filtro por nivel de gravidade

---

### RF-043-03: Sugestao de Esclarecimento ou Impugnacao | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Com base na classificacao de gravidade (RF-043-02), o sistema sugere automaticamente a acao mais adequada para cada inconsistencia: Pedido de Esclarecimento (para duvidas e ambiguidades — gravidade Media/Baixa) ou Pedido de Impugnacao (para nao conformidades legais — gravidade Critica/Alta). O usuario pode alterar a sugestao antes de prosseguir.

**Criterios de aceite:**
1. Sugestao automatica por inconsistencia (Esclarecimento ou Impugnacao)
2. Regra de decisao baseada na gravidade
3. Possibilidade de alterar a sugestao manualmente
4. Agrupamento de inconsistencias por tipo de acao sugerida
5. Resumo quantitativo: X esclarecimentos + Y impugnacoes sugeridas

---

### RF-043-04: Geracao de Peticao de Impugnacao | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema gera automaticamente uma Peticao de Impugnacao juridicamente fundamentada, contendo: identificacao das partes, exposicao dos fatos (clausulas impugnadas), fundamentacao legal (leis, decretos, jurisprudencias), pedido (retificacao do edital ou suspensao do certame). A peticao segue a estrutura juridica padrao e pode ser customizada via templates.

**Criterios de aceite:**
1. Geracao automatica de peticao com estrutura juridica completa
2. Identificacao das partes (empresa impugnante + orgao)
3. Exposicao dos fatos com citacao de clausulas do edital
4. Fundamentacao legal com leis, decretos e jurisprudencias
5. Pedido formal de retificacao ou suspensao
6. Formatacao profissional para protocolo

---

### RF-043-05: Templates de Peticao Parametrizaveis | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema disponibiliza templates de peticao com arquitetura padrao (cabecalho, exposicao, fundamentacao, pedido, fecho) que podem ser customizados pelo usuario. O usuario pode criar novos templates, editar os existentes e definir um template padrao por tipo de peticao. Os templates sao parametrizaveis com variaveis automaticas (nome empresa, CNPJ, numero edital, orgao, datas).

**Criterios de aceite:**
1. Templates padrao do sistema para Esclarecimento e Impugnacao
2. CRUD de templates customizados pelo usuario
3. Variaveis automaticas (empresa, CNPJ, edital, orgao, datas)
4. Definicao de template padrao por tipo de peticao
5. Preview do template antes da geracao

---

### RF-043-06: Edicao Completa da Peticao com LOG | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
A peticao gerada pela IA e 100% editavel pelo usuario. Todas as alteracoes sao registradas em LOG imutavel contendo: usuario que alterou, data, hora, campo alterado, valor anterior e valor novo. O historico de versoes permite comparar a versao original (gerada pela IA) com a versao final (editada pelo usuario).

**Criterios de aceite:**
1. Peticao 100% editavel em editor rich-text
2. LOG imutavel de todas as alteracoes (usuario, data, hora)
3. Registro de campo alterado, valor anterior e valor novo
4. Historico de versoes com diff visual
5. Possibilidade de reverter para versao anterior

---

### RF-043-07: Upload de Peticao Externa | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O usuario pode fazer upload de uma peticao elaborada fora do sistema (DOCX, PDF). A peticao importada segue o mesmo fluxo de status (rascunho, revisao, protocolada) e e vinculada ao edital. O sistema registra a origem (upload externo) no LOG de rastreabilidade.

**Criterios de aceite:**
1. Upload de peticao em formato DOCX ou PDF
2. Vinculacao automatica ao edital
3. Fluxo de status identico ao da peticao gerada internamente
4. Registro de origem (upload externo) no LOG
5. Visualizacao inline do documento importado

---

### RF-043-08: Controle de Prazo de Impugnacao | IMPUGNACAO

| Campo | Valor |
|-------|-------|
| **Modulo** | IMPUGNACAO / ESCLARECIMENTOS |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema calcula e monitora o prazo legal para impugnacao (ate 3 dias uteis antes da data de abertura do certame, conforme Lei 14.133/2021). Alertas sao enviados via WhatsApp, email e notificacao no sistema quando o prazo esta proximo de expirar. O sistema bloqueia a geracao de impugnacao apos o prazo legal.

**Criterios de aceite:**
1. Calculo automatico do prazo de impugnacao (3 dias uteis antes da abertura)
2. Calendario de dias uteis (excluindo feriados nacionais e estaduais)
3. Alertas progressivos: 5 dias, 3 dias, 1 dia antes do prazo
4. Notificacao via WhatsApp, email e alerta no sistema
5. Bloqueio de geracao de impugnacao apos prazo expirado
6. Indicacao visual de prazo: verde (>5 dias), amarelo (3-5 dias), vermelho (<3 dias)

---

### ======================================
### BLOCO G — RECURSOS E CONTRA-RAZOES (RF-044-xx)
### ======================================

---

### RF-044: Recursos e Contra-Razoes

| RF | Descricao | Status |
|---|---|---|
| RF-044-01 | Monitoramento de janela de recurso — detectar abertura da janela de 10 min no portal e notificar via WhatsApp, email e alerta no sistema | ❌ NAO IMPLEMENTADO |
| RF-044-02 | Analise da proposta vencedora — IA compara com edital, leis, normas e jurisprudencias para listar inconsistencias | ❌ NAO IMPLEMENTADO |
| RF-044-03 | Chatbox para analise especifica — usuario pode pedir analise IA sobre desvios da proposta vencedora | ❌ NAO IMPLEMENTADO |
| RF-044-04 | Checklist parametrizavel — pontos de verificacao pre-formatados + customizaveis pelo usuario | ❌ NAO IMPLEMENTADO |
| RF-044-05 | Sugestao de recursos com motivacoes — desvios do edital + leis/normas + jurisprudencias | ❌ NAO IMPLEMENTADO |
| RF-044-06 | Reforco de motivacoes do pregoeiro — listar embasamentos que sustentam a desclassificacao dos perdedores | ❌ NAO IMPLEMENTADO |
| RF-044-07 | Geracao de Laudo de Recurso — arquitetura padrao ou customizada, com secoes juridica e tecnica obrigatorias | ❌ NAO IMPLEMENTADO |
| RF-044-08 | Geracao de Laudo de Contra-Razao — secao de defesa + secao de ataque, com base legal e jurisprudencias | ❌ NAO IMPLEMENTADO |
| RF-044-09 | Templates distintos para Recurso e Contra-Razao — matrizes de arquitetura separadas | ❌ NAO IMPLEMENTADO |
| RF-044-10 | Edicao completa dos laudos + LOG de alteracoes | ❌ NAO IMPLEMENTADO |
| RF-044-11 | Upload de laudos externos (Recurso ou Contra-Razao elaborados fora do sistema) | ❌ NAO IMPLEMENTADO |
| RF-044-12 | Submissao automatica no portal do governo — respeitar limites de tamanho, fracionar arquivos se necessario | 🔮 PLANEJADO |
| RF-044-13 | Consulta de recursos/impugnacoes em base publica do governo | 🔮 PLANEJADO |

---

### RF-044-01: Monitoramento de Janela de Recurso | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema monitora o portal do governo para detectar a abertura da janela de recurso (10 minutos apos a declaracao do vencedor). Ao detectar, envia notificacao imediata via WhatsApp, email e alerta no sistema. O cronometro de 10 minutos e exibido em tempo real na interface para que o usuario acompanhe o prazo.

**Criterios de aceite:**
1. Monitoramento automatico do portal para detectar abertura de janela de recurso
2. Notificacao imediata via WhatsApp, email e alerta no sistema
3. Cronometro de 10 minutos visivel na interface
4. Indicacao clara do edital e lote em questao
5. Botao de acao rapida para iniciar recurso

---

### RF-044-02: Analise da Proposta Vencedora | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
A IA analisa a proposta vencedora comparando-a com o edital, leis (Lei 14.133/2021), normas tecnicas e jurisprudencias. O sistema lista todas as inconsistencias encontradas: descumprimento de requisitos tecnicos, preco inexequivel, documentacao incompleta, irregularidades juridicas. Cada inconsistencia recebe classificacao de gravidade e fundamentacao legal.

**Criterios de aceite:**
1. Importacao ou acesso a proposta vencedora
2. Comparacao automatica com requisitos do edital
3. Verificacao de conformidade com Lei 14.133/2021
4. Lista de inconsistencias com classificacao de gravidade
5. Fundamentacao legal para cada inconsistencia
6. Relatorio consolidado de analise

---

### RF-044-03: Chatbox para Analise Especifica | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Interface de chat contextualizado onde o usuario pode fazer perguntas especificas sobre desvios da proposta vencedora. A IA responde com base no edital, na proposta analisada, na legislacao e em jurisprudencias. O usuario pode pedir aprofundamento em pontos especificos, solicitar argumentos adicionais ou pedir que a IA busque jurisprudencias sobre um tema.

**Criterios de aceite:**
1. Interface de chat contextualizado na tela de recursos
2. Contexto automatico: edital + proposta vencedora + legislacao
3. Respostas com citacao de fontes (artigos de lei, jurisprudencias)
4. Possibilidade de pedir aprofundamento em pontos especificos
5. Historico de conversa salvo e vinculado ao edital

---

### RF-044-04: Checklist Parametrizavel | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Checklist de pontos de verificacao para analise da proposta vencedora. O sistema fornece pontos pre-formatados (documentacao completa, habilitacao juridica, qualificacao tecnica, preco exequivel, prazo de validade da proposta) e permite que o usuario adicione pontos customizados. Cada item do checklist pode ser marcado como "conforme", "nao conforme" ou "nao verificado".

**Criterios de aceite:**
1. Checklist padrao com pontos de verificacao pre-formatados
2. CRUD de pontos customizados pelo usuario
3. Status por item: conforme, nao conforme, nao verificado
4. Cores visuais por status
5. Exportacao do checklist preenchido
6. Vinculacao de evidencias (trechos do edital/proposta) por item

---

### RF-044-05: Sugestao de Recursos com Motivacoes | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Com base nas inconsistencias detectadas (RF-044-02) e no checklist (RF-044-04), o sistema sugere recursos com motivacoes detalhadas: desvios do edital (clausula X nao atendida), leis/normas violadas (Art. Y da Lei 14.133), e jurisprudencias relevantes (TCU Acordao Z). Cada sugestao indica a probabilidade de sucesso estimada pela IA.

**Criterios de aceite:**
1. Sugestao automatica de recursos baseada em inconsistencias
2. Motivacao com 3 pilares: desvio do edital + lei/norma + jurisprudencia
3. Probabilidade de sucesso estimada por recurso
4. Ordenacao por probabilidade de sucesso
5. Referencias cruzadas com checklist (RF-044-04)

---

### RF-044-06: Reforco de Motivacoes do Pregoeiro | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Quando a empresa e a vencedora e precisa se defender de recursos dos perdedores, o sistema lista embasamentos que sustentam a decisao do pregoeiro de desclassificar os concorrentes. A IA analisa os motivos de desclassificacao, encontra fundamentacao legal e jurisprudencias que reforcem a decisao, facilitando a elaboracao de contra-razoes.

**Criterios de aceite:**
1. Listagem de motivos de desclassificacao dos concorrentes
2. Fundamentacao legal para cada motivo
3. Jurisprudencias que sustentam a desclassificacao
4. Argumentos de defesa pre-elaborados
5. Integracao com geracao de Contra-Razao (RF-044-08)

---

### RF-044-07: Geracao de Laudo de Recurso | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema gera automaticamente um Laudo de Recurso com arquitetura padrao ou customizada. O laudo possui secoes obrigatorias: identificacao das partes, tempestividade, exposicao dos fatos, secao juridica (fundamentacao legal e jurisprudencias), secao tecnica (desvios tecnicos comprovados), pedido (reforma da decisao). O laudo e formatado profissionalmente para protocolo no portal.

**Criterios de aceite:**
1. Geracao automatica de laudo com secoes obrigatorias
2. Secao juridica com fundamentacao legal e jurisprudencias
3. Secao tecnica com desvios comprovados
4. Verificacao de tempestividade (prazo de recurso)
5. Formatacao profissional para protocolo
6. Escolha entre arquitetura padrao e customizada

---

### RF-044-08: Geracao de Laudo de Contra-Razao | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema gera automaticamente um Laudo de Contra-Razao com duas secoes principais: secao de defesa (rebater os argumentos do recurso ponto-a-ponto) e secao de ataque (apresentar argumentos proprios de por que o recorrente deveria ter sido desclassificado). Ambas as secoes incluem base legal e jurisprudencias.

**Criterios de aceite:**
1. Geracao automatica de laudo de Contra-Razao
2. Secao de defesa: rebater cada argumento do recurso
3. Secao de ataque: argumentos proprios contra o recorrente
4. Base legal e jurisprudencias em ambas as secoes
5. Referencia ao recurso original ponto-a-ponto
6. Formatacao profissional para protocolo

---

### RF-044-09: Templates Distintos para Recurso e Contra-Razao | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema mantém matrizes de arquitetura separadas para Recurso e Contra-Razao, reconhecendo que sao documentos com estruturas e objetivos distintos. O usuario pode customizar os templates de cada tipo independentemente, criar novos templates e definir padroes por tipo de licitacao.

**Criterios de aceite:**
1. Templates separados para Recurso e Contra-Razao
2. CRUD de templates customizados por tipo
3. Variaveis automaticas (empresa, edital, orgao, datas, partes)
4. Definicao de template padrao por tipo de licitacao
5. Preview do template antes da geracao

---

### RF-044-10: Edicao Completa dos Laudos com LOG | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Os laudos de Recurso e Contra-Razao gerados pela IA sao 100% editaveis pelo usuario. Todas as alteracoes sao registradas em LOG imutavel contendo: usuario, data, hora, campo alterado, valor anterior e valor novo. O historico de versoes permite comparar versoes e reverter alteracoes.

**Criterios de aceite:**
1. Laudos 100% editaveis em editor rich-text
2. LOG imutavel de todas as alteracoes (usuario, data, hora)
3. Registro de campo alterado, valor anterior e valor novo
4. Historico de versoes com diff visual
5. Possibilidade de reverter para versao anterior

---

### RF-044-11: Upload de Laudos Externos | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O usuario pode fazer upload de laudos de Recurso ou Contra-Razao elaborados fora do sistema (DOCX, PDF). O documento importado e vinculado ao edital e segue o mesmo fluxo de status. O sistema registra a origem (upload externo) no LOG de rastreabilidade e permite classificacao do tipo (Recurso ou Contra-Razao).

**Criterios de aceite:**
1. Upload de laudos em formato DOCX ou PDF
2. Classificacao do tipo: Recurso ou Contra-Razao
3. Vinculacao automatica ao edital
4. Fluxo de status identico ao gerado internamente
5. Registro de origem (upload externo) no LOG
6. Visualizacao inline do documento importado

---

### RF-044-12: Submissao Automatica no Portal | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
O sistema submete automaticamente o laudo (Recurso ou Contra-Razao) no portal do governo, respeitando os limites de tamanho de upload do portal. Se o documento exceder o limite, o sistema fraciona automaticamente os arquivos (Smart Split) e submete em multiplas partes, mantendo a integridade e a ordem dos documentos.

**Criterios de aceite:**
1. Submissao automatica no portal do governo
2. Verificacao de limites de tamanho do portal
3. Smart Split automatico para documentos que excedem o limite
4. Submissao em multiplas partes quando necessario
5. Confirmacao de submissao com protocolo
6. LOG de submissao com timestamp e protocolo

---

### RF-044-13: Consulta de Recursos em Base Publica | RECURSOS

| Campo | Valor |
|-------|-------|
| **Modulo** | RECURSOS / CONTRA-RAZOES |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
O sistema consulta bases publicas do governo para obter informacoes sobre recursos e impugnacoes relacionados ao edital em questao ou a editais similares anteriores. Permite pesquisar jurisprudencias administrativas (decisoes de recursos anteriores) para fundamentar novos recursos ou contra-razoes.

**Criterios de aceite:**
1. Consulta automatica de recursos em bases publicas
2. Pesquisa por edital especifico ou por tema/produto
3. Historico de decisoes de recursos similares
4. Integracao com base de jurisprudencias administrativas
5. Uso dos resultados como insumo para geracao de laudos

---

## ============================================================
## FIM DA SPRINT 4 — Resumo dos 24 Requisitos
## ============================================================

### Tabela Resumo Sprint 4

| ID | Requisito | Bloco | Status |
|----|-----------|-------|--------|
| RF-042-01 | Modalidade Lance Aberto | DISPUTAS | 🔮 PLANEJADO |
| RF-042-02 | Modalidade Lance Aberto + Fechado | DISPUTAS | 🔮 PLANEJADO |
| RF-042-03 | Identificacao Modalidade de Lance | DISPUTAS | 🔮 PLANEJADO |
| RF-043-01 | Validacao Legal do Edital | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-02 | Classificacao Gravidade Inconsistencias | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-03 | Sugestao Esclarecimento/Impugnacao | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-04 | Geracao Peticao de Impugnacao | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-05 | Templates Peticao Parametrizaveis | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-06 | Edicao Peticao com LOG | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-07 | Upload Peticao Externa | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-043-08 | Controle de Prazo Impugnacao | IMPUGNACAO | ❌ NAO IMPLEMENTADO |
| RF-044-01 | Monitoramento Janela de Recurso | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-02 | Analise Proposta Vencedora | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-03 | Chatbox Analise Especifica | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-04 | Checklist Parametrizavel | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-05 | Sugestao Recursos com Motivacoes | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-06 | Reforco Motivacoes Pregoeiro | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-07 | Geracao Laudo de Recurso | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-08 | Geracao Laudo de Contra-Razao | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-09 | Templates Recurso e Contra-Razao | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-10 | Edicao Laudos com LOG | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-11 | Upload Laudos Externos | RECURSOS | ❌ NAO IMPLEMENTADO |
| RF-044-12 | Submissao Automatica Portal | RECURSOS | 🔮 PLANEJADO |
| RF-044-13 | Consulta Recursos Base Publica | RECURSOS | 🔮 PLANEJADO |

**Totais Sprint 4:** 0 IMPLEMENTADOS + 5 PLANEJADOS + 0 PARCIAIS + 19 NAO IMPLEMENTADOS
**Blocos:** 3 DISPUTAS + 8 IMPUGNACAO + 13 RECURSOS

---

---

## ============================================================
## SPRINT 5 — CRM E EXECUCAO DE CONTRATOS (RF-045 a RF-046 expandidos)
## ============================================================

**NOTA:** Os requisitos RF-045 e RF-046 da v6 eram basicos (7 e 5 criterios respectivamente). Nesta v7, eles sao substituidos por requisitos detalhados com sub-requisitos extraidos do documento SPRINT 5 VF. O CRM ganha pipeline completo de cards, parametrizacoes, mapa geografico, agenda e KPIs. A Execucao de Contrato ganha gestao de empenhos, auditoria, contratos a vencer, KPIs e integracao ERP futura.

**Fonte Sprint 5:**
- Documento "SPRINT 5 VF" (Descritivo funcional completo do CRM e Execucao de Contratos)

**Legenda de Status de Implementacao:**
- ❌ NAO IMPLEMENTADO — Funcionalidade nova, ainda nao existe no sistema
- ⚙️ PARCIAL — Base existe mas Sprint 5 expande significativamente
- ✅ IMPLEMENTADO — Funcionalidade implementada e funcional
- 🔮 PLANEJADO — Decisao de arquitetura tomada, implementacao futura

---

### ======================================
### BLOCO H — CRM (RF-045-xx)
### ======================================

---

### RF-045: CRM — So Desse Processo

**Pagina Workflow:** Layout geral (pagina 1) — "CRM — so desse processo"

**Descricao:**
CRM ativo focado no processo de licitacao (nao um CRM generico). O sistema deve distinguir entre vendas pontuais (fluxo encerra no ganho definitivo) e vendas recorrentes (fluxo completo de execucao com acompanhamento de contratos). O CRM e organizado em cards sequenciais que representam cada etapa do pipeline comercial, desde a captacao ate o resultado definitivo. Cada etapa possui uma abertura que evidencia o detalhamento dos processos dentro do card. O que for definido na validacao (GO/NO-GO) alimenta automaticamente o CRM.

**Criterios de aceite:**
1. Pipeline de cards organizado sequencialmente (RF-045-01)
2. Distincao entre venda pontual (ate ganho definitivo) e venda recorrente (fluxo de execucao completo)
3. Tabela de leads: edital, orgao, valor, score, status por card
4. Filtros: busca, status, responsavel, regiao, portfolio, vendedor
5. Metas por vendedor: meta mensal, realizado, editais ganhos, %
6. Acoes pos-perda: edital, motivo, acao, responsavel, prazo, status
7. Modal de registrar contato: tipo, data, observacoes, proximo passo
8. "O que for definido aqui [na validacao], vai para a tela do CRM" — fluxo automatico
9. Area de registro de motivos de nao-participacao (insumo para melhoria futura)
10. Area de registro de motivos de perdas definitivas (insumo para melhoria futura)
11. Para editais ganhos com recursos, area de registro dos motivos de sucesso (aprendizado)
12. Editais perdidos apos contra-razao devem ter diferenciacao para calculo de indice de perdas

---

### RF-045-01: CRM Pipeline com Cards | CRM

| Campo | Valor |
|-------|-------|
| **Modulo** | CRM |
| **Origem** | Documento SPRINT 5 VF — Fluxo do CRM do sistema |
| **Pagina Workflow** | CRMPage |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Pipeline visual de cards sequenciais representando cada etapa do processo de licitacao. Cada card contem uma abertura com detalhamento dos processos nele contidos. Os cards sao:

1. **CARD — EDITAIS NAO DIVULGADOS CAPTADOS:** Contratos mapeados fisicamente a partir de oportunidades levantadas em visitas presenciais dos vendedores junto aos orgaos publicos, antes da publicacao nos sistemas governamentais.
2. **CARD — EDITAIS DIVULGADOS CAPTADOS:** Relacao de todas as oportunidades capturadas na etapa de busca e definidas para o processo de analise.
3. **CARD — EDITAIS EM ANALISE:** Oportunidades em analise antes de se tornarem participacoes firmes. Para editais com decisao de nao-participacao, area de registro dos motivos ("porques") da decisao e LOG do usuario.
4. **CARD — LEADS POTENCIAIS:** Oportunidades selecionadas e definidas pela participacao.
5. **CARD — MONITORAMENTO DA CONCORRENCIA (ACOMPANHAMENTOS):** Editais definidos pela nao-participacao mas que a empresa quer acompanhar para entender quem sera o vencedor.
6. **CARD — EDITAIS EM PROCESSO DE IMPUGNACAO:** Oportunidades definidas para abertura de processo de impugnacao. Subcards: Aguardando Resultado, Impugnacao Deferida, Impugnacao Indeferida.
7. **CARD — EDITAIS EM FASE DE PROPOSTAS:** Editais em fase de elaboracao/construcao da proposta. Subcard: Precificacao (propostas ainda na etapa de precificacao).
8. **CARD — PROPOSTAS SUBMETIDAS AGUARDANDO LANCES:** Propostas ja submetidas aguardando abertura da etapa de lances. Monitoramento 24/7 com alertas conforme Sprint de monitoramento.
9. **CARD — EDITAIS EM ESPERA DE RESULTADOS:** Editais que passaram pela etapa de lances e aguardam resultados.
10. **CARD — GANHO PROVISORIO E HABILITACAO:** Propostas ganhas provisoriamente, antes da etapa de recursos e contra-razoes.
11. **CARD — PROCESSOS E RECURSOS:** Propostas ganhas pela concorrencia com recursos registrados. Subcards: Recursos em Elaboracao (com contador de tempo faltante com cor de alta temperatura), Recursos Submetidos (aguardando processos tecnicos e administrativos).
12. **CARD — CONTRA RAZOES:** Propostas que receberam recurso da concorrencia e necessitam contra-razao. Subcards: Contra-Razao em Elaboracao (com contador de tempo faltante), Contra-Razao Submetidas.
13. **CARD — RESULTADOS DEFINITIVOS:** Subcards: Aguardando Homologacao (ganhos definitivos aguardando homologacao para inicio da execucao), Editais Ganhos (ganhos definitivos, com area de registro de motivos de sucesso em recursos), Editais Perdidos (perdas definitivas, com registro de motivos e diferenciacao de perdas por contra-razao).

**Criterios de aceite:**
1. 13 cards visuais organizados sequencialmente no pipeline
2. Cada card com abertura mostrando detalhamento dos processos internos
3. Subcards para Impugnacao (3), Recursos (2), Contra-Razoes (2), Resultados Definitivos (3)
4. Movimentacao automatica de editais entre cards conforme evolucao do processo
5. Contadores de editais por card
6. Visualizacao tipo Kanban ou lista com drill-down
7. Filtros globais aplicaveis a todos os cards
8. Contador de tempo faltante em Recursos e Contra-Razoes em elaboracao com cor de alta temperatura

---

### RF-045-02: Parametrizacoes do CRM | CRM

| Campo | Valor |
|-------|-------|
| **Modulo** | CRM / PARAMETRIZACOES |
| **Origem** | Documento SPRINT 5 VF — Parametrizacoes da planilha Controle de Editais Argus |
| **Pagina Workflow** | ParametrizacoesPage > Aba CRM |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
A empresa deve poder parametrizar o controle da gestao dos editais no CRM com as seguintes categorias:

**Tipos de Editais do Business do Cliente** (parametrizavel): Aquisicao Equipamentos, Aquisicao Reag + Equip, Aquisicao Reagentes, Comodato, Locacao, Locacao + Reagentes, Manutencao, Material de Laboratorio.

**Agrupamento do Portfolio** (parametrizavel): Point Of Care, Gasometria, Bioquimica, Coagulacao, ELISA, Hematologia, Imunohematologia, Teste Rapido, Urinalise, Quimioluminescencia, Ion Seletivo, Aglutinacao, Diversos.

**Motivos de Derrotas** (parametrizavel): Administrativo, Exclusivo para ME/EPP, Falha operacional, Nao tem documento, Nao atende especificacao, Inviavel comercialmente, Nao tem equipamento.

**Criterios de aceite:**
1. CRUD de Tipos de Editais do Business (cadastro livre pela empresa)
2. CRUD de Agrupamento do Portfolio (cadastro livre pela empresa)
3. CRUD de Motivos de Derrotas (cadastro livre pela empresa)
4. Valores padrao pre-configurados (conforme lista acima) que a empresa pode alterar
5. Uso dos tipos parametrizados nos filtros do CRM e na classificacao de editais
6. Uso dos motivos de derrota no registro de perdas (cards de Editais Perdidos)

---

### RF-045-03: Mapa Geografico de Processos | CRM

| Campo | Valor |
|-------|-------|
| **Modulo** | CRM |
| **Origem** | Documento SPRINT 5 VF — Mapa de regioes com processos vigentes |
| **Pagina Workflow** | CRMPage > Aba Mapa |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Mapa geografico mostrando, para as regioes onde os processos dos cards estao vigentes, informacoes com base em filtros parametrizaveis: Regiao, Portfolio, Vendedor, etc. Cada etapa do processo apresentada com cores diferentes no mapa. Informacoes visiveis: editais abertos e aderentes ao portfolio, editais decididos pela participacao, editais com ganhos provisorios (1a chamada), editais com recursos, editais com ganhos definitivos, entre outros.

**Criterios de aceite:**
1. Mapa do Brasil interativo com marcadores por regiao/UF
2. Marcadores com cores diferentes por etapa do processo (Captados, Propostas, Ganhos, etc.)
3. Filtro por Regiao
4. Filtro por Portfolio (agrupamento parametrizado em RF-045-02)
5. Filtro por Vendedor
6. Tooltip com detalhamento ao passar o mouse sobre marcador
7. Drill-down: clicar no marcador exibe lista de editais daquela regiao/etapa
8. Legenda de cores por etapa do processo

---

### RF-045-04: Agenda/Timeline de Etapas | CRM

| Campo | Valor |
|-------|-------|
| **Modulo** | CRM |
| **Origem** | Documento SPRINT 5 VF — Agenda com visao de data para tracking |
| **Pagina Workflow** | CRMPage > Aba Agenda |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Cada etapa descrita nos cards do pipeline devera ser colocada em uma agenda, com visao de data para facilitar o tracking dos proximos passos pelos funcionarios responsaveis pela gestao das etapas. A agenda permite visualizacao por dia, semana e mes, com indicacao de responsavel por etapa.

**Criterios de aceite:**
1. Visao de agenda com os proximos passos de cada edital em andamento
2. Cada entrada contem: edital, etapa atual (card), data prevista, responsavel
3. Visualizacao por dia, semana e mes
4. Filtro por responsavel, etapa, portfolio
5. Cores por tipo de atividade/urgencia
6. Possibilidade de registrar data real de conclusao da etapa
7. Alertas para etapas com data prevista proxima ou vencida

---

### RF-045-05: KPIs do CRM | CRM

| Campo | Valor |
|-------|-------|
| **Modulo** | CRM / INDICADORES |
| **Origem** | Documento SPRINT 5 VF — Principais KPIs desta etapa |
| **Pagina Workflow** | CRMPage > Dashboard KPIs |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Conjunto completo de KPIs para acompanhamento do desempenho comercial no CRM de licitacoes. Os KPIs devem ser apresentados em dashboard visual com graficos e cards numericos.

**KPIs obrigatorios:**
1. Editais Participados X Editais Analisados
2. Editais Nao Participados X Editais Analisados
3. Editais Ganhos X Editais Participados
4. Editais Ganhos com Recursos X Editais Participados (com indice de reversao e evidencia dos motivos)
5. Editais Ganhos com Contrarrazao X Editais Participados
6. Editais Perdidos X Editais Participados
7. Editais Perdidos depois da Contra Razao X Total de Contra Razoes (com analise dos motivos)
8. Tempo Medio de Ganho (desde etapa de lance ate ganho definitivo)
9. Potencial de Receita (planilha de projecao)
10. Ticket Medio dos Editais Ganhos X Ticket Medio dos Editais Participados e Perdidos (medir direcionamento da energia em criacao de valor)

**Criterios de aceite:**
1. Dashboard visual com cards numericos para cada KPI
2. Graficos de evolucao temporal dos KPIs principais
3. Filtros por periodo, portfolio, regiao, vendedor
4. Drill-down em cada KPI para ver os editais que compoem o indicador
5. Destaque visual para indice de reversao de recursos
6. Analise de motivos de perdas e reversoes (texto + grafico pizza)
7. Calculo automatico de Ticket Medio e Potencial de Receita
8. Comparativo temporal (mes atual vs mes anterior, trimestre, ano)

---

### ======================================
### BLOCO I — EXECUCAO DE CONTRATOS (RF-046-xx)
### ======================================

---

### RF-046: Execucao de Contrato

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial (vermelho, em destaque)

**Descricao:**
Acompanhamento da execucao pos-vitoria: contratos, entregas, notas fiscais, empenhos e faturamento. O modulo distingue entre vendas pontuais (encerram no ganho definitivo) e vendas recorrentes (fluxo completo de execucao com acompanhamento de consumiveis ao longo do contrato). Para vendas recorrentes, o sistema acompanha o ciclo completo: contratos em andamento (com controle de empenhos), contratos a vencer e renovacoes. O modulo gera um relatorio para o gestor (dono da revenda/diretoria).

**Criterios de aceite:**
1. Tabela de contratos: numero, orgao, valor, data inicio/fim, status, tipo (pontual/recorrente)
2. Detalhe do contrato: entregas previstas vs realizadas
3. Modal de registrar entrega: descricao, quantidade, valor, nota fiscal
4. Indicadores: atrasados, entregues, pendentes
5. Proximos vencimentos
6. Distincao visual entre contratos pontuais e recorrentes
7. Cards organizados: Contratos em Andamento, Contratos a Vencer, Contratos Renovados, Contratos Nao Renovados
8. Relatorio gerencial consolidado para diretoria

---

### RF-046-01: Gestao de Empenhos | EXECUCAO

| Campo | Valor |
|-------|-------|
| **Modulo** | EXECUCAO DE CONTRATOS |
| **Origem** | Documento SPRINT 5 VF — SUBCARD - CONTROLE DOS EMPENHOS |
| **Pagina Workflow** | ProducaoPage > Detalhe do Contrato > Aba Empenhos |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema devera gerar um template (modelo padrao) para controle dos empenhos dos contratos ganhos. O empenho e o fato gerador para a emissao da fatura. O orgao publico nao faz, na maioria das vezes, o controle dos pedidos vis-a-vis ao empenho, podendo colocar volume de pedido maior que o empenho. O controle deve permitir acompanhamento ate o consumo total do saldo ou necessidade de novos empenhos.

**Pontos criticos:**
- Empenho gera fatura, mas pedidos nao acompanham volume integral do empenho (sao fracionados)
- Pedidos nao sao registrados no sistema do orgao (controle manual)
- Itens que NAO GERAM VALOR ao contrato (calibradores, controles) consumidos alem do previsto sao potenciais geradores de prejuizo — devem gerar alerta

**Criterios de aceite:**
1. Template padrao de controle de empenhos por contrato
2. Relacao de todos os itens/consumiveis do contrato
3. Controle de empenhos com detalhamento dos volumes contratados por item
4. Controle de valores faturados vinculados aos respectivos empenhos
5. Controle de entregas realizadas com registro das notas de entrega
6. Apuracao automatica do saldo do contrato (valor empenhado - somatorio das entregas)
7. Acompanhamento ate consumo total do saldo ou necessidade de novos empenhos
8. Farol de alerta para itens sem valor no contrato (calibradores, controles) cujo consumo excede o previsto
9. Area de input manual de pedidos pelo usuario (quando nao houver integracao ERP)
10. Integracao com modulo de Precificacao de Comodato/Alugueis contra Consumo de Reagentes (alimentacao do template)

---

### RF-046-02: Auditoria Empenhos x Faturas | EXECUCAO

| Campo | Valor |
|-------|-------|
| **Modulo** | EXECUCAO DE CONTRATOS |
| **Origem** | Documento SPRINT 5 VF — SUBCARD - AUDITORIA ENTRE EMPENHOS X FATURAS X PEDIDOS X SALDOS |
| **Pagina Workflow** | ProducaoPage > Detalhe do Contrato > Aba Auditoria |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
O sistema devera disponibilizar relatorios que permitam a conciliacao entre empenhos emitidos, entregas realizadas, faturas e notas de entrega correspondentes. Esses relatorios devem facilitar auditorias e validacoes operacionais.

**Criterios de aceite:**
1. Relatorio de conciliacao: Empenhos emitidos x Entregas realizadas x Faturas emitidas
2. Notas de entrega vinculadas a faturas e empenhos
3. Destaque visual para divergencias (empenho sem fatura, fatura sem entrega, etc.)
4. Filtros por contrato, periodo, item
5. Exportacao em PDF e Excel
6. Acesso por perfil de gestor e fiscal

---

### RF-046-03: Contratos a Vencer | EXECUCAO

| Campo | Valor |
|-------|-------|
| **Modulo** | EXECUCAO DE CONTRATOS |
| **Origem** | Documento SPRINT 5 VF — CARD - CONTRATOS A VENCER |
| **Pagina Workflow** | ProducaoPage > Aba Contratos a Vencer |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
Relacao de todos os contratos entrando em periodo de vencimento, organizados em subcards por urgencia. Contratos renovados voltam ao status de Contratos em Andamento. Contratos nao renovados sao encerrados.

**Subcards:**
1. Contratos a Vencer em 90 dias
2. Contratos a Vencer em 30 dias
3. Contratos em Tratativas de Renovacao
4. Contratos Renovados (voltam para Contratos em Andamento)
5. Contratos Nao Renovados (encerrados ou candidatos para novo edital)

**Criterios de aceite:**
1. Subcard de contratos a vencer em 90 dias com lista detalhada
2. Subcard de contratos a vencer em 30 dias com lista detalhada
3. Subcard de contratos em tratativas de renovacao
4. Movimentacao automatica: renovado volta para Contratos em Andamento
5. Card de Contratos Nao Renovados com indicacao se e candidato a novo edital
6. Alertas automaticos conforme proximidade do vencimento
7. Cores visuais por urgencia (verde 90d, amarelo 30d, vermelho tratativas)

---

### RF-046-04: KPIs de Execucao | EXECUCAO

| Campo | Valor |
|-------|-------|
| **Modulo** | EXECUCAO DE CONTRATOS / INDICADORES |
| **Origem** | Documento SPRINT 5 VF — KPIs DE EXECUCAO |
| **Pagina Workflow** | ProducaoPage > Dashboard KPIs |
| **Status** | ❌ NAO IMPLEMENTADO |

**Descricao:**
KPIs de acompanhamento da execucao de contratos, com acesso direto a cada contrato a partir do indicador.

**KPIs obrigatorios:**
1. Contratos ativos por mes e total (com acesso a cada contrato)
2. Contratos a vencer em 90 dias
3. Contratos a vencer em 30 dias
4. Contratos em tratativas para renovacao
5. Contratos encerrados renovados
6. Contratos nao renovados (candidatos para novo edital ou totalmente encerrados)

**Criterios de aceite:**
1. Dashboard visual com cards numericos para cada KPI
2. Drill-down em cada KPI para ver a lista de contratos
3. Grafico de evolucao temporal (contratos ativos por mes)
4. Filtros por periodo, regiao, portfolio
5. Comparativo mensal e acumulado
6. Destaque visual para contratos em situacao critica (vencimento proximo)

---

### RF-046-05: Integracao ERP | EXECUCAO (FUTURO)

| Campo | Valor |
|-------|-------|
| **Modulo** | EXECUCAO DE CONTRATOS / INTEGRACAO |
| **Origem** | Documento SPRINT 5 VF — Integracao com ERP do cliente |
| **Pagina Workflow** | ProducaoPage > Configuracoes de Integracao |
| **Status** | 🔮 PLANEJADO |

**Descricao:**
Integracao via APIs (ou outras formas de integracao) com o ERP do cliente para obtencao automatica de faturas associadas aos empenhos e notas de entregas associadas as faturas e empenhos. Essa integracao elimina a necessidade de input manual de pedidos e faturas, representando um diferencial relevante do sistema.

**Criterios de aceite:**
1. API de integracao com ERPs do cliente (REST ou similar)
2. Importacao automatica de faturas vinculadas a empenhos
3. Importacao automatica de notas de entrega vinculadas a faturas
4. Sincronizacao periodica (frequencia configuravel)
5. LOG de cada sincronizacao com status (sucesso/erro) e dados importados
6. Mapeamento configuravel de campos entre ERP e sistema
7. Fallback para input manual quando integracao nao estiver disponivel

---

## ============================================================
## FIM DA SPRINT 5 — Resumo dos 15 Requisitos (10 novos + 2 expandidos + 3 renumerados)
## ============================================================

### Tabela Resumo Sprint 5

| ID | Requisito | Bloco | Status |
|----|-----------|-------|--------|
| RF-045 | CRM — Pipeline completo | CRM | ❌ NAO IMPLEMENTADO |
| RF-045-01 | CRM Pipeline com Cards | CRM | ❌ NAO IMPLEMENTADO |
| RF-045-02 | Parametrizacoes do CRM | CRM | ❌ NAO IMPLEMENTADO |
| RF-045-03 | Mapa Geografico de Processos | CRM | ❌ NAO IMPLEMENTADO |
| RF-045-04 | Agenda/Timeline de Etapas | CRM | ❌ NAO IMPLEMENTADO |
| RF-045-05 | KPIs do CRM | CRM | ❌ NAO IMPLEMENTADO |
| RF-046 | Execucao de Contrato — Expandido | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-01 | Gestao de Empenhos | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-02 | Auditoria Empenhos x Faturas | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-03 | Contratos a Vencer | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-04 | KPIs de Execucao | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-05 | Integracao ERP | EXECUCAO | 🔮 PLANEJADO |
| RF-046-06 | Gestao de Aditivos (ex EXT-01) | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-07 | Gestor/Fiscal (ex EXT-02) | EXECUCAO | ❌ NAO IMPLEMENTADO |
| RF-046-08 | Saldo ARP (ex EXT-03) | EXECUCAO | ❌ NAO IMPLEMENTADO |

**Totais Sprint 5:** 0 IMPLEMENTADOS + 1 PLANEJADO + 0 PARCIAIS + 14 NAO IMPLEMENTADOS
**Blocos:** 6 CRM + 9 EXECUCAO

---

---

## 4. Requisitos Funcionais — INDICADORES

---

### RF-047: Flags (Sinalizadores)

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Dashboard de sinalizadores criticos que requerem acao imediata.

**Criterios de aceite:**
1. Alertas ativos por categoria e cor (vermelho/amarelo/verde)
2. Tabela de alertas configurados
3. Modal para criar alerta (tipo, edital, prazo, descricao)
4. Acoes: visualizar, silenciar, excluir

---

### RF-048: Monitoria

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Painel de monitoramentos automaticos configurados.

**Criterios de aceite:**
1. Tabela de monitoramentos: termo, UFs, fonte, frequencia, status
2. Editais encontrados por monitoramento
3. Modal para criar monitoramento (termo, UFs, fonte, frequencia)
4. Acoes: pausar, ativar, excluir

---

### RF-049: Concorrencia

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Inteligencia competitiva sobre concorrentes.

**Criterios de aceite:**
1. Tabela de concorrentes identificados (nome, CNPJ, vitorias, taxa)
2. Detalhe por concorrente: historico de disputas, precos praticados
3. Analise comparativa: nosso desempenho vs concorrente
4. Filtros por periodo e segmento

---

### RF-050: Mercado (TAM/SAM/SOM)

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Visao de mercado com dimensionamento TAM/SAM/SOM.

**Criterios de aceite:**
1. Stats: total de editais, valor total, media por edital
2. Tendencias por segmento/UF
3. Categorias mais demandadas
4. Evolucao de precos por segmento
5. Graficos reais (nao CSS fake)

---

### RF-051: Contratado X Realizado

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Comparativo entre valores contratados e efetivamente realizados.

**Criterios de aceite:**
1. Resumo comparativo: total contratado vs total realizado
2. Tabela detalhada por contrato
3. Indicadores de desvio
4. Depende de RF-046 (Execucao de Contrato)

---

### RF-052: Pedidos em Atraso

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Monitoramento de entregas atrasadas em contratos ativos.

**Criterios de aceite:**
1. Tabela de entregas atrasadas: contrato, item, dias de atraso, valor
2. Alertas automaticos para atrasos criticos
3. Depende de RF-046 (Execucao de Contrato)

---

### RF-046-06: Gestao de Aditivos Contratuais (anteriormente RF-046-EXT-01)

**Origem:** Art. 124-126, Lei 14.133/2021 — Pesquisa complementar Sprint 5
**Pagina Workflow:** ProducaoPage > Detalhe do Contrato > Aba "Aditivos"

**Descricao:**
Controle de aditivos contratuais (valor, prazo, escopo) com validacao dos limites legais da Lei 14.133/2021. O sistema deve alertar quando o percentual acumulado de aditivos se aproximar dos limites (25% para obras, 50% para casos especiais — Art. 125).

**Criterios de aceite:**
1. Tabela de aditivos por contrato: tipo (valor/prazo/escopo), justificativa, valor original, valor do aditivo, percentual, data, fundamentacao legal
2. Barra de progresso mostrando percentual acumulado de aditivos em relacao ao valor original do contrato
3. Alerta visual (badge vermelho) quando percentual acumulado >= 80% do limite legal aplicavel
4. Bloqueio com confirmacao quando aditivo excede limite legal (Art. 125)
5. Historico de todos os aditivos com auditoria de quem registrou e quando
6. Modal para registrar novo aditivo com campos obrigatorios: tipo, valor, justificativa e fundamentacao legal
7. Depende de RF-046 (Execucao de Contrato)

---

### RF-046-07: Designacao de Gestor e Fiscal de Contrato (anteriormente RF-046-EXT-02)

**Origem:** Art. 117, Lei 14.133/2021 — Pesquisa complementar Sprint 5
**Pagina Workflow:** ProducaoPage > Detalhe do Contrato > Aba "Gestor/Fiscal"

**Descricao:**
A Lei 14.133/2021 (Art. 117) torna obrigatoria a designacao de gestor e fiscais (tecnico e administrativo) para cada contrato. O sistema deve registrar as designacoes com dados da portaria e manter log de atividades de fiscalizacao (atesto, medicao, parecer).

**Criterios de aceite:**
1. Cards de designacao para cada papel: Gestor, Fiscal Tecnico, Fiscal Administrativo
2. Campos por designacao: nome, cargo, numero da portaria, data inicio, data fim, status (ativo/inativo)
3. Tabela de atividades do fiscal: tipo (atesto/medicao/parecer), data, descricao, arquivo anexo
4. Alerta quando designacao esta vencida (data_fim ultrapassada) ou quando contrato nao possui designacao
5. Depende de RF-046 (Execucao de Contrato)

---

### RF-046-08: Saldo de ARP e Controle de Carona (anteriormente RF-046-EXT-03)

**Origem:** Art. 82-86, Lei 14.133/2021 — Pesquisa complementar Sprint 5
**Pagina Workflow:** AtasPage > Aba "Saldo ARP"

**Descricao:**
Controle de saldo de Atas de Registro de Precos (ARP) por item, com rastreamento de quantidades consumidas pelo participante original e por adesao (carona). Valida os limites da Lei 14.133: 50% das quantidades registradas por adesao individual e o dobro do total como limite global (Art. 86).

**Criterios de aceite:**
1. Tabela de saldo por item da ARP: descricao, quantidade registrada, consumido pelo participante, consumido por carona, saldo disponivel
2. Barra de consumo visual por item (verde/amarelo/vermelho conforme % consumido)
3. Tabela de solicitacoes de carona: orgao solicitante, CNPJ, item, quantidade, status (pendente/autorizado/negado), datas
4. Validacao automatica: bloqueia carona quando quantidade excede 50% do registrado (individual) ou 2x o total (global)
5. Alertas de vigencia da ARP (1 ano, prorrogavel por mais 1 — Art. 84) com notificacao em 30/15/7 dias
6. Depende de RF-035 (Atas de Pregao)

---

### RF-052-01: Alertas de Vencimento Multi-tier (anteriormente RF-052-EXT-01)

**Origem:** Pesquisa de boas praticas em gestao contratual (Contraktor, Contratos.gov.br, SIGARP) — Sprint 5
**Pagina Workflow:** ContratadoRealizadoPage > Secao "Proximos Vencimentos"

**Descricao:**
Sistema de alertas configuraveis com multiplos niveis de antecedencia e canais de notificacao. Cobre: vencimento de contrato, vencimento de ARP, vencimento de garantia e prazos de entrega. Permite escalonamento: primeiro notificacao no sistema, depois email, depois WhatsApp conforme a urgencia.

**Criterios de aceite:**
1. Tipos de alerta configuraveis: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo
2. Thresholds configuraveis por tipo: 30, 15, 7 e 1 dia(s) antes do vencimento
3. Canais de notificacao por threshold: sistema (todos), email (15d+), WhatsApp (7d+)
4. Dashboard de vencimentos proximos agrupados por tipo e urgencia (vermelho/amarelo/verde)
5. Historico de alertas disparados com data/hora e canal utilizado
6. Depende de RF-046 (Execucao de Contrato) e RF-052 (Pedidos em Atraso)

---

### RF-053: Perdas

**Pagina Workflow:** Layout geral (pagina 1) — indicador direito

**Descricao:**
Dashboard de editais perdidos com analise de motivos.

**Criterios de aceite:**
1. Stats: total de perdas, valor perdido, taxa de perda
2. Grafico de motivos de perda (pizza ou barras)
3. Tabela de historico de perdas
4. Recomendacoes de melhoria baseadas em padroes de perda

---

## 5. Requisitos Transversais

---

### RF-054: Interface Hibrida (Chat + CRUD Visual)

**Descricao:**
O sistema funciona em dois modos: chat com agente IA e paginas visuais CRUD. Todas as operacoes devem ser acessiveis por ambos os canais.

**Criterios de aceite:**
1. FloatingChat acessivel de qualquer pagina
2. Paginas visuais com formularios CRUD para cada entidade
3. Operacoes via chat e via pagina produzem o mesmo resultado
4. REST APIs para cada entidade principal

---

### RF-055: Aprendizado Continuo

**Origem:** DOC2 (secao 10), DOC3 (REQ-11)
**Texto Workflow (pag 7):** "A justificativa e o combustivel para a inteligencia futura"

**Descricao:**
Sistema aprende com resultados (vitorias/derrotas) e justificativas de decisao para melhorar recomendacoes.

**Criterios de aceite:**
1. Registrar feedback de cada resultado (vitorias, derrotas, motivos)
2. Justificativas de decisao alimentam base de conhecimento
3. Scores se ajustam com base no historico
4. Recomendacoes de preco melhoram com resultados anteriores

---

### RF-056: Governanca e Auditoria

**Origem:** DOC2 (secao 11), DOC3 (REQ-12)

**Descricao:**
Log completo de todas as acoes do sistema para rastreabilidade.

**Criterios de aceite:**
1. Log de auditoria: usuario, acao, entidade, dados antes/depois, timestamp
2. Middleware automatico que registra operacoes CRUD
3. Dashboard de auditoria para administradores

---

### RF-057: Dispensas de Licitacao

**Origem:** DOC2 (secao 9), DOC3 (REQ-12)

**Descricao:**
Suporte especifico a dispensas de licitacao (Art. 75 Lei 14.133).

**Criterios de aceite:**
1. Filtro de dispensas na captacao
2. Workflow simplificado (prazos menores)
3. Geracao de cotacao para dispensas

---

### RF-058: Suporte Juridico IA

**Origem:** DOC2 (secao 6)

**Descricao:**
IA auxilia em questoes juridicas com disclaimers claros.

**Criterios de aceite:**
1. Disclaimers automaticos em respostas juridicas
2. Citacao de legislacao (Lei 14.133/2021)
3. Base de legislacao para RAG juridico

---

### RF-059: Autenticacao e Multi-tenancy

**Descricao:**
Login, tokens, isolamento de dados por usuario.

**Criterios de aceite:**
1. Login com email/senha
2. JWT + refresh tokens
3. Cada usuario so ve seus proprios dados
4. (Futuro) Google OAuth

---

### RF-060: Analytics com MindsDB

**Descricao:**
Consultas analiticas avancadas via MindsDB.

**Criterios de aceite:**
1. Previsoes de resultado
2. Analise de tendencias
3. Clustering de editais
4. Acessivel via chat

---

## 6. Requisitos Nao Funcionais

---

### RNF-001: Escalabilidade
- Suporte a multiplos usuarios simultaneos
- MySQL externo, Flask com pool de conexoes
- (Futuro) Redis para cache, Celery para filas

### RNF-002: Modularidade
- models.py (ORM), tools.py (logica), app.py (rotas)
- Frontend React componentizado
- Separacao clara de responsabilidades

### RNF-003: Observabilidade
- Logs estruturados (JSON)
- Metricas de uso (tokens LLM, latencia)
- Health check endpoint
- Tracing de chamadas

### RNF-004: Custos Controlaveis
- Contagem de tokens/chamadas LLM
- Limites de uso por usuario
- Dashboard de custos

---

## 7. Mapeamento Pagina Workflow → Requisitos

| Pagina Workflow | Titulo | Requisitos |
|----------------|--------|-----------|
| 1 | Visao Geral | Arquitetura (secao 1) |
| 2 | Empresa | RF-001 a RF-005, RF-013, RF-014 |
| 3 | Portfolio | RF-006 a RF-012, RF-039-05, RF-039-06 |
| 4 | Parametrizacoes | RF-013, RF-015 a RF-018 |
| 5 | Captacao (oportunidades) | RF-019 a RF-025 |
| 6 | Captacao (filtros) | RF-021 (detalhamento) |
| 7 | Validacao (principal) | RF-026 a RF-029, RF-031 a RF-034 |
| 8 | Validacao (aderencias) | RF-030, RF-035 |
| 9 | Validacao (Processo Amanda) | RF-036, RF-037 |
| 10 | Recurso | RF-044-01 a RF-044-13 |
| 11 | Disputa Lances | RF-042-01 a RF-042-03 |
| 12 | (CRM/Execucao) | RF-045, RF-045-01 a RF-045-05, RF-046, RF-046-01 a RF-046-08 |
| — | **Sprint 3: Precificacao** | RF-039-01 a RF-039-16 |
| — | **Sprint 3: Proposta** | RF-040-01 a RF-040-05 |
| — | **Sprint 3: Submissao** | RF-041-01, RF-041-02 |
| — | **Sprint 4: Disputas** | RF-042-01 a RF-042-03 |
| — | **Sprint 4: Impugnacao** | RF-043-01 a RF-043-08 |
| — | **Sprint 4: Recursos** | RF-044-01 a RF-044-13 |
| — | **Sprint 5: CRM** | RF-045-01 a RF-045-05 |
| — | **Sprint 5: Execucao** | RF-046-01 a RF-046-08 |

---

## 8. Resumo Quantitativo

| Categoria | Qtd Requisitos |
|-----------|---------------|
| Fundacao (Empresa, Portfolio, Parametrizacoes) | 18 (RF-001 a RF-018) |
| Fluxo Comercial — Captacao a Impugnacao | 20 (RF-019 a RF-038) |
| **Fluxo Comercial — Sprint 3 Precificacao** | **16 (RF-039-01 a RF-039-16)** |
| **Fluxo Comercial — Sprint 3 Proposta** | **5 (RF-040-01 a RF-040-05)** |
| **Fluxo Comercial — Sprint 3 Submissao** | **2 (RF-041-01 a RF-041-02)** |
| **Fluxo Comercial — Sprint 4 Disputas** | **3 (RF-042-01 a RF-042-03)** |
| **Fluxo Comercial — Sprint 4 Impugnacao** | **8 (RF-043-01 a RF-043-08)** |
| **Fluxo Comercial — Sprint 4 Recursos** | **13 (RF-044-01 a RF-044-13)** |
| **Fluxo Comercial — Sprint 5 CRM** | **6 (RF-045 + RF-045-01 a RF-045-05)** |
| **Fluxo Comercial — Sprint 5 Execucao** | **9 (RF-046 + RF-046-01 a RF-046-08)** |
| Indicadores (Flags a Perdas) | 8 (RF-047 a RF-053 + RF-052-01) |
| Transversais | 7 (RF-054 a RF-060) |
| **Total RF** | **114** (101 da v6 - 2 basicos CRM/Exec substituidos + 15 novos Sprint 5) |
| **Total RNF** | **4** |

---

## 9. Changelog v6 → v7

| Tipo | ID | Descricao da Mudanca |
|------|-----|---------------------|
| **EXPANDIDO** | RF-045 | CRM basico (7 criterios) expandido para CRM completo com pipeline de 13 cards, distincao venda pontual/recorrente, registro de motivos de nao-participacao e perdas |
| **NOVO** | RF-045-01 | CRM Pipeline com Cards — 13 cards sequenciais com subcards para impugnacao, recursos, contra-razoes e resultados definitivos |
| **NOVO** | RF-045-02 | Parametrizacoes do CRM — Tipos de Editais do Business, Agrupamento do Portfolio, Motivos de Derrotas (CRUD livre pela empresa) |
| **NOVO** | RF-045-03 | Mapa Geografico de Processos — mapa interativo com cores por etapa, filtros por Regiao/Portfolio/Vendedor |
| **NOVO** | RF-045-04 | Agenda/Timeline de Etapas — visao de data para tracking de proximos passos por responsavel |
| **NOVO** | RF-045-05 | KPIs do CRM — 10 KPIs obrigatorios incluindo reversao de recursos, ticket medio e potencial de receita |
| **EXPANDIDO** | RF-046 | Execucao basica (5 criterios) expandida com distincao pontual/recorrente, cards organizados e relatorio gerencial |
| **NOVO** | RF-046-01 | Gestao de Empenhos — template de controle com itens, volumes, faturas, entregas, saldo automatico e alertas para itens sem valor |
| **NOVO** | RF-046-02 | Auditoria Empenhos x Faturas — relatorios de conciliacao entre empenhos, entregas, faturas e notas |
| **NOVO** | RF-046-03 | Contratos a Vencer — subcards para 90d, 30d, tratativas, renovados e nao renovados |
| **NOVO** | RF-046-04 | KPIs de Execucao — 6 KPIs de acompanhamento de contratos ativos, vencimentos e renovacoes |
| **NOVO** | RF-046-05 | Integracao ERP (FUTURO) — API com ERP do cliente para faturas e notas de entrega |
| **RENUMERADO** | RF-046-06 | Gestao de Aditivos Contratuais (era RF-046-EXT-01) |
| **RENUMERADO** | RF-046-07 | Designacao de Gestor e Fiscal (era RF-046-EXT-02) |
| **RENUMERADO** | RF-046-08 | Saldo de ARP e Controle de Carona (era RF-046-EXT-03) |
| **RENUMERADO** | RF-052-01 | Alertas de Vencimento Multi-tier (era RF-052-EXT-01) |

**Resumo da Sprint 5:**
- 10 requisitos novos adicionados (RF-045-01 a RF-045-05 + RF-046-01 a RF-046-05)
- 2 requisitos basicos expandidos significativamente (RF-045, RF-046)
- 4 requisitos renumerados de EXT para numeracao sequencial
- Total de RFs: 101 → **114**

---

## 10. Diferenca v5 → v6 (historico)

| Aspecto | v5 | v6 (este documento) |
|---------|-----|---------------------|
| Total de RFs | 80 | **101** |
| RF-042 (Disputa de Lances) | 1 requisito basico com 6 criterios | **3 sub-requisitos detalhados** (Lance Aberto, Aberto+Fechado, Identificacao Modalidade) |
| RF-043 (Followup) | 1 requisito basico com 4 criterios | **Renumerado para Impugnacao e Esclarecimentos — 8 sub-requisitos detalhados** (Validacao Legal, Gravidade, Sugestao, Peticao, Templates, Edicao, Upload, Prazo) |
| RF-044 (Recurso) | 1 requisito basico com 5 criterios | **13 sub-requisitos detalhados** (Monitoramento, Analise Vencedora, Chatbox, Checklist, Sugestoes, Reforco Pregoeiro, Laudo Recurso, Laudo Contra-Razao, Templates, Edicao, Upload, Submissao, Consulta) |
| Sprint 4 | Nao existia como bloco | **24 requisitos com blocos (DISPUTAS/IMPUGNACAO/RECURSOS) e status** |
| Status Sprint 4 | — | **0 IMPLEMENTADOS + 5 PLANEJADOS + 19 NAO IMPLEMENTADOS** |
| Blocos Sprint 4 | — | **3 DISPUTAS + 8 IMPUGNACAO + 13 RECURSOS** |
| RF-043 antigo (Followup) | Existia como RF-043 | **Movido para RF-045+ (posicao preservada no fluxo comercial)** |

**Principais adicoes da Sprint 4:**
- **Validacao Legal IA:** Leitura automatica do edital com deteccao de inconsistencias legais (Lei 14.133/2021)
- **Geracao de Peticoes:** Peticao de Impugnacao e Laudos de Recurso/Contra-Razao com fundamentacao juridica automatica
- **Templates Parametrizaveis:** Arquiteturas separadas para cada tipo de documento juridico
- **Monitoramento de Prazos:** Controle de prazo de impugnacao (3 dias uteis) e janela de recurso (10 min)
- **Analise de Proposta Vencedora:** IA compara proposta vencedora com edital e legislacao
- **Rastreabilidade Total:** LOG imutavel em todos os documentos gerados (peticoes e laudos)

---

## 11. Diferenca v4 → v5 (historico)

| Aspecto | v4 | v5 |
|---------|-----|-----|
| Total de RFs | 77 | **80** |
| RF-039-01 a RF-039-13 | 14 NAO IMPLEMENTADOS + 6 PARCIAIS | **10 IMPLEMENTADOS + 1 PLANEJADO + 5 PARCIAIS + 4 NAO IMPLEMENTADOS** |
| RF-039-14 a RF-039-16 | Nao existiam | **3 novos requisitos IMPLEMENTADOS** (Pipeline IA, Relatorio, Persistencia) |
| Status Precificacao | Maioria NAO IMPLEMENTADO | **10 de 16 IMPLEMENTADOS** (62.5%) |
| Legenda de Status | 3 niveis (NAO/PARCIAL/JA) | **4 niveis** (NAO/PARCIAL/IMPLEMENTADO/PLANEJADO) |
| Numeracao RF-039-05 | Campos Portfolio | **Selecao Inteligente Portfolio** (renomeado para refletir implementacao) |
| Numeracao RF-039-06 | Sync Fabricante | **Volumetria por Parametro** (renomeado para refletir implementacao) |
| Numeracao RF-039-07 | Agente Match Assistido | **Gestao de Comodato** (reorganizado) |
| Numeracao RF-039-13 | Comodato | **Flag Reutilizar Preco** (reorganizado) |

---

## 12. Diferenca v2 → v4 (historico)

| Aspecto | v2 | v4 |
|---------|-----|-----|
| Total de RFs | 60 | **77** |
| RF-039 (Precificacao) | 15 linhas, 6 criterios basicos | **13 sub-requisitos detalhados** (lotes, volumetria, ERP, NCM, camadas A-F, estrategia, comodato) |
| RF-040 (Proposta) | 15 linhas, 6 criterios basicos | **5 sub-requisitos detalhados** (motor avancado, alternativas entrada, A/B, ANVISA, auditoria documental) |
| RF-041 (Submissao) | 14 linhas, 4 criterios basicos | **2 sub-requisitos detalhados** (exportacao dossie completo, rastreabilidade expandida) |
| Sprint 3 | Nao existia como bloco | **20 requisitos com fonte (JPEG/PDF), bloco (PRECIFICACAO/PROPOSTA), e status de implementacao** |
| Rastreabilidade | Generica | **Cada req Sprint 3 indica fonte especifica (JPEG-X, PDF-REVISADA, PDF-REUNIAO)** |
| Status implementacao | Nao indicado | **Cada req Sprint 3 marca: NAO IMPLEMENTADO / PARCIAL / JA IMPLEMENTADO** |
| Criterios de Aceite Sprint 3 | Nao existiam | **7 criterios mapeados a requisitos especificos (JPEG-6 Secao 6.3)** |

---

## 13. Regras de Negocio (RN-001 a RN-217)

Esta secao formaliza as **regras de negocio** do sistema Facilitia.ia. Ate v7, as regras estavam implicitas nos RFs, nos UCs, no codigo ou na legislacao (Lei 14.133/2021). A v8 consolida-as em 217 itens numerados sequencialmente, agrupados por sprint.

**Legenda:**
- **"Presente"**: regra ja implementada ou documentada em RF/UC/codigo — a fonte e citada.
- **FALTANTE**: regra identificada como necessaria mas nao implementada — justificativa explica por que deveria existir.

Cada RN cita o(s) UC(s) onde se aplica. As referencias cruzadas RN↔UC estao formalizadas nos documentos de Casos de Uso V3 (Sprint 5 tem V4) gerados nesta mesma revisao.

**Totais:**
- Sprint 1 (Fundacao): 42 RNs (RN-001 a RN-042) — 27 presentes + 15 faltantes
- Sprint 2 (Captacao + Validacao): 45 RNs (RN-043 a RN-087) — 34 presentes + 11 faltantes
- Sprint 3 (Precificacao + Proposta): 45 RNs (RN-088 a RN-132) — 32 presentes + 13 faltantes
- Sprint 4 (Impugnacao + Recursos): 32 RNs (RN-133 a RN-164) — 21 presentes + 11 faltantes
- Sprint 5 (Follow-up + Contratos + CRM): 53 RNs (RN-165 a RN-217) — 39 presentes + 14 faltantes
- **TOTAL: 217 RNs (153 presentes + 64 faltantes)**

---

### 13.1 Sprint 1 — Fundacao (Empresa, Portfolio, Parametrizacoes)

#### RNs presentes no sistema

- **RN-001**: O CNPJ da empresa e identificador unico global no sistema — nao pode existir mais de um registro de `empresas` com o mesmo CNPJ. Fonte: `backend/models.py:1344` (`cnpj = Column(String(20), unique=True, nullable=False)`) + RF-001. Aplicavel a: UC-F01.

- **RN-002**: Razao social e CNPJ sao campos obrigatorios para criacao/atualizacao do cadastro da empresa; sem eles o registro nao pode ser salvo. Fonte: `backend/models.py:1344-1345` + RF-001 criterio 5 + UC-F01 passo 3. Aplicavel a: UC-F01.

- **RN-003**: O CNPJ deve passar por validacao de formato (somente digitos numericos validos, tipicamente 14 digitos apos remocao de mascara `.`, `/`, `-`). Fonte: RF-001 criterio 5 + `backend/app.py:12466`. Aplicavel a: UC-F01, UC-F04.

- **RN-004**: Cada empresa so pode ter um responsavel com o mesmo CPF — o par (empresa_id, cpf) e unico. Fonte: `backend/models.py:1590` (`UniqueConstraint('empresa_id', 'cpf')`). Aplicavel a: UC-F05.

- **RN-005**: Uma empresa pode ter N responsaveis (1:N), classificados em tipos `representante_legal`, `preposto` ou `tecnico`. Fonte: `backend/models.py:1587-1603` + RF-003 + UC-F05 passo 2. Aplicavel a: UC-F05.

- **RN-006**: Nome e email sao obrigatorios no cadastro de um responsavel; cargo, CPF e telefone sao opcionais. Fonte: UC-F05 passo 2 + `backend/models.py:1594`. Aplicavel a: UC-F05.

- **RN-007**: Uma certidao tem obrigatoriamente uma data de vencimento registrada. Fonte: `backend/models.py:1551`. Aplicavel a: UC-F04.

- **RN-008**: O status visual da certidao e derivado da data de vencimento: verde quando faltam >30 dias, amarelo 15-30 dias, vermelho <15 dias ou vencida. Fonte: RF-002 criterio 3 + `frontend/src/pages/EmpresaPage.tsx:790-799`. Aplicavel a: UC-F04.

- **RN-009**: O conjunto de status possiveis de certidao e restrito a `valida`, `vencida`, `pendente`, `buscando`, `erro`, `nao_disponivel`; default `pendente`. Fonte: `backend/models.py:1553`. Aplicavel a: UC-F04.

- **RN-010**: Para disparar a busca automatica de certidoes, a empresa precisa ter `id` e `cnpj`; sem CNPJ a acao e bloqueada. Fonte: UC-F04 passo 2 + `backend/app.py:12463-12464` + `frontend/src/pages/EmpresaPage.tsx:536-540`. Aplicavel a: UC-F04.

- **RN-011**: Todo produto nasce com `status_pipeline = "cadastrado"` por default. Fonte: `backend/models.py:155` + `backend/app.py:3508`. Aplicavel a: UC-F06, UC-F07, UC-F08.

- **RN-012**: O funil de conversao do produto e fechado nos 4 estados `cadastrado`, `qualificado`, `ofertado`, `vencedor`; valores fora desse conjunto sao invalidos. Fonte: `backend/models.py:155` + RF-011 criterio 1. Aplicavel a: UC-F06, UC-F13.

- **RN-013**: Nao pode existir mais de um produto com o mesmo `nome` dentro da mesma empresa. Fonte: `backend/app.py:3491-3496`. Aplicavel a: UC-F07, UC-F08.

- **RN-014**: O produto pertence a uma unica empresa (FK `empresa_id`); ao excluir a empresa, produtos sao removidos em cascata. Fonte: `backend/models.py:145` (`ondelete='CASCADE'`). Aplicavel a: UC-F06, UC-F07.

- **RN-015**: Cada consulta ao catalogo de produtos e escopada a empresa atual do usuario (multi-tenant por `empresa_id` do JWT). Fonte: `backend/app.py:8188-8194`. Aplicavel a: UC-F06, UC-F07, UC-F08.

- **RN-016**: A categoria do produto e restrita a conjunto fechado: `equipamento`, `reagente`, `insumo_hospitalar`, `insumo_laboratorial`, `informatica`, `redes`, `mobiliario`, `eletronico`, `outro`. Valor invalido e coagido para `outro`. Fonte: `backend/models.py:149` + `backend/app.py:3479-3482`. Aplicavel a: UC-F07, UC-F08.

- **RN-017**: A completude tecnica do produto e calculada como `campos_preenchidos / total_campos` sobre 7 campos basicos (Nome, Fabricante, Modelo, NCM, SKU, Subclasse, Registro ANVISA) mais os campos da mascara da subclasse. Fonte: `backend/tools.py:6775-6838`. Aplicavel a: UC-F11.

- **RN-018**: O status de completude e classificado em 4 faixas: `completo` (>=90%), `quase_completo` (>=70%), `incompleto` (>=40%), `muito_incompleto` (<40%). Fonte: `backend/tools.py:6840-6848`. Aplicavel a: UC-F11.

- **RN-019**: Se o produto nao tiver subclasse associada, a verificacao de especificacoes nao e executada — o percentual de mascara default e 100%. Fonte: `backend/tools.py:6834` + UC-F11 passo 6. Aplicavel a: UC-F11.

- **RN-020**: A soma dos 6 pesos de score (tecnico, documental, complexidade, juridico, logistico, comercial) deve ser 1.00 (100%) com tolerancia ±0.01; soma invalida bloqueia salvamento. Fonte: `frontend/src/pages/ParametrizacoesPage.tsx:412-415` + RF-018 criterio 3 + UC-F14 passo 4. Aplicavel a: UC-F14.

- **RN-021**: O score final usa 6 dimensoes fixas e ponderadas — a lista e fechada e nao aceita adicao/remocao pelo usuario. Fonte: RF-018 criterio 1. Aplicavel a: UC-F14.

- **RN-022**: Apenas usuario com papel `admin` na empresa ou `superuser` global pode editar dados cadastrais da empresa atual; operadores comuns recebem HTTP 403. Fonte: `backend/app.py:1117-1119`. Aplicavel a: UC-F01, UC-F02.

- **RN-023**: Superusuario enxerga todas as empresas ativas; usuario comum so enxerga empresas com vinculo ativo em `usuario_empresa`. Fonte: `backend/app.py:1222-1240` + `backend/models.py:1417`. Aplicavel a: UC-F01 a UC-F17.

- **RN-024**: O vinculo usuario-empresa e unico — o par (`user_id`, `empresa_id`) nao pode existir mais de uma vez. Fonte: `backend/models.py:1420` (`UniqueConstraint`). Aplicavel a: UC-F01.

- **RN-025**: O porte da empresa, quando informado, e restrito a `me`, `epp`, `medio` ou `grande`. Fonte: `backend/models.py:1362` + RF-005 criterio 1. Aplicavel a: UC-F01.

- **RN-026**: A frequencia de busca automatica de certidoes e restrita a `desativada`, `diaria`, `semanal`, `quinzenal`, `mensal`; default `diaria`. Fonte: `backend/models.py:1364` + UC-F04 passo 6. Aplicavel a: UC-F04.

- **RN-027**: A fonte PNCP nao pode ser desativada: e fonte obrigatoria padrao de busca de editais. Fonte: RF-015 criterio 4. Aplicavel a: UC-F16.

#### RNs faltantes

- **RN-028** [FALTANTE]: O CNPJ deve ser validado pelo algoritmo de digitos verificadores da Receita Federal, nao apenas pelo formato/14 digitos. Justificativa: RF-001 fala apenas em "validacao de formato" e o codigo so remove mascara, sem calcular DV; sem essa regra entram CNPJs sintaticamente validos porem inexistentes. Aplicavel a: UC-F01.

- **RN-029** [FALTANTE]: O CPF do responsavel, quando informado, deve ser validado pelos digitos verificadores da Receita Federal. Justificativa: `empresa_responsaveis.cpf` existe mas nao ha validacao de DV; CPFs invalidos podem ser cadastrados. Aplicavel a: UC-F05.

- **RN-030** [FALTANTE]: Uma empresa deve ter pelo menos um responsavel do tipo `representante_legal` antes de ser utilizada em geracao de propostas. Justificativa: RF-003 preve responsaveis mas nao garante que sempre existe representante vigente — a IA pode preencher propostas sem assinante. Aplicavel a: UC-F05.

- **RN-031** [FALTANTE]: Uma empresa nao pode ser usada em proposta/edital se tiver certidoes obrigatorias (CND Federal, FGTS, Trabalhista) com status `vencida` ou sem arquivo anexado. Justificativa: RF-002 controla vencimento visual mas nao bloqueia operacionalmente. Aplicavel a: UC-F04 + fluxo de participacao.

- **RN-032** [FALTANTE]: Cada peso individual do score (RN-020) deve estar no intervalo [0.0, 1.0]; valores negativos ou >1.0 devem ser rejeitados. Justificativa: hoje so se valida a soma, permitindo `[1.5, -0.5, 0, 0, 0, 0]` que soma 1.00 mas e ilogico. Aplicavel a: UC-F14.

- **RN-033** [FALTANTE]: Um produto so pode transicionar para `status_pipeline = "ofertado"` se tiver NCM preenchido e (quando houver subclasse) completude tecnica >= 70%. Justificativa: RF-012 diz que NCM e obrigatorio mas nao ha invariante; produtos incompletos estao chegando ao funil. Aplicavel a: UC-F06, UC-F08, UC-F11.

- **RN-034** [FALTANTE]: A transicao de status do produto e monotona: `cadastrado -> qualificado -> ofertado -> vencedor`, nao pode pular etapas; reversao so com autorizacao admin + justificativa. Justificativa: RF-011 lista os estados mas nao restringe transicoes. Aplicavel a: UC-F06, UC-F08.

- **RN-035** [FALTANTE]: O NCM do produto deve seguir formato `NNNN.NN.NN` (8 digitos) e pertencer a uma NCM parametrizada na subclasse. Justificativa: `backend/models.py:148` permite String(20) livre, NCMs invalidos quebram busca de captacao. Aplicavel a: UC-F07, UC-F08.

- **RN-036** [FALTANTE]: Campos de preco sensivel (`preco_referencia`, markup, margens) so podem ser vistos por usuarios com papel `admin` ou `comercial`; outros veem mascarado. Justificativa: RF-009 menciona mas nao implementa — `Produto.to_dict()` retorna preco sem filtro. Aplicavel a: UC-F06, UC-F08.

- **RN-037** [FALTANTE]: Toda leitura de dados sensiveis do portfolio deve registrar log com `user_id`, `produto_id`, `timestamp`, `acao`. Justificativa: RF-009 criterio 2 exige log mas nao existe no codigo. Aplicavel a: UC-F06, UC-F08.

- **RN-038** [FALTANTE]: Limiares GO/NO-GO devem respeitar `minimo_GO > maximo_NO-GO` para cada faixa (Final, Tecnico, Juridico) — sem overlap. Justificativa: UC-F14 cita os campos mas nao valida coerencia; um edital pode cair em GO e NO-GO simultaneamente. Aplicavel a: UC-F14.

- **RN-039** [FALTANTE]: Documentos da empresa com `data_vencimento` passam a `expirado` automaticamente sem acao manual. Justificativa: `empresa_documentos.data_vencimento` existe mas nao ha transicao automatica como em `empresa_certidoes`. Aplicavel a: UC-F03.

- **RN-040**: Ao excluir uma subclasse, produtos vinculados devem permanecer no catalogo (soft-disconnect, `subclasse_id = NULL`), nao cascatear. Fonte: `backend/models.py:150` (`ondelete='SET NULL'` na FK `produtos.subclasse_id`). Aplicavel a: UC-F13.

- **RN-041** [FALTANTE]: Os pesos default pre-configurados devem totalizar 1.00 no primeiro acesso (seed); sem seed valido, primeira-execucao fica travada pelo RN-020. Justificativa: RF-018 criterio 4 nao especifica os valores. Aplicavel a: UC-F14 (inicializacao).

- **RN-042** [FALTANTE]: Um email adicionado a lista `Emails de Contato` deve ser unico dentro da empresa e valido por RFC 5322. Justificativa: `empresas.emails` e `Text` sem unicidade/validacao. Aplicavel a: UC-F02.

---

### 13.2 Sprint 2 — Captacao e Validacao

#### RNs presentes no sistema

- **RN-043**: Busca de editais no PNCP exige termo de busca nao vazio. Requisicoes sem termo retornam HTTP 400 "Parametro 'termo' e obrigatorio". Fonte: `backend/app.py:9470-9471` + `frontend/src/pages/CaptacaoPage.tsx:603-606`. Aplicavel a: UC-CV01.

- **RN-044**: Janela de publicacao da busca PNCP e limitada entre 7 e 730 dias (default 90). Valores fora sao clipados. Fonte: `backend/app.py:9466-9468`. Aplicavel a: UC-CV01.

- **RN-045**: Paginas PNCP sao consultadas com ate 50 resultados por pagina (tamanhoPagina/tam_pagina=50). Fonte: `backend/tools.py:774, 1885, 2474, 4003, 6201` + `backend/app.py:11315`. Aplicavel a: UC-CV01, UC-CV11, UC-CV12.

- **RN-046**: O sistema oferece 4 modos de score na captacao: `nenhum`, `rapido` (batch IA), `hibrido` (rapido + profundo nos melhores) e `profundo` (6 dimensoes nos N primeiros). Fonte: `backend/app.py:9451-9462, 9594-9618`. Aplicavel a: UC-CV01, UC-CV02.

- **RN-047**: Score final e media ponderada das 6 dimensoes: `score = 0.35*tec + 0.20*jur + 0.15*doc + 0.15*complex + 0.10*com + 0.05*log`. Pesos configuraveis por empresa. Fonte: `backend/tools.py:8039-8041, 8181-8189` + RF-018 + RF-028. Aplicavel a: UC-CV08.

- **RN-048**: A IA NAO decide GO/NO-GO — o backend recalcula o score_final e aplica regra deterministica de decisao com limiares do banco. Fonte: `backend/tools.py:8180-8200`. Aplicavel a: UC-CV08.

- **RN-049**: Decisao GO exige (AND): score_final >= limiar_go (default 70) E score_tecnico >= 60 E score_juridico >= 60. Fonte: `backend/tools.py:8042-8044, 8197-8198, 7833`. Aplicavel a: UC-CV08.

- **RN-050**: Decisao NO-GO automatica (OR): score_final < 40 OU score_tecnico < 30 OU score_juridico < 30. Fonte: `backend/tools.py:8195-8196, 7834`. Aplicavel a: UC-CV08.

- **RN-051**: Decisao AVALIAR e o complemento: qualquer combinacao que nao satisfaca GO nem NO-GO. Fonte: `backend/tools.py:8199-8200`. Aplicavel a: UC-CV08.

- **RN-052**: Potencial de ganho: `elevado` (>=70), `medio` (>=40 e <70), `baixo` (<40). Fonte: `backend/tools.py:8278-8282`. Aplicavel a: UC-CV02, UC-CV08.

- **RN-053**: Faixas de cada dimensao interpretadas pela IA: 90-100 excelente, 70-89 bom, 50-69 parcial, 0-49 baixo (uso em justificativas, nao em decisao). Fonte: `backend/tools.py:7788-7823`. Aplicavel a: UC-CV08.

- **RN-054**: Se o edital pede SERVICO e a empresa so tem PRODUTO cadastrado, score_tecnico e forcado para faixa 0-20. Fonte: `backend/tools.py:7793`. Aplicavel a: UC-CV08.

- **RN-055**: Compatibilidade de porte — edital exclusivo ME/EPP e empresa medio/grande => NO-GO obrigatorio; empresa ME/EPP em edital ME/EPP => +10 no score_comercial. Fonte: `backend/tools.py:7825-7829`. Aplicavel a: UC-CV08.

- **RN-056**: Esfera do orgao inferida do nome: contem MINISTERIO/FEDERAL/NACIONAL -> Federal; ESTADO/ESTADUAL -> Estadual; caso contrario -> Municipal. Fonte: `backend/app.py:11281, 11424`. Aplicavel a: UC-CV12.

- **RN-057**: Risco de pagamento heuristico: Federal=Baixo, Estadual=Medio, Municipal=Alto. Fonte: `backend/app.py:11295, 11427`. Aplicavel a: UC-CV12.

- **RN-058**: Classificacao de volume de compras do orgao: >100 = Alto; 21-100 = Medio; <=20 = Baixo. Fonte: `backend/app.py:11296, 11428`. Aplicavel a: UC-CV12.

- **RN-059**: Cache da analise de mercado tem validade de 30 dias; `{"forcar": true}` forca recalculo. Fonte: `backend/app.py:11270-11303`. Aplicavel a: UC-CV12.

- **RN-060**: Historico interno do orgao conta apenas editais da propria empresa com match ilike no nome (primeiros 20 chars), ignorando `temp_score`. Fonte: `backend/app.py:11525-11540`. Aplicavel a: UC-CV12.

- **RN-061**: Recorrencia do objeto a partir de atas PNCP (>=2 datas): media de intervalos <=200d = semestral; <=400d = anual; >400d = esporadica. Fonte: `backend/app.py:11723-11728, 11854-11864`. Aplicavel a: UC-CV11.

- **RN-062**: Severidade de riscos em 4 niveis: `critico`, `alto`, `medio`, `baixo`. Cores: alto=#ef4444, medio=#eab308, baixo=#22c55e. IA deve retornar 3-5 riscos de categorias distintas. Fonte: `backend/app.py:11762-11772` + `frontend/src/pages/ValidacaoPage.tsx:1473-1474`. Aplicavel a: UC-CV11.

- **RN-063**: Intencao estrategica em 4 estados exclusivos: `estrategico`, `defensivo`, `acompanhamento`, `aprendizado`, persistidos com margem desejada (0-50%). Fonte: `frontend/src/pages/CaptacaoPage.tsx:43, 2153-2154` + UC-CV04. Aplicavel a: UC-CV04.

- **RN-064**: Status do edital salvo em 4 estados: `novo`, `go`, `avaliando`, `nogo`. Fonte: `frontend/src/pages/ValidacaoPage.tsx:70, 615, 793-796`. Aplicavel a: UC-CV07, UC-CV08.

- **RN-065**: Prazo de encerramento com classificacao visual: <=2d vermelho, <=5d amarelo, >5d neutro. Cards em 4 faixas: 2/5/10/20 dias. Fonte: `frontend/src/pages/CaptacaoPage.tsx:314-317, 1117-1121`. Aplicavel a: UC-CV01, UC-CV02.

- **RN-066**: Acao em lote "Salvar Score >= 70%" salva apenas editais com score >=70 ainda nao salvos. Fonte: `frontend/src/pages/CaptacaoPage.tsx:895`. Aplicavel a: UC-CV03.

- **RN-067**: Matching produto x edital segue hierarquia: produto exato -> subclasse -> classe -> generico. Score so e calculado se existir >=1 produto no portfolio. Fonte: `backend/tools.py:8059-8074` + `backend/app.py:9866-9869`. Aplicavel a: UC-CV02, UC-CV08.

- **RN-068**: Deduplicacao multi-termo usa 2 chaves: (numero+orgao) e (orgao+valor_estimado). Fonte: `backend/app.py:9571-9587`. Aplicavel a: UC-CV01.

- **RN-069**: Compras similares do orgao filtradas por palavras-chave do produto match (>4 chars) + palavras do objeto (>5 chars), max 4 palavras, removendo stopwords. Fonte: `backend/app.py:11363-11391`. Aplicavel a: UC-CV12.

- **RN-070**: Analise de mercado exige CNPJ OU nome do orgao; sem nenhum, retorna HTTP 400. Fonte: `backend/app.py:11267-11268`. Aplicavel a: UC-CV12.

- **RN-071**: Extracao de requisitos documentais exige PDF com texto_extraido >=200 chars; senao HTTP 400. Fonte: `backend/app.py:11969-11973`. Aplicavel a: UC-CV10.

- **RN-072**: Extracao de requisitos e idempotente — requer `{"forcar": true}` para sobrescrever requisitos ja extraidos. Fonte: `backend/app.py:11944-11961`. Aplicavel a: UC-CV10.

- **RN-073**: Alerta visual amarelo na aba Riscos quando >=2 editais similares perdidos para concorrentes. Fonte: `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md:974` (UC-CV11 Passo 15). Aplicavel a: UC-CV11.

- **RN-074**: Taxa de vitoria do concorrente: `ganhos / max(participados, 1) * 100`, arredondada 1 casa. Fonte: `backend/app.py:11790, 11899`. Aplicavel a: UC-CV11.

- **RN-075**: Chat IA do UC-CV13 escopado por sessao — contexto restrito ao edital aberto e ao tipo de acao. Fonte: `backend/app.py:1285-1311` + UC-CV13. Aplicavel a: UC-CV13.

- **RN-076**: Editais `temp_score` (temporarios para calculo profundo sob demanda) sao sempre excluidos de `/api/editais/salvos` e do historico interno. Fonte: `backend/app.py:9726, 11532`. Aplicavel a: UC-CV07, UC-CV12.

#### RNs faltantes

- **RN-077**: Termo de busca exige comprimento minimo >=3 chars. Fonte: `backend/app.py:4942` e `backend/app.py:5031` (`if not termo or len(termo) < 3`). Aplicavel a: UC-CV01.

- **RN-078** [FALTANTE]: Limite maximo de editais por busca deveria ser cap hard (~500). Justificativa: frontend hoje envia 2000 como limite, sobrecarga backend. Aplicavel a: UC-CV01.

- **RN-079** [FALTANTE]: Cache de mercado (30d) deveria invalidar quando novo edital do mesmo orgao e salvo. Justificativa: historico interno desatualiza dentro da janela. Aplicavel a: UC-CV12.

- **RN-080** [FALTANTE]: Recalcular scores apos decisao salva (GO/NO-GO) deveria exigir justificativa ou criar nova versao. Justificativa: preservar auditoria. Aplicavel a: UC-CV08.

- **RN-081** [FALTANTE]: Backend nao valida formalmente que pesos de score somem 100% — apenas aplica. Justificativa: RF-018 define mas nao rejeita. Aplicavel a: UC-CV08 (via Parametrizacoes).

- **RN-082** [FALTANTE]: Transicoes `novo -> go/avaliando/nogo` nao tem matriz definida. Um edital `nogo` pode voltar a `go` sem restricao. Justificativa: workflow formal evita perdas de historico. Aplicavel a: UC-CV07, UC-CV08.

- **RN-083** [FALTANTE]: Chat IA nao restringe perguntas fora do escopo do edital. Justificativa: consumo desnecessario de tokens em off-topic. Aplicavel a: UC-CV13.

- **RN-084** [FALTANTE]: Sem limite/debounce no `/analisar-riscos` — cooldown minimo 60s sugerido. Justificativa: protege custos DeepSeek e rate-limit PNCP. Aplicavel a: UC-CV11.

- **RN-085** [FALTANTE]: Extracao de lotes IA (UC-CV09) nao exige valor/qtd minimos por lote. Justificativa: lotes com 1 item ou valor 0 sao artifatos poluentes. Aplicavel a: UC-CV09.

- **RN-086** [FALTANTE]: Score profundo nao e invalidado quando `data_encerramento` do edital muda ou portfolio e alterado. Justificativa: dados stale exibidos como atuais. Aplicavel a: UC-CV08.

- **RN-087** [FALTANTE]: Heuristica de esfera por substring e fragil — "Fundacao Oswaldo Cruz" (federal) pode nao bater. Deveria usar CNPJ ou `orgaoEntidade.poderId` estruturado do PNCP. Justificativa: divergencia com RF-033. Aplicavel a: UC-CV12.

---

### 13.3 Sprint 3 — Precificacao e Proposta

#### RNs presentes no sistema

- **RN-088**: Quantidade de kits arredondada SEMPRE para cima (ceil). Formula: `Qtd_Kits = ceil(Volume_Real_Ajustado / Rendimento_por_kit)`. Fonte: RF-039-02 + `backend/tools.py:8823` + `frontend/src/pages/PrecificacaoPage.tsx:544`. Aplicavel a: UC-P03.

- **RN-089**: Volume Real Ajustado = `Volume_edital + Rep_amostras + Rep_calibradores + Rep_controles`. Repeticoes default 0. Fonte: RF-039-02 + `backend/tools.py:8822`. Aplicavel a: UC-P03.

- **RN-090**: Rendimento por kit deve ser estritamente positivo. Sistema bloqueia calculo com "Rendimento do produto deve ser > 0". Fonte: `backend/tools.py:8818-8819`. Aplicavel a: UC-P03.

- **RN-091**: Modo "Custo + Markup" na Camada B: `preco_base = custo_base_final * (1 + markup_percentual / 100)`. Fonte: RF-039-08 + `backend/tools.py:8995` + `frontend/src/pages/PrecificacaoPage.tsx:607`. Aplicavel a: UC-P05.

- **RN-092**: Camada B aceita 3 modos mutuamente exclusivos: `manual`, `markup`, `upload`. Modo invalido retorna erro. Fonte: RF-039-08 + `backend/tools.py:8992-9011`. Aplicavel a: UC-P05.

- **RN-093**: Precedencia tributaria Camada A: param explicito > `beneficios_fiscais_ncm` (matching por maior prefixo) > parametros empresa > default (ICMS 18%, IPI 0%, PIS+COFINS 9.25%). Fonte: RF-039-04 + `backend/tools.py:8875-8912`. Aplicavel a: UC-P04.

- **RN-094**: NCM comecando com prefixo em `ncm_isencao_icms` (default `["3822"]`) recebe ICMS=0 automatico com flag `isencao_icms=True`. Fonte: RF-039-04 + `backend/tools.py:8903-8910`. Aplicavel a: UC-P04.

- **RN-095**: `custo_base_final = custo_unitario`; tributos sao informacionais, nao somam ao custo. Fonte: `backend/tools.py:8915-8916`. Aplicavel a: UC-P04.

- **RN-096**: Valor de Referencia (Camada C) = edital.valor_unitario_estimado (se existir) OU `preco_base * (percentual_sobre_base / 100)`. Pode ser sobrescrito manualmente. Fonte: RF-039-09 + `backend/tools.py:9050-9065`. Aplicavel a: UC-P06.

- **RN-097**: Camada C exige Camada B persistida; retorna erro "Configure preco base (Camada B) primeiro" caso contrario. Fonte: `backend/tools.py:9043-9044`. Aplicavel a: UC-P06.

- **RN-098**: Dependencia em cascata: A -> B -> C -> D/E. `tool_estruturar_lances` retorna "Configure camadas A-C primeiro" se faltar. Fonte: `backend/tools.py:9103-9109`. Aplicavel a: UC-P04 a UC-P07.

- **RN-099**: Lance minimo deve ser estritamente menor que lance inicial. Warning e confirmacao obrigatoria se viola. Fonte: RF-039-10 + `backend/tools.py:9135-9136` + `frontend/src/pages/PrecificacaoPage.tsx:675-677`. Aplicavel a: UC-P07.

- **RN-100**: Se `lance_minimo < custo_base_final` (custo>0), exibe warning "Lance minimo esta abaixo do custo!" com confirmacao. Margem = `((lance_minimo - custo) / custo) * 100`. Fonte: `backend/tools.py:9137-9140`. Aplicavel a: UC-P07.

- **RN-101**: Lance minimo sugerido pela IA: `custo_sugerido * 1.10` (custo + 10% margem minima). Mesma formula no recalculo cascata. Fonte: `backend/tools.py:9702` + `frontend/src/pages/PrecificacaoPage.tsx:612`. Aplicavel a: UC-P11, UC-P04.

- **RN-102**: Margem sobre custo padronizada: `((valor - custo) / custo) * 100`. Exige custo>0. Fonte: `backend/tools.py:9071, 9140`. Aplicavel a: UC-P04 a UC-P08.

- **RN-103**: Sugestoes A-E do pipeline IA sao determinsticas: (A)=preco_min*0.85; (B)=preco_medio*0.97; (C)=edital ou preco_medio*0.99; (D)=Preco Base; (E)=custo*1.10. Se variacao preco_max/preco_min>5x, (A) usa `((preco_min+preco_medio)/2)*0.85`. Fonte: RF-039-14 + `backend/tools.py:9695-9703`. Aplicavel a: UC-P11.

- **RN-104**: Janela historica: Camada F e pipeline IA usam 24 meses; busca geral chat usa 12 meses. Fonte: `backend/tools.py:9256, 9628, 6598`. Aplicavel a: UC-P09, UC-P11.

- **RN-105**: Variacao `preco_max/preco_min > 5x` sinaliza inconsistencia de unidade de medida. Fonte: `backend/tools.py:9695-9697`. Aplicavel a: UC-P11.

- **RN-106**: Perfis de estrategia aceitos: `quero_ganhar` e `nao_ganhei_minimo`. Cada um gera 3 cenarios. Fonte: RF-039-11 + `backend/tools.py:9205-9220`. Aplicavel a: UC-P08.

- **RN-107**: Amortizacao comodato mensal: `valor_equipamento / duracao_meses`, ambos >0. Fonte: RF-039-07 + `backend/tools.py:9357-9360`. Aplicavel a: UC-P10.

- **RN-108**: ANVISA semaforo 4 estados: `valido` (verde, ativo), `atencao` (amarelo, em_analise/indefinido), `vencido` (vermelho, cancelado), `sem_registro`. Fonte: RF-040-04 + `backend/tools.py:9858-9879`. Aplicavel a: UC-R04.

- **RN-109**: ANVISA vencido = BLOQUEIO de envio. Frontend exibe "BLOQUEANTE: Existem registros ANVISA vencidos". Fonte: RF-040-04 + `frontend/src/pages/PropostaPage.tsx:554-561, 1002-1016`. Aplicavel a: UC-R04, UC-R07.

- **RN-110**: Cada verificacao ANVISA gera `AnvisaValidacao` imutavel com data, fonte, resultado e `log_texto`. Fonte: RF-040-04 + `backend/tools.py:9882-9905`. Aplicavel a: UC-R04.

- **RN-111**: Documentos >25MB recebem status `alerta` com flag `alerta_tamanho=True`. Limite configuravel via `max_size_mb` (default 25). Fonte: RF-040-05 + `backend/tools.py:9978, 10004, 10039`. Aplicavel a: UC-R05.

- **RN-112**: Smart Split: paginas por parte = `max(1, int(total_pages * max_size_mb / file_size_mb))`. PDFs 1-pag nao fracionaveis. Fonte: RF-040-05 + `backend/tools.py:10049-10073`. Aplicavel a: UC-R05.

- **RN-113**: Checklist documental: status `ok`/`alerta`/`faltando`; flag `obrigatorio` herdada de `DocumentoNecessario.obrigatorio`. Fonte: RF-040-05 + `backend/tools.py:9983-9992`. Aplicavel a: UC-R05.

- **RN-114**: Transicoes validas do status da proposta: `rascunho -> revisao`; `revisao -> {rascunho, aprovada}`; `aprovada -> {revisao, enviada}`; `enviada -> {aprovada, rascunho}`. Outras retornam HTTP 400. Fonte: `backend/app.py:9981-9988`. Aplicavel a: UC-R07.

- **RN-115**: Descricao Tecnica A/B: alternar para "personalizado" preserva texto original como backup; modo default e "edital" (literal). Fonte: RF-040-03 + UC-R03 passo 2-4. Aplicavel a: UC-R03.

- **RN-116**: Criacao de proposta exige `edital_id` e `produto_id` obrigatorios. Fonte: RF-040-01/02 + `backend/app.py:8858-8859`. Aplicavel a: UC-R01, UC-R02.

- **RN-117**: Proposta recem-criada nasce com `status='rascunho'` (motor automatico ou upload). Fonte: RF-040-02 + `backend/app.py:8896`. Aplicavel a: UC-R01, UC-R02.

- **RN-118**: Dossie ZIP contem: proposta_tecnica.txt, arquivo original, pasta `documentos/` por produto, `anvisa_validacao.txt`. Fonte: RF-041-01 + `backend/app.py:8975-9005`. Aplicavel a: UC-R06.

- **RN-119**: Proposta exportavel em PDF (engessado) e DOCX (editavel) via `GET /api/propostas/{id}/export?formato=pdf|docx`. Fonte: RF-041-01 + `backend/app.py:9012`. Aplicavel a: UC-R06.

#### RNs faltantes

- **RN-120** [FALTANTE]: Sistema nao compara `valor_unitario_estimado` do edital com custo ERP no momento da vinculacao item-produto. Deveria emitir warning "Edital abaixo do custo — participacao inviavel" na Camada A. Justificativa: evita trabalho em editais inviaveis. Aplicavel a: UC-P02, UC-P04.

- **RN-121** [FALTANTE]: Nao valida se `lance_inicial <= target_referencia` (Camada C). Pregoes rejeitam lances acima do estimado. Justificativa: bloquear ou exigir confirmacao. Aplicavel a: UC-P07.

- **RN-122** [FALTANTE]: Margem minima deveria ser parametro da empresa (`parametros_score.margem_minima_percentual`), nao hardcoded +10%. Formula: `lance_minimo >= custo * (1 + margem_minima/100)`. Aplicavel a: UC-P07.

- **RN-123** [FALTANTE]: Match historico (Camada F) deveria permitir busca por NCM, nao apenas nome. Janela configuravel, 12m default. Aplicavel a: UC-P09, UC-P11.

- **RN-124** [FALTANTE]: Perfis `quero_ganhar`/`nao_ganhei_minimo` deveriam afetar markup da Camada B automaticamente: agressiva=15%, conservadora=30%. Aplicavel a: UC-P05, UC-P08.

- **RN-125** [FALTANTE]: Comodatos cadastrados nao sao inseridos automaticamente na proposta (secao "Equipamentos em Comodato"). Aplicavel a: UC-P10, UC-R01.

- **RN-126** [FALTANTE]: Status ANVISA `atencao` e binario — deveria calcular `validade_date - today` e exibir "Vencimento em X dias" quando <=180 dias. Status `proximo_vencimento` existe no frontend mas nao populado. Aplicavel a: UC-R04.

- **RN-127** [FALTANTE]: Motor de proposta nao valida pre-requisitos: (a) item vinculado a produto, (b) Camada A salva, (c) edital em validacao ou posterior. Aplicavel a: UC-R01.

- **RN-128** [FALTANTE]: Checklist de submissao (UC-R07) e readonly visual — nao bloqueia transicao `aprovada -> enviada` se item pendente. Aplicavel a: UC-R07.

- **RN-129** [FALTANTE]: Exportacao do dossie nao registra versao nem checksum SHA-256. Rastreabilidade critica em impugnacao. Aplicavel a: UC-R06.

- **RN-130** [FALTANTE]: `markup_percentual` hoje aceita negativos silenciosamente. Deveria validar `>=0` no modo `markup`; caso precise vender abaixo do custo, forcar modo `manual` + warning. Aplicavel a: UC-P05.

- **RN-131** [FALTANTE]: Custo ERP = 0 ou None cai silenciosamente no fallback `produto.preco_referencia`. Deveria retornar "Custo ERP invalido, edite manualmente". Aplicavel a: UC-P04.

- **RN-132** [FALTANTE]: RF-041-02 exige LOG imutavel de alteracoes de preco/markup. `auditoria_log` existe mas nao e gravado automaticamente pelas tools `tool_configurar_custos`, `tool_montar_preco_base`, etc. Aplicavel a: UC-P04 a UC-P07.

---

### 13.4 Sprint 4 — Impugnacao e Recursos

#### RNs presentes no sistema

- **RN-133**: Impugnacao deve ser protocolada ate 3 dias uteis antes da abertura (Lei 14.133/2021, Art. 164 caput). Sistema calcula o prazo automaticamente subtraindo 3 dias uteis (seg-sex). Fonte: RF-043-08 + `backend/app.py:13428-13477` + `backend/tools.py:10324-10334` + `frontend/src/pages/ImpugnacaoPage.tsx:58-77`. Aplicavel a: UC-I03, UC-I05.

- **RN-134**: Geracao de peticao via IA exige >=1 inconsistencia registrada (oriunda de validacao legal previa UC-I01 ou fornecida explicitamente). Sem isso: "Nenhuma inconsistencia encontrada. Execute a validacao legal primeiro.". Fonte: RF-043-04 + `backend/tools.py:10259-10260`. Aplicavel a: UC-I02, UC-I03.

- **RN-135**: Validacao legal exige PDF com texto extraido >=200 chars; editais sem PDF retornam `sem_pdf: true`. Fonte: RF-043-01 + `backend/tools.py:10144-10150`. Aplicavel a: UC-I01.

- **RN-136**: Base legal minima de comparacao: Lei 14.133/2021, Lei 8.666/1993, Decreto 11.462/2023, IN SEGES/ME 73/2022, jurisprudencia TCU. Inconsistencias reportadas com `lei_violada` explicita. Fonte: RF-043-01 + `backend/tools.py:10153-10175`. Aplicavel a: UC-I01.

- **RN-137**: Classificacao de gravidade em 3 niveis: ALTA (vermelho), MEDIA (amarelo), BAIXA (azul/verde). Define cor e priorizacao na tabela. Fonte: RF-043-02 + `backend/tools.py:10161-10175` + `frontend/src/pages/ImpugnacaoPage.tsx:82-87`. Aplicavel a: UC-I01, UC-RE02.

- **RN-138**: `sugestao_tipo` aceita `impugnacao` (Alta/Critica) ou `esclarecimento` (Media/Baixa). Usuario pode sobrepor no modal. Fonte: RF-043-03 + `backend/tools.py:10167` + UC-I02 passos 3-7. Aplicavel a: UC-I02.

- **RN-139**: Geracao de peticao exige edital com: numero, orgao, objeto e data_abertura. Campos faltantes emitem "N/I" no prompt; data_abertura necessaria para tempestividade. Fonte: RF-043-04 + `backend/tools.py:10294-10298`. Aplicavel a: UC-I03.

- **RN-140**: Peticao/impugnacao nasce em `rascunho`. Fluxo: rascunho -> em revisao -> enviada/protocolada. Fonte: RF-043-06 + `backend/app.py:13351-13352`. Aplicavel a: UC-I03, UC-I04.

- **RN-141**: Upload de peticao externa aceita `.docx`, `.pdf`, `.doc`. Fonte: RF-043-07 + UC-I04 + `frontend/src/pages/ImpugnacaoPage.tsx`. Aplicavel a: UC-I04.

- **RN-142**: Badges de prazo: `Expirado` (vermelho, <=hoje), `Urgente` (<=1d), `Atencao` (3-5d), `OK` (>5d). Endpoint classifica como expirado/urgente/aberto. Fonte: RF-043-08 + `backend/app.py:13472`. Aplicavel a: UC-I05.

- **RN-143**: Janela de recurso de 10 minutos apos declaracao do vencedor (Art. 165 §2º Lei 14.133/2021). Cronometro em tempo real. Fonte: RF-044-01 + `backend/app.py:13480-13543`. Aplicavel a: UC-RE01.

- **RN-144**: Manifestacao de intencao de recurso obrigatoria dentro da janela de 10min (Art. 165 §3º). Fonte: RF-044-01 + UC-RE01 passos 10-11. Aplicavel a: UC-RE01, UC-RE04.

- **RN-145**: Monitoramento da janela suporta 3 canais simultaneos: WhatsApp, Email, Alerta. Defaults = todos True. Fonte: RF-044-01 + `backend/app.py:13531-13533`. Aplicavel a: UC-RE01.

- **RN-146**: Laudo de Recurso ou Contra-Razao exige subtipo `Administrativo` ou `Tecnico`. Fonte: RF-044-09 + UC-RE04 passo 4. Aplicavel a: UC-RE04, UC-RE05.

- **RN-147**: Laudo de Recurso exige secoes `## SECAO JURIDICA` e `## SECAO TECNICA`. Fonte: RF-044-07 + UC-RE04 passo 11 + `frontend/src/pages/RecursosPage.tsx:460-461`. Aplicavel a: UC-RE04.

- **RN-148**: Contra-Razao exige adicionalmente `## DEFESA` e `## ATAQUE`. Fonte: RF-044-08 + UC-RE05 passos 9-10. Aplicavel a: UC-RE05.

- **RN-149**: Status valido de recurso: enum `[rascunho, revisao, enviado, aceito, rejeitado]`. Outros valores retornam HTTP 400. Fonte: `backend/app.py:13690-13692`. Aplicavel a: UC-RE04, UC-RE05.

- **RN-150**: Checklist pre-envio de 6 itens: formato PDF/DOCX, <25MB, secao juridica, secao tecnica, edital vinculado, status adequado. Todos devem passar. Fonte: RF-044-07 + UC-RE06 passo 4 + `frontend/src/pages/RecursosPage.tsx:456-466`. Aplicavel a: UC-RE06.

- **RN-151**: Apos upload manual no portal, protocolo obrigatorio (ex.: "PNCP-2026-0046-REC-001"). Sem protocolo o status fica em revisao. Fonte: RF-044-12 + UC-RE06 passos 9-11. Aplicavel a: UC-RE06.

- **RN-152**: Chat juridico (UC-RE03) responde apenas dentro do edital, proposta vencedora, inconsistencias e base de legislacao. Respostas devem citar fontes. Fonte: RF-044-03 + UC-RE03 passos 2, 6-7. Aplicavel a: UC-RE03.

- **RN-153**: LOG imutavel de edicoes em peticao/laudo com user_id, timestamp, campo, valor_anterior, valor_novo. Fonte: RF-043-06 + RF-044-10 + `backend/app.py:13403` (`updated_at`). Aplicavel a: UC-I03, UC-RE04, UC-RE05.

- **RN-154**: Analise da proposta vencedora (UC-RE02) exige texto colado no `[TextArea]`. Fonte: RF-044-02 + UC-RE02 passo 3 + `backend/app.py:13546-13562`. Aplicavel a: UC-RE02.

#### RNs faltantes

- **RN-155** [FALTANTE]: Prazo legal de recurso = 3 dias uteis da intimacao (Art. 165 §1º I). Sistema nao calcula nem bloqueia geracao apos esse prazo. Aplicavel a: UC-RE04, UC-RE06.

- **RN-156** [FALTANTE]: Prazo legal de contra-razao = 3 dias uteis do recebimento da intimacao (Art. 165 §3º). Nao ha contador por empresa alvo. Aplicavel a: UC-RE05, UC-RE06.

- **RN-157** [FALTANTE]: Quando prazo de impugnacao/recurso/contra-razao esta expirado, sistema deve impedir criacao de nova peticao/laudo. Hoje `tool_gerar_peticao_impugnacao` nao verifica `expirado`. Aplicavel a: UC-I03, UC-RE04, UC-RE05.

- **RN-158** [FALTANTE]: Countdown visual padronizado: verde >72h, laranja 24-72h, vermelho <24h. Cortes atuais no frontend sao diferentes. Aplicavel a: UC-I05, UC-RE01.

- **RN-159** [FALTANTE]: Laudo de Recurso so pode ser gerado se edital esta em status de derrota/perda. Hoje `criar_recurso_detalhado` aceita qualquer edital. Aplicavel a: UC-RE04.

- **RN-160** [FALTANTE]: Contra-Razao so pode ser gerada se (a) empresa venceu e (b) terceiro registrou recurso. Sistema nao verifica. Aplicavel a: UC-RE05.

- **RN-161** [FALTANTE]: Categorias estruturadas de motivacao: Restritividade, Vicio Formal, Direcionamento, Preco Inexequivel (Art. 59), Qualificacao Tecnica Excessiva, Prazo Inadequado, Outro. Hoje `fundamentacao` e livre. Aplicavel a: UC-I01, UC-RE02.

- **RN-162** [FALTANTE]: Upload de peticao/laudo: limite explicito 10 MB, rejeitar PDFs protegidos por senha. Hoje UI menciona "<25MB" sem validacao server-side. Aplicavel a: UC-I04, UC-RE04, UC-RE05.

- **RN-163** [FALTANTE]: Calculo de dias uteis deveria considerar feriados nacionais, estaduais (UF do orgao) e municipais. Hoje usa apenas `weekday()<5`. RF-043-08 cita calendario mas nao esta implementado. Aplicavel a: UC-I05, UC-RE04, UC-RE05.

- **RN-164** [FALTANTE]: Deveria existir monitor automatico que transicione laudo em elaboracao para "atrasado" quando contador zerar, impedindo submissao tardia. Aplicavel a: UC-RE04, UC-RE05, UC-RE06.

---

### 13.5 Sprint 5 — Follow-up, Atas, Contratos, Empenhos, CRM

#### RNs presentes no sistema

- **RN-165**: Pipeline CRM tem exatamente 13 stages imutaveis: captado_nao_divulgado, captado_divulgado, em_analise, lead_potencial, monitoramento_concorrencia, em_impugnacao, fase_propostas, proposta_submetida, espera_resultado, ganho_provisorio, processo_recurso, contra_razao, resultado_definitivo. Fonte: RF-045-01 + `backend/crm_routes.py:56-70` (PIPELINE_STAGES). Aplicavel a: UC-CRM01.

- **RN-166**: Cada edital pertence a 1 stage; transicao so aceita se stage destino estiver na lista valida. Fonte: `backend/crm_routes.py:160-162`. Aplicavel a: UC-CRM01.

- **RN-167**: CRM distingue `pipeline_tipo_venda` em "venda pontual" (encerra no ganho definitivo) e "venda recorrente" (fluxo de execucao completo). Fonte: RF-045 + RF-046 + UC-CRM01 passo 8 + `backend/crm_routes.py:129`. Aplicavel a: UC-CRM01, UC-CT07, UC-CT09.

- **RN-168**: Cards com substage: Impugnacao -> {aguardando, deferida, indeferida}; Recursos -> {em_elaboracao, submetidos}; Contra-Razoes -> {em_elaboracao, submetidas}; Resultados -> {aguardando_homologacao, ganho_definitivo, perdido_definitivo}. Fonte: RF-045-01 + `backend/crm_routes.py:87-92` (STAGE_SUBSTAGE_DEFAULT). Aplicavel a: UC-CRM01, UC-CRM07.

- **RN-169**: Saldo de empenho: `saldo = valor_empenhado - soma(faturas nao canceladas)`. Saldo negativo proibido. Fonte: RF-046-01 + `backend/empenho_routes.py:107,137,227`. Aplicavel a: UC-CT07, UC-CT08.

- **RN-170**: Faturas tem status enum {pendente, paga, cancelada}; apenas `!= cancelada` entram no saldo. Fonte: `backend/models.py:2242` + `backend/empenho_routes.py:103-106,129-132`. Aplicavel a: UC-CT07, UC-CT08.

- **RN-171**: Itens de empenho com `gera_valor=False` (calibradores, controles) geram alerta quando consumo >`limite_consumo_pct` (default 100%). Alerta `critico` se >120% do limite; `alto` caso contrario. Fonte: RF-046-01 + `backend/models.py:2208-2209` + `backend/empenho_routes.py:156-196`. Aplicavel a: UC-CT07.

- **RN-172**: Auditoria: `divergencia = |total_faturado - total_entregue_valor|`; marca `tem_divergencia=True` se >R$0,01. Fonte: `backend/empenho_routes.py:227-242` + RF-046-02. Aplicavel a: UC-CT08.

- **RN-173**: Relatorios de auditoria exportaveis em CSV com colunas fixas + linha de TOTAIS. Fonte: `backend/empenho_routes.py:287-296` + RF-046-02. Aplicavel a: UC-CT08.

- **RN-174**: Contratos a vencer classificados em 5 tiers exclusivos: `vencer_30`, `vencer_90`, `em_tratativa`, `renovados`, `nao_renovados`. Os 3 ultimos sobrescrevem os primeiros quando `tratativa_status` preenchido. Fonte: RF-046-03 + `backend/empenho_routes.py:326-349`. Aplicavel a: UC-CT09, UC-CT10.

- **RN-175**: `tratativa_status` aceita {em_tratativa, renovado, nao_renovado, null}. Fonte: `backend/empenho_routes.py:369-371`. Aplicavel a: UC-CT09.

- **RN-176**: Contrato marcado como renovado retorna para "Contratos em Andamento" com `data_renovacao` registrada. Fonte: RF-046-03 + UC-CT09 passos 10-12 + `backend/empenho_routes.py:375-379`. Aplicavel a: UC-CT09.

- **RN-177**: KPIs execucao retornam 6 metricas: contratos_ativos, vencer_30d, vencer_90d, em_tratativa, renovados, nao_renovados. "Ativo" = `status='vigente'` OU (data_fim>=hoje E status not in {encerrado, rescindido}). Fonte: RF-046-04 + `backend/empenho_routes.py:404-419`. Aplicavel a: UC-CT10.

- **RN-178**: Aditivo contratual aceita {acrescimo, supressao, prazo, escopo}. Backend calcula `limite_25_pct = valor_original * 0.25` e `pct_consumido`. Base legal: Lei 14.133/2021 Art. 125 (25% para compras/servicos; 50% para obras/reforma de edificios). Fonte: RF-046-06 + `backend/app.py:13994-14007` + `backend/models.py:1794`. Aplicavel a: UC-CT04.

- **RN-179**: Aditivo exige {contrato_id, tipo, justificativa}. Fundamentacao legal deve ser um de {Art. 124-I, Art. 124-II, Art. 125, Art. 126}. Fonte: `backend/crud_routes.py:599` + UC-CT04 passos 9-10. Aplicavel a: UC-CT04.

- **RN-180**: Designacoes contratuais aceitam 3 tipos fixos: {gestor, fiscal_tecnico, fiscal_administrativo}. Os 3 papeis sao obrigatorios por Lei 14.133/2021 Art. 117. Fonte: RF-046-07 + `backend/models.py:1838` + UC-CT05 passos 3-8. Aplicavel a: UC-CT05.

- **RN-181**: Criacao de designacao exige {contrato_id, tipo, nome}; atividades fiscais ligadas a `designacao_id` exigem {tipo, descricao}. Fonte: `backend/crud_routes.py:608,617`. Aplicavel a: UC-CT05.

- **RN-182**: Solicitacao de carona valida limite individual de 50% das qtds registradas por orgao solicitante (Art. 86 §4 Lei 14.133/2021). Fonte: RF-046-08 + `backend/app.py:14230-14238`. Aplicavel a: UC-CT06.

- **RN-183**: Solicitacao de carona valida limite global de 200% (o dobro) da qtd registrada, somando adesoes aprovadas (Art. 86 §5). Fonte: RF-046-08 + `backend/app.py:14240-14245`. Aplicavel a: UC-CT06.

- **RN-184**: ARP barra de consumo: verde (<70%), amarelo (70-89%), vermelho (>=90%). Fonte: UC-CT06 passo 4 + RF-046-08. Aplicavel a: UC-CT06.

- **RN-185**: Vigencia ARP 1 ano prorrogavel por +1 ano (Art. 84 Lei 14.133/2021). Alertas automaticos a 30/15/7 dias. Fonte: RF-046-08. Aplicavel a: UC-CT06, UC-CR03.

- **RN-186**: Alertas multi-tier de vencimento: Critico (<7d, vermelho), Urgente (7-15d, laranja), Atencao (15-30d, amarelo), Normal (>30d, verde). Fonte: RF-052-01 + UC-FU02 passo 7 + UC-CR03 passo 4. Aplicavel a: UC-FU02, UC-CR03.

- **RN-187**: Alertas multi-tier cobrem 4 entidades: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo. Canais escalonados: sistema (sempre), email (15d+), WhatsApp (7d+). Fonte: RF-052-01 + `backend/models.py:AlertaVencimentoRegra`. Aplicavel a: UC-CR03.

- **RN-188**: Agenda CRM classifica urgencia: critica (<=1d), alta (<=3d), normal (>3d). Coluna aceita {critica, alta, normal, baixa}. Fonte: `backend/crm_routes.py:343,358` + `backend/models.py:2343` + UC-CRM04 passo 6. Aplicavel a: UC-CRM04.

- **RN-189**: Parametrizacoes CRM aceitam 3 tipos fixos: {tipo_edital, agrupamento_portfolio, motivo_derrota}. Escopadas por empresa. Fonte: RF-045-02 + `backend/models.py:2274` + `backend/crm_routes.py:185-234`. Aplicavel a: UC-CRM02.

- **RN-190**: Tipos de Edital padrao: 8 valores (Aquisicao Equip, Aquisicao Reag+Equip, Aquisicao Reag, Comodato, Locacao, Locacao+Reag, Manutencao, Material Lab). Empresa edita/cria livremente. Fonte: RF-045-02 + `backend/crm_routes.py:186-189`. Aplicavel a: UC-CRM02.

- **RN-191**: Agrupamento Portfolio padrao: 13 valores (Point Of Care, Gasometria, Bioquimica, Coagulacao, ELISA, Hematologia, Imunohematologia, Teste Rapido, Urinalise, Quimioluminescencia, Ion Seletivo, Aglutinacao, Diversos). Fonte: RF-045-02 + `backend/crm_routes.py:190-194`. Aplicavel a: UC-CRM02.

- **RN-192**: Motivos de Derrota padrao: 7 valores (Administrativo, ME/EPP exclusivo, Falha operacional, Nao tem doc, Nao atende espec, Inviavel comercialmente, Nao tem equipamento). Fonte: RF-045-02 + `backend/crm_routes.py:195-199`. Aplicavel a: UC-CRM02, UC-CRM06, UC-CRM07.

- **RN-193**: Decisao de nao-participacao exige motivo (FK motivo_derrota) + justificativa (>=20 chars) + LOG. Move edital para "Monitoramento da Concorrencia" (se marcado) ou remove do pipeline ativo. Fonte: RF-045-01 + UC-CRM06 passos 5-10 + `backend/models.py:EditalDecisao`. Aplicavel a: UC-CRM06.

- **RN-194**: Decisao de perda distingue "Perda Direta" de "Perda apos Contra-Razao" via `teve_contra_razao` (Boolean). Fonte: RF-045 + UC-CRM07 passo 3 + `backend/models.py:2307`. Aplicavel a: UC-CRM07, UC-CRM05.

- **RN-195**: Motivo de perda exige descricao (>=30 chars) + categoria parametrizada + acao recomendada de {Revisar espec, Revisar precificacao, Melhorar doc, Capacitar equipe, Sem acao, Outro} + responsavel. Fonte: UC-CRM07 passos 8-12. Aplicavel a: UC-CRM07.

- **RN-196**: KPIs CRM — "analisados" = stages {em_analise, lead_potencial, fase_propostas, proposta_submetida, espera_resultado, ganho_provisorio, processo_recurso, contra_razao, resultado_definitivo}; "participados" exclui em_analise e lead_potencial; "nao_participados" = monitoramento_concorrencia. Fonte: RF-045-05 + `backend/crm_routes.py:389-395`. Aplicavel a: UC-CRM05.

- **RN-197**: Ticket medio = media(valor_referencia) dos ganhos vs media dos participados. Taxa vitoria = ganhos/participados*100. Fonte: RF-045-05 + `backend/crm_routes.py:400-404`. Aplicavel a: UC-CRM05.

- **RN-198**: Mapa geografico usa coordenadas fixas das 27 UFs (lat/lon das capitais); editais agrupados por UF com contagem por stage. Fonte: RF-045-03 + `backend/crm_routes.py:242-252` (UF_COORDS). Aplicavel a: UC-CRM03.

- **RN-199**: Score logistico e soma ponderada 0-100: Distancia UF 30% + Historico 25% + Frete 25% + Prazo 20%. Classificacao: VIAVEL (>=70), PARCIAL (40-69), INVIAVEL (<40). Fonte: RF-011 + `backend/tools.py:10679-10731`. Aplicavel a: UC-FU03.

- **RN-200**: Registro de resultado (UC-FU01) aceita {vitoria, derrota, cancelado}. Vitoria exige valor_final; Derrota exige valor_final + empresa_vencedora + motivo_derrota (parametrizado); Cancelado exige justificativa textual. Fonte: RF-017 + UC-FU01 passos 8-11. Aplicavel a: UC-FU01.

- **RN-201**: Saldo ARP por item: `saldo_disponivel = quantidade_registrada - consumido_participante - consumido_carona`. Saldo negativo proibido. Fonte: `backend/models.py:1913-1916` + UC-CT06. Aplicavel a: UC-CT06.

- **RN-202**: Entrega status enum {pendente, entregue, atrasado, cancelado}. `data_prevista` obrigatoria; `data_realizada > data_prevista` = atrasada. Fonte: RF-046-03 + `backend/models.py:1749,1756`. Aplicavel a: UC-CT02, UC-CT03.

- **RN-203**: Contrato status enum {vigente, encerrado, rescindido, suspenso}. Aditivos, empenhos e entregas so podem ser criados em contratos `vigente`. Fonte: `backend/models.py:1700`. Aplicavel a: UC-CT01, UC-CT02, UC-CT04, UC-CT07.

#### RNs faltantes

- **RN-204** [FALTANTE]: Pipeline CRM deve validar transicoes permitidas (nao permitir pular de `captado_divulgado` direto para `resultado_definitivo`). Hoje `move_edital_stage` aceita qualquer stage valido. Justificativa: integridade dos KPIs de conversao. Aplicavel a: UC-CRM01.

- **RN-205** [FALTANTE]: Regresso de stage deve exigir autorizacao de gestor + log com motivo. Hoje o retrocesso e livre. Justificativa: impede mascarar indicadores. Aplicavel a: UC-CRM01.

- **RN-206** [FALTANTE]: Gestor e fiscal de um contrato devem ser pessoas diferentes (segregacao). Hoje nao ha check em `ContratoDesignacao`. Justificativa: Lei 14.133/2021 Art. 117 principio de controle dual. Aplicavel a: UC-CT05.

- **RN-207** [FALTANTE]: Aditivo deve ser BLOQUEADO pelo backend quando percentual acumulado ultrapassa 25% (compras/servicos) ou 50% (obras). Hoje apenas sinaliza `pct_consumido`. Justificativa: Art. 125 impoe limite absoluto — exceder gera nulidade. Aplicavel a: UC-CT04.

- **RN-208** [FALTANTE]: Entrega deve exigir `nota_fiscal` obrigatorio — hoje nullable. Justificativa: Lei 14.133/2021 exige comprovante fiscal. Aplicavel a: UC-CT02.

- **RN-209** [FALTANTE]: Nao permitir criar fatura cuja soma cumulativa (nao canceladas) ultrapasse `valor_empenhado`. Hoje calcula saldo apenas na leitura. Justificativa: execucao orcamentaria invalida. Aplicavel a: UC-CT07, UC-CT08.

- **RN-210** [FALTANTE]: Numero de empenho deve seguir padrao `EMPH-AAAA-NNN` ou `AAAANE000NNN`. Hoje e String(100) livre. Justificativa: rastreabilidade cruzada com ERP do orgao. Aplicavel a: UC-CT07, UC-CT08.

- **RN-211** [FALTANTE]: Alerta formal ao gestor quando divergencia em auditoria >= R$1.000 OU >=5% do empenhado. Threshold atual R$0,01 gera ruido. Justificativa: evita poluicao por centavos. Aplicavel a: UC-CT08.

- **RN-212** [FALTANTE]: Contador de prazo em Recursos/Contra-Razoes em elaboracao deve disparar evento automatico movendo card para "atrasado" quando zerar. Aplicavel a: UC-CRM01, UC-RE04, UC-RE05.

- **RN-213** [FALTANTE]: Ata de pregao deve permitir vinculacao 1:N com editais (mesmo vencedor em varios lotes). `AtaConsultada` nao formaliza a relacao. Justificativa: rastreabilidade correta de precos historicos. Aplicavel a: UC-AT02, UC-AT03.

- **RN-214** [FALTANTE]: KPIs do CRM devem incluir "Tempo Medio de Ganho" (lance -> ganho definitivo) conforme RF-045-05 KPI 8. Nao computado hoje. Aplicavel a: UC-CRM05.

- **RN-215** [FALTANTE]: KPIs devem incluir "Indice de Reversao por Recursos" (ganhos via recurso / total participados) conforme RF-045-05 KPI 4. Aplicavel a: UC-CRM05.

- **RN-216** [FALTANTE]: Todo contrato recorrente deve ter >=1 designacao ativa de gestor. Contrato orfao (sem designacao) deveria ser NAO-CONFORME. Justificativa: Art. 117 exige designacao formal desde a assinatura. Aplicavel a: UC-CT01, UC-CT05.

- **RN-217** [FALTANTE]: Mapa geografico (UC-CRM03) deve exibir valor total em R$ por UF (soma `valor_referencia`), alem da contagem. Hoje so agrupa por stage. Justificativa: RF-045-03 criterio 6 — "potencial de receita por regiao". Aplicavel a: UC-CRM03.

---

*Documento gerado em 13/04/2026. Fontes v8: requisitos_completosv7.md (base) + mapeamento de RNs em 5 agents paralelos (Sprint 1 a 5) cobrindo RF-001 a RF-052, casos de uso V2/V3, backend/app.py, backend/tools.py, backend/crm_routes.py, backend/empenho_routes.py, backend/crud_routes.py, backend/models.py e todas as paginas do frontend.*
