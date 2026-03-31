# Plan: Migração Multi-Empresa + Select Cascata Área→Tipo→Subclasse

## Context
O sistema usa `user_id` para vincular dados (Produto, Edital, etc.), mas deveria vincular a `empresa_id` pois é multi-empresa. As tabelas de classificação (Área, Classe, Subclasse) são globais mas a Captação só mostra Tipo Produto achatado — falta o select cascata Área→Tipo→Subclasse com área padrão salva na empresa.

---

## Passo 1: Schema — adicionar `empresa_id` em 22 tabelas de negócio

**Arquivo:** `backend/models.py`

Adicionar `empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)` em:

| Tabela | Model |
|--------|-------|
| produtos | Produto |
| editais | Edital |
| analises | Analise |
| propostas | Proposta |
| precos_historicos | PrecoHistorico |
| alertas | Alerta |
| monitoramentos | Monitoramento |
| notificacoes | Notificacao |
| documentos | Documento |
| contratos | Contrato |
| recursos | Recurso |
| leads_crm | LeadCRM |
| acoes_pos_perda | AcaoPosPerda |
| aprendizado_feedback | AprendizadoFeedback |
| parametros_score | ParametroScore |
| classes_produtos | ClasseProduto |
| dispensas | Dispensa |
| estrategias_editais | EstrategiaEdital |
| fontes_certidoes | FonteCertidao |
| areas_produto | AreaProduto |
| classes_produto_v2 | ClasseProdutoV2 |
| subclasses_produto | SubclasseProduto |

Total: **22 tabelas** recebem `empresa_id`.

**Manter `user_id`** como "created_by" (auditoria). Manter empresa_id como nullable inicialmente.

**Tabelas que ficam user_id only** (dados pessoais): sessions, messages, refresh_tokens, preferencias_notificacao, auditoria_log.

**Tabelas que ficam globais** (referência do sistema, iguais para todos): fontes_editais, modalidades_licitacao, origens_orgao.

> **Áreas, Classes e Subclasses são POR EMPRESA** — cada empresa define sua própria estrutura de produtos. O seed data no `init_db()` será removido; a empresa cria suas áreas/classes/subclasses ao se cadastrar.

## Passo 2: `area_padrao_id` na Empresa

**Arquivo:** `backend/models.py` — model Empresa (linha ~1092)

```python
area_padrao_id = Column(String(36), ForeignKey('areas_produto.id', ondelete='SET NULL'), nullable=True)
area_padrao = relationship("AreaProduto", lazy="joined")
```

## Passo 3: ALTER TABLEs MySQL

22 ALTERs para `empresa_id` + 1 para `area_padrao_id`:
```sql
ALTER TABLE produtos ADD COLUMN empresa_id VARCHAR(36) NULL;
ALTER TABLE editais ADD COLUMN empresa_id VARCHAR(36) NULL;
ALTER TABLE areas_produto ADD COLUMN empresa_id VARCHAR(36) NULL;
ALTER TABLE classes_produto_v2 ADD COLUMN empresa_id VARCHAR(36) NULL;
ALTER TABLE subclasses_produto ADD COLUMN empresa_id VARCHAR(36) NULL;
-- ... (17 tabelas restantes)
ALTER TABLE empresas ADD COLUMN area_padrao_id VARCHAR(36) NULL;
```

**Backfill**: script que pega a primeira empresa de cada user e preenche empresa_id em todos os registros desse user.

## Passo 4: JWT com empresa_id

**Arquivo:** `backend/app.py`

- `create_access_token()` (linha 709): adicionar `empresa_id` no payload
- `require_auth()` (linha 718): extrair `request.empresa_id` do token
- `/api/auth/login` (linha 751): buscar empresa do user, incluir no token e na resposta
- `/api/auth/register` (linha 792): retornar `has_empresa: false`
- **Novo endpoint** `POST /api/auth/switch-empresa`: troca empresa ativa, gera novo token

Fallback: se JWT sem empresa_id, buscar primeira empresa do user.

## Passo 5: CRUD Router com empresa_scoped

**Arquivo:** `backend/crud_routes.py`

