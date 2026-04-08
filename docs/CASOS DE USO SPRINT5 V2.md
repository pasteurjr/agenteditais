# CASOS DE USO — SPRINT 5: FOLLOW-UP, ATAS, EXECUCAO E CONTRATADO X REALIZADO

**Data:** 01/04/2026
**Versao:** 2.0
**Base:** requisitos_completosv6.md (RF-017, RF-011, RF-035, RF-046, RF-051, RF-052) + Lei 14.133/2021 (Arts. 82-86, 117, 124-126) + boas praticas de gestao contratual
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Follow-up, Atas de Pregao, Execucao de Contratos e Contratado x Realizado.
**Nota v2.0:** Adicionadas secoes "Tela(s) Representativa(s)" com layout hierarquico de elementos de tela, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos para cada UC. Status de implementacao atualizado para refletir o estado real do frontend (FollowupPage, AtasPage, ProducaoPage, ContratadoRealizadoPage implementados).

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

### FASE 4 — CONTRATADO X REALIZADO
- [UC-CR01] Dashboard Contratado X Realizado
- [UC-CR02] Pedidos em Atraso
- [UC-CR03] Alertas de Vencimento Multi-tier

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
| UC-CR01 | Dashboard Contratado x Realizado | C x R | ContratadoRealizadoPage | Secao Dashboard | ✅ IMPLEMENTADO |
| UC-CR02 | Pedidos em Atraso | C x R | ContratadoRealizadoPage | Secao Atrasos | ✅ IMPLEMENTADO |
| UC-CR03 | Alertas Vencimento Multi-tier | C x R | ContratadoRealizadoPage | Secao Vencimentos | ✅ IMPLEMENTADO |

**Totais:** 15 implementados + 0 parciais + 0 nao implementados = **15 casos de uso**

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
| UC-CR01 | Dashboard Contratado x Realizado | C x R | ContratadoRealizadoPage | Secao Dashboard | ✅ IMPLEMENTADO |
| UC-CR02 | Pedidos em Atraso | C x R | ContratadoRealizadoPage | Secao Atrasos | ✅ IMPLEMENTADO |
| UC-CR03 | Alertas de Vencimento Multi-tier | C x R | ContratadoRealizadoPage | Secao Vencimentos | ✅ IMPLEMENTADO |

**Totais:** 15 implementados + 0 parciais + 0 nao implementados = **15 casos de uso**

---

*Documento gerado em 01/04/2026. V2.0 — Adicionadas secoes Tela(s) Representativa(s) com layout hierarquico, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos. Status atualizado de PARCIAL/NAO IMPLEMENTADO para IMPLEMENTADO em todos os 15 UCs, refletindo o estado atual das paginas FollowupPage, AtasPage, ProducaoPage e ContratadoRealizadoPage.*
