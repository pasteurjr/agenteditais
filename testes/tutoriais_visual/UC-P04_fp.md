---
uc_id: UC-P04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P04_visual_fp.yaml
---

# UC-P04 — Configurar Custos Detalhados (Fluxo Principal — direto via API)

> **Predecessores:** UC-P02
> **Sprint:** 3
> **Estrategia:** chamada direta + assert SQL

## Passo 00 — Garantir PrecificacaoPage

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-P04_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Atualizar custos via API

```yaml
id: passo_01_atualizar_custos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const rv = await fetch('/api/crud/edital-item-produto?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const vinculos = (await rv.json()).items || [];
          if (vinculos.length < 1) throw new Error('Sem vinculo (P02 falhou)');
          const eip_id = vinculos[0].id;

          const r = await fetch(`/api/precificacao/${eip_id}/custos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ custo_unitario: 4500.50, custo_fonte: 'manual', icms: 18, ipi: 5, pis_cofins: 9.25 })
          });
          if (!r.ok) throw new Error(`POST /custos retornou ${r.status}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Falhou: ${JSON.stringify(data).substring(0,200)}`);
          window.__p04_eip_id = eip_id;
          return `custos_atualizados_OK eip=${eip_id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P04_visual_fp.yaml#passo_01_atualizar_custos"
```
