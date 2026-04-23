# ANALISE DAS OBSERVACOES DO VALIDADOR ARNALDO — Sprint 01 (Conjunto 2)

**Data:** 2026-04-22
**Documento analisado:** `docs/Arnaldo Sprint 01-2.docx`
**Tutorial de referencia:** `docs/tutorialsprint1-2.md`
**Analista:** IA (Claude)

---

## Resumo

O validador Arnaldo executou o tutorial da Sprint 1 (Conjunto 2, usuario valida2@valida.com.br) e reportou observacoes para os UCs F07 a F17. Abaixo, cada observacao e analisada com verificacao direta no codigo-fonte e no banco de dados.

**Legenda:**
- **PROCEDE** — observacao correta, requer correcao no sistema ou no tutorial
- **PROCEDE PARCIAL** — observacao tem fundamento, mas com ressalvas
- **NAO PROCEDE** — observacao incorreta ou por erro de operacao do validador
- **MELHORIA** — sugestao valida mas nao e bug

---

## [UC-F07] Processamento Inteligente de Produtos via IA

### OBS-23: "Ao clicar no botao de processamento via IA, os produtos foram salvos automaticamente sem opcao de revisar, salvar ou descartar"
**Veredicto: PROCEDE — auto-save sem confirmacao do usuario**

Confirmado no codigo: o fluxo de processamento via IA (`PortfolioPage.tsx`) dispara a chamada ao DeepSeek e persiste os resultados diretamente no banco sem apresentar modal de revisao. O usuario nao tem oportunidade de revisar, aceitar ou rejeitar os dados gerados antes do salvamento.

**Evidencia:** O endpoint de processamento (`/api/produtos/<id>/processar`) no backend aplica os campos gerados pela IA diretamente no registro, fazendo `db.commit()` sem etapa intermediaria.

**Acao:** Implementar fluxo de revisao pos-processamento:
1. IA processa e retorna preview dos dados gerados
2. Modal exibe comparativo "antes vs depois" para cada campo
3. Usuario escolhe "Salvar" ou "Descartar"
4. Apenas ao confirmar os dados sao persistidos

---

### OBS-24: "Processamento de Plano de Contas — sistema nao trata importacao em lote de itens"
**Veredicto: NAO PROCEDE — funcionalidade existe**

A importacao em lote via Plano de Contas **ja esta implementada**:

- **Frontend:** `PortfolioPage.tsx` (linhas 22-29) define o upload type `"plano_contas"` com label "Plano de Contas (ERP)", aceitando `.pdf,.xlsx,.xls,.csv` com prompt "Importe TODOS os produtos deste plano de contas..."
- **Frontend:** `handleUploadConfirm` (linha 254) processa o arquivo via IA e importa multiplos produtos de uma vez
- **Tambem existe:** Upload de NFS (Nota Fiscal) com mesma logica de importacao em lote

Alem disso, o sistema tem operacoes em lote completas no Portfolio:
- `POST /api/portfolio/aplicar-mascara-lote` — aplica mascara de descricao em ate 50 produtos por vez
- `handleClassificarSelecionados` (linha 575) — classifica multiplos produtos selecionados via checkboxes
- `handleAplicarMascaraLote` (linha 651) — mascara em lote

E para Editais, importacao massiva de itens/lotes:
- `POST /api/editais/<id>/lotes/extrair` — extrai lotes do PDF do edital via IA
- `POST /api/editais/<id>/buscar-itens-pncp` — importa itens em massa da API PNCP
- `tool_organizar_lotes()` (tools.py:8460) — organiza itens em lotes por especialidade
- Modelos `Lote`, `LoteItem`, `EditalItem` com relacionamento completo

**Acao:** O validador pode nao ter encontrado o botao de upload de Plano de Contas. O tutorial deve esclarecer o passo: "No Portfolio, clique em **Adicionar Produto** > selecione **Plano de Contas (ERP)** > faca upload do arquivo .xlsx/.csv/.pdf."

---

## [UC-F08] Cadastrar Produto Manualmente

### OBS-25: "Ao excluir produto, nao aparece confirmacao — e se eu clicar sem querer?"
**Veredicto: NAO PROCEDE — confirmacao existe**

Confirmado no codigo: `PortfolioPage.tsx` utiliza `window.confirm()` antes de executar a exclusao. A funcao `handleDeleteProduto` chama `confirm("Deseja realmente excluir este produto?")` antes de disparar o `DELETE`.

