# Grafo de Predecessores entre UCs — V7 (89 UCs / 5 sprints)

**Gerado em:** 2026-04-28
**Origem:** `scripts/gerar_ucs_v7.py` — seção "UCs predecessores" injetada em todos os UCs

Este documento consolida **quais UCs precisam ter rodado antes** pra cada UC funcionar
de fato. Útil pra:
- Ordenar testes corretamente (UC-F01 antes de UC-F02 antes de UC-F03 etc)
- Detectar dependências cruzadas entre sprints
- Identificar UCs raiz (sem predecessores além de [login]/[infra]/[seed])

## Convenções

- `UC-XXX` — UC concreto cujas pós-condições satisfazem a pré-condição
- `[login]` — pré-requisito universal de autenticação (não é UC)
- `[infra]` — endpoint/serviço operacional (não é UC, é setup)
- `[seed]` — dado pré-cadastrado no banco (não é UC, é seed)
- `UC-A OU UC-B` — qualquer um dos dois satisfaz

## UCs raiz (entrada de cada sprint)

UCs que **não dependem de outros UCs**, apenas de `[login]`/`[infra]`/`[seed]`:

| UC | Sprint | Notas |
|---|---|---|
| UC-F01 | 1 | Cadastrar empresa |
| UC-F07 | 1 | Cadastrar produto por IA |
| UC-F13 | 1 | Consultar classificação (mas precisa de seed) |
| UC-F14 | 1 | Configurar pesos/limiares |
| UC-F15 | 1 | Configurar parâmetros comerciais |
| UC-F16 | 1 | Configurar fontes/NCMs |
| UC-F17 | 1 | Configurar notificações |
| UC-CV06 | 2 | Gerir monitoramentos |
| UC-P10 | 3-4 | Gestão de comodato (independente) |
| UC-R02 | 3-4 | Upload de proposta externa |
| UC-RE01 | 4 | Monitorar janela de recurso |
| UC-FU01 | 4 | Registrar resultado |
| UC-AT01 | 5 | Buscar atas no PNCP |

## Cadeias de dependência mais profundas

### Cadeia 1: Captação → Precificação → Proposta → Recursos
```
UC-F14, F15, F16
    ↓
UC-CV01 (busca editais)
    ↓
UC-CV03 (salva edital) ───────────────────────────────────┐
    ↓                                                      │
UC-CV09 (importa itens)                                    │
    ↓                                                      │
UC-P01 (organiza lotes)                                    │
    ↓                                                      │
UC-P02 (seleção portfolio) ← UC-F07/F08 (produtos)         │
    ↓                                                      │
UC-P03 (volumetria)                                        │
    ↓                                                      │
UC-P04 (custos) ← UC-F07/F08 (NCM)                         │
    ↓                                                      │
UC-P05 (preço base)                                        │
    ↓                                                      │
UC-P06 (valor referência)                                  │
    ↓                                                      │
UC-P07 (estruturar lances)                                 │
    ↓                                                      │
UC-P08 (estratégia)                                        │
    ↓                                                      │
UC-R01 (gerar proposta) ← UC-CV03 ◄────────────────────────┘
    ↓
UC-R03/R04/R05 (auditorias)
    ↓
UC-R06 (dossiê)
    ↓
UC-R07 (submissão)
```

### Cadeia 2: Recursos pós-disputa
```
UC-CV03
    ↓
UC-RE02 (analisar vencedora) ← UC-RE01 (monitor)
    ↓
UC-RE04 (laudo)
    ↓
UC-RE06 (submissão)
```

### Cadeia 3: Atas → Contratos
```
UC-AT01 (buscar atas)
    ↓
UC-AT02 (extrair PDF) ───→ UC-CT06 (saldo ARP)
    ↓
UC-AT03 (dashboard)

UC-FU01 (resultado)
    ↓
UC-CT01 (cadastrar contrato)
    ↓
UC-CT02 (entrega + NF)
    ↓
UC-CT03 (cronograma)
```

## Grafo completo por sprint

### Sprint 1 — Empresa, Portfólio, Parametrização

| UC | Predecessores |
|---|---|
| UC-F01 | `[login]`, `[infra]` (raiz) |
| UC-F02 | UC-F01, UC-F13 OU `[seed]` |
| UC-F03 | UC-F01 |
| UC-F04 | UC-F01, UC-F16 OU `[seed]` |
| UC-F05 | UC-F01 |
| UC-F06 | UC-F07 OU UC-F08, UC-F13 OU `[seed]` |
| UC-F07 | `[login]`, `[infra]` (raiz) |
| UC-F08 | UC-F07 OU UC-F08, UC-F13 OU `[seed]` |
| UC-F09 | UC-F07 OU UC-F08 |
| UC-F10 | UC-F06 |
| UC-F11 | UC-F07 OU UC-F08 |
| UC-F12 | UC-F06 |
| UC-F13 | `[seed]` (raiz) |
| UC-F14 | `[infra]` (raiz) |
| UC-F15 | `[infra]`, `[seed]` (raiz) |
| UC-F16 | `[infra]`, `[seed]` (raiz) |
| UC-F17 | `[seed]` (raiz) |

### Sprint 2 — Captação Validação

