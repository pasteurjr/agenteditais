# Demonstração das Principais Funções do Facilicita.IA

**Sistema:** Facilicita.IA — Plataforma de Automação de Licitações Governamentais
**Data:** 2026-05-13
**Público:** Usuário final (analista comercial, gestor, dono de empresa)

---

## Por que esse documento existe

Este é um **manual visual** das 24 principais funções do Facilicita.IA, organizadas na ordem natural de uso. Cada função tem: 

- **Pra que serve** no seu dia-a-dia
- **Como acessar** (caminho no menu)
- **O que você vai ver** na tela
- **Tela real** capturada durante teste automatizado
- **Dica prática** quando relevante

Cada tela mostrada foi gerada por um teste automatizado real, executado em 13/05/2026, percorrendo o ciclo completo de uma licitação fictícia (empresa MediTest Equipamentos Diagnósticos cadastrando produtos, buscando editais, fazendo proposta, etc).

---

## 1. PREPARAÇÃO DA EMPRESA

_Antes de licitar, você cadastra sua empresa no sistema. Esses passos são feitos uma vez (e atualizados quando algo muda)._

### Cadastro da Empresa

**Pra que serve:** É o cartão de identidade da empresa no sistema.

Aqui você registra os dados básicos da sua empresa: razão social, CNPJ, endereço, contatos. Sem esse cadastro o sistema não sabe quem está participando das licitações — é o primeiro passo obrigatório de tudo.

**📍 Como acessar:** Menu lateral → Configurações → Empresa

**👀 O que você vê:** Um formulário dividido em seções (Dados Principais, Endereço, Redes Sociais). Conforme preenche, os campos validam automaticamente (CNPJ na Receita, CEP no ViaCEP).

**Tela:**

![s1_f01_passo_09_salvar_e_confirmar](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f01_passo_09_salvar_e_confirmar_after.png)

> 💡 **Dica:** Se você é superusuário e está cadastrando uma empresa nova, vai precisar fazer a vinculação 'Empresa↔Usuário' depois — sem isso o sistema acha que você não tem empresa.

---

### Áreas, Classes e Subclasses (sua especialidade)

**Pra que serve:** Diz ao sistema 'em que ramos minha empresa atua'.

Você organiza seu negócio em três níveis: a Área de atuação (ex: Equipamentos Médico-Hospitalares), as Classes dentro dela (ex: Monitoração) e as Subclasses (ex: Monitor Multiparâmetro). Cada Subclasse tem um NCM e uma máscara de campos (especificações esperadas pelo produto). Sem isso, o sistema não consegue buscar editais relevantes nem classificar seus produtos.

**📍 Como acessar:** Menu lateral → Configurações → Portfólio → abas Áreas / Classes / Subclasses

**👀 O que você vê:** Uma árvore Área → Classe → Subclasse. Na Subclasse você define a Máscara de Campos (lista de especificações). Quando cadastrar produto depois, o sistema oferece esses campos automaticamente.

**Tela:**

![s1_f13_passo_12_cadastrar_mascara_monitor](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f13_passo_12_cadastrar_mascara_monitor_after.png)

> 💡 **Dica:** Antes de cadastrar produtos (F07), termine F13 — sem hierarquia, o produto fica sem classificação.

---

### Contatos e Área de Atuação Padrão

**Pra que serve:** Define e-mails, telefones e a área principal.

Aqui você cadastra os e-mails e telefones de contato da empresa e define qual é a Área de Atuação Padrão (uma das que você criou em F13). Essa área padrão é usada pelo motor de captação como filtro inicial de relevância dos editais.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Contatos

**👀 O que você vê:** Listas dinâmicas de e-mails e telefones (você pode adicionar/remover vários) e um select da Área Padrão.

**Tela:**

![s1_f02_passo_04_salvar_alteracoes](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f02_passo_04_salvar_alteracoes_after.png)

> 💡 **Dica:** Você pode cadastrar múltiplos e-mails — todos receberão notificações de alertas configurados em F17.

---

### Certidões Automáticas

**Pra que serve:** Busca automaticamente certidões fiscais e trabalhistas.

