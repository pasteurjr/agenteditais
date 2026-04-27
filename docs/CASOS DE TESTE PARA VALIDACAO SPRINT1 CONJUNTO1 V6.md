# CASOS DE TESTE PARA VALIDACAO — Sprint 1 — Conjunto 1 — **V6**

**Data:** 2026-04-27
**Versao:** 6.0
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Usuario padrao:** valida1@valida.com.br / 123456 (super, com empresa CH ja vinculada)
**Usuario alternativo (FA-07):** valida<N>@valida.com.br (super, SEM vinculos em `usuario_empresa`)
**Referencia:** tutorialsprint1-1.md, **CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V6.md**
**Total de UCs:** 17 (UC-F01 a UC-F17)

**Novidade V6 (27/04/2026):** Adicionados 5 novos casos de teste pro UC-F01 cobrindo o **FA-07 — Super sem empresa vinculada (primeiro acesso ou ambiente recem-instalado)**:
- CT-F01-FA07-A — Super clica `[Botão: "Criar Nova Empresa"]` -> CRUD `crud:empresas` -> preenche TODOS os campos do CRUD e salva
- CT-F01-FA07-B — Super clica `[Botão: "Vincular Empresa a Usuário"]` -> redireciona para `AssociarEmpresaUsuario` existente
- CT-F01-FA07-C — Super clica `[Botão: "Entrar no Sistema"]` com empresas existentes -> redireciona para `SelecionarEmpresaPage`
- CT-F01-FA07-D — Super em banco vazio: botao "Entrar no Sistema" desabilitado, super deve usar "Criar Nova Empresa"
- CT-F01-FA07-E — Tela "Sem Empresa Vinculada" para usuario comum (so botao Sair)

**Importante sobre campos de empresa (V6 esclarecimento):** o CRUD generico de Empresas (`crud:empresas`) tem CNPJ, Razao Social, Nome Fantasia, Inscricao Estadual, Inscricao Municipal, Regime Tributario, Porte, Endereco, Cidade, UF, CEP, Telefone, Email, Areas de Atuacao e Ativo. **NAO** tem Website, Instagram, LinkedIn e Facebook — esses campos so existem na `EmpresaPage` (UC-F01 fluxo principal). Por isso o cenario completo do UC-F01 com criacao via FA-07.A tem dois passos de preenchimento: tudo basico no CRUD + redes sociais na EmpresaPage.

Tambem adicionada **Pre-condicao alternativa** no UC-F01: super sem vinculos passa pelo FA-07 antes do fluxo principal. Este cenario corresponde ao ciclo da trilha de validacao automatica visual com `valida<N>@valida.com.br` provisionado pela Fase 0 sem vinculos previos.

---

## Convencao de IDs

- **CT-F{UC}-{numero}** — ex: CT-F01-01 = primeiro caso de teste do UC-F01
- **Tipo:** Positivo (fluxo principal), Negativo (fluxo de excecao/erro), Limite (valor de fronteira)

---

## [UC-F01] Manter Cadastro Principal da Empresa

### Casos de teste do FA-07 (V6) — Super sem empresa vinculada

> **Pre-condicao comum a CT-F01-FA07-***: usuario super sem nenhum vinculo ativo em `usuario_empresa`. Para validacao, usar `valida4@valida.com.br` ou `valida5@valida.com.br` apos limpar vinculos previos via `DELETE FROM usuario_empresa WHERE user_id = (SELECT id FROM users WHERE email = '<email>')`.

#### CT-F01-FA07-A — Super clica "Criar Nova Empresa" e preenche todos os campos no CRUD
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA07-A |
| **Descricao** | Super sem empresa vinculada eh redirecionado para o CRUD generico de Empresas ao clicar em "Criar Nova Empresa" e preenche todos os campos disponiveis no CRUD |
| **Pre-condicoes** | Usuario super logado, sem vinculos em `usuario_empresa`. Sistema exibiu `[Página: "Sem Empresa Vinculada"]` |
| **Acoes do ator e dados de entrada** | 1. Observar que tela "Você não tem empresas vinculadas" esta visivel com 3 botoes. 2. Clicar `[Botão: "➕ Criar Nova Empresa"]`. 3. Sistema entra no shell autenticado e renderiza `[Página: "Cadastros > Empresa"]` (CRUD generico). 4. Clicar `[Botão: "Novo"]` no CRUD. 5. Preencher TODOS os campos do CRUD: CNPJ `56.700.252/4415-59`, Razao Social `DEMO 002 Comércio e Representações Ltda`, Nome Fantasia `DEMO Comércio`, Inscricao Estadual `111.222.333.444`, Inscricao Municipal `12345-6`, Regime Tributario `simples`, Porte `me`, Endereco `Av. da Validação, 1000`, Cidade `São Paulo`, UF `SP`, CEP `01000-000`, Telefone `(11) 4000-0000`, Email `contato@demo.com.br`. 6. Clicar `[Botão: "Salvar"]`. |
| **Saida esperada** | Tela "Sem Empresa Vinculada" desaparece apos clique. CRUD de empresas eh exibido com header "Empresas". Apos salvar, `POST /api/crud/empresas` retorna 200/201 com todos os campos persistidos. Novo registro aparece na listagem com CNPJ formatado `56.700.252/4415-59`. Empresa criada eh visivel em `GET /api/auth/minhas-empresas` (campo `empresas` para super) apos refresh. **NOTA:** os campos de redes sociais (Website, Instagram, LinkedIn, Facebook) NAO existem no CRUD generico — sao preenchidos depois na EmpresaPage (CT-F01-01). |
| **Tipo** | Positivo |

#### CT-F01-FA07-B — Super clica "Vincular Empresa a Usuário"
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA07-B |
| **Descricao** | Super sem empresa vinculada eh redirecionado para a pagina existente de Associar Empresa/Usuario |
| **Pre-condicoes** | Usuario super logado, sem vinculos em `usuario_empresa`. Sistema exibiu `[Página: "Sem Empresa Vinculada"]`. Existe pelo menos 1 empresa no banco para vincular. |
| **Acoes do ator e dados de entrada** | 1. Clicar `[Botão: "🔗 Vincular Empresa a Usuário"]`. 2. Sistema entra no shell e renderiza `[Página: "Associar Empresa/Usuario"]` em `/app/admin/associar-empresa`. 3. Selecionar usuario logado. 4. Selecionar empresa-alvo. 5. Selecionar papel `admin`. 6. Clicar `[Botão: "Vincular"]`. |
| **Saida esperada** | Pagina existente AssociarEmpresaUsuario eh exibida com selects de usuario, empresa e papel. Apos vincular, sistema chama `POST /api/admin/associar-empresa` retornando 200. Vinculo aparece em `GET /api/auth/minhas-empresas` (campo `vinculadas`). |
| **Tipo** | Positivo |

