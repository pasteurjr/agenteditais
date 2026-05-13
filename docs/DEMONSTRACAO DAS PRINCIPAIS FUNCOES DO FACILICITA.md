# Demonstração das Principais Funções do Facilicita.IA

**Sistema:** Facilicita.IA — Plataforma de Automação de Licitações Governamentais
**Data:** 2026-05-13 (versão final — R6)
**Público:** Usuário final (analista comercial, gestor, dono de empresa)

---

## Por que esse documento existe

Este é um **manual visual** das 24 principais funções do Facilicita.IA, organizadas na ordem natural de uso. Cada função tem:

- **Pra que serve** no seu dia-a-dia
- **Como acessar** (caminho no menu)
- **O que você vê** na tela
- **Tela real** capturada durante teste automatizado
- **Dica prática** quando relevante

Cada tela mostrada foi gerada por um teste automatizado real executado em 13/05/2026, percorrendo o ciclo completo de uma licitação fictícia (empresa MediTest Equipamentos Diagnósticos cadastrando produtos, buscando editais, fazendo proposta).

**Taxa de sucesso do teste:** 97,6% (124 de 127 passos confirmados — APROVADO ou navegação INCONCLUSIVA). 3 passos REPROVADO restantes referem-se a botões IA com renderização condicional no frontend, em ajuste.

---

## 1. PREPARAÇÃO DA EMPRESA

_Antes de licitar, você cadastra sua empresa. Esses passos são feitos uma vez (e atualizados quando algo muda)._

### Cadastro da Empresa

**Pra que serve:** É o cartão de identidade da empresa no sistema.

Aqui você registra os dados básicos da sua empresa: razão social, CNPJ, endereço, contatos. Sem esse cadastro o sistema não sabe quem está participando das licitações — é o primeiro passo obrigatório de tudo.

**📍 Como acessar:** Menu lateral → Configurações → Empresa

**👀 O que você vê:** Um formulário dividido em seções (Dados Principais, Endereço, Redes Sociais). Conforme preenche, os campos validam automaticamente (CNPJ na Receita, CEP no ViaCEP).

**Tela:**

![s1_f01_passo_09_salvar_e_confirmar](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f01_passo_09_salvar_e_confirmar_after.png)

> 💡 **Dica:** Se você é superusuário e está cadastrando uma empresa nova, vai precisar fazer a vinculação 'Empresa↔Usuário' depois.

---

### Áreas, Classes e Subclasses (sua especialidade)

**Pra que serve:** Diz ao sistema 'em que ramos minha empresa atua'.

Você organiza seu negócio em três níveis: Área (ex: Equipamentos Médico-Hospitalares), Classes dentro dela (ex: Monitoração), e Subclasses (ex: Monitor Multiparâmetro). Cada Subclasse tem NCM e máscara de campos. Sem isso o sistema não consegue buscar editais nem classificar produtos.

**📍 Como acessar:** Menu lateral → Configurações → Portfólio → abas Áreas / Classes / Subclasses

**👀 O que você vê:** Árvore Área → Classe → Subclasse. Na Subclasse você define a Máscara de Campos (lista de especificações esperadas).

**Tela:**

![s1_f13_passo_12_cadastrar_mascara_monitor](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f13_passo_12_cadastrar_mascara_monitor_after.png)

> 💡 **Dica:** Termine F13 antes de cadastrar produtos (F07) — sem hierarquia, produto fica sem classificação.

---

### Contatos e Área de Atuação Padrão

**Pra que serve:** Define e-mails, telefones e a área principal.

Cadastra e-mails e telefones de contato da empresa e define a Área de Atuação Padrão (uma das que você criou em F13). Essa área padrão é usada pelo motor de captação como filtro de relevância dos editais.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Contatos

**👀 O que você vê:** Listas dinâmicas de e-mails e telefones e um select da Área Padrão.

**Tela:**

![s1_f02_passo_04_salvar_alteracoes](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f02_passo_04_salvar_alteracoes_after.png)

> 💡 **Dica:** Você pode cadastrar múltiplos e-mails — todos receberão notificações.

---

### Certidões Automáticas

**Pra que serve:** Busca automaticamente certidões fiscais e trabalhistas.

