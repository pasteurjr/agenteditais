# Tutorial Playwright — Sprint 2 — Conjunto 1 (V2)
# Captacao e Validacao — Empresa: CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.

**Data:** 07/04/2026 (V2 atualizado em 29/04/2026)
**Dados:** dadoscapval-1 V2.md
**Referencia:** CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V7.md
**UCs:** CV01–CV13 (13 casos de uso)
**Publico:** Engenheiro QA / script Playwright automatizado

---

## ⚠️ PRÉ-REQUISITO CRÍTICO — UC-F13 V8 da Sprint 1

**Antes de rodar qualquer UC desta sprint, certifique-se de que o UC-F13 (V8) da Sprint 1 foi executado** para a empresa ativa. O UC-F13 V8 cria a hierarquia **Área → Classe → Subclasse** (2 áreas, 3 classes, 3 subclasses) que esta sprint depende para os filtros cascata de busca de editais (UC-CV01..09).

**Sintomas de pré-requisito faltando:**
- Filtros de Área/Classe/Subclasse na busca aparecem vazios.
- UC-CV03 (salvar edital) não consegue associar área padrão.
- UC-CV09 (importar itens) falha ao classificar.

**Cobertura:** ver `tutorialsprint1-1 V2.md` ou `tutorialsprint1-2 V2.md` seção UC-F13.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| Usuario (Conjunto 1) | valida1@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |

### Fluxo de login automatizado (helpers.ts)

O helper `login(page)` em `tests/e2e/playwright/helpers.ts`:
1. Limpa localStorage
2. Preenche `valida1@valida.com.br` / `123456`
3. Detecta tela de selecao de empresa
4. Seleciona CH Hospitalar (por texto ou via API switch-empresa com ID fixo)
5. Aguarda Dashboard carregar

### Pre-requisito: Sprint 1 concluida

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-1.md` devem estar cadastrados antes de executar os testes da Sprint 2. Produtos relevantes:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Ultrassonografo Portatil Mindray M7T | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |
| Monitor Multiparametrico Mindray iMEC10 Plus | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |

---

## Indice

1. [UC-CV01 — Buscar editais por termo, classificacao e score](#uc-cv01)
2. [UC-CV02 — Explorar resultados e painel lateral](#uc-cv02)
3. [UC-CV03 — Salvar edital, itens e scores](#uc-cv03)
4. [UC-CV04 — Definir estrategia](#uc-cv04)
5. [UC-CV05 — Exportar e consolidar](#uc-cv05)
6. [UC-CV06 — Gerir monitoramentos](#uc-cv06)
7. [UC-CV07 — Listar editais salvos](#uc-cv07)
8. [UC-CV08 — Calcular scores e decidir GO/NO-GO](#uc-cv08)
9. [UC-CV09 — Importar itens e extrair lotes](#uc-cv09)
10. [UC-CV10 — Confrontar documentacao](#uc-cv10)
11. [UC-CV11 — Analisar riscos, atas, concorrentes](#uc-cv11)
12. [UC-CV12 — Analisar mercado](#uc-cv12)
13. [UC-CV13 — IA resumo e perguntas](#uc-cv13)
14. [Dependencias entre UCs](#dependencias-entre-ucs)
15. [Ordem de Execucao Recomendada](#ordem-de-execucao-recomendada)
16. [Fixtures Necessarios](#fixtures-necessarios)

---

## [UC-CV01] Buscar editais por termo, classificacao e score

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- Usuario autenticado no sistema (valida1@valida.com.br, empresa: CH Hospitalar)
- Dados da Sprint 1 cadastrados (empresa, portfolio, parametrizacoes)
- Sidebar com menu "Captacao" visivel

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Captacao via sidebar
await page.click('button:has-text("Captacao")');
await expect(page).toHaveURL(/\/app\/captacao/);

// === BUSCA 1 — Termo simples (Score Rapido) ===
await page.getByLabel('Termo de busca').fill('monitor multiparametrico');
await page.selectOption('select[name*="uf"]', 'Todas');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Score Rapido');
// Garantir que "Incluir encerrados" esta desmarcado
const encerradosCheckbox = page.locator('input[name*="encerrados"], label:has-text("Incluir editais encerrados") input');
await encerradosCheckbox.uncheck();

await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// === BUSCA 2 — Termo com NCM e UF (Score Hibrido) ===
await page.getByLabel('Termo de busca').fill('ultrassom portatil');
await page.getByLabel('NCM').fill('9018.19.90');
await page.selectOption('select[name*="uf"]', 'SP');
await page.selectOption('select[name*="score"]', 'Score Hibrido');

await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// === BUSCA 3 — Cascata Area/Classe/Subclasse (Score Profundo) ===
await page.getByLabel('Termo de busca').fill('equipamento medico');
await page.selectOption('select[name*="area"]', 'Equipamentos Medico-Hospitalares');
await page.waitForTimeout(500); // aguardar populacao da classe
await page.selectOption('select[name*="classe"]', 'Equipamentos de Diagnostico por Imagem');
await page.waitForTimeout(500); // aguardar populacao da subclasse
await page.selectOption('select[name*="subclasse"]', 'Ultrassonografo');
await page.selectOption('select[name*="score"]', 'Score Profundo');
await page.getByLabel('Qtd editais profundo').fill('5');
await encerradosCheckbox.check(); // Incluir encerrados = Sim

await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 120000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 60000 });

// === BUSCA 4 — Sem Score (busca rapida) ===
await page.getByLabel('Termo de busca').fill('desfibrilador');
await page.selectOption('select[name*="uf"]', 'RJ');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Sem Score');

await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Captacao na sidebar | `button:has-text("Captacao")` | — | URL contem `/app/captacao` |
| 2 | Preencher termo (Busca 1) | `page.getByLabel('Termo de busca')` | `monitor multiparametrico` | Campo preenchido |
| 3 | Selecionar UF | `select[name*="uf"]` | `Todas` | Opcao selecionada |
| 4 | Selecionar Fonte | `select[name*="fonte"]` | `PNCP` | Opcao selecionada |
| 5 | Selecionar Score Rapido | `select[name*="score"]` | `Score Rapido` | Opcao selecionada |
| 6 | Desmarcar encerrados | `input[name*="encerrados"]` | — | Checkbox desmarcado |
| 7 | Clicar Buscar Editais | `button:has-text("Buscar Editais")` | — | Tabela de resultados populada |
| 8 | Preencher termo (Busca 2) | `page.getByLabel('Termo de busca')` | `ultrassom portatil` | Campo preenchido |
| 9 | Preencher NCM | `page.getByLabel('NCM')` | `9018.19.90` | Campo preenchido |
| 10 | Selecionar UF=SP | `select[name*="uf"]` | `SP` | Opcao selecionada |
| 11 | Selecionar Score Hibrido | `select[name*="score"]` | `Score Hibrido` | Opcao selecionada |
| 12 | Clicar Buscar Editais | `button:has-text("Buscar Editais")` | — | Tabela de resultados populada |
| 13 | Preencher termo (Busca 3) | `page.getByLabel('Termo de busca')` | `equipamento medico` | Campo preenchido |
| 14 | Selecionar Area | `select[name*="area"]` | `Equipamentos Medico-Hospitalares` | Area selecionada; Classe populada |
| 15 | Selecionar Classe | `select[name*="classe"]` | `Equipamentos de Diagnostico por Imagem` | Classe selecionada; Subclasse populada |
| 16 | Selecionar Subclasse | `select[name*="subclasse"]` | `Ultrassonografo` | Subclasse selecionada |
| 17 | Selecionar Score Profundo | `select[name*="score"]` | `Score Profundo` | Opcao selecionada |
| 18 | Preencher Qtd editais profundo | `page.getByLabel('Qtd editais profundo')` | `5` | Campo preenchido |
| 19 | Marcar encerrados | `input[name*="encerrados"]` | — | Checkbox marcado |
| 20 | Clicar Buscar Editais | `button:has-text("Buscar Editais")` | — | Tabela de resultados populada |
| 21 | Preencher termo (Busca 4) | `page.getByLabel('Termo de busca')` | `desfibrilador` | Campo preenchido |
| 22 | Selecionar UF=RJ | `select[name*="uf"]` | `RJ` | Opcao selecionada |
| 23 | Selecionar Sem Score | `select[name*="score"]` | `Sem Score` | Opcao selecionada |
| 24 | Clicar Buscar Editais | `button:has-text("Buscar Editais")` | — | Tabela de resultados populada |

### Verificacoes finais (assertions)

```typescript
// Busca 1: resultados com score rapido
await expect(page.locator('table tbody tr').first()).toBeVisible();
await expect(page.locator('table tbody tr')).not.toHaveCount(0);

// Busca 2: resultados filtrados por NCM e UF=SP
await expect(page.locator('table tbody tr').first()).toBeVisible();

// Busca 3: resultados com score profundo (barras de score visiveis)
await expect(page.locator('table tbody tr').first()).toBeVisible();

// Busca 4: resultados sem score
await expect(page.locator('table tbody tr').first()).toBeVisible();
```

> **Nota para execucao manual:** Executar as 4 buscas na sequencia indicada. Verificar que cada busca retorna resultados na tabela. Na Busca 3 (Score Profundo), o processamento pode levar ate 2 minutos. Na Busca 4 (Sem Score), a coluna de score deve estar vazia ou com traco.

---

## [UC-CV02] Explorar resultados e painel lateral

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- UC-CV01 concluido com sucesso (resultados da Busca 1 visiveis na tabela)
- Tabela de resultados com pelo menos um edital com score >= 50%

---

### Sequencia de Automacao

```typescript
// Executar Busca 1 para garantir resultados (se nao feito antes)
await page.click('button:has-text("Captacao")');
await expect(page).toHaveURL(/\/app\/captacao/);