#### CT-F01-FA07-C — Super clica "Entrar no Sistema" com empresas existentes
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA07-C |
| **Descricao** | Super sem vinculos consegue entrar no sistema selecionando uma das empresas existentes (super ve todas) |
| **Pre-condicoes** | Usuario super logado, sem vinculos em `usuario_empresa`. Existe pelo menos 1 empresa no banco. Sistema exibiu `[Página: "Sem Empresa Vinculada"]`. Botao "Entrar no Sistema" mostra `(N empresas disponíveis)`. |
| **Acoes do ator e dados de entrada** | 1. Verificar que botao "Entrar no Sistema" esta habilitado e mostra contagem `(N empresas disponíveis)`. 2. Clicar `[Botão: "▶️ Entrar no Sistema"]`. 3. Sistema renderiza `SelecionarEmpresaPage` com cards de todas as empresas do banco. 4. Clicar em uma das empresas. |
| **Saida esperada** | SelecionarEmpresaPage existente eh exibida. Apos selecionar empresa, sistema chama `POST /api/auth/switch-empresa`, recebe 200, persiste empresa em localStorage, redireciona para Dashboard. Top bar exibe nome da empresa selecionada. |
| **Tipo** | Positivo |

#### CT-F01-FA07-D — Super clica "Entrar no Sistema" com banco vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA07-D |
| **Descricao** | Botao "Entrar no Sistema" deve estar desabilitado quando nao ha nenhuma empresa no banco |
| **Pre-condicoes** | Usuario super logado, sem vinculos em `usuario_empresa`. Banco sem nenhuma empresa ativa (`SELECT COUNT(*) FROM empresas WHERE ativo=true = 0`). Sistema exibiu `[Página: "Sem Empresa Vinculada"]`. |
| **Acoes do ator e dados de entrada** | 1. Inspecionar botao "Entrar no Sistema". 2. Verificar texto e estado disabled. 3. Tentar clicar (nada deve acontecer). 4. Clicar `[Botão: "Criar Nova Empresa"]` em vez disso. |
| **Saida esperada** | Botao deve mostrar `(banco vazio)` em vez de contagem de empresas. Atributo `disabled=true`, cursor `not-allowed`, fundo cinza. Click nao tem efeito. Apenas opcoes "Criar Nova Empresa" e "Vincular" estao acessiveis (Vincular tambem inutil sem empresas). |
| **Tipo** | Limite |

#### CT-F01-FA07-E — Tela "Sem Empresa Vinculada" para usuario comum
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA07-E |
| **Descricao** | Usuario comum (NAO super) sem vinculos deve ver mensagem de erro com botao Sair, sem as 3 opcoes do super |
| **Pre-condicoes** | Usuario logado com `users.super=false` e sem vinculos em `usuario_empresa` |
| **Acoes do ator e dados de entrada** | 1. Apos login, observar tela exibida. |
| **Saida esperada** | Tela exibe "Sem empresa vinculada" + texto "Seu usuário ainda não foi alocado a nenhuma empresa. Entre em contato com o administrador do sistema." + apenas `[Botão: "Sair"]`. NAO devem aparecer os 3 botoes do super. |
| **Tipo** | Negativo |

---

### Casos de teste do fluxo principal e variacoes existentes (V5+)

### CT-F01-01 — Preenchimento completo e salvamento com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F01-01 |
| **Descricao** | Preencher todos os campos do cadastro principal e salvar com sucesso |
| **Pre-condicoes** | Usuario logado como valida1@valida.com.br, empresa CH Hospitalar selecionada |
| **Acoes do ator e dados de entrada** | 1. Navegar para Configuracoes > Empresa. 2. Preencher Razao Social: `CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.`. 3. Nome Fantasia: `CH Hospitalar`. 4. CNPJ: `43.712.232/0001-85`. 5. Inscricao Estadual: `123.456.789.000`. 6. Website: `https://www.chhospitalar.com.br`. 7. Instagram: `@chhospitalar`. 8. LinkedIn: `ch-hospitalar-equipamentos`. 9. Facebook: `CH HospitalarHospitalar`. 10. Endereco: `Av. das Industrias, 2500, Bloco B, Sala 301`. 11. Cidade: `Sao Paulo`. 12. UF: `SP`. 13. CEP: `04766-000`. 14. Clicar Salvar Alteracoes. |
| **Saida esperada** | Toast verde "Dados salvos com sucesso" visivel. Todos os campos persistem com os valores digitados. CNPJ exibido com mascara 43.712.232/0001-85. |
| **Tipo** | Positivo |

### CT-F01-02 — CNPJ com formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F01-02 |
| **Descricao** | Tentar salvar empresa com CNPJ em formato invalido (menos digitos) |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | 1. Preencher CNPJ: `43.712.232/0001-8` (14 digitos, faltando 1). 2. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro de validacao RN-028 indicando CNPJ invalido. Sistema NAO salva. |
| **Tipo** | Negativo |

### CT-F01-03 — UF como dropdown com selecao valida
| Campo | Valor |
|---|---|
| **ID** | CT-F01-03 |
| **Descricao** | Verificar que o campo UF e um dropdown com lista dos 27 estados brasileiros |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | 1. Clicar no campo UF. 2. Observar se e dropdown ou texto livre. 3. Selecionar `SP`. |
| **Saida esperada** | Campo UF deve ser um SelectInput (dropdown) com 27 opcoes de UF. Valor `SP` selecionado corretamente. NOTA: Se o campo for texto livre, registrar como bug (OBS-07 Arnaldo). |
| **Tipo** | Limite |

