---
uc_id: UC-CT09
nome: "Contratos a Vencer *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1557
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT09 — Contratos a Vencer *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1557).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-167, RN-174, RN-175, RN-176

**RF relacionado:** RF-046-03
**Ator:** Usuario (Analista Comercial / Gestor de Contratos)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos um contrato cadastrado com data de termino definida (UC-CT01)
3. Contratos com datas proximas do vencimento existem no sistema

### Pos-condicoes
1. Contratos a vencer organizados por tier de urgencia (90d, 30d)
2. Contratos marcados como "em tratativas de renovacao" rastreados separadamente
3. Historico de renovacao/encerramento registrado

### Sequencia de Eventos

1. Na ProducaoPage, usuario clica na [Aba: "Contratos a Vencer"] (nova aba, 7a posicao)
2. [Secao: Stat Cards — grid 5] exibe: A Vencer 90d (laranja), A Vencer 30d (vermelho), Em Tratativas (azul), Renovados (verde), Nao Renovados (cinza)
3. [Card: "Contratos a Vencer em 90 dias"] exibe [Tabela] com: Numero, Orgao, Valor, Termino, Dias Restantes
4. [Card: "Contratos a Vencer em 30 dias"] exibe [Tabela] com mesmas colunas, destaque vermelho
5. [Card: "Contratos em Tratativas de Renovacao"] exibe contratos marcados pelo usuario como em negociacao
6. Usuario clica [Botao: "Marcar Tratativa"] em um contrato a vencer — [Modal: "Registrar Tratativa de Renovacao"] abre
7. Preenche: [TextArea: "Observacoes da tratativa"], [TextInput: "Responsavel"], [TextInput: "Previsao de conclusao"]
8. Clica [Botao: "Registrar"] — contrato move para secao "Em Tratativas"
9. [Card: "Contratos Renovados"] exibe contratos cuja renovacao foi confirmada
10. Usuario clica [Botao: "Confirmar Renovacao"] — [Modal: "Renovacao de Contrato"] abre
11. Preenche: [TextInput: "Novo numero de contrato"], [TextInput: "Nova data de termino"], [TextInput: "Novo valor"]
12. Clica [Botao: "Confirmar"] — contrato renovado volta ao status de "vigente" em Contratos em Andamento
13. [Card: "Contratos Nao Renovados"] exibe contratos encerrados sem renovacao
14. Usuario clica [Botao: "Encerrar sem Renovacao"] — [Modal: "Encerrar Contrato"] abre com campo [TextArea: "Motivo do encerramento"]
15. Clica [Botao: "Confirmar Encerramento"] — contrato registrado como nao renovado
16. [Botao: "Cancelar"] fecha qualquer modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Nenhum contrato a vencer em 30 dias:** Card "Contratos a Vencer em 30 dias" exibe tabela vazia. Stat Card "A Vencer 30d" exibe 0. Apenas contratos a vencer em 90d sao listados.
- **FA-02 — Contrato renovado com valor diferente do original:** No passo 11, usuario informa novo valor (maior ou menor que original). Sistema aceita e cria novo registro de contrato com o valor informado.
- **FA-03 — Contrato encerrado sem motivo detalhado:** No passo 14, usuario preenche motivo minimo. Sistema aceita e registra encerramento.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum contrato cadastrado:** Todos os Stat Cards exibem 0. Todas as tabelas vazias. Mensagem orientativa "Nenhum contrato cadastrado. Acesse a aba Contratos."
- **FE-02 — Erro ao confirmar renovacao:** Requisicao POST falha. Toast de erro exibido. Modal permanece aberto com dados preservados.
- **FE-03 — Novo numero de contrato duplicado:** Backend rejeita duplicidade. Sistema exibe alerta "Numero de contrato ja existe."
- **FE-04 — Contrato ja marcado como em tratativa:** Usuario tenta marcar novamente. Sistema exibe aviso "Contrato ja esta em tratativas de renovacao."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Contratos a Vencer" (7a aba — nova)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"] [Aba: "Empenhos"] [Aba: "Contratos a Vencer"]

