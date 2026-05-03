---
uc_id: UC-P07
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P07_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P07_visual_fp.yaml
---

# UC-P07 — Estruturar Lances (Camadas D e E) — minimo e maximo (Fluxo Principal)

> **Predecessores:** UC-P04, UC-P05, UC-P06
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Click na aba "Lances"

Abre tab Lances.

**Observe criticamente:**
- Tab Lances destacada
- Card 'Estrutura de Lances' aparece

```yaml
id: passo_00_abrir_aba_lances
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Lances/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba Lances nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_00_abrir_aba_lances"
```

## Passo 01 — Preencher Valor Inicial = 140,00 (lance maximo / abertura)

Define o lance inicial (maximo) em R$ 140,00 — proximo do valor de referencia (143).

**Observe criticamente:**
- Campo 'Valor Inicial (R$)' aceita 140,00
- **LANCE MAXIMO/INICIAL = R$ 140,00** (com o que abre a disputa)

```yaml
id: passo_01_preencher_valor_inicial
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Valor Inicial/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_valor_inicial';
          const inp = f.querySelector('input');
          if (!inp) return 'sem_input';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, '140,00');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'inicial=140,00';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_01_preencher_valor_inicial"
```

## Passo 02 — Preencher Valor Minimo = 115,00 (lance piso / chao)

Define o lance minimo em R$ 115,00 — acima do custo (R$ 100) mas abaixo do preco_base (R$ 130) — margem fina possivel.

**Observe criticamente:**
- Campo 'Valor Minimo (R$)' aceita 115,00
- **LANCE MINIMO/PISO = R$ 115,00** (sob qual a empresa nao desce)
- **FAIXA RESULTANTE: R$ 115,00 a R$ 140,00** (range de operacao da disputa)

```yaml
id: passo_02_preencher_valor_minimo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Valor M[ií]nimo/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_valor_min';
          const inp = f.querySelector('input');
          if (!inp) return 'sem_input';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, '115,00');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'minimo=115,00';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_02_preencher_valor_minimo"
```

## Passo 03 — Click "Salvar Lances"

POST /api/precificacao/{vinculoId}/lances. Persiste lance_inicial=140 + lance_minimo=115.

**Observe criticamente:**
- Botao 'Salvar Lances' habilitado
- POST /lances retorna 200/201
- **CONFIGURACAO FINAL DE LANCES: min R$ 115,00 / max R$ 140,00 (margem 15-40% sobre custo R$ 100)**

```yaml
id: passo_03_salvar_lances
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Lances/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-P07_visual_fp.yaml#passo_03_salvar_lances"
```