### CT-F01-04 — Salvar sem Razao Social (campo obrigatorio)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-04 |
| **Descricao** | Tentar salvar empresa sem preencher Razao Social |
| **Pre-condicoes** | Pagina EmpresaPage aberta, campo Razao Social vazio |
| **Acoes do ator e dados de entrada** | 1. Limpar campo Razao Social. 2. Preencher CNPJ: `43.712.232/0001-85`. 3. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro indicando que Razao Social e obrigatoria. Sistema NAO salva. |
| **Tipo** | Negativo |

### CT-F01-05 — Verificar persistencia apos reload
| Campo | Valor |
|---|---|
| **ID** | CT-F01-05 |
| **Descricao** | Apos salvar com sucesso, recarregar a pagina e confirmar que os dados persistiram |
| **Pre-condicoes** | CT-F01-01 executado com sucesso |
| **Acoes do ator e dados de entrada** | 1. Recarregar a pagina (F5). 2. Verificar que todos os campos mantem os valores salvos. |
| **Saida esperada** | Razao Social, CNPJ, Nome Fantasia, Inscricao Estadual, Website, redes sociais, endereco — todos com os valores originais. |
| **Tipo** | Positivo |

---

## [UC-F02] Gerir Contatos e Area Padrao

### CT-F02-01 — Adicionar emails, telefones e area padrao com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F02-01 |
| **Descricao** | Cadastrar 3 emails, 2 telefones e selecionar area padrao |
| **Pre-condicoes** | UC-F01 concluido; pagina EmpresaPage aberta na secao Contatos |
| **Acoes do ator e dados de entrada** | 1. Email 1: `licitacoes@chhospitalar.com.br`. 2. Clicar Adicionar Email. 3. Email 2: `comercial@chhospitalar.com.br`. 4. Clicar Adicionar Email. 5. Email 3: `fiscal@chhospitalar.com.br`. 6. Telefone 1: `(11) 3456-7890`. 7. Clicar Adicionar Telefone. 8. Telefone 2: `(11) 98765-4321`. 9. Selecionar Area Padrao: `Equipamentos Medico-Hospitalares`. 10. Clicar Salvar Alteracoes. |
| **Saida esperada** | Toast de sucesso. 3 emails e 2 telefones visiveis na lista. Area Padrao exibe `Equipamentos Medico-Hospitalares`. |
| **Tipo** | Positivo |

### CT-F02-02 — Email com formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F02-02 |
| **Descricao** | Tentar adicionar email com formato invalido |
| **Pre-condicoes** | Secao Contatos visivel |
| **Acoes do ator e dados de entrada** | 1. Preencher campo Email: `licitacoes@@chhospitalar`. 2. Clicar Adicionar Email ou Salvar. |
| **Saida esperada** | Validacao RN-042 rejeita email invalido. Mensagem de erro exibida. |
| **Tipo** | Negativo |

### CT-F02-03 — Area Padrao vazia — lista depende de areas cadastradas
| Campo | Valor |
|---|---|
| **ID** | CT-F02-03 |
| **Descricao** | Verificar que o dropdown de Area Padrao possui opcoes disponiveis |
| **Pre-condicoes** | Secao Contatos visivel |
| **Acoes do ator e dados de entrada** | 1. Clicar no dropdown de Area Padrao. 2. Observar se existem opcoes. |
| **Saida esperada** | Dropdown deve conter opcoes carregadas de /api/areas-produto. Se vazio, registrar como dependencia de UC-F13 (areas precisam existir antes). |
| **Tipo** | Limite |

---

## [UC-F03] Upload de Documentos da Empresa

### CT-F03-01 — Upload de 3 documentos com badges de validade corretos
| Campo | Valor |
|---|---|
| **ID** | CT-F03-01 |
| **Descricao** | Cadastrar 3 documentos com datas de validade diferentes e verificar badges |
| **Pre-condicoes** | UC-F01 concluido; arquivo tests/fixtures/test_document.pdf disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar Adicionar Documento. 2. Tipo: `Certidao / Comprovante de CNPJ`, Arquivo: test_document.pdf, Validade: `2026-12-31`. Salvar. 3. Clicar Adicionar Documento. 4. Tipo: `Contrato Social / Estatuto`, Arquivo: test_document.pdf, Validade: (em branco). Salvar. 5. Clicar Adicionar Documento. 6. Tipo: `Alvara de Funcionamento`, Arquivo: test_document.pdf, Validade: `2025-12-31`. Salvar. |
| **Saida esperada** | 3 documentos na lista. Doc 1 (2026-12-31): badge VERDE (OK). Doc 2 (sem validade): badge VERDE (OK). Doc 3 (2025-12-31): badge AMARELO ou VERMELHO (vencido em relacao a data atual 01/04/2026). |
| **Tipo** | Positivo |

### CT-F03-02 — Upload sem selecionar arquivo
| Campo | Valor |
|---|---|
| **ID** | CT-F03-02 |
| **Descricao** | Tentar salvar documento sem anexar arquivo |
| **Pre-condicoes** | Modal de adicionar documento aberto |
| **Acoes do ator e dados de entrada** | 1. Selecionar tipo: `Alvara de Funcionamento`. 2. NAO selecionar arquivo. 3. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro indicando que arquivo e obrigatorio. Sistema NAO salva. |
| **Tipo** | Negativo |

### CT-F03-03 — Exclusao de documento
| Campo | Valor |
|---|---|
| **ID** | CT-F03-03 |
| **Descricao** | Excluir um documento ja cadastrado e verificar que desaparece da lista |
| **Pre-condicoes** | CT-F03-01 executado com pelo menos 1 documento na lista |
| **Acoes do ator e dados de entrada** | 1. Clicar no botao de excluir (icone lixeira) do Doc 3 (Alvara de Funcionamento). 2. Confirmar exclusao (se dialog aparecer). |
| **Saida esperada** | Documento removido da lista. NOTA: Se a exclusao falhar, registrar como bug (OBS-15 Arnaldo — exclusao pode nao responder). |
| **Tipo** | Positivo |

---

## [UC-F04] Certidoes Automaticas e Manuais

