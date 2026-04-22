# CASOS DE TESTE PARA VALIDACAO — SPRINT 4 — CONJUNTO 2

**Data:** 21/04/2026
**Empresa:** RP3X Comercio e Representacoes Ltda.
**Usuario:** valida2@valida.com.br / Senha: 123456
**Base:** tutorialsprint4-2.md + CASOS DE USO RECURSOS E IMPUGNACOES V5.md
**UCs cobertos:** UC-I01 a UC-I05, UC-RE01 a UC-RE06, UC-FU01 a UC-FU03

---

## Credenciais e Pre-requisitos

| Campo | Valor |
|---|---|
| URL | `http://pasteurjr.servehttp.com:5179` |
| Usuario | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuario |
| Empresa | RP3X Comercio e Representacoes Ltda. |
| Edital principal | Edital de reagentes hematologicos (salvo Sprint 2) |
| Edital secundario | Edital de kit diagnostico laboratorial (salvo Sprint 2) |
| Produtos | Kit de Reagentes para Hemograma Completo Sysmex XN (Sysmex), Kit para Glicose Enzimatica Wiener BioGlic-100 Automacao (Wiener Lab Group) |

---

# FASE 1 — IMPUGNACAO E ESCLARECIMENTOS

---

## UC-I01 — Validacao Legal do Edital

### CT-I01-01 — Analise legal do edital de reagentes (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I01-01 |
| **Descricao** | Verificar que o sistema analisa o edital de reagentes hematologicos e identifica inconsistencias especificas |
| **Pre-condicoes** | Usuario autenticado como valida2@valida.com.br, empresa RP3X ativa, edital de reagentes hematologicos salvo na Sprint 2 |
| **Acoes do ator e dados de entrada** | 1. No menu lateral, clicar em "Impugnacao". 2. Na aba "Validacao Legal", selecionar edital de reagentes hematologicos. 3. Clicar "Analisar Edital". 4. Aguardar processamento (30-60 segundos). |
| **Saida esperada** | Tabela de inconsistencias com pelo menos 3 itens. Inconsistencias especificas de reagentes: restricao de plataforma Sysmex XN-1000 (Art. 41 par.2 — ALTA), AFE ANVISA desproporcional (Art. 67 par.1 — MEDIA), shelf-life 24 meses excessivo (Art. 75 — ALTA), comodato vinculado (Art. 40 par.5 — ALTA), prazo de amostra cadeia fria (Art. 17 par.3 — MEDIA). Badges de gravidade coloridos. |
| **Tipo** | Positivo |

### CT-I01-02 — Verificar inconsistencias de platform lock-in
| Campo | Valor |
|---|---|
| **ID** | CT-I01-02 |
| **Descricao** | Verificar que a analise identifica restricao de plataforma/marca como ALTA |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Na tabela de inconsistencias, localizar item sobre "compatibilidade exclusiva com analisador Sysmex XN-1000". |
| **Saida esperada** | Inconsistencia de platform lock-in presente. Gravidade ALTA (badge vermelho). Sugestao "Impugnacao". Lei: Art. 41 par.2 Lei 14.133/2021. |
| **Tipo** | Positivo |

### CT-I01-03 — Verificar inconsistencias de shelf-life e cadeia fria
| Campo | Valor |
|---|---|
| **ID** | CT-I01-03 |
| **Descricao** | Verificar inconsistencias especificas de reagentes: shelf-life e cadeia fria |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Na tabela, localizar item sobre "Prazo de validade minimo de 24 meses". 2. Localizar item sobre "amostras em 3 dias uteis" (cadeia fria). |
| **Saida esperada** | Shelf-life: Gravidade ALTA, Art. 75 Lei 14.133/2021. Cadeia fria: Gravidade MEDIA, Art. 17 par.3 (prazo insuficiente para logistica 2-8C). |
| **Tipo** | Positivo |

### CT-I01-04 — Verificar comodato vinculado como inconsistencia
| Campo | Valor |
|---|---|
| **ID** | CT-I01-04 |
| **Descricao** | Verificar que vinculacao reagente-equipamento em comodato e detectada |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Na tabela, localizar item sobre "Fornecimento de equipamento em comodato vinculado". |
| **Saida esperada** | Inconsistencia sobre comodato vinculado presente. Gravidade ALTA. Art. 40 par.5 Lei 14.133/2021. Sugestao "Impugnacao". |
| **Tipo** | Positivo |

### CT-I01-05 — Verificar diferenciacao de gravidades
| Campo | Valor |
|---|---|
| **ID** | CT-I01-05 |
| **Descricao** | Verificar que a tabela tem pelo menos 2 niveis de gravidade diferentes |
| **Pre-condicoes** | CT-I01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Verificar badges de gravidade na tabela. |
| **Saida esperada** | Pelo menos badges ALTA (vermelho) e MEDIA (amarelo) presentes. Nao todas as gravidades iguais. |
| **Tipo** | Positivo |

### CT-I01-06 — Nenhuma inconsistencia generica (qualidade da analise)
| Campo | Valor |
|---|---|
| **ID** | CT-I01-06 |
| **Descricao** | Verificar que inconsistencias sao especificas de reagentes, nao genericas |
| **Pre-condicoes** | CT-I01-01 executado |
| **Acoes do ator e dados de entrada** | 1. Revisar todas as linhas da tabela de inconsistencias. |
| **Saida esperada** | Inconsistencias mencionam termos de reagentes/equipamentos: "analisador", "Sysmex", "reagente", "comodato", "shelf-life", "cadeia fria", "AFE". Nenhuma inconsistencia puramente generica sem relacao com o edital. |
| **Tipo** | Positivo |

---

## UC-I02 — Sugerir Esclarecimento ou Impugnacao

### CT-I02-01 — Criar peticao de Esclarecimento sobre AFE ANVISA
| Campo | Valor |
|---|---|
| **ID** | CT-I02-01 |
| **Descricao** | Criar peticao de esclarecimento sobre exigencia de AFE ANVISA |
| **Pre-condicoes** | UC-I01 concluido, aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Peticoes". 2. Clicar "Nova Peticao". 3. No modal: Edital = reagentes hematologicos, Tipo = "Esclarecimento", Template = "Nenhum (em branco)", Conteudo = "Solicitamos esclarecimento quanto a exigencia de AFE ANVISA em categoria especial para distribuidoras de reagentes de diagnostico in vitro. A legislacao vigente (RDC 16/2013) nao preve tal subcategoria para distribuidoras de produtos classe I e II. Rogamos informar a base normativa para tal requisito." 4. Clicar "Salvar" (ou "Criar"). |
| **Saida esperada** | Peticao aparece na tabela com Tipo "Esclarecimento", Status "Rascunho". Badge tipo "Esclarecimento" (info). |
| **Tipo** | Positivo |

