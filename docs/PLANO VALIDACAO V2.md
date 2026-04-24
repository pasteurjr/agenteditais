# PLANO: Sistema de Validação Automatizada de UCs (Facilicita.IA)

**Data:** 2026-04-24
**Base:** 3 documentos especificativos em `docs/` (validar-uc.md, corrigir-divergencias.md, CLAUDE.md) + Casos de Uso V5 (Sprints 1-5) + infraestrutura Playwright existente.

---

## Context

Hoje o projeto tem 173 specs Playwright soltos (muitos ad-hoc gerados pro ciclo Arnaldo), `helpers.ts` reutilizável (`login`, `navTo`, `ssPath`), `playwright.config.ts` (porta errada: 5175 é ZARPA), 5 docs de UCs V5 cobrindo Sprints 1-5, 9 agents em `.claude/agents/`, mas **zero** comandos slash customizados, **zero** tutoriais estruturados (humano/playwright separados), **zero** relatórios auditáveis padronizados, **zero** loop de correção automática.

Os 3 docs descrevem um processo formal de validação em 4 fases (síntese → tutoriais → execução 3-camadas → relatório) + loop de correção com impasses classificados. A ideia é substituir o caos atual por um pipeline reproduzível onde: **caso de uso é a verdade, código é hipótese, PO valida em paralelo**.

Objetivo: instalar os 2 slash commands (`/validar-uc`, `/corrigir-divergencias`) + estrutura de diretórios + CLAUDE.md + harness de execução reutilizando a infra existente, e **piloto com 1 UC da Sprint 1** antes de escalar pros 40+ UCs restantes das Sprints 1-5.

---

## Escopo desta implementação

### O que entra
1. Instalação dos 2 slash commands + CLAUDE.md
2. Estrutura de diretórios `testes/` conforme especificação
3. Correção do `playwright.config.ts` (porta 5180) + mover 173 specs antigos pra `tests/e2e/playwright/legacy/` (não apagar)
4. Conversão dos **5 docs V5 (Sprints 1-5)** em arquivos individuais em `testes/casos_de_uso/UC-<id>.md` (um por UC)
5. Template de tutorial humano e playwright derivados de `helpers.ts` existente
6. Runner de execução: `scripts/run-validation.ts` (invocado pelo slash command)
7. Piloto end-to-end: UC-F01 (Cadastrar Empresa) — gerar 2 tutoriais, executar playwright, produzir relatório

### O que NÃO entra (fora de escopo)
- Sprints 6-9 (não têm V5, entram em sprint seguinte quando V5 for gerado)
- Integração MCP/CI (pode virar extensão depois)
- Gerar V5 dos UCs que não têm

---

## Arquivos a criar / modificar

### Novos arquivos

| Caminho | Papel |
|---|---|
| `CLAUDE.md` (raiz) | Contexto Facilicita.IA (adaptação de `docs/CLAUDE.md`) |
| `.claude/commands/validar-uc.md` | Cópia ajustada de `docs/validar-uc.md` |
| `.claude/commands/corrigir-divergencias.md` | Cópia ajustada de `docs/corrigir-divergencias.md` |
| `.claude-protected` | Lista de arquivos/dirs proibidos de correção automática |
| `testes/casos_de_uso/README.md` | Índice de UCs |
| `testes/casos_de_uso/UC-F01.md` … `UC-F17.md` | Sprint 1 (split de `CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md`) |
| `testes/casos_de_uso/UC-CV01.md` … `UC-CV13.md` | Sprint 2 (split de `CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md`) |
| `testes/casos_de_uso/UC-P01.md` … `UC-P12.md` + `UC-R01.md` … `UC-R07.md` | Sprint 3/4 |
| `testes/casos_de_uso/UC-I01.md` … `UC-I05.md` + `UC-RE01.md` … `UC-RE06.md` | Sprint 4 |
| `testes/casos_de_uso/UC-FU01.md` etc (26 UCs) | Sprint 5 |
| `testes/tutoriais_humano/.gitkeep` | Placeholder |
| `testes/tutoriais_playwright/.gitkeep` | Placeholder |
| `testes/relatorios/.gitkeep` | Placeholder |
| `testes/fixtures/seeds/uc-f01-baseline.sql` | Seed do piloto |
| `scripts/run-validation.ts` | Orquestra execução Playwright + análise semântica |
| `scripts/split-uc-v5.py` | Script one-shot que quebra os 5 docs V5 em N UCs |
| `scripts/lib/judge-semantic.ts` | Análise semântica via Anthropic SDK (voto majoritário) |
| `scripts/lib/report-generator.ts` | Monta markdown do relatório |

