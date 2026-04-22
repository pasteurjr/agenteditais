# CASOS DE TESTE PARA VALIDACAO — Sprint 1 — Conjunto 2

**Data:** 2026-04-21
**Empresa:** RP3X Comercio e Representacoes Ltda.
**Usuario:** valida2@valida.com.br / 123456
**Referencia:** tutorialsprint1-2.md, CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md, correcaaval1.md
**Total de UCs:** 17 (UC-F01 a UC-F17)

---

## Convencao de IDs

- **CT-F{UC}-{numero}** — ex: CT-F01-01 = primeiro caso de teste do UC-F01
- **Tipo:** Positivo (fluxo principal), Negativo (fluxo de excecao/erro), Limite (valor de fronteira)
- **CORRECAO:** indica ajuste baseado nas observacoes do validador Arnaldo (doc correcaaval1.md)

---

## [UC-F01] Manter Cadastro Principal da Empresa

### CT-F01-01 — Preenchimento completo e salvamento com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F01-01 |
| **Descricao** | Preencher todos os campos do cadastro principal da RP3X e salvar |
| **Pre-condicoes** | Usuario logado como valida2@valida.com.br, empresa RP3X selecionada. CORRECAO OBS-01/04: Navegar via Configuracoes > Empresa (NAO via Cadastros > Empresa). |
| **Acoes do ator e dados de entrada** | 1. No menu lateral, clicar em Configuracoes > Empresa. 2. Razao Social: `RP3X Comercio e Representacoes Ltda.`. 3. Nome Fantasia: `RP3X Cientifica`. 4. CNPJ: `68.218.593/0001-09`. 5. Inscricao Estadual: `987.654.321.000`. 6. Website: `https://www.rp3x.com.br`. 7. Instagram: `@rp3x.cientifica`. 8. LinkedIn: `rp3x-comercio-representacoes`. 9. Facebook: (deixar em branco — campo opcional). 10. Endereco: `Rua do Laboratorio, 850, Conjunto 12`. 11. Cidade: `Ribeirao Preto`. 12. UF: `SP` (CORRECAO OBS-07: selecionar no dropdown, NAO digitar). 13. CEP: `14025-080`. 14. Clicar Salvar Alteracoes. |
| **Saida esperada** | Toast verde "Dados salvos com sucesso" visivel (CORRECAO OBS-09: verificar se toast aparece — se nao aparecer, registrar como bug confirmado). CNPJ exibido com mascara 68.218.593/0001-09. Facebook vazio sem erro de obrigatoriedade. |
| **Tipo** | Positivo |

### CT-F01-02 — Verificar campo UF como dropdown
| Campo | Valor |
|---|---|
| **ID** | CT-F01-02 |
| **Descricao** | CORRECAO OBS-07: Confirmar que UF e dropdown e nao campo texto livre |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | 1. Clicar no campo UF. 2. Observar se e dropdown (SelectInput) ou texto livre (TextInput). |
| **Saida esperada** | Campo UF DEVE ser SelectInput (dropdown) com 27 opcoes de UF. Se for TextInput (texto livre), registrar como BUG CONFIRMADO (OBS-07 Arnaldo — PROCEDE). |
| **Tipo** | Limite |

### CT-F01-03 — Verificar toast de salvamento com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F01-03 |
| **Descricao** | CORRECAO OBS-09: Confirmar que mensagem de sucesso aparece apos salvar |
| **Pre-condicoes** | Dados preenchidos no formulario |
| **Acoes do ator e dados de entrada** | 1. Preencher ao menos Razao Social e CNPJ. 2. Clicar Salvar Alteracoes. 3. Observar se toast verde aparece. |
| **Saida esperada** | Toast verde com texto "salvo com sucesso" ou similar DEVE aparecer. Se NAO aparecer, registrar como BUG CONFIRMADO (OBS-09 Arnaldo — PROCEDE). |
| **Tipo** | Limite |

### CT-F01-04 — CNPJ com formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F01-04 |
| **Descricao** | Tentar salvar com CNPJ invalido |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | 1. Preencher CNPJ: `68.218.593/0001` (incompleto). 2. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro de validacao RN-028. Sistema NAO salva. |
| **Tipo** | Negativo |

### CT-F01-05 — Facebook vazio (campo opcional) aceito sem erro
| Campo | Valor |
|---|---|
| **ID** | CT-F01-05 |
| **Descricao** | Confirmar que o sistema aceita salvar com Facebook em branco |
| **Pre-condicoes** | Todos os campos obrigatorios preenchidos |
| **Acoes do ator e dados de entrada** | 1. Instagram: `@rp3x.cientifica`. 2. LinkedIn: `rp3x-comercio-representacoes`. 3. Facebook: (vazio). 4. Clicar Salvar. |
| **Saida esperada** | Salvamento com sucesso. Sem mensagem de obrigatoriedade para Facebook. |
| **Tipo** | Positivo |

### CT-F01-06 — Verificar duplicidade de edicao (Cadastros vs Configuracoes)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-06 |
| **Descricao** | CORRECAO OBS-05: Verificar que existe duplicidade de acesso a edicao da empresa |
| **Pre-condicoes** | Usuario logado |
| **Acoes do ator e dados de entrada** | 1. Navegar via Cadastros > Empresa (Dados Cadastrais). 2. Observar os campos disponiveis. 3. Navegar via Configuracoes > Empresa. 4. Observar os campos disponiveis. |
| **Saida esperada** | DOCUMENTAR: Configuracoes > Empresa e mais completa (redes sociais, endereco, certidoes, responsaveis). Cadastros > Empresa e o CRUD generico simplificado. Registrar como observacao de UX (OBS-05 Arnaldo — PROCEDE). |
| **Tipo** | Limite |

