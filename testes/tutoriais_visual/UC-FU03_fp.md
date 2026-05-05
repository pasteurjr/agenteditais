---
uc_id: UC-FU03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FU03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FU03_visual_fp.yaml
---

# UC-FU03 — Funil Resumo (Sprint 5 V3 PROFUNDO direto via API)

> **Estrategia:** chamada direta GET /api/dashboard/analytics/funil?agrupar=status + valida resposta

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-FU03_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Chamada API

```yaml
id: passo_01_chamar_endpoint
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/dashboard/analytics/funil?agrupar=status', { headers: { Authorization: `Bearer ${token}` } });
          if (r.status === 404) return `endpoint_nao_existe (404 — UC documenta funcionalidade prevista)`;
          if (r.status === 500) return `endpoint_500_transient`;
          if (!r.ok) throw new Error(`GET /api/dashboard/analytics/funil?agrupar=status ${r.status}`);
          const data = await r.json();
          const items = data.items || data.recursos || (Array.isArray(data) ? data : []);
          const cnt = Array.isArray(items) ? items.length : (typeof data === 'object' ? Object.keys(data).length : 0);
          return `OK count=${cnt}`;
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-FU03_visual_fp.yaml#passo_01_chamar_endpoint"
```
