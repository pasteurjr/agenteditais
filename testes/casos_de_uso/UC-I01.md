---
uc_id: UC-I01
nome: "Validacao Legal do Edital"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 84
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-I01 — Validacao Legal do Edital

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 84).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-043-01

**Regras de Negocio aplicaveis:**
- Presentes: RN-135, RN-136, RN-137
- Faltantes: RN-161 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-135, RN-136, RN-137, RN-161 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital foi salvo na CaptacaoPage (status "salvo" no banco)
3. Documento do edital esta disponivel (PDF importado ou texto extraido)
4. Base de legislacao configurada (Lei 14.133/2021, decretos regulamentadores, jurisprudencias)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[seed]` — dado pre-cadastrado no banco (seed)


### Pos-condicoes
1. Relatorio de validacao legal gerado com inconsistencias classificadas
2. Cada inconsistencia tem gravidade (ALTA, MEDIA, BAIXA)
3. Sugestao de acao por inconsistencia (Impugnacao ou Esclarecimento)
4. Relatorio salvo no banco vinculado ao edital
5. LOG de analise registrado

### Sequencia de Eventos

1. Usuario acessa **ImpugnacaoPage** (`/app/impugnacao`) via menu lateral "Impugnacao"
2. Clica na [Aba: "Validacao Legal"] — exibida como primeira aba do painel
3. No [Card: "Analise de Conformidade Legal"], seleciona edital em [Select: "Selecione o Edital"] — lista editais salvos no sistema
4. Sistema verifica disponibilidade do PDF do edital selecionado
5. Usuario clica [Botao: "Analisar Edital"] (icone Search) — dispara requisicao ao agente IA
6. IA le o edital completo, identifica leis aplicaveis e compara clausula por clausula
7. IA retorna lista de inconsistencias com trecho, lei violada, gravidade e sugestao
8. [Card: "Resultado da Analise"] exibe [Tabela: Inconsistencias] com todas as inconsistencias detectadas
9. [Badge] de gravidade classifica cada item: ALTA (vermelho), MEDIA (amarelo), BAIXA (verde)
10. [Badge] na coluna Sugestao indica tipo recomendado: "Impugnacao" (error) ou "Esclarecimento" (info)
11. Usuario revisa cada inconsistencia na tabela
12. Opcionalmente navega para aba Peticoes para gerar peticao baseada nas inconsistencias

### Fluxos Alternativos (V5)

**FA-01 — Edital sem inconsistencias detectadas**
1. IA processa o edital completo (Passo 6)
2. IA nao detecta nenhuma inconsistencia legal
3. [Card: "Resultado da Analise"] exibe mensagem: "Nenhuma inconsistencia detectada. Edital em conformidade com a legislacao vigente."
4. Tabela de inconsistencias permanece vazia
5. Usuario pode prosseguir para outros UCs ou selecionar outro edital

**FA-02 — Re-analisar edital apos alteracao**
1. Usuario ja executou analise anterior para o mesmo edital
2. Seleciona o mesmo edital no [Select: "Selecione o Edital"]
3. Clica novamente em [Botao: "Analisar Edital"]
4. Sistema sobrescreve resultado anterior com nova analise
5. Nova tabela de inconsistencias e exibida (pode diferir da anterior se o edital foi atualizado)

**FA-03 — Selecionar edital diferente durante revisao**
1. Usuario esta revisando inconsistencias de um edital (Passo 11)
2. Seleciona outro edital no [Select: "Selecione o Edital"]
3. Tabela de inconsistencias e limpa
4. Sistema aguarda novo clique em "Analisar Edital" para processar o novo edital

### Fluxos de Excecao (V5)

**FE-01 — Edital sem PDF disponivel**
1. Usuario seleciona edital no Passo 3
2. Sistema detecta que o PDF do edital nao esta disponivel (nao foi importado ou arquivo corrompido)
3. Mensagem de erro: "PDF do edital nao encontrado. Importe o documento na CaptacaoPage antes de analisar."
4. [Botao: "Analisar Edital"] permanece desabilitado ate que o PDF esteja disponivel

**FE-02 — Falha na comunicacao com o agente IA (timeout)**
1. Usuario clica [Botao: "Analisar Edital"] (Passo 5)
2. Requisicao ao agente IA excede o timeout (120 segundos)
3. Mensagem de erro: "Tempo limite excedido na analise. Tente novamente em alguns minutos."
4. [Texto: "Analisando..."] e substituido pela mensagem de erro
5. [Botao: "Analisar Edital"] e reabilitado para nova tentativa

**FE-03 — Nenhum edital salvo no sistema**
1. Usuario acessa [Aba: "Validacao Legal"] (Passo 2)
2. [Select: "Selecione o Edital"] esta vazio — nenhum edital salvo
3. Mensagem informativa: "Nenhum edital disponivel. Salve um edital na CaptacaoPage primeiro."
4. [Botao: "Analisar Edital"] permanece desabilitado

**FE-04 — Cooldown da IA ativo (RN-084)**
1. Usuario clica [Botao: "Analisar Edital"] menos de 60 segundos apos ultima invocacao da IA
2. Sistema bloqueia a requisicao por cooldown (RN-084)
3. Mensagem: "Aguarde {N} segundos antes de realizar nova analise (cooldown ativo)."
4. Botao permanece desabilitado ate fim do cooldown

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Validacao Legal" (1a aba)

#### Layout da Tela

```
[Cabecalho: "IMPUGNACAO E ESCLARECIMENTOS"]
  [Texto: "Analise legal e peticoes para editais"]

[Aba: "Validacao Legal"] [Aba: "Peticoes"] [Aba: "Prazos"]

[Card: "Analise de Conformidade Legal"] (icone Scale)
  [Select: "Selecione o Edital"] — lista editais salvos [ref: Passo 3]
  [Botao: "Analisar Edital"] (icone Search, variant primary) [ref: Passo 5]
  [Texto: "Analisando..."] (icone Loader2, exibido durante processamento) [ref: Passo 6]

[Card: "Resultado da Analise"] (icone Shield) [ref: Passo 8]
  [Tabela: Inconsistencias]
    [Coluna: "#"] — numero sequencial
    [Coluna: "Trecho"] — trecho do edital com a inconsistencia
    [Coluna: "Lei Violada"] — artigo de lei, decreto ou jurisprudencia
    [Coluna: "Gravidade"] — render com badge colorido [ref: Passo 9]
      [Badge: "ALTA"] (status-badge-error / vermelho)
      [Badge: "MEDIA"] (status-badge-warning / amarelo)
      [Badge: "BAIXA"] (status-badge-info / verde)
    [Coluna: "Sugestao"] — tipo recomendado [ref: Passo 10]
      [Badge: "Impugnacao"] (error)
      [Badge: "Esclarecimento"] (info)
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Validacao Legal"] | 2 |
| [Card: "Analise de Conformidade Legal"] | 3, 5 |
| [Select: "Selecione o Edital"] | 3 |
| [Botao: "Analisar Edital"] | 5 |
| [Texto: "Analisando..."] | 6 |
| [Card: "Resultado da Analise"] | 8 |
| [Tabela: Inconsistencias] | 8 |
| [Coluna: "Gravidade"] / [Badge: ALTA/MEDIA/BAIXA] | 9 |
| [Coluna: "Sugestao"] / [Badge: Impugnacao/Esclarecimento] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
