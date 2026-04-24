---
uc_id: UC-F17
nome: "Configurar notificacoes e preferencias"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 2220
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F17 — Configurar notificacoes e preferencias

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 2220).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-023

**RF relacionados:** RF-018

**Regras de Negocio aplicaveis:**
- Presentes: RN-023
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador

### Pre-condicoes
1. Parametros gerais disponiveis.

### Pos-condicoes
1. Canais, frequencias e preferencias globais ficam persistidos.

### Botoes e acoes observadas
- aba `Notificacoes`
- aba `Preferencias`
- `Salvar Notificacoes`
- `Salvar Preferencias`

### Sequencia de eventos
1. Usuario abre a [Aba: "Notificacoes"] [Icone: Bell] na ParametrizacoesPage.
2. No [Card: "Configuracoes de Notificacao"], usuario preenche [Campo: "Email para notificacoes"], marca os [Checkbox: "Email"], [Checkbox: "Sistema"], [Checkbox: "SMS"] na secao "Receber por", e seleciona [Select: "Frequencia do resumo"] (Imediato, Diario, Semanal).
3. Usuario clica [Botao: "Salvar"]. Sistema persiste. Exibe [Badge: "Salvo!"].
4. Usuario abre a [Aba: "Preferencias"] [Icone: Palette].
5. No [Card: "Preferencias do Sistema"], usuario seleciona [Radio: "Tema"] (Escuro/Claro), [Select: "Idioma"] (Portugues, English, Espanol) e [Select: "Fuso horario"] (Sao Paulo, Manaus, Belem).
6. Usuario clica [Botao: "Salvar"]. Sistema persiste. Exibe [Badge: "Salvo!"].

### Fluxos Alternativos

**FA-01 — Apenas notificacoes alteradas (preferencias mantidas)**
1. Usuario altera somente as configuracoes de notificacao.
2. Nao abre aba de Preferencias.
3. Preferencias anteriores permanecem.

**FA-02 — SMS desmarcado (somente Email e Sistema)**
1. Usuario desmarca checkbox SMS.
2. Sistema aceita — SMS e opcional.
3. Notificacoes enviadas apenas por email e sistema.

**FA-03 — Tema alterado para Escuro**
1. Usuario seleciona tema "Escuro".
2. Interface muda visualmente apos salvar (ou ao selecionar).

### Fluxos de Excecao

**FE-01 — Email de notificacao em formato invalido**
1. Usuario digita email invalido no campo de notificacoes.
2. Sistema deveria validar formato.
3. Se nao validar, notificacoes podem nao ser enviadas.

**FE-02 — Nenhum canal de notificacao selecionado**
1. Usuario desmarca todos os checkboxes (Email, Sistema, SMS).
2. Sistema aceita — porem nenhuma notificacao sera enviada.
3. Idealmente sistema deveria alertar.

**FE-03 — Erro ao salvar preferencias**
1. Backend retorna erro.
2. Badge "Salvo!" nao aparece.
3. Toast de erro exibido.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 4 e Tab 5 de 5

#### Layout da Tela — Tab "Notificacoes"

```
[Aba: "Notificacoes"] [Icone: Bell]

[Card: "Configuracoes de Notificacao"]
  [Campo: "Email para notificacoes"] — email [ref: Passo 2]
  [Secao: "Receber por"]
    [Checkbox: "Email"] [ref: Passo 2]
    [Checkbox: "Sistema"] [ref: Passo 2]
    [Checkbox: "SMS"] [ref: Passo 2]
  [Select: "Frequencia do resumo"] — Imediato|Diario|Semanal [ref: Passo 2]
  [Botao: "Salvar"] — primary [ref: Passo 3]
  [Badge: "Salvo!"] (temporario) [ref: Passo 3]
```

#### Layout da Tela — Tab "Preferencias"

```
[Aba: "Preferencias"] [Icone: Palette]

[Card: "Preferencias do Sistema"]
  [Radio: "Tema"]
    [Radio: "Escuro"] [ref: Passo 5]
    [Radio: "Claro"] [ref: Passo 5]
  [Select: "Idioma"] — pt-BR|en-US|es-ES [ref: Passo 5]
  [Select: "Fuso horario"] — America/Sao_Paulo|Manaus|Belem [ref: Passo 5]
  [Botao: "Salvar"] — primary [ref: Passo 6]
  [Badge: "Salvo!"] (temporario) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Notificacoes"] | 1 |
| [Campo: "Email para notificacoes"] | 2 |
| [Checkbox: "Email" / "Sistema" / "SMS"] | 2 |
| [Select: "Frequencia do resumo"] | 2 |
| [Botao: "Salvar" (notificacoes)] | 3 |
| [Aba: "Preferencias"] | 4 |
| [Radio: "Tema"] | 5 |
| [Select: "Idioma"] | 5 |
| [Select: "Fuso horario"] | 5 |
| [Botao: "Salvar" (preferencias)] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---

## Conclusoes desta rodada

1. O UC de portfolio que extrai produto e especificacoes por IA nao pode ser achatado em um cadastro generico; o codigo possui fluxo proprio, prompts distintos por tipo de origem e suporte a extracao multipla para `NFS` e `Plano de Contas`.
2. Os botoes da `PortfolioPage` se dividem em quatro grupos funcionais: navegacao da grade, enriquecimento por IA, verificacao tecnica e manutencao direta do cadastro.
3. Nem todo botao da tela persiste direto em CRUD: `Reprocessar IA` e `Precos de Mercado` delegam trabalho ao subsistema de chat; `Buscar ANVISA` e `Buscar na Web` usam sessoes de IA; `Reprocessar Metadados` usa endpoint proprio.
4. Os recursos marcados como `Onda 4` em `ParametrizacoesPage` nao devem entrar como implementados no escopo desta fundacao.
5. **V2:** Todos os elementos interativos de tela (botoes, campos, tabelas, modais, badges, toggles, checkboxes, selects, indicadores) estao mapeados bidirecionalmente com os passos da sequencia de eventos. Gaps do V1 foram corrigidos: Card "Alertas IA" documentado em UC-F03, dropdown "Frequencia" adicionado em UC-F04, CapSolver adicionado em UC-F04, Pipeline badges adicionados em UC-F06, UC-F17 apresenta 2 tabs separados.
6. **V5:** Fluxos Alternativos (FA) e Fluxos de Excecao (FE) adicionados a todos os 17 UCs. Correcoes do validador Arnaldo incorporadas: UF como dropdown (UC-F01), toast de sucesso ausente (UC-F01), telefone sem mascara (UC-F02), area padrao vazia (UC-F02), inicializacao de fontes de certidoes (UC-F04), filtro de busca limitado (UC-F06).
