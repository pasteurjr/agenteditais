# CASOS DE USO — IMPUGNACAO, RECURSOS E CONTRA-RAZOES

<!-- V7 GENERATED — secao 'UCs predecessores' adicionada automaticamente em 2026-04-28 -->


**Data:** 21/04/2026
**Versao:** 5.0
**Base:** requisitos_completosv6.md (RF-043, RF-044) + SPRINT RECURSOS E IMPUGNACOES - V02.docx
**Objetivo:** Definir detalhadamente a interacao do usuario com a interface, incluindo telas, campos, botoes, pre/pos condicoes e sequencia de eventos para os modulos de Impugnacao/Esclarecimentos e Recursos/Contra-Razoes.
**Novidade V3:** Cada UC agora inclui uma secao **Regras de Negocio aplicaveis** referenciando as RNs formalizadas na secao 13 do `requisitos_completosv8.md`. Esta sprint mapeia 32 RNs (presentes + faltantes). Todo o conteudo V2 permanece preservado.
**Novidade V4:** Anotacoes de RNs efetivamente implementadas no backend (linhas `**RNs aplicadas:**`) em UCs criticos + nova secao "Regras de Negocio Implementadas (V4)" com tabela de mapeamento RN -> arquivo backend. RNs em modo warn-only por padrao.
**Novidade V5:** Adicionados **Fluxos Alternativos** (FA-01, FA-02...) e **Fluxos de Excecao** (FE-01, FE-02...) para todos os 14 UCs. FAs cobrem caminhos alternativos validos; FEs cobrem erros e situacoes excepcionais.
**Nota v1.1:** UC-D01/D02 (Disputas de Lances) removidos desta sprint — movidos para sprint futura dedicada (etapa 7 do workflow, entre Submissao e Followup).
**Nota v2.0:** Adicionadas secoes "Tela(s) Representativa(s)" com layout hierarquico de elementos de tela, tags de tipo e mapeamento bidirecional Tela <-> Sequencia de Eventos para cada UC.

---

## Regras de Negocio Implementadas (V4)

Esta versao V4 documenta as Regras de Negocio (RNs) ja enforcadas no backend. Por padrao estao em modo **warn-only** (`ENFORCE_RN_VALIDATORS=false`). Ativar com `ENFORCE_RN_VALIDATORS=true`.

**Total de RNs unicas anotadas nesta V4:** 33 RNs (RN-133 a RN-164 + RN-212), distribuidas em 11 UCs (UC-I01..I05 + UC-RE01..RE06). RNs marcadas `[FALTANTE->V4]` foram identificadas como gap pre-V4 e implementadas/documentadas nesta versao.

| RN | Descricao | UC afetado | Arquivo backend |
|---|---|---|---|
| RN-155 | Contagem de prazo exclui sabado/domingo | UC de impugnacao, UC de recurso | `backend/rn_prazos.py::is_dia_util` |
| RN-156 | Prazo de impugnacao = 3 dias uteis antes da abertura (Art. 164 Lei 14.133/2021) | UC de registro de impugnacao | `backend/rn_prazos.py::prazo_impugnacao_final` |
| RN-160 | Helper `dias_uteis_entre` para calculos auxiliares | UCs de prazo | `backend/rn_prazos.py::dias_uteis_entre` |
| RN-163 | Calendario considera feriados nacionais BR via `workalendar.america.Brazil` (Tiradentes, Carnaval, Corpus Christi, etc). Fallback sab/dom se lib ausente | UCs com contagem de prazo | `backend/rn_prazos.py` |
| RN-084 | Cooldown 60s DeepSeek (analise de edital, geracao de peticao IA) | UCs de analise legal IA, geracao de peticao | `backend/rn_deepseek.py::check_cooldown` |
| RN-132 | Audit de invocacoes DeepSeek | UCs com pipelines IA | `backend/rn_audit.py::audited_tool` |
| RN-037 | Audit log universal em impugnacoes e recursos | UCs de criacao de impugnacao/recurso | `backend/rn_audit.py::log_transicao` |

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

**RNs aplicadas:** RN-135, RN-136, RN-137, RN-161 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Documento do edital esta disponivel (PDF importado ou texto extraido)
4. Base de legislacao configurada (Lei 14.133/2021, decretos regulamentadores, jurisprudencias)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos (V5)

**FA-01 — Edital sem inconsistencias detectadas**
1. IA processa o edital completo (Passo 6)
2. IA nao detecta nenhuma inconsistencia legal
3. [Card: "Resultado da Analise"] exibe mensagem: "Nenhuma inconsistencia detectada. Edital em conformidade com a legislacao vigente."
4. Tabela de inconsistencias permanece vazia
5. Usuario pode prosseguir para outros UCs ou selecionar outro edital

**FA-02 — Re-analisar edital apos alteracao**
1. Usuario ja executou analise anterior para o mesmo edital
2. Seleciona o mesmo edital no [Select: "Selecione o Edital"]
3. Clica novamente em [Botao: "Analisar Edital"]
4. Sistema sobrescreve resultado anterior com nova analise
5. Nova tabela de inconsistencias e exibida (pode diferir da anterior se o edital foi atualizado)

**FA-03 — Selecionar edital diferente durante revisao**
1. Usuario esta revisando inconsistencias de um edital (Passo 11)
2. Seleciona outro edital no [Select: "Selecione o Edital"]
3. Tabela de inconsistencias e limpa
4. Sistema aguarda novo clique em "Analisar Edital" para processar o novo edital

### Fluxos de Excecao (V5)

**FE-01 — Edital sem PDF disponivel**
1. Usuario seleciona edital no Passo 3
2. Sistema detecta que o PDF do edital nao esta disponivel (nao foi importado ou arquivo corrompido)
3. Mensagem de erro: "PDF do edital nao encontrado. Importe o documento na CaptacaoPage antes de analisar."
4. [Botao: "Analisar Edital"] permanece desabilitado ate que o PDF esteja disponivel

