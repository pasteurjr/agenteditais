# PLANO DE IMPLEMENTACAO — SPRINT 10: Simulador Multi-Agente de Pregao Eletronico

**Data:** 2026-04-21
**Escopo:** Simulador completo de pregao eletronico com agentes IA (licitantes + pregoeiro) rodando sobre o framework **LangNet**
**Status:** V2 — Arquitetura 100% LangNet (WebSocket + Adapter + ExecutionEngine.js + Petri Net JSON)

---

## 1. Contexto e Objetivo

O sistema de editais ja possui uma Sala Virtual (Sprint 9) para acompanhar pregoes reais. O Sprint 10 cria um **simulador de treinamento** onde o operador compete contra 2-5 agentes IA em um pregao eletronico completo, seguindo as fases da Lei 14.133/2021.

O simulador roda sobre o **LangNet** — framework de Petri Nets criado pelo usuario, ja validado em producao pelo projeto TropicalSales. O TropicalSales foi o primeiro projeto sobre o LangNet; o Simulador de Pregao sera o segundo.

**Valor:** O operador pratica antes de pregoes reais, sem risco financeiro, contra oponentes com personalidades distintas.

---

## 2. Decisao Arquitetural: 100% LangNet

### O que e o LangNet

Framework de orquestracao de agentes baseado em Petri Nets, com:
- **Petri Net JSON** — definicao declarativa de places, transicoes e arcos
- **ExecutionEngine.js** — motor frontend que percorre a Petri Net, executando cada place via WebSocket (agentId) ou JS local
- **WebSocket Generic V7** — server Python generico com Adapter Pattern
- **Adapter Pattern** — adaptador por projeto (convert V1↔backend, generate_script, parse_verbose)
- **Context State List** — acumulador de estados entre places (como States do LangGraph)

### Por que LangNet (e nao LangGraph/CrewAI/REST puro)?

| Criterio | LangNet | LangGraph | CrewAI | REST puro |
|---|---|---|---|---|
| Ja funciona (TropicalSales) | Sim | Nao testado | Nao instalado | Simples mas sem framework |
| Concorrencia nativa | Tokens paralelos | Sequential | Sequential | Manual |
| Verificacao formal | Guardas + prioridades | Nao | Nao | Nao |
| Verbose real-time | execution_step via WS | Nao nativo | Nao nativo | Nao |
| Estado acumulativo | Context State List | TypedDict | Pydantic | Manual |
| Frontend integrado | ExecutionEngine.js | Nao | Nao | Polling |

**Decisao:** Usar LangNet 100%. Criar novo adapter (PregaoAdapter), nova Petri Net JSON (pregao_eletronico.json), novos agentes Python — tudo seguindo exatamente o padrao que ja funciona no TropicalSales.

### Componentes LangNet reutilizados (do repo valep1)

| Componente | Arquivo de referencia | Reutilizacao |
|---|---|---|
| ExecutionEngine.js | `valep1/visualtasksexec/tropicalsales/src/components/PetriNetExec/ExecutionEngine.js` | Portar para TS, adaptar para pregao |
| WebSocket Generic V7 | `valep1/visualtasksexec/tropicalsales/websocket_framework_v7/websocket_generic_v7.py` | Copiar, instanciar com PregaoAdapter |
| BaseAdapter | `valep1/visualtasksexec/tropicalsales/websocket_framework_v7/base_adapter.py` | Copiar como base |
| TropicalSalesAdapter | `valep1/visualtasksexec/tropicalsales/websocket_framework_v7/adapters/tropical_sales_adapter.py` | Referencia para criar PregaoAdapter |
| Petri Net JSON format | `valep1/visualtasksexec/tropicalsales/petri_corrected_clean.json` | Formato para pregao_eletronico.json |
| langnet.py (motor Python) | `/mnt/data1/progpython/AIWINLOCAL/langnet.py` (237L) | Referencia: EstadoGlobal, Lugar, Arco, Transicao, PetriNet |

---

## 3. Protocolo do Pregao Eletronico (Lei 14.133/2021)

