---
uc_id: UC-RE01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE01_visual_fp.yaml
---

# UC-RE01 — Monitorar Janela de Recurso (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Setup: navegar Fluxo Comercial > Recursos

Sidebar -> click Recursos. RecursosPage carrega com tab Monitoramento.

**Observe criticamente:**
- RecursosPage carrega
- Tabs: Monitoramento / Analise / Laudos

```yaml
id: passo_00_navegar_recursos
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Recursos"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Recursos"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_00_navegar_recursos"
```

## Passo 01 — Selecionar edital para monitorar

Escolhe edital herdado da Sprint 2.

**Observe criticamente:**
- Select 'Selecione o Edital' com opcoes
- Apos selecionar, opcoes de canais (WhatsApp/Email/Alerta)

```yaml
id: passo_01_selecionar_edital_monit
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
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_01_selecionar_edital_monit"
```

## Passo 02 — Validar botao "Registrar Intencao de Recurso"

Botao registra que vamos recorrer.

**Observe criticamente:**
- Botao 'Registrar Intencao de Recurso' presente

```yaml
id: passo_02_validar_botao_intencao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Registrar Inten[cç][aã]o de Recurso/i.test(b.textContent || ''));
          return btn ? 'presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_02_validar_botao_intencao"
```
