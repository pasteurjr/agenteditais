---
uc_id: UC-AN01
nome: "Funil de Conversao do Pipeline CRM (NOVO — AnalyticsPage)"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 450
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AN01 — Funil de Conversao do Pipeline CRM (NOVO — AnalyticsPage)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 450).
> Sprint origem: **Sprint 7**.

---

**Tipo:** NOVO — AnalyticsPage (pagina nova)
**Diferenca do CRM KPIs:** A aba KPIs do CRMPage (Sprint 5) mostra 8 stat cards AGREGADOS (total editais, analisados, participados, ganhos, perdidos, taxas, tickets). O UC-AN01 mostra um FUNIL VISUAL com as 13 etapas INDIVIDUAIS e taxa de conversao entre CADA PAR de etapas. Sao vistas complementares, nao duplicadas.

**RNs aplicadas:** RN-165 (13 stages imutaveis), RN-196 (KPIs analisados/participados), RN-037 (audit log)

**RF relacionado:** RF-053, RF-050, RF-045-05
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Pipeline CRM com pelo menos 10 editais distribuidos em stages
3. Dados do CRM da Sprint 5 disponiveis (UC-CRM01..CRM07)

### Pos-condicoes
1. Usuario visualiza funil de conversao completo do pipeline
2. Identifica gargalos (etapas com baixa conversao)

### Sequencia de Eventos

1. Usuario acessa AnalyticsPage (`/app/analytics`) via menu lateral "Indicadores > Analytics"
2. [Cabecalho: "Analytics"] exibe titulo com subtitulo "Performance, Conversoes e ROI"
3. [Secao: Abas] mostra 4 tabs: Pipeline (default), Conversoes, Tempos, ROI
   **Nota:** Perdas NAO e aba do AnalyticsPage — UC-AN05 EXPANDE a PerdasPage existente (`/app/perdas`)
4. Na [Aba: "Pipeline"], [Card: "Filtros"] exibe: [Select: "Periodo"], [Select: "Segmento"], [Select: "UF"]
5. [Card: "Funil do Pipeline"] exibe grafico de funil visual com as 13 etapas (RN-165):
   - captado_nao_divulgado → captado_divulgado → em_analise → lead_potencial → monitoramento_concorrencia → em_impugnacao → fase_propostas → proposta_submetida → espera_resultado → ganho_provisorio → processo_recurso → contra_razao → resultado_definitivo
   - Cada etapa mostra: nome, quantidade de editais, valor acumulado (R$), taxa de conversao para a proxima
6. [Card: "Stat Cards — grid 4"] exibe: Total no Pipeline, Analisados (RN-196), Participados (RN-196), Resultado Definitivo (ganhos + perdidos)
7. [Card: "Tabela de Conversao por Etapa"] DataTable: Etapa, Entrada, Saida, Conversao %, Valor Acumulado
8. Cores do funil: verde (conversao > 60%), amarelo (30-60%), vermelho (< 30%)

### Tela(s) Representativa(s)

**Pagina:** AnalyticsPage (`/app/analytics`)
**Posicao:** Aba "Pipeline"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Analytics                                                    |
|  Performance, Conversoes e ROI                                |
|                                                               |
|  +--------+  +----------+  +-------+  +-----+                 |
|  |Pipeline|  |Conversoes|  |Tempos |  |ROI  |                 |
|  +--------+  +----------+  +-------+  +-----+                 |
|  (Perdas NAO e aba aqui — UC-AN05 expande PerdasPage)         |
|                                                               |
|  [Filtros] Periodo: [12m v]  Segmento: [Todos v]  UF: [v]   |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Total      |  |Analisados |  |Particip.  |  |Resultado  |   |
|  |Pipeline   |  |(RN-196)   |  |(RN-196)   |  |Definitivo |   |
|  |   247     |  |   189     |  |   142     |  |    98     |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  +------------ Funil do Pipeline ---------------+             |
|  |                                              |             |
|  |  captado_nao_div     ████████████████  247   |             |
|  |  captado_divulgado   ██████████████    220   |             |
|  |  em_analise          ████████████      189   |             |
|  |  lead_potencial      ██████████        165   |             |
|  |  fase_propostas      ████████          142   |             |
|  |  proposta_submetida  ██████            118   |             |
|  |  espera_resultado    █████             105   |             |
|  |  resultado_definit.  ████               98   |             |
|  |                                              |             |
|  |  Legenda: ██ >60%  ██ 30-60%  ██ <30%       |             |
|  +----------------------------------------------+             |
|                                                               |
|  +--- Conversao por Etapa ---+                                |
|  |Etapa          |Entra|Sai|% Conv|                           |
|  |capt→divulg    | 247 |220| 89%  |                           |
|  |divulg→analise | 220 |189| 86%  |                           |
|  |analise→lead   | 189 |165| 87%  |                           |
|  |lead→propostas | 165 |142| 86%  |                           |
|  |prop→submetida | 142 |118| 83%  |                           |
|  |submet→espera  | 118 |105| 89%  |                           |
|  |espera→result  | 105 | 98| 93%  |                           |
|  +-----------------------------+                              |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Funil visual (13 etapas), Stat Cards (4), Tabela conversao por etapa
- **Preenchidos (input):** Periodo, Segmento, UF
- **Obtidos (resposta do sistema):** Funil renderizado, taxas de conversao, gargalos identificados

---
