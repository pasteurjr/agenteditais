# CASOS DE USO — IMPUGNACAO, RECURSOS E CONTRA-RAZOES

**Data:** 13/04/2026
**Versao:** 4.0
**Base:** requisitos_completosv6.md (RF-043, RF-044) + SPRINT RECURSOS E IMPUGNACOES - V02.docx
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Impugnacao/Esclarecimentos e Recursos/Contra-Razoes.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 32 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.
**Novidade V4:** Anotacoes de RNs efetivamente implementadas no backend (linhas `**RNs aplicadas:**`) em UCs criticos + nova secao "Regras de Negocio Implementadas (V4)" com tabela de mapeamento RN -> arquivo backend. RNs em modo warn-only por padrao.
**Nota v1.1:** UC-D01/D02 (Disputas de Lances) removidos desta sprint — movidos para sprint futura dedicada (etapa 7 do workflow, entre Submissao e Followup).
**Nota v2.0:** Adicionadas secoes "Tela(s) Representativa(s)" com layout hierarquico de elementos de tela, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos para cada UC.

---

## Regras de Negócio Implementadas (V4)

Esta versão V4 documenta as Regras de Negócio (RNs) já enforçadas no backend. Por padrão estão em modo **warn-only** (`ENFORCE_RN_VALIDATORS=false`). Ativar com `ENFORCE_RN_VALIDATORS=true`.

**Total de RNs únicas anotadas nesta V4:** 33 RNs (RN-133 a RN-164 + RN-212), distribuídas em 11 UCs (UC-I01..I05 + UC-RE01..RE06). RNs marcadas `[FALTANTE→V4]` foram identificadas como gap pré-V4 e implementadas/documentadas nesta versão.

| RN | Descrição | UC afetado | Arquivo backend |
|---|---|---|---|
| RN-155 | Contagem de prazo exclui sábado/domingo | UC de impugnação, UC de recurso | `backend/rn_prazos.py::is_dia_util` |
| RN-156 | Prazo de impugnação = 3 dias úteis antes da abertura (Art. 164 Lei 14.133/2021) | UC de registro de impugnação | `backend/rn_prazos.py::prazo_impugnacao_final` |
| RN-160 | Helper `dias_uteis_entre` para cálculos auxiliares | UCs de prazo | `backend/rn_prazos.py::dias_uteis_entre` |
| RN-163 | Calendário considera feriados nacionais BR via `workalendar.america.Brazil` (Tiradentes, Carnaval, Corpus Christi, etc). Fallback sab/dom se lib ausente | UCs com contagem de prazo | `backend/rn_prazos.py` |
| RN-084 | Cooldown 60s DeepSeek (análise de edital, geração de petição IA) | UCs de análise legal IA, geração de petição | `backend/rn_deepseek.py::check_cooldown` |
| RN-132 | Audit de invocações DeepSeek | UCs com pipelines IA | `backend/rn_audit.py::audited_tool` |
| RN-037 | Audit log universal em impugnações e recursos | UCs de criação de impugnação/recurso | `backend/rn_audit.py::log_transicao` |

---

## INDICE

### FASE 1 — IMPUGNACAO E ESCLARECIMENTOS
- [UC-I01] Validacao Legal do Edital
- [UC-I02] Sugerir Esclarecimento ou Impugnacao
- [UC-I03] Gerar Peticao de Impugnacao
- [UC-I04] Upload de Peticao Externa
- [UC-I05] Controle de Prazo

### FASE 2 — RECURSOS E CONTRA-RAZOES
- [UC-RE01] Monitorar Janela de Recurso
- [UC-RE02] Analisar Proposta Vencedora
- [UC-RE03] Chatbox de Analise
- [UC-RE04] Gerar Laudo de Recurso
- [UC-RE05] Gerar Laudo de Contra-Razao
- [UC-RE06] Submissao Assistida no Portal

### FASE 3 — FOLLOWUP DE RESULTADOS
- [UC-FU01] Registrar Resultado de Edital
- [UC-FU02] Configurar Alertas de Vencimento
- [UC-FU03] Score Logistico

---

## RESUMO DE IMPLEMENTACAO

| Caso de Uso | Fase | Pagina | Status |
|-------------|------|--------|--------|
| UC-I01 | IMPUGNACAO | ImpugnacaoPage | ✅ IMPLEMENTADO |
| UC-I02 | IMPUGNACAO | ImpugnacaoPage | ✅ IMPLEMENTADO |
| UC-I03 | IMPUGNACAO | ImpugnacaoPage | ✅ IMPLEMENTADO |
| UC-I04 | IMPUGNACAO | ImpugnacaoPage | ✅ IMPLEMENTADO |
| UC-I05 | IMPUGNACAO | ImpugnacaoPage | ✅ IMPLEMENTADO |
| UC-RE01 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-RE02 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-RE03 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-RE04 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-RE05 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-RE06 | RECURSOS | RecursosPage | ✅ IMPLEMENTADO |
| UC-FU01 | FOLLOWUP | FollowupPage | ✅ IMPLEMENTADO |
| UC-FU02 | FOLLOWUP | FollowupPage | ✅ IMPLEMENTADO |
| UC-FU03 | FOLLOWUP | FollowupPage | ✅ IMPLEMENTADO |

**Totais:** 14 implementados + 0 parciais + 0 nao implementados = **14 casos de uso**

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## [UC-I01] Validacao Legal do Edital

**RF relacionado:** RF-043-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-135, RN-136, RN-137
- Faltantes: RN-161 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-135, RN-136, RN-137, RN-161 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Documento do edital esta disponivel (PDF importado ou texto extraido)
4. Base de legislacao configurada (Lei 14.133/2021, decretos regulamentadores, jurisprudencias)

### Pos-condicoes
1. Relatorio de validacao legal gerado com inconsistencias classificadas
2. Cada inconsistencia tem gravidade (ALTA, MEDIA, BAIXA)
3. Sugestao de acao por inconsistencia (Impugnacao ou Esclarecimento)
4. Relatorio salvo no banco vinculado ao edital
5. LOG de analise registrado

### Sequencia de Eventos

1. Usuario acessa **ImpugnacaoPage** (`/app/impugnacao`) via menu lateral "Impugnacao"
2. Clica na [Aba: "Validacao Legal"] — exibida como primeira aba do painel
3. No [Card: "Analise de Conformidade Legal"], seleciona edital em [Select: "Selecione o Edital"] — lista editais salvos no sistema
4. Sistema verifica disponibilidade do PDF do edital selecionado
5. Usuario clica [Botao: "Analisar Edital"] (icone Search) — dispara requisicao ao agente IA
6. IA le o edital completo, identifica leis aplicaveis e compara clausula por clausula
7. IA retorna lista de inconsistencias com trecho, lei violada, gravidade e sugestao
8. [Card: "Resultado da Analise"] exibe [Tabela: Inconsistencias] com todas as inconsistencias detectadas
9. [Badge] de gravidade classifica cada item: ALTA (vermelho), MEDIA (amarelo), BAIXA (verde)
10. [Badge] na coluna Sugestao indica tipo recomendado: "Impugnacao" (error) ou "Esclarecimento" (info)
11. Usuario revisa cada inconsistencia na tabela
12. Opcionalmente navega para aba Peticoes para gerar peticao baseada nas inconsistencias

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Validacao Legal" (1a aba)

#### Layout da Tela

