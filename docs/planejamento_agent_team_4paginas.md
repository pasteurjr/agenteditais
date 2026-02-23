# PLANEJAMENTO AGENT TEAM — Tornar 4 Paginas Funcionais

**Data:** 2026-02-22
**Objetivo:** Fazer Portfolio, Captacao, Validacao e Parametrizacoes funcionarem com dados REAIS
**Estrategia:** Usar endpoints/CRUD ja prontos + prompts do chat. Zero backend novo.

---

## DIAGNOSTICO RAPIDO

### O que JA FUNCIONA (nao tocar):

**PortfolioPage:**
- getProdutos() / getProduto() → dados reais do backend
- Upload, cadastro, busca ANVISA, busca web → via onSendToChat (funcional)
- Specs extraidas pela IA → exibidas na tabela

**CaptacaoPage:**
- /api/editais/buscar → busca real PNCP+Serper
- crudCreate("editais") → salva edital no banco
- crudCreate/Update("estrategias-editais") → intencao + margem
- crudList("monitoramentos") → lista monitoramentos
- Painel lateral com scores → funcional

**ValidacaoPage:**
- /api/editais/salvos → carrega editais com scores e estrategias
- /api/editais/{id}/scores-validacao → 6 dimensoes de score
- POST /api/chat → resumo e perguntas
- crudCreate/Update("validacao_decisoes") → decisao + justificativa
- 3 abas (Objetiva/Analitica/Cognitiva) → UI completa

**ParametrizacoesPage:**
- crudList/Create/Update/Delete("fontes-editais") → CRUD completo
- crudList/Update("parametros-score") → parametros de score

### O que PRECISA CORRIGIR (por pagina):

---

## PAGINA 1: PARAMETRIZACOES

**Problema:** Classes, tipos de edital, regioes, TAM/SAM/SOM, prazo/frequencia nao persistem no backend.

### Tarefas:

**P1. Persistir classes/subclasses no CRUD**
- Tabela `classes-produtos` NAO existe no CRUD_TABLES
- ACAO: Adicionar tabela `classes-produtos` no CRUD_TABLES de crud_routes.py
- Campos: id, user_id, nome, tipo (classe/subclasse), ncms (JSON), classe_pai_id, created_at
- Substituir estado local `classes` por crudList/crudCreate/crudUpdate/crudDelete
- Manter botao "Gerar com IA" usando /api/parametrizacoes/gerar-classes (ja existe!)

**P2. Persistir parametros comerciais (regiao, tempo, TAM/SAM/SOM, tipos edital)**
- Tabela `parametros-score` JA EXISTE no CRUD
- ACAO: Usar crudUpdate("parametros-score") para salvar:
  - estados_atuacao (JSON array de UFs)
  - prazo_maximo (int)
  - frequencia_maxima (string)
  - tam, sam, som (decimal)
  - tipos_edital (JSON array de tipos selecionados)
- Verificar se esses campos existem no model ParametroScore. Se nao, adicionar.
- Carregar valores no useEffect via crudList("parametros-score")
- Salvar onChange ou com botao "Salvar Parametros"

**P3. Palavras-chave e NCMs de busca**
- As palavras-chave ja aparecem na UI como tags
- ACAO: Salvar no parametros-score como JSON (palavras_chave, ncms_busca)
- Botao "Gerar automaticamente do portfolio" → onSendToChat("Gere palavras-chave de busca baseadas nos meus produtos cadastrados")

**P4. Documentos exigidos frequentemente**
- Lista hardcoded na UI
- ACAO: Manter hardcoded por enquanto (nao ha tabela para isso)
- Marcar como "Onda futura" na UI

**P5. Norteadores de Score**
- 6 cards ja existem na UI
- ACAO: Cada card deve mostrar status de configuracao (badge verde/amarelo/vermelho)
- Calcular status: (a) classes cadastradas? (b) regiao definida? (c) tipos selecionados? (d) produtos com specs? (e) fontes configuradas? (f) placeholder

---

## PAGINA 2: PORTFOLIO

**Problema:** Classes sao hardcoded, mascara nao e dinamica, falta integracao ANVISA.

### Tarefas:

**F1. Substituir CLASSES_PRODUTO hardcoded por dados do CRUD**
- ACAO: No useEffect, fazer crudList("classes-produtos") para carregar classes reais
- Dropdown de classe no form de cadastro usa dados reais
- Se nao ha classes, mostrar as do SPECS_POR_CLASSE como fallback

**F2. Mascara dinamica por classe**
- SPECS_POR_CLASSE ja existe hardcoded com campos por categoria
- ACAO: Manter SPECS_POR_CLASSE como fallback
- Adicionar campo `campos_mascara` (JSON) na tabela classes-produtos
- Se a classe tem campos_mascara, usar esses; senao, usar SPECS_POR_CLASSE

**F3. Exibir colunas fabricante e modelo na tabela de produtos**
- Campos existem no interface ProdutoUI mas nao sao renderizados na tabela
- ACAO: Adicionar colunas fabricante e modelo na tabela (2 linhas de codigo)

