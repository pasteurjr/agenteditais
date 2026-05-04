---
uc_id: UC-RE03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE03_visual_fp.yaml
---

# UC-RE03 — Chatbox de Analise (Fluxo Principal)

> **Predecessores:** UC-RE02
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Permanecer em tab Analise (apos RE02)

Chatbox aparece apos analise de RE02.

**Observe criticamente:**
- Campo de chat na parte inferior
- Botao Enviar

```yaml
id: passo_00_garantir_aba_analise
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-RE03_visual_fp.yaml#passo_00_garantir_aba_analise"
```

## Passo 01 — Validar campo de chat e botao Enviar

Chat permite perguntas adicionais sobre a analise.

**Observe criticamente:**
- Input de chat presente
- Botao 'Enviar' visivel

```yaml
id: passo_01_validar_chat
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^Enviar$/i.test((b.textContent||'').trim()));
          return btn ? 'chat_presente' : 'chat_ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-RE03_visual_fp.yaml#passo_01_validar_chat"
```