### Arquivos modificados

| Caminho | Mudança |
|---|---|
| `playwright.config.ts` | `baseURL: http://localhost:5180`; adicionar projeto `editaisvalida` em `5179` |
| `tests/e2e/playwright/helpers.ts` | Adicionar `captureA11yTree(page)` e `setupNetworkInterceptor(page)` |
| `package.json` | Novo script: `"validate-uc": "ts-node scripts/run-validation.ts"` |
| `.gitignore` | Ignorar `testes/relatorios/*/evidencias/` (screenshots grandes) |

### Arquivos a mover (não apagar)

- `tests/e2e/playwright/*.spec.ts` (173 arquivos) → `tests/e2e/playwright/legacy/*.spec.ts`. Mantidos como legado documental.

---

## Reuso de código existente

| Existente | Reutilizar em |
|---|---|
| `tests/e2e/playwright/helpers.ts` (`login`, `navTo`, `ssPath`, `expandSection`) | Todos tutoriais Playwright gerados via `/validar-uc` |
| `.claude/agents/qa-engineer` | Subagent para análise de causa raiz (Fase 2 do `/corrigir-divergencias`) |
| `.claude/agents/page-engineer-sprint{N}` | Subagents que fazem correções de código (Fase 3) |
| `.claude/settings.json` | Já tem `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` → usado pro loop |
| `backend/crud_routes.py::_friendly_error` | Padrão de correção via loop |
| `docs/ANALISE_*` | Material de referência para classificação de divergências |

---

## Passos de implementação (ordem)

### Fase A — Instalação (sem quebrar nada)
1. Criar `CLAUDE.md` na raiz (derivado de `docs/CLAUDE.md` com caminhos reais do projeto)
2. Criar `.claude/commands/validar-uc.md` e `.claude/commands/corrigir-divergencias.md` (cópia dos docs, ajustes só nos caminhos)
3. Criar `.claude-protected` listando zonas protegidas (ver seção dedicada abaixo)
4. Criar as 4 pastas `testes/{casos_de_uso,tutoriais_humano,tutoriais_playwright,relatorios}` com `.gitkeep`
5. Adicionar ao `.gitignore`: `testes/relatorios/*/evidencias/`

### Fase B — Correção da config
6. `playwright.config.ts`: mudar `baseURL` pra `http://localhost:5180`; adicionar projetos para agenteditais e editaisvalida (5179)
7. Mover os 173 specs antigos pra `tests/e2e/playwright/legacy/` (mkdir + mv em lote). NÃO apagar.

### Fase C — Split dos UCs V5
8. Escrever `scripts/split-uc-v5.py`: lê cada doc V5, quebra por `UC-<ID>`, gera 1 arquivo por UC em `testes/casos_de_uso/`. Preserva estrutura (RNs, pré/pós-condições, sequência, FA/FE, tela, mapeamento).
9. Rodar o script nos 5 docs → esperado: ~80 arquivos `UC-*.md`.
10. Gerar `testes/casos_de_uso/README.md` com índice tabulado (ID × Nome × Sprint × Arquivo).

### Fase D — Harness de execução
11. `scripts/lib/judge-semantic.ts`: função que recebe descrição ancorada + screenshot + elementos obrigatórios/proibidos, retorna JSON do veredito via Anthropic SDK (modelo `claude-opus-4-7`). Voto majoritário se `confianca < 0.85`.
12. `scripts/lib/report-generator.ts`: monta markdown conforme Fase 4 da especificação.
13. `scripts/run-validation.ts`: recebe UC-ID, lê tutorial playwright correspondente, executa passo-a-passo com 3 camadas (DOM → rede → semântica), grava evidências em `testes/relatorios/<uc_id>/<timestamp>/`, chama `report-generator`.
14. Adicionar em `helpers.ts`: `captureA11yTree(page)` via `page.accessibility.snapshot()` e `setupNetworkInterceptor(page)` que retorna objeto com array de request/response.

