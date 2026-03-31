# REQUISITOS REVISADOS — SPRINT 3: PRECIFICACAO E PROPOSTA

**Data:** 05/03/2026
**Fontes consolidadas:**
- PDF "SPRINT PRECO e PROPOSTA - REVISADA" (Documento Tecnico Funcional, 14 paginas)
- PDF "SPRINT PRECO e PROPOSTA - ANOTACOES REUNIAO" (4 paginas)
- Blueprint Visual NotebookLM (6 imagens JPEG srpint31-36)

---

## O que ja esta implementado (Sprints 1 e 2) vs. o que e novo (Sprint 3)

Antes de detalhar os requisitos, e fundamental entender o que **ja existe** no sistema. A Sprint 3 nao parte do zero — ela se apoia em funcionalidades ja construidas nas Sprints anteriores.

### Ja implementado — Sprint 1 (Infraestrutura)
- Cadastro completo da Empresa (dados, documentos, certidoes, responsaveis)
- Parametrizacoes (pesos de score, fontes de editais)
- Interface hibrida Chat + Pages
- Dashboard com metricas reais
- Login/Registro com Google OAuth

### Ja implementado — Sprint 2 (Captacao + Validacao)
- **CaptacaoPage** — busca de editais via PNCP, filtros, calculo de score de aderencia, salvar editais
- **ValidacaoPage** — analise multidimensional (6 scores), decisao GO/NO-GO, resumo IA
- **Portfolio de Produtos** — CRUD completo: nome, NCM, categoria, fabricante, modelo, preco_referencia + especificacoes tecnicas estruturadas + documentos (manuais, fichas, certificados)
- **Precos** — tool_buscar_precos_pncp, tool_historico_precos, tool_recomendar_preco
- **Modelo Proposta** — tabela `propostas` ja existe com status (rascunho/revisao/aprovada/enviada)
- **Modelo PrecoHistorico** — tabela `precos_historicos` com preco_vencedor, nosso_preco, motivo_perda
- **45 tabelas** no banco, **51 tools** no backend, **11 paginas** no frontend

### NOVO na Sprint 3 — Precificacao e Proposta
Tudo que esta neste documento como requisito e **novo ou aprofundado** em relacao ao que ja existe. Os itens que ja existem sao sinalizados com **[JA IMPLEMENTADO]**.

---

---

# PARTE 1 — COMO DEVE SER A PRECIFICACAO E A PROPOSTA

Esta secao descreve o fluxo completo que a Sprint 3 deve entregar: desde a selecao de itens do portfolio ate a submissao da proposta auditada.

---

## 1.1 Visao Geral

O modulo e dividido em dois grandes blocos:

- **Bloco A — Precificacao:** Organizacao por lotes, selecao inteligente de itens, calculo tecnico de volumetria, base de custos com inteligencia tributaria, logica de precificacao em 6 camadas (A-F), estrategia competitiva de lances.
- **Bloco B — Geracao e Auditoria da Proposta:** Motor de geracao automatica, auditoria ANVISA, auditoria documental com fracionamento, descricao tecnica A/B, exportacao PDF/Word.

## 1.2 O Fluxo Macro — 7 Etapas

```
1. Edital → 2. Selecao Inteligente → 3. Calculo Tecnico → 4. Estruturacao de Lance → 5. Geracao da Proposta → 6. Auditoria → 7. Exportacao
```

**Etapa 1 — Edital (Input Inicial) [JA IMPLEMENTADO — Sprint 2]:**
O edital ja e capturado via PNCP na CaptacaoPage, salvo no banco com scores e validado na ValidacaoPage. O que a Sprint 3 adiciona: extrair do edital os lotes, volumetria exigida, valor de referencia e documentacao exigida para alimentar o pipeline de precificacao.

**Etapa 2 — Selecao Inteligente (Match de Portfolio) [NOVO]:**
Um agente de IA cruza os itens do edital com o portfolio cadastrado da empresa. Ele sugere quais produtos atendem a cada lote e destaca os parametros tecnicos obrigatorios (tipo de amostra, volumetria, registro ANVISA, modelo/marca, NCM). **Validacao humana obrigatoria** — a IA sugere, o humano confirma.

Nota: O portfolio de produtos ja existe (Sprint 2) com CRUD completo, specs e documentos. O que e novo e o **agente de match** que cruza portfolio x lotes do edital.