// Selecionar primeiro edital com score >= 50%
// Clicar na primeira linha da tabela de resultados
const primeiraLinha = page.locator('table tbody tr').first();
await primeiraLinha.click();

// Aguardar painel lateral abrir
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toBeVisible({ timeout: 5000 });

// Verificar informacoes do painel lateral
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/numero|edital/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/orgao/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/uf|estado/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/objeto/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/valor|R\$/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/modalidade/i);

// Verificar produto correspondente
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/produto|correspondente|match/i);

// Verificar score
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/score|%/i);

// Se score profundo, verificar 6 ScoreBars
const scoreBars = page.locator('[data-testid="score-bar"], .score-bar, [class*="ScoreBar"]');
const scoreBarCount = await scoreBars.count();
if (scoreBarCount >= 6) {
  await expect(scoreBars.nth(0)).toBeVisible(); // Tecnica
  await expect(scoreBars.nth(1)).toBeVisible(); // Documental
  await expect(scoreBars.nth(2)).toBeVisible(); // Complexidade
  await expect(scoreBars.nth(3)).toBeVisible(); // Juridico
  await expect(scoreBars.nth(4)).toBeVisible(); // Logistico
  await expect(scoreBars.nth(5)).toBeVisible(); // Comercial
}

// Verificar decisao IA badge
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /GO|NO-GO|Acompanhar/i })).toBeVisible();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar na primeira linha da tabela | `table tbody tr:first-child` | — | Painel lateral abre |
| 2 | Verificar numero do edital | Painel lateral | — | Numero do edital visivel no cabecalho |
| 3 | Verificar orgao | Painel lateral | — | Nome do orgao contratante visivel |
| 4 | Verificar UF | Painel lateral | — | Estado visivel |
| 5 | Verificar objeto | Painel lateral | — | Descricao completa do objeto |
| 6 | Verificar valor estimado | Painel lateral | — | Formatado em R$ |
| 7 | Verificar modalidade | Painel lateral | — | Tipo de licitacao |
| 8 | Verificar produto correspondente | Painel lateral | — | Match com portfolio (Monitor ou Ultrassom) |
| 9 | Verificar score | Painel lateral | — | Barra percentual com cor visivel |
| 10 | Verificar ScoreBars (se profundo) | `[data-testid="score-bar"]` | — | 6 barras: Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial |
| 11 | Verificar decisao IA | `.badge` | — | Badge GO / NO-GO / Acompanhar visivel |

### Verificacoes finais (assertions)

```typescript
// Painel lateral visivel com informacoes completas
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toBeVisible();
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/orgao/i);
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toContainText(/R\$|valor/i);
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /GO|NO-GO|Acompanhar/i })).toBeVisible();
```

> **Nota para execucao manual:** Ao clicar em um edital na tabela de resultados, o painel lateral deve abrir no lado direito da tela com todas as informacoes do edital. Verificar que o score esta visivel com cores (verde >= 70%, amarelo >= 40%, vermelho < 40%). Se o score profundo foi calculado, verificar as 6 barras de dimensao.

---

## [UC-CV03] Salvar edital, itens e scores

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- UC-CV01 e UC-CV02 concluidos
- Resultados de busca visiveis na tabela
- Painel lateral funcional

---

### Sequencia de Automacao

```typescript
// === CENARIO 1 — Salvar edital individual (score >= 60% da Busca 1) ===
// Executar Busca 1
await page.getByLabel('Termo de busca').fill('monitor multiparametrico');
await page.selectOption('select[name*="uf"]', 'Todas');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Score Rapido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Selecionar primeiro edital com score >= 60%
await page.locator('table tbody tr').first().click();
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toBeVisible();

// Clicar "Salvar Edital" no painel lateral
await page.click('button:has-text("Salvar Edital")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/salvar') && resp.status() === 200,
  { timeout: 30000 }
);
// Verificar badge "Salvo"
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]alvo/ })).toBeVisible();

// === CENARIO 2 — Salvar todos (Busca 4 — desfibrilador) ===
await page.getByLabel('Termo de busca').fill('desfibrilador');
await page.selectOption('select[name*="uf"]', 'RJ');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Sem Score');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Clicar "Salvar Todos"
await page.click('button:has-text("Salvar Todos")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/salvar') && resp.status() === 200,
  { timeout: 60000 }
);
// Verificar que todos os editais da lista tem badge "Salvo"
const linhasCen2 = await page.locator('table tbody tr').count();
for (let i = 0; i < Math.min(linhasCen2, 5); i++) {
  await expect(page.locator('table tbody tr').nth(i).locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]alvo/ })).toBeVisible();
}

// === CENARIO 3 — Salvar somente score >= 70% (Busca 1) ===
await page.getByLabel('Termo de busca').fill('monitor multiparametrico');
await page.selectOption('select[name*="uf"]', 'Todas');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Score Rapido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Clicar "Salvar Score >= 70%"
await page.click('button:has-text("Salvar Score >= 70%")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/salvar') && resp.status() === 200,
  { timeout: 30000 }
);

// === CENARIO 4 — Salvar selecionados (Busca 2 — ultrassom) ===
await page.getByLabel('Termo de busca').fill('ultrassom portatil');
await page.getByLabel('NCM').fill('9018.19.90');
await page.selectOption('select[name*="uf"]', 'SP');
await page.selectOption('select[name*="score"]', 'Score Hibrido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Marcar checkbox de 3 editais
await page.locator('table tbody tr').nth(0).locator('input[type="checkbox"]').check();
await page.locator('table tbody tr').nth(1).locator('input[type="checkbox"]').check();
await page.locator('table tbody tr').nth(2).locator('input[type="checkbox"]').check();

// Clicar "Salvar Selecionados"
await page.click('button:has-text("Salvar Selecionados")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/salvar') && resp.status() === 200,
  { timeout: 30000 }
);
// Verificar que apenas os 3 editais marcados tem badge "Salvo"
for (let i = 0; i < 3; i++) {
  await expect(page.locator('table tbody tr').nth(i).locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]alvo/ })).toBeVisible();
}
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Executar Busca 1 | `button:has-text("Buscar Editais")` | `monitor multiparametrico` | Resultados na tabela |
| 2 | Clicar primeira linha | `table tbody tr:first-child` | — | Painel lateral abre |
| 3 | Clicar "Salvar Edital" (Cenario 1) | `button:has-text("Salvar Edital")` | — | Badge "Salvo" aparece |
| 4 | Executar Busca 4 | `button:has-text("Buscar Editais")` | `desfibrilador` | Resultados na tabela |
| 5 | Clicar "Salvar Todos" (Cenario 2) | `button:has-text("Salvar Todos")` | — | Todos os editais com badge "Salvo" |
| 6 | Executar Busca 1 novamente | `button:has-text("Buscar Editais")` | `monitor multiparametrico` | Resultados na tabela |
| 7 | Clicar "Salvar Score >= 70%" (Cenario 3) | `button:has-text("Salvar Score >= 70%")` | — | Editais com score >= 70% com badge "Salvo" |
| 8 | Executar Busca 2 | `button:has-text("Buscar Editais")` | `ultrassom portatil` | Resultados na tabela |
| 9 | Marcar checkbox edital 1 | `table tbody tr:nth-child(1) input[type="checkbox"]` | — | Checkbox marcado |
| 10 | Marcar checkbox edital 2 | `table tbody tr:nth-child(2) input[type="checkbox"]` | — | Checkbox marcado |
| 11 | Marcar checkbox edital 3 | `table tbody tr:nth-child(3) input[type="checkbox"]` | — | Checkbox marcado |
| 12 | Clicar "Salvar Selecionados" (Cenario 4) | `button:has-text("Salvar Selecionados")` | — | 3 editais com badge "Salvo" |

### Verificacoes finais (assertions)

```typescript
// Cenario 1: edital individual salvo
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]alvo/ }).first()).toBeVisible();

// Cenario 2: todos salvos
const linhas = await page.locator('table tbody tr').count();
expect(linhas).toBeGreaterThan(0);

// Cenario 3: apenas score >= 70% salvos
// (verificacao visual — editais com score < 70% nao devem ter badge "Salvo")

