---
uc_id: UC-RE05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE05_visual_fp.yaml
---

# UC-RE05 — Sugerir Argumentos Recurso (mesmo padrao I02) (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-RE05_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Sugerir Argumentos

```yaml
id: passo_01_sugerir_argumentos
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
        
          // Reusa endpoint sugerir-peticao com tipo='recurso'
          const r = await fetch(`/api/editais/${ed.id}/sugerir-peticao`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'recurso', inconsistencias: ['Empresa foi inabilitada incorretamente'] })
          });
          if (r.status === 500) return `sugerir_recurso_500_transient`;
          if (!r.ok) throw new Error(`POST /sugerir ${r.status}`);
          return `argumentos_sugeridos_OK`;
        }
    - tipo: wait
      valor_literal: 120000
validacao_ref: "testes/casos_de_teste/UC-RE05_visual_fp.yaml#passo_01_sugerir_argumentos"
```
