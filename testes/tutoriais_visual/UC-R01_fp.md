---
uc_id: UC-R01
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-R01_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-R01_visual_fp.yaml
---

# UC-R01 — Gerar Proposta Tecnica IA — direto via API

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => 'setup_ok'
validacao_ref: "testes/casos_de_teste/UC-R01_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Simular IA via /api/precificacao/simular-ia

```yaml
id: passo_01_simular_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/precificacao/simular-ia', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Sugira uma estratégia de lance para um Monitor Multiparâmetro hospitalar com custo R$ 5000 e teto de pregão R$ 7500.' })
          });
          if (!r.ok) {
            if (r.status === 500) return `simular_500_transient (DeepSeek instavel)`;
            throw new Error(`POST /simular-ia ${r.status}`);
          }
          const data = await r.json();
          return `simular_OK success=${data.success} response_len=${(data.response || '').length}`;
        }
    - tipo: wait
      valor_literal: 90000
validacao_ref: "testes/casos_de_teste/UC-R01_visual_fp.yaml#passo_01_simular_ia"
```
