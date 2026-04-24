---
uc_id: UC-CV11
nome: "Analisar riscos, recorrencia, atas e concorrentes"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1481
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CV11 — Analisar riscos, recorrencia, atas e concorrentes

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1481).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-045, RN-061, RN-062, RN-073, RN-074, RN-084 [FALTANTE->V4]

**RF relacionados:** RF-030, RF-032, RF-033, RF-034

**Regras de Negocio aplicaveis:**
- Presentes: RN-045, RN-061, RN-062, RN-073, RN-074
- Faltantes: RN-084 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario analista/comercial

### Pre-condicoes
1. Edital selecionado.
2. PDF e dados do edital disponiveis para processamento.

### Pos-condicoes
1. Usuario obtem pipeline de riscos e trechos relevantes.
2. Sistema pode buscar atas, vencedores e concorrentes conhecidos.
3. Usuario passa a enxergar sinais de recorrencia e historico competitivo.

### Botoes e acoes observadas
Na aba `Riscos`:
- `Analisar Riscos do Edital` / `Reanalisar Riscos do Edital`
- `Rebuscar Atas`
- `Buscar Vencedores e Precos`
- `Atualizar` concorrentes

### Sequencia de eventos
1. Usuario abre a [Aba: "Riscos"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Usuario clica no [Botao: "Analisar Riscos do Edital"] (ou [Botao: "Reanalisar Riscos do Edital"]). [ref: Passo 2]
3. Sistema chama `POST /api/editais/{id}/analisar-riscos`. [ref: Passo 3]
4. A interface exibe o [Secao: "Pipeline de Riscos"] com [Badge] de modalidade, pagamento e sinais de mercado. [ref: Passo 4]
5. O [Secao: "Riscos Identificados"] agrupa riscos por categoria (juridico, tecnico, financeiro, logistico) com [Badge] de severidade (critico / alto / medio / baixo). [ref: Passo 5]
6. O [Secao: "Fatal Flaws"] destaca riscos eliminatorios, se existirem. [ref: Passo 6]
7. O [Secao: "Flags Juridicos"] exibe alertas legais identificados pela IA. [ref: Passo 7]
8. O [Secao: "Trechos Relevantes"] mostra trechos do edital marcados pela IA. [ref: Passo 8]
9. Na [Secao: "Historico de Atas e Vencedores"], usuario clica no [Botao: "Rebuscar Atas"] para chamar `POST /api/editais/{id}/historico-vencedores`. [ref: Passo 9]
10. Sistema exibe [Lista: "Atas encontradas"] com titulo, orgao, UF, data e link "Ver no PNCP", alem de [Badge: "Recorrencia"] (Semestral / Anual / Esporadica). [ref: Passo 10]
11. Se houver atas, usuario pode clicar no [Botao: "Buscar Vencedores e Precos"] para chamar `POST /api/editais/{id}/vencedores-atas`. [ref: Passo 11]
12. Sistema exibe [Tabela: "Vencedores e Precos Registrados"] com colunas Item, Vencedor, Vlr Est., Vlr Homol., Desc.% agrupados por ata. [ref: Passo 12]
13. Na [Secao: "Concorrentes Conhecidos"], usuario clica no [Botao: "Atualizar"] para buscar `/api/concorrentes/listar`. [ref: Passo 13]
14. Sistema exibe [Tabela: "Concorrentes"] com colunas Concorrente, Participacoes, Vitorias, Taxa(%). [ref: Passo 14]
15. Se houver >= 2 editais perdidos, sistema exibe [Alerta: "Alerta de Recorrencia"] em amarelo. [ref: Passo 15]

### Fluxos Alternativos (V5)

**FA-01 — Nenhum risco critico identificado**
1. A IA analisa o edital e nao encontra riscos eliminatorios.
2. A secao "Fatal Flaws" exibe mensagem: "Nenhum risco eliminatorio identificado."
3. Os demais riscos sao exibidos normalmente por categoria.

**FA-02 — Nenhuma ata encontrada**
1. Usuario clica em "Rebuscar Atas".
2. O PNCP nao retorna atas para o termo buscado.
3. Sistema exibe mensagem: "Nenhuma ata de registro de precos encontrada."
4. O botao "Buscar Vencedores e Precos" fica indisponivel.

**FA-03 — Riscos ja analisados (Reanalisar)**
1. O edital ja teve riscos analisados anteriormente.
2. O botao exibido e "Reanalisar Riscos do Edital".
3. Ao clicar, a IA reprocessa e pode gerar resultado diferente.

**FA-04 — Concorrentes desconhecidos (lista vazia)**
1. Usuario clica em "Atualizar" na secao de concorrentes.
2. O sistema nao encontra concorrentes conhecidos para o segmento.
3. A tabela de concorrentes exibe mensagem: "Nenhum concorrente identificado."

### Fluxos de Excecao (V5)

**FE-01 — Falha na analise de riscos via IA**
1. Usuario clica em "Analisar Riscos do Edital".
2. O servico de IA falha (timeout, erro interno).
3. Sistema exibe mensagem: "Erro ao analisar riscos. Servico de IA indisponivel."

**FE-02 — PDF do edital nao disponivel para analise de riscos**
1. O edital nao possui PDF associado.
2. A analise de riscos nao consegue processar trechos do edital.
3. Sistema exibe alerta: "Analise parcial — PDF do edital nao disponivel."

**FE-03 — Timeout ao buscar atas no PNCP**
1. Usuario clica em "Rebuscar Atas".
2. A busca no PNCP excede o timeout.
3. Sistema exibe mensagem: "Timeout ao buscar atas. Tente novamente."

**FE-04 — Cooldown de IA ativo (RN-084)**
1. Usuario tenta reanalisar riscos dentro do cooldown de 60 segundos.
2. O backend retorna HTTP 429.
3. Sistema exibe mensagem: "Aguarde 60 segundos antes de reanalisar os riscos."

**FE-05 — Erro ao buscar vencedores e precos**
1. Usuario clica em "Buscar Vencedores e Precos".
2. O endpoint falha.
3. Sistema exibe Toast de erro: "Erro ao buscar vencedores."

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 4 "Riscos" do Painel de Abas

#### Layout da Tela

[Aba: "Riscos"] icon AlertTriangle
  [Secao: "Acao de Analise"]
    [Botao: "Analisar Riscos do Edital"] / [Botao: "Reanalisar Riscos do Edital"] icon Shield [ref: Passo 2]
  [Secao: "Pipeline de Riscos"] [ref: Passo 4]
    [Badge: "Modalidade"] — tipo de licitacao
    [Badge: "Pagamento"] — risco de pagamento
    [Badge: "Sinais Mercado"] — alertas de mercado
  [Secao: "Riscos Identificados"] [ref: Passo 5]
    [Secao: "Riscos Juridicos"]
      [Texto: "Descricao do risco"]
      [Badge: "Severidade"] — critico/alto/medio/baixo
    [Secao: "Riscos Tecnicos"]
      ...
    [Secao: "Riscos Financeiros"]
      ...
    [Secao: "Riscos Logisticos"]
      ...
  [Secao: "Fatal Flaws"] [ref: Passo 6]
    [Alerta: "Risco eliminatorio"] — vermelho, se existir
  [Secao: "Flags Juridicos"] [ref: Passo 7]
    [Lista: "Alertas legais"]
  [Secao: "Trechos Relevantes"] [ref: Passo 8]
    [Lista: "Trechos do edital marcados"]
  [Secao: "Historico de Atas e Vencedores"]
    [Botao: "Rebuscar Atas"] icon RefreshCw [ref: Passo 9]
    [Texto: "Termo buscado"] / [Texto: "N ata(s) encontrada(s)"]
    [Badge: "Recorrencia"] — Semestral / Anual / Esporadica [ref: Passo 10]
    [Lista: "Atas encontradas"] [ref: Passo 10]
      [Texto: "Titulo da ata"]
      [Texto: "Orgao (UF) — Data"]
      [Botao: "Ver no PNCP"] — link externo
    [Botao: "Buscar Vencedores e Precos"] icon TrendingUp [ref: Passo 11]
    [Tabela: "Vencedores e Precos Registrados"] [ref: Passo 12]
      [Coluna: "Item"] — descricao do item
      [Coluna: "Vencedor"] — nome + porte
      [Coluna: "Vlr Est."] — valor estimado
      [Coluna: "Vlr Homol."] — valor homologado
      [Coluna: "Desc."] — percentual de desconto
  [Secao: "Concorrentes Conhecidos"]
    [Botao: "Atualizar"] icon Search [ref: Passo 13]
    [Tabela: "Concorrentes"] [ref: Passo 14]
      [Coluna: "Concorrente"] — nome + CNPJ
      [Coluna: "Participacoes"]
      [Coluna: "Vitorias"]
      [Coluna: "Taxa"] — percentual com badge colorido
  [Alerta: "Alerta de Recorrencia"] — visivel se >= 2 editais perdidos [ref: Passo 15]
    [Texto: "Editais semelhantes foram perdidos N vezes por motivos recorrentes."]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Riscos"] | 1 |
| [Botao: "Analisar Riscos"] / [Botao: "Reanalisar Riscos"] | 2 |
| [Secao: "Pipeline de Riscos"] + badges | 4 |
| [Secao: "Riscos Identificados"] por categoria + severidade | 5 |
| [Secao: "Fatal Flaws"] | 6 |
| [Secao: "Flags Juridicos"] | 7 |
| [Secao: "Trechos Relevantes"] | 8 |
| [Botao: "Rebuscar Atas"] | 9 |
| [Lista: "Atas"] + [Badge: "Recorrencia"] | 10 |
| [Botao: "Buscar Vencedores e Precos"] | 11 |
| [Tabela: "Vencedores e Precos"] | 12 |
| [Botao: "Atualizar"] concorrentes | 13 |
| [Tabela: "Concorrentes"] | 14 |
| [Alerta: "Alerta de Recorrencia"] | 15 |

### Implementacao atual
**IMPLEMENTADO**

---
