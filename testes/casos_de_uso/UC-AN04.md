---
uc_id: UC-AN04
nome: "ROI Estimado do Sistema"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 665
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AN04 — ROI Estimado do Sistema

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 665).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-037

**RF relacionado:** RF-053
**Ator:** Usuario (Diretor)

### Pre-condicoes
1. Usuario autenticado
2. Editais ganhos com valor arrematado registrado
3. Recursos revertidos com valor registrado (Sprint 4)

### Pos-condicoes
1. Usuario visualiza ROI estimado do sistema

### Sequencia de Eventos

1. Usuario clica na [Aba: "ROI"]
2. [Card: "ROI Consolidado"] exibe indicador grande: ROI % = (Receita + Economias) / Custo estimado
3. [Card: "Componentes do ROI — grid 2x2"] exibe:
   - Receita Direta: soma dos valores arrematados em editais ganhos
   - Oportunidades Salvas: editais revertidos via recursos (Sprint 4) — valor estimado
   - Produtividade: horas economizadas vs processo manual (benchmark configuravel)
   - Prevencao de Perdas: valor de itens intrusos detectados antes de proposta (UC-ME04)
4. [Card: "Filtros"] permite: [Select: "Periodo"] (3m/6m/12m/total)
5. [Card: "Evolucao do ROI"] grafico de linha mostrando ROI % mes a mes
6. [Card: "Detalhamento"] DataTable: Componente, Valor (R$), % do Total, Tendencia

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Analytics > ROI                                              |
|                                                               |
|  +----------- ROI CONSOLIDADO ----------------+               |
|  |                                            |               |
|  |             ROI: 342%                      |               |
|  |      (verde, circulo com preenchimento)    |               |
|  |                                            |               |
|  +--------------------------------------------+               |
|                                                               |
|  Periodo: [12 meses v]                                        |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Receita    |  |Oportunid. |  |Produtivi- |  |Prevencao  |   |
|  |Direta     |  |Salvas     |  |dade       |  |de Perdas  |   |
|  |R$ 12.4M   |  |R$ 2.1M    |  |R$ 890K    |  |R$ 340K    |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  +---- Evolucao do ROI (%) ---+                               |
|  | [Grafico linha: ROI mes a mes]                             |
|  | Jan: 120% → Fev: 180% → Mar: 250% → ...                  |
|  +-----------------------------+                              |
|                                                               |
|  +---- Detalhamento ----+                                     |
|  |Componente     |Valor     |% Total|Tend. |                  |
|  |Receita direta |R$ 12.4M  |  79%  | ↑    |                  |
|  |Oport. salvas  |R$  2.1M  |  13%  | ↑    |                  |
|  |Produtividade  |R$  890K  |   6%  | =    |                  |
|  |Prev. perdas   |R$  340K  |   2%  | ↑    |                  |
|  +----------------------------+                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** ROI % (indicador principal), 4 componentes, grafico evolucao, tabela detalhamento
- **Preenchidos (input):** Periodo
- **Obtidos (resposta do sistema):** ROI calculado, componentes, tendencia

---
