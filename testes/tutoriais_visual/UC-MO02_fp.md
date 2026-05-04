---
uc_id: UC-MO02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MO02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MO02_visual_fp.yaml
---

# UC-MO02 — Criar Monitoramento PNCP via IA (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Garantir MonitoriaPage carregada

**Observe criticamente:**
- Botao 'Novo Monitoramento' OU chat para criar via IA

```yaml
id: passo_00_garantir_monitoria
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-MO02_visual_fp.yaml#passo_00_garantir_monitoria"
```

## Passo 01 — Validar fluxo de criacao via IA

**COMPORTAMENTO IA**: chat aceita 'Monitore editais de monitor multiparametrico no PNCP' e cria monitoramento estruturado.

**Observe criticamente:**
- Botao Novo Monitoramento OU chat input

```yaml
id: passo_01_validar_criacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Novo Monitoramento|Criar Monitoramento/i.test(b.textContent||''));
          return btn ? 'botao_presente' : 'sem_botao (chat IA)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-MO02_visual_fp.yaml#passo_01_validar_criacao"
```