**Etapa 3 — Calculo Tecnico de Volumetria [NOVO]:**
Motor de calculo que determina a quantidade real de kits necessarios:
```
Volume Real Ajustado = Volume do Edital + Repeticoes Amostras + Repeticoes Calibradores + Repeticoes Controles
Quantidade de Kits = Volume Real Ajustado / Rendimento por Kit
Arredondamento: SEMPRE para cima (ceil)
```
Esse calculo e especifico da industria de diagnostico laboratorial e antes era feito manualmente em planilhas.

**Etapa 4 — Estruturacao de Lance em 6 Camadas [NOVO]:**
O preco e construido de baixo para cima em 6 camadas estrategicas (A ate F). Detalhado na secao 1.3.

**Etapa 5 — Geracao da Proposta [PARCIAL — Sprint 3 aprofunda]:**
O tool_gerar_proposta ja existe (Sprint 2), mas e basico — gera texto via IA. A Sprint 3 adiciona: motor de geracao que cruza dados de precificacao com exigencias do edital, templates parametrizaveis, layout automatico conforme orgao, 100% editavel, LOG de alteracoes.

**Etapa 6 — Auditoria ANVISA + Documental [NOVO]:**
Validacao de registros ANVISA (semaforo verde/amarelo/vermelho) + compilacao automatica do dossie documental com fracionamento inteligente (Smart Split).

**Etapa 7 — Exportacao [PARCIAL — Sprint 3 aprofunda]:**
O endpoint /api/propostas/{id}/export ja existe. A Sprint 3 adiciona: dossie completo com todos os anexos ja fracionados, exportacao Word editavel, pacote pronto para upload no portal do orgao.

---

## 1.3 Como Funciona a Precificacao — As 6 Camadas [NOVO]

Toda a logica de precificacao em camadas e **nova**. Hoje o sistema tem apenas tool_buscar_precos_pncp e tool_recomendar_preco (que sugere 5% abaixo da media). A Sprint 3 substitui essa logica simplista por uma piramide de 6 camadas estrategicas.

### Camada A — Base de Calculo (Custo Real)

O custo do item e importado automaticamente do ERP. Pode ser:
- Preco de compra do fornecedor; ou
- Custo de producao (caso o cliente seja fabricante).

**Inteligencia tributaria:**
- Area de cadastro de NCMs com beneficios fiscais.
- Gatilho automatico: identificacao de isencao de ICMS para NCM 3822 (reagentes).
- Parametrizacao tributaria por item.
- Validacao e edicao humana das aliquotas (automacao com controle humano).

### Camada B — Input do Preco Base

O preco de referencia da empresa. Tres opcoes:
1. Preenchimento manual;
2. Upload de tabela de precos;
3. Upload de custo + markup.

Flag para indicar se o Preco BASE sera reutilizavel em outros editais.

### Camada C — Valor de Referencia do Edital (Target Estrategico)

- Se o edital traz valor de referencia: importacao automatica.
- Se nao traz: percentual configuravel sobre tabela de preco BASE.
- Funciona como **target estrategico** da disputa.

### Camada D — Valor Inicial do Lance

Campo obrigatorio. Primeiro lance da disputa:
- Valor absoluto; ou
- Percentual de desconto sobre preco BASE.

### Camada E — Valor Minimo do Lance

Campo obrigatorio. Piso — abaixo disso e prejuizo:
- Valor absoluto; ou
- Desconto maximo aceitavel sobre preco BASE.
- **Sistema bloqueia lances abaixo do minimo.**

### Estrategia Competitiva

- **"Quero ganhar"** — disputa agressiva ate o valor minimo.
- **"Nao ganhei no minimo"** — reposiciona para melhor colocacao apos 1o lugar.
- Simulacao de cenarios antes da disputa.

### Camada F — Historico de Precos (Consultiva)

Nota: tool_historico_precos e tabela precos_historicos **ja existem** (Sprint 2). O que a Sprint 3 adiciona:
- Dashboard visual com grafico de evolucao temporal.
- Filtros por item, por orgao publico, por edital.
- Visualizacao da margem aplicada na data.

### Comodato

- **Sprint 3 (agora):** Processo manual assistido.
- **Roadmap futuro:** Agente de IA para automacao completa.