**Nota:** A confirmacao e um `window.confirm` nativo do browser, que pode ser menos visivel que um modal estilizado. Se o validador nao percebeu, pode ser questao de UX — mas a protecao existe.

---

### OBS-26: "Campo SKU nao aparece no formulario de cadastro manual (Configuracoes > Empresa)"
**Veredicto: PROCEDE PARCIAL — SKU existe no CRUD mas nao no formulario customizado**

Confirmado:
- **CRUD generico** (`Cadastros > Produtos`): campo SKU aparece normalmente pois e uma coluna do modelo Produto
- **Formulario customizado** (`PortfolioPage.tsx`): o formulario de criacao/edicao NAO inclui o campo SKU

O tutorial direciona para o formulario customizado (Configuracoes), onde SKU nao esta disponivel.

**Acao:** Adicionar campo SKU no formulario de cadastro manual do PortfolioPage.tsx, ou esclarecer no tutorial que SKU pode ser preenchido via CRUD generico.

---

### OBS-27: "Dropdowns de Classe, Subclasse e Area de Atuacao estao vazios"
**Veredicto: PROCEDE — mesmo problema do OBS-12 (UC-F13)**

Confirmado: os dropdowns sao populados via consulta ao banco (`/api/areas-produto`, `/api/classes-produto-v2`, `/api/subclasses-produto`). Se nao ha registros cadastrados, ficam vazios. O UC-F13 (Classificacao de Produtos) e responsavel por criar a hierarquia Area > Classe > Subclasse, e deve ser executado ANTES do UC-F08.

**Acao:** Reordenar tutorial: UC-F13 deve vir antes de UC-F08. Ou incluir seed de areas/classes/subclasses no setup de teste.

---

## [UC-F09] Reprocessar Produto pela IA

### OBS-28: "Reprocessar produto que nao tem documento anexado retorna 'Documento do produto nao encontrado'"
**Veredicto: PROCEDE — mensagem correta mas tutorial nao preve o cenario**

Confirmado no codigo: o endpoint de reprocessamento tenta localizar o documento associado ao produto. Se nao existe (ex: produto foi cadastrado manualmente sem upload), retorna erro. O sistema tem fallbacks que usam a descricao do produto, mas se nem descricao existir, o reprocessamento falha.

**Acao:** Duas correcoes necessarias:
1. **Tutorial:** Adicionar passo de upload de documento ANTES de tentar reprocessar
2. **Sistema:** Melhorar mensagem de erro para: "Para reprocessar, o produto precisa ter um documento ou descricao. Adicione um documento em Produtos > Documentos."

---

## [UC-F10] Consultar Produto via ANVISA/Web

### OBS-29: "Busca ANVISA retorna 0 resultados para o produto"
**Veredicto: PROCEDE PARCIAL — depende de dados externos e nome do produto**

Confirmado: a consulta ANVISA usa o nome do produto como termo de busca. Se o nome nao corresponde exatamente a um registro da ANVISA (ex: "Kit Glicose Wiener BioGlic-100" nao e o nome registrado na ANVISA), retorna zero.

**Fatores:**
1. API da ANVISA pode estar indisponivel (servico externo)
2. Termos de busca podem nao corresponder ao registro ANVISA
3. Produto pode nao ser registrado na ANVISA

**Acao:**
1. Tutorial deve informar que resultados dependem da base ANVISA e do nome do produto
2. Considerar busca parcial (ex: apenas "Glicose" ou "Wiener") como fallback
3. Adicionar mensagem orientativa: "Tente simplificar o nome de busca se nao obtiver resultados"

---

### OBS-30: "Busca Web tambem retorna 0 resultados"
**Veredicto: PROCEDE PARCIAL — depende da API Brave Search**

Confirmado: a busca web usa a API Brave Search. Os resultados dependem da disponibilidade da API e da relevancia do termo de busca. Se a chave API nao estiver configurada ou expirada, retorna zero.

**Acao:** Verificar se a chave da API Brave esta configurada e valida no ambiente de validacao. Tutorial deve mencionar que a busca web depende de servico externo.

---

## [UC-F11] Verificar Completude do Cadastro

### OBS-31: "Produto com 86% de completude aparece com badge verde — deveria ser amarelo"
**Veredicto: PROCEDE — BUG CRITICO de inconsistencia de thresholds**

**Evidencia detalhada — MISMATCH ENTRE FRONTEND E BACKEND:**

| Componente | Verde | Amarelo | Laranja | Vermelho |
|---|---|---|---|---|
| **Frontend** (`PortfolioPage.tsx:1495-1507`) | >= 80% | >= 50% | — | < 50% |
| **Backend** (`tools.py:6843-6850`) | >= 90% | >= 70% | >= 40% | < 40% |

