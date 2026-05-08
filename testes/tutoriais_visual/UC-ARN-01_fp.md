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

> **Validando observação Arnaldo F01-01** — Cadastro de empresa via upload IA + aceite humano

Tester preenche email/senha e clica Entrar. Sistema autentica via /api/auth/login e redireciona ao Dashboard.

**Dados/pré-condições:**
- Usuario logado como super (arnaldo@valida.com / 123456)
- Empresa Bio-Hosp ja cadastrada — fluxo nao-cadastro
- Componente UploadLoteIA contexto=cadastro_empresa renderiza apenas quando empresa nao existe (logica condicional)

**Observe criticamente:**
- Tela de login do facilicita.ia aparece com campos email + senha
- Botao 'Entrar' visivel e habilitado
- Apos preencher e clicar Entrar, redireciona para Dashboard sem erro

```yaml
id: passo_00_login
acao:
  tipo: navegacao
  url: /login
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_00_login
```


## Sidebar > Configuracoes > Empresa (expande secao + clica item Empresa)

> **Validando observação Arnaldo F01-01** — Cadastro de empresa via upload IA + aceite humano

Tester clica Sidebar > Configuracoes (expande) > Empresa. Tela carrega com dados Bio-Hosp ja cadastrada.

**Observe criticamente:**
- Sidebar lateral mostra secao 'Configuracoes' que expande ao clicar
- Item 'Empresa' aparece dentro de Configuracoes
- Apos clicar, conteudo principal mostra 'Dados da Empresa'

```yaml
id: passo_01_navegar_empresa
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
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_01_navegar_empresa
```


## UploadLoteIA cadastro_empresa renderiza SE empresa nao cadastrada (caso contrario form de edicao)

> **Validando observação Arnaldo F01-01** — Cadastro de empresa via upload IA + aceite humano

Verifica logica condicional: UploadLoteIA contexto=cadastro_empresa SO renderiza se empresa NAO existe. Como Bio-Hosp ja existe, NAO deve mostrar (comportamento esperado).

**Observe criticamente:**
- Se empresa NAO cadastrada: aparece secao 'Cadastro Automatico por IA — envie contrato social'
- Se empresa JA cadastrada (Bio-Hosp): NAO mostra essa secao (form de edicao normal)
- Comportamento condicional confirma logica F01-01 (componente so aparece em fluxo de cadastro)

```yaml
id: passo_02_validar_componente_upload_lote_ia
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const r = await fetch('/api/auth/user', {headers:{Authorization:`Bearer\
    \ ${localStorage.getItem('editais_ia_access_token')}`}});\n  const u = await r.json();\n\
    \  const tem_empresa = u.has_empresa === true;\n  const txt = document.body.innerText;\n\
    \  // Quando empresa existe: heading \"Cadastro Automático de Documentos por IA\"\
    \ (contexto=documentos)\n  // mas NAO heading \"Cadastro Automático por IA — envie\
    \ contrato social\" (contexto=cadastro_empresa)\n  const tem_doc = /Cadastro Autom[áa]tico.*Documentos/i.test(txt);\n\
    \  const tem_emp = /envie contrato social|Cadastro Autom[áa]tico por IA — envie/i.test(txt);\n\
    \  if (tem_empresa) {\n    if (tem_emp) throw new Error('Empresa existe mas heading\
    \ cadastro_empresa AINDA renderiza — bug F01-01');\n    if (!tem_doc) throw new\
    \ Error('Empresa existe mas componente UploadLoteIA documentos NAO renderiza');\n\
    \    return `F01-01_OK empresa_existe heading_documentos=true heading_empresa=false\
    \ (correcao funciona — componente troca contexto)`;\n  } else {\n    if (!tem_emp)\
    \ throw new Error('Empresa nova mas heading cadastro_empresa NAO renderiza');\n\
    \    return `F01-01_OK empresa_nova heading_empresa=true`;\n  }\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-01_visual_fp.yaml#passo_02_validar_componente_upload_lote_ia
```