---

## [UC-F02] Gerir Contatos e Area Padrao

### CT-F02-01 — Adicionar emails, telefones e area padrao com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F02-01 |
| **Descricao** | Cadastrar 2 emails, 3 telefones e selecionar area padrao |
| **Pre-condicoes** | UC-F01 concluido; secao Contatos aberta |
| **Acoes do ator e dados de entrada** | 1. Email 1: `licitacoes@rp3x.com.br`. 2. Email 2: `diretoria@rp3x.com.br`. 3. Telefone 1: `(16) 3333-9900`. 4. Telefone 2: `(16) 99888-7766`. 5. Telefone 3: `(16) 99777-5544`. 6. Area Padrao: `Diagnostico in Vitro e Laboratorio`. 7. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. 2 emails e 3 telefones na lista. Area Padrao = `Diagnostico in Vitro e Laboratorio`. |
| **Tipo** | Positivo |

### CT-F02-02 — Verificar mascara de telefone
| Campo | Valor |
|---|---|
| **ID** | CT-F02-02 |
| **Descricao** | CORRECAO OBS-10: Verificar se campo telefone tem mascara automatica |
| **Pre-condicoes** | Secao Contatos aberta |
| **Acoes do ator e dados de entrada** | 1. Digitar `16999887766` no campo telefone. 2. Observar se mascara `(XX) XXXXX-XXXX` e aplicada automaticamente. |
| **Saida esperada** | Se mascara existe: numero formatado como `(16) 99988-7766`. Se NAO existe: registrar como BUG de UX (OBS-10 Arnaldo — PROCEDE). |
| **Tipo** | Limite |

### CT-F02-03 — Area Padrao lista vazia
| Campo | Valor |
|---|---|
| **ID** | CT-F02-03 |
| **Descricao** | CORRECAO OBS-12: Verificar se dropdown Area Padrao possui opcoes |
| **Pre-condicoes** | Secao Contatos aberta |
| **Acoes do ator e dados de entrada** | 1. Clicar no dropdown de Area Padrao. 2. Observar se ha opcoes. |
| **Saida esperada** | Dropdown deve conter opcoes. Se vazio, registrar como dependencia (OBS-12 Arnaldo — PROCEDE PARCIAL: areas precisam existir via UC-F13 antes de UC-F02). |
| **Tipo** | Limite |

---

## [UC-F03] Gerir Documentos da Empresa

### CT-F03-01 — Upload de 4 documentos com badges de validade
| Campo | Valor |
|---|---|
| **ID** | CT-F03-01 |
| **Descricao** | Cadastrar 4 documentos com datas distintas e verificar badges por cor |
| **Pre-condicoes** | UC-F01 concluido; arquivo tests/fixtures/test_document.pdf disponivel |
| **Acoes do ator e dados de entrada** | 1. Doc 1: Tipo `Alvara / Licenca Sanitaria`, Arquivo: test_document.pdf, Validade: `31/03/2026`. Salvar. 2. Doc 2: Tipo `Autorizacao de Funcionamento ANVISA (AFE)`, Arquivo: test_document.pdf, Validade: `15/05/2027`. Salvar. 3. Doc 3: Tipo `Certificado ISO / Acreditacao`, Arquivo: test_document.pdf, Validade: `30/09/2026`. Salvar. 4. Doc 4: Tipo `Certidao Negativa Estadual`, Arquivo: test_document.pdf, Validade: `31/12/2025`. Salvar. |
| **Saida esperada** | 4 documentos na lista: Doc 1 (31/03/2026): badge AMARELO (vencendo/vencido). Doc 2 (15/05/2027): badge VERDE (valido). Doc 3 (30/09/2026): badge VERDE (valido). Doc 4 (31/12/2025): badge VERMELHO ou AMARELO (vencido). |
| **Tipo** | Positivo |

### CT-F03-02 — Exclusao de documento
| Campo | Valor |
|---|---|
| **ID** | CT-F03-02 |
| **Descricao** | CORRECAO OBS-15: Testar exclusao de documento — pode falhar |
| **Pre-condicoes** | CT-F03-01 executado; documentos na lista |
| **Acoes do ator e dados de entrada** | 1. Clicar no botao excluir do Doc 4 (Certidao Negativa Estadual). 2. Confirmar exclusao. |
| **Saida esperada** | Documento removido da lista. Se a exclusao NAO responder ou falhar silenciosamente, registrar como BUG CONFIRMADO (OBS-15 Arnaldo — PROCEDE: possivel bug de exclusao). |
| **Tipo** | Positivo |

### CT-F03-03 — Badge de cores funciona corretamente
| Campo | Valor |
|---|---|
| **ID** | CT-F03-03 |
| **Descricao** | CONFIRMACAO OBS-16: Verificar que sistema de badges por validade funciona |
| **Pre-condicoes** | CT-F03-01 executado |
| **Acoes do ator e dados de entrada** | 1. Observar badges dos 4 documentos na lista. |
| **Saida esperada** | Cores corretas: vencido=vermelho/amarelo, proximo a vencer=amarelo, valido=verde. OBS-16 Arnaldo CONFIRMOU que funciona. |
| **Tipo** | Positivo |

