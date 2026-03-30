# Arquitetura Observada — Agente de Editais

**Data:** 30/03/2026
**Fonte:** Leitura direta do código-fonte

---

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)          │
│                    Vite Dev Server :5175                   │
│                                                           │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐ │
│  │ 23 Pages│  │Components│  │  Hooks  │  │  Contexts │ │
│  │  (.tsx) │  │  Common  │  │ useChat │  │   Auth    │ │
│  └────┬────┘  └──────────┘  │useSessions│ └───────────┘ │
│       │                      └──────────┘                │
│       │ fetch(/api/*)                                    │
│       ▼ Vite proxy → :5007                               │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Flask + Python)               │
│                    Servidor :5007                          │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  app.py  │  │ tools.py │  │models.py │               │
│  │119 routes│  │ 76 tools │  │69 models │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │              │             │                      │
│       ▼              ▼             ▼                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │crud_routes│ │  llm.py  │  │scheduler │               │
│  │66 tables │  │ DeepSeek │  │APScheduler│              │
│  └──────────┘  └──────────┘  └──────────┘               │
├─────────────────────────────────────────────────────────┤
│                    DADOS E INTEGRAÇÕES                    │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  MySQL   │  │  PNCP    │  │ DeepSeek │  │ Brave/  │ │
│  │ 69 tables│  │  API     │  │   LLM    │  │ Serper  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 2. Fluxo de Autenticação

```
Login → POST /api/auth/login → JWT access_token + refresh_token
     → localStorage("editais_ia_access_token")
     → Header: Authorization: Bearer {token}
     → @require_auth decorator nos endpoints
     → get_current_user_id() extrai user_id do JWT
```

## 3. Padrão CRUD Genérico

```
crud_routes.py define CRUD_TABLES dict:
  "editais" → model Edital, scope user_scoped
  "contratos" → model Contrato, scope user_scoped
  "contrato-entregas" → model ContratoEntrega, parent_fk contrato_id
  ... (66 tabelas)

Endpoints automáticos:
  GET /api/crud/{table} → list (paginação, busca, filtros)
  POST /api/crud/{table} → create
  PUT /api/crud/{table}/{id} → update
  DELETE /api/crud/{table}/{id} → delete
```

## 4. Padrão de Tool de IA

```python
def tool_nome_funcao(param1, user_id, db=None):
    close_db = False
    if db is None:
        db = get_db()
        close_db = True
    try:
        # Lógica
        resposta_ia = call_deepseek([messages], max_tokens=N)
        # Processar resposta
        return {"success": True, ...}
    except Exception as e:
        return {"erro": str(e)}
    finally:
        if close_db and db:
            db.close()

TOOLS_MAP["nome_funcao"] = tool_nome_funcao
```

## 5. Padrão de Página Frontend

```typescript
export function NomePage(props?: PageProps) {
  // State
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth
  const token = localStorage.getItem("editais_ia_access_token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch
  const fetchDados = useCallback(async () => { ... }, []);
  useEffect(() => { fetchDados(); }, [fetchDados]);

  // TabPanel (children as render function)
  return (
    <TabPanel tabs={[{id, label}]}>
      {(activeTab) => activeTab === "x" ? <div>...</div> : null}
    </TabPanel>
  );
}
```

## 6. Integrações Externas

| Serviço | Uso | Configuração |
|---------|-----|-------------|
| DeepSeek API | LLM para análise, geração, classificação | DEEPSEEK_API_KEY no .env |
| PNCP API | Busca de editais e atas de pregão | URL pública |
| Brave Search | Scraping de fontes alternativas | BRAVE_API_KEY no .env |
| Serper | Busca web alternativa | SERPER_API_KEY no .env |
| Google CSE | Busca customizada | GOOGLE_CSE_API_KEY no .env |
| CAPSolver | Resolução de CAPTCHAs para certidões | CAPSOLVER_API_KEY no .env |

## 7. Scheduler (APScheduler)

- Verifica alertas de prazo a cada 5 minutos
- Executa monitoramentos de janela de recurso a cada hora
- Busca certidões automaticamente
- Roda em thread separada dentro do Flask