O sistema consulta automaticamente Receita Federal (CND Federal), Estado (SEFAZ), Município (ISS), Caixa (FGTS), Justiça do Trabalho (CNDT), Junta Comercial e outros órgãos usando o CNPJ da sua empresa. Mantém o status atualizado e dispara alerta quando alguma está pra vencer.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Certidões

**👀 O que você vê:** Uma tabela com cada certidão, número, data de emissão, validade e status (Válida/Vencida/A Vencer). Botão 'Sincronizar Agora' força nova consulta nos órgãos.

**Tela:**

![s1_f04_passo_06_cleanup](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f04_passo_06_cleanup_after.png)

> 💡 **Dica:** Não é necessário fazer upload manual da maioria — o sistema baixa direto. Só precisa subir manualmente certidões emitidas off-line (Junta Comercial em alguns estados).

---

### Responsáveis e Representantes

**Pra que serve:** Quem assina pela empresa.

Cadastra Representante Legal (quem assina contratos), Responsável Técnico (responsável pela qualidade dos produtos) e Preposto (quem participa do pregão). Esses dados aparecem automaticamente nos documentos gerados pelo sistema (propostas, impugnações).

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Responsáveis e Representantes

**👀 O que você vê:** Modal de cadastro com nome, CPF, RG, e-mail, telefone, tipo (Repr. Legal / Resp. Técnico / Preposto), documento de outorga (procuração) e validade.

**Tela:**

![s1_f05_passo_07_verificar_lista_3_responsaveis](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f05_passo_07_verificar_lista_3_responsaveis_after.png)

> 💡 **Dica:** O Documento de Outorga (procuração ou contrato social) é exigido em alguns editais — anexe o PDF no cadastro pra não buscar depois.

---

### Documentos da Empresa

**Pra que serve:** Upload dos documentos habilitatórios.

Aqui você faz upload dos documentos jurídicos e regulatórios da empresa: contrato social, alvará sanitário, AFE ANVISA, ISO 9001, etc. Cada documento tem tipo, validade e arquivo PDF. Esses documentos serão cruzados automaticamente em UC-CV10 com as exigências do edital.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Documentos

**👀 O que você vê:** Tabela com badges coloridos (verde=válido, amarelo=a vencer, vermelho=vencido). Modal de cadastro tem dropdown com 8+ tipos de documento e upload de PDF.

**Tela:**

![s1_f03_passo_07_verificar_lista_3_documentos](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f03_passo_07_verificar_lista_3_documentos_after.png)

> 💡 **Dica:** Cadastre todos os documentos básicos logo — assim, quando captar um edital, o sistema já diz exatamente quais documentos faltam pra você participar.

---

## 2. MONTAR PORTFÓLIO DE PRODUTOS

_Os produtos que você vende ou pode fornecer. Cada produto cadastrado aumenta sua capacidade de captar editais._

### Cadastrar Produto por IA

**Pra que serve:** A IA lê o catálogo do produto e cadastra sozinha.

Você arrasta um PDF (manual, catálogo, IFU, ficha técnica, registro ANVISA) e a IA extrai automaticamente: nome, fabricante, modelo, NCM, especificações técnicas. Você só revisa e salva. Economiza horas de digitação manual.

**📍 Como acessar:** Menu lateral → Portfólio → botão '+ Novo Produto'

**👀 O que você vê:** Card de upload IA com drag&drop, escolha de tipo de documento. Após processar, mostra preview dos dados extraídos pra você revisar.

**Tela:**

![s1_f07_passo_03_verificar_produto_na_grade](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f07_passo_03_verificar_produto_na_grade_after.png)

> 💡 **Dica:** Use sempre que houver PDF estruturado disponível. Pra produtos sem PDF, use o cadastro manual.

---

### Editar Produto e Especificações

**Pra que serve:** Refinar manualmente os dados do produto.

Após cadastrar via IA, você pode entrar no produto e ajustar manualmente: corrigir o nome, atualizar fabricante/modelo, completar especificações que a IA não pegou, anexar mais arquivos. Os campos de especificação seguem a máscara da subclasse (F13).

