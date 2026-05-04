---
uc_id: UC-FL02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FL02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FL02_visual_fp.yaml
---

# UC-FL02 — Criar Alerta via IA (chatbox) (Fluxo Principal)

> **Predecessores:** UC-FL01
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Garantir FlagsPage carregada

**Observe criticamente:**
- FlagsPage ativa
- Botao 'Novo Alerta' OU campo de chat para criar via IA

```yaml
id: passo_00_garantir_flags
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-FL02_visual_fp.yaml#passo_00_garantir_flags"
```

## Passo 01 — Validar botao "Novo Alerta" ou similar

**COMPORTAMENTO IA**: chatbox aceita descricao em linguagem natural e cria alerta estruturado.

**Observe criticamente:**
- Botao 'Novo Alerta' OU chat input presente

```yaml
id: passo_01_validar_botao_novo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Novo Alerta|Criar Alerta|Nova Flag/i.test(b.textContent||''));
          return btn ? 'botao_presente' : 'sem_botao_dedicado (criacao via chat)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-FL02_visual_fp.yaml#passo_01_validar_botao_novo"
```
