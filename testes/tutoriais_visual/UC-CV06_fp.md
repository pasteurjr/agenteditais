---
uc_id: UC-CV06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV06_visual_fp.yaml
---

# UC-CV06 — Gerir monitoramentos automaticos (Fluxo Principal)

> **Cenario:** scroll ate o card "Monitoramentos" -> click "Novo Monitoramento" -> preenche termo -> click "Criar". Backend cria registro em monitoramentos via crudCreate.

## Passo 00 — Setup: confirmar CaptacaoPage + scroll Monitoramentos

```yaml
id: passo_00_setup_navegar_monitoramentos
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Monitoramento/i.test(el.textContent || ''));
          if (card) card.scrollIntoView({block: 'center'});
          return 'ok';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_00_setup_navegar_monitoramentos"
```

## Passo 01 — Click "Novo Monitoramento"

Click no botao do header do card. Form inline aparece.

```yaml
id: passo_01_abrir_form_novo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Novo Monitoramento/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Novo Monitoramento nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'div.form-field:has(.form-field-label:has-text("Termo de busca")) input.text-input'
      timeout: 5000
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_01_abrir_form_novo"
```

## Passo 02 — Preencher termo + Criar

Preenche o termo e clica "Criar". Backend cria via POST /api/crud/monitoramentos.

**Observe criticamente:**
- Campo "Termo de busca" recebe o valor
- Apos click "Criar", request POST /api/crud/monitoramentos retorna 201
- Form fecha, lista de monitoramentos atualiza

```yaml
id: passo_02_criar_monitoramento
acao:
  sequencia:
    - tipo: fill
      seletor: 'div.form-field:has(.form-field-label:has-text("Termo de busca")) input.text-input'
      valor_from_dataset: "monitor_termo"
      timeout: 5000
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          // Procura o "Criar" do form (nao o botao "Novo Monitoramento" do header)
          const btn = buttons.reverse().find(b => b.textContent.trim() === 'Criar');
          if (!btn) throw new Error('Botao Criar nao encontrado');
          btn.click();
          return 'clicked';
        }
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_02_criar_monitoramento"
```
