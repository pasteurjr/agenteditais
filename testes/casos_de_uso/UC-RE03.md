---
uc_id: UC-RE03
nome: "Chatbox de Analise"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1033
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-RE03 — Chatbox de Analise

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1033).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-152
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-152

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Analise da proposta vencedora concluida (UC-RE02)
2. Dados do edital, proposta vencedora e inconsistencias carregados no contexto da IA
3. Base de legislacao e jurisprudencias disponivel

### Pos-condicoes
1. Conversa registrada no historico do edital
2. Insights adicionais identificados pela IA
3. Trechos relevantes salvos como notas para uso em laudos (UC-RE04/RE05)

### Sequencia de Eventos

1. Na [Aba: "Analise"], apos analise UC-RE02, usuario localiza [Card: "Analise Detalhada"] / secao de chat
2. Sistema carrega no contexto da IA: edital completo, proposta vencedora, inconsistencias, legislacao
3. Usuario digita pergunta no [TextInput: "Faca uma pergunta sobre a analise..."]
4. Clica [Botao: "Enviar"] (icone Send, variant primary) — mensagem enviada
5. [Texto: "Pensando..."] (icone Loader2) exibido enquanto IA processa
6. IA analisa pergunta no contexto dos documentos e retorna resposta na area de chat
7. Resposta aparece na area de historico de mensagens com referencias a paginas e artigos
8. Usuario pode continuar fazendo perguntas — conversa e cumulativa
9. Historico completo da conversa fica visivel na area de chat

### Fluxos Alternativos (V5)

**FA-01 — Pergunta sem relacao com o edital/proposta**
1. Usuario digita pergunta generica (ex: "Qual o PIB do Brasil?")
2. IA responde redirecionando para o contexto: "Esta analise e focada no edital e proposta em questao. Posso ajudar com duvidas sobre o edital, proposta vencedora ou legislacao aplicavel."
3. Chat continua disponivel para novas perguntas

**FA-02 — Multiplas perguntas em sequencia rapida**
1. Usuario envia 3 perguntas em menos de 30 segundos
2. Sistema processa cada pergunta na ordem de envio
3. Respostas aparecem sequencialmente no historico
4. Contexto cumulativo e mantido entre todas

**FA-03 — Usar insights do chat para fundamentar laudo**
1. IA responde com artigo de lei relevante para o caso
2. Usuario copia trecho da resposta
3. Cola no conteudo do laudo de recurso (UC-RE04) como fundamentacao adicional
4. Historico do chat permanece disponivel para consulta

### Fluxos de Excecao (V5)

**FE-01 — Pergunta enviada sem texto**
1. Usuario clica [Botao: "Enviar"] com [TextInput] vazio
2. Sistema ignora — nenhuma mensagem e enviada
3. Nenhuma acao ocorre

**FE-02 — Timeout na resposta da IA**
1. IA nao responde em 60 segundos
2. [Texto: "Pensando..."] e substituido por mensagem: "Tempo limite excedido. Tente reformular a pergunta."
3. Historico anterior e preservado
4. Campo de input continua disponivel

**FE-03 — Analise do UC-RE02 nao realizada**
1. Usuario acessa o chatbox sem ter realizado a analise da proposta (UC-RE02)
2. IA responde com contexto limitado (apenas edital, sem proposta vencedora)
3. Aviso: "Analise da proposta vencedora nao realizada. Respostas podem ser limitadas."

**FE-04 — Cooldown da IA ativo (RN-084)**
1. Usuario envia pergunta menos de 60s apos ultima interacao IA
2. Mensagem: "Aguarde {N} segundos antes de enviar nova pergunta."
3. [Botao: "Enviar"] desabilitado temporariamente

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Analise" (2a aba) — secao Chatbox dentro do Card "Analise Detalhada"

#### Layout da Tela

```
[Card: "Analise Detalhada"] (icone Shield)
  [Card: "Perguntas sobre a Analise"] (icone MessageSquare) [ref: Passo 1]

    [Secao: "Historico de mensagens"] — area de exibicao do chat [ref: Passos 6, 7, 9]
      [Texto: mensagens do usuario] — alinhamento direita
      [Texto: respostas da IA] — alinhamento esquerda
      [Texto: "Pensando..."] (icone Loader2) — durante processamento [ref: Passo 5]

    [TextInput: "Faca uma pergunta sobre a analise..."] [ref: Passo 3]
    [Botao: "Enviar"] (icone Send, variant primary) [ref: Passos 4, 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Perguntas sobre a Analise"] | 1 |
| [TextInput: "Faca uma pergunta..."] | 3, 8 |
| [Botao: "Enviar"] | 4, 8 |
| [Texto: "Pensando..."] | 5 |
| [Secao: "Historico de mensagens"] | 6, 7, 9 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
