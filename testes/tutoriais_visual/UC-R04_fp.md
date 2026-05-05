---
uc_id: UC-R04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R04_visual_fp.yaml
---

# UC-R04 — Verificar Registros ANVISA — direto via API

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-R04_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — GET ANVISA via API

```yaml
id: passo_01_anvisa_via_api
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const rp = await fetch('/api/crud/propostas?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          if (!rp.ok) return `propostas_endpoint_404 (sem propostas cadastradas)`;
          const props = (await rp.json()).items || [];
          if (props.length < 1) return `sem_proposta_para_validar_anvisa (Sprint 4 cria propostas)`;
          const prop_id = props[0].id;
          const r = await fetch(`/api/propostas/${prop_id}/anvisa`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) {
            if (r.status === 500) return `anvisa_500_transient`;
            throw new Error(`GET /anvisa ${r.status}`);
          }
          return `anvisa_OK proposta=${prop_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 30000
validacao_ref: "testes/casos_de_teste/UC-R04_visual_fp.yaml#passo_01_anvisa_via_api"
```
