# PLANO: Sistema de Validação de UCs — 3 Trilhas (Facilicita.IA) V3

**Data:** 2026-04-24
**Substitui:** PLANO VALIDACAO V2.md
**Base:** validar-uc.md + corrigir-divergencias.md + CLAUDE.md + planovalidacaovisualautomatica.v1.md + Casos de Uso V5 (Sprints 1-5)

---

## Context

V2 propunha validação em 2 trilhas (humano + playwright automático). V3 adiciona uma terceira — **automática-visual acompanhada** — onde o PO (Pasteur) vê o browser rodando em tempo real, pausa a cada passo, anota correções via UI Flask, e o sistema documenta tudo. Essa trilha vem do `planovalidacaovisualautomatica.v1.md`.

**As 3 trilhas cobrem o MESMO UC com 3 perfis de dataset**, produzindo 3 artefatos independentes que convergem num cross-check final. Divergência entre trilhas vira sinal de qualidade do processo (PO decide manualmente).

---

## As 3 trilhas lado a lado

| # | Trilha | Modo | Ambiente | Dataset | Público | Artefato principal |
|---|---|---|---|---|---|---|
| 1 | **E2E (automática total)** | `--modo=e2e` | agenteditais :5180 | `E2E_<YYYYMMDD>_*` determinístico | CI / regressão | `testes/relatorios/automatico/<UC>_<ts>.md` |
| 2 | **Visual acompanhada** | `--modo=visual` | agenteditais :5180 | `DEMO_<UC>_*` memorável | PO (você) pilotando | `testes/relatorios/visual/<UC>_<ts>.md` com screenshots + comentários UI |
| 3 | **Humana** | `--modo=humano` | **editaisvalida :5179** | Realista (nomes profissionais, CNPJs válidos RF) | Validador Arnaldo | `testes/tutoriais_humano/<UC>_humano.md` (MD pro Arnaldo executar) |

### Qual roda quando

- **Durante desenvolvimento:** E2E roda continuamente em CI. Visual roda sob demanda quando você quer co-pilotar uma mudança.
- **Fim de sprint / validação externa:** Gera tutorial humano, manda pro Arnaldo. Ele executa em editaisvalida. Resposta dele vem em docx/texto como no ciclo anterior.
- **Cross-check:** divergência entre visual e humano = ajustar descrição ancorada. Divergência entre E2E e humano = bug de UX que o E2E não pega.

---

## Slash command unificado: `/validar-uc`

Uma única entrada com flag:

```
/validar-uc UC-F01 --modo=e2e            # padrão
/validar-uc UC-F01 --modo=visual
/validar-uc UC-F01 --modo=humano
/validar-uc UC-F01,UC-F02 --modo=e2e     # lote
```

Fluxo interno (6 fases com checkpoints):

- **Fase 0 (Provisionamento de contexto):** (só quando inicia ciclo novo, não em UC isolado de ciclo existente)
  - Consulta banco por último `valida<N>` e reserva 3 próximos livres (1 por trilha)
  - Gera 3 CNPJs válidos RF e verifica unicidade no banco (retry se colidir)
  - Busca 3 editais no PNCP via `backend/tools.py::_buscar_edital_pncp_por_numero` e `_buscar_arquivos_pncp`
  - Filtra editais: prazo futuro, PDF baixável, categoria coerente com UC
  - Baixa editais pra `testes/contextos/<ciclo_id>/editais/`
  - Renderiza documentos fictícios via templates em `testes/fixtures/documentos_template/` (Jinja2)
  - Cria usuários no banco via `INSERT INTO users` com papel `usuario_valida`
  - **Empresa NÃO é criada aqui** — fica a cargo do UC-F01 (Opção Y)
  - Grava `testes/contextos/<ciclo_id>/contexto.yaml` com todos os identificadores
  - **Checkpoint:** apresenta resumo em tabela (3 usuários, 3 CNPJs gerados, 3 editais selecionados, N documentos renderizados), aguarda "prossiga"

- **Fase 1 (Datasets):** lê o UC e gera **3 datasets** em `testes/datasets/<UC>_{e2e,visual,humano}.yaml`.
  - Apresenta os 3 em tabela comparativa
  - **Checkpoint:** aguarda "prossiga" ou correções de valores