---

## 1.4 Como Funciona a Proposta

### Motor de Geracao [SPRINT 3 APROFUNDA]

O tool_gerar_proposta ja existe mas e basico (gera texto via IA). A Sprint 3 evolui para:
- Cruzar dados de precificacao (camadas A-F) com exigencias do edital.
- Ajustar layout automaticamente conforme modelo exigido pelo orgao.
- Templates pre-parametrizados ou upload externo.
- Upload de template padrao da empresa.
- **Regra de Ouro: proposta 100% editavel antes da submissao.** LOG de todas as edicoes.

### Alternativas de Entrada

1. **Geracao automatica** — motor gera tudo a partir dos dados.
2. **Upload externo** — proposta ja elaborada externamente.
3. (Avaliar) Upload de template padrao da empresa.

### Descricao Tecnica do Produto — Estrategia A/B [NOVO]

Para cada item, duas opcoes:

**Opcao 1 — Texto do edital:** Copia literal da descricao tecnica exigida. Aderencia total, opcao mais segura.

**Opcao 2 — Texto personalizado:** Descritivo proprio do cliente. Estrategico para produtos parcialmente aderentes. Empresas participam de editais com descricoes mais genericas, alinhadas ao manual do fabricante.

**Mitigacao de risco (Opcao 2):**
- LOG detalhado (usuario, data, hora).
- Versao original do edital salva como backup.
- Destaque visual de que houve alteracao.

---

## 1.5 Como Funciona a Auditoria [NOVO]

### Auditoria ANVISA

Semaforo de 3 cores para registro de cada produto:
- **Verde — Valido** (pronto para uso)
- **Amarelo — Em Processo** (atencao requerida)
- **Vermelho — Vencido** (bloqueio — sistema impede inclusao na proposta)

**Base de consulta:**
- Fase 1: base interna importada.
- Fase futura: consulta direta ao site ANVISA (com autorizacao do cliente).

**LOG Regulatorio imutavel:** prova que na data da consulta o registro estava valido/em processo/vencido.

**Este modulo precisa ter alta confiabilidade — impacta diretamente a confianca do cliente.**

### Auditoria Documental com Fracionamento Inteligente

1. Identificar no edital toda documentacao exigida (Instrucoes de Uso, Registro ANVISA, Manual Tecnico, FISPQ).
2. Validar que todos os documentos foram carregados.
3. Verificar limites de tamanho do portal do orgao.
4. **Smart Split** — fracionar automaticamente PDFs que excedam o limite.
5. Gerar checklist para validacao humana rapida.
6. Exportar pacote completo para submissao.

---

## 1.6 Gestao do Portfolio

### O que ja existe [SPRINT 2]:
- CRUD completo de produtos (nome, NCM, categoria, fabricante, modelo, preco_referencia)
- Especificacoes tecnicas estruturadas (ProdutoEspecificacao)
- Documentos (manuais, fichas, certificados via ProdutoDocumento)

### O que a Sprint 3 adiciona [NOVO]:
- **Campos adicionais por item:** Tipo de amostra, volumetria, procedencia (alem dos ja existentes)
- **Atualizacao automatica via links de fabricante** — rotina periodica que detecta mudancas e atualiza o upload com LOG
- **Selecao inteligente (agente assistido)** — IA sugere itens aderentes ao lote com validacao humana obrigatoria
- **Fotos opcionais** para enriquecimento visual da proposta
- **Link ANVISA** no cadastro — campo opcional com URL do registro no site oficial

---

## 1.7 Exportacao [SPRINT 3 APROFUNDA]

### O que ja existe [SPRINT 2-3]:
- Endpoint GET /api/propostas/{id}/export (PDF/DOCX)

### O que a Sprint 3 adiciona [NOVO]:
- **Dossie completo** — arquivo unico ou pacote organizado com proposta + laudos + registros + anexos
- **Fracionamento** — documentos ja divididos para caber nos limites de upload
- **Dois formatos:** PDF (engessado para seguranca) + Word (editavel para ajustes finos)

---

## 1.8 Rastreabilidade — Escudo de LOGs [NOVO]

Nota: A tabela `auditoria_log` ja existe no banco (Sprint 1), mas registra apenas operacoes CRUD basicas. A Sprint 3 expande para rastreabilidade completa:

