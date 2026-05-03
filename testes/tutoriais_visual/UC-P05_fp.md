---
uc_id: UC-P05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P05_visual_fp.yaml
---

# UC-P05 — Montar Preco Base (Camada B) — Custo+Markup (Fluxo Principal)

> **Predecessores:** UC-P04
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar Card "Preco Base"

Permanece na aba Custos e Precos. Localiza Card 'Preco Base'.

**Observe criticamente:**
- Card 'Preco Base' visivel
- Select 'Modo' com opcoes Custo+Markup / Manual / Upload

```yaml
id: passo_00_localizar_card
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P05_visual_fp.yaml#passo_00_localizar_card"
```

## Passo 01 — Preencher Markup (%) = 30

Modo default e Custo+Markup. Preenche campo Markup com 30 (sistema calcula preco base = custo * 1.30 = R$ 130,00).

**Observe criticamente:**
- Campo Markup (%) aceita 30
- Sistema mostra preco base calculado em algum lugar (preview)

```yaml
id: passo_01_preencher_markup_30
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Markup/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_markup';
          const inp = f.querySelector('input');
          if (!inp) return 'sem_input';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, '30');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'markup=30';
        }
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-P05_visual_fp.yaml#passo_01_preencher_markup_30"
```

## Passo 02 — Click "Salvar Preco Base"

Click em Salvar Preco Base. Backend faz POST /api/precificacao/{vinculoId}/preco-base com markup=30.

**Observe criticamente:**
- Botao Salvar Preco Base habilitado
- POST /preco-base retorna 200/201
- **PRECO BASE CALCULADO = custo * (1 + markup/100) = 100 * 1.30 = R$ 130,00** (este sera o piso para definir lance min/max nas proximas etapas)

```yaml
id: passo_02_salvar_preco_base
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Pre[cç]o Base/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_salvar_preco_base (vinculo nao selecionado)';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-P05_visual_fp.yaml#passo_02_salvar_preco_base"
```