- **Fase 2 (Casos de teste):** para cada dataset, produz **1 caso de teste** em `testes/casos_de_teste/<UC>_<trilha>.{yaml,md}` com:
  - E2E: YAML rígido com asserções DOM/Rede/Semântica
  - Visual: YAML + pontos de observação (o que o PO deve olhar em cada passo)
  - Humano: MD com checklist de critérios objetivos
  - **Checkpoint:** apresenta os 3 em resumo (quantas asserções por camada, quais pontos de observação), aguarda "prossiga"

- **Fase 3 (Tutoriais):** para cada caso de teste, gera **1 tutorial** em `testes/tutoriais_<trilha>/<UC>*.md`. Cada tutorial referencia (`$ref`) o dataset e o caso de teste em vez de duplicá-los.
  - E2E: YAML runnable, referencia dataset e caso de teste por path
  - Visual: MD com prosa + blocos YAML para parser Python
  - Humano: MD em prosa com checklist do caso de teste embutido (porque o Arnaldo não tem parser)
  - **Checkpoint:** apresenta caminhos + resumo de 1 linha por passo, aguarda "prossiga"

- **Fase 4 (Execução):** depende do `--modo`:
  - `e2e` → runner headless lê tutorial + caso de teste + dataset, executa
  - `visual` → framework Python sobe painel :9876 + browser headed
  - `humano` → **não executa**. Avisa: "pronto pra mandar pro Arnaldo em editaisvalida :5179"

- **Fase 5 (Relatório):** cada modo gera seu formato em `testes/relatorios/<trilha>/`. Inclui veredito, evidências e referência aos 3 artefatos (dataset, caso de teste, tutorial) usados.

**Regras:**
- **Fase 0 roda uma vez por ciclo.** Se o comando for `/validar-uc --sprint=1,2,3 --modo=e2e`, roda Fase 0 + Fases 1-5 para cada UC da lista, reusando o contexto provisionado.
- Se for `/validar-uc UC-F01` (UC isolado), verifica se existe ciclo aberto; se sim, reusa; se não, faz Fase 0 antes.
- Fases 1, 2 e 3 **sempre rodam** para cada UC, independente do `--modo`. O `--modo` só decide quem executa na Fase 4.
- **UC-F01 é obrigatoriamente o primeiro UC** quando o ciclo inclui Sprint 1, porque cria a empresa via UI (Opção Y). Se falhar, bloqueia todos os UCs seguintes do ciclo.
- **Cobertura obrigatória de todos os fluxos.** Para cada UC, a Fase 2 deve gerar um caso de teste **por variação** (Principal + Alternativos + Exceções), nunca um só caso que tenta cobrir tudo. A Fase 3 gera um tutorial por variação. A Fase 4 executa todos. Aprovar só o principal = REPROVAR o UC.
- **Loop iterativo até convergência.** Quando há divergências, `/corrigir-divergencias` é invocado. Loop roda no máximo 3 iterações; se não convergir, declara impasse com tipo específico. Regressão detectada → rollback automático + impasse.
- **Juiz semântico segue injunções fortes** (ver seção 7 de `VALIDACAOFACILICITA.md`): inventário completo da tela, checklist de obrigatórios e proibidos, JSON rígido de resposta, "na dúvida, reprove".

### Modos de invocação do comando

```bash
# UC isolado (herda ou cria contexto)
/validar-uc UC-F01 --modo=visual

# Sprint inteira (cria contexto, executa todos os UCs em ordem)
/validar-uc --sprint=1 --modo=visual

# Múltiplas sprints (coerência entre elas garantida pelo contexto reusado)
/validar-uc --sprint=1,2,3,4,5 --modo=e2e

# Ciclo com contexto existente (retoma)
/validar-uc --ciclo=2026-04-25_103000 --modo=visual
```

---

## Estrutura de diretórios (final) — 3 camadas de artefatos

Esta versão separa explicitamente os artefatos em 3 camadas encadeadas: **dados → casos de teste → tutoriais**. Essa separação permite:

1. Reaproveitar o mesmo caso de teste em trilhas diferentes
2. Versionar dados independentemente da especificação
3. Regerar tutoriais quando a spec mudar sem perder dados calibrados
4. Comparar asserções entre trilhas (bandeira vermelha se divergem)

