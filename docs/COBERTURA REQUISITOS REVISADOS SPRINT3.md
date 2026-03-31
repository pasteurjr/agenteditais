# COBERTURA — REQUISITOS REVISADOS SPRINT 3 vs requisitos_completosv4.md

**Data:** 05/03/2026
**Objetivo:** Provar textualmente que **cada item** do documento "REQUISITOS REVISADOS SPRINT3 0503.md" esta coberto no "requisitos_completosv4.md".

---

## Metodologia

Para cada requisito (REQ-01 a REQ-20) do documento REQUISITOS REVISADOS SPRINT3, identificamos:
1. O RF correspondente no v4
2. A secao exata onde esta coberto
3. Comparacao textual dos criterios de aceite

---

## Mapeamento Completo REQ → RF

| REQ (Sprint 3) | Descricao | RF no v4 | Status |
|-----------------|-----------|----------|--------|
| REQ-01 | Organizacao por Lotes | RF-039-01 | ✅ COBERTO |
| REQ-02 | Calculo Volumetria | RF-039-02 | ✅ COBERTO |
| REQ-03 | Integracao ERP | RF-039-03 | ✅ COBERTO |
| REQ-04 | Regras Tributarias NCM | RF-039-04 | ✅ COBERTO |
| REQ-05 | Campos Portfolio | RF-039-05 | ✅ COBERTO |
| REQ-06 | Sync Fabricante | RF-039-06 | ✅ COBERTO |
| REQ-07 | Agente Match Assistido | RF-039-07 | ✅ COBERTO |
| REQ-08 | Preco Base (Camada B) | RF-039-08 | ✅ COBERTO |
| REQ-09 | Valor Referencia (Camada C) | RF-039-09 | ✅ COBERTO |
| REQ-10 | Lances D e E | RF-039-10 | ✅ COBERTO |
| REQ-11 | Estrategia Competitiva | RF-039-11 | ✅ COBERTO |
| REQ-12 | Historico Visual (Camada F) | RF-039-12 | ✅ COBERTO |
| REQ-13 | Comodato | RF-039-13 | ✅ COBERTO |
| REQ-14 | Motor Proposta | RF-040-01 | ✅ COBERTO |
| REQ-15 | Alternativas Entrada | RF-040-02 | ✅ COBERTO |
| REQ-16 | Descricao Tecnica A/B | RF-040-03 | ✅ COBERTO |
| REQ-17 | Auditoria ANVISA | RF-040-04 | ✅ COBERTO |
| REQ-18 | Auditoria Documental | RF-040-05 | ✅ COBERTO |
| REQ-19 | Exportacao Completa | RF-041-01 | ✅ COBERTO |
| REQ-20 | Rastreabilidade Completa | RF-041-02 | ✅ COBERTO |

**Resultado: 20/20 requisitos cobertos (100%).**

---

## Prova Textual Detalhada — Requisito a Requisito

---

### REQ-01 → RF-039-01: Organizacao por Lotes

**REQUISITOS REVISADOS diz:**
> "O sistema deve: Cadastrar lotes por edital, organizados por especialidade (Hematologia, Bioquimica etc.). Associar parametros tecnicos a cada lote. Associar multiplos itens do portfolio a um lote."
> Status: NOVO — nao existe no sistema atual.

**requisitos_completosv4.md (RF-039-01) diz:**
> "O sistema deve cadastrar lotes por edital, organizados por especialidade (Hematologia, Bioquimica etc.), associar parametros tecnicos a cada lote, e associar multiplos itens do portfolio a um lote."
> Criterios: CRUD de lotes com especialidade, parametros tecnicos por lote, multiplos itens portfolio, visualizacao organizada.
> Status: ❌ NAO IMPLEMENTADO

**Cobertura:** INTEGRAL. Texto identico. Criterios expandidos com visualizacao por lote. Nota sobre editais_itens preservada. Fonte JPEG-2 identificada.

---

### REQ-02 → RF-039-02: Calculo Tecnico de Volumetria

**REQUISITOS REVISADOS diz:**
> Inputs: rendimento do kit, repeticoes amostras/calibradores/controles, volume do edital.
> Formula: Volume Real Ajustado = Volume edital + repeticoes. Kits = Ajustado / Rendimento. Arredondamento: SEMPRE ceil.
> Criterio: "Calculo tecnico de kits opera com arredondamento preciso."

