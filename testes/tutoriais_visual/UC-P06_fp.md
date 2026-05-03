---
uc_id: UC-P06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P06_visual_fp.yaml
---

# UC-P06 — Definir Valor de Referencia (Camada C) (Fluxo Principal)

> **Predecessores:** UC-P05
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar Card "Valor de Referencia"

Card visivel com campo Valor Referencia (R$) ou OU % sobre Preco Base.

**Observe criticamente:**
- Card 'Valor de Referencia' visivel
- Hint 'Importado do edital' OU 'Nao disponivel'

```yaml
id: passo_00_localizar_card
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P06_visual_fp.yaml#passo_00_localizar_card"
```

## Passo 01 — Preencher % sobre Preco Base = 110

Preenche o campo OU % sobre Preco Base com 110 (Valor Referencia = preco_base * 1.10 = R$ 143,00).

**Observe criticamente:**
- Campo aceita 110
- Valor Referencia calculado = R$ 143,00

```yaml
id: passo_01_preencher_pct_referencia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /sobre Pre[cç]o Base|% sobre/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_pct';
          const inp = f.querySelector('input');
          if (!inp) return 'sem_input';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, '110');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'pct=110';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-P06_visual_fp.yaml#passo_01_preencher_pct_referencia"
```

## Passo 02 — Click "Salvar Target"

POST /api/precificacao/{vinculoId}/referencia. Define o teto/target.

**Observe criticamente:**
- Botao 'Salvar Target' habilitado
- POST /referencia retorna 200/201
- **VALOR DE REFERENCIA = R$ 143,00** (teto sugerido para lances)

```yaml
id: passo_02_salvar_target
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Target/i.test(b.textContent || ''));
          if (!btn) {
            return 'sem_botao_salvar_target';
          }
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-P06_visual_fp.yaml#passo_02_salvar_target"
```
