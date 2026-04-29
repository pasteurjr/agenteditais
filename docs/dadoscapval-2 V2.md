# Conjunto de Dados 2 — Captacao e Validacao (Sprint 2) — V2

**Versao:** V2 (29/04/2026)
**Empresa:** RP3X Comercio e Representacoes Ltda.
**Perfil:** Distribuidora de reagentes e kits diagnosticos para laboratorios clinicos e hospitalares, atuante em licitacoes publicas via PNCP.
**Uso:** Conjunto complementar — cobre cenarios alternativos, fluxos negativos e dados distintos do Conjunto 1 para UC-CV01 a UC-CV13.

> **Pre-requisito V2 (29/04/2026):** Hierarquia Area/Classe/Subclasse criada via UC-F13 V8 (Sprint 1) para a empresa RP3X. Sem isso, filtros cascata (UC-CV01..09) ficam vazios.
>
> **Hierarquia esperada (criada em UC-F13 V8 da Sprint 1):**
> - Area: `Equipamentos Medico-Hospitalares` > Classe: `Monitoracao` > Subclasse: `Monitor Multiparametrico` (NCM `9018.19.90`)
> - Area: `Diagnostico in Vitro e Laboratorio` > Classe: `Reagentes Bioquimicos` > Subclasse: `Reagente para Glicose` (NCM `3822.19.90`)
> - Area: `Diagnostico in Vitro e Laboratorio` > Classe: `Reagentes e Kits Diagnosticos` > Subclasse: `Kit de Hematologia` (NCM `3822.19.90`)
>
> Ver `dadosempportpar-2 V2.md` secao "UC-F13 V8" para detalhes.

---

## Contexto de Acesso — Usuarios e Empresas

### Usuarios de Validacao

| Campo | Usuario Principal | Usuario Secundario |
|---|---|---|
| Email | valida2@valida.com.br | valida1@valida.com.br |
| Senha | 123456 | 123456 |
| Perfil | Superusuario | Superusuario |
| Empresa vinculada | RP3X | CH Hospitalar |
| Papel | admin | admin |

### Fluxo de Login (Superusuario)

1. Acessar o sistema em `http://localhost:5175`
2. Preencher email: `valida2@valida.com.br`, senha: `123456`
3. Apos autenticacao, aparece **tela de selecao de empresa**
4. Clicar em "RP3X Comercio e Representacoes Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Pre-requisito: Dados da Sprint 1

Os dados de empresa, portfolio e parametrizacoes do `dadosempportpar-2.md` devem estar cadastrados antes de executar os testes da Sprint 2. Os produtos relevantes sao:

| Produto | Fabricante | NCM | Area |
|---|---|---|---|
| Kit de Reagentes para Hemograma Completo Sysmex XN | Sysmex | 3822.19.90 | Diagnostico in Vitro e Laboratorio |
| Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao | Wiener Lab Group | 3822.19.90 | Diagnostico in Vitro e Laboratorio |

### Pre-requisito: Associar valida2 a RP3X

Se RP3X foi criada por valida1, associar valida2 antes:
1. Login com valida1
2. Menu "Associar Empresa/Usuario"
3. Empresa: RP3X, Usuario: valida2@valida.com.br, Papel: admin
4. Clicar "Vincular"

---

## UC-CV01 — Buscar editais por termo, classificacao e score

### Busca 1 — Reagentes de hematologia (Score Rapido)

| Campo | Valor |
|---|---|
| Termo de busca | reagente hematologia |
| UF | Todas |
| Fonte | PNCP |
| Modalidade | Todos |
| Analise de Score | Score Rapido |
| Incluir editais encerrados | Nao |

### Busca 2 — Kit diagnostico com NCM (Score Hibrido)

| Campo | Valor |
|---|---|
| Termo de busca | kit diagnostico laboratorio |
| NCM | 3822.19.90 |
| UF | SP |
| Fonte | PNCP |
| Modalidade | Todos |
| Analise de Score | Score Hibrido |
| Incluir editais encerrados | Nao |

### Busca 3 — Cascata Area/Classe/Subclasse (Score Profundo)

| Campo | Valor |
|---|---|
| Termo de busca | reagente bioquimico |
| Area | Diagnostico in Vitro e Laboratorio |
| Classe | Reagentes e Kits Diagnosticos |
| Subclasse | Kit de Hematologia |
| Analise de Score | Score Profundo |
| Qtd editais profundo | 5 |
| Incluir editais encerrados | Sim |