```
testes/
├── casos_de_uso/                    # SPECS DE NEGÓCIO — 1 arquivo por UC (split V5)
│   ├── UC-F01.md ... UC-F17.md     # Sprint 1
│   ├── UC-CV01.md ... UC-CV13.md   # Sprint 2
│   └── ...
│
├── datasets/                        # CAMADA 1 — só dados, sem lógica
│   ├── UC-F01_e2e.yaml              #   determinístico E2E_<data>_*
│   ├── UC-F01_visual.yaml           #   memorável DEMO_*
│   └── UC-F01_humano.yaml           #   realista (CNPJs válidos RF)
│
├── casos_de_teste/                  # CAMADA 2 — asserções por passo, sem instrução
│   ├── UC-F01_e2e.yaml              #   YAML rígido + 3 camadas de validação
│   ├── UC-F01_visual.yaml           #   YAML + observações a capturar
│   └── UC-F01_humano.md             #   checklist com critérios objetivos
│
├── tutoriais_playwright/            # CAMADA 3 — executor consome caso+dataset
│   ├── UC-F01_happy_path.md         #   YAML runnable pelo runner E2E
│   └── UC-F01_borda_cnpj_invalido.md
├── tutoriais_visual/                #   MD + YAML pro framework visual
│   └── UC-F01_visual.md
├── tutoriais_humano/                #   MD em prosa pro Arnaldo
│   └── UC-F01_humano.md
│
├── fixtures/
│   └── seeds/
│       └── uc-f01-baseline.sql
│
├── framework_visual/                # NOVO — motor da trilha visual
│   ├── parser.py                   # Lê tutorial_visual.md + caso_de_teste + dataset
│   ├── executor.py                 # Playwright headed + pausa controlada
│   ├── painel.py                   # Flask :9876 + HTML
│   ├── painel_assets/
│   │   ├── index.html
│   │   └── controle.js
│   └── relatorio.py                # Monta MD do relatório visual
│
└── relatorios/
    ├── automatico/                  # Trilha 1 — formato existente do ciclo Arnaldo
    │   └── UC-F01_2026-04-25_103000.md
    ├── visual/                      # Trilha 2 — com observações capturadas na UI
    │   └── UC-F01_2026-04-25_103000.md
    └── humano/                      # Trilha 3 — resposta do validador externo
        └── UC-F01_resposta_arnaldo.txt
```

### Como as 3 camadas se encadeiam

```
UC-F01.md (caso de uso — spec de negócio, fonte da verdade)
      ↓ FASE 1
datasets/UC-F01_{e2e,visual,humano}.yaml  (3 datasets, só valores)
      ↓ FASE 2
casos_de_teste/UC-F01_{e2e,visual,humano}.{yaml,md}  (3 casos de teste, só asserções)
      ↓ FASE 3
tutoriais_{playwright,visual,humano}/UC-F01_*.md  (3 tutoriais, instruções de execução)
      ↓ FASE 4
execução (modo escolhido) + relatório
```

### Formato de cada camada — diferenças intencionais

**Camada 1 — Datasets** (só valores, nenhuma asserção nem instrução):
```yaml
# datasets/UC-F01_e2e.yaml
caso_uso: UC-F01
trilha: e2e
gerado_em: 2026-04-25T10:30:00-03:00
valores:
  empresa:
    razao_social: "E2E_20260425_EMPRESA_001"
    cnpj_entrada: "11111111000111"
    cnpj_exibicao: "11.111.111/0001-11"
    cnpj_transito: "11111111000111"
  endereco:
    cep: "00000-000"
  contato:
    email: "e2e+20260425@test.local"
```

**Camada 2 — Casos de teste** (asserções por passo, referem-se ao dataset):
```yaml
# casos_de_teste/UC-F01_e2e.yaml
caso_uso: UC-F01
trilha: e2e
dataset_ref: UC-F01_e2e.yaml
passos:
  - id: passo_03_preencher_cnpj
    usa_dados: empresa.cnpj_entrada
    asserts_dom:
      - selector: 'input[name=cnpj]'
        attribute: 'data-valid'
        equals: 'true'
    asserts_rede:
      - metodo: POST
        url_contem: '/api/validar-cnpj'
        status: 200
    asserts_semantica:
      descricao_ancorada: "Campo CNPJ mostra máscara aplicada e badge verde de validação"
      elementos_obrigatorios: ["11.111.111/0001-11"]
      elementos_proibidos: ["Inválido", "Erro"]
```