---

## [UC-F04] Gerir Certidoes Automaticas

### CT-F04-01 — Busca automatica e upload manual com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F04-01 |
| **Descricao** | Configurar frequencia, buscar certidoes e fazer upload manual da PGFN |
| **Pre-condicoes** | UC-F01 concluido (CNPJ 68.218.593/0001-09); CORRECAO OBS-17: fontes de certidao DEVEM estar inicializadas antes deste passo. |
| **Acoes do ator e dados de entrada** | 1. PREREQUISITO CRITICO (CORRECAO OBS-17): Acessar Cadastros > Empresa > Fontes de Certidoes e inicializar fontes padrao (clicar botao "Inicializar Fontes"), OU acessar endpoint `/api/fontes-certidoes/inicializar`. 2. Navegar para Certidoes. 3. Verificar CNPJ `68.218.593/0001-09` preenchido automaticamente. 4. Frequencia: `Quinzenal`. 5. Clicar Buscar Certidoes. 6. Aguardar resposta (CNPJ ficticio — busca pode nao retornar resultados reais). 7. Upload manual PGFN: Arquivo test_document.pdf, Validade `30/09/2026`, Numero `PGFN-2025-98765`. 8. Salvar. 9. Verificar/editar detalhes: Status `Upload manual`, Orgao `Procuradoria-Geral da Fazenda Nacional`. |
| **Saida esperada** | Frequencia Quinzenal configurada. Certidao PGFN com numero PGFN-2025-98765, validade 30/09/2026, orgao Procuradoria-Geral da Fazenda Nacional. |
| **Tipo** | Positivo |

### CT-F04-02 — Erro sem fontes de certidao inicializadas
| Campo | Valor |
|---|---|
| **ID** | CT-F04-02 |
| **Descricao** | CORRECAO OBS-17: Tentar buscar certidoes sem fontes inicializadas |
| **Pre-condicoes** | Fontes de certidao NAO inicializadas (passo de inicializacao pulado) |
| **Acoes do ator e dados de entrada** | 1. Navegar para Certidoes. 2. Clicar Buscar Certidoes. |
| **Saida esperada** | Mensagem: "Nenhuma fonte de certidao cadastrada. Acesse Cadastros > Empresa > Fontes de Certidoes para configurar." (ERRO CONFIRMADO por Arnaldo OBS-17 — PROCEDE). Tutorial DEVE incluir passo de inicializacao. |
| **Tipo** | Negativo |

---

## [UC-F05] Gerir Responsaveis da Empresa

### CT-F05-01 — Cadastrar 2 responsaveis (sem Preposto)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-01 |
| **Descricao** | Cadastrar Representante Legal e Responsavel Tecnico; sistema NAO exige Preposto |
| **Pre-condicoes** | UC-F01 concluido; secao Responsaveis acessivel. CORRECAO OBS-19: incluir CPFs ficticios. |
| **Acoes do ator e dados de entrada** | 1. Adicionar Responsavel: Tipo `Representante Legal`, Nome `Fernanda Lima Costa`, Cargo `Socia-Administradora`, Email `fernanda.costa@rp3x.com.br`, Telefone `(16) 99888-7766`, CPF `123.456.789-09` (CORRECAO OBS-19: CPF ficticio adicionado). Salvar. 2. Adicionar Responsavel: Tipo `Responsavel Tecnico`, Nome `Dr. Ricardo Alves Nunes`, Cargo `Farmaceutico-Bioquimico Responsavel`, Email `ricardo.nunes@rp3x.com.br`, Telefone `(16) 99777-5544`, CPF `987.654.321-00` (CORRECAO OBS-19: CPF ficticio adicionado). Salvar. |
| **Saida esperada** | 2 responsaveis listados: Fernanda (Representante Legal) e Dr. Ricardo (Responsavel Tecnico). Sistema NAO exige Preposto. Toast de sucesso. |
| **Tipo** | Positivo |

### CT-F05-02 — Verificar que CPF e opcional
| Campo | Valor |
|---|---|
| **ID** | CT-F05-02 |
| **Descricao** | CORRECAO OBS-19: Confirmar que campo CPF e opcional |
| **Pre-condicoes** | Modal de adicionar responsavel aberto |
| **Acoes do ator e dados de entrada** | 1. Tipo: `Preposto`. 2. Nome: `Teste Sem CPF`. 3. Cargo: `Assistente`. 4. Email: `teste@rp3x.com.br`. 5. CPF: (vazio). 6. Clicar Salvar. |
| **Saida esperada** | Sistema aceita salvamento sem CPF (nullable=True no modelo). Se exigir CPF, registrar como divergencia da especificacao. |
| **Tipo** | Limite |

### CT-F05-03 — Permissao de admin para criar responsavel
| Campo | Valor |
|---|---|
| **ID** | CT-F05-03 |
| **Descricao** | CORRECAO OBS-20: Verificar que valida2 (super+admin) pode criar responsaveis |
| **Pre-condicoes** | Usuario valida2 logado; empresa RP3X selecionada |
| **Acoes do ator e dados de entrada** | 1. Confirmar que valida2 esta logado e RP3X esta selecionada. 2. Tentar adicionar responsavel. |
| **Saida esperada** | Sistema permite criar responsavel (valida2 tem is_super=True e papel=admin). Se erro "apenas administradores", verificar: (a) empresa RP3X selecionada? (b) token JWT valido? (c) sessao expirada? OBS-20 Arnaldo NAO PROCEDE — provavel erro de operacao do validador. |
| **Tipo** | Positivo |

