---
uc_id: UC-AP03
nome: "Padroes Detectados pela IA"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 1020
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AP03 — Padroes Detectados pela IA

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 1020).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-NEW-06 (confianca >= 50% para exibir, >= 70% para sugestao), RN-037 (audit log)

**RF relacionado:** RF-055 (Aprendizado Continuo), RF-060 (Analytics MindsDB — conceito simplificado)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Job de deteccao de padroes executado pelo scheduler (1x/semana)
3. Base de feedbacks + auditoria com dados suficientes

### Pos-condicoes
1. Usuario visualiza padroes detectados com nivel de confianca
2. Padroes com confianca >= 70% podem gerar sugestoes automaticas (UC-AP02)

### Sequencia de Eventos

1. Usuario clica na [Aba: "Padroes"]
2. [Card: "Stat Cards — grid 3"] exibe: Padroes Detectados (total), Alta Confianca (>= 70%), Ultima Analise (data/hora do ultimo job)
3. [Card: "Padroes Identificados"] lista os padroes em cards visuais:
   - Cada padrao: [Icone por tipo], [Titulo], [Descricao], [Badge: Confianca %], [Texto: Base de dados (N registros)], [Texto: Acao sugerida]
   - Tipos de padrao: sazonalidade, correlacao, tendencia_preco, comportamento_orgao, gargalo_pipeline
4. Padroes com confianca >= 70%: [Badge verde: "Alta Confianca"] + [Link: "Ver sugestao gerada"]
5. Padroes com confianca 50-69%: [Badge amarelo: "Emergente"] — sem sugestao, apenas observacao
6. Padroes com confianca < 50%: filtrados (nao exibidos por padrao, toggle para mostrar)
7. [Card: "Timeline de Analises"] tabela: Data/Hora do Job, Padroes Novos, Padroes Atualizados, Padroes Removidos
8. [Botao: "Forcar Nova Analise"] dispara job de deteccao imediato (scheduler)

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage
**Posicao:** Aba "Padroes"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Aprendizado > Padroes                                        |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Padroes    |  |Alta       |  |Ultima     |                  |
|  |Detectados |  |Confianca  |  |Analise    |                  |
|  |    12     |  |     7     |  |14/04 06h  |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  [ ] Mostrar padroes com confianca < 50%                      |
|  [Forcar Nova Analise]                                        |
|                                                               |
|  +---- Padroes Identificados --------+                        |
|  |                                   |                        |
|  | 📈 SAZONALIDADE — Hemato em SP                             |
|  |    Pico de editais em Mar/Abr e Set/Out.                  |
|  |    Base: 142 editais (24 meses)                           |
|  |    Confianca: [92%] Alta                                  |
|  |    Acao: intensificar monitoramento nesses meses          |
|  |    [Ver sugestao gerada -->]                              |
|  |                                                            |
|  | 📊 CORRELACAO — Aderencia tecnica x Vitoria               |
|  |    Editais com score tecnico >= 75 tem taxa de            |
|  |    vitoria 3x maior que score < 50.                       |
|  |    Base: 89 editais analisados                            |
|  |    Confianca: [85%] Alta                                  |
|  |    Acao: priorizar editais com score tecnico alto         |
|  |    [Ver sugestao gerada -->]                              |
|  |                                                            |
|  | 💰 TENDENCIA — Preco medio caindo em Bioquimica           |
|  |    Preco medio caiu 12% nos ultimos 6 meses.             |
|  |    Base: 38 editais no segmento                           |
|  |    Confianca: [68%] Emergente                             |
|  |    Observacao: monitorar antes de agir                    |
|  |                                                            |
|  | 🏛️ ORGAO — HC-FMUSP comprando mais frequente             |
|  |    Frequencia de editais subiu 40% vs semestre ant.       |
|  |    Base: 23 editais do orgao                              |
|  |    Confianca: [74%] Alta                                  |
|  |    Acao: priorizar preparacao para este orgao             |
|  |    [Ver sugestao gerada -->]                              |
|  +-------------------------------------------+               |
|                                                               |
|  +---- Timeline de Analises ----+                             |
|  |Data/Hora   |Novos|Atualiz.|Removidos|                      |
|  |14/04 06:00 |  2  |   5    |    1    |                      |
|  |07/04 06:00 |  1  |   3    |    0    |                      |
|  +------------------------------+                             |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Cards de padroes com confianca, Timeline de analises
- **Preenchidos (input):** Toggle "mostrar < 50%", Botao Forcar Nova Analise
- **Obtidos (resposta do sistema):** Padroes detectados, niveis de confianca, link para sugestoes, historico de jobs

### Excecoes
- **E1:** Nenhum padrao detectado — mensagem: "A IA precisa de mais dados para detectar padroes. Continue registrando resultados."
- **E2:** Job de deteccao nao executou — banner: "Analise de padroes nao executou na ultima semana. Verifique o scheduler."

---

## BACKEND — NOVOS ENDPOINTS E TOOLS

### Endpoints REST

