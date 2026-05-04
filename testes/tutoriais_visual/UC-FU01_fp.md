---
uc_id: UC-FU01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-FU01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-FU01_visual_fp.yaml
---

# UC-FU01 — Registrar Resultado (Vitoria/Derrota) (Fluxo Principal)

> **Predecessores:** UC-CV03 (edital salvo)
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Setup: navegar Fluxo Comercial > Followup

Sidebar -> click Followup. Page carrega com tab 'Resultados' default.

**Observe criticamente:**
- FollowupPage carrega
- Tabs: Resultados / Alertas
- StatCards no topo (Vitorias, Derrotas, Taxa de Sucesso, etc)

```yaml
id: passo_00_navegar_followup
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Followup"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Followup"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-FU01_visual_fp.yaml#passo_00_navegar_followup"
```

## Passo 01 — Validar tabela "Editais Pendentes"

Tabela mostra editais com proposta submetida aguardando resultado.

**Observe criticamente:**
- Tabela 'Editais Pendentes' visivel (pode estar vazia se nao ha proposta submetida — FE-01)
- Coluna 'Acao' com botao 'Registrar' por linha (se tabela tem dados)

```yaml
id: passo_01_validar_tabela_pendentes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '');
          const tem_pend = /Pendente|Resultado|Editais/i.test(txt);
          return tem_pend ? 'tabela_visivel' : 'sem_dados (FE-01)';
        }
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-FU01_visual_fp.yaml#passo_01_validar_tabela_pendentes"
```