**F4. Tab Classificacao — usar dados reais**
- Hoje mostra arvore hardcoded
- ACAO: Carregar de crudList("classes-produtos") e renderizar arvore hierarquica
- Reutilizar logica da ParametrizacoesPage para consistencia

**F5. Upload integracao — melhorar feedback**
- Upload ja funciona via onSendToChat
- ACAO: Apos envio, mostrar toast "Processando upload via IA..." e recarregar lista de produtos apos delay
- Usar polling ou evento do chat para detectar quando produto foi criado

---

## PAGINA 3: CAPTACAO

**Problema:** Poucos gaps. Falta exportar CSV, gaps nao retornados.

### Tarefas:

**C1. Implementar exportar CSV**
- Botao ja existe mas handler vazio
- ACAO: Implementar exportacao simples (gerar CSV das linhas da tabela com encodeURIComponent + download blob)

**C2. Gaps de aderencia no painel lateral**
- Backend /api/editais/{id}/scores-validacao ja retorna dados detalhados
- ACAO: Ao abrir painel lateral, chamar scores-validacao e popular a secao de gaps
- Mapear campos do response para a lista de gaps

**C3. Classificacao por tipo e origem**
- Filtros de tipo (Reagentes, Equipamentos, etc) e origem (Municipal, Estadual, etc) existem na UI
- ACAO: Garantir que os filtros estao usando os valores corretos dos enums
- Verificar se o backend retorna esses campos nos editais buscados

**C4. Busca por NCM**
- Campo de NCM existe no filtro
- ACAO: Ao buscar, incluir NCMs como termo adicional na busca
- Usar NCMs do portfolio (crudList("produtos") → extrair NCMs unicos)

---

## PAGINA 4: VALIDACAO

**Problema:** Processo Amanda hardcoded, sub-scores sem fallback adequado, GO/NO-GO nao implementado.

### Tarefas:

**V1. Processo Amanda — dados reais dos documentos da empresa**
- Hoje as 3 pastas com 10 docs sao hardcoded
- ACAO: Ao carregar edital, chamar /api/editais/{id}/documentacao-necessaria (JA EXISTE!)
- Endpoint cruza requisitos do edital com documentos da empresa
- Renderizar resultado nas 3 pastas (docs empresa, fiscais/certidoes, qualificacao tecnica)
- Se empresa nao tem docs, mostrar "Nenhum documento cadastrado" com link para EmpresaPage

**V2. GO/NO-GO da IA**
- Botao "Calcular Scores IA" ja chama /api/editais/{id}/scores-validacao
- O response JA inclui campo `decisao` (go/nogo/acompanhar) retornado pela IA
- ACAO: Exibir a decisao da IA com badge colorida (verde=GO, vermelho=NO-GO, amarelo=ACOMPANHAR)
- Mostrar justificativa da decisao se disponivel no response

**V3. Historico Semelhante**
- Secao existe na aba Cognitiva mas mostra "Nenhum encontrado"
- ACAO: Ao carregar edital, buscar no banco editais com mesmo orgao ou objeto similar
- Usar crudList("editais", { q: orgao }) para buscar editais do mesmo orgao
- Cruzar com estrategias-editais para mostrar decisao anterior

**V4. Enriquecer dados do Processo Amanda**
- Ao clicar "Calcular Scores IA", o response de scores-validacao traz sub_scores detalhados
- ACAO: Popular as secoes de aderencia tecnica, documental, juridica, logistica e comercial
- Usar os campos `detalhes_tecnico`, `detalhes_documental`, etc do response

**V5. Reputacao do Orgao**
- Campos mostram "-" por padrao
- ACAO: Buscar historico do orgao: crudList("editais", { q: orgao_nome })
- Contar vitorias/derrotas com esse orgao
- Calcular "bom pagador" a partir de contrato-entregas (se houver)
- Se nao ha historico, manter "-" (comportamento correto)

---

## MODELO DO BACKEND — Campos a adicionar

### Em ParametroScore (models.py):
```python
# Verificar se esses campos existem. Se nao, adicionar:
estados_atuacao = Column(JSON)          # ["SP", "RJ", "MG"]
prazo_maximo = Column(Integer)           # 30
frequencia_maxima = Column(String(20))   # "semanal"
tam = Column(Numeric(15, 2))             # 500000000
sam = Column(Numeric(15, 2))             # 100000000
som = Column(Numeric(15, 2))             # 20000000
tipos_edital = Column(JSON)              # ["comodato", "venda", ...]
palavras_chave = Column(JSON)            # ["microscopio", "centrifuga"]
ncms_busca = Column(JSON)               # ["9018.19.80", "9027.80.99"]
```

### Nova tabela classes-produtos no CRUD_TABLES:
```python
"classes-produtos": {
    "model": "ClasseProduto",  # Precisa criar se nao existe
    "label": "Classe de Produto",
    "user_scoped": True,
    "fields": ["nome", "tipo", "ncms", "classe_pai_id", "campos_mascara"],
    "required": ["nome", "tipo"],
    "search_fields": ["nome"],
}
```

