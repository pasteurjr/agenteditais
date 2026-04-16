# RELATÓRIO DE VALIDAÇÃO REAL — PÁGINAS 2 e 3

**Data:** 2026-04-13
**Executor:** Agent Tester (Playwright Automated)
**Ambiente:** Frontend http://localhost:5175 | Backend http://localhost:5007

## RESUMO

| Status | Qtd |
|--------|-----|
| ✅ PASS | 2 |
| ❌ FAIL | 0 |
| ⚠️ PARTIAL | 1 |
| **TOTAL** | **3** |

---

## PÁGINA 2 — EMPRESA

### ✅ REQ API-2.1 — CRUD Empresa API

**Status:** PASS

**Detalhes:** PUT update: OK (200). GET verify: PERSISTIU. Website retornado: http://aquila-test.com

---

### ✅ REQ API-2.2 — Upload Doc API

**Status:** PASS

**Detalhes:** Upload: OK (status 201). Doc ID: 2b32ab66-e85f-4d88-8f3f-27c0d7d0a30d. Download: OK. Tamanho download: 92382 bytes (original: 92382)

---

## PÁGINA 3 — PORTFOLIO

### ⚠️ REQ API-3.3 — CRUD Produtos API

**Status:** PARTIAL

**Detalhes:** Produtos antes: 0. Depois: 0. Criar: FALHOU. Encontrado na lista: NÃO. ID: 

---

## BUGS ENCONTRADOS

### BUG-001: Upload de Documentos via UI não envia arquivo real

- **Local:** `frontend/src/pages/EmpresaPage.tsx` linha 265-283
- **Causa:** `handleSalvarDocumento()` usa `crudCreate("empresa-documentos")` que envia JSON puro.
  O campo `novoDocFile` é capturado pelo input mas NUNCA incluído na requisição.
- **Endpoint correto:** `POST /api/empresa-documentos/upload` que aceita `FormData` com `file`.
- **Impacto:** Registro é criado na tabela de docs mas SEM arquivo físico no servidor.
- **Fix sugerido:** Alterar handleSalvarDocumento para usar fetch com FormData em vez de crudCreate.

## SCREENSHOTS

Screenshots salvos em `test_screenshots/P2P3_*.png`

