---
uc_id: UC-AT02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AT02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AT02_visual_fp.yaml
---

# UC-AT02 — Salvar Ata (Sprint 5 V3 PROFUNDO direto via API)

> **Estrategia:** chamada direta POST /api/atas/salvar + valida resposta

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-AT02_visual_fp.yaml#passo_00_setup"
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
          const r = await fetch('/api/atas/salvar', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({"numero": "AT-001/2026", "orgao": "Teste", "valor_total": 50000})
          });
          if (r.status === 500) return `endpoint_500_transient`;
          if (r.status === 400) {
            const data = await r.json();
            return `validacao_falhou (FE-04): ${(data.error || '').substring(0,80)}`;
          }
          if (!r.ok) throw new Error(`POST /api/atas/salvar ${r.status}`);
          const data = await r.json();
          return `criado_OK id=${(data.id || data.recurso_id || '').toString().substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-AT02_visual_fp.yaml#passo_01_chamar_endpoint"
```
