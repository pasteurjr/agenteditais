---
uc_id: UC-F13
nome: "Gerir e consultar classificacao Area/Classe/Subclasse"
sprint: "Sprint 1"
versao_uc: "8.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V7.md"
extraido_em: "2026-04-29"
mudanca_v8: "UC reescrito: era 'Consultar classificacao e funil de monitoramento' (V5/V7 — apenas visualizar). Agora cobre criacao via 3 CRUDs + visualizacao."
---

# UC-F13 — Gerir e consultar classificacao Area/Classe/Subclasse

> **V8 (29/04/2026):** UC reescrito. Antes era so "Consultar..." (apenas visualizar). Agora cobre tambem a **criacao** da hierarquia Area→Classe→Subclasse via 3 CRUDs (`areas-produto`, `classes-produto-v2`, `subclasses-produto`), porque cada empresa tem sua propria hierarquia (`empresa_scoped=True`) e empresa nova nasce sem nenhuma. Sprint 1 (UC-F02, F06, F08) e Sprint 2 (UC-CV01..09) dependem dessa hierarquia ja existir.

---

**RNs aplicadas:** RN-012, RN-023, RN-040

**RF relacionados:** RF-011, RF-012, RF-013

**Regras de Negocio aplicaveis:**
- Presentes: RN-012
- Faltantes: RN-040 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/gestor de portfolio

### Pre-condicoes
1. Empresa em edicao **e vinculada ao usuario corrente** (registro ativo em `usuario_empresa`).
2. CRUDs `areas-produto`, `classes-produto-v2`, `subclasses-produto` operacionais.
3. PortfolioPage acessivel para visualizacao da arvore consolidada.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**
- **UC-F18**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Existem registros em `areas_produto`, `classes_produto_v2`, `subclasses_produto` para a empresa do usuario corrente.
2. Hierarquia visualizavel na aba "Classificacao" da PortfolioPage com expand/collapse funcional.
3. UCs subsequentes (UC-F02, UC-F06, UC-F08, UC-CV01) podem usar a hierarquia em selects e filtros.

### Botoes e acoes observadas

**Criacao (3 CRUDs):**
- Cadastros > Areas de Produto: `[Botao: Novo]`, `[Botao: Salvar]`
- Cadastros > Classes de Produto: `[Botao: Novo]`, `[Select: Area]`, `[Botao: Salvar]`
- Cadastros > Subclasses de Produto: `[Botao: Novo]`, `[Select: Classe]`, `[Campo: NCM]`, `[Botao: Salvar]`

**Visualizacao:**
- aba `Classificacao` na PortfolioPage
- expand/collapse em Area e Classe

### Sequencia de eventos (Fluxo Principal — cria 3 hierarquias completas)

Para cada hierarquia do dataset (3 ciclos sequenciais):

**Ciclo de criacao (executado 3x):**
1. Usuario navega via Sidebar para Cadastros > Areas de Produto.
2. Clica `[Botao: Novo]`, preenche `[Campo: Nome]` (ex: "Equipamentos Medico-Hospitalares") e `[Botao: Salvar]`. Sistema faz `POST /api/crud/areas-produto`.
3. Navega para Cadastros > Classes de Produto.
4. Clica `[Botao: Novo]`, seleciona `[Select: Area]` (a area criada no passo 2), preenche `[Campo: Nome]` (ex: "Monitoracao") e `[Botao: Salvar]`. Sistema faz `POST /api/crud/classes-produto-v2` com `area_id`.
5. Navega para Cadastros > Subclasses de Produto.
6. Clica `[Botao: Novo]`, seleciona `[Select: Classe]` (a classe criada no passo 4), preenche `[Campo: Nome]` (ex: "Monitor Multiparametrico") e `[Campo: NCM]` (ex: "9018.19.90") e `[Botao: Salvar]`. Sistema faz `POST /api/crud/subclasses-produto` com `classe_id` e `ncm`.

**Apos os 3 ciclos:**
7. Usuario navega para PortfolioPage > `[Aba: Classificacao]`.
8. Sistema lista as 3 areas no `[Card: Estrutura de Classificacao]`. Usuario expande cada area e classes para verificar que subclasses e NCMs aparecem corretamente.
9. `[Card: Funil de Monitoramento]` exibe contagens atualizadas (3 areas, N classes, N subclasses).

### Hierarquias canonicas (CT-F13-FP)

```yaml
hierarquias:
  - area: "Equipamentos Medico-Hospitalares"
    classes:
      - nome: "Monitoracao"
        subclasses:
          - nome: "Monitor Multiparametrico"
            ncm: "9018.19.90"

  - area: "Diagnostico in Vitro e Laboratorio"
    classes:
      - nome: "Reagentes Bioquimicos"
        subclasses:
          - nome: "Reagente para Glicose"
            ncm: "3822.19.90"
      - nome: "Reagentes e Kits Diagnosticos"
        subclasses:
          - nome: "Kit de Hematologia"
            ncm: "3822.19.90"
```

Total: **2 areas, 3 classes, 3 subclasses**.

### Fluxos Alternativos

**FA-01 — Hierarquia ja existe (idempotencia)**
1. Usuario abre Cadastros > Areas de Produto.
2. Listagem ja contem as areas esperadas (sessao anterior do mesmo user/empresa).
3. Usuario pula criacao e vai direto para passo 7 (visualizar).

**FA-02 — Criar 1 hierarquia minima (1+1+1)**
1. Para teste rapido: criar so 1 area > 1 classe > 1 subclasse em vez de 3.
2. Util para CTs de fronteira/limite.

**FA-03 — Adicionar subclasse a classe pre-existente**
1. Usuario navega para Cadastros > Subclasses de Produto.
2. Cria nova subclasse vinculada a uma classe ja existente (sem precisar criar area/classe novas).

**FA-04 — Visualizar sem criar**
1. Hierarquia ja existe (FA-01 ou criada por outro user).
2. Usuario navega direto para PortfolioPage > Classificacao.
3. Confirma estrutura visualmente.

### Fluxos de Excecao

**FE-01 — Tentar criar classe sem selecionar area**
1. No CRUD de Classes, usuario clica `[Novo]` e nao seleciona `[Select: Area]`.
2. Backend retorna 400: campo `area_id` obrigatorio.

**FE-02 — Tentar criar subclasse sem selecionar classe**
1. Idem FE-01 mas com `classe_id`.

**FE-03 — NCM em formato invalido**
1. Usuario informa NCM com formato errado (ex: `382` em vez de `3822.19.90`).
2. Sistema valida via RN-040 e exibe erro.

**FE-04 — Duplicar nome de area na mesma empresa**
1. Usuario tenta criar area com nome ja existente para mesma empresa.
2. Backend retorna 409 Conflict.

**FE-05 — Erro ao carregar hierarquia na visualizacao**
1. Endpoint de areas/classes retorna erro.
2. Aba Classificacao exibe mensagem de erro.

### Persistencia observada
- `areas_produto(id, empresa_id, nome, ...)` — `empresa_scoped=True`
- `classes_produto_v2(id, empresa_id, area_id, nome, ...)` — `empresa_scoped=True`, FK area_id
- `subclasses_produto(id, empresa_id, classe_id, nome, ncm, mascara_campos_json, ...)` — `empresa_scoped=True`, FK classe_id

### Implementacao atual
**IMPLEMENTADO** (3 CRUDs + Aba Classificacao). V8 documenta o uso conjunto.

---
