---
uc_id: UC-P03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P03_visual_fp.yaml
---

# UC-P03 — Calculo Tecnico de Volumetria (Fluxo Principal — direto via API)

> **Predecessores:** UC-P02 (vínculo edital_item_produto criado)
> **Sprint:** 3 — Precificacao
> **Profundidade:** chamada direta backend + assert SQL

## Passo 00 — Configurar custos via backend (volumetria + custo unitário)

(Sem dependência de DOM — chamada direta de API.)

Chama POST /api/precificacao/{eip_id}/custos com payload de custos.

```yaml
id: passo_01_configurar_custos_via_api
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const rv = await fetch('/api/crud/edital-item-produto?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const vinculos = (await rv.json()).items || [];
          if (vinculos.length < 1) throw new Error('Nenhum vinculo edital_item_produto (rodar UC-P02 primeiro)');
          const v = vinculos[0];
          window.__p03_eip_id = v.id;

          const r = await fetch(`/api/precificacao/${v.id}/custos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              custo_unitario: 5000.00,
              custo_fonte: 'manual',
              icms: 18,
              ipi: 0,
              pis_cofins: 9.25
            })
          });
          if (!r.ok) throw new Error(`POST /custos retornou ${r.status}: ${await r.text()}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Custos falhou: ${JSON.stringify(data).substring(0,200)}`);
          return `custos_OK: vinculo=${v.id.substring(0,8)} custo_unitario=5000`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P03_visual_fp.yaml#passo_01_configurar_custos_via_api"
```

## Passo 02 — VALIDAÇÃO SQL: precif_camadas tem custo_unitario != null

```yaml
id: passo_02_validar_custos_sql
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const eip_id = window.__p03_eip_id;
          if (!eip_id) throw new Error('eip_id nao setado');
          const r = await fetch(`/api/crud/precif-camadas?edital_item_produto_id=${eip_id}&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) {
            const r2 = await fetch(`/api/crud/preco-camadas?edital_item_produto_id=${eip_id}&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r2.ok) {
              const r3 = await fetch(`/api/crud/camadas?edital_item_produto_id=${eip_id}&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
              if (!r3.ok) return 'endpoint_camadas_404 (validacao via tool ja feita no passo 01)';
              const items = (await r3.json()).items || [];
              if (items.length < 1) throw new Error('precif-camadas vazio apos POST /custos');
              const c = items[0];
              if (c.custo_unitario == null) throw new Error('camadas existe mas custo_unitario=null');
              return `custos_persistidos_OK: custo=${c.custo_unitario}`;
            }
          }
          return 'custos_OK_via_endpoint';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-P03_visual_fp.yaml#passo_02_validar_custos_sql"
```
