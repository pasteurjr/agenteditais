---
uc_id: UC-F04
nome: "Buscar, revisar e anexar certidoes"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 618
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F04 — Buscar, revisar e anexar certidoes

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 618).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-003, RN-007, RN-008, RN-009, RN-010, RN-023, RN-026, RN-031 [FALTANTE→V4]

**RF relacionados:** RF-002

**Regras de Negocio aplicaveis:**
- Presentes: RN-003, RN-007, RN-008, RN-009, RN-010, RN-026
- Faltantes: RN-031 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/compliance

### Pre-condicoes
1. Empresa cadastrada com CNPJ.
2. Fontes de certidao configuradas ou sincronizadas. (**V5 correcao: fontes devem ser inicializadas ANTES de buscar — ver FA-01 e FE-01**)
3. Endpoints de certidoes operacionais.

### Pos-condicoes
1. Registros em `empresa_certidoes` sao atualizados.
2. PDFs e metadados podem ser mantidos automaticamente ou manualmente.
3. Usuario consegue corrigir, anexar ou baixar certidoes individualmente.

### Botoes e acoes observadas
- `Buscar Certidoes`
- `Editar certidao`
- `Upload PDF`
- `Download PDF`
- `Atualizar esta certidao`
- `Abrir portal`
- modal de detalhe com `Salvar`, `Abrir Portal`, `Download`, `Fechar`
- modal de upload com `Enviar` e `Cancelar`

### Sequencia de eventos
1. Usuario clica no [Botao: "Buscar Certidoes"] no cabecalho do [Card: "Certidoes Automaticas"].
2. Sistema valida `empresaId` e `cnpj`.
3. Sistema chama `POST /api/empresa-certidoes/buscar-stream`. O [Progresso: janela de log] exibe progresso streaming com barra, icones por status e contagem (N/total).
4. Ao concluir, sistema recarrega a [Tabela: DataTable] de `empresa_certidoes`.
5. Usuario pode clicar [Icone-Acao: Pencil] para abrir o [Modal: detalhe da certidao] e editar [Campo: "Status"], [Campo: "Validade"], [Campo: "Numero"], [Campo: "Orgao Emissor"]; visualizar PDF inline; e clicar [Botao: "Salvar"], [Botao: "Portal"], [Botao: "Download"] ou [Botao: "Fechar"].
6. Usuario pode configurar o [Select: "Frequencia de busca automatica"] (Desativada, Diaria, Semanal, Quinzenal, Mensal).
7. Usuario pode clicar [Icone-Acao: Upload] para abrir o [Modal: "Upload de Certidao"] e anexar manualmente um PDF via `/api/empresa-certidoes/{id}/upload`, informando [Campo: "Arquivo"], [Campo: "Data de Vencimento"] e [Campo: "Numero"].
8. Usuario pode clicar [Icone-Acao: Download] para baixar o PDF existente ou [Icone-Acao: Globe] para abrir o portal emissor.

### Fluxos Alternativos

**FA-01 — Fontes de certidao nao inicializadas (pre-requisito)**
1. Antes do Passo 1, usuario deve verificar se fontes de certidao existem.
2. Se nao existirem, acessar endpoint `/api/fontes-certidoes/inicializar` ou CRUD de fontes.
3. Sistema cria 5 fontes padrao (Receita Federal, PGFN, FGTS, TST, Estadual).
4. **Correcao V5 (Arnaldo OBS-17):** Tutorial deve incluir passo de inicializacao de fontes ANTES de buscar.

**FA-02 — Busca automatica parcial (algumas fontes offline)**
1. No Passo 3, algumas fontes governamentais estao indisponiveis.
2. Sistema marca estas certidoes como "Erro" ou "Nao disponivel" na tabela.
3. Demais certidoes encontradas sao exibidas normalmente.
4. Usuario pode tentar novamente mais tarde ou usar upload manual.

**FA-03 — Upload manual sem busca automatica**
1. Usuario pula os Passos 1-4 e vai direto para Passo 7.
2. Usuario faz upload manual de PDF de certidao.
3. Sistema aceita o upload e cria registro em `empresa_certidoes`.

**FA-04 — Edicao de certidao via modal de detalhe**
1. Usuario clica [Icone-Acao: Pencil] em certidao existente.
2. Altera campos no modal e clica "Salvar".
3. Sistema atualiza o registro sem precisar buscar novamente.

### Fluxos de Excecao

**FE-01 — Nenhuma fonte de certidao cadastrada**
1. Usuario clica "Buscar Certidoes" sem fontes inicializadas.
2. Sistema retorna erro 400: "Nenhuma fonte de certidao cadastrada. Acesse Cadastros > Empresa > Fontes de Certidoes para configurar."
3. **Correcao V5 (Arnaldo OBS-17):** Sistema deveria auto-inicializar fontes ou tutorial deve instruir o passo previo.

**FE-02 — CNPJ ficticio sem resultados nos portais**
1. CNPJ da empresa e ficticio (ex: dados de teste).
2. Busca automatica retorna sem resultados de nenhum portal.
3. Sistema exibe lista vazia ou certidoes com status "Nao disponivel".
4. Comportamento esperado — usar upload manual como alternativa.

**FE-03 — Timeout na busca automatica**
1. Portais governamentais demoram mais de 60 segundos para responder.
2. Sistema aborta a conexao e marca a certidao como "Erro" ou "Timeout".
3. Usuario pode clicar "Atualizar esta certidao" para tentar individualmente.

