---
uc_id: UC-ARN-01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml
---

# UC-ARN-01 — Cadastro de empresa via upload IA + aceite humano (Fluxo Principal)

> **Origem da observação:** F01-01
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Valida o componente UploadLoteIA contexto=cadastro_empresa.
User loga, abre tela Empresa, faz upload de PDF do contrato social,
IA extrai dados, user revisa, marca aceite e salva.


## Login pasteur

```yaml
id: passo_00_login
acao:
  tipo: navegacao
  url: /login
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_00_login
```


## Sidebar > Configuracoes > Empresa

```yaml
id: passo_01_navegar_empresa
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const cfg = [...document.querySelectorAll('button.nav-section-header')]\n\
    \    .find(b => /Configuracoes|Configurações/i.test(b.textContent || ''));\n \
    \ if (!cfg) throw new Error('Configuracoes nao achado');\n  if (!cfg.classList.contains('expanded'))\
    \ cfg.click();\n  return 'ok';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_01_navegar_empresa
```


## Valida que UploadLoteIA aparece

```yaml
id: passo_02_validar_componente_upload_lote_ia
acao:
  tipo: evaluate
  valor_literal: "() => {\n  const titulo = document.body.innerText;\n  const tem\
    \ = /Cadastro Autom[áa]tico|Upload em Massa|Upload em Lote|UploadLoteIA/i.test(titulo);\n\
    \  if (!tem) throw new Error('Componente UploadLoteIA nao renderizado');\n  return\
    \ 'ok_componente_presente';\n}\n"
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_02_validar_componente_upload_lote_ia
```