### 3.1 Rede de Petri do Pregao

```
[P_INICIO] --T1--> [P_PROPOSTAS] --T2--> [P_CLASSIFICACAO] --T3--> [P_LANCES_ABERTOS]
                                                                          |
                                                                    T4 (nova rodada, loop)
                                                                          |
                                                                    T5 (sem mais lances)
                                                                          |
                                                          T6a (aberto+fechado) / T6b (so aberto)
                                                                          |
                                                                   [P_LANCES_FECHADOS] ou skip
                                                                          |
                                                          T7a (acima ref) / T7b (abaixo ref)
                                                                          |
                                                                   [P_NEGOCIACAO] ou skip
                                                                          |
                                                                    [P_HABILITACAO]
                                                                          |
                                                          T9a (habilitado) / T9b (inabilitado, volta)
                                                                          |
                                                                   [P_ADJUDICACAO]
                                                                          |
                                                                   [P_RESULTADO]
```

### 3.2 Places (Lugares)

| Place | Funcao | input_data | output_data |
|---|---|---|---|
| P_INICIO | Inicializa sessao, cria agentes | edital_id, config | sessao_id, agentes[] |
| P_PROPOSTAS | Coleta propostas iniciais (sealed) | agentes, camadas | propostas[] |
| P_CLASSIFICACAO | Classifica (faixa +/-N% do melhor) | propostas | classificados[], desclassificados[] |
| P_LANCES_ABERTOS | Rodadas de lances abertos (loop) | classificados, rodada | lances[], ranking[] |
| P_LANCES_FECHADOS | Lance final selado (se aberto+fechado) | ranking_aberto | lances_fechados[] |
| P_NEGOCIACAO | Pregoeiro negocia com vencedor | vencedor, referencia | valor_negociado |
| P_HABILITACAO | Verifica docs (simulado) | vencedor | habilitado (bool) |
| P_ADJUDICACAO | Declara vencedor | habilitado | adjudicado |
| P_RESULTADO | Resultado final, estatisticas | tudo | ranking_final, ata, stats |

### 3.3 Transicoes com Guardas

| Transicao | Guarda | Prioridade |
|---|---|---|
| T_ABRIR_PROPOSTAS | P_INICIO tem token | 10 |
| T_TODAS_PROPOSTAS | Todos N participantes submeteram | 9 |
| T_CLASSIFICAR | Propostas disponiveis | 8 |
| T_INICIAR_LANCES | >=2 classificados | 7 |
| T_NOVA_RODADA | Rodada anterior encerrada, >=2 ativos | 6 |
| T_ENCERRAR_RODADA | Timer expirou OU todos deram lance/passaram | 5 |
| T_SEM_MAIS_LANCES | 3 rodadas sem lance novo OU max_rodadas | 5 |
| T_ABRIR_FECHADO | modalidade==aberto_fechado | 4 |
| T_PULAR_FECHADO | modalidade==aberto | 4 |
| T_NEGOCIAR | vencedor > valor_referencia | 3 |
| T_PULAR_NEGOCIACAO | vencedor <= valor_referencia | 3 |
| T_HABILITAR | Docs OK (probabilistico: 90% passa) | 2 |
| T_INABILITAR_PROXIMO | Docs falhou, chamar proximo | 2 |
| T_ADJUDICAR | Habilitado | 1 |
| T_ENCERRAR | Adjudicado | 0 |

---

## 4. Arquitetura Completa — 100% LangNet

### 4.1 Fluxo de Execucao

```
Frontend (React)
  SimuladorPregaoPage.tsx
    PregaoExecutionEngine.ts (porta de ExecutionEngine.js)
      Para cada Place da Petri Net JSON:
        Se place.agentId != null → WebSocket (Python server, port 6309)
        Se place.agentId == null → logica local (TS)
      Context State acumula outputs entre places

WebSocket Server (Python, websocket_pregao_server.py, port 6309)
  Instancia de websocket_generic_v7.py com PregaoAdapter
  Recebe {type: "execute_task", data: {task_name, input_data}}
  PregaoAdapter:
    convert_v1_to_backend_format() → formato agente
    generate_execution_script() → script Python temp
    Executa via subprocess
    Captura verbose real-time (execution_step messages)
  Retorna {type: "task_completed", data: {result, duration}}

Backend Agentes (Python)
  agentes_licitantes.py — 5 personalidades com DeepSeek
  pregoeiro_ia.py — protocolo Lei 14.133 completo
  execute_individual_task(task_name, backend_input) → resultado
```

