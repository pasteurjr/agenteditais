---
uc_id: UC-I05
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-I05_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-I05_visual_fp.yaml
---

# UC-I05 — Status / Prazo Impugnacao - GET /prazo-impugnacao (Sprint 4 V3 PROFUNDO via API)

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
validacao_ref: "testes/casos_de_teste/UC-I05_visual_fp.yaml#passo_00_setup"
```

## Passo 01 Prazo Impugnacao

```yaml
id: passo_01_prazo_impugnacao
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
        
          const r = await fetch(`/api/editais/${ed.id}/prazo-impugnacao`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) {
            if (r.status === 404) return `prazo_404 (sem data abertura — dados consistentes esperados Sprint2 V3)`;
            throw new Error(`GET /prazo-impugnacao ${r.status}`);
          }
          const data = await r.json();
          return `prazo_OK dias_restantes=${data.dias_restantes || data.prazo || '?'}`;
        }
    - tipo: wait
      valor_literal: 5000
validacao_ref: "testes/casos_de_teste/UC-I05_visual_fp.yaml#passo_01_prazo_impugnacao"
```
