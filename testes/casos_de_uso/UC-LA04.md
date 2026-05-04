---
uc_id: UC-LA04
nome: "Lance Aberto + Fechado (EXPANSAO — Sala Virtual)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 515
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA04 — Lance Aberto + Fechado (EXPANSAO — Sala Virtual)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 515).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO do componente sala virtual (UC-LA03)
**O que JA EXISTE:** Sala virtual (UC-LA03) opera por default em modo "Lance Aberto". Este UC ADICIONA suporte ao modo hibrido (aberto + fechado) conforme Art. 56 da Lei 14.133/2021.

**RNs aplicadas:** RN-099, RN-100, RN-106 (perfis), RN-037 (audit)

**RF relacionado:** RF-042-02 (Lance Aberto + Fechado)
**Ator:** Usuario (Operador de Lances)

### Pre-condicoes
1. Sala virtual ativa (UC-LA03)
2. Modalidade do edital identificada como "aberto_fechado" (deteccao automatica ou manual)
3. Perfil competitivo configurado

### Pos-condicoes
1. Sala virtual opera nas duas fases (aberta → fechada)
2. Lance fechado registrado com tipo=decremento e flag `fase=fechada`
3. Resultado revelado apos abertura dos lances fechados

### Sequencia de Eventos

1. Ao entrar na sala (UC-LA03), sistema detecta modalidade do edital:
   - Busca no texto do edital: regex para "aberto e fechado", "modo aberto/fechado", "Art. 56 §1o"
   - Se nao detectado: LLM analisa clausulas de disputa e retorna modalidade
   - Se ainda indefinido: exibe [Select: "Modalidade"] para usuario configurar manualmente
2. [Badge: "Modalidade"] no cabecalho exibe: [Verde: "Lance Aberto"] ou [Azul: "Aberto + Fechado"]
3. **FASE ABERTA** (se modo aberto+fechado):
   - Identica ao UC-LA03 — timer 2min, lances visiveis, sugestao IA reativa
   - Indicador adicional: [Badge: "Fase Aberta — Faltam ~X rodadas para fase fechada"]
   - Ao encerrar fase aberta (timer expira sem novo lance): sistema exibe [Banner: "Fase aberta encerrada. Preparando lance fechado."]
4. **TRANSICAO** automatica para fase fechada:
   - Interface muda: historico de lances congela (nao recebe mais atualizacoes)
   - Timer muda para 5:00 minutos
   - Card de sugestao muda: IA calcula lance fechado otimo
5. **FASE FECHADA:**
   - [Card: "Lance Fechado"] exibe:
     - [Label: "Seu melhor lance na fase aberta"] R$ XXX
     - [Label: "Posicao na fase aberta"] Xo
     - [NumberInput: "Lance Fechado Final"] — pre-preenchido com sugestao da IA
     - [Label: "Margem sobre custo"] atualiza em tempo real
     - [Botao: "Enviar Lance Fechado"] — envio unico, irreversivel
   - [Card: "Sugestao IA — Modo Fechado"] exibe:
     - Logica distinta: estima valores que concorrentes provavelmente darao (baseado em padroes de decremento da fase aberta)
     - Sugere lance que maximize probabilidade de vitoria com margem aceitavel
     - Texto: "Estimativa: concorrentes darao lance fechado ~R$ 395-410. Sugestao: R$ 392,00 (margem 15.1%, posicao estimada 1o)"
6. Apos envio do lance fechado: [Banner: "Lance fechado enviado. Aguardando abertura dos envelopes."]
7. Ao revelar resultados: [Modal: "Resultado do Lance Fechado"]:
   - Tabela com todos os lances fechados (empresa, valor, posicao)
   - Resultado final: VITORIA / DERROTA
   - Comparativo: nosso lance vs vencedor

### Tela(s) Representativa(s)

**Pagina:** LancesPage (`/app/lances`) — sala virtual
**Posicao:** Mesmo layout do UC-LA03, com adaptacoes para fase fechada

#### Layout — Fase Fechada

```
+---------------------------------------------------------------+
|  Sala Virtual — FASE FECHADA              Modalidade: [A+F]    |
|  Timer: 03:42  [VERDE]                                        |
|                                                               |
|  +--- Lance Fechado ---+  +--- Sugestao IA (Fechado) -------+|
|  | Melhor lance aberto:|  | Estimativa concorrentes:         ||
|  | R$ 420,00 (2o)      |  | R$ 395-410                       ||
|  |                     |  |                                   ||
|  | Lance Final:        |  | Sugestao: R$ 392,00              ||
|  | [R$ 392,00]         |  | Margem: 15.1%                    ||
|  | Margem: 15.1%       |  | Pos. estimada: 1o                ||
|  |                     |  | Confianca: [Media]               ||
|  | [Enviar Lance       |  |                                   ||
|  |  Fechado]           |  | "Lance conservador que supera     ||
|  |                     |  |  estimativa inferior do range."   ||
|  +---------------------+  +----------------------------------+|
+---------------------------------------------------------------+
```

### Excecoes
- **E1:** Modalidade nao detectada automaticamente — select manual obrigatorio antes de iniciar
- **E2:** Timer de fase fechada expira sem envio — sistema envia lance = melhor lance da fase aberta (fallback)
- **E3:** Portal nao suporta API para fase fechada — usuario envia manualmente no portal e registra resultado na sala

---