---

## [UC-F06] Listar e Filtrar Produtos do Portfolio

### CT-F06-01 — Filtrar por Area
| Campo | Valor |
|---|---|
| **ID** | CT-F06-01 |
| **Descricao** | Filtrar portfolio por area "Diagnostico in Vitro e Laboratorio" |
| **Pre-condicoes** | Produtos cadastrados via UC-F07 |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Filtrar Area: `Diagnostico in Vitro e Laboratorio`. |
| **Saida esperada** | Lista filtra para exibir apenas produtos da area selecionada. |
| **Tipo** | Positivo |

### CT-F06-02 — Busca por "reagente" — CORRECAO
| Campo | Valor |
|---|---|
| **ID** | CT-F06-02 |
| **Descricao** | CORRECAO OBS-21: Buscar por "reagente" — termo NAO existe no nome dos produtos |
| **Pre-condicoes** | Produtos cadastrados: "Kit para Glicose Enzimatica BioGlic-100" e "Kit Hemograma Sysmex XN" |
| **Acoes do ator e dados de entrada** | 1. Digitar `reagente` no campo de busca. 2. Observar resultado. |
| **Saida esperada** | Lista VAZIA — nenhum produto contem "reagente" no nome, fabricante ou modelo. CORRECAO DOCUMENTADA: O filtro busca APENAS em nome/fabricante/modelo (OBS-21 Arnaldo — PROCEDE). Os nomes dos produtos no seed NAO contem "reagente". Duplo problema: (1) filtro limitado, (2) seed nao alinha com termos do tutorial. |
| **Tipo** | Negativo |

### CT-F06-03 — Busca por "hematologia" — CORRECAO para "hemograma"
| Campo | Valor |
|---|---|
| **ID** | CT-F06-03 |
| **Descricao** | CORRECAO OBS-22: Tutorial original usava "hematologia", mas produto se chama "Kit Hemograma Sysmex XN" |
| **Pre-condicoes** | Produtos cadastrados no portfolio |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca. 2. Digitar `hemograma` (CORRECAO: usar "hemograma" em vez de "hematologia"). 3. Observar resultado. |
| **Saida esperada** | Produto "Kit Hemograma Sysmex XN" aparece na lista filtrada (nome contem "hemograma"). NOTA: Se buscar "hematologia" (termo original do tutorial), retorna VAZIO — nenhum produto tem "hematologia" no nome. |
| **Tipo** | Positivo |

### CT-F06-04 — Busca por "hematologia" (termo original) retorna vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F06-04 |
| **Descricao** | Documentar que busca pelo termo original "hematologia" nao encontra produtos |
| **Pre-condicoes** | Produtos cadastrados |
| **Acoes do ator e dados de entrada** | 1. Digitar `hematologia` no campo de busca. |
| **Saida esperada** | Lista VAZIA. Nenhum produto contem "hematologia" no nome/fabricante/modelo. CORRECAO OBS-22 Arnaldo — PROCEDE: tutorial deve usar "hemograma" ou seed deve renomear produto para incluir "hematologia". |
| **Tipo** | Negativo |

---

## [UC-F07] Cadastrar Produto por IA

### CT-F07-01 — Cadastrar Kit para Glicose Enzimatica BioGlic-100 via IA
| Campo | Valor |
|---|---|
| **ID** | CT-F07-01 |
| **Descricao** | Cadastrar produto principal da RP3X usando IA |
| **Pre-condicoes** | Usuario autenticado; internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Clicar Adicionar Produto. 3. Tipo de Documento: `Instrucoes de Uso / IFU`. 4. Arquivo: tests/fixtures/test_document.pdf. 5. Nome do Produto: `Kit para Glicose Enzimatica BioGlic-100`. 6. Area: `Diagnostico in Vitro e Laboratorio`. 7. Classe: `Reagentes Bioquimicos`. 8. Subclasse: `Reagente para Glicose`. 9. Clicar Processar/Analisar com IA. 10. Aguardar ate 60s. 11. Clicar Salvar. |
| **Saida esperada** | IA preenche campos automaticamente. Produto "Kit para Glicose Enzimatica BioGlic-100" aparece no portfolio. Toast de sucesso. |
| **Tipo** | Positivo |

### CT-F07-02 — Cadastrar Plano de Contas ERP sem nome
| Campo | Valor |
|---|---|
| **ID** | CT-F07-02 |
| **Descricao** | Cadastrar item do tipo Plano de Contas ERP sem preencher campo Nome |
| **Pre-condicoes** | Modulo de documentos/produtos aberto |
| **Acoes do ator e dados de entrada** | 1. Tipo: `Plano de Contas (ERP)`. 2. Arquivo: tests/fixtures/test_document.pdf. 3. Nome: (deixar em branco propositalmente). 4. Salvar. |
| **Saida esperada** | Sistema aceita salvar sem nome para tipo Plano de Contas ERP. Item aparece na lista identificado pelo tipo. |
| **Tipo** | Limite |

### CT-F07-03 — Timeout de processamento IA (> 90s)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-03 |
| **Descricao** | Verificar comportamento quando IA demora mais de 90 segundos |
| **Pre-condicoes** | Servidor IA com alta carga ou internet lenta |
| **Acoes do ator e dados de entrada** | 1. Iniciar processamento IA. 2. Aguardar mais de 90 segundos. |
| **Saida esperada** | Sistema deve exibir mensagem de timeout ou erro de conexao. NAO deve travar indefinidamente. |
| **Tipo** | Negativo |

