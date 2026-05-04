---
uc_id: UC-LA01
nome: "Simulador de Lance Deterministico (EXPANSAO — PrecificacaoPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 180
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA01 — Simulador de Lance Deterministico (EXPANSAO — PrecificacaoPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 180).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `PrecificacaoPage.tsx`
**UCs estendidos:** UC-P07 (Sprint 3 — Estruturar Lances D/E), UC-P08 (Sprint 3 — Estrategia Competitiva). O simulador existente (`/api/precificacao/simular-disputa`) usa DeepSeek para narrativa. Este UC ADICIONA simulacao deterministica baseada em padroes historicos de decremento.
**O que JA EXISTE:** PrecificacaoPage com tab Lances (Camadas D/E via `tool_estruturar_lances`), tab Estrategia (via `tool_estrategia_competitiva` com perfis quero_ganhar/nao_ganhei_minimo e 3 cenarios cada), simulador de disputa via endpoint `/api/precificacao/simular-disputa` que usa DeepSeek. Modelo `Lance` com tipos inicial/decremento/minimo/simulacao. Endpoints: `POST /api/precificacao/<eip_id>/lances`, `POST /api/precificacao/<edital_id>/estrategia`, `POST /api/precificacao/simular-disputa`. Arquivo: `frontend/src/pages/PrecificacaoPage.tsx`.

**RNs aplicadas:** RN-098 (cascata A→E), RN-099 (lance_min < lance_inicial), RN-102 (margem padronizada), RN-106 (perfis quero_ganhar/nao_ganhei_minimo), RN-084 (cooldown DeepSeek), RN-037 (audit)

**RF relacionado:** RF-042 (Disputas/Lances)
**Ator:** Usuario (Analista Comercial, Gestor de Licitacoes)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital selecionado com pelo menos 1 item vinculado a produto
3. Camadas A-E configuradas para o item (RN-098)
4. Historico de editais similares existe (PNCP ou interno)

### Pos-condicoes
1. Simulacao deterministica executada com N rodadas
2. Resultado exibido em tabela e grafico
3. Registros de simulacao gravados com tipo=simulacao no modelo Lance
4. Audit log registrado (RN-037)

### Sequencia de Eventos

1. Usuario acessa PrecificacaoPage (`/app/precificacao`) e seleciona edital + item
2. Usuario navega para tab "Estrategia" (JA EXISTE)
3. **NOVO:** [Secao: "Simulador Deterministico"] abaixo dos cenarios existentes (UC-P08)
4. [Card: "Parametros da Simulacao"] exibe:
   - [NumberInput: "Numero de Rodadas"] (default: 10, min: 3, max: 30)
   - [Select: "Tipo de Decremento"] (fixo_reais / percentual_ultimo)
   - [NumberInput: "Valor do Decremento"] (R$ ou %, conforme tipo)
   - [NumberInput: "Concorrentes Simulados"] (1 a 5, default: 3)
   - [Select: "Origem dos Concorrentes"] (manual / historico_pncp)
   - Se "manual": [TextInput] para valor_inicial de cada concorrente
   - Se "historico_pncp": sistema busca precos de editais similares (NCM, faixa valor, UF)
   - [Select: "Perfil"] (quero_ganhar / nao_ganhei_minimo) — pre-preenchido do EstrategiaEdital (RN-106)
5. [Botao: "Simular"] invoca `tool_simular_lance` com parametros
6. Sistema executa simulacao deterministica:
   - Rodada 1: valores iniciais de todos os participantes
   - Rodada N: cada concorrente decrementa conforme padrao historico (media de decrementos do PNCP)
   - Nossa empresa decrementa conforme perfil: quero_ganhar (decremento agressivo, limitado a Camada E) / nao_ganhei_minimo (decremento conservador, para 2a/3a posicao)
   - Encerra quando: rodadas esgotadas OU todos atingiram limite OU timer expira
