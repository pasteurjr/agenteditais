---
uc_id: UC-R06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R06_visual_fp.yaml
---

# UC-R06 — Exportar Dossie Completo (PDF/DOCX/ZIP) (Fluxo Principal)

> **Predecessores:** UC-R01, UC-R04 OU UC-R05
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar Card "Exportacao" com botoes Baixar PDF/DOCX/ZIP

Card aparece na proposta selecionada.

**Observe criticamente:**
- Card 'Exportacao' visivel
- Botoes 'Baixar PDF', 'Baixar DOCX', 'Baixar Dossie ZIP', 'Enviar por Email'

```yaml
id: passo_00_localizar_card_exportacao
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-R06_visual_fp.yaml#passo_00_localizar_card_exportacao"
```

## Passo 01 — Validar presenca dos 4 botoes de exportacao

Apenas valida que os botoes estao presentes (download real abre file picker).

**Observe criticamente:**
- 'Baixar PDF', 'Baixar DOCX', 'Baixar Dossie ZIP' visiveis

```yaml
id: passo_01_validar_botoes_exportacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const pdf = buttons.find(b => /Baixar PDF/i.test(b.textContent || ''));
          const docx = buttons.find(b => /Baixar DOCX/i.test(b.textContent || ''));
          const zip = buttons.find(b => /Baixar Dossi[eê]/i.test(b.textContent || ''));
          return 'pdf=' + (!!pdf) + ' docx=' + (!!docx) + ' zip=' + (!!zip);
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-R06_visual_fp.yaml#passo_01_validar_botoes_exportacao"
```
