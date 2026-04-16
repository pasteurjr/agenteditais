# PLANO — Implementação Sprint 6: Flags + Monitoria + Auditoria + SMTP

## Contexto

A Sprint 6 v4 entrega 4 módulos do pós-operacional do Facilitia.ia (janela 13/04–19/04/2026):

1. **Flags** — UI de alertas ativos conectada ao modelo `Alerta` (hoje mock)
2. **Monitoria** — UI de monitoramentos PNCP conectada ao modelo `Monitoramento` (hoje mock)
3. **Auditoria Universal** — ativar `AuditoriaLog` transversal via middleware (infra pronta, wiring ausente)
4. **SMTP Produção** — modelos novos de configuração/templates/fila + endpoints admin + consolidação do envio

O trio documental já está alinhado: `docs/CASOS DE USO SPRINT 6.md` (17 UCs), `docs/SPRINT 6-VI v2.md` (descritivo) e `docs/planejamento_editaisv4.md` (janela + estimativas). **A boa notícia**: a infraestrutura existe em grande parte. Os modelos `Alerta`/`Monitoramento`/`AuditoriaLog` e os CRUDs genéricos `alertas`/`monitoramentos`/`auditoria-log` já estão registrados (`backend/crud_routes.py:451-535`); o scheduler já roda jobs de alertas e monitoramentos (`backend/scheduler.py:549-582`); as tools `tool_configurar_alertas`/`tool_listar_alertas`/`tool_cancelar_alerta`/`tool_configurar_monitoramento`/`tool_desativar_monitoramento`/`tool_listar_monitoramentos` existem (`backend/tools.py:6930, 7044, 7282, 7349, 7401, 7702`); o helper `log_transicao` e o decorator `@audited_tool` existem em `backend/rn_audit.py`; o endpoint `GET /api/auditoria` já responde (`backend/app.py:890`).

O trabalho é principalmente **(a)** reescrever 2 páginas frontend removendo mocks e conectando à API real, **(b)** criar 2 páginas novas (Auditoria + SMTP), **(c)** ativar o wiring transversal do `AuditoriaLog` via middleware, **(d)** criar 3 modelos + endpoints para SMTP admin e **(e)** escrever a suíte de testes Playwright.

Nada aqui exige reescrever backend ou migrar dados existentes. É expansão, não refactor.

---

## PARTE 1 — Inventário: o que existe vs. o que falta

### Backend — modelos (`backend/models.py`)

| Modelo | Status | Linhas | Observação |
|---|---|---|---|
| `Alerta` | ✅ Existe | 1078-1131 | Enum tipo inclui `abertura/impugnacao/recursos/proposta/personalizado/contrato_vencimento/arp_vencimento/garantia_vencimento/entrega_prazo`. Reusar. |
| `Monitoramento` | ✅ Existe | 1134-1192 | Já tem `termo/ncm/fontes/ufs/frequencia_horas/score_minimo_alerta/ativo`. Reusar. |
| `Notificacao` | ✅ Existe | 1195-1246 | FK para alerta/monitoramento. Reusar. |
| `PreferenciasNotificacao` | ✅ Existe | 1249-1277 | Horário, canais, alertas padrão. Reusar. |
| `AuditoriaLog` | ✅ Existe | 2373-2407 | `user_id/session_id/acao/entidade/entidade_id/dados_antes/dados_depois/ip_address/user_agent`. Reusar. |
| `ConfiguracaoSMTP` | ❌ NÃO EXISTE | — | **CRIAR** — host/port/user/password/from/tls_enabled/smtp_live_mode/updated_by |
| `EmailTemplate` | ❌ NÃO EXISTE | — | **CRIAR** — slug/nome/assunto/corpo_html/corpo_text/variaveis_json/ativo |
| `EmailQueue` | ❌ NÃO EXISTE | — | **CRIAR** — destinatario/template_slug/variaveis_json/status(pending/sending/sent/failed/bounce)/retry_count/erro/sent_at/created_at |

### Backend — rotas

| Endpoint | Status | Arquivo:linha |
|---|---|---|
| `GET /api/auditoria` | ✅ Existe | `app.py:890` (usa `rn_audit.get_auditoria`) |
| CRUD `/api/crud/alertas` | ✅ Registrado | `crud_routes.py:451` |
| CRUD `/api/crud/monitoramentos` | ✅ Registrado | `crud_routes.py:458` |
| CRUD `/api/crud/notificacoes` | ✅ Registrado | `crud_routes.py:465` |
| CRUD `/api/crud/auditoria-log` | ✅ Registrado | `crud_routes.py:528` (read_only) |
| `GET /api/scheduler/status` | ✅ Existe | `app.py:13166` |
| `POST /api/notificacoes/enviar-email` | ✅ Existe | `app.py:13073` |
| `GET /api/notificacoes/config-smtp` | ✅ Existe | `app.py:13149` (só lê env var) |
| `GET /api/auditoria/sensiveis` | ❌ CRIAR | Filtro por acoes sensíveis (`delete`, `smtp_config_change`, `user_role_change`) |
| `POST /api/auditoria/exportar-compliance` | ❌ CRIAR | CSV/JSON, mascarando LGPD |
| CRUD `/api/crud/smtp-config` | ❌ CRIAR | Registro único, super-only |
| CRUD `/api/crud/email-templates` | ❌ CRIAR | Super-only |
| CRUD `/api/crud/email-queue` | ❌ CRIAR | Read-only para usuário |
| `POST /api/smtp/testar` | ❌ CRIAR | Envia email de teste com config atual |
| `POST /api/smtp/fila/reenviar/<id>` | ❌ CRIAR | Move `failed` → `pending` |

### Backend — tools DeepSeek (`backend/tools.py`)

