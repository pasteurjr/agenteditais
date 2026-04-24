# scripts/

Scripts utilitários do processo de validação V3 (ver `docs/VALIDACAOFACILICITA.md`).

## Conteúdo

| Script | Propósito | Entrada | Saída |
|---|---|---|---|
| `split-uc-v5.py` | Quebra os 5 docs V5 monolíticos em arquivos individuais por UC | `docs/CASOS DE USO * V5.md` | `testes/casos_de_uso/UC-*.md` + `README.md` |
| `run-validation.ts` | Runner Playwright headless do processo V3 (Fases 4+5) | UC-id + variação + trilha | `testes/relatorios/automatico/<uc>_<variacao>_<ts>.md` |
| `lib/artifact-loader.ts` | Resolve `valor_from_dataset` e `validacao_ref` em runtime | Tutorial + dataset + caso de teste | Estruturas TS prontas para o runner |
| `lib/judge-semantic.ts` | Juiz semântico (camada 3) via Anthropic SDK, com voto majoritário se confiança<0.85 | screenshot + descrição ancorada + obrigatórios/proibidos | JSON do veredito |
| `lib/report-generator.ts` | Monta MD do relatório final | Resultado de execução | Markdown salvo em `testes/relatorios/<trilha>/` |

## Como rodar `split-uc-v5.py`

```bash
# Rodar de verdade (gera/atualiza arquivos em testes/casos_de_uso/)
python3 scripts/split-uc-v5.py

# Inspeção sem gravar
python3 scripts/split-uc-v5.py --dry-run
```

**Idempotente:** rodar várias vezes não muda nada se os docs V5 não mudaram. O script só regrava arquivos cujo conteúdo (excluindo timestamp) realmente mudou.

**Quando rodar de novo:** após editar qualquer doc `docs/CASOS DE USO * V5.md`.

## Como rodar `run-validation.ts`

```bash
# Sintaxe
npx ts-node scripts/run-validation.ts <UC-ID> <variacao> <trilha> [--ciclo=<id>] [--base-url=<url>]

# Atalho via npm script
npm run validate-uc -- UC-F01 fp e2e

# Exemplo concreto (após Fase E)
npx ts-node scripts/run-validation.ts UC-F01 fp e2e --ciclo=2026-04-25_103000
```

**Pré-requisitos:**
- Os artefatos das camadas 1-3 já gerados:
  - `testes/datasets/UC-F01_e2e.yaml`
  - `testes/casos_de_teste/UC-F01_e2e_fp.yaml`
  - `testes/tutoriais_playwright/UC-F01_fp.md`
- `ANTHROPIC_API_KEY` no `.env` (camada semântica). Sem isso, runner pula a camada 3 e marca como APROVADO baseado em DOM+Rede.
- Frontend rodando em `http://localhost:5180` (ou `--base-url` customizado).

**Saída:**
- Relatório markdown em `testes/relatorios/automatico/UC-F01_fp_<ts>.md`
- Evidências (screenshots before/after, JSON do a11y tree, JSON da rede) em `testes/relatorios/automatico/UC-F01/<ts>/`

## Convenções

- Scripts Python rodam direto com `python3 scripts/<nome>.py`
- Scripts TS rodam via `npx ts-node scripts/<nome>.ts`
- Saída sempre em diretório fixo (`testes/...`), nunca relativa ao cwd
- Códigos de retorno: 0 = sucesso, !=0 = erro

## Ver também

- `docs/VALIDACAOFACILICITA.md` — processo completo
- `docs/PLANO VALIDACAO V3.md` — plano de implantação
- `.claude/commands/validar-uc.md` — slash command que invoca os scripts
