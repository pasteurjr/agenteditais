---
uc_id: UC-CV09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV09_visual_fp.yaml
---

# UC-CV09 — Importar itens e extrair lotes via IA (Fluxo Principal)

> **PO:** DeepSeek processa PDF do edital — pode demorar 30-180s.
>
> **Cenario:** apos CV07 selecionar edital, clica aba "Lotes", click "Extrair Lotes via IA". Backend baixa PDF + extrai estrutura via IA + cria registros em editais_lotes.
>
> **Pre-requisitos:** CV07.

## Passo 00 — Confirmar edital selecionado

```yaml
id: passo_00_confirmar_selecionado
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Validacao")'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const tab = [...document.querySelectorAll('button')].find(b => /Aderencia|Lotes|Documentos|Riscos|Mercado/i.test(b.textContent || ''));
          if (tab) return 'edital ja selecionado';
          const tr = document.querySelector('table tbody tr');
          if (!tr) throw new Error('Nem tabs nem linhas');
          tr.click();
          return 'selecionou primeiro';
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_00_confirmar_selecionado"
```

## Passo 01 — Click aba "Lotes"

```yaml
id: passo_01_abrir_aba_lotes
acao:
  sequencia:
    # Garante que estamos na ValidacaoPage com edital aberto (tabs visiveis)
    - tipo: wait_for
      seletor: 'button.tab-panel-tab, button[class*="tab"]'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          // Procura o botao de aba "Lotes (N)" — pode estar em button.tab-panel-tab ou similar
          const all = [...document.querySelectorAll('button')];
          const btn = all.find(b => {
            const t = (b.textContent || '').trim();
            return /^Lotes(\s*\(\d+\))?$/i.test(t);
          });
          if (!btn) {
            // Lista botoes pra debug
            const labels = all.map(b => (b.textContent||'').trim().slice(0,30)).filter(t => t).slice(0, 30);
            throw new Error('Aba Lotes nao encontrada. Botoes: ' + labels.join('|'));
          }
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked: ' + btn.textContent.trim();
        }
    # Aguarda render da aba Lotes (botao "Extrair Lotes via IA" aparece)
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_01_abrir_aba_lotes"
```

## Passo 01b — Importar itens do PNCP se necessario

Antes de extrair lotes, edital salvo precisa ter **itens importados**. Se aparece o botao "Buscar Itens no PNCP", clica e aguarda. Se ja tem itens, pula.

```yaml
id: passo_01b_importar_itens_pncp
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          // So clica se aparece o botao (significa que itens estao zerados)
          const btn = buttons.find(b => /Buscar Itens no PNCP|Buscando\.\.\./i.test(b.textContent || ''));
          if (!btn) return 'ja_tem_itens';
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    # Aguarda PNCP responder (~30-60s)
    - tipo: wait
      valor_literal: 60000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_01b_importar_itens_pncp"
```

## Passo 02 — Click "Extrair Lotes via IA" (ou "Reprocessar" se ja ha lotes)

POST /api/editais/<id>/lotes/extrair com timeout 240s.

**Observe criticamente:**
- Botao "Extrair Lotes via IA" (lotes==0 + itens>0) OU "Reprocessar" (lotes>0)
- Backend retorna 200/201/400

```yaml
id: passo_02_extrair_lotes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Extrair Lotes via IA|Extraindo|Reprocessar|Reprocessando/i.test(b.textContent || ''));
          if (!btn) {
            // Pode ser cenario "Importe os itens do PNCP primeiro" — entao aceita sem clicar
            const msg = document.body.textContent || '';
            if (/Importe os itens do PNCP/i.test(msg)) {
              return 'sem_itens_importados';
            }
            throw new Error('Botao Extrair Lotes / Reprocessar nao encontrado');
          }
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked: ' + btn.textContent.trim();
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_02_extrair_lotes"
```