| Tool | Status | Linha | Reuso |
|---|---|---|---|
| `tool_configurar_alertas` | ✅ Existe | 6930 | UC-FL02 |
| `tool_listar_alertas` | ✅ Existe | 7044 | UC-FL01/FL03 |
| `tool_cancelar_alerta` | ✅ Existe | 7702 | UC-FL04 |
| `tool_configurar_monitoramento` | ✅ Existe | 7282 | UC-MO02 |
| `tool_listar_monitoramentos` | ✅ Existe | 7349 | UC-MO01 |
| `tool_desativar_monitoramento` | ✅ Existe | 7401 | UC-MO06 |
| `tool_analisar_documentos_empresa` | ❌ NÃO EXISTE | — | UC-MO03 — analisar portfólio da empresa e flagrar pendências |
| `tool_verificar_pendencias_pncp` | ❌ NÃO EXISTE | — | UC-MO04 — bater cadastro PNCP contra base local |
| `tool_consultar_auditoria` | ❌ NÃO EXISTE | — | UC-AU01 — wrapper para chat consultar auditoria por linguagem natural |
| `tool_exportar_auditoria_compliance` | ❌ NÃO EXISTE | — | UC-AU03 — exportar CSV mascarado |
| `tool_testar_smtp` | ❌ NÃO EXISTE | — | UC-SM01 — testar config SMTP via chat |

**CRÍTICO:** as 6 tools existentes **não estão registradas em `TOOLS_MAP` (tools.py:3224-3237)**. O `TOOLS_MAP` só tem 12 entradas e nenhuma de alertas/monitoramentos. O chat DeepSeek não consegue invocá-las hoje — elas existem como funções isoladas. Isso precisa ser corrigido: registrar todas as tools Sprint 6 (existentes + novas) + garantir que tools anteriormente "perdidas" também sejam registradas. Ver Fase 2.

### Backend — infraestrutura

| Item | Status | Arquivo:linha |
|---|---|---|
| APScheduler configurado | ✅ | `scheduler.py:549-582` (4 jobs) |
| Job `job_verificar_alertas` | ✅ | `scheduler.py:59` (a cada 5min) |
| Job `job_executar_monitoramentos` | ✅ | `scheduler.py:176` (a cada 60min) |
| Job `job_verificar_certidoes` | ✅ | `scheduler.py:361` (diário 6h) |
| Helper `log_transicao` | ✅ | `rn_audit.py:25-53` |
| Decorator `@audited_tool` | ✅ | `rn_audit.py:56-109` |
| Feature flag `RN_AUDIT_ENABLED` | ✅ | `rn_audit.py:22` |
| Feature flag `ENFORCE_RN_VALIDATORS` | ✅ | `app.py:59` |
| Feature flag `SMTP_LIVE_MODE` | ❌ CRIAR | novo env var |
| Middleware universal de auditoria | ❌ CRIAR | `backend/audit_middleware.py` — hook Flask `before_request`/`after_request` |
| `SMTPService` unificado | ❌ CRIAR | `backend/smtp_service.py` — consolida `scheduler.enviar_email_alerta`, usa `ConfiguracaoSMTP` do banco, processa `EmailQueue` |
| Job `job_processar_email_queue` | ❌ CRIAR | Novo job no scheduler (a cada 2min) |
| Job `job_limpar_auditoria_antiga` | ❌ CRIAR | Retenção 12 meses (LGPD) |

### Frontend

| Página | Status | Arquivo | Trabalho |
|---|---|---|---|
| `FlagsPage.tsx` | ⚠️ Mock 249L | `frontend/src/pages/FlagsPage.tsx` | **REESCREVER** — remover mocks, consumir `/api/crud/alertas`, stats cards por `status`, pipeline ASCII UC-FL01 |
| `MonitoriaPage.tsx` | ⚠️ Mock 320L | `frontend/src/pages/MonitoriaPage.tsx` | **REESCREVER** — remover mocks, consumir `/api/crud/monitoramentos`, tabela + drawer de editais encontrados |
| `AuditoriaPage.tsx` | ❌ NÃO EXISTE | criar em `frontend/src/pages/` | **CRIAR** — tabela filtrada por entidade/ação/período, export CSV |
| `SMTPPage.tsx` | ❌ NÃO EXISTE | criar em `frontend/src/pages/` | **CRIAR** — 3 tabs: Config, Templates, Fila |
| `App.tsx` | ✅ Flags/Monitoria já roteados | `App.tsx:178-181` | **EDITAR** — adicionar cases `auditoria` e `smtp` |
| `Sidebar.tsx` | ✅ CRUDs alertas/monitoramentos já listados | `Sidebar.tsx:137-147` | **EDITAR** — adicionar seção superOnly "Governança" com Auditoria/SMTP |

Componentes reutilizáveis disponíveis em `frontend/src/components/common/`: `Card`, `StatCard`, `DataTable`, `Modal`, `FormField`, `TextInput`, `SelectInput`, `Checkbox`, `StatusBadge`, `ActionButton`. Tudo que as páginas Sprint 6 precisam existe.

API client: `frontend/src/api/crud.ts` expõe `crudList/crudCreate/crudUpdate/crudDelete` — padrão a seguir. Para endpoints não-CRUD, criar `frontend/src/api/sprint6.ts` com fetchers dedicados.

### Testes

Padrão Playwright em `tests/e2e/playwright/`. Helper `login(page)` em `helpers.ts:8-85` já autentica `valida1@valida.com.br` e seleciona empresa CH Hospitalar. Não há `validacao_sprint5.spec.ts` hoje — a convenção do repo é `uc-XX.spec.ts` por UC individual.

---

