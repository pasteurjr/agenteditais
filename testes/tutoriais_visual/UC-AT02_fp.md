---
uc_id: UC-AT02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AT02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AT02_visual_fp.yaml
---

# UC-AT02 — Extrair Resultados de Ata PDF (Fluxo Principal)

> **Predecessores:** UC-AT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Extrair"

Tab Extrair tem campo upload de PDF + botao Extrair (IA).

**Observe criticamente:**
- Tab Extrair destacada
- Campo upload .pdf

```yaml
id: passo_00_aba_extrair
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Extrair/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AT02_visual_fp.yaml#passo_00_aba_extrair"
```

## Passo 01 — Validar campo de upload + botao Extrair

**COMPORTAMENTO IA**: extrai vencedores, lotes, precos da ata em PDF.

**Observe criticamente:**
- Input file accept='.pdf'
- Botao 'Extrair' presente

```yaml
id: passo_01_validar_upload
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const inp = document.querySelector('input[type="file"]');
          const btn = [...document.querySelectorAll('button')].find(b => /^Extrair$/i.test((b.textContent||'').trim()));
          return 'input=' + (!!inp) + ' botao=' + (!!btn);
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-AT02_visual_fp.yaml#passo_01_validar_upload"
```
