---
uc_id: UC-I02
nome: "Sugerir Esclarecimento ou Impugnacao"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 225
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-I02 — Sugerir Esclarecimento ou Impugnacao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 225).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-043-02

**Regras de Negocio aplicaveis:**
- Presentes: RN-134, RN-138
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-134, RN-138

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Validacao legal concluida (UC-I01)
2. Inconsistencias detectadas e classificadas por gravidade
3. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Cada inconsistencia tem tipo de peticao sugerido (Impugnacao ou Esclarecimento)
2. Justificativa da sugestao registrada
3. Usuario validou e confirmou as sugestoes

### Sequencia de Eventos

1. Apos analise UC-I01, usuario clica na [Aba: "Peticoes"]
2. [Card: "Peticoes"] exibe lista de peticoes vinculadas ao edital selecionado
3. A coluna "Tipo" da [Tabela: Peticoes] reflete a sugestao da IA para cada item: "Esclarecimento" ou "Impugnacao"
4. [Badge] na coluna "Status" indica estado atual de cada peticao (Rascunho, Em Revisao, Enviada)
5. Usuario clica [Botao: "Nova Peticao"] (icone Plus) para criar peticao baseada em inconsistencia detectada
6. Modal "Nova Peticao" abre — usuario preenche [Select: "Edital"], [Select: "Tipo"] (Esclarecimento ou Impugnacao), [Select: "Template"] e [TextArea: "Conteudo"]
7. Usuario clica [Botao: "Criar"] no rodape do modal — peticao criada com status "rascunho"
8. Peticao aparece na [Tabela: Peticoes] com tipo e status atualizados

> Nota: UC-I02 e UC-I03 compartilham a aba "Peticoes". UC-I02 foca na sugestao/classificacao; UC-I03 foca na geracao via IA.

### Fluxos Alternativos (V5)

**FA-01 — Criar peticao sem template (conteudo em branco)**
1. Usuario clica [Botao: "Nova Peticao"] (Passo 5)
2. Seleciona [Select: "Template"] = "Nenhum (em branco)"
3. Deixa [TextArea: "Conteudo"] vazio
4. Clica [Botao: "Criar"]
5. Peticao criada com conteudo vazio em status "rascunho" — usuario pode editar depois no editor (UC-I03)

**FA-02 — Criar peticao de tipo diferente do sugerido pela IA**
1. IA sugere "Esclarecimento" para uma inconsistencia
2. Usuario avalia que a situacao requer "Impugnacao"
3. No modal, seleciona [Select: "Tipo"] = "Impugnacao" (contrariando a sugestao da IA)
4. Peticao criada com o tipo definido pelo usuario
5. Sistema aceita a decisao do usuario sem restricao

**FA-03 — Criar multiplas peticoes para o mesmo edital**
1. Usuario ja criou uma peticao para o edital (Passo 8)
2. Clica novamente em [Botao: "Nova Peticao"]
3. Cria segunda peticao (ex: Esclarecimento + Impugnacao separados)
4. Ambas aparecem na [Tabela: Peticoes] vinculadas ao mesmo edital

### Fluxos de Excecao (V5)

**FE-01 — Nenhum edital selecionado no modal**
1. Usuario clica [Botao: "Nova Peticao"] (Passo 5)
2. Deixa [Select: "Edital"] sem selecao
3. Clica [Botao: "Criar"]
4. Validacao: mensagem "Selecione um edital" — modal nao fecha
5. Campo [Select: "Edital"] e destacado como obrigatorio

**FE-02 — Tipo de peticao nao selecionado**
1. Usuario preenche [Select: "Edital"] mas nao seleciona [Select: "Tipo"]
2. Clica [Botao: "Criar"]
3. Validacao: mensagem "Selecione o tipo da peticao (Esclarecimento ou Impugnacao)"
4. Modal nao fecha

**FE-03 — Erro ao salvar peticao no banco**
1. Usuario preenche todos os campos e clica [Botao: "Criar"]
2. Requisicao ao backend falha (erro de rede ou banco indisponivel)
3. Mensagem de erro: "Erro ao criar peticao. Tente novamente."
4. Modal permanece aberto com dados preenchidos preservados

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — secao de sugestao e criacao

#### Layout da Tela

```
[Aba: "Validacao Legal"] [Aba: "Peticoes" (badge: N)] [Aba: "Prazos"]

[Card: "Peticoes"] (icone FileText)
  [Botao: "Nova Peticao"] (icone Plus, variant primary) [ref: Passo 5]
  [Botao: "Upload Peticao"] (icone Upload) [ref: UC-I04]

  [Tabela: Peticoes]
    [Coluna: "Edital"] — sortable
    [Coluna: "Tipo"] — "Impugnacao" ou "Esclarecimento" [ref: Passo 3]
    [Coluna: "Status"] — render com badge e icone [ref: Passo 4]
      [Badge: "Rascunho"] (neutral, icone Edit3)
      [Badge: "Em Revisao"] (warning, icone Eye)
      [Badge: "Enviada"] (success, icone Send)
    [Coluna: "Data"] — sortable
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar peticao [ref: Passo 2]
      [Icone-Acao: Trash2] — excluir peticao (danger)

[Modal: "Nova Peticao"] (disparado por [Botao: "Nova Peticao"]) [ref: Passo 6]
  [Select: "Edital"] — lista editais salvos
  [Select: "Tipo"] — opcoes: "Esclarecimento", "Impugnacao" [ref: Passo 6]
  [Select: "Template"] — opcoes: "Nenhum (em branco)", templates customizados
  [TextArea: "Conteudo"] — rows 8, opcional se usar template
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Criar"] (variant primary) [ref: Passo 7]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Peticoes"] | 1 |
| [Tabela: Peticoes] | 2, 8 |
| [Coluna: "Tipo"] | 3 |
| [Coluna: "Status"] / badges | 4 |
| [Botao: "Nova Peticao"] | 5 |
| [Modal: "Nova Peticao"] | 6 |
| [Select: "Tipo"] no modal | 6 |
| [Botao: "Criar"] | 7 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
