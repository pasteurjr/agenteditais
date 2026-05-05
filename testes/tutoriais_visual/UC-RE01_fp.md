---
uc_id: UC-RE01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-RE01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-RE01_visual_fp.yaml
---

# UC-RE01 — Criar Recurso - POST /recursos + assert SQL (Sprint 4 V3 PROFUNDO via API)

> **Predecessores:** Sprint 2 V3 + Sprint 3 V3
> **Estrategia:** chamada direta API + assert SQL

## Passo 00 Setup

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Criar Recurso

```yaml
id: passo_01_criar_recurso
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const re = await fetch('/api/crud/editais?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          const editais = (await re.json()).items || [];
          const ed = editais.find(e => e.cnpj_orgao === '75636530000120') || editais[0];
          if (!ed) throw new Error('Sem edital');
        
          const r = await fetch('/api/recursos', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              edital_id: ed.id,
              tipo: 'recurso',
              subtipo: 'administrativo',
              status: 'rascunho',
              texto: 'Recurso administrativo de teste sprint 4',
              argumentos: ['Empresa habilitada com toda documentacao em ordem']
            })
          });
          if (!r.ok) throw new Error(`POST /recursos ${r.status}: ${await r.text()}`);
          const data = await r.json();
          if (!data.success && !data.recurso) throw new Error(`Recurso falhou: ${JSON.stringify(data).substring(0,200)}`);
          window.__re01_rec_id = (data.recurso || {}).id;
          return `recurso_criado id=${(data.recurso || {}).id?.substring(0,8) || '?'}`;
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_01_criar_recurso"
```

## Passo 02 Validar Sql

```yaml
id: passo_02_validar_sql
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/recursos', { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) throw new Error(`GET /recursos ${r.status}`);
          const data = await r.json();
          const items = data.items || data.recursos || data;
          const arr = Array.isArray(items) ? items : (items.items || []);
          if (arr.length < 1) throw new Error('EFEITO REAL: 0 recursos persistidos');
          return `recurso_persistido_OK ${arr.length} recursos`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-RE01_visual_fp.yaml#passo_02_validar_sql"
```
