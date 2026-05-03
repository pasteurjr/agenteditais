---
uc_id: UC-P11
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P11_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P11_visual_fp.yaml
---

# UC-P11 — Pipeline IA de Precificacao (Banner Resumo + 5 cards A-E) (Fluxo Principal)

> **Predecessores:** UC-P02
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Voltar para aba "Custos e Precos" e selecionar vinculo

Pipeline IA fica na aba Custos e Precos, dentro do Card 'Precificacao Assistida por IA'.

**Observe criticamente:**
- Tab 'Custos e Precos' ativa
- Card 'Precificacao Assistida por IA' visivel (pode estar com loading)

```yaml
id: passo_00_voltar_aba_custos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Custos e Pre[cç]os/i.test(b.textContent || ''));
          if (btn) {
            btn.click();
            return 'clicked aba Custos';
          }
          return 'ja_na_aba';
        }
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-P11_visual_fp.yaml#passo_00_voltar_aba_custos"
```

## Passo 01 — Aguardar Banner Resumo + 5 cards A-E aparecerem (PNCP+IA)

Sistema chama GET /api/precificacao/{vinculoId}/insights — busca historico no PNCP + processa com IA. Pode demorar ate 2min.

**Observe criticamente:**
- Loading 'Buscando historico...' aparece
- **BANNER RESUMO** mostra contadores (registros, atas, **Min/Media/Max**, Ref. Edital)
- **5 CARDS DE RECOMENDACAO IA**: Custo (A), Preco Base (B), Referencia (C), Lance Inicial (D), Lance Minimo (E)
- Cada card tem valor + botao 'Usar ->'
- **PRECOS MIN/MAX SUGERIDOS PELA IA**: comparar com nossos R$ 115 (min P07) e R$ 140 (max P07) — IA pode sugerir faixa diferente baseada em historico real

```yaml
id: passo_01_aguardar_insights_ia
acao:
  sequencia:
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-P11_visual_fp.yaml#passo_01_aguardar_insights_ia"
```