### CT-I02-02 — Criar peticao de Impugnacao sobre restricao de plataforma
| Campo | Valor |
|---|---|
| **ID** | CT-I02-02 |
| **Descricao** | Criar peticao de impugnacao sobre direcionamento de marca/plataforma |
| **Pre-condicoes** | CT-I02-01 executado (1 peticao na tabela) |
| **Acoes do ator e dados de entrada** | 1. Clicar "Nova Peticao". 2. No modal: Edital = reagentes hematologicos, Tipo = "Impugnacao", Template = "Nenhum (em branco)", Conteudo = "A exigencia de compatibilidade exclusiva com analisador Sysmex XN-1000 configura direcionamento de marca vedado pelo Art. 41 par.2 da Lei 14.133/2021. Reagentes de diversos fabricantes (Wiener, Labtest, Abbott) atendem os mesmos parametros analiticos. A vinculacao reagente-equipamento em comodato restringe indevidamente a competicao." 3. Clicar "Salvar". |
| **Saida esperada** | Segunda peticao na tabela com Tipo "Impugnacao", Status "Rascunho". Total de 2 peticoes: 1 Esclarecimento + 1 Impugnacao. Badges de tipo diferenciados. |
| **Tipo** | Positivo |

### CT-I02-03 — Verificar duas peticoes na tabela
| Campo | Valor |
|---|---|
| **ID** | CT-I02-03 |
| **Descricao** | Verificar que ambas as peticoes estao corretamente listadas |
| **Pre-condicoes** | CT-I02-01 e CT-I02-02 executados |
| **Acoes do ator e dados de entrada** | 1. Contar linhas na tabela de peticoes. 2. Verificar tipos e status. |
| **Saida esperada** | 2 peticoes na tabela. Peticao 1: Esclarecimento, Rascunho. Peticao 2: Impugnacao, Rascunho. Badges de tipo diferenciados (info vs error). |
| **Tipo** | Positivo |

### CT-I02-04 — Erro ao salvar peticao com modal vazio (FE-01/FE-02)
| Campo | Valor |
|---|---|
| **ID** | CT-I02-04 |
| **Descricao** | Tentar criar peticao sem preencher campos obrigatorios |
| **Pre-condicoes** | Modal "Nova Peticao" aberto |
| **Acoes do ator e dados de entrada** | 1. Deixar Select "Edital" sem selecao. 2. Clicar "Criar". |
| **Saida esperada** | Mensagem de validacao. Modal nao fecha. |
| **Tipo** | Negativo |

---

## UC-I03 — Gerar Peticao de Impugnacao

### CT-I03-01 — Gerar peticao via IA para empresa RP3X (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I03-01 |
| **Descricao** | Gerar peticao via IA e verificar dados da RP3X e secoes obrigatorias |
| **Pre-condicoes** | Peticao de Impugnacao criada no CT-I02-02, aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Na tabela de peticoes, clicar icone Eye na peticao de Impugnacao (restricao de plataforma). 2. Clicar botao "Gerar Peticao". 3. Aguardar processamento da IA. |
| **Saida esperada** | Peticao gerada com secoes: Qualificacao (RP3X Comercio e Representacoes Ltda., CNPJ 68.218.593/0001-09, distribuidora de reagentes), Fatos (clausula de Sysmex XN-1000, comodato vinculado), Direito (Art. 41 par.2 Lei 14.133/2021, Art. 5 Lei 12.462/2011, principio da isonomia), Jurisprudencias (acordao TCU sobre direcionamento de marca em reagentes), Pedido (aceitar reagentes compativeis com multiplas plataformas). |
| **Tipo** | Positivo |

### CT-I03-02 — Editar texto gerado pela IA (adicionar shelf-life)
| Campo | Valor |
|---|---|
| **ID** | CT-I03-02 |
| **Descricao** | Editar peticao gerada adicionando argumento sobre shelf-life |
| **Pre-condicoes** | CT-I03-01 executado (peticao gerada no editor) |
| **Acoes do ator e dados de entrada** | 1. No TextArea do editor, adicionar o seguinte trecho: "Adicionalmente, o prazo de validade minimo de 24 meses exigido no edital excede o shelf-life padrao do mercado de reagentes de hematologia, que e de 18 meses conforme bulas dos fabricantes Sysmex, Wiener, Labtest e Abbott, restringindo ainda mais a competicao." 2. Verificar que o texto e 100% editavel. |
| **Saida esperada** | Texto adicionado com sucesso no TextArea. Editor permite edicao livre. |
| **Tipo** | Positivo |

### CT-I03-03 — Salvar rascunho
| Campo | Valor |
|---|---|
| **ID** | CT-I03-03 |
| **Descricao** | Salvar rascunho da peticao editada |
| **Pre-condicoes** | CT-I03-02 executado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Salvar Rascunho". |
| **Saida esperada** | Toast de sucesso exibido. Conteudo salvo. |
| **Tipo** | Positivo |

### CT-I03-04 — Enviar para revisao
| Campo | Valor |
|---|---|
| **ID** | CT-I03-04 |
| **Descricao** | Mudar status da peticao para "Em Revisao" |
| **Pre-condicoes** | CT-I03-03 executado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Enviar para Revisao". |
| **Saida esperada** | Status muda para "Em Revisao". Badge na tabela atualizado. |
| **Tipo** | Positivo |

### CT-I03-05 — Exportar peticao como PDF
| Campo | Valor |
|---|---|
| **ID** | CT-I03-05 |
| **Descricao** | Exportar peticao como PDF |
| **Pre-condicoes** | Peticao com conteudo no editor |
| **Acoes do ator e dados de entrada** | 1. Clicar "Exportar como PDF" (ou "PDF"). |
| **Saida esperada** | Download de PDF iniciado. Arquivo contem texto da peticao. |
| **Tipo** | Positivo |

### CT-I03-06 — IA nao gera conteudo (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-I03-06 |
| **Descricao** | Verificar comportamento quando IA falha ao gerar peticao |
| **Pre-condicoes** | Editor aberto |
| **Acoes do ator e dados de entrada** | 1. Clicar "Gerar Peticao". 2. Simular timeout ou erro. |
| **Saida esperada** | Mensagem de erro exibida. TextArea preserva conteudo anterior. Botao reabilitado. |
| **Tipo** | Negativo |

---

## UC-I04 — Upload de Peticao Externa

