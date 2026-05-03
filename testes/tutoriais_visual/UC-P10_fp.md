---
uc_id: UC-P10
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P10_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P10_visual_fp.yaml
---

# UC-P10 — Gestao de Comodato (Fluxo Principal)

> **Predecessores:** [login] — apenas autenticado
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar Card "Gestao de Comodato" na aba Historico

Permanece na tab Historico. Card aparece abaixo.

**Observe criticamente:**
- Card 'Gestao de Comodato' visivel
- Campos: Equipamento, Valor do Equipamento, Prazo (meses)

```yaml
id: passo_00_localizar_card
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P10_visual_fp.yaml#passo_00_localizar_card"
```

## Passo 01 — Preencher Equipamento + Valor + Prazo e Salvar

Equipamento='Monitor Multiparametrico', Valor=15000, Prazo=24 meses. Sistema calcula amortizacao = 15000/24 = R$ 625/mes.

**Observe criticamente:**
- Campos aceitam valores
- Sistema mostra amortizacao calculada
- Botao Salvar Comodato funciona

```yaml
id: passo_01_preencher_e_salvar_comodato
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const setVal = (label, val) => {
            const f = fields.find(x => new RegExp(label, 'i').test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
            if (!f) return false;
            const inp = f.querySelector('input');
            if (!inp) return false;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(inp, val);
            inp.dispatchEvent(new Event('input', {bubbles: true}));
            inp.dispatchEvent(new Event('change', {bubbles: true}));
            return true;
          };
          setVal('^Equipamento$', 'Monitor Multiparametrico');
          setVal('Valor do Equipamento', '15000');
          setVal('Prazo', '24');
          // Click Salvar Comodato
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Comodato/i.test(b.textContent || ''));
          if (btn) { btn.click(); return 'salvou'; }
          return 'preencheu (sem botao salvar)';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-P10_visual_fp.yaml#passo_01_preencher_e_salvar_comodato"
```