**FE-02 — Falha na comunicacao com o agente IA (timeout)**
1. Usuario clica [Botao: "Analisar Edital"] (Passo 5)
2. Requisicao ao agente IA excede o timeout (120 segundos)
3. Mensagem de erro: "Tempo limite excedido na analise. Tente novamente em alguns minutos."
4. [Texto: "Analisando..."] e substituido pela mensagem de erro
5. [Botao: "Analisar Edital"] e reabilitado para nova tentativa

**FE-03 — Nenhum edital salvo no sistema**
1. Usuario acessa [Aba: "Validacao Legal"] (Passo 2)
2. [Select: "Selecione o Edital"] esta vazio — nenhum edital salvo
3. Mensagem informativa: "Nenhum edital disponivel. Salve um edital na CaptacaoPage primeiro."
4. [Botao: "Analisar Edital"] permanece desabilitado

**FE-04 — Cooldown da IA ativo (RN-084)**
1. Usuario clica [Botao: "Analisar Edital"] menos de 60 segundos apos ultima invocacao da IA
2. Sistema bloqueia a requisicao por cooldown (RN-084)
3. Mensagem: "Aguarde {N} segundos antes de realizar nova analise (cooldown ativo)."
4. Botao permanece desabilitado ate fim do cooldown

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

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-I01**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos (V5)

**FA-01 — Criar peticao sem template (conteudo em branco)**
1. Usuario clica [Botao: "Nova Peticao"] (Passo 5)
2. Seleciona [Select: "Template"] = "Nenhum (em branco)"
3. Deixa [TextArea: "Conteudo"] vazio
4. Clica [Botao: "Criar"]
5. Peticao criada com conteudo vazio em status "rascunho" — usuario pode editar depois no editor (UC-I03)

**FA-02 — Criar peticao de tipo diferente do sugerido pela IA**
1. IA sugere "Esclarecimento" para uma inconsistencia
2. Usuario avalia que a situacao requer "Impugnacao"
3. No modal, seleciona [Select: "Tipo"] = "Impugnacao" (contrariando a sugestao da IA)
4. Peticao criada com o tipo definido pelo usuario
5. Sistema aceita a decisao do usuario sem restricao

**FA-03 — Criar multiplas peticoes para o mesmo edital**
1. Usuario ja criou uma peticao para o edital (Passo 8)
2. Clica novamente em [Botao: "Nova Peticao"]
3. Cria segunda peticao (ex: Esclarecimento + Impugnacao separados)
4. Ambas aparecem na [Tabela: Peticoes] vinculadas ao mesmo edital

### Fluxos de Excecao (V5)

**FE-01 — Nenhum edital selecionado no modal**
1. Usuario clica [Botao: "Nova Peticao"] (Passo 5)
2. Deixa [Select: "Edital"] sem selecao
3. Clica [Botao: "Criar"]
4. Validacao: mensagem "Selecione um edital" — modal nao fecha
5. Campo [Select: "Edital"] e destacado como obrigatorio

**FE-02 — Tipo de peticao nao selecionado**
1. Usuario preenche [Select: "Edital"] mas nao seleciona [Select: "Tipo"]
2. Clica [Botao: "Criar"]
3. Validacao: mensagem "Selecione o tipo da peticao (Esclarecimento ou Impugnacao)"
4. Modal nao fecha

**FE-03 — Erro ao salvar peticao no banco**
1. Usuario preenche todos os campos e clica [Botao: "Criar"]
2. Requisicao ao backend falha (erro de rede ou banco indisponivel)
3. Mensagem de erro: "Erro ao criar peticao. Tente novamente."
4. Modal permanece aberto com dados preenchidos preservados

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

**RNs aplicadas:** RN-133, RN-134, RN-139, RN-140, RN-153, RN-157 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Inconsistencias classificadas e tipo de peticao definido (UC-I02)
2. Pelo menos uma inconsistencia marcada como "Impugnacao"
3. Base de legislacao e jurisprudencias disponivel
4. Templates de peticao configurados (padrao ou customizado)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-I02**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos (V5)

**FA-01 — Gerar peticao sem conteudo inicial (IA gera do zero)**
1. Usuario cria peticao com [TextArea: "Conteudo"] vazio (Passo 4 omitido)
2. Abre editor (Passo 6-7) — [TextArea] esta vazio
3. Clica [Botao: "Gerar Peticao"] (Passo 9)
4. IA gera peticao completa baseada apenas nas inconsistencias do edital
5. Fluxo continua no Passo 10

**FA-02 — Editar peticao gerada e salvar multiplas vezes**
1. IA gera peticao (Passo 10)
2. Usuario edita trecho do texto (Passo 11)
3. Clica [Botao: "Salvar Rascunho"] — salva versao 1
4. Edita novamente — adiciona novo argumento juridico
5. Clica [Botao: "Salvar Rascunho"] novamente — salva versao 2
6. Todas as versoes sao salvas com LOG de edicao

**FA-03 — Exportar em DOCX ao inves de PDF**
1. Apos revisao do texto (Passo 11)
2. Usuario clica [Botao: "DOCX"] ao inves de [Botao: "PDF"]
3. Sistema gera arquivo DOCX com o conteudo da peticao
4. Download do arquivo DOCX inicia automaticamente

**FA-04 — Pular revisao e enviar diretamente para revisao**
1. IA gera peticao (Passo 10)
2. Usuario aceita o texto sem edicao
3. Clica diretamente [Botao: "Enviar para Revisao"] sem editar ou salvar rascunho
4. Status muda para "Em Revisao"

### Fluxos de Excecao (V5)

**FE-01 — IA falha ao gerar peticao (timeout ou erro)**
1. Usuario clica [Botao: "Gerar Peticao"] (Passo 9)
2. Requisicao a IA excede timeout (120 segundos) ou retorna erro
3. Mensagem: "Erro ao gerar peticao via IA. Tente novamente."
4. [TextArea] do editor mantem conteudo anterior (se houver)
5. [Botao: "Gerar Peticao"] e reabilitado

