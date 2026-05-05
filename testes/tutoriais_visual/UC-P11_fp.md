---
uc_id: UC-P11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P11_visual_fp.yaml
---

# UC-P11 — Insights de Precificação (IA + histórico) — direto via API

> **Predecessores:** UC-P02..P07 (vínculo + camadas A-E)
> **Sprint:** 3
> **Estrategia:** GET direto na API; valida resposta com banner + cards

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-P11_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — GET /api/precificacao/{eip_id}/insights via fetch

```yaml
id: passo_01_insights_via_api
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const rv = await fetch('/api/crud/edital-item-produto?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const vinculos = (await rv.json()).items || [];
          if (vinculos.length < 1) throw new Error('Sem vinculo');
          const eip_id = vinculos[0].id;

          const r = await fetch(`/api/precificacao/${eip_id}/insights`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) {
            if (r.status === 500) return `insights_500_transient (DeepSeek instavel)`;
            throw new Error(`GET /insights ${r.status}`);
          }
          const data = await r.json();
          return `insights_OK eip=${eip_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-P11_visual_fp.yaml#passo_01_insights_via_api"
```
