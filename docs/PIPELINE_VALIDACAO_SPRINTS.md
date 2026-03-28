# Pipeline de Validação de Sprints — Agente de Editais

**Versão:** 1.0
**Data:** 28/03/2026
**Objetivo:** Padronizar a validação de cada sprint com 4 agentes sequenciais, garantindo qualidade da especificação, execução completa dos casos de uso, e relatório de aceitação com evidências reais.

---

## Visão Geral

```
Agente 0 (PREPARADOR)
    ↓ dados de teste prontos, servidores OK, build OK
Agente 1 (ESPECIFICADOR)
    ↓ qualidade da spec + gaps + correções + validação legal
Agente 2 (EXECUTOR)
    ↓ screenshots por passo + fluxos negativos + tempos IA + bugs
Agente 3 (RELATOR)
    ↓ corrige bugs + relatório final com matriz de rastreabilidade + parecer
```

---

## Agente 0: PREPARADOR

**Objetivo:** Garantir que o ambiente está pronto para validação — dados de teste, servidores, build.

### Checklist de Preparação

| # | Verificação | Comando | Esperado |
|---|-------------|---------|----------|
| 1 | Backend compila sem erros | `cd backend && python3 -c "from app import app"` | Sem erros |
| 2 | Frontend compila sem erros | `cd frontend && npx tsc --noEmit` | Sem erros |
| 3 | Frontend builda | `cd frontend && npx vite build` | Build OK |
| 4 | Backend sobe | `python3 backend/app.py` na porta 5007 | 405 no GET /api/auth/login |
| 5 | Frontend sobe | `cd frontend && npm run dev` na porta 5175 | 200 no GET / |
| 6 | Login funciona | POST /api/auth/login com credenciais | access_token retornado |
| 7 | Dados de teste existem | Verificar editais, contratos, propostas no banco | Ao menos 3 editais |

### Ações do Preparador

1. Subir backend e frontend
2. Verificar login via API
3. Verificar se há dados mínimos no banco:
   - Editais com status variados (novo, validado, submetido, ganho, perdido)
   - Ao menos 1 edital com PDF anexado (para análise de IA)
   - Ao menos 1 contrato vigente (para sprints que usam contratos)
   - Ao menos 1 proposta (para sprints que usam propostas)
4. Se dados insuficientes, criar via seed ou API
5. Confirmar que todas as portas estão livres (matar processos antigos)

### Output
- ✅ ou ❌ para cada item do checklist
- Dados de teste disponíveis listados

---

## Agente 1: ESPECIFICADOR (Analista de Qualidade de Especificação)

**Objetivo:** Avaliar a qualidade e completude da documentação da sprint, comparando documento fonte, casos de uso e requisitos.

### Inputs

| Documento | Exemplo Sprint 4 |
|-----------|-------------------|
| Documento fonte da sprint | `SPRINT RECURSOS E IMPUGNACOES - V02.docx` |
| Casos de uso | `CASOS DE USO RECURSOS E IMPUGNACOES.md` |
| Requisitos | `requisitos_completosv6.md` (seção da sprint) |
| Código implementado | `backend/app.py`, `backend/tools.py`, `frontend/src/pages/*.tsx` |

### Análises a Realizar

#### 1. Cobertura Documento Fonte → Casos de Uso
- Cada funcionalidade descrita no documento fonte virou um UC?
- Há funcionalidades no doc fonte que NÃO têm UC correspondente?
- Há UCs que NÃO estão no documento fonte (foram adicionados)?

#### 2. Cobertura Casos de Uso → Requisitos
- Cada UC referencia o RF correto?
- Os RFs no requisitos_completosv*.md estão corretos e completos?
- Há RFs sem UC ou UCs sem RF?

#### 3. Qualidade da Sequência de Eventos
- Cada passo é claro e executável?
- Os campos referenciados ([F01], [F02]...) existem no layout da tela?
- A sequência cobre o fluxo principal E fluxos alternativos/erro?
- Há passos que dependem de integração externa (portal, API) — estão marcados?

#### 4. Qualidade da Interface (UX)
- O layout da tela (ASCII art) é coerente com os campos listados?
- Campos obrigatórios estão marcados?
- Mensagens de erro/validação estão definidas?
- O fluxo de navegação entre telas/abas é lógico?

#### 5. Validação Legal (se aplicável)
- Artigos de lei citados estão corretos?
- Limites legais (25%, 50%, 3 dias úteis) estão implementados?
- Fundamentação legal nas telas corresponde aos artigos corretos?

#### 6. Cobertura Implementação → Especificação
- O código implementado cobre o que o UC descreve?
- Há funcionalidade especificada mas NÃO implementada?
- Há funcionalidade implementada mas NÃO especificada?

