# Relatorio Onda 1 — facilicita.ia

**Data:** 17/02/2026
**Status:** CONCLUIDA (7/7 tasks)
**Agentes:** frontend-bridge-engineer, backend-tools-engineer, page-engineer-sprint1

---

## 1. O Que Foi Feito

### T1 — App.tsx: onSendToChat em todas as pages

**Arquivo:** `frontend/src/App.tsx`

- Criada interface `PageProps` em `frontend/src/types/index.ts`:
  ```typescript
  export interface PageProps {
    onSendToChat?: (message: string, file?: File) => void;
  }
  ```
- `handleSendToChat` passado como prop para todas as 20 pages no App.tsx
- Pages sem props proprias receberam assinatura `(_props?: PageProps)` com import de PageProps
- PortfolioPage mantida como estava (ja tinha onSendToChat obrigatorio)
- EmpresaPage recebeu interface propria `EmpresaPageProps` com onSendToChat

### T2 — useChat.ts: action_type e resultado na Message

**Arquivos:** `frontend/src/hooks/useChat.ts`, `frontend/src/types/index.ts`

- Interface `Message` atualizada com novos campos:
  ```typescript
  export interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: Source[] | null;
    created_at?: string;
    action_type?: string;                  // NOVO
    resultado?: Record<string, unknown>;   // NOVO
  }
  ```
- `useChat.ts` agora constroi a assistantMessage com:
  ```typescript
  const assistantMessage: Message = {
    role: "assistant",
    content: response.response,
    sources: response.sources,
    action_type: response.action_type,
    resultado: response.resultado,
  };
  ```

### T5 — Backend: GET /api/dashboard/stats

**Arquivo:** `backend/app.py` (~linha 6936)

- Novo endpoint protegido com `@require_auth`
- Filtra todos os dados por `user_id` do usuario autenticado
- Consulta tabelas: `editais`, `propostas`, `contratos`
- Retorna JSON:
  ```json
  {
    "total_editais": 25,
    "editais_por_status": {"novo": 10, "analisando": 5, ...},
    "total_propostas": 18,
    "propostas_por_status": {"rascunho": 8, "enviada": 3, ...},
    "taxa_sucesso": 0.625,
    "valor_total_contratado": 125000.50,
    "editais_por_mes": [{"mes": "2026-01", "total": 5}, ...],
    "proximos_prazos": [{"edital": "001/2026", "prazo": "2026-02-28", "dias_restantes": 11}]
  }
  ```
- Taxa de sucesso = ganhos / (ganhos + perdidos), onde ganhos = status `ganho` ou `vencedor`
- Editais por mes: ultimos 6 meses agrupados por `created_at`
- Proximos prazos: editais com `data_abertura` nos proximos 30 dias, status em `['novo', 'analisando', 'participando']`

### T7 — Backend: tool_calcular_aderencia le pesos do banco

**Arquivo:** `backend/tools.py` (~linha 1906)

- Nova funcao helper `_get_pesos_score(db, user_id)`:
  - Le tabela `parametros_score` filtrando por `user_id`
  - Retorna pesos: peso_tecnico (default 0.40), peso_comercial (0.25), peso_participacao (0.20), peso_ganho (0.15)
  - Retorna limiares: limiar_go (default 70.0), limiar_nogo (default 40.0)
- `tool_calcular_aderencia` modificada:
  - Carrega pesos via `_get_pesos_score()` no inicio
  - **Caminho sem requisitos (IA):** score ponderado por `peso_tecnico`, recomendacao usa `limiar_go`/`limiar_nogo`
  - **Caminho com requisitos (estruturado):** `score_final` ponderado por `peso_tecnico`, recomendacao usa limiares configurados

### T3 — Dashboard.tsx: dados reais

**Arquivo:** `frontend/src/components/Dashboard.tsx`

- Removidos todos os dados mock
- Criado `setDashboardTokenGetter()` exportado, chamado no App.tsx via useEffect
- Funcao `fetchDashboardStats()` consome GET `/api/dashboard/stats` com Bearer token
- Loading states em todos os cards (funil, urgentes, KPIs, insights, eventos)
- Error state com botao "Tentar novamente"
- Botao de refresh manual

