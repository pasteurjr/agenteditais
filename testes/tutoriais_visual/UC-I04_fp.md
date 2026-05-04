---
uc_id: UC-I04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I04_visual_fp.yaml
---

# UC-I04 — Upload de Peticao Externa (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Garantir tab Peticoes

Permanece na tab Peticoes.

**Observe criticamente:**
- Botao 'Upload Peticao' visivel

```yaml
id: passo_00_aba_peticoes
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-I04_visual_fp.yaml#passo_00_aba_peticoes"
```

## Passo 01 — Validar presenca botao "Upload Peticao"

Botao abre modal pra upload de .docx/.pdf.

**Observe criticamente:**
- Botao 'Upload Peticao' presente
- (Upload real exige arquivo, fora de escopo deste teste)

```yaml
id: passo_01_validar_botao_upload
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Upload Peti[cç][aã]o/i.test(b.textContent || ''));
          return btn ? 'presente' : 'ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-I04_visual_fp.yaml#passo_01_validar_botao_upload"
```
