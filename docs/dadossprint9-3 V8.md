# Conjunto de Dados C V8 — Sprint 9 (Lances, Sala Virtual, Scores) / Empresa Vita-Sense

> **V8** — Conjunto C de dados, continuidade da cadeia Vita-Sense S1→S8 V8. Estrutura idêntica ao molde; identidade adaptada.

**Data:** 2026-05-17
**Usuario:** validaargus@valida.com.br / 123456
**Empresa:** Vita-Sense Soluções Médicas Ltda. (CNPJ 49.825.713/0001-04)
**Inscricao Estadual:** 901.234.567.0098
**Referencia:** `docs/CASOS DE USO SPRINT9.md`
**UCs cobertos:** 12 (LA01, LA02, LA03, LA04, LA05, LA06, SC01, SC02, SC03, SC04, SC05, HC01)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | validaargus@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | Vita-Sense |
| Papel | Superusuário |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** >=28 distribuidos em 9 UFs (Sprints 1-5)
- **Produtos:** >=20 cadastrados no portfolio
- **Contratos:** >=12 vigentes (com data_assinatura)
- **Concorrentes:** >=5 com historico de participacoes
- **PrecoCamada:** configuradas para vinculos Vita-Sense (Camadas A-F)
- **EstrategiaEdital:** com perfil_competitivo e cenarios
- **Seeds anteriores obrigatorias:**
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`
  - `python backend/seeds/sprint8_seed.py`
  - `python backend/seeds/sprint9_seed.py`

---

## 3. Sessoes de Pregao (3 registros)

| # | Edital vinculado | Modalidade | Status | Fase | Autonomia | Resultado | Posicao Final | Lance Final | Margem Final |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1o edital Vita-Sense | aberto | **ativa** | aberta | copiloto | — | — | — | — |
| 2 | 2o edital Vita-Sense | aberto | **encerrada** | encerrada | um_clique | vitoria | 1o | R$ 385,00 | 13.24% |
| 3 | 3o edital Vita-Sense | aberto_fechado | **encerrada** | encerrada | copiloto | derrota | 3o | R$ 385,00 | 13.24% |

**Campos do modelo SessaoPregao:**
- `modalidade`: aberto / aberto_fechado
- `status`: configurando / ativa / pausada / encerrada
- `fase_atual`: aberta / fechada / encerrada
- `autonomia`: copiloto / um_clique / robo
- `timer_aberto_seg`: 120 (default)
- `timer_fechado_seg`: 300 (default)
- `robo_ativo`: false (todas)
- `max_lances_automaticos`: 20 (default)

---

## 4. Lances por Sessao (30 registros total)

| Sessao | Status Sessao | Num. Lances | Valor Inicial | Valor Final | Rodadas | Tipo |
|---|---|---|---|---|---|---|
| 1 (ativa) | ativa | 12 | R$ 482,50 | ~R$ 340+ | 1-12 | inicial + decremento |
| 2 (vitoria) | encerrada | 10 | R$ 482,50 | ~R$ 340+ | 1-10 | inicial + decremento |
| 3 (derrota) | encerrada | 8 | R$ 482,50 | ~R$ 340+ | 1-8 | inicial + decremento |

**Calculo dos lances (formula do seed):**
- `base_valor = 495.0`
- `valor = base_valor - (rodada * 12.5)`, limitado a min R$ 340 + (rodada * 2)
- `margem = ((valor - 340) / 340) * 100`
- Todos com `status=enviado`, `fase=aberta`

**Campos adicionados ao modelo Lance (Sprint 9):**
- `sessao_pregao_id` (FK nullable) — vincula lance a sessao
- `fase` (Enum: aberta/fechada, default aberta)

---

## 5. PrecoCamada — Valores das 6 Camadas (A-F)

| Camada | Campo | Valor | Papel na Sala Virtual |
|---|---|---|---|
| **A (Custo)** | `custo_base_final` | R$ 340,00 | Alarme de prejuizo — banner vermelho se lance < custo |
| **B (Base)** | `preco_base` | R$ 459,00 | Referencia de margem (custo * 1.35) |
| **C (Referencia)** | `target_referencia` | R$ 500,00 | Teto maximo — valor estimado do edital |
| **D (Inicial)** | `lance_inicial` | R$ 495,00 | Primeiro lance na disputa |
| **E (Minimo)** | `lance_minimo` | R$ 385,00 | Freio do robo — piso configurado |
| **E (Margem)** | `margem_minima` | 13.24% | Margem no piso = (385-340)/340*100 |
| **F (Historico)** | `preco_medio_historico` | R$ 440,00 | Referencia de mercado (concorrentes) |

**Faixa de Disputa:** R$ 385,00 (Camada E) — R$ 495,00 (Camada D)

---

## 6. EstrategiaEdital (3 registros)

| # | Edital vinculado | Perfil Competitivo | Cenarios Simulados |
|---|---|---|---|
| 1 | 1o edital Vita-Sense | quero_ganhar | Target R$ 500 (47.1%), Medio R$ 440 (29.4%), Agressivo R$ 404 (18.8%) |
| 2 | 2o edital Vita-Sense | quero_ganhar | Target R$ 500 (47.1%), Medio R$ 440 (29.4%), Agressivo R$ 404 (18.8%) |
| 3 | 3o edital Vita-Sense | nao_ganhei_minimo | Target R$ 500 (47.1%), Medio R$ 440 (29.4%), Agressivo R$ 404 (18.8%) |

**Perfis (RN-106):**
- `quero_ganhar`: decremento agressivo, objetivo 1o lugar
- `nao_ganhei_minimo`: decremento conservador, posicao 2a/3a

---

## 7. Concorrentes com Desclassificacoes (Score Qualidade)

| # | Concorrente | Editais Participados | Editais Ganhos | Desclassificado | Motivo |
|---|---|---|---|---|---|
| 1 | Concorrente #1 (idx 0) | 10 | 3 | Sim (1x) | Documentacao incompleta |
| 2 | Concorrente #2 (idx 1) | 13 | 4 | Nao | — |
| 3 | Concorrente #3 (idx 2) | 16 | 5 | Sim (1x) | Documentacao incompleta |
| 4 | Concorrente #4 (idx 3) | 19 | 6 | Nao | — |
| 5 | Concorrente #5 (idx 4) | 22 | 7 | Sim (1x) | Documentacao incompleta |

**Formula Score Qualidade (RN-NEW-16):**
`qualidade = 100 - ((desclassificacoes + impugnacoes) / max(editais_participados, 1)) * 100`

**Scores esperados:**
- Concorrente #1: 100 - (1/10)*100 = **90** (Alta, verde)
- Concorrente #3: 100 - (1/16)*100 = **93.75** (Alta, verde)
- Concorrente #5: 100 - (1/22)*100 = **95.45** (Alta, verde)
- Concorrentes sem desclassificacao: **100** (Alta, verde)

---

## 8. Monitoramento tipo sessao_pregao (1 registro)

| Campo | Valor |
|---|---|
| Tipo | sessao_pregao |
| Edital | 1o edital Vita-Sense |
| Termo | Sessao de Pregao — Reagentes Hematologia |
| Frequencia | 1 hora (polling normal; dia da sessao: 60s, RN-NEW-19) |
| Notificar email | Sim |
| Ativo | Sim |

---

## 9. Endpoints Sprint 9 (19 novos)

| # | Metodo | Endpoint | UC | Funcao |
|---|---|---|---|---|
| 1 | POST | /api/precificacao/simular-lance | LA01 | Simulacao deterministica de lances |
| 2 | POST | /api/sala/criar | LA03 | Cria sessao de pregao (sala virtual) |
| 3 | GET | /api/sala/{sessao_id}/estado | LA03 | Estado atual da sala (polling 5s) |
| 4 | POST | /api/sala/{sessao_id}/lance | LA04 | Registra lance na fase aberta |
| 5 | POST | /api/sala/{sessao_id}/lance-fechado | LA04 | Registra lance na fase fechada |
| 6 | POST | /api/sala/{sessao_id}/sugerir-lance | LA02 | Sugestao IA em tempo real |
| 7 | POST | /api/sala/{sessao_id}/encerrar | LA03 | Encerra sessao, calcula resultado |
| 8 | POST | /api/sala/{sessao_id}/robo/ativar | LA06 | Ativa robo (requer AUTO_BID_ENABLED) |
| 9 | POST | /api/sala/{sessao_id}/robo/desativar | LA06 | Desativa robo |
| 10 | POST | /api/sala/{sessao_id}/robo/pausar | LA06 | Pausa robo |
| 11 | POST | /api/monitoramentos/sessao-pregao | LA05 | Cria monitoramento tipo sessao_pregao |
| 12 | GET | /api/score/competitividade/{edital_id} | SC01 | Score de Competitividade 360 |
| 13 | GET | /api/concorrentes/{id}/qualidade | SC02 | Score Qualidade do concorrente |
| 14 | GET | /api/analytics/qualidade-orgao/{orgao} | SC02 | Media de qualidade por orgao |
| 15 | GET | /api/recursos/{edital_id}/score | SC03 | Score Numerico de Recurso |
| 16 | GET | /api/analytics/tempo-empenho | SC04 | Tempo medio do 1o empenho |
| 17 | GET | /api/contratos/{contrato_id}/dre | SC05 | DRE do contrato |
| 18 | POST | /api/precificacao/{edital_id}/simular-dre | SC05 | Simula DRE pre-contrato |
| 19 | GET | /api/health | HC01 | Health check publico (sem auth) |

---

## 10. Tools DeepSeek novas (6 registros)

| # | Tool | UC | Input principal | Output principal |
|---|---|---|---|---|
| 1 | tool_simular_lance | LA01 | edital_item_produto_id, num_rodadas, concorrentes, perfil | Array rodadas {rodada, valor_nosso, concorrentes[], posicao, margem} |
| 2 | tool_sugerir_lance | LA02 | lance_lider, nosso_ultimo, custo_base, lance_minimo, perfil | lance_sugerido, margem, posicao_estimada, confianca, abaixo_custo |
| 3 | tool_score_competitividade | SC01 | edital_id, empresa_id | score(0-100), fatores[4], confianca, bootstrap_pncp |
| 4 | tool_score_qualidade_concorrente | SC02 | concorrente_id ou orgao | score(0-100), badge(Alta/Media/Baixa), desclassificacoes |
| 5 | tool_score_recurso | SC03 | edital_id | score(0-100), recomendacao, fatores[4] |
| 6 | tool_dre_contrato | SC05 | contrato_id ou edital_id | receita_bruta, impostos, receita_liquida, custos, resultado, margem |

---

## 11. Health Check (UC-HC01)

| Campo | Valor |
|---|---|
| Endpoint | GET /api/health |
| Autenticacao | **Nenhuma** (RN-NEW-20) |
| Versao | 9.0.0 |
| Servicos verificados | 7 |
| HTTP 200 | healthy ou degraded |
| HTTP 503 | unhealthy |

**Servicos:**

| # | Servico | O que verifica |
|---|---|---|
| 1 | database | SELECT 1 no banco |
| 2 | pncp | Ping PNCP API |
| 3 | deepseek | Ping DeepSeek API |
| 4 | brave | Ping Brave Search API |
| 5 | smtp | Ping servidor SMTP |
| 6 | cache | Estado do cache |
| 7 | scheduler | Estado do scheduler |

**Resposta esperada:**
```json
{
  "status": "healthy",
  "version": "9.0.0",
  "uptime_seconds": 1234,
  "timestamp": "2026-05-17T10:00:00",
  "services": [
    {"name": "database", "status": "healthy", "latency_ms": 2, "message": "OK"},
    ...
  ]
}
```

---

## 12. Dados derivados (calculados em tempo real)

### Score de Competitividade (UC-SC01)
- **4 fatores ponderados:**
  - Historico similar (30%): editais ganhos/perdidos com mesmo NCM/faixa/regiao nos ultimos 24m (RN-NEW-15)
  - Posicao de preco (30%): percentil do preco configurado vs historico homologados
  - Concorrencia (20%): concorrentes conhecidos + taxa_vitoria media (RN-074)
  - Perfil orgao (20%): historico de decisoes do orgao
- **Score:** 0-100 com cores verde(>=70) / amarelo(40-69) / vermelho(<40)
- **Bootstrap PNCP:** se empresa sem historico proprio, usa dados publicos

### Score de Recurso (UC-SC03)
- **4 fatores ponderados:**
  - Desvios tecnicos (40%)
  - Historico empresa (20%)
  - Historico orgao (25%)
  - Fundamento legal (15%)
- **Recomendacao (RN-NEW-17):** >=70 "Recomendado", 30-69 "Inconclusivo", <30 "Nao recomendado"

### DRE do Contrato (UC-SC05)
- **Calculo:** Receita Bruta → (-) Impostos → Receita Liquida → (-) Custos → Resultado Operacional → Margem %
- **Badge (RN-NEW-18):** >20% verde, 10-20% amarelo, <10% vermelho

### Tempo Medio do 1o Empenho (UC-SC04)
- **Calculo:** MIN(Empenho.data_empenho) - Contrato.data_assinatura (em dias)
- **Nota:** Contrato NAO tem data_homologacao — usa data_assinatura como referencia
- **Agrupamento:** por orgao
- **Faixas:** Rapido(<30d verde) / Normal(30-60d amarelo) / Lento(>60d vermelho)

### Simulador Deterministico (UC-LA01)
- **Input:** num_rodadas, tipo_decremento(fixo_reais/percentual_ultimo), valor_decremento, concorrentes, perfil
- **Output:** array rodadas + stat cards (Resultado Final, Margem Final, Rodada Decisiva)
- **Validacoes:** RN-098 (cascata A-E), RN-099 (min < inicial), RN-102 (margem padronizada)

### Robo de Lances (UC-LA06)
- **Flag:** AUTO_BID_ENABLED (default: false, RN-NEW-12)
- **Limite:** max 20 lances automaticos por sessao (RN-NEW-13)
- **Parada automatica:** lance < custo_base interrompe robo (RN-NEW-14)

---

## 13. Regras de Negocio Sprint 9

| RN | Descricao resumida | UCs |
|---|---|---|
| RN-098 | Cascata A→E obrigatoria | LA01, LA06 |
| RN-099 | lance_min < lance_inicial | LA01, LA02, LA06 |
| RN-100 | lance < custo = warning vermelho | LA02, LA06 |
| RN-101 | Sugestao IA default = custo*1.10 | LA02 |
| RN-102 | Margem padronizada: ((valor-custo)/custo)*100 | LA01, LA02, SC01 |
| RN-106 | Perfis quero_ganhar / nao_ganhei_minimo | LA01, LA02, LA06 |
| RN-074 | Taxa vitoria: ganhos/max(participados,1)*100 | SC01, SC02 |
| RN-169 | Saldo empenho nao negativo | SC04 |
| RN-037 | Audit log universal | Todos |
| RN-084 | Cooldown DeepSeek 60s | LA01, LA02 |
| RN-132 | Audit invocacoes DeepSeek | LA01, LA02 |
| RN-NEW-12 | AUTO_BID_ENABLED=false default | LA06 |
| RN-NEW-13 | Max 20 lances automaticos | LA06 |
| RN-NEW-14 | Lance < custo interrompe robo | LA06 |
| RN-NEW-15 | Historico 24m + bootstrap PNCP | SC01 |
| RN-NEW-16 | Score qualidade formula | SC02 |
| RN-NEW-17 | Score recurso recomendacao | SC03 |
| RN-NEW-18 | DRE margem cores | SC05 |
| RN-NEW-19 | Polling sessao 60s no dia agendado | LA05 |
| RN-NEW-20 | Health check sem auth | HC01 |

**Total:** 20 RNs (11 existentes + 9 novas)