- Alteracoes de precos e markups
- Alteracoes de descricoes tecnicas (com versao original salva)
- Sincronizacoes e atualizacoes de portfolio
- Resultados de consultas ANVISA (data + status)
- Substituicoes ou uploads de documentos

Cada registro: usuario, data, hora, acao, valor anterior, valor novo. Imutavel.

---

---

# PARTE 2 — REQUISITOS DE PRECIFICACAO E PROPOSTA

Cada requisito indica se e **NOVO**, **APROFUNDA** algo existente, ou se **JA EXISTE**.

---

## REQ-01 — Organizacao por Lotes [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nao existe no sistema atual |

O sistema deve:
- Cadastrar lotes por edital, organizados por especialidade (Hematologia, Bioquimica etc.).
- Associar parametros tecnicos a cada lote.
- Associar multiplos itens do portfolio a um lote.

Nota: A tabela `editais_itens` ja existe (importa itens do PNCP), mas nao tem conceito de "lotes por especialidade" com associacao ao portfolio.

---

## REQ-02 — Calculo Tecnico de Volumetria [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nenhum calculo de volumetria existe |

Inputs obrigatorios (por item):
- Rendimento do kit no equipamento
- No de repeticoes de amostras
- No de repeticoes de calibradores
- No de repeticoes de controles
- Volume de testes exigido no edital por parametro

Regra de negocio:
```
Volume Real Ajustado = Volume edital + repeticoes amostras + repeticoes calibradores + repeticoes controles
Quantidade de Kits = Volume Real Ajustado / Rendimento por kit
Arredondamento: SEMPRE para cima (ceil)
```

**Criterio de aceite:** Calculo tecnico de kits opera com arredondamento preciso.

---

## REQ-03 — Integracao com ERP — Base de Custos [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nao existe integracao com ERP |

O sistema deve:
- Importar custo unitario do kit do ERP (preco de compra do fornecedor ou custo de producao).
- Campo editavel para validacao humana.

Nota: Hoje o campo `preco_referencia` existe no modelo Produto, mas e preenchido manualmente. A integracao ERP e nova.

**Criterio de aceite:** Integracao de custo base com ERP esta funcional.

---

## REQ-04 — Regras Tributarias NCM [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nao existe logica tributaria |

O sistema deve:
- Parametrizar tributacao por NCM.
- Identificar automaticamente isencao de ICMS para NCM 3822 (reagentes).
- Cadastro de NCMs com beneficios fiscais.
- Alertar sobre isencoes nos produtos do lote.
- Campo editavel para validacao humana das aliquotas.

---

## REQ-05 — Campos Adicionais no Portfolio [APROFUNDA Sprint 2]

| Campo | Valor |
|-------|-------|
| Modulo | Portfolio |
| Status | APROFUNDA — CRUD ja existe, campos novos |

Campos que **ja existem:** nome, NCM, categoria, fabricante, modelo, preco_referencia, specs, documentos.

Campos **novos a adicionar:**
- Tipo de amostra
- Volumetria (rendimento)
- Procedencia
- Fotos (opcional, para enriquecimento da proposta)
- Link ANVISA (campo opcional com URL do registro oficial)

---

## REQ-06 — Atualizacao Automatica do Portfolio via Fabricante [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Portfolio |
| Status | NOVO — nao existe sincronizacao automatica |

Para itens importados de links de fabricante (ex: Wiener):
- Registrar data da ultima atualizacao.
- Rotina periodica (frequencia parametrizavel) para verificar mudancas.
- Se houver alteracao: atualizar upload automaticamente.
- Registrar LOG de cada atualizacao.

---

## REQ-07 — Selecao Inteligente — Agente Assistido [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao / Portfolio |
| Status | NOVO — nao existe agente de match lote x portfolio |

O sistema deve:
- Sugerir itens do portfolio aderentes ao lote do edital.
- Destacar campos tecnicos obrigatorios na proposta.
- **Exigir validacao humana antes de confirmar selecao.**

Nota: tool_calcular_score_aderencia (Sprint 2) calcula score geral de aderencia edital x portfolio. O agente assistido e diferente: faz match item-a-item por lote, nao score geral.

---

## REQ-08 — Input de Preco Base — Camada B [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nao existe conceito de camadas de preco |

