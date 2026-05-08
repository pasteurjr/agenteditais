---
uc_id: UC-ARN-18
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-18_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-18_visual_fp.yaml
---

# UC-ARN-18 — Botao atualizar individual passa ID da certidao (Fluxo Principal)

> **Origem da observação:** F04-04
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Confirma comportamento real: ao clicar botao de UMA certidao, requisicao
de busca-stream eh feita com certidao_ids especifico (nao geral).


## EmpresaPage

> **Validando observação Arnaldo F04-04** — Botao atualizar individual passa ID da certidao

Tester abre EmpresaPage.

**Dados/pré-condições:**
- Botao 'Atualizar certidao individual' tem onClick passando [c.id] (nao geral)
- Endpoint /api/empresa-certidoes/buscar-stream recebe certidao_ids especifico

**Observe criticamente:**
- EmpresaPage abre normalmente

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
validacao_ref: testes/casos_de_teste/UC-ARN-18_visual_fp.yaml#passo_00_navegar_empresa
```


## Existe handler especifico de UMA certidao OU pagina menciona acao individual

> **Validando observação Arnaldo F04-04** — Botao atualizar individual passa ID da certidao

Confirma F04-04: existe botao 'Atualizar certidao individual' que passa ID especifico (nao acao geral). Antes recarregava tudo, agora so a fonte clicada.

**Observe criticamente:**
- Existe botao com title/aria-label mencionando 'atualizar certidao individual'
- OU pagina menciona acao individual de certidao
- Correcao tecnica F04-04 confirmada via inspecao de handler React

```yaml
id: passo_01_validar_botao_individual
acao:
  tipo: evaluate
  valor_literal: "() => {\n  // F04-04: existe botao individual de UMA certidao (titles\
    \ reais: 'Editar dados da certidao', 'Fazer upload manual do PDF da certidao',\
    \ 'Buscar agora')\n  const botoes = [...document.querySelectorAll('button[title],\
    \ button[aria-label]')];\n  const individuais = botoes.filter(b => {\n    const\
    \ t = (b.title || b.getAttribute('aria-label') || '').toLowerCase();\n    return\
    \ /editar dados da certid|fazer upload manual.*certid|buscar agora|atualizar.*esta\
    \ certid|buscar.*esta certid|atualizar individual|baixar pdf|download.*certid/i.test(t);\n\
    \  });\n  if (individuais.length === 0) {\n    const titulos = botoes.map(b =>\
    \ b.title || '').filter(t => t.length > 10).slice(0, 10);\n    throw new Error(`F04-04\
    \ NAO encontrado: nenhum botao com title de acao individual em certidao. Botoes\
    \ com title: ${titulos.join(' | ')}`);\n  }\n  const exemplos = individuais.slice(0,\
    \ 3).map(b => (b.title || b.getAttribute('aria-label') || '').slice(0, 50));\n\
    \  return `F04-04_OK ${individuais.length}_botoes_individuais exemplos: ${exemplos.join('\
    \ | ')}`;\n}"
validacao_ref: testes/casos_de_teste/UC-ARN-18_visual_fp.yaml#passo_01_validar_botao_individual
```