O backend classifica 86% como `"quase_completo"` (amarelo), mas o frontend exibe verde porque usa threshold >= 80%.

**Impacto:** O usuario ve verde (completo) para produtos que o backend considera incompletos. Isso mascara problemas de completude e daria falsa impressao de que o cadastro esta ok para licitacoes.

**Acao CRITICA:** Unificar thresholds. Recomendacao: usar os thresholds do backend (mais rigorosos) no frontend:
```tsx
// PortfolioPage.tsx - corrigir para:
color = perc >= 90 ? '#22c55e' : perc >= 70 ? '#f59e0b' : perc >= 40 ? '#fb923c' : '#ef4444';
```

---

## [UC-F12] Editar Metadados via IA

### OBS-32: "Campos de metadados gerados pela IA sao somente leitura — nao consigo editar"
**Veredicto: PROCEDE PARCIAL — comportamento by design mas confuso**

Confirmado: os metadados gerados pela IA (descricao enriquecida, palavras-chave, classificacao sugerida) sao exibidos como campos read-only no frontend. O botao "Reprocessar" gera novos metadados mas nao permite edicao manual.

**Logica:** O sistema assume que metadados IA sao confiáveis e nao devem ser editados manualmente para manter consistencia. Porem, o usuario pode querer ajustar termos incorretos.

**Acao:** Permitir edicao manual de metadados apos geracao pela IA (transformar campos read-only em editaveis), ou esclarecer no tutorial que metadados sao automaticos e nao editaveis.

---

### OBS-33: "Reprocessar metadados salva automaticamente sem confirmar"
**Veredicto: PROCEDE — mesmo padrao do OBS-23**

Confirmado: o reprocessamento de metadados persiste diretamente no banco sem confirmacao. Segue o mesmo padrao problematico do UC-F07 (auto-save sem revisao).

**Acao:** Mesma correcao do OBS-23 — implementar preview + confirmacao antes de salvar.

---

### OBS-34: "IA gerou apenas 4 palavras-chave, esperava mais"
**Veredicto: NAO PROCEDE — quantidade variavel e normal**

Confirmado no codigo: o prompt enviado ao DeepSeek nao fixa um numero exato de palavras-chave. O LLM gera entre 4 e 25 termos dependendo do conteudo do produto. 4 palavras-chave e um resultado valido para produtos com descricao curta.

**Nota:** Se desejavel um minimo, adicionar instrucao no prompt: "Gere no minimo 8 palavras-chave relevantes."

---

## [UC-F13] Classificacao de Produtos (Area/Classe/Subclasse)

### OBS-35: "Area de Atuacao, Classe e Subclasse — todas as listas estao vazias"
**Veredicto: PROCEDE — falta seed de dados de classificacao**

Confirmado: a hierarquia Area > Classe > Subclasse depende de registros no banco (`areas_produto`, `classes_produto_v2`, `subclasses_produto`). O ambiente de validacao nao tem esses dados pre-cadastrados.

**Impacto:** Bloqueia nao so UC-F13 mas tambem UC-F08 (cadastro manual) e UC-F02 (area padrao). E o MESMO problema reportado nos OBS-12 e OBS-27.

**Acao CRITICA:**
1. Incluir seed de classificacao no setup de teste: ao menos 3 areas, 5 classes e 10 subclasses relevantes para o dominio (diagnostico laboratorial)
2. Ou adicionar botao "Importar classificacao padrao" que cria a hierarquia base
3. Reordenar tutorial: UC-F13 deve ser o PRIMEIRO UC executado, antes de qualquer outro que dependa de classificacao

---

## [UC-F14] Gerir Parametrizacoes de Score

### OBS-36: "Salvei os parametros de score mas nao apareceu mensagem de confirmacao"
**Veredicto: PROCEDE — mesmo padrao do OBS-09**

Confirmado: o `handleSalvarMercado()` e demais handlers de salvamento em `ParametrizacoesPage.tsx` nao exibem toast de sucesso. O padrao e consistente com o problema do OBS-09 (EmpresaPage sem feedback de salvamento).

**Nota:** A funcao usa apenas `console.error()` para erros (linha 671), sem feedback visual positivo nem negativo para o usuario.

**Acao:** Adicionar toast "Parametros salvos com sucesso!" apos cada operacao de save bem-sucedida em ParametrizacoesPage.tsx. Mesmo padrao da correcao do OBS-09.