### 4.2 Novos Arquivos

| Arquivo | Linhas | Descricao |
|---|---|---|
| **Backend (LangNet infra)** | | |
| `backend/langnet/websocket_generic_v7.py` | ~250 | Copia do GenericWebSocketServer do LangNet |
| `backend/langnet/base_adapter.py` | ~60 | BaseAdapter copiado do LangNet |
| `backend/langnet/pregao_adapter.py` | ~350 | PregaoAdapter: convert, generate_script, parse_verbose |
| `backend/langnet/websocket_pregao_server.py` | ~80 | Instancia server port 6309 com PregaoAdapter |
| **Backend (Agentes Pregao)** | | |
| `backend/agentes_licitantes.py` | ~400 | 5 personalidades (Agressivo, Conservador, Erratico, Calculista, Reativo) |
| `backend/pregoeiro_ia.py` | ~300 | Pregoeiro IA: classificacao, validacao, negociacao, ata |
| `backend/rn_pregao.py` | ~100 | Regras de negocio (RN-099 a RN-102, desempate ME/EPP) |
| **Frontend** | | |
| `frontend/src/pages/SimuladorPregaoPage.tsx` | ~800 | UI sala de pregao (config + sala + resultado) |
| `frontend/src/engine/PregaoExecutionEngine.ts` | ~300 | Porta do ExecutionEngine.js para pregao |
| `frontend/src/api/sprint10.ts` | ~100 | API client REST + WebSocket helpers |
| `frontend/src/components/PetriNetView.tsx` | ~200 | Visualizacao da Petri Net |
| **Dados** | | |
| `backend/petri_nets/pregao_eletronico.json` | ~200 | Petri Net JSON no formato LangNet |

### 4.3 Petri Net JSON (`pregao_eletronico.json`)

Formato identico ao `petri_corrected_clean.json` do TropicalSales:

```json
{
  "lugares": [
    {
      "id": "P_INICIO", "nome": "Inicio Sessao", "tokens": 1,
      "coordenadas": {"x": 50, "y": 300}, "delay": 0, "subnet": null,
      "agentId": null,
      "input_data": ["edital_id", "config_agentes", "modalidade"],
      "output_data": ["sessao_id", "agentes_json", "camadas_json"],
      "logica": "// JS local: inicializa estado no context_state"
    },
    {
      "id": "P_PROPOSTAS", "nome": "Coleta Propostas Iniciais", "tokens": 0,
      "agentId": "submeter_propostas",
      "input_data": ["agentes_json", "camadas_json"],
      "output_data": ["propostas_json"]
    },
    {
      "id": "P_CLASSIFICACAO", "nome": "Classificacao", "tokens": 0,
      "agentId": "classificar",
      "input_data": ["propostas_json"],
      "output_data": ["classificados_json", "desclassificados_json"]
    },
    {
      "id": "P_LANCES_ABERTOS", "nome": "Lances Abertos", "tokens": 0,
      "agentId": "decidir_lances",
      "input_data": ["classificados_json", "rodada_atual", "ranking_json"],
      "output_data": ["lances_json", "ranking_json", "rodada_atual"]
    }
  ],
  "transicoes": [...],
  "arcos": [...]
}
```

9 places, 15 transicoes, ~30 arcos (conforme secao 3 acima).

### 4.4 PregaoAdapter (segue padrao TropicalSalesAdapter)

