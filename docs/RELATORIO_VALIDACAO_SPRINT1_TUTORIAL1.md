# Relatório de Validação — Tutorial Sprint 1 (Conjunto 1)

**Empresa:** CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda.
**CNPJ:** 43.712.232/0001-85 — São Paulo/SP
**Data de execução:** 2026-04-06
**Executor:** Playwright (automação) — usuário `valida1@valida.com.br`
**Ambiente:** localhost:5175 (frontend) / localhost:5007 (backend)
**Resultado geral:** ✅ **17/17 testes passaram** (7.5 minutos)
**Screenshots:** `runtime/screenshots/tutorial-sprint1-1/` (100 capturas)

---

## Sumário de Resultados

| # | UC | Descrição | Tempo | Status |
|---|-----|-----------|-------|--------|
| 1 | UC-F01 | Cadastro Principal da Empresa | 21.2s | ✅ PASS |
| 2 | UC-F02 | Contatos, Emails e Área Padrão | 25.6s | ✅ PASS |
| 3 | UC-F03 | Upload de Documentos da Empresa | 37.6s | ✅ PASS |
| 4 | UC-F04 | Certidões Automáticas e Manuais | 60.0s | ✅ PASS |
| 5 | UC-F05 | Cadastro de Responsáveis | 29.0s | ✅ PASS |
| 6 | UC-F14 | Configurar Pesos e Limiares do Score | 26.0s | ✅ PASS |
| 7 | UC-F15 | Parâmetros Comerciais | 33.6s | ✅ PASS |
| 8 | UC-F16 | Fontes de Busca e Palavras-chave | 29.8s | ✅ PASS |
| 9 | UC-F17 | Notificações e Preferências | 29.1s | ✅ PASS |
| 10 | UC-F07 | Cadastro de Produto por IA | 21.4s | ✅ PASS |
| 11 | UC-F06 | Listar e Filtrar Produtos | 20.0s | ✅ PASS |
| 12 | UC-F08 | Editar Produto Existente | 16.7s | ✅ PASS |
| 13 | UC-F09 | Reprocessar Metadados por IA | 16.8s | ✅ PASS |
| 14 | UC-F10 | ANVISA e Busca Web | 24.2s | ✅ PASS |
| 15 | UC-F11 | Verificar Completude | 16.7s | ✅ PASS |
| 16 | UC-F12 | Metadados de Captação | 17.4s | ✅ PASS |
| 17 | UC-F13 | Classificação Hierárquica | 21.5s | ✅ PASS |

---

## Detalhamento por Caso de Uso

### UC-F01: Cadastro Principal da Empresa
**Página:** EmpresaPage (`/app/empresa`) — Seção: Informações Cadastrais

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login com valida1@valida.com.br / 123456 → tela seleção de empresa → clicar CH Hospitalar | Dashboard exibido | — |
| 2 | Navegar para Empresa via sidebar | Página Empresa carregada com seções | F01_01_pagina_empresa.png |
| 3 | Preencher Razão Social: "CH Hospitalar Comércio de Equipamentos..." | Campo preenchido | F01_02_razao_social.png |
| 4 | Preencher CNPJ: 43.712.232/0001-85, Nome Fantasia, IE | Campos preenchidos | F01_03_cnpj.png |
| 5 | Preencher Website, Instagram, LinkedIn, Facebook | Campos de presença digital preenchidos | F01_04_redes_sociais.png |
| 6 | Preencher Endereço, CEP: 02452-001, Cidade: São Paulo, UF: SP | Endereço completo preenchido | F01_05_endereco.png |
| 7 | Clicar "Salvar Alterações" | Dados persistidos | F01_06_salvo.png |

**Resultado:** ✅ Todos os campos cadastrais preenchidos e salvos com sucesso.

**Evidências Visuais:**

**Passo 2 — Página Empresa carregada:**
![F01_01](../runtime/screenshots/tutorial-sprint1-1/F01_01_pagina_empresa.png)

**Passo 3 — Razão Social preenchida:**
![F01_02](../runtime/screenshots/tutorial-sprint1-1/F01_02_razao_social.png)

**Passo 4 — CNPJ e demais campos preenchidos:**
![F01_03](../runtime/screenshots/tutorial-sprint1-1/F01_03_cnpj.png)

**Passo 5 — Redes sociais preenchidas:**
![F01_04](../runtime/screenshots/tutorial-sprint1-1/F01_04_redes_sociais.png)

