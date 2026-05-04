---
uc_id: UC-CT01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CT01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CT01_visual_fp.yaml
---

# UC-CT01 — Cadastrar Contrato (listar) (Fluxo Principal)

> **Predecessores:** [login]
> **Sprint:** 5 — Followup, Atas, Execucao, CR e CRM

## Passo 00 — Setup: navegar Fluxo Comercial > Execucao Contrato

Sidebar -> click Execucao Contrato. ProducaoPage carrega.

**Observe criticamente:**
- ProducaoPage carrega
- 9 tabs: Contratos, Entregas, Cronograma, Aditivos, Designacoes, Empenhos, Auditoria, Vencimentos, KPIs

```yaml
id: passo_00_navegar_producao
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
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Execucao Contrato"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("Execucao Contrato"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-CT01_visual_fp.yaml#passo_00_navegar_producao"
```

## Passo 01 — Validar tabela de contratos (default)

Tab Contratos default. Tabela com contratos cadastrados.

**Observe criticamente:**
- Tab Contratos ativa
- Tabela visivel

```yaml
id: passo_01_validar_tabela_contratos
acao:
  sequencia:
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-CT01_visual_fp.yaml#passo_01_validar_tabela_contratos"
```