### CT-F04-01 — Busca automatica de certidoes e upload manual
| Campo | Valor |
|---|---|
| **ID** | CT-F04-01 |
| **Descricao** | Disparar busca automatica de certidoes e fazer upload manual complementar |
| **Pre-condicoes** | UC-F01 concluido (CNPJ 43.712.232/0001-85 cadastrado); conexao internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Navegar para Certidoes. 2. CNPJ: `43.712.232/0001-85`. 3. Frequencia: `Semanal`. 4. Clicar Buscar Certidoes. 5. Aguardar resposta (ate 30s). 6. Clicar Adicionar Certidao. 7. Arquivo: test_document.pdf. 8. Validade: `2026-06-30`. 9. Numero: `CND-2025-12345`. 10. Salvar. 11. Editar certidao: Status `Valida`, Orgao Emissor `Receita Federal do Brasil`. 12. Salvar. |
| **Saida esperada** | Busca automatica retorna resultado (pode ser vazio se CNPJ ficticio). Certidao manual com numero CND-2025-12345, status Valida, orgao Receita Federal do Brasil visivel na lista. Toast de sucesso. |
| **Tipo** | Positivo |

### CT-F04-02 — Busca sem fontes de certidao cadastradas
| Campo | Valor |
|---|---|
| **ID** | CT-F04-02 |
| **Descricao** | Tentar buscar certidoes sem fontes de certidao inicializadas |
| **Pre-condicoes** | Fontes de certidao NAO inicializadas no sistema |
| **Acoes do ator e dados de entrada** | 1. Navegar para Certidoes. 2. Clicar Buscar Certidoes. |
| **Saida esperada** | Mensagem de erro: "Nenhuma fonte de certidao cadastrada. Acesse Cadastros > Empresa > Fontes de Certidoes para configurar." NOTA: O tutorial deve incluir passo de inicializacao de fontes antes de UC-F04 (OBS-17 Arnaldo). |
| **Tipo** | Negativo |

### CT-F04-03 — Upload manual sem preencher numero da certidao
| Campo | Valor |
|---|---|
| **ID** | CT-F04-03 |
| **Descricao** | Tentar fazer upload manual de certidao sem preencher numero |
| **Pre-condicoes** | Secao de Certidoes aberta |
| **Acoes do ator e dados de entrada** | 1. Clicar Adicionar Certidao. 2. Arquivo: test_document.pdf. 3. Validade: `2026-06-30`. 4. Numero: (vazio). 5. Clicar Salvar. |
| **Saida esperada** | Se numero e obrigatorio: mensagem de erro. Se opcional: certidao salva sem numero. Verificar comportamento real. |
| **Tipo** | Limite |

---

## [UC-F05] Cadastro de Responsaveis

### CT-F05-01 — Cadastrar 3 responsaveis com tipos distintos
| Campo | Valor |
|---|---|
| **ID** | CT-F05-01 |
| **Descricao** | Cadastrar Representante Legal, Preposto e Responsavel Tecnico |
| **Pre-condicoes** | UC-F01 concluido; secao Responsaveis acessivel |
| **Acoes do ator e dados de entrada** | 1. Adicionar Responsavel: Tipo `Representante Legal`, Nome `Marcos Antonio Ferreira`, Cargo `Diretor Executivo`, Email `diego.munoz@chhospitalar.com.br`, Telefone `(11) 98765-4321`. Salvar. 2. Adicionar Responsavel: Tipo `Preposto`, Nome `Carla Regina Souza`, Cargo `Gerente de Licitacoes`, Email `carla.souza@chhospitalar.com.br`, Telefone `(11) 3456-7891`. Salvar. 3. Adicionar Responsavel: Tipo `Responsavel Tecnico`, Nome `Dr. Paulo Roberto Menezes`, Cargo `Engenheiro Biomedico`, Email `paulo.menezes@chhospitalar.com.br`, Telefone `(11) 3456-7892`. Salvar. |
| **Saida esperada** | 3 responsaveis listados com nome, cargo e tipo corretos. Toast de sucesso apos cada salvamento. |
| **Tipo** | Positivo |

### CT-F05-02 — Cadastrar responsavel sem nome
| Campo | Valor |
|---|---|
| **ID** | CT-F05-02 |
| **Descricao** | Tentar salvar responsavel sem preencher o campo Nome |
| **Pre-condicoes** | Modal de adicionar responsavel aberto |
| **Acoes do ator e dados de entrada** | 1. Tipo: `Representante Legal`. 2. Nome: (vazio). 3. Cargo: `Diretor`. 4. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro indicando que Nome e obrigatorio. Sistema NAO salva. |
| **Tipo** | Negativo |

### CT-F05-03 — Editar responsavel existente
| Campo | Valor |
|---|---|
| **ID** | CT-F05-03 |
| **Descricao** | Editar dados de um responsavel ja cadastrado |
| **Pre-condicoes** | CT-F05-01 executado; pelo menos 1 responsavel na lista |
| **Acoes do ator e dados de entrada** | 1. Clicar no icone de edicao (Edit2) do Marcos Antonio Ferreira. 2. Alterar Cargo de `Diretor Executivo` para `CEO`. 3. Clicar Salvar. |
| **Saida esperada** | Cargo atualizado para `CEO` na lista. Toast de sucesso. |
| **Tipo** | Positivo |

---

## [UC-F06] Listar e Filtrar Produtos do Portfolio

### CT-F06-01 — Filtrar por Area, Classe e Subclasse
| Campo | Valor |
|---|---|
| **ID** | CT-F06-01 |
| **Descricao** | Usar filtros hierarquicos para refinar a lista de produtos |
| **Pre-condicoes** | UC-F07 concluido (produto Monitor Multiparametrico BedStar-700 cadastrado) |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Filtrar Area: `Equipamentos Medico-Hospitalares`. 3. Filtrar Classe: `Equipamentos de Diagnostico por Imagem`. 4. Filtrar Subclasse: `Ultrassonografo`. 5. Verificar lista filtrada. |
| **Saida esperada** | Lista exibe apenas produtos da area/classe/subclasse selecionada. Pelo menos 1 produto visivel (se existir produto nessa categoria). |
| **Tipo** | Positivo |

