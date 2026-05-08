---
uc_id: UC-ARN-13
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-13_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml
---

# UC-ARN-13 — Upload em massa documentos IA (Fluxo Principal)

> **Origem da observação:** F03-02
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

UploadLoteIA contexto=documentos em EmpresaPage.

## EmpresaPage

> **Validando observação Arnaldo F03-02** — Upload em massa documentos IA

Tester abre EmpresaPage onde upload em massa de documentos esta plugado.

**Dados/pré-condições:**
- EmpresaPage com componente UploadLoteIA contexto=documentos plugado

**Observe criticamente:**
- EmpresaPage abre com dados Bio-Hosp

```yaml
id: passo_00_navegar_empresa
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const sec = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Configura/i.test(b.textContent || ''));\n  if (!sec) throw new\
    \ Error('Secao \"Configura\" nao achada');\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  if (!sec.classList.contains('expanded'))\
    \ { sec.click(); await new Promise(r=>setTimeout(r,400)); }\n  const it = [...document.querySelectorAll('button.nav-item')]\n\
    \    .find(el => /^\\s*Empresa\\s*$/i.test(el.querySelector('.nav-item-label')?.textContent?.trim()\
    \ || ''));\n  if (!it) throw new Error('Item \"Empresa\" nao achado em \"Configura\"\
    ');\n  it.click();\n  await new Promise(r => setTimeout(r, 1500));\n  return 'navegou_2niveis_Configura_Empresa';\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml#passo_00_navegar_empresa
```


## Componente UploadLoteIA documentos plugado em EmpresaPage

> **Validando observação Arnaldo F03-02** — Upload em massa documentos IA

Confirma F03-02: componente UploadLoteIA contexto=documentos renderiza em EmpresaPage.

**Observe criticamente:**
- Componente UploadLoteIA documentos plugado em EmpresaPage
- Heading mencionando 'Upload em Massa' ou 'IA classifica' visivel

```yaml
id: passo_01_validar_upload_lote
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F03-02: heading \"Cadastro Automático de Documentos\
    \ por IA\" deve estar em EmpresaPage\n  const txt = document.body.innerText;\n\
    \  const heading = /Cadastro Autom[áa]tico de Documentos por IA|Upload em Massa.*IA\
    \ classifica cada documento/i.test(txt);\n  if (!heading) throw new Error('UploadLoteIA\
    \ documentos NAO renderiza em EmpresaPage — F03-02 nao plugado');\n  return `F03-02_OK\
    \ heading_documentos_renderiza`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-13_visual_fp.yaml#passo_01_validar_upload_lote
```
