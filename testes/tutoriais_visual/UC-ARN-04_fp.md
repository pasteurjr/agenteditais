---
uc_id: UC-ARN-04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml
---

# UC-ARN-04 — CNPJ readonly apos empresa salva (Fluxo Principal)

> **Origem da observação:** F01-04
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Cria empresa, recarrega EmpresaPage e verifica que input CNPJ esta disabled.
Falha se input estiver editavel quando empresa ja existe.


## Navega para EmpresaPage via sidebar Configurações > Empresa

> **Validando observação Arnaldo F01-04** — CNPJ readonly apos empresa salva

Tester acabou de clicar Sidebar > Configuracoes > Empresa. Pagina carrega mostrando dados cadastrais da empresa Bio-Hosp ja existente.

**Dados/pré-condições:**
- Empresa Bio-Hosp (CNPJ 33.682.845/3710-64) ja cadastrada
- Frontend EmpresaPage.tsx renderiza input CNPJ com `disabled={!!empresaId}`

**Observe criticamente:**
- Header mostra 'Dados da Empresa' (h1) ou 'Empresa'
- Sidebar 'Configuracoes' expandida com 'Empresa' destacado
- Form carregou sem mensagens de erro/loading travado

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
validacao_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml#passo_00_navegar_empresa
```


## F01-04: CNPJ deve estar DISABLED quando empresa ja existe

> **Validando observação Arnaldo F01-04** — CNPJ readonly apos empresa salva

ESTE PASSO E A CORE DA OBSERVACAO F01-04. Apos salvar empresa, CNPJ NAO pode mais ser editavel (chave fiscal — alterar descaracteriza). Cruza /api/auth/user (has_empresa) + DOM (input.disabled).

**Observe criticamente:**
- Campo CNPJ aparece preenchido com '33.682.845/3710-64'
- Visualmente o campo CNPJ esta esmaecido/cinza (cor diferente dos editaveis)
- Cursor sobre o campo NAO muda para text/I-beam
- Tentativa de clicar e digitar no CNPJ NAO produz alteracao visual
- Hint visivel: 'CNPJ nao editavel apos cadastro' ou similar
- Outros campos (Nome Fantasia, IE) continuam editaveis normalmente

```yaml
id: passo_01_verificar_cnpj_readonly
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  const r = await fetch('/api/auth/user', {headers:{Authorization:`Bearer ${token}`}});\n\
    \  if (!r.ok) throw new Error(`/api/auth/user ${r.status}`);\n  const u = await\
    \ r.json();\n  if (!u.has_empresa || !u.empresa) {\n    throw new Error('Pre-cond\
    \ falhou: usuario sem empresa cadastrada — fluxo F01-04 (CNPJ disabled apos cadastro)\
    \ nao se aplica');\n  }\n  // CNPJ deve estar disabled E label deve dizer \"(nao\
    \ editavel apos cadastro)\"\n  const labels = [...document.querySelectorAll('label')];\n\
    \  const cnpj_label = labels.find(l => /^\\s*CNPJ/i.test(l.textContent || ''));\n\
    \  if (!cnpj_label) throw new Error('Label CNPJ nao achado');\n  const txt_label\
    \ = cnpj_label.textContent || '';\n  const tem_hint = /n[ãa]o edit[áa]vel|readonly|n[ãa]o\
    \ pode ser alterado/i.test(txt_label);\n  const wrapper = cnpj_label.closest('.form-field')\
    \ || cnpj_label.parentElement;\n  const input = wrapper.querySelector('input');\n\
    \  if (!input) throw new Error('Input CNPJ nao achado dentro do wrapper');\n \
    \ if (!input.disabled) {\n    throw new Error(`Empresa JA EXISTE (id=${u.empresa.id})\
    \ mas input CNPJ EDITAVEL — bug F01-04 NAO corrigido`);\n  }\n  if (!tem_hint)\
    \ {\n    throw new Error(`Input disabled mas label nao tem hint \"nao editavel\"\
    : \"${txt_label}\"`);\n  }\n  return `F01-04_OK label=\"${txt_label.trim()}\"\
    \ disabled=true valor=${input.value} hint=true`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-04_visual_fp.yaml#passo_01_verificar_cnpj_readonly
```
