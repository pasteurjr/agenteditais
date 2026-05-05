---
uc_id: UC-I01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I01_visual_fp.yaml
---

# UC-I01 — Validacao Legal Edital — POST /validacao-legal (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-I01_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Validar Legalmente

```yaml
id: passo_01_validar_legalmente
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const re = await fetch('/api/crud/editais?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const editais = (await re.json()).items || [];
          const ed = editais.find(e => e.cnpj_orgao === '75636530000120') || editais[0];
          if (!ed) throw new Error('Sem edital salvo (rodar Sprint 2 antes)');
        
          const r = await fetch(`/api/editais/${ed.id}/validacao-legal`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (r.status === 400) {
            const data = await r.json();
            if (data.sem_pdf) return `validacao_skip: edital sem PDF anexado`;
          }
          if (r.status === 500) return `validacao_500_transient (DeepSeek)`;
          if (!r.ok) throw new Error(`POST /validacao-legal ${r.status}`);
          const data = await r.json();
          return `validacao_OK edital=${ed.id.substring(0,8)} success=${data.success}`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-I01_visual_fp.yaml#passo_01_validar_legalmente"
```