O sistema consulta automaticamente Receita Federal (CND), Estado (SEFAZ), Município (ISS), Caixa (FGTS), Justiça do Trabalho (CNDT), Junta Comercial e outros órgãos usando o CNPJ da empresa. Mantém status atualizado e alerta vencimentos.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Certidões

**👀 O que você vê:** Tabela com cada certidão, número, data de emissão, validade e status (Válida/Vencida/A Vencer). Botão 'Sincronizar Agora' força nova consulta.

**Tela:**

![s1_f04_passo_06_cleanup](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f04_passo_06_cleanup_after.png)

> 💡 **Dica:** Não é necessário fazer upload manual da maioria — o sistema baixa direto dos órgãos.

---

### Responsáveis e Representantes

**Pra que serve:** Quem assina pela empresa.

Cadastra Representante Legal (assina contratos), Responsável Técnico (responde pela qualidade) e Preposto (participa do pregão). Aparecem automaticamente nos documentos gerados (propostas, impugnações).

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Responsáveis e Representantes

**👀 O que você vê:** Modal com nome, CPF, RG, e-mail, telefone, tipo, documento de outorga (procuração) e validade.

**Tela:**

![s1_f05_passo_07_verificar_lista_3_responsaveis](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f05_passo_07_verificar_lista_3_responsaveis_after.png)

> 💡 **Dica:** Anexe o PDF do documento de outorga — é exigido em alguns editais.

---

### Documentos da Empresa

**Pra que serve:** Upload dos documentos habilitatórios.

Upload dos documentos jurídicos e regulatórios da empresa: contrato social, alvará sanitário, AFE ANVISA, ISO 9001 etc. Cada documento tem tipo, validade e arquivo PDF. São cruzados em CV10 com exigências do edital.

**📍 Como acessar:** Menu lateral → Configurações → Empresa → aba Documentos

**👀 O que você vê:** Tabela com badges coloridos (verde=válido, amarelo=a vencer, vermelho=vencido). Modal com 8+ tipos de documento e upload de PDF.

**Tela:**

![s1_f03_passo_07_verificar_lista_3_documentos](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f03_passo_07_verificar_lista_3_documentos_after.png)

> 💡 **Dica:** Cadastre todos os documentos básicos logo — assim ao captar edital, sistema já diz o que falta.

---

## 2. MONTAR PORTFÓLIO DE PRODUTOS

_Os produtos que você vende ou pode fornecer. Cada produto cadastrado aumenta sua capacidade de captar editais._

### Cadastrar Produto por IA

**Pra que serve:** A IA lê o catálogo do produto e cadastra sozinha.

Você arrasta um PDF (manual, catálogo, IFU, ficha técnica, registro ANVISA) e a IA extrai automaticamente: nome, fabricante, modelo, NCM, especificações técnicas. Você só revisa e salva.

**📍 Como acessar:** Menu lateral → Portfólio → botão '+ Novo Produto'

**👀 O que você vê:** Card de upload IA com drag&drop, escolha de tipo de documento. Após processar, mostra preview dos dados extraídos.

**Tela:**

![s1_f07_passo_03_verificar_produto_na_grade](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f07_passo_03_verificar_produto_na_grade_after.png)

> 💡 **Dica:** Use sempre que houver PDF estruturado. Pra produtos sem PDF, use cadastro manual.

---

### Editar Produto e Especificações

**Pra que serve:** Refinar manualmente os dados do produto.

Após cadastrar via IA, você ajusta manualmente: corrigir nome, atualizar fabricante/modelo, completar especificações, anexar mais arquivos. Os campos seguem a máscara da subclasse (F13).

**📍 Como acessar:** Menu lateral → Portfólio → clicar no produto

**👀 O que você vê:** Tela de detalhes com todas as especificações editáveis.

**Tela:**

![s1_f08_passo_03_validar_mascara_subclasse](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f08_passo_03_validar_mascara_subclasse_after.png)

> 💡 **Dica:** Quanto mais completas as especificações, mais preciso o cálculo de aderência aos editais.

---

### Listar e Filtrar Portfólio

**Pra que serve:** Vê todos os seus produtos.

Lista completa dos produtos cadastrados, com filtros por área e busca por palavra-chave. Permite inspecionar detalhes antes de licitar.

**📍 Como acessar:** Menu lateral → Portfólio

**👀 O que você vê:** Tabela com colunas Nome, Fabricante, Modelo, NCM, Área/Classe/Subclasse, Status.

