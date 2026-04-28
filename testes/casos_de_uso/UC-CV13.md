---
uc_id: UC-CV13
nome: "Usar IA na validacao: resumo, perguntas e acoes rapidas"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1795
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV13 — Usar IA na validacao: resumo, perguntas e acoes rapidas

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1795).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-075, RN-083 [FALTANTE->V4]

**RF relacionados:** RF-026, RF-029, RF-030

**Regras de Negocio aplicaveis:**
- Presentes: RN-075
- Faltantes: RN-083 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. Servico de chat/IA disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03 OU UC-CV07**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Usuario consegue resumir, perguntar e obter respostas especificas sobre o edital.
2. Respostas ficam refletidas na propria aba `IA`.

### Botoes e acoes observadas
Na aba `IA`:
- `Gerar Resumo`
- `Regerar Resumo`
- `Perguntar`
- `Requisitos Tecnicos`
- `Classificar Edital`

### Sequencia de eventos
1. Usuario abre a [Aba: "IA"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Na [Secao: "Resumo Gerado pela IA"], usuario clica no [Botao: "Gerar Resumo"] (ou [Botao: "Regerar Resumo"] se ja existir). [ref: Passo 2]
3. Sistema chama `/api/chat` com sessao de pagina e exibe o resumo formatado em markdown renderizado. [ref: Passo 3]
4. Na [Secao: "Pergunte a IA sobre este Edital"], usuario digita uma pergunta no [Campo: TextInput "Pergunta"] e clica no [Botao: "Perguntar"]. [ref: Passo 4]
5. Sistema responde via `/api/chat` e exibe a resposta na [Secao: "Resposta"]. [ref: Passo 5]
6. Na [Secao: "Acoes Rapidas via IA"], usuario pode clicar no [Botao: "Requisitos Tecnicos"] para listar requisitos tecnicos do edital. [ref: Passo 6]
7. Usuario pode clicar no [Botao: "Classificar Edital"] para obter classificacao (comodato/venda/aluguel/consumo/servico) com justificativa. [ref: Passo 7]
8. As respostas das acoes rapidas sao exibidas na mesma area de resposta da [Secao: "Pergunte a IA"]. [ref: Passo 8]

### Fluxos Alternativos (V5)

**FA-01 — Resumo ja gerado (Regerar)**
1. O edital ja teve resumo gerado anteriormente.
2. O resumo e exibido imediatamente.
3. O botao exibido e "Regerar Resumo".
4. Ao regerar, a IA produz novo resumo que pode diferir do anterior.

**FA-02 — Pergunta sem resposta clara no edital**
1. Usuario faz uma pergunta cuja resposta nao esta explicita no edital.
2. A IA responde indicando que a informacao nao foi encontrada no edital.
3. Ex: "O edital nao especifica explicitamente o prazo de garantia."

**FA-03 — Multiplas perguntas sequenciais**
1. Usuario faz varias perguntas em sequencia.
2. Cada resposta e exibida abaixo da anterior.
3. O historico de perguntas e respostas permanece visivel na aba.

**FA-04 — Classificacao do edital ambigua**
1. Usuario clica em "Classificar Edital".
2. A IA identifica mais de um tipo possivel (ex: comodato + consumo).
3. A resposta inclui ambas as classificacoes com justificativa para cada.

### Fluxos de Excecao (V5)

**FE-01 — Servico de chat/IA indisponivel**
1. Usuario clica em "Gerar Resumo", "Perguntar" ou acao rapida.
2. O endpoint `/api/chat` retorna erro (servico DeepSeek indisponivel).
3. Sistema exibe mensagem: "Servico de IA indisponivel. Tente novamente mais tarde."

**FE-02 — Timeout na geracao de resumo**
1. O resumo demora mais que o timeout para ser gerado.
2. Sistema exibe mensagem: "O resumo demorou mais que o esperado. Tente regerar."

**FE-03 — Escopo de chat violado (RN-083)**
1. Usuario faz pergunta que tenta acessar dados de outro edital.
2. O backend valida o escopo e bloqueia a requisicao.
3. Sistema exibe mensagem: "Pergunta fora do escopo deste edital."

**FE-04 — Cooldown de IA ativo (RN-084)**
1. Usuario tenta fazer pergunta ou acao rapida dentro do cooldown de 60 segundos.
2. O backend retorna HTTP 429.
3. Sistema exibe mensagem: "Aguarde 60 segundos antes de fazer nova pergunta."

**FE-05 — PDF do edital nao disponivel para resumo**
1. O edital nao possui PDF associado.
2. A IA gera resumo parcial baseado nos metadados do edital (objeto, valor, orgao).
3. O resumo inclui ressalva: "Resumo baseado em metadados — PDF do edital nao disponivel."

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 6 "IA" do Painel de Abas

#### Layout da Tela

[Aba: "IA"] icon Sparkles
  [Secao: "Resumo Gerado pela IA"] icon Sparkles [ref: Passo 2, 3]
    [Texto: "Resumo"] — markdown renderizado (h2, h3, bold, listas)
    [Botao: "Gerar Resumo"] icon Sparkles — visivel se nao ha resumo [ref: Passo 2]
    [Botao: "Regerar Resumo"] icon Sparkles — visivel se ja ha resumo [ref: Passo 2]
  [Secao: "Pergunte a IA sobre este Edital"] icon MessageSquare [ref: Passo 4]
    [Campo: TextInput "Pergunta"] — placeholder "Ex: Qual o prazo de entrega?" [ref: Passo 4]
    [Botao: "Perguntar"] icon MessageSquare [ref: Passo 4]
    [Secao: "Resposta"] — visivel apos resposta [ref: Passo 5, 8]
      [Texto: "Resposta da IA"] — markdown renderizado
  [Secao: "Acoes Rapidas via IA"] icon Sparkles [ref: Passo 6, 7]
    [Botao: "Requisitos Tecnicos"] icon Target [ref: Passo 6]
    [Botao: "Classificar Edital"] icon ClipboardCheck [ref: Passo 7]

[Modal: "Perguntar ao Edital {Numero}"] — alternativa modal (disparado em outro contexto)
  [Campo: TextArea "Sua pergunta"] — rows=3
  [Botao: "Enviar Pergunta"] icon MessageSquare
  [Secao: "Resposta"] — markdown renderizado

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "IA"] | 1 |
| [Botao: "Gerar Resumo"] / [Botao: "Regerar Resumo"] | 2 |
| [Texto: "Resumo"] renderizado | 3 |
| [Campo: TextInput "Pergunta"] + [Botao: "Perguntar"] | 4 |
| [Secao: "Resposta"] | 5, 8 |
| [Botao: "Requisitos Tecnicos"] | 6 |
| [Botao: "Classificar Edital"] | 7 |

### Implementacao atual
**IMPLEMENTADO**

---

## Veredicto Tecnico desta rodada sobre Sprint 2

`CaptacaoPage` e `ValidacaoPage` estao substancialmente implementadas e possuem mais funcionalidade real do que uma leitura superficial dos requisitos sugere.

Pontos fortes:
- a trilha de busca, exploracao, salvamento, exportacao e monitoramento de editais e real.
- a validacao tem abas funcionais bem definidas para aderencia, lotes, documentos, riscos, mercado e IA.
- existem integracoes concretas com PNCP, extracao de requisitos, analise de riscos, mercado e chat contextual.

Pontos criticos:
- a persistencia da decisao em `ValidacaoPage` esta inconsistente com o schema observado, porque `validacao_decisoes` nao existe no banco `editais` consultado em 30/03/2026.
- o fluxo `Verificar Certidoes` na aba `Documentos` aparenta enviar um `empresa_id` incorreto.

Conclusao objetiva:
- `Captacao`: **IMPLEMENTADA**
- `Validacao`: **IMPLEMENTADA COM DIVERGENCIAS PONTUAIS DE PERSISTENCIA E ACOPLAMENTO**
