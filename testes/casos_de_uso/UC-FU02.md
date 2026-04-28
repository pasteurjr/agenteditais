---
uc_id: UC-FU02
nome: "Configurar Alertas de Prazo"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 234
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-FU02 — Configurar Alertas de Prazo

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 234).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-017
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Contratos e ARPs cadastrados com datas de vencimento definidas
3. Sistema de notificacoes configurado

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01 OU UC-AT01**


### Pos-condicoes
1. Vencimentos proximos exibidos com badges de urgencia consolidados
2. Regras de alerta visiveis ao usuario por tipo de vencimento
3. Usuario informado sobre contratos e ARPs proximos do vencimento

### Sequencia de Eventos

1. Usuario acessa FollowupPage e clica na [Aba: "Alertas"]
2. [Secao: Summary Cards] exibe 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d)
3. [Card: "Proximos Vencimentos"] (icone Bell) carrega dados de contratos e ARPs automaticamente
4. Usuario clica [Botao: "Atualizar"] (variant secondary) para recarregar dados
5. [Tabela: Proximos Vencimentos] exibe: Tipo (badge), Nome, Data, Dias, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul #3b82f6), arp (roxo #8b5cf6), outro (amarelo #f59e0b)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho (<7d), laranja (7-15d), amarelo (15-30d), verde (>30d)
8. [Card: "Regras de Alerta Configuradas"] exibe tabela com regras salvas (30d/15d/7d/1d, Email, Push, Ativo)
9. Se sem vencimentos: [Texto: "Nenhum vencimento nos proximos 90 dias"]
10. Se sem regras: [Texto: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."]

### Fluxos Alternativos (V5)

- **FA-01 — Nenhum vencimento nos proximos 90 dias:** No passo 5, tabela vem vazia. Summary Cards exibem todos os contadores zerados. Mensagem "Nenhum vencimento nos proximos 90 dias" e exibida (passo 9).
- **FA-02 — Apenas vencimentos de ARPs (sem contratos):** Tabela mostra apenas badges roxos ("arp"). Contadores de Summary Cards refletem apenas ARPs. Funcionalidade e identica.
- **FA-03 — Atualizacao manual via botao "Atualizar":** Usuario clica "Atualizar" (passo 4) e dados sao recarregados do backend. Tabela e Summary Cards atualizam refletindo eventuais mudancas desde o carregamento inicial.

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar vencimentos:** Requisicao GET para `/api/dashboard/contratado-realizado` falha. Sistema exibe alerta de erro no lugar da tabela. Summary Cards exibem "-" em todos os campos.
- **FE-02 — Regras de alerta nao configuradas:** No passo 8, nenhuma regra existe. Card "Regras de Alerta Configuradas" exibe mensagem orientando o usuario a configurar via dashboard Contratado x Realizado (passo 10).

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Aba "Alertas" (2a aba)

#### Layout da Tela

```
[Aba: "Resultados"] [Aba: "Alertas"]

[Secao: Summary Cards — grid 5 colunas] [ref: Passo 2]
  [Card: "Total"] (cor: #3b82f6)
  [Card: "Critico (<7d)"] (cor: #dc2626)
  [Card: "Urgente (7-15d)"] (cor: #f97316)
  [Card: "Atencao (15-30d)"] (cor: #eab308)
  [Card: "Normal (>30d)"] (cor: #16a34a)

[Card: "Proximos Vencimentos"] (icone Bell) [ref: Passo 3]
  [Botao: "Atualizar"] (variant secondary) [ref: Passo 4]
  [Texto: "Nenhum vencimento nos proximos 90 dias"] — se vazio [ref: Passo 9]

  [Tabela: Proximos Vencimentos] [ref: Passo 5]
    [Coluna: "Tipo"] — badge colorido [ref: Passo 6]
      [Badge: "contrato"] (background: #3b82f620, cor: #3b82f6)
      [Badge: "arp"] (background: #8b5cf620, cor: #8b5cf6)
      [Badge: "outro"] (background: #f59e0b20, cor: #f59e0b)
    [Coluna: "Nome"]
    [Coluna: "Data"] — toLocaleDateString
    [Coluna: "Dias"] — "{dias_restantes}d"
    [Coluna: "Urgencia"] — badge colorido [ref: Passo 7]
      [Badge: vermelho] — critico (<7d)
      [Badge: laranja] — urgente (7-15d)
      [Badge: amarelo] — atencao (15-30d)
      [Badge: verde] — normal (>30d)

[Card: "Regras de Alerta Configuradas"] [ref: Passo 8]
  [Texto: "Nenhuma regra configurada..."] — se vazio [ref: Passo 10]
  [Tabela: Regras de Alerta]
    [Coluna: "Tipo"]
    [Coluna: "30d"]
    [Coluna: "15d"]
    [Coluna: "7d"]
    [Coluna: "1d"]
    [Coluna: "Email"]
    [Coluna: "Push"]
    [Coluna: "Ativo"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Alertas"] | 1 |
| [Summary Cards: Total/Critico/Urgente/Atencao/Normal] | 2 |
| [Card: "Proximos Vencimentos"] | 3 |
| [Botao: "Atualizar"] | 4 |
| [Tabela: Proximos Vencimentos] | 5 |
| [Coluna: "Tipo"] / badges coloridos | 6 |
| [Coluna: "Urgencia"] / badges coloridos | 7 |
| [Card: "Regras de Alerta Configuradas"] | 8 |
| [Tabela: Regras de Alerta] | 8 |
| [Texto: "Nenhum vencimento..."] | 9 |
| [Texto: "Nenhuma regra configurada..."] | 10 |

### Implementacao Atual
**Implementado**

---
