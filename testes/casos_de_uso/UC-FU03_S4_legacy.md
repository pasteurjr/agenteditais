---
uc_id: UC-FU03_S4_legacy
nome: "Score Logistico"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1919
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-FU03_S4_legacy — Score Logistico

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1919).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

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
