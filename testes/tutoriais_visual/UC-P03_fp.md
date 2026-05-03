---
uc_id: UC-P03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P03_visual_fp.yaml
---

# UC-P03 — Calculo Tecnico de Volumetria (Fluxo Principal)

> **Predecessores:** UC-P01, UC-P02
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Click na aba "Custos e Precos"

Abre a tab Custos e Precos no TabPanel da PrecificacaoPage.

**Observe criticamente:**
- Tab 'Custos e Precos' destacada como ativa
- Card 'Selecionar Item-Produto' aparece com Select 'Vinculo Item <-> Produto'

```yaml
id: passo_00_abrir_aba_custos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Custos e Pre[cç]os/i.test(b.textContent || ''));
          if (!btn) throw new Error('Aba Custos e Precos nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-P03_visual_fp.yaml#passo_00_abrir_aba_custos"
```

## Passo 01 — Selecionar primeiro vinculo item-produto no select

Escolhe o primeiro vinculo disponivel no Select 'Vinculo Item <-> Produto'.

**Observe criticamente:**
- Select 'Vinculo Item <-> Produto' com opcoes
- Apos selecao, cards Conversao de Quantidade / Base de Custos / Preco Base aparecem

```yaml
id: passo_01_selecionar_vinculo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /V[ií]nculo Item/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_vinculo';
          const sel = f.querySelector('select');
          if (!sel) return 'sem_select';
          const opts = [...sel.options].filter(o => o.value);
          if (!opts.length) return 'sem_vinculos_disponiveis';
          sel.value = opts[0].value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'vinculo=' + opts[0].textContent.trim().slice(0, 40);
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-P03_visual_fp.yaml#passo_01_selecionar_vinculo"
```
