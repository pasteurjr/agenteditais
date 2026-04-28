---
uc_id: UC-CV04
nome: "Definir estrategia, intencao e margem do edital"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 584
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV04 — Definir estrategia, intencao e margem do edital

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 584).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-063

**RF relacionados:** RF-023, RF-027, RF-037

**Regras de Negocio aplicaveis:**
- Presentes: RN-063
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario comercial/estrategico

### Pre-condicoes
1. Edital selecionado no painel lateral.
2. Registro de edital salvo ou passivel de salvamento.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV02**
- **UC-CV03**


### Pos-condicoes
1. Estrategia comercial do edital fica persistida.
2. Margem desejada e perfil de abordagem ficam registrados.

### Botoes e acoes observadas
- radio de `Estrategico`, `Defensivo`, `Acompanhamento`, `Aprendizado`
- slider de margem
- toggles `Varia por Produto` e `Varia por Regiao`
- `Salvar Estrategia`

### Sequencia de eventos
1. Usuario abre o [Card: "Painel Lateral"] do edital selecionado. [ref: Passo 1]
2. Na [Secao: "Intencao Estrategica"], usuario escolhe uma das 4 opcoes via [Radio: "Estrategico"], [Radio: "Defensivo"], [Radio: "Acompanhamento"] ou [Radio: "Aprendizado"]. [ref: Passo 2]
3. Na [Secao: "Expectativa de Margem"], usuario ajusta o [Campo: Slider] de margem desejada (0-50%). [ref: Passo 3]
4. Usuario pode sinalizar variacao via [Toggle: "Varia por Produto"] e [Toggle: "Varia por Regiao"]. [ref: Passo 4]
5. Usuario clica no [Botao: "Salvar Estrategia"]. [ref: Passo 5]
6. Sistema garante que o edital esteja salvo (cria registro em `editais` se necessario). [ref: Passo 6]
7. Sistema cria ou atualiza o registro em `estrategias-editais` via CRUD. [ref: Passo 7]

### Fluxos Alternativos (V5)

**FA-01 — Edital nao salvo: sistema salva automaticamente antes da estrategia**
1. Usuario define estrategia para um edital que ainda nao foi salvo.
2. Ao clicar "Salvar Estrategia", sistema salva primeiro o edital em `editais`.
3. Em seguida, persiste a estrategia em `estrategias_editais`.
4. Ambos os badges ("Salvo" e indicador de estrategia) aparecem.

**FA-02 — Alterar estrategia existente**
1. Usuario abre o painel de um edital que ja tem estrategia definida.
2. Os campos radio, slider e toggles sao pre-carregados com os valores persistidos.
3. Usuario altera a intencao de "Estrategico" para "Acompanhamento" e ajusta a margem.
4. Ao salvar, o registro em `estrategias_editais` e atualizado (update, nao insert).

**FA-03 — Usuario cancela a definicao (fecha o painel sem salvar)**
1. Usuario seleciona intencao e ajusta margem.
2. Em vez de clicar "Salvar Estrategia", usuario clica em outro edital ou fecha o painel.
3. As alteracoes nao sao persistidas.
4. Ao reabrir o painel do mesmo edital, os valores anteriores (ou padrao) sao exibidos.

### Fluxos de Excecao (V5)

**FE-01 — Falha ao persistir estrategia no banco**
1. Usuario clica em "Salvar Estrategia".
2. O CRUD retorna erro (ex: foreign key invalida, constraint violation).
3. Sistema exibe Toast de erro: "Erro ao salvar estrategia. Tente novamente."

**FE-02 — Margem fora da faixa permitida**
1. Usuario tenta definir margem acima de 50% ou abaixo de 0% (por manipulacao de DOM).
2. O backend valida a faixa e retorna erro.
3. Sistema exibe mensagem: "Margem deve estar entre 0% e 50%."

**FE-03 — Versionamento de decisao falha (RN-080)**
1. Ao salvar estrategia, o sistema tenta logar a transicao em AuditoriaLog.
2. O servico de auditoria falha.
3. A estrategia e salva normalmente, mas o log de auditoria nao e registrado.
4. Sistema exibe warning: "Estrategia salva, mas o log de auditoria nao pode ser registrado."

### Tela(s) Representativa(s)

**Pagina:** CaptacaoPage (`/app/captacao`)
**Posicao:** Bloco 4 (Painel Lateral)

#### Layout da Tela

> Nota: O layout completo do Painel Lateral esta em UC-CV02. Aqui estao os elementos especificos da estrategia.

[Card: "Painel Lateral"]
  [Secao: "Intencao Estrategica"]
    [Radio: "Estrategico"] [ref: Passo 2]
    [Radio: "Defensivo"] [ref: Passo 2]
    [Radio: "Acompanhamento"] [ref: Passo 2]
    [Radio: "Aprendizado"] [ref: Passo 2]
  [Secao: "Expectativa de Margem"]
    [Campo: Slider] — 0% a 50% [ref: Passo 3]
    [Toggle: "Varia por Produto"] [ref: Passo 4]
    [Toggle: "Varia por Regiao"] [ref: Passo 4]
  [Botao: "Salvar Estrategia"] [ref: Passo 5]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Painel Lateral"] | 1 |
| [Radio: "Estrategico/Defensivo/Acompanhamento/Aprendizado"] | 2 |
| [Campo: Slider de margem] | 3 |
| [Toggle: "Varia por Produto"] / [Toggle: "Varia por Regiao"] | 4 |
| [Botao: "Salvar Estrategia"] | 5 |

### Persistencia observada
Tabela `estrategias_editais`: `user_id`, `edital_id`, `decisao`, `prioridade`, `margem_desejada`, `agressividade_preco`, `perfil_competitivo`, `margem_minima`, `margem_maxima`, `desconto_maximo`, `priorizar_volume`, `notas_estrategia`, `cenarios_simulados`.

### Implementacao atual
**IMPLEMENTADO**

---