- Adicionar `empresa_scoped: True` na config das 22 tabelas (incluindo areas_produto, classes_produto_v2, subclasses_produto)
- Em `crud_list`: se `empresa_scoped`, filtrar por `model.empresa_id == empresa_id`
- Em `crud_create`: setar `instance.empresa_id = empresa_id`
- Em `crud_update/delete`: verificar ownership por empresa_id

## Passo 6: Atualizar processar_* e tools

**Arquivo:** `backend/app.py` + `backend/tools.py`

- ~25 funções `processar_*` recebem `empresa_id` além de `user_id`
- `_buscar_editais_multifonte()`: adicionar `empresa_id` param
- `tool_calcular_score_aderencia()`: filtrar Produto por `empresa_id`
- `/api/editais/buscar`: extrair `empresa_id` do request
- Chat handler: extrair `empresa_id` e passar para processar_*

## Passo 7: Frontend — Auth + Empresa no contexto

**Arquivos:** `frontend/src/api/auth.ts`, `frontend/src/contexts/AuthContext.tsx`

- Interface `EmpresaInfo` com id, razao_social, cnpj, area_padrao_id
- AuthContext: estado `empresa`, `hasEmpresa`, método `switchEmpresa()`
- Guardar empresa no localStorage
- Login response inclui empresa
- Se `hasEmpresa === false`, redirecionar para onboarding (criar empresa)

## Passo 8: Frontend — Captação com select cascata

**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx`

Substituir o select achatado de Tipo Produto por **3 selects cascata**:

1. **Área** — pré-preenchida com `empresa.area_padrao_id`. Opções de `/api/areas-produto` (filtrado por empresa_id no backend)
2. **Tipo Produto (Classe)** — filtrado pela área selecionada (classes da empresa)
3. **Subclasse** (opcional) — filtrado pela classe selecionada (subclasses da empresa)

```typescript
const [selectedArea, setSelectedArea] = useState("");
const [selectedClasse, setSelectedClasse] = useState("");
const [selectedSubclasse, setSelectedSubclasse] = useState("");

// Cascata
const classesForArea = useMemo(() => {
  if (!selectedArea) return allClasses; // todas se área não selecionada
  return areasProduto.find(a => a.id === selectedArea)?.classes || [];
}, [selectedArea]);

const subclassesForClasse = useMemo(() => {
  if (!selectedClasse) return [];
  return classesForArea.find(c => c.id === selectedClasse)?.subclasses || [];
}, [selectedClasse]);
```

Ao mudar Área → limpa Classe e Subclasse. Ao mudar Classe → limpa Subclasse.

## Passo 9: EmpresaPage — select de Área Padrão

**Arquivo:** `frontend/src/pages/EmpresaPage.tsx`

Adicionar select "Área de Atuação Padrão" que carrega de `/api/areas-produto` e salva como `area_padrao_id` na empresa.

---

## Arquivos a modificar

| Arquivo | Alterações |
|---------|-----------|
| `backend/models.py` | +empresa_id em 22 models (incl. Área/Classe/Subclasse), +area_padrao_id em Empresa, relationships |
| `backend/crud_routes.py` | empresa_scoped support no CRUD genérico |
| `backend/app.py` | JWT, login, register, switch-empresa, ~25 processar_*, endpoints |
| `backend/tools.py` | score e outras tools: empresa_id em vez de user_id para queries |
| `frontend/src/api/auth.ts` | EmpresaInfo interface |
| `frontend/src/contexts/AuthContext.tsx` | empresa state, switchEmpresa |
| `frontend/src/pages/CaptacaoPage.tsx` | Select cascata Área→Tipo→Subclasse |
| `frontend/src/pages/EmpresaPage.tsx` | Select área padrão |

## Verificação

1. Registrar user → `has_empresa: false` → redireciona para criar empresa
2. Criar empresa com área padrão "Médica" → JWT atualizado com empresa_id
3. Captação: Área pré-preenchida "Médica" → Tipo mostra Reagentes, Equipamentos, etc.
4. Selecionar Reagentes → Subclasse mostra Hematologia, Bioquímica, etc.
5. Buscar editais → resultados vinculados à empresa
6. CRUD produtos → filtrados por empresa_id
7. Chat: mesmos filtros funcionando
8. Parar servidor após testes (`fuser -k 5007/tcp`)