**Camada 3 — Tutoriais** (instrução de execução, consomem caso + dataset):
```yaml
# tutoriais_playwright/UC-F01_happy_path.md
metadados:
  dataset_ref: datasets/UC-F01_e2e.yaml
  caso_de_teste_ref: casos_de_teste/UC-F01_e2e.yaml

passos:
  - id: passo_03_preencher_cnpj
    acao:
      tipo: fill
      seletor: 'input[name=cnpj]'
      valor_from_dataset: empresa.cnpj_entrada  # ← resolvido em runtime
    validacao_ref: casos_de_teste/UC-F01_e2e.yaml#passo_03_preencher_cnpj
```

**Vantagem:** se você quer rodar UC-F01 com CNPJ diferente, muda **só o dataset**. Se quer endurecer a asserção semântica, muda **só o caso de teste**. Se muda a UI, muda **só o tutorial** (seletores).

---

## Framework visual — detalhamento

Reutiliza 100% do plano `planovalidacaovisualautomatica.v1.md`, com ajustes:

### Painel de controle (Flask :9876)
- Endpoint `GET /` → HTML com 2 colunas: passo atual (MD renderizado) + screenshot antes/depois
- Endpoint `GET /estado` → JSON com passo atual, UC, progresso
- Endpoint `POST /continuar` → desbloqueia próximo passo
- Endpoint `POST /comentario` → salva observação do PO no passo atual (texto livre)
- Endpoint `POST /correcao` → marca passo como "precisa correção" + descrição
- Endpoint `POST /parar` → encerra graciosamente, gera relatório parcial
- Endpoint `POST /reiniciar` → volta ao início (útil se descobrir bug no tutorial)
- Endpoint `GET /relatorio` → preview do relatório em tempo real

### Executor controlado
- `playwright.chromium.launch(headless=False, slow_mo=500)`
- Antes de cada passo: screenshot `before_<passo>.png`
- Executa ação
- Screenshot `after_<passo>.png`
- Bloqueia em `asyncio.Event().wait()` até o PO clicar [Continuar]
- Se PO digita comentário: agrega ao JSON do passo
- Se PO clica [Correção]: adiciona flag `needs_fix=true` ao passo

### Relatório visual
Diferente dos outros dois — contém explicitamente as anotações do PO:

```markdown
# Relatório Visual — UC-F01 (2026-04-25 10:30)
**Ambiente:** agenteditais :5180
**Empresa:** RP3X
**Modo:** Visual acompanhada (PO: Pasteur)

## Resumo
- Passos executados: 6/6
- OK: 4
- Precisa correção: 1 (passo 4 — CEP)
- Observações: 2

## Passo 4 — Preencher endereço
**Ação automatizada:** preencher CEP "02452-001"
**Screenshot antes:** [before_passo_04.png]
**Screenshot depois:** [after_passo_04.png]
**Resultado automático:** OK (API viaCEP respondeu 200)
**Observação do PO:** "CEP formatou corretamente mas a cidade veio em minúsculas — deveria estar title case"
**Correção sugerida:** sim — validar formatação de `cidade` no handler do viaCEP
```

---

## Datasets diferenciados — exemplo UC-F01

| Campo | HUMANO (Arnaldo) | VISUAL (você) | E2E (CI) |
|---|---|---|---|
| Razão Social | "RP3X Comércio Ltda" | "DEMO_RP3X Ltda" | `E2E_20260425_EMP_001` |
| CNPJ | 68.218.777/0001-03 (válido) | 11.111.111/0001-11 (DEMO, inválido RF) | 11.111.111/0001-11 (mock RN off) |
| Email | `contato@rp3x.com.br` | `demo+uc-f01@test.local` | `e2e+20260425@test.local` |
| Telefone | (11) 98765-4321 | (11) 99999-DEMO (se aceitar) | (11) 90000-0001 |
| CEP | 02452-001 (real SP) | 02452-001 | 00000-000 (mock se não puder 404) |

Regras:
- **HUMANO:** valores reais, passam em RNs. Roda em editaisvalida (DB isolado).
- **VISUAL:** prefixo `DEMO_` em strings livres, CNPJ inválido proposital (se for testar fluxo de validação). Roda em agenteditais (limpeza via `DELETE WHERE razao_social LIKE 'DEMO_%'`).
- **E2E:** prefixo `E2E_<data>_`, determinístico, limpeza automática no teardown.

---

## Mudanças concretas no projeto

### Arquivos NOVOS (comparado a V2)

