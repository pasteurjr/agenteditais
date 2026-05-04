---
uc_id: UC-MO01
nome: "Visualizar Dashboard de Monitoramentos Ativos"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 458
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO01 — Visualizar Dashboard de Monitoramentos Ativos

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 458).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-048 (Monitoria)
**Ator:** Usuario (Analista Comercial, Diretor)

### Pre-condicoes
1. Usuario autenticado
2. APScheduler ativo

### Pos-condicoes
1. Usuario visualiza lista de monitoramentos em background
2. Pode ver status de cada um (ativo, pausado, com erro)

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage (`/app/monitoria`) via menu lateral "Indicadores > Monitoria"
2. [Cabecalho: "Monitoramentos Automaticos"] exibe titulo da pagina
3. [Secao: Stat Cards — grid 4 colunas] mostra: Ativos (verde), Pausados (cinza), Com Erro (vermelho), Eventos/24h (azul)
4. Na [Aba: "Ativos"] (default), [Card: "Monitoramentos Ativos"] lista todos com status `ativo`
5. [Tabela: Monitoramentos] exibe: Nome, Fonte (PNCP/Brave/Portal), Criterio (termo, UFs, NCM), Periodicidade, Ultima Execucao, Proxima Execucao, Status, Acoes
6. Usuario pode clicar em uma linha para ver detalhes [Modal: "Detalhe do Monitoramento"]
7. Modal mostra: historico das ultimas 10 execucoes, total de eventos capturados, tempo medio de execucao, log de erros (se houver)
8. Botoes de acao: [Botao: "Pausar"], [Botao: "Executar Agora"], [Botao: "Editar"], [Botao: "Excluir"]

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Monitoramentos Automaticos                                   |
|                                                               |
|  +--------+  +---------+  +---------+  +---------+           |
|  |Ativos  |  |Pausados |  |Com Erro |  |Eventos  |           |
|  |   12   |  |    3    |  |    2    |  |24h: 47  |           |
|  |(verde) |  |(cinza)  |  |(vermelh)|  | (azul)  |           |
|  +--------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +------+  +----------+  +--------+  +--------+              |
|  |Ativos|  |Eventos   |  |Erros   |  |Analises|              |
|  |      |  |Capturados|  |        |  |Sob Dem.|              |
|  +------+  +----------+  +--------+  +--------+              |
|                                                               |
|  +------------+-------+------------+--------+--------+----+  |
|  |Nome        |Fonte  |Criterio    |Periodi.|Proxima |Sts |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |Reagentes SP|PNCP   |ncm=3822,   |4x/dia  |15/04   |Ativ|  |
|  |            |       |UF=SP,valor |        |18h     |    |  |
|  |            |       |100k-500k   |        |        |    |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |Editais RJ  |Brave  |termo=lab   |2x/dia  |15/04   |Ativ|  |
|  |            |       |UF=RJ       |        |20h     |    |  |
|  +------------+-------+------------+--------+--------+----+  |
|  |TCE-MG      |Portal |termo=      |1x/dia  |16/04   |Erro|  |
|  |            |TCE-MG |hematologia |        |06h     |(!) |  |
|  +------------+-------+------------+--------+--------+----+  |
|                                                               |
|                                       [Floating Chatbox IA]  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards, Tabela de monitoramentos, Detalhe modal com historico
- **Preenchidos (input):** Nenhum nesta tela (criacao e via chatbox no UC-MO02)
- **Obtidos (resposta do sistema):** Lista de monitoramentos, status real-time, acoes via botoes

### Excecoes
- **E1:** Nenhum monitoramento cadastrado - tabela mostra estado vazio com CTA: "Peca a IA para criar seu primeiro monitoramento via chatbox"

---
