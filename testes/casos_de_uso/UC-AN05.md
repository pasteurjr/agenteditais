---
uc_id: UC-AN05
nome: "Analise de Perdas com Recomendacoes IA (EXPANSAO — PerdasPage)"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 736
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AN05 — Analise de Perdas com Recomendacoes IA (EXPANSAO — PerdasPage)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 736).
> Sprint origem: **Sprint 7**.

---

**Tipo:** EXPANSAO da pagina existente `PerdasPage.tsx`
**O que JA EXISTE:** 3 stat cards (Total Perdas, Valor Total Perdido, Taxa de Perda), pie chart de motivos (preco/tecnica/documentacao/prazo/outro), tabela com colunas Edital/Orgao/Data/Motivo/Nosso Preco/Preco Vencedor/Diferenca/Vencedor, filtro periodo (3m/6m/12m). Endpoint: `GET /api/dashboard/perdas?periodo_dias=`. Arquivo: `frontend/src/pages/PerdasPage.tsx` (213L).

**RNs aplicadas:** RN-193 (decisao nao-participacao com motivo), RN-073 (alerta >=2 perdas), RN-037 (audit log)

**RF relacionado:** RF-053 (Perdas), RF-055 (Aprendizado)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Editais com resultado "perdido" e motivo registrado (UC-CRM07 Sprint 5)
3. PerdasPage ja funcional com stat cards, pie chart e tabela (Sprint 5)

### Pos-condicoes
1. PerdasPage expandida com recomendacoes IA e filtros adicionais
2. Insights aceitos alimentam Pipeline de Aprendizado (UC-AP01)

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA a PerdasPage)

1. Usuario acessa PerdasPage (`/app/perdas`) via menu lateral "Indicadores > Perdas" (JA EXISTE)
2. **JA EXISTE:** 3 stat cards (Total Perdas, Valor Perdido, Taxa de Perda) — MANTER
3. **NOVO:** [Stat Card 4]: "Top Motivo" (nome do motivo mais frequente)
4. **JA EXISTE:** Pie chart de motivos — MANTER
5. **NOVO:** [Filtros adicionais]: [Select: "Segmento"], [Select: "UF"] (adicionar ao filtro periodo existente)
6. **JA EXISTE:** Tabela de perdas — MANTER colunas existentes
7. **NOVO:** [Card: "Recomendacoes da IA"] exibe 3-5 insights:
   - Cada insight: [Icone: lampada], [Texto descritivo], [Botao: "Aplicar"], [Botao: "Rejeitar"]
   - Exemplo: "Voce perdeu 8 editais por preco em SP. Considere margem de 9% (atual 12%) em Hemato."
   - Exemplo: "3 perdas por doc. incompleta — certidao FGTS vencida em 2 casos."
8. **NOVO:** Insights aceitos criam registro em `AprendizadoFeedback` com `tipo_evento=feedback_usuario`
9. **NOVO:** [Botao: "Exportar CSV"] gera download do historico de perdas
10. **NOVO/EXPANDIDO:** Endpoint `GET /api/dashboard/analytics/perdas` (reutiliza logica de `/api/dashboard/perdas` + adiciona recomendacoes IA, filtros segmento/uf, stat card top_motivo)

### Tela(s) Representativa(s)

**Pagina:** PerdasPage (`/app/perdas`) — NAO AnalyticsPage
**Posicao:** Expansao da pagina existente

#### Layout da Tela (mostra JA EXISTE vs NOVO)

```
+---------------------------------------------------------------+
|  Perdas                                                       |
|                                                               |
|  === STAT CARDS (3 existentes + 1 NOVO) ===                  |
|  +---------+  +---------+  +---------+  +-----------+         |
|  |Total    |  |Valor    |  |Taxa de  |  |Top Motivo |         |
|  |Perdas   |  |Perdido  |  |Perda    |  |(NOVO)     |         |
|  |   42    |  |R$ 28.5M |  |  29.6%  |  |Preco      |         |
|  +---------+  +---------+  +---------+  +-----------+         |
|  (JA EXISTE) (JA EXISTE) (JA EXISTE) (NOVO Sprint 7)          |
|                                                               |
|  === FILTROS (periodo existe + segmento/UF NOVOS) ===        |
|  [Periodo: 6m v] [Segmento: Todos v (NOVO)] [UF: v (NOVO)]  |
|                                                               |
|  +---- Pie Chart Motivos (JA EXISTE) ----+                    |
|  | [Manter pie chart existente]           |                   |
|  +----------------------------------------+                   |
|                                                               |
|  +---- Tabela Perdas (JA EXISTE) --------+                    |
|  | [Manter tabela existente]              |                   |
|  +----------------------------------------+                   |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  +---- Recomendacoes da IA (NOVO) ----+                       |
|  | lampada Voce perdeu 8 editais por preco em SP.             |
|  |    Considere margem de 9% (atual 12%) em Hemato.           |
|  |    [Aplicar]  [Rejeitar]                                   |
|  |                                                             |
|  | lampada 3 perdas por doc. incompleta — certidao FGTS       |
|  |    vencida em 2 casos.                                      |
|  |    [Aplicar]  [Rejeitar]                                   |
|  +--------------------------------------------+               |
|                                                               |
|  [Exportar CSV] (NOVO)                                        |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Card "Top Motivo", Card Recomendacoes IA (3-5 insights)
- **NOVOS (input):** Filtros Segmento e UF, Botoes Aplicar/Rejeitar, Botao Exportar CSV
- **JA EXISTENTES (nao alterar):** 3 stat cards, pie chart, tabela perdas, filtro periodo

### Excecoes
- **E1:** Nenhuma perda registrada — stat cards zerados (mensagem existente mantida)
- **E2:** IA sem dados suficientes — card recomendacoes vazio: "Preciso de pelo menos 5 perdas registradas para gerar insights"

---

# FASE 3 — PIPELINE DE APRENDIZADO CONTINUO

---
