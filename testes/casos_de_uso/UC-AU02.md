---
uc_id: UC-AU02
nome: "Investigar Alteracoes Sensiveis em Parametrizacoes"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 938
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-AU02 — Investigar Alteracoes Sensiveis em Parametrizacoes

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 938).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037, RN-080 (alteracao em score exige justificativa + versao), RN-132

**RF relacionado:** RF-056, RF-018 (ParametroScore)
**Ator:** Usuario (Diretor, Auditor)

### Pre-condicoes
1. Usuario autenticado com perfil diretor/auditor
2. Pelo menos 1 alteracao sensivel registrada (alteracao em ParametroScore, margem_minima, pesos de aderencia, parametros de NCM, parametros de empenho)

### Pos-condicoes
1. Usuario visualiza cadeia temporal das mudancas sensiveis
2. Pode identificar padroes (ex: mesma pessoa alterando varias vezes)

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage > [Aba: "Sensiveis"]
2. [Card: "Alteracoes Sensiveis"] exibe lista filtrada apenas por operacoes em entidades marcadas como sensiveis
3. [Tabela: Alteracoes Sensiveis] mostra: Timestamp, Usuario, Entidade, Campo Alterado, Valor Antes, Valor Depois, Justificativa, Alerta Disparado
4. Cada linha tem indicador visual se havia alerta ("[Badge: Alerta disparado]")
5. Usuario clica em [Botao: "Timeline do Score"] para ver a evolucao de pesos de um ParametroScore especifico
6. [Modal: "Timeline ParametroScore"] abre com grafico de linha mostrando valor de cada peso ao longo do tempo, marcando cada alteracao com o usuario responsavel

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Auditoria > Alteracoes Sensiveis                             |
|                                                               |
|  +--------+  +---------+  +---------+  +---------+           |
|  |Total   |  |Ultimos  |  |Usuarios |  |Alertas  |           |
|  |Sensiv. |  |7 dias   |  |Distinto |  |Disparad |           |
|  |  47    |  |   12    |  |    4    |  |    12   |           |
|  +--------+  +---------+  +---------+  +---------+           |
|                                                               |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |Times-|Usuario    |Entid. |Campo   |Ant.|Dep. |Justif.|    |
|  |tamp  |           |       |        |    |     |       |    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |15/04 |maria      |Param- |peso_   |0.4 |0.6  |Reve-  |    |
|  |11:15 |@ch.com    |Score  |tecnico |    |     |r apos |    |
|  |      |           |       |        |    |     |perda..|    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|  |14/04 |joao       |Param- |margem_ |15% |12%  |Compe- |    |
|  |16:00 |@ch.com    |Score  |minima  |    |     |titivi.|    |
|  +------+-----------+-------+--------+----+-----+-------+    |
|                                                               |
|  [Botao: Timeline ParametroScore]                             |
|  [Botao: Exportar Relatorio Sensivel]                         |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stats agregados, tabela de alteracoes sensiveis, timeline grafica
- **Preenchidos (input):** Filtros de periodo, entidade, usuario
- **Obtidos (resposta do sistema):** Lista filtrada, grafico de evolucao, exportacao

### Excecoes
- **E1:** Alteracao sem justificativa (RN-080 violada) - linha destacada em vermelho com badge "JUSTIFICATIVA AUSENTE"

---
