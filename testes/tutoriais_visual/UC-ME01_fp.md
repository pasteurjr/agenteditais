---
uc_id: UC-ME01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ME01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ME01_visual_fp.yaml
---

# UC-ME01 — Dashboard TAM/SAM/SOM (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Setup: navegar Indicadores > Mercado

Sidebar -> Indicadores -> Mercado. MercadoPage carrega com cards TAM/SAM/SOM.

**Observe criticamente (validacao por screenshot):**
- Cabecalho 'Mercado' presente
- 3 stat cards principais: TAM (Total Addressable Market), SAM (Serviceable Addressable Market), SOM (Serviceable Obtainable Market)
- Valores numericos (R$ ou %) renderizados
- Periodo/filtros disponiveis

```yaml
id: passo_00_navegar_mercado
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Mercado"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Mercado"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-ME01_visual_fp.yaml#passo_00_navegar_mercado"
```

## Passo 01 — Validar presenca TAM/SAM/SOM no DOM

**Comparar screenshot com casos de teste:**
- 3 cards TAM/SAM/SOM aparecem com valores
- Cores/badges indicando potencial
- Sem mensagem de erro

```yaml
id: passo_01_validar_tam_sam_som
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '').toUpperCase();
          const tam = /TAM/.test(txt);
          const sam = /SAM/.test(txt);
          const som = /SOM/.test(txt);
          return 'tam=' + tam + ' sam=' + sam + ' som=' + som;
        }
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-ME01_visual_fp.yaml#passo_01_validar_tam_sam_som"
```
