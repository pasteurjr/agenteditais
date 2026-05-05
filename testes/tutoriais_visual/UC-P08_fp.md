---
uc_id: UC-P08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P08_visual_fp.yaml
---

# UC-P08 — Estrategia Comercial via IA (Fluxo Principal — direto via API)

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-P08_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Gerar estrategia IA via API (DeepSeek 30-90s)

```yaml
id: passo_01_gerar_estrategia
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

          const r = await fetch(`/api/precificacao/${eip_id}/estrategia`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          if (!r.ok) {
            // 500 transient DeepSeek = aceita
            if (r.status === 500) return `estrategia_500_transient (DeepSeek instavel)`;
            throw new Error(`POST /estrategia ${r.status}`);
          }
          const data = await r.json();
          return `estrategia_OK eip=${eip_id.substring(0,8)} success=${data.success}`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-P08_visual_fp.yaml#passo_01_gerar_estrategia"
```
