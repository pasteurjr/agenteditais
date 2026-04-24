---
uc_id: UC-I03
nome: "Gerar Peticao de Impugnacao"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 356
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-I03 — Gerar Peticao de Impugnacao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 356).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-043-03

**Regras de Negocio aplicaveis:**
- Presentes: RN-133, RN-134, RN-139, RN-140, RN-153
- Faltantes: RN-157 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-133, RN-134, RN-139, RN-140, RN-153, RN-157 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Inconsistencias classificadas e tipo de peticao definido (UC-I02)
2. Pelo menos uma inconsistencia marcada como "Impugnacao"
3. Base de legislacao e jurisprudencias disponivel
4. Templates de peticao configurados (padrao ou customizado)

### Pos-condicoes
1. Peticao de impugnacao gerada com texto completo
2. Peticao contem: identificacao de inconsistencias, base legal, jurisprudencias aplicaveis
3. Documento salvo em status "rascunho" com LOG de criacao
4. Peticao disponivel para edicao e exportacao

### Sequencia de Eventos

1. Usuario esta na [Aba: "Peticoes"] da ImpugnacaoPage com edital selecionado
2. Clica [Botao: "Nova Peticao"] (icone Plus) — Modal "Nova Peticao" abre
3. Preenche [Select: "Edital"], [Select: "Tipo"] = "Impugnacao", [Select: "Template"]
4. Opcionalmente preenche [TextArea: "Conteudo"] com conteudo inicial
5. Clica [Botao: "Criar"] — peticao criada com status "rascunho"
6. Peticao aparece na [Tabela: Peticoes]; usuario clica [Icone-Acao: Eye] para abrir editor
7. [Card: "Editando: {edital_numero} - {tipo}"] (icone Edit3) exibe editor com conteudo gerado
8. [TextArea] do editor exibe o texto completo da peticao — 100% editavel (rows: 18)
9. Usuario clica [Botao: "Gerar Peticao"] (icone Lightbulb, variant primary) para solicitar geracao via IA
10. IA gera documento completo com 5 secoes: Qualificacao, Fatos, Direito, Jurisprudencias, Pedido
11. Usuario revisa e edita livremente no [TextArea] do editor
12. Clica [Botao: "Salvar Rascunho"] (icone Save) para salvar sem mudar status
13. Clica [Botao: "Enviar para Revisao"] (icone Send) para mudar status para "Em Revisao"
14. Opcionalmente exporta: [Botao: "PDF"] ou [Botao: "DOCX"] (icone Download)

### Fluxos Alternativos (V5)

**FA-01 — Gerar peticao sem conteudo inicial (IA gera do zero)**
1. Usuario cria peticao com [TextArea: "Conteudo"] vazio (Passo 4 omitido)
2. Abre editor (Passo 6-7) — [TextArea] esta vazio
3. Clica [Botao: "Gerar Peticao"] (Passo 9)
4. IA gera peticao completa baseada apenas nas inconsistencias do edital
5. Fluxo continua no Passo 10

**FA-02 — Editar peticao gerada e salvar multiplas vezes**
1. IA gera peticao (Passo 10)
2. Usuario edita trecho do texto (Passo 11)
3. Clica [Botao: "Salvar Rascunho"] — salva versao 1
4. Edita novamente — adiciona novo argumento juridico
5. Clica [Botao: "Salvar Rascunho"] novamente — salva versao 2
6. Todas as versoes sao salvas com LOG de edicao

**FA-03 — Exportar em DOCX ao inves de PDF**
1. Apos revisao do texto (Passo 11)
2. Usuario clica [Botao: "DOCX"] ao inves de [Botao: "PDF"]
3. Sistema gera arquivo DOCX com o conteudo da peticao
4. Download do arquivo DOCX inicia automaticamente

**FA-04 — Pular revisao e enviar diretamente para revisao**
1. IA gera peticao (Passo 10)
2. Usuario aceita o texto sem edicao
3. Clica diretamente [Botao: "Enviar para Revisao"] sem editar ou salvar rascunho
4. Status muda para "Em Revisao"

