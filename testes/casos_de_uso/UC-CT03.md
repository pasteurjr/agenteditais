---
uc_id: UC-CT03
nome: "Acompanhar Cronograma de Entregas"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 991
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT03 — Acompanhar Cronograma de Entregas

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 991).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-202

**RF relacionado:** RF-046-04, RF-046-05
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Entregas cadastradas com `data_prevista` (UC-CT02)

### Pos-condicoes
1. Cronograma visual exibido com status por entrega
2. Entregas atrasadas sinalizadas com destaque vermelho
3. Proximos vencimentos listados

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Cronograma"] (3a aba)
2. Se nenhum contrato selecionado: [Texto: "Selecione um contrato na aba 'Contratos'"]
3. [Secao: Stat Cards — grid 4] exibe: Pendentes (amarelo), Entregues (verde), Atrasados (vermelho), Total (azul)
4. Se cronograma ainda carregando: [Loader2 animate-spin] exibido
5. [Card: "Entregas Atrasadas"] (destaque vermelho, condicional) lista entregas em atraso com dias de atraso
6. [Card: "Proximos 7 dias"] (condicional) lista entregas iminentes com dias restantes
7. Usuario acompanha o status visual das entregas e prioriza acoes

### Fluxos Alternativos (V5)

- **FA-01 — Nenhuma entrega atrasada:** No passo 5, Card "Entregas Atrasadas" nao e exibido. Stat Card "Atrasados" exibe 0. Apenas Card "Proximos 7 dias" aparece se houver entregas iminentes.
- **FA-02 — Todas as entregas ja realizadas:** Stat Cards: Pendentes=0, Entregues=N, Atrasados=0, Total=N. Nenhum card de alerta exibido.
- **FA-03 — Nenhuma entrega nos proximos 7 dias:** Card "Proximos 7 dias" nao e exibido. Apenas Card "Entregas Atrasadas" aparece se houver atrasos.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum contrato selecionado:** Mensagem "Selecione um contrato na aba 'Contratos'" exibida (passo 2). Nenhum Stat Card ou cronograma renderizado.
- **FE-02 — Contrato sem entregas cadastradas:** Stat Cards todos zerados. Nenhum card de alerta exibido. Mensagem "Nenhuma entrega cadastrada para este contrato."
- **FE-03 — Erro ao carregar cronograma:** Requisicao falha. Loader permanece e apos timeout exibe mensagem de erro.

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Cronograma" (3a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Texto: "Selecione um contrato..."] — condicional [ref: Passo 2]
[Loader2 animate-spin] — exibido durante carregamento [ref: Passo 4]

[Secao: Stat Cards — grid 4 colunas] [ref: Passo 3]
  [Card: "Pendentes"] (cor: #eab308)
  [Card: "Entregues"] (cor: #16a34a)
  [Card: "Atrasados"] (cor: #dc2626)
  [Card: "Total"] (cor: #3b82f6)

[Card: "Entregas Atrasadas"] — condicional: so exibido se ha atrasados [ref: Passo 5]
  [Texto: "Entregas Atrasadas"] (color: #dc2626)
  [Lista de itens]
    [Texto: {e.descricao}]
    [Texto: "{e.dias_atraso}d atraso"] (fontWeight: 700, color: #dc2626)

[Card: "Proximos 7 dias"] — condicional: so exibido se ha proximas [ref: Passo 6]
  [Lista de itens]
    [Texto: {e.descricao}]
    [Texto: "{e.dias_restantes}d"] (color: #eab308)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Cronograma"] | 1 |
| [Texto: "Selecione um contrato..."] | 2 |
| [Stat Cards: Pendentes/Entregues/Atrasados/Total] | 3 |
| [Loader2] | 4 |
| [Card: "Entregas Atrasadas"] | 5 |
| [Card: "Proximos 7 dias"] | 6 |

### Implementacao Atual
**Implementado**

---
