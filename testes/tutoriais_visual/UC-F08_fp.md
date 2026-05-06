---
uc_id: UC-F08
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F08_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F08_visual_fp.yaml
---

# UC-F08 — Editar produto e especificacoes (Fluxo Principal — V6 PROFUNDO)

> **PO:** Test profundo via API direta (mais robusto que clicar UI). Cobre:
> 1. Listar produtos do user (deve ter pelo menos 1 do UC-F07)
> 2. PUT /api/crud/produtos/{id} alterando nome/fabricante/modelo/NCM/descricao
> 3. Validar via SQL/GET que dados foram persistidos
> 4. Validar que a subclasse do produto tem campos_mascara configurada (V6)
>
> **Pre-requisitos:** UC-F01, UC-F13 (com PARTE 4 cadastrando mascara) e UC-F07 ja executados.

## Passo 00 — Setup: garantir login e listar produtos

```yaml
id: passo_00_setup_listar_produtos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          if (!token) throw new Error('Sem JWT — login obrigatorio');
          const r = await fetch('/api/crud/produtos?limit=20', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`GET produtos ${r.status}`);
          const data = await r.json();
          const produtos = data.items || [];
          if (produtos.length < 1) {
            throw new Error(`Nenhum produto cadastrado. UC-F07 precisa rodar antes deste UC.`);
          }
          // Pega o produto mais recente (criado pelo F07 na sessao atual)
          const produto = produtos[0];
          window.__test_produto_id = produto.id;
          window.__test_produto_nome_original = produto.nome;
          window.__test_subclasse_id_original = produto.subclasse_id;
          return `OK total_produtos=${produtos.length} editar_id=${produto.id.substring(0,8)} nome="${(produto.nome||'').substring(0,30)}"`;
        }
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_00_setup_listar_produtos"
```

## Passo 01 — PUT alterando dados basicos do produto

PUT /api/crud/produtos/{id} com novos valores. Valida 200/201.

```yaml
id: passo_01_editar_produto
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const id = window.__test_produto_id;
          if (!id) throw new Error('produto_id ausente — passo 00 falhou');

          // Lista subclasses pra pegar a de Monitor (foi cadastrada em UC-F13)
          const rs = await fetch('/api/crud/subclasses-produto?limit=100', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const dsub = await rs.json();
          const subMonitor = (dsub.items || []).find(s => /Monitor Multipar/i.test(s.nome || ''));
          const subclasse_id = subMonitor ? subMonitor.id : window.__test_subclasse_id_original;

          const novosDados = {
            nome: 'Monitor MultiParam Pro Edicao Visual',
            fabricante: 'Quantica MedTech',
            modelo: 'QM-MP-2026',
            codigo_interno: 'SKU-QMMP-2026',
            ncm: '9018.19.90',
            descricao: 'Monitor multiparametrico atualizado via UC-F08 (FP) — V6 PROFUNDO',
            subclasse_id: subclasse_id,
          };

          const r = await fetch(`/api/crud/produtos/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
            body: JSON.stringify(novosDados),
          });
          if (!r.ok) throw new Error(`PUT produto ${r.status}: ${(await r.text()).substring(0,200)}`);

          window.__test_subclasse_alvo = subclasse_id;
          return `editado_OK id=${id.substring(0,8)} subclasse=${(subclasse_id||'').substring(0,8)}`;
        }
    - tipo: wait
      valor_literal: 500
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_01_editar_produto"
```

## Passo 02 — Validar persistencia via GET

GET /api/crud/produtos/{id} confirma que os novos valores foram salvos.

```yaml
id: passo_02_validar_persistencia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const id = window.__test_produto_id;
          const r = await fetch(`/api/crud/produtos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`GET produto ${r.status}`);
          const p = await r.json();
          const checks = [];
          if (p.nome !== 'Monitor MultiParam Pro Edicao Visual') checks.push(`nome="${p.nome}"`);
          if (p.fabricante !== 'Quantica MedTech') checks.push(`fabricante="${p.fabricante}"`);
          if (p.modelo !== 'QM-MP-2026') checks.push(`modelo="${p.modelo}"`);
          if (p.ncm !== '9018.19.90') checks.push(`ncm="${p.ncm}"`);
          if (checks.length > 0) throw new Error(`Campos NAO persistiram corretamente: ${checks.join(', ')}`);
          return `persistencia_OK nome=${p.nome.substring(0,30)} fab=${p.fabricante} modelo=${p.modelo} ncm=${p.ncm}`;
        }
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_02_validar_persistencia"
```

## Passo 03 — Validar Mascara de Campos da subclasse aplicada (NOVO em V6)

Verifica via API direta que a subclasse do produto editado tem `campos_mascara` configurada.
Pre-condicao: UC-F13 Passos 12 e 13 ja cadastraram a mascara.

```yaml
id: passo_03_validar_mascara_subclasse
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const subclasse_id = window.__test_subclasse_alvo;
          if (!subclasse_id) {
            return `produto_sem_subclasse — pulando validacao mascara`;
          }
          const r = await fetch(`/api/crud/subclasses-produto/${subclasse_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`GET subclasse ${r.status}`);
          const sub = await r.json();
          const m = sub.campos_mascara || [];
          if (m.length < 1) {
            throw new Error(`Subclasse "${sub.nome}" tem campos_mascara vazia. ` +
                            `UC-F13 Passo 12 precisa cadastrar a mascara antes deste UC.`);
          }
          const nomes = m.map(c => c.campo || c.nome).filter(Boolean).slice(0,8).join(',');
          return `mascara_OK subclasse=${(sub.nome||'').substring(0,30)} campos=${m.length} [${nomes}]`;
        }
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-F08_visual_fp.yaml#passo_03_validar_mascara_subclasse"
```
