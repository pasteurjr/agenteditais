---
uc_id: UC-ARN-06
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-06_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-06_visual_fp.yaml
---

# UC-ARN-06 — Documentos vem do upload IA do cadastro (Fluxo Principal)

> **Origem da observação:** F01-06
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Apos UploadLoteIA contexto=cadastro_empresa, valida que documentos
classificados aparecem em empresa-documentos. Confirma com data-testid.


## UploadLoteIA contexto=documentos visivel na EmpresaPage

> **Validando observação Arnaldo F01-06** — Documentos vem do upload IA do cadastro

Tester navega para EmpresaPage onde upload em lote de documentos aparece.

**Dados/pré-condições:**
- EmpresaPage com componente UploadLoteIA contexto=documentos plugado (linha 1255 EmpresaPage.tsx)

**Observe criticamente:**
- EmpresaPage abre normalmente
- Tela rolavel mostra secao de documentos no meio/fim da pagina

```yaml
id: passo_00_validar_componente_upload_documentos
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
validacao_ref: testes/casos_de_teste/UC-ARN-06_visual_fp.yaml#passo_00_validar_componente_upload_documentos
```


## Confirma componente UploadLoteIA com texto real do componente

> **Validando observação Arnaldo F01-06** — Documentos vem do upload IA do cadastro

Confirma F01-06: componente UploadLoteIA contexto=documentos plugado e renderizando na EmpresaPage.

**Observe criticamente:**
- Componente 'Upload em Massa — IA classifica cada documento' aparece em algum lugar
- OU 'Cadastro Automatico' presente
- Componente tem botao de selecionar arquivos visivel

```yaml
id: passo_01_validar_componente_renderiza
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F01-06: heading especifico do componente UploadLoteIA\
    \ contexto=documentos\n  const txt = document.body.innerText;\n  const heading\
    \ = /Cadastro Autom[áa]tico de Documentos por IA|Upload em Massa.*IA classifica\
    \ cada documento/i.test(txt);\n  if (!heading) throw new Error('F01-06: heading\
    \ documentos NAO renderiza em EmpresaPage');\n  // Confirma componente tem dropzone\
    \ (texto OU input[type=file])\n  const tem_drop = /Arraste|arraste|Solte|solte|drag|drop/i.test(txt);\n\
    \  const tem_input_file = !!document.querySelector('input[type=\"file\"]');\n\
    \  if (!tem_drop && !tem_input_file) throw new Error('F01-06 heading OK mas SEM\
    \ dropzone E SEM input[type=file]');\n  return `F01-06_OK heading=true drop_text=${tem_drop}\
    \ input_file=${tem_input_file}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-06_visual_fp.yaml#passo_01_validar_componente_renderiza
```