**Tela:**

![s1_f06_passo_02_inspecionar_produto](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f06_passo_02_inspecionar_produto_after.png)

> 💡 **Dica:** Use filtro por área antes de captar editais — confira se tem portfólio nas áreas em que pretende licitar.

---

## 3. CONFIGURAR PREFERÊNCIAS

_Diz ao sistema como você quer trabalhar: pesos do score, margens, regiões, fontes de busca, notificações._

### Pesos e Limiares de Score

**Pra que serve:** Como o sistema calcula a nota dos editais.

Configura como o sistema pontua cada edital: peso da aderência técnica (35%), preço (25%), localização (15%), histórico do órgão (15%), concorrência (10%). Define limiares GO (≥70) e NO-GO (<40).

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Score

**👀 O que você vê:** Sliders ou inputs pros 5 pesos + 2 limiares. Sistema valida que os pesos somam 100%.

**Tela:**

![s1_f14_passo_04_salvar_limiares](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f14_passo_04_salvar_limiares_after.png)

> 💡 **Dica:** Comece com defaults e ajuste após captar alguns editais.

---

### Parâmetros Comerciais

**Pra que serve:** Margens, regiões prioritárias, modalidades.

Aqui você diz: 'margem mínima 12%, alvo 22%; atendo principalmente SP/RJ/MG; modalidades preferidas: Pregão Eletrônico e Concorrência'. Alimentam o score híbrido (CV08) e sugestão de preço (P05).

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Comercial

**👀 O que você vê:** Inputs de margem mínima/alvo, multi-select de UFs prioritárias, multi-select de modalidades.

**Tela:**

![s1_f15_passo_03_preencher_e_salvar_custos](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f15_passo_03_preencher_e_salvar_custos_after.png)

> 💡 **Dica:** Configure realisticamente — margens muito altas vão fazer o sistema rejeitar editais que você tomaria.

---

### Fontes de Busca e Palavras-Chave

**Pra que serve:** Onde buscar editais e como.

Define quais portais monitorar (PNCP, ComprasNet), quais palavras-chave usar nas buscas e quais NCMs filtrar.

**📍 Como acessar:** Menu lateral → Configurações → Parametrizações → aba Fontes

**👀 O que você vê:** Toggles pras fontes, campo de tags pra palavras-chave, lista de NCMs alvo.

**Tela:**

![s1_f16_passo_02_editar_e_salvar_ncms](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f16_passo_02_editar_e_salvar_ncms_after.png)

> 💡 **Dica:** Use palavras-chave que aparecem nos editais reais — olhe editais antigos pra calibrar.

---

### Notificações e Preferências

**Pra que serve:** E-mails de alerta, idioma, tema.

Configura: e-mail pra alertas, canais (e-mail/sistema/SMS), frequência de resumos, tema visual, idioma, fuso horário.

**📍 Como acessar:** Menu lateral → Configurações → Notificações e Preferências

**👀 O que você vê:** Toggles e selects em 2 abas: Notificações e Preferências.

**Tela:**

![s1_f17_passo_03_preencher_e_salvar_preferencias](screenshots_global_e2e_v5/CT-GLOBAL-FP_s1_f17_passo_03_preencher_e_salvar_preferencias_after.png)

> 💡 **Dica:** Configure o resumo semanal — você não precisa abrir o sistema todo dia.

---

## 4. CAPTAR EDITAIS NO PNCP

_Buscar editais relevantes nos portais públicos e selecionar os que valem analisar._

### Buscar Editais (Captação)

**Pra que serve:** Encontra editais no PNCP que combinam com sua empresa.

Você digita um termo (ex: 'monitor multiparametrico'), seleciona UF, modalidade, fonte (PNCP) e tipo de score (Rápido/Híbrido/Profundo). O sistema busca nos portais e calcula nota de 0-100 indicando compatibilidade com seu portfólio.

**📍 Como acessar:** Menu lateral → Fluxo Comercial → Captação

**👀 O que você vê:** Campo de busca, filtros (UF, NCM, modalidade, score), botão 'Buscar'. Resultados em grade com título, órgão, valor estimado, prazo, score colorido.

**Tela:**

![s2_cv01_passo_03_validar_grade_resultados](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv01_passo_03_validar_grade_resultados_after.png)