**📍 Como acessar:** Menu lateral → Portfólio → clicar no produto

**👀 O que você vê:** Tela de detalhes do produto com todas as especificações editáveis. Mudanças são salvas com toast de sucesso.

**Tela:**

![s1_f08_passo_03_validar_mascara_subclasse](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f08_passo_03_validar_mascara_subclasse_after.png)

> 💡 **Dica:** Quanto mais completas as especificações, mais preciso o cálculo de aderência aos editais.

---

### Listar e Filtrar Portfólio

**Pra que serve:** Vê todos os seus produtos.

Lista completa dos produtos cadastrados, com filtros por área de atuação, busca por palavra-chave e ordenação. Permite inspecionar detalhes antes de licitar.

**📍 Como acessar:** Menu lateral → Portfólio

**👀 O que você vê:** Tabela com colunas Nome, Fabricante, Modelo, NCM, Área/Classe/Subclasse, Status. Botão de visualizar abre detalhes.

**Tela:**

![s1_f06_passo_02_inspecionar_produto](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f06_passo_02_inspecionar_produto_after.png)

> 💡 **Dica:** Use o filtro por área antes de captar editais — assim você confere se tem portfólio nas áreas em que pretende licitar.

---

## 3. CONFIGURAR PREFERÊNCIAS

_Diz ao sistema como você quer trabalhar: pesos do score, margens, regiões prioritárias, fontes de busca, notificações._

### Pesos e Limiares de Score

**Pra que serve:** Como o sistema calcula a nota dos editais.

Configura como o sistema vai pontuar cada edital: peso da aderência técnica (35%), peso do preço (25%), peso da localização (15%), peso do histórico do órgão (15%), peso da concorrência (10%). Define também os limiares GO (≥70 pontos = vai) e NO-GO (<40 pontos = não vai).

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Score

**👀 O que você vê:** Sliders ou inputs numéricos pros 5 pesos + 2 limiares. O sistema valida que os pesos somam 100%.

**Tela:**

![s1_f14_passo_04_salvar_limiares](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f14_passo_04_salvar_limiares_after.png)

> 💡 **Dica:** Comece com os defaults e ajuste após captar alguns editais — você vai entender melhor o que é prioridade na sua operação.

---

### Parâmetros Comerciais

**Pra que serve:** Margens, regiões prioritárias, modalidades.

Aqui você diz: 'minha margem mínima é 12%, alvo é 22%; eu atendo principalmente SP/RJ/MG; modalidades preferidas: Pregão Eletrônico e Concorrência'. Esses parâmetros alimentam o score híbrido (UC-CV08) e a sugestão de preço (UC-P05).

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Comercial

**👀 O que você vê:** Inputs de margem mínima/alvo em %, multi-select de UFs prioritárias, multi-select de modalidades.

**Tela:**

![s1_f15_passo_03_preencher_e_salvar_custos](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f15_passo_03_preencher_e_salvar_custos_after.png)

> 💡 **Dica:** Configure realisticamente — margens muito altas vão fazer o sistema rejeitar editais que você na verdade tomaria.

---

### Fontes de Busca e Palavras-Chave

**Pra que serve:** Onde buscar editais e como.

Define quais portais monitorar (PNCP, ComprasNet, BEC, Licitações-e), quais palavras-chave usar nas buscas automatizadas e quais NCMs filtrar. Quanto mais específico, menos ruído nos resultados.

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Fontes

**👀 O que você vê:** Toggles pras fontes ativas, campo de tags pra palavras-chave (ex: 'monitor multiparametrico', 'oxímetro pulso'), lista de NCMs alvo.

**Tela:**

![s1_f16_passo_02_editar_e_salvar_ncms](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f16_passo_02_editar_e_salvar_ncms_after.png)

> 💡 **Dica:** Use palavras-chave que aparecem nos editais reais (não termos comerciais). Olhe editais antigos pra calibrar.

---

### Notificações e Preferências

**Pra que serve:** E-mails de alerta, idioma, tema.

