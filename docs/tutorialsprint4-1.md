# Tutorial de Validacao — Sprint 4 — Conjunto 1
# Empresa: CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.

**Data:** 08/04/2026
**Dados:** dadosrecursimp-1.md
**Referencia:** CASOS DE USO RECURSOS E IMPUGNACOES V2.md
**UCs:** I01-I05, RE01-RE06, FU01-FU03 (14 casos de uso)
**Publico:** Validador Automatizado (Playwright) e Dono do Produto

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| URL | `http://pasteurjr.servehttp.com:5179` |
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

### Menus extras visiveis (superusuario)
- **Usuarios** — CRUD de usuarios do sistema
- **Associar Empresa/Usuario** — vincular usuarios a empresas
- **Selecionar Empresa** — trocar empresa ativa

> Esses menus nao aparecem para usuarios normais (super=False).

### Pre-requisito: Dados das Sprints 1, 2 e 3

Os dados de empresa, portfolio, parametrizacoes (Sprint 1), captacao e validacao (Sprint 2) e precificacao e proposta (Sprint 3) devem estar cadastrados antes de executar os testes da Sprint 4. Os editais e produtos relevantes sao:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Monitor Multiparametrico Mindray iMEC10 Plus | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |
| Ultrassonografo Portatil Mindray M7T | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |

**Edital de referencia:** edital salvo na Sprint 2 (UC-CV03) contendo "monitor multiparametrico" ou "equipamento hospitalar" no objeto, com status GO definido na Sprint 2 (UC-CV08).

---

## Indice