// Cenario 4: 3 editais selecionados salvos
for (let i = 0; i < 3; i++) {
  await expect(
    page.locator('table tbody tr').nth(i).locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]alvo/ })
  ).toBeVisible();
}
```

> **Nota para execucao manual:** Executar os 4 cenarios na ordem indicada. No cenario 1, verificar que o badge "Salvo" aparece na linha do edital selecionado. No cenario 2, verificar que TODOS os editais recebem o badge. No cenario 3, apenas editais com score >= 70% devem ser salvos. No cenario 4, marcar exatamente 3 checkboxes antes de clicar "Salvar Selecionados".

---

## [UC-CV04] Definir estrategia

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- UC-CV03 concluido (edital salvo disponivel)
- Painel lateral do edital salvo acessivel

---

### Sequencia de Automacao

```typescript
// === ESTRATEGIA 1 — Estrategico, 25%, Varia por Produto=Sim, Varia por Regiao=Nao ===
// Selecionar edital salvo no painel lateral (reusar resultado da Busca 1)
await page.getByLabel('Termo de busca').fill('monitor multiparametrico');
await page.selectOption('select[name*="score"]', 'Score Rapido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await page.locator('table tbody tr').first().click();
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toBeVisible();

// Selecionar intencao Estrategico
await page.click('input[value="Estrategico"], label:has-text("Estrategico") input');
await expect(page.locator('input[value="Estrategico"], label:has-text("Estrategico") input')).toBeChecked();

// Ajustar margem para 25%
await page.getByLabel('Margem desejada').fill('25');
// ou se for slider:
// await page.locator('input[type="range"][name*="margem"]').fill('25');

// Ativar "Varia por Produto"
await page.locator('label:has-text("Varia por Produto") input, input[name*="varia_produto"]').check();
await expect(page.locator('label:has-text("Varia por Produto") input, input[name*="varia_produto"]')).toBeChecked();

// Desativar "Varia por Regiao"
await page.locator('label:has-text("Varia por Regiao") input, input[name*="varia_regiao"]').uncheck();
await expect(page.locator('label:has-text("Varia por Regiao") input, input[name*="varia_regiao"]')).not.toBeChecked();

// Salvar estrategia
await page.click('button:has-text("Salvar Estrategia")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar persistencia: fechar e reabrir o painel
await page.locator('table tbody tr').nth(1).click(); // mudar para outro edital
await page.waitForTimeout(500);
await page.locator('table tbody tr').first().click(); // voltar ao edital original
await expect(page.locator('input[value="Estrategico"], label:has-text("Estrategico") input')).toBeChecked();

// === ESTRATEGIA 2 — Defensivo, 10%, Varia por Produto=Nao, Varia por Regiao=Sim ===
// Selecionar segundo edital
await page.locator('table tbody tr').nth(1).click();
await expect(page.locator('[data-testid="painel-lateral"], .painel-lateral, aside')).toBeVisible();

// Selecionar intencao Defensivo
await page.click('input[value="Defensivo"], label:has-text("Defensivo") input');
await expect(page.locator('input[value="Defensivo"], label:has-text("Defensivo") input')).toBeChecked();

// Ajustar margem para 10%
await page.getByLabel('Margem desejada').fill('10');

// Desativar "Varia por Produto"
await page.locator('label:has-text("Varia por Produto") input, input[name*="varia_produto"]').uncheck();

// Ativar "Varia por Regiao"
await page.locator('label:has-text("Varia por Regiao") input, input[name*="varia_regiao"]').check();

// Salvar estrategia
await page.click('button:has-text("Salvar Estrategia")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar persistencia
await page.locator('table tbody tr').first().click();
await page.waitForTimeout(500);
await page.locator('table tbody tr').nth(1).click();
await expect(page.locator('input[value="Defensivo"], label:has-text("Defensivo") input')).toBeChecked();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital salvo (primeiro) | `table tbody tr:first-child` | — | Painel lateral abre |
| 2 | Selecionar radio "Estrategico" | `input[value="Estrategico"]` | — | Radio selecionado |
| 3 | Ajustar margem para 25% | `page.getByLabel('Margem desejada')` | `25` | Valor exibido como 25% |
| 4 | Ativar "Varia por Produto" | `label:has-text("Varia por Produto") input` | — | Toggle ativo |
| 5 | Desativar "Varia por Regiao" | `label:has-text("Varia por Regiao") input` | — | Toggle inativo |
| 6 | Clicar "Salvar Estrategia" | `button:has-text("Salvar Estrategia")` | — | Toast de sucesso |
| 7 | Reabrir painel (fechar e abrir) | Clicar outro edital + voltar | — | Estrategia persiste (Estrategico, 25%) |
| 8 | Selecionar segundo edital | `table tbody tr:nth-child(2)` | — | Painel lateral abre |
| 9 | Selecionar radio "Defensivo" | `input[value="Defensivo"]` | — | Radio selecionado |
| 10 | Ajustar margem para 10% | `page.getByLabel('Margem desejada')` | `10` | Valor exibido como 10% |
| 11 | Desativar "Varia por Produto" | `label:has-text("Varia por Produto") input` | — | Toggle inativo |
| 12 | Ativar "Varia por Regiao" | `label:has-text("Varia por Regiao") input` | — | Toggle ativo |
| 13 | Clicar "Salvar Estrategia" | `button:has-text("Salvar Estrategia")` | — | Toast de sucesso |
| 14 | Reabrir painel (fechar e abrir) | Clicar outro edital + voltar | — | Estrategia persiste (Defensivo, 10%) |

### Verificacoes finais (assertions)

```typescript
// Estrategia 1 persistiu
await page.locator('table tbody tr').first().click();
await expect(page.locator('input[value="Estrategico"], label:has-text("Estrategico") input')).toBeChecked();
await expect(page.getByLabel('Margem desejada')).toHaveValue('25');
await expect(page.locator('label:has-text("Varia por Produto") input')).toBeChecked();
await expect(page.locator('label:has-text("Varia por Regiao") input')).not.toBeChecked();

// Estrategia 2 persistiu
await page.locator('table tbody tr').nth(1).click();
await expect(page.locator('input[value="Defensivo"], label:has-text("Defensivo") input')).toBeChecked();
await expect(page.getByLabel('Margem desejada')).toHaveValue('10');
await expect(page.locator('label:has-text("Varia por Produto") input')).not.toBeChecked();
await expect(page.locator('label:has-text("Varia por Regiao") input')).toBeChecked();
```

> **Nota para execucao manual:** Definir as duas estrategias em editais diferentes. Apos salvar cada uma, fechar o painel (clicando em outro edital) e reabrir para confirmar que os valores persistiram corretamente. A margem deve ser exibida como percentual.

---

## [UC-CV05] Exportar e consolidar

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- UC-CV01 concluido (resultados de busca disponiveis)
- Pelo menos uma busca executada com resultados

---

### Sequencia de Automacao

```typescript
// === EXPORTAR CSV ===
// Executar Busca 1
await page.click('button:has-text("Captacao")');
await expect(page).toHaveURL(/\/app\/captacao/);
await page.getByLabel('Termo de busca').fill('monitor multiparametrico');
await page.selectOption('select[name*="uf"]', 'Todas');
await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="score"]', 'Score Rapido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Clicar "Exportar CSV"
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button:has-text("Exportar CSV")'),
]);
// Verificar que o download foi iniciado
expect(download.suggestedFilename()).toMatch(/\.csv$/);

// === RELATORIO COMPLETO ===
// Executar Busca 2
await page.getByLabel('Termo de busca').fill('ultrassom portatil');
await page.getByLabel('NCM').fill('9018.19.90');
await page.selectOption('select[name*="uf"]', 'SP');
await page.selectOption('select[name*="score"]', 'Score Hibrido');
await page.click('button:has-text("Buscar Editais")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/buscar') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });

// Clicar "Relatorio Completo"
await page.click('button:has-text("Relatorio Completo")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/relatorio') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar que o relatorio foi gerado com conteudo
await expect(page.locator('[data-testid="relatorio"], .relatorio, .report')).toBeVisible({ timeout: 10000 });
await expect(page.locator('[data-testid="relatorio"], .relatorio, .report')).toContainText(/resumo|ranking|analise/i);
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Executar Busca 1 | `button:has-text("Buscar Editais")` | `monitor multiparametrico` | Resultados na tabela |
| 2 | Clicar "Exportar CSV" | `button:has-text("Exportar CSV")` | — | Download de arquivo .csv iniciado |
| 3 | Verificar nome do arquivo | Download event | — | Arquivo termina em `.csv` |
| 4 | Executar Busca 2 | `button:has-text("Buscar Editais")` | `ultrassom portatil` | Resultados na tabela |
| 5 | Clicar "Relatorio Completo" | `button:has-text("Relatorio Completo")` | — | Relatorio gerado e exibido |
| 6 | Verificar conteudo do relatorio | `[data-testid="relatorio"]` | — | Contem resumo, ranking e analise |

### Verificacoes finais (assertions)

```typescript
// CSV exportado com sucesso
expect(download.suggestedFilename()).toMatch(/\.csv$/);

// Relatorio completo exibido
await expect(page.locator('[data-testid="relatorio"], .relatorio, .report')).toBeVisible();
await expect(page.locator('[data-testid="relatorio"], .relatorio, .report')).not.toBeEmpty();
```

> **Nota para execucao manual:** No export CSV, verificar que o arquivo baixado contem as colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Score. No relatorio completo, verificar que o conteudo inclui resumo executivo, ranking de editais e analise consolidada em formato markdown/HTML.

---

## [UC-CV06] Gerir monitoramentos

**Pagina:** `CaptacaoPage` — rota `/app/captacao`
**Pre-condicoes:**
- Usuario autenticado
- Pagina de captacao acessivel
- Secao de monitoramentos disponivel

---

### Sequencia de Automacao

```typescript
// Navegar para Captacao
await page.click('button:has-text("Captacao")');
await expect(page).toHaveURL(/\/app\/captacao/);

// Localizar secao de Monitoramentos (pode ser aba ou secao da pagina)
await page.click('button:has-text("Monitoramentos"), [role="tab"]:has-text("Monitoramentos")');

// === CRIAR MONITORAMENTO 1 — Monitor Multiparametrico ===
await page.click('button:has-text("Novo Monitoramento"), button:has-text("Criar Monitoramento")');

await page.getByLabel('Termo').fill('monitor multiparametrico');
await page.getByLabel('NCM').fill('9018.19.90');

// Selecionar UFs: SP, RJ, MG
await page.locator('label:has-text("SP") input, input[value="SP"]').check();
await page.locator('label:has-text("RJ") input, input[value="RJ"]').check();
await page.locator('label:has-text("MG") input, input[value="MG"]').check();

await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="frequencia"]', 'A cada 6 horas');
await page.getByLabel('Score Minimo').fill('60');

// Incluir Encerrados = Nao
await page.locator('label:has-text("Incluir Encerrados") input, input[name*="encerrados"]').uncheck();

await page.click('button:has-text("Salvar"), button:has-text("Criar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/monitoramento') && resp.status() === 200,
  { timeout: 30000 }
);

// Verificar que aparece na tabela de monitoramentos ativos
await expect(page.locator('table, [data-testid="monitoramentos"]').locator('text=monitor multiparametrico')).toBeVisible();
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]tivo/ }).first()).toBeVisible();

