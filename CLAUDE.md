# Facilicita.IA — Contexto para Claude Code

Sistema de automação de licitações e pregões governamentais brasileiros.

**Stack:** Flask (backend Python porta 5007), Vite/React (frontend porta 5180), MySQL remoto, Playwright, PNCP, Brave Search, DeepSeek.

**Ambientes:**
- `agenteditais`: porta 5180 (frontend) / 5007 (backend), banco `editais`
- `editaisvalida`: porta 5179 (frontend) / 5008 (backend), banco `editaisvalida` — ambiente isolado de validação externa (Arnaldo e outros validadores)

---

## Validação e correção de casos de uso — processo V3

O projeto usa um processo formal de validação em 3 trilhas + loop de correção. Documentação viva em:

- **`docs/VALIDACAOFACILICITA.md`** — processo completo (18 secoes) — leitura obrigatoria antes de operar
- **`docs/PLANO VALIDACAO V3.md`** — plano de implantacao
- **`docs/validar-uc.md`** — protocolo do slash command `/validar-uc`
- **`docs/corrigir-divergencias.md`** — protocolo do slash command `/corrigir-divergencias`

### Os 2 slash commands

**`/validar-uc`** — gera artefatos (dataset → caso de teste → tutorial) em 3 trilhas e executa validacao em 3 camadas (DOM, rede, semantica). Nao modifica codigo. Use quando quiser apenas diagnostico.

Modos:
- `--modo=e2e` (default): headless, CI/regressao, em agenteditais
- `--modo=visual`: browser visivel + painel Flask :9876, voce co-pilotando, em agenteditais
- `--modo=humano`: gera tutorial em prosa para o validador externo, em editaisvalida

Escopos:
- `/validar-uc UC-F01 --modo=e2e` (1 UC isolado)
- `/validar-uc --sprint=1 --modo=visual` (sprint inteira)
- `/validar-uc --sprint=1,2,3,4,5 --modo=e2e` (multi-sprint com contexto reusado)
- `/validar-uc --ciclo=<id> --modo=visual` (retomar ciclo existente)

**`/corrigir-divergencias`** — executa o loop completo: roda `/validar-uc`, classifica divergencias por causa raiz, corrige automaticamente as de categoria "defeito de codigo", re-valida ate sucesso ou impasse. Opera em branch isolada, abre PR, nunca faz merge automatico. Respeita zonas protegidas (`.claude-protected`).

### Fluxo recomendado

1. PO recebe o tutorial humano e comeca execucao manual em paralelo (em editaisvalida)
2. Em paralelo, rodar `/corrigir-divergencias` no mesmo conjunto de UCs (em agenteditais)
3. Cross-check obrigatorio entre os dois resultados antes de merge do PR
4. Divergencia entre manual e automatico = ajustar protocolo de validacao, nunca so confiar no automatico

### Time de 9 agentes de validacao

O processo eh orquestrado por agentes especializados em `.claude/agents/validation-*.md`:

- `validation-coordinator` — orquestrador do ciclo
- `validation-uc-analyzer` — extrai FP + FAs + FEs do UC
- `validation-dataset-auditor` — adversarial, audita contexto
- `validation-test-case-generator` — gera casos de teste por variacao
- `validation-tutorial-writer` — escreve tutoriais das 3 trilhas
- `validation-semantic-judge` — juiz semantico com injuncoes fortes
- `validation-root-cause-classifier` — classifica divergencias em 8 categorias
- `validation-critique` — 2a opiniao adversarial antes de aplicar correcao
- `validation-code-fixer` — aplica diff minimo em branch isolada

### Diretorios do processo de validacao

- `testes/casos_de_uso/` — specs de entrada (1 arquivo por UC, split dos docs V5)
- `testes/contextos/<ciclo_id>/` — Fase 0: contexto.yaml, editais baixados, documentos renderizados
- `testes/datasets/` — camada 1: 3 datasets por UC (e2e, visual, humano)
- `testes/casos_de_teste/` — camada 2: 3 casos de teste por UC com assercoes
- `testes/tutoriais_playwright/` — camada 3 (trilha e2e): YAML runnable
- `testes/tutoriais_visual/` — camada 3 (trilha visual): MD + YAML pro parser
- `testes/tutoriais_humano/` — camada 3 (trilha humana): MD prosa
- `testes/fixtures/seeds/` — SQL de setup (opcional)
- `testes/fixtures/documentos_template/` — templates Jinja2 dos documentos ficticios
- `testes/framework_visual/` — parser + executor + painel Flask :9876 + relatorio
- `testes/framework_provisionamento/` — cnpj_generator, pncp_adapter, document_renderer, user_allocator, context_manager
- `testes/relatorios/{automatico,visual,humano}/` — saidas separadas por trilha

---

## Convencoes do projeto

- Prefixo `E2E_<YYYYMMDD>_` em todos os dados de teste sintetizados pela trilha E2E
- Prefixo `DEMO_` em dados da trilha visual acompanhada
- Dados da trilha humana sao realistas (CNPJs validos RF, nomes profissionais)
- Limpeza obrigatoria via `DELETE ... WHERE ... LIKE 'E2E_%'` ao final de cada execucao E2E
- Trilha visual: limpeza manual (voce decide quando resetar)
- Trilha humana: nunca apaga (Arnaldo pode voltar pra validar UCs adicionais)
- Screenshots de evidencia em `testes/relatorios/<trilha>/<uc_id>/<timestamp>/`
- Tres formatos para dados numericos/datados nos tutoriais Playwright:
  - entrada (como usuario digita), ex: "45230,00"
  - exibicao (como aparece renderizado), ex: "R$ 45.230,00"
  - transito (como vai para o backend), ex: 45230.00
- Commits do loop de correcao: `fix(validacao): <resumo>` com referencia a divergencia
- Branch de correcao: `validacao/<timestamp>-<lista_uc_ids>`

---

## Zonas protegidas

Arquivos onde agentes NUNCA propoem correcao automatica (ver `.claude-protected` na raiz):

- Logica de calculo financeiro (propostas, lances, valores finais)
- Integracoes com sistemas governamentais (ComprasNet, BEC, Licitacoes-e, PNCP client)
- Codigo de auditoria, log e trilha de evidencias (`backend/rn_audit.py`, `backend/rn_validators.py`, `backend/rn_estados.py`)
- Migrations de banco de dados
- Codigo de autenticacao, autorizacao e sessao
- Configuracoes de producao (`.env`, `backend/config.py`)
- Schemas de API publica

Lista completa em `.claude-protected`.

---

## Metricas a monitorar (saude do processo)

- Taxa de aprovacao no 1o passe: alta (>80%) = UCs estao bem escritos
- Tokens por UC na camada semantica: se subindo, descricoes ancoradas estao vagas
- Frequencia de voto dividido (3 execucoes do juiz semantico): se frequente, descricao + screenshot ambiguas
- Divergencia E2E vs Humano: se alta, protocolo automatico esta permissivo
- Impasses por ciclo: se subindo, design em zona cinzenta demais

---

## Historico

Este processo substitui o ciclo ad-hoc anterior (173 specs Playwright soltos em `tests/e2e/playwright/`) documentado nos `RELATORIO_*_ARNALDO_*.md` e `ANALISE_OBSERVACOES_ARNALDO_*.md`. Os specs antigos ficam em `tests/e2e/playwright/legacy/` como referencia historica.