| Caminho | Propósito |
|---|---|
| `.claude/agents/validation-coordinator.md` | Prompt do orquestrador |
| `.claude/agents/validation-uc-analyzer.md` | Prompt do analisador de UC |
| `.claude/agents/validation-dataset-auditor.md` | Prompt do auditor de contexto |
| `.claude/agents/validation-test-case-generator.md` | Prompt do gerador de casos de teste |
| `.claude/agents/validation-tutorial-writer.md` | Prompt do escritor de tutoriais |
| `.claude/agents/validation-semantic-judge.md` | Prompt do juiz semântico (com injunções fortes) |
| `.claude/agents/validation-root-cause-classifier.md` | Prompt do classificador de causa raiz |
| `.claude/agents/validation-critique.md` | Prompt do crítico adversarial |
| `.claude/agents/validation-code-fixer.md` | Prompt do aplicador de correções |
| `testes/contextos/.gitkeep` | Saída da Fase 0 (um subdir por ciclo) |
| `testes/datasets/.gitkeep` | Nova camada 1 de artefatos |
| `testes/casos_de_teste/.gitkeep` | Nova camada 2 de artefatos |
| `testes/tutoriais_visual/.gitkeep` | Nova trilha |
| `testes/relatorios/{automatico,visual,humano}/.gitkeep` | Separar por trilha |
| `testes/framework_provisionamento/cnpj_generator.py` | Gera CNPJ válido RF + verifica unicidade no banco (retry) |
| `testes/framework_provisionamento/pncp_adapter.py` | Wrapper fino sobre `backend/tools.py::_buscar_*_pncp` |
| `testes/framework_provisionamento/document_renderer.py` | Renderiza PDFs fictícios via templates Jinja2 |
| `testes/framework_provisionamento/user_allocator.py` | Consulta último `valida<N>` e aloca próximos livres |
| `testes/framework_provisionamento/context_manager.py` | Cria/carrega/limpa `contextos/<ciclo_id>/contexto.yaml` |
| `testes/fixtures/documentos_template/contrato_social.html.j2` | Template HTML → PDF (WeasyPrint/ReportLab) |
| `testes/fixtures/documentos_template/cnd_federal.html.j2` | Template |
| `testes/fixtures/documentos_template/fgts.html.j2` | Template |
| `testes/fixtures/documentos_template/trabalhista.html.j2` | Template |
| `testes/fixtures/documentos_template/sicaf.html.j2` | Template |
| `testes/fixtures/documentos_template/alvara.html.j2` | Template |
| `testes/framework_visual/parser.py` | Parser que lê tutorial + caso de teste + dataset |
| `testes/framework_visual/executor.py` | Playwright headed controlado |
| `testes/framework_visual/painel.py` | Flask :9876 |
| `testes/framework_visual/painel_assets/index.html` | UI de controle |
| `testes/framework_visual/painel_assets/controle.js` | Front do painel |
| `testes/framework_visual/relatorio.py` | Gerador de MD |
| `scripts/lib/artifact-loader.ts` | Resolve `valor_from_dataset` e `validacao_ref` em runtime (E2E) |

### Arquivos modificados (vs V2)

| Caminho | Mudança |
|---|---|
| `.claude/commands/validar-uc.md` | Aceita flag `--modo=e2e\|visual\|humano`, gera 3 datasets e 3 tutoriais sempre |
| `scripts/run-validation.ts` | Só responsável pela trilha E2E. Trilha visual via `python testes/framework_visual/executor.py` |
| Fase 1 do protocolo `/validar-uc` | Passa a sintetizar 3 datasets, não 2 |
| Fase 2 do protocolo | Gera 3 tutoriais, não 2 |

### Reuso do que já existe

- `tests/e2e/playwright/helpers.ts::login/navTo` → reutilizado pelas trilhas E2E e Visual (Visual via CDP do Playwright Python)
- `helpers.ts` da trilha E2E precisa de `captureA11yTree` e `setupNetworkInterceptor` (vindos do V2)
- Padrão de relatório do ciclo Arnaldo (`docs/RELATORIO_PARA_ARNALDO.md`) → template pra relatório HUMANO

---

## Piloto UC-F01 em 3 passes

### Passe 1 — VISUAL (calibração, você comigo)
Roda `/validar-uc UC-F01 --modo=visual`.
- Fase 1 confirma os 3 datasets
- Fase 2 gera os 3 tutoriais
- Fase 3 sobe painel :9876 + browser em agenteditais :5180
- Você acompanha passo a passo, anota correções, faz checkpoint de cada tela
- Fase 4 gera `relatorios/visual/UC-F01_<ts>.md`

