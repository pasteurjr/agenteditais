---
uc_id: UC-CV08
nome: "Calcular scores multidimensionais e decidir GO/NO-GO"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1049
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV08 — Calcular scores multidimensionais e decidir GO/NO-GO

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1049).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-047, RN-048, RN-049, RN-050, RN-051, RN-052, RN-053, RN-054, RN-055, RN-064, RN-067, RN-080 [FALTANTE->V4], RN-081 [FALTANTE->V4], RN-082 [FALTANTE->V4], RN-086 [FALTANTE->V4]

**RF relacionados:** RF-027, RF-028, RF-037

**Regras de Negocio aplicaveis:**
- Presentes: RN-047, RN-048, RN-049, RN-050, RN-051, RN-052, RN-053, RN-054, RN-055, RN-064, RN-067
- Faltantes: RN-080 [FALTANTE], RN-081 [FALTANTE], RN-082 [FALTANTE], RN-086 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado na `ValidacaoPage`.
2. Endpoint `/api/editais/{id}/scores-validacao` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV07**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Scores em 6 dimensoes ficam visiveis.
2. Usuario consegue registrar uma decisao assistida.
3. Persistencia da decisao depende de uma trilha ainda inconsistente.

### Botoes e acoes observadas
Na aba `Aderencia`:
- `Calcular Scores IA` / `Recalcular Scores IA`
- `Participar (GO)`
- `Acompanhar (Em Avaliacao)`
- `Rejeitar (NO-GO)`
- `Salvar Justificativa`