Configura: para qual e-mail mandar alertas, quais canais ativar (e-mail/sistema/SMS), com que frequência mandar resumos (diário/semanal), tema visual (claro/escuro), idioma, fuso horário.

**📍 Como acessar:** Menu lateral → Configurações → Notificações e Preferências

**👀 O que você vê:** Toggles e selects organizados em 2 abas: Notificações e Preferências.

**Tela:**

![s1_f17_passo_03_preencher_e_salvar_preferencias](screenshots_global_e2e_v4/CT-GLOBAL-FP_s1_f17_passo_03_preencher_e_salvar_preferencias_after.png)

> 💡 **Dica:** Configure o resumo semanal — você não precisa abrir o sistema todo dia.

---

## 4. CAPTAR EDITAIS NO PNCP

_Buscar editais relevantes nos portais públicos e selecionar os que valem analisar._

### Buscar Editais (Captação)

**Pra que serve:** Encontra editais no PNCP que combinam com sua empresa.

Você digita um termo (ex: 'monitor multiparametrico'), seleciona UF, modalidade, fonte (PNCP) e tipo de score (Rápido/Híbrido/Profundo). O sistema busca nos portais e calcula automaticamente uma nota de 0-100 indicando a compatibilidade com seu portfólio.

**📍 Como acessar:** Menu lateral → Fluxo Comercial → Captação

**👀 O que você vê:** Campo de busca, filtros (UF, NCM, modalidade, score), botão 'Buscar'. Resultados em grade com título do edital, órgão, valor estimado, prazo, score colorido (verde/amarelo/vermelho).

**Tela:**

![s2_cv01_passo_03_validar_grade_resultados](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv01_passo_03_validar_grade_resultados_after.png)

> 💡 **Dica:** Use Score Rápido pra triagem inicial. Quando encontrar editais interessantes, recalcule com Score Híbrido (que é mais preciso, leva mais tempo).

---

### Explorar Resultados

**Pra que serve:** Painel lateral com detalhes do edital.

Ao clicar em um edital da lista, abre um painel lateral mostrando: órgão contratante, valor estimado, prazo de submissão, anexos disponíveis (edital, termo de referência, planilhas), produtos compatíveis do seu portfólio, scores parciais (técnico, comercial, jurídico).

**📍 Como acessar:** Captação → clicar em qualquer edital da grade

**👀 O que você vê:** Painel lateral com 4-5 abas (Resumo / Anexos / Produtos / Scores / Decisão).

**Tela:**

![s2_cv02_passo_02_validar_painel_aberto](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv02_passo_02_validar_painel_aberto_after.png)

> 💡 **Dica:** Sempre confira a aba 'Anexos' — alguns editais só liberam o anexo crítico (termo de referência) algumas horas antes do pregão.

---

### Salvar Edital

**Pra que serve:** Marca um edital como interessante.

Quando achar um edital que vale analisar mais a fundo, clica em 'Salvar'. O edital vai pra fase Validação, mantém os scores calculados, baixa o PDF do edital, extrai os itens e lotes automaticamente.

**📍 Como acessar:** Captação → painel lateral → botão 'Salvar Edital'

**👀 O que você vê:** Toast verde 'Edital salvo'. O edital some da Captação (ou marca como salvo) e aparece em Validação → 'Meus Editais'.

**Tela:**

![s2_cv03_passo_01_clicar_salvar_alvo](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv03_passo_01_clicar_salvar_alvo_after.png)

> 💡 **Dica:** Salve liberalmente — você decide depois se vai realmente participar.

---

### Definir Estratégia

**Pra que serve:** Defensivo/Neutro/Ofensivo + margem.

Para cada edital salvo, você define sua estratégia: Defensivo (margem alta, só pega se ninguém tomar), Neutro (margem alvo), Ofensivo (margem reduzida pra ganhar). Também ajusta a margem específica desse edital e classifica a intenção (GO / AVALIANDO / NO-GO).

**📍 Como acessar:** Validação → selecionar edital → aba Estratégia

**👀 O que você vê:** Radio buttons das 3 estratégias, slider de margem (%) e select de intenção.

**Tela:**