7. [Card: "Resultado da Simulacao"] exibe:
   - [DataTable]: Rodada | Nosso Lance | Concorrente 1..N | Posicao | Margem (%)
   - [Grafico: "Convergencia de Lances"] — line chart com valor por rodada, uma linha por participante
   - [Stat Cards: 3]: Resultado Final (Vitoria/Derrota/2o lugar), Margem Final sobre Custo (%), Rodada Decisiva
8. [Botao: "Exportar Simulacao"] gera CSV com a tabela
9. [Botao: "Aplicar como Estrategia"] salva os valores de lance_inicial e lance_minimo resultantes em EstrategiaEdital.cenarios_simulados
10. Sistema grava registros de simulacao com tipo=simulacao no modelo Lance
11. Diferenca documentada: "Simulador IA (existente): narrativa gerada por DeepSeek. Simulador Deterministico (novo): calculo algoritmico baseado em padroes de decremento historico."

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Tab "Estrategia" — secao nova abaixo dos cenarios existentes

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Precificacao > [Edital XYZ] > Item 1                         |
|                                                               |
|  [A Custos][B Base][C Ref.][D/E Lances][F Hist.][Estrategia] |
|                                                               |
|  === CENARIOS EXISTENTES (Sprint 3, UC-P08) ===               |
|  Perfil: [quero_ganhar v]                                     |
|  Cenario 1: R$ 450 (margem 32%)  ...                          |
|  Cenario 2: R$ 420 (margem 23%)  ...                          |
|  Cenario 3: R$ 395 (margem 16%)  ...                          |
|  [Simular Disputa (IA)]  — ja existe                          |
|                                                               |
|  === SIMULADOR DETERMINISTICO (NOVO) ===                      |
|                                                               |
|  +--- Parametros da Simulacao ---+                            |
|  | Rodadas: [10]  Decremento: [fixo_reais v] [R$ 5,00]       |
|  | Concorrentes: [3]  Origem: [historico_pncp v]              |
|  | Perfil: [quero_ganhar v]                                   |
|  | [Simular]                                                  |
|  +-------------------------------+                            |
|                                                               |
|  +--- Resultado ---+                                          |
|  |Rod.|Nosso |Conc.1|Conc.2|Conc.3|Pos.|Margem|              |
|  | 1  |R$ 500|R$ 510|R$ 480|R$ 495|  2 | 47%  |              |
|  | 2  |R$ 490|R$ 505|R$ 475|R$ 490|  2 | 44%  |              |
|  | ...                                                        |
|  |10  |R$ 410|R$ 430|R$ 420|R$ 415|  1 | 20%  |              |
|  +-----------------------------------------------------------+|
|                                                               |
|  +--- Convergencia de Lances (line chart) ---+                |
|  |  ___                                      |                |
|  | /   \___  Conc.1                          |                |
|  |/        \___  Nosso                       |                |
|  |             \___  Conc.3                  |                |
|  +-------------------------------------------+                |
|                                                               |
|  +---------+  +---------+  +---------+                        |
|  |Resultado|  |Margem   |  |Rodada   |                        |
|  |VITORIA  |  |Final    |  |Decisiva |                        |
|  |  1o     |  | 20.3%   |  |   7     |                        |
|  +---------+  +---------+  +---------+                        |
|                                                               |
|  [Exportar CSV]  [Aplicar como Estrategia]                    |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Preenchidos (input):** Rodadas, Tipo Decremento, Valor Decremento, Concorrentes, Origem, Perfil
- **Obtidos (resposta):** Tabela de rodadas, Grafico de convergencia, Stat cards resultado
- **Acoes:** Simular, Exportar CSV, Aplicar como Estrategia

### Excecoes
- **E1:** Camadas A-E nao configuradas — toast: "Configure as Camadas A-E antes de simular (RN-098)"
- **E2:** Sem historico PNCP para NCM/regiao — fallback para concorrentes manuais com aviso
- **E3:** Lance minimo resultante < custo_base — stat card mostra warning vermelho (RN-100)

---