### CT-F06-02 — Busca por texto "ultrassom"
| Campo | Valor |
|---|---|
| **ID** | CT-F06-02 |
| **Descricao** | Buscar produtos por texto livre digitando "ultrassom" |
| **Pre-condicoes** | PortfolioPage aberta com produtos cadastrados |
| **Acoes do ator e dados de entrada** | 1. Digitar `ultrassom` no campo de busca. 2. Observar resultado. |
| **Saida esperada** | Lista filtra para exibir produtos contendo "ultrassom" no nome, fabricante ou modelo. NOTA: O filtro busca APENAS em nome, fabricante e modelo (OBS-21/22 Arnaldo). Se o produto nao contem "ultrassom" nesses campos, a busca retorna vazio — comportamento correto do filtro, mas limitacao a ser observada. |
| **Tipo** | Positivo |

### CT-F06-03 — Busca por texto "monitor"
| Campo | Valor |
|---|---|
| **ID** | CT-F06-03 |
| **Descricao** | Buscar produtos por texto livre digitando "monitor" |
| **Pre-condicoes** | PortfolioPage aberta; produto "Monitor Multiparametrico BedStar-700" cadastrado |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca. 2. Digitar `monitor`. 3. Observar resultado. |
| **Saida esperada** | Produto "Monitor Multiparametrico BedStar-700" aparece na lista filtrada (nome contem "monitor"). |
| **Tipo** | Positivo |

### CT-F06-04 — Busca por termo inexistente
| Campo | Valor |
|---|---|
| **ID** | CT-F06-04 |
| **Descricao** | Buscar por termo que nenhum produto contem |
| **Pre-condicoes** | PortfolioPage aberta |
| **Acoes do ator e dados de entrada** | 1. Digitar `xyztermoqueNaoExiste` no campo de busca. |
| **Saida esperada** | Lista vazia ou mensagem "nenhum produto encontrado". Sem erro de sistema. |
| **Tipo** | Negativo |

---

## [UC-F07] Cadastro de Produto por IA

### CT-F07-01 — Cadastrar produto via Website do fabricante (Opcao A)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-01 |
| **Descricao** | Cadastrar produto usando URL do fabricante com processamento IA |
| **Pre-condicoes** | Usuario autenticado; conexao internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Clicar Adicionar Produto. 3. Tipo de Documento: `Website`. 4. URL: `https://www.mindray.com/en/products/ultrasound/general-imaging.html`. 5. Area: `Equipamentos Medico-Hospitalares`. 6. Classe: `Equipamentos de Diagnostico por Imagem`. 7. Subclasse: `Ultrassonografo`. 8. Clicar Processar/Analisar com IA. 9. Aguardar ate 60s. 10. Clicar Salvar. |
| **Saida esperada** | IA preenche campos automaticamente (nome, fabricante, descricao). Toast de sucesso apos salvar. Produto aparece no portfolio. |
| **Tipo** | Positivo |

### CT-F07-02 — Cadastrar produto via Manual Tecnico PDF (Opcao B)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-02 |
| **Descricao** | Cadastrar produto usando upload de PDF com processamento IA |
| **Pre-condicoes** | Usuario autenticado; arquivo tests/fixtures/test_document.pdf disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar Adicionar Produto. 2. Tipo de Documento: `Manual Tecnico`. 3. Upload: tests/fixtures/test_document.pdf. 4. Nome do Produto: `Monitor Multiparametrico BedStar-700`. 5. Area: `Equipamentos Medico-Hospitalares`. 6. Classe: `Monitoracao`. 7. Subclasse: `Monitor Multiparametrico`. 8. Clicar Processar. 9. Aguardar ate 60s. 10. Clicar Salvar. |
| **Saida esperada** | Produto criado com nome `Monitor Multiparametrico BedStar-700`. IA complementa campos. Toast de sucesso. |
| **Tipo** | Positivo |

### CT-F07-03 — Tentar processar sem preencher URL nem arquivo
| Campo | Valor |
|---|---|
| **ID** | CT-F07-03 |
| **Descricao** | Tentar acionar processamento IA sem fornecer dados de entrada |
| **Pre-condicoes** | Modal de cadastro de produto aberto |
| **Acoes do ator e dados de entrada** | 1. Selecionar Tipo de Documento: `Website`. 2. Deixar URL vazio. 3. Clicar Processar. |
| **Saida esperada** | Mensagem de erro indicando que URL e obrigatoria para o tipo Website. Sistema NAO inicia processamento. |
| **Tipo** | Negativo |

---

## [UC-F08] Editar Produto Existente

### CT-F08-01 — Edicao completa de produto com especificacoes tecnicas
| Campo | Valor |
|---|---|
| **ID** | CT-F08-01 |
| **Descricao** | Editar nome, fabricante, modelo, SKU, NCM, descricao e classificacao do produto |
| **Pre-condicoes** | UC-F07 concluido; produto "Monitor Multiparametrico BedStar-700" no portfolio |
| **Acoes do ator e dados de entrada** | 1. Buscar produto na lista. 2. Clicar Editar. 3. Nome: `Monitor Multiparametrico BedStar-700 Plus`. 4. Fabricante: `BedStar Medical International`. 5. Modelo: `BedStar-700 Plus`. 6. SKU: `BST700-PLUS-BR`. 7. NCM: `9018.19.90`. 8. Descricao: `Monitor multiparametrico para UTI e pronto-socorro, 7 parametros simultaneos`. 9. Area: `Equipamentos Medico-Hospitalares`. 10. Classe: `Monitoracao`. 11. Subclasse: `Monitor Multiparametrico`. 12. Especificacoes: N parametros=7, Display=10,4 polegadas, SpO2=Sim, ECG=Sim (6 derivacoes), NIBP=Sim, Bateria=4 horas, Peso=3,2 kg, Alimentacao=100-240 V, Registro ANVISA=80262090001. 13. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. Produto na lista exibe nome "Monitor Multiparametrico BedStar-700 Plus", fabricante "BedStar Medical International", SKU "BST700-PLUS-BR". |
| **Tipo** | Positivo |

### CT-F08-02 — NCM com formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F08-02 |
| **Descricao** | Tentar salvar produto com NCM em formato invalido |
| **Pre-condicoes** | Modal de edicao do produto aberto |
| **Acoes do ator e dados de entrada** | 1. Preencher NCM: `9018` (incompleto, sem os pontos e digitos). 2. Clicar Salvar. |
| **Saida esperada** | Validacao RN-035 rejeita formato NCM invalido. Mensagem de erro. Sistema NAO salva. |
| **Tipo** | Negativo |

---

## [UC-F09] Reprocessar Metadados por IA