### Sequencia de eventos
1. Usuario abre a [Aba: "Aderencia"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Calcular Scores IA"] (ou [Botao: "Recalcular Scores IA"] se ja calculado). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/scores-validacao`. [ref: Passo 3]
4. Sistema atualiza o [Indicador: "ScoreCircle"] (score geral 100px), o [Badge: "Decisao IA"], as 6 [Indicador: "ScoreBar"] (Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial), o [Badge: "Potencial"], o [Texto: "Justificativa IA"], a [Lista: "Pontos Positivos"] e a [Lista: "Pontos de Atencao"]. [ref: Passo 4]
5. Na [Secao: "Mapa Logistico"], sistema exibe UF Edital -> UF Empresa com distancia estimada e dias de transito. [ref: Passo 5]
6. Na [Secao: "Decisao"], usuario escolhe [Botao: "Participar (GO)"], [Botao: "Acompanhar (Em Avaliacao)"] ou [Botao: "Rejeitar (NO-GO)"]. [ref: Passo 6]
7. Sistema abre a [Secao: "Justificativa"] com [Select: "Motivo"] e [Campo: "Detalhes" (TextArea)]. [ref: Passo 7]
8. Usuario clica no [Botao: "Salvar Justificativa"]. [ref: Passo 8]
9. A tela tenta criar ou atualizar `validacao_decisoes` via CRUD. [ref: Passo 9]

### Fluxos Alternativos (V5)

**FA-01 — Scores ja calculados anteriormente (Recalcular)**
1. Usuario abre a aba Aderencia de um edital que ja teve scores calculados.
2. Os scores e a decisao IA sao exibidos imediatamente sem necessidade de recalculo.
3. O botao exibido e "Recalcular Scores IA" em vez de "Calcular Scores IA".
4. Usuario pode recalcular para obter scores atualizados.

**FA-02 — Mudar decisao de GO para NO-GO**
1. Usuario ja tinha registrado decisao GO para o edital.
2. Ao reabrir a aba Aderencia, o botao GO aparece com destaque verde.
3. Usuario clica em "Rejeitar (NO-GO)".
4. O botao NO-GO fica vermelho e o GO perde o destaque.
5. A secao de justificativa e reaberta para nova justificativa.

**FA-03 — Salvar justificativa sem preencher detalhes**
1. Usuario clica em "Participar (GO)" e depois em "Salvar Justificativa".
2. O campo "Motivo" esta preenchido mas "Detalhes" esta vazio.
3. Sistema aceita a justificativa com detalhes em branco (campo opcional).

**FA-04 — Usuario seleciona "Acompanhar (Em Avaliacao)"**
1. Usuario clica em "Acompanhar (Em Avaliacao)" — opcao intermediaria.
2. O botao fica amarelo.
3. O status do edital muda para "Em Avaliacao" na tabela de Meus Editais.

### Fluxos de Excecao (V5)

**FE-01 — Timeout no calculo de scores via IA**
1. Usuario clica em "Calcular Scores IA".
2. O endpoint `/api/editais/{id}/scores-validacao` excede o timeout (DeepSeek lento).
3. Sistema exibe mensagem: "O calculo de scores demorou mais que o esperado. Tente novamente."
4. Os scores nao sao atualizados.

**FE-02 — Score nao calculado (dados insuficientes)**
1. O edital nao possui dados suficientes para calculo de score (sem itens, sem PDF, sem objeto claro).
2. O endpoint retorna scores zerados ou parciais.
3. Sistema exibe alerta: "Score calculado com dados insuficientes. Resultados podem ser imprecisos."

**FE-03 — Falha ao persistir decisao (tabela `validacao_decisoes` inexistente)**
1. Usuario clica em "Salvar Justificativa".
2. O CRUD tenta gravar em `validacao_decisoes`, mas a tabela nao existe no schema.
3. Sistema exibe Toast de erro: "Erro ao salvar decisao."
4. A decisao fica registrada apenas na memoria do frontend (nao persiste entre sessoes).

**FE-04 — Cooldown de IA ativo (RN-084)**
1. Usuario tenta recalcular scores dentro do cooldown de 60 segundos.
2. O backend retorna HTTP 429.
3. Sistema exibe mensagem: "Aguarde 60 segundos antes de recalcular os scores."

**FE-05 — Servico DeepSeek indisponivel**
1. Usuario clica em "Calcular Scores IA".
2. O servico DeepSeek esta fora do ar.
3. Sistema retorna erro e exibe: "Servico de IA indisponivel. Tente novamente mais tarde."

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 1 "Aderencia" do Painel de Abas

#### Layout da Tela

[Aba: "Aderencia"] icon Target
  [Secao: "Score e Calcular"]
    [Botao: "Calcular Scores IA"] / [Botao: "Recalcular Scores IA"] icon Sparkles [ref: Passo 2]
    [Indicador: "ScoreCircle"] — score geral, 100px diametro [ref: Passo 4]
    [Badge: "Decisao IA"] — GO/NO-GO/Acompanhar com cor [ref: Passo 4]
  [Secao: "Scores por Dimensao"] [ref: Passo 4]
    [Indicador: "ScoreBar Tecnica"] — 0-100%
    [Indicador: "ScoreBar Documental"] — 0-100%
    [Indicador: "ScoreBar Complexidade"] — 0-100%
    [Indicador: "ScoreBar Juridico"] — 0-100%
    [Indicador: "ScoreBar Logistico"] — 0-100%
    [Indicador: "ScoreBar Comercial"] — 0-100%
  [Badge: "Potencial"] — Alto/Medio/Baixo [ref: Passo 4]
  [Secao: "Analise da IA"] [ref: Passo 4]
    [Texto: "Justificativa IA"] — texto descritivo
    [Lista: "Pontos Positivos"] — itens em verde
    [Lista: "Pontos de Atencao"] — itens em amarelo
  [Secao: "Mapa Logistico"] [ref: Passo 5]
    [Texto: "UF Edital"] -> [Texto: "UF Empresa"]
    [Texto: "Distancia estimada"]
    [Texto: "Dias de transito"]
  [Secao: "Decisao"] [ref: Passo 6]
    [Botao: "Participar (GO)"] — verde
    [Botao: "Acompanhar (Em Avaliacao)"] — amarelo
    [Botao: "Rejeitar (NO-GO)"] — vermelho
  [Secao: "Justificativa"] — visivel apos decisao [ref: Passo 7]
    [Select: "Motivo"] — lista de motivos pre-definidos
    [Campo: "Detalhes"] — TextArea
    [Botao: "Salvar Justificativa"] [ref: Passo 8]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Aderencia"] | 1 |
| [Botao: "Calcular Scores IA"] / [Botao: "Recalcular Scores IA"] | 2 |
| [Indicador: "ScoreCircle"] + 6 ScoreBars + [Badge: "Decisao IA"] + [Badge: "Potencial"] | 4 |
| [Texto: "Justificativa IA"] + [Lista: "Pontos Positivos/Atencao"] | 4 |
| [Secao: "Mapa Logistico"] | 5 |
| [Botao: "Participar/Acompanhar/Rejeitar"] | 6 |
| [Select: "Motivo"] + [Campo: "Detalhes"] | 7 |
| [Botao: "Salvar Justificativa"] | 8 |

### Observacao critica
O frontend tenta persistir a decisao em `validacao_decisoes`, mas essa tabela nao existe no schema `editais` consultado em 30/03/2026. Portanto, a experiencia visual esta implementada, mas a trilha de persistencia da decisao deve ser tratada como **parcial/inconsistente**.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA DE PERSISTENCIA**

---