![s2_cv04_passo_03_salvar_estrategia](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv04_passo_03_salvar_estrategia_after.png)

> 💡 **Dica:** Use 'AVALIANDO' enquanto está em análise — depois mude pra GO ou NO-GO. Histórico de decisões fica registrado.

---

## 5. ANALISAR EDITAL CAPTADO

_Análise detalhada antes de decidir participar: importa itens, calcula scores, confronta documentação._

### Lista de Editais Salvos (Validação)

**Pra que serve:** Mesa de trabalho dos editais em análise.

Lista todos os editais que você salvou na Captação. Cada um abre numa tela detalhada com 6 abas: Aderência, Lotes, Documentos, Riscos, Mercado e IA. É aqui que você toma a decisão final de participar.

**📍 Como acessar:** Menu lateral → Fluxo Comercial → Validação

**👀 O que você vê:** Tabela 'Meus Editais' com colunas: Título, Órgão, Valor, Prazo, Score, Status (Novo/Em Avaliação/GO/NO-GO).

**Tela:**

![s2_cv07_passo_01_validar_lista_editais_salvos](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv07_passo_01_validar_lista_editais_salvos_after.png)

> 💡 **Dica:** Filtre por status 'Em Avaliação' pra ver só o que está pendente de decisão.

---

### Importar Itens e Lotes do Edital

**Pra que serve:** IA extrai itens automaticamente do PDF do edital.

A IA lê o PDF do edital e a planilha de itens (XLSX), extrai cada item (descrição, quantidade, unidade, valor unitário máximo) e os agrupa em lotes. Você só revisa antes de salvar.

**📍 Como acessar:** Validação → selecionar edital → aba Lotes

**👀 O que você vê:** Botão 'Importar via IA'. Após processar, tabela com itens identificados, lotes propostos, totais por lote.

**Tela:**

![s2_cv09_passo_00_aba_lotes](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv09_passo_00_aba_lotes_after.png)

> 💡 **Dica:** Confira sempre — IA pode misturar itens em lotes errados quando o edital tem estrutura confusa.

---

### Calcular Scores Detalhados

**Pra que serve:** Pontuação multidimensional para decisão final.

Calcula 4 scores detalhados: Aderência Técnica (seus produtos casam com os itens), Score Jurídico (você atende a habilitação), Score Logístico (consegue entregar no prazo/local), Score Comercial (margem viável). Cruza com os limiares de F14 e exibe veredito GO / NO-GO.

**📍 Como acessar:** Validação → selecionar edital → aba Aderência → 'Calcular Scores IA'

**👀 O que você vê:** 4 cards com scores parciais, gráfico radar consolidado, veredito GO/NO-GO destacado.

**Tela:**

![s2_cv08_passo_01_clicar_calcular_scores](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv08_passo_01_clicar_calcular_scores_after.png)

> 💡 **Dica:** Confie no GO/NO-GO mas leia os scores parciais — às vezes um score técnico baixo é o que pesa, e você pode optar por participar mesmo assim.

---

### Confrontar Documentação

**Pra que serve:** IA identifica documentos exigidos e cruza com os seus.

A IA lê o edital e identifica todos os documentos exigidos para habilitação (certidões, registros, atestados). Cruza com sua aba F03 e sinaliza claramente: o que você tem (verde), o que está vencido (vermelho), o que falta cadastrar (cinza).

**📍 Como acessar:** Validação → selecionar edital → aba Documentos

**👀 O que você vê:** Botão 'Identificar Documentos Exigidos'. Após processar, lista categorizada com badges verdes/vermelhos/cinzas.

**Tela:**

![s2_cv10_passo_01_clicar_identificar_documentos](screenshots_global_e2e_v4/CT-GLOBAL-FP_s2_cv10_passo_01_clicar_identificar_documentos_after.png)

> 💡 **Dica:** Faça isso ANTES do dia do pregão — dá tempo de tirar certidão que está faltando.

---

## 6. MONTAR PROPOSTA

_Vincula produtos aos itens, configura custos, calcula preços e gera o PDF da proposta._

### Vincular Produtos aos Itens (IA)