**FE-02 — Exportacao PDF falha**
1. Usuario clica [Botao: "PDF"] (Passo 14)
2. Erro na geracao do PDF (conteudo vazio ou problema no servidor)
3. Mensagem: "Erro ao exportar PDF. Verifique o conteudo da peticao."
4. Sistema sugere salvar rascunho primeiro

**FE-03 — Peticao sem secoes obrigatorias ao enviar para revisao**
1. Usuario edita peticao e remove secoes obrigatorias (ex: remove "Do Pedido")
2. Clica [Botao: "Enviar para Revisao"]
3. Sistema aceita a peticao (sem validacao de secoes nesta fase — e recomendacao, nao bloqueio)
4. Aviso (warning): "Recomendamos incluir todas as secoes obrigatorias antes do envio."

**FE-04 — Cooldown da IA ativo ao gerar peticao (RN-084)**
1. Usuario clica [Botao: "Gerar Peticao"] menos de 60s apos ultima chamada IA
2. Cooldown ativo (RN-084)
3. Mensagem: "Aguarde {N} segundos antes de gerar nova peticao."
4. Botao desabilitado temporariamente

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

**RNs aplicadas:** RN-140, RN-141, RN-162 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital esta salvo no sistema
3. Usuario possui peticao de impugnacao elaborada fora do sistema (DOCX/PDF)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


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

### Fluxos Alternativos (V5)

**FA-01 — Upload de arquivo DOCX ao inves de PDF**
1. Usuario seleciona arquivo .docx no Passo 4
2. Sistema aceita o formato (dentro dos formatos permitidos: .docx, .pdf, .doc)
3. Arquivo DOCX e salvo e vinculado ao edital
4. Fluxo continua normalmente a partir do Passo 6

**FA-02 — Cancelar upload apos selecionar arquivo**
1. Usuario seleciona arquivo (Passo 4-5)
2. Decide cancelar e clica [Botao: "Cancelar"] no modal
3. Modal fecha sem salvar — nenhum arquivo e enviado
4. Tabela de peticoes permanece inalterada

**FA-03 — Upload de segunda peticao externa para o mesmo edital**
1. Ja existe uma peticao externa vinculada ao edital
2. Usuario clica novamente em [Botao: "Upload Peticao"]
3. Seleciona o mesmo edital e outro arquivo
4. Sistema aceita — segunda peticao criada
5. Tabela exibe ambas as peticoes externas

### Fluxos de Excecao (V5)

**FE-01 — Formato de arquivo invalido**
1. Usuario seleciona arquivo com extensao nao suportada (ex: .txt, .xlsx, .png)
2. Sistema rejeita: mensagem "Formato nao aceito. Envie arquivo .pdf, .docx ou .doc."
3. [Campo: "Arquivo"] e limpo para nova selecao
4. [Botao: "Upload"] permanece desabilitado

**FE-02 — Arquivo excede limite de tamanho**
1. Usuario seleciona arquivo PDF com mais de 10 MB (limite do sistema)
2. Sistema rejeita: mensagem "Arquivo muito grande. Limite maximo: 10 MB."
3. [Campo: "Arquivo"] e limpo

**FE-03 — Nenhum edital selecionado no modal**
1. Usuario seleciona arquivo mas nao seleciona edital no [Select: "Edital"]
2. Clica [Botao: "Upload"]
3. Validacao: mensagem "Selecione um edital para vincular a peticao."
4. Modal nao fecha

**FE-04 — Falha no upload (erro de rede)**
1. Usuario clica [Botao: "Upload"] (Passo 6)
2. Requisicao falha por erro de rede ou backend indisponivel
3. Mensagem: "Erro ao enviar arquivo. Verifique sua conexao e tente novamente."
4. Modal permanece aberto com arquivo selecionado preservado

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

**RNs aplicadas:** RN-133, RN-142, RN-158 [FALTANTE->V4], RN-163 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital salvo no sistema com data de abertura definida
2. Peticao em elaboracao ou planejada para o edital
3. Canais de notificacao configurados (email, WhatsApp, sistema)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**
- **UC-I03 OU UC-I04**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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

### Fluxos Alternativos (V5)

**FA-01 — Todos os prazos expirados**
1. Usuario acessa [Aba: "Prazos"]
2. Todos os editais na tabela tem prazo de impugnacao ja expirado
3. [Coluna: "Dias Restantes"] exibe [Badge: "EXPIRADO"] para todas as linhas
4. [Coluna: "Status"] exibe [Badge: "Expirado"] (vermelho) em todas as linhas
5. Nenhuma acao de impugnacao disponivel para esses editais

**FA-02 — Edital com data de abertura futura distante (prazo confortavel)**
1. Edital tem data de abertura em 30+ dias
2. [Coluna: "Dias Restantes"] exibe numero alto (ex: "27 dias")
3. [Coluna: "Status"] exibe [Badge: "OK"] (verde)
4. Usuario pode postergar a elaboracao da peticao

**FA-03 — Multiplos editais com prazos diferentes**
1. Tabela exibe 3+ editais com prazos variados
2. Editais com prazo urgente (< 3 dias) aparecem com badge vermelho
3. Editais com prazo moderado (3-7 dias) aparecem com badge amarelo
4. Usuario ordena tabela por "Dias Restantes" para priorizar editais mais urgentes

### Fluxos de Excecao (V5)

**FE-01 — Edital sem data de abertura definida**
1. Edital salvo no sistema sem data de abertura (campo nulo ou vazio)
2. Sistema nao consegue calcular prazo de impugnacao
3. [Coluna: "Prazo Limite"] exibe "N/A"
4. [Coluna: "Status"] exibe [Badge: "Indefinido"] (cinza)
5. Mensagem na linha: "Data de abertura nao definida para este edital"

