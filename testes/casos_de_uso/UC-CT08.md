---
uc_id: UC-CT08
nome: "Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1445
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT08 — Auditoria Empenhos x Faturas x Pedidos *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1445).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-169, RN-170, RN-172, RN-173, RN-209 [FALTANTE->V4], RN-210 [FALTANTE->V4], RN-211 [FALTANTE->V4]

**RF relacionado:** RF-046-02
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contrato selecionado com ao menos um empenho registrado (UC-CT07)
3. Entregas e faturas vinculadas aos empenhos

### Pos-condicoes
1. Relatorio de conciliacao gerado com visao consolidada
2. Divergencias entre empenhos, entregas e faturas identificadas
3. Dados exportaveis para validacao operacional

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, na [Aba: "Empenhos"], usuario clica [Botao: "Auditoria"] (icone FileCheck)
2. [Card: "Auditoria — {numero_contrato}"] exibe secao de conciliacao
3. [Secao: Stat Cards — grid 4] exibe: Total Empenhado (azul), Total Entregue (verde), Total Faturado (roxo), Divergencia (vermelho/verde)
4. [Tabela: Conciliacao por Empenho] exibe: Numero Empenho, Valor Empenhado, Valor Entregue, Valor Faturado, Diferenca, Status
5. [Coluna: "Diferenca"] exibe valor com cor:
   - Verde (#16a34a): diferenca = 0 (conciliado)
   - Amarelo (#eab308): diferenca > 0 e < 10% (toleravel)
   - Vermelho (#dc2626): diferenca >= 10% (requer atencao)
6. [Coluna: "Status"] exibe badge: Conciliado (verde), Divergente (vermelho), Parcial (amarelo)
7. Usuario clica em linha da tabela para expandir detalhamento: lista de entregas e faturas vinculadas ao empenho
8. [Card: "Itens sem Cobertura de Empenho"] (condicional) lista entregas/pedidos que nao possuem empenho correspondente
9. [Botao: "Exportar PDF"] (icone Download) — gera relatorio para impressao
10. [Botao: "Exportar Excel"] (icone FileSpreadsheet) — gera planilha de conciliacao

### Fluxos Alternativos (V5)

- **FA-01 — Todos os empenhos conciliados:** Stat Card "Divergencia" exibe R$ 0,00 em verde. Tabela mostra todos com status "Conciliado". Card "Itens sem Cobertura" nao aparece.
- **FA-02 — Empenho sem faturas vinculadas:** Coluna "Valor Faturado" exibe R$ 0,00. Status e "Parcial" pois entrega pode existir sem fatura correspondente.
- **FA-03 — Exportacao apenas PDF:** Usuario clica apenas "Exportar PDF" sem exportar Excel. Download unico do relatorio em PDF.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum empenho registrado:** Ao clicar "Auditoria" (passo 1), sistema exibe alerta "Nenhum empenho registrado para este contrato. Cadastre empenhos na aba Empenhos."
- **FE-02 — Divergencia critica (>=10%) detectada (RN-211):** Sistema sinaliza linhas divergentes com icone AlertTriangle vermelho. Stat Card "Divergencia" em vermelho bold.
- **FE-03 — Erro na exportacao PDF/Excel:** Falha na geracao do arquivo. Toast de erro "Falha ao gerar relatorio. Tente novamente."
- **FE-04 — Entregas sem cobertura de empenho (RN-210):** Card "Itens sem Cobertura" lista entregas orfas. Alerta "Existem {N} entregas sem empenho vinculado."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Empenhos" > Secao Auditoria

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"]

[Botao: "Auditoria"] (icone FileCheck, variant secondary) [ref: Passo 1]

[Card: "Auditoria — {numero_contrato}"] [ref: Passo 2]

  [Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
    [Card: "Total Empenhado"] (icone Receipt, cor: #3b82f6)
    [Card: "Total Entregue"] (icone Truck, cor: #16a34a)
    [Card: "Total Faturado"] (icone FileText, cor: #8b5cf6)
    [Card: "Divergencia"] (icone AlertTriangle, cor dinamica)

  [Tabela: Conciliacao por Empenho] (DataTable) [ref: Passos 4, 5, 6]
    [Coluna: "Numero Empenho"] (sortable)
    [Coluna: "Valor Empenhado"] (render: formatCurrency)
    [Coluna: "Valor Entregue"] (render: formatCurrency)
    [Coluna: "Valor Faturado"] (render: formatCurrency)
    [Coluna: "Diferenca"] — cor dinamica [ref: Passo 5]
      [Texto: verde] — diferenca = 0
      [Texto: amarelo] — diferenca < 10%
      [Texto: vermelho] — diferenca >= 10%
    [Coluna: "Status"] — badge [ref: Passo 6]
      [Badge: "Conciliado"] (bg: #dcfce7, fg: #166534)
      [Badge: "Divergente"] (bg: #fee2e2, fg: #991b1b)
      [Badge: "Parcial"] (bg: #fef3c7, fg: #92400e)

  [Card: "Itens sem Cobertura de Empenho"] — condicional [ref: Passo 8]
    [Tabela: itens sem empenho]
      [Coluna: "Entrega/Pedido"]
      [Coluna: "Data"]
      [Coluna: "Valor"]
      [Coluna: "Observacao"]

  [Secao: Acoes] [ref: Passos 9, 10]
    [Botao: "Exportar PDF"] (icone Download) [ref: Passo 9]
    [Botao: "Exportar Excel"] (icone FileSpreadsheet) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Auditoria"] | 1 |
| [Card: "Auditoria — {numero}"] | 2 |
| [Stat Cards: Empenhado/Entregue/Faturado/Divergencia] | 3 |
| [Tabela: Conciliacao por Empenho] | 4 |
| [Coluna: "Diferenca"] / cor dinamica | 5 |
| [Coluna: "Status"] / badges | 6 |
| Expansao de linha com detalhamento | 7 |
| [Card: "Itens sem Cobertura de Empenho"] | 8 |
| [Botao: "Exportar PDF"] | 9 |
| [Botao: "Exportar Excel"] | 10 |

### Implementacao Atual
**Nao Implementado**

---