## PARTE 2 — Design: 5 Fases

### Fase 0 — Migração e seed (1h)

**Migração Alembic** (novo arquivo em `backend/alembic/versions/`):

```sql
-- Tabela 1: Configuração SMTP (registro único por empresa ou global)
CREATE TABLE configuracao_smtp (
  id VARCHAR(36) PRIMARY KEY,
  empresa_id VARCHAR(36) NULL,  -- NULL = config global (super admin)
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 587,
  user VARCHAR(255),
  password_encrypted VARCHAR(500),  -- Fernet
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  tls_enabled BOOLEAN DEFAULT TRUE,
  smtp_live_mode BOOLEAN DEFAULT FALSE,  -- FALSE = dry-run (log-only)
  updated_by VARCHAR(36),
  updated_at DATETIME,
  created_at DATETIME,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela 2: Templates de Email
CREATE TABLE email_template (
  id VARCHAR(36) PRIMARY KEY,
  empresa_id VARCHAR(36) NULL,
  slug VARCHAR(50) NOT NULL,  -- 'alerta_prazo', 'novo_edital', 'resumo_diario', 'boas_vindas'
  nome VARCHAR(255) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  corpo_html TEXT NOT NULL,
  corpo_text TEXT,
  variaveis_json JSON,  -- ex: ["user_name", "edital_numero", "dias_restantes"]
  ativo BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(empresa_id, slug),
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela 3: Fila de Email
CREATE TABLE email_queue (
  id VARCHAR(36) PRIMARY KEY,
  empresa_id VARCHAR(36),
  user_id VARCHAR(36),
  destinatario VARCHAR(255) NOT NULL,
  template_slug VARCHAR(50),
  assunto VARCHAR(255) NOT NULL,
  corpo_html TEXT,
  corpo_text TEXT,
  variaveis_json JSON,
  status ENUM('pending','sending','sent','failed','bounce') DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  erro_mensagem TEXT,
  agendado_para DATETIME,
  enviado_em DATETIME,
  created_at DATETIME,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  INDEX idx_status_agendado (status, agendado_para)
);
```

**Seed (em `backend/alembic/versions/XXX_sprint6_smtp.py` upgrade())**:
- 1 `ConfiguracaoSMTP` global com `smtp_live_mode=FALSE` + host genérico (dry-run por padrão — o admin ativa depois).
- 4 `EmailTemplate` globais: `alerta_prazo`, `novo_edital`, `resumo_diario`, `boas_vindas` (copiar HTML base de `backend/notifications.py` se existir; caso contrário, criar mínimos).

### Fase 1 — Backend models + CRUDs (2h)

**Arquivo: `backend/models.py`** — adicionar 3 classes após `PreferenciasNotificacao` (linha 1277), importar encrypt helper do `cryptography.fernet` para `password_encrypted`. Campos conforme migração acima. Implementar `to_dict()` **mascarando `password_encrypted`** (retornar `"***"`).

**Arquivo: `backend/crud_routes.py`** — adicionar 3 entries no `CRUD_CONFIG`:

```python
"smtp-config": {
    "model": ConfiguracaoSMTP,
    "empresa_scoped": False,  # global; super-only
    "super_only": True,
    "search_fields": ["host", "from_email"],
    "label": "Configuração SMTP",
    "required": ["host", "port", "from_email"],
},
"email-templates": {
    "model": EmailTemplate,
    "empresa_scoped": True,
    "super_only": False,  # admins da empresa podem editar
    "search_fields": ["slug", "nome", "assunto"],
    "label": "Template de Email",
    "required": ["slug", "nome", "assunto", "corpo_html"],
},
"email-queue": {
    "model": EmailQueue,
    "empresa_scoped": True,
    "search_fields": ["destinatario", "assunto", "status"],
    "label": "Fila de Email",
    "required": [],
    "read_only": True,
},
```

Nota: `super_only` talvez precise ser implementado se não existir ainda — verificar `crud_routes.py` antes de codar; se ausente, adicionar hook simples que filtra por `user.is_super`.

### Fase 2 — Audit Middleware transversal (3h)

**Arquivo novo: `backend/audit_middleware.py`** — módulo com funções:

```python
# Flask before/after request hooks registrados em app.py setup
def register_audit_hooks(app):
    @app.before_request
    def capture_audit_context():
        # Só hook para rotas /api/crud/* e endpoints sensíveis
        if not _should_audit(request.path):
            return
        g.audit_antes = None  # será preenchido em load
        g.audit_method = request.method
        g.audit_path = request.path

    @app.after_request
    def persist_audit(response):
        if not _should_audit(request.path):
            return response
        if g.audit_method in ("POST", "PUT", "PATCH", "DELETE") and response.status_code < 400:
            from rn_audit import log_transicao
            log_transicao(
                entidade=_extract_entidade(request.path),
                entidade_id=_extract_id(request.path, request.view_args),
                acao=_method_to_acao(g.audit_method),  # create/update/delete
                dados_antes=getattr(g, "audit_antes", None),
                dados_depois=_safe_response_json(response),
                user_id=getattr(g, "user_id", None),
                user_email=getattr(g, "user_email", None),
                session_id=getattr(g, "session_id", None),
                ip_address=request.remote_addr,
            )
        return response
```

Registrar em `backend/app.py` logo após criação do `app = Flask(__name__)`.

**Rotas auditadas**:
- Todos os `POST/PUT/PATCH/DELETE` em `/api/crud/*`
- `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/smtp/testar`, `PUT /api/crud/smtp-config/*` (sensíveis → flag na coluna `acao` como `sensitive=true`)
- `POST /api/empresas/<id>/switch`, permissões, role changes

