---
uc_id: UC-MO05
nome: "Ver Eventos Capturados por Monitoramento"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 709
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO05 — Ver Eventos Capturados por Monitoramento

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 709).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log de consulta)

**RF relacionado:** RF-048
**Ator:** Usuario (Analista)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos um monitoramento ja executou e capturou eventos

### Pos-condicoes
1. Usuario visualiza lista de eventos capturados
2. Pode navegar para a entidade descoberta

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage > [Aba: "Eventos Capturados"]
2. [Card: "Eventos das ultimas 24h"] exibe tabela
3. [Tabela: Eventos] mostra: Data/Hora Captura, Monitoramento de Origem, Tipo de Evento (edital_novo/edital_alterado/ata_nova/pregao_reaberto), Entidade, Acao Sugerida pela IA, Acao Tomada
4. [Filtros]: Periodo, Monitoramento, Tipo
5. Usuario clica em um evento - [Modal: "Detalhe do Evento"] abre
6. Modal mostra: dados completos da entidade, diff vs estado anterior (se alteracao), botao para abrir na tela apropriada

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Monitoria > Eventos Capturados                               |
|                                                               |
|  Periodo: [Ultimas 24h v]  Tipo: [Todos v]                   |
|                                                               |
|  +-----------+-----------+------------+-------------+------+ |
|  |Data/Hora  |Monit.     |Tipo        |Entidade     |Acao  | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 14:20|Reagentes  |edital_novo |Ed 2089      |[Ver] | |
|  |           |SP         |            |TCE-SP R$250k|      | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 12:15|Editais RJ |edital_novo |Ed 2088      |[Ver] | |
|  |           |           |            |HUPE R$180k  |      | |
|  +-----------+-----------+------------+-------------+------+ |
|  |15/04 08:00|Reagentes  |edital_alte-|Ed 2034      |[Ver] | |
|  |           |SP         |rado (adend)|UFRJ         |      | |
|  +-----------+-----------+------------+-------------+------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Tabela de eventos, detalhes modais, diffs
- **Preenchidos (input):** Filtros
- **Obtidos (resposta do sistema):** Lista paginada, navegacao para entidade

---