**Passo 6 — Endereço preenchido:**
![F01_05](../runtime/screenshots/tutorial-sprint1-1/F01_05_endereco.png)

**Passo 7 — Dados salvos:**
![F01_06](../runtime/screenshots/tutorial-sprint1-1/F01_06_salvo.png)

---

### UC-F02: Contatos, Emails e Área Padrão
**Página:** EmpresaPage — Seção: Contatos

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Empresa | Página carregada | — |
| 2 | Scroll para seção de contatos | Seção de contatos visível | F02_01_secao_contatos.png |
| 3 | Adicionar 3 emails: licitacoes@, comercial@, fiscal@ | Emails listados na seção | F02_02_emails_adicionados.png |
| 4 | Adicionar 2 telefones: (11) 2934-5600 e (11) 98723-4100 | Telefones listados | F02_03_telefones_adicionados.png |
| 5 | Selecionar Área de Atuação Padrão | Área selecionada | F02_04_area_padrao.png |
| 6 | Clicar "Salvar Alterações" | Dados de contato persistidos | F02_05_salvo.png |

**Resultado:** ✅ Emails, telefones e área padrão cadastrados com sucesso.

**Evidências Visuais:**

**Passo 2 — Seção de contatos:**
![F02_01](../runtime/screenshots/tutorial-sprint1-1/F02_01_secao_contatos.png)

**Passo 3 — Emails adicionados:**
![F02_02](../runtime/screenshots/tutorial-sprint1-1/F02_02_emails_adicionados.png)

**Passo 4 — Telefones adicionados:**
![F02_03](../runtime/screenshots/tutorial-sprint1-1/F02_03_telefones_adicionados.png)

**Passo 5 — Área padrão selecionada:**
![F02_04](../runtime/screenshots/tutorial-sprint1-1/F02_04_area_padrao.png)

**Passo 6 — Contatos salvos:**
![F02_05](../runtime/screenshots/tutorial-sprint1-1/F02_05_salvo.png)

---

### UC-F03: Upload de Documentos da Empresa
**Página:** EmpresaPage — Seção: Documentos da Empresa

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Empresa | Página carregada | — |
| 2 | Scroll para seção de documentos | Seção documentos visível | F03_01_secao_documentos.png |
| 3 | Clicar "Upload Documento" — Documento 1 | Modal de upload aberto | F03_02_modal_doc1.png |
| 4 | Selecionar tipo, anexar PDF, preencher validade 2026-12-31 | Formulário preenchido | F03_03_formulario_doc1.png |
| 5 | Clicar "Enviar" | Doc 1 cadastrado | F03_04_doc1_salvo.png |
| 6 | Clicar "Upload Documento" — Documento 2 | Modal aberto | F03_02_modal_doc2.png |
| 7 | Selecionar tipo, anexar PDF, sem validade | Formulário preenchido | F03_03_formulario_doc2.png |
| 8 | Clicar "Enviar" | Doc 2 cadastrado | F03_04_doc2_salvo.png |
| 9 | Clicar "Upload Documento" — Documento 3 | Modal aberto | F03_02_modal_doc3.png |
| 10 | Selecionar tipo, anexar PDF, validade 2026-04-30 | Formulário preenchido | F03_03_formulario_doc3.png |
| 11 | Clicar "Enviar" | Doc 3 cadastrado | F03_04_doc3_salvo.png |
| 12 | Verificar lista com 3 documentos e status | Lista exibindo documentos com badges | F03_05_lista_documentos.png |

**Resultado:** ✅ 3 documentos uploadados com tipos e validades distintos; badges de status verificados.

**Evidências Visuais:**

**Passo 2 — Seção de documentos:**
![F03_01](../runtime/screenshots/tutorial-sprint1-1/F03_01_secao_documentos.png)

**Passo 3 — Modal doc 1:**
![F03_02a](../runtime/screenshots/tutorial-sprint1-1/F03_02_modal_doc1.png)

**Passo 4 — Formulário doc 1:**
![F03_03a](../runtime/screenshots/tutorial-sprint1-1/F03_03_formulario_doc1.png)

**Passo 5 — Doc 1 salvo:**
![F03_04a](../runtime/screenshots/tutorial-sprint1-1/F03_04_doc1_salvo.png)

**Passo 6 — Modal doc 2:**
![F03_02b](../runtime/screenshots/tutorial-sprint1-1/F03_02_modal_doc2.png)

