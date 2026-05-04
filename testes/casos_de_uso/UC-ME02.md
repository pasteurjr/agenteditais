---
uc_id: UC-ME02
nome: "Distribuicao Geografica do Mercado (EXPANSAO — CRMPage aba Mapa)"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 202
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-ME02 — Distribuicao Geografica do Mercado (EXPANSAO — CRMPage aba Mapa)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 202).
> Sprint origem: **Sprint 7**.

---

**Tipo:** EXPANSAO da aba Mapa existente em `CRMPage.tsx`
**O que JA EXISTE:** Mapa Leaflet/OpenStreetMap com `MapContainer`, `TileLayer`, `CircleMarker` por UF. Popup mostra nome da UF, quantidade de editais e breakdown por pipeline_stage. Endpoint: `GET /api/crm/mapa`. Arquivo: `frontend/src/pages/CRMPage.tsx` (539L, aba Mapa).

**RNs aplicadas:** RN-059 (cache 30d), RN-037 (audit log)

**RF relacionado:** RF-050
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Dados do TAM/SAM ja calculados (UC-ME01)
3. Editais possuem campo UF preenchido
4. Mapa Leaflet ja funcional na aba Mapa do CRM (Sprint 5)

### Pos-condicoes
1. Aba Mapa do CRM expandida com camada SAM e stat cards de oportunidade
2. Ranking de UFs visivel abaixo do mapa

### Sequencia de Eventos — APENAS O DELTA (o que ADICIONA ao mapa existente)

1. Usuario acessa CRMPage (`/app/crm`) e clica na aba "Mapa" (JA EXISTE)
2. **NOVO:** [Card: "Stat Cards — grid 3"] acima do mapa: UF com Maior Oportunidade, UF com Menor Participacao, UFs sem Presenca
3. **NOVO:** [Filtros adicionais]: [Select: "Segmento"] (Todos/Hematologia/...), [Select: "Metrica"] (Quantidade / Valor R$)
4. **EXPANDIDO:** Cores dos CircleMarker agora refletem oportunidade SAM: verde escuro (alta) → amarelo → cinza (zero)
5. **EXPANDIDO:** Popup ao clicar UF agora inclui: valor R$, top 3 orgaos compradores, taxa participacao empresa, [Link: "Ver editais desta UF"]
6. **NOVO:** [Card: "Ranking de UFs"] abaixo do mapa — DataTable: UF, Editais (SAM), Valor Total, Participados, Taxa %, Gap (oportunidade nao captada)
7. **EXPANDIDO:** Endpoint `GET /api/crm/mapa` recebe params adicionais: `segmento`, `metrica`. Retorno expandido com stat cards SAM e ranking

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`) — NAO MercadoPage
**Posicao:** Aba "Mapa" (EXISTENTE, expandida)

#### Layout da Tela (mostra APENAS os elementos NOVOS/EXPANDIDOS)

```
+---------------------------------------------------------------+
|  CRM > Mapa                                                   |
|                                                               |
|  [Pipeline] [Param.] [Mapa] [Agenda] [KPIs] [Decisoes]       |
|                                                               |
|  === ELEMENTOS NOVOS (Sprint 7) ===                           |
|                                                               |
|  [Filtros NOVOS] Segmento: [Todos v]  Metrica: [Qtd v]       |
|                                                               |
|  +---------+  +----------+  +-----------+  (NOVO)             |
|  |Maior    |  |Menor     |  |Sem        |                     |
|  |Oportuni.|  |Participac|  |Presenca   |                     |
|  |SP (142) |  |BA (0.5%) |  |AC,RR,AP   |                     |
|  +---------+  +----------+  +-----------+                     |
|                                                               |
|  +---- Mapa Leaflet/OSM (JA EXISTE) ------+                  |
|  |  CircleMarker por UF (JA EXISTE)        |                  |
|  |  EXPANDIDO: cores por oportunidade SAM  |                  |
|  |  EXPANDIDO: popup com valor R$, orgaos  |                  |
|  +------------------------------------------+                 |
|                                                               |
|  +------ Ranking de UFs (NOVO) -----+                         |
|  |UF |Editais|Valor   |Part.|Taxa |Gap     |                 |
|  |SP |  142  |R$ 98M  | 28  |19.7%|114 ed. |                 |
|  |MG |   87  |R$ 52M  | 15  |17.2%| 72 ed. |                 |
|  +--------------------------------+                           |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **NOVOS (leitura):** Stat Cards SAM (3), Ranking de UFs (DataTable)
- **EXPANDIDOS (leitura):** Cores do mapa por oportunidade, Popup com valor R$ + orgaos + link
- **NOVOS (input):** Filtro Segmento, Filtro Metrica
- **JA EXISTENTES (nao alterar):** MapContainer, TileLayer, CircleMarker, popup basico por pipeline_stage

### Excecoes
- **E1:** Nenhum edital com UF preenchida — stat cards zerados, mapa mantém CircleMarkers existentes sem camada SAM

---
