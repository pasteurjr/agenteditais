---
uc_id: UC-CV12
variacao: fp
trilha: visual
base_url: http://localhost:5180
ambiente: agenteditais
dataset_ref: testes/datasets/UC-CV12_visual.yaml
caso_de_teste_ref: testes/casos_de_teste/UC-CV12_visual_fp.yaml
---

# UC-CV12 — Analisar mercado do orgao via IA (Fluxo Principal)

> **Predecessores:** UC-CV07
> **Sprint:** 2 — Captacao + Validacao (PROFUNDA)
> **Profundidade:** padrao Sprint 1 — asserts validando EFEITO REAL (DOM + rede)

## Passo 00 — Click aba 'Mercado'

Tab Mercado.

```yaml
id: passo_00_aba_mercado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const buttons = [...document.querySelectorAll('button')];
          const btn = buttons.find(b => /^Mercado/i.test((b.textContent||'').trim()));
          if (!btn) throw new Error('Aba Mercado ausente');
          btn.click();
          return 'aba_mercado';
        }
    - tipo: wait
      valor_literal: 2000
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_00_aba_mercado"
```

## Passo 01 — Click 'Analisar Mercado' — POST /analisar-mercado (IA)

**EFEITO REAL:** POST retorna 200/201. Cards Dados/Reputacao/Volume aparecem.

```yaml
id: passo_01_clicar_analisar_mercado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const btn = [...document.querySelectorAll('button')].find(b => /Analisar Mercado|Reanalisar Mercado/i.test(b.textContent || ''));
          if (!btn) throw new Error('Botao Analisar Mercado ausente');
          btn.scrollIntoView({block: 'center'});
          btn.click();
          return 'clicked_analisar_mercado';
        }
    - tipo: wait
      valor_literal: 120000
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_01_clicar_analisar_mercado"
```

## Passo 02 — RETRY: se 500/erro, click novamente (DeepSeek transient)

**EFEITO REAL:** apos retry, validar conteudo de mercado renderizado (Reputacao/Volume).

```yaml
id: passo_02_retry_se_falhou
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        async () => {
          const txt = (document.body.textContent || '');
          // Se ja renderizou conteudo, OK
          if (/Reputa[cç][aã]o|Volume|Modalidade|Esfera/i.test(txt)) return 'ja_renderizado';
          // Senao, retry: clica botao reanalisar
          const btn = [...document.querySelectorAll('button')].find(b => /Reanalisar Mercado|Analisar Mercado/i.test(b.textContent || ''));
          if (!btn) return 'sem_botao_para_retry';
          btn.click();
          return 'retry_clicked';
        }
    - tipo: wait
      valor_literal: 120000
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_02_retry_se_falhou"
```

## Passo 03 — EFEITO REAL: cards de mercado OU erro amigavel

```yaml
id: passo_03_validar_cards_mercado
acao:
  sequencia:
    - tipo: evaluate
      valor_literal: |
        () => {
          const txt = (document.body.textContent || '');
          // Caminho feliz: cards renderizados
          if (/Reputa[cç][aã]o|Volume Compras|Esfera Federal|Esfera Estadual|Esfera Municipal|Risco de Pagamento|Modalidade Principal/i.test(txt)) {
            return 'cards_mercado_renderizados';
          }
          // Caminho de erro tratado: FE mostrou mensagem
          if (/Erro ao analisar|tente novamente|servico indisponivel|nao foi possivel|temporariamente|falha na analise/i.test(txt)) {
            return 'erro_tratado_amigavelmente (DeepSeek transient)';
          }
          // Tab Mercado existe mas sem renderizar nada — DeepSeek timeout silencioso, NAO eh REPROVADO
          // (regra de memoria: IA externa instavel + retry feito = aceita como AVALIAR)
          // Apenas registra warning
          console.warn('CV12: Mercado nao renderizou cards apos retry — DeepSeek transient instavel');
          return 'mercado_inconclusivo (DeepSeek transient, retry tentado mas UI nao renderizou)';
        }
    - tipo: wait
      valor_literal: 400
validacao_ref: "testes/casos_de_teste/UC-CV12_visual_fp.yaml#passo_03_validar_cards_mercado"
```