**Passo 8 — Doc 2 salvo:**
![F03_04b](../runtime/screenshots/tutorial-sprint1-1/F03_04_doc2_salvo.png)

**Passo 9 — Modal doc 3:**
![F03_02c](../runtime/screenshots/tutorial-sprint1-1/F03_02_modal_doc3.png)

**Passo 11 — Doc 3 salvo:**
![F03_04c](../runtime/screenshots/tutorial-sprint1-1/F03_04_doc3_salvo.png)

**Passo 12 — Lista de documentos:**
![F03_05](../runtime/screenshots/tutorial-sprint1-1/F03_05_lista_documentos.png)

---

### UC-F04: Certidões Automáticas e Manuais
**Página:** EmpresaPage — Seção: Certidões Automáticas

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Empresa | Página carregada | — |
| 2 | Scroll para seção Certidões | Seção visível com CNPJ 43.712.232/0001-85 | F04_01_secao_certidoes.png |
| 3 | Selecionar frequência "Semanal" | Frequência definida | F04_02_frequencia_semanal.png |
| 4 | Clicar "Buscar Certidões" | Busca iniciada nos portais | F04_03_busca_em_andamento.png |
| 5 | Aguardar conclusão da busca | Lista de certidões atualizada | F04_04_busca_concluida.png |
| 6 | Clicar botão de upload manual | Modal de upload de certidão aberto | F04_05_modal_upload_certidao.png |
| 7 | Anexar PDF, preencher validade 2026-12-31 e número | Formulário preenchido | F04_06_upload_preenchido.png |
| 8 | Clicar "Enviar" | Certidão manual cadastrada | F04_07_upload_salvo.png |
| 9 | Clicar botão Editar na certidão | Modal de detalhe aberto | F04_08_modal_editar_certidao.png |
| 10 | Alterar status, validade e número | Campos editados | F04_09_edicao_preenchida.png |
| 11 | Clicar "Salvar" | Certidão atualizada | F04_10_edicao_salva.png |
| 12 | Verificar lista final | Certidões com status corretos | F04_11_resultado_final.png |

**Resultado:** ✅ Busca automática disparada; upload manual e edição de certidão funcionando.

**Evidências Visuais:**

**Passo 2 — Seção certidões:**
![F04_01](../runtime/screenshots/tutorial-sprint1-1/F04_01_secao_certidoes.png)

**Passo 3 — Frequência semanal:**
![F04_02](../runtime/screenshots/tutorial-sprint1-1/F04_02_frequencia_semanal.png)

**Passo 4 — Busca em andamento:**
![F04_03](../runtime/screenshots/tutorial-sprint1-1/F04_03_busca_em_andamento.png)

**Passo 5 — Busca concluída:**
![F04_04](../runtime/screenshots/tutorial-sprint1-1/F04_04_busca_concluida.png)

**Passo 6 — Modal upload certidão:**
![F04_05](../runtime/screenshots/tutorial-sprint1-1/F04_05_modal_upload_certidao.png)

**Passo 7 — Upload preenchido:**
![F04_06](../runtime/screenshots/tutorial-sprint1-1/F04_06_upload_preenchido.png)

**Passo 8 — Upload salvo:**
![F04_07](../runtime/screenshots/tutorial-sprint1-1/F04_07_upload_salvo.png)

**Passo 9 — Modal editar certidão:**
![F04_08](../runtime/screenshots/tutorial-sprint1-1/F04_08_modal_editar_certidao.png)

**Passo 10 — Edição preenchida:**
![F04_09](../runtime/screenshots/tutorial-sprint1-1/F04_09_edicao_preenchida.png)

**Passo 11 — Edição salva:**
![F04_10](../runtime/screenshots/tutorial-sprint1-1/F04_10_edicao_salva.png)

**Passo 12 — Resultado final:**
![F04_11](../runtime/screenshots/tutorial-sprint1-1/F04_11_resultado_final.png)

---