### CT-I04-01 — Upload de PDF externo (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I04-01 |
| **Descricao** | Fazer upload de peticao PDF para o edital de reagentes |
| **Pre-condicoes** | Aba Peticoes ativa, 2 peticoes ja criadas (UC-I02), arquivo PDF < 2 MB disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar "Upload Peticao". 2. No modal: Edital = reagentes hematologicos. 3. Selecionar arquivo PDF (ex: `tests/fixtures/teste_upload.pdf`). 4. Clicar "Enviar" (ou "Upload"). |
| **Saida esperada** | Peticao de upload aparece na tabela com Tipo "Impugnacao" e Status "Rascunho". Total de peticoes na tabela: 3 (2 criadas + 1 upload). |
| **Tipo** | Positivo |

### CT-I04-02 — Verificar total de 3 peticoes na tabela
| Campo | Valor |
|---|---|
| **ID** | CT-I04-02 |
| **Descricao** | Verificar que a tabela tem exatamente 3 peticoes apos upload |
| **Pre-condicoes** | CT-I04-01 executado |
| **Acoes do ator e dados de entrada** | 1. Contar linhas na tabela de peticoes. |
| **Saida esperada** | 3 peticoes listadas: Esclarecimento (UC-I02), Impugnacao (UC-I02), Upload (UC-I04). |
| **Tipo** | Positivo |

### CT-I04-03 — Modal de upload nao abre (FE)
| Campo | Valor |
|---|---|
| **ID** | CT-I04-03 |
| **Descricao** | Verificar que o modal de upload abre corretamente ao clicar o botao |
| **Pre-condicoes** | Aba Peticoes ativa |
| **Acoes do ator e dados de entrada** | 1. Clicar "Upload Peticao". |
| **Saida esperada** | Modal abre com campos para selecionar edital e arquivo. Se nao abre: reportar como defeito. |
| **Tipo** | Positivo |

---

## UC-I05 — Controle de Prazo

### CT-I05-01 — Verificar tabela de prazos com multiplos editais (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-I05-01 |
| **Descricao** | Verificar tabela de prazos com editais de reagentes e kits diagnosticos |
| **Pre-condicoes** | Editais de reagentes e kit diagnostico salvos |
| **Acoes do ator e dados de entrada** | 1. Na ImpugnacaoPage, clicar aba "Prazos". |
| **Saida esperada** | Tabela carregada com pelo menos 2 editais (reagentes hematologicos + kit diagnostico). Colunas visiveis: Edital, Orgao, Data Abertura, Prazo Limite, Dias Restantes, Status. |
| **Tipo** | Positivo |

### CT-I05-02 — Verificar badges de urgencia coloridos
| Campo | Valor |
|---|---|
| **ID** | CT-I05-02 |
| **Descricao** | Verificar que badges de status sao diferenciados por cores |
| **Pre-condicoes** | CT-I05-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar coluna "Status" para cada edital. 2. Verificar coluna "Dias Restantes". |
| **Saida esperada** | Badges: "Urgente" (vermelho), "Atencao" (amarelo), "OK" (verde), "Expirado" (vermelho). Dias Restantes: valor numerico ou badge "EXPIRADO". Calculo automatico de 3 dias uteis antes da abertura (Art. 164 Lei 14.133/2021). |
| **Tipo** | Positivo |

### CT-I05-03 — Calculo descontando fins de semana/feriados
| Campo | Valor |
|---|---|
| **ID** | CT-I05-03 |
| **Descricao** | Verificar que o calculo de prazo desconta fins de semana |
| **Pre-condicoes** | CT-I05-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar coluna "Prazo Limite" para cada edital. 2. Comparar com data de abertura (deve ser 3 dias uteis antes, excluindo sabados e domingos). |
| **Saida esperada** | Prazo Limite nao cai em sabado ou domingo. Se data de abertura e segunda-feira, prazo limite e quarta-feira anterior (3 dias uteis). |
| **Tipo** | Positivo |

### CT-I05-04 — Tabela vazia (nenhum edital) (FE)
| Campo | Valor |
|---|---|
| **ID** | CT-I05-04 |
| **Descricao** | Verificar comportamento com tabela vazia |
| **Pre-condicoes** | Cenario hipotetico: nenhum edital salvo |
| **Acoes do ator e dados de entrada** | 1. Acessar aba "Prazos" sem editais salvos. |
| **Saida esperada** | Tabela vazia com mensagem informativa ou sem linhas. |
| **Tipo** | Negativo |

---

# FASE 2 — RECURSOS E CONTRA-RAZOES

---

## UC-RE01 — Monitorar Janela de Recurso

### CT-RE01-01 — Ativar monitoramento com WhatsApp e Email (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-01 |
| **Descricao** | Ativar monitoramento com 2 canais ativos e 1 inativo |
| **Pre-condicoes** | Usuario logado como valida2@valida.com.br, empresa RP3X, edital de reagentes salvo |
| **Acoes do ator e dados de entrada** | 1. No menu lateral, clicar "Recursos". 2. Na aba "Monitoramento", selecionar edital de reagentes hematologicos. 3. Marcar checkbox "WhatsApp" = Sim. 4. Marcar checkbox "Email" = Sim. 5. Deixar "Alerta no sistema" desmarcado. 6. Clicar "Ativar Monitoramento". |
| **Saida esperada** | Status muda para "Aguardando". WhatsApp e Email marcados, Alerta no sistema desmarcado (exatamente 2 canais ativos). |
| **Tipo** | Positivo |

### CT-RE01-02 — Verificar deteccao de janela aberta
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-02 |
| **Descricao** | Verificar que o sistema detecta janela de recurso aberta |
| **Pre-condicoes** | CT-RE01-01 executado, monitoramento ativo |
| **Acoes do ator e dados de entrada** | 1. Aguardar deteccao de janela (ou verificar se ja esta aberta). |
| **Saida esperada** | Se janela aberta: Status muda para "JANELA ABERTA". Se aguardando: Status "Aguardando" com timer. |
| **Tipo** | Positivo |

### CT-RE01-03 — Registrar intencao de recurso
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-03 |
| **Descricao** | Registrar intencao de recurso quando janela esta aberta |
| **Pre-condicoes** | Status "JANELA ABERTA" |
| **Acoes do ator e dados de entrada** | 1. Clicar "Registrar Intencao de Recurso". |
| **Saida esperada** | Intencao registrada com sucesso. Status atualizado. |
| **Tipo** | Positivo |

### CT-RE01-04 — Seletor de edital vazio (FE)
| Campo | Valor |
|---|---|
| **ID** | CT-RE01-04 |
| **Descricao** | Verificar comportamento quando nao ha editais para monitorar |
| **Pre-condicoes** | Cenario hipotetico: nenhum edital salvo |
| **Acoes do ator e dados de entrada** | 1. Acessar aba "Monitoramento". 2. Verificar seletor de editais. |
| **Saida esperada** | Seletor vazio ou com mensagem "Nenhum edital disponivel". |
| **Tipo** | Negativo |