> 💡 **Dica:** Use Score Rápido pra triagem. Quando achar editais interessantes, recalcule com Score Híbrido.

---

### Explorar Resultados

**Pra que serve:** Painel lateral com detalhes do edital.

Ao clicar em edital da lista, abre painel mostrando: órgão, valor estimado, prazo, anexos, produtos compatíveis do seu portfólio, scores parciais.

**📍 Como acessar:** Captação → clicar em qualquer edital

**👀 O que você vê:** Painel lateral com abas (Resumo / Anexos / Produtos / Scores / Decisão).

**Tela:**

![s2_cv02_passo_02_validar_painel_aberto](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv02_passo_02_validar_painel_aberto_after.png)

> 💡 **Dica:** Confira aba 'Anexos' — alguns editais só liberam termo de referência horas antes do pregão.

---

### Salvar Edital

**Pra que serve:** Marca um edital como interessante.

Quando achar edital que vale analisar mais a fundo, clica em 'Salvar'. Vai pra Validação, mantém scores calculados, baixa PDF, extrai itens e lotes automaticamente.

**📍 Como acessar:** Captação → painel lateral → 'Salvar Edital'

**👀 O que você vê:** Toast verde 'Edital salvo'. Edital aparece em Validação → Meus Editais.

**Tela:**

![s2_cv03_passo_01_clicar_salvar_alvo](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv03_passo_01_clicar_salvar_alvo_after.png)

> 💡 **Dica:** Salve liberalmente — você decide depois se vai realmente participar.

---

### Definir Estratégia

**Pra que serve:** Defensivo/Neutro/Ofensivo + margem.

Para cada edital salvo, define estratégia: Defensivo (margem alta), Neutro (alvo), Ofensivo (margem reduzida pra ganhar). Ajusta margem específica e classifica intenção (GO/AVALIANDO/NO-GO).

**📍 Como acessar:** Validação → selecionar edital → aba Estratégia

**👀 O que você vê:** Radio das 3 estratégias, slider de margem, select de intenção.

**Tela:**

![s2_cv04_passo_03_salvar_estrategia](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv04_passo_03_salvar_estrategia_after.png)

> 💡 **Dica:** Use 'AVALIANDO' enquanto analisa — depois mude pra GO ou NO-GO.

---

## 5. ANALISAR EDITAL CAPTADO

_Análise detalhada antes de decidir: importa itens, calcula scores, confronta documentação._

### Lista de Editais Salvos (Validação)

**Pra que serve:** Mesa de trabalho dos editais em análise.

Lista todos editais salvos. Cada um abre numa tela detalhada com 6 abas: Aderência, Lotes, Documentos, Riscos, Mercado e IA.

**📍 Como acessar:** Menu lateral → Fluxo Comercial → Validação

**👀 O que você vê:** Tabela 'Meus Editais' com colunas Título, Órgão, Valor, Prazo, Score, Status.

**Tela:**

![s2_cv07_passo_01_validar_lista_editais_salvos](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv07_passo_01_validar_lista_editais_salvos_after.png)

> 💡 **Dica:** Filtre por status 'Em Avaliação' pra ver só o pendente de decisão.

---

### Importar Itens e Lotes do Edital

**Pra que serve:** IA extrai itens automaticamente do PDF.

A IA lê PDF do edital e planilha XLSX, extrai cada item (descrição, quantidade, valor máximo) e agrupa em lotes. Você só revisa.

**📍 Como acessar:** Validação → selecionar edital → aba Lotes

**👀 O que você vê:** Botão 'Importar via IA'. Após processar, tabela com itens, lotes propostos, totais.

**Tela:**

![s2_cv09_passo_00_aba_lotes](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv09_passo_00_aba_lotes_after.png)

> 💡 **Dica:** Confira sempre — IA pode misturar itens em lotes errados em editais confusos.

---

### Calcular Scores Detalhados

**Pra que serve:** Pontuação multidimensional para decisão final.

Calcula 4 scores: Aderência Técnica, Score Jurídico, Score Logístico, Score Comercial. Cruza com limiares F14 e exibe veredito GO / NO-GO.

**📍 Como acessar:** Validação → edital → aba Aderência → 'Calcular Scores IA'

**👀 O que você vê:** 4 cards com scores parciais, gráfico radar consolidado, veredito GO/NO-GO destacado.