---

## ESTRUTURA DO AGENT TEAM

### Team: `onda3-4paginas`

| Agente | Tipo | Pagina | Tarefas |
|--------|------|--------|---------|
| **backend-agent** | general-purpose | Backend | Adicionar campos em ParametroScore, criar tabela/model ClasseProduto, registrar no CRUD_TABLES |
| **parametrizacoes-agent** | general-purpose | Parametrizacoes | P1-P5: Persistir classes, comerciais, palavras-chave, norteadores |
| **portfolio-agent** | general-purpose | Portfolio | F1-F5: Classes reais, mascara dinamica, colunas, classificacao |
| **captacao-agent** | general-purpose | Captacao | C1-C4: Exportar CSV, gaps, classificacao, NCM |
| **validacao-agent** | general-purpose | Validacao | V1-V5: Amanda, GO/NO-GO, historico, enriquecer, reputacao |

### Ordem de execucao:
1. **backend-agent** PRIMEIRO (cria tabelas/campos que os outros precisam)
2. Depois: **parametrizacoes-agent** + **portfolio-agent** + **captacao-agent** + **validacao-agent** em PARALELO

### Dependencias:
- parametrizacoes-agent depende de backend-agent (precisa da tabela classes-produtos)
- portfolio-agent depende de backend-agent (precisa da tabela classes-produtos)
- captacao-agent e validacao-agent podem comecar sem esperar (usam endpoints existentes)

---

## ENDPOINTS JA PRONTOS (NAO CRIAR NOVOS)

| Endpoint | Usado por | Pagina |
|----------|-----------|--------|
| GET /api/produtos | PortfolioPage | Portfolio |
| GET /api/produtos/{id} | PortfolioPage | Portfolio |
| POST /api/upload | PortfolioPage (via chat) | Portfolio |
| GET /api/editais/buscar | CaptacaoPage | Captacao |
| GET /api/editais/salvos | ValidacaoPage | Validacao |
| POST /api/editais/{id}/scores-validacao | ValidacaoPage | Validacao |
| GET /api/editais/{id}/documentacao-necessaria | ValidacaoPage | Validacao |
| POST /api/chat | ValidacaoPage | Validacao |
| GET /api/crud/fontes-editais | ParametrizacoesPage | Parametrizacoes |
| GET /api/crud/parametros-score | ParametrizacoesPage | Parametrizacoes |
| POST /api/parametrizacoes/gerar-classes | ParametrizacoesPage | Parametrizacoes |
| GET/POST /api/crud/editais | CaptacaoPage | Captacao |
| GET/POST /api/crud/estrategias-editais | CaptacaoPage | Captacao |
| GET/POST /api/crud/monitoramentos | CaptacaoPage | Captacao |
| GET/POST /api/crud/validacao_decisoes | ValidacaoPage | Validacao |

## PROMPTS DO CHAT A USAR

| Prompt | Onde usar | Pagina |
|--------|----------|--------|
| "Gere palavras-chave de busca baseadas nos meus produtos" | Botao "Gerar automaticamente" | Parametrizacoes |
| "Busque registros ANVISA para o produto X" | Botao "Buscar ANVISA" | Portfolio |
| "Busque o manual do produto X na web e cadastre" | Botao "Buscar Web" | Portfolio |
| "Reprocesse as especificacoes do produto X" | Botao "Reprocessar" | Portfolio |
| "Verifique a completude do produto X" | Botao "Verificar Completude" | Portfolio |
| "Cadastre produto: Nome=X, Classe=Y, NCM=Z..." | Form de cadastro manual | Portfolio |

---

## ESTIMATIVA DE ALTERACOES POR ARQUIVO

| Arquivo | Alteracoes | Complexidade |
|---------|-----------|-------------|
| backend/models.py | Criar model ClasseProduto + campos em ParametroScore | Media |
| backend/crud_routes.py | Adicionar "classes-produtos" no CRUD_TABLES | Baixa |
| frontend/src/pages/ParametrizacoesPage.tsx | Substituir state local por CRUD calls | Alta |
| frontend/src/pages/PortfolioPage.tsx | Carregar classes reais, colunas fab/modelo | Media |
| frontend/src/pages/CaptacaoPage.tsx | Exportar CSV, gaps, NCM | Baixa |
| frontend/src/pages/ValidacaoPage.tsx | Amanda real, GO/NO-GO, historico, reputacao | Alta |

---

## VERIFICACAO FINAL

Apos implementacao, rodar os testes Playwright existentes:
```bash
cd /mnt/data1/progpython/agenteditais
npx playwright test tests/validacao_r3_p2p3.spec.ts  # Portfolio
npx playwright test tests/validacao_r3_p4p5.spec.ts  # Parametrizacoes + Captacao
npx playwright test tests/validacao_r3_p6p7.spec.ts  # Captacao + Validacao filtros
npx playwright test tests/validacao_r3_p8p10.spec.ts # Validacao decisao/aderencias
```

E compilar TypeScript:
```bash
cd frontend && npx tsc --noEmit
```
