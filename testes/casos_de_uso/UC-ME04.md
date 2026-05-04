---
uc_id: UC-ME04
nome: "Detectar Itens Intrusos em Edital via IA"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 363
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-ME04 — Detectar Itens Intrusos em Edital via IA

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 363).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-084 (cooldown DeepSeek), RN-132 (audit invocacao), RN-037 (audit log), RN-NEW-04 (criterio item intruso)

**RF relacionado:** RF-048, RF-049
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Tool `tool_detectar_itens_intrusos` registrada no catalogo DeepSeek
3. Portfolio da empresa cadastrado com NCMs

### Pos-condicoes
1. Lista de itens intrusos detectados gravada em banco
2. Alertas gerados para itens criticos (valor > 10% do edital)
3. Log de invocacao gravado (RN-132)

### Sequencia de Eventos

1. Usuario acessa MercadoPage e clica na [Aba: "Intrusos"]
2. [Card: "Stat Cards — grid 3"] exibe: Intrusos Detectados (total), Editais Afetados (qtd), Valor em Risco (R$ — soma dos itens intrusos)
3. [Card: "Filtros"] permite: [Select: "Criticidade"] (Todos/Critico/Medio/Informativo), [Select: "Periodo"], [TextInput: "Buscar edital"]
4. [Card: "Itens Intrusos Detectados"] exibe DataTable: Edital, Item, NCM, Valor do Item, % do Edital, Criticidade, Acao Sugerida
5. Criticidade calculada: >10% do edital = Critico (vermelho), 5-10% = Medio (amarelo), <5% = Informativo (azul) (RN-NEW-04)
6. [Botao: "Analisar Novo Edital"] abre [Modal: "Detectar Itens Intrusos"]
7. Modal exibe: [TextInput: "Numero do Edital"] ou [Select: "Selecionar edital da lista"]
8. Usuario seleciona edital e clica [Botao: "Analisar com IA"]
9. Sistema verifica cooldown (RN-084), invoca `tool_detectar_itens_intrusos` via DeepSeek
10. Tool compara NCMs dos itens do edital vs NCMs do portfolio da empresa
11. Itens com NCM fora do portfolio sao classificados como intrusos
12. Resultado exibido na tabela com badge de criticidade
13. Toast: "Analise concluida: {N} itens intrusos detectados no edital {numero}"

### Tela(s) Representativa(s)

**Pagina:** MercadoPage
**Posicao:** Aba "Intrusos"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Mercado > Itens Intrusos                                     |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Intrusos   |  |Editais    |  |Valor em   |                  |
|  |Detectados |  |Afetados   |  |Risco      |                  |
|  |    23     |  |    8      |  |R$ 1.2M    |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  [Filtros] Criticidade: [Todos v]  Periodo: [6m v]            |
|  Buscar edital: [________________]  [Analisar Novo Edital]    |
|                                                               |
|  +---- Itens Intrusos Detectados ---------+                   |
|  |Edital      |Item           |NCM   |Valor  |% Ed.|Crit.|   |
|  |PE 2034/SP  |Calibrador sem |9027  |R$180K | 12% |[!!!]|   |
|  |            |valor de venda |      |       |     |     |   |
|  |PE 2089/MG  |Equip. osmose  |8421  |R$ 95K |  8% |[!! ]|   |
|  |            |reversa        |      |       |     |     |   |
|  |PE 2103/RJ  |Insumo limpeza |3402  |R$ 12K |  2% |[ i ]|   |
|  +--------------------------------------------+               |
|  [!!!] = Critico (>10%)  [!!] = Medio (5-10%)  [i] = Info    |
|                                                               |
|  +---- Modal: Detectar Itens Intrusos ----+                   |
|  | Edital: [Select ou digitar numero v]   |                   |
|  |                                        |                   |
|  | [Analisar com IA]  [Cancelar]          |                   |
|  +----------------------------------------+                   |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Tabela intrusos com criticidade, Badge colorido
- **Preenchidos (input):** Filtros (Criticidade, Periodo, Busca), Modal (numero do edital)
- **Obtidos (resposta do sistema):** Lista de itens intrusos com NCM, valor, criticidade, acao sugerida

### Excecoes
- **E1:** Edital nao encontrado — modal exibe erro "Edital nao encontrado no sistema"
- **E2:** Edital sem itens — toast: "Edital sem itens detalhados para analisar"
- **E3:** Cooldown ativo (RN-084) — toast: "Aguarde {N}s antes de nova analise"

---

# FASE 2 — ANALYTICS CONSOLIDADO

---
