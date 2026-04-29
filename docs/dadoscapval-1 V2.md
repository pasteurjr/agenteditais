# Conjunto de Dados 1 — Captacao e Validacao (Sprint 2) — V2

**Versao:** V2 (29/04/2026)
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Perfil:** Fornecedora de equipamentos medico-hospitalares para cirurgia, UTI, emergencia e diagnostico por imagem, atuante em licitacoes publicas via PNCP.
**Uso:** Conjunto principal — dados completos e validos para fluxo feliz de todos os UC-CV01 a UC-CV13.

> **Pre-requisito V2 (29/04/2026):** Hierarquia Area/Classe/Subclasse criada via UC-F13 V8 (Sprint 1). Os filtros cascata desta sprint usam essas 2 areas + 3 classes + 3 subclasses. Ver `dadosempportpar-1 V2.md` secao "UC-F13 V8" para a estrutura completa.
>
> **Hierarquia esperada (criada em UC-F13 V8 da Sprint 1):**
> - Area: `Equipamentos Medico-Hospitalares` > Classe: `Monitoracao` > Subclasse: `Monitor Multiparametrico` (NCM `9018.19.90`)
> - Area: `Diagnostico in Vitro e Laboratorio` > Classe: `Reagentes Bioquimicos` > Subclasse: `Reagente para Glicose` (NCM `3822.19.90`)
> - Area: `Diagnostico in Vitro e Laboratorio` > Classe: `Reagentes e Kits Diagnosticos` > Subclasse: `Kit de Hematologia` (NCM `3822.19.90`)

---

## Contexto de Acesso — Usuarios e Empresas

### Usuarios de Validacao

| Campo | Usuario Principal | Usuario Secundario |
|---|---|---|
| Email | valida1@valida.com.br | valida2@valida.com.br |
| Senha | 123456 | 123456 |
| Perfil | Superusuario | Superusuario |
| Empresa vinculada | CH Hospitalar | (associar previamente) |
| Papel | admin | admin |

### Fluxo de Login (Superusuario)