**requisitos_completosv4.md (RF-039-02) diz:**
> Inputs identicos (5 inputs listados). Formula identica em bloco de codigo. "Arredondamento: SEMPRE para cima (ceil)."
> Adicional: Diagrama JPEG-2 Secao 2.3 descrito (motor funil, 5 inputs, Engine, output caixa dourada).
> Criterio: "Calculo tecnico de kits opera com arredondamento preciso (ceil)."

**Cobertura:** INTEGRAL. Formula identica. Todos os 5 inputs presentes. Criterio de aceite identico. Enriquecido com rastreabilidade ao JPEG.

---

### REQ-03 → RF-039-03: Integracao com ERP

**REQUISITOS REVISADOS diz:**
> "Importar custo unitario do kit do ERP (preco de compra do fornecedor ou custo de producao). Campo editavel para validacao humana."
> Nota: preco_referencia existe mas e manual. Integracao ERP e nova.
> Criterio: "Integracao de custo base com ERP esta funcional."

**requisitos_completosv4.md (RF-039-03) diz:**
> "O sistema deve importar custo unitario do kit do ERP (preco de compra do fornecedor ou custo de producao). Campo editavel para validacao humana."
> Nota identica sobre preco_referencia.
> Criterio: "Integracao de custo base com ERP esta funcional."
> Adicional: referencia ao PDF-REUNIAO (Argus/Supra) e diagrama JPEG-3 Secao 3.1.

**Cobertura:** INTEGRAL. Texto identico. Criterio identico. Enriquecido com fontes adicionais.

---

### REQ-04 → RF-039-04: Regras Tributarias NCM

**REQUISITOS REVISADOS diz:**
> "Parametrizar tributacao por NCM. Identificar automaticamente isencao de ICMS para NCM 3822. Cadastro de NCMs com beneficios fiscais. Alertar sobre isencoes. Campo editavel para validacao humana."

**requisitos_completosv4.md (RF-039-04) diz:**
> Texto identico. 5 criterios de aceite: cadastro NCMs, gatilho NCM 3822, parametrizacao por item, campo editavel, alerta visual.
> Diagrama JPEG-3 Secao 3.1 Stream 2 descrito.

**Cobertura:** INTEGRAL. Todos os 5 pontos presentes. Criterios expandidos em lista numerada.

---

### REQ-05 → RF-039-05: Campos Adicionais no Portfolio

**REQUISITOS REVISADOS diz:**
> Campos existentes: nome, NCM, categoria, fabricante, modelo, preco_referencia, specs, documentos.
> Campos novos: Tipo de amostra, Volumetria (rendimento), Procedencia, Fotos (opcional), Link ANVISA.
> Status: APROFUNDA Sprint 2.

**requisitos_completosv4.md (RF-039-05) diz:**
> Campos existentes listados identicamente. Campos novos identicos (5 itens).
> Status: ⚙️ PARCIAL — CRUD ja existe, campos novos a adicionar.
> Criterios: 4 criterios incluindo upload fotos e link ANVISA clicavel.
> Diagrama JPEG-2 Secao 2.1 com lista de inputs.

**Cobertura:** INTEGRAL. Todos os campos presentes. Status de aprofundamento preservado.

---

### REQ-06 → RF-039-06: Atualizacao Automatica do Portfolio via Fabricante

**REQUISITOS REVISADOS diz:**
> "Registrar data da ultima atualizacao. Rotina periodica (frequencia parametrizavel). Atualizar upload automaticamente se alteracao. Registrar LOG."
> Status: NOVO.

**requisitos_completosv4.md (RF-039-06) diz:**
> Texto identico com 4 pontos. Criterios: URL fabricante, rotina periodica, atualizacao com LOG, frequencia configuravel.
> Diagrama JPEG-2 Secao 2.1: "Fabricante Links" + "Identifica alteracoes → Atualiza automaticamente → Registra LOG."
> Referencia PDF-REUNIAO (Wiener).

**Cobertura:** INTEGRAL. Todos os 4 pontos presentes. Enriquecido com exemplo Wiener e diagrama.

---

### REQ-07 → RF-039-07: Selecao Inteligente — Agente Assistido

**REQUISITOS REVISADOS diz:**
> "Sugerir itens do portfolio aderentes ao lote. Destacar campos tecnicos obrigatorios. Exigir validacao humana."
> Nota: diferente de tool_calcular_score_aderencia (score geral vs match item-a-item).

**requisitos_completosv4.md (RF-039-07) diz:**
> 3 funcionalidades identicas. Nota identica sobre diferenca do score geral.
> 4 criterios incluindo score de aderencia por item sugerido.
> Diagrama JPEG-2 Secao 2.2: puzzle azul+verde, "VALIDACAO HUMANA OBRIGATORIA".