### Output

```markdown
## Relatório de Qualidade da Especificação — Sprint {N}

### 1. Cobertura Doc Fonte → UCs
| Funcionalidade Doc Fonte | UC | Status |
|---|---|---|
| "Ler e interpretar edital" | UC-I01 | ✅ Coberto |
| "Gerar petição automática" | UC-I03 | ✅ Coberto |
| "Funcionalidade X" | — | ❌ GAP |

### 2. Gaps Encontrados
- [ ] Gap 1: ...
- [ ] Gap 2: ...

### 3. Inconsistências
- [ ] Inconsistência 1: UC diz X, RF diz Y
- [ ] Inconsistência 2: ...

### 4. Sequências de Eventos Incompletas
- [ ] UC-XX passo N: falta definir o que acontece se...

### 5. Sugestões de Melhoria UX
- [ ] ...

### 6. Implementação vs Especificação
| UC | Especificado | Implementado | Delta |
|---|---|---|---|
| UC-I01 | 13 passos | 10 passos | ⚠️ 3 passos faltam |
```

---

## Agente 2: EXECUTOR (Testador E2E via Playwright)

**Objetivo:** Executar CADA passo da sequência de eventos de CADA caso de uso, capturando screenshots e avaliando respostas.

### Regras de Execução

1. **Para CADA UC**, seguir TODOS os passos da sequência de eventos
2. **Capturar screenshot APÓS cada evento significativo:**
   - Ação do ator (campo preenchido, botão clicado)
   - Resposta do sistema (resultado carregado, modal aberto, IA processou)
3. **Nomear screenshots por UC e passo:**
   - Formato: `UC-{CODE}-{PASSO}_{descricao}.png`
   - Exemplo: `UC-I01-01_pagina_inicial.png`, `UC-I01-02_edital_selecionado.png`, `UC-I01-03_ia_processando.png`, `UC-I01-04_resultado_analise.png`
4. **Esperar respostas de IA** — usar waitForTimeout adequado:
   - Operações simples (CRUD, navegação): 2-3s
   - Análise de IA (validação legal, geração de laudo): 30-60s
   - Extração de PDF: 45-90s
5. **Avaliar cada resposta:**
   - A tela mostra o que o UC define?
   - Os campos estão corretos?
   - Os badges/cores estão corretos?
   - A resposta da IA tem conteúdo (não é vazio ou erro)?
6. **Testar fluxos negativos** (ao menos 1 por UC):
   - Submeter sem preencher campo obrigatório
   - Selecionar opção inválida
   - Verificar mensagem de erro
7. **Medir tempos de resposta** — console.log com duração de cada operação de IA

### Padrão de Teste Playwright

```typescript
test("UC-{CODE}-{PASSO}: {Descrição do passo}", async ({ page }) => {
  await login(page);
  await navTo(page, "{Página}");

  // Passo N: Ação do ator
  // ... (preencher campos, clicar botões)
  await page.screenshot({ path: `${SS}/UC-{CODE}-{PASSO}_acao.png`, fullPage: true });

  // Resposta do sistema
  await page.waitForTimeout(TEMPO_ADEQUADO);
  await page.screenshot({ path: `${SS}/UC-{CODE}-{PASSO}_resposta.png`, fullPage: true });

  // Avaliação
  const body = await page.innerText("body").catch(() => "");
  expect(body).toContain("TEXTO_ESPERADO");
});
```

### Output

- Pasta `testes/sprint{N}/screenshots/` com screenshots nomeados por passo
- Log de execução: `{total} testes, {passed} passaram, {failed} falharam`
- Lista de bugs encontrados com screenshot de evidência
- Tempos de resposta de IA registrados

---

## Agente 3: RELATOR (Gerador do Relatório de Aceitação)

**Objetivo:** Produzir o relatório final de aceitação, corrigir bugs encontrados, e emitir parecer como validador experiente.

### Inputs

- Relatório de qualidade do Agente 1
- Screenshots e resultados do Agente 2
- Bugs encontrados

### Ações

1. **Se houver bugs** — corrigir o código (backend/frontend) e re-executar os testes afetados
2. **Se houver gaps na especificação** — documentar no relatório com recomendações
3. **Gerar relatório** `ACEITACAOVALIDACAOSPRINT{N}.md`

### Estrutura do Relatório

