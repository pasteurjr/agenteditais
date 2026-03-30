# Estratégia de Validação — Agente de Editais

**Data:** 30/03/2026
**Escopo:** 58 Casos de Uso (UC-001 a UC-058), Sprints 1-5

---

## 1. Abordagem

Validação end-to-end via Playwright automatizado, seguindo a sequência de eventos de cada Caso de Uso. Cada teste executa as ações do ator na UI real e verifica as respostas do sistema com screenshots.

## 2. Ambiente

| Item | Valor |
|------|-------|
| Backend | Flask :5007 (python3 backend/app.py) |
| Frontend | Vite :5175 (npm run dev) |
| Browser | Chromium headless |
| Viewport | 1400 x 900 |
| Timeout teste | 120s (padrão), 300s (com IA) |
| Credenciais | pasteurjr@gmail.com / 123456 |
| Token | editais_ia_access_token |
| Pool MySQL | pool_size=20, max_overflow=30 |

## 3. Critérios de Aprovação

Um UC é considerado **validado** quando:
1. O teste Playwright executa sem crash
2. Cada passo do fluxo principal é executado
3. Screenshots de ação e resposta são capturados
4. O conteúdo da resposta corresponde ao esperado no UC
5. Nenhuma divergência crítica aberta

## 4. Critérios de Reprovação

Um UC é **reprovado** quando:
1. A página crasheia (PAGE ERROR)
2. Endpoint retorna 500
3. IA não responde (timeout permanente)
4. Dados não persistem
5. A resposta do sistema não corresponde ao UC

## 5. Organização dos Testes

### Blocos de Execução (reiniciar backend entre blocos)

| Bloco | UCs | Sprint | Páginas | Tempo Est. |
|-------|-----|--------|---------|------------|
| B1 | UC-001 a UC-012 | 1 | Login, Empresa, Portfolio, Params, Dashboard | 10 min |
| B2 | UC-013 a UC-019 | 2 | Captação, Validação | 15 min |
| B3 | UC-020 a UC-031 | 3 | Precificação, Proposta, Submissão | 15 min |
| B4 | UC-032 a UC-041 | 4 | Impugnação, Recursos | 20 min (IA ~60s por operação) |
| B5 | UC-042 a UC-056 | 5 | Follow-up, Atas, Contratos, Dashboard CR | 15 min |
| B6 | UC-057 a UC-058 | — | Chat, CRUD | 5 min |

### Prioridades

| Prioridade | UCs | Motivo |
|-----------|-----|--------|
| P1 (Crítico) | UC-001, UC-013, UC-016, UC-026, UC-032, UC-042, UC-048 | Fluxo principal do negócio |
| P2 (Alto) | UC-002 a UC-006, UC-020 a UC-025, UC-036 a UC-041 | Funcionalidades core |
| P3 (Médio) | UC-007 a UC-012, UC-043 a UC-056 | Funcionalidades complementares |
| P4 (Baixo) | UC-057, UC-058 | Transversais |

## 6. Dados de Teste Necessários

| Dado | Fonte | UC que usa |
|------|-------|-----------|
| Empresa cadastrada | Seed data existente | UC-002 a UC-005 |
| Produtos no portfolio | Seed data existente | UC-006 a UC-009 |
| Editais com PDF | PNCP real (Fiocruz 46/2026) | UC-013 a UC-019, UC-032 |
| Edital com status proposta_enviada | Criado via API | UC-042 |
| Contrato vigente | Seed data existente (CTR-2025-0087) | UC-048 a UC-056 |
| Entregas com datas | Seed data existente | UC-049, UC-050 |

## 7. Timeouts por Tipo de Operação

| Operação | Timeout |
|----------|---------|
| Navegação simples | 3s |
| CRUD (criar/editar) | 5s |
| Busca PNCP | 15-30s |
| Análise legal IA | 45-60s |
| Geração de laudo IA | 60-120s |
| Extração de ata PDF | 60-90s |
| Score de validação | 30-45s |

## 8. Convenção de Screenshots

```
runtime/screenshots/UC-XXX/
  P01_acao_{descricao}.png    — Ação do ator (antes do clique)
  P01_resp_{descricao}.png    — Resposta do sistema (após ação)
  P02_acao_{descricao}.png
  P02_resp_{descricao}.png
  ...
```

## 9. Convenção de Testes

```
tests/e2e/playwright/
  uc-001.spec.ts   — 1 arquivo por UC
  uc-002.spec.ts
  ...
  uc-058.spec.ts
```

Cada spec segue o padrão:
```typescript
test.describe("UC-XXX: Nome do UC", () => {
  test("Passo 1: Descrição", async ({ page }) => {
    // Ação
    await page.screenshot({ path: "runtime/screenshots/UC-XXX/P01_acao.png" });
    // Resposta
    await page.waitForTimeout(TIMEOUT);
    await page.screenshot({ path: "runtime/screenshots/UC-XXX/P01_resp.png" });
    // Verificação
    expect(body).toContain("TEXTO_ESPERADO");
  });
});
```