```
[Cabecalho: "IMPUGNACAO E ESCLARECIMENTOS"]
  [Texto: "Analise legal e peticoes para editais"]

[Aba: "Validacao Legal"] [Aba: "Peticoes"] [Aba: "Prazos"]

[Card: "Analise de Conformidade Legal"] (icone Scale)
  [Select: "Selecione o Edital"] — lista editais salvos [ref: Passo 3]
  [Botao: "Analisar Edital"] (icone Search, variant primary) [ref: Passo 5]
  [Texto: "Analisando..."] (icone Loader2, exibido durante processamento) [ref: Passo 6]

[Card: "Resultado da Analise"] (icone Shield) [ref: Passo 8]
  [Tabela: Inconsistencias]
    [Coluna: "#"] — numero sequencial
    [Coluna: "Trecho"] — trecho do edital com a inconsistencia
    [Coluna: "Lei Violada"] — artigo de lei, decreto ou jurisprudencia
    [Coluna: "Gravidade"] — render com badge colorido [ref: Passo 9]
      [Badge: "ALTA"] (status-badge-error / vermelho)
      [Badge: "MEDIA"] (status-badge-warning / amarelo)
      [Badge: "BAIXA"] (status-badge-info / verde)
    [Coluna: "Sugestao"] — tipo recomendado [ref: Passo 10]
      [Badge: "Impugnacao"] (error)
      [Badge: "Esclarecimento"] (info)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Validacao Legal"] | 2 |
| [Card: "Analise de Conformidade Legal"] | 3, 5 |
| [Select: "Selecione o Edital"] | 3 |
| [Botao: "Analisar Edital"] | 5 |
| [Texto: "Analisando..."] | 6 |
| [Card: "Resultado da Analise"] | 8 |
| [Tabela: Inconsistencias] | 8 |
| [Coluna: "Gravidade"] / [Badge: ALTA/MEDIA/BAIXA] | 9 |
| [Coluna: "Sugestao"] / [Badge: Impugnacao/Esclarecimento] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-I02] Sugerir Esclarecimento ou Impugnacao

**RF relacionado:** RF-043-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-134, RN-138
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-134, RN-138

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Validacao legal concluida (UC-I01)
2. Inconsistencias detectadas e classificadas por gravidade
3. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Cada inconsistencia tem tipo de peticao sugerido (Impugnacao ou Esclarecimento)
2. Justificativa da sugestao registrada
3. Usuario validou e confirmou as sugestoes

### Sequencia de Eventos

1. Apos analise UC-I01, usuario clica na [Aba: "Peticoes"]
2. [Card: "Peticoes"] exibe lista de peticoes vinculadas ao edital selecionado
3. A coluna "Tipo" da [Tabela: Peticoes] reflete a sugestao da IA para cada item: "Esclarecimento" ou "Impugnacao"
4. [Badge] na coluna "Status" indica estado atual de cada peticao (Rascunho, Em Revisao, Enviada)
5. Usuario clica [Botao: "Nova Peticao"] (icone Plus) para criar peticao baseada em inconsistencia detectada
6. Modal "Nova Peticao" abre — usuario preenche [Select: "Edital"], [Select: "Tipo"] (Esclarecimento ou Impugnacao), [Select: "Template"] e [TextArea: "Conteudo"]
7. Usuario clica [Botao: "Criar"] no rodape do modal — peticao criada com status "rascunho"
8. Peticao aparece na [Tabela: Peticoes] com tipo e status atualizados

> Nota: UC-I02 e UC-I03 compartilham a aba "Peticoes". UC-I02 foca na sugestao/classificacao; UC-I03 foca na geracao via IA.

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — secao de sugestao e criacao

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes" (badge: N)] [Aba: "Prazos"]

[Card: "Peticoes"] (icone FileText)
  [Botao: "Nova Peticao"] (icone Plus, variant primary) [ref: Passo 5]
  [Botao: "Upload Peticao"] (icone Upload) [ref: UC-I04]

  [Tabela: Peticoes]
    [Coluna: "Edital"] — sortable
    [Coluna: "Tipo"] — "Impugnacao" ou "Esclarecimento" [ref: Passo 3]
    [Coluna: "Status"] — render com badge e icone [ref: Passo 4]
      [Badge: "Rascunho"] (neutral, icone Edit3)
      [Badge: "Em Revisao"] (warning, icone Eye)
      [Badge: "Enviada"] (success, icone Send)
    [Coluna: "Data"] — sortable
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar peticao [ref: Passo 2]
      [Icone-Acao: Trash2] — excluir peticao (danger)

[Modal: "Nova Peticao"] (disparado por [Botao: "Nova Peticao"]) [ref: Passo 6]
  [Select: "Edital"] — lista editais salvos
  [Select: "Tipo"] — opcoes: "Esclarecimento", "Impugnacao" [ref: Passo 6]
  [Select: "Template"] — opcoes: "Nenhum (em branco)", templates customizados
  [TextArea: "Conteudo"] — rows 8, opcional se usar template
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Criar"] (variant primary) [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Peticoes"] | 1 |
| [Tabela: Peticoes] | 2, 8 |
| [Coluna: "Tipo"] | 3 |
| [Coluna: "Status"] / badges | 4 |
| [Botao: "Nova Peticao"] | 5 |
| [Modal: "Nova Peticao"] | 6 |
| [Select: "Tipo"] no modal | 6 |
| [Botao: "Criar"] | 7 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-I03] Gerar Peticao de Impugnacao

**RF relacionado:** RF-043-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-133, RN-134, RN-139, RN-140, RN-153
- Faltantes: RN-157 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-133, RN-134, RN-139, RN-140, RN-153, RN-157 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Inconsistencias classificadas e tipo de peticao definido (UC-I02)
2. Pelo menos uma inconsistencia marcada como "Impugnacao"
3. Base de legislacao e jurisprudencias disponivel
4. Templates de peticao configurados (padrao ou customizado)

### Pos-condicoes
1. Peticao de impugnacao gerada com texto completo
2. Peticao contem: identificacao de inconsistencias, base legal, jurisprudencias aplicaveis
3. Documento salvo em status "rascunho" com LOG de criacao
4. Peticao disponivel para edicao e exportacao

### Sequencia de Eventos

1. Usuario esta na [Aba: "Peticoes"] da ImpugnacaoPage com edital selecionado
2. Clica [Botao: "Nova Peticao"] (icone Plus) — Modal "Nova Peticao" abre
3. Preenche [Select: "Edital"], [Select: "Tipo"] = "Impugnacao", [Select: "Template"]
4. Opcionalmente preenche [TextArea: "Conteudo"] com conteudo inicial
5. Clica [Botao: "Criar"] — peticao criada com status "rascunho"
6. Peticao aparece na [Tabela: Peticoes]; usuario clica [Icone-Acao: Eye] para abrir editor
7. [Card: "Editando: {edital_numero} - {tipo}"] (icone Edit3) exibe editor com conteudo gerado
8. [TextArea] do editor exibe o texto completo da peticao — 100% editavel (rows: 18)
9. Usuario clica [Botao: "Gerar Peticao"] (icone Lightbulb, variant primary) para solicitar geracao via IA
10. IA gera documento completo com 5 secoes: Qualificacao, Fatos, Direito, Jurisprudencias, Pedido
11. Usuario revisa e edita livremente no [TextArea] do editor
12. Clica [Botao: "Salvar Rascunho"] (icone Save) para salvar sem mudar status
13. Clica [Botao: "Enviar para Revisao"] (icone Send) para mudar status para "Em Revisao"
14. Opcionalmente exporta: [Botao: "PDF"] ou [Botao: "DOCX"] (icone Download)

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — painel de edicao de peticao

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes" (badge: N)] [Aba: "Prazos"]

[Card: "Peticoes"] (icone FileText)
  [Botao: "Nova Peticao"] (icone Plus, variant primary) [ref: Passo 2]
  [Botao: "Upload Peticao"] (icone Upload)

  [Tabela: Peticoes]
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — abrir editor [ref: Passo 6]
      [Icone-Acao: Trash2] — excluir

[Card: "Editando: {edital_numero} - {tipo}"] (icone Edit3) [ref: Passo 7]
  [Botao: "Gerar Peticao"] (icone Lightbulb, variant primary) [ref: Passo 9]
  [TextArea] — editor de texto rico, rows 18, 100% editavel [ref: Passos 8, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 12]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary) [ref: Passo 13]
  [Botao: "PDF"] (icone Download) [ref: Passo 14]
  [Botao: "DOCX"] (icone Download) [ref: Passo 14]

[Modal: "Nova Peticao"] (disparado por [Botao: "Nova Peticao"]) [ref: Passos 3-5]
  [Select: "Edital"] [ref: Passo 3]
  [Select: "Tipo"] — "Impugnacao" [ref: Passo 3]
  [Select: "Template"] [ref: Passo 3]
  [TextArea: "Conteudo"] — rows 8, opcional [ref: Passo 4]
  [Botao: "Cancelar"]
  [Botao: "Criar"] (variant primary) [ref: Passo 5]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Nova Peticao"] | 2 |
| [Modal: "Nova Peticao"] | 3, 4, 5 |
| [Select: "Edital"] no modal | 3 |
| [Select: "Tipo"] = "Impugnacao" | 3 |
| [Select: "Template"] | 3 |
| [TextArea: "Conteudo"] no modal | 4 |
| [Botao: "Criar"] | 5 |
| [Icone-Acao: Eye] na tabela | 6 |
| [Card: "Editando: ..."] | 7 |
| [TextArea] editor | 8, 11 |
| [Botao: "Gerar Peticao"] | 9 |
| [Botao: "Salvar Rascunho"] | 12 |
| [Botao: "Enviar para Revisao"] | 13 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 14 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-I04] Upload de Peticao Externa

**RF relacionado:** RF-043-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-140, RN-141
- Faltantes: RN-162 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-140, RN-141, RN-162 [FALTANTE→V4]

**Ator:** Usuario

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital esta salvo no sistema
3. Usuario possui peticao de impugnacao elaborada fora do sistema (DOCX/PDF)

### Pos-condicoes
1. Peticao importada no sistema com status "rascunho"
2. Documento vinculado ao edital
3. LOG de upload registrado

### Sequencia de Eventos

1. Na [Aba: "Peticoes"] da ImpugnacaoPage, usuario clica [Botao: "Upload Peticao"] (icone Upload)
2. [Modal: "Upload de Peticao"] abre
3. Usuario seleciona edital em [Select: "Edital"] dentro do modal
4. Usuario clica em [Campo: "Arquivo (.docx / .pdf)"] — abre seletor de arquivo do sistema operacional
5. Seleciona arquivo .docx, .pdf ou .doc — sistema valida formato e tamanho (limite implicito)
6. Usuario clica [Botao: "Upload"] (variant primary) no rodape do modal
7. Sistema salva documento no banco com status "rascunho", vinculado ao edital
8. Modal fecha e peticao aparece na [Tabela: Peticoes] com tipo "Impugnacao" e status "Rascunho"
9. LOG de upload registrado automaticamente

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — Modal de Upload

#### Layout da Tela

```
[Aba: "Peticoes"] — contexto principal