**Cobertura:** INTEGRAL. Funcionalidades identicas. Nota diferenciadora preservada.

---

### REQ-08 → RF-039-08: Input de Preco Base — Camada B

**REQUISITOS REVISADOS diz:**
> 3 opcoes: manual, upload tabela, custo + markup. Flag reutilizacao.

**requisitos_completosv4.md (RF-039-08) diz:**
> 3 opcoes identicas. Flag reutilizacao.
> 4 criterios: 3 modos, flag, parsing tabela, calculo automatico.
> Diagrama JPEG-3 Secao 3.2 Camada B.

**Cobertura:** INTEGRAL. 3 opcoes + flag presentes.

---

### REQ-09 → RF-039-09: Valor de Referencia do Edital — Camada C

**REQUISITOS REVISADOS diz:**
> "Se edital disponibiliza: importar automaticamente. Se nao: percentual configuravel sobre preco BASE. Funciona como target estrategico."

**requisitos_completosv4.md (RF-039-09) diz:**
> 3 pontos identicos. 4 criterios: importacao automatica, calculo percentual, campo configuravel, indicacao visual target.
> Diagrama JPEG-3 Secao 3.2 Camada C topo.

**Cobertura:** INTEGRAL. 3 regras presentes. Criterios expandidos.

---

### REQ-10 → RF-039-10: Estrutura do Lance — Camadas D e E

**REQUISITOS REVISADOS diz:**
> Valor Inicial (D): obrigatorio, absoluto ou %. Valor Minimo (E): obrigatorio, absoluto ou % maximo.
> "Sistema bloqueia lances abaixo do minimo."
> Criterio: "Parametrizacao dos lances (Base ao Minimo) esta ativa."

**requisitos_completosv4.md (RF-039-10) diz:**
> Valor Inicial e Minimo identicos. "Sistema bloqueia lances abaixo do minimo."
> Criterio identico.
> Diagrama JPEG-3 Secao 3.3 com textos D e E.

**Cobertura:** INTEGRAL. Ambas as camadas + bloqueio + criterio presentes.

---

### REQ-11 → RF-039-11: Estrategia Competitiva

**REQUISITOS REVISADOS diz:**
> "Disputar ate o minimo" + "Nao ganhei, buscar melhor posicao". Bloquear abaixo do minimo. Simulacao de cenarios.

**requisitos_completosv4.md (RF-039-11) diz:**
> "Quero ganhar" e "Nao ganhei no minimo" identicos. Bloqueio + simulacao.
> 4 criterios: seletor, bloqueio, simulacao, logica reposicionamento.
> Diagrama JPEG-3 Secao 3.3: escudo + checkmark verde + moeda.
> Referencia PDF-REUNIAO (explicacao de lances).

**Cobertura:** INTEGRAL. Ambas as estrategias + bloqueio + simulacao presentes.

---

### REQ-12 → RF-039-12: Historico de Precos Visual — Camada F

**REQUISITOS REVISADOS diz:**
> Ja existe: tool_historico_precos, tool_buscar_precos_pncp, tabela precos_historicos.
> Novo: dashboard visual SVG, filtros por item/orgao/data/margem, integracao PrecificacaoPage.

**requisitos_completosv4.md (RF-039-12) diz:**
> "Ja existe" identico (3 tools/tabelas).
> "Novo" identico (3 itens).
> 4 criterios: SVG, 6 filtros, margem na data, integracao pagina.
> Diagrama JPEG-4 Secao 4.1 com grafico evolucao e 6 filtros.

**Cobertura:** INTEGRAL. Existente e novo identicos. Filtros expandidos para 6.

---

### REQ-13 → RF-039-13: Comodato

**REQUISITOS REVISADOS diz:**
> "Fase 1 (Sprint 3): processo manual assistido. Fase futura: agente de IA."

**requisitos_completosv4.md (RF-039-13) diz:**
> Fases identicas. 4 criterios: secao comodato, campos equipamento, calculo manual, estrutura para IA.
> Diagrama JPEG-4 Secao 4.1 painel direito com evolucao 2 fases.
> Referencia PDF-REUNIAO (comodato).

**Cobertura:** INTEGRAL. Ambas as fases presentes. Criterios adicionados.

---

### REQ-14 → RF-040-01: Motor de Geracao da Proposta