---

## [UC-F08] Editar Produto do Portfolio

### CT-F08-01 — Edicao completa com 11 especificacoes tecnicas
| Campo | Valor |
|---|---|
| **ID** | CT-F08-01 |
| **Descricao** | Editar produto adicionando nome, fabricante, modelo, SKU, NCM, descricao e 11 specs |
| **Pre-condicoes** | UC-F07 concluido; produto "Kit para Glicose Enzimatica BioGlic-100" cadastrado |
| **Acoes do ator e dados de entrada** | 1. Abrir produto para edicao. 2. Nome: `Kit para Glicose Enzimatica BioGlic-100 Automacao`. 3. Fabricante: `Wiener Lab Group`. 4. Modelo: `BioGlic-100 Auto`. 5. SKU: `WL-BG100-AUTO-BR`. 6. NCM: `3822.19.90`. 7. Descricao: `Reagente enzimatico para dosagem de glicose em equipamentos automaticos; 100 determinacoes por kit`. 8. Area: `Diagnostico in Vitro e Laboratorio`. 9. Classe: `Reagentes Bioquimicos`. 10. Subclasse: `Reagente para Glicose`. 11. Especificacoes tecnicas (11 itens): Determinacoes=100 det/kit, Metodo=Enzimatico (GOD-PAP), Amostra=Soro plasma, Comprimento de Onda=505 nm, Linearidade=0-500 mg/dL, Temperatura=37C, Incubacao=5 minutos, Conservacao=2-8C, Validade do Kit=24 meses, Volume=10 uL, Registro ANVISA=10386890001. 12. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. Nome atualizado na lista. 11 especificacoes salvas. Caracteres especiais (uL, C) aceitos. |
| **Tipo** | Positivo |

### CT-F08-02 — Caracteres especiais em especificacoes
| Campo | Valor |
|---|---|
| **ID** | CT-F08-02 |
| **Descricao** | Verificar que especificacoes com caracteres especiais sao aceitas |
| **Pre-condicoes** | Formulario de edicao aberto |
| **Acoes do ator e dados de entrada** | 1. Adicionar especificacao: Volume = `10 uL` (micro litros). 2. Adicionar especificacao: Temperatura = `37C` (graus). 3. Salvar. |
| **Saida esperada** | Especificacoes salvas com caracteres especiais intactos. |
| **Tipo** | Limite |

---

## [UC-F09] Reprocessar IA no Produto

### CT-F09-01 — Reprocessamento preserva dados manuais
| Campo | Valor |
|---|---|
| **ID** | CT-F09-01 |
| **Descricao** | Reprocessar IA e confirmar que dados inseridos manualmente NAO sao apagados |
| **Pre-condicoes** | UC-F08 concluido; produto com 11 specs e dados completos |
| **Acoes do ator e dados de entrada** | 1. Abrir produto "Kit para Glicose Enzimatica BioGlic-100 Automacao". 2. Clicar Reprocessar IA. 3. Aguardar ate 60s. 4. Verificar que nome, fabricante, 11 specs continuam intactos. |
| **Saida esperada** | Toast de conclusao. Dados manuais preservados. IA pode ter complementado campos vazios mas NAO apagou dados existentes. |
| **Tipo** | Positivo |

---

## [UC-F10] Busca ANVISA e Busca Web

### CT-F10-01 — Busca ANVISA por numero de registro
| Campo | Valor |
|---|---|
| **ID** | CT-F10-01 |
| **Descricao** | Buscar na ANVISA usando registro do produto RP3X |
| **Pre-condicoes** | Registro ANVISA `10386890001` preenchido (UC-F08); internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Abrir detalhe/pesquisa do produto. 2. Numero ANVISA: `10386890001`. 3. Nome: `Kit Glicose BioGlic`. 4. Clicar Buscar ANVISA. 5. Aguardar ate 30s. |
| **Saida esperada** | Busca executa sem travar. Resultado exibido (dados da ANVISA ou mensagem de "nao encontrado" — registro pode ser ficticio). |
| **Tipo** | Positivo |

### CT-F10-02 — Busca Web por produto similar
| Campo | Valor |
|---|---|
| **ID** | CT-F10-02 |
| **Descricao** | Buscar informacoes na web sobre produto de hematologia |
| **Pre-condicoes** | Internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Nome para Busca Web: `Kit de Reagentes para Hemograma Completo Sysmex`. 2. Fabricante: `Sysmex`. 3. Clicar Buscar na Web. 4. Aguardar ate 30s. |
| **Saida esperada** | Resultados web exibidos contendo referencia a Sysmex. Busca nao trava o sistema. |
| **Tipo** | Positivo |

---

## [UC-F11] Verificar Completude do Produto

### CT-F11-01 — Completude em AMARELO (65-80%)
| Campo | Valor |
|---|---|
| **ID** | CT-F11-01 |
| **Descricao** | Verificar que produto RP3X tem score intermediario (amarelo, nao verde) |
| **Pre-condicoes** | UC-F08 concluido; produto com dados completos mas nao 100% |
| **Acoes do ator e dados de entrada** | 1. Abrir completude do produto "Kit para Glicose Enzimatica BioGlic-100 Automacao". 2. Observar score geral e cor do badge. |
| **Saida esperada** | Score Geral entre 65% e 80%. Badge AMARELO (intermediario). NAO verde (> 80%) e NAO vermelho (< 65%). Este resultado e correto e intencional para o conjunto de dados da RP3X. |
| **Tipo** | Positivo |

