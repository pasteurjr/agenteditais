---
uc_id: UC-RE02
nome: "Analisar Proposta Vencedora"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 894
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-RE02 — Analisar Proposta Vencedora

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 894).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-137, RN-154
- Faltantes: RN-161 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-137, RN-154, RN-161 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Resultado do certame publicado
2. Proposta vencedora disponivel para analise (documento ou dados do portal)
3. Edital completo com requisitos tecnicos e legais disponivel
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Relatorio de analise da proposta vencedora gerado
2. Inconsistencias na proposta vencedora identificadas e classificadas
3. Comparativo proposta vs edital vs legislacao documentado
4. Subsidios para recurso prontos

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Analise"] (icone Search)
2. No [Card: "Analise de Proposta Vencedora"], seleciona edital em [Select: "Selecione um edital..."]
3. Preenche [TextArea: "Texto da Proposta Vencedora"] com o texto da proposta (cole aqui)
4. Clica [Botao: "Analisar Proposta Vencedora"] (icone Search, variant primary)
5. Sistema exibe [Texto: "Analisando proposta vencedora..."] (icone Loader2) durante processamento
6. IA compara proposta vencedora com: requisitos do edital, legislacao aplicavel, jurisprudencias
7. [Card: "Inconsistencias Identificadas"] (icone AlertTriangle) exibe [Tabela: Inconsistencias Vencedora]
8. [Tabela] mostra: #, Item, Inconsistencia, Motivacao Recurso, Gravidade (ALTA/MEDIA/BAIXA)
9. [Card: "Analise Detalhada"] (icone Shield) exibe analise juridica com artigos e recomendacao
10. Usuario pode clicar [Botao: "Enviar"] para fazer perguntas no chatbox (UC-RE03)
11. Usuario navega para [Aba: "Laudos"] para gerar laudo de recurso (UC-RE04)

### Fluxos Alternativos (V5)

**FA-01 — Proposta vencedora sem inconsistencias**
1. IA analisa a proposta (Passo 6)
2. Nenhuma inconsistencia identificada — proposta vencedora em conformidade
3. [Card: "Inconsistencias Identificadas"] exibe mensagem: "Nenhuma inconsistencia identificada na proposta vencedora."
4. [Card: "Analise Detalhada"] recomenda: "Nao ha fundamento para recurso com base na analise tecnica/legal."
5. Usuario decide nao prosseguir com recurso

**FA-02 — Colar texto parcial da proposta**
1. Usuario cola apenas parte da proposta no [TextArea] (Passo 3)
2. IA analisa com base no texto parcial
3. [Card: "Analise Detalhada"] inclui aviso: "Analise baseada em texto parcial — resultados podem estar incompletos."
4. Inconsistencias identificadas sao listadas normalmente

**FA-03 — Re-analisar proposta com texto atualizado**
1. Usuario ja realizou analise (Passo 7-9 concluidos)
2. Altera o texto no [TextArea] (adiciona mais trechos)
3. Clica novamente [Botao: "Analisar Proposta Vencedora"]
4. Nova analise sobrescreve a anterior
5. Tabela de inconsistencias atualizada

### Fluxos de Excecao (V5)

**FE-01 — TextArea vazio ao clicar analisar**
1. Usuario nao preenche [TextArea: "Texto da Proposta Vencedora"]
2. Clica [Botao: "Analisar Proposta Vencedora"]
3. Validacao: "Cole o texto da proposta vencedora antes de analisar."
4. Analise nao e disparada

**FE-02 — Nenhum edital selecionado**
1. Usuario preenche [TextArea] mas nao seleciona edital
2. Clica [Botao: "Analisar Proposta Vencedora"]
3. Validacao: "Selecione um edital antes de analisar."

**FE-03 — Timeout na analise da IA**
1. Requisicao a IA excede 120 segundos
2. Mensagem: "Analise excedeu o tempo limite. Tente novamente ou reduza o tamanho do texto."
3. [Texto: "Analisando..."] e substituido pela mensagem de erro

**FE-04 — Texto da proposta muito curto (menos de 50 caracteres)**
1. Usuario cola texto muito curto no [TextArea] (ex: "proposta do licitante X")
2. IA nao consegue gerar analise significativa
3. Mensagem: "Texto da proposta insuficiente para analise. Cole o texto completo da proposta vencedora."

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Analise" (2a aba)

#### Layout da Tela

```
[Aba: "Monitoramento"] [Aba: "Analise"] [Aba: "Laudos" (badge: N)]

[Card: "Analise de Proposta Vencedora"] (icone Search) [ref: Passos 2-4]
  [Select: "Selecione um edital..."] [ref: Passo 2]
  [TextArea: "Texto da Proposta Vencedora (cole aqui)"] — rows 6 [ref: Passo 3]
  [Botao: "Analisar Proposta Vencedora"] (icone Search, variant primary) [ref: Passo 4]
  [Texto: "Analisando proposta vencedora..."] (icone Loader2) [ref: Passo 5]

[Card: "Inconsistencias Identificadas"] (icone AlertTriangle) [ref: Passo 7]
  [Tabela: Inconsistencias Vencedora] [ref: Passo 8]
    [Coluna: "#"] — numero sequencial (width: 50px)
    [Coluna: "Item"] — aspecto avaliado
    [Coluna: "Inconsistencia"] — descricao do desvio
    [Coluna: "Motivacao Recurso"] — fundamento para recurso
    [Coluna: "Gravidade"] — badge colorido (width: 110px) [ref: Passo 8]
      [Badge: "ALTA"] (error)
      [Badge: "MEDIA"] (warning)
      [Badge: "BAIXA"] (info)

[Card: "Analise Detalhada"] (icone Shield) [ref: Passo 9]
  [Secao: "Perguntas sobre a Analise"] (icone MessageSquare) [ref: Passo 10]
    [Secao: "Historico de mensagens"] — area de chat usuario/IA
    [TextInput: "Faca uma pergunta sobre a analise..."] [ref: Passo 10]
    [Botao: "Enviar"] (icone Send, variant primary) [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Analise"] | 1 |
| [Card: "Analise de Proposta Vencedora"] | 2, 3, 4 |
| [Select: "Selecione um edital..."] | 2 |
| [TextArea: "Texto da Proposta Vencedora"] | 3 |
| [Botao: "Analisar Proposta Vencedora"] | 4 |
| [Texto: "Analisando..."] (Loader2) | 5 |
| [Card: "Inconsistencias Identificadas"] | 7 |
| [Tabela: Inconsistencias Vencedora] | 8 |
| [Coluna: "Gravidade"] / badges | 8 |
| [Card: "Analise Detalhada"] | 9 |
| [TextInput: pergunta] / [Botao: "Enviar"] | 10 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
