---
uc_id: UC-SC04
nome: "Tempo Medio do 1o Empenho (EXPANSAO — ContratadoRealizadoPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 992
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-SC04 — Tempo Medio do 1o Empenho (EXPANSAO — ContratadoRealizadoPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 992).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `ContratadoRealizadoPage.tsx`
**UCs estendidos:** UC-CR01 (Sprint 5 — Dashboard Contratado x Realizado), UC-CT07 (Sprint 5 — Gestao de Empenhos).
**O que JA EXISTE:** ContratadoRealizadoPage com dashboard contratado x realizado, tabela por contrato, indicadores de desvio, KPIs de execucao. Modelo `Empenho` com dados de empenhos por contrato. Modelo `Contrato` com data_homologacao.

**RNs aplicadas:** RN-169 (saldo empenho), RN-037 (audit)

**RF relacionado:** RF-046 (Execucao de Contrato), RF-051 (Contratado x Realizado)
**Ator:** Usuario (Gestor de Contratos, Diretor Financeiro)

### Pre-condicoes
1. Contratos cadastrados com empenhos registrados (UC-CT01, UC-CT07, Sprint 5)
2. Historico de pelo menos 3 contratos com empenhos para calculo significativo

### Pos-condicoes
1. Tempo medio do 1o empenho calculado e exibido
2. Distribuicao de tempos visivel em histograma
3. Alertas para contratos acima da media

### Sequencia de Eventos

1. Usuario acessa ContratadoRealizadoPage (`/app/contratado-realizado`)
2. **NOVO:** [Card: "Stat Card — Tempo Medio do 1o Empenho"] no grid de KPIs existente:
   - Valor: "XX dias" (media global)
   - Subtexto: "Baseado em Y contratos"
   - Tendencia: seta para cima (piorando) ou para baixo (melhorando) vs periodo anterior
3. **NOVO:** [Card: "Tempo Medio por Orgao"] — DataTable:
   - Colunas: Orgao | Contratos | Tempo Medio (dias) | Min | Max | Badge
   - Badge: Rapido (<15d, verde), Normal (15-30d, amarelo), Lento (>30d, vermelho)
4. **NOVO:** [Card: "Distribuicao de Tempos"] — Histograma:
   - Eixo X: faixas de dias (0-10, 10-20, 20-30, 30-60, 60+)
   - Eixo Y: quantidade de contratos
   - Linha vertical na media
5. **EXPANDIDO:** Na tabela de contratos existente, nova coluna "1o Empenho (dias)":
   - Calculo: data_primeiro_empenho - data_homologacao
   - Se contrato ativo sem empenho: "Aguardando" com dias decorridos
   - Se dias > 2x media: [Badge vermelho: "Atraso — possivel problema administrativo"]
6. **NOVO:** Alerta automatico (via sistema de alertas Sprint 6) quando:
   - Contrato sem empenho apos tempo > 2x media do orgao
   - Texto: "Contrato [NUM] com [ORGAO] sem empenho ha [X] dias (media do orgao: [Y] dias)"

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Cards novos abaixo dos KPIs existentes

#### Layout

```
+---------------------------------------------------------------+
|  Contratado x Realizado                                       |
|                                                               |
|  === KPIs EXISTENTES ===                                      |
|  [Total Contratado] [Total Realizado] [Desvio %]              |
|                                                               |
|  === NOVOS ===                                                |
|  +-----------+                                                |
|  |Tempo Medio|  +--- Tempo por Orgao -----------+             |
|  |1o Empenho |  |Orgao       |Contr.|Media|Badge|             |
|  |  23 dias  |  |HC Campinas | 5    | 18d |Norm.|             |
|  | (12 contr)|  |HCPA        | 3    | 35d |Lento|             |
|  | ↓ -3 dias |  |INCA        | 4    | 12d |Rap. |             |
|  +-----------+  +-------------------------------+             |
|                                                               |
|  +--- Distribuicao de Tempos (histograma) ---+                |
|  |  ██                                       |                |
|  |  ██  ████                                 |                |
|  |  ██  ████  ██                             |                |
|  |  ██  ████  ██  █                          |                |
|  | 0-10 10-20 20-30 30-60 60+   Media: 23d   |                |
|  +-------------------------------------------+                |
+---------------------------------------------------------------+
```

### Excecoes
- **E1:** Menos de 3 contratos com empenho — stat card mostra "Insuficiente (min. 3 contratos)"
- **E2:** Contrato sem data_homologacao — excluido do calculo com nota "Dados incompletos"

---