### UC-F05: Cadastro de Responsáveis
**Página:** EmpresaPage — Seção: Responsáveis

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Empresa | Página carregada | — |
| 2 | Scroll para seção Responsáveis | Seção visível | F05_01_secao_responsaveis.png |
| 3 | Clicar "Adicionar" — Responsável 1 | Modal aberto | F05_02_modal_resp1.png |
| 4 | Preencher: Diego Ricardo Munoz, Sócio-Administrador, Representante Legal | Campos preenchidos | F05_03_resp1_preenchido.png |
| 5 | Clicar "Salvar" | Resp. 1 cadastrado | F05_04_resp1_salvo.png |
| 6 | Clicar "Adicionar" — Responsável 2 | Modal aberto | F05_02_modal_resp2.png |
| 7 | Preencher: Carla Regina Souza, Gerente de Licitações, Preposto | Campos preenchidos | F05_03_resp2_preenchido.png |
| 8 | Clicar "Salvar" | Resp. 2 cadastrado | F05_04_resp2_salvo.png |
| 9 | Clicar "Adicionar" — Responsável 3 | Modal aberto | F05_02_modal_resp3.png |
| 10 | Preencher: Dr. Paulo Roberto Menezes, Engenheiro Biomédico, Técnico | Campos preenchidos | F05_03_resp3_preenchido.png |
| 11 | Clicar "Salvar" | Resp. 3 cadastrado | F05_04_resp3_salvo.png |
| 12 | Verificar lista com 3 responsáveis | Lista completa com tipos distintos | F05_05_lista_responsaveis.png |

**Resultado:** ✅ 3 responsáveis cadastrados com tipos distintos (Representante Legal, Preposto, Técnico).

**Evidências Visuais:**

**Passo 2 — Seção responsáveis:**
![F05_01](../runtime/screenshots/tutorial-sprint1-1/F05_01_secao_responsaveis.png)

**Passo 3 — Modal resp 1:**
![F05_02a](../runtime/screenshots/tutorial-sprint1-1/F05_02_modal_resp1.png)

**Passo 4 — Resp 1 preenchido:**
![F05_03a](../runtime/screenshots/tutorial-sprint1-1/F05_03_resp1_preenchido.png)

**Passo 5 — Resp 1 salvo:**
![F05_04a](../runtime/screenshots/tutorial-sprint1-1/F05_04_resp1_salvo.png)

**Passo 6 — Modal resp 2:**
![F05_02b](../runtime/screenshots/tutorial-sprint1-1/F05_02_modal_resp2.png)

**Passo 8 — Resp 2 salvo:**
![F05_04b](../runtime/screenshots/tutorial-sprint1-1/F05_04_resp2_salvo.png)

**Passo 9 — Modal resp 3:**
![F05_02c](../runtime/screenshots/tutorial-sprint1-1/F05_02_modal_resp3.png)

**Passo 11 — Resp 3 salvo:**
![F05_04c](../runtime/screenshots/tutorial-sprint1-1/F05_04_resp3_salvo.png)

**Passo 12 — Lista de responsáveis:**
![F05_05](../runtime/screenshots/tutorial-sprint1-1/F05_05_lista_responsaveis.png)

---

### UC-F14: Configurar Pesos e Limiares do Score
**Página:** ParametrizaçõesPage — Aba: Score

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Parametrizações | Página carregada | — |
| 2 | Clicar aba "Score" | Aba de score exibida | F14_01_aba_score.png |
| 3 | Preencher pesos (0.25/0.20/0.10/0.15/0.15/0.15) | Indicador de soma = 1.00 (verde) | F14_02_pesos_preenchidos.png |
| 4 | Verificar soma = 1.00 | Soma exibida como válida | F14_03_soma_verificada.png |
| 5 | Clicar "Salvar Pesos" | Pesos persistidos | F14_04_pesos_salvos.png |
| 6 | Preencher limiares GO/NO-GO (70/40/65/35/80/50) | Limiares preenchidos | F14_05_limiares_preenchidos.png |
| 7 | Clicar "Salvar Limiares" | Limiares persistidos | F14_06_limiares_salvos.png |

**Resultado:** ✅ Pesos somando 1.00 salvos; limiares GO/NO-GO configurados.

**Evidências Visuais:**

**Passo 2 — Aba Score:**
![F14_01](../runtime/screenshots/tutorial-sprint1-1/F14_01_aba_score.png)

**Passo 3 — Pesos preenchidos:**
![F14_02](../runtime/screenshots/tutorial-sprint1-1/F14_02_pesos_preenchidos.png)

**Passo 4 — Soma verificada:**
![F14_03](../runtime/screenshots/tutorial-sprint1-1/F14_03_soma_verificada.png)

**Passo 5 — Pesos salvos:**
![F14_04](../runtime/screenshots/tutorial-sprint1-1/F14_04_pesos_salvos.png)

**Passo 6 — Limiares preenchidos:**
![F14_05](../runtime/screenshots/tutorial-sprint1-1/F14_05_limiares_preenchidos.png)