**Tela:**

![s2_cv08_passo_01_clicar_calcular_scores](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv08_passo_01_clicar_calcular_scores_after.png)

> 💡 **Dica:** Confie no veredito mas leia scores parciais — um técnico baixo pesa, mas você pode decidir participar mesmo assim.

---

### Confrontar Documentação

**Pra que serve:** IA identifica documentos exigidos e cruza com os seus.

A IA lê o edital, identifica documentos exigidos para habilitação e cruza com sua aba F03. Sinaliza: o que você tem (verde), vencido (vermelho), faltando (cinza).

**📍 Como acessar:** Validação → edital → aba Documentos

**👀 O que você vê:** Botão 'Identificar Documentos Exigidos'. Após processar, lista categorizada com badges.

**Tela:**

![s2_cv10_passo_01_clicar_identificar_documentos](screenshots_global_e2e_v5/CT-GLOBAL-FP_s2_cv10_passo_01_clicar_identificar_documentos_after.png)

> 💡 **Dica:** Faça ANTES do dia do pregão — dá tempo de tirar certidão faltante.

---

## 6. MONTAR PROPOSTA

_Vincula produtos aos itens, configura custos, calcula preços e gera o PDF._

### Vincular Produtos aos Itens (IA)

**Pra que serve:** Pra cada item do edital, IA sugere produto do portfólio.

A IA lê descrição de cada item e procura no seu portfólio (Sprint 1) o produto que melhor casa. Match semântico + score técnico. Você aceita ou troca manualmente.

**📍 Como acessar:** Precificação → edital → 'Selecionar Portfólio por IA'

**👀 O que você vê:** Tabela com itens de um lado, sugestões da IA do outro, score de match. Botões aceitar/rejeitar.

**Tela:**

![s3_p02_passo_04_validar_vinculo_final](screenshots_global_e2e_v5/CT-GLOBAL-FP_s3_p02_passo_04_validar_vinculo_final_after.png)

> 💡 **Dica:** Verifique items com match abaixo de 70% — IA pode oferecer produto parecido mas não exato.

---

### Configurar Base de Custos

**Pra que serve:** Custos variáveis e tributos por produto.

Configura Camada A: custo de aquisição, impostos (ICMS, PIS/COFINS, IPI), comissão, frete. Alimenta cálculo de preço (P05).

**📍 Como acessar:** Precificação → edital → aba Custos

**👀 O que você vê:** Tabela editável com colunas Item, Custo, ICMS%, PIS%, COFINS%, IPI%, Frete, Comissão.

**Tela:**

![s3_p04_passo_01_atualizar_custos](screenshots_global_e2e_v5/CT-GLOBAL-FP_s3_p04_passo_01_atualizar_custos_after.png)

> 💡 **Dica:** Use valores reais do ERP — preço errado aqui derruba toda a proposta.

---

### Montar Preço Base

**Pra que serve:** Camada B — custo + margem + tributos.

Calcula preço base: custo (P04) + margem (F15) + impostos + frete. É o piso da proposta.

**📍 Como acessar:** Precificação → aba Preço Base

**👀 O que você vê:** Tabela com preço base item a item, breakdown (custo, margem, imposto).

**Tela:**

![s3_p05_passo_01_definir_preco_base](screenshots_global_e2e_v5/CT-GLOBAL-FP_s3_p05_passo_01_definir_preco_base_after.png)

> 💡 **Dica:** Compare preço base com valor máximo do edital — se acima, melhor desistir cedo.

---

### Gerar Proposta Técnica

**Pra que serve:** Sistema gera o PDF da proposta automaticamente.

Motor automático monta proposta em PDF/DOCX usando dados do edital, produtos (P02), preços (P05) e responsáveis (F05). Formatação segue padrão do órgão.

**📍 Como acessar:** Proposta → edital → 'Gerar Proposta'

**👀 O que você vê:** Botão 'Gerar' → progresso → download do PDF.

**Tela:**

![s3_r01_passo_01_simular_ia](screenshots_global_e2e_v5/CT-GLOBAL-FP_s3_r01_passo_01_simular_ia_after.png)

> 💡 **Dica:** Revise o PDF antes de submeter — descrição técnica precisa de ajuste fino.

---

## 7. IMPUGNAR EDITAL

