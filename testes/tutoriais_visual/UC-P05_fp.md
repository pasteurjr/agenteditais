---
uc_id: UC-P05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P05_visual_fp.yaml
---

# UC-P05 — Preco Base (Fluxo Principal — direto via API)

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-P05_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Definir preco base via API (custo + markup 30%)

```yaml
id: passo_01_definir_preco_base
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

          const r = await fetch(`/api/precificacao/${eip_id}/preco-base`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ modo: 'markup', markup_percentual: 30 })
          });
          if (!r.ok) throw new Error(`POST /preco-base ${r.status}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Falhou: ${JSON.stringify(data).substring(0,200)}`);
          return `preco_base_OK eip=${eip_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P05_visual_fp.yaml#passo_01_definir_preco_base"
```