**FE-02 — Erro ao carregar prazos (falha de API)**
1. Usuario acessa [Aba: "Prazos"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao carregar prazos. Tente novamente."
4. [Botao: "Recarregar"] disponivel para nova tentativa

**FE-03 — Calculo de prazo incorreto em feriado (RN-163)**
1. Data de abertura do edital cai em dia util, mas o calculo de 3 dias uteis antes atravessa um feriado
2. Se a lib `workalendar` estiver ausente, sistema usa fallback sab/dom
3. Prazo pode estar 1 dia adiantado (ignorando feriado) — aviso: "Calculo de prazo pode nao considerar feriados regionais"

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

**RNs aplicadas:** RN-143, RN-144, RN-145, RN-158 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital em fase pos-disputa (lances encerrados)
2. Resultado do certame publicado ou em vias de publicacao
3. Canais de notificacao configurados (WhatsApp, email, alerta sistema)
4. Portal gov.br acessivel para monitoramento

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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
6. Indicador de status muda: "Monitoramento Inativo" -> "Aguardando" -> "JANELA ABERTA"
7. Quando janela e detectada: indicador exibe [Badge: "JANELA ABERTA"] com tempo restante para manifestacao
8. Sistema dispara notificacoes imediatas nos canais ativos (WhatsApp, Email, Alerta sistema)
9. Usuario, notificado, acessa a pagina e visualiza o timer de manifestacao
10. Clica [Botao: "Registrar Intencao de Recurso"] (icone Gavel, variant danger) para manifestar intencao
11. Intencao registrada no banco vinculada ao edital — status atualizado

### Fluxos Alternativos (V5)

**FA-01 — Ativar monitoramento com apenas 1 canal de notificacao**
1. Usuario marca apenas [Checkbox: "Email"] (Passo 4)
2. Desmarca WhatsApp e Alerta no sistema
3. Clica [Botao: "Ativar Monitoramento"] — sistema aceita com 1 canal
4. Notificacoes serao enviadas apenas por email
5. Fluxo continua normalmente

**FA-02 — Desativar monitoramento apos ativacao**
1. Monitoramento esta ativo (status "Aguardando")
2. Usuario clica [Botao: "Desativar Monitoramento"] (que substitui "Ativar Monitoramento" apos ativacao)
3. Status volta para "Monitoramento Inativo"
4. Sistema para de monitorar a janela de recurso

**FA-03 — Janela de recurso ja encerrada ao acessar**
1. Usuario acessa RecursosPage e seleciona edital (Passo 3)
2. Sistema detecta que a janela de recurso ja foi encerrada
3. Status exibe [Badge: "Encerrada"] (icone CheckCircle)
4. [Botao: "Registrar Intencao de Recurso"] desabilitado
5. Mensagem: "Janela de recurso encerrada em {data}"

### Fluxos de Excecao (V5)

**FE-01 — Nenhum canal de notificacao selecionado**
1. Usuario nao marca nenhum checkbox de canal (Passo 4)
2. Clica [Botao: "Ativar Monitoramento"]
3. Validacao: "Selecione pelo menos um canal de notificacao."
4. Monitoramento nao e ativado

**FE-02 — Portal gov.br inacessivel**
1. Sistema tenta monitorar a janela no portal (Passo 5-6)
2. Portal gov.br esta fora do ar ou inacessivel
3. Status exibe [Badge: "Erro de Conexao"] com icone AlertTriangle
4. Sistema tenta novamente em intervalos de 5 minutos
5. Mensagem: "Nao foi possivel acessar o portal. Retentativa automatica em {N} minutos."

**FE-03 — Intencao de recurso registrada fora do prazo**
1. Timer de manifestacao expirou (janela de intencao encerrada)
2. Usuario clica [Botao: "Registrar Intencao de Recurso"]
3. Sistema rejeita: "Prazo para manifestacao de intencao de recurso expirado."
4. Botao e desabilitado

**FE-04 — Edital sem resultado publicado**
1. Usuario seleciona edital que ainda nao tem resultado de licitacao publicado
2. Sistema nao encontra dados de resultado no portal
3. Mensagem: "Resultado do certame ainda nao publicado para este edital."
4. [Botao: "Ativar Monitoramento"] permanece habilitado — monitoramento ira aguardar publicacao

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

**RNs aplicadas:** RN-137, RN-154, RN-161 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Resultado do certame publicado
2. Proposta vencedora disponivel para analise (documento ou dados do portal)
3. Edital completo com requisitos tecnicos e legais disponivel
4. Base de legislacao e jurisprudencias carregada

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**

Pre-requisitos nao-UC:

- `[seed]` — dado pre-cadastrado no banco (seed)


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

### Fluxos Alternativos (V5)

**FA-01 — Proposta vencedora sem inconsistencias**
1. IA analisa a proposta (Passo 6)
2. Nenhuma inconsistencia identificada — proposta vencedora em conformidade
3. [Card: "Inconsistencias Identificadas"] exibe mensagem: "Nenhuma inconsistencia identificada na proposta vencedora."
4. [Card: "Analise Detalhada"] recomenda: "Nao ha fundamento para recurso com base na analise tecnica/legal."
5. Usuario decide nao prosseguir com recurso

**FA-02 — Colar texto parcial da proposta**
1. Usuario cola apenas parte da proposta no [TextArea] (Passo 3)
2. IA analisa com base no texto parcial
3. [Card: "Analise Detalhada"] inclui aviso: "Analise baseada em texto parcial — resultados podem estar incompletos."
4. Inconsistencias identificadas sao listadas normalmente

**FA-03 — Re-analisar proposta com texto atualizado**
1. Usuario ja realizou analise (Passo 7-9 concluidos)
2. Altera o texto no [TextArea] (adiciona mais trechos)
3. Clica novamente [Botao: "Analisar Proposta Vencedora"]
4. Nova analise sobrescreve a anterior
5. Tabela de inconsistencias atualizada

### Fluxos de Excecao (V5)

**FE-01 — TextArea vazio ao clicar analisar**
1. Usuario nao preenche [TextArea: "Texto da Proposta Vencedora"]
2. Clica [Botao: "Analisar Proposta Vencedora"]
3. Validacao: "Cole o texto da proposta vencedora antes de analisar."
4. Analise nao e disparada

**FE-02 — Nenhum edital selecionado**
1. Usuario preenche [TextArea] mas nao seleciona edital
2. Clica [Botao: "Analisar Proposta Vencedora"]
3. Validacao: "Selecione um edital antes de analisar."

**FE-03 — Timeout na analise da IA**
1. Requisicao a IA excede 120 segundos
2. Mensagem: "Analise excedeu o tempo limite. Tente novamente ou reduza o tamanho do texto."
3. [Texto: "Analisando..."] e substituido pela mensagem de erro

**FE-04 — Texto da proposta muito curto (menos de 50 caracteres)**
1. Usuario cola texto muito curto no [TextArea] (ex: "proposta do licitante X")
2. IA nao consegue gerar analise significativa
3. Mensagem: "Texto da proposta insuficiente para analise. Cole o texto completo da proposta vencedora."

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

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-RE02**


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

### Fluxos Alternativos (V5)

**FA-01 — Pergunta sem relacao com o edital/proposta**
1. Usuario digita pergunta generica (ex: "Qual o PIB do Brasil?")
2. IA responde redirecionando para o contexto: "Esta analise e focada no edital e proposta em questao. Posso ajudar com duvidas sobre o edital, proposta vencedora ou legislacao aplicavel."
3. Chat continua disponivel para novas perguntas

**FA-02 — Multiplas perguntas em sequencia rapida**
1. Usuario envia 3 perguntas em menos de 30 segundos
2. Sistema processa cada pergunta na ordem de envio
3. Respostas aparecem sequencialmente no historico
4. Contexto cumulativo e mantido entre todas

**FA-03 — Usar insights do chat para fundamentar laudo**
1. IA responde com artigo de lei relevante para o caso
2. Usuario copia trecho da resposta
3. Cola no conteudo do laudo de recurso (UC-RE04) como fundamentacao adicional
4. Historico do chat permanece disponivel para consulta

### Fluxos de Excecao (V5)

**FE-01 — Pergunta enviada sem texto**
1. Usuario clica [Botao: "Enviar"] com [TextInput] vazio
2. Sistema ignora — nenhuma mensagem e enviada
3. Nenhuma acao ocorre

**FE-02 — Timeout na resposta da IA**
1. IA nao responde em 60 segundos
2. [Texto: "Pensando..."] e substituido por mensagem: "Tempo limite excedido. Tente reformular a pergunta."
3. Historico anterior e preservado
4. Campo de input continua disponivel

**FE-03 — Analise do UC-RE02 nao realizada**
1. Usuario acessa o chatbox sem ter realizado a analise da proposta (UC-RE02)
2. IA responde com contexto limitado (apenas edital, sem proposta vencedora)
3. Aviso: "Analise da proposta vencedora nao realizada. Respostas podem ser limitadas."

**FE-04 — Cooldown da IA ativo (RN-084)**
1. Usuario envia pergunta menos de 60s apos ultima interacao IA
2. Mensagem: "Aguarde {N} segundos antes de enviar nova pergunta."
3. [Botao: "Enviar"] desabilitado temporariamente

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

**RNs aplicadas:** RN-144, RN-146, RN-147, RN-149, RN-153, RN-155 [FALTANTE->V4], RN-157 [FALTANTE->V4], RN-159 [FALTANTE->V4], RN-162 [FALTANTE->V4], RN-163 [FALTANTE->V4], RN-164 [FALTANTE->V4], RN-212 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Intencao de recurso manifestada dentro do prazo (UC-RE01)
3. Inconsistencias identificadas e classificadas
4. Base de legislacao e jurisprudencias disponivel
5. Template de laudo selecionado (padrao ou customizado)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-RE02**
- **UC-RE01**


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

### Fluxos Alternativos (V5)

**FA-01 — Criar laudo sem empresa alvo (recurso contra o edital)**
1. No modal, usuario deixa [TextInput: "Empresa Alvo"] em branco (Passo 5)
2. Sistema aceita — laudo e criado sem empresa alvo
3. Coluna "Empresa Alvo" na tabela exibe "-" ou vazio
4. Cenario tipico de recurso administrativo contra clausula do edital

**FA-02 — Criar laudo com template pre-definido**
1. Usuario seleciona template especifico em [Select: "Template"] (Passo 5)
2. Template preenche automaticamente o [TextArea: "Conteudo Inicial"]
3. Usuario pode editar o conteudo pre-preenchido antes de clicar "Criar"
4. Laudo criado com conteudo do template

**FA-03 — Editar laudo e salvar multiplas vezes antes de enviar para revisao**
1. Usuario abre editor (Passo 8)
2. Edita secao juridica — clica "Salvar Rascunho"
3. Edita secao tecnica — clica "Salvar Rascunho" novamente
4. Cada salvamento e registrado no LOG
5. So envia para revisao apos completar ambas as secoes

### Fluxos de Excecao (V5)

**FE-01 — Campos obrigatorios nao preenchidos no modal**
1. Usuario deixa [Select: "Edital"], [Select: "Tipo"] ou [Select: "Subtipo"] sem selecao
2. Clica [Botao: "Criar"]
3. Validacao: mensagem indicando campo obrigatorio faltante
4. Modal nao fecha

**FE-02 — Laudo sem secoes obrigatorias ao submeter no portal**
1. Usuario edita laudo mas nao inclui "## SECAO JURIDICA" ou "## SECAO TECNICA"
2. Clica [Botao: "Submeter no Portal"]
3. Validacao pre-envio (UC-RE06) detecta secoes ausentes
4. Checkbox "Secao juridica presente" ou "Secao tecnica presente" aparece desmarcado
5. Mensagem: "Ha validacoes pendentes. Corrija antes de submeter."

**FE-03 — Erro ao salvar rascunho**
1. Usuario clica [Botao: "Salvar Rascunho"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao salvar rascunho. Tente novamente."
4. Conteudo do editor e preservado na tela

**FE-04 — Excluir laudo acidentalmente**
1. Usuario clica [Icone-Acao: Trash2] na tabela de laudos
2. Confirmacao: "Deseja excluir este laudo? Esta acao nao pode ser desfeita."
3. Se confirmar: laudo excluido permanentemente
4. Se cancelar: nenhuma acao

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

**RNs aplicadas:** RN-146, RN-148, RN-149, RN-153, RN-156 [FALTANTE->V4], RN-157 [FALTANTE->V4], RN-160 [FALTANTE->V4], RN-162 [FALTANTE->V4], RN-163 [FALTANTE->V4], RN-164 [FALTANTE->V4], RN-212 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Recurso de outra empresa identificado contra a proposta do usuario
2. Documento de recurso disponivel (PDF/DOCX) ou informacoes sobre os fundamentos
3. Proposta do usuario e edital completo disponiveis
4. Base de legislacao e jurisprudencias carregada

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-R01 OU UC-R02**
- **UC-CV03**


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

### Fluxos Alternativos (V5)

**FA-01 — Contra-razao com apenas secao de defesa (sem ataque)**
1. Usuario edita o laudo incluindo apenas "## DEFESA"
2. Nao inclui "## ATAQUE" (decide nao atacar a proposta do recorrente)
3. Sistema aceita — secao ATAQUE e recomendada mas nao obrigatoria
4. Aviso: "Recomendamos incluir secao de ATAQUE para fortalecer a contra-razao."

**FA-02 — Criar contra-razao sem conhecer os argumentos completos do recurso**
1. Usuario nao tem acesso ao texto completo do recurso interposto
2. Preenche [TextArea: "Conteudo Inicial"] com resumo dos pontos que conhece
3. Laudo criado com informacao parcial
4. Usuario podera editar e complementar quando obtiver o documento de recurso completo

**FA-03 — Exportar contra-razao em DOCX para revisao externa (advogado)**
1. Usuario exporta via [Botao: "DOCX"]
2. Envia arquivo DOCX para advogado externo revisar
3. Advogado devolve arquivo revisado
4. Usuario faz upload da versao revisada via UC-I04 (Upload de Peticao Externa)

### Fluxos de Excecao (V5)

**FE-01 — Empresa alvo nao informada**
1. Usuario deixa [TextInput: "Empresa Alvo"] vazio no modal
2. Clica [Botao: "Criar"]
3. Validacao: "Informe o nome da empresa que interpos o recurso (Empresa Alvo)."
4. Modal nao fecha (para contra-razao, empresa alvo e obrigatoria — diferente de recurso)

**FE-02 — Prazo de contra-razao expirado**
1. Usuario tenta submeter contra-razao apos prazo de 3 dias uteis (Art. 165 Lei 14.133/2021)
2. Ao clicar [Botao: "Submeter no Portal"], validacao pre-envio detecta prazo expirado
3. Checkbox "Prazo de submissao valido" aparece desmarcado
4. Mensagem: "Prazo de contra-razao expirado. Submissao nao e recomendada."

**FE-03 — Erro na exportacao DOCX**
1. Usuario clica [Botao: "DOCX"]
2. Erro na geracao do arquivo DOCX
3. Mensagem: "Erro ao exportar DOCX. Tente exportar em PDF."

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

**RNs aplicadas:** RN-150, RN-151, RN-155 [FALTANTE->V4], RN-156 [FALTANTE->V4], RN-164 [FALTANTE->V4]

**Ator:** Usuario (submissao manual assistida pelo sistema)

### Pre-condicoes
1. Peticao (impugnacao, recurso ou contra-razao) gerada e aprovada
2. Documento dentro dos limites de tamanho do portal
3. Credenciais de acesso ao portal configuradas
4. Prazo de submissao nao expirado

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-I03 OU UC-RE04 OU UC-RE05**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


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
5. Resultado da validacao: [Texto: "Todas as validacoes passaram"] ou [Texto: "Ha validacoes pendentes"]
6. [Passo 1] usuario clica [Botao: "Exportar PDF"] ou [Botao: "Exportar DOCX"] para baixar o documento
7. [Passo 2] usuario clica [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) — abre nova aba com link para portal gov.br
8. Usuario faz upload MANUAL do PDF no portal gov.br
9. Apos submissao, usuario preenche [TextInput: "Protocolo de Submissao"] com protocolo recebido do portal
10. Clica [Botao: "Registrar Submissao"] (icone CheckCircle) — sistema salva protocolo, data/hora
11. Modal exibe [Texto: "SUBMETIDO COM SUCESSO"] — status do laudo atualizado para "Protocolado"
12. [Botao: "Fechar"] encerra o modal

### Fluxos Alternativos (V5)

**FA-01 — Exportar em DOCX ao inves de PDF**
1. No Passo 6, usuario clica [Botao: "Exportar DOCX"] ao inves de "Exportar PDF"
2. Sistema gera arquivo DOCX
3. Download inicia — usuario faz upload do DOCX no portal (se aceito)
4. Fluxo continua no Passo 7

**FA-02 — Cancelar submissao antes de registrar protocolo**
1. Modal esta aberto (Passo 2)
2. Usuario exporta PDF (Passo 6) mas decide nao submeter no portal
3. Clica [Botao: "Cancelar"]
4. Modal fecha — status do laudo permanece inalterado (ex: "Revisao")
5. PDF exportado permanece no computador do usuario

**FA-03 — Submeter laudo com validacoes em warning (nao bloqueantes)**
1. Checklist exibe 5 de 6 validacoes passando, 1 em warning (ex: assinatura nao detectada automaticamente)
2. Texto: "5 de 6 validacoes passaram. 1 validacao em atencao."
3. Sistema permite prosseguir com a submissao (warning nao e bloqueante)
4. Fluxo continua normalmente

### Fluxos de Excecao (V5)

**FE-01 — Validacoes criticas nao passam**
1. Checklist detecta falha critica: prazo de submissao expirado
2. [Texto: "Ha validacoes pendentes"]
3. [Botao: "Registrar Submissao"] permanece desabilitado
4. Mensagem: "Corrija as validacoes pendentes antes de submeter."

**FE-02 — Protocolo nao informado ao registrar**
1. Usuario clica [Botao: "Registrar Submissao"] com [TextInput: "Protocolo"] vazio
2. Validacao: "Informe o protocolo recebido do portal."
3. Submissao nao e registrada

**FE-03 — Portal ComprasNet fora do ar**
1. Usuario clica [Botao: "Abrir Portal ComprasNet"] (Passo 7)
2. Nova aba abre mas portal esta indisponivel
3. Usuario nao consegue fazer upload
4. Pode fechar o modal e tentar novamente posteriormente
5. Status do laudo permanece inalterado

**FE-04 — Erro ao registrar submissao no banco**
1. Usuario preenche protocolo e clica [Botao: "Registrar Submissao"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao registrar submissao. Tente novamente."
4. Protocolo preenchido e preservado no campo

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Modal "Submissao Assistida no Portal" — disparado pelo [Botao: "Submeter no Portal"] no editor

#### Layout da Tela

```
[Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) — no editor de laudos [ref: Passo 1]

[Modal: "Submissao Assistida no Portal"] (size: large) [ref: Passo 2]

  [Secao: "Dados da Peticao"] [ref: Passo 3]
    [Badge: "RECURSO"] ou [Badge: "CONTRA-RAZAO"] — tipo da peticao (readonly)
    [Texto: Edital] — readonly
    [Texto: Subtipo] — readonly

  [Secao: "Validacao Pre-Envio"] [ref: Passo 4]
    [Checkbox] (readonly) "Tamanho do arquivo dentro do limite"
    [Checkbox] (readonly) "Formato aceito pelo portal"
    [Checkbox] (readonly) "Prazo de submissao valido"
    [Checkbox] (readonly) "Secao juridica presente"
    [Checkbox] (readonly) "Secao tecnica presente"
    [Checkbox] (readonly) "Assinatura/identificacao presente"
    [Texto: "Todas as validacoes passaram"] ou [Texto: "Ha validacoes pendentes"] [ref: Passo 5]

  [Secao: "Passo 1 — Exportar Documento"] [ref: Passo 6]
    [Botao: "Exportar PDF"] (icone Download) [ref: Passo 6]
    [Botao: "Exportar DOCX"] (icone Download) [ref: Passo 6]

  [Secao: "Passo 2 — Submeter no Portal gov.br"] [ref: Passo 7]
    [Botao: "Abrir Portal ComprasNet"] (icone ExternalLink, variant primary) [ref: Passo 7]

  [Secao: "Passo 3 — Registrar Protocolo"] [ref: Passos 9, 10]
    [TextInput: "Protocolo de Submissao"] — placeholder "Ex: PNCP-2026-0046-REC-001" [ref: Passo 9]
    [Botao: "Registrar Submissao"] (icone CheckCircle) [ref: Passo 10]

  [Secao: "Resultado"] [ref: Passo 11]
    [Texto: "SUBMETIDO COM SUCESSO"] — exibido apos registro

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
| [Texto: "Todas as validacoes..."] | 5 |
| [Botao: "Exportar PDF"] / [Botao: "Exportar DOCX"] | 6 |
| [Botao: "Abrir Portal ComprasNet"] | 7 |
| [TextInput: "Protocolo de Submissao"] | 9 |
| [Botao: "Registrar Submissao"] | 10 |
| [Texto: "SUBMETIDO COM SUCESSO"] | 11 |
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

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


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

### Fluxos Alternativos (V5)

**FA-01 — Registrar cancelamento de edital**
1. Usuario seleciona [Radio: "Cancelado"] (Passo 7)
2. Campos "Valor Final", "Empresa Vencedora" e "Motivo da Derrota" ficam ocultos
3. [TextArea: "Justificativa do Cancelamento"] aparece (obrigatorio)
4. Usuario preenche justificativa (ex: "Edital revogado por vicio no termo de referencia")
5. Clica [Botao: "Registrar"]
6. Edital registrado como cancelado — nao contabiliza em vitorias nem derrotas

**FA-02 — Registrar derrota por motivo ME/EPP (Micro/Pequena Empresa)**
1. Usuario seleciona [Radio: "Derrota"]
2. Seleciona [Select: "Motivo da Derrota"] = "ME/EPP"
3. Preenche demais campos
4. Derrota registrada com motivo especifico — permite analise de perdas por criterio de ME/EPP

**FA-03 — Registrar vitoria com valor diferente da proposta original**
1. Usuario seleciona [Radio: "Vitoria"]
2. Preenche [TextInput: "Valor Final"] com valor diferente do proposto (ex: negociacao pos-adjudicacao)
3. Sistema aceita — valor final pode ser menor que a proposta original
4. Diferenca entre proposta e valor final e registrada automaticamente

### Fluxos de Excecao (V5)

**FE-01 — Nenhum edital pendente de resultado**
1. Usuario acessa [Aba: "Resultados"]
2. [Card: "Editais Pendentes de Resultado"] esta vazio
3. Mensagem: "Nenhum edital pendente de resultado."
4. Apenas a tabela de Resultados Registrados e exibida

**FE-02 — Tipo de resultado nao selecionado**
1. Usuario abre modal mas nao seleciona [Radio] de tipo (Vitoria/Derrota/Cancelado)
2. Clica [Botao: "Registrar"]
3. Validacao: "Selecione o tipo de resultado."
4. Modal nao fecha

**FE-03 — Valor final nao informado para Vitoria/Derrota**
1. Usuario seleciona "Vitoria" mas deixa [TextInput: "Valor Final"] vazio
2. Clica [Botao: "Registrar"]
3. Validacao: "Informe o valor final homologado."
4. Modal nao fecha

**FE-04 — Erro ao salvar resultado no banco**
1. Usuario preenche todos os campos e clica [Botao: "Registrar"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao registrar resultado. Tente novamente."
4. Modal permanece aberto com dados preservados

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

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01 OU UC-AT01**


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
9. [Tabela: Regras] mostra: Tipo, 30d, 15d, 7d, 1d, Email, Push, Ativo (exibidos como checkmarks ou tracos)
10. Se sem vencimentos: [Texto: "Nenhum vencimento nos proximos 90 dias"]
11. Se sem regras: [Texto: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."]

### Fluxos Alternativos (V5)

**FA-01 — Nenhum vencimento nos proximos 90 dias**
1. Usuario acessa [Aba: "Alertas"]
2. Tabela de vencimentos esta vazia
3. Mensagem: "Nenhum vencimento nos proximos 90 dias"
4. Summary Cards exibem todos os contadores zerados
5. Card de Regras de Alerta ainda e exibido normalmente

**FA-02 — Atualizar dados manualmente**
1. Usuario percebe que dados podem estar desatualizados
2. Clica [Botao: "Atualizar"]
3. Sistema recarrega dados do backend
4. Tabela e Summary Cards atualizam
5. Novos contratos/ARPs cadastrados desde a ultima visita aparecem

**FA-03 — Multiplos contratos e ARPs com urgencias diferentes**
1. Tabela exibe contratos e ARPs com urgencias variadas
2. 1 contrato critico (< 7 dias) — badge vermelho
3. 2 ARPs urgentes (7-15 dias) — badge laranja
4. 3 contratos normais (> 30 dias) — badge verde
5. Summary Cards: Total=6, Critico=1, Urgente=2, Atencao=0, Normal=3

### Fluxos de Excecao (V5)

**FE-01 — Erro ao carregar dados de vencimentos**
1. Usuario acessa [Aba: "Alertas"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao carregar dados de vencimentos. Tente novamente."
4. [Botao: "Atualizar"] disponivel para retentativa

**FE-02 — Nenhuma regra de alerta configurada**
1. Card "Regras de Alerta Configuradas" esta vazio
2. Mensagem: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."
3. Usuario pode navegar para o modulo de gestao para configurar regras

**FE-03 — Datas de vencimento inconsistentes (data passada)**
1. Contrato com data de vencimento ja ultrapassada aparece na tabela
2. [Coluna: "Dias"] exibe valor negativo ou "VENCIDO"
3. [Coluna: "Urgencia"] exibe badge vermelho "Vencido"
4. Sistema destaca registro para acao imediata

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
    [Coluna: "30d"] — checkmark ou traco
    [Coluna: "15d"] — checkmark ou traco
    [Coluna: "7d"] — checkmark ou traco
    [Coluna: "1d"] — checkmark ou traco
    [Coluna: "Email"] — checkmark ou traco
    [Coluna: "Push"] — checkmark ou traco
    [Coluna: "Ativo"] — checkmark ou x
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

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**
- **UC-F15 OU [seed]**


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

### Fluxos Alternativos (V5)

**FA-01 — Score exibido como "N/A" (dados insuficientes)**
1. Nao ha dados logisticos suficientes para calcular o score
2. [Card: "Score Logistico"] exibe "N/A"
3. Mensagem: "Dados logisticos insuficientes para calcular o score. Configure distancia, prazo e capacidade no PortfolioPage."
4. Score nao e considerado na decisao GO/NO-GO

**FA-02 — Score recalculado automaticamente apos atualizacao de parametros**
1. Usuario atualiza parametros logisticos no PortfolioPage
2. Ao acessar FollowupPage, score e recalculado com novos dados
3. Valor do score reflete a atualizacao
4. Nenhuma acao adicional necessaria

**FA-03 — Score alto (80-100) com recomendacao positiva**
1. Score calculado em 89%
2. Classificacao: "Excelente"
3. Recomendacao: participar do certame com confianca na capacidade logistica
4. Badge verde exibido

### Fluxos de Excecao (V5)

**FE-01 — API de score logistico indisponivel**
1. Requisicao a `/api/score-logistico` falha
2. [Card: "Score Logistico"] exibe "Erro"
3. Mensagem: "Nao foi possivel calcular o score logistico. API indisponivel."
4. Score nao e exibido — demais funcionalidades do FollowupPage continuam normais

**FE-02 — Produto nao vinculado ao edital**
1. Edital nao tem produto vinculado via PortfolioPage
2. API retorna score nulo
3. [Card: "Score Logistico"] exibe "N/A"
4. Mensagem: "Vincule um produto ao edital no PortfolioPage para calcular o score."

**FE-03 — Parametros logisticos com valores invalidos**
1. Distancia configurada como 0 km ou valor negativo
2. API detecta inconsistencia nos parametros
3. Score calculado com aviso: "Parametros logisticos podem estar incorretos. Verifique a configuracao."
4. Score e exibido com alerta visual (badge amarelo)

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

# RESUMO DE FLUXOS ALTERNATIVOS E DE EXCECAO (V5)

| UC | Qtd FA | Qtd FE | Total |
|---|---|---|---|
| UC-I01 | 3 | 4 | 7 |
| UC-I02 | 3 | 3 | 6 |
| UC-I03 | 4 | 4 | 8 |
| UC-I04 | 3 | 4 | 7 |
| UC-I05 | 3 | 3 | 6 |
| UC-RE01 | 3 | 4 | 7 |
| UC-RE02 | 3 | 4 | 7 |
| UC-RE03 | 3 | 4 | 7 |
| UC-RE04 | 3 | 4 | 7 |
| UC-RE05 | 3 | 3 | 6 |
| UC-RE06 | 3 | 4 | 7 |
| UC-FU01 | 3 | 4 | 7 |
| UC-FU02 | 3 | 3 | 6 |
| UC-FU03 | 3 | 3 | 6 |
| **TOTAL** | **43** | **51** | **94** |

---

*Documento gerado em 21/04/2026. V5.0 — Adicionados Fluxos Alternativos (FA) e Fluxos de Excecao (FE) para todos os 14 UCs. Total de 43 FAs + 51 FEs = 94 fluxos adicionais documentados. Todo o conteudo V4 permanece preservado.*
