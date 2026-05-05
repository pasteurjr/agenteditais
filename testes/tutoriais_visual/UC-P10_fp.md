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

> **Predecessores:** [login]
> **Sprint:** 3 — Precificacao e Proposta
> **Profundidade:** padrao Sprint 1 — asserts DOM/rede validando texto/valor real

## Passo 00 — Localizar Card 'Gestao de Comodato' na aba Historico

Card com campos: Equipamento, Valor (R$), Prazo (meses).

```yaml
id: passo_00_localizar_card_comodato
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-P10_visual_fp.yaml#passo_00_localizar_card_comodato"
```

## Passo 01 — Preencher Equipamento='Monitor', Valor=15000, Prazo=24 — Amort=R$ 625/mes

Sistema calcula amortizacao = 15000/24 = R$ 625,00/mes.

```yaml
id: passo_01_preencher_comodato
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const setVal = (label_re, val) => {
            const f = fields.find(x => new RegExp(label_re, 'i').test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
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
          return 'preenchido';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-P10_visual_fp.yaml#passo_01_preencher_comodato"
```

## Passo 02 — Click 'Salvar Comodato'

Salva. Card 'Comodatos' deve mostrar 1 linha nova.

```yaml
id: passo_02_salvar_comodato
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Comodato/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-P10_visual_fp.yaml#passo_02_salvar_comodato"
```
