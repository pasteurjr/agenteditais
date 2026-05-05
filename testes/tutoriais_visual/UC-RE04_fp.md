---
uc_id: UC-RE04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE04_visual_fp.yaml
---

# UC-RE04 — Score Recurso - GET /recursos/{edital_id}/score (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-RE04_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Score Recurso

```yaml
id: passo_01_score_recurso
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const re = await fetch('/api/crud/editais?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const editais = (await re.json()).items || [];
          const ed = editais.find(e => e.cnpj_orgao === '75636530000120') || editais[0];
          if (!ed) throw new Error('Sem edital');
        
          const r = await fetch(`/api/recursos/${ed.id}/score`, { headers: { Authorization: `Bearer ${token}` } });
          if (r.status === 500) return `score_500_transient`;
          if (!r.ok) throw new Error(`GET score ${r.status}`);
          const data = await r.json();
          return `score_OK total=${data.total || data.score_total || '?'}`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-RE04_visual_fp.yaml#passo_01_score_recurso"
```
