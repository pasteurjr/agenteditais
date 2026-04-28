---
uc_id: UC-CT05
nome: "Designar Gestor/Fiscal"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 1186
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CT05 — Designar Gestor/Fiscal

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 1186).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-180, RN-181, RN-206 [FALTANTE->V4], RN-216 [FALTANTE->V4]

**RF relacionado:** NOVO (Art. 117, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial / Gestor Administrativo)

### Pre-condicoes
1. Usuario autenticado com contrato selecionado (UC-CT01)
2. Dados de responsaveis disponiveis para preenchimento

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CT01**


### Pos-condicoes
1. Gestor e fiscal(is) designados e registrados
2. Portaria de designacao vinculada ao contrato
3. Historico de designacoes disponivel

### Sequencia de Eventos

1. Na ProducaoPage com contrato selecionado, usuario clica na [Aba: "Gestor/Fiscal"] (5a aba)
2. Se nenhum contrato selecionado: mensagem de selecao exibida
3. [Secao: Cards de Designacao — grid 3] exibe cards para: Gestor, Fiscal Tecnico, Fiscal Administrativo
4. Cards com designacao ativa mostram: Nome (bold), Cargo, Portaria (condicional), Datas
5. Cards sem designacao mostram: [Texto: "Nao designado"] (italic, cor cinza)
6. [Card: "Todas as Designacoes"] exibe tabela HTML com: Tipo, Nome, Cargo, Portaria, Ativo
7. Usuario clica [Botao: "+ Nova Designacao"] — [Modal: "Nova Designacao"] abre
8. Seleciona [Select: "Tipo"] — opcoes: gestor, fiscal_tecnico, fiscal_administrativo
9. Preenche: [TextInput: "Nome"], [TextInput: "Cargo"], [TextInput: "Numero da Portaria"]
10. Preenche datas: [TextInput: "Data Inicio"], [TextInput: "Data Fim"]
11. Clica [Botao: "Criar"] — designacao registrada e card correspondente atualizado
12. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Designacao sem portaria:** No passo 9, campo "Numero da Portaria" fica vazio. Designacao e criada sem vinculacao de portaria. Card exibe nome e cargo sem a linha de portaria.
- **FA-02 — Designacao com data fim indefinida (vigente):** No passo 10, campo "Data Fim" fica vazio. Designacao e criada com vigencia indefinida. Card exibe "{data_inicio} a vigente".
- **FA-03 — Cancelamento de designacao ativa:** Usuario seleciona designacao existente e clica "Desativar". Sistema marca designacao como inativa. Card volta a exibir "Nao designado".

### Fluxos de Excecao (V5)

- **FE-01 — Gestor igual ao Fiscal (RN-206, Art. 117):** No passo 11, backend detecta que o nome do gestor e o mesmo do fiscal. Retorna warning RN-206. Em modo warn-only, designacao e criada com alerta "Gestor e fiscal nao devem ser a mesma pessoa (Art. 117 Lei 14.133/2021)."
- **FE-02 — Designacao sem contrato selecionado:** Mensagem de selecao exibida. Nenhum card ou formulario visivel.
- **FE-03 — Email invalido na designacao (RN-214):** Se campo de email e preenchido com formato invalido, backend retorna warning RN-214. Sistema exibe alerta "Email invalido."
- **FE-04 — Nome vazio:** Sistema exibe validacao "Nome do responsavel e obrigatorio."

### Tela(s) Representativa(s)

**Pagina:** ProducaoPage (`/app/producao`)
**Posicao:** Aba "Gestor/Fiscal" (5a aba)

#### Layout da Tela

```
[Aba: "Contratos"] [Aba: "Entregas"] [Aba: "Cronograma"] [Aba: "Aditivos"] [Aba: "Gestor/Fiscal"]

[Secao: Cards de Designacao — grid 3 colunas] [ref: Passos 3, 4, 5]
  [Card: "Gestor"] [ref: Passo 3]
    [Texto: Nome] (fontSize: 16, fontWeight: 700) — se designado [ref: Passo 4]
    [Texto: Cargo] (color: #6b7280, fontSize: 13) — se designado
    [Texto: "Portaria: {portaria_numero}"] (fontSize: 12) — condicional
    [Texto: "{data_inicio} a {data_fim ou 'vigente'}"] (fontSize: 12)
    [Texto: "Nao designado"] (color: #9ca3af, fontStyle: italic) — se vazio [ref: Passo 5]
  [Card: "Fiscal Tecnico"] — idem estrutura do Gestor [ref: Passo 3]
  [Card: "Fiscal Administrativo"] — idem estrutura do Gestor [ref: Passo 3]

[Card: "Todas as Designacoes"] [ref: Passo 6]
  [Botao: "+ Nova Designacao"] (icone Plus) [ref: Passo 7]
  [Tabela: designacoes] — HTML customizada
    [Coluna: "Tipo"]
    [Coluna: "Nome"]
    [Coluna: "Cargo"]
    [Coluna: "Portaria"]
    [Coluna: "Ativo"] — centralizado

[Modal: "Nova Designacao"] [ref: Passos 8-12]
  [Select: "Tipo"] [ref: Passo 8]
    opcoes: "gestor" (Gestor), "fiscal_tecnico" (Fiscal Tecnico), "fiscal_administrativo" (Fiscal Administrativo)
  [TextInput: "Nome"] [ref: Passo 9]
  [TextInput: "Cargo"] [ref: Passo 9]
  [TextInput: "Numero da Portaria"] [ref: Passo 9]
  [TextInput: "Data Inicio"] — placeholder "2026-01-01" [ref: Passo 10]
  [TextInput: "Data Fim"] — placeholder "2026-12-31" [ref: Passo 10]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Criar"] [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Gestor/Fiscal"] | 1 |
| [Cards de Designacao] | 3 |
| [Texto: Nome/Cargo/Portaria/Datas] | 4 |
| [Texto: "Nao designado"] | 5 |
| [Card: "Todas as Designacoes"] | 6 |
| [Botao: "+ Nova Designacao"] | 7 |
| [Modal: "Nova Designacao"] | 8, 9, 10, 11, 12 |
| [Select: "Tipo"] | 8 |
| campos TextInput | 9, 10 |
| [Botao: "Criar"] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**Implementado**

---