### T4 — EmpresaPage.tsx: CRUD real

**Arquivo:** `frontend/src/pages/EmpresaPage.tsx`

- Removidos dados mock
- CRUDs conectados:
  - `empresas` — dados principais (razao social, CNPJ, etc)
  - `empresa-documentos` — documentos habilitativos (via `parent_id`)
  - `empresa-certidoes` — certidoes automaticas (via `parent_id`)
  - `empresa-responsaveis` — responsaveis tecnicos (via `parent_id`)
- Sub-tabelas carregadas com `Promise.all` usando `crudList(tabela, { parent_id: empresaId })`
- Botao "Buscar Certidoes Agora" usa `onSendToChat("Busque as certidoes automaticas da empresa...")` + `setTimeout(loadSubTables, 3000)`
- Upload de documento via `onSendToChat(mensagem, file)`
- CRUD completo para responsaveis (criar, excluir)

### T6 — ParametrizacoesPage.tsx: CRUD real

**Arquivo:** `frontend/src/pages/ParametrizacoesPage.tsx`

- Removidos dados mock
- CRUDs conectados:
  - `fontes-editais` — fontes de captacao (listar, criar, toggle ativa/inativa, excluir)
  - `parametros-score` — pesos de score (listar, atualizar peso)
- 8 botoes IA com `onSendToChat?.()`:
  - "Gerar com IA" (classes), "Calcular pesos com IA", "Calcular TAM/SAM/SOM com IA"
  - "Cadastrar via IA" (fontes), "Listar via IA" (fontes)
  - "Gerar palavras-chave automaticamente", "Sincronizar NCMs do Portfolio"

---

## 2. Testes de Validacao

### Pre-requisitos

1. Backend rodando: `cd backend && source ../venv/bin/activate && python app.py` (porta 5007)
2. Frontend rodando: `cd frontend && npm run dev` (porta 5173 ou 5175)
3. Ter um usuario registrado e logado no sistema

---

### TESTE 1: TypeScript compila sem erros

**Comando:**
```bash
cd /mnt/data1/progpython/agenteditais/frontend && npx tsc --noEmit
```

**Saida esperada:**
- Nenhum erro. Saida vazia ou apenas warnings (sem linhas com `error TS`).

---

### TESTE 2: Frontend builda com sucesso

**Comando:**
```bash
cd /mnt/data1/progpython/agenteditais/frontend && npm run build
```

**Saida esperada:**
- Build completo sem erros. Deve terminar com algo como:
  ```
  ✓ built in Xs
  ```

---

### TESTE 3: Backend importa sem erros

**Comando:**
```bash
cd /mnt/data1/progpython/agenteditais/backend && source ../venv/bin/activate && python -c "from app import app; print('OK')"
```

**Saida esperada:**
```
OK
```

---

### TESTE 4: Endpoint /api/dashboard/stats responde

**Comando (com curl):**
```bash
# 1. Fazer login para obter token
TOKEN=$(curl -s -X POST http://localhost:5007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_EMAIL","password":"SUA_SENHA"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Chamar endpoint dashboard stats
curl -s http://localhost:5007/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Saida esperada:**
```json
{
    "total_editais": <numero inteiro >= 0>,
    "editais_por_status": { <string: numero>, ... },
    "total_propostas": <numero inteiro >= 0>,
    "propostas_por_status": { <string: numero>, ... },
    "taxa_sucesso": <float entre 0.0 e 1.0>,
    "valor_total_contratado": <float >= 0>,
    "editais_por_mes": [ {"mes": "YYYY-MM", "total": <int>}, ... ],
    "proximos_prazos": [ {"edital": <string>, "prazo": "YYYY-MM-DD", "dias_restantes": <int>}, ... ]
}
```

**Validacoes:**
- Status HTTP 200
- Todos os 8 campos presentes
- `taxa_sucesso` entre 0 e 1
- `editais_por_mes` so contem meses dos ultimos 6 meses
- `proximos_prazos` so contem editais com prazo nos proximos 30 dias

---

### TESTE 5: Endpoint /api/dashboard/stats requer autenticacao

**Comando:**
```bash
curl -s -w "\n%{http_code}" http://localhost:5007/api/dashboard/stats
```

**Saida esperada:**
- Status HTTP **401**
- Body com mensagem de erro tipo `{"error": "Token não fornecido"}`

---

### TESTE 6: CRUD parametros-score funciona

**Comandos (com curl):**
```bash
# Listar parametros de score
curl -s http://localhost:5007/api/crud/parametros-score \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Criar parametro (se nao existir)
curl -s -X POST http://localhost:5007/api/crud/parametros-score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"peso_tecnico": 0.50, "peso_comercial": 0.20, "limiar_go": 75, "limiar_nogo": 35}' | python3 -m json.tool

