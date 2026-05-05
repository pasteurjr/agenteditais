---
uc_id: UC-I03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I03_visual_fp.yaml
---

# UC-I03 — Criar Impugnacao — POST /impugnacoes + assert SQL (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-I03_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Criar Impugnacao

```yaml
id: passo_01_criar_impugnacao
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
        
          const r = await fetch('/api/impugnacoes', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              edital_id: ed.id,
              tipo: 'impugnacao',
              status: 'rascunho',
              texto: 'Impugnacao de teste sprint 4 - argumentos juridicos relevantes',
              inconsistencias: ['Item 2 sem ANVISA explicito']
            })
          });
          if (!r.ok) throw new Error(`POST /impugnacoes ${r.status}: ${await r.text()}`);
          const data = await r.json();
          if (!data.success) throw new Error(`Impugnacao falhou: ${JSON.stringify(data).substring(0,200)}`);
          window.__i03_imp_id = data.impugnacao.id;
          return `impugnacao_criada id=${data.impugnacao.id.substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-I03_visual_fp.yaml#passo_01_criar_impugnacao"
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
          const r = await fetch('/api/crud/impugnacoes?limit=10', { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) throw new Error(`GET /impugnacoes ${r.status}`);
          const items = (await r.json()).items || [];
          if (items.length < 1) throw new Error('EFEITO REAL: 0 impugnacoes persistidas no banco');
          const imp = items[0];
          if (!imp.edital_id) throw new Error('Impugnacao sem edital_id');
          if (!imp.tipo) throw new Error('Impugnacao sem tipo');
          return `impugnacao_persistida_OK id=${imp.id.substring(0,8)} edital=${imp.edital_id.substring(0,8)} tipo=${imp.tipo} status=${imp.status}`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-I03_visual_fp.yaml#passo_02_validar_sql"
```