**FE-04 — Erro de CAPTCHA**
1. Portal exige resolucao de CAPTCHA.
2. Se CapSolver nao estiver configurado, a busca falha para esta fonte.
3. Sistema exibe badge "Erro" e mensagem explicativa no modal de detalhe.

**FE-05 — Upload de arquivo invalido**
1. Usuario tenta upload de arquivo com formato nao aceito.
2. File input restringe via accept, backend rejeita com 400.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 4 de 5

#### Layout da Tela

```
[Card: "Certidoes Automaticas"] [Icone: RefreshCw]
  [Subtitulo: "Busca certidoes para CNPJ {cnpj} nos portais oficiais"]
  [Botao: "Buscar Certidoes"] [Icone: RefreshCw] — primary, header action [ref: Passo 1]

  [Progresso: janela de log streaming] (visivel durante busca)
    [Texto: "Progresso da Busca (N/total)"]
    [Barra de progresso] — percentual
    [Lista: linhas de log com icones coloridos por status]
    [Botao: X] — fechar (apos conclusao) [ref: Passo 3]

  [Select: "Frequencia de busca automatica"] — Desativada|Diaria|Semanal|Quinzenal|Mensal [ref: Passo 6]

  [Tabela: DataTable]
    [Coluna: "Certidao"] — nome + indicador busca automatica
    [Coluna: "Status"]
      [Badge: "Valida"] — verde
      [Badge: "Vencida"] — vermelho
      [Badge: "Buscando..."] — azul animado
      [Badge: "Erro"] — vermelho
      [Badge: "Nao disponivel"] — amarelo
      [Badge: "Pendente"] — laranja
    [Coluna: "Validade"] — data + contagem regressiva
    [Coluna: "Acoes"]
      [Icone-Acao: Eye] — visualizar PDF [ref: Passo 5]
      [Icone-Acao: Upload] — upload manual [ref: Passo 7]
      [Icone-Acao: Download] — baixar PDF [ref: Passo 8]
      [Icone-Acao: RefreshCw] — atualizar individual
      [Icone-Acao: Globe] — abrir portal [ref: Passo 8]
      [Icone-Acao: Pencil] — editar detalhe [ref: Passo 5]

  [Indicador: CapSolver]
    [Badge: "CapSolver: $X.XX"] ou "CapSolver: nao configurado"

[Modal: detalhe da certidao] (disparado por [Icone-Acao: Pencil])
  [Alerta: contextual com instrucao] — cor e icone variam por status
  [Texto: PDF inline] — iframe viewer (quando disponivel)
  [Campo: "Status"] — select (Valida, Vencida, Aguardando acao, Upload manual, Erro) [ref: Passo 5]
  [Texto: "Modo"] — Automatica ou Manual (somente leitura)
  [Campo: "Validade"] — date [ref: Passo 5]
  [Campo: "Data Emissao"] — somente leitura
  [Campo: "Numero"] — text [ref: Passo 5]
  [Campo: "Orgao Emissor"] — text [ref: Passo 5]
  [Texto: "Resultado da Busca"] — mensagem da fonte
  [Lista: "Dados Detalhados"] — expansivel (dados_extras)
  [Botao: "Salvar"] — primary [ref: Passo 5]
  [Botao: "Portal"] [ref: Passo 8]
  [Botao: "Download"] [ref: Passo 8]
  [Botao: "Fechar"]

[Modal: "Upload de Certidao"] (disparado por [Icone-Acao: Upload])
  [Campo: "Arquivo"] — file (.pdf,.jpg,.jpeg,.png) [ref: Passo 7]
  [Campo: "Data de Vencimento"] — date [ref: Passo 7]
  [Campo: "Numero"] — text [ref: Passo 7]
  [Botao: "Enviar"] — primary [ref: Passo 7]
  [Botao: "Cancelar"]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Buscar Certidoes"] | 1 |
| [Progresso: janela de log] | 3 |
| [Tabela: DataTable certidoes] | 4 |
| [Icone-Acao: Pencil] → [Modal: detalhe] | 5 |
| [Campo: "Status"] (modal detalhe) | 5 |
| [Campo: "Validade"] (modal detalhe) | 5 |
| [Campo: "Numero"] (modal detalhe) | 5 |
| [Campo: "Orgao Emissor"] (modal detalhe) | 5 |
| [Botao: "Salvar"] (modal detalhe) | 5 |
| [Select: "Frequencia de busca automatica"] | 6 |
| [Icone-Acao: Upload] → [Modal: upload] | 7 |
| [Campo: "Arquivo"] (modal upload) | 7 |
| [Botao: "Enviar"] (modal upload) | 7 |
| [Icone-Acao: Download] | 8 |
| [Icone-Acao: Globe] | 8 |
| [Botao: "Portal"] (modal detalhe) | 8 |
| [Botao: "Download"] (modal detalhe) | 8 |
| [Indicador: CapSolver] | (informativo) |

### Persistencia observada
Tabela `empresa_certidoes`: `tipo`, `orgao_emissor`, `numero`, `data_vencimento`, `path_arquivo`, `status`, `url_consulta`, `fonte_certidao_id`, `mensagem`, `dados_extras`.

### Implementacao atual
**IMPLEMENTADO**

---