### CT-F09-01 — Reprocessamento de produto existente com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F09-01 |
| **Descricao** | Acionar reprocessamento IA de produto ja cadastrado e editado |
| **Pre-condicoes** | UC-F08 concluido; produto "Monitor Multiparametrico BedStar-700 Plus" salvo |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Buscar "Monitor Multiparametrico BedStar-700 Plus". 3. Clicar botao Reprocessar IA na linha do produto. 4. Confirmar dialog (se aparecer). 5. Aguardar ate 60s. |
| **Saida esperada** | Toast de conclusao (reprocessado/sucesso/concluido). Produto mantem dados inseridos manualmente (nome, fabricante, especificacoes NAO foram apagados). IA pode ter complementado campos vazios. |
| **Tipo** | Positivo |

### CT-F09-02 — Reprocessamento sem conexao internet
| Campo | Valor |
|---|---|
| **ID** | CT-F09-02 |
| **Descricao** | Tentar reprocessar IA sem conexao com internet |
| **Pre-condicoes** | Produto cadastrado; internet desconectada |
| **Acoes do ator e dados de entrada** | 1. Clicar Reprocessar IA. 2. Aguardar resposta. |
| **Saida esperada** | Mensagem de erro de conexao ou timeout apos tempo razoavel. Sistema NAO apaga dados existentes do produto. |
| **Tipo** | Negativo |

---

## [UC-F10] ANVISA e Busca Web de Produto

### CT-F10-01 — Busca ANVISA pelo numero de registro
| Campo | Valor |
|---|---|
| **ID** | CT-F10-01 |
| **Descricao** | Buscar produto na base ANVISA usando numero de registro |
| **Pre-condicoes** | UC-F08 concluido; Registro ANVISA `80262090001` preenchido; internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Abrir detalhe do produto "Monitor Multiparametrico BedStar-700 Plus". 2. Numero ANVISA: `80262090001`. 3. Nome ANVISA: `Monitor Multiparametrico BedStar`. 4. Clicar Buscar ANVISA. 5. Aguardar ate 30s. |
| **Saida esperada** | Card com dados ANVISA visivel (ou mensagem informando que nao encontrou — registro pode ser ficticio). Numero 80262090001 exibido no resultado. |
| **Tipo** | Positivo |

### CT-F10-02 — Busca Web por produto similar
| Campo | Valor |
|---|---|
| **ID** | CT-F10-02 |
| **Descricao** | Buscar informacoes na web sobre produto similar |
| **Pre-condicoes** | Detalhe do produto aberto; internet disponivel |
| **Acoes do ator e dados de entrada** | 1. Nome para Busca Web: `Ultrassonografo Portatil Mindray M7`. 2. Fabricante: `Mindray`. 3. Clicar Buscar na Web. 4. Aguardar ate 30s. |
| **Saida esperada** | Card com resultados web visivel. Resultados contem referencia a Mindray ou M7. |
| **Tipo** | Positivo |

---

## [UC-F11] Verificar Completude do Produto

### CT-F11-01 — Score de completude em verde (>= 80%)
| Campo | Valor |
|---|---|
| **ID** | CT-F11-01 |
| **Descricao** | Verificar que o produto com especificacoes completas tem score alto |
| **Pre-condicoes** | UC-F08 concluido; produto com especificacoes tecnicas preenchidas |
| **Acoes do ator e dados de entrada** | 1. Navegar para Portfolio. 2. Buscar "Monitor Multiparametrico BedStar-700 Plus". 3. Clicar Completude. 4. Observar scores. |
| **Saida esperada** | Score Geral >= 80% com badge VERDE. Score Basicos >= 90%. Score Specs >= 75%. |
| **Tipo** | Positivo |

### CT-F11-02 — Produto incompleto tem score baixo
| Campo | Valor |
|---|---|
| **ID** | CT-F11-02 |
| **Descricao** | Verificar que um produto com poucos dados tem score abaixo de 80% |
| **Pre-condicoes** | Produto com poucos campos preenchidos (ex: apenas nome e area) |
| **Acoes do ator e dados de entrada** | 1. Abrir completude de um produto com dados minimos. 2. Observar score. |
| **Saida esperada** | Score Geral < 80% com badge AMARELO ou VERMELHO. |
| **Tipo** | Limite |

---

## [UC-F12] Metadados e Captacao do Produto

### CT-F12-01 — Inserir CATMAT e termos de busca
| Campo | Valor |
|---|---|
| **ID** | CT-F12-01 |
| **Descricao** | Adicionar codigos CATMAT e termos de captacao ao produto |
| **Pre-condicoes** | UC-F08 concluido; produto "Monitor Multiparametrico BedStar-700 Plus" salvo |
| **Acoes do ator e dados de entrada** | 1. Abrir modal Metadados do produto. 2. CATMAT: `462, 444`. 3. Termo 1: `monitor multiparametrico`, clicar Adicionar Termo. 4. Termo 2: `monitor sinais vitais`, clicar Adicionar Termo. 5. Termo 3: `monitor uti`, clicar Adicionar Termo. 6. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. CATMAT 462 e 444 visiveis. 3 termos de busca listados: "monitor multiparametrico", "monitor sinais vitais", "monitor uti". |
| **Tipo** | Positivo |

### CT-F12-02 — Salvar metadados sem CATMAT
| Campo | Valor |
|---|---|
| **ID** | CT-F12-02 |
| **Descricao** | Verificar se sistema aceita salvar metadados sem codigo CATMAT |
| **Pre-condicoes** | Modal de metadados aberto |
| **Acoes do ator e dados de entrada** | 1. Limpar campo CATMAT. 2. Adicionar 1 termo de busca: `monitor teste`. 3. Clicar Salvar. |
| **Saida esperada** | Se CATMAT e obrigatorio: mensagem de erro. Se opcional: salva com sucesso. Verificar comportamento. |
| **Tipo** | Limite |

---

## [UC-F13] Classificacao Hierarquica de Produtos

