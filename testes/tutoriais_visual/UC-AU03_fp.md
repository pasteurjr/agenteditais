---
uc_id: UC-AU03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AU03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AU03_visual_fp.yaml
---

# UC-AU03 — Exportar Pacote de Compliance (Fluxo Principal)

> **Predecessores:** UC-AU01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Validar botao "Exportar Compliance" / "Exportar CSV"

Gera ZIP com log + evidencias para auditoria externa.

**Observe criticamente:**
- Botao 'Exportar' visivel

```yaml
id: passo_00_validar_botao_export
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Exportar/i.test(b.textContent||''));
          return btn ? 'export_presente' : 'export_ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-AU03_visual_fp.yaml#passo_00_validar_botao_export"
```