**REQUISITOS REVISADOS diz:**
> Ja existe: tool_gerar_proposta, CRUD propostas, 4 status.
> Novo: cruzar precificacao x edital, layout orgao, templates, 100% editavel, LOG alteracoes.
> Criterio: "Motor gera proposta automaticamente. Documento 100% editavel e exportavel."

**requisitos_completosv4.md (RF-040-01) diz:**
> "Ja existe" identico. "Novo" com 5 itens identicos.
> 5 criterios: motor cruza dados, layout orgao, upload template, 100% editavel, LOG.
> Diagrama JPEG-4 Secao 4.2: pipeline 3 estagios + "Regra de Ouro" 100% editavel.

**Cobertura:** INTEGRAL. Existente e novo identicos. Criterios expandidos.

---

### REQ-15 → RF-040-02: Alternativas de Entrada

**REQUISITOS REVISADOS diz:**
> 3 alternativas: geracao automatica, upload externo, (avaliar) upload template empresa.

**requisitos_completosv4.md (RF-040-02) diz:**
> 3 alternativas identicas. 4 criterios: geracao, upload pronta, template importavel, fluxo status.

**Cobertura:** INTEGRAL. 3 alternativas presentes. Criterio adicional sobre fluxo de status.

---

### REQ-16 → RF-040-03: Descricao Tecnica A/B

**REQUISITOS REVISADOS diz:**
> Opcao 1: texto do edital (aderencia total). Opcao 2: texto personalizado (estrategico).
> Se texto proprio: LOG, destaque visual, versao original backup.

**requisitos_completosv4.md (RF-040-03) diz:**
> Opcoes A e B identicas. LOG + destaque + backup identicos.
> 5 criterios: seletor A/B, copia literal, campo texto livre com destaque, LOG, backup.
> Diagrama JPEG-4 Secao 4.3: fork A/B + bloco seguranca com cadeado.

**Cobertura:** INTEGRAL. Ambas as opcoes + 3 mitigacoes presentes.

---

### REQ-17 → RF-040-04: Auditoria ANVISA

**REQUISITOS REVISADOS diz:**
> Semaforo: Verde (Valido), Amarelo (Em Processo), Vermelho (Vencido — bloqueio).
> Consulta: base interna (fase 1) → site ANVISA (futuro).
> LOG imutavel. Campo link ANVISA. "Modulo de alta confiabilidade."

**requisitos_completosv4.md (RF-040-04) diz:**
> Semaforo identico (3 cores + significados). Consulta identica (2 fases). LOG imutavel.
> "Modulo de alta confiabilidade — impacta diretamente a confianca do cliente."
> 5 criterios: semaforo, bloqueio vencido, LOG imutavel, base interna, campo link.
> Diagrama JPEG-5 Secao 5.1: painel dark-mode, 3 bolinhas, mecanismo, LOG regulatorio.

**Cobertura:** INTEGRAL. Semaforo + fases + LOG + alta confiabilidade presentes.

---

### REQ-18 → RF-040-05: Auditoria Documental + Fracionamento

**REQUISITOS REVISADOS diz:**
> 6 etapas: identificar docs, validar carregamento, verificar limites, Smart Split, checklist, exportar pacote.

**requisitos_completosv4.md (RF-040-05) diz:**
> 6 etapas identicas numeradas.
> 6 criterios mapeando cada etapa.
> Diagrama JPEG-5 Secao 5.2: pipeline 3 estagios (documentos → dossie → PDFs fracionados).

**Cobertura:** INTEGRAL. 6 etapas identicas.

---

### REQ-19 → RF-041-01: Exportacao Completa

**REQUISITOS REVISADOS diz:**
> Ja existe: GET /api/propostas/{id}/export.
> Novo: dossie completo, fracionamento, PDF + Word.

**requisitos_completosv4.md (RF-041-01) diz:**
> "Ja existe" identico. "Novo" com 3 itens identicos.
> 5 criterios: dossie completo, fracionamento, PDF, Word, pacote organizado.
> Diagrama JPEG-6 Secao 6.2: pasta amarela com PDF vermelho + Word azul.

**Cobertura:** INTEGRAL. Existente e novo identicos.

---

### REQ-20 → RF-041-02: Rastreabilidade Completa

**REQUISITOS REVISADOS diz:**
> Ja existe: auditoria_log com CRUD basico.
> Novo: alteracoes de preco/markup, descricao tecnica, portfolio, ANVISA, uploads.
> Cada registro: usuario, data, hora, acao, valor anterior, valor novo. Imutavel.
> Criterio: "Escudo de LOG rastreia todas as alteracoes criticas."

