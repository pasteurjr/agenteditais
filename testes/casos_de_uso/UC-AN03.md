---
uc_id: UC-AN03
nome: "Tempo Medio entre Etapas do Pipeline"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 602
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AN03 — Tempo Medio entre Etapas do Pipeline

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 602).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-165, RN-037

**RF relacionado:** RF-053
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Editais com timestamps de transicao entre stages no pipeline

### Pos-condicoes
1. Usuario identifica gargalos de tempo no pipeline

### Sequencia de Eventos

1. Usuario clica na [Aba: "Tempos"]
2. [Card: "Stat Cards — grid 3"] exibe: Tempo Total Medio (dias, captacao → resultado), Etapa Mais Lenta (nome + dias), Etapa Mais Rapida (nome + dias)
3. [Card: "Tempo por Transicao"] exibe grafico de barras horizontais: cada barra = uma transicao de etapa, largura proporcional ao tempo medio em dias
4. Cores: verde (<7d), amarelo (7-30d), vermelho (>30d)
5. [Card: "Tabela Detalhada"] DataTable: Transicao, Tempo Medio (dias), Mediana (dias), Min, Max, Desvio Padrao
6. [Badge: "Gargalo"] aparece em vermelho na transicao com maior tempo medio
7. [Card: "Distribuicao Temporal"] histograma por faixa de dias para a transicao selecionada

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > Tempos                                           |
|                                                               |
|  +-----------+  +------------+  +------------+                |
|  |Tempo Total|  |Mais Lenta  |  |Mais Rapida |                |
|  |Medio      |  |            |  |            |                |
|  |  67 dias  |  |espera→res. |  |capt→divulg |                |
|  |           |  |  38 dias   |  |  0.5 dias  |                |
|  +-----------+  +------------+  +------------+                |
|                                                               |
|  +---- Tempo por Transicao (barras) -----+                    |
|  | capt→divulg      █  0.5d                                  |
|  | divulg→analise   ██  2d                                   |
|  | analise→lead     ████  5d                                 |
|  | lead→propostas   ███████  8d                              |
|  | prop→submetida   ████  5d                                 |
|  | submet→espera    ██  3d                                   |
|  | espera→resultado ██████████████████████  38d [GARGALO]    |
|  | result→definitivo █  1d                                   |
|  +-------------------------------------------+               |
|                                                               |
|  +--- Tabela Detalhada ----+                                  |
|  |Transicao       |Media|Mediana|Min|Max |DesvP|              |
|  |espera→resultado| 38d |  32d  | 5d|120d| 28d |              |
|  |lead→propostas  |  8d |   6d  | 1d| 25d|  5d |              |
|  +-------------------------+                                  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Grafico barras horizontais, Tabela detalhada, Badge gargalo
- **Preenchidos (input):** Filtros (Periodo, Segmento)
- **Obtidos (resposta do sistema):** Tempos calculados, gargalos identificados, distribuicao

---
