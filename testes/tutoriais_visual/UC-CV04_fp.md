---
uc_id: UC-CV04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV04_visual_fp.yaml
---

# UC-CV04 — Definir estrategia (Defensivo + margem 30%) e salvar (Fluxo Principal)

> **Predecessores:** UC-CV02 + UC-CV03
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Garantir painel lateral aberto (do CV02/CV03)

Painel visivel com radio 'Intencao Estrategica' + slider de margem.

```yaml
id: passo_00_garantir_painel
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_00_garantir_painel"
```

## Passo 01 — Selecionar Radio 'Defensivo' (Intencao Estrategica)

**EFEITO REAL:** radio Defensivo marcado.

```yaml
id: passo_01_selecionar_intencao_defensivo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const radios = [...document.querySelectorAll('input[type="radio"]')];
          const r = radios.find(x => /Defensivo/i.test((x.closest('label')?.textContent || '').trim()));
          if (!r) return 'sem_radio_defensivo (UI pode ter outro layout)';
          r.click();
          return 'defensivo_selecionado';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_01_selecionar_intencao_defensivo"
```

## Passo 02 — Ajustar slider/input margem para 30%

**EFEITO REAL:** valor margem = 30.

```yaml
id: passo_02_ajustar_margem_30
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Tenta slider, depois number input
          const slider = document.querySelector('input[type="range"]');
          if (slider) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(slider, '30');
            slider.dispatchEvent(new Event('input', {bubbles: true}));
            slider.dispatchEvent(new Event('change', {bubbles: true}));
            return 'margem_30_slider';
          }
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Margem|Expectativa/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (f) {
            const inp = f.querySelector('input');
            if (inp) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, '30');
              inp.dispatchEvent(new Event('input', {bubbles: true}));
              return 'margem_30_input';
            }
          }
          return 'sem_campo_margem';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_02_ajustar_margem_30"
```

## Passo 03 — Click 'Salvar Estrategia' — POST /api/crud/estrategias-editais

**EFEITO REAL:**
- POST estrategias-editais retorna 200/201
- Estrategia persistida no banco editais


```yaml
id: passo_03_salvar_estrategia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Estrategia/i.test(b.textContent || ''));
          if (!btn) throw new Error('botao Salvar Estrategia ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_salvar_estrategia';
        }
    - tipo: wait
      valor_literal: 4000
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_03_salvar_estrategia"
```