1. Acessar o sistema em `http://localhost:5175`
2. Preencher email e senha
3. Apos autenticacao, aparece **tela de selecao de empresa** (lista todas as empresas disponiveis)
4. Clicar em "CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Pre-requisito: Dados da Sprint 1

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-1.md` devem estar cadastrados antes de executar os testes da Sprint 2. Os produtos relevantes sao:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Ultrassonografo Portatil Mindray M7T | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |
| Monitor Multiparametrico Mindray iMEC10 Plus | Mindray | 9018.19.90 | Equip. Medico-Hospitalares |

---

## UC-CV01 — Buscar editais por termo, classificacao e score

### Busca 1 — Termo simples (Score Rapido)

| Campo | Valor |
|---|---|
| Termo de busca | monitor multiparametrico |
| UF | Todas |
| Fonte | PNCP |
| Modalidade | Todos |
| Analise de Score | Score Rapido |
| Incluir editais encerrados | Nao |

### Busca 2 — Termo com NCM e UF (Score Hibrido)

| Campo | Valor |
|---|---|
| Termo de busca | ultrassom portatil |
| NCM | 9018.19.90 |
| UF | SP |
| Fonte | PNCP |
| Modalidade | Todos |
| Analise de Score | Score Hibrido |
| Incluir editais encerrados | Nao |

### Busca 3 — Cascata Area/Classe/Subclasse (Score Profundo)

| Campo | Valor |
|---|---|
| Termo de busca | equipamento medico |
| Area | Equipamentos Medico-Hospitalares |
| Classe | Equipamentos de Diagnostico por Imagem |
| Subclasse | Ultrassonografo |
| Analise de Score | Score Profundo |
| Qtd editais profundo | 5 |
| Incluir editais encerrados | Sim |

### Busca 4 — Sem Score (busca rapida)

| Campo | Valor |
|---|---|
| Termo de busca | desfibrilador |
| UF | RJ |
| Fonte | PNCP |
| Analise de Score | Sem Score |

### Resultados esperados

- Busca 1: retorna editais com "monitor multiparametrico" no objeto, calcula score rapido por aderencia ao portfolio
- Busca 2: retorna editais filtrados por NCM e UF=SP, score hibrido (rapido + profundo nos top)
- Busca 3: retorna editais classificados por area/classe/subclasse, score profundo nos 5 primeiros
- Busca 4: retorna editais sem calculo de score (busca pura)

---

## UC-CV02 — Explorar resultados e painel lateral do edital

### Edital para explorar (selecionar da lista de resultados da Busca 1)

| Acao | Descricao |
|---|---|
| Selecionar edital | Clicar na primeira linha com score >= 50% na tabela de resultados |
| Verificar painel lateral | Deve exibir: numero, orgao, UF, objeto, valor, modalidade, produto correspondente, score |
| Score Profundo | Se calculado, verificar 6 dimensoes: Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial |
| Decisao IA | GO / NO-GO / Acompanhar — verificar badge e justificativa |

### Verificacoes do painel lateral

| Elemento | Verificacao |
|---|---|
| Numero do edital | Exibido no cabecalho do painel |
| Orgao | Nome do orgao contratante visivel |
| UF | Estado visivel |
| Objeto | Descricao completa do objeto |
| Valor estimado | Formatado em R$ |
| Modalidade | Tipo de licitacao |
| Produto Correspondente | Match com portfolio (Monitor ou Ultrassom) |
| Score | Barra percentual com cor (verde >= 70, amarelo >= 40, vermelho < 40) |
| Potencial | Badge Alto/Medio/Baixo |

---

## UC-CV03 — Salvar edital, itens e scores da captacao

### Cenario 1 — Salvar edital individual

| Acao | Descricao |
|---|---|
| Selecionar edital | Primeiro edital com score >= 60% da Busca 1 |
| Clicar | Botao "Salvar Edital" no painel lateral |
| Verificar | Badge "Salvo" aparece na linha da tabela |
| Verificar | Edital aparece na ValidacaoPage em "Meus Editais" |

### Cenario 2 — Salvar todos

| Acao | Descricao |
|---|---|
| Executar | Busca 4 (desfibrilador, sem score) |
| Clicar | Botao "Salvar Todos" na secao de acoes em lote |
| Verificar | Todos os editais da lista ficam com badge "Salvo" |

### Cenario 3 — Salvar somente score >= 70%

| Acao | Descricao |
|---|---|
| Executar | Busca 1 (monitor multiparametrico, score rapido) |
| Clicar | Botao "Salvar Score >= 70%" |
| Verificar | Apenas editais com score >= 70% recebem badge "Salvo" |

### Cenario 4 — Salvar selecionados

| Acao | Descricao |
|---|---|
| Executar | Busca 2 (ultrassom portatil) |
| Marcar | Checkbox de 3 editais na tabela |
| Clicar | Botao "Salvar Selecionados" |
| Verificar | Apenas os 3 editais marcados ficam com badge "Salvo" |

---

## UC-CV04 — Definir estrategia, intencao e margem do edital

### Estrategia para o edital salvo no UC-CV03 Cenario 1

| Campo | Valor |
|---|---|
| Intencao Estrategica | Estrategico |
| Margem desejada | 25% |
| Varia por Produto | Sim |
| Varia por Regiao | Nao |

### Verificacoes

| Acao | Verificacao |
|---|---|
| Selecionar radio "Estrategico" | Radio fica selecionado |
| Ajustar slider para 25% | Valor exibido como 25% |
| Ativar toggle "Varia por Produto" | Toggle fica ativo (azul) |
| Clicar "Salvar Estrategia" | Toast de sucesso aparece |
| Reabrir o painel | Estrategia salva persiste (Estrategico, 25%) |

### Estrategia alternativa para segundo edital

| Campo | Valor |
|---|---|
| Intencao Estrategica | Defensivo |
| Margem desejada | 10% |
| Varia por Produto | Nao |
| Varia por Regiao | Sim |

---

## UC-CV05 — Exportar e consolidar resultados da busca

### Exportar CSV

| Acao | Descricao |
|---|---|
| Executar | Busca 1 (monitor multiparametrico) |
| Clicar | Botao "Exportar CSV" |
| Verificar | Download de arquivo .csv com colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Score |

### Relatorio Completo

| Acao | Descricao |
|---|---|
| Executar | Busca 2 (ultrassom portatil) |
| Clicar | Botao "Relatorio Completo" |
| Verificar | Relatorio gerado em markdown/HTML com resumo, ranking de editais e analise consolidada |

---

## UC-CV06 — Gerir monitoramentos automaticos de busca

### Monitoramento 1 — Monitor Multiparametrico

| Campo | Valor |
|---|---|
| Termo | monitor multiparametrico |
| NCM | 9018.19.90 |
| UFs | SP, RJ, MG |
| Fonte | PNCP |
| Frequencia | A cada 6 horas |
| Score Minimo | 60 |
| Incluir Encerrados | Nao |

### Monitoramento 2 — Ultrassonografo

| Campo | Valor |
|---|---|
| Termo | ultrassonografo portatil |
| NCM | 9018.19.90 |
| UFs | Todas |
| Fonte | PNCP |
| Frequencia | A cada 12 horas |
| Score Minimo | 50 |
| Incluir Encerrados | Nao |

### Ciclo de vida do monitoramento

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Criar Monitoramento 1 | Aparece na tabela "Monitoramentos Ativos" com status Ativo |
| 2 | Criar Monitoramento 2 | Aparece abaixo do primeiro |
| 3 | Pausar Monitoramento 1 | Status muda para "Pausado" (badge cinza) |
| 4 | Retomar Monitoramento 1 | Status volta para "Ativo" (badge verde) |
| 5 | Excluir Monitoramento 2 | Removido da tabela |

---

## UC-CV07 — Listar editais salvos e selecionar edital para analise

### Pre-condicao

Editais salvos nos UC-CV03 (cenarios 1 a 4) devem estar disponiveis.

### Filtros de busca

| Filtro | Valor | Resultado esperado |
|---|---|---|
| Status = Todos | — | Lista todos os editais salvos |
| Status = Novo | — | Filtra apenas editais com status "Novo" |
| Busca por texto | "monitor" | Filtra editais cujo objeto contenha "monitor" |

### Selecionar edital para analise

| Acao | Descricao |
|---|---|
| Clicar na linha | Selecionar o edital de "monitor multiparametrico" salvo no UC-CV03 |
| Verificar Card "Edital Info" | Numero, Orgao, Objeto, Valor, Abertura exibidos |
| Verificar abas | 6 abas visiveis: Aderencia, Lotes, Documentos, Riscos, Mercado, IA |
| Botao "Ver Edital" | Abre visualizador de PDF (se PDF disponivel) |

---

## UC-CV08 — Calcular scores multidimensionais e decidir GO/NO-GO

### Calculo de scores

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | Aderencia |
| Clicar | "Calcular Scores IA" |
| Aguardar | Calculo leva alguns segundos |

### Scores esperados (6 dimensoes)

| Dimensao | Descricao | Faixa esperada |
|---|---|---|
| Tecnica | Aderencia do produto ao edital | 40-95% |
| Documental | Completude documental da empresa | 50-90% |
| Complexidade | Complexidade da licitacao | 30-80% |
| Juridico | Riscos juridicos identificados | 40-90% |
| Logistico | Viabilidade logistica (distancia, prazo) | 50-95% |
| Comercial | Competitividade de preco e mercado | 40-85% |

### Decisao GO/NO-GO

| Cenario | Acao | Verificacao |
|---|---|---|
| GO | Clicar "Participar (GO)" | Botao fica verde, secao de justificativa abre |
| Justificativa GO | Motivo: "Aderencia tecnica alta" / Detalhes: "Produto atende 100% dos requisitos do edital, preco competitivo, empresa tem documentacao completa." | Campos preenchidos |
| Salvar | Clicar "Salvar Justificativa" | Toast de sucesso |

### Cenario alternativo — NO-GO

| Cenario | Acao | Verificacao |
|---|---|---|
| NO-GO | Selecionar outro edital, calcular scores, clicar "Rejeitar (NO-GO)" | Botao fica vermelho |
| Justificativa | Motivo: "Complexidade excessiva" / Detalhes: "Edital exige certificacoes que a empresa nao possui no momento." | Campos preenchidos |
| Salvar | Clicar "Salvar Justificativa" | Toast de sucesso |

---

## UC-CV09 — Importar itens e extrair lotes por IA

### Importar itens do PNCP

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | Lotes |
| Clicar | "Buscar Itens no PNCP" |
| Verificar | Tabela "Itens do Edital" populada com itens do edital (numero, descricao, quantidade, unidade, valor) |

### Itens esperados (exemplo tipico de edital de monitores)

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 1 | Monitor multiparametrico de 12 parametros, tela touch 12" | 10 | UN | R$ 18.500,00 |
| 2 | Oximetro de pulso portatil com sensor neonatal | 20 | UN | R$ 1.200,00 |
| 3 | Cabo de ECG 5 vias para monitor multiparametrico | 10 | UN | R$ 350,00 |
| 4 | Sensor de SpO2 reutilizavel adulto | 15 | UN | R$ 280,00 |
| 5 | Suporte com rodizios para monitor multiparametrico | 10 | UN | R$ 950,00 |

> **Nota:** Os itens reais dependem do edital encontrado na busca. Os dados acima sao representativos do tipo de edital esperado para monitores multiparametricos.

### Extrair lotes via IA

| Acao | Descricao |
|---|---|
| Clicar | "Extrair Lotes via IA" |
| Verificar | Lotes agrupados em cards (ex: Lote 1 — Monitores, Lote 2 — Acessorios) |
| Verificar | Cada lote tem: titulo, valor estimado, lista de itens |

### Mover item entre lotes

| Acao | Descricao |
|---|---|
| Selecionar item | Item 5 (Suporte com rodizios) no Lote 2 |
| Mover para | Lote 1 (via select "Mover para") |
| Verificar | Item 5 aparece no Lote 1 e some do Lote 2 |

### Excluir lote

| Acao | Descricao |
|---|---|
| Clicar | Icone "X" no Lote 2 |
| Verificar | Lote 2 removido, itens redistribuidos ou removidos |

---

## UC-CV10 — Confrontar documentacao necessaria com a empresa

### Documentacao necessaria

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | Documentos |
| Verificar carga | Sistema carrega documentacao necessaria automaticamente |

### Categorias de documentos esperadas

| Categoria | Documentos tipicos | Status esperado |
|---|---|---|
| Habilitacao Juridica | Contrato Social, Procuracao | Disponivel (cadastrado na Sprint 1) |
| Regularidade Fiscal | CND Federal, FGTS, CND Trabalhista | Disponivel ou Pendente |
| Qualificacao Tecnica | Atestados de Capacidade Tecnica, AFE ANVISA | Faltante (se nao cadastrado) |
| Qualificacao Economica | Balanco Patrimonial, Certidao Falencia | Faltante ou Disponivel |
| Outros | Alvara de Funcionamento | Disponivel (cadastrado na Sprint 1) |

### Identificar documentos exigidos pelo edital

| Acao | Descricao |
|---|---|
| Clicar | "Identificar Documentos Exigidos pelo Edital" |
| Verificar | IA extrai requisitos do PDF do edital e popula a checklist |
| Verificar | Checklist mostra status: Atendido / Pendente / Vencido por documento |

### Buscar documentos exigidos (via chat)

| Acao | Descricao |
|---|---|
| Clicar | "Buscar Documentos Exigidos" |
| Verificar | Chat abre com pergunta sobre documentos exigidos pelo edital |
| Verificar | Resposta lista documentos necessarios com base no texto do edital |

### Verificar certidoes

| Acao | Descricao |
|---|---|
| Clicar | "Verificar Certidoes" |
| Verificar | Sistema reexecuta busca de certidoes e atualiza status |

---

## UC-CV11 — Analisar riscos, recorrencia, atas e concorrentes

### Analise de riscos

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | Riscos |
| Clicar | "Analisar Riscos do Edital" |
| Aguardar | Processamento da IA |

### Riscos esperados (tipicos de edital de equipamento medico)

| Categoria | Risco tipico | Severidade |
|---|---|---|
| Juridico | Exigencia de registro ANVISA especifico | Medio |
| Juridico | Clausula de exclusividade de marca | Alto (se presente) |
| Tecnico | Especificacoes tecnicas muito restritas | Medio |
| Financeiro | Prazo de pagamento superior a 30 dias | Baixo |
| Logistico | Entrega em localidade remota | Medio |

### Fatal Flaws

| Verificacao | Descricao |
|---|---|
| Se presente | Badge vermelho "Risco eliminatorio" com descricao |
| Se ausente | Secao vazia ou mensagem "Nenhum risco eliminatorio identificado" |

### Historico de atas e vencedores

| Acao | Descricao |
|---|---|
| Clicar | "Rebuscar Atas" |
| Verificar | Lista de atas encontradas no PNCP com titulo, orgao, UF, data |
| Verificar | Badge de recorrencia: Semestral / Anual / Esporadica |
| Clicar | "Buscar Vencedores e Precos" |
| Verificar | Tabela com: Item, Vencedor, Vlr Estimado, Vlr Homologado, Desconto % |

### Dados de busca de atas

| Campo | Valor |
|---|---|
| Termo de busca (automatico) | Derivado do objeto do edital (ex: "monitor multiparametrico") |
| Periodo | Ultimos 12 meses |

### Concorrentes conhecidos

| Acao | Descricao |
|---|---|
| Clicar | "Atualizar" na secao de concorrentes |
| Verificar | Tabela com: Concorrente, Participacoes, Vitorias, Taxa (%) |

---

## UC-CV12 — Analisar mercado do orgao contratante

### Analise de mercado

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | Mercado |
| Clicar | "Analisar Mercado do Orgao" |
| Aguardar | Processamento (busca PNCP + analise IA) |

### Dados do orgao esperados

| Secao | Campos | Verificacao |
|---|---|---|
| Dados do Orgao | Nome, CNPJ, UF | Preenchidos com dados reais do orgao |
| Reputacao | Esfera, Risco Pagamento, Volume, Modalidade Principal, % Pregao, Editais Similares | 6 indicadores preenchidos |
| Volume PNCP | Compras encontradas, Valor total, Valor medio | 3 cards com valores numericos |
| Compras Similares | Lista de compras do mesmo orgao | Itens com objeto, valor, data, modalidade |
| Historico Interno | Total editais, GO, NO-GO, Em Avaliacao | Badges com contadores |
| Analise IA | Texto analitico | Texto longo descrevendo contexto do orgao |

---

## UC-CV13 — Usar IA na validacao: resumo, perguntas e acoes rapidas

### Gerar resumo

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "monitor multiparametrico" salvo |
| Abrir aba | IA |
| Clicar | "Gerar Resumo" |
| Verificar | Resumo em markdown: secoes com titulo, paragrafos, listas |

### Perguntar a IA

| Pergunta | Resposta esperada |
|---|---|
| "Qual o prazo de entrega exigido?" | Resposta com prazo extraido do edital |
| "O edital exige registro ANVISA?" | Resposta indicando se ha exigencia e qual classe |
| "Quais sao as garantias exigidas?" | Resposta com tipos de garantia (execucao, proposta, etc.) |

### Acoes rapidas

| Acao | Verificacao |
|---|---|
| Clicar "Requisitos Tecnicos" | Lista de requisitos tecnicos do edital |
| Clicar "Classificar Edital" | Classificacao: Venda / Comodato / Aluguel / Consumo / Servico, com justificativa |

### Regerar resumo

| Acao | Descricao |
|---|---|
| Clicar | "Regerar Resumo" |
| Verificar | Resumo atualizado (pode variar do anterior) |

---

## Notas para validacao

1. **Buscas dependem de dados reais do PNCP**: os resultados variam conforme editais publicados no momento da execucao. Os termos de busca foram escolhidos para maximizar a chance de retorno de resultados.
2. **Scores sao calculados pela IA**: valores exatos variam, mas as faixas indicadas sao tipicas para o perfil da empresa CH Hospitalar.
3. **PDFs de editais**: necessarios para UC-CV09 (extracao de lotes), UC-CV10 (requisitos documentais) e UC-CV13 (resumo IA). Serao baixados automaticamente do PNCP quando o edital for salvo.
4. **Ordem de execucao recomendada**: UC-CV01 a UC-CV06 (Captacao), depois UC-CV07 a UC-CV13 (Validacao). A Validacao depende de editais salvos na Captacao.
5. **Arquivo de teste para uploads**: usar `tests/fixtures/teste_upload.pdf` quando necessario.
