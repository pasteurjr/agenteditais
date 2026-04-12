# CASOS DE USO — SPRINT 5: FOLLOW-UP, ATAS, EXECUCAO, CONTRATADO X REALIZADO E CRM DO PROCESSO

**Data:** 08/04/2026
**Versao:** 3.0
**Base:** requisitos_completosv6.md (RF-017, RF-011, RF-035, RF-045, RF-045-01 a RF-045-05, RF-046, RF-046-01 a RF-046-04, RF-051, RF-052) + Lei 14.133/2021 (Arts. 82-86, 117, 124-126) + SPRINT 5 VF (descritivo funcional do cliente) + boas praticas de gestao contratual
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Follow-up, Atas de Pregao, Execucao de Contratos, Contratado x Realizado e CRM do Processo.
**Nota v3.0:** Adicionados 11 novos casos de uso: 7 na nova FASE 5 — CRM DO PROCESSO (UC-CRM01 a UC-CRM07) e 4 na FASE 3 — EXECUCAO (UC-CT07 a UC-CT10), derivados do documento SPRINT 5 VF do cliente. Todos os 15 UCs existentes da V2 mantidos sem alteracao. Total: 26 casos de uso.

---

## INDICE

### FASE 1 — FOLLOW-UP
- [UC-FU01] Registrar Resultado (Vitoria/Derrota)
- [UC-FU02] Configurar Alertas de Prazo
- [UC-FU03] Score Logistico

### FASE 2 — ATAS DE PREGAO
- [UC-AT01] Buscar Atas no PNCP
- [UC-AT02] Extrair Resultados de Ata PDF
- [UC-AT03] Dashboard de Atas Consultadas
- [UC-CT06] Saldo de ARP / Controle de Carona

### FASE 3 — EXECUCAO DE CONTRATOS
- [UC-CT01] Cadastrar Contrato
- [UC-CT02] Registrar Entrega + NF
- [UC-CT03] Acompanhar Cronograma de Entregas
- [UC-CT04] Gestao de Aditivos
- [UC-CT05] Designar Gestor/Fiscal
- [UC-CT07] Gestao de Empenhos *(NOVO V3)*
- [UC-CT08] Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)*
- [UC-CT09] Contratos a Vencer *(NOVO V3)*
- [UC-CT10] KPIs de Execucao *(NOVO V3)*

### FASE 4 — CONTRATADO X REALIZADO
- [UC-CR01] Dashboard Contratado X Realizado
- [UC-CR02] Pedidos em Atraso
- [UC-CR03] Alertas de Vencimento Multi-tier

### FASE 5 — CRM DO PROCESSO *(NOVA V3)*
- [UC-CRM01] Pipeline de Cards do CRM *(NOVO V3)*
- [UC-CRM02] Parametrizacoes do CRM *(NOVO V3)*
- [UC-CRM03] Mapa Geografico de Processos *(NOVO V3)*
- [UC-CRM04] Agenda/Timeline de Etapas *(NOVO V3)*
- [UC-CRM05] KPIs do CRM *(NOVO V3)*
- [UC-CRM06] Registrar Decisao de Nao-Participacao *(NOVO V3)*
- [UC-CRM07] Registrar Motivo de Perda *(NOVO V3)*

---

## RESUMO DE IMPLEMENTACAO

| UC | Nome | Fase | Pagina | Aba / Posicao | Status |
|----|------|------|--------|---------------|--------|
| UC-FU01 | Registrar Resultado | Follow-Up | FollowupPage | Aba "Resultados" | ✅ IMPLEMENTADO |
| UC-FU02 | Configurar Alertas de Prazo | Follow-Up | FollowupPage | Aba "Alertas" | ✅ IMPLEMENTADO |
| UC-FU03 | Score Logistico | Follow-Up | FollowupPage | Stat Card | ✅ IMPLEMENTADO |
| UC-AT01 | Buscar Atas no PNCP | Atas | AtasPage | Aba "Buscar" | ✅ IMPLEMENTADO |
| UC-AT02 | Extrair Resultados de Ata PDF | Atas | AtasPage | Aba "Extrair" | ✅ IMPLEMENTADO |
| UC-AT03 | Dashboard de Atas Consultadas | Atas | AtasPage | Aba "Minhas Atas" | ✅ IMPLEMENTADO |
| UC-CT06 | Saldo ARP / Carona | Atas | AtasPage | Aba "Saldo ARP" | ✅ IMPLEMENTADO |
| UC-CT01 | Cadastrar Contrato | Execucao | ProducaoPage | Aba "Contratos" | ✅ IMPLEMENTADO |
| UC-CT02 | Registrar Entrega + NF | Execucao | ProducaoPage | Aba "Entregas" | ✅ IMPLEMENTADO |
| UC-CT03 | Acompanhar Cronograma | Execucao | ProducaoPage | Aba "Cronograma" | ✅ IMPLEMENTADO |
| UC-CT04 | Gestao de Aditivos | Execucao | ProducaoPage | Aba "Aditivos" | ✅ IMPLEMENTADO |
| UC-CT05 | Designar Gestor/Fiscal | Execucao | ProducaoPage | Aba "Gestor/Fiscal" | ✅ IMPLEMENTADO |
| UC-CT07 | Gestao de Empenhos | Execucao | ProducaoPage | Aba "Empenhos" | ⬜ NAO IMPLEMENTADO |
| UC-CT08 | Auditoria Empenhos x Faturas x Pedidos | Execucao | ProducaoPage | Aba "Empenhos" > Secao Auditoria | ⬜ NAO IMPLEMENTADO |
| UC-CT09 | Contratos a Vencer | Execucao | ProducaoPage | Aba "Contratos a Vencer" | ⬜ NAO IMPLEMENTADO |
| UC-CT10 | KPIs de Execucao | Execucao | ProducaoPage | Secao KPIs | ⬜ NAO IMPLEMENTADO |
| UC-CR01 | Dashboard Contratado x Realizado | C x R | ContratadoRealizadoPage | Secao Dashboard | ✅ IMPLEMENTADO |
| UC-CR02 | Pedidos em Atraso | C x R | ContratadoRealizadoPage | Secao Atrasos | ✅ IMPLEMENTADO |
| UC-CR03 | Alertas Vencimento Multi-tier | C x R | ContratadoRealizadoPage | Secao Vencimentos | ✅ IMPLEMENTADO |
| UC-CRM01 | Pipeline de Cards do CRM | CRM | CRMPage | Secao Pipeline | ⬜ NAO IMPLEMENTADO |
| UC-CRM02 | Parametrizacoes do CRM | CRM | CRMPage | Secao Parametrizacoes | ⬜ NAO IMPLEMENTADO |
| UC-CRM03 | Mapa Geografico de Processos | CRM | CRMPage | Aba "Mapa" | ⬜ NAO IMPLEMENTADO |
| UC-CRM04 | Agenda/Timeline de Etapas | CRM | CRMPage | Aba "Agenda" | ⬜ NAO IMPLEMENTADO |
| UC-CRM05 | KPIs do CRM | CRM | CRMPage | Aba "KPIs" | ⬜ NAO IMPLEMENTADO |
| UC-CRM06 | Registrar Decisao de Nao-Participacao | CRM | CRMPage | Card "Em Analise" | ⬜ NAO IMPLEMENTADO |
| UC-CRM07 | Registrar Motivo de Perda | CRM | CRMPage | Card "Resultados Definitivos" | ⬜ NAO IMPLEMENTADO |

**Totais:** 15 implementados + 0 parciais + 11 nao implementados = **26 casos de uso**

---

# FASE 1 — FOLLOW-UP

---

## [UC-FU01] Registrar Resultado (Vitoria/Derrota)

**RF relacionado:** RF-017, RF-046
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Ao menos um edital possui status "submetido" no banco de dados
3. Proposta foi enviada para o orgao contratante (submissao registrada)

### Pos-condicoes
1. Resultado registrado no banco com tipo (vitoria/derrota/cancelado)
2. Edital atualizado com status final correspondente
3. Concorrente vencedor registrado (derrota) e motivo catalogado
4. Contrato automaticamente sugerido para criacao (vitoria)

### Sequencia de Eventos

1. Usuario acessa FollowupPage (`/app/followup`) via menu lateral "Follow-up"
2. [Cabecalho: "Follow-up de Resultados"] exibe a pagina principal
3. [Secao: Stat Cards] mostra 4 metricas: Pendentes (azul), Vitorias (verde), Derrotas (vermelho), Taxa de Sucesso (amarelo)
4. Na [Aba: "Resultados"], [Card: "Editais Pendentes de Resultado"] lista editais aguardando registro
5. [Tabela: Editais Pendentes] exibe: Edital, Orgao, Data Submissao, Valor Proposta, Acao
6. Usuario clica [Botao: "Registrar"] na coluna Acao do edital desejado
7. [Modal: "Registrar Resultado — {numero}"] abre
8. Usuario seleciona tipo via [Radio: "Vitoria"], [Radio: "Derrota"] ou [Radio: "Cancelado"]
9. **Se Vitoria:** preenche [TextInput: "Valor Final (R$)"]
10. **Se Derrota:** preenche [TextInput: "Valor Final (R$)"], [TextInput: "Empresa Vencedora"], [Select: "Motivo da Derrota"]
11. **Se Cancelado:** preenche [TextArea: "Justificativa do Cancelamento"]
12. Opcionalmente preenche [TextArea: "Observacoes"]
13. Clica [Botao: "Registrar"] (variant primary) no rodape do modal
14. Modal fecha; edital move da tabela Pendentes para [Card: "Resultados Registrados"]
15. [Stat Cards] recalculam: Vitorias, Derrotas, Taxa de Sucesso atualizados

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Aba "Resultados" + Modal

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards — grid 4 colunas] [ref: Passos 3, 15]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)

[Aba: "Resultados"] [Aba: "Alertas"]

[Card: "Editais Pendentes de Resultado"] [ref: Passo 4]
  [Tabela: Editais Pendentes] [ref: Passo 5]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Data Submissao"] — toLocaleDateString
    [Coluna: "Valor Proposta"] — formatado R$
    [Coluna: "Acao"]
      [Botao: "Registrar"] — abre modal [ref: Passo 6]

