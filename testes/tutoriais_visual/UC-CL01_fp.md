---
uc_id: UC-CL01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CL01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CL01_visual_fp.yaml
---

# UC-CL01 — Gerar Classes do Portfolio via IA (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 8 — Dispensas, Classes IA, Mascaras
> **Validacao screenshots:** cada passo captura before/after para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Configuracoes > Parametrizacoes

ParametrizacoesPage onde fica funcionalidade Classes IA.

**Validar screenshot:**
- Cabecalho 'Parametriza...' presente
- Tabs/secoes incluindo Classes/Mascaras

```yaml
id: passo_00_navegar_parametros
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Configuracoes/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Configuracoes nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Parametrizacoes"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CL01_visual_fp.yaml#passo_00_navegar_parametros"
```

## Passo 01 — Validar botao "Gerar Classes via IA"

**COMPORTAMENTO IA**: agrupa produtos do portfolio em classes (DeepSeek analisa NCMs+nomes).

**Validar screenshot:**
- Botao 'Gerar Classes via IA' OU 'Gerar Classes' visivel

```yaml
id: passo_01_validar_botao_gerar_classes_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Gerar Classes/i.test(b.textContent||''));
          return btn ? 'botao_presente' : 'sem_botao_dedicado (acesso via aba/secao)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CL01_visual_fp.yaml#passo_01_validar_botao_gerar_classes_ia"
```
