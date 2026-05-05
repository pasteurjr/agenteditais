---
uc_id: UC-P07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P07_visual_fp.yaml
---

# UC-P07 — Estrutura de Lances (Fluxo Principal — direto via API)

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Estruturar lances via API

```yaml
id: passo_01_estruturar_lances
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

          const r = await fetch(`/api/precificacao/${eip_id}/lances`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lance_inicial: 7500.00,
              lance_minimo: 5500.00,
              modo_inicial: 'absoluto',
              modo_minimo: 'absoluto',
              desconto_maximo_pct: 27
            })
          });
          if (!r.ok) throw new Error(`POST /lances ${r.status}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Falhou: ${JSON.stringify(data).substring(0,200)}`);
          return `lances_OK eip=${eip_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_01_estruturar_lances"
```