[Card: "Resultados Registrados"] [ref: Passo 14]
  [Tabela: Resultados]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Resultado"] — badge colorido [ref: Passo 14]
      [Badge: "Vitoria"] (background: #16a34a)
      [Badge: "Derrota"] (background: #dc2626)
      [Badge: "Cancelado"] (background: #6b7280)
    [Coluna: "Valor Final"] — formatado R$
    [Coluna: "Data"] — toLocaleDateString

[Modal: "Registrar Resultado — {numero}"] [ref: Passos 7-13]
  [Radio: "Vitoria"] [ref: Passo 8]
  [Radio: "Derrota"] [ref: Passo 8]
  [Radio: "Cancelado"] [ref: Passo 8]
  [TextInput: "Valor Final (R$)"] — condicional: tipo != "cancelado" [ref: Passos 9, 10]
  [TextInput: "Empresa Vencedora"] — condicional: tipo == "derrota" [ref: Passo 10]
  [Select: "Motivo da Derrota"] — condicional: tipo == "derrota" [ref: Passo 10]
    opcoes: "Preco", "Tecnico", "Documental", "Recurso", "ME/EPP", "Outro"
  [TextArea: "Justificativa do Cancelamento"] — condicional: tipo == "cancelado" [ref: Passo 11]
  [TextArea: "Observacoes"] — sempre visivel, opcional [ref: Passo 12]
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Registrar"] (variant primary) [ref: Passo 13]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Pendentes/Vitorias/Derrotas/Taxa] | 3, 15 |
| [Aba: "Resultados"] | 4 |
| [Card: "Editais Pendentes de Resultado"] | 4 |
| [Tabela: Editais Pendentes] | 5 |
| [Botao: "Registrar"] na tabela | 6 |
| [Modal: "Registrar Resultado"] | 7 |
| [Radio: "Vitoria"/"Derrota"/"Cancelado"] | 8 |
| [TextInput: "Valor Final"] | 9, 10 |
| [TextInput: "Empresa Vencedora"] | 10 |
| [Select: "Motivo da Derrota"] | 10 |
| [TextArea: "Justificativa do Cancelamento"] | 11 |
| [TextArea: "Observacoes"] | 12 |
| [Botao: "Registrar"] no modal | 13 |
| [Card: "Resultados Registrados"] | 14 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-FU02] Configurar Alertas de Prazo

**RF relacionado:** RF-017
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contratos e ARPs cadastrados com datas de vencimento definidas
3. Sistema de notificacoes configurado

### Pos-condicoes
1. Vencimentos proximos exibidos com badges de urgencia consolidados
2. Regras de alerta visiveis ao usuario por tipo de vencimento
3. Usuario informado sobre contratos e ARPs proximos do vencimento

### Sequencia de Eventos

1. Usuario acessa FollowupPage e clica na [Aba: "Alertas"]
2. [Secao: Summary Cards] exibe 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d)
3. [Card: "Proximos Vencimentos"] (icone Bell) carrega dados de contratos e ARPs automaticamente
4. Usuario clica [Botao: "Atualizar"] (variant secondary) para recarregar dados
5. [Tabela: Proximos Vencimentos] exibe: Tipo (badge), Nome, Data, Dias, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul #3b82f6), arp (roxo #8b5cf6), outro (amarelo #f59e0b)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho (<7d), laranja (7-15d), amarelo (15-30d), verde (>30d)
8. [Card: "Regras de Alerta Configuradas"] exibe tabela com regras salvas (30d/15d/7d/1d, Email, Push, Ativo)
9. Se sem vencimentos: [Texto: "Nenhum vencimento nos proximos 90 dias"]
10. Se sem regras: [Texto: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."]

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Aba "Alertas" (2a aba)

#### Layout da Tela

```
[Aba: "Resultados"] [Aba: "Alertas"]

[Secao: Summary Cards — grid 5 colunas] [ref: Passo 2]
  [Card: "Total"] (cor: #3b82f6)
  [Card: "Critico (<7d)"] (cor: #dc2626)
  [Card: "Urgente (7-15d)"] (cor: #f97316)
  [Card: "Atencao (15-30d)"] (cor: #eab308)
  [Card: "Normal (>30d)"] (cor: #16a34a)

[Card: "Proximos Vencimentos"] (icone Bell) [ref: Passo 3]
  [Botao: "Atualizar"] (variant secondary) [ref: Passo 4]
  [Texto: "Nenhum vencimento nos proximos 90 dias"] — se vazio [ref: Passo 9]

  [Tabela: Proximos Vencimentos] [ref: Passo 5]
    [Coluna: "Tipo"] — badge colorido [ref: Passo 6]
      [Badge: "contrato"] (background: #3b82f620, cor: #3b82f6)
      [Badge: "arp"] (background: #8b5cf620, cor: #8b5cf6)
      [Badge: "outro"] (background: #f59e0b20, cor: #f59e0b)
    [Coluna: "Nome"]
    [Coluna: "Data"] — toLocaleDateString
    [Coluna: "Dias"] — "{dias_restantes}d"
    [Coluna: "Urgencia"] — badge colorido [ref: Passo 7]
      [Badge: vermelho] — critico (<7d)
      [Badge: laranja] — urgente (7-15d)
      [Badge: amarelo] — atencao (15-30d)
      [Badge: verde] — normal (>30d)

[Card: "Regras de Alerta Configuradas"] [ref: Passo 8]
  [Texto: "Nenhuma regra configurada..."] — se vazio [ref: Passo 10]
  [Tabela: Regras de Alerta]
    [Coluna: "Tipo"]
    [Coluna: "30d"] — "✅" ou "—"
    [Coluna: "15d"] — "✅" ou "—"
    [Coluna: "7d"] — "✅" ou "—"
    [Coluna: "1d"] — "✅" ou "—"
    [Coluna: "Email"] — "✅" ou "—"
    [Coluna: "Push"] — "✅" ou "—"
    [Coluna: "Ativo"] — "✅" ou "❌"
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Alertas"] | 1 |
| [Summary Cards: Total/Critico/Urgente/Atencao/Normal] | 2 |
| [Card: "Proximos Vencimentos"] | 3 |
| [Botao: "Atualizar"] | 4 |
| [Tabela: Proximos Vencimentos] | 5 |
| [Coluna: "Tipo"] / badges coloridos | 6 |
| [Coluna: "Urgencia"] / badges coloridos | 7 |
| [Card: "Regras de Alerta Configuradas"] | 8 |
| [Tabela: Regras de Alerta] | 8 |
| [Texto: "Nenhum vencimento..."] | 9 |
| [Texto: "Nenhuma regra configurada..."] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-FU03] Score Logistico

**RF relacionado:** RF-011
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Parametros logisticos configurados (distancia, prazo, capacidade)
3. Edital com dados de entrega definidos

### Pos-condicoes
1. Score logistico calculado via API e exibido com valor numerico
2. Componentes do score detalhados (distancia, prazo, capacidade)
3. Subsidio adicional para decisao de participar do certame

### Sequencia de Eventos

1. Usuario acessa FollowupPage — score logistico calculado automaticamente via API (`/api/score-logistico`)
2. [Secao: Stat Cards] exibe card com Score Logistico calculado
3. [Card: "Score Logistico"] exibe valor numerico com descricao dos componentes
4. Componentes avaliados: distancia (entre empresa e orgao), prazo de entrega (viabilidade), capacidade produtiva
5. Usuario interpreta o score ao lado dos demais indicadores da pagina

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Area de Stat Cards — card de Score Logistico

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards] [ref: Passos 2, 3]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)
  [Card: "Score Logistico"] — valor via /api/score-logistico [ref: Passos 1, 3]
    [Texto: valor numerico] — ex: "87" ou "N/A" [ref: Passo 3]
    [Texto: componentes] — distancia, prazo, capacidade [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Score Logistico"] | 2, 3 |
| [Texto: valor numerico] | 3 |
| [Texto: componentes distancia/prazo/capacidade] | 4 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# FASE 2 — ATAS DE PREGAO

---

## [UC-AT01] Buscar Atas no PNCP

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Backend `tool_buscar_atas_pncp` operacional
3. API do PNCP acessivel

### Pos-condicoes
1. Atas encontradas exibidas na tabela de resultados
2. Atas selecionadas salvas via botao "Salvar"
3. Dados disponiveis para extracao (UC-AT02)

### Sequencia de Eventos

1. Usuario acessa AtasPage (`/app/atas`) via menu lateral "Atas"
2. [Titulo: "Atas de Pregao"] exibe a pagina com 4 abas
3. Clica na [Aba: "Buscar"] (1a aba, ativa por padrao)
4. Preenche [TextInput: "Termo de busca (min. 3 caracteres)"] com o termo desejado (ex: "reagentes")
5. Opcionalmente seleciona [Select: "UF"] para filtrar por estado (opcoes: AC a TO, default "Todas")
6. Clica [Botao: "Buscar"] (icone Search) — desabilitado se termo < 3 chars
7. Durante a busca: [Botao: "Buscando..."] (loader) e tabela em carregamento
8. [Tabela: resultados de busca] exibe: Titulo, Orgao, UF, Publicacao, Acoes
9. Na coluna Acoes: [Botao: "Salvar"] (size sm) e [Botao: "Extrair"] (size sm, variant secondary)
10. Usuario clica [Botao: "Salvar"] — ata inserida em `atas_consultadas`
11. Usuario clica [Botao: "Extrair"] — navega para aba "Extrair" com ata pre-carregada (UC-AT02)

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Buscar" (1a aba)

#### Layout da Tela

```
[Titulo: "Atas de Pregao"] (h2, fontSize: 22, fontWeight: 700)

[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Card principal — formulario de busca] [ref: Passos 4-8]
  [TextInput: "Termo de busca (min. 3 caracteres)"] [ref: Passo 4]
    placeholder: "Ex: reagentes, equipamentos..."
  [Select: "UF"] [ref: Passo 5]
    opcoes: "Todas" + AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO
  [Botao: "Buscar"] (icone Search) — desabilitado quando termo < 3 chars [ref: Passo 6]
  [Botao: "Buscando..."] (icone Loader2, animate-spin) — exibido durante busca [ref: Passo 7]

[Tabela: resultados de busca] [ref: Passo 8]
  [Coluna: "Titulo"] (key: titulo)
  [Coluna: "Orgao"] (key: orgao)
  [Coluna: "UF"] (key: uf)
  [Coluna: "Publicacao"] (key: data_publicacao)
  [Coluna: "Acoes"] (key: url_pncp)
    [Botao: "Salvar"] (size: sm) [ref: Passo 10]
    [Botao: "Extrair"] (size: sm, variant: secondary) [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Buscar"] | 3 |
| [TextInput: "Termo de busca"] | 4 |
| [Select: "UF"] | 5 |
| [Botao: "Buscar"] | 6 |
| [Botao: "Buscando..."] (loader) | 7 |
| [Tabela: resultados] | 8 |
| [Botao: "Salvar"] | 10 |
| [Botao: "Extrair"] | 11 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-AT02] Extrair Resultados de Ata PDF

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. PDF da ata disponivel (via download do PNCP ou URL direta)
3. Backend tools `tool_baixar_ata_pncp` e `tool_extrair_ata_pdf` operacionais

### Pos-condicoes
1. Itens da ata extraidos com descricao, vencedor, preco e quantidade
2. Dados disponiveis para importacao na base de precos historicos
3. Concorrentes identificados registrados

### Sequencia de Eventos

1. Usuario clica na [Aba: "Extrair"] da AtasPage (ou e direcionado via [Botao: "Extrair"] da busca)
2. Se veio da busca, [TextInput: "URL da ata (PNCP ou PDF direto)"] ja esta pre-preenchido com URL
3. Usuario escolhe fonte: preenche [TextInput: "URL da ata"] OU preenche [TextArea: "Ou cole o texto da ata aqui"]
4. Clica [Botao: "Extrair Dados"] (icone Download) — desabilitado se nenhum campo preenchido
5. Durante extracao: [Botao: "Extraindo..."] (icone Loader2, animate-spin) exibido
6. Backend processa: baixa PDF, extrai texto via IA
7. [Tabela: "Itens Extraidos ({N})"] exibe resultados com colunas: Descricao, Vencedor, Valor Unit., Qtd
8. Usuario revisa itens extraidos na tabela

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Extrair" (2a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Card principal — formulario de extracao] [ref: Passos 2-5]
  [TextInput: "URL da ata (PNCP ou PDF direto)"] [ref: Passos 2, 3]
    placeholder: "https://pncp.gov.br/..."
  [TextArea: "Ou cole o texto da ata aqui"] [ref: Passo 3]
    placeholder: "Cole o texto completo da ata..."
  [Botao: "Extrair Dados"] (icone Download) — desabilitado se ambos vazios [ref: Passo 4]
  [Botao: "Extraindo..."] (icone Loader2, animate-spin) — exibido durante extracao [ref: Passo 5]

[Tabela: "Itens Extraidos ({N})"] — customizada com HTML [ref: Passos 7, 8]
  [Coluna: "Descricao"]
  [Coluna: "Vencedor"]
  [Coluna: "Valor Unit."] — alinhado a direita
  [Coluna: "Qtd"] — alinhado a direita
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Extrair"] | 1 |
| [TextInput: "URL da ata"] | 2, 3 |
| [TextArea: "Ou cole o texto"] | 3 |
| [Botao: "Extrair Dados"] | 4 |
| [Botao: "Extraindo..."] | 5 |
| [Tabela: "Itens Extraidos"] | 7, 8 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-AT03] Dashboard de Atas Consultadas

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos uma ata salva na tabela `atas_consultadas` (via UC-AT01)

### Pos-condicoes
1. Dashboard exibe visao consolidada de todas as atas consultadas
2. Atas expiradas sinalizadas visualmente para referencia

### Sequencia de Eventos

1. Usuario clica na [Aba: "Minhas Atas"] da AtasPage
2. [Secao: Stat Cards — grid 3] exibe: Total (azul), Vigentes (verde), Vencidas (vermelho)
3. [Tabela: atas salvas] carrega com colunas: Titulo, Orgao, UF, Vigencia
4. [Coluna: "Vigencia"] exibe badge colorido com dias restantes ou vencimento:
   - Vigente: background "#dcfce7", cor "#166534", texto "{dias}d restantes"
   - Vencida: background "#fee2e2", cor "#991b1b", texto "Vencida ha {dias}d"
5. Usuario visualiza suas atas salvas, filtra mentalmente por vigencia e acessa detalhes conforme necessidade

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Minhas Atas" (3a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Secao: Stat Cards — grid 3 colunas] [ref: Passo 2]
  [Card: "Total"] (cor: #3b82f6)
  [Card: "Vigentes"] (cor: #16a34a)
  [Card: "Vencidas"] (cor: #dc2626)

[Tabela: atas salvas] (DataTable) [ref: Passos 3, 4]
  [Coluna: "Titulo"] (key: titulo)
  [Coluna: "Orgao"] (key: orgao)
  [Coluna: "UF"] (key: uf)
  [Coluna: "Vigencia"] (key: data_vigencia_fim, render customizado) [ref: Passo 4]
    [Badge: vigente] — background "#dcfce7", color "#166534", texto "{dias}d restantes"
    [Badge: vencida] — background "#fee2e2", color "#991b1b", texto "Vencida ha {dias}d"
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Minhas Atas"] | 1 |
| [Stat Cards: Total/Vigentes/Vencidas] | 2 |
| [Tabela: atas salvas] | 3 |
| [Coluna: "Vigencia"] / badges | 4 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT06] Saldo de ARP / Controle de Carona

**RF relacionado:** NOVO (Art. 82-86, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos uma ata salva (UC-AT01/AT03)
3. Dados de itens da ARP extraidos com quantidades

### Pos-condicoes
1. Saldo por item da ARP exibido com barras de consumo
2. Limites legais de carona calculados e monitorados
3. Solicitacoes de carona registradas com status

### Sequencia de Eventos

1. Usuario clica na [Aba: "Saldo ARP"] da AtasPage (4a aba)
2. Seleciona ARP em [Select: "Selecione uma Ata"] — carrega dados da ata selecionada
3. [Card: "Saldos por Item"] exibe [Tabela: saldos] com: Item, Qtd Registrada, Consumo Part., Consumo Carona, Saldo, % Consumido
4. [Coluna: "% Consumido"] exibe [Progresso: ProgressBar] com cor dinamica:
   - Verde (#16a34a): pct < 70%
   - Amarelo (#eab308): 70% <= pct < 90%
   - Vermelho (#dc2626): pct >= 90%
5. Na coluna Acao: [Botao: "Carona"] (size sm) — abre modal de solicitacao
6. [Card: "Solicitacoes de Carona"] exibe tabela de caronas com colunas: Orgao, Quantidade, Status, Data
7. [Coluna: "Status"] exibe badges: Aprovada (verde), Recusada (vermelho), Pendente (amarelo)
8. Usuario clica [Botao: "Carona"] — [Modal: "Nova Solicitacao de Carona"] abre
9. Preenche: [TextInput: "Orgao Solicitante"], [TextInput: "CNPJ"], [TextInput: "Quantidade"], [TextArea: "Justificativa"]
10. Clica [Botao: "Solicitar"] — solicitacao registrada
11. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Saldo ARP" (4a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Select: "Selecione uma Ata"] [ref: Passo 2]
  opcao padrao: "Selecione..."
  opcoes dinamicas: minhasAtas

[Card: "Saldos por Item"] [ref: Passos 3, 4, 5]
  [Tabela: saldos] (DataTable)
    [Coluna: "Item"] (key: item_descricao)
    [Coluna: "Qtd Registrada"] (key: quantidade_registrada)
    [Coluna: "Consumo Part."] (key: consumido_participante)
    [Coluna: "Consumo Carona"] (key: consumido_carona)
    [Coluna: "Saldo"] (key: saldo_disponivel)
    [Coluna: "% Consumido"] — render customizado [ref: Passo 4]
      [Progresso: ProgressBar] (width: 80px, height: 8px)
        [Indicador: cor verde] — pct < 70
        [Indicador: cor amarelo] — 70 <= pct < 90
        [Indicador: cor vermelho] — pct >= 90
      [Texto: "{pct}%"]
    [Coluna: "Acao"]
      [Botao: "Carona"] (size: sm) [ref: Passo 5]

[Card: "Solicitacoes de Carona"] [ref: Passos 6, 7]
  [Tabela: caronas] — HTML customizada
    [Coluna: "Orgao"]
    [Coluna: "Quantidade"] — alinhado a direita
    [Coluna: "Status"] — centralizado [ref: Passo 7]
      [Badge: "Aprovada"] (background: #dcfce7, color: #166534)
      [Badge: "Recusada"] (background: #fee2e2, color: #991b1b)
      [Badge: "Pendente"] (background: #fef3c7, color: #92400e)
    [Coluna: "Data"]

[Modal: "Nova Solicitacao de Carona — {item_descricao}"] [ref: Passos 8-11]
  [TextInput: "Orgao Solicitante"] — placeholder "Nome do orgao" [ref: Passo 9]
  [TextInput: "CNPJ"] — placeholder "00.000.000/0001-00" [ref: Passo 9]
  [TextInput: "Quantidade"] — placeholder "0" [ref: Passo 9]
  [TextArea: "Justificativa"] — placeholder "Justificativa da adesao..." [ref: Passo 9]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 11]
  [Botao: "Solicitar"] [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Saldo ARP"] | 1 |
| [Select: "Selecione uma Ata"] | 2 |
| [Card: "Saldos por Item"] | 3 |
| [Tabela: saldos] | 3 |
| [Coluna: "% Consumido"] / ProgressBar | 4 |
| [Botao: "Carona"] | 5 |
| [Card: "Solicitacoes de Carona"] | 6 |
| [Coluna: "Status"] / badges | 7 |
| [Modal: "Nova Solicitacao de Carona"] | 8 |
| campos do modal | 9 |
| [Botao: "Solicitar"] | 10 |
| [Botao: "Cancelar"] | 11 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# FASE 3 — EXECUCAO DE CONTRATOS

---

## [UC-CT01] Cadastrar Contrato

**RF relacionado:** RF-046-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Modelo `Contrato` existe no banco
3. Resultado de vitoria registrado em UC-FU01 (desejavel)

### Pos-condicoes
1. Contrato cadastrado com todos os campos obrigatorios
2. Status inicial "vigente"
3. Entregas e aditivos podem ser cadastrados

### Sequencia de Eventos

1. Usuario acessa ProducaoPage (`/app/producao`) via menu lateral "Execucao"
2. [Titulo: "Execucao de Contratos"] exibe a pagina com 5 abas
3. [Secao: Stat Cards — grid 4] exibe: Total (azul), Vigentes (verde), A Vencer 30d (amarelo), Valor Total (roxo)
4. [Aba: "Contratos"] esta ativa por padrao — [Card com Tabela: "Contratos"] exibe lista
5. [Tabela: Contratos] exibe: Numero, Orgao, Objeto (truncado 50 chars), Valor, Termino, Status, Acao
6. [Coluna: "Status"] exibe badge colorido: vigente (verde), encerrado (neutro), rescindido (vermelho), suspenso (amarelo)
7. [Coluna: "Acao"] exibe [Botao: "Selecionar"] — primary se ja selecionado, secondary caso contrario
8. Usuario clica [Botao: "+ Novo Contrato"] — [Modal: "Novo Contrato"] abre
9. Preenche: [TextInput: "Numero do Contrato"], [TextInput: "Orgao"], [TextArea: "Objeto"], [TextInput: "Valor Total"]
10. Preenche datas: [TextInput: "Inicio"] e [TextInput: "Termino"] (formato "2026-01-01")
11. Clica [Botao: "Criar"] — contrato criado e aparece na tabela
12. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Contratos" (1a aba)

#### Layout da Tela

```
[Titulo: "Execucao de Contratos"] (h2, fontSize: 22, fontWeight: 700)

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
  [Card: "Total"] (icone Package, cor: #3b82f6)
  [Card: "Vigentes"] (icone CheckCircle, cor: #16a34a)
  [Card: "A Vencer (30d)"] (icone Clock, cor: #eab308)
  [Card: "Valor Total"] (icone BarChart2, cor: #8b5cf6)

[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Banner: "Contrato selecionado: {numero} — {orgao}"] — condicional, background: #eff6ff [ref: Passo 7]

[Card: "Contratos"] [ref: Passos 4, 5]
  [Botao: "+ Novo Contrato"] (icone Plus) [ref: Passo 8]

  [Tabela: Contratos] (DataTable) [ref: Passos 5, 6]
    [Coluna: "Numero"] (key: numero_contrato, sortable)
    [Coluna: "Orgao"] (key: orgao, sortable)
    [Coluna: "Objeto"] (key: objeto) — truncado em 50 chars
    [Coluna: "Valor"] (key: valor_total, render: formatCurrency)
    [Coluna: "Termino"] (key: data_fim, render: formatDate)
    [Coluna: "Status"] (key: status) — badge colorido [ref: Passo 6]
      [Badge: "vigente"] (bg: #dcfce7, fg: #166534)
      [Badge: "encerrado"] (bg: #f3f4f6, fg: #374151)
      [Badge: "rescindido"] (bg: #fee2e2, fg: #991b1b)
      [Badge: "suspenso"] (bg: #fef3c7, fg: #92400e)
    [Coluna: "Acao"]
      [Botao: "Selecionar"] (size: sm) [ref: Passo 7]

[Modal: "Novo Contrato"] [ref: Passos 9-12]
  [TextInput: "Numero do Contrato"] — placeholder "CT-2026/001" [ref: Passo 9]
  [TextInput: "Orgao"] [ref: Passo 9]
  [TextArea: "Objeto"] [ref: Passo 9]
  [TextInput: "Valor Total"] — placeholder "0.00" [ref: Passo 9]
  [TextInput: "Inicio"] — placeholder "2026-01-01" [ref: Passo 10]
  [TextInput: "Termino"] — placeholder "2026-12-31" [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Total/Vigentes/A Vencer/Valor Total] | 3 |
| [Aba: "Contratos"] | 4 |
| [Tabela: Contratos] | 5 |
| [Coluna: "Status"] / badges | 6 |
| [Botao: "Selecionar"] | 7 |
| [Botao: "+ Novo Contrato"] | 8 |
| [Modal: "Novo Contrato"] | 9, 10, 11, 12 |
| campos do modal | 9, 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT02] Registrar Entrega + NF

**RF relacionado:** RF-046-03
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato cadastrado e selecionado (UC-CT01)
3. Modelo `ContratoEntrega` com campos completos

### Pos-condicoes
1. Entrega registrada na tabela `contrato_entregas`
2. Status da entrega atualizado (pendente → entregue)
3. Status do contrato recalculado automaticamente

### Sequencia de Eventos

1. Na ProducaoPage, usuario clica [Botao: "Selecionar"] em um contrato — [Banner] confirma selecao
2. Usuario clica na [Aba: "Entregas"] (2a aba)
3. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"] exibido
4. [Card: "Entregas — {numero_contrato}"] exibe lista de entregas do contrato selecionado
5. [Tabela: Entregas] exibe: Descricao, Qtd, Valor, Prevista, Realizada, NF, Status
6. [Coluna: "Status"] exibe badge por estado da entrega
7. Usuario clica [Botao: "+ Nova Entrega"] — [Modal: "Nova Entrega"] abre
8. Preenche: [TextInput: "Descricao"], [TextInput: "Quantidade"], [TextInput: "Valor Unitario"]
9. Preenche datas: [TextInput: "Data Prevista"], [TextInput: "Data Realizada"]
10. Opcionalmente preenche: [TextInput: "Nota Fiscal"], [TextInput: "Numero do Empenho"]
11. Clica [Botao: "Criar"] — entrega registrada e aparece na tabela
12. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Entregas" (2a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Texto: "Selecione um contrato na aba 'Contratos'"] — exibido se nenhum contrato selecionado [ref: Passo 3]

[Card: "Entregas — {numero_contrato}"] [ref: Passo 4]
  [Botao: "+ Nova Entrega"] (icone Plus) [ref: Passo 7]

  [Tabela: Entregas] (DataTable) [ref: Passos 5, 6]
    [Coluna: "Descricao"] (key: descricao)
    [Coluna: "Qtd"] (key: quantidade)
    [Coluna: "Valor"] (key: valor_total, render: formatCurrency)
    [Coluna: "Prevista"] (key: data_prevista, render: formatDate)
    [Coluna: "Realizada"] (key: data_realizada, render: formatDate)
    [Coluna: "NF"] (key: nota_fiscal)
    [Coluna: "Status"] (key: status) — badge colorido [ref: Passo 6]

[Modal: "Nova Entrega"] [ref: Passos 8-12]
  [TextInput: "Descricao"] [ref: Passo 8]
  [TextInput: "Quantidade"] [ref: Passo 8]
  [TextInput: "Valor Unitario"] [ref: Passo 8]
  [TextInput: "Data Prevista"] — placeholder "2026-03-15" [ref: Passo 9]
  [TextInput: "Data Realizada"] — placeholder opcional [ref: Passo 9]
  [TextInput: "Nota Fiscal"] — opcional [ref: Passo 10]
  [TextInput: "Numero do Empenho"] — opcional [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Entregas"] | 2 |
| [Texto: "Selecione um contrato..."] | 3 |
| [Card: "Entregas — {numero}"] | 4 |
| [Tabela: Entregas] | 5 |
| [Coluna: "Status"] / badges | 6 |
| [Botao: "+ Nova Entrega"] | 7 |
| [Modal: "Nova Entrega"] | 8, 9, 10, 11, 12 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT03] Acompanhar Cronograma de Entregas

**RF relacionado:** RF-046-04, RF-046-05
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Entregas cadastradas com `data_prevista` (UC-CT02)

### Pos-condicoes
1. Cronograma visual exibido com status por entrega
2. Entregas atrasadas sinalizadas com destaque vermelho
3. Proximos vencimentos listados

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Cronograma"] (3a aba)
2. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"]
3. [Secao: Stat Cards — grid 4] exibe: Pendentes (amarelo), Entregues (verde), Atrasados (vermelho), Total (azul)
4. Se cronograma ainda carregando: [Loader2 animate-spin] exibido
5. [Card: "Entregas Atrasadas"] (destaque vermelho, condicional) lista entregas em atraso com dias de atraso
6. [Card: "Proximos 7 dias"] (condicional) lista entregas iminentes com dias restantes
7. Usuario acompanha o status visual das entregas e prioriza acoes

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Cronograma" (3a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Texto: "Selecione um contrato..."] — condicional [ref: Passo 2]
[Loader2 animate-spin] — exibido durante carregamento [ref: Passo 4]

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
  [Card: "Pendentes"] (cor: #eab308)
  [Card: "Entregues"] (cor: #16a34a)
  [Card: "Atrasados"] (cor: #dc2626)
  [Card: "Total"] (cor: #3b82f6)

[Card: "Entregas Atrasadas"] — condicional: so exibido se ha atrasados [ref: Passo 5]
  [Texto: "⚠ Entregas Atrasadas"] (color: #dc2626)
  [Lista de itens]
    [Texto: {e.descricao}]
    [Texto: "{e.dias_atraso}d atraso"] (fontWeight: 700, color: #dc2626)

[Card: "Proximos 7 dias"] — condicional: so exibido se ha proximas [ref: Passo 6]
  [Lista de itens]
    [Texto: {e.descricao}]
    [Texto: "{e.dias_restantes}d"] (color: #eab308)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Cronograma"] | 1 |
| [Texto: "Selecione um contrato..."] | 2 |
| [Stat Cards: Pendentes/Entregues/Atrasados/Total] | 3 |
| [Loader2] | 4 |
| [Card: "Entregas Atrasadas"] | 5 |
| [Card: "Proximos 7 dias"] | 6 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT04] Gestao de Aditivos

**RF relacionado:** NOVO (Art. 124-126, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Valor original do contrato registrado

### Pos-condicoes
1. Aditivo registrado na tabela `contrato_aditivos`
2. Valor acumulado calculado e validado contra limites legais (25%)
3. Barra de progresso visual atualizada

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Aditivos"] (4a aba)
2. Se nenhum contrato selecionado: mensagem de selecao exibida
3. [Card: "Resumo de Aditivos"] (condicional) exibe: Valor Original, Limite 25%, Acrescimos, % Consumido
4. [Progresso: ProgressBar] (width: 100%, height: 12px) mostra percentual consumido do limite com cor dinamica:
   - Verde (#16a34a): pct < 50%
   - Amarelo (#eab308): 50% <= pct < 80%
   - Vermelho (#dc2626): pct >= 80%
5. [Card: "Aditivos"] lista aditivos existentes em tabela HTML customizada: Tipo, Data, Valor, Fundamentacao, Status
6. Usuario clica [Botao: "+ Novo Aditivo"] — [Modal: "Novo Aditivo"] abre
7. Seleciona [Select: "Tipo"] — opcoes: acrescimo, supressao, prazo, escopo
8. Preenche [TextInput: "Valor do Aditivo"] (placeholder "0.00")
9. Preenche [TextArea: "Justificativa"]
10. Seleciona [Select: "Fundamentacao Legal"] — opcoes: Art. 124-I, Art. 124-II, Art. 125, Art. 126
11. Clica [Botao: "Criar"] — aditivo registrado e barra de progresso atualizada
12. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Aditivos" (4a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Card: "Resumo de Aditivos"] — condicional [ref: Passos 3, 4]
  [Secao: Grid 4 colunas]
    [Campo: "Valor Original"] — formatCurrency
    [Campo: "Limite 25%"] — formatCurrency
    [Campo: "Acrescimos"] — formatCurrency
    [Campo: "% Consumido"] — "{pct}%"
  [Progresso: ProgressBar] (width: 100%, height: 12px) [ref: Passo 4]
    [Indicador: verde] — pct < 50
    [Indicador: amarelo] — 50 <= pct < 80
    [Indicador: vermelho] — pct >= 80

[Card: "Aditivos"] [ref: Passo 5]
  [Botao: "+ Novo Aditivo"] (icone Plus) [ref: Passo 6]
  [Tabela: aditivos] — HTML customizada
    [Coluna: "Tipo"]
    [Coluna: "Data"] — formatDate
    [Coluna: "Valor"] — alinhado a direita, formatCurrency
    [Coluna: "Fundamentacao"]
    [Coluna: "Status"] — statusBadge

[Modal: "Novo Aditivo"] [ref: Passos 7-12]
  [Select: "Tipo"] [ref: Passo 7]
    opcoes: "acrescimo" (Acrescimo), "supressao" (Supressao), "prazo" (Prazo), "escopo" (Escopo)
  [TextInput: "Valor do Aditivo"] — placeholder "0.00" [ref: Passo 8]
  [TextArea: "Justificativa"] [ref: Passo 9]
  [Select: "Fundamentacao Legal"] [ref: Passo 10]
    opcoes: "" (Selecione...), "Art. 124-I", "Art. 124-II", "Art. 125", "Art. 126"
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Aditivos"] | 1 |
| [Card: "Resumo de Aditivos"] | 3 |
| [Progresso: ProgressBar] | 4 |
| [Card: "Aditivos"] / [Tabela: aditivos] | 5 |
| [Botao: "+ Novo Aditivo"] | 6 |
| [Modal: "Novo Aditivo"] | 7, 8, 9, 10, 11, 12 |
| [Select: "Tipo"] | 7 |
| [TextInput: "Valor do Aditivo"] | 8 |
| [TextArea: "Justificativa"] | 9 |
| [Select: "Fundamentacao Legal"] | 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT05] Designar Gestor/Fiscal

**RF relacionado:** NOVO (Art. 117, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial / Gestor Administrativo)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Dados de responsaveis disponiveis para preenchimento

### Pos-condicoes
1. Gestor e fiscal(is) designados e registrados
2. Portaria de designacao vinculada ao contrato
3. Historico de designacoes disponivel

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Gestor/Fiscal"] (5a aba)
2. Se nenhum contrato selecionado: mensagem de selecao exibida
3. [Secao: Cards de Designacao — grid 3] exibe cards para: Gestor, Fiscal Tecnico, Fiscal Administrativo
4. Cards com designacao ativa mostram: Nome (bold), Cargo, Portaria (condicional), Datas
5. Cards sem designacao mostram: [Texto: "Nao designado"] (italic, cor cinza)
6. [Card: "Todas as Designacoes"] exibe tabela HTML com: Tipo, Nome, Cargo, Portaria, Ativo (✅/❌)
7. Usuario clica [Botao: "+ Nova Designacao"] — [Modal: "Nova Designacao"] abre
8. Seleciona [Select: "Tipo"] — opcoes: gestor, fiscal_tecnico, fiscal_administrativo
9. Preenche: [TextInput: "Nome"], [TextInput: "Cargo"], [TextInput: "Numero da Portaria"]
10. Preenche datas: [TextInput: "Data Inicio"], [TextInput: "Data Fim"]
11. Clica [Botao: "Criar"] — designacao registrada e card correspondente atualizado
12. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Gestor/Fiscal" (5a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Secao: Cards de Designacao — grid 3 colunas] [ref: Passos 3, 4, 5]
  [Card: "Gestor"] [ref: Passo 3]
    [Texto: Nome] (fontSize: 16, fontWeight: 700) — se designado [ref: Passo 4]
    [Texto: Cargo] (color: #6b7280, fontSize: 13) — se designado
    [Texto: "Portaria: {portaria_numero}"] (fontSize: 12) — condicional
    [Texto: "{data_inicio} a {data_fim ou 'vigente'}"] (fontSize: 12)
    [Texto: "Nao designado"] (color: #9ca3af, fontStyle: italic) — se vazio [ref: Passo 5]
  [Card: "Fiscal Tecnico"] — idem estrutura do Gestor [ref: Passo 3]
  [Card: "Fiscal Administrativo"] — idem estrutura do Gestor [ref: Passo 3]

[Card: "Todas as Designacoes"] [ref: Passo 6]
  [Botao: "+ Nova Designacao"] (icone Plus) [ref: Passo 7]
  [Tabela: designacoes] — HTML customizada
    [Coluna: "Tipo"]
    [Coluna: "Nome"]
    [Coluna: "Cargo"]
    [Coluna: "Portaria"]
    [Coluna: "Ativo"] — centralizado, "✅" ou "❌"

[Modal: "Nova Designacao"] [ref: Passos 8-12]
  [Select: "Tipo"] [ref: Passo 8]
    opcoes: "gestor" (Gestor), "fiscal_tecnico" (Fiscal Tecnico), "fiscal_administrativo" (Fiscal Administrativo)
  [TextInput: "Nome"] [ref: Passo 9]
  [TextInput: "Cargo"] [ref: Passo 9]
  [TextInput: "Numero da Portaria"] [ref: Passo 9]
  [TextInput: "Data Inicio"] — placeholder "2026-01-01" [ref: Passo 10]
  [TextInput: "Data Fim"] — placeholder "2026-12-31" [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Gestor/Fiscal"] | 1 |
| [Cards de Designacao] | 3 |
| [Texto: Nome/Cargo/Portaria/Datas] | 4 |
| [Texto: "Nao designado"] | 5 |
| [Card: "Todas as Designacoes"] | 6 |
| [Botao: "+ Nova Designacao"] | 7 |
| [Modal: "Nova Designacao"] | 8, 9, 10, 11, 12 |
| [Select: "Tipo"] | 8 |
| campos TextInput | 9, 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CT07] Gestao de Empenhos *(NOVO V3)*

**RF relacionado:** RF-046-01
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato cadastrado e selecionado (UC-CT01) com status "vigente"
3. Contrato classificado como venda recorrente (consumiveis ao longo do fluxo de execucao)
4. Itens do contrato cadastrados com valores unitarios

### Pos-condicoes
1. Empenho registrado com numero, valor e data
2. Entregas vinculadas ao empenho com notas de entrega
3. Saldo do empenho calculado automaticamente (valor empenhado - somatorio entregas)
4. Alerta gerado para itens sem valor no contrato que consomem alem do previsto (potencial prejuizo)
5. Historico de empenhos disponivel para auditoria

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Empenhos"] (nova aba, 6a posicao)
2. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"] exibido
3. [Card: "Itens do Contrato"] exibe [Tabela: itens] com: Item, Descricao, Qtd Contratada, Valor Unit., Valor Total, Tipo (consumivel/equipamento)
4. [Card: "Empenhos — {numero_contrato}"] exibe lista de empenhos do contrato
5. [Tabela: Empenhos] exibe: Numero Empenho, Data, Valor Empenhado, Valor Entregue, Saldo, Status
6. [Coluna: "Saldo"] exibe valor calculado automaticamente (empenhado - entregue) com cor dinamica:
   - Verde (#16a34a): saldo > 30% do empenhado
   - Amarelo (#eab308): saldo entre 10% e 30%
   - Vermelho (#dc2626): saldo < 10% (necessidade de novo empenho)
7. [Coluna: "Status"] exibe badge: Aberto (azul), Parcial (amarelo), Consumido (verde), Excedido (vermelho)
8. Usuario clica [Botao: "+ Novo Empenho"] — [Modal: "Novo Empenho"] abre
9. Preenche: [TextInput: "Numero do Empenho"], [TextInput: "Valor (R$)"], [TextInput: "Data do Empenho"]
10. Opcionalmente preenche [TextArea: "Observacoes"]
11. Clica [Botao: "Criar"] — empenho registrado e aparece na tabela
12. Usuario clica [Botao: "Detalhes"] em um empenho — [Card Expandido: "Entregas do Empenho {numero}"] abre abaixo
13. [Tabela: Entregas do Empenho] exibe: Data Entrega, Nota de Entrega, Itens, Qtd, Valor, Fatura Vinculada
14. Usuario clica [Botao: "+ Registrar Entrega"] — [Modal: "Nova Entrega contra Empenho"] abre
15. Preenche: [TextInput: "Nota de Entrega"], [TextInput: "Data"], [Select: "Item"], [TextInput: "Quantidade"], [TextInput: "Valor"]
16. Clica [Botao: "Registrar"] — entrega vinculada ao empenho, saldo recalculado
17. [Alerta: "Item sem valor contratual"] (icone AlertTriangle, cor vermelho) exibido condicionalmente ao lado de itens como Calibradores, Controles que geram consumo sem receita — indicando potencial prejuizo ao gestor
18. [Botao: "Cancelar"] fecha qualquer modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Empenhos" (6a aba — nova)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"]

[Texto: "Selecione um contrato na aba 'Contratos'"] — condicional [ref: Passo 2]

[Card: "Itens do Contrato"] [ref: Passo 3]
  [Tabela: itens] (DataTable)
    [Coluna: "Item"] (key: codigo_item)
    [Coluna: "Descricao"] (key: descricao)
    [Coluna: "Qtd Contratada"] (key: quantidade_contratada)
    [Coluna: "Valor Unit."] (key: valor_unitario, render: formatCurrency)
    [Coluna: "Valor Total"] (key: valor_total, render: formatCurrency)
    [Coluna: "Tipo"] (key: tipo) — badge
      [Badge: "consumivel"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "equipamento"] (bg: #f3e8ff, fg: #7c3aed)
    [Alerta: "Sem valor contratual"] — condicional, icone AlertTriangle [ref: Passo 17]

[Card: "Empenhos — {numero_contrato}"] [ref: Passos 4, 5]
  [Botao: "+ Novo Empenho"] (icone Plus) [ref: Passo 8]
  [Tabela: Empenhos] (DataTable) [ref: Passos 5, 6, 7]
    [Coluna: "Numero Empenho"] (key: numero_empenho, sortable)
    [Coluna: "Data"] (key: data_empenho, render: formatDate)
    [Coluna: "Valor Empenhado"] (key: valor_empenhado, render: formatCurrency)
    [Coluna: "Valor Entregue"] (key: valor_entregue, render: formatCurrency)
    [Coluna: "Saldo"] (key: saldo) — cor dinamica [ref: Passo 6]
      [Texto: verde] — saldo > 30%
      [Texto: amarelo] — 10% <= saldo <= 30%
      [Texto: vermelho] — saldo < 10%
    [Coluna: "Status"] (key: status) — badge [ref: Passo 7]
      [Badge: "Aberto"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "Parcial"] (bg: #fef3c7, fg: #92400e)
      [Badge: "Consumido"] (bg: #dcfce7, fg: #166534)
      [Badge: "Excedido"] (bg: #fee2e2, fg: #991b1b)
    [Coluna: "Acao"]
      [Botao: "Detalhes"] (size: sm) [ref: Passo 12]

[Card Expandido: "Entregas do Empenho {numero}"] — condicional [ref: Passos 12, 13]
  [Botao: "+ Registrar Entrega"] (icone Plus) [ref: Passo 14]
  [Tabela: Entregas do Empenho] [ref: Passo 13]
    [Coluna: "Data Entrega"] (render: formatDate)
    [Coluna: "Nota de Entrega"]
    [Coluna: "Itens"]
    [Coluna: "Qtd"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Fatura Vinculada"]

[Modal: "Novo Empenho"] [ref: Passos 8-11]
  [TextInput: "Numero do Empenho"] — placeholder "2026NE000123" [ref: Passo 9]
  [TextInput: "Valor (R$)"] — placeholder "0.00" [ref: Passo 9]
  [TextInput: "Data do Empenho"] — placeholder "2026-04-01" [ref: Passo 9]
  [TextArea: "Observacoes"] — opcional [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Criar"] [ref: Passo 11]

[Modal: "Nova Entrega contra Empenho"] [ref: Passos 14-16]
  [TextInput: "Nota de Entrega"] [ref: Passo 15]
  [TextInput: "Data"] — placeholder "2026-04-15" [ref: Passo 15]
  [Select: "Item"] — opcoes dinamicas: itens do contrato [ref: Passo 15]
  [TextInput: "Quantidade"] [ref: Passo 15]
  [TextInput: "Valor (R$)"] [ref: Passo 15]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Registrar"] [ref: Passo 16]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Empenhos"] | 1 |
| [Texto: "Selecione um contrato..."] | 2 |
| [Card: "Itens do Contrato"] / [Tabela: itens] | 3 |
| [Card: "Empenhos — {numero}"] | 4 |
| [Tabela: Empenhos] | 5 |
| [Coluna: "Saldo"] / cor dinamica | 6 |
| [Coluna: "Status"] / badges | 7 |
| [Botao: "+ Novo Empenho"] | 8 |
| [Modal: "Novo Empenho"] | 9, 10, 11 |
| [Botao: "Detalhes"] | 12 |
| [Card Expandido: "Entregas do Empenho"] | 12, 13 |
| [Botao: "+ Registrar Entrega"] | 14 |
| [Modal: "Nova Entrega contra Empenho"] | 15, 16 |
| [Alerta: "Sem valor contratual"] | 17 |
| [Botao: "Cancelar"] | 18 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CT08] Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)*

**RF relacionado:** RF-046-02
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato selecionado com ao menos um empenho registrado (UC-CT07)
3. Entregas e faturas vinculadas aos empenhos

### Pos-condicoes
1. Relatorio de conciliacao gerado com visao consolidada
2. Divergencias entre empenhos, entregas e faturas identificadas
3. Dados exportaveis para validacao operacional

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, na [Aba: "Empenhos"], usuario clica [Botao: "Auditoria"] (icone FileCheck)
2. [Card: "Auditoria — {numero_contrato}"] exibe secao de conciliacao
3. [Secao: Stat Cards — grid 4] exibe: Total Empenhado (azul), Total Entregue (verde), Total Faturado (roxo), Divergencia (vermelho/verde)
4. [Tabela: Conciliacao por Empenho] exibe: Numero Empenho, Valor Empenhado, Valor Entregue, Valor Faturado, Diferenca, Status
5. [Coluna: "Diferenca"] exibe valor com cor:
   - Verde (#16a34a): diferenca = 0 (conciliado)
   - Amarelo (#eab308): diferenca > 0 e < 10% (toleravel)
   - Vermelho (#dc2626): diferenca >= 10% (requer atencao)
6. [Coluna: "Status"] exibe badge: Conciliado (verde), Divergente (vermelho), Parcial (amarelo)
7. Usuario clica em linha da tabela para expandir detalhamento: lista de entregas e faturas vinculadas ao empenho
8. [Card: "Itens sem Cobertura de Empenho"] (condicional) lista entregas/pedidos que nao possuem empenho correspondente
9. [Botao: "Exportar PDF"] (icone Download) — gera relatorio para impressao
10. [Botao: "Exportar Excel"] (icone FileSpreadsheet) — gera planilha de conciliacao

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Empenhos" > Secao Auditoria

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"]

[Botao: "Auditoria"] (icone FileCheck, variant secondary) [ref: Passo 1]

[Card: "Auditoria — {numero_contrato}"] [ref: Passo 2]

  [Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
    [Card: "Total Empenhado"] (icone Receipt, cor: #3b82f6)
    [Card: "Total Entregue"] (icone Truck, cor: #16a34a)
    [Card: "Total Faturado"] (icone FileText, cor: #8b5cf6)
    [Card: "Divergencia"] (icone AlertTriangle, cor dinamica)

  [Tabela: Conciliacao por Empenho] (DataTable) [ref: Passos 4, 5, 6]
    [Coluna: "Numero Empenho"] (sortable)
    [Coluna: "Valor Empenhado"] (render: formatCurrency)
    [Coluna: "Valor Entregue"] (render: formatCurrency)
    [Coluna: "Valor Faturado"] (render: formatCurrency)
    [Coluna: "Diferenca"] — cor dinamica [ref: Passo 5]
      [Texto: verde] — diferenca = 0
      [Texto: amarelo] — diferenca < 10%
      [Texto: vermelho] — diferenca >= 10%
    [Coluna: "Status"] — badge [ref: Passo 6]
      [Badge: "Conciliado"] (bg: #dcfce7, fg: #166534)
      [Badge: "Divergente"] (bg: #fee2e2, fg: #991b1b)
      [Badge: "Parcial"] (bg: #fef3c7, fg: #92400e)

  [Card: "Itens sem Cobertura de Empenho"] — condicional [ref: Passo 8]
    [Tabela: itens sem empenho]
      [Coluna: "Entrega/Pedido"]
      [Coluna: "Data"]
      [Coluna: "Valor"]
      [Coluna: "Observacao"]

  [Secao: Acoes] [ref: Passos 9, 10]
    [Botao: "Exportar PDF"] (icone Download) [ref: Passo 9]
    [Botao: "Exportar Excel"] (icone FileSpreadsheet) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Auditoria"] | 1 |
| [Card: "Auditoria — {numero}"] | 2 |
| [Stat Cards: Empenhado/Entregue/Faturado/Divergencia] | 3 |
| [Tabela: Conciliacao por Empenho] | 4 |
| [Coluna: "Diferenca"] / cor dinamica | 5 |
| [Coluna: "Status"] / badges | 6 |
| Expansao de linha com detalhamento | 7 |
| [Card: "Itens sem Cobertura de Empenho"] | 8 |
| [Botao: "Exportar PDF"] | 9 |
| [Botao: "Exportar Excel"] | 10 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CT09] Contratos a Vencer *(NOVO V3)*

**RF relacionado:** RF-046-03
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato cadastrado com data de termino definida (UC-CT01)
3. Contratos com datas proximas do vencimento existem no sistema

### Pos-condicoes
1. Contratos a vencer organizados por tier de urgencia (90d, 30d)
2. Contratos marcados como "em tratativas de renovacao" rastreados separadamente
3. Historico de renovacao/encerramento registrado

### Sequencia de Eventos

1. Na ProducaoPage, usuario clica na [Aba: "Contratos a Vencer"] (nova aba, 7a posicao)
2. [Secao: Stat Cards — grid 5] exibe: A Vencer 90d (laranja), A Vencer 30d (vermelho), Em Tratativas (azul), Renovados (verde), Nao Renovados (cinza)
3. [Card: "Contratos a Vencer em 90 dias"] exibe [Tabela] com: Numero, Orgao, Valor, Termino, Dias Restantes
4. [Card: "Contratos a Vencer em 30 dias"] exibe [Tabela] com mesmas colunas, destaque vermelho
5. [Card: "Contratos em Tratativas de Renovacao"] exibe contratos marcados pelo usuario como em negociacao
6. Usuario clica [Botao: "Marcar Tratativa"] em um contrato a vencer — [Modal: "Registrar Tratativa de Renovacao"] abre
7. Preenche: [TextArea: "Observacoes da tratativa"], [TextInput: "Responsavel"], [TextInput: "Previsao de conclusao"]
8. Clica [Botao: "Registrar"] — contrato move para secao "Em Tratativas"
9. [Card: "Contratos Renovados"] exibe contratos cuja renovacao foi confirmada
10. Usuario clica [Botao: "Confirmar Renovacao"] — [Modal: "Renovacao de Contrato"] abre
11. Preenche: [TextInput: "Novo numero de contrato"], [TextInput: "Nova data de termino"], [TextInput: "Novo valor"]
12. Clica [Botao: "Confirmar"] — contrato renovado volta ao status de "vigente" em Contratos em Andamento
13. [Card: "Contratos Nao Renovados"] exibe contratos encerrados sem renovacao
14. Usuario clica [Botao: "Encerrar sem Renovacao"] — [Modal: "Encerrar Contrato"] abre com campo [TextArea: "Motivo do encerramento"]
15. Clica [Botao: "Confirmar Encerramento"] — contrato registrado como nao renovado
16. [Botao: "Cancelar"] fecha qualquer modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Contratos a Vencer" (7a aba — nova)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"] [Aba: "Contratos a Vencer"]

[Secao: Stat Cards — grid 5 colunas] [ref: Passo 2]
  [Card: "A Vencer 90d"] (icone Clock, cor: #f97316)
  [Card: "A Vencer 30d"] (icone AlertTriangle, cor: #dc2626)
  [Card: "Em Tratativas"] (icone Handshake, cor: #3b82f6)
  [Card: "Renovados"] (icone CheckCircle, cor: #16a34a)
  [Card: "Nao Renovados"] (icone XCircle, cor: #6b7280)

[Card: "Contratos a Vencer em 90 dias"] [ref: Passo 3]
  [Tabela] (DataTable)
    [Coluna: "Numero"] (sortable)
    [Coluna: "Orgao"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Termino"] (render: formatDate)
    [Coluna: "Dias Restantes"] — "{dias}d" (fontWeight: 600, cor: #f97316)
    [Coluna: "Acao"]
      [Botao: "Marcar Tratativa"] (size: sm) [ref: Passo 6]

[Card: "Contratos a Vencer em 30 dias"] [ref: Passo 4]
  [Tabela] (DataTable) — mesmas colunas, header com destaque vermelho
    [Coluna: "Dias Restantes"] — cor: #dc2626
    [Coluna: "Acao"]
      [Botao: "Marcar Tratativa"] (size: sm)

[Card: "Contratos em Tratativas de Renovacao"] [ref: Passo 5]
  [Tabela] (DataTable)
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Responsavel"]
    [Coluna: "Previsao"]
    [Coluna: "Acao"]
      [Botao: "Confirmar Renovacao"] (size: sm, variant: primary) [ref: Passo 10]
      [Botao: "Encerrar"] (size: sm, variant: secondary) [ref: Passo 14]

[Card: "Contratos Renovados"] [ref: Passo 9]
  [Tabela] — Numero Original, Novo Contrato, Orgao, Novo Termino

[Card: "Contratos Nao Renovados"] [ref: Passo 13]
  [Tabela] — Numero, Orgao, Motivo, Data Encerramento

[Modal: "Registrar Tratativa de Renovacao"] [ref: Passos 6-8]
  [TextArea: "Observacoes da tratativa"] [ref: Passo 7]
  [TextInput: "Responsavel"] [ref: Passo 7]
  [TextInput: "Previsao de conclusao"] — placeholder "2026-06-30" [ref: Passo 7]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Registrar"] [ref: Passo 8]

[Modal: "Renovacao de Contrato"] [ref: Passos 10-12]
  [TextInput: "Novo numero de contrato"] [ref: Passo 11]
  [TextInput: "Nova data de termino"] [ref: Passo 11]
  [TextInput: "Novo valor (R$)"] [ref: Passo 11]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Confirmar"] [ref: Passo 12]

[Modal: "Encerrar Contrato"] [ref: Passos 14-15]
  [TextArea: "Motivo do encerramento"] [ref: Passo 14]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Confirmar Encerramento"] [ref: Passo 15]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Contratos a Vencer"] | 1 |
| [Stat Cards: 90d/30d/Tratativas/Renovados/Nao Renovados] | 2 |
| [Card: "Contratos a Vencer em 90 dias"] | 3 |
| [Card: "Contratos a Vencer em 30 dias"] | 4 |
| [Card: "Contratos em Tratativas de Renovacao"] | 5 |
| [Botao: "Marcar Tratativa"] | 6 |
| [Modal: "Registrar Tratativa de Renovacao"] | 7, 8 |
| [Card: "Contratos Renovados"] | 9 |
| [Botao: "Confirmar Renovacao"] | 10 |
| [Modal: "Renovacao de Contrato"] | 11, 12 |
| [Card: "Contratos Nao Renovados"] | 13 |
| [Botao: "Encerrar sem Renovacao"] | 14 |
| [Modal: "Encerrar Contrato"] | 14, 15 |
| [Botao: "Cancelar"] | 16 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CT10] KPIs de Execucao *(NOVO V3)*

**RF relacionado:** RF-046-04
**Ator:** Usuario (Gestor / Diretor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contratos cadastrados com dados de status e datas (UC-CT01)
3. Dados de vencimento e renovacao disponiveis (UC-CT09)

### Pos-condicoes
1. KPIs de execucao calculados e exibidos em stat cards
2. Filtros por periodo aplicados ao calculo
3. Drill-down disponivel em cada KPI para detalhamento

### Sequencia de Eventos

1. Na ProducaoPage, usuario visualiza a [Secao: "KPIs de Execucao"] posicionada no topo da pagina (acima das abas) ou como aba dedicada "KPIs"
2. [Secao: Stat Cards — grid 3x2] exibe 6 metricas principais:
   - Contratos Ativos / Mes (icone TrendingUp, cor azul)
   - Contratos Ativos Total (icone Package, cor azul)
   - Contratos a Vencer 90d (icone Clock, cor laranja)
   - Contratos a Vencer 30d (icone AlertTriangle, cor vermelho)
   - Contratos em Tratativas (icone Handshake, cor amarelo)
   - Contratos Renovados (icone RefreshCw, cor verde)
3. [Select: "Periodo"] permite filtrar: Ultimo mes, Ultimos 3 meses, Ultimos 6 meses, Ultimos 12 meses, Tudo
4. Stat cards recalculam ao alterar periodo
5. Usuario clica em um stat card — [Card Expandido] exibe tabela com contratos correspondentes ao KPI clicado
6. [Secao: KPIs Adicionais] exibe: Contratos Encerrados Renovados (verde), Contratos Nao Renovados / Candidatos Novo Edital (cinza), Contratos Totalmente Encerrados (vermelho)
7. Cada KPI adicional possui link para a lista de contratos correspondente

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Secao KPIs (topo ou aba dedicada)

#### Layout da Tela

```
[Secao: "KPIs de Execucao"] [ref: Passo 1]

  [Select: "Periodo"] [ref: Passos 3, 4]
    opcoes: "1m" (Ultimo mes), "3m" (3 meses), "6m" (6 meses), "12m" (12 meses), "tudo" (Tudo)

  [Secao: Stat Cards — grid 3x2] [ref: Passo 2]
    [Card: "Ativos / Mes"] (icone TrendingUp, cor: #3b82f6) — clicavel [ref: Passo 5]
    [Card: "Ativos Total"] (icone Package, cor: #3b82f6) — clicavel
    [Card: "A Vencer 90d"] (icone Clock, cor: #f97316) — clicavel
    [Card: "A Vencer 30d"] (icone AlertTriangle, cor: #dc2626) — clicavel
    [Card: "Em Tratativas"] (icone Handshake, cor: #eab308) — clicavel
    [Card: "Renovados"] (icone RefreshCw, cor: #16a34a) — clicavel

  [Card Expandido: "{KPI selecionado}"] — condicional [ref: Passo 5]
    [Tabela: Contratos do KPI]
      [Coluna: "Numero"]
      [Coluna: "Orgao"]
      [Coluna: "Valor"] (render: formatCurrency)
      [Coluna: "Status"]
      [Coluna: "Termino"] (render: formatDate)

  [Secao: KPIs Adicionais — grid 3 colunas] [ref: Passo 6]
    [Card: "Encerrados Renovados"] (cor: #16a34a) — link para lista [ref: Passo 7]
    [Card: "Candidatos Novo Edital"] (cor: #6b7280) — link para lista
    [Card: "Totalmente Encerrados"] (cor: #dc2626) — link para lista
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Secao: "KPIs de Execucao"] | 1 |
| [Stat Cards: 6 metricas] | 2 |
| [Select: "Periodo"] | 3, 4 |
| [Card Expandido com tabela] | 5 |
| [Secao: KPIs Adicionais] | 6 |
| Links para listas de contratos | 7 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

# FASE 4 — CONTRATADO X REALIZADO

---

## [UC-CR01] Dashboard Contratado X Realizado

**RF relacionado:** RF-051
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato cadastrado com entregas (UC-CT01 + UC-CT02)
3. Endpoint GET /api/dashboard/contratado-realizado implementado

### Pos-condicoes
1. Dashboard exibe comparativo visual de todos os contratos
2. Indicadores de desvio calculados e sinalizados
3. Saude do portfolio avaliada

### Sequencia de Eventos

1. Usuario acessa ContratadoRealizadoPage (`/app/contratado-realizado`) via menu
2. [Cabecalho: "Contratado X Realizado"] com paragrafo "Dashboard, pedidos em atraso e vencimentos"
3. [Botao: "Enviar ao Chat"] e [Botao: refresh (icone RefreshCw)] disponiveis no header direito
4. [Card: "Dashboard Contratado x Realizado"] (icone BarChart2) e a secao principal
5. [Secao: Filtros sticky] permite selecionar: [Select: "Periodo"] e [TextInput: "Orgao"]
6. Se carregando: [Loader2 animate-spin] + "Carregando dashboard..." exibidos
7. [Secao: Stat Cards] exibe: Total Contratado, Total Realizado, Variacao %, Saude Portfolio
8. [Card: "Saude Portfolio"] exibe badge: Saudavel (verde), Atencao (amarelo), Critico (vermelho)
9. [Tabela: Contratos] exibe: Contrato, Orgao, Contratado R$, Realizado R$, Variacao %, Status
10. [Coluna: "Variacao %"] exibe badge colorido com icone TrendingUp/TrendingDown
11. [Linha de Totais] exibe: Total Contratado, Total Realizado, Var: {pct}%
12. Usuario ajusta filtro de periodo em [Select: "Periodo"] — dashboard recalcula automaticamente

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 1 — Dashboard

#### Layout da Tela

```
[Cabecalho da Pagina] (classe "page-header") [ref: Passo 2]
  [Icone: BarChart2 (24px)]
  [Titulo h1: "Contratado X Realizado"]
  [Texto p: "Dashboard, pedidos em atraso e vencimentos"]
  [Botao: "Enviar ao Chat"] (btn btn-secondary) [ref: Passo 3]
  [Botao: refresh] (icone RefreshCw, btn btn-secondary) [ref: Passo 3]

[Card: "Dashboard Contratado x Realizado"] (icone BarChart2) [ref: Passo 4]

  [Secao: Filtros sticky] [ref: Passo 5]
    [Select: "Periodo"] [ref: Passos 5, 12]
      opcoes: "1m" (Ultimo mes), "3m" (Ultimos 3 meses), "6m" (Ultimos 6 meses), "12m" (Ultimos 12 meses), "tudo" (Tudo)
    [TextInput: "Orgao"] — placeholder "Filtrar por orgao..." [ref: Passo 5]

  [Loader2 animate-spin + "Carregando dashboard..."] — condicional [ref: Passo 6]
  [Alerta de Erro] (icone AlertTriangle) — condicional

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 7]
    [Card: "Total Contratado"] (fontSize: 22, fontWeight: 700)
    [Card: "Total Realizado"] (fontSize: 22, fontWeight: 700)
    [Card: "Variacao %"] (icone TrendingUp/TrendingDown, cor verde se <= 0, vermelho se > 0)
    [Card: "Saude Portfolio"] (icone Shield) [ref: Passo 8]
      [Badge: "Saudavel"] (bg: #bbf7d0, text: #16a34a)
      [Badge: "Atencao"] (bg: #fef08a, text: #ca8a04)
      [Badge: "Critico"] (bg: #fecaca, text: #dc2626)

  [Tabela: Contratos] (DataTable) [ref: Passos 9, 10]
    [Coluna: "Contrato"] (key: numero, sortable)
    [Coluna: "Orgao"] (key: orgao, sortable)
    [Coluna: "Contratado (R$)"] (key: valor_contratado, render: formatCurrency)
    [Coluna: "Realizado (R$)"] (key: valor_realizado, render: formatCurrency)
    [Coluna: "Variacao %"] (key: variacao_pct, sortable) [ref: Passo 10]
      [Badge: verde] (status-badge-success) — <= 5%
      [Badge: amarelo] (status-badge-warning) — > 5% e <= 15%
      [Badge: vermelho] (status-badge-danger) — > 15%
      [Icone: TrendingUp / TrendingDown]
    [Coluna: "Status"] (key: status) — statusBadge

  [Linha de Totais] [ref: Passo 11]
    [Texto: "Total Contratado: {formatCurrency}"]
    [Texto: "Total Realizado: {formatCurrency}"]
    [Texto: "Var: {pct}%"] (verde se <= 0, vermelho se > 0)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Cabecalho da Pagina] | 2 |
| [Botao: "Enviar ao Chat"] / [Botao: refresh] | 3 |
| [Card: "Dashboard Contratado x Realizado"] | 4 |
| [Select: "Periodo"] / [TextInput: "Orgao"] | 5, 12 |
| [Loader2] | 6 |
| [Stat Cards] | 7 |
| [Card: "Saude Portfolio"] / badges | 8 |
| [Tabela: Contratos] | 9 |
| [Coluna: "Variacao %"] / badges | 10 |
| [Linha de Totais] | 11 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CR02] Pedidos em Atraso

**RF relacionado:** RF-052
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato com entregas atrasadas

### Pos-condicoes
1. Entregas atrasadas listadas com severidade visual
2. Stat cards de atraso calculados
3. Acoes de contato disponiveis

### Sequencia de Eventos

1. Na ContratadoRealizadoPage, usuario localiza a [Secao: "Pedidos em Atraso"] (Card abaixo do Dashboard)
2. [Card: "Pedidos em Atraso"] (icone AlertTriangle) exibe a secao
3. [Secao: Stat Cards] exibe: Total Atrasados, Alta Severidade (>30d), Valor em Risco — todos em vermelho
4. Se sem atrasos: [Texto: "Nenhum pedido em atraso"] (textAlign: center, color: #64748b)
5. Entregas agrupadas por severidade em tabelas separadas com headers coloridos:
   - [Tabela: CRITICO] (header bg: #fecaca, color: #991b1b) — alta severidade
   - [Tabela: ATENCAO] (header bg: #fef08a, color: #92400e) — media severidade
   - [Tabela: OBSERVACAO] (header bg: #fed7aa, color: #9a3412) — baixa severidade
6. Cada tabela exibe: Contrato, Orgao, Entrega, Data Prevista, Dias Atraso, Valor
7. [Coluna: "Dias Atraso"] exibe "{dias_atraso}d" em vermelho bold

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 2 — Pedidos em Atraso (abaixo do Dashboard)

#### Layout da Tela

```
[Card: "Pedidos em Atraso"] (icone AlertTriangle) [ref: Passo 2]

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 3]
    [Card: "Total Atrasados"] (fontSize: 24, color: #dc2626, bg: #fef2f2, border: #fecaca)
    [Card: "Alta Severidade (>30d)"] (fontSize: 24, color: #dc2626, bg: #fef2f2)
    [Card: "Valor em Risco"] (fontSize: 20, color: #dc2626, bg: #fef2f2)

  [Texto: "Nenhum pedido em atraso"] — se sem atrasos [ref: Passo 4]

  [Tabela: CRITICO ({N})] [ref: Passo 5]
    [Header: "CRITICO ({N})"] (bg: #fecaca, color: #991b1b, fontWeight: 700)
    [Coluna: "Contrato"] (key: contrato_numero)
    [Coluna: "Orgao"] (key: orgao)
    [Coluna: "Entrega"] (key: entrega)
    [Coluna: "Data Prevista"] (key: data_prevista, render: formatDate)
    [Coluna: "Dias Atraso"] (key: dias_atraso) — "{dias}d" [ref: Passo 7]
      (color: #dc2626, fontWeight: 600)
    [Coluna: "Valor"] (key: valor, render: formatCurrency)

  [Tabela: ATENCAO ({N})] [ref: Passo 5]
    [Header: "ATENCAO ({N})"] (bg: #fef08a, color: #92400e, fontWeight: 700)
    [mesmas colunas do CRITICO]

  [Tabela: OBSERVACAO ({N})] [ref: Passo 5]
    [Header: "OBSERVACAO ({N})"] (bg: #fed7aa, color: #9a3412, fontWeight: 700)
    [mesmas colunas do CRITICO]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Pedidos em Atraso"] | 2 |
| [Stat Cards: Total/Alta Sev./Valor] | 3 |
| [Texto: "Nenhum pedido em atraso"] | 4 |
| [Tabelas CRITICO/ATENCAO/OBSERVACAO] | 5, 6 |
| [Coluna: "Dias Atraso"] | 7 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-CR03] Alertas de Vencimento Multi-tier

**RF relacionado:** NOVO (boas praticas de gestao contratual)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contratos, ARPs e entregas cadastrados com datas de vencimento

### Pos-condicoes
1. Vencimentos proximos de todas as categorias listados consolidadamente
2. Alertas multi-tier exibidos com niveis de urgencia

### Sequencia de Eventos

1. Na ContratadoRealizadoPage, usuario localiza a [Secao: "Proximos Vencimentos"] (Card abaixo de Atrasos)
2. [Card: "Proximos Vencimentos"] (icone Calendar) exibe a secao
3. Se carregando: [Loader2 animate-spin + "Carregando alertas..."] exibidos
4. [Secao: Stat Cards — grid auto-fit] exibe contadores por urgencia: Vermelho (<7d), Laranja (7-15d), Amarelo (15-30d), Verde (>30d)
5. [Tabela: Vencimentos] exibe: Tipo (badge), Nome, Data Vencimento, Dias Restantes, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul), arp (roxo), entrega (laranja)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho, laranja, amarelo, verde
8. Se sem vencimentos proximos: [Texto: "Nenhum vencimento proximo"]

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 3 — Proximos Vencimentos (abaixo de Atrasos)

#### Layout da Tela

```
[Card: "Proximos Vencimentos"] (icone Calendar) [ref: Passo 2]

  [Loader2 animate-spin + "Carregando alertas..."] — condicional [ref: Passo 3]
  [Alerta de Erro] (icone AlertTriangle) — condicional

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 4]
    [Card: "Vermelho (<7d)"] (fontSize: 26, color: #dc2626, bg: #fecaca)
    [Card: "Laranja (7-15d)"] (fontSize: 26, color: #ea580c, bg: #fed7aa)
    [Card: "Amarelo (15-30d)"] (fontSize: 26, color: #ca8a04, bg: #fef08a)
    [Card: "Verde (>30d)"] (fontSize: 26, color: #16a34a, bg: #bbf7d0)

  [Tabela: Vencimentos] (DataTable) [ref: Passos 5, 6, 7]
    [Coluna: "Tipo"] (key: tipo_entidade, render customizado) [ref: Passo 6]
      [Badge: "contrato"] (cor: #3b82f6)
      [Badge: "arp"] (cor: #8b5cf6)
      [Badge: "entrega"] (cor: #f59e0b)
    [Coluna: "Nome"] (key: nome)
    [Coluna: "Data Vencimento"] (key: data_vencimento, render: formatDate)
    [Coluna: "Dias Restantes"] (key: dias_restantes) — "{dias}d" (fontWeight: 600)
    [Coluna: "Urgencia"] (key: urgencia, render customizado) [ref: Passo 7]
      [Badge: "Vermelho"] (bg: #fecaca, text: #dc2626)
      [Badge: "Laranja"] (bg: #fed7aa, text: #ea580c)
      [Badge: "Amarelo"] (bg: #fef08a, text: #ca8a04)
      [Badge: "Verde"] (bg: #bbf7d0, text: #16a34a)

  [Texto: "Nenhum vencimento proximo"] — se vazio [ref: Passo 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Proximos Vencimentos"] | 2 |
| [Loader2] | 3 |
| [Stat Cards: Vermelho/Laranja/Amarelo/Verde] | 4 |
| [Tabela: Vencimentos] | 5 |
| [Coluna: "Tipo"] / badges | 6 |
| [Coluna: "Urgencia"] / badges | 7 |
| [Texto: "Nenhum vencimento proximo"] | 8 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# FASE 5 — CRM DO PROCESSO *(NOVA V3)*

---

## [UC-CRM01] Pipeline de Cards do CRM *(NOVO V3)*

**RF relacionado:** RF-045, RF-045-01
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais captados e processados nas etapas anteriores do fluxo comercial (Sprints 1-4)
3. Pagina CRMPage implementada e acessivel via menu lateral

### Pos-condicoes
1. Pipeline completo do ciclo de vida dos editais visualizado em formato de cards/kanban
2. Contagem de editais por etapa exibida em cada card
3. Drill-down disponivel em cada card para listar editais daquela etapa
4. Editais com vendas recorrentes diferenciados de vendas pontuais

### Sequencia de Eventos

1. Usuario acessa CRMPage (`/app/crm`) via menu lateral "CRM"
2. [Cabecalho: "CRM do Processo"] com paragrafo "Pipeline de gestao do ciclo de vida dos editais"
3. [Secao: Pipeline Overview — grid responsivo] exibe cards representando cada etapa do processo licitatorio:
   - [Card: "Editais Nao Divulgados Captados"] — oportunidades mapeadas presencialmente
   - [Card: "Editais Divulgados Captados"] — oportunidades captadas nos sistemas governamentais
   - [Card: "Editais em Analise"] — editais em processo de decisao de participacao
   - [Card: "Leads Potenciais"] — editais com decisao firme de participacao
   - [Card: "Monitoramento Concorrencia"] — editais declinados mas acompanhados
   - [Card: "Impugnacao"] — editais com processo de impugnacao aberto
   - [Card: "Fase de Propostas"] — editais em elaboracao/precificacao de proposta
   - [Card: "Propostas Submetidas"] — propostas enviadas aguardando lances
   - [Card: "Espera de Resultados"] — editais pos-lances aguardando resultado
   - [Card: "Ganho Provisorio e Habilitacao"] — ganhos provisorios pre-recursos
   - [Card: "Processos e Recursos"] — recursos em elaboracao/submetidos
   - [Card: "Contra Razoes"] — contra-razoes em elaboracao/submetidas
   - [Card: "Resultados Definitivos"] — ganhos e perdas definitivas
4. Cada card exibe: [Badge: contagem] de editais naquela etapa, [Icone] representativo, [Texto: nome da etapa]
5. Cards com subcards exibem indicador de expansao (icone ChevronDown)
6. Usuario clica em um card — [Card Expandido: "{nome_etapa}"] abre abaixo com lista de editais
7. [Tabela: Editais da Etapa] exibe: Numero, Orgao, Objeto (truncado), Valor Estimado, Tipo Venda (Pontual/Recorrente), Data, Acao
8. [Coluna: "Tipo Venda"] exibe badge: Pontual (azul), Recorrente (verde)
9. Cards com subcards (ex: Impugnacao, Recursos, Contra Razoes, Resultados Definitivos) expandem para mostrar os subcards:
   - Impugnacao: Aguardando Resultado, Deferida, Indeferida
   - Recursos: Em Elaboracao (com contador de tempo), Submetidos
   - Contra Razoes: Em Elaboracao (com contador de tempo), Submetidas
   - Resultados Definitivos: Aguardando Homologacao, Ganhos, Perdidos
10. [Indicador: Contador de Tempo] (cor dinamica) exibido em recursos/contra-razoes em elaboracao — fica vermelho quando se aproxima do prazo limite
11. Usuario pode mover edital entre etapas via [Botao: "Avancar"] ou [Botao: "Retroceder"] na coluna Acao da tabela expandida

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Secao Pipeline (principal)

#### Layout da Tela

```
[Cabecalho: "CRM do Processo"] [ref: Passo 2]
  [Titulo h1: "CRM do Processo"]
  [Texto p: "Pipeline de gestao do ciclo de vida dos editais"]

[Secao: Pipeline Overview — grid responsivo, 4-5 colunas] [ref: Passo 3]
  [Card: "Editais Nao Divulgados"] (icone Eye, cor: #6b7280) [ref: Passos 3, 4]
    [Badge: contagem] (bg: #f3f4f6)
    [Texto: "Nao Divulgados"]
  [Card: "Editais Divulgados"] (icone Globe, cor: #3b82f6)
    [Badge: contagem]
  [Card: "Em Analise"] (icone Search, cor: #8b5cf6)
    [Badge: contagem]
  [Card: "Leads Potenciais"] (icone Target, cor: #16a34a)
    [Badge: contagem]
  [Card: "Monitoramento"] (icone Binoculars, cor: #f59e0b)
    [Badge: contagem]
  [Card: "Impugnacao"] (icone Scale, cor: #dc2626) [ref: Passo 5]
    [Badge: contagem]
    [Icone: ChevronDown] — indica subcards
  [Card: "Fase de Propostas"] (icone FileText, cor: #0891b2)
    [Badge: contagem]
  [Card: "Propostas Submetidas"] (icone Send, cor: #7c3aed)
    [Badge: contagem]
  [Card: "Espera Resultados"] (icone Hourglass, cor: #ea580c)
    [Badge: contagem]
  [Card: "Ganho Provisorio"] (icone Award, cor: #65a30d)
    [Badge: contagem]
  [Card: "Recursos"] (icone Gavel, cor: #b91c1c)
    [Badge: contagem]
    [Icone: ChevronDown]
  [Card: "Contra Razoes"] (icone Shield, cor: #9333ea)
    [Badge: contagem]
    [Icone: ChevronDown]
  [Card: "Resultados Definitivos"] (icone Trophy, cor: #ca8a04)
    [Badge: contagem]
    [Icone: ChevronDown]

[Card Expandido: "{nome_etapa}"] — condicional, abre ao clicar [ref: Passos 6, 7]
  [Tabela: Editais da Etapa] (DataTable)
    [Coluna: "Numero"] (sortable)
    [Coluna: "Orgao"] (sortable)
    [Coluna: "Objeto"] — truncado 50 chars
    [Coluna: "Valor Estimado"] (render: formatCurrency)
    [Coluna: "Tipo Venda"] — badge [ref: Passo 8]
      [Badge: "Pontual"] (bg: #dbeafe, fg: #1e40af)
      [Badge: "Recorrente"] (bg: #dcfce7, fg: #166534)
    [Coluna: "Data"]
    [Coluna: "Acao"]
      [Botao: "Avancar"] (size: sm, variant: primary) [ref: Passo 11]
      [Botao: "Retroceder"] (size: sm, variant: secondary) [ref: Passo 11]

[Secao: Subcards] — condicional, para cards com sub-etapas [ref: Passo 9]
  [SubCard: "{sub_etapa}"]
    [Badge: contagem]
    [Indicador: Contador de Tempo] — condicional [ref: Passo 10]
      (cor verde: > 48h, amarelo: 24-48h, vermelho: < 24h)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Cabecalho: "CRM do Processo"] | 2 |
| [Secao: Pipeline Overview] / cards | 3, 4 |
| [Badge: contagem] em cada card | 4 |
| [Icone: ChevronDown] | 5 |
| [Card Expandido] | 6 |
| [Tabela: Editais da Etapa] | 7 |
| [Coluna: "Tipo Venda"] / badges | 8 |
| [Secao: Subcards] | 9 |
| [Indicador: Contador de Tempo] | 10 |
| [Botao: "Avancar"] / [Botao: "Retroceder"] | 11 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM02] Parametrizacoes do CRM *(NOVO V3)*

**RF relacionado:** RF-045-02
**Ator:** Usuario (Administrador / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema com permissao de administracao
2. Pagina CRMPage acessivel
3. Empresa do usuario cadastrada no sistema

### Pos-condicoes
1. Tipos de Edital do Business parametrizados e disponiveis para classificacao
2. Agrupamentos do Portfolio cadastrados para organizacao dos editais
3. Motivos de Derrota cadastrados para registro de perdas (UC-CRM07)
4. Parametrizacoes salvas na base da empresa

### Sequencia de Eventos

1. Na CRMPage, usuario clica [Botao: "Parametrizacoes"] (icone Settings) no cabecalho ou acessa via [Aba: "Parametrizacoes"]
2. [Card: "Parametrizacoes do CRM"] exibe 3 secoes organizadas em abas internas ou accordions
3. **Secao 1 — Tipos de Edital do Business:**
   - [Card: "Tipos de Edital"] exibe [Tabela: tipos] com: Nome, Descricao, Ativo
   - Valores padrao: Aquisicao Equipamentos, Aquisicao Reag + Equip, Aquisicao Reagentes, Comodato, Locacao, Locacao + Reagentes, Manutencao, Material de Laboratorio
   - Usuario clica [Botao: "+ Novo Tipo"] — linha editavel aparece na tabela
   - Preenche [TextInput: "Nome"], [TextInput: "Descricao"]
   - Clica [Botao: "Salvar"] (icone Check)
   - [Botao: "Excluir"] (icone Trash2) remove tipo (com confirmacao)
4. **Secao 2 — Agrupamento do Portfolio:**
   - [Card: "Agrupamento do Portfolio"] exibe [Tabela: agrupamentos] com: Nome, Ativo
   - Valores padrao: Point Of Care, Gasometria, Bioquimica, Coagulacao, ELISA, Hematologia, Imunohematologia, Teste Rapido, Urinalise, Quimioluminescencia, Ion Seletivo, Aglutinacao, Diversos
   - Mesmo padrao CRUD: [Botao: "+ Novo"], linha editavel, [Botao: "Salvar"], [Botao: "Excluir"]
5. **Secao 3 — Motivos de Derrota:**
   - [Card: "Motivos de Derrota"] exibe [Tabela: motivos] com: Nome, Categoria, Ativo
   - Valores padrao: Administrativo, Exclusivo para ME/EPP, Falha operacional, Nao tem documento, Nao atende especificacao, Inviavel comercialmente, Nao tem equipamento
   - Mesmo padrao CRUD
6. Usuario clica [Botao: "Salvar Todas"] — todas as parametrizacoes sao persistidas
7. [Toast: "Parametrizacoes salvas com sucesso"] confirmacao exibida

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Secao Parametrizacoes (aba ou modal de configuracao)

#### Layout da Tela

```
[Botao: "Parametrizacoes"] (icone Settings) [ref: Passo 1]

[Card: "Parametrizacoes do CRM"] [ref: Passo 2]

  [Accordion/Aba: "Tipos de Edital do Business"] [ref: Passo 3]
    [Botao: "+ Novo Tipo"] (icone Plus, size: sm)
    [Tabela: tipos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Descricao"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Accordion/Aba: "Agrupamento do Portfolio"] [ref: Passo 4]
    [Botao: "+ Novo Agrupamento"] (icone Plus, size: sm)
    [Tabela: agrupamentos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Accordion/Aba: "Motivos de Derrota"] [ref: Passo 5]
    [Botao: "+ Novo Motivo"] (icone Plus, size: sm)
    [Tabela: motivos] (DataTable, editavel inline)
      [Coluna: "Nome"] — editavel
      [Coluna: "Categoria"] — editavel
      [Coluna: "Ativo"] — toggle
      [Coluna: "Acao"]
        [Botao: "Salvar"] (icone Check, size: sm)
        [Botao: "Excluir"] (icone Trash2, size: sm, variant: secondary)

  [Botao: "Salvar Todas"] (variant: primary) [ref: Passo 6]
  [Toast: "Parametrizacoes salvas com sucesso"] — condicional [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Parametrizacoes"] | 1 |
| [Card: "Parametrizacoes do CRM"] | 2 |
| [Accordion: "Tipos de Edital"] / tabela e CRUD | 3 |
| [Accordion: "Agrupamento do Portfolio"] / tabela e CRUD | 4 |
| [Accordion: "Motivos de Derrota"] / tabela e CRUD | 5 |
| [Botao: "Salvar Todas"] | 6 |
| [Toast: confirmacao] | 7 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM03] Mapa Geografico de Processos *(NOVO V3)*

**RF relacionado:** RF-045-03
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais captados com localizacao geografica (UF/municipio do orgao)
3. Pipeline do CRM populado com editais em diversas etapas

### Pos-condicoes
1. Mapa do Brasil exibido com marcadores coloridos por etapa do pipeline
2. Filtros aplicados (regiao, portfolio, vendedor)
3. Informacoes contextuais exibidas ao clicar nos marcadores

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "Mapa"]
2. [Card: "Mapa de Processos"] exibe mapa interativo do Brasil
3. [Secao: Filtros] exibe controles de filtragem:
   - [Select: "Regiao"] — Norte, Nordeste, Centro-Oeste, Sudeste, Sul, Todas
   - [Select: "Portfolio"] — opcoes dinamicas dos agrupamentos parametrizados (UC-CRM02)
   - [Select: "Vendedor"] — opcoes dinamicas dos usuarios da empresa
   - [Select: "Etapa do Pipeline"] — opcoes das etapas do CRM
4. Marcadores no mapa exibem cores conforme etapa:
   - Captados: azul (#3b82f6)
   - Em Analise: roxo (#8b5cf6)
   - Propostas Enviadas: laranja (#f97316)
   - Ganhos Provisorios: amarelo (#eab308)
   - Recursos: vermelho (#dc2626)
   - Ganhos Definitivos: verde (#16a34a)
5. Usuario clica em marcador — [Popup: info do edital] exibe: Numero, Orgao, Valor, Etapa, Vendedor
6. [Legenda] na parte inferior exibe as cores e seus significados
7. [Secao: Resumo por Regiao] exibe tabela lateral com contagem de editais por regiao e etapa

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "Mapa"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Card: "Mapa de Processos"] [ref: Passo 2]

  [Secao: Filtros — grid 4 colunas] [ref: Passo 3]
    [Select: "Regiao"] — opcoes: Todas, Norte, Nordeste, Centro-Oeste, Sudeste, Sul
    [Select: "Portfolio"] — opcoes dinamicas
    [Select: "Vendedor"] — opcoes dinamicas
    [Select: "Etapa do Pipeline"] — opcoes dinamicas

  [Mapa: Brasil interativo] [ref: Passos 4, 5]
    [Marcadores coloridos] — por etapa [ref: Passo 4]
      azul: Captados
      roxo: Em Analise
      laranja: Propostas Enviadas
      amarelo: Ganhos Provisorios
      vermelho: Recursos
      verde: Ganhos Definitivos
    [Popup: info do edital] — ao clicar no marcador [ref: Passo 5]
      [Texto: Numero]
      [Texto: Orgao]
      [Texto: Valor] — formatCurrency
      [Badge: Etapa] — cor da etapa
      [Texto: Vendedor]

  [Legenda] [ref: Passo 6]
    [Cor: azul] Captados
    [Cor: roxo] Em Analise
    [Cor: laranja] Propostas Enviadas
    [Cor: amarelo] Ganhos Provisorios
    [Cor: vermelho] Recursos
    [Cor: verde] Ganhos Definitivos

  [Secao: Resumo por Regiao] [ref: Passo 7]
    [Tabela: resumo]
      [Coluna: "Regiao"]
      [Coluna: "Captados"]
      [Coluna: "Em Analise"]
      [Coluna: "Propostas"]
      [Coluna: "Ganhos"]
      [Coluna: "Total"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Mapa"] | 1 |
| [Card: "Mapa de Processos"] | 2 |
| [Secao: Filtros] / selects | 3 |
| [Marcadores coloridos] no mapa | 4 |
| [Popup: info do edital] | 5 |
| [Legenda] | 6 |
| [Secao: Resumo por Regiao] / tabela | 7 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM04] Agenda/Timeline de Etapas *(NOVO V3)*

**RF relacionado:** RF-045-04
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais no pipeline com datas de prazo definidas (submissao, lances, recursos, etc.)
3. Etapas do CRM com deadlines registradas

### Pos-condicoes
1. Agenda exibida com visao de calendario/timeline
2. Proximos prazos destacados por urgencia
3. Filtros por responsavel aplicados

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "Agenda"]
2. [Card: "Agenda de Processos"] exibe visao de calendario mensal/semanal
3. [Secao: Controles de Visualizacao]:
   - [Botao: "Mes"] / [Botao: "Semana"] / [Botao: "Lista"] — alterna modo de visualizacao
   - [Botao: "<"] [Botao: ">"] — navega entre periodos
   - [Select: "Responsavel"] — filtra por vendedor/analista
4. No modo Calendario: eventos aparecem como blocos coloridos nas datas correspondentes
   - Cor conforme etapa do pipeline (mesmo padrao do mapa)
   - Tamanho do bloco proporcional a duracao do evento
5. No modo Lista: [Tabela: Proximos Prazos] exibe: Data, Edital, Orgao, Etapa, Prazo, Responsavel, Urgencia
6. [Coluna: "Urgencia"] exibe badge: Critico (vermelho, <3d), Urgente (laranja, 3-7d), Normal (verde, >7d)
7. [Card: "Proximos Prazos Criticos"] (destaque vermelho, condicional) lista os 5 prazos mais proximos
8. Eventos com contadores de tempo (recursos, contra-razoes) exibem [Indicador: tempo restante] com cor de "temperatura"
9. Usuario clica em evento no calendario — [Popup: detalhes do evento] exibe informacoes resumidas e link para o edital

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "Agenda"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Card: "Agenda de Processos"] [ref: Passo 2]

  [Secao: Controles] [ref: Passo 3]
    [Botao: "Mes"] / [Botao: "Semana"] / [Botao: "Lista"]
    [Botao: "<"] [Texto: "{periodo_atual}"] [Botao: ">"]
    [Select: "Responsavel"] — opcoes dinamicas

  [Calendario: visao mensal/semanal] — condicional [ref: Passo 4]
    [Evento: bloco colorido] — cor da etapa, clicavel [ref: Passo 9]
      [Popup: detalhes] — numero, orgao, etapa, prazo

  [Tabela: Proximos Prazos] — modo Lista [ref: Passos 5, 6]
    [Coluna: "Data"] (render: formatDate)
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Etapa"] — badge colorido
    [Coluna: "Prazo"] — "{dias}d"
    [Coluna: "Responsavel"]
    [Coluna: "Urgencia"] — badge [ref: Passo 6]
      [Badge: "Critico"] (bg: #fee2e2, fg: #991b1b) — <3d
      [Badge: "Urgente"] (bg: #fed7aa, fg: #9a3412) — 3-7d
      [Badge: "Normal"] (bg: #dcfce7, fg: #166534) — >7d

  [Card: "Proximos Prazos Criticos"] — condicional [ref: Passo 7]
    [Lista: top 5 prazos]
      [Texto: "{edital} — {orgao}"]
      [Texto: "{dias}d restantes"] (fontWeight: 700, cor dinamica)
      [Indicador: tempo restante] — cor de temperatura [ref: Passo 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Agenda"] | 1 |
| [Card: "Agenda de Processos"] | 2 |
| [Secao: Controles] / botoes e select | 3 |
| [Calendario] / eventos coloridos | 4 |
| [Tabela: Proximos Prazos] | 5 |
| [Coluna: "Urgencia"] / badges | 6 |
| [Card: "Proximos Prazos Criticos"] | 7 |
| [Indicador: tempo restante] | 8 |
| [Popup: detalhes do evento] | 9 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM05] KPIs do CRM *(NOVO V3)*

**RF relacionado:** RF-045-05
**Ator:** Usuario (Gestor Comercial / Diretor)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais registrados nas diversas etapas do pipeline do CRM
3. Resultados de ganhos e perdas registrados (UC-FU01)

### Pos-condicoes
1. KPIs de performance comercial calculados e exibidos
2. Filtros de periodo aplicados
3. Drill-down disponivel em cada KPI

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "KPIs"]
2. [Select: "Periodo"] permite filtrar: Ultimo mes, Ultimos 3 meses, Ultimos 6 meses, Ultimos 12 meses, Tudo
3. [Secao: KPIs Principais — grid 3x2] exibe 6 stat cards:
   - [Card: "Participados / Analisados"] — percentual e numeros absolutos (ex: "45/120 = 37.5%")
   - [Card: "Nao Participados / Analisados"] — complementar ao anterior
   - [Card: "Ganhos / Participados"] — taxa de conversao de vitorias
   - [Card: "Ganhos c/ Recursos / Participados"] — taxa de vitorias via recurso
   - [Card: "Perdidos / Participados"] — taxa de perdas
   - [Card: "Perdidos apos Contra Razao / Total Contra Razoes"] — eficacia das contra-razoes
4. [Card: "Indice de Reversao por Recursos"] exibe: total de reversoes, percentual, principais motivos
5. [Card: "Ticket Medio"] exibe comparativo:
   - Ticket Medio Editais Ganhos vs Ticket Medio Editais Participados e Perdidos
   - [Texto explicativo: "Para entender o quanto a energia dispendida nas vitorias foi bem direcionada na criacao de valor"]
6. [Card: "Potencial de Receita"] exibe: valor total em pipeline ativo, distribuido por etapa
7. [Card: "Tempo Medio de Ganho"] exibe: media de dias desde lance ate ganho definitivo, com tendencia
8. Usuario clica em um KPI — [Card Expandido] mostra tabela com os editais que compoem aquele indicador
9. [Secao: Analise de Perdas] exibe tabela com principais motivos de perda agregados:
   - [Tabela: Motivos de Perda] com: Motivo, Quantidade, %, Tendencia
   - Diferenciacao entre perdas simples e perdas apos contra-razao

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "KPIs"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Select: "Periodo"] [ref: Passo 2]
  opcoes: "1m", "3m", "6m", "12m", "tudo"

[Secao: KPIs Principais — grid 3x2] [ref: Passo 3]
  [Card: "Participados / Analisados"] (icone Users, cor: #3b82f6) — clicavel [ref: Passo 8]
    [Texto: "{n}/{total} = {pct}%"] (fontSize: 22, fontWeight: 700)
  [Card: "Nao Participados / Analisados"] (icone UserMinus, cor: #6b7280) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Ganhos / Participados"] (icone Trophy, cor: #16a34a) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Ganhos c/ Recursos"] (icone Gavel, cor: #65a30d) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Perdidos / Participados"] (icone XCircle, cor: #dc2626) — clicavel
    [Texto: "{n}/{total} = {pct}%"]
  [Card: "Perdidos apos CR / Total CR"] (icone ShieldX, cor: #b91c1c) — clicavel
    [Texto: "{n}/{total} = {pct}%"]

[Card: "Indice de Reversao por Recursos"] [ref: Passo 4]
  [Texto: "Total reversoes: {n}"]
  [Texto: "Indice: {pct}%"]
  [Tabela: Principais Motivos de Reversao]
    [Coluna: "Motivo"]
    [Coluna: "Quantidade"]
    [Coluna: "%"]

[Card: "Ticket Medio"] [ref: Passo 5]
  [Secao: grid 2 colunas]
    [Campo: "TM Editais Ganhos"] — formatCurrency, cor verde
    [Campo: "TM Editais Participados/Perdidos"] — formatCurrency, cor cinza
  [Texto: "Avaliacao da direcao da energia nas vitorias"] (fontSize: 12, color: #6b7280)

[Card: "Potencial de Receita"] [ref: Passo 6]
  [Texto: "Total em Pipeline: {formatCurrency}"]
  [Tabela: distribuicao por etapa]
    [Coluna: "Etapa"]
    [Coluna: "Qtd Editais"]
    [Coluna: "Valor Total"] (render: formatCurrency)

[Card: "Tempo Medio de Ganho"] [ref: Passo 7]
  [Texto: "{dias} dias"] (fontSize: 28, fontWeight: 700)
  [Texto: "Do lance ao ganho definitivo"]
  [Indicador: tendencia] — icone TrendingUp/TrendingDown

[Card Expandido: "{KPI selecionado}"] — condicional [ref: Passo 8]
  [Tabela: Editais do KPI]
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Resultado"]
    [Coluna: "Data"]

[Secao: Analise de Perdas] [ref: Passo 9]
  [Tabela: Motivos de Perda]
    [Coluna: "Motivo"]
    [Coluna: "Quantidade"]
    [Coluna: "%"]
    [Coluna: "Tendencia"] — icone TrendingUp/TrendingDown
    [Coluna: "Tipo"] — badge: "Perda Direta" / "Perda apos CR"
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "KPIs"] | 1 |
| [Select: "Periodo"] | 2 |
| [Secao: KPIs Principais] / stat cards | 3 |
| [Card: "Indice de Reversao por Recursos"] | 4 |
| [Card: "Ticket Medio"] | 5 |
| [Card: "Potencial de Receita"] | 6 |
| [Card: "Tempo Medio de Ganho"] | 7 |
| [Card Expandido] com tabela | 8 |
| [Secao: Analise de Perdas] / tabela | 9 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM06] Registrar Decisao de Nao-Participacao *(NOVO V3)*

**RF relacionado:** RF-045-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Edital em etapa "Em Analise" no pipeline do CRM (UC-CRM01)
3. Decisao de nao participar tomada pela equipe comercial

### Pos-condicoes
1. Motivos da nao-participacao registrados com log do usuario
2. Edital movido para "Monitoramento da Concorrencia" ou removido do pipeline ativo
3. Registro disponivel como insumo para analise de aprendizado futuro
4. KPIs de "Nao Participados / Analisados" atualizados

### Sequencia de Eventos

1. Na CRMPage, usuario expande o [Card: "Em Analise"] no pipeline
2. [Tabela: Editais em Analise] exibe editais com coluna de Acao
3. Usuario clica [Botao: "Declinar"] (variant: secondary, icone XCircle) no edital desejado
4. [Modal: "Registrar Decisao de Nao-Participacao — {numero}"] abre
5. [Select: "Motivo Principal"] — opcoes dinamicas dos Motivos de Derrota parametrizados (UC-CRM02):
   Administrativo, Exclusivo para ME/EPP, Falha operacional, Nao tem documento, Nao atende especificacao, Inviavel comercialmente, Nao tem equipamento, Outro
6. [TextArea: "Detalhamento dos motivos"] — campo obrigatorio, minimo 20 caracteres
7. [Checkbox: "Manter em Monitoramento da Concorrencia"] — se marcado, edital vai para card "Monitoramento" em vez de ser removido
8. [Texto: "Registrado por: {nome_usuario} em {data_hora}"] — exibido automaticamente (log do usuario)
9. Clica [Botao: "Confirmar Declinio"] (variant: primary)
10. Modal fecha; edital move para "Monitoramento da Concorrencia" ou sai do pipeline
11. [Toast: "Decisao registrada com sucesso"] exibido
12. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Card "Em Analise" > Modal

#### Layout da Tela

```
[Card Expandido: "Em Analise"] [ref: Passo 1]
  [Tabela: Editais em Analise] [ref: Passo 2]
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Objeto"] — truncado
    [Coluna: "Valor Estimado"] (render: formatCurrency)
    [Coluna: "Acao"]
      [Botao: "Participar"] (size: sm, variant: primary)
      [Botao: "Declinar"] (size: sm, variant: secondary, icone XCircle) [ref: Passo 3]

[Modal: "Registrar Decisao de Nao-Participacao — {numero}"] [ref: Passos 4-12]
  [Select: "Motivo Principal"] [ref: Passo 5]
    opcoes dinamicas: motivos parametrizados
  [TextArea: "Detalhamento dos motivos"] — obrigatorio, min 20 chars [ref: Passo 6]
    placeholder: "Descreva os motivos detalhados da decisao de nao participar..."
  [Checkbox: "Manter em Monitoramento da Concorrencia"] [ref: Passo 7]
  [Texto: "Registrado por: {nome_usuario} em {data_hora}"] (color: #6b7280, fontSize: 12) [ref: Passo 8]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Confirmar Declinio"] (variant: primary) [ref: Passo 9]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card Expandido: "Em Analise"] | 1 |
| [Tabela: Editais em Analise] | 2 |
| [Botao: "Declinar"] | 3 |
| [Modal: "Registrar Decisao de Nao-Participacao"] | 4 |
| [Select: "Motivo Principal"] | 5 |
| [TextArea: "Detalhamento dos motivos"] | 6 |
| [Checkbox: "Manter em Monitoramento"] | 7 |
| [Texto: log do usuario] | 8 |
| [Botao: "Confirmar Declinio"] | 9 |
| [Toast: confirmacao] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

## [UC-CRM07] Registrar Motivo de Perda *(NOVO V3)*

**RF relacionado:** RF-045-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Edital com resultado final de perda registrado (subcard "Perdidos" em Resultados Definitivos)
3. Motivos de Derrota parametrizados (UC-CRM02)

### Pos-condicoes
1. Motivos detalhados de perda registrados com categorias
2. Diferenciacao entre perdas diretas e perdas apos contra-razao registrada
3. Registro disponivel como insumo para KPIs e aprendizado da equipe (UC-CRM05)
4. Historico de perdas acessivel para analise de tendencias

### Sequencia de Eventos

1. Na CRMPage, usuario expande o [Card: "Resultados Definitivos"] > [SubCard: "Perdidos"]
2. [Tabela: Editais Perdidos] exibe: Numero, Orgao, Valor, Vencedor, Origem Perda, Motivo, Acao
3. [Coluna: "Origem Perda"] exibe badge: "Perda Direta" (vermelho), "Perda apos Contra-Razao" (roxo)
4. Editais sem motivo registrado exibem [Badge: "Pendente"] (amarelo) na coluna Motivo
5. Usuario clica [Botao: "Registrar Motivo"] (variant: primary, size: sm) em edital pendente
6. [Modal: "Registrar Motivo de Perda — {numero}"] abre
7. [Select: "Categoria do Motivo"] — opcoes dinamicas dos Motivos de Derrota parametrizados (UC-CRM02)
8. [TextArea: "Descricao detalhada do motivo"] — obrigatorio, minimo 30 caracteres
9. [Checkbox: "Perda vinculada a Contra-Razao"] — pre-marcado se edital veio do fluxo de contra-razoes
10. Se vinculada a contra-razao: [TextArea: "Analise do processo de contra-razao"] — campo adicional para registro dos aprendizados
11. [Select: "Acao recomendada"] — opcoes: "Revisar especificacoes tecnicas", "Revisar precificacao", "Melhorar documentacao", "Capacitar equipe", "Sem acao", "Outro"
12. [TextInput: "Responsavel pela acao"]
13. [Texto: "Registrado por: {nome_usuario} em {data_hora}"] — log automatico
14. Clica [Botao: "Registrar"] (variant: primary)
15. Modal fecha; coluna Motivo atualizada com categoria registrada
16. Dados alimentam KPIs de perdas (UC-CRM05) e secao "Analise de Perdas"
17. Para editais ganhos com recursos: [Botao: "Registrar Motivo de Sucesso"] disponivel em [SubCard: "Ganhos"] — abre modal similar para registrar motivos que levaram ao sucesso do recurso (aprendizado positivo)
18. [Botao: "Cancelar"] fecha modal sem salvar

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Card "Resultados Definitivos" > SubCard "Perdidos"

#### Layout da Tela

```
[Card Expandido: "Resultados Definitivos"] [ref: Passo 1]
  [SubCard: "Aguardando Homologacao"]
  [SubCard: "Ganhos"]
    [Botao: "Registrar Motivo de Sucesso"] — para ganhos via recurso [ref: Passo 17]
  [SubCard: "Perdidos"] [ref: Passo 1]

[Tabela: Editais Perdidos] [ref: Passos 2, 3, 4]
  [Coluna: "Numero"] (sortable)
  [Coluna: "Orgao"] (sortable)
  [Coluna: "Valor"] (render: formatCurrency)
  [Coluna: "Vencedor"]
  [Coluna: "Origem Perda"] — badge [ref: Passo 3]
    [Badge: "Perda Direta"] (bg: #fee2e2, fg: #991b1b)
    [Badge: "Perda apos CR"] (bg: #f3e8ff, fg: #7c3aed)
  [Coluna: "Motivo"] [ref: Passo 4]
    [Badge: "Pendente"] (bg: #fef3c7, fg: #92400e) — se nao registrado
    [Texto: "{categoria}"] — se registrado
  [Coluna: "Acao"]
    [Botao: "Registrar Motivo"] (size: sm, variant: primary) [ref: Passo 5]

[Modal: "Registrar Motivo de Perda — {numero}"] [ref: Passos 6-18]
  [Select: "Categoria do Motivo"] [ref: Passo 7]
    opcoes dinamicas: motivos parametrizados (UC-CRM02)
  [TextArea: "Descricao detalhada do motivo"] — obrigatorio, min 30 chars [ref: Passo 8]
    placeholder: "Descreva os motivos detalhados que levaram a perda..."
  [Checkbox: "Perda vinculada a Contra-Razao"] [ref: Passo 9]
  [TextArea: "Analise do processo de contra-razao"] — condicional [ref: Passo 10]
    placeholder: "Quais fatores levaram ao insucesso da contra-razao..."
  [Select: "Acao recomendada"] [ref: Passo 11]
    opcoes: "Revisar especificacoes tecnicas", "Revisar precificacao", "Melhorar documentacao", "Capacitar equipe", "Sem acao", "Outro"
  [TextInput: "Responsavel pela acao"] [ref: Passo 12]
  [Texto: "Registrado por: {nome_usuario} em {data_hora}"] (color: #6b7280, fontSize: 12) [ref: Passo 13]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Registrar"] (variant: primary) [ref: Passo 14]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card Expandido: "Resultados Definitivos"] / [SubCard: "Perdidos"] | 1 |
| [Tabela: Editais Perdidos] | 2 |
| [Coluna: "Origem Perda"] / badges | 3 |
| [Badge: "Pendente"] na coluna Motivo | 4 |
| [Botao: "Registrar Motivo"] | 5 |
| [Modal: "Registrar Motivo de Perda"] | 6 |
| [Select: "Categoria do Motivo"] | 7 |
| [TextArea: "Descricao detalhada"] | 8 |
| [Checkbox: "Perda vinculada a CR"] | 9 |
| [TextArea: "Analise da contra-razao"] | 10 |
| [Select: "Acao recomendada"] | 11 |
| [TextInput: "Responsavel"] | 12 |
| [Texto: log do usuario] | 13 |
| [Botao: "Registrar"] | 14 |
| [Botao: "Registrar Motivo de Sucesso"] (em Ganhos) | 17 |
| [Botao: "Cancelar"] | 18 |

### Implementacao Atual
**⬜ NAO IMPLEMENTADO**

---

# RESUMO FINAL DE IMPLEMENTACAO

| UC | Nome | Fase | Pagina | Aba / Posicao | Status |
|----|------|------|--------|---------------|--------|
| UC-FU01 | Registrar Resultado | Follow-Up | FollowupPage | Aba "Resultados" | ✅ IMPLEMENTADO |
| UC-FU02 | Configurar Alertas de Prazo | Follow-Up | FollowupPage | Aba "Alertas" | ✅ IMPLEMENTADO |
| UC-FU03 | Score Logistico | Follow-Up | FollowupPage | Stat Card | ✅ IMPLEMENTADO |
| UC-AT01 | Buscar Atas no PNCP | Atas | AtasPage | Aba "Buscar" | ✅ IMPLEMENTADO |
| UC-AT02 | Extrair Resultados de Ata PDF | Atas | AtasPage | Aba "Extrair" | ✅ IMPLEMENTADO |
| UC-AT03 | Dashboard de Atas Consultadas | Atas | AtasPage | Aba "Minhas Atas" | ✅ IMPLEMENTADO |
| UC-CT06 | Saldo ARP / Controle de Carona | Atas | AtasPage | Aba "Saldo ARP" | ✅ IMPLEMENTADO |
| UC-CT01 | Cadastrar Contrato | Execucao | ProducaoPage | Aba "Contratos" | ✅ IMPLEMENTADO |
| UC-CT02 | Registrar Entrega + NF | Execucao | ProducaoPage | Aba "Entregas" | ✅ IMPLEMENTADO |
| UC-CT03 | Acompanhar Cronograma | Execucao | ProducaoPage | Aba "Cronograma" | ✅ IMPLEMENTADO |
| UC-CT04 | Gestao de Aditivos | Execucao | ProducaoPage | Aba "Aditivos" | ✅ IMPLEMENTADO |
| UC-CT05 | Designar Gestor/Fiscal | Execucao | ProducaoPage | Aba "Gestor/Fiscal" | ✅ IMPLEMENTADO |
| UC-CT07 | Gestao de Empenhos | Execucao | ProducaoPage | Aba "Empenhos" | ⬜ NAO IMPLEMENTADO |
| UC-CT08 | Auditoria Empenhos x Faturas x Pedidos | Execucao | ProducaoPage | Aba "Empenhos" > Auditoria | ⬜ NAO IMPLEMENTADO |
| UC-CT09 | Contratos a Vencer | Execucao | ProducaoPage | Aba "Contratos a Vencer" | ⬜ NAO IMPLEMENTADO |
| UC-CT10 | KPIs de Execucao | Execucao | ProducaoPage | Secao KPIs | ⬜ NAO IMPLEMENTADO |
| UC-CR01 | Dashboard Contratado x Realizado | C x R | ContratadoRealizadoPage | Secao Dashboard | ✅ IMPLEMENTADO |
| UC-CR02 | Pedidos em Atraso | C x R | ContratadoRealizadoPage | Secao Atrasos | ✅ IMPLEMENTADO |
| UC-CR03 | Alertas de Vencimento Multi-tier | C x R | ContratadoRealizadoPage | Secao Vencimentos | ✅ IMPLEMENTADO |
| UC-CRM01 | Pipeline de Cards do CRM | CRM | CRMPage | Secao Pipeline | ⬜ NAO IMPLEMENTADO |
| UC-CRM02 | Parametrizacoes do CRM | CRM | CRMPage | Secao Parametrizacoes | ⬜ NAO IMPLEMENTADO |
| UC-CRM03 | Mapa Geografico de Processos | CRM | CRMPage | Aba "Mapa" | ⬜ NAO IMPLEMENTADO |
| UC-CRM04 | Agenda/Timeline de Etapas | CRM | CRMPage | Aba "Agenda" | ⬜ NAO IMPLEMENTADO |
| UC-CRM05 | KPIs do CRM | CRM | CRMPage | Aba "KPIs" | ⬜ NAO IMPLEMENTADO |
| UC-CRM06 | Registrar Decisao de Nao-Participacao | CRM | CRMPage | Card "Em Analise" | ⬜ NAO IMPLEMENTADO |
| UC-CRM07 | Registrar Motivo de Perda | CRM | CRMPage | Card "Resultados Definitivos" | ⬜ NAO IMPLEMENTADO |

**Totais:** 15 implementados + 0 parciais + 11 nao implementados = **26 casos de uso**

---

## Changelog V2 → V3

| Alteracao | Detalhe |
|---|---|
| **Nova FASE 5 — CRM DO PROCESSO** | Adicionada fase inteiramente nova com 7 UCs (UC-CRM01 a UC-CRM07) baseados no documento SPRINT 5 VF do cliente |
| **UC-CRM01: Pipeline de Cards do CRM** | Pipeline kanban com 13 cards representando etapas desde "Editais Nao Divulgados" ate "Resultados Definitivos", com subcards, contadores e drill-down. RF: RF-045, RF-045-01 |
| **UC-CRM02: Parametrizacoes do CRM** | CRUD para Tipos de Edital do Business, Agrupamento do Portfolio e Motivos de Derrota. RF: RF-045-02 |
| **UC-CRM03: Mapa Geografico de Processos** | Mapa interativo do Brasil com marcadores coloridos por etapa, filtros por regiao/portfolio/vendedor. RF: RF-045-03 |
| **UC-CRM04: Agenda/Timeline de Etapas** | Calendario/lista de prazos com visao mensal/semanal, filtro por responsavel, contadores de tempo. RF: RF-045-04 |
| **UC-CRM05: KPIs do CRM** | Dashboard com 6 KPIs principais (taxas de participacao, ganho, perda, reversao por recursos), ticket medio, potencial de receita, tempo medio de ganho, analise de perdas. RF: RF-045-05 |
| **UC-CRM06: Registrar Decisao de Nao-Participacao** | Modal para registrar motivos de declinio com log do usuario, opcao de manter em monitoramento. RF: RF-045-01 |
| **UC-CRM07: Registrar Motivo de Perda** | Modal para registrar motivos detalhados de perda com categorias, diferenciacao perda direta vs perda apos contra-razao, acao recomendada. RF: RF-045-01 |
| **UC-CT07: Gestao de Empenhos** | Nova aba "Empenhos" na ProducaoPage para controle de empenhos por contrato: itens, volumes, entregas, saldo automatico, alerta de itens sem valor contratual. RF: RF-046-01 |
| **UC-CT08: Auditoria Empenhos x Faturas x Pedidos** | Relatorio de conciliacao entre empenhos, entregas e faturas com stat cards, tabela de divergencias e exportacao PDF/Excel. RF: RF-046-02 |
| **UC-CT09: Contratos a Vencer** | Nova aba "Contratos a Vencer" com subcards: 90d, 30d, em tratativas, renovados, nao renovados. Fluxo completo de renovacao ou encerramento. RF: RF-046-03 |
| **UC-CT10: KPIs de Execucao** | Stat cards com metricas de execucao: contratos ativos/mes, a vencer, em tratativas, renovados, encerrados. Filtro por periodo e drill-down. RF: RF-046-04 |
| **Pagina CRMPage** | Nova pagina `/app/crm` com abas Pipeline, Mapa, Agenda, KPIs, Parametrizacoes |
| **Abas ProducaoPage** | Adicionadas 2 novas abas: "Empenhos" (6a) e "Contratos a Vencer" (7a) |
| **INDICE** | Atualizado com FASE 5 e novos UCs da FASE 3 |
| **RESUMO DE IMPLEMENTACAO** | Atualizado: 15 implementados + 11 nao implementados = 26 UCs |
| **Versao** | V2.0 (01/04/2026) → V3.0 (08/04/2026) |

---

*Documento gerado em 08/04/2026. V3.0 — Adicionados 11 novos casos de uso derivados do documento SPRINT 5 VF: 7 UCs na nova FASE 5 (CRM DO PROCESSO) e 4 UCs na FASE 3 (EXECUCAO). Total atualizado para 26 casos de uso (15 implementados + 11 nao implementados). Nova pagina CRMPage com pipeline kanban, mapa geografico, agenda, KPIs e parametrizacoes. ProducaoPage expandida com abas de Empenhos e Contratos a Vencer.*
