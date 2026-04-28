---
uc_id: UC-CRM04
nome: "Agenda/Timeline de Etapas *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2475
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CRM04 — Agenda/Timeline de Etapas *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2475).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-188

**RF relacionado:** RF-045-04
**Ator:** Usuario (Analista Comercial / Gestor Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Editais no pipeline com datas de prazo definidas (submissao, lances, recursos, etc.)
3. Etapas do CRM com deadlines registradas

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-FU01**


### Pos-condicoes
1. Agenda exibida com visao de calendario/timeline
2. Proximos prazos destacados por urgencia
3. Filtros por responsavel aplicados

### Sequencia de Eventos

1. Na CRMPage, usuario clica na [Aba: "Agenda"]
2. [Card: "Agenda de Processos"] exibe visao de calendario mensal/semanal
3. [Secao: Controles de Visualizacao]:
   - [Botao: "Mes"] / [Botao: "Semana"] / [Botao: "Lista"] — alterna modo de visualizacao
   - [Botao: "<"] [Botao: ">"] — navega entre periodos
   - [Select: "Responsavel"] — filtra por vendedor/analista
4. No modo Calendario: eventos aparecem como blocos coloridos nas datas correspondentes
   - Cor conforme etapa do pipeline (mesmo padrao do mapa)
   - Tamanho do bloco proporcional a duracao do evento
5. No modo Lista: [Tabela: Proximos Prazos] exibe: Data, Edital, Orgao, Etapa, Prazo, Responsavel, Urgencia
6. [Coluna: "Urgencia"] exibe badge: Critico (vermelho, <3d), Urgente (laranja, 3-7d), Normal (verde, >7d)
7. [Card: "Proximos Prazos Criticos"] (destaque vermelho, condicional) lista os 5 prazos mais proximos
8. Eventos com contadores de tempo (recursos, contra-razoes) exibem [Indicador: tempo restante] com cor de "temperatura"
9. Usuario clica em evento no calendario — [Popup: detalhes do evento] exibe informacoes resumidas e link para o edital

### Fluxos Alternativos (V5)

- **FA-01 — Visualizacao em modo Lista:** Usuario clica "Lista" (passo 3). Calendario desaparece e tabela de proximos prazos e exibida em modo completo.
- **FA-02 — Nenhum prazo critico:** Card "Proximos Prazos Criticos" (passo 7) nao e exibido. Todos os prazos sao normais (> 7d).
- **FA-03 — Filtro por responsavel especifico:** Usuario seleciona um vendedor (passo 3). Apenas eventos atribuidos a esse vendedor sao exibidos no calendario/lista.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhum evento no periodo:** Calendario exibe mes/semana sem blocos coloridos. Tabela em modo Lista esta vazia. Mensagem "Nenhum prazo neste periodo."
- **FE-02 — Erro ao carregar agenda:** Requisicao falha. Calendario nao renderiza eventos. Alerta de erro exibido.
- **FE-03 — Edital sem data de prazo:** Edital nao aparece na agenda/timeline. Permanece visivel apenas no pipeline.

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Aba "Agenda"

#### Layout da Tela

```
[Aba: "Pipeline"] [Aba: "Mapa"] [Aba: "Agenda"] [Aba: "KPIs"] [Aba: "Parametrizacoes"]

[Card: "Agenda de Processos"] [ref: Passo 2]

  [Secao: Controles] [ref: Passo 3]
    [Botao: "Mes"] / [Botao: "Semana"] / [Botao: "Lista"]
    [Botao: "<"] [Texto: "{periodo_atual}"] [Botao: ">"]
    [Select: "Responsavel"] — opcoes dinamicas

  [Calendario: visao mensal/semanal] — condicional [ref: Passo 4]
    [Evento: bloco colorido] — cor da etapa, clicavel [ref: Passo 9]
      [Popup: detalhes] — numero, orgao, etapa, prazo

  [Tabela: Proximos Prazos] — modo Lista [ref: Passos 5, 6]
    [Coluna: "Data"] (render: formatDate)
    [Coluna: "Edital"]
    [Coluna: "Orgao"]
    [Coluna: "Etapa"] — badge colorido
    [Coluna: "Prazo"] — "{dias}d"
    [Coluna: "Responsavel"]
    [Coluna: "Urgencia"] — badge [ref: Passo 6]
      [Badge: "Critico"] (bg: #fee2e2, fg: #991b1b) — <3d
      [Badge: "Urgente"] (bg: #fed7aa, fg: #9a3412) — 3-7d
      [Badge: "Normal"] (bg: #dcfce7, fg: #166534) — >7d

  [Card: "Proximos Prazos Criticos"] — condicional [ref: Passo 7]
    [Lista: top 5 prazos]
      [Texto: "{edital} — {orgao}"]
      [Texto: "{dias}d restantes"] (fontWeight: 700, cor dinamica)
      [Indicador: tempo restante] — cor de temperatura [ref: Passo 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Agenda"] | 1 |
| [Card: "Agenda de Processos"] | 2 |
| [Secao: Controles] / botoes e select | 3 |
| [Calendario] / eventos coloridos | 4 |
| [Tabela: Proximos Prazos] | 5 |
| [Coluna: "Urgencia"] / badges | 6 |
| [Card: "Proximos Prazos Criticos"] | 7 |
| [Indicador: tempo restante] | 8 |
| [Popup: detalhes do evento] | 9 |

### Implementacao Atual
**Nao Implementado**

---
