---
uc_id: UC-R05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R05_visual_fp.yaml
---

# UC-R05 — Auditoria Documental + Smart Split (Fluxo Principal)

> **Predecessores:** UC-R01, UC-F03
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Garantir proposta selecionada

Mantém proposta.

**Observe criticamente:**
- Card 'Auditoria Documental' presente

```yaml
id: passo_00_proposta_selecionada
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-R05_visual_fp.yaml#passo_00_proposta_selecionada"
```

## Passo 01 — Click "Verificar Documentos" — chama GET /doc-audit

Backend lista documentos da empresa e marca presente/ausente/vencido.

**Observe criticamente:**
- Botao 'Verificar Documentos' habilitado
- Tabela aparece com Status por documento
- Se algum >25MB, botao 'Fracionar' aparece

```yaml
id: passo_01_verificar_documentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Verificar Documentos/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 10000
validacao_ref: "testes/casos_de_teste/UC-R05_visual_fp.yaml#passo_01_verificar_documentos"
```
