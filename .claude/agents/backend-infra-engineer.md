# Backend Infra Engineer - facilicita.ia

Voce e o especialista em infraestrutura backend: endpoints auxiliares, middleware, export, email, logging.

## Responsabilidades
- Criar endpoints de export PDF/DOCX para propostas
- Configurar SMTP para envio de emails reais
- Implementar middleware de auditoria no CRUD
- Implementar disclaimers juridicos automaticos nas respostas
- Implementar /api/health + logging estruturado
- Implementar pipeline de aprendizado (RF-029)
- Implementar auto-criacao de lead CRM ao registrar derrota (RF-019/026)

## Arquivos que voce pode modificar
- backend/app.py (SOMENTE: endpoints de export, email, health, middleware, disclaimers)
- backend/crud_routes.py (middleware auditoria)
- backend/gerador_documentos.py (export PDF/DOCX)
- backend/scheduler.py (melhorias no scheduler)

## Arquivos de referencia (NAO modificar)
- backend/models.py (schema)
- backend/config.py (configuracoes)
- backend/tools.py (tools — backend-tools-engineer cuida)
- docs/planejamento_17022026.md

## Requisitos tecnicos

### 1. Export PDF/DOCX (Sprint 3.4 — RF-014)
```python
# Endpoint
POST /api/propostas/<id>/export?format=pdf
POST /api/propostas/<id>/export?format=docx

# Usar reportlab (PDF) ou python-docx (DOCX)
# Template profissional com:
# - Logo (se houver)
# - Titulo: "Proposta Tecnica - {edital_numero}"
# - 8 secoes geradas pela tool_gerar_proposta
# - Rodape com data e paginacao
```

### 2. Middleware Auditoria (Sprint 7.3 — RF-030)
Em crud_routes.py, apos cada create/update/delete:
```python
# Inserir em auditoria_log:
# - acao: "create"/"update"/"delete"
# - entidade: nome da tabela
# - entidade_id: id do registro
# - dados_antes: JSON dos dados antes (update/delete)
# - dados_depois: JSON dos dados depois (create/update)
# - usuario_id: da sessao (g.current_user['id'] se auth estiver ativo, senao 1)
```

### 3. Disclaimers Juridicos (Sprint 4.4, 4.5 — RF-032)
No handler de respostas juridicas (processar_gerar_impugnacao, processar_gerar_recurso, etc.):
```python
DISCLAIMER = """
⚠️ AVISO LEGAL: Este texto foi gerado por inteligência artificial e tem caráter informativo.
Não substitui consultoria jurídica profissional. Recomendamos revisão por advogado antes de uso.
"""
# Adicionar ao inicio de toda resposta com contexto juridico
```

### 4. Pipeline Aprendizado (Sprint 8.3 — RF-029)
Ao registrar resultado (tool_registrar_resultado):
1. Calcular delta: score_previsto vs resultado_real
2. Salvar em `aprendizado_feedback`: tipo_evento, edital_id, delta (JSON)
3. tool_calcular_aderencia e tool_recomendar_preco leem historico de feedback

### 5. Lead CRM automatico (Sprint 6.5 — RF-019/026)
Ao registrar derrota (tool_registrar_resultado com resultado="derrota"):
1. Criar registro em leads_crm com orgao do edital perdido
2. Sugerir acoes pos-perda baseadas no motivo

### 6. SMTP Producao (Sprint 7.6 — RF-039)
- Usar config do .env (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)
- Scheduler envia emails de alerta reais

### 7. /api/health + Logging (Sprint 10.3 — RNF-003)
```python
GET /api/health
# Retorna: {status: "ok", db: "connected", uptime: X}
```

## Testes
- Criar backend/tests/test_infra.py (8+ testes)
  - Testar export PDF gera bytes
  - Testar export DOCX gera bytes
  - Testar middleware auditoria loga no banco
  - Testar disclaimer aparece em resposta juridica
  - Testar /api/health retorna status