---

## UC-RE02 — Analisar Proposta Vencedora

### CT-RE02-01 — Colar e analisar proposta da Labtest (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-01 |
| **Descricao** | Colar texto da proposta da Labtest e analisar inconsistencias |
| **Pre-condicoes** | RecursosPage, aba Analise, edital de reagentes selecionado |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Analise". 2. Selecionar edital de reagentes hematologicos. 3. Colar no TextArea: "PROPOSTA COMERCIAL — Labtest Diagnostica S.A. / CNPJ: 16.517.200/0001-72 / Pregao Eletronico — Reagentes de Hematologia / Item 1: Kit de Reagentes para Hemograma Completo — Labtest LabMax 300 / Qtd: 50 CX | Valor Unit: R$ 1.720,00 | Total: R$ 86.000,00 / Prazo de validade: 18 meses | Armazenamento: 2-8C / Compativel com: Mindray BC-6800, Labtest LabMax / Item 2: Reagente Diluente Isotonico — Labtest CellPack / Qtd: 30 GL | Valor Unit: R$ 390,00 | Total: R$ 11.700,00 / Item 3: Reagente Lisante — Labtest StromaLyse / Qtd: 40 FR | Valor Unit: R$ 350,00 | Total: R$ 14.000,00 / Item 4: Controle Hematologico — Labtest ControlCheck 3N / Qtd: 20 KIT | Valor Unit: R$ 980,00 | Total: R$ 19.600,00 / TOTAL: R$ 131.300,00 / Prazo de entrega: 20 dias corridos / Condicao: Equipamento Mindray BC-6800 em comodato vinculado / Validade da proposta: 90 dias". 4. Clicar botao de analise. 5. Aguardar processamento. |
| **Saida esperada** | Card "Inconsistencias Identificadas" com tabela. Card "Analise Detalhada" com texto juridico. Badges de gravidade: ALTA, MEDIA, BAIXA. 5 inconsistencias esperadas: (1) Plataforma incompativel — Mindray BC-6800 vs Sysmex XN-1000 (ALTA), (2) Shelf-life 18 meses vs 24 exigido (ALTA), (3) Prazo entrega 20 dias vs 15 do edital (MEDIA), (4) Comodato nao solicitado (MEDIA), (5) Sem registro ANVISA (BAIXA). |
| **Tipo** | Positivo |

### CT-RE02-02 — Verificar inconsistencia de plataforma incompativel
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-02 |
| **Descricao** | Verificar que a incompatibilidade de plataforma e detectada como ALTA |
| **Pre-condicoes** | CT-RE02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Na tabela de inconsistencias, localizar item sobre "Compatibilidade de plataforma". |
| **Saida esperada** | Inconsistencia: "Proposta oferece Mindray BC-6800 mas edital especificava Sysmex XN-1000". Gravidade ALTA. Motivacao: "Descumprimento do termo de referencia — plataforma incompativel". |
| **Tipo** | Positivo |

### CT-RE02-03 — Verificar inconsistencia de shelf-life
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-03 |
| **Descricao** | Verificar que shelf-life insuficiente e detectado |
| **Pre-condicoes** | CT-RE02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Na tabela, localizar item sobre "Prazo de validade". |
| **Saida esperada** | Inconsistencia: "Proposta informa 18 meses, edital exige 24 meses". Gravidade ALTA. |
| **Tipo** | Positivo |

### CT-RE02-04 — Analisar proposta sem texto colado (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE02-04 |
| **Descricao** | Tentar analisar proposta sem colar texto |
| **Pre-condicoes** | Aba Analise, edital selecionado |
| **Acoes do ator e dados de entrada** | 1. Deixar TextArea vazio. 2. Clicar botao de analise. |
| **Saida esperada** | Mensagem de validacao: texto da proposta obrigatorio. Analise nao disparada. |
| **Tipo** | Negativo |

---

## UC-RE03 — Chatbox de Analise

### CT-RE03-01 — Pergunta sobre compatibilidade de plataforma
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-01 |
| **Descricao** | Perguntar sobre compatibilidade dos reagentes Labtest com Sysmex XN-1000 |
| **Pre-condicoes** | UC-RE02 concluido, chatbox acessivel |
| **Acoes do ator e dados de entrada** | 1. No chatbox, digitar: "Os reagentes da Labtest sao compativeis com o analisador Sysmex XN-1000 exigido no edital?". 2. Clicar "Enviar". 3. Aguardar resposta. |
| **Saida esperada** | Resposta menciona incompatibilidade de plataforma — reagentes Labtest sao para Mindray, nao para Sysmex. Referencia tecnica a diferenca de plataformas. |
| **Tipo** | Positivo |