| UC | Predecessores |
|---|---|
| UC-CV01 | UC-F14, UC-F15, UC-F16 |
| UC-CV02 | UC-CV01 |
| UC-CV03 | UC-CV01 |
| UC-CV04 | UC-CV02, UC-CV03 |
| UC-CV05 | UC-CV01 |
| UC-CV06 | `[infra]` (raiz) |
| UC-CV07 | UC-CV03 |
| UC-CV08 | UC-CV07 |
| UC-CV09 | UC-CV03 OU UC-CV07 |
| UC-CV10 | UC-CV03 OU UC-CV07, UC-F01, UC-F03 |
| UC-CV11 | UC-CV03 OU UC-CV07 |
| UC-CV12 | UC-CV03 OU UC-CV07 |
| UC-CV13 | UC-CV03 OU UC-CV07 |

### Sprint 3-4 — Precificação e Proposta

| UC | Predecessores |
|---|---|
| UC-P01 | UC-CV03, UC-CV09 |
| UC-P02 | UC-P01, UC-F07 OU UC-F08 |
| UC-P03 | UC-P01, UC-P02 |
| UC-P04 | UC-P03, UC-F07 OU UC-F08 |
| UC-P05 | UC-P04 |
| UC-P06 | UC-P05 |
| UC-P07 | UC-P04, UC-P05, UC-P06 |
| UC-P08 | UC-P07 |
| UC-P09 | UC-F06 |
| UC-P10 | `[login]` (raiz) |
| UC-P11 | UC-P02 |
| UC-P12 | UC-P04 OU UC-P05 |
| UC-R01 | UC-P04, P05, P06, P07, P08, UC-CV03, UC-F07/F08 |
| UC-R02 | `[login]` (raiz) |
| UC-R03 | UC-R01 |
| UC-R04 | UC-R01 OU UC-R02, UC-F07 OU UC-F08 |
| UC-R05 | UC-R01 OU UC-R02, UC-F03 |
| UC-R06 | UC-R01 OU UC-R02, UC-R04 OU UC-R05 |
| UC-R07 | UC-R01 OU UC-R02 |

### Sprint 4 — Recursos, Impugnações, Funcional

| UC | Predecessores |
|---|---|
| UC-I01 | UC-CV03, `[seed]` |
| UC-I02 | UC-I01 |
| UC-I03 | UC-I02 |
| UC-I04 | UC-CV03 |
| UC-I05 | UC-CV03, UC-I03 OU UC-I04 |
| UC-RE01 | `[infra]` (raiz) |
| UC-RE02 | UC-CV03 |
| UC-RE03 | UC-RE02 |
| UC-RE04 | UC-RE02, UC-RE01 |
| UC-RE05 | UC-R01 OU UC-R02, UC-CV03 |
| UC-RE06 | UC-I03 OU UC-RE04 OU UC-RE05 |
| UC-FU01 | `[login]` (raiz) |
| UC-FU02 | UC-CT01 OU UC-AT01 |
| UC-FU03 | UC-CV03, UC-F15 OU `[seed]` |

### Sprint 5 — Atas, Contratos, Acompanhamento, CRM

| UC | Predecessores |
|---|---|
| UC-AT01 | `[login]`, `[infra]` (raiz) |
| UC-AT02 | UC-AT01 |
| UC-AT03 | UC-AT01 |
| UC-CT01 | UC-FU01 |
| UC-CT02 | UC-CT01 |
| UC-CT03 | UC-CT02 |
| UC-CT04 | UC-CT01 |
| UC-CT05 | UC-CT01 |
| UC-CT06 | UC-AT01, UC-AT02 |
| UC-CT07-10 | UC-CT01 |
| UC-CR01 | UC-CT01 |
| UC-CR02 | UC-CT01, UC-CT02 |
| UC-CR03 | UC-CT01 |
| UC-CRM01 | UC-CV03 |
| UC-CRM02 | UC-CV03, UC-FU01 |
| UC-CRM03 | UC-CV03 |
| UC-CRM04 | UC-FU01 |
| UC-CRM05 | UC-FU01 |
| UC-CRM06 | UC-CT01 |
| UC-CRM07 | UC-FU01, UC-CT01 |

## Implicações práticas

1. **Pra rodar UC-F02 com qualidade**, UC-F01 deve ter rodado antes (cria empresa). O app pode automaticamente checar `users_empresas` antes de iniciar.

2. **Pra rodar UC-R01 (gerar proposta)**, **6 UCs precedentes** devem ter rodado: P04, P05, P06, P07, P08, CV03. Sem isso, a proposta gerada vai ter dados vazios.

3. **UC-CV03 é gargalo**: 13 UCs dependem dele direta ou transitivamente.

4. **UC-F13 é base de 4 UCs** (F02, F06, F08) e é raiz só de [seed] — então se o seed não rodou, vários UCs falham silenciosamente.

5. **UCs raiz absoluta** (zero deps): UC-F01, F07, F13, F14-F17, CV06, AT01, FU01, RE01, P10, R02. São os candidatos a serem testados primeiro em qualquer ciclo de validação.

## Como atualizar este documento

Quando mudar pré-condições de um UC ou descobrir nova dependência:

1. Atualizar `PREDECESSORES` em `scripts/gerar_ucs_v7.py`
2. Rodar `python3 scripts/gerar_ucs_v7.py`
3. Re-gerar este grafo manualmente (futuro: automatizar)
