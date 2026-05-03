---
uc_id: UC-R04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R04_visual_fp.yaml
---

# UC-R04 — Auditoria ANVISA (Semaforo Regulatorio) (Fluxo Principal)

> **Predecessores:** UC-R01 OU UC-R02
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Garantir proposta selecionada

Mantém a proposta selecionada do passo R03.

**Observe criticamente:**
- Card 'Proposta Selecionada' visivel
- Card 'Auditoria ANVISA' presente

```yaml
id: passo_00_proposta_selecionada
acao:
  sequencia:
    - tipo: wait
      valor_literal: 1000
validacao_ref: "testes/casos_de_teste/UC-R04_visual_fp.yaml#passo_00_proposta_selecionada"
```

## Passo 01 — Click "Verificar Registros" — chama GET /anvisa-audit

Backend consulta registros ANVISA do produto.

**Observe criticamente:**
- Botao 'Verificar Registros' habilitado
- Apos click, tabela 'ANVISA Records' aparece com Status (Valido/Vencido/Proximo Venc.)

```yaml
id: passo_01_verificar_registros_anvisa
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Verificar Registros/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 15000
validacao_ref: "testes/casos_de_teste/UC-R04_visual_fp.yaml#passo_01_verificar_registros_anvisa"
```