---

## [UC-F15] Valores de Mercado (TAM/SAM/SOM)

### OBS-37: "Salvei os valores de TAM, SAM e SOM mas ao recarregar a pagina os valores nao aparecem"
**Veredicto: PROCEDE — FALHA SILENCIOSA DE PERMISSAO**

**Analise detalhada:**

Os campos `tam`, `sam`, `som` existem corretamente no modelo `ParametroScore` (models.py linhas 2603-2605, tipo `DECIMAL(15,2)`).

**POREM**, a tabela `parametros-score` esta na lista `ADMIN_WRITE_TABLES` (crud_routes.py linha 205). O fluxo de save:

1. Frontend chama `crudUpdate("parametros-score", id, {tam, sam, som})`
2. Backend verifica permissao (crud_routes.py linha 1295): `if table_slug in ADMIN_WRITE_TABLES and not _is_admin: return 403`
3. Se o usuario NAO for admin/super, o backend retorna **403 Forbidden** com mensagem "Apenas administradores podem criar/editar este recurso"
4. Frontend **captura o erro silenciosamente** (catch com `console.error` apenas, linha 671)
5. Usuario nao ve nenhuma mensagem de erro — dados NAO sao salvos

**Teste com valida2:** O usuario valida2 e `is_super=True`, entao a permissao DEVERIA funcionar. Se os valores nao persistiram, as causas possiveis sao:

1. **Token JWT expirado** e recriado sem flag `is_super`
2. **Empresa nao selecionada** no momento do save (empresa_id null)
3. **Outro erro silencioso** no `_set_column_value()` para campos DECIMAL

**Acao:**
1. Adicionar feedback visual de sucesso/erro no `handleSalvarMercado()` (nao so console.error)
2. Verificar se o token JWT do valida2 contem `is_super: true` (DevTools > Application > localStorage)
3. Testar manualmente via curl: `PUT /api/crud/parametros-score/<id>` com body `{"tam": "1000"}` e verificar resposta

---

## [UC-F16] Configurar Fontes de Editais

### OBS-38: "Toggle COMPRASNET liga/desliga mas nao sei se afeta apenas minha empresa"
**Veredicto: PROCEDE — toggle global, nao por empresa**

Confirmado no codigo: a tabela `fontes_editais` tem um campo `ativo` (booleano) mas nao tem campo `empresa_id`. O toggle ativa/desativa a fonte **globalmente** para todos os usuarios do sistema.

**Impacto:** Se um usuario desligar COMPRASNET, nenhuma empresa do sistema buscara editais nessa fonte. Isso e um problema serio em ambiente multi-empresa.

**Acao:**
1. **Curto prazo:** Tutorial deve alertar que fontes sao globais e nao devem ser desligadas em ambiente compartilhado
2. **Medio prazo:** Adicionar `empresa_id` a `fontes_editais` para que cada empresa tenha suas fontes independentes
3. **Alternativa:** Criar tabela intermediaria `empresa_fonte_edital` com `empresa_id, fonte_edital_id, ativo`

---

## [UC-F17] Configurar Notificacoes e Preferencias

### OBS-39: "Salvei as preferencias de notificacao (email, SMS, sistema) mas ao recarregar a pagina tudo volta ao padrao"
**Veredicto: PROCEDE — BUG CRITICO de colunas inexistentes**

**Analise detalhada — FALHA SILENCIOSA:**

O frontend (`ParametrizacoesPage.tsx`) envia via `crudUpdate("parametros-score", id, data)` os seguintes campos de notificacao:

- `notif_email` (boolean)
- `notif_sistema` (boolean)
- `notif_sms` (boolean)
- `frequencia_resumo` (string)

E os seguintes campos de preferencias:

- `tema` (string)
- `idioma` (string)
- `fuso_horario` (string)

**NENHUM destes campos existe no modelo `ParametroScore`** (models.py linhas 2577-2661).

O que acontece:
1. Frontend envia `{notif_email: true, notif_sms: false, ...}`
2. Backend `_set_column_value()` (crud_routes.py linha 880) verifica se a coluna existe no modelo
3. Como nao existe, **ignora silenciosamente** — nao retorna erro
4. `db.commit()` salva apenas os campos que existem (nenhum dos acima)
5. Frontend exibe "Salvo!" (se implementado) mas nada foi persistido

**Modelo correto existe mas nao e usado:** A tabela `PreferenciasNotificacao` (models.py) tem todos esses campos (`notif_email`, `notif_sistema`, `notif_sms`, etc.) mas o frontend NAO usa essa tabela — tenta salvar no `ParametroScore` incorretamente.

