---
uc_id: UC-CRM07
nome: "Registrar Motivo de Perda *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2817
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CRM07 — Registrar Motivo de Perda *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2817).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-168, RN-192, RN-194, RN-195

**RF relacionado:** RF-045-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Edital com resultado final de perda registrado (subcard "Perdidos" em Resultados Definitivos)
3. Motivos de Derrota parametrizados (UC-CRM02)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-FU01**
- **UC-CT01**


### Pos-condicoes
1. Motivos detalhados de perda registrados com categorias
2. Diferenciacao entre perdas diretas e perdas apos contra-razao registrada
3. Registro disponivel como insumo para KPIs e aprendizado da equipe (UC-CRM05)
4. Historico de perdas acessivel para analise de tendencias

### Sequencia de Eventos

1. Na CRMPage, usuario expande o [Card: "Resultados Definitivos"] > [SubCard: "Perdidos"]
2. [Tabela: Editais Perdidos] exibe: Numero, Orgao, Valor, Vencedor, Origem Perda, Motivo, Acao
3. [Coluna: "Origem Perda"] exibe badge: "Perda Direta" (vermelho), "Perda apos Contra-Razao" (roxo)
4. Editais sem motivo registrado exibem [Badge: "Pendente"] (amarelo) na coluna Motivo
5. Usuario clica [Botao: "Registrar Motivo"] (variant: primary, size: sm) em edital pendente
6. [Modal: "Registrar Motivo de Perda — {numero}"] abre
7. [Select: "Categoria do Motivo"] — opcoes dinamicas dos Motivos de Derrota parametrizados (UC-CRM02)
8. [TextArea: "Descricao detalhada do motivo"] — obrigatorio, minimo 30 caracteres
9. [Checkbox: "Perda vinculada a Contra-Razao"] — pre-marcado se edital veio do fluxo de contra-razoes
10. Se vinculada a contra-razao: [TextArea: "Analise do processo de contra-razao"] — campo adicional para registro dos aprendizados
11. [Select: "Acao recomendada"] — opcoes: "Revisar especificacoes tecnicas", "Revisar precificacao", "Melhorar documentacao", "Capacitar equipe", "Sem acao", "Outro"
12. [TextInput: "Responsavel pela acao"]
13. [Texto: "Registrado por: {nome_usuario} em {data_hora}"] — log automatico
14. Clica [Botao: "Registrar"] (variant: primary)
15. Modal fecha; coluna Motivo atualizada com categoria registrada
16. Dados alimentam KPIs de perdas (UC-CRM05) e secao "Analise de Perdas"
17. Para editais ganhos com recursos: [Botao: "Registrar Motivo de Sucesso"] disponivel em [SubCard: "Ganhos"] — abre modal similar para registrar motivos que levaram ao sucesso do recurso (aprendizado positivo)
18. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Perda direta (sem contra-razao):** Checkbox "Perda vinculada a Contra-Razao" (passo 9) desmarcado. Campo "Analise do processo de contra-razao" (passo 10) nao e exibido. Fluxo simplificado.
- **FA-02 — Registrar motivo de sucesso (ganho via recurso):** Usuario acessa SubCard "Ganhos" e clica "Registrar Motivo de Sucesso" (passo 17). Modal similar abre para documentar aprendizado positivo.
- **FA-03 — Followup sem resposta (edital abandonado):** Edital permanece em "Perdidos" sem motivo registrado. Badge "Pendente" continua visivel. KPIs contabilizam como "sem motivo".

### Fluxos de Excecao (V5)

- **FE-01 — Descricao com menos de 30 caracteres:** No passo 14, validacao impede confirmacao. Sistema exibe erro "Descricao deve ter no minimo 30 caracteres."
- **FE-02 — Categoria do motivo nao selecionada:** Sistema exibe erro "Selecione a categoria do motivo de perda."
- **FE-03 — Erro ao registrar motivo:** Requisicao POST falha. Toast de erro. Modal preservado.
- **FE-04 — Motivo ja registrado para este edital:** Usuario tenta registrar novamente. Backend rejeita com "Motivo ja registrado para este edital. Use edicao para alterar."

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Card "Resultados Definitivos" > SubCard "Perdidos"

#### Layout da Tela

