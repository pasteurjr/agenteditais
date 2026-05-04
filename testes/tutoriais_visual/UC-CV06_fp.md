---
uc_id: UC-CV06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV06_visual_fp.yaml
---

# UC-CV06 — Criar monitoramento automatico de busca (PNCP recorrente) (Fluxo Principal)

> **Predecessores:** [infra]
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Scroll ate Card 'Monitoramentos Salvos' / 'Configure via chat'

Card no fim da CaptacaoPage.

```yaml
id: passo_00_scroll_monitoramentos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('h3, h4, .card-title')];
          const card = titulos.find(el => /Monitoramento|Buscar Dispensas/i.test(el.textContent || ''));
          if (!card) return 'sem_card_monitoramento';
          card.scrollIntoView({block: 'center'});
          return 'scrolled';
        }
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_00_scroll_monitoramentos"
```

## Passo 01 — Click 'Novo Monitoramento' OU campo de chat

Pode ser modal direto OU chat AI ('Monitore editais X no PNCP').

```yaml
id: passo_01_clicar_novo_monitoramento
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Novo Monitoramento|Criar Monitoramento/i.test(b.textContent || ''));
          if (btn) {
            btn.scrollIntoView({block: 'center'});
            btn.click();
            return 'clicked_novo_monitoramento';
          }
          return 'criacao_via_chat (sem botao dedicado)';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_01_clicar_novo_monitoramento"
```

## Passo 02 — Preencher termo do monitoramento = 'monitor multiparametrico' e Criar

**EFEITO REAL:** se modal abre, preenche e salva. Se chat, manda mensagem.
POST /api/crud/monitoramentos retorna 200/201.

```yaml
id: passo_02_preencher_termo_monitoramento
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Tenta modal primeiro
          const fields = [...document.querySelectorAll('div.form-field, .modal div.form-field')];
          const f_termo = fields.find(x => /Termo|Palavra-chave/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (f_termo) {
            const inp = f_termo.querySelector('input');
            if (inp) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, 'monitor multiparametrico');
              inp.dispatchEvent(new Event('input', {bubbles: true}));
            }
          }
          // Click Criar / Salvar
          const btn = [...document.querySelectorAll('button')].find(b => /^Criar$|^Salvar$|Criar Monitoramento/i.test((b.textContent||'').trim()));
          if (btn) { btn.click(); return 'clicked_criar'; }
          return 'sem_botao_criar';
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-CV06_visual_fp.yaml#passo_02_preencher_termo_monitoramento"
```
