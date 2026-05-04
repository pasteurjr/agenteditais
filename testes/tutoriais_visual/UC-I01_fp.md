---
uc_id: UC-I01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I01_visual_fp.yaml
---

# UC-I01 — Validacao Legal do Edital (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Setup: navegar Fluxo Comercial > Impugnacao

Sidebar -> click Impugnacao. Page carrega com tab 'Validacao Legal' default.

**Observe criticamente:**
- Sidebar com Fluxo Comercial expandida
- ImpugnacaoPage carrega
- Tabs visiveis: Validacao Legal / Peticoes / Prazos

```yaml
id: passo_00_navegar_impugnacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Impugnacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Impugnacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-I01_visual_fp.yaml#passo_00_navegar_impugnacao"
```

## Passo 01 — Selecionar primeiro edital no Select

Escolhe o primeiro edital (herdado da Sprint 2 — edital salvo de maior score).

**Observe criticamente:**
- Select 'Selecione o Edital' tem opcoes
- Botao 'Analisar Edital' fica habilitado

```yaml
id: passo_01_selecionar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Selecione o Edital/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) return 'sem_campo_edital';
          const sel = f.querySelector('select');
          if (!sel) return 'sem_select';
          const opts = [...sel.options].filter(o => o.value);
          if (!opts.length) return 'sem_editais';
          sel.value = opts[0].value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'edital=' + opts[0].textContent.trim().slice(0, 40);
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-I01_visual_fp.yaml#passo_01_selecionar_edital"
```

## Passo 02 — Click "Analisar Edital" — chama IA pra validacao legal

Backend faz POST /api/impugnacoes/analisar-edital com DeepSeek. Retorna findings de inconsistencias legais.

**Observe criticamente:**
- Botao 'Analisar Edital' visivel
- Apos click, IA processa (30-90s)
- Card com lista de findings aparece
- **COMPORTAMENTO IA**: deve identificar clausulas problematicas, exigencias ilegais, ambiguidades

```yaml
id: passo_02_analisar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Analisar Edital/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_analisar';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicado';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-I01_visual_fp.yaml#passo_02_analisar_edital"
```
