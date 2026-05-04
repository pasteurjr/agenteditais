---
uc_id: UC-RE02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE02_visual_fp.yaml
---

# UC-RE02 — Analisar Proposta Vencedora (IA) (Fluxo Principal)

> **Predecessores:** UC-CV03
> **Sprint:** 4 — Recursos e Impugnacoes

## Passo 00 — Click na tab "Analise"

Abre tab Analise com campo de texto pra colar proposta vencedora.

**Observe criticamente:**
- Tab Analise destacada
- Campo TextArea 'Texto da Proposta Vencedora'

```yaml
id: passo_00_aba_analise
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /^An[aá]lise/i.test((b.textContent||'').trim()));
          if (!btn) return 'sem_aba';
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-RE02_visual_fp.yaml#passo_00_aba_analise"
```

## Passo 01 — Preencher texto da proposta + click "Analisar Proposta Vencedora"

Cola um texto-stub da proposta concorrente. IA processa.

**Observe criticamente:**
- Campo aceita texto
- POST /api/recursos/analisar-vencedora chama DeepSeek
- **COMPORTAMENTO IA**: identifica vulnerabilidades na proposta vencedora (specs em desacordo com edital, precos abaixo do exequivel, certidoes vencidas)

```yaml
id: passo_01_preencher_e_analisar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Selecionar edital primeiro (se nao selecionado ainda)
          const fields = [...document.querySelectorAll('div.form-field')];
          const fSel = fields.find(x => /Selecione o Edital/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (fSel) {
            const sel = fSel.querySelector('select');
            if (sel) {
              const opts = [...sel.options].filter(o => o.value);
              if (opts.length) {
                sel.value = opts[0].value;
                sel.dispatchEvent(new Event('change', {bubbles: true}));
              }
            }
          }
          // Preencher texto
          const ta = document.querySelector('textarea');
          if (ta) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            setter.call(ta, 'Empresa Concorrente XYZ Ltda. Proposta de R$ 95,00 por unidade. Prazo de entrega 30 dias. Certidoes ANVISA datadas de 2024.');
            ta.dispatchEvent(new Event('input', {bubbles: true}));
            ta.dispatchEvent(new Event('change', {bubbles: true}));
          }
          // Click Analisar
          const btn = [...document.querySelectorAll('button')].find(b => /Analisar Proposta Vencedora/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicado';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-RE02_visual_fp.yaml#passo_01_preencher_e_analisar"
```
