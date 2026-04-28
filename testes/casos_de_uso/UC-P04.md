---
uc_id: UC-P04
nome: "Configurar Base de Custos (ERP + Tributario)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 519
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-P04 — Configurar Base de Custos (ERP + Tributario)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 519).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-039-03 + RF-039-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-093, RN-094, RN-095, RN-098, RN-101, RN-102
- Faltantes: RN-120 [FALTANTE], RN-131 [FALTANTE], RN-132 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-093, RN-094, RN-095, RN-098, RN-101, RN-102, RN-120 [FALTANTE->V4], RN-131 [FALTANTE->V4], RN-132 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Volumetria calculada (UC-P03) ou opcao "Nao Preciso" selecionada
2. Produto tem NCM cadastrado no portfolio

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-P03**
- **UC-F07 OU UC-F08**


### Pos-condicoes
1. Custo base do item definido
2. Regras tributarias aplicadas (isencao ICMS se NCM 3822)
3. Custos salvos na camada A

### Sequencia de eventos
1. Na [Aba: "Custos e Precos"], apos selecionar vinculo, usuario localiza o [Card: "Base de Custos"]. [ref: Passo 1]
2. Usuario preenche [Campo: "Custo Unitario (R$)"]. [ref: Passo 2]
3. O [Campo: "NCM"] e exibido como readonly (importado do produto). [ref: Passo 3]
4. Se NCM 3822, sistema exibe [Texto: "ISENTO -- NCM 3822"] como hint no campo ICMS. [ref: Passo 4]
5. Usuario preenche ou ajusta [Campo: "ICMS (%)"], [Campo: "IPI (%)"] e [Campo: "PIS+COFINS (%)"]. [ref: Passo 5]
6. Usuario clica no [Botao: "Salvar Custos"]. [ref: Passo 6]

### Fluxos Alternativos (V5)

**FA-01 — NCM 3822 (reagentes IVD) — isencao ICMS e IPI:**
1. No passo 3, sistema detecta NCM 3822.xx.xx.
2. Sistema preenche automaticamente ICMS = 0% e IPI = 0% com hint "ISENTO -- NCM 3822".
3. Apenas PIS+COFINS (9,25%) incide sobre o custo.

**FA-02 — NCM 9018 (equipamentos medicos) — IPI isento:**
1. No passo 3, sistema detecta NCM 9018.xx.xx.
2. Sistema preenche IPI = 0% com hint "IPI isento — Dec. 7.660/2011".
3. ICMS permanece editavel (ex: 12%).

**FA-03 — Custos de acessorios (itens sem produto vinculado):**
1. Para itens marcados como "Acessorio" no UC-P02, o custo e informado manualmente.
2. O campo NCM pode estar vazio ou preenchido manualmente.
3. Tributos sao informados manualmente pelo usuario.

### Fluxos de Excecao (V5)

**FE-01 — Custo unitario igual a zero ou negativo:**
1. No passo 2, usuario informa custo <= 0.
2. Sistema exibe validacao: "Custo unitario deve ser maior que zero."
3. O botao "Salvar Custos" fica desabilitado.

**FE-02 — Produto sem NCM cadastrado:**
1. No passo 3, o campo NCM aparece vazio.
2. Sistema exibe warning: "NCM nao cadastrado para este produto. Preencha no portfolio."
3. Tributos automaticos nao sao aplicados; usuario informa manualmente.

**FE-03 — Aliquota tributaria invalida (> 100% ou negativa):**
1. No passo 5, usuario informa aliquota fora do range 0-100%.
2. Sistema exibe validacao: "Aliquota deve estar entre 0% e 100%."

**FE-04 — Falha ao salvar custos (erro de rede):**
1. No passo 6, a chamada ao backend falha.
2. Sistema exibe toast de erro: "Erro ao salvar custos. Tente novamente."
3. Os dados preenchidos sao preservados na tela.

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage (`/app/precificacao`)
**Posicao:** Aba 2 (Custos e Precos) — Card Base de Custos

#### Layout da Tela

[Card: "Base de Custos"] icon DollarSign [ref: Passo 1]
  [Campo: "Custo Unitario (R$)"] — text, placeholder "Custo de aquisicao" [ref: Passo 2]
  [Campo: "NCM"] — readonly, placeholder "Automatico do produto" [ref: Passo 3]
  [Campo: "ICMS (%)"] — text, placeholder "0", hint "ISENTO -- NCM 3822" se aplicavel [ref: Passo 4, 5]
  [Campo: "IPI (%)"] — text, placeholder "0" [ref: Passo 5]
  [Campo: "PIS+COFINS (%)"] — text, placeholder "9.25" [ref: Passo 5]
  [Botao: "Salvar Custos"] icon Check [ref: Passo 6]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Base de Custos"] | 1 |
| [Campo: "Custo Unitario (R$)"] | 2 |
| [Campo: "NCM"] readonly | 3 |
| [Texto: "ISENTO -- NCM 3822"] | 4 |
| [Campo: "ICMS/IPI/PIS+COFINS"] | 5 |
| [Botao: "Salvar Custos"] | 6 |

### Implementacao atual
**IMPLEMENTADO**

---
