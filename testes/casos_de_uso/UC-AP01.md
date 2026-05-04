---
uc_id: UC-AP01
nome: "Consultar Feedbacks Registrados"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 832
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AP01 — Consultar Feedbacks Registrados

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 832).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-037 (audit log), RN-NEW-05 (aceite explicito)

**RF relacionado:** RF-055 (Aprendizado Continuo)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Model `AprendizadoFeedback` tem registros (via resultados Sprint 5, ajustes Sprint 6)

### Pos-condicoes
1. Usuario visualiza todos os feedbacks que alimentam a base de conhecimento da IA

### Sequencia de Eventos

1. Usuario acessa AprendizadoPage (`/app/aprendizado`) via menu lateral "Indicadores > Aprendizado"
2. [Cabecalho: "Pipeline de Aprendizado"] exibe titulo com subtitulo "Feedbacks, Sugestoes e Padroes"
3. [Secao: Abas] mostra 3 tabs: Feedbacks (default), Sugestoes, Padroes
4. Na [Aba: "Feedbacks"], [Card: "Stat Cards — grid 4"] exibe: Total Feedbacks, Aplicados (qtd com `aplicado=true`), Pendentes (nao aplicados), Taxa de Adocao (%)
5. [Card: "Filtros"] permite: [Select: "Tipo"] (Todos/resultado_edital/score_ajustado/preco_ajustado/feedback_usuario), [Select: "Periodo"], [Select: "Entidade"]
6. [Card: "Feedbacks Registrados"] DataTable: Data, Tipo, Entidade, Resumo (dados_entrada resumido), Resultado (resultado_real resumido), Delta, Aplicado (badge), Acao
7. Coluna "Acao": [Botao: "Ver Detalhe"] abre [Modal: "Detalhe do Feedback"]
8. Modal mostra: JSON completo de `dados_entrada`, `resultado_real`, `delta`, metadados (user, timestamp)
9. [Badge: "Aplicado"] (verde) ou [Badge: "Pendente"] (cinza) — indica se a IA ja usou este feedback
10. [Botao: "Registrar Feedback Manual"] abre modal para registrar um feedback explicito do usuario

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage (`/app/aprendizado`)
**Posicao:** Aba "Feedbacks"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Pipeline de Aprendizado                                      |
|  Feedbacks, Sugestoes e Padroes                               |
|                                                               |
|  +---------+  +----------+  +-------+                         |
|  |Feedbacks|  |Sugestoes |  |Padroes|                         |
|  +---------+  +----------+  +-------+                         |
|                                                               |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|  |Total      |  |Aplicados  |  |Pendentes  |  |Taxa de    |   |
|  |Feedbacks  |  |           |  |           |  |Adocao     |   |
|  |   128     |  |    42     |  |    86     |  |  32.8%    |   |
|  +-----------+  +-----------+  +-----------+  +-----------+   |
|                                                               |
|  [Filtros] Tipo: [Todos v]  Periodo: [6m v]                  |
|  Entidade: [Todos v]              [Registrar Feedback Manual] |
|                                                               |
|  +---- Feedbacks Registrados -------+                         |
|  |Data    |Tipo           |Entidade |Resumo      |Aplic|Acao| |
|  |14/04   |resultado_     |Edital   |Score: 72   |[✓]  |[De]| |
|  |        |edital         |PE 2034  |Ganhou      |     |    | |
|  |12/04   |score_ajustado |Parametro|Peso tec:   |[ ]  |[De]| |
|  |        |               |Score    |0.4→0.6     |     |    | |
|  |10/04   |preco_ajustado |Produto  |Margem:     |[✓]  |[De]| |
|  |        |               |HB-A1C   |12%→9%      |     |    | |
|  |08/04   |feedback_      |Edital   |"Estrategia |[ ]  |[De]| |
|  |        |usuario        |PE 2089  | defensiva  |     |    | |
|  |        |               |         | funcionou" |     |    | |
|  +-------------------------------------------+               |
|                                                               |
|  +---- Modal: Detalhe do Feedback ----+                       |
|  | Tipo: score_ajustado               |                       |
|  | Entidade: ParametroScore (Hemato)  |                       |
|  | Data: 12/04/2026 14:32             |                       |
|  | Usuario: J. Silva                  |                       |
|  |                                    |                       |
|  | Dados Entrada (antes):             |                       |
|  | { peso_tecnico: 0.4,              |                       |
|  |   peso_comercial: 0.6 }           |                       |
|  |                                    |                       |
|  | Resultado Real (depois):           |                       |
|  | { peso_tecnico: 0.6,              |                       |
|  |   peso_comercial: 0.4 }           |                       |
|  |                                    |                       |
|  | Delta:                             |                       |
|  | { peso_tecnico: +0.2,             |                       |
|  |   peso_comercial: -0.2 }          |                       |
|  |                                    |                       |
|  | Aplicado: Nao  [Marcar Aplicado]   |                       |
|  |                     [Fechar]       |                       |
|  +------------------------------------+                       |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (4), Tabela feedbacks, Modal detalhe JSON, Badge aplicado
- **Preenchidos (input):** Filtros (Tipo, Periodo, Entidade), Botao Registrar Manual
- **Obtidos (resposta do sistema):** Lista de feedbacks, detalhe com delta, status de aplicacao

---
