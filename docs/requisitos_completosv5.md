# Documento de Requisitos Completos v5 — facilicita.ia

**Versao:** 5.0
**Data:** 24/03/2026
**Base:** requisitos_completosv2.md (v2.0, 2026-02-22) + REQUISITOS REVISADOS SPRINT3 0503.md
**Revisao:** Expansao de RF-039/RF-040/RF-041 (Sprint 3 — Precificacao e Proposta) com 23 requisitos detalhados extraidos dos PDFs e Blueprint Visual JPEG. Atualizacao de status de implementacao dos requisitos de Precificacao (RF-039-xx) + 3 novos requisitos (RF-039-14 a RF-039-16).

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

### RF-009: Mascara de Dados Sensíveis

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
3. Aba Documental (documentos exigidos vs disponíveis)
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
| RF-040-01 | Motor Proposta | PROPOSTA | ⚙️ PARCIAL | JPEG-4 + PDF-REVISADA |
| RF-040-02 | Alternativas Entrada | PROPOSTA | ❌ NAO IMPLEMENTADO | PDF-REVISADA |
| RF-040-03 | Descricao Tecnica A/B | PROPOSTA | ❌ NAO IMPLEMENTADO | JPEG-4 + PDF-REVISADA |
| RF-040-04 | Auditoria ANVISA | PROPOSTA | ❌ NAO IMPLEMENTADO | JPEG-5 + PDF-REVISADA |
| RF-040-05 | Auditoria Documental | PROPOSTA | ❌ NAO IMPLEMENTADO | JPEG-5 + PDF-REVISADA |
| RF-041-01 | Exportacao Completa | SUBMISSAO | ⚙️ PARCIAL | JPEG-6 + PDF-REVISADA |
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

### RF-042: Disputa de Lances

**Pagina Workflow:** 11 (Disputa Lances)
**Texto:** "Para gerar os lances, necessario ter acesso ao portal de lances Publico e privados. Talvez valha a pena permitir que, via nosso portal, o usuario possa se cadastrar e pagar sua modalidade de uso nos portais privados."

**Descricao:**
Monitoramento de pregoes eletronicos e sugestao de lances.

**Criterios de aceite:**
1. Tabela de pregoes do dia: edital, orgao, hora, status (aguardando/andamento/encerrado)
2. Indicadores visuais de status (dot colorido)
3. Stats: vitorias, derrotas, taxa de sucesso
4. Historico de lances: edital, nosso lance, lance vencedor, resultado
5. Botao "Abrir Sala de Lances" (link para portal)
6. (Futuro) Integracao direta com portais de lances

---

### RF-043: Followup — Novas Anexacoes

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial

**Descricao:**
Acompanhamento pos-pregao: aguardar resultado, registrar vitoria/derrota.

**Criterios de aceite:**
1. Tabela de editais aguardando resultado: edital, orgao, dias aguardando, valor proposto
2. Tabela de resultados: edital, resultado (vitoria/derrota/cancelado), valor final, vencedor, motivo
3. Modal para registrar resultado com campos condicionais
4. Analise pos-resultado (motivo de perda, valor do vencedor)

---

### RF-044: Recurso / Contra Razoes

**Pagina Workflow:** 10 (Recurso) — placeholder "xxxxx"

**Descricao:**
Geracao de minutas de recurso administrativo e contra-razoes.

**Criterios de aceite:**
1. Pagina ou secao dedicada (separada de Impugnacao conforme layout pag 1)
2. Formulario: tipo (recurso/contra_razao), motivo, fundamentacao
3. Geracao automatica de texto pela IA
4. Status: rascunho, protocolado, deferido, indeferido
5. Prazo limite visivel

---

### RF-045: CRM — So Desse Processo

**Pagina Workflow:** Layout geral (pagina 1) — "CRM — so desse processo"

**Descricao:**
CRM ativo focado no processo de licitacao (nao um CRM generico).

**Criterios de aceite:**
1. KPIs: Total Leads, Leads Novos, Ganhos no Mes, Pipeline
2. Tabela de leads: edital, orgao, valor, score, status (prospeccao/contato/proposta/negociacao/ganho/perdido)
3. Filtros: busca, status, responsavel
4. Metas por vendedor: meta mensal, realizado, editais ganhos, %
5. Acoes pos-perda: edital, motivo, acao, responsavel, prazo, status
6. Modal de registrar contato: tipo, data, observacoes, proximo passo
7. "O que for definido aqui [na validacao], vai para a tela do CRM" — fluxo automatico

---

### RF-046: Execucao de Contrato

**Pagina Workflow:** Layout geral (pagina 1) — item do fluxo comercial (vermelho, em destaque)

**Descricao:**
Acompanhamento da execucao pos-vitoria: contratos, entregas, notas fiscais.

**Criterios de aceite:**
1. Tabela de contratos: numero, orgao, valor, data inicio/fim, status
2. Detalhe do contrato: entregas previstas vs realizadas
3. Modal de registrar entrega: descricao, quantidade, valor, nota fiscal
4. Indicadores: atrasados, entregues, pendentes
5. Proximos vencimentos

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
| 10 | Recurso | RF-044 |
| 11 | Disputa Lances | RF-042 |
| 12 | (CRM/Execucao) | RF-045, RF-046 |
| — | **Sprint 3: Precificacao** | RF-039-01 a RF-039-16 |
| — | **Sprint 3: Proposta** | RF-040-01 a RF-040-05 |
| — | **Sprint 3: Submissao** | RF-041-01, RF-041-02 |

---

## 8. Resumo Quantitativo

| Categoria | Qtd Requisitos |
|-----------|---------------|
| Fundacao (Empresa, Portfolio, Parametrizacoes) | 18 (RF-001 a RF-018) |
| Fluxo Comercial — Captacao a Impugnacao | 20 (RF-019 a RF-038) |
| **Fluxo Comercial — Sprint 3 Precificacao** | **16 (RF-039-01 a RF-039-16)** |
| **Fluxo Comercial — Sprint 3 Proposta** | **5 (RF-040-01 a RF-040-05)** |
| **Fluxo Comercial — Sprint 3 Submissao** | **2 (RF-041-01 a RF-041-02)** |
| Fluxo Comercial — Disputa a Execucao | 5 (RF-042 a RF-046) |
| Indicadores (Flags a Perdas) | 7 (RF-047 a RF-053) |
| Transversais | 7 (RF-054 a RF-060) |
| **Total RF** | **80** (60 da v2 - 3 substituidos + 23 novos Sprint 3) |
| **Total RNF** | **4** |

---

## 9. Diferenca v4 → v5

| Aspecto | v4 | v5 (este documento) |
|---------|-----|---------------------|
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

## 10. Diferenca v2 → v4 (historico)

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

*Documento gerado em 24/03/2026. Fontes: requisitos_completosv4.md + atualizacao de status de implementacao Sprint 3 Precificacao + 3 novos requisitos (RF-039-14 a RF-039-16).*
