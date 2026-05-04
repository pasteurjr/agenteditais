---
uc_id: UC-CT06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT06_visual_fp.yaml
---

# UC-CT06 — Saldo de ARP / Controle de Carona (Fluxo Principal)

> **Predecessores:** UC-CT01
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Validar funcionalidade de saldo ARP/carona

Saldo de ARP fica em AtasPage tab Saldo ARP, mas carona (uso por outros orgaos) pode ter na Producao.

**Observe criticamente:**
- Acesso a controle de saldo (em Atas ou Producao)

```yaml
id: passo_00_validar_carona
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-CT06_visual_fp.yaml#passo_00_validar_carona"
```