// === CRIAR MONITORAMENTO 2 — Ultrassonografo Portatil ===
await page.click('button:has-text("Novo Monitoramento"), button:has-text("Criar Monitoramento")');

await page.getByLabel('Termo').fill('ultrassonografo portatil');
await page.getByLabel('NCM').fill('9018.19.90');

// Selecionar UFs: Todas
await page.locator('label:has-text("Todas") input, input[value="Todas"], label:has-text("Todo o Brasil") input').check();

await page.selectOption('select[name*="fonte"]', 'PNCP');
await page.selectOption('select[name*="frequencia"]', 'A cada 12 horas');
await page.getByLabel('Score Minimo').fill('50');

// Incluir Encerrados = Nao
await page.locator('label:has-text("Incluir Encerrados") input, input[name*="encerrados"]').uncheck();

await page.click('button:has-text("Salvar"), button:has-text("Criar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/monitoramento') && resp.status() === 200,
  { timeout: 30000 }
);

// Verificar que aparece abaixo do primeiro
await expect(page.locator('table, [data-testid="monitoramentos"]').locator('text=ultrassonografo portatil')).toBeVisible();

// === PAUSAR MONITORAMENTO 1 ===
const linhaMonit1 = page.locator('tr, [data-testid="monitoramento-item"]').filter({ hasText: 'monitor multiparametrico' });
await linhaMonit1.locator('button:has-text("Pausar")').click();
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/monitoramento') && resp.status() === 200,
  { timeout: 10000 }
);
// Verificar status "Pausado" com badge cinza
await expect(linhaMonit1.locator('.badge, [class*="badge"]').filter({ hasText: /[Pp]ausado/ })).toBeVisible();

// === RETOMAR MONITORAMENTO 1 ===
await linhaMonit1.locator('button:has-text("Retomar"), button:has-text("Ativar")').click();
await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/monitoramento') && resp.status() === 200,
  { timeout: 10000 }
);
// Verificar status volta para "Ativo" com badge verde
await expect(linhaMonit1.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]tivo/ })).toBeVisible();

// === EXCLUIR MONITORAMENTO 2 ===
const linhaMonit2 = page.locator('tr, [data-testid="monitoramento-item"]').filter({ hasText: 'ultrassonografo portatil' });
await linhaMonit2.locator('button:has-text("Excluir"), button:has-text("Remover")').click();

// Confirmar exclusao se modal de confirmacao aparecer
const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Sim")');
if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await confirmBtn.click();
}

await page.waitForResponse(
  resp => resp.url().includes('/api/captacao/monitoramento') && resp.status() === 200,
  { timeout: 10000 }
);
// Verificar que foi removido da tabela
await expect(page.locator('table, [data-testid="monitoramentos"]').locator('text=ultrassonografo portatil')).not.toBeVisible();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Abrir secao Monitoramentos | `button:has-text("Monitoramentos")` | — | Secao de monitoramentos visivel |
| 2 | Clicar "Novo Monitoramento" | `button:has-text("Novo Monitoramento")` | — | Formulario de criacao abre |
| 3 | Preencher Termo (Mon 1) | `page.getByLabel('Termo')` | `monitor multiparametrico` | Campo preenchido |
| 4 | Preencher NCM (Mon 1) | `page.getByLabel('NCM')` | `9018.19.90` | Campo preenchido |
| 5 | Marcar UFs: SP, RJ, MG | `input[value="SP"], input[value="RJ"], input[value="MG"]` | — | 3 checkboxes marcados |
| 6 | Selecionar Fonte PNCP | `select[name*="fonte"]` | `PNCP` | Opcao selecionada |
| 7 | Selecionar Frequencia 6h | `select[name*="frequencia"]` | `A cada 6 horas` | Opcao selecionada |
| 8 | Preencher Score Minimo 60 | `page.getByLabel('Score Minimo')` | `60` | Campo preenchido |
| 9 | Desmarcar Incluir Encerrados | `input[name*="encerrados"]` | — | Checkbox desmarcado |
| 10 | Salvar Mon 1 | `button:has-text("Salvar")` | — | Mon 1 na tabela com status "Ativo" |
| 11 | Clicar "Novo Monitoramento" | `button:has-text("Novo Monitoramento")` | — | Formulario de criacao abre |
| 12 | Preencher Termo (Mon 2) | `page.getByLabel('Termo')` | `ultrassonografo portatil` | Campo preenchido |
| 13 | Preencher NCM (Mon 2) | `page.getByLabel('NCM')` | `9018.19.90` | Campo preenchido |
| 14 | Marcar UFs: Todas | `input[value="Todas"]` | — | Checkbox marcado |
| 15 | Selecionar Frequencia 12h | `select[name*="frequencia"]` | `A cada 12 horas` | Opcao selecionada |
| 16 | Preencher Score Minimo 50 | `page.getByLabel('Score Minimo')` | `50` | Campo preenchido |
| 17 | Salvar Mon 2 | `button:has-text("Salvar")` | — | Mon 2 na tabela com status "Ativo" |
| 18 | Pausar Mon 1 | `button:has-text("Pausar")` na linha Mon 1 | — | Status muda para "Pausado" (badge cinza) |
| 19 | Retomar Mon 1 | `button:has-text("Retomar")` na linha Mon 1 | — | Status volta para "Ativo" (badge verde) |
| 20 | Excluir Mon 2 | `button:has-text("Excluir")` na linha Mon 2 | — | Mon 2 removido da tabela |

### Verificacoes finais (assertions)

```typescript
// Mon 1 esta ativo
const linhaFinal1 = page.locator('tr, [data-testid="monitoramento-item"]').filter({ hasText: 'monitor multiparametrico' });
await expect(linhaFinal1).toBeVisible();
await expect(linhaFinal1.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]tivo/ })).toBeVisible();

// Mon 2 foi removido
await expect(page.locator('text=ultrassonografo portatil')).not.toBeVisible();
```

> **Nota para execucao manual:** Criar os dois monitoramentos na sequencia. Verificar que ambos aparecem na tabela de monitoramentos com status "Ativo" (badge verde). Ao pausar o Mon 1, o badge deve mudar para cinza/"Pausado". Ao retomar, deve voltar para verde/"Ativo". Ao excluir o Mon 2, ele deve desaparecer completamente da tabela.

---

## [UC-CV07] Listar editais salvos

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV03 concluido (editais salvos nos 4 cenarios)
- Editais salvos disponiveis no banco de dados

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Validacao via sidebar
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);

// Aguardar lista de editais carregar
await expect(page.locator('table tbody tr, [data-testid="edital-item"]').first()).toBeVisible({ timeout: 10000 });

// === FILTRO 1: Status = Todos ===
await page.selectOption('select[name*="status"]', 'Todos');
await page.waitForTimeout(1000);
const totalTodos = await page.locator('table tbody tr, [data-testid="edital-item"]').count();
expect(totalTodos).toBeGreaterThan(0);

// === FILTRO 2: Status = Novo ===
await page.selectOption('select[name*="status"]', 'Novo');
await page.waitForTimeout(1000);
const totalNovos = await page.locator('table tbody tr, [data-testid="edital-item"]').count();
expect(totalNovos).toBeGreaterThanOrEqual(0);

// === FILTRO 3: Busca por texto "monitor" ===
await page.selectOption('select[name*="status"]', 'Todos'); // voltar para Todos
await page.getByPlaceholder('Buscar').fill('monitor');
// ou: await page.getByLabel('Buscar').fill('monitor');
await page.waitForTimeout(1000);
await expect(page.locator('table tbody tr, [data-testid="edital-item"]').first()).toContainText(/monitor/i);

// === SELECIONAR EDITAL "monitor multiparametrico" ===
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Verificar Card "Edital Info"
await expect(page.locator('[data-testid="edital-info"], .edital-info, .card').filter({ hasText: /numero|edital/i })).toBeVisible();
await expect(page.locator('[data-testid="edital-info"], .edital-info, .card')).toContainText(/orgao/i);
await expect(page.locator('[data-testid="edital-info"], .edital-info, .card')).toContainText(/objeto/i);
await expect(page.locator('[data-testid="edital-info"], .edital-info, .card')).toContainText(/valor|R\$/i);

// Verificar 6 abas visiveis
await expect(page.locator('[role="tab"]:has-text("Aderencia"), button:has-text("Aderencia")')).toBeVisible();
await expect(page.locator('[role="tab"]:has-text("Lotes"), button:has-text("Lotes")')).toBeVisible();
await expect(page.locator('[role="tab"]:has-text("Documentos"), button:has-text("Documentos")')).toBeVisible();
await expect(page.locator('[role="tab"]:has-text("Riscos"), button:has-text("Riscos")')).toBeVisible();
await expect(page.locator('[role="tab"]:has-text("Mercado"), button:has-text("Mercado")')).toBeVisible();
await expect(page.locator('[role="tab"]:has-text("IA"), button:has-text("IA")')).toBeVisible();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Validacao na sidebar | `button:has-text("Validacao")` | — | URL contem `/app/validacao` |
| 2 | Aguardar lista carregar | `table tbody tr` | — | Pelo menos 1 edital visivel |
| 3 | Filtrar Status=Todos | `select[name*="status"]` | `Todos` | Lista com todos os editais salvos |
| 4 | Filtrar Status=Novo | `select[name*="status"]` | `Novo` | Apenas editais com status "Novo" |
| 5 | Buscar por "monitor" | `page.getByPlaceholder('Buscar')` | `monitor` | Editais filtrados por "monitor" |
| 6 | Clicar no edital "monitor multiparametrico" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 7 | Verificar Numero | Card "Edital Info" | — | Numero do edital exibido |
| 8 | Verificar Orgao | Card "Edital Info" | — | Nome do orgao exibido |
| 9 | Verificar Objeto | Card "Edital Info" | — | Descricao do objeto exibida |
| 10 | Verificar Valor | Card "Edital Info" | — | Valor em R$ exibido |
| 11 | Verificar aba Aderencia | `[role="tab"]:has-text("Aderencia")` | — | Aba visivel |
| 12 | Verificar aba Lotes | `[role="tab"]:has-text("Lotes")` | — | Aba visivel |
| 13 | Verificar aba Documentos | `[role="tab"]:has-text("Documentos")` | — | Aba visivel |
| 14 | Verificar aba Riscos | `[role="tab"]:has-text("Riscos")` | — | Aba visivel |
| 15 | Verificar aba Mercado | `[role="tab"]:has-text("Mercado")` | — | Aba visivel |
| 16 | Verificar aba IA | `[role="tab"]:has-text("IA")` | — | Aba visivel |