**Passo 7 — Limiares salvos:**
![F14_06](../runtime/screenshots/tutorial-sprint1-1/F14_06_limiares_salvos.png)

---

### UC-F15: Parâmetros Comerciais
**Página:** ParametrizaçõesPage — Aba: Comercial

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Parametrizações | Página carregada | — |
| 2 | Clicar aba "Comercial" | Aba exibida com seções de região, prazo, mercado | F15_01_aba_comercial.png |
| 3 | Selecionar estados: SP, RJ, MG, RS, PR, SC, DF, GO, BA, PE | Estados selecionados | F15_02_estados_selecionados.png |
| 4 | Salvar seleção de estados | Estados persistidos | F15_03_estados_salvos.png |
| 5 | Definir prazo máximo: 30 dias e salvar | Prazo salvo | F15_04_prazo_salvo.png |
| 6 | Preencher TAM/SAM/SOM e salvar | Dados de mercado persistidos | F15_05_mercado_salvo.png |
| 7 | Preencher Markup 28%, Custos R$85.000, Frete R$350 e salvar | Custos salvos | F15_06_custos_salvos.png |
| 8 | Confirmar modalidades e salvar | Modalidades persistidas | F15_07_modalidades_salvas.png |

**Resultado:** ✅ Região, prazo, mercado, custos e modalidades configurados.

**Evidências Visuais:**

**Passo 2 — Aba Comercial:**
![F15_01](../runtime/screenshots/tutorial-sprint1-1/F15_01_aba_comercial.png)

**Passo 3 — Estados selecionados:**
![F15_02](../runtime/screenshots/tutorial-sprint1-1/F15_02_estados_selecionados.png)

**Passo 4 — Estados salvos:**
![F15_03](../runtime/screenshots/tutorial-sprint1-1/F15_03_estados_salvos.png)

**Passo 5 — Prazo salvo:**
![F15_04](../runtime/screenshots/tutorial-sprint1-1/F15_04_prazo_salvo.png)

**Passo 6 — Mercado salvo:**
![F15_05](../runtime/screenshots/tutorial-sprint1-1/F15_05_mercado_salvo.png)

**Passo 7 — Custos salvos:**
![F15_06](../runtime/screenshots/tutorial-sprint1-1/F15_06_custos_salvos.png)

**Passo 8 — Modalidades salvas:**
![F15_07](../runtime/screenshots/tutorial-sprint1-1/F15_07_modalidades_salvas.png)

---

### UC-F16: Fontes de Busca e Palavras-chave
**Página:** ParametrizaçõesPage — Aba: Fontes

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Parametrizações | Página carregada | — |
| 2 | Clicar aba "Fontes" | Fontes de editais listadas | F16_01_aba_fontes.png |
| 3 | Desativar BLL (última fonte) | BLL aparece como inativa | F16_02_bll_desativado.png |
| 4 | Reativar BLL | BLL reativada | F16_03_bll_reativado.png |
| 5 | Editar palavras-chave e salvar | Palavras-chave atualizadas | F16_04_palavras_preenchidas.png |
| 6 | Confirmar salvamento de palavras-chave | Palavras-chave persistidas | F16_05_palavras_salvas.png |
| 7 | Adicionar NCMs e preencher | NCMs inseridos | F16_06_ncms_preenchidos.png |
| 8 | Salvar NCMs | NCMs persistidos | F16_07_ncms_salvos.png |

**Resultado:** ✅ Toggle de fontes, palavras-chave e NCMs funcionando.

**Evidências Visuais:**

**Passo 2 — Aba Fontes:**
![F16_01](../runtime/screenshots/tutorial-sprint1-1/F16_01_aba_fontes.png)

**Passo 3 — BLL desativado:**
![F16_02](../runtime/screenshots/tutorial-sprint1-1/F16_02_bll_desativado.png)

**Passo 4 — BLL reativado:**
![F16_03](../runtime/screenshots/tutorial-sprint1-1/F16_03_bll_reativado.png)

**Passo 5 — Palavras preenchidas:**
![F16_04](../runtime/screenshots/tutorial-sprint1-1/F16_04_palavras_preenchidas.png)

**Passo 6 — Palavras salvas:**
![F16_05](../runtime/screenshots/tutorial-sprint1-1/F16_05_palavras_salvas.png)

**Passo 7 — NCMs preenchidos:**
![F16_06](../runtime/screenshots/tutorial-sprint1-1/F16_06_ncms_preenchidos.png)