# Atualizar parametro
curl -s -X PUT http://localhost:5007/api/crud/parametros-score/ID_AQUI \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"peso_tecnico": 0.45}' | python3 -m json.tool
```

**Saida esperada:**
- Listar: `{"items": [...], "total": <int>}`
- Criar: objeto com id, peso_tecnico=0.50, limiar_go=75
- Atualizar: objeto com peso_tecnico atualizado para 0.45

---

### TESTE 7: CRUD fontes-editais funciona

**Comandos:**
```bash
# Listar fontes
curl -s http://localhost:5007/api/crud/fontes-editais \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Criar fonte
curl -s -X POST http://localhost:5007/api/crud/fontes-editais \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "PNCP Federal", "tipo": "portal", "url": "https://pncp.gov.br", "ativa": true}' | python3 -m json.tool
```

**Saida esperada:**
- Listar: `{"items": [...], "total": <int>}`
- Criar: objeto com id, nome="PNCP Federal", ativa=true

---

### TESTE 8: CRUD empresas + sub-tabelas funciona

**Comandos:**
```bash
# Listar empresas (limit 1)
curl -s "http://localhost:5007/api/crud/empresas?limit=1" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Se tiver uma empresa com ID, listar sub-tabelas:
EMPRESA_ID="ID_DA_EMPRESA"

curl -s "http://localhost:5007/api/crud/empresa-documentos?parent_id=$EMPRESA_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

curl -s "http://localhost:5007/api/crud/empresa-certidoes?parent_id=$EMPRESA_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

curl -s "http://localhost:5007/api/crud/empresa-responsaveis?parent_id=$EMPRESA_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Saida esperada:**
- Cada chamada retorna `{"items": [...], "total": <int>}`
- Sub-tabelas retornam apenas registros com `parent_id` correspondente (ou campo FK equivalente como `empresa_id`)

---

### TESTE 9: Interface visual — Dashboard

**Passos manuais no navegador:**

1. Abrir `http://localhost:5173` (ou 5175)
2. Fazer login
3. Navegar para Dashboard (page inicial)

**Resultado esperado:**
- Cards de status (Novos, Em Analise, etc.) com **numeros reais** (nao "12", "8", "5" hardcoded)
- Se nao houver dados no banco, cards mostram **0** (nao dados mock)
- Funil de editais com contagens reais
- Se der erro, aparece mensagem de erro com botao "Tentar novamente"
- Enquanto carrega, aparece spinner/loading

---

### TESTE 10: Interface visual — EmpresaPage

**Passos manuais no navegador:**

1. Navegar para pagina Empresa (menu lateral)

**Resultado esperado:**
- Se existir empresa cadastrada: campos preenchidos com dados reais do banco
- Se nao existir: formulario vazio para cadastro
- Abas Documentos, Certidoes, Responsaveis mostram listas reais (ou vazias se nao houver)
- Botao "Salvar Alteracoes" persiste dados (recarregar pagina e verificar)
- Botao "Buscar Certidoes Agora" envia mensagem ao chat e recarrega certidoes apos ~3s

---

### TESTE 11: Interface visual — ParametrizacoesPage

**Passos manuais no navegador:**

1. Navegar para pagina Parametrizacoes (menu lateral)

