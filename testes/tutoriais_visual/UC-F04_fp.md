---
uc_id: UC-F04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F04_visual_fp.yaml
---

# UC-F04 — Buscar e revisar certidoes (Fluxo Principal)

> **PO:** A busca usa scrapers de portais publicos (Receita Federal, FGTS, etc.) — pode demorar 60-180s. Aguarde o painel "Progresso da Busca" terminar.
>
> **Cenario:** apos UC-F01 (empresa criada), navega para EmpresaPage > Card "Certidoes Automaticas". Click "Buscar Certidoes". POST /api/empresa-certidoes/buscar-stream inicia streaming. Aguardamos termino.
>
> **Pre-requisitos:** UC-F01 ja executado (empresa com CNPJ).

## Passo 00 — Setup: navegar para EmpresaPage e localizar Card Certidoes

```yaml
id: passo_00_setup_navegar_certidoes
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Empresa"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Dados da Empresa"), h2:has-text("Dados da Empresa")'
      timeout: 15000
    # Scroll ate o card
    - tipo: evaluate
      valor_literal: |
        () => {
          const titulos = [...document.querySelectorAll('.card-title, h3')];
          const card = titulos.find(el => /Certidoes Automaticas/i.test(el.textContent || ''));
          if (!card) throw new Error('Card Certidoes Automaticas nao encontrado');
          card.scrollIntoView({block: 'center'});
          return 'ok';
        }
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_00_setup_navegar_certidoes"
```

## Passo 01 — Click "Buscar Certidoes" e aguardar streaming

Click no botao "Buscar Certidoes". Painel "Progresso da Busca" abre. Streaming POST processa scrapers. Aguardamos ate 180s.

**Observe criticamente:**
- Botao muda para "Buscando..." com spinner
- Painel "Progresso da Busca" abre com progress bar e log de eventos
- Cada certidao processada aparece como linha no log (Receita Federal, FGTS, ISS Municipal, etc.)
- Pode demorar 60-180s
- Apos termino, botao volta para "Buscar Certidoes" e tabela mostra certidoes encontradas
- POST /api/empresa-certidoes/buscar-stream retorna 200

```yaml
id: passo_01_buscar_certidoes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Buscar Certidoes/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Buscar Certidoes nao encontrado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked';
        }
    - tipo: wait_for
      seletor: 'button:has-text("Buscando")'
      timeout: 10000
    # AGUARDA termino — ate 180s; volta a aparecer "Buscar Certidoes" sem "Buscando"
    - tipo: wait_for
      seletor: 'button:has-text("Buscar Certidoes"):not(:has-text("Buscando"))'
      timeout: 200000
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_01_buscar_certidoes"
```