### Fase E — Piloto UC-F01
15. Rodar `/validar-uc` apontando pra `testes/casos_de_uso/UC-F01.md`. Passa pelos 4 checkpoints:
    - Checkpoint 1.4: confirmar dados sintetizados (humano + playwright)
    - Checkpoint 2.4: confirmar tutoriais gerados
    - Execução Fase 3
    - Relatório Fase 4
16. Executar tutorial humano em paralelo (o PO — Pasteur) e comparar.
17. Ajustar: descrição ancorada ambígua, seletores frágeis, dados insuficientes.

### Fase F — Documentação
18. `docs/PROCESSO_VALIDACAO_V2.md`: fluxo novo, diferença vs antigo (ciclo Arnaldo), como o PO participa, como interpretar impasses.
19. Atualizar `CLAUDE.md` da raiz com lições do piloto.

---

## Decisões arquiteturais

1. **Por que `legacy/` e não apagar os 173 specs?** Muitos validaram correções já aceitas; servem de referência histórica. Não rodam no config novo (porta muda) — ficam disponíveis mas desligados.

2. **Por que 1 arquivo por UC e não manter docs V5 monolíticos?** O protocolo `/validar-uc` recebe 1 UC por vez. Facilita diff, rastreabilidade do que mudou entre versões, e piloto incremental.

3. **Por que Anthropic SDK direto e não subagent Task?** Juiz semântico precisa de prompt JSON estruturado, voto majoritário, controle fino de custo. Subagent é mais caro e menos previsível.

4. **Por que não incluir Sprints 6-9?** V5 não existe ainda. Piloto 1-5 primeiro, depois gera V5 das 6-9 com o mesmo padrão.

5. **Por que piloto com UC-F01?** É o mais simples (cadastro de empresa), já tem prova de conceito via ciclo Arnaldo, e nenhum caminho crítico envolve zona protegida.

---

## Zonas protegidas (conteúdo do `.claude-protected`)

```
# Lógica financeira crítica — decisão humana obrigatória
backend/tools.py:calcular_score
backend/tools.py:aplicar_mascara_lote

# Integrações externas com efeitos em sistemas terceiros
backend/pncp_client.py
backend/brave_client.py
backend/anvisa_client.py

# Auditoria e RN
backend/rn_validators.py
backend/rn_audit.py
backend/rn_estados.py

# Migrations e seeds
backend/seeds/
backend/migrations/

# Autenticação e autorização
backend/auth_routes.py
backend/jwt_*.py

# Configuração
.env
.env.*
backend/config.py
```

---

## Verificação end-to-end

1. **Instalação limpa**: `ls .claude/commands/` lista `validar-uc.md` e `corrigir-divergencias.md`. `/validar-uc` aparece na lista do Claude Code.
2. **Split correto**: `ls testes/casos_de_uso/UC-*.md | wc -l` retorna **≥ 80**.
3. **Config correta**: `npx playwright test --list | head -3` mostra specs da pasta `tests/` apontando para `http://localhost:5180`.
4. **Piloto UC-F01**:
   - Gera `testes/tutoriais_humano/UC-F01_humano.md`
   - Gera `testes/tutoriais_playwright/UC-F01_happy_path.md`
   - Executa e produz `testes/relatorios/UC-F01_<timestamp>.md` com veredito APROVADO
   - Screenshots em `testes/relatorios/UC-F01/<timestamp>/`
5. **Loop de correção (teste seco)**: introduzir bug intencional no frontend (ex: trocar texto "Salvo!" por "Ok"), rodar `/corrigir-divergencias UC-F01`, verificar que detecta, classifica como `DEFEITO_CODIGO_OBVIO`, propõe diff, aplica, re-valida e passa.
6. **Cross-check manual**: PO roda tutorial humano do UC-F01, checa se resultado bate com o relatório automático.
7. **Zonas protegidas**: tentar forçar o loop a modificar `backend/rn_validators.py` → deve recusar com `IMPASSE_ZONA_PROTEGIDA`.

---

## Estimativa de esforço

- Fase A: 15 min (arquivos prontos nos docs)
- Fase B: 10 min (config + mv em lote)
- Fase C: 1h (script + split + revisão)
- Fase D: 3h (harness é o maior item; judge semântico precisa test fixture)
- Fase E: 2h (piloto real + ajustes)
- Fase F: 30 min

Total: ~7h focadas. Recomendado dividir em 2 sessões: A+B+C em uma, D+E+F em outra.