```python
class PregaoAdapter(BaseAdapter):
    def get_supported_tasks(self):
        return ["submeter_propostas", "classificar", "decidir_lances",
                "lance_fechado", "negociar", "habilitar", "adjudicar", "gerar_ata"]

    def convert_v1_to_backend_format(self, task_name, input_data):
        # context_state do frontend → formato do agente Python

    def generate_execution_script(self, task_name, backend_input):
        # Gera script temp que chama execute_individual_task()

    def convert_backend_result_to_v1(self, task_name, result, context_state_list):
        # Resultado agente → context_state para proximo place

    def should_parse_verbose_line(self, line):
        return line.startswith("PREGAO_STEP:")

    def parse_verbose_line(self, line, task_name):
        # "PREGAO_STEP: Agente Calculista analisando..." → execution_step message
```

### 4.5 PregaoExecutionEngine.ts (porta de ExecutionEngine.js)

```typescript
class PregaoExecutionEngine {
  private petriNet: PetriNetJSON;
  private contextState: ContextStateList;
  private ws: WebSocket;  // port 6309

  async executePlace(place: Place): Promise<void> {
    if (place.agentId) {
      await this.executeWebSocketPlace(place);
    } else {
      await this.executeLocalPlace(place);
    }
    this.updateContextState(result, place.id);
  }

  async executeWebSocketPlace(place: Place): Promise<any> {
    const mergedInput = this.mergeContextState(place.input_data);
    this.ws.send(JSON.stringify({
      type: "execute_task",
      data: { task_name: place.agentId, input_data: mergedInput }
    }));
    // Aguarda task_completed, processa execution_step (verbose real-time)
  }
}
```

### 4.6 Context State List para Pregao

```json
{
  "states": [{
    "place_id": "P_LANCES_ABERTOS",
    "task_name": "decidir_lances",
    "propostas_json": "...",
    "lances_json": "...",
    "ranking_json": "...",
    "classificados_json": "...",
    "rodada_atual": 5,
    "timer_restante": 87,
    "timestamp": "2026-04-21T14:30:00"
  }],
  "merged_state": { ... },
  "place_transitions": ["P_INICIO→T1→P_PROPOSTAS→T2→P_CLASSIFICACAO→T3→P_LANCES_ABERTOS"]
}
```

### 4.7 Verbose Real-Time

Cada agente IA envia `execution_step` messages via WebSocket durante sua decisao:
- "Agente Calculista analisando historico de lances..."
- "Agente Agressivo preparando lance agressivo..."
- "Pregoeiro: Lance R$ 480.00 aceito, nova posicao: 2o"
- "Pregoeiro: Rodada 5 encerrada. Lider: Agente Conservador R$ 475.00"

Essas mensagens aparecem em tempo real no painel do Pregoeiro na UI.

---

## 12. Arquivos de Referencia

| Recurso | Caminho | O que reutilizar |
|---|---|---|
| Motor Petri Net base | `/mnt/data1/progpython/AIWINLOCAL/langnet.py` | EstadoGlobal, Lugar, Arco, Transicao, PetriNet (237L) |
| Petri Net JSON example | `valep1/visualtasksexec/tropicalsales/petri_corrected_clean.json` | Formato JSON de referencia |
| ExecutionEngine JS | `valep1/visualtasksexec/tropicalsales/src/components/PetriNetExec/ExecutionEngine.js` | Padrao executePlace |
| WebSocket generico V7 | `valep1/visualtasksexec/tropicalsales/websocket_framework_v7/websocket_generic_v7.py` | Server generico com Adapter |
| TropicalSalesAdapter | `valep1/visualtasksexec/tropicalsales/websocket_framework_v7/adapters/tropical_sales_adapter.py` | Padrao de adapter |
| Backend agents | `valep1/visualtasksexec/tropicalsales/tropicalagentssalesv6.py` | execute_individual_task pattern |
| Context State List | `valep1/visualtasksexec/tropicalsales/PLANEJAMENTO_V7_COMPLETO_DETALHADO.md` | Formato states/merged_state |
| Sala Virtual existente | `frontend/src/pages/LancesPage.tsx` | UI patterns |
| DeepSeek integration | `backend/llm.py` | call_deepseek() |
| Simulacao existente | `backend/tools.py:9241-9396` | tool_simular_lance |
