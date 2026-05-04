---
uc_id: UC-CV05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV05_visual_fp.yaml
---

# UC-CV05 — Exportar resultados da busca em CSV (client-side) (Fluxo Principal)

> **Predecessores:** UC-CV01
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Garantir grade com resultados

Tabela visivel.

```yaml
id: passo_00_garantir_grade
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'table tbody tr'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV05_visual_fp.yaml#passo_00_garantir_grade"
```

## Passo 01 — Click 'Exportar CSV' (geração client-side)

**EFEITO REAL:** botao executa download local (sem network call).
Validacao: botao habilitado, click sem erro.

```yaml
id: passo_01_clicar_exportar_csv
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Exportar CSV|Exportar.*CSV/i.test(b.textContent || ''));
          if (!btn) throw new Error('botao Exportar CSV ausente');
          if (btn.disabled) throw new Error('botao desabilitado');
          btn.click();
          return 'csv_clicado';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV05_visual_fp.yaml#passo_01_clicar_exportar_csv"
```
