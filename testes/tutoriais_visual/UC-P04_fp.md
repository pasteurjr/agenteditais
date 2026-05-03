---
uc_id: UC-P04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P04_visual_fp.yaml
---

# UC-P04 — Configurar Base de Custos (Fluxo Principal)

> **Predecessores:** UC-P03
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Garantir aba Custos e Precos + vinculo selecionado

Mantém-se na aba Custos e Precos com vinculo ja selecionado (UC-P03).

**Observe criticamente:**
- Card 'Base de Custos' visivel

```yaml
id: passo_00_garantir_aba_custos
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P04_visual_fp.yaml#passo_00_garantir_aba_custos"
```

## Passo 01 — Preencher Custo Unitario (R$) = 100,00

No Card Base de Custos, preenche o campo Custo Unitario com valor 100,00 (formato BR — usuario digita virgula).

**Observe criticamente:**
- Campo 'Custo Unitario (R$)' aceita 100,00
- Campo 'NCM' exibe valor importado (readonly)

```yaml
id: passo_01_preencher_custo_unitario
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Custo Unit[aá]rio/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_custo';
          const inp = f.querySelector('input');
          if (!inp) return 'sem_input';
          // Disparar React-friendly onChange
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, '100,00');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
          inp.dispatchEvent(new Event('change', {bubbles: true}));
          return 'preenchido 100,00';
        }
    - tipo: wait
      valor_literal: 600
validacao_ref: "testes/casos_de_teste/UC-P04_visual_fp.yaml#passo_01_preencher_custo_unitario"
```

## Passo 02 — Click "Salvar Custos"

Click no botao Salvar Custos. Backend faz POST /api/precificacao/{vinculoId}/custos.

**Observe criticamente:**
- Botao 'Salvar Custos' habilitado
- Apos click, request POST /custos retorna 200/201
- Toast de confirmacao

```yaml
id: passo_02_salvar_custos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar Custos/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_salvar_custos (vinculo nao selecionado)';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-P04_visual_fp.yaml#passo_02_salvar_custos"
```