### CT-F13-01 — Navegar e salvar hierarquia Area/Classe/Subclasse
| Campo | Valor |
|---|---|
| **ID** | CT-F13-01 |
| **Descricao** | Selecionar hierarquia completa e associar NCM |
| **Pre-condicoes** | Pagina Parametrizacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Navegar para Parametrizacao. 2. Clicar Classificacao Hierarquica. 3. Area: `Equipamentos Medico-Hospitalares`. 4. Classe: `Monitoracao`. 5. Subclasse: `Monitor Multiparametrico`. 6. NCM: `9018.19.90`. 7. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. Hierarquia salva: Equipamentos Medico-Hospitalares > Monitoracao > Monitor Multiparametrico. NCM 9018.19.90 associado. |
| **Tipo** | Positivo |

### CT-F13-02 — Selecao em cascata (Classe depende de Area)
| Campo | Valor |
|---|---|
| **ID** | CT-F13-02 |
| **Descricao** | Verificar que dropdown de Classe popula apos selecionar Area |
| **Pre-condicoes** | Secao Classificacao Hierarquica aberta |
| **Acoes do ator e dados de entrada** | 1. Selecionar Area: `Equipamentos Medico-Hospitalares`. 2. Observar dropdown Classe. 3. Selecionar Classe: `Monitoracao`. 4. Observar dropdown Subclasse. |
| **Saida esperada** | Dropdown Classe popula com classes da area selecionada. Dropdown Subclasse popula com subclasses da classe selecionada. Selecao em cascata funcional. |
| **Tipo** | Positivo |

---

## [UC-F14] Configurar Pesos e Limiares do Score

### CT-F14-01 — Pesos com soma correta (1.00) salvos com sucesso
| Campo | Valor |
|---|---|
| **ID** | CT-F14-01 |
| **Descricao** | Configurar pesos que somam exatamente 1.00 e limiares GO/NO-GO |
| **Pre-condicoes** | Pagina Parametrizacao acessivel, secao Pesos e Limiares |
| **Acoes do ator e dados de entrada** | 1. Peso Tecnico: `0.25`. 2. Peso Documental: `0.20`. 3. Peso Complexidade: `0.10`. 4. Peso Juridico: `0.15`. 5. Peso Logistico: `0.15`. 6. Peso Comercial: `0.15`. 7. Verificar soma exibida = 1.00. 8. Score Final GO: `0.70`. 9. Score Final NO-GO: `0.40`. 10. Tecnico GO: `0.65`. 11. Tecnico NO-GO: `0.35`. 12. Juridico GO: `0.80`. 13. Juridico NO-GO: `0.50`. 14. Clicar Salvar. |
| **Saida esperada** | Soma pesos = 1.00. Toast de sucesso. Todos os valores persistem: Peso Tecnico 0.25, Score Final GO 0.70, Juridico GO 0.80. |
| **Tipo** | Positivo |

### CT-F14-02 — Pesos com soma invalida (> 1.00) sao rejeitados
| Campo | Valor |
|---|---|
| **ID** | CT-F14-02 |
| **Descricao** | Tentar salvar pesos cuja soma excede 1.00 |
| **Pre-condicoes** | Secao Pesos e Limiares aberta |
| **Acoes do ator e dados de entrada** | 1. Peso Tecnico: `0.30`. 2. Peso Documental: `0.25`. 3. Peso Complexidade: `0.15`. 4. Peso Juridico: `0.15`. 5. Peso Logistico: `0.15`. 6. Peso Comercial: `0.15`. 7. Soma = 1.15. 8. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro indicando soma dos pesos != 1.00. Sistema NAO salva. Botao Salvar pode estar desabilitado. |
| **Tipo** | Negativo |

### CT-F14-03 — Peso com valor negativo
| Campo | Valor |
|---|---|
| **ID** | CT-F14-03 |
| **Descricao** | Tentar inserir peso com valor negativo |
| **Pre-condicoes** | Secao Pesos aberta |
| **Acoes do ator e dados de entrada** | 1. Peso Tecnico: `-0.10`. 2. Clicar Salvar. |
| **Saida esperada** | Mensagem de erro indicando que pesos nao podem ser negativos. Sistema NAO salva. |
| **Tipo** | Negativo |

---

## [UC-F15] Parametros Comerciais

### CT-F15-01 — Configurar estados selecionados (sem "Todo o Brasil")
| Campo | Valor |
|---|---|
| **ID** | CT-F15-01 |
| **Descricao** | Marcar 10 estados especificos, preencher TAM/SAM/SOM e modalidades |
| **Pre-condicoes** | Pagina Parametrizacao, secao Parametros Comerciais |
| **Acoes do ator e dados de entrada** | 1. Marcar estados: SP, RJ, MG, RS, PR, SC, DF, GO, BA, PE. 2. Confirmar "Todo o Brasil" DESMARCADO. 3. Prazo: `30` dias. 4. Frequencia: `Mensal`. 5. TAM: `12500000000`. 6. SAM: `2800000000`. 7. SOM: `180000000`. 8. Markup: `28`%. 9. Custos Fixos: `85000`. 10. Frete: `350`. 11. Modalidades: Pregao Eletronico, Concorrencia, Tomada de Precos, Dispensa. 12. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. 10 estados marcados. "Todo o Brasil" desmarcado. Todos os valores persistem. 4 modalidades ativas. |
| **Tipo** | Positivo |

### CT-F15-02 — Sem nenhum estado selecionado
| Campo | Valor |
|---|---|
| **ID** | CT-F15-02 |
| **Descricao** | Tentar salvar sem selecionar nenhum estado |
| **Pre-condicoes** | Todos os checkboxes de estados desmarcados |
| **Acoes do ator e dados de entrada** | 1. Desmarcar todos os estados. 2. Desmarcar "Todo o Brasil". 3. Clicar Salvar. |
| **Saida esperada** | Sistema alerta que pelo menos um estado ou "Todo o Brasil" deve ser selecionado, OU aceita e salva (verificar comportamento). |
| **Tipo** | Limite |

---

## [UC-F16] Fontes de Busca e Palavras-chave