**Passo 8 — NCMs salvos:**
![F16_07](../runtime/screenshots/tutorial-sprint1-1/F16_07_ncms_salvos.png)

---

### UC-F17: Notificações e Preferências
**Página:** ParametrizaçõesPage — Abas: Notificações e Preferências

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Parametrizações | Página carregada | — |
| 2 | Clicar aba "Notificações" | Aba de notificações exibida | F17_01_aba_notificacoes.png |
| 3 | Preencher email: licitacoes@chhospitalar.com.br, freq: Diário | Campos preenchidos | F17_02_notificacoes_preenchidas.png |
| 4 | Salvar notificações | Configurações persistidas | F17_03_notificacoes_salvas.png |
| 5 | Clicar aba "Preferências" | Aba de preferências exibida | F17_04_aba_preferencias.png |
| 6 | Selecionar Tema Escuro | Tema configurado | F17_05_preferencias_preenchidas.png |
| 7 | Salvar preferências | Preferências persistidas | F17_06_preferencias_salvas.png |

**Resultado:** ✅ Email de notificação, frequência e preferências de tema salvos.

**Evidências Visuais:**

**Passo 2 — Aba Notificações:**
![F17_01](../runtime/screenshots/tutorial-sprint1-1/F17_01_aba_notificacoes.png)

**Passo 3 — Notificações preenchidas:**
![F17_02](../runtime/screenshots/tutorial-sprint1-1/F17_02_notificacoes_preenchidas.png)

**Passo 4 — Notificações salvas:**
![F17_03](../runtime/screenshots/tutorial-sprint1-1/F17_03_notificacoes_salvas.png)

**Passo 5 — Aba Preferências:**
![F17_04](../runtime/screenshots/tutorial-sprint1-1/F17_04_aba_preferencias.png)

**Passo 6 — Preferências preenchidas:**
![F17_05](../runtime/screenshots/tutorial-sprint1-1/F17_05_preferencias_preenchidas.png)

**Passo 7 — Preferências salvas:**
![F17_06](../runtime/screenshots/tutorial-sprint1-1/F17_06_preferencias_salvas.png)

---

### UC-F07: Cadastro de Produto por IA
**Página:** PortfolioPage — Aba: Cadastro por IA

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Página carregada | — |
| 2 | Clicar aba "Cadastro por IA" | Formulário de cadastro por IA exibido | F07_01_aba_cadastro_ia.png |
| 3 | Selecionar tipo "Manual Técnico", anexar PDF | Formulário preenchido com arquivo | F07_02_formulario_preenchido.png |
| 4 | Clicar "Processar com IA" | IA processa o documento | F07_05_final.png |

**Resultado:** ✅ Produto cadastrado via IA a partir de manual técnico.

**Evidências Visuais:**

**Passo 2 — Aba Cadastro por IA:**
![F07_01](../runtime/screenshots/tutorial-sprint1-1/F07_01_aba_cadastro_ia.png)

**Passo 3 — Formulário preenchido:**
![F07_02](../runtime/screenshots/tutorial-sprint1-1/F07_02_formulario_preenchido.png)

**Passo 4 — Resultado IA:**
![F07_05](../runtime/screenshots/tutorial-sprint1-1/F07_05_final.png)

---

### UC-F06: Listar e Filtrar Produtos
**Página:** PortfolioPage — Aba: Meus Produtos

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | F06_01_lista_produtos.png |
| 2 | Filtrar por Área | Produtos filtrados pela área selecionada | F06_02_filtro_area.png |
| 3 | Buscar por texto "monitor" | Produtos correspondentes exibidos | F06_03_busca_texto.png |
| 4 | Clicar Visualizar no primeiro produto | Detalhes do produto exibidos | F06_04_detalhe_produto.png |

**Resultado:** ✅ Listagem, filtros e visualização de detalhe funcionando.

**Evidências Visuais:**

**Passo 1 — Lista de produtos:**
![F06_01](../runtime/screenshots/tutorial-sprint1-1/F06_01_lista_produtos.png)

**Passo 2 — Filtro por área:**
![F06_02](../runtime/screenshots/tutorial-sprint1-1/F06_02_filtro_area.png)

**Passo 3 — Busca por texto:**
![F06_03](../runtime/screenshots/tutorial-sprint1-1/F06_03_busca_texto.png)

**Passo 4 — Detalhe do produto:**
![F06_04](../runtime/screenshots/tutorial-sprint1-1/F06_04_detalhe_produto.png)

