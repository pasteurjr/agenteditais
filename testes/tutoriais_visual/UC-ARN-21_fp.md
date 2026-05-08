---
uc_id: UC-ARN-21
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-ARN-21_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-ARN-21_visual_fp.yaml
---

# UC-ARN-21 — Magic bytes %PDF rejeita HTML renomeado (Fluxo Principal)

> **Origem da observação:** F04-07
> **Sprint:** 10 — Correcoes Arnaldo
> **Geração:** automática a partir de docs/SPEC_UCS_ARNALDO.yaml

## Descrição

Upload de arquivo nao-PDF (HTML com extensao .pdf) deve retornar 400
com erro indicando bytes invalidos.


## Upload HTML como .pdf rejeita (helper magic bytes funciona)

> **Validando observação Arnaldo F04-07** — Magic bytes %PDF rejeita HTML renomeado

Confirma F04-07: helper _arquivo_eh_pdf_valido rejeita HTML disfarcado de PDF com 400 + mensagem sobre PDF/bytes/formato. Faz upload real de fake.pdf (HTML).

**Dados/pré-condições:**
- Helper _arquivo_eh_pdf_valido em backend/app.py linha 62
- Backend rejeita upload de HTML disfarcado de PDF com 400 + mensagem PDF/bytes

**Observe criticamente:**
- Endpoint /api/empresa-certidoes/<id>/upload existe
- Helper _arquivo_eh_pdf_valido implementado (app.py linha 62)
- Upload de HTML disfarcado retorna 400 com mensagem mencionando PDF/bytes/formato

```yaml
id: passo_00_validar_helper
acao:
  tipo: evaluate
  valor_literal: "async () => {\n  const token = localStorage.getItem('editais_ia_access_token');\n\
    \  // Pega 1 cert real\n  const r_list = await fetch('/api/crud/empresa-certidoes?limit=1',\
    \ {headers:{Authorization:`Bearer ${token}`}});\n  if (!r_list.ok) throw new Error(`Lista\
    \ certidoes falhou ${r_list.status}`);\n  const data = await r_list.json();\n\
    \  const certs = data.items || data.dados || [];\n  if (certs.length === 0) {\n\
    \    return 'F04-07_sem_certidoes_para_upload (helper esta no codigo, nao verificavel\
    \ sem dados)';\n  }\n  const cert_id = certs[0].id;\n  // Upload HTML disfarcado\
    \ de PDF\n  const html = '<html><body>fake</body></html>';\n  const blob = new\
    \ Blob([html], {type: 'application/pdf'});\n  const fd = new FormData();\n  fd.append('file',\
    \ blob, 'fake.pdf');\n  const r = await fetch(`/api/empresa-certidoes/${cert_id}/upload`,\
    \ {\n    method: 'POST', headers: {Authorization: `Bearer ${token}`}, body: fd\n\
    \  });\n  if (r.status >= 200 && r.status < 300) {\n    throw new Error(`F04-07\
    \ NAO corrigido: HTML aceito como PDF (status ${r.status})`);\n  }\n  const body\
    \ = await r.text();\n  // Backend retorna {error: \"...\", magic_bytes_invalidos:\
    \ true}\n  const tem_msg = /magic_bytes_invalidos|n[ãa]o.*PDF v[áa]lido|formato|bytes\
    \ invalid/i.test(body);\n  if (!tem_msg) {\n    throw new Error(`F04-07 incompleto:\
    \ rejeitou (${r.status}) mas mensagem nao indica problema PDF: ${body.slice(0,200)}`);\n\
    \  }\n  return `F04-07_OK status=${r.status} cert=${cert_id.slice(0,8)} msg_pdf=true`;\n\
    }"
validacao_ref: testes/casos_de_teste/UC-ARN-21_visual_fp.yaml#passo_00_validar_helper
```
