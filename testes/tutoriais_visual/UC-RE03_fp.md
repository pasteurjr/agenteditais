---
uc_id: UC-RE03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE03_visual_fp.yaml
---

# UC-RE03 — Atualizar Status Recurso - PUT /recursos/{id}/status (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-RE03_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Atualizar Status

```yaml
id: passo_01_atualizar_status
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/recursos', { headers: { Authorization: `Bearer ${token}` } });
          const data = await r.json();
          const arr = data.items || data.recursos || (Array.isArray(data) ? data : []);
          if (arr.length < 1) throw new Error('Sem recurso para atualizar');
          const rec = arr[0];
        
          const r2 = await fetch(`/api/recursos/${rec.id}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'enviado' })
          });
          if (!r2.ok) throw new Error(`PUT status ${r2.status}: ${await r2.text()}`);
          return `status_atualizado_OK recurso=${rec.id.substring(0,8)} novo=enviado`;
        }
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-RE03_visual_fp.yaml#passo_01_atualizar_status"
```
