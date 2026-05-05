---
uc_id: UC-P09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P09_visual_fp.yaml
---

# UC-P09 — Consultar Historico de Precos (Fluxo Principal)

> **Predecessores:** UC-F06
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Click aba 'Historico'

Tab Historico ativa.

```yaml
id: passo_00_aba_historico
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Hist[oó]rico/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-P09_visual_fp.yaml#passo_00_aba_historico"
```

## Passo 01 — Preencher 'Produto/Termo' = 'monitor' e click 'Filtrar'

Backend busca em preco_historico + PNCP. Aparece estatisticas Min/Media/Max.

```yaml
id: passo_01_preencher_termo_e_filtrar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Produto\/Termo|Termo/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (f) {
            const inp = f.querySelector('input');
            if (inp) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, 'monitor');
              inp.dispatchEvent(new Event('input', {bubbles: true}));
            }
          }
          const btn = [...document.querySelectorAll('button')].find(b => /^Filtrar$/i.test((b.textContent||'').trim()));
          if (btn) { btn.click(); return 'filtrou'; }
          return 'sem_botao_filtrar';
        }
    - tipo: wait
      valor_literal: 30000
validacao_ref: "testes/casos_de_teste/UC-P09_visual_fp.yaml#passo_01_preencher_termo_e_filtrar"
```