**Filtro de sensibilidade** (`acao='sensitive'`): acções que disparam alerta em UC-AU02:
- Edição de `ConfiguracaoSMTP`
- Mudança de `User.is_super`
- Delete de `Empresa`, `Contrato`, `Proposta`
- Mudança de `ParametroScore.margem_minima`

**Retenção LGPD**: novo job no scheduler `job_limpar_auditoria_antiga` (diário 4h) que deleta linhas com `created_at < now - 12 meses`. Adicionar em `backend/scheduler.py` seguindo padrão de `job_limpar_notificacoes_antigas`.

**Wire-up em tools**: aplicar `@audited_tool(nome)` nas ~30 tools principais (DeepSeek chama tudo via `execute_tool`, então o decorator pode ser aplicado dentro do `execute_tool` como wrapper automático — 1 linha em `tools.py:3240`).

### Fase 3 — SMTP Service consolidado (2h)

**Arquivo novo: `backend/smtp_service.py`** — substitui a lógica pontual de `scheduler.enviar_email_alerta`:

```python
class SMTPService:
    def __init__(self):
        self._config = None  # cached ConfiguracaoSMTP

    def load_config(self, empresa_id=None):
        # Lê do banco; fallback para env vars se ConfiguracaoSMTP ausente
        ...

    def enqueue(self, destinatario, template_slug=None, assunto=None,
                corpo_html=None, variaveis=None, agendado_para=None,
                empresa_id=None, user_id=None) -> str:
        # Cria linha em EmailQueue status=pending, retorna id
        ...

    def render_template(self, slug, variaveis, empresa_id=None):
        # Busca EmailTemplate.slug + substitui {{var}} com variaveis
        ...

    def send_now(self, queue_id):
        # Processa 1 linha: status=sending, tenta SMTP real se smtp_live_mode=True,
        # caso contrário apenas loga e marca como sent (dry-run)
        ...

    def test_config(self, destinatario_teste):
        # Envia email de teste com config atual, retorna (sucesso, mensagem)
        ...

    def process_queue(self, limit=50):
        # Job chamado pelo scheduler: pega N linhas pending + agendado_para<=now
        ...
```

**Endpoints novos em `backend/app.py`**:
- `POST /api/smtp/testar` — body `{destinatario_teste}` → chama `SMTPService.test_config()`
- `POST /api/smtp/fila/reenviar/<queue_id>` — move status `failed`/`bounce` → `pending`, zera `retry_count`

**Novo job em `backend/scheduler.py`**:
```python
def job_processar_email_queue():
    service = SMTPService()
    service.process_queue(limit=50)

# Registrar em iniciar_scheduler():
scheduler.add_job(
    job_processar_email_queue,
    IntervalTrigger(minutes=2),
    id='processar_email_queue',
    name='Processar Fila de Email',
    replace_existing=True
)
```

**Migração dos jobs existentes**: `scheduler.enviar_email_alerta` continua existindo como fallback para retro-compat; `job_verificar_alertas` e `job_executar_monitoramentos` passam a chamar `SMTPService().enqueue(...)` ao invés de enviar direto. Benefício: toda notificação passa pela fila → rastreável em UC-MO05 e UC-SM03.

### Fase 4 — Tools novas + registro TOOLS_MAP (2h)

**Tools a criar em `backend/tools.py`** (seguir padrão das existentes: assinatura `(user_id, empresa_id, ...) -> Dict` com `success/error`):

1. `tool_analisar_documentos_empresa(user_id, empresa_id)` — lista `EmpresaDocumento` + `EmpresaCertidao`, retorna pendências (documentos ausentes por categoria, certidões vencidas/vencendo em 15 dias, responsáveis sem CPF). **~60 linhas**. UC-MO03.

2. `tool_verificar_pendencias_pncp(user_id, empresa_id, cnpj)` — consulta API PNCP (padrão existente em `tools._buscar_editais_multifonte`) com endpoint de cadastro fornecedor, compara com dados locais da `Empresa`, retorna delta. **~80 linhas**. UC-MO04.

3. `tool_consultar_auditoria(user_id, empresa_id, termo_natural=None, entidade=None, periodo_dias=7)` — interpreta consulta natural (ex: "o que foi alterado ontem em contratos?"), chama `rn_audit.get_auditoria`, retorna resumo formatado. **~50 linhas**. UC-AU01.

4. `tool_exportar_auditoria_compliance(user_id, empresa_id, inicio, fim, mascarar_pii=True)` — gera CSV de `AuditoriaLog` filtrado, mascarando `user_email` (ex: `***@***.com`), `ip_address` (últimos 2 octetos), `dados_antes/dados_depois` PII. **~70 linhas**. UC-AU03.

5. `tool_testar_smtp(user_id, empresa_id, destinatario_teste)` — wrapper para `SMTPService.test_config()`. **~20 linhas**. UC-SM01.

**Registro crítico em `TOOLS_MAP`** (`tools.py:3224`) — adicionar todas as Sprint 6 **e** verificar se `configurar_alertas`, `listar_alertas`, `cancelar_alerta`, `configurar_monitoramento`, `listar_monitoramentos`, `desativar_monitoramento` já estão (hoje NÃO estão; corrigir isso):

```python
TOOLS_MAP.update({
    # Sprint 6 — Flags
    "configurar_alertas": tool_configurar_alertas,
    "listar_alertas": tool_listar_alertas,
    "cancelar_alerta": tool_cancelar_alerta,
    # Sprint 6 — Monitoria
    "configurar_monitoramento": tool_configurar_monitoramento,
    "listar_monitoramentos": tool_listar_monitoramentos,
    "desativar_monitoramento": tool_desativar_monitoramento,
    "analisar_documentos_empresa": tool_analisar_documentos_empresa,
    "verificar_pendencias_pncp": tool_verificar_pendencias_pncp,
    # Sprint 6 — Auditoria
    "consultar_auditoria": tool_consultar_auditoria,
    "exportar_auditoria_compliance": tool_exportar_auditoria_compliance,
    # Sprint 6 — SMTP
    "testar_smtp": tool_testar_smtp,
})
```

