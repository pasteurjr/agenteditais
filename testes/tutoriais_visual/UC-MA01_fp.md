---
uc_id: UC-MA01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-MA01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-MA01_visual_fp.yaml
---

# UC-MA01 — Aplicar Mascara de Descricao a Produtos (Fluxo Principal)

> **Predecessores:** UC-CL02
> **Sprint:** 8 — Dispensas, Classes IA, Mascaras
> **Validacao screenshots:** cada passo captura before/after para auditoria visual contra os casos de teste

## Passo 00 — Garantir PortfolioPage com produtos

**Validar screenshot:**
- PortfolioPage com tabela de produtos

```yaml
id: passo_00_garantir_portfolio
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-MA01_visual_fp.yaml#passo_00_garantir_portfolio"
```

## Passo 01 — Validar acao "Aplicar Mascara"

Mascara padroniza descricao dos produtos (ex: '{Marca} {Modelo} - {Volume}').

**Validar screenshot:**
- Botao/acao 'Aplicar Mascara' OU 'Mascara' presente

```yaml
id: passo_01_validar_acao_mascara
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Aplicar Mascara|^Mascara/i.test(b.textContent||''));
          return btn ? 'acao_presente' : 'acao_via_outro_caminho';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-MA01_visual_fp.yaml#passo_01_validar_acao_mascara"
```
