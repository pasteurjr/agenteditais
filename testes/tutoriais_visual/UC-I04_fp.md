---
uc_id: UC-I04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I04_visual_fp.yaml
---

# UC-I04 — Listar Impugnacoes (acao + valida count >=1) (Sprint 4 V3 PROFUNDO via API)

> **Predecessores:** Sprint 2 V3 + Sprint 3 V3
> **Estrategia:** chamada direta API + assert SQL

## Passo 00 Setup

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-I04_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Listar Impugnacoes

```yaml
id: passo_01_listar_impugnacoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/impugnacoes?limit=20', { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) throw new Error(`GET /impugnacoes ${r.status}`);
          const items = (await r.json()).items || [];
          if (items.length < 1) throw new Error('EFEITO REAL: 0 impugnacoes (rodar I03 antes)');
          return `lista_OK ${items.length} impugnacoes`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-I04_visual_fp.yaml#passo_01_listar_impugnacoes"
```
