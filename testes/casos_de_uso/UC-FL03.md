---
uc_id: UC-FL03
nome: "Listar e Filtrar Historico de Alertas"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 258
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-FL03 — Listar e Filtrar Historico de Alertas

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 258).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log de consulta)

**RF relacionado:** RF-047
**Ator:** Usuario (Diretor, Analista, Auditor Interno)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos 1 alerta ja foi disparado ou expirado nos ultimos N dias

### Pos-condicoes
1. Usuario visualiza historico completo com filtros aplicados
2. Consulta gravada em `AuditoriaLog` (evidencia de "quem consultou o que")

### Sequencia de Eventos

1. Usuario acessa FlagsPage (`/app/flags`) e clica na [Aba: "Historico"]
2. [Card: "Historico de Alertas"] exibe tabela dos ultimos 30 dias (padrao)
3. [Tabela: Historico] mostra: Data/Hora, Tipo, Entidade, Responsavel, Criticidade, Status Final, Tempo ate Reconhecimento
4. [Filtros] permitem ajustar: Periodo (DatePicker), Tipo (Select), Responsavel (Select), Status Final (Select: reconhecido/expirado/cancelado)
5. [Stats de Resumo] exibe no topo: Total Disparados, Total Reconhecidos, Total Expirados, Taxa de Reconhecimento %, Tempo Medio ate Reconhecimento
6. Usuario clica em uma linha para expandir o detalhe [Modal: "Detalhe do Alerta"]
7. Modal mostra: payload completo do alerta, historico de acoes (criado por quem, disparado quando, reconhecido por quem), logs de email (se enviado), mensagem de erro (se falhou)

### Tela(s) Representativa(s)

**Pagina:** FlagsPage
**Posicao:** Aba "Historico"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Flags e Alertas > Historico                                  |
|                                                               |
|  +-------+  +-------+  +-------+  +------+  +---------+      |
|  |Total  |  |Reconh.|  |Expirad|  |Taxa  |  |Tempo    |      |
|  |Dispar.|  |       |  |       |  |Reconh|  |Medio    |      |
|  | 142   |  |  128  |  |   14  |  |90.1% |  |3h 45m   |      |
|  +-------+  +-------+  +-------+  +------+  +---------+      |
|                                                               |
|  [Filtros]                                                    |
|  Periodo: [2026-03-15 -> 2026-04-15]                         |
|  Tipo: [Todos v]  Responsavel: [Todos v]                     |
|  Status: [Todos v]                                            |
|                                                               |
|  +----------+------+---------+---------+--------+----------+ |
|  |Data/Hora |Tipo  |Entidade |Respons. |Critic. |Status    | |
|  +----------+------+---------+---------+--------+----------+ |
|  |14/04 08h |Prazo |Ed. 2034 |J.Silva  |Critico |Reconh.   | |
|  |          |Recur.|         |         |        |(14/04 9h)| |
|  +----------+------+---------+---------+--------+----------+ |
|  |14/04 07h |Cont. |CT-42    |M.Costa  |Alto    |Expirado  | |
|  |          |Vence |         |         |        |          | |
|  +----------+------+---------+---------+--------+----------+ |
|                                                               |
|  [Botao: Exportar CSV]  [Botao: Exportar PDF]                |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stats agregados, Tabela de historico, Detalhe modal com timeline de acoes
- **Preenchidos (input):** Filtros (Periodo, Tipo, Responsavel, Status)
- **Obtidos (resposta do sistema):** Lista filtrada, Agregados recalculados, Exportacao CSV/PDF

---
