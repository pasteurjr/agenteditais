---
uc_id: UC-FU02_S4_legacy
nome: "Configurar Alertas de Vencimento"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1779
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-FU02_S4_legacy — Configurar Alertas de Vencimento

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1779).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-045-02
**Ator:** Sistema (automatico) + Usuario (visualizacao)

### Pre-condicoes
1. Contratos e Atas de Registro de Preco (ARPs) cadastrados no sistema
2. Datas de vencimento definidas nos registros

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01 OU UC-AT01**


### Pos-condicoes
1. Vencimentos proximos exibidos com badges de urgencia
2. Regras de alerta visiveis para o usuario
3. Usuario informado sobre contratos e ARPs proximos do vencimento

### Sequencia de Eventos

1. Usuario acessa FollowupPage e clica na [Aba: "Alertas"]
2. [Secao: Summary Cards] exibe 5 contadores: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d)
3. [Card: "Proximos Vencimentos"] (icone Bell) carrega dados de contratos e ARPs
4. [Botao: "Atualizar"] (variant secondary) recarrega os dados
5. [Tabela: Proximos Vencimentos] exibe: Tipo (badge), Nome, Data, Dias, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul), arp (roxo), outro (amarelo)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho (<7d), laranja (7-15d), amarelo (15-30d), verde (>30d)
8. [Card: "Regras de Alerta Configuradas"] exibe tabela com regras configuradas no modulo de gestao
9. [Tabela: Regras] mostra: Tipo, 30d, 15d, 7d, 1d, Email, Push, Ativo (exibidos como checkmarks ou tracos)
10. Se sem vencimentos: [Texto: "Nenhum vencimento nos proximos 90 dias"]
11. Se sem regras: [Texto: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."]

### Fluxos Alternativos (V5)

**FA-01 — Nenhum vencimento nos proximos 90 dias**
1. Usuario acessa [Aba: "Alertas"]
2. Tabela de vencimentos esta vazia
3. Mensagem: "Nenhum vencimento nos proximos 90 dias"
4. Summary Cards exibem todos os contadores zerados
5. Card de Regras de Alerta ainda e exibido normalmente

**FA-02 — Atualizar dados manualmente**
1. Usuario percebe que dados podem estar desatualizados
2. Clica [Botao: "Atualizar"]
3. Sistema recarrega dados do backend
4. Tabela e Summary Cards atualizam
5. Novos contratos/ARPs cadastrados desde a ultima visita aparecem

**FA-03 — Multiplos contratos e ARPs com urgencias diferentes**
1. Tabela exibe contratos e ARPs com urgencias variadas
2. 1 contrato critico (< 7 dias) — badge vermelho
3. 2 ARPs urgentes (7-15 dias) — badge laranja
4. 3 contratos normais (> 30 dias) — badge verde
5. Summary Cards: Total=6, Critico=1, Urgente=2, Atencao=0, Normal=3

### Fluxos de Excecao (V5)

**FE-01 — Erro ao carregar dados de vencimentos**
1. Usuario acessa [Aba: "Alertas"]
2. Requisicao ao backend falha
3. Mensagem: "Erro ao carregar dados de vencimentos. Tente novamente."
4. [Botao: "Atualizar"] disponivel para retentativa

**FE-02 — Nenhuma regra de alerta configurada**
1. Card "Regras de Alerta Configuradas" esta vazio
2. Mensagem: "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar."
3. Usuario pode navegar para o modulo de gestao para configurar regras

**FE-03 — Datas de vencimento inconsistentes (data passada)**
1. Contrato com data de vencimento ja ultrapassada aparece na tabela
2. [Coluna: "Dias"] exibe valor negativo ou "VENCIDO"
3. [Coluna: "Urgencia"] exibe badge vermelho "Vencido"
4. Sistema destaca registro para acao imediata

### Tela(s) Representativa(s)

**Pagina:** FollowupPage (`/app/followup`)
**Posicao:** Aba "Alertas" (2a aba)

#### Layout da Tela

```
[Aba: "Resultados"] [Aba: "Alertas"]

[Secao: Summary Cards — grid 5 colunas] [ref: Passo 2]
  [Card: "Total"] (cor: #3b82f6)
  [Card: "Critico (<7d)"] (cor: #dc2626)
  [Card: "Urgente (7-15d)"] (cor: #f97316)
  [Card: "Atencao (15-30d)"] (cor: #eab308)
  [Card: "Normal (>30d)"] (cor: #16a34a)

[Card: "Proximos Vencimentos"] (icone Bell) [ref: Passo 3]
  [Botao: "Atualizar"] (variant secondary) [ref: Passo 4]
  [Texto: "Nenhum vencimento nos proximos 90 dias"] — se vazio [ref: Passo 10]

  [Tabela: Proximos Vencimentos] [ref: Passo 5]
    [Coluna: "Tipo"] — badge colorido [ref: Passo 6]
      [Badge: "contrato"] (background: #3b82f620, cor: #3b82f6)
      [Badge: "arp"] (background: #8b5cf620, cor: #8b5cf6)
      [Badge: "outro"] (background: #f59e0b20, cor: #f59e0b)
    [Coluna: "Nome"]
    [Coluna: "Data"] — toLocaleDateString
    [Coluna: "Dias"] — "{dias_restantes}d"
    [Coluna: "Urgencia"] — badge colorido [ref: Passo 7]
      [Badge: vermelho] — critico (<7d)
      [Badge: laranja] — urgente (7-15d)
      [Badge: amarelo] — atencao (15-30d)
      [Badge: verde] — normal (>30d)

[Card: "Regras de Alerta Configuradas"] [ref: Passos 8, 9]
  [Texto: "Nenhuma regra configurada..."] — se vazio [ref: Passo 11]

  [Tabela: Regras de Alerta] [ref: Passo 9]
    [Coluna: "Tipo"]
    [Coluna: "30d"] — checkmark ou traco
    [Coluna: "15d"] — checkmark ou traco
    [Coluna: "7d"] — checkmark ou traco
    [Coluna: "1d"] — checkmark ou traco
    [Coluna: "Email"] — checkmark ou traco
    [Coluna: "Push"] — checkmark ou traco
    [Coluna: "Ativo"] — checkmark ou x
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Alertas"] | 1 |
| [Summary Cards: Total/Critico/Urgente/Atencao/Normal] | 2 |
| [Card: "Proximos Vencimentos"] | 3 |
| [Botao: "Atualizar"] | 4 |
| [Tabela: Proximos Vencimentos] | 5 |
| [Coluna: "Tipo"] / badges contrato/arp | 6 |
| [Coluna: "Urgencia"] / badges coloridos | 7 |
| [Card: "Regras de Alerta Configuradas"] | 8 |
| [Tabela: Regras de Alerta] | 9 |
| [Texto: "Nenhum vencimento..."] | 10 |
| [Texto: "Nenhuma regra configurada..."] | 11 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