Aplicar `@audited_tool(nome)` nas 11 tools acima (RN-132).

### Fase 5 — Frontend (6h)

**A. `frontend/src/api/sprint6.ts` (novo)** — fetchers dedicados:

```ts
export async function listarAlertas(params: {status?: string; periodo_dias?: number}) { ... }
export async function listarMonitoramentos(params: {ativo?: boolean}) { ... }
export async function consultarAuditoria(params: {entidade?: string; entidade_id?: string; limit?: number}) { ... }
export async function exportarAuditoriaCompliance(params: {inicio: string; fim: string}) { ... }  // blob download
export async function testarSMTP(destinatario: string) { ... }
export async function reenviarEmailFila(queueId: string) { ... }
```

Base URL e headers seguem padrão de `frontend/src/api/crud.ts`.

**B. `frontend/src/pages/FlagsPage.tsx` — REWRITE** (hoje 249L mock → ~350L):

- Remover `mockAlertasAtivos` e `mockAlertas`.
- `useEffect` inicial → `crudList("alertas", {status: "agendado"})` + `crudList("alertas", {status: "disparado"})`.
- Stats cards: `Agendados`, `Disparados hoje`, `Vencendo em 24h`, `Cancelados (30d)`.
- Pipeline visual: 4 colunas por status (agendado/disparado/lido/cancelado) com cards drag-and-drop opcional (ou apenas clique para transicionar).
- Tabela consolidada com filtros por tipo/edital/data.
- Modal "Novo Alerta" → usa `onSendToChat("configurar_alertas para o edital X com antecedencia de 24h e 1h")` (UC-FL02).
- Modal "Cancelar Alerta" → `onSendToChat("cancelar alerta {id}")` (UC-FL04).
- Agenda/Calendário (UC-FL05): card separado com mês atual, marcadores nos dias com alertas.

Usar `StatCard`, `DataTable`, `Modal`, `StatusBadge` existentes.

**C. `frontend/src/pages/MonitoriaPage.tsx` — REWRITE** (hoje 320L mock → ~400L):

- Remover `mockMonitoramentos` e `mockEncontrados`.
- `useEffect` → `crudList("monitoramentos")` + `fetch("/api/scheduler/status")`.
- Stats cards: `Ativos`, `Pausados`, `Editais encontrados hoje`, `Último check (min)`.
- Tabela monitoramentos com ações: pausar/ativar/excluir.
- Ao clicar num monitoramento → drawer lateral com editais encontrados (última execução) via `/api/scheduler/status` e `crudList("editais", {monitoramento_id})`.
- Modal "Novo Monitoramento" → `onSendToChat("configurar_monitoramento termo={X} frequencia=6h ufs=SP,MG")` (UC-MO02).
- Botão "Analisar documentos da empresa" (UC-MO03) → `onSendToChat("analise os documentos da empresa atual")`.
- Botão "Verificar pendências PNCP" (UC-MO04) → `onSendToChat("verifique pendências do CNPJ no PNCP")`.
- Card "Monitoramentos com erro" (UC-MO06) — lista com `ativo=false` ou último check > frequência×3.

**D. `frontend/src/pages/AuditoriaPage.tsx` — NOVO** (~400L):

- 3 abas: **Consultar** (UC-AU01), **Alterações Sensíveis** (UC-AU02), **Exportar Compliance** (UC-AU03).
- Aba Consultar: filtros (entidade, entidade_id, user_email, período, acao), tabela paginada via `crudList("auditoria-log", filtros)`, detalhe em modal mostrando `dados_antes` / `dados_depois` em JSON.
- Aba Alterações Sensíveis: tabela filtrada por `acao LIKE 'sensitive%'` + badge de criticidade (vermelho/amarelo/verde), alerta visual no topo se >10 no último dia.
- Aba Exportar Compliance: form com intervalo de datas + checkbox "Mascarar PII", botão "Exportar CSV" → chama `exportarAuditoriaCompliance(...)` → download blob.

Componentes: `Card`, `DataTable`, `Modal`, `FormField`, `SelectInput`, `StatusBadge`. Usar `lucide-react` icon `Shield`.

**E. `frontend/src/pages/SMTPPage.tsx` — NOVO** (~450L, **super-only**):

- 3 abas: **Configuração**, **Templates**, **Fila de Envio**.
- Aba Configuração: formulário para editar `ConfiguracaoSMTP` (host/port/user/password/from_email/from_name/tls_enabled/smtp_live_mode), switch "Dry-run vs Produção" com confirmação obrigatória, botão "Testar SMTP" (envia email de teste ao usuário logado).
- Aba Templates: lista `EmailTemplate` em `DataTable`, modal de edição com Monaco-like text area (ou `<textarea>` simples) para `corpo_html` + preview ao lado.
- Aba Fila: lista `EmailQueue` filtrada por status, botões "Reenviar" (failed → pending), badges coloridos por status, auto-refresh a cada 10s.

Proteção: verificar `isSuper` em `App.tsx` antes de renderizar; se não super, mostrar mensagem de acesso negado.

**F. `frontend/src/App.tsx` — EDITAR**:
- Import `AuditoriaPage` e `SMTPPage`.
- Adicionar cases `auditoria` e `smtp` no switch (linha 151-205).