### Busca 4 — Glicose enzimatica (Sem Score)

| Campo | Valor |
|---|---|
| Termo de busca | glicose enzimatica laboratorio |
| UF | MG |
| Fonte | PNCP |
| Analise de Score | Sem Score |

### Busca 5 — Termo generico amplo

| Campo | Valor |
|---|---|
| Termo de busca | material laboratorial |
| UF | Todas |
| Fonte | PNCP |
| Analise de Score | Score Rapido |
| Incluir editais encerrados | Sim |

### Resultados esperados

- Busca 1: editais de reagentes para hematologia, score rapido calculado
- Busca 2: editais de kits diagnosticos filtrados por NCM 3822.19.90 e UF=SP
- Busca 3: editais classificados na arvore Diagnostico in Vitro, score profundo nos top 5
- Busca 4: busca simples sem score, filtrando por MG
- Busca 5: busca ampla para testar volume de resultados

---

## UC-CV02 — Explorar resultados e painel lateral do edital

### Edital para explorar (selecionar da lista da Busca 1)

| Acao | Descricao |
|---|---|
| Selecionar edital | Clicar no primeiro edital de reagente hematologia com score >= 40% |
| Verificar painel lateral | Numero, orgao, UF, objeto, valor, modalidade |
| Produto Correspondente | Deve fazer match com "Kit de Reagentes para Hemograma Completo Sysmex XN" |

### Explorar segundo edital (Busca 2)

| Acao | Descricao |
|---|---|
| Selecionar edital | Clicar em edital de kit diagnostico |
| Verificar score hibrido | Se profundo calculado: 6 ScoreBars visiveis |
| Verificar produto | Match com "Kit para Glicose Enzimatica" ou "Kit Hemograma" |

---

## UC-CV03 — Salvar edital, itens e scores da captacao

### Cenario 1 — Salvar edital individual de reagentes

| Acao | Descricao |
|---|---|
| Selecionar edital | Primeiro edital de "reagente hematologia" da Busca 1 |
| Clicar | "Salvar Edital" no painel lateral |
| Verificar | Badge "Salvo" na linha |

### Cenario 2 — Salvar selecionados de kits diagnosticos

| Acao | Descricao |
|---|---|
| Executar | Busca 2 (kit diagnostico) |
| Marcar | 2 editais com checkbox |
| Clicar | "Salvar Selecionados" |
| Verificar | 2 editais com badge "Salvo" |

### Cenario 3 — Salvar todos de glicose

| Acao | Descricao |
|---|---|
| Executar | Busca 4 (glicose enzimatica) |
| Clicar | "Salvar Todos" |
| Verificar | Todos ficam com badge "Salvo" |

---

## UC-CV04 — Definir estrategia, intencao e margem do edital

### Estrategia 1 — Edital de reagentes (competitivo)

| Campo | Valor |
|---|---|
| Intencao Estrategica | Estrategico |
| Margem desejada | 20% |
| Varia por Produto | Nao |
| Varia por Regiao | Nao |

### Estrategia 2 — Edital de glicose (acompanhamento)

| Campo | Valor |
|---|---|
| Intencao Estrategica | Acompanhamento |
| Margem desejada | 15% |
| Varia por Produto | Sim |
| Varia por Regiao | Sim |

### Estrategia 3 — Edital generico (aprendizado)

| Campo | Valor |
|---|---|
| Intencao Estrategica | Aprendizado |
| Margem desejada | 5% |
| Varia por Produto | Nao |
| Varia por Regiao | Nao |

### Verificacoes

| Acao | Verificacao |
|---|---|
| Salvar cada estrategia | Toast de sucesso |
| Reabrir painel | Valores persistem corretamente |

---

## UC-CV05 — Exportar e consolidar resultados da busca

### Exportar CSV

| Acao | Descricao |
|---|---|
| Executar | Busca 1 (reagente hematologia) |
| Clicar | "Exportar CSV" |
| Verificar | Arquivo CSV baixado com colunas corretas |

### Relatorio Completo

| Acao | Descricao |
|---|---|
| Executar | Busca 5 (material laboratorial — busca ampla) |
| Clicar | "Relatorio Completo" |
| Verificar | Relatorio consolidado gerado com ranking e analise |

---

## UC-CV06 — Gerir monitoramentos automaticos de busca

### Monitoramento 1 — Reagentes de Hematologia

