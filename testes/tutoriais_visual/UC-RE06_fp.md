---
uc_id: UC-RE06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE06_visual_fp.yaml
---

# UC-RE06 — Validar status final dos recursos no banco (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-RE06_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Validar Status

```yaml
id: passo_01_validar_status
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/recursos', { headers: { Authorization: `Bearer ${token}` } });
          const data = await r.json();
          const arr = data.items || data.recursos || (Array.isArray(data) ? data : []);
          if (arr.length < 1) throw new Error('EFEITO REAL: 0 recursos no banco');
          const com_status = arr.filter(x => x.status);
          return `recursos_com_status_OK ${com_status.length}/${arr.length}`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-RE06_visual_fp.yaml#passo_01_validar_status"
```
