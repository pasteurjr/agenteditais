---
uc_id: UC-AP01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AP01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AP01_visual_fp.yaml
---

# UC-AP01 — Consultar Feedbacks Registrados (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Aprendizado

AprendizadoPage com feedbacks e padroes.

**Validar screenshot:**
- Cabecalho 'Aprendizado'
- Lista de feedbacks ou tab/secao

```yaml
id: passo_00_navegar_aprendizado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Indicadores/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Indicadores nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Aprendizado"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Aprendizado"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-AP01_visual_fp.yaml#passo_00_navegar_aprendizado"
```

## Passo 01 — Validar lista de feedbacks

**Validar screenshot:** Tabela ou lista de feedbacks registrados (pode estar vazia)

```yaml
id: passo_01_validar_feedbacks
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-AP01_visual_fp.yaml#passo_01_validar_feedbacks"
```
