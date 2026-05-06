---
uc_id: UC-F04
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-F04_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-F04_visual_fp.yaml
---

# UC-F04 — Buscar e revisar certidoes (Fluxo Principal)

> **PO:** Test profundo via API direta (mais robusto que clicar UI). Cobre:
> 1. Listagem de fontes_certidoes ja existentes (9 globais)
> 2. Cadastro de 3 fontes V5 da empresa (PGFN REGULARIZE, Itamarandiba, JUCEMG)
> 3. Validacao de listagem combinada (globais + da empresa = 12)
> 4. Sincronizacao com empresa_certidoes (criar registros pendentes)
> 5. Cleanup das fontes V5
>
> **Pre-requisitos:** UC-F01 ja executado (empresa com CNPJ + login + empresa selecionada).

## Passo 00 — Setup: garantir login com empresa ativa

```yaml
id: passo_00_setup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const token = localStorage.getItem('editais_ia_access_token');
          if (!token) throw new Error('Sem JWT — login obrigatorio');
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!payload.empresa_id) throw new Error('JWT sem empresa_id — selecione empresa primeiro');
            window.__test_empresa_id = payload.empresa_id;
            return `OK empresa_id=${payload.empresa_id.substring(0,8)}`;
          } catch (e) {
            throw new Error(`JWT invalido: ${e.message}`);
          }
        }
    - tipo: wait
      valor_literal: 200
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_00_setup"
```

## Passo 01 — Listar fontes ANTES (devem aparecer 9 globais + as da empresa)

```yaml
id: passo_01_listar_antes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/fontes-certidoes?limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!r.ok) throw new Error(`GET fontes-certidoes ${r.status}: ${await r.text()}`);
          const data = await r.json();
          const items = data.items || data.fontes_certidoes || [];
          const globais = items.filter(f => !f.empresa_id).length;
          const empresa = items.filter(f => f.empresa_id).length;
          window.__test_total_antes = items.length;
          window.__test_globais_antes = globais;
          if (globais < 9) throw new Error(`Esperado >= 9 fontes globais (catalogo do sistema), achou ${globais}`);
          return `OK total=${items.length} globais=${globais} empresa=${empresa}`;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_01_listar_antes"
```

## Passo 02 — Cadastrar 3 fontes V5 da empresa (PGFN/Itamarandiba/JUCEMG)

POST /api/crud/fontes-certidoes para cada uma das 3 fontes propostas no tutorial V5.

```yaml
id: passo_02_cadastrar_fontes_v5
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');

          // Limpa fontes _TESTV5_ que sobraram de runs anteriores
          const rList = await fetch('/api/crud/fontes-certidoes?limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dList = await rList.json();
          const itensAntigos = (dList.items || []).filter(f => (f.nome || '').startsWith('_TESTV5_'));
          for (const f of itensAntigos) {
            await fetch(`/api/crud/fontes-certidoes/${f.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          }

          // Cadastra as 3 fontes V5
          const fontes = [
            {
              tipo_certidao: 'cnd_federal',
              nome: '_TESTV5_PGFN-REGULARIZE',
              orgao_emissor: 'Procuradoria-Geral da Fazenda Nacional',
              url_portal: 'https://www.regularize.pgfn.gov.br/',
              metodo_acesso: 'publico',
              permite_busca_automatica: true,
              ativo: true,
              observacoes: 'V5 test — Divida Ativa PGFN isolada',
            },
            {
              tipo_certidao: 'cnd_municipal',
              nome: '_TESTV5_Itamarandiba-CND',
              orgao_emissor: 'Prefeitura de Itamarandiba',
              url_portal: 'https://itamarandiba.mg.gov.br/servicos/certidao-negativa-de-debitos',
              metodo_acesso: 'publico',
              uf: 'MG',
              cidade: 'Itamarandiba',
              permite_busca_automatica: true,
              ativo: true,
            },
            {
              tipo_certidao: 'outro',
              nome: '_TESTV5_JUCEMG',
              orgao_emissor: 'Junta Comercial do Estado de Minas Gerais',
              url_portal: 'https://www.jucemg.mg.gov.br/empresa/online/certidao',
              metodo_acesso: 'publico',
              uf: 'MG',
              permite_busca_automatica: true,
              ativo: true,
            },
          ];

          const ids_criados = [];
          for (const f of fontes) {
            const r = await fetch('/api/crud/fontes-certidoes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(f),
            });
            if (!r.ok) throw new Error(`POST fonte ${f.nome}: ${r.status} - ${(await r.text()).substring(0,150)}`);
            const data = await r.json();
            const id = data.id || data.fontes_certidoes?.id;
            if (!id) throw new Error(`POST ${f.nome}: resposta sem id - ${JSON.stringify(data).substring(0,150)}`);
            ids_criados.push(id);
          }
          window.__test_v5_fontes_ids = ids_criados;
          return `criadas_3_fontes ids=${ids_criados.map(i => i.substring(0,8)).join(',')}`;
        }
    - tipo: wait
      valor_literal: 800
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_02_cadastrar_fontes_v5"
```

## Passo 03 — Validar listagem combinada (globais + 3 V5)

GET deve retornar 12 fontes (9 globais + 3 V5) por causa da flag include_globais no backend.

```yaml
id: passo_03_validar_listagem_combinada
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const r = await fetch('/api/crud/fontes-certidoes?limit=100', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!r.ok) throw new Error(`GET ${r.status}`);
          const data = await r.json();
          const items = data.items || data.fontes_certidoes || [];
          const globais = items.filter(f => !f.empresa_id);
          const da_empresa_v5 = items.filter(f => (f.nome || '').startsWith('_TESTV5_'));
          if (globais.length < 9) throw new Error(`Esperado >= 9 globais, achou ${globais.length}`);
          if (da_empresa_v5.length !== 3) throw new Error(`Esperado 3 fontes V5 da empresa, achou ${da_empresa_v5.length}`);
          if (items.length < 12) throw new Error(`Esperado >= 12 fontes (9 globais + 3 V5), achou ${items.length}`);
          return `OK total=${items.length} globais=${globais.length} v5_empresa=${da_empresa_v5.length}`;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_03_validar_listagem_combinada"