### CT-RE03-02 — Pergunta sobre shelf-life
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-02 |
| **Descricao** | Perguntar sobre aceitabilidade de shelf-life de 18 meses vs 24 exigido |
| **Pre-condicoes** | CT-RE03-01 executado (1 pergunta no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "O prazo de validade de 18 meses pode ser aceito se o edital exige 24?". 2. Clicar "Enviar". |
| **Saida esperada** | Resposta analisa juridicamente a possibilidade de recurso por shelf-life insuficiente. Menciona Art. 75 ou padrao de mercado. Historico com 2 perguntas e 2 respostas. |
| **Tipo** | Positivo |

### CT-RE03-03 — Pergunta sobre comodato
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-03 |
| **Descricao** | Perguntar se comodato nao previsto configura vantagem indevida |
| **Pre-condicoes** | CT-RE03-02 executado (2 perguntas no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "A inclusao de equipamento em comodato pela vencedora configura vantagem indevida?". 2. Clicar "Enviar". |
| **Saida esperada** | Resposta discute o comodato nao previsto no edital e o principio da isonomia. |
| **Tipo** | Positivo |

### CT-RE03-04 — Pergunta sobre AFE ANVISA da RP3X
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-04 |
| **Descricao** | Perguntar sobre status regulatorio da RP3X |
| **Pre-condicoes** | CT-RE03-03 executado (3 perguntas no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "A RP3X tem AFE ANVISA vigente para comercializar esses reagentes?". 2. Clicar "Enviar". |
| **Saida esperada** | Resposta aborda verificacao de AFE ANVISA para a RP3X. |
| **Tipo** | Positivo |

### CT-RE03-05 — Pergunta sobre risco de aceitacao
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-05 |
| **Descricao** | Perguntar sobre risco de a comissao aceitar shelf-life menor |
| **Pre-condicoes** | CT-RE03-04 executado (4 perguntas no historico) |
| **Acoes do ator e dados de entrada** | 1. Digitar: "Qual o risco de a comissao de licitacao aceitar reagentes com shelf-life menor?". 2. Clicar "Enviar". |
| **Saida esperada** | Resposta menciona riscos e precedentes relevantes. Historico completo: 5 perguntas e 5 respostas. Conversa cumulativa (cada resposta considera contexto anterior). |
| **Tipo** | Positivo |

### CT-RE03-06 — Verificar historico cumulativo (5 perguntas)
| Campo | Valor |
|---|---|
| **ID** | CT-RE03-06 |
| **Descricao** | Verificar que o historico do chat contem todas as interacoes |
| **Pre-condicoes** | CT-RE03-05 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar area de historico do chat. |
| **Saida esperada** | 5 perguntas do usuario e 5 respostas da IA visiveis na area de historico. Respostas especificas sobre plataforma, shelf-life, comodato, AFE ANVISA e risco. |
| **Tipo** | Positivo |

---

## UC-RE04 — Gerar Laudo de Recurso

### CT-RE04-01 — Criar Recurso Tecnico contra Labtest (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-01 |
| **Descricao** | Criar laudo de recurso tecnico contra a proposta da Labtest |
| **Pre-condicoes** | UCs RE01-RE03 executados, aba Laudos |
| **Acoes do ator e dados de entrada** | 1. Clicar aba "Laudos". 2. Clicar "Novo Laudo". 3. No modal: Edital = reagentes hematologicos, Tipo = "Recurso", Subtipo = "Tecnico", Template = "Nenhum (em branco)", Empresa Alvo = "Labtest Diagnostica S.A.", Conteudo Inicial = "Recurso tecnico contra a proposta da Labtest Diagnostica: (1) reagentes incompativeis com plataforma Sysmex XN-1000 exigida; (2) shelf-life de 18 meses nao atende o minimo de 24 meses; (3) inclusao de comodato Mindray BC-6800 nao previsto no TR." 4. Clicar "Salvar". |
| **Saida esperada** | Laudo aparece na tabela: Tipo "Recurso", Subtipo "Tecnico", Empresa Alvo "Labtest Diagnostica S.A.", Status "Rascunho". |
| **Tipo** | Positivo |

### CT-RE04-02 — Editar recurso tecnico com secoes obrigatorias
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-02 |
| **Descricao** | Editar laudo incluindo secoes juridica e tecnica obrigatorias |
| **Pre-condicoes** | CT-RE04-01 executado |
| **Acoes do ator e dados de entrada** | 1. Clicar icone Eye para abrir editor. 2. Verificar card "Editando: ... Recurso (Tecnico)". 3. Editar TextArea incluindo: SECAO JURIDICA (Art. 41 par.2, Art. 71, Acordao TCU), SECAO TECNICA (incompatibilidade reagente-analisador, shelf-life, ausencia ANVISA). 4. Clicar "Salvar Rascunho". 5. Clicar "Enviar para Revisao". |
| **Saida esperada** | Toast de sucesso ao salvar. Status muda para "Revisao". |
| **Tipo** | Positivo |

### CT-RE04-03 — Criar Recurso Administrativo contra o edital
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-03 |
| **Descricao** | Criar recurso administrativo sem empresa alvo (recurso contra o edital) |
| **Pre-condicoes** | CT-RE04-02 executado (1 laudo na tabela) |
| **Acoes do ator e dados de entrada** | 1. Clicar "Novo Laudo". 2. Edital = reagentes hematologicos, Tipo = "Recurso", Subtipo = "Administrativo", Template = "Nenhum (em branco)", Empresa Alvo = (vazio), Conteudo = "Recurso administrativo contra a exigencia de shelf-life minimo de 24 meses para reagentes de hematologia. O padrao de mercado para kits de hemograma e de 18 meses conforme bulas dos fabricantes Sysmex, Wiener, Labtest e Abbott. A exigencia de 24 meses restringe indevidamente a competicao (Art. 75 Lei 14.133/2021)." 3. Clicar "Salvar". |
| **Saida esperada** | Segundo laudo na tabela: Tipo "Recurso", Subtipo "Administrativo", Empresa Alvo vazia ("-"). Status "Rascunho". Total de 2 laudos. |
| **Tipo** | Positivo |

### CT-RE04-04 — Verificar 2 laudos na tabela com subtipos distintos
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-04 |
| **Descricao** | Verificar que ambos os laudos estao listados com subtipos corretos |
| **Pre-condicoes** | CT-RE04-03 executado |
| **Acoes do ator e dados de entrada** | 1. Contar linhas na tabela de laudos. 2. Verificar subtipos. |
| **Saida esperada** | 2 laudos: (1) Recurso Tecnico, Empresa Alvo "Labtest Diagnostica S.A.", status "Revisao". (2) Recurso Administrativo, Empresa Alvo vazia, status "Rascunho". |
| **Tipo** | Positivo |

### CT-RE04-05 — Modal nao aceita campo Empresa Alvo em branco (FE de borda)
| Campo | Valor |
|---|---|
| **ID** | CT-RE04-05 |
| **Descricao** | Verificar que o sistema aceita campo Empresa Alvo em branco para recurso administrativo |
| **Pre-condicoes** | Modal "Novo Laudo" aberto |
| **Acoes do ator e dados de entrada** | 1. Preencher todos os campos obrigatorios. 2. Deixar Empresa Alvo vazio. 3. Clicar "Criar". |
| **Saida esperada** | Laudo criado com sucesso (campo Empresa Alvo e opcional para tipo Recurso). Se falhar: reportar como defeito de borda. |
| **Tipo** | Limite |

---

## UC-RE05 — Gerar Laudo de Contra-Razao

### CT-RE05-01 — Criar contra-razao contra Wama Diagnostica (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-01 |
| **Descricao** | Criar laudo de contra-razao refutando recurso da Wama Diagnostica |
| **Pre-condicoes** | UC-RE04 executado (2 laudos de recurso na tabela) |
| **Acoes do ator e dados de entrada** | 1. Clicar "Novo Laudo". 2. No modal: Edital = reagentes hematologicos, Tipo = "Contra-Razao", Subtipo = "Tecnico", Template = "Nenhum (em branco)", Empresa Alvo = "Wama Diagnostica Ltda.", Conteudo = "Contra-razoes ao recurso interposto pela Wama Diagnostica, que alega que os reagentes RP3X Cientifica/Sysmex nao possuem demonstracao de equivalencia analitica. Refutamos: os reagentes Sysmex XN possuem registro ANVISA (10069330285), validacao conforme ISO 15189 e certificado de calibracao rastreavel ao padrao internacional ISLH." 3. Clicar "Salvar". |
| **Saida esperada** | Laudo na tabela: Tipo "Contra-Razao", Empresa Alvo "Wama Diagnostica Ltda.", Status "Rascunho". Total de laudos: 3 (2 Recursos + 1 Contra-Razao). |
| **Tipo** | Positivo |

### CT-RE05-02 — Editar contra-razao com secoes DEFESA e ATAQUE
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-02 |
| **Descricao** | Editar contra-razao incluindo secoes de defesa e ataque |
| **Pre-condicoes** | CT-RE05-01 executado |
| **Acoes do ator e dados de entrada** | 1. Clicar icone Eye na contra-razao. 2. Verificar card "Editando: ... Contra-Razao (Tecnico)". 3. Editar TextArea incluindo: SECAO JURIDICA (Art. 71, RDC 36/2015, ISO 15189), SECAO TECNICA (registro ANVISA, equivalencia analitica, ISO 15189, calibracao), DEFESA (RP3X apresenta todas as certificacoes), ATAQUE (Wama nao apresentou registro ANVISA, reagentes sem ISO 15189). 4. Clicar "Salvar Rascunho". |
| **Saida esperada** | Toast de sucesso. Conteudo salvo com secoes DEFESA e ATAQUE. |
| **Tipo** | Positivo |

### CT-RE05-03 — Exportar contra-razao como DOCX
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-03 |
| **Descricao** | Exportar contra-razao em formato DOCX |
| **Pre-condicoes** | CT-RE05-02 executado |
| **Acoes do ator e dados de entrada** | 1. Clicar "Exportar como DOCX" (ou "DOCX"). |
| **Saida esperada** | Download de arquivo DOCX iniciado. |
| **Tipo** | Positivo |

### CT-RE05-04 — Verificar total de 3 laudos na tabela
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-04 |
| **Descricao** | Verificar que a tabela de laudos tem 3 laudos com tipos distintos |
| **Pre-condicoes** | CT-RE05-01 executado |
| **Acoes do ator e dados de entrada** | 1. Contar linhas na tabela. 2. Verificar tipos e empresas alvo. |
| **Saida esperada** | 3 laudos: (1) Recurso Tecnico — Labtest, (2) Recurso Administrativo — (vazio), (3) Contra-Razao — Wama. |
| **Tipo** | Positivo |

### CT-RE05-05 — Tipo "Contra-Razao" nao disponivel no seletor (FE)
| Campo | Valor |
|---|---|
| **ID** | CT-RE05-05 |
| **Descricao** | Verificar que tipo "Contra-Razao" esta disponivel no seletor de tipo |
| **Pre-condicoes** | Modal "Novo Laudo" aberto |
| **Acoes do ator e dados de entrada** | 1. Verificar opcoes do Select "Tipo". |
| **Saida esperada** | Opcoes disponiveis: "Recurso" e "Contra-Razao". Se "Contra-Razao" ausente: reportar como defeito. |
| **Tipo** | Positivo |

---

## UC-RE06 — Submissao Assistida no Portal

### CT-RE06-01 — Submissao do Recurso Tecnico (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-01 |
| **Descricao** | Submeter recurso tecnico com validacoes, exportacao e registro de protocolo |
| **Pre-condicoes** | Recurso Tecnico em status "Revisao" (CT-RE04-02) |
| **Acoes do ator e dados de entrada** | 1. Abrir editor do Recurso Tecnico (contra Labtest). 2. Clicar "Submeter no Portal". 3. No modal: verificar badge "RECURSO", edital e subtipo "Tecnico". 4. Verificar 6 validacoes (tamanho, formato, prazo, secao juridica, secao tecnica, assinatura). 5. Clicar "Exportar PDF". 6. Clicar "Abrir Portal ComprasNet". 7. Preencher Protocolo = "PNCP-2026-RP3X-REC-001". 8. Clicar "Registrar Submissao". |
| **Saida esperada** | 6 checkboxes marcados. Texto "Todas as validacoes passaram". Mensagem "SUBMETIDO COM SUCESSO". Status do laudo muda para "Protocolado". Protocolo "PNCP-2026-RP3X-REC-001" salvo. |
| **Tipo** | Positivo |

### CT-RE06-02 — Submissao da Contra-Razao
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-02 |
| **Descricao** | Submeter contra-razao com protocolo diferente |
| **Pre-condicoes** | Contra-Razao criada (CT-RE05-01) |
| **Acoes do ator e dados de entrada** | 1. Abrir editor da Contra-Razao (contra Wama). 2. Clicar "Enviar para Revisao" (status -> "Revisao"). 3. Clicar "Submeter no Portal". 4. Verificar badge "CONTRA-RAZAO". 5. Clicar "Exportar DOCX". 6. Preencher Protocolo = "PNCP-2026-RP3X-CRA-001". 7. Clicar "Registrar Submissao". |
| **Saida esperada** | Mensagem "SUBMETIDO COM SUCESSO". Status "Protocolado". Protocolo "PNCP-2026-RP3X-CRA-001" salvo. |
| **Tipo** | Positivo |

### CT-RE06-03 — Verificar protocolos diferentes para cada submissao
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-03 |
| **Descricao** | Verificar que ambas as submissoes tem protocolos distintos |
| **Pre-condicoes** | CT-RE06-01 e CT-RE06-02 executados |
| **Acoes do ator e dados de entrada** | 1. Na tabela de laudos, verificar status e protocolos. |
| **Saida esperada** | Recurso Tecnico: status "Protocolado", protocolo "PNCP-2026-RP3X-REC-001". Contra-Razao: status "Protocolado", protocolo "PNCP-2026-RP3X-CRA-001". |
| **Tipo** | Positivo |

### CT-RE06-04 — Submeter sem protocolo (FE-02)
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-04 |
| **Descricao** | Tentar registrar submissao sem informar protocolo |
| **Pre-condicoes** | Modal de submissao aberto |
| **Acoes do ator e dados de entrada** | 1. Deixar campo "Protocolo" vazio. 2. Clicar "Registrar Submissao". |
| **Saida esperada** | Mensagem: "Informe o protocolo recebido do portal." Submissao nao registrada. |
| **Tipo** | Negativo |

### CT-RE06-05 — Validacoes pre-envio com falha (FE-01)
| Campo | Valor |
|---|---|
| **ID** | CT-RE06-05 |
| **Descricao** | Verificar comportamento quando validacoes criticas nao passam |
| **Pre-condicoes** | Laudo sem secao juridica ou tecnica |
| **Acoes do ator e dados de entrada** | 1. Abrir modal de submissao para laudo incompleto. 2. Verificar checklist. |
| **Saida esperada** | Checkbox de secao faltante desmarcado. Texto "Ha validacoes pendentes". Botao "Registrar Submissao" desabilitado. |
| **Tipo** | Negativo |

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## UC-FU01 — Registrar Resultado de Edital

### CT-FU01-01 — Registrar Vitoria para reagentes (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-01 |
| **Descricao** | Registrar vitoria no edital de reagentes hematologicos |
| **Pre-condicoes** | FollowupPage acessivel, edital de reagentes pendente |
| **Acoes do ator e dados de entrada** | 1. No menu lateral, clicar "Followup". 2. Localizar edital de reagentes hematologicos na tabela de pendentes. 3. Clicar "Registrar Resultado". 4. No modal: Tipo = "Vitoria", Valor Final = "142500", Observacoes = "Recurso tecnico contra Labtest Diagnostica foi deferido pela comissao. Proposta RP3X/Sysmex XN aceita integralmente. Contrato de fornecimento com entregas mensais fracionadas por 12 meses. Cadeia fria garantida com transportadora especializada." 5. Clicar "Registrar" (ou "Salvar"). |
| **Saida esperada** | Edital sai de Pendentes e aparece em Resultados Registrados. Badge "Vitoria" (verde). Valor R$ 142.500,00. Stat Cards atualizados: Vitorias incrementado, Taxa de Sucesso recalculada. |
| **Tipo** | Positivo |

### CT-FU01-02 — Registrar Derrota para kit diagnostico
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-02 |
| **Descricao** | Registrar derrota no edital de kit diagnostico laboratorial |
| **Pre-condicoes** | CT-FU01-01 executado, edital de kit diagnostico pendente |
| **Acoes do ator e dados de entrada** | 1. Localizar edital de kit diagnostico na tabela de pendentes. 2. Clicar "Registrar Resultado". 3. No modal: Tipo = "Derrota", Valor Final = "38200", Empresa Vencedora = "Wama Diagnostica Ltda.", Motivo da Derrota = "Preco", Observacoes = "Proposta RP3X ficou 12% acima do preco da Wama. Reagentes de glicose possuem margem apertada no mercado. Wama ofertou kit sem controle de qualidade incluso, reduzindo preco unitario. Avaliar ajuste de markup para proximos certames de bioquimica." 4. Clicar "Registrar". |
| **Saida esperada** | Edital em Resultados Registrados com badge "Derrota" (vermelho). Empresa Vencedora "Wama Diagnostica Ltda." Motivo "Preco". Stat Cards recalculados com nova derrota. |
| **Tipo** | Positivo |

### CT-FU01-03 — Verificar Stat Cards atualizados com ambos os resultados
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-03 |
| **Descricao** | Verificar que Stat Cards refletem 1 vitoria e 1 derrota |
| **Pre-condicoes** | CT-FU01-01 e CT-FU01-02 executados |
| **Acoes do ator e dados de entrada** | 1. Verificar Stat Cards no topo da pagina. |
| **Saida esperada** | Vitorias >= 1. Derrotas >= 1. Taxa de Sucesso recalculada (ex: 50% se 1 vitoria e 1 derrota). Pendentes decrementado. |
| **Tipo** | Positivo |

### CT-FU01-04 — Campo Empresa Vencedora nao disponivel para Derrota (FE)
| Campo | Valor |
|---|---|
| **ID** | CT-FU01-04 |
| **Descricao** | Verificar que campo "Empresa Vencedora" aparece apenas no cenario de Derrota |
| **Pre-condicoes** | Modal de resultado aberto |
| **Acoes do ator e dados de entrada** | 1. Selecionar "Vitoria" -> verificar que campo "Empresa Vencedora" NAO aparece. 2. Selecionar "Derrota" -> verificar que campo "Empresa Vencedora" APARECE. |
| **Saida esperada** | Campo "Empresa Vencedora" visivel apenas quando tipo = "Derrota". Para "Vitoria" e "Cancelado", campo esta oculto. |
| **Tipo** | Positivo |

---

## UC-FU02 — Configurar Alertas de Vencimento

### CT-FU02-01 — Verificar summary cards de alertas (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-01 |
| **Descricao** | Verificar summary cards na aba Alertas apos registro de vitoria |
| **Pre-condicoes** | UC-FU01 concluido com vitoria registrada |
| **Acoes do ator e dados de entrada** | 1. Na FollowupPage, clicar aba "Alertas". 2. Verificar summary cards. |
| **Saida esperada** | 5 summary cards visiveis: Total, Critico (<7d), Urgente (7-15d), Atencao (15-30d), Normal (>30d). Pelo menos Total >= 1 (contrato de reagentes recem-registrado). |
| **Tipo** | Positivo |

### CT-FU02-02 — Verificar tabela de vencimentos
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-02 |
| **Descricao** | Verificar tabela de vencimentos com contrato de reagentes |
| **Pre-condicoes** | CT-FU02-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar tabela de Proximos Vencimentos. |
| **Saida esperada** | Pelo menos 1 registro na tabela (contrato de reagentes). Colunas: Tipo (badge contrato azul), Nome, Data, Dias, Urgencia (badge colorido). |
| **Tipo** | Positivo |

### CT-FU02-03 — Verificar regras de alerta ou mensagem vazia
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-03 |
| **Descricao** | Verificar card de regras de alerta |
| **Pre-condicoes** | Aba Alertas ativa |
| **Acoes do ator e dados de entrada** | 1. Verificar Card "Regras de Alerta Configuradas". |
| **Saida esperada** | Tabela de regras com colunas 30d, 15d, 7d, 1d, Email, Push, Ativo. OU mensagem "Nenhuma regra configurada. Use o dashboard Contratado x Realizado para configurar." |
| **Tipo** | Positivo |

### CT-FU02-04 — Botao Atualizar recarrega dados
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-04 |
| **Descricao** | Verificar que o botao Atualizar recarrega os dados |
| **Pre-condicoes** | Aba Alertas ativa com dados carregados |
| **Acoes do ator e dados de entrada** | 1. Clicar botao "Atualizar". |
| **Saida esperada** | Dados recarregados. Tabela e summary cards atualizados. |
| **Tipo** | Positivo |

### CT-FU02-05 — Cenario sem vencimentos (FA-01)
| Campo | Valor |
|---|---|
| **ID** | CT-FU02-05 |
| **Descricao** | Verificar mensagem quando nao ha vencimentos proximos |
| **Pre-condicoes** | Nenhum contrato ou ARP com vencimento nos proximos 90 dias |
| **Acoes do ator e dados de entrada** | 1. Verificar tabela de vencimentos. |
| **Saida esperada** | Mensagem: "Nenhum vencimento nos proximos 90 dias". Summary cards zerados. |
| **Tipo** | Limite |

---

## UC-FU03 — Score Logistico

### CT-FU03-01 — Verificar score logistico para reagentes (fluxo principal)
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-01 |
| **Descricao** | Verificar score logistico com componentes para distribuidora de reagentes |
| **Pre-condicoes** | UC-FU01 concluido, FollowupPage ativa |
| **Acoes do ator e dados de entrada** | 1. Localizar card stat "Score Logistico" na FollowupPage. |
| **Saida esperada** | Score numerico exibido (valor entre 0 e 100, ou "N/A"). Componentes visiveis: Distancia (media-alta para RP3X em Ribeirao Preto/SP), Prazo de entrega (alto — 15 dias), Capacidade produtiva (alto — distribuidora com estoque). |
| **Tipo** | Positivo |

### CT-FU03-02 — Interpretar score para cadeia fria
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-02 |
| **Descricao** | Verificar interpretacao do score considerando logistica de cadeia fria |
| **Pre-condicoes** | CT-FU03-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar faixa do score. |
| **Saida esperada** | Score 80-100: "Alta viabilidade — entrega facil, estoque disponivel, cadeia fria controlada." Score 60-79: "Viabilidade media — pode exigir transportadora terceirizada." Score 40-59: "Viabilidade baixa — risco de ruptura de cadeia fria." Score < 40: "Inviavel." |
| **Tipo** | Positivo |

### CT-FU03-03 — Score como "N/A" sem dados (FA-01)
| Campo | Valor |
|---|---|
| **ID** | CT-FU03-03 |
| **Descricao** | Verificar exibicao quando dados logisticos sao insuficientes |
| **Pre-condicoes** | Edital sem produto vinculado ou parametros logisticos |
| **Acoes do ator e dados de entrada** | 1. Verificar card "Score Logistico" para edital sem dados logisticos. |
| **Saida esperada** | Score exibe "N/A". Mensagem sobre dados insuficientes. |
| **Tipo** | Limite |

---

# RESUMO DOS CASOS DE TESTE — CONJUNTO 2

| UC | ID | Tipo | Fluxo |
|---|---|---|---|
| UC-I01 | CT-I01-01 | Positivo | Principal |
| UC-I01 | CT-I01-02 | Positivo | Principal |
| UC-I01 | CT-I01-03 | Positivo | Principal |
| UC-I01 | CT-I01-04 | Positivo | Principal |
| UC-I01 | CT-I01-05 | Positivo | Principal |
| UC-I01 | CT-I01-06 | Positivo | Qualidade |
| UC-I02 | CT-I02-01 | Positivo | Principal |
| UC-I02 | CT-I02-02 | Positivo | Principal |
| UC-I02 | CT-I02-03 | Positivo | Principal |
| UC-I02 | CT-I02-04 | Negativo | FE-01/02 |
| UC-I03 | CT-I03-01 | Positivo | Principal |
| UC-I03 | CT-I03-02 | Positivo | Principal |
| UC-I03 | CT-I03-03 | Positivo | Principal |
| UC-I03 | CT-I03-04 | Positivo | Principal |
| UC-I03 | CT-I03-05 | Positivo | Principal |
| UC-I03 | CT-I03-06 | Negativo | FE-01 |
| UC-I04 | CT-I04-01 | Positivo | Principal |
| UC-I04 | CT-I04-02 | Positivo | Principal |
| UC-I04 | CT-I04-03 | Positivo | Principal |
| UC-I05 | CT-I05-01 | Positivo | Principal |
| UC-I05 | CT-I05-02 | Positivo | Principal |
| UC-I05 | CT-I05-03 | Positivo | Principal |
| UC-I05 | CT-I05-04 | Negativo | FE |
| UC-RE01 | CT-RE01-01 | Positivo | Principal |
| UC-RE01 | CT-RE01-02 | Positivo | Principal |
| UC-RE01 | CT-RE01-03 | Positivo | Principal |
| UC-RE01 | CT-RE01-04 | Negativo | FE |
| UC-RE02 | CT-RE02-01 | Positivo | Principal |
| UC-RE02 | CT-RE02-02 | Positivo | Principal |
| UC-RE02 | CT-RE02-03 | Positivo | Principal |
| UC-RE02 | CT-RE02-04 | Negativo | FE-01 |
| UC-RE03 | CT-RE03-01 | Positivo | Principal |
| UC-RE03 | CT-RE03-02 | Positivo | Principal |
| UC-RE03 | CT-RE03-03 | Positivo | Principal |
| UC-RE03 | CT-RE03-04 | Positivo | Principal |
| UC-RE03 | CT-RE03-05 | Positivo | Principal |
| UC-RE03 | CT-RE03-06 | Positivo | Principal |
| UC-RE04 | CT-RE04-01 | Positivo | Principal |
| UC-RE04 | CT-RE04-02 | Positivo | Principal |
| UC-RE04 | CT-RE04-03 | Positivo | Principal |
| UC-RE04 | CT-RE04-04 | Positivo | Principal |
| UC-RE04 | CT-RE04-05 | Limite | FA-01/FE |
| UC-RE05 | CT-RE05-01 | Positivo | Principal |
| UC-RE05 | CT-RE05-02 | Positivo | Principal |
| UC-RE05 | CT-RE05-03 | Positivo | Principal |
| UC-RE05 | CT-RE05-04 | Positivo | Principal |
| UC-RE05 | CT-RE05-05 | Positivo | Verificacao |
| UC-RE06 | CT-RE06-01 | Positivo | Principal |
| UC-RE06 | CT-RE06-02 | Positivo | Principal |
| UC-RE06 | CT-RE06-03 | Positivo | Principal |
| UC-RE06 | CT-RE06-04 | Negativo | FE-02 |
| UC-RE06 | CT-RE06-05 | Negativo | FE-01 |
| UC-FU01 | CT-FU01-01 | Positivo | Principal |
| UC-FU01 | CT-FU01-02 | Positivo | Principal |
| UC-FU01 | CT-FU01-03 | Positivo | Principal |
| UC-FU01 | CT-FU01-04 | Positivo | Verificacao |
| UC-FU02 | CT-FU02-01 | Positivo | Principal |
| UC-FU02 | CT-FU02-02 | Positivo | Principal |
| UC-FU02 | CT-FU02-03 | Positivo | Principal |
| UC-FU02 | CT-FU02-04 | Positivo | Principal |
| UC-FU02 | CT-FU02-05 | Limite | FA-01 |
| UC-FU03 | CT-FU03-01 | Positivo | Principal |
| UC-FU03 | CT-FU03-02 | Positivo | Principal |
| UC-FU03 | CT-FU03-03 | Limite | FA-01 |

**Total: 63 casos de teste** (47 Positivos + 8 Negativos + 8 Limite/Verificacao)

---

*Documento gerado em 21/04/2026. Dados exclusivamente do tutorialsprint4-2.md (Conjunto 2 — RP3X Comercio e Representacoes).*
