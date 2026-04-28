---
uc_id: UC-F16
nome: "Configurar fontes, palavras-chave e NCMs de busca"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 2093
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-F16 — Configurar fontes, palavras-chave e NCMs de busca

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 2093).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023, RN-027

**RF relacionados:** RF-013, RF-015

**Regras de Negocio aplicaveis:**
- Presentes: RN-027
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/captacao

### Pre-condicoes
1. `fontes_editais` e `parametros_score` disponiveis.

### UCs predecessores

**UC raiz** — nao depende de execucao previa de outros UCs.

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)
- `[seed]` — dado pre-cadastrado no banco (seed)


### Pos-condicoes
1. Fontes ficam ativadas ou desativadas.
2. Palavras-chave e NCMs alimentam rotinas de monitoramento e captacao.

### Botoes e acoes observadas
- aba `Fontes de Busca`
- `Ativar` ou `Desativar` fonte
- `Salvar Palavras-chave`
- `Salvar NCMs`
- `Gerar do portfolio (Onda 4)` desabilitado
- `Sincronizar NCMs (Onda 4)` desabilitado

### Sequencia de eventos
1. Usuario acessa a [Aba: "Fontes de Busca"] [Icone: Globe] na ParametrizacoesPage.
2. No [Card: "Fontes de Editais"], usuario revisa a [Lista: fontes] com nome, tipo (API/Scraper) e [Badge: "Ativa"/"Inativa"]. Pode clicar [Icone-Acao: Play/Pause] para ativar ou desativar cada fonte. O [Botao: "Gerenciar Fontes"] redireciona ao CRUD.
3. No [Card: "Palavras-chave de Busca"], usuario clica [Botao: "+ Editar"] para abrir o modo edicao, digita no [Campo: "Palavras-chave (separadas por virgula)"] e clica [Botao: "Salvar"]. O [Botao: "Gerar do portfolio (Onda 4)"] esta desabilitado.
4. No [Card: "NCMs para Busca"], usuario clica [Botao: "+ Adicionar NCM"] para abrir edicao, digita no [Campo: "NCMs (separados por virgula)"] e clica [Botao: "Salvar"]. O [Botao: "Sincronizar NCMs (Onda 4)"] esta desabilitado.
5. Sistema persiste as configuracoes em `parametros_score` e `fontes_editais`.

### Fluxos Alternativos

**FA-01 — Desativar e reativar fonte**
1. Usuario clica [Icone-Acao: Pause] em fonte ativa.
2. Badge muda para "Inativa".
3. Usuario clica novamente [Icone-Acao: Play] para reativar.
4. Badge retorna para "Ativa".

**FA-02 — Nenhuma palavra-chave definida**
1. Usuario salva lista de palavras-chave vazia.
2. Sistema aceita — buscas podem ser feitas apenas por NCM.

### Fluxos de Excecao

**FE-01 — NCM em formato invalido**
1. Usuario digita NCM sem pontos (ex: "90181990").
2. Sistema deveria validar formato XXXX.XX.XX (RN-035).
3. Se aceito sem validacao, NCM pode nao funcionar na busca.

**FE-02 — Todas as fontes desativadas**
1. Usuario desativa todas as fontes.
2. Sistema aceita — porem nenhuma busca automatica sera executada.
3. Idealmente sistema deveria alertar.

**FE-03 — Erro ao salvar palavras-chave**
1. Backend retorna erro ao persistir.
2. Toast de erro exibido.
3. Lista anterior permanece.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 3 de 5 — "Fontes de Busca"

#### Layout da Tela

```
[Aba: "Fontes de Busca"] [Icone: Globe]

[Card: "Fontes de Editais"]
  [Subtitulo: "Fontes ativas para busca de editais"]
  [Botao: "Gerenciar Fontes"] [Icone: Settings] — primary, header action [ref: Passo 2]
  [Lista: fontes]
    [Texto: nome da fonte] [Texto: tipo (API/Scraper)]
    [Badge: "Ativa" / "Inativa"] [ref: Passo 2]
    [Icone-Acao: Play/Pause] — ativar/desativar [ref: Passo 2]

[Card: "Palavras-chave de Busca"]
  [Botao: "Gerar do portfolio (Onda 4)"] — desabilitado
  (modo leitura)
  [Tag: palavra-chave 1] [Tag: palavra-chave 2] ... [ref: Passo 3]
  [Botao: "+ Editar"] [ref: Passo 3]
  (modo edicao)
  [Campo: "Palavras-chave (separadas por virgula)"] — text [ref: Passo 3]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Botao: "Cancelar"]

[Card: "NCMs para Busca"]
  [Subtitulo: "Extraidos automaticamente das classes/subclasses do portfolio"]
  [Botao: "Sincronizar NCMs (Onda 4)"] — desabilitado
  (modo leitura)
  [Tag: NCM 1] [Tag: NCM 2] ... [ref: Passo 4]
  [Botao: "+ Adicionar NCM"] [ref: Passo 4]
  (modo edicao)
  [Campo: "NCMs (separados por virgula)"] — text [ref: Passo 4]
  [Botao: "Salvar"] — primary [ref: Passo 4]
  [Botao: "Cancelar"]
  [Texto: "NCMs sao usados para busca direta no PNCP por codigo de produto"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Fontes de Busca"] | 1 |
| [Lista: fontes] | 2 |
| [Badge: "Ativa"/"Inativa"] | 2 |
| [Icone-Acao: Play/Pause] | 2 |
| [Botao: "Gerenciar Fontes"] | 2 |
| [Tag: palavras-chave] | 3 |
| [Botao: "+ Editar"] | 3 |
| [Campo: palavras-chave] | 3 |
| [Botao: "Salvar" (palavras)] | 3 |
| [Tag: NCMs] | 4 |
| [Botao: "+ Adicionar NCM"] | 4 |
| [Campo: NCMs] | 4 |
| [Botao: "Salvar" (NCMs)] | 4 |

### Implementacao atual
**IMPLEMENTADO**

---