Opcoes de input:
1. Preenchimento manual;
2. Upload de tabela de precos;
3. Upload de custo + markup.

Flag para reutilizacao em outros editais.

---

## REQ-09 — Valor de Referencia do Edital — Camada C [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO |

- Se o edital disponibiliza: importar automaticamente.
- Se nao: percentual configuravel sobre preco BASE.
- Funciona como target estrategico.

---

## REQ-10 — Estrutura do Lance — Camadas D e E [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO — nao existe logica de lances |

**Valor Inicial (D):** Obrigatorio. Valor absoluto ou percentual de desconto.
**Valor Minimo (E):** Obrigatorio. Valor absoluto ou percentual maximo de desconto.
**Sistema bloqueia lances abaixo do minimo.**

**Criterio de aceite:** Parametrizacao dos lances (Base ao Minimo) esta ativa.

---

## REQ-11 — Estrategia Competitiva [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO |

O usuario configura:
- "Disputar ate o minimo" — lances agressivos ate Camada E.
- "Nao ganhei, buscar melhor posicao" — reposicionar apos 1o lugar.

O sistema deve:
- Bloquear lance abaixo do minimo.
- Permitir simulacao de cenarios.

---

## REQ-12 — Historico de Precos Visual — Camada F [APROFUNDA Sprint 2]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | APROFUNDA — tool_historico_precos ja existe |

**Ja existe:** tool_historico_precos, tool_buscar_precos_pncp, tabela precos_historicos.

**Novo a adicionar:**
- Dashboard visual com grafico de evolucao temporal (SVG).
- Filtros por item, por orgao, data, margem aplicada.
- Integracao visual na PrecificacaoPage.

---

## REQ-13 — Comodato [NOVO — Fase 1 Manual]

| Campo | Valor |
|-------|-------|
| Modulo | Precificacao |
| Status | NOVO |

- Fase 1 (Sprint 3): processo manual assistido.
- Fase futura (roadmap): agente de IA para calculo automatizado.

---

## REQ-14 — Motor de Geracao da Proposta [APROFUNDA Sprint 2-3]

| Campo | Valor |
|-------|-------|
| Modulo | Proposta |
| Status | APROFUNDA — tool_gerar_proposta ja existe mas e basico |

**Ja existe:** tool_gerar_proposta (gera texto via IA), CRUD de propostas, status 4 estados.

**Novo a adicionar:**
- Cruzar dados de precificacao (camadas A-F) com exigencias do edital.
- Ajuste automatico de layout conforme modelo do orgao.
- Templates pre-parametrizados + upload externo.
- **100% editavel** antes da exportacao.
- LOG de todas as alteracoes.

**Criterio de aceite:** Motor gera proposta automaticamente. Documento e 100% editavel e exportavel.

---

## REQ-15 — Alternativas de Entrada [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Proposta |
| Status | NOVO |

1. Geracao automatica (REQ-14).
2. Upload de proposta externa.
3. (Avaliar) Upload de template padrao da empresa.

---

## REQ-16 — Descricao Tecnica A/B [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Proposta |
| Status | NOVO — nao existe opcao A/B de texto tecnico |

Para cada item:
1. Texto do edital (aderencia total).
2. Texto personalizado (estrategico para parcialmente aderentes).

Se texto proprio:
- LOG (usuario, data, hora).
- Destaque visual de alteracao.
- Versao original salva como backup.

---

## REQ-17 — Auditoria ANVISA [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Auditoria |
| Status | NOVO — nao existe validacao ANVISA |

Semaforo por item: Verde (Valido) / Amarelo (Em Processo) / Vermelho (Vencido — bloqueio).

Consulta: base interna (fase 1) → site ANVISA (fase futura).

LOG imutavel: data, fonte, resultado.

Campo opcional no cadastro: link oficial ANVISA.

**Modulo de alta confiabilidade.**

---

## REQ-18 — Auditoria Documental + Fracionamento [NOVO]

| Campo | Valor |
|-------|-------|
| Modulo | Auditoria |
| Status | NOVO — nao existe compilacao documental automatica |

1. Identificar documentos exigidos no edital.
2. Validar que todos foram carregados.
3. Verificar limites de tamanho do portal.
4. Smart Split — fracionar PDFs grandes automaticamente.
5. Gerar checklist para validacao humana.
6. Exportar pacote completo.