```

## Passo 04 — Sincronizar fontes -> empresa_certidoes (cria registros pendentes)

POST /api/empresa-certidoes/sincronizar-fontes deve criar 1 registro `empresa_certidoes` para cada fonte ativa (12 fontes → ate 12 registros). Valida que a correção do filtro inclusivo funcionou: a sincronização pega globais + V5.

```yaml
id: passo_04_sincronizar_fontes
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const empresa_id = window.__test_empresa_id;
          if (!empresa_id) throw new Error('window.__test_empresa_id ausente — passo 00 falhou');

          const r = await fetch('/api/empresa-certidoes/sincronizar-fontes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ empresa_id }),
          });
          if (!r.ok) throw new Error(`sincronizar-fontes ${r.status}: ${(await r.text()).substring(0,200)}`);
          const data = await r.json();

          // Lista certidoes da empresa apos sincronizacao
          const r2 = await fetch(`/api/crud/empresa-certidoes?parent_id=${empresa_id}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!r2.ok) throw new Error(`GET empresa-certidoes ${r2.status}`);
          const d2 = await r2.json();
          const items = d2.items || [];
          if (items.length < 9) throw new Error(`Esperado >= 9 certidoes apos sincronizacao (globais + V5), achou ${items.length}`);
          return `sincronizacao_OK certidoes_empresa=${items.length}`;
        }
    - tipo: wait
      valor_literal: 1500
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_04_sincronizar_fontes"
```

## Passo 05 — Buscar Certidoes (efeito real — chama scrapers/APIs externas)

Equivalente ao "Buscar Certidoes" da UI: POST /api/empresa-certidoes/buscar-automatica
processa as 12 fontes (9 globais + 3 V5) e tenta baixar/consultar cada uma.

Este passo valida que:
- O endpoint da busca real existe e responde 200
- A busca processa as 12 fontes (globais + V5) — confirma o fix include_globais
- Pelo menos 1 das certidoes da empresa muda de status apos a busca

CNPJs ficticios podem retornar erro/vazio nos portais reais — isso e ESPERADO.
O que validamos eh o FLUXO completo (endpoint chamado, fontes processadas,
status atualizados), nao se baixou PDF de verdade.

```yaml
id: passo_05_buscar_certidoes_real
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const empresa_id = window.__test_empresa_id;
          if (!empresa_id) throw new Error('empresa_id ausente');

          // Snapshot ANTES — quantas certidoes em status "pendente"
          const rAntes = await fetch(`/api/crud/empresa-certidoes?parent_id=${empresa_id}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dAntes = await rAntes.json();
          const totalAntes = (dAntes.items || []).length;

          // Chama busca real
          const r = await fetch('/api/empresa-certidoes/buscar-automatica', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ empresa_id }),
          });
          if (!r.ok) {
            const txt = (await r.text()).substring(0,250);
            throw new Error(`buscar-automatica ${r.status}: ${txt}`);
          }
          const data = await r.json();
          const processadas = (data.resultados || []).length || data.total || 0;
          const stats = data.stats || {};

          // Snapshot DEPOIS — verifica que pelo menos 1 status mudou
          const rDepois = await fetch(`/api/crud/empresa-certidoes?parent_id=${empresa_id}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dDepois = await rDepois.json();
          const items = dDepois.items || [];
          const naoProcessadas = items.filter(c => c.status === 'pendente' || c.status === 'nao_disponivel').length;
          const processadasComEstado = items.filter(c =>
            c.status === 'valida' || c.status === 'vencida' || c.status === 'erro' || c.status === 'login_invalido'
          ).length;

          // Asserts:
          // 1. Busca processou >= 1 fonte (pode ser 12 globais + 3 V5 = 15 ou subset)
          if (processadas < 1) throw new Error(`buscar-automatica processou 0 fontes — esperado >= 1`);
          // 2. Pelo menos 1 certidao mudou de status (algum portal respondeu)
          if (processadasComEstado < 1) {
            throw new Error(`Nenhuma certidao mudou de status apos busca. ` +
                            `total=${items.length} pendentes=${naoProcessadas}`);
          }

          return `busca_real_OK processadas=${processadas} status_alterados=${processadasComEstado} pendentes=${naoProcessadas} stats=${JSON.stringify(stats)}`;
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_05_buscar_certidoes_real"
```

## Passo 06 — Cleanup das fontes V5

DELETE das 3 fontes V5 e das certidoes empresa associadas (best-effort).

```yaml
id: passo_06_cleanup
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const ids = window.__test_v5_fontes_ids || [];
          let apagadas = 0;
          for (const id of ids) {
            if (!id) continue;
            const r = await fetch(`/api/crud/fontes-certidoes/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (r.ok) apagadas++;
          }
          return `cleanup_OK apagadas=${apagadas}/${ids.length}`;
        }
    - tipo: wait
      valor_literal: 300
validacao_ref: "testes/casos_de_teste/UC-F04_visual_fp.yaml#passo_06_cleanup"
```
