# LEIAME — Documentacao de Validacao por Sprints

**Sistema:** Facilitia.ia — Sistema de Gestao de Editais com IA
**URL de acesso:** http://pasteurjr.servehttp.com:5179
**Repositorio:** github.com/pasteurjr/agenteditais

---

## Visao Geral

Este projeto utiliza um processo de validacao baseado em **casos de uso**, **dados de teste**, **tutoriais de automacao** e **relatorios de validacao**. Cada sprint possui um conjunto de documentos que se complementam em cadeia:

```
CASOS DE USO  -->  DADOS DE TESTE  -->  TUTORIAL  -->  SPEC PLAYWRIGHT  -->  RELATORIO
(requisitos)      (o que inserir)     (como testar)   (automacao)          (resultado)
```

Cada sprint e validada com **2 conjuntos de dados** para 2 empresas diferentes, garantindo que o sistema funciona para qualquer empresa:
- **Conjunto 1** — Automacao Playwright (empresa CH Hospitalar)
- **Conjunto 2** — Validacao humana manual (empresa RP3X)

---

## Sprint 1 — Empresa, Portfolio e Parametrizacoes

A Sprint 1 cobre o cadastro da empresa, seus produtos (portfolio) e as parametrizacoes do sistema (areas, classes, subclasses, fontes, certidoes, palavras-chave, NCMs, pesos GO/NO-GO).

### Documentos

| Documento | Descricao |
|-----------|-----------|
| `CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md` | Especificacao dos 58 casos de uso (UC-001 a UC-058) — telas, campos, eventos, respostas do sistema |
| `dadosempportpar-1.md` | Dados de teste Conjunto 1 — empresa CH Hospitalar, 2 produtos, parametrizacoes completas |
| `dadosempportpar-2.md` | Dados de teste Conjunto 2 — empresa RP3X Biotecnologia, 2 produtos, parametrizacoes completas |
| `tutorialsprint1-1.md` | Tutorial Playwright (Conjunto 1) — roteiro passo a passo para automacao dos 58 UCs com CH Hospitalar |
| `tutorialsprint1-2.md` | Tutorial de validacao humana (Conjunto 2) — roteiro manual para RP3X |
| `RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md` | Relatorio de validacao automatizada — 322 testes, screenshots, analise de conformidade |
| `relatorio_aceitacao_sprint1_2.md` | Relatorio de aceitacao consolidado das Sprints 1 e 2 |

### Testes Playwright

| Arquivo | Descricao |
|---------|-----------|
| `tests/e2e/playwright/tutorial-sprint1-1.spec.ts` | Spec completo — 58 UCs (UC-001 a UC-058), ~322 testes |
| `tests/e2e/playwright/uc-001.spec.ts` a `uc-058.spec.ts` | Specs individuais por UC (validacao anterior) |
| `tests/e2e/playwright/helpers.ts` | Helpers compartilhados: login(), navTo(), clickTab(), waitForIA() |

### Como executar os testes da Sprint 1

```bash
# Pre-requisito: sistema rodando em http://pasteurjr.servehttp.com:5179
# Ou localmente em http://localhost:5175 (frontend) + http://localhost:5007 (backend)

# Todos os testes da Sprint 1 (Conjunto 1 — CH Hospitalar):
npx playwright test tests/e2e/playwright/tutorial-sprint1-1.spec.ts --reporter=list

# Um UC especifico (ex: UC-005):
npx playwright test tests/e2e/playwright/uc-005.spec.ts --reporter=list
```

### Credenciais Sprint 1

| Conjunto | Email | Senha | Empresa |
|----------|-------|-------|---------|
| 1 (Playwright) | valida1@valida.com.br | 123456 | CH Hospitalar |
| 2 (Manual) | valida2@valida.com.br | 123456 | RP3X Biotecnologia |

---

## Sprint 2 — Captacao e Validacao

A Sprint 2 cobre a busca de editais publicos (PNCP, BEC-SP), analise por IA com scores multidimensionais, decisoes GO/NO-GO, monitoramento automatico, confrontacao documental, analise de riscos/mercado/concorrentes, e IA interativa.

### Documentos

| Documento | Descricao |
|-----------|-----------|
| `CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md` | Especificacao dos 13 casos de uso (UC-CV01 a UC-CV13) — telas, campos, eventos, respostas |
| `dadoscapval-1.md` | Dados de teste Conjunto 1 — termos de busca, filtros, estrategias para CH Hospitalar |
| `dadoscapval-2.md` | Dados de teste Conjunto 2 — termos de busca, filtros, estrategias para RP3X |
| `tutorialsprint2-1.md` | Tutorial Playwright (Conjunto 1) — roteiro passo a passo para os 13 UCs com CH Hospitalar |
| `tutorialsprint2-2.md` | Tutorial de validacao humana (Conjunto 2) — roteiro manual para RP3X |
| `RESULTADO VALIDACAO SPRINT2.md` | Relatorio de validacao automatizada — 18 testes, 48 screenshots, verificacao de banco, analise de conformidade |

### Testes Playwright

| Arquivo | Descricao |
|---------|-----------|
| `tests/e2e/playwright/validacao-sprint2.spec.ts` | Spec completo — 13 UCs (UC-CV01 a UC-CV13), 18 testes com assertions reais |
| `tests/verificar_banco_sprint2.py` | Script de verificacao de banco MySQL — 9 checks (editais, estrategias, monitoramentos, validacoes legais, decisoes GO) |

### Como executar os testes da Sprint 2

