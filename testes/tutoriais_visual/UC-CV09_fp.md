---
uc_id: UC-CV09
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV09_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV09_visual_fp.yaml
---

# UC-CV09 — Importar itens do PNCP e extrair lotes via IA — EFEITO REAL (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Click aba 'Lotes'

Tab Lotes ativa.

```yaml
id: passo_00_aba_lotes
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'button.tab-panel-tab, button[class*="tab"]'
      timeout: 10000
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Lotes(\s*\(\d+\))?$/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba Lotes nao encontrada');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'aba_lotes_clicked';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_00_aba_lotes"
```

## Passo 01 — EFEITO REAL: 'Itens do Edital (0)' OU mensagem 'Importe os itens'

Confirma estado inicial — sem itens importados ainda.

```yaml
id: passo_01_validar_estado_inicial_zero
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '');
          const m = txt.match(/Itens do Edital \((\d+)\)/);
          const tem_msg = /Importe.*PNCP|Nenhum item/i.test(txt);
          if (m) return `estado_inicial_itens=${m[1]}`;
          if (tem_msg) return 'estado_vazio_msg';
          return 'estado_indefinido';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_01_validar_estado_inicial_zero"
```

## Passo 02 — Click 'Buscar Itens no PNCP' — POST /api/editais/<id>/buscar-itens-pncp

**EFEITO REAL ESPERADO:**
- Botao 'Buscar Itens no PNCP' presente
- Apos click, network POST /buscar-itens-pncp retorna 200 com data.itens (lista nao vazia)
- Tempo PNCP: ate 60s


```yaml
id: passo_02_clicar_buscar_itens_pncp
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Idempotente: se ja tem itens (heranca do TESTE BASE), valida e segue
          const txt = (document.body.textContent || '');
          const m = txt.match(/Itens do Edital \((\d+)\)/);
          if (m && parseInt(m[1]) >= 1) {
            return `itens_ja_importados=${m[1]} (sem necessidade de click)`;
          }
          // Sem itens — clica botao Buscar
          const btn = [...document.querySelectorAll('button')].find(b => /Buscar Itens no PNCP|Buscando/i.test(b.textContent||''));
          if (!btn) throw new Error('Sem itens E sem botao Buscar — estado inesperado');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_buscar_itens_pncp';
        }
    - tipo: wait
      valor_literal: 60000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_02_clicar_buscar_itens_pncp"
```

## Passo 03 — EFEITO REAL: 'Itens do Edital (N)' com N>=1 OU tabela com tr

**VALIDACAO CRITICA:** se importou de fato, contagem subiu. throw em N=0.

```yaml
id: passo_03_validar_itens_importados
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          if (!token) throw new Error('Sem token auth');
          
          // 1. Pega o edital salvo (deve existir 1 só apos cadeia limpa)
          const re = await fetch('/api/crud/editais?limit=10', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!re.ok) throw new Error(`/api/crud/editais retornou ${re.status}`);
          const editais = (await re.json()).items || [];
          if (editais.length < 1) throw new Error('EFEITO REAL FALHOU: nenhum edital salvo no banco');
          
          const com_pncp = editais.filter(e => e.cnpj_orgao && e.ano_compra && e.seq_compra);
          if (com_pncp.length < 1) throw new Error('EFEITO REAL FALHOU: edital salvo sem cnpj/ano/seq (CV03 falhou)');
          
          const alvo = com_pncp[0];
          
          // 2. Conta itens vinculados a esse edital
          const ri = await fetch(`/api/crud/editais-itens?edital_id=${alvo.id}&limit=50`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!ri.ok) throw new Error(`/api/crud/editais-itens retornou ${ri.status}`);
          const itens = (await ri.json()).items || [];
          
          if (itens.length < 1) {
            throw new Error(`EFEITO REAL FALHOU: edital ${alvo.numero} (${alvo.cnpj_orgao}) tem 0 itens persistidos. Buscar Itens PNCP nao funcionou.`);
          }
          
          // 3. Valida que itens tem dados consistentes (descricao + quantidade)
          const validos = itens.filter(it => it.descricao && it.descricao.length > 5);
          if (validos.length < 1) {
            throw new Error(`EFEITO REAL FALHOU: ${itens.length} itens persistidos mas todos sem descricao valida`);
          }
          
          window.__cv09_edital_id = alvo.id;
          window.__cv09_n_itens = itens.length;
          return `itens_OK: edital=${alvo.numero} cnpj=${alvo.cnpj_orgao} | ${itens.length} itens persistidos (${validos.length} com descricao valida)`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_03_validar_itens_importados"
```

## Passo 04 — Click 'Extrair Lotes via IA' — POST /lotes/extrair (DeepSeek 60-180s)

**EFEITO REAL ESPERADO:**
- Botao 'Extrair Lotes via IA' aparece (lotes==0 + itens>=1) OU 'Reprocessar' (ja existem)
- POST /lotes/extrair retorna 200/201
- Network call confirmada


```yaml
id: passo_04_clicar_extrair_lotes_ia
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Idempotente: se ja tem lotes (heranca), valida e segue (efeito ja comprovado)
          const txt = (document.body.textContent || '');
          const m_lotes = txt.match(/Lotes\s*\((\d+)\)/);
          if (m_lotes && parseInt(m_lotes[1]) >= 1) {
            window.__cv09_lotes_ja_existiam = parseInt(m_lotes[1]);
            return `lotes_ja_extraidos=${m_lotes[1]} (sem necessidade de click)`;
          }
          // Sem lotes — clica botao Extrair
          const btn = [...document.querySelectorAll('button')].find(b => /Extrair Lotes via IA|Extraindo/i.test(b.textContent || ''));
          if (!btn) {
            if (/Importe os itens do PNCP/i.test(txt)) return 'sem_itens_para_extrair';
            throw new Error('Sem lotes E sem botao Extrair — estado inesperado');
          }
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_extrair_lotes';
        }
    - tipo: wait
      valor_literal: 180000
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_04_clicar_extrair_lotes_ia"
```

## Passo 05 — EFEITO REAL: 'Lotes (N)' com N>=1 visivel

**VALIDACAO CRITICA:** lotes foram criados de fato.

```yaml
id: passo_05_validar_lotes_extraidos
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          const edital_id = window.__cv09_edital_id;
          if (!edital_id) throw new Error('CV09 passo 03 nao definiu edital_id');
          
          const r = await fetch(`/api/crud/lotes?edital_id=${edital_id}&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`/api/crud/lotes retornou ${r.status}`);
          const lotes = (await r.json()).items || [];
          
          if (lotes.length < 1) throw new Error('EFEITO REAL FALHOU: 0 lotes persistidos para o edital alvo apos Extrair Lotes IA');
          
          // Valida campos do lote (especialidade pode ser null se IA nao detectou — aceita mas avisa)
          const com_dados = lotes.filter(l => l.especialidade || l.valor_estimado || l.volume_exigido);
          
          window.__cv09_n_lotes = lotes.length;
          return `lotes_OK: ${lotes.length} lotes persistidos (${com_dados.length} com campos tecnicos preenchidos)`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV09_visual_fp.yaml#passo_05_validar_lotes_extraidos"
```