### Verificacoes finais (assertions)

```typescript
// Card "Edital Info" com informacoes completas
await expect(page.locator('[data-testid="edital-info"], .edital-info, .card').filter({ hasText: /orgao/i })).toBeVisible();

// 6 abas visiveis
const abas = ['Aderencia', 'Lotes', 'Documentos', 'Riscos', 'Mercado', 'IA'];
for (const aba of abas) {
  await expect(page.locator(`[role="tab"]:has-text("${aba}"), button:has-text("${aba}")`)).toBeVisible();
}
```

> **Nota para execucao manual:** Apos navegar para a pagina de Validacao, verificar que a lista de editais salvos esta visivel. Testar os 3 filtros (Todos, Novo, busca por texto). Ao selecionar um edital, verificar que o Card "Edital Info" exibe numero, orgao, objeto, valor e abertura. As 6 abas (Aderencia, Lotes, Documentos, Riscos, Mercado, IA) devem estar visiveis.

---

## [UC-CV08] Calcular scores e decidir GO/NO-GO

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Aba "Aderencia" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba Aderencia
await page.click('[role="tab"]:has-text("Aderencia"), button:has-text("Aderencia")');

// Clicar "Calcular Scores IA"
await page.click('button:has-text("Calcular Scores IA")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/scores') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar 6 ScoreBars
const scoreBars = page.locator('[data-testid="score-bar"], .score-bar, [class*="ScoreBar"]');
await expect(scoreBars).toHaveCount(6, { timeout: 10000 });

// Verificar labels das 6 dimensoes
const dimensoes = ['Tecnica', 'Documental', 'Complexidade', 'Juridico', 'Logistico', 'Comercial'];
for (const dim of dimensoes) {
  await expect(page.locator(`text=${dim}`)).toBeVisible();
}

// === CENARIO GO ===
await page.click('button:has-text("Participar (GO)")');
// Botao deve ficar verde
await expect(page.locator('button:has-text("Participar (GO)")')).toHaveClass(/green|success|active/);

// Preencher justificativa GO
await page.getByLabel('Motivo').fill('Aderencia tecnica alta');
await page.getByLabel('Detalhes').fill('Produto atende 100% dos requisitos do edital, preco competitivo, empresa tem documentacao completa.');

// Salvar justificativa
await page.click('button:has-text("Salvar Justificativa"), button:has-text("Salvar")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// === CENARIO NO-GO (outro edital) ===
// Voltar para lista e selecionar outro edital
await page.getByPlaceholder('Buscar').fill('');
await page.waitForTimeout(500);
const outroEdital = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasNotText: /monitor multiparametrico/i }).first();
await outroEdital.click();

// Abrir aba Aderencia
await page.click('[role="tab"]:has-text("Aderencia"), button:has-text("Aderencia")');

// Calcular scores
await page.click('button:has-text("Calcular Scores IA")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/scores') && resp.status() === 200,
  { timeout: 120000 }
);

// Clicar "Rejeitar (NO-GO)"
await page.click('button:has-text("Rejeitar (NO-GO)")');
// Botao deve ficar vermelho
await expect(page.locator('button:has-text("Rejeitar (NO-GO)")')).toHaveClass(/red|danger|active/);

// Preencher justificativa NO-GO
await page.getByLabel('Motivo').fill('Complexidade excessiva');
await page.getByLabel('Detalhes').fill('Edital exige certificacoes que a empresa nao possui no momento.');

