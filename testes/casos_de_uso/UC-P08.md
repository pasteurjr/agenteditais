---
uc_id: UC-P08
nome: "Definir Estrategia Competitiva"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 916
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-P08 — Definir Estrategia Competitiva

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 916).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-11

**Regras de Negocio aplicaveis:**
- Presentes: RN-102, RN-106
- Faltantes: RN-124 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-102, RN-106, RN-124 [FALTANTE->V4] — adicionalmente: RN-084 (cooldown 60s DeepSeek por empresa), RN-132 (audit de invocacoes DeepSeek), RN-037 (audit log universal de estrategia) — modo warn-only por padrao (`ENFORCE_RN_VALIDATORS=false`).

**Ator:** Usuario

### Pre-condicoes
1. Lances configurados (UC-P07)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P07**


### Pos-condicoes
1. Perfil de estrategia definido (Quero Ganhar / Nao Ganhei no Minimo)
2. Cenarios simulados e salvos

### Sequencia de eventos
1. Na [Aba: "Lances"], apos salvar lances, usuario localiza o [Card: "Estrategia Competitiva"]. [ref: Passo 1]
2. Usuario le as descricoes dos 2 perfis no [Secao: "Explicacao"]. [ref: Passo 2]
3. Se ha dados historicos, sistema exibe [Secao: "Insight"] com faixa de preco recomendada. [ref: Passo 3]
4. Usuario seleciona perfil clicando no [Radio: "QUERO GANHAR"] ou [Radio: "NAO GANHEI NO MINIMO"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Analise de Lances"] para gerar cenarios de simulacao. [ref: Passo 5]
6. Sistema exibe [Secao: "Simulacoes (N cenarios)"] com cards de cenario mostrando valor e margem. [ref: Passo 6]
7. Usuario pode clicar no [Botao: "Analise por IA"] para gerar explicacao detalhada via `POST /api/precificacao/simular-ia`. [ref: Passo 7]
8. Sistema exibe [Secao: "Analise IA dos Cenarios"] com markdown detalhado e [Botao: "Relatorio MD/PDF"]. [ref: Passo 8]
9. Usuario pode clicar no [Botao: "Simulador de Disputa"] para simular pregao eletronico via `POST /api/precificacao/simular-disputa`. [ref: Passo 9]
10. Sistema exibe [Secao: "Simulacao de Disputa"] com markdown e [Botao: "Relatorio MD/PDF"]. [ref: Passo 10]

### Fluxos Alternativos (V5)

**FA-01 — Perfil "Nao Ganhei no Minimo" (pos-derrota):**
1. No passo 4, usuario seleciona "NAO GANHEI NO MINIMO".
2. Sistema exibe campos adicionais: preco vencedor observado, diferenca vs lance minimo, recomendacao IA.
3. Dados sao registrados para historico e ajuste de estrategia futura.

**FA-02 — Simulacao com cenarios pre-calculados:**
1. No passo 5, o sistema gera automaticamente 4 cenarios (Conservador, Moderado, Agressivo, Limite).
2. Cada cenario mostra desconto (%), valor do lance (R$), margem (%) e probabilidade estimada.
3. Usuario pode ajustar o slider de desconto para simular cenarios personalizados.

**FA-03 — Inclusao de justificativa textual na estrategia:**
1. Apos selecionar o perfil, usuario preenche campo de justificativa textual.
2. A justificativa e salva junto com a estrategia para auditoria.

### Fluxos de Excecao (V5)

**FE-01 — Cenario com margem negativa:**
1. No passo 6, algum cenario de simulacao resulta em margem negativa.
2. Sistema exibe [Alerta: "Cenarios com margem negativa indicam prejuizo"] em vermelho.
3. O cenario nao e bloqueado, mas e sinalizado visualmente.

**FE-02 — Timeout da Analise por IA (> 120 segundos):**
1. No passo 7, a chamada `POST /api/precificacao/simular-ia` nao retorna em 120 segundos.
2. Sistema exibe toast de erro: "Timeout na analise IA. Tente novamente."

**FE-03 — Cooldown DeepSeek ativo (RN-084):**
1. No passo 7 ou 9, usuario tenta executar analise IA dentro de 60 segundos de outra chamada.
2. Sistema exibe toast: "Aguarde 60 segundos entre chamadas de IA."

**FE-04 — Sem dados historicos para insight:**
1. No passo 3, nao ha dados historicos para o produto/segmento.
2. A secao "Insight" nao e exibida.
3. O sistema gera cenarios baseados apenas nas camadas A-E definidas.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 3 (Lances) — Card Estrategia Competitiva

#### Layout da Tela

[Card: "Estrategia Competitiva"] icon Shield [ref: Passo 1]
  [Secao: "Explicacao"] — grid 2 colunas [ref: Passo 2]
    [Texto: "QUERO GANHAR"] — descricao: lances agressivos ate valor minimo
    [Texto: "NAO GANHEI NO MINIMO"] — descricao: reposicionamento para melhor colocacao
  [Secao: "Insight"] — visivel se dados historicos [ref: Passo 3]
    [Texto: "Com base no historico, lance entre X e Y tem maior chance de vitoria"]
  [Secao: "Selecao de Perfil"]
    [Radio: "QUERO GANHAR"] — card selecionavel, borda verde [ref: Passo 4]
    [Radio: "NAO GANHEI NO MINIMO"] — card selecionavel, borda amarela [ref: Passo 4]
  [Secao: "Acoes"]
    [Botao: "Analise de Lances"] icon TrendingUp [ref: Passo 5]
    [Botao: "Analise por IA"] icon Sparkles [ref: Passo 7]
    [Botao: "Simulador de Disputa"] icon Target [ref: Passo 9]
  [Secao: "Simulacoes (N cenarios)"] — visivel apos simulacao [ref: Passo 6]
    [Card: "Cenario 1"] — valor + margem
    [Card: "Cenario 2"] ...
    [Card: "Cenario N"] ...
    [Alerta: "Cenarios com margem negativa indicam prejuizo"] — vermelho, condicional
    [Botao: "Limpar"]
  [Secao: "Analise IA dos Cenarios"] — visivel apos IA [ref: Passo 8]
    [Texto: "Markdown renderizado"]
    [Botao: "Relatorio MD/PDF"] icon FileText
  [Secao: "Simulacao de Disputa"] — visivel apos simulacao [ref: Passo 10]
    [Texto: "Markdown renderizado"]
    [Botao: "Relatorio MD/PDF"] icon FileText

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Estrategia Competitiva"] | 1 |
| [Secao: "Explicacao"] — 2 perfis | 2 |
| [Secao: "Insight"] | 3 |
| [Radio: "QUERO GANHAR"] / [Radio: "NAO GANHEI NO MINIMO"] | 4 |
| [Botao: "Analise de Lances"] | 5 |
| [Secao: "Simulacoes"] — cards de cenario | 6 |
| [Botao: "Analise por IA"] | 7 |
| [Secao: "Analise IA dos Cenarios"] | 8 |
| [Botao: "Simulador de Disputa"] | 9 |
| [Secao: "Simulacao de Disputa"] | 10 |

### Implementacao atual
**IMPLEMENTADO**

---