### CT-F16-01 — Desativar/reativar fonte e salvar keywords e NCMs
| Campo | Valor |
|---|---|
| **ID** | CT-F16-01 |
| **Descricao** | Desativar BLL, reativar, salvar 10 keywords e 5 NCMs |
| **Pre-condicoes** | Pagina Parametrizacao, secao Fontes de Busca |
| **Acoes do ator e dados de entrada** | 1. Desativar toggle BLL. 2. Verificar toggle inativo. 3. Reativar toggle BLL. 4. Verificar toggle ativo. 5. Palavras-chave: `monitor multiparametrico, ultrassonografo, equipamento hospitalar, material hospitalar, ventilador pulmonar, oximetro, desfibrilador, bisturi eletrico, autoclave, mesa cirurgica`. 6. NCMs: `9018.19.90, 9018.90.99, 9021.90.90, 9018.11.00, 9402.90.00`. 7. Clicar Salvar. |
| **Saida esperada** | Toast de sucesso. BLL ativo. 10 palavras-chave salvas. 5 NCMs salvos com formato xxxx.xx.xx. |
| **Tipo** | Positivo |

### CT-F16-02 — NCM com formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F16-02 |
| **Descricao** | Tentar salvar NCM em formato incorreto |
| **Pre-condicoes** | Secao Fontes de Busca aberta |
| **Acoes do ator e dados de entrada** | 1. NCMs: `90181990` (sem pontos). 2. Clicar Salvar. |
| **Saida esperada** | Validacao RN-035 rejeita formato NCM invalido ou sistema aceita normalizando. Verificar comportamento. |
| **Tipo** | Negativo |

---

## [UC-F17] Notificacoes e Preferencias do Sistema

### CT-F17-01 — Configurar canais, frequencia, tema, idioma e fuso
| Campo | Valor |
|---|---|
| **ID** | CT-F17-01 |
| **Descricao** | Configurar notificacoes com Email e Sistema ativos, SMS inativo; preferencias completas |
| **Pre-condicoes** | UC-F02 concluido (email licitacoes@chhospitalar.com.br cadastrado) |
| **Acoes do ator e dados de entrada** | 1. Email de notificacao: `licitacoes@chhospitalar.com.br`. 2. Ativar canal Email. 3. Ativar canal Sistema. 4. Desmarcar canal SMS. 5. Frequencia: `Diario`. 6. Tema: `Escuro`. 7. Idioma: `pt-BR`. 8. Fuso Horario: `America/Sao_Paulo`. 9. Clicar Salvar Preferencias. |
| **Saida esperada** | Toast de sucesso. Email e Sistema marcados. SMS desmarcado. Tema Escuro aplicado visualmente. Idioma pt-BR e Fuso America/Sao_Paulo salvos. |
| **Tipo** | Positivo |

### CT-F17-02 — Salvar sem email de notificacao
| Campo | Valor |
|---|---|
| **ID** | CT-F17-02 |
| **Descricao** | Tentar salvar preferencias com canal Email ativo mas sem email preenchido |
| **Pre-condicoes** | Secao Preferencias aberta |
| **Acoes do ator e dados de entrada** | 1. Limpar campo Email de notificacao. 2. Ativar canal Email. 3. Clicar Salvar. |
| **Saida esperada** | Sistema alerta que email e necessario se canal Email esta ativo, OU aceita e salva (verificar comportamento). |
| **Tipo** | Limite |

### CT-F17-03 — Tema claro apos tema escuro
| Campo | Valor |
|---|---|
| **ID** | CT-F17-03 |
| **Descricao** | Trocar tema de Escuro para Claro e verificar mudanca visual |
| **Pre-condicoes** | CT-F17-01 executado (tema Escuro ativo) |
| **Acoes do ator e dados de entrada** | 1. Selecionar Tema: `Claro`. 2. Clicar Salvar. |
| **Saida esperada** | Tema visual muda para Claro. Preferencia persiste apos reload. |
| **Tipo** | Positivo |

---

## Resumo de Cobertura

| UC | Positivo | Negativo | Limite | Total |
|---|---|---|---|---|
| UC-F01 | 2 | 2 | 1 | 5 |
| UC-F02 | 1 | 1 | 1 | 3 |
| UC-F03 | 2 | 1 | 0 | 3 |
| UC-F04 | 1 | 1 | 1 | 3 |
| UC-F05 | 2 | 1 | 0 | 3 |
| UC-F06 | 2 | 1 | 0 | 3 (*) |
| UC-F07 | 2 | 1 | 0 | 3 |
| UC-F08 | 1 | 1 | 0 | 2 |
| UC-F09 | 1 | 1 | 0 | 2 |
| UC-F10 | 2 | 0 | 0 | 2 |
| UC-F11 | 1 | 0 | 1 | 2 |
| UC-F12 | 1 | 0 | 1 | 2 |
| UC-F13 | 2 | 0 | 0 | 2 |
| UC-F14 | 1 | 2 | 0 | 3 |
| UC-F15 | 1 | 0 | 1 | 2 |
| UC-F16 | 1 | 1 | 0 | 2 |
| UC-F17 | 2 | 0 | 1 | 3 |
| **TOTAL** | **25** | **12** | **7** | **44** |

(*) CT-F06-02 e CT-F06-03 dependem dos termos de busca do tutorial. O filtro busca APENAS em nome/fabricante/modelo (limitacao documentada em OBS-21/22 do relatorio Arnaldo).

---

## Notas Importantes

1. **Filtro UC-F06:** O filtro de texto no PortfolioPage busca APENAS em `nome`, `fabricante` e `modelo`. NAO busca em descricao, area, classe ou subclasse. Se o produto "Monitor Multiparametrico BedStar-700" nao contiver "ultrassom" nesses campos, a busca por "ultrassom" retornara vazio. Isso e uma limitacao do filtro, nao um bug do caso de teste.

2. **Fontes de certidao (UC-F04):** O sistema requer que fontes de certidao sejam inicializadas (endpoint `/api/fontes-certidoes/inicializar`) ANTES de buscar certidoes. Se fontes nao existirem, o CT-F04-02 documenta o erro esperado.

3. **Validadores RN em modo warn-only:** Por padrao, ENFORCE_RN_VALIDATORS=false. Isso significa que validacoes como CNPJ (RN-028), CPF (RN-029), NCM (RN-035) e email (RN-042) emitem WARNING mas NAO bloqueiam. Os testes negativos podem passar se o modo warn-only estiver ativo — nesse caso, o teste documenta que o validador emitiu warning mas nao impediu o salvamento.

4. **Ordem de execucao:** Seguir a ordem recomendada do tutorial: UC-F01 > F02 > F03 > F04 > F05 > F14 > F15 > F16 > F17 > F07 > F08 > F13 > F06 > F09 > F10 > F11 > F12.