**Output esperado:** identificamos juntos se a descrição ancorada está clara, se os seletores funcionam, se algum passo está ambíguo. Ajustamos o tutorial antes de ir pras outras trilhas.

### Passe 2 — E2E (regressão)
Roda `/validar-uc UC-F01 --modo=e2e`.
- Usa tutorial Playwright já calibrado no passe 1
- Headless, rápido, determinístico
- Gera relatório automático

### Passe 3 — HUMANO (Arnaldo)
Roda `/validar-uc UC-F01 --modo=humano`.
- **Não executa**. Só produz `tutoriais_humano/UC-F01_humano.md`
- Você revisa, ajusta se necessário, manda pro Arnaldo
- Ele valida em editaisvalida, manda resposta
- Você salva a resposta como `relatorios/humano/UC-F01_resposta_arnaldo.txt`

### Cross-check
Ao fim dos 3 passes, `/corrigir-divergencias UC-F01` compara os 3 relatórios:
- Se E2E=OK, VISUAL=OK, HUMANO=OK → UC aprovado, pode promover V5 pra V6
- Se E2E=OK, VISUAL=OK, HUMANO=REPROVA → bandeira vermelha: automático foi permissivo, refinar descrição ancorada
- Se VISUAL=OK, HUMANO=OK, E2E=REPROVA → seletor frágil, refatorar no produto

---

## Zonas protegidas (igual V2)

`.claude-protected` com lógica financeira, integrações governamentais, auditoria, migrations, auth, .env. Nenhuma das 3 trilhas pode modificar esses arquivos sem impasse.

---

## Passos de implementação (consolidado)

### Fase A — Instalação (50 min)
1. `CLAUDE.md` na raiz
2. `.claude/commands/validar-uc.md` com suporte a flag + Fases 0-5 (contexto → datasets → casos de teste → tutoriais → execução → relatório)
3. `.claude/commands/corrigir-divergencias.md`
4. `.claude-protected`
5. Árvore `testes/` com subpastas: `casos_de_uso/`, `contextos/`, `datasets/`, `casos_de_teste/`, `tutoriais_{humano,visual,playwright}/`, `fixtures/`, `framework_visual/`, `framework_provisionamento/`, `relatorios/{automatico,visual,humano}/`
6. **9 agentes de validação** em `.claude/agents/validation-*.md`:
   - `validation-coordinator.md` — orquestrador
   - `validation-uc-analyzer.md` — extrai estrutura do UC (FP + FAs + FEs)
   - `validation-dataset-auditor.md` — audita contexto provisionado (adversarial)
   - `validation-test-case-generator.md` — gera casos de teste (1 por variação)
   - `validation-tutorial-writer.md` — escreve tutoriais das 3 trilhas
   - `validation-semantic-judge.md` — juiz semântico com injunções fortes
   - `validation-root-cause-classifier.md` — classifica divergências em 8 categorias
   - `validation-critique.md` — 2ª opinião adversarial antes de aplicar correção
   - `validation-code-fixer.md` — aplica diff mínimo em branch isolada

### Fase B — Config (10 min)
5. `playwright.config.ts` → baseURL 5180 + projeto editaisvalida :5179
6. Mover 173 specs antigos pra `tests/e2e/playwright/legacy/`

### Fase C — Split UCs V5 (1h)
7. `scripts/split-uc-v5.py` → ~80 arquivos UC
8. `testes/casos_de_uso/README.md` indexado

### Fase D — Harness E2E (3h30)
9. `scripts/lib/judge-semantic.ts` (Anthropic SDK, voto majoritário)
10. `scripts/lib/report-generator.ts`
11. `scripts/lib/artifact-loader.ts` (resolve referências entre dataset/caso de teste/tutorial, carrega `contextos/<ciclo>/contexto.yaml`)
12. `scripts/run-validation.ts`
13. `helpers.ts`: `captureA11yTree`, `setupNetworkInterceptor`

### Fase A-bis — Escrever prompts dos 9 agentes (2h30, NOVO)
Cada agente em `.claude/agents/validation-*.md` precisa:
- Frontmatter YAML: `name`, `description`, `tools` (quais tools o agente pode usar)
- System prompt com: papel, gatilho, input esperado, output estruturado, regras invioláveis
- Exemplos few-shot de input→output quando aplicável

