---
uc_id: UC-RE01
nome: "Monitorar Janela de Recurso"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 756
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-RE01 — Monitorar Janela de Recurso

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 756).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-143, RN-144, RN-145
- Faltantes: RN-158 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-143, RN-144, RN-145, RN-158 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (configuracao)

### Pre-condicoes
1. Edital em fase pos-disputa (lances encerrados)
2. Resultado do certame publicado ou em vias de publicacao
3. Canais de notificacao configurados (WhatsApp, email, alerta sistema)
4. Portal gov.br acessivel para monitoramento

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Abertura da janela de recurso detectada automaticamente
2. Notificacoes enviadas em ate 10 minutos apos abertura
3. Intencao de recurso registrada se manifestada pelo usuario
4. LOG de monitoramento completo registrado

### Sequencia de Eventos

1. Usuario acessa RecursosPage (`/app/recursos`) via menu lateral "Recursos"
2. Clica na [Aba: "Monitoramento"] (icone Eye) — primeira aba do painel
3. No [Card: "Monitoramento de Janela de Recurso"], seleciona edital em [Select: "Selecione um edital..."]
4. Ativa canais de notificacao: [Checkbox: "WhatsApp"], [Checkbox: "Email"], [Checkbox: "Alerta no sistema"]
5. Clica [Botao: "Ativar Monitoramento"] (icone Activity, variant primary/success) — sistema inicia monitoramento periodico
6. Indicador de status muda: "Monitoramento Inativo" -> "Aguardando" -> "JANELA ABERTA"
7. Quando janela e detectada: indicador exibe [Badge: "JANELA ABERTA"] com tempo restante para manifestacao
8. Sistema dispara notificacoes imediatas nos canais ativos (WhatsApp, Email, Alerta sistema)
9. Usuario, notificado, acessa a pagina e visualiza o timer de manifestacao
10. Clica [Botao: "Registrar Intencao de Recurso"] (icone Gavel, variant danger) para manifestar intencao
11. Intencao registrada no banco vinculada ao edital — status atualizado

### Fluxos Alternativos (V5)

**FA-01 — Ativar monitoramento com apenas 1 canal de notificacao**
1. Usuario marca apenas [Checkbox: "Email"] (Passo 4)
2. Desmarca WhatsApp e Alerta no sistema
3. Clica [Botao: "Ativar Monitoramento"] — sistema aceita com 1 canal
4. Notificacoes serao enviadas apenas por email
5. Fluxo continua normalmente

**FA-02 — Desativar monitoramento apos ativacao**
1. Monitoramento esta ativo (status "Aguardando")
2. Usuario clica [Botao: "Desativar Monitoramento"] (que substitui "Ativar Monitoramento" apos ativacao)
3. Status volta para "Monitoramento Inativo"
4. Sistema para de monitorar a janela de recurso

**FA-03 — Janela de recurso ja encerrada ao acessar**
1. Usuario acessa RecursosPage e seleciona edital (Passo 3)
2. Sistema detecta que a janela de recurso ja foi encerrada
3. Status exibe [Badge: "Encerrada"] (icone CheckCircle)
4. [Botao: "Registrar Intencao de Recurso"] desabilitado
5. Mensagem: "Janela de recurso encerrada em {data}"

### Fluxos de Excecao (V5)

**FE-01 — Nenhum canal de notificacao selecionado**
1. Usuario nao marca nenhum checkbox de canal (Passo 4)
2. Clica [Botao: "Ativar Monitoramento"]
3. Validacao: "Selecione pelo menos um canal de notificacao."
4. Monitoramento nao e ativado

**FE-02 — Portal gov.br inacessivel**
1. Sistema tenta monitorar a janela no portal (Passo 5-6)
2. Portal gov.br esta fora do ar ou inacessivel
3. Status exibe [Badge: "Erro de Conexao"] com icone AlertTriangle
4. Sistema tenta novamente em intervalos de 5 minutos
5. Mensagem: "Nao foi possivel acessar o portal. Retentativa automatica em {N} minutos."

**FE-03 — Intencao de recurso registrada fora do prazo**
1. Timer de manifestacao expirou (janela de intencao encerrada)
2. Usuario clica [Botao: "Registrar Intencao de Recurso"]
3. Sistema rejeita: "Prazo para manifestacao de intencao de recurso expirado."
4. Botao e desabilitado

**FE-04 — Edital sem resultado publicado**
1. Usuario seleciona edital que ainda nao tem resultado de licitacao publicado
2. Sistema nao encontra dados de resultado no portal
3. Mensagem: "Resultado do certame ainda nao publicado para este edital."
4. [Botao: "Ativar Monitoramento"] permanece habilitado — monitoramento ira aguardar publicacao

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Monitoramento" (1a aba)

#### Layout da Tela

```
[Cabecalho: "RECURSOS E CONTRA-RAZOES"]
  [Texto: "Monitoramento, analise e geracao de laudos"]

[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Monitoramento de Janela de Recurso"] (icone Eye) [ref: Passos 3-10]
  [Select: "Selecione um edital..."] [ref: Passo 3]

  [Secao: "Status do Monitoramento"] [ref: Passo 6]
    [Badge: "Monitoramento Inativo"] — estado inicial (icone AlertTriangle)
    [Badge: "Aguardando"] — monitoramento ativo (icone Clock)
    [Badge: "JANELA ABERTA"] — janela detectada (icone AlertTriangle, vermelho) [ref: Passo 7]
    [Badge: "Encerrada"] — janela fechada (icone CheckCircle)
    [Texto: "Tempo restante: {tempoRestante}"] — timer exibido quando janela aberta [ref: Passo 9]

  [Secao: "Canais de Notificacao"] [ref: Passo 4]
    [Checkbox: "WhatsApp"]
    [Checkbox: "Email"]
    [Checkbox: "Alerta no sistema"]

  [Botao: "Ativar Monitoramento"] (icone Activity, variant primary) [ref: Passo 5]
  [Botao: "Registrar Intencao de Recurso"] (icone Gavel, variant danger) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Monitoramento"] | 2 |
| [Select: "Selecione um edital..."] | 3 |
| [Checkbox: "WhatsApp"] | 4 |
| [Checkbox: "Email"] | 4 |
| [Checkbox: "Alerta no sistema"] | 4 |
| [Botao: "Ativar Monitoramento"] | 5 |
| [Badge: status do monitoramento] | 6, 7, 9 |
| [Botao: "Registrar Intencao de Recurso"] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
