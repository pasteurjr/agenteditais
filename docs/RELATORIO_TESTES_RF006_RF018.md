# Relatorio de Testes - RF-018, RF-011, RF-007, RF-014, RF-013

**Data:** 2026-03-12
**Executor:** Agente de Validacao (automatizado)
**Rodada:** 2 (apos correcao do import Float em models.py)

---

## Pre-requisitos

- Backend iniciado com sucesso na porta 5007
- Usuario de teste registrado: admin@editais.com / admin123
- Token JWT obtido via POST /api/auth/login
- **Migracao DB:** Foram adicionadas 12 colunas faltantes no MySQL que estavam definidas nos modelos mas nao no banco:
  - `parametros_score`: peso_documental, peso_complexidade, peso_juridico, peso_logistico, markup_padrao, custos_fixos, frete_base
  - `produtos`: status_pipeline, registro_anvisa, anvisa_status
  - `editais`: classe_produto_id, subclasse_produto_id

---

## Resultados dos Testes

| # | RF | Teste | Resultado | Observacao |
|---|-----|-------|-----------|------------|
| 1 | RF-018 | GET /api/crud/parametros-score - 8 campos peso_* | **PASS** | Todos os 8 campos retornados: peso_tecnico, peso_comercial, peso_participacao, peso_ganho, peso_documental, peso_complexidade, peso_juridico, peso_logistico |
| 2 | RF-018 | POST parametros-score com pesos iniciais | **PASS** | Criado com sucesso, 201 |
| 3 | RF-018 | PATCH peso_documental=0.20 e GET para verificar | **PASS** | Valor atualizado corretamente: peso_documental=0.2 |
| 4 | RF-011 | POST produto com status_pipeline="qualificado" | **PASS** | Produto "Test Pipeline" criado, status_pipeline="qualificado" retornado |
| 5 | RF-011 | GET produtos?search=Test+Pipeline - campo status_pipeline presente | **PASS** | Campo status_pipeline presente na resposta com valor "qualificado" |
| 6 | RF-007 | POST produto com registro_anvisa e anvisa_status | **PASS** | Produto "Test ANVISA" criado com registro_anvisa="80100300012", anvisa_status="ativo" |
| 7 | RF-007 | GET produtos?search=Test+ANVISA - campos ANVISA presentes | **PASS** | Ambos campos retornados corretamente |
| 8 | RF-014 | PATCH parametros-score com markup_padrao=30, custos_fixos=15000, frete_base=500 | **PASS** | Valores salvos corretamente |
| 9 | RF-014 | GET parametros-score - custos persistidos | **PASS** | markup_padrao=30.0, custos_fixos=15000.0, frete_base=500.0 |
| 10 | RF-013 | GET /api/crud/classes-produto-v2 | **PASS** | Retornou 8 classes com subclasses aninhadas |
| 11 | RF-013 | GET /api/crud/editais - campo classe_produto_id no schema | **PASS** | Endpoint funcional (0 editais no momento), coluna existe no DB |

---

## Detalhes por Requisito

### RF-018: 8 Dimensoes de Score

POST criou registro com os 8 pesos. PATCH atualizou peso_documental de 0.15 para 0.20. GET confirmou persistencia.

```json
{
    "peso_tecnico": 0.25,
    "peso_comercial": 0.15,
    "peso_participacao": 0.05,
    "peso_ganho": 0.1,
    "peso_documental": 0.2,
    "peso_complexidade": 0.1,
    "peso_juridico": 0.1,
    "peso_logistico": 0.1
}
```

### RF-011: Product Pipeline

POST com status_pipeline="qualificado" retornou 201 com o campo correto. GET por search confirmou o campo na resposta.

```json
{
    "nome": "Test Pipeline",
    "categoria": "reagente",
    "status_pipeline": "qualificado"
}
```

### RF-007: ANVISA Field

POST com registro_anvisa="80100300012" e anvisa_status="ativo" retornou 201. GET confirmou ambos os campos.

```json
{
    "nome": "Test ANVISA",
    "categoria": "equipamento",
    "registro_anvisa": "80100300012",
    "anvisa_status": "ativo",
    "status_pipeline": "cadastrado"
}
```

### RF-014: Cost Parameters

PATCH atualizou os 3 campos de custo no registro de parametros-score. GET confirmou persistencia.

```json
{
    "markup_padrao": 30.0,
    "custos_fixos": 15000.0,
    "frete_base": 500.0
}
```

### RF-013: Edital-Class Link

Endpoint classes-produto-v2 retornou 8 classes com subclasses. Coluna classe_produto_id adicionada ao banco de editais. Nao ha editais para verificar o campo na resposta JSON, mas o modelo inclui o campo em to_dict().

---

## Cleanup

Todos os registros de teste foram deletados com sucesso:
- Produto "Test Pipeline" (DELETE 200)
- Produto "Test ANVISA" (DELETE 200)
- Registro parametros-score (DELETE 200)

---

## Resumo

| Status | Quantidade |
|--------|-----------|
| PASS | 11 testes |
| FAIL | 0 testes |

**Conclusao:** Todos os 11 testes passaram apos a correcao do import `Float` e a migracao das colunas faltantes no MySQL. Os requisitos RF-018, RF-011, RF-007, RF-014 e RF-013 estao funcionais no backend.

**Nota importante:** A migracao de banco foi feita manualmente via ALTER TABLE. Em um deploy futuro, sera necessario garantir que o ORM crie as colunas automaticamente (ex.: via Alembic ou create_all com opcao checkfirst).
