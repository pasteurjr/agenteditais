---
uc_id: UC-CV04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV04_visual_fp.yaml
---

# UC-CV04 — Definir estrategia, intencao e margem (Fluxo Principal)

> **Cenario:** apos UC-CV02 ter aberto painel lateral e UC-CV03 ter salvo edital, dentro do painel: muda radio "Intencao" para "Defensivo" + slider de margem para 30%, click "Salvar Estrategia".
>
> **Pre-requisitos:** UC-CV02, UC-CV03.

## Passo 00 — Confirmar painel aberto + edital salvo

Painel lateral deve estar visivel. Se nao, reabre via Ver detalhes.

```yaml
id: passo_00_confirmar_painel
acao:
  sequencia:
    # Reabre painel se nao tiver visivel
    - tipo: evaluate
      valor_literal: |
        () => {
          const painel = document.querySelector('.captacao-layout.with-panel, [class*="panel"], aside');
          if (painel) return 'painel ja aberto';
          const buttons = [...document.querySelectorAll('button[title="Ver detalhes"]')];
          if (!buttons.length) throw new Error('Sem botao Ver detalhes nem painel aberto');
          buttons[0].click();
          return 'painel reaberto';
        }
    - tipo: wait
      valor_literal: 1500
    - tipo: wait_for
      seletor: '.panel-section, h4:has-text("Intencao")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_00_confirmar_painel"
```

## Passo 01 — Selecionar intencao "Defensivo"

Click no radio "Defensivo" do RadioGroup name="intencao-panel".

**Observe criticamente:**
- Radio "Defensivo" muda visualmente para selecionado
- Outros radios desmarcam

```yaml
id: passo_01_selecionar_intencao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const radios = [...document.querySelectorAll('input[type="radio"]')];
          // Procura input cujo value seja 'defensivo' ou cujo label irmao tenha texto Defensivo
          const r = radios.find(rd => rd.value === 'defensivo' ||
            (rd.parentElement && /Defensivo/i.test(rd.parentElement.textContent || '')));
          if (!r) throw new Error('Radio Defensivo nao encontrado');
          r.scrollIntoView({block: 'center'});
          r.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_01_selecionar_intencao"
```

## Passo 02 — Ajustar margem para 30%

Seta input range para 30 e dispara onChange.

**Observe criticamente:**
- Slider chega ao valor 30
- Header "Expectativa de Margem: 30%" atualiza

```yaml
id: passo_02_ajustar_margem
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const range = document.querySelector('input[type="range"]');
          if (!range) throw new Error('Slider de margem nao encontrado');
          // Usa native setter para disparar React onChange
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(range, '30');
          range.dispatchEvent(new Event('input', { bubbles: true }));
          range.dispatchEvent(new Event('change', { bubbles: true }));
          return 'set 30';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_02_ajustar_margem"
```

## Passo 03 — Click "Salvar Estrategia"

Backend persiste em editais_salvos via PUT.

**Observe criticamente:**
- Botao "Salvar Estrategia" presente no painel-actions
- Apos click, backend retorna 200/201
- Indicador de sucesso (toast ou estrategiaSalva)

```yaml
id: passo_03_salvar_estrategia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Salvar Estrategia/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Salvar Estrategia nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-CV04_visual_fp.yaml#passo_03_salvar_estrategia"
```
