---
uc_id: UC-P02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P02_visual_fp.yaml
---

# UC-P02 — Selecao Inteligente de Portfolio (Agente Assistido) (Fluxo Principal)

> **Predecessores:** UC-P01
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Setup: estar em PrecificacaoPage com edital selecionado e tab Lotes ativa

Garante que estamos em Precificacao com edital ja selecionado (P01 fez isso) e na aba Lotes.

**Observe criticamente:**
- Cabecalho Precificacao
- Tabs visiveis, Lotes ativa

```yaml
id: passo_00_setup_precificacao
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica")'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_00_setup_precificacao"
```

## Passo 01 — Click no botao "IA" pra vincular item ao produto via IA

Localiza o primeiro botao 'IA' na coluna Acoes da Tabela Itens do Lote e clica. Backend chama POST /api/precificacao/vincular-ia/{item_id} (DeepSeek processa).

**Observe criticamente:**
- Botao 'IA' presente na coluna Acoes
- Apos click, aparece resposta IA com sugestao de vinculo + score
- Tempo de resposta: 30-180s (DeepSeek)

```yaml
id: passo_01_vincular_via_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => {
            const t = (b.textContent || '').trim();
            return t === 'IA' || /^IA$/i.test(t);
          });
          if (!btn) {
            // Pode nao ter itens nao vinculados (ja todos vinculados)
            return 'sem_itens_para_vincular';
          }
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicou IA';
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-P02_visual_fp.yaml#passo_01_vincular_via_ia"
```
