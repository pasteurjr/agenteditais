---
uc_id: UC-LA02
nome: "Sugestao de Lance em Tempo Real"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 298
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA02 — Sugestao de Lance em Tempo Real

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 298).
> Sprint origem: **Sprint 9**.

---

**Tipo:** NOVO — tool registrada + componente na sala virtual (UC-LA03)
**Relacao com existente:** Complementa `tool_estrategia_competitiva` (Sprint 3, UC-P08) que gera cenarios PRE-sessao. Este UC gera sugestoes DURANTE a sessao com dados do momento.

**RNs aplicadas:** RN-099 (lance < lance_anterior), RN-100 (lance < custo warning), RN-101 (sugestao = custo*1.10), RN-106 (perfis), RN-084 (cooldown), RN-132 (audit invocacao)

**RF relacionado:** RF-042 (Disputas/Lances)
**Ator:** Sistema (automatico) + Usuario (aceita/rejeita sugestao)

### Pre-condicoes
1. Sala virtual ativa (UC-LA03) com sessao em andamento
2. Perfil competitivo configurado (quero_ganhar/nao_ganhei_minimo)
3. Camadas D (lance_inicial) e E (lance_minimo) configuradas
4. Custo base (Camada A) disponivel

### Pos-condicoes
1. Sugestao de lance exibida no card da sala virtual
2. Se aceita: lance registrado no modelo Lance com tipo=decremento
3. Audit log de cada invocacao da tool (RN-132)

### Sequencia de Eventos

1. Sistema detecta novo lance de concorrente (via polling ou WebSocket da sala virtual)
2. Se empresa NAO esta em 1a posicao: sistema invoca `tool_sugerir_lance` automaticamente
3. Tool recebe inputs (todos lidos das Camadas da Sprint 3 — nenhum precisa ser digitado na hora):
   - `lance_lider`: valor do lance atual do lider (capturado do portal via polling)
   - `nosso_ultimo`: nosso lance mais recente na sessao (registrado no modelo Lance)
   - `custo_base`: **PrecoCamada.custo_base_final (Camada A, UC-P04)** — usado como alarme de prejuizo
   - `lance_minimo`: **PrecoCamada.lance_minimo (Camada E, UC-P07)** — piso configurado, freio do robo
   - `lance_inicial`: **PrecoCamada.lance_inicial (Camada D, UC-P07)** — referencia do valor de entrada
   - `target_referencia`: **PrecoCamada.target_referencia (Camada C, UC-P06)** — teto maximo
   - `perfil`: **EstrategiaEdital.perfil_competitivo (UC-P08)** — quero_ganhar ou nao_ganhei_minimo
   - `historico_sessao`: array de todos os lances da sessao corrente (rodada, empresa, valor)
   - `decremento_medio`: media de decrementos observados dos concorrentes na sessao
   - `historico_precos`: **PrecoCamada.preco_medio_historico (Camada F, UC-P09)** — referencia de mercado
4. Tool calcula sugestao conforme perfil (RN-106):
   - **quero_ganhar:** `lance_sugerido = lance_lider - decremento_medio_sessao`, limitado a lance_minimo (Camada E)
   - **nao_ganhei_minimo:** `lance_sugerido = lance_lider - decremento_minimo_sessao`, posicao alvo 2a/3a
5. Tool retorna:
   - `lance_sugerido`: valor em R$
   - `margem_sobre_custo`: ((lance_sugerido - custo_base) / custo_base) * 100 (RN-102)
   - `posicao_estimada`: 1o / 2o / 3o
   - `confianca`: alta (margem > 15%) / media (5-15%) / baixa (< 5%)
   - `justificativa`: texto curto explicando a logica
   - `abaixo_custo`: boolean — true se lance < custo_base (RN-100)
6. [Card: "Sugestao da IA"] na sala virtual exibe:
   - Valor sugerido em destaque (R$ 412,50)
   - Margem: 18.2% sobre custo
   - Posicao estimada: 1o
   - Confianca: [Badge: "Alta" verde]
   - Justificativa: "Decremento de R$ 7,50 sobre lance lider. Margem segura acima do minimo."
   - Se abaixo_custo: [Banner vermelho: "ATENCAO: Lance abaixo do custo! Margem: -3.2%"]
7. [Botao: "Aceitar e Enviar"] — envia o lance (UC-LA03 passo de envio)
8. [Botao: "Ajustar"] — abre input para usuario modificar o valor antes de enviar
9. [Botao: "Ignorar"] — descarta a sugestao
10. Se lance_sugerido <= lance_minimo (Camada E): card exibe [Banner amarelo: "Limite minimo atingido — proximo lance sera abaixo do piso configurado"]
11. Sugestao atualizada a cada novo lance de concorrente (nao a cada polling vazio)

### Tela(s) Representativa(s)

**Pagina:** LancesPage (`/app/lances`) — dentro da sala virtual (UC-LA03)
**Posicao:** Card lateral direito

#### Layout do Card de Sugestao

```
+--- Sugestao da IA ---+
| Perfil: quero_ganhar  |
|                       |
|  Lance Sugerido       |
|  R$ 412,50            |
|                       |
| Margem: 18.2%         |
| Posicao: 1o  [Alta]   |
|                       |
| "Decremento de R$ 7,50|
|  sobre lance lider.   |
|  Margem segura."      |
|                       |
| [Aceitar e Enviar]    |
| [Ajustar] [Ignorar]  |
+-----------------------+
```

### Excecoes
- **E1:** Ja em 1a posicao — card exibe: "Voce esta na lideranca. Nenhuma acao necessaria."
- **E2:** Lance sugerido < lance_minimo — card exibe: "Limite atingido. Considere nao_ganhei_minimo ou aceite a posicao."
- **E3:** Cooldown DeepSeek ativo (RN-084) — usa calculo local sem IA: `lance_lider - 1% do lance_lider`

---