1. [UC-I01 — Validacao Legal do Edital](#uc-i01)
2. [UC-I02 — Sugerir Esclarecimento ou Impugnacao](#uc-i02)
3. [UC-I03 — Gerar Peticao de Impugnacao](#uc-i03)
4. [UC-I04 — Upload de Peticao Externa](#uc-i04)
5. [UC-I05 — Controle de Prazo](#uc-i05)
6. [UC-RE01 — Monitorar Janela de Recurso](#uc-re01)
7. [UC-RE02 — Analisar Proposta Vencedora](#uc-re02)
8. [UC-RE03 — Chatbox de Analise](#uc-re03)
9. [UC-RE04 — Gerar Laudo de Recurso](#uc-re04)
10. [UC-RE05 — Gerar Laudo de Contra-Razao](#uc-re05)
11. [UC-RE06 — Submissao Assistida no Portal](#uc-re06)
12. [UC-FU01 — Registrar Resultado de Edital](#uc-fu01)
13. [UC-FU02 — Configurar Alertas de Vencimento](#uc-fu02)
14. [UC-FU03 — Score Logistico](#uc-fu03)
15. [Dependencias entre UCs](#dependencias-entre-ucs)
16. [Ordem de Execucao Recomendada](#ordem-de-execucao-recomendada)
17. [Fixtures Necessarios](#fixtures-necessarios)

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## [UC-I01] Validacao Legal do Edital

**Pagina:** `ImpugnacaoPage` — rota `/app/impugnacao`
**Pre-condicoes:**
- Usuario autenticado no sistema (valida1@valida.com.br, empresa: CH Hospitalar)
- Edital de "monitor multiparametrico" salvo na Sprint 2 (UC-CV03) com status GO
- Sidebar expandida na secao "Impugnacao"

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Impugnacao via sidebar
await page.click('button:has-text("Impugnacao")');
await expect(page).toHaveURL(/\/app\/impugnacao/);

// Clicar na aba "Validacao Legal" (primeira aba)
await page.click('button:has-text("Validacao Legal")');

// Selecionar edital de "monitor multiparametrico"
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Clicar no botao "Analisar Edital"
await page.click('button:has-text("Analisar Edital")');

// Aguardar processamento da IA (analise clausula por clausula)
await page.waitForSelector('text=Resultado da Analise', { timeout: 120000 });

// Verificar que a tabela de inconsistencias foi gerada
await expect(page.locator('table')).toBeVisible();

// Verificar badges de gravidade
await expect(page.locator('text=ALTA').first()).toBeVisible();
await expect(page.locator('text=MEDIA').first()).toBeVisible();

// Verificar badges de sugestao
await expect(page.locator('text=Impugnacao').first()).toBeVisible();
await expect(page.locator('text=Esclarecimento').first()).toBeVisible();
```

### Inconsistencias Esperadas (tipicas de edital de equipamento medico)

| # | Trecho do Edital | Lei Violada | Gravidade | Sugestao |
|---|---|---|---|---|
| 1 | "O equipamento devera ser da marca X ou similar" | Art. 41, Lei 14.133/2021 — Vedacao a direcionamento por marca | ALTA | Impugnacao |
| 2 | "Exige-se experiencia minima de 10 anos no fornecimento" | Art. 67, SS 1o, Lei 14.133/2021 — Qualificacao tecnica proporcional | ALTA | Impugnacao |
| 3 | "Prazo de entrega de 5 dias corridos para todo o territorio nacional" | Art. 40, XI, Lei 14.133/2021 — Condicoes incompativeis com o objeto | MEDIA | Esclarecimento |
| 4 | "Amostra devera ser entregue no prazo de 24 horas apos convocacao" | Art. 17, SS 3o, Lei 14.133/2021 — Prazo exiguo para amostra | MEDIA | Esclarecimento |
| 5 | "Registro ANVISA Classe III obrigatorio para monitor de sinais vitais" | Resolucao RDC 185/2001 — Classificacao de risco adequada | BAIXA | Esclarecimento |
| 6 | "Pagamento em 90 dias apos o aceite definitivo" | Art. 141, III, Lei 14.133/2021 — Prazo de pagamento excessivo | MEDIA | Impugnacao |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Impugnacao na sidebar | `button:has-text("Impugnacao")` | — | URL contem `/app/impugnacao` |
| 2 | Clicar na aba Validacao Legal | `button:has-text("Validacao Legal")` | — | Aba ativa |
| 3 | Selecionar edital | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 4 | Clicar Analisar Edital | `button:has-text("Analisar Edital")` | — | Spinner de processamento visivel |
| 5 | Aguardar resultado | `text=Resultado da Analise` | — | Card de resultado exibido |
| 6 | Verificar tabela de inconsistencias | `table` | — | Tabela com colunas #, Trecho, Lei Violada, Gravidade, Sugestao |
| 7 | Verificar badge ALTA | `text=ALTA` | — | Badge vermelho visivel |
| 8 | Verificar badge MEDIA | `text=MEDIA` | — | Badge amarelo visivel |
| 9 | Verificar badge BAIXA | `text=BAIXA` | — | Badge verde visivel |
| 10 | Verificar sugestao Impugnacao | `text=Impugnacao` | — | Badge error visivel |
| 11 | Verificar sugestao Esclarecimento | `text=Esclarecimento` | — | Badge info visivel |

### Verificacoes finais (assertions)

```typescript
// Verificar card de resultado
await expect(page.locator('text=Resultado da Analise')).toBeVisible();

// Verificar que a tabela tem pelo menos 3 linhas de inconsistencia
const rows = page.locator('table tbody tr');
await expect(rows).toHaveCount({ minimum: 3 });

// Verificar presenca de badges de gravidade
await expect(page.locator('.badge:has-text("ALTA"), [class*="badge"]:has-text("ALTA")').first()).toBeVisible();
await expect(page.locator('.badge:has-text("MEDIA"), [class*="badge"]:has-text("MEDIA")').first()).toBeVisible();
```

> **Nota para execucao manual:** Conferir que o card "Resultado da Analise" aparece apos o processamento, com a tabela de inconsistencias exibindo cada linha com trecho do edital, lei violada, gravidade (com badge colorido) e sugestao (Impugnacao ou Esclarecimento).

---

## [UC-I02] Sugerir Esclarecimento ou Impugnacao

**Pagina:** `ImpugnacaoPage` — rota `/app/impugnacao`
**Pre-condicoes:**
- UC-I01 concluido com sucesso (analise do edital com inconsistencias listadas)
- Tabela de inconsistencias visivel na aba Validacao Legal

---

### Sequencia de Automacao

```typescript
// Pre-condicao: resultado do UC-I01 visivel na tela

// Verificar que cada inconsistencia tem sugestao de tipo
await expect(page.locator('table tbody tr').first()).toContainText(/Impugnacao|Esclarecimento/);

// Alterar tipo da inconsistencia 3 de "Esclarecimento" para "Impugnacao"
const row3 = page.locator('table tbody tr').nth(2);
await row3.locator('select, [role="combobox"]').selectOption('Impugnacao');
// Alternativa se for botao toggle:
// await row3.locator('button:has-text("Esclarecimento")').click();
// await row3.locator('text=Impugnacao').click();

// Verificar que o tipo foi atualizado
await expect(row3).toContainText('Impugnacao');

// Selecionar inconsistencias 1, 2 e 6 para gerar peticao de impugnacao
await page.locator('table tbody tr').nth(0).locator('input[type="checkbox"]').check();
await page.locator('table tbody tr').nth(1).locator('input[type="checkbox"]').check();
await page.locator('table tbody tr').nth(5).locator('input[type="checkbox"]').check();

// Clicar "Gerar Peticao" — navega para aba Peticoes
await page.click('button:has-text("Gerar Peticao")');
await expect(page.locator('text=Peticoes')).toBeVisible();
```

### Criterios de Classificacao

| Inconsistencia | Tipo Sugerido | Justificativa |
|---|---|---|
| Direcionamento por marca (item 1) | Impugnacao | Violacao direta de principio da competitividade |
| Experiencia de 10 anos (item 2) | Impugnacao | Restricao desproporcional ao objeto |
| Prazo de entrega 5 dias (item 3) | Esclarecimento | Pode haver justificativa tecnica |
| Amostra em 24h (item 4) | Esclarecimento | Solicitar adequacao do prazo |
| Classificacao ANVISA (item 5) | Esclarecimento | Verificar se a classificacao esta correta |
| Pagamento 90 dias (item 6) | Impugnacao | Prazo abusivo, viola lei |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Verificar sugestoes de tipo | `table tbody tr` | — | Cada linha tem tipo Impugnacao ou Esclarecimento |
| 2 | Alterar tipo da inconsistencia 3 | `table tbody tr:nth(2) select` | "Impugnacao" | Tipo atualizado para Impugnacao |
| 3 | Verificar alteracao | `table tbody tr:nth(2)` | — | Contem texto "Impugnacao" |
| 4 | Marcar checkbox inconsistencia 1 | `table tbody tr:nth(0) input[type="checkbox"]` | — | Checkbox marcado |
| 5 | Marcar checkbox inconsistencia 2 | `table tbody tr:nth(1) input[type="checkbox"]` | — | Checkbox marcado |
| 6 | Marcar checkbox inconsistencia 6 | `table tbody tr:nth(5) input[type="checkbox"]` | — | Checkbox marcado |
| 7 | Clicar Gerar Peticao | `button:has-text("Gerar Peticao")` | — | Navega para aba Peticoes |

### Verificacoes finais (assertions)

```typescript
// Verificar que a inconsistencia 3 foi alterada para Impugnacao
const row3 = page.locator('table tbody tr').nth(2);
await expect(row3).toContainText('Impugnacao');

// Verificar que 3 checkboxes estao marcados
await expect(page.locator('table tbody tr').nth(0).locator('input[type="checkbox"]')).toBeChecked();
await expect(page.locator('table tbody tr').nth(1).locator('input[type="checkbox"]')).toBeChecked();
await expect(page.locator('table tbody tr').nth(5).locator('input[type="checkbox"]')).toBeChecked();
```

> **Nota para execucao manual:** Verificar que ao alterar o tipo de uma inconsistencia, a tabela atualiza o badge. Ao marcar 3 inconsistencias e clicar "Gerar Peticao", o sistema deve navegar para a aba de Peticoes.

---

## [UC-I03] Gerar Peticao de Impugnacao

**Pagina:** `ImpugnacaoPage` — rota `/app/impugnacao` (aba Peticoes)
**Pre-condicoes:**
- UC-I02 concluido (inconsistencias 1, 2 e 6 selecionadas)
- Aba Peticoes ativa apos clique em "Gerar Peticao"

---

### Sequencia de Automacao

```typescript
// Pre-condicao: aba Peticoes ativa apos UC-I02

// Clicar "Gerar Peticao" na aba Peticoes (se ainda nao acionado)
await page.click('button:has-text("Gerar Peticao")');

// Aguardar geracao pela IA
await page.waitForSelector('text=Peticao', { timeout: 120000 });

// Verificar secoes da peticao gerada
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();
await expect(page.locator('text=Diego Ricardo Munoz')).toBeVisible();

// Verificar secoes estruturais
await expect(page.locator('text=Dos Fatos').or(page.locator('text=DOS FATOS'))).toBeVisible();
await expect(page.locator('text=Do Direito').or(page.locator('text=DO DIREITO'))).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();

// Verificar referencias legais
await expect(page.locator('text=Art. 41')).toBeVisible();
await expect(page.locator('text=Art. 67')).toBeVisible();
await expect(page.locator('text=Art. 141')).toBeVisible();
await expect(page.locator('text=14.133/2021')).toBeVisible();

// Clicar "Baixar PDF"
await page.click('button:has-text("Baixar PDF")');
```

### Dados da Peticao

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo | Impugnacao |
| Inconsistencias selecionadas | Itens 1, 2 e 6 do UC-I01 |
| Impugnante | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ Impugnante | 43.712.232/0001-85 |
| Representante Legal | Diego Ricardo Munoz — Socio-Administrador |

### Estrutura Esperada da Peticao Gerada

| Secao | Conteudo Esperado |
|---|---|
| Cabecalho | "AO PREGOEIRO DO [ORGAO]" ou "A COMISSAO DE LICITACAO DO [ORGAO]" |
| Qualificacao | Dados da empresa impugnante (razao social, CNPJ, endereco, representante) |
| Dos Fatos | Descricao do edital, numero, objeto, data de publicacao |
| Do Direito — Ponto 1 | Direcionamento por marca — Art. 41 da Lei 14.133/2021, principio da isonomia e competitividade |
| Do Direito — Ponto 2 | Experiencia desproporcional — Art. 67, SS 1o da Lei 14.133/2021, jurisprudencia TCU Acordao 1636/2020 |
| Do Direito — Ponto 3 | Prazo de pagamento abusivo — Art. 141, III da Lei 14.133/2021 |
| Do Pedido | Solicitar alteracao das clausulas impugnadas |
| Fechamento | Local, data, assinatura do representante legal |

### Artigos e Jurisprudencia de Referencia

| Base Legal | Descricao |
|---|---|
| Art. 5o, Lei 14.133/2021 | Principios da legalidade, impessoalidade, moralidade, igualdade, competitividade |
| Art. 41, Lei 14.133/2021 | Vedacao a preferencia de marca |
| Art. 67, SS 1o, Lei 14.133/2021 | Qualificacao tecnica proporcional ao objeto |
| Art. 141, III, Lei 14.133/2021 | Prazo de pagamento |
| Art. 164, Lei 14.133/2021 | Direito de impugnacao do edital |
| Art. 172, Lei 14.133/2021 | Prazo para impugnacao |
| Acordao TCU 1636/2020 | Vedacao a exigencia de experiencia desproporcional |
| Acordao TCU 2100/2019 | Vedacao a direcionamento por marca em licitacoes |
| Sumula TCU 272 | Necessidade de justificativa tecnica para exigencias restritivas |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar Gerar Peticao | `button:has-text("Gerar Peticao")` | — | Spinner de processamento |
| 2 | Aguardar geracao | `text=Peticao` | — | Card com peticao gerada |
| 3 | Verificar cabecalho | `text=PREGOEIRO` ou `text=COMISSAO` | — | Cabecalho presente |
| 4 | Verificar qualificacao | `text=CH Hospitalar` | — | Razao social no texto |
| 5 | Verificar CNPJ | `text=43.712.232/0001-85` | — | CNPJ presente |
| 6 | Verificar representante | `text=Diego Ricardo Munoz` | — | Nome presente |
| 7 | Verificar secao Dos Fatos | `text=Dos Fatos` | — | Secao presente |
| 8 | Verificar secao Do Direito | `text=Do Direito` | — | Secao presente |
| 9 | Verificar Art. 41 | `text=Art. 41` | — | Artigo citado |
| 10 | Verificar Art. 67 | `text=Art. 67` | — | Artigo citado |
| 11 | Verificar Art. 141 | `text=Art. 141` | — | Artigo citado |
| 12 | Verificar secao Do Pedido | `text=Do Pedido` | — | Secao presente |
| 13 | Clicar Baixar PDF | `button:has-text("Baixar PDF")` | — | Download iniciado |

### Verificacoes finais (assertions)

```typescript
// Verificar estrutura completa da peticao
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();
await expect(page.locator('text=Diego Ricardo Munoz')).toBeVisible();
await expect(page.locator('text=Dos Fatos').or(page.locator('text=DOS FATOS'))).toBeVisible();
await expect(page.locator('text=Do Direito').or(page.locator('text=DO DIREITO'))).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();
await expect(page.locator('text=14.133/2021')).toBeVisible();
```

> **Nota para execucao manual:** Conferir que a peticao gerada tem todas as secoes obrigatorias (cabecalho, qualificacao, fatos, direito, pedido, fechamento) e que os artigos citados correspondem as inconsistencias selecionadas.

---

## [UC-I04] Upload de Peticao Externa

**Pagina:** `ImpugnacaoPage` — rota `/app/impugnacao` (aba Peticoes)
**Pre-condicoes:**
- Usuario autenticado (valida1@valida.com.br, empresa: CH Hospitalar)
- Aba Peticoes na ImpugnacaoPage ativa

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Impugnacao e aba Peticoes
await page.click('button:has-text("Impugnacao")');
await expect(page).toHaveURL(/\/app\/impugnacao/);
await page.click('button:has-text("Peticoes")');

// Clicar "Upload de Peticao"
await page.click('button:has-text("Upload de Peticao")');

// Selecionar arquivo
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/fixtures/teste_upload.pdf');

// Preencher descricao
await page.getByLabel('Descricao').fill('Peticao de impugnacao elaborada pelo departamento juridico externo');

// Clicar "Enviar"
await page.click('button:has-text("Enviar")');

// Verificar que o arquivo aparece na lista de peticoes
await expect(page.locator('text=teste_upload.pdf').or(page.locator('text=juridico externo'))).toBeVisible();
await expect(page.locator('text=Externa').or(page.locator('.badge:has-text("Externa")'))).toBeVisible();

// Verificar botao "Visualizar"
await expect(page.locator('button:has-text("Visualizar")').last()).toBeVisible();
```

### Dados do Upload

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Peticao | Impugnacao |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Descricao | Peticao de impugnacao elaborada pelo departamento juridico externo |
| Data de Elaboracao | 2026-04-01 |
| Autor | Dr. Marcos Aurelio Pinto — OAB/SP 123.456 |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Impugnacao na sidebar | `button:has-text("Impugnacao")` | — | URL contem `/app/impugnacao` |
| 2 | Clicar na aba Peticoes | `button:has-text("Peticoes")` | — | Aba ativa |
| 3 | Clicar Upload de Peticao | `button:has-text("Upload de Peticao")` | — | Modal ou area de upload visivel |
| 4 | Selecionar arquivo | `input[type="file"]` | `tests/fixtures/teste_upload.pdf` | Arquivo selecionado |
| 5 | Preencher descricao | `page.getByLabel('Descricao')` | `Peticao de impugnacao elaborada pelo departamento juridico externo` | Campo preenchido |
| 6 | Clicar Enviar | `button:has-text("Enviar")` | — | Upload concluido |
| 7 | Verificar arquivo na lista | `text=teste_upload.pdf` | — | Arquivo listado |
| 8 | Verificar badge Externa | `text=Externa` | — | Badge "Externa" visivel |
| 9 | Verificar botao Visualizar | `button:has-text("Visualizar")` | — | Botao disponivel |

### Verificacoes finais (assertions)

```typescript
// Verificar presenca do arquivo na lista
await expect(page.locator('text=teste_upload.pdf').or(page.locator('text=juridico externo'))).toBeVisible();
await expect(page.locator('.badge:has-text("Externa"), [class*="badge"]:has-text("Externa")').last()).toBeVisible();
await expect(page.locator('button:has-text("Visualizar")').last()).toBeVisible();
```

> **Nota para execucao manual:** Conferir que o arquivo foi carregado e aparece na lista de peticoes com badge "Externa" e botao "Visualizar" disponivel.

---

## [UC-I05] Controle de Prazo

**Pagina:** `ImpugnacaoPage` — rota `/app/impugnacao` (aba Prazos)
**Pre-condicoes:**
- Usuario autenticado (valida1@valida.com.br, empresa: CH Hospitalar)
- Edital de "monitor multiparametrico" selecionado

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Impugnacao e aba Prazos
await page.click('button:has-text("Impugnacao")');
await expect(page).toHaveURL(/\/app\/impugnacao/);
await page.click('button:has-text("Prazos")');

// Selecionar edital
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Verificar timeline visual
await expect(page.locator('text=Prazo de Impugnacao').or(page.locator('text=Prazo'))).toBeVisible();

// Verificar data limite
await expect(page.locator('text=2026-04-10').or(page.locator('text=10/04/2026'))).toBeVisible();

// Verificar alerta de urgencia
await expect(page.locator('text=Urgente').or(page.locator('.badge:has-text("Urgente")'))).toBeVisible();

// Verificar countdown
await expect(page.locator('text=dias').or(page.locator('text=horas'))).toBeVisible();

// Verificar status "Dentro do prazo"
await expect(page.locator('text=Dentro do prazo')).toBeVisible();
```

### Dados de Prazo — Cenario Dentro do Prazo

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Data de abertura do edital | 2026-04-15 (exemplo) |
| Prazo para impugnacao | Ate 3 dias uteis antes da abertura = 2026-04-10 |
| Data atual simulada | 2026-04-08 |
| Dias restantes | 2 dias uteis |

### Dados de Prazo — Cenario Prazo Encerrado

| Campo | Valor |
|---|---|
| Data de abertura | 2026-04-05 (data passada) |
| Prazo impugnacao | 2026-04-02 (expirado) |
| Status esperado | "Prazo encerrado" — badge vermelho |
| Acao bloqueada | Botao "Gerar Peticao" desabilitado com tooltip "Prazo de impugnacao encerrado" |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Impugnacao na sidebar | `button:has-text("Impugnacao")` | — | URL contem `/app/impugnacao` |
| 2 | Clicar na aba Prazos | `button:has-text("Prazos")` | — | Aba ativa |
| 3 | Selecionar edital | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 4 | Verificar timeline | `text=Prazo de Impugnacao` | — | Timeline visual exibida |
| 5 | Verificar data limite | `text=2026-04-10` | — | Data limite visivel |
| 6 | Verificar alerta urgencia | `text=Urgente` | — | Badge amarelo/vermelho |
| 7 | Verificar countdown | `text=dias` ou `text=horas` | — | Contador regressivo visivel |
| 8 | Verificar status | `text=Dentro do prazo` | — | Badge verde |

### Verificacoes finais (assertions)

```typescript
// Cenario 1: Dentro do prazo
await expect(page.locator('text=Prazo de Impugnacao').or(page.locator('text=Prazo'))).toBeVisible();
await expect(page.locator('text=Dentro do prazo')).toBeVisible();
await expect(page.locator('text=Urgente').or(page.locator('[class*="urgent"]'))).toBeVisible();

// Cenario 2: Prazo encerrado (se edital com data passada for selecionado)
// await expect(page.locator('text=Prazo encerrado')).toBeVisible();
// await expect(page.locator('button:has-text("Gerar Peticao")')).toBeDisabled();
```

> **Nota para execucao manual:** Verificar a timeline visual com as datas do edital. Conferir o countdown regressivo e os badges de urgencia. No cenario de prazo encerrado, confirmar que o botao "Gerar Peticao" esta desabilitado.

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## [UC-RE01] Monitorar Janela de Recurso

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- Usuario autenticado (valida1@valida.com.br, empresa: CH Hospitalar)
- Edital de "monitor multiparametrico" com resultado de licitacao disponivel

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Recursos via sidebar
await page.click('button:has-text("Recursos")');
await expect(page).toHaveURL(/\/app\/recursos/);

// Selecionar edital de "monitor multiparametrico"
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Verificar timeline com 5 etapas
await expect(page.locator('text=Resultado').or(page.locator('text=Adjudicacao'))).toBeVisible();
await expect(page.locator('text=Intencao de Recurso')).toBeVisible();
await expect(page.locator('text=Razoes de Recurso')).toBeVisible();
await expect(page.locator('text=Contra-Razoes')).toBeVisible();
await expect(page.locator('text=Decisao')).toBeVisible();

// Verificar datas na timeline
await expect(page.locator('text=2026-04-16').or(page.locator('text=16/04/2026'))).toBeVisible();
await expect(page.locator('text=2026-04-17').or(page.locator('text=17/04/2026'))).toBeVisible();

// Verificar countdown
await expect(page.locator('text=dias').or(page.locator('text=horas'))).toBeVisible();
```

### Dados da Janela de Recurso

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Pagina | RecursosPage (`/app/recursos`) |
| Data de abertura da sessao | 2026-04-15 |
| Data do resultado (adjudicacao) | 2026-04-16 |
| Inicio da janela de recurso | 2026-04-16 (imediato apos resultado) |
| Prazo para intencao de recurso | 2026-04-17 (1 dia util — pregao eletronico) |
| Prazo para razoes de recurso | 2026-04-21 (3 dias uteis apos intencao) |
| Prazo para contra-razoes | 2026-04-24 (3 dias uteis apos razoes) |
| Decisao da autoridade | 2026-04-28 (5 dias uteis apos contra-razoes) |

### Timeline Visual Esperada

| Etapa | Data | Status |
|---|---|---|
| Resultado / Adjudicacao | 2026-04-16 | Concluido (verde) |
| Intencao de Recurso | 2026-04-17 | Em andamento (azul) ou Concluido |
| Razoes de Recurso | 2026-04-21 | Pendente (cinza) ou Em andamento |
| Contra-Razoes | 2026-04-24 | Pendente (cinza) |
| Decisao | 2026-04-28 | Pendente (cinza) |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Recursos na sidebar | `button:has-text("Recursos")` | — | URL contem `/app/recursos` |
| 2 | Selecionar edital | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 3 | Verificar etapa Resultado | `text=Resultado` ou `text=Adjudicacao` | — | Etapa visivel com data 2026-04-16 |
| 4 | Verificar etapa Intencao | `text=Intencao de Recurso` | — | Etapa visivel com data 2026-04-17 |
| 5 | Verificar etapa Razoes | `text=Razoes de Recurso` | — | Etapa visivel com data 2026-04-21 |
| 6 | Verificar etapa Contra-Razoes | `text=Contra-Razoes` | — | Etapa visivel com data 2026-04-24 |
| 7 | Verificar etapa Decisao | `text=Decisao` | — | Etapa visivel com data 2026-04-28 |
| 8 | Verificar countdown | `text=dias` ou `text=horas` | — | Contador regressivo para proxima etapa |
| 9 | Verificar alerta | `.badge` ou `text=alerta` | — | Badge de alerta quando prazo <= 1 dia util |

### Verificacoes finais (assertions)

```typescript
// Verificar que a timeline tem 5 etapas
await expect(page.locator('text=Resultado').or(page.locator('text=Adjudicacao'))).toBeVisible();
await expect(page.locator('text=Intencao de Recurso')).toBeVisible();
await expect(page.locator('text=Razoes de Recurso')).toBeVisible();
await expect(page.locator('text=Contra-Razoes')).toBeVisible();
await expect(page.locator('text=Decisao')).toBeVisible();
```

> **Nota para execucao manual:** Conferir que a timeline exibe as 5 etapas com datas corretas, badges de status (Concluido/Em andamento/Pendente) e countdown para a proxima etapa.

---

## [UC-RE02] Analisar Proposta Vencedora

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- UC-RE01 concluido (edital selecionado na RecursosPage)
- Edital de "monitor multiparametrico" com resultado disponivel

---

### Sequencia de Automacao

```typescript
// Pre-condicao: RecursosPage com edital selecionado

// Clicar "Analisar Proposta Vencedora"
await page.click('button:has-text("Analisar Proposta Vencedora")');

// Aguardar carregamento dos dados do concorrente
await expect(page.locator('text=MedTech Solutions')).toBeVisible({ timeout: 30000 });

// Verificar dados do concorrente vencedor
await expect(page.locator('text=MedTech Solutions Equipamentos Ltda.')).toBeVisible();
await expect(page.locator('text=12.345.678/0001-90')).toBeVisible();
await expect(page.locator('text=16.800')).toBeVisible();

// Verificar tabela comparativa de precos
await expect(page.locator('text=18.200')).toBeVisible();
await expect(page.locator('text=198.500')).toBeVisible();
await expect(page.locator('text=183.300')).toBeVisible();

// Verificar tabela comparativa tecnica
await expect(page.locator('text=Nao Atende').or(page.locator('text=NAO ATENDE')).first()).toBeVisible();
await expect(page.locator('text=Atende').first()).toBeVisible();

// Verificar recomendacao da IA
await expect(page.locator('text=recurso').or(page.locator('text=Recurso'))).toBeVisible();
```

### Dados do Concorrente Vencedor

| Campo | Valor |
|---|---|
| Empresa Vencedora | MedTech Solutions Equipamentos Ltda. |
| CNPJ Vencedora | 12.345.678/0001-90 |
| Item | Monitor Multiparametrico 12 parametros |
| Preco Vencedor (unitario) | R$ 16.800,00 |
| Preco Nossa Proposta (unitario) | R$ 18.200,00 |
| Diferenca | R$ 1.400,00 (7,7% acima) |

### Comparativo de Precos

| Item | Nossa Proposta | Proposta Vencedora | Diferenca |
|---|---|---|---|
| Monitor Multiparametrico 12 param. | R$ 18.200,00 | R$ 16.800,00 | +7,7% |
| Cabo ECG 5 vias | R$ 380,00 | R$ 310,00 | +22,6% |
| Sensor SpO2 adulto | R$ 290,00 | R$ 250,00 | +16,0% |
| Suporte com rodizios | R$ 980,00 | R$ 870,00 | +12,6% |
| **Valor Total (10 monitores + acessorios)** | **R$ 198.500,00** | **R$ 183.300,00** | **+8,3%** |

### Comparativo Tecnico

| Requisito do Edital | Nossa Proposta | Proposta Vencedora | Conformidade |
|---|---|---|---|
| Tela >= 12 polegadas | 12,1" TFT Touch | 10,4" LCD | Vencedora NAO atende |
| Minimo 10 parametros | 10 parametros | 8 parametros | Vencedora NAO atende |
| EtCO2 integrado | Sim | Nao (modulo opcional) | Vencedora NAO atende |
| Bateria >= 4 horas | 6 horas | 3 horas | Vencedora NAO atende |
| Registro ANVISA | 80262090001 | 80345120003 | Ambas atendem |
| SpO2 com curva | Sim | Sim | Ambas atendem |
| ECG 12 derivacoes | Sim | Sim (5 derivacoes) | Vencedora NAO atende |
| Peso <= 5 kg | 4,1 kg | 4,8 kg | Ambas atendem |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar Analisar Proposta Vencedora | `button:has-text("Analisar Proposta Vencedora")` | — | Card com dados do concorrente |
| 2 | Verificar empresa vencedora | `text=MedTech Solutions Equipamentos Ltda.` | — | Nome da empresa visivel |
| 3 | Verificar CNPJ vencedora | `text=12.345.678/0001-90` | — | CNPJ visivel |
| 4 | Verificar preco vencedor | `text=16.800` | — | Valor unitario visivel |
| 5 | Verificar nosso preco | `text=18.200` | — | Nosso valor visivel |
| 6 | Verificar tabela comparativa precos | `text=198.500` e `text=183.300` | — | Totais visiveis |
| 7 | Verificar badge "Nao Atende" | `text=Nao Atende` ou `text=NAO ATENDE` | — | Badge vermelho em pelo menos 5 itens |
| 8 | Verificar badge "Atende" | `text=Atende` | — | Badge verde em itens conformes |
| 9 | Verificar recomendacao | `text=recurso` | — | IA recomenda recurso |

### Verificacoes finais (assertions)

```typescript
// Verificar dados do concorrente
await expect(page.locator('text=MedTech Solutions Equipamentos Ltda.')).toBeVisible();
await expect(page.locator('text=12.345.678/0001-90')).toBeVisible();

// Verificar comparativo de precos
await expect(page.locator('text=198.500').or(page.locator('text=198500'))).toBeVisible();
await expect(page.locator('text=183.300').or(page.locator('text=183300'))).toBeVisible();

// Verificar que ha nao conformidades tecnicas
const naoAtende = page.locator('text=Nao Atende, text=NAO ATENDE, .badge:has-text("Nao Atende")');
await expect(naoAtende.first()).toBeVisible();
```

> **Nota para execucao manual:** Verificar o card com dados do concorrente vencedor, a tabela comparativa de precos (com percentuais) e a tabela comparativa tecnica com badges de conformidade (verde para "Atende", vermelho para "Nao Atende").

---

## [UC-RE03] Chatbox de Analise

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- UC-RE02 concluido (edital analisado na RecursosPage)
- Chatbox acessivel na pagina

---

### Sequencia de Automacao

```typescript
// Pre-condicao: RecursosPage com edital selecionado

// Localizar chatbox
const chatInput = page.locator('textarea, input[type="text"]').last();

// Pergunta 1: Marca especifica
await chatInput.fill('O edital exige marca especifica?');
await page.click('button:has-text("Enviar")').or(page.locator('button[type="submit"]').last());

// Aguardar resposta da IA
await page.waitForSelector('text=Art. 41', { timeout: 60000 });

// Verificar resposta com formatacao markdown
await expect(page.locator('text=Art. 41').or(page.locator('text=14.133'))).toBeVisible();

// Pergunta 2: Prazo de entrega (sem perder contexto)
await chatInput.fill('Qual o prazo de entrega exigido?');
await page.click('button:has-text("Enviar")').or(page.locator('button[type="submit"]').last());

// Aguardar resposta
await page.waitForTimeout(5000);
await expect(page.locator('text=prazo').or(page.locator('text=entrega')).last()).toBeVisible();

// Pergunta 3: Requisitos tecnicos
await chatInput.fill('A proposta vencedora atende todos os requisitos tecnicos?');
await page.click('button:has-text("Enviar")').or(page.locator('button[type="submit"]').last());

// Aguardar resposta
await page.waitForTimeout(5000);
await expect(page.locator('text=nao conformidade').or(page.locator('text=nao atende')).last()).toBeVisible();
```

### Perguntas de Teste

| Pergunta | Resposta Esperada |
|---|---|
| "O edital exige marca especifica?" | Resposta indicando se ha exigencia de marca e se viola Art. 41 da Lei 14.133/2021 |
| "Qual o prazo de entrega exigido?" | Resposta com prazo extraido do edital (ex: "30 dias corridos apos emissao da ordem de compra") |
| "A proposta vencedora atende todos os requisitos tecnicos?" | Resposta detalhando pontos de nao conformidade identificados no comparativo |
| "Quais artigos da Lei 14.133 fundamentam um recurso neste caso?" | Resposta citando Art. 165 (direito de recurso), Art. 59 (julgamento de propostas), Art. 41 (vedacao de marca) |
| "O preco da proposta vencedora e inexequivel?" | Analise de exequibilidade comparando com referencia de mercado |
| "Qual a jurisprudencia do TCU sobre proposta com especificacao tecnica inferior?" | Resposta com acordaos relevantes (ex: Acordao 2831/2019, Acordao 1216/2020) |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Localizar chatbox | `textarea` ou `input[type="text"]` (ultimo) | — | Campo de entrada visivel |
| 2 | Digitar pergunta 1 | `chatInput` | "O edital exige marca especifica?" | Texto digitado |
| 3 | Enviar pergunta 1 | `button:has-text("Enviar")` | — | Mensagem enviada |
| 4 | Aguardar resposta 1 | `text=Art. 41` | — | Resposta da IA com Art. 41 |
| 5 | Digitar pergunta 2 | `chatInput` | "Qual o prazo de entrega exigido?" | Texto digitado |
| 6 | Enviar pergunta 2 | `button:has-text("Enviar")` | — | Mensagem enviada |
| 7 | Aguardar resposta 2 | `text=prazo` ou `text=entrega` | — | Resposta da IA com prazo |
| 8 | Digitar pergunta 3 | `chatInput` | "A proposta vencedora atende todos os requisitos tecnicos?" | Texto digitado |
| 9 | Enviar pergunta 3 | `button:has-text("Enviar")` | — | Mensagem enviada |
| 10 | Aguardar resposta 3 | `text=nao conformidade` | — | Resposta com nao conformidades |

### Verificacoes finais (assertions)

```typescript
// Verificar que o chat mantem historico (3 perguntas e 3 respostas)
const messages = page.locator('[class*="message"], [class*="chat"] > div');
await expect(messages).toHaveCount({ minimum: 6 });

// Verificar que a segunda resposta manteve contexto da conversa
await expect(page.locator('text=prazo').or(page.locator('text=entrega')).last()).toBeVisible();
```

> **Nota para execucao manual:** Enviar as perguntas uma a uma e verificar que as respostas contem informacao relevante com formatacao markdown. Confirmar que o chat mantem contexto entre perguntas (ex: a terceira pergunta usa informacao das anteriores).

---

## [UC-RE04] Gerar Laudo de Recurso

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- UC-RE02 concluido (comparativo tecnico disponivel)
- Edital de "monitor multiparametrico" selecionado

---

### Sequencia de Automacao

```typescript
// Pre-condicao: RecursosPage com edital selecionado

// Clicar "Gerar Laudo de Recurso"
await page.click('button:has-text("Gerar Laudo de Recurso")');

// Aguardar geracao pela IA
await page.waitForSelector('text=PREGOEIRO', { timeout: 120000 });

// Verificar cabecalho
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();

// Verificar qualificacao do recorrente
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();
await expect(page.locator('text=Diego Ricardo Munoz')).toBeVisible();

// Verificar secoes estruturais
await expect(page.locator('text=Dos Fatos').or(page.locator('text=DOS FATOS'))).toBeVisible();
await expect(page.locator('text=Analise Tecnica').or(page.locator('text=ANALISE TECNICA'))).toBeVisible();
await expect(page.locator('text=Do Direito').or(page.locator('text=DO DIREITO'))).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();

// Verificar fundamentos legais
await expect(page.locator('text=Art. 59')).toBeVisible();
await expect(page.locator('text=14.133/2021')).toBeVisible();

// Verificar pontos tecnicos
await expect(page.locator('text=10,4').or(page.locator('text=tela'))).toBeVisible();
await expect(page.locator('text=8 parametros').or(page.locator('text=parametros'))).toBeVisible();

// Clicar "Baixar PDF"
await page.click('button:has-text("Baixar PDF")');
```

### Dados para Geracao do Laudo

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Laudo | Recurso Administrativo |
| Recorrente | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ Recorrente | 43.712.232/0001-85 |
| Representante Legal | Diego Ricardo Munoz — Socio-Administrador |
| Motivo do Recurso | Proposta vencedora nao atende requisitos tecnicos minimos do edital |

### Fundamentos do Recurso

| Ponto | Fundamento | Base Legal |
|---|---|---|
| 1 | Tela do monitor vencedor (10,4") nao atende requisito minimo de 12" | Art. 59, SS 1o, Lei 14.133/2021 — Desclassificacao de proposta nao conforme |
| 2 | Monitor vencedor tem apenas 8 parametros, edital exige minimo de 10 | Art. 59, SS 1o, Lei 14.133/2021 |
| 3 | EtCO2 nao integrado na proposta vencedora, edital exige EtCO2 integrado | Acordao TCU 2831/2019 — Obrigatoriedade de atendimento integral |
| 4 | Bateria de 3 horas nao atende requisito de >= 4 horas | Art. 12, Lei 14.133/2021 — Especificacoes tecnicas do termo de referencia |
| 5 | ECG com 5 derivacoes nao atende requisito de 12 derivacoes | Art. 59, SS 1o, Lei 14.133/2021 |

### Estrutura Esperada do Laudo

| Secao | Conteudo |
|---|---|
| Cabecalho | "AO PREGOEIRO / A COMISSAO DE LICITACAO" |
| Qualificacao do Recorrente | Razao social, CNPJ, endereco, representante legal |
| Dos Fatos | Descricao da sessao, resultado, proposta vencedora |
| Da Analise Tecnica | Comparativo item a item mostrando nao conformidades |
| Do Direito | Artigos da Lei 14.133/2021 e jurisprudencia TCU |
| Do Pedido | Desclassificacao da proposta vencedora e reclassificacao |
| Fechamento | Local, data, assinatura |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar Gerar Laudo de Recurso | `button:has-text("Gerar Laudo de Recurso")` | — | Spinner de processamento |
| 2 | Aguardar geracao | `text=PREGOEIRO` | — | Laudo gerado e exibido |
| 3 | Verificar cabecalho | `text=PREGOEIRO` ou `text=COMISSAO` | — | Cabecalho presente |
| 4 | Verificar recorrente | `text=CH Hospitalar` | — | Razao social no texto |
| 5 | Verificar CNPJ | `text=43.712.232/0001-85` | — | CNPJ presente |
| 6 | Verificar representante | `text=Diego Ricardo Munoz` | — | Nome presente |
| 7 | Verificar secao Dos Fatos | `text=Dos Fatos` | — | Secao presente |
| 8 | Verificar secao Analise Tecnica | `text=Analise Tecnica` | — | Secao com comparativo |
| 9 | Verificar Art. 59 | `text=Art. 59` | — | Artigo citado |
| 10 | Verificar secao Do Pedido | `text=Do Pedido` | — | Pedido de desclassificacao |
| 11 | Clicar Baixar PDF | `button:has-text("Baixar PDF")` | — | Download iniciado |

### Verificacoes finais (assertions)

```typescript
// Verificar estrutura do laudo
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();
await expect(page.locator('text=Diego Ricardo Munoz')).toBeVisible();
await expect(page.locator('text=Art. 59')).toBeVisible();
await expect(page.locator('text=14.133/2021')).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();
```

> **Nota para execucao manual:** Conferir que o laudo gerado tem todas as secoes obrigatorias, cita os 5 pontos de nao conformidade tecnica e referencia os artigos da Lei 14.133/2021 e acordaos do TCU.

---

## [UC-RE05] Gerar Laudo de Contra-Razao

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- Usuario autenticado (valida1@valida.com.br, empresa: CH Hospitalar)
- Edital de "ultrassonografo portatil" (segundo edital) selecionado
- Cenario: CH Hospitalar e a vencedora e precisa se defender de recurso

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Recursos
await page.click('button:has-text("Recursos")');
await expect(page).toHaveURL(/\/app\/recursos/);

// Selecionar edital de "ultrassonografo portatil"
await page.click('select, [role="combobox"]');
await page.click('text=ultrassonografo');

// Clicar "Gerar Laudo de Contra-Razao"
await page.click('button:has-text("Gerar Laudo de Contra-Razao")');

// Aguardar geracao pela IA
await page.waitForSelector('text=PREGOEIRO', { timeout: 120000 });

// Verificar cabecalho
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();

// Verificar qualificacao do contra-arrazoante
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();

// Verificar que o recorrente adversario e mencionado
await expect(page.locator('text=BioEquip').or(page.locator('text=recorrente'))).toBeVisible();

// Verificar secoes de defesa
await expect(page.locator('text=Dos Fatos').or(page.locator('text=DOS FATOS'))).toBeVisible();
await expect(page.locator('text=Da Defesa').or(page.locator('text=DA DEFESA'))).toBeVisible();
await expect(page.locator('text=Das Provas').or(page.locator('text=DAS PROVAS'))).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();

// Verificar argumentos de defesa
await expect(page.locator('text=exequi').or(page.locator('text=notas fiscais'))).toBeVisible();

// Clicar "Baixar PDF"
await page.click('button:has-text("Baixar PDF")');
```

### Cenario: CH Hospitalar e a vencedora e precisa se defender de recurso

| Campo | Valor |
|---|---|
| Edital | Edital de "ultrassonografo portatil" (segundo edital salvo) |
| Tipo de Laudo | Contra-Razao de Recurso |
| Contra-Arrazoante | CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda. |
| CNPJ | 43.712.232/0001-85 |
| Recorrente (adversario) | BioEquip Distribuidora de Equipamentos Medicos S.A. |
| Motivo do Recurso do Adversario | Alega que preco da CH Hospitalar e inexequivel |

### Argumentos de Defesa

| Ponto | Argumento | Base Legal |
|---|---|---|
| 1 | Preco ofertado e compativel com notas fiscais anteriores de vendas ao setor publico | Art. 59, SS 4o, Lei 14.133/2021 — Demonstracao de exequibilidade |
| 2 | Empresa possui contrato vigente com outro orgao pelo mesmo valor unitario | Acordao TCU 1442/2018 — Preco exequivel comprovado por historico |
| 3 | Planilha de composicao de custos demonstra margem de lucro positiva | Art. 59, SS 2o, Lei 14.133/2021 |
| 4 | Fabricante Mindray fornece nota de credito por volume que justifica desconto | Documentacao comprobatoria do fabricante |

### Estrutura Esperada do Laudo

| Secao | Conteudo |
|---|---|
| Cabecalho | "AO PREGOEIRO / A COMISSAO DE LICITACAO" |
| Qualificacao do Contra-Arrazoante | Razao social, CNPJ, endereco, representante legal |
| Dos Fatos | Descricao do recurso interposto pelo adversario |
| Da Defesa | Refutacao ponto a ponto dos argumentos do recorrente |
| Das Provas | Notas fiscais, contratos vigentes, planilha de custos |
| Do Pedido | Manutencao da adjudicacao em favor da CH Hospitalar |
| Fechamento | Local, data, assinatura |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Recursos na sidebar | `button:has-text("Recursos")` | — | URL contem `/app/recursos` |
| 2 | Selecionar edital | `select, [role="combobox"]` | Edital "ultrassonografo portatil" | Edital selecionado |
| 3 | Clicar Gerar Laudo de Contra-Razao | `button:has-text("Gerar Laudo de Contra-Razao")` | — | Spinner de processamento |
| 4 | Aguardar geracao | `text=PREGOEIRO` | — | Laudo gerado e exibido |
| 5 | Verificar cabecalho | `text=PREGOEIRO` | — | Cabecalho presente |
| 6 | Verificar contra-arrazoante | `text=CH Hospitalar` | — | Razao social presente |
| 7 | Verificar CNPJ | `text=43.712.232/0001-85` | — | CNPJ presente |
| 8 | Verificar adversario | `text=BioEquip` | — | Nome do recorrente adversario |
| 9 | Verificar secao Da Defesa | `text=Da Defesa` | — | Secao com refutacoes |
| 10 | Verificar secao Das Provas | `text=Das Provas` | — | Secao com provas documentais |
| 11 | Verificar secao Do Pedido | `text=Do Pedido` | — | Pedido de manutencao |
| 12 | Clicar Baixar PDF | `button:has-text("Baixar PDF")` | — | Download iniciado |

### Verificacoes finais (assertions)

```typescript
// Verificar estrutura do laudo de contra-razao
await expect(page.locator('text=PREGOEIRO').or(page.locator('text=COMISSAO DE LICITACAO'))).toBeVisible();
await expect(page.locator('text=CH Hospitalar')).toBeVisible();
await expect(page.locator('text=43.712.232/0001-85')).toBeVisible();
await expect(page.locator('text=BioEquip').or(page.locator('text=recorrente'))).toBeVisible();
await expect(page.locator('text=Da Defesa').or(page.locator('text=DA DEFESA'))).toBeVisible();
await expect(page.locator('text=Das Provas').or(page.locator('text=DAS PROVAS'))).toBeVisible();
await expect(page.locator('text=Do Pedido').or(page.locator('text=DO PEDIDO'))).toBeVisible();
```

> **Nota para execucao manual:** Conferir que o laudo de contra-razao refuta ponto a ponto os argumentos do adversario, cita provas documentais e solicita manutencao da adjudicacao.

---

## [UC-RE06] Submissao Assistida no Portal

**Pagina:** `RecursosPage` — rota `/app/recursos`
**Pre-condicoes:**
- UC-RE04 concluido (laudo de recurso gerado ou disponivel)
- Edital de "monitor multiparametrico" selecionado

---

### Sequencia de Automacao

```typescript
// Pre-condicao: RecursosPage com edital selecionado

// Clicar "Submissao Assistida"
await page.click('button:has-text("Submissao Assistida")');

// Selecionar tipo de submissao
await page.selectOption('select, [role="combobox"]', 'Recurso Administrativo');
// Alternativa:
// await page.click('text=Recurso Administrativo');

// Upload do laudo
const laudoInput = page.locator('input[type="file"]').first();
await laudoInput.setInputFiles('tests/fixtures/teste_upload.pdf');

// Upload da procuracao
await page.click('button:has-text("Adicionar")').or(page.locator('button:has-text("+")')).first();
const procuracaoInput = page.locator('input[type="file"]').nth(1);
await procuracaoInput.setInputFiles('tests/fixtures/teste_upload.pdf');

// Upload de documentos comprobatorios
await page.click('button:has-text("Adicionar")').or(page.locator('button:has-text("+")')).first();
const docsInput = page.locator('input[type="file"]').nth(2);
await docsInput.setInputFiles('tests/fixtures/teste_upload.pdf');

// Verificar checklist pre-submissao
await expect(page.locator('text=Prazo').or(page.locator('text=prazo'))).toBeVisible();
await expect(page.locator('text=Documentos').or(page.locator('text=documentos'))).toBeVisible();
await expect(page.locator('text=Assinatura').or(page.locator('text=assinatura'))).toBeVisible();

// Clicar "Preparar Submissao"
await page.click('button:has-text("Preparar Submissao")');

// Verificar instrucoes passo-a-passo
await expect(page.locator('text=passo').or(page.locator('text=instruc'))).toBeVisible();
```

### Dados para Submissao

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" salvo |
| Tipo de Submissao | Recurso Administrativo |
| Arquivo do Laudo | Laudo gerado no UC-RE04 (ou `tests/fixtures/teste_upload.pdf`) |
| Portal de destino | ComprasNet / PNCP |

### Documentos Anexos

| # | Documento | Arquivo |
|---|---|---|
| 1 | Laudo de Recurso | PDF gerado no UC-RE04 |
| 2 | Procuracao do Representante Legal | `tests/fixtures/teste_upload.pdf` |
| 3 | Documentos comprobatorios | `tests/fixtures/teste_upload.pdf` |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar Submissao Assistida | `button:has-text("Submissao Assistida")` | — | Tela de submissao aberta |
| 2 | Selecionar tipo | `select` ou `[role="combobox"]` | "Recurso Administrativo" | Tipo selecionado |
| 3 | Upload laudo | `input[type="file"]` (primeiro) | `tests/fixtures/teste_upload.pdf` | Arquivo selecionado |
| 4 | Upload procuracao | `input[type="file"]` (segundo) | `tests/fixtures/teste_upload.pdf` | Arquivo selecionado |
| 5 | Upload documentos | `input[type="file"]` (terceiro) | `tests/fixtures/teste_upload.pdf` | Arquivo selecionado |
| 6 | Verificar checklist prazo | `text=Prazo` | — | Item "prazo OK" marcado |
| 7 | Verificar checklist documentos | `text=Documentos` | — | Item "documentos OK" marcado |
| 8 | Verificar checklist assinatura | `text=Assinatura` | — | Item "assinatura OK" marcado |
| 9 | Clicar Preparar Submissao | `button:has-text("Preparar Submissao")` | — | Instrucoes exibidas |
| 10 | Verificar instrucoes | `text=passo` ou `text=instruc` | — | Card com instrucoes passo-a-passo |

### Verificacoes finais (assertions)

```typescript
// Verificar checklist completa
await expect(page.locator('text=Prazo').or(page.locator('text=prazo'))).toBeVisible();
await expect(page.locator('text=Documentos').or(page.locator('text=documentos'))).toBeVisible();

// Verificar instrucoes de submissao
await expect(page.locator('text=passo').or(page.locator('text=instruc'))).toBeVisible();
```

> **Nota para execucao manual:** Verificar que o checklist pre-submissao esta completo (prazo OK, documentos OK, assinatura OK) e que ao clicar "Preparar Submissao" aparecem instrucoes detalhadas para submissao no portal.

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## [UC-FU01] Registrar Resultado de Edital

**Pagina:** `FollowupPage` — rota `/app/followup`
**Pre-condicoes:**
- Usuario autenticado (valida1@valida.com.br, empresa: CH Hospitalar)
- Editais de "monitor multiparametrico" e "ultrassonografo portatil" com propostas finalizadas

---

### Sequencia de Automacao

```typescript
// Navegar ate a pagina Followup via sidebar
await page.click('button:has-text("Followup")');
await expect(page).toHaveURL(/\/app\/followup/);

// === CENARIO 1: Edital Ganho ===

// Selecionar edital de "monitor multiparametrico"
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Clicar "Registrar Resultado"
await page.click('button:has-text("Registrar Resultado")');

// Selecionar "Ganho"
await page.click('input[value="Ganho"], label:has-text("Ganho"), [role="radio"]:has-text("Ganho")');

// Preencher valor homologado
await page.getByLabel('Valor Homologado').fill('183300');

// Preencher motivo
await page.getByLabel('Motivo').fill('Recurso acatado — proposta concorrente desclassificada por nao atender requisitos tecnicos');

// Preencher licoes aprendidas
await page.getByLabel('Licoes Aprendidas').fill('Analise tecnica detalhada da proposta concorrente foi decisiva. Manter banco de dados de especificacoes tecnicas dos concorrentes para futuras analises.');

// Salvar
await page.click('button:has-text("Salvar Resultado")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar badge "Ganho"
await expect(page.locator('.badge:has-text("Ganho"), [class*="badge"]:has-text("Ganho")')).toBeVisible();

// === CENARIO 2: Edital Perdido ===

// Selecionar edital de "ultrassonografo portatil"
await page.click('select, [role="combobox"]');
await page.click('text=ultrassonografo');

// Clicar "Registrar Resultado"
await page.click('button:has-text("Registrar Resultado")');

// Selecionar "Perdido"
await page.click('input[value="Perdido"], label:has-text("Perdido"), [role="radio"]:has-text("Perdido")');

// Preencher valor da proposta vencedora
await page.getByLabel('Valor Proposta Vencedora').or(page.getByLabel('Valor Vencedor')).fill('142000');

// Preencher motivo
await page.getByLabel('Motivo').fill('Preco nao competitivo — concorrente com contrato de distribuicao exclusiva obteve desconto de volume');

// Preencher licoes aprendidas
await page.getByLabel('Licoes Aprendidas').fill('Negociar condicoes de volume diretamente com o fabricante antes de cotar. Avaliar parcerias com distribuidores regionais para reduzir custo logistico.');

// Salvar
await page.click('button:has-text("Salvar Resultado")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar badge "Perdido"
await expect(page.locator('.badge:has-text("Perdido"), [class*="badge"]:has-text("Perdido")')).toBeVisible();
```

### Cenario 1 — Edital Ganho

| Campo | Valor |
|---|---|
| Edital | Edital de "monitor multiparametrico" |
| Pagina | FollowupPage (`/app/followup`) |
| Resultado | Ganho |
| Valor Homologado | R$ 183.300,00 |
| Valor da Nossa Proposta | R$ 198.500,00 |
| Desconto Final | 7,7% |
| Motivo | Recurso acatado — proposta concorrente desclassificada por nao atender requisitos tecnicos |
| Licoes Aprendidas | "Analise tecnica detalhada da proposta concorrente foi decisiva. Manter banco de dados de especificacoes tecnicas dos concorrentes para futuras analises." |
| Data do Resultado | 2026-04-28 |

### Cenario 2 — Edital Perdido

| Campo | Valor |
|---|---|
| Edital | Edital de "ultrassonografo portatil" (segundo edital) |
| Resultado | Perdido |
| Valor da Proposta Vencedora | R$ 142.000,00 |
| Valor da Nossa Proposta | R$ 168.500,00 |
| Diferenca | 18,7% acima |
| Motivo | Preco nao competitivo — concorrente com contrato de distribuicao exclusiva obteve desconto de volume |
| Licoes Aprendidas | "Negociar condicoes de volume diretamente com o fabricante antes de cotar. Avaliar parcerias com distribuidores regionais para reduzir custo logistico." |
| Data do Resultado | 2026-04-25 |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Clicar em Followup na sidebar | `button:has-text("Followup")` | — | URL contem `/app/followup` |
| 2 | Selecionar edital monitor | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 3 | Clicar Registrar Resultado | `button:has-text("Registrar Resultado")` | — | Formulario de resultado aberto |
| 4 | Selecionar Ganho | `input[value="Ganho"]` ou `label:has-text("Ganho")` | — | Radio "Ganho" marcado |
| 5 | Preencher valor homologado | `page.getByLabel('Valor Homologado')` | `183300` | Campo preenchido |
| 6 | Preencher motivo | `page.getByLabel('Motivo')` | Recurso acatado — proposta concorrente desclassificada... | Campo preenchido |
| 7 | Preencher licoes aprendidas | `page.getByLabel('Licoes Aprendidas')` | Analise tecnica detalhada... | Campo preenchido |
| 8 | Clicar Salvar Resultado | `button:has-text("Salvar Resultado")` | — | Toast de sucesso |
| 9 | Verificar badge Ganho | `.badge:has-text("Ganho")` | — | Badge verde visivel |
| 10 | Selecionar edital ultrassom | `select, [role="combobox"]` | Edital "ultrassonografo portatil" | Edital selecionado |
| 11 | Clicar Registrar Resultado | `button:has-text("Registrar Resultado")` | — | Formulario aberto |
| 12 | Selecionar Perdido | `input[value="Perdido"]` ou `label:has-text("Perdido")` | — | Radio "Perdido" marcado |
| 13 | Preencher valor vencedora | `page.getByLabel('Valor Proposta Vencedora')` | `142000` | Campo preenchido |
| 14 | Preencher motivo | `page.getByLabel('Motivo')` | Preco nao competitivo... | Campo preenchido |
| 15 | Preencher licoes aprendidas | `page.getByLabel('Licoes Aprendidas')` | Negociar condicoes de volume... | Campo preenchido |
| 16 | Clicar Salvar Resultado | `button:has-text("Salvar Resultado")` | — | Toast de sucesso |
| 17 | Verificar badge Perdido | `.badge:has-text("Perdido")` | — | Badge vermelho visivel |

### Verificacoes finais (assertions)

```typescript
// Cenario 1: Verificar resultado Ganho
await expect(page.locator('.badge:has-text("Ganho"), [class*="badge"]:has-text("Ganho")')).toBeVisible();
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Cenario 2: Verificar resultado Perdido
await expect(page.locator('.badge:has-text("Perdido"), [class*="badge"]:has-text("Perdido")')).toBeVisible();
```

> **Nota para execucao manual:** Registrar resultado "Ganho" para o edital de monitor multiparametrico e "Perdido" para o de ultrassonografo portatil. Verificar que os badges aparecem nas linhas correspondentes.

---

## [UC-FU02] Configurar Alertas de Vencimento

**Pagina:** `FollowupPage` — rota `/app/followup`
**Pre-condicoes:**
- UC-FU01 concluido (pelo menos um resultado "Ganho" registrado)
- Edital de "monitor multiparametrico" com resultado "Ganho"

---

### Sequencia de Automacao

```typescript
// Pre-condicao: FollowupPage aberta com edital ganho

// Selecionar edital ganho de "monitor multiparametrico"
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Clicar "Configurar Alertas"
await page.click('button:has-text("Configurar Alertas")');

// === Alerta 1: Contrato ===
await page.getByLabel('Tipo').first().selectOption('Contrato');
// Alternativa: await page.getByLabel('Tipo').first().fill('Contrato');
await page.getByLabel('Data de Vencimento').first().fill('2027-04-28');
await page.getByLabel('Antecedencia 1').first().fill('90');
await page.getByLabel('Antecedencia 2').first().fill('30');
await page.getByLabel('Antecedencia 3').first().fill('7');

// === Alerta 2: ARP ===
await page.click('button:has-text("Adicionar")').or(page.locator('button:has-text("+")')).first();
await page.getByLabel('Tipo').nth(1).selectOption('Ata de Registro de Precos');
await page.getByLabel('Data de Vencimento').nth(1).fill('2027-04-28');
await page.getByLabel('Antecedencia 1').nth(1).fill('60');
await page.getByLabel('Antecedencia 2').nth(1).fill('30');
await page.getByLabel('Antecedencia 3').nth(1).fill('15');

// === Alerta 3: Garantia Contratual ===
await page.click('button:has-text("Adicionar")').or(page.locator('button:has-text("+")')).first();
await page.getByLabel('Tipo').nth(2).selectOption('Garantia Contratual');
await page.getByLabel('Data de Vencimento').nth(2).fill('2026-07-28');
await page.getByLabel('Antecedencia 1').nth(2).fill('30');
await page.getByLabel('Antecedencia 2').nth(2).fill('15');
await page.getByLabel('Antecedencia 3').nth(2).fill('5');

// Salvar
await page.click('button:has-text("Salvar Alertas")');
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar lista de alertas
await expect(page.locator('text=Contrato')).toBeVisible();
await expect(page.locator('text=Ata de Registro')).toBeVisible();
await expect(page.locator('text=Garantia Contratual')).toBeVisible();
```

### Alertas para Edital Ganho

| Tipo de Alerta | Data de Vencimento | Antecedencia 1 | Antecedencia 2 | Antecedencia 3 |
|---|---|---|---|---|
| Contrato | 2027-04-28 (1 ano) | 90 dias antes | 30 dias antes | 7 dias antes |
| Ata de Registro de Precos (ARP) | 2027-04-28 (1 ano) | 60 dias antes | 30 dias antes | 15 dias antes |
| Garantia Contratual | 2026-07-28 (3 meses) | 30 dias antes | 15 dias antes | 5 dias antes |
| Garantia do Equipamento | 2028-04-28 (2 anos) | 90 dias antes | 30 dias antes | 7 dias antes |
| Certificado ANVISA | 2027-12-31 | 60 dias antes | 30 dias antes | 15 dias antes |

### Canais de Notificacao

| Canal | Ativo |
|---|---|
| Email (licitacoes@chhospitalar.com.br) | Sim |
| Notificacao no sistema | Sim |
| SMS | Nao |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital ganho | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 2 | Clicar Configurar Alertas | `button:has-text("Configurar Alertas")` | — | Formulario de alertas aberto |
| 3 | Selecionar tipo Contrato | `page.getByLabel('Tipo').first()` | "Contrato" | Tipo selecionado |
| 4 | Preencher data vencimento | `page.getByLabel('Data de Vencimento').first()` | `2027-04-28` | Data preenchida |
| 5 | Preencher antecedencia 1 | `page.getByLabel('Antecedencia 1').first()` | `90` | Valor 90 dias |
| 6 | Preencher antecedencia 2 | `page.getByLabel('Antecedencia 2').first()` | `30` | Valor 30 dias |
| 7 | Preencher antecedencia 3 | `page.getByLabel('Antecedencia 3').first()` | `7` | Valor 7 dias |
| 8 | Adicionar segundo alerta | `button:has-text("Adicionar")` | — | Nova linha de alerta |
| 9 | Selecionar tipo ARP | `page.getByLabel('Tipo').nth(1)` | "Ata de Registro de Precos" | Tipo selecionado |
| 10 | Preencher data vencimento ARP | `page.getByLabel('Data de Vencimento').nth(1)` | `2027-04-28` | Data preenchida |
| 11 | Preencher antecedencias ARP | `page.getByLabel('Antecedencia 1-3').nth(1)` | `60, 30, 15` | Valores preenchidos |
| 12 | Adicionar terceiro alerta | `button:has-text("Adicionar")` | — | Nova linha de alerta |
| 13 | Selecionar tipo Garantia | `page.getByLabel('Tipo').nth(2)` | "Garantia Contratual" | Tipo selecionado |
| 14 | Preencher data vencimento Garantia | `page.getByLabel('Data de Vencimento').nth(2)` | `2026-07-28` | Data preenchida |
| 15 | Preencher antecedencias Garantia | `page.getByLabel('Antecedencia 1-3').nth(2)` | `30, 15, 5` | Valores preenchidos |
| 16 | Clicar Salvar Alertas | `button:has-text("Salvar Alertas")` | — | Toast de sucesso |
| 17 | Verificar lista de alertas | `text=Contrato`, `text=Ata de Registro`, `text=Garantia` | — | 3 alertas listados |

### Verificacoes finais (assertions)

```typescript
// Verificar alertas salvos
await expect(page.locator('text=Contrato')).toBeVisible();
await expect(page.locator('text=Ata de Registro')).toBeVisible();
await expect(page.locator('text=Garantia Contratual')).toBeVisible();
await expect(page.locator('.toast, [role="alert"]')).toContainText(/salvo|sucesso/i);

// Verificar datas de vencimento
await expect(page.locator('text=2027-04-28').or(page.locator('text=28/04/2027')).first()).toBeVisible();
await expect(page.locator('text=2026-07-28').or(page.locator('text=28/07/2026'))).toBeVisible();
```

> **Nota para execucao manual:** Configurar pelo menos 3 alertas com datas e antecedencias diferentes. Verificar que a lista exibe todos os alertas com suas datas e antecedencias. Conferir no Dashboard se os alertas proximos aparecem com badge de urgencia.

---

## [UC-FU03] Score Logistico

**Pagina:** `FollowupPage` — rota `/app/followup`
**Pre-condicoes:**
- UC-FU01 concluido (resultado "Ganho" registrado para edital de monitor)
- Edital de "monitor multiparametrico" com resultado "Ganho"

---

### Sequencia de Automacao

```typescript
// Pre-condicao: FollowupPage aberta

// Selecionar edital ganho de "monitor multiparametrico"
await page.click('select, [role="combobox"]');
await page.click('text=monitor multiparametrico');

// Clicar "Score Logistico"
await page.click('button:has-text("Score Logistico")');

// Aguardar carregamento
await expect(page.locator('text=Score').or(page.locator('text=Logistico'))).toBeVisible({ timeout: 30000 });

// Verificar indicadores historicos
await expect(page.locator('text=Pontualidade').or(page.locator('text=pontualidade'))).toBeVisible();
await expect(page.locator('text=92%').or(page.locator('text=92'))).toBeVisible();

await expect(page.locator('text=Integridade').or(page.locator('text=integridade'))).toBeVisible();
await expect(page.locator('text=96%').or(page.locator('text=96'))).toBeVisible();

await expect(page.locator('text=Eficiencia').or(page.locator('text=eficiencia'))).toBeVisible();
await expect(page.locator('text=85%').or(page.locator('text=85'))).toBeVisible();

await expect(page.locator('text=Qualidade').or(page.locator('text=qualidade'))).toBeVisible();

await expect(page.locator('text=Satisfacao').or(page.locator('text=satisfacao'))).toBeVisible();
await expect(page.locator('text=82%').or(page.locator('text=82'))).toBeVisible();

// Verificar score final
await expect(page.locator('text=89%').or(page.locator('text=89'))).toBeVisible();
await expect(page.locator('text=Excelente')).toBeVisible();

// Verificar grafico radar (canvas ou svg)
await expect(page.locator('canvas, svg').first()).toBeVisible();

// Verificar recomendacoes da IA
await expect(page.locator('text=Recomendac').or(page.locator('text=recomendac'))).toBeVisible();
```

### Dados de Performance Historica

| Indicador | Valor | Peso |
|---|---|---|
| Entregas no prazo (ultimos 12 meses) | 92% (23 de 25 entregas) | 0.30 |
| Entregas com avaria | 4% (1 de 25 entregas) | 0.20 |
| Tempo medio de entrega (dias) | 18 dias (prazo contratual: 30 dias) | 0.20 |
| Devolucoes / Trocas | 8% (2 de 25 entregas) | 0.15 |
| Satisfacao do contratante (NPS) | 8.2 / 10 | 0.15 |

### Score Logistico Calculado

| Dimensao | Score | Classificacao |
|---|---|---|
| Pontualidade | 92% | Excelente (verde) |
| Integridade | 96% | Excelente (verde) |
| Eficiencia | 85% (18/30 dias = 40% de folga) | Bom (verde) |
| Qualidade | 92% | Excelente (verde) |
| Satisfacao | 82% | Bom (verde) |
| **Score Logistico Final** | **89%** | **Excelente** |

### Passos detalhados

| # | Acao | Selector | Dado | Assert |
|---|------|----------|------|--------|
| 1 | Selecionar edital ganho | `select, [role="combobox"]` | Edital "monitor multiparametrico" | Edital selecionado |
| 2 | Clicar Score Logistico | `button:has-text("Score Logistico")` | — | Tela de score carregada |
| 3 | Verificar Pontualidade | `text=Pontualidade` | — | Score 92% visivel |
| 4 | Verificar Integridade | `text=Integridade` | — | Score 96% visivel |
| 5 | Verificar Eficiencia | `text=Eficiencia` | — | Score 85% visivel |
| 6 | Verificar Qualidade | `text=Qualidade` | — | Score 92% visivel |
| 7 | Verificar Satisfacao | `text=Satisfacao` | — | Score 82% visivel |
| 8 | Verificar score final | `text=89%` ou `text=89` | — | Score final 89% |
| 9 | Verificar classificacao | `text=Excelente` | — | Classificacao "Excelente" |
| 10 | Verificar grafico radar | `canvas` ou `svg` | — | Grafico com 5 dimensoes |
| 11 | Verificar recomendacoes | `text=Recomendac` | — | Card com recomendacoes da IA |

### Verificacoes finais (assertions)

```typescript
// Verificar score final
await expect(page.locator('text=89%').or(page.locator('text=89'))).toBeVisible();
await expect(page.locator('text=Excelente')).toBeVisible();

// Verificar grafico radar
await expect(page.locator('canvas, svg').first()).toBeVisible();

// Verificar 5 dimensoes presentes
await expect(page.locator('text=Pontualidade')).toBeVisible();
await expect(page.locator('text=Integridade')).toBeVisible();
await expect(page.locator('text=Eficiencia')).toBeVisible();
await expect(page.locator('text=Qualidade')).toBeVisible();
await expect(page.locator('text=Satisfacao')).toBeVisible();
```

> **Nota para execucao manual:** Verificar o grafico radar com as 5 dimensoes, os scores individuais e o score final. Conferir as recomendacoes da IA para melhoria logistica.

---

## Dependencias entre UCs

| UC | Depende de |
|----|-----------|
| UC-I01 | — (edital salvo na Sprint 2) |
| UC-I02 | UC-I01 (inconsistencias listadas) |
| UC-I03 | UC-I02 (inconsistencias selecionadas) |
| UC-I04 | — (independente, apenas requer edital) |
| UC-I05 | — (independente, apenas requer edital) |
| UC-RE01 | — (edital com resultado de licitacao) |
| UC-RE02 | UC-RE01 (edital selecionado na RecursosPage) |
| UC-RE03 | UC-RE02 (analise tecnica disponivel para contexto do chat) |
| UC-RE04 | UC-RE02 (comparativo tecnico disponivel) |
| UC-RE05 | — (segundo edital, cenario independente) |
| UC-RE06 | UC-RE04 (laudo de recurso gerado) |
| UC-FU01 | — (edital com resultado para registrar) |
| UC-FU02 | UC-FU01 (resultado "Ganho" registrado) |
| UC-FU03 | UC-FU01 (resultado "Ganho" registrado) |

---

## Ordem de Execucao Recomendada

```
FASE 1 — IMPUGNACAO
1.  UC-I01  — Validacao Legal do Edital
2.  UC-I02  — Sugerir Esclarecimento ou Impugnacao
3.  UC-I03  — Gerar Peticao de Impugnacao
4.  UC-I04  — Upload de Peticao Externa
5.  UC-I05  — Controle de Prazo

FASE 2 — RECURSOS
6.  UC-RE01 — Monitorar Janela de Recurso
7.  UC-RE02 — Analisar Proposta Vencedora
8.  UC-RE03 — Chatbox de Analise
9.  UC-RE04 — Gerar Laudo de Recurso
10. UC-RE05 — Gerar Laudo de Contra-Razao
11. UC-RE06 — Submissao Assistida no Portal

FASE 3 — FOLLOWUP
12. UC-FU01 — Registrar Resultado de Edital
13. UC-FU02 — Configurar Alertas de Vencimento
14. UC-FU03 — Score Logistico
```

> **Nota:** A Fase 1 (Impugnacao) e a Fase 2 (Recursos) podem ser executadas em paralelo, pois sao independentes entre si. A Fase 3 (Followup) depende de resultados registrados e deve ser executada por ultimo.

---

## Fixtures Necessarios

| Fixture | Caminho | Uso |
|---------|---------|-----|
| PDF generico para uploads | `tests/fixtures/teste_upload.pdf` | UC-I04, UC-RE06 (laudo, procuracao, documentos) |

**Verificar existencia dos fixtures antes de executar:**

```typescript
import * as fs from 'fs';

test.beforeAll(() => {
  const fixtures = [
    'tests/fixtures/teste_upload.pdf',
  ];
  for (const f of fixtures) {
    if (!fs.existsSync(f)) {
      throw new Error(`Fixture ausente: ${f}`);
    }
  }
});
```

---

## Rotas das Paginas

| Pagina | Rota | Menu Lateral |
|---|---|---|
| ImpugnacaoPage | `/app/impugnacao` | Impugnacao |
| RecursosPage | `/app/recursos` | Recursos |
| FollowupPage | `/app/followup` | Followup |

---

## Notas para Validacao

1. **Dependencia de Sprints anteriores:** os testes da Sprint 4 dependem de editais salvos (Sprint 2) e propostas geradas (Sprint 3). Executar Sprints 1-3 antes.
2. **Edital de referencia:** usar o edital de "monitor multiparametrico" salvo no UC-CV03 da Sprint 2. Se nao disponivel, salvar um novo edital com busca por "monitor multiparametrico" na CaptacaoPage.
3. **Analise legal (UC-I01):** os resultados da IA variam conforme o texto do edital. As inconsistencias listadas neste documento sao representativas do tipo esperado.
4. **Geracao de peticoes e laudos (UC-I03, UC-RE04, UC-RE05):** a IA gera textos juridicos com base no contexto. O validador deve verificar a presenca das secoes obrigatorias (cabecalho, qualificacao, fatos, direito, pedido, fechamento).
5. **Comparativo tecnico (UC-RE02):** os dados do concorrente sao simulados para fins de validacao. Em producao, a proposta vencedora sera carregada do portal de compras.
6. **Chatbox (UC-RE03):** o chat mantem contexto da conversa. Fazer perguntas em sequencia para validar a retencao de contexto.
7. **Prazos (UC-I05, UC-RE01):** as datas sao exemplos. O sistema deve calcular prazos com base na data de abertura real do edital.
8. **Score Logistico (UC-FU03):** os dados de performance sao simulados. Em producao, serao alimentados pelo historico real de entregas da empresa.
9. **Arquivo de teste para uploads:** usar `tests/fixtures/teste_upload.pdf` como substituto de qualquer PDF.
10. **Ordem de execucao recomendada:** UC-I01 a UC-I05 (Impugnacao), depois UC-RE01 a UC-RE06 (Recursos), depois UC-FU01 a UC-FU03 (Followup).

**Credenciais de autenticacao:**
- Usuario: `valida1@valida.com.br` / Senha: `123456`
- Perfil: Superusuario
- Empresa: CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
- O helper `login()` ja lida automaticamente com a tela de selecao de empresa.

**URL base:**
- Frontend: `http://pasteurjr.servehttp.com:5179`
- Configurar em `playwright.config.ts`: `baseURL: 'http://pasteurjr.servehttp.com:5179'`
