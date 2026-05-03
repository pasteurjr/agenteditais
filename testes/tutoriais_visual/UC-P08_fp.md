---
uc_id: UC-P08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P08_visual_fp.yaml
---

# UC-P08 — Definir Estrategia Competitiva (Fluxo Principal)

> **Predecessores:** UC-P07
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Localizar Card "Estrategia Competitiva" na aba Lances

Apos salvar lances, card aparece abaixo.

**Observe criticamente:**
- Card 'Estrategia Competitiva' visivel
- Radios 'QUERO GANHAR' e 'NAO GANHEI NO MINIMO'

```yaml
id: passo_00_localizar_card
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P08_visual_fp.yaml#passo_00_localizar_card"
```

## Passo 01 — Selecionar Radio "QUERO GANHAR"

Marca o radio QUERO GANHAR (perfil agressivo — desce ate o minimo se necessario).

**Observe criticamente:**
- Radio 'QUERO GANHAR' selecionado
- Hint/explicacao do perfil exibida

```yaml
id: passo_01_selecionar_perfil_quero_ganhar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const radios = [...document.querySelectorAll('input[type="radio"]')];
          const r = radios.find(x => /QUERO GANHAR/i.test((x.closest('label')?.textContent || '').trim()));
          if (!r) return 'sem_radio_quero_ganhar';
          r.click();
          return 'selecionado';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-P08_visual_fp.yaml#passo_01_selecionar_perfil_quero_ganhar"
```

## Passo 02 — Click "Analise de Lances" (gerar simulacoes)

Backend gera cenarios de simulacao com base nos lances + perfil. POST /api/precificacao/{editalId}/estrategia ou similar.

**Observe criticamente:**
- Botao 'Analise de Lances' habilitado
- Apos click, secao 'Simulacoes (N cenarios)' aparece
- Cards de cenario mostram valor + margem sugerida

```yaml
id: passo_02_analisar_lances
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /An[aá]lise de Lances|Analise de Lances/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_analise';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 60000
validacao_ref: "testes/casos_de_teste/UC-P08_visual_fp.yaml#passo_02_analisar_lances"
```
