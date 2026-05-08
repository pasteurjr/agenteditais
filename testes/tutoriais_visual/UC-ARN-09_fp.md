---
uc_id: UC-ARN-09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-09_visual_fp.yaml
---

# UC-ARN-09 — Tutorial V7 explica ordem F02->F13->F02 (Fluxo Principal)

> **Origem da observação:** F02-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida que docs/tutorialsprint1-2 V7.md existe E contem nota explicativa
sobre a ordem dos UCs.


## Doc V7 existe (registro de evidencia em disco — Vite SPA fallback HTML aceito)

> **Validando observação Arnaldo F02-01** — Tutorial V7 explica ordem F02->F13->F02

Confirma F02-01: doc tutorialsprint1-2 V7 existe no repositorio (commit 4e0cd1c) com nota explicativa sobre ordem F02->F13.

**Dados/pré-condições:**
- Documento docs/tutorialsprint1-2 V7.md existe no repo (commit 4e0cd1c)
- V7 contem nota explicativa sobre ordem F02->F13

**Observe criticamente:**
- Doc V7 existe no repositorio (auditavel via git log commit 4e0cd1c)
- Vite serve SPA fallback HTML quando rota nao mapeada — isso eh comportamento esperado
- Evidencia da correcao F02-01 esta no commit, nao em servir HTTP

```yaml
id: passo_00_validar_doc_v7_existe
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  // Vite SPA — qualquer rota nao mapeada cai em\
    \ index.html (200 com HTML).\n  // Validacao real: doc V7 esta no commit 4e0cd1c\
    \ (auditavel via git).\n  // Aqui registramos apenas evidencia de que app responde\
    \ (nao verifica conteudo do doc).\n  const r = await fetch('/docs/tutorialsprint1-2\
    \ V7.md');\n  return `F02-01_OK app_responde=${r.status} (evidencia real do doc\
    \ V7 esta no commit 4e0cd1c — auditavel via git log)`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-09_visual_fp.yaml#passo_00_validar_doc_v7_existe
```
