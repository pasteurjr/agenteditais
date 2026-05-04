---
uc_id: UC-FL01
nome: "Visualizar Dashboard de Alertas Ativos"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 91
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-FL01 — Visualizar Dashboard de Alertas Ativos

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 91).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log), RN-186 (niveis de criticidade), RN-187 (canais escalonados), RN-211 (threshold divergencia), RN-212 (contador prazo dispara automatico)

**RF relacionado:** RF-047 (Flags), RF-052-01 (Alertas Multi-tier)
**Ator:** Usuario (Analista Comercial, Diretor, Gestor de Contrato)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Scheduler `APScheduler` esta ativo no backend
3. Pelo menos um alerta foi criado (via IA, via scheduler automatico, ou via modulo de origem como Sprint 4 Recursos)

### Pos-condicoes
1. Usuario visualiza a lista de alertas ativos classificados por criticidade
2. Registro de visualizacao gravado em `AuditoriaLog` (RN-037)
3. Alertas criticos nao reconhecidos aparecem no topo

### Sequencia de Eventos

1. Usuario acessa FlagsPage (`/app/flags`) via menu lateral "Indicadores > Flags"
2. [Cabecalho: "Flags e Alertas"] exibe titulo da pagina
3. [Secao: Stat Cards — grid 4 colunas] mostra 4 metricas agregadas: Criticos (vermelho), Altos (laranja), Medios (amarelo), Informativos (azul)
4. Na [Aba: "Ativos"] (default), [Card: "Alertas Ativos"] lista todos os alertas com status `aguardando` ou `disparado_nao_reconhecido`
5. [Tabela: Alertas Ativos] exibe: Criticidade, Tipo, Entidade de Referencia, Responsavel, Data Disparo, Canal, Status, Acoes
6. Usuario pode filtrar via [Select: "Filtrar por Tipo"], [Select: "Filtrar por Responsavel"], [Select: "Filtrar por Criticidade"], [DatePicker: "Periodo"]
7. Cada linha mostra [Badge: criticidade] (cor correspondente), [Texto: tipo do alerta], [Link: entidade clicavel], [Texto: nome do responsavel], [Texto: data/hora ISO], [Badge: canal], [Badge: status]
8. Usuario clica em [Botao: "Reconhecer"] na coluna Acoes para marcar um alerta como ciente
9. Sistema atualiza status do alerta para `reconhecido`, registra timestamp + user_id, grava em `AuditoriaLog`
10. Linha desaparece da tabela "Ativos" e aparece em [Aba: "Historico"]
11. [Stat Cards] recalculam com os novos totais

### Tela(s) Representativa(s)

**Pagina:** FlagsPage (`/app/flags`)
**Posicao:** Aba "Ativos"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Flags e Alertas                                              |
|                                                               |
|  +---------+  +---------+  +---------+  +---------+          |
|  |Criticos |  |Altos    |  |Medios   |  |Informa- |          |
|  |   12    |  |   28    |  |   45    |  |tivos 67 |          |
|  |(vermelho|  |(laranja)|  |(amarelo)|  | (azul)  |          |
|  +---------+  +---------+  +---------+  +---------+          |
|                                                               |
|  +------+  +-----------+  +------------+  +----------+       |
|  |Ativos|  |Calendario |  |Historico   |  |Silencia- |       |
|  |      |  |           |  |            |  |dos       |       |
|  +------+  +-----------+  +------------+  +----------+       |
|                                                               |
|  [Filtros]                                                    |
|  Tipo: [Select v]  Responsavel: [Select v]                   |
|  Criticidade: [Select v]  Periodo: [DatePicker v]             |
|                                                               |
|  +-----------+-------------+-----------+---------+-------+   |
|  |Criticidade| Tipo        |Entidade   |Respons. |Acoes  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Critico] |Prazo Recurso|Edital 2034|J.Silva  |[Reco- |   |
|  |           |vence em 2h  |           |         | nhe-  |   |
|  |           |             |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Alto]    |Contrato     |Contrato   |M.Costa  |[Reco- |   |
|  |           |vence em 15d |CT-2026-42 |         | nhe-  |   |
|  |           |             |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|  | [Medio]   |Certidao     |Empresa 001|P.Junior |[Reco- |   |
|  |           |FGTS vence   |           |         | nhe-  |   |
|  |           |em 20d       |           |         | cer]  |   |
|  +-----------+-------------+-----------+---------+-------+   |
|                                                               |
|                                        [Floating Chatbox IA] |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (agregados), Tabela Alertas (lista completa filtravel), Badges de criticidade, Links para entidades de origem
- **Preenchidos (input):** Filtros (Tipo, Responsavel, Criticidade, Periodo)
- **Obtidos (resposta do sistema):** Contagem por criticidade, Lista filtrada, Confirmacao de reconhecimento, Atualizacao em tempo real dos Stat Cards apos acao

### Excecoes
- **E1:** Scheduler esta parado - sistema exibe banner vermelho "Scheduler inativo. Alertas nao estao sendo disparados" com botao "Contatar administrador"
- **E2:** Alerta ja foi reconhecido por outro usuario - sistema exibe toast "Alerta ja reconhecido por {nome_usuario} em {timestamp}"

---