[Card: "Peticoes"]
  [Botao: "Upload Peticao"] (icone Upload) [ref: Passo 1]

[Modal: "Upload de Peticao"] (disparado por [Botao: "Upload Peticao"]) [ref: Passo 2]
  [Select: "Edital"] — lista editais salvos [ref: Passo 3]
  [Campo: "Arquivo (.docx / .pdf)"] — input type file, accept: ".docx,.pdf,.doc" [ref: Passos 4, 5]
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Upload"] (variant primary) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Peticao"] | 1 |
| [Modal: "Upload de Peticao"] | 2 |
| [Select: "Edital"] no modal | 3 |
| [Campo: "Arquivo (.docx / .pdf)"] | 4, 5 |
| [Botao: "Upload"] | 6 |
| [Tabela: Peticoes] | 8 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-I05] Controle de Prazo

**RF relacionado:** RF-043-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-133, RN-142
- Faltantes: RN-158 [FALTANTE], RN-163 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-133, RN-142, RN-158 [FALTANTE→V4], RN-163 [FALTANTE→V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital salvo no sistema com data de abertura definida
2. Peticao em elaboracao ou planejada para o edital
3. Canais de notificacao configurados (email, WhatsApp, sistema)

### Pos-condicoes
1. Alertas configurados para 3 dias uteis antes da abertura
2. Notificacoes enviadas nos canais ativos
3. Status de prazo visivel na interface
4. LOG de notificacoes registrado

### Sequencia de Eventos

1. Usuario acessa ImpugnacaoPage e clica na [Aba: "Prazos"] (icone Clock, com badge de prazos urgentes)
2. [Card: "Prazos de Impugnacao e Esclarecimento"] carrega automaticamente todos os editais salvos com suas datas
3. [Tabela: Prazos] exibe: Edital, Orgao, Data Abertura, Prazo Limite (3d uteis), Dias Restantes, Status
4. [Coluna: "Dias Restantes"] exibe contagem ou [Badge: "EXPIRADO"] (icone XCircle, error)
5. [Coluna: "Status"] exibe badge colorido: "Urgente" (error), "Atencao" (warning), "OK" (success), "Expirado" (error)
6. Sistema calcula automaticamente prazo de impugnacao: 3 dias uteis antes da data de abertura do certame (Art. 164 Lei 14.133/2021)
7. Badges de urgencia indicam nivel de criticidade de cada prazo em tempo real
8. Usuario revisa prazos e toma decisao sobre quais editais priorizar para impugnacao

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Prazos" (3a aba)

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes"] [Aba: "Prazos" (badge: N urgentes)]

[Card: "Prazos de Impugnacao e Esclarecimento"] (icone Clock) [ref: Passo 2]
  [Texto: "Carregando prazos..."] (icone Loader2) — exibido durante carregamento

  [Tabela: Prazos] [ref: Passo 3]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Data Abertura"] — sortable
    [Coluna: "Prazo Limite (3d uteis)"] — sortable
    [Coluna: "Dias Restantes"] — sortable [ref: Passo 4]
      [Badge: "EXPIRADO"] (error, icone XCircle) — prazo vencido
      [Texto: "{N} dias"] — prazo ativo
    [Coluna: "Status"] — render com badge colorido [ref: Passos 5, 7]
      [Badge: "Expirado"] (error)
      [Badge: "Urgente"] (error)
      [Badge: "Atencao"] (warning)
      [Badge: "OK"] (success)
```

> Nota: A regra "3 dias uteis antes da abertura (Art. 164 Lei 14.133/2021)" e calculada automaticamente pelo sistema. Nao ha campo de configuracao de alerta nesta versao — o controle e visual via badges de urgencia na tabela.

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Prazos"] | 1 |
| [Card: "Prazos de Impugnacao e Esclarecimento"] | 2 |
| [Tabela: Prazos] | 3 |
| [Coluna: "Dias Restantes"] / [Badge: "EXPIRADO"] | 4 |
| [Coluna: "Status"] / badges coloridos | 5, 7 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## [UC-RE01] Monitorar Janela de Recurso

**RF relacionado:** RF-044-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-143, RN-144, RN-145
- Faltantes: RN-158 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-143, RN-144, RN-145, RN-158 [FALTANTE→V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital em fase pos-disputa (lances encerrados)
2. Resultado do certame publicado ou em vias de publicacao
3. Canais de notificacao configurados (WhatsApp, email, alerta sistema)
4. Portal gov.br acessivel para monitoramento

### Pos-condicoes
1. Abertura da janela de recurso detectada automaticamente
2. Notificacoes enviadas em ate 10 minutos apos abertura
3. Intencao de recurso registrada se manifestada pelo usuario
4. LOG de monitoramento completo registrado

### Sequencia de Eventos

1. Usuario acessa RecursosPage (`/app/recursos`) via menu lateral "Recursos"
2. Clica na [Aba: "Monitoramento"] (icone Eye) — primeira aba do painel
3. No [Card: "Monitoramento de Janela de Recurso"], seleciona edital em [Select: "Selecione um edital..."]
4. Ativa canais de notificacao: [Checkbox: "WhatsApp"], [Checkbox: "Email"], [Checkbox: "Alerta no sistema"]
5. Clica [Botao: "Ativar Monitoramento"] (icone Activity, variant primary/success) — sistema inicia monitoramento periodico
6. Indicador de status muda: "Monitoramento Inativo" → "Aguardando" → "JANELA ABERTA"
7. Quando janela e detectada: indicador exibe [Badge: "JANELA ABERTA"] com tempo restante para manifestacao
8. Sistema dispara notificacoes imediatas nos canais ativos (WhatsApp, Email, Alerta sistema)
9. Usuario, notificado, acessa a pagina e visualiza o timer de manifestacao
10. Clica [Botao: "Registrar Intencao de Recurso"] (icone Gavel, variant danger) para manifestar intencao
11. Intencao registrada no banco vinculada ao edital — status atualizado

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Monitoramento" (1a aba)

#### Layout da Tela

```
[Cabecalho: "RECURSOS E CONTRA-RAZOES"]
  [Texto: "Monitoramento, analise e geracao de laudos"]

[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Monitoramento de Janela de Recurso"] (icone Eye) [ref: Passos 3-10]
  [Select: "Selecione um edital..."] [ref: Passo 3]

  [Secao: "Status do Monitoramento"] [ref: Passo 6]
    [Badge: "Monitoramento Inativo"] — estado inicial (icone AlertTriangle)
    [Badge: "Aguardando"] — monitoramento ativo (icone Clock)
    [Badge: "JANELA ABERTA"] — janela detectada (icone AlertTriangle, vermelho) [ref: Passo 7]
    [Badge: "Encerrada"] — janela fechada (icone CheckCircle)
    [Texto: "Tempo restante: {tempoRestante}"] — timer exibido quando janela aberta [ref: Passo 9]

  [Secao: "Canais de Notificacao"] [ref: Passo 4]
    [Checkbox: "WhatsApp"]
    [Checkbox: "Email"]
    [Checkbox: "Alerta no sistema"]

  [Botao: "Ativar Monitoramento"] (icone Activity, variant primary) [ref: Passo 5]
  [Botao: "Registrar Intencao de Recurso"] (icone Gavel, variant danger) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Monitoramento"] | 2 |
| [Select: "Selecione um edital..."] | 3 |
| [Checkbox: "WhatsApp"] | 4 |
| [Checkbox: "Email"] | 4 |
| [Checkbox: "Alerta no sistema"] | 4 |
| [Botao: "Ativar Monitoramento"] | 5 |
| [Badge: status do monitoramento] | 6, 7, 9 |
| [Botao: "Registrar Intencao de Recurso"] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-RE02] Analisar Proposta Vencedora

**RF relacionado:** RF-044-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-137, RN-154
- Faltantes: RN-161 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-137, RN-154, RN-161 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Resultado do certame publicado
2. Proposta vencedora disponivel para analise (documento ou dados do portal)
3. Edital completo com requisitos tecnicos e legais disponivel
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Relatorio de analise da proposta vencedora gerado
2. Inconsistencias na proposta vencedora identificadas e classificadas
3. Comparativo proposta vs edital vs legislacao documentado
4. Subsidios para recurso prontos

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Analise"] (icone Search)
2. No [Card: "Analise de Proposta Vencedora"], seleciona edital em [Select: "Selecione um edital..."]
3. Preenche [TextArea: "Texto da Proposta Vencedora"] com o texto da proposta (cole aqui)
4. Clica [Botao: "Analisar Proposta Vencedora"] (icone Search, variant primary)
5. Sistema exibe [Texto: "Analisando proposta vencedora..."] (icone Loader2) durante processamento
6. IA compara proposta vencedora com: requisitos do edital, legislacao aplicavel, jurisprudencias
7. [Card: "Inconsistencias Identificadas"] (icone AlertTriangle) exibe [Tabela: Inconsistencias Vencedora]
8. [Tabela] mostra: #, Item, Inconsistencia, Motivacao Recurso, Gravidade (ALTA/MEDIA/BAIXA)
9. [Card: "Analise Detalhada"] (icone Shield) exibe analise juridica com artigos e recomendacao
10. Usuario pode clicar [Botao: "Enviar"] para fazer perguntas no chatbox (UC-RE03)
11. Usuario navega para [Aba: "Laudos"] para gerar laudo de recurso (UC-RE04)

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Analise" (2a aba)

#### Layout da Tela

```
[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Analise de Proposta Vencedora"] (icone Search) [ref: Passos 2-4]
  [Select: "Selecione um edital..."] [ref: Passo 2]
  [TextArea: "Texto da Proposta Vencedora (cole aqui)"] — rows 6 [ref: Passo 3]
  [Botao: "Analisar Proposta Vencedora"] (icone Search, variant primary) [ref: Passo 4]
  [Texto: "Analisando proposta vencedora..."] (icone Loader2) [ref: Passo 5]

[Card: "Inconsistencias Identificadas"] (icone AlertTriangle) [ref: Passo 7]
  [Tabela: Inconsistencias Vencedora] [ref: Passo 8]
    [Coluna: "#"] — numero sequencial (width: 50px)
    [Coluna: "Item"] — aspecto avaliado
    [Coluna: "Inconsistencia"] — descricao do desvio
    [Coluna: "Motivacao Recurso"] — fundamento para recurso
    [Coluna: "Gravidade"] — badge colorido (width: 110px) [ref: Passo 8]
      [Badge: "ALTA"] (error)
      [Badge: "MEDIA"] (warning)
      [Badge: "BAIXA"] (info)

[Card: "Analise Detalhada"] (icone Shield) [ref: Passo 9]
  [Secao: "Perguntas sobre a Analise"] (icone MessageSquare) [ref: Passo 10]
    [Secao: "Historico de mensagens"] — area de chat usuario/IA
    [TextInput: "Faca uma pergunta sobre a analise..."] [ref: Passo 10]
    [Botao: "Enviar"] (icone Send, variant primary) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Analise"] | 1 |
| [Card: "Analise de Proposta Vencedora"] | 2, 3, 4 |
| [Select: "Selecione um edital..."] | 2 |
| [TextArea: "Texto da Proposta Vencedora"] | 3 |
| [Botao: "Analisar Proposta Vencedora"] | 4 |
| [Texto: "Analisando..."] (Loader2) | 5 |
| [Card: "Inconsistencias Identificadas"] | 7 |
| [Tabela: Inconsistencias Vencedora] | 8 |
| [Coluna: "Gravidade"] / badges | 8 |
| [Card: "Analise Detalhada"] | 9 |
| [TextInput: pergunta] / [Botao: "Enviar"] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-RE03] Chatbox de Analise

**RF relacionado:** RF-044-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-152
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-152

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Dados do edital, proposta vencedora e inconsistencias carregados no contexto da IA
3. Base de legislacao e jurisprudencias disponivel

### Pos-condicoes
1. Conversa registrada no historico do edital
2. Insights adicionais identificados pela IA
3. Trechos relevantes salvos como notas para uso em laudos (UC-RE04/RE05)

### Sequencia de Eventos

1. Na [Aba: "Analise"], apos analise UC-RE02, usuario localiza [Card: "Analise Detalhada"] / secao de chat
2. Sistema carrega no contexto da IA: edital completo, proposta vencedora, inconsistencias, legislacao
3. Usuario digita pergunta no [TextInput: "Faca uma pergunta sobre a analise..."]
4. Clica [Botao: "Enviar"] (icone Send, variant primary) — mensagem enviada
5. [Texto: "Pensando..."] (icone Loader2) exibido enquanto IA processa
6. IA analisa pergunta no contexto dos documentos e retorna resposta na area de chat
7. Resposta aparece na area de historico de mensagens com referencias a paginas e artigos
8. Usuario pode continuar fazendo perguntas — conversa e cumulativa
9. Historico completo da conversa fica visivel na area de chat

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Analise" (2a aba) — secao Chatbox dentro do Card "Analise Detalhada"

#### Layout da Tela

```
[Card: "Analise Detalhada"] (icone Shield)
  [Card: "Perguntas sobre a Analise"] (icone MessageSquare) [ref: Passo 1]

    [Secao: "Historico de mensagens"] — area de exibicao do chat [ref: Passos 6, 7, 9]
      [Texto: mensagens do usuario] — alinhamento direita
      [Texto: respostas da IA] — alinhamento esquerda
      [Texto: "Pensando..."] (icone Loader2) — durante processamento [ref: Passo 5]

    [TextInput: "Faca uma pergunta sobre a analise..."] [ref: Passo 3]
    [Botao: "Enviar"] (icone Send, variant primary) [ref: Passos 4, 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Perguntas sobre a Analise"] | 1 |
| [TextInput: "Faca uma pergunta..."] | 3, 8 |
| [Botao: "Enviar"] | 4, 8 |
| [Texto: "Pensando..."] | 5 |
| [Secao: "Historico de mensagens"] | 6, 7, 9 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-RE04] Gerar Laudo de Recurso

**RF relacionado:** RF-044-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-144, RN-146, RN-147, RN-149, RN-153
- Faltantes: RN-155 [FALTANTE], RN-157 [FALTANTE], RN-159 [FALTANTE], RN-162 [FALTANTE], RN-163 [FALTANTE], RN-164 [FALTANTE], RN-212 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-144, RN-146, RN-147, RN-149, RN-153, RN-155 [FALTANTE→V4], RN-157 [FALTANTE→V4], RN-159 [FALTANTE→V4], RN-162 [FALTANTE→V4], RN-163 [FALTANTE→V4], RN-164 [FALTANTE→V4], RN-212 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Intencao de recurso manifestada dentro do prazo (UC-RE01)
3. Inconsistencias identificadas e classificadas
4. Base de legislacao e jurisprudencias disponivel
5. Template de laudo selecionado (padrao ou customizado)

### Pos-condicoes
1. Laudo de recurso gerado com secoes juridica e tecnica obrigatorias
2. Laudo em status "rascunho", 100% editavel
3. LOG de criacao e edicoes registrado
4. Documento pronto para exportacao e submissao

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Laudos"] (icone FileText, com badge de quantidade)
2. Clica [Botao: "Novo Laudo"] (icone Plus, variant primary) — Modal "Novo Laudo" abre
3. Preenche [Select: "Edital"] (obrigatorio), [Select: "Tipo"] = "Recurso" (obrigatorio)
4. Preenche [Select: "Subtipo"] = "Administrativo" ou "Tecnico" (obrigatorio)
5. Seleciona [Select: "Template"] e opcionalmente preenche [TextInput: "Empresa Alvo"]
6. Opcionalmente adiciona [TextArea: "Conteudo Inicial"] (rows 8)
7. Clica [Botao: "Criar"] (variant primary) — laudo criado com status "Rascunho"
8. Laudo aparece na [Tabela: Laudos]; usuario clica [Icone-Acao: Eye] para abrir editor
9. [Card: "Editando: {edital_numero} - {tipo} ({subtipo})"] (icone Edit3) exibe editor
10. [TextArea] do editor exibe o texto do laudo (rows 20) — 100% editavel
11. Usuario edita laudo incluindo obrigatoriamente secoes JURIDICA e TECNICA (hint visivel na tela)
12. Clica [Botao: "Salvar Rascunho"] (icone Save) para salvar sem mudar status
13. Clica [Botao: "Enviar para Revisao"] (icone Send) para mudar status
14. Clica [Botao: "Submeter no Portal"] (icone ExternalLink) para prosseguir para UC-RE06
15. Opcionalmente exporta: [Botao: "PDF"] ou [Botao: "DOCX"] (icone Download)

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Laudos" (3a aba) — lista e editor de laudos

#### Layout da Tela

```
[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Laudos de Recurso e Contra-Razao"] (icone FileText)
  [Botao: "Novo Laudo"] (icone Plus, variant primary) [ref: Passo 2]
  [Botao: "Upload Laudo"] (icone Upload) [ref: UC-RE05]

  [Tabela: Laudos] [ref: Passo 8]
    [Coluna: "Edital"] — sortable
    [Coluna: "Tipo"] — "Recurso" ou "Contra-Razao"
    [Coluna: "Subtipo"] — "Tecnico" ou "Administrativo"
    [Coluna: "Empresa Alvo"]
    [Coluna: "Status"] — render com badge e icone
      [Badge: "Rascunho"] (neutral, icone Edit3)
      [Badge: "Revisao"] (warning, icone Eye)
      [Badge: "Protocolado"] (info, icone Send)
      [Badge: "Deferido"] (success, icone CheckCircle)
      [Badge: "Indeferido"] (error, icone XCircle)
    [Coluna: "Data"] — sortable
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — abrir editor [ref: Passo 8]
      [Icone-Acao: Trash2] — excluir laudo (danger)

[Card: "Editando: {edital_numero} - {tipo} ({subtipo})"] (icone Edit3) [ref: Passo 9]
  [Alerta: "Secoes obrigatorias: ## SECAO JURIDICA, ## SECAO TECNICA"] [ref: Passo 11]
  [TextArea] — editor, rows 20, 100% editavel [ref: Passos 10, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 12]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary) [ref: Passo 13]
  [Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) [ref: Passo 14]
  [Botao: "PDF"] (icone Download) [ref: Passo 15]
  [Botao: "DOCX"] (icone Download) [ref: Passo 15]

[Modal: "Novo Laudo"] (disparado por [Botao: "Novo Laudo"]) [ref: Passos 3-7]
  [Select: "Edital"] — obrigatorio [ref: Passo 3]
  [Select: "Tipo"] — "Recurso" ou "Contra-Razao" [ref: Passo 3]
  [Select: "Subtipo"] — "Administrativo" ou "Tecnico" [ref: Passo 4]
  [Select: "Template"] — opcao padrao: "Nenhum (em branco)" [ref: Passo 5]
  [TextInput: "Empresa Alvo"] — opcional [ref: Passo 5]
  [TextArea: "Conteudo Inicial"] — rows 8, opcional [ref: Passo 6]
  [Botao: "Cancelar"]
  [Botao: "Criar"] (variant primary) [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Laudos"] | 1 |
| [Botao: "Novo Laudo"] | 2 |
| [Modal: "Novo Laudo"] | 3, 4, 5, 6, 7 |
| [Select: "Edital"] no modal | 3 |
| [Select: "Tipo"] = "Recurso" | 3 |
| [Select: "Subtipo"] | 4 |
| [Select: "Template"] | 5 |
| [TextInput: "Empresa Alvo"] | 5 |
| [TextArea: "Conteudo Inicial"] | 6 |
| [Botao: "Criar"] | 7 |
| [Tabela: Laudos] | 8 |
| [Icone-Acao: Eye] | 8 |
| [Card: "Editando: ..."] | 9 |
| [TextArea] editor | 10, 11 |
| [Alerta: secoes obrigatorias] | 11 |
| [Botao: "Salvar Rascunho"] | 12 |
| [Botao: "Enviar para Revisao"] | 13 |
| [Botao: "Submeter no Portal"] | 14 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 15 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-RE05] Gerar Laudo de Contra-Razao

**RF relacionado:** RF-044-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-146, RN-148, RN-149, RN-153
- Faltantes: RN-156 [FALTANTE], RN-157 [FALTANTE], RN-160 [FALTANTE], RN-162 [FALTANTE], RN-163 [FALTANTE], RN-164 [FALTANTE], RN-212 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-146, RN-148, RN-149, RN-153, RN-156 [FALTANTE→V4], RN-157 [FALTANTE→V4], RN-160 [FALTANTE→V4], RN-162 [FALTANTE→V4], RN-163 [FALTANTE→V4], RN-164 [FALTANTE→V4], RN-212 [FALTANTE→V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Recurso de outra empresa identificado contra a proposta do usuario
2. Documento de recurso disponivel (PDF/DOCX) ou informacoes sobre os fundamentos
3. Proposta do usuario e edital completo disponiveis
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Laudo de contra-razao gerado com secao de defesa e secao de ataque
2. Defesa: refuta os argumentos do recurso contra a proposta do usuario
3. Ataque: questiona a proposta da empresa recorrente
4. Documento em status "rascunho", 100% editavel
5. LOG de criacao e edicoes registrado

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Laudos"]
2. Clica [Botao: "Novo Laudo"] (icone Plus, variant primary) — Modal "Novo Laudo" abre
3. Preenche [Select: "Edital"], [Select: "Tipo"] = "Contra-Razao", [Select: "Subtipo"]
4. Preenche [TextInput: "Empresa Alvo"] com nome da empresa que interpos o recurso
5. Opcionalmente seleciona [Select: "Template"] e preenche [TextArea: "Conteudo Inicial"]
6. Clica [Botao: "Criar"] — laudo do tipo "Contra-Razao" criado com status "Rascunho"
7. Laudo aparece na [Tabela: Laudos]; usuario clica [Icone-Acao: Eye] para abrir editor
8. [Card: "Editando: {edital} - Contra-Razao ({subtipo})"] exibe editor com conteudo
9. [TextArea] exibe texto do laudo — usuario edita incluindo obrigatoriamente: SECAO DEFESA e SECAO ATAQUE
10. Sistema exibe hint com secoes obrigatorias: `## DEFESA, ## ATAQUE`
11. Usuario salva com [Botao: "Salvar Rascunho"] ou avanca para submissao com [Botao: "Submeter no Portal"]
12. Opcionalmente exporta via [Botao: "PDF"] ou [Botao: "DOCX"]

> Nota: O fluxo de tela e identico ao UC-RE04 — a diferenca e o valor selecionado em [Select: "Tipo"] = "Contra-Razao" e as secoes obrigatorias distintas (DEFESA + ATAQUE ao inves de JURIDICA + TECNICA). Ver layout completo em UC-RE04.

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Laudos" (3a aba) — idem UC-RE04, tipo "Contra-Razao"

#### Layout da Tela

```
[Aba: "Laudos" (badge: N)]

[Card: "Laudos de Recurso e Contra-Razao"] (icone FileText)
  [Botao: "Novo Laudo"] (icone Plus, variant primary) [ref: Passo 2]

  [Tabela: Laudos]
    [Coluna: "Tipo"] — "Contra-Razao" [ref: Passo 3]
    [Coluna: "Empresa Alvo"] — empresa recorrente [ref: Passo 4]
    [Coluna: "Status"]
      [Badge: "Rascunho"] (neutral)
      [Badge: "Revisao"] (warning)
      [Badge: "Protocolado"] (info)

[Card: "Editando: {edital} - Contra-Razao ({subtipo})"] (icone Edit3) [ref: Passo 8]
  [Alerta: "Secoes obrigatorias: ## SECAO JURIDICA, ## SECAO TECNICA | Adicionais: ## DEFESA, ## ATAQUE"] [ref: Passos 9, 10]
  [TextArea] — editor, rows 20 [ref: Passos 9, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 11]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary)
  [Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) [ref: Passo 11]
  [Botao: "PDF"] (icone Download) [ref: Passo 12]
  [Botao: "DOCX"] (icone Download) [ref: Passo 12]

[Modal: "Novo Laudo"] [ref: Passos 3-6]
  [Select: "Tipo"] = "Contra-Razao" [ref: Passo 3]
  [TextInput: "Empresa Alvo"] — empresa que interpos o recurso [ref: Passo 4]
  [Botao: "Criar"] (variant primary) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Laudos"] | 1 |
| [Botao: "Novo Laudo"] | 2 |
| [Select: "Tipo"] = "Contra-Razao" | 3 |
| [Select: "Subtipo"] | 3 |
| [TextInput: "Empresa Alvo"] | 4 |
| [Select: "Template"] / [TextArea: "Conteudo Inicial"] | 5 |
| [Botao: "Criar"] | 6 |
| [Tabela: Laudos] / [Icone-Acao: Eye] | 7 |
| [Card: "Editando: ... Contra-Razao"] | 8 |
| [TextArea] editor | 9 |
| [Alerta: secoes obrigatorias DEFESA/ATAQUE] | 10 |
| [Botao: "Salvar Rascunho"] / [Botao: "Submeter no Portal"] | 11 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-RE06] Submissao Assistida no Portal

**RF relacionado:** RF-044-06

**Regras de Negocio aplicaveis:**
- Presentes: RN-150, RN-151
- Faltantes: RN-155 [FALTANTE], RN-156 [FALTANTE], RN-164 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-150, RN-151, RN-155 [FALTANTE→V4], RN-156 [FALTANTE→V4], RN-164 [FALTANTE→V4]

**Ator:** Usuario (submissao manual assistida pelo sistema)

### Pre-condicoes
1. Peticao (impugnacao, recurso ou contra-razao) gerada e aprovada
2. Documento dentro dos limites de tamanho do portal
3. Credenciais de acesso ao portal configuradas
4. Prazo de submissao nao expirado

### Pos-condicoes
1. Peticao validada (formato, tamanho, secoes obrigatorias)
2. Documento exportado em PDF pronto para upload manual
3. Link direto para portal gov.br aberto
4. Status de submissao registrado no sistema (protocolo, data/hora)
5. LOG de submissao registrado

### Sequencia de Eventos

1. No editor de laudo (UC-RE04 ou UC-RE05), usuario clica [Botao: "Submeter no Portal"] (icone ExternalLink)
2. [Modal: "Submissao Assistida no Portal"] abre (size: large)
3. Modal exibe dados da peticao: Tipo (badge), Edital, Subtipo em modo readonly
4. [Secao: "Validacao Pre-Envio"] exibe checklist automatico com 6 validacoes:
   - Tamanho do arquivo dentro do limite
   - Formato aceito pelo portal
   - Prazo de submissao valido
   - Secao juridica presente
   - Secao tecnica presente
   - Assinatura/identificacao presente
5. Resultado da validacao: [Texto: "✅ Todas as validacoes passaram"] ou [Texto: "❌ Ha validacoes pendentes"]
6. [Passo 1] usuario clica [Botao: "Exportar PDF"] ou [Botao: "Exportar DOCX"] para baixar o documento
7. [Passo 2] usuario clica [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) — abre nova aba com link para portal gov.br
8. Usuario faz upload MANUAL do PDF no portal gov.br
9. Apos submissao, usuario preenche [TextInput: "Protocolo de Submissao"] com protocolo recebido do portal
10. Clica [Botao: "Registrar Submissao"] (icone CheckCircle) — sistema salva protocolo, data/hora
11. Modal exibe [Texto: "✅ SUBMETIDO COM SUCESSO"] — status do laudo atualizado para "Protocolado"
12. [Botao: "Fechar"] encerra o modal

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Modal "Submissao Assistida no Portal" — disparado pelo [Botao: "Submeter no Portal"] no editor

#### Layout da Tela

```
[Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) — no editor de laudos [ref: Passo 1]

[Modal: "Submissao Assistida no Portal"] (size: large) [ref: Passo 2]

  [Secao: "Dados da Peticao"] [ref: Passo 3]
    [Badge: "RECURSO"] ou [Badge: "CONTRA-RAZÃO"] — tipo da peticao (readonly)
    [Texto: Edital] — readonly
    [Texto: Subtipo] — readonly

  [Secao: "Validacao Pre-Envio"] [ref: Passo 4]
    [Checkbox] (readonly) "Tamanho do arquivo dentro do limite"
    [Checkbox] (readonly) "Formato aceito pelo portal"
    [Checkbox] (readonly) "Prazo de submissao valido"
    [Checkbox] (readonly) "Secao juridica presente"
    [Checkbox] (readonly) "Secao tecnica presente"
    [Checkbox] (readonly) "Assinatura/identificacao presente"
    [Texto: "✅ Todas as validacoes passaram"] ou [Texto: "❌ Ha validacoes pendentes"] [ref: Passo 5]

  [Secao: "Passo 1 — Exportar Documento"] [ref: Passo 6]
    [Botao: "Exportar PDF"] (icone Download) [ref: Passo 6]
    [Botao: "Exportar DOCX"] (icone Download) [ref: Passo 6]

  [Secao: "Passo 2 — Submeter no Portal gov.br"] [ref: Passo 7]
    [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) [ref: Passo 7]

  [Secao: "Passo 3 — Registrar Protocolo"] [ref: Passos 9, 10]
    [TextInput: "Protocolo de Submissao"] — placeholder "Ex: PNCP-2026-0046-REC-001" [ref: Passo 9]
    [Botao: "Registrar Submissao"] (icone CheckCircle) [ref: Passo 10]

  [Secao: "Resultado"] [ref: Passo 11]
    [Texto: "✅ SUBMETIDO COM SUCESSO"] — exibido apos registro

  [Rodape do Modal]
    [Botao: "Cancelar"] (variant secondary) — antes da submissao
    [Botao: "Fechar"] — apos submissao registrada [ref: Passo 12]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Submeter no Portal"] | 1 |
| [Modal: "Submissao Assistida no Portal"] | 2 |
| [Secao: "Dados da Peticao"] | 3 |
| [Secao: "Validacao Pre-Envio"] / checkboxes readonly | 4 |
| [Texto: "✅ Todas as validacoes..."] | 5 |
| [Botao: "Exportar PDF"] / [Botao: "Exportar DOCX"] | 6 |
| [Botao: "Abrir Portal ComprasNet"] | 7 |
| [TextInput: "Protocolo de Submissao"] | 9 |
| [Botao: "Registrar Submissao"] | 10 |
| [Texto: "✅ SUBMETIDO COM SUCESSO"] | 11 |
| [Botao: "Fechar"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO** — Versao assistida (validacao + exportacao + link portal + registro manual de protocolo)

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## [UC-FU01] Registrar Resultado de Edital

**RF relacionado:** RF-045-01
**Ator:** Usuario

### Pre-condicoes
1. Edital submetido (proposta enviada ao portal)
2. Resultado do certame publicado (vitoria, derrota ou cancelamento)
3. Usuario autenticado no sistema

### Pos-condicoes
1. Resultado registrado no banco vinculado ao edital
2. Status do edital atualizado (Vitoria, Derrota ou Cancelado)
3. Metricas de taxa de sucesso atualizadas automaticamente
4. LOG de registro criado

### Sequencia de Eventos

1. Usuario acessa FollowupPage (`/app/followup`) via menu lateral "Follow-up"
2. Cabecalho exibe [Card: Stat] com 4 metricas: Pendentes, Vitorias, Derrotas, Taxa de Sucesso
3. Na [Aba: "Resultados"], [Card: "Editais Pendentes de Resultado"] exibe editais aguardando registro
4. [Tabela: Editais Pendentes] mostra: Edital, Orgao, Data Submissao, Valor Proposta, Acao
5. Usuario clica [Botao: "Registrar"] na coluna Acao do edital desejado
6. [Modal: "Registrar Resultado — {numero}"] abre
7. Usuario seleciona tipo via [Radio: "Vitoria"], [Radio: "Derrota"] ou [Radio: "Cancelado"]
8. **Se Vitoria:** preenche [TextInput: "Valor Final (R$)"]
9. **Se Derrota:** preenche [TextInput: "Valor Final (R$)"], [TextInput: "Empresa Vencedora"], [Select: "Motivo da Derrota"] (Preco/Tecnico/Documental/Recurso/ME-EPP/Outro)
10. **Se Cancelado:** preenche [TextArea: "Justificativa do Cancelamento"]
11. Opcionalmente preenche [TextArea: "Observacoes"]
12. Clica [Botao: "Registrar"] (variant primary) no rodape do modal
13. Modal fecha; edital sai da tabela de Pendentes e aparece em [Card: "Resultados Registrados"]
14. [Cards Stat] atualizam: Vitorias, Derrotas, Taxa de Sucesso recalculados

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Header com Stat Cards + Aba "Resultados"

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 2]
  [Card: "Pendentes"] (icone Clock, cor: #3b82f6)
  [Card: "Vitorias"] (icone Trophy, cor: #16a34a)
  [Card: "Derrotas"] (icone XCircle, cor: #dc2626)
  [Card: "Taxa de Sucesso"] (icone Ban, cor: #eab308)

[Aba: "Resultados"] [Aba: "Alertas"]

[Card: "Editais Pendentes de Resultado"] [ref: Passo 3]
  [Tabela: Editais Pendentes] [ref: Passo 4]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Data Submissao"] — toLocaleDateString
    [Coluna: "Valor Proposta"] — formatado R$
    [Coluna: "Acao"]
      [Botao: "Registrar"] — abre modal [ref: Passo 5]

[Card: "Resultados Registrados"] [ref: Passo 13]
  [Tabela: Resultados]
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Resultado"] — badge colorido
      [Badge: "Vitoria"] (background: #16a34a)
      [Badge: "Derrota"] (background: #dc2626)
      [Badge: "Cancelado"] (background: #6b7280)
    [Coluna: "Valor Final"] — formatado R$
    [Coluna: "Data"] — toLocaleDateString

[Modal: "Registrar Resultado — {numero}"] [ref: Passos 6-12]
  [Radio: "Vitoria"] [ref: Passo 7]
  [Radio: "Derrota"] [ref: Passo 7]
  [Radio: "Cancelado"] [ref: Passo 7]

  [TextInput: "Valor Final (R$)"] — condicional: visivel se tipo != "cancelado" [ref: Passos 8, 9]
  [TextInput: "Empresa Vencedora"] — condicional: visivel se tipo == "derrota" [ref: Passo 9]
  [Select: "Motivo da Derrota"] — condicional: visivel se tipo == "derrota" [ref: Passo 9]
    opcoes: "Preco", "Tecnico", "Documental", "Recurso", "ME/EPP", "Outro"
  [TextArea: "Justificativa do Cancelamento"] — condicional: visivel se tipo == "cancelado" [ref: Passo 10]
  [TextArea: "Observacoes"] — sempre visivel, opcional [ref: Passo 11]

  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Registrar"] (variant primary) [ref: Passo 12]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Stat Cards: Pendentes/Vitorias/Derrotas/Taxa] | 2, 14 |
| [Aba: "Resultados"] | 3 |
| [Card: "Editais Pendentes de Resultado"] | 3 |
| [Tabela: Editais Pendentes] | 4 |
| [Botao: "Registrar"] na tabela | 5 |
| [Modal: "Registrar Resultado"] | 6 |
| [Radio: "Vitoria" / "Derrota" / "Cancelado"] | 7 |
| [TextInput: "Valor Final"] | 8, 9 |
| [TextInput: "Empresa Vencedora"] | 9 |
| [Select: "Motivo da Derrota"] | 9 |
| [TextArea: "Justificativa do Cancelamento"] | 10 |
| [TextArea: "Observacoes"] | 11 |
| [Botao: "Registrar"] no modal | 12 |
| [Card: "Resultados Registrados"] | 13 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-FU02] Configurar Alertas de Vencimento

**RF relacionado:** RF-045-02
**Ator:** Sistema (automatico) + Usuario (visualizacao)

### Pre-condicoes
1. Contratos e Atas de Registro de Preco (ARPs) cadastrados no sistema
2. Datas de vencimento definidas nos registros

### Pos-condicoes
1. Vencimentos proximos exibidos com badges de urgencia
2. Regras de alerta visiveis para o usuario
3. Usuario informado sobre contratos e ARPs proximos do vencimento

### Sequencia de Eventos

1. Usuario acessa FollowupPage e clica na [Aba: "Alertas"]
2. [Secao: Summary Cards] exibe 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d)
3. [Card: "Proximos Vencimentos"] (icone Bell) carrega dados de contratos e ARPs
4. [Botao: "Atualizar"] (variant secondary) recarrega os dados
5. [Tabela: Proximos Vencimentos] exibe: Tipo (badge), Nome, Data, Dias, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul), arp (roxo), outro (amarelo)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho (<7d), laranja (7-15d), amarelo (15-30d), verde (>30d)
8. [Card: "Regras de Alerta Configuradas"] exibe tabela com regras configuradas no modulo de gestao
9. [Tabela: Regras] mostra: Tipo, 30d, 15d, 7d, 1d, Email, Push, Ativo (exibidos como ✅ ou —)
10. Se sem vencimentos: [Texto: "Nenhum vencimento nos proximos 90 dias"]
11. Se sem regras: [Texto: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."]

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
  [Texto: "Nenhum vencimento nos proximos 90 dias"] — se vazio [ref: Passo 10]

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

[Card: "Regras de Alerta Configuradas"] [ref: Passos 8, 9]
  [Texto: "Nenhuma regra configurada..."] — se vazio [ref: Passo 11]

  [Tabela: Regras de Alerta] [ref: Passo 9]
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
| [Coluna: "Tipo"] / badges contrato/arp | 6 |
| [Coluna: "Urgencia"] / badges coloridos | 7 |
| [Card: "Regras de Alerta Configuradas"] | 8 |
| [Tabela: Regras de Alerta] | 9 |
| [Texto: "Nenhum vencimento..."] | 10 |
| [Texto: "Nenhuma regra configurada..."] | 11 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

## [UC-FU03] Score Logistico

**RF relacionado:** RF-045-03
**Ator:** Sistema (calculo automatico) + Usuario (visualizacao)

### Pre-condicoes
1. Produto vinculado ao edital (via PortfolioPage)
2. Parametros logisticos configurados (distancia, prazo, capacidade)
3. Edital com dados de entrega definidos

### Pos-condicoes
1. Score logistico calculado e exibido com valor numerico
2. Componentes do score detalhados (distancia, prazo, capacidade)
3. Subsidio adicional para decisao de participar ou nao do certame

### Sequencia de Eventos

1. Usuario acessa FollowupPage — score logistico e calculado automaticamente via API (`/api/score-logistico`)
2. Score e exibido como card de estatistica na interface da FollowupPage
3. [Card: Stat "Score Logistico"] exibe valor numerico calculado
4. Componentes: distancia (entre empresa e orgao), prazo de entrega (viabilidade), capacidade produtiva
5. Score subsidia a decisao de participar do certame ao lado dos demais indicadores (GO/NO-GO da ValidacaoPage)
6. Usuario interpreta o score: quanto mais alto, maior viabilidade logistica de atender o contrato

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Area de estatisticas / cards de KPI

#### Layout da Tela

```
[Cabecalho: "Follow-up de Resultados"]

[Secao: Stat Cards] [ref: Passos 2, 3]
  [Card: "Score Logistico"] — valor numerico calculado via API [ref: Passo 3]
    [Texto: valor do score] — ex: "87" ou "N/A"
    [Texto: descricao] — componentes: distancia, prazo, capacidade [ref: Passo 4]
```

> Nota: O Score Logistico e calculado pelo backend via endpoint `/api/score-logistico` e retornado como valor numerico. A exibicao e integrada aos demais cards de estatistica da FollowupPage.

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Score Logistico"] | 2, 3 |
| [Texto: valor numerico] | 3 |
| [Texto: componentes distancia/prazo/capacidade] | 4 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# RESUMO FINAL DE IMPLEMENTACAO

| Caso de Uso | Fase | Pagina | Aba / Posicao | Status |
|-------------|------|--------|---------------|--------|
| UC-I01 | IMPUGNACAO | ImpugnacaoPage | Aba "Validacao Legal" | ✅ IMPLEMENTADO |
| UC-I02 | IMPUGNACAO | ImpugnacaoPage | Aba "Peticoes" — sugestao | ✅ IMPLEMENTADO |
| UC-I03 | IMPUGNACAO | ImpugnacaoPage | Aba "Peticoes" — editor | ✅ IMPLEMENTADO |
| UC-I04 | IMPUGNACAO | ImpugnacaoPage | Aba "Peticoes" — modal upload | ✅ IMPLEMENTADO |
| UC-I05 | IMPUGNACAO | ImpugnacaoPage | Aba "Prazos" | ✅ IMPLEMENTADO |
| UC-RE01 | RECURSOS | RecursosPage | Aba "Monitoramento" | ✅ IMPLEMENTADO |
| UC-RE02 | RECURSOS | RecursosPage | Aba "Analise" — analise vencedora | ✅ IMPLEMENTADO |
| UC-RE03 | RECURSOS | RecursosPage | Aba "Analise" — chatbox | ✅ IMPLEMENTADO |
| UC-RE04 | RECURSOS | RecursosPage | Aba "Laudos" — tipo Recurso | ✅ IMPLEMENTADO |
| UC-RE05 | RECURSOS | RecursosPage | Aba "Laudos" — tipo Contra-Razao | ✅ IMPLEMENTADO |
| UC-RE06 | RECURSOS | RecursosPage | Modal "Submissao Assistida" | ✅ IMPLEMENTADO |
| UC-FU01 | FOLLOWUP | FollowupPage | Aba "Resultados" | ✅ IMPLEMENTADO |
| UC-FU02 | FOLLOWUP | FollowupPage | Aba "Alertas" | ✅ IMPLEMENTADO |
| UC-FU03 | FOLLOWUP | FollowupPage | Stat Card Score Logistico | ✅ IMPLEMENTADO |

**Totais:** 14 implementados + 0 parciais + 0 nao implementados = **14 casos de uso**

---

*Documento gerado em 01/04/2026. V2.0 — Adicionadas secoes Tela(s) Representativa(s) com layout hierarquico, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos. Tambem incluidos UC-FU01, UC-FU02 e UC-FU03 (FollowupPage) ausentes no V1.*