| Campo | Valor |
|---|---|
| Termo | reagente hematologia hemograma |
| NCM | 3822.19.90 |
| UFs | SP, MG, PR, RS |
| Fonte | PNCP |
| Frequencia | A cada 6 horas |
| Score Minimo | 50 |
| Incluir Encerrados | Nao |

### Monitoramento 2 — Kits Bioquimicos

| Campo | Valor |
|---|---|
| Termo | reagente bioquimico glicose colesterol |
| NCM | 3822.19.90 |
| UFs | Todas |
| Fonte | PNCP |
| Frequencia | A cada 24 horas |
| Score Minimo | 40 |
| Incluir Encerrados | Sim |

### Monitoramento 3 — Material Laboratorial Geral

| Campo | Valor |
|---|---|
| Termo | material laboratorio clinico |
| NCM | (vazio) |
| UFs | SP |
| Fonte | PNCP |
| Frequencia | A cada 12 horas |
| Score Minimo | 30 |
| Incluir Encerrados | Nao |

### Ciclo de vida

| Passo | Acao | Verificacao |
|---|---|---|
| 1 | Criar Monitoramento 1 | Status Ativo na tabela |
| 2 | Criar Monitoramento 2 | Aparece abaixo |
| 3 | Criar Monitoramento 3 | Terceiro na lista |
| 4 | Pausar Monitoramento 2 | Badge "Pausado" |
| 5 | Atualizar Monitoramento 1 | Campo "Ultimo Check" atualiza |
| 6 | Retomar Monitoramento 2 | Badge volta a "Ativo" |
| 7 | Excluir Monitoramento 3 | Removido da lista |

---

## UC-CV07 — Listar editais salvos e selecionar edital para analise

### Pre-condicao

Editais salvos nos UC-CV03 (cenarios 1 a 3) devem estar disponiveis.

### Filtros de busca

| Filtro | Valor | Resultado esperado |
|---|---|---|
| Status = Todos | — | Lista todos os editais salvos da RP3X |
| Status = Novo | — | Filtra editais com status "Novo" |
| Busca por texto | "reagente" | Filtra editais com "reagente" no objeto |
| Busca por texto | "glicose" | Filtra editais com "glicose" no objeto |

### Selecionar edital para analise

| Acao | Descricao |
|---|---|
| Clicar na linha | Selecionar edital de "reagente hematologia" |
| Verificar Card "Edital Info" | Dados do edital exibidos corretamente |
| Verificar abas | 6 abas visiveis |

---

## UC-CV08 — Calcular scores multidimensionais e decidir GO/NO-GO

### Calculo de scores para edital de reagentes

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | Aderencia |
| Clicar | "Calcular Scores IA" |

### Scores esperados

| Dimensao | Descricao | Faixa esperada |
|---|---|---|
| Tecnica | Aderencia do kit ao edital | 50-95% |
| Documental | Completude documental RP3X | 40-85% |
| Complexidade | Complexidade (reagentes geralmente media) | 30-70% |
| Juridico | Riscos juridicos (AFE, ANVISA) | 40-80% |
| Logistico | Viabilidade (cadeia fria, prazo) | 40-90% |
| Comercial | Competitividade de preco | 50-90% |

### Decisao — GO

| Acao | Verificacao |
|---|---|
| Clicar "Participar (GO)" | Botao verde selecionado |
| Motivo | "Boa aderencia tecnica" |
| Detalhes | "Kit Sysmex XN atende todos os parametros do edital. Empresa possui AFE vigente e documentacao fiscal completa." |
| Salvar | Toast de sucesso |

### Decisao alternativa — Em Avaliacao

| Acao | Verificacao |
|---|---|
| Selecionar outro edital (kit diagnostico) | Calcular scores |
| Clicar "Acompanhar (Em Avaliacao)" | Botao amarelo selecionado |
| Motivo | "Pendencia documental" |
| Detalhes | "Necessario atualizar atestado de capacidade tecnica antes de participar. Demais criterios atendem." |
| Salvar | Toast de sucesso |

---

## UC-CV09 — Importar itens e extrair lotes por IA

### Importar itens do PNCP

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | Lotes |
| Clicar | "Buscar Itens no PNCP" |

### Itens esperados (exemplo tipico de edital de reagentes)

