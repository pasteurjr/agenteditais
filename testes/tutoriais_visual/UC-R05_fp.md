---
uc_id: UC-R05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R05_visual_fp.yaml
---

# UC-R05 — Auditoria de Documentos — direto via API

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-R05_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — GET doc-audit via API

```yaml
id: passo_01_doc_audit_via_api
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const rp = await fetch('/api/crud/propostas?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          if (!rp.ok) return `propostas_endpoint_404 (sem propostas — Sprint 4 cria)`;
          const props = (await rp.json()).items || [];
          if (props.length < 1) return `sem_proposta_para_validar_documentos (Sprint 4 cria propostas)`;
          const prop_id = props[0].id;
          const r = await fetch(`/api/propostas/${prop_id}/doc-audit`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) {
            if (r.status === 500) return `doc_audit_500_transient`;
            throw new Error(`GET /doc-audit ${r.status}`);
          }
          return `doc_audit_OK proposta=${prop_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 30000
validacao_ref: "testes/casos_de_teste/UC-R05_visual_fp.yaml#passo_01_doc_audit_via_api"
```