[Secao: Stat Cards — grid 5 colunas] [ref: Passo 2]
  [Card: "A Vencer 90d"] (icone Clock, cor: #f97316)
  [Card: "A Vencer 30d"] (icone AlertTriangle, cor: #dc2626)
  [Card: "Em Tratativas"] (icone Handshake, cor: #3b82f6)
  [Card: "Renovados"] (icone CheckCircle, cor: #16a34a)
  [Card: "Nao Renovados"] (icone XCircle, cor: #6b7280)

[Card: "Contratos a Vencer em 90 dias"] [ref: Passo 3]
  [Tabela] (DataTable)
    [Coluna: "Numero"] (sortable)
    [Coluna: "Orgao"]
    [Coluna: "Valor"] (render: formatCurrency)
    [Coluna: "Termino"] (render: formatDate)
    [Coluna: "Dias Restantes"] — "{dias}d" (fontWeight: 600, cor: #f97316)
    [Coluna: "Acao"]
      [Botao: "Marcar Tratativa"] (size: sm) [ref: Passo 6]

[Card: "Contratos a Vencer em 30 dias"] [ref: Passo 4]
  [Tabela] (DataTable) — mesmas colunas, header com destaque vermelho
    [Coluna: "Dias Restantes"] — cor: #dc2626
    [Coluna: "Acao"]
      [Botao: "Marcar Tratativa"] (size: sm)

[Card: "Contratos em Tratativas de Renovacao"] [ref: Passo 5]
  [Tabela] (DataTable)
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Responsavel"]
    [Coluna: "Previsao"]
    [Coluna: "Acao"]
      [Botao: "Confirmar Renovacao"] (size: sm, variant: primary) [ref: Passo 10]
      [Botao: "Encerrar"] (size: sm, variant: secondary) [ref: Passo 14]

[Card: "Contratos Renovados"] [ref: Passo 9]
  [Tabela] — Numero Original, Novo Contrato, Orgao, Novo Termino

[Card: "Contratos Nao Renovados"] [ref: Passo 13]
  [Tabela] — Numero, Orgao, Motivo, Data Encerramento

[Modal: "Registrar Tratativa de Renovacao"] [ref: Passos 6-8]
  [TextArea: "Observacoes da tratativa"] [ref: Passo 7]
  [TextInput: "Responsavel"] [ref: Passo 7]
  [TextInput: "Previsao de conclusao"] — placeholder "2026-06-30" [ref: Passo 7]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Registrar"] [ref: Passo 8]

[Modal: "Renovacao de Contrato"] [ref: Passos 10-12]
  [TextInput: "Novo numero de contrato"] [ref: Passo 11]
  [TextInput: "Nova data de termino"] [ref: Passo 11]
  [TextInput: "Novo valor (R$)"] [ref: Passo 11]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Confirmar"] [ref: Passo 12]

[Modal: "Encerrar Contrato"] [ref: Passos 14-15]
  [TextArea: "Motivo do encerramento"] [ref: Passo 14]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 16]
  [Botao: "Confirmar Encerramento"] [ref: Passo 15]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Contratos a Vencer"] | 1 |
| [Stat Cards: 90d/30d/Tratativas/Renovados/Nao Renovados] | 2 |
| [Card: "Contratos a Vencer em 90 dias"] | 3 |
| [Card: "Contratos a Vencer em 30 dias"] | 4 |
| [Card: "Contratos em Tratativas de Renovacao"] | 5 |
| [Botao: "Marcar Tratativa"] | 6 |
| [Modal: "Registrar Tratativa de Renovacao"] | 7, 8 |
| [Card: "Contratos Renovados"] | 9 |
| [Botao: "Confirmar Renovacao"] | 10 |
| [Modal: "Renovacao de Contrato"] | 11, 12 |
| [Card: "Contratos Nao Renovados"] | 13 |
| [Botao: "Encerrar sem Renovacao"] | 14 |
| [Modal: "Encerrar Contrato"] | 14, 15 |
| [Botao: "Cancelar"] | 16 |

### Implementacao Atual
**Nao Implementado**

---
