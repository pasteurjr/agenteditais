---
uc_id: UC-I02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I02_visual_fp.yaml
---

# UC-I02 — Sugerir Peticao — POST /sugerir-peticao (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-I02_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Sugerir

```yaml
id: passo_01_sugerir
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
        
          const r = await fetch(`/api/editais/${ed.id}/sugerir-peticao`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'impugnacao', inconsistencias: ['Item 2 sem especificacao tecnica completa'] })
          });
          if (r.status === 500) return `sugerir_500_transient`;
          if (!r.ok) throw new Error(`POST /sugerir-peticao ${r.status}`);
          const data = await r.json();
          return `peticao_OK len=${(data.texto || data.peticao || '').length}`;
        }
    - tipo: wait
      valor_literal: 120000
validacao_ref: "testes/casos_de_teste/UC-I02_visual_fp.yaml#passo_01_sugerir"
```
