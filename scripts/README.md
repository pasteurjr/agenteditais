# scripts/

Scripts utilitários do processo de validação V3 (ver `docs/VALIDACAOFACILICITA.md`).

## Conteúdo

| Script | Propósito | Entrada | Saída |
|---|---|---|---|
| `split-uc-v5.py` | Quebra os 5 docs V5 monolíticos em arquivos individuais por UC | `docs/CASOS DE USO * V5.md` | `testes/casos_de_uso/UC-*.md` + `README.md` |
| `run-validation.ts` *(Fase D)* | Runner Playwright headless do processo V3 | UC-id + tutorial Playwright | `testes/relatorios/automatico/<uc>_<ts>.md` |
| `lib/judge-semantic.ts` *(Fase D)* | Wrapper Anthropic SDK para o juiz semântico (camada 3) | screenshot + descrição ancorada | JSON do veredito |
| `lib/report-generator.ts` *(Fase D)* | Monta MD do relatório final por UC × trilha | Resultado de execução | Markdown |
| `lib/artifact-loader.ts` *(Fase D)* | Resolve `valor_from_dataset` e `validacao_ref` em runtime | Tutorial + dataset + caso de teste | Estrutura JS pronta para o runner |

## Como rodar `split-uc-v5.py`

```bash
# Rodar de verdade (gera/atualiza arquivos em testes/casos_de_uso/)
python3 scripts/split-uc-v5.py

# Inspeção sem gravar
python3 scripts/split-uc-v5.py --dry-run
```

**Idempotente:** rodar várias vezes não muda nada se os docs V5 não mudaram. O script só regrava arquivos cujo conteúdo (excluindo timestamp) realmente mudou.

**Quando rodar de novo:** após editar qualquer doc `docs/CASOS DE USO * V5.md`.

## Convenções

- Scripts Python rodam direto com `python3 scripts/<nome>.py`
- Scripts TS rodam via `npx ts-node scripts/<nome>.ts` (a partir da Fase D)
- Saída sempre em diretório fixo (`testes/...`), nunca relativa ao cwd
- Códigos de retorno: 0 = sucesso, !=0 = erro

## Ver também

- `docs/VALIDACAOFACILICITA.md` — processo completo
- `docs/PLANO VALIDACAO V3.md` — plano de implantação
- `.claude/commands/validar-uc.md` — slash command que invoca os scripts
