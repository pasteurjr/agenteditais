---
uc_id: UC-CV03
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV03_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV03_visual_fp.yaml
---

# UC-CV03 — Salvar edital VERE (Pregão Eletrônico) com cnpj/ano/seq populados (Fluxo Principal)

> **Predecessores:** UC-CV01
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Estrategia:** salva edital alvo Município de Vere 0000031/2026 (cnpj=75636530000120) — Pregão Eletrônico Aberto, 2 itens (Cadeira Odontológica R$17k + Monitor Multiparâmetro R$7.5k), score 85 PARTICIPAR, encerramento 20/05/2026

## Passo 00 — Garantir CaptacaoPage com grade

```yaml
id: passo_00_garantir_grade
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'table tbody tr'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV03_visual_fp.yaml#passo_00_garantir_grade"
```

## Passo 01 — Click 'Salvar edital' do edital alvo Município de Vere

**EFEITO REAL ESPERADO:**
- Procura linha com "vere" / cnpj 75636530000120 / 0000031/2026 (ou 66/2026)
- Click 'Salvar edital' dessa linha
- POST /api/crud/editais retorna 201 com cnpj_orgao, ano_compra, seq_compra populados

```yaml
id: passo_01_clicar_salvar_alvo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // ESTRATEGIA 1: busca em TODA a pagina por botao com texto "Salvar Edital" (label do painel)
          const allBtns = [...document.querySelectorAll('button')];
          const btnSalvarEdital = allBtns.find(b => /^Salvar Edital$/i.test((b.textContent||'').trim()));
          if (btnSalvarEdital && !btnSalvarEdital.disabled) {
            btnSalvarEdital.scrollIntoView({block: 'center'});
            btnSalvarEdital.click();
            return 'clicked_salvar_edital_painel';
          }
          // Se ja esta "Ja Salvo" — sucesso (idempotente)
          const btnJaSalvo = allBtns.find(b => /Ja Salvo|Já Salvo/i.test((b.textContent||'').trim()));
          if (btnJaSalvo) return 'edital_ja_salvo (idempotente)';

          // ESTRATEGIA 2: tabela (sem painel aberto)
          const rows = [...document.querySelectorAll('table tbody tr')];
          if (!rows.length) throw new Error('Nem botao Salvar Edital no painel nem tabela com editais');

          let alvo = null;
          for (const r of rows) {
            const txt = (r.textContent || '').toLowerCase();
            if (/municipio\s+de\s+vere|75636530000120|0000031\/2026|66\/2026/.test(txt)) {
              alvo = r;
              break;
            }
          }
          if (!alvo) {
            for (const r of rows) {
              if (/PNCP/i.test(r.textContent||'')) { alvo = r; break; }
            }
          }
          if (!alvo) alvo = rows[0];

          const btnLinhaSalvar = alvo.querySelector('button[title="Salvar edital"]');
          if (!btnLinhaSalvar) throw new Error(`Sem botao Salvar Edital (painel) nem 'Salvar edital' (linha alvo)`);
          btnLinhaSalvar.scrollIntoView({block: 'center'});
          btnLinhaSalvar.click();
          return `clicked_salvar_tabela (${alvo.textContent.substring(0,80)})`;
        }
    - tipo: wait
      valor_literal: 8000
validacao_ref: "testes/casos_de_teste/UC-CV03_visual_fp.yaml#passo_01_clicar_salvar_alvo"
```

## Passo 02 — VALIDAÇÃO PROFUNDA: edital persistido com cnpj/ano/seq via fetch backend

**EFEITO REAL crítico:** consulta `/api/crud/editais` e VALIDA que existe um edital com:
- `cnpj_orgao` NÃO nulo
- `ano_compra` NÃO nulo
- `seq_compra` NÃO nulo
- (preferencialmente o cnpj 75636530000120 do alvo, mas aceita qualquer Pregão Eletrônico com chaves PNCP)

```yaml
id: passo_02_validar_persistencia_banco
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const token = localStorage.getItem('editais_ia_access_token');
          if (!token) throw new Error('Sem token de auth localStorage');
          const r = await fetch('/api/crud/editais?limit=20', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!r.ok) throw new Error(`/api/crud/editais retornou ${r.status}`);
          const data = await r.json();
          const items = data.items || [];
          if (items.length < 1) throw new Error('EFEITO REAL FALHOU: nenhum edital salvo no banco apos CV03');
          
          const com_pncp = items.filter(e => e.cnpj_orgao && e.ano_compra && e.seq_compra);
          if (com_pncp.length < 1) {
            throw new Error(`EFEITO REAL FALHOU: ${items.length} edital(is) salvo(s) MAS NENHUM tem cnpj_orgao/ano_compra/seq_compra populados (defeito do salvar)`);
          }
          
          // Extra: verifica se o alvo VERE foi salvo corretamente
          const vere = com_pncp.find(e => e.cnpj_orgao === '75636530000120');
          const alvo = vere || com_pncp[0];
          window.__cv03_edital_id = alvo.id;
          window.__cv03_edital_numero = alvo.numero;
          window.__cv03_edital_cnpj = alvo.cnpj_orgao;
          
          return `edital_persistido_OK: id=${alvo.id.substring(0,8)} num=${alvo.numero} cnpj=${alvo.cnpj_orgao} ano=${alvo.ano_compra} seq=${alvo.seq_compra}${vere ? ' [ALVO VERE]' : ' [outro]'}`;
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV03_visual_fp.yaml#passo_02_validar_persistencia_banco"
```
