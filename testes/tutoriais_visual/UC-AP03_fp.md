---
uc_id: UC-AP03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-AP03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-AP03_visual_fp.yaml
---

# UC-AP03 — Padroes Detectados pela IA (Fluxo Principal)

> **Predecessores:** UC-AP01
> **Sprint:** 7 — Mercado, Analytics, Aprendizado
> **Validacao screenshots:** cada passo captura 2 imagens (before/after) para auditoria visual contra os casos de teste

## Passo 00 — Localizar aba/secao "Padroes"

**COMPORTAMENTO IA**: identifica padroes recorrentes (orgaos que mais perdemos, motivos comuns, sazonalidade).

**Validar screenshot:** Lista de padroes textuais ou graficos

```yaml
id: passo_00_aba_padroes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Padr/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-AP03_visual_fp.yaml#passo_00_aba_padroes"
```
