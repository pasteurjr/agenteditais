---
uc_id: UC-AT03
nome: "Dashboard de Atas Consultadas"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 583
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-AT03 — Dashboard de Atas Consultadas

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 583).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-213 [FALTANTE->V4]

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos uma ata salva na tabela `atas_consultadas` (via UC-AT01)

### Pos-condicoes
1. Dashboard exibe visao consolidada de todas as atas consultadas
2. Atas expiradas sinalizadas visualmente para referencia

### Sequencia de Eventos

1. Usuario clica na [Aba: "Minhas Atas"] da AtasPage
2. [Secao: Stat Cards — grid 3] exibe: Total (azul), Vigentes (verde), Vencidas (vermelho)
3. [Tabela: atas salvas] carrega com colunas: Titulo, Orgao, UF, Vigencia
4. [Coluna: "Vigencia"] exibe badge colorido com dias restantes ou vencimento:
   - Vigente: background "#dcfce7", cor "#166534", texto "{dias}d restantes"
   - Vencida: background "#fee2e2", cor "#991b1b", texto "Vencida ha {dias}d"
5. Usuario visualiza suas atas salvas, filtra mentalmente por vigencia e acessa detalhes conforme necessidade

### Fluxos Alternativos (V5)

- **FA-01 — Todas as atas vencidas:** No passo 2, Stat Card "Vigentes" exibe 0, "Vencidas" exibe N. Tabela mostra todas as atas com badge "Vencida ha {dias}d" em vermelho.
- **FA-02 — Apenas uma ata salva:** Dashboard funciona normalmente com 1 registro. Stat Cards: Total=1, Vigentes ou Vencidas conforme estado.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhuma ata salva:** Tabela vem vazia. Stat Cards exibem Total=0, Vigentes=0, Vencidas=0. Mensagem orientativa pode ser exibida: "Nenhuma ata salva. Busque atas na aba 'Buscar'."
- **FE-02 — Erro ao carregar atas:** Requisicao GET falha. Sistema exibe alerta de erro no lugar da tabela. Stat Cards mostram "-".

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Minhas Atas" (3a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Secao: Stat Cards — grid 3 colunas] [ref: Passo 2]
  [Card: "Total"] (cor: #3b82f6)
  [Card: "Vigentes"] (cor: #16a34a)
  [Card: "Vencidas"] (cor: #dc2626)

[Tabela: atas salvas] (DataTable) [ref: Passos 3, 4]
  [Coluna: "Titulo"] (key: titulo)
  [Coluna: "Orgao"] (key: orgao)
  [Coluna: "UF"] (key: uf)
  [Coluna: "Vigencia"] (key: data_vigencia_fim, render customizado) [ref: Passo 4]
    [Badge: vigente] — background "#dcfce7", color "#166534", texto "{dias}d restantes"
    [Badge: vencida] — background "#fee2e2", color "#991b1b", texto "Vencida ha {dias}d"
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Minhas Atas"] | 1 |
| [Stat Cards: Total/Vigentes/Vencidas] | 2 |
| [Tabela: atas salvas] | 3 |
| [Coluna: "Vigencia"] / badges | 4 |

### Implementacao Atual
**Implementado**

---