| # | Descricao | Qtd | Unid | Vlr Unit Est. |
|---|---|---|---|---|
| 1 | Reagente para hemograma completo (hemoglobina, hematocrito, contagem celulas) - cx 500 testes | 50 | CX | R$ 1.850,00 |
| 2 | Reagente diluente isotontico para contador hematologico - gal 20L | 30 | GL | R$ 420,00 |
| 3 | Reagente lisante para contagem diferencial de leucocitos - fr 500mL | 40 | FR | R$ 380,00 |
| 4 | Calibrador hematologico multiparametrico - kit 3 niveis | 10 | KIT | R$ 2.200,00 |
| 5 | Controle hematologico normal e patologico - kit 2 niveis | 20 | KIT | R$ 1.100,00 |
| 6 | Reagente para glicose enzimatica GOD-PAP - kit 100 det. | 100 | KIT | R$ 45,00 |
| 7 | Reagente para colesterol total enzimatico - kit 100 det. | 80 | KIT | R$ 52,00 |
| 8 | Ponteiras descartaveis para pipeta automatica 200uL - cx 1000 | 200 | CX | R$ 35,00 |

> **Nota:** Os itens reais dependem do edital encontrado. Os dados acima sao representativos do tipo de edital esperado para reagentes laboratoriais.

### Extrair lotes via IA

| Acao | Descricao |
|---|---|
| Clicar | "Extrair Lotes via IA" |
| Verificar Lote 1 | "Hematologia" — itens 1, 2, 3, 4, 5 |
| Verificar Lote 2 | "Bioquimica" — itens 6, 7 |
| Verificar Lote 3 | "Material de Consumo" — item 8 |

### Mover item entre lotes

| Acao | Descricao |
|---|---|
| Item 8 (ponteiras) no Lote 3 | Mover para Lote 1 |
| Verificar | Item 8 agora no Lote 1 |

### Excluir lote

| Acao | Descricao |
|---|---|
| Excluir Lote 3 | Clicar "X" (agora vazio apos mover item 8) |
| Verificar | Lote 3 removido, restam Lote 1 e Lote 2 |

---

## UC-CV10 — Confrontar documentacao necessaria com a empresa

### Documentacao necessaria

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | Documentos |

### Categorias esperadas para reagentes laboratoriais

| Categoria | Documentos tipicos | Status esperado |
|---|---|---|
| Habilitacao Juridica | Contrato Social, CNPJ | Disponivel |
| Regularidade Fiscal | CND Federal, FGTS, Trabalhista | Disponivel ou Pendente |
| Qualificacao Tecnica | AFE ANVISA, Atestado Capacidade Tecnica | Disponivel (se cadastrado) |
| Sanitarias | Autorizacao de Funcionamento (AFE), Licenca Sanitaria | Critico — verificar |
| Qualificacao Economica | Balanco, Certidao Falencia | Pendente |

### Documentos especificos de reagentes (IA deve identificar)

| Documento exigido | Descricao |
|---|---|
| AFE — Autorizacao Funcionamento ANVISA | Obrigatoria para comercio de produtos para saude |
| Licenca Sanitaria Estadual/Municipal | Exigida para armazenamento de reagentes |
| Registro ANVISA dos produtos | Cada reagente deve ter registro vigente |
| Certificado de Boas Praticas de Distribuicao | Para distribuidoras de correlatos |
| Laudo de estabilidade dos reagentes | Comprovacao de shelf-life |

### Identificar documentos exigidos pelo edital

| Acao | Descricao |
|---|---|
| Clicar | "Identificar Documentos Exigidos pelo Edital" |
| Verificar | Lista de documentos extraidos do PDF com status de atendimento |

---

## UC-CV11 — Analisar riscos, recorrencia, atas e concorrentes

### Analise de riscos

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | Riscos |
| Clicar | "Analisar Riscos do Edital" |

### Riscos especificos de reagentes laboratoriais

| Categoria | Risco tipico | Severidade |
|---|---|---|
| Juridico | Exigencia de AFE ANVISA vigente | Alto |
| Juridico | Clausula de exclusividade de plataforma (comodato vinculado) | Critico (se presente) |
| Tecnico | Compatibilidade com equipamento instalado no hospital | Alto |
| Tecnico | Prazo de validade minimo exigido (6 ou 12 meses) | Medio |
| Financeiro | Registro de precos com prazo de 12 meses sem reajuste | Medio |
| Logistico | Cadeia fria (2-8C) para transporte e armazenamento | Alto |
| Logistico | Entrega fracionada mensal obrigatoria | Medio |

