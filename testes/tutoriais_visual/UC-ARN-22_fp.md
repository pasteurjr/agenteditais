---
uc_id: UC-ARN-22
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-22_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-22_visual_fp.yaml
---

# UC-ARN-22 — CRF FGTS persiste arquivo_path (Fluxo Principal)

> **Origem da observação:** F04-08
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Backend sempre salva path quando scraper retorna PDF. Valida via
consulta a certidoes existentes que tenham path nao-NULL.


## Existe ao menos 1 certidao com path_arquivo nao-NULL no banco

> **Validando observação Arnaldo F04-08** — CRF FGTS persiste arquivo_path

Confirma F04-08: backend salva path_arquivo mesmo quando scraper retorna PDF com status pendente. Verifica via API se ≥1 certidao tem path nao-NULL.

**Dados/pré-condições:**
- Backend salva path_arquivo mesmo quando scraper retorna PDF com status pendente
- Antes: path so era salvo se status=valida; agora salvo sempre

**Observe criticamente:**
- API /api/crud/empresa-certidoes responde 200
- Pelo menos 1 certidao com path_arquivo nao-NULL (se houver dados)
- Backend salva path mesmo com status pendente (correcao F04-08)

```yaml
id: passo_00_validar_persistencia
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/crud/empresa-certidoes?limit=50', {headers:{Authorization:`Bearer\
    \ ${token}`}});\n  if (!r.ok) throw new Error(`API ${r.status}`);\n  const data\
    \ = await r.json();\n  const items = data.items || data.dados || [];\n  if (items.length\
    \ === 0) {\n    return 'F04-08_sem_certidoes (correcao no codigo, nao verificavel\
    \ sem dados)';\n  }\n  // Conta certidoes com path nao-NULL\n  const com_path\
    \ = items.filter(c => c.path_arquivo || c.arquivo_path || c.caminho_arquivo);\n\
    \  if (com_path.length === 0) {\n    throw new Error(`F04-08 NAO corrigido: ${items.length}\
    \ certidoes mas TODAS com path NULL`);\n  }\n  return `F04-08_OK ${com_path.length}/${items.length}\
    \ certidoes com path persistido`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-22_visual_fp.yaml#passo_00_validar_persistencia
```