### Fluxos de Excecao (V5)

**FE-01 — IA falha ao gerar peticao (timeout ou erro)**
1. Usuario clica [Botao: "Gerar Peticao"] (Passo 9)
2. Requisicao a IA excede timeout (120 segundos) ou retorna erro
3. Mensagem: "Erro ao gerar peticao via IA. Tente novamente."
4. [TextArea] do editor mantem conteudo anterior (se houver)
5. [Botao: "Gerar Peticao"] e reabilitado

**FE-02 — Exportacao PDF falha**
1. Usuario clica [Botao: "PDF"] (Passo 14)
2. Erro na geracao do PDF (conteudo vazio ou problema no servidor)
3. Mensagem: "Erro ao exportar PDF. Verifique o conteudo da peticao."
4. Sistema sugere salvar rascunho primeiro

**FE-03 — Peticao sem secoes obrigatorias ao enviar para revisao**
1. Usuario edita peticao e remove secoes obrigatorias (ex: remove "Do Pedido")
2. Clica [Botao: "Enviar para Revisao"]
3. Sistema aceita a peticao (sem validacao de secoes nesta fase — e recomendacao, nao bloqueio)
4. Aviso (warning): "Recomendamos incluir todas as secoes obrigatorias antes do envio."

**FE-04 — Cooldown da IA ativo ao gerar peticao (RN-084)**
1. Usuario clica [Botao: "Gerar Peticao"] menos de 60s apos ultima chamada IA
2. Cooldown ativo (RN-084)
3. Mensagem: "Aguarde {N} segundos antes de gerar nova peticao."
4. Botao desabilitado temporariamente

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — painel de edicao de peticao

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes" (badge: N)] [Aba: "Prazos"]

[Card: "Peticoes"] (icone FileText)
  [Botao: "Nova Peticao"] (icone Plus, variant primary) [ref: Passo 2]
  [Botao: "Upload Peticao"] (icone Upload)

  [Tabela: Peticoes]
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — abrir editor [ref: Passo 6]
      [Icone-Acao: Trash2] — excluir

[Card: "Editando: {edital_numero} - {tipo}"] (icone Edit3) [ref: Passo 7]
  [Botao: "Gerar Peticao"] (icone Lightbulb, variant primary) [ref: Passo 9]
  [TextArea] — editor de texto rico, rows 18, 100% editavel [ref: Passos 8, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 12]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary) [ref: Passo 13]
  [Botao: "PDF"] (icone Download) [ref: Passo 14]
  [Botao: "DOCX"] (icone Download) [ref: Passo 14]

[Modal: "Nova Peticao"] (disparado por [Botao: "Nova Peticao"]) [ref: Passos 3-5]
  [Select: "Edital"] [ref: Passo 3]
  [Select: "Tipo"] — "Impugnacao" [ref: Passo 3]
  [Select: "Template"] [ref: Passo 3]
  [TextArea: "Conteudo"] — rows 8, opcional [ref: Passo 4]
  [Botao: "Cancelar"]
  [Botao: "Criar"] (variant primary) [ref: Passo 5]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Nova Peticao"] | 2 |
| [Modal: "Nova Peticao"] | 3, 4, 5 |
| [Select: "Edital"] no modal | 3 |
| [Select: "Tipo"] = "Impugnacao" | 3 |
| [Select: "Template"] | 3 |
| [TextArea: "Conteudo"] no modal | 4 |
| [Botao: "Criar"] | 5 |
| [Icone-Acao: Eye] na tabela | 6 |
| [Card: "Editando: ..."] | 7 |
| [TextArea] editor | 8, 11 |
| [Botao: "Gerar Peticao"] | 9 |
| [Botao: "Salvar Rascunho"] | 12 |
| [Botao: "Enviar para Revisao"] | 13 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 14 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
