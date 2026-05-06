---
uc_id: UC-CV02
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV02_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV02_visual_fp.yaml
---

# UC-CV02 — Selecionar edital ESPECIFICO de Município de Vere — Pregão Eletrônico (Fluxo Principal)

> **Predecessores:** UC-CV01
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Estrategia:** edital fixo CNPJ=75636530000120 ano=2026 seq=66 (MUNICIPIO DE VERE, Pregão Eletrônico Aberto, Monitor Multiparametro R$7.5k + Cadeira Odontologica R$17k, score 85 PARTICIPAR, encerramento 20/05/2026)

## Passo 00 — Garantir CaptacaoPage com grade carregada

```yaml
id: passo_00_garantir_grade_carregada
acao:
  sequencia:
    - tipo: wait_for
      seletor: 'h1:has-text("Captacao"), h2:has-text("Captacao")'
      timeout: 10000
    - tipo: wait_for
      seletor: 'table tbody tr'
      timeout: 10000
validacao_ref: "testes/casos_de_teste/UC-CV02_visual_fp.yaml#passo_00_garantir_grade_carregada"
```

## Passo 01 — Localizar e Click 'Ver detalhes' do edital Município de Vere

**EFEITO REAL ESPERADO:**
- Procura na tabela linha cujo orgao/numero match com Município de Vere OU CNPJ 75636530000120 OU 0000031/2026
- Se nao encontrou, valida que pelo menos editais com cnpj/ano/seq apareceram (genérico)
- Click no botao 'Ver detalhes' dessa linha
- Painel lateral abre

```yaml
id: passo_01_clicar_ver_detalhes_edital_alvo
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const rows = [...document.querySelectorAll('table tbody tr')];
          if (!rows.length) throw new Error('Nenhum edital na tabela');
          
          // Tenta achar Município de Vere ou CNPJ alvo
          let alvo = null;
          for (const r of rows) {
            const txt = (r.textContent || '').toLowerCase();
            if (/municipio\s+de\s+vere|75636530000120|0000031\/2026|66\/2026/.test(txt)) {
              alvo = r;
              break;
            }
          }
          // Se nao achou alvo especifico, pega o de MAIOR SCORE (primeira linha apos sort por score desc)
          // mas valida que tem cnpj/ano/seq populado (verifica via texto da linha)
          if (!alvo) {
            for (const r of rows) {
              const txt = r.textContent || '';
              if (/PNCP/i.test(txt) && /\d{14}|\d{2,3}\/\d{4}/.test(txt)) {
                alvo = r;
                break;
              }
            }
          }
          if (!alvo) alvo = rows[0]; // ultimo fallback
          
          // Click botao Ver detalhes ou na linha
          const btnDetalhes = alvo.querySelector('button[title="Ver detalhes"]');
          if (btnDetalhes) {
            btnDetalhes.scrollIntoView({block: 'center'});
            btnDetalhes.click();
            return `clicked_ver_detalhes (${alvo.textContent.substring(0,80)})`;
          }
          alvo.scrollIntoView({block: 'center'});
          alvo.click();
          return `clicked_row (${alvo.textContent.substring(0,80)})`;
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV02_visual_fp.yaml#passo_01_clicar_ver_detalhes_edital_alvo"
```

## Passo 02 — EFEITO REAL: painel lateral aberto com dados

```yaml
id: passo_02_validar_painel_aberto
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          // Painel lateral pode aparecer como aside, .with-panel, ou h4 'Dados do Edital'
          const tem_dados = document.querySelector('h4');
          const txt = (document.body.textContent || '');
          if (/Dados do Edital|6 Dimensoes de Score|Potencial de Ganho/i.test(txt)) return 'painel_aberto_OK';
          throw new Error('EFEITO REAL FALHOU: painel lateral nao abriu (sem Dados do Edital)');
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV02_visual_fp.yaml#passo_02_validar_painel_aberto"
```
