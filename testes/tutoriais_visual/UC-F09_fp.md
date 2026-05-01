---
uc_id: UC-F09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F09_visual_fp.yaml
---

# UC-F09 — Reprocessar especificacoes IA (Fluxo Principal)

> **PO:** acompanhe a execucao. A IA pode demorar 30-120s para responder. Aguarde o spinner do chat lateral desaparecer antes de aprovar.
>
> **Cenario:** apos UC-F07/F08, click no botao "Reprocessar IA" (icone RefreshCw) do produto na grade. Sistema abre o chat lateral e envia "Reprocesse as especificacoes do produto {nome}". Espera resposta da IA via POST /api/chat.
>
> **Pre-requisitos:** UC-F07 ou UC-F08 ja executado.

## Passo 00 — Setup: navegar para Portfolio

```yaml
id: passo_00_setup_navegar_portfolio
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const cfg = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => {
              const t = b.querySelector('.nav-section-label')?.textContent.trim();
              return t === 'Configuracoes' || t === 'Configurações';
            });
          if (!cfg) throw new Error('secao Configuracoes nao encontrada');
          if (!cfg.classList.contains('expanded')) cfg.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Portfolio"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'button.ptab.active:has-text("Meus Produtos")'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-F09_visual_fp.yaml#passo_00_setup_navegar_portfolio"
```

## Passo 01 — Acionar "Reprocessar IA" no primeiro produto

Click no botao Reprocessar IA. Chat lateral abre e envia mensagem ao DeepSeek. **Pode demorar 30-120s.**

**Observe criticamente:**
- Botao "Reprocessar IA" eh icone RefreshCw com title="Reprocessar IA"
- Chat lateral abre na direita
- Mensagem usuario: "Reprocesse as especificacoes do produto..."
- Resposta da IA aparece em mensagem do assistente (markdown) apos 30-120s
- POST /api/chat ou /api/chat-upload retorna 200

```yaml
id: passo_01_acionar_reprocessar
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button[title="Reprocessar IA"]')];
          if (!buttons.length) throw new Error('Nenhum botao Reprocessar IA');
          buttons[0].click();
          return 'clicked';
        }
    # Chat abre — verifica que algum painel/sidebar de chat aparece
    - tipo: wait
      valor_literal: 1500
    # AGUARDA resposta da IA — pode demorar ate 120s
    # Espera nova mensagem aparecer no chat (resposta do assistant)
    - tipo: wait
      valor_literal: 60000
validacao_ref: "testes/casos_de_teste/UC-F09_visual_fp.yaml#passo_01_acionar_reprocessar"
```