**Resultado esperado:**
- Aba Fontes: lista fontes do banco (ou vazia). Botao "Nova Fonte" abre modal e cria via CRUD
- Aba Parametros: mostra pesos de score do banco. Campos editaveis que atualizam via CRUD
- Botoes "Cadastrar via IA" e "Listar via IA" enviam mensagem ao chat
- Toggle ativa/inativa nas fontes funciona (alterna e persiste)

---

### TESTE 12: onSendToChat funciona em qualquer page

**Passos manuais no navegador:**

1. Navegar para qualquer page (ex: CaptacaoPage, ValidacaoPage, etc.)
2. Se a page tiver botao que chama IA, clicar nele

**Resultado esperado:**
- A mensagem deve aparecer no ChatArea (painel de chat)
- O chat deve processar a mensagem e retornar resposta da IA
- Nao deve haver erro no console do navegador tipo "onSendToChat is not a function"

**Nota:** Nas pages da Onda 2+ que ainda usam mock, os botoes podem nao funcionar completamente. O teste aqui e apenas que `onSendToChat` esta conectado e nao gera erro.

---

### TESTE 13: action_type e resultado chegam na Message

**Passos manuais (requer inspecao):**

1. Abrir DevTools do navegador (F12 > Console)
2. No chat, enviar uma mensagem que dispare uma tool (ex: "Liste meus produtos")
3. Verificar no Network tab a resposta de POST /api/chat

**Resultado esperado no JSON de resposta:**
```json
{
  "response": "...",
  "sources": [...],
  "action_type": "listar_produtos",
  "resultado": { ... }
}
```

- `action_type` deve ser uma string identificando a acao (ou null se nao houve acao)
- `resultado` deve ser um objeto com dados estruturados (ou null)

---

### TESTE 14: _get_pesos_score retorna defaults sem configuracao

**Comando:**
```bash
cd /mnt/data1/progpython/agenteditais/backend && source ../venv/bin/activate && python3 -c "
from models import get_db, ParametroScore
from tools import _get_pesos_score

db = get_db()
# Use um user_id que NAO tenha parametros_score cadastrados
pesos = _get_pesos_score(db, 'user_inexistente_12345')
print(pesos)
db.close()
"
```

**Saida esperada:**
```python
{'peso_tecnico': 0.4, 'peso_comercial': 0.25, 'peso_participacao': 0.2, 'peso_ganho': 0.15, 'limiar_go': 70.0, 'limiar_nogo': 40.0}
```

---

### TESTE 15: _get_pesos_score le pesos configurados

**Comando (apos TESTE 6 ter criado um parametro):**
```bash
cd /mnt/data1/progpython/agenteditais/backend && source ../venv/bin/activate && python3 -c "
from models import get_db, ParametroScore
from tools import _get_pesos_score

db = get_db()
# Buscar um user_id que TENHA parametros_score
param = db.query(ParametroScore).first()
if param:
    pesos = _get_pesos_score(db, param.user_id)
    print(f'User: {param.user_id}')
    print(f'Pesos: {pesos}')
    assert pesos['peso_tecnico'] == float(param.peso_tecnico), 'peso_tecnico nao bate!'
    print('OK - pesos lidos corretamente do banco')
else:
    print('Nenhum ParametroScore no banco - rode TESTE 6 primeiro')
db.close()
"
```

**Saida esperada:**
```
User: <uuid>
Pesos: {'peso_tecnico': 0.45, ...}
OK - pesos lidos corretamente do banco
```

---

## 3. Resumo de Metricas

| Metrica | Antes Onda 1 | Apos Onda 1 |
|---------|-------------|-------------|
| Pages com onSendToChat | 1 (PortfolioPage) | 21 (todas) |
| Pages com dados reais | 3 (Portfolio, Login, Register) | 6 (+Dashboard, Empresa, Parametrizacoes) |
| Endpoints novos | 0 | 1 (GET /api/dashboard/stats) |
| Tools modificadas | 0 | 1 (tool_calcular_aderencia) |
| Helpers novos | 0 | 1 (_get_pesos_score) |
| Interface Message campos | 4 | 6 (+action_type, +resultado) |