**G. `frontend/src/components/Sidebar.tsx` — EDITAR**:
- Adicionar nova seção `"governanca"` após `cad-contratos` com:
  - `{ id: "auditoria", page: "auditoria", icon: <Shield size={16} />, label: "Auditoria" }`
  - `{ id: "smtp", page: "smtp", icon: <Mail size={16} />, label: "SMTP", superOnly: true }`
- As entries `crud:alertas`, `crud:monitoramentos`, `crud:notificacoes` já existem na seção `cad-alertas` — manter como acesso tabular bruto.

### Fase 6 — Testes Playwright (3h)

**Arquivos novos em `tests/e2e/playwright/`**:

- `sprint6-flags.spec.ts` — cobre UC-FL01 a UC-FL05 (5 testes):
  1. Dashboard Alertas Ativos carrega com stats e tabela
  2. Criar alerta via chat `configurar_alertas` → aparece na tabela
  3. Histórico mostra alertas disparados (seed auxiliar via API direta)
  4. Cancelar alerta → status vira `cancelado`
  5. Agenda/calendário renderiza mês atual

- `sprint6-monitoria.spec.ts` — cobre UC-MO01 a UC-MO06 (6 testes):
  1. Dashboard Monitoramentos carrega
  2. Criar monitoramento via chat `configurar_monitoramento` 
  3. Clicar monitoramento abre drawer com editais encontrados
  4. Botão "Analisar documentos empresa" dispara tool
  5. Botão "Verificar pendências PNCP" dispara tool
  6. Card de monitoramentos com erro aparece para inativos

- `sprint6-auditoria.spec.ts` — cobre UC-AU01 a UC-AU03 (3 testes):
  1. Tab Consultar filtra por entidade e mostra linhas
  2. Tab Alterações Sensíveis filtra por `acao=sensitive*`
  3. Exportar Compliance gera download de CSV

- `sprint6-smtp.spec.ts` — cobre UC-SM01 a UC-SM03 (3 testes, **super-only**):
  1. Configuração: alterar `smtp_live_mode` exige confirmação; testar SMTP retorna sucesso em dry-run
  2. Templates: editar `assunto` de `alerta_prazo` e salvar
  3. Fila: reenviar email falhado move para `pending`

**Pattern**: cada teste usa `login(page)`, `navTo(page, "Flags")` (ou equivalente), `page.waitForSelector` para elementos chave, `expect` para assertions, `page.screenshot({path: "tests/screenshots/sprint6/XX-nome.png"})` em cada passo crítico.

**Total**: 17 testes principais (1 por UC). Seeds auxiliares criados via `fetch('/api/crud/alertas', ...)` dentro do `beforeAll` para isolar cada teste.

### Fase 7 — Documentação e aceitação (1h)

- `testes/sprint6/ACEITACAOVALIDACAOSPRINT6.md` (novo) — relatório seguindo template de sprint anteriores com: contexto, UCs cobertos, resultado de cada teste, screenshots referenciados, erros conhecidos, aprovação.
- Atualizar `project_sprints_status.md` (memória) ao fim: `Sprint 6 ✅ 17/17 testes (DD/MM/2026)`.

---

## PARTE 3 — Arquivos afetados (consolidado)

### Backend (criar/editar)
| Arquivo | Ação | Linhas aprox. |
|---|---|---|
| `backend/alembic/versions/XXX_sprint6_smtp.py` | CRIAR | ~120 (migração + seed) |
| `backend/models.py` | EDITAR (+3 classes após linha 1277) | ~180 |
| `backend/crud_routes.py` | EDITAR (+3 entries em CRUD_CONFIG após linha 535) | ~50 |
| `backend/rn_audit.py` | EDITAR (ampliar `log_transicao` com novos campos opcionais) | ~20 |
| `backend/audit_middleware.py` | CRIAR | ~150 |
| `backend/smtp_service.py` | CRIAR | ~300 |
| `backend/tools.py` | EDITAR (+5 tools + atualizar TOOLS_MAP) | ~300 |
| `backend/scheduler.py` | EDITAR (+2 jobs, refactor para usar SMTPService) | ~100 |
| `backend/app.py` | EDITAR (registrar middleware + 5 endpoints novos) | ~200 |

**Total backend: ~1420 linhas novas + edits**

### Frontend (criar/editar)
| Arquivo | Ação | Linhas aprox. |
|---|---|---|
| `frontend/src/api/sprint6.ts` | CRIAR | ~120 |
| `frontend/src/pages/FlagsPage.tsx` | REWRITE | 350 |
| `frontend/src/pages/MonitoriaPage.tsx` | REWRITE | 400 |
| `frontend/src/pages/AuditoriaPage.tsx` | CRIAR | 400 |
| `frontend/src/pages/SMTPPage.tsx` | CRIAR | 450 |
| `frontend/src/App.tsx` | EDITAR (+2 imports, +2 cases) | +10 |
| `frontend/src/components/Sidebar.tsx` | EDITAR (+1 seção "governanca") | +20 |

**Total frontend: ~1750 linhas novas + edits**

### Testes
| Arquivo | Ação | Linhas aprox. |
|---|---|---|
| `tests/e2e/playwright/sprint6-flags.spec.ts` | CRIAR | 250 |
| `tests/e2e/playwright/sprint6-monitoria.spec.ts` | CRIAR | 300 |
| `tests/e2e/playwright/sprint6-auditoria.spec.ts` | CRIAR | 200 |
| `tests/e2e/playwright/sprint6-smtp.spec.ts` | CRIAR | 250 |
| `testes/sprint6/ACEITACAOVALIDACAOSPRINT6.md` | CRIAR | ~400 markdown |

**Total testes: ~1000 linhas + relatório**

