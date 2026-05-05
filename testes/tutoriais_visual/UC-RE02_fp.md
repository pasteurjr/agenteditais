---
uc_id: UC-RE02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE02_visual_fp.yaml
---

# UC-RE02 — Listar Recursos - GET /recursos (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-RE02_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Listar Recursos

```yaml
id: passo_01_listar_recursos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/recursos', { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) throw new Error(`GET /recursos ${r.status}`);
          const data = await r.json();
          const arr = data.items || data.recursos || (Array.isArray(data) ? data : []);
          if (arr.length < 1) throw new Error('EFEITO REAL: 0 recursos (rodar RE01 antes)');
          return `lista_OK ${arr.length} recursos`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-RE02_visual_fp.yaml#passo_01_listar_recursos"
```
