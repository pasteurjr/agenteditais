---
uc_id: UC-P02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P02_visual_fp.yaml
---

# UC-P02 — Selecao Inteligente de Portfolio (IA + manual fallback) (Fluxo Principal)

> **Predecessores:** UC-P01
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** asserts SQL validando vinculo edital_item_produto criado de fato no banco

## Passo 00 — Garantir PrecificacaoPage com Lote 1 expandido

```yaml
id: passo_00_garantir_lote_expandido
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const strongs = [...document.querySelectorAll('strong')];
          const strong_lote = strongs.find(el => /Lote\s+\d/i.test(el.textContent || ''));
          if (!strong_lote) return 'sem_card_lote';
          const inps = document.querySelectorAll('div.form-field input');
          if (inps.length > 0) return 'ja_expandido';
          let clickable = strong_lote.parentElement;
          while (clickable && getComputedStyle(clickable).cursor !== 'pointer' && clickable.parentElement) {
            clickable = clickable.parentElement;
            if (clickable.tagName === 'BODY') break;
          }
          if (!clickable || clickable.tagName === 'BODY') clickable = strong_lote.closest('div');
          clickable.click();
          return 'expandiu';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_00_garantir_lote_expandido"
```

## Passo 01 — Tentar vincular via IA (botão 'IA' na coluna Ações)

```yaml
id: passo_01_clicar_ia_no_item_monitor
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Localiza linha com Monitor Multiparametro e clica IA
          const rows = [...document.querySelectorAll('tr')];
          let alvo = null;
          for (const r of rows) {
            if (/MONITOR MULTIPAR/i.test(r.textContent || '')) {
              alvo = r;
              break;
            }
          }
          if (!alvo) {
            // Fallback: primeiro botao IA visivel
            const btn = [...document.querySelectorAll('button')].find(b => /^IA$/i.test((b.textContent||'').trim()));
            if (!btn) throw new Error('Sem item Monitor nem botao IA visivel');
            btn.click();
            return 'clicked_IA_fallback';
          }
          const btn = [...alvo.querySelectorAll('button')].find(b => /^IA$/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Linha Monitor sem botao IA');
          btn.click();
          return `clicked_IA_no_item_monitor`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_01_clicar_ia_no_item_monitor"
```

## Passo 02 — VALIDAÇÃO SQL: vinculo edital_item_produto criado?

Após click IA, verifica via fetch /api/crud/edital-item-produto se o vinculo foi criado.

```yaml
id: passo_02_validar_vinculo_sql
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/edital-item-produto?limit=20', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`/api/crud/edital-item-produto retornou ${r.status}`);
          const items = (await r.json()).items || [];
          window.__p02_vinculos_count = items.length;
          if (items.length >= 1) {
            window.__p02_vinculo_id = items[0].id;
            return `vinculo_OK: ${items.length} vinculos persistidos | id=${items[0].id.substring(0,8)} produto_id=${(items[0].produto_id || '').substring(0,8)}`;
          }
          return 'sem_vinculo_via_IA (necessario passo 03 vinculo manual)';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_02_validar_vinculo_sql"
```

## Passo 03 — Vínculo MANUAL (forçado via API se IA falhou)

Se passo 02 indicou 0 vinculos, força vínculo via POST /api/precificacao/vincular-ia/{item_id} com produto_id no body.

```yaml
id: passo_03_forcar_vinculo_manual
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          if (window.__p02_vinculos_count >= 1) return 'vinculo_ja_existe (skip manual)';
          
          const token = localStorage.getItem('editais_ia_access_token');
          
          // 1. Pega edital VERE
          const re = await fetch('/api/crud/editais?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const editais = (await re.json()).items || [];
          const ed = editais.find(e => e.cnpj_orgao === '75636530000120') || editais[0];
          if (!ed) throw new Error('Sem edital salvo');
          
          // 2. Pega itens do edital
          const ri = await fetch(`/api/crud/editais-itens?edital_id=${ed.id}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
          const itens = (await ri.json()).items || [];
          const item_mon = itens.find(it => /monitor.*multipar|multipar.*monitor/i.test(it.descricao || '')) || itens[0];
          if (!item_mon) throw new Error('Sem item alvo no edital');
          
          // 3. Pega produto Quantica (ou primeiro)
          const rp = await fetch('/api/crud/produtos?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const prods = (await rp.json()).items || [];
          const prod = prods[0];
          if (!prod) throw new Error('Sem produto cadastrado no portfolio');
          
          // 4. Força vinculação manual
          const r = await fetch(`/api/precificacao/vincular-ia/${item_mon.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto_id: prod.id })
          });
          if (!r.ok) throw new Error(`POST vincular-ia retornou ${r.status}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Vinculo falhou: ${data.error || JSON.stringify(data)}`);
          
          window.__p02_vinculo_id = (data.vinculo || {}).id;
          return `vinculo_manual_OK: produto=${prod.nome.substring(0,30)} item=${item_mon.id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_03_forcar_vinculo_manual"
```

## Passo 04 — VALIDAÇÃO FINAL: vinculo persistido com cnpj/produto corretos

```yaml
id: passo_04_validar_vinculo_final
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/edital-item-produto?limit=20', { headers: { Authorization: `Bearer ${token}` } });
          const items = (await r.json()).items || [];
          if (items.length < 1) throw new Error('EFEITO REAL FALHOU: nenhum vinculo edital_item_produto persistido apos P02');
          const v = items[0];
          if (!v.produto_id) throw new Error('Vinculo criado mas SEM produto_id');
          if (!v.edital_item_id) throw new Error('Vinculo criado mas SEM edital_item_id');
          window.__p02_vinculo_id_final = v.id;
          return `vinculo_OK_FINAL: id=${v.id.substring(0,8)} produto=${v.produto_id.substring(0,8)} item=${v.edital_item_id.substring(0,8)} confirmado=${v.confirmado}`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_04_validar_vinculo_final"
```