---

### UC-F08: Editar Produto Existente
**Página:** PortfolioPage — Modal de Edição

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | — |
| 2 | Clicar Editar no primeiro produto | Modal de edição aberto | F08_01_modal_editar.png |
| 3 | Alterar Nome: "Mindray iMEC10 Plus", Fabricante: "Mindray Bio-Medical Electronics", Modelo: "iMEC10 Plus" | Campos editados | F08_02_campos_editados.png |
| 4 | Scroll para especificações técnicas | Seção de especificações visível | F08_03_especificacoes.png |
| 5 | Clicar "Salvar" | Produto atualizado | F08_04_produto_salvo.png |

**Resultado:** ✅ Produto editado com novos dados e especificações atualizadas.

**Evidências Visuais:**

**Passo 2 — Modal editar:**
![F08_01](../runtime/screenshots/tutorial-sprint1-1/F08_01_modal_editar.png)

**Passo 3 — Campos editados:**
![F08_02](../runtime/screenshots/tutorial-sprint1-1/F08_02_campos_editados.png)

**Passo 4 — Especificações:**
![F08_03](../runtime/screenshots/tutorial-sprint1-1/F08_03_especificacoes.png)

**Passo 5 — Produto salvo:**
![F08_04](../runtime/screenshots/tutorial-sprint1-1/F08_04_produto_salvo.png)

---

### UC-F09: Reprocessar Metadados por IA
**Página:** PortfolioPage — Botão Reprocessar IA

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | F09_01_lista_produtos.png |
| 2 | Clicar "Reprocessar IA" no primeiro produto | IA reinicia processamento | F09_02_reprocessando.png |
| 3 | Aguardar conclusão | Produto reprocessado | F09_03_reprocessado.png |

**Resultado:** ✅ Botão reprocessar IA acionado e processamento concluído.

**Evidências Visuais:**

**Passo 1 — Lista de produtos:**
![F09_01](../runtime/screenshots/tutorial-sprint1-1/F09_01_lista_produtos.png)

**Passo 2 — Reprocessando:**
![F09_02](../runtime/screenshots/tutorial-sprint1-1/F09_02_reprocessando.png)

**Passo 3 — Reprocessado:**
![F09_03](../runtime/screenshots/tutorial-sprint1-1/F09_03_reprocessado.png)

---

### UC-F10: ANVISA e Busca Web
**Página:** PortfolioPage — Modais ANVISA e Busca Web

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | — |
| 2 | Clicar "Buscar ANVISA" | Modal de consulta ANVISA aberto | F10_01_modal_anvisa.png |
| 3 | Inserir registro 80262090001 e buscar via IA | Resultado da consulta exibido | F10_02_resultado_anvisa.png |
| 4 | Fechar modal e clicar "Buscar na Web" | Modal de busca web aberto | F10_03_modal_web.png |
| 5 | Inserir nome e fabricante, buscar via IA | Resultado da busca web exibido | F10_04_resultado_web.png |

**Resultado:** ✅ Consulta ANVISA e busca web por produto funcionando.

**Evidências Visuais:**

**Passo 2 — Modal ANVISA:**
![F10_01](../runtime/screenshots/tutorial-sprint1-1/F10_01_modal_anvisa.png)

**Passo 3 — Resultado ANVISA:**
![F10_02](../runtime/screenshots/tutorial-sprint1-1/F10_02_resultado_anvisa.png)

**Passo 4 — Modal busca web:**
![F10_03](../runtime/screenshots/tutorial-sprint1-1/F10_03_modal_web.png)

**Passo 5 — Resultado busca web:**
![F10_04](../runtime/screenshots/tutorial-sprint1-1/F10_04_resultado_web.png)

---

### UC-F11: Verificar Completude
**Página:** PortfolioPage — Modal de Completude

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | — |
| 2 | Clicar "Verificar Completude" no produto | Modal com scores de completude aberto | F11_01_modal_completude.png |
| 3 | Verificar percentuais Geral, Dados Básicos, Especificações | Scores exibidos em badges coloridos | F11_02_scores.png |

**Resultado:** ✅ Modal de completude exibe percentuais por dimensão.

**Evidências Visuais:**

**Passo 2 — Modal completude:**
![F11_01](../runtime/screenshots/tutorial-sprint1-1/F11_01_modal_completude.png)

**Passo 3 — Scores:**
![F11_02](../runtime/screenshots/tutorial-sprint1-1/F11_02_scores.png)

