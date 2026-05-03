---
uc_id: UC-P01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-P01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-P01_visual_fp.yaml
---

# UC-P01 — Organizar Edital por Lotes (Fluxo Principal)

> **Predecessores:** UC-CV03, UC-CV09 — herda da Sprint 2
> **Sprint:** 3 — Precificacao e Proposta

## Passo 00 — Setup: navegar para Fluxo Comercial > Precificacao

Sidebar expande Fluxo Comercial -> click Precificacao. Page carrega com cabecalho Precificacao.

**Observe criticamente:**
- Sidebar com Fluxo Comercial expandida
- PrecificacaoPage carrega com cabecalho Precificacao
- Card 'Edital' visivel com Select 'Selecione o edital'

```yaml
id: passo_00_navegar_precificacao
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Fluxo Comercial/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Fluxo Comercial nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Precificacao"))'
      timeout: 5000
    - tipo: wait_for
      seletor: 'h1:has-text("Precifica"), h2:has-text("Precifica"), .page-header h1, .page-header h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_00_navegar_precificacao"
```

## Passo 01 — Selecionar edital salvo no Select "Selecione o edital"

Abre o Select 'Selecione o edital' e escolhe o primeiro edital disponivel (herdado da Sprint 2 Lote B = edital de maior score).

**Observe criticamente:**
- Select 'Selecione o edital' tem opcoes (oriundas de UC-CV03)
- Apos selecao, tabs Lotes/Custos e Precos/Lances/Estrategia/Historico aparecem
- Aba 'Lotes' ativa por default

```yaml
id: passo_01_selecionar_edital
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fields = [...document.querySelectorAll('div.form-field')];
          const f = fields.find(x => /Selecione o edital/i.test(x.querySelector('.form-field-label')?.textContent.trim() || ''));
          if (!f) throw new Error('campo Selecione o edital nao encontrado');
          const sel = f.querySelector('select');
          if (!sel) throw new Error('select de edital nao encontrado');
          const opts = [...sel.options].filter(o => o.value);
          if (!opts.length) throw new Error('Sem editais disponiveis');
          sel.value = opts[0].value;
          sel.dispatchEvent(new Event('change', {bubbles: true}));
          return 'edital=' + opts[0].textContent.trim();
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_01_selecionar_edital"
```

## Passo 02 — Criar Lotes (se nenhum existir) ou validar lotes herdados

Se botao 'Criar Lotes' habilitado e nao ha lotes ainda, clica. Se ja ha lotes da Sprint 2 (UC-CV09), valida que cards de lote aparecem na aba Lotes.

**Observe criticamente:**
- Cards de Lote 1, Lote 2, etc visiveis
- Cada card tem secao Parametros Tecnicos com Especialidade, Volume, Tipo de Amostra, etc

```yaml
id: passo_02_criar_lotes_se_necessario
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Tenta clicar Criar Lotes se habilitado
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /Criar Lotes/i.test(b.textContent || ''));
          if (btn && !btn.disabled) {
            btn.scrollIntoView({block: 'center'});
            btn.click();
            return 'clicou Criar Lotes';
          }
          return 'lotes ja existentes ou botao desabilitado';
        }
    - tipo: wait
      valor_literal: 3000
validacao_ref: "testes/casos_de_teste/UC-P01_visual_fp.yaml#passo_02_criar_lotes_se_necessario"
```