```bash
# Pre-requisito: sistema rodando (backend + frontend)
# O spec aponta para http://localhost:5175

# Todos os testes da Sprint 2 (Conjunto 1 — CH Hospitalar):
npx playwright test tests/e2e/playwright/validacao-sprint2.spec.ts --reporter=list

# Verificacao de banco apos os testes:
python3 tests/verificar_banco_sprint2.py

# Screenshots sao salvas em:
# runtime/screenshots/validacao-sprint2/
```

### Credenciais Sprint 2

| Conjunto | Email | Senha | Empresa |
|----------|-------|-------|---------|
| 1 (Playwright) | valida1@valida.com.br | 123456 | CH Hospitalar |
| 2 (Manual) | valida2@valida.com.br | 123456 | RP3X Biotecnologia |

---

## Sprints 3-5 — Documentos de requisitos disponíveis

As Sprints 3 a 5 possuem documentos de casos de uso mas ainda **nao possuem tutoriais nem specs Playwright** no formato V2:

| Sprint | Documento de Casos de Uso | Escopo |
|--------|--------------------------|--------|
| 3 | `CASOS DE USO PRECIFICACAO E PROPOSTA V2.md` | Precificacao por camadas, propostas, submissao |
| 4 | `CASOS DE USO RECURSOS E IMPUGNACOES V2.md` | Impugnacoes, recursos, contra-razoes |
| 5 | `CASOS DE USO SPRINT5 V2.md` | Followup, CRM, execucao de contrato, atas |

Relatorios de aceitacao anteriores (validacao em formato antigo):
- `relatorio_aceitacao_sprint3.md`
- `relatorio_aceitacao_sprint4.md`
- `relatorio_aceitacao_sprint5.md`

---

## Estrutura de diretórios relevante

```
docs/
  CASOS DE USO ... V2.md          # Especificacoes de requisitos (por sprint)
  dadosempportpar-1.md / -2.md    # Dados de teste Sprint 1 (2 conjuntos)
  dadoscapval-1.md / -2.md        # Dados de teste Sprint 2 (2 conjuntos)
  tutorialsprint1-1.md / -2.md    # Tutoriais Sprint 1 (Playwright + manual)
  tutorialsprint2-1.md / -2.md    # Tutoriais Sprint 2 (Playwright + manual)
  RELATORIO_VALIDACAO_SPRINT1...  # Resultado da validacao Sprint 1
  RESULTADO VALIDACAO SPRINT2.md  # Resultado da validacao Sprint 2
  relatorio_aceitacao_sprint*.md  # Relatorios de aceitacao (Sprints 1-5)

tests/e2e/playwright/
  helpers.ts                      # Helpers: login, navTo, clickTab, waitForIA
  tutorial-sprint1-1.spec.ts      # Spec Sprint 1 (58 UCs, ~322 testes)
  validacao-sprint2.spec.ts       # Spec Sprint 2 (13 UCs, 18 testes)
  uc-001.spec.ts ... uc-058.spec.ts  # Specs individuais Sprint 1

tests/
  verificar_banco_sprint2.py      # Verificacao MySQL pos-teste

runtime/screenshots/              # Screenshots capturadas pelos testes
```

---

## Cadeia de documentos — como usar

### Para entender o que o sistema faz:
1. Leia o documento de **CASOS DE USO** da sprint desejada

### Para validar automaticamente (Conjunto 1 — CH Hospitalar):
1. Leia o **tutorial** (ex: `tutorialsprint2-1.md`) para entender o roteiro
2. Execute o **spec Playwright** correspondente
3. Verifique as **screenshots** em `runtime/screenshots/`
4. Consulte o **relatorio de validacao** para ver resultados e analises

### Para validar manualmente (Conjunto 2 — RP3X):
1. Acesse http://pasteurjr.servehttp.com:5179
2. Login: valida2@valida.com.br / 123456
3. Siga o **tutorial manual** (ex: `tutorialsprint2-2.md`)
4. Use os **dados de teste** do Conjunto 2 (ex: `dadoscapval-2.md`)

---

## Acesso ao sistema

| Recurso | URL |
|---------|-----|
| Aplicacao (producao) | http://pasteurjr.servehttp.com:5179 |
| Aplicacao (dev local) | http://localhost:5175 |
| Backend API | http://localhost:5007 |

### Usuarios de teste

| Email | Senha | Perfil | Empresas |
|-------|-------|--------|----------|
| valida1@valida.com.br | 123456 | Superusuario | CH Hospitalar, RP3X, HBSJ |
| valida2@valida.com.br | 123456 | Superusuario | CH Hospitalar, RP3X, HBSJ |

---

## Convencao de nomenclatura

| Padrao | Significado | Exemplo |
|--------|------------|---------|
| `V2` | Versao 2 do documento (revisada) | `CASOS DE USO ... V2.md` |
| `-1` / `-2` | Conjunto 1 (Playwright) / Conjunto 2 (manual) | `dadoscapval-1.md` |
| `UC-XXX` | Caso de uso Sprint 1 (001-058) | `UC-005` |
| `UC-CVXX` | Caso de uso Sprint 2 Captacao/Validacao | `UC-CV08` |
| `uc-xxx.spec.ts` | Spec individual por UC | `uc-005.spec.ts` |
| `tutorial-sprint1-1` | Spec consolidado do tutorial | Todos os UCs num arquivo |
| `validacao-sprint2` | Spec de validacao completa | 18 testes, assertions reais |

---

*Documento criado em 08/04/2026*
