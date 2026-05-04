---
uc_id: UC-SM01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-SM01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-SM01_visual_fp.yaml
---

# UC-SM01 — Configurar Servidor SMTP (Fluxo Principal)

> **Predecessores:** [login][admin]
> **Sprint:** 6 — Alertas, Monitoramentos, Auditoria, SMTP

## Passo 00 — Setup: navegar Governanca > SMTP

Sidebar -> Governanca -> SMTP. SMTPPage carrega (so admin).

**Observe criticamente:**
- SMTPPage com formulario de configuracao
- Campos: host, porta, usuario, senha, TLS

```yaml
id: passo_00_navegar_smtp
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const fc = [...document.querySelectorAll('button.nav-section-header')]
            .find(b => /Governanca/i.test(b.querySelector('.nav-section-label')?.textContent.trim() || ''));
          if (!fc) throw new Error('secao Governanca nao encontrada');
          if (!fc.classList.contains('expanded')) fc.click();
          return 'ok';
        }
    - tipo: wait_for
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("SMTP"))'
      timeout: 10000
    - tipo: click
      seletor: 'button.nav-item:not(.nav-section-header):not(.nav-subsection-header):has(.nav-item-label:text-is("SMTP"))'
      timeout: 5000
    - tipo: wait_for
      seletor: '.page-header h1, .page-header h2, h1, h2'
      timeout: 15000
validacao_ref: "testes/casos_de_teste/UC-SM01_visual_fp.yaml#passo_00_navegar_smtp"
```

## Passo 01 — Validar formulario SMTP + botao "Salvar"

**Observe criticamente:**
- Inputs: host, port, user, password
- Botao Salvar/Testar

```yaml
id: passo_01_validar_form
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Salvar|Testar/i.test(b.textContent||''));
          return btn ? 'form_presente' : 'form_ausente';
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-SM01_visual_fp.yaml#passo_01_validar_form"
```
