---
uc_id: UC-I05
nome: "Controle de Prazo"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 631
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-I05 — Controle de Prazo

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 631).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-043-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-133, RN-142
- Faltantes: RN-158 [FALTANTE], RN-163 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-133, RN-142, RN-158 [FALTANTE->V4], RN-163 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital salvo no sistema com data de abertura definida
2. Peticao em elaboracao ou planejada para o edital
3. Canais de notificacao configurados (email, WhatsApp, sistema)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**
- **UC-I03 OU UC-I04**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Alertas configurados para 3 dias uteis antes da abertura
2. Notificacoes enviadas nos canais ativos
3. Status de prazo visivel na interface
4. LOG de notificacoes registrado

### Sequencia de Eventos

1. Usuario acessa ImpugnacaoPage e clica na [Aba: "Prazos"] (icone Clock, com badge de prazos urgentes)
2. [Card: "Prazos de Impugnacao e Esclarecimento"] carrega automaticamente todos os editais salvos com suas datas
3. [Tabela: Prazos] exibe: Edital, Orgao, Data Abertura, Prazo Limite (3d uteis), Dias Restantes, Status
4. [Coluna: "Dias Restantes"] exibe contagem ou [Badge: "EXPIRADO"] (icone XCircle, error)
5. [Coluna: "Status"] exibe badge colorido: "Urgente" (error), "Atencao" (warning), "OK" (success), "Expirado" (error)
6. Sistema calcula automaticamente prazo de impugnacao: 3 dias uteis antes da data de abertura do certame (Art. 164 Lei 14.133/2021)
7. Badges de urgencia indicam nivel de criticidade de cada prazo em tempo real
8. Usuario revisa prazos e toma decisao sobre quais editais priorizar para impugnacao

### Fluxos Alternativos (V5)

**FA-01 — Todos os prazos expirados**
1. Usuario acessa [Aba: "Prazos"]
2. Todos os editais na tabela tem prazo de impugnacao ja expirado
3. [Coluna: "Dias Restantes"] exibe [Badge: "EXPIRADO"] para todas as linhas
4. [Coluna: "Status"] exibe [Badge: "Expirado"] (vermelho) em todas as linhas
5. Nenhuma acao de impugnacao disponivel para esses editais

**FA-02 — Edital com data de abertura futura distante (prazo confortavel)**
1. Edital tem data de abertura em 30+ dias
2. [Coluna: "Dias Restantes"] exibe numero alto (ex: "27 dias")
3. [Coluna: "Status"] exibe [Badge: "OK"] (verde)
4. Usuario pode postergar a elaboracao da peticao

**FA-03 — Multiplos editais com prazos diferentes**
1. Tabela exibe 3+ editais com prazos variados
2. Editais com prazo urgente (< 3 dias) aparecem com badge vermelho
3. Editais com prazo moderado (3-7 dias) aparecem com badge amarelo
4. Usuario ordena tabela por "Dias Restantes" para priorizar editais mais urgentes

### Fluxos de Excecao (V5)

**FE-01 — Edital sem data de abertura definida**
1. Edital salvo no sistema sem data de abertura (campo nulo ou vazio)
2. Sistema nao consegue calcular prazo de impugnacao
3. [Coluna: "Prazo Limite"] exibe "N/A"
4. [Coluna: "Status"] exibe [Badge: "Indefinido"] (cinza)
5. Mensagem na linha: "Data de abertura nao definida para este edital"

**FE-02 — Erro ao carregar prazos (falha de API)**
1. Usuario acessa [Aba: "Prazos"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao carregar prazos. Tente novamente."
4. [Botao: "Recarregar"] disponivel para nova tentativa

**FE-03 — Calculo de prazo incorreto em feriado (RN-163)**
1. Data de abertura do edital cai em dia util, mas o calculo de 3 dias uteis antes atravessa um feriado
2. Se a lib `workalendar` estiver ausente, sistema usa fallback sab/dom
3. Prazo pode estar 1 dia adiantado (ignorando feriado) — aviso: "Calculo de prazo pode nao considerar feriados regionais"

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Prazos" (3a aba)

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes"] [Aba: "Prazos" (badge: N urgentes)]

[Card: "Prazos de Impugnacao e Esclarecimento"] (icone Clock) [ref: Passo 2]
  [Texto: "Carregando prazos..."] (icone Loader2) — exibido durante carregamento

  [Tabela: Prazos] [ref: Passo 3]
    [Coluna: "Edital"] — sortable
    [Coluna: "Orgao"]
    [Coluna: "Data Abertura"] — sortable
    [Coluna: "Prazo Limite (3d uteis)"] — sortable
    [Coluna: "Dias Restantes"] — sortable [ref: Passo 4]
      [Badge: "EXPIRADO"] (error, icone XCircle) — prazo vencido
      [Texto: "{N} dias"] — prazo ativo
    [Coluna: "Status"] — render com badge colorido [ref: Passos 5, 7]
      [Badge: "Expirado"] (error)
      [Badge: "Urgente"] (error)
      [Badge: "Atencao"] (warning)
      [Badge: "OK"] (success)
```

> Nota: A regra "3 dias uteis antes da abertura (Art. 164 Lei 14.133/2021)" e calculada automaticamente pelo sistema. Nao ha campo de configuracao de alerta nesta versao — o controle e visual via badges de urgencia na tabela.

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Prazos"] | 1 |
| [Card: "Prazos de Impugnacao e Esclarecimento"] | 2 |
| [Tabela: Prazos] | 3 |
| [Coluna: "Dias Restantes"] / [Badge: "EXPIRADO"] | 4 |
| [Coluna: "Status"] / badges coloridos | 5, 7 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---