// Salvar justificativa
await page.click('button:has-text("Salvar Justificativa"), button:has-text("Salvar")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba Aderencia | `[role="tab"]:has-text("Aderencia")` | — | Aba ativa |
| 3 | Clicar "Calcular Scores IA" | `button:has-text("Calcular Scores IA")` | — | 6 ScoreBars aparecem |
| 4 | Verificar dimensao Tecnica | `text=Tecnica` | — | Barra e percentual visiveis |
| 5 | Verificar dimensao Documental | `text=Documental` | — | Barra e percentual visiveis |
| 6 | Verificar dimensao Complexidade | `text=Complexidade` | — | Barra e percentual visiveis |
| 7 | Verificar dimensao Juridico | `text=Juridico` | — | Barra e percentual visiveis |
| 8 | Verificar dimensao Logistico | `text=Logistico` | — | Barra e percentual visiveis |
| 9 | Verificar dimensao Comercial | `text=Comercial` | — | Barra e percentual visiveis |
| 10 | Clicar "Participar (GO)" | `button:has-text("Participar (GO)")` | — | Botao fica verde |
| 11 | Preencher Motivo | `page.getByLabel('Motivo')` | `Aderencia tecnica alta` | Campo preenchido |
| 12 | Preencher Detalhes | `page.getByLabel('Detalhes')` | `Produto atende 100% dos requisitos do edital, preco competitivo, empresa tem documentacao completa.` | Campo preenchido |
| 13 | Clicar "Salvar Justificativa" | `button:has-text("Salvar Justificativa")` | — | Toast de sucesso |
| 14 | Selecionar outro edital | Outra linha da tabela | — | Novo edital selecionado |
| 15 | Abrir aba Aderencia | `[role="tab"]:has-text("Aderencia")` | — | Aba ativa |
| 16 | Calcular Scores IA | `button:has-text("Calcular Scores IA")` | — | 6 ScoreBars aparecem |
| 17 | Clicar "Rejeitar (NO-GO)" | `button:has-text("Rejeitar (NO-GO)")` | — | Botao fica vermelho |
| 18 | Preencher Motivo | `page.getByLabel('Motivo')` | `Complexidade excessiva` | Campo preenchido |
| 19 | Preencher Detalhes | `page.getByLabel('Detalhes')` | `Edital exige certificacoes que a empresa nao possui no momento.` | Campo preenchido |
| 20 | Clicar "Salvar Justificativa" | `button:has-text("Salvar Justificativa")` | — | Toast de sucesso |

### Verificacoes finais (assertions)

```typescript
// 6 ScoreBars visiveis apos calculo
await expect(page.locator('[data-testid="score-bar"], .score-bar, [class*="ScoreBar"]')).toHaveCount(6);

// Dimensoes rotuladas
for (const dim of ['Tecnica', 'Documental', 'Complexidade', 'Juridico', 'Logistico', 'Comercial']) {
  await expect(page.locator(`text=${dim}`)).toBeVisible();
}

// Justificativa GO salva
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Justificativa NO-GO salva
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);
```

> **Nota para execucao manual:** Apos clicar "Calcular Scores IA", aguardar o processamento (pode levar ate 2 minutos). Verificar que as 6 dimensoes (Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial) aparecem com barras de progresso e percentuais. No cenario GO, o botao deve ficar verde e a justificativa deve ser salva com sucesso. No cenario NO-GO, o botao deve ficar vermelho.

---

## [UC-CV09] Importar itens e extrair lotes

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Aba "Lotes" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba Lotes
await page.click('[role="tab"]:has-text("Lotes"), button:has-text("Lotes")');

// === IMPORTAR ITENS DO PNCP ===
await page.click('button:has-text("Buscar Itens no PNCP")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/itens') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar tabela de itens populada
const tabelaItens = page.locator('table tbody tr, [data-testid="item-edital"]');
await expect(tabelaItens.first()).toBeVisible({ timeout: 10000 });
const qtdItens = await tabelaItens.count();
expect(qtdItens).toBeGreaterThan(0);

// Verificar colunas dos itens (numero, descricao, quantidade, unidade, valor)
await expect(page.locator('table thead, [data-testid="itens-header"]')).toContainText(/numero|#/i);
await expect(page.locator('table thead, [data-testid="itens-header"]')).toContainText(/descricao/i);
await expect(page.locator('table thead, [data-testid="itens-header"]')).toContainText(/qtd|quantidade/i);

// === EXTRAIR LOTES VIA IA ===
await page.click('button:has-text("Extrair Lotes via IA")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/lotes') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar lote cards
const loteCards = page.locator('[data-testid="lote-card"], .lote-card, .card').filter({ hasText: /[Ll]ote/ });
await expect(loteCards.first()).toBeVisible({ timeout: 10000 });
const qtdLotes = await loteCards.count();
expect(qtdLotes).toBeGreaterThanOrEqual(2);

// Verificar que cada lote tem titulo, valor e itens
await expect(loteCards.first()).toContainText(/[Ll]ote 1/);
await expect(loteCards.nth(1)).toContainText(/[Ll]ote 2/);

// === MOVER ITEM ENTRE LOTES ===
// Selecionar item 5 no Lote 2
const lote2 = loteCards.filter({ hasText: /[Ll]ote 2/ });
const item5 = lote2.locator('tr, [data-testid="lote-item"]').filter({ hasText: /5|[Ss]uporte|rodizio/i }).first();

// Se nao encontrar pelo texto, usar o quinto item
// Clicar "Mover para" e selecionar Lote 1
await item5.locator('select, [data-testid="mover-para"]').selectOption('Lote 1');
// ou clicar no botao "Mover para" e selecionar
// await item5.locator('button:has-text("Mover para")').click();
// await page.click('text=Lote 1');

await page.waitForTimeout(1000);

// Verificar que item aparece no Lote 1 e sumiu do Lote 2
const lote1 = loteCards.filter({ hasText: /[Ll]ote 1/ });
await expect(lote1).toContainText(/5|[Ss]uporte|rodizio/i);

// === EXCLUIR LOTE 2 ===
const botaoExcluirLote2 = lote2.locator('button:has-text("X"), button:has-text("Excluir"), [data-testid="excluir-lote"]');
await botaoExcluirLote2.click();

// Confirmar exclusao se modal aparecer
const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Sim")');
if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await confirmBtn.click();
}

await page.waitForTimeout(1000);

// Verificar que Lote 2 foi removido
await expect(page.locator('[data-testid="lote-card"], .lote-card, .card').filter({ hasText: /[Ll]ote 2/ })).not.toBeVisible();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba Lotes | `[role="tab"]:has-text("Lotes")` | — | Aba ativa |
| 3 | Clicar "Buscar Itens no PNCP" | `button:has-text("Buscar Itens no PNCP")` | — | Tabela de itens populada |
| 4 | Verificar itens na tabela | `table tbody tr` | — | Itens com numero, descricao, qtd, unidade, valor |
| 5 | Clicar "Extrair Lotes via IA" | `button:has-text("Extrair Lotes via IA")` | — | Lote cards aparecem |
| 6 | Verificar Lote 1 | Card com "Lote 1" | — | Titulo, valor e itens visiveis |
| 7 | Verificar Lote 2 | Card com "Lote 2" | — | Titulo, valor e itens visiveis |
| 8 | Selecionar item 5 no Lote 2 | Item 5 no card Lote 2 | — | Item identificado |
| 9 | Mover item 5 para Lote 1 | `select "Mover para"` no item 5 | `Lote 1` | Item movido para Lote 1 |
| 10 | Verificar item no Lote 1 | Card Lote 1 | — | Item 5 presente no Lote 1 |
| 11 | Excluir Lote 2 | `button:has-text("X")` no Lote 2 | — | Lote 2 removido |

### Verificacoes finais (assertions)

```typescript
// Itens importados do PNCP
const itens = page.locator('table tbody tr, [data-testid="item-edital"]');
expect(await itens.count()).toBeGreaterThan(0);

// Lotes extraidos via IA
const lotes = page.locator('[data-testid="lote-card"], .lote-card, .card').filter({ hasText: /[Ll]ote/ });
expect(await lotes.count()).toBeGreaterThanOrEqual(1);

// Lote 2 removido
await expect(page.locator('[data-testid="lote-card"], .lote-card, .card').filter({ hasText: /[Ll]ote 2/ })).not.toBeVisible();
```

> **Nota para execucao manual:** Ao clicar "Buscar Itens no PNCP", a tabela deve ser populada com os itens reais do edital (os itens variam conforme o edital). Ao clicar "Extrair Lotes via IA", os itens devem ser agrupados em lotes. Mover o item 5 do Lote 2 para o Lote 1 usando o select "Mover para". Excluir o Lote 2 clicando no icone "X" do card.

---

## [UC-CV10] Confrontar documentacao

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Documentos da Sprint 1 cadastrados (empresa, certidoes)
- Aba "Documentos" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba Documentos
await page.click('[role="tab"]:has-text("Documentos"), button:has-text("Documentos")');

// Verificar categorias carregadas com badges
await expect(page.locator('text=Habilitacao Juridica')).toBeVisible({ timeout: 10000 });
await expect(page.locator('text=Regularidade Fiscal')).toBeVisible();
await expect(page.locator('text=Qualificacao Tecnica')).toBeVisible();
await expect(page.locator('text=Economica, text=Qualificacao Economica')).toBeVisible();
await expect(page.locator('text=Outros')).toBeVisible();

// Verificar badges de status em cada categoria
const badges = page.locator('.badge, [class*="badge"]');
await expect(badges.first()).toBeVisible();

// === IDENTIFICAR DOCUMENTOS EXIGIDOS PELO EDITAL ===
await page.click('button:has-text("Identificar Documentos Exigidos pelo Edital")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/documentos') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar checklist de documentos
await expect(page.locator('[data-testid="checklist-doc"], .checklist, table').filter({ hasText: /[Aa]tendido|[Pp]endente|[Vv]encido/ })).toBeVisible({ timeout: 10000 });

// === BUSCAR DOCUMENTOS EXIGIDOS ===
await page.click('button:has-text("Buscar Documentos Exigidos")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/documentos') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar resposta sobre documentos exigidos
await expect(page.locator('[data-testid="chat-resposta"], .chat-resposta, .resposta')).toBeVisible({ timeout: 10000 });

// === VERIFICAR CERTIDOES ===
await page.click('button:has-text("Verificar Certidoes")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/certidoes') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar que o status das certidoes foi atualizado
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]tendido|[Pp]endente|[Vv]encido|[Vv]alido/ })).toBeVisible();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba Documentos | `[role="tab"]:has-text("Documentos")` | — | Aba ativa |
| 3 | Verificar Habilitacao Juridica | `text=Habilitacao Juridica` | — | Categoria visivel com badge |
| 4 | Verificar Regularidade Fiscal | `text=Regularidade Fiscal` | — | Categoria visivel com badge |
| 5 | Verificar Qualificacao Tecnica | `text=Qualificacao Tecnica` | — | Categoria visivel com badge |
| 6 | Verificar Qualificacao Economica | `text=Economica` | — | Categoria visivel com badge |
| 7 | Verificar Outros | `text=Outros` | — | Categoria visivel com badge |
| 8 | Clicar "Identificar Documentos Exigidos pelo Edital" | `button:has-text("Identificar Documentos Exigidos pelo Edital")` | — | Checklist de documentos com status |
| 9 | Verificar checklist | Checklist area | — | Status: Atendido / Pendente / Vencido |
| 10 | Clicar "Buscar Documentos Exigidos" | `button:has-text("Buscar Documentos Exigidos")` | — | Resposta com lista de documentos |
| 11 | Clicar "Verificar Certidoes" | `button:has-text("Verificar Certidoes")` | — | Status de certidoes atualizado |

### Verificacoes finais (assertions)

```typescript
// 5 categorias de documentos visiveis
await expect(page.locator('text=Habilitacao Juridica')).toBeVisible();
await expect(page.locator('text=Regularidade Fiscal')).toBeVisible();
await expect(page.locator('text=Qualificacao Tecnica')).toBeVisible();
await expect(page.locator('text=Economica')).toBeVisible();
await expect(page.locator('text=Outros')).toBeVisible();

// Checklist com status
await expect(page.locator('[data-testid="checklist-doc"], .checklist, table').filter({ hasText: /[Aa]tendido|[Pp]endente|[Vv]encido/ })).toBeVisible();

// Certidoes verificadas
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]tendido|[Vv]alido/ })).toBeVisible();
```

> **Nota para execucao manual:** Ao abrir a aba Documentos, as 5 categorias devem aparecer com badges indicando status. Clicar "Identificar Documentos Exigidos pelo Edital" para que a IA extraia os requisitos do PDF. Clicar "Buscar Documentos Exigidos" para abrir um chat com a lista de documentos necessarios. Clicar "Verificar Certidoes" para revalidar o status das certidoes da empresa.

---

## [UC-CV11] Analisar riscos, atas, concorrentes

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Aba "Riscos" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba Riscos
await page.click('[role="tab"]:has-text("Riscos"), button:has-text("Riscos")');

// === ANALISAR RISCOS DO EDITAL ===
await page.click('button:has-text("Analisar Riscos do Edital")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/riscos') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar categorias de risco
await expect(page.locator('text=Juridico')).toBeVisible({ timeout: 10000 });
await expect(page.locator('text=Tecnico')).toBeVisible();
await expect(page.locator('text=Financeiro')).toBeVisible();
await expect(page.locator('text=Logistico')).toBeVisible();

// Verificar severidades
const severidades = page.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]lto|[Mm]edio|[Bb]aixo/ });
await expect(severidades.first()).toBeVisible();

// Verificar secao Fatal Flaws
const fatalFlaws = page.locator('[data-testid="fatal-flaws"], .fatal-flaws, text=Fatal Flaws, text=Risco eliminatorio, text=Nenhum risco eliminatorio');
await expect(fatalFlaws).toBeVisible();

// === REBUSCAR ATAS ===
await page.click('button:has-text("Rebuscar Atas")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/atas') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar lista de atas
const listaAtas = page.locator('[data-testid="atas-list"], .atas-list, table').filter({ hasText: /ata|titulo/i });
await expect(listaAtas).toBeVisible({ timeout: 10000 });

// Verificar badge de recorrencia
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Ss]emestral|[Aa]nual|[Ee]sporadica/ })).toBeVisible();

// === BUSCAR VENCEDORES E PRECOS ===
await page.click('button:has-text("Buscar Vencedores e Precos")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/vencedores') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar tabela de vencedores
await expect(page.locator('table, [data-testid="vencedores"]').filter({ hasText: /[Vv]encedor|[Hh]omologado/ })).toBeVisible({ timeout: 10000 });