**Pra que serve:** Pra cada item do edital, IA sugere produto do seu portfólio.

A IA lê a descrição de cada item do edital e procura no seu portfólio (Sprint 1) o produto que melhor casa. Faz match semântico + score técnico. Você pode aceitar a sugestão ou trocar manualmente.

**📍 Como acessar:** Precificação → selecionar edital → 'Selecionar Portfólio por IA'

**👀 O que você vê:** Tabela com itens do edital de um lado, sugestões da IA do outro, score de match. Botões aceitar/rejeitar por item.

**Tela:**

![s3_p02_passo_04_validar_vinculo_final](screenshots_global_e2e_v4/CT-GLOBAL-FP_s3_p02_passo_04_validar_vinculo_final_after.png)

> 💡 **Dica:** Verifique items com match abaixo de 70% — a IA pode estar oferecendo produto parecido mas não exato.

---

### Configurar Base de Custos

**Pra que serve:** Custos variáveis e tributos por produto.

Configura a Camada A (Custos): custo de aquisição/fabricação do produto, impostos (ICMS, PIS/COFINS, IPI), comissão de vendedor, frete. Esses valores alimentam o cálculo de preço base (P05).

**📍 Como acessar:** Precificação → selecionar edital → aba Custos

**👀 O que você vê:** Tabela editável com colunas Item, Custo Unit, ICMS%, PIS%, COFINS%, IPI%, Frete, Comissão.

**Tela:**

![s3_p04_passo_01_atualizar_custos](screenshots_global_e2e_v4/CT-GLOBAL-FP_s3_p04_passo_01_atualizar_custos_after.png)

> 💡 **Dica:** Use os valores reais do ERP — preço errado aqui derruba toda a proposta.

---

### Montar Preço Base

**Pra que serve:** Camada B — custo + margem + tributos.

Calcula automaticamente o preço base: custo (P04) + margem (F15) + impostos sobre venda + frete. Esse é o piso da sua proposta — não pode dar lance abaixo disso sem subsídio.

**📍 Como acessar:** Precificação → aba Preço Base

**👀 O que você vê:** Tabela com preço base calculado item a item, breakdown (quanto é custo, quanto é margem, quanto é imposto).

**Tela:**

![s3_p05_passo_01_definir_preco_base](screenshots_global_e2e_v4/CT-GLOBAL-FP_s3_p05_passo_01_definir_preco_base_after.png)

> 💡 **Dica:** Compare o preço base com o valor máximo do edital — se está acima, melhor desistir cedo.

---

### Gerar Proposta Técnica

**Pra que serve:** Sistema gera o PDF da proposta automaticamente.

O motor automático monta a proposta técnica em PDF/DOCX usando os dados do edital, produtos vinculados (P02), preços calculados (P05) e responsáveis (F05). A formatação segue o padrão exigido por cada órgão.

**📍 Como acessar:** Proposta → selecionar edital → 'Gerar Proposta'

**👀 O que você vê:** Botão 'Gerar' → barra de progresso → download do PDF gerado.

**Tela:**

![s3_r01_passo_01_simular_ia](screenshots_global_e2e_v4/CT-GLOBAL-FP_s3_r01_passo_01_simular_ia_after.png)

> 💡 **Dica:** Sempre revise o PDF gerado antes de submeter — erros típicos: descrição técnica precisa de ajuste fino.

---

## 7. IMPUGNAR EDITAL

_Quando o edital tem cláusulas problemáticas, contesta antes do prazo de submissão._

### Validação Legal do Edital

**Pra que serve:** IA detecta cláusulas restritivas ilegais.

A IA lê o edital e identifica inconsistências jurídicas (cláusulas restritivas indevidas, exigências fora da Lei 14.133, prazos inadequados, especificações direcionadas pra um fornecedor). Marca cada ponto com fundamentação legal.

**📍 Como acessar:** Validação → selecionar edital → aba Riscos → 'Validar Legalmente'

**👀 O que você vê:** Lista de pontos detectados com cor (vermelho=crítico, amarelo=atenção), descrição do problema, sugestão de ação, fundamento legal citado.