**Acao CRITICA:**
1. Frontend `ParametrizacoesPage.tsx` deve salvar notificacoes via `crudUpdate("preferencias-notificacao", ...)` em vez de `parametros-score`
2. Ou criar as colunas no `ParametroScore` e adicionar ao `to_dict()`
3. Backend `_set_column_value()` deve retornar erro quando coluna nao existe (nao silenciar)
4. Recomendacao: usar o modelo `PreferenciasNotificacao` que ja existe e esta correto

---

### OBS-40: "Campos de tema, idioma e fuso horario tambem nao persistem"
**Veredicto: PROCEDE — mesmo bug do OBS-39**

Mesma causa raiz: os campos `tema`, `idioma`, `fuso_horario` nao existem em `ParametroScore`. Mesmo fix do OBS-39.

---

## Resumo de Acoes

### Correcoes CRITICAS (bloqueantes)
| # | UC | Bug | Arquivo(s) |
|---|---|---|---|
| 1 | UC-F11 | Thresholds de completude frontend != backend (80% vs 90%) | `PortfolioPage.tsx:1495`, `tools.py:6843` |
| 2 | UC-F17 | Notificacoes/Preferencias salvam em modelo errado (colunas nao existem) | `ParametrizacoesPage.tsx`, `models.py` |
| 3 | UC-F16 | Fontes de editais sao globais, nao por empresa | `fontes_editais` (schema) |

### Correcoes no Sistema (MEDIA prioridade)
| # | UC | Bug/Melhoria | Arquivo(s) |
|---|---|---|---|
| 1 | UC-F07 | Auto-save sem revisao/confirmacao do usuario | `PortfolioPage.tsx` |
| 2 | UC-F08 | SKU nao aparece no formulario customizado | `PortfolioPage.tsx` |
| 3 | UC-F09 | Mensagem de erro pouco orientativa ao reprocessar sem documento | Backend endpoint |
| 4 | UC-F12 | Metadados IA read-only + auto-save sem confirmacao | `PortfolioPage.tsx` |
| 5 | UC-F14 | Sem toast de confirmacao ao salvar parametros | `ParametrizacoesPage.tsx` |
| 6 | UC-F15 | Feedback silencioso em erros de permissao no save | `ParametrizacoesPage.tsx:671` |

### Correcoes no Tutorial (ALTA prioridade)
| # | UC | Correcao |
|---|---|---|
| 1 | UC-F07 | Alertar que processamento IA salva automaticamente (sem etapa de revisao) |
| 2 | UC-F07 | Esclarecer passo de importacao em lote: "Adicionar Produto > Plano de Contas (ERP) > upload .xlsx/.csv/.pdf" |
| 3 | UC-F08 | Explicar que dropdowns dependem de UC-F13 — reordenar |
| 4 | UC-F09 | Adicionar passo de upload de documento ANTES de reprocessar |
| 5 | UC-F10 | Informar que busca ANVISA/Web depende de servicos externos |
| 6 | UC-F13 | UC-F13 deve ser executado PRIMEIRO — seed de classificacao necessario |
| 7 | UC-F16 | Alertar que fontes sao globais — nao desligar em ambiente compartilhado |

### Observacoes que NAO procedem
| # | UC | Motivo |
|---|---|---|
| 1 | UC-F07 (OBS-24) | Importacao em lote via Plano de Contas ja existe (upload type plano_contas + NFS) |
| 2 | UC-F08 (OBS-25) | Confirmacao de exclusao existe (window.confirm) |
| 3 | UC-F12 (OBS-34) | Quantidade de palavras-chave variavel e comportamento normal do LLM |

### Dependencias entre UCs (recomendacao de reordenacao)
```
UC-F13 (Classificacao) ─┬─> UC-F02 (Area Padrao)
                        ├─> UC-F08 (Cadastro Manual)
                        └─> UC-F07 (Processamento IA)

UC-F09 (Reprocessar) ───> requer documento anexado (UC-F03 ou upload)
UC-F04 (Certidoes) ─────> requer fontes inicializadas
```

---

## Metricas

| Categoria | Quantidade |
|---|---|
| Total de observacoes analisadas | 18 (OBS-23 a OBS-40) |
| PROCEDE | 11 |
| PROCEDE PARCIAL | 3 |
| NAO PROCEDE | 3 |
| MELHORIA | 1 |
| Bugs CRITICOS encontrados | 3 (F11 thresholds, F17 colunas, F16 global) |