---

## REQ-19 — Exportacao Completa [APROFUNDA Sprint 3]

| Campo | Valor |
|-------|-------|
| Modulo | Exportacao |
| Status | APROFUNDA — export basico ja existe |

**Ja existe:** GET /api/propostas/{id}/export (PDF/DOCX).

**Novo:**
- Dossie completo (proposta + laudos + registros + anexos).
- Fracionamento automatico para limites de upload.
- PDF (engessado) + Word (editavel).

---

## REQ-20 — Rastreabilidade Completa [APROFUNDA Sprint 1]

| Campo | Valor |
|-------|-------|
| Modulo | Transversal |
| Status | APROFUNDA — auditoria_log existe mas e basica |

**Ja existe:** tabela auditoria_log com CRUD basico.

**Novo — expandir para registrar:**
- Alteracoes de preco e markup
- Alteracoes de descricao tecnica (com versao original)
- Atualizacoes de portfolio
- Validacoes ANVISA (data + status)
- Uploads e substituicoes de documentos

Cada registro: usuario, data, hora, acao, valor anterior, valor novo. Imutavel.

**Criterio de aceite:** Escudo de LOG rastreia todas as alteracoes criticas.

---

## Resumo: NOVO vs JA EXISTE

| Requisito | Descricao | Status |
|-----------|-----------|--------|
| REQ-01 | Organizacao por Lotes | NOVO |
| REQ-02 | Calculo Volumetria | NOVO |
| REQ-03 | Integracao ERP | NOVO |
| REQ-04 | Regras Tributarias NCM | NOVO |
| REQ-05 | Campos Portfolio | APROFUNDA Sprint 2 |
| REQ-06 | Sync Fabricante | NOVO |
| REQ-07 | Agente Match Assistido | NOVO |
| REQ-08 | Preco Base (Camada B) | NOVO |
| REQ-09 | Valor Referencia (Camada C) | NOVO |
| REQ-10 | Lances D e E | NOVO |
| REQ-11 | Estrategia Competitiva | NOVO |
| REQ-12 | Historico Visual (Camada F) | APROFUNDA Sprint 2 |
| REQ-13 | Comodato | NOVO (manual) |
| REQ-14 | Motor Proposta | APROFUNDA Sprint 2-3 |
| REQ-15 | Alternativas Entrada | NOVO |
| REQ-16 | Descricao Tecnica A/B | NOVO |
| REQ-17 | Auditoria ANVISA | NOVO |
| REQ-18 | Auditoria Documental | NOVO |
| REQ-19 | Exportacao Completa | APROFUNDA Sprint 3 |
| REQ-20 | Rastreabilidade Completa | APROFUNDA Sprint 1 |

**Total: 13 NOVOS + 5 APROFUNDAM existente + 2 parcialmente existentes**

---

## Criterios de Aceite (Definition of Done)

| # | Criterio | Requisito | Depende de |
|---|----------|-----------|------------|
| 1 | Calculo tecnico de kits com arredondamento preciso | REQ-02 | NOVO |
| 2 | Integracao custo base com ERP funcional | REQ-03 | NOVO |
| 3 | Parametrizacao de lances (Base ao Minimo) ativa | REQ-10 | NOVO |
| 4 | Motor gera proposta automaticamente | REQ-14 | APROFUNDA |
| 5 | Documento 100% editavel e exportavel | REQ-14, REQ-19 | APROFUNDA |
| 6 | Auditoria ANVISA com status correto | REQ-17 | NOVO |
| 7 | Escudo de LOG rastreia alteracoes criticas | REQ-20 | APROFUNDA |

---

## Notas da Reuniao

1. **Referencia ERP Argus/Supra:** Avaliar modulo de proposta do Supra como referencia para o motor.
2. **Portfolio Wiener:** Exemplo de importacao via links de fabricante com verificacao periodica.
3. **Empenhos/pedidos:** Futuro — monitoramento de pedidos e registros (fora desta sprint).
4. **Comodato como agente IA:** Possibilidade futura de agente dedicado para automatizar calculo.
5. **Lances — fluxo explicado:** O usuario informa se quer ganhar. Se o concorrente ultrapassou o minimo, o sistema busca melhor posicao apos 1o lugar.
