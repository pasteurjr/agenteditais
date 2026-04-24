# Specs Playwright legados (pré-processo V3)

Este diretório contém os **173 spec files Playwright** que existiam antes da implantação do processo de validação V3 (ver `docs/VALIDACAOFACILICITA.md`).

Todos foram gerados de forma **ad-hoc** durante o ciclo de validação anterior do Arnaldo (Sprints 1-5). Cobrem:

- Validações da Sprint 1-1 e Sprint 1-2 (cadastro empresa, portfolio, parametrizações, etc.)
- Correções específicas reportadas pelo Arnaldo (ciclo de revisão)
- Smoke tests de Sprints 2-9
- Testes de regressão pontuais

## Por que ficaram aqui

1. **Referência histórica:** muitos validaram correções já aceitas em produção. Servem como log de "como aquele bug foi pego e como foi testada a correção".
2. **Não são executados automaticamente:** o `playwright.config.ts` tem `testIgnore: ['tests/e2e/playwright/legacy/**']`. Eles precisam de invocação explícita pra rodar.
3. **Não foram apagados:** apagar destruiria contexto útil pra futuros débitos técnicos.

## Como rodar (se necessário)

```bash
# Rodar 1 spec específico do legacy
npx playwright test tests/e2e/playwright/legacy/<nome>.spec.ts --config=- <<EOF
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { baseURL: 'http://localhost:5180', headless: true },
  testIgnore: [],
});
EOF
```

Ou apagar a regra `testIgnore` temporariamente no config principal.

## Não escreva specs novos aqui

Specs novos do processo V3 ficam em **`testes/tutoriais_playwright/`** (gerados pelo `/validar-uc`). Eles seguem o formato YAML rigoroso documentado em `docs/VALIDACAOFACILICITA.md`.

Se for necessário criar spec ad-hoc fora do processo V3 (ex: validação manual rápida durante debug), coloque em `tests/e2e/playwright/` (nível acima deste). Esses sim entram no `playwright test` normal.