---

### UC-F12: Metadados de Captação
**Página:** PortfolioPage — Detalhe do Produto

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Lista de produtos exibida | — |
| 2 | Clicar Visualizar no produto | Detalhe do produto aberto | F12_01_detalhe_produto.png |
| 3 | Expandir seção Metadados de Captação | Metadados exibidos (CATMAT, termos de busca) | F12_02_metadados_expandidos.png |
| 4 | Clicar "Reprocessar Metadados" | Metadados reprocessados pela IA | F12_03_metadados_reprocessados.png |

**Resultado:** ✅ Metadados de captação exibidos e reprocessamento acionado.

**Evidências Visuais:**

**Passo 2 — Detalhe do produto:**
![F12_01](../runtime/screenshots/tutorial-sprint1-1/F12_01_detalhe_produto.png)

**Passo 3 — Metadados expandidos:**
![F12_02](../runtime/screenshots/tutorial-sprint1-1/F12_02_metadados_expandidos.png)

**Passo 4 — Metadados reprocessados:**
![F12_03](../runtime/screenshots/tutorial-sprint1-1/F12_03_metadados_reprocessados.png)

---

### UC-F13: Classificação Hierárquica
**Página:** PortfolioPage — Aba: Classificação

| Passo | Ação do Ator | Resposta Esperada do Sistema | Screenshot |
|-------|-------------|------------------------------|------------|
| 1 | Login e navegar para Portfolio | Página carregada | — |
| 2 | Clicar aba "Classificação" | Árvore de classificação exibida | F13_01_aba_classificacao.png |
| 3 | Expandir primeira Área | Classes da área exibidas | F13_02_area_expandida.png |
| 4 | Expandir primeira Classe | Subclasses exibidas | F13_03_classe_expandida.png |
| 5 | Visualizar Funil de Monitoramento | Funil com estatísticas exibido | F13_04_funil_monitoramento.png |

**Resultado:** ✅ Árvore hierárquica navegável; funil de monitoramento exibido.

**Evidências Visuais:**

**Passo 2 — Aba Classificação:**
![F13_01](../runtime/screenshots/tutorial-sprint1-1/F13_01_aba_classificacao.png)

**Passo 3 — Área expandida:**
![F13_02](../runtime/screenshots/tutorial-sprint1-1/F13_02_area_expandida.png)

**Passo 4 — Classe expandida:**
![F13_03](../runtime/screenshots/tutorial-sprint1-1/F13_03_classe_expandida.png)

**Passo 5 — Funil de monitoramento:**
![F13_04](../runtime/screenshots/tutorial-sprint1-1/F13_04_funil_monitoramento.png)

---

## Resumo Executivo

### Métricas

| Métrica | Valor |
|---------|-------|
| Total de testes | 17 |
| Testes aprovados | 17 |
| Testes reprovados | 0 |
| Taxa de aprovação | 100% |
| Duração total | 7 min 30 seg |
| Screenshots capturadas | 100 |
| Empresa testada | CH Hospitalar (CNPJ real: 43.712.232/0001-85) |

### Observações

1. **Dados reais**: a empresa utilizada nos testes (CH Hospitalar) possui CNPJ real e ativo na Receita Federal desde 30/09/2021.
2. **Login multi-empresa**: o sistema trata corretamente o fluxo de seleção de empresa para usuários com múltiplas empresas vinculadas.
3. **Upload de documentos**: o fluxo de upload via modal funciona para os 3 documentos; o botão "Enviar" habilita corretamente após seleção de arquivo.
4. **Certidões automáticas**: a busca automática é disparada para o CNPJ correto da empresa selecionada.
5. **Cadastro por IA**: o processamento de manuais técnicos via IA extrai dados e cadastra produtos no portfólio.
6. **Permissões**: o usuário `valida1@valida.com.br` (superusuário) tem acesso total à empresa CH Hospitalar com papel admin. O superusuário visualiza tela de seleção de empresa após login.

### Recomendações

- Manter a seleção de empresa persistida no token JWT para evitar comportamentos inesperados entre testes
- O timeout do UC-F04 (busca de certidões) pode variar conforme disponibilidade dos portais externos — considerar stub para ambiente de CI
- O botão "Enviar" no modal de upload requer que o arquivo seja selecionado primeiro — comportamento correto

---

*Relatório gerado automaticamente em 2026-04-03 — Playwright v1.x — CH Hospitalar CNPJ 43.712.232/0001-85*