Ordem recomendada (dependências crescentes):
19. `validation-coordinator.md` — o mais complexo, escrever por último para depois de conhecer todos os outros
20. `validation-uc-analyzer.md` — independente, start aqui
21. `validation-test-case-generator.md` — depende da saída do uc-analyzer
22. `validation-tutorial-writer.md` — depende do test-case-generator
23. `validation-semantic-judge.md` — independente, injunções fortes
24. `validation-dataset-auditor.md` — adversarial simples
25. `validation-root-cause-classifier.md` — classifica em 8 categorias
26. `validation-critique.md` — adversarial pro diff
27. `validation-code-fixer.md` — propõe diff mínimo
28. (volta pro coordinator, agora informado)

### Fase D-provisionamento — Framework de Fase 0 (4h, NOVO)
14. `testes/framework_provisionamento/cnpj_generator.py`:
   - Algoritmo da RF para calcular dígitos verificadores
   - Verifica `SELECT COUNT(*) FROM empresas WHERE cnpj=?` antes de retornar
   - Retry até 10x se colidir; após isso, impasse
15. `testes/framework_provisionamento/pncp_adapter.py`:
   - Wrapper fino sobre `backend.tools._buscar_edital_pncp_por_numero` e `_buscar_arquivos_pncp`
   - Filtro: data atual < dataAberturaProposta, arquivo.tipo in [PDF,ZIP]
   - Baixa arquivo local, retorna path
16. `testes/framework_provisionamento/document_renderer.py`:
   - Jinja2 template engine + WeasyPrint (HTML→PDF)
   - Um método por tipo de documento: `render_contrato_social(empresa_dict) → path_pdf`
17. `testes/framework_provisionamento/user_allocator.py`:
   - `SELECT MAX(CAST(SUBSTRING(email, 7, LOCATE('@', email) - 7) AS UNSIGNED)) FROM users WHERE email LIKE 'valida%@valida.com.br'`
   - Retorna 3 próximos IDs livres sequenciais
18. `testes/framework_provisionamento/context_manager.py`:
   - `create_cycle(ambiente, trilhas)` → cria `contextos/<ciclo_id>/` com yaml + editais + docs
   - `load_cycle(ciclo_id)` → recarrega contexto pra retomada
   - `cleanup_cycle(ciclo_id, trilha)` → remove usuário/empresa/documentos da trilha E2E
19. Fase 0 do `/validar-uc.md`: invoca os 5 módulos acima em sequência

### Fase D-bis — Framework Visual (3h, NOVO)
13. `testes/framework_visual/parser.py` (MD → struct Python)
14. `testes/framework_visual/executor.py` (Playwright Python headed, pausa controlada via asyncio.Event)
15. `testes/framework_visual/painel.py` (Flask :9876 com 6 endpoints)
16. `testes/framework_visual/painel_assets/` (HTML + JS mínimo, marked.js pra render MD)
17. `testes/framework_visual/relatorio.py` (MD com observações do PO)

### Fase E — Piloto UC-F01 em 3 passes (3h)
18. Passe VISUAL (você comigo)
19. Calibrar tutorial se necessário
20. Passe E2E
21. Gerar tutorial HUMANO, revisar com você antes de mandar

### Fase F — Documentação (40 min)
22. `docs/PROCESSO_VALIDACAO_V3.md` — explica as 3 trilhas, quando usar cada
23. Atualizar `CLAUDE.md` raiz com lições

**Total: ~18h focadas** (V2=7h → V3 sem Fase 0=11h30 → V3 com Fase 0=15h30 → V3 com agentes=18h).

Recomendado 4 sessões:
- [A + A-bis + B + C] (4h30): infra base + 9 agentes + split UCs
- [D] (3h30): harness E2E
- [D-provisionamento] (4h): Fase 0 — gerador CNPJ, PNCP adapter, documentos, contexto
- [D-bis + E + F] (6h): framework visual + piloto UC-F01 + docs

**Na Fase E (piloto UC-F01), validar o encadeamento:**
1. Confirmar que `datasets/UC-F01_*.yaml` existe antes do caso de teste
2. Confirmar que `casos_de_teste/UC-F01_*.{yaml,md}` referenciam o dataset correto
3. Confirmar que tutoriais referenciam caso de teste + dataset via `$ref` sem duplicar dados
4. Se o runner E2E consegue resolver as referências em tempo de execução
5. Se o framework visual Python consegue ler os 3 arquivos e apresentá-los no painel

---

## Verificação end-to-end

