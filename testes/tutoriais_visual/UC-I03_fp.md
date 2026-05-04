---
uc_id: UC-I03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I03_visual_fp.yaml
---

# UC-I03 — Gerar Peticao de Impugnacao (Fluxo Principal)

> **Predecessores:** UC-I02
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Click na tab "Peticoes"

Abre tab Peticoes com lista existente + botoes Nova/Upload.

**Observe criticamente:**
- Tab Peticoes destacada
- Botoes 'Nova Peticao' e 'Upload Peticao' visiveis

```yaml
id: passo_00_navegar_peticoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^Peti[cç][oõ]es/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-I03_visual_fp.yaml#passo_00_navegar_peticoes"
```

## Passo 01 — Localizar botao "Gerar Peticao" (motor IA)

Botao gera peticao via IA com base nos findings da analise legal.

**Observe criticamente:**
- Botao 'Gerar Peticao' presente em algum lugar (inline ou modal)
- **COMPORTAMENTO IA**: gera texto juridico estruturado citando RNs do edital

```yaml
id: passo_01_validar_botao_gerar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Gerar Peti[cç][aã]o/i.test(b.textContent || ''));
          return btn ? 'botao_presente' : 'sem_botao (depende de I02)';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-I03_visual_fp.yaml#passo_01_validar_botao_gerar"
```