### Totais gerais
- Backend: ~1420 linhas
- Frontend: ~1750 linhas
- Testes: ~1000 linhas
- **Grande total: ~4170 linhas novas / 18 arquivos novos / 7 arquivos editados**

---

## PARTE 4 — Ordem de execução recomendada (janela 13/04–19/04)

**Dia 1 (13/04) — Fundação backend (Fases 0-1)**
1. Criar migração Alembic com 3 tabelas + seed (1h).
2. Rodar `alembic upgrade head` em `editaisvalida` primeiro (banco de validação), depois `agenteditais`.
3. Criar classes `ConfiguracaoSMTP`, `EmailTemplate`, `EmailQueue` em `models.py`.
4. Registrar 3 CRUDs em `crud_routes.py`.
5. Smoke test: `cd backend && python3 -c "from app import app; from models import ConfiguracaoSMTP, EmailTemplate, EmailQueue"` sem erros.

**Dia 2 (14/04) — Audit middleware (Fase 2)**
6. Criar `backend/audit_middleware.py`.
7. Registrar hooks em `app.py`.
8. Adicionar job de retenção LGPD em `scheduler.py`.
9. Aplicar `@audited_tool` em `execute_tool` de `tools.py`.
10. Smoke test: fazer PUT em qualquer CRUD e verificar linha nova em `auditoria_log`.

**Dia 3 (15/04) — SMTP Service + Tools novas (Fases 3-4)**
11. Criar `backend/smtp_service.py` com classe `SMTPService`.
12. Criar endpoints `/api/smtp/testar` e `/api/smtp/fila/reenviar/<id>`.
13. Criar job `job_processar_email_queue` no scheduler.
14. Refactor `job_verificar_alertas` e `job_executar_monitoramentos` para usar `SMTPService.enqueue(...)`.
15. Criar 5 tools novas + registrar 11 tools Sprint 6 em `TOOLS_MAP`.
16. Smoke test: chat DeepSeek invoca `configurar_alertas` e dispara linha em `auditoria_log` (acao=`deepseek_tool_call`).

**Dia 4 (16/04) — Frontend Flags + Monitoria (Fase 5A)**
17. Criar `api/sprint6.ts`.
18. REWRITE `FlagsPage.tsx`.
19. REWRITE `MonitoriaPage.tsx`.
20. Smoke test: `npx tsc --noEmit && npx vite build` sem erros; navegar para `/flags` e `/monitoria` manualmente.

**Dia 5 (17/04) — Frontend Auditoria + SMTP (Fase 5B)**
21. Criar `AuditoriaPage.tsx` (3 abas).
22. Criar `SMTPPage.tsx` (3 abas).
23. Editar `App.tsx` + `Sidebar.tsx`.
24. Smoke test: navegar manualmente; testar fluxo completo de 1 UC por página.

**Dia 6 (18/04) — Testes Playwright (Fase 6)**
25. Criar 4 spec files.
26. Rodar `npx playwright test sprint6-*` até passar 17/17.
27. Gerar screenshots e organizar em `tests/screenshots/sprint6/`.

**Dia 7 (19/04) — Relatório + correções (Fase 7)**
28. Escrever `ACEITACAOVALIDACAOSPRINT6.md`.
29. Parar servidores (`fuser -k 5007/tcp && fuser -k 5175/tcp`).
30. Atualizar memória `project_sprints_status.md`.
31. Commit + PR.

**Estimativa total**: 20-24h de trabalho concentrado (alinhado com planejamento atual de **8-12h** para desenvolvimento core + 6-8h de correção/testes + 2-4h de validação manual — consistente com as estimativas da Sprint 5).

---

## PARTE 5 — Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Middleware de auditoria introduz latência em todos os endpoints CRUD | Filtrar por path via `_should_audit()` — só `/api/crud/*` + endpoints sensíveis explícitos. Usar `g.audit_antes` só em `before_request` leve. Medir latência antes/depois em 3 endpoints via `time.time()` e abortar se >10ms overhead. |
| `ConfiguracaoSMTP.password_encrypted` quebra se chave Fernet não existe | Validar na migração se `FERNET_KEY` env var existe; se não, gerar uma em `backend/.env` e alertar no log (padrão já usado para outros segredos). |
| Refactor dos jobs do scheduler para usar `SMTPService` quebra envio em prod | Lançar com `SMTP_LIVE_MODE=false` (dry-run) por padrão; scheduler loga o que enviaria mas não envia. Ativar produção via config na aba SMTPPage só após testes passarem. |
| Testes Playwright sprint6 falham por timing em chat async | Usar `page.waitForFunction(() => document.querySelector(".chat-message"))` ao invés de `waitForTimeout` fixo. Timeout alto (30s) nas invocações DeepSeek. |
| TOOLS_MAP incompleto (só 12 tools) quebra tools já existentes ao adicionar novas | Auditar TOOLS_MAP atual + linhas `TOOLS_MAP["xxx"] = tool_yyy` espalhadas pelo arquivo (ver grep: ~30 linhas); consolidar num único dict no final. Cuidadoso: não duplicar. |
| Migração roda no seed da `valida1@valida.com.br` / `valida2@valida.com.br` e quebra testes anteriores | Rodar primeiro em `editaisvalida` (banco de validação), validar Sprint 1-5 Playwright completa (322 testes) antes de tocar `agenteditais`. Fazer dump/restore se quebrar. |
| Chat DeepSeek não consegue usar novas tools porque TOOL_SCHEMAS não inclui definição | Verificar se há `TOOL_SCHEMAS` ou `tool_definitions` em `tools.py`/`app.py` que precisa ser atualizado junto com `TOOLS_MAP`. **Grep antes**. |
| Template de email HTML tem XSS se variaveis não forem escapadas | Usar `Jinja2.Environment(autoescape=True)` ou `html.escape()` manual em todas as substituições. Nunca permitir `corpo_html` raw do usuário sem sanitização. |

