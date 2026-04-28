---
uc_id: UC-CT10
nome: "KPIs de Execucao *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1699
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CT10 — KPIs de Execucao *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1699).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-174, RN-177

**RF relacionado:** RF-046-04
**Ator:** Usuario (Gestor / Diretor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contratos cadastrados com dados de status e datas (UC-CT01)
3. Dados de vencimento e renovacao disponiveis (UC-CT09)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01**


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

### Fluxos Alternativos (V5)

- **FA-01 — Nenhum contrato no periodo selecionado:** Stat Cards exibem 0 em todas as metricas. Card Expandido mostra tabela vazia. Mensagem "Nenhum contrato encontrado no periodo selecionado."
- **FA-02 — Filtro "Tudo" selecionado:** Sistema carrega dados de todos os periodos. Pode demorar mais. Todos os contratos sao considerados.
- **FA-03 — KPI clicado sem dados:** Card Expandido abre mas tabela esta vazia. Mensagem "Nenhum contrato para este indicador."

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar KPIs:** Requisicao falha. Stat Cards exibem "-" em todos os campos. Mensagem de erro orientativa.
- **FE-02 — Nenhum contrato cadastrado no sistema:** Todos os KPIs zerados. KPIs Adicionais todos zerados. Mensagem "Cadastre contratos para visualizar KPIs de execucao."
- **FE-03 — Timeout ao mudar periodo:** Alteracao de periodo dispara recalculo que excede timeout. Sistema exibe loader prolongado e eventual mensagem de erro.

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
**Nao Implementado**

---

# FASE 4 — CONTRATADO X REALIZADO

---