| Metodo | Rota | Descricao | UC |
|--------|------|-----------|-----|
| GET | `/api/dashboard/mercado/tam-sam-som` | Calcula TAM/SAM/SOM com filtros | UC-ME01 |
| GET | `/api/dashboard/mercado/mapa` | Distribuicao por UF | UC-ME02 |
| GET | `/api/dashboard/mercado/share` | Share vs concorrentes | UC-ME03 |
| POST | `/api/mercado/detectar-intrusos` | Analisa edital via IA para itens intrusos | UC-ME04 |
| GET | `/api/dashboard/analytics/funil` | Funil de conversao do pipeline CRM | UC-AN01 |
| GET | `/api/dashboard/analytics/conversoes` | Taxas por tipo/UF/segmento | UC-AN02 |
| GET | `/api/dashboard/analytics/tempos` | Tempo medio entre etapas | UC-AN03 |
| GET | `/api/dashboard/analytics/roi` | ROI estimado | UC-AN04 |
| GET | `/api/dashboard/analytics/perdas` | Dashboard de perdas | UC-AN05 |
| GET | `/api/dashboard/aprendizado/sugestoes` | Sugestoes da IA | UC-AP02 |
| POST | `/api/aprendizado/sugestoes/<id>/aceitar` | Aceitar sugestao | UC-AP02 |
| POST | `/api/aprendizado/sugestoes/<id>/rejeitar` | Rejeitar sugestao com motivo | UC-AP02 |
| GET | `/api/dashboard/aprendizado/padroes` | Padroes detectados | UC-AP03 |
| POST | `/api/aprendizado/analisar` | Forcar analise de padroes | UC-AP03 |

### Tools DeepSeek

| Tool | Descricao | UC |
|------|-----------|-----|
| `tool_calcular_tam_sam_som` | Dimensionamento de mercado com filtros | UC-ME01 |
| `tool_detectar_itens_intrusos` | Detecta itens fora do portfolio em edital | UC-ME04 |
| `tool_gerar_sugestao_aprendizado` | Gera sugestoes baseadas em feedbacks | UC-AP02 |
| `tool_analisar_padroes` | Roda deteccao de padroes sobre feedbacks | UC-AP03 |

### Modelos (alteracoes)

| Modelo | Alteracao | Motivo |
|--------|-----------|--------|
| `AprendizadoFeedback` | Adicionar campo `rejeitado_motivo` (Text, nullable) | UC-AP02 — registrar motivo de rejeicao |
| NOVO: `SugestaoIA` | id, tipo, titulo, descricao, confianca, base_dados_count, acao_sugerida, status (pendente/aceita/rejeitada), feedback_id (FK), created_at | UC-AP02 |
| NOVO: `PadraoDetectado` | id, tipo (sazonalidade/correlacao/tendencia/orgao/gargalo), titulo, descricao, confianca, base_dados_count, dados_json, ativo, created_at, updated_at | UC-AP03 |
| NOVO: `ItemIntruso` | id, edital_id (FK), descricao_item, ncm, valor, percentual_edital, criticidade, acao_sugerida, created_at | UC-ME04 |

---

## SIDEBAR — ENTRADAS ATUALIZADAS

```
Indicadores
  ├── Flags          (Sprint 6)
  ├── Monitoria      (Sprint 6)
  ├── Concorrencia   (Sprint 5 — EXPANDIDO pelo UC-ME03)
  ├── Mercado        (Sprint 5 — EXPANDIDO pelos UC-ME01/ME04)
  ├── Contratado X Realizado  (Sprint 5)
  ├── Pedidos em Atraso       (Sprint 5)
  ├── Perdas         (Sprint 5 — EXPANDIDO pelo UC-AN05)
  ├── Analytics      (Sprint 7 — NOVO)
  └── Aprendizado    (Sprint 7 — NOVO)
```
**Nota:** Concorrencia, Mercado e Perdas ja existem no sidebar. Sprint 7 apenas ADICIONA Analytics e Aprendizado.

---

## SEED DATA — SPRINT 7

O seed da Sprint 7 deve popular:

1. **Concorrentes:** >= 5 concorrentes com segmentos, editais_participados, editais_ganhos, taxa_vitoria
2. **Participacoes:** >= 20 registros em `participacoes_editais` com precos e posicoes
3. **Precos Historicos:** >= 15 registros com preco_referencia, preco_vencedor, nosso_preco
4. **Feedbacks:** >= 15 registros em `AprendizadoFeedback` com 4 tipos de evento
5. **Sugestoes:** >= 5 registros em `SugestaoIA` (3 pendentes, 1 aceita, 1 rejeitada)
6. **Padroes:** >= 4 registros em `PadraoDetectado` com confiancas variadas (92%, 85%, 68%, 45%)
7. **Itens Intrusos:** >= 3 registros em `ItemIntruso` com criticidades diferentes
8. **Editais:** garantir que editais existentes tenham UF, valor_estimado, segmento preenchidos para calculo TAM/SAM/SOM
