---
uc_id: UC-FL05
nome: "Ver Agenda de Disparos (Calendario)"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 391
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-FL05 — Ver Agenda de Disparos (Calendario)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 391).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-186 (cores por criticidade)

**RF relacionado:** RF-047, RF-052-01
**Ator:** Usuario (qualquer perfil)

### Pre-condicoes
1. Usuario autenticado
2. Pelo menos um alerta agendado para o futuro

### Pos-condicoes
1. Usuario visualiza calendario com todos os disparos previstos
2. Pode clicar em um disparo para ir ao detalhe do alerta

### Sequencia de Eventos

1. Usuario acessa FlagsPage e clica na [Aba: "Calendario"]
2. [Componente: CalendarioMensal] renderiza com o mes atual
3. Cada dia com disparos mostra [Badge: contador] com numero de eventos
4. Cor do badge segue criticidade mais alta do dia (vermelho > laranja > amarelo > azul)
5. Usuario clica em um dia - [Popover: "Disparos do dia"] abre com lista cronologica
6. [Item da lista] mostra: horario, tipo, entidade, criticidade
7. Usuario clica em um item - sistema navega para [Modal: "Detalhe do Alerta"] ou redireciona para a entidade
8. Toggle [Switch: "Visao"] permite alternar entre Mensal, Semanal, Diaria

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Flags > Calendario            [v Mensal] [Semanal] [Diaria] |
|                                                               |
|  <<  Abril 2026  >>                                          |
|                                                               |
|  +---+---+---+---+---+---+---+                               |
|  |Dom|Seg|Ter|Qua|Qui|Sex|Sab|                               |
|  +---+---+---+---+---+---+---+                               |
|  |   |   |   |1  |2  |3  |4  |                               |
|  |   |   |   |[2]|[1]|   |   |                               |
|  +---+---+---+---+---+---+---+                               |
|  |5  |6  |7  |8  |9  |10 |11 |                               |
|  |   |[5]|[3]|[8]|   |   |   |                               |
|  |   |(v)|(o)|(v)|   |   |   |                               |
|  +---+---+---+---+---+---+---+                               |
|  |12 |13 |14 |*15*|16|17 |18 |                               |
|  |   |   |[1]|[12] |[4]|  |   |                               |
|  |   |   |   |(v)  |(o)|  |   |                               |
|  +---+---+---+---+---+---+---+                               |
|                                                               |
|  * = hoje                                                     |
|  [N] = contador de disparos                                   |
|  (v) = vermelho (critico), (o) = laranja (alto)              |
|                                                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Grid do calendario, badges de contador, popover com disparos do dia
- **Preenchidos (input):** Seletor de visao (Mensal/Semanal/Diaria), navegacao entre meses
- **Obtidos (resposta do sistema):** Grid preenchido, popover dinamico, navegacao para detalhe

---

# FASE 2 — MONITORIA (MONITORAMENTOS AUTOMATICOS)

---