---

## [UC-F12] Visualizar Metadados de Captacao

### CT-F12-01 — Inserir CATMAT e termos de busca da RP3X
| Campo | Valor |
|---|---|
| **ID** | CT-F12-01 |
| **Descricao** | Adicionar codigos CATMAT e 4 termos de captacao |
| **Pre-condicoes** | UC-F08 concluido |
| **Acoes do ator e dados de entrada** | 1. Abrir metadados do produto. 2. CATMAT: `256, 258`. 3. Termo 1: `reagente glicose`. 4. Termo 2: `kit glicose`. 5. Termo 3: `kit bioquimico`. 6. Termo 4: `reagente laboratorio`. 7. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. CATMAT 256 e 258 salvos. 4 termos de busca listados. |
| **Tipo** | Positivo |

### CT-F12-02 — Termos com multiplas palavras
| Campo | Valor |
|---|---|
| **ID** | CT-F12-02 |
| **Descricao** | Verificar que termos com mais de uma palavra sao aceitos |
| **Pre-condicoes** | Modal de metadados aberto |
| **Acoes do ator e dados de entrada** | 1. Adicionar termo: `reagente laboratorio` (2 palavras). 2. Salvar. |
| **Saida esperada** | Termo com multiplas palavras aceito e salvo corretamente. |
| **Tipo** | Limite |

---

## [UC-F13] Gerir Classificacao Area/Classe/Subclasse

### CT-F13-01 — Expandir hierarquia Diagnostico in Vitro
| Campo | Valor |
|---|---|
| **ID** | CT-F13-01 |
| **Descricao** | Navegar e expandir arvore de classificacao para verificar subclasses |
| **Pre-condicoes** | Pagina de classificacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Navegar para Parametrizacao > Classificacao. 2. Expandir area: `Diagnostico in Vitro e Laboratorio`. 3. Expandir classe: `Reagentes Bioquimicos`. 4. Verificar subclasse: `Reagente para Glicose`. 5. Expandir classe: `Reagentes e Kits Diagnosticos`. 6. Verificar subclasse: `Kit de Hematologia`. |
| **Saida esperada** | Hierarquia completa visivel: Area > Diagnostico in Vitro e Laboratorio > Reagentes Bioquimicos > Reagente para Glicose. Tambem: > Reagentes e Kits Diagnosticos > Kit de Hematologia. NCM 3822.19.90 associado. |
| **Tipo** | Positivo |

### CT-F13-02 — Arvore nao expande (erro)
| Campo | Valor |
|---|---|
| **ID** | CT-F13-02 |
| **Descricao** | Verificar comportamento se area nao tiver classes cadastradas |
| **Pre-condicoes** | Area sem classes filhas |
| **Acoes do ator e dados de entrada** | 1. Tentar expandir area vazia. |
| **Saida esperada** | Mensagem "nenhuma classe cadastrada" ou area nao expande sem erro. |
| **Tipo** | Negativo |

---

## [UC-F14] Configurar Pesos e Limiares de Score

### CT-F14-01 — Subcenario A: Soma invalida (1.05) REJEITADA
| Campo | Valor |
|---|---|
| **ID** | CT-F14-01 |
| **Descricao** | Testar que sistema bloqueia pesos com soma 1.05 |
| **Pre-condicoes** | Pagina Parametrizacao, secao Pesos e Limiares |
| **Acoes do ator e dados de entrada** | 1. Tecnico: `0.30`. 2. Documental: `0.25`. 3. Complexidade: `0.10`. 4. Juridico: `0.20`. 5. Logistico: `0.10`. 6. Comercial: `0.10`. 7. Soma = 1.05. 8. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro: soma dos pesos nao e 1.00. Sistema NAO salva. Botao Salvar pode estar desabilitado. Este e o comportamento CORRETO — o sistema deve rejeitar. |
| **Tipo** | Negativo |

### CT-F14-02 — Subcenario B: Soma correta (1.00) com limiares salvos
| Campo | Valor |
|---|---|
| **ID** | CT-F14-02 |
| **Descricao** | Corrigir pesos para soma 1.00 e preencher limiares GO/NO-GO |
| **Pre-condicoes** | CT-F14-01 executado; formulario ainda aberto |
| **Acoes do ator e dados de entrada** | 1. Alterar Complexidade de 0.10 para `0.05` (soma = 1.00). 2. Score Final GO: `0.75`. 3. Score Final NO-GO: `0.45`. 4. Tecnico GO: `0.70`. 5. Tecnico NO-GO: `0.40`. 6. Juridico GO: `0.85`. 7. Juridico NO-GO: `0.55`. 8. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. Pesos salvos: Tecnico 0.30, Documental 0.25, Complexidade 0.05, Juridico 0.20, Logistico 0.10, Comercial 0.10. Limiares: Final GO >= 0.75 / NO-GO <= 0.45; Tecnico GO >= 0.70 / NO-GO <= 0.40; Juridico GO >= 0.85 / NO-GO <= 0.55. |
| **Tipo** | Positivo |

