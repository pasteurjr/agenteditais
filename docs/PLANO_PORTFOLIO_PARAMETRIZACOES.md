# Plano de Implementacao — Portfolio e Parametrizacoes

**Data:** 2026-03-12
**Base:** requisitos_completosv4.md + WORKFLOW SISTEMA.pdf (paginas 1-4)
**Foco:** RF-006 a RF-018 (Fundacao: Portfolio + Parametrizacoes)

---

## Status Atual

| Secao | Total Criterios | Implementado | Parcial | Faltando |
|-------|----------------|-------------|---------|----------|
| **Portfolio (RF-006 a RF-012)** | 22 | 7 (32%) | 3 (14%) | 12 (54%) |
| **Parametrizacoes (RF-013 a RF-018)** | 22 | 12 (55%) | 3 (14%) | 7 (32%) |
| **TOTAL** | 44 | 19 (43%) | 6 (14%) | 19 (43%) |

---

## Prioridade 1 — Essencial

### 1. RF-018: Expandir de 4 para 6 dimensoes de score
- Adicionar `peso_documental`, `peso_juridico`, `peso_logistico`, `peso_complexidade` no modelo ParametroScore
- Atualizar CRUD config e ParametrizacoesPage
- Validacao soma pesos = 100%

### 2. RF-013: Vincular edital a classes/subclasses
- Adicionar `classe_produto_id` e `subclasse_produto_id` no modelo Edital
- Filtro por classe/subclasse na CaptacaoPage

### 3. RF-011: Funil de produtos
- Adicionar `status_pipeline` (enum: cadastrado, qualificado, ofertado, vencedor) no modelo Produto
- Contadores visuais no PortfolioPage
- Filtro por status

### 4. RF-012: Autocomplete NCM + Alerta
- Tabela NCM de referencia ou busca fuzzy
- Warning visual quando produto sem NCM

---

## Prioridade 2 — Importante

### 5. RF-007: Campo Registro ANVISA no Produto
- Campo `registro_anvisa` e `anvisa_status` no modelo Produto
- Exibicao no formulario e listagem
- (Integracao API ANVISA futura)

### 6. RF-006: Import CSV/Excel direto de produtos
- Endpoint bulk upload que parseia CSV/XLSX
- Mapeamento de colunas
- Preview antes de salvar

### 7. RF-014: Custos e frete
- Campos `custos_fixos`, `markup_padrao`, `frete_por_regiao` no ParametroScore ou tabela dedicada

### 8. RF-017: CRUD dedicado de Tipos de Edital
- Tabela `TipoEdital` com nome, regras_prazo, ativo
- Migrar de campo JSON para FK

---

## Prioridade 3 — Desejavel

### 9. RF-009: Mascara de preco
### 10. RF-010: IA preenchimento ANVISA
### 11. RF-016: Segmentos prioritarios

---

## Implementacao Atual (Sprint)

Foco: Prioridade 1 itens 1-4 + Prioridade 2 itens 5 e 7