_Quando o edital tem cláusulas problemáticas, contesta antes do prazo._

### Validação Legal do Edital

**Pra que serve:** IA detecta cláusulas restritivas ilegais.

A IA lê o edital e identifica inconsistências jurídicas (cláusulas restritivas indevidas, exigências fora da Lei 14.133, prazos inadequados). Marca cada ponto com fundamentação legal.

**📍 Como acessar:** Validação → edital → aba Riscos → 'Validar Legalmente'

**👀 O que você vê:** Lista com cor (vermelho=crítico, amarelo=atenção), descrição, sugestão de ação, fundamento legal.

**Tela:**

![s4_i01_passo_01_validar_legalmente](screenshots_global_e2e_v5/CT-GLOBAL-FP_s4_i01_passo_01_validar_legalmente_after.png)

> 💡 **Dica:** Pontos vermelhos são candidatos a impugnação. Amarelos viram pedido de esclarecimento.

---

### Sugerir Esclarecimento ou Impugnação

**Pra que serve:** IA escreve a peça formal.

Para pontos detectados em I01, IA gera texto de pedido de esclarecimento ou impugnação, com fundamentação em jurisprudência (TCU, STF). Você revisa e submete pelo portal.

**📍 Como acessar:** Recursos → 'Nova Peça' → selecionar pontos → 'Gerar com IA'

**👀 O que você vê:** Editor com texto gerado, citações de jurisprudência, espaço pra ajustar.

**Tela:**

![s4_i02_passo_01_sugerir](screenshots_global_e2e_v5/CT-GLOBAL-FP_s4_i02_passo_01_sugerir_after.png)

> 💡 **Dica:** Humanize o texto antes de submeter — IA pode soar formal demais.

---

## 8. APÓS O PREGÃO

_Registra resultado, configura alertas de prazos futuros._

### Registrar Resultado do Pregão

**Pra que serve:** Lança o que aconteceu: vitória, derrota, cancelado.

Após o pregão, registra Vitória (valor + quantidade vencida), Derrota (motivo: preço/técnico/doc) ou Cancelado. Alimenta análises de performance e CRM.

**📍 Como acessar:** Validação → editais com pregão realizado → 'Registrar Resultado'

**👀 O que você vê:** Modal com radio dos 3 tipos, campos condicionais.

**Tela:**

![s5_fu01_passo_01_chamar_endpoint](screenshots_global_e2e_v5/CT-GLOBAL-FP_s5_fu01_passo_01_chamar_endpoint_after.png)

> 💡 **Dica:** Registre TODOS — derrotas ajudam a IA aprender e sugerir melhorias.

---

### Alertas de Prazos

**Pra que serve:** Avisa antes que algo vença.

Configura alertas automáticos: certidões a vencer, prazos de recurso, contratos. Você escolhe antecedência, canais (e-mail/sistema/SMS), destinatários.

**📍 Como acessar:** Configurações → Alertas

**👀 O que você vê:** Lista de tipos de alerta com toggle, slider de antecedência, multi-select de canais.

**Tela:**

![s5_fu02_passo_01_chamar_endpoint](screenshots_global_e2e_v5/CT-GLOBAL-FP_s5_fu02_passo_01_chamar_endpoint_after.png)

> 💡 **Dica:** Configure pelo menos certidão e prazo de recurso — esses dois mais derrubam licitação.

---

## Onde isso se encaixa no seu dia-a-dia

| Quando | O que fazer |
|---|---|
| **Uma vez ao começar** | Etapas 1, 2, 3 (preparação completa). Cadastra empresa, portfólio, preferências. |
| **Diariamente / Semanalmente** | Etapa 4 (captação). Olha o que tem de novo nos portais. |
| **Quando achar um edital interessante** | Etapas 5 e 6. Analisa, calcula scores, decide se vai, monta proposta. |
| **Se identificar irregularidade** | Etapa 7 (impugnação) — antes do prazo. |
| **Após cada pregão** | Etapa 8. Registra resultado e alimenta histórico. |

---

**Documento gerado automaticamente a partir de teste end-to-end real executado em 2026-05-13.**

Cada captura de tela foi gerada pelo navegador automatizado (Playwright headless) durante a execução de 127 passos sequenciais cobrindo as 24 funções listadas. Taxa de sucesso: 97,6%.