---
uc_id: UC-P09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P09_visual_fp.yaml
---

# UC-P09 — Consultar Historico de Precos (Fluxo Principal)

> **Predecessores:** UC-F06 — fallback se nao tem F06, ainda funciona
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Click na aba "Historico"

Abre tab Historico.

**Observe criticamente:**
- Tab Historico destacada
- Card 'Consultar Historico de Precos' aparece

```yaml
id: passo_00_abrir_historico
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Hist[oó]rico/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba_historico';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-P09_visual_fp.yaml#passo_00_abrir_historico"
```

## Passo 01 — Preencher Produto/Termo = "monitor" e Filtrar

Preenche campo + click Filtrar. Backend busca em preco_historico + PNCP.

**Observe criticamente:**
- Campo 'Produto/Termo' aceita 'monitor'
- Apos Filtrar, Card Estatisticas mostra Preco Medio/Min/Max
- Tabela Resultados lista historico

```yaml
id: passo_01_filtrar_historico
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Produto\/Termo|Termo/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (f) {
            const inp = f.querySelector('input');
            if (inp) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, 'monitor');
              inp.dispatchEvent(new Event('input', {bubbles: true}));
              inp.dispatchEvent(new Event('change', {bubbles: true}));
            }
          }
          // Click Filtrar
          const btn = [...document.querySelectorAll('button')].find(b => /^Filtrar$/i.test((b.textContent||'').trim()));
          if (btn) { btn.click(); return 'clicou Filtrar'; }
          return 'preencheu termo (sem botao Filtrar)';
        }
    - tipo: wait
      valor_literal: 30000
validacao_ref: "testes/casos_de_teste/UC-P09_visual_fp.yaml#passo_01_filtrar_historico"
```
