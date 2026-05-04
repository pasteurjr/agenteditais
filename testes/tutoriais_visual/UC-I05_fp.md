---
uc_id: UC-I05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I05_visual_fp.yaml
---

# UC-I05 — Controle de Prazo (impugnacao/esclarecimento) (Fluxo Principal)

> **Predecessores:** UC-CV03 + UC-I03 OU UC-I04
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Click na tab "Prazos"

Abre tab Prazos com tabela de deadlines.

**Observe criticamente:**
- Tab Prazos destacada
- Tabela com prazos da impugnacao

```yaml
id: passo_00_aba_prazos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^Prazos/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-I05_visual_fp.yaml#passo_00_aba_prazos"
```

## Passo 01 — Validar tabela de prazos visivel

Tabela mostra deadlines com dias restantes.

**Observe criticamente:**
- Tabela de prazos visivel
- Pode estar vazia se nao ha peticao ainda (FE valido)

```yaml
id: passo_01_validar_tabela_prazos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-I05_visual_fp.yaml#passo_01_validar_tabela_prazos"
```