### CT-F14-03 — Pesos com soma < 1.00 tambem rejeitados
| Campo | Valor |
|---|---|
| **ID** | CT-F14-03 |
| **Descricao** | Testar que soma < 1.00 tambem e bloqueada |
| **Pre-condicoes** | Secao Pesos aberta |
| **Acoes do ator e dados de entrada** | 1. Tecnico: `0.20`. 2. Documental: `0.20`. 3. Complexidade: `0.05`. 4. Juridico: `0.15`. 5. Logistico: `0.10`. 6. Comercial: `0.10`. 7. Soma = 0.80. 8. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro: soma dos pesos nao e 1.00. Sistema NAO salva. |
| **Tipo** | Negativo |

---

## [UC-F15] Configurar Parametros Comerciais

### CT-F15-01 — "Todo o Brasil" marcado com dados completos
| Campo | Valor |
|---|---|
| **ID** | CT-F15-01 |
| **Descricao** | Marcar "Atuar em todo o Brasil" e preencher parametros comerciais da RP3X |
| **Pre-condicoes** | Pagina Parametrizacao, secao Parametros Comerciais |
| **Acoes do ator e dados de entrada** | 1. Marcar checkbox "Atuar em todo o Brasil" (NAO selecionar estados individuais). 2. Prazo de Entrega: `15` dias. 3. Frequencia de Busca: `Quinzenal`. 4. TAM: `4200000000` (R$ 4.200.000.000,00). 5. SAM: `950000000` (R$ 950.000.000,00). 6. SOM: `62000000` (R$ 62.000.000,00). 7. Markup: `35`%. 8. Custos Fixos: `42000`. 9. Frete: `180`. 10. Modalidades: Pregao Eletronico, Dispensa de Licitacao, Inexigibilidade. 11. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. "Todo o Brasil" marcado. Valores financeiros grandes aceitos sem truncamento. 3 modalidades selecionadas. Dados persistem. |
| **Tipo** | Positivo |

### CT-F15-02 — Valores financeiros grandes nao truncados
| Campo | Valor |
|---|---|
| **ID** | CT-F15-02 |
| **Descricao** | Verificar que TAM em bilhoes e aceito sem truncamento |
| **Pre-condicoes** | CT-F15-01 executado |
| **Acoes do ator e dados de entrada** | 1. Recarregar pagina (F5). 2. Verificar valor TAM. |
| **Saida esperada** | TAM exibe `4200000000` (ou formatado como R$ 4.200.000.000,00). Sem truncamento. |
| **Tipo** | Limite |

---

## [UC-F16] Gerir Fontes de Busca e Palavras-Chave

### CT-F16-01 — Desativar ComprasNet, inserir 10 keywords e 5 NCMs
| Campo | Valor |
|---|---|
| **ID** | CT-F16-01 |
| **Descricao** | Desativar ComprasNet, inserir palavras-chave e NCMs da RP3X |
| **Pre-condicoes** | Pagina Parametrizacao, secao Fontes de Busca |
| **Acoes do ator e dados de entrada** | 1. Desativar toggle ComprasNet. 2. Verificar status inativo. 3. (Opcional) Reativar ComprasNet. 4. Keywords (10): `reagente hematologia, kit diagnostico, reagente bioquimico, controle qualidade laboratorio, glicose enzimatica, hemograma completo, kit elisa, reagente pcr, kit sorologia, medio lote reagente`. 5. NCMs (5): `3822.19.90, 3822.90.90, 3002.12.10, 3002.90.99, 3006.50.00`. 6. Clicar Salvar. |
| **Saida esperada** | Toggle ComprasNet funciona (desativa/reativa). 10 keywords salvas. 5 NCMs salvos com formato xxxx.xx.xx. Toast de sucesso. |
| **Tipo** | Positivo |

### CT-F16-02 — Limite de keywords
| Campo | Valor |
|---|---|
| **ID** | CT-F16-02 |
| **Descricao** | Verificar que sistema aceita 10 ou mais palavras-chave |
| **Pre-condicoes** | CT-F16-01 executado |
| **Acoes do ator e dados de entrada** | 1. Verificar que as 10 keywords do CT-F16-01 estao salvas. |
| **Saida esperada** | 10 keywords visíveis e salvas. Sem limite artificial de quantidade. |
| **Tipo** | Limite |

---

## [UC-F17] Configurar Notificacoes e Preferencias

### CT-F17-01 — Configurar 3 canais ativos, frequencia semanal, tema claro
| Campo | Valor |
|---|---|
| **ID** | CT-F17-01 |
| **Descricao** | Configurar notificacoes e preferencias completas da RP3X |
| **Pre-condicoes** | Email `licitacoes@rp3x.com.br` cadastrado (UC-F02) |
| **Acoes do ator e dados de entrada** | 1. Email de notificacao: `licitacoes@rp3x.com.br`. 2. Ativar canal Email. 3. Ativar canal Sistema. 4. Ativar canal SMS. 5. Frequencia: `Semanal`. 6. Tema: `Claro`. 7. Idioma: `pt-BR`. 8. Fuso Horario: `America/Sao_Paulo`. 9. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. 3 canais ativos (Email, Sistema, SMS). Frequencia Semanal. Tema Claro. Idioma pt-BR. Fuso America/Sao_Paulo. |
| **Tipo** | Positivo |