**requisitos_completosv4.md (RF-041-02) diz:**
> "Ja existe" identico. "Novo" com 5 itens identicos. Formato registro identico. "Imutavel."
> 6 criterios mapeando cada tipo de evento.
> Diagrama JPEG-5/6 Secoes 5.3+6.1: escudo preto, cadeado, aneis concentricos.

**Cobertura:** INTEGRAL. Todos os 5 tipos de eventos + formato + imutabilidade presentes.

---

## Cobertura dos Criterios de Aceite da Sprint 3

O documento REQUISITOS REVISADOS define 7 criterios de aceite (Definition of Done). Todos estao presentes no v4:

| # | Criterio | REQ | RF no v4 | Presente? |
|---|----------|-----|----------|-----------|
| 1 | Calculo tecnico de kits com arredondamento preciso | REQ-02 | RF-039-02 | ✅ Criterio identico |
| 2 | Integracao custo base com ERP funcional | REQ-03 | RF-039-03 | ✅ Criterio identico |
| 3 | Parametrizacao de lances (Base ao Minimo) ativa | REQ-10 | RF-039-10 | ✅ Criterio identico |
| 4 | Motor gera proposta automaticamente | REQ-14 | RF-040-01 | ✅ Criterio identico |
| 5 | Documento 100% editavel e exportavel | REQ-14/19 | RF-040-01/RF-041-01 | ✅ Criterio identico |
| 6 | Auditoria ANVISA com status correto | REQ-17 | RF-040-04 | ✅ Criterio identico |
| 7 | Escudo de LOG rastreia alteracoes criticas | REQ-20 | RF-041-02 | ✅ Criterio identico |

**7/7 criterios cobertos (100%).**

---

## Cobertura de Conteudo da PARTE 1 (Como Deve Ser)

O documento REQUISITOS REVISADOS tem uma PARTE 1 descritiva (secoes 1.1 a 1.8). Verificamos que todo o conteudo descritivo esta coberto nos requisitos do v4:

| Secao PARTE 1 | Conteudo | Coberto por |
|----------------|----------|-------------|
| 1.1 Visao Geral | Bloco A (Precificacao) + Bloco B (Proposta) | RF-039-xx + RF-040-xx |
| 1.2 Fluxo Macro 7 Etapas | Etapas 1-7 | RF-039-01 a RF-041-02 (pipeline completo) |
| 1.3 As 6 Camadas | Camadas A-F | RF-039-03 (A), RF-039-08 (B), RF-039-09 (C), RF-039-10 (D+E), RF-039-12 (F) |
| 1.4 Proposta | Motor + Alternativas + A/B | RF-040-01, RF-040-02, RF-040-03 |
| 1.5 Auditoria | ANVISA + Documental | RF-040-04, RF-040-05 |
| 1.6 Gestao Portfolio | Campos + Sync + Match | RF-039-05, RF-039-06, RF-039-07 |
| 1.7 Exportacao | Dossie + Formatos | RF-041-01 |
| 1.8 Rastreabilidade | Escudo de LOGs | RF-041-02 |

**8/8 secoes cobertas (100%).**

---

## Cobertura das Notas da Reuniao

| Nota | Conteudo | Coberto por |
|------|----------|-------------|
| 1. Referencia ERP Argus/Supra | Avaliar modulo Supra | RF-039-03 (fonte PDF-REUNIAO) |
| 2. Portfolio Wiener | Importacao via links | RF-039-06 (referencia Wiener explicita) |
| 3. Empenhos/pedidos | Futuro — fora desta sprint | Nao coberto (intencionalmente fora de escopo) |
| 4. Comodato como agente IA | Possibilidade futura | RF-039-13 (fases 1 e futura) |
| 5. Lances — fluxo explicado | Quero ganhar / nao ganhei | RF-039-11 (estrategia competitiva) |

**4/4 notas relevantes cobertas. 1 nota fora de escopo (empenhos).**

---

## Resultado Final

| Item | Total | Coberto | % |
|------|-------|---------|---|
| Requisitos (REQ-01 a REQ-20) | 20 | 20 | **100%** |
| Criterios de Aceite | 7 | 7 | **100%** |
| Secoes Parte 1 | 8 | 8 | **100%** |
| Notas Reuniao (relevantes) | 4 | 4 | **100%** |

**CONCLUSAO: O documento requisitos_completosv4.md cobre integralmente todos os requisitos, criterios de aceite, secoes descritivas e notas de reuniao presentes no documento REQUISITOS REVISADOS SPRINT3 0503.md.**

---

*Documento de cobertura gerado em 2026-03-05.*