---

## PARTE 6 — Verificação de sucesso

### Após cada fase
- [ ] Fase 0: `alembic current` mostra revisão nova; `SELECT COUNT(*) FROM configuracao_smtp` retorna ≥1.
- [ ] Fase 1: `cd backend && python3 -c "from models import ConfiguracaoSMTP, EmailTemplate, EmailQueue; print('ok')"` sem erro.
- [ ] Fase 2: PUT em `/api/crud/empresas/<id>` gera linha nova em `auditoria_log` com `acao=update` e `dados_antes/dados_depois`.
- [ ] Fase 3: Chamar `/api/smtp/testar` em dry-run retorna `{success:true, mode:"dry-run"}`; linha nova em `email_queue` com `status=sent`.
- [ ] Fase 4: `GET /api/tools` (se existir) lista as 11 tools Sprint 6; chat DeepSeek consegue invocar `configurar_alertas` e retornar sucesso.
- [ ] Fase 5: `npx tsc --noEmit` zero erros; `npx vite build` OK; navegação manual nas 4 páginas Sprint 6 sem crashes no console.
- [ ] Fase 6: `npx playwright test sprint6-*.spec.ts` retorna 17/17 verde.
- [ ] Fase 7: `ACEITACAOVALIDACAOSPRINT6.md` criado com screenshots linkados.

### Verificação end-to-end
1. Login como `valida1@valida.com.br` (empresa CH Hospitalar).
2. Ir a Flags → clicar "Novo Alerta" → chat abre → digitar "configurar alertas para o edital PE-001/2026 com 24h de antecedencia" → alerta aparece na tabela com status `agendado`.
3. Ir a Monitoria → criar monitoramento via chat "monitorar termo 'microscopio' a cada 6h em SP, MG" → aparece na tabela.
4. Ir a Auditoria → verificar que passos 2-3 geraram linhas novas com `acao=create`.
5. Login como super (`pasteurjr@gmail.com`) → ir a SMTP → aba Configuração → clicar "Testar SMTP" com destinatário = email próprio → retorna sucesso (dry-run: linha em `email_queue`).
6. Aba Fila → linha de teste visível com status `sent` (dry-run) ou `sending→sent` (live).
7. Rodar suite Playwright sprint6: `cd tests/e2e && npx playwright test sprint6-*` → 17 verde.
8. Rodar suite completa: 322 testes anteriores + 17 novos = 339/339. **Não pode quebrar nenhum teste Sprint 1-5.**
9. Parar servidores: `fuser -k 5007/tcp && fuser -k 5175/tcp`.

---

## PARTE 7 — Arquivos-chave a ler antes de começar

| Arquivo | Por quê |
|---|---|
| `backend/rn_audit.py` | Helper `log_transicao` já pronto — base do audit middleware |
| `backend/models.py:1078-1277` | Modelos Alerta/Monitoramento/Notificacao/Preferencias a reusar |
| `backend/models.py:2373-2407` | AuditoriaLog — estrutura existente, a popular |
| `backend/crud_routes.py:451-535` | CRUD_CONFIG existente — padrão para as 3 entries novas |
| `backend/scheduler.py:1-100` | Padrão de SMTP e jobs — onde refatorar para `SMTPService` |
| `backend/tools.py:3224-3252` | `TOOLS_MAP` + `execute_tool` — onde aplicar `@audited_tool` automático |
| `backend/tools.py:6930-7700` | Tools de alertas/monitoramentos existentes — padrão de assinatura |
| `backend/app.py:890-901` | Endpoint `/api/auditoria` existente — padrão para `/sensiveis` e `/exportar-compliance` |
| `backend/app.py:13073-13160` | Endpoints SMTP existentes — refatorar para novo `SMTPService` |
| `frontend/src/pages/FlagsPage.tsx` | Mock atual de 249L — ponto de partida para rewrite |
| `frontend/src/pages/MonitoriaPage.tsx` | Mock atual de 320L — ponto de partida para rewrite |
| `frontend/src/api/crud.ts` | Padrão de fetch a replicar em `api/sprint6.ts` |
| `frontend/src/App.tsx:141-205` | Roteamento `switch(currentPage)` — onde adicionar 2 cases |
| `frontend/src/components/Sidebar.tsx:137-160` | Padrão de seção + subitens — modelo para "Governança" |
| `tests/e2e/playwright/helpers.ts:1-90` | `login()` e `navTo()` reutilizáveis |
| `docs/CASOS DE USO SPRINT 6.md` | 17 UCs com telas ASCII — referência fonte |
| `docs/SPRINT 6-VI v2.md` | RFs e RNs ativados — rastreabilidade |

---

## PARTE 8 — Escopo explicitamente FORA deste plano

- Sprints 7–9 (Mercado, Dispensas, Lances Real-Time): fora.
- Regras [FALTANTE] das 64 RNs do plano anterior: continuam na lista de backlog; **esta Sprint 6 ativa apenas as RNs diretamente ligadas aos UCs Sprint 6** (RN-037, RN-132, RN-080, RN-039, RN-031, RN-211, RN-212, RN-186, RN-187, RN-008, RN-084).
- Reescrita de endpoints Sprint 1-5: nenhum tocado. Middleware é aditivo.
- Migração para Redis/queue real: `EmailQueue` roda sobre MySQL + APScheduler. Simples e suficiente para MVP.
- Integração SES/SendGrid produção: `smtp_live_mode=True` usa smtplib padrão. Mudar depois.
- Dashboards Grafana/observabilidade além do `AuditoriaLog`: não.