```markdown
# RELATÓRIO DE ACEITAÇÃO E VALIDAÇÃO — Sprint {N}: {Tema}

**Data:** DD/MM/AAAA
**Validador:** Claude Code (Automatizado via Playwright)
**Metodologia:** Pipeline de 4 agentes (Preparador → Especificador → Executor → Relator)
**Documentos de Referência:** ...

**Total de Testes:** X | **Passou:** Y | **Falhou:** Z

---

## 1. Qualidade da Especificação (Agente 1)
- Resumo do relatório de qualidade
- Gaps encontrados e como foram tratados
- Inconsistências corrigidas

## 2. Matriz de Rastreabilidade
| Doc Fonte (trecho) | RF | UC | Passos Testados | Screenshots | Resultado |
|---|---|---|---|---|---|
| "O sistema deverá..." | RF-043-01 | UC-I01 | 1-8/13 | 4 | ✅ |

## 3. Execução por Caso de Uso (Agente 2)

### UC-{CODE}: {Nome}

**RF:** RF-XXX
**Sequência testada:** Passos X-Y de Z

| Passo | Ação do Ator | Resposta Esperada | Resposta Real | Resultado |
|---|---|---|---|---|
| 1 | Acessar página | 3 abas visíveis | 3 abas visíveis | ✅ |
| 2 | Selecionar edital X | Campos preenchidos | Campos preenchidos | ✅ |
| 4 | Clicar Analisar | IA processa | IA processou em 32s | ✅ |

**Screenshots:**
![Passo 1](screenshots/UC-{CODE}-01_pagina.png)
*Passo 1: Descrição*

![Passo 2](screenshots/UC-{CODE}-02_acao.png)
*Passo 2: Descrição*

**Avaliação:** ✅ ATENDE / ⚠️ PARCIAL / ❌ NÃO ATENDE

---

## 4. Bugs Encontrados e Correções

| Bug | UC | Descrição | Correção | Status |
|---|---|---|---|---|
| BUG-01 | UC-I01 | Timeout na IA | Aumentado timeout para 60s | ✅ Corrigido |

## 5. Métricas

| Métrica | Valor |
|---|---|
| UCs totais | 13 |
| UCs testados via UI | 9 |
| UCs parciais (dep. externa) | 4 |
| Total de passos testados | 87/120 |
| Cobertura de passos | 72.5% |
| Tempo médio IA | 35s |
| Screenshots gerados | 45 |

## 6. Dívida Técnica

| Item | UC | Justificativa |
|---|---|---|
| Sala de Lances não testada | UC-D01/D02 | Depende de portal ComprasNet |
| Submissão no portal | UC-RE06 | Depende de credenciais gov.br |

## 7. Parecer Final

**{APROVADO / APROVADO COM RESSALVAS / REPROVADO}**

{Parecer detalhado como validador experiente em licitações}
```

---

## Uso do Pipeline

### Para cada sprint:

```bash
# 1. Definir variáveis
SPRINT=4
DOC_FONTE="docs/SPRINT RECURSOS E IMPUGNACOES - V02.docx"
CASOS_USO="docs/CASOS DE USO RECURSOS E IMPUGNACOES.md"
REQUISITOS="docs/requisitos_completosv6.md"
PAGINAS="ImpugnacaoPage.tsx,RecursosPage.tsx"

# 2. Executar pipeline
# Agente 0: Preparar ambiente
# Agente 1: Analisar especificação
# Agente 2: Executar testes E2E
# Agente 3: Gerar relatório + corrigir bugs
```

### Artefatos Gerados

```
testes/sprint{N}/
├── screenshots/                          # Screenshots por passo do UC
│   ├── UC-{CODE}-01_{descricao}.png
│   ├── UC-{CODE}-02_{descricao}.png
│   └── ...
├── ACEITACAOVALIDACAOSPRINT{N}.md        # Relatório final
└── QUALIDADE_ESPECIFICACAO_SPRINT{N}.md  # Relatório do Agente 1 (opcional)

tests/
├── validacao_sprint{N}.spec.ts           # Testes Playwright
└── validacao_sprint{N}_complementar.spec.ts  # Testes complementares (se houver)
```

---

## Critérios de Aceitação

| Critério | Mínimo para APROVADO |
|---|---|
| Testes passando | 100% (bugs corrigidos antes do parecer) |
| Cobertura de UCs | 100% dos testáveis via UI |
| Cobertura de passos | ≥ 70% dos passos das sequências |
| Screenshots | ≥ 1 por UC (ideal: 1 por passo significativo) |
| Respostas de IA | Conteúdo real (não vazio/erro) |
| Rastreabilidade | Doc Fonte → RF → UC → Teste → Screenshot completa |
| Bugs críticos | 0 (todos corrigidos) |

### Critérios para REPROVADO

- UC inteiro não funciona (página crasheia)
- Endpoint retorna 500 consistentemente
- IA não responde (timeout permanente)
- Dados não persistem no banco
- Mais de 30% dos passos falham