1. **Instalação:** `ls .claude/commands/` lista `validar-uc.md` e `corrigir-divergencias.md`
2. **Flag funciona:** `/validar-uc UC-F01 --modo=visual` sobe painel :9876
3. **3 camadas de artefatos geradas:** após Fases 1+2+3 do `/validar-uc`:
   - `testes/datasets/UC-F01_{e2e,visual,humano}.yaml` existem
   - `testes/casos_de_teste/UC-F01_e2e.yaml`, `UC-F01_visual.yaml`, `UC-F01_humano.md` existem
   - `testes/tutoriais_{playwright,visual,humano}/UC-F01*.md` existem
4. **Tutoriais referenciam dataset+caso de teste:** abrir `tutoriais_playwright/UC-F01_happy_path.md` e ver `dataset_ref` + `caso_de_teste_ref` no header, sem duplicação de dados
5. **Trilha visual interativa:** painel :9876 pausa em cada passo, aceita comentários, gera relatório com anotações
6. **Trilha E2E:** `scripts/run-validation.ts UC-F01` resolve referências (dataset + caso de teste), executa em agenteditais :5180 e produz relatório determinístico
7. **Trilha humana:** tutorial gerado contém dados realistas (CNPJ válido) e instrui explicitamente a rodar em editaisvalida :5179
8. **Cross-check:** `/corrigir-divergencias UC-F01` compara os 3 relatórios e aponta divergências
9. **Zona protegida:** tentar forçar correção em `backend/rn_validators.py` → `IMPASSE_ZONA_PROTEGIDA`
10. **Teste de refactor:** mudar um CNPJ em `datasets/UC-F01_e2e.yaml`, rodar trilha E2E — deve usar o novo valor sem precisar editar tutorial nem caso de teste.
11. **Fase 0 funcionando:** `/validar-uc --sprint=1 --modo=visual` deve:
    - Listar os últimos `valida<N>` no banco e propor 3 próximos
    - Gerar 3 CNPJs válidos e mostrar que consultou o banco pra garantir unicidade
    - Buscar 3 editais no PNCP e mostrar URLs + prazos
    - Listar documentos renderizados com paths
    - Criar `testes/contextos/<ciclo_id>/contexto.yaml`
    - **Não criar empresa no banco** — essa parte fica pro UC-F01
12. **Ordem UC-F01 primeiro:** tentar rodar `/validar-uc UC-F07` sem UC-F01 ter rodado antes no ciclo → deve detectar e pedir para rodar UC-F01 primeiro.
13. **Coerência entre sprints:** após rodar Sprint 1 e Sprint 2 no mesmo ciclo, verificar em `testes/contextos/<ciclo_id>/contexto.yaml` que `empresa.id` preenchido pela Sprint 1 está sendo usado pela Sprint 2.
14. **Limpeza E2E:** após Fase 4, verificar `SELECT * FROM users WHERE email LIKE 'valida123@%'` retorna 0 (se trilha E2E) e mantém (se trilha Humana).
15. **9 agentes instalados:** `ls .claude/agents/validation-*.md | wc -l` retorna **9**.
16. **Agentes são reconhecidos:** abrir sessão Claude Code, digitar `@validation-` e ver autocomplete dos 9 agentes.
17. **Coordinator orquestra:** `/validar-uc UC-F01 --modo=e2e` chama `validation-coordinator` (visível em `testes/relatorios/ciclo_<id>/agentes/coordinator_*.json`) e este chama os demais na ordem documentada.
18. **Critique tem poder de veto:** rodar o piloto com bug intencional no código + fazer `root-cause-classifier` sugerir correção trivial; `critique` deve vetar (ex: "correção só silencia sintoma, não toca na função `calcular_score` que é a causa real"); coordinator declara `IMPASSE_CRITIQUE_VETO`.
19. **Juiz semântico estruturado:** chamar `validation-semantic-judge` com screenshot + descrição ancorada → deve retornar JSON válido com todos os 8 campos obrigatórios (veredito, confianca, inventario_tela, checklist_obrigatorios, checklist_proibidos, coerencia_com_acao, justificativa, discrepancias_observadas).

---

## Perguntas ainda em aberto

Nenhuma — você já respondeu as 3 críticas:
- Command com flag ✓
- Porta painel = 9876 ✓
- Ambientes: visual+e2e em agenteditais, humano em editaisvalida ✓
- 3 artefatos por UC: tutorial humano + relatório automático + relatório visual com observações ✓

Pronto pra executar. Qual fase começa primeiro?
