---
uc_id: UC-CRM03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CRM03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CRM03_visual_fp.yaml
---

# UC-CRM03 — Mapa Geografico de Processos (Leaflet/OSM) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Click na tab "Mapa"

Tab Mapa carrega Leaflet/OpenStreetMap interativo.

**Observe criticamente:**
- Tab Mapa destacada
- Mapa renderiza (pode demorar 2-3s)

```yaml
id: passo_00_aba_mapa
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Mapa/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CRM03_visual_fp.yaml#passo_00_aba_mapa"
```

## Passo 01 — Validar renderizacao do mapa

Mapa OSM com circulos por UF.

**Observe criticamente:**
- Container do mapa visivel
- Titulo 'Distribuicao Geografica' OU canvas/svg do leaflet

```yaml
id: passo_01_validar_mapa
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const map = document.querySelector('.leaflet-container, [class*="leaflet"], [class*="map"]');
          return map ? 'mapa_renderizado' : 'mapa_nao_renderizado';
        }
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-CRM03_visual_fp.yaml#passo_01_validar_mapa"
```