// === ATUALIZAR CONCORRENTES ===
await page.click('button:has-text("Atualizar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/concorrentes') && resp.status() === 200,
  { timeout: 60000 }
);

// Verificar tabela de concorrentes
await expect(page.locator('table, [data-testid="concorrentes"]').filter({ hasText: /[Cc]oncorrente|[Pp]articipacoes|[Vv]itorias/ })).toBeVisible({ timeout: 10000 });
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba Riscos | `[role="tab"]:has-text("Riscos")` | — | Aba ativa |
| 3 | Clicar "Analisar Riscos do Edital" | `button:has-text("Analisar Riscos do Edital")` | — | Riscos categorizados aparecem |
| 4 | Verificar categoria Juridico | `text=Juridico` | — | Riscos juridicos listados |
| 5 | Verificar categoria Tecnico | `text=Tecnico` | — | Riscos tecnicos listados |
| 6 | Verificar categoria Financeiro | `text=Financeiro` | — | Riscos financeiros listados |
| 7 | Verificar categoria Logistico | `text=Logistico` | — | Riscos logisticos listados |
| 8 | Verificar severidades | `.badge` com Alto/Medio/Baixo | — | Badges de severidade visiveis |
| 9 | Verificar Fatal Flaws | Secao Fatal Flaws | — | Badge vermelho ou mensagem "Nenhum risco eliminatorio" |
| 10 | Clicar "Rebuscar Atas" | `button:has-text("Rebuscar Atas")` | — | Lista de atas visivel |
| 11 | Verificar atas | Lista de atas | — | Titulo, orgao, UF, data visiveis |
| 12 | Verificar badge recorrencia | `.badge` | — | Semestral / Anual / Esporadica |
| 13 | Clicar "Buscar Vencedores e Precos" | `button:has-text("Buscar Vencedores e Precos")` | — | Tabela com Item, Vencedor, Vlr Estimado, Vlr Homologado, Desconto % |
| 14 | Clicar "Atualizar" concorrentes | `button:has-text("Atualizar")` | — | Tabela com Concorrente, Participacoes, Vitorias, Taxa (%) |

### Verificacoes finais (assertions)

```typescript
// Riscos categorizados
for (const cat of ['Juridico', 'Tecnico', 'Financeiro', 'Logistico']) {
  await expect(page.locator(`text=${cat}`)).toBeVisible();
}

// Severidades presentes
await expect(page.locator('.badge, [class*="badge"]').filter({ hasText: /[Aa]lto|[Mm]edio|[Bb]aixo/ }).first()).toBeVisible();

// Fatal Flaws verificado
await expect(page.locator('text=Fatal Flaws, text=Risco eliminatorio, text=Nenhum risco eliminatorio')).toBeVisible();

// Atas listadas
await expect(page.locator('[data-testid="atas-list"], .atas-list, table').filter({ hasText: /ata|titulo/i })).toBeVisible();

// Vencedores listados
await expect(page.locator('table, [data-testid="vencedores"]').filter({ hasText: /[Vv]encedor/ })).toBeVisible();

// Concorrentes listados
await expect(page.locator('table, [data-testid="concorrentes"]').filter({ hasText: /[Cc]oncorrente/ })).toBeVisible();
```

> **Nota para execucao manual:** Ao clicar "Analisar Riscos do Edital", aguardar o processamento da IA. Verificar que os riscos sao agrupados por categoria (Juridico, Tecnico, Financeiro, Logistico) com severidades (Alto, Medio, Baixo). Na secao Fatal Flaws, verificar se ha riscos eliminatorios (badge vermelho) ou mensagem "Nenhum risco eliminatorio". Ao clicar "Rebuscar Atas", verificar lista de atas com badge de recorrencia. Ao clicar "Buscar Vencedores e Precos", verificar tabela com dados historicos. Ao clicar "Atualizar" na secao de concorrentes, verificar tabela atualizada.

---

## [UC-CV12] Analisar mercado

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Aba "Mercado" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba Mercado
await page.click('[role="tab"]:has-text("Mercado"), button:has-text("Mercado")');

// === ANALISAR MERCADO DO ORGAO ===
await page.click('button:has-text("Analisar Mercado do Orgao")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/mercado') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar secao "Dados do Orgao"
await expect(page.locator('text=Nome, text=Dados do Orgao')).toBeVisible({ timeout: 10000 });
await expect(page.locator('text=CNPJ')).toBeVisible();
await expect(page.locator('text=UF')).toBeVisible();

// Verificar secao "Reputacao" (6 indicadores)
const indicadoresReputacao = ['Esfera', 'Risco Pagamento', 'Volume', 'Modalidade Principal', 'Pregao', 'Editais Similares'];
for (const ind of indicadoresReputacao) {
  await expect(page.locator(`text=${ind}`)).toBeVisible();
}

// Verificar secao "Volume PNCP" (3 cards)
await expect(page.locator('text=Compras encontradas')).toBeVisible();
await expect(page.locator('text=Valor total')).toBeVisible();
await expect(page.locator('text=Valor medio')).toBeVisible();

// Verificar "Compras Similares"
await expect(page.locator('text=Compras Similares')).toBeVisible();
const comprasSimilares = page.locator('[data-testid="compras-similares"], .compras-similares').locator('tr, [data-testid="compra-item"]');
await expect(comprasSimilares.first()).toBeVisible();

// Verificar "Historico Interno"
await expect(page.locator('text=Historico Interno')).toBeVisible();
const badgesHistorico = page.locator('[data-testid="historico-interno"], .historico-interno').locator('.badge, [class*="badge"]');
await expect(badgesHistorico.first()).toBeVisible();

// Verificar "Analise IA"
await expect(page.locator('text=Analise IA')).toBeVisible();
const textoAnalise = page.locator('[data-testid="analise-ia"], .analise-ia, .analise');
await expect(textoAnalise).toBeVisible();
await expect(textoAnalise).not.toBeEmpty();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba Mercado | `[role="tab"]:has-text("Mercado")` | — | Aba ativa |
| 3 | Clicar "Analisar Mercado do Orgao" | `button:has-text("Analisar Mercado do Orgao")` | — | Analise de mercado carregada |
| 4 | Verificar Nome do orgao | Secao "Dados do Orgao" | — | Nome preenchido |
| 5 | Verificar CNPJ | Secao "Dados do Orgao" | — | CNPJ preenchido |
| 6 | Verificar UF | Secao "Dados do Orgao" | — | UF preenchida |
| 7 | Verificar Esfera | Secao "Reputacao" | — | Indicador preenchido |
| 8 | Verificar Risco Pagamento | Secao "Reputacao" | — | Indicador preenchido |
| 9 | Verificar Volume | Secao "Reputacao" | — | Indicador preenchido |
| 10 | Verificar Modalidade Principal | Secao "Reputacao" | — | Indicador preenchido |
| 11 | Verificar % Pregao | Secao "Reputacao" | — | Indicador preenchido |
| 12 | Verificar Editais Similares | Secao "Reputacao" | — | Indicador preenchido |
| 13 | Verificar Compras encontradas | Secao "Volume PNCP" | — | Card com valor numerico |
| 14 | Verificar Valor total | Secao "Volume PNCP" | — | Card com valor em R$ |
| 15 | Verificar Valor medio | Secao "Volume PNCP" | — | Card com valor em R$ |
| 16 | Verificar Compras Similares | Secao "Compras Similares" | — | Lista com objeto, valor, data, modalidade |
| 17 | Verificar Historico Interno | Secao "Historico Interno" | — | Badges: Total editais, GO, NO-GO, Em Avaliacao |
| 18 | Verificar Analise IA | Secao "Analise IA" | — | Texto analitico longo sobre o orgao |

### Verificacoes finais (assertions)

```typescript
// Dados do Orgao preenchidos
await expect(page.locator('text=CNPJ')).toBeVisible();
await expect(page.locator('text=UF')).toBeVisible();

// 6 indicadores de reputacao
for (const ind of ['Esfera', 'Risco Pagamento', 'Volume', 'Modalidade Principal', 'Pregao', 'Editais Similares']) {
  await expect(page.locator(`text=${ind}`)).toBeVisible();
}

// 3 cards de Volume PNCP
await expect(page.locator('text=Compras encontradas')).toBeVisible();
await expect(page.locator('text=Valor total')).toBeVisible();
await expect(page.locator('text=Valor medio')).toBeVisible();

// Compras Similares com itens
await expect(page.locator('[data-testid="compras-similares"], .compras-similares').locator('tr, [data-testid="compra-item"]').first()).toBeVisible();

// Historico Interno com badges
await expect(page.locator('[data-testid="historico-interno"], .historico-interno').locator('.badge').first()).toBeVisible();

// Analise IA nao vazia
await expect(page.locator('[data-testid="analise-ia"], .analise-ia, .analise')).not.toBeEmpty();
```

> **Nota para execucao manual:** Ao clicar "Analisar Mercado do Orgao", aguardar o processamento (busca PNCP + analise IA). Verificar que as 6 secoes estao preenchidas: Dados do Orgao (Nome, CNPJ, UF), Reputacao (6 indicadores), Volume PNCP (3 cards numericos), Compras Similares (lista), Historico Interno (badges com contadores) e Analise IA (texto descritivo longo).

---

## [UC-CV13] IA resumo e perguntas

**Pagina:** `ValidacaoPage` — rota `/app/validacao`
**Pre-condicoes:**
- UC-CV07 concluido (edital "monitor multiparametrico" selecionado)
- Aba "IA" acessivel

---

### Sequencia de Automacao

