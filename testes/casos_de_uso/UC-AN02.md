---
uc_id: UC-AN02
nome: "Taxas de Conversao Detalhadas"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 542
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AN02 — Taxas de Conversao Detalhadas

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 542).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-196, RN-037

**RF relacionado:** RF-053, RF-050
**Ator:** Usuario (Diretor, Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Historico de editais com resultado (ganho/perdido) existe

### Pos-condicoes
1. Usuario visualiza taxas de conversao segmentadas por tipo, UF e segmento

### Sequencia de Eventos

1. Usuario clica na [Aba: "Conversoes"]
2. [Card: "Stat Cards — grid 4"] exibe: Taxa Geral (%), Melhor Segmento (nome + %), Melhor UF (nome + %), Contribuicao Automatica (% editais via monitoramento)
3. [Card: "Taxa por Tipo de Edital"] tabela: Tipo (Pregao/Concorrencia/Dispensa/Outro), Participados, Ganhos, Taxa %, Benchmark anterior (seta verde/vermelha)
4. [Card: "Taxa por UF"] tabela: UF, Participados, Ganhos, Taxa %, Benchmark
5. [Card: "Taxa por Segmento"] tabela: Segmento, Participados, Ganhos, Taxa %, Benchmark
6. Benchmark: compara o mesmo indicador no periodo anterior (ex.: ultimos 6m vs 6m anteriores)
7. [Badge: "↑ +3.2%"] (verde, subiu) ou [Badge: "↓ -1.5%"] (vermelho, caiu)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > Conversoes                                       |
|                                                               |
|  +---------+  +---------+  +---------+  +---------+           |
|  |Taxa     |  |Melhor   |  |Melhor   |  |Contribu.|           |
|  |Geral    |  |Segmento |  |UF       |  |Automat. |           |
|  | 28.5%   |  |Hemato   |  |RJ       |  | 42%     |           |
|  |  ↑+2.1% |  | 35.2%   |  | 38.1%   |  |         |           |
|  +---------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +--- Taxa por Tipo ----+  +--- Taxa por UF -----+           |
|  |Tipo     |Part|Gan|%  |  |UF  |Part|Gan|%  |Bm |           |
|  |Pregao   |102 | 30|29%|  |SP  | 42 | 12|29%| ↑ |           |
|  |Concorr. | 28 |  8|29%|  |MG  | 28 |  7|25%| ↓ |           |
|  |Dispensa | 12 |  5|42%|  |RJ  | 21 |  8|38%| ↑ |           |
|  +----------------------+  +----------------------+           |
|                                                               |
|  +--- Taxa por Segmento --------+                             |
|  |Segmento    |Part|Ganhos|%    |Benchmark                   |
|  |Hematologia |  52|   18 |35.2%| ↑ +4.1% vs periodo ant.   |
|  |Bioquimica  |  38|   10 |26.3%| ↓ -1.8%                   |
|  |Coagulacao  |  24|    6 |25.0%| = estavel                  |
|  +-------------------------------+                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (4), 3 tabelas de taxa (por tipo, UF, segmento) com benchmarks
- **Preenchidos (input):** Filtros herdados da aba Pipeline
- **Obtidos (resposta do sistema):** Taxas calculadas, tendencias vs periodo anterior

---