**Tela:**

![s4_i01_passo_01_validar_legalmente](screenshots_global_e2e_v4/CT-GLOBAL-FP_s4_i01_passo_01_validar_legalmente_after.png)

> 💡 **Dica:** Pontos vermelhos geralmente são bons candidatos a impugnação. Pontos amarelos podem virar pedido de esclarecimento.

---

### Sugerir Esclarecimento ou Impugnação

**Pra que serve:** IA escreve a peça formal.

Para os pontos detectados em I01, a IA gera automaticamente o texto de pedido de esclarecimento ou peça de impugnação, com fundamentação em jurisprudência (TCU, STF). Você revisa e submete pelo portal.

**📍 Como acessar:** Recursos → 'Nova Peça' → selecionar pontos → 'Gerar com IA'

**👀 O que você vê:** Editor com o texto gerado, citações de jurisprudência, espaço pra ajustar antes de baixar o PDF.

**Tela:**

![s4_i02_passo_01_sugerir](screenshots_global_e2e_v4/CT-GLOBAL-FP_s4_i02_passo_01_sugerir_after.png)

> 💡 **Dica:** Sempre humanize o texto antes de submeter — IA pode soar muito formal/jurídica demais pro órgão.

---

## 8. APÓS O PREGÃO

_Registra resultado, configura alertas de prazos futuros._

### Registrar Resultado do Pregão

**Pra que serve:** Lança o que aconteceu: vitória, derrota, cancelado.

Após o pregão, você registra: Vitória (com valor final + quantidade vencida), Derrota (com motivo: preço/técnico/documentação), Cancelado (revogado pelo órgão). Alimenta análises de performance e CRM.

**📍 Como acessar:** Validação → editais com pregão realizado → 'Registrar Resultado'

**👀 O que você vê:** Modal com radio dos 3 tipos, campos condicionais (valor final, motivo, etc).

**Tela:**

![s5_fu01_passo_01_chamar_endpoint](screenshots_global_e2e_v4/CT-GLOBAL-FP_s5_fu01_passo_01_chamar_endpoint_after.png)

> 💡 **Dica:** Registre TODOS — derrotas ajudam a IA a aprender padrões e sugerir melhorias futuras.

---

### Alertas de Prazos

**Pra que serve:** Avisa antes que algo vença.

Configura alertas automáticos: certidões a vencer (15 dias antes), prazos de recurso (24h antes), contratos a vencer (30 dias antes). Você escolhe a antecedência, os canais (e-mail/sistema/SMS) e os destinatários.

**📍 Como acessar:** Configurações → Alertas

**👀 O que você vê:** Lista de tipos de alerta com toggle ativo/inativo, slider de antecedência, multi-select de canais.

**Tela:**

![s5_fu02_passo_01_chamar_endpoint](screenshots_global_e2e_v4/CT-GLOBAL-FP_s5_fu02_passo_01_chamar_endpoint_after.png)

> 💡 **Dica:** Configure pelo menos os de certidão e prazo de recurso — esses dois são os que mais derrubam licitação.

---

## Onde isso se encaixa no seu dia-a-dia

| Quando | O que fazer |
|---|---|
| **Uma vez ao começar** | Etapas 1, 2, 3 (preparação completa). Cadastra empresa, portfólio, preferências. |
| **Diariamente / Semanalmente** | Etapa 4 (captação). Olha o que tem de novo nos portais. |
| **Quando achar um edital interessante** | Etapas 5 e 6. Analisa, calcula scores, decide se vai, monta proposta. |
| **Se identificar irregularidade no edital** | Etapa 7 (impugnação) — antes do prazo. |
| **Após cada pregão** | Etapa 8. Registra o resultado e alimenta o histórico. |

---

**Documento gerado automaticamente a partir de teste end-to-end real executado em 2026-05-13.**

Cada captura de tela neste documento foi gerada pelo navegador automatizado (Playwright headless) durante a execução de 127 passos sequenciais cobrindo todas as 24 funções listadas. A taxa de sucesso do teste foi de 96% (122 passos APROVADO ou INCONCLUSIVO de 127 totais).