```typescript
// Navegar para Validacao e selecionar edital
await page.click('button:has-text("Validacao")');
await expect(page).toHaveURL(/\/app\/validacao/);
await page.getByPlaceholder('Buscar').fill('monitor');
await page.waitForTimeout(1000);
const linhaMonitor = page.locator('table tbody tr, [data-testid="edital-item"]').filter({ hasText: /monitor/i }).first();
await linhaMonitor.click();

// Abrir aba IA
await page.click('[role="tab"]:has-text("IA"), button:has-text("IA")');

// === GERAR RESUMO ===
await page.click('button:has-text("Gerar Resumo")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 120000 }
);

// Verificar resumo em markdown
const resumo = page.locator('[data-testid="resumo-ia"], .resumo-ia, .resumo, .markdown');
await expect(resumo).toBeVisible({ timeout: 10000 });
await expect(resumo).not.toBeEmpty();
// Verificar que contem secoes tipicas de markdown
await expect(resumo).toContainText(/\w+/); // conteudo nao vazio

// === PERGUNTAR A IA — Pergunta 1 ===
await page.getByPlaceholder('Pergunte sobre o edital').fill('Qual o prazo de entrega exigido?');
await page.click('button:has-text("Enviar"), button:has-text("Perguntar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('[data-testid="resposta-ia"], .resposta-ia, .resposta').last()).toContainText(/prazo|entrega|dias/i, { timeout: 10000 });

// === PERGUNTAR A IA — Pergunta 2 ===
await page.getByPlaceholder('Pergunte sobre o edital').fill('O edital exige registro ANVISA?');
await page.click('button:has-text("Enviar"), button:has-text("Perguntar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('[data-testid="resposta-ia"], .resposta-ia, .resposta').last()).toContainText(/ANVISA|registro|classe/i, { timeout: 10000 });

// === PERGUNTAR A IA — Pergunta 3 ===
await page.getByPlaceholder('Pergunte sobre o edital').fill('Quais sao as garantias exigidas?');
await page.click('button:has-text("Enviar"), button:has-text("Perguntar")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('[data-testid="resposta-ia"], .resposta-ia, .resposta').last()).toContainText(/garantia|execucao|proposta/i, { timeout: 10000 });

// === ACOES RAPIDAS — Requisitos Tecnicos ===
await page.click('button:has-text("Requisitos Tecnicos")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('[data-testid="requisitos-tecnicos"], .requisitos-tecnicos, .requisitos')).toBeVisible({ timeout: 10000 });
// Verificar que contem uma lista de requisitos
await expect(page.locator('[data-testid="requisitos-tecnicos"], .requisitos-tecnicos, .requisitos')).toContainText(/\w+/);

// === ACOES RAPIDAS — Classificar Edital ===
await page.click('button:has-text("Classificar Edital")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 60000 }
);
await expect(page.locator('[data-testid="classificacao-edital"], .classificacao-edital, .classificacao')).toBeVisible({ timeout: 10000 });
// Verificar tipo de classificacao
await expect(page.locator('[data-testid="classificacao-edital"], .classificacao-edital, .classificacao')).toContainText(/[Vv]enda|[Cc]omodato|[Aa]luguel|[Cc]onsumo|[Ss]ervico/);

// === REGERAR RESUMO ===
await page.click('button:has-text("Regerar Resumo")');
await page.waitForResponse(
  resp => resp.url().includes('/api/validacao/ia') && resp.status() === 200,
  { timeout: 120000 }
);
// Verificar que o resumo foi atualizado
await expect(resumo).toBeVisible();
await expect(resumo).not.toBeEmpty();
```

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital "monitor" | Linha com texto "monitor" | — | Card "Edital Info" visivel |
| 2 | Abrir aba IA | `[role="tab"]:has-text("IA")` | — | Aba ativa |
| 3 | Clicar "Gerar Resumo" | `button:has-text("Gerar Resumo")` | — | Resumo em markdown visivel |
| 4 | Verificar conteudo do resumo | `[data-testid="resumo-ia"]` | — | Texto com secoes, paragrafos, listas |
| 5 | Digitar pergunta 1 | `page.getByPlaceholder('Pergunte sobre o edital')` | `Qual o prazo de entrega exigido?` | Campo preenchido |
| 6 | Clicar "Enviar" | `button:has-text("Enviar")` | — | Resposta sobre prazo/entrega/dias |
| 7 | Digitar pergunta 2 | `page.getByPlaceholder('Pergunte sobre o edital')` | `O edital exige registro ANVISA?` | Campo preenchido |
| 8 | Clicar "Enviar" | `button:has-text("Enviar")` | — | Resposta sobre ANVISA/registro/classe |
| 9 | Digitar pergunta 3 | `page.getByPlaceholder('Pergunte sobre o edital')` | `Quais sao as garantias exigidas?` | Campo preenchido |
| 10 | Clicar "Enviar" | `button:has-text("Enviar")` | — | Resposta sobre garantia/execucao/proposta |
| 11 | Clicar "Requisitos Tecnicos" | `button:has-text("Requisitos Tecnicos")` | — | Lista de requisitos tecnicos visivel |
| 12 | Clicar "Classificar Edital" | `button:has-text("Classificar Edital")` | — | Classificacao: Venda/Comodato/Aluguel/Consumo/Servico |
| 13 | Clicar "Regerar Resumo" | `button:has-text("Regerar Resumo")` | — | Resumo atualizado (pode variar do anterior) |

### Verificacoes finais (assertions)

```typescript
// Resumo gerado
const resumo = page.locator('[data-testid="resumo-ia"], .resumo-ia, .resumo, .markdown');
await expect(resumo).toBeVisible();
await expect(resumo).not.toBeEmpty();

// 3 perguntas respondidas
const respostas = page.locator('[data-testid="resposta-ia"], .resposta-ia, .resposta');
expect(await respostas.count()).toBeGreaterThanOrEqual(3);

// Requisitos tecnicos listados
await expect(page.locator('[data-testid="requisitos-tecnicos"], .requisitos-tecnicos, .requisitos')).toBeVisible();

// Classificacao do edital
await expect(page.locator('[data-testid="classificacao-edital"], .classificacao-edital, .classificacao')).toContainText(/[Vv]enda|[Cc]omodato|[Aa]luguel|[Cc]onsumo|[Ss]ervico/);

// Resumo regenerado (visivel e nao vazio)
await expect(resumo).toBeVisible();
```

> **Nota para execucao manual:** Ao clicar "Gerar Resumo", aguardar a IA processar e exibir o resumo em formato markdown com secoes e listas. Fazer as 3 perguntas sequencialmente, verificando que cada resposta e relevante. Clicar "Requisitos Tecnicos" para ver a lista extraida do edital. Clicar "Classificar Edital" para ver a classificacao com justificativa (Venda, Comodato, Aluguel, Consumo ou Servico). Clicar "Regerar Resumo" para obter uma nova versao do resumo.

---

## Dependencias entre UCs

| UC | Depende de |
|----|-----------|
| UC-CV01 | — (pre-condicao: Sprint 1 concluida, dados cadastrados) |
| UC-CV02 | UC-CV01 (resultados de busca) |
| UC-CV03 | UC-CV01 / UC-CV02 (resultados para salvar) |
| UC-CV04 | UC-CV03 (edital salvo) |
| UC-CV05 | UC-CV01 (resultados de busca) |
| UC-CV06 | — (independente; conexao internet para PNCP) |
| UC-CV07 | UC-CV03 (editais salvos) |
| UC-CV08 | UC-CV07 (edital selecionado) |
| UC-CV09 | UC-CV07 (edital selecionado) |
| UC-CV10 | UC-CV07 (edital selecionado) + Sprint 1 (documentos cadastrados) |
| UC-CV11 | UC-CV07 (edital selecionado) |
| UC-CV12 | UC-CV07 (edital selecionado) |
| UC-CV13 | UC-CV07 (edital selecionado) |

---

## Ordem de Execucao Recomendada

```
1.  UC-CV01  — Buscar editais por termo, classificacao e score
2.  UC-CV02  — Explorar resultados e painel lateral
3.  UC-CV03  — Salvar edital, itens e scores
4.  UC-CV04  — Definir estrategia
5.  UC-CV05  — Exportar e consolidar
6.  UC-CV06  — Gerir monitoramentos
7.  UC-CV07  — Listar editais salvos
8.  UC-CV08  — Calcular scores e decidir GO/NO-GO
9.  UC-CV09  — Importar itens e extrair lotes
10. UC-CV10  — Confrontar documentacao
11. UC-CV11  — Analisar riscos, atas, concorrentes
12. UC-CV12  — Analisar mercado
13. UC-CV13  — IA resumo e perguntas
```

---

## Fixtures Necessarios

| Fixture | Caminho | Uso |
|---------|---------|-----|
| Documento PDF generico | `tests/fixtures/test_document.pdf` | UC-CV09 (se upload necessario), UC-CV10 |
| Imagem de teste (opcional) | `tests/fixtures/test_image.png` | Substituto em caso de upload de imagem |

**Verificar existencia dos fixtures antes de executar:**

```typescript
import * as fs from 'fs';

test.beforeAll(() => {
  const fixtures = [
    'tests/fixtures/test_document.pdf',
    'tests/fixtures/test_image.png',
  ];
  for (const f of fixtures) {
    if (!fs.existsSync(f)) {
      throw new Error(`Fixture ausente: ${f}`);
    }
  }
});
```

**Credenciais de autenticacao:**
- Usuario: `valida1@valida.com.br` / Senha: `123456`
- ID fixo da CH Hospitalar no banco: `7dbdc60a-b806-4614-a024-a1d4841dc8c9`
- O helper `login()` ja lida automaticamente com a tela de selecao de empresa.

**URL base:**
- Backend: `http://localhost:5007`
- Frontend: `http://localhost:5175`
- Configurar em `playwright.config.ts`: `baseURL: 'http://localhost:5175'`
