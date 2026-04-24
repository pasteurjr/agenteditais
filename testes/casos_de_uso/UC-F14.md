---
uc_id: UC-F14
nome: "Configurar pesos e limiares de score"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 1842
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F14 — Configurar pesos e limiares de score

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 1842).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-020, RN-021, RN-023, RN-032 [FALTANTE→V4], RN-038 [FALTANTE→V4], RN-041 [FALTANTE→V4]

**RF relacionados:** RF-018

**Regras de Negocio aplicaveis:**
- Presentes: RN-020, RN-021
- Faltantes: RN-032 [FALTANTE], RN-038 [FALTANTE], RN-041 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Registro de `parametros_score` existente ou passivel de criacao.

### Pos-condicoes
1. Pesos ficam persistidos.
2. Limiares GO/NO-GO passam a parametrizar as etapas seguintes.

### Botoes e acoes observadas
- aba `Score`
- `Salvar Pesos`
- `Salvar Limiares`

### Sequencia de eventos
1. Usuario acessa a [Aba: "Score"] [Icone: Settings] na ParametrizacoesPage.
2. Sistema carrega `parametros_score` e popula os campos dos dois cards.
3. Usuario ajusta os pesos no [Card: "Pesos das Dimensoes"]: [Campo: "Peso Tecnico"], [Campo: "Peso Documental"], [Campo: "Peso Complexidade"], [Campo: "Peso Juridico"], [Campo: "Peso Logistico"], [Campo: "Peso Comercial"]. O [Indicador: soma] exibe a soma atual com cor verde (= 1.00) ou vermelha.
4. Usuario clica [Botao: "Salvar Pesos"]. Se soma != 1.00, exibe alerta e nao salva.
5. Usuario ajusta limiares no [Card: "Limiares de Decisao GO / NO-GO"]: [Campo: "Minimo para GO" / "Maximo para NO-GO"] para Score Final, Score Tecnico e Score Juridico. O [Texto: regra atual] exibe a regra combinada.
6. Usuario clica [Botao: "Salvar Limiares"]. Sistema persiste em `parametros_score`.

### Fluxos Alternativos

**FA-01 — Pesos ja configurados anteriormente**
1. No Passo 2, campos ja estao preenchidos com valores anteriores.
2. Usuario ajusta conforme necessario.

**FA-02 — Apenas limiares alterados (pesos mantidos)**
1. Usuario nao altera pesos.
2. Apenas ajusta limiares e clica "Salvar Limiares".
3. Pesos permanecem inalterados.

### Fluxos de Excecao

**FE-01 — Soma dos pesos diferente de 1.00**
1. No Passo 4, soma dos 6 pesos != 1.00 (ex: 1.05).
2. [Indicador: soma] exibe valor em vermelho.
3. Sistema exibe alerta e NAO salva os pesos.
4. Usuario deve corrigir os valores.

**FE-02 — Limiar GO menor que limiar NO-GO**
1. Usuario configura GO < NO-GO (ex: GO=0.40, NO-GO=0.70).
2. Configuracao inconsistente — comportamento do sistema pode ser imprevisivel.
3. Idealmente sistema deveria validar e alertar.

**FE-03 — Erro ao salvar (servidor indisponivel)**
1. Backend nao responde ao PUT.
2. Toast de erro exibido.
3. Dados permanecem no formulario.

### Tela(s) Representativa(s)

**Pagina:** ParametrizacoesPage (`/app/parametros`)
**Posicao:** Tab 1 de 5 — "Score"

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Icone: Settings]
  [Titulo: "Parametrizacoes"]
  [Subtitulo: "Configuracoes gerais do sistema"]

[Aba: "Score"] | [Aba: "Comercial"] | [Aba: "Fontes de Busca"] | [Aba: "Notificacoes"] | [Aba: "Preferencias"]

[Card: "Pesos das Dimensoes"]
  [Subtitulo: "Pesos que ponderam cada dimensao no calculo do score final (devem somar 1.00)"]
  (form-grid-2)
  [Campo: "Peso Tecnico"] — number [ref: Passo 3]
  [Campo: "Peso Documental"] — number [ref: Passo 3]
  [Campo: "Peso Complexidade"] — number [ref: Passo 3]
  [Campo: "Peso Juridico"] — number [ref: Passo 3]
  [Campo: "Peso Logistico"] — number [ref: Passo 3]
  [Campo: "Peso Comercial"] — number [ref: Passo 3]
  [Indicador: "Soma atual: X.XX"] — verde ou vermelho [ref: Passo 3]
  [Botao: "Salvar Pesos"] — primary [ref: Passo 4]

[Card: "Limiares de Decisao GO / NO-GO"]
  [Subtitulo: "Defina os limiares para classificacao automatica dos editais"]
  [Secao: "Score Final"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Secao: "Score Tecnico"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Secao: "Score Juridico"]
    [Campo: "Minimo para GO"] — number [ref: Passo 5]
    [Campo: "Maximo para NO-GO"] — number [ref: Passo 5]
  [Texto: "Regra atual: GO: ... / NO-GO: ... / AVALIAR: demais"] [ref: Passo 5]
  [Botao: "Salvar Limiares"] — primary [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Score"] | 1 |
| [Campo: pesos (6 campos)] | 3 |
| [Indicador: soma] | 3 |
| [Botao: "Salvar Pesos"] | 4 |
| [Campo: limiares (6 campos)] | 5 |
| [Texto: "Regra atual"] | 5 |
| [Botao: "Salvar Limiares"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