```
[Card Expandido: "Resultados Definitivos"] [ref: Passo 1]
  [SubCard: "Aguardando Homologacao"]
  [SubCard: "Ganhos"]
    [Botao: "Registrar Motivo de Sucesso"] — para ganhos via recurso [ref: Passo 17]
  [SubCard: "Perdidos"] [ref: Passo 1]

[Tabela: Editais Perdidos] [ref: Passos 2, 3, 4]
  [Coluna: "Numero"] (sortable)
  [Coluna: "Orgao"] (sortable)
  [Coluna: "Valor"] (render: formatCurrency)
  [Coluna: "Vencedor"]
  [Coluna: "Origem Perda"] — badge [ref: Passo 3]
    [Badge: "Perda Direta"] (bg: #fee2e2, fg: #991b1b)
    [Badge: "Perda apos CR"] (bg: #f3e8ff, fg: #7c3aed)
  [Coluna: "Motivo"] [ref: Passo 4]
    [Badge: "Pendente"] (bg: #fef3c7, fg: #92400e) — se nao registrado
    [Texto: "{categoria}"] — se registrado
  [Coluna: "Acao"]
    [Botao: "Registrar Motivo"] (size: sm, variant: primary) [ref: Passo 5]

[Modal: "Registrar Motivo de Perda — {numero}"] [ref: Passos 6-18]
  [Select: "Categoria do Motivo"] [ref: Passo 7]
    opcoes dinamicas: motivos parametrizados (UC-CRM02)
  [TextArea: "Descricao detalhada do motivo"] — obrigatorio, min 30 chars [ref: Passo 8]
    placeholder: "Descreva os motivos detalhados que levaram a perda..."
  [Checkbox: "Perda vinculada a Contra-Razao"] [ref: Passo 9]
  [TextArea: "Analise do processo de contra-razao"] — condicional [ref: Passo 10]
    placeholder: "Quais fatores levaram ao insucesso da contra-razao..."
  [Select: "Acao recomendada"] [ref: Passo 11]
    opcoes: "Revisar especificacoes tecnicas", "Revisar precificacao", "Melhorar documentacao", "Capacitar equipe", "Sem acao", "Outro"
  [TextInput: "Responsavel pela acao"] [ref: Passo 12]
  [Texto: "Registrado por: {nome_usuario} em {data_hora}"] (color: #6b7280, fontSize: 12) [ref: Passo 13]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 18]
  [Botao: "Registrar"] (variant: primary) [ref: Passo 14]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card Expandido: "Resultados Definitivos"] / [SubCard: "Perdidos"] | 1 |
| [Tabela: Editais Perdidos] | 2 |
| [Coluna: "Origem Perda"] / badges | 3 |
| [Badge: "Pendente"] na coluna Motivo | 4 |
| [Botao: "Registrar Motivo"] | 5 |
| [Modal: "Registrar Motivo de Perda"] | 6 |
| [Select: "Categoria do Motivo"] | 7 |
| [TextArea: "Descricao detalhada"] | 8 |
| [Checkbox: "Perda vinculada a CR"] | 9 |
| [TextArea: "Analise da contra-razao"] | 10 |
| [Select: "Acao recomendada"] | 11 |
| [TextInput: "Responsavel"] | 12 |
| [Texto: log do usuario] | 13 |
| [Botao: "Registrar"] | 14 |
| [Botao: "Registrar Motivo de Sucesso"] (em Ganhos) | 17 |
| [Botao: "Cancelar"] | 18 |

### Implementacao Atual
**Nao Implementado**

---

# RESUMO FINAL DE IMPLEMENTACAO

| UC | Nome | Fase | Pagina | Aba / Posicao | Status |
|----|------|------|--------|---------------|--------|
| UC-FU01 | Registrar Resultado | Follow-Up | FollowupPage | Aba "Resultados" | Implementado |
| UC-FU02 | Configurar Alertas de Prazo | Follow-Up | FollowupPage | Aba "Alertas" | Implementado |
| UC-FU03 | Score Logistico | Follow-Up | FollowupPage | Stat Card | Implementado |
| UC-AT01 | Buscar Atas no PNCP | Atas | AtasPage | Aba "Buscar" | Implementado |
| UC-AT02 | Extrair Resultados de Ata PDF | Atas | AtasPage | Aba "Extrair" | Implementado |
| UC-AT03 | Dashboard de Atas Consultadas | Atas | AtasPage | Aba "Minhas Atas" | Implementado |
| UC-CT06 | Saldo ARP / Controle de Carona | Atas | AtasPage | Aba "Saldo ARP" | Implementado |
| UC-CT01 | Cadastrar Contrato | Execucao | ProducaoPage | Aba "Contratos" | Implementado |
| UC-CT02 | Registrar Entrega + NF | Execucao | ProducaoPage | Aba "Entregas" | Implementado |
| UC-CT03 | Acompanhar Cronograma | Execucao | ProducaoPage | Aba "Cronograma" | Implementado |
| UC-CT04 | Gestao de Aditivos | Execucao | ProducaoPage | Aba "Aditivos" | Implementado |
| UC-CT05 | Designar Gestor/Fiscal | Execucao | ProducaoPage | Aba "Gestor/Fiscal" | Implementado |
| UC-CT07 | Gestao de Empenhos | Execucao | ProducaoPage | Aba "Empenhos" | Nao Implementado |
| UC-CT08 | Auditoria Empenhos x Faturas x Pedidos | Execucao | ProducaoPage | Aba "Empenhos" > Auditoria | Nao Implementado |
| UC-CT09 | Contratos a Vencer | Execucao | ProducaoPage | Aba "Contratos a Vencer" | Nao Implementado |
| UC-CT10 | KPIs de Execucao | Execucao | ProducaoPage | Secao KPIs | Nao Implementado |
| UC-CR01 | Dashboard Contratado x Realizado | C x R | ContratadoRealizadoPage | Secao Dashboard | Implementado |
| UC-CR02 | Pedidos em Atraso | C x R | ContratadoRealizadoPage | Secao Atrasos | Implementado |
| UC-CR03 | Alertas de Vencimento Multi-tier | C x R | ContratadoRealizadoPage | Secao Vencimentos | Implementado |
| UC-CRM01 | Pipeline de Cards do CRM | CRM | CRMPage | Secao Pipeline | Nao Implementado |
| UC-CRM02 | Parametrizacoes do CRM | CRM | CRMPage | Secao Parametrizacoes | Nao Implementado |
| UC-CRM03 | Mapa Geografico de Processos | CRM | CRMPage | Aba "Mapa" | Nao Implementado |
| UC-CRM04 | Agenda/Timeline de Etapas | CRM | CRMPage | Aba "Agenda" | Nao Implementado |
| UC-CRM05 | KPIs do CRM | CRM | CRMPage | Aba "KPIs" | Nao Implementado |
| UC-CRM06 | Registrar Decisao de Nao-Participacao | CRM | CRMPage | Card "Em Analise" | Nao Implementado |
| UC-CRM07 | Registrar Motivo de Perda | CRM | CRMPage | Card "Resultados Definitivos" | Nao Implementado |

**Totais:** 15 implementados + 0 parciais + 11 nao implementados = **26 casos de uso**

---

## Changelog V4 -> V5

| Alteracao | Detalhe |
|---|---|
| **Fluxos Alternativos (FA)** | Adicionados fluxos alternativos para cada um dos 26 UCs, cobrindo caminhos validos alternativos (contrato sem aditivo, empenho parcial, declinio sem monitoramento, CRM vazio, etc.) |
| **Fluxos de Excecao (FE)** | Adicionados fluxos de excecao para cada um dos 26 UCs, cobrindo erros e situacoes excepcionais (validacoes de campos, RNs violadas, timeouts, APIs indisponiveis, duplicidades, limites legais, etc.) |
| **Numeracao FA/FE** | FA-01, FA-02, FA-03... e FE-01, FE-02, FE-03... numerados dentro de cada UC |
| **Cobertura de RNs** | Fluxos de excecao referenciam RNs aplicaveis: RN-084 (cooldown), RN-206 (gestor!=fiscal), RN-207 (aditivo 25%), RN-209 (saldo entrega), RN-210 (itens sem valor), RN-211 (divergencia auditoria), RN-214 (email valido) |
| **Versao** | V4.0 (13/04/2026) -> V5.0 (21/04/2026) |

---

*Documento gerado em 21/04/2026. V5.0 — Adicionados Fluxos Alternativos (FA) e Fluxos de Excecao (FE) para todos os 26 casos de uso. Conteudo original da V4 integralmente preservado. Total de FAs: 72 fluxos alternativos. Total de FEs: 73 fluxos de excecao. Todas as RNs implementadas referenciadas nos fluxos de excecao correspondentes.*
