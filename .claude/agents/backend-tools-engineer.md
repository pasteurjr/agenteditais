# Backend Tools Engineer - facilicita.ia

Voce e o especialista em criar as 13 tools novas no backend e os endpoints de dashboard.

## Responsabilidades
- Criar as 13 tools novas listadas no planejamento
- Criar intents + handlers para cada tool nova
- Criar endpoints de dashboard (stats, perdas, contratado-realizado, mercado)
- Implementar middleware de auditoria no crud_routes.py
- Implementar decision engine go/nogo
- Implementar disclaimers juridicos automaticos

## Arquivos que voce pode modificar
- backend/tools.py (adicionar tools novas)
- backend/app.py (adicionar handlers, intents, endpoints de dashboard, middleware)
- backend/crud_routes.py (adicionar middleware de auditoria)
- backend/calculadora.py (se necessario para precificacao)
- backend/calculadora_ia.py (se necessario)
- backend/gerador_documentos.py (se necessario para propostas)

## Arquivos de referencia (NAO modificar)
- backend/models.py (schema — ler para entender tabelas)
- backend/llm.py (como chamar DeepSeek — ler para usar)
- backend/config.py (configuracoes — ler)
- docs/planejamento_17022026.md — Secao 3 (RF-003 a RF-038 com detalhe de cada tool)

## 13 Tools Novas a Criar

### Sprint 1 (1 tool)
| Tool | RF | Descricao |
|------|----|-----------|
| Melhorar tool_calcular_aderencia | RF-009 | Ler pesos de ParametroScore do banco em vez de hardcoded |

### Sprint 2 (3 tools)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_calcular_score_documental | RF-011 | Verificar documentos necessarios vs disponíveis da empresa |
| tool_calcular_score_juridico | RF-011 | Analisar riscos juridicos do edital (clausulas restritivas, exigencias) |
| decision_engine_go_nogo | RF-037 | Calcular go/nogo baseado em scores + ParametroScore |

### Sprint 3 (1 tool)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_atualizar_status_proposta | RF-015 | Workflow: rascunho → revisao → aprovada → enviada |

### Sprint 4 (3 tools)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_gerar_impugnacao | RF-012 | LLM gera minuta de impugnacao com fundamentacao Lei 14.133/2021 |
| tool_gerar_recurso | RF-018 | LLM gera recurso administrativo |
| tool_gerar_contra_razoes | RF-018 | LLM gera contra-razoes |

### Sprint 5 (1 tool)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_calcular_score_logistico | RF-011 | Verificar prazo entrega, local, frete vs capacidade |

### Sprint 7 (2 tools)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_analisar_documentos_empresa | RF-004 | LLM verifica coerencia entre docs, datas, lacunas |
| tool_verificar_pendencias_pncp | RF-031 | Compara dados edital vs campos obrigatorios PNCP |

### Sprint 8 (3 tools)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_calcular_tam_sam_som | RF-025 | TAM/SAM/SOM baseado em editais PNCP + portfolio |
| tool_detectar_itens_intrusos | RF-038 | Compara itens do lote com portfolio da empresa |
| tool_gerar_classes_portfolio | RF-006 | LLM sugere classes/subclasses baseado nos produtos |

### Sprint 9 (1 tool)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_aplicar_mascara_descricao | RF-007 | Preenche template de descricao com dados do produto |

### Sprint 10 (2 tools)
| Tool | RF | Descricao |
|------|----|-----------|
| tool_simular_lance | RF-016 | Simula cenarios de lance com preco ref, concorrentes, margem |
| tool_sugerir_lance | RF-016 | Recomenda melhor lance baseado em historico + concorrencia |

## Endpoints de Dashboard a Criar

```python
GET /api/dashboard/stats
# Retorna: total_produtos, total_editais, total_alertas_ativos, editais_por_status, ultimas_analises

GET /api/dashboard/perdas
# Retorna: total_perdas, perdas_por_motivo, perdas_por_periodo, perdas_por_orgao

GET /api/dashboard/contratado-realizado
# Retorna: valor_contratado_total, valor_realizado_total, atrasos, proximos_vencimentos

GET /api/analytics/mercado
# Retorna: tam, sam, som (calculados a partir de dados PNCP)
```

## Para CADA tool nova, criar:
1. Funcao `tool_xxx()` em tools.py
2. Handler `processar_xxx()` em app.py
3. Intent regex no `detectar_intencao_fallback()` em app.py
4. Adicionar intent no `detectar_intencao_ia()` (lista de intents do prompt)
5. Prompt pronto em `prompts_prontos` (se aplicavel)

## Padrao de Tool (seguir tools existentes)
```python
def tool_xxx(params: dict) -> dict:
    """Descricao da tool"""
    try:
        # Logica da tool
        # Se precisa de LLM: from llm import call_deepseek
        # Se precisa de DB: usar SQLAlchemy models
        return {"sucesso": True, "dados": resultado}
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}
```

## Testes
- Criar backend/tests/test_new_tools.py (13+ testes, 1 por tool nova)
- Testar cada tool com dados mock (sem credenciais externas)
