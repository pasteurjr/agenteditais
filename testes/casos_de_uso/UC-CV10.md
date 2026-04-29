---
uc_id: UC-CV10
nome: "Confrontar documentacao necessaria com a empresa"
sprint: "Sprint 2"
versao_uc: "5.0"
doc_origem: "CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md"
linha_inicio_no_doc: 1341
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-CV10 — Confrontar documentacao necessaria com a empresa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md` (linha 1341).
> Sprint origem: **Sprint 2**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-071, RN-072

**RF relacionados:** RF-029, RF-035, RF-036

**Regras de Negocio aplicaveis:**
- Presentes: RN-071, RN-072
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario compliance/comercial

### Pre-condicoes
1. Edital selecionado.
2. Empresa **vinculada ao usuario corrente** (registro ativo em `usuario_empresa`) e documentacao da empresa cadastradas.
3. Endpoint `/api/editais/{id}/documentacao-necessaria` disponivel.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03 OU UC-CV07**
- **UC-F01**
- **UC-F18**
- **UC-F03**

Pre-requisitos nao-UC:

- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Usuario visualiza documentos exigidos, faltantes e vencidos.
2. Requisitos podem ser reextraidos do edital.
3. Certidoes podem ser atualizadas a partir da propria aba, com ressalva de divergencia de parametro.

### Botoes e acoes observadas
Na aba `Documentos`:
- `Identificar Documentos Exigidos pelo Edital` / `Reidentificar Documentos do Edital`
- `Buscar Documentos Exigidos`
- `Verificar Certidoes`

### Sequencia de eventos
1. Usuario abre a [Aba: "Documentos"] no [Card: "Painel de Abas"]. [ref: Passo 1]
2. Sistema tenta carregar `GET /api/editais/{id}/documentacao-necessaria` e popula a interface. [ref: Passo 2]
3. Interface agrupa os documentos por categoria em [Secao: "Pasta Categoria"] (Habilitacao Juridica, Fiscal, Qualificacao Tecnica, etc.) e mostra [Badge: "Disponivel"] / [Badge: "Vencido"] / [Badge: "Faltante"] por documento. [ref: Passo 3]
4. A [Secao: "Resumo de Completude"] exibe [Progresso: "Barra de completude"] com contadores de documentos disponiveis, vencidos e faltantes. [ref: Passo 4]
5. A [Tabela: "Checklist Documental IA"] mostra requisitos extraidos com status de atendimento. [ref: Passo 5]
6. Usuario pode acionar o [Botao: "Identificar Documentos Exigidos pelo Edital"] (ou [Botao: "Reidentificar Documentos do Edital"]) para chamar `POST /api/editais/{id}/extrair-requisitos`. [ref: Passo 6]
7. Ao concluir, a tela recarrega `documentacao-necessaria`. [ref: Passo 7]
8. Usuario pode acionar o [Botao: "Buscar Documentos Exigidos"] que pergunta ao chat quais documentos o edital exige. [ref: Passo 8]
9. Usuario pode acionar o [Botao: "Verificar Certidoes"], que reexecuta a busca de certidoes e tenta recarregar a completude documental. [ref: Passo 9]

### Fluxos Alternativos (V5)

**FA-01 — Documentacao da empresa nao cadastrada**
1. Usuario abre a aba Documentos.
2. A empresa nao possui documentos cadastrados na Sprint 1.
3. Todas as categorias exibem badges "Faltante" (cinza).
4. O resumo de completude mostra 0% preenchido.

**FA-02 — Reidentificar documentos do edital (apos primeira identificacao)**
1. O edital ja teve documentos exigidos identificados anteriormente.
2. O botao exibido e "Reidentificar Documentos do Edital".
3. Ao clicar, a IA reprocessa o PDF e pode gerar lista diferente da anterior.

**FA-03 — Todos os documentos atendidos**
1. A empresa possui todos os documentos exigidos pelo edital, com validade vigente.
2. Todas as categorias exibem badges "Disponivel" (verde).
3. O resumo de completude mostra 100%.

**FA-04 — Buscar Documentos Exigidos via chat IA**
1. Usuario clica em "Buscar Documentos Exigidos".
2. O sistema abre sessao de chat com a IA.
3. A IA lista os documentos exigidos com base na leitura do edital.
4. A resposta e exibida na area de chat.

### Fluxos de Excecao (V5)

**FE-01 — Falha ao carregar documentacao necessaria**
1. Sistema tenta `GET /api/editais/{id}/documentacao-necessaria`.
2. O endpoint retorna erro.
3. A aba exibe mensagem: "Nao foi possivel carregar a documentacao necessaria."

**FE-02 — Falha na extracao de requisitos via IA**
1. Usuario clica em "Identificar Documentos Exigidos pelo Edital".
2. O processamento do PDF via IA falha (PDF corrompido, IA indisponivel).
3. Sistema exibe mensagem: "Erro ao extrair requisitos do edital."

**FE-03 — Divergencia de parametro em Verificar Certidoes**
1. Usuario clica em "Verificar Certidoes".
2. O botao envia `empresa_id: edital.id` (divergencia conhecida).
3. A busca pode nao retornar certidoes corretas ou retornar erro.
4. Sistema exibe aviso sobre a limitacao conhecida.

**FE-04 — PDF do edital nao disponivel para extracao**
1. Usuario clica em "Identificar Documentos Exigidos".
2. O edital nao possui PDF associado (nem `pdf_url` nem `pdf_path`).
3. Sistema exibe mensagem: "PDF do edital nao disponivel para analise de requisitos."

### Tela(s) Representativa(s)

**Pagina:** ValidacaoPage (`/app/validacao`)
**Posicao:** Aba 3 "Documentos" do Painel de Abas

#### Layout da Tela

[Aba: "Documentos"] icon FolderOpen
  [Secao: "Acoes de Extracao"]
    [Botao: "Identificar Documentos Exigidos pelo Edital"] / [Botao: "Reidentificar Documentos do Edital"] icon FileSearch [ref: Passo 6]
    [Botao: "Buscar Documentos Exigidos"] icon Search [ref: Passo 8]
    [Botao: "Verificar Certidoes"] icon Shield [ref: Passo 9]
  [Secao: "Documentacao Necessaria"] [ref: Passo 3]
    [Secao: "Pasta — Habilitacao Juridica"] icon Folder
      [Texto: "Nome do documento"]
      [Badge: "Disponivel"] — verde / [Badge: "Vencido"] — vermelho / [Badge: "Faltante"] — cinza
    [Secao: "Pasta — Regularidade Fiscal"]
      ...
    [Secao: "Pasta — Qualificacao Tecnica"]
      ...
    [Secao: "Pasta — Qualificacao Economica"]
      ...
    [Secao: "Pasta — Outros"]
      ...
  [Secao: "Resumo de Completude"] [ref: Passo 4]
    [Progresso: "Barra de completude"] — percentual preenchido
    [Indicador: "Disponiveis"] — contador verde
    [Indicador: "Vencidos"] — contador vermelho
    [Indicador: "Faltantes"] — contador cinza
  [Tabela: "Checklist Documental IA"] [ref: Passo 5]
    [Coluna: "Requisito"]
    [Coluna: "Status"] — badge Atendido/Pendente/Vencido
    [Coluna: "Observacao"]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Documentos"] | 1 |
| Carga de documentacao-necessaria | 2 |
| [Secao: "Pasta — Categoria"] + badges de status | 3 |
| [Secao: "Resumo de Completude"] + [Progresso] | 4 |
| [Tabela: "Checklist Documental IA"] | 5 |
| [Botao: "Identificar Documentos Exigidos"] / [Botao: "Reidentificar"] | 6 |
| [Botao: "Buscar Documentos Exigidos"] | 8 |
| [Botao: "Verificar Certidoes"] | 9 |

### Observacao critica
O botao `Verificar Certidoes` envia `empresa_id: edital.id` para `/api/empresa-certidoes/buscar-stream`. Isso aparenta ser um acoplamento incorreto entre edital e empresa, entao esse trecho deve ser tratado como **parcial/com divergencia funcional** ate confirmacao de backend.

### Implementacao atual
**PARCIAL / COM DIVERGENCIA FUNCIONAL**

---