### CT-F17-02 — Canal SMS disponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F17-02 |
| **Descricao** | Verificar que canal SMS existe e pode ser ativado |
| **Pre-condicoes** | Secao Preferencias aberta |
| **Acoes do ator e dados de entrada** | 1. Procurar checkbox/toggle SMS. 2. Tentar ativar. |
| **Saida esperada** | Canal SMS existe na interface e pode ser ativado. Se NAO existir, registrar como limitacao do sistema. |
| **Tipo** | Limite |

---

## Resumo de Cobertura

| UC | Positivo | Negativo | Limite | Total |
|---|---|---|---|---|
| UC-F01 | 2 | 1 | 3 | 6 |
| UC-F02 | 1 | 0 | 2 | 3 |
| UC-F03 | 2 | 0 | 0 (*) | 3 (**) |
| UC-F04 | 1 | 1 | 0 | 2 |
| UC-F05 | 2 | 0 | 1 | 3 |
| UC-F06 | 2 | 2 | 0 | 4 |
| UC-F07 | 1 | 1 | 1 | 3 |
| UC-F08 | 1 | 0 | 1 | 2 |
| UC-F09 | 1 | 0 | 0 | 1 |
| UC-F10 | 2 | 0 | 0 | 2 |
| UC-F11 | 1 | 0 | 0 | 1 |
| UC-F12 | 1 | 0 | 1 | 2 |
| UC-F13 | 1 | 1 | 0 | 2 |
| UC-F14 | 1 | 2 | 0 | 3 |
| UC-F15 | 1 | 0 | 1 | 2 |
| UC-F16 | 1 | 0 | 1 | 2 |
| UC-F17 | 1 | 0 | 1 | 2 |
| **TOTAL** | **22** | **8** | **12** | **42** |

(**) CT-F03-03 e do tipo Positivo mas valida OBS-16 confirmado.

---

## Correcoes de Arnaldo Incorporadas

| OBS | UC | Correcao Aplicada nos Testes |
|---|---|---|
| OBS-01 | Geral | CT-F01-01 pre-condicao: navegar via Configuracoes > Empresa |
| OBS-04 | Geral | CT-F01-01 pre-condicao: menciona caminho Configuracoes > Selecionar Empresa |
| OBS-05 | UC-F01 | CT-F01-06: teste documenta duplicidade Cadastros vs Configuracoes |
| OBS-07 | UC-F01 | CT-F01-02: teste especifico para verificar UF como dropdown |
| OBS-09 | UC-F01 | CT-F01-03: teste especifico para verificar toast de sucesso |
| OBS-10 | UC-F02 | CT-F02-02: teste verifica mascara de telefone |
| OBS-12 | UC-F02 | CT-F02-03: teste verifica se Area Padrao tem opcoes |
| OBS-15 | UC-F03 | CT-F03-02: teste de exclusao menciona possivel bug |
| OBS-16 | UC-F03 | CT-F03-03: teste confirma que badges funcionam |
| OBS-17 | UC-F04 | CT-F04-01: prerequisito CRITICO de inicializar fontes; CT-F04-02: teste do erro |
| OBS-19 | UC-F05 | CT-F05-01: CPFs ficticios adicionados (123.456.789-09 e 987.654.321-00) |
| OBS-20 | UC-F05 | CT-F05-03: teste confirma que valida2 tem permissao (NAO PROCEDE) |
| OBS-21 | UC-F06 | CT-F06-02: documenta que "reagente" retorna vazio (filtro limitado a nome/fabricante/modelo) |
| OBS-22 | UC-F06 | CT-F06-03: CORRIGIDO para buscar "hemograma" em vez de "hematologia"; CT-F06-04: documenta resultado vazio para "hematologia" |

---

## Notas Importantes

1. **Inicializacao de fontes de certidao (OBS-17):** CRITICO. Antes de executar UC-F04, o validador DEVE inicializar as fontes de certidao. Sem isso, o sistema retorna erro "Nenhuma fonte de certidao cadastrada". O passo de inicializacao NAO estava no tutorial original.

2. **Termos de busca UC-F06 (OBS-21/22):** O filtro busca APENAS em nome/fabricante/modelo. Os produtos no seed da RP3X sao "Kit Glicose Wiener BioGlic-100" e "Kit Hemograma Sysmex XN". Nenhum contem "reagente" ou "hematologia" nesses campos. Tutorial corrigido para usar "hemograma" (que existe no nome).

3. **CPFs ficticios (OBS-19):** Adicionados 123.456.789-09 (Fernanda) e 987.654.321-00 (Dr. Ricardo). Campo CPF e opcional (nullable=True), mas tutorial agora fornece valores para completude.

4. **UF como dropdown (OBS-07):** Se o campo UF for TextInput em vez de SelectInput, registrar como bug confirmado. A correcao esta pendente no codigo (EmpresaPage.tsx linha 993).

5. **Toast de salvamento (OBS-09):** Se nenhum toast aparecer apos salvar, registrar como bug confirmado. A funcao handleSave() em EmpresaPage.tsx (linhas 352-384) nao implementa mensagem de sucesso.

6. **Validadores RN em modo warn-only:** Por padrao, ENFORCE_RN_VALIDATORS=false. Os testes negativos podem passar se o modo warn-only estiver ativo. Nesse caso, documentar que o validador emitiu warning sem impedir salvamento.

7. **Ordem de execucao para Conjunto 2:** UC-F01 > F02 > F03 > F04 > F05 > F14 (subcenario A + B) > F15 > F16 > F17 > F07 > F08 > F13 > F06 > F09 > F10 > F11 > F12.