### Fatal Flaws esperados

| Cenario | Descricao |
|---|---|
| Se edital exige marca especifica | "Direcionamento de marca — possivel impugnacao" |
| Se exige equipamento em comodato vinculado | "Vinculacao reagente-equipamento pode restringir competicao" |

### Historico de atas e vencedores

| Acao | Descricao |
|---|---|
| Clicar | "Rebuscar Atas" |
| Verificar | Atas de reagentes no PNCP com dados de vencedores |
| Clicar | "Buscar Vencedores e Precos" |
| Verificar | Precos homologados por item comparados com estimativa |

### Dados de concorrentes tipicos do setor

| Concorrente | Perfil |
|---|---|
| Labtest Diagnostica | Nacional, forte em bioquimica |
| Wama Diagnostica | Nacional, hematologia e imunologia |
| Siemens Healthineers | Multinacional, plataforma integrada |
| Beckman Coulter | Multinacional, hematologia premium |
| Abbott Diagnostics | Multinacional, bioquimica e imunologia |

---

## UC-CV12 — Analisar mercado do orgao contratante

### Analise de mercado

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | Mercado |
| Clicar | "Analisar Mercado do Orgao" |

### Verificacoes

| Secao | Verificacao |
|---|---|
| Dados do Orgao | Nome, CNPJ, UF preenchidos |
| Reputacao | Esfera (Federal/Estadual/Municipal), risco pagamento, volume |
| Volume PNCP | Compras encontradas com valores |
| Compras Similares | Compras anteriores de reagentes pelo mesmo orgao |
| Historico Interno | Contadores de editais da RP3X para este orgao |
| Analise IA | Texto analitico sobre o orgao e mercado de reagentes |

---

## UC-CV13 — Usar IA na validacao: resumo, perguntas e acoes rapidas

### Gerar resumo

| Acao | Descricao |
|---|---|
| Selecionar edital | Edital de "reagente hematologia" |
| Abrir aba | IA |
| Clicar | "Gerar Resumo" |
| Verificar | Resumo estruturado: objeto, prazo, itens principais, exigencias tecnicas |

### Perguntar a IA

| Pergunta | Resposta esperada |
|---|---|
| "Os reagentes precisam ser compativeis com algum equipamento especifico?" | Resposta indicando se ha vinculacao a plataforma |
| "Qual o prazo de validade minimo exigido para os reagentes?" | Prazo extraido do edital (tipicamente 12 meses) |
| "O edital exige entrega fracionada?" | Resposta sobre cronograma de entregas |
| "E necessario AFE ANVISA?" | Resposta sobre exigencia sanitaria |
| "Qual o regime de fornecimento — registro de precos ou contrato direto?" | Tipo de contratacao |

### Acoes rapidas

| Acao | Verificacao |
|---|---|
| "Requisitos Tecnicos" | Lista: compatibilidade com equipamento, prazo validade, certificados, metodo analitico |
| "Classificar Edital" | Classificacao: Consumo (reagentes sao consumiveis), com justificativa |

### Regerar resumo

| Acao | Descricao |
|---|---|
| Clicar | "Regerar Resumo" |
| Verificar | Resumo regenerado com conteudo atualizado |

---

## Notas para validacao

1. **Reagentes laboratoriais sao um mercado ativo no PNCP**: os termos de busca "reagente hematologia" e "kit diagnostico" tendem a retornar muitos resultados.
2. **Especificidades de reagentes**: cadeia fria, validade, compatibilidade com equipamento, AFE ANVISA — esses pontos devem aparecer nos riscos e na analise documental.
3. **Comodato vinculado**: muitos editais de reagentes exigem fornecimento de equipamento em comodato junto com os reagentes. Isso deve ser detectado como risco pela IA.
4. **Ordem de execucao**: UC-CV01 a UC-CV06 (Captacao), depois UC-CV07 a UC-CV13 (Validacao). Validacao depende de editais salvos na Captacao.
5. **Diferenca em relacao ao Conjunto 1**: este conjunto exercita um segmento de mercado diferente (reagentes vs equipamentos), com riscos regulatorios distintos (cadeia fria, comodato vinculado, shelf-life).
6. **Arquivo de teste para uploads**: usar `tests/fixtures/teste_upload.pdf` quando necessario.
7. **Concorrentes**: os nomes listados sao fabricantes/distribuidores reais do setor de diagnostico in vitro, usados como referencia para a secao de concorrentes.